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
          <div className="">
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
                LATEST BLOG POSTS
              </h1>
              <div className="flex items-center gap-2">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#085e29]"
                >
                  <option value="all">Categories</option>
                  <option value="governance">Governance</option>
                  <option value="leadership">Leadership</option>
                  <option value="youth">Youth Powered</option>
                  <option value="accountability">Accountability</option>
                </select>
                <button className="bg-[#085e29] text-white px-6 py-2 rounded-md hover:bg-[#064920] transition-colors font-medium">
                  SEARCH
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
                    <a href="#" className="text-[#085e29] hover:text-[#064920] font-medium text-sm">
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
              <button className="bg-[#085e29] text-white px-8 py-3 rounded-md hover:bg-[#064920] transition-colors font-medium flex items-center gap-2">
                GO TO PAGE 2
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}