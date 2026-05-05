import { Pool } from 'pg';
import 'dotenv/config';

// Cria a conexão com o banco
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Função para criar a tabela se não existir
export const initDb = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      nome VARCHAR(100) NOT NULL,
      email VARCHAR(100) UNIQUE NOT NULL,
      senha VARCHAR(100) NOT NULL,
      role VARCHAR(50) DEFAULT 'responsavel',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  try {
    await pool.query(query);
    console.log('Tabela "users" verificada/criada com sucesso no PostgreSQL!');
  } catch (err) {
    console.error('Erro ao verificar/criar tabela:', err);
  }
};