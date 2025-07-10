# API CRUD Utilisateurs avec Node.js, Express & MongoDB

Ce projet est une API REST simple pour gérer des utilisateurs (CRUD : Create, Read, Update, Delete) utilisant Node.js, Express, MongoDB et documentée avec Swagger.  

---

## Fonctionnalités

- Création, lecture, mise à jour et suppression d’utilisateurs
- Validation des données via Mongoose
- Documentation automatique avec Swagger UI
- Base de données MongoDB (compatible avec MongoDB Compass)
- Conteneurisation avec Docker & Docker Compose

---

## Prérequis

- Node.js (version 18+ recommandée)
- Docker & Docker Compose installés (optionnel mais recommandé)
- MongoDB Compass (optionnel, pour visualiser la BDD)

---

## Installation

### Sans Docker

1. Cloner le repo

```bash
git clone https://github.com/ton-utilisateur/ton-projet.git
cd ton-projet
```

2. Installer les dépendances
```bash
npm install
```

3. Créer un fichier .env à la racine avec les variables
```bash
PORT=3000
MONGO_URI=mongodb://localhost:27017/crudbdd
```

4. Lancer le serveur
```bash
npm run dev
```
L’API sera accessible sur http://localhost:3000

### Avec Docker

1. Lancer Docker et Docker Compose

```bash
docker-compose up --build
```
Le serveur sera disponible sur http://localhost:3000

MongoDB sera accessible via le port 27017, la base s’appelle crudbdd

## Documentation API
La documentation Swagger est disponible à :
http://localhost:3000/swagger
Tu peux y tester toutes les routes CRUD.

## Structure du projet
.
├── src
│   ├── controllers
│   ├── models
│   ├── routes
│   ├── app.js
│   ├── server.js
│   └── swagger.js
├── .dockerignore
├── .gitignore
├── docker-compose.yml
├── Dockerfile
├── package.json
├── README.md
└── CONTRIBUTING.md
