<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ComentarioResource extends JsonResource
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
            'id_libro' => $this->id_libro,
            'usuario' => $this->usuario->name,
            'comentario' => $this->comentario,
            'calificacion' => $this->calificacion,
            'fecha' => $this->fecha,
        ];
    }
}
