<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PrestamoResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'socio' => $this->id_socio,
            'nombre_socio' => optional($this->socio->usuario)->name,
            'id_libro' => $this->id_libro,
            'libro' => optional($this->libro)->titulo,
            'img' => optional($this->libro)->img,
            'fecha_prestamo' => $this->fecha_prestamo,
            'fecha_devolucion' => $this->fecha_devolucion,
            'fecha_real_devolucion' => $this->fecha_real_devolucion,
            'estado' => $this->estado,
        ];
    }
}
