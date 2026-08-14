import DatingLayout from '@/layouts/dating-layout';
import { Head } from '@inertiajs/react';
import { Card, CardContent } from '@/components/ui/card';
import { FileText } from 'lucide-react';

interface StaticPage {
    id: number;
    slug: string;
    title: string;
    content: string;
    meta_description: string | null;
    is_published: boolean;
    published_at: string | null;
    created_at: string;
    updated_at: string;
}

export default function StaticPage({ page }: { page: StaticPage }) {
    return (
        <DatingLayout title={page.title} showOnlineUsers={false}>
            <Head title={page.title}>
                {page.meta_description && (
                    <meta name="description" content={page.meta_description} />
                )}
            </Head>

            <div className="p-6 max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-4xl font-bold flex items-center gap-3">
                        <FileText className="h-10 w-10 text-purple-500" />
                        {page.title}
                    </h1>
                    {page.published_at && (
                        <p className="mt-2 text-sm text-muted-foreground">
                            Publié le{' '}
                            {new Date(page.published_at).toLocaleDateString('fr-FR', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                            })}
                        </p>
                    )}
                </div>

                {/* Content */}
                <Card>
                    <CardContent className="p-8">
                        <div
                            className="prose prose-lg max-w-none"
                            dangerouslySetInnerHTML={{ __html: page.content }}
                        />
                    </CardContent>
                </Card>
            </div>
        </DatingLayout>
    );
}
