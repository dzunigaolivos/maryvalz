import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { registerDevice, registerConversation, getConversation } from '@/lib/conversations';

interface RegisterDeviceRequest {
  device_id: string;
  token: string;
}

interface RegisterConversationRequest {
  device_id: string;
  character_id: string;
}

/**
 * POST /api/chat
 * Registra un dispositivo para el chat
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action } = body;

    // Si no hay action, asumir que es el registro de dispositivo (retrocompatibilidad)
    if (!action || action === 'register_device') {
      const { device_id, token } = body as RegisterDeviceRequest;

      if (!device_id) {
        return NextResponse.json(
          { error: 'Se requiere el device_id' },
          { status: 400 }
        );
      }

      if (!token) {
        return NextResponse.json(
          { error: 'Se requiere el token' },
          { status: 400 }
        );
      }

      const result = await registerDevice(device_id, token);
      return NextResponse.json(result);
    }

    // Registrar conversación
    if (action === 'register_conversation') {
      const { device_id, character_id } = body as RegisterConversationRequest;

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

      const result = await registerConversation(device_id, character_id);
      return NextResponse.json(result);
    }

    return NextResponse.json(
      { error: 'Acción no válida' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error en API chat:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: 'Error al procesar la solicitud', details: errorMessage },
      { status: 500 }
    );
  }
}

/**
 * GET /api/chat?device_id=xxx&character_id=xxx
 * Obtiene una conversación por device_id y character_id
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const device_id = searchParams.get('device_id');
    const character_id = searchParams.get('character_id');

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

    const result = await getConversation(device_id, character_id);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error en GET /api/chat:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: 'Error al obtener la conversación', details: errorMessage },
      { status: 500 }
    );
  }
}
