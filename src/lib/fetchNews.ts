import type { NewsArticle } from '../types/news';

export async function fetchNews(url: string, options: { retries?: number; timeout?: number } = {}): Promise<NewsArticle[]> {
  const { retries = 2, timeout = 10000 } = options;
  if (!url) throw new Error('fetchNews: url is required');

  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    try {
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(id);
      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(`HTTP ${res.status} ${res.statusText} ${text}`);
      }
      const data = await res.json();

      // Accept several common wrapper shapes returned by APIs
      if (Array.isArray(data)) return data as NewsArticle[];
      if (data && Array.isArray((data as any).items)) return (data as any).items as NewsArticle[];
      if (data && Array.isArray((data as any).data)) return (data as any).data as NewsArticle[];
      if (data && Array.isArray((data as any).results)) return (data as any).results as NewsArticle[];
      if (data && Array.isArray((data as any).news)) return (data as any).news as NewsArticle[];
      if (data && Array.isArray((data as any).rows)) return (data as any).rows as NewsArticle[];

      // Some APIs return a single object for a single item — coerce into array if it looks like one
      if (data && typeof data === 'object' && ('id' in data) && ('title' in data || 'name' in data)) {
        return [data as NewsArticle];
      }

      // Unexpected shape — include a short JSON sample to help debugging
      const sample = (() => {
        try {
          return JSON.stringify(data).slice(0, 1000);
        } catch (e) {
          return String(data).slice(0, 1000);
        }
      })();
      throw new Error(`fetchNews: expected JSON array or wrapper containing array, got: ${sample}`);
    } catch (err) {
      clearTimeout(id);
      const isLast = attempt === retries;
      if (isLast) throw err;
      await new Promise((r) => setTimeout(r, 500 * (attempt + 1)));
    }
  }
  return [];
}

export function isValidNewsItem(item: any): item is NewsArticle {
  return !!(item && (item.title));
}
