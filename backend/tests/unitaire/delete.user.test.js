const request = require("supertest"); // import manquant
const User = require("../../src/models/userModel");
const { validUsers } = require("../fixtures/users");
const app = require("../../src/app");
const mongoose = require("mongoose");

beforeAll(async () => {
  await mongoose.connect("mongodb://localhost:27017/nom_de_ta_db_test", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

afterAll(async () => {
  await mongoose.connection.close();
});
describe("DELETE /api/users/:id - Suppression d'utilisateur", () => {
  let userId;

  beforeEach(async () => {
    const user = await User.create(validUsers[0]);
    userId = user._id.toString();
  });

  afterEach(async () => {
    // Nettoyer la collection users après chaque test
    await User.deleteMany({});
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
  test("❌ Devrait retourner 500 si une erreur serveur survient", async () => {
    // Forcer une erreur dans findByIdAndDelete
    jest.spyOn(User, "findByIdAndDelete").mockImplementationOnce(() => {
      throw new Error("Erreur serveur simulée");
    });

    const response = await request(app)
      .delete(`/api/users/${userId}`)
      .expect(500);

    expect(response.body).toHaveProperty("error", "Erreur serveur simulée");

    jest.restoreAllMocks();
  });
});
