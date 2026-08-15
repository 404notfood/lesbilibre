export type DayPart = 'nuit' | 'matin' | 'après-midi' | 'soir';

export interface HeroCopy {
    /** Fin de la question, après « Qui te fait vibrer ». */
    title: string;
    /** Accroche affichée sous le titre. */
    subtitle: string;
}

/**
 * Accroches du hero — trois registres par moment de la journée.
 *
 * La sensualité monte avec l'heure : allusive le matin, plus directe le soir.
 * Le placeholder `{moment}` est remplacé par « ce matin », « cet après-midi »…
 */
const COPY: Record<DayPart, HeroCopy[]> = {
    matin: [
        {
            title: 'Qui te fait *vibrer* {moment} ?',
            subtitle:
                'Le café est encore chaud. Le temps de faire une rencontre avant que la journée ne commence vraiment.',
        },
        {
            title: 'Et si ça *commençait* {moment} ?',
            subtitle:
                'Les meilleures histoires démarrent souvent par un message envoyé trop tôt.',
        },
        {
            title: 'Qui va *illuminer* ta journée ?',
            subtitle:
                'Un profil, une phrase, un sourire. Il en faut parfois si peu pour changer de rythme.',
        },
    ],
    'après-midi': [
        {
            title: 'Qui te fait *vibrer* {moment} ?',
            subtitle:
                'Du flirt léger à l’histoire qui dure. Choisis ton tempo — on te trouve la rencontre qui va avec.',
        },
        {
            title: 'Une pause qui pourrait *tout changer*',
            subtitle:
                'Entre deux obligations, il reste toujours de la place pour une belle surprise.',
        },
        {
            title: 'Qui attend ton *premier message* ?',
            subtitle:
                'Elles sont là, quelque part. La seule chose qui manque, c’est que tu te lances.',
        },
    ],
    soir: [
        {
            title: 'Qui te fait *vibrer* {moment} ?',
            subtitle:
                'La nuit s’étire, les conversations aussi. Trouve celle avec qui tu n’as pas envie de raccrocher.',
        },
        {
            title: 'À qui vas-tu *penser* en t’endormant ?',
            subtitle:
                'Un regard, une réplique bien placée. Ce soir a tout ce qu’il faut pour devenir un souvenir.',
        },
        {
            title: 'Ce soir, laisse-toi *surprendre*',
            subtitle:
                'Le désir n’a pas d’horaires. Les profils les plus intéressants se révèlent après la tombée du jour.',
        },
    ],
    nuit: [
        {
            title: 'Encore *réveillée* {moment} ?',
            subtitle:
                'Tu n’es pas la seule. Les insomnies partagées font parfois les plus belles rencontres.',
        },
        {
            title: 'Qui *veille* avec toi {moment} ?',
            subtitle:
                'À cette heure-ci, les masques tombent et les conversations deviennent vraies.',
        },
        {
            title: 'Les nuits blanches se *partagent*',
            subtitle:
                'Quelques femmes sont éveillées, comme toi. Autant en profiter.',
        },
    ],
};

/**
 * Choisit une accroche pour le moment donné.
 *
 * `seed` rend la sélection déterministe : sans lui, la phrase changerait à
 * chaque re-rendu — donc à chaque clic sur un filtre.
 */
export function pickHeroCopy(dayPart: DayPart, momentPhrase: string, seed: number): HeroCopy {
    const variants = COPY[dayPart] ?? COPY['après-midi'];
    const chosen = variants[Math.abs(seed) % variants.length];

    return {
        title: chosen.title.replace('{moment}', momentPhrase),
        subtitle: chosen.subtitle,
    };
}
