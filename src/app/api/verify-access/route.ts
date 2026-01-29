import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import crypto from 'crypto';

interface VerifyRequest {
  device_id: string;
  token: string;
}

function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

/**
 * POST /api/verify-access
 * Verifica si el token es válido y el dispositivo tiene acceso
 */
export async function POST(request: Request) {
  try {
    const body: VerifyRequest = await request.json();
    const { device_id, token } = body;

    if (!device_id || !token) {
      return NextResponse.json({ valid: false, error: 'Faltan credenciales' }, { status: 400 });
    }

    const token_hash = hashToken(token);

    // Buscar en access_grants
    const { data: accessGrant } = await supabase
      .from('access_grants')
      .select('*')
      .eq('device_id', device_id)
      .eq('token_hash', token_hash)
      .eq('revoked', false)
      .gte('expires_at', new Date().toISOString())
      .single();

    if (accessGrant) {
      return NextResponse.json({
        valid: true,
        expires_at: accessGrant.expires_at,
      });
    }

    return NextResponse.json({ valid: false, error: 'Acceso no válido o expirado' });
  } catch (error) {
    console.error('Error verificando acceso:', error);
    return NextResponse.json({ valid: false, error: 'Error al verificar' }, { status: 500 });
  }
}
