import type { Metadata } from 'next';
import { fetchBlog } from '@/lib/api';
import { articleShareMetadata, stripHtml } from '@/lib/share';
import BlogPostClient from './BlogPostClient';

export const revalidate = 300;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.parliamentwatch.ug';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  try {
    const blog = await fetchBlog(slug);
    const description =
      stripHtml(blog.content).slice(0, 200) ||
      'Blog from Parliament Watch Uganda';

    return articleShareMetadata({
      title: blog.title,
      description,
      url: `${SITE_URL}/blogs/${slug}`,
      image: blog.image,
      fallbackImage: '/images/default-blog.jpg',
    });
  } catch {
    return {
      title: 'Blog | Parliament Watch Uganda',
      description: 'Your Eye on Parliament - Bridging the gap between Parliament and the people',
    };
  }
}

export default function BlogPostPage() {
  return <BlogPostClient />;
}
