const request = require("supertest");
const express = require("express");
const setupSwagger = require("../src/config/swagger"); // chemin réel

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

setupSwagger(app);

describe("Tests routes de l'app", () => {
  test("GET / doit retourner 'Hello World!'", async () => {
    const res = await request(app).get("/");
    expect(res.statusCode).toBe(200);
    expect(res.text).toBe("Hello World!");
  });

  test("GET /swagger/ doit retourner 200 (page Swagger)", async () => {
    const res = await request(app).get("/swagger/");
    expect(res.statusCode).toBe(200);
    expect(res.text).toMatch(/swagger/i);
  });
});
