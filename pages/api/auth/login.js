const db = require('../../../lib/db')
const { rateLimit } = require('../../../lib/rate-limit')
const { verifyPassword, issueSession, setSessionCookie } = require('../../../lib/security')
export default async function handler(req,res){
  if(!rateLimit(req,res,{limit:10,windowMs:60_000,key:'login'})) return
  if(req.method!=='POST') return res.status(405).json({ok:false,error:'Method not allowed'})
  if(!db.configured()) return res.status(503).json({ok:false,code:'DB_NOT_CONFIGURED',error:'Database akun belum dikonfigurasi.'})
  const email=String(req.body?.email||'').trim().toLowerCase().slice(0,120), password=String(req.body?.password||'')
  const rows=await db.select('customers',`select=id,name,email,password_hash&email=eq.${encodeURIComponent(email)}&limit=1`)
  const user=rows?.[0]; if(!user||!verifyPassword(password,user.password_hash)) return res.status(401).json({ok:false,error:'Email atau password salah.'})
  const token=issueSession({sub:user.id,email:user.email,role:'customer'}); setSessionCookie(res,'ditz_user',token)
  res.status(200).json({ok:true,user:{id:user.id,name:user.name,email:user.email}})
}
