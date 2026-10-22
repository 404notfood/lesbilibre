<?php

namespace Tests\Feature;

use App\Console\Commands\PruneEphemeralMedia;
use App\Console\Commands\PrunePhotoRenderCache;
use App\Models\EphemeralMedia;
use App\Models\VerificationPhoto;
use App\Services\PhotoProcessingService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Mockery;
use RuntimeException;
use Tests\TestCase;

class PurgeFailureTest extends TestCase
{
    use RefreshDatabase;

    public function test_a_failed_selfie_deletion_keeps_the_path_for_retry(): void
    {
        $photo = VerificationPhoto::factory()->approved()->create(['updated_at' => now()->subDays(31)]);
        $disk = Mockery::mock();
        $disk->shouldReceive('delete')->once()->with($photo->path)->andReturn(false);
        Storage::shouldReceive('disk')->with('local')->andReturn($disk);
        try {
            $this->artisan('privacy:prune-verification-photos')->run();
            $this->fail('A storage refusal must fail the purge command.');
        } catch (RuntimeException $exception) {
            $this->assertStringContainsString('refusée', $exception->getMessage());
            $this->assertSame($photo->path, $photo->fresh()->path);
        }
    }

    public function test_a_failed_ephemeral_deletion_is_never_marked_as_purged(): void
    {
        $medium = EphemeralMedia::factory()->create(['purge_after' => now()->subDay()]);
        $disk = Mockery::mock();
        $disk->shouldReceive('exists')->with($medium->path)->andReturn(true);
        $disk->shouldReceive('delete')->once()->with($medium->path)->andReturn(false);
        Storage::shouldReceive('disk')->with('local')->andReturn($disk);
        try {
            app(PruneEphemeralMedia::class)->handle();
            $this->fail('A storage refusal must fail the purge command.');
        } catch (RuntimeException $exception) {
            $this->assertStringContainsString('refusée', $exception->getMessage());
            $this->assertNull($medium->fresh()->purged_at);
        }
    }

    public function test_a_failed_cache_deletion_is_reported_as_a_failure(): void
    {
        $directory = PhotoProcessingService::RENDER_CACHE_DIRECTORY;
        $disk = Mockery::mock();
        $disk->shouldReceive('exists')->with($directory)->andReturn(true);
        $disk->shouldReceive('files')->with($directory)->andReturn([$directory.'/test.jpg']);
        $disk->shouldReceive('lastModified')->andReturn(now()->subDays(2)->getTimestamp());
        $disk->shouldReceive('delete')->once()->andReturn(false);
        Storage::shouldReceive('disk')->with('local')->andReturn($disk);
        $this->expectException(RuntimeException::class);
        app(PrunePhotoRenderCache::class)->handle();
    }

    public function test_successful_selfie_purge_removes_only_old_decided_files(): void
    {
        Storage::fake('local');
        $old = VerificationPhoto::factory()->approved()->create(['updated_at' => now()->subDays(31)]);
        $pending = VerificationPhoto::factory()->create(['updated_at' => now()->subDays(31)]);
        $recent = VerificationPhoto::factory()->approved()->create();
        foreach ([$old, $pending, $recent] as $photo) {
            Storage::disk('local')->put($photo->path, 'synthetic selfie');
        }
        $oldPath = $old->path;
        $this->artisan('privacy:prune-verification-photos')->assertSuccessful();
        Storage::disk('local')->assertMissing($oldPath);
        $this->assertNull($old->fresh()->path);
        Storage::disk('local')->assertExists([$pending->path, $recent->path]);
        $this->actingAs(\App\Models\User::factory()->create(['is_admin' => true]))
            ->get(route('admin.verifications.image', $old))->assertNotFound();
    }
}
