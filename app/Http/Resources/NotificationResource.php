<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class NotificationResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'type' => $this->type,
            'message' => $this->data['message'] ?? '',
            'user' => $this->related_user,
            'created_at' => $this->created_at,
            'is_read' => $this->is_read,
            'read_at' => $this->read_at,
        ];
    }
}
