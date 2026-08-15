import AdminLayout, {
    AdminBadge,
    AdminButton,
    AdminCard,
    AdminEmpty,
    AdminMeta,
    AdminPagination,
} from '@/layouts/admin-layout';
import { Head, Link, router } from '@inertiajs/react';
import { Check, Lock, ShieldCheck, X } from 'lucide-react';
import { useState } from 'react';

interface VerificationUser {
    id: number;
    name: string;
    pseudo: string;
    email: string;
    is_verified: boolean;
}

interface Verification {
    id: number;
    image_url: string;
    challenge_code: string | null;
    created_at: string;
    user: VerificationUser | null;
}

interface Props {
    verifications: {
        data: Verification[];
        from: number | null;
        to: number | null;
        last_page: number;
        links: Array<{ url: string | null; label: string; active: boolean }>;
        total: number;
    };
}

export default function Index({ verifications }: Props) {
    return (
        <AdminLayout
            title="Vérifications"
            subtitle="Confirmer que le selfie correspond bien aux photos du profil"
            breadcrumbs={[
                { label: 'Admin', href: '/admin/dashboard' },
                { label: 'Modération', href: '/admin/moderation' },
                { label: 'Vérifications' },
            ]}
            hideSearch
            actions={
                <AdminBadge tone={verifications.total > 0 ? 'warning' : 'success'}>
                    {verifications.total} en attente
                </AdminBadge>
            }
        >
            <Head title="Vérifications · Admin" />

            <div className="space-y-4">
                {/* Consigne de modération + rappel RGPD */}
                <div className="flex flex-wrap items-start gap-3 rounded-2xl border border-[color:var(--line)] bg-[color:var(--paper)] p-5">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[color:var(--blush)] text-[color:var(--wine-deep)]">
                        <Lock className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1 space-y-2">
                        <p className="text-sm text-[color:var(--ink-soft)]">
                            Vérifie que le code affiché sous chaque photo correspond bien
                            à celui écrit sur la feuille tenue par la personne. Un code
                            absent ou différent signale une photo qui n&apos;a pas été
                            prise pour cette demande — refuse-la.
                        </p>
                        <p className="text-sm text-[color:var(--ink-mute)]">
                            Ces selfies sont des données d&apos;identité sensibles. Ils
                            sont servis uniquement à la modération, jamais publiés, et ne
                            doivent pas être téléchargés ni partagés hors de cette
                            console.
                        </p>
                    </div>
                </div>

                {verifications.data.length === 0 ? (
                    <AdminCard padded={false}>
                        <AdminEmpty
                            icon={ShieldCheck}
                            title="File vide"
                            description="Toutes les demandes de vérification ont été traitées."
                            action={
                                <AdminButton size="sm" href="/admin/moderation">
                                    Retour à la modération
                                </AdminButton>
                            }
                        />
                    </AdminCard>
                ) : (
                    <>
                        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                            {verifications.data.map((verification) => (
                                <VerificationCard
                                    key={verification.id}
                                    verification={verification}
                                />
                            ))}
                        </div>

                        <AdminCard padded={false}>
                            <AdminPagination
                                from={verifications.from}
                                to={verifications.to}
                                total={verifications.total}
                                lastPage={verifications.last_page}
                                links={verifications.links}
                            />
                        </AdminCard>
                    </>
                )}
            </div>
        </AdminLayout>
    );
}

function VerificationCard({ verification }: { verification: Verification }) {
    const [processing, setProcessing] = useState(false);
    const [rejecting, setRejecting] = useState(false);
    const [reason, setReason] = useState('');

    const approve = () => {
        setProcessing(true);
        router.post(
            `/admin/verifications/${verification.id}/approve`,
            {},
            { preserveScroll: true, onFinish: () => setProcessing(false) },
        );
    };

    const reject = () => {
        if (!reason.trim()) {
            return;
        }

        setProcessing(true);
        router.post(
            `/admin/verifications/${verification.id}/reject`,
            { rejection_reason: reason },
            { preserveScroll: true, onFinish: () => setProcessing(false) },
        );
    };

    return (
        <AdminCard padded={false}>
            <div className="aspect-[4/5] overflow-hidden bg-[color:var(--bg-soft)]">
                <img
                    src={verification.image_url}
                    alt={`Selfie de vérification de ${verification.user?.pseudo ?? 'un compte supprimé'}`}
                    className="h-full w-full object-cover"
                    loading="lazy"
                />
            </div>

            <div className="flex flex-col gap-3 p-4">
                <div className="min-w-0">
                    {verification.user ? (
                        <Link
                            href={`/admin/users/${verification.user.id}`}
                            className="block truncate text-sm font-semibold text-[color:var(--ink)] underline decoration-dotted underline-offset-2"
                        >
                            {verification.user.pseudo || verification.user.name}
                        </Link>
                    ) : (
                        <span className="text-sm font-semibold text-[color:var(--ink-mute)]">
                            Compte supprimé
                        </span>
                    )}
                    <AdminMeta>
                        {new Date(verification.created_at).toLocaleString('fr-FR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                        })}
                    </AdminMeta>
                </div>

                <div
                    className={`rounded-lg border bg-[color:var(--bg-soft)] px-3 py-2 text-center ${
                        verification.challenge_code
                            ? 'border-[color:var(--line)]'
                            : 'border-[color:var(--desire)]'
                    }`}
                >
                    <div className="editorial-caption mb-1 text-[color:var(--ink-mute)]">
                        Code attendu
                    </div>
                    {verification.challenge_code ? (
                        <p className="font-mono break-all text-lg font-bold tracking-[0.2em] text-[color:var(--ink)]">
                            {verification.challenge_code}
                        </p>
                    ) : (
                        <p className="text-xs font-semibold text-[color:var(--desire-deep)]">
                            Demande antérieure au dispositif
                        </p>
                    )}
                </div>

                {rejecting ? (
                    <div className="flex flex-col gap-2">
                        <textarea
                            value={reason}
                            onChange={(event) => setReason(event.target.value)}
                            rows={3}
                            maxLength={1000}
                            autoFocus
                            placeholder="Motif du refus (communiqué à l'utilisatrice)"
                            className="w-full rounded-lg border border-[color:var(--line)] bg-[color:var(--bg-soft)] p-2 text-xs text-[color:var(--ink)] outline-none focus:border-[color:var(--desire)]"
                        />
                        <div className="flex gap-2">
                            <AdminButton
                                size="sm"
                                variant="danger"
                                disabled={processing || !reason.trim()}
                                onClick={reject}
                            >
                                Confirmer le refus
                            </AdminButton>
                            <AdminButton
                                size="sm"
                                variant="ghost"
                                disabled={processing}
                                onClick={() => {
                                    setRejecting(false);
                                    setReason('');
                                }}
                            >
                                Annuler
                            </AdminButton>
                        </div>
                    </div>
                ) : (
                    <div className="flex gap-2">
                        <AdminButton
                            size="sm"
                            variant="success"
                            icon={Check}
                            className="flex-1"
                            disabled={processing}
                            onClick={approve}
                        >
                            Vérifier
                        </AdminButton>
                        <AdminButton
                            size="sm"
                            variant="danger"
                            icon={X}
                            className="flex-1"
                            disabled={processing}
                            onClick={() => setRejecting(true)}
                        >
                            Refuser
                        </AdminButton>
                    </div>
                )}
            </div>
        </AdminCard>
    );
}
