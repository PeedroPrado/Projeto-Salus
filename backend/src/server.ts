import express from 'express';
import cors from 'cors';
import { pool, initDb } from './database';

const app = express();
app.use(cors());
app.use(express.json());

// Inicia o banco de dados antes de escutar as rotas
initDb();

// Rota de Cadastro (SignUp)
app.post('/api/signup', async (req, res) => {
  const { nome, email, senha } = req.body;

  try {
    // Insere no banco e retorna os dados do usuário (menos a senha)
    const result = await pool.query(
      'INSERT INTO users (nome, email, senha) VALUES ($1, $2, $3) RETURNING id, nome, email, role',
      [nome, email, senha]
    );
    res.status(201).json(result.rows[0]);
  } catch (error: any) {
    // 23505 é o código do Postgres para Unique Violation (email já existe)
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
      res.status(200).json(result.rows[0]); // Retorna o usuário logado
    } else {
      res.status(401).json({ message: 'E-mail ou senha incorretos.' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro interno no servidor.' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});