<?php

namespace Tests\Support;

class RejectingStripeHttpClient implements \Stripe\HttpClient\ClientInterface
{
    public function request($method, $absUrl, $headers, $params, $hasFile, $apiMode = 'v1', $maxNetworkRetries = null)
    {
        throw new \RuntimeException('Unmocked Stripe network request blocked by the test suite.');
    }
}
