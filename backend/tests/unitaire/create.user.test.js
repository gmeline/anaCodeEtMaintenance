const request = require('supertest');
const mongoose = require('mongoose');
const { validUsers, invalidUsers } = require("../fixtures/users");
const app = require("../../src/app");
const User = require("../../src/models/userModel");

jest.setTimeout(10000); // Timeout étendu à 10s

beforeAll(async () => {
    const mongoUri = process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/testdb';
    await mongoose.connect(mongoUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
});

afterAll(async () => {
    await mongoose.connection.close();
});

describe("POST /api/users - Création d'utilisateur", () => {

    // Nettoyer la collection users après chaque test
    afterEach(async () => {
        await User.deleteMany({});
    });

    test("✅ Devrait créer un utilisateur avec des données valides", async () => {
        const userData = {
            ...validUsers[0],
            email: `alice+${Date.now()}@example.com`,
        };

        const response = await request(app)
            .post("/api/users")
            .send(userData);

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

        // Créer le premier utilisateur (doit réussir)
        await request(app)
            .post("/api/users")
            .send(userData)
            .expect(201);

        // Tenter de créer un utilisateur avec le même email (doit échouer)
        const response = await request(app)
            .post("/api/users")
            .send(userData)
            .expect(400);

        expect(response.body).toHaveProperty("error");
    });

});
