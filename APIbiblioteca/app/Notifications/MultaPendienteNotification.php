<?php



namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\MailMessage;

class MultaPendienteNotification extends Notification
{
    use Queueable;

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
            ->subject('Multa Pendiente - Biblioteca Digital')
            ->greeting("Hola {$notifiable->name},")
            ->line("Has devuelto un libro con retraso.")
            ->line("Se ha generado una multa de {$this->multa->monto} unidades monetarias.")
            ->line('Por favor, paga la multa para poder seguir usando nuestros servicios.')
            ->salutation('Gracias por usar la Biblioteca Digital');
    }
}
