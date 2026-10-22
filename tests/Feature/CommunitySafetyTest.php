<?php

namespace Tests\Feature;

use App\Models\Conversation;
use App\Models\Photo;
use App\Models\Profile;
use App\Models\Report;
use App\Models\User;
use App\Rules\AdultBirthDate;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Validator;
use Tests\TestCase;

class CommunitySafetyTest extends TestCase
{
    use RefreshDatabase;

    private function member(): User
    {
        $user = User::factory()->create(['is_verified' => true, 'data_processing_consent' => true, 'community_charter_version' => config('community.charter_version'), 'community_charter_accepted_at' => now()]);
        Profile::factory()->create(['user_id' => $user->id, 'birth_date_declared_at' => now(), 'meeting_intentions' => ['friendship'], 'looking_for' => 'friendship']);

        return $user->fresh();
    }

    public function test_birth_date_boundary_is_exact_and_rejects_invalid_dates(): void
    {
        $this->travelTo(now()->setDate(2026, 9, 8));
        foreach (['2008-09-09', '2010-01-01', '2027-01-01', '2000-02-30', 'garbage'] as $date) {
            $this->assertTrue(Validator::make(['dob' => $date], ['dob' => [new AdultBirthDate]])->fails(), $date);
        }
        $this->assertTrue(Validator::make(['dob' => '2008-09-08'], ['dob' => [new AdultBirthDate]])->passes());
    }

    public function test_existing_member_must_confirm_old_approximate_birth_date(): void
    {
        $user = $this->member();
        $user->profile->update(['birth_date_declared_at' => null]);
        $this->actingAs($user->fresh())->get('/dashboard')->assertRedirect('/community/onboarding');
        $this->post('/community/onboarding', ['date_of_birth' => '1995-03-14', 'community_charter' => true, 'data_processing_consent' => true])->assertRedirect('/dashboard');
        $this->assertSame('1995-03-14', $user->fresh()->profile->date_of_birth->toDateString());
    }

    public function test_unverified_members_cannot_read_profiles_messages_or_other_members_photos(): void
    {
        $user = $this->member();
        $other = $this->member();
        $user->forceFill(['is_verified' => false])->save();
        $conversation = Conversation::create(['user1_id' => $user->id, 'user2_id' => $other->id]);
        $photo = Photo::factory()->create(['user_id' => $other->id]);
        $this->actingAs($user)->get('/profile/'.$other->id)->assertRedirect('/community/onboarding');
        $this->get('/conversations/'.$conversation->id)->assertRedirect('/community/onboarding');
        $this->postJson('/conversations/'.$conversation->id.'/messages', ['content' => 'hello'])->assertForbidden();
        $this->get('/media/photos/'.$photo->id)->assertNotFound();
        $this->get('/profile/edit')->assertOk();
        $this->get('/contact')->assertOk();
    }

    public function test_minor_and_restricted_targets_cannot_be_accessed_directly(): void
    {
        $viewer = $this->member();
        $other = $this->member();
        $other->profile->update(['date_of_birth' => now()->subYears(15)->toDateString()]);
        $this->actingAs($viewer)->get('/profile/'.$other->id)->assertNotFound();
        $this->assertFalse(User::communityEligible()->whereKey($other->id)->exists());
        $other->profile->update(['date_of_birth' => '1990-01-01']);
        $other->forceFill(['safety_restricted_at' => now()])->save();
        $this->get('/profile/'.$other->id)->assertNotFound();
        \App\Models\UserMatch::factory()->create(['user1_id' => $viewer->id, 'user2_id' => $other->id]);
        $this->assertCount(0, app(\App\Services\MatchingService::class)->getUserMatches($viewer));
    }

    public function test_profile_update_cannot_change_verified_date_or_set_minor_date(): void
    {
        $user = $this->member();
        $original = $user->profile->date_of_birth->toDateString();
        $this->actingAs($user)->put('/profile', ['date_of_birth' => now()->subYears(15)->toDateString(), 'data_processing_consent' => true])->assertSessionHasErrors('date_of_birth');
        $this->put('/profile', ['date_of_birth' => '1991-02-04', 'data_processing_consent' => true])->assertSessionHasErrors('date_of_birth');
        $this->assertSame($original, $user->fresh()->profile->date_of_birth->toDateString());
        $this->assertArrayNotHasKey('date_of_birth', $user->fresh()->profile->toArray());
    }

    public function test_intentions_are_multiple_and_friendship_limit_is_respected(): void
    {
        $user = $this->member();
        $this->actingAs($user)->put('/profile', ['meeting_intentions' => ['friendship', 'casual'], 'boundaries' => [], 'data_processing_consent' => true])->assertSessionHasNoErrors();
        $this->assertSame(['friendship', 'casual'], $user->fresh()->profile->meeting_intentions);
        $this->put('/profile', ['meeting_intentions' => ['casual'], 'boundaries' => ['friendship_only'], 'data_processing_consent' => true])->assertSessionHasNoErrors();
        $this->assertSame(['friendship'], $user->fresh()->profile->meeting_intentions);
        $casual = new Profile(['meeting_intentions' => ['casual']]);
        $this->assertFalse($user->fresh()->profile->acceptsIntentionsOf($casual));
        $this->assertSame(0, app(\App\Services\MatchScoreService::class)->calculateScore($user->fresh()->profile, $casual));
    }

    public function test_intimate_consent_is_per_recipient_conversation_and_revocable(): void
    {
        $sender = $this->member();
        $recipient = $this->member();
        $outsider = $this->member();
        $conversation = Conversation::create(['user1_id' => $sender->id, 'user2_id' => $recipient->id]);
        $url = '/conversations/'.$conversation->id.'/intimate-consent';
        $this->actingAs($outsider)->put($url, ['accepted' => true])->assertForbidden();
        $this->actingAs($recipient)->put($url, ['accepted' => true])->assertSessionHasNoErrors();
        $this->assertTrue($conversation->acceptsIntimateMedia($recipient->id));
        $this->assertFalse($conversation->acceptsIntimateMedia($sender->id));
        $this->put($url, ['accepted' => false])->assertSessionHasNoErrors();
        $this->assertFalse($conversation->acceptsIntimateMedia($recipient->id));
    }

    public function test_minor_report_does_not_automatically_suspend_and_moderator_can_restore(): void
    {
        $reporter = $this->member();
        $target = $this->member();
        $this->actingAs($reporter)->post('/reports', ['reported_user_id' => $target->id, 'reason' => 'suspected_minor', 'description' => 'La personne indique avoir quinze ans.'])->assertSessionHasNoErrors();
        $this->assertNull($target->fresh()->safety_restricted_at);
        $report = Report::firstOrFail();
        $url = '/admin/reports/'.$report->id;
        $this->put($url, ['status' => 'reviewed', 'safety_action' => 'restrict', 'admin_notes' => 'Éléments examinés par la modération.'])->assertForbidden();
        $admin = User::factory()->create(['is_admin' => true]);
        $this->actingAs($admin)->put($url, ['status' => 'reviewed', 'safety_action' => 'restrict', 'admin_notes' => 'Déclaration explicite de minorité à examiner.'])->assertSessionHasNoErrors();
        $this->assertNotNull($target->fresh()->safety_restricted_at);
        $this->put($url, ['status' => 'reviewed', 'safety_action' => 'restore', 'admin_notes' => 'Réexamen effectué, restriction levée.'])->assertSessionHasNoErrors();
        $this->assertNull($target->fresh()->safety_restricted_at);
    }

    public function test_replacing_primary_photo_revokes_verification(): void
    {
        $user = $this->member();
        $photo = Photo::factory()->create(['user_id' => $user->id, 'is_primary' => false, 'moderation_status' => 'approved']);
        $photo->update(['is_primary' => true]);
        $this->assertFalse($user->fresh()->is_verified);
    }

    public function test_withdrawing_data_consent_removes_community_access(): void
    {
        $user = $this->member();
        $user->update(['data_processing_consent' => false]);
        $this->assertFalse($user->fresh()->canUseCommunity());
        $this->assertFalse(User::communityEligible()->whereKey($user->id)->exists());
        $this->actingAs($user->fresh())->get('/settings/privacy')->assertOk();
    }

    public function test_sensitive_media_requires_consent_at_send_and_read_time(): void
    {
        \Illuminate\Support\Facades\Storage::fake('local');
        $sender = $this->member();
        $recipient = $this->member();
        $conversation = Conversation::create(['user1_id' => $sender->id, 'user2_id' => $recipient->id]);
        $payload = ['file' => \Illuminate\Http\UploadedFile::fake()->image('photo.jpg'), 'is_naughty' => true];
        $this->actingAs($sender)->post('/conversations/'.$conversation->id.'/ephemeral', $payload)->assertForbidden();
        $this->assertDatabaseCount('ephemeral_media', 0);
        $this->actingAs($recipient)->put('/conversations/'.$conversation->id.'/intimate-consent', ['accepted' => true]);
        $this->actingAs($sender)->post('/conversations/'.$conversation->id.'/ephemeral', $payload)->assertSessionHasNoErrors();
        $media = \App\Models\EphemeralMedia::firstOrFail();
        $this->actingAs($recipient)->put('/conversations/'.$conversation->id.'/intimate-consent', ['accepted' => false]);
        $this->get('/ephemeral/'.$media->id)->assertForbidden();
        $this->assertNull($media->fresh()->first_viewed_at);
    }

    public function test_expired_selfie_challenge_is_rejected_before_storage(): void
    {
        \Illuminate\Support\Facades\Storage::fake('local');
        $user = $this->member();
        $this->actingAs($user)->withSession(['verification_challenge_code' => '123456', 'verification_challenge_expires_at' => time() - 1])
            ->post('/verification', ['photo' => \Illuminate\Http\UploadedFile::fake()->image('selfie.jpg')])->assertSessionHasErrors('photo');
        $this->assertDatabaseCount('verification_photos', 0);
    }

    public function test_birth_date_correction_requires_admin_and_a_valid_adult_date(): void
    {
        $user = $this->member();
        $url = '/admin/users/'.$user->id.'/birth-date';
        $this->actingAs($user)->put($url, ['date_of_birth' => '1990-03-04', 'reason' => 'Correction demandée par la membre.'])->assertForbidden();
        $admin = User::factory()->create(['is_admin' => true]);
        $this->actingAs($admin)->put($url, ['date_of_birth' => now()->subYears(15)->toDateString(), 'reason' => 'Correction demandée par la membre.'])->assertSessionHasErrors('date_of_birth');
        $this->put($url, ['date_of_birth' => '1990-03-04', 'reason' => 'Correction demandée par la membre.'])->assertSessionHasNoErrors();
        $this->assertSame('1990-03-04', $user->fresh()->profile->date_of_birth->toDateString());
    }
}
