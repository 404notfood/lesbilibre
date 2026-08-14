import { Head } from '@inertiajs/react';
import AuthLayout from '@/layouts/auth-layout';

export default function Privacy() {
    return (
        <AuthLayout>
            <Head title="Politique de confidentialité" />

            <div className="mx-auto max-w-4xl px-4 py-12">
                <h1 className="mb-8 text-4xl font-bold text-gray-900 dark:text-white">
                    Politique de confidentialité
                </h1>

                <div className="prose prose-lg dark:prose-invert max-w-none space-y-6 text-gray-700 dark:text-gray-300">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Dernière mise à jour : 28 février 2026
                    </p>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">1. Introduction</h2>
                        <p>
                            Bienvenue sur LesbiLibre. Nous accordons une importance primordiale à la protection de vos données personnelles
                            et nous nous engageons à respecter votre vie privée. Cette politique de confidentialité explique comment nous
                            collectons, utilisons, partageons et protégeons vos informations personnelles conformément au Règlement Général
                            sur la Protection des Données (RGPD).
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">2. Responsable du traitement</h2>
                        <p>
                            Le responsable du traitement des données est LesbiLibre, plateforme de rencontres dédiée aux femmes.<br />
                            Pour toute question relative à vos données personnelles, vous pouvez nous contacter à : <a href="mailto:privacy@lesbi-libre.com" className="text-pink-600 hover:underline">privacy@lesbi-libre.com</a>
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">3. Données collectées</h2>
                        <p>Nous collectons les types de données suivantes :</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li><strong>Données d'identification :</strong> pseudo, prénom, âge, adresse email</li>
                            <li><strong>Données de profil :</strong> photos, bio, orientation sexuelle, ville, centres d'intérêt, langues parlées</li>
                            <li><strong>Données de localisation :</strong> ville et coordonnées GPS pour le calcul des distances</li>
                            <li><strong>Données d'activité :</strong> likes, matches, messages, visites de profil</li>
                            <li><strong>Données de paiement :</strong> informations de transaction (via Stripe), abonnements Premium</li>
                            <li><strong>Données techniques :</strong> adresse IP, type de navigateur, cookies</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">4. Finalités du traitement</h2>
                        <p>Vos données sont utilisées pour :</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Créer et gérer votre compte utilisateur</li>
                            <li>Proposer un service de matching et mise en relation</li>
                            <li>Faciliter la communication entre membres</li>
                            <li>Améliorer nos services et développer de nouvelles fonctionnalités</li>
                            <li>Gérer les abonnements Premium et les transactions</li>
                            <li>Assurer la sécurité de la plateforme et lutter contre les abus</li>
                            <li>Vous envoyer des notifications importantes (avec votre consentement pour les communications marketing)</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">5. Base légale du traitement</h2>
                        <p>Nous traitons vos données sur les bases légales suivantes :</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li><strong>Exécution du contrat :</strong> pour fournir nos services de rencontre</li>
                            <li><strong>Consentement :</strong> pour l'envoi de notifications marketing, cookies non essentiels</li>
                            <li><strong>Intérêt légitime :</strong> pour améliorer nos services et assurer la sécurité</li>
                            <li><strong>Obligation légale :</strong> pour respecter nos obligations réglementaires</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">6. Partage des données</h2>
                        <p>
                            Nous ne vendons jamais vos données personnelles. Vos données peuvent être partagées uniquement dans les cas suivants :
                        </p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li><strong>Autres membres :</strong> les informations de votre profil public sont visibles par les autres utilisatrices</li>
                            <li><strong>Prestataires de services :</strong> hébergement (serveurs sécurisés), paiement (Stripe), email (conformes RGPD)</li>
                            <li><strong>Autorités légales :</strong> si requis par la loi ou pour protéger nos droits</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">7. Conservation des données</h2>
                        <p>Vos données sont conservées pendant :</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li><strong>Compte actif :</strong> tant que votre compte existe</li>
                            <li><strong>Après suppression :</strong> 30 jours pour permettre une récupération, puis suppression définitive</li>
                            <li><strong>Données légales :</strong> certaines données peuvent être conservées plus longtemps pour respecter nos obligations légales</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">8. Vos droits</h2>
                        <p>Conformément au RGPD, vous disposez des droits suivants :</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li><strong>Droit d'accès :</strong> obtenir une copie de vos données</li>
                            <li><strong>Droit de rectification :</strong> corriger vos données inexactes</li>
                            <li><strong>Droit à l'effacement :</strong> supprimer vos données (droit à l'oubli)</li>
                            <li><strong>Droit à la portabilité :</strong> récupérer vos données dans un format exploitable</li>
                            <li><strong>Droit d'opposition :</strong> vous opposer au traitement de vos données</li>
                            <li><strong>Droit de limitation :</strong> limiter le traitement dans certains cas</li>
                        </ul>
                        <p className="mt-4">
                            Pour exercer vos droits, contactez-nous à <a href="mailto:privacy@lesbi-libre.com" className="text-pink-600 hover:underline">privacy@lesbi-libre.com</a>
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">9. Sécurité des données</h2>
                        <p>
                            Nous mettons en œuvre des mesures techniques et organisationnelles pour protéger vos données :
                        </p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Chiffrement HTTPS pour toutes les communications</li>
                            <li>Chiffrement des mots de passe avec algorithme bcrypt</li>
                            <li>Serveurs sécurisés en Europe (conformes RGPD)</li>
                            <li>Accès limité aux données par notre personnel</li>
                            <li>Sauvegardes régulières et plan de continuité</li>
                            <li>Modération active contre les abus</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">10. Cookies</h2>
                        <p>
                            Nous utilisons des cookies pour améliorer votre expérience :
                        </p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li><strong>Cookies essentiels :</strong> nécessaires au fonctionnement du site (session, sécurité)</li>
                            <li><strong>Cookies de préférence :</strong> mémorisation de vos choix (langue, thème)</li>
                            <li><strong>Cookies analytiques :</strong> statistiques d'utilisation anonymisées</li>
                        </ul>
                        <p className="mt-4">
                            Vous pouvez gérer vos préférences cookies dans les paramètres de votre navigateur.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">11. Modifications</h2>
                        <p>
                            Nous pouvons modifier cette politique de confidentialité. En cas de changement significatif,
                            nous vous en informerons par email ou via une notification sur la plateforme.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">12. Contact et réclamation</h2>
                        <p>
                            Pour toute question : <a href="mailto:privacy@lesbi-libre.com" className="text-pink-600 hover:underline">privacy@lesbi-libre.com</a><br />
                            Vous avez également le droit de déposer une réclamation auprès de la CNIL : <a href="https://www.cnil.fr" target="_blank" rel="noopener" className="text-pink-600 hover:underline">www.cnil.fr</a>
                        </p>
                    </section>
                </div>
            </div>
        </AuthLayout>
    );
}
