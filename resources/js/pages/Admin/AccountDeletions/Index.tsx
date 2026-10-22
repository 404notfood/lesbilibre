import { Button } from '@/components/ui/button';
import AdminLayout from '@/layouts/admin-layout';
import { router, usePage } from '@inertiajs/react';
import { useState } from 'react';

interface DeletionRequest {
    id: number;
    pseudo: string;
    status: string;
    billing_pending: boolean;
    failure_stage: string | null;
    created_at: string;
}

export default function Index({ requests }: { requests: DeletionRequest[] }) {
    const [confirmation, setConfirmation] = useState<Record<number, string>>(
        {},
    );
    const [busy, setBusy] = useState(false);
    const { errors } = usePage().props;
    return (
        <AdminLayout
            title="Suppressions de compte"
            subtitle="Les comptes fermés restent suspendus jusqu’à votre décision d’effacement."
        >
            <div className="mx-auto max-w-4xl space-y-5 p-6">
                <p className="rounded-xl border bg-card p-4 text-sm text-muted-foreground">
                    L’effacement retire les fichiers et anonymise le compte. Les
                    preuves faisant l’objet d’un signalement restent conservées
                    pour la modération.
                </p>
                {Object.values(errors).map((error, index) => (
                    <p
                        key={index}
                        role="alert"
                        className="text-sm text-destructive"
                    >
                        {String(error)}
                    </p>
                ))}
                {requests.length === 0 && (
                    <p className="py-12 text-center text-muted-foreground">
                        Aucune demande en attente.
                    </p>
                )}
                {requests.map((item) => (
                    <form
                        key={item.id}
                        className="space-y-4 rounded-2xl border bg-card p-5"
                        onSubmit={(event) => {
                            event.preventDefault();
                            setBusy(true);
                            router.delete(
                                `/admin/account-deletions/${item.id}`,
                                {
                                    data: {
                                        confirmation: confirmation[item.id],
                                    },
                                    preserveScroll: true,
                                    onFinish: () => setBusy(false),
                                },
                            );
                        }}
                    >
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <h2 className="text-lg font-semibold">
                                {item.pseudo}
                            </h2>
                            <span className="text-xs text-muted-foreground">
                                {new Date(item.created_at).toLocaleDateString(
                                    'fr-FR',
                                )}
                            </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            {item.status === 'failed'
                                ? `Effacement à reprendre (${item.failure_stage ?? 'opération incomplète'})`
                                : 'Compte fermé · validation administrateur requise'}
                            {item.billing_pending
                                ? ' · arrêt de facturation à reprendre'
                                : ''}
                        </p>
                        <label className="block text-sm">
                            Saisissez EFFACER pour confirmer l’effacement
                            définitif
                            <input
                                className="mt-2 block w-full rounded-lg border bg-background p-2"
                                value={confirmation[item.id] ?? ''}
                                onChange={(event) =>
                                    setConfirmation((current) => ({
                                        ...current,
                                        [item.id]: event.target.value,
                                    }))
                                }
                                autoComplete="off"
                            />
                        </label>
                        <Button
                            type="submit"
                            variant="destructive"
                            disabled={
                                busy || confirmation[item.id] !== 'EFFACER'
                            }
                        >
                            Effacer définitivement
                        </Button>
                    </form>
                ))}
            </div>
        </AdminLayout>
    );
}
