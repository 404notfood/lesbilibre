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
        Schema::create('premium_plans', function (Blueprint $table) {
            $table->id();
            $table->string('slug')->unique();
            $table->string('name');
            $table->string('tagline')->nullable();
            $table->unsignedSmallInteger('duration_months');
            $table->decimal('price', 8, 2);
            $table->string('stripe_price_id')->nullable();

            /** Avantages affichés sur la page premium, un par entrée. */
            $table->json('perks')->nullable();

            /** Gemmes créditées à la souscription, puis à chaque mois. */
            $table->unsignedInteger('gems_on_signup')->default(0);
            $table->unsignedInteger('gems_per_month')->default(0);

            $table->boolean('is_active')->default(true);
            $table->boolean('is_featured')->default(false);
            $table->unsignedSmallInteger('display_order')->default(0);
            $table->timestamps();

            $table->index(['is_active', 'display_order']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('premium_plans');
    }
};
