const request = require("supertest");
const User = require("../../src/models/userModel");
const { validUsers } = require("../fixtures/users");
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
  test("❌ Devrait retourner 500 si une erreur serveur se produit", async () => {
    jest.spyOn(User, "find").mockImplementationOnce(() => {
      throw new Error("Erreur serveur simulée");
    });

    const response = await request(app).get("/api/users").expect(500);

    expect(response.body).toHaveProperty("error", "Erreur serveur simulée");

    // On restaure le comportement original
    jest.restoreAllMocks();
  });
});

describe("GET /api/users/:id - Utilisateur par ID", () => {
  let userId;

  beforeEach(async () => {
    const user = await User.create(validUsers[0]);
    userId = user._id.toString();
  });

  test("✅ Devrait retourner un utilisateur par son ID", async () => {
    const response = await request(app).get(`/api/users/${userId}`).expect(200);

    expect(response.body._id).toBe(userId);
    expect(response.body.name).toBe(validUsers[0].name);
    expect(response.body.email).toBe(validUsers[0].email);
  });

  test("❌ Devrait retourner 404 pour un ID inexistant", async () => {
    const fakeId = "507f1f77bcf86cd799439011";

    const response = await request(app).get(`/api/users/${fakeId}`).expect(404);

    expect(response.body).toHaveProperty("error");
  });

  test("❌ Devrait retourner 400 pour un ID invalide", async () => {
    const invalidId = "invalid-id";

    const response = await request(app)
      .get(`/api/users/${invalidId}`)
      .expect(400);

    expect(response.body).toHaveProperty("error");
  });
  test("❌ Devrait retourner 500 si une erreur serveur survient dans getUserById", async () => {
    jest.spyOn(User, "findById").mockImplementationOnce(() => {
      throw new Error("Erreur serveur simulée");
    });

    const response = await request(app).get(`/api/users/${userId}`).expect(500);

    expect(response.body).toHaveProperty("error", "Erreur serveur simulée");

    jest.restoreAllMocks();
  });
});
