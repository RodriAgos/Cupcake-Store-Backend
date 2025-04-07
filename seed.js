const pool = require('./db');
const products = require('./productos.json');

async function seedDatabase() {
  try {
    for (const product of products) {
      await pool.query(
        `INSERT INTO cupcakes (name, description, price, image_url, stock) 
         VALUES ($1, $2, $3, $4, $5)`,
        [product.name, product.description, product.price, product.image, 10]
      );
    }
    console.log('Productos insertados correctamente');
  } catch (error) {
    console.error('Error al insertar productos:', error);
  } finally {
    pool.end();
  }
}

seedDatabase();