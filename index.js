<<<<<<< HEAD
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const { loginUser, registerUser, getUserProfile } = require("./consultas");
const { verifyToken } = require("./middlewares");

app.use(cors());
app.use(express.json());

// Rutas de autenticación
app.post("/api/auth/login", loginUser);
app.post("/api/auth/register", registerUser);
app.get("/api/auth/me", verifyToken, getUserProfile);

// Servidor
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
=======
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth'); // Importa tus rutas de autenticación
>>>>>>> Cucho_main_backend

const app = express();

<<<<<<< HEAD
=======
// Middlewares
app.use(cors());               // Permite solicitudes desde otro origen (como React)
app.use(express.json());       // Permite leer JSON desde el cuerpo de la solicitud
>>>>>>> Cucho_main_backend

// Rutas
app.use('/api/auth', authRoutes); // Todas las rutas de auth estarán en este prefijo
app.get('/home', (req, res) => {
  res.send("Hello World Express Js");
});

<<<<<<< HEAD
// require('dotenv').config();
// const express = require('express');
// const jwt = require('jsonwebtoken');
// const cors = require('cors');
// const app = express();

// const {
//     registrarUsuario,
//     // verificarCredenciales,
//     loginUsuario,
//     obtenerUsuarioPorId,
// } = require("./consultas");
// const { verificarToken } = require("./middlewares");

// const PORT = process.env.PORT || 3001;

// app.use(express.json());
// app.use(cors());

// // app.post("/api/auth/login", async (req, res) => {
// //     try {
// //         const { email, password } = req.body;
// //         await verificarCredenciales(email, password);
// //         const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: 60 });
// //         res.send(token);
// //       } catch (error) {
// //         console.log(error);
// //         res.status(error.code || 500).send(error);
// //       }
// //     });

// app.post("/api/auth/login", async (req, res) => {
//   try {
//     const user = await loginUsuario(req.body.email, req.body.password);
//     const token = jwt.sign({ id: user.user_id }, process.env.JWT_SECRET, {
//       expiresIn: "1d",
//     });
//     res.json({ token, user });
//   } catch (err) {
//     res.status(401).json({ error: err.message });
//   }
// });

// // app.post("/api/auth/register", async (req, res) => {
// //   try {
// //     const usuario = req.body;
// //     await registrarUsuario(usuario);
// //     res.status(200).send("Usuario creado con éxito");
// //   } catch (error) {
// //     res.status(500).send(error);
// //   }
// // });

// app.post("/api/auth/register", async (req, res) => {
//   try {
//     const nuevoUsuario = await registrarUsuario(req.body);
//     res.status(201).json(nuevoUsuario);
//   } catch (err) {
//     res.status(400).json({ error: err.message });
//   }
// });

// app.get("/api/auth/verify", verificarToken, async (req, res) => {
//   try {
//     const user = await obtenerUsuarioPorId(req.userId);
//     res.json(user);
//   } catch (err) {
//     res.status(500).json({ error: "Token válido, pero ocurrió un error" });
//   }
// });

// app.listen(PORT, () => {
//   console.log(`Servidor corriendo en http://localhost:${PORT}`);
// });

// // app.get("/home", (req, res) => {
// // res.send("Hello World Express Js")
// // })
=======
// Exportar para poder testear con supertest más adelante
module.exports = app;

// Solo inicia el servidor si no es un test
if (require.main === module) {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`¡Servidor encendido en http://localhost:${PORT}!`);
  });
}
>>>>>>> Cucho_main_backend
