import { SupabaseClient } from '@supabase/supabase-js';
import { createSPAClient } from '@/lib/supabase/client';

// Cliente sin los tipos generados de la plantilla (no coinciden con la versión de supabase-js)
export const db = () => createSPAClient() as unknown as SupabaseClient;

export const ROLES = { superadmin: 'Superadmin', empresa: 'Empresa', vendedor: 'Vendedor' } as const;
export const PLANES = { gratis: 'Gratis', basico: 'Básico', pro: 'Pro' } as const;
export const ESTADOS = { activo: 'Activo', pendiente: 'Pendiente', suspendido: 'Suspendido' } as const;

export function fechaCorta(iso: string | null) {
    if (!iso) return 'Nunca';
    return new Date(iso).toLocaleString('es-AR', {
        day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });
}
