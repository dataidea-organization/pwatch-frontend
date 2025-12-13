'use client';

import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#085e29] text-white">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* About Section */}
          <div>
            <Link href="/" className="inline-block mb-4 bg-white p-2 rounded">
              <Image
                src="/images/PWATCH LOGO.png"
                alt="Parliament Watch Uganda Logo"
                width={200}
                height={67}
                className="h-12 w-auto"
                priority
              />
            </Link>
            <p className="text-sm text-gray-200 leading-relaxed mb-4">
              Parliament Watch Uganda is dedicated to providing information on Parliamentary processes 
              and increasing the transparency, responsiveness, and accountability of Parliament.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4 border-b border-white/20 pb-2">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-sm text-gray-200 hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-sm text-gray-200 hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/news" className="text-sm text-gray-200 hover:text-white transition-colors">
                  News & Updates
                </Link>
              </li>
              <li>
                <Link href="/blogs" className="text-sm text-gray-200 hover:text-white transition-colors">
                  Blogs
                </Link>
              </li>
              <li>
                <Link href="/citizens-voice" className="text-sm text-gray-200 hover:text-white transition-colors">
                  Citizens' Voice
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm text-gray-200 hover:text-white transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Trackers & Resources */}
          <div>
            <h3 className="text-lg font-semibold mb-4 border-b border-white/20 pb-2">Trackers & Resources</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/trackers/mps" className="text-sm text-gray-200 hover:text-white transition-colors">
                  Members of Parliament
                </Link>
              </li>
              <li>
                <Link href="/trackers/bills" className="text-sm text-gray-200 hover:text-white transition-colors">
                  Bills Tracker
                </Link>
              </li>
              <li>
                <Link href="/trackers/budgets" className="text-sm text-gray-200 hover:text-white transition-colors">
                  Budget Tracker
                </Link>
              </li>
              <li>
                <Link href="/trackers/loans" className="text-sm text-gray-200 hover:text-white transition-colors">
                  Loans Tracker
                </Link>
              </li>
              <li>
                <Link href="/resources/explainers" className="text-sm text-gray-200 hover:text-white transition-colors">
                  Explainers
                </Link>
              </li>
              <li>
                <Link href="/resources/reports-briefs" className="text-sm text-gray-200 hover:text-white transition-colors">
                  Reports & Briefs
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Information */}
          <div>
            <h3 className="text-lg font-semibold mb-4 border-b border-white/20 pb-2">Contact Information</h3>
            <ul className="space-y-3 text-sm text-gray-200">
              <li>
                <div className="flex items-start gap-2">
                  <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <a href="mailto:info@cepa.or.ug" className="hover:text-white transition-colors">
                    info@cepa.or.ug
                  </a>
                </div>
              </li>
              <li>
                <div className="flex items-start gap-2">
                  <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <div>
                    <a href="tel:+256414237498" className="block hover:text-white transition-colors">
                      +256 414 237 498
                    </a>
                    <a href="tel:+256772626266" className="block hover:text-white transition-colors">
                      +256 772 626 266
                    </a>
                  </div>
                </div>
              </li>
              <li>
                <div className="flex items-start gap-2">
                  <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <div className="text-gray-200">
                    Plot 18, Kanjokya Street,<br />
                    Kamwokya, Kampala<br />
                    Uganda
                  </div>
                </div>
              </li>
            </ul>

            {/* Social Media Links */}
            <div className="mt-6">
              <h4 className="text-sm font-semibold mb-3">Follow Us</h4>
              <div className="flex items-center gap-3">
                <a 
                  href="https://www.facebook.com/pwatchug" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-gray-200 hover:text-white transition-colors"
                  aria-label="Facebook"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                <a 
                  href="https://x.com/pwatchug" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-gray-200 hover:text-white transition-colors"
                  aria-label="X (Twitter)"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </a>
                <a 
                  href="https://www.linkedin.com/company/cepa-_-parliament-watch-uganda" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-gray-200 hover:text-white transition-colors"
                  aria-label="LinkedIn"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
                <a 
                  href="https://parliamentwatch.ug" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-gray-200 hover:text-white transition-colors"
                  aria-label="Website"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/20 pt-6 mt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-gray-200">
              <p>&copy; {currentYear} Parliament Watch Uganda. All rights reserved.</p>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-xs text-gray-300">
              <Link href="/contact" className="hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <span className="text-white/30">|</span>
              <Link href="/contact" className="hover:text-white transition-colors">
                Terms of Use
              </Link>
              <span className="text-white/30">|</span>
              <Link href="/contact" className="hover:text-white transition-colors">
                Accessibility
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

