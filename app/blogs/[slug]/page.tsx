'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Calendar, User, Clock, Share2 } from 'lucide-react';
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

  // Calculate reading time
  const readingTime = useMemo(() => {
    if (!blog?.content) return 0;
    const text = blog.content.replace(/<[^>]*>/g, '');
    const words = text.split(/\s+/).length;
    return Math.ceil(words / 200); // Average reading speed: 200 words per minute
  }, [blog]);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: blog?.title,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f0e8]">
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
      <div className="min-h-screen bg-[#f5f0e8]">
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
    <div className="min-h-screen bg-[#f5f0e8]">
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Link
            href="/blogs"
            className="inline-flex items-center text-[#2d5016] hover:text-[#1b3d26] font-medium transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to All Blogs
          </Link>
        </div>

        {/* Hero Image Section */}
        <div className="relative h-[500px] md:h-[600px] rounded-2xl overflow-hidden mb-8 shadow-xl">
          <img
            src={blog.image 
              ? (blog.image.startsWith('http') ? blog.image : `${API_BASE_URL.replace('/api', '')}${blog.image}`)
              : '/images/default-blog.jpg'
            }
            alt={blog.title}
            className="w-full h-full object-cover"
            style={{ objectPosition: 'center 30%' }}
          />
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
          
          {/* Content Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
            <div className="max-w-4xl">
              {/* Category Badge */}
              <div className="mb-4">
                <span className="inline-block px-4 py-2 bg-[#2d5016] text-white text-sm font-semibold rounded-full">
                  {blog.category_display || blog.category}
                </span>
              </div>
              
              {/* Title */}
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
                {blog.title}
              </h1>
              
              {/* Meta Information */}
              <div className="flex flex-wrap items-center gap-6 text-white/90">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">{formatDate(blog.published_date)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span className="text-sm">{blog.author}</span>
                </div>
                {readingTime > 0 && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">{readingTime} min read</span>
                  </div>
                )}
                <button
                  onClick={handleShare}
                  className="flex items-center gap-2 hover:text-white transition-colors"
                  title="Share blog post"
                >
                  <Share2 className="w-4 h-4" />
                  <span className="text-sm">Share</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Blog Content */}
        <article className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="max-w-4xl mx-auto px-6 md:px-12 py-10 md:py-16">
            {/* Author Section */}
            <div className="flex items-center gap-4 mb-8 pb-8 border-b border-gray-200">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#2d5016] to-[#1b3d26] flex items-center justify-center text-white text-xl font-bold shadow-lg">
                {blog.author.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-lg">{blog.author}</p>
                <p className="text-sm text-gray-600">Author</p>
              </div>
            </div>

            {/* Content */}
            <div
              className="blog-content prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-[#2d5016] prose-a:no-underline hover:prose-a:underline prose-strong:text-gray-900 prose-img:rounded-xl prose-img:shadow-md"
              dangerouslySetInnerHTML={{ __html: blog.content }}
            />
          </div>
        </article>

        {/* Navigation */}
        <div className="mt-12 flex justify-center">
          <Link
            href="/blogs"
            className="inline-flex items-center gap-2 bg-[#2d5016] text-white px-8 py-3 rounded-lg hover:bg-[#1b3d26] transition-colors font-medium shadow-md hover:shadow-lg"
          >
            <ArrowLeft className="w-5 h-5" />
            View All Blogs
          </Link>
        </div>
      </main>
    </div>
  );
}

