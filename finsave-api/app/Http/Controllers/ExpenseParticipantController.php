<?php


namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Expense;
use App\Models\ExpenseParticipant;
use App\Http\Resources\ExpenseParticipantResource;

class ExpenseParticipantController extends Controller
{
    public function index()
    {
        // We only need the user relation; expense_id is returned by the resource.
        return ExpenseParticipantResource::collection(
            ExpenseParticipant::with('user')->get()
        );
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'expense_id'  => 'required|exists:expenses,id',
            'user_id'     => 'required|exists:users,id',
            'amount_owed' => 'required|numeric|min:0',
            'is_settled'  => 'boolean',
        ]);

        // ----- Server-side guard: do not allow exceeding the expense amount -----
        $expense = Expense::findOrFail($validated['expense_id']);

        $currentTotal = ExpenseParticipant::where('expense_id', $expense->id)
            ->sum('amount_owed');

        if (($currentTotal + $validated['amount_owed']) > $expense->amount) {
            return response()->json([
                'message' => 'Total of participant amounts would exceed the expense amount.'
            ], 422);
        }

        // (Optional) avoid duplicates of the same user per expense
        $already = ExpenseParticipant::where('expense_id', $expense->id)
            ->where('user_id', $validated['user_id'])
            ->exists();
        if ($already) {
            return response()->json([
                'message' => 'This user is already a participant for the expense.'
            ], 422);
        }

        $participant = ExpenseParticipant::create($validated)->load('user');

        return new ExpenseParticipantResource($participant);
    }

    public function destroy($id)
    {
        $participant = ExpenseParticipant::findOrFail($id);
        $participant->delete();

        return response()->json(['message' => 'Participant removed.']);
    }
}
