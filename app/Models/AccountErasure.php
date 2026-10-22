<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AccountErasure extends Model
{
    protected $guarded = ['id'];

    protected function casts(): array
    {
        return ['last_attempt_at' => 'datetime', 'approved_at' => 'datetime', 'completed_at' => 'datetime', 'attempts' => 'integer', 'billing_pending' => 'boolean'];
    }
}
