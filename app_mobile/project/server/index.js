const express = require('express');
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  host: '127.0.0.1',
  user: 'postgres',
  password: 'Fathane2003@', // Remplace par .env plus tard
  database: 'artiva',
  port: 5432,
});

// Vérification de la connexion à PostgreSQL
pool.connect()
  .then(() => console.log('✅ Connexion réussie à PostgreSQL'))
  .catch(err => {
    console.error('❌ Erreur de connexion à PostgreSQL:', err);
    process.exit(1);
  });

const JWT_SECRET = 'supersecretkey123!';

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
    const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '1h' });
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

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ message: 'Connexion réussie', token, user: { id: user.id, email: user.email, fullName: user.full_name } });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// app.post('/api/orders', async (req, res) => {
//   const { user_id, total, address, products } = req.body.order;

//   // Valider que toutes les informations sont présentes
//   if (!user_id || !total || !address || !products) {
//     return res.status(400).json({ error: 'Données manquantes pour la commande' });
//   }

//   try {
//     // Démarrer une transaction pour garantir que tout fonctionne bien ensemble
//     await pool.query('BEGIN');

//     // Insérer la commande dans la table `orders`
//     const result = await pool.query(
//       'INSERT INTO orders (user_id, total, address, status) VALUES ($1, $2, $3, $4) RETURNING id',
//       [user_id, total, address, 'pending']
//     );
//     const orderId = result.rows[0].id;

//     // Parcourir les produits et ajouter chaque produit s'il n'existe pas
//     for (let product of products) {
//       const { product_id, quantity, name } = product;

//       // Vérifier si le produit existe dans la table `products`
//       let productResult = await pool.query('SELECT id FROM products WHERE id = $1', [product_id]);

//       // Si le produit n'existe pas, on l'ajoute avec un prix par défaut
//       if (productResult.rows.length === 0) {
//         console.log(`Produit avec l'ID ${product_id} n'existe pas, création du produit...`);

//         // Définir un prix par défaut pour les nouveaux produits (par exemple 0)
//         const defaultPrice = 0;

//         // Insérer le produit dans la table `products` avec un prix par défaut
//         await pool.query(
//           'INSERT INTO products (id, name, price) VALUES ($1, $2, $3)',
//           [product_id, name, defaultPrice]
//         );

//         // On le recherche à nouveau après insertion
//         productResult = await pool.query('SELECT id FROM products WHERE id = $1', [product_id]);
//       }

//       // Une fois que l'ID du produit est garanti, insérer dans la table `order_items`
//       await pool.query(
//         'INSERT INTO order_items (order_id, product_id, quantity, name) VALUES ($1, $2, $3, $4)',
//         [orderId, product_id, quantity, name]
//       );
//     }

//     // Commit de la transaction pour valider toutes les opérations
//     await pool.query('COMMIT');

//     res.status(201).json({ message: 'Commande créée avec succès' });
//   } catch (error) {
//     // En cas d'erreur, rollback la transaction
//     await pool.query('ROLLBACK');
//     console.error('Erreur lors de la création de la commande:', error);
//     res.status(500).json({ error: 'Erreur serveur' });
//   }
// });
app.post('/api/orders', async (req, res) => {
  const { user_id, total, address, products } = req.body.order;

  // Valider que toutes les informations sont présentes
  if (!user_id || !total || !address || !products) {
    console.log('Données manquantes:', { user_id, total, address, products });
    return res.status(400).json({ error: 'Données manquantes pour la commande' });
  }

  try {
    console.log('Début de la transaction pour la commande');

    // Démarrer une transaction pour garantir que tout fonctionne bien ensemble
    await pool.query('BEGIN');

    // Insérer la commande dans la table `orders`
    const result = await pool.query(
      'INSERT INTO orders (user_id, total, address, status) VALUES ($1, $2, $3, $4) RETURNING id',
      [user_id, total, address, 'pending']
    );
    const orderId = result.rows[0].id;
    console.log(`Commande créée avec succès, ID de la commande: ${orderId}`);

    // Parcourir les produits et ajouter chaque produit s'il n'existe pas
    for (let product of products) {
      const { product_id, quantity, name } = product;  // Assurez-vous que 'name' est bien présent dans les produits
      console.log(`Traitement du produit: ${name}, ID: ${product_id}, Quantité: ${quantity}`);

      // Vérifier si le produit existe dans la table `products`
      let productResult = await pool.query('SELECT id, price FROM products WHERE id = $1', [product_id]);

      if (productResult.rows.length === 0) {
        console.log(`Produit avec l'ID ${product_id} n'existe pas, création du produit...`);

        // Si le prix est passé dans la requête, on l'utilise, sinon on met un prix par défaut
        const productPrice = product.price || 0;
        console.log(`Ajout du produit avec un prix de: ${productPrice}`);

        // Insérer le produit dans la table `products` avec un prix
        await pool.query(
          'INSERT INTO products (id, name, price) VALUES ($1, $2, $3)',
          [product_id, name, productPrice]
        );

        // On le recherche à nouveau après insertion pour obtenir l'ID et le prix
        productResult = await pool.query('SELECT id, price FROM products WHERE id = $1', [product_id]);
        console.log(`Produit créé et récupéré avec succès, Prix: ${productResult.rows[0].price}`);
      } else {
        console.log(`Produit existant, Prix récupéré: ${productResult.rows[0].price}`);
      }

      // Récupérer le prix du produit
      const productPrice = productResult.rows[0].price;

      // Insérer dans la table `order_items` sans la colonne `price`
      console.log(`Insertion dans order_items pour la commande ID: ${orderId}, Produit: ${name}, Quantité: ${quantity}`);
      await pool.query(
        'INSERT INTO order_items (order_id, product_id, quantity, name) VALUES ($1, $2, $3, $4)',
        [orderId, product_id, quantity, name]
      );
    }

    // Commit de la transaction pour valider toutes les opérations
    await pool.query('COMMIT');
    console.log('Transaction commitée avec succès');

    res.status(201).json({ message: 'Commande créée avec succès' });
  } catch (error) {
    // En cas d'erreur, rollback la transaction
    await pool.query('ROLLBACK');
    console.error('Erreur lors de la création de la commande:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

const port = 3000;
app.listen(port, () => {
  console.log(`🚀 Serveur lancé sur le port ${port}`);
});
