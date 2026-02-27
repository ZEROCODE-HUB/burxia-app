/**
 * Secure Storage Service
 * Handles secure storage of sensitive data using expo-secure-store
 */
import { injectable } from 'inversify';
import 'reflect-metadata';
import * as SecureStore from 'expo-secure-store';

@injectable()
export class SecureStorageService {
    /**
     * Save item to secure storage
     */
    async setItem(key: string, value: string): Promise<void> {
        try {
            await SecureStore.setItemAsync(key, value);
        } catch (error) {
            console.error('Error saving to secure storage:', error);
            throw new Error('No se pudo guardar en el almacenamiento seguro');
        }
    }

    /**
     * Get item from secure storage
     */
    async getItem(key: string): Promise<string | null> {
        try {
            return await SecureStore.getItemAsync(key);
        } catch (error) {
            console.error('Error reading from secure storage:', error);
            return null;
        }
    }

    /**
     * Remove item from secure storage
     */
    async removeItem(key: string): Promise<void> {
        try {
            await SecureStore.deleteItemAsync(key);
        } catch (error) {
            console.error('Error removing from secure storage:', error);
        }
    }

    /**
     * Clear all items from secure storage
     */
    async clear(): Promise<void> {
        // Note: expo-secure-store doesn't have a clear all method
        // You need to track keys and delete them individually
        const keys = ['user_pin', 'session_token', 'biometric_enabled'];
        for (const key of keys) {
            await this.removeItem(key);
        }
    }
}
