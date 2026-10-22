export const meetingIntentions: Record<string, string> = {
    relationship: 'Relation sérieuse',
    dating: 'Rendez-vous amoureux',
    friendship: 'Amitié',
    casual: 'Rencontre sexuelle sans engagement',
    ongoing: 'Relation suivie sans couple',
    open: 'Découvrir à mon rythme',
};
export const meetingBoundaries: Record<string, string> = {
    friendship_only: 'Amitié uniquement',
    no_sexual_requests: 'Pas de sollicitations sexuelles',
    no_couples: 'Pas de rencontres avec des couples',
};

export function CommunityCharter() {
    return (
        <div className="space-y-3 rounded-xl border p-4 text-sm">
            <p>
                Un espace pour les femmes cis et trans et les personnes non
                binaires qui se reconnaissent dans cette communauté, lesbiennes,
                bi, queer ou en questionnement, à partir de 18 ans.
            </p>
            <p>
                Un compte représente une seule personne, même en couple. Aucun
                compte partagé, aucune recherche de partenaire pour un homme.
                Chacune choisit ses envies et ses limites ; être curieuse ne
                vaut jamais consentement.
            </p>
            <label className="flex items-start gap-3">
                <input
                    className="mt-1"
                    type="checkbox"
                    name="community_charter"
                    value="1"
                    required
                />
                J’accepte cette charte et les conditions d’utilisation. Je
                m’engage à présenter mon propre profil et à respecter les refus.
            </label>
            <label className="flex items-start gap-3">
                <input
                    className="mt-1"
                    type="checkbox"
                    name="data_processing_consent"
                    value="1"
                    required
                />
                Je consens au traitement et à l’affichage auprès des membres de
                mes choix de rencontre et des informations d’orientation ou de
                vie sexuelle que je renseigne volontairement. Je peux modifier
                mes choix et retirer ce consentement dans Confidentialité.
            </label>
            <p>
                <a className="underline" href="/terms">
                    Conditions d’utilisation
                </a>{' '}
                ·{' '}
                <a className="underline" href="/privacy">
                    Confidentialité
                </a>
            </p>
        </div>
    );
}

export function IntentionCheckboxes({
    value,
    onChange,
}: {
    value?: string[];
    onChange?: (value: string[]) => void;
}) {
    return (
        <fieldset className="space-y-2">
            <legend className="mb-2 font-medium">
                Mes envies de rencontre — plusieurs choix possibles
            </legend>
            {Object.entries(meetingIntentions).map(([key, label]) => (
                <label key={key} className="flex items-center gap-3 text-sm">
                    <input
                        type="checkbox"
                        name="meeting_intentions[]"
                        value={key}
                        checked={value?.includes(key)}
                        onChange={
                            onChange
                                ? (event) =>
                                      onChange(
                                          event.target.checked
                                              ? [...(value ?? []), key]
                                              : (value ?? []).filter(
                                                    (item) => item !== key,
                                                ),
                                      )
                                : undefined
                        }
                    />
                    {label}
                </label>
            ))}
            <p className="text-xs text-muted-foreground">
                Vos envies peuvent évoluer. Aucun choix ne constitue un
                consentement à un message ou à une image intime.
            </p>
        </fieldset>
    );
}
