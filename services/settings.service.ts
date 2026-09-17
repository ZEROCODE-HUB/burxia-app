import { supabase } from '../lib/supabase';
import { SUPPORT_EMAIL } from '../constants/brand';

/**
 * Obtiene el email de soporte configurado en la base de datos.
 * Si no existe la tabla o el registro, retorna el email de fallback.
 */
export async function getSupportEmail(): Promise<string> {
    try {
        const { data, error } = await (supabase
            .from('support') as any)
            .select('email')
            .single();

        if (error || !data?.email) {
            return SUPPORT_EMAIL;
        }

        return data.email as string;
    } catch {
        return SUPPORT_EMAIL;
    }
}
