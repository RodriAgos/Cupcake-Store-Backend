require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth'); // Importa tus rutas de autenticación
const cupcakeRoutes = require('./routes/cupcakes');

const app = express();

// Middlewares
app.use(cors());               // Permite solicitudes desde otro origen (como React)
app.use(express.json());       // Permite leer JSON desde el cuerpo de la solicitud

// Rutas
app.use('/api/auth', authRoutes); // Todas las rutas de auth estarán en este prefijo
app.use('/api/cupcakes', cupcakeRoutes);
app.get('/home', (req, res) => {
  res.send("Hello World Express Js");
});

// Exportar para poder testear con supertest más adelante
module.exports = app;

// Solo inicia el servidor si no es un test
if (require.main === module) {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`¡Servidor encendido en http://localhost:${PORT}!`);
  });
}
