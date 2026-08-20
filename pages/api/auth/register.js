const crypto = require('crypto')
const db = require('../../../lib/db')
const { rateLimit } = require('../../../lib/rate-limit')
const { hashPassword, issueSession, setSessionCookie } = require('../../../lib/security')
function emailOk(v){return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)}
export default async function handler(req,res){
  if(!rateLimit(req,res,{limit:8,windowMs:60_000,key:'register'})) return
  if(req.method!=='POST') return res.status(405).json({ok:false,error:'Method not allowed'})
  if(!db.configured()) return res.status(503).json({ok:false,code:'DB_NOT_CONFIGURED',error:'Database akun belum dikonfigurasi.'})
  const name=String(req.body?.name||'').trim().slice(0,80), email=String(req.body?.email||'').trim().toLowerCase().slice(0,120), password=String(req.body?.password||'')
  if(name.length<2||!emailOk(email)||password.length<8||password.length>128) return res.status(400).json({ok:false,error:'Nama, email, atau password tidak valid.'})
  const exists=await db.select('customers',`select=id&email=eq.${encodeURIComponent(email)}&limit=1`)
  if(exists?.length) return res.status(409).json({ok:false,error:'Email sudah terdaftar.'})
  const id=crypto.randomUUID(); await db.insert('customers',{id,name,email,password_hash:hashPassword(password)})
  const token=issueSession({sub:id,email,role:'customer'}); setSessionCookie(res,'ditz_user',token)
  res.status(201).json({ok:true,user:{id,name,email}})
}
