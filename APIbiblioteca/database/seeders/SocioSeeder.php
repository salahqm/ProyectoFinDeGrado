<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class SocioSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Obtener usuarios tipo 'S'
        $socios = DB::table('users')->where('tipo', 'S')->get();

        foreach ($socios as $usuario) {
            DB::table('socios')->insert([
                'id_usuario' => $usuario->id,
                'fechaSancion' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}
