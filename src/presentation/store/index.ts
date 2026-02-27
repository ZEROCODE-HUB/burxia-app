/**
 * Zustand Store
 * Global state management for auth, UI, and app state
 */
import { create } from 'zustand';
import { UserEntity } from '../../domain/entities/User.entity';
import { AccountEntity } from '../../domain/entities/Account.entity';

interface AuthState {
    user: UserEntity | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    setUser: (user: UserEntity | null) => void;
    setLoading: (loading: boolean) => void;
    logout: () => void;
}

interface AccountState {
    primaryAccount: AccountEntity | null;
    accounts: AccountEntity[];
    setPrimaryAccount: (account: AccountEntity | null) => void;
    setAccounts: (accounts: AccountEntity[]) => void;
}

interface UIState {
    theme: 'dark';
    isBottomSheetOpen: boolean;
    setBottomSheetOpen: (open: boolean) => void;
}

// Auth Store
export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    setUser: (user) => set({ user, isAuthenticated: !!user }),
    setLoading: (isLoading) => set({ isLoading }),
    logout: () => set({ user: null, isAuthenticated: false }),
}));

// Account Store
export const useAccountStore = create<AccountState>((set) => ({
    primaryAccount: null,
    accounts: [],
    setPrimaryAccount: (primaryAccount) => set({ primaryAccount }),
    setAccounts: (accounts) => set({ accounts }),
}));

// UI Store
export const useUIStore = create<UIState>((set) => ({
    theme: 'dark',
    isBottomSheetOpen: false,
    setBottomSheetOpen: (isBottomSheetOpen) => set({ isBottomSheetOpen }),
}));
