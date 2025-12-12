'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { fetchHeroImages, fetchHeadlines, fetchNews, HeroImage, Headline, NewsArticle } from '@/lib/api';
import Link from 'next/link';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [heroImages, setHeroImages] = useState<HeroImage[]>([]);
  const [headlines, setHeadlines] = useState<Headline[]>([]);
  const [newsArticles, setNewsArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    
    // Fetch hero images
    try {
      const images = await fetchHeroImages();
      if (images.length > 0) {
        setHeroImages(images);
      } else {
        // Fallback to default images
        setHeroImages([
          { id: 1, image: '/images/parliament.jpg', alt_text: 'Parliament Building' } as HeroImage,
          { id: 2, image: '/images/parliament2.jpg', alt_text: 'Parliament Building 2' } as HeroImage,
          { id: 3, image: '/images/parliament3.jpg', alt_text: 'Parliament Building 3' } as HeroImage,
        ]);
      }
    } catch (error) {
      console.error('Error loading hero images:', error);
      // Fallback to default images on error
      setHeroImages([
        { id: 1, image: '/images/parliament.jpg', alt_text: 'Parliament Building' } as HeroImage,
        { id: 2, image: '/images/parliament2.jpg', alt_text: 'Parliament Building 2' } as HeroImage,
        { id: 3, image: '/images/parliament3.jpg', alt_text: 'Parliament Building 3' } as HeroImage,
      ]);
    }
    
    // Fetch headlines (fail gracefully if migrations not run)
    try {
      const headlineData = await fetchHeadlines();
      setHeadlines(headlineData);
    } catch (error) {
      console.error('Error loading headlines:', error);
      // Headlines will remain empty, which is fine - the component handles it
      setHeadlines([]);
    }
    
    // Fetch latest 3 news articles
    try {
      const newsData = await fetchNews(1, 3);
      setNewsArticles(newsData.results || []);
    } catch (error) {
      console.error('Error loading news:', error);
      setNewsArticles([]);
    }
    
    setLoading(false);
  };

  // Auto-slide functionality
  useEffect(() => {
    if (heroImages.length === 0) return;
    
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length);
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, [heroImages.length]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const goToPrevious = () => {
    if (heroImages.length === 0) return;
    setCurrentSlide((prev) => (prev - 1 + heroImages.length) % heroImages.length);
  };

  const goToNext = () => {
    if (heroImages.length === 0) return;
    setCurrentSlide((prev) => (prev + 1) % heroImages.length);
  };

  return (
    <div className="min-h-screen bg-white">
      <Header variant="support" />

      <main className="max-w-7xl mx-auto px-4 py-6 pb-20">
        <div className="">
          <div className="lg:col-span-2">
            <div className="relative h-[400px] rounded-lg overflow-hidden group">
              {/* Image Carousel */}
              {loading ? (
                <div className="absolute inset-0 bg-gray-200 animate-pulse" />
              ) : (
                <div className="relative w-full h-full">
                  {heroImages.map((heroImage, index) => (
                    <div
                      key={heroImage.id}
                      className={`absolute inset-0 transition-opacity duration-1000 ${
                        index === currentSlide ? 'opacity-100' : 'opacity-0'
                      }`}
                    >
                      <img
                        src={
                          heroImage.image.startsWith('http') 
                            ? heroImage.image 
                            : heroImage.image.startsWith('/')
                            ? heroImage.image
                            : `${API_BASE_URL.replace('/api', '')}${heroImage.image}`
                        }
                        alt={heroImage.alt_text || heroImage.title || `Hero Image ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent z-10" />

              {/* Navigation Arrows */}
              <button
                onClick={goToPrevious}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-30 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-2 transition-all opacity-0 group-hover:opacity-100"
                aria-label="Previous slide"
              >
                <ChevronLeft className="w-6 h-6 text-white" />
              </button>
              <button
                onClick={goToNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-30 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-2 transition-all opacity-0 group-hover:opacity-100"
                aria-label="Next slide"
              >
                <ChevronRight className="w-6 h-6 text-white" />
              </button>

              {/* Content Overlay */}
              <div className="absolute bottom-8 left-8 z-20">
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                  Your Eye on
                  <br />
                  <span className="relative inline-block">
                    Parliament
                    <div className="absolute -bottom-2 left-0 w-32 h-1 bg-[#085e29]" />
                  </span>
                </h2>
                <Button variant="green" size="lg" className="mt-6">
                  Get Involved
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </Button>
              </div>

              {/* Slide Indicators */}
              {!loading && heroImages.length > 0 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
                  {heroImages.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => goToSlide(index)}
                      className={`transition-all ${
                        index === currentSlide
                          ? 'w-8 h-2 rounded-full bg-white'
                          : 'w-2 h-2 rounded-full bg-white/50 hover:bg-white/75'
                      }`}
                      aria-label={`Go to slide ${index + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-2xl font-bold text-gray-800">News and Updates</h3>
            <Link href="/news">
              <Button variant="ghost" className="text-[#085e29] hover:text-[#064920] font-medium h-auto p-0">
                View All
              </Button>
            </Link>
          </div>

          {newsArticles.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No news articles available</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {newsArticles.map((article) => (
                <Link key={article.id} href={`/news/${article.slug}`}>
                  <div className="h-full flex flex-col rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow cursor-pointer">
                    <div className="relative h-48 bg-gray-200 flex-shrink-0">
                      {article.image ? (
                        <img
                          src={article.image.startsWith('http') ? article.image : `${API_BASE_URL.replace('/api', '')}${article.image}`}
                          alt={article.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                          No Image
                        </div>
                      )}
                    </div>
                    <div className="p-4 bg-white flex-1 flex flex-col">
                      <span className="text-xs font-semibold text-[#085e29] uppercase">
                        {article.category_display || article.category}
                      </span>
                      <h4 className="mt-2 text-sm font-semibold text-gray-800 line-clamp-2">
                        {article.title}
                      </h4>
                      {article.excerpt && (
                        <p className="mt-2 text-xs text-gray-600 line-clamp-2 flex-1">
                          {article.excerpt}
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>

      {headlines.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-[#085e29] text-white py-3 overflow-hidden z-50 shadow-lg">
          <div className="animate-marquee whitespace-nowrap">
            {headlines.map((headline) => (
              <span
                key={headline.id}
                className={`text-sm font-medium mx-8 ${headline.is_bold ? 'font-bold' : ''}`}
              >
                {headline.text}
              </span>
            ))}
            {/* Duplicate for seamless loop */}
            {headlines.map((headline) => (
              <span
                key={`duplicate-${headline.id}`}
                className={`text-sm font-medium mx-8 ${headline.is_bold ? 'font-bold' : ''}`}
              >
                {headline.text}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}