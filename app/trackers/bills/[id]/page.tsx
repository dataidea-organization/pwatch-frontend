import { fetchBill } from '@/lib/api';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, FileText, ClipboardList, CheckCircle2, FileDown } from 'lucide-react';
import { publicDocumentUrl } from '@/lib/media';

export default async function BillDetailsPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params;

  let bill;
  try {
    bill = await fetchBill(id);
  } catch (error) {
    console.error('Failed to fetch bill:', error);
    notFound();
  }

  const getProgressStatus = (status: string) => {
    const stages = ['1st_reading', '2nd_reading', '3rd_reading', 'passed', 'assented'];
    return stages.indexOf(status);
  };

  const currentProgress = getProgressStatus(bill.status);

  // Convert YouTube URL to embed format
  const getYouTubeEmbedUrl = (url: string | null): string | null => {
    if (!url) return null;
    
    // Handle different YouTube URL formats
    let videoId = '';
    
    // Standard watch URL: https://www.youtube.com/watch?v=VIDEO_ID
    const watchMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
    if (watchMatch) {
      videoId = watchMatch[1];
    }
    
    // Already an embed URL
    if (url.includes('youtube.com/embed/')) {
      return url;
    }
    
    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}`;
    }
    
    return url; // Return original if we can't parse it
  };

  const embedUrl = getYouTubeEmbedUrl(bill.video_url);

  return (
    <div className="min-h-screen bg-[#f5f0e8]">
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <Link
            href="/trackers/bills"
            className="inline-flex items-center text-[#2d5016] hover:text-[#1b3d26] font-medium transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Bills Tracker
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">{bill.title}</h1>
          <p className="text-gray-600 mt-2">Bill details, progress, and reading documents</p>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          {/* Video Player Section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden h-full flex flex-col">
              <div className="bg-gradient-to-br from-[#fafaf8] to-[#f5f0e8] px-6 py-4 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900">Video</h2>
              </div>
              <div className="relative flex-1 bg-gray-900" style={{ minHeight: '400px' }}>
              {embedUrl ? (
                <iframe
                  src={embedUrl}
                  className="absolute inset-0 w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title={bill.title}
                />
              ) : (
                <>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <svg className="w-20 h-20 text-white/50 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                      </svg>
                      <p className="text-white/75 text-sm">No video available</p>
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-gray-700/20" />
                </>
              )}
              </div>
            </div>
          </div>

          {/* Bill Status Section - Contact-style card with decorative blur */}
          <div className="lg:col-span-1">
            <div className="relative bg-gradient-to-br from-[#fafaf8] to-[#f5f0e8] rounded-xl shadow-md border border-gray-200 p-6 overflow-hidden h-full flex flex-col">
              <div className="absolute top-0 right-0 w-24 h-24 opacity-5">
                <div className="absolute inset-0 bg-[#2d5016] rounded-full blur-2xl"></div>
              </div>
              <div className="relative z-10 flex items-start gap-4 mb-6">
                <div className="flex-shrink-0">
                  <div className="p-3 bg-white/60 rounded-lg shadow-sm">
                    <ClipboardList className="text-[#2d5016]" size={24} />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-2xl font-bold text-gray-900">Bill Progress</h2>
                </div>
              </div>
              <div className="relative z-10 flex-1">
                {/* Progress Tracker - Horizontal Timeline */}
                <div className="mb-8">
                  <div className="flex items-start justify-between gap-2">
                    {/* 1st Reading */}
                    <div className="flex flex-col items-center flex-1">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold text-sm shadow-md ${
                        currentProgress >= 0
                          ? 'bg-gradient-to-br from-[#2d5016] to-[#1b3d26] text-white'
                          : 'bg-gray-100 text-gray-400'
                      }`}>
                        1st
                      </div>
                      <h4 className={`font-medium text-xs mt-3 text-center ${currentProgress >= 0 ? 'text-gray-900' : 'text-gray-400'}`}>
                        1st Reading
                      </h4>
                      <p className="text-[10px] text-gray-500 mt-1 text-center leading-tight">Bill introduced</p>
                    </div>

                    <div className="flex items-center pt-6 flex-shrink-0" style={{ width: '40px' }}>
                      <div className={`h-0.5 w-full ${currentProgress >= 1 ? 'bg-[#2d5016]' : 'bg-gray-200'}`} />
                    </div>

                    <div className="flex flex-col items-center flex-1">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold text-sm shadow-md ${
                        currentProgress >= 1
                          ? 'bg-gradient-to-br from-[#2d5016] to-[#1b3d26] text-white'
                          : 'bg-gray-100 text-gray-400'
                      }`}>
                        2nd
                      </div>
                      <h4 className={`font-medium text-xs mt-3 text-center ${currentProgress >= 1 ? 'text-gray-900' : 'text-gray-400'}`}>
                        2nd Reading
                      </h4>
                      <p className="text-[10px] text-gray-500 mt-1 text-center leading-tight">Committee review</p>
                    </div>

                    <div className="flex items-center pt-6 flex-shrink-0" style={{ width: '40px' }}>
                      <div className={`h-0.5 w-full ${currentProgress >= 2 ? 'bg-[#2d5016]' : 'bg-gray-200'}`} />
                    </div>

                    <div className="flex flex-col items-center flex-1">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold text-sm shadow-md ${
                        currentProgress >= 2
                          ? 'bg-gradient-to-br from-[#2d5016] to-[#1b3d26] text-white'
                          : 'bg-gray-100 text-gray-400'
                      }`}>
                        3rd
                      </div>
                      <h4 className={`font-medium text-xs mt-3 text-center ${currentProgress >= 2 ? 'text-gray-900' : 'text-gray-400'}`}>
                        3rd Reading
                      </h4>
                      <p className="text-[10px] text-gray-500 mt-1 text-center leading-tight">Final vote</p>
                    </div>

                    <div className="flex items-center pt-6 flex-shrink-0" style={{ width: '40px' }}>
                      <div className={`h-0.5 w-full ${currentProgress >= 4 ? 'bg-[#2d5016]' : 'bg-gray-200'}`} />
                    </div>

                    <div className="flex flex-col items-center flex-1">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-md ${
                        currentProgress >= 4
                          ? 'bg-gradient-to-br from-[#2d5016] to-[#1b3d26] text-white'
                          : 'bg-gray-100 text-gray-400'
                      }`}>
                        <CheckCircle2 className="w-6 h-6" />
                      </div>
                      <h4 className={`font-medium text-xs mt-3 text-center ${currentProgress >= 4 ? 'text-gray-900' : 'text-gray-400'}`}>
                        Assent
                      </h4>
                      <p className="text-[10px] text-gray-500 mt-1 text-center leading-tight">Becomes law</p>
                    </div>
                  </div>
                </div>

                {/* Bill Details */}
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-sm font-semibold text-gray-900 mb-4">Bill Information</h3>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-4 text-sm">
                    <div>
                      <span className="text-gray-500 block mb-1 text-xs">Status</span>
                      <span className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium ${
                        bill.status === 'assented'
                          ? 'bg-gray-100 text-gray-700'
                          : 'bg-[#2d5016]/10 text-[#2d5016]'
                      }`}>
                        {bill.status_display}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500 block mb-1 text-xs">Type</span>
                      <span className="text-gray-900 font-medium text-sm">{bill.bill_type_display}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block mb-1 text-xs">Introduced</span>
                      <span className="text-gray-900 font-medium text-sm">{bill.year_introduced}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block mb-1 text-xs">Moved by</span>
                      <span className="text-gray-900 font-medium text-sm">{bill.mover}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-gray-500 block mb-1 text-xs">Assigned to</span>
                      <span className="text-gray-900 font-medium text-sm">{bill.assigned_to}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bill Readings Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Bill Readings</h2>
          <p className="text-gray-600 mb-6">Documents and reports from each reading stage.</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {bill.readings && bill.readings.length > 0 ? (
                bill.readings.map((reading, index) => (
                  <div key={reading.id} className="relative bg-gradient-to-br from-[#fafaf8] to-[#f5f0e8] rounded-xl shadow-md border border-gray-200 p-6 overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 opacity-5">
                      <div className="absolute inset-0 bg-[#2d5016] rounded-full blur-2xl"></div>
                    </div>
                    <div className="relative z-10 flex items-start gap-4 mb-4">
                      <div className="flex-shrink-0">
                        <div className="p-3 bg-white/60 rounded-lg shadow-sm">
                          <FileText className="text-[#2d5016]" size={24} />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900">
                          {index + 1}
                          {index === 0 && 'st'}
                          {index === 1 && 'nd'}
                          {index === 2 && 'rd'} Reading
                        </h3>
                        <p className="text-sm text-gray-600 mt-0.5">{reading.stage_display}</p>
                      </div>
                    </div>
                    <div className="relative z-10">
                      <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                        {reading.details}
                      </p>
                      <div className="space-y-2">
                        {reading.document && (
                          <a
                            href={publicDocumentUrl(reading.document)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:text-[#2d5016] rounded-md border border-gray-200 hover:border-[#2d5016]/30 transition-colors"
                          >
                            <FileDown className="w-4 h-4 flex-shrink-0" />
                            <span>Tabled Bill</span>
                          </a>
                        )}
                        {reading.committee_report && (
                          <a
                            href={publicDocumentUrl(reading.committee_report)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:text-[#2d5016] rounded-md border border-gray-200 hover:border-[#2d5016]/30 transition-colors"
                          >
                            <FileDown className="w-4 h-4 flex-shrink-0" />
                            <span>Committee Report</span>
                          </a>
                        )}
                        {reading.analysis && (
                          <a
                            href={publicDocumentUrl(reading.analysis)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:text-[#2d5016] rounded-md border border-gray-200 hover:border-[#2d5016]/30 transition-colors"
                          >
                            <FileDown className="w-4 h-4 flex-shrink-0" />
                            <span>CEPA Analysis</span>
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-3 text-center py-12 bg-gradient-to-br from-[#fafaf8] to-[#f5f0e8] rounded-xl border border-gray-200">
                  <p className="text-gray-600">No reading information available yet.</p>
                </div>
              )}
          </div>
        </div>

        {/* View All Bills */}
        <div className="mt-12 flex justify-center">
          <Link href="/trackers/bills">
            <button
              type="button"
              className="px-8 py-3 bg-[#2d5016] text-white rounded-lg hover:bg-[#1b3d26] transition-colors font-medium shadow-sm hover:shadow-md"
            >
              View All Bills
            </button>
          </Link>
        </div>
      </main>
    </div>
  );
}