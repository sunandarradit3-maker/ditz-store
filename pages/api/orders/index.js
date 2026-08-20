const crypto = require('crypto')
const db = require('../../../lib/db')
const { getProducts } = require('../../../lib/catalog')
const { rateLimit } = require('../../../lib/rate-limit')
const { parseCookies, verify } = require('../../../lib/security')

function clean(v, max = 200) { return String(v || '').trim().slice(0, max) }
function validEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) }
function validPhone(v) { return /^[0-9+()\-\s]{8,20}$/.test(v) }
function orderCode() {
  const d = new Date(); const y = String(d.getUTCFullYear()).slice(-2); const m = String(d.getUTCMonth()+1).padStart(2,'0'); const day = String(d.getUTCDate()).padStart(2,'0')
  return `DTS-${y}${m}${day}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`
}

export default async function handler(req, res) {
  if (!rateLimit(req, res, { limit: 12, windowMs: 60_000, key: 'orders' })) return
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Method not allowed' })
  if (!db.configured()) return res.status(503).json({ ok: false, code: 'DB_NOT_CONFIGURED', error: 'Database produksi belum dikonfigurasi.' })

  const { customer = {}, items = [], payment = 'manual', notes = '' } = req.body || {}
  const name = clean(customer.name, 80)
  const email = clean(customer.email, 120).toLowerCase()
  const phone = clean(customer.phone, 24)
  if (name.length < 2 || !validEmail(email) || !validPhone(phone)) return res.status(400).json({ ok: false, error: 'Data pelanggan tidak valid.' })
  if (!Array.isArray(items) || items.length < 1 || items.length > 20) return res.status(400).json({ ok: false, error: 'Keranjang tidak valid.' })

  const catalog = await getProducts()
  const byId = new Map(catalog.map(p => [p.id, p]))
  const normalized = []
  let total = 0
  for (const raw of items) {
    const p = byId.get(clean(raw.id, 64))
    const qty = Math.min(10, Math.max(1, Number(raw.qty) || 1))
    if (!p || !p.active) return res.status(400).json({ ok: false, error: 'Ada produk yang sudah tidak tersedia.' })
    normalized.push({ id: p.id, name: p.name, price: Number(p.price), qty })
    total += Number(p.price) * qty
  }
  const session = verify(parseCookies(req).ditz_user)
  const code = orderCode()
  const row = {
    code,
    customer_id: session?.sub || null,
    customer_name: name,
    customer_email: email,
    customer_phone: phone,
    items: normalized,
    subtotal: total,
    total,
    payment_method: clean(payment, 40),
    payment_status: 'unpaid',
    status: 'pending',
    notes: clean(notes, 500)
  }
  const inserted = await db.insert('orders', row)
  res.status(201).json({ ok: true, order: { code, total, status: 'pending', paymentStatus: 'unpaid', createdAt: inserted?.[0]?.created_at || new Date().toISOString() } })
}
