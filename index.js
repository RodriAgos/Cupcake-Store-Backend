require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/productRoutes'); // 👈 nuevo
const cartRoutes = require('./routes/cartRoutes'); // 👈 nuevo
const orderRoutes = require('./routes/orders');



const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes); // 👈 nuevo
app.use('/api/cart', cartRoutes); // 👈 nuevo
app.use('/api/orders', orderRoutes);


app.get('/home', (req, res) => {
  res.send("Hello World Express Js");
});

// Exportar para test
module.exports = app;

// Iniciar servidor si no es test
if (require.main === module) {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`¡Servidor encendido en http://localhost:${PORT}!`);
  });
}
