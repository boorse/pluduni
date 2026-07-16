import { useState } from 'react'
import { SPECIES, CATS, PLAYERS, RARITY, METHODS, SIZE_MULT, ACHIEVEMENTS, calcPts, totalPts, isObserved } from './data'
import MindMap from './mindmap.jsx'

const T = {
  bg:'#EDE7D8', surface:'#E3DAC5', card:'#E6DDC8', card2:'#EAE2D0',
  ink:'#2B2620', soft:'#6B6357', mute:'#9A9081',
  line:'#D3C7AE', lineSoft:'#DAD0BA',
  clay:'#B5602F', clayDark:'#8F4A22', sage:'#7A8B5C', sageDark:'#4A5D32',
}

// filtre LUT homogène pour les futures photos de fond
const LUT = 'sepia(0.35) saturate(1.15) hue-rotate(35deg) brightness(0.92) contrast(1.05)'

export default function App() {
  const [nav, setNav] = useState('explore')
  const [curCat, setCurCat] = useState(null)
  const [curSub, setCurSub] = useState('Tous')
  const [curSp, setCurSp] = useState(null)
  const [detTab, setDetTab] = useState('obs')
  const [view, setView] = useState('map')
  const [edit, setEdit] = useState(false)
  const [pwOpen, setPwOpen] = useState(false)
  const [pw, setPw] = useState('')

  const sp = SPECIES.find(s => s.id === curSp)
  const catObj = CATS.find(c => c.id === curCat)

  const selSpFull = (id) => { const s = SPECIES.find(x => x.id === id); setCurCat(s?.cat); setCurSp(id); setDetTab('obs'); setNav('explore') }
  const goHome = () => { setCurCat(null); setCurSp(null) }

  const tryEdit = () => {
    if (edit) { setEdit(false); return }
    setPwOpen(true)
  }
  const submitPw = () => {
    if (pw === 'pluduni') { setEdit(true); setPwOpen(false); setPw('') }
    else { setPw(''); }
  }

  // ─────────── NAV BAR ───────────
  const NavBar = () => (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 20px', borderBottom:`1px solid ${T.line}`, background:T.surface, position:'sticky', top:0, zIndex:20 }}>
      <div style={{ display:'flex', alignItems:'baseline', gap:12 }}>
        <span className="serif" style={{ fontSize:22, fontWeight:900, color:T.ink, letterSpacing:'-0.5px' }}>Pluduni</span>
        {(curCat || curSp) && (
          <span style={{ fontSize:12, color:T.mute }}>
            {catObj?.n}{sp && ` · ${sp.n}`}
          </span>
        )}
      </div>
      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
        {edit && <span style={{ fontSize:11, color:T.clay, fontWeight:600, background:'#F0DDD0', padding:'4px 10px', borderRadius:14 }}>Édition</span>}
        <button onClick={tryEdit} style={{ fontSize:12, color:T.soft, padding:'6px 12px', borderRadius:16, border:`1px solid ${T.line}`, background:'transparent', display:'flex', alignItems:'center', gap:5 }}>
          <i className="ti ti-pencil" style={{ fontSize:14 }} aria-hidden="true" /> {edit ? 'Quitter' : 'Mode édition'}
        </button>
      </div>
    </div>
  )

  // ─────────── TABS (gros) ───────────
  const Tabs = () => (
    <div style={{ display:'flex', gap:8, padding:'16px 20px 4px', flexWrap:'wrap' }}>
      {[['explore','Explorer','ti-map-2'],['matrix','Matrice','ti-layout-grid'],['scores','Scores','ti-trophy'],['badges','Badges','ti-award']].map(([id,label,icon])=>{
        const on = nav===id
        return (
          <button key={id} onClick={()=>{ setNav(id); setCurCat(null); setCurSp(null) }}
            className="serif"
            style={{ fontSize:17, fontWeight:on?600:500, color:on?'#fff':T.ink,
              background:on?T.clay:'transparent', padding:'9px 18px', borderRadius:24,
              border:on?'none':`1px solid ${T.line}`, display:'flex', alignItems:'center', gap:7 }}>
            <i className={`ti ${icon}`} style={{ fontSize:17 }} aria-hidden="true" /> {label}
          </button>
        )
      })}
      {nav==='explore' && (
        <button onClick={()=>{ if(!edit){ setPwOpen(true) } else { /* futur : ajout espèce */ } }}
          className="serif"
          style={{ fontSize:17, fontWeight:500, color:'#fff', background:T.sageDark, padding:'9px 18px', borderRadius:24, display:'flex', alignItems:'center', gap:7, marginLeft:'auto' }}>
          <i className="ti ti-plus" style={{ fontSize:17 }} aria-hidden="true" /> Ajouter une espèce
        </button>
      )}
    </div>
  )

  // ─────────── SPECIES CARD ───────────
  const SpeciesCard = ({ s }) => {
    const obs = isObserved(s)
    const r = RARITY[s.r]
    const methods = new Set(Object.values(s.obs).flat())
    return (
      <button onClick={()=>{ setCurSp(s.id); setDetTab('obs') }}
        style={{ textAlign:'left', background:T.card, borderRadius:14, overflow:'hidden', border:`1px solid ${obs?T.line:T.lineSoft}`, opacity:obs?1:0.62, padding:0, position:'relative' }}>
        <div style={{ height:80, display:'flex', alignItems:'center', justifyContent:'center', position:'relative',
          background: obs ? `${r.c}22` : '#DDD3BE' }}>
          <span style={{ fontSize:40, filter: obs?'none':'grayscale(0.6)' }}>{s.e}</span>
          {obs && <span style={{ position:'absolute', top:8, left:8, fontSize:10, fontWeight:600, padding:'3px 8px', borderRadius:12, background:r.c, color:'#fff' }}>{r.l}</span>}
          {!obs && <span style={{ position:'absolute', top:8, left:8, fontSize:10, fontWeight:500, padding:'3px 8px', borderRadius:12, background:'#CFC3A8', color:'#6B6357' }}>À observer</span>}
        </div>
        <div style={{ padding:'9px 11px' }}>
          <div style={{ fontSize:12.5, fontWeight:600, color:T.ink }}>{s.n}</div>
          <div style={{ fontSize:10.5, color:T.mute, fontStyle:'italic' }}>{s.lat}</div>
          {obs && (
            <div style={{ display:'flex', gap:4, marginTop:7 }}>
              {[...methods].map(m => METHODS[m] && (
                <span key={m} title={METHODS[m].l} style={{ width:20, height:20, borderRadius:'50%', background:METHODS[m].c, display:'flex', alignItems:'center', justifyContent:'center', fontSize:10 }}>
                  {m==='eye'?'👁':m==='scope'?'🔭':m==='night'?'🌙':'📷'}
                </span>
              ))}
            </div>
          )}
        </div>
      </button>
    )
  }

  // ─────────── EXPLORE : home / list ───────────
  const Explore = () => {
    if (curSp) return <Detail />
    if (!curCat) {
      return (
        <div style={{ padding:'8px 20px 20px' }}>
          <MindMap onSelectSpecies={selSpFull} editMode={edit} />
          <div className="serif" style={{ fontSize:13, fontWeight:600, color:T.mute, textTransform:'uppercase', letterSpacing:'1px', margin:'22px 0 12px' }}>Règnes</div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(150px,1fr))', gap:10 }}>
            {CATS.map(c => {
              const all = SPECIES.filter(s => s.cat===c.id)
              const obs = all.filter(isObserved).length
              return (
                <button key={c.id} onClick={()=>{ setCurCat(c.id); setCurSub('Tous') }}
                  style={{ textAlign:'left', background:T.card, border:`1px solid ${T.line}`, borderRadius:14, padding:'14px 14px' }}>
                  <div style={{ fontSize:26, marginBottom:6 }}>{c.e}</div>
                  <div className="serif" style={{ fontSize:16, fontWeight:600, color:T.ink }}>{c.n}</div>
                  <div style={{ fontSize:11, color:T.mute, fontStyle:'italic', marginBottom:4 }}>{c.lat}</div>
                  <div style={{ fontSize:11, color:T.soft }}>{obs}/{all.length} observées</div>
                </button>
              )
            })}
          </div>
        </div>
      )
    }
    // liste d'une catégorie
    let list = SPECIES.filter(s => s.cat===curCat)
    if (curSub!=='Tous') list = list.filter(s => s.sub===curSub)
    const subs = ['Tous', ...catObj.subs.map(s=>s.id)]
    return (
      <div style={{ padding:'8px 20px 20px' }}>
        <button onClick={goHome} style={{ display:'flex', alignItems:'center', gap:5, fontSize:12, color:T.soft, marginBottom:14 }}>
          <i className="ti ti-arrow-left" aria-hidden="true" /> Tous les règnes
        </button>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12, flexWrap:'wrap', gap:8 }}>
          <div className="serif" style={{ fontSize:20, fontWeight:600, color:T.ink }}>{catObj.e} {catObj.n}</div>
          <div style={{ display:'flex', gap:5 }}>
            {[['map','Mindmap','ti-hierarchy-2'],['grid','Grille','ti-layout-grid']].map(([v,l,ic])=>(
              <button key={v} onClick={()=>setView(v)} style={{ fontSize:11, padding:'5px 11px', borderRadius:14, border:`1px solid ${view===v?T.clay:T.line}`, background:view===v?'#F0DDD0':'transparent', color:view===v?T.clayDark:T.soft, display:'flex', alignItems:'center', gap:4 }}>
                <i className={`ti ${ic}`} style={{ fontSize:13 }} aria-hidden="true" /> {l}
              </button>
            ))}
          </div>
        </div>
        <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:14 }}>
          {subs.map(s => (
            <button key={s} onClick={()=>setCurSub(s)} style={{ fontSize:11, padding:'5px 11px', borderRadius:14, border:`1px solid ${curSub===s?T.clay:T.line}`, background:curSub===s?'#F0DDD0':'transparent', color:curSub===s?T.clayDark:T.soft, fontWeight:curSub===s?600:400 }}>{s}</button>
          ))}
        </div>
        {view==='map'
          ? <MindMap onSelectSpecies={selSpFull} editMode={edit} />
          : <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(150px,1fr))', gap:10 }}>
              {list.map(s => <SpeciesCard key={s.id} s={s} />)}
            </div>}
      </div>
    )
  }

  // ─────────── DETAIL ───────────
  const Detail = () => {
    if (!sp) return null
    const r = RARITY[sp.r]
    const obs = isObserved(sp)
    const allM = new Set(Object.values(sp.obs).flat())
    const baseP = Math.round(r.p * SIZE_MULT[sp.sz])
    return (
      <div style={{ padding:'8px 20px 20px' }}>
        <button onClick={()=>setCurSp(null)} style={{ display:'flex', alignItems:'center', gap:5, fontSize:12, color:T.soft, marginBottom:14 }}>
          <i className="ti ti-arrow-left" aria-hidden="true" /> {catObj?.n}
        </button>
        <div style={{ display:'flex', gap:14, marginBottom:16 }}>
          <div style={{ width:76, height:76, borderRadius:14, background: obs?`${r.c}22`:'#DDD3BE', display:'flex', alignItems:'center', justifyContent:'center', fontSize:44, flexShrink:0, filter:obs?'none':'grayscale(0.5)' }}>{sp.e}</div>
          <div>
            <div className="serif" style={{ fontSize:20, fontWeight:600, color:T.ink }}>{sp.n}</div>
            <div style={{ fontSize:12, color:T.mute, fontStyle:'italic' }}>{sp.lat}</div>
            <div style={{ display:'flex', gap:5, marginTop:7, flexWrap:'wrap', alignItems:'center' }}>
              <span style={{ fontSize:11, fontWeight:600, padding:'3px 9px', borderRadius:12, background:r.c, color:'#fff' }}>{r.l}</span>
              {[...allM].map(m => METHODS[m] && <span key={m} style={{ fontSize:11, padding:'3px 9px', borderRadius:12, background:METHODS[m].c, color:METHODS[m].on }}>{METHODS[m].l}</span>)}
            </div>
            <div className="serif" style={{ fontSize:14, fontWeight:600, color:T.clay, marginTop:8 }}>{baseP} pts base · max {baseP*3+50} pts</div>
          </div>
        </div>
        <div style={{ display:'flex', borderBottom:`1px solid ${T.line}`, marginBottom:14 }}>
          {[['obs','Observations'],['individus','Individus'],['infos','Infos']].map(([id,l])=>(
            <button key={id} onClick={()=>setDetTab(id)} style={{ fontSize:12.5, padding:'8px 14px', color:detTab===id?T.clayDark:T.soft, borderBottom:`2px solid ${detTab===id?T.clay:'transparent'}`, marginBottom:-1, fontWeight:detTab===id?600:400 }}>{l}</button>
          ))}
        </div>
        {detTab==='obs' && (
          <>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8, marginBottom:12 }}>
              {PLAYERS.map(pl => {
                const m = sp.obs[pl.name]||[]
                const best = m.length ? m.reduce((b,x)=>(METHODS[x]?.mult||0)>(METHODS[b]?.mult||0)?x:b, m[0]) : null
                const p2 = calcPts(sp, pl.name)
                return (
                  <div key={pl.id} style={{ background: best?`${METHODS[best].c}33`:T.card, border:`1px solid ${best?METHODS[best].c:T.line}`, borderRadius:10, padding:'9px 6px', textAlign:'center' }}>
                    <div style={{ fontSize:15, marginBottom:2 }}>{best?(best==='eye'?'👁':best==='scope'?'🔭':best==='night'?'🌙':'📷'):'—'}</div>
                    <div style={{ fontSize:10, color:T.soft }}>{pl.name}</div>
                    <div className="serif" style={{ fontSize:12, fontWeight:600, color:T.ink, marginTop:1 }}>{p2?p2+' pts':'—'}</div>
                  </div>
                )
              })}
            </div>
            {Object.entries(sp.bonus||{}).some(([,b])=>b.length) && (
              <div>
                <div style={{ fontSize:11, fontWeight:600, color:T.mute, textTransform:'uppercase', letterSpacing:'.5px', marginBottom:6 }}>Bonus obtenus</div>
                {Object.entries(sp.bonus).map(([pl,bs])=>bs.map(b=>(
                  <div key={pl+b} style={{ fontSize:11, color:T.soft, marginBottom:3 }}>• <b>{pl}</b> : {b==='terrier'?'🏠 Terrier trouvé (+30 pts)':b==='bebe'?'👶 Bébés observés (+20 pts)':b}</div>
                )))}
              </div>
            )}
          </>
        )}
        {detTab==='individus' && (
          sp.inds.length ? sp.inds.map((ind,i)=>(
            <div key={i} style={{ background:T.card, border:`1px solid ${T.line}`, borderRadius:10, padding:'9px 11px', marginBottom:6, display:'flex', alignItems:'center', gap:9 }}>
              <span style={{ fontSize:19 }}>{sp.e}</span>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:12.5, fontWeight:600, color:T.ink }}>{ind.n}</div>
                <div style={{ fontSize:10.5, color:T.soft }}>{ind.note}</div>
              </div>
              <div style={{ fontSize:10.5, color:T.mute }}>{ind.d}</div>
              {ind.b.map(b=><span key={b} style={{ fontSize:10, padding:'2px 7px', borderRadius:10, background:'#F0E4CF', color:'#8F6A2E' }}>{b==='bebe'?'👶':b==='adulte'?'🦁':'⭐'}</span>)}
            </div>
          )) : <div style={{ fontSize:12, color:T.mute, padding:'8px 0' }}>Aucun individu enregistré pour l'instant.{edit && ' Passe en mode édition pour en ajouter.'}</div>
        )}
        {detTab==='infos' && (
          <>
            {[['Alimentation',sp.alim],['Habitat & territoire',sp.hab],['Danger',sp.dng]].map(([t,v])=>(
              <div key={t} style={{ background:T.card, border:`1px solid ${T.line}`, borderRadius:10, padding:11, marginBottom:8 }}>
                <div style={{ fontSize:10.5, fontWeight:600, color:T.mute, textTransform:'uppercase', letterSpacing:'.5px', marginBottom:6 }}>{t}</div>
                <div style={{ fontSize:12.5, color:T.soft, lineHeight:1.6 }}>{v}</div>
              </div>
            ))}
            <div style={{ background:T.card, border:`1px solid ${T.line}`, borderRadius:10, padding:11 }}>
              <div style={{ fontSize:10.5, fontWeight:600, color:T.mute, textTransform:'uppercase', letterSpacing:'.5px', marginBottom:6 }}>Calcul des points</div>
              <div style={{ fontSize:12.5, color:T.soft, lineHeight:1.7 }}>Rareté {r.l} ({r.p} pts) × taille (×{SIZE_MULT[sp.sz]}) = <b>{baseP} pts base</b><br/>Vue directe ×3 · Longue-vue ×2.5 · Vision nocturne ×2 · Caméra ×1<br/>+20 pts bébés · +30 pts terrier trouvé</div>
            </div>
          </>
        )}
      </div>
    )
  }

  // ─────────── MATRIX ───────────
  const Matrix = () => (
    <div style={{ padding:'12px 20px 20px', overflowX:'auto' }}>
      {CATS.filter(c=>SPECIES.some(s=>s.cat===c.id)).map(cat=>{
        const list = SPECIES.filter(s=>s.cat===cat.id)
        return (
          <div key={cat.id}>
            <div className="serif" style={{ fontSize:15, fontWeight:600, color:T.ink, margin:'14px 0 8px' }}>{cat.e} {cat.n}</div>
            <table style={{ width:'100%', borderCollapse:'collapse', fontSize:11.5 }}>
              <thead><tr>
                <th style={{ textAlign:'left', padding:'6px 8px', color:T.mute, fontWeight:500, fontSize:10.5, borderBottom:`1px solid ${T.line}`, minWidth:150 }}>Espèce</th>
                <th style={{ padding:'6px 8px', color:T.mute, fontWeight:500, fontSize:10.5, borderBottom:`1px solid ${T.line}` }}>Rareté</th>
                {PLAYERS.map(p=><th key={p.id} style={{ padding:'6px 6px', textAlign:'center', color:T.soft, fontWeight:600, fontSize:10.5, borderBottom:`1px solid ${T.line}`, minWidth:44 }}>{p.name.slice(0,3)}</th>)}
              </tr></thead>
              <tbody>
                {list.map(s=>{
                  const r = RARITY[s.r]; const obs = isObserved(s)
                  return (
                    <tr key={s.id} onClick={()=>selSpFull(s.id)} style={{ cursor:'pointer', opacity:obs?1:0.55 }}>
                      <td style={{ padding:'6px 8px', borderBottom:`1px solid ${T.lineSoft}` }}>
                        <div style={{ display:'flex', alignItems:'center', gap:7 }}>
                          <span style={{ fontSize:15, filter:obs?'none':'grayscale(0.6)' }}>{s.e}</span>
                          <div>
                            <div style={{ fontSize:11.5, fontWeight:600, color:T.ink }}>{s.n}</div>
                            <div style={{ fontSize:9.5, color:T.mute, fontStyle:'italic' }}>{s.lat}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding:'6px 8px', borderBottom:`1px solid ${T.lineSoft}` }}>
                        <span style={{ fontSize:9.5, padding:'2px 7px', borderRadius:10, background:obs?r.c:'#CFC3A8', color:'#fff' }}>{r.l}</span>
                      </td>
                      {PLAYERS.map(pl=>{
                        const m = s.obs[pl.name]||[]
                        const best = m.length ? m.reduce((b,x)=>(METHODS[x]?.mult||0)>(METHODS[b]?.mult||0)?x:b, m[0]) : null
                        return (
                          <td key={pl.id} style={{ padding:'6px 6px', borderBottom:`1px solid ${T.lineSoft}`, textAlign:'center' }}>
                            <div title={best?`${pl.name} — ${METHODS[best].l}`:pl.name} style={{ width:24, height:24, borderRadius:'50%', margin:'0 auto', display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, background:best?METHODS[best].c:'#E0D8C6', border:`1px solid ${best?METHODS[best].c:T.line}` }}>
                              {best?(best==='eye'?'👁':best==='scope'?'🔭':best==='night'?'🌙':'📷'):''}
                            </div>
                          </td>
                        )
                      })}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )
      })}
      <div style={{ display:'flex', gap:12, marginTop:12, flexWrap:'wrap', fontSize:11, color:T.soft }}>
        <span>Méthodes :</span>
        {Object.entries(METHODS).map(([k,m])=>(
          <span key={k} style={{ display:'flex', alignItems:'center', gap:4 }}>
            <span style={{ width:18, height:18, borderRadius:'50%', background:m.c, display:'flex', alignItems:'center', justifyContent:'center', fontSize:9 }}>{k==='eye'?'👁':k==='scope'?'🔭':k==='night'?'🌙':'📷'}</span>
            {m.l} ×{m.mult}
          </span>
        ))}
      </div>
    </div>
  )

  // ─────────── SCORES ───────────
  const Scores = () => {
    const sorted = PLAYERS.map(p=>({ ...p, pts:totalPts(p.name), sps:SPECIES.filter(s=>(s.obs[p.name]||[]).length).length })).sort((a,b)=>b.pts-a.pts)
    const max = Math.max(sorted[0].pts, 1)
    return (
      <div style={{ padding:'16px 20px 20px' }}>
        <div className="serif" style={{ fontSize:13, fontWeight:600, color:T.mute, textTransform:'uppercase', letterSpacing:'1px', marginBottom:12 }}>Classement</div>
        {sorted.map((p,i)=>(
          <div key={p.id} style={{ background:T.card, border:`1px solid ${T.line}`, borderRadius:12, padding:'11px 13px', display:'flex', alignItems:'center', gap:11, marginBottom:7 }}>
            <span style={{ fontSize:17, width:26 }}>{['🥇','🥈','🥉','4️⃣'][i]}</span>
            <div style={{ width:34, height:34, borderRadius:'50%', background:T.sage, color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, fontWeight:600, flexShrink:0 }} className="serif">{p.id}</div>
            <div style={{ flex:1 }}>
              <div className="serif" style={{ fontSize:14, fontWeight:600, color:T.ink }}>{p.name}</div>
              <div style={{ fontSize:11, color:T.mute }}>{p.sps} espèce{p.sps!==1?'s':''} observée{p.sps!==1?'s':''}</div>
            </div>
            <div style={{ flex:1, maxWidth:160, background:'#DDD3BE', borderRadius:5, height:7, overflow:'hidden' }}>
              <div style={{ height:'100%', borderRadius:5, background:T.clay, width:`${Math.round(p.pts/max*100)}%` }} />
            </div>
            <div className="serif" style={{ fontSize:15, fontWeight:600, color:T.clay, minWidth:56, textAlign:'right' }}>{p.pts}</div>
          </div>
        ))}
        <div className="serif" style={{ fontSize:13, fontWeight:600, color:T.mute, textTransform:'uppercase', letterSpacing:'1px', margin:'18px 0 10px' }}>Système de points</div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
          {[
            ['Rareté', Object.values(RARITY).map(r=>[r.l, `+${r.p}`])],
            ['Méthode', Object.values(METHODS).map(m=>[m.l, `×${m.mult}`])],
            ['Taille', [['Très petit','×1'],['Petit','×1.5'],['Moyen','×2'],['Grand','×2.5'],['Géant','×3']]],
            ['Bonus', [['👶 Bébés','+20'],['🏠 Terrier','+30'],['📸 Photo nette','+10']]],
          ].map(([title,items])=>(
            <div key={title} style={{ background:T.card, border:`1px solid ${T.line}`, borderRadius:10, padding:'9px 11px' }}>
              <div className="serif" style={{ fontSize:12, fontWeight:600, color:T.ink, marginBottom:5 }}>{title}</div>
              {items.map(([l,v])=>(
                <div key={l} style={{ fontSize:10.5, color:T.soft, lineHeight:1.9, display:'flex', justifyContent:'space-between' }}>
                  <span>{l}</span><span style={{ color:T.clay, fontWeight:600 }}>{v}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    )
  }

  // ─────────── BADGES ───────────
  const Badges = () => {
    const on = ACHIEVEMENTS.filter(a=>a.on), off = ACHIEVEMENTS.filter(a=>!a.on)
    return (
      <div style={{ padding:'16px 20px 20px' }}>
        <div className="serif" style={{ fontSize:13, fontWeight:600, color:T.mute, textTransform:'uppercase', letterSpacing:'1px', marginBottom:10 }}>Débloqués ({on.length})</div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(130px,1fr))', gap:8, marginBottom:18 }}>
          {on.map(a=>(
            <div key={a.n} style={{ background:'#F0E4CF', border:`1px solid ${T.clay}`, borderRadius:12, padding:11, textAlign:'center' }}>
              <div style={{ fontSize:22, marginBottom:4 }}>{a.e}</div>
              <div className="serif" style={{ fontSize:12.5, fontWeight:600, color:T.ink }}>{a.n}</div>
              <div style={{ fontSize:10, color:T.mute, marginTop:2, lineHeight:1.4 }}>{a.d}</div>
              <div style={{ fontSize:10, color:T.clay, marginTop:3, fontWeight:600 }}>{a.w}</div>
            </div>
          ))}
        </div>
        <div className="serif" style={{ fontSize:13, fontWeight:600, color:T.mute, textTransform:'uppercase', letterSpacing:'1px', marginBottom:10 }}>À débloquer ({off.length})</div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(130px,1fr))', gap:8 }}>
          {off.map(a=>(
            <div key={a.n} style={{ background:T.card, border:`1px solid ${T.line}`, borderRadius:12, padding:11, textAlign:'center' }}>
              <div style={{ fontSize:22, marginBottom:4, filter:'grayscale(1)', opacity:0.35 }}>{a.e}</div>
              <div className="serif" style={{ fontSize:12.5, fontWeight:600, color:T.ink }}>{a.n}</div>
              <div style={{ fontSize:10, color:T.mute, marginTop:2, lineHeight:1.4 }}>{a.d}</div>
              <div style={{ fontSize:10, color:T.mute, marginTop:3 }}>???</div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div style={{ maxWidth:720, margin:'0 auto', minHeight:'100vh', background:T.bg }}>
      <NavBar />
      <Tabs />
      {nav==='explore' && <Explore />}
      {nav==='matrix' && <Matrix />}
      {nav==='scores' && <Scores />}
      {nav==='badges' && <Badges />}

      {pwOpen && (
        <div style={{ position:'fixed', inset:0, background:'rgba(43,38,32,0.4)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:50, padding:20 }} onClick={()=>{ setPwOpen(false); setPw('') }}>
          <div onClick={e=>e.stopPropagation()} style={{ background:T.bg, borderRadius:16, padding:24, width:'100%', maxWidth:340, border:`1px solid ${T.line}` }}>
            <div className="serif" style={{ fontSize:18, fontWeight:600, color:T.ink, marginBottom:6 }}>Mode édition</div>
            <div style={{ fontSize:12.5, color:T.soft, marginBottom:14 }}>Entre le mot de passe pour modifier le pokédex, ajouter des espèces et des photos.</div>
            <input type="password" value={pw} onChange={e=>setPw(e.target.value)} onKeyDown={e=>e.key==='Enter'&&submitPw()} placeholder="Mot de passe" autoFocus
              style={{ width:'100%', padding:'10px 12px', borderRadius:10, border:`1px solid ${T.line}`, background:T.card, fontSize:13, marginBottom:12, color:T.ink }} />
            <div style={{ display:'flex', gap:8 }}>
              <button onClick={()=>{ setPwOpen(false); setPw('') }} style={{ flex:1, padding:'9px', borderRadius:10, border:`1px solid ${T.line}`, background:'transparent', color:T.soft, fontSize:13 }}>Annuler</button>
              <button onClick={submitPw} className="serif" style={{ flex:1, padding:'9px', borderRadius:10, background:T.clay, color:'#fff', fontSize:13, fontWeight:600 }}>Déverrouiller</button>
            </div>
            <div style={{ fontSize:10.5, color:T.mute, marginTop:10, textAlign:'center' }}>Indice démo : « pluduni »</div>
          </div>
        </div>
      )}
    </div>
  )
}
