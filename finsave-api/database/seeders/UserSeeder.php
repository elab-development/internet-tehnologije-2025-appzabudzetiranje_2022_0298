<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // 1️⃣ Admin korisnik ručno
        User::create([
            'name' => 'Admin User',
            'email' => 'admin123@gmail.com',
            'email_verified_at' => now(),
            'password' => bcrypt('admin123'),
            'role' => 'admin',
        ]);

        // 2️⃣ Par regular korisnika preko factoryja
        User::factory(3)->create();
    }
}
