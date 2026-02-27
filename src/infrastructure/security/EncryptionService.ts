/**
 * Encryption Service
 * Handles PIN hashing and data encryption
 */
import { injectable } from 'inversify';
import 'reflect-metadata';
import * as Crypto from 'expo-crypto';

@injectable()
export class EncryptionService {
    /**
     * Hash PIN using SHA-256
     */
    async hashPin(pin: string): Promise<string> {
        const hash = await Crypto.digestStringAsync(
            Crypto.CryptoDigestAlgorithm.SHA256,
            pin
        );
        return hash;
    }

    /**
     * Verify PIN against hash
     */
    async verifyPin(pin: string, hash: string): Promise<boolean> {
        const pinHash = await this.hashPin(pin);
        return pinHash === hash;
    }

    /**
     * Generate random password for Supabase auth
     */
    generateRandomPassword(): string {
        const array = new Uint8Array(32);
        crypto.getRandomValues(array);
        return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
    }

    /**
     * Encrypt sensitive data
     */
    async encryptData(data: string, key: string): Promise<string> {
        // For now, return base64 encoded
        // In production, use proper encryption like AES
        const encoded = btoa(data);
        return encoded;
    }

    /**
     * Decrypt sensitive data
     */
    async decryptData(encryptedData: string, key: string): Promise<string> {
        // For now, return base64 decoded
        // In production, use proper decryption
        const decoded = atob(encryptedData);
        return decoded;
    }
}
