const express = require("express");
const bodyParser = require("body-parser");
const authRoutes = require("./rutas/auth");

require("dotenv").config();

const app = express();
app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.send("Bienvenido a la API de autenticación");
});

app.use("/auth", authRoutes);

const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
