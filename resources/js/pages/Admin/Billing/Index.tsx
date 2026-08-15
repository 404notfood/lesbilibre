import AdminLayout, {
    AdminBadge,
    AdminButton,
    AdminCard,
    AdminSectionTitle,
} from '@/layouts/admin-layout';
import { Head, router } from '@inertiajs/react';
import { AlertTriangle, Gem, Plus, Sparkles, Trash2, X } from 'lucide-react';
import { useState } from 'react';

interface EntitlementDefinition {
    key: string;
    label: string;
    hint: string;
    quota: boolean;
    unit?: string;
    default?: number;
}

type Entitlements = Record<string, boolean | number | null>;

interface Plan {
    id: number;
    slug: string;
    name: string;
    tagline: string | null;
    duration_months: number;
    price: number;
    price_per_month: number;
    stripe_price_id: string | null;
    perks: string[];
    entitlements: Entitlements;
    gems_on_signup: number;
    gems_per_month: number;
    is_active: boolean;
    is_featured: boolean;
    display_order: number;
    is_purchasable: boolean;
    active_subscriptions: number;
}

interface Package {
    id: number;
    name: string;
    amount: number;
    bonus: number;
    total_gems: number;
    price: number;
    is_active: boolean;
    is_featured: boolean;
    display_order: number;
}

type PlanDraft = Omit<
    Plan,
    'id' | 'price_per_month' | 'is_purchasable' | 'active_subscriptions'
>;
type PackageDraft = Omit<Package, 'id' | 'total_gems'>;

const emptyPlan: PlanDraft = {
    slug: '',
    name: '',
    tagline: '',
    duration_months: 1,
    price: 19.99,
    stripe_price_id: '',
    perks: [],
    entitlements: {},
    gems_on_signup: 0,
    gems_per_month: 0,
    is_active: true,
    is_featured: false,
    display_order: 0,
};

const emptyPackage: PackageDraft = {
    name: '',
    amount: 100,
    bonus: 0,
    price: 4.99,
    is_active: true,
    is_featured: false,
    display_order: 0,
};

export default function Index({
    plans,
    packages,
    entitlementCatalog,
    freeLimits,
}: {
    plans: Plan[];
    packages: Package[];
    entitlementCatalog: EntitlementDefinition[];
    freeLimits: Record<string, boolean | number>;
}) {
    const [editingPlan, setEditingPlan] = useState<Plan | 'new' | null>(null);
    const [editingPackage, setEditingPackage] = useState<Package | 'new' | null>(null);

    const missingStripe = plans.filter((p) => p.is_active && !p.is_purchasable);

    return (
        <AdminLayout
            title="Offres & tarifs"
            subtitle="Plans premium, packs de gemmes, avantages et mise en avant"
            breadcrumbs={[
                { label: 'Admin', href: '/admin/dashboard' },
                { label: 'Offres & tarifs' },
            ]}
            hideSearch
        >
            <Head title="Offres & tarifs · Admin" />

            {missingStripe.length > 0 && (
                <div className="mb-4 flex items-start gap-3 rounded-2xl border border-[color:var(--desire)] bg-[color:var(--blush)] p-4 text-sm text-[color:var(--wine-deep)]">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                    <div>
                        <p className="font-semibold">
                            {missingStripe.length} plan
                            {missingStripe.length > 1 ? 's' : ''} sans identifiant
                            Stripe
                        </p>
                        <p className="mt-1">
                            {missingStripe.map((p) => p.name).join(', ')} —
                            {missingStripe.length > 1
                                ? ' ces plans sont'
                                : ' ce plan est'}{' '}
                            visible{missingStripe.length > 1 ? 's' : ''} sur la page
                            premium mais le paiement échouera. Crée le prix dans ton
                            tableau de bord Stripe, puis colle son identifiant (price_…)
                            ici.
                        </p>
                    </div>
                </div>
            )}

            {/* ---- Rappel du palier gratuit --------------------------- */}
            <AdminCard className="mb-4">
                <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
                    <div className="min-w-0 flex-1">
                        <div className="editorial-caption text-[color:var(--ink-mute)]">
                            Compte gratuit
                        </div>
                        <p className="mt-1 text-xs text-[color:var(--ink-mute)]">
                            Valeurs de référence, définies dans{' '}
                            <code className="font-mono">config/entitlements.php</code>
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-6">
                        <div>
                            <div className="font-display text-2xl font-medium text-[color:var(--ink)]">
                                {String(freeLimits.likes_per_day ?? '—')}
                            </div>
                            <div className="text-[11px] text-[color:var(--ink-mute)]">
                                likes / jour
                            </div>
                        </div>
                        <div>
                            <div className="font-display text-2xl font-medium text-[color:var(--ink)]">
                                {String(freeLimits.first_messages_per_day ?? '—')}
                            </div>
                            <div className="text-[11px] text-[color:var(--ink-mute)]">
                                nouvelles conversations / jour
                            </div>
                        </div>
                        <div>
                            <div className="font-display text-2xl font-medium text-[color:var(--ink)]">
                                {plans.filter((plan) => plan.is_active).length}
                            </div>
                            <div className="text-[11px] text-[color:var(--ink-mute)]">
                                plans actifs
                            </div>
                        </div>
                        <div>
                            <div className="font-display text-2xl font-medium text-[color:var(--ink)]">
                                {packages.filter((pack) => pack.is_active).length}
                            </div>
                            <div className="text-[11px] text-[color:var(--ink-mute)]">
                                packs actifs
                            </div>
                        </div>
                    </div>
                </div>
            </AdminCard>

            {/* ---- Plans premium ------------------------------------- */}
            <section className="mb-8">
                <AdminSectionTitle
                    eyebrow={`${plans.length} plan${plans.length > 1 ? 's' : ''}`}
                    title="Abonnements premium"
                    right={
                        <AdminButton
                            size="sm"
                            variant="wine"
                            icon={Plus}
                            onClick={() => setEditingPlan('new')}
                        >
                            Nouveau plan
                        </AdminButton>
                    }
                />

                <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
                    {plans.map((plan) => (
                        <PlanCard
                            key={plan.id}
                            plan={plan}
                            onEdit={() => setEditingPlan(plan)}
                        />
                    ))}
                </div>

                {plans.length === 0 && (
                    <AdminCard>
                        <p
                            className="py-8 text-center text-sm"
                            style={{ color: 'var(--ink-mute)' }}
                        >
                            Aucun plan. Créez-en un pour activer les abonnements.
                        </p>
                    </AdminCard>
                )}
            </section>

            {/* ---- Packs de gemmes ----------------------------------- */}
            <section>
                <AdminSectionTitle
                    eyebrow={`${packages.length} pack${packages.length > 1 ? 's' : ''}`}
                    title="Packs de gemmes"
                    right={
                        <AdminButton
                            size="sm"
                            variant="wine"
                            icon={Plus}
                            onClick={() => setEditingPackage('new')}
                        >
                            Nouveau pack
                        </AdminButton>
                    }
                />

                <AdminCard padded={false}>
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[720px] text-left text-sm">
                            <thead
                                className="border-b"
                                style={{
                                    borderColor: 'var(--line)',
                                    background: 'var(--bg-soft)',
                                    color: 'var(--ink-mute)',
                                }}
                            >
                                <tr>
                                    <th className="p-4 font-medium">Nom</th>
                                    <th className="p-4 text-right font-medium">Gemmes</th>
                                    <th className="p-4 text-right font-medium">Bonus</th>
                                    <th className="p-4 text-right font-medium">Total</th>
                                    <th className="p-4 text-right font-medium">Prix</th>
                                    <th className="p-4 font-medium">Statut</th>
                                    <th className="p-4" />
                                </tr>
                            </thead>
                            <tbody>
                                {packages.map((pack) => (
                                    <tr
                                        key={pack.id}
                                        className="border-b last:border-0"
                                        style={{ borderColor: 'var(--line-soft)' }}
                                    >
                                        <td className="p-4 font-medium">
                                            {pack.name}
                                            {pack.is_featured && (
                                                <span className="ml-2">
                                                    <AdminBadge tone="gold">
                                                        Populaire
                                                    </AdminBadge>
                                                </span>
                                            )}
                                        </td>
                                        <td className="font-mono p-4 text-right">
                                            {pack.amount.toLocaleString('fr-FR')}
                                        </td>
                                        <td
                                            className="font-mono p-4 text-right"
                                            style={{ color: 'var(--success)' }}
                                        >
                                            {pack.bonus > 0
                                                ? `+${pack.bonus.toLocaleString('fr-FR')}`
                                                : '—'}
                                        </td>
                                        <td className="font-mono p-4 text-right font-semibold">
                                            {pack.total_gems.toLocaleString('fr-FR')}
                                        </td>
                                        <td className="font-mono p-4 text-right">
                                            {pack.price.toLocaleString('fr-FR', {
                                                minimumFractionDigits: 2,
                                            })}{' '}
                                            €
                                        </td>
                                        <td className="p-4">
                                            <AdminBadge
                                                tone={pack.is_active ? 'success' : 'neutral'}
                                            >
                                                {pack.is_active ? 'Actif' : 'Masqué'}
                                            </AdminBadge>
                                        </td>
                                        <td className="p-4 text-right">
                                            <AdminButton
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => setEditingPackage(pack)}
                                            >
                                                Modifier
                                            </AdminButton>
                                        </td>
                                    </tr>
                                ))}
                                {packages.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={7}
                                            className="p-8 text-center text-sm"
                                            style={{ color: 'var(--ink-mute)' }}
                                        >
                                            Aucun pack de gemmes.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </AdminCard>
            </section>

            {editingPlan && (
                <PlanDialog
                    plan={editingPlan === 'new' ? null : editingPlan}
                    catalog={entitlementCatalog}
                    onClose={() => setEditingPlan(null)}
                />
            )}
            {editingPackage && (
                <PackageDialog
                    pack={editingPackage === 'new' ? null : editingPackage}
                    onClose={() => setEditingPackage(null)}
                />
            )}
        </AdminLayout>
    );
}

/* ------------------------------------------------------------------ */

function PlanCard({ plan, onEdit }: { plan: Plan; onEdit: () => void }) {
    return (
        <AdminCard>
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5">
                        <h3 className="font-display text-xl font-medium">{plan.name}</h3>
                        {plan.is_featured && <AdminBadge tone="gold">Mise en avant</AdminBadge>}
                        <AdminBadge tone={plan.is_active ? 'success' : 'neutral'}>
                            {plan.is_active ? 'Actif' : 'Masqué'}
                        </AdminBadge>
                    </div>
                    <p
                        className="font-mono mt-1 text-[10px] uppercase tracking-wider"
                        style={{ color: 'var(--ink-mute)' }}
                    >
                        {plan.slug}
                    </p>
                </div>
                <AdminButton size="sm" variant="ghost" onClick={onEdit}>
                    Modifier
                </AdminButton>
            </div>

            <div className="mt-4 flex items-baseline gap-2">
                <span className="font-display text-3xl font-medium">
                    {plan.price.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
                </span>
                <span className="text-sm" style={{ color: 'var(--ink-mute)' }}>
                    / {plan.duration_months} mois
                </span>
            </div>
            <p className="mt-1 text-xs" style={{ color: 'var(--ink-mute)' }}>
                soit{' '}
                {plan.price_per_month.toLocaleString('fr-FR', {
                    minimumFractionDigits: 2,
                })}{' '}
                € par mois
            </p>

            {plan.tagline && (
                <p className="mt-3 text-sm" style={{ color: 'var(--ink-soft)' }}>
                    {plan.tagline}
                </p>
            )}

            {plan.perks.length > 0 && (
                <ul className="mt-3 flex flex-col gap-1">
                    {plan.perks.map((perk) => (
                        <li
                            key={perk}
                            className="flex items-start gap-1.5 text-xs"
                            style={{ color: 'var(--ink-soft)' }}
                        >
                            <Sparkles
                                className="mt-0.5 h-3 w-3 shrink-0"
                                style={{ color: 'var(--gold)' }}
                            />
                            {perk}
                        </li>
                    ))}
                </ul>
            )}

            {(plan.gems_on_signup > 0 || plan.gems_per_month > 0) && (
                <p
                    className="mt-3 inline-flex items-center gap-1.5 text-xs"
                    style={{ color: 'var(--wine-deep)' }}
                >
                    <Gem className="h-3 w-3" />
                    {plan.gems_on_signup > 0 && `${plan.gems_on_signup} à la souscription`}
                    {plan.gems_on_signup > 0 && plan.gems_per_month > 0 && ' · '}
                    {plan.gems_per_month > 0 && `${plan.gems_per_month} par mois`}
                </p>
            )}

            <div
                className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t pt-3 text-xs"
                style={{ borderColor: 'var(--line)', color: 'var(--ink-mute)' }}
            >
                <span>
                    {plan.active_subscriptions} abonnement
                    {plan.active_subscriptions > 1 ? 's' : ''} actif
                    {plan.active_subscriptions > 1 ? 's' : ''}
                </span>
                {!plan.is_purchasable && plan.is_active && (
                    <AdminBadge tone="danger">Stripe manquant</AdminBadge>
                )}
            </div>
        </AdminCard>
    );
}

/* ------------------------------------------------------------------ */

function Dialog({
    title,
    onClose,
    children,
}: {
    title: string;
    onClose: () => void;
    children: React.ReactNode;
}) {
    return (
        <div
            className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 pt-[6vh]"
            style={{ background: 'oklch(0% 0 0 / 0.5)' }}
            onClick={onClose}
        >
            <div
                className="w-full max-w-lg rounded-2xl border p-6"
                style={{ borderColor: 'var(--line)', background: 'var(--paper)' }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="mb-5 flex items-center justify-between gap-4">
                    <h2 className="font-display text-2xl font-medium">{title}</h2>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Fermer"
                        className="grid h-8 w-8 place-items-center rounded-lg"
                        style={{ background: 'var(--bg-soft)' }}
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
                {children}
            </div>
        </div>
    );
}

function Field({
    label,
    hint,
    children,
}: {
    label: string;
    hint?: string;
    children: React.ReactNode;
}) {
    return (
        <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold">{label}</span>
            {children}
            {hint && (
                <span className="text-[11px]" style={{ color: 'var(--ink-mute)' }}>
                    {hint}
                </span>
            )}
        </label>
    );
}

const inputStyle = {
    borderColor: 'var(--line)',
    background: 'var(--bg-soft)',
    color: 'var(--ink)',
} as const;

const inputClass = 'w-full rounded-lg border px-3 py-2 text-sm';

function PlanDialog({
    plan,
    catalog,
    onClose,
}: {
    plan: Plan | null;
    catalog: EntitlementDefinition[];
    onClose: () => void;
}) {
    const [form, setForm] = useState<PlanDraft>(
        plan
            ? {
                  slug: plan.slug,
                  name: plan.name,
                  tagline: plan.tagline ?? '',
                  duration_months: plan.duration_months,
                  price: plan.price,
                  stripe_price_id: plan.stripe_price_id ?? '',
                  perks: plan.perks,
                  entitlements: plan.entitlements ?? {},
                  gems_on_signup: plan.gems_on_signup,
                  gems_per_month: plan.gems_per_month,
                  is_active: plan.is_active,
                  is_featured: plan.is_featured,
                  display_order: plan.display_order,
              }
            : emptyPlan,
    );
    const [perkDraft, setPerkDraft] = useState('');
    const [processing, setProcessing] = useState(false);

    const set = <K extends keyof PlanDraft>(key: K, value: PlanDraft[K]) =>
        setForm((f) => ({ ...f, [key]: value }));

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);

        const options = {
            preserveScroll: true,
            onSuccess: onClose,
            onFinish: () => setProcessing(false),
        };

        if (plan) {
            router.put(`/admin/billing/plans/${plan.id}`, form, options);
        } else {
            router.post('/admin/billing/plans', form, options);
        }
    };

    const destroy = () => {
        if (!plan) return;
        if (!confirm(`Supprimer définitivement le plan « ${plan.name} » ?`)) return;
        router.delete(`/admin/billing/plans/${plan.id}`, {
            preserveScroll: true,
            onSuccess: onClose,
        });
    };

    return (
        <Dialog title={plan ? 'Modifier le plan' : 'Nouveau plan'} onClose={onClose}>
            <form onSubmit={submit} className="flex flex-col gap-4">
                <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Nom affiché">
                        <input
                            required
                            maxLength={80}
                            value={form.name}
                            onChange={(e) => set('name', e.target.value)}
                            className={inputClass}
                            style={inputStyle}
                            placeholder="3 mois"
                        />
                    </Field>
                    <Field label="Identifiant" hint="Minuscules, chiffres et tirets">
                        <input
                            required
                            maxLength={60}
                            pattern="[a-z0-9\-]+"
                            value={form.slug}
                            onChange={(e) => set('slug', e.target.value)}
                            className={inputClass}
                            style={inputStyle}
                            placeholder="3-months"
                        />
                    </Field>
                </div>

                <Field label="Accroche commerciale">
                    <input
                        maxLength={160}
                        value={form.tagline ?? ''}
                        onChange={(e) => set('tagline', e.target.value)}
                        className={inputClass}
                        style={inputStyle}
                        placeholder="Le meilleur rapport qualité-prix"
                    />
                </Field>

                <div className="grid gap-4 sm:grid-cols-3">
                    <Field label="Prix total (€)">
                        <input
                            required
                            type="number"
                            step="0.01"
                            min="0"
                            value={form.price}
                            onChange={(e) => set('price', Number(e.target.value))}
                            className={inputClass}
                            style={inputStyle}
                        />
                    </Field>
                    <Field label="Durée (mois)">
                        <input
                            required
                            type="number"
                            min="1"
                            max="60"
                            value={form.duration_months}
                            onChange={(e) =>
                                set('duration_months', Number(e.target.value))
                            }
                            className={inputClass}
                            style={inputStyle}
                        />
                    </Field>
                    <Field label="Ordre">
                        <input
                            required
                            type="number"
                            min="0"
                            value={form.display_order}
                            onChange={(e) =>
                                set('display_order', Number(e.target.value))
                            }
                            className={inputClass}
                            style={inputStyle}
                        />
                    </Field>
                </div>

                <Field
                    label="Identifiant de prix Stripe"
                    hint="Créez le prix dans Stripe, puis collez son ID. Sans lui, le paiement échoue."
                >
                    <input
                        maxLength={120}
                        value={form.stripe_price_id ?? ''}
                        onChange={(e) => set('stripe_price_id', e.target.value)}
                        className={inputClass}
                        style={inputStyle}
                        placeholder="price_1AbCdEf…"
                    />
                </Field>

                <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Gemmes à la souscription">
                        <input
                            required
                            type="number"
                            min="0"
                            value={form.gems_on_signup}
                            onChange={(e) =>
                                set('gems_on_signup', Number(e.target.value))
                            }
                            className={inputClass}
                            style={inputStyle}
                        />
                    </Field>
                    <Field label="Gemmes par mois">
                        <input
                            required
                            type="number"
                            min="0"
                            value={form.gems_per_month}
                            onChange={(e) =>
                                set('gems_per_month', Number(e.target.value))
                            }
                            className={inputClass}
                            style={inputStyle}
                        />
                    </Field>
                </div>

                {/* Droits réellement appliqués */}
                <div className="flex flex-col gap-2">
                    <span className="text-xs font-semibold">
                        Ce que le plan débloque
                    </span>
                    <p className="text-[11px]" style={{ color: 'var(--ink-mute)' }}>
                        Ces réglages sont appliqués par l’application, pas seulement
                        affichés. Décoché = la membre retombe sur la limite du compte
                        gratuit.
                    </p>

                    <div
                        className="flex flex-col divide-y rounded-lg border"
                        style={{ borderColor: 'var(--line)' }}
                    >
                        {catalog.map((item) => {
                            const value = form.entitlements[item.key];

                            return (
                                <div
                                    key={item.key}
                                    className="flex flex-wrap items-center gap-3 p-3"
                                    style={{ borderColor: 'var(--line)' }}
                                >
                                    <label className="flex min-w-0 flex-1 cursor-pointer items-start gap-2">
                                        <input
                                            type="checkbox"
                                            className="mt-0.5"
                                            checked={
                                                item.quota
                                                    ? value !== undefined &&
                                                      value !== null
                                                    : value === true
                                            }
                                            onChange={(e) => {
                                                const next = { ...form.entitlements };
                                                if (!e.target.checked) {
                                                    delete next[item.key];
                                                } else {
                                                    next[item.key] = item.quota
                                                        ? (item.default ?? 0)
                                                        : true;
                                                }
                                                set('entitlements', next);
                                            }}
                                        />
                                        <span className="min-w-0">
                                            <span className="block text-sm font-medium">
                                                {item.label}
                                            </span>
                                            <span
                                                className="block text-[11px]"
                                                style={{ color: 'var(--ink-mute)' }}
                                            >
                                                {item.hint}
                                            </span>
                                        </span>
                                    </label>

                                    {item.quota &&
                                        value !== undefined &&
                                        value !== null && (
                                            <span className="flex shrink-0 items-center gap-2">
                                                <input
                                                    type="number"
                                                    min={0}
                                                    value={Number(value)}
                                                    onChange={(e) =>
                                                        set('entitlements', {
                                                            ...form.entitlements,
                                                            [item.key]: Number(
                                                                e.target.value,
                                                            ),
                                                        })
                                                    }
                                                    className="w-24 rounded-lg border px-2 py-1 text-sm"
                                                    style={inputStyle}
                                                />
                                                <span
                                                    className="text-[11px]"
                                                    style={{ color: 'var(--ink-mute)' }}
                                                >
                                                    {item.unit}
                                                </span>
                                            </span>
                                        )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Arguments commerciaux affichés sur la page premium */}
                <div className="flex flex-col gap-2">
                    <span className="text-xs font-semibold">
                        Arguments affichés sur la page premium
                    </span>
                    <p className="text-[11px]" style={{ color: 'var(--ink-mute)' }}>
                        Texte libre, purement commercial : n’accorde aucun droit.
                    </p>
                    {form.perks.length > 0 && (
                        <ul className="flex flex-col gap-1.5">
                            {form.perks.map((perk, i) => (
                                <li
                                    key={`${perk}-${i}`}
                                    className="flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm"
                                    style={{ borderColor: 'var(--line)' }}
                                >
                                    <span className="min-w-0 flex-1 truncate">
                                        {perk}
                                    </span>
                                    <button
                                        type="button"
                                        aria-label={`Retirer ${perk}`}
                                        onClick={() =>
                                            set(
                                                'perks',
                                                form.perks.filter((_, j) => j !== i),
                                            )
                                        }
                                        style={{ color: 'var(--desire-deep)' }}
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                    <div className="flex gap-2">
                        <input
                            value={perkDraft}
                            maxLength={120}
                            onChange={(e) => setPerkDraft(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    if (perkDraft.trim()) {
                                        set('perks', [...form.perks, perkDraft.trim()]);
                                        setPerkDraft('');
                                    }
                                }
                            }}
                            className={inputClass}
                            style={inputStyle}
                            placeholder="Likes illimités"
                        />
                        <AdminButton
                            size="sm"
                            onClick={() => {
                                if (perkDraft.trim()) {
                                    set('perks', [...form.perks, perkDraft.trim()]);
                                    setPerkDraft('');
                                }
                            }}
                        >
                            Ajouter
                        </AdminButton>
                    </div>
                </div>

                <div className="flex flex-wrap gap-4">
                    <label className="inline-flex items-center gap-2 text-sm">
                        <input
                            type="checkbox"
                            checked={form.is_active}
                            onChange={(e) => set('is_active', e.target.checked)}
                        />
                        Visible sur la page premium
                    </label>
                    <label className="inline-flex items-center gap-2 text-sm">
                        <input
                            type="checkbox"
                            checked={form.is_featured}
                            onChange={(e) => set('is_featured', e.target.checked)}
                        />
                        Mettre en avant
                    </label>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
                    <div className="flex gap-2">
                        <AdminButton type="submit" variant="wine" disabled={processing}>
                            {plan ? 'Enregistrer' : 'Créer le plan'}
                        </AdminButton>
                        <AdminButton variant="ghost" onClick={onClose}>
                            Annuler
                        </AdminButton>
                    </div>
                    {plan && (
                        <AdminButton
                            variant="danger"
                            size="sm"
                            icon={Trash2}
                            onClick={destroy}
                        >
                            Supprimer
                        </AdminButton>
                    )}
                </div>
            </form>
        </Dialog>
    );
}

function PackageDialog({
    pack,
    onClose,
}: {
    pack: Package | null;
    onClose: () => void;
}) {
    const [form, setForm] = useState<PackageDraft>(
        pack
            ? {
                  name: pack.name,
                  amount: pack.amount,
                  bonus: pack.bonus,
                  price: pack.price,
                  is_active: pack.is_active,
                  is_featured: pack.is_featured,
                  display_order: pack.display_order,
              }
            : emptyPackage,
    );
    const [processing, setProcessing] = useState(false);

    const set = <K extends keyof PackageDraft>(key: K, value: PackageDraft[K]) =>
        setForm((f) => ({ ...f, [key]: value }));

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);

        const options = {
            preserveScroll: true,
            onSuccess: onClose,
            onFinish: () => setProcessing(false),
        };

        if (pack) {
            router.put(`/admin/billing/packages/${pack.id}`, form, options);
        } else {
            router.post('/admin/billing/packages', form, options);
        }
    };

    const destroy = () => {
        if (!pack) return;
        if (!confirm(`Supprimer le pack « ${pack.name} » ?`)) return;
        router.delete(`/admin/billing/packages/${pack.id}`, {
            preserveScroll: true,
            onSuccess: onClose,
        });
    };

    return (
        <Dialog title={pack ? 'Modifier le pack' : 'Nouveau pack'} onClose={onClose}>
            <form onSubmit={submit} className="flex flex-col gap-4">
                <Field label="Nom du pack">
                    <input
                        required
                        maxLength={80}
                        value={form.name}
                        onChange={(e) => set('name', e.target.value)}
                        className={inputClass}
                        style={inputStyle}
                        placeholder="Populaire"
                    />
                </Field>

                <div className="grid gap-4 sm:grid-cols-3">
                    <Field label="Gemmes">
                        <input
                            required
                            type="number"
                            min="1"
                            value={form.amount}
                            onChange={(e) => set('amount', Number(e.target.value))}
                            className={inputClass}
                            style={inputStyle}
                        />
                    </Field>
                    <Field label="Bonus offert">
                        <input
                            required
                            type="number"
                            min="0"
                            value={form.bonus}
                            onChange={(e) => set('bonus', Number(e.target.value))}
                            className={inputClass}
                            style={inputStyle}
                        />
                    </Field>
                    <Field label="Prix (€)">
                        <input
                            required
                            type="number"
                            step="0.01"
                            min="0.5"
                            value={form.price}
                            onChange={(e) => set('price', Number(e.target.value))}
                            className={inputClass}
                            style={inputStyle}
                        />
                    </Field>
                </div>

                <Field label="Ordre d'affichage">
                    <input
                        required
                        type="number"
                        min="0"
                        value={form.display_order}
                        onChange={(e) => set('display_order', Number(e.target.value))}
                        className={inputClass}
                        style={inputStyle}
                    />
                </Field>

                <p
                    className="rounded-lg px-3 py-2 text-xs"
                    style={{ background: 'var(--bg-soft)', color: 'var(--ink-mute)' }}
                >
                    L’acheteuse recevra{' '}
                    <strong>
                        {(form.amount + form.bonus).toLocaleString('fr-FR')} gemmes
                    </strong>{' '}
                    pour{' '}
                    {form.price.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €.
                </p>

                <div className="flex flex-wrap gap-4">
                    <label className="inline-flex items-center gap-2 text-sm">
                        <input
                            type="checkbox"
                            checked={form.is_active}
                            onChange={(e) => set('is_active', e.target.checked)}
                        />
                        Visible en boutique
                    </label>
                    <label className="inline-flex items-center gap-2 text-sm">
                        <input
                            type="checkbox"
                            checked={form.is_featured}
                            onChange={(e) => set('is_featured', e.target.checked)}
                        />
                        Marquer « populaire »
                    </label>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
                    <div className="flex gap-2">
                        <AdminButton type="submit" variant="wine" disabled={processing}>
                            {pack ? 'Enregistrer' : 'Créer le pack'}
                        </AdminButton>
                        <AdminButton variant="ghost" onClick={onClose}>
                            Annuler
                        </AdminButton>
                    </div>
                    {pack && (
                        <AdminButton
                            variant="danger"
                            size="sm"
                            icon={Trash2}
                            onClick={destroy}
                        >
                            Supprimer
                        </AdminButton>
                    )}
                </div>
            </form>
        </Dialog>
    );
}
