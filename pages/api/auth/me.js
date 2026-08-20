const db = require('../../../lib/db')
const { parseCookies, verify } = require('../../../lib/security')
export default async function handler(req,res){
  if(req.method!=='GET') return res.status(405).json({ok:false})
  const s=verify(parseCookies(req).ditz_user); if(!s||s.role!=='customer') return res.status(401).json({ok:false,user:null})
  if(!db.configured()) return res.status(200).json({ok:true,user:{id:s.sub,email:s.email}})
  const rows=await db.select('customers',`select=id,name,email,created_at&id=eq.${encodeURIComponent(s.sub)}&limit=1`)
  const user=rows?.[0]; if(!user) return res.status(401).json({ok:false,user:null})
  res.status(200).json({ok:true,user})
}
