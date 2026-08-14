import AdminLayout, {
    AdminButton,
    AdminCard,
    AdminSectionTitle,
} from '@/layouts/admin-layout';
import { Head, useForm } from '@inertiajs/react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Save } from 'lucide-react';
import { FormEvent } from 'react';

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        slug: '',
        title: '',
        content: '',
        meta_description: '',
        is_published: false,
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        post('/admin/static-pages');
    };

    const generateSlug = () => {
        const slug = data.title
            .toLowerCase()
            .normalize('NFD')
            .replace(/[̀-ͯ]/g, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
        setData('slug', slug);
    };

    return (
        <AdminLayout
            title="Créer une page statique"
            subtitle="Ajouter du contenu éditorial au site"
            breadcrumbs={[
                { label: 'Admin', href: '/admin/dashboard' },
                { label: 'Pages statiques', href: '/admin/static-pages' },
                { label: 'Création' },
            ]}
            actions={
                <AdminButton href="/admin/static-pages" variant="default">
                    Retour
                </AdminButton>
            }
        >
            <Head title="Créer une page" />

            <div className="space-y-10 max-w-4xl">
                <section>
                    <AdminSectionTitle
                        eyebrow="01 · Identité"
                        title="Titre et adresse"
                    />
                    <AdminCard>
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <FormField label="Titre *" error={errors.title} htmlFor="title">
                                <Input
                                    id="title"
                                    value={data.title}
                                    onChange={(e) => setData('title', e.target.value)}
                                    onBlur={generateSlug}
                                    placeholder="Conditions d'utilisation"
                                />
                            </FormField>

                            <FormField
                                label="Slug (URL) *"
                                error={errors.slug}
                                htmlFor="slug"
                                hint={`URL: /${data.slug || 'slug'}`}
                            >
                                <div className="flex gap-2">
                                    <Input
                                        id="slug"
                                        value={data.slug}
                                        onChange={(e) => setData('slug', e.target.value)}
                                        placeholder="conditions-utilisation"
                                    />
                                    <AdminButton
                                        onClick={generateSlug}
                                        variant="default"
                                    >
                                        Générer
                                    </AdminButton>
                                </div>
                            </FormField>

                            <FormField
                                label="Meta description (SEO)"
                                error={errors.meta_description}
                                htmlFor="meta_description"
                            >
                                <Input
                                    id="meta_description"
                                    value={data.meta_description}
                                    onChange={(e) =>
                                        setData('meta_description', e.target.value)
                                    }
                                    placeholder="Description pour les moteurs de recherche..."
                                />
                            </FormField>

                            <FormField
                                label="Contenu *"
                                error={errors.content}
                                htmlFor="content"
                                hint="Vous pouvez utiliser du HTML"
                            >
                                <Textarea
                                    id="content"
                                    value={data.content}
                                    onChange={(e) => setData('content', e.target.value)}
                                    rows={15}
                                    placeholder="Le contenu de la page..."
                                />
                            </FormField>

                            <div
                                className="flex items-center gap-2 pt-2"
                                style={{ borderTop: '1px solid var(--line-soft)' }}
                            >
                                <input
                                    type="checkbox"
                                    id="is_published"
                                    checked={data.is_published}
                                    onChange={(e) =>
                                        setData('is_published', e.target.checked)
                                    }
                                    className="mt-2 h-4 w-4 rounded"
                                    style={{
                                        accentColor: 'var(--wine-deep)',
                                    }}
                                />
                                <Label
                                    htmlFor="is_published"
                                    className="mt-2 cursor-pointer text-sm"
                                    style={{ color: 'var(--ink)' }}
                                >
                                    Publier immédiatement
                                </Label>
                            </div>

                            <div
                                className="flex gap-2 pt-4"
                                style={{ borderTop: '1px solid var(--line-soft)' }}
                            >
                                <AdminButton
                                    type="submit"
                                    disabled={processing}
                                    variant="primary"
                                    icon={Save}
                                >
                                    {processing ? 'Création...' : 'Créer la page'}
                                </AdminButton>
                                <AdminButton
                                    href="/admin/static-pages"
                                    variant="default"
                                >
                                    Annuler
                                </AdminButton>
                            </div>
                        </form>
                    </AdminCard>
                </section>
            </div>
        </AdminLayout>
    );
}

function FormField({
    label,
    error,
    htmlFor,
    hint,
    children,
}: {
    label: string;
    error?: string;
    htmlFor: string;
    hint?: string;
    children: React.ReactNode;
}) {
    return (
        <div>
            <Label
                htmlFor={htmlFor}
                className="editorial-caption mb-1.5 block"
                style={{ color: 'var(--ink-mute)' }}
            >
                {label}
            </Label>
            {children}
            {hint && (
                <p
                    className="mt-1.5 text-xs"
                    style={{ color: 'var(--ink-mute)' }}
                >
                    {hint}
                </p>
            )}
            {error && (
                <p
                    className="mt-1.5 text-xs font-medium"
                    style={{ color: 'var(--destructive)' }}
                >
                    {error}
                </p>
            )}
        </div>
    );
}
