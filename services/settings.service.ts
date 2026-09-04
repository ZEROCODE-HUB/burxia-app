import { supabase } from '../lib/supabase';

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
            return 'soporte@tecnomind.com';
        }

        return data.email as string;
    } catch {
        return 'soporte@tecnomind.com';
    }
}
