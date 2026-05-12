import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { createDatabaseIfNotExists, initDb } from './database';

import authRoutes from './routes/auth';
import dependentesRoutes from './routes/dependentes';
import medicamentosRoutes from './routes/medicamentos';
import iotRoutes from './routes/iot';

const app = express();
app.use(cors());
app.use(express.json());

// Rotas
app.use('/api', authRoutes);
app.use('/api', dependentesRoutes);
app.use('/api', medicamentosRoutes);
app.use('/iot', iotRoutes);

//Inicialização
const PORT = Number(process.env.PORT) || 3000;

const startServer = async () => {
  try {
    await createDatabaseIfNotExists();
    await initDb();

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Servidor rodando na porta ${PORT}`);
    });
  } catch (error) {
    console.error('Falha ao iniciar a API:', error);
  }
};

startServer();