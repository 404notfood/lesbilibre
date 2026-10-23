<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class IntegrationCredential extends Model
{
    protected $fillable = ['name', 'value'];

    protected $hidden = ['value'];

    protected function casts(): array
    {
        return ['value' => 'encrypted'];
    }
}
