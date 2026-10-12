<?php

declare(strict_types=1);

use Illuminate\Support\Facades\Route;
use TrashBin\Http\Controllers\PermanentDeleteController;
use TrashBin\Http\Controllers\TrashController;

Route::get('/', [TrashController::class, 'index']);
Route::put('/settings', [TrashController::class, 'update']);
Route::post('/delete-permanently', [PermanentDeleteController::class, 'delete']);
Route::post('/{id}/restore', [TrashController::class, 'restore'])->where('id', '[a-z0-9]{12}');
Route::delete('/{id}', [TrashController::class, 'destroy'])->where('id', '[a-z0-9]{12}');
Route::delete('/', [TrashController::class, 'empty']);
