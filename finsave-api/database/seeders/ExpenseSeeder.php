<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Expense;
use App\Models\User;
use App\Models\Category;

class ExpenseSeeder extends Seeder
{
    public function run(): void
    {
        $users = User::all();
        $categories = Category::all();

        // Kreiraj nekoliko troškova koji imaju realne platioce i kategorije
        foreach ($users as $user) {
            Expense::factory()->create([
                'payer_id' => $user->id,
                'category_id' => $categories->random()->id,
            ]);
        }
    }
}

