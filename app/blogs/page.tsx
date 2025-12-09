'use client';

import Header from '@/components/Header';
import { useState } from 'react';

export default function BlogsPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const blogPosts = [
    {
      author: 'Faith Okaka Uwizeye',
      title: 'AFRIPAK Is Africa\'s Quiet Revolution in Governance',
      image: '/blog-1.jpg'
    },
    {
      author: 'Timothy Ameyboona',
      title: 'Ugandans Must Reject Digital Hogwash and Reclaim Constitutional Succession',
      image: '/blog-2.jpg'
    },
    {
      author: 'Eng. Olanya Otenge Tommy',
      title: 'Hands Off Our Gold: Northern Uganda\'s Fight for Equity',
      image: '/blog-3.jpg'
    },
    {
      author: 'Ochola Odonga Dominic',
      title: 'The Masindi Mass Letdown',
      image: '/blog-4.jpg'
    }
  ];

  const categories = [
    { name: 'GOVERNANCE', description: 'Lorem ipsum dolor amet consectetuer adipiscing elit sed diam nonummy nibh' },
    { name: 'LEADERSHIP', description: 'Lorem ipsum dolor amet consectetuer adipiscing elit sed diam nonummy nibh' },
    { name: 'YOUTH POWERED', description: 'Lorem ipsum dolor amet consectetuer adipiscing elit sed diam nonummy nibh' },
    { name: 'ACCOUNTABILITY', description: 'Lorem ipsum dolor amet consectetuer adipiscing elit sed diam nonummy nibh' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header variant="donate" />

      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-2/3">
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
                LATEST BLOG POSTS
              </h1>
              <div className="flex items-center gap-2">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#7AB51D]"
                >
                  <option value="all">Categories</option>
                  <option value="governance">Governance</option>
                  <option value="leadership">Leadership</option>
                  <option value="youth">Youth Powered</option>
                  <option value="accountability">Accountability</option>
                </select>
                <button className="bg-[#7AB51D] text-white px-6 py-2 rounded-md hover:bg-[#6a9e1a] transition-colors font-medium">
                  SEARCH
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {blogPosts.map((post, index) => (
                <div key={index} className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
                  <div className="relative h-64 bg-gradient-to-br from-orange-300 to-yellow-400">
                    <div className="absolute inset-0 flex items-center justify-center text-white text-sm">
                      Author Photo {index + 1}
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="text-sm font-semibold text-gray-700 mb-2">
                      By: {post.author}
                    </p>
                    <h3 className="font-bold text-gray-800 text-base mb-3">
                      {post.title}
                    </h3>
                    <a href="#" className="text-[#7AB51D] hover:text-[#6a9e1a] font-medium text-sm">
                      Read More...
                    </a>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              {categories.map((category, index) => (
                <div key={index} className="bg-gray-100 p-4 rounded-lg">
                  <h3 className="font-bold text-gray-800 text-sm mb-2">
                    {category.name}
                  </h3>
                  <p className="text-xs text-gray-600">
                    {category.description}
                  </p>
                </div>
              ))}
            </div>

            <div className="flex justify-center">
              <button className="bg-[#7AB51D] text-white px-8 py-3 rounded-md hover:bg-[#6a9e1a] transition-colors font-medium flex items-center gap-2">
                GO TO PAGE 2
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>

          <div className="lg:w-1/3">
            <div className="sticky top-4">
              <div className="relative h-[600px] bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg overflow-hidden shadow-lg">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="mb-4">
                      <div className="w-32 h-32 bg-white rounded-full mx-auto flex items-center justify-center">
                        <span className="text-4xl font-bold text-[#7AB51D]">BLOG</span>
                      </div>
                    </div>
                    <div className="flex gap-4 justify-center mt-8">
                      <div className="bg-white p-3 rounded-lg shadow">
                        <svg className="w-8 h-8 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                          <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="bg-white p-3 rounded-lg shadow">
                        <svg className="w-8 h-8 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="bg-white p-3 rounded-lg shadow">
                        <svg className="w-8 h-8 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}