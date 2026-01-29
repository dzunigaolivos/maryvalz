import { supabase } from '@/lib/supabase';
import crypto from 'crypto';

/**
 * Genera hash SHA-256 del token
 */
export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

/**
 * Calcula la fecha de expiración (7 días desde ahora)
 */
export function getExpirationDate(): string {
  const now = new Date();
  now.setDate(now.getDate() + 7);
  return now.toISOString();
}

/**
 * Asegura que el dispositivo exista en la tabla devices
 */
export async function ensureDeviceExists(device_id: string) {
  const now = new Date().toISOString();

  // Verificar si ya existe en devices
  const { data: existingDevice } = await supabase
    .from('devices')
    .select('id')
    .eq('id', device_id)
    .maybeSingle();

  if (existingDevice) {
    // Actualizar last_seen_at
    await supabase
      .from('devices')
      .update({ last_seen_at: now })
      .eq('id', device_id);
  } else {
    // Crear nuevo dispositivo
    const { error: deviceError } = await supabase
      .from('devices')
      .insert({
        id: device_id,
        first_seen_at: now,
        last_seen_at: now,
      });

    if (deviceError) {
      throw deviceError;
    }
  }
}

/**
 * Registra o actualiza un dispositivo en access_grants
 */
export async function registerDevice(device_id: string, token: string) {
  const token_hash = hashToken(token);
  const issued_at = new Date().toISOString();
  const expires_at = getExpirationDate();

  // Primero asegurar que el dispositivo existe en la tabla devices (FK)
  await ensureDeviceExists(device_id);

  // Verificar si ya existe en access_grants
  const { data: existing, error: fetchError } = await supabase
    .from('access_grants')
    .select('*')
    .eq('device_id', device_id)
    .maybeSingle();

  if (fetchError) {
    throw fetchError;
  }

  if (existing) {
    // Actualizar issued_at y expires_at
    const { data, error } = await supabase
      .from('access_grants')
      .update({
        token_hash,
        issued_at,
        expires_at,
        revoked: false,
      })
      .eq('device_id', device_id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return {
      success: true,
      device_id,
      is_new: false,
      issued_at: data.issued_at,
      expires_at: data.expires_at,
    };
  }

  // Registrar nuevo dispositivo
  const { data, error } = await supabase
    .from('access_grants')
    .insert({
      device_id,
      token_hash,
      issued_at,
      expires_at,
      revoked: false,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return {
    success: true,
    device_id,
    is_new: true,
    issued_at: data.issued_at,
    expires_at: data.expires_at,
  };
}

/**
 * Registra o actualiza una conversación
 */
export async function registerConversation(device_id: string, character_id: string) {
  const now = new Date().toISOString();

  // Verificar si ya existe una conversación con este device_id y character_id
  const { data: existing, error: fetchError } = await supabase
    .from('conversations')
    .select('*')
    .eq('device_id', device_id)
    .eq('character_id', character_id)
    .maybeSingle();

  if (fetchError) {
    throw fetchError;
  }

  if (existing) {
    // Actualizar updated_at
    const { data, error } = await supabase
      .from('conversations')
      .update({
        updated_at: now,
        is_active: true,
      })
      .eq('device_id', device_id)
      .eq('character_id', character_id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return {
      success: true,
      conversation_id: data.id,
      is_new: false,
      updated_at: data.updated_at,
    };
  }

  // Crear nueva conversación
  const { data, error } = await supabase
    .from('conversations')
    .insert({
      device_id,
      character_id,
      created_at: now,
      updated_at: now,
      is_active: true,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return {
    success: true,
    conversation_id: data.id,
    is_new: true,
    created_at: data.created_at,
  };
}

/**
 * Obtiene una conversación por device_id y character_id
 */
export async function getConversation(device_id: string, character_id: string) {
  const { data, error } = await supabase
    .from('conversations')
    .select('*')
    .eq('device_id', device_id)
    .eq('character_id', character_id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    return {
      success: true,
      exists: false,
      conversation: null,
    };
  }

  return {
    success: true,
    exists: true,
    conversation: data,
  };
}

/**
 * Obtiene un character por su ID
 */
export async function getCharacter(character_id: string) {
  const { data, error } = await supabase
    .from('characters')
    .select('*')
    .eq('id', character_id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    return {
      success: true,
      exists: false,
      character: null,
    };
  }

  return {
    success: true,
    exists: true,
    character: data,
  };
}

/**
 * Obtiene todos los mensajes de una conversación ordenados por fecha
 */
export async function getMessages(conversation_id: string) {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversation_id)
    .order('created_at', { ascending: true });

  if (error) {
    throw error;
  }

  return {
    success: true,
    messages: data || [],
  };
}

/**
 * Guarda un mensaje en la conversación
 */
export async function saveMessage(
  conversation_id: string,
  role: 'user' | 'assistant' | 'system',
  content: string
) {
  const { data, error } = await supabase
    .from('messages')
    .insert({
      conversation_id,
      role,
      content,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return {
    success: true,
    message: data,
  };
}

/**
 * Obtiene o crea una conversación y retorna el ID junto con los mensajes
 */
export async function getOrCreateConversationWithMessages(
  device_id: string,
  character_id: string
) {
  // Primero intentar obtener la conversación existente
  let conversationResult = await getConversation(device_id, character_id);

  // Si no existe, crear una nueva
  if (!conversationResult.exists) {
    const registerResult = await registerConversation(device_id, character_id);
    conversationResult = {
      success: true,
      exists: true,
      conversation: {
        id: registerResult.conversation_id,
        device_id,
        character_id,
        created_at: registerResult.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_active: true,
      },
    };
  }

  // Obtener los mensajes de la conversación
  const messagesResult = await getMessages(conversationResult.conversation!.id);

  return {
    success: true,
    conversation: conversationResult.conversation,
    messages: messagesResult.messages,
  };
}

// Límite de mensajes por usuario por personaje
const MESSAGE_LIMIT = 150;

/**
 * Verifica y actualiza el rate limit para un device_id y character_id
 * Retorna si está permitido enviar mensaje o no
 */
export async function checkAndUpdateRateLimit(
  device_id: string,
  character_id: string
) {
  const now = new Date().toISOString();

  // Buscar rate limit existente
  const { data: existing, error: fetchError } = await supabase
    .from('chat_rate_limits')
    .select('*')
    .eq('device_id', device_id)
    .eq('character_id', character_id)
    .maybeSingle();

  if (fetchError) {
    throw fetchError;
  }

  // Si no existe, crear uno nuevo
  if (!existing) {
    const { data, error } = await supabase
      .from('chat_rate_limits')
      .insert({
        device_id,
        character_id,
        window_start: now,
        request_count: 1,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return {
      success: true,
      allowed: true,
      request_count: 1,
      limit: MESSAGE_LIMIT,
      remaining: MESSAGE_LIMIT - 1,
    };
  }

  // Si ya llegó al límite, no permitir
  if (existing.request_count >= MESSAGE_LIMIT) {
    return {
      success: true,
      allowed: false,
      request_count: existing.request_count,
      limit: MESSAGE_LIMIT,
      remaining: 0,
    };
  }

  // Incrementar el contador
  const newCount = existing.request_count + 1;
  const { error: updateError } = await supabase
    .from('chat_rate_limits')
    .update({ request_count: newCount })
    .eq('id', existing.id);

  if (updateError) {
    throw updateError;
  }

  return {
    success: true,
    allowed: newCount <= MESSAGE_LIMIT,
    request_count: newCount,
    limit: MESSAGE_LIMIT,
    remaining: Math.max(0, MESSAGE_LIMIT - newCount),
  };
}

/**
 * Obtiene el estado actual del rate limit sin incrementar
 */
export async function getRateLimitStatus(
  device_id: string,
  character_id: string
) {
  const { data: existing, error: fetchError } = await supabase
    .from('chat_rate_limits')
    .select('*')
    .eq('device_id', device_id)
    .eq('character_id', character_id)
    .maybeSingle();

  if (fetchError) {
    throw fetchError;
  }

  if (!existing) {
    return {
      success: true,
      request_count: 0,
      limit: MESSAGE_LIMIT,
      remaining: MESSAGE_LIMIT,
      is_limited: false,
    };
  }

  return {
    success: true,
    request_count: existing.request_count,
    limit: MESSAGE_LIMIT,
    remaining: Math.max(0, MESSAGE_LIMIT - existing.request_count),
    is_limited: existing.request_count >= MESSAGE_LIMIT,
  };
}
