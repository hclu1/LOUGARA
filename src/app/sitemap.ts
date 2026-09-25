import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://lougara.com';
  const currentDate = new Date();

  // Pages publiques stratégiques à indexer par les moteurs de recherche
  const routes = [
    '',
    '/catalogue',
    '/entrepreneurs',
    '/devenir-fournisseur',
    '/verification',
    '/tarifs',
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: currentDate,
    changeFrequency: route === '/catalogue' ? 'daily' : 'weekly',
    priority: route === '' ? 1.0 : route === '/catalogue' ? 0.9 : 0.8,
  }));
}
