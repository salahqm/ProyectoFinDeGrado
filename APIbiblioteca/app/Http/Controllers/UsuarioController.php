<?php

namespace App\Http\Controllers;

use App\Http\Resources\HistorilResource;
use App\Models\Historial_acceso;
use App\Models\Socio;
use App\Models\User;
use App\Notifications\BienvenidaUsuarioNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class UsuarioController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        try {
            $historial = Historial_acceso::all();
            return HistorilResource::collection($historial);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 400);
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function login(Request $request)
    {
        try {
            $request->validate([
                'email' => 'required|email',
                'password' => 'required',
            ]);
            // obtener credenciales
            $credenciales = ['email' => $request->email, 'password' => $request->password];
            if (Auth::attempt($credenciales)) {
                // actulizar historia de acceso
                $historia = Historial_acceso::where('id_usuario', Auth::user()->id)->first();
                if ($historia) {
                    $historia->fecha = now();
                    $historia->save();
                } else {
                    $historia = new Historial_acceso();
                    $historia->id_usuario = Auth::user()->id;
                    $historia->fecha = now();
                    $historia->save();
                }
                // obtener usuario
                $usuario = user::find(Auth::user()->id);
                // obtener socio
                $socio = Socio::where('id_usuario', $usuario->id)->first();
                if ($socio) {
                    //generar token de autenticacion , que lo va a devolver esta peticion
                    $token = $usuario->createToken('auth_token')->plainTextToken;
                    return response()->json([
                        ' mensaje' => "Login exitoso",
                        'token' => $token,
                        'usuario' => $usuario,
                        "socio" => $socio,
                    ]);
                }
                if ($usuario->tipo == 'A') {
                    //generar token de autenticacion , que lo va a devolver esta peticion
                    $token = $usuario->createToken('auth_token')->plainTextToken;
                    return response()->json([
                        ' mensaje' => "Login exitoso",
                        'token' => $token,
                        'usuario' => $usuario,
                    ]);
                }
            } else {
                return response()->json('Error: Credenciales incorrectas', 401);
            }
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 400);
        }
    }


    public function register(Request $request)
    {
        try {
            $request->validate([
                'name' => 'required|string|max:255',
                'email' => 'required|string|email|max:255|unique:users',
                'password' => 'required|string|min:6|confirmed',
            ]);
            $tipo = 'S';
            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'tipo' => $tipo,
            ]);
            if ($user) {
                $socio = new Socio();
                $socio->id_usuario = $user->id;
                $socio->fechaSancion = null;
                if ($socio->save()) {
                    // Enviar notificación de bienvenida al usuario
                    $user->notify(new BienvenidaUsuarioNotification());

                    return response()->json([
                        'message' => 'Usuario registrado correctamente',
                        'user' => $user,
                        'socio' => $socio,
                    ], 201);
                } else {
                    return response()->json(['error' => 'Error al crear el socio'], 500);
                }
            } else {
                return response()->json(['error' => 'Error al crear el usuario'], 500);
            }
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 400);
        }
    }

    function logout(Request $request)
    {
        try {
            //borrar tokens del usuario
            $request->user()->tokens()->delete();
            return response()->json('sesion cerrada', 200);
        } catch (\Throwable $th) {
            return response()->json('Error:' . $th->getMessage(), 500);
        }
    }
    public function recuperar(Request $request)
    {
        try {
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 400);
        }
    }


    /**
     * Display the specified resource.
     */
    public function show(User $usuario)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, User $usuario)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(User $usuario)
    {
        //
    }
}
