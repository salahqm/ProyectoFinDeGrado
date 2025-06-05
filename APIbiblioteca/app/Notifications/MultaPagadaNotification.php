<?php

namespace App\Notifications;

use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\MailMessage;

class MultaPagadaNotification extends Notification
{
    protected $multa;

    public function __construct($multa)
    {
        $this->multa = $multa;
    }

    public function via($notifiable)
    {
        return ['mail'];
    }

    public function toMail($notifiable)
    {
        return (new MailMessage)
            ->subject('Multa Pagada Correctamente')
            ->greeting("Hola {$notifiable->name},")
            ->line("Tu multa de {$this->multa->monto}€ ha sido pagada correctamente.")
            ->line("Gracias por ponerte al día con la Biblioteca Digital.");
    }
}
