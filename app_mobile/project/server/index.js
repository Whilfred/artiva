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
    if (err) {
      console.error('❌ Erreur de vérification du token:', err);
      return res.status(403).json({ error: 'Token invalide' });
    }
    console.log('✅ Token validé, utilisateur authentifié:', user);
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
    console.log('✅ Utilisateur enregistré avec succès, token généré:', token);
    res.json({ token, userId });
  } catch (err) {
    console.error('❌ Erreur lors de l\'inscription:', err);
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
    console.log('✅ Connexion réussie, token généré:', token);
    res.json({ message: 'Connexion réussie', token, user: { id: user.id, email: user.email, fullName: user.full_name } });
  } catch (err) {
    console.error('❌ Erreur lors de la connexion:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Récupérer les commandes de l'utilisateur avec les noms des produits
app.get('/api/orders', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    console.log('✅ Récupération des commandes pour l\'utilisateur ID:', userId);

    // Récupérer les commandes de l'utilisateur avec les produits associés
    const { rows: orders } = await pool.query(
      `SELECT o.id, o.total, o.address, o.status, o.created_at, 
              oi.product_id, oi.quantity, oi.name as product_name, p.price
       FROM orders o
       LEFT JOIN order_items oi ON o.id = oi.order_id
       LEFT JOIN products p ON oi.product_id = p.id
       WHERE o.user_id = $1
       ORDER BY o.created_at DESC`,
      [userId]
    );

    if (orders.length === 0) {
      console.error('❌ Aucune commande trouvée pour cet utilisateur');
      return res.status(404).json({ error: 'Aucune commande trouvée' });
    }

    // Organiser les résultats sous forme de tableau avec chaque commande et ses produits
    const formattedOrders = [];

    // Utiliser une Map pour regrouper les commandes par ID
    orders.forEach(order => {
      const existingOrder = formattedOrders.find(o => o.orderId === order.id);

      // Si la commande n'existe pas encore, on la crée
      if (!existingOrder) {
        formattedOrders.push({
          orderId: order.id,
          total: order.total,
          address: order.address,
          status: order.status,
          createdAt: order.created_at, // Date et heure de la commande
          products: [{
            productId: order.product_id,
            productName: order.product_name,
            quantity: order.quantity,
            price: order.price,
          }],
        });
      } else {
        // Si la commande existe déjà, on ajoute simplement le produit
        existingOrder.products.push({
          productId: order.product_id,
          productName: order.product_name,
          quantity: order.quantity,
          price: order.price,
        });
      }
    });

    console.log('✅ Commandes récupérées:', formattedOrders);
    res.json(formattedOrders);
  } catch (err) {
    console.error('❌ Erreur lors de la récupération des commandes:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});


// Récupérer les commandes de l'utilisateur avec les noms des produits
app.get('/api/orders', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    console.log('✅ Récupération des commandes pour l\'utilisateur ID:', userId);

    // Récupérer les commandes de l'utilisateur avec les produits associés
    const { rows: orders } = await pool.query(
      `SELECT o.id, o.total, o.address, o.status, o.created_at, 
              oi.product_id, oi.quantity, oi.name as product_name, p.price
       FROM orders o
       LEFT JOIN order_items oi ON o.id = oi.order_id
       LEFT JOIN products p ON oi.product_id = p.id
       WHERE o.user_id = $1
       ORDER BY o.created_at DESC`,
      [userId]
    );

    if (orders.length === 0) {
      console.error('❌ Aucune commande trouvée pour cet utilisateur');
      return res.status(404).json({ error: 'Aucune commande trouvée' });
    }

    const formattedOrders = orders.map(order => ({
      orderId: order.id,
      total: order.total,
      address: order.address,
      status: order.status,
      createdAt: order.created_at, // Date et heure de la commande
      products: orders.filter(o => o.orderId === order.id).map(o => ({
        productId: o.product_id,
        productName: o.product_name,
        quantity: o.quantity,
        price: o.price,
      }))
    }));

    console.log('✅ Commandes récupérées:', formattedOrders);
    res.json(formattedOrders);
  } catch (err) {
    console.error('❌ Erreur lors de la récupération des commandes:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.get('/api/user', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    console.log('✅ Récupération des données pour l\'utilisateur ID:', userId);

    const { rows } = await pool.query('SELECT full_name, email, country, city FROM users WHERE id = $1', [userId]);
    
    if (rows.length === 0) {
      console.error('❌ Utilisateur non trouvé');
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    const user = rows[0];
    console.log('✅ Données utilisateur récupérées:', user);
    res.json(user);
  } catch (err) {
    console.error('❌ Erreur lors de la récupération des données utilisateur:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`🚀 Serveur lancé sur le port ${port}`);
});
