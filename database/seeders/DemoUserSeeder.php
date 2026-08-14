<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DemoUserSeeder extends Seeder
{
    public function run(): void
    {
        // Create demo user
        $user = User::firstOrCreate(
            ['email' => 'demo@demo.com'],
            [
                'name' => 'Demo User',
                'pseudo' => 'demo',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ]
        );

        echo "✅ Demo user created!\n";
        echo "📧 Email/Pseudo: demo@demo.com or demo\n";
        echo "🔑 Password: password\n";
        echo "👤 Name: Demo User\n";
    }
}
