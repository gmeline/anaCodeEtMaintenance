// server.js
const express = require("express");
const app = express();
const port = 3000;

// Middleware pour parser le JSON
app.use(express.json());

// Exemple de route GET
app.get("/", (req, res) => {
  res.send("Bienvenue sur le serveur Node.js avec Express !");
});

// Exemple de route POST
app.post("/api/data", (req, res) => {
  const data = req.body;
  console.log("Données reçues :", data);
  res.json({ message: "Données reçues avec succès", data });
});

// Lancement du serveur
app.listen(port, () => {
  console.log(`🚀 Serveur démarré sur http://localhost:${port}`);
});
