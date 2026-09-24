import type { Metadata } from 'next';
import { fetchNewsArticle } from '@/lib/api';
import NewsArticleClient from './NewsArticleClient';

export const revalidate = 300;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.parliamentwatch.ug';

function stripHtml(html: string): string {
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
    const url = `${SITE_URL}/news/${slug}`;

    // Social share cards (X / WhatsApp) are disabled until the client clears payment.
    return {
      title: article.title,
      description,
      alternates: { canonical: url },
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
