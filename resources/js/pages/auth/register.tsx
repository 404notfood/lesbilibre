import { login } from '@/routes';
import { store } from '@/routes/register';
import { Form, Head } from '@inertiajs/react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CityAutocomplete } from '@/components/city-autocomplete';
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

export default function Register(): JSX.Element {
    return (
        <AuthLayout
            title="Créez votre compte"
            description="Rejoignez notre communauté et commencez votre aventure"
        >
            <Head title="Inscription" />

            <div className="mb-6 p-4 rounded-lg bg-primary/5 border border-primary/20">
                <div className="flex items-start gap-3">
                    <Sparkles className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <div className="text-sm">
                        <p className="font-medium text-primary mb-1">
                            Bienvenue sur LesbiLibre !
                        </p>
                        <p className="text-muted-foreground">
                            Créez votre profil en quelques étapes et commencez à rencontrer des
                            femmes incroyables près de chez vous.
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
                        {/* Informations de base */}
                        <div className="space-y-4">
                            <div className="space-y-1">
                                <h3 className="text-sm font-semibold text-foreground">
                                    Informations personnelles
                                </h3>
                                <p className="text-xs text-muted-foreground">
                                    Ces informations seront visibles sur votre profil
                                </p>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="pseudo" className="text-sm font-medium">
                                        Pseudo <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="pseudo"
                                        type="text"
                                        required
                                        autoFocus
                                        tabIndex={1}
                                        autoComplete="username"
                                        name="pseudo"
                                        placeholder="Votre pseudo unique"
                                        className="h-11"
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Votre pseudo sera visible sur votre profil et utilisé pour la connexion
                                    </p>
                                    <InputError message={errors.pseudo} />
                                </div>

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="name" className="text-sm font-medium">
                                            Prénom <span className="text-destructive">*</span>
                                        </Label>
                                        <Input
                                            id="name"
                                            type="text"
                                            required
                                            tabIndex={2}
                                            autoComplete="name"
                                            name="name"
                                            placeholder="Votre prénom"
                                            className="h-11"
                                        />
                                        <InputError message={errors.name} />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="age" className="text-sm font-medium">
                                            Âge <span className="text-destructive">*</span>
                                        </Label>
                                        <Input
                                            id="age"
                                            type="number"
                                            required
                                            tabIndex={3}
                                            name="age"
                                            placeholder="25"
                                            min="18"
                                            max="99"
                                            className="h-11"
                                        />
                                        <InputError message={errors.age} />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <CityAutocomplete
                                    name="city"
                                    label="Ville"
                                    placeholder="Commencez à taper le nom de votre ville..."
                                    required
                                    error={errors.city}
                                    className="h-11"
                                />
                                <p className="text-xs text-muted-foreground mt-1.5">
                                    Nous utilisons votre ville pour calculer les distances avec les autres membres
                                </p>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="sexual_orientation" className="text-sm font-medium">
                                        Mon orientation <span className="text-destructive">*</span>
                                    </Label>
                                    <Select name="sexual_orientation" required>
                                        <SelectTrigger className="h-11" tabIndex={5}>
                                            <SelectValue placeholder="Votre orientation" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="lesbian">
                                                Lesbienne
                                            </SelectItem>
                                            <SelectItem value="bisexual">
                                                Bisexuelle
                                            </SelectItem>
                                            <SelectItem value="questioning">
                                                En questionnement
                                            </SelectItem>
                                            <SelectItem value="other">
                                                Autre
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.sexual_orientation} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="interested_in" className="text-sm font-medium">
                                        Intéressée par <span className="text-destructive">*</span>
                                    </Label>
                                    <Select name="interested_in" required>
                                        <SelectTrigger className="h-11" tabIndex={6}>
                                            <SelectValue placeholder="Qui recherchez-vous ?" />
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
                                    <InputError message={errors.interested_in} />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="looking_for" className="text-sm font-medium">
                                    Type de relation recherchée <span className="text-destructive">*</span>
                                </Label>
                                <Select name="looking_for" required>
                                    <SelectTrigger className="h-11" tabIndex={7}>
                                        <SelectValue placeholder="Sélectionnez ce que vous recherchez" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="friendship">
                                            De l'amitié
                                        </SelectItem>
                                        <SelectItem value="dating">
                                            Des rencontres amoureuses
                                        </SelectItem>
                                        <SelectItem value="relationship">
                                            Une relation sérieuse
                                        </SelectItem>
                                        <SelectItem value="casual">
                                            Des rencontres sans prise de tête
                                        </SelectItem>
                                        <SelectItem value="open">
                                            Je suis ouverte à tout
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.looking_for} />
                            </div>
                        </div>

                        <Separator />

                        {/* Informations de connexion */}
                        <div className="space-y-4">
                            <div className="space-y-1">
                                <h3 className="text-sm font-semibold text-foreground">
                                    Informations de connexion
                                </h3>
                                <p className="text-xs text-muted-foreground">
                                    Pour sécuriser votre compte
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-sm font-medium">
                                    Adresse email <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    required
                                    tabIndex={8}
                                    autoComplete="email"
                                    name="email"
                                    placeholder="votre@email.com"
                                    className="h-11"
                                />
                                <InputError message={errors.email} />
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="password" className="text-sm font-medium">
                                        Mot de passe <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        required
                                        tabIndex={9}
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
                                        Confirmation <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="password_confirmation"
                                        type="password"
                                        required
                                        tabIndex={10}
                                        autoComplete="new-password"
                                        name="password_confirmation"
                                        placeholder="••••••••"
                                        className="h-11"
                                    />
                                    <InputError message={errors.password_confirmation} />
                                </div>
                            </div>
                        </div>

                        <Separator />

                        {/* Conditions et bouton */}
                        <div className="space-y-4">
                            <div className="rounded-lg bg-muted/50 p-4">
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                    En créant un compte, vous confirmez avoir{' '}
                                    <span className="font-medium text-foreground">
                                        au moins 18 ans
                                    </span>{' '}
                                    et vous acceptez nos{' '}
                                    <TextLink
                                        href="/terms"
                                        className="font-medium text-primary hover:text-primary/80 underline"
                                    >
                                        Conditions d'utilisation
                                    </TextLink>{' '}
                                    et notre{' '}
                                    <TextLink
                                        href="/privacy"
                                        className="font-medium text-primary hover:text-primary/80 underline"
                                    >
                                        Politique de confidentialité
                                    </TextLink>
                                    .
                                </p>
                            </div>

                            <Button
                                type="submit"
                                className="w-full h-12 btn-gradient text-white font-medium text-base"
                                tabIndex={11}
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
                                Vous avez déjà un compte ?{' '}
                                <TextLink
                                    href={login()}
                                    className="font-semibold text-primary hover:text-primary/80"
                                    tabIndex={12}
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
