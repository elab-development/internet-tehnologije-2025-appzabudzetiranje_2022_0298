<?php

use Illuminate\Support\Facades\Route;

use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\ExpenseController;
use App\Http\Controllers\ExpenseParticipantController;
use App\Http\Controllers\SettlementController;
use App\Http\Controllers\StatisticsController;

/*
|--------------------------------------------------------------------------
| Public Auth
|--------------------------------------------------------------------------
*/
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login',    [AuthController::class, 'login']);

/*
|--------------------------------------------------------------------------
| Protected (Sanctum)
|--------------------------------------------------------------------------
*/
Route::middleware('auth:sanctum')->group(function () {

    // Auth
    Route::post('/logout', [AuthController::class, 'logout']);

    // ===== Users: index + show available to all authenticated users; update/destroy admin-only (checked in controller) =====
    Route::get('/users/export', [UserController::class, 'exportCsv']); 
    Route::apiResource('users', UserController::class)->only(['index', 'show', 'update', 'destroy']);

    // ===== Categories (index open to any authenticated; write ops require admin – checked in controller) =====
    Route::get('/categories',         [CategoryController::class, 'index']);
    Route::post('/categories',        [CategoryController::class, 'store']);
    Route::put('/categories/{id}',    [CategoryController::class, 'update']);
    Route::delete('/categories/{id}', [CategoryController::class, 'destroy']);

    // ===== Expenses (custom update/delete paths) =====
    Route::get('/expenses',                 [ExpenseController::class, 'index']);
    Route::post('/expenses',                [ExpenseController::class, 'store']);
    Route::patch('/expenses/{id}/update',   [ExpenseController::class, 'update']);
    Route::delete('/expenses/{id}/delete',  [ExpenseController::class, 'destroy']);

    // ===== Expense Participants =====
    Route::get('/expense-participants',  [ExpenseParticipantController::class, 'index']);
    Route::post('/expense-participants', [ExpenseParticipantController::class, 'store']);
    Route::delete('/expense-participants/{id}', [ExpenseParticipantController::class, 'destroy']);

    // ===== Settlements (PUT update provided) =====
    Route::get('/settlements',        [SettlementController::class, 'index']);
    Route::post('/settlements',       [SettlementController::class, 'store']);
    Route::put('/settlements/{id}',   [SettlementController::class, 'update']);

    // ===== Stats (regular users) =====
    Route::get('/stats/savings', [StatisticsController::class, 'savingsStats']);
});