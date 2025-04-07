const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const pool = require('../db');
const { verificarToken, verificarAdmin } = require('../middlewares');
const { body, validationResult } = require('express-validator');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';
const SALT_ROUNDS = 10;


const userValidations = [
  body('email').isEmail().normalizeEmail().withMessage('Debe ser un email válido'),
  body('password').isLength({ min: 4 }).withMessage('La contraseña debe tener al menos 4 caracteres')
];

// Función para generar username desde el email
const generateUsername = (email) => {
  // Tomamos la parte antes del @ y le quitamos caracteres especiales
  const baseUsername = email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '');
  
  // Aseguramos que tenga al menos 3 caracteres
  if (baseUsername.length >= 3) {
    return baseUsername;
  }
  
  // Si es muy corto, añadimos números aleatorios
  return `${baseUsername}${Math.floor(100 + Math.random() * 900)}`;
};

// REGISTRO de usuario
router.post('/register', userValidations, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;
  const username = generateUsername(email); // Generamos username automático

  try {

    const userExists = await pool.query('SELECT email FROM users WHERE email = $1', [email]);
    if (userExists.rows.length > 0) {
      return res.status(409).json({ error: 'El email ya está registrado' });
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const result = await pool.query(
      `INSERT INTO users (username, email, password) 
       VALUES ($1, $2, $3) 
       RETURNING user_id, username, email, role, created_at`,
      [username, email, hashedPassword]
    );

    const newUser = result.rows[0];
    
    const token = jwt.sign(
      { 
        userId: newUser.user_id, 
        email: newUser.email, 
        role: newUser.role 
      }, 
      JWT_SECRET, 
      { expiresIn: '1h' }
    );

    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      user: {
        id: newUser.user_id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
        createdAt: newUser.created_at
      },
      token
    });
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ 
      error: 'Error al registrar usuario',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// LOGIN de usuario
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').exists()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    const result = await pool.query(
      `SELECT user_id, username, email, password, role, created_at 
       FROM users WHERE email = $1`, 
      [email]
    );
    
    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const token = jwt.sign(
      { 
        userId: user.user_id,
        email: user.email, 
        role: user.role 
      }, 
      JWT_SECRET, 
      { expiresIn: '8h' }
    );

    res.json({ 
      message: 'Login exitoso', 
      token,
      user: {
        id: user.user_id,
        username: user.username,
        email: user.email,
        role: user.role,
        createdAt: user.created_at
      }
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ 
      error: 'Error al iniciar sesión',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

router.get('/profile', verificarToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT user_id, username, email, role, created_at 
       FROM users WHERE user_id = $1`,
      [req.user.userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const user = result.rows[0];
    res.json({
      user: {
        id: user.user_id,
        username: user.username,
        email: user.email,
        role: user.role,
        createdAt: user.created_at
      }
    });
  } catch (error) {
    console.error('Error al obtener perfil:', error);
    res.status(500).json({ error: 'Error al obtener perfil de usuario' });
  }
});

router.put('/profile', verificarToken, [
  body('username').optional().trim().isLength({ min: 3 }),
  body('email').optional().isEmail().normalizeEmail(),
  body('password').optional().isLength({ min: 4 })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { username, email, password } = req.body;
  const updates = {};
  const values = [];
  let query = 'UPDATE users SET ';
  let counter = 1;

  try {
    if (username) {
      updates.username = username;
      query += `username = $${counter}, `;
      values.push(username);
      counter++;
    }

    if (email) {

      const emailCheck = await pool.query(
        'SELECT user_id FROM users WHERE email = $1 AND user_id != $2',
        [email, req.user.userId]
      );
      
      if (emailCheck.rows.length > 0) {
        return res.status(409).json({ error: 'El email ya está en uso por otro usuario' });
      }

      updates.email = email;
      query += `email = $${counter}, `;
      values.push(email);
      counter++;
    }

    if (password) {
      const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
      updates.password = hashedPassword;
      query += `password = $${counter}, `;
      values.push(hashedPassword);
      counter++;
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No se proporcionaron datos para actualizar' });
    }

    // Eliminar la última coma y espacio
    query = query.slice(0, -2);
    query += ` WHERE user_id = $${counter} RETURNING user_id, username, email, role, created_at`;
    values.push(req.user.userId);

    const result = await pool.query(query, values);
    const updatedUser = result.rows[0];

    // Generar nuevo token si el email cambió
    let token;
    if (email) {
      token = jwt.sign(
        { 
          userId: updatedUser.user_id,
          email: updatedUser.email, 
          role: updatedUser.role 
        }, 
        JWT_SECRET, 
        { expiresIn: '8h' }
      );
    }

    res.json({
      message: 'Perfil actualizado exitosamente',
      user: {
        id: updatedUser.user_id,
        username: updatedUser.username,
        email: updatedUser.email,
        role: updatedUser.role,
        createdAt: updatedUser.created_at
      },
      token: token || undefined
    });
  } catch (error) {
    console.error('Error al actualizar perfil:', error);
    res.status(500).json({ error: 'Error al actualizar perfil' });
  }
});

// RUTA ADMIN - Obtener todos los usuarios (solo admin)
router.get('/users', verificarToken, verificarAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT user_id, username, email, role, created_at 
       FROM users ORDER BY created_at DESC`
    );
    res.json({ users: result.rows });
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
});

module.exports = router;