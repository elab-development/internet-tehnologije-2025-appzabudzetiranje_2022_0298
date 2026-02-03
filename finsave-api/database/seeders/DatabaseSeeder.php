<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([ //redosled pozivanja
            UserSeeder::class,
            CategorySeeder::class,
            ExpenseSeeder::class,
            ExpenseParticipantSeeder::class,
            SettlementSeeder::class,
        ]);
    }
}

