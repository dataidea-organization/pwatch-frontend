'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { fetchBlog, BlogDetail } from '@/lib/api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export default function BlogDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [blog, setBlog] = useState<BlogDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (params.slug) {
      loadBlog();
    }
  }, [params.slug]);

  const loadBlog = async () => {
    try {
      setLoading(true);
      const data = await fetchBlog(params.slug as string);
      setBlog(data);
      setError(null);
    } catch (err) {
      setError('Failed to load blog post. Please try again later.');
      console.error('Error fetching blog:', err);
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
            <p className="text-gray-600">Loading blog post...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="min-h-screen bg-[#f3eed4]">
        <main className="max-w-5xl mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-red-600">{error || 'Blog post not found'}</p>
            <div className="mt-4 space-x-4">
              <button
                onClick={loadBlog}
                className="bg-[#2d5016] text-white px-6 py-2 rounded-md hover:bg-[#1b3d26] transition-colors"
              >
                Try Again
              </button>
              <Link
                href="/blogs"
                className="inline-block bg-gray-200 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-300 transition-colors"
              >
                Back to Blogs
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
            href="/blogs"
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
            Back to All Blogs
          </Link>
        </div>

        {/* Blog Post */}
        <article className="bg-[#f3eed4] rounded-lg shadow-md overflow-hidden">
          {/* Header Image */}
          <div className="relative h-96 bg-gray-200">
            <img
              src={blog.image 
                ? (blog.image.startsWith('http') ? blog.image : `${API_BASE_URL.replace('/api', '')}${blog.image}`)
                : '/images/default-blog.jpg'
              }
              alt={blog.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Content */}
          <div className="p-8">
            {/* Category and Date */}
            <div className="flex items-center justify-between mb-4">
              <span className="px-3 py-1 bg-[#2d5016] text-white text-sm font-semibold rounded-full">
                {blog.category_display || blog.category}
              </span>
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
                <span>{formatDate(blog.published_date)}</span>
              </div>
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {blog.title}
            </h1>

            {/* Author */}
            <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-200">
              <div className="w-12 h-12 rounded-full bg-[#2d5016] flex items-center justify-center text-white font-semibold">
                {blog.author.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-gray-900">{blog.author}</p>
                <p className="text-sm text-gray-600">Author</p>
              </div>
            </div>


            {/* Content */}
            <div
              className="blog-content"
              dangerouslySetInnerHTML={{ __html: blog.content }}
            />
          </div>
        </article>

        {/* Navigation */}
        <div className="mt-8 flex justify-center">
          <Link
            href="/blogs"
            className="bg-[#2d5016] text-white px-8 py-3 rounded-md hover:bg-[#1b3d26] transition-colors font-medium"
          >
            View All Blogs
          </Link>
        </div>
      </main>
    </div>
  );
}

