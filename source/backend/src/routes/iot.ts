import { Router } from 'express';
import { receberEvento, proximoMedicamento } from '../controllers/iotController';

const router = Router();

router.post('/evento', receberEvento);
router.get('/proximo-medicamento', proximoMedicamento);

export default router;