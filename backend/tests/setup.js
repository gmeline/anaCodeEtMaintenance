const { MongoMemoryServer } = require("mongodb-memory-server");
const mongoose = require("mongoose");

let mongoServer;

// Configuration avant tous les tests
beforeAll(async () => {
  try {
    jest.setTimeout(10000);
    // Créer une instance MongoDB en mémoire
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();

    // Se connecter à la base de données de test
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("🚀 Base de données de test connectée");
  } catch (error) {
    console.error("❌ Erreur de connexion à la base de test:", error);
    process.exit(1);
  }
});

// Nettoyage après chaque test
afterEach(async () => {
  try {
    const collections = mongoose.connection.collections;

    // Vider toutes les collections
    for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany({});
    }
  } catch (error) {
    console.error("❌ Erreur lors du nettoyage:", error);
  }
});

// Nettoyage final après tous les tests
afterAll(async () => {
  try {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongoServer.stop();
    console.log("🧹 Base de données de test fermée");
  } catch (error) {
    console.error("❌ Erreur lors de la fermeture:", error);
  }
});
