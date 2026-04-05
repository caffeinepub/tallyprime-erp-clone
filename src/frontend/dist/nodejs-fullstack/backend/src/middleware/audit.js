const { getMySQLPool } = require('../database/mysql');
const { publishToQueue, QUEUES } = require('../database/rabbitmq');

async function logAudit(companyId, username, action, entityType, entityId, oldVal, newVal, ip) {
  try {
    const pool = getMySQLPool();
    if (!pool) return;
    await pool.execute(
      `INSERT INTO audit_log (company_id, username, action, entity_type, entity_id, old_value, new_value, ip_address) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [companyId, username, action, entityType, entityId,
       oldVal ? JSON.stringify(oldVal) : null,
       newVal ? JSON.stringify(newVal) : null,
       ip || null]
    );
    // Also push to queue for async processing
    await publishToQueue(QUEUES.SYNC, { type: 'audit', companyId, username, action, entityType, entityId });
  } catch {}
}

module.exports = { logAudit };
