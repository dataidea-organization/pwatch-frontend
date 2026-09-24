import type { Metadata } from 'next';
import { fetchNewsArticle } from '@/lib/api';
import NewsArticleClient from './NewsArticleClient';

export const dynamic = 'force-dynamic';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.parliamentwatch.ug';
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function absoluteImageUrl(image: string | null): string {
  if (!image) {
    return `${SITE_URL}/images/default-news.jpg`;
  }
  if (image.startsWith('http://') || image.startsWith('https://')) {
    return image;
  }
  const origin = API_BASE_URL.replace(/\/api\/?$/, '');
  return `${origin}${image.startsWith('/') ? image : `/${image}`}`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  try {
    const article = await fetchNewsArticle(slug);
    const description =
      stripHtml(article.content).slice(0, 200) ||
      'News from Parliament Watch Uganda';
    const image = absoluteImageUrl(article.image);
    const url = `${SITE_URL}/news/${slug}`;

    return {
      title: article.title,
      description,
      alternates: { canonical: url },
      openGraph: {
        title: article.title,
        description,
        url,
        siteName: 'Parliament Watch Uganda',
        type: 'article',
        publishedTime: article.published_date,
        images: [
          {
            url: image,
            width: 1200,
            height: 630,
            alt: article.title,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: article.title,
        description,
        images: [image],
        site: '@pwatchug',
      },
    };
  } catch {
    return {
      title: 'News | Parliament Watch Uganda',
      description: 'Your Eye on Parliament - Bridging the gap between Parliament and the people',
    };
  }
}

export default function NewsArticlePage() {
  return <NewsArticleClient />;
}
