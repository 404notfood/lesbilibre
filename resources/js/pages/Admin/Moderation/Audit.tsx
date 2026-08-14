import DatingLayout from '@/layouts/dating-layout';
import { Head } from '@inertiajs/react';

type Action = {
    id: number;
    action: string;
    reason: string | null;
    notes: string | null;
    moderator: { name: string; pseudo: string } | null;
    subject_user: { name: string; pseudo: string } | null;
    created_at: string;
};

export default function Audit({ actions }: { actions: { data: Action[] } }) {
    return (
        <DatingLayout title="Journal de modération" showOnlineUsers={false}>
            <Head title="Journal de modération" />
            <main className="container-responsive py-8">
                <p className="editorial-eyebrow text-muted-foreground">Accès interne · journal non modifiable</p>
                <h1 className="mt-2 text-3xl font-semibold">Décisions de modération</h1>
                <div className="mt-6 overflow-x-auto rounded-2xl border bg-card">
                    <table className="w-full min-w-[720px] text-left text-sm">
                        <thead className="border-b bg-muted/40 text-muted-foreground">
                            <tr><th className="p-4">Date</th><th className="p-4">Action</th><th className="p-4">Modératrice</th><th className="p-4">Compte concerné</th><th className="p-4">Motif / notes</th></tr>
                        </thead>
                        <tbody>
                            {actions.data.map((item) => (
                                <tr key={item.id} className="border-b last:border-0">
                                    <td className="p-4 whitespace-nowrap">{new Date(item.created_at).toLocaleString('fr-FR')}</td>
                                    <td className="p-4 font-medium">{item.action}</td>
                                    <td className="p-4">{item.moderator?.pseudo ?? 'Compte supprimé'}</td>
                                    <td className="p-4">{item.subject_user?.pseudo ?? 'Compte supprimé'}</td>
                                    <td className="p-4 text-muted-foreground">{item.notes ?? item.reason ?? '—'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </main>
        </DatingLayout>
    );
}
