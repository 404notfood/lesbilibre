import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';

import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';

interface ConsentData {
    data_processing_consent: boolean;
    data_processing_consented_at: string | null;
    marketing_consent: boolean;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Privacy settings',
        href: '/settings/privacy',
    },
];

export default function Privacy({
    consent,
}: {
    consent: ConsentData;
}) {
    const [exporting, setExporting] = useState(false);

    const consentForm = useForm({
        data_processing_consent: consent.data_processing_consent,
        marketing_consent: consent.marketing_consent,
    });

    const deleteForm = useForm({
        confirmation: '',
    });

    const [dialogOpen, setDialogOpen] = useState(false);

    const handleExport = () => {
        setExporting(true);
        window.location.href = '/settings/data-export';
        setTimeout(() => setExporting(false), 3000);
    };

    const handleConsentSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        consentForm.post('/settings/consent', {
            preserveScroll: true,
        });
    };

    const handleDeleteAccount = (e: React.FormEvent) => {
        e.preventDefault();
        deleteForm.delete('/settings/delete-account', {
            onSuccess: () => {
                setDialogOpen(false);
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Privacy settings" />

            <SettingsLayout>
                {/* Data Export Section */}
                <div className="space-y-6">
                    <HeadingSmall
                        title="Mes données"
                        description="Téléchargez une copie de toutes vos données personnelles (RGPD Article 20)"
                    />

                    <div className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                            Vous pouvez exporter toutes vos données personnelles
                            dans un fichier JSON. Cela inclut votre profil, vos
                            photos (métadonnées), vos messages, vos likes, vos
                            matchs, vos badges, vos transactions de gemmes, vos
                            notifications, vos utilisateurs bloqués et vos
                            signalements.
                        </p>

                        <Button
                            onClick={handleExport}
                            disabled={exporting}
                            variant="outline"
                        >
                            {exporting
                                ? 'Export en cours...'
                                : 'Exporter mes données'}
                        </Button>
                    </div>
                </div>

                {/* Consent Section */}
                <div className="space-y-6">
                    <HeadingSmall
                        title="Consentements"
                        description="Gérez vos préférences de consentement au traitement de vos données"
                    />

                    <form
                        onSubmit={handleConsentSubmit}
                        className="space-y-6"
                    >
                        <div className="space-y-4">
                            <div className="flex items-center justify-between gap-4 rounded-lg border p-4">
                                <div className="space-y-0.5">
                                    <Label
                                        htmlFor="data_processing_consent"
                                        className="text-sm font-medium"
                                    >
                                        Traitement des données
                                    </Label>
                                    <p className="text-sm text-muted-foreground">
                                        J&apos;accepte le traitement de mes
                                        données personnelles pour le
                                        fonctionnement du service.
                                    </p>
                                    {consent.data_processing_consented_at && (
                                        <p className="text-xs text-muted-foreground">
                                            Consentement donné le{' '}
                                            {new Date(
                                                consent.data_processing_consented_at,
                                            ).toLocaleDateString('fr-FR')}
                                        </p>
                                    )}
                                </div>
                                <Switch
                                    id="data_processing_consent"
                                    checked={
                                        consentForm.data
                                            .data_processing_consent
                                    }
                                    onCheckedChange={(checked) =>
                                        consentForm.setData(
                                            'data_processing_consent',
                                            checked,
                                        )
                                    }
                                />
                            </div>

                            <div className="flex items-center justify-between gap-4 rounded-lg border p-4">
                                <div className="space-y-0.5">
                                    <Label
                                        htmlFor="marketing_consent"
                                        className="text-sm font-medium"
                                    >
                                        Communications marketing
                                    </Label>
                                    <p className="text-sm text-muted-foreground">
                                        J&apos;accepte de recevoir des emails
                                        promotionnels et des notifications
                                        marketing.
                                    </p>
                                </div>
                                <Switch
                                    id="marketing_consent"
                                    checked={
                                        consentForm.data.marketing_consent
                                    }
                                    onCheckedChange={(checked) =>
                                        consentForm.setData(
                                            'marketing_consent',
                                            checked,
                                        )
                                    }
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <Button
                                type="submit"
                                disabled={consentForm.processing}
                            >
                                {consentForm.processing
                                    ? 'Enregistrement...'
                                    : 'Enregistrer les préférences'}
                            </Button>

                            {consentForm.recentlySuccessful && (
                                <p className="text-sm text-neutral-600">
                                    Enregistré
                                </p>
                            )}
                        </div>
                    </form>
                </div>

                {/* Delete Account Section */}
                <div className="space-y-6">
                    <HeadingSmall
                        title="Supprimer mon compte"
                        description="Supprimez définitivement votre compte et toutes vos données (RGPD Article 17)"
                    />
                    <div className="space-y-4 rounded-lg border border-red-100 bg-red-50 p-4 dark:border-red-200/10 dark:bg-red-700/10">
                        <div className="relative space-y-0.5 text-red-600 dark:text-red-100">
                            <p className="font-medium">Zone de danger</p>
                            <p className="text-sm">
                                Cette action est irréversible. Toutes vos
                                données seront supprimées ou anonymisées de
                                manière permanente. Vos photos seront
                                supprimées, vos messages seront anonymisés et
                                votre profil sera effacé.
                            </p>
                        </div>

                        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                            <DialogTrigger asChild>
                                <Button variant="destructive">
                                    Supprimer mon compte
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogTitle>
                                    Êtes-vous sûr(e) de vouloir supprimer votre
                                    compte ?
                                </DialogTitle>
                                <DialogDescription>
                                    Cette action est définitive. Toutes vos
                                    données personnelles, photos, messages et
                                    relations seront supprimées ou anonymisées.
                                    Tapez{' '}
                                    <strong className="text-foreground">
                                        SUPPRIMER
                                    </strong>{' '}
                                    pour confirmer.
                                </DialogDescription>

                                <form
                                    onSubmit={handleDeleteAccount}
                                    className="space-y-6"
                                >
                                    <div className="grid gap-2">
                                        <Label
                                            htmlFor="confirmation"
                                            className="sr-only"
                                        >
                                            Confirmation
                                        </Label>

                                        <Input
                                            id="confirmation"
                                            type="text"
                                            name="confirmation"
                                            value={
                                                deleteForm.data.confirmation
                                            }
                                            onChange={(e) =>
                                                deleteForm.setData(
                                                    'confirmation',
                                                    e.target.value,
                                                )
                                            }
                                            placeholder='Tapez "SUPPRIMER" pour confirmer'
                                            autoComplete="off"
                                        />

                                        <InputError
                                            message={
                                                deleteForm.errors.confirmation
                                            }
                                        />
                                    </div>

                                    <DialogFooter className="gap-2">
                                        <DialogClose asChild>
                                            <Button
                                                variant="secondary"
                                                onClick={() => {
                                                    deleteForm.reset();
                                                    deleteForm.clearErrors();
                                                }}
                                            >
                                                Annuler
                                            </Button>
                                        </DialogClose>

                                        <Button
                                            variant="destructive"
                                            disabled={
                                                deleteForm.processing ||
                                                deleteForm.data
                                                    .confirmation !==
                                                    'SUPPRIMER'
                                            }
                                            type="submit"
                                        >
                                            {deleteForm.processing
                                                ? 'Suppression...'
                                                : 'Supprimer définitivement'}
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
