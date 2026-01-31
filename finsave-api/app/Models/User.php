<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable implements MustVerifyEmail
{
    use Notifiable, HasFactory;
    use HasApiTokens;

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'role' => 'string',
    ];

    // Troškovi koje je korisnik platio
    public function expensesPaid()
    {
        return $this->hasMany(Expense::class, 'payer_id');
    }

    // Učešće u troškovima
    public function expenseParticipations()
    {
        return $this->hasMany(ExpenseParticipant::class);
    }

    // Poravnanja poslana drugima
    public function settlementsSent()
    {
        return $this->hasMany(Settlement::class, 'from_user_id');
    }

    // Poravnanja primljena od drugih
    public function settlementsReceived()
    {
        return $this->hasMany(Settlement::class, 'to_user_id');
    }

    // Provera uloge
    public function isAdmin()
    {
        return $this->role === 'admin';
    }

    public function isRegular()
    {
        return $this->role === 'regular';
    }
}
