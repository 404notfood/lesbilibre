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
        Schema::create('gem_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('type'); // purchase, spend, gift_sent, gift_received, boost
            $table->integer('amount'); // positive for credit, negative for debit
            $table->integer('balance_after');
            $table->string('description')->nullable();
            $table->json('metadata')->nullable(); // gift_id, recipient_id, etc.
            $table->string('payment_method')->nullable();
            $table->string('transaction_id')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('gem_transactions');
    }
};
