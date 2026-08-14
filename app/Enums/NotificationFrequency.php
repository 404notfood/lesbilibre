<?php

namespace App\Enums;

enum NotificationFrequency: string
{
    case Immediate = 'immediate';
    case Daily = 'daily';
    case Weekly = 'weekly';
    case Never = 'never';

    /**
     * Human readable label shown in the settings screen.
     */
    public function label(): string
    {
        return match ($this) {
            self::Immediate => 'À chaque fois',
            self::Daily => 'Résumé quotidien',
            self::Weekly => 'Résumé hebdomadaire',
            self::Never => 'Jamais',
        };
    }
}
