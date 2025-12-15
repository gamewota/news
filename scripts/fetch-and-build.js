#!/usr/bin/env node
import fs from 'fs/promises';
import path from 'path';

const BACKEND_URL = process.env.BACKEND_URL;

async function ensureDir(dir) {
  try {
    await fs.mkdir(dir, { recursive: true });
  } catch (e) {
    // ignore
  }
}

function slugify(s) {
  return s
    .toString()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Fetch failed: ${res.status} ${res.statusText}`);
  return res.json();
}

async function main() {
  if (!BACKEND_URL) {
    console.error('ERROR: BACKEND_URL environment variable is required');
    process.exit(1);
  }

  console.log('Fetching news from', BACKEND_URL);
  const items = await fetchJson(BACKEND_URL);
  if (!Array.isArray(items)) {
    console.error('Expected an array of news items from backend');
    process.exit(1);
  }

  const outDir = path.resolve(process.cwd(), 'src', 'pages', 'news');
  await ensureDir(outDir);

  for (const item of items) {
    const title = item.title || item.name || 'untitled';
    const slug = item.slug || item.id || slugify(title);
    const date = item.date || item.published_at || new Date().toISOString();
    const description = item.description || item.summary || '';
    const content = item.content || item.body || '';

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
