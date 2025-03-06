'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
    Artist,
    Song,
    Playlist,
    getAllItems,
    addItem,
    updateItem,
    deleteItem,
    getItemById,
    generateId,
    exportData,
    importData
} from './db';

interface MusicContextType {
    // Data
    artists: Artist[];
    songs: Song[];
    playlists: Playlist[];
    loading: boolean;

    // Artist operations
    addArtist: (artist: Omit<Artist, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Artist>;
    updateArtist: (artist: Artist) => Promise<Artist>;
    deleteArtist: (id: string) => Promise<void>;
    getArtistById: (id: string) => Promise<Artist | null>;

    // Song operations
    addSong: (song: Omit<Song, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Song>;
    updateSong: (song: Song) => Promise<Song>;
    deleteSong: (id: string) => Promise<void>;
    getSongById: (id: string) => Promise<Song | null>;
    getSongsByArtist: (artistId: string) => Song[];

    // Playlist operations
    addPlaylist: (playlist: Omit<Playlist, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Playlist>;
    updatePlaylist: (playlist: Playlist) => Promise<Playlist>;
    deletePlaylist: (id: string) => Promise<void>;
    getPlaylistById: (id: string) => Promise<Playlist | null>;
    addSongToPlaylist: (playlistId: string, songId: string) => Promise<Playlist>;
    removeSongFromPlaylist: (playlistId: string, songId: string) => Promise<Playlist>;

    // Import/Export
    exportCollection: () => Promise<string>;
    importCollection: (jsonData: string) => Promise<void>;
    generateShareableUrl: () => Promise<string>;
    loadFromShareableUrl: (url: string) => Promise<void>;
}

const MusicContext = createContext<MusicContextType | undefined>(undefined);

export const MusicProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [artists, setArtists] = useState<Artist[]>([]);
    const [songs, setSongs] = useState<Song[]>([]);
    const [playlists, setPlaylists] = useState<Playlist[]>([]);
    const [loading, setLoading] = useState(true);

    // Load initial data
    useEffect(() => {
        const loadData = async () => {
            try {
                const artistsData = await getAllItems<Artist>('artists');
                const songsData = await getAllItems<Song>('songs');
                const playlistsData = await getAllItems<Playlist>('playlists');

                setArtists(artistsData);
                setSongs(songsData);
                setPlaylists(playlistsData);
            } catch (error: any) {
                console.error('Failed to load data:', error);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    // Artist operations
    const addArtist = async (artistData: Omit<Artist, 'id' | 'createdAt' | 'updatedAt'>): Promise<Artist> => {
        const now = new Date();
        const newArtist: Artist = {
            ...artistData,
            id: generateId(),
            createdAt: now,
            updatedAt: now
        };

        const result = await addItem<Artist>('artists', newArtist);
        setArtists(prev => [...prev, result]);
        return result;
    };

    const updateArtist = async (artist: Artist): Promise<Artist> => {
        const updatedArtist = {
            ...artist,
            updatedAt: new Date()
        };

        const result = await updateItem<Artist>('artists', updatedArtist);
        setArtists(prev => prev.map(a => a.id === result.id ? result : a));
        return result;
    };

    const deleteArtist = async (id: string): Promise<void> => {
        await deleteItem('artists', id);
        setArtists(prev => prev.filter(a => a.id !== id));

        // Also delete all songs by this artist
        const artistSongs = songs.filter(s => s.artistId === id);
        for (const song of artistSongs) {
            await deleteSong(song.id);
        }
    };

    const getArtistById = async (id: string): Promise<Artist | null> => {
        return await getItemById<Artist>('artists', id);
    };

    // Song operations
    const addSong = async (songData: Omit<Song, 'id' | 'createdAt' | 'updatedAt'>): Promise<Song> => {
        const now = new Date();
        const newSong: Song = {
            ...songData,
            id: generateId(),
            createdAt: now,
            updatedAt: now
        };

        const result = await addItem<Song>('songs', newSong);
        setSongs(prev => [...prev, result]);
        return result;
    };

    const updateSong = async (song: Song): Promise<Song> => {
        const updatedSong = {
            ...song,
            updatedAt: new Date()
        };

        const result = await updateItem<Song>('songs', updatedSong);
        setSongs(prev => prev.map(s => s.id === result.id ? result : s));
        return result;
    };

    const deleteSong = async (id: string): Promise<void> => {
        await deleteItem('songs', id);
        setSongs(prev => prev.filter(s => s.id !== id));

        // Also remove this song from all playlists
        const updatedPlaylists = playlists.map(playlist => {
            if (playlist.songIds.includes(id)) {
                return {
                    ...playlist,
                    songIds: playlist.songIds.filter(songId => songId !== id),
                    updatedAt: new Date()
                };
            }
            return playlist;
        });

        for (const playlist of updatedPlaylists) {
            if (playlist.songIds.length !== playlists.find(p => p.id === playlist.id)?.songIds.length) {
                await updateItem<Playlist>('playlists', playlist);
            }
        }

        setPlaylists(updatedPlaylists);
    };

    const getSongById = async (id: string): Promise<Song | null> => {
        return await getItemById<Song>('songs', id);
    };

    const getSongsByArtist = (artistId: string): Song[] => {
        return songs.filter(song => song.artistId === artistId);
    };

    // Playlist operations
    const addPlaylist = async (playlistData: Omit<Playlist, 'id' | 'createdAt' | 'updatedAt'>): Promise<Playlist> => {
        const now = new Date();
        const newPlaylist: Playlist = {
            ...playlistData,
            id: generateId(),
            createdAt: now,
            updatedAt: now
        };

        const result = await addItem<Playlist>('playlists', newPlaylist);
        setPlaylists(prev => [...prev, result]);
        return result;
    };

    const updatePlaylist = async (playlist: Playlist): Promise<Playlist> => {
        const updatedPlaylist = {
            ...playlist,
            updatedAt: new Date()
        };

        const result = await updateItem<Playlist>('playlists', updatedPlaylist);
        setPlaylists(prev => prev.map(p => p.id === result.id ? result : p));
        return result;
    };

    const deletePlaylist = async (id: string): Promise<void> => {
        await deleteItem('playlists', id);
        setPlaylists(prev => prev.filter(p => p.id !== id));
    };

    const getPlaylistById = async (id: string): Promise<Playlist | null> => {
        return await getItemById<Playlist>('playlists', id);
    };

    const addSongToPlaylist = async (playlistId: string, songId: string): Promise<Playlist> => {
        const playlist = await getPlaylistById(playlistId);
        if (!playlist) throw new Error('Playlist not found');

        if (playlist.songIds.includes(songId)) {
            return playlist; // Song already in playlist
        }

        const updatedPlaylist: Playlist = {
            ...playlist,
            songIds: [...playlist.songIds, songId],
            updatedAt: new Date()
        };

        const result = await updateItem<Playlist>('playlists', updatedPlaylist);
        setPlaylists(prev => prev.map(p => p.id === result.id ? result : p));
        return result;
    };

    const removeSongFromPlaylist = async (playlistId: string, songId: string): Promise<Playlist> => {
        const playlist = await getPlaylistById(playlistId);
        if (!playlist) throw new Error('Playlist not found');

        const updatedPlaylist: Playlist = {
            ...playlist,
            songIds: playlist.songIds.filter(id => id !== songId),
            updatedAt: new Date()
        };

        const result = await updateItem<Playlist>('playlists', updatedPlaylist);
        setPlaylists(prev => prev.map(p => p.id === result.id ? result : p));
        return result;
    };

    // Import/Export
    const exportCollection = async (): Promise<string> => {
        return await exportData();
    };

    const importCollection = async (jsonData: string): Promise<void> => {
        await importData(jsonData);

        // Refresh data after import
        const artistsData = await getAllItems<Artist>('artists');
        const songsData = await getAllItems<Song>('songs');
        const playlistsData = await getAllItems<Playlist>('playlists');

        setArtists(artistsData);
        setSongs(songsData);
        setPlaylists(playlistsData);
    };

    const generateShareableUrl = async (): Promise<string> => {
        const data = await exportData();
        const compressed = btoa(encodeURIComponent(data));
        return `${window.location.origin}?share=${compressed}`;
    };

    const loadFromShareableUrl = async (url: string): Promise<void> => {
        try {
            const urlObj = new URL(url);
            const shareParam = urlObj.searchParams.get('share');

            if (shareParam) {
                const jsonData = decodeURIComponent(atob(shareParam));
                await importCollection(jsonData);
            }
        } catch (error: any) {
            console.error('Failed to load from URL:', error);
            throw new Error('Invalid share URL');
        }
    };

    const value = {
        artists,
        songs,
        playlists,
        loading,
        addArtist,
        updateArtist,
        deleteArtist,
        getArtistById,
        addSong,
        updateSong,
        deleteSong,
        getSongById,
        getSongsByArtist,
        addPlaylist,
        updatePlaylist,
        deletePlaylist,
        getPlaylistById,
        addSongToPlaylist,
        removeSongFromPlaylist,
        exportCollection,
        importCollection,
        generateShareableUrl,
        loadFromShareableUrl
    };

    return (
        <MusicContext.Provider value={value}>
            {children}
        </MusicContext.Provider>
    );
};

export const useMusic = (): MusicContextType => {
    const context = useContext(MusicContext);
    if (context === undefined) {
        throw new Error('useMusic must be used within a MusicProvider');
    }
    return context;
}; 