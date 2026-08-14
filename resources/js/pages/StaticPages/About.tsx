import { Head } from '@inertiajs/react';
import AuthLayout from '@/layouts/auth-layout';

export default function About() {
    return (
        <AuthLayout>
            <Head title="À propos" />

            <div className="mx-auto max-w-4xl px-4 py-12">
                <h1 className="mb-8 text-4xl font-bold text-gray-900 dark:text-white">
                    À propos de Lesbi-Libre
                </h1>

                <div className="prose prose-lg dark:prose-invert max-w-none space-y-6">
                    <section>
                        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                            Notre Mission
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400">
                            Lesbi-Libre est une plateforme de rencontres 100% féminine dédiée aux femmes qui cherchent
                            à créer des connexions authentiques et sincères. Notre mission est de fournir un espace sûr,
                            bienveillant et inclusif où chaque femme peut être elle-même et rencontrer des personnes partageant
                            ses valeurs.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                            Nos Valeurs
                        </h2>
                        <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-400">
                            <li><strong>Authenticité</strong> - Nous encourageons chaque utilisatrice à être elle-même</li>
                            <li><strong>Sécurité</strong> - Vérification d'identité et modération active</li>
                            <li><strong>Respect</strong> - Tolérance zéro pour le harcèlement et les comportements inappropriés</li>
                            <li><strong>Inclusivité</strong> - Un espace ouvert à toutes les femmes, sans discrimination</li>
                            <li><strong>Confidentialité</strong> - Protection rigoureuse de vos données personnelles</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                            Notre Histoire
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400">
                            Créée en 2025, Lesbi-Libre est née du constat qu'il manquait une plateforme de rencontres véritablement
                            pensée pour et par des femmes. Nous avons construit cette communauté avec l'objectif de créer un environnement
                            où les femmes peuvent se connecter en toute confiance, partager leurs passions et construire des relations
                            durables.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                            Fonctionnalités
                        </h2>
                        <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-400">
                            <li>Matching intelligent basé sur vos préférences et localisation</li>
                            <li>Chat en temps réel pour des échanges instantanés</li>
                            <li>Système de vérification pour garantir l'authenticité des profils</li>
                            <li>Badges et récompenses pour les membres actifs</li>
                            <li>Options Premium pour des fonctionnalités avancées</li>
                            <li>Modération active pour assurer un environnement sain</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                            Contact
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400">
                            Des questions ? N'hésitez pas à nous contacter via notre{' '}
                            <a href="/contact" className="text-pink-600 hover:text-pink-700 dark:text-pink-400">
                                page de contact
                            </a>.
                        </p>
                    </section>
                </div>
            </div>
        </AuthLayout>
    );
}
