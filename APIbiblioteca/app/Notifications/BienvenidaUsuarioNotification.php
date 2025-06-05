<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\MailMessage;

class BienvenidaUsuarioNotification extends Notification
{
    use Queueable;

    public function via($notifiable)
    {
        return ['mail'];
    }

    public function toMail($notifiable)
    {
        return (new MailMessage)
            ->subject('Bienvenido a la Biblioteca Digital')
            ->greeting("Hola {$notifiable->name},")
            ->line('Gracias por registrarte en nuestra Biblioteca Digital.')
            ->line('Ahora puedes disfrutar de todos nuestros servicios.')
            ->salutation('¡Bienvenido!')
            ->line('Si tienes alguna pregunta, no dudes en contactarnos.');
    }
}
