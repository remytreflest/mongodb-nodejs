const swaggerJSDoc = require('swagger-jsdoc');

const options = {
	definition: {
	  openapi: '3.0.0',
	  info: {
		title: 'Potion API',
		version: '1.0.0',
		description: 'Une API pour gérer les potions magiques', 
	  },
	},
	apis: ['./routes/*.js'],
  };

module.exports = swaggerJSDoc(options);