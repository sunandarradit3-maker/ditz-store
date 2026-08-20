const { products: fallbackProducts } = require('../data/products')
const db = require('./db')

async function getProducts() {
  if (!db.configured()) return fallbackProducts
  try {
    const rows = await db.select('products', 'select=id,slug,name,category,price,old_price,badge,icon,description,features,active&active=eq.true&order=created_at.asc')
    if (!Array.isArray(rows) || rows.length === 0) return fallbackProducts
    return rows.map(r => ({ ...r, oldPrice: r.old_price, features: r.features || [] }))
  } catch {
    return fallbackProducts
  }
}

module.exports = { getProducts, fallbackProducts }
