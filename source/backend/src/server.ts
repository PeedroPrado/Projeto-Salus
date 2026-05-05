import express from 'express';
import cors from 'cors';
import { pool, createDatabaseIfNotExists, initDb } from './database';

const app = express();
app.use(cors());
app.use(express.json());

// Rota de Cadastro (SignUp)
app.post('/api/signup', async (req, res) => {
  const { nome, email, senha } = req.body;

  try {
    const result = await pool.query(
      'INSERT INTO users (nome, email, senha) VALUES ($1, $2, $3) RETURNING id, nome, email, role',
      [nome, email, senha]
    );
    res.status(201).json(result.rows[0]);
  } catch (error: any) {
    if (error.code === '23505') {
      res.status(400).json({ message: 'Este e-mail já está cadastrado.' });
    } else {
      console.error(error);
      res.status(500).json({ message: 'Erro interno no servidor.' });
    }
  }
});

// Rota de Login
app.post('/api/login', async (req, res) => {
  const { email, senha } = req.body;

  try {
    const result = await pool.query(
      'SELECT id, nome, email, role FROM users WHERE email = $1 AND senha = $2',
      [email, senha]
    );

    if (result.rows.length > 0) {
      res.status(200).json(result.rows[0]); 
    } else {
      res.status(401).json({ message: 'E-mail ou senha incorretos.' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro interno no servidor.' });
  }
});

const PORT = process.env.PORT || 3000;

// Inicialização sequencial do Servidor
const startServer = async () => {
  try {
    // 1. Cria o banco se ele não existir
    await createDatabaseIfNotExists();
    
    // 2. Cria as tabelas necessárias
    await initDb();

    // 3. Liga o servidor para receber requisições do App
    app.listen(PORT, () => {
      console.log(`🚀 Servidor rodando na porta ${PORT}`);
    });
  } catch (error) {
    console.error('Falha ao iniciar a API:', error);
  }
};

startServer();
