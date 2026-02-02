<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\User;

class SettlementFactory extends Factory
{
    public function definition(): array
    {
        $users = User::all();
        if ($users->count() < 2) {
            return [];
        }

        $from = $users->random();
        $to = $users->where('id', '!=', $from->id)->random();

        return [
            'from_user_id' => $from->id,
            'to_user_id' => $to->id,
            'amount' => $this->faker->randomFloat(2, 5, 40),
            'note' => $this->faker->sentence(2),
            'settled_at' => $this->faker->optional()->dateTimeBetween('-5 days', 'now'),
        ];
    }
}
