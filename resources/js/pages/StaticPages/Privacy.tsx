import PublicLayout from '@/layouts/public-layout';
import { Head } from '@inertiajs/react';

export default function Privacy() {
    return (
        <PublicLayout>
            <Head title="Politique de confidentialité" />

            <div className="mx-auto max-w-4xl px-4 py-12">
                <h1 className="mb-8 text-4xl font-bold text-gray-900 dark:text-white">
                    Politique de confidentialité
                </h1>

                <div className="prose prose-lg dark:prose-invert max-w-none space-y-6 text-gray-700 dark:text-gray-300">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Dernière mise à jour : 21 octobre 2026
                    </p>

                    <section>
                        <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
                            1. Introduction
                        </h2>
                        <p>
                            Bienvenue sur LesbiLibre. Nous accordons une
                            importance primordiale à la protection de vos
                            données personnelles et nous nous engageons à
                            respecter votre vie privée. Cette politique de
                            confidentialité explique comment nous collectons,
                            utilisons, partageons et protégeons vos informations
                            personnelles. Elle décrit notamment l’accès de
                            l’administration aux contenus avant leur diffusion.
                        </p>
                    </section>

                    <section>
                        <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
                            2. Responsable du traitement
                        </h2>
                        <p>
                            Le responsable du traitement des données est
                            LesbiLibre, plateforme de rencontres dédiée aux
                            femmes.
                            <br />
                            Pour toute question relative à vos données
                            personnelles, vous pouvez nous contacter à :{' '}
                            <a
                                href="mailto:privacy@lesbi-libre.com"
                                className="text-pink-600 hover:underline"
                            >
                                privacy@lesbi-libre.com
                            </a>
                        </p>
                    </section>

                    <section>
                        <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
                            3. Données collectées
                        </h2>
                        <p>Nous collectons les types de données suivantes :</p>
                        <ul className="list-disc space-y-2 pl-6">
                            <li>
                                <strong>Données d'identification :</strong>{' '}
                                pseudo, prénom, âge, adresse email
                            </li>
                            <li>
                                <strong>Données de profil :</strong> photos,
                                bio, orientation sexuelle, ville, centres
                                d'intérêt, langues parlées
                            </li>
                            <li>
                                <strong>Données de localisation :</strong> ville
                                et coordonnées GPS pour le calcul des distances
                            </li>
                            <li>
                                <strong>Données d'activité :</strong> likes,
                                matches, messages, visites de profil
                            </li>
                            <li>
                                <strong>Données de paiement :</strong>{' '}
                                informations de transaction (via Stripe),
                                abonnements Premium
                            </li>
                            <li>
                                <strong>Données techniques :</strong> adresse
                                IP, type de navigateur, cookies
                            </li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
                            4. Finalités du traitement
                        </h2>
                        <p>Vos données sont utilisées pour :</p>
                        <ul className="list-disc space-y-2 pl-6">
                            <li>Créer et gérer votre compte utilisateur</li>
                            <li>
                                Proposer un service de matching et mise en
                                relation
                            </li>
                            <li>Faciliter la communication entre membres</li>
                            <li>
                                Améliorer nos services et développer de
                                nouvelles fonctionnalités
                            </li>
                            <li>
                                Gérer les abonnements Premium et les
                                transactions
                            </li>
                            <li>
                                Examiner chaque message, photo, vidéo et pièce
                                jointe avant sa diffusion pour lutter contre les
                                abus
                            </li>
                            <li>
                                Vous envoyer des notifications importantes (avec
                                votre consentement pour les communications
                                marketing)
                            </li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
                            5. Base légale du traitement
                        </h2>
                        <p>
                            Nous traitons vos données sur les bases légales
                            suivantes :
                        </p>
                        <ul className="list-disc space-y-2 pl-6">
                            <li>
                                <strong>Exécution du contrat :</strong> pour
                                fournir nos services de rencontre
                            </li>
                            <li>
                                <strong>Consentement :</strong> pour l'envoi de
                                notifications marketing, cookies non essentiels
                            </li>
                            <li>
                                <strong>Intérêt légitime :</strong> pour
                                améliorer nos services et assurer la sécurité
                            </li>
                            <li>
                                <strong>Obligation légale :</strong> pour
                                respecter nos obligations réglementaires
                            </li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
                            6. Partage des données
                        </h2>
                        <p>
                            Nous ne vendons jamais vos données personnelles. Vos
                            données peuvent être partagées uniquement dans les
                            cas suivants :
                        </p>
                        <ul className="list-disc space-y-2 pl-6">
                            <li>
                                <strong>Autres membres :</strong> votre pseudo
                                et les informations que vous rendez visibles
                                dans l’espace membre sont affichés selon vos
                                réglages et les droits d’accès ; votre adresse
                                e-mail n’est pas affichée aux autres membres
                            </li>
                            <li>
                                <strong>Administration et modération :</strong>{' '}
                                les administrateurs habilités lisent chaque
                                message et examinent chaque photo, vidéo et
                                pièce jointe avant diffusion, y compris en
                                conversation, en galerie privée et pour les
                                médias éphémères. Cet examen a lieu sans
                                attendre un signalement
                            </li>
                            <li>
                                <strong>Prestataires de services :</strong>{' '}
                                hébergement, paiement (Stripe) et acheminement
                                des e-mails selon les services configurés
                            </li>
                            <li>
                                <strong>Autorités légales :</strong> si requis
                                par la loi ou pour protéger nos droits
                            </li>
                        </ul>
                        <p className="mt-4">
                            Les conversations ne sont pas chiffrées de bout en
                            bout. Une galerie privée limite l’accès des autres
                            membres, mais ne retire pas l’accès des
                            administrateurs habilités à la modération. Un
                            contenu en attente ou rejeté n’est pas diffusé à sa
                            destinataire. Aucun délai de validation n’est
                            garanti.
                        </p>
                    </section>

                    <section>
                        <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
                            7. Conservation des données
                        </h2>
                        <p>Vos données sont conservées pendant :</p>
                        <ul className="list-disc space-y-2 pl-6">
                            <li>
                                <strong>Compte actif :</strong> tant que votre
                                compte existe
                            </li>
                            <li>
                                <strong>
                                    À votre demande de suppression :
                                </strong>{' '}
                                votre compte est fermé immédiatement et les
                                administrateurs sont notifiés. Le profil est
                                retiré des rencontres et l’accès au compte est
                                coupé
                            </li>
                            <li>
                                <strong>Effacement définitif :</strong> les
                                données attendent le traitement de votre demande
                                par un administrateur ; elles ne sont pas
                                automatiquement effacées par la fermeture. Seul
                                un administrateur peut déclencher l’effacement
                                définitif
                            </li>
                            <li>
                                <strong>Signalements :</strong> les éléments
                                nécessaires à un examen peuvent être conservés
                                pendant son traitement ; bloquer un compte ou
                                fermer le sien ne supprime pas automatiquement
                                ces éléments
                            </li>
                            <li>
                                <strong>Données légales :</strong> certaines
                                données peuvent être conservées plus longtemps
                                pour respecter nos obligations légales
                            </li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
                            8. Vos droits
                        </h2>
                        <p>
                            Conformément au RGPD, vous disposez des droits
                            suivants :
                        </p>
                        <ul className="list-disc space-y-2 pl-6">
                            <li>
                                <strong>Droit d'accès :</strong> obtenir une
                                copie de vos données
                            </li>
                            <li>
                                <strong>Droit de rectification :</strong>{' '}
                                corriger vos données inexactes
                            </li>
                            <li>
                                <strong>Droit à l'effacement :</strong>{' '}
                                supprimer vos données (droit à l'oubli)
                            </li>
                            <li>
                                <strong>Droit à la portabilité :</strong>{' '}
                                récupérer vos données dans un format exploitable
                            </li>
                            <li>
                                <strong>Droit d'opposition :</strong> vous
                                opposer au traitement de vos données
                            </li>
                            <li>
                                <strong>Droit de limitation :</strong> limiter
                                le traitement dans certains cas
                            </li>
                        </ul>
                        <p className="mt-4">
                            Pour exercer vos droits, contactez-nous à{' '}
                            <a
                                href="mailto:privacy@lesbi-libre.com"
                                className="text-pink-600 hover:underline"
                            >
                                privacy@lesbi-libre.com
                            </a>
                        </p>
                    </section>

                    <section>
                        <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
                            9. Sécurité des données
                        </h2>
                        <p>
                            Nous mettons en œuvre des mesures techniques et
                            organisationnelles pour protéger vos données :
                        </p>
                        <ul className="list-disc space-y-2 pl-6">
                            <li>
                                Mots de passe hachés avant leur enregistrement
                            </li>
                            <li>
                                Contrôles d’accès aux conversations et aux
                                médias selon les droits des membres
                            </li>
                            <li>
                                Examen humain préalable des messages et médias
                                par les administrateurs habilités
                            </li>
                            <li>
                                Outils de blocage, signalement et restriction
                                des interactions
                            </li>
                            <li>
                                Notifications push sans contenu de message ;
                                l’affichage du pseudo de l’expéditrice dépend de
                                la configuration du service
                            </li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
                            10. Cookies
                        </h2>
                        <p>
                            Nous utilisons des cookies pour améliorer votre
                            expérience :
                        </p>
                        <ul className="list-disc space-y-2 pl-6">
                            <li>
                                <strong>Cookies essentiels :</strong>{' '}
                                nécessaires au fonctionnement du site (session,
                                sécurité)
                            </li>
                            <li>
                                <strong>Cookies de préférence :</strong>{' '}
                                mémorisation de vos choix (langue, thème)
                            </li>
                            <li>
                                <strong>Cookies analytiques :</strong>{' '}
                                statistiques d'utilisation anonymisées
                            </li>
                        </ul>
                        <p className="mt-4">
                            Vous pouvez gérer vos préférences cookies dans les
                            paramètres de votre navigateur.
                        </p>
                    </section>

                    <section>
                        <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
                            11. Modifications
                        </h2>
                        <p>
                            Nous pouvons modifier cette politique de
                            confidentialité. En cas de changement significatif,
                            nous vous en informerons par email ou via une
                            notification sur la plateforme.
                        </p>
                    </section>

                    <section>
                        <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
                            12. Contact et réclamation
                        </h2>
                        <p>
                            Pour toute question :{' '}
                            <a
                                href="mailto:privacy@lesbi-libre.com"
                                className="text-pink-600 hover:underline"
                            >
                                privacy@lesbi-libre.com
                            </a>
                            <br />
                            Vous avez également le droit de déposer une
                            réclamation auprès de la CNIL :{' '}
                            <a
                                href="https://www.cnil.fr"
                                target="_blank"
                                rel="noopener"
                                className="text-pink-600 hover:underline"
                            >
                                www.cnil.fr
                            </a>
                        </p>
                    </section>
                </div>
            </div>
        </PublicLayout>
    );
}
