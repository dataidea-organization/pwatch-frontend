/**
 * Turn a stored file URL into a same-origin /media path.
 * Next.js rewrites /media to the API host, so the address bar stays on the public site.
 * Links that are not our media files are returned unchanged.
 */
export function publicDocumentUrl(file: string | null | undefined): string {
  if (!file) return '';
  const trimmed = file.trim().replace(/^https\/\//, 'https://');
  if (!trimmed) return '';

  const mediaPath = (pathname: string, search = ''): string | null => {
    const index = pathname.indexOf('/media/');
    if (index === -1) return null;
    return `${pathname.slice(index)}${search}`;
  };

  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    try {
      const url = new URL(trimmed);
      return mediaPath(url.pathname, url.search) ?? trimmed;
    } catch {
      return trimmed;
    }
  }

  const withSlash = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  return mediaPath(withSlash) ?? `/media${withSlash}`;
}
