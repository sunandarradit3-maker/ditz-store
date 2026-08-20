const db = require('../../../lib/db')
const { requireAdmin } = require('../../../lib/admin')
export default async function handler(req,res){
  if(!requireAdmin(req,res)) return
  if(!db.configured()) return res.status(503).json({ok:false,error:'Database belum dikonfigurasi.'})
  const orders=await db.select('orders','select=code,total,status,payment_status,created_at&order=created_at.desc&limit=100')
  const list=orders||[]; const revenue=list.filter(o=>o.payment_status==='paid').reduce((s,o)=>s+Number(o.total||0),0)
  res.status(200).json({ok:true,stats:{orders:list.length,pending:list.filter(o=>o.status==='pending').length,paid:list.filter(o=>o.payment_status==='paid').length,revenue},orders:list.slice(0,12)})
}
