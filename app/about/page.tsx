import Header from '@/components/Header';

export default function AboutPage() {
  const objectives = [
    {
      icon: (
        <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
        </svg>
      ),
      number: '1',
      text: 'Citizens, Media and CSOs have greater access to timely analytical, accurate and consumable information about parliament and its activities.'
    },
    {
      icon: (
        <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20">
          <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
        </svg>
      ),
      number: '2',
      text: 'Increase citizens\' engagement with Parliament through digital technology.'
    },
    {
      icon: (
        <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
        </svg>
      ),
      number: '3',
      text: 'Parliamentary legislative, budget and oversight functions are informed by citizens aspirations.'
    }
  ];

  const teamMembers = [
    {
      name: 'Executive Director',
      title: 'Chemengich, M. Timothy',
      image: '/team1.jpg'
    },
    {
      name: 'Executive Director',
      title: 'Chemengich, M. Timothy',
      image: '/team2.jpg'
    },
    {
      name: 'Executive Director',
      title: 'Chemengich, M. Timothy',
      image: '/team3.jpg'
    },
    {
      name: 'Executive Director',
      title: 'Chemengich, M. Timothy',
      image: '/team4.jpg'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header variant="donate" />

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            <div className="relative h-64 rounded-lg overflow-hidden bg-gray-200">
              <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                Office Image 1
              </div>
            </div>
            <div className="relative h-64 rounded-lg overflow-hidden bg-gray-200">
              <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                Office Image 2
              </div>
            </div>
          </div>

          <div className="mb-12">
            <p className="text-gray-700 text-center max-w-4xl mx-auto mb-8">
              Parliament watch Uganda is a Parliament monitoring initiative of the Centre for Policy Analysis that began in 2013 with the goal of bridging the gap between Parliament and citizens and to make the legislature more transparent, open and accessible. Today, we&apos;re the leading non-governmental source of legislative information, analysis and critical research on parliament and informed public policy and legislative action in Uganda.
            </p>
          </div>

          <div>
            <h2 className="text-3xl font-bold text-center text-[#085e29] mb-12">Objectives</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {objectives.map((obj, index) => (
                <div key={index} className="bg-white rounded-lg p-6 shadow-lg border-2 border-gray-100 hover:border-[#085e29] transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-16 h-16 bg-[#085e29] rounded-full flex items-center justify-center text-white">
                      <span className="text-2xl font-bold">{obj.number}</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {obj.text}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-gray-800"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <h2 className="text-3xl font-bold text-center text-white mb-12">
            MEET THE TEAM
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {teamMembers.map((member, index) => (
              <div key={index} className="bg-white rounded-lg overflow-hidden shadow-xl group">
                <div className="relative h-64 bg-gray-300">
                  <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                    Team Member {index + 1}
                  </div>
                  <div className="absolute bottom-0 right-0 w-16 h-16 bg-[#085e29] opacity-75" style={{ clipPath: 'polygon(100% 0, 100% 100%, 0 100%)' }}></div>
                </div>
                <div className="p-4 text-center">
                  <h3 className="font-bold text-gray-800 mb-1">{member.name}</h3>
                  <p className="text-sm text-gray-600 mb-3">{member.title}</p>

                  <div className="flex justify-center gap-2">
                    <a href="#" className="w-6 h-6 bg-gray-700 rounded flex items-center justify-center text-white hover:bg-[#085e29] transition-colors">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                    </a>
                    <a href="#" className="w-6 h-6 bg-gray-700 rounded flex items-center justify-center text-white hover:bg-[#085e29] transition-colors">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                      </svg>
                    </a>
                    <a href="#" className="w-6 h-6 bg-gray-700 rounded flex items-center justify-center text-white hover:bg-[#085e29] transition-colors">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}