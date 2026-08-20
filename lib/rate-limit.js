const buckets = global.__ditzRateBuckets || new Map()
global.__ditzRateBuckets = buckets

function rateLimit(req, res, { limit = 30, windowMs = 60_000, key = 'default' } = {}) {
  const ip = (req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown').toString().split(',')[0].trim()
  const bucketKey = `${key}:${ip}`
  const now = Date.now()
  const current = buckets.get(bucketKey)
  if (!current || current.reset < now) {
    buckets.set(bucketKey, { count: 1, reset: now + windowMs })
    return true
  }
  current.count += 1
  if (current.count > limit) {
    res.setHeader('Retry-After', Math.ceil((current.reset - now) / 1000))
    res.status(429).json({ ok: false, error: 'Terlalu banyak permintaan. Coba lagi sebentar.' })
    return false
  }
  return true
}

module.exports = { rateLimit }
