const express = require('express');
const router = express.Router();
const Potion = require('../models/potion.model');
var authMiddleware = require('../middleware/authMiddleware');

/**
 * @swagger
 * tags:
 *   - name: "Potions"
 *     description: "Gestion des potions (création, modification, suppression)"
 */

/**
 * @swagger
 * /potions:
 *   get:
 *     tags: ["Potions"]
 *     summary: "Récupérer toutes les potions"
 *     description: "Retourne une liste de toutes les potions disponibles."
 *     responses:
 *       200:
 *         description: "Liste des potions"
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *       500:
 *         description: "Erreur interne du serveur"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
router.get('/', async (req, res) => {
  try {
    const potions = await Potion.find();
    res.json(potions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /potions/names:
 *   get:
 *     tags: ["Potions"]
 *     summary: "Récupérer les noms de toutes les potions"
 *     description: "Retourne une liste des noms de toutes les potions."
 *     responses:
 *       200:
 *         description: "Liste des noms de potions"
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: string
 *       500:
 *         description: "Erreur interne du serveur"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
router.get('/names', async (req, res) => {
  try {
      const names = await Potion.find({}, 'name'); // On ne sélectionne que le champ 'name'
      res.json(names.map(p => p.name)); // renvoyer juste un tableau de strings
  } catch (err) {
      res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /potions/vendor/{vendor_id}:
 *   get:
 *     tags: ["Potions"]
 *     summary: "Récupérer toutes les potions d’un vendeur spécifique"
 *     description: "Retourne une liste des potions associées à un vendeur identifié par son ID."
 *     parameters:
 *       - name: vendor_id
 *         in: path
 *         required: true
 *         description: "ID du vendeur dont les potions doivent être récupérées"
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: "Liste des potions du vendeur"
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *       500:
 *         description: "Erreur interne du serveur"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
router.get('/vendor/:vendor_id', async (req, res) => {
  try {
      const vender_id = req.params.vendor_id;
      const datas = await Potion.find({"vendor_id": vender_id}, 'name'); // On ne sélectionne que le champ 'name'
      res.json(datas.map(p => p)); // renvoyer juste un tableau de strings
  } catch (err) {
      res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /potions/price-range:
 *   get:
 *     tags: ["Potions"]
 *     summary: "Récupérer toutes les potions dans une plage de prix"
 *     description: "Retourne une liste de potions dont le prix est compris entre les valeurs min et max spécifiées."
 *     parameters:
 *       - name: min
 *         in: query
 *         required: true
 *         description: "Prix minimum de la potion"
 *         schema:
 *           type: number
 *       - name: max
 *         in: query
 *         required: true
 *         description: "Prix maximum de la potion"
 *         schema:
 *           type: number
 *     responses:
 *       200:
 *         description: "Liste des potions dans la plage de prix"
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *       500:
 *         description: "Erreur interne du serveur"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
router.get('/price-range', async (req, res) => {
  try {
      const min = req.query.min;
      const max = req.query.max;
      const datas = await Potion.find({"price": {$lte: max, $gte: min}}); // On ne sélectionne que le champ 'name'
      res.json(datas); // renvoyer juste un tableau de strings
  } catch (err) {
      res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /potions/analytics/distinct-categories:
 *   get:
 *     tags: ["Potions"]
 *     summary: "Récupérer toutes les catégories distinctes"
 *     description: "Retourne une liste des catégories distinctes présentes dans les potions."
 *     responses:
 *       200:
 *         description: "Liste des catégories distinctes"
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *       500:
 *         description: "Erreur interne du serveur"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
router.get('/analytics/distinct-categories', async (req, res) => {
  try {
      const datas = await Potion.aggregate([{$unwind:"$categories"},{$group:{_id: "$categories"}}]); // On ne sélectionne que le champ 'name'
      res.json(datas); // renvoyer juste un tableau de strings
  } catch (err) {
      res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /potions/analytics/average-score-by-vendor:
 *   get:
 *     tags: ["Potions"]
 *     summary: "Récupérer le score moyen par vendeur"
 *     description: "Retourne le score moyen des potions pour chaque vendeur."
 *     responses:
 *       200:
 *         description: "Score moyen par vendeur"
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     description: "ID du vendeur"
 *                   avg_score:
 *                     type: number
 *                     description: "Score moyen des potions du vendeur"
 *       500:
 *         description: "Erreur interne du serveur"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
router.get('/analytics/average-score-by-vendor', async (req, res) => {
  try {
      const datas = await Potion.aggregate([
        { 
            $group: { 
                _id: "$vendor_id", 
                avg_score: { $avg: "$score" } 
            } 
        }
    ]);
      res.json(datas); // renvoyer juste un tableau de strings
  } catch (err) {
      res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /potions/analytics/average-score-by-category:
 *   get:
 *     tags: ["Potions"]
 *     summary: "Récupérer le score moyen par catégorie"
 *     description: "Retourne le score moyen des potions pour chaque catégorie."
 *     responses:
 *       200:
 *         description: "Score moyen par catégorie"
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     description: "Nom de la catégorie"
 *                   avg_score:
 *                     type: number
 *                     description: "Score moyen des potions dans cette catégorie"
 *       500:
 *         description: "Erreur interne du serveur"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
router.get('/analytics/average-score-by-category', async (req, res) => {
  try {
      const datas = await Potion.aggregate([
        { $unwind: "$categories" },
        { 
            $group: { 
                _id: "$categories", 
                avg_score: { $avg: "$score" } 
            } 
        }
    ]);
      res.json(datas); // renvoyer juste un tableau de strings
  } catch (err) {
      res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /potions/analytics/strength-flavor-ratio:
 *   get:
 *     tags: ["Potions"]
 *     summary: "Obtenir le ratio entre la force et le parfum"
 *     description: "Retourne le ratio entre la force et le parfum des potions."
 *     responses:
 *       200:
 *         description: "Ratio entre force et parfum"
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *       500:
 *         description: "Erreur interne du serveur"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
router.get('/analytics/strength-flavor-ratio', async (req, res) => {
  try {
      const datas = await Potion.aggregate([
        { 
            $project: { 
                name: 1, 
                strength: "$ratings.strength", 
                flavor: "$ratings.flavor", 
                ratio: { 
                    $cond: { 
                        if: { $gt: ["$ratings.flavor", 0] }, 
                        then: { $divide: ["$ratings.strength", "$ratings.flavor"] }, 
                        else: null
                    }
                }
            } 
        }
    ]);
      res.json(datas); // renvoyer juste un tableau de strings
  } catch (err) {
      res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /potions/analytics/search:
 *   get:
 *     tags: ["Potions"]
 *     summary: "Recherche d'agrégats personnalisés"
 *     description: "Effectue une recherche avec trois paramètres : 'groupBy' (par vendeur ou par catégorie), 'metric' (métrique au choix: avg, sum, count) et 'field' (champ à agréger: score, price, ratings)."
 *     parameters:
 *       - in: query
 *         name: groupBy
 *         description: "Champ par lequel grouper les données (vendor ou category)"
 *         required: true
 *         schema:
 *           type: string
 *           enum: [vendor, category]
 *       - in: query
 *         name: metric
 *         description: "Métrique à appliquer (avg, sum, count)"
 *         required: true
 *         schema:
 *           type: string
 *           enum: [avg, sum, count]
 *       - in: query
 *         name: field
 *         description: "Champ sur lequel appliquer la métrique (score, price, ratings)"
 *         required: true
 *         schema:
 *           type: string
 *           enum: [score, price, ratings]
 *     responses:
 *       200:
 *         description: "Résultats de l'agrégation"
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     description: "Champ par lequel les données sont groupées (vendor_id ou catégorie)"
 *                   result:
 *                     type: number
 *                     description: "Résultat de l'agrégation"
 *       400:
 *         description: "Paramètres invalides"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: "Message d'erreur expliquant ce qui est invalide"
 *       500:
 *         description: "Erreur interne du serveur"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: "Message d'erreur en cas de problème sur le serveur"
 */
router.get('/analytics/search', async (req, res) => {
    try {
      const { groupBy, metric, field } = req.query;

      // Validation des paramètres
      if (!groupBy || !metric || !field) {
          return res.status(400).json({ error: "Veuillez fournir 'groupBy', 'metric' et 'field'." });
      }

      // Définir le champ de regroupement
      let groupField = groupBy === "vendor" ? "$vendor_id" : "$categories";
      let unwindStage = groupBy === "category" ? { $unwind: "$categories" } : null;

      // Définir l'opération d'agrégation
      let metricOperator;
      switch (metric) {
          case "avg":
              metricOperator = { $avg: `$${field}` };
              break;
          case "sum":
              metricOperator = { $sum: `$${field}` };
              break;
          case "count":
              metricOperator = { $sum: 1 };
              break;
          default:
              return res.status(400).json({ error: "Metric invalide. Choisissez 'avg', 'sum' ou 'count'." });
      }

      // Construire l'agrégation
      let pipeline = [];
      if (unwindStage) pipeline.push(unwindStage); // Unwind si groupBy = category
      pipeline.push({
          $group: {
              _id: groupField,
              result: metricOperator
          }
      });

      // Exécuter l'agrégation
      const result = await Potion.aggregate(pipeline);
      res.json(result);
  } catch (err) {
      res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /potions/{id}:
 *   get:
 *     tags: ["Potions"]
 *     summary: "Obtenir une potion par ID"
 *     description: "Récupère une potion à partir de son ID unique."
 *     parameters:
 *       - in: path
 *         name: id
 *         description: "ID unique de la potion"
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: "Potion trouvée avec succès"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 name:
 *                   type: string
 *                   description: "Nom de la potion"
 *                 price:
 *                   type: number
 *                   description: "Prix de la potion"
 *                 score:
 *                   type: number
 *                   description: "Score de la potion"
 *                 ingredients:
 *                   type: array
 *                   items:
 *                     type: object
 *                   description: "Liste des ingrédients de la potion"
 *                 ratings:
 *                   type: object
 *                   properties:
 *                     strength:
 *                       type: number
 *                       description: "Note de force de la potion"
 *                     flavor:
 *                       type: number
 *                       description: "Note de parfum de la potion"
 *                 tryDate:
 *                   type: string
 *                   format: date
 *                   description: "Date d'essai de la potion"
 *                 categories:
 *                   type: array
 *                   items:
 *                     type: string
 *                   description: "Catégories de la potion"
 *                 vendor_id:
 *                   type: string
 *                   description: "ID du vendeur de la potion"
 *       400:
 *         description: "ID invalide ou potion non trouvée"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: "Message d'erreur expliquant ce qui est invalide"
 *       500:
 *         description: "Erreur interne du serveur"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: "Message d'erreur en cas de problème sur le serveur"
 */
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const id = req.params.id;
    const potion = await Potion.findById(id);
    res.status(200).json(potion);

  } catch (err) {
      res.status(400).json({ error: err.message });
  }
});

/**
 * @swagger
 * /potions:
 *   post:
 *     tags: ["Potions"]
 *     summary: "Créer une nouvelle potion"
 *     description: "Ajoute une nouvelle potion à la base de données."
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: "Nom de la potion"
 *               price:
 *                 type: number
 *                 description: "Prix de la potion"
 *               score:
 *                 type: number
 *                 description: "Score de la potion"
 *               ingredients:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: "Ingrédients de la potion"
 *               ratings:
 *                 type: object
 *                 properties:
 *                   strength:
 *                     type: number
 *                     description: "Note de force de la potion"
 *                   flavor:
 *                     type: number
 *                     description: "Note de parfum de la potion"
 *               tryDate:
 *                 type: string
 *                 format: date
 *                 description: "Date d'essai de la potion"
 *               categories:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: "Catégories de la potion"
 *               vendor_id:
 *                 type: string
 *                 description: "ID du vendeur de la potion"
 *     responses:
 *       201:
 *         description: "Potion créée avec succès"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 name:
 *                   type: string
 *                   description: "Nom de la potion"
 *                 price:
 *                   type: number
 *                   description: "Prix de la potion"
 *                 score:
 *                   type: number
 *                   description: "Score de la potion"
 *                 ingredients:
 *                   type: array
 *                   items:
 *                     type: string
 *                   description: "Ingrédients de la potion"
 *                 ratings:
 *                   type: object
 *                   properties:
 *                     strength:
 *                       type: number
 *                       description: "Note de force de la potion"
 *                     flavor:
 *                       type: number
 *                       description: "Note de parfum de la potion"
 *                 tryDate:
 *                   type: string
 *                   format: date
 *                   description: "Date d'essai de la potion"
 *                 categories:
 *                   type: array
 *                   items:
 *                     type: string
 *                   description: "Catégories de la potion"
 *                 vendor_id:
 *                   type: string
 *                   description: "ID du vendeur de la potion"
 *       400:
 *         description: "Données envoyées invalides ou potion incorrecte"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: "Message d'erreur en cas de données invalides"
 *       500:
 *         description: "Erreur interne du serveur"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: "Message d'erreur en cas de problème sur le serveur"
 */
router.post('/', authMiddleware, async (req, res) => {
  try {
    if(req.body == ""){
      return res.status(400).json({ error: "Pas de potion correcte envoyée" });
    }

    const newPotion = new Potion(req.body);
    const savedPotion = await newPotion.save();
    res.status(201).json(savedPotion);

  } catch (err) {
      res.status(400).json({ error: err.message });
  }
});

/**
 * @swagger
 * /potions/{id}:
 *   put:
 *     tags: ["Potions"]
 *     summary: "Mettre à jour une potion existante"
 *     description: "Met à jour les informations d'une potion spécifique identifiée par son ID."
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: "L'ID de la potion à mettre à jour"
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: "Nom de la potion"
 *               price:
 *                 type: number
 *                 description: "Prix de la potion"
 *               score:
 *                 type: number
 *                 description: "Score de la potion"
 *               ingredients:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: "Ingrédients de la potion"
 *               ratings:
 *                 type: object
 *                 properties:
 *                   strength:
 *                     type: number
 *                     description: "Note de force de la potion"
 *                   flavor:
 *                     type: number
 *                     description: "Note de parfum de la potion"
 *               tryDate:
 *                 type: string
 *                 format: date
 *                 description: "Date d'essai de la potion"
 *               categories:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: "Catégories de la potion"
 *               vendor_id:
 *                 type: string
 *                 description: "ID du vendeur de la potion"
 *     responses:
 *       200:
 *         description: "Potion mise à jour avec succès"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 name:
 *                   type: string
 *                   description: "Nom de la potion"
 *                 price:
 *                   type: number
 *                   description: "Prix de la potion"
 *                 score:
 *                   type: number
 *                   description: "Score de la potion"
 *                 ingredients:
 *                   type: array
 *                   items:
 *                     type: string
 *                   description: "Ingrédients de la potion"
 *                 ratings:
 *                   type: object
 *                   properties:
 *                     strength:
 *                       type: number
 *                       description: "Note de force de la potion"
 *                     flavor:
 *                       type: number
 *                       description: "Note de parfum de la potion"
 *                 tryDate:
 *                   type: string
 *                   format: date
 *                   description: "Date d'essai de la potion"
 *                 categories:
 *                   type: array
 *                   items:
 *                     type: string
 *                   description: "Catégories de la potion"
 *                 vendor_id:
 *                   type: string
 *                   description: "ID du vendeur de la potion"
 *       400:
 *         description: "Données envoyées invalides ou potion incorrecte"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: "Message d'erreur en cas de données invalides"
 *       404:
 *         description: "Potion non trouvée"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: "Message d'erreur en cas d'ID de potion invalide"
 *       500:
 *         description: "Erreur interne du serveur"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: "Message d'erreur en cas de problème sur le serveur"
 */
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    
    if(req.body == ""){
      return res.status(400).json({ error: "Pas de potion correcte envoyée" });
    }
    const id = req.params.id;
    const potion = req.body;
    const updatedPotion = await Potion.findByIdAndUpdate(id, potion, { runValidators: true });
    res.status(200).json(potion);

  } catch (err) {
      res.status(400).json({ error: err.message });
  }
});

/**
 * @swagger
 * /potions/{id}:
 *   delete:
 *     tags: ["Potions"]
 *     summary: "Supprimer une potion"
 *     description: "Supprime une potion spécifique identifiée par son ID."
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: "L'ID de la potion à supprimer"
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: "Potion supprimée avec succès"
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               example: "Potion supprimée"
 *       400:
 *         description: "Données envoyées invalides ou potion incorrecte"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: "Message d'erreur en cas de données invalides"
 *       404:
 *         description: "Potion non trouvée"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: "Message d'erreur si l'ID de la potion n'est pas trouvé"
 *       500:
 *         description: "Erreur interne du serveur"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: "Message d'erreur en cas de problème sur le serveur"
 */
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    
    if(req.body == ""){
      return res.status(400).json({ error: "Pas de potion correcte envoyée" });
    }
    const id = req.params.id;
    const deletePotion = await Potion.findByIdAndDelete(id);
    res.status(200).json("Potion supprimée");

  } catch (err) {
      res.status(400).json({ error: err.message });
  }
});

module.exports = router;