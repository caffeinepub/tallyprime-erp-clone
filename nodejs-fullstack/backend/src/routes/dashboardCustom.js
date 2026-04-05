// Dashboard Customization - HisabKitab Pro v4.0
const router = require('express').Router();
const { db } = require('../database/db');
const { auth } = require('../middleware/auth');

// GET /api/dashboard-layout - Get saved layout
router.get('/', auth, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM dashboard_layouts WHERE user_id=? ORDER BY created_at DESC LIMIT 1', [req.user.id]);
    if (!rows.length) {
      // Default layout
      return res.json({
        layout: [
          { id: 'balance', title: 'Balance Sheet', widget_type: 'kpi', x: 0, y: 0, w: 3, h: 2, is_visible: true },
          { id: 'pl', title: 'P&L Summary', widget_type: 'chart', x: 3, y: 0, w: 3, h: 2, is_visible: true },
          { id: 'cash_flow', title: 'Cash Flow', widget_type: 'chart', x: 6, y: 0, w: 3, h: 2, is_visible: true },
          { id: 'alerts', title: 'Smart Alerts', widget_type: 'list', x: 0, y: 2, w: 4, h: 2, is_visible: true },
          { id: 'top_customers', title: 'Top Customers', widget_type: 'list', x: 4, y: 2, w: 4, h: 2, is_visible: true },
        ],
        is_default: true
      });
    }
    res.json({ layout: JSON.parse(rows[0].layout_json), is_default: false });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST /api/dashboard-layout - Save layout
router.post('/', auth, async (req, res) => {
  try {
    const { layout } = req.body;
    await db.query(
      'INSERT INTO dashboard_layouts(user_id,layout_json) VALUES(?,?) ON DUPLICATE KEY UPDATE layout_json=VALUES(layout_json),updated_at=NOW()',
      [req.user.id, JSON.stringify(layout)]
    );
    res.json({ message: 'Dashboard layout saved' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// PATCH /api/dashboard-layout/toggle/:widget_id
router.patch('/toggle/:widget_id', auth, async (req, res) => {
  try {
    const { is_visible } = req.body;
    const [rows] = await db.query('SELECT layout_json FROM dashboard_layouts WHERE user_id=?', [req.user.id]);
    if (!rows.length) return res.status(404).json({ error: 'No layout found' });
    const layout = JSON.parse(rows[0].layout_json);
    const item = layout.find(w => w.id === req.params.widget_id);
    if (item) item.is_visible = is_visible;
    await db.query('UPDATE dashboard_layouts SET layout_json=? WHERE user_id=?', [JSON.stringify(layout), req.user.id]);
    res.json({ message: 'Widget visibility updated' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// DELETE /api/dashboard-layout/reset
router.delete('/reset', auth, async (req, res) => {
  try {
    await db.query('DELETE FROM dashboard_layouts WHERE user_id=?', [req.user.id]);
    res.json({ message: 'Layout reset to default' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
