const express = require('express');
const router = express.Router();
const pool = require('../db');
const { verificarToken, isAdmin } = require('../middlewares');

// Obtener todos los cupcakes
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM cupcakes ORDER BY cupcake_id');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los cupcakes' });
  }
});

// Obtener un cupcake por ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM cupcakes WHERE cupcake_id = $1', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Cupcake no encontrado' });
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener el cupcake' });
  }
});

// Crear un nuevo cupcake (solo admin)
router.post('/', verificarToken, isAdmin, async (req, res) => {
    const { name, description, price, image_url, stock } = req.body;
    try {
      const result = await pool.query(
        'INSERT INTO cupcakes (name, description, price, image_url, stock) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [name, description, price, image_url, stock]
      );
      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al crear el cupcake' });
    }
  });
  
  // Actualizar un cupcake (solo admin)
  router.put('/:id', verificarToken, isAdmin, async (req, res) => {
    const { id } = req.params;
    const { name, description, price, image_url, stock } = req.body;
    try {
      const result = await pool.query(
        `UPDATE cupcakes
         SET name = $1, description = $2, price = $3, image_url = $4, stock = $5
         WHERE cupcake_id = $6
         RETURNING *`,
        [name, description, price, image_url, stock, id]
      );
      if (result.rows.length === 0) return res.status(404).json({ error: 'Cupcake no encontrado' });
      res.json(result.rows[0]);
    } catch (error) {
      res.status(500).json({ error: 'Error al actualizar el cupcake' });
    }
  });
  
  // Eliminar un cupcake (solo admin)
  router.delete('/:id', verificarToken, isAdmin, async (req, res) => {
    const { id } = req.params;
    try {
      const result = await pool.query('DELETE FROM cupcakes WHERE cupcake_id = $1 RETURNING *', [id]);
      if (result.rows.length === 0) return res.status(404).json({ error: 'Cupcake no encontrado' });
      res.sendStatus(204);
    } catch (error) {
      res.status(500).json({ error: 'Error al eliminar el cupcake' });
    }
  });
  
  module.exports = router;