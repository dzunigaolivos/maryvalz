import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { getMessages, saveMessage, getOrCreateConversationWithMessages } from '@/lib/conversations';

interface SaveMessageRequest {
  conversation_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface GetConversationWithMessagesRequest {
  device_id: string;
  character_id: string;
}

/**
 * GET /api/chat/messages?conversation_id=xxx
 * Obtiene todos los mensajes de una conversación
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const conversation_id = searchParams.get('conversation_id');

    if (!conversation_id) {
      return NextResponse.json(
        { error: 'Se requiere el conversation_id' },
        { status: 400 }
      );
    }

    const result = await getMessages(conversation_id);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error en GET /api/chat/messages:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: 'Error al obtener los mensajes', details: errorMessage },
      { status: 500 }
    );
  }
}

/**
 * POST /api/chat/messages
 * Guarda un mensaje o obtiene/crea conversación con mensajes
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    // Obtener o crear conversación con sus mensajes
    if (action === 'get_or_create_conversation') {
      const { device_id, character_id } = body as GetConversationWithMessagesRequest;

      if (!device_id) {
        return NextResponse.json(
          { error: 'Se requiere el device_id' },
          { status: 400 }
        );
      }

      if (!character_id) {
        return NextResponse.json(
          { error: 'Se requiere el character_id' },
          { status: 400 }
        );
      }

      const result = await getOrCreateConversationWithMessages(device_id, character_id);
      return NextResponse.json(result);
    }

    // Guardar mensaje (acción por defecto)
    const { conversation_id, role, content } = body as SaveMessageRequest;

    if (!conversation_id) {
      return NextResponse.json(
        { error: 'Se requiere el conversation_id' },
        { status: 400 }
      );
    }

    if (!role || !['user', 'assistant', 'system'].includes(role)) {
      return NextResponse.json(
        { error: 'Se requiere un role válido (user, assistant, system)' },
        { status: 400 }
      );
    }

    if (!content) {
      return NextResponse.json(
        { error: 'Se requiere el content' },
        { status: 400 }
      );
    }

    const result = await saveMessage(conversation_id, role, content);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error en POST /api/chat/messages:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: 'Error al procesar la solicitud', details: errorMessage },
      { status: 500 }
    );
  }
}
