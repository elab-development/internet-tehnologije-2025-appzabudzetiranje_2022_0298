<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('expenses', function (Blueprint $table) {
            $table->foreign('payer_id')->references('id')->on('users')->cascadeOnDelete(); //ne moyemo da obrisemo korisnika pre nego obrisemo sve troskove gde je ucestvovao
            $table->foreign('category_id')->references('id')->on('categories')->nullOnDelete();//ako obrisemo kategoriju, kat id ce biti null.
        });

        Schema::table('expense_participants', function (Blueprint $table) {
            $table->foreign('expense_id')->references('id')->on('expenses')->cascadeOnDelete();
            $table->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();
        });

        Schema::table('settlements', function (Blueprint $table) {
            $table->foreign('from_user_id')->references('id')->on('users')->cascadeOnDelete();
            $table->foreign('to_user_id')->references('id')->on('users')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('expenses', function (Blueprint $table) {
            $table->dropForeign(['payer_id']);
            $table->dropForeign(['category_id']);
        });

        Schema::table('expense_participants', function (Blueprint $table) {
            $table->dropForeign(['expense_id']);
            $table->dropForeign(['user_id']);
        });

        Schema::table('settlements', function (Blueprint $table) {
            $table->dropForeign(['from_user_id']);
            $table->dropForeign(['to_user_id']);
        });
    }
};