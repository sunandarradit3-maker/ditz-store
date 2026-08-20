const crypto = require('crypto')
const db = require('../../../lib/db')
const { requireAdmin } = require('../../../lib/admin')
function clean(v,max=180){return String(v||'').trim().slice(0,max)}
export default async function handler(req,res){
  if(!requireAdmin(req,res)) return
  if(!db.configured()) return res.status(503).json({ok:false,error:'Database belum dikonfigurasi.'})
  if(req.method==='GET'){
    const rows=await db.select('products','select=*&order=created_at.asc'); return res.status(200).json({ok:true,products:rows||[]})
  }
  if(req.method==='POST'){
    const p=req.body||{}; const name=clean(p.name,100); const price=Math.max(0,Number(p.price)||0)
    if(name.length<2||price<1) return res.status(400).json({ok:false,error:'Nama/harga tidak valid.'})
    const id=clean(p.id,60)||crypto.randomUUID(); const slug=clean(p.slug,100)||name.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'')
    const rows=await db.insert('products',{id,slug,name,category:clean(p.category,60)||'Lainnya',price,old_price:p.oldPrice?Number(p.oldPrice):null,badge:clean(p.badge,30),icon:clean(p.icon,10)||'◆',description:clean(p.description,500),features:Array.isArray(p.features)?p.features.slice(0,8).map(x=>clean(x,80)):[],active:p.active!==false})
    return res.status(201).json({ok:true,product:rows?.[0]})
  }
  if(req.method==='PATCH'){
    const id=clean(req.body?.id,60); if(!id) return res.status(400).json({ok:false,error:'ID wajib.'}); const p=req.body; const patch={}
    for(const [k,col,max] of [['name','name',100],['slug','slug',100],['category','category',60],['badge','badge',30],['icon','icon',10],['description','description',500]]) if(p[k]!==undefined) patch[col]=clean(p[k],max)
    if(p.price!==undefined) patch.price=Math.max(0,Number(p.price)||0); if(p.oldPrice!==undefined) patch.old_price=p.oldPrice?Number(p.oldPrice):null; if(p.active!==undefined) patch.active=Boolean(p.active); if(Array.isArray(p.features)) patch.features=p.features.slice(0,8).map(x=>clean(x,80))
    const rows=await db.update('products',`id=eq.${encodeURIComponent(id)}`,patch); return res.status(200).json({ok:true,product:rows?.[0]})
  }
  if(req.method==='DELETE'){
    const id=clean(req.query.id,60); if(!id) return res.status(400).json({ok:false,error:'ID wajib.'}); await db.remove('products',`id=eq.${encodeURIComponent(id)}`); return res.status(200).json({ok:true})
  }
  res.status(405).json({ok:false,error:'Method not allowed'})
}
