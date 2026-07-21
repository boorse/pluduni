import { useState, useRef, useEffect, useCallback, useMemo } from 'react'

// ── Carte satellite à tuiles — aucune interface tierce ──
// Tuiles Esri World Imagery (libres d'accès, sans clé)
const TILE = (z,x,y) => `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${z}/${y}/${x}`
const TS = 256

const lon2x = (lon, z) => ((lon + 180) / 360) * Math.pow(2, z)
const lat2y = (lat, z) => {
  const r = lat * Math.PI / 180
  return ((1 - Math.log(Math.tan(r) + 1 / Math.cos(r)) / Math.PI) / 2) * Math.pow(2, z)
}
const x2lon = (x, z) => (x / Math.pow(2, z)) * 360 - 180
const y2lat = (y, z) => {
  const n = Math.PI - 2 * Math.PI * y / Math.pow(2, z)
  return 180 / Math.PI * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)))
}

export default function SatMap({ center, pins = [], selected, onSelect, onMapClick, height = 520, addMode = false }) {
  const [z, setZ] = useState(16)
  const [c, setC] = useState(center)          // {lat, lon} au centre
  const wrapRef = useRef(null)
  const [size, setSize] = useState({ w: 800, h: height })
  const drag = useRef({ on: false, sx: 0, sy: 0, clat: 0, clon: 0, moved: false })

  useEffect(() => {
    const el = wrapRef.current; if (!el) return
    const ro = new ResizeObserver(() => setSize({ w: el.clientWidth, h: el.clientHeight }))
    ro.observe(el); setSize({ w: el.clientWidth, h: el.clientHeight })
    return () => ro.disconnect()
  }, [])

  useEffect(() => { setC(center) }, [center.lat, center.lon])

  // pixel du centre dans la grille mondiale
  const cx = lon2x(c.lon, z) * TS
  const cy = lat2y(c.lat, z) * TS
  const originX = cx - size.w / 2
  const originY = cy - size.h / 2

  const tiles = useMemo(() => {
    const out = []
    const n = Math.pow(2, z)
    const x0 = Math.floor(originX / TS) - 1, x1 = Math.floor((originX + size.w) / TS) + 1
    const y0 = Math.floor(originY / TS) - 1, y1 = Math.floor((originY + size.h) / TS) + 1
    for (let x = x0; x <= x1; x++) for (let y = y0; y <= y1; y++) {
      if (y < 0 || y >= n) continue
      const wx = ((x % n) + n) % n
      out.push({ key: `${z}/${x}/${y}`, url: TILE(z, wx, y), left: x * TS - originX, top: y * TS - originY })
    }
    return out
  }, [z, originX, originY, size.w, size.h])

  const toScreen = useCallback((lat, lon) => ({
    left: lon2x(lon, z) * TS - originX,
    top: lat2y(lat, z) * TS - originY,
  }), [z, originX, originY])

  const down = (e) => {
    const p = e.touches ? e.touches[0] : e
    drag.current = { on: true, sx: p.clientX, sy: p.clientY, clat: c.lat, clon: c.lon, moved: false }
  }
  const move = (e) => {
    if (!drag.current.on) return
    const p = e.touches ? e.touches[0] : e
    const dx = p.clientX - drag.current.sx, dy = p.clientY - drag.current.sy
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) drag.current.moved = true
    const px = lon2x(drag.current.clon, z) * TS - dx
    const py = lat2y(drag.current.clat, z) * TS - dy
    setC({ lon: x2lon(px / TS, z), lat: y2lat(py / TS, z) })
  }
  const up = () => { drag.current.on = false }

  const wheel = useCallback((e) => {
    e.preventDefault()
    const el = wrapRef.current; if (!el) return
    const r = el.getBoundingClientRect()
    const mx = e.clientX - r.left, my = e.clientY - r.top
    const dz = e.deltaY < 0 ? 1 : -1
    const nz = Math.max(3, Math.min(19, z + dz))
    if (nz === z) return
    // garder le point sous le curseur
    const lon = x2lon((originX + mx) / TS, z)
    const lat = y2lat((originY + my) / TS, z)
    const nx = lon2x(lon, nz) * TS, ny = lat2y(lat, nz) * TS
    setZ(nz)
    setC({ lon: x2lon((nx - mx + size.w / 2) / TS, nz), lat: y2lat((ny - my + size.h / 2) / TS, nz) })
  }, [z, originX, originY, size.w, size.h])

  useEffect(() => {
    const el = wrapRef.current; if (!el) return
    el.addEventListener('wheel', wheel, { passive: false })
    return () => el.removeEventListener('wheel', wheel)
  }, [wheel])

  const click = (e) => {
    if (drag.current.moved || !addMode || !onMapClick) return
    const r = wrapRef.current.getBoundingClientRect()
    const mx = e.clientX - r.left, my = e.clientY - r.top
    onMapClick({ lat: y2lat((originY + my) / TS, z), lon: x2lon((originX + mx) / TS, z) })
  }

  return (
    <div ref={wrapRef}
      onMouseDown={down} onMouseMove={move} onMouseUp={up} onMouseLeave={up}
      onTouchStart={down} onTouchMove={move} onTouchEnd={up}
      onClick={click} onDragStart={e=>e.preventDefault()}
      style={{ position:'relative', width:'100%', height, overflow:'hidden', background:'#1E2418',
        cursor: addMode ? 'crosshair' : (drag.current.on ? 'grabbing' : 'grab'),
        touchAction:'none', userSelect:'none' }}>
      {tiles.map(t => (
        <img key={t.key} src={t.url} alt="" draggable={false}
          style={{ position:'absolute', left:t.left, top:t.top, width:TS, height:TS, display:'block', pointerEvents:'none' }} />
      ))}

      {pins.map(p => {
        const s = toScreen(p.lat, p.lon)
        if (s.left < -60 || s.top < -60 || s.left > size.w + 60 || s.top > size.h + 60) return null
        const on = selected?.id === p.id
        return (
          <button key={p.id} onClick={(e)=>{ e.stopPropagation(); if(!drag.current.moved) onSelect?.(on ? null : p) }}
            style={{ position:'absolute', left:s.left, top:s.top, transform:'translate(-50%,-100%)',
              display:'flex', flexDirection:'column', alignItems:'center', zIndex:on?5:3, padding:0 }}>
            <span style={{ width:on?30:24, height:on?30:24, borderRadius:'50%', background:p.color,
              border:`2px solid ${on?'#fff':'rgba(255,255,255,.8)'}`, display:'flex', alignItems:'center',
              justifyContent:'center', fontSize:on?14:11.5, boxShadow:'0 2px 9px rgba(0,0,0,.45)',
              transition:'all .16s' }}>{p.emoji}</span>
            <span style={{ width:2, height:8, background:p.color, boxShadow:'0 1px 3px rgba(0,0,0,.4)' }} />
            {on && <span style={{ marginTop:2, fontSize:10, background:'rgba(20,22,14,.88)', color:'#F2EEE2',
              padding:'2px 7px', borderRadius:8, whiteSpace:'nowrap' }}>{p.label}</span>}
          </button>
        )
      })}

      {/* contrôles minimalistes */}
      <div style={{ position:'absolute', right:10, bottom:10, display:'flex', flexDirection:'column', gap:5, zIndex:6 }}>
        {[['+',1],['−',-1]].map(([l,d])=>(
          <button key={l} onClick={(e)=>{ e.stopPropagation(); setZ(v=>Math.max(3,Math.min(19,v+d))) }}
            style={{ width:30, height:30, borderRadius:8, background:'rgba(20,22,14,.72)', color:'#F2EEE2',
              fontSize:16, fontWeight:600, display:'flex', alignItems:'center', justifyContent:'center' }}>{l}</button>
        ))}
      </div>
      <div style={{ position:'absolute', left:9, bottom:8, fontSize:8.5, color:'rgba(242,238,226,.4)', zIndex:6, pointerEvents:'none' }}>
        Esri World Imagery
      </div>
    </div>
  )
}
