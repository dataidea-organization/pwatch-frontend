import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { fetchBill } from '@/lib/api';
import { notFound } from 'next/navigation';
import Link from 'next/link';

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

  return (
    <div className="min-h-screen bg-gray-50">
      <Header variant="support" />

      {/* Page Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-3 text-sm text-slate-600 mb-4">
            <Link href="/trackers/bills" className="hover:text-[#7AB51D]">Bills Tracker</Link>
            <span>/</span>
            <span className="text-slate-900 font-medium">Bill Details</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900">{bill.title}</h1>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Video Player Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
              <div className="relative h-96 bg-slate-900">
              {bill.video_url ? (
                <iframe
                  src={bill.video_url}
                  className="absolute inset-0 w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title={bill.title}
                />
              ) : (
                <>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <button className="w-20 h-20 bg-white bg-opacity-30 rounded-full flex items-center justify-center hover:bg-opacity-40 transition-colors">
                      <svg className="w-10 h-10 text-white ml-1" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                      </svg>
                    </button>
                  </div>
                  <div className="absolute inset-0 bg-gray-700 opacity-20"></div>
                </>
              )}
              </div>
            </div>
          </div>

          {/* Bill Status Section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900 mb-6">Bill Progress</h2>

              {/* Progress Tracker - Vertical Timeline */}
              <div className="space-y-6 mb-8">
                {/* 1st Reading */}
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold text-sm ${
                      currentProgress >= 0
                        ? 'bg-[#7AB51D] text-white'
                        : 'bg-slate-100 text-slate-400'
                    }`}>
                      1st
                    </div>
                    {currentProgress >= 0 && <div className="w-0.5 flex-1 bg-[#7AB51D] mt-2" style={{ minHeight: '24px' }} />}
                  </div>
                  <div className="flex-1 pt-2">
                    <h4 className={`font-medium text-sm ${currentProgress >= 0 ? 'text-slate-900' : 'text-slate-400'}`}>
                      1st Reading
                    </h4>
                    <p className="text-xs text-slate-500 mt-1">Bill introduced to Parliament</p>
                  </div>
                </div>

                {/* 2nd Reading */}
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold text-sm ${
                      currentProgress >= 1
                        ? 'bg-[#7AB51D] text-white'
                        : 'bg-slate-100 text-slate-400'
                    }`}>
                      2nd
                    </div>
                    {currentProgress >= 1 && <div className="w-0.5 flex-1 bg-[#7AB51D] mt-2" style={{ minHeight: '24px' }} />}
                  </div>
                  <div className="flex-1 pt-2">
                    <h4 className={`font-medium text-sm ${currentProgress >= 1 ? 'text-slate-900' : 'text-slate-400'}`}>
                      2nd Reading
                    </h4>
                    <p className="text-xs text-slate-500 mt-1">Debate and committee review</p>
                  </div>
                </div>

                {/* 3rd Reading */}
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold text-sm ${
                      currentProgress >= 2
                        ? 'bg-[#7AB51D] text-white'
                        : 'bg-slate-100 text-slate-400'
                    }`}>
                      3rd
                    </div>
                    {currentProgress >= 2 && <div className="w-0.5 flex-1 bg-[#7AB51D] mt-2" style={{ minHeight: '24px' }} />}
                  </div>
                  <div className="flex-1 pt-2">
                    <h4 className={`font-medium text-sm ${currentProgress >= 2 ? 'text-slate-900' : 'text-slate-400'}`}>
                      3rd Reading & Vote
                    </h4>
                    <p className="text-xs text-slate-500 mt-1">Final debate and passage</p>
                  </div>
                </div>

                {/* Presidential Assent */}
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      currentProgress >= 4
                        ? 'bg-[#7AB51D] text-white'
                        : 'bg-slate-100 text-slate-400'
                    }`}>
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                  <div className="flex-1 pt-2">
                    <h4 className={`font-medium text-sm ${currentProgress >= 4 ? 'text-slate-900' : 'text-slate-400'}`}>
                      Presidential Assent
                    </h4>
                    <p className="text-xs text-slate-500 mt-1">Bill becomes law</p>
                  </div>
                </div>
              </div>

              {/* Bill Details */}
              <div className="border-t pt-6">
                <h3 className="text-sm font-semibold text-slate-900 mb-4">Bill Information</h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="text-slate-500 block mb-1">Status</span>
                    <span className={`inline-flex items-center px-3 py-1 rounded-md text-xs font-medium ${
                      bill.status === 'assented'
                        ? 'bg-slate-100 text-slate-700'
                        : 'bg-emerald-50 text-[#7AB51D]'
                    }`}>
                      {bill.status_display}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block mb-1">Type</span>
                    <span className="text-slate-900 font-medium">{bill.bill_type_display}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block mb-1">Introduced</span>
                    <span className="text-slate-900 font-medium">{bill.year_introduced}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block mb-1">Moved by</span>
                    <span className="text-slate-900 font-medium">{bill.mover}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block mb-1">Assigned to</span>
                    <span className="text-slate-900 font-medium">{bill.assigned_to}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Reading Stages Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-slate-900 mb-2">Bill Readings</h2>
          <p className="text-slate-600 mb-8">Documents and reports from each reading stage</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {bill.readings && bill.readings.length > 0 ? (
            bill.readings.map((reading, index) => (
              <div key={reading.id} className="bg-white rounded-lg border border-slate-200 overflow-hidden hover:shadow-lg transition-shadow">
                <div className="bg-[#7AB51D] px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#7AB51D] font-bold text-sm">
                      {index + 1}
                      {index === 0 && <sup className="text-xs">st</sup>}
                      {index === 1 && <sup className="text-xs">nd</sup>}
                      {index === 2 && <sup className="text-xs">rd</sup>}
                    </div>
                    <h3 className="font-semibold text-white text-lg">{reading.stage_display}</h3>
                  </div>
                </div>

                <div className="p-6">
                  <p className="text-sm text-slate-600 mb-6 leading-relaxed">
                    {reading.details}
                  </p>

                  <div className="space-y-2">
                    {reading.document && (
                      <a
                        href={reading.document}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-md border border-slate-200 transition-colors"
                      >
                        <svg className="w-4 h-4 text-slate-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                        <span>Tabled Bill</span>
                      </a>
                    )}
                    {reading.committee_report && (
                      <a
                        href={reading.committee_report}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-md border border-slate-200 transition-colors"
                      >
                        <svg className="w-4 h-4 text-slate-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                        <span>Committee Report</span>
                      </a>
                    )}
                    {reading.analysis && (
                      <a
                        href={reading.analysis}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-md border border-slate-200 transition-colors"
                      >
                        <svg className="w-4 h-4 text-slate-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                        <span>CEPA Analysis</span>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-3 text-center py-12">
              <p className="text-gray-600">No reading information available yet.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}