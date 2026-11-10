import type { Metadata } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.parliamentwatch.ug';

export function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&rsquo;/gi, "'")
    .replace(/&lsquo;/gi, "'")
    .replace(/&rdquo;/gi, '"')
    .replace(/&ldquo;/gi, '"')
    .replace(/&amp;/gi, '&')
    .replace(/&[a-z]+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function absoluteShareImage(image: string | null | undefined, fallbackPath: string): string {
  const fallback = `${SITE_URL}${fallbackPath}`;
  if (!image) return fallback;
  const trimmed = image.trim().replace(/^https\/\//, 'https://');
  if (!trimmed) return fallback;
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;
  if (trimmed.startsWith('/')) return `${SITE_URL}${trimmed}`;
  return `${SITE_URL}/${trimmed}`;
}

export function articleShareMetadata(options: {
  title: string;
  description: string;
  url: string;
  image: string | null | undefined;
  fallbackImage: string;
}): Metadata {
  const description = options.description.slice(0, 200);
  const imageUrl = absoluteShareImage(options.image, options.fallbackImage);

  return {
    title: options.title,
    description,
    alternates: { canonical: options.url },
    openGraph: {
      title: options.title,
      description,
      url: options.url,
      siteName: 'Parliament Watch Uganda',
      type: 'article',
      images: [{ url: imageUrl, alt: options.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: options.title,
      description,
      images: [imageUrl],
    },
  };
}
