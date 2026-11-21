"use client";
import React from 'react';
import Link from 'next/link';
import { useGlobal } from '@/lib/context/GlobalContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Users } from 'lucide-react';
import { ROLES, PLANES, ESTADOS } from '@/lib/roles';

export default function Inicio() {
    const { loading, user, perfil } = useGlobal();

    if (loading) {
        return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div></div>;
    }

    const nombre = perfil?.nombre || user?.email?.split('@')[0];

    if (!perfil || perfil.estado !== 'activo') {
        return (
            <div className="p-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Hola, {nombre}</CardTitle>
                        <CardDescription>
                            {perfil?.estado === 'suspendido'
                                ? 'Tu cuenta está suspendida. Hablá con el administrador.'
                                : 'Tu cuenta está pendiente. Cuando el superadmin la apruebe, vas a poder usar el panel.'}
                        </CardDescription>
                    </CardHeader>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6 p-6">
            <Card>
                <CardHeader>
                    <CardTitle>Hola, {nombre}</CardTitle>
                    <CardDescription>
                        Rol: <b>{ROLES[perfil.rol]}</b> · Plan: <b>{PLANES[perfil.plan]}</b> · Estado: <b>{ESTADOS[perfil.estado]}</b>
                    </CardDescription>
                </CardHeader>
            </Card>

            {perfil.rol === 'superadmin' && (
                <Card>
                    <CardContent className="p-4">
                        <Link href="/app/usuarios" className="flex items-center gap-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                            <div className="p-2 bg-primary-50 rounded-full"><Users className="h-4 w-4 text-primary-600" /></div>
                            <div>
                                <h3 className="font-medium">Usuarios</h3>
                                <p className="text-sm text-gray-500">Ver y administrar todos los usuarios, roles y planes</p>
                            </div>
                        </Link>
                    </CardContent>
                </Card>
            )}

            {perfil.rol === 'empresa' && (
                <Card><CardHeader><CardTitle>Panel de empresa</CardTitle><CardDescription>Acá vas a ver las ventas, el stock y los vendedores de tu comercio.</CardDescription></CardHeader></Card>
            )}

            {perfil.rol === 'vendedor' && (
                <Card><CardHeader><CardTitle>Panel de vendedor</CardTitle><CardDescription>Acá vas a ver tus ventas y los clientes de tu local.</CardDescription></CardHeader></Card>
            )}
        </div>
    );
}
