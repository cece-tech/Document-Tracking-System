<?php
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DocumentController;
use App\Http\Controllers\Api\DepartmentController;
use App\Http\Controllers\Api\UserController;

// Public routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login',    [AuthController::class, 'login']);

// Departments (public so register form can load them)
Route::get('/departments', [DepartmentController::class, 'index']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {

    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me',      [AuthController::class, 'me']);

    // Documents
    Route::get('/documents',              [DocumentController::class, 'index']);
    Route::post('/documents',             [DocumentController::class, 'store']);
    Route::get('/documents/{document}',   [DocumentController::class, 'show']);
    Route::put('/documents/{document}/review',  [DocumentController::class, 'review']);
    Route::delete('/documents/{document}', [DocumentController::class, 'destroy']);
    Route::get('/documents/{document}/download', [DocumentController::class, 'download']); 

    // Admin: user management
    Route::get('/users',          [UserController::class, 'index']);
    Route::put('/users/{user}',   [UserController::class, 'update']);
});
