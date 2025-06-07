import { readFile } from 'fs/promises';
import { parseStringPromise } from 'xml2js';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();
const prisma = new PrismaClient();

async function run() {
    const xml = await readFile('./src/etl/modified_sms_v2.xml', 'utf8');
    const parsed = await parseStringPromise(xml, { explicitArray: false });
  
    if (!parsed?.smses?.sms) {
      console.error('SMS array not found in XML structure.');
      return;
    }
  
    const messages = parsed.smses.sms;
  
    for (const msg of messages) {
      const body = msg.$.body;
  
      const incomingRegex = /received (?<amount>[0-9,]+) RWF from (?<name>.*?)\..*Date: (?<date>.+?)\./i;
      const match = body.match(incomingRegex);
  
      if (match?.groups) {
        const { amount, name, date } = match.groups;
  
        const tx = {
          txId: null,
          type: 'INCOMING',
          amount: parseInt(amount.replace(/,/g, '')),
          fee: 0,
          counterparty: name,
          timestamp: new Date(date),
          rawBody: body
        };
  
        await prisma.transaction.create({ data: tx });
      } else {
        console.log('Ignored message:', body);
      }
    }
  
    console.log('Done processing SMS.');
    await prisma.$disconnect();
  }  

run().catch(e => {
  console.error(e);
  prisma.$disconnect();
});
