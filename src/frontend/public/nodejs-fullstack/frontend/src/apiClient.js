import axios from 'axios';

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const api = axios.create({ baseURL: `${BASE}/api` });

api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('hk_token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

api.interceptors.response.use(
  r => r.data,
  err => { if (err.response?.status === 401) { localStorage.removeItem('hk_token'); window.location.href = '/login'; } return Promise.reject(err); }
);

export const auth = {
  login: (d) => api.post('/auth/login', d),
  me: () => api.get('/auth/me'),
  updateProfile: (d) => api.put('/auth/profile', d),
  changePassword: (d) => api.put('/auth/change-password', d),
};
export const companies = {
  list: () => api.get('/companies'),
  create: (d) => api.post('/companies', d),
  update: (id, d) => api.put(`/companies/${id}`, d),
  delete: (id) => api.delete(`/companies/${id}`),
};
export const ledgers = {
  groups: () => api.get('/ledgers/groups'),
  createGroup: (d) => api.post('/ledgers/groups', d),
  list: (company_id) => api.get('/ledgers', { params: { company_id } }),
  create: (d) => api.post('/ledgers', d),
  update: (id, d) => api.put(`/ledgers/${id}`, d),
  delete: (id, company_id) => api.delete(`/ledgers/${id}`, { params: { company_id } }),
  trialBalance: (company_id) => api.get('/ledgers/trial-balance', { params: { company_id } }),
};
export const vouchers = {
  list: (params) => api.get('/vouchers', { params }),
  dayBook: (params) => api.get('/vouchers/day-book', { params }),
  create: (d) => api.post('/vouchers', d),
  delete: (id, company_id) => api.delete(`/vouchers/${id}`, { params: { company_id } }),
};
export const gst = {
  getSettings: (company_id) => api.get('/gst/settings', { params: { company_id } }),
  saveSettings: (d) => api.post('/gst/settings', d),
  vouchers: (company_id) => api.get('/gst/vouchers', { params: { company_id } }),
  createVoucher: (d) => api.post('/gst/vouchers', d),
  gstr1: (params) => api.get('/gst/gstr1', { params }),
  gstr3b: (params) => api.get('/gst/gstr3b', { params }),
};
export const stock = {
  groups: () => api.get('/stock/groups'),
  createGroup: (d) => api.post('/stock/groups', d),
  items: (company_id) => api.get('/stock/items', { params: { company_id } }),
  createItem: (d) => api.post('/stock/items', d),
  updateItem: (id, d) => api.put(`/stock/items/${id}`, d),
  summary: (company_id) => api.get('/stock/summary', { params: { company_id } }),
  vouchers: (company_id) => api.get('/stock/vouchers', { params: { company_id } }),
  createVoucher: (d) => api.post('/stock/vouchers', d),
};
export const payroll = {
  employees: (company_id) => api.get('/payroll/employees', { params: { company_id } }),
  createEmployee: (d) => api.post('/payroll/employees', d),
  updateEmployee: (id, d) => api.put(`/payroll/employees/${id}`, d),
  salaryStructures: (company_id) => api.get('/payroll/salary-structures', { params: { company_id } }),
  saveSalaryStructure: (d) => api.post('/payroll/salary-structures', d),
  payrollVouchers: (company_id) => api.get('/payroll/payroll-vouchers', { params: { company_id } }),
  createPayrollVoucher: (d) => api.post('/payroll/payroll-vouchers', d),
};
export const hr = {
  attendance: (params) => api.get('/hr/attendance', { params }),
  markAttendance: (d) => api.post('/hr/attendance', d),
  leaveTypes: (company_id) => api.get('/hr/leave-types', { params: { company_id } }),
  leaves: (company_id) => api.get('/hr/leaves', { params: { company_id } }),
  applyLeave: (d) => api.post('/hr/leaves', d),
  updateLeaveStatus: (id, status) => api.put(`/hr/leaves/${id}/status`, { status }),
};
export const banking = {
  accounts: (company_id) => api.get('/banking/accounts', { params: { company_id } }),
  createAccount: (d) => api.post('/banking/accounts', d),
  transactions: (params) => api.get('/banking/transactions', { params }),
  createTransaction: (d) => api.post('/banking/transactions', d),
  reconcile: (id, d) => api.put(`/banking/transactions/${id}/reconcile`, d),
  unreconciled: (params) => api.get('/banking/unreconciled', { params }),
  balance: (params) => api.get('/banking/balance', { params }),
};
export const reports = {
  balanceSheet: (company_id) => api.get('/reports/balance-sheet', { params: { company_id } }),
  profitLoss: (params) => api.get('/reports/profit-loss', { params }),
  cashFlow: (params) => api.get('/reports/cash-flow', { params }),
  ledgerAccount: (params) => api.get('/reports/ledger-account', { params }),
  ratioAnalysis: (company_id) => api.get('/reports/ratio-analysis', { params: { company_id } }),
};
export const analytics = {
  kpi: (company_id) => api.get('/analytics/kpi', { params: { company_id } }),
  cashFlowForecast: (company_id) => api.get('/analytics/cash-flow-forecast', { params: { company_id } }),
  expenseBreakdown: (params) => api.get('/analytics/expense-breakdown', { params }),
  plTrend: (company_id) => api.get('/analytics/pl-trend', { params: { company_id } }),
};
export const notifications = {
  list: (company_id) => api.get('/notifications', { params: { company_id } }),
  create: (d) => api.post('/notifications', d),
  markRead: (id) => api.put(`/notifications/${id}/read`),
  smartAlerts: (company_id) => api.get('/notifications/smart-alerts', { params: { company_id } }),
};
export const whatsapp = {
  queue: (company_id) => api.get('/whatsapp/queue', { params: { company_id } }),
  send: (d) => api.post('/whatsapp/send', d),
  bulkSend: (d) => api.post('/whatsapp/bulk-send', d),
  retry: (id) => api.put(`/whatsapp/${id}/retry`),
};
export const syncApi = {
  offlineQueue: () => api.get('/sync/offline-queue'),
  syncVoucher: (d) => api.post('/sync/sync-voucher', d),
  status: () => api.get('/sync/status'),
};
export default api;
