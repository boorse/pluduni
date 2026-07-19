import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { CATS, SPECIES, RARITY, isObserved } from './data'
import { gradientFor, gradientForCat } from './gradients.js'

// ── Arbre descendant : chaque ouverture repousse les voisins ──
// Layout "tidy tree" : on alloue à chaque nœud une largeur = nb de feuilles visibles

const CARD_W = 92
const CARD_H = 68
const GAP_X  = 14
const LEVEL_Y = 122

export default function MindMap({ onSelectSpecies }) {
  const [expanded, setExpanded] = useState(() => new Set())
  const [tf, setTf] = useState({ x: 0, y: 0, k: 1 })
  const wrapRef = useRef(null)
  const drag = useRef({ on: false, sx: 0, sy: 0, ox: 0, oy: 0 })

  const toggle = useCallback((id) => {
    setExpanded(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
        // referme les descendants
        for (const k of [...next]) if (k.startsWith(id + ':')) next.delete(k)
      } else next.add(id)
      return next
    })
  }, [])

  // ── Construction de l'arbre + calcul de largeur ──
  const { nodes, links, width, height } = useMemo(() => {
    // 1. arbre logique
    const root = {
      id: 'root', kind: 'root', label: 'Pluduni', e: '🌿',
      children: CATS.map(cat => ({
        id: cat.id, kind: 'cat', label: cat.n, sub: cat.lat, e: cat.e, cat,
        children: cat.subs.map(s => ({
          id: cat.id + ':' + s.id, kind: 'fam', label: s.id, sub: s.lat,
          members: SPECIES.filter(sp => sp.cat === cat.id && sp.sub === s.id),
          children: SPECIES.filter(sp => sp.cat === cat.id && sp.sub === s.id)
            .map(sp => ({ id: cat.id + ':' + s.id + ':' + sp.id, kind: 'sp', sp, label: sp.n, children: [] }))
        }))
      }))
    }

    // 2. largeur en "unités feuille"
    const measure = (n) => {
      const open = n.kind === 'root' ? true : expanded.has(n.id)
      if (!open || !n.children.length) { n.units = 1; return 1 }
      n.units = n.children.reduce((s, c) => s + measure(c), 0)
      return n.units
    }
    measure(root)

    // 3. positions
    const nodes = [], links = []
    const place = (n, left, depth) => {
      const w = n.units * (CARD_W + GAP_X)
      const cx = left + w / 2
      const cy = depth * LEVEL_Y + 50
      n.x = cx; n.y = cy
      nodes.push(n)
      const open = n.kind === 'root' ? true : expanded.has(n.id)
      if (open && n.children.length) {
        let cursor = left
        n.children.forEach(c => {
          const cw = c.units * (CARD_W + GAP_X)
          place(c, cursor, depth + 1)
          links.push({ x1: cx, y1: cy + CARD_H / 2, x2: c.x, y2: c.y - CARD_H / 2, depth })
          cursor += cw
        })
      }
    }
    place(root, 0, 0)

    const width = root.units * (CARD_W + GAP_X) + 60
    const maxDepth = Math.max(...nodes.map(n => n.y))
    return { nodes, links, width, height: maxDepth + CARD_H + 60 }
  }, [expanded])

  // ── centrage initial / au changement ──
  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const vw = el.clientWidth
    const k = Math.min(1, (vw - 40) / width)
    setTf(t => ({ x: (vw - width * k) / 2, y: 0, k: Math.max(0.35, k) }))
  }, [width])

  const onWheel = useCallback((e) => {
    e.preventDefault()
    setTf(t => ({ ...t, k: Math.min(2.2, Math.max(0.3, t.k * (1 - e.deltaY * 0.0013))) }))
  }, [])
  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [onWheel])

  const down = (e) => { const p = e.touches ? e.touches[0] : e; drag.current = { on: true, sx: p.clientX, sy: p.clientY, ox: tf.x, oy: tf.y } }
  const move = (e) => {
    if (!drag.current.on) return
    const p = e.touches ? e.touches[0] : e
    setTf(t => ({ ...t, x: drag.current.ox + (p.clientX - drag.current.sx), y: drag.current.oy + (p.clientY - drag.current.sy) }))
  }
  const up = () => { drag.current.on = false }

  const recenter = () => {
    const el = wrapRef.current; if (!el) return
    const vw = el.clientWidth
    const k = Math.min(1, (vw - 40) / width)
    setTf({ x: (vw - width * k) / 2, y: 0, k: Math.max(0.35, k) })
  }

  return (
    <div style={{ position:'relative', height:'100%', display:'flex', flexDirection:'column', background:'#E3DAC5' }}>
      <div style={{ position:'absolute', top:9, right:10, zIndex:5, display:'flex', gap:5 }}>
        <button onClick={()=>setExpanded(new Set())} style={btn}>Tout replier</button>
        <button onClick={recenter} style={btn}>Recentrer</button>
      </div>

      <div ref={wrapRef}
        onMouseDown={down} onMouseMove={move} onMouseUp={up} onMouseLeave={up}
        onTouchStart={down} onTouchMove={move} onTouchEnd={up}
        style={{ flex:1, minHeight:340, overflow:'hidden', cursor: drag.current.on?'grabbing':'grab', touchAction:'none', position:'relative' }}>
        <div style={{ position:'absolute', transformOrigin:'0 0', transform:`translate(${tf.x}px,${tf.y}px) scale(${tf.k})`, willChange:'transform' }}>
          <svg width={width} height={height} style={{ position:'absolute', top:0, left:0, pointerEvents:'none' }}>
            {links.map((l,i)=>{
              const my = (l.y1 + l.y2) / 2
              return <path key={i} d={`M${l.x1},${l.y1} C${l.x1},${my} ${l.x2},${my} ${l.x2},${l.y2}`}
                fill="none" stroke={l.depth===0?'#B9AC8E':'#CCC0A6'} strokeWidth={l.depth===0?2:1.4} />
            })}
          </svg>

          {nodes.map(n => <Card key={n.id} n={n} expanded={expanded} toggle={toggle} onSelectSpecies={onSelectSpecies} />)}
          <div style={{ width, height }} />
        </div>
      </div>

      <div style={{ display:'flex', gap:12, flexWrap:'wrap', padding:'8px 14px', borderTop:'1px solid #D3C7AE', fontSize:10.5, color:'#6B6357', background:'#E3DAC5' }}>
        {Object.entries(RARITY).map(([k,r])=>(
          <span key={k} style={{ display:'flex', alignItems:'center', gap:4 }}>
            <span style={{ width:9, height:9, borderRadius:2, background:r.c }} />{r.l}
          </span>
        ))}
        <span style={{ display:'flex', alignItems:'center', gap:4, opacity:.65 }}>
          <span style={{ width:9, height:9, borderRadius:2, background:'#CFC3A8' }} />Non observée
        </span>
        <span style={{ marginLeft:'auto', color:'#9A9081' }}>Clique une carte pour déployer</span>
      </div>
    </div>
  )
}

const btn = {
  fontSize:10.5, padding:'5px 9px', borderRadius:12, background:'#EDE7D8',
  color:'#6B6357', border:'1px solid #D3C7AE'
}

function Card({ n, expanded, toggle, onSelectSpecies }) {
  const open = expanded.has(n.id)
  const hasKids = n.children?.length > 0
  const style = {
    position:'absolute', left:n.x - CARD_W/2, top:n.y - CARD_H/2,
    width:CARD_W, height:CARD_H, borderRadius:12, overflow:'hidden',
    display:'flex', flexDirection:'column', justifyContent:'flex-end',
    padding:8, textAlign:'left', border:'none', cursor:'pointer',
    boxShadow: open ? '0 3px 12px rgba(43,38,32,0.18)' : '0 1px 4px rgba(43,38,32,0.08)',
    transition:'box-shadow .15s',
  }

  if (n.kind === 'root') {
    return (
      <button onClick={()=>toggle('root')} style={{ ...style, width:CARD_W+26, left:n.x-(CARD_W+26)/2, background:'linear-gradient(150deg,#22301C,#5A7248)' }}>
        <span style={{ position:'absolute', top:7, left:9, fontSize:19 }}>{n.e}</span>
        <span className="serif" style={{ fontSize:14, fontWeight:900, color:'#F2EEE2', lineHeight:1.05 }}>{n.label}</span>
      </button>
    )
  }

  if (n.kind === 'cat') {
    const all = SPECIES.filter(s=>s.cat===n.cat.id)
    const obs = all.filter(isObserved).length
    return (
      <button onClick={()=>toggle(n.id)} style={{ ...style, background:gradientForCat(n.cat.id) }}>
        <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top, rgba(18,20,14,0.62), transparent 58%)' }} />
        <span style={{ position:'absolute', top:6, left:8, fontSize:17 }}>{n.e}</span>
        {hasKids && <Chevron open={open} />}
        <span style={{ position:'relative', fontSize:10.5, fontWeight:700, color:'#F2EEE2', lineHeight:1.15 }}>{n.label}</span>
        <span style={{ position:'relative', fontSize:8.5, color:'rgba(242,238,226,0.75)', marginTop:1 }}>{obs}/{all.length}</span>
      </button>
    )
  }

  if (n.kind === 'fam') {
    const members = n.members || []
    const obs = members.filter(isObserved).length
    return (
      <button onClick={()=>toggle(n.id)} style={{ ...style, background:'#D9CDB2', justifyContent:'center' }}>
        {hasKids && <Chevron open={open} dark />}
        <span style={{ fontSize:10, fontWeight:700, color:'#3F382C', lineHeight:1.2 }}>{n.label}</span>
        <span style={{ fontSize:8, color:'#8A8172', fontStyle:'italic', marginTop:2 }}>{n.sub}</span>
        <span style={{ fontSize:8.5, color:'#6B6357', marginTop:3 }}>{obs}/{members.length}</span>
      </button>
    )
  }

  // espèce
  const sp = n.sp
  const o = isObserved(sp)
  const r = RARITY[sp.r]
  return (
    <button onClick={()=>onSelectSpecies(sp.id)}
      style={{ ...style, background: o ? gradientFor(sp.id) : '#DDD3BE', opacity: o?1:0.68 }}>
      {o && <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top, rgba(16,18,12,0.66), transparent 55%)' }} />}
      <span style={{ position:'absolute', top:6, left:8, fontSize:17, filter:o?'none':'grayscale(.65)' }}>{sp.e}</span>
      <span style={{ position:'absolute', top:8, right:8, width:8, height:8, borderRadius:2, background:o?r.c:'#BFB39A' }} />
      <span style={{ position:'relative', fontSize:9.5, fontWeight:o?700:500, color:o?'#F2EEE2':'#5A5245', lineHeight:1.15 }}>{sp.n}</span>
    </button>
  )
}

function Chevron({ open, dark }) {
  return (
    <span style={{ position:'absolute', top:6, right:7, width:15, height:15, borderRadius:5,
      background: dark?'rgba(107,99,87,0.16)':'rgba(255,255,255,0.22)',
      display:'flex', alignItems:'center', justifyContent:'center' }}>
      <span style={{ fontSize:9, color: dark?'#5A5245':'#F2EEE2', transform:open?'rotate(180deg)':'none', transition:'transform .18s', lineHeight:1 }}>▾</span>
    </span>
  )
}
