import AdminLayout, {
    AdminBadge,
    AdminButton,
    AdminCard,
} from '@/layouts/admin-layout';
import { Head, Link, router } from '@inertiajs/react';
import { Check, ShieldCheck, X } from 'lucide-react';
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

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface Props {
    verifications: {
        data: Verification[];
        links: PaginationLink[];
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
            actions={
                <AdminBadge tone={verifications.total > 0 ? 'warning' : 'success'}>
                    {verifications.total} en attente
                </AdminBadge>
            }
        >
            <Head title="Vérifications · Admin" />

            <AdminCard className="mb-5">
                <p className="text-sm" style={{ color: 'var(--ink-soft)' }}>
                    Vérifiez que le code affiché sous chaque photo correspond bien à
                    celui écrit sur la feuille tenue par la personne. Un code absent ou
                    différent signale une photo qui n&apos;a pas été prise pour cette
                    demande — refusez-la.
                </p>
                <p className="mt-2 text-sm" style={{ color: 'var(--ink-soft)' }}>
                    Ces selfies sont des données d&apos;identité sensibles. Ils sont
                    servis uniquement à la modération, jamais publiés, et ne doivent pas
                    être téléchargés ni partagés hors de cette console.
                </p>
            </AdminCard>

            {verifications.data.length === 0 ? (
                <AdminCard>
                    <div className="flex flex-col items-center gap-3 py-16 text-center">
                        <div
                            className="grid h-14 w-14 place-items-center rounded-full"
                            style={{
                                background: 'var(--blush)',
                                color: 'var(--wine-deep)',
                            }}
                        >
                            <ShieldCheck className="h-6 w-6" />
                        </div>
                        <h2 className="font-display text-2xl font-medium italic">
                            File vide
                        </h2>
                        <p
                            className="max-w-md text-sm"
                            style={{ color: 'var(--ink-mute)' }}
                        >
                            Toutes les demandes de vérification ont été traitées.
                        </p>
                    </div>
                </AdminCard>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {verifications.data.map((verification) => (
                        <VerificationCard
                            key={verification.id}
                            verification={verification}
                        />
                    ))}
                </div>
            )}

            {verifications.links.length > 3 && (
                <div className="mt-6 flex flex-wrap justify-center gap-1">
                    {verifications.links.map((link, i) => (
                        <Link
                            key={i}
                            href={link.url ?? '#'}
                            preserveScroll
                            className="inline-grid h-8 min-w-[32px] place-items-center rounded-md border px-2 text-xs font-semibold"
                            style={{
                                borderColor: link.active
                                    ? 'var(--wine-deep)'
                                    : 'var(--line)',
                                background: link.active
                                    ? 'var(--wine-deep)'
                                    : 'var(--paper)',
                                color: link.active
                                    ? 'oklch(96% 0.02 50)'
                                    : 'var(--ink-soft)',
                                pointerEvents: link.url ? undefined : 'none',
                                opacity: link.url ? 1 : 0.4,
                            }}
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    ))}
                </div>
            )}
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
            <div
                className="relative aspect-[4/5] overflow-hidden"
                style={{ background: 'var(--bg-soft)' }}
            >
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
                            className="block truncate text-sm font-semibold underline decoration-dotted underline-offset-2"
                        >
                            {verification.user.pseudo}
                        </Link>
                    ) : (
                        <span
                            className="text-sm font-semibold"
                            style={{ color: 'var(--ink-mute)' }}
                        >
                            Compte supprimé
                        </span>
                    )}
                    <p
                        className="font-mono mt-1 text-[10px] uppercase tracking-wider"
                        style={{ color: 'var(--ink-mute)' }}
                    >
                        {new Date(verification.created_at).toLocaleString('fr-FR')}
                    </p>
                </div>

                <div
                    className="rounded-lg border px-3 py-2 text-center"
                    style={{
                        borderColor: verification.challenge_code
                            ? 'var(--line)'
                            : 'var(--desire)',
                        background: 'var(--bg-soft)',
                    }}
                >
                    <div
                        className="editorial-caption mb-1"
                        style={{ color: 'var(--ink-mute)' }}
                    >
                        Code attendu
                    </div>
                    {verification.challenge_code ? (
                        <p className="font-mono break-all text-lg font-bold tracking-[0.2em]">
                            {verification.challenge_code}
                        </p>
                    ) : (
                        <p
                            className="text-xs font-semibold"
                            style={{ color: 'var(--desire-deep)' }}
                        >
                            Demande antérieure au dispositif
                        </p>
                    )}
                </div>

                {rejecting ? (
                    <div className="flex flex-col gap-2">
                        <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            rows={3}
                            maxLength={1000}
                            autoFocus
                            className="w-full rounded-lg border p-2 text-xs"
                            style={{
                                borderColor: 'var(--line)',
                                background: 'var(--bg-soft)',
                                color: 'var(--ink)',
                            }}
                            placeholder="Motif du refus (communiqué à l'utilisatrice)"
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
                                onClick={() => setRejecting(false)}
                            >
                                Annuler
                            </AdminButton>
                        </div>
                    </div>
                ) : (
                    <div className="flex gap-2">
                        <AdminButton
                            size="sm"
                            variant="wine"
                            icon={Check}
                            disabled={processing}
                            onClick={approve}
                        >
                            Vérifier
                        </AdminButton>
                        <AdminButton
                            size="sm"
                            icon={X}
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
