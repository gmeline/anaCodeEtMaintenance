const request = require("supertest");
const User = require("../../src/models/userModel");
const { validUsers, updateData } = require("../fixtures/users");
const app = require("../../src/app");
const mongoose = require("mongoose");

jest.setTimeout(15000); // allonger le timeout global si besoin

// Connexion à la base avant tous les tests
beforeAll(async () => {
  await mongoose.connect("mongodb://localhost:27017/nom_de_ta_db_test", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

// Nettoyage de la collection entre chaque test
afterEach(async () => {
  await User.deleteMany({});
});

// Fermeture de la connexion après tous les tests
afterAll(async () => {
  await mongoose.connection.close();
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
