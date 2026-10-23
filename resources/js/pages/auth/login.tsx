import InputError from '@/components/input-error';
import GoogleAuthButton from '@/components/google-auth-button';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Spinner } from '@/components/ui/spinner';
import AuthLayout from '@/layouts/auth-layout';
import { register } from '@/routes';
import { store } from '@/routes/login';
import { request } from '@/routes/password';
import { Form, Head } from '@inertiajs/react';
import { Heart } from 'lucide-react';

interface LoginProps {
    googleEnabled?: boolean;
    status?: string;
    canResetPassword: boolean;
    canRegister: boolean;
}

export default function Login({
    status,
    canResetPassword,
    canRegister,
    googleEnabled = false,
}: LoginProps): JSX.Element {
    return (
        <AuthLayout
            title="Bon retour parmi nous"
            description="Retrouve tes matchs, tes conversations et les liens qui comptent."
        >
            <Head title="Connexion" />
            {googleEnabled && <GoogleAuthButton />}

            {status && (
                <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20">
                    <p className="text-center text-sm text-green-800 dark:text-green-200">
                        {status}
                    </p>
                </div>
            )}

            <Form
                {...store.form()}
                resetOnSuccess={['password']}
                className="space-y-6"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label
                                    htmlFor="login"
                                    className="text-sm font-medium"
                                >
                                    Pseudo ou adresse email
                                </Label>
                                <Input
                                    id="login"
                                    type="text"
                                    name="login"
                                    required
                                    autoFocus
                                    autoComplete="username"
                                    placeholder="Ton pseudo ou ton e-mail"
                                    className="h-11"
                                />
                                <InputError message={errors.login} />
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label
                                        htmlFor="password"
                                        className="text-sm font-medium"
                                    >
                                        Mot de passe
                                    </Label>
                                    {canResetPassword && (
                                        <TextLink
                                            href={request()}
                                            className="text-sm font-medium text-primary hover:text-primary/80"
                                        >
                                            Mot de passe oublié ?
                                        </TextLink>
                                    )}
                                </div>
                                <PasswordInput
                                    id="password"
                                    name="password"
                                    required
                                    autoComplete="current-password"
                                    placeholder="••••••••"
                                    className="h-11"
                                />
                                <InputError message={errors.password} />
                            </div>

                            <div className="flex items-center gap-2">
                                <Checkbox id="remember" name="remember" />
                                <Label
                                    htmlFor="remember"
                                    className="cursor-pointer text-sm font-normal"
                                >
                                    Se souvenir de moi
                                </Label>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="btn-gradient h-11 w-full font-medium text-white"
                            disabled={processing}
                            data-test="login-button"
                        >
                            {processing ? (
                                <>
                                    <Spinner className="mr-2" />
                                    Connexion en cours...
                                </>
                            ) : (
                                <>
                                    <Heart className="mr-2 h-4 w-4" />
                                    Se connecter
                                </>
                            )}
                        </Button>

                        {canRegister && (
                            <>
                                <div className="relative">
                                    <div className="absolute inset-0 flex items-center">
                                        <Separator />
                                    </div>
                                    <div className="relative flex justify-center text-xs uppercase">
                                        <span className="bg-background px-2 text-muted-foreground">
                                            Ou
                                        </span>
                                    </div>
                                </div>

                                <div className="text-center">
                                    <p className="text-sm text-muted-foreground">
                                        Pas encore de compte ?{' '}
                                        <TextLink
                                            href={register()}
                                            className="font-semibold text-primary hover:text-primary/80"
                                        >
                                            Créer un compte gratuitement
                                        </TextLink>
                                    </p>
                                </div>
                            </>
                        )}
                    </>
                )}
            </Form>
        </AuthLayout>
    );
}
