import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
dotenv.config();

const prisma = new PrismaClient();
const app = express();
app.use(cors());

/*  Generic fetch by type */
function listByType(type) {
  return prisma.transaction.findMany({
    where: { type },
    orderBy: { timestamp: "desc" },
    take: 1000,
  });
} 

/* Individual routes per category */
app.get("/api/transactions/incoming",  async (_, res) => res.json(await listByType("INCOMING")));
app.get("/api/transactions/p2p",       async (_, res) => res.json(await listByType("P2P_TRANSFER")));
app.get("/api/transactions/withdrawal",async (_, res) => res.json(await listByType("WITHDRAWAL")));
app.get("/api/transactions/bundle",    async (_, res) => res.json(await listByType("BUNDLE_PURCHASE")));
app.get("/api/transactions/airtime",   async (_, res) => res.json(await listByType("AIRTIME")));
app.get("/api/transactions/bank",      async (_, res) => res.json(await listByType("BANK_DEPOSIT")));

/* Generic endpoint with query params */
app.get("/api/transactions", async (req, res) => {
  const { type, limit = 1000 } = req.query;
  const where = type ? { type } : {};
  const data = await prisma.transaction.findMany({
    where,
    orderBy: { timestamp: "desc" },
    take: parseInt(limit),
  });
  res.json(data);
});

/* ✅ Server start */
const PORT = process.env.PORT || 3002;
app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));
