require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');

const { initMySQL } = require('./database/mysql');
const { initSQLite } = require('./database/sqlite');
const { initRedis } = require('./database/redis');
const { initRabbitMQ } = require('./database/rabbitmq');

// Routes
const authRoutes = require('./routes/auth');
const companiesRoutes = require('./routes/companies');
const usersRoutes = require('./routes/users');
const ledgersRoutes = require('./routes/ledgers');
const vouchersRoutes = require('./routes/vouchers');
const gstRoutes = require('./routes/gst');
const hsnRoutes = require('./routes/hsn');
const stockRoutes = require('./routes/stock');
const payrollRoutes = require('./routes/payroll');
const hrRoutes = require('./routes/hr');
const bankingRoutes = require('./routes/banking');
const chequesRoutes = require('./routes/cheques');
const fixedAssetsRoutes = require('./routes/fixedAssets');
const assetMaintenanceRoutes = require('./routes/assetMaintenance');
const costCentresRoutes = require('./routes/costCentres');
const currenciesRoutes = require('./routes/currencies');
const reportsRoutes = require('./routes/reports');
const budgetsRoutes = require('./routes/budgets');
const customersRoutes = require('./routes/customers');
const vendorsRoutes = require('./routes/vendors');
const ordersRoutes = require('./routes/orders');
const crmRoutes = require('./routes/crm');
const posRoutes = require('./routes/pos');
const branchesRoutes = require('./routes/branches');
const serviceRoutes = require('./routes/service');
const subscriptionsRoutes = require('./routes/subscriptions');
const complianceRoutes = require('./routes/compliance');
const projectsRoutes = require('./routes/projects');
const analyticsRoutes = require('./routes/analytics');
const notificationsRoutes = require('./routes/notifications');
const ruleEngineRoutes = require('./routes/ruleEngine');
const eventLedgerRoutes = require('./routes/eventLedger');
const makerCheckerRoutes = require('./routes/makerChecker');
const collaborationRoutes = require('./routes/collaboration');
const ecommerceRoutes = require('./routes/ecommerce');
const whatsappRoutes = require('./routes/whatsapp');
const customizationRoutes = require('./routes/customization');
const tallyImportRoutes = require('./routes/tallyImport');
const aiToolsRoutes = require('./routes/aiTools');
const settingsRoutes = require('./routes/settings');
const dataManagementRoutes = require('./routes/dataManagement');
const auditLogRoutes = require('./routes/auditLog');
const syncRoutes = require('./routes/sync');

const app = express();
const PORT = process.env.PORT || 3001;

// Security & Performance Middleware
app.use(helmet({ crossOriginEmbedderPolicy: false }));
app.use(compression());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' }
});
app.use('/api', limiter);

// Health Check
app.get('/health', async (req, res) => {
  const { getRedisClient } = require('./database/redis');
  const { getMySQLPool } = require('./database/mysql');
  let redisOk = false, mysqlOk = false;
  try { const r = getRedisClient(); await r.ping(); redisOk = true; } catch {}
  try { const p = getMySQLPool(); await p.query('SELECT 1'); mysqlOk = true; } catch {}
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    services: { mysql: mysqlOk ? 'connected' : 'offline', redis: redisOk ? 'connected' : 'offline', sqlite: 'active' }
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/companies', companiesRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/ledgers', ledgersRoutes);
app.use('/api/vouchers', vouchersRoutes);
app.use('/api/gst', gstRoutes);
app.use('/api/hsn', hsnRoutes);
app.use('/api/stock', stockRoutes);
app.use('/api/payroll', payrollRoutes);
app.use('/api/hr', hrRoutes);
app.use('/api/banking', bankingRoutes);
app.use('/api/cheques', chequesRoutes);
app.use('/api/fixed-assets', fixedAssetsRoutes);
app.use('/api/asset-maintenance', assetMaintenanceRoutes);
app.use('/api/cost-centres', costCentresRoutes);
app.use('/api/currencies', currenciesRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/budgets', budgetsRoutes);
app.use('/api/customers', customersRoutes);
app.use('/api/vendors', vendorsRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/crm', crmRoutes);
app.use('/api/pos', posRoutes);
app.use('/api/branches', branchesRoutes);
app.use('/api/service', serviceRoutes);
app.use('/api/subscriptions', subscriptionsRoutes);
app.use('/api/compliance', complianceRoutes);
app.use('/api/projects', projectsRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/rule-engine', ruleEngineRoutes);
app.use('/api/event-ledger', eventLedgerRoutes);
app.use('/api/maker-checker', makerCheckerRoutes);
app.use('/api/collaboration', collaborationRoutes);
app.use('/api/ecommerce', ecommerceRoutes);
app.use('/api/whatsapp', whatsappRoutes);
app.use('/api/customization', customizationRoutes);
app.use('/api/tally-import', tallyImportRoutes);
app.use('/api/ai-tools', aiToolsRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/data-management', dataManagementRoutes);
app.use('/api/audit-log', auditLogRoutes);
app.use('/api/sync', syncRoutes);

// 404 handler
app.use('*', (req, res) => res.status(404).json({ error: 'Route not found' }));

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

// Startup
async function startServer() {
  try {
    await initMySQL();
    console.log('✅ MySQL connected');
  } catch (e) {
    console.warn('⚠️  MySQL unavailable, running offline mode:', e.message);
  }
  try {
    initSQLite();
    console.log('✅ SQLite initialized');
  } catch (e) {
    console.warn('⚠️  SQLite error:', e.message);
  }
  try {
    await initRedis();
    console.log('✅ Redis connected');
  } catch (e) {
    console.warn('⚠️  Redis unavailable, caching disabled:', e.message);
  }
  try {
    await initRabbitMQ();
    console.log('✅ RabbitMQ connected');
  } catch (e) {
    console.warn('⚠️  RabbitMQ unavailable, queue disabled:', e.message);
  }
  app.listen(PORT, () => {
    console.log(`\n🚀 HisabKitab Pro Backend running at http://localhost:${PORT}`);
    console.log(`📊 Health: http://localhost:${PORT}/health`);
    console.log(`🔑 Login: admin / admin123\n`);
  });
}

startServer();
module.exports = app;
