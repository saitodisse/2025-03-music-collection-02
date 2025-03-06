'use client';

import { useRouter } from 'next/navigation';
import { useMusic } from '@/lib/context';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { PlusCircle } from 'lucide-react';

export default function SongsPage() {
    const { songs, artists } = useMusic();
    const router = useRouter();

    const getArtistName = (artistId: string) => {
        const artist = artists.find((a) => a.id === artistId);
        return artist ? artist.name : 'Unknown Artist';
    };

    const formatDuration = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    return (
        <div className="container mx-auto py-8 px-4">
            <header className="mb-8">
                <h1 className="text-4xl font-bold mb-2">Your Music Collection</h1>
                <p className="text-muted-foreground">Manage your favorite music in one place</p>
            </header>

            <div className="flex space-x-2 mb-6">
                <Button
                    variant="outline"
                    onClick={() => router.push('/artists')}
                >
                    Artists
                </Button>
                <Button
                    variant="default"
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
                        <h2 className="text-2xl font-bold">Songs</h2>
                        <Button onClick={() => router.push('/songs/new')} size="sm">
                            <PlusCircle className="h-4 w-4 mr-2" />
                            Add Song
                        </Button>
                    </div>

                    {songs.length === 0 ? (
                        <Card>
                            <CardContent className="pt-6">
                                <div className="text-center py-6">
                                    <p className="text-muted-foreground mb-4">No songs in your collection yet</p>
                                    <Button onClick={() => router.push('/songs/new')}>
                                        <PlusCircle className="h-4 w-4 mr-2" />
                                        Add Your First Song
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <Card>
                            <CardContent className="p-0">
                                <div className="rounded-md border">
                                    <div className="grid grid-cols-12 p-4 bg-muted/50 font-medium">
                                        <div className="col-span-5">Title</div>
                                        <div className="col-span-4">Artist</div>
                                        <div className="col-span-2">Duration</div>
                                        <div className="col-span-1">Year</div>
                                    </div>
                                    <div className="divide-y">
                                        {songs.map((song) => (
                                            <Link href={`/songs/${song.id}`} key={song.id} className="block hover:bg-accent/50 transition-colors">
                                                <div className="grid grid-cols-12 p-4 items-center">
                                                    <div className="col-span-5 font-medium">{song.title}</div>
                                                    <div className="col-span-4 text-muted-foreground">{getArtistName(song.artistId)}</div>
                                                    <div className="col-span-2 text-muted-foreground">{formatDuration(song.duration)}</div>
                                                    <div className="col-span-1 text-muted-foreground">{song.year || '-'}</div>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
} 