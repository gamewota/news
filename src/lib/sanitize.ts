import createDOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';

const window = new JSDOM('').window as unknown as Window & typeof globalThis;
const DOMPurify = createDOMPurify(window as unknown as any);

export function sanitizeHTML(dirty: string): string {
  if (!dirty) return '';
  try {
    return DOMPurify.sanitize(dirty);
  } catch (e) {
    return '';
  }
}

export function stripAndTruncate(dirty: string, max = 200): string {
  if (!dirty) return '';
  try {
    const text = DOMPurify.sanitize(dirty, { ALLOWED_TAGS: [] })
      .replace(/\s+/g, ' ')
      .trim();
    if (text.length <= max) return text;
    return text.slice(0, max).trimEnd() + '...';
  } catch (e) {
    return '';
  }
}
