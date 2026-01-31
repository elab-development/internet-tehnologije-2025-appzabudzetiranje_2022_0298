<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration //kreira sve ostale tabele
{
  public function up(): void
    {
        Schema::create('categories', function (Blueprint $table) {
            $table->id();
            $table->string('name', 5); //
            $table->timestamps(); //podrazumeva se
        });

        Schema::create('expenses', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('payer_id'); //unsigned- nengativan
            $table->unsignedBigInteger('category_id')->nullable(); // moze null
            $table->string('description', 5)->nullable(); 
            $table->decimal('amount', 12, 2);
            $table->dateTime('paid_at')->nullable();
            $table->timestamps();
        });

        Schema::create('expense_participants', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('expense_id');
            $table->unsignedBigInteger('user_id');
            $table->decimal('amount_owed', 12, 2);
            $table->boolean('is_settled')->default(false);
            $table->timestamps();
        });

        Schema::create('settlements', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('from_user_id');
            $table->unsignedBigInteger('to_user_id');
            $table->decimal('amount', 12, 2);
            $table->string('note', 5)->nullable();
            $table->dateTime('settled_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void //kao rollback radi, da ponisti vec uradjeno
    {
        Schema::dropIfExists('settlements');
        Schema::dropIfExists('expense_participants');
        Schema::dropIfExists('expenses');
        Schema::dropIfExists('categories');
    }
};
