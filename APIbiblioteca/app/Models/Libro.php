<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Libro extends Model
{
    // relación con la tabla de comentarios
    public function comentarios()
    {
        return $this->hasMany(Comentario::class);
    }
    // relación con la tabla de prestamos
    public function prestamos()
    {
        return $this->hasMany(Prestamo::class);
    }
}
