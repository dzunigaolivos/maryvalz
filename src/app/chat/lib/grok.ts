// Tipos para la API de Grok (formato OpenAI compatible)

export type ChatRole = 'system' | 'user' | 'assistant';

export interface ChatMessage {
  role: ChatRole;
  content: string;
}

export interface ChatCompletionRequest {
  model: string;
  messages: ChatMessage[];
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
}

export interface ChatCompletionChoice {
  index: number;
  message: ChatMessage;
  finish_reason: string;
}

export interface ChatCompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: ChatCompletionChoice[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

// Configuración de la API
const GROK_API_URL = 'https://api.x.ai/v1/chat/completions';
const GROK_MODEL = 'grok-4-1-fast-non-reasoning';

// System prompt por defecto (se puede cambiar según el personaje)
const DEFAULT_SYSTEM_PROMPT = `Eres un asistente amigable que responde en español.
Mantén tus respuestas concisas y útiles.`;

/**
 * Construye el array de mensajes para enviar a la API
 * Incluye el system prompt y el historial de conversación
 */
export function buildMessages(
  conversationHistory: { text: string; type: 'sent' | 'received' }[],
  systemPrompt: string = DEFAULT_SYSTEM_PROMPT
): ChatMessage[] {
  const messages: ChatMessage[] = [
    {
      role: 'system',
      content: systemPrompt,
    },
  ];

  // Agregar historial de conversación
  for (const msg of conversationHistory) {
    messages.push({
      role: msg.type === 'sent' ? 'user' : 'assistant',
      content: msg.text,
    });
  }

  return messages;
}

/**
 * Construye el body completo para la request a la API
 */
export function buildRequestBody(
  messages: ChatMessage[],
  options?: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
  }
): ChatCompletionRequest {
  return {
    model: options?.model ?? GROK_MODEL,
    messages,
    temperature: options?.temperature ?? 0.7,
    max_tokens: options?.maxTokens ?? 1024,
    stream: false,
  };
}

/**
 * Envía un mensaje a la API de Grok y retorna la respuesta
 * Por ahora solo hace console.log para pruebas
 */
export async function sendMessageToGrok(
  conversationHistory: { text: string; type: 'sent' | 'received' }[],
  apiKey: string,
  systemPrompt?: string
): Promise<string> {
  const messages = buildMessages(conversationHistory, systemPrompt);
  const requestBody = buildRequestBody(messages);

  // ========== DEBUG: Mostrar en consola ==========
  console.log('='.repeat(50));
  console.log('📤 REQUEST TO GROK API');
  console.log('='.repeat(50));
  console.log('URL:', GROK_API_URL);
  console.log('Model:', requestBody.model);
  console.log('\n📋 MESSAGES ARRAY:');
  console.log(JSON.stringify(requestBody.messages, null, 2));
  console.log('\n📦 FULL REQUEST BODY:');
  console.log(JSON.stringify(requestBody, null, 2));
  console.log('='.repeat(50));
  // ===============================================

  // TODO: Descomentar cuando tengas la API key configurada
  // Por ahora retorna un mensaje de prueba

  if (!apiKey || apiKey === 'YOUR_API_KEY') {
    console.log('⚠️ API Key no configurada - retornando respuesta simulada');
    return '¡Hola! Soy una respuesta simulada. Configura tu API key para conectar con Grok.';
  }

  try {
    const response = await fetch(GROK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error de API:', response.status, errorText);
      throw new Error(`Error de API: ${response.status}`);
    }

    const data: ChatCompletionResponse = await response.json();

    console.log('\n📥 RESPONSE FROM GROK:');
    console.log(JSON.stringify(data, null, 2));

    return data.choices[0]?.message?.content ?? 'Sin respuesta';
  } catch (error) {
    console.error('❌ Error al llamar a Grok:', error);
    throw error;
  }
}

/**
 * Helper para crear un system prompt personalizado por personaje
 */
export function createCharacterSystemPrompt(characterName: string, characterDescription: string): string {
  return `Eres ${characterName}. ${characterDescription}

Responde siempre en español y mantente en personaje.
No rompas el personaje bajo ninguna circunstancia.`;
}
