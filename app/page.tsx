'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useMusic } from '@/lib/context';
import { toast } from 'sonner';

export default function Home() {
  const { loading, loadFromShareableUrl } = useMusic();
  const router = useRouter();

  useEffect(() => {
    // Check for share parameter
    const url = new URL(window.location.href);
    const shareParam = url.searchParams.get('share');

    if (shareParam) {
      const loadSharedData = async () => {
        try {
          await loadFromShareableUrl(window.location.href);
          toast.success('Shared collection loaded successfully!');
          // Redirect to artists page after loading shared data
          router.push('/artists');
        } catch (error: any) {
          toast.error('Failed to load shared collection');
          // Redirect to artists page even if loading fails
          router.push('/artists');
        }
      };

      loadSharedData();
    } else {
      // Redirect to artists page by default
      router.push('/artists');
    }
  }, [router, loadFromShareableUrl]);

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

  return null; // This won't render as we're redirecting
}
