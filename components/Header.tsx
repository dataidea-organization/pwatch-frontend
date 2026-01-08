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
        return `/resources/explainers`;
      case 'reports':
        return `/resources/reports-briefs`;
      case 'partner_publications':
        return `/resources/partner-publications`;
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
    <header className="w-full bg-[#f3eed4]">
      <div className="bg-[#2d5016] px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <a href="https://www.facebook.com/pwatchug" target="_blank" rel="noopener noreferrer" className="text-white hover:opacity-80" aria-label="Facebook">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
          </a>
          <a href="https://x.com/pwatchug" target="_blank" rel="noopener noreferrer" className="text-white hover:opacity-80" aria-label="X (Twitter)">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
          </a>
          <a href="https://www.linkedin.com/company/cepa-_-parliament-watch-uganda" target="_blank" rel="noopener noreferrer" className="text-white hover:opacity-80" aria-label="LinkedIn">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
          </a>
          <a href="https://parliamentwatch.ug" target="_blank" rel="noopener noreferrer" className="text-white hover:opacity-80" aria-label="Website">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
            </svg>
          </a>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/donate">
            <Button variant="ghost" className="text-white hover:bg-white/20 hover:text-white">
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
              className="bg-white/20 text-white placeholder-white/70 border-0 px-4 py-1 pr-10 rounded-full text-sm focus-visible:ring-0 focus-visible:bg-white/30"
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
                className="absolute top-full right-0 mt-2 w-96 max-w-[calc(100vw-2rem)] sm:max-w-none bg-[#f3eed4] rounded-lg shadow-xl border border-gray-200 max-h-96 overflow-y-auto z-50"
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
                      partner_publications: 'Partner Publications',
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
                              className="block px-2 py-2 hover:bg-gray-50 rounded text-sm"
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
                      className="block px-2 py-2 text-center text-sm font-medium text-[#2d5016] hover:bg-gray-50 rounded"
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

      <div className="border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/images/PWATCH LOGO.png"
              alt="Parliament Watch Uganda Logo"
              width={240}
              height={80}
              className="h-16 w-auto"
              priority
            />
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="text-gray-700 hover:text-[#2d5016] font-medium text-sm h-auto p-0">
                  Trackers
                  <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-64">
                <DropdownMenuItem asChild>
                    <Link href="/trackers/mps" className="w-full cursor-pointer">Members of Parliament</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/trackers/bills" className="w-full cursor-pointer">Bills Tracker</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/trackers/loans" className="w-full cursor-pointer">Loans Tracker</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/trackers/debt" className="w-full cursor-pointer">Debt Tracker</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/trackers/budgets" className="w-full cursor-pointer">Budget Tracker</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/trackers/hansards" className="w-full cursor-pointer">Hansards Tracker</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/trackers/order-paper" className="w-full cursor-pointer">Order Paper Tracker</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <Link href="/trackers/parliament-performance" className="w-full cursor-pointer">Parliament Performance Tracker</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="text-gray-700 hover:text-[#2d5016] font-medium text-sm h-auto p-0">
                  Multimedia
                  <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                <DropdownMenuItem asChild>
                  <Link href="/multimedia/x-spaces" className="w-full cursor-pointer">X Spaces</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/multimedia/podcast" className="w-full cursor-pointer">Podcast</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/multimedia/gallery" className="w-full cursor-pointer">Gallery</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="text-gray-700 hover:text-[#2d5016] font-medium text-sm h-auto p-0">
                  Resources
                  <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuItem asChild>
                  <Link href="/resources/explainers" className="w-full cursor-pointer">Explainers</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/resources/reports-briefs" className="w-full cursor-pointer">Reports &amp; Briefs</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/resources/partner-publications" className="w-full cursor-pointer">Partner Publications</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/resources/statements" className="w-full cursor-pointer">Statements</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/resources/committees" className="w-full cursor-pointer">Committees</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/chatbot" className="w-full cursor-pointer">Chatbot</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Link href="/citizens-voice" className="text-gray-700 hover:text-[#2d5016] font-medium text-sm">
              Citizens' Voice
            </Link>
            <Link href="/news" className="text-gray-700 hover:text-[#2d5016] font-medium text-sm">
              News&Update
            </Link>
            <Link href="/blogs" className="text-gray-700 hover:text-[#2d5016] font-medium text-sm">
              Blogs
            </Link>
            <Link href="/contact" className="text-gray-700 hover:text-[#2d5016] font-medium text-sm">
              Contact
            </Link>
            <Link href="/about" className="text-gray-700 hover:text-[#2d5016] font-medium text-sm">
              About Us
            </Link>
          </nav>

          <button 
            className="md:hidden"
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
          <div className="md:hidden border-t bg-[#f3eed4]">
            <nav className="px-4 py-4 space-y-4">
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
                    <Link 
                      href="/resources/explainers" 
                      className="block text-gray-600 hover:text-[#2d5016] text-sm py-1"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Explainers
                    </Link>
                    <Link 
                      href="/resources/reports-briefs" 
                      className="block text-gray-600 hover:text-[#2d5016] text-sm py-1"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Reports & Briefs
                    </Link>
                    <Link 
                      href="/resources/partner-publications" 
                      className="block text-gray-600 hover:text-[#2d5016] text-sm py-1"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Partner Publications
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

              {/* Direct Links */}
              <Link 
                href="/citizens-voice" 
                className="block text-gray-700 hover:text-[#2d5016] font-medium text-sm py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Citizens' Voice
              </Link>
              <Link 
                href="/news" 
                className="block text-gray-700 hover:text-[#2d5016] font-medium text-sm py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                News&Update
              </Link>
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