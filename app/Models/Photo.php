<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Photo extends Model
{
    /** @use HasFactory<\Database\Factories\PhotoFactory> */
    use HasFactory;

    protected $fillable = [
        'user_id',
        'media_type',
        'path',
        'content_hash',
        'moderation_status',
        'thumbnail_path',
        'duration',
        'is_primary',
        'avatar_requested_at',
        'is_approved',
        'is_naughty',
        'is_private',
        'order',
        'rejection_reason',
    ];

    /** Exposés au client à la place du chemin de stockage. */
    protected $appends = ['url', 'thumbnail_url'];

    /** Les chemins disque ne doivent jamais atteindre le navigateur. */
    protected $hidden = ['path', 'thumbnail_path', 'content_hash'];

    protected function casts(): array
    {
        return [
            'is_primary' => 'boolean',
            'avatar_requested_at' => 'datetime',
            'is_approved' => 'boolean',
            'is_naughty' => 'boolean',
            'is_private' => 'boolean',
            'duration' => 'integer',
            'order' => 'integer',
        ];
    }

    public function isVideo(): bool
    {
        return $this->media_type === 'video';
    }

    /**
     * Whether this photo may be shown to a member with the given consent.
     */
    public function isVisibleTo(bool $viewerAcceptsNaughty): bool
    {
        return $this->is_approved
            && $this->moderation_status !== 'rejected'
            && ($viewerAcceptsNaughty || ! $this->is_naughty);
    }

    /**
     * Faut-il masquer ce média à cette visiteuse ?
     *
     * Deux verrous indépendants, chacun suffisant :
     *  - coquin  : tant que la visiteuse n'a pas activé son mode coquin ;
     *  - privé   : tant que sa propriétaire n'a pas accordé l'accès.
     *
     * Source unique de la règle : la route média et l'affichage du profil
     * doivent tous deux passer par ici, sinon ils divergent.
     */
    public function isObscuredFor(bool $isOwner, bool $viewerAcceptsNaughty, bool $hasGalleryAccess): bool
    {
        if ($isOwner) {
            return false;
        }

        if ($this->is_naughty && ! $viewerAcceptsNaughty) {
            return true;
        }

        return $this->is_private && ! $hasGalleryAccess;
    }

    /**
     * URL that renders this photo for the current viewer (consent + watermark).
     * Never expose the raw storage path to members.
     */
    public function viewUrl(bool $thumbnail = false): string
    {
        return route('media.photo', $thumbnail ? [$this, 'thumb' => 1] : [$this]);
    }

    /**
     * URL exposée lors de la sérialisation du modèle.
     *
     * Le chemin de stockage ne doit jamais partir vers le client : seule la
     * route média applique le filigrane, le floutage et les contrôles d'accès.
     */
    public function getUrlAttribute(): string
    {
        return $this->viewUrl();
    }

    public function getThumbnailUrlAttribute(): string
    {
        return $this->viewUrl(thumbnail: true);
    }

    /**
     * Get the user that owns the photo.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
