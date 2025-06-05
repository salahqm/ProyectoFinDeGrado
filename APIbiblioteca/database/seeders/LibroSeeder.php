<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class LibroSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('libros')->insert([
            [
                'titulo' => 'Cien Años de Soledad',
                'autor' => 'Gabriel García Márquez',
                'ejemplares' => 3,
                'img' => 'https://images.pexels.com/photos/6158665/pexels-photo-6158665.jpeg?auto=compress&cs=tinysrgb&w=800',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'titulo' => '1984',
                'autor' => 'George Orwell',
                'ejemplares' => 5,
                'img' => 'https://images.pexels.com/photos/12967509/pexels-photo-12967509.jpeg?auto=compress&cs=tinysrgb&w=800',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'titulo' => 'Don Quijote de la Mancha',
                'autor' => 'Miguel de Cervantes',
                'ejemplares' => 2,
                'img' => 'https://images.pexels.com/photos/108698/pexels-photo-108698.jpeg?auto=compress&cs=tinysrgb&w=800',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'titulo' => 'El Principito',
                'autor' => 'Antoine de Saint-Exupéry',
                'img' => 'https://images.pexels.com/photos/947172/pexels-photo-947172.jpeg?auto=compress&cs=tinysrgb&w=800',
                'ejemplares' => 4,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'titulo' => 'La Sombra del Viento',
                'autor' => 'Carlos Ruiz Zafón',
                'ejemplares' => 3,
                'img' => 'https://media.istockphoto.com/id/812148952/es/foto/abrir-libros-sobre-c%C3%A9sped-en-un-parque-verde.jpg?b=1&s=612x612&w=0&k=20&c=YDQZ3fms3BGHWn2cK0pofFbnqIV2OSt8HI3m3_4eSos=',
                'created_at' => now(),
                'updated_at' => now(),
            ]
        ]);
    }
}
