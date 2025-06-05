<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Historial_acceso extends Model
{
    // relación con la tabla de usuarios
    public function usuario()
    {
        return $this->belongsTo(User::class, 'id_usuario');
    }
}
