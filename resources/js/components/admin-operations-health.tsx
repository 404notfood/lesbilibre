export interface OperationsHealth {
    tasks: {
        name: string;
        label: string;
        state: string;
        last_success_at: string | null;
        last_failure_at: string | null;
    }[];
    backlogs: Record<string, number>;
    moderation_warning_hours: number;
    video_warning_minutes: number;
    needs_attention: boolean;
}
const states: Record<string, string> = {
    unknown: 'Non observé',
    success: 'À jour',
    started: 'En cours',
    late: 'En retard',
    failed: 'Échec',
};
const queues: Record<string, string> = {
    photos: 'Photos en attente',
    verifications: 'Selfies en attente',
    reports: 'Signalements en attente',
    videos_pending: 'Vidéos en traitement prolongé',
    videos_failed: 'Vidéos en échec',
    purges_due: 'Purges échues depuis plus de 24 h',
    failed_jobs: 'Tâches en échec',
    account_erasures_pending: 'Comptes fermés à examiner',
    messages: 'Messages en attente prolongée',
    media_pending: 'Pièces jointes en attente prolongée',
    deliveries_pending: 'Messages validés à transmettre',
};
export default function AdminOperationsHealth({
    health,
}: {
    health: OperationsHealth;
}) {
    return (
        <section
            className="rounded-2xl border border-border bg-card p-5"
            aria-labelledby="operations-title"
        >
            <h2 id="operations-title" className="text-lg font-semibold">
                Suivi de l’exploitation
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
                {health.needs_attention
                    ? 'Des éléments demandent une vérification.'
                    : 'Les indicateurs observés sont à jour.'}{' '}
                Un statut « non observé » ne prouve pas une panne. Les compteurs
                signalent une attente supérieure à{' '}
                {health.moderation_warning_hours} h pour la modération et{' '}
                {health.video_warning_minutes} min pour les vidéos.
            </p>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {health.tasks.map((task) => (
                    <li
                        key={task.name}
                        className="rounded-xl border border-border p-3 text-sm"
                    >
                        <div className="flex flex-wrap justify-between gap-2">
                            <strong>{task.label}</strong>
                            <span
                                className={
                                    ['failed', 'late'].includes(task.state)
                                        ? 'text-destructive'
                                        : 'text-muted-foreground'
                                }
                            >
                                {states[task.state] ?? task.state}
                            </span>
                        </div>
                        <p className="mt-2 text-muted-foreground">
                            Dernier succès :{' '}
                            {task.last_success_at
                                ? new Date(task.last_success_at).toLocaleString(
                                      'fr-FR',
                                  )
                                : 'non observé'}
                        </p>
                        {task.last_failure_at && (
                            <p className="mt-1 text-muted-foreground">
                                Dernier échec :{' '}
                                {new Date(task.last_failure_at).toLocaleString(
                                    'fr-FR',
                                )}
                            </p>
                        )}
                    </li>
                ))}
            </ul>
            <dl className="mt-4 grid gap-2 sm:grid-cols-2">
                {Object.entries(health.backlogs).map(([key, count]) => (
                    <div
                        key={key}
                        className="flex justify-between gap-3 text-sm"
                    >
                        <dt>{queues[key] ?? key}</dt>
                        <dd className="font-semibold">{count}</dd>
                    </div>
                ))}
            </dl>
        </section>
    );
}
