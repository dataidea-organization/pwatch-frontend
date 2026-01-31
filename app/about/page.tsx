'use client';

import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import { 
  fetchWhoWeAre, 
  fetchOurStory, 
  fetchWhatSetsUsApart, 
  fetchPartners, 
  fetchTeamMembers,
  fetchPageHeroImage,
  WhoWeAre,
  OurStory,
  WhatSetsUsApart,
  Partner,
  TeamMember
} from '@/lib/api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

/** Convert YouTube watch / youtu.be URL to embed URL */
function getYouTubeEmbedUrl(url: string): string | null {
  if (!url?.trim()) return null;
  try {
    const u = url.trim();
    const watchMatch = u.match(/(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]+)/);
    if (watchMatch) return `https://www.youtube.com/embed/${watchMatch[1]}`;
    const shortMatch = u.match(/(?:youtu\.be\/)([a-zA-Z0-9_-]+)/);
    if (shortMatch) return `https://www.youtube.com/embed/${shortMatch[1]}`;
    if (u.includes('youtube.com/embed/')) return u;
    return null;
  } catch {
    return null;
  }
}

export default function AboutPage() {
  const [whoWeAre, setWhoWeAre] = useState<WhoWeAre | null>(null);
  const [ourStory, setOurStory] = useState<OurStory | null>(null);
  const [whatSetsUsApart, setWhatSetsUsApart] = useState<WhatSetsUsApart[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPartnerSlide, setCurrentPartnerSlide] = useState(0);
  const partnerCarouselRef = useRef<HTMLDivElement>(null);
  const [heroImage, setHeroImage] = useState<string>('/images/about.jpg');

  useEffect(() => {
    loadData();
    // Fetch dynamic hero image
    fetchPageHeroImage('about').then((data) => {
      if (data?.image) {
        setHeroImage(data.image);
      }
    });
  }, []);

  // Auto-slide partners carousel
  useEffect(() => {
    if (partners.length === 0) return;
    
    const interval = setInterval(() => {
      setCurrentPartnerSlide((prev) => {
        const cardsPerView = getCardsPerView();
        const maxSlide = Math.max(0, Math.ceil(partners.length / cardsPerView) - 1);
        return (prev + 1) % (maxSlide + 1);
      });
    }, 4000); // Change slide every 4 seconds

    return () => clearInterval(interval);
  }, [partners.length]);

  const getCardsPerView = () => {
    if (typeof window === 'undefined') return 4;
    if (window.innerWidth >= 1024) return 4; // lg
    if (window.innerWidth >= 768) return 3; // md
    return 2; // sm
  };

  const getMaxSlide = () => {
    if (partners.length === 0) return 0;
    const cardsPerView = getCardsPerView();
    return Math.max(0, Math.ceil(partners.length / cardsPerView) - 1);
  };

  const goToPreviousPartner = () => {
    if (partners.length === 0) return;
    const maxSlide = getMaxSlide();
    setCurrentPartnerSlide((prev) => (prev - 1 + (maxSlide + 1)) % (maxSlide + 1));
  };

  const goToNextPartner = () => {
    if (partners.length === 0) return;
    const maxSlide = getMaxSlide();
    setCurrentPartnerSlide((prev) => (prev + 1) % (maxSlide + 1));
  };

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [whoWeAreData, ourStoryData, whatSetsUsApartData, partnersData, teamData] = await Promise.all([
        fetchWhoWeAre(),
        fetchOurStory(),
        fetchWhatSetsUsApart(),
        fetchPartners(),
        fetchTeamMembers(),
      ]);
      setWhoWeAre(whoWeAreData);
      setOurStory(ourStoryData);
      setWhatSetsUsApart(whatSetsUsApartData);
      setPartners(partnersData);
      setTeamMembers(teamData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
      console.error('Error loading about page data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f0e8]">
        <main className="max-w-7xl mx-auto px-4 py-12">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#2d5016]"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#f5f0e8]">
        <main className="max-w-7xl mx-auto px-4 py-12">
          <div className="text-center">
            <p className="text-red-600">Error: {error}</p>
            <button
              onClick={loadData}
              className="mt-4 px-4 py-2 bg-[#2d5016] text-white rounded-md hover:bg-[#1b3d26] transition-colors"
            >
              Try Again
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f0e8]">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12">
        {/* Hero Section */}
        <div className="relative mb-10 h-[360px] overflow-hidden rounded-2xl shadow-xl">
          <Image
            src={heroImage}
            alt="About Us - Learn more about Parliament Watch Uganda"
            fill
            className="object-cover"
            sizes="100vw"
            priority
            unoptimized={heroImage.startsWith('http')}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-8">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-3 drop-shadow-lg">
              About Us
            </h1>
            <p className="text-lg text-white/90 max-w-2xl drop-shadow">
              Learn more about Parliament Watch Uganda and our mission
            </p>
          </div>
        </div>

        {/* Who We Are Section */}
        {whoWeAre && (
          <section className="mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 text-center">
              {whoWeAre.title}
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
              {(whoWeAre.youtube_video_url || whoWeAre.image) && (
                <div className="relative h-96 rounded-xl overflow-hidden shadow-xl bg-black">
                  {getYouTubeEmbedUrl(whoWeAre.youtube_video_url || '') ? (
                    <iframe
                      src={getYouTubeEmbedUrl(whoWeAre.youtube_video_url!)!}
                      title={whoWeAre.title}
                      className="absolute inset-0 w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : whoWeAre.image ? (
                    <img
                      src={whoWeAre.image.startsWith('http') ? whoWeAre.image : `${API_BASE_URL.replace('/api', '')}${whoWeAre.image}`}
                      alt={whoWeAre.title}
                      className="w-full h-full object-cover"
                    />
                  ) : null}
                </div>
              )}
              <div className="bg-white rounded-xl shadow-md border border-gray-200 p-8 h-96 flex flex-col">
                <div
                  className="prose prose-lg max-w-none text-gray-700 prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-[#2d5016] prose-a:no-underline hover:prose-a:underline overflow-y-auto"
                  dangerouslySetInnerHTML={{ __html: whoWeAre.content }}
                />
              </div>
            </div>
          </section>
        )}

        {/* Our Story Section */}
        {ourStory && (
          <section className="mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 text-center">
              {ourStory.title}
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
              <div className="bg-white rounded-xl shadow-md border border-gray-200 p-8 h-96 flex flex-col">
                <div
                  className="prose prose-lg max-w-none text-gray-700 prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-[#2d5016] prose-a:no-underline hover:prose-a:underline overflow-y-auto"
                  dangerouslySetInnerHTML={{ __html: ourStory.content }}
                />
              </div>
              {(ourStory.youtube_video_url || ourStory.image) && (
                <div className="relative h-96 rounded-xl overflow-hidden shadow-xl bg-black">
                  {getYouTubeEmbedUrl(ourStory.youtube_video_url || '') ? (
                    <iframe
                      src={getYouTubeEmbedUrl(ourStory.youtube_video_url!)!}
                      title={ourStory.title}
                      className="absolute inset-0 w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : ourStory.image ? (
                    <img
                      src={ourStory.image.startsWith('http') ? ourStory.image : `${API_BASE_URL.replace('/api', '')}${ourStory.image}`}
                      alt={ourStory.title}
                      className="w-full h-full object-cover"
                    />
                  ) : null}
                </div>
              )}
            </div>
          </section>
        )}

        {/* What Sets Us Apart Section */}
        {whatSetsUsApart.length > 0 && (
          <section className="mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-12 text-center">
              What Sets Us Apart
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {whatSetsUsApart.map((item, index) => (
                <div key={item.id} className="relative bg-gradient-to-br from-[#fafaf8] to-[#f5f0e8] rounded-xl p-6 shadow-md border border-gray-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 opacity-5">
                    <div className="absolute inset-0 bg-[#2d5016] rounded-full blur-2xl"></div>
                  </div>
                  <div className="relative z-10 flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-16 h-16 bg-gradient-to-br from-[#2d5016] to-[#1b3d26] rounded-xl flex items-center justify-center text-white shadow-md">
                        {item.icon ? (
                          <span className="text-2xl">{item.icon}</span>
                        ) : (
                          <span className="text-2xl font-bold">{index + 1}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Our Partners Section */}
        {partners.length > 0 && (
          <section className="mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-12 text-center">
              Our Partners
            </h2>
            <div className="relative">
              {/* Navigation Buttons */}
              <button
                onClick={goToPreviousPartner}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-[#2d5016] text-white p-3 rounded-full shadow-lg hover:bg-[#1b3d26] transition-all hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                aria-label="Previous partners"
              >
                <ChevronLeft size={24} />
              </button>
              <button
                onClick={goToNextPartner}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-[#2d5016] text-white p-3 rounded-full shadow-lg hover:bg-[#1b3d26] transition-all hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                aria-label="Next partners"
              >
                <ChevronRight size={24} />
              </button>

              {/* Carousel Container */}
              <div 
                ref={partnerCarouselRef}
                className="overflow-hidden px-12"
              >
                <div 
                  className="flex transition-transform duration-500 ease-in-out"
                  style={{
                    transform: `translateX(calc(-${currentPartnerSlide} * (100% / ${getCardsPerView()})))`,
                  }}
                >
                  {partners.map((partner) => {
                    const cardsPerView = getCardsPerView();
                    const cardWidth = `calc((100% - ${(cardsPerView - 1) * 1.5}rem) / ${cardsPerView})`;
                    return (
                      <div
                        key={partner.id}
                        className="flex-shrink-0 pr-6"
                        style={{
                          width: cardWidth,
                          minWidth: cardWidth,
                        }}
                      >
                        <div className="relative bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col items-center justify-center text-center h-full border border-gray-200">
                          {partner.logo ? (
                            <a
                              href={partner.website_url || '#'}
                              target={partner.website_url ? '_blank' : undefined}
                              rel={partner.website_url ? 'noopener noreferrer' : undefined}
                              className="block w-full"
                            >
                              <img
                                src={partner.logo.startsWith('http') ? partner.logo : `${API_BASE_URL.replace('/api', '')}${partner.logo}`}
                                alt={partner.name}
                                className="w-full h-24 object-contain mb-4"
                              />
                            </a>
                          ) : (
                            <div className="w-full h-24 flex items-center justify-center mb-4 bg-gradient-to-br from-[#fafaf8] to-[#f5f0e8] rounded-lg">
                              <span className="text-gray-400 font-semibold">{partner.name}</span>
                            </div>
                          )}
                          <h3 className="font-semibold text-gray-900 mb-2">{partner.name}</h3>
                          {partner.description && (
                            <p className="text-xs text-gray-600 line-clamp-3">{partner.description}</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Dots Indicator */}
              <div className="flex justify-center gap-2 mt-6">
                {Array.from({ length: getMaxSlide() + 1 }).map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentPartnerSlide(index)}
                    className={`h-2 rounded-full transition-all ${
                      index === currentPartnerSlide
                        ? 'bg-[#2d5016] w-8 shadow-sm'
                        : 'bg-gray-300 hover:bg-gray-400 w-2'
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Our Team Section */}
        {teamMembers.length > 0 && (
          <section className="mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-12 text-center">
              Our Team
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {teamMembers.map((member) => (
                <div key={member.id} className="bg-white rounded-xl overflow-hidden shadow-md border border-gray-200 group hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <div className="relative h-64 bg-gradient-to-br from-[#fafaf8] to-[#f5f0e8] overflow-hidden">
                    {member.photo ? (
                      <img
                        src={`${API_BASE_URL.replace('/api', '')}${member.photo}`}
                        alt={member.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#2d5016] to-[#1b3d26]">
                        <span className="text-white text-4xl font-bold">{member.name.charAt(0)}</span>
                      </div>
                    )}
                    <div className="absolute bottom-0 right-0 w-20 h-20 bg-gradient-to-br from-[#2d5016] to-[#1b3d26] opacity-90" style={{ clipPath: 'polygon(100% 0, 100% 100%, 0 100%)' }}></div>
                  </div>
                  <div className="p-5 text-center bg-white">
                    <h3 className="font-bold text-gray-900 mb-1">{member.name}</h3>
                    <p className="text-sm text-gray-600 mb-3">{member.title}</p>
                    {member.bio && (
                      <p className="text-xs text-gray-600 mb-4 line-clamp-3 leading-relaxed">{member.bio}</p>
                    )}
                    <div className="flex justify-center gap-2">
                      {member.linkedin_url && (
                        <a
                          href={member.linkedin_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-8 h-8 bg-gray-700 rounded-lg flex items-center justify-center text-white hover:bg-[#2d5016] transition-colors shadow-sm hover:shadow-md"
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                          </svg>
                        </a>
                      )}
                      {member.twitter_url && (
                        <a
                          href={member.twitter_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-8 h-8 bg-gray-700 rounded-lg flex items-center justify-center text-white hover:bg-[#2d5016] transition-colors shadow-sm hover:shadow-md"
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                          </svg>
                        </a>
                      )}
                      {member.facebook_url && (
                        <a
                          href={member.facebook_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-8 h-8 bg-gray-700 rounded-lg flex items-center justify-center text-white hover:bg-[#2d5016] transition-colors shadow-sm hover:shadow-md"
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                          </svg>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
