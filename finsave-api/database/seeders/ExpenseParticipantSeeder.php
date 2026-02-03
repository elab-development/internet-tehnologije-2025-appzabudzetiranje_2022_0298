<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Expense;
use App\Models\User;
use App\Models\ExpenseParticipant;

class ExpenseParticipantSeeder extends Seeder
{
    public function run(): void
    {
        $expenses = Expense::all();
        $users = User::all();

        foreach ($expenses as $expense) {
            // Za svaki trošak dodeli 2-3 učesnika koji duguju
            $participants = $users->where('id', '!=', $expense->payer_id)->random(min(2, $users->count() - 1));
            foreach ($participants as $user) {
                ExpenseParticipant::factory()->create([
                    'expense_id' => $expense->id,
                    'user_id' => $user->id,
                    'amount_owed' => round($expense->amount / 3, 2),
                    'is_settled' => false,
                ]);
            }
        }
    }
}
