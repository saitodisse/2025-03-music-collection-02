'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMusic } from '@/lib/context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function NewSong() {
    const router = useRouter();
    const { addSong, artists } = useMusic();
    const [title, setTitle] = useState('');
    const [artistId, setArtistId] = useState('');
    const [duration, setDuration] = useState('');
    const [year, setYear] = useState('');
    const [genre, setGenre] = useState('');
    const [coverUrl, setCoverUrl] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!title.trim()) {
            toast.error('Song title is required');
            return;
        }

        if (!artistId) {
            toast.error('Artist is required');
            return;
        }

        if (!duration || isNaN(Number(duration)) || Number(duration) <= 0) {
            toast.error('Valid duration is required');
            return;
        }

        setIsSubmitting(true);

        try {
            const song = await addSong({
                title: title.trim(),
                artistId,
                duration: Number(duration),
                year: year ? Number(year) : undefined,
                genre: genre.trim() || undefined,
                coverUrl: coverUrl.trim() || undefined
            });

            toast.success(`Song "${title}" added successfully!`);
            router.push(`/songs/${song.id}`);
        } catch (error: any) {
            toast.error('Failed to add song');
            setIsSubmitting(false);
        }
    };

    return (
        <div className="container mx-auto py-8 px-4 max-w-2xl">
            <div className="mb-6">
                <Link href="/?tab=songs" className="flex items-center text-sm text-muted-foreground hover:text-foreground">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Songs
                </Link>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl">Add New Song</CardTitle>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="title">Song Title <span className="text-red-500">*</span></Label>
                            <Input
                                id="title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Enter song title"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="artist">Artist <span className="text-red-500">*</span></Label>
                            {artists.length > 0 ? (
                                <Select value={artistId} onValueChange={setArtistId} required>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select an artist" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {artists.map((artist) => (
                                            <SelectItem key={artist.id} value={artist.id}>
                                                {artist.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            ) : (
                                <div className="text-sm text-muted-foreground p-2 border rounded-md">
                                    No artists available. <Link href="/artists/new" className="text-primary hover:underline">Add an artist first</Link>.
                                </div>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="duration">Duration (seconds) <span className="text-red-500">*</span></Label>
                            <Input
                                id="duration"
                                type="number"
                                min="1"
                                value={duration}
                                onChange={(e) => setDuration(e.target.value)}
                                placeholder="Enter duration in seconds"
                                required
                            />
                            <p className="text-xs text-muted-foreground">
                                Example: 180 for a 3-minute song
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="year">Year</Label>
                                <Input
                                    id="year"
                                    type="number"
                                    min="1900"
                                    max={new Date().getFullYear()}
                                    value={year}
                                    onChange={(e) => setYear(e.target.value)}
                                    placeholder="Release year"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="genre">Genre</Label>
                                <Input
                                    id="genre"
                                    value={genre}
                                    onChange={(e) => setGenre(e.target.value)}
                                    placeholder="Genre"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="coverUrl">Cover Image URL</Label>
                            <Input
                                id="coverUrl"
                                value={coverUrl}
                                onChange={(e) => setCoverUrl(e.target.value)}
                                placeholder="https://example.com/cover.jpg"
                            />
                            <p className="text-xs text-muted-foreground">
                                Optional: Enter a URL for the song's cover image
                            </p>
                        </div>
                    </CardContent>

                    <CardFooter className="flex justify-between">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.push('/?tab=songs')}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting || artists.length === 0}>
                            {isSubmitting ? 'Adding...' : 'Add Song'}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}