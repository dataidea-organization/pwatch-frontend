'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import { fetchObjectives, fetchTeamMembers, Objective, TeamMember } from '@/lib/api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export default function AboutPage() {
  const [objectives, setObjectives] = useState<Objective[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [objectivesData, teamData] = await Promise.all([
        fetchObjectives(),
        fetchTeamMembers(),
      ]);
      setObjectives(objectivesData);
      setTeamMembers(teamData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
      console.error('Error loading about page data:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />

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

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#085e29]"></div>
              <p className="mt-4 text-gray-600">Loading...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-600">Error: {error}</p>
              <button
                onClick={loadData}
                className="mt-4 px-4 py-2 bg-[#085e29] text-white rounded-md hover:bg-[#064920] transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : (
            <>
          <div>
            <h2 className="text-3xl font-bold text-center text-[#085e29] mb-12">Objectives</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {objectives.length === 0 ? (
                    <div className="col-span-3 text-center text-gray-500 py-8">
                      No objectives available
                    </div>
                  ) : (
                    objectives.map((obj, index) => (
                      <div key={obj.id} className="bg-white rounded-lg p-6 shadow-lg border-2 border-gray-100 hover:border-[#085e29] transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-16 h-16 bg-[#085e29] rounded-full flex items-center justify-center text-white">
                            <span className="text-2xl font-bold">{index + 1}</span>
                    </div>
                    <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 mb-2">{obj.title}</h3>
                      <p className="text-sm text-gray-700 leading-relaxed">
                              {obj.description}
                      </p>
                    </div>
                  </div>
                </div>
                    ))
                  )}
            </div>
          </div>
            </>
          )}
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

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
              <p className="mt-4 text-white">Loading team members...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-300">Error: {error}</p>
              <button
                onClick={loadData}
                className="mt-4 px-4 py-2 bg-white text-gray-900 rounded-md hover:bg-gray-100 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {teamMembers.length === 0 ? (
                <div className="col-span-4 text-center text-gray-400 py-8">
                  No team members available
                </div>
              ) : (
                teamMembers.map((member) => (
                  <div key={member.id} className="bg-white rounded-lg overflow-hidden shadow-xl group">
                <div className="relative h-64 bg-gray-300">
                      {member.photo ? (
                        <img
                          src={`${API_BASE_URL.replace('/api', '')}${member.photo}`}
                          alt={member.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                          {member.name.charAt(0)}
                  </div>
                      )}
                  <div className="absolute bottom-0 right-0 w-16 h-16 bg-[#085e29] opacity-75" style={{ clipPath: 'polygon(100% 0, 100% 100%, 0 100%)' }}></div>
                </div>
                <div className="p-4 text-center">
                  <h3 className="font-bold text-gray-800 mb-1">{member.name}</h3>
                  <p className="text-sm text-gray-600 mb-3">{member.title}</p>

                  <div className="flex justify-center gap-2">
                        {member.facebook_url && (
                          <a
                            href={member.facebook_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-6 h-6 bg-gray-700 rounded flex items-center justify-center text-white hover:bg-[#085e29] transition-colors"
                          >
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                    </a>
                        )}
                        {member.twitter_url && (
                          <a
                            href={member.twitter_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-6 h-6 bg-gray-700 rounded flex items-center justify-center text-white hover:bg-[#085e29] transition-colors"
                          >
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                      </svg>
                    </a>
                        )}
                        {member.linkedin_url && (
                          <a
                            href={member.linkedin_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-6 h-6 bg-gray-700 rounded flex items-center justify-center text-white hover:bg-[#085e29] transition-colors"
                          >
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                      </svg>
                    </a>
                        )}
                  </div>
                </div>
              </div>
                ))
              )}
          </div>
          )}
        </div>
      </section>
    </div>
  );
}