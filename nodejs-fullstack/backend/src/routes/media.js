// Cloudinary Media Routes - HisabKitab Pro v4.0
const router = require('express').Router();
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const { db } = require('../database/db');
const { auth } = require('../middleware/auth');
const { superAdminAuth } = require('./superAdmin');

// Configure Cloudinary from DB or env
async function getCloudinaryConfig() {
  try {
    const [rows] = await db.query('SELECT setting_value FROM system_settings WHERE setting_key="cloudinary_config"');
    if (rows.length) {
      const config = JSON.parse(rows[0].setting_value);
      cloudinary.config({ cloud_name: config.cloud_name, api_key: config.api_key, api_secret: config.api_secret });
      return true;
    }
  } catch {}
  // Fallback to env
  if (process.env.CLOUDINARY_CLOUD_NAME) {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
    return true;
  }
  return false;
}

// Multer memory storage for Cloudinary upload
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 50 * 1024 * 1024 } });

// Helper to upload buffer to Cloudinary
function uploadToCloudinary(buffer, options) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (err, result) => {
      if (err) reject(err); else resolve(result);
    });
    stream.end(buffer);
  });
}

// POST /api/media/upload - Upload image or video
router.post('/upload', auth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file provided' });
    const configured = await getCloudinaryConfig();
    if (!configured) return res.status(400).json({ error: 'Cloudinary not configured. Contact Super Admin.' });
    const isVideo = req.file.mimetype.startsWith('video/');
    const result = await uploadToCloudinary(req.file.buffer, {
      folder: `hisabkitab/${req.user.username}`,
      resource_type: isVideo ? 'video' : 'image',
      public_id: `${Date.now()}_${req.file.originalname.replace(/[^a-zA-Z0-9.]/g, '_')}`,
    });
    // Save to DB
    const [dbResult] = await db.query(
      'INSERT INTO media_files(user_id,company_id,file_name,file_type,cloudinary_id,url,thumbnail_url,size_bytes,resource_type) VALUES(?,?,?,?,?,?,?,?,?)',
      [req.user.id, req.body.company_id || null, req.file.originalname, req.file.mimetype, result.public_id, result.secure_url, result.eager?.[0]?.secure_url || result.secure_url, result.bytes, isVideo ? 'video' : 'image']
    );
    res.json({ id: dbResult.insertId, url: result.secure_url, public_id: result.public_id, resource_type: isVideo ? 'video' : 'image' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET /api/media - List media files
router.get('/', auth, async (req, res) => {
  try {
    const { company_id, type } = req.query;
    let q = 'SELECT * FROM media_files WHERE user_id=?';
    const params = [req.user.id];
    if (company_id) { q += ' AND company_id=?'; params.push(company_id); }
    if (type) { q += ' AND resource_type=?'; params.push(type); }
    q += ' ORDER BY created_at DESC';
    const [files] = await db.query(q, params);
    res.json(files);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// DELETE /api/media/:id - Delete media
router.delete('/:id', auth, async (req, res) => {
  try {
    const [files] = await db.query('SELECT * FROM media_files WHERE id=? AND user_id=?', [req.params.id, req.user.id]);
    if (!files.length) return res.status(404).json({ error: 'File not found' });
    const file = files[0];
    const configured = await getCloudinaryConfig();
    if (configured) {
      await cloudinary.uploader.destroy(file.cloudinary_id, { resource_type: file.resource_type });
    }
    await db.query('DELETE FROM media_files WHERE id=?', [req.params.id]);
    res.json({ message: 'File deleted' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET /api/media/all - Super Admin: view all media
router.get('/all', superAdminAuth, async (req, res) => {
  try {
    const [files] = await db.query('SELECT m.*, u.username, u.full_name FROM media_files m LEFT JOIN users u ON u.id=m.user_id ORDER BY m.created_at DESC LIMIT 200');
    res.json(files);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
