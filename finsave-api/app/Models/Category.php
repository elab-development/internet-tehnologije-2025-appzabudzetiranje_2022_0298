<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    use HasFactory;

    protected $fillable = ["name"]; //низ атрибута,id ne navodimo on se po defaultu kreira, imamo samo name, 
    

    public function expenses(){
    return $this->hasMany(Expense::class); //veza u pmovu, jedna kategorija moze imati vise troskova
    }
}
