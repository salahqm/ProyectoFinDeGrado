<?php

namespace App\Http\Controllers;

use App\Http\Resources\ComentarioResource;
use App\Models\Comentario;
use App\Models\Libro;
use App\Models\Prestamo;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;


class LibroController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
        try {
            $libros = Libro::all();
            return response()->json($libros);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 400);
        }
    }
    /**
     * store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
        try {
            $request->validate([
                'titulo' => 'required',
                'autor' => 'required',
                'img' => 'required',
                'ejemplares' => 'required',
            ]);
            if (Auth::user()->tipo !== 'A') {
                return response()->json(['error' => 'No tienes permisos para realizar esta acción'], 403);
            }

            // verificar si el libro ya existe
            $libroExistente = Libro::where('titulo', $request->titulo)
                ->where('autor', $request->autor)
                ->first();
            if ($libroExistente) {
                return response()->json(['error' => 'El libro ya existe'], 400);
            }
            // verificar si que solo se pueden crear libros con al menos un ejemplar
            if ($request->ejemplares < 1) {
                return response()->json(['error' => 'Debe haber al menos un ejemplar'], 400);
            }
            // verificar que solo lo usuarios Administradores pueden crear libros

            // crear el libro
            $libro = new Libro();
            $libro->titulo = $request->titulo;
            $libro->autor = $request->autor;
            $libro->img = $request->img;
            $libro->ejemplares = $request->ejemplares;
            if ($libro->save()) {
                return response()->json($libro);
            } else {
                return response()->json(['error' => 'Error al guardar libro'], 400);
            }
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 400);
        }
    }
    function create()
    {
        //
        try {
            $libros = Libro::all();
            return response()->json($libros);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 400);
        }
    }
    /**
     * Store a newly created resource in storage.
     */
    public function verReseñas($id)
    {
        //
        try {
            $reseñas = Comentario::where('id_libro', $id)->orderBy('fecha', 'desc')->get();
            return ComentarioResource::collection($reseñas);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 400);
        }
    }


    /**
     * Display the specified resource.
     */
    public function show(Libro $libro)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $libro)
    {
        //
        try {
            $request->validate([
                'ejemplares' => 'required',
            ]);
            if (Auth::user()->tipo !== 'A') {
                return response()->json(['error' => 'No tienes permisos para realizar esta acción'], 403);
            }
            // verificar si el libro existe
            $libro = Libro::find($libro);
            if (!$libro) {
                return response()->json(['error' => 'Libro no encontrado'], 404);
            }
            // verificar que el numero de ejemplares sea mayor a 0
            if ($request->ejemplares < 1) {
                return response()->json(['error' => 'Debe haber al menos un ejemplar'], 400);
            }
            // actualizar el libro
            $libro->ejemplares += $request->ejemplares;
            if ($libro->save()) {
                return response()->json(['message' => 'Libro actualizado correctamente', 'libro' => $libro]);
            } else {
                return response()->json(['error' => 'Error al actualizar libro'], 400);
            }
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 400);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Libro $libro, $id)
    {
        //
        try {
            if (Auth::user()->tipo !== 'A') {
                return response()->json(['error' => 'No tienes permisos para realizar esta acción'], 403);
            }
            // verificar si el libro tiene prestamos
            $prestamos = Prestamo::where('id_libro', $id)->where('estado', '!=', 'pendiente')->count();
            if ($prestamos > 0) {
                return response()->json(['error' => 'No puedes eliminar un libro con prestamos pendientes'], 400);
            }
            $libro = Libro::find($id);
            if ($libro) {
                // eliminar las reseñas asociadas al libro
                $comentarios = Comentario::where('id_libro', $id);
                if ($comentarios) {
                    $comentarios->delete();
                    $libro->delete();
                    return response()->json(['message' => 'Libro eliminado correctamente']);
                }
                if ($libro->delete()) {
                    return response()->json(['message' => 'Libro eliminado correctamente']);
                } else {
                    return response()->json(['error' => 'Error al eliminar libro'], 400);
                }
            } else {
                return response()->json(['error' => 'Error al eliminar libro'], 400);
            }
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 400);
        } catch (\Throwable $th) {
        }
    }
}
