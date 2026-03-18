// backend/users.pg.js
const pool = require('./db');
const cuid = require('cuid');

// ---------- USERS ----------
async function findByEmail(email) {
  console.log('🔍 Buscando usuario por email:', email);
  const { rows } = await pool.query(
    `SELECT id, name, email, password
     FROM usuario
     WHERE email = $1
     LIMIT 1`,
    [email]
  );
  console.log('✅ Resultado findByEmail:', rows[0] || null);
  return rows[0] || null;
}

async function createLocal({ name, email, passwordHash }) {
  const newId = cuid();
  console.log('🆕 Creando usuario local:', { newId, name, email });
  const { rows } = await pool.query(
    `INSERT INTO usuario (id, name, email, password, created_at, updated_at)
     VALUES ($1, $2, $3, $4, NOW(), NOW())
     RETURNING id, name, email`,
    [newId, name, email, passwordHash]
  );
  console.log('✅ Usuario local creado:', rows[0]);
  return rows[0];
}

async function createSocial({ name, email }) {
  const newId = cuid();
  console.log('🆕 Creando usuario social:', { newId, name, email });
  const { rows } = await pool.query(
    `INSERT INTO usuario (id, name, email, password, created_at, updated_at)
     VALUES ($1, $2, $3, NULL, NOW(), NOW())
     RETURNING id, name, email`,
    [newId, name, email]
  );
  console.log('✅ Usuario social creado:', rows[0]);
  return rows[0];
}

// ---------- PROVIDERS (OAuth) ----------
async function findByProvider(provider, providerId) {
  console.log('🔍 Buscando por provider:', { provider, providerId });
  const { rows } = await pool.query(
    `SELECT u.id, u.name, u.email
     FROM auth_providers ap
     JOIN usuario u ON u.id = ap.user_id
     WHERE ap.provider = $1 AND ap.provider_id = $2
     LIMIT 1`,
    [provider, providerId]
  );
  console.log('✅ Resultado findByProvider:', rows[0] || null);
  return rows[0] || null;
}

async function linkProvider(userId, provider, providerId) {
  console.log('🔗 Vinculando provider:', { userId, provider, providerId });
  await pool.query(
    `INSERT INTO auth_providers (user_id, provider, provider_id)
     VALUES ($1, $2, $3)
     ON CONFLICT (provider, provider_id) DO NOTHING`,
    [userId, provider, providerId]
  );
  console.log('✅ Provider vinculado');
  return true;
}

module.exports = {
  findByEmail,
  createLocal,
  createSocial,
  findByProvider,
  linkProvider,
};