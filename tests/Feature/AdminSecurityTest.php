<?php

namespace Tests\Feature;

use App\Models\Setting;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminSecurityTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_confirm_password_before_enrolling_two_factor(): void
    {
        config(['admin-security.require_two_factor' => true]);
        $admin = User::factory()->withoutTwoFactor()->create(['is_admin' => true]);

        $this->actingAs($admin)->get(route('admin.dashboard'))
            ->assertRedirect(route('two-factor.show'));
        $this->get(route('two-factor.show'))->assertRedirect(route('password.confirm'));
        $this->get(route('password.confirm'))->assertOk();

        $this->post(route('password.confirm.store'), ['password' => 'password'])
            ->assertRedirect(route('two-factor.show'))
            ->assertSessionHas('auth.password_confirmed_at');

        $this->get(route('two-factor.show'))->assertOk();
        // Confirming the password must not bypass the two-factor enrollment requirement.
        $this->get(route('admin.dashboard'))->assertRedirect(route('two-factor.show'));
    }

    public function test_admin_without_confirmed_two_factor_is_sent_to_enrollment(): void
    {
        config(['admin-security.require_two_factor' => true]);
        $admin = User::factory()->withoutTwoFactor()->create(['is_admin' => true]);
        $this->actingAs($admin)->get(route('admin.moderation.index'))->assertRedirect(route('two-factor.show'));
        $this->get(route('admin.verifications.index'))->assertRedirect(route('two-factor.show'));
        $this->withSession(['auth.password_confirmed_at' => time()])->get(route('two-factor.show'))->assertOk();
    }

    public function test_non_admins_do_not_gain_admin_access_by_enrolling_two_factor(): void
    {
        $this->actingAs(User::factory()->communityMember()->create())->get(route('admin.moderation.index'))->assertForbidden();
    }

    public function test_sensitive_action_requires_recent_password_when_enabled(): void
    {
        config(['admin-security.require_recent_password' => true]);
        $admin = User::factory()->create(['is_admin' => true]);
        $target = User::factory()->create();
        $this->actingAs($admin)->deleteJson(route('admin.users.destroy', $target))->assertStatus(423);
        $this->assertNotSoftDeleted('users', ['id' => $target->id]);
    }

    public function test_inertia_robots_update_can_confirm_password_before_retrying(): void
    {
        config(['admin-security.require_recent_password' => true]);
        $this->withoutVite();
        $admin = User::factory()->create(['is_admin' => true]);
        $data = ['indexing_enabled' => true, 'custom_robots' => true, 'robots_content' => "User-agent: *\nDisallow: /essai\n"];
        $headers = ['X-Inertia' => 'true', 'X-Requested-With' => 'XMLHttpRequest', 'Accept' => 'text/html, application/xhtml+xml'];

        $this->actingAs($admin)->from(route('admin.seo.index'))
            ->put(route('admin.seo.robots.update'), $data, $headers)
            ->assertStatus(303)
            ->assertRedirect(route('password.confirm'));
        $this->assertNull(Setting::get('seo_robots_content'));
        $this->get(route('password.confirm'))->assertOk();

        $this->post(route('password.confirm.store'), ['password' => 'password'])
            ->assertRedirect()
            ->assertSessionHas('auth.password_confirmed_at');
        $this->from(route('admin.seo.index'))
            ->put(route('admin.seo.robots.update'), $data, $headers)
            ->assertStatus(303)
            ->assertRedirect(route('admin.seo.index'));
        $this->assertSame($data['robots_content'], Setting::get('seo_robots_content'));
    }

    public function test_inertia_write_redirects_to_two_factor_enrollment_using_get(): void
    {
        config(['admin-security.require_two_factor' => true]);
        $this->withoutVite();
        $admin = User::factory()->withoutTwoFactor()->create(['is_admin' => true]);

        $this->actingAs($admin)
            ->put(route('admin.seo.robots.update'), ['indexing_enabled' => true, 'custom_robots' => false], [
                'X-Inertia' => 'true', 'X-Requested-With' => 'XMLHttpRequest', 'Accept' => 'text/html, application/xhtml+xml',
            ])
            ->assertStatus(303)
            ->assertRedirect(route('two-factor.show'));
        $this->assertNull(Setting::get('seo_indexing_enabled'));
        $this->withSession(['auth.password_confirmed_at' => time()])
            ->get(route('two-factor.show'))->assertOk();
    }

    public function test_confirmation_does_not_allow_admins_to_remove_their_own_account_via_admin(): void
    {
        config(['admin-security.require_recent_password' => true]);
        $admin = User::factory()->create(['is_admin' => true]);
        $this->actingAs($admin)->withSession(['auth.password_confirmed_at' => time()])->deleteJson(route('admin.users.destroy', $admin))->assertStatus(422);
        $this->assertNotSoftDeleted('users', ['id' => $admin->id]);
    }
}
