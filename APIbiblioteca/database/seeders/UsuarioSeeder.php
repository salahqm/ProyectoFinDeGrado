<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class UsuarioSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('users')->insert([ 
            [
                'name' => 'Administrador Principal',
                'email' => 'admin@biblioteca.com',
                'password' => Hash::make('admin123'),
                'tipo' => 'A',
                'remember_token' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Juan Pérez',
                'email' => 'juan@correo.com',
                'password' => Hash::make('socio123'),
                'tipo' => 'S',
                'remember_token' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Ana García',
                'email' => 'ana@correo.com',
                'password' => Hash::make('socio123'),
                'tipo' => 'S',
                'remember_token' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Carlos Ruiz',
                'email' => 'carlos@correo.com',
                'password' => Hash::make('socio123'),
                'tipo' => 'S',
                'remember_token' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}
