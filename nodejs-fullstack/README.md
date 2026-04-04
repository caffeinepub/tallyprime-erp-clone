# HisabKitab Pro — Node.js Fullstack

Complete self-hosted version of HisabKitab Pro using Node.js + Express + MySQL.
The live Caffeine/ICP app is 100% untouched.

## Folder Structure

```
nodejs-fullstack/
├── backend/     ← Express + MySQL (47 routes, 200+ endpoints)
└── frontend/    ← React app wired to Node.js API
```

## Quick Start

### 1. Setup Backend

```bash
cd nodejs-fullstack/backend
npm install
cp .env.example .env
# Edit .env: set DB_HOST, DB_USER, DB_PASSWORD, DB_NAME
npm run migrate
npm run seed
npm run dev    # → http://localhost:3001
```

### 2. Setup Frontend

```bash
cd nodejs-fullstack/frontend
npm install
npm run dev    # → http://localhost:5173
```

### 3. Login

- URL: http://localhost:5173
- Username: admin
- Password: admin123

## Requirements

- Node.js v18+
- MySQL 8.0+

## Features

All 200+ features: Accounting, GST, Inventory, Payroll, HR, Banking, Fixed Assets,
Analytics, CRM, POS, Multi-Branch, Compliance, AI Tools, WhatsApp, E-Commerce, and more.
