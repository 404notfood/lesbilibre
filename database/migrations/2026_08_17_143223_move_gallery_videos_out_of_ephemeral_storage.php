<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $this->moveGalleryVideos('ephemeral/', 'gallery/videos/');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $this->moveGalleryVideos('gallery/videos/', 'ephemeral/');
    }

    private function moveGalleryVideos(string $sourcePrefix, string $destinationPrefix): void
    {
        $disk = Storage::disk('local');

        DB::table('photos')
            ->where('media_type', 'video')
            ->where('path', 'like', $sourcePrefix.'%')
            ->orderBy('id')
            ->chunkById(100, function ($photos) use ($disk, $sourcePrefix, $destinationPrefix) {
                foreach ($photos as $photo) {
                    $path = $this->moveFile($disk, $photo->path, $sourcePrefix, $destinationPrefix);
                    $thumbnailPath = $this->moveFile(
                        $disk,
                        $photo->thumbnail_path,
                        $sourcePrefix,
                        $destinationPrefix,
                    );

                    DB::table('photos')->where('id', $photo->id)->update([
                        'path' => $path,
                        'thumbnail_path' => $thumbnailPath,
                    ]);
                }
            });
    }

    private function moveFile(
        \Illuminate\Filesystem\FilesystemAdapter $disk,
        ?string $path,
        string $sourcePrefix,
        string $destinationPrefix,
    ): ?string {
        if ($path === null || ! str_starts_with($path, $sourcePrefix)) {
            return $path;
        }

        $destination = $destinationPrefix.basename($path);

        if ($disk->exists($path) && ! $disk->exists($destination)) {
            $disk->move($path, $destination);
        }

        return $destination;
    }
};
