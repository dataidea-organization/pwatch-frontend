'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { searchGlobal, GlobalSearchResponse } from '@/lib/api';

export default function Header() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<GlobalSearchResponse | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openMobileDropdown, setOpenMobileDropdown] = useState<string | null>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Debounced search
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (searchQuery.trim().length < 2) {
      setSearchResults(null);
      setShowDropdown(false);
      return;
    }

    setIsSearching(true);
    searchTimeoutRef.current = setTimeout(async () => {
      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new abort controller
      abortControllerRef.current = new AbortController();

      try {
        const results = await searchGlobal(searchQuery, 3, abortControllerRef.current?.signal); // 3 results per category for dropdown
        setSearchResults(results);
        setShowDropdown(true);
      } catch (error: any) {
        if (error.name !== 'AbortError' && error.name !== 'DOMException') {
          console.error('Search error:', error);
          setSearchResults(null);
        }
      } finally {
        setIsSearching(false);
      }
    }, 300); // 300ms debounce

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setShowDropdown(false);
    }
  };

  const handleSearchIconClick = () => {
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setShowDropdown(false);
    }
  };

  const getResultUrl = (type: string, result: any): string => {
    switch (type) {
      case 'news':
        return `/news/${result.slug}`;
      case 'blogs':
        return `/blogs/${result.slug}`;
      case 'mps':
        return `/trackers/mps/${result.id}`;
      case 'bills':
        return `/trackers/bills/${result.id}`;
      case 'loans':
        return `/trackers/loans`;
      case 'budgets':
        return `/trackers/budgets`;
      case 'hansards':
        return `/trackers/hansards`;
      case 'order_papers':
        return `/trackers/order-paper`;
      case 'explainers':
        return 'https://www.youtube.com/@Centre4PolicyAnalysis';
      case 'reports':
        return `/resources/reports-briefs`;
      case 'statements':
        return `/resources/statements`;
      case 'podcasts':
        return `/multimedia/podcast`;
      case 'xspaces':
        return `/multimedia/x-spaces`;
      case 'gallery':
        return `/multimedia/gallery`;
      case 'polls':
        return `/citizens-voice`;
      default:
        return '/';
    }
  };

  const getResultTitle = (result: any): string => {
    return result.title || result.name || 'Untitled';
  };

  return (
    <header className="w-full bg-gradient-to-br from-[#fafaf8] to-[#f5f0e8] shadow-md sticky top-0 z-50">
      <div className="bg-gradient-to-r from-[#2d5016] to-[#1b3d26] px-4 py-2.5 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <a href="https://wa.me/256393228160" target="_blank" rel="noopener noreferrer" className="text-white hover:text-white/80 transition-colors hover:scale-110 transform duration-200" aria-label="WhatsApp">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
          </a>
          <a href="https://x.com/pwatchug" target="_blank" rel="noopener noreferrer" className="text-white hover:text-white/80 transition-colors hover:scale-110 transform duration-200" aria-label="X (Twitter)">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
          </a>
          <a href="https://www.tiktok.com/@pwatchug" target="_blank" rel="noopener noreferrer" className="text-white hover:text-white/80 transition-colors hover:scale-110 transform duration-200" aria-label="TikTok">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
            </svg>
          </a>
          <a href="https://www.linkedin.com/company/cepa-_-parliament-watch-uganda" target="_blank" rel="noopener noreferrer" className="text-white hover:text-white/80 transition-colors hover:scale-110 transform duration-200" aria-label="LinkedIn">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
          </a>
          <a href="https://www.facebook.com/pwatchug" target="_blank" rel="noopener noreferrer" className="text-white hover:text-white/80 transition-colors hover:scale-110 transform duration-200" aria-label="Facebook">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
          </a>
          <a href="https://parliamentwatch.ug" target="_blank" rel="noopener noreferrer" className="text-white hover:text-white/80 transition-colors hover:scale-110 transform duration-200" aria-label="Website">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
            </svg>
          </a>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/donate">
            <Button variant="ghost" className="text-white hover:bg-white/20 hover:text-white rounded-lg transition-all hover:shadow-sm">
              Support Us
            </Button>
          </Link>
          <form onSubmit={handleSearchSubmit} className="relative">
            <Input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => {
                if (searchResults && searchResults.total_results > 0) {
                  setShowDropdown(true);
                }
              }}
              className="bg-white/20 text-white placeholder-white/70 border-0 px-4 py-2 pr-10 rounded-full text-sm focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:bg-white/30 shadow-sm transition-all"
            />
            <button
              type="button"
              onClick={handleSearchIconClick}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-white hover:text-white/80"
            >
              {isSearching ? (
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              )}
            </button>

            {/* Search Dropdown */}
            {showDropdown && searchResults && searchResults.total_results > 0 && (
              <div
                ref={dropdownRef}
                className="absolute top-full right-0 mt-2 w-96 max-w-[calc(100vw-2rem)] sm:max-w-none bg-white rounded-xl shadow-xl border border-gray-200 max-h-96 overflow-y-auto z-50"
              >
                <div className="p-2">
                  {Object.entries(searchResults.results).map(([type, results]) => {
                    if (!results || results.length === 0) return null;
                    
                    const typeLabels: { [key: string]: string } = {
                      news: 'News',
                      blogs: 'Blogs',
                      mps: 'MPs',
                      bills: 'Bills',
                      loans: 'Loans',
                      budgets: 'Budgets',
                      hansards: 'Hansards',
                      order_papers: 'Order Papers',
                      explainers: 'Explainers',
                      reports: 'Reports',
                      statements: 'Statements',
                      podcasts: 'Podcasts',
                      xspaces: 'X Spaces',
                      gallery: 'Gallery',
                      polls: 'Polls',
                    };

                    return (
                      <div key={type} className="mb-4 last:mb-0">
                        <h4 className="text-xs font-semibold text-gray-500 uppercase px-2 py-1">
                          {typeLabels[type] || type}
                        </h4>
                        <div className="space-y-1">
                          {results.slice(0, 3).map((result) => (
                            <Link
                              key={result.id}
                              href={getResultUrl(type, result)}
                              onClick={() => setShowDropdown(false)}
                              className="block px-3 py-2 hover:bg-gradient-to-br hover:from-[#fafaf8] hover:to-[#f5f0e8] rounded-lg text-sm transition-all"
                            >
                              <p className="font-medium text-gray-900 line-clamp-1">
                                {getResultTitle(result)}
                              </p>
                              {result.author && (
                                <p className="text-xs text-gray-500 mt-0.5">By {result.author}</p>
                              )}
                            </Link>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                  
                  <div className="border-t border-gray-200 mt-2 pt-2">
                    <Link
                      href={`/search?q=${encodeURIComponent(searchQuery)}`}
                      onClick={() => setShowDropdown(false)}
                      className="block px-3 py-2 text-center text-sm font-medium text-[#2d5016] hover:bg-gradient-to-br hover:from-[#fafaf8] hover:to-[#f5f0e8] rounded-lg transition-all"
                    >
                      View all {searchResults.total_results} results
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>

      <div className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
            <Image
              src="/images/PWATCH LOGO.png"
              alt="Parliament Watch Uganda Logo"
              width={320}
              height={160}
              className="h-auto w-auto"
              priority
            />
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link href="/news" className="text-gray-700 hover:text-[#2d5016] font-medium text-sm transition-colors relative group">
              News & Updates
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#2d5016] transition-all group-hover:w-full"></span>
            </Link>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="text-gray-700 hover:text-[#2d5016] font-medium text-sm h-auto p-0 transition-colors relative group">
                  Resources
                  <svg className="ml-1 w-4 h-4 transition-transform group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#2d5016] transition-all group-hover:w-full"></span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56 bg-white rounded-xl shadow-lg border border-gray-200 p-2">
                <DropdownMenuItem asChild className="focus:bg-transparent focus:text-gray-900">
                  <Link href="/resources/reports-briefs" className="w-full cursor-pointer rounded-lg hover:bg-gradient-to-br hover:from-[#fafaf8] hover:to-[#f5f0e8] transition-all text-gray-900 hover:text-gray-900 focus:text-gray-900">Reports &amp; Briefs</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="focus:bg-transparent focus:text-gray-900">
                  <Link href="/resources/statements" className="w-full cursor-pointer rounded-lg hover:bg-gradient-to-br hover:from-[#fafaf8] hover:to-[#f5f0e8] transition-all text-gray-900 hover:text-gray-900 focus:text-gray-900">Statements</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="focus:bg-transparent focus:text-gray-900">
                  <Link href="/resources/committees" className="w-full cursor-pointer rounded-lg hover:bg-gradient-to-br hover:from-[#fafaf8] hover:to-[#f5f0e8] transition-all text-gray-900 hover:text-gray-900 focus:text-gray-900">Committees</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="focus:bg-transparent focus:text-gray-900">
                  <a href="https://www.youtube.com/@Centre4PolicyAnalysis" target="_blank" rel="noopener noreferrer" className="w-full cursor-pointer rounded-lg hover:bg-gradient-to-br hover:from-[#fafaf8] hover:to-[#f5f0e8] transition-all text-gray-900 hover:text-gray-900 focus:text-gray-900">Explainers</a>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="focus:bg-transparent focus:text-gray-900">
                  <Link href="/chatbot" className="w-full cursor-pointer rounded-lg hover:bg-gradient-to-br hover:from-[#fafaf8] hover:to-[#f5f0e8] transition-all text-gray-900 hover:text-gray-900 focus:text-gray-900">Chatbot</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="text-gray-700 hover:text-[#2d5016] font-medium text-sm h-auto p-0 transition-colors relative group">
                  Trackers
                  <svg className="ml-1 w-4 h-4 transition-transform group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#2d5016] transition-all group-hover:w-full"></span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-64 bg-white rounded-xl shadow-lg border border-gray-200 p-2">
                <DropdownMenuItem asChild className="focus:bg-transparent focus:text-gray-900">
                    <Link href="/trackers/mps" className="w-full cursor-pointer rounded-lg hover:bg-gradient-to-br hover:from-[#fafaf8] hover:to-[#f5f0e8] transition-all text-gray-900 hover:text-gray-900 focus:text-gray-900">Members of Parliament</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="focus:bg-transparent focus:text-gray-900">
                  <Link href="/trackers/bills" className="w-full cursor-pointer rounded-lg hover:bg-gradient-to-br hover:from-[#fafaf8] hover:to-[#f5f0e8] transition-all text-gray-900 hover:text-gray-900 focus:text-gray-900">Bills Tracker</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="focus:bg-transparent focus:text-gray-900">
                  <Link href="/trackers/loans" className="w-full cursor-pointer rounded-lg hover:bg-gradient-to-br hover:from-[#fafaf8] hover:to-[#f5f0e8] transition-all text-gray-900 hover:text-gray-900 focus:text-gray-900">Loans Tracker</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="focus:bg-transparent focus:text-gray-900">
                  <Link href="/trackers/debt" className="w-full cursor-pointer rounded-lg hover:bg-gradient-to-br hover:from-[#fafaf8] hover:to-[#f5f0e8] transition-all text-gray-900 hover:text-gray-900 focus:text-gray-900">Debt Tracker</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="focus:bg-transparent focus:text-gray-900">
                  <Link href="/trackers/budgets" className="w-full cursor-pointer rounded-lg hover:bg-gradient-to-br hover:from-[#fafaf8] hover:to-[#f5f0e8] transition-all text-gray-900 hover:text-gray-900 focus:text-gray-900">Budget Tracker</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="focus:bg-transparent focus:text-gray-900">
                  <Link href="/trackers/hansards" className="w-full cursor-pointer rounded-lg hover:bg-gradient-to-br hover:from-[#fafaf8] hover:to-[#f5f0e8] transition-all text-gray-900 hover:text-gray-900 focus:text-gray-900">Hansards Tracker</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="focus:bg-transparent focus:text-gray-900">
                  <Link href="/trackers/order-paper" className="w-full cursor-pointer rounded-lg hover:bg-gradient-to-br hover:from-[#fafaf8] hover:to-[#f5f0e8] transition-all text-gray-900 hover:text-gray-900 focus:text-gray-900">Order Paper Tracker</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="focus:bg-transparent focus:text-gray-900">
                    <Link href="/trackers/parliament-performance" className="w-full cursor-pointer rounded-lg hover:bg-gradient-to-br hover:from-[#fafaf8] hover:to-[#f5f0e8] transition-all text-gray-900 hover:text-gray-900 focus:text-gray-900">Parliament Performance Tracker</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="text-gray-700 hover:text-[#2d5016] font-medium text-sm h-auto p-0 transition-colors relative group">
                  Multimedia
                  <svg className="ml-1 w-4 h-4 transition-transform group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#2d5016] transition-all group-hover:w-full"></span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48 bg-white rounded-xl shadow-lg border border-gray-200 p-2">
                <DropdownMenuItem asChild className="focus:bg-transparent focus:text-gray-900">
                  <Link href="/multimedia/x-spaces" className="w-full cursor-pointer rounded-lg hover:bg-gradient-to-br hover:from-[#fafaf8] hover:to-[#f5f0e8] transition-all text-gray-900 hover:text-gray-900 focus:text-gray-900">X Spaces</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="focus:bg-transparent focus:text-gray-900">
                  <Link href="/multimedia/podcast" className="w-full cursor-pointer rounded-lg hover:bg-gradient-to-br hover:from-[#fafaf8] hover:to-[#f5f0e8] transition-all text-gray-900 hover:text-gray-900 focus:text-gray-900">Podcast</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="focus:bg-transparent focus:text-gray-900">
                  <Link href="/multimedia/gallery" className="w-full cursor-pointer rounded-lg hover:bg-gradient-to-br hover:from-[#fafaf8] hover:to-[#f5f0e8] transition-all text-gray-900 hover:text-gray-900 focus:text-gray-900">Gallery</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="text-gray-700 hover:text-[#2d5016] font-medium text-sm h-auto p-0 transition-colors relative group">
                  Citizens&apos; Voice
                  <svg className="ml-1 w-4 h-4 transition-transform group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#2d5016] transition-all group-hover:w-full"></span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-52 bg-white rounded-xl shadow-lg border border-gray-200 p-2">
                <DropdownMenuItem asChild className="focus:bg-transparent focus:text-gray-900">
                  <Link href="/citizens-voice" className="w-full cursor-pointer rounded-lg hover:bg-[#f5f0e8] transition-all text-gray-900">Engage</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="focus:bg-transparent focus:text-gray-900">
                  <Link href="/citizens-voice/polls" className="w-full cursor-pointer rounded-lg hover:bg-[#f5f0e8] transition-all text-gray-900">Polls</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="focus:bg-transparent focus:text-gray-900">
                  <Link href="/citizens-voice/trivia" className="w-full cursor-pointer rounded-lg hover:bg-[#f5f0e8] transition-all text-gray-900">Trivia</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Link href="/blogs" className="text-gray-700 hover:text-[#2d5016] font-medium text-sm transition-colors relative group">
              Blogs
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#2d5016] transition-all group-hover:w-full"></span>
            </Link>
            <Link href="/contact" className="text-gray-700 hover:text-[#2d5016] font-medium text-sm transition-colors relative group">
              Contact
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#2d5016] transition-all group-hover:w-full"></span>
            </Link>
            <Link href="/about" className="text-gray-700 hover:text-[#2d5016] font-medium text-sm transition-colors relative group">
              About Us
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#2d5016] transition-all group-hover:w-full"></span>
            </Link>
          </nav>

          <button 
            className="md:hidden p-2 rounded-lg hover:bg-gradient-to-br hover:from-[#fafaf8] hover:to-[#f5f0e8] transition-all"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle mobile menu"
          >
            <svg className="w-6 h-6 text-[#2d5016]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-gradient-to-br from-[#fafaf8] to-[#f5f0e8] shadow-lg">
            <nav className="px-4 py-4 space-y-2">
              {/* News Link */}
              <Link 
                href="/news" 
                className="block text-gray-700 hover:text-[#2d5016] font-medium text-sm py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                News&Update
              </Link>

              {/* Resources Dropdown */}
              <div>
                <button
                  onClick={() => setOpenMobileDropdown(openMobileDropdown === 'resources' ? null : 'resources')}
                  className="w-full flex items-center justify-between text-gray-700 hover:text-[#2d5016] font-medium text-sm py-2"
                >
                  Resources
                  <svg 
                    className={`w-4 h-4 transition-transform ${openMobileDropdown === 'resources' ? 'rotate-180' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {openMobileDropdown === 'resources' && (
                  <div className="pl-4 space-y-2 mt-2">
                    <a 
                      href="https://www.youtube.com/@Centre4PolicyAnalysis" 
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-gray-600 hover:text-[#2d5016] text-sm py-1"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Explainers
                    </a>
                    <Link 
                      href="/resources/reports-briefs" 
                      className="block text-gray-600 hover:text-[#2d5016] text-sm py-1"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Reports & Briefs
                    </Link>
                    <Link 
                      href="/resources/statements" 
                      className="block text-gray-600 hover:text-[#2d5016] text-sm py-1"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Statements
                    </Link>
                    <Link 
                      href="/resources/committees" 
                      className="block text-gray-600 hover:text-[#2d5016] text-sm py-1"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Committees
                    </Link>
                    <Link 
                      href="/chatbot" 
                      className="block text-gray-600 hover:text-[#2d5016] text-sm py-1"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Chatbot
                    </Link>
                  </div>
                )}
              </div>

              {/* Trackers Dropdown */}
              <div>
                <button
                  onClick={() => setOpenMobileDropdown(openMobileDropdown === 'trackers' ? null : 'trackers')}
                  className="w-full flex items-center justify-between text-gray-700 hover:text-[#2d5016] font-medium text-sm py-2"
                >
                  Trackers
                  <svg 
                    className={`w-4 h-4 transition-transform ${openMobileDropdown === 'trackers' ? 'rotate-180' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {openMobileDropdown === 'trackers' && (
                  <div className="pl-4 space-y-2 mt-2">
                    <Link 
                      href="/trackers/mps" 
                      className="block text-gray-600 hover:text-[#2d5016] text-sm py-1"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Members of Parliament
                    </Link>
                    <Link 
                      href="/trackers/bills" 
                      className="block text-gray-600 hover:text-[#2d5016] text-sm py-1"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Bills Tracker
                    </Link>
                    <Link 
                      href="/trackers/loans" 
                      className="block text-gray-600 hover:text-[#2d5016] text-sm py-1"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Loans Tracker
                    </Link>
                    <Link 
                      href="/trackers/debt" 
                      className="block text-gray-600 hover:text-[#2d5016] text-sm py-1"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Debt Tracker
                    </Link>
                    <Link 
                      href="/trackers/budgets" 
                      className="block text-gray-600 hover:text-[#2d5016] text-sm py-1"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Budget Tracker
                    </Link>
                    <Link 
                      href="/trackers/hansards" 
                      className="block text-gray-600 hover:text-[#2d5016] text-sm py-1"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Hansards Tracker
                    </Link>
                    <Link 
                      href="/trackers/order-paper" 
                      className="block text-gray-600 hover:text-[#2d5016] text-sm py-1"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Order Paper Tracker
                    </Link>
                    <Link 
                      href="/trackers/parliament-performance" 
                      className="block text-gray-600 hover:text-[#2d5016] text-sm py-1"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Parliament Performance Tracker
                    </Link>
                  </div>
                )}
              </div>

              {/* Multimedia Dropdown */}
              <div>
                <button
                  onClick={() => setOpenMobileDropdown(openMobileDropdown === 'multimedia' ? null : 'multimedia')}
                  className="w-full flex items-center justify-between text-gray-700 hover:text-[#2d5016] font-medium text-sm py-2"
                >
                  Multimedia
                  <svg 
                    className={`w-4 h-4 transition-transform ${openMobileDropdown === 'multimedia' ? 'rotate-180' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {openMobileDropdown === 'multimedia' && (
                  <div className="pl-4 space-y-2 mt-2">
                    <Link 
                      href="/multimedia/x-spaces" 
                      className="block text-gray-600 hover:text-[#2d5016] text-sm py-1"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      X Spaces
                    </Link>
                    <Link 
                      href="/multimedia/podcast" 
                      className="block text-gray-600 hover:text-[#2d5016] text-sm py-1"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Podcast
                    </Link>
                    <Link 
                      href="/multimedia/gallery" 
                      className="block text-gray-600 hover:text-[#2d5016] text-sm py-1"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Gallery
                    </Link>
                  </div>
                )}
              </div>

              {/* Citizens' Voice Dropdown */}
              <div>
                <button
                  onClick={() => setOpenMobileDropdown(openMobileDropdown === 'citizens-voice' ? null : 'citizens-voice')}
                  className="w-full flex items-center justify-between text-gray-700 hover:text-[#2d5016] font-medium text-sm py-2"
                >
                  Citizens&apos; Voice
                  <svg 
                    className={`w-4 h-4 transition-transform ${openMobileDropdown === 'citizens-voice' ? 'rotate-180' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {openMobileDropdown === 'citizens-voice' && (
                  <div className="pl-4 space-y-2 mt-2">
                    <Link 
                      href="/citizens-voice" 
                      className="block text-gray-600 hover:text-[#2d5016] text-sm py-1"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Engage
                    </Link>
                    <Link 
                      href="/citizens-voice/polls" 
                      className="block text-gray-600 hover:text-[#2d5016] text-sm py-1"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Polls
                    </Link>
                    <Link 
                      href="/citizens-voice/trivia" 
                      className="block text-gray-600 hover:text-[#2d5016] text-sm py-1"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Trivia
                    </Link>
                  </div>
                )}
              </div>

              {/* Direct Links */}
              <Link 
                href="/blogs" 
                className="block text-gray-700 hover:text-[#2d5016] font-medium text-sm py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Blogs
              </Link>
              <Link 
                href="/contact" 
                className="block text-gray-700 hover:text-[#2d5016] font-medium text-sm py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Contact
              </Link>
              <Link 
                href="/about" 
                className="block text-gray-700 hover:text-[#2d5016] font-medium text-sm py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                About Us
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}