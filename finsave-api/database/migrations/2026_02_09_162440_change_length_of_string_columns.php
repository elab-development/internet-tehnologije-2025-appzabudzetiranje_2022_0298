<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
   public function up(): void
    {
        Schema::table('categories', function (Blueprint $table) {
            $table->string('name', 500)->change(); //menjamo na 500 karaktera
        });

        Schema::table('expenses', function (Blueprint $table) {
            $table->string('description', 500)->nullable()->change();
        });

        Schema::table('settlements', function (Blueprint $table) {
            $table->string('note', 500)->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('categories', function (Blueprint $table) {
            $table->string('name', 5)->change();
        });

        Schema::table('expenses', function (Blueprint $table) {
            $table->string('description', 5)->nullable()->change();
        });

        Schema::table('settlements', function (Blueprint $table) {
            $table->string('note', 5)->nullable()->change();
        });
    }
};
