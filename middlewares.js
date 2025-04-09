const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

const verificarToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: 'Token no proporcionado' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // Aquí podrías guardar datos del usuario
    next(); // ¡Todo bien! Continúa a la siguiente función o ruta
  } catch (error) {
    return res.status(403).json({ error: 'Token inválido o expirado' });
  }
};

// Middleware para verificar si el usuario es admin
function isAdmin(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Acceso denegado: solo administradores' });
  }
  next();
}

module.exports = { verificarToken, isAdmin };
