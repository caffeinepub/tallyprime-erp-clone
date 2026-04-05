# HisabKitab Pro — Node.js Fullstack Enhancement

## Current State
Node.js fullstack at `/nodejs-fullstack/` has:
- 46 route modules, 200+ API endpoints, 50+ MySQL tables
- Basic auth (username/password, JWT, RBAC: admin/accountant/auditor/viewer)
- All ERP features mirrored from Motoko backend
- Live Motoko/Caffeine app is completely separate and untouched

## Requested Changes (Diff)

### Add
- Super Admin system (separate login, global company view, approve/reject/suspend admins)
- Subscription plans (Free/Premium, 3/6/12 months/3 years durations)
- Payment flow (register → payment → activate → dashboard)
- Billing system (receipts, invoices, renewal)
- Expiry handling (auto-pause, restrict ops, renew restore)
- Reminder/notification system (email/WhatsApp/SMS, manual broadcast)
- Enhanced auth: email OTP, phone OTP, forgot password via OTP, Google OAuth, GitHub OAuth
- Cloudinary media management (upload images/videos, manage, super admin sets credentials)
- Dynamic sidebar builder (groups, subgroups, menu items, show/hide)
- Shortcut key system (admin defines, assigns actions, saves)
- Dashboard customization (drag-drop cards, save/load layout)
- Guidance system (blogs, tutorial videos, super admin uploads)
- Registration flow (register → company details → profile → payment)
- Messaging system (super admin sends individual/broadcast via email/WhatsApp)
- Role management enhancements (Super Admin role added, multi-level permissions)
- Free plan restrictions (only company CRUD allowed, locked UI flags)
- Premium features control (super admin enable/disable globally)

### Modify
- `package.json`: add cloudinary, passport, passport-google-oauth20, passport-github2, nodemailer, twilio, multer, node-cron, socket.io dependencies
- `migrate.js`: add 13+ new tables
- `server.js`: register 10+ new route modules
- `.env.example`: add Cloudinary, Google OAuth, GitHub OAuth, Nodemailer, Twilio keys
- `auth.js` routes: add OTP login, social login callbacks, forgot password

### Remove
- Nothing — all existing routes/tables preserved

## Implementation Plan
1. Update package.json with all new npm dependencies
2. Update .env.example with all new environment variable keys
3. Add 13 new tables to migrate.js (super_admins, subscription_plans, admin_subscriptions, payment_history, otp_codes, social_auth, media_files, sidebar_configs, shortcut_configs, dashboard_layouts, guidance_content, messages, notification_logs)
4. Create route files: superAdmin.js, subscriptionPlans.js, payments.js, billing.js, authEnhanced.js, media.js, sidebarBuilder.js, shortcuts.js, dashboardCustom.js, guidance.js, messaging.js
5. Update server.js to register all new routes
6. All changes are in nodejs-fullstack/ only — live app untouched
