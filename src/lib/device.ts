import { v4 as uuidv4 } from 'uuid';

const DEVICE_ID_KEY = 'maryvalz_device_id';
const TOKEN_KEY = 'maryvalz_token';

/**
 * Obtiene o genera el device_id
 */
export function getOrCreateDeviceId(): string {
  if (typeof window === 'undefined') return '';

  let deviceId = localStorage.getItem(DEVICE_ID_KEY);

  if (!deviceId) {
    deviceId = uuidv4();
    localStorage.setItem(DEVICE_ID_KEY, deviceId);
  }

  return deviceId;
}

/**
 * Genera un token (JSON en base64) y lo guarda en localStorage y cookie
 * Solo se llama cuando el usuario aprueba el cuestionario
 */
export function generateAndSaveToken(deviceId: string): string {
  if (typeof window === 'undefined') return '';

  const payload = {
    device_id: deviceId,
    created_at: new Date().toISOString(),
  };

  const token = btoa(JSON.stringify(payload));
  localStorage.setItem(TOKEN_KEY, token);

  // También guardar en cookie para que el middleware pueda leerlo
  document.cookie = `maryvalz_token=${token}; path=/; max-age=${60 * 60 * 24 * 7}; samesite=strict`;
  document.cookie = `maryvalz_device_id=${deviceId}; path=/; max-age=${60 * 60 * 24 * 7}; samesite=strict`;

  return token;
}

/**
 * Inicializa solo el device_id (sin token)
 * El token se genera solo cuando aprueba el cuestionario
 */
export function initializeDevice(): { deviceId: string } {
  const deviceId = getOrCreateDeviceId();
  return { deviceId };
}

/**
 * Obtiene los valores actuales del localStorage
 */
export function getDeviceCredentials(): { deviceId: string | null; token: string | null } {
  if (typeof window === 'undefined') {
    return { deviceId: null, token: null };
  }

  return {
    deviceId: localStorage.getItem(DEVICE_ID_KEY),
    token: localStorage.getItem(TOKEN_KEY),
  };
}

/**
 * Verifica si el token existe y es válido (decodificable)
 */
export function hasValidToken(): boolean {
  if (typeof window === 'undefined') return false;

  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) return false;

  try {
    const decoded = JSON.parse(atob(token));
    return decoded.device_id && decoded.created_at;
  } catch {
    return false;
  }
}

/**
 * Obtiene el token actual
 */
export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}
