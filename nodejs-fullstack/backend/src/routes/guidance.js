// Guidance System - HisabKitab Pro v4.0
const router = require('express').Router();
const db = require('../database/db');
const { authenticate: auth } = require('../middleware/auth');
const { superAdminAuth } = require('./superAdmin');

router.get('/', auth, async (req, res) => {
  try {
    const { type, published } = req.query;
    let q = 'SELECT * FROM guidance_content WHERE 1=1';
    const params = [];
    if (type) { q += ' AND content_type=?'; params.push(type); }
    if (published !== undefined) { q += ' AND is_published=?'; params.push(published === 'true' ? 1 : 0); }
    else { q += ' AND is_published=1'; }
    q += ' ORDER BY created_at DESC';
    const [rows] = await db.query(q, params);
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM guidance_content WHERE id=? AND is_published=1', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Content not found' });
    await db.query('UPDATE guidance_content SET view_count=view_count+1 WHERE id=?', [req.params.id]);
    res.json(rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/', superAdminAuth, async (req, res) => {
  try {
    const { title, content_type, body, video_url, thumbnail_url, tags, is_published } = req.body;
    const [result] = await db.query(
      'INSERT INTO guidance_content(title,content_type,body,video_url,thumbnail_url,tags,is_published,created_by) VALUES(?,?,?,?,?,?,?,?)',
      [title, content_type || 'blog', body || null, video_url || null, thumbnail_url || null, JSON.stringify(tags || []), is_published ? 1 : 0, req.superAdmin.username]
    );
    res.json({ id: result.insertId, message: 'Content created' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.put('/:id', superAdminAuth, async (req, res) => {
  try {
    const { title, content_type, body, video_url, thumbnail_url, tags, is_published } = req.body;
    await db.query(
      'UPDATE guidance_content SET title=?,content_type=?,body=?,video_url=?,thumbnail_url=?,tags=?,is_published=? WHERE id=?',
      [title, content_type, body, video_url, thumbnail_url, JSON.stringify(tags || []), is_published ? 1 : 0, req.params.id]
    );
    res.json({ message: 'Content updated' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.delete('/:id', superAdminAuth, async (req, res) => {
  try {
    await db.query('DELETE FROM guidance_content WHERE id=?', [req.params.id]);
    res.json({ message: 'Content deleted' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
