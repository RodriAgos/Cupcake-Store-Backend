const request = require('supertest');
const app = require('../index'); // Asegúrate que index.js exporta `app`

let token = '';

describe('Autenticación y rutas protegidas', () => {

  // 1. Registro exitoso
  test('POST /api/auth/register debe registrar un usuario nuevo', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'testuser',
        email: 'testuser@example.com',
        password: '1234'
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.user).toHaveProperty('email', 'testuser@example.com');
  });

  // 2. Login exitoso
  test('POST /api/auth/login debe autenticar y devolver un token', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'testuser@example.com',
        password: '1234'
      });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
    token = res.body.token; // Guardamos el token para la siguiente prueba
  });

  // 3. Acceso sin token: debe fallar
  test('GET /api/auth/profile sin token debe devolver 401', async () => {
    const res = await request(app).get('/api/auth/profile');
    expect(res.statusCode).toBe(401);
  });

  // 4. Acceso con token: debe funcionar
  test('GET /api/auth/profile con token debe devolver datos del usuario', async () => {
    const res = await request(app)
      .get('/api/auth/profile')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('email', 'testuser@example.com');
  });
});
