<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Auth;
use App\Models\Expense;
use App\Models\ExpenseParticipant;

class StatisticsController extends Controller
{
    public function savingsStats()
    {
        $user = Auth::user();

        if ($user->role !== 'regular') {
            return response()->json(['message' => 'Forbidden. Only regular users can view stats.'], 403);
        }

        $paidTotal = Expense::where('payer_id', $user->id)->sum('amount');
        $owedTotal = ExpenseParticipant::where('user_id', $user->id)->sum('amount_owed');

        return response()->json([
            'paid_total' => $paidTotal,
            'owed_total' => $owedTotal,
            'balance'    => $paidTotal - $owedTotal,
        ]);
    }
}


