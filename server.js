import express from 'express';
import cors from 'cors';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';

const app = express();
dotenv.config();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
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

app.post('/api/admin/login', async (req, res) => {
  try {
    const { password } = req.body;

    const [rows] = await pool.query(
      'SELECT admin_user FROM admin WHERE id = 1'
    );

    if (rows.length === 0) {
      return res.status(401).json({
        message: 'Invalid password',
      });
    }

    const admin = rows[0];

    const passwordCorrect = await bcrypt.compare(
      password,
      admin.admin_user
    );

    if (!passwordCorrect) {
      return res.status(401).json({
        message: 'Invalid password',
      });
    }

    res.json({
      message: 'Login successful',
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: 'Server error',
    });
  }
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
});