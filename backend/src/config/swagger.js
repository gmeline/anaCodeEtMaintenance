const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./swagger-jsdoc");

function setupSwagger(app) {
  app.use("/swagger", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}

module.exports = setupSwagger;
