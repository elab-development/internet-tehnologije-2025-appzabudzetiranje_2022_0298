<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Expense extends Model
{
    use HasFactory;

    protected $fillable = [
        "payer_id",
        "category_id",
        "description",
        "amount",
        "paid_at",
    ]; // 
    protected $casts= [
        "amount" => 'decimal>z', 
        "paid_at" => 'datetime',
        ]; //kastovanje automatski

        public function payer()
        {
            return $this->belongsTo(User::class, 'payer_id');
        }
            public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function participants()
    {
        return $this->hasMany(ExpenseParticipant::class);
    }
}
