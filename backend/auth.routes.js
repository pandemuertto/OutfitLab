// backend/auth.routes.js
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');

const repo = require('./users.pg');
const r = express.Router();

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// helper para JWT
function sign(userId) {
  return jwt.sign({ sub: userId }, process.env.JWT_SECRET || 'dev', { expiresIn: '1d' });
}

/* =========================
   Registro local
========================= */
r.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: 'faltan datos' });
    }
    const exists = await repo.findByEmail(email);
    if (exists) return res.status(409).json({ error: 'Email ya existe' });

    const hash = await bcrypt.hash(password, 10);
    const u = await repo.createLocal({ name: name || '', email, passwordHash: hash });

    return res.json({ success: true, user: u });
  } catch (e) {
    console.error('ERROR /auth/register:', e);
    return res.status(500).json({ error: 'server error' });
  }
});

/* =========================
   Login local
========================= */
r.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: 'faltan datos' });
    }

    const u = await repo.findByEmail(email);
    if (!u) return res.status(401).json({ error: 'credenciales' });

    if (!u.password) {
      return res.status(400).json({ error: 'Esta cuenta usa login social' });
    }

    const ok = await bcrypt.compare(password, u.password);
    if (!ok) return res.status(401).json({ error: 'credenciales' });

    const token = sign(u.id);
    return res.json({ token, user: { id: u.id, email: u.email, name: u.name } });
  } catch (e) {
    console.error('ERROR /auth/login:', e);
    return res.status(500).json({ error: 'server error' });
  }
});

/* =========================
   Google Sign-In
========================= */
r.post('/google', async (req, res) => {
  try {
    const { idToken } = req.body || {};
    if (!idToken) return res.status(400).json({ error: 'falta idToken' });

    console.log('🔍 Verificando token de Google...');
    
    // Verificar token con Google
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    
    const payload = ticket.getPayload();
    console.log('✅ Token válido, payload:', {
      sub: payload.sub,
      email: payload.email,
      name: payload.name
    });
    
    const provider = 'google';
    const providerId = payload.sub;
    const email = payload.email;
    const name = payload.name || '';

    // Buscar por proveedor
    let u = await repo.findByProvider(provider, providerId);
    console.log('🔍 Buscando por provider:', u ? 'Encontrado' : 'No encontrado');
    
    if (!u) {
      // Si no existe, buscar por email
      const existing = email ? await repo.findByEmail(email) : null;
      console.log('🔍 Buscando por email:', existing ? 'Encontrado' : 'No encontrado');
      
      if (existing) {
        console.log('🔗 Vinculando provider a usuario existente:', existing.id);
        await repo.linkProvider(existing.id, provider, providerId);
        u = existing;
      } else {
        // Crear usuario social
        console.log('🆕 Creando nuevo usuario social:', { name, email });
        const created = await repo.createSocial({ name, email });
        console.log('✅ Usuario creado:', created);
        
        console.log('🔗 Vinculando provider a nuevo usuario:', created.id);
        await repo.linkProvider(created.id, provider, providerId);
        u = created;
      }
    }

    console.log('✅ Usuario final:', u);
    const token = sign(u.id);
    return res.json({ 
      token, 
      user: { 
        id: u.id, 
        email: u.email, 
        name: u.name 
      } 
    });
    
  } catch (e) {
    console.error('❌ ERROR /auth/google:', e);
    return res.status(401).json({ error: 'token inválido' });
  }
});

module.exports = r;