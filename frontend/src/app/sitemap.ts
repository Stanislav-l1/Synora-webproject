import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://synoraa.space';
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/`,          changeFrequency: 'daily',   priority: 1.0, lastModified: now },
    { url: `${baseUrl}/feed`,      changeFrequency: 'hourly',  priority: 0.9, lastModified: now },
    { url: `${baseUrl}/projects`,  changeFrequency: 'hourly',  priority: 0.9, lastModified: now },
    { url: `${baseUrl}/communities`, changeFrequency: 'daily', priority: 0.8, lastModified: now },
    { url: `${baseUrl}/news`,      changeFrequency: 'daily',   priority: 0.7, lastModified: now },
    { url: `${baseUrl}/career`,    changeFrequency: 'daily',   priority: 0.7, lastModified: now },
    { url: `${baseUrl}/search`,    changeFrequency: 'weekly',  priority: 0.5, lastModified: now },
    { url: `${baseUrl}/login`,     changeFrequency: 'monthly', priority: 0.3, lastModified: now },
    { url: `${baseUrl}/register`,  changeFrequency: 'monthly', priority: 0.4, lastModified: now },
    { url: `${baseUrl}/terms`,     changeFrequency: 'yearly',  priority: 0.2, lastModified: now },
    { url: `${baseUrl}/privacy`,   changeFrequency: 'yearly',  priority: 0.2, lastModified: now },
  ];

  return staticRoutes;
}
