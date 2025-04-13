const express = require('express');
const router = express.Router();
const pool = require('../db');
const { verificarToken } = require('../middlewares');

// Ruta de prueba
router.get('/', verificarToken, (req, res) => {
  res.json({ message: 'Ruta de órdenes activa' });
});

// Ruta de checkout
router.post('/checkout', verificarToken, async (req, res) => {
  const { cart } = req.body;
  const userId = req.user.id;

  try {
    await pool.query('BEGIN');

    // Verificar stock de cada producto
    for (const item of cart) {
      const stockRes = await pool.query(
        'SELECT stock FROM products WHERE cupcake_id = $1 FOR UPDATE',
        [item.cupcake_id]
      );

      const currentStock = stockRes.rows[0]?.stock;

      if (currentStock === undefined || currentStock < item.quantity) {
        await pool.query('ROLLBACK');
        return res.status(400).json({
          error: `Stock insuficiente para el producto con ID ${item.cupcake_id}`
        });
      }
    }

    // Calcular total
    let totalAmount = 0;
    for (const item of cart) {
      const priceRes = await pool.query(
        'SELECT price FROM products WHERE cupcake_id = $1',
        [item.cupcake_id]
      );
      const price = priceRes.rows[0]?.price || 0;
      totalAmount += price * item.quantity;
    }

    // Crear orden con total y estado
    const orderRes = await pool.query(
      'INSERT INTO orders (user_id, total_amount, status) VALUES ($1, $2, $3) RETURNING order_id',
      [userId, totalAmount, 'pending']
    );
    const orderId = orderRes.rows[0].order_id;

    // Insertar detalles (sin columna price) y descontar stock
    for (const item of cart) {
      await pool.query(
        'INSERT INTO order_details (order_id, cupcake_id, quantity) VALUES ($1, $2, $3)',
        [orderId, item.cupcake_id, item.quantity]
      );

      await pool.query(
        'UPDATE products SET stock = stock - $1 WHERE cupcake_id = $2',
        [item.quantity, item.cupcake_id]
      );
    }

    await pool.query('COMMIT');
    res.json({ success: true, orderId });

  } catch (error) {
    await pool.query('ROLLBACK');
    console.error('Error al procesar checkout:', error);
    res.status(500).json({ error: 'Error al procesar la compra' });
  }
});

module.exports = router;
