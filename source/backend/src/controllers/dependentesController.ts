import { Response } from 'express';
import bcrypt from 'bcrypt';
import { pool } from '../database';
import { AuthRequest } from '../middleware/auth';

export const createDependente = async (req: AuthRequest, res: Response) => {
  if (req.user?.role !== 'responsavel') {
    return res.status(403).json({ message: 'Apenas responsáveis podem cadastrar dependentes.' });
  }

  const responsavelId = req.user.id;
  const { nome, email, senha } = req.body;

  if (!nome || !email || !senha) {
    return res.status(400).json({ message: 'Nome, email e senha são obrigatórios.' });
  }

  try {
    const emailExistente = await pool.query(
      'SELECT id FROM users WHERE email = $1', [email]
    );
    if (emailExistente.rows.length > 0) {
      return res.status(409).json({ message: 'Este e-mail já está em uso.' });
    }

    const senhaHash = await bcrypt.hash(senha, 10);

    const novoUsuario = await pool.query(
      `INSERT INTO users (nome, email, senha, role)
       VALUES ($1, $2, $3, 'dependente')
       RETURNING id, nome, email, role`,
      [nome, email, senhaHash]
    );
    const dependenteId = novoUsuario.rows[0].id;

    await pool.query(
      `INSERT INTO dependentes (responsavel_id, dependente_id) VALUES ($1, $2)`,
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
};

export const listDependentes = async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT u.id, u.nome, u.email
       FROM users u
       INNER JOIN dependentes d ON d.dependente_id = u.id
       WHERE d.responsavel_id = $1`,
      [req.user?.id]
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro interno no servidor.' });
  }
};

export const updateDependente = async (req: AuthRequest, res: Response) => {
  if (req.user?.role !== 'responsavel') {
    return res.status(403).json({ message: 'Apenas responsáveis podem editar dependentes.' });
  }

  const { nome, email } = req.body;

  if (!nome || !email) {
    return res.status(400).json({ message: 'Nome e email são obrigatórios.' });
  }

  try {
    const vinculo = await pool.query(
      `SELECT dependente_id FROM dependentes WHERE dependente_id = $1 AND responsavel_id = $2`,
      [req.params.id, req.user.id]
    );
    if (vinculo.rows.length === 0) {
      return res.status(403).json({ message: 'Dependente não encontrado ou sem permissão.' });
    }

    const emailExistente = await pool.query(
      'SELECT id FROM users WHERE email = $1 AND id != $2',
      [email, req.params.id]
    );
    if (emailExistente.rows.length > 0) {
      return res.status(409).json({ message: 'Este e-mail já está em uso.' });
    }

    const result = await pool.query(
      `UPDATE users SET nome = $1, email = $2 WHERE id = $3 RETURNING id, nome, email`,
      [nome, email, req.params.id]
    );

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao editar dependente.' });
  }
};

export const deleteDependente = async (req: AuthRequest, res: Response) => {
  
  if (req.user?.role !== 'responsavel') {
    return res.status(403).json({ message: 'Apenas responsáveis podem excluir dependentes.' });
  }

  try {
    const vinculo = await pool.query(
      `SELECT dependente_id FROM dependentes WHERE dependente_id = $1 AND responsavel_id = $2`,
      [req.params.id, req.user.id]
    );
    
    if (vinculo.rows.length === 0) {
      return res.status(403).json({ message: 'Dependente não encontrado ou sem permissão.' });
    }

    // Deleta os medicamentos vinculados a este dependente primeiro
    await pool.query('DELETE FROM medicamentos WHERE dependente_id = $1', [req.params.id]);

    // deleta o vínculo entre responsável e dependente
    await pool.query('DELETE FROM dependentes WHERE dependente_id = $1', [req.params.id]);
    
    // deleta o usuário
    await pool.query('DELETE FROM users WHERE id = $1', [req.params.id]);

    res.status(200).json({ message: 'Dependente removido com sucesso.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao remover dependente.' });
  }
};