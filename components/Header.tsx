'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function Header({ variant = 'support' }: { variant?: 'support' | 'donate' }) {
  const [searchQuery, setSearchQuery] = useState('');

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
              {variant === 'support' ? 'Support Us' : 'Donate'}
            </Button>
          </Link>
          <div className="relative">
            <Input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-white/20 text-white placeholder-white/70 border-0 px-4 py-1 pr-10 rounded-full text-sm focus-visible:ring-0 focus-visible:bg-white/30"
            />
            <button className="absolute right-2 top-1/2 -translate-y-1/2 text-white">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>
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

            <Link href="/citizen-voices" className="text-gray-700 hover:text-[#085e29] font-medium text-sm">
              Citizen Voices
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