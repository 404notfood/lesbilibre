<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PwaMetadataTest extends TestCase
{
    use RefreshDatabase;

    public function test_application_declares_standard_and_apple_pwa_capabilities(): void
    {
        $response = $this->get('/');

        $response
            ->assertOk()
            ->assertSee('<meta name="mobile-web-app-capable" content="yes">', false)
            ->assertSee('<meta name="apple-mobile-web-app-capable" content="yes">', false);
    }
}
