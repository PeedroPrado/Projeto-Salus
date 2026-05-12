import express from 'express';
import cors from 'cors';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { pool, createDatabaseIfNotExists, initDb } from './database';

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'sua_chave_secreta_aqui';

// ─── Middleware de autenticação JWT ───────────────────────────────────────────
const authMiddleware = (req: any, res: any, next: any) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token não fornecido.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: number; role: string };
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ message: 'Token inválido ou expirado.' });
  }
};

// ─── Rota de Cadastro (SignUp) ────────────────────────────────────────────────
app.post('/api/signup', async (req, res) => {
  const { nome, email, senha } = req.body;

  try {
    const senhaHash = await bcrypt.hash(senha, 10);

    const result = await pool.query(
      `INSERT INTO users (nome, email, senha, role)
       VALUES ($1, $2, $3, 'responsavel')
       RETURNING id, nome, email, role`,
      [nome, email, senhaHash]
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

// ─── Rota de Login ────────────────────────────────────────────────────────────
app.post('/api/login', async (req, res) => {
  const { email, senha } = req.body;

  try {
    const result = await pool.query(
      'SELECT id, nome, email, role, senha FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'E-mail ou senha incorretos.' });
    }

    const user = result.rows[0];
    const senhaCorreta = await bcrypt.compare(senha, user.senha);

    if (!senhaCorreta) {
      return res.status(401).json({ message: 'E-mail ou senha incorretos.' });
    }

    // Gera o token JWT com id e role do usuário
    const token = jwt.sign(
      { id: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      token,
      user: { id: user.id, nome: user.nome, email: user.email, role: user.role }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro interno no servidor.' });
  }
});

// ─── Rota de Cadastro de Dependente ──────────────────────────────────────────
app.post('/api/dependentes', authMiddleware, async (req: any, res) => {
  // Só responsável pode cadastrar dependentes
  if (req.user.role !== 'responsavel') {
    return res.status(403).json({ message: 'Apenas responsáveis podem cadastrar dependentes.' });
  }

  const responsavelId = req.user.id;
  const { nome, email, senha } = req.body;

  if (!nome || !email || !senha) {
    return res.status(400).json({ message: 'Nome, email e senha são obrigatórios.' });
  }

  try {
    // 1. Verifica se email já existe
    const emailExistente = await pool.query(
      'SELECT id FROM users WHERE email = $1', [email]
    );
    if (emailExistente.rows.length > 0) {
      return res.status(409).json({ message: 'Este e-mail já está em uso.' });
    }

    // 2. Hash da senha do dependente
    const senhaHash = await bcrypt.hash(senha, 10);

    // 3. Cria o usuário dependente
    const novoUsuario = await pool.query(
      `INSERT INTO users (nome, email, senha, role)
       VALUES ($1, $2, $3, 'dependente')
       RETURNING id, nome, email, role`,
      [nome, email, senhaHash]
    );
    const dependenteId = novoUsuario.rows[0].id;

    // 4. Vincula dependente ao responsável
    await pool.query(
      `INSERT INTO dependentes (responsavel_id, dependente_id)
       VALUES ($1, $2)`,
      [responsavelId, dependenteId]
    );

    res.status(201).json({
      message: 'Dependente cadastrado com sucesso.',
      dependente: novoUsuario.rows[0],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro interno no servidor.' });
  }
});

// ─── Rota para listar dependentes do responsável ──────────────────────────────
app.get('/api/dependentes', authMiddleware, async (req: any, res) => {
  try {
    const result = await pool.query(
      `SELECT u.id, u.nome, u.email
       FROM users u
       INNER JOIN dependentes d ON d.dependente_id = u.id
       WHERE d.responsavel_id = $1`,
      [req.user.id]
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro interno no servidor.' });
  }
});

// Adicionar medicamento a um dependente
app.post('/api/medicamentos', authMiddleware, async (req: any, res) => {
  const { dependente_id, nome, dose, horario, dias, compartimento } = req.body;

  if (!dependente_id || !nome || !dose || !horario || !dias) {
    return res.status(400).json({ message: 'Todos os campos são obrigatórios.' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO medicamentos (dependente_id, nome, dose, horario, dias, compartimento)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [dependente_id, nome, dose, horario, JSON.stringify(dias), compartimento]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao salvar medicamento.' });
  }
});

// Listar medicamentos de um dependente
app.get('/api/medicamentos/:dependenteId', authMiddleware, async (req: any, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM medicamentos WHERE dependente_id = $1 ORDER BY created_at DESC',
      [req.params.dependenteId]
    );
    const meds = result.rows.map(m => ({ ...m, dias: JSON.parse(m.dias) }));
    res.status(200).json(meds);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao buscar medicamentos.' });
  }
});

app.put('/api/medicamentos/:id', authMiddleware, async (req: any, res) => {
  const { nome, dose, horario, dias } = req.body;

  if (!nome || !dose || !horario || !dias) {
    return res.status(400).json({ message: 'Todos os campos são obrigatórios.' });
  }

  try {
    const result = await pool.query(
      `UPDATE medicamentos
       SET nome = $1, dose = $2, horario = $3, dias = $4
       WHERE id = $5
       RETURNING *`,
      [nome, dose, horario, JSON.stringify(dias), req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Medicamento não encontrado.' });
    }

    const m = result.rows[0];
    res.status(200).json({ ...m, dias: JSON.parse(m.dias) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao editar medicamento.' });
  }
});

// Deletar medicamento
app.delete('/api/medicamentos/:id', authMiddleware, async (req: any, res) => {
  try {
    await pool.query('DELETE FROM medicamentos WHERE id = $1', [req.params.id]);
    res.status(200).json({ message: 'Medicamento removido.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao remover medicamento.' });
  }
});

//Rota de IoT Eventos

app.post("/api/iot/evento", async (req, res) => {

  try {

    const {
      medicamento_id,
      compartimento,
      status
    } = req.body;

    if (!compartimento || !status) {

      return res.status(400).json({
        erro: "Dados incompletos"
      });

    }

    await pool.query(

      `
      INSERT INTO eventos_iot
      (
        medicamento_id,
        compartimento,
        status
      )
      VALUES
      (
        $1,
        $2,
        $3
      )
      `,

      [
        medicamento_id,
        compartimento,
        status
      ]

    );

    console.log("Evento IoT recebido:");

    console.log(req.body);

    res.status(200).json({
      sucesso: true
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      erro: "Erro ao salvar evento"
    });

  }

});

// ======================================
// PROXIMO MEDICAMENTO
// ======================================
app.get("/api/iot/proximo-medicamento", async (req, res) => {

  try {

    const resultado = await pool.query(`

     SELECT
  id,
  nome,
  horario,
  compartimento
FROM medicamentos
WHERE horario = TO_CHAR(NOW(), 'HH24:MI')
LIMIT 1

    `);

    // nenhum medicamento
    if (resultado.rows.length === 0) {

      return res.status(404).json({
        erro: "Nenhum medicamento encontrado"
      });

    }

    res.status(200).json(resultado.rows[0]);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      erro: "Erro ao buscar medicamento"
    });

  }

});

// ─── Inicialização do Servidor ────────────────────────────────────────────────
const PORT = Number(process.env.PORT) || 3000;
const IP = process.env.IP || '0.0.0.0';

const startServer = async () => {
  try {
    await createDatabaseIfNotExists();
    await initDb();
    
    app.listen(PORT, IP, () => {
       console.log(`🚀 Servidor rodando em http://${IP}:${PORT}`);
    });
  } catch (error) {
    console.error('Falha ao iniciar a API:', error);
  }
};

startServer();