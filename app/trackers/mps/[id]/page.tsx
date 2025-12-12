'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import { fetchMP, MPDetail } from '@/lib/api';

export default function MPDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [mp, setMp] = useState<MPDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (params.id) {
      loadMP();
    }
  }, [params.id]);

  const loadMP = async () => {
    try {
      setLoading(true);
      const data = await fetchMP(params.id as string);
      setMp(data);
      setError(null);
    } catch (err) {
      setError('Failed to load MP details. Please try again later.');
      console.error('Error fetching MP:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-5xl mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-gray-600">Loading MP details...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error || !mp) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-5xl mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-red-600">{error || 'MP not found'}</p>
            <div className="mt-4 space-x-4">
              <button
                onClick={loadMP}
                className="bg-[#085e29] text-white px-6 py-2 rounded-md hover:bg-[#064920] transition-colors"
              >
                Try Again
              </button>
              <Link
                href="/trackers/mps"
                className="inline-block bg-gray-200 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-300 transition-colors"
              >
                Back to MPs
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Link
            href="/trackers/mps"
            className="inline-flex items-center text-[#085e29] hover:text-[#064920] font-medium"
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
            Back to All MPs
          </Link>
        </div>

        {/* MP Profile Card */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Header Section with Photo */}
          <div className="bg-gradient-to-r from-[#085e29] to-[#064920] p-8 text-white">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              {/* Photo */}
              <div className="w-32 h-32 rounded-full bg-white/20 flex items-center justify-center text-4xl font-bold overflow-hidden border-4 border-white">
                {mp.photo ? (
                  <img
                    src={mp.photo}
                    alt={mp.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>
                    {mp.first_name[0]}
                    {mp.last_name[0]}
                  </span>
                )}
              </div>

              {/* Name and Basic Info */}
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-3xl md:text-4xl font-bold mb-2">{mp.name}</h1>
                <div className="flex flex-wrap gap-2 justify-center md:justify-start mb-4">
                  <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium">
                    {mp.party}
                  </span>
                </div>
                <div className="space-y-2 text-white/90">
                  <p className="flex items-center justify-center md:justify-start gap-2">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    <span className="font-medium">{mp.constituency}</span>
                  </p>
                  <p className="text-sm">{mp.district} District</p>
                </div>
              </div>
            </div>
          </div>

          {/* Details Section */}
          <div className="p-8">
            {/* Contact Information */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Contact Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {mp.email && (
                  <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                    <svg
                      className="w-6 h-6 text-[#085e29] flex-shrink-0 mt-0.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">Email</p>
                      <a
                        href={`mailto:${mp.email}`}
                        className="text-[#085e29] hover:underline break-all"
                      >
                        {mp.email}
                      </a>
                    </div>
                  </div>
                )}

                {mp.phone_no && (
                  <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                    <svg
                      className="w-6 h-6 text-[#085e29] flex-shrink-0 mt-0.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">Phone</p>
                      <a
                        href={`tel:${mp.phone_no}`}
                        className="text-[#085e29] hover:underline"
                      >
                        {mp.phone_no}
                      </a>
                    </div>
                  </div>
                )}
              </div>

              {!mp.email && !mp.phone_no && (
                <p className="text-gray-500 italic">No contact information available.</p>
              )}
            </div>

            {/* Biography */}
            {mp.bio && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Biography</h2>
                <div className="prose max-w-none">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {mp.bio}
                  </p>
                </div>
              </div>
            )}

            {/* Political Information */}
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Political Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-600 mb-1">Party</p>
                  <p className="text-gray-800 font-semibold">{mp.party}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-600 mb-1">Constituency</p>
                  <p className="text-gray-800 font-semibold">{mp.constituency}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-600 mb-1">District</p>
                  <p className="text-gray-800 font-semibold">{mp.district}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Actions */}
        <div className="mt-6 flex justify-center">
          <Link
            href="/trackers/mps"
            className="bg-gray-200 text-gray-700 px-8 py-3 rounded-md hover:bg-gray-300 transition-colors font-medium"
          >
            View All MPs
          </Link>
        </div>
      </main>
    </div>
  );
}