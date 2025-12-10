import Header from '@/components/Header';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function BillsTrackerPage() {
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
    <div className="min-h-screen bg-white">
      <Header variant="support" />

      <main className="relative">
        <div className="relative h-[600px] overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-black/30 z-10" />
          <div className="absolute inset-0 bg-gray-700">
            <div className="absolute inset-0 flex items-center justify-center text-white text-2xl">
              Parliament Building Background
            </div>
          </div>

          <div className="relative z-20 max-w-7xl mx-auto px-4 py-12">
            <h1 className="text-4xl md:text-5xl font-bold text-white text-center mb-16">
              HOW DOES A BILL BECOME AN ACT
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
              {steps.map((stepItem, index) => (
                <div key={index} className="flex flex-col items-center">
                  <div className="relative w-64 h-64 mb-6">
                    <div className="absolute inset-0 rounded-full border-4 border-white bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-sm flex items-center justify-center">
                      <div className="text-center p-6">
                        <div className="w-32 h-32 mx-auto mb-4 bg-white/30 rounded-lg flex items-center justify-center">
                          <span className="text-white/70 text-xs">
                            Illustration {index + 1}
                          </span>
                        </div>
                      </div>
                    </div>
                    {index < steps.length - 1 && (
                      <div className="hidden md:block absolute top-1/2 -right-8 w-16 h-0.5 bg-white" />
                    )}
                  </div>

                  <Button
                    variant="green"
                    size="lg"
                    className="mb-4 px-8"
                  >
                    Step {stepItem.step}
                  </Button>

                  <p className="text-white text-center text-sm max-w-xs leading-relaxed">
                    {stepItem.title}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <span className="inline-block px-3 py-1 bg-[#7AB51D] text-white text-xs font-semibold rounded-full mb-3">
                      1ST READING
                    </span>
                    <h3 className="text-lg font-bold text-gray-800 mb-2">
                      Forensic and Scientific Analytical Services Bill, 2025
                    </h3>
                  </div>
                </div>
                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <div>
                    <span className="font-medium">Bill type:</span> Government
                  </div>
                  <div>
                    <span className="font-medium">Year Introduced:</span> 2025-07-16
                  </div>
                  <div>
                    <span className="font-medium">Mover:</span> Major General Kahinda Otafiire
                  </div>
                </div>
                <Link href="/trackers/bills/1">
                  <Button variant="outline" className="w-full border-[#7AB51D] text-[#7AB51D] hover:bg-[#7AB51D] hover:text-white">
                    View Details
                  </Button>
                </Link>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <span className="inline-block px-3 py-1 bg-[#7AB51D] text-white text-xs font-semibold rounded-full mb-3">
                      2ND READING
                    </span>
                    <h3 className="text-lg font-bold text-gray-800 mb-2">
                      Sample Bill Title Here, 2025
                    </h3>
                  </div>
                </div>
                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <div>
                    <span className="font-medium">Bill type:</span> Private Member
                  </div>
                  <div>
                    <span className="font-medium">Year Introduced:</span> 2025-06-10
                  </div>
                  <div>
                    <span className="font-medium">Mover:</span> Sample MP Name
                  </div>
                </div>
                <Link href="/trackers/bills/2">
                  <Button variant="outline" className="w-full border-[#7AB51D] text-[#7AB51D] hover:bg-[#7AB51D] hover:text-white">
                    View Details
                  </Button>
                </Link>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <span className="inline-block px-3 py-1 bg-gray-600 text-white text-xs font-semibold rounded-full mb-3">
                      ASSENTED
                    </span>
                    <h3 className="text-lg font-bold text-gray-800 mb-2">
                      Sample Assented Bill, 2024
                    </h3>
                  </div>
                </div>
                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <div>
                    <span className="font-medium">Bill type:</span> Government
                  </div>
                  <div>
                    <span className="font-medium">Year Introduced:</span> 2024-03-15
                  </div>
                  <div>
                    <span className="font-medium">Mover:</span> Sample Minister
                  </div>
                </div>
                <Link href="/trackers/bills/3">
                  <Button variant="outline" className="w-full border-[#7AB51D] text-[#7AB51D] hover:bg-[#7AB51D] hover:text-white">
                    View Details
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          <div className="flex justify-center mt-8">
            <Button variant="outline" className="border-[#7AB51D] text-[#7AB51D] hover:bg-[#7AB51D] hover:text-white px-8">
              Load More Bills
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}