import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useClipboard } from '@/hooks/use-clipboard';
import DatingLayout from '@/layouts/dating-layout';
import { Head, Link } from '@inertiajs/react';
import { Check, Copy, Gem, Gift, Hourglass, ShieldCheck, UserPlus } from 'lucide-react';

interface Program {
    enabled: boolean;
    code: string;
    url: string;
    referrer_reward: number;
    referred_reward: number;
}

interface Referral {
    id: number;
    pseudo: string;
    status: 'pending' | 'rewarded';
    reward: number;
    created_at: string;
    rewarded_at: string | null;
}

interface Pagination {
    data: Referral[];
    links: Array<{ url: string | null; label: string; active: boolean }>;
}

interface Props {
    program: Program;
    stats: {
        total: number;
        pending: number;
        rewarded: number;
        gems_earned: number;
    };
    referrals: Pagination;
}

const dateFormatter = new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
});

export default function Index({ program, stats, referrals }: Props) {
    const [copiedText, copy] = useClipboard();
    const copied = copiedText === program.url;

    return (
        <DatingLayout title="Inviter une amie" showOnlineUsers={false}>
            <Head title="Parrainage" />

            <div className="space-y-6 p-4 sm:p-6">
                <section className="overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/15 via-background to-amber-500/10 p-6 sm:p-8">
                    <div className="max-w-2xl space-y-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                            <UserPlus className="h-6 w-6" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-semibold sm:text-3xl">
                                Les belles rencontres se partagent
                            </h1>
                            <p className="mt-2 text-muted-foreground">
                                Invitez une amie. Dès que son profil est vérifié, vous gagnez{' '}
                                <strong className="text-foreground">
                                    {program.referrer_reward} gemmes
                                </strong>{' '}
                                et elle reçoit un bonus de{' '}
                                <strong className="text-foreground">
                                    {program.referred_reward} gemmes
                                </strong>.
                            </p>
                        </div>

                        {program.enabled ? (
                            <div className="space-y-3">
                                <div className="flex flex-col gap-2 sm:flex-row">
                                    <div className="min-w-0 flex-1 rounded-xl border bg-background/80 px-4 py-3 font-mono text-sm break-all">
                                        {program.url}
                                    </div>
                                    <Button
                                        type="button"
                                        className="shrink-0"
                                        onClick={() => void copy(program.url)}
                                    >
                                        {copied ? (
                                            <Check className="mr-2 h-4 w-4" />
                                        ) : (
                                            <Copy className="mr-2 h-4 w-4" />
                                        )}
                                        {copied ? 'Lien copié' : 'Copier le lien'}
                                    </Button>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Votre code personnel :{' '}
                                    <span className="font-mono font-semibold text-foreground">
                                        {program.code}
                                    </span>
                                </p>
                            </div>
                        ) : (
                            <p className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm">
                                Le programme d&apos;invitation est momentanément suspendu.
                            </p>
                        )}
                    </div>
                </section>

                <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <StatCard icon={UserPlus} label="Invitations" value={stats.total} />
                    <StatCard icon={Hourglass} label="En attente" value={stats.pending} />
                    <StatCard icon={ShieldCheck} label="Validées" value={stats.rewarded} />
                    <StatCard icon={Gem} label="Gemmes gagnées" value={stats.gems_earned} />
                </section>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Gift className="h-5 w-5 text-primary" />
                            Vos invitations
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {referrals.data.length === 0 ? (
                            <div className="rounded-2xl border border-dashed p-8 text-center">
                                <UserPlus className="mx-auto h-8 w-8 text-muted-foreground" />
                                <p className="mt-3 font-medium">Aucune invitation pour le moment</p>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Copiez votre lien et partagez-le directement avec une amie.
                                </p>
                            </div>
                        ) : (
                            <div className="divide-y">
                                {referrals.data.map((referral) => (
                                    <div
                                        key={referral.id}
                                        className="flex flex-wrap items-center justify-between gap-3 py-4"
                                    >
                                        <div>
                                            <p className="font-medium">{referral.pseudo}</p>
                                            <p className="text-xs text-muted-foreground">
                                                Invitée le{' '}
                                                {dateFormatter.format(new Date(referral.created_at))}
                                            </p>
                                        </div>
                                        {referral.status === 'rewarded' ? (
                                            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-300">
                                                <Check className="h-3.5 w-3.5" />
                                                +{referral.reward} gemmes
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-700 dark:text-amber-300">
                                                <Hourglass className="h-3.5 w-3.5" />
                                                Vérification en attente
                                            </span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

                        {referrals.links.length > 3 ? (
                            <nav className="mt-4 flex flex-wrap justify-center gap-1" aria-label="Pagination">
                                {referrals.links.map((link, index) =>
                                    link.url ? (
                                        <Link
                                            key={index}
                                            href={link.url}
                                            preserveScroll
                                            className={`rounded-lg border px-3 py-1.5 text-xs ${
                                                link.active ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                                            }`}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ) : null,
                                )}
                            </nav>
                        ) : null}
                    </CardContent>
                </Card>

                <p className="text-center text-xs text-muted-foreground">
                    Les récompenses sont versées une seule fois après validation manuelle du profil invité.
                </p>
            </div>
        </DatingLayout>
    );
}

function StatCard({
    icon: Icon,
    label,
    value,
}: {
    icon: typeof UserPlus;
    label: string;
    value: number;
}) {
    return (
        <Card>
            <CardContent className="flex items-center gap-4 p-5">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                </span>
                <div>
                    <p className="text-2xl font-semibold">{value.toLocaleString('fr-FR')}</p>
                    <p className="text-xs text-muted-foreground">{label}</p>
                </div>
            </CardContent>
        </Card>
    );
}
