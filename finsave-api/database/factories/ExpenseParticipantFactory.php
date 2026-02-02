<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\Expense;
use App\Models\User;

class ExpenseParticipantFactory extends Factory
{
    public function definition(): array
    {
        return [
            'expense_id' => Expense::inRandomOrder()->first()?->id ?? Expense::factory(),
            'user_id' => User::inRandomOrder()->first()?->id ?? User::factory(),
            'amount_owed' => $this->faker->randomFloat(2, 5, 50),
            'is_settled' => $this->faker->boolean(30), // 30% šanse da je refundiran
        ];
    }
}
