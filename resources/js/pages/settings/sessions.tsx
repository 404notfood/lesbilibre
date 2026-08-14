import HeadingSmall from '@/components/heading-small';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { Head, useForm } from '@inertiajs/react';

type Session = { id: string; ip_address: string | null; user_agent: string | null; last_activity: string; is_current: boolean };

export default function Sessions({ sessions }: { sessions: Session[] }) {
    const form = useForm({ password: '' });
    return <AppLayout breadcrumbs={[{ title: 'Sessions', href: '/settings/sessions' }]}><Head title="Sessions" /><SettingsLayout><div className="space-y-6"><HeadingSmall title="Sessions actives" description="Déconnectez les appareils que vous ne reconnaissez pas." /><div className="space-y-3">{sessions.map((session) => <div key={session.id} className="rounded-lg border p-4 text-sm"><div className="font-medium">{session.is_current ? 'Cette session' : session.user_agent || 'Appareil inconnu'}</div><div className="mt-1 text-muted-foreground">{session.ip_address || 'IP indisponible'} · activité le {new Date(session.last_activity).toLocaleString('fr-FR')}</div></div>)}</div><form onSubmit={(event) => { event.preventDefault(); form.delete('/settings/sessions'); }} className="max-w-md space-y-3 rounded-lg border border-destructive/30 p-4"><p className="font-medium">Déconnecter les autres appareils</p><Input type="password" value={form.data.password} onChange={(event) => form.setData('password', event.target.value)} placeholder="Mot de passe actuel" autoComplete="current-password" /><Button type="submit" variant="destructive" disabled={form.processing}>Déconnecter les autres sessions</Button></form></div></SettingsLayout></AppLayout>;
}
