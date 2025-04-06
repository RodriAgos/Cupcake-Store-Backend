<<<<<<< HEAD
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { Pool } = require("pg");
require("dotenv").config();
const { generateToken } = require("./middlewares");

const pool = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    port: process.env.DB_PORT,
});

// const pool = new Pool({
//   connectionString: process.env.DATABASE_URL,
// });

// const generateToken = (user) => {
//   return jwt.sign(
//     { user_id: user.user_id, email: user.email },
//     process.env.JWT_SECRET,
//     { expiresIn: "7d" }
//   );
// };

// const loginUser = async (req, res) => {
//   const { email, password } = req.body;
//   try {
//     const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
//     const user = result.rows[0];

//     if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

//     const validPassword = await bcrypt.compare(password, user.password);
//     if (!validPassword) return res.status(401).json({ error: "Contraseña incorrecta" });

//     const token = generateToken(user);
//     res.json({ token, email: user.email });
//   } catch (error) {
//     console.error('Error en /api/auth/login:', error);
//     res.status(500).json({ error: "Error al iniciar sesión" });
//   }
// };
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Verificar que existan datos
    if (!email || !password) {
      return res.status(400).json({ error: "Email y password son requeridos" });
    }

    // Buscar usuario por email
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Usuario no encontrado" });
    }

    const user = result.rows[0];

    // Comparar passwords
    const passwordValida = await bcrypt.compare(password, user.password);
    if (!passwordValida) {
      return res.status(401).json({ error: "Contraseña incorrecta" });
    }

    // Generar token
    const token = jwt.sign(
      { user_id: user.user_id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    res.status(200).json({
      token,
      user: {
        user_id: user.user_id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Error en /api/auth/login:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

const registerUser = async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      "INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING *",
      [username, email, hashedPassword]
    );

    const user = result.rows[0];
    console.log("Usuario creado:", user);
    const token = generateToken(user);
    
    res.status(201).json({
      success: true,
      message: "Usuario registrado correctamente",
      token,
      user: { id: user.user_id, email: user.email, username: user.username },
    });
  } catch (error) {
    if (error.code === "23505") {
      res.status(400).json({ 
        success: false,
        error: "El email ya está registrado" 
      });
    } else {
      console.error("Error en /api/auth/register:", error);
      res.status(500).json({ 
        success: false,
        error: "Error al registrar usuario" 
      });
    }
  }
};
    // res.status(201).json({ token, email: user.email });
//   } catch (error) {
//     if (error.code === "23505") {
//       console.error("Error en /api/auth/register:", error);
//       res.status(400).json({ error: "El email ya está registrado" });
//     } else {
//       console.error("Error en /api/auth/register:", error);
//       res.status(500).json({ error: "Error al registrar usuario" });
//     }
//   }
// };

const getUserProfile = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT user_id, email, username, role, created_at FROM users WHERE user_id = $1",
      [req.user.user_id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener perfil" });
  }
};

module.exports = {
  loginUser,
  registerUser,
  getUserProfile,
};


// require("dotenv").config();
// const { Pool } = require("pg");
// const bcrypt = require("bcryptjs");

// const pool = new Pool({
//     host: process.env.DB_HOST,
//     user: process.env.DB_USER,
//     password: process.env.DB_PASSWORD,
//     database: process.env.DB_DATABASE,
//     port: process.env.DB_PORT,
// });

// // const registrarUsuario = async (usuario) => {
// //     let { email, password } = usuario;
// //     const passwordEncriptada = bcrypt.hashSync(password);
// //     password = passwordEncriptada;
// //     const values = [email, passwordEncriptada];
// //     const consulta = "INSERT INTO users values (DEFAULT, $3, $4)";
// //     await pool.query(consulta, values);
// //   };

// const registrarUsuario = async ({ username, email, password }) => {
//   const hash = await bcrypt.hash(password, 10);
//   const consulta = `INSERT INTO users (username, email, password)
//                     VALUES ($1, $2, $3)
//                     RETURNING user_id, username, email, role, created_at`;
//   const { rows } = await pool.query(consulta, [username, email, hash]);
//   return rows[0];
// };

//   const loginUsuario = async (email, password) => {
//     const { rows } = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
//     if (rows.length === 0) throw new Error("Usuario no encontrado");
  
//     const user = rows[0];
//     const match = await bcrypt.compare(password, user.password);
//     if (!match) throw new Error("Contraseña incorrecta");
  
//     delete user.password;
//     return user;
//   };
// // const verificarCredenciales = async (email, password) => {
// //   const values = [email];
// //   const consulta = "SELECT * FROM users WHERE email = $3";
// //   const {
// //     rows: [usuario],
// //     rowCount,
// //   } = await pool.query(consulta, values);
// //   const { password: passwordEncriptada } = usuario;
// //   const passwordEsCorrecta = bcrypt.compareSync(password, passwordEncriptada);
// //   if (!passwordEsCorrecta || !rowCount)
// //     throw { code: 401, message: "Email o contraseña incorrecta" };
// // };

// const obtenerUsuarioPorId = async (id) => {
//   const { rows } = await pool.query(
//     "SELECT user_id, username, email, role, created_at FROM users WHERE user_id = $1",
//     [id]
//   );
//   return rows[0];
// };

// module.exports = {
//   registrarUsuario,
//   loginUsuario,
//   obtenerUsuarioPorId,
// };
=======
// db.js contiene las consultas en mi rama, cucho.

>>>>>>> Cucho_main_backend
