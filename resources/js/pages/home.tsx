import PublicLayout from '@/layouts/public-layout';
import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowDown,
    ArrowRight,
    ArrowUpRight,
    Check,
    Heart,
    MapPin,
    MessageCircle,
    Plus,
    ShieldCheck,
    Sparkles,
} from 'lucide-react';

const steps = [
    {
        title: 'Un profil qui te ressemble',
        text: 'Quelques mots, tes envies, ta ville. Tu choisis ce que tu souhaites partager.',
    },
    {
        title: 'Un accès préparé avec soin',
        text: 'Confirme ton e-mail, ta majorité et la charte. Une modératrice examine tes photos et ton selfie privé.',
    },
    {
        title: 'Le début de quelque chose',
        text: 'Une fois ton accès validé, découvre les profils près de toi. Un like réciproque ? La conversation peut commencer.',
    },
];
const questions = [
    {
        title: 'À qui s’adresse LesbiLibre ?',
        text: 'Aux femmes cis et trans et aux personnes non binaires qui se reconnaissent dans cette communauté. Le service est réservé aux personnes majeures. Chaque compte représente une seule personne.',
    },
    {
        title: 'Puis-je faire des rencontres gratuitement ?',
        text: 'Oui. Le profil, la découverte, les matchs et les conversations sont accessibles gratuitement. Les likes et ouvertures de conversation ont des limites quotidiennes indiquées dans le service ; les réponses ne sont pas rationnées. Les tarifs détaillent les options Premium.',
    },
    {
        title: 'Que signifie le badge photo ?',
        text: 'Il indique que les photos ont été examinées avec un selfie privé. Ce contrôle ne prouve ni l’identité, ni la majorité, ni le genre. Il ne garantit pas le comportement d’une personne.',
    },
    {
        title: 'Que se passe-t-il pendant la validation ?',
        text: 'Tu peux préparer ton profil et tes photos. Les interactions restent fermées jusqu’à la validation des étapes requises. L’examen est humain : aucun délai fixe n’est garanti. Le statut et une éventuelle demande de correction sont visibles dans ton compte.',
    },
    {
        title: 'Et mes photos privées, qui peut les voir ?',
        text: 'Tu choisis à qui donner accès à ta galerie et peux retirer cet accès. Les contenus intimes demandent un consentement distinct, révocable. Les paramètres permettent aussi de gérer ta visibilité et de demander la suppression de ton compte.',
    },
];
const intentions = [
    {
        icon: Heart,
        title: 'Une histoire à écrire.',
        tag: 'Rencontres amoureuses',
        text: 'Un coup de cœur, une complicité, une relation. Laisse une place à ce qui pourrait commencer.',
        className: 'intention-love',
    },
    {
        icon: MessageCircle,
        title: 'Des affinités à partager.',
        tag: 'Amitiés & liens locaux',
        text: 'Un café, une sortie, une nouvelle amie. Les belles rencontres ne suivent pas toutes le même chemin.',
        className: 'intention-friendship',
    },
    {
        icon: Sparkles,
        title: 'Et puis, on verra.',
        tag: 'À ton rythme',
        text: 'Pas besoin d’avoir toutes les réponses. Exprime tes envies et fais connaissance, sans te presser.',
        className: 'intention-discovery',
    },
];

export default function Home({
    canRegister = true,
}: {
    canRegister?: boolean;
}): JSX.Element {
    const { auth } = usePage<SharedData>().props;
    const isAuthenticated = Boolean(auth?.user);
    const ctaHref = isAuthenticated
        ? '/dashboard'
        : canRegister
          ? '/register'
          : '/login';
    const ctaLabel = isAuthenticated
        ? 'Retrouver mon espace'
        : canRegister
          ? 'Créer mon profil gratuitement'
          : 'Me connecter';

    return (
        <PublicLayout>
            <Head title="Des rencontres près de chez toi, à ton rythme" />
            <section className="home-hero" aria-labelledby="hero-title">
                <div className="public-container home-hero-grid">
                    <div className="home-hero-copy">
                        <p className="public-eyebrow">
                            <span className="eyebrow-line" />
                            Rencontres lesbiennes & queer
                        </p>
                        <h1 id="hero-title">
                            Une rencontre.
                            <br />
                            Mille façons
                            <br />
                            <em>d’être toi.</em>
                        </h1>
                        <p className="home-hero-description">
                            De l’amour, une amitié, un joli début.
                            <br className="hidden sm:block" /> Rencontre des
                            femmes et des personnes queer près de chez toi, avec
                            la liberté de prendre ton temps.
                        </p>
                        <Link
                            href={ctaHref}
                            className="public-button home-hero-cta"
                        >
                            {ctaLabel}
                            <ArrowUpRight size={19} aria-hidden />
                        </Link>
                        <p className="home-hero-fineprint">
                            <Check size={14} aria-hidden />
                            Sans carte bancaire<span aria-hidden>·</span>18 ans
                            et plus
                        </p>
                        <a href="#les-rencontres" className="home-explore">
                            Une autre façon de se rencontrer
                            <ArrowDown size={16} aria-hidden />
                        </a>
                    </div>
                    <div className="home-hero-art">
                        <div className="home-art-note">
                            <Sparkles size={20} aria-hidden />
                            <span>
                                Les belles histoires
                                <br />
                                commencent par un bonjour.
                            </span>
                        </div>
                        <div className="home-art-frame">
                            <img
                                src="/images/rencontre-cafe-photo.webp"
                                alt="Deux femmes font connaissance autour d’un café en terrasse, visuel photoréaliste."
                                width={1200}
                                height={800}
                                fetchPriority="high"
                            />
                        </div>
                        <div className="home-art-sticker">
                            <Heart size={22} strokeWidth={1.5} aria-hidden />
                            <span>
                                Un café.
                                <br />
                                <strong>Et si le courant passait ?</strong>
                            </span>
                        </div>
                        <div className="home-art-caption">
                            <span className="home-caption-line" />
                            <span>Un amour. Une amitié. Une possibilité.</span>
                        </div>
                    </div>
                </div>
                <div className="public-container">
                    <ul className="home-reassurance">
                        <li>
                            <MapPin size={19} aria-hidden />
                            Des liens près de chez toi
                        </li>
                        <li>
                            <ShieldCheck size={19} aria-hidden />
                            Des photos examinées par une modératrice
                        </li>
                        <li>
                            <Heart size={19} aria-hidden />
                            Tes envies, tes limites, ton rythme
                        </li>
                    </ul>
                </div>
            </section>
            <section
                id="les-rencontres"
                className="home-intentions public-section"
                aria-labelledby="intentions-title"
            >
                <div className="public-container">
                    <div className="home-section-heading">
                        <div>
                            <p className="public-eyebrow">
                                Pas de case. De la place.
                            </p>
                            <h2 id="intentions-title">
                                Tu viens comme tu es.
                                <br />
                                <em>Tu cherches ce qui te plaît.</em>
                            </h2>
                        </div>
                        <p>
                            On n’a pas toutes les mêmes envies.
                            <br />
                            C’est justement ce qui rend chaque rencontre
                            singulière.
                        </p>
                    </div>
                    <div className="home-intention-grid">
                        {intentions.map(
                            ({ icon: Icon, title, tag, text, className }) => (
                                <article
                                    key={title}
                                    className={`home-intention ${className}`}
                                >
                                    <div className="home-intention-top">
                                        <span className="home-intention-icon">
                                            <Icon
                                                size={24}
                                                strokeWidth={1.5}
                                                aria-hidden
                                            />
                                        </span>
                                        <span>{tag}</span>
                                    </div>
                                    <h3>{title}</h3>
                                    <p>{text}</p>
                                    <Link
                                        href={ctaHref}
                                        className="home-card-link"
                                    >
                                        {isAuthenticated
                                            ? 'Découvrir les profils'
                                            : canRegister
                                              ? 'Faire le premier pas'
                                              : 'Me connecter'}
                                        <ArrowUpRight size={19} aria-hidden />
                                    </Link>
                                </article>
                            ),
                        )}
                    </div>
                </div>
            </section>
            <section className="home-safety" aria-labelledby="safety-title">
                <div className="public-container home-safety-grid">
                    <div className="home-safety-visual" aria-hidden>
                        <div className="home-safety-seal">
                            <ShieldCheck size={35} strokeWidth={1.3} />
                            <span>
                                DU RESPECT.
                                <br />
                                <em>Toujours.</em>
                            </span>
                        </div>
                        <span className="home-safety-script">
                            Libre de choisir.
                            <br />
                            Libre de dire non.
                        </span>
                    </div>
                    <div className="home-safety-copy">
                        <p className="public-eyebrow">
                            La confiance, ça se construit.
                        </p>
                        <h2 id="safety-title">
                            De belles rencontres.
                            <br />
                            <em>Avec tes propres limites.</em>
                        </h2>
                        <p>
                            Se sentir à sa place, c’est aussi garder la main. Du
                            premier bonjour aux contenus que tu partages, tu
                            restes libre de choisir.
                        </p>
                        <ul>
                            <li>
                                <Check size={17} aria-hidden />
                                Des photos et un selfie privé examinés
                                humainement
                            </li>
                            <li>
                                <Check size={17} aria-hidden />
                                Un accès à ta galerie privée que tu peux retirer
                            </li>
                            <li>
                                <Check size={17} aria-hidden />
                                Des outils pour bloquer et signaler à tout
                                moment
                            </li>
                        </ul>
                        <Link href="/securite" className="public-text-link">
                            Découvrir nos engagements
                            <ArrowRight size={18} aria-hidden />
                        </Link>
                        <p className="home-safety-fineprint">
                            Le badge photo ne prouve ni l’identité ni la
                            majorité et ne garantit pas le comportement d’une
                            personne.
                        </p>
                    </div>
                </div>
            </section>
            <section
                id="how-it-works"
                className="public-section home-steps"
                aria-labelledby="steps-title"
            >
                <div className="public-container">
                    <div className="home-section-heading">
                        <div>
                            <p className="public-eyebrow">
                                Un premier pas, simplement.
                            </p>
                            <h2 id="steps-title">
                                De toi à <em>la rencontre.</em>
                            </h2>
                        </div>
                        <Link
                            href="/comment-ca-marche"
                            className="public-text-link"
                        >
                            Comment ça marche
                            <ArrowUpRight size={18} aria-hidden />
                        </Link>
                    </div>
                    <ol className="home-steps-grid">
                        {steps.map(({ title, text }, index) => (
                            <li key={title}>
                                <span className="home-step-number">
                                    0{index + 1}
                                </span>
                                <h3>{title}</h3>
                                <p>{text}</p>
                            </li>
                        ))}
                    </ol>
                    <p className="home-steps-note">
                        Et la suite ? Vous l’écrivez à votre rythme.
                    </p>
                </div>
            </section>
            <section
                className="home-faq public-section"
                aria-labelledby="faq-title"
            >
                <div className="public-container home-faq-grid">
                    <div>
                        <p className="public-eyebrow">On en parle ?</p>
                        <h2 id="faq-title">
                            C’est normal
                            <br />
                            <em>d’avoir des questions.</em>
                        </h2>
                        <p>Avant de te lancer, prends tes repères.</p>
                        <Link href="/contact" className="public-text-link">
                            Écrire à l’équipe
                            <ArrowUpRight size={18} aria-hidden />
                        </Link>
                    </div>
                    <div className="home-faq-list">
                        {questions.map(({ title, text }) => (
                            <details key={title}>
                                <summary>
                                    {title}
                                    <Plus size={19} aria-hidden />
                                </summary>
                                <p>{text}</p>
                            </details>
                        ))}
                        <Link
                            href="/faq"
                            className="public-text-link home-faq-more"
                        >
                            Toutes les questions
                            <ArrowRight size={17} aria-hidden />
                        </Link>
                    </div>
                </div>
            </section>
            <section className="home-final">
                <div className="public-container home-final-inner">
                    <p className="public-eyebrow">
                        Le prochain bonjour pourrait tout changer.
                    </p>
                    <h2>
                        La suite commence
                        <br />
                        <em>avec toi.</em>
                    </h2>
                    <Link
                        href={ctaHref}
                        className="public-button public-button-cream"
                    >
                        {ctaLabel}
                        <ArrowUpRight size={19} aria-hidden />
                    </Link>
                    <Link href="/tarifs" className="home-final-pricing">
                        Découvrir le gratuit et les options Premium
                        <ArrowRight size={15} aria-hidden />
                    </Link>
                </div>
                <span className="home-final-flower" aria-hidden>
                    ✳
                </span>
            </section>
        </PublicLayout>
    );
}
