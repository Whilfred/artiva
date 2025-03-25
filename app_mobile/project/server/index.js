const express = require('express');
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  host: '127.0.0.1',
  user: 'postgres',
  password: 'Fathane2003@',
  database: 'artiva',
  port: 5432,
});

pool.connect()
  .then(() => console.log('✅ Connexion réussie à PostgreSQL'))
  .catch(err => {
    console.error('❌ Erreur de connexion à PostgreSQL:', err);
    process.exit(1);
  });

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey123!';

const authenticateToken = (req, res, next) => {
  const authHeader = req.header('Authorization');
  if (!authHeader) return res.status(401).json({ error: 'Aucun token fourni' });

  const token = authHeader.replace('Bearer ', '');
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Token invalide' });
    req.user = user;
    next();
  });
};

app.post('/api/register', async (req, res) => {
  const { fullName, country, city, email, phone, password, age } = req.body;
  if (!fullName || !country || !city || !email || !phone || !password || !age) {
    return res.status(400).json({ error: 'Veuillez remplir tous les champs' });
  }
  try {
    const { rows } = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (rows.length > 0) return res.status(400).json({ error: 'Cet email est déjà utilisé' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (full_name, country, city, email, phone, password, age) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id',
      [fullName, country, city, email, phone, hashedPassword, age]
    );

    const userId = result.rows[0].id;
    const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, userId });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Veuillez remplir tous les champs' });

  try {
    const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (rows.length === 0) return res.status(404).json({ error: 'Utilisateur non trouvé' });

    const user = rows[0];
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return res.status(400).json({ error: 'Mot de passe incorrect' });

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ message: 'Connexion réussie', token, user: { id: user.id, email: user.email, fullName: user.full_name } });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.post('/api/orders', authenticateToken, async (req, res) => {
  const { user_id, total, address, products } = req.body.order;
  if (!user_id || !total || !address || !products) {
    return res.status(400).json({ error: 'Données manquantes pour la commande' });
  }
  try {
    await pool.query('BEGIN');
    const result = await pool.query(
      'INSERT INTO orders (user_id, total, address, status) VALUES ($1, $2, $3, $4) RETURNING id',
      [user_id, total, address, 'pending']
    );
    const orderId = result.rows[0].id;
    for (let product of products) {
      const { product_id, quantity, name } = product;
      let productResult = await pool.query('SELECT id, price FROM products WHERE id = $1', [product_id]);
      if (productResult.rows.length === 0) {
        const productPrice = product.price || 0;
        await pool.query(
          'INSERT INTO products (id, name, price) VALUES ($1, $2, $3)',
          [product_id, name, productPrice]
        );
        productResult = await pool.query('SELECT id, price FROM products WHERE id = $1', [product_id]);
      }
      await pool.query(
        'INSERT INTO order_items (order_id, product_id, quantity, name) VALUES ($1, $2, $3, $4)',
        [orderId, product_id, quantity, name]
      );
    }
    await pool.query('COMMIT');
    res.status(201).json({ message: 'Commande créée avec succès' });
  } catch (error) {
    await pool.query('ROLLBACK');
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`🚀 Serveur lancé sur le port ${port}`);
});
