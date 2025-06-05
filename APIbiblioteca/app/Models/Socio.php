<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Notifications\Notifiable;

class Socio extends Model

{
    use Notifiable;
    //relación con la tabla de prestamos
    public function prestamos()
    {
        return $this->hasMany(Prestamo::class, 'id_socio');
    }
    //relación con la tabla de usuarios
    public function usuario()
    {
        return $this->belongsTo(User::class, 'id_usuario');
    }
}
