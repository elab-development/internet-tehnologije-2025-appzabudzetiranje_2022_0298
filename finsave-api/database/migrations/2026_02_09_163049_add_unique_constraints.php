<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration //definisemo da je neki podatak jedinstven
{
    public function up(): void
    {

        Schema::table('categories', function (Blueprint $table) {
            $table->unique('name'); //jedinstveno ime
        });

        Schema::table('expense_participants', function (Blueprint $table) {
            $table->unique(['expense_id', 'user_id']);
        });
    }

    public function down(): void
    {

        Schema::table('categories', function (Blueprint $table) {
            $table->dropUnique(['name']);
        });

        Schema::table('expense_participants', function (Blueprint $table) {
            $table->dropUnique(['expense_id', 'user_id']);
        });
    }
};