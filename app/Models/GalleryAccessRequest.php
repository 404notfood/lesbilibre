<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GalleryAccessRequest extends Model
{
    protected $fillable = [
        'requester_user_id',
        'owner_user_id',
        'status',
        'gems_cost',
    ];

    protected function casts(): array
    {
        return [
            'gems_cost' => 'integer',
        ];
    }

    public function requester(): BelongsTo
    {
        return $this->belongsTo(User::class, 'requester_user_id');
    }

    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_user_id');
    }

    public function accept(): void
    {
        $this->update(['status' => 'accepted']);
    }

    public function reject(): void
    {
        $this->update(['status' => 'rejected']);

        // Refund gems to requester
        $this->requester->addGems(
            $this->gems_cost,
            'gallery_access_refund',
            "Remboursement pour demande d'accès refusée",
            ['request_id' => $this->id]
        );
    }
}
