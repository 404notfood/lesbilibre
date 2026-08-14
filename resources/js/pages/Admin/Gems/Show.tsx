import AdminLayout, {
    AdminBadge,
    AdminButton,
    AdminCard,
    AdminKpi,
    AdminSectionTitle,
} from '@/layouts/admin-layout';
import { Head, useForm } from '@inertiajs/react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Clock, Gem, Minus, Plus } from 'lucide-react';
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

export default function Show({
    user,
    transactions,
}: {
    user: User;
    transactions: Transaction[];
}) {
    const [showAddDialog, setShowAddDialog] = useState(false);
    const [showRemoveDialog, setShowRemoveDialog] = useState(false);

    const addForm = useForm({
        amount: 100,
        description: '',
    });

    const removeForm = useForm({
        amount: 100,
        description: '',
    });

    const handleAdd = (e: FormEvent) => {
        e.preventDefault();
        addForm.post(`/admin/gems/${user.id}/add`, {
            onSuccess: () => {
                addForm.reset();
                setShowAddDialog(false);
            },
        });
    };

    const handleRemove = (e: FormEvent) => {
        e.preventDefault();
        removeForm.post(`/admin/gems/${user.id}/remove`, {
            onSuccess: () => {
                removeForm.reset();
                setShowRemoveDialog(false);
            },
        });
    };

    const isPositive = (type: string): boolean => {
        return type.includes('add') || type === 'purchase';
    };

    const getTransactionLabel = (type: string) => {
        const labels: Record<string, string> = {
            admin_add: 'Ajout admin',
            admin_remove: 'Retrait admin',
            purchase: 'Achat',
            expense: 'Dépense',
            gift: 'Cadeau',
        };
        return labels[type] || type;
    };

    return (
        <AdminLayout
            title="Gestion des gemmes"
            subtitle={user.name}
            breadcrumbs={[
                { label: 'Admin', href: '/admin/dashboard' },
                { label: 'Utilisatrices', href: '/admin/users' },
                { label: user.name, href: `/admin/users/${user.id}` },
                { label: 'Gemmes' },
            ]}
            actions={
                <>
                    <AdminButton
                        onClick={() => setShowAddDialog(true)}
                        variant="primary"
                        icon={Plus}
                    >
                        Ajouter
                    </AdminButton>
                    <AdminButton
                        onClick={() => setShowRemoveDialog(true)}
                        variant="default"
                        icon={Minus}
                    >
                        Retirer
                    </AdminButton>
                </>
            }
        >
            <Head title="Gestion des gemmes" />

            <div className="space-y-10 max-w-4xl">
                {/* User Balance KPIs */}
                <section>
                    <AdminSectionTitle
                        eyebrow="01 · Solde"
                        title="Compte gemmes"
                    />
                    <div className="grid gap-4 md:grid-cols-2">
                        <AdminKpi
                            label="Solde actuel"
                            value={user.gems}
                            icon={Gem}
                            deltaTone="positive"
                        />
                        <AdminCard>
                            <div className="editorial-caption mb-2" style={{ color: 'var(--ink-mute)' }}>
                                Utilisatrice
                            </div>
                            <p
                                className="font-display text-xl font-medium"
                                style={{ color: 'var(--ink)' }}
                            >
                                {user.name}
                            </p>
                            <p
                                className="text-sm"
                                style={{ color: 'var(--ink-mute)' }}
                            >
                                {user.email}
                            </p>
                        </AdminCard>
                    </div>
                </section>

                {/* Transactions History */}
                <section>
                    <AdminSectionTitle
                        eyebrow="02 · Historique"
                        title="Transactions (20 dernières)"
                        right={
                            <span
                                className="font-mono inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.16em]"
                                style={{ color: 'var(--ink-mute)' }}
                            >
                                <Clock className="h-3 w-3" />
                                Temps réel
                            </span>
                        }
                    />
                    <AdminCard padded={false}>
                        {transactions.length > 0 ? (
                            <ul>
                                {transactions.map((transaction, idx) => (
                                    <li
                                        key={transaction.id}
                                        className="flex items-center justify-between gap-4 px-5 py-3 transition-colors hover:bg-[color:var(--bg-soft)]"
                                        style={{
                                            borderTop:
                                                idx === 0
                                                    ? 'none'
                                                    : '1px solid var(--line-soft)',
                                        }}
                                    >
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2">
                                                <p
                                                    className="font-semibold"
                                                    style={{ color: 'var(--ink)' }}
                                                >
                                                    {getTransactionLabel(transaction.type)}
                                                </p>
                                                <AdminBadge
                                                    tone={
                                                        isPositive(transaction.type)
                                                            ? 'success'
                                                            : 'danger'
                                                    }
                                                >
                                                    {isPositive(transaction.type) ? 'Crédit' : 'Débit'}
                                                </AdminBadge>
                                            </div>
                                            {transaction.description && (
                                                <p
                                                    className="mt-0.5 text-sm"
                                                    style={{ color: 'var(--ink-soft)' }}
                                                >
                                                    {transaction.description}
                                                </p>
                                            )}
                                            <p
                                                className="font-mono mt-1 text-[10px] uppercase tracking-[0.14em]"
                                                style={{ color: 'var(--ink-mute)' }}
                                            >
                                                {transaction.created_at}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p
                                                className="font-display text-xl font-medium"
                                                style={{
                                                    color: isPositive(transaction.type)
                                                        ? 'var(--success)'
                                                        : 'var(--destructive)',
                                                }}
                                            >
                                                {transaction.amount > 0 ? '+' : ''}
                                                {transaction.amount}
                                            </p>
                                            <p
                                                className="font-mono text-[10px] uppercase tracking-[0.14em]"
                                                style={{ color: 'var(--ink-mute)' }}
                                            >
                                                Solde · {transaction.balance_after}
                                            </p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p
                                className="py-12 text-center text-sm"
                                style={{ color: 'var(--ink-mute)' }}
                            >
                                Aucune transaction.
                            </p>
                        )}
                    </AdminCard>
                </section>
            </div>

            {/* Add Gems Dialog */}
            {showAddDialog && (
                <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                    <DialogContent>
                        <DialogTitle
                            className="font-display mb-4 text-2xl font-medium"
                            style={{ color: 'var(--ink)' }}
                        >
                            Ajouter des gemmes
                        </DialogTitle>
                        <form onSubmit={handleAdd} className="space-y-4">
                            <DialogField
                                label="Nombre de gemmes"
                                htmlFor="add_amount"
                                error={addForm.errors.amount}
                            >
                                <Input
                                    id="add_amount"
                                    type="number"
                                    min="1"
                                    max="10000"
                                    value={addForm.data.amount}
                                    onChange={(e) =>
                                        addForm.setData('amount', parseInt(e.target.value))
                                    }
                                />
                            </DialogField>
                            <DialogField
                                label="Description"
                                htmlFor="add_description"
                                error={addForm.errors.description}
                            >
                                <Input
                                    id="add_description"
                                    value={addForm.data.description}
                                    onChange={(e) =>
                                        addForm.setData('description', e.target.value)
                                    }
                                    placeholder="Ex: Compensation, promotion..."
                                />
                            </DialogField>
                            <div className="flex gap-2">
                                <AdminButton
                                    type="submit"
                                    disabled={addForm.processing}
                                    variant="primary"
                                >
                                    {addForm.processing ? 'Ajout...' : 'Ajouter'}
                                </AdminButton>
                                <AdminButton
                                    onClick={() => setShowAddDialog(false)}
                                    variant="default"
                                >
                                    Annuler
                                </AdminButton>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            )}

            {/* Remove Gems Dialog */}
            {showRemoveDialog && (
                <Dialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
                    <DialogContent>
                        <DialogTitle
                            className="font-display mb-4 text-2xl font-medium"
                            style={{ color: 'var(--ink)' }}
                        >
                            Retirer des gemmes
                        </DialogTitle>
                        <form onSubmit={handleRemove} className="space-y-4">
                            <DialogField
                                label="Nombre de gemmes"
                                htmlFor="remove_amount"
                                error={removeForm.errors.amount}
                                hint={`Solde actuel : ${user.gems} gemmes`}
                            >
                                <Input
                                    id="remove_amount"
                                    type="number"
                                    min="1"
                                    value={removeForm.data.amount}
                                    onChange={(e) =>
                                        removeForm.setData('amount', parseInt(e.target.value))
                                    }
                                />
                            </DialogField>
                            <DialogField
                                label="Description"
                                htmlFor="remove_description"
                                error={removeForm.errors.description}
                            >
                                <Input
                                    id="remove_description"
                                    value={removeForm.data.description}
                                    onChange={(e) =>
                                        removeForm.setData('description', e.target.value)
                                    }
                                    placeholder="Ex: Correction, sanction..."
                                />
                            </DialogField>
                            <div className="flex gap-2">
                                <AdminButton
                                    type="submit"
                                    disabled={removeForm.processing}
                                    variant="danger"
                                >
                                    {removeForm.processing ? 'Retrait...' : 'Retirer'}
                                </AdminButton>
                                <AdminButton
                                    onClick={() => setShowRemoveDialog(false)}
                                    variant="default"
                                >
                                    Annuler
                                </AdminButton>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            )}
        </AdminLayout>
    );
}

function DialogField({
    label,
    htmlFor,
    error,
    hint,
    children,
}: {
    label: string;
    htmlFor: string;
    error?: string;
    hint?: string;
    children: React.ReactNode;
}) {
    return (
        <div>
            <Label
                htmlFor={htmlFor}
                className="editorial-caption mb-1.5 block"
                style={{ color: 'var(--ink-mute)' }}
            >
                {label}
            </Label>
            {children}
            {hint && (
                <p
                    className="mt-1.5 text-xs"
                    style={{ color: 'var(--ink-mute)' }}
                >
                    {hint}
                </p>
            )}
            {error && (
                <p
                    className="mt-1.5 text-xs font-medium"
                    style={{ color: 'var(--destructive)' }}
                >
                    {error}
                </p>
            )}
        </div>
    );
}
