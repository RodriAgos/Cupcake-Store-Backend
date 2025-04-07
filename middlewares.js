const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const pool = require('./db');

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_for_development';
const verifyTokenAsync = promisify(jwt.verify);

const verificarToken = async (req, res, next) => {

  const authHeader = req.headers.authorization || req.headers.Authorization;
  
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ 
      error: 'Token no proporcionado',
      details: 'El formato debe ser: Bearer [token]'
    });
  }

  // extraer el token
  const token = authHeader.split(' ')[1];
  
  try {
    // verificar y decodificar el token
    const decoded = await verifyTokenAsync.call(jwt, token, JWT_SECRET);
    
    const userCheck = await pool.query(
      'SELECT user_id FROM users WHERE user_id = $1 AND email = $2',
      [decoded.userId, decoded.email]
    );
    
    if (userCheck.rows.length === 0) {
      return res.status(401).json({ 
        error: 'Token inválido',
        details: 'El usuario asociado al token no existe'
      });
    }

    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role
    };

    next();
  } catch (error) {
    console.error('Error en verificación de token:', error);
    
    const response = {
      error: 'Token inválido',
      details: 'No se pudo autenticar la solicitud'
    };

    if (error.name === 'TokenExpiredError') {
      response.error = 'Token expirado';
      response.details = 'El token ha caducado, por favor inicie sesión nuevamente';
      return res.status(401).json(response);
    }

    if (error.name === 'JsonWebTokenError') {
      response.details = 'Token malformado o firma inválida';
    }

    return res.status(403).json(response);
  }
};

const verificarAdmin = (req, res, next) => {
  if (!req.user?.role) {
    return res.status(403).json({ 
      error: 'Acceso denegado',
      details: 'Se requiere autenticación primero'
    });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({ 
      error: 'Acceso no autorizado',
      details: 'Se requieren privilegios de administrador'
    });
  }

  next();
};

const verificarCliente = (req, res, next) => {
  if (!req.user?.role) {
    return res.status(403).json({ 
      error: 'Acceso denegado',
      details: 'Se requiere autenticación primero'
    });
  }

  if (req.user.role !== 'customer') {
    return res.status(403).json({ 
      error: 'Acceso no autorizado',
      details: 'Se requieren privilegios de cliente'
    });
  }

  next();
};

module.exports = {
  verificarToken,
  verificarAdmin,
  verificarCliente
};
