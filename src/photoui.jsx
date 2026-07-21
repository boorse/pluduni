import { useState, useEffect, useRef, useSyncExternalStore } from 'react'
import { sb } from './supabase.js'
import { photosFor, addPhotoRec, removePhoto, subscribe, allPlayers, getMe } from './store.js'

export const LUT = 'sepia(0.28) saturate(1.22) hue-rotate(342deg) brightness(0.97) contrast(1.06)'

const T = { bg:'#EDE7D8', card:'#E6DDC8', ink:'#2B2620', soft:'#6B6357',
  mute:'#9A9081', line:'#D3C7AE', clay:'#B5602F', sageDark:'#4A5D32' }

// chemin de la miniature déduit du chemin principal
export const thumbOf = (path) => path ? path.replace(/\.jpg$/, '_t.jpg') : path

export function compress(file, maxSide = 1600, quality = 0.82) {
  return new Promise((res, rej) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(url)
      let { width:w, height:h } = img
      if (Math.max(w,h) > maxSide) { const r = maxSide/Math.max(w,h); w = Math.round(w*r); h = Math.round(h*r) }
      const c = document.createElement('canvas')
      c.width = w; c.height = h
      c.getContext('2d').drawImage(img, 0, 0, w, h)
      c.toBlob(b => b ? res(b) : rej(new Error('compression échouée')), 'image/jpeg', quality)
    }
    img.onerror = () => { URL.revokeObjectURL(url); rej(new Error('image illisible')) }
    img.src = url
  })
}

// lecture depuis le cache central — aucune requête réseau
const EMPTY = []
export function usePhotos(target) {
  const photos = useSyncExternalStore(
    subscribe,
    () => photosFor(target),
    () => EMPTY
  )
  return { photos }
}

// ── Fond photo : jamais de superposition, pas de clignotement ──
export function PhotoBg({ target, fallback, rounded = 0, thumb = true }) {
  const { photos } = usePhotos(target)
  const cover = photos[0]
  const src = cover ? (thumb && cover.thumbUrl ? cover.thumbUrl : cover.url) : null
  return (
    <div style={{ position:'absolute', inset:0, borderRadius:rounded, overflow:'hidden',
      background: cover ? '#1E2418' : fallback }}>
      {src && (
        <img src={src} alt="" loading="lazy" decoding="async" draggable={false}
          style={{ width:'100%', height:'100%', objectFit:'cover', filter:LUT, display:'block' }} />
      )}
    </div>
  )
}

export function PhotoButton({ onClick, small }) {
  return (
    <button onClick={(e)=>{ e.stopPropagation(); onClick() }}
      style={{ display:'inline-flex', alignItems:'center', gap:5, background:'rgba(0,0,0,.45)',
        color:'#fff', borderRadius:12, padding: small?'3px 8px':'5px 10px', fontSize: small?10:11.5, fontWeight:600 }}>
      <i className="ti ti-camera-plus" style={{ fontSize: small?12:14 }} aria-hidden="true" />
    </button>
  )
}

export function PhotoManager({ target, label, lang, onClose }) {
  const { photos } = usePhotos(target)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState(null)
  const [caption, setCaption] = useState('')
  const [by, setBy] = useState(getMe() || allPlayers()[0]?.name || '')
  const inputRef = useRef(null)

  const handle = async (files) => {
    if (!files?.length) return
    setBusy(true); setErr(null)
    try {
      for (const f of files) {
        if (!f.type.startsWith('image/')) continue
        const [blob, thumb] = await Promise.all([compress(f, 1600, 0.82), compress(f, 260, 0.72)])
        const base = `${String(target).replace(/[^a-zA-Z0-9_-]/g,'_')}/${Date.now()}_${Math.random().toString(36).slice(2,7)}`
        const path = base + '.jpg'
        const up = await sb.storage.from('photos').upload(path, blob, { contentType:'image/jpeg' })
        if (up.error) throw new Error(up.error.message)
        await sb.storage.from('photos').upload(base + '_t.jpg', thumb, { contentType:'image/jpeg' })
        await addPhotoRec({ target, path, caption, by })
      }
      setCaption('')
    } catch (e) { setErr(e.message || 'Import impossible') }
    setBusy(false)
  }

  return (
    <div onClick={onClose} style={{ position:'fixed', inset:0, background:'rgba(43,38,32,.6)', zIndex:120,
      display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
      <div onClick={e=>e.stopPropagation()} style={{ background:T.bg, borderRadius:18, width:'100%',
        maxWidth:620, maxHeight:'88vh', overflow:'auto', border:`1px solid ${T.line}` }}>
        <div style={{ position:'sticky', top:0, background:T.bg, borderBottom:`1px solid ${T.line}`,
          padding:'14px 18px', display:'flex', alignItems:'center', gap:10, zIndex:2 }}>
          <i className="ti ti-photo" style={{ fontSize:19, color:T.clay }} aria-hidden="true" />
          <div style={{ flex:1 }}>
            <div className="serif" style={{ fontSize:17, fontWeight:900, color:T.ink }}>Photos</div>
            <div style={{ fontSize:11.5, color:T.mute }}>{label}</div>
          </div>
          <button onClick={onClose} style={{ width:28, height:28, borderRadius:'50%',
            border:`1px solid ${T.line}`, color:T.soft }}>✕</button>
        </div>
        <div style={{ padding:'14px 18px 20px' }}>
          <div onDrop={(e)=>{ e.preventDefault(); handle([...e.dataTransfer.files]) }}
            onDragOver={e=>e.preventDefault()} onClick={()=>inputRef.current?.click()}
            style={{ border:`2px dashed ${T.line}`, borderRadius:14, padding:'26px 18px', textAlign:'center',
              cursor:'pointer', background:T.card, marginBottom:12 }}>
            <i className="ti ti-cloud-upload" style={{ fontSize:28, color:T.clay }} aria-hidden="true" />
            <div className="serif" style={{ fontSize:15, fontWeight:700, color:T.ink, marginTop:7 }}>
              {busy ? (lang==='ru'?'Загрузка…':'Import en cours…') : (lang==='ru'?'Перетащите фото':'Glisse tes photos ici')}
            </div>
            <div style={{ fontSize:11.5, color:T.mute, marginTop:3 }}>
              {lang==='ru'?'или нажмите':'ou clique pour choisir'}
            </div>
            <input ref={inputRef} type="file" accept="image/*" multiple hidden onChange={e=>handle([...e.target.files])} />
          </div>
          <div style={{ display:'flex', gap:7, flexWrap:'wrap', marginBottom:14 }}>
            <input value={caption} onChange={e=>setCaption(e.target.value)}
              placeholder={lang==='ru'?'Подпись':'Légende (facultatif)'}
              style={{ flex:1, minWidth:170, padding:'9px 11px', borderRadius:10,
                border:`1px solid ${T.line}`, background:T.card, fontSize:12.5, color:T.ink }} />
            <select value={by} onChange={e=>setBy(e.target.value)}
              style={{ padding:'9px 10px', borderRadius:10, border:`1px solid ${T.line}`,
                background:T.card, fontSize:12.5, color:T.soft }}>
              {allPlayers().map(p=><option key={p.name} value={p.name}>{p.name}</option>)}
            </select>
          </div>
          {err && <div style={{ fontSize:12, color:'#B91C1C', background:'#FEF2F2', border:'1px solid #FCA5A5',
            borderRadius:9, padding:'8px 11px', marginBottom:12 }}>{err}</div>}
          {photos.length===0
            ? <div style={{ fontSize:12.5, color:T.mute, textAlign:'center', padding:'12px 0' }}>
                {lang==='ru'?'Пока нет фотографий.':'Aucune photo pour l\u2019instant.'}
              </div>
            : <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(120px,1fr))', gap:9 }}>
                {photos.map(p=>(
                  <div key={p.id} style={{ position:'relative', borderRadius:11, overflow:'hidden',
                    border:`1px solid ${T.line}`, aspectRatio:'4/5' }}>
                    <img src={p.url} alt="" style={{ width:'100%', height:'100%', objectFit:'cover', filter:LUT, display:'block' }} />
                    <button onClick={()=>removePhoto(target, p.id, p.path)}
                      style={{ position:'absolute', top:6, right:6, width:24, height:24, borderRadius:'50%',
                        background:'rgba(0,0,0,.55)', color:'#fff', fontSize:12 }}>✕</button>
                    {(p.caption || p.by) && (
                      <div style={{ position:'absolute', left:0, right:0, bottom:0,
                        background:'linear-gradient(to top, rgba(14,16,10,.88), transparent)', padding:'14px 8px 7px' }}>
                        {p.caption && <div style={{ fontSize:10, color:'#F2EEE2' }}>{p.caption}</div>}
                        {p.by && <div style={{ fontSize:9, color:'rgba(242,238,226,.65)' }}>{p.by}</div>}
                      </div>
                    )}
                  </div>
                ))}
              </div>}
        </div>
      </div>
    </div>
  )
}
