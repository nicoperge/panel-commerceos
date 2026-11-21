"use client";
import React, { useEffect, useState, useCallback } from 'react';
import { useGlobal, Perfil } from '@/lib/context/GlobalContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Users, UserCheck, Clock, Activity } from 'lucide-react';
import { ROLES, PLANES, ESTADOS, fechaCorta, db } from '@/lib/roles';

const SIETE_DIAS = 7 * 24 * 60 * 60 * 1000;

export default function UsuariosPage() {
    const { loading, perfil } = useGlobal();
    const [usuarios, setUsuarios] = useState<Perfil[]>([]);
    const [mensaje, setMensaje] = useState('');
    const [error, setError] = useState('');

    const esSuperadmin = perfil?.rol === 'superadmin' && perfil?.estado === 'activo';

    const cargar = useCallback(async () => {
        const { data, error } = await db().from('perfiles').select('*').order('created_at');
        if (error) return setError('No se pudieron cargar los usuarios: ' + error.message);
        setUsuarios((data ?? []) as Perfil[]);
    }, []);

    useEffect(() => { if (esSuperadmin) cargar(); }, [esSuperadmin, cargar]);

    async function cambiar(id: string, campo: 'rol' | 'plan' | 'estado', valor: string) {
        setMensaje(''); setError('');
        if (id === perfil?.id && (campo === 'rol' || campo === 'estado') && !confirm('Estás cambiando tu propio acceso. Podés perder el panel de superadmin. ¿Seguro?')) return;
        const { error } = await db().from('perfiles').update({ [campo]: valor }).eq('id', id);
        if (error) return setError('No se pudo guardar: ' + error.message);
        setMensaje('Guardado.');
        cargar();
    }

    if (loading) {
        return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div></div>;
    }

    if (!esSuperadmin) {
        return (
            <div className="p-6">
                <Card><CardHeader><CardTitle>Sin acceso</CardTitle><CardDescription>Esta página es solo para el superadmin.</CardDescription></CardHeader></Card>
            </div>
        );
    }

    const ahora = Date.now();
    const numeros = [
        { titulo: 'Usuarios totales', valor: usuarios.length, icono: Users },
        { titulo: 'Activos', valor: usuarios.filter(u => u.estado === 'activo').length, icono: UserCheck },
        { titulo: 'Pendientes de aprobar', valor: usuarios.filter(u => u.estado === 'pendiente').length, icono: Clock },
        { titulo: 'Entraron en los últimos 7 días', valor: usuarios.filter(u => u.ultimo_ingreso && ahora - new Date(u.ultimo_ingreso).getTime() < SIETE_DIAS).length, icono: Activity },
    ];

    const select = (u: Perfil, campo: 'rol' | 'plan' | 'estado', opciones: Record<string, string>) => (
        <select
            value={u[campo]}
            onChange={e => cambiar(u.id, campo, e.target.value)}
            className="border rounded-md px-2 py-1 text-sm bg-white"
        >
            {Object.entries(opciones).map(([valor, texto]) => <option key={valor} value={valor}>{texto}</option>)}
        </select>
    );

    return (
        <div className="space-y-6 p-6">
            <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
                {numeros.map(n => (
                    <Card key={n.titulo}>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <p className="text-sm text-gray-500">{n.titulo}</p>
                                <n.icono className="h-4 w-4 text-primary-600" />
                            </div>
                            <p className="text-3xl font-semibold mt-2">{n.valor}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Usuarios</CardTitle>
                    <CardDescription>Cambiá rol, plan o estado y se guarda al instante. Los usuarios nuevos entran como Vendedor · Gratis · Pendiente.</CardDescription>
                </CardHeader>
                <CardContent>
                    {error && <p className="text-sm text-red-600 mb-2">{error}</p>}
                    {mensaje && <p className="text-sm text-green-700 mb-2">{mensaje}</p>}
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-left text-gray-500 border-b">
                                    <th className="py-2 pr-4">Usuario</th>
                                    <th className="py-2 pr-4">Rol</th>
                                    <th className="py-2 pr-4">Plan</th>
                                    <th className="py-2 pr-4">Estado</th>
                                    <th className="py-2 pr-4">Último ingreso</th>
                                </tr>
                            </thead>
                            <tbody>
                                {usuarios.map(u => (
                                    <tr key={u.id} className="border-b last:border-0">
                                        <td className="py-2 pr-4">
                                            <div className="font-medium">{u.nombre || u.email.split('@')[0]}</div>
                                            <div className="text-gray-500 text-xs">{u.email}</div>
                                        </td>
                                        <td className="py-2 pr-4">{select(u, 'rol', ROLES)}</td>
                                        <td className="py-2 pr-4">{select(u, 'plan', PLANES)}</td>
                                        <td className="py-2 pr-4">{select(u, 'estado', ESTADOS)}</td>
                                        <td className="py-2 pr-4 whitespace-nowrap">{fechaCorta(u.ultimo_ingreso)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
