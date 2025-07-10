const express = require("express");
const app = express();
const port = 3000;
const setupSwagger = require("./config/swagger");

// Middleware JSON (utile pour API REST)
app.use(express.json());

// Route racine simple
app.get("/", (req, res) => {
    res.send("Hello World!");
});

// Setup Swagger
setupSwagger(app);

app.listen(port, () => {
    console.log(`Serveur démarré sur http://localhost:${port}`);
    console.log(`Swagger UI disponible sur http://localhost:${port}/swagger`);
});
