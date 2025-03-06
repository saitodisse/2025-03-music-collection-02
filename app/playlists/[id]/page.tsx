'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useMusic } from '@/lib/context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';
import Link from 'next/link';

export default function PlaylistDetail() {
    const params = useParams();
    const router = useRouter();
    const {
        getPlaylistById,
        deletePlaylist,
        updatePlaylist,
        removeSongFromPlaylist,
        songs,
        artists
    } = useMusic();

    const [playlist, setPlaylist] = useState<any>(null);
    const [playlistSongs, setPlaylistSongs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState('');
    const [editDescription, setEditDescription] = useState('');

    const playlistId = params.id as string;

    useEffect(() => {
        const loadPlaylist = async () => {
            try {
                const playlistData = await getPlaylistById(playlistId);
                if (playlistData) {
                    setPlaylist(playlistData);
                    setEditName(playlistData.name);
                    setEditDescription(playlistData.description || '');

                    // Get all songs in the playlist
                    const songsInPlaylist = songs.filter(song =>
                        playlistData.songIds.includes(song.id)
                    );
                    setPlaylistSongs(songsInPlaylist);
                } else {
                    toast.error('Playlist not found');
                    router.push('/');
                }
            } catch (error: any) {
                toast.error('Failed to load playlist');
                router.push('/');
            } finally {
                setLoading(false);
            }
        };

        loadPlaylist();
    }, [playlistId, getPlaylistById, songs, router]);

    const handleDelete = async () => {
        if (window.confirm(`Are you sure you want to delete "${playlist.name}"?`)) {
            try {
                await deletePlaylist(playlistId);
                toast.success('Playlist deleted successfully');
                router.push('/');
            } catch (error: any) {
                toast.error('Failed to delete playlist');
            }
        }
    };

    const handleSave = async () => {
        try {
            const updatedPlaylist = {
                ...playlist,
                name: editName,
                description: editDescription || undefined
            };

            await updatePlaylist(updatedPlaylist);
            setPlaylist(updatedPlaylist);
            setIsEditing(false);
            toast.success('Playlist updated successfully');
        } catch (error: any) {
            toast.error('Failed to update playlist');
        }
    };

    const handleRemoveSong = async (songId: string) => {
        try {
            const updatedPlaylist = await removeSongFromPlaylist(playlistId, songId);
            setPlaylist(updatedPlaylist);

            // Update the songs list
            setPlaylistSongs(playlistSongs.filter(song => song.id !== songId));
            toast.success('Song removed from playlist');
        } catch (error: any) {
            toast.error('Failed to remove song from playlist');
        }
    };

    // Helper function to get artist name by ID
    const getArtistName = (artistId: string) => {
        const artist = artists.find(a => a.id === artistId);
        return artist ? artist.name : 'Unknown Artist';
    };

    // Format duration as mm:ss
    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Calculate total duration of playlist
    const totalDuration = playlistSongs.reduce((total, song) => total + song.duration, 0);

    if (loading) {
        return (
            <div className="container mx-auto py-8 px-4">
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-4">Loading playlist...</h2>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8 px-4">
            <div className="mb-4">
                <Link href="/" className="text-blue-500 hover:underline">
                    &larr; Back to Collection
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1">
                    <Card>
                        <CardHeader>
                            {isEditing ? (
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Name</label>
                                        <input
                                            type="text"
                                            value={editName}
                                            onChange={(e) => setEditName(e.target.value)}
                                            className="w-full p-2 border rounded-md"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Description</label>
                                        <textarea
                                            value={editDescription}
                                            onChange={(e) => setEditDescription(e.target.value)}
                                            className="w-full p-2 border rounded-md"
                                            rows={3}
                                        />
                                    </div>
                                    <div className="flex gap-2">
                                        <Button onClick={handleSave}>Save</Button>
                                        <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <CardTitle className="text-2xl">{playlist.name}</CardTitle>
                                    {playlist.description && (
                                        <CardDescription className="mt-2">{playlist.description}</CardDescription>
                                    )}
                                    <div className="flex gap-2 mt-4">
                                        <Button variant="outline" onClick={() => setIsEditing(true)}>Edit</Button>
                                        <Button variant="destructive" onClick={handleDelete}>Delete</Button>
                                    </div>
                                </>
                            )}
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <p><span className="font-medium">Songs: </span>{playlistSongs.length}</p>
                                <p><span className="font-medium">Total Duration: </span>{formatDuration(totalDuration)}</p>
                                <p><span className="font-medium">Created on: </span>{new Date(playlist.createdAt).toLocaleDateString()}</p>
                                <p><span className="font-medium">Last updated: </span>{new Date(playlist.updatedAt).toLocaleDateString()}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="md:col-span-2">
                    <h2 className="text-2xl font-bold mb-4">Songs in Playlist</h2>

                    {playlistSongs.length === 0 ? (
                        <Card>
                            <CardContent className="pt-6">
                                <p className="text-center text-muted-foreground">No songs in this playlist yet.</p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="space-y-4">
                            {playlistSongs.map(song => (
                                <Card key={song.id} className="flex flex-col md:flex-row overflow-hidden">
                                    {song.coverUrl && (
                                        <div className="w-full md:w-24 h-24 flex-shrink-0">
                                            <img
                                                src={song.coverUrl}
                                                alt={song.title}
                                                className="object-cover w-full h-full"
                                            />
                                        </div>
                                    )}
                                    <div className="flex-grow p-4 flex flex-col md:flex-row justify-between items-start md:items-center">
                                        <div>
                                            <Link href={`/songs/${song.id}`} className="font-bold hover:underline">
                                                {song.title}
                                            </Link>
                                            <p className="text-sm text-muted-foreground">
                                                <Link href={`/artists/${song.artistId}`} className="hover:underline">
                                                    {getArtistName(song.artistId)}
                                                </Link>
                                                {song.genre && ` • ${song.genre}`}
                                                {song.year && ` • ${song.year}`}
                                            </p>
                                            <p className="text-sm">{formatDuration(song.duration)}</p>
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="mt-2 md:mt-0"
                                            onClick={() => handleRemoveSong(song.id)}
                                        >
                                            Remove
                                        </Button>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
} 