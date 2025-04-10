const express = require('express');
const router = express.Router();
const pool = require('../db');
const { verificarToken } = require('../middlewares');

// Obtener carrito del usuario
router.get('/', verificarToken, async (req, res) => {
  try {
    const userId = req.user.user_id;

    const result = await pool.query(
      `SELECT c.cart_id, c.quantity, c.cupcake_id, p.name, p.price, p.image_url
       FROM cart c
       JOIN cupcakes p ON c.cupcake_id = p.cupcake_id
       WHERE c.user_id = $1`,
      [userId]
    );

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener el carrito' });
  }
});

// Agregar producto al carrito
router.post('/', verificarToken, async (req, res) => {
  const userId = req.user.user_id;
  const { cupcake_id, quantity } = req.body;

  try {
    // Si ya existe, actualizar la cantidad
    const existing = await pool.query(
      'SELECT * FROM cart WHERE user_id = $1 AND cupcake_id = $2',
      [userId, cupcake_id]
    );

    if (existing.rows.length > 0) {
      await pool.query(
        'UPDATE cart SET quantity = quantity + $1 WHERE user_id = $2 AND cupcake_id = $3',
        [quantity, userId, cupcake_id]
      );
    } else {
      await pool.query(
        'INSERT INTO cart (user_id, cupcake_id, quantity) VALUES ($1, $2, $3)',
        [userId, cupcake_id, quantity]
      );
    }

    res.status(201).json({ message: 'Producto agregado al carrito' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al agregar al carrito' });
  }
});

// Eliminar producto del carrito
router.delete('/:cupcake_id', verificarToken, async (req, res) => {
  const userId = req.user.user_id;
  const { cupcake_id } = req.params;

  try {
    await pool.query(
      'DELETE FROM cart WHERE user_id = $1 AND cupcake_id = $2',
      [userId, cupcake_id]
    );

    res.sendStatus(204);
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar producto del carrito' });
  }
});

module.exports = router;
