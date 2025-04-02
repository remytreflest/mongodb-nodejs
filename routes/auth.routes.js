const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';
const COOKIE_NAME = process.env.COOKIE_NAME || 'demo_node+mongo_token';

var body = require("express-validator").body;
var validationResult = require("express-validator").validationResult;

/**
 * @swagger
 * tags:
 *   - name: "Utilisateurs"
 *     description: "Gestion des utilisateurs (inscription, connexion, déconnexion)"
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     tags: ["Utilisateurs"]
 *     summary: "Créer un nouvel utilisateur"
 *     description: "Cette route permet de créer un nouvel utilisateur en enregistrant son nom et son mot de passe."
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: "Le nom de l’utilisateur"
 *                 example: "JohnDoe"
 *               password:
 *                 type: string
 *                 description: "Le mot de passe de l’utilisateur"
 *                 example: "password123"
 *     responses:
 *       201:
 *         description: "Utilisateur créé avec succès"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Utilisateur créé"
 *       400:
 *         description: "Erreur de validation des données"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       msg:
 *                         type: string
 *                         example: "Le nom d’utilisateur est requis."
 *                       param:
 *                         type: string
 *                         example: "name"
 *       500:
 *         description: "Erreur système, par exemple si le nom est déjà utilisé"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Erreur système"
 */
router.post('/register', [
  body('name').trim().escape()
    .notEmpty().withMessage('Le nom d’utilisateur est requis.')
    .isLength({ min: 3, max: 30 }).withMessage('Doit faire entre 3 et 30 caractères.'),
  body('password').trim().escape()
    .notEmpty().withMessage('Le mot de passe est requis.')
    .isLength({ min: 6 }).withMessage('Minimum 6 caractères.')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  const { name, password } = req.body;

  try {
    const user = new User({ name, password });
    await user.save();
    res.status(201).json({ message: 'Utilisateur créé' });
  } catch (err) {
    if (err.code === 11000) return res.status(500).json({ error: 'Erreur système' });
    res.status(400).json({ error: err.message });
  }
});

/**
 * @swagger
 * /auth/login:
 *   post:
 *     tags: ["Utilisateurs"]
 *     summary: "Authentification de l’utilisateur"
 *     description: "Cette route permet à un utilisateur de se connecter en fournissant son nom d’utilisateur et son mot de passe."
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: "Le nom de l’utilisateur"
 *                 example: "JohnDoe"
 *               password:
 *                 type: string
 *                 description: "Le mot de passe de l’utilisateur"
 *                 example: "password123"
 *     responses:
 *       200:
 *         description: "Connexion réussie et token généré"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Connecté avec succès"
 *       400:
 *         description: "Erreur de validation des données"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       msg:
 *                         type: string
 *                         example: "Le nom d’utilisateur est requis."
 *                       param:
 *                         type: string
 *                         example: "name"
 *       401:
 *         description: "Identifiants invalides"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Identifiants invalides"
 *       500:
 *         description: "Erreur système"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Erreur système"
 */
router.post('/login', [
    body('name').trim().escape()
      .notEmpty().withMessage('Le nom d’utilisateur est requis.')
      .isLength({ min: 3, max: 30 }).withMessage('Doit faire entre 3 et 30 caractères.'),
    body('password').trim().escape()
      .notEmpty().withMessage('Le mot de passe est requis.')
      .isLength({ min: 6 }).withMessage('Minimum 6 caractères.')
  ], 
  async (req, res) => {
  // toujours passer les inputs user au sanitize()
  const name = req.bodyString("name")
  const password = req.bodyString("password")
  const user = await User.findOne({ name });
  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ error: 'Identifiants invalides' });
  }

  const token = jwt.sign({ id: user._id, name: user.name }, JWT_SECRET, { expiresIn: '1d' });

  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'strict',
    secure: false, // à mettre sur true en prod (https)
    maxAge: 24 * 60 * 60 * 1000 // durée de vie 24h
  });

  res.json({ message: 'Connecté avec succès' });
});

/**
 * @swagger
 * /auth/logout:
 *   get:
 *     tags: ["Utilisateurs"]
 *     summary: "Déconnexion de l’utilisateur"
 *     description: "Cette route permet à un utilisateur de se déconnecter en supprimant le cookie contenant le token d’authentification."
 *     responses:
 *       200:
 *         description: "Déconnexion réussie"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Déconnecté"
 *       500:
 *         description: "Erreur système"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Erreur système"
 */
router.get('/logout', (req, res) => {
  res.clearCookie(COOKIE_NAME);
  res.json({ message: 'Déconnecté' });
});

module.exports = router;