const db = require('../../../lib/db')
const { requireAdmin } = require('../../../lib/admin')
const allowedStatus=['pending','processing','completed','cancelled']
const allowedPayment=['unpaid','paid','failed','refunded']
export default async function handler(req,res){
  if(!requireAdmin(req,res)) return
  if(!db.configured()) return res.status(503).json({ok:false,error:'Database belum dikonfigurasi.'})
  if(req.method==='GET'){
    const rows=await db.select('orders','select=code,customer_name,customer_email,customer_phone,items,total,status,payment_status,payment_method,notes,created_at,updated_at&order=created_at.desc&limit=100')
    return res.status(200).json({ok:true,orders:rows||[]})
  }
  if(req.method==='PATCH'){
    const code=String(req.body?.code||'').trim().toUpperCase(); const patch={}
    if(allowedStatus.includes(req.body?.status)) patch.status=req.body.status
    if(allowedPayment.includes(req.body?.paymentStatus)) patch.payment_status=req.body.paymentStatus
    if(!Object.keys(patch).length) return res.status(400).json({ok:false,error:'Tidak ada perubahan valid.'})
    patch.updated_at=new Date().toISOString(); const rows=await db.update('orders',`code=eq.${encodeURIComponent(code)}`,patch)
    return res.status(200).json({ok:true,order:rows?.[0]||null})
  }
  res.status(405).json({ok:false,error:'Method not allowed'})
}
