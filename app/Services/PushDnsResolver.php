<?php

namespace App\Services;

use RuntimeException;

class PushDnsResolver
{
    /** @return array<int, string> */
    public function addresses(string $host): array
    {
        $records = dns_get_record($host, DNS_A | DNS_AAAA);
        if ($records === false) {
            throw new RuntimeException('Push provider DNS lookup failed.');
        }

        return array_values(array_unique(array_filter(array_map(fn ($record) => $record['ip'] ?? $record['ipv6'] ?? null, $records))));
    }
}
