import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';
import { routes } from './routes';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
export const prisma = new PrismaClient({ adapter });

const app = express();



app.use(cors({
  origin: process.env.ALLOWED_ORIGIN
    ? process.env.ALLOWED_ORIGIN.split(',')
    : true,
  credentials: true,
}));
app.use(express.json());

app.use('/api', routes);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  const message = typeof err.message === 'string' ? err.message : JSON.stringify(err.message);
  res.status(err.status || 500).json({ error: message || 'Internal server error' });
});

export default app;
