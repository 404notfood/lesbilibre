import MemberCard from '@/components/discovery/MemberCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MultiSelect } from '@/components/ui/multi-select';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import DatingLayout from '@/layouts/dating-layout';
import { Head, router } from '@inertiajs/react';
import {
    Filter,
    Search as SearchIcon,
    SlidersHorizontal,
    X,
} from 'lucide-react';
import { useState } from 'react';

interface Photo {
    id: number;
    url: string;
    thumbnail_url: string;
}

interface Profile {
    city?: string;
    age?: number;
    bio?: string;
    meeting_intentions?: string[];
}

interface UserData {
    id: number;
    name: string;
    pseudo?: string;
    is_verified: boolean;
    profile?: Profile;
    photos: Photo[];
    distance?: number;
}

interface Filters {
    min_age?: number;
    max_age?: number;
    city?: string;
    distance?: number;
    sexual_orientation?: string[];
    relationship_status?: string[];
    looking_for?: string[];
    body_type?: string[];
    hair_color?: string[];
    eye_color?: string[];
    ethnicity?: string[];
    education?: string[];
    smoking?: string[];
    drinking?: string[];
    children?: string[];
    wants_children?: string[];
    min_height?: number;
    max_height?: number;
    has_photo?: boolean;
    is_verified?: boolean;
    naughty_mode?: boolean;
    has_private_gallery?: boolean;
    sort_by?: string;
}

/** Filters are plain scalars and string arrays, so they map directly to a query string. */
function toQuery(
    filters: Filters,
): Record<string, string | number | boolean | string[]> {
    return Object.fromEntries(
        Object.entries(filters).filter(([, value]) => value !== undefined),
    );
}

interface ProfileOptions {
    sexual_orientation: Record<string, string>;
    relationship_status: Record<string, string>;
    looking_for: Record<string, string>;
    body_type: Record<string, string>;
    hair_color: Record<string, string>;
    eye_color: Record<string, string>;
    ethnicity: Record<string, string>;
    education: Record<string, string>;
    smoking: Record<string, string>;
    drinking: Record<string, string>;
    children: Record<string, string>;
    wants_children: Record<string, string>;
}

export default function Index({
    results,
    filters,
    profileOptions,
    canFilterNaughty = false,
}: {
    results: { data: UserData[]; total: number };
    filters: Filters;
    profileOptions: ProfileOptions;
    canFilterNaughty?: boolean;
}) {
    const [showFilters, setShowFilters] = useState(true);
    const [localFilters, setLocalFilters] = useState<Filters>(filters);

    const handleSearch = (e?: React.FormEvent) => {
        e?.preventDefault();
        router.get('/search', toQuery(localFilters), { preserveState: true });
    };

    const handleFilterChange = <K extends keyof Filters>(
        key: K,
        value: Filters[K],
    ) => {
        setLocalFilters({ ...localFilters, [key]: value });
    };

    const handleResetFilters = () => {
        setLocalFilters({});
        router.get('/search');
    };

    const handleLike = (userId: number) => {
        router.post(`/likes/${userId}`);
    };

    const activeFiltersCount = Object.values(localFilters).filter(
        (value) => value !== undefined && value !== '' && value !== null,
    ).length;

    return (
        <DatingLayout title="Recherche Avancée" showOnlineUsers={false}>
            <Head title="Recherche Avancée" />

            <div className="space-y-6 p-6">
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="flex items-center gap-2 text-3xl font-bold">
                                <SearchIcon className="h-8 w-8 text-pink-500" />
                                Recherche Avancée
                            </h1>
                            <p className="mt-2 text-muted-foreground">
                                {results.total} profil
                                {results.total > 1 ? 's' : ''} trouvé
                                {results.total > 1 ? 's' : ''}
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <Select
                                value={localFilters.sort_by || 'distance'}
                                onValueChange={(value) => {
                                    setLocalFilters({
                                        ...localFilters,
                                        sort_by: value,
                                    });
                                    router.get(
                                        '/search',
                                        toQuery({
                                            ...localFilters,
                                            sort_by: value,
                                        }),
                                    );
                                }}
                            >
                                <SelectTrigger className="w-48">
                                    <SelectValue placeholder="Trier par" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="distance">
                                        Plus proche
                                    </SelectItem>
                                    <SelectItem value="newest">
                                        Plus récent
                                    </SelectItem>
                                    <SelectItem value="activity">
                                        Dernière activité
                                    </SelectItem>
                                    <SelectItem value="popular">
                                        Popularité
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                            <Button
                                variant="outline"
                                onClick={() => setShowFilters(!showFilters)}
                            >
                                <Filter className="mr-2 h-4 w-4" />
                                Filtres{' '}
                                {activeFiltersCount > 0 &&
                                    `(${activeFiltersCount})`}
                            </Button>
                        </div>
                    </div>
                </div>

                {showFilters && (
                    <Card className="mb-8">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2">
                                    <SlidersHorizontal className="h-5 w-5" />
                                    Filtres de recherche
                                </CardTitle>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleResetFilters}
                                >
                                    <X className="mr-1 h-4 w-4" />
                                    Réinitialiser
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSearch} className="space-y-6">
                                {/* Critères de base */}
                                <div>
                                    <h3 className="mb-3 text-sm font-semibold">
                                        Critères de base
                                    </h3>
                                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                                        <div>
                                            <Label>Âge minimum</Label>
                                            <Input
                                                type="number"
                                                value={
                                                    localFilters.min_age || ''
                                                }
                                                onChange={(e) =>
                                                    handleFilterChange(
                                                        'min_age',
                                                        parseInt(
                                                            e.target.value,
                                                        ) || undefined,
                                                    )
                                                }
                                                placeholder="18"
                                                min="18"
                                                max="99"
                                            />
                                        </div>

                                        <div>
                                            <Label>Âge maximum</Label>
                                            <Input
                                                type="number"
                                                value={
                                                    localFilters.max_age || ''
                                                }
                                                onChange={(e) =>
                                                    handleFilterChange(
                                                        'max_age',
                                                        parseInt(
                                                            e.target.value,
                                                        ) || undefined,
                                                    )
                                                }
                                                placeholder="99"
                                                min="18"
                                                max="99"
                                            />
                                        </div>

                                        <div>
                                            <Label>Distance max (km)</Label>
                                            <Input
                                                type="number"
                                                value={
                                                    localFilters.distance || ''
                                                }
                                                onChange={(e) =>
                                                    handleFilterChange(
                                                        'distance',
                                                        parseInt(
                                                            e.target.value,
                                                        ) || undefined,
                                                    )
                                                }
                                                placeholder="50"
                                                min="1"
                                            />
                                        </div>

                                        <div>
                                            <Label>Ville</Label>
                                            <Input
                                                type="text"
                                                value={localFilters.city || ''}
                                                onChange={(e) =>
                                                    handleFilterChange(
                                                        'city',
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="Paris, Lyon..."
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Orientation & Relation */}
                                <div>
                                    <h3 className="mb-3 text-sm font-semibold">
                                        Orientation & Statut
                                    </h3>
                                    <div className="grid gap-4 md:grid-cols-3">
                                        <div>
                                            <Label>Orientation sexuelle</Label>
                                            <MultiSelect
                                                options={
                                                    profileOptions.sexual_orientation
                                                }
                                                value={
                                                    localFilters.sexual_orientation ||
                                                    []
                                                }
                                                onChange={(value) =>
                                                    handleFilterChange(
                                                        'sexual_orientation',
                                                        value.length > 0
                                                            ? value
                                                            : undefined,
                                                    )
                                                }
                                                placeholder="Toutes"
                                            />
                                        </div>

                                        <div>
                                            <Label>Statut relationnel</Label>
                                            <MultiSelect
                                                options={
                                                    profileOptions.relationship_status
                                                }
                                                value={
                                                    localFilters.relationship_status ||
                                                    []
                                                }
                                                onChange={(value) =>
                                                    handleFilterChange(
                                                        'relationship_status',
                                                        value.length > 0
                                                            ? value
                                                            : undefined,
                                                    )
                                                }
                                                placeholder="Tous"
                                            />
                                        </div>

                                        <div>
                                            <Label>Recherche</Label>
                                            <MultiSelect
                                                options={
                                                    profileOptions.looking_for
                                                }
                                                value={
                                                    localFilters.looking_for ||
                                                    []
                                                }
                                                onChange={(value) =>
                                                    handleFilterChange(
                                                        'looking_for',
                                                        value.length > 0
                                                            ? value
                                                            : undefined,
                                                    )
                                                }
                                                placeholder="Tous"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Apparence physique */}
                                <div>
                                    <h3 className="mb-3 text-sm font-semibold">
                                        Apparence physique
                                    </h3>
                                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                                        <div>
                                            <Label>Morphologie</Label>
                                            <MultiSelect
                                                options={
                                                    profileOptions.body_type
                                                }
                                                value={
                                                    localFilters.body_type || []
                                                }
                                                onChange={(value) =>
                                                    handleFilterChange(
                                                        'body_type',
                                                        value.length > 0
                                                            ? value
                                                            : undefined,
                                                    )
                                                }
                                                placeholder="Toutes"
                                            />
                                        </div>

                                        <div>
                                            <Label>Couleur des cheveux</Label>
                                            <MultiSelect
                                                options={
                                                    profileOptions.hair_color
                                                }
                                                value={
                                                    localFilters.hair_color ||
                                                    []
                                                }
                                                onChange={(value) =>
                                                    handleFilterChange(
                                                        'hair_color',
                                                        value.length > 0
                                                            ? value
                                                            : undefined,
                                                    )
                                                }
                                                placeholder="Toutes"
                                            />
                                        </div>

                                        <div>
                                            <Label>Couleur des yeux</Label>
                                            <MultiSelect
                                                options={
                                                    profileOptions.eye_color
                                                }
                                                value={
                                                    localFilters.eye_color || []
                                                }
                                                onChange={(value) =>
                                                    handleFilterChange(
                                                        'eye_color',
                                                        value.length > 0
                                                            ? value
                                                            : undefined,
                                                    )
                                                }
                                                placeholder="Toutes"
                                            />
                                        </div>

                                        <div>
                                            <Label>Origine</Label>
                                            <MultiSelect
                                                options={
                                                    profileOptions.ethnicity
                                                }
                                                value={
                                                    localFilters.ethnicity || []
                                                }
                                                onChange={(value) =>
                                                    handleFilterChange(
                                                        'ethnicity',
                                                        value.length > 0
                                                            ? value
                                                            : undefined,
                                                    )
                                                }
                                                placeholder="Toutes"
                                            />
                                        </div>

                                        <div>
                                            <Label>Taille min (cm)</Label>
                                            <Input
                                                type="number"
                                                value={
                                                    localFilters.min_height ||
                                                    ''
                                                }
                                                onChange={(e) =>
                                                    handleFilterChange(
                                                        'min_height',
                                                        parseInt(
                                                            e.target.value,
                                                        ) || undefined,
                                                    )
                                                }
                                                placeholder="150"
                                                min="100"
                                                max="250"
                                            />
                                        </div>

                                        <div>
                                            <Label>Taille max (cm)</Label>
                                            <Input
                                                type="number"
                                                value={
                                                    localFilters.max_height ||
                                                    ''
                                                }
                                                onChange={(e) =>
                                                    handleFilterChange(
                                                        'max_height',
                                                        parseInt(
                                                            e.target.value,
                                                        ) || undefined,
                                                    )
                                                }
                                                placeholder="200"
                                                min="100"
                                                max="250"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Style de vie */}
                                <div>
                                    <h3 className="mb-3 text-sm font-semibold">
                                        Style de vie
                                    </h3>
                                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                                        <div>
                                            <Label>Éducation</Label>
                                            <MultiSelect
                                                options={
                                                    profileOptions.education
                                                }
                                                value={
                                                    localFilters.education || []
                                                }
                                                onChange={(value) =>
                                                    handleFilterChange(
                                                        'education',
                                                        value.length > 0
                                                            ? value
                                                            : undefined,
                                                    )
                                                }
                                                placeholder="Tous"
                                            />
                                        </div>

                                        <div>
                                            <Label>Tabac</Label>
                                            <MultiSelect
                                                options={profileOptions.smoking}
                                                value={
                                                    localFilters.smoking || []
                                                }
                                                onChange={(value) =>
                                                    handleFilterChange(
                                                        'smoking',
                                                        value.length > 0
                                                            ? value
                                                            : undefined,
                                                    )
                                                }
                                                placeholder="Tous"
                                            />
                                        </div>

                                        <div>
                                            <Label>Alcool</Label>
                                            <MultiSelect
                                                options={
                                                    profileOptions.drinking
                                                }
                                                value={
                                                    localFilters.drinking || []
                                                }
                                                onChange={(value) =>
                                                    handleFilterChange(
                                                        'drinking',
                                                        value.length > 0
                                                            ? value
                                                            : undefined,
                                                    )
                                                }
                                                placeholder="Tous"
                                            />
                                        </div>

                                        <div>
                                            <Label>Enfants</Label>
                                            <MultiSelect
                                                options={
                                                    profileOptions.children
                                                }
                                                value={
                                                    localFilters.children || []
                                                }
                                                onChange={(value) =>
                                                    handleFilterChange(
                                                        'children',
                                                        value.length > 0
                                                            ? value
                                                            : undefined,
                                                    )
                                                }
                                                placeholder="Tous"
                                            />
                                        </div>

                                        <div>
                                            <Label>Veut des enfants</Label>
                                            <MultiSelect
                                                options={
                                                    profileOptions.wants_children
                                                }
                                                value={
                                                    localFilters.wants_children ||
                                                    []
                                                }
                                                onChange={(value) =>
                                                    handleFilterChange(
                                                        'wants_children',
                                                        value.length > 0
                                                            ? value
                                                            : undefined,
                                                    )
                                                }
                                                placeholder="Tous"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Autres critères */}
                                <div>
                                    <h3 className="mb-3 text-sm font-semibold">
                                        Autres critères
                                    </h3>
                                    <div className="flex flex-wrap gap-4">
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="has_photo"
                                                checked={
                                                    localFilters.has_photo ||
                                                    false
                                                }
                                                onCheckedChange={(checked) =>
                                                    handleFilterChange(
                                                        'has_photo',
                                                        checked === true,
                                                    )
                                                }
                                            />
                                            <Label
                                                htmlFor="has_photo"
                                                className="cursor-pointer"
                                            >
                                                Avec photo uniquement
                                            </Label>
                                        </div>

                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="is_verified"
                                                checked={
                                                    localFilters.is_verified ||
                                                    false
                                                }
                                                onCheckedChange={(checked) =>
                                                    handleFilterChange(
                                                        'is_verified',
                                                        checked === true,
                                                    )
                                                }
                                            />
                                            <Label
                                                htmlFor="is_verified"
                                                className="cursor-pointer"
                                            >
                                                Profils vérifiés uniquement
                                            </Label>
                                        </div>

                                        {canFilterNaughty && (
                                            <>
                                                <div className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id="naughty_mode"
                                                        checked={
                                                            localFilters.naughty_mode ||
                                                            false
                                                        }
                                                        onCheckedChange={(
                                                            checked,
                                                        ) =>
                                                            handleFilterChange(
                                                                'naughty_mode',
                                                                checked ===
                                                                    true,
                                                            )
                                                        }
                                                    />
                                                    <Label
                                                        htmlFor="naughty_mode"
                                                        className="cursor-pointer"
                                                    >
                                                        Profils en mode coquin
                                                    </Label>
                                                </div>

                                                <div className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id="has_private_gallery"
                                                        checked={
                                                            localFilters.has_private_gallery ||
                                                            false
                                                        }
                                                        onCheckedChange={(
                                                            checked,
                                                        ) =>
                                                            handleFilterChange(
                                                                'has_private_gallery',
                                                                checked ===
                                                                    true,
                                                            )
                                                        }
                                                    />
                                                    <Label
                                                        htmlFor="has_private_gallery"
                                                        className="cursor-pointer"
                                                    >
                                                        Avec galerie privée
                                                    </Label>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>

                                <div className="flex gap-2 pt-4">
                                    <Button
                                        type="submit"
                                        className="btn-gradient flex-1"
                                    >
                                        <SearchIcon className="mr-2 h-4 w-4" />
                                        Rechercher
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={handleResetFilters}
                                    >
                                        <X className="mr-2 h-4 w-4" />
                                        Réinitialiser
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                )}

                {/* Résultats */}
                {results.data.length > 0 ? (
                    <div className="grid grid-cols-1 gap-5 min-[520px]:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                        {results.data.map((user) => (
                            <MemberCard
                                key={user.id}
                                member={{
                                    id: user.id,
                                    name: user.name,
                                    pseudo: user.pseudo,
                                    age: user.profile?.age,
                                    city: user.profile?.city,
                                    distance: user.distance,
                                    bio: user.profile?.bio,
                                    photo:
                                        user.photos?.[0]?.thumbnail_url ||
                                        user.photos?.[0]?.url,
                                    isVerified: user.is_verified,
                                    intentions:
                                        user.profile?.meeting_intentions,
                                }}
                                onLike={() => handleLike(user.id)}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="mt-12 py-16 text-center">
                        <div className="relative mx-auto mb-6 h-24 w-24">
                            <SearchIcon className="h-full w-full text-gray-200 dark:text-gray-800" />
                            <X className="absolute top-1/2 left-1/2 h-12 w-12 -translate-x-1/2 -translate-y-1/2 transform text-pink-500" />
                        </div>
                        <h3 className="mb-2 text-2xl font-bold">
                            Aucun résultat trouvé
                        </h3>
                        <p className="mb-6 text-muted-foreground">
                            Essayez d'ajuster vos critères de recherche ou de
                            supprimer certains filtres
                        </p>
                        <Button variant="outline" onClick={handleResetFilters}>
                            <X className="mr-2 h-4 w-4" />
                            Réinitialiser les filtres
                        </Button>
                    </div>
                )}
            </div>
        </DatingLayout>
    );
}
