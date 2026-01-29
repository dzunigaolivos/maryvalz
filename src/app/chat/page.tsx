'use client';

import { useState, useRef, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Sender from './components/sender';
import Responser from './components/responser';
import { getDeviceCredentials } from '@/lib/device';

interface Message {
  id: string;
  text: string;
  type: 'sent' | 'received';
}

interface Character {
  id: string;
  name: string;
  system_prompt: string;
  is_active: boolean;
}

interface DBMessage {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  created_at: string;
}


function ChatPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const charId = searchParams.get('charId');
  const characterParam = searchParams.get('character'); // 'jacob' o 'helena'

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [character, setCharacter] = useState<Character | null>(null);
  const [systemPrompt, setSystemPrompt] = useState<string>('');
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Mensaje cuando se alcanza el límite
  const RATE_LIMIT_MESSAGE = '¿Te interesa conocerme más? Lee el libro "Sombras del Pasado" para descubrir toda mi historia...';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Cargar character y conversación al iniciar
  useEffect(() => {
    const loadData = async () => {
      // Si no hay charId, redirigir a la página principal
      if (!charId) {
        router.push('/');
        return;
      }

      const { deviceId: storedDeviceId } = getDeviceCredentials();
      if (!storedDeviceId) {
        router.push('/');
        return;
      }
      setDeviceId(storedDeviceId);

      try {
        // Cargar character
        const characterResponse = await fetch(`/api/chat/character?id=${charId}`);
        const characterData = await characterResponse.json();

        if (!characterData.exists || !characterData.character) {
          router.push('/');
          return;
        }

        setCharacter(characterData.character);
        setSystemPrompt(characterData.character.system_prompt);

        // Obtener o crear conversación con mensajes
        const conversationResponse = await fetch('/api/chat/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'get_or_create_conversation',
            device_id: storedDeviceId,
            character_id: charId,
          }),
        });
        const conversationData = await conversationResponse.json();

        if (conversationData.success && conversationData.conversation) {
          setConversationId(conversationData.conversation.id);

          // Cargar mensajes previos si existen
          if (conversationData.messages && conversationData.messages.length > 0) {
            const loadedMessages: Message[] = conversationData.messages
              .filter((msg: DBMessage) => msg.role !== 'system')
              .map((msg: DBMessage) => ({
                id: msg.id,
                text: msg.content,
                type: msg.role === 'user' ? 'sent' : 'received',
              }));
            setMessages(loadedMessages);
          }
        }

        setIsInitializing(false);
      } catch (error) {
        console.error('Error al cargar datos:', error);
        router.push('/');
      }
    };

    loadData();
  }, [charId, router]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const saveMessageToDB = async (role: 'user' | 'assistant', content: string) => {
    if (!conversationId) return null;

    try {
      const response = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversation_id: conversationId,
          role,
          content,
        }),
      });
      const data = await response.json();
      return data.success ? data.message : null;
    } catch (error) {
      console.error('Error al guardar mensaje:', error);
      return null;
    }
  };

  const handleSend = async () => {
    if (inputValue.trim() === '' || isLoading || !conversationId || !deviceId || !charId) return;

    const userText = inputValue.trim();

    // Agregar mensaje del usuario a la UI inmediatamente
    const tempUserMessage: Message = {
      id: `temp-${Date.now()}`,
      text: userText,
      type: 'sent',
    };

    const updatedMessages = [...messages, tempUserMessage];
    setMessages(updatedMessages);
    setInputValue('');
    setIsLoading(true);

    try {
      // Verificar rate limit antes de procesar
      const rateLimitResponse = await fetch('/api/chat/rate-limit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          device_id: deviceId,
          character_id: charId,
        }),
      });
      const rateLimitData = await rateLimitResponse.json();

      // Si se alcanzó el límite, mostrar mensaje promocional y NO guardar nada
      if (!rateLimitData.allowed) {
        const limitMessage: Message = {
          id: `limit-${Date.now()}`,
          text: RATE_LIMIT_MESSAGE,
          type: 'received',
        };
        setMessages((prev) => [...prev, limitMessage]);
        return;
      }

      // Guardar mensaje del usuario en BD
      const savedUserMessage = await saveMessageToDB('user', userText);

      // Actualizar el ID temporal con el real
      if (savedUserMessage) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === tempUserMessage.id ? { ...msg, id: savedUserMessage.id } : msg
          )
        );
      }

      // Preparar historial para la API (sin el id)
      const conversationHistory = updatedMessages.map((msg) => ({
        text: msg.text,
        type: msg.type,
      }));

      // Llamar a la API de Grok via backend
      const grokResponse = await fetch('/api/chat/grok', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationHistory,
          systemPrompt,
        }),
      });
      const grokData = await grokResponse.json();

      if (!grokData.success) {
        throw new Error(grokData.error || 'Error al comunicarse con Grok');
      }

      const response = grokData.message;

      // Guardar respuesta de la IA en BD
      const savedAssistantMessage = await saveMessageToDB('assistant', response);

      // Agregar respuesta de la IA a la UI
      const responseMessage: Message = {
        id: savedAssistantMessage?.id || `temp-${Date.now() + 1}`,
        text: response,
        type: 'received',
      };
      setMessages((prev) => [...prev, responseMessage]);
    } catch (error) {
      console.error('Error al enviar mensaje:', error);
      // Mostrar error como mensaje
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        text: 'Error al conectar con el servidor. Intenta de nuevo.',
        type: 'received',
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSend();
    }
  };

  // Determinar imagen de fondo y ficha según el personaje (disponible inmediatamente desde URL)
  const backgroundImage = characterParam === 'helena' ? '/helena_fondo.png' : '/jacob_fondo.png';
  const characterFicha = characterParam === 'helena' ? '/helena_ficha.png' : '/jacob_ficha.png';
  const characterName = characterParam === 'helena' ? 'Helena' : 'Jacob';

  return (
    <div className="relative min-h-screen flex">
      {/* Background image with blur */}
      <div
        aria-hidden
        className="absolute inset-0 bg-cover bg-center filter blur-sm"
        style={{ backgroundImage: `url('${backgroundImage}')` }}
      />
      {/* Overlay for better readability */}
      <div className="absolute inset-0 bg-black/20" />

      {/* Content container */}
      <div className="relative z-10 flex w-full min-h-screen">
        {/* Left panel - Character image */}
        <div className="hidden md:flex w-1/2 items-end justify-center overflow-hidden">
          <motion.img
            src={characterFicha}
            alt={characterName}
            className="max-w-full max-h-[90vh] object-contain drop-shadow-2xl"
            style={{ viewTransitionName: `character-image-${characterParam}` }}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </div>

        {/* Chat area - 1/2 of screen (full on mobile) */}
        <div className="w-full md:w-1/2 flex items-center justify-center p-2 md:p-4">
          {/* Chat Container */}
          <div className="w-full max-w-2xl h-[95vh] bg-white/95 backdrop-blur-sm rounded-xl shadow-xl flex flex-col overflow-hidden">
            {/* Header */}
            <header className="bg-burgundy text-cream py-3 px-4 shadow-md">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => router.push('/form')}
                  className="flex items-center gap-1 text-cream/80 hover:text-cream transition-colors"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                  <span className="text-sm font-nunito">Volver</span>
                </button>
                <h1
                  className="text-xl font-bold text-center flex-1"
                  style={{ fontFamily: "'Quintessential', cursive" }}
                >
                  {character?.name || characterName}
                </h1>
                {/* Spacer for centering */}
                <div className="w-16" />
              </div>
            </header>

            {/* Chat Messages Area */}
            <main className="flex-1 overflow-y-auto p-4">
              {isInitializing ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-warmGray/60 font-nunito">Cargando conversación...</div>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-warmGray/60 text-center font-nunito">
                    Escribe un mensaje para comenzar la conversación...
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  {messages.map((msg) =>
                    msg.type === 'sent' ? (
                      <Sender key={msg.id} message={msg.text} />
                    ) : (
                      <Responser key={msg.id} message={msg.text} />
                    )
                  )}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </main>

            {/* Input Area */}
            <footer className="bg-ivory/50 border-t border-gold/20 p-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Escribe tu mensaje..."
                  disabled={isInitializing}
                  className="flex-1 px-4 py-2 rounded-full border border-gold/30 bg-white text-warmGray placeholder-warmGray/50 focus:outline-none focus:ring-2 focus:ring-burgundy/50 focus:border-burgundy transition-all font-nunito text-sm disabled:opacity-50"
                />
                <button
                  onClick={handleSend}
                  disabled={inputValue.trim() === '' || isLoading || isInitializing}
                  className="px-4 py-2 bg-burgundy text-cream rounded-full font-semibold shadow-md hover:bg-burgundy/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-nunito text-sm min-w-[80px]"
                >
                  {isLoading ? '...' : 'Enviar'}
                </button>
              </div>
            </footer>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-b from-cream to-ivory flex items-center justify-center p-4 md:p-8">
          <div className="text-warmGray font-nunito">Cargando...</div>
        </div>
      }
    >
      <ChatPageContent />
    </Suspense>
  );
}
