# Music Collection App

A web application for managing your personal music collection. Built with
Next.js 15.2, React 19, TailwindCSS, and shadcn UI components.

## Features

- **Manage Artists**: Add, edit, and delete artists in your collection
- **Manage Songs**: Add, edit, and delete songs with details like duration,
  year, and genre
- **Create Playlists**: Organize your songs into custom playlists
- **Import/Export**: Save and load your collection data
- **Share Collection**: Generate shareable URLs to share your collection with
  others
- **Offline Support**: All data is stored locally in your browser using
  IndexedDB

## Technology Stack

- **Next.js 15.2**: React framework with App Router
- **React 19**: UI library
- **TailwindCSS**: Utility-first CSS framework
- **shadcn/ui**: High-quality UI components
- **IndexedDB**: Browser-based database for offline storage

## Getting Started

### Prerequisites

- Node.js 18.17 or later

### Installation

1. Clone the repository

```bash
git clone https://github.com/yourusername/music-collection-app.git
cd music-collection-app
```

2. Install dependencies

```bash
npm install
```

3. Run the development server

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

### Adding Artists

1. Navigate to the "Artists" tab
2. Click "Add Artist"
3. Enter the artist's name and optionally an image URL

### Adding Songs

1. Navigate to the "Songs" tab
2. Click "Add Song"
3. Enter the song details including title, artist, and duration

### Creating Playlists

1. Navigate to the "Playlists" tab
2. Click "Create Playlist"
3. Enter a name and optional description for your playlist
4. Add songs to your playlist from the song detail pages

### Importing/Exporting Data

1. Navigate to the "Import/Export" tab
2. Use "Export to File" to save your collection
3. Use "Import from File" to load a previously exported collection
4. Use "Generate URL" to create a shareable link to your collection

## License

This project is licensed under the MIT License - see the LICENSE file for
details.

## Acknowledgments

- [Next.js](https://nextjs.org/)
- [React](https://reactjs.org/)
- [TailwindCSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
