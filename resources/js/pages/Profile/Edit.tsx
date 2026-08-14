import DatingLayout from '@/layouts/dating-layout';
import { Head, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ProfilePreviewCard from '@/components/ProfilePreviewCard';
import InterestSelector, { NaughtyInterest } from '@/components/InterestSelector';
import { CityAutocomplete } from '@/components/city-autocomplete';
import { useState } from 'react';
import { Flame, User, Search, Sliders } from 'lucide-react';

interface Profile {
    bio?: string;
    city?: string;
    postal_code?: string;
    age?: number;
    date_of_birth?: string;
    sexual_orientation?: string;
    interested_in?: string;
    looking_for?: string;
    relationship_status?: string;
    height?: string;
    body_type?: string;
    hair_color?: string;
    eye_color?: string;
    ethnicity?: string;
    education?: string;
    occupation?: string;
    has_children?: boolean;
    wants_children?: boolean;
    smokes?: boolean;
    drinks?: boolean;
    interests?: string[];
    languages?: string[];
    is_naughty_mode?: boolean;
    show_age?: boolean;
    show_location?: boolean;
    search_radius?: number;
    min_age_preference?: number;
    max_age_preference?: number;
}

interface UserData {
    name: string;
    pseudo: string;
    email: string;
    avatar_url?: string;
    is_premium?: boolean;
    premium_expires_at?: string;
    profile?: Profile;
}

interface EditProps {
    user: UserData;
    naughtyInterests: NaughtyInterest[];
    selectedNaughtyInterests: number[];
    profileOptions: {
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
    };
    errors?: any;
}

export default function Edit({
    user,
    naughtyInterests,
    selectedNaughtyInterests,
    profileOptions,
    errors,
}: EditProps) {
    const [formData, setFormData] = useState({
        bio: user.profile?.bio || '',
        city: user.profile?.city || '',
        postal_code: user.profile?.postal_code || '',
        date_of_birth: user.profile?.date_of_birth?.substring(0, 10) || '',
        sexual_orientation: user.profile?.sexual_orientation || 'lesbian',
        interested_in: user.profile?.interested_in || '',
        looking_for: user.profile?.looking_for || '',
        relationship_status: user.profile?.relationship_status || 'single',
        height: user.profile?.height || '',
        body_type: user.profile?.body_type || '',
        hair_color: user.profile?.hair_color || '',
        eye_color: user.profile?.eye_color || '',
        ethnicity: user.profile?.ethnicity || '',
        education: user.profile?.education || '',
        occupation: user.profile?.occupation || '',
        has_children: user.profile?.has_children || false,
        wants_children: user.profile?.wants_children || false,
        smokes: user.profile?.smokes || false,
        drinks: user.profile?.drinks || false,
        interests: user.profile?.interests?.join(', ') || '',
        languages: user.profile?.languages?.join(', ') || '',
        is_naughty_mode: user.profile?.is_naughty_mode || false,
        show_age: user.profile?.show_age ?? true,
        show_location: user.profile?.show_location ?? true,
        search_radius: user.profile?.search_radius || 50,
        min_age_preference: user.profile?.min_age_preference || 18,
        max_age_preference: user.profile?.max_age_preference || 99,
    });

    const [selectedNaughtyIds, setSelectedNaughtyIds] = useState<number[]>(
        selectedNaughtyInterests || [],
    );

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const data = {
            ...formData,
            interests: formData.interests
                .split(',')
                .map((i) => i.trim())
                .filter((i) => i),
            languages: formData.languages
                .split(',')
                .map((l) => l.trim())
                .filter((l) => l),
            naughty_interest_ids: selectedNaughtyIds,
        };

        router.put('/profile', data, {
            preserveScroll: true,
            onError: () => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            },
        });
    };

    const handleChange = (field: string, value: string | boolean | number | undefined) => {
        setFormData({ ...formData, [field]: value });
    };

    const handleNaughtyToggle = (interestId: number) => {
        setSelectedNaughtyIds((prev) =>
            prev.includes(interestId)
                ? prev.filter((id) => id !== interestId)
                : [...prev, interestId],
        );
    };

    return (
        <DatingLayout title="Modifier mon profil" showOnlineUsers={false}>
            <Head title="Modifier mon profil" />

            <div className="p-6">
                <form onSubmit={handleSubmit} className="max-w-6xl mx-auto space-y-6">
                    {/* Preview Card */}
                    <ProfilePreviewCard
                        profile={{
                            bio: formData.bio,
                            age: user.profile?.age,
                            city: formData.city,
                            sexual_orientation: formData.sexual_orientation,
                            relationship_status: formData.relationship_status,
                            occupation: formData.occupation,
                            education: formData.education,
                            interests: formData.interests
                                .split(',')
                                .map((i) => i.trim())
                                .filter((i) => i),
                            looking_for: formData.looking_for,
                        }}
                        user={user}
                    />

                    {/* Tabs */}
                    <Tabs defaultValue="profile" className="w-full">
                        <TabsList className="grid w-full grid-cols-4 h-auto p-1">
                            <TabsTrigger value="profile" className="flex items-center gap-2 py-3">
                                <User className="h-4 w-4" />
                                <span className="hidden sm:inline">Profil</span>
                            </TabsTrigger>
                            <TabsTrigger value="search" className="flex items-center gap-2 py-3">
                                <Search className="h-4 w-4" />
                                <span className="hidden sm:inline">Recherche</span>
                            </TabsTrigger>
                            <TabsTrigger value="naughty" className="flex items-center gap-2 py-3">
                                <Flame className="h-4 w-4" />
                                <span className="hidden sm:inline">Mode Coquin</span>
                            </TabsTrigger>
                            <TabsTrigger value="preferences" className="flex items-center gap-2 py-3">
                                <Sliders className="h-4 w-4" />
                                <span className="hidden sm:inline">Préférences</span>
                            </TabsTrigger>
                        </TabsList>

                        {/* Profile Tab */}
                        <TabsContent value="profile" className="space-y-6 mt-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Informations de base</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="bio">Bio</Label>
                                        <Textarea
                                            id="bio"
                                            rows={4}
                                            value={formData.bio}
                                            onChange={(e) => handleChange('bio', e.target.value)}
                                            placeholder="Parlez-nous de vous..."
                                        />
                                        {errors?.bio && (
                                            <p className="text-sm text-destructive">{errors.bio}</p>
                                        )}
                                    </div>

                                    <CityAutocomplete
                                        name="city"
                                        value={formData.city}
                                        label="Ville"
                                        placeholder="Cherchez par ville ou code postal..."
                                        onCitySelect={(cityName, lat, lng) => {
                                            setFormData({
                                                ...formData,
                                                city: cityName,
                                            });
                                        }}
                                        onChange={(city) => {
                                            if (city) {
                                                setFormData({
                                                    ...formData,
                                                    city: city.nom,
                                                    postal_code: city.codesPostaux[0] || '',
                                                });
                                            }
                                        }}
                                        error={errors?.city}
                                    />

                                    <div className="space-y-2">
                                        <Label htmlFor="date_of_birth">Date de naissance</Label>
                                        <Input
                                            id="date_of_birth"
                                            type="date"
                                            value={formData.date_of_birth}
                                            onChange={(e) =>
                                                handleChange('date_of_birth', e.target.value)
                                            }
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="looking_for">Je recherche</Label>
                                        <Select
                                            value={formData.looking_for}
                                            onValueChange={(value) => handleChange('looking_for', value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Sélectionnez..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {Object.entries(profileOptions.looking_for).map(([key, label]) => (
                                                    <SelectItem key={key} value={key}>
                                                        {label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Orientation et statut</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="sexual_orientation">
                                            Orientation sexuelle
                                        </Label>
                                        <Select
                                            value={formData.sexual_orientation}
                                            onValueChange={(value) => handleChange('sexual_orientation', value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Sélectionnez..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {Object.entries(profileOptions.sexual_orientation).map(([key, label]) => (
                                                    <SelectItem key={key} value={key}>
                                                        {label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="relationship_status">Statut relationnel</Label>
                                        <Select
                                            value={formData.relationship_status}
                                            onValueChange={(value) => handleChange('relationship_status', value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Sélectionnez..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {Object.entries(profileOptions.relationship_status).map(([key, label]) => (
                                                    <SelectItem key={key} value={key}>
                                                        {label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Apparence</CardTitle>
                                </CardHeader>
                                <CardContent className="grid md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="height">Taille</Label>
                                        <Input
                                            id="height"
                                            type="text"
                                            value={formData.height}
                                            onChange={(e) => handleChange('height', e.target.value)}
                                            placeholder="170 cm"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="body_type">Morphologie</Label>
                                        <Select
                                            value={formData.body_type}
                                            onValueChange={(value) => handleChange('body_type', value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Sélectionnez..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {Object.entries(profileOptions.body_type).map(([key, label]) => (
                                                    <SelectItem key={key} value={key}>
                                                        {label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="hair_color">Couleur de cheveux</Label>
                                        <Select
                                            value={formData.hair_color}
                                            onValueChange={(value) => handleChange('hair_color', value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Sélectionnez..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {Object.entries(profileOptions.hair_color).map(([key, label]) => (
                                                    <SelectItem key={key} value={key}>
                                                        {label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="eye_color">Couleur des yeux</Label>
                                        <Select
                                            value={formData.eye_color}
                                            onValueChange={(value) => handleChange('eye_color', value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Sélectionnez..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {Object.entries(profileOptions.eye_color).map(([key, label]) => (
                                                    <SelectItem key={key} value={key}>
                                                        {label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="ethnicity">Origine</Label>
                                        <Select
                                            value={formData.ethnicity}
                                            onValueChange={(value) => handleChange('ethnicity', value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Sélectionnez..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {Object.entries(profileOptions.ethnicity).map(([key, label]) => (
                                                    <SelectItem key={key} value={key}>
                                                        {label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Vie professionnelle</CardTitle>
                                </CardHeader>
                                <CardContent className="grid md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="occupation">Profession</Label>
                                        <Input
                                            id="occupation"
                                            type="text"
                                            value={formData.occupation}
                                            onChange={(e) =>
                                                handleChange('occupation', e.target.value)
                                            }
                                            placeholder="Ingénieure, Artiste..."
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="education">Niveau d'éducation</Label>
                                        <Select
                                            value={formData.education}
                                            onValueChange={(value) => handleChange('education', value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Sélectionnez..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {Object.entries(profileOptions.education).map(([key, label]) => (
                                                    <SelectItem key={key} value={key}>
                                                        {label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Style de vie</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="has_children">J'ai des enfants</Label>
                                        <Switch
                                            id="has_children"
                                            checked={formData.has_children}
                                            onCheckedChange={(checked) =>
                                                handleChange('has_children', checked)
                                            }
                                        />
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="wants_children">J'en veux</Label>
                                        <Switch
                                            id="wants_children"
                                            checked={formData.wants_children}
                                            onCheckedChange={(checked) =>
                                                handleChange('wants_children', checked)
                                            }
                                        />
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="smokes">Je fume</Label>
                                        <Switch
                                            id="smokes"
                                            checked={formData.smokes}
                                            onCheckedChange={(checked) =>
                                                handleChange('smokes', checked)
                                            }
                                        />
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="drinks">Je bois de l'alcool</Label>
                                        <Switch
                                            id="drinks"
                                            checked={formData.drinks}
                                            onCheckedChange={(checked) =>
                                                handleChange('drinks', checked)
                                            }
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Intérêts et langues</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="interests">
                                            Centres d'intérêt (séparés par des virgules)
                                        </Label>
                                        <Input
                                            id="interests"
                                            type="text"
                                            value={formData.interests}
                                            onChange={(e) => handleChange('interests', e.target.value)}
                                            placeholder="Lecture, Voyage, Musique..."
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="languages">
                                            Langues parlées (séparées par des virgules)
                                        </Label>
                                        <Input
                                            id="languages"
                                            type="text"
                                            value={formData.languages}
                                            onChange={(e) => handleChange('languages', e.target.value)}
                                            placeholder="Français, Anglais, Espagnol..."
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Search Tab */}
                        <TabsContent value="search" className="space-y-6 mt-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Critères de recherche</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="search_radius">
                                            Rayon de recherche: {formData.search_radius} km
                                        </Label>
                                        <input
                                            id="search_radius"
                                            type="range"
                                            min="5"
                                            max="500"
                                            value={formData.search_radius}
                                            onChange={(e) =>
                                                handleChange('search_radius', parseInt(e.target.value))
                                            }
                                            className="w-full h-2 bg-pink-200 rounded-lg appearance-none cursor-pointer accent-pink-500"
                                        />
                                        <div className="flex justify-between text-xs text-gray-500">
                                            <span>5 km</span>
                                            <span>500 km</span>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Tranche d'âge</Label>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <Label htmlFor="min_age_preference" className="text-sm">
                                                    De {formData.min_age_preference} ans
                                                </Label>
                                                <input
                                                    id="min_age_preference"
                                                    type="range"
                                                    min="18"
                                                    max="99"
                                                    value={formData.min_age_preference}
                                                    onChange={(e) =>
                                                        handleChange(
                                                            'min_age_preference',
                                                            parseInt(e.target.value),
                                                        )
                                                    }
                                                    className="w-full h-2 bg-pink-200 rounded-lg appearance-none cursor-pointer accent-pink-500"
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="max_age_preference" className="text-sm">
                                                    À {formData.max_age_preference} ans
                                                </Label>
                                                <input
                                                    id="max_age_preference"
                                                    type="range"
                                                    min="18"
                                                    max="99"
                                                    value={formData.max_age_preference}
                                                    onChange={(e) =>
                                                        handleChange(
                                                            'max_age_preference',
                                                            parseInt(e.target.value),
                                                        )
                                                    }
                                                    className="w-full h-2 bg-pink-200 rounded-lg appearance-none cursor-pointer accent-pink-500"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="interested_in">Intéressée par</Label>
                                        <Input
                                            id="interested_in"
                                            type="text"
                                            value={formData.interested_in}
                                            onChange={(e) =>
                                                handleChange('interested_in', e.target.value)
                                            }
                                            placeholder="Femmes, Personnes non-binaires..."
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Naughty Tab */}
                        <TabsContent value="naughty" className="space-y-6 mt-6">
                            <Card>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle className="flex items-center gap-2">
                                                <Flame className="h-5 w-5 text-pink-500" />
                                                Mode Coquin
                                                {user.is_premium && (
                                                    <span className="text-xs bg-gradient-to-r from-yellow-400 to-yellow-600 text-white px-2 py-0.5 rounded-full">
                                                        PREMIUM
                                                    </span>
                                                )}
                                            </CardTitle>
                                            <p className="text-sm text-muted-foreground mt-1">
                                                {user.is_premium
                                                    ? 'Partagez vos préférences intimes pour trouver des partenaires compatibles'
                                                    : 'Fonctionnalité réservée aux membres Premium'}
                                            </p>
                                        </div>
                                        {user.is_premium && (
                                            <Switch
                                                checked={formData.is_naughty_mode}
                                                onCheckedChange={(checked) =>
                                                    handleChange('is_naughty_mode', checked)
                                                }
                                            />
                                        )}
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    {!user.is_premium ? (
                                        <div className="text-center py-12">
                                            <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center">
                                                <Flame className="h-10 w-10 text-white" />
                                            </div>
                                            <h3 className="text-lg font-semibold mb-2">
                                                Mode Coquin Premium
                                            </h3>
                                            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                                                Partagez vos désirs et trouvez des partenaires qui partagent
                                                vos préférences intimes. Cette fonctionnalité est réservée
                                                aux membres Premium.
                                            </p>
                                            <Button
                                                type="button"
                                                className="btn-gradient"
                                                onClick={() => router.visit('/premium')}
                                            >
                                                Passer Premium
                                            </Button>
                                        </div>
                                    ) : formData.is_naughty_mode ? (
                                        <div className="space-y-4">
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                Sélectionnez vos intérêts coquins. Ceux-ci seront
                                                visibles uniquement par les autres membres ayant activé
                                                le mode coquin.
                                            </p>
                                            <InterestSelector
                                                interests={naughtyInterests}
                                                selectedIds={selectedNaughtyIds}
                                                onToggle={handleNaughtyToggle}
                                            />
                                        </div>
                                    ) : (
                                        <div className="text-center py-12">
                                            <Flame className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                                            <p className="text-gray-500">
                                                Activez le mode coquin pour partager vos préférences
                                                intimes
                                            </p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Preferences Tab */}
                        <TabsContent value="preferences" className="space-y-6 mt-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Confidentialité</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <Label htmlFor="show_age">Afficher mon âge</Label>
                                            <p className="text-sm text-muted-foreground">
                                                Les autres utilisateurs verront votre âge sur votre
                                                profil
                                            </p>
                                        </div>
                                        <Switch
                                            id="show_age"
                                            checked={formData.show_age}
                                            onCheckedChange={(checked) =>
                                                handleChange('show_age', checked)
                                            }
                                        />
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div>
                                            <Label htmlFor="show_location">
                                                Afficher ma localisation
                                            </Label>
                                            <p className="text-sm text-muted-foreground">
                                                Les autres utilisateurs verront votre ville
                                            </p>
                                        </div>
                                        <Switch
                                            id="show_location"
                                            checked={formData.show_location}
                                            onCheckedChange={(checked) =>
                                                handleChange('show_location', checked)
                                            }
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>

                    {/* Save Buttons */}
                    <div className="flex gap-4 sticky bottom-0 bg-background/95 backdrop-blur-sm p-4 -mx-4 border-t border-border">
                        <Button
                            type="button"
                            variant="outline"
                            className="flex-1"
                            onClick={() => router.get('/dashboard')}
                        >
                            Annuler
                        </Button>
                        <Button type="submit" className="flex-1 btn-gradient">
                            Enregistrer les modifications
                        </Button>
                    </div>
                </form>
            </div>
        </DatingLayout>
    );
}
