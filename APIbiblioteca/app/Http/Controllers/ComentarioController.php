<?php

namespace App\Http\Controllers;

use App\Models\Comentario;
use App\Models\User;
use Illuminate\Http\Request;

class ComentarioController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
        try {
            $request->validate([
                'id_libro' => 'required',
                'id_usuario' => 'required',
                'comentario' => 'required',
                'calificacion' => 'required|integer|min:1|max:5',

            ]);
            $comentario = new Comentario();
            $comentario->id_libro = $request->id_libro;
            $comentario->id_usuario = $request->id_usuario;
            $comentario->comentario = $request->comentario;
            $comentario->calificacion = $request->calificacion;
            $comentario->fecha = now();
            if ($comentario->save()) {
                return response()->json(['mensaje' => 'Reseña creado exitosamente'], 201);
            } else {
                return response()->json(['error' => 'Error al guardar el comentario'], 400);
            }
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 400);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Comentario $comentario)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Comentario $comentario)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id, Request $request)
    {
        //
        try {
            $request->validate([
                'id_usuario' => 'required',
            ]);
            $usuario = User::find($request->id_usuario);
            if (!$usuario) {
                return response()->json(['error' => 'Usuario no encontrado'], 404);
            }
            if ($usuario->tipo != "A") {
                return response()->json(['error' => 'No tienes permiso para eliminar este comentario'], 403);
            }
            $comentario = Comentario::find($id);
            if (!$comentario) {
                return response()->json(['error' => 'Comentario no encontrado'], 404);
            }
            if ($comentario->delete()) {
                return response()->json(['mensaje' => 'Comentario eliminado exitosamente'], 200);
            } else {
                return response()->json(['error' => 'Error al eliminar el comentario'], 400);
            }
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 400);
        }
    }
}
