import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import {
  createMedicamento,
  listMedicamentos,
  updateMedicamento,
  deleteMedicamento,
} from '../controllers/medicamentosController';

const router = Router();

router.post('/medicamentos', authMiddleware, createMedicamento);
router.get('/medicamentos/:dependenteId', authMiddleware, listMedicamentos);
router.put('/medicamentos/:id', authMiddleware, updateMedicamento);
router.delete('/medicamentos/:id', authMiddleware, deleteMedicamento);

export default router;