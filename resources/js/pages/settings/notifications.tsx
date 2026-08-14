import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';

import HeadingSmall from '@/components/heading-small';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { type BreadcrumbItem } from '@/types';

interface FrequencyOption {
    value: string;
    label: string;
}

interface NotificationTypeOption {
    value: string;
    label: string;
    description: string;
    frequency: string;
    available_frequencies: FrequencyOption[];
}

interface Props {
    notificationTypes: NotificationTypeOption[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Notifications',
        href: '/settings/notifications',
    },
];

export default function Notifications({ notificationTypes }: Props) {
    const { props } = usePage<{ errors: Record<string, string> }>();
    const [saving, setSaving] = useState(false);
    const [preferences, setPreferences] = useState<Record<string, string>>(() =>
        Object.fromEntries(
            notificationTypes.map((type) => [type.value, type.frequency]),
        ),
    );

    const handleChange = (type: string, frequency: string) => {
        setPreferences((prev) => ({ ...prev, [type]: frequency }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        router.put(
            '/settings/notifications',
            { preferences },
            {
                preserveScroll: true,
                onStart: () => setSaving(true),
                onFinish: () => setSaving(false),
            },
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Notifications" />

            <SettingsLayout>
                <div className="space-y-6">
                    <HeadingSmall
                        title="Notifications par e-mail"
                        description="Choisissez ce que vous souhaitez recevoir, et à quelle fréquence."
                    />

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {notificationTypes.map((type) => (
                            <div
                                key={type.value}
                                className="flex flex-col gap-3 border-b pb-5 last:border-b-0 sm:flex-row sm:items-center sm:justify-between"
                            >
                                <div className="space-y-1">
                                    <Label htmlFor={`frequency-${type.value}`}>
                                        {type.label}
                                    </Label>
                                    <p className="text-sm text-muted-foreground">
                                        {type.description}
                                    </p>
                                </div>

                                <Select
                                    value={preferences[type.value] ?? ''}
                                    onValueChange={(value) => handleChange(type.value, value)}
                                >
                                    <SelectTrigger
                                        id={`frequency-${type.value}`}
                                        className="w-full sm:w-56"
                                    >
                                        <SelectValue placeholder="Choisir une fréquence" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {type.available_frequencies.map((frequency) => (
                                            <SelectItem
                                                key={frequency.value}
                                                value={frequency.value}
                                            >
                                                {frequency.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        ))}

                        {props.errors?.preferences && (
                            <p className="text-sm text-destructive">
                                {props.errors.preferences}
                            </p>
                        )}

                        <div className="flex items-center gap-3">
                            <Button type="submit" disabled={saving}>
                                {saving ? <Spinner className="h-4 w-4" /> : 'Enregistrer'}
                            </Button>
                        </div>
                    </form>
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
