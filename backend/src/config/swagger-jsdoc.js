const swaggerJSDoc = require("swagger-jsdoc");
const path = require("path");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "API CRUD Utilisateurs",
      version: "1.0.0",
      description:
        "Documentation de l'API CRUD avec Express, MongoDB et Swagger",
    },
    servers: [
      {
        url: "http://localhost:3000",
      },
    ],
  },
  apis: [path.resolve(__dirname, "swaggerDefinition.js")],
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;
