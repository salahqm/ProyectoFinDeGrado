<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Multa extends Model
{
    // relación con la tabla de usuarios
    public function usuario()
    {
        return $this->belongsTo(User::class, 'id_usuario');
    }
    // relación con la tabla de prestamos
    public function prestamo()
    {
        return $this->belongsTo(Prestamo::class, 'id_prestamo');
    }
}
