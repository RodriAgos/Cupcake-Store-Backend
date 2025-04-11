const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const pool = require('../db'); // Asegúrate de tener este archivo creado correctamente
const { verificarToken } = require('../middlewares');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

// REGISTRO de usuario
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING user_id, email, role',
      [username, email, hashedPassword]
    );

    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      user: result.rows[0]
    });
  } catch (error) {
    if (error.code === '23505') {
      res.status(409).json({ error: 'El email ya está registrado' });
    } else {
      console.error(error);
      res.status(500).json({ error: 'Error al registrar usuario' });
    }
  }
});

// LOGIN de usuario
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ error: 'Email no registrado' });
    }

    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(401).json({ error: 'Contraseña incorrecta' });
    }

    const token = jwt.sign({ user_id: user.user_id, email: user.email, role: user.role }, JWT_SECRET, {
      expiresIn: '1h'
    });

    res.json({ message: 'Login exitoso', token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
});

// RUTA PROTEGIDA
router.get('/profile', verificarToken, (req, res) => {
  res.json({
    email: req.user.email,
    role: req.user.role,
    mensaje: 'Ruta protegida accedida con éxito'
  });
});

module.exports = router;
