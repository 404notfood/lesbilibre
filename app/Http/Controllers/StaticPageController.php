<?php

namespace App\Http\Controllers;

use App\Models\GemPackage;
use App\Models\PremiumPlan;
use Illuminate\Support\Arr;
use Inertia\Inertia;
use Inertia\Response;

class StaticPageController extends Controller
{
    public function terms(): Response
    {
        return Inertia::render('StaticPages/Terms');
    }

    public function privacy(): Response
    {
        return Inertia::render('StaticPages/Privacy');
    }

    public function faq(): Response
    {
        return Inertia::render('StaticPages/Faq');
    }

    public function about(): Response
    {
        return Inertia::render('StaticPages/About');
    }

    public function contact(): Response
    {
        return Inertia::render('StaticPages/Contact', [
            'supportEmail' => config('seo.support_email'),
        ]);
    }

    public function howItWorks(): Response
    {
        return $this->editorialPage(
            'Comment ça marche',
            'De votre inscription à une première conversation, vous gardez la main sur votre profil, vos préférences et votre rythme.',
            [
                ['title' => '1. Créez un profil précis', 'text' => 'Présentez vos envies, vos centres d’intérêt et vos critères. Plus les informations sont concrètes, plus les suggestions peuvent être pertinentes.'],
                ['title' => '2. Ajoutez une photo puis vérifiez votre profil', 'text' => 'Les photos sont soumises à modération. La vérification par selfie ajoute un repère de confiance sans rendre le selfie public.'],
                ['title' => '3. Découvrez des profils expliqués', 'text' => 'Les recommandations mettent en avant les intérêts communs, l’intention recherchée, la proximité et l’activité récente. Le score reste un indice, jamais une promesse.'],
                ['title' => '4. Échangez à votre rythme', 'text' => 'Après un match, commencez une conversation. Vous pouvez contrôler les notifications, bloquer un compte et signaler un comportement à tout moment.'],
            ]
        );
    }

    public function safety(): Response
    {
        return $this->editorialPage(
            'Votre sécurité, à chaque étape',
            'Les outils techniques aident, mais vous restez toujours libre de ralentir, refuser, bloquer ou signaler.',
            [
                ['title' => 'Profils et photos vérifiés', 'text' => 'La vérification par selfie et la modération des médias donnent des repères supplémentaires. Elles ne remplacent pas votre jugement lors d’un échange.'],
                ['title' => 'Galeries privées sous contrôle', 'text' => 'Vous choisissez qui peut accéder à votre galerie privée et pouvez retirer cet accès. Les médias éphémères sont servis sans URL publique partageable.'],
                ['title' => 'Blocage et signalement', 'text' => 'Un blocage coupe les interactions entre les deux comptes. Un signalement transmet les éléments utiles à la modération sans vous obliger à confronter la personne.'],
                ['title' => 'Première rencontre', 'text' => 'Privilégiez un lieu public, votre propre moyen de transport et informez une personne de confiance. En cas de danger immédiat, contactez les services d’urgence.'],
            ],
            '/guides/premiere-rencontre-en-securite',
            'Lire la checklist de sécurité'
        );
    }

    public function features(): Response
    {
        return $this->editorialPage(
            'Des outils utiles, sans transformer vos rencontres en jeu',
            'LesbiLibre privilégie la découverte, la conversation et le contrôle de la confidentialité.',
            [
                ['title' => 'Recherche et recommandations', 'text' => 'Filtrez par âge, distance, intentions et centres d’intérêt. Les raisons principales d’une recommandation sont affichées directement sur les profils.'],
                ['title' => 'Likes, matchs et messages', 'text' => 'Un match est créé lorsque l’intérêt est réciproque. La messagerie permet ensuite d’échanger dans l’espace membre.'],
                ['title' => 'Photos, vidéos et galeries privées', 'text' => 'Gérez vos médias publics ou privés, les demandes d’accès et les contenus éphémères envoyés en conversation.'],
                ['title' => 'Confidentialité et préférences', 'text' => 'Réglez votre visibilité, vos sessions, vos consentements et la fréquence de chaque catégorie de notification.'],
            ]
        );
    }

    public function pricing(): Response
    {
        $plans = PremiumPlan::offered()->get()->map(fn (PremiumPlan $plan) => [
            'name' => $plan->name,
            'tagline' => $plan->tagline,
            'price' => (float) $plan->price,
            'durationMonths' => $plan->duration_months,
            'pricePerMonth' => $plan->pricePerMonth(),
            'perks' => $plan->perks ?? [],
            'featured' => $plan->is_featured,
        ])->values();

        $packages = GemPackage::offered()->get()->map(fn (GemPackage $package) => [
            'name' => $package->name,
            'gems' => $package->totalGems(),
            'price' => (float) $package->price,
        ])->values();

        return Inertia::render('StaticPages/Pricing', [
            'plans' => $plans,
            'gemPackages' => $packages,
        ]);
    }

    public function guides(): Response
    {
        return Inertia::render('Guides/Index', [
            'guides' => collect(config('guides'))->map(fn (array $guide, string $slug) => [
                'slug' => $slug,
                'title' => $guide['title'],
                'description' => $guide['description'],
                'readingTime' => $guide['reading_time'],
                'updatedAt' => $guide['updated_at'],
            ])->values(),
        ]);
    }

    public function guide(string $slug): Response
    {
        $guide = config("guides.{$slug}");
        abort_unless(is_array($guide), 404);

        return Inertia::render('Guides/Show', [
            'guide' => ['slug' => $slug] + $guide,
            'relatedGuides' => collect(config('guides'))
                ->except($slug)
                ->take(3)
                ->map(fn (array $item, string $relatedSlug) => Arr::only($item, ['title', 'description']) + ['slug' => $relatedSlug])
                ->values(),
            'seo' => [
                'title' => $guide['title'].' | LesbiLibre',
                'description' => $guide['description'],
            ],
            'structuredData' => [
                '@type' => 'Article',
                'headline' => $guide['title'],
                'description' => $guide['description'],
                'dateModified' => '2026-08-17',
                'author' => ['@type' => 'Organization', 'name' => 'LesbiLibre'],
            ],
        ]);
    }

    private function editorialPage(
        string $title,
        string $intro,
        array $sections,
        string $ctaHref = '/register',
        string $ctaLabel = 'Créer mon profil'
    ): Response {
        return Inertia::render('StaticPages/Editorial', compact(
            'title', 'intro', 'sections', 'ctaHref', 'ctaLabel'
        ));
    }
}
