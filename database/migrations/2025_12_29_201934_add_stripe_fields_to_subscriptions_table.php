<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('subscriptions', function (Blueprint $table) {
            $table->string('stripe_subscription_id')->nullable()->unique()->after('user_id');
            $table->string('stripe_customer_id')->nullable()->after('stripe_subscription_id');
            $table->string('stripe_price_id')->nullable()->after('stripe_customer_id');
            $table->timestamp('current_period_start')->nullable()->after('stripe_price_id');
            $table->timestamp('current_period_end')->nullable()->after('current_period_start');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('subscriptions', function (Blueprint $table) {
            $table->dropColumn([
                'stripe_subscription_id',
                'stripe_customer_id',
                'stripe_price_id',
                'current_period_start',
                'current_period_end',
            ]);
        });
    }
};
