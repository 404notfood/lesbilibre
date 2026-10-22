<?php

namespace App\Services;

use GuzzleHttp\Handler\CurlHandler;
use GuzzleHttp\HandlerStack;
use InvalidArgumentException;
use RuntimeException;

class PushEndpointPolicy
{
    public function __construct(private PushDnsResolver $resolver) {}

    /** Validate browser-supplied destinations without making any network call. */
    public function host(string $endpoint): string
    {
        $url = parse_url($endpoint);
        if ($url === false || ($url['scheme'] ?? null) !== 'https' || isset($url['user']) || isset($url['pass']) || isset($url['fragment']) || (isset($url['port']) && $url['port'] !== 443)) {
            throw new InvalidArgumentException('Un endpoint push HTTPS valide est requis.');
        }
        $host = strtolower($url['host'] ?? '');
        if ($host === '' || filter_var(trim($host, '[]'), FILTER_VALIDATE_IP)) {
            throw new InvalidArgumentException('Le fournisseur push n’est pas autorisé.');
        }
        foreach (config('webpush.allowed_hosts', []) as $allowed) {
            if ($host === $allowed || (str_starts_with($allowed, '.') && str_ends_with($host, $allowed) && strlen($host) > strlen($allowed))) {
                return $host;
            }
        }

        throw new InvalidArgumentException('Le fournisseur push n’est pas autorisé.');
    }

    public function validateKeys(string $publicKey, string $authToken): void
    {
        $decode = static function (string $value): string|false {
            if (! preg_match('/^[A-Za-z0-9_-]+={0,2}$/D', $value)) {
                return false;
            }

            return base64_decode(strtr($value, '-_', '+/'), true);
        };
        $public = $decode($publicKey);
        $auth = $decode($authToken);
        if ($public === false || strlen($public) !== 65 || $public[0] !== "\x04" || $auth === false || strlen($auth) !== 16) {
            throw new InvalidArgumentException('Les clés de souscription push sont invalides.');
        }
        // SPKI for an uncompressed public point on the P-256 curve. OpenSSL
        // rejects points that have the right size but are not on that curve.
        $der = hex2bin('3059301306072a8648ce3d020106082a8648ce3d030107034200').$public;
        $pem = "-----BEGIN PUBLIC KEY-----\n".chunk_split(base64_encode($der), 64, "\n")."-----END PUBLIC KEY-----\n";
        if (openssl_pkey_get_public($pem) === false) {
            throw new InvalidArgumentException('La clé publique push est invalide.');
        }
    }

    /**
     * Resolve once, reject every non-public answer and pin curl to that public
     * address. This prevents a second DNS lookup from reaching an internal IP.
     * Redirects are disabled, including redirects to another permitted host.
     */
    public function clientOptions(string $endpoint): array
    {
        $host = $this->host($endpoint);
        $addresses = $this->resolver->addresses($host);
        if ($addresses === []) {
            throw new RuntimeException('Push provider has no usable DNS address.');
        }
        foreach ($addresses as $address) {
            if (filter_var($address, FILTER_VALIDATE_IP, FILTER_FLAG_GLOBAL_RANGE) === false) {
                throw new InvalidArgumentException('Le fournisseur push pointe vers une adresse réseau interdite.');
            }
        }
        if (! extension_loaded('curl') || ! defined('CURLOPT_RESOLVE')) {
            throw new RuntimeException('Pinned push delivery requires the curl extension.');
        }
        $address = $addresses[0];
        if (str_contains($address, ':')) {
            $address = '['.$address.']';
        }

        return [
            'handler' => HandlerStack::create(new CurlHandler),
            'allow_redirects' => false,
            'connect_timeout' => 5,
            'timeout' => 10,
            'proxy' => null,
            'curl' => [CURLOPT_RESOLVE => [$host.':443:'.$address], CURLOPT_PROXY => ''],
        ];
    }
}
