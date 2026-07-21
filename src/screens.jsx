import { useState, useEffect } from 'react'
import { THEMES, MONTHS, MONTHS_RU, EVENTS, POIS, POI_TYPES, CENTER } from './territory.js'
import SatMap from './satmap.jsx'
import { isObserved } from './data'
import { gradientFor } from './gradients.js'
import { UI, nameOf } from './i18n.js'
import { LUT } from './photoui.jsx'
import { allPhotos, allSpecies, allPlayers, subscribe } from './store.js'
import { getTodos, saveTodo, deleteTodo, getPins, savePin, deletePin } from './cloud.js'
import { PhotoBg } from './photoui.jsx'

const T = {
  bg:'#EDE7D8', surface:'#E3DAC5', card:'#E6DDC8',
  ink:'#2B2620', soft:'#6B6357', mute:'#9A9081',
  line:'#D3C7AE', clay:'#B5602F', clayDark:'#8F4A22', sage:'#7A8B5C', sageDark:'#4A5D32',
}
const chip = (on) => ({ fontSize:11.5, padding:'6px 12px', borderRadius:16,
  border:`1px solid ${on?T.clay:T.line}`, background:on?T.clay:'transparent',
  color:on?'#fff':T.soft, fontWeight:on?600:400 })

function Back({ onBack, label }) {
  return <button onClick={onBack} style={{ display:'flex', alignItems:'center', gap:5, fontSize:12, color:T.soft, marginBottom:12 }}>
    <i className="ti ti-arrow-left" aria-hidden="true" /> {label}
  </button>
}

// ══════════ CALENDRIER + TO-DO ══════════
export function Calendar({ wide, lang, onBack }) {
  const t = UI[lang]
  const [theme, setTheme] = useState('all')
  const [month, setMonth] = useState(new Date().getMonth())
  const [tab, setTab] = useState('cal')
  const months = lang==='ru' ? MONTHS_RU : MONTHS
  const list = EVENTS.filter(e => (theme==='all'||e.t===theme) && e.m.includes(month))

  // to-do partagée (localStorage)
  const [todos, setTodos] = useState([])
  const [draft, setDraft] = useState('')
  const [who, setWho] = useState('Exemple')
  const SPECIES = allSpecies(); const ALL_PLAYERS = allPlayers()
  const reloadTodos = async () => { try { setTodos(await getTodos()) } catch(e){} }
  useEffect(()=>{ reloadTodos() },[])
  const add = async () => {
    if(!draft.trim()) return
    const t2 = { id:Date.now(), txt:draft.trim(), by:who, done:false, theme }
    setTodos(v=>[...v, t2]); setDraft('')
    await saveTodo(t2); reloadTodos()
  }
  const toggle = async (id) => {
    const t2 = todos.find(x=>x.id===id); if(!t2) return
    const n = { ...t2, done:!t2.done }
    setTodos(v=>v.map(x=>x.id===id?n:x))
    await saveTodo(n)
  }
  const del = async (id) => { setTodos(v=>v.filter(x=>x.id!==id)); await deleteTodo(id) }

  return (
    <div style={{ padding: wide?'16px 40px 40px':'14px 18px 30px' }}>
      <Back onBack={onBack} label={t.home} />
      <h2 className="serif" style={{ fontSize: wide?30:23, fontWeight:900, color:T.ink, marginBottom:4 }}>
        {lang==='ru'?'Календарь работ':'Calendrier des travaux'}
      </h2>
      <p style={{ fontSize:12.5, color:T.mute, marginBottom:14 }}>
        {lang==='ru'?'Что делать и что наблюдать в течение года':'Ce qu\u2019il y a à faire et à observer au fil de l\u2019année'}
      </p>

      <div style={{ display:'flex', gap:6, marginBottom:14 }}>
        {[['cal', lang==='ru'?'Календарь':'Calendrier','ti-calendar'],['todo', t.todo,'ti-checklist']].map(([k,l,ic])=>(
          <button key={k} onClick={()=>setTab(k)} className="serif" style={{ fontSize:15, fontWeight:tab===k?900:500,
            padding:'8px 16px', borderRadius:20, background:tab===k?T.clay:'transparent',
            color:tab===k?'#fff':T.ink, border:tab===k?'none':`1px solid ${T.line}`,
            display:'flex', alignItems:'center', gap:6 }}>
            <i className={`ti ${ic}`} style={{ fontSize:15 }} aria-hidden="true" />{l}
            {k==='todo' && todos.filter(x=>!x.done).length>0 &&
              <span style={{ fontSize:10, background:tab===k?'rgba(255,255,255,.25)':'#F0E4CF', color:tab===k?'#fff':'#8F4A22', borderRadius:9, padding:'1px 6px', fontWeight:700 }}>{todos.filter(x=>!x.done).length}</span>}
          </button>
        ))}
      </div>

      {tab==='cal' ? <>
        <div style={{ display:'flex', gap:5, overflowX:'auto', paddingBottom:8, marginBottom:12 }}>
          {months.map((m,i)=>(
            <button key={m} onClick={()=>setMonth(i)} style={{ flexShrink:0, fontSize:12, padding:'7px 13px', borderRadius:16,
              border:`1px solid ${month===i?T.clay:T.line}`, background:month===i?T.clay:'transparent',
              color:month===i?'#fff':T.soft, fontWeight:month===i?600:400 }}>{m.slice(0,4)}</button>
          ))}
        </div>
        <div style={{ display:'flex', gap:5, flexWrap:'wrap', marginBottom:16 }}>
          <button onClick={()=>setTheme('all')} style={chip(theme==='all')}>{t.all}</button>
          {Object.entries(THEMES).map(([k,th])=>(
            <button key={k} onClick={()=>setTheme(k)} style={{ ...chip(theme===k),
              background:theme===k?th.c:'transparent', borderColor:theme===k?th.c:T.line, color:theme===k?'#fff':T.soft }}>
              {th.e} {lang==='ru'?th.ru:th.l}
            </button>
          ))}
        </div>
        {list.length===0
          ? <div style={{ fontSize:13, color:T.mute, padding:'20px 0' }}>{t.nothingPlanned}</div>
          : <div style={{ display:'grid', gridTemplateColumns: wide?'1fr 1fr':'1fr', gap:9 }}>
              {list.map((e,i)=>{
                const th = THEMES[e.t]
                return (
                  <div key={i} style={{ background:T.card, border:`1px solid ${T.line}`, borderRadius:12, overflow:'hidden', display:'flex' }}>
                    <div style={{ width:5, background:th.c, flexShrink:0 }} />
                    <div style={{ padding:'11px 13px', flex:1 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:4 }}>
                        <span style={{ fontSize:14 }}>{th.e}</span>
                        <span style={{ fontSize:10, color:th.c, fontWeight:700, textTransform:'uppercase', letterSpacing:'.5px' }}>{lang==='ru'?th.ru:th.l}</span>
                        <span style={{ marginLeft:'auto', fontSize:10, color:T.mute }}>{e.m.map(mi=>months[mi].slice(0,3)).join(' · ')}</span>
                      </div>
                      <div className="serif" style={{ fontSize:14, fontWeight:700, color:T.ink, marginBottom:3 }}>{e.l}</div>
                      <div style={{ fontSize:11.5, color:T.soft, lineHeight:1.5 }}>{e.d}</div>
                    </div>
                  </div>
                )
              })}
            </div>}
      </> : <>
        <div style={{ background:T.card, border:`1px solid ${T.line}`, borderRadius:14, padding:13, marginBottom:14 }}>
          <div style={{ display:'flex', gap:7, flexWrap:'wrap' }}>
            <input value={draft} onChange={e=>setDraft(e.target.value)} onKeyDown={e=>e.key==='Enter'&&add()}
              placeholder={lang==='ru'?'Что нужно сделать?':'Qu\u2019y a-t-il à faire ?'}
              style={{ flex:1, minWidth:180, padding:'10px 12px', borderRadius:10, border:`1px solid ${T.line}`, background:T.bg, fontSize:13, color:T.ink }} />
            <select value={who} onChange={e=>setWho(e.target.value)}
              style={{ padding:'10px 10px', borderRadius:10, border:`1px solid ${T.line}`, background:T.bg, fontSize:12.5, color:T.soft }}>
              {PLAYERS.map(p=><option key={p.id} value={p.name}>{p.name}</option>)}
            </select>
            <button onClick={add} className="serif" style={{ padding:'10px 18px', borderRadius:10, background:T.sageDark, color:'#fff', fontSize:13.5, fontWeight:700 }}>
              {t.addTask}
            </button>
          </div>
        </div>
        {todos.length===0
          ? <div style={{ fontSize:13, color:T.mute, padding:'16px 0' }}>{t.noTask}</div>
          : <div style={{ display:'grid', gridTemplateColumns: wide?'1fr 1fr':'1fr', gap:8 }}>
              {[...todos].sort((a,b)=>a.done-b.done).map(x=>{
                const th = THEMES[x.theme] || THEMES.agri
                return (
                  <div key={x.id} style={{ background:T.card, border:`1px solid ${x.done?T.line:th.c}`, borderRadius:12,
                    padding:'10px 12px', display:'flex', alignItems:'center', gap:10, opacity:x.done?.55:1 }}>
                    <button onClick={()=>toggle(x.id)} style={{ width:20, height:20, borderRadius:6, flexShrink:0,
                      border:`2px solid ${x.done?T.sage:T.line}`, background:x.done?T.sage:'transparent',
                      color:'#fff', fontSize:12, display:'flex', alignItems:'center', justifyContent:'center' }}>{x.done?'✓':''}</button>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:13, color:T.ink, textDecoration:x.done?'line-through':'none' }}>{x.txt}</div>
                      <div style={{ fontSize:10.5, color:T.mute, marginTop:2 }}>{x.by}</div>
                    </div>
                    <button onClick={()=>del(x.id)} style={{ color:T.mute, fontSize:14 }}>✕</button>
                  </div>
                )
              })}
            </div>}
      </>}
    </div>
  )
}

// ══════════ TERRITOIRE — carte satellite pure ══════════
export function Territory({ wide, lang, onBack, edit }) {
  const t = UI[lang]
  const [sel, setSel] = useState(null)
  const [filter, setFilter] = useState('all')
  const [custom, setCustom] = useState([])
  const [addMode, setAddMode] = useState(false)
  const [draft, setDraft] = useState(null)

  const reloadPins = async () => { try { setCustom(await getPins()) } catch(e){} }
  useEffect(()=>{ reloadPins() },[])

  const all = [...POIS, ...custom]
  const list = all.filter(p => filter==='all' || p.t===filter)
  const pins = list.map(p => ({
    id:p.id, lat:p.gps[0], lon:p.gps[1], label:p.l,
    color:POI_TYPES[p.t]?.c || '#B5602F', emoji:POI_TYPES[p.t]?.e || '📍'
  }))
  const center = sel ? { lat:sel.gps[0], lon:sel.gps[1] } : CENTER

  return (
    <div style={{ padding: wide?'16px 40px 40px':'14px 18px 30px' }}>
      <Back onBack={onBack} label={t.home} />
      <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', flexWrap:'wrap', gap:10, marginBottom:12 }}>
        <div>
          <h2 className="serif" style={{ fontSize: wide?30:23, fontWeight:900, color:T.ink, marginBottom:3 }}>
            {lang==='ru'?'Территория':'Le territoire'}
          </h2>
          <p style={{ fontSize:12, color:T.mute }}>57°17\u201910.9\u2033N · 25°35\u201938.1\u2033E</p>
        </div>
        {edit && (
          <button onClick={()=>{ setAddMode(a=>!a); setSel(null) }} className="serif"
            style={{ fontSize:13.5, fontWeight:700, padding:'9px 16px', borderRadius:20,
              background:addMode?T.clay:'transparent', color:addMode?'#fff':T.ink,
              border:addMode?'none':`1px solid ${T.line}`, display:'flex', alignItems:'center', gap:6 }}>
            <i className="ti ti-map-pin-plus" style={{ fontSize:15 }} aria-hidden="true" />
            {addMode ? (lang==='ru'?'Отмена':'Annuler') : (lang==='ru'?'Добавить точку':'Ajouter un repère')}
          </button>
        )}
      </div>

      {addMode && (
        <div style={{ background:'#F0E4CF', border:'1px solid #DCC79E', borderRadius:11, padding:'9px 12px',
          fontSize:12, color:'#6B5330', marginBottom:10, display:'flex', alignItems:'center', gap:7 }}>
          <i className="ti ti-hand-click" style={{ fontSize:15 }} aria-hidden="true" />
          {lang==='ru'?'Нажмите на карту, чтобы поставить точку':'Clique sur la carte à l\u2019endroit du repère'}
        </div>
      )}

      <div style={{ display:'flex', gap:5, flexWrap:'wrap', marginBottom:12 }}>
        <button onClick={()=>{setFilter('all');setSel(null)}} style={chip(filter==='all')}>{t.all}</button>
        {Object.entries(POI_TYPES).map(([k,ty])=>(
          <button key={k} onClick={()=>{setFilter(k);setSel(null)}} style={{ ...chip(filter===k),
            background:filter===k?ty.c:'transparent', borderColor:filter===k?ty.c:T.line, color:filter===k?'#fff':T.soft }}>
            {ty.e} {ty.l}
          </button>
        ))}
      </div>

      <div style={{ display:'grid', gridTemplateColumns: wide?'1.7fr 1fr':'1fr', gap:14 }}>
        <div style={{ borderRadius:16, overflow:'hidden', border:`1px solid ${T.line}`, position:'relative' }}>
          <SatMap center={center} pins={pins} selected={sel && { id:sel.id }} height={wide?540:330}
            addMode={addMode}
            onSelect={(p)=>setSel(p ? all.find(x=>x.id===p.id) : null)}
            onMapClick={(pos)=>{ setDraft({ gps:[pos.lat,pos.lon], t:'explo', l:'', d:'' }); setAddMode(false) }} />
          {sel && (
            <div style={{ position:'absolute', left:10, right:10, bottom:10, background:'rgba(20,22,14,.93)',
              borderRadius:12, padding:'11px 13px', zIndex:8 }}>
              <div style={{ display:'flex', alignItems:'center', gap:7, marginBottom:3 }}>
                <span style={{ fontSize:15 }}>{POI_TYPES[sel.t]?.e}</span>
                <span className="serif" style={{ fontSize:14, fontWeight:700, color:'#F2EEE2' }}>{sel.l}</span>
                {edit && sel.custom && (
                  <button onClick={async()=>{ setCustom(v=>v.filter(x=>x.id!==sel.id)); const id=sel.id; setSel(null); await deletePin(id) }}
                    style={{ color:'rgba(255,180,160,.9)', fontSize:11, marginLeft:6 }}>
                    {lang==='ru'?'Удалить':'Supprimer'}
                  </button>
                )}
                <button onClick={()=>setSel(null)} style={{ marginLeft:'auto', color:'rgba(242,238,226,.6)', fontSize:15 }}>✕</button>
              </div>
              <div style={{ fontSize:11.5, color:'rgba(242,238,226,.8)', lineHeight:1.5 }}>{sel.d}</div>
              <div style={{ fontSize:10.5, color:'rgba(242,238,226,.5)', marginTop:4 }}>
                {sel.gps[0].toFixed(5)}° N · {sel.gps[1].toFixed(5)}° E
              </div>
            </div>
          )}
        </div>

        <div style={{ display:'flex', flexDirection:'column', gap:7, maxHeight: wide?540:'none', overflowY:'auto' }}>
          {list.map(p=>{
            const ty = POI_TYPES[p.t] || POI_TYPES.explo; const on = sel?.id===p.id
            return (
              <button key={p.id} onClick={()=>setSel(on?null:p)} style={{ textAlign:'left',
                background:on?'#F0E4CF':T.card, border:`1px solid ${on?T.clay:T.line}`, borderRadius:11,
                padding:'9px 11px', display:'flex', alignItems:'flex-start', gap:9 }}>
                <span style={{ width:26, height:26, borderRadius:'50%', background:ty.c, display:'flex',
                  alignItems:'center', justifyContent:'center', fontSize:12, flexShrink:0 }}>{ty.e}</span>
                <div>
                  <div className="serif" style={{ fontSize:12.5, fontWeight:700, color:T.ink }}>{p.l}</div>
                  <div style={{ fontSize:11, color:T.soft, lineHeight:1.45, marginTop:2 }}>{p.d}</div>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {draft && <PinEditor draft={draft} lang={lang} onCancel={()=>setDraft(null)}
        onSave={async(p)=>{ const np={ ...p, id:'c'+Date.now(), custom:true }; setCustom(v=>[...v,np]); setDraft(null); await savePin(np); reloadPins() }} />}
    </div>
  )
}

function PinEditor({ draft, lang, onCancel, onSave }) {
  const [l, setL] = useState('')
  const [d, setD] = useState('')
  const [ty, setTy] = useState('explo')
  return (
    <div onClick={onCancel} style={{ position:'fixed', inset:0, background:'rgba(43,38,32,.6)', zIndex:140,
      display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
      <div onClick={e=>e.stopPropagation()} style={{ background:T.bg, borderRadius:18, padding:22,
        width:'100%', maxWidth:400, border:`1px solid ${T.line}` }}>
        <div className="serif" style={{ fontSize:18, fontWeight:900, color:T.ink, marginBottom:4 }}>
          {lang==='ru'?'Новая точка':'Nouveau repère'}
        </div>
        <div style={{ fontSize:11, color:T.mute, marginBottom:14 }}>
          {draft.gps[0].toFixed(5)}° N · {draft.gps[1].toFixed(5)}° E
        </div>
        <div style={{ display:'flex', gap:5, flexWrap:'wrap', marginBottom:12 }}>
          {Object.entries(POI_TYPES).map(([k,v])=>(
            <button key={k} onClick={()=>setTy(k)} style={{ fontSize:11, padding:'5px 10px', borderRadius:14,
              border:`1px solid ${ty===k?v.c:T.line}`, background:ty===k?v.c:'transparent',
              color:ty===k?'#fff':T.soft }}>{v.e} {v.l}</button>
          ))}
        </div>
        <input value={l} onChange={e=>setL(e.target.value)} autoFocus
          placeholder={lang==='ru'?'Название':'Nom du repère'}
          style={{ width:'100%', padding:'10px 12px', borderRadius:10, border:`1px solid ${T.line}`,
            background:T.card, fontSize:13.5, color:T.ink, marginBottom:9 }} />
        <textarea value={d} onChange={e=>setD(e.target.value)} rows={3}
          placeholder={lang==='ru'?'Заметка':'Note'}
          style={{ width:'100%', padding:'10px 12px', borderRadius:10, border:`1px solid ${T.line}`,
            background:T.card, fontSize:12.5, color:T.ink, marginBottom:14, resize:'vertical' }} />
        <div style={{ display:'flex', gap:8 }}>
          <button onClick={onCancel} style={{ flex:1, padding:'10px', borderRadius:10,
            border:`1px solid ${T.line}`, color:T.soft, fontSize:13 }}>
            {lang==='ru'?'Отмена':'Annuler'}
          </button>
          <button onClick={()=>l.trim() && onSave({ ...draft, t:ty, l:l.trim(), d:d.trim() })}
            className="serif" style={{ flex:1.3, padding:'10px', borderRadius:10, background:T.clay,
              color:'#fff', fontSize:13.5, fontWeight:700 }}>
            {lang==='ru'?'Сохранить':'Enregistrer'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ══════════ GALERIE + LIGHTBOX ══════════
export function Gallery({ wide, lang, onBack }) {
  const t = UI[lang]
  const [box, setBox] = useState(null)
  const [shots, setShots] = useState([])

  useEffect(() => {
    ;(async () => {
      const photos = allPhotos()
      const items = []
      photos.forEach(p => {
        const [kind, spId, indName] = p.target.split(':')
        const sp = SPECIES.find(x => x.id === spId)
        if (!sp) return
        const ind = kind === 'ind' ? (sp.inds || []).find(i => i.n === indName) : null
        items.push({ sp, ind, url: p.url, caption: p.caption, by: p.by || ind?.by })
      })
      SPECIES.filter(isObserved).forEach(sp => (sp.inds || []).forEach(ind => {
        if (!items.some(it => it.ind?.n === ind.n && it.sp.id === sp.id)) items.push({ sp, ind, url: null })
      }))
      setShots(items)
    })()
  }, [])

  const real = shots.filter(s => s.url).length

  return (
    <div style={{ padding: wide?'16px 40px 40px':'14px 18px 30px' }}>
      <Back onBack={onBack} label={t.home} />
      <h2 className="serif" style={{ fontSize: wide?30:23, fontWeight:900, color:T.ink, marginBottom:4 }}>
        {lang==='ru'?'Галерея':'La galerie'}
      </h2>
      <p style={{ fontSize:12.5, color:T.mute, marginBottom:16 }}>
        {real} {lang==='ru'?'фото':'photo'}{real!==1?'s':''} · {shots.length-real} {lang==='ru'?'без фото':'sans image'}
      </p>
      <div style={{ display:'grid', gridTemplateColumns:`repeat(auto-fill,minmax(${wide?170:140}px,1fr))`, gap:10 }}>
        {shots.map((sh,i)=>(
          <button key={i} onClick={()=>setBox(sh)} style={{ textAlign:'left', borderRadius:14,
            overflow:'hidden', border:`1px solid ${T.line}`, padding:0, position:'relative', aspectRatio:'4/5' }}>
            {sh.url
              ? <img src={sh.url} alt="" style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover', filter:LUT }} />
              : <div style={{ position:'absolute', inset:0, background:gradientFor(sh.sp.id+(sh.ind?.n||'')) }} />}
            <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top, rgba(16,18,12,.78), transparent 55%)' }} />
            <div style={{ position:'relative', height:'100%', display:'flex', flexDirection:'column', justifyContent:'space-between', padding:11 }}>
              <span style={{ fontSize:22 }}>{sh.sp.e}</span>
              <div>
                <div className="serif" style={{ fontSize:13.5, fontWeight:700, color:'#F2EEE2', lineHeight:1.1 }}>{sh.ind?.n || nameOf(sh.sp,lang).main}</div>
                <div style={{ fontSize:10.5, color:'rgba(242,238,226,.78)', marginTop:2 }}>{nameOf(sh.sp,lang).main}</div>
                {sh.ind?.d && <div style={{ fontSize:9.5, color:'rgba(242,238,226,.6)', marginTop:1 }}>{sh.ind.d}</div>}
              </div>
            </div>
          </button>
        ))}
      </div>
      {box && <Lightbox sh={box} lang={lang} wide={wide} onClose={()=>setBox(null)} />}
    </div>
  )
}

function Lightbox({ sh, lang, wide, onClose }) {
  const { sp, ind, url, caption, by } = sh
  return (
    <div onClick={onClose} style={{ position:'fixed', inset:0, background:'rgba(20,18,14,.93)', zIndex:100,
      display:'flex', alignItems:'center', justifyContent:'center', padding: wide?32:0 }}>
      <div onClick={e=>e.stopPropagation()} style={{ position:'relative', width:'100%', maxWidth:820,
        maxHeight:'92vh', borderRadius: wide?18:0, overflow:'hidden' }}>
        <div style={{ position:'relative', minHeight: wide?480:340, maxHeight:'92vh',
          display:'flex', alignItems:'center', justifyContent:'center',
          background: url?'#14160E':gradientFor(sp.id+(ind?.n||'')) }}>
          {url
            ? <img src={url} alt="" style={{ maxWidth:'100%', maxHeight:'92vh', objectFit:'contain', filter:LUT, display:'block' }} />
            : <span style={{ fontSize: wide?110:80, opacity:.9 }}>{sp.e}</span>}
          <button onClick={onClose} style={{ position:'absolute', top:14, right:14, width:34, height:34,
            borderRadius:'50%', background:'rgba(0,0,0,.45)', color:'#fff', fontSize:16,
            display:'flex', alignItems:'center', justifyContent:'center' }}>✕</button>
          <div style={{ position:'absolute', top:14, left:16 }}>
            <div style={{ fontSize:10.5, color:'rgba(242,238,226,.7)', textTransform:'uppercase', letterSpacing:'1px' }}>{nameOf(sp,lang).main}</div>
            {ind && <div className="serif" style={{ fontSize: wide?26:21, fontWeight:900, color:'#F2EEE2', lineHeight:1.05 }}>{ind.n}</div>}
          </div>
          <div style={{ position:'absolute', left:0, right:0, bottom:0,
            background:'linear-gradient(to top, rgba(14,16,10,.92), rgba(14,16,10,.55) 58%, transparent)',
            padding: wide?'40px 22px 20px':'30px 16px 16px' }}>
            {(caption || ind?.story) && (
              <div className="serif" style={{ fontSize: wide?15:13.5, color:'#F2EEE2', lineHeight:1.65, fontStyle:'italic', marginBottom:8 }}>
                « {caption || ind.story} »
              </div>
            )}
            <div style={{ display:'flex', gap:12, flexWrap:'wrap', fontSize:11, color:'rgba(242,238,226,.72)' }}>
              {(by || ind?.by) && <span>📷 {by || ind.by}</span>}
              {ind?.d && <span>📅 {ind.d}</span>}
              {ind?.time && <span>🕐 {ind.time}</span>}
              {ind?.weather && <span>🌤 {ind.weather}</span>}
              {ind?.gps && <span>📍 {ind.gps[0].toFixed(4)}°N {ind.gps[1].toFixed(4)}°E</span>}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ══════════ PAR OBSERVATEUR ══════════
export function ByPerson({ wide, lang, onSelectSpecies }) {
  const t = UI[lang]
  const [who, setWho] = useState('Exemple')
  const SPECIES = allSpecies(); const ALL_PLAYERS = allPlayers()
  const mySpecies = SPECIES.filter(s=>(s.obs[who]||[]).length)
  const myInds = []
  SPECIES.forEach(sp => (sp.inds||[]).forEach(ind => { if (ind.by===who) myInds.push({sp,ind}) }))

  return (
    <div style={{ padding: wide?'14px 24px 30px':'12px 18px 26px' }}>
      <div style={{ display:'flex', gap:7, flexWrap:'wrap', marginBottom:16 }}>
        {ALL_PLAYERS.map(p=>{
          const on = who===p.name
          const n = SPECIES.filter(s=>(s.obs[p.name]||[]).length).length
          return (
            <button key={p.id} onClick={()=>setWho(p.name)} style={{ display:'flex', alignItems:'center', gap:8,
              padding:'8px 14px', borderRadius:20, border:`1px solid ${on?T.clay:T.line}`,
              background:on?T.clay:'transparent' }}>
              <span className="serif" style={{ width:26, height:26, borderRadius:'50%',
                background:on?'rgba(255,255,255,.22)':T.sage, color:'#fff', display:'flex',
                alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:700 }}>{p.id}</span>
              <span className="serif" style={{ fontSize:14, fontWeight:on?900:600, color:on?'#fff':T.ink }}>{p.name}</span>
              <span style={{ fontSize:10.5, color:on?'rgba(255,255,255,.75)':T.mute }}>{n}</span>
            </button>
          )
        })}
      </div>

      {mySpecies.length===0
        ? <div style={{ fontSize:13, color:T.mute }}>{who} {t.nothingAdded}</div>
        : <>
          <div style={{ fontSize:10.5, fontWeight:600, color:T.mute, textTransform:'uppercase', letterSpacing:'.5px', marginBottom:9 }}>
            {mySpecies.length} {lang==='ru'?'видов':'espèces'}
          </div>
          <div style={{ display:'grid', gridTemplateColumns:`repeat(auto-fill,minmax(${wide?150:130}px,1fr))`, gap:9, marginBottom:20 }}>
            {mySpecies.map(sp=>{
              const nm = nameOf(sp,lang)
              return (
                <button key={sp.id} onClick={()=>onSelectSpecies(sp.id)} style={{ textAlign:'left', borderRadius:12,
                  overflow:'hidden', border:`1px solid ${T.line}`, padding:0, position:'relative', minHeight:86 }}>
                  <PhotoBg target={`sp:${sp.id}`} fallback={gradientFor(sp.id)} />
                  <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top, rgba(16,18,12,.72), transparent 58%)' }} />
                  <div style={{ position:'relative', minHeight:86, display:'flex', flexDirection:'column', justifyContent:'space-between', padding:9 }}>
                    <span style={{ fontSize:19 }}>{sp.e}</span>
                    <div>
                      <div className="serif" style={{ fontSize:12, fontWeight:700, color:'#F2EEE2', lineHeight:1.1 }}>{nm.main}</div>
                      {nm.sub && <div style={{ fontSize:8.5, color:'rgba(242,238,226,.5)' }}>{nm.sub}</div>}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
          {myInds.length>0 && <>
            <div style={{ fontSize:10.5, fontWeight:600, color:T.mute, textTransform:'uppercase', letterSpacing:'.5px', marginBottom:9 }}>
              {myInds.length} {lang==='ru'?'особей':'individus'}
            </div>
            <div style={{ display:'grid', gridTemplateColumns: wide?'1fr 1fr':'1fr', gap:8 }}>
              {myInds.map(({sp,ind},i)=>(
                <button key={i} onClick={()=>onSelectSpecies(sp.id)} style={{ textAlign:'left', background:T.card,
                  border:`1px solid ${T.line}`, borderRadius:11, padding:'10px 12px', display:'flex', gap:10, alignItems:'flex-start' }}>
                  <span style={{ fontSize:20 }}>{sp.e}</span>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div className="serif" style={{ fontSize:13, fontWeight:700, color:T.ink }}>{ind.n}</div>
                    <div style={{ fontSize:10.5, color:T.mute }}>{nameOf(sp,lang).main} · {ind.d}</div>
                    {ind.story && <div style={{ fontSize:11, color:T.soft, marginTop:4, lineHeight:1.45,
                      display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>{ind.story}</div>}
                  </div>
                </button>
              ))}
            </div>
          </>}
        </>}
    </div>
  )
}
