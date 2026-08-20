const { setSessionCookie } = require('../../../lib/security')
export default function handler(req,res){ if(req.method!=='POST') return res.status(405).json({ok:false}); setSessionCookie(res,'ditz_user',''); res.status(200).json({ok:true}) }
