'use client';

import { useEffect, useState } from 'react';
import { useMusic } from '@/lib/context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

export default function Home() {
  const { loading, loadFromShareableUrl } = useMusic();
  const [activeTab, setActiveTab] = useState('artists');
  const searchParams = useSearchParams();

  useEffect(() => {
    const shareParam = searchParams.get('share');
    if (shareParam) {
      const loadSharedData = async () => {
        try {
          await loadFromShareableUrl(window.location.href);
          toast.success('Shared collection loaded successfully!');
        } catch (error) {
          toast.error('Failed to load shared collection');
        }
      };

      loadSharedData();
    }
  }, [searchParams, loadFromShareableUrl]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Loading your music collection...</h2>
          <p>Please wait while we set things up.</p>
        </div>
      </div>
    );
  }

  return (
    <main className="container mx-auto py-8 px-4">
      <header className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Your Music Collection</h1>
        <p className="text-muted-foreground">Manage your favorite music in one place</p>
      </header>

      <div className="flex space-x-2 mb-6">
        <Button
          variant={activeTab === 'artists' ? 'default' : 'outline'}
          onClick={() => setActiveTab('artists')}
        >
          Artists
        </Button>
        <Button
          variant={activeTab === 'songs' ? 'default' : 'outline'}
          onClick={() => setActiveTab('songs')}
        >
          Songs
        </Button>
        <Button
          variant={activeTab === 'playlists' ? 'default' : 'outline'}
          onClick={() => setActiveTab('playlists')}
        >
          Playlists
        </Button>
        <Button
          variant={activeTab === 'import-export' ? 'default' : 'outline'}
          onClick={() => setActiveTab('import-export')}
        >
          Import/Export
        </Button>
      </div>

      <div className="grid gap-6">
        {activeTab === 'artists' && <ArtistsTab />}
        {activeTab === 'songs' && <SongsTab />}
        {activeTab === 'playlists' && <PlaylistsTab />}
        {activeTab === 'import-export' && <ImportExportTab />}
      </div>
    </main>
  );
}

function ArtistsTab() {
  const { artists, addArtist } = useMusic();

  const handleAddArtist = () => {
    // This would typically be a form in a modal
    const name = prompt('Enter artist name:');
    if (name) {
      addArtist({ name })
        .then(() => toast.success(`Artist "${name}" added successfully!`))
        .catch(() => toast.error('Failed to add artist'));
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Artists</h2>
        <Button onClick={handleAddArtist}>Add Artist</Button>
      </div>

      {artists.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">No artists yet. Add your first artist to get started!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {artists.map(artist => (
            <Link href={`/artists/${artist.id}`} key={artist.id}>
              <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle>{artist.name}</CardTitle>
                  <CardDescription>
                    Added on {new Date(artist.createdAt).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                {artist.imageUrl && (
                  <CardContent>
                    <div className="aspect-square relative overflow-hidden rounded-md">
                      <img
                        src={artist.imageUrl}
                        alt={artist.name}
                        className="object-cover w-full h-full"
                      />
                    </div>
                  </CardContent>
                )}
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function SongsTab() {
  const { songs, artists, addSong } = useMusic();

  const handleAddSong = () => {
    // This would typically be a form in a modal
    const title = prompt('Enter song title:');
    if (!title) return;

    const artistId = prompt('Enter artist ID:');
    if (!artistId) return;

    const durationStr = prompt('Enter duration in seconds:');
    const duration = durationStr ? parseInt(durationStr, 10) : 0;

    addSong({ title, artistId, duration })
      .then(() => toast.success(`Song "${title}" added successfully!`))
      .catch(() => toast.error('Failed to add song'));
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

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Songs</h2>
        <Button onClick={handleAddSong}>Add Song</Button>
      </div>

      {songs.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">No songs yet. Add your first song to get started!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {songs.map(song => (
            <Link href={`/songs/${song.id}`} key={song.id}>
              <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle>{song.title}</CardTitle>
                  <CardDescription>
                    {getArtistName(song.artistId)}
                  </CardDescription>
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
                    <span>{formatDuration(song.duration)}</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function PlaylistsTab() {
  const { playlists, songs, addPlaylist } = useMusic();

  const handleAddPlaylist = () => {
    // This would typically be a form in a modal
    const name = prompt('Enter playlist name:');
    if (name) {
      addPlaylist({ name, songIds: [] })
        .then(() => toast.success(`Playlist "${name}" created successfully!`))
        .catch(() => toast.error('Failed to create playlist'));
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Playlists</h2>
        <Button onClick={handleAddPlaylist}>Create Playlist</Button>
      </div>

      {playlists.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">No playlists yet. Create your first playlist to get started!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {playlists.map(playlist => (
            <Link href={`/playlists/${playlist.id}`} key={playlist.id}>
              <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle>{playlist.name}</CardTitle>
                  <CardDescription>
                    {playlist.description || `Created on ${new Date(playlist.createdAt).toLocaleDateString()}`}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {playlist.songIds.length} {playlist.songIds.length === 1 ? 'song' : 'songs'}
                  </p>
                </CardContent>
                <CardFooter>
                  <div className="text-sm">
                    {playlist.songIds.length > 0
                      ? `Latest: ${songs.find(s => s.id === playlist.songIds[playlist.songIds.length - 1])?.title || 'Unknown song'}`
                      : 'No songs yet'}
                  </div>
                </CardFooter>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function ImportExportTab() {
  const { exportCollection, importCollection, generateShareableUrl } = useMusic();
  const [shareableUrl, setShareableUrl] = useState<string | null>(null);

  const handleExport = async () => {
    try {
      const data = await exportCollection();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = `music-collection-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success('Collection exported successfully!');
    } catch (error) {
      toast.error('Failed to export collection');
    }
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';

    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        const text = await file.text();
        await importCollection(text);
        toast.success('Collection imported successfully!');
      } catch (error) {
        toast.error('Failed to import collection');
      }
    };

    input.click();
  };

  const handleGenerateShareableUrl = async () => {
    try {
      const url = await generateShareableUrl();
      setShareableUrl(url);
      toast.success('Shareable URL generated!');
    } catch (error) {
      toast.error('Failed to generate shareable URL');
    }
  };

  const handleCopyUrl = () => {
    if (shareableUrl) {
      navigator.clipboard.writeText(shareableUrl);
      toast.success('URL copied to clipboard!');
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Import/Export</h2>

      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Export Collection</CardTitle>
            <CardDescription>
              Save your music collection as a JSON file
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={handleExport}>Export to File</Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Import Collection</CardTitle>
            <CardDescription>
              Load a previously exported collection
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={handleImport}>Import from File</Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Share Collection</CardTitle>
            <CardDescription>
              Generate a URL to share your collection with others
            </CardDescription>
          </CardHeader>
          <CardContent>
            {shareableUrl && (
              <div className="p-3 bg-muted rounded-md mb-3 break-all">
                <code className="text-sm">{shareableUrl}</code>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex gap-2">
            <Button onClick={handleGenerateShareableUrl}>Generate URL</Button>
            {shareableUrl && (
              <Button variant="outline" onClick={handleCopyUrl}>Copy URL</Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
