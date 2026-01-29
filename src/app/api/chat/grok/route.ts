import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';

type ChatRole = 'system' | 'user' | 'assistant';

interface ChatMessage {
  role: ChatRole;
  content: string;
}

interface ChatCompletionRequest {
  model: string;
  messages: ChatMessage[];
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
}

interface ChatCompletionChoice {
  index: number;
  message: ChatMessage;
  finish_reason: string;
}

interface ChatCompletionResponse {
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

const GROK_API_URL = 'https://api.x.ai/v1/chat/completions';
const GROK_MODEL = 'grok-4-1-fast-non-reasoning';

const DEFAULT_SYSTEM_PROMPT = `Eres un asistente amigable que responde en español.
Mantén tus respuestas concisas y útiles.`;

function buildMessages(
  conversationHistory: { text: string; type: 'sent' | 'received' }[],
  systemPrompt: string = DEFAULT_SYSTEM_PROMPT
): ChatMessage[] {
  const messages: ChatMessage[] = [
    {
      role: 'system',
      content: systemPrompt,
    },
  ];

  for (const msg of conversationHistory) {
    messages.push({
      role: msg.type === 'sent' ? 'user' : 'assistant',
      content: msg.text,
    });
  }

  return messages;
}

function buildRequestBody(
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { conversationHistory, systemPrompt } = body;

    if (!conversationHistory || !Array.isArray(conversationHistory)) {
      return NextResponse.json(
        { error: 'Se requiere conversationHistory como array' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GROK_API_KEY;

    if (!apiKey) {
      console.error('GROK_API_KEY no está configurada en las variables de entorno');
      return NextResponse.json(
        { error: 'API key no configurada' },
        { status: 500 }
      );
    }

    const messages = buildMessages(conversationHistory, systemPrompt);
    const requestBody = buildRequestBody(messages);

    const response = await fetch(GROK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error de Grok API:', response.status, errorText);
      return NextResponse.json(
        { error: 'Error al comunicarse con Grok', details: errorText },
        { status: response.status }
      );
    }

    const data: ChatCompletionResponse = await response.json();
    const assistantMessage = data.choices[0]?.message?.content ?? 'Sin respuesta';

    return NextResponse.json({
      success: true,
      message: assistantMessage,
      usage: data.usage,
    });
  } catch (error) {
    console.error('Error en POST /api/chat/grok:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: 'Error al procesar la solicitud', details: errorMessage },
      { status: 500 }
    );
  }
}
