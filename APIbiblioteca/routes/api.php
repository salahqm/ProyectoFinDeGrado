<?php

use App\Http\Controllers\ComentarioController;
use App\Http\Controllers\LibroController;
use App\Http\Controllers\MultaController;
use App\Http\Controllers\PrestamoController;
use App\Http\Controllers\UsuarioController;
use App\Http\Controllers\HistorialAccesoController;
use App\Http\Controllers\HistorialController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});


Route::post('/login', [UsuarioController::class, 'login']);
Route::post('/register', [UsuarioController::class, 'register']);
Route::post('/logout', [UsuarioController::class, 'logout'])->middleware('auth:sanctum');
Route::put('/recuperar', [UsuarioController::class, 'recuperar'])->middleware('auth:sanctum');
route::get('/libros', [LibroController::class, 'index'])->middleware('auth:sanctum');
Route::post('/libros', [LibroController::class, 'store'])->middleware('auth:sanctum');
Route::delete('/libros/{id}', [LibroController::class, 'destroy'])->middleware('auth:sanctum');
Route::put('/libros/{id}', [LibroController::class, 'update'])->middleware('auth:sanctum');
Route::get('/prestamos', [PrestamoController::class, 'index'])->middleware('auth:sanctum');
Route::get('/prestamos/{id}', [PrestamoController::class, 'prestamoSocio'])->middleware('auth:sanctum');
Route::post('/prestamos', [PrestamoController::class, 'store'])->middleware('auth:sanctum');
Route::put('/prestamos/{id}', [PrestamoController::class, 'update'])->middleware('auth:sanctum');
Route::get('/reseñas/{id}', [LibroController::class, 'verReseñas'])->middleware('auth:sanctum');
Route::post('/reseñas', [ComentarioController::class, 'store'])->middleware('auth:sanctum');
Route::delete('/reseñas/{id}', [ComentarioController::class, 'destroy'])->middleware('auth:sanctum');
Route::get('/multas/{id}', [MultaController::class, 'index'])->middleware('auth:sanctum');
Route::get('/multas', [MultaController::class, 'multas'])->middleware('auth:sanctum');
Route::put('/multas/{id}', [MultaController::class, 'update'])->middleware('auth:sanctum');
Route::get('/usuarios', [UsuarioController::class, 'index'])->middleware('auth:sanctum');
