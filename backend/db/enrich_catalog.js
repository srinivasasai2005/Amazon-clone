import { query } from './database.js';
import 'dotenv/config';

const categories = [
  { name: 'Grocery Essentials', slug: 'grocery', image_url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&q=75' },
  { name: 'Office Supplies', slug: 'office-supplies', image_url: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=500&q=75' },
  { name: 'Pet Supplies', slug: 'pet-supplies', image_url: 'https://images.unsplash.com/photo-1583512603806-077998240c7a?w=500&q=75' },
];

const products = [
  { cat: 'grocery', name: 'Aashirvaad Atta 10kg Family Pack', price: 499, rating: 4.5, review_count: 52000, description: 'Whole wheat flour for daily cooking.', specs: { Weight: '10kg', Type: 'Whole Wheat' } },
  { cat: 'grocery', name: 'Fortune Sunlite Refined Sunflower Oil 5L', price: 799, rating: 4.4, review_count: 33000, description: 'Light and healthy refined cooking oil.', specs: { Volume: '5L', Type: 'Sunflower' } },
  { cat: 'office-supplies', name: 'Classmate Spiral Notebook Pack of 6', price: 399, rating: 4.5, review_count: 25000, description: 'Premium quality ruled notebooks for students and office use.', specs: { Quantity: '6', Pages: '180 each' } },
  { cat: 'office-supplies', name: 'HP 680 Black Ink Cartridge', price: 999, rating: 4.3, review_count: 14000, description: 'Original HP cartridge for sharp prints.', specs: { Color: 'Black', Yield: '480 pages' } },
  { cat: 'pet-supplies', name: 'Pedigree Adult Dry Dog Food 3kg', price: 699, rating: 4.5, review_count: 27000, description: 'Complete and balanced nutrition for adult dogs.', specs: { Weight: '3kg', Breed: 'All' } },
  { cat: 'pet-supplies', name: 'Whiskas Ocean Fish Adult Cat Food 1.2kg', price: 460, rating: 4.6, review_count: 22000, description: 'Tasty and nutritious food for adult cats.', specs: { Weight: '1.2kg', Flavor: 'Ocean Fish' } },
];

const fallbackMap = {
  grocery: 'https://images.unsplash.com/photo-1542838132-92c53300491e',
  'office-supplies': 'https://images.unsplash.com/photo-1455390582262-044cdead277a',
  'pet-supplies': 'https://images.unsplash.com/photo-1583512603806-077998240c7a',
};

async function run() {
  const catIdBySlug = {};

  for (const c of categories) {
    const existing = await query('SELECT id FROM categories WHERE slug = $1', [c.slug]);
    if (existing.rows[0]) {
      catIdBySlug[c.slug] = existing.rows[0].id;
      continue;
    }

    const ins = await query(
      'INSERT INTO categories (name, slug, image_url) VALUES ($1, $2, $3) RETURNING id',
      [c.name, c.slug, c.image_url]
    );
    catIdBySlug[c.slug] = ins.rows[0].id;
  }

  for (const p of products) {
    const exists = await query('SELECT id FROM products WHERE name = $1', [p.name]);
    if (exists.rows[0]) continue;

    const base = fallbackMap[p.cat];
    const thumb = `${base}?w=500&q=80`;
    const images = [`${base}?w=600&q=80`, `${base}?w=800&q=80&sharp=1`];

    await query(
      `INSERT INTO products (category_id, name, description, price, stock_qty, rating, review_count, thumbnail, images, specs, is_prime)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb, $10::jsonb, $11)`,
      [
        catIdBySlug[p.cat],
        p.name,
        p.description,
        p.price,
        100,
        p.rating,
        p.review_count,
        thumb,
        JSON.stringify(images),
        JSON.stringify(p.specs),
        true,
      ]
    );
  }

  console.log('Catalog enrichment completed successfully.');
}

run()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Catalog enrichment failed:', err);
    process.exit(1);
  });
