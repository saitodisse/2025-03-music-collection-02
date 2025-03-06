'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMusic } from '@/lib/context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Copy, Download, Upload } from 'lucide-react';

export default function ImportExportPage() {
    const router = useRouter();
    const { exportCollection, importCollection, generateShareableUrl } = useMusic();
    const [importData, setImportData] = useState('');
    const [shareableUrl, setShareableUrl] = useState('');
    const [isGeneratingUrl, setIsGeneratingUrl] = useState(false);

    const handleExport = async () => {
        try {
            const jsonData = await exportCollection();

            // Create a blob and download it
            const blob = new Blob([jsonData], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `music-collection-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            toast.success('Collection exported successfully!');
        } catch (error: any) {
            toast.error('Failed to export collection');
        }
    };

    const handleImport = () => {
        if (!importData.trim()) {
            toast.error('Please paste your exported collection data');
            return;
        }

        try {
            // Validate JSON
            JSON.parse(importData);

            // Import the data
            importCollection(importData)
                .then(() => {
                    toast.success('Collection imported successfully!');
                    setImportData('');
                })
                .catch(() => {
                    toast.error('Failed to import collection. Invalid data format.');
                });
        } catch (error: any) {
            toast.error('Invalid JSON data. Please check your input.');
        }
    };

    const handleGenerateShareableUrl = async () => {
        setIsGeneratingUrl(true);
        try {
            const url = await generateShareableUrl();
            setShareableUrl(url);
            toast.success('Shareable URL generated!');
        } catch (error: any) {
            toast.error('Failed to generate shareable URL');
        } finally {
            setIsGeneratingUrl(false);
        }
    };

    const handleCopyUrl = () => {
        if (shareableUrl) {
            navigator.clipboard.writeText(shareableUrl)
                .then(() => toast.success('URL copied to clipboard!'))
                .catch(() => toast.error('Failed to copy URL'));
        }
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
                    variant="outline"
                    onClick={() => router.push('/playlists')}
                >
                    Playlists
                </Button>
                <Button
                    variant="default"
                    onClick={() => router.push('/import-export')}
                >
                    Import/Export
                </Button>
            </div>

            <div className="grid gap-6">
                <div className="grid md:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Export Collection</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground mb-4">
                                Export your entire music collection as a JSON file that you can save as a backup or import later.
                            </p>
                            <Button onClick={handleExport} className="w-full">
                                <Download className="mr-2 h-4 w-4" />
                                Export Collection
                            </Button>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Import Collection</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-sm text-muted-foreground">
                                Paste your previously exported JSON data to restore your collection.
                                <strong className="block mt-1 text-foreground">Warning: This will replace your current collection!</strong>
                            </p>
                            <div className="space-y-2">
                                <Label htmlFor="importData">JSON Data</Label>
                                <Textarea
                                    id="importData"
                                    value={importData}
                                    onChange={(e) => setImportData(e.target.value)}
                                    placeholder='Paste your exported JSON data here...'
                                    className="min-h-[150px]"
                                />
                            </div>
                            <Button onClick={handleImport} className="w-full">
                                <Upload className="mr-2 h-4 w-4" />
                                Import Collection
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Share Collection</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                            Generate a shareable URL that contains your entire collection. Anyone with this URL can import your collection.
                        </p>
                        <Button
                            onClick={handleGenerateShareableUrl}
                            className="w-full"
                            disabled={isGeneratingUrl}
                        >
                            {isGeneratingUrl ? 'Generating...' : 'Generate Shareable URL'}
                        </Button>

                        {shareableUrl && (
                            <div className="space-y-2 mt-4">
                                <Label htmlFor="shareableUrl">Shareable URL</Label>
                                <div className="flex">
                                    <Input
                                        id="shareableUrl"
                                        value={shareableUrl}
                                        readOnly
                                        className="flex-1 rounded-r-none"
                                    />
                                    <Button
                                        onClick={handleCopyUrl}
                                        variant="secondary"
                                        className="rounded-l-none"
                                    >
                                        <Copy className="h-4 w-4" />
                                    </Button>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    This URL contains your entire collection data. Share it carefully.
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
} 