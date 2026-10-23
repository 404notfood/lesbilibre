import {
    CommunityCharter,
    IntentionCheckboxes,
} from '@/components/community-fields';
import { login } from '@/routes';
import GoogleAuthButton from '@/components/google-auth-button';
import { store } from '@/routes/register';
import { Form, Head } from '@inertiajs/react';

import { CityAutocomplete } from '@/components/city-autocomplete';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Spinner } from '@/components/ui/spinner';
import AuthLayout from '@/layouts/auth-layout';
import { Heart, Sparkles } from 'lucide-react';

interface RegisterProps {
    googleEnabled?: boolean;
    googleProfile?: { email: string; name: string } | null;
    referralCode?: string;
}

export default function Register({
    referralCode = '',
    googleEnabled = false,
    googleProfile = null,
}: RegisterProps): JSX.Element {
    return (
        <AuthLayout
            title="Fais le premier pas."
            description="Un profil, tes envies, et la liberté de faire connaissance à ton rythme."
        >
            <Head title="Inscription" />
            {googleEnabled && !googleProfile && <GoogleAuthButton />}
            {googleProfile && <p className="mb-5 rounded-lg bg-primary/5 p-4 text-sm">Ton compte Google est confirmé. Complète ton profil et tes consentements pour terminer l’inscription.</p>}

            <div className="mb-6 rounded-lg border border-primary/20 bg-primary/5 p-4">
                <div className="flex items-start gap-3">
                    <Sparkles className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
                    <div className="text-sm">
                        <p className="mb-1 font-medium text-primary">
                            Quelques repères avant de commencer
                        </p>
                        <p className="text-muted-foreground">
                            Prépare ton profil. Après confirmation de ton e-mail
                            et validation des étapes d’accès, tu pourras
                            découvrir les personnes près de chez toi.
                        </p>
                    </div>
                </div>
            </div>

            <Form
                {...store.form()}
                resetOnSuccess={['password', 'password_confirmation']}
                disableWhileProcessing
                className="space-y-6"
            >
                {({ processing, errors }) => (
                    <>
                        {referralCode ? (
                            <div className="rounded-lg border border-emerald-500/25 bg-emerald-500/10 p-4 text-sm">
                                <p className="font-medium text-emerald-700 dark:text-emerald-300">
                                    Invitation activée
                                </p>
                                <p className="mt-1 text-muted-foreground">
                                    Après la vérification de ton profil, ta
                                    marraine et toi recevrez vos gemmes bonus.
                                </p>
                            </div>
                        ) : null}
                        <input
                            type="hidden"
                            name="referral_code"
                            value={referralCode}
                        />
                        <InputError message={errors.referral_code} />

                        {/* Informations de base */}
                        <div className="space-y-4">
                            <div className="space-y-1">
                                <h2 className="text-sm font-semibold text-foreground">
                                    Informations personnelles
                                </h2>
                                <p className="text-xs text-muted-foreground">
                                    Ta date de naissance reste privée ; seul ton
                                    âge peut être affiché
                                </p>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label
                                        htmlFor="pseudo"
                                        className="text-sm font-medium"
                                    >
                                        Pseudo{' '}
                                        <span className="text-destructive">
                                            *
                                        </span>
                                    </Label>
                                    <Input
                                        id="pseudo"
                                        type="text"
                                        required
                                        autoFocus
                                        autoComplete="username"
                                        name="pseudo"
                                        placeholder="Ton pseudo unique"
                                        className="h-11"
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Ton pseudo sera visible sur ton profil
                                        et utilisé pour la connexion
                                    </p>
                                    <InputError message={errors.pseudo} />
                                </div>

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label
                                            htmlFor="name"
                                            className="text-sm font-medium"
                                        >
                                            Prénom{' '}
                                            <span className="text-destructive">
                                                *
                                            </span>
                                        </Label>
                                        <Input
                                            id="name"
                                            defaultValue={googleProfile?.name ?? ''}
                                            type="text"
                                            required
                                            autoComplete="name"
                                            name="name"
                                            placeholder="Ton prénom"
                                            className="h-11"
                                        />
                                        <InputError message={errors.name} />
                                    </div>

                                    <div className="space-y-2">
                                        <Label
                                            htmlFor="date_of_birth"
                                            className="text-sm font-medium"
                                        >
                                            Date de naissance{' '}
                                            <span className="text-destructive">
                                                *
                                            </span>
                                        </Label>
                                        <Input
                                            id="date_of_birth"
                                            type="date"
                                            required
                                            name="date_of_birth"
                                            autoComplete="bday"
                                            className="h-11"
                                        />
                                        <InputError
                                            message={errors.date_of_birth}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <CityAutocomplete
                                    name="city"
                                    label="Ville"
                                    placeholder="Ta ville ou ton code postal..."
                                    required
                                    error={errors.city}
                                    className="h-11"
                                />
                                <p className="mt-1.5 text-xs text-muted-foreground">
                                    Ta ville sert à calculer les distances avec
                                    les autres membres
                                </p>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label
                                        htmlFor="sexual_orientation"
                                        className="text-sm font-medium"
                                    >
                                        Mon orientation (facultatif)
                                    </Label>
                                    <Select name="sexual_orientation">
                                        <SelectTrigger className="h-11">
                                            <SelectValue placeholder="Ton orientation" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="lesbian">
                                                Lesbienne
                                            </SelectItem>
                                            <SelectItem value="bisexual">
                                                Bisexuelle
                                            </SelectItem>
                                            <SelectItem value="pansexual">
                                                Pansexuelle
                                            </SelectItem>
                                            <SelectItem value="queer">
                                                Queer
                                            </SelectItem>
                                            <SelectItem value="questioning">
                                                En questionnement
                                            </SelectItem>
                                            <SelectItem value="other">
                                                Sans étiquette / non précisée
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <InputError
                                        message={errors.sexual_orientation}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label
                                        htmlFor="interested_in"
                                        className="text-sm font-medium"
                                    >
                                        Intéressée par{' '}
                                        <span className="text-destructive">
                                            *
                                        </span>
                                    </Label>
                                    <Select name="interested_in" required>
                                        <SelectTrigger className="h-11">
                                            <SelectValue placeholder="Qui souhaites-tu rencontrer ?" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="single_woman">
                                                Femme lesbienne
                                            </SelectItem>
                                            <SelectItem value="couple">
                                                Couple de femmes
                                            </SelectItem>
                                            <SelectItem value="curious">
                                                Femme curieuse
                                            </SelectItem>
                                            <SelectItem value="all">
                                                Toutes les femmes
                                            </SelectItem>
                                            <SelectItem value="other">
                                                Autre
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <InputError
                                        message={errors.interested_in}
                                    />
                                </div>
                            </div>

                            <IntentionCheckboxes />
                            <InputError message={errors.meeting_intentions} />
                            <CommunityCharter />
                            <InputError message={errors.community_charter} />
                            <InputError
                                message={errors.data_processing_consent}
                            />
                        </div>

                        <Separator />

                        {/* Informations de connexion */}
                        <div className="space-y-4">
                            <div className="space-y-1">
                                <h2 className="text-sm font-semibold text-foreground">
                                    Informations de connexion
                                </h2>
                                <p className="text-xs text-muted-foreground">
                                    Pour sécuriser ton compte
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label
                                    htmlFor="email"
                                    className="text-sm font-medium"
                                >
                                    Adresse email{' '}
                                    <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="email"
                                    defaultValue={googleProfile?.email ?? ''}
                                    readOnly={Boolean(googleProfile)}
                                    type="email"
                                    required
                                    autoComplete="email"
                                    name="email"
                                    placeholder="toi@exemple.fr"
                                    className="h-11"
                                />
                                <InputError message={errors.email} />
                            </div>

                            {!googleProfile && <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label
                                        htmlFor="password"
                                        className="text-sm font-medium"
                                    >
                                        Mot de passe{' '}
                                        <span className="text-destructive">
                                            *
                                        </span>
                                    </Label>
                                    <PasswordInput
                                        id="password"
                                        required
                                        autoComplete="new-password"
                                        name="password"
                                        placeholder="••••••••"
                                        className="h-11"
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Minimum 8 caractères
                                    </p>
                                    <InputError message={errors.password} />
                                </div>

                                <div className="space-y-2">
                                    <Label
                                        htmlFor="password_confirmation"
                                        className="text-sm font-medium"
                                    >
                                        Confirmation{' '}
                                        <span className="text-destructive">
                                            *
                                        </span>
                                    </Label>
                                    <PasswordInput
                                        id="password_confirmation"
                                        required
                                        autoComplete="new-password"
                                        name="password_confirmation"
                                        placeholder="••••••••"
                                        className="h-11"
                                    />
                                    <InputError
                                        message={errors.password_confirmation}
                                    />
                                </div>
                            </div>}
                        </div>

                        <Separator />

                        {/* Conditions et bouton */}
                        <div className="space-y-4">
                            <div className="rounded-lg bg-muted/50 p-4">
                                <p className="text-xs leading-relaxed text-muted-foreground">
                                    En créant un compte, vous confirmez avoir{' '}
                                    <span className="font-medium text-foreground">
                                        au moins 18 ans
                                    </span>{' '}
                                    et vous acceptez nos{' '}
                                    <TextLink
                                        href="/terms"
                                        className="font-medium text-primary underline hover:text-primary/80"
                                    >
                                        Conditions d'utilisation
                                    </TextLink>{' '}
                                    et notre{' '}
                                    <TextLink
                                        href="/privacy"
                                        className="font-medium text-primary underline hover:text-primary/80"
                                    >
                                        Politique de confidentialité
                                    </TextLink>
                                    .
                                </p>
                            </div>

                            <Button
                                type="submit"
                                className="btn-gradient h-12 w-full text-base font-medium text-white"
                                disabled={processing}
                            >
                                {processing ? (
                                    <>
                                        <Spinner className="mr-2" />
                                        Création du compte...
                                    </>
                                ) : (
                                    <>
                                        <Heart className="mr-2 h-5 w-5 fill-current" />
                                        Créer mon compte gratuitement
                                    </>
                                )}
                            </Button>
                        </div>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <Separator />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-background px-2 text-muted-foreground">
                                    Déjà membre ?
                                </span>
                            </div>
                        </div>

                        <div className="text-center">
                            <p className="text-sm text-muted-foreground">
                                Tu as déjà un compte ?{' '}
                                <TextLink
                                    href={login()}
                                    className="font-semibold text-primary hover:text-primary/80"
                                >
                                    Se connecter
                                </TextLink>
                            </p>
                        </div>
                    </>
                )}
            </Form>
        </AuthLayout>
    );
}
