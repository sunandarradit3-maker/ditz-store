const db = require('../../../lib/db')
const { parseCookies, verify } = require('../../../lib/security')
export default async function handler(req,res){
  if(req.method!=='GET') return res.status(405).json({ok:false})
  const s=verify(parseCookies(req).ditz_user); if(!s||s.role!=='customer') return res.status(401).json({ok:false,error:'Unauthorized'})
  if(!db.configured()) return res.status(503).json({ok:false,error:'Database belum dikonfigurasi.'})
  const rows=await db.select('orders',`select=code,items,total,status,payment_status,created_at&customer_id=eq.${encodeURIComponent(s.sub)}&order=created_at.desc&limit=30`)
  res.status(200).json({ok:true,orders:rows||[]})
}
