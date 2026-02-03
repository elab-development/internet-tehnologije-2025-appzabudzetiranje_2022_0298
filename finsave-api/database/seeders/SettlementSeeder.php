<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Settlement;
use App\Models\User;

class SettlementSeeder extends Seeder
{
    public function run(): void
    {
        $users = User::all();

        if ($users->count() > 1) {
            // Dve male refundacije između korisnika
            Settlement::factory(2)->create();
        }
    }
}