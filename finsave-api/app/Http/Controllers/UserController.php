<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;

class UserController extends Controller
{
    /**
     * List users.
     * - Available to all authenticated users (no admin check).
     * - Use ?all=1 to return full list (id, name, email, role, image_url) for dropdowns.
     * - Otherwise returns a paginated, searchable, and sortable result.
     * - Sorting: ?sort=name_asc | name_desc (defaults: ALL->name asc, paginated->created_at desc)
     */
    public function index(Request $request)
    {
        $query = User::query()->select('id', 'name', 'email', 'role', 'created_at', 'updated_at');

        // Exclude admins if the 'role' column exists
        if (Schema::hasColumn('users', 'role')) {
            $query->where('role', '!=', 'admin');
        }

        // Exclude the currently logged-in user
        $currentUserId = auth()->id();
        if ($currentUserId) {
            $query->where('id', '!=', $currentUserId);
        }

        // Optional search
        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $sort = $request->query('sort');

        // Full list for combo boxes
        if ($request->boolean('all')) {
            if ($sort === 'name_desc') {
                $query->orderBy('name', 'desc');
            } else {
                $query->orderBy('name', 'asc');
            }
            $users = $query->get();
            return response()->json($users);
        }

        // Paginated by default
        $perPage = (int) $request->query('per_page', 20);

        if ($sort === 'name_asc') {
            $query->orderBy('name', 'asc');
        } elseif ($sort === 'name_desc') {
            $query->orderBy('name', 'desc');
        } else {
            $query->orderByDesc('created_at');
        }

        $users = $query->paginate($perPage);

        return response()->json($users);
    }

    /**
     * Show a single user (basic fields). Available to all authenticated users.
     */
    public function show($id)
    {
        $user = User::select('id', 'name', 'email', 'role', 'created_at', 'updated_at')
                    ->findOrFail($id);

        return response()->json($user);
    }

    /**
     * Admin-only: update a user (name, email, role, password).
     */
    public function update(Request $request, $id)
    {
        $admin = Auth::user();
        if ($admin->role !== 'admin') {
            return response()->json(['message' => 'Forbidden. Only admin can update users.'], 403);
        }

        $user = User::findOrFail($id);

        $validated = $request->validate([
            'name'      => ['sometimes', 'string', 'max:255'],
            'email'     => ['sometimes', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user->id)],
            'role'      => ['sometimes', Rule::in(['admin', 'regular'])],
            'password'  => ['sometimes', 'string', 'min:8', 'confirmed'],
        ]);

        if (isset($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        }

        $user->update($validated);

        return response()->json([
            'message' => 'User updated.',
            'data'    => $user->only('id', 'name', 'email', 'role', 'created_at', 'updated_at'),
        ]);
    }

    /**
     * Admin-only: delete a user.
     */
    public function destroy($id)
    {
        $admin = Auth::user();
        if ($admin->role !== 'admin') {
            return response()->json(['message' => 'Forbidden. Only admin can delete users.'], 403);
        }

        if ((int) $admin->id === (int) $id) {
            return response()->json(['message' => 'You cannot delete your own account while logged in.'], 422);
        }

        $user = User::findOrFail($id);

        try { $user->tokens()->delete(); } catch (\Throwable $e) {}

        $user->delete();

        return response()->json(['message' => 'User deleted.']);
    }

    /**
     * Admin-only: Export users to CSV (respects search & sort params from index).
     * Route: GET /api/users/export?search=&sort=name_asc|name_desc
     */
    public function exportCsv(Request $request)
    {
        $admin = Auth::user();
        if ($admin->role !== 'admin') {
            return response()->json(['message' => 'Forbidden. Only admin can export users.'], 403);
        }

        $query = User::query()->select('id', 'name', 'email', 'role', 'created_at', 'updated_at');

        if (Schema::hasColumn('users', 'role')) {
            $query->where('role', '!=', 'admin');
        }

        // optionally exclude the current admin from export (keeps UI consistent)
        if ($admin->id) {
            $query->where('id', '!=', $admin->id);
        }

        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $sort = $request->query('sort');
        if ($sort === 'name_desc') {
            $query->orderBy('name', 'desc');
        } else {
            $query->orderBy('name', 'asc');
        }

        $filename = 'users_' . now()->format('Y_m_d_His') . '.csv';
        $headers = [
            'Content-Type'        => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ];

        $callback = function () use ($query) {
            $handle = fopen('php://output', 'w');
            fputcsv($handle, ['ID', 'Name', 'Email', 'Role', 'Created At', 'Updated At']);

            $query->chunk(200, function ($rows) use ($handle) {
                foreach ($rows as $u) {
                    fputcsv($handle, [
                        $u->id,
                        $u->name,
                        $u->email,
                        $u->role,
                        $u->created_at,
                        $u->updated_at,
                    ]);
                }
            });

            fclose($handle);
        };

        return response()->stream($callback, 200, $headers);
    }
}

