import DatingLayout from '@/layouts/dating-layout';
import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { MultiSelect } from '@/components/ui/multi-select';
import {
    Search as SearchIcon,
    MapPin,
    Heart,
    Filter,
    X,
    Sparkles,
    SlidersHorizontal,
    CheckCircle2,
} from 'lucide-react';
import { useState } from 'react';

interface Photo {
    id: number;
    path: string;
}

interface Profile {
    city?: string;
    age?: number;
    bio?: string;
}

interface UserData {
    id: number;
    name: string;
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
    naughty_interests?: number[];
    sort_by?: string;
}

interface NaughtyInterest {
    id: number;
    name: string;
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
    naughtyInterests = [],
}: {
    results: { data: UserData[]; total: number };
    filters: Filters;
    profileOptions: ProfileOptions;
    canFilterNaughty?: boolean;
    naughtyInterests?: NaughtyInterest[];
}) {
    const [showFilters, setShowFilters] = useState(true);
    const [localFilters, setLocalFilters] = useState<Filters>(filters);

    const handleSearch = (e?: React.FormEvent) => {
        e?.preventDefault();
        router.get('/search', localFilters as any, { preserveState: true });
    };

    const handleFilterChange = (key: string, value: any) => {
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
        (value) => value !== undefined && value !== '' && value !== null
    ).length;

    return (
        <DatingLayout title="Recherche Avancée" showOnlineUsers={false}>
            <Head title="Recherche Avancée" />

            <div className="p-6 space-y-6">
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="flex items-center gap-2 text-3xl font-bold">
                                <SearchIcon className="h-8 w-8 text-pink-500" />
                                Recherche Avancée
                            </h1>
                            <p className="mt-2 text-muted-foreground">
                                {results.total} profil{results.total > 1 ? 's' : ''} trouvé{results.total > 1 ? 's' : ''}
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <Select
                                value={localFilters.sort_by || 'distance'}
                                onValueChange={(value) => {
                                    setLocalFilters({ ...localFilters, sort_by: value });
                                    router.get('/search', { ...localFilters, sort_by: value } as any);
                                }}
                            >
                                <SelectTrigger className="w-48">
                                    <SelectValue placeholder="Trier par" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="distance">Plus proche</SelectItem>
                                    <SelectItem value="newest">Plus récent</SelectItem>
                                    <SelectItem value="activity">Dernière activité</SelectItem>
                                    <SelectItem value="popular">Popularité</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button
                                variant="outline"
                                onClick={() => setShowFilters(!showFilters)}
                            >
                                <Filter className="h-4 w-4 mr-2" />
                                Filtres {activeFiltersCount > 0 && `(${activeFiltersCount})`}
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
                                    <X className="h-4 w-4 mr-1" />
                                    Réinitialiser
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSearch} className="space-y-6">
                                {/* Critères de base */}
                                <div>
                                    <h3 className="text-sm font-semibold mb-3">Critères de base</h3>
                                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                                        <div>
                                            <Label>Âge minimum</Label>
                                            <Input
                                                type="number"
                                                value={localFilters.min_age || ''}
                                                onChange={(e) =>
                                                    handleFilterChange('min_age', parseInt(e.target.value) || undefined)
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
                                                value={localFilters.max_age || ''}
                                                onChange={(e) =>
                                                    handleFilterChange('max_age', parseInt(e.target.value) || undefined)
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
                                                value={localFilters.distance || ''}
                                                onChange={(e) =>
                                                    handleFilterChange('distance', parseInt(e.target.value) || undefined)
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
                                                onChange={(e) => handleFilterChange('city', e.target.value)}
                                                placeholder="Paris, Lyon..."
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Orientation & Relation */}
                                <div>
                                    <h3 className="text-sm font-semibold mb-3">Orientation & Statut</h3>
                                    <div className="grid gap-4 md:grid-cols-3">
                                        <div>
                                            <Label>Orientation sexuelle</Label>
                                            <MultiSelect
                                                options={profileOptions.sexual_orientation}
                                                value={localFilters.sexual_orientation || []}
                                                onChange={(value) => handleFilterChange('sexual_orientation', value.length > 0 ? value : undefined)}
                                                placeholder="Toutes"
                                            />
                                        </div>

                                        <div>
                                            <Label>Statut relationnel</Label>
                                            <MultiSelect
                                                options={profileOptions.relationship_status}
                                                value={localFilters.relationship_status || []}
                                                onChange={(value) => handleFilterChange('relationship_status', value.length > 0 ? value : undefined)}
                                                placeholder="Tous"
                                            />
                                        </div>

                                        <div>
                                            <Label>Recherche</Label>
                                            <MultiSelect
                                                options={profileOptions.looking_for}
                                                value={localFilters.looking_for || []}
                                                onChange={(value) => handleFilterChange('looking_for', value.length > 0 ? value : undefined)}
                                                placeholder="Tous"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Apparence physique */}
                                <div>
                                    <h3 className="text-sm font-semibold mb-3">Apparence physique</h3>
                                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                                        <div>
                                            <Label>Morphologie</Label>
                                            <MultiSelect
                                                options={profileOptions.body_type}
                                                value={localFilters.body_type || []}
                                                onChange={(value) => handleFilterChange('body_type', value.length > 0 ? value : undefined)}
                                                placeholder="Toutes"
                                            />
                                        </div>

                                        <div>
                                            <Label>Couleur des cheveux</Label>
                                            <MultiSelect
                                                options={profileOptions.hair_color}
                                                value={localFilters.hair_color || []}
                                                onChange={(value) => handleFilterChange('hair_color', value.length > 0 ? value : undefined)}
                                                placeholder="Toutes"
                                            />
                                        </div>

                                        <div>
                                            <Label>Couleur des yeux</Label>
                                            <MultiSelect
                                                options={profileOptions.eye_color}
                                                value={localFilters.eye_color || []}
                                                onChange={(value) => handleFilterChange('eye_color', value.length > 0 ? value : undefined)}
                                                placeholder="Toutes"
                                            />
                                        </div>

                                        <div>
                                            <Label>Origine</Label>
                                            <MultiSelect
                                                options={profileOptions.ethnicity}
                                                value={localFilters.ethnicity || []}
                                                onChange={(value) => handleFilterChange('ethnicity', value.length > 0 ? value : undefined)}
                                                placeholder="Toutes"
                                            />
                                        </div>

                                        <div>
                                            <Label>Taille min (cm)</Label>
                                            <Input
                                                type="number"
                                                value={localFilters.min_height || ''}
                                                onChange={(e) =>
                                                    handleFilterChange('min_height', parseInt(e.target.value) || undefined)
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
                                                value={localFilters.max_height || ''}
                                                onChange={(e) =>
                                                    handleFilterChange('max_height', parseInt(e.target.value) || undefined)
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
                                    <h3 className="text-sm font-semibold mb-3">Style de vie</h3>
                                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                                        <div>
                                            <Label>Éducation</Label>
                                            <MultiSelect
                                                options={profileOptions.education}
                                                value={localFilters.education || []}
                                                onChange={(value) => handleFilterChange('education', value.length > 0 ? value : undefined)}
                                                placeholder="Tous"
                                            />
                                        </div>

                                        <div>
                                            <Label>Tabac</Label>
                                            <MultiSelect
                                                options={profileOptions.smoking}
                                                value={localFilters.smoking || []}
                                                onChange={(value) => handleFilterChange('smoking', value.length > 0 ? value : undefined)}
                                                placeholder="Tous"
                                            />
                                        </div>

                                        <div>
                                            <Label>Alcool</Label>
                                            <MultiSelect
                                                options={profileOptions.drinking}
                                                value={localFilters.drinking || []}
                                                onChange={(value) => handleFilterChange('drinking', value.length > 0 ? value : undefined)}
                                                placeholder="Tous"
                                            />
                                        </div>

                                        <div>
                                            <Label>Enfants</Label>
                                            <MultiSelect
                                                options={profileOptions.children}
                                                value={localFilters.children || []}
                                                onChange={(value) => handleFilterChange('children', value.length > 0 ? value : undefined)}
                                                placeholder="Tous"
                                            />
                                        </div>

                                        <div>
                                            <Label>Veut des enfants</Label>
                                            <MultiSelect
                                                options={profileOptions.wants_children}
                                                value={localFilters.wants_children || []}
                                                onChange={(value) => handleFilterChange('wants_children', value.length > 0 ? value : undefined)}
                                                placeholder="Tous"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Autres critères */}
                                <div>
                                    <h3 className="text-sm font-semibold mb-3">Autres critères</h3>
                                    <div className="flex flex-wrap gap-4">
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="has_photo"
                                                checked={localFilters.has_photo || false}
                                                onCheckedChange={(checked) =>
                                                    handleFilterChange('has_photo', checked)
                                                }
                                            />
                                            <Label htmlFor="has_photo" className="cursor-pointer">
                                                Avec photo uniquement
                                            </Label>
                                        </div>

                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="is_verified"
                                                checked={localFilters.is_verified || false}
                                                onCheckedChange={(checked) =>
                                                    handleFilterChange('is_verified', checked)
                                                }
                                            />
                                            <Label htmlFor="is_verified" className="cursor-pointer">
                                                Profils vérifiés uniquement
                                            </Label>
                                        </div>

                                        {canFilterNaughty && (
                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    id="naughty_mode"
                                                    checked={localFilters.naughty_mode || false}
                                                    onCheckedChange={(checked) =>
                                                        handleFilterChange('naughty_mode', checked)
                                                    }
                                                />
                                                <Label
                                                    htmlFor="naughty_mode"
                                                    className="cursor-pointer"
                                                >
                                                    Profils en mode coquin
                                                </Label>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {canFilterNaughty && naughtyInterests.length > 0 && (
                                    <div>
                                        <h3 className="text-sm font-semibold mb-3">
                                            Envies coquines
                                        </h3>
                                        <div className="flex flex-wrap gap-3">
                                            {naughtyInterests.map((interest) => {
                                                const selected =
                                                    localFilters.naughty_interests?.includes(
                                                        interest.id
                                                    ) || false;

                                                return (
                                                    <div
                                                        key={interest.id}
                                                        className="flex items-center space-x-2"
                                                    >
                                                        <Checkbox
                                                            id={`naughty_interest_${interest.id}`}
                                                            checked={selected}
                                                            onCheckedChange={(checked) => {
                                                                const current =
                                                                    localFilters.naughty_interests ??
                                                                    [];
                                                                handleFilterChange(
                                                                    'naughty_interests',
                                                                    checked
                                                                        ? [...current, interest.id]
                                                                        : current.filter(
                                                                              (id) =>
                                                                                  id !== interest.id
                                                                          )
                                                                );
                                                            }}
                                                        />
                                                        <Label
                                                            htmlFor={`naughty_interest_${interest.id}`}
                                                            className="cursor-pointer"
                                                        >
                                                            {interest.name}
                                                        </Label>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                <div className="flex gap-2 pt-4">
                                    <Button type="submit" className="flex-1 btn-gradient">
                                        <SearchIcon className="h-4 w-4 mr-2" />
                                        Rechercher
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={handleResetFilters}
                                    >
                                        <X className="h-4 w-4 mr-2" />
                                        Réinitialiser
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                )}

                {/* Résultats */}
                {results.data.length > 0 ? (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {results.data.map((user) => (
                            <Card key={user.id} className="overflow-hidden transition-all hover:shadow-lg group">
                                <Link href={`/profile/${user.id}`}>
                                    <div className="relative h-80 overflow-hidden bg-gradient-to-br from-pink-100 to-purple-100 dark:from-pink-950 dark:to-purple-950">
                                        {user.photos?.[0] ? (
                                            <img
                                                src={`/storage/${user.photos[0].path}`}
                                                alt={user.name}
                                                className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                                            />
                                        ) : (
                                            <div className="flex h-full items-center justify-center text-6xl font-bold text-pink-300">
                                                {user.name.charAt(0)}
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                                        {/* Badges */}
                                        <div className="absolute top-3 right-3 flex flex-col gap-2">
                                            {user.is_verified && (
                                                <Badge className="bg-blue-500 text-white border-0">
                                                    <CheckCircle2 className="h-3 w-3 mr-1" />
                                                    Vérifiée
                                                </Badge>
                                            )}
                                            {user.distance != null && (
                                                <Badge variant="secondary" className="bg-white/90">
                                                    <MapPin className="h-3 w-3 mr-1" />
                                                    {user.distance < 1
                                                        ? 'Moins d\'1 km'
                                                        : `${Math.round(user.distance)} km`}
                                                </Badge>
                                            )}
                                        </div>

                                        {/* Info au bas */}
                                        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                                            <h3 className="text-2xl font-bold">
                                                {user.name}, {user.profile?.age || 'N/A'}
                                            </h3>
                                            {user.profile?.city && (
                                                <p className="flex items-center gap-1 text-sm text-white/90">
                                                    <MapPin className="h-4 w-4" />
                                                    {user.profile.city}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </Link>

                                <CardFooter className="p-4">
                                    <Button
                                        className="w-full btn-gradient"
                                        onClick={() => handleLike(user.id)}
                                    >
                                        <Heart className="h-5 w-5 mr-2" />
                                        J'aime
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="mt-12 text-center py-16">
                        <div className="relative mx-auto w-24 h-24 mb-6">
                            <SearchIcon className="w-full h-full text-gray-200 dark:text-gray-800" />
                            <X className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-12 w-12 text-pink-500" />
                        </div>
                        <h3 className="text-2xl font-bold mb-2">Aucun résultat trouvé</h3>
                        <p className="text-muted-foreground mb-6">
                            Essayez d'ajuster vos critères de recherche ou de supprimer certains filtres
                        </p>
                        <Button variant="outline" onClick={handleResetFilters}>
                            <X className="h-4 w-4 mr-2" />
                            Réinitialiser les filtres
                        </Button>
                    </div>
                )}
            </div>
        </DatingLayout>
    );
}
