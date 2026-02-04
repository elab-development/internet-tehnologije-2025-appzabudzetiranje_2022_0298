<?php


namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class ExpenseParticipantResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id'          => $this->id,
            // send the link back to the expense so the UI can attach correctly
            'expense_id'  => $this->expense_id,
            'user_id'     => $this->user_id,

            // keep user for display
            'user'        => new UserResource($this->whenLoaded('user')),

            'amount_owed' => $this->amount_owed,
            'is_settled'  => (bool) $this->is_settled,

            // optional, but handy
            'created_at'  => $this->created_at,
        ];
    }
}
