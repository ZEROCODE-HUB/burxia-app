import { supabase } from '../lib/supabase';
import { AccountWithType, AccountLimit, Account } from '../types/database.types';

/**
 * Obtener cuenta principal del usuario
 */
export async function getPrimaryAccount(userId: string): Promise<AccountWithType | null> {
  const { data, error } = await supabase
    .from('accounts')
    .select('*, account_types(*)')
    .eq('user_id', userId)
    .eq('is_primary', true)
    .single();

  if (error) {
    console.error('Error getting primary account:', error);
    return null;
  }

  return data as AccountWithType;
}

/**
 * Obtener todas las cuentas del usuario
 */
export async function getAllAccounts(userId: string): Promise<AccountWithType[]> {
  const { data, error } = await supabase
    .from('accounts')
    .select('*, account_types(*)')
    .eq('user_id', userId)
    .order('is_primary', { ascending: false });

  if (error) {
    console.error('Error getting accounts:', error);
    return [];
  }

  return data as AccountWithType[];
}

/**
 * Obtener cuenta por ID
 */
export async function getAccountById(accountId: string): Promise<AccountWithType | null> {
  const { data, error } = await supabase
    .from('accounts')
    .select('*, account_types(*)')
    .eq('id', accountId)
    .single();

  if (error) {
    console.error('Error getting account:', error);
    return null;
  }

  return data as AccountWithType;
}

/**
 * Obtener límites de cuenta
 */
export async function getAccountLimits(accountId: string): Promise<(AccountLimit & { percentUsed: number }) | null> {
  const { data, error } = await supabase
    .from('account_limits')
    .select('*')
    .eq('account_id', accountId)
    .maybeSingle();

  if (error) {
    console.error('Error getting limits:', error);
    return null;
  }

  if (!data) return null;

  const limits = data as AccountLimit;
  return {
    ...limits,
    percentUsed: limits.monthly_limit > 0
      ? (limits.monthly_spent / limits.monthly_limit) * 100
      : 0,
  };
}

/**
 * Obtener balance actual de una cuenta
 */
export async function getAccountBalance(accountId: string): Promise<number | null> {
  const { data, error } = await supabase
    .from('accounts')
    .select('balance')
    .eq('id', accountId)
    .single();

  if (error) {
    console.error('Error getting balance:', error);
    return null;
  }

  return (data as Pick<Account, 'balance'>).balance;
}

/**
 * Buscar cuenta por CVU, CBU o Alias
 */
export async function findAccountByIdentifier(identifier: string): Promise<AccountWithType | null> {
  // Intentar buscar por CVU
  let { data, error } = await supabase
    .from('accounts')
    .select('*, account_types(*)')
    .eq('cvu', identifier)
    .single();

  if (!error && data) return data as AccountWithType;

  // Intentar buscar por CBU
  ({ data, error } = await supabase
    .from('accounts')
    .select('*, account_types(*)')
    .eq('cbu', identifier)
    .single());

  if (!error && data) return data as AccountWithType;

  // Intentar buscar por Alias
  ({ data, error } = await supabase
    .from('accounts')
    .select('*, account_types(*)')
    .eq('alias', identifier.toLowerCase())
    .single());

  if (!error && data) return data as AccountWithType;

  return null;
}

/**
 * Obtener información de cuenta via RPC
 */
export async function getAccountInfo(): Promise<AccountWithType | null> {
  const { data, error } = await supabase.rpc('get_account_info');

  if (error) {
    console.error('Error getting account info RPC:', error);
    throw error;
  }

  return (data?.[0] as unknown as AccountWithType) || null;
}

/**
 * Actualizar Alias
 */
export async function updateAlias(accountId: string, newAlias: string): Promise<void> {
  const { error } = await (supabase
    .from('accounts') as any)
    .update({ alias: newAlias })
    .eq('id', accountId);

  if (error) {
    if (error.code === '23505') { // Unique violation
      throw new Error('Este alias ya está en uso');
    }
    throw error;
  }
}

/**
 * Obtener QR Estático
 */
export async function getStaticQR(accountId: string) {
  const { data, error } = await supabase
    .from('qr_codes')
    .select('*')
    .eq('account_id', accountId)
    .eq('qr_type', 'static')
    .eq('is_active', true)
    .single();

  if (error) throw error;

  return {
    qrHash: (data as any).qr_hash,
    qrData: JSON.parse((data as any).qr_data),
  };
}

/**
 * Generar QR Dinámico
 */
export async function generateDynamicQR(accountId: string, amount: number, concept: string, cvu: string, alias: string) {
  const qrData = {
    account_id: accountId,
    cvu,
    alias,
    amount,
    concept,
    type: 'dynamic',
  };

  const { data, error } = await supabase
    .from('qr_codes')
    .insert({
      account_id: accountId,
      qr_data: JSON.stringify(qrData),
      qr_type: 'dynamic',
      amount,
      concept,
      is_active: true,
      expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // 15 minutos
      max_uses: 1,
    } as any)
    .select()
    .single();

  if (error) throw error;

  return data;
}

/**
 * Verificar disponibilidad de alias
 */
export async function checkAliasAvailable(alias: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('accounts')
    .select('id')
    .eq('alias', alias)
    .maybeSingle();

  if (error) throw error;

  return !data; // Si data es null, está disponible
}
