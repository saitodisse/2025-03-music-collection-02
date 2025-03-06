'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMusic } from '@/lib/context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function NewArtist() {
    const router = useRouter();
    const { addArtist } = useMusic();
    const [name, setName] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name.trim()) {
            toast.error('Artist name is required');
            return;
        }

        setIsSubmitting(true);

        try {
            const artist = await addArtist({
                name: name.trim(),
                imageUrl: imageUrl.trim() || undefined
            });

            toast.success(`Artist "${name}" added successfully!`);
            router.push(`/artists/${artist.id}`);
        } catch (error: any) {
            toast.error('Failed to add artist');
            setIsSubmitting(false);
        }
    };

    return (
        <div className="container mx-auto py-8 px-4 max-w-2xl">
            <div className="mb-6">
                <Link href="/?tab=artists" className="flex items-center text-sm text-muted-foreground hover:text-foreground">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Artists
                </Link>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl">Add New Artist</CardTitle>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Artist Name <span className="text-red-500">*</span></Label>
                            <Input
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Enter artist name"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="imageUrl">Image URL</Label>
                            <Input
                                id="imageUrl"
                                value={imageUrl}
                                onChange={(e) => setImageUrl(e.target.value)}
                                placeholder="https://example.com/image.jpg"
                            />
                            <p className="text-xs text-muted-foreground">
                                Optional: Enter a URL for the artist's image
                            </p>
                        </div>
                    </CardContent>

                    <CardFooter className="flex justify-between">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.push('/?tab=artists')}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? 'Adding...' : 'Add Artist'}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
} 