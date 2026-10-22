<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('subscriptions', function (Blueprint $table) {
            $table->unsignedBigInteger('stripe_event_created_at')->nullable();
            $table->string('stripe_event_type')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('subscriptions', fn (Blueprint $table) => $table->dropColumn(['stripe_event_created_at', 'stripe_event_type']));
    }
};
