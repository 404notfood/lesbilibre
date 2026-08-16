import { Head } from '@inertiajs/react';
import PublicLayout from '@/layouts/public-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, MessageCircle, Shield, HelpCircle } from 'lucide-react';

export default function Contact() {
    return (
        <PublicLayout>
            <Head title="Contact" />

            <div className="mx-auto max-w-4xl px-4 py-12">
                <h1 className="mb-8 text-4xl font-bold text-gray-900 dark:text-white">
                    Contactez-nous
                </h1>

                <div className="space-y-6">
                    <p className="text-lg text-gray-600 dark:text-gray-400">
                        Notre équipe est à votre écoute pour répondre à toutes vos questions et préoccupations.
                    </p>

                    <div className="grid gap-6 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-pink-100 dark:bg-pink-900 rounded-lg">
                                        <Mail className="h-6 w-6 text-pink-600 dark:text-pink-400" />
                                    </div>
                                    <div>
                                        <CardTitle>Support général</CardTitle>
                                        <CardDescription>Pour toutes vos questions</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                    Contactez notre équipe de support pour toute question concernant votre compte,
                                    les fonctionnalités de la plateforme ou pour obtenir de l'aide.
                                </p>
                                <a href="mailto:support@lesbi-libre.com">
                                    <Button variant="outline" className="w-full">
                                        <Mail className="h-4 w-4 mr-2" />
                                        support@lesbi-libre.com
                                    </Button>
                                </a>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                                        <Shield className="h-6 w-6 text-red-600 dark:text-red-400" />
                                    </div>
                                    <div>
                                        <CardTitle>Sécurité et abus</CardTitle>
                                        <CardDescription>Signalez un problème</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                    Si vous avez été victime de harcèlement, d'abus ou si vous souhaitez signaler
                                    un comportement inapproprié, contactez-nous immédiatement.
                                </p>
                                <a href="mailto:security@lesbi-libre.com">
                                    <Button variant="outline" className="w-full">
                                        <Shield className="h-4 w-4 mr-2" />
                                        security@lesbi-libre.com
                                    </Button>
                                </a>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                                        <MessageCircle className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                                    </div>
                                    <div>
                                        <CardTitle>Partenariats</CardTitle>
                                        <CardDescription>Collaborations et partenariats</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                    Vous souhaitez collaborer avec nous ou proposer un partenariat ?
                                    Notre équipe business sera ravie d'échanger avec vous.
                                </p>
                                <a href="mailto:partnerships@lesbi-libre.com">
                                    <Button variant="outline" className="w-full">
                                        <MessageCircle className="h-4 w-4 mr-2" />
                                        partnerships@lesbi-libre.com
                                    </Button>
                                </a>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                                        <HelpCircle className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <div>
                                        <CardTitle>Aide et FAQ</CardTitle>
                                        <CardDescription>Questions fréquentes</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                    Consultez notre FAQ pour trouver rapidement des réponses aux questions
                                    les plus courantes.
                                </p>
                                <a href="/faq">
                                    <Button variant="outline" className="w-full">
                                        <HelpCircle className="h-4 w-4 mr-2" />
                                        Consulter la FAQ
                                    </Button>
                                </a>
                            </CardContent>
                        </Card>
                    </div>

                    <Card className="mt-8">
                        <CardHeader>
                            <CardTitle>Temps de réponse</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Notre équipe s'engage à vous répondre dans les meilleurs délais :<br />
                                • Support général : sous 24-48 heures<br />
                                • Sécurité et abus : sous 12 heures (prioritaire)<br />
                                • Partenariats : sous 3-5 jours ouvrés
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </PublicLayout>
    );
}
