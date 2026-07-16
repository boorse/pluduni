import { useState, useRef, useEffect, useCallback } from 'react'
import { CATS, SPECIES, RARITY, isObserved } from './data'

// Mindmap à nœuds flottants — drag, zoom molette, déploiement au clic
export default function MindMap({ onSelectSpecies, editMode }) {
  const [transform, setTransform] = useState({ x: 0, y: 0, k: 1 })
  const [expanded, setExpanded] = useState(() => new Set(['root']))
  const svgRef = useRef(null)
  const drag = useRef({ active: false, sx: 0, sy: 0, ox: 0, oy: 0 })

  const toggle = useCallback((id) => {
    setExpanded(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
        // referme aussi les enfants (catégories -> familles)
        CATS.forEach(c => { if (c.id === id) c.subs.forEach(s => next.delete(id + ':' + s.id)) })
      } else next.add(id)
      return next
    })
  }, [])

  const onWheel = useCallback((e) => {
    e.preventDefault()
    const delta = -e.deltaY * 0.0015
    setTransform(t => {
      const k = Math.min(2.5, Math.max(0.4, t.k * (1 + delta)))
      return { ...t, k }
    })
  }, [])

  useEffect(() => {
    const svg = svgRef.current
    if (!svg) return
    svg.addEventListener('wheel', onWheel, { passive: false })
    return () => svg.removeEventListener('wheel', onWheel)
  }, [onWheel])

  const onDown = (e) => {
    const pt = e.touches ? e.touches[0] : e
    drag.current = { active: true, sx: pt.clientX, sy: pt.clientY, ox: transform.x, oy: transform.y }
  }
  const onMove = (e) => {
    if (!drag.current.active) return
    const pt = e.touches ? e.touches[0] : e
    setTransform(t => ({ ...t, x: drag.current.ox + (pt.clientX - drag.current.sx), y: drag.current.oy + (pt.clientY - drag.current.sy) }))
  }
  const onUp = () => { drag.current.active = false }

  // ── Layout : centre = Pluduni, anneau 1 = catégories, anneau 2 = familles, anneau 3 = espèces
  const CX = 500, CY = 380
  const nodes = []
  const links = []

  nodes.push({ id: 'root', x: CX, y: CY, r: 46, kind: 'root', label: 'Pluduni', e: '🌿' })

  const catCount = CATS.length
  CATS.forEach((cat, ci) => {
    const ang = (2 * Math.PI / catCount) * ci - Math.PI / 2
    const cx = CX + Math.cos(ang) * 200
    const cy = CY + Math.sin(ang) * 200
    const catSpecies = SPECIES.filter(s => s.cat === cat.id)
    const obsCount = catSpecies.filter(isObserved).length
    links.push({ x1: CX, y1: CY, x2: cx, y2: cy, main: true })
    nodes.push({ id: cat.id, x: cx, y: cy, r: 34, kind: 'cat', label: cat.n, e: cat.e, ang, sub: `${obsCount}/${catSpecies.length}` })

    if (expanded.has(cat.id)) {
      const subs = cat.subs
      subs.forEach((sub, si) => {
        const spread = 1.5
        const subAng = ang + (si - (subs.length - 1) / 2) * (spread / Math.max(subs.length, 3))
        const sx = cx + Math.cos(subAng) * 130
        const sy = cy + Math.sin(subAng) * 130
        const subKey = cat.id + ':' + sub.id
        const members = catSpecies.filter(s => s.sub === sub.id)
        const subObs = members.filter(isObserved).length
        links.push({ x1: cx, y1: cy, x2: sx, y2: sy })
        nodes.push({ id: subKey, x: sx, y: sy, r: 24, kind: 'sub', label: sub.id, ang: subAng, sub: `${subObs}/${members.length}` })

        if (expanded.has(subKey)) {
          members.forEach((sp, mi) => {
            const mAng = subAng + (mi - (members.length - 1) / 2) * 0.45
            const mx = sx + Math.cos(mAng) * 88
            const my = sy + Math.sin(mAng) * 88
            links.push({ x1: sx, y1: sy, x2: mx, y2: my, leaf: true })
            nodes.push({ id: 'sp:' + sp.id, x: mx, y: my, r: 20, kind: 'species', sp, label: sp.n.split(' ')[0], e: sp.e })
          })
        }
      })
    }
  })

  return (
    <div style={{ position: 'relative', background: 'var(--surface)', borderRadius: 16, overflow: 'hidden', border: '1px solid var(--line)' }}>
      <div style={{ position: 'absolute', top: 12, left: 14, zIndex: 3, fontSize: 12, color: 'var(--ink-mute)', fontFamily: 'Inter', pointerEvents: 'none' }}>
        Glisse pour te déplacer · molette pour zoomer · clique un nœud pour déployer
      </div>
      <div style={{ position: 'absolute', top: 10, right: 12, zIndex: 3, display: 'flex', gap: 6 }}>
        <button onClick={() => setTransform({ x: 0, y: 0, k: 1 })} style={{ fontSize: 11, padding: '5px 10px', borderRadius: 16, background: 'var(--bg)', color: 'var(--ink-soft)', border: '1px solid var(--line)' }}>Recentrer</button>
      </div>
      <svg
        ref={svgRef}
        viewBox="0 0 1000 760"
        style={{ width: '100%', height: 480, cursor: drag.current.active ? 'grabbing' : 'grab', touchAction: 'none', display: 'block' }}
        onMouseDown={onDown} onMouseMove={onMove} onMouseUp={onUp} onMouseLeave={onUp}
        onTouchStart={onDown} onTouchMove={onMove} onTouchEnd={onUp}
      >
        <g transform={`translate(${transform.x},${transform.y}) scale(${transform.k})`} style={{ transformOrigin: 'center' }}>
          {links.map((l, i) => (
            <line key={i} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2}
              stroke={l.main ? '#C3B79A' : l.leaf ? '#DAD0BA' : '#CFC3A8'}
              strokeWidth={l.main ? 2 : 1.2}
              strokeDasharray={l.main ? '6,4' : 'none'} />
          ))}
          {nodes.map((n) => {
            if (n.kind === 'root') return (
              <g key={n.id} style={{ cursor: 'pointer' }} onClick={() => toggle('root')}>
                <circle cx={n.x} cy={n.y} r={n.r} fill="#4A5D32" stroke="#3B4A28" strokeWidth="2" />
                <text x={n.x} y={n.y - 6} textAnchor="middle" fontSize="26" style={{ pointerEvents: 'none' }}>{n.e}</text>
                <text x={n.x} y={n.y + 18} textAnchor="middle" fontSize="14" fill="#EDE7D8" fontFamily="Fraunces,serif" fontWeight="600" style={{ pointerEvents: 'none' }}>{n.label}</text>
              </g>
            )
            if (n.kind === 'cat') return (
              <g key={n.id} style={{ cursor: 'pointer' }} onClick={() => toggle(n.id)}>
                <circle cx={n.x} cy={n.y} r={n.r} fill="#C08A3E" stroke="#A06D28" strokeWidth="1.5" />
                <text x={n.x} y={n.y - 4} textAnchor="middle" fontSize="20" style={{ pointerEvents: 'none' }}>{n.e}</text>
                <text x={n.x} y={n.y + 15} textAnchor="middle" fontSize="9.5" fill="#3D2A0E" fontFamily="Inter" fontWeight="600" style={{ pointerEvents: 'none' }}>{n.label}</text>
                <text x={n.x} y={n.y + n.r + 13} textAnchor="middle" fontSize="9" fill="#9A9081" fontFamily="Inter" style={{ pointerEvents: 'none' }}>{n.sub}</text>
              </g>
            )
            if (n.kind === 'sub') return (
              <g key={n.id} style={{ cursor: 'pointer' }} onClick={() => toggle(n.id)}>
                <circle cx={n.x} cy={n.y} r={n.r} fill="#D9CDB2" stroke="#C3B79A" strokeWidth="1.2" />
                <text x={n.x} y={n.y + 1} textAnchor="middle" fontSize="8.5" fill="#5A5040" fontFamily="Inter" fontWeight="600" style={{ pointerEvents: 'none' }}>{n.label}</text>
                <text x={n.x} y={n.y + n.r + 11} textAnchor="middle" fontSize="8" fill="#9A9081" fontFamily="Inter" style={{ pointerEvents: 'none' }}>{n.sub}</text>
              </g>
            )
            // species
            const obs = isObserved(n.sp)
            const rc = RARITY[n.sp.r].c
            return (
              <g key={n.id} style={{ cursor: 'pointer' }} onClick={() => onSelectSpecies(n.sp.id)}>
                <circle cx={n.x} cy={n.y} r={n.r}
                  fill={obs ? rc : '#E0D8C6'}
                  stroke={obs ? rc : '#CFC3A8'}
                  strokeWidth={obs ? 2 : 1}
                  opacity={obs ? 1 : 0.55} />
                <text x={n.x} y={n.y + 1} textAnchor="middle" fontSize="15" style={{ pointerEvents: 'none', opacity: obs ? 1 : 0.5 }}>{n.e}</text>
                <text x={n.x} y={n.y + n.r + 11} textAnchor="middle" fontSize="8.5"
                  fill={obs ? '#4A4030' : '#B0A794'} fontFamily="Inter" fontWeight={obs ? 600 : 400}
                  style={{ pointerEvents: 'none' }}>{n.label}</text>
              </g>
            )
          })}
        </g>
      </svg>
      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', padding: '10px 14px', borderTop: '1px solid var(--line)', fontSize: 11, color: 'var(--ink-soft)', fontFamily: 'Inter' }}>
        {Object.entries(RARITY).map(([k, r]) => (
          <span key={k} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 11, height: 11, borderRadius: '50%', background: r.c, display: 'inline-block' }} />{r.l}
          </span>
        ))}
        <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <span style={{ width: 11, height: 11, borderRadius: '50%', background: '#E0D8C6', border: '1px solid #CFC3A8', display: 'inline-block', opacity: 0.6 }} />Créée, non observée
        </span>
      </div>
    </div>
  )
}
