import { ImageResponse } from 'next/og';
import { fetchNewsArticle } from '@/lib/api';

export const runtime = 'nodejs';
export const alt = 'Parliament Watch Uganda';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const revalidate = 3600;

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  let title = 'Parliament Watch Uganda';
  let imageUrl: string | null = null;

  try {
    const article = await fetchNewsArticle(slug);
    title = article.title;
    imageUrl = article.image;
  } catch {
    // Fall back to branded card
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          backgroundColor: '#1b3d26',
        }}
      >
        {imageUrl ? (
          // Satori requires <img>, not next/image
          <img
            src={imageUrl}
            alt=""
            width={1200}
            height={630}
            style={{ objectFit: 'cover', width: '1200px', height: '630px' }}
          />
        ) : (
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-end',
              padding: 48,
              color: 'white',
              fontSize: 44,
              fontWeight: 700,
              lineHeight: 1.2,
            }}
          >
            {title}
          </div>
        )}
      </div>
    ),
    { ...size }
  );
}
