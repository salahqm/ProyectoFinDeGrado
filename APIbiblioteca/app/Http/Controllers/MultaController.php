<?php

namespace App\Http\Controllers;

use App\Http\Resources\MultasResource;
use App\Models\Multa;
use App\Models\User;
use App\Notifications\MultaPagadaNotification;
use Illuminate\Http\Request;

class MultaController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index($id)
    {
        //
        try {
            $multas = Multa::where('id_usuario', $id)->get();
            return MultasResource::collection($multas);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 400);
        }
    }
    /**
     * Display a listing of the resource.
     */
    public function multas(Request $request)
    {
        try {
            $multas = Multa::all();
            return MultasResource::collection($multas);
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
    }

    /**
     * Display the specified resource.
     */
    public function show(Multa $multa)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */

    public function update(Request $request, $id)
    {
        try {
            $multa = Multa::find($id);
            if (!$multa) {
                return response()->json(['error' => 'Multa no encontrada'], 404);
            }

            if ($multa->pagada == 0) {
                $multa->pagada = 1;
                $multa->fecha_pago = now();
                if ($multa->save()) {
                    // enviar notificación
                    $usuario = User::find($multa->id_usuario);
                    if ($usuario) {
                        $usuario->notify(new MultaPagadaNotification($multa));
                    }

                    return response()->json(['message' => 'Multa pagada correctamente'], 200);
                } else {
                    return response()->json(['error' => 'Error al pagar la multa'], 500);
                }
            } else {
                return response()->json(['error' => 'La multa ya ha sido pagada'], 400);
            }
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 400);
        }
    }


    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Multa $multa)
    {
        //
    }
}
