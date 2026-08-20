const crypto = require('crypto')

const SESSION_TTL = 60 * 60 * 24 * 7

function secret() {
  return process.env.SESSION_SECRET || ''
}

function base64url(input) {
  return Buffer.from(input).toString('base64url')
}

function sign(payload) {
  const s = secret()
  if (!s) return null
  const body = base64url(JSON.stringify(payload))
  const sig = crypto.createHmac('sha256', s).update(body).digest('base64url')
  return `${body}.${sig}`
}

function verify(token) {
  try {
    if (!token || !secret()) return null
    const [body, sig] = token.split('.')
    if (!body || !sig) return null
    const expected = crypto.createHmac('sha256', secret()).update(body).digest('base64url')
    const a = Buffer.from(sig)
    const b = Buffer.from(expected)
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'))
    if (!payload.exp || Date.now() > payload.exp) return null
    return payload
  } catch {
    return null
  }
}

function issueSession(data, ttlSeconds = SESSION_TTL) {
  return sign({ ...data, iat: Date.now(), exp: Date.now() + ttlSeconds * 1000 })
}

function parseCookies(req) {
  const cookie = req.headers.cookie || ''
  return Object.fromEntries(cookie.split(';').map(v => v.trim()).filter(Boolean).map(v => {
    const i = v.indexOf('=')
    return [decodeURIComponent(v.slice(0, i)), decodeURIComponent(v.slice(i + 1))]
  }))
}

function setSessionCookie(res, name, token, maxAge = SESSION_TTL) {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : ''
  res.setHeader('Set-Cookie', `${name}=${encodeURIComponent(token || '')}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${token ? maxAge : 0}${secure}`)
}

function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  const hash = crypto.scryptSync(String(password), salt, 64).toString('hex')
  return `${salt}:${hash}`
}

function verifyPassword(password, stored) {
  try {
    const [salt, hash] = String(stored).split(':')
    const candidate = crypto.scryptSync(String(password), salt, 64)
    const original = Buffer.from(hash, 'hex')
    return candidate.length === original.length && crypto.timingSafeEqual(candidate, original)
  } catch {
    return false
  }
}

function safeCompare(a, b) {
  const aa = Buffer.from(String(a || ''))
  const bb = Buffer.from(String(b || ''))
  return aa.length === bb.length && crypto.timingSafeEqual(aa, bb)
}

module.exports = { issueSession, verify, parseCookies, setSessionCookie, hashPassword, verifyPassword, safeCompare }
