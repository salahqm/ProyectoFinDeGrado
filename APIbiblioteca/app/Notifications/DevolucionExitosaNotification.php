<?php

// app/Notifications/DevolucionExitosaNotification.php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\MailMessage;

class DevolucionExitosaNotification extends Notification
{
    use Queueable;
    protected $libro;
    public function __construct($libro)
    {
        $this->libro = $libro;
    }

    public function via($notifiable)
    {
        return ['mail'];
    }

    public function toMail($notifiable)
    {
        return (new MailMessage)
            ->subject('Devolución confirmada')
            ->greeting("Hola {$notifiable->name},")
            ->line("Has devuelto correctamente el libro **{$this->libro->titulo}**.")
            ->line("Gracias por usar la Biblioteca Digital.");
    }
}
