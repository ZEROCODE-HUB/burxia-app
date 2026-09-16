import { useAuth } from '../context/AuthContext';
import { useMemo, useState, useEffect } from 'react';
import { getAccountLimits } from '../services/account.service';
import { AccountLimit } from '../types/database.types';

export function useAccount() {
  const { account, refreshAccount } = useAuth();
  const [limits, setLimits] = useState<(AccountLimit & { percentUsed: number }) | null>(null);
  const [loadingLimits, setLoadingLimits] = useState(false);

  useEffect(() => {
    if (account?.id) {
      loadLimits(account.id);
    }
  }, [account?.id]);

  const loadLimits = async (accountId: string) => {
    try {
      setLoadingLimits(true);
      const data = await getAccountLimits(accountId);
      setLimits(data);
    } catch (error) {
      console.error('Error loading limits:', error);
    } finally {
      setLoadingLimits(false);
    }
  };

  const balance = useMemo(() => account?.balance || 0, [account]);
  const accountNumber = useMemo(() => account?.account_number || '', [account]);
  const alias = useMemo(() => account?.alias || '', [account]);
  const accountId = useMemo(() => account?.id || '', [account]);
  const status = useMemo(() => account?.status || 'active', [account]);
  const currency = useMemo(() => account?.account_types?.currency || 'ARS', [account]);

  return {
    account,
    limits,
    loadingLimits,
    accountId,
    balance,
    accountNumber,
    alias,
    status,
    currency,
    refreshBalance: () => {
      refreshAccount();
      if (account?.id) loadLimits(account.id);
    },
  };
}
