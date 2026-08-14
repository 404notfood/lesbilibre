import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MapPin, Loader2, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface City {
    nom: string;
    code: string;
    codeDepartement: string;
    codeRegion: string;
    codesPostaux: string[];
    population: number;
    centre: {
        type: string;
        coordinates: [number, number]; // [longitude, latitude]
    };
}

interface CityAutocompleteProps {
    name?: string;
    value?: string;
    onChange?: (city: City | null) => void;
    onCitySelect?: (cityName: string, lat: number, lng: number) => void;
    placeholder?: string;
    required?: boolean;
    className?: string;
    label?: string;
    error?: string;
}

export function CityAutocomplete({
    name = 'city',
    value = '',
    onChange,
    onCitySelect,
    placeholder = 'Paris, Lyon, Marseille...',
    required = false,
    className,
    label,
    error,
}: CityAutocompleteProps): JSX.Element {
    const [query, setQuery] = useState(value);
    const [cities, setCities] = useState<City[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [selectedCity, setSelectedCity] = useState<City | null>(null);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const debounceTimer = useRef<NodeJS.Timeout | null>(null);

    // Fermer le dropdown quand on clique ailleurs
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent): void => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Recherche avec debounce
    useEffect(() => {
        if (query.length < 2) {
            setCities([]);
            return;
        }

        if (debounceTimer.current) {
            clearTimeout(debounceTimer.current);
        }

        debounceTimer.current = setTimeout(() => {
            searchCities(query);
        }, 300);

        return () => {
            if (debounceTimer.current) {
                clearTimeout(debounceTimer.current);
            }
        };
    }, [query]);

    const searchCities = async (search: string): Promise<void> => {
        setIsLoading(true);
        try {
            // Détecter si c'est un code postal (5 chiffres)
            const isPostalCode = /^\d{2,5}$/.test(search);

            let url: string;
            if (isPostalCode) {
                // Recherche par code postal
                url = `https://geo.api.gouv.fr/communes?codePostal=${encodeURIComponent(search)}&fields=nom,code,codeDepartement,codeRegion,codesPostaux,centre,population&limit=20&boost=population`;
            } else {
                // Recherche par nom de ville
                url = `https://geo.api.gouv.fr/communes?nom=${encodeURIComponent(search)}&fields=nom,code,codeDepartement,codeRegion,codesPostaux,centre,population&limit=10&boost=population`;
            }

            const response = await fetch(url);

            if (!response.ok) {
                throw new Error('Erreur lors de la recherche');
            }

            const data: City[] = await response.json();
            setCities(data);
            setIsOpen(true);
        } catch (error) {
            console.error('Erreur recherche ville:', error);
            setCities([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        const newValue = e.target.value;
        setQuery(newValue);
        setSelectedCity(null);
        onChange?.(null);
    };

    const handleCitySelect = (city: City): void => {
        setQuery(city.nom);
        setSelectedCity(city);
        setIsOpen(false);
        setCities([]);

        // Coordonnées : [longitude, latitude]
        const [lng, lat] = city.centre.coordinates;

        // Callback avec la ville sélectionnée
        onChange?.(city);
        onCitySelect?.(city.nom, lat, lng);
    };

    const formatCityDisplay = (city: City): string => {
        const codePostal = city.codesPostaux?.[0] || '';
        return `${city.nom} (${codePostal})`;
    };

    return (
        <div ref={wrapperRef} className="relative space-y-2">
            {label && (
                <Label htmlFor={name} className="text-sm font-medium">
                    {label}
                    {required && <span className="text-destructive ml-1">*</span>}
                </Label>
            )}

            <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    id={name}
                    name={name}
                    type="text"
                    value={query}
                    onChange={handleInputChange}
                    placeholder={placeholder}
                    required={required}
                    className={cn('pl-10 pr-10', className)}
                    autoComplete="off"
                />
                {isLoading && (
                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
                )}
                {selectedCity && !isLoading && (
                    <Check className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-600" />
                )}

                {/* Input caché pour la validation du formulaire */}
                {selectedCity && (
                    <>
                        <input type="hidden" name="city_name" value={selectedCity.nom} />
                        <input
                            type="hidden"
                            name="city_latitude"
                            value={selectedCity.centre.coordinates[1]}
                        />
                        <input
                            type="hidden"
                            name="city_longitude"
                            value={selectedCity.centre.coordinates[0]}
                        />
                        <input
                            type="hidden"
                            name="city_postal_code"
                            value={selectedCity.codesPostaux[0] || ''}
                        />
                    </>
                )}
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            {/* Dropdown des résultats */}
            {isOpen && cities.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {cities.map((city) => (
                        <button
                            key={city.code}
                            type="button"
                            onClick={() => handleCitySelect(city)}
                            className={cn(
                                'w-full px-4 py-3 text-left hover:bg-accent transition-colors',
                                'flex items-start gap-3 border-b border-border last:border-b-0',
                                'focus:outline-none focus:bg-accent'
                            )}
                        >
                            <MapPin className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                                <div className="font-medium text-sm">{city.nom}</div>
                                <div className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
                                    <span>{city.codesPostaux[0]}</span>
                                    <span>•</span>
                                    <span>{city.codeDepartement}</span>
                                    {city.population && (
                                        <>
                                            <span>•</span>
                                            <span>
                                                {city.population.toLocaleString()} habitants
                                            </span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            )}

            {/* Message aucun résultat */}
            {isOpen && !isLoading && cities.length === 0 && query.length >= 2 && (
                <div className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-lg shadow-lg p-4 text-center">
                    <p className="text-sm text-muted-foreground">
                        Aucune ville trouvée pour "{query}"
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                        Essayez avec un code postal (ex: 75001) ou le nom complet de la ville
                    </p>
                </div>
            )}

            {/* Astuce de recherche */}
            {query.length === 0 && (
                <p className="text-xs text-muted-foreground">
                    💡 Vous pouvez chercher par nom de ville ou code postal
                </p>
            )}
        </div>
    );
}
