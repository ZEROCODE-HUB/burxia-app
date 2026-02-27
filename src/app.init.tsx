/**
 * App Initialization
 * Sets up DI container and providers for the application
 */
import 'reflect-metadata';
import React from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { queryClient } from './infrastructure/network/queryClient';
import { container } from './infrastructure/di/container';

// Initialize DI container
export const DIContainer = container;

// App Providers Component
export const AppProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <SafeAreaProvider>
            <QueryClientProvider client={queryClient}>
                {children}
            </QueryClientProvider>
        </SafeAreaProvider>
    );
};
