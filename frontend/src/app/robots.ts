import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://synoraa.space';
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/feed', '/projects', '/profile', '/communities', '/news', '/career', '/search', '/terms', '/privacy'],
        disallow: ['/api/', '/settings', '/messages', '/admin', '/onboarding', '/oauth/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
