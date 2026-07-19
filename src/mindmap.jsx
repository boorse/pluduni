import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { CATS, SPECIES, RARITY, isObserved } from './data'
import { gradientFor, gradientForCat } from './gradients.js'
import { nameOf, catNameOf } from './i18n.js'
import { PhotoBg } from './photoui.jsx'

const CARD_W = 92, CARD_H = 68, GAP_X = 14, LEVEL_Y = 118
// décalage vertical par colonne — évite une map trop horizontale
const STAGGER = [0, 46, 16, 62, 30, 74]

export default function MindMap({ onSelectSpecies, lang='fr', expanded, setExpanded, tf, setTf }) {
  const wrapRef = useRef(null)
  const drag = useRef({ on: false, sx: 0, sy: 0, ox: 0, oy: 0, moved: false })

  const toggle = useCallback((id) => {
    setExpanded(prev => {
      const n = new Set(prev)
      if (n.has(id)) { n.delete(id); for (const k of [...n]) if (k.startsWith(id + ':')) n.delete(k) }
      else n.add(id)
      return n
    })
  }, [])

  const { nodes, links, width, height } = useMemo(() => {
    const root = {
      id: 'root', kind: 'root', label: 'Pokédex', e: '🌿',
      children: CATS.map((cat, ci) => ({
        id: cat.id, kind: 'cat', label: cat.n, sub: cat.lat, e: cat.e, cat, stagger: STAGGER[ci % STAGGER.length],
        children: cat.subs.map(sv => ({
          id: cat.id + ':' + sv.id, kind: 'fam', label: sv.id, sub: sv.lat,
          members: SPECIES.filter(sp => sp.cat === cat.id && sp.sub === sv.id),
          children: SPECIES.filter(sp => sp.cat === cat.id && sp.sub === sv.id)
            .map(sp => ({ id: cat.id + ':' + sv.id + ':' + sp.id, kind: 'sp', sp, children: [] }))
        }))
      }))
    }
    const measure = (n) => {
      const open = n.kind === 'root' ? true : expanded.has(n.id)
      if (!open || !n.children.length) { n.units = 1; return 1 }
      n.units = n.children.reduce((s, c) => s + measure(c), 0)
      return n.units
    }
    measure(root)

    const nodes = [], links = []
    const place = (n, left, depth, offsetY) => {
      const w = n.units * (CARD_W + GAP_X)
      n.x = left + w / 2
      n.y = depth * LEVEL_Y + 56 + offsetY
      nodes.push(n)
      const open = n.kind === 'root' ? true : expanded.has(n.id)
      if (open && n.children.length) {
        let cur = left
        n.children.forEach((c, i) => {
          const cw = c.units * (CARD_W + GAP_X)
          const off = offsetY + (c.stagger !== undefined ? c.stagger : (depth === 1 ? STAGGER[i % STAGGER.length] * 0.5 : 0))
          place(c, cur, depth + 1, off)
          links.push({ x1: n.x, y1: n.y + CARD_H / 2, x2: c.x, y2: c.y - CARD_H / 2, depth })
          cur += cw
        })
      }
    }
    place(root, 0, 0, 0)
    const width = root.units * (CARD_W + GAP_X) + 80
    const height = Math.max(...nodes.map(n => n.y)) + CARD_H + 70
    return { nodes, links, width, height }
  }, [expanded])

  const fit = useCallback(() => {
    const el = wrapRef.current; if (!el) return
    const vw = el.clientWidth, vh = el.clientHeight
    const k = Math.max(0.3, Math.min(1, Math.min((vw - 40) / width, (vh - 40) / height)))
    setTf({ x: (vw - width * k) / 2, y: 14, k })
  }, [width, height])

  // ne recentre qu'au tout premier affichage (tf encore vierge)
  useEffect(() => {
    if (tf.k === 1 && tf.x === 0 && tf.y === 0) fit()
  }, [fit])

  // zoom centré sur le curseur
  const onWheel = useCallback((e) => {
    e.preventDefault()
    const el = wrapRef.current; if (!el) return
    const r = el.getBoundingClientRect()
    const mx = e.clientX - r.left, my = e.clientY - r.top
    setTf(t => {
      const k2 = Math.min(2.4, Math.max(0.25, t.k * (1 - e.deltaY * 0.0014)))
      const ratio = k2 / t.k
      return { k: k2, x: mx - (mx - t.x) * ratio, y: my - (my - t.y) * ratio }
    })
  }, [])
  useEffect(() => {
    const el = wrapRef.current; if (!el) return
    const stop = (e) => { if (e.touches && e.touches.length >= 1) e.preventDefault() }
    el.addEventListener('wheel', onWheel, { passive: false })
    el.addEventListener('touchmove', stop, { passive: false })
    return () => { el.removeEventListener('wheel', onWheel); el.removeEventListener('touchmove', stop) }
  }, [onWheel])

  const pinch = useRef(null)
  const dist = (t) => Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY)
  const mid  = (t) => ({ x: (t[0].clientX + t[1].clientX) / 2, y: (t[0].clientY + t[1].clientY) / 2 })

  const down = (e) => {
    if (e.touches && e.touches.length === 2) {
      const el = wrapRef.current; if (!el) return
      const r = el.getBoundingClientRect(), m = mid(e.touches)
      pinch.current = { d: dist(e.touches), k: tf.k, x: tf.x, y: tf.y, mx: m.x - r.left, my: m.y - r.top }
      drag.current.on = false
      return
    }
    const p = e.touches ? e.touches[0] : e
    drag.current = { on: true, sx: p.clientX, sy: p.clientY, ox: tf.x, oy: tf.y, moved: false }
  }

  const move = (e) => {
    if (e.touches && e.touches.length === 2 && pinch.current) {
      e.preventDefault()
      const p0 = pinch.current
      const ratio = dist(e.touches) / p0.d
      const k2 = Math.min(2.4, Math.max(0.25, p0.k * ratio))
      const r2 = k2 / p0.k
      setTf({ k: k2, x: p0.mx - (p0.mx - p0.x) * r2, y: p0.my - (p0.my - p0.y) * r2 })
      drag.current.moved = true
      return
    }
    if (!drag.current.on) return
    const p = e.touches ? e.touches[0] : e
    const dx = p.clientX - drag.current.sx, dy = p.clientY - drag.current.sy
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) drag.current.moved = true
    setTf(t => ({ ...t, x: drag.current.ox + dx, y: drag.current.oy + dy }))
  }

  const up = (e) => {
    if (!e?.touches || e.touches.length === 0) { pinch.current = null; drag.current.on = false }
  }
  const guard = (fn) => (e) => { if (drag.current.moved) { e.preventDefault(); return } fn() }

  const gridStep = 34
  return (
    <div style={{ position:'relative', height:'100%', display:'flex', flexDirection:'column', background:'#E3DAC5', userSelect:'none', WebkitUserSelect:'none' }}>
      <div style={{ position:'absolute', top:9, right:10, zIndex:5, display:'flex', gap:5, flexWrap:'wrap', justifyContent:'flex-end' }}>
        <button onClick={()=>setExpanded(new Set())} style={btn}>Tout replier</button>
        <button onClick={fit} style={btn}>Recentrer</button>
      </div>
      <div style={{ position:'absolute', bottom:52, right:10, zIndex:5, display:'flex', flexDirection:'column', gap:5 }}>
        {[['+',1.25],['−',0.8]].map(([l,f])=>(
          <button key={l} onClick={()=>{
            const el = wrapRef.current; if(!el) return
            const cx2 = el.clientWidth/2, cy2 = el.clientHeight/2
            setTf(t=>{ const k2 = Math.min(2.4, Math.max(0.25, t.k*f)); const r = k2/t.k
              return { k:k2, x: cx2-(cx2-t.x)*r, y: cy2-(cy2-t.y)*r } })
          }} style={{ ...btn, width:30, height:30, padding:0, fontSize:16, fontWeight:700,
            display:'flex', alignItems:'center', justifyContent:'center' }}>{l}</button>
        ))}
      </div>

      <div ref={wrapRef}
        onMouseDown={down} onMouseMove={move} onMouseUp={up} onMouseLeave={up}
        onTouchStart={down} onTouchMove={move} onTouchEnd={up}
        onDragStart={e=>e.preventDefault()}
        style={{ flex:1, minHeight:300, overflow:'hidden', position:'relative',
          cursor: drag.current.on?'grabbing':'grab', touchAction:'none',
          userSelect:'none', WebkitUserSelect:'none',
          backgroundImage:`linear-gradient(rgba(190,178,152,.32) 1px, transparent 1px), linear-gradient(90deg, rgba(190,178,152,.32) 1px, transparent 1px)`,
          backgroundSize:`${gridStep*tf.k}px ${gridStep*tf.k}px`,
          backgroundPosition:`${tf.x}px ${tf.y}px`,
          backgroundColor:'#E3DAC5' }}>
        <div style={{ position:'absolute', transformOrigin:'0 0', transform:`translate(${tf.x}px,${tf.y}px) scale(${tf.k})`, willChange:'transform' }}>
          <svg width={width} height={height} style={{ position:'absolute', top:0, left:0, pointerEvents:'none' }}>
            {links.map((l,i)=>{
              const my = (l.y1 + l.y2) / 2
              return <path key={i} d={`M${l.x1},${l.y1} C${l.x1},${my} ${l.x2},${my} ${l.x2},${l.y2}`}
                fill="none" stroke={l.depth===0?'#B0A182':'#C6B99E'} strokeWidth={l.depth===0?2:1.4} />
            })}
          </svg>
          {nodes.map(n => <Card key={n.id} n={n} lang={lang} expanded={expanded} toggle={guard(()=>toggle(n.id))} onSp={guard(()=>onSelectSpecies(n.sp.id))} />)}
          <div style={{ width, height }} />
        </div>
      </div>

      <div style={{ display:'flex', gap:12, flexWrap:'wrap', padding:'8px 14px', borderTop:'1px solid #D3C7AE', fontSize:10.5, color:'#6B6357', background:'#E3DAC5', alignItems:'center' }}>
        {Object.entries(RARITY).map(([k,r])=>(
          <span key={k} style={{ display:'flex', alignItems:'center', gap:4 }}>
            <span style={{ width:9, height:9, borderRadius:2, background:r.c }} />{r.l}
          </span>
        ))}
        <span style={{ display:'flex', alignItems:'center', gap:4, opacity:.65 }}>
          <span style={{ width:9, height:9, borderRadius:2, background:'#CFC3A8' }} />Non observée
        </span>
        <span style={{ marginLeft:'auto', color:'#9A9081' }}>Clique pour déployer · molette pour zoomer</span>
      </div>
    </div>
  )
}

const btn = { fontSize:10.5, padding:'5px 9px', borderRadius:12, background:'#EDE7D8', color:'#6B6357', border:'1px solid #D3C7AE' }

function Card({ n, lang, expanded, toggle, onSp }) {
  const open = expanded.has(n.id)
  const hasKids = n.children?.length > 0
  const base = {
    position:'absolute', left:n.x - CARD_W/2, top:n.y - CARD_H/2,
    width:CARD_W, height:CARD_H, borderRadius:12, overflow:'hidden',
    display:'flex', flexDirection:'column', justifyContent:'flex-end',
    padding:8, textAlign:'left', border:'none', cursor:'pointer',
    boxShadow: open ? '0 3px 12px rgba(43,38,32,.18)' : '0 1px 4px rgba(43,38,32,.08)',
    transition:'box-shadow .15s, transform .15s', userSelect:'none',
  }

  if (n.kind === 'root') return (
    <button onClick={toggle} style={{ ...base, width:CARD_W+30, left:n.x-(CARD_W+30)/2, background:'linear-gradient(150deg,#22301C,#5A7248)' }}>
      <span style={{ position:'absolute', top:7, left:9, fontSize:19 }}>{n.e}</span>
      <span className="serif" style={{ fontSize:14, fontWeight:900, color:'#F2EEE2' }}>{n.label}</span>
    </button>
  )

  if (n.kind === 'cat') {
    const all = SPECIES.filter(s=>s.cat===n.cat.id)
    const obs = all.filter(isObserved).length
    return (
      <button onClick={toggle} style={{ ...base, background:gradientForCat(n.cat.id) }}>
        <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top, rgba(18,20,14,.62), transparent 58%)' }} />
        <span style={{ position:'absolute', top:6, left:8, fontSize:17 }}>{n.e}</span>
        {hasKids && <Chev open={open} />}
        <span style={{ position:'relative', fontSize:10.5, fontWeight:700, color:'#F2EEE2', lineHeight:1.15 }}>{catNameOf(n.cat, lang).main}</span>
        {catNameOf(n.cat, lang).sub && <span style={{ position:'relative', fontSize:7.5, color:'rgba(242,238,226,.5)', lineHeight:1.1 }}>{catNameOf(n.cat, lang).sub}</span>}
        <span style={{ position:'relative', fontSize:8.5, color:'rgba(242,238,226,.75)' }}>{obs}/{all.length}</span>
      </button>
    )
  }

  if (n.kind === 'fam') {
    const m = n.members || []
    const obs = m.filter(isObserved).length
    return (
      <button onClick={toggle} style={{ ...base, background:'#D9CDB2', justifyContent:'center', alignItems:'flex-start' }}>
        {hasKids && <Chev open={open} dark />}
        <span style={{ fontSize:10, fontWeight:700, color:'#3F382C', lineHeight:1.2 }}>{n.label}</span>
        <span style={{ fontSize:8, color:'#8A8172', fontStyle:'italic', marginTop:2 }}>{n.sub}</span>
        <span style={{ fontSize:8.5, color:'#6B6357', marginTop:3 }}>{obs}/{m.length}</span>
      </button>
    )
  }

  const sp = n.sp, o = isObserved(sp), r = RARITY[sp.r]
  return (
    <button onClick={onSp} style={{ ...base, background:'#DDD3BE', opacity:o?1:.68 }}>
      {o
        ? <PhotoBg target={`sp:${sp.id}`} fallback={gradientFor(sp.id)} />
        : <div style={{ position:'absolute', inset:0, background:'#DDD3BE' }} />}
      {o && <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top, rgba(16,18,12,.66), transparent 55%)' }} />}
      <span style={{ position:'absolute', top:6, left:8, fontSize:17, filter:o?'none':'grayscale(.65)' }}>{sp.e}</span>
      <span style={{ position:'absolute', top:8, right:8, width:8, height:8, borderRadius:2, background:o?r.c:'#BFB39A' }} />
      <span style={{ position:'relative', fontSize:9.5, fontWeight:o?700:500, color:o?'#F2EEE2':'#5A5245', lineHeight:1.12 }}>{nameOf(sp, lang).main}</span>
      {nameOf(sp, lang).sub && <span style={{ position:'relative', fontSize:7.5, color:o?'rgba(242,238,226,.5)':'rgba(90,82,69,.45)', lineHeight:1.1, marginTop:1 }}>{nameOf(sp, lang).sub}</span>}
    </button>
  )
}

function Chev({ open, dark }) {
  return (
    <span style={{ position:'absolute', top:6, right:7, width:15, height:15, borderRadius:5,
      background: dark?'rgba(107,99,87,.16)':'rgba(255,255,255,.22)',
      display:'flex', alignItems:'center', justifyContent:'center' }}>
      <span style={{ fontSize:9, color: dark?'#5A5245':'#F2EEE2', transform:open?'rotate(180deg)':'none', transition:'transform .18s', lineHeight:1 }}>▾</span>
    </span>
  )
}
