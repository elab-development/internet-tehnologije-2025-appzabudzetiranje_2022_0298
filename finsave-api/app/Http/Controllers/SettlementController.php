<?php


namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\Settlement;
use App\Http\Resources\SettlementResource;

class SettlementController extends Controller
{
    /**
     * Display all settlements for the authenticated user.
     */
    public function index()
    {
        $user = Auth::user();

        $settlements = Settlement::where('from_user_id', $user->id)
            ->orWhere('to_user_id', $user->id)
            ->with(['fromUser', 'toUser'])
            ->get();

        return SettlementResource::collection($settlements);
    }

    /**
     * Store a new settlement (refund) between users.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'to_user_id' => 'required|exists:users,id',
            'amount'     => 'required|numeric|min:0.01',
            'note'       => 'nullable|string',
        ]);

        $settlement = Settlement::create([
            'from_user_id' => Auth::id(),
            'to_user_id'   => $validated['to_user_id'],
            'amount'       => $validated['amount'],
            'note'         => $validated['note'] ?? '',
            'settled_at'   => now(),
        ]);

        return new SettlementResource($settlement->load(['fromUser', 'toUser']));
    }

    /**
     * Update an existing settlement (only by the user who created it).
     */
    public function update(Request $request, $id)
    {
        $settlement = Settlement::findOrFail($id);

        // Only the user who created (from_user) can update it
        if ($settlement->from_user_id !== Auth::id()) {
            return response()->json(['message' => 'Forbidden. You can only update your own settlements.'], 403);
        }

        $validated = $request->validate([
            'amount' => 'sometimes|numeric|min:0.01',
            'note'   => 'nullable|string',
        ]);

        $settlement->update($validated);

        return new SettlementResource($settlement->fresh()->load(['fromUser', 'toUser']));
    }
}

