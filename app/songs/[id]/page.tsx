'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useMusic } from '@/lib/context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import Link from 'next/link';

export default function SongDetail() {
    const params = useParams();
    const router = useRouter();
    const { getSongById, getArtistById, deleteSong, updateSong, playlists } = useMusic();

    const [song, setSong] = useState<any>(null);
    const [artist, setArtist] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editTitle, setEditTitle] = useState('');
    const [editDuration, setEditDuration] = useState('');
    const [editYear, setEditYear] = useState('');
    const [editGenre, setEditGenre] = useState('');
    const [editCoverUrl, setEditCoverUrl] = useState('');

    const songId = params.id as string;

    useEffect(() => {
        const loadSong = async () => {
            try {
                const songData = await getSongById(songId);
                if (songData) {
                    setSong(songData);
                    setEditTitle(songData.title);
                    setEditDuration(songData.duration.toString());
                    setEditYear(songData.year?.toString() || '');
                    setEditGenre(songData.genre || '');
                    setEditCoverUrl(songData.coverUrl || '');

                    const artistData = await getArtistById(songData.artistId);
                    setArtist(artistData);
                } else {
                    toast.error('Song not found');
                    router.push('/');
                }
            } catch (error: any) {
                toast.error('Failed to load song');
                router.push('/');
            } finally {
                setLoading(false);
            }
        };

        loadSong();
    }, [songId, getSongById, getArtistById, router]);

    const handleDelete = async () => {
        if (window.confirm(`Are you sure you want to delete "${song.title}"?`)) {
            try {
                await deleteSong(songId);
                toast.success('Song deleted successfully');
                router.push('/');
            } catch (error: any) {
                toast.error('Failed to delete song');
            }
        }
    };

    const handleSave = async () => {
        try {
            const duration = parseInt(editDuration, 10);
            if (isNaN(duration) || duration < 0) {
                toast.error('Duration must be a positive number');
                return;
            }

            const year = editYear ? parseInt(editYear, 10) : undefined;
            if (year && (isNaN(year) || year < 0 || year > new Date().getFullYear())) {
                toast.error('Year must be a valid year');
                return;
            }

            const updatedSong = {
                ...song,
                title: editTitle,
                duration,
                year,
                genre: editGenre || undefined,
                coverUrl: editCoverUrl || undefined
            };

            await updateSong(updatedSong);
            setSong(updatedSong);
            setIsEditing(false);
            toast.success('Song updated successfully');
        } catch (error: any) {
            toast.error('Failed to update song');
        }
    };

    // Format duration as mm:ss
    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Find playlists that contain this song
    const songPlaylists = playlists.filter(playlist =>
        playlist.songIds.includes(songId)
    );

    if (loading) {
        return (
            <div className="container mx-auto py-8 px-4">
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-4">Loading song...</h2>
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
                                        <label className="block text-sm font-medium mb-1">Title</label>
                                        <input
                                            type="text"
                                            value={editTitle}
                                            onChange={(e) => setEditTitle(e.target.value)}
                                            className="w-full p-2 border rounded-md"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Duration (seconds)</label>
                                        <input
                                            type="number"
                                            value={editDuration}
                                            onChange={(e) => setEditDuration(e.target.value)}
                                            className="w-full p-2 border rounded-md"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Year</label>
                                        <input
                                            type="number"
                                            value={editYear}
                                            onChange={(e) => setEditYear(e.target.value)}
                                            className="w-full p-2 border rounded-md"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Genre</label>
                                        <input
                                            type="text"
                                            value={editGenre}
                                            onChange={(e) => setEditGenre(e.target.value)}
                                            className="w-full p-2 border rounded-md"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Cover URL</label>
                                        <input
                                            type="text"
                                            value={editCoverUrl}
                                            onChange={(e) => setEditCoverUrl(e.target.value)}
                                            className="w-full p-2 border rounded-md"
                                            placeholder="https://example.com/cover.jpg"
                                        />
                                    </div>
                                    <div className="flex gap-2">
                                        <Button onClick={handleSave}>Save</Button>
                                        <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <CardTitle className="text-2xl">{song.title}</CardTitle>
                                    <div className="flex gap-2 mt-4">
                                        <Button variant="outline" onClick={() => setIsEditing(true)}>Edit</Button>
                                        <Button variant="destructive" onClick={handleDelete}>Delete</Button>
                                    </div>
                                </>
                            )}
                        </CardHeader>
                        <CardContent>
                            {song.coverUrl && (
                                <div className="aspect-square relative overflow-hidden rounded-md mb-4">
                                    <img
                                        src={song.coverUrl}
                                        alt={song.title}
                                        className="object-cover w-full h-full"
                                    />
                                </div>
                            )}
                            <div className="space-y-2">
                                <p>
                                    <span className="font-medium">Artist: </span>
                                    {artist ? (
                                        <Link href={`/artists/${artist.id}`} className="text-blue-500 hover:underline">
                                            {artist.name}
                                        </Link>
                                    ) : 'Unknown Artist'}
                                </p>
                                <p><span className="font-medium">Duration: </span>{formatDuration(song.duration)}</p>
                                {song.year && <p><span className="font-medium">Year: </span>{song.year}</p>}
                                {song.genre && <p><span className="font-medium">Genre: </span>{song.genre}</p>}
                                <p><span className="font-medium">Added on: </span>{new Date(song.createdAt).toLocaleDateString()}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="md:col-span-2">
                    <h2 className="text-2xl font-bold mb-4">Playlists with this song</h2>

                    {songPlaylists.length === 0 ? (
                        <Card>
                            <CardContent className="pt-6">
                                <p className="text-center text-muted-foreground">This song is not in any playlist yet.</p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {songPlaylists.map(playlist => (
                                <Link href={`/playlists/${playlist.id}`} key={playlist.id}>
                                    <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
                                        <CardHeader>
                                            <CardTitle>{playlist.name}</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-sm text-muted-foreground">
                                                {playlist.songIds.length} {playlist.songIds.length === 1 ? 'song' : 'songs'} in playlist
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