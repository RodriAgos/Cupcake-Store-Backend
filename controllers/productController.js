const pool = require('../db'); // Conexión a la base de datos

// Obtener todos los productos desde la base de datos
const getAllProducts = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM products');
    res.json(result.rows); // Devuelve todos los productos como JSON
  } catch (err) {
    console.error('Error al obtener productos:', err);
    res.status(500).json({ error: 'Error al obtener productos' });
  }
};

// Obtener un producto por su ID
const getProductById = async (req, res) => {
  const { id } = req.params; // Obtener el ID del producto desde la URL
  try {
    const result = await pool.query('SELECT * FROM products WHERE cupcake_id = $1', [id]); // Parámetro de consulta con $1
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.json(result.rows[0]); // Devuelve el producto encontrado
  } catch (err) {
    console.error('Error al obtener el producto:', err);
    res.status(500).json({ error: 'Error al obtener el producto' });
  }
};

module.exports = {
  getAllProducts,
  getProductById,
};
