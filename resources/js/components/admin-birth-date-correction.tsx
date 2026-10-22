import { Form } from '@inertiajs/react';

export default function AdminBirthDateCorrection({
    userId,
}: {
    userId: number;
}) {
    return (
        <details className="mb-4 rounded border p-4 text-sm">
            <summary className="cursor-pointer font-medium">
                Corriger une date de naissance à la demande de la membre
            </summary>
            <Form
                action={'/admin/users/' + userId + '/birth-date'}
                method="put"
                className="mt-3 space-y-3"
            >
                {({ errors, processing }) => (
                    <>
                        <p>
                            La date reste privée. Cette correction est
                            journalisée et ne certifie pas la majorité.
                        </p>
                        <label className="block">
                            Date exacte déclarée
                            <input
                                className="ml-3 rounded border p-2"
                                type="date"
                                name="date_of_birth"
                                required
                            />
                        </label>
                        <label className="block">
                            Motif de la correction
                            <textarea
                                className="mt-2 block w-full rounded border p-2"
                                name="reason"
                                required
                                minLength={10}
                                maxLength={1000}
                            />
                        </label>
                        {Object.entries(errors).map(([key, value]) => (
                            <p
                                className="text-destructive"
                                role="alert"
                                key={key}
                            >
                                {value}
                            </p>
                        ))}
                        <button
                            className="rounded border px-4 py-2"
                            disabled={processing}
                        >
                            Enregistrer la correction
                        </button>
                    </>
                )}
            </Form>
        </details>
    );
}
