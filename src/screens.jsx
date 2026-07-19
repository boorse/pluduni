import { useState } from 'react'
import { THEMES, MONTHS, MONTHS_RU, EVENTS, POIS, POI_TYPES } from './territory.js'
import { SPECIES, isObserved } from './data'
import { gradientFor } from './gradients.js'

const T = {
  bg:'#EDE7D8', surface:'#E3DAC5', card:'#E6DDC8',
  ink:'#2B2620', soft:'#6B6357', mute:'#9A9081',
  line:'#D3C7AE', clay:'#B5602F', clayDark:'#8F4A22', sage:'#7A8B5C', sageDark:'#4A5D32',
}

// ══════════ CALENDRIER ══════════
export function Calendar({ wide, lang, onBack }) {
  const [theme, setTheme] = useState('all')
  const [month, setMonth] = useState(new Date().getMonth())
  const months = lang==='ru' ? MONTHS_RU : MONTHS
  const list = EVENTS.filter(e => (theme==='all'||e.t===theme) && e.m.includes(month))

  return (
    <div style={{ padding: wide?'16px 40px 40px':'14px 18px 30px' }}>
      <Back onBack={onBack} />
      <h2 className="serif" style={{ fontSize: wide?30:23, fontWeight:900, color:T.ink, marginBottom:4 }}>
        {lang==='ru'?'Календарь работ':'Calendrier des travaux'}
      </h2>
      <p style={{ fontSize:12.5, color:T.mute, marginBottom:16 }}>
        {lang==='ru'?'Что делать и что наблюдать в течение года':'Ce qu\u2019il y a à faire et à observer au fil de l\u2019année'}
      </p>

      {/* mois */}
      <div style={{ display:'flex', gap:5, overflowX:'auto', paddingBottom:8, marginBottom:12 }}>
        {months.map((m,i)=>(
          <button key={m} onClick={()=>setMonth(i)} style={{
            flexShrink:0, fontSize:12, padding:'7px 13px', borderRadius:16,
            border:`1px solid ${month===i?T.clay:T.line}`, background:month===i?T.clay:'transparent',
            color:month===i?'#fff':T.soft, fontWeight:month===i?600:400 }}>{m.slice(0,4)}</button>
        ))}
      </div>

      {/* thèmes */}
      <div style={{ display:'flex', gap:5, flexWrap:'wrap', marginBottom:16 }}>
        <button onClick={()=>setTheme('all')} style={chip(theme==='all')}>
          {lang==='ru'?'Всё':'Tout'}
        </button>
        {Object.entries(THEMES).map(([k,t])=>(
          <button key={k} onClick={()=>setTheme(k)} style={{
            ...chip(theme===k), background:theme===k?t.c:'transparent',
            borderColor:theme===k?t.c:T.line, color:theme===k?'#fff':T.soft }}>
            {t.e} {lang==='ru'?t.ru:t.l}
          </button>
        ))}
      </div>

      {list.length===0
        ? <div style={{ fontSize:13, color:T.mute, padding:'20px 0' }}>
            {lang==='ru'?'Ничего не запланировано.':'Rien de prévu ce mois-ci pour ce thème.'}
          </div>
        : <div style={{ display:'grid', gridTemplateColumns: wide?'1fr 1fr':'1fr', gap:9 }}>
            {list.map((e,i)=>{
              const th = THEMES[e.t]
              return (
                <div key={i} style={{ background:T.card, border:`1px solid ${T.line}`, borderRadius:12, overflow:'hidden', display:'flex' }}>
                  <div style={{ width:5, background:th.c, flexShrink:0 }} />
                  <div style={{ padding:'11px 13px', flex:1 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:4 }}>
                      <span style={{ fontSize:14 }}>{th.e}</span>
                      <span style={{ fontSize:10, color:th.c, fontWeight:700, textTransform:'uppercase', letterSpacing:'.5px' }}>
                        {lang==='ru'?th.ru:th.l}
                      </span>
                      <span style={{ marginLeft:'auto', fontSize:10, color:T.mute }}>
                        {e.m.map(mi=>months[mi].slice(0,3)).join(' · ')}
                      </span>
                    </div>
                    <div className="serif" style={{ fontSize:14, fontWeight:700, color:T.ink, marginBottom:3 }}>{e.l}</div>
                    <div style={{ fontSize:11.5, color:T.soft, lineHeight:1.5 }}>{e.d}</div>
                  </div>
                </div>
              )
            })}
          </div>}
    </div>
  )
}

// ══════════ TERRITOIRE ══════════
export function Territory({ wide, lang, onBack }) {
  const [sel, setSel] = useState(null)
  const [filter, setFilter] = useState('all')
  const list = POIS.filter(p => filter==='all' || p.t===filter)

  return (
    <div style={{ padding: wide?'16px 40px 40px':'14px 18px 30px' }}>
      <Back onBack={onBack} />
      <h2 className="serif" style={{ fontSize: wide?30:23, fontWeight:900, color:T.ink, marginBottom:4 }}>
        {lang==='ru'?'Территория':'Le territoire'}
      </h2>
      <p style={{ fontSize:12.5, color:T.mute, marginBottom:14 }}>
        {lang==='ru'?'Точки интереса: камеры, норы, места сбора, проекты':'Points d\u2019intérêt : caméras, terriers, coins à champignons, projets'}
      </p>

      <div style={{ display:'flex', gap:5, flexWrap:'wrap', marginBottom:14 }}>
        <button onClick={()=>setFilter('all')} style={chip(filter==='all')}>{lang==='ru'?'Всё':'Tout'}</button>
        {Object.entries(POI_TYPES).map(([k,t])=>(
          <button key={k} onClick={()=>setFilter(k)} style={{
            ...chip(filter===k), background:filter===k?t.c:'transparent',
            borderColor:filter===k?t.c:T.line, color:filter===k?'#fff':T.soft }}>{t.e} {t.l}</button>
        ))}
      </div>

      <div style={{ display:'grid', gridTemplateColumns: wide?'1.4fr 1fr':'1fr', gap:14 }}>
        {/* carte schématique */}
        <div style={{ position:'relative', borderRadius:16, overflow:'hidden', border:`1px solid ${T.line}`,
          background:'linear-gradient(160deg,#DDE3CE 0%,#CFDAC0 40%,#C6D3B8 100%)', aspectRatio:'4/3', minHeight:280 }}>
          {/* décor */}
          <svg viewBox="0 0 400 300" style={{ position:'absolute', inset:0, width:'100%', height:'100%' }}>
            <ellipse cx="96" cy="78" rx="52" ry="34" fill="#9DBBC4" opacity=".85" />
            <ellipse cx="124" cy="189" rx="34" ry="24" fill="#9DBBC4" opacity=".85" />
            <path d="M400,150 C330,175 300,200 280,230 C262,258 250,275 232,300"
              fill="none" stroke="#9DBBC4" strokeWidth="7" opacity=".8" strokeLinecap="round" />
            <path d="M0,120 Q60,96 120,118 T250,104 T400,124 L400,0 L0,0 Z" fill="#B9CBA8" opacity=".5" />
            {[...Array(26)].map((_,i)=>(
              <text key={i} x={(i*53)%390+8} y={((i*71)%250)+40} fontSize="13" opacity=".32">🌲</text>
            ))}
            <rect x="205" y="205" width="90" height="52" rx="6" fill="#C9B98F" opacity=".55" />
            <rect x="150" y="238" width="72" height="40" rx="6" fill="#BFCB9B" opacity=".55" />
          </svg>

          {list.map(p=>{
            const ty = POI_TYPES[p.t]
            const on = sel?.id===p.id
            return (
              <button key={p.id} onClick={()=>setSel(on?null:p)}
                style={{ position:'absolute', left:`${p.x}%`, top:`${p.y}%`, transform:'translate(-50%,-100%)',
                  display:'flex', flexDirection:'column', alignItems:'center', gap:0, zIndex:on?4:2 }}>
                <span style={{ width:on?30:25, height:on?30:25, borderRadius:'50%', background:ty.c,
                  border:`2px solid ${on?'#fff':'rgba(255,255,255,.75)'}`, display:'flex', alignItems:'center',
                  justifyContent:'center', fontSize:on?14:12, boxShadow:'0 2px 8px rgba(0,0,0,.25)',
                  transition:'all .18s' }}>{ty.e}</span>
                <span style={{ width:2, height:7, background:ty.c }} />
              </button>
            )
          })}

          {sel && (
            <div style={{ position:'absolute', left:10, right:10, bottom:10, background:'rgba(43,38,32,.92)',
              borderRadius:12, padding:'11px 13px', zIndex:6 }}>
              <div style={{ display:'flex', alignItems:'center', gap:7, marginBottom:3 }}>
                <span style={{ fontSize:15 }}>{POI_TYPES[sel.t].e}</span>
                <span className="serif" style={{ fontSize:14, fontWeight:700, color:'#F2EEE2' }}>{sel.l}</span>
                <button onClick={()=>setSel(null)} style={{ marginLeft:'auto', color:'rgba(242,238,226,.6)', fontSize:15 }}>✕</button>
              </div>
              <div style={{ fontSize:11.5, color:'rgba(242,238,226,.8)', lineHeight:1.5 }}>{sel.d}</div>
            </div>
          )}
        </div>

        {/* liste */}
        <div style={{ display:'flex', flexDirection:'column', gap:7, maxHeight: wide?460:'none', overflowY:'auto' }}>
          {list.map(p=>{
            const ty = POI_TYPES[p.t]
            const on = sel?.id===p.id
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
    </div>
  )
}

// ══════════ GALERIE ══════════
export function Gallery({ wide, lang, onBack, onSelectSpecies }) {
  const shots = []
  SPECIES.filter(isObserved).forEach(sp => {
    (sp.inds||[]).forEach(ind => shots.push({ sp, ind }))
  })
  return (
    <div style={{ padding: wide?'16px 40px 40px':'14px 18px 30px' }}>
      <Back onBack={onBack} />
      <h2 className="serif" style={{ fontSize: wide?30:23, fontWeight:900, color:T.ink, marginBottom:4 }}>
        {lang==='ru'?'Галерея':'La galerie'}
      </h2>
      <p style={{ fontSize:12.5, color:T.mute, marginBottom:16 }}>
        {shots.length} {lang==='ru'?'снимков особей':'clichés d\u2019individus'} · {lang==='ru'?'настоящие фото появятся позже':'les vraies photos remplaceront les dégradés'}
      </p>
      <div style={{ display:'grid', gridTemplateColumns:`repeat(auto-fill,minmax(${wide?170:140}px,1fr))`, gap:10 }}>
        {shots.map(({sp,ind},i)=>(
          <button key={i} onClick={()=>onSelectSpecies(sp.id)} style={{ textAlign:'left', borderRadius:14,
            overflow:'hidden', border:`1px solid ${T.line}`, padding:0, position:'relative', aspectRatio:'4/5' }}>
            <div style={{ position:'absolute', inset:0, background:gradientFor(sp.id+ind.n) }} />
            <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top, rgba(16,18,12,.75), transparent 55%)' }} />
            <div style={{ position:'relative', height:'100%', display:'flex', flexDirection:'column',
              justifyContent:'space-between', padding:11 }}>
              <span style={{ fontSize:24 }}>{sp.e}</span>
              <div>
                <div className="serif" style={{ fontSize:13.5, fontWeight:700, color:'#F2EEE2', lineHeight:1.1 }}>{ind.n}</div>
                <div style={{ fontSize:10.5, color:'rgba(242,238,226,.78)', marginTop:2 }}>{sp.n}</div>
                <div style={{ fontSize:9.5, color:'rgba(242,238,226,.6)', marginTop:1 }}>{ind.d}</div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

function Back({ onBack }) {
  return (
    <button onClick={onBack} style={{ display:'flex', alignItems:'center', gap:5, fontSize:12,
      color:T.soft, marginBottom:12 }}>
      <i className="ti ti-arrow-left" aria-hidden="true" /> Accueil
    </button>
  )
}
const chip = (on) => ({ fontSize:11.5, padding:'6px 12px', borderRadius:16,
  border:`1px solid ${on?T.clay:T.line}`, background:on?T.clay:'transparent',
  color:on?'#fff':T.soft, fontWeight:on?600:400 })
