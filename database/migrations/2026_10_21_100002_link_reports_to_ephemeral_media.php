<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('ephemeral_media', function (Blueprint $table) {
            $table->string('moderation_status', 20)->default('pending')->index();
            $table->timestamp('moderated_at')->nullable();
            $table->foreignId('moderator_id')->nullable()->constrained('users')->nullOnDelete();
            $table->text('moderation_reason')->nullable();
        });

        Schema::table('reports', function (Blueprint $table) {
            $table->foreignId('ephemeral_media_id')->nullable()->constrained('ephemeral_media')->nullOnDelete();
        });

        // The former classifier could set approved without a human decision.
        // Only the explicit administrator audit entry proves an approval.
        $withoutHumanApproval = fn () => DB::table('photos')->where('is_approved', true)
            ->whereNotExists(function ($query) {
                $query->selectRaw('1')->from('moderation_actions')
                    ->whereColumn('moderation_actions.subject_id', 'photos.id')
                    ->where('moderation_actions.subject_type', 'App\\Models\\Photo')
                    ->where('moderation_actions.action', 'photo_approved');
            });
        $affectedOwners = $withoutHumanApproval()->where('is_primary', true)->pluck('user_id');
        if ($affectedOwners->isNotEmpty()) {
            DB::table('users')->whereIn('id', $affectedOwners)->update(['is_verified' => false]);
            DB::table('verification_photos')->whereIn('user_id', $affectedOwners)->where('status', 'pending')->update([
                'status' => 'rejected',
                'rejection_reason' => 'La photo principale doit être validée. Envoyez un nouveau selfie après sa validation.',
            ]);
        }
        $withoutHumanApproval()->update(['moderation_status' => 'pending', 'is_approved' => false]);

        // Recover only the exact legacy prefix produced by the controller,
        // and only when the reporter and reported account match the medium.
        DB::table('reports')->where('description', 'like', '[Contenu éphémère #%')
            ->orderBy('id')->chunkById(100, function ($reports) {
                foreach ($reports as $report) {
                    if (! preg_match('/^\[Contenu éphémère #(\d+)\] /u', $report->description, $matches)) {
                        continue;
                    }
                    $exists = DB::table('ephemeral_media')->where('id', (int) $matches[1])
                        ->where('recipient_id', $report->reporter_id)->where('sender_id', $report->reported_user_id)->exists();
                    if ($exists) {
                        DB::table('reports')->where('id', $report->id)->update(['ephemeral_media_id' => (int) $matches[1]]);
                    }
                }
            });

        DB::table('ephemeral_media')->whereNull('purged_at')->whereIn('id', function ($query) {
            $query->select('ephemeral_media_id')->from('reports')->whereNotNull('ephemeral_media_id')
                ->whereIn('status', ['pending', 'reviewed']);
        })->update(['is_flagged' => true]);
    }

    public function down(): void
    {
        Schema::table('reports', fn (Blueprint $table) => $table->dropConstrainedForeignId('ephemeral_media_id'));
        Schema::table('ephemeral_media', function (Blueprint $table) {
            $table->dropConstrainedForeignId('moderator_id');
            $table->dropIndex(['moderation_status']);
            $table->dropColumn(['moderation_status', 'moderated_at', 'moderation_reason']);
        });
    }
};
