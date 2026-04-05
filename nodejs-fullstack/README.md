# HisabKitab Pro - Node.js Fullstack v4.0

> Complete self-hostable Node.js + MySQL backend with cloned React frontend.
> **Live Motoko/Caffeine app is 100% untouched.** This is for self-hosting/testing only.

---

## What's New in v4.0

| Feature | Details |
|---|---|
| **Super Admin System** | Separate login, global company visibility, approve/reject/suspend admins |
| **Subscription Plans** | Free & Premium plans with 3/6/12 month and 3-year durations |
| **Payment Flow** | Register → Payment → Activate → Dashboard |
| **Billing System** | Full billing page, receipts, invoice generation, renewal |
| **Email OTP Login** | Send OTP to email, verify to login |
| **Phone OTP Login** | Send OTP via Twilio SMS, verify to login |
| **Forgot Password** | Reset via OTP (email or phone) |
| **Google OAuth** | Sign in with Google account |
| **GitHub OAuth** | Sign in with GitHub account |
| **Cloudinary Media** | Upload images/videos, manage media, Super Admin sets credentials |
| **Expiry Handling** | Auto-pause companies, disable CRUD, show renew button |
| **Reminders** | Auto email/SMS 2-3 days before expiry, manual reminders |
| **Dynamic Sidebar** | Build custom sidebar groups, subgroups, menu items per user |
| **Shortcut Keys** | Admin defines and saves custom keyboard shortcuts |
| **Dashboard Customization** | Drag-drop widgets, save/load layout per user |
| **Guidance System** | Super Admin uploads blogs and tutorial videos |
| **Messaging System** | Super Admin sends messages to individual or all admins |
| **Role System** | Super Admin, Admin, Auditor, Accountant, Viewer |
| **Free Plan Restrictions** | Only company CRUD allowed on free plan |

---

## Project Structure

```
nodejs-fullstack/
├── backend/                  ← Node.js + Express + MySQL
│   ├── src/
│   │   ├── server.js         ← Express app (54 route modules)
│   │   ├── database/
│   │   │   ├── db.js         ← MySQL connection pool
│   │   │   ├── migrate.js    ← Creates 70+ MySQL tables
│   │   │   └── seed.js       ← Seeds default data
│   │   ├── middleware/
│   │   │   └── auth.js       ← JWT auth + role guards
│   │   └── routes/           ← 54 route modules
│   ├── .env.example          ← Copy to .env and fill credentials
│   └── package.json
└── frontend/                 ← Cloned React app (Node.js API wired)
    ├── src/
    │   ├── apiClient.ts      ← REST API client (all endpoints)
    │   └── ...               ← All React components
    ├── .env.example
    └── package.json
```

---

## Quick Start

### Prerequisites
- Node.js 18+
- MySQL 8+
- (Optional) Redis, RabbitMQ for caching/queues

### Step 1: Backend Setup

```bash
cd nodejs-fullstack/backend
npm install
cp .env.example .env
```

Edit `.env` and set at minimum:
```env
DB_PASSWORD=your_mysql_password
JWT_SECRET=your_jwt_secret_here
SUPER_ADMIN_JWT_SECRET=super_admin_secret_here
```

```bash
npm run migrate    # Creates all 70+ tables
npm run seed       # Seeds default admin + super admin + plans
npm run dev        # Starts server at http://localhost:3001
```

### Step 2: Frontend Setup

```bash
cd nodejs-fullstack/frontend
npm install
cp .env.example .env
npm run dev        # Starts at http://localhost:5173
```

---

## Default Login Credentials

| Role | Username | Password |
|---|---|---|
| Admin | `admin` | `admin123` |
| Super Admin | `superadmin` | `superadmin123` |

---

## New API Endpoints (v4.0)

### Super Admin
| Method | Endpoint | Description |
|---|---|---|
| POST | /api/super-admin/login | Super Admin login |
| GET | /api/super-admin/dashboard | Dashboard stats |
| GET | /api/super-admin/admins | View all admins |
| GET | /api/super-admin/companies | View all companies |
| POST | /api/super-admin/admins/:id/approve | Approve admin |
| POST | /api/super-admin/admins/:id/reject | Reject admin |
| POST | /api/super-admin/admins/:id/suspend | Suspend admin |
| POST | /api/super-admin/admins/:id/unsuspend | Unsuspend admin |
| GET | /api/super-admin/activity | All admin activity |
| GET | /api/super-admin/pending-payments | Unpaid registrations |
| POST | /api/super-admin/feature-toggle | Enable/disable features |
| POST | /api/super-admin/cloudinary-config | Set Cloudinary credentials |

### Subscription Plans
| Method | Endpoint | Description |
|---|---|---|
| GET | /api/subscription-plans | List all plans |
| POST | /api/subscription-plans | Create plan (Super Admin) |
| GET | /api/subscription-plans/my-subscription | My current subscription |
| POST | /api/subscription-plans/assign | Assign plan to admin |
| GET | /api/subscription-plans/check-access/:feature | Check feature access |

### Payments
| Method | Endpoint | Description |
|---|---|---|
| POST | /api/payments/initiate | Start payment |
| POST | /api/payments/confirm | Confirm success |
| POST | /api/payments/fail | Record failure |
| GET | /api/payments/history | My payment history |
| GET | /api/payments/receipt/:id | Get receipt |
| GET | /api/payments/all | All payments (Super Admin) |
| POST | /api/payments/renew | Renew subscription |

### Billing
| Method | Endpoint | Description |
|---|---|---|
| GET | /api/billing/profile | Full billing profile |
| GET | /api/billing/invoice/:id | Generate invoice |
| GET | /api/billing/status | Check subscription status |

### Enhanced Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | /api/auth-enhanced/register | Full registration flow |
| POST | /api/auth-enhanced/send-email-otp | Send email OTP |
| POST | /api/auth-enhanced/send-phone-otp | Send phone OTP (Twilio) |
| POST | /api/auth-enhanced/verify-otp | Verify OTP → get token |
| POST | /api/auth-enhanced/forgot-password | Send reset OTP |
| POST | /api/auth-enhanced/reset-password | Reset with OTP |
| GET | /api/auth-enhanced/google | Google OAuth redirect |
| GET | /api/auth-enhanced/google/callback | Google OAuth callback |
| GET | /api/auth-enhanced/github | GitHub OAuth redirect |
| GET | /api/auth-enhanced/github/callback | GitHub OAuth callback |

### Media (Cloudinary)
| Method | Endpoint | Description |
|---|---|---|
| POST | /api/media/upload | Upload image/video |
| GET | /api/media | List my media |
| DELETE | /api/media/:id | Delete media |
| GET | /api/media/all | All media (Super Admin) |

### Reminders
| Method | Endpoint | Description |
|---|---|---|
| POST | /api/reminders/send-manual | Super Admin manual reminder |
| POST | /api/reminders/broadcast | Broadcast to all admins |
| GET | /api/reminders/logs | Notification logs |
| GET | /api/reminders/my-notifications | My notifications |

### Dynamic Sidebar
| Method | Endpoint | Description |
|---|---|---|
| GET | /api/sidebar-config | Get my sidebar config |
| POST | /api/sidebar-config | Save entire config |
| POST | /api/sidebar-config/group | Create group |
| PATCH | /api/sidebar-config/:item_id/visibility | Toggle visibility |
| PUT | /api/sidebar-config/reorder | Reorder items |
| DELETE | /api/sidebar-config/:item_id | Remove item |

### Shortcuts
| Method | Endpoint | Description |
|---|---|---|
| GET | /api/shortcuts | Get my shortcuts |
| POST | /api/shortcuts | Save shortcuts |
| PUT | /api/shortcuts/:id | Update shortcut |
| DELETE | /api/shortcuts/:id | Delete shortcut |

### Dashboard Layout
| Method | Endpoint | Description |
|---|---|---|
| GET | /api/dashboard-layout | Get saved layout |
| POST | /api/dashboard-layout | Save layout |
| PATCH | /api/dashboard-layout/toggle/:widget_id | Toggle widget |
| DELETE | /api/dashboard-layout/reset | Reset to default |

### Guidance
| Method | Endpoint | Description |
|---|---|---|
| GET | /api/guidance | List content |
| GET | /api/guidance/:id | Get single item |
| POST | /api/guidance | Create (Super Admin) |
| PUT | /api/guidance/:id | Update (Super Admin) |
| DELETE | /api/guidance/:id | Delete (Super Admin) |

### Messaging
| Method | Endpoint | Description |
|---|---|---|
| POST | /api/messaging/send | Send message (Super Admin) |
| GET | /api/messaging/inbox | My inbox |
| GET | /api/messaging/sent | Sent messages (Super Admin) |
| PATCH | /api/messaging/:id/read | Mark as read |

---

## Environment Variables

See `.env.example` for all variables. Key additions in v4.0:

- `SUPER_ADMIN_JWT_SECRET` — Secret for Super Admin tokens
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` — Cloudinary credentials
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` — Google OAuth
- `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET` — GitHub OAuth
- `EMAIL_HOST`, `EMAIL_USER`, `EMAIL_PASS` — Nodemailer (for OTP emails)
- `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER` — Twilio (for SMS OTP)
- `FRONTEND_URL` — Frontend URL for OAuth redirect

---

## Setting Up OAuth

### Google OAuth
1. Go to https://console.cloud.google.com/
2. Create a project → Enable **Google+ API**
3. Create OAuth 2.0 Credentials
4. Set callback URL: `http://localhost:3001/api/auth-enhanced/google/callback`
5. Copy Client ID and Secret to `.env`

### GitHub OAuth
1. Go to https://github.com/settings/developers
2. Create a **New OAuth App**
3. Set callback URL: `http://localhost:3001/api/auth-enhanced/github/callback`
4. Copy Client ID and Secret to `.env`

### Cloudinary
1. Sign up at https://cloudinary.com (free tier available)
2. Copy Cloud Name, API Key, API Secret from Dashboard
3. Add to `.env` or set via Super Admin Panel → System → Cloudinary Config

### Email OTP (Gmail)
1. Enable 2-factor on Gmail
2. Generate an **App Password** (https://myaccount.google.com/apppasswords)
3. Set `EMAIL_USER=your@gmail.com` and `EMAIL_PASS=your_app_password`

### Phone OTP (Twilio)
1. Sign up at https://www.twilio.com (free trial available)
2. Get Account SID, Auth Token, and a Twilio phone number
3. Add to `.env`

---

## Free Plan Restrictions

When an admin is on the Free plan, only these features are accessible:
- Create Company
- Edit Company  
- Delete Company
- Profile Page
- Billing Page

All other features return `{ allowed: false, reason: 'upgrade_required' }` from `/api/subscription-plans/check-access/:feature`.

---

## Auto-Expiry Behavior

A cron job runs daily at 9 AM:
- Checks subscriptions expiring in 1-3 days → sends email + SMS reminder
- Marks expired subscriptions as `expired`
- Pauses companies owned by expired admins

After renewal:
- Subscription is extended from current expiry date
- Companies are reactivated
- No data is lost

---

## All Original Features

All 200+ features from v3.0 are preserved:
- Accounting, GST, Inventory, Payroll, HR, Banking, Fixed Assets
- Reports, Analytics, CRM, POS, Multi-Branch, Service Management
- Compliance, Projects, Budgets, Event Ledger, Maker-Checker
- Collaboration, E-Commerce, WhatsApp, Customization, Tally Import
- AI Tools, Rule Engine, Document Intelligence, Audit Log

See the original README sections for those APIs.
