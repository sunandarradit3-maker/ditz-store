const url = () => process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const key = () => process.env.SUPABASE_SERVICE_ROLE_KEY || ''

function configured() {
  return Boolean(url() && key())
}

async function request(path, options = {}) {
  if (!configured()) {
    const err = new Error('Database belum dikonfigurasi')
    err.code = 'DB_NOT_CONFIGURED'
    throw err
  }
  const res = await fetch(`${url()}/rest/v1/${path}`, {
    ...options,
    headers: {
      apikey: key(),
      Authorization: `Bearer ${key()}`,
      'Content-Type': 'application/json',
      Prefer: options.prefer || 'return=representation',
      ...(options.headers || {})
    }
  })
  const text = await res.text()
  let data = null
  try { data = text ? JSON.parse(text) : null } catch { data = text }
  if (!res.ok) {
    const err = new Error(data?.message || data?.hint || `Database error ${res.status}`)
    err.status = res.status
    err.details = data
    throw err
  }
  return data
}

async function select(table, query = '') {
  return request(`${table}?${query}`, { method: 'GET', prefer: 'return=representation' })
}

async function insert(table, body) {
  return request(table, { method: 'POST', body: JSON.stringify(body), prefer: 'return=representation' })
}

async function update(table, query, body) {
  return request(`${table}?${query}`, { method: 'PATCH', body: JSON.stringify(body), prefer: 'return=representation' })
}

async function remove(table, query) {
  return request(`${table}?${query}`, { method: 'DELETE', prefer: 'return=representation' })
}

module.exports = { configured, select, insert, update, remove }
