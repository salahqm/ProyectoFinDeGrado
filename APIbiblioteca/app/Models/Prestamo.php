<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Prestamo extends Model
{
    // relación con la tabla de libros
    public function libro()
    {
        return $this->belongsTo(Libro::class, 'id_libro');
    }
    // relación con la tabla de socios
    // App\Models\Prestamo.php

    public function socio()
    {
        return $this->belongsTo(Socio::class, 'id_socio');
    }
}
