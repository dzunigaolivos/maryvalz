import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { getCharacter } from '@/lib/conversations';

/**
 * GET /api/chat/character?id=xxx
 * Obtiene un character por su ID
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Se requiere el id del character' },
        { status: 400 }
      );
    }

    const result = await getCharacter(id);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error en GET /api/chat/character:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: 'Error al obtener el character', details: errorMessage },
      { status: 500 }
    );
  }
}
