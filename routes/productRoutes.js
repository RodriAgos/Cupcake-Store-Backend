const express = require('express');
const router = express.Router();
const { getAllProducts, getProductById } = require('../controllers/productController'); // ✅ Asegúrate de que las funciones sean importadas correctamente

// Ruta para obtener todos los productos
router.get('/', getAllProducts);

// Ruta para obtener un producto por su ID
router.get('/:id', getProductById);

module.exports = router;
