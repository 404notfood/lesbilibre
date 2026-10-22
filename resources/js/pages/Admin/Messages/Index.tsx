import { Button } from '@/components/ui/button';
import AdminLayout from '@/layouts/admin-layout';
import { Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';

interface PendingMessage {
    id: number;
    content: string;
    sender: string;
    recipient: string;
    conflict: boolean;
    created_at: string;
}
export default function Index({
    messages,
}: {
    messages: {
        data: PendingMessage[];
        links: { url: string | null; label: string; active: boolean }[];
    };
}) {
    const [reasons, setReasons] = useState<Record<number, string>>({});
    const [busy, setBusy] = useState(false);
    const { errors } = usePage().props;
    const decide = (id: number, action: string) => {
        setBusy(true);
        router.post(
            `/admin/messages/${id}/${action}`,
            action === 'approve'
                ? { review_confirmed: true }
                : { reason: reasons[id] ?? '' },
            { preserveScroll: true, onFinish: () => setBusy(false) },
        );
    };
    return (
        <AdminLayout
            title="Messages à valider"
            subtitle="Chaque message reste invisible pour sa destinataire avant votre validation."
        >
            <div className="mx-auto max-w-4xl space-y-5 p-6">
                {Object.values(errors).map((error, index) => (
                    <p key={index} role="alert" className="text-destructive">
                        {String(error)}
                    </p>
                ))}
                {messages.data.length === 0 && (
                    <p className="py-12 text-center text-muted-foreground">
                        Tous les messages ont été examinés.
                    </p>
                )}
                {messages.data.map((message) => (
                    <article
                        key={message.id}
                        className="space-y-4 rounded-2xl border bg-card p-5"
                    >
                        <div className="flex flex-wrap justify-between gap-2">
                            <h2 className="font-semibold">
                                {message.sender} → {message.recipient}
                            </h2>
                            <span className="text-xs text-muted-foreground">
                                {new Date(message.created_at).toLocaleString(
                                    'fr-FR',
                                )}
                            </span>
                        </div>
                        <p className="rounded-xl bg-muted p-4 text-sm break-words whitespace-pre-wrap">
                            {message.content}
                        </p>
                        {message.conflict && (
                            <p
                                role="status"
                                className="text-sm text-destructive"
                            >
                                Conflit ouvert : diffusion suspendue jusqu’à
                                résolution du signalement.
                            </p>
                        )}
                        <label className="block text-sm">
                            Motif du refus
                            <textarea
                                className="mt-2 block w-full rounded-lg border bg-background p-2"
                                maxLength={1000}
                                value={reasons[message.id] ?? ''}
                                onChange={(event) =>
                                    setReasons((current) => ({
                                        ...current,
                                        [message.id]: event.target.value,
                                    }))
                                }
                            />
                        </label>
                        <div className="flex flex-wrap gap-2">
                            <Button
                                disabled={busy || message.conflict}
                                onClick={() => decide(message.id, 'approve')}
                            >
                                J’ai vérifié · Valider
                            </Button>
                            <Button
                                variant="outline"
                                disabled={
                                    busy ||
                                    (reasons[message.id]?.trim().length ?? 0) <
                                        3
                                }
                                onClick={() => decide(message.id, 'reject')}
                            >
                                Refuser le message
                            </Button>
                        </div>
                    </article>
                ))}
                <nav aria-label="Pagination" className="flex flex-wrap gap-2">
                    {messages.links.map(
                        (link, index) =>
                            link.url && (
                                <Link
                                    key={index}
                                    href={link.url}
                                    className={`rounded-lg border px-3 py-2 text-sm ${link.active ? 'bg-muted font-semibold' : ''}`}
                                >
                                    <span
                                        dangerouslySetInnerHTML={{
                                            __html: link.label,
                                        }}
                                    />
                                </Link>
                            ),
                    )}
                </nav>
            </div>
        </AdminLayout>
    );
}
