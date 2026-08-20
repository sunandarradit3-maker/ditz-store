const db = require('../../../lib/db')
const { rateLimit } = require('../../../lib/rate-limit')
export default async function handler(req, res) {
  if (!rateLimit(req, res, { limit: 25, key: 'track' })) return
  if (req.method !== 'GET') return res.status(405).json({ ok: false, error: 'Method not allowed' })
  if (!db.configured()) return res.status(503).json({ ok: false, code: 'DB_NOT_CONFIGURED', error: 'Tracking produksi belum aktif.' })
  const code = String(req.query.code || '').trim().toUpperCase().slice(0, 40)
  if (!/^DTS-\d{6}-[A-F0-9]{6}$/.test(code)) return res.status(400).json({ ok: false, error: 'Format kode pesanan tidak valid.' })
  const rows = await db.select('orders', `select=code,items,total,status,payment_status,created_at,updated_at&code=eq.${encodeURIComponent(code)}&limit=1`)
  if (!rows?.length) return res.status(404).json({ ok: false, error: 'Pesanan tidak ditemukan.' })
  const r = rows[0]
  res.status(200).json({ ok: true, order: { code: r.code, items: r.items, total: r.total, status: r.status, paymentStatus: r.payment_status, createdAt: r.created_at, updatedAt: r.updated_at } })
}
