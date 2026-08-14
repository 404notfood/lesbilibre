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
        Schema::create('profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->text('bio')->nullable();
            $table->date('date_of_birth');
            $table->string('city')->nullable();
            $table->string('country')->default('France');
            $table->decimal('latitude', 10, 8)->nullable();
            $table->decimal('longitude', 11, 8)->nullable();
            $table->enum('sexual_orientation', ['lesbian', 'bisexual', 'pansexual', 'queer', 'other'])->default('lesbian');
            $table->enum('relationship_status', ['single', 'in_relationship', 'complicated', 'open', 'other'])->nullable();
            $table->string('height')->nullable();
            $table->string('body_type')->nullable();
            $table->string('hair_color')->nullable();
            $table->string('eye_color')->nullable();
            $table->string('ethnicity')->nullable();
            $table->string('education')->nullable();
            $table->string('occupation')->nullable();
            $table->boolean('has_children')->default(false);
            $table->boolean('wants_children')->default(false);
            $table->boolean('smokes')->default(false);
            $table->boolean('drinks')->nullable();
            $table->json('interests')->nullable();
            $table->json('languages')->nullable();
            $table->boolean('is_naughty_mode')->default(false);
            $table->boolean('show_age')->default(true);
            $table->boolean('show_location')->default(true);
            $table->integer('search_radius')->default(50);
            $table->integer('min_age_preference')->default(18);
            $table->integer('max_age_preference')->default(99);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('profiles');
    }
};
