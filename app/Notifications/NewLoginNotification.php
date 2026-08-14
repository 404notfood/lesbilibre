<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class NewLoginNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(private readonly string $ipAddress, private readonly string $userAgent) {}

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Nouvelle connexion à votre compte LesbiLibre')
            ->greeting('Bonjour '.$notifiable->name.',')
            ->line('Une connexion vient d’être effectuée sur votre compte.')
            ->line('Adresse IP : '.$this->ipAddress)
            ->line('Appareil : '.str($this->userAgent)->limit(120))
            ->line('Si ce n’était pas vous, changez votre mot de passe et déconnectez vos autres sessions immédiatement.');
    }
}
