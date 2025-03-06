'use client';

import { useRouter } from 'next/navigation';
import { useMusic } from '@/lib/context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { PlusCircle } from 'lucide-react';

export default function PlaylistsPage() {
    const { playlists, songs } = useMusic();
    const router = useRouter();

    const getPlaylistDuration = (songIds: string[]) => {
        const totalSeconds = songIds.reduce((total, songId) => {
            const song = songs.find((s) => s.id === songId);
            return total + (song ? song.duration : 0);
        }, 0);

        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);

        if (hours > 0) {
            return `${hours} hr ${minutes} min`;
        }
        return `${minutes} min`;
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
                    variant="outline"
                    onClick={() => router.push('/songs')}
                >
                    Songs
                </Button>
                <Button
                    variant="default"
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
                        <h2 className="text-2xl font-bold">Playlists</h2>
                        <Button onClick={() => router.push('/playlists/new')} size="sm">
                            <PlusCircle className="h-4 w-4 mr-2" />
                            Create Playlist
                        </Button>
                    </div>

                    {playlists.length === 0 ? (
                        <Card>
                            <CardContent className="pt-6">
                                <div className="text-center py-6">
                                    <p className="text-muted-foreground mb-4">No playlists in your collection yet</p>
                                    <Button onClick={() => router.push('/playlists/new')}>
                                        <PlusCircle className="h-4 w-4 mr-2" />
                                        Create Your First Playlist
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {playlists.map((playlist) => (
                                <Link href={`/playlists/${playlist.id}`} key={playlist.id}>
                                    <Card className="h-full cursor-pointer hover:bg-accent/50 transition-colors">
                                        <CardHeader>
                                            <CardTitle>{playlist.name}</CardTitle>
                                            <CardDescription>
                                                {playlist.songIds.length} {playlist.songIds.length === 1 ? 'song' : 'songs'} • {getPlaylistDuration(playlist.songIds)}
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-sm text-muted-foreground line-clamp-2">
                                                {playlist.description || 'No description'}
                                            </p>
                                        </CardContent>
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