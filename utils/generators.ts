import { ALIAS_PREFIX } from '../constants/brand';

/**
 * Calcula digito verificador para bloque del CBU
 * Algoritmo modulo 10 con pesos 3, 1, 7, 9
 */
function calculateCBUVerifier(block: string): number {
  const weights = [3, 1, 7, 9];
  let sum = 0;

  for (let i = 0; i < block.length; i++) {
    sum += parseInt(block[i]) * weights[i % 4];
  }

  const remainder = sum % 10;
  return remainder === 0 ? 0 : 10 - remainder;
}

/**
 * Genera numero aleatorio de longitud especifica
 */
function generateRandomDigits(length: number): string {
  let result = '';
  for (let i = 0; i < length; i++) {
    result += Math.floor(Math.random() * 10).toString();
  }
  return result;
}

/**
 * Genera CBU valido de 22 digitos
 *
 * Estructura CBU:
 * - Posiciones 1-3: Codigo de banco (285 = Bruxia ficticio)
 * - Posiciones 4-7: Codigo de sucursal (0590)
 * - Posicion 8: Digito verificador del primer bloque
 * - Posiciones 9-21: Numero de cuenta (13 digitos)
 * - Posicion 22: Digito verificador del segundo bloque
 */
export function generateCBU(): string {
  const bankCode = '285';        // Banco ficticio Bruxia
  const branchCode = '0590';     // Sucursal ficticia

  // Primer bloque: banco (3) + sucursal (4) = 7 digitos
  const firstBlock = bankCode + branchCode;
  const firstVerifier = calculateCBUVerifier(firstBlock);

  // Segundo bloque: 13 digitos de cuenta
  const accountNumber = generateRandomDigits(13);
  const secondVerifier = calculateCBUVerifier(accountNumber);

  // CBU completo: bloque1 (7) + verif1 (1) + bloque2 (13) + verif2 (1) = 22
  return `${firstBlock}${firstVerifier}${accountNumber}${secondVerifier}`;
}

/**
 * Calcula digito verificador para CVU
 * Algoritmo modulo 10 con pesos alternados 3, 1
 */
function calculateCVUVerifier(block: string): number {
  let sum = 0;

  for (let i = 0; i < block.length; i++) {
    const weight = i % 2 === 0 ? 3 : 1;
    sum += parseInt(block[i]) * weight;
  }

  const remainder = sum % 10;
  return remainder === 0 ? 0 : 10 - remainder;
}

/**
 * Genera CVU valido de 22 digitos
 *
 * Estructura CVU:
 * - Posiciones 1-8: Codigo PSP (00000100 = Bruxia)
 * - Posicion 9: Digito verificador del primer bloque
 * - Posiciones 10-21: Numero de cuenta virtual (12 digitos)
 * - Posicion 22: Digito verificador del segundo bloque
 */
export function generateAccountNumber(): string {
  const pspCode = '00000100';    // PSP Bruxia

  // Primer bloque: PSP (8 digitos)
  const firstVerifier = calculateCVUVerifier(pspCode);

  // Segundo bloque: 12 digitos de cuenta virtual
  const virtualAccount = generateRandomDigits(12);
  const secondVerifier = calculateCVUVerifier(virtualAccount);

  // CVU completo: psp (8) + verif1 (1) + cuenta (12) + verif2 (1) = 22
  return `${pspCode}${firstVerifier}${virtualAccount}${secondVerifier}`;
}

/**
 * Genera alias para cuenta basado en CVU
 * Formato: <ALIAS_PREFIX>.XXXXXXXX (ultimos 8 digitos del CVU)
 */
export function generateAlias(cvu: string): string {
  const suffix = cvu.slice(-8);
  return `${ALIAS_PREFIX}.${suffix}`;
}

/**
 * Valida formato de CBU (22 digitos numericos)
 */
export function isValidCBUFormat(cbu: string): boolean {
  return /^\d{22}$/.test(cbu);
}

/**
 * Valida formato de CVU (22 digitos numericos)
 */
export function isValidCVUFormat(cvu: string): boolean {
  return /^\d{22}$/.test(cvu);
}

/**
 * Obtiene fecha de fin de mes actual
 */
export function getEndOfMonth(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
}

/**
 * Obtiene fecha de inicio de mes actual
 */
export function getStartOfMonth(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
}
