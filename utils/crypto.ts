import * as Crypto from 'expo-crypto';

// Clave de encriptacion (32 caracteres = 256 bits para AES-256)
// TODO: En produccion, usar clave segura desde variables de entorno
const ENCRYPTION_KEY = '12345678901234567890123456789012';

/**
 * Genera bytes aleatorios seguros
 */
async function generateRandomBytes(length: number): Promise<Uint8Array> {
  return await Crypto.getRandomBytesAsync(length);
}

/**
 * Convierte Uint8Array a string hexadecimal
 */
function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Convierte hex a Uint8Array
 */
function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
  }
  return bytes;
}

/**
 * Convierte string a Uint8Array usando TextEncoder (UTF-8)
 */
function stringToBytes(str: string): Uint8Array {
  const encoder = new TextEncoder();
  return encoder.encode(str);
}

/**
 * Convierte Uint8Array a string usando TextDecoder (UTF-8)
 */
function bytesToString(bytes: Uint8Array): string {
  const decoder = new TextDecoder('utf-8');
  return decoder.decode(bytes);
}

/**
 * Convierte Uint8Array a base64
 */
function bytesToBase64(bytes: Uint8Array): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  let result = '';
  let i = 0;

  while (i < bytes.length) {
    const a = bytes[i++];
    const b = i < bytes.length ? bytes[i] : 0;
    i++;
    const c = i < bytes.length ? bytes[i] : 0;
    i++;

    const n = (a << 16) | (b << 8) | c;

    result += chars[(n >> 18) & 63];
    result += chars[(n >> 12) & 63];
    result += i > bytes.length + 1 ? '=' : chars[(n >> 6) & 63];
    result += i > bytes.length ? '=' : chars[n & 63];
  }

  return result;
}

/**
 * Convierte base64 a Uint8Array
 */
function base64ToBytes(base64: string): Uint8Array {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

  // Remove padding y whitespace
  base64 = base64.replace(/[=\s]/g, '');

  const length = base64.length;
  // Calcular el tamaño exacto del buffer
  const bufferLength = Math.floor((length * 3) / 4);
  const bytes = new Uint8Array(bufferLength);

  let p = 0;
  for (let i = 0; i < length; i += 4) {
    const a = chars.indexOf(base64[i] || 'A');
    const b = chars.indexOf(base64[i + 1] || 'A');
    const c = i + 2 < length ? chars.indexOf(base64[i + 2]) : 0;
    const d = i + 3 < length ? chars.indexOf(base64[i + 3]) : 0;

    if (p < bufferLength) bytes[p++] = (a << 2) | (b >> 4);
    if (p < bufferLength) bytes[p++] = ((b & 15) << 4) | (c >> 2);
    if (p < bufferLength) bytes[p++] = ((c & 3) << 6) | d;
  }

  return bytes;
}
/**
 * XOR encryption con bytes
 */
function xorEncryptBytes(data: Uint8Array, key: Uint8Array): Uint8Array {
  const result = new Uint8Array(data.length);
  for (let i = 0; i < data.length; i++) {
    result[i] = data[i] ^ key[i % key.length];
  }
  return result;
}

/**
 * Encripta texto usando XOR + base64
 * @param text - Texto a encriptar
 * @returns Texto encriptado en formato base64
 */
export async function encrypt(text: string): Promise<string> {
  try {
    // Generar IV aleatorio
    const ivBytes = await generateRandomBytes(16);
    const iv = bytesToHex(ivBytes);

    // Crear clave combinada
    const keyBytes = stringToBytes(ENCRYPTION_KEY + iv);
    const textBytes = stringToBytes(text);

    // XOR encrypt
    const encrypted = xorEncryptBytes(textBytes, keyBytes);

    // Return as iv:encrypted_base64
    return `${iv}:${bytesToBase64(encrypted)}`;
  } catch (error) {
    console.error('Error encrypting:', error);
    throw new Error('Failed to encrypt data');
  }
}

/**
 * Desencripta texto
 * @param encryptedText - Texto encriptado en formato iv:base64
 * @returns Texto desencriptado
 */
export async function decrypt(encryptedText: string): Promise<string> {
  try {
    const parts = encryptedText.split(':');
    if (parts.length < 2) {
      throw new Error('Invalid encrypted format');
    }

    const iv = parts[0];
    const encryptedBase64 = parts.slice(1).join(':');

    // Crear clave combinada
    const keyBytes = stringToBytes(ENCRYPTION_KEY + iv);

    // Decode base64
    const encryptedBytes = base64ToBytes(encryptedBase64);

    // XOR decrypt (symmetric)
    const decryptedBytes = xorEncryptBytes(encryptedBytes, keyBytes);

    // Convert back to string
    return bytesToString(decryptedBytes);
  } catch (error) {
    console.error('Error decrypting:', error);
    throw new Error('Failed to decrypt data');
  }
}

/**
 * Genera una contraseña segura aleatoria
 * @param length - Longitud de la contraseña (default: 32)
 * @returns Contraseña en formato hexadecimal
 */
export async function generateSecurePassword(length: number = 32): Promise<string> {
  try {
    // Generar bytes aleatorios
    const bytes = await generateRandomBytes(Math.ceil(length / 2));

    // Convertir a hex y truncar a la longitud deseada
    const password = bytesToHex(bytes).substring(0, length);

    return password;
  } catch (error) {
    console.error('Error generating password:', error);
    throw new Error('Failed to generate secure password');
  }
}

/**
 * Genera un hash SHA-256 de un texto
 * @param text - Texto a hashear
 * @returns Hash en formato hexadecimal
 */
export async function sha256(text: string): Promise<string> {
  const digest = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    text
  );
  return digest;
}