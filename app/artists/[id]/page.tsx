'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useMusic } from '@/lib/context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import Link from 'next/link';

export default function ArtistDetail() {
    const params = useParams();
    const router = useRouter();
    const { getArtistById, getSongsByArtist, deleteArtist, updateArtist } = useMusic();

    const [artist, setArtist] = useState<any>(null);
    const [songs, setSongs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState('');
    const [editImageUrl, setEditImageUrl] = useState('');

    const artistId = params.id as string;

    useEffect(() => {
        const loadArtist = async () => {
            try {
                const artistData = await getArtistById(artistId);
                if (artistData) {
                    setArtist(artistData);
                    setEditName(artistData.name);
                    setEditImageUrl(artistData.imageUrl || '');

                    const artistSongs = getSongsByArtist(artistId);
                    setSongs(artistSongs);
                } else {
                    toast.error('Artist not found');
                    router.push('/');
                }
            } catch (error) {
                toast.error('Failed to load artist');
                router.push('/');
            } finally {
                setLoading(false);
            }
        };

        loadArtist();
    }, [artistId, getArtistById, getSongsByArtist, router]);

    const handleDelete = async () => {
        if (window.confirm(`Are you sure you want to delete ${artist.name}? This will also delete all songs by this artist.`)) {
            try {
                await deleteArtist(artistId);
                toast.success('Artist deleted successfully');
                router.push('/');
            } catch (error) {
                toast.error('Failed to delete artist');
            }
        }
    };

    const handleSave = async () => {
        try {
            const updatedArtist = {
                ...artist,
                name: editName,
                imageUrl: editImageUrl || undefined
            };

            await updateArtist(updatedArtist);
            setArtist(updatedArtist);
            setIsEditing(false);
            toast.success('Artist updated successfully');
        } catch (error) {
            toast.error('Failed to update artist');
        }
    };

    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString();
    };

    if (loading) {
        return (
            <div className="container mx-auto py-8 px-4">
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-4">Loading artist...</h2>
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
                                        <label className="block text-sm font-medium mb-1">Image URL</label>
                                        <input
                                            type="text"
                                            value={editImageUrl}
                                            onChange={(e) => setEditImageUrl(e.target.value)}
                                            className="w-full p-2 border rounded-md"
                                            placeholder="https://example.com/image.jpg"
                                        />
                                    </div>
                                    <div className="flex gap-2">
                                        <Button onClick={handleSave}>Save</Button>
                                        <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <CardTitle className="text-2xl">{artist.name}</CardTitle>
                                    <div className="flex gap-2 mt-4">
                                        <Button variant="outline" onClick={() => setIsEditing(true)}>Edit</Button>
                                        <Button variant="destructive" onClick={handleDelete}>Delete</Button>
                                    </div>
                                </>
                            )}
                        </CardHeader>
                        <CardContent>
                            {artist.imageUrl && (
                                <div className="aspect-square relative overflow-hidden rounded-md mb-4">
                                    <img
                                        src={artist.imageUrl}
                                        alt={artist.name}
                                        className="object-cover w-full h-full"
                                    />
                                </div>
                            )}
                            <div className="text-sm text-muted-foreground">
                                <p>Added on {formatDate(artist.createdAt)}</p>
                                <p>Last updated on {formatDate(artist.updatedAt)}</p>
                                <p className="mt-2">{songs.length} songs in collection</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="md:col-span-2">
                    <h2 className="text-2xl font-bold mb-4">Songs by {artist.name}</h2>

                    {songs.length === 0 ? (
                        <Card>
                            <CardContent className="pt-6">
                                <p className="text-center text-muted-foreground">No songs yet for this artist.</p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {songs.map(song => (
                                <Link href={`/songs/${song.id}`} key={song.id}>
                                    <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
                                        <CardHeader>
                                            <CardTitle>{song.title}</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            {song.coverUrl && (
                                                <div className="aspect-square relative overflow-hidden rounded-md mb-3">
                                                    <img
                                                        src={song.coverUrl}
                                                        alt={song.title}
                                                        className="object-cover w-full h-full"
                                                    />
                                                </div>
                                            )}
                                            <div className="flex justify-between text-sm">
                                                <span>{song.genre || 'No genre'}</span>
                                                <span>
                                                    {Math.floor(song.duration / 60)}:
                                                    {(song.duration % 60).toString().padStart(2, '0')}
                                                </span>
                                            </div>
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