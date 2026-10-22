<?php

namespace Tests\Feature;

use App\Services\StripePaymentService;
use Stripe\ApiRequestor;
use Stripe\Exception\ApiErrorException;
use Stripe\HttpClient\ClientInterface;
use Tests\TestCase;

class StripeCancellationSafetyTest extends TestCase
{
    private function withReplies(array $replies, callable $test): void
    {
        config(['services.stripe.secret' => 'sk_test_synthetic_audit_only']);
        $previous = ApiRequestor::httpClient();
        $fake = new class($replies) implements ClientInterface
        {
            public array $calls = [];

            public function __construct(private array $replies) {}

            public function request($method, $absUrl, $headers, $params, $hasFile, $apiMode = 'v1', $maxNetworkRetries = null)
            {
                $this->calls[] = ['method' => $method, 'url' => $absUrl, 'headers' => $headers];
                if ($this->replies === []) {
                    throw new \LogicException('Unexpected mocked Stripe request; no network fallback exists.');
                }
                [$status, $body] = array_shift($this->replies);

                return [json_encode($body), $status, []];
            }
        };
        ApiRequestor::setHttpClient($fake);
        try {
            $test($fake);
        } finally {
            ApiRequestor::setHttpClient($previous);
        }
    }

    public function test_active_remote_subscription_is_cancelled_with_an_idempotency_key(): void
    {
        $this->withReplies([[200, ['id' => 'sub_synthetic', 'object' => 'subscription', 'status' => 'active']], [200, ['id' => 'sub_synthetic', 'object' => 'subscription', 'status' => 'canceled']]], function ($fake) {
            app(StripePaymentService::class)->cancelSubscription('sub_synthetic');
            $this->assertSame(['get', 'delete'], array_column($fake->calls, 'method'));
            $this->assertStringContainsString('idempotency-key: account-erasure:', strtolower(implode("\n", $fake->calls[1]['headers'])));
        });
    }

    public function test_already_cancelled_or_missing_subscriptions_are_idempotent_successes(): void
    {
        $this->withReplies([[200, ['id' => 'sub_synthetic', 'object' => 'subscription', 'status' => 'canceled']]], function ($fake) {
            app(StripePaymentService::class)->cancelSubscription('sub_synthetic');
            $this->assertCount(1, $fake->calls);
        });
        $this->withReplies([[404, ['error' => ['type' => 'invalid_request_error', 'code' => 'resource_missing', 'message' => 'Synthetic missing subscription']]]], function ($fake) {
            app(StripePaymentService::class)->cancelSubscription('sub_missing');
            $this->assertCount(1, $fake->calls);
        });
    }

    public function test_transient_remote_failure_is_propagated_to_prevent_losing_the_retry(): void
    {
        $this->withReplies([[200, ['id' => 'sub_synthetic', 'object' => 'subscription', 'status' => 'active']], [503, ['error' => ['type' => 'api_error', 'message' => 'Synthetic temporary failure']]]], function ($fake) {
            try {
                app(StripePaymentService::class)->cancelSubscription('sub_synthetic');
                $this->fail('A failed cancellation must propagate to the account closure workflow.');
            } catch (ApiErrorException) {
                $this->assertSame(['get', 'delete'], array_column($fake->calls, 'method'));
            }
        });
    }
}
