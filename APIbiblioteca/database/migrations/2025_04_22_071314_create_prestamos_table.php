<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('prestamos', function (Blueprint $table) {
            $table->id(); // id_prestamo
            // Primero se declaran las columnas
            $table->foreignId('id_socio')->constrained('socios')->onDelete('cascade')->onUpdate('cascade');
            $table->foreignId('id_libro')->constrained('libros')->onDelete('cascade')->onUpdate('cascade');
            $table->date('fecha_prestamo')->nullable();
            $table->date('fecha_devolucion')->nullable();
            $table->date('fecha_real_devolucion')->nullable();
            $table->enum('estado', ['pendiente', 'confirmado', 'cancelado'])->default('pendiente');
            $table->timestamps();
        });
    }


    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('prestamos');
    }
};
