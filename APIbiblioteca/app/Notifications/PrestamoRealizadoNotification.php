<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\MailMessage;

class PrestamoRealizadoNotification extends Notification
{
    use Queueable;

    protected $libro;
    protected $fechaDevolucion;

    public function __construct($libro, $fechaDevolucion)
    {
        $this->libro = $libro;
        $this->fechaDevolucion = $fechaDevolucion;
    }

    public function via($notifiable)
    {
        return ['mail'];
    }

    public function toMail($notifiable)
    {
        return (new MailMessage)
            ->subject('Confirmación de Préstamo')
            ->greeting("Hola {$notifiable->nombre},")
            ->line("Has reservado el libro: **{$this->libro->titulo}**.")
            ->line("Fecha límite de devolución: **{$this->fechaDevolucion}**.")
            ->line("Por favor, asegúrate de devolverlo a tiempo.")
            ->salutation('Gracias por usar la Biblioteca Digital');
    }
}
