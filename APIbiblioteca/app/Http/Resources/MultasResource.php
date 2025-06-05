<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MultasResource extends JsonResource
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
            'usuario' => $this->usuario->name,
            'libro' => $this->prestamo->libro->titulo,
            'fecha' => $this->fecha_pago,
            'prestamo' => $this->prestamo->id,
            'monto' => $this->monto,
            'estado' => $this->pagada,
        ];
    }
}
