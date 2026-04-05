// Dynamic Sidebar Builder - HisabKitab Pro v4.0
const router = require('express').Router();
const db = require('../database/db');
const { authenticate: auth } = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM sidebar_configs WHERE user_id=? ORDER BY position ASC', [req.user.id]);
    if (!rows.length) {
      return res.json([
        { id: 'dashboard', label: 'Dashboard', icon: 'LayoutDashboard', group: 'Main', position: 1, is_visible: true, items: [] },
        { id: 'accounting', label: 'Accounting', icon: 'BookOpen', group: 'Main', position: 2, is_visible: true, items: [] },
        { id: 'gst', label: 'GST', icon: 'FileText', group: 'Finance', position: 3, is_visible: true, items: [] },
        { id: 'inventory', label: 'Inventory', icon: 'Package', group: 'Operations', position: 4, is_visible: true, items: [] },
      ]);
    }
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/', auth, async (req, res) => {
  try {
    const { config } = req.body;
    await db.query('DELETE FROM sidebar_configs WHERE user_id=?', [req.user.id]);
    for (let i = 0; i < config.length; i++) {
      const item = config[i];
      await db.query(
        'INSERT INTO sidebar_configs(user_id,item_id,label,icon,group_name,position,is_visible,items_json) VALUES(?,?,?,?,?,?,?,?)',
        [req.user.id, item.id, item.label, item.icon || null, item.group || 'Main', i + 1, item.is_visible !== false ? 1 : 0, JSON.stringify(item.items || [])]
      );
    }
    res.json({ message: 'Sidebar configuration saved' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/group', auth, async (req, res) => {
  try {
    const { label, icon, position } = req.body;
    const id = `group_${Date.now()}`;
    const [result] = await db.query(
      'INSERT INTO sidebar_configs(user_id,item_id,label,icon,group_name,position,is_visible,is_group,items_json) VALUES(?,?,?,?,"Custom",?,1,1,"[]")',
      [req.user.id, id, label, icon || 'Folder', position || 99]
    );
    res.json({ id: result.insertId, item_id: id, message: 'Group created' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.patch('/:item_id/visibility', auth, async (req, res) => {
  try {
    const { is_visible } = req.body;
    await db.query('UPDATE sidebar_configs SET is_visible=? WHERE user_id=? AND item_id=?', [is_visible ? 1 : 0, req.user.id, req.params.item_id]);
    res.json({ message: 'Visibility updated' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.put('/reorder', auth, async (req, res) => {
  try {
    const { order } = req.body;
    for (const item of order) {
      await db.query('UPDATE sidebar_configs SET position=? WHERE user_id=? AND item_id=?', [item.position, req.user.id, item.item_id]);
    }
    res.json({ message: 'Sidebar reordered' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.delete('/:item_id', auth, async (req, res) => {
  try {
    await db.query('DELETE FROM sidebar_configs WHERE user_id=? AND item_id=?', [req.user.id, req.params.item_id]);
    res.json({ message: 'Item removed from sidebar' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
