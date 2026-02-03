<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Category;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        // Nekoliko fiksnih kategorija za test
        $categories = ['Food', 'Transport', 'Accommodation', 'Entertainment', 'Travel'];

        foreach ($categories as $name) {
            Category::create(['name' => $name]);
        }
    }
}
