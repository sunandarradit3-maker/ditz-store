import { useEffect, useMemo, useState } from 'react'

const rupiah = n => new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR',maximumFractionDigits:0}).format(Number(n||0))
const readJSON = (k,fallback) => { try { const v=localStorage.getItem(k); return v?JSON.parse(v):fallback } catch { return fallback } }

export default function Home(){
  const [products,setProducts]=useState([]),[cart,setCart]=useState([]),[wish,setWish]=useState([]),[q,setQ]=useState(''),[cat,setCat]=useState('Semua'),[sort,setSort]=useState('featured')
  const [cartOpen,setCartOpen]=useState(false),[trackOpen,setTrackOpen]=useState(false),[accountOpen,setAccountOpen]=useState(false),[detail,setDetail]=useState(null)
  const [health,setHealth]=useState({database:false,admin:false}),[user,setUser]=useState(null),[notice,setNotice]=useState('')
  const [trackCode,setTrackCode]=useState(''),[track,setTrack]=useState(null),[busy,setBusy]=useState(false)

  useEffect(()=>{
    Promise.all([fetch('/api/products').then(r=>r.json()),fetch('/api/health').then(r=>r.json())]).then(([p,h])=>{setProducts(p.products||[]);setHealth(h)}).catch(()=>{})
    setCart(readJSON('ditz-cart',[])); setWish(readJSON('ditz-wish',[]));
    fetch('/api/auth/me').then(r=>r.json()).then(d=>d.user&&setUser(d.user)).catch(()=>{})
  },[])
  useEffect(()=>{ if(typeof window!=='undefined') localStorage.setItem('ditz-cart',JSON.stringify(cart)) },[cart])
  useEffect(()=>{ if(typeof window!=='undefined') localStorage.setItem('ditz-wish',JSON.stringify(wish)) },[wish])

  const categories=['Semua',...new Set(products.map(p=>p.category))]
  const visible=useMemo(()=>{
    let a=products.filter(p=>(cat==='Semua'||p.category===cat)&&(`${p.name} ${p.description} ${p.category}`).toLowerCase().includes(q.toLowerCase()))
    if(sort==='low') a=[...a].sort((x,y)=>x.price-y.price); if(sort==='high') a=[...a].sort((x,y)=>y.price-x.price)
    return a
  },[products,q,cat,sort])
  const total=cart.reduce((s,i)=>s+(products.find(p=>p.id===i.id)?.price||0)*i.qty,0)
  const count=cart.reduce((s,i)=>s+i.qty,0)

  function add(p){setCart(c=>{const f=c.find(x=>x.id===p.id);return f?c.map(x=>x.id===p.id?{...x,qty:Math.min(10,x.qty+1)}:x):[...c,{id:p.id,qty:1}]});setNotice(`${p.name} masuk keranjang`);setTimeout(()=>setNotice(''),1800)}
  function qty(id,d){setCart(c=>c.map(x=>x.id===id?{...x,qty:Math.max(0,Math.min(10,x.qty+d))}:x).filter(x=>x.qty>0))}
  function toggleWish(id){setWish(w=>w.includes(id)?w.filter(x=>x!==id):[...w,id])}

  async function checkout(e){
    e.preventDefault(); if(!cart.length)return; setBusy(true); setNotice('')
    const form=Object.fromEntries(new FormData(e.currentTarget))
    const payload={customer:{name:form.name,email:form.email,phone:form.phone},payment:form.payment,notes:form.notes,items:cart}
    try{
      const r=await fetch('/api/orders',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)}); const d=await r.json()
      if(!r.ok) throw new Error(d.error||'Checkout gagal')
      setCart([]); setNotice(`Pesanan dibuat: ${d.order.code}`); setTrackCode(d.order.code); setCartOpen(false); setTrackOpen(true); setTrack(d.order)
    }catch(err){setNotice(err.message)}finally{setBusy(false)}
  }
  async function doTrack(){
    setBusy(true);setTrack(null)
    try{const r=await fetch(`/api/orders/track?code=${encodeURIComponent(trackCode)}`);const d=await r.json();if(!r.ok)throw new Error(d.error||'Gagal melacak');setTrack(d.order)}catch(e){setNotice(e.message)}finally{setBusy(false)}
  }

  return <>
    <header className="nav"><div className="shell navin"><a className="brand" href="#top"><span className="mark">D</span><span>DiTz Store</span></a><nav><a href="#produk">Produk</a><a href="#fitur">Keunggulan</a><button className="navlink" onClick={()=>setTrackOpen(true)}>Tracking</button></nav><div className="navActions"><button className="iconBtn" onClick={()=>setAccountOpen(true)} aria-label="Akun">◎</button><button className="btn primary" onClick={()=>setCartOpen(true)}>Keranjang <span className="count">{count}</span></button></div></div></header>

    <main id="top">
      <section className="shell hero"><div className="heroCopy"><span className="eyebrow">DIGITAL COMMERCE • WEB DEVELOPMENT</span><h1>Toko digital yang <span>serius, cepat, dan siap tumbuh.</span></h1><p>DiTz Store menggabungkan katalog, checkout, tracking order, akun pelanggan, serta admin panel dalam satu pengalaman yang rapi dan mobile-first.</p><div className="heroBtns"><a className="btn primary big" href="#produk">Belanja sekarang</a><button className="btn big" onClick={()=>setTrackOpen(true)}>Lacak pesanan</button></div><div className="trust"><b>SSL</b><span>Transport aman</span><b>24/7</b><span>Akses toko</span><b>FAST</b><span>Edge-ready</span></div></div>
      <div className="heroCard"><div className="heroCardTop"><span>STORE SYSTEM</span><i className={health.database?'live':'warn'}>{health.database?'PRODUCTION DB ONLINE':'REVIEW MODE'}</i></div><div className="orb"><strong>DiTz.</strong><small>commerce engine</small></div><div className="metricGrid"><div><b>{products.length}</b><span>Produk</span></div><div><b>4</b><span>Order status</span></div><div><b>2</b><span>Secure sessions</span></div><div><b>100%</b><span>Mobile-first</span></div></div></div></section>

      <section className="shell strip"><div><span>✓</span><b>Harga dihitung server</b><small>Client tidak menentukan total checkout</small></div><div><span>✓</span><b>Tracking privat</b><small>Data pelanggan tidak dibuka publik</small></div><div><span>✓</span><b>Admin terpisah</b><small>Session HttpOnly + SameSite Strict</small></div></section>

      <section id="produk" className="shell section"><div className="sectionHead"><div><span className="eyebrow">KATALOG</span><h2>Produk & layanan DiTz Store</h2><p>Pilih kebutuhanmu. Detail, harga, dan checkout dibuat langsung dari katalog.</p></div><div className="searchbox"><input placeholder="Cari produk..." value={q} onChange={e=>setQ(e.target.value)}/><select value={sort} onChange={e=>setSort(e.target.value)}><option value="featured">Unggulan</option><option value="low">Harga terendah</option><option value="high">Harga tertinggi</option></select></div></div>
        <div className="chips">{categories.map(c=><button key={c} className={cat===c?'chip active':'chip'} onClick={()=>setCat(c)}>{c}</button>)}</div>
        <div className="products">{visible.map((p,i)=><article className="product" key={p.id}><div className={`art art${i%6}`}><span className="productIcon">{p.icon||'◆'}</span><span className="badge">{p.badge||p.category}</span><button className={wish.includes(p.id)?'heart on':'heart'} onClick={()=>toggleWish(p.id)}>♡</button></div><div className="pb"><small>{p.category}</small><h3>{p.name}</h3><p>{p.description}</p><ul>{(p.features||[]).slice(0,3).map(f=><li key={f}>{f}</li>)}</ul><div className="priceRow"><div><b>{rupiah(p.price)}</b>{p.oldPrice&&<s>{rupiah(p.oldPrice)}</s>}</div><span>{p.badge}</span></div><div className="cardActions"><button className="btn" onClick={()=>setDetail(p)}>Detail</button><button className="btn primary" onClick={()=>add(p)}>+ Keranjang</button></div></div></article>)}</div>
      </section>

      <section id="fitur" className="shell section"><div className="sectionHead"><div><span className="eyebrow">SYSTEM</span><h2>Bukan cuma landing page.</h2><p>Struktur dibuat agar bisa dipakai untuk transaksi nyata setelah database dan payment provider dihubungkan.</p></div></div><div className="features"><div><b>01</b><h3>Customer account</h3><p>Register/login dengan password di-hash scrypt dan session ditandatangani server.</p></div><div><b>02</b><h3>Order tracking</h3><p>Kode order unik, status pembayaran, proses, selesai, atau dibatalkan.</p></div><div><b>03</b><h3>Secure admin</h3><p>Kredensial dari environment server, bukan password hardcoded di source.</p></div><div><b>04</b><h3>Product manager</h3><p>Admin dapat tambah produk dan mengubah status pesanan melalui database.</p></div></div></section>

      <section className="shell cta"><div><span className="eyebrow">CUSTOM PROJECT</span><h2>Punya kebutuhan di luar katalog?</h2><p>DiTz Store bisa dikembangkan untuk API, dashboard, SaaS, sistem internal, dan integrasi pembayaran.</p></div><a className="btn primary big" href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER||'6280000000000'}`} target="_blank" rel="noreferrer">Chat WhatsApp</a></section>
    </main>
    <footer><div className="shell footerIn"><div><b>DiTz Store</b><span>Digital commerce & web development.</span></div><div><a href="#produk">Produk</a><button onClick={()=>setTrackOpen(true)}>Tracking</button><a href="/admin">Admin</a></div><small>© 2026 DiTz Store</small></div></footer>

    {notice&&<div className="toast">{notice}</div>}
    {detail&&<Modal onClose={()=>setDetail(null)}><div className="detailHero"><div className="detailIcon">{detail.icon}</div><div><span className="eyebrow">{detail.category}</span><h2>{detail.name}</h2><p>{detail.description}</p></div></div><div className="detailPrice"><b>{rupiah(detail.price)}</b>{detail.oldPrice&&<s>{rupiah(detail.oldPrice)}</s>}</div><div className="detailFeatures">{detail.features?.map(x=><span key={x}>✓ {x}</span>)}</div><button className="btn primary big full" onClick={()=>{add(detail);setDetail(null);setCartOpen(true)}}>Tambahkan ke keranjang</button></Modal>}
    {cartOpen&&<Drawer title="Keranjang" kicker="CHECKOUT" onClose={()=>setCartOpen(false)}><div className="cartLayout"><div><div className="cartList">{cart.length?cart.map(i=>{const p=products.find(x=>x.id===i.id);if(!p)return null;return <div className="cartItem" key={i.id}><div className="miniIcon">{p.icon}</div><div><b>{p.name}</b><small>{rupiah(p.price)}</small></div><div className="qty"><button onClick={()=>qty(i.id,-1)}>−</button><span>{i.qty}</span><button onClick={()=>qty(i.id,1)}>+</button></div></div>}):<Empty text="Keranjang masih kosong."/>}</div>{cart.length>0&&<form onSubmit={checkout} className="form"><div className="twoFields"><label>Nama<input name="name" minLength="2" required/></label><label>WhatsApp<input name="phone" minLength="8" required placeholder="08xxxxxxxxxx"/></label></div><label>Email<input name="email" type="email" required/></label><label>Metode pembayaran<select name="payment"><option value="DANA">DANA</option><option value="QRIS">QRIS</option><option value="Transfer Manual">Transfer Manual</option></select></label><label>Catatan<textarea name="notes" rows="3"/></label>{!health.database&&<div className="warning">Database produksi belum terhubung, jadi checkout sengaja tidak menyimpan order palsu. Setelah env Supabase dipasang, form ini langsung memakai API produksi.</div>}<button disabled={busy||!health.database} className="btn primary big full">{busy?'Memproses...':'Buat pesanan'}</button></form>}</div><aside className="summary"><span>RINGKASAN</span><div><b>{count} item</b><strong>{rupiah(total)}</strong></div><hr/><p>Harga diverifikasi ulang di server pada saat checkout.</p></aside></div></Drawer>}
    {trackOpen&&<Drawer title="Lacak pesanan" kicker="ORDER TRACKING" onClose={()=>setTrackOpen(false)}><div className="trackSearch"><input value={trackCode} onChange={e=>setTrackCode(e.target.value.toUpperCase())} placeholder="DTS-260820-ABC123"/><button className="btn primary" onClick={doTrack} disabled={busy}>Lacak</button></div>{track?<TrackCard order={track}/>:<Empty text="Masukkan kode pesanan untuk melihat status."/>}</Drawer>}
    {accountOpen&&<Drawer title={user?`Halo, ${user.name||user.email}`:'Akun pelanggan'} kicker="ACCOUNT" onClose={()=>setAccountOpen(false)}>{user?<Account user={user} setUser={setUser}/>:<Auth setUser={setUser} health={health}/>}</Drawer>}
  </>
}

function Modal({children,onClose}){return <div className="overlay" onMouseDown={e=>e.target===e.currentTarget&&onClose()}><div className="modal"><button className="x" onClick={onClose}>×</button>{children}</div></div>}
function Drawer({children,onClose,title,kicker}){return <div className="overlay" onMouseDown={e=>e.target===e.currentTarget&&onClose()}><div className="drawer"><div className="drawerHead"><div><span className="eyebrow">{kicker}</span><h2>{title}</h2></div><button className="x" onClick={onClose}>×</button></div>{children}</div></div>}
function Empty({text}){return <div className="empty"><span>◇</span><p>{text}</p></div>}
function TrackCard({order}){const steps=['pending','processing','completed'];const idx=steps.indexOf(order.status);return <div className="trackCard"><div className="trackTop"><div><span>KODE PESANAN</span><b>{order.code}</b></div><strong>{rupiah(order.total)}</strong></div><div className="payStatus">Pembayaran: <b>{order.paymentStatus||order.payment_status}</b></div><div className="timeline">{steps.map((s,i)=><div className={i<=idx?'step on':'step'} key={s}><i></i><div><b>{s==='pending'?'Pesanan diterima':s==='processing'?'Sedang diproses':'Selesai'}</b><span>{i<=idx?'Aktif':'Menunggu'}</span></div></div>)}</div>{order.status==='cancelled'&&<div className="warning">Pesanan dibatalkan.</div>}</div>}
function Auth({setUser,health}){const [mode,setMode]=useState('login'),[msg,setMsg]=useState(''),[busy,setBusy]=useState(false);async function submit(e){e.preventDefault();setBusy(true);setMsg('');const body=Object.fromEntries(new FormData(e.currentTarget));try{const r=await fetch(`/api/auth/${mode}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});const d=await r.json();if(!r.ok)throw new Error(d.error);setUser(d.user)}catch(e){setMsg(e.message)}finally{setBusy(false)}}return <div className="auth"><div className="tabs"><button className={mode==='login'?'on':''} onClick={()=>setMode('login')}>Masuk</button><button className={mode==='register'?'on':''} onClick={()=>setMode('register')}>Daftar</button></div><form onSubmit={submit} className="form">{mode==='register'&&<label>Nama<input name="name" minLength="2" required/></label>}<label>Email<input name="email" type="email" required/></label><label>Password<input name="password" type="password" minLength="8" required/></label>{msg&&<div className="warning">{msg}</div>}{!health.database&&<div className="warning">Database akun belum aktif di preview ini.</div>}<button className="btn primary big full" disabled={busy||!health.database}>{busy?'Tunggu...':mode==='login'?'Masuk':'Buat akun'}</button></form></div>}
function Account({user,setUser}){const [orders,setOrders]=useState([]);useEffect(()=>{fetch('/api/auth/orders').then(r=>r.json()).then(d=>setOrders(d.orders||[])).catch(()=>{})},[]);async function logout(){await fetch('/api/auth/logout',{method:'POST'});setUser(null)}return <div><div className="accountCard"><b>{user.name||'Pelanggan DiTz'}</b><span>{user.email}</span><button className="btn" onClick={logout}>Keluar</button></div><h3>Pesanan saya</h3>{orders.length?orders.map(o=><TrackCard key={o.code} order={o}/>):<Empty text="Belum ada pesanan di akun ini."/>}</div>}
