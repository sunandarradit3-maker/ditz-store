const db = require('../../lib/db')
export default function handler(req, res) {
  res.status(200).json({ ok: true, database: db.configured(), admin: Boolean(process.env.ADMIN_USERNAME && process.env.ADMIN_PASSWORD && process.env.SESSION_SECRET), version: '2.0.0' })
}
