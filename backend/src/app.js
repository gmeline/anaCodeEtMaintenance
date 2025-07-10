const express = require("express");
const userRoute = require("./routes/userRoute");
const setupSwagger = require("./config/swagger");

const app = express();

app.use(express.json());

app.use("/api/users", userRoute);

setupSwagger(app);

app.get("/", (req, res) => {});

module.exports = app;
