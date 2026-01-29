'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Folder } from 'lucide-react';
import { fetchHeroImages, fetchHeadlines, fetchHomeNewsSummary, fetchHomeBlogSummary, fetchHomeTrackersSummary, fetchHomeResourcesSummary, fetchHotInParliament, HeroImage, Headline, NewsArticle, BlogPost, HomeTrackersSummary, HomeResourcesSummary, HotInParliamentItem } from '@/lib/api';
import Link from 'next/link';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

type TrackerTab = 'mps' | 'bills' | 'loans' | 'budgets' | 'hansards' | 'order-paper';
type ResourceTab = 'reports' | 'statements';

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [heroImages, setHeroImages] = useState<HeroImage[]>([]);
  const [headlines, setHeadlines] = useState<Headline[]>([]);
  const [newsArticles, setNewsArticles] = useState<NewsArticle[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [hotInParliament, setHotInParliament] = useState<HotInParliamentItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Trackers section state
  const [activeTab, setActiveTab] = useState<TrackerTab>('bills');
  const [trackersData, setTrackersData] = useState<HomeTrackersSummary | null>(null);
  const [trackersLoading, setTrackersLoading] = useState(true);
  
  // Resources section state
  const [activeResourceTab, setActiveResourceTab] = useState<ResourceTab>('reports');
  const [resourcesData, setResourcesData] = useState<HomeResourcesSummary | null>(null);
  const [resourcesLoading, setResourcesLoading] = useState(true);

  useEffect(() => {
    loadData();
    loadTrackersData();
    loadResourcesData();
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
    
    // Fetch latest 3 news articles (optimized cached endpoint)
    try {
      const newsData = await fetchHomeNewsSummary();
      setNewsArticles(newsData.results || []);
    } catch (error) {
      console.error('Error loading news:', error);
      setNewsArticles([]);
    }
    
    // Fetch latest 3 blog posts (optimized cached endpoint)
    try {
      const blogData = await fetchHomeBlogSummary();
      setBlogPosts(blogData.results || []);
    } catch (error) {
      console.error('Error loading blogs:', error);
      setBlogPosts([]);
    }
    
    // Fetch Latest in Parliament items
    try {
      const hotData = await fetchHotInParliament();
      console.log('Latest in Parliament data:', hotData);
      setHotInParliament(hotData.results || []);
    } catch (error) {
      console.error('Error loading latest in parliament:', error);
      setHotInParliament([]);
    }
    
    setLoading(false);
  };

  const loadTrackersData = async () => {
    setTrackersLoading(true);
    
    try {
      const data = await fetchHomeTrackersSummary();
      setTrackersData(data);
    } catch (error) {
      console.error('Error loading trackers data:', error);
      setTrackersData(null);
    } finally {
      setTrackersLoading(false);
    }
  };

  const loadResourcesData = async () => {
    setResourcesLoading(true);
    
    try {
      const data = await fetchHomeResourcesSummary();
      setResourcesData(data);
    } catch (error) {
      console.error('Error loading resources data:', error);
      setResourcesData(null);
    } finally {
      setResourcesLoading(false);
    }
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
    <div className="min-h-screen bg-[#f5f0e8]">

      <main className="max-w-7xl mx-auto px-4 py-6 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Hero Image Section */}
          <div className="lg:col-span-2">
            <div className="relative h-[400px] rounded-xl overflow-hidden shadow-xl group">
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

              {/* Gradient Overlay - Left to Right for text visibility */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/20 z-10" />

              {/* Navigation Arrows */}
              <button
                onClick={goToPrevious}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-30 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-3 transition-all opacity-0 group-hover:opacity-100 hover:scale-110 shadow-lg"
                aria-label="Previous slide"
              >
                <ChevronLeft className="w-6 h-6 text-white" />
              </button>
              <button
                onClick={goToNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-30 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-3 transition-all opacity-0 group-hover:opacity-100 hover:scale-110 shadow-lg"
                aria-label="Next slide"
              >
                <ChevronRight className="w-6 h-6 text-white" />
              </button>

              {/* Content Overlay */}
              <div className="absolute bottom-8 left-8 z-20">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 max-w-2xl">
                  We monitor and track the Ugandan Parliament on a regular basis, provide relevant data and expert insights.
                </h2>
                <Button 
                  variant="green" 
                  size="lg" 
                  className="mt-6"
                  onClick={() => {
                    const newsSection = document.getElementById('news-section');
                    if (newsSection) {
                      newsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                  }}
                >
                  Here is How
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
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

          {/* Hot in Parliament Section - Only visible on large screens */}
          <div className="hidden lg:block">
            <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden h-[400px] flex flex-col">
              <div className="bg-gradient-to-br from-[#fafaf8] to-[#f5f0e8] px-6 py-4 border-b border-gray-200">
                <h3 className="text-xl font-bold text-gray-900">Latest in Parliament</h3>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
              {hotInParliament.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p className="text-sm">No latest items available</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {hotInParliament.map((item) => {
                    const content = item.content.replace(/<[^>]*>/g, '').substring(0, 100) + '...';
                    const itemUrl = `/hot-in-parliament/${item.slug}`;
                    
                    return (
                      <Link
                        key={item.id}
                        href={itemUrl}
                        className="block group"
                      >
                        <div className="relative rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer h-48 w-full hover:-translate-y-1">
                          {item.image ? (
                            <>
                              <img
                                src={item.image.startsWith('http') ? item.image : `${API_BASE_URL.replace('/api', '')}${item.image}`}
                                alt={item.title}
                                className="absolute inset-0 w-full h-full object-cover"
                              />
                              {/* Dark gradient overlay at bottom */}
                              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent" />
                            </>
                          ) : (
                            <div className="absolute inset-0 bg-gradient-to-br from-[#2d5016] to-[#1b3d26]" />
                          )}
                          {/* Content overlay - positioned at bottom */}
                          <div className="absolute bottom-0 left-0 right-0 p-3 z-10">
                            <h4 className="font-semibold text-white text-sm mb-1.5 line-clamp-2">
                              {item.title}
                            </h4>
                            <p className="text-xs text-white/90 line-clamp-2 mb-1.5">
                              {content}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-white/90">
                              <svg
                                className="w-3 h-3"
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
                              <span>{new Date(item.published_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
              </div>
            </div>
          </div>
        </div>

              {/* News and Updates Section */}
        <div id="news-section" className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-2xl font-bold text-gray-800">News and Updates</h3>
            <Link href="/news">
              <Button variant="ghost" className="text-[#2d5016] hover:text-[#1b3d26] font-medium h-auto p-0">
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
              {newsArticles.map((article, index) => (
                <Link key={article.id} href={`/news/${article.slug}`}>
                  <div 
                    className="relative rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer h-full min-h-[300px] flex flex-col hover:scale-[1.02] hover:-translate-y-1 animate-fade-in-up group"
                    style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'both' }}
                  >
                    <img
                      src={article.image 
                        ? (article.image.startsWith('http') ? article.image : `${API_BASE_URL.replace('/api', '')}${article.image}`)
                        : '/images/default-news.jpg'
                      }
                      alt={article.title}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    {/* Dark gradient overlay at bottom */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                    {/* Content overlay */}
                    <div className="relative mt-auto p-4 z-10">
                      <span className="text-xs font-semibold text-white/90 uppercase block mb-2">
                        {article.category_display || article.category}
                      </span>
                      <h4 className="text-sm font-semibold text-white line-clamp-2 mb-3">
                        {article.title}
                      </h4>
                      <div className="flex items-center gap-2 text-xs text-white/90 mb-2">
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
                        <span>{new Date(article.published_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-white/90">
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
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                        <span>{article.author}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Trackers Section */}
        <div className="mt-12">
          <h3 className="text-2xl font-bold text-gray-800 mb-4">Trackers</h3>
          <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
            {/* Tabs */}
          <div className="bg-gradient-to-br from-[#fafaf8] to-[#f5f0e8] px-4 py-2 flex flex-wrap gap-2 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('mps')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                activeTab === 'mps'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
              }`}
            >
              + Members of Parliament
            </button>
            <button
              onClick={() => setActiveTab('bills')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                activeTab === 'bills'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
              }`}
            >
              + Bills Tracker
            </button>
            <button
              onClick={() => setActiveTab('loans')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                activeTab === 'loans'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
              }`}
            >
              + Loans Tracker
            </button>
            <button
              onClick={() => setActiveTab('budgets')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                activeTab === 'budgets'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
              }`}
            >
              + Budget Tracker
            </button>
            <button
              onClick={() => setActiveTab('hansards')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                activeTab === 'hansards'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
              }`}
            >
              + Hansards Tracker
            </button>
            <button
              onClick={() => setActiveTab('order-paper')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                activeTab === 'order-paper'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
              }`}
            >
              + Order Paper Tracker
            </button>
          </div>

          {/* Content Area */}
          <div className="bg-[#fafaf8] p-4">
            {trackersLoading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-[#2d5016]"></div>
                <p className="mt-2 text-gray-500 text-sm">Loading...</p>
              </div>
            ) : (
              <>
                {/* MPs Table */}
                {activeTab === 'mps' && (
                  <div>
                    {!trackersData || trackersData.mps.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <p>No MPs data available</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {trackersData.mps.map((mp) => (
                          <Link
                            key={mp.id}
                            href={`/trackers/mps/${mp.id}`}
                            className="flex items-center gap-3 py-3 px-3 rounded-lg border-b border-gray-100 last:border-0 hover:bg-gradient-to-br hover:from-[#fafaf8] hover:to-[#f5f0e8] transition-all cursor-pointer hover:shadow-sm"
                          >
                            <Folder className="w-4 h-4 text-[#a0522d] flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-gray-800 truncate">
                                {mp.name} - {mp.party} ({mp.constituency})
                              </p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                    <div className="mt-4 text-left">
                      <Link href="/trackers/mps">
                        <Button className="bg-[#2d5016] hover:bg-[#1b3d26] text-white rounded-lg shadow-sm hover:shadow-md">
                          See all MPs
                        </Button>
                      </Link>
                    </div>
                  </div>
                )}

                {/* Bills Table */}
                {activeTab === 'bills' && (
                  <div>
                    {!trackersData || trackersData.bills.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <p>No bills data available</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {trackersData.bills.map((bill) => (
                          <Link
                            key={bill.id}
                            href={`/trackers/bills/${bill.id}`}
                            className="flex items-center gap-3 py-3 px-3 rounded-lg border-b border-gray-100 last:border-0 hover:bg-gradient-to-br hover:from-[#fafaf8] hover:to-[#f5f0e8] transition-all cursor-pointer hover:shadow-sm"
                          >
                            <Folder className="w-4 h-4 text-[#a0522d] flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-gray-800 truncate">
                                {bill.title}
                              </p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                    <div className="mt-4 text-left">
                      <Link href="/trackers/bills">
                        <Button className="bg-[#2d5016] hover:bg-[#1b3d26] text-white rounded-lg shadow-sm hover:shadow-md">
                          See all Bills
                        </Button>
                      </Link>
                    </div>
                  </div>
                )}

                {/* Loans Table */}
                {activeTab === 'loans' && (
                  <div>
                    {!trackersData || trackersData.loans.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <p>No loans data available</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {trackersData.loans.map((loan) => (
                          <div key={loan.id} className="flex items-center gap-3 py-3 px-3 rounded-lg border-b border-gray-100 last:border-0 hover:bg-gradient-to-br hover:from-[#fafaf8] hover:to-[#f5f0e8] transition-all hover:shadow-sm">
                            <Folder className="w-4 h-4 text-[#a0522d] flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-gray-800 truncate">
                                {loan.label} - {loan.sector_display} ({loan.source_display})
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="mt-4 text-left">
                      <Link href="/trackers/loans">
                        <Button className="bg-[#2d5016] hover:bg-[#1b3d26] text-white rounded-lg shadow-sm hover:shadow-md">
                          See all Loans
                        </Button>
                      </Link>
                    </div>
                  </div>
                )}

                {/* Budgets Table */}
                {activeTab === 'budgets' && (
                  <div>
                    {!trackersData || trackersData.budgets.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <p>No budgets data available</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {trackersData.budgets.map((budget) => (
                          <div key={budget.id} className="flex items-center gap-3 py-3 px-3 rounded-lg border-b border-gray-100 last:border-0 hover:bg-gradient-to-br hover:from-[#fafaf8] hover:to-[#f5f0e8] transition-all hover:shadow-sm">
                            <Folder className="w-4 h-4 text-[#a0522d] flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              {budget.file ? (
                                <a
                                  href={`${API_BASE_URL.replace('/api', '')}${budget.file}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sm text-gray-800 truncate hover:text-[#2d5016] transition-colors cursor-pointer block"
                                >
                                  {budget.name} ({budget.financial_year})
                                </a>
                              ) : (
                                <p className="text-sm text-gray-800 truncate">
                                  {budget.name} ({budget.financial_year})
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="mt-4 text-left">
                      <Link href="/trackers/budgets">
                        <Button className="bg-[#2d5016] hover:bg-[#1b3d26] text-white rounded-lg shadow-sm hover:shadow-md">
                          See all Budgets
                        </Button>
                      </Link>
                    </div>
                  </div>
                )}

                {/* Hansards Table */}
                {activeTab === 'hansards' && (
                  <div>
                    {!trackersData || trackersData.hansards.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <p>No hansards data available</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {trackersData.hansards.map((hansard) => (
                          <div key={hansard.id} className="flex items-center gap-3 py-3 px-3 rounded-lg border-b border-gray-100 last:border-0 hover:bg-gradient-to-br hover:from-[#fafaf8] hover:to-[#f5f0e8] transition-all hover:shadow-sm">
                            <Folder className="w-4 h-4 text-[#a0522d] flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              {hansard.file ? (
                                <a
                                  href={`${API_BASE_URL.replace('/api', '')}${hansard.file}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sm text-gray-800 truncate hover:text-[#2d5016] transition-colors cursor-pointer block"
                                >
                                  {hansard.name} {hansard.date && `(${new Date(hansard.date).toLocaleDateString()})`}
                                </a>
                              ) : (
                                <p className="text-sm text-gray-800 truncate">
                                  {hansard.name} {hansard.date && `(${new Date(hansard.date).toLocaleDateString()})`}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="mt-4 text-left">
                      <Link href="/trackers/hansards">
                        <Button className="bg-[#2d5016] hover:bg-[#1b3d26] text-white rounded-lg shadow-sm hover:shadow-md">
                          See all Hansards
                        </Button>
                      </Link>
                    </div>
                  </div>
                )}

                {/* Order Papers Table */}
                {activeTab === 'order-paper' && (
                  <div>
                    {!trackersData || trackersData.order_papers.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <p>No order papers data available</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {trackersData.order_papers.map((paper) => (
                          <div key={paper.id} className="flex items-center gap-3 py-3 px-3 rounded-lg border-b border-gray-100 last:border-0 hover:bg-gradient-to-br hover:from-[#fafaf8] hover:to-[#f5f0e8] transition-all hover:shadow-sm">
                            <Folder className="w-4 h-4 text-[#a0522d] flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              {paper.file ? (
                                <a
                                  href={`${API_BASE_URL.replace('/api', '')}${paper.file}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sm text-gray-800 truncate hover:text-[#2d5016] transition-colors cursor-pointer block"
                                >
                                  {paper.name}
                                </a>
                              ) : (
                                <p className="text-sm text-gray-800 truncate">
                                  {paper.name}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="mt-4 text-left">
                      <Link href="/trackers/order-paper">
                        <Button className="bg-[#2d5016] hover:bg-[#1b3d26] text-white rounded-lg shadow-sm hover:shadow-md">
                          See all Order Papers
                        </Button>
                      </Link>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
          </div>
        </div>

        {/* Resources Section */}
        <div className="mt-12">
          <h3 className="text-2xl font-bold text-gray-800 mb-4">Resources</h3>
          <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
            {/* Tabs */}
          <div className="bg-gradient-to-br from-[#fafaf8] to-[#f5f0e8] px-4 py-2 flex flex-wrap gap-2 border-b border-gray-200">
            <button
              onClick={() => setActiveResourceTab('reports')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                activeResourceTab === 'reports'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
              }`}
            >
              + Reports
            </button>
            <button
              onClick={() => setActiveResourceTab('statements')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                activeResourceTab === 'statements'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
              }`}
            >
              + Statements
            </button>
          </div>

          {/* Content Area */}
          <div className="bg-white p-6">
            {resourcesLoading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-[#2d5016]"></div>
                <p className="mt-2 text-gray-500 text-sm">Loading...</p>
              </div>
            ) : (
              <>
                {/* Reports Table */}
                {activeResourceTab === 'reports' && (
                  <div>
                    {!resourcesData || resourcesData.reports.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <p>No reports available</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {resourcesData.reports.map((report) => (
                          <div key={report.id} className="flex items-center gap-3 py-3 px-3 rounded-lg border-b border-gray-100 last:border-0 hover:bg-gradient-to-br hover:from-[#fafaf8] hover:to-[#f5f0e8] transition-all hover:shadow-sm">
                            <Folder className="w-4 h-4 text-[#a0522d] flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              {report.file ? (
                                <a
                                  href={report.file}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sm text-gray-800 truncate hover:text-[#2d5016] transition-colors cursor-pointer block"
                                >
                                  {report.name}
                                </a>
                              ) : (
                                <p className="text-sm text-gray-800 truncate">{report.name}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="mt-4 text-left">
                      <Link href="/resources">
                        <Button className="bg-[#2d5016] hover:bg-[#1b3d26] text-white rounded-lg shadow-sm hover:shadow-md">
                          See all Reports
                        </Button>
                      </Link>
                    </div>
                  </div>
                )}

                {/* Statements Table */}
                {activeResourceTab === 'statements' && (
                  <div>
                    {!resourcesData || resourcesData.statements.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <p>No statements available</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {resourcesData.statements.map((statement) => (
                          <div key={statement.id} className="flex items-center gap-3 py-3 px-3 rounded-lg border-b border-gray-100 last:border-0 hover:bg-gradient-to-br hover:from-[#fafaf8] hover:to-[#f5f0e8] transition-all hover:shadow-sm">
                            <Folder className="w-4 h-4 text-[#a0522d] flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              {statement.file ? (
                                <a
                                  href={statement.file}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sm text-gray-800 truncate hover:text-[#2d5016] transition-colors cursor-pointer block"
                                >
                                  {statement.name}
                                </a>
                              ) : (
                                <p className="text-sm text-gray-800 truncate">{statement.name}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="mt-4 text-left">
                      <Link href="/resources">
                        <Button className="bg-[#2d5016] hover:bg-[#1b3d26] text-white rounded-lg shadow-sm hover:shadow-md">
                          See all Statements
                        </Button>
                      </Link>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
          </div>
        </div>
          {/* Latest Blogs Section */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-2xl font-bold text-gray-800">Latest Blogs</h3>
            <Link href="/blogs">
              <Button variant="ghost" className="text-[#2d5016] hover:text-[#1b3d26] font-medium h-auto p-0">
                View All
              </Button>
            </Link>
          </div>

          {blogPosts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No blog posts available</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {blogPosts.map((post, index) => (
                <Link key={post.id} href={`/blogs/${post.slug}`}>
                  <div 
                    className="relative rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer h-full min-h-[350px] flex flex-col hover:scale-[1.02] hover:-translate-y-1 animate-fade-in-up group"
                    style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'both' }}
                  >
                      <img
                        src={post.image 
                          ? (post.image.startsWith('http') ? post.image : `${API_BASE_URL.replace('/api', '')}${post.image}`)
                          : '/images/default-blog.jpg'
                        }
                        alt={post.title}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    {/* Dark gradient overlay at bottom */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                    {/* Content overlay */}
                    <div className="relative mt-auto p-4 z-10 flex-1 flex flex-col">
                      <span className="text-xs font-semibold text-white/90 uppercase mb-2">
                        {post.category_display || post.category}
                      </span>
                      <h4 className="text-sm font-semibold text-white line-clamp-2 mb-3 flex-1">
                        {post.title}
                      </h4>
                      <div className="mt-auto space-y-1">
                        <div className="flex items-center gap-2 text-xs text-white/90">
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
                          <span>{new Date(post.published_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-white/90">
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
                              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                            />
                          </svg>
                          <span>{post.author}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>

      {headlines.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-[#2d5016] text-white py-3 overflow-hidden z-50 shadow-lg">
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