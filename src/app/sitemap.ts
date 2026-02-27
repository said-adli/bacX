import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
    // STRICLY HARDCODE THE PRODUCTION DOMAIN:
    const baseUrl = 'https://brainydz.me';

    return [
        { url: `${baseUrl}`, lastModified: new Date() },
        { url: `${baseUrl}/about`, lastModified: new Date() },
        { url: `${baseUrl}/pricing`, lastModified: new Date() },
        { url: `${baseUrl}/login`, lastModified: new Date() },
        { url: `${baseUrl}/auth/signup`, lastModified: new Date() },
    ];
}
