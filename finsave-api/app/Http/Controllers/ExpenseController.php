<?php


namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\Expense;
use App\Http\Resources\ExpenseResource;

class ExpenseController extends Controller
{
    /**
     * List all expenses related to the authenticated user.
     */
    public function index()
    {
        $user = Auth::user();

        $expenses = Expense::with(['payer', 'category', 'participants.user'])
            ->whereHas('participants', fn($q) => $q->where('user_id', $user->id))
            ->orWhere('payer_id', $user->id)
            ->get();

        return ExpenseResource::collection($expenses);
    }

    /**
     * Store a new expense for the authenticated user.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'category_id' => 'required|exists:categories,id',
            'description' => 'nullable|string',
            'amount'      => 'required|numeric|min:0',
            'paid_at'     => 'required|date',
        ]);

        $expense = Expense::create([
            'payer_id'   => Auth::id(),
            'category_id'=> $validated['category_id'],
            'description'=> $validated['description'] ?? '',
            'amount'     => $validated['amount'],
            'paid_at'    => $validated['paid_at'],
        ]);

        return new ExpenseResource($expense->load(['payer', 'category']));
    }

    /**
     * Update an existing expense (only if created by the authenticated user).
     */
    public function update(Request $request, $id)
    {
        $expense = Expense::findOrFail($id);

        // Authorization: only the payer can update
        if ($expense->payer_id !== Auth::id()) {
            return response()->json(['message' => 'Forbidden. You can only update your own expenses.'], 403);
        }

        $validated = $request->validate([
            'category_id' => 'sometimes|exists:categories,id',
            'description' => 'sometimes|string',
            'amount'      => 'sometimes|numeric|min:0',
            'paid_at'     => 'sometimes|date',
        ]);

        $expense->update($validated);

        return new ExpenseResource($expense->fresh()->load(['payer', 'category']));
    }

    /**
     * Delete an existing expense (only if created by the authenticated user).
     */
    public function destroy($id)
    {
        $expense = Expense::findOrFail($id);

        // Authorization: only the payer can delete
        if ($expense->payer_id !== Auth::id()) {
            return response()->json(['message' => 'Forbidden. You can only delete your own expenses.'], 403);
        }

        $expense->delete();

        return response()->json(['message' => 'Expense deleted successfully.']);
    }
}
