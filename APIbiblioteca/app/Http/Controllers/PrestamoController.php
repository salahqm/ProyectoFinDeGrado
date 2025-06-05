<?php

namespace App\Http\Controllers;

use App\Http\Resources\PrestamoResource;
use App\Models\Libro;
use App\Models\Multa;
use App\Models\Prestamo;
use App\Models\Socio;
use App\Models\User;
use App\Notifications\DevolucionExitosaNotification;
use App\Notifications\MultaPendienteNotification;
use App\Notifications\PrestamoRealizadoNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class PrestamoController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
        try {
            $prestamos = Prestamo::all();

            return PrestamoResource::collection($prestamos);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 400);
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
        $request->validate([
            'id_socio' => 'required|integer',
            'id_libro' => 'required|integer'

        ]);
        try {
            // maximo 3 prestamos por persona
            $prestamos = Prestamo::where('id_socio', $request->id_socio)->where('estado', 'pendiente')->count();
            if ($prestamos >= 3) {
                return response()->json(['error' => 'No puedes tener mas de 3 prestamos'], 400);
            }
            // verificar si este libre ya fue prestado al socio
            $prestado = Prestamo::where('id_libro', $request->id_libro)->where('id_socio', $request->id_socio)->where('estado', 'pendiente')->first();
            if ($prestado) {
                return response()->json(['error' => 'Este libro ya fue prestado, prueba con otro'], 400);
            }
            // verificar si el libro existe
            $libro = Libro::find($request->id_libro);
            if (!$libro) {
                return response()->json(['error' => 'El libro no existe'], 400);
            }
            if ($libro->ejemplares <= 0) {
                return response()->json(['error' => 'No hay ejemplares disponibles'], 400);
            }
            // verificar si el socio existe
            $socio = Socio::find($request->id_socio);
            if (!$socio) {
                return response()->json(['error' => 'El socio no existe'], 400);
            }


            $multa = Multa::where('id_usuario', $request->id_socio)
                ->where('pagada', false) // o 0, según el tipo de dato
                ->first();

            if ($multa) {
                return response()->json(['error' => 'Tienes multas pendientes y no puedes reservar.'], 403);
            }

            DB::beginTransaction();

            // crear prestamo
            $prestamo = new Prestamo();
            $prestamo->id_socio = $request->id_socio;
            $prestamo->id_libro = $request->id_libro;
            $prestamo->fecha_prestamo = now()->format('Y-m-d');
            $prestamo->fecha_devolucion = now()->addDays(15)->format('Y-m-d');
            if ($prestamo->save()) {
                // actualizar ejemplares
                $libro->ejemplares = $libro->ejemplares - 1;
                $libro->save();
                $usuario = User::find($socio->id_usuario);
                $usuario->notify(new PrestamoRealizadoNotification($libro, $prestamo->fecha_devolucion));

                DB::commit();
                return response()->json(['mensaje' => 'Prestamo creado correctamente'], 200);
            } else {
                return response()->json(['error' => 'Error al crear el prestamo'], 400);
            }
        } catch (\Exception $e) {
            DB::rollback();
            return response()->json(['error' => $e->getMessage()], 400);
        }
    }

    /**
     * Display the specified resource.
     */
    public function prestamoSocio($id)
    {
        try {
            // verificar si el socio existe
            $socio = Socio::find($id);
            if (!$socio) {
                return response()->json(['error' => 'El socio no existe'], 400);
            }
            $prestamos = Prestamo::where('id_socio', $id)
                ->orderByRaw("CASE WHEN estado = 'pendiente' THEN 0 ELSE 1 END")
                ->orderBy('estado')
                ->get();
            if ($prestamos->isEmpty()) {
                return response()->json(['error' => 'No hay prestamos para este socio'], 400);
            }
            return PrestamoResource::collection($prestamos);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 400);
        }
    }

    /**
     * Update the specified resource in storage.
     */


    public function update(Request $request, $id)
    {
        try {
            DB::beginTransaction();

            $prestamo = Prestamo::find($id);
            if (!$prestamo) {
                return response()->json(['error' => 'El prestamo no existe'], 400);
            }

            $prestamo->fecha_real_devolucion = now()->format('Y-m-d');
            $prestamo->estado = 'confirmado';

            if ($prestamo->save()) {
                $libro = Libro::find($prestamo->id_libro);
                $libro->ejemplares += 1;
                $libro->save();

                $socio = Socio::find($prestamo->id_socio);
                $user = $socio->usuario; // relación socio → user

                if ($prestamo->fecha_real_devolucion > $prestamo->fecha_devolucion) {
                    $dias_retraso = Carbon::parse($prestamo->fecha_devolucion)
                        ->diffInDays($prestamo->fecha_real_devolucion);

                    $multa = new Multa();
                    $multa->id_usuario = $socio->id_usuario;
                    $multa->id_prestamo = $prestamo->id;
                    $multa->monto = $dias_retraso * 5;
                    $multa->pagada = false;

                    if ($multa->save()) {
                        DB::commit();

                        if ($user) {
                            $user->notify(new MultaPendienteNotification($multa));
                        }

                        return response()->json([
                            'mensaje' => 'Prestamo confirmado con multa',
                            'multa' => $multa,
                        ], 200);
                    } else {
                        DB::rollback();
                        return response()->json(['error' => 'Error al guardar la multa'], 400);
                    }
                } else {
                    // No hay multa
                    DB::commit();
                    if ($user) {
                        $user->notify(new DevolucionExitosaNotification($libro));
                    }
                    return response()->json(['mensaje' => 'Prestamo confirmado sin multa'], 200);
                }
            } else {
                return response()->json(['error' => 'Error al confirmar el prestamo'], 400);
            }
        } catch (\Exception $e) {
            DB::rollback();
            return response()->json(['error' => $e->getMessage()], 400);
        }
    }
}
