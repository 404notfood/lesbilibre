<?php

namespace Tests\Unit\Services;

use App\Services\VideoProcessingService;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Mockery\MockInterface;
use Tests\TestCase;

class VideoProcessingServiceTest extends TestCase
{
    public function test_gallery_videos_are_transcoded_outside_ephemeral_storage(): void
    {
        Storage::fake('local');

        $video = UploadedFile::fake()->create('gallery.mp4', 100, 'video/mp4');
        $service = $this->partialMock(
            VideoProcessingService::class,
            function (MockInterface $mock): void {
                $mock->shouldReceive('isAvailable')->once()->andReturnTrue();
                $mock->shouldReceive('durationOf')->once()->andReturn(12.4);
                $mock->shouldReceive('transcode')
                    ->once()
                    ->withArgs(fn (string $path, string $disk, string $destination): bool => str_starts_with($path, 'gallery-tmp/')
                        && $disk === 'local'
                        && $destination === 'gallery/videos')
                    ->andReturn([
                        'path' => 'gallery/videos/video.mp4',
                        'thumbnail_path' => 'gallery/videos/video.jpg',
                    ]);
            }
        );

        $stored = $service->storeGalleryVideo($video);

        $this->assertSame('gallery/videos/video.mp4', $stored['path']);
        $this->assertSame('gallery/videos/video.jpg', $stored['thumbnail_path']);
        $this->assertSame(12, $stored['duration']);
    }
}
