// Database schema and types
export interface Artist {
  id: string;
  name: string;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Song {
  id: string;
  title: string;
  artistId: string;
  duration: number; // in seconds
  year?: number;
  genre?: string;
  coverUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Playlist {
  id: string;
  name: string;
  description?: string;
  songIds: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Database version
const DB_VERSION = 1;
const DB_NAME = 'MusicCollectionDB';

// Database initialization
export const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => {
      reject('Database error: ' + (event.target as IDBOpenDBRequest).error);
    };

    request.onsuccess = (event) => {
      resolve((event.target as IDBOpenDBRequest).result);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Create object stores with indices
      if (!db.objectStoreNames.contains('artists')) {
        const artistStore = db.createObjectStore('artists', { keyPath: 'id' });
        artistStore.createIndex('name', 'name', { unique: false });
      }

      if (!db.objectStoreNames.contains('songs')) {
        const songStore = db.createObjectStore('songs', { keyPath: 'id' });
        songStore.createIndex('title', 'title', { unique: false });
        songStore.createIndex('artistId', 'artistId', { unique: false });
      }

      if (!db.objectStoreNames.contains('playlists')) {
        const playlistStore = db.createObjectStore('playlists', { keyPath: 'id' });
        playlistStore.createIndex('name', 'name', { unique: false });
      }
    };
  });
};

// Generic database operations
export const getDB = async (): Promise<IDBDatabase> => {
  return await initDB();
};

// Generic add item to store
export const addItem = async <T>(storeName: string, item: T): Promise<T> => {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.add(item);

    request.onsuccess = () => resolve(item);
    request.onerror = () => reject(request.error);
    
    transaction.oncomplete = () => db.close();
  });
};

// Generic update item in store
export const updateItem = async <T>(storeName: string, item: T): Promise<T> => {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.put(item);

    request.onsuccess = () => resolve(item);
    request.onerror = () => reject(request.error);
    
    transaction.oncomplete = () => db.close();
  });
};

// Generic delete item from store
export const deleteItem = async (storeName: string, id: string): Promise<void> => {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
    
    transaction.oncomplete = () => db.close();
  });
};

// Generic get all items from store
export const getAllItems = async <T>(storeName: string): Promise<T[]> => {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result as T[]);
    request.onerror = () => reject(request.error);
    
    transaction.oncomplete = () => db.close();
  });
};

// Generic get item by id
export const getItemById = async <T>(storeName: string, id: string): Promise<T | null> => {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.get(id);

    request.onsuccess = () => resolve(request.result as T || null);
    request.onerror = () => reject(request.error);
    
    transaction.oncomplete = () => db.close();
  });
};

// Export data
export const exportData = async (): Promise<string> => {
  const artists = await getAllItems<Artist>('artists');
  const songs = await getAllItems<Song>('songs');
  const playlists = await getAllItems<Playlist>('playlists');

  const data = {
    artists,
    songs,
    playlists,
    exportedAt: new Date()
  };

  return JSON.stringify(data);
};

// Import data
export const importData = async (jsonData: string): Promise<void> => {
  try {
    const data = JSON.parse(jsonData);
    const db = await getDB();
    const transaction = db.transaction(['artists', 'songs', 'playlists'], 'readwrite');
    
    // Clear existing data
    transaction.objectStore('artists').clear();
    transaction.objectStore('songs').clear();
    transaction.objectStore('playlists').clear();
    
    // Add imported data
    if (data.artists) {
      const artistStore = transaction.objectStore('artists');
      data.artists.forEach((artist: Artist) => {
        artistStore.add(artist);
      });
    }
    
    if (data.songs) {
      const songStore = transaction.objectStore('songs');
      data.songs.forEach((song: Song) => {
        songStore.add(song);
      });
    }
    
    if (data.playlists) {
      const playlistStore = transaction.objectStore('playlists');
      data.playlists.forEach((playlist: Playlist) => {
        playlistStore.add(playlist);
      });
    }
    
    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => {
        db.close();
        resolve();
      };
      transaction.onerror = () => reject(transaction.error);
    });
  } catch (error) {
    throw new Error(`Import failed: ${error}`);
  }
};

// Generate a unique ID
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}; 