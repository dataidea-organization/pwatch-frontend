import type { Metadata } from 'next';
import { fetchNewsArticle } from '@/lib/api';
import { articleShareMetadata, stripHtml } from '@/lib/share';
import NewsArticleClient from './NewsArticleClient';

export const revalidate = 300;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.parliamentwatch.ug';

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

    return articleShareMetadata({
      title: article.title,
      description,
      url: `${SITE_URL}/news/${slug}`,
      image: article.image,
      fallbackImage: '/images/default-news.jpg',
    });
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
