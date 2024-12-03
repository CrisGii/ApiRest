const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../modelos/Usuario");

const router = express.Router();

// Registro usuario
router.post("/register", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Todos los campos son obligatorios, intenta de nuevo" });
  }

  try {
    const hPassword = await bcrypt.hash(password, 10);

    const [result] = await db.query(
      "INSERT INTO users (username, password) VALUES (?, ?)",
      [username, hPassword]
    );

    res
      .status(201)
      .json({
        message: "Usuario registrado con éxito",
        userId: result.insertId,
      });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      res.status(400).json({ message: "El usuario ya existe" });
    } else {
      res.status(500).json({ message: "Error en el servidor" });
    }
  }
});

// Inicio de sesión
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Todos los campos son obligatorios" });
  }

  try {
    const [rows] = await db.query("SELECT * FROM users WHERE username = ?", [
      username,
    ]);

    if (rows.length === 0) {
      return res.status(401).json({ message: "Credenciales inválidas" });
    }

    const user = rows[0];
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ message: "Credenciales inválidas" });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.json({ message: "Autenticación satisfactoria", token });
  } catch (error) {
    res.status(500).json({ message: "Error en el servidor" });
  }
});

module.exports = router;
