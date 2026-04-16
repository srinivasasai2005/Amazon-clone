import { Router } from 'express';
import { query } from '../db/database.js';

const router = Router();

// ── GET /api/products ──────────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const { q, category, sort, minPrice, maxPrice, limit = 50, offset = 0 } = req.query;

    let sql = `
      SELECT p.*, c.name AS category_name, c.slug AS category_slug
      FROM products p
      JOIN categories c ON p.category_id = c.id
      WHERE 1=1
    `;
    const params = [];
    let paramIndex = 1;

    if (q) {
      sql += ` AND (p.name ILIKE $${paramIndex} OR p.description ILIKE $${paramIndex+1})`;
      params.push(`%${q}%`, `%${q}%`);
      paramIndex += 2;
    }
    if (category) {
      sql += ` AND c.slug = $${paramIndex}`;
      params.push(category);
      paramIndex++;
    }
    if (minPrice) {
      sql += ` AND p.price >= $${paramIndex}`;
      params.push(Number(minPrice));
      paramIndex++;
    }
    if (maxPrice) {
      sql += ` AND p.price <= $${paramIndex}`;
      params.push(Number(maxPrice));
      paramIndex++;
    }

    const sortMap = {
      'price-asc':  'p.price ASC',
      'price-desc': 'p.price DESC',
      'rating':     'p.rating DESC',
      'popular':    'p.review_count DESC',
      'newest':     'p.created_at DESC',
    };
    sql += ` ORDER BY ${sortMap[sort] || 'p.review_count DESC'}`;
    sql += ` LIMIT $${paramIndex} OFFSET $${paramIndex+1}`;
    params.push(Number(limit), Number(offset));

    const result = await query(sql, params);
    const products = result.rows.map(parseProduct);

    res.json({ products, total: products.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// ── GET /api/products/:id ──────────────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const result = await query(`
      SELECT p.*, c.name AS category_name, c.slug AS category_slug
      FROM products p
      JOIN categories c ON p.category_id = c.id
      WHERE p.id = $1
    `, [req.params.id]);

    if (!result.rows[0]) return res.status(404).json({ error: 'Product not found' });
    const row = result.rows[0];

    const relatedRes = await query(`
      SELECT * FROM products 
      WHERE category_id = $1 AND id != $2 
      ORDER BY review_count DESC LIMIT 6
    `, [row.category_id, row.id]);

    res.json({
      product: parseProduct(row),
      related: relatedRes.rows.map(parseProduct),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// ── Helper ─────────────────────────────────────────────────────────────────────
function parseProduct(p) {
  // specs and images are already JSONB in postgres, so pg driver parses them!
  // Fallbacks just in case:
  let images = typeof p.images === 'string' ? JSON.parse(p.images) : p.images;
  let specs = typeof p.specs === 'string' ? JSON.parse(p.specs) : p.specs;

  const fallbackSeed = encodeURIComponent(String(p.id || p.name || 'product'));
  const fallback = `https://picsum.photos/seed/fallback-${fallbackSeed}/600/600`;
  const safeImages = Array.isArray(images)
    ? images.filter(Boolean).map((img) => String(img))
    : [];
  const safeThumbnail = p.thumbnail || safeImages[0] || fallback;

  return {
    ...p,
    thumbnail: safeThumbnail,
    images: safeImages.length ? safeImages : [safeThumbnail],
    specs: specs || {},
    is_prime: Boolean(p.is_prime),
    price: Number(p.price),
    rating: Number(p.rating)
  };
}

export default router;
