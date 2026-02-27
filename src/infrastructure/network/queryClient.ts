/**
 * React Query Configuration
 * Configures React Query client with caching and retry strategies
 */
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            // Stale time: 5 minutes
            staleTime: 1000 * 60 * 5,

            // Cache time: 10 minutes
            gcTime: 1000 * 60 * 10,

            // Retry failed requests 3 times
            retry: 3,

            // Retry delay with exponential backoff
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),

            // Refetch on window focus
            refetchOnWindowFocus: false,

            // Refetch on reconnect
            refetchOnReconnect: true,
        },
        mutations: {
            // Retry mutations once
            retry: 1,
        },
    },
});
