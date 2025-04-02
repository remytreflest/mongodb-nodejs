require('dotenv').config();
const PORT = process.env.PORT || 3000;
const express = require('express');
const cors = require('cors')
const mongoose = require('mongoose');
const routes = require('./routes/routes');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger/swaggerSpec');
const authRoutes = require('./routes/auth.routes');
const middlewareSanitize = require('sanitize').middleware;
const cookieParser = require('cookie-parser');
const app = express();

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use(express.json());
app.use(cors())
app.use(cookieParser());
app.use(middlewareSanitize);
app.use('/potions', routes);
app.use('/auth', authRoutes);

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Connecté à MongoDB'))
    .catch(err => console.error('Erreur MongoDB :', err));

app.listen(PORT, () => {
  console.log(`Serveur lancé sur http://localhost:${PORT}`);
});