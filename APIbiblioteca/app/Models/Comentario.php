<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Comentario extends Model
{
    //
    // relación con la tabla de libros
    public function libro()
    {
        return $this->belongsTo(Libro::class, 'id_libro');
    }
    // relación con la tabla de usuarios
    public function usuario()
    {
        return $this->belongsTo(User::class, 'id_usuario');
    }
}
