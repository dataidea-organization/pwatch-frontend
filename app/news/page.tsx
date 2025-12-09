import Header from '@/components/Header';

export default function NewsPage() {
  const newsArticles = [
    {
      title: 'House Rejects Energy Efficiency Bill for Worsening Electricity Crisis',
      date: 'September 22, 2025',
      author: 'Prluck Manyanya',
      category: 'Latest on Blogs',
      image: '/news-1.jpg'
    },
    {
      title: 'Uganda Law Society Captures Narrow Scope of Human Resource Bill',
      date: 'September 22, 2025',
      author: 'Prluck Manyanya',
      category: 'Latest on Blogs',
      image: '/news-2.jpg'
    },
    {
      title: "Inside Parliament's Big Promise: A UGX 6.6 Trillion Roadmap for Change",
      date: 'September 22, 2025',
      author: 'Immaculate Asenyanye',
      category: 'Latest on Blogs',
      image: '/news-3.jpg'
    },
    {
      title: 'Butabika Overstretched: MPs Decry Mental Health Care Gaps',
      date: 'September 25, 2025',
      author: 'Prluck Manyanya',
      category: 'Latest on Blogs',
      image: '/news-4.jpg'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header variant="support" />

      <main className="bg-gradient-to-b from-gray-100 to-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
              If it happened in Parliament, it&apos;s right here
            </h1>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {newsArticles.map((article, index) => (
              <div key={index} className="bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
                <div className="relative h-48 bg-gradient-to-br from-orange-400 to-pink-500">
                  <div className="absolute inset-0 flex items-center justify-center text-white text-sm">
                    News Image {index + 1}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-gray-800 text-sm mb-3 line-clamp-3">
                    {article.title}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-gray-600 mb-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>{article.date}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span>{article.author}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 flex justify-center">
            <button className="bg-[#7AB51D] text-white px-8 py-3 rounded-md hover:bg-[#6a9e1a] transition-colors font-medium">
              Load More Articles
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}