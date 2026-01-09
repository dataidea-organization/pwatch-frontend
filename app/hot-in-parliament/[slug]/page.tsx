'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { fetchHotInParliamentItem, HotInParliamentItem } from '@/lib/api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export default function HotInParliamentDetailPage() {
  const params = useParams();
  const [item, setItem] = useState<HotInParliamentItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (params.slug) {
      loadItem();
    }
  }, [params.slug]);

  const loadItem = async () => {
    try {
      setLoading(true);
      const data = await fetchHotInParliamentItem(params.slug as string);
      setItem(data);
      setError(null);
    } catch (err) {
      setError('Failed to load item. Please try again later.');
      console.error('Error fetching hot in parliament item:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f3eed4]">
        <main className="max-w-5xl mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-gray-600">Loading...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="min-h-screen bg-[#f3eed4]">
        <main className="max-w-5xl mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-red-600">{error || 'Item not found'}</p>
            <div className="mt-4 space-x-4">
              <button
                onClick={loadItem}
                className="bg-[#2d5016] text-white px-6 py-2 rounded-md hover:bg-[#1b3d26] transition-colors"
              >
                Try Again
              </button>
              <Link
                href="/"
                className="inline-block bg-[#d2c4b0] text-gray-700 px-6 py-2 rounded-md hover:bg-[#c4b5a0] transition-colors"
              >
                Back to Home
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f3eed4]">
      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center text-[#2d5016] hover:text-[#1b3d26] font-medium"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to Home
          </Link>
        </div>

        {/* Hot in Parliament Item */}
        <article className="bg-[#f3eed4] rounded-lg shadow-md overflow-hidden">
          {/* Header Image */}
          {item.image && (
            <div className="relative h-96 bg-[#d2c4b0]">
              <img
                src={item.image.startsWith('http') ? item.image : `${API_BASE_URL.replace('/api', '')}${item.image}`}
                alt={item.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Content */}
          <div className="p-8">
            {/* Date */}
            <div className="flex items-center justify-end mb-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <span>{formatDate(item.published_date)}</span>
              </div>
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {item.title}
            </h1>

            {/* Author */}
            <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-200">
              <div className="w-12 h-12 rounded-full bg-[#2d5016] flex items-center justify-center text-white font-semibold">
                {item.author.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-gray-900">{item.author}</p>
                <p className="text-sm text-gray-600">Author</p>
              </div>
            </div>

            {/* Content */}
            <div
              className="blog-content"
              dangerouslySetInnerHTML={{ __html: item.content }}
            />

            {/* External Link (if provided) */}
            {item.link_url && (
              <div className="mt-8 pt-6 border-t border-gray-200">
                <a
                  href={item.link_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-[#2d5016] hover:text-[#1b3d26] font-medium"
                >
                  <span>Read more</span>
                  <svg
                    className="w-5 h-5 ml-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                </a>
              </div>
            )}
          </div>
        </article>

        {/* Navigation */}
        <div className="mt-8 flex justify-center">
          <Link
            href="/"
            className="bg-[#2d5016] text-white px-8 py-3 rounded-md hover:bg-[#1b3d26] transition-colors font-medium"
          >
            Back to Home
          </Link>
        </div>
      </main>
    </div>
  );
}
