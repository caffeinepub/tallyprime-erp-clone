// Shortcut Key System - HisabKitab Pro v4.0
const router = require('express').Router();
const db = require('../database/db');
const { authenticate: auth } = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM shortcut_configs WHERE user_id=? ORDER BY created_at DESC', [req.user.id]);
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/', auth, async (req, res) => {
  try {
    const { shortcuts } = req.body;
    await db.query('DELETE FROM shortcut_configs WHERE user_id=?', [req.user.id]);
    for (const sc of shortcuts) {
      await db.query('INSERT INTO shortcut_configs(user_id,key_combo,action,label,module) VALUES(?,?,?,?,?)',
        [req.user.id, sc.key_combo, sc.action, sc.label, sc.module || 'global']);
    }
    res.json({ message: 'Shortcuts saved', count: shortcuts.length });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const { key_combo, action, label, module } = req.body;
    await db.query('UPDATE shortcut_configs SET key_combo=?,action=?,label=?,module=? WHERE id=? AND user_id=?',
      [key_combo, action, label, module || 'global', req.params.id, req.user.id]);
    res.json({ message: 'Shortcut updated' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    await db.query('DELETE FROM shortcut_configs WHERE id=? AND user_id=?', [req.params.id, req.user.id]);
    res.json({ message: 'Shortcut deleted' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
