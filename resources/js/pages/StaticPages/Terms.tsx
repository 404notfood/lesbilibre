import { Head } from '@inertiajs/react';
import AuthLayout from '@/layouts/auth-layout';

export default function Terms() {
    return (
        <AuthLayout>
            <Head title="Conditions d'utilisation" />

            <div className="mx-auto max-w-4xl px-4 py-12">
                <h1 className="mb-8 text-4xl font-bold text-gray-900 dark:text-white">
                    Conditions d'utilisation
                </h1>

                <div className="prose prose-lg dark:prose-invert max-w-none space-y-6 text-gray-700 dark:text-gray-300">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Dernière mise à jour : 28 février 2026
                    </p>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">1. Acceptation des conditions</h2>
                        <p>
                            En créant un compte sur LesbiLibre, vous acceptez les présentes conditions d'utilisation. Si vous n'acceptez pas ces conditions,
                            veuillez ne pas utiliser notre service.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">2. Description du service</h2>
                        <p>
                            LesbiLibre est une plateforme de rencontres en ligne dédiée aux femmes qui cherchent à créer des connexions authentiques.
                            Nous proposons des fonctionnalités de matching, de chat en temps réel, et un environnement sécurisé pour faciliter les rencontres.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">3. Conditions d'inscription</h2>
                        <p>Pour utiliser LesbiLibre, vous devez :</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Avoir au moins 18 ans révolus</li>
                            <li>Créer un compte avec des informations véridiques</li>
                            <li>Ne créer qu'un seul compte personnel</li>
                            <li>Maintenir la confidentialité de votre mot de passe</li>
                            <li>Ne pas usurper l'identité d'une autre personne</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">4. Règles de conduite</h2>
                        <p>Vous vous engagez à :</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Respecter les autres membres de la communauté</li>
                            <li>Ne pas publier de contenu offensant, haineux ou illégal</li>
                            <li>Ne pas harceler, menacer ou intimider d'autres utilisatrices</li>
                            <li>Ne pas utiliser la plateforme à des fins commerciales sans autorisation</li>
                            <li>Ne pas envoyer de spam ou de messages automatisés</li>
                            <li>Ne pas partager de contenu à caractère pornographique</li>
                            <li>Signaler tout comportement inapproprié</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">5. Contenu utilisateur</h2>
                        <p>
                            Vous êtes responsable du contenu que vous publiez (photos, messages, bio). En publiant du contenu sur LesbiLibre :
                        </p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Vous garantissez détenir tous les droits nécessaires sur ce contenu</li>
                            <li>Vous nous accordez une licence d'utilisation pour afficher ce contenu</li>
                            <li>Vous acceptez que nous puissions modérer ou supprimer tout contenu inapproprié</li>
                            <li>Vous reconnaissez que votre contenu peut être vu par d'autres membres</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">6. Vérification et sécurité</h2>
                        <p>
                            Pour garantir un espace sûr, nous mettons en place :
                        </p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Une vérification d'identité pour certains profils</li>
                            <li>Une modération active des contenus et comportements</li>
                            <li>Des outils de signalement et de blocage</li>
                            <li>Le droit de suspendre ou supprimer tout compte enfreignant ces conditions</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">7. Abonnements Premium</h2>
                        <p>Les abonnements Premium sont soumis aux conditions suivantes :</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Les abonnements sont renouvelés automatiquement sauf résiliation</li>
                            <li>Vous pouvez résilier à tout moment depuis votre profil</li>
                            <li>Garantie satisfait ou remboursé de 30 jours sur le premier abonnement</li>
                            <li>Les prix sont indiqués TTC et peuvent varier selon les offres promotionnelles</li>
                            <li>Le paiement est sécurisé via Stripe</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">8. Gemmes virtuelles</h2>
                        <p>
                            Les gemmes sont une monnaie virtuelle utilisée pour acheter des cadeaux virtuels :
                        </p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Les gemmes n'ont aucune valeur monétaire réelle</li>
                            <li>Elles ne peuvent pas être échangées contre de l'argent</li>
                            <li>Elles ne sont pas remboursables (sauf cas légaux)</li>
                            <li>Elles restent valables tant que votre compte est actif</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">9. Propriété intellectuelle</h2>
                        <p>
                            LesbiLibre et ses contenus (logo, design, code, textes) sont protégés par le droit d'auteur.
                            Vous ne pouvez pas copier, modifier ou distribuer ces éléments sans notre autorisation expresse.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">10. Limitation de responsabilité</h2>
                        <p>
                            LesbiLibre est une plateforme de mise en relation. Nous ne pouvons pas garantir :
                        </p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>La véracité des informations fournies par les autres membres</li>
                            <li>Le comportement des utilisatrices en dehors de la plateforme</li>
                            <li>La disponibilité ininterrompue du service</li>
                            <li>L'absence totale de bugs ou d'erreurs techniques</li>
                        </ul>
                        <p className="mt-4">
                            Vous utilisez la plateforme à vos propres risques. Nous vous encourageons à faire preuve de prudence
                            lors de vos rencontres et à signaler tout comportement suspect.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">11. Suspension et résiliation</h2>
                        <p>
                            Nous nous réservons le droit de suspendre ou supprimer votre compte en cas de :
                        </p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Violation de ces conditions d'utilisation</li>
                            <li>Comportement abusif ou harcèlement</li>
                            <li>Fraude ou activité illégale</li>
                            <li>Compte inactif pendant plus de 12 mois</li>
                        </ul>
                        <p className="mt-4">
                            Vous pouvez supprimer votre compte à tout moment depuis vos paramètres.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">12. Modifications des conditions</h2>
                        <p>
                            Nous pouvons modifier ces conditions à tout moment. Les modifications significatives vous seront
                            notifiées par email ou via l'application. Votre utilisation continue du service après ces modifications
                            constitue votre acceptation des nouvelles conditions.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">13. Droit applicable</h2>
                        <p>
                            Les présentes conditions sont régies par le droit français. Tout litige sera soumis aux tribunaux compétents
                            de Paris, sauf dispositions légales impératives contraires.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">14. Contact</h2>
                        <p>
                            Pour toute question concernant ces conditions :<br />
                            Email : <a href="mailto:support@lesbi-libre.com" className="text-pink-600 hover:underline">support@lesbi-libre.com</a><br />
                            Adresse : LesbiLibre, Service Juridique, Paris, France
                        </p>
                    </section>

                    <p className="text-center mt-8 text-sm text-gray-500 dark:text-gray-400">
                        En utilisant LesbiLibre, vous reconnaissez avoir lu, compris et accepté ces conditions d'utilisation.
                    </p>
                </div>
            </div>
        </AuthLayout>
    );
}
