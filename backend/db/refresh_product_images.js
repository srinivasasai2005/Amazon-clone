import 'dotenv/config';
import { query } from './database.js';

const DEFAULT_IMAGES_PER_PRODUCT = 3;
const REQUEST_TIMEOUT_MS = 5000;

function normalizeTerm(value) {
  return String(value || '')
    .replace(/\([^)]*\)/g, ' ')
    .replace(/[^a-zA-Z0-9\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function withTimeout(ms) {
  return AbortSignal.timeout(ms);
}

function dedupeUrls(urls) {
  const seen = new Set();
  const out = [];
  for (const raw of urls) {
    if (!raw) continue;
    const url = String(raw).trim();
    if (!url.startsWith('http')) continue;
    if (seen.has(url)) continue;
    seen.add(url);
    out.push(url);
  }
  return out;
}

async function fetchJson(url, options = {}) {
  try {
    const res = await fetch(url, {
      ...options,
      signal: options.signal || withTimeout(REQUEST_TIMEOUT_MS),
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

async function fromWikimedia(searchTerm, limit = 10) {
  const apiUrl = new URL('https://commons.wikimedia.org/w/api.php');
  apiUrl.searchParams.set('action', 'query');
  apiUrl.searchParams.set('format', 'json');
  apiUrl.searchParams.set('origin', '*');
  apiUrl.searchParams.set('generator', 'search');
  apiUrl.searchParams.set('gsrsearch', `${searchTerm} filetype:bitmap`);
  apiUrl.searchParams.set('gsrlimit', String(limit));
  apiUrl.searchParams.set('gsrnamespace', '6');
  apiUrl.searchParams.set('prop', 'imageinfo');
  apiUrl.searchParams.set('iiprop', 'url');

  const data = await fetchJson(apiUrl.toString());
  if (!data?.query?.pages) return [];

  return Object.values(data.query.pages)
    .map((p) => p?.imageinfo?.[0]?.url)
    .filter(Boolean);
}

async function fromOpenverse(searchTerm, limit = 10) {
  const apiUrl = new URL('https://api.openverse.org/v1/images/');
  apiUrl.searchParams.set('q', searchTerm);
  apiUrl.searchParams.set('page_size', String(limit));
  apiUrl.searchParams.set('license_type', 'all');

  const data = await fetchJson(apiUrl.toString());
  if (!data?.results) return [];

  return data.results
    .map((item) => item?.url || item?.thumbnail)
    .filter(Boolean);
}

async function fromFlickr(searchTerm, limit = 10) {
  const apiUrl = new URL('https://www.flickr.com/services/feeds/photos_public.gne');
  apiUrl.searchParams.set('format', 'json');
  apiUrl.searchParams.set('nojsoncallback', '1');
  apiUrl.searchParams.set('tags', searchTerm);

  const data = await fetchJson(apiUrl.toString());
  if (!data?.items) return [];

  return data.items
    .slice(0, limit)
    .map((item) => item?.media?.m)
    .filter(Boolean)
    .map((u) => u.replace('_m.', '_b.'));
}

async function fromPexels(searchTerm, limit = 10) {
  const key = process.env.PEXELS_API_KEY;
  if (!key) return [];

  const apiUrl = new URL('https://api.pexels.com/v1/search');
  apiUrl.searchParams.set('query', searchTerm);
  apiUrl.searchParams.set('per_page', String(limit));

  const data = await fetchJson(apiUrl.toString(), {
    headers: { Authorization: key },
  });
  if (!data?.photos) return [];

  return data.photos
    .map((p) => p?.src?.large2x || p?.src?.large || p?.src?.medium)
    .filter(Boolean);
}

async function fromPixabay(searchTerm, limit = 10) {
  const key = process.env.PIXABAY_API_KEY;
  if (!key) return [];

  const apiUrl = new URL('https://pixabay.com/api/');
  apiUrl.searchParams.set('key', key);
  apiUrl.searchParams.set('q', searchTerm);
  apiUrl.searchParams.set('image_type', 'photo');
  apiUrl.searchParams.set('per_page', String(limit));
  apiUrl.searchParams.set('safesearch', 'true');

  const data = await fetchJson(apiUrl.toString());
  if (!data?.hits) return [];

  return data.hits
    .map((hit) => hit?.largeImageURL || hit?.webformatURL)
    .filter(Boolean);
}

async function buildImagesForProduct(product, usedThumbnails) {
  const terms = [
    normalizeTerm(product.name),
    normalizeTerm(`${product.name} ${product.category_name || ''}`),
    normalizeTerm(product.category_name),
  ].filter(Boolean);

  const collected = [];

  for (const term of terms) {
    const [wikimedia, openverse, flickr, pexels, pixabay] = await Promise.all([
      fromWikimedia(term),
      fromOpenverse(term),
      fromFlickr(term),
      fromPexels(term),
      fromPixabay(term),
    ]);

    collected.push(...wikimedia, ...openverse, ...flickr, ...pexels, ...pixabay);
    if (collected.length >= 30) break;
  }

  const candidates = dedupeUrls(collected);
  const selected = [];
  for (const url of candidates) {
    if (selected.length >= DEFAULT_IMAGES_PER_PRODUCT) break;
    if (!usedThumbnails.has(url)) {
      selected.push(url);
    }
  }

  if (selected.length >= DEFAULT_IMAGES_PER_PRODUCT) return selected;

  // Guaranteed fallback images so no product renders as "No Image".
  const seed = encodeURIComponent(`${product.id}-${product.name}`);
  const fallback = [
    `https://picsum.photos/seed/${seed}-1/900/900`,
    `https://picsum.photos/seed/${seed}-2/900/900`,
    `https://picsum.photos/seed/${seed}-3/900/900`,
  ];

  return dedupeUrls([...selected, ...fallback]).slice(0, DEFAULT_IMAGES_PER_PRODUCT);
}

async function run() {
  const result = await query(`
    SELECT p.id, p.name, p.description, c.name AS category_name
    FROM products p
    JOIN categories c ON c.id = p.category_id
    ORDER BY p.id ASC
  `);

  const products = result.rows;
  console.log(`Found ${products.length} products to refresh images.`);

  const usedThumbnails = new Set();
  let updated = 0;
  for (const product of products) {
    const images = await buildImagesForProduct(product, usedThumbnails);
    const thumbnail = images[0];
    usedThumbnails.add(thumbnail);

    await query(
      `UPDATE products SET thumbnail = $1, images = $2::jsonb WHERE id = $3`,
      [thumbnail, JSON.stringify(images), product.id]
    );

    updated += 1;
    console.log(`[${updated}/${products.length}] Updated image set for: ${product.name}`);
  }

  console.log('Image refresh complete.');
}

run()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Image refresh failed:', err);
    process.exit(1);
  });
