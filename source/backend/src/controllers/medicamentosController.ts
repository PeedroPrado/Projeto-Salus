import { Response } from 'express';
import { pool } from '../database';
import { AuthRequest } from '../middleware/auth';

export const createMedicamento = async (req: AuthRequest, res: Response) => {
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
};

export const listMedicamentos = async (req: AuthRequest, res: Response) => {
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
};

export const updateMedicamento = async (req: AuthRequest, res: Response) => {
  const { nome, dose, horario, dias } = req.body;

  if (!nome || !dose || !horario || !dias) {
    return res.status(400).json({ message: 'Todos os campos são obrigatórios.' });
  }

  try {
    // Verifica se o medicamento pertence a um dependente do usuário autenticado
    const propriedade = await pool.query(
      `SELECT m.id FROM medicamentos m
       INNER JOIN dependentes d ON d.dependente_id = m.dependente_id
       WHERE m.id = $1 AND d.responsavel_id = $2`,
      [req.params.id, req.user?.id]
    );

    if (propriedade.rows.length === 0) {
      return res.status(403).json({ message: 'Medicamento não encontrado ou sem permissão.' });
    }

    const result = await pool.query(
      `UPDATE medicamentos
       SET nome = $1, dose = $2, horario = $3, dias = $4
       WHERE id = $5
       RETURNING *`,
      [nome, dose, horario, JSON.stringify(dias), req.params.id]
    );

    const m = result.rows[0];
    res.status(200).json({ ...m, dias: JSON.parse(m.dias) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao editar medicamento.' });
  }
};

export const deleteMedicamento = async (req: AuthRequest, res: Response) => {
  try {
    // Verifica se o medicamento pertence a um dependente do usuário autenticado
    const propriedade = await pool.query(
      `SELECT m.id FROM medicamentos m
       INNER JOIN dependentes d ON d.dependente_id = m.dependente_id
       WHERE m.id = $1 AND d.responsavel_id = $2`,
      [req.params.id, req.user?.id]
    );

    if (propriedade.rows.length === 0) {
      return res.status(403).json({ message: 'Medicamento não encontrado ou sem permissão.' });
    }

    await pool.query('DELETE FROM medicamentos WHERE id = $1', [req.params.id]);
    res.status(200).json({ message: 'Medicamento removido.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao remover medicamento.' });
  }
};