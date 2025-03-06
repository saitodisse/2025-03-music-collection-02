'use client';

import { useRouter } from 'next/navigation';
import { useMusic } from '@/lib/context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { PlusCircle } from 'lucide-react';

export default function ArtistsPage() {
    const { artists } = useMusic();
    const router = useRouter();

    return (
        <div className="container mx-auto py-8 px-4">
            <header className="mb-8">
                <h1 className="text-4xl font-bold mb-2">Your Music Collection</h1>
                <p className="text-muted-foreground">Manage your favorite music in one place</p>
            </header>

            <div className="flex space-x-2 mb-6">
                <Button
                    variant="default"
                    onClick={() => router.push('/artists')}
                >
                    Artists
                </Button>
                <Button
                    variant="outline"
                    onClick={() => router.push('/songs')}
                >
                    Songs
                </Button>
                <Button
                    variant="outline"
                    onClick={() => router.push('/playlists')}
                >
                    Playlists
                </Button>
                <Button
                    variant="outline"
                    onClick={() => router.push('/import-export')}
                >
                    Import/Export
                </Button>
            </div>

            <div className="grid gap-6">
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-bold">Artists</h2>
                        <Button onClick={() => router.push('/artists/new')} size="sm">
                            <PlusCircle className="h-4 w-4 mr-2" />
                            Add Artist
                        </Button>
                    </div>

                    {artists.length === 0 ? (
                        <Card>
                            <CardContent className="pt-6">
                                <div className="text-center py-6">
                                    <p className="text-muted-foreground mb-4">No artists in your collection yet</p>
                                    <Button onClick={() => router.push('/artists/new')}>
                                        <PlusCircle className="h-4 w-4 mr-2" />
                                        Add Your First Artist
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {artists.map((artist) => (
                                <Link href={`/artists/${artist.id}`} key={artist.id}>
                                    <Card className="h-full cursor-pointer hover:bg-accent/50 transition-colors">
                                        <CardHeader>
                                            <CardTitle>{artist.name}</CardTitle>
                                        </CardHeader>
                                    </Card>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
} 