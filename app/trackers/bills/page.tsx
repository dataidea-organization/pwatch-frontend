import Header from '@/components/Header';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { fetchBills } from '@/lib/api';

export default async function BillsTrackerPage() {
  let bills = [];
  try {
    bills = await fetchBills();
  } catch (error) {
    console.error('Failed to fetch bills:', error);
  }
  const steps = [
    {
      step: 1,
      title: 'A bill is a draft law',
      description: ''
    },
    {
      step: 2,
      title: 'It becomes an Act if it is approved by majority representatives in Parliament',
      description: ''
    },
    {
      step: 3,
      title: 'Signed by the President. An Act of Parliament is a law enforced in all areas of Uganda where it is applicable',
      description: ''
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header variant="support" />

      <main className="relative">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-slate-700 via-slate-600 to-slate-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center mb-12">
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Bills Tracker
              </h1>
              <p className="text-slate-200 text-lg max-w-2xl mx-auto">
                Track the progress of bills through Parliament from introduction to presidential assent
              </p>
            </div>
          </div>
        </div>

        {/* How a Bill Becomes an Act Section */}
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h2 className="text-2xl font-semibold text-slate-800 text-center mb-8">
              How a Bill Becomes an Act
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {steps.map((stepItem, index) => (
                <div key={index} className="flex flex-col items-center text-center">
                  <div className="relative mb-6">
                    <div className="w-20 h-20 rounded-full bg-[#085e29] text-white flex items-center justify-center text-3xl font-bold shadow-lg">
                      {stepItem.step}
                    </div>
                    {index < steps.length - 1 && (
                      <div className="hidden md:block absolute top-1/2 left-full w-full h-0.5 bg-slate-200" style={{ transform: 'translateY(-50%)', width: 'calc(100% + 2rem)' }} />
                    )}
                  </div>

                  <h3 className="text-sm font-semibold text-[#085e29] mb-2 uppercase tracking-wide">
                    Step {stepItem.step}
                  </h3>

                  <p className="text-slate-600 text-sm max-w-xs leading-relaxed">
                    {stepItem.title}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bills Listing Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-800 mb-2">Current Bills</h2>
            <p className="text-slate-600">Browse all bills currently in the legislative process</p>
          </div>

          {bills.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {bills.map((bill) => (
                  <div key={bill.id} className="bg-white rounded-lg border border-slate-200 hover:border-slate-300 transition-all duration-200 hover:shadow-lg overflow-hidden">
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-md text-xs font-medium ${
                          bill.status === 'assented'
                            ? 'bg-slate-100 text-slate-700'
                            : 'bg-emerald-50 text-[#085e29]'
                        }`}>
                          {bill.status_display}
                        </span>
                      </div>

                      <h3 className="text-lg font-semibold text-slate-900 mb-4 line-clamp-2 leading-tight">
                        {bill.title}
                      </h3>

                      <div className="space-y-2 mb-6">
                        <div className="flex items-start text-sm">
                          <span className="text-slate-500 w-32 flex-shrink-0">Type:</span>
                          <span className="text-slate-700 font-medium">{bill.bill_type_display}</span>
                        </div>
                        <div className="flex items-start text-sm">
                          <span className="text-slate-500 w-32 flex-shrink-0">Introduced:</span>
                          <span className="text-slate-700 font-medium">{bill.year_introduced}</span>
                        </div>
                        <div className="flex items-start text-sm">
                          <span className="text-slate-500 w-32 flex-shrink-0">Mover:</span>
                          <span className="text-slate-700 font-medium">{bill.mover}</span>
                        </div>
                      </div>

                      <Link href={`/trackers/bills/${bill.id}`}>
                        <Button className="w-full bg-[#085e29] hover:bg-[#064920] text-white">
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-16 bg-white rounded-lg border border-slate-200">
              <p className="text-slate-600">No bills found. Please check back later.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}