<?php

namespace Tests\Concerns;

trait CreatesSyntheticPushKeys
{
    /** A public P-256 generator point and test-only auth bytes; no private key. */
    private function syntheticPushKeys(): array
    {
        $point = hex2bin('04'.'6b17d1f2e12c4247f8bce6e563a440f277037d812deb33a0f4a13945d898c296'.'4fe342e2fe1a7f9b8ee7eb4a7c0f9e162bce33576b315ececbb6406837bf51f5');
        $encode = static fn ($bytes) => rtrim(strtr(base64_encode($bytes), '+/', '-_'), '=');

        return ['p256dh' => $encode($point), 'auth' => $encode(str_repeat("\x42", 16))];
    }
}
