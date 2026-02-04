<?php


namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class ExpenseResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id'          => $this->id,
            'description' => $this->description,
            'amount'      => $this->amount,
            'paid_at'     => $this->paid_at,
            'payer'       => new UserResource($this->whenLoaded('payer')),
            'category'    => new CategoryResource($this->whenLoaded('category')),
            'participants'=> ExpenseParticipantResource::collection($this->whenLoaded('participants')),
        ];
    }
}
