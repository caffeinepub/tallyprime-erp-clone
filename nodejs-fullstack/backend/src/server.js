require('dotenv').config();
const express=require('express'),cors=require('cors'),helmet=require('helmet'),morgan=require('morgan'),compression=require('compression');
const passport = require('passport');
const app=express();
app.use(helmet({contentSecurityPolicy:false}));
app.use(cors({origin:'*',credentials:true}));
app.use(compression());
app.use(morgan('dev'));
app.use(express.json({limit:'50mb'}));
app.use(express.urlencoded({extended:true,limit:'50mb'}));
app.use(passport.initialize());

// === EXISTING ROUTES (preserved) ===
app.use('/api/auth',require('./routes/auth'));
app.use('/api/users',require('./routes/users'));
app.use('/api/companies',require('./routes/companies'));
app.use('/api/ledger-groups',require('./routes/ledgerGroups'));
app.use('/api/ledgers',require('./routes/ledgers'));
app.use('/api/vouchers',require('./routes/vouchers'));
app.use('/api/hsn-codes',require('./routes/hsnCodes'));
app.use('/api/gst',require('./routes/gst'));
app.use('/api/reports',require('./routes/reports'));
app.use('/api/analytics',require('./routes/analytics'));
app.use('/api/multi-company',require('./routes/multiCompany'));
app.use('/api/stock-groups',require('./routes/stockGroups'));
app.use('/api/stock-items',require('./routes/stockItems'));
app.use('/api/stock-vouchers',require('./routes/stockVouchers'));
app.use('/api/employees',require('./routes/employees'));
app.use('/api/payroll',require('./routes/payroll'));
app.use('/api/hr',require('./routes/hr'));
app.use('/api/banking',require('./routes/banking'));
app.use('/api/cheques',require('./routes/cheques'));
app.use('/api/fixed-assets',require('./routes/fixedAssets'));
app.use('/api/cost-centres',require('./routes/costCentres'));
app.use('/api/currencies',require('./routes/currencies'));
app.use('/api/customers',require('./routes/customers'));
app.use('/api/vendors',require('./routes/vendors'));
app.use('/api/budgets',require('./routes/budgets'));
app.use('/api/orders',require('./routes/orders'));
app.use('/api/projects',require('./routes/projects'));
app.use('/api/crm',require('./routes/crm'));
app.use('/api/pos',require('./routes/pos'));
app.use('/api/branches',require('./routes/branches'));
app.use('/api/service',require('./routes/service'));
app.use('/api/subscriptions',require('./routes/subscriptions'));
app.use('/api/compliance',require('./routes/compliance'));
app.use('/api/notifications',require('./routes/notifications'));
app.use('/api/rules',require('./routes/rules'));
app.use('/api/event-ledger',require('./routes/eventLedger'));
app.use('/api/maker-checker',require('./routes/makerChecker'));
app.use('/api/collaboration',require('./routes/collaboration'));
app.use('/api/audit-log',require('./routes/auditLog'));
app.use('/api/ecommerce',require('./routes/ecommerce'));
app.use('/api/whatsapp',require('./routes/whatsapp'));
app.use('/api/customization',require('./routes/customization'));
app.use('/api/tally-import',require('./routes/tallyImport'));
app.use('/api/settings',require('./routes/settings'));
app.use('/api/data',require('./routes/dataManagement'));
app.use('/api/ai',require('./routes/aiTools'));
app.use('/api/utilities',require('./routes/utilities'));

// === NEW ROUTES v4.1 ===
app.use('/api/super-admin', require('./routes/superAdmin'));
app.use('/api/subscription-plans', require('./routes/subscriptionPlans'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/razorpay', require('./routes/razorpay'));
app.use('/api/billing', require('./routes/billing'));
app.use('/api/auth-enhanced', require('./routes/authEnhanced'));
app.use('/api/media', require('./routes/media'));
app.use('/api/reminders', require('./routes/reminders'));
app.use('/api/sidebar-config', require('./routes/sidebarBuilder'));
app.use('/api/shortcuts', require('./routes/shortcuts'));
app.use('/api/dashboard-layout', require('./routes/dashboardCustom'));
app.use('/api/guidance', require('./routes/guidance'));
app.use('/api/messaging', require('./routes/messaging'));

app.get('/api/health',(req,res)=>res.json({
  status:'ok',
  version:'4.1.0',
  app:'HisabKitab Pro Node.js Backend',
  modules:60,
  routes: {
    existing: 46,
    v4_new: 14
  },
  new_in_v4:[
    'Super Admin Panel',
    'Subscription Plans (Free/Premium - 3/6/12 months/3 years)',
    'Payment Flow & Billing',
    'Razorpay Payment Gateway (create-order, verify, webhook, refund)',
    'OTP Login (Email + Phone)',
    'Google OAuth',
    'GitHub OAuth',
    'Cloudinary Media Storage',
    'Expiry Handling & Auto-Pause',
    'Reminder & Notification System (Email/SMS)',
    'Dynamic Sidebar Builder',
    'Shortcut Key Manager',
    'Dashboard Customization',
    'Guidance System (Blogs + Videos)',
    'Super Admin Messaging & Broadcast',
  ]
}));

app.use((err,req,res,next)=>res.status(err.status||500).json({error:err.message||'Internal Server Error'}));

const PORT=process.env.PORT||3001;
app.listen(PORT,()=>{
  console.log(`HisabKitab Pro Backend v4.1 running on port ${PORT}`);
  console.log(`Health: http://localhost:${PORT}/api/health`);
  console.log(`[DB] MySQL connected`);
  console.log(`[Razorpay] POST /api/razorpay/create-order`);
  console.log(`[Razorpay] POST /api/razorpay/verify-payment`);
  console.log(`[Razorpay] POST /api/razorpay/webhook`);
  console.log(`[Super Admin] POST /api/super-admin/login`);
  console.log(`[OAuth] GET /api/auth-enhanced/google`);
  console.log(`[OAuth] GET /api/auth-enhanced/github`);
  console.log(`[OTP] POST /api/auth-enhanced/send-email-otp`);
  console.log(`[Media] POST /api/media/upload (Cloudinary)`);
});
module.exports=app;
