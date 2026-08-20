const { parseCookies, verify } = require('./security')

function requireAdmin(req, res) {
  const session = verify(parseCookies(req).ditz_admin)
  if (!session || session.role !== 'admin') {
    res.status(401).json({ ok: false, error: 'Unauthorized' })
    return null
  }
  return session
}

module.exports = { requireAdmin }
