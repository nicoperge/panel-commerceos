// src/lib/context/GlobalContext.tsx
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { createSPASassClientAuthenticated as createSPASassClient } from '@/lib/supabase/client';
import { Database } from '@/lib/types';
import { db } from '@/lib/roles';

type User = {
    email: string;
    id: string;
    registered_at: Date;
};

export type Perfil = Database['public']['Tables']['perfiles']['Row'];

interface GlobalContextType {
    loading: boolean;
    user: User | null;
    perfil: Perfil | null;
}

const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

export function GlobalProvider({ children }: { children: React.ReactNode }) {
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<User | null>(null);
    const [perfil, setPerfil] = useState<Perfil | null>(null);

    useEffect(() => {
        async function loadData() {
            try {
                const supabase = await createSPASassClient();
                const client = supabase.getSupabaseClient();

                const { data: { user } } = await client.auth.getUser();
                if (!user) throw new Error('User not found');
                setUser({
                    email: user.email!,
                    id: user.id,
                    registered_at: new Date(user.created_at)
                });

                const { data } = await db().from('perfiles').select('*').eq('id', user.id).maybeSingle();
                setPerfil(data as Perfil | null);
            } catch (error) {
                console.error('Error loading data:', error);
            } finally {
                setLoading(false);
            }
        }

        loadData();
    }, []);

    return (
        <GlobalContext.Provider value={{ loading, user, perfil }}>
            {children}
        </GlobalContext.Provider>
    );
}

export const useGlobal = () => {
    const context = useContext(GlobalContext);
    if (context === undefined) {
        throw new Error('useGlobal must be used within a GlobalProvider');
    }
    return context;
};
