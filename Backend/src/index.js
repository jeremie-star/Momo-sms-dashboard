import express from 'express';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();
const prisma = new PrismaClient();
const app = express();

app.use(cors());

app.get('/api/transactions', async (req, res) => {
  const { type, limit = 50 } = req.query;
  const where = type ? { type } : {};

  const data = await prisma.transaction.findMany({
    where,
    orderBy: { timestamp: 'desc' },
    take: parseInt(limit),
  });

  res.json(data);
});

app.get('/api/summary/by-type', async (req, res) => {
  const summary = await prisma.$queryRaw`
    SELECT type, COUNT(*) AS count, SUM(amount)::int AS total
    FROM "Transaction"
    GROUP BY type
    ORDER BY total DESC
  `;
  res.json(summary);
});

app.listen(3000, () => {
  console.log('API listening on http://localhost:3000');
});
