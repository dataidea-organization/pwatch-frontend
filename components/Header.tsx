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
        const results = await searchGlobal(searchQuery, 3); // 3 results per category for dropdown
        setSearchResults(results);
        setShowDropdown(true);
      } catch (error: any) {
        if (error.name !== 'AbortError') {
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
    <header className="w-full bg-white">
      <div className="bg-[#085e29] px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <a href="#" className="text-white hover:opacity-80">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
          </a>
          <a href="#" className="text-white hover:opacity-80">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
          </a>
          <a href="#" className="text-white hover:opacity-80">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"/>
            </svg>
          </a>
          <a href="#" className="text-white hover:opacity-80">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
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
                className="absolute top-full left-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 max-h-96 overflow-y-auto z-50"
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
                      className="block px-2 py-2 text-center text-sm font-medium text-[#085e29] hover:bg-gray-50 rounded"
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
                <Button variant="ghost" className="text-gray-700 hover:text-[#085e29] font-medium text-sm h-auto p-0">
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
                <Button variant="ghost" className="text-gray-700 hover:text-[#085e29] font-medium text-sm h-auto p-0">
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
                <Button variant="ghost" className="text-gray-700 hover:text-[#085e29] font-medium text-sm h-auto p-0">
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
              </DropdownMenuContent>
            </DropdownMenu>

            <Link href="/citizens-voice" className="text-gray-700 hover:text-[#085e29] font-medium text-sm">
              Citizens' Voice
            </Link>
            <Link href="/news" className="text-gray-700 hover:text-[#085e29] font-medium text-sm">
              News&Update
            </Link>
            <Link href="/blogs" className="text-gray-700 hover:text-[#085e29] font-medium text-sm">
              Blogs
            </Link>
            <Link href="/contact" className="text-gray-700 hover:text-[#085e29] font-medium text-sm">
              Contact
            </Link>
            <Link href="/about" className="text-gray-700 hover:text-[#085e29] font-medium text-sm">
              About Us
            </Link>
          </nav>

          <button className="md:hidden">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}