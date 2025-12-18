#!/usr/bin/env -S node
import fs from 'fs/promises';
import path from 'path';
import { fetchNews } from '../src/lib/fetchNews.ts';

const BACKEND_URL = process.env.BACKEND_URL;

async function ensureDir(dir: string) {
  try {
    await fs.mkdir(dir, { recursive: true });
  } catch (e) {
    // ignore
  }
}

function slugify(s: string) {
  return s
    .toString()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

async function main() {
  if (!BACKEND_URL) {
    console.error('ERROR: BACKEND_URL environment variable is required');
    process.exit(1);
  }

  console.log('Fetching news from', BACKEND_URL);
  const items = await fetchNews(BACKEND_URL, { retries: 3, timeout: 10000 });
  if (!Array.isArray(items)) {
    console.error('Expected an array of news items from backend');
    process.exit(1);
  }

  const outDir = path.resolve(process.cwd(), 'src', 'pages', 'news');
  await ensureDir(outDir);

  for (const item of items) {
    const title = item.title || item.name || 'untitled';
    const slug = (item as any).slug || (item as any).id || slugify(title);
    const date = (item as any).date || (item as any).published_at || new Date().toISOString();
    const description = (item as any).description || (item as any).summary || '';
    const content = (item as any).content || (item as any).body || '';

    const filename = path.join(outDir, `${slug}.md`);
    const frontmatter = `---\ntitle: "${title.replace(/"/g, '\\"')}"\ndate: "${date}"\ndescription: "${description.replace(/"/g, '\\"')}"\n---\n\n`;

    const body = content || '';
    await fs.writeFile(filename, frontmatter + body, 'utf8');
    console.log('Wrote', filename);
  }

  console.log('All news pages written to src/pages/news');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
