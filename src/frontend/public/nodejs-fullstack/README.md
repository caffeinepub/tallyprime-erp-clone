# HisabKitab Pro — Node.js Fullstack

Complete self-hosted ERP with **Node.js + Express + MySQL + SQLite + Redis + RabbitMQ + React**.

> Live Motoko/Caffeine app is **100% untouched**. This is for self-hosting only.

---

## Architecture

| Layer | Technology | Purpose |
|---|---|---|
| Backend | Node.js + Express | REST API server |
| Primary DB | MySQL | Online / production data |
| Offline DB | SQLite | Auto-fallback when MySQL offline |
| Cache | Redis | Read caching (TTL-based, optional) |
| Queue | RabbitMQ | Async WhatsApp, reports, sync |
| Frontend | React + Vite | Lazy-loaded SPA |

---

## Quick Start

### 1. Start Backend

```bash
cd backend
npm install
cp .env.example .env
# Edit .env — set MYSQL_PASSWORD and other credentials
npm run migrate    # Creates all 50+ MySQL tables
npm run seed       # Seeds admin user + ledger groups
npm run dev        # Server starts at http://localhost:3001
```

### 2. Start Queue Workers (optional)

```bash
cd backend
npm run worker     # Starts WhatsApp, Reports, Sync queue workers
```

### 3. Start Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev        # Opens at http://localhost:5173
```

**Login:** `admin` / `admin123`

---

## Services Setup

### MySQL
```bash
# Install MySQL 8.x, then:
mysql -u root -p -e "CREATE DATABASE hisabkitab_pro;"
# Update .env with your credentials
```

### Redis (optional but recommended)
```bash
# Docker:
docker run -d -p 6379:6379 redis:alpine
# Or install locally, leave REDIS_PASSWORD blank for local
```

### RabbitMQ (optional, for async queues)
```bash
# Docker:
docker run -d -p 5672:5672 -p 15672:15672 rabbitmq:3-management
# Management UI: http://localhost:15672 (guest/guest)
```

> **Note:** Redis and RabbitMQ are optional. The server starts and works without them — caching and queuing degrade gracefully.

---

## API Endpoints (200+)

| Module | Base Path |
|---|---|
| Auth + Users | /api/auth, /api/users |
| Companies | /api/companies |
| Ledgers + Groups | /api/ledgers |
| Vouchers/Entries | /api/vouchers |
| GST | /api/gst |
| HSN Codes | /api/hsn |
| Inventory | /api/stock |
| Payroll + HR | /api/payroll, /api/hr |
| Banking + Cheques | /api/banking, /api/cheques |
| Fixed Assets + Maintenance | /api/fixed-assets, /api/asset-maintenance |
| Cost Centres | /api/cost-centres |
| Currencies | /api/currencies |
| Reports | /api/reports |
| Budgets | /api/budgets |
| Customers + Vendors | /api/customers, /api/vendors |
| Orders (PO/SO) | /api/orders |
| CRM | /api/crm |
| POS | /api/pos |
| Branches | /api/branches |
| Service Management | /api/service |
| Subscriptions | /api/subscriptions |
| Compliance (e-Way, E-Invoice) | /api/compliance |
| Projects | /api/projects |
| Analytics | /api/analytics |
| Notifications | /api/notifications |
| Rule Engine | /api/rule-engine |
| Event Ledger (Time-Travel) | /api/event-ledger |
| Maker-Checker | /api/maker-checker |
| Collaboration | /api/collaboration |
| E-Commerce | /api/ecommerce |
| WhatsApp Queue | /api/whatsapp |
| Customization | /api/customization |
| Tally Import | /api/tally-import |
| AI Tools | /api/ai-tools |
| Settings | /api/settings |
| Data Management | /api/data-management |
| Audit Log | /api/audit-log |
| Offline Sync | /api/sync |

---

## Offline Mode

- When MySQL is unreachable, all reads/writes automatically fall back to **SQLite**
- SQLite stores an offline queue of vouchers/transactions
- When MySQL comes back online, call `POST /api/sync/sync-voucher` to push offline data to MySQL
- Check status: `GET /api/sync/status`

---

## Roles

| Role | Access |
|---|---|
| admin | Full access, all companies |
| accountant | Read + write transactions |
| auditor | Read-only |
| viewer | Read-only |

---

*This project is independently developed and not affiliated with Tally Solutions.*
