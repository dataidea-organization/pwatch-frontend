'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function TriviaRedirectPage() {
  const params = useParams();
  const router = useRouter();
  const id = (params?.id as string) ?? '';

  useEffect(() => {
    if (!id) return;
    router.replace(`/citizens-voice/trivia?trivia=${encodeURIComponent(id)}`);
  }, [id, router]);

  if (!id) {
    return (
      <div className="min-h-screen bg-[#f5f0e8] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <p className="text-red-700 mb-4">Invalid trivia link</p>
          <Link href="/citizens-voice/trivia">
            <Button variant="outline">Back to Citizens Voice</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f0e8] flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#2d5016]" />
        <p className="mt-4 text-gray-600">Opening trivia...</p>
      </div>
    </div>
  );
}
