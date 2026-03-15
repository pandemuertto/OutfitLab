// backend/db.js
const { Pool } = require('pg');
require('dotenv').config();

console.log('🔌 Conectando a Supabase (session pooler)...');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  
  // Configuración SSL requerida por Supabase
  ssl: {
    rejectUnauthorized: false  // Importante para conexiones externas
  },
  
  // Configuración del pool
  max: 20,                       // Máximo de conexiones
  idleTimeoutMillis: 30000,      // Tiempo máximo inactivo
  connectionTimeoutMillis: 10000, // Timeout de conexión
  
  // Timeouts de consultas
  statement_timeout: 10000,
  query_timeout: 10000,
  
  // Keep alive
  keepAlive: true,
  keepAliveInitialDelayMillis: 10000
});

// Verificar conexión al iniciar
pool.on('connect', () => {
  console.log('✅ Conectado a Supabase (session pooler)');
  console.log('🌐 Host: aws-0-us-west-2.pooler.supabase.com');
  console.log('🗄️  Base de datos: postgres');
  console.log('👤 Usuario: postgres.zyevdphvdrtmuxgtkjlk');
});

pool.on('error', (err) => {
  console.error('❌ Error en conexión a Supabase:', err.message);
});

// Función para probar la conexión
async function testConnection() {
  try {
    const client = await pool.connect();
    const res = await client.query('SELECT NOW() as time, version() as version');
    console.log('⏰ Tiempo en BD:', res.rows[0].time);
    client.release();
    return true;
  } catch (err) {
    console.error('❌ Error probando conexión:', err.message);
    return false;
  }
}

// Ejecutar prueba
testConnection();

module.exports = pool;