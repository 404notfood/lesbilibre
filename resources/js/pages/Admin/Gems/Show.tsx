import AdminLayout, {
    AdminBadge,
    AdminButton,
    AdminCard,
    AdminCardHeader,
    AdminEmpty,
    AdminField,
    AdminMeta,
    AdminTable,
    AdminTd,
    AdminTh,
    AdminThead,
    AdminTr,
} from '@/layouts/admin-layout';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Head, Link, useForm } from '@inertiajs/react';
import { Coins, Minus, Plus, Sparkles, UserCog } from 'lucide-react';
import { FormEvent, useState } from 'react';

interface User {
    id: number;
    name: string;
    email: string;
    gems: number;
}

interface Transaction {
    id: number;
    type: string;
    amount: number;
    balance_after: number;
    description: string;
    created_at: string;
}

const TYPE_LABELS: Record<string, string> = {
    admin_add: 'Ajout admin',
    admin_remove: 'Retrait admin',
    purchase: 'Achat',
    expense: 'Dépense',
    gift: 'Cadeau',
    reward: 'Récompense',
    refund: 'Remboursement',
};

export default function Show({
    user,
    transactions,
}: {
    user: User;
    transactions: Transaction[];
}) {
    const [showAdd, setShowAdd] = useState(false);
    const [showRemove, setShowRemove] = useState(false);

    const addForm = useForm({ amount: 100, description: '' });
    const removeForm = useForm({ amount: 100, description: '' });

    const submitAdd = (event: FormEvent) => {
        event.preventDefault();
        addForm.post(`/admin/gems/${user.id}/add`, {
            preserveScroll: true,
            onSuccess: () => {
                addForm.reset();
                setShowAdd(false);
            },
        });
    };

    const submitRemove = (event: FormEvent) => {
        event.preventDefault();
        removeForm.post(`/admin/gems/${user.id}/remove`, {
            preserveScroll: true,
            onSuccess: () => {
                removeForm.reset();
                setShowRemove(false);
            },
        });
    };

    return (
        <AdminLayout
            title="Gestion des gemmes"
            subtitle={`${user.name} · ${user.email}`}
            breadcrumbs={[
                { label: 'Admin', href: '/admin/dashboard' },
                { label: 'Économie gemmes', href: '/admin/gems' },
                { label: user.name },
            ]}
            hideSearch
            actions={
                <>
                    <AdminButton icon={UserCog} href={`/admin/users/${user.id}`}>
                        Fiche du compte
                    </AdminButton>
                    <AdminButton
                        variant="gold"
                        icon={Plus}
                        onClick={() => setShowAdd(true)}
                    >
                        Créditer
                    </AdminButton>
                    <AdminButton
                        variant="danger"
                        icon={Minus}
                        onClick={() => setShowRemove(true)}
                        disabled={user.gems <= 0}
                    >
                        Débiter
                    </AdminButton>
                </>
            }
        >
            <Head title={`Gemmes · ${user.name}`} />

            <div className="space-y-4">
                {/* Solde */}
                <AdminCard>
                    <div className="flex flex-wrap items-center gap-4">
                        <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-[color:var(--blush)] text-[color:var(--wine-deep)]">
                            <Sparkles className="h-6 w-6" />
                        </span>
                        <div className="min-w-0 flex-1">
                            <div className="editorial-caption text-[color:var(--ink-mute)]">
                                Solde actuel
                            </div>
                            <div className="font-display text-4xl font-medium tracking-tight text-[color:var(--ink)]">
                                {user.gems.toLocaleString('fr-FR')}
                            </div>
                            <p className="mt-1 text-xs text-[color:var(--ink-mute)]">
                                Chaque ajustement est enregistré dans l&apos;historique
                                ci-dessous avec son motif.
                            </p>
                        </div>
                    </div>
                </AdminCard>

                {/* Historique */}
                <AdminCard padded={false}>
                    <AdminCardHeader
                        title="Historique des mouvements"
                        icon={Coins}
                        action={<AdminMeta>20 derniers</AdminMeta>}
                    />
                    {transactions.length === 0 ? (
                        <AdminEmpty
                            icon={Coins}
                            title="Aucun mouvement"
                            description="Ce compte n’a encore aucune transaction de gemmes."
                        />
                    ) : (
                        <AdminTable>
                            <AdminThead>
                                <AdminTh>Type</AdminTh>
                                <AdminTh>Motif</AdminTh>
                                <AdminTh align="right">Montant</AdminTh>
                                <AdminTh align="right">Solde après</AdminTh>
                                <AdminTh>Date</AdminTh>
                            </AdminThead>
                            <tbody>
                                {transactions.map((transaction) => (
                                    <AdminTr key={transaction.id}>
                                        <AdminTd>
                                            <AdminBadge
                                                tone={
                                                    transaction.amount >= 0
                                                        ? 'success'
                                                        : 'neutral'
                                                }
                                            >
                                                {TYPE_LABELS[transaction.type] ??
                                                    transaction.type}
                                            </AdminBadge>
                                        </AdminTd>
                                        <AdminTd>
                                            <p className="max-w-sm truncate text-xs text-[color:var(--ink-soft)]">
                                                {transaction.description || '—'}
                                            </p>
                                        </AdminTd>
                                        <AdminTd align="right">
                                            <span
                                                className={`font-mono text-sm font-semibold ${
                                                    transaction.amount >= 0
                                                        ? 'text-[color:var(--success)]'
                                                        : 'text-[color:var(--destructive)]'
                                                }`}
                                            >
                                                {transaction.amount > 0 ? '+' : ''}
                                                {transaction.amount.toLocaleString(
                                                    'fr-FR',
                                                )}
                                            </span>
                                        </AdminTd>
                                        <AdminTd align="right">
                                            <span className="font-mono text-xs text-[color:var(--ink-soft)]">
                                                {transaction.balance_after.toLocaleString(
                                                    'fr-FR',
                                                )}
                                            </span>
                                        </AdminTd>
                                        <AdminTd>
                                            <AdminMeta>{transaction.created_at}</AdminMeta>
                                        </AdminTd>
                                    </AdminTr>
                                ))}
                            </tbody>
                        </AdminTable>
                    )}
                </AdminCard>
            </div>

            {/* Créditer */}
            <Dialog open={showAdd} onOpenChange={setShowAdd}>
                <DialogContent>
                    <form onSubmit={submitAdd}>
                        <DialogHeader>
                            <DialogTitle className="font-display text-2xl font-medium italic">
                                Créditer des gemmes
                            </DialogTitle>
                            <DialogDescription>
                                Le motif est conservé dans l&apos;historique du compte.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-3 py-2">
                            <AdminField label="Quantité" error={addForm.errors.amount}>
                                <Input
                                    type="number"
                                    min={1}
                                    max={10000}
                                    value={addForm.data.amount}
                                    onChange={(event) =>
                                        addForm.setData(
                                            'amount',
                                            Number(event.target.value),
                                        )
                                    }
                                    autoFocus
                                />
                            </AdminField>
                            <AdminField
                                label="Motif"
                                error={addForm.errors.description}
                                hint="Ex : geste commercial, compensation d’un incident…"
                            >
                                <Input
                                    type="text"
                                    maxLength={255}
                                    value={addForm.data.description}
                                    onChange={(event) =>
                                        addForm.setData('description', event.target.value)
                                    }
                                    placeholder="Motif de l'ajout"
                                />
                            </AdminField>
                        </div>

                        <DialogFooter>
                            <AdminButton onClick={() => setShowAdd(false)}>
                                Annuler
                            </AdminButton>
                            <AdminButton
                                type="submit"
                                variant="gold"
                                icon={Plus}
                                disabled={
                                    addForm.processing ||
                                    !addForm.data.description.trim()
                                }
                            >
                                {addForm.processing ? 'Ajout…' : 'Créditer'}
                            </AdminButton>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Débiter */}
            <Dialog open={showRemove} onOpenChange={setShowRemove}>
                <DialogContent>
                    <form onSubmit={submitRemove}>
                        <DialogHeader>
                            <DialogTitle className="font-display text-2xl font-medium italic">
                                Débiter des gemmes
                            </DialogTitle>
                            <DialogDescription>
                                Solde actuel : {user.gems.toLocaleString('fr-FR')} gemmes.
                                Un montant supérieur au solde le ramènera simplement à
                                zéro.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-3 py-2">
                            <AdminField label="Quantité" error={removeForm.errors.amount}>
                                <Input
                                    type="number"
                                    min={1}
                                    value={removeForm.data.amount}
                                    onChange={(event) =>
                                        removeForm.setData(
                                            'amount',
                                            Number(event.target.value),
                                        )
                                    }
                                    autoFocus
                                />
                            </AdminField>
                            <AdminField
                                label="Motif"
                                error={removeForm.errors.description}
                                hint="Ex : correction d’une erreur, abus détecté…"
                            >
                                <Input
                                    type="text"
                                    maxLength={255}
                                    value={removeForm.data.description}
                                    onChange={(event) =>
                                        removeForm.setData(
                                            'description',
                                            event.target.value,
                                        )
                                    }
                                    placeholder="Motif du retrait"
                                />
                            </AdminField>
                        </div>

                        <DialogFooter>
                            <AdminButton onClick={() => setShowRemove(false)}>
                                Annuler
                            </AdminButton>
                            <AdminButton
                                type="submit"
                                variant="danger"
                                icon={Minus}
                                disabled={
                                    removeForm.processing ||
                                    !removeForm.data.description.trim()
                                }
                            >
                                {removeForm.processing ? 'Retrait…' : 'Débiter'}
                            </AdminButton>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AdminLayout>
    );
}
