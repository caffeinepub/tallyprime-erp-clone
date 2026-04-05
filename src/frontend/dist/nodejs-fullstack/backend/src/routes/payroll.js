const express = require('express');
const router = express.Router();
const { query } = require('../database/db');
const { auth } = require('../middleware/auth');
const { cacheGet, cacheSet } = require('../database/redis');

router.get('/employees', auth, async (req, res) => {
  try {
    const { company_id } = req.query;
    const cKey = `employees:${company_id}`;
    const c = await cacheGet(cKey);
    if (c) return res.json(c);
    const rows = await query('SELECT * FROM employees WHERE company_id=? ORDER BY name', [company_id]);
    await cacheSet(cKey, rows, 600);
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});
router.post('/employees', auth, async (req, res) => {
  try {
    const { company_id, employee_code, name, department, designation, date_of_joining, pan, aadhaar, bank_account, bank_name, ifsc_code, pf_applicable, esi_applicable } = req.body;
    const r = await query('INSERT INTO employees (company_id,employee_code,name,department,designation,date_of_joining,pan,aadhaar,bank_account,bank_name,ifsc_code,pf_applicable,esi_applicable) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)',
      [company_id, employee_code, name, department, designation, date_of_joining, pan, aadhaar, bank_account, bank_name, ifsc_code, pf_applicable ? 1 : 0, esi_applicable ? 1 : 0]);
    res.status(201).json({ id: r.insertId, name });
  } catch (e) { res.status(500).json({ error: e.message }); }
});
router.put('/employees/:id', auth, async (req, res) => {
  try {
    const { employee_code, name, department, designation, date_of_joining, pan, aadhaar, bank_account, bank_name, ifsc_code, pf_applicable, esi_applicable, is_active } = req.body;
    await query('UPDATE employees SET employee_code=?,name=?,department=?,designation=?,date_of_joining=?,pan=?,aadhaar=?,bank_account=?,bank_name=?,ifsc_code=?,pf_applicable=?,esi_applicable=?,is_active=? WHERE id=?',
      [employee_code, name, department, designation, date_of_joining, pan, aadhaar, bank_account, bank_name, ifsc_code, pf_applicable?1:0, esi_applicable?1:0, is_active?1:0, req.params.id]);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/salary-structures', auth, async (req, res) => {
  try {
    const { company_id } = req.query;
    res.json(await query('SELECT * FROM salary_structures WHERE company_id=?', [company_id]));
  } catch (e) { res.status(500).json({ error: e.message }); }
});
router.post('/salary-structures', auth, async (req, res) => {
  try {
    const { company_id, employee_id, basic, hra, da, conveyance, special_allowance, other_allowances, pf, esi, tds, professional_tax, other_deductions } = req.body;
    await query('INSERT INTO salary_structures (company_id,employee_id,basic,hra,da,conveyance,special_allowance,other_allowances,pf,esi,tds,professional_tax,other_deductions) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?) ON DUPLICATE KEY UPDATE basic=?,hra=?,da=?,conveyance=?,special_allowance=?,other_allowances=?,pf=?,esi=?,tds=?,professional_tax=?,other_deductions=?',
      [company_id,employee_id,basic,hra,da,conveyance,special_allowance,other_allowances,pf,esi,tds,professional_tax,other_deductions,
       basic,hra,da,conveyance,special_allowance,other_allowances,pf,esi,tds,professional_tax,other_deductions]);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/payroll-vouchers', auth, async (req, res) => {
  try {
    const { company_id } = req.query;
    res.json(await query('SELECT * FROM payroll_vouchers WHERE company_id=? ORDER BY year DESC, month DESC', [company_id]));
  } catch (e) { res.status(500).json({ error: e.message }); }
});
router.post('/payroll-vouchers', auth, async (req, res) => {
  try {
    const { company_id, month, year, entries } = req.body;
    const r = await query('INSERT INTO payroll_vouchers (company_id,month,year,entries) VALUES (?,?,?,?)',
      [company_id, month, year, JSON.stringify(entries)]);
    res.status(201).json({ id: r.insertId });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
