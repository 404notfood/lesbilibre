<?php

namespace App\Http\Controllers;

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
        return Inertia::render('StaticPages/Contact');
    }
}
