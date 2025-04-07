const express = require('express');
const pool = require('../db');
const router = express.Router();

// Obtener todos los productos
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM cupcakes');
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener productos' });
  }
});

// Obtener un producto específico
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM cupcakes WHERE cupcake_id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener producto' });
  }
});

module.exports = router;