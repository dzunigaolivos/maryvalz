import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import questionsData from '@/data/questions.json';

export interface Answer {
  id: number;
  text: string;
}

export interface Question {
  id: number;
  question: string;
  answers: Answer[];
  correctAnswerId: number;
}

const questions: Question[] = questionsData;

// GET /api/questions?device_id=xxx - Retorna preguntas si no tiene acceso válido
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const device_id = searchParams.get('device_id');

  // Si no hay device_id, mostrar preguntas
  if (!device_id) {
    return NextResponse.json({
      has_access: false,
      total: questions.length,
      questions,
    });
  }

  // Verificar si el dispositivo tiene acceso válido en access_grants
  const { data: accessGrant } = await supabase
    .from('access_grants')
    .select('*')
    .eq('device_id', device_id)
    .eq('revoked', false)
    .gte('expires_at', new Date().toISOString())
    .single();

  // Si tiene acceso válido, no mostrar preguntas
  if (accessGrant) {
    return NextResponse.json({
      has_access: true,
      total: 0,
      questions: [],
    });
  }

  // Si no tiene acceso o está revocado/expirado, mostrar preguntas
  return NextResponse.json({
    has_access: false,
    total: questions.length,
    questions,
  });
}

// GET /api/questions?id=1 - Retorna una pregunta específica
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { questionId } = body;

    if (!questionId) {
      return NextResponse.json(
        { error: 'Se requiere el ID de la pregunta' },
        { status: 400 }
      );
    }

    const question = questions.find((q) => q.id === questionId);

    if (!question) {
      return NextResponse.json(
        { error: 'Pregunta no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json(question);
  } catch {
    return NextResponse.json(
      { error: 'Error al procesar la solicitud' },
      { status: 500 }
    );
  }
}
