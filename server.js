import express from 'express';
import cors from 'cors';
import mysql from 'mysql2/promise';

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'stephie-s_accessories',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

const normalizeCategory = (value) => {
  if (!value) {
    return null;
  }

  const normalized = String(value).trim().toLowerCase();

  if (normalized.includes('ring')) return 'ring';
  if (normalized.includes('necklace')) return 'necklace';
  if (normalized.includes('bracelet')) return 'bracelet';
  if (normalized.includes('anklet')) return 'anklet';
  if (normalized.includes('hair') || normalized.includes('strap')) return 'hair strap';

  return normalized;
};

const inferCategory = (product) =>
  normalizeCategory(
    product.category || `${product.name} ${product.description}`
  );

app.get('/api/products', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, name, price, description, image_url, category FROM products ORDER BY id DESC'
    );

    const products = rows.map((product) => ({
      ...product,
      category: inferCategory(product),
    }));

    res.json(products);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({
      error: 'Unable to load products from database.',
    });
  }
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
});