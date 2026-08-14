import InputError from '@/components/input-error';
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
    status?: string;
    canResetPassword: boolean;
    canRegister: boolean;
}

export default function Login({
    status,
    canResetPassword,
    canRegister,
}: LoginProps): JSX.Element {
    return (
        <AuthLayout
            title="Bon retour parmi nous"
            description="Connectez-vous pour retrouver vos matches et conversations"
        >
            <Head title="Connexion" />

            {status && (
                <div className="mb-6 p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                    <p className="text-sm text-green-800 dark:text-green-200 text-center">
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
                                <Label htmlFor="login" className="text-sm font-medium">
                                    Pseudo ou adresse email
                                </Label>
                                <Input
                                    id="login"
                                    type="text"
                                    name="login"
                                    required
                                    autoFocus
                                    tabIndex={1}
                                    autoComplete="username"
                                    placeholder="Votre pseudo ou email"
                                    className="h-11"
                                />
                                <InputError message={errors.login} />
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="password" className="text-sm font-medium">
                                        Mot de passe
                                    </Label>
                                    {canResetPassword && (
                                        <TextLink
                                            href={request()}
                                            className="text-sm font-medium text-primary hover:text-primary/80"
                                            tabIndex={5}
                                        >
                                            Mot de passe oublié ?
                                        </TextLink>
                                    )}
                                </div>
                                <Input
                                    id="password"
                                    type="password"
                                    name="password"
                                    required
                                    tabIndex={2}
                                    autoComplete="current-password"
                                    placeholder="••••••••"
                                    className="h-11"
                                />
                                <InputError message={errors.password} />
                            </div>

                            <div className="flex items-center gap-2">
                                <Checkbox
                                    id="remember"
                                    name="remember"
                                    tabIndex={3}
                                />
                                <Label
                                    htmlFor="remember"
                                    className="text-sm font-normal cursor-pointer"
                                >
                                    Se souvenir de moi
                                </Label>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-11 btn-gradient text-white font-medium"
                            tabIndex={4}
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
                                        Vous n'avez pas encore de compte ?{' '}
                                        <TextLink
                                            href={register()}
                                            className="font-semibold text-primary hover:text-primary/80"
                                            tabIndex={6}
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
