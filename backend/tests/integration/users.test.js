const request = require("supertest");
const app = require("../../src/app");
const User = require("../../src/models/userModel");
const mongoose = require("mongoose");
require("dotenv").config();

const { validUsers, invalidUsers, updateData } = require("../fixtures/users");
const MONGO_URI = process.env.MONGO_URI;

beforeAll(async () => {
  await mongoose.connect(MONGO_URI);
  await User.deleteMany({});
});

afterAll(async () => {
  await User.deleteMany({});
  await mongoose.connection.close();
});

beforeEach(async () => {
  await User.deleteMany({});
});

describe("🧪 Tests d'intégration - API Users", () => {
  describe("POST /api/users - Création d'utilisateur", () => {
    test("✅ Devrait créer un utilisateur avec des données valides", async () => {
      const userData = {
        ...validUsers[0],
        email: `alice+${Date.now()}@example.com`,
      };

      const response = await request(app).post("/api/users").send(userData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("_id");
      expect(response.body.name).toBe(userData.name);
      expect(response.body.email).toBe(userData.email);
      expect(response.body.age).toBe(userData.age);

      const userInDb = await User.findById(response.body._id);
      expect(userInDb).toBeTruthy();
      expect(userInDb.name).toBe(userData.name);
    });

    test("❌ Devrait rejeter un utilisateur sans nom", async () => {
      const response = await request(app)
        .post("/api/users")
        .send(invalidUsers[0])
        .expect(400);

      expect(response.body).toHaveProperty("error");
    });

    test("❌ Devrait rejeter un email invalide", async () => {
      const response = await request(app)
        .post("/api/users")
        .send(invalidUsers[3])
        .expect(400);

      expect(response.body).toHaveProperty("error");
    });

    test("❌ Devrait rejeter un email en double", async () => {
      const userData = validUsers[0];

      await request(app).post("/api/users").send(userData).expect(201);

      const response = await request(app)
        .post("/api/users")
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty("error");
    });
  });

  describe("GET /api/users - Liste des utilisateurs", () => {
    test("✅ Devrait retourner tous les utilisateurs", async () => {
      await User.insertMany(validUsers);

      const response = await request(app).get("/api/users").expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(validUsers.length);
      expect(response.body[0]).toHaveProperty("_id");
      expect(response.body[0]).toHaveProperty("name");
      expect(response.body[0]).toHaveProperty("email");
    });

    test("✅ Devrait retourner un tableau vide s'il n'y a pas d'utilisateurs", async () => {
      const response = await request(app).get("/api/users").expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(0);
    });
  });

  describe("GET /api/users/:id - Utilisateur par ID", () => {
    let userId;

    beforeEach(async () => {
      const user = await User.create(validUsers[0]);
      userId = user._id.toString();
    });

    test("✅ Devrait retourner un utilisateur par son ID", async () => {
      const response = await request(app)
        .get(`/api/users/${userId}`)
        .expect(200);

      expect(response.body._id).toBe(userId);
      expect(response.body.name).toBe(validUsers[0].name);
      expect(response.body.email).toBe(validUsers[0].email);
    });

    test("❌ Devrait retourner 404 pour un ID inexistant", async () => {
      const fakeId = "507f1f77bcf86cd799439011";

      const response = await request(app)
        .get(`/api/users/${fakeId}`)
        .expect(404);

      expect(response.body).toHaveProperty("error");
    });

    test("❌ Devrait retourner 400 pour un ID invalide", async () => {
      const invalidId = "invalid-id";

      const response = await request(app)
        .get(`/api/users/${invalidId}`)
        .expect(400);

      expect(response.body).toHaveProperty("error");
    });
  });

  describe("PUT /api/users/:id - Mise à jour d'utilisateur", () => {
    let userId;

    beforeEach(async () => {
      const user = await User.create(validUsers[0]);
      userId = user._id.toString();
    });
    test("✅ Devrait mettre à jour un utilisateur", async () => {
      const response = await request(app)
        .put(`/api/users/${userId}`)
        .send(updateData)
        .expect(200);

      expect(response.body._id).toBe(userId);
      expect(response.body.name).toBe(updateData.name);
      expect(response.body.email).toBe(updateData.email);
      expect(response.body.age).toBe(updateData.age);

      // Vérifier en base
      const updatedUser = await User.findById(userId);
      expect(updatedUser.name).toBe(updateData.name);
    });
    test("✅ Devrait permettre une mise à jour partielle", async () => {
      const partialUpdate = { name: "Nom partiellement mis à jour" };

      const response = await request(app)
        .put(`/api/users/${userId}`)
        .send(partialUpdate)
        .expect(200);

      expect(response.body.name).toBe(partialUpdate.name);
      expect(response.body.email).toBe(validUsers[0].email); // Email inchangé
    });
    test("❌ Devrait rejeter une mise à jour avec des données invalides", async () => {
      const invalidUpdate = { email: "email-invalide" }; // Email non valide

      const response = await request(app)
        .put(`/api/users/${userId}`)
        .send(invalidUpdate)
        .expect(400);

      expect(response.body).toHaveProperty("error");
    });
    test("❌ Devrait retourner 404 pour un ID inexistant lors de la mise à jour", async () => {
      const fakeId = "507f1f77bcf86cd799439011";

      const response = await request(app)
        .put(`/api/users/${fakeId}`)
        .send(updateData)
        .expect(404);

      expect(response.body).toHaveProperty("error");
    });
    test("❌ Devrait retourner 400 pour un ID invalide lors de la mise à jour", async () => {
      const invalidId = "invalid-id";

      const response = await request(app)
        .put(`/api/users/${invalidId}`)
        .send(updateData)
        .expect(400);

      expect(response.body).toHaveProperty("error");
    });
  });

  describe("DELETE /api/users/:id - Suppression d'utilisateur", () => {
    let userId;

    beforeEach(async () => {
      const user = await User.create(validUsers[0]);
      userId = user._id.toString();
    });
    test("✅ Devrait supprimer un utilisateur", async () => {
      await request(app).delete(`/api/users/${userId}`).expect(204);

      const deletedUser = await User.findById(userId);
      expect(deletedUser).toBeNull();
    });
    test("❌ Devrait retourner 404 pour un ID inexistant lors de la suppression", async () => {
      const fakeId = "507f1f77bcf86cd799439011";

      const response = await request(app)
        .delete(`/api/users/${fakeId}`)
        .expect(404);

      expect(response.body).toHaveProperty("error");
    });
    test("❌ Devrait retourner 400 pour un ID invalide lors de la suppression", async () => {
      const invalidId = "invalid-id";

      const response = await request(app)
        .delete(`/api/users/${invalidId}`)
        .expect(400);

      expect(response.body).toHaveProperty("error");
    });
  });
});
