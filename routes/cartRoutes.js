const express = require('express');
const router = express.Router();
const { verificarToken } = require('../middlewares');
const { pool } = require('../db');

// Obtener el carrito del usuario
router.get('/', verificarToken, async (req, res) => {
  const userId = req.user_id;
  try {
    const result = await pool.query(
      `SELECT c.cart_id, c.quantity, p.*
       FROM cart c
       JOIN products p ON c.cupcake_id = p.cupcake_id
       WHERE c.user_id = $1`, [userId]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener el carrito' });
  }
});

// Agregar o actualizar un producto en el carrito
router.post('/', verificarToken, async (req, res) => {
  const userId = req.user_id;
  const { cupcake_id, quantity } = req.body;

  try {
    await pool.query(
      `INSERT INTO cart (user_id, cupcake_id, quantity)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, cupcake_id)
       DO UPDATE SET quantity = EXCLUDED.quantity`,
      [userId, cupcake_id, quantity]
    );
    res.status(200).json({ message: 'Producto agregado al carrito' });
  } catch (error) {
    res.status(500).json({ error: 'Error al agregar al carrito' });
  }
});

// Eliminar un producto del carrito
router.delete('/:cupcake_id', verificarToken, async (req, res) => {
  const userId = req.user_id;
  const cupcakeId = req.params.cupcake_id;

  try {
    await pool.query(
      `DELETE FROM cart WHERE user_id = $1 AND cupcake_id = $2`,
      [userId, cupcakeId]
    );
    res.status(200).json({ message: 'Producto eliminado del carrito' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar del carrito' });
  }
});

module.exports = router;
