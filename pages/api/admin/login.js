const { rateLimit } = require('../../../lib/rate-limit')
const { safeCompare, issueSession, setSessionCookie } = require('../../../lib/security')
export default function handler(req,res){
  if(!rateLimit(req,res,{limit:8,windowMs:60_000,key:'admin-login'})) return
  if(req.method!=='POST') return res.status(405).json({ok:false,error:'Method not allowed'})
  const configured=Boolean(process.env.ADMIN_USERNAME&&process.env.ADMIN_PASSWORD&&process.env.SESSION_SECRET)
  if(!configured) return res.status(503).json({ok:false,error:'Admin belum dikonfigurasi pada environment server.'})
  const username=String(req.body?.username||''), password=String(req.body?.password||'')
  if(!safeCompare(username,process.env.ADMIN_USERNAME)||!safeCompare(password,process.env.ADMIN_PASSWORD)) return res.status(401).json({ok:false,error:'Kredensial salah.'})
  const token=issueSession({sub:'admin',role:'admin'},60*60*12); setSessionCookie(res,'ditz_admin',token,60*60*12)
  res.status(200).json({ok:true})
}
