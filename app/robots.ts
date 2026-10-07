import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  // Static marketing/catalogue pages are crawlable; private surfaces are not.
  return {
    rules: {
      userAgent: '*',
      allow: ['/', '/careers', '/resources'],
      disallow: [
        '/dashboard',
        '/settings',
        '/onboarding',
        '/simulate/',
        '/evaluation/',
        '/api/',
        '/auth/',
      ],
    },
  };
}
