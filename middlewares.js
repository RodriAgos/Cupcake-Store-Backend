require("dotenv").config();
const jwt = require("jsonwebtoken");

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.user_id,       // o user.user_id, depende de tu DB
      email: user.email,
      username: user.username,
    },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }  // Token expira en 1 hora
  );
};
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Token no proporcionado" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // contiene user_id y email
    next();
  } catch (err) {
    res.status(403).json({ error: "Token inválido o expirado" });
  }
};

module.exports = {
  verifyToken,
  generateToken,
};


// const jwt = require("jsonwebtoken");
// require("dotenv").config();

// const verificarToken = (req, res, next) => {
//   const token = req.headers.authorization?.split(" ")[1];
//   if (!token) return res.status(401).json({ error: "Token no enviado" });

//   jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
//     if (err) return res.status(403).json({ error: "Token inválido" });
//     req.userId = decoded.id;
//     next();
//   });
// };

// module.exports = {
//   verificarToken,
// };