<?php

namespace Tests\Feature;

use App\Models\Badge;
use App\Models\NaughtyInterest;
use App\Models\Setting;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Database\Seeders\ProductionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class ProductionSeederTest extends TestCase
{
    use RefreshDatabase;

    protected function tearDown(): void
    {
        putenv('DEPLOY_ADMIN_EMAIL');
        putenv('DEPLOY_ADMIN_PASSWORD');
        parent::tearDown();
    }

    public function test_default_production_seed_does_not_run_demo_seeders(): void
    {
        $this->app->detectEnvironment(fn () => 'production');
        putenv('DEPLOY_ADMIN_EMAIL=admin@example.com');
        putenv('DEPLOY_ADMIN_PASSWORD=long-random-password-for-this-test-only');

        $this->artisan('db:seed', ['--class' => DatabaseSeeder::class, '--force' => true])->assertSuccessful();

        $this->assertDatabaseCount('users', 1);
        $this->assertSame('admin@example.com', User::query()->sole()->email);
        $this->assertDatabaseCount('profiles', 0);
    }

    public function test_partial_demo_seed_is_disabled_without_deleting_accounts(): void
    {
        $demoAdmin = User::forceCreate([
            'name' => 'Steff', 'pseudo' => 'steff', 'email' => 'admin@lesbi-libre.test',
            'password' => Hash::make('admin1234'), 'is_admin' => true,
        ]);
        $demoMember = User::forceCreate([
            'name' => 'Sophie', 'pseudo' => 'sophie', 'email' => 'sophie@test.com',
            'password' => Hash::make('password'),
        ]);
        putenv('DEPLOY_ADMIN_EMAIL=admin@example.com');
        putenv('DEPLOY_ADMIN_PASSWORD=long-random-password-for-this-test-only');

        $this->seed(ProductionSeeder::class);

        $this->assertDatabaseCount('users', 3);
        $this->assertTrue($demoAdmin->fresh()->is_banned);
        $this->assertFalse($demoAdmin->fresh()->is_admin);
        $this->assertFalse(Hash::check('admin1234', $demoAdmin->fresh()->password));
        $this->assertTrue($demoMember->fresh()->is_banned);
        $this->assertFalse(Hash::check('password', $demoMember->fresh()->password));
        $this->assertSame('admin@example.com', User::query()->where('is_admin', true)->sole()->email);
    }

    public function test_a_demo_address_with_a_changed_password_is_preserved(): void
    {
        $admin = User::forceCreate([
            'name' => 'Steff', 'pseudo' => 'steff', 'email' => 'admin@lesbi-libre.test',
            'password' => Hash::make('already-changed-strong-password'), 'is_admin' => true,
        ]);

        $this->seed(ProductionSeeder::class);

        $this->assertDatabaseCount('users', 1);
        $this->assertFalse($admin->fresh()->is_banned);
        $this->assertTrue($admin->fresh()->is_admin);
        $this->assertTrue(Hash::check('already-changed-strong-password', $admin->fresh()->password));
    }

    public function test_production_seed_creates_reference_data_and_one_admin_without_demo_accounts(): void
    {
        putenv('DEPLOY_ADMIN_EMAIL=admin@example.com');
        putenv('DEPLOY_ADMIN_PASSWORD=long-random-password-for-this-test-only');
        $this->seed(ProductionSeeder::class);

        $admin = User::query()->sole();
        $this->assertTrue($admin->is_admin);
        $this->assertSame('admin@example.com', $admin->email);
        $this->assertTrue(Hash::check('long-random-password-for-this-test-only', $admin->password));
        $this->assertGreaterThan(0, Badge::query()->count());
        $this->assertGreaterThan(0, NaughtyInterest::query()->count());
        $this->assertDatabaseCount('premium_plans', count(config('launch-pricing.plans')));
        $this->assertDatabaseCount('gem_packages', 5);

        $counts = [Badge::query()->count(), NaughtyInterest::query()->count(), Setting::query()->count()];
        $setting = Setting::query()->firstOrFail();
        $setting->update(['value' => 'production-custom-value']);
        $hash = $admin->password;
        putenv('DEPLOY_ADMIN_PASSWORD=different-long-password-not-to-be-applied');
        $this->seed(ProductionSeeder::class);

        $this->assertDatabaseCount('users', 1);
        $this->assertSame($hash, $admin->fresh()->password);
        $this->assertSame('production-custom-value', $setting->fresh()->value);
        $this->assertSame($counts, [Badge::query()->count(), NaughtyInterest::query()->count(), Setting::query()->count()]);
    }

    public function test_an_existing_regular_account_is_never_promoted_and_failed_seed_rolls_back(): void
    {
        $user = User::factory()->create(['email' => 'member@example.com']);
        putenv('DEPLOY_ADMIN_EMAIL=member@example.com');
        putenv('DEPLOY_ADMIN_PASSWORD=long-random-password-for-this-test-only');
        try {
            $this->seed(ProductionSeeder::class);
            $this->fail('An existing regular account must not become an administrator.');
        } catch (\RuntimeException $error) {
            $this->assertStringContainsString('aucun compte existant', $error->getMessage());
        }
        $this->assertFalse($user->fresh()->is_admin);
        $this->assertDatabaseCount('badges', 0);
        $this->assertDatabaseCount('naughty_interests', 0);
    }
}
