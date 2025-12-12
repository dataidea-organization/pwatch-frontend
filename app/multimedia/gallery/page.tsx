'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import { ArrowLeft, Search, Calendar, User, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { fetchGalleryImages, GalleryImage } from '@/lib/api';

type SortField = 'title' | 'event_date' | 'created_at' | null;
type SortDirection = 'asc' | 'desc';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export default function GalleryPage() {
  // Store all gallery images loaded from the server
  const [allImages, setAllImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [featuredFilter, setFeaturedFilter] = useState<boolean | null>(null);
  const [sortField, setSortField] = useState<SortField>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);

  useEffect(() => {
    loadAllImages();
  }, []);

  // Reset when search or filters change
  useEffect(() => {
    setSortField(null);
  }, [searchQuery, categoryFilter, featuredFilter]);

  const loadAllImages = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch all gallery images by requesting a large page size
      let allResults: GalleryImage[] = [];
      let currentPage = 1;
      let hasMore = true;

      while (hasMore) {
        const params = new URLSearchParams({
          page: currentPage.toString(),
          page_size: '100', // Use max page size
        });

        const response = await fetch(`${API_BASE_URL}/multimedia/gallery/?${params}`);
        if (!response.ok) {
          throw new Error('Failed to fetch gallery images');
        }
        
        const data = await response.json();
        allResults = [...allResults, ...data.results];
        hasMore = data.next !== null;
        currentPage++;
      }

      setAllImages(allResults);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching gallery images:', err);
    } finally {
      setLoading(false);
    }
  };

  // Get unique categories for filter dropdown
  const categories = useMemo(() => {
    const cats = new Set<string>();
    allImages.forEach((image) => {
      if (image.category) cats.add(image.category);
    });
    return Array.from(cats).sort();
  }, [allImages]);

  // Client-side filtering - filter allImages based on search query, category, and featured
  const filteredImages = useMemo(() => {
    let filtered = [...allImages];

    // Filter by category
    if (categoryFilter !== 'all') {
      filtered = filtered.filter((image) => image.category === categoryFilter);
    }

    // Filter by featured
    if (featuredFilter !== null) {
      filtered = filtered.filter((image) => image.featured === featuredFilter);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((image) => {
        return (
          image.title.toLowerCase().includes(query) ||
          image.description.toLowerCase().includes(query) ||
          (image.photographer && image.photographer.toLowerCase().includes(query)) ||
          (image.tags && image.tags.toLowerCase().includes(query))
        );
      });
    }

    return filtered;
  }, [allImages, searchQuery, categoryFilter, featuredFilter]);

  // Client-side sorting - sort the filtered images array
  const sortedImages = useMemo(() => {
    if (!sortField) {
      // Default: featured first, then by event_date or created_at
      return [...filteredImages].sort((a, b) => {
        if (a.featured !== b.featured) {
          return a.featured ? -1 : 1;
        }
        const aDate = a.event_date ? new Date(a.event_date).getTime() : new Date(a.created_at).getTime();
        const bDate = b.event_date ? new Date(b.event_date).getTime() : new Date(b.created_at).getTime();
        return bDate - aDate;
      });
    }

    const sorted = [...filteredImages].sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      switch (sortField) {
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'event_date':
          aValue = a.event_date ? new Date(a.event_date).getTime() : 0;
          bValue = b.event_date ? new Date(b.event_date).getTime() : 0;
          break;
        case 'created_at':
          aValue = new Date(a.created_at).getTime();
          bValue = new Date(b.created_at).getTime();
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [filteredImages, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading && allImages.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header variant="support" />
        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#085e29]"></div>
            <p className="mt-4 text-gray-600">Loading gallery...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error && allImages.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header variant="support" />
        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">Error: {error}</p>
            <Button
              onClick={() => loadAllImages()}
              className="mt-4"
              variant="green"
            >
              Try Again
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header variant="support" />
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumb Navigation */}
        <div className="mb-6">
          <Link
            href="/multimedia"
            className="inline-flex items-center text-[#085e29] hover:text-[#064920] transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Multimedia
          </Link>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Gallery</h1>
          <p className="text-gray-600 text-lg">Browse our collection of photographs from parliamentary events and activities</p>
        </div>

        {/* Search and Filter Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 z-10" />
                <Input
                  type="text"
                  placeholder="Search gallery..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 text-gray-900 placeholder:text-gray-400"
                  style={{ color: '#111827' }}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#085e29] focus:border-transparent text-gray-900 bg-white"
              >
                <option value="all">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              <select
                value={featuredFilter === null ? 'all' : featuredFilter ? 'featured' : 'not-featured'}
                onChange={(e) => {
                  const value = e.target.value;
                  setFeaturedFilter(value === 'all' ? null : value === 'featured');
                }}
                className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#085e29] focus:border-transparent text-gray-900 bg-white"
              >
                <option value="all">All Images</option>
                <option value="featured">Featured Only</option>
                <option value="not-featured">Not Featured</option>
              </select>
              {(searchQuery || categoryFilter !== 'all' || featuredFilter !== null) && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery('');
                    setCategoryFilter('all');
                    setFeaturedFilter(null);
                  }}
                  className="bg-gray-200 text-gray-700 hover:bg-gray-300 border-gray-300"
                >
                  Clear
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Gallery Grid */}
        {sortedImages.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <p className="text-gray-500 text-lg">No images found</p>
            {(searchQuery || categoryFilter !== 'all' || featuredFilter !== null) && (
              <p className="text-gray-400 text-sm mt-2">Try adjusting your search or filters</p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {sortedImages.map((image) => (
              <div
                key={image.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer group"
                onClick={() => setSelectedImage(image)}
              >
                {/* Image */}
                <div className="relative h-64 w-full bg-gray-200 overflow-hidden">
                  <img
                    src={`${API_BASE_URL.replace('/api', '')}${image.image}`}
                    alt={image.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {image.featured && (
                    <div className="absolute top-2 right-2">
                      <span className="px-2 py-1 bg-[#085e29] text-white text-xs font-medium rounded">
                        Featured
                      </span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity text-white text-center px-4">
                      <p className="font-semibold text-sm mb-1">{image.title}</p>
                      {image.category && (
                        <p className="text-xs">{image.category}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Info */}
                <div className="p-4">
                  <h3 className="text-sm font-semibold text-gray-900 mb-1 line-clamp-1">{image.title}</h3>
                  {image.photographer && (
                    <div className="flex items-center gap-1 text-xs text-gray-600 mb-1">
                      <User className="w-3 h-3" />
                      <span className="truncate">{image.photographer}</span>
                    </div>
                  )}
                  {image.event_date && (
                    <div className="flex items-center gap-1 text-xs text-gray-600">
                      <Calendar className="w-3 h-3" />
                      <span>{formatDate(image.event_date)}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Image Modal */}
        {selectedImage && (
          <div
            className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedImage(null)}
          >
            <div
              className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <div className="flex justify-end p-4">
                <button
                  onClick={() => setSelectedImage(null)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              {/* Image */}
              <div className="px-4">
                <img
                  src={`${API_BASE_URL.replace('/api', '')}${selectedImage.image}`}
                  alt={selectedImage.title}
                  className="w-full h-auto rounded-lg"
                />
              </div>

              {/* Details */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedImage.title}</h2>
                    {selectedImage.category && (
                      <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full mb-2">
                        {selectedImage.category}
                      </span>
                    )}
                    {selectedImage.featured && (
                      <span className="inline-block px-3 py-1 bg-[#085e29] text-white text-sm rounded-full ml-2 mb-2">
                        Featured
                      </span>
                    )}
                  </div>
                </div>

                {selectedImage.description && (
                  <p className="text-gray-600 mb-4">{selectedImage.description}</p>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  {selectedImage.photographer && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <User className="w-4 h-4" />
                      <span><strong>Photographer:</strong> {selectedImage.photographer}</span>
                    </div>
                  )}
                  {selectedImage.event_date && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span><strong>Date:</strong> {formatDate(selectedImage.event_date)}</span>
                    </div>
                  )}
                </div>

                {/* Tags */}
                {selectedImage.tags && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Tags:</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedImage.tags.split(',').map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                        >
                          {tag.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Footer Info */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">About Our Gallery</h3>
          <p className="text-sm text-gray-600">
            Our gallery showcases photographs from parliamentary events, activities, and important moments.
            Browse through our collection to see the work of Parliament Watch and stay connected with parliamentary activities.
          </p>
        </div>
      </main>
    </div>
  );
}


