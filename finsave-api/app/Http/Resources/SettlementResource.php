<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class SettlementResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id'            => $this->id,
            'from_user_id'  => $this->from_user_id,
            'to_user_id'    => $this->to_user_id,
            'amount'        => (float) $this->amount,
            'note'          => (string) ($this->note ?? ''),
            'settled_at'    => optional($this->settled_at)->toDateTimeString(),

            // keep both sides so the client can infer direction
            'from_user'     => new UserResource($this->whenLoaded('fromUser')),
            'to_user'       => new UserResource($this->whenLoaded('toUser')),
        ];
    }
}

