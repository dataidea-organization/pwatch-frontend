import Header from '@/components/Header';

export default function TrackersPage() {
  const billReadings = [
    {
      stage: '1st Reading',
      title: 'The Forensic and Scientific Analytical Services Bill, 2025 seeks to regulate forensic and scientific analytical services, establish and designate',
      action: 'Read or Download Tabled Bill',
      color: 'bg-[#085e29]'
    },
    {
      stage: '2nd Reading',
      title: 'The Forensic and Scientific Analytical Services Bill, 2025 seeks to regulate forensic and scientific analytical services, establish and designate',
      action: 'Read or Download Committee Report',
      subAction: 'Download CEPA Analysis',
      color: 'bg-[#085e29]'
    },
    {
      stage: '3rd Reading',
      title: 'The Forensic and Scientific Analytical Services Bill, 2025 seeks to regulate forensic and scientific analytical services, establish and designate',
      action: 'Read or Download Analysis',
      color: 'bg-[#085e29]'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <div className="bg-[#085e29] rounded-3xl p-6 relative overflow-hidden">
            <div className="relative h-96 bg-gray-800 rounded-2xl overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                <button className="w-20 h-20 bg-white bg-opacity-30 rounded-full flex items-center justify-center hover:bg-opacity-40 transition-colors">
                  <svg className="w-10 h-10 text-white ml-1" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                  </svg>
                </button>
              </div>
              <div className="absolute inset-0 bg-gray-700 opacity-20"></div>
            </div>

            <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between text-white">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm font-medium">55</span>
                </div>
                <div className="flex items-center gap-1">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm font-medium">10</span>
                </div>
                <div className="flex items-center gap-1">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                  </svg>
                  <span className="text-sm font-medium">23</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-8 shadow-lg">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 rounded-full bg-[#085e29] flex items-center justify-center text-white font-bold text-lg border-4 border-white shadow-lg">
                    1<sup className="text-xs">st</sup>
                  </div>
                  <span className="text-xs text-gray-600 mt-2">Reading</span>
                </div>
                <div className="h-0.5 w-12 bg-[#085e29]"></div>
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 rounded-full bg-[#085e29] flex items-center justify-center text-white font-bold text-lg border-4 border-white shadow-lg">
                    2<sup className="text-xs">nd</sup>
                  </div>
                  <span className="text-xs text-gray-600 mt-2">Reading</span>
                </div>
                <div className="h-0.5 w-12 bg-gray-300"></div>
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-bold text-lg border-4 border-white shadow">
                    3<sup className="text-xs">rd</sup>
                  </div>
                  <span className="text-xs text-gray-600 mt-2">Passed by Parliament</span>
                </div>
                <div className="h-0.5 w-12 bg-gray-300"></div>
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 border-4 border-white shadow">
                    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-xs text-gray-600 mt-2">Assented to by the President</span>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h1 className="text-3xl font-bold text-[#085e29] mb-4">BILL STATUS</h1>
              <p className="text-sm text-gray-600 mb-2">BILL STATUS: 1ST READING</p>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Forensic and Scientific Analytical Services Bill, 2025.
              </h2>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Bill type:</span>
                  <span className="font-semibold text-gray-800 ml-2">Government</span>
                </div>
                <div>
                  <span className="text-gray-600">Year Introduced:</span>
                  <span className="font-semibold text-gray-800 ml-2">2025-07-16</span>
                </div>
                <div className="col-span-2">
                  <span className="text-gray-600">Mover:</span>
                  <span className="font-semibold text-gray-800 ml-2">Major General Kahinda Otafiire</span>
                </div>
                <div className="col-span-2">
                  <span className="text-gray-600">Assigned to:</span>
                  <span className="font-semibold text-gray-800 ml-2">Committee on Defence and Internal Affairs</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {billReadings.map((reading, index) => (
            <div key={index} className={`${reading.color} rounded-2xl p-6 text-white`}>
              <div className="bg-white bg-opacity-20 rounded-xl p-4 mb-4">
                <div className="relative h-48 bg-gray-700 rounded-lg overflow-hidden mb-4">
                  <div className="absolute inset-0 flex items-center justify-center text-white text-sm">
                    Bill Image
                  </div>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#085e29] font-bold">
                    {index + 1}<sup className="text-xs">st</sup>
                  </div>
                  <span className="font-bold text-xl">{reading.stage}</span>
                </div>
              </div>

              <p className="text-sm mb-4 leading-relaxed">
                {reading.title}
              </p>

              <div className="space-y-2">
                <button className="w-full bg-white bg-opacity-20 hover:bg-opacity-30 transition-colors py-3 px-4 rounded-lg flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm font-medium">{reading.action}</span>
                </button>
                {reading.subAction && (
                  <button className="w-full bg-white bg-opacity-20 hover:bg-opacity-30 transition-colors py-3 px-4 rounded-lg flex items-center gap-2">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm font-medium">{reading.subAction}</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}