'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { fetchPageHeroImage } from '@/lib/api';

interface CitizensVoiceHeroProps {
  title: string;
  subtitle: string;
  badge?: string;
}

export default function CitizensVoiceHero({ title, subtitle, badge }: CitizensVoiceHeroProps) {
  const [heroImage, setHeroImage] = useState<string>('/images/citizens-voice.jpg');

  useEffect(() => {
    fetchPageHeroImage('citizens-voice').then((data) => {
      if (data?.image) {
        setHeroImage(data.image);
      }
    });
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-4">
      <div className="relative mb-10 h-[360px] overflow-hidden rounded-2xl shadow-xl">
        <Image
          src={heroImage}
          alt=""
          fill
          className="object-cover"
          sizes="100vw"
          priority
          unoptimized={heroImage.startsWith('http')}
        />
        <div
          className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent"
          aria-hidden
        />
        <div className="absolute inset-x-0 bottom-0 z-10 px-6 py-6 sm:px-8 sm:py-8 md:px-10 md:py-10">
          <div className="max-w-2xl">
            {badge && (
              <div className="inline-flex items-center gap-2 rounded-lg bg-white/15 px-3 py-1.5 mb-3">
                <span className="text-sm font-medium text-white/90">{badge}</span>
              </div>
            )}
            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl mb-3">
              {title}
            </h1>
            <p className="text-base text-white/90 leading-relaxed sm:text-lg">
              {subtitle}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
