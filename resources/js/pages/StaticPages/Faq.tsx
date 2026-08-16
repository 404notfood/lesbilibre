import { Head } from '@inertiajs/react';
import PublicLayout from '@/layouts/public-layout';
import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export default function Faq() {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    const faqs = [
        {
            category: "Compte et inscription",
            questions: [
                {
                    q: "Comment créer un compte sur LesbiLibre ?",
                    a: "Pour créer un compte, cliquez sur le bouton 'S'inscrire' en haut de la page d'accueil. Remplissez le formulaire avec vos informations (pseudo, prénom, âge, ville, email et mot de passe). Vous devez avoir au moins 18 ans pour vous inscrire."
                },
                {
                    q: "Puis-je modifier mes informations de profil ?",
                    a: "Oui, vous pouvez modifier votre profil à tout moment en cliquant sur 'Profil' dans le menu de gauche. Vous pourrez changer votre bio, vos photos, vos centres d'intérêt et vos préférences."
                },
                {
                    q: "Comment supprimer mon compte ?",
                    a: "Pour supprimer votre compte, rendez-vous dans vos paramètres de profil et cliquez sur 'Supprimer mon compte' en bas de page. Cette action est irréversible et toutes vos données seront effacées après 30 jours."
                },
                {
                    q: "J'ai oublié mon mot de passe, que faire ?",
                    a: "Sur la page de connexion, cliquez sur 'Mot de passe oublié'. Entrez votre adresse email et vous recevrez un lien pour réinitialiser votre mot de passe."
                }
            ]
        },
        {
            category: "Matching et recherche",
            questions: [
                {
                    q: "Comment fonctionne le système de matching ?",
                    a: "Notre algorithme vous propose des profils en fonction de vos préférences (orientation, type de relation recherchée), de votre localisation et de votre activité sur la plateforme. Plus votre profil est complet, meilleurs seront les matchs."
                },
                {
                    q: "Que signifie le 'Match Score' ?",
                    a: "Le Match Score est un indicateur de compatibilité calculé en fonction de vos préférences communes, de votre proximité géographique et de vos centres d'intérêt partagés."
                },
                {
                    q: "Comment rechercher des profils près de moi ?",
                    a: "Utilisez le filtre 'Près de moi' sur la page Découvrir. Les profils seront triés par distance croissante dans un rayon de 10 km. Vous pouvez aussi ajuster le rayon de recherche dans les filtres avancés."
                },
                {
                    q: "Puis-je filtrer par âge ou autres critères ?",
                    a: "Oui, cliquez sur l'icône de filtres (entonnoir) en haut de la page Découvrir pour affiner votre recherche par âge, ville, type de relation, et autres critères."
                }
            ]
        },
        {
            category: "Messages et communication",
            questions: [
                {
                    q: "Comment envoyer un message ?",
                    a: "Vous devez d'abord avoir un match avec une personne. Une fois que vous vous êtes likées mutuellement, vous pourrez accéder à 'Mes Chats' et commencer une conversation."
                },
                {
                    q: "Puis-je envoyer des photos dans les messages ?",
                    a: "Actuellement, seuls les messages texte sont supportés. L'envoi de photos sera ajouté dans une prochaine mise à jour."
                },
                {
                    q: "Comment bloquer ou signaler quelqu'un ?",
                    a: "Sur le profil de la personne, cliquez sur les trois points en haut à droite et sélectionnez 'Bloquer' ou 'Signaler'. Les signalements sont examinés par notre équipe de modération dans les 12 heures."
                },
                {
                    q: "Les messages sont-ils lus en temps réel ?",
                    a: "Oui, les messages sont transmis instantanément grâce à notre système de chat en temps réel. Vous verrez quand votre correspondante est en train d'écrire."
                }
            ]
        },
        {
            category: "Premium et paiements",
            questions: [
                {
                    q: "Quels sont les avantages de l'abonnement Premium ?",
                    a: "Avec Premium, vous bénéficiez de likes illimités, vous voyez qui vous a liké, votre profil est boosté (10x plus visible), vos messages sont prioritaires, vous avez un badge Premium, des statistiques avancées, 100 gemmes/mois et la navigation privée."
                },
                {
                    q: "Comment résilier mon abonnement Premium ?",
                    a: "Rendez-vous dans vos paramètres de profil, section 'Abonnement'. Cliquez sur 'Gérer mon abonnement' puis 'Résilier'. L'abonnement restera actif jusqu'à la fin de la période payée."
                },
                {
                    q: "Les gemmes sont-elles remboursables ?",
                    a: "Les gemmes ne sont pas remboursables une fois achetées, sauf cas exceptionnels prévus par la loi (défaut de service, erreur de transaction)."
                },
                {
                    q: "Comment fonctionne la garantie satisfait ou remboursé ?",
                    a: "Pour votre premier abonnement Premium, si vous n'êtes pas satisfaite dans les 30 jours, contactez-nous à support@lesbi-libre.com pour obtenir un remboursement complet."
                }
            ]
        },
        {
            category: "Sécurité et confidentialité",
            questions: [
                {
                    q: "Mes données sont-elles sécurisées ?",
                    a: "Oui, nous utilisons le chiffrement HTTPS, les mots de passe sont chiffrés avec bcrypt, et nos serveurs sont hébergés en Europe (conformes RGPD). Consultez notre Politique de confidentialité pour plus de détails."
                },
                {
                    q: "Qui peut voir mon profil ?",
                    a: "Votre profil est visible uniquement par les autres membres de LesbiLibre. Vous pouvez activer le mode navigation privée (Premium) pour consulter les profils sans laisser de trace."
                },
                {
                    q: "Comment vérifier mon profil ?",
                    a: "La vérification du profil se fait via un selfie avec un geste spécifique. Cela ajoute un badge vérifié à votre profil et augmente votre crédibilité. Cette fonctionnalité sera bientôt disponible."
                },
                {
                    q: "Que faites-vous contre les faux profils ?",
                    a: "Nous avons une modération active, un système de vérification d'identité, et nous analysons les comportements suspects. Vous pouvez signaler tout profil qui vous semble douteux."
                }
            ]
        },
        {
            category: "Badges et gemmes",
            questions: [
                {
                    q: "À quoi servent les badges ?",
                    a: "Les badges récompensent votre activité sur la plateforme (profil complet, premiers likes, matchs, etc.). Ils vous donnent des points et montrent votre engagement dans la communauté."
                },
                {
                    q: "Comment obtenir plus de gemmes ?",
                    a: "Vous pouvez acheter des gemmes dans la Boutique ou en recevoir gratuitement avec l'abonnement Premium (100 gemmes/mois). Certains badges offrent aussi des gemmes en récompense."
                },
                {
                    q: "À quoi servent les cadeaux virtuels ?",
                    a: "Les cadeaux virtuels permettent de vous démarquer et montrer votre intérêt de manière originale. Ils apparaissent sur le profil de la personne qui les reçoit."
                }
            ]
        },
        {
            category: "Problèmes techniques",
            questions: [
                {
                    q: "L'application ne charge pas, que faire ?",
                    a: "Essayez de vider le cache de votre navigateur, de vous reconnecter, ou d'utiliser un autre navigateur. Si le problème persiste, contactez-nous à support@lesbi-libre.com."
                },
                {
                    q: "Je ne reçois pas les notifications",
                    a: "Vérifiez que les notifications sont activées dans vos paramètres de profil et dans les paramètres de votre navigateur. Pour Chrome : Paramètres > Confidentialité et sécurité > Paramètres du site > Notifications."
                },
                {
                    q: "Ma photo ne s'affiche pas",
                    a: "Assurez-vous que votre photo respecte nos critères : format JPG/PNG, taille maximale 5 Mo, contenu approprié. Si le problème persiste, essayez de télécharger une autre photo."
                }
            ]
        }
    ];

    return (
        <PublicLayout>
            <Head title="FAQ" />

            <div className="mx-auto max-w-4xl px-4 py-12">
                <h1 className="mb-4 text-4xl font-bold text-gray-900 dark:text-white">
                    Questions fréquentes (FAQ)
                </h1>
                <p className="mb-8 text-gray-600 dark:text-gray-400">
                    Vous ne trouvez pas la réponse à votre question ? Contactez-nous à <a href="mailto:support@lesbi-libre.com" className="text-pink-600 hover:underline">support@lesbi-libre.com</a>
                </p>

                <div className="space-y-8">
                    {faqs.map((section, sectionIdx) => (
                        <div key={sectionIdx}>
                            <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white border-b pb-2 border-gray-200 dark:border-gray-700">
                                {section.category}
                            </h2>
                            <div className="space-y-3">
                                {section.questions.map((faq, idx) => {
                                    const globalIdx = sectionIdx * 100 + idx;
                                    const isOpen = openIndex === globalIdx;

                                    return (
                                        <div key={idx} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                                            <button
                                                onClick={() => setOpenIndex(isOpen ? null : globalIdx)}
                                                className="w-full text-left px-6 py-4 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors flex items-center justify-between"
                                            >
                                                <span className="font-semibold text-gray-900 dark:text-white pr-4">
                                                    {faq.q}
                                                </span>
                                                <ChevronDown
                                                    className={`h-5 w-5 text-gray-500 flex-shrink-0 transition-transform ${
                                                        isOpen ? 'transform rotate-180' : ''
                                                    }`}
                                                />
                                            </button>
                                            {isOpen && (
                                                <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700">
                                                    <p className="text-gray-700 dark:text-gray-300">
                                                        {faq.a}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-12 p-6 bg-pink-50 dark:bg-pink-900/20 rounded-xl border border-pink-200 dark:border-pink-800">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                        Vous avez encore des questions ?
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300 mb-4">
                        Notre équipe de support est là pour vous aider du lundi au vendredi, de 9h à 18h.
                    </p>
                    <div className="space-y-2 text-sm">
                        <p><strong>Email :</strong> <a href="mailto:support@lesbi-libre.com" className="text-pink-600 hover:underline">support@lesbi-libre.com</a></p>
                        <p><strong>Délai de réponse :</strong> 24-48 heures</p>
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
}
