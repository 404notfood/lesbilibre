<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;

abstract class TestCase extends BaseTestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        \Stripe\ApiRequestor::setHttpClient(new \Tests\Support\RejectingStripeHttpClient);
    }
}
