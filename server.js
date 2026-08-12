import express from 'express';
import cors from 'cors';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import { createClient } from '@supabase/supabase-js';

const app = express();
dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

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

app.post('/api/products', async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      image_url,
      category
    } = req.body;

    if (!name || !price || !image_url || !category) {
      return res.status(400).json({
        message: 'Missing required product information.'
      });
    }

    const [result] = await pool.execute(
      `INSERT INTO products
       (name, description, price, image_url, category)
       VALUES (?, ?, ?, ?, ?)`,
      [
        name,
        description || null,
        price,
        image_url,
        category
      ]
    );

    const [rows] = await pool.execute(
      `SELECT * FROM products WHERE id = ?`,
      [result.insertId]
    );

    res.status(201).json(rows[0]);

  } catch (error) {
    console.error('Failed to add product:', error);

    res.status(500).json({
      message: 'Failed to add product.'
    });
  }
});

app.put('/api/products/:id', async (req, res) => {
  const { id } = req.params;

  const {
    name,
    description,
    price,
    image_url,
    category
  } = req.body;

  try {
    // Get the old image URL
    const [products] = await pool.execute(
      'SELECT image_url FROM products WHERE id = ?',
      [id]
    );

    if (products.length === 0) {
      return res.status(404).json({
        message: 'Product not found.'
      });
    }

    const oldImageUrl = products[0].image_url;

    // Update database
    const [result] = await pool.execute(
      `UPDATE products
       SET name = ?,
           description = ?,
           price = ?,
           image_url = ?,
           category = ?
       WHERE id = ?`,
      [
        name,
        description || '',
        Number(price),
        image_url,
        category,
        id
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: 'Product not found.'
      });
    }

    // If the image changed, delete the old image
    if (
      oldImageUrl &&
      image_url &&
      oldImageUrl !== image_url
    ) {
      try {
        const url = new URL(oldImageUrl);

        const marker = '/storage/v1/object/public/products/';

        if (url.pathname.includes(marker)) {
          const oldFilePath = decodeURIComponent(
            url.pathname.split(marker)[1]
          );

          const { error: storageError } = await supabase.storage
            .from('products')
            .remove([oldFilePath]);

          if (storageError) {
            console.error(
              'Failed to delete old Supabase image:',
              storageError
            );
          }
        }
      } catch (imageError) {
        console.error(
          'Failed to process old image URL:',
          imageError
        );
      }
    }

    // Get updated product
    const [updatedProducts] = await pool.execute(
      'SELECT * FROM products WHERE id = ?',
      [id]
    );

    res.json(updatedProducts[0]);

  } catch (error) {
    console.error('Failed to update product:', error);

    res.status(500).json({
      message: 'Failed to update product.'
    });
  }
});

app.delete('/api/products/:id', async (req, res) => {
  const { id } = req.params;

  try {
    // Get the product first so we know which image belongs to it
    const [products] = await pool.execute(
      'SELECT image_url FROM products WHERE id = ?',
      [id]
    );

    if (products.length === 0) {
      return res.status(404).json({
        message: 'Product not found.'
      });
    }

    const imageUrl = products[0].image_url;

    // Delete product from MySQL
    const [result] = await pool.execute(
      'DELETE FROM products WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: 'Product not found.'
      });
    }

    // Delete image from Supabase
    if (imageUrl) {
      try {
        const url = new URL(imageUrl);

        const marker = '/storage/v1/object/public/products/';

        if (url.pathname.includes(marker)) {
          const filePath = decodeURIComponent(
            url.pathname.split(marker)[1]
          );

          const { error: storageError } = await supabase.storage
            .from('products')
            .remove([filePath]);

          if (storageError) {
            console.error(
              'Failed to delete Supabase image:',
              storageError
            );
          }
        }
      } catch (imageError) {
        console.error(
          'Failed to process image URL:',
          imageError
        );
      }
    }

    res.json({
      message: 'Product and image deleted successfully.'
    });

  } catch (error) {
    console.error('Failed to delete product:', error);

    res.status(500).json({
      message: 'Failed to delete product.'
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