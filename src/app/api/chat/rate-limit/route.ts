import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { checkAndUpdateRateLimit, getRateLimitStatus } from '@/lib/conversations';

/**
 * GET /api/chat/rate-limit?device_id=xxx&character_id=xxx
 * Obtiene el estado actual del rate limit sin incrementar
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

    const result = await getRateLimitStatus(device_id, character_id);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error en GET /api/chat/rate-limit:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: 'Error al obtener el rate limit', details: errorMessage },
      { status: 500 }
    );
  }
}

/**
 * POST /api/chat/rate-limit
 * Verifica y actualiza el rate limit (incrementa el contador)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { device_id, character_id } = body;

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

    const result = await checkAndUpdateRateLimit(device_id, character_id);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error en POST /api/chat/rate-limit:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: 'Error al verificar el rate limit', details: errorMessage },
      { status: 500 }
    );
  }
}
