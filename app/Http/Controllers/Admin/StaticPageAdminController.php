<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class StaticPageAdminController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Admin/StaticPages/Index', [
            'pages' => [
                [
                    'name' => 'Conditions d\'utilisation',
                    'slug' => 'terms',
                    'url' => route('terms'),
                ],
                [
                    'name' => 'Politique de confidentialité',
                    'slug' => 'privacy',
                    'url' => route('privacy'),
                ],
                [
                    'name' => 'FAQ',
                    'slug' => 'faq',
                    'url' => route('faq'),
                ],
            ],
        ]);
    }
}
