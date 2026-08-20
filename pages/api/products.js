const { getProducts } = require('../../lib/catalog')
const { rateLimit } = require('../../lib/rate-limit')
export default async function handler(req, res) {
  if (!rateLimit(req, res, { limit: 60, key: 'products' })) return
  if (req.method !== 'GET') return res.status(405).json({ ok: false, error: 'Method not allowed' })
  const products = await getProducts()
  res.status(200).json({ ok: true, products })
}
