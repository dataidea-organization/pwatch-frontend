import Header from '@/components/Header';
import Image from 'next/image';
import { Button } from '@/components/ui/button';

export default function Home() {
  const newsItems = [
    {
      title: 'MPs Doubt Impact of State Funds Model Ministerial Poverty',
      image: '/news1.jpg',
      category: 'LATEST ON BLOGS'
    },
    {
      title: 'News Item 2',
      image: '/news2.jpg',
      category: 'News and Updates'
    },
    {
      title: 'News Item 3',
      image: '/news3.jpg',
      category: 'News and Updates'
    },
    {
      title: 'News Item 4',
      image: '/news4.jpg',
      category: 'LATEST ON BLOGS'
    },
    {
      title: 'News Item 5',
      image: '/news5.jpg',
      category: 'LATEST ON BLOGS'
    },
    {
      title: 'News Item 6',
      image: '/news6.jpg',
      category: 'LATEST ON BLOGS'
    }
  ];

  const carouselImages = [
    '/mp1.jpg',
    '/mp2.jpg',
    '/mp3.jpg',
    '/mp4.jpg'
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header variant="support" />

      <main className="max-w-7xl mx-auto px-4 py-6 pb-20">
        <div className="">
          <div className="lg:col-span-2">
            <div className="relative h-[400px] rounded-lg overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent z-10" />
              <Image
                src="/parliament.jpg"
                alt="Parliament Building"
                fill
                className="object-cover"
                priority
              />
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
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
                <div className="w-2 h-2 rounded-full bg-white" />
                <div className="w-2 h-2 rounded-full bg-white/50" />
                <div className="w-2 h-2 rounded-full bg-white/50" />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-2xl font-bold text-gray-800">News and Updates</h3>
            <Button variant="ghost" className="text-[#085e29] hover:text-[#064920] font-medium h-auto p-0">
              View All
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {newsItems.map((item, index) => (
              <div key={index} className="rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
                <div className="relative h-48 bg-gray-200">
                  <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                    News Image {index + 1}
                  </div>
                </div>
                <div className="p-4 bg-white">
                  <span className="text-xs font-semibold text-[#085e29] uppercase">
                    {item.category}
                  </span>
                  <h4 className="mt-2 text-sm font-semibold text-gray-800 line-clamp-2">
                    {item.title}
                  </h4>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 bg-[#085e29] text-white py-3 overflow-hidden z-50 shadow-lg">
        <div className="animate-marquee whitespace-nowrap">
          <span className="text-sm font-medium mx-8">
            <span className="font-bold">Top Stories:</span> Power transition underway;Museveni confirms
          </span>
          <span className="text-sm font-medium mx-8">
            Among backs MP&apos;s
          </span>
          <span className="text-sm font-medium mx-8">
            <span className="font-bold">Top Stories:</span> Power transition underway;Museveni confirms
          </span>
          <span className="text-sm font-medium mx-8">
            Among backs MP&apos;s
          </span>
        </div>
      </div>
    </div>
  );
}