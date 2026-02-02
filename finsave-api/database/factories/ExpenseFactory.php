<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\User;
use App\Models\Category;

class ExpenseFactory extends Factory
{
    public function definition(): array
    {
        return [
            'payer_id' => User::inRandomOrder()->first()?->id ?? User::factory(),
            'category_id' => Category::inRandomOrder()->first()?->id ?? Category::factory(),
            'description' => $this->faker->sentence(3),
            'amount' => $this->faker->randomFloat(2, 5, 100),
            'paid_at' => $this->faker->dateTimeBetween('-10 days', 'now'),
        ];
    }
}

