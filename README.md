# 📱 MoMo SMS Data Dashboard

A fullstack application that parses, cleans, stores, and visualizes Mobile Money SMS transaction data from MTN Rwanda.

---

## ✨ Project Overview

This project takes raw SMS messages (in XML format) from MTN MoMo, extracts useful information using regular expressions, stores the results in a PostgreSQL database, and provides an interactive dashboard built with Next.js.

---

## 🎯 Features

- ✅ SMS parsing and classification using regex
- ✅ Extract `amount`, `type`, `txId`, `fee`, `balance`, `channel`, etc.
- ✅ Clean, structured PostgreSQL schema
- ✅ RESTful API using Express.js
- ✅ Frontend dashboard (Next.js) with filtering and charts

---

## 🧠 Technologies Used

| Layer        | Technology           |
|--------------|----------------------|
| Backend      | Node.js, Express.js, Prisma ORM |
| Database     | PostgreSQL (local)   |
| Frontend     | Next.js              |
| Parsing      | XML2JS + Regex       |

---

## 🗂️ Folder Structure

momo-sms-dashboard/
├── backend/
│ ├── prisma/ # Prisma DB schema & migrations
│ ├── src/
│ │ ├── etl/ # SMS XML processing script
│ │ └── index.js # Express API entry point
│ └── .env # Local environment config
├── frontend/
│ ├── pages/ # Next.js routes (index.js)
│ ├── components/ # Charts, tables, filters
│ └── utils/ # API helper (fetch calls)


## ⚙️ Getting Started

### Backend

1. **Install dependencies**

```bash
cd backend
npm install
Set up your local PostgreSQL database, then configure .env:

env
Copy
Edit
DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/momo_sms_db"
PORT=3002
Run migrations

bash
Copy
Edit
npx prisma migrate dev --name init
Run ETL script to load the XML

bash
Copy
Edit
node src/etl/processXml.js
Start the API

bash
Copy
Edit
node src/index.js
Your API will be available at http://localhost:3002/api/transactions.

🔌 API Endpoints
Endpoint	Purpose
GET /api/transactions	Fetch all transactions
GET /api/transactions?type=INCOMING	Filter by transaction type
GET /api/transactions/incoming	incoming transactions
GET /api/transactions/p2p	 P2P transfers
GET /api/transactions/withdrawal	 withdrawals
GET /api/transactions/bundle	Bundle purchases
GET /api/transactions/airtime	Airtime purchases
GET /api/transactions/bank	Bank deposits

All responses are returned in JSON.

🧩 Frontend Setup (Next.js)
Tech Stack
Next.js

Chart.js or Recharts for graphs

TailwindCSS or plain CSS

Axios or native fetch for API calls

Folder Suggestions
pgsql
Copy
Edit
frontend/
├── app/
│   ├── globals.css                   
│   ├── layout.tsx                   
│   ├── page.tsx                   
├── components/
│   ├── TransactionTable.tsx        # Table with filter, pagination
│   ├── ChartByType.tsx             # Bar chart
│   ├── ChartByMonth.tsx            # Line chart
├── utils/
│   └── api.ts                     # fetchDataByType(), fetchAll()
Example API Call in Frontend
js
Copy
Edit
// utils/api.js
export async function fetchTransactions(type) {
  const url = type
    : `http://localhost:3002/api/transactions`;

  const res = await fetch(url);
  return res.json();
}

📊 Sample Data Schema
Field	Description
id	Unique auto-increment ID
txId	Transaction ID (if present)
type	INCOMING, P2P_TRANSFER, etc.
amount	RWF amount
fee	Fee for transaction (optional)
balance	Balance after transaction (optional)
counterparty	Sender or recipient name
msisdn	Phone number (if present)
channel	USSD, AGENT, BANK
timestamp	Date and time of transaction
rawBody	Full original SMS text

📝 How It Works (ETL Summary)
Parses an XML file of 1600+ SMS messages

Categorizes SMS using regex patterns (7+ types supported)

Extracts structured data fields like amount, date, txId, etc.

Saves to PostgreSQL via Prisma

Skips duplicate txId entries automatically

Provides clean API for frontend to consume