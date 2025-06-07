import { readFile } from "fs/promises";
import { parseStringPromise } from "xml2js";
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
dotenv.config();

const prisma = new PrismaClient();


// 1. CATEGORY REGEX DEFINITIONS 

const CATEGORIES = [
//  Incoming with Financial Transaction Id 
  {
    type: "INCOMING",
    regex:
      /received (?<amount>[0-9,]+) RWF from (?<name>.*?) \(.*?\).*? at (?<date>[\d\- :]+).*?Financial Transaction Id: (?<txId>\d+)/i,
    extract: ({ groups }) => ({
      amount: groups.amount,
      counterparty: groups.name.trim(),
      timestamp: groups.date,
      txId: groups.txId,
      channel: "USSD",
    }),
  },

//   Classic “payment to code holder” (Date|at) 
  {
    type: "P2P_TRANSFER",
    regex:
      /payment of (?<amount>[0-9,]+) RWF to (?<name>[A-Za-z ]+?)\s+\d+\s+has been completed\s+(?:Date:|at)\s+(?<date>[\d\- :]+)\.\s*(?:Your new balance:\s*(?<balance>[0-9,]+) RWF\.)?\s*(?:Fee (?:was|:) (?<fee>[0-9,]+) RWF\.)?/i,
    extract: ({ groups }) => ({
      amount: groups.amount,
      counterparty: groups.name.trim(),
      timestamp: groups.date,
      balance: groups.balance
        ? parseInt(groups.balance.replace(/,/g, ""))
        : null,
      fee: groups.fee ? parseInt(groups.fee) : 0,
      channel: "USSD",
    }),
  },

//   style transfer 
  {
    type: "P2P_TRANSFER",
    regex:
      /(?<amount>[0-9,]+) RWF transferred to (?<name>.*?) \((?<msisdn>\d+)\) from (?<senderId>\d+).*? at (?<date>[\d\- :]+).*?Fee (?:was|:) (?<fee>[0-9,]+) RWF/i,
    extract: ({ groups }) => ({
      amount: groups.amount,
      counterparty: groups.name.trim(),
      msisdn: groups.msisdn,
      timestamp: groups.date,
      fee: parseInt(groups.fee),
      channel: "USSD",
    }),
  },

// Bank deposit 
  {
    type: "BANK_DEPOSIT",
    regex:
      /bank deposit of (?<amount>[0-9,]+) RWF.*? at (?<date>[\d\- :]+).*?NEW BALANCE ?:?(?<balance>[0-9,]+)/i,
    extract: ({ groups }) => ({
      amount: groups.amount,
      timestamp: groups.date,
      balance: parseInt(groups.balance.replace(/,/g, "")),
      counterparty: "BANK",
      channel: "BANK",
    }),
  },

// Withdrawal via agent 
  {
    type: "WITHDRAWAL",
    regex:
      /withdrawn (?<amount>[0-9,]+) RWF .* via agent: (?<agent>.*?) \((?<msisdn>\d+)\).*on (?<date>[\d\- :]+)/i,
    extract: ({ groups }) => ({
      amount: groups.amount,
      counterparty: groups.agent,
      msisdn: groups.msisdn,
      timestamp: groups.date,
      channel: "AGENT",
    }),
  },

//  Bundle purchase 
  {
    type: "BUNDLE_PURCHASE",
    regex:
      /purchased an (internet|voice) bundle .* for (?<amount>[0-9,]+) RWF/i,
    extract: ({ groups }) => ({
      amount: groups.amount,
      counterparty: "MTN Bundle",
      timestamp: new Date().toISOString(),
      channel: "USSD",
    }),
  },

// Airtime 
  {
    type: "AIRTIME",
    regex: /payment of (?<amount>[0-9,]+) RWF to Airtime/i,
    extract: ({ groups }) => ({
      amount: groups.amount,
      counterparty: "MTN Airtime",
      timestamp: new Date().toISOString(),
      channel: "USSD",
    }),
  },
];

//  ENRICHMENT HELPER  

function enrich(data, body) {
  // tx-ID (fallback)
  const idMatch = body.match(/(?:TxId|Transaction ID)[: ]\s*(\d{4,})/i);
  if (idMatch) data.txId = idMatch[1];

  // fee
  const feeMatch = body.match(/Fee[: ]\s*(\d{1,6}) RWF/i);
  if (feeMatch) data.fee = parseInt(feeMatch[1]);

  // balance
  const balMatch = body.match(/balance[: ]\s*([\d,]+) RWF/i);
  if (balMatch) data.balance = parseInt(balMatch[1].replace(/,/g, ""));

  // amount → int
  data.amount = parseInt(data.amount.replace(/,/g, ""));

  // timestamp → Date
  data.timestamp = new Date(data.timestamp);

  // default channel
  if (!data.channel) {
    if (/via agent/i.test(body)) data.channel = "AGENT";
    else if (/Bank/i.test(body)) data.channel = "BANK";
    else if (/^\*\d{3}/.test(body)) data.channel = "USSD";
    else data.channel = "UNKNOWN";
  }
  return data;
}

// 3. MAIN ETL RUN          

async function run() {
  const xml = await readFile("./src/etl/modified_sms_v2.xml", "utf8");
  const parsed = await parseStringPromise(xml, { explicitArray: false });
  const messages = parsed.sms_data?.sms || parsed.smses?.sms;
  if (!messages) return console.error("SMS array not found in XML.");

  for (const sms of messages) {
    const body = sms.body ?? sms.$?.body;
    if (!body) continue;

    let matched = false;

    for (const cat of CATEGORIES) {
      const m = body.match(cat.regex);
      if (!m?.groups) continue;

      const base = cat.extract(m);
      const txData = enrich(
        { txId: null, fee: 0, balance: null, type: cat.type, ...base },
        body
      );

    //  insert, skip duplicates 
      try {
        await prisma.transaction.create({
          data: { ...txData, rawBody: body },
        });
      } catch (err) {
        if (err.code === "P2002") {
          console.warn(`Skipped duplicate txId ${txData.txId}`);
        } else {
          throw err; // unexpected DB error
        }
      }

      matched = true;
      break;
    }

    if (!matched) console.log("Unmatched:", body);
  }

  console.log("Finished ETL process and Sucessfully inserted transactions/ Extraction");
  await prisma.$disconnect();
}

run().catch((e) => {
  console.error(e);
  prisma.$disconnect();
});
