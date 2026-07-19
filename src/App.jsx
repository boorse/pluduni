import { useState, useEffect } from 'react'
import { SPECIES, CATS, PLAYERS, RARITY, METHODS, SIZE_MULT, ACHIEVEMENTS, calcPts, totalPts, speciesPts, badgePts, isObserved } from './data'
import MindMap from './mindmap.jsx'
import { gradientFor, gradientForCat } from './gradients.js'

const T = {
  bg:'#EDE7D8', surface:'#E3DAC5', card:'#E6DDC8',
  ink:'#2B2620', soft:'#6B6357', mute:'#9A9081',
  line:'#D3C7AE', lineSoft:'#DAD0BA',
  clay:'#B5602F', clayDark:'#8F4A22', sage:'#7A8B5C', sageDark:'#4A5D32',
  leaf:'#C8DBA4',
}

function useWide() {
  const [wide, setWide] = useState(typeof window !== 'undefined' ? window.innerWidth >= 900 : true)
  useEffect(() => {
    const on = () => setWide(window.innerWidth >= 900)
    window.addEventListener('resize', on); return () => window.removeEventListener('resize', on)
  }, [])
  return wide
}

// ══════════════════ LANDING ══════════════════
function Landing({ onEnter, onQuiz }) {
  const wide = useWide()
  const obs = SPECIES.filter(isObserved).length
  return (
    <div style={{ minHeight:'100vh', background:T.bg }}>
      <div style={{ position:'relative', height: wide?'62vh':'52vh', minHeight:340,
        background:'linear-gradient(155deg,#22301C 0%,#3E5233 42%,#6E8557 78%,#94A874 100%)',
        display:'flex', flexDirection:'column', justifyContent:'flex-end', overflow:'hidden' }}>
        <div style={{ position:'absolute', inset:0, background:'radial-gradient(ellipse at 70% 20%, rgba(200,219,164,0.22), transparent 60%)' }} />
        <div style={{ position:'absolute', top:0, left:0, right:0, padding: wide?'22px 40px':'18px 22px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <span className="serif" style={{ fontSize: wide?26:21, fontWeight:900, color:'#EDE7D8', letterSpacing:'-0.5px' }}>Pluduni</span>
          <span style={{ fontSize:12, color:'rgba(237,231,216,0.75)' }}>Vidzeme · Lettonie</span>
        </div>
        <div style={{ position:'relative', padding: wide?'0 40px 42px':'0 22px 30px', maxWidth:900 }}>
          <h1 className="serif" style={{ fontSize: wide?54:34, lineHeight:1.02, fontWeight:900, color:'#F2EEE2', letterSpacing:'-1.5px', marginBottom:14 }}>
            Tout ce qui vit ici,<br/>répertorié.
          </h1>
          <p style={{ fontSize: wide?15:13.5, color:'rgba(237,231,216,0.82)', maxWidth:520, lineHeight:1.6 }}>
            Un inventaire naturaliste collaboratif de la forêt, des lacs et de la rivière —
            observé à l'œil nu, à la longue-vue, à la lampe et au piège photo.
          </p>
        </div>
      </div>

      <div style={{ padding: wide?'26px 40px 40px':'20px 22px 32px' }}>
        <div style={{ display:'flex', gap:20, marginBottom:22, flexWrap:'wrap' }}>
          {[[SPECIES.length,'espèces référencées'],[obs,'observées'],[CATS.length,'règnes'],[PLAYERS.length,'observateurs']].map(([v,l])=>(
            <div key={l}>
              <div className="serif" style={{ fontSize: wide?30:24, fontWeight:900, color:T.ink, lineHeight:1 }}>{v}</div>
              <div style={{ fontSize:11.5, color:T.mute, marginTop:3 }}>{l}</div>
            </div>
          ))}
        </div>

        <div style={{ display:'grid', gridTemplateColumns: wide?'1fr 1fr':'1fr', gap:14 }}>
          <button onClick={onEnter} style={{ textAlign:'left', borderRadius:20, overflow:'hidden', border:'none', padding:0, position:'relative', minHeight: wide?230:170 }}>
            <div style={{ position:'absolute', inset:0, background:'linear-gradient(145deg,#2F4433 0%,#5B7A4E 55%,#8CA372 100%)' }} />
            <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top, rgba(20,28,16,0.62), transparent 62%)' }} />
            <div style={{ position:'relative', height:'100%', display:'flex', flexDirection:'column', justifyContent:'flex-end', padding: wide?'26px':'20px' }}>
              <span style={{ fontSize:11, letterSpacing:'1.5px', textTransform:'uppercase', color:T.leaf, fontWeight:600, marginBottom:6 }}>Consulter</span>
              <span className="serif" style={{ fontSize: wide?34:26, fontWeight:900, color:'#F2EEE2', lineHeight:1.05, letterSpacing:'-0.8px' }}>Le Pokédex</span>
              <span style={{ fontSize:12.5, color:'rgba(237,231,216,0.78)', marginTop:7, maxWidth:340 }}>
                Mindmap du vivant, matrice des observations, scores et badges.
              </span>
            </div>
          </button>

          <button onClick={onQuiz} style={{ textAlign:'left', borderRadius:20, overflow:'hidden', border:'none', padding:0, position:'relative', minHeight: wide?230:170 }}>
            <div style={{ position:'absolute', inset:0, background:'linear-gradient(145deg,#5C3A26 0%,#9A6B3E 55%,#C09A5E 100%)' }} />
            <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top, rgba(38,24,14,0.62), transparent 62%)' }} />
            <div style={{ position:'relative', height:'100%', display:'flex', flexDirection:'column', justifyContent:'flex-end', padding: wide?'26px':'20px' }}>
              <span style={{ fontSize:11, letterSpacing:'1.5px', textTransform:'uppercase', color:'#F0D9A8', fontWeight:600, marginBottom:6 }}>Jouer</span>
              <span className="serif" style={{ fontSize: wide?34:26, fontWeight:900, color:'#F2EEE2', lineHeight:1.05, letterSpacing:'-0.8px' }}>Le Quiz</span>
              <span style={{ fontSize:12.5, color:'rgba(242,238,226,0.78)', marginTop:7, maxWidth:340 }}>
                Des cartes à deviner, tirées de vos propres observations.
              </span>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}

// ══════════════════ APP ══════════════════
export default function App() {
  const wide = useWide()
  const [screen, setScreen] = useState('landing')
  const [nav, setNav] = useState('explore')
  const [curCat, setCurCat] = useState(null)
  const [curSub, setCurSub] = useState('Tous')
  const [curSp, setCurSp] = useState(null)
  const [detTab, setDetTab] = useState('obs')
  const [pane, setPane] = useState('split')      // split | map | matrix
  const [edit, setEdit] = useState(false)
  const [pwOpen, setPwOpen] = useState(false)
  const [pw, setPw] = useState('')
  const [toast, setToast] = useState(null)
  const [mobileTab, setMobileTab] = useState('map')
  const [focus, setFocus] = useState(null)        // 'map' | 'matrix' | null
  const [curInd, setCurInd] = useState(null)      // individu ouvert
  const [curPlayer, setCurPlayer] = useState(null) // detail score

  const sp = SPECIES.find(s => s.id === curSp)
  const catObj = CATS.find(c => c.id === curCat)

  const showToast = (msg) => { setToast(msg); setTimeout(()=>setToast(null), 3200) }
  const selSpFull = (id) => { const s = SPECIES.find(x=>x.id===id); setCurCat(s?.cat); setCurSp(id); setDetTab('obs') }
  const submitPw = () => { if (pw==='pluduni'){ setEdit(true); setPwOpen(false); setPw('') } else setPw('') }

  if (screen === 'landing') {
    return (
      <>
        <Landing onEnter={()=>setScreen('app')} onQuiz={()=>showToast("Oups — le Quiz n'est pas encore prêt. Il arrivera quand le Pokédex sera bien rempli !")} />
        {toast && <Toast msg={toast} />}
      </>
    )
  }

  // ═════ MATRIX PANE ═════
  const MatrixPane = ({ compact }) => (
    <div style={{ padding: compact?'12px 14px':'14px 18px' }}>
      {CATS.filter(c=>SPECIES.some(s=>s.cat===c.id)).map(cat=>{
        const list = SPECIES.filter(s=>s.cat===cat.id)
        return (
          <div key={cat.id} style={{ marginBottom:16 }}>
            <div className="serif" style={{ fontSize:14, fontWeight:600, color:T.ink, marginBottom:7, display:'flex', alignItems:'center', gap:6 }}>
              <span>{cat.e}</span>{cat.n}
              <span style={{ fontSize:10.5, color:T.mute, fontWeight:400 }}>· {list.filter(isObserved).length}/{list.length}</span>
            </div>
            <table style={{ width:'100%', borderCollapse:'collapse', fontSize:11 }}>
              <thead><tr>
                <th style={{ textAlign:'left', padding:'5px 6px', color:T.mute, fontWeight:500, fontSize:10, borderBottom:`1px solid ${T.line}` }}>Espèce</th>
                {PLAYERS.map(p=><th key={p.id} style={{ padding:'5px 3px', textAlign:'center', color:T.soft, fontWeight:600, fontSize:10, borderBottom:`1px solid ${T.line}`, width:34 }}>{p.id}</th>)}
              </tr></thead>
              <tbody>
                {list.map(s=>{
                  const r = RARITY[s.r]; const o = isObserved(s)
                  return (
                    <tr key={s.id} onClick={()=>selSpFull(s.id)} style={{ cursor:'pointer', opacity:o?1:0.5 }}>
                      <td style={{ padding:'5px 6px', borderBottom:`1px solid ${T.lineSoft}` }}>
                        <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                          <span style={{ width:8, height:8, borderRadius:'50%', background:o?r.c:'#CFC3A8', flexShrink:0 }} />
                          <span style={{ fontSize:13, filter:o?'none':'grayscale(0.6)' }}>{s.e}</span>
                          <span style={{ fontSize:11, fontWeight:o?600:400, color:T.ink, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', maxWidth: compact?110:170 }}>{s.n}</span>
                        </div>
                      </td>
                      {PLAYERS.map(pl=>{
                        const m = s.obs[pl.name]||[]
                        const best = m.length ? m.reduce((b,x)=>(METHODS[x]?.mult||0)>(METHODS[b]?.mult||0)?x:b, m[0]) : null
                        return (
                          <td key={pl.id} style={{ padding:'5px 3px', borderBottom:`1px solid ${T.lineSoft}`, textAlign:'center' }}>
                            <div title={best?`${pl.name} — ${METHODS[best].l}`:pl.name}
                              style={{ width:20, height:20, borderRadius:'50%', margin:'0 auto', display:'flex', alignItems:'center', justifyContent:'center', fontSize:9,
                                background:best?METHODS[best].c:'#E0D8C6', border:`1px solid ${best?METHODS[best].c:T.line}` }}>
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
      <div style={{ display:'flex', gap:9, flexWrap:'wrap', fontSize:10, color:T.soft, paddingTop:4 }}>
        {Object.entries(METHODS).map(([k,m])=>(
          <span key={k} style={{ display:'flex', alignItems:'center', gap:4 }}>
            <span style={{ width:15, height:15, borderRadius:'50%', background:m.c, display:'flex', alignItems:'center', justifyContent:'center', fontSize:8 }}>{k==='eye'?'👁':k==='scope'?'🔭':k==='night'?'🌙':'📷'}</span>
            ×{m.mult}
          </span>
        ))}
      </div>
    </div>
  )

  // ═════ PANE HEADER ═════
  const PaneHeader = ({ title, icon, active, onExpand, expanded }) => (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'11px 14px', borderBottom:`1px solid ${T.line}`, background:T.surface }}>
      <div className="serif" style={{ fontSize:14, fontWeight:600, color:T.ink, display:'flex', alignItems:'center', gap:6 }}>
        <i className={`ti ${icon}`} style={{ fontSize:15, color:T.clay }} aria-hidden="true" />{title}
      </div>
      <button onClick={onExpand} title={expanded?'Réduire':'Agrandir'}
        style={{ width:26, height:26, borderRadius:8, border:`1px solid ${T.line}`, background:expanded?'#F0DDD0':'transparent', display:'flex', alignItems:'center', justifyContent:'center', color:expanded?T.clayDark:T.soft }}>
        <i className={`ti ${expanded?'ti-arrows-minimize':'ti-arrows-maximize'}`} style={{ fontSize:13 }} aria-hidden="true" />
      </button>
    </div>
  )

  // ═════ SPECIES DETAIL ═════
  const Detail = () => {
    if (!sp) return null
    const r = RARITY[sp.r]; const o = isObserved(sp)
    const allM = new Set(Object.values(sp.obs).flat())
    const baseP = Math.round(r.p * SIZE_MULT[sp.sz])
    const seasons = sp.saisons
    const tabs = [['obs','Observations'],['infos','Infos'],...(seasons?[['saisons','Saisons']]:[])]
    return (
      <div style={{ position:'fixed', inset:0, background:'rgba(43,38,32,.5)', zIndex:60, display:'flex', alignItems: wide?'center':'flex-end', justifyContent:'center', padding: wide?24:0 }} onClick={()=>{setCurSp(null);setCurInd(null)}}>
        <div onClick={e=>e.stopPropagation()} style={{ background:T.bg, borderRadius: wide?20:'20px 20px 0 0', width:'100%', maxWidth:640, maxHeight: wide?'88vh':'92vh', overflow:'auto', border:`1px solid ${T.line}` }}>
          <div style={{ position:'relative', height:180, background:gradientFor(sp.id), display:'flex', alignItems:'flex-end', padding:20 }}>
            <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top, rgba(20,20,14,.55), transparent 65%)' }} />
            <button onClick={()=>setCurSp(null)} style={{ position:'absolute', top:14, right:14, width:30, height:30, borderRadius:'50%', background:'rgba(0,0,0,.3)', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <i className="ti ti-x" style={{ fontSize:15 }} aria-hidden="true" />
            </button>
            <div style={{ position:'absolute', top:14, left:16, fontSize:44 }}>{sp.e}</div>
            <div style={{ position:'relative' }}>
              <div className="serif" style={{ fontSize:26, fontWeight:900, color:'#F2EEE2', lineHeight:1.05 }}>{sp.n}</div>
              <div style={{ fontSize:12, color:'rgba(242,238,226,.78)', fontStyle:'italic', marginTop:2 }}>{sp.lat}</div>
              <div style={{ display:'flex', gap:5, marginTop:8, flexWrap:'wrap' }}>
                <span style={{ fontSize:10.5, fontWeight:600, padding:'3px 9px', borderRadius:12, background:r.c, color:'#fff' }}>{r.l}</span>
                {[...allM].map(m => METHODS[m] && <span key={m} style={{ fontSize:10.5, padding:'3px 9px', borderRadius:12, background:METHODS[m].c, color:METHODS[m].on }}>{METHODS[m].l}</span>)}
                {!o && <span style={{ fontSize:10.5, padding:'3px 9px', borderRadius:12, background:'rgba(255,255,255,.22)', color:'#F2EEE2' }}>Pas encore observée</span>}
              </div>
            </div>
          </div>
          <div style={{ padding:'14px 18px 22px' }}>
            <div className="serif" style={{ fontSize:15, fontWeight:600, color:T.clay, marginBottom:12 }}>{baseP} pts base · max {baseP*3+50} pts</div>
            <div style={{ display:'flex', borderBottom:`1px solid ${T.line}`, marginBottom:14 }}>
              {tabs.map(([id,l])=>(
                <button key={id} onClick={()=>setDetTab(id)} style={{ fontSize:12.5, padding:'8px 14px', color:detTab===id?T.clayDark:T.soft, borderBottom:`2px solid ${detTab===id?T.clay:'transparent'}`, marginBottom:-1, fontWeight:detTab===id?600:400 }}>{l}</button>
              ))}
            </div>

            {detTab==='obs' && <>
              <div style={{ fontSize:10.5, fontWeight:600, color:T.mute, textTransform:'uppercase', letterSpacing:'.5px', marginBottom:8 }}>Qui a observé</div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8, marginBottom:16 }}>
                {PLAYERS.map(pl=>{
                  const m = sp.obs[pl.name]||[]
                  const best = m.length ? m.reduce((b,x)=>(METHODS[x]?.mult||0)>(METHODS[b]?.mult||0)?x:b, m[0]) : null
                  const p2 = calcPts(sp, pl.name)
                  return (
                    <div key={pl.id} style={{ background:best?`${METHODS[best].c}33`:T.card, border:`1px solid ${best?METHODS[best].c:T.line}`, borderRadius:10, padding:'9px 6px', textAlign:'center' }}>
                      <div style={{ fontSize:15, marginBottom:2 }}>{best?(best==='eye'?'👁':best==='scope'?'🔭':best==='night'?'🌙':'📷'):'—'}</div>
                      <div style={{ fontSize:10, color:T.soft }}>{pl.name}</div>
                      <div className="serif" style={{ fontSize:12, fontWeight:600, color:T.ink }}>{p2?p2+' pts':'—'}</div>
                    </div>
                  )
                })}
              </div>
              {sp.inds.length>0 && <>
                <div style={{ fontSize:10.5, fontWeight:600, color:T.mute, textTransform:'uppercase', letterSpacing:'.5px', marginBottom:8 }}>Individus observés ({sp.inds.length})</div>
                <div style={{ display:'grid', gridTemplateColumns:`repeat(auto-fill,minmax(${wide?128:110}px,1fr))`, gap:9 }}>
                  {sp.inds.map((ind,i)=>(
                    <button key={i} onClick={()=>setCurInd(ind)} style={{ textAlign:'left', borderRadius:12, overflow:'hidden', border:`1px solid ${T.line}`, padding:0, position:'relative', minHeight:92 }}>
                      <div style={{ position:'absolute', inset:0, background:gradientFor(sp.id+ind.n) }} />
                      <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top, rgba(16,18,12,.72), transparent 58%)' }} />
                      <div style={{ position:'relative', height:'100%', minHeight:92, display:'flex', flexDirection:'column', justifyContent:'space-between', padding:9 }}>
                        <span style={{ fontSize:20 }}>{sp.e}</span>
                        <div>
                          <div className="serif" style={{ fontSize:12.5, fontWeight:700, color:'#F2EEE2', lineHeight:1.1 }}>{ind.n}</div>
                          <div style={{ fontSize:9.5, color:'rgba(242,238,226,.75)', marginTop:2 }}>{ind.d}</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </>}
              {Object.entries(sp.bonus||{}).some(([,b])=>b.length) && (
                <div style={{ marginTop:14 }}>
                  <div style={{ fontSize:10.5, fontWeight:600, color:T.mute, textTransform:'uppercase', letterSpacing:'.5px', marginBottom:6 }}>Bonus</div>
                  {Object.entries(sp.bonus).map(([pl,bs])=>bs.map(b=>(
                    <div key={pl+b} style={{ fontSize:11.5, color:T.soft, marginBottom:3 }}>• <b>{pl}</b> : {b==='terrier'?'🏠 Terrier trouvé (+30 pts)':b==='bebe'?'👶 Bébés observés (+20 pts)':b}</div>
                  )))}
                </div>
              )}
            </>}

            {detTab==='infos' && <>
              {[['Alimentation',sp.alim],['Habitat & territoire',sp.hab],['Danger',sp.dng]].map(([t,v])=>(
                <div key={t} style={{ background:T.card, border:`1px solid ${T.line}`, borderRadius:10, padding:11, marginBottom:8 }}>
                  <div style={{ fontSize:10.5, fontWeight:600, color:T.mute, textTransform:'uppercase', letterSpacing:'.5px', marginBottom:6 }}>{t}</div>
                  <div style={{ fontSize:12.5, color:T.soft, lineHeight:1.65 }}>{v}</div>
                </div>
              ))}
              {sp.anecdote && (
                <div style={{ background:'#F0E4CF', border:`1px solid #DCC79E`, borderRadius:10, padding:12, marginTop:4 }}>
                  <div style={{ fontSize:10.5, fontWeight:700, color:'#8F6A2E', textTransform:'uppercase', letterSpacing:'.5px', marginBottom:6, display:'flex', alignItems:'center', gap:5 }}>
                    <i className="ti ti-sparkles" style={{ fontSize:13 }} aria-hidden="true" />Le saviez-vous
                  </div>
                  <div style={{ fontSize:12.5, color:'#6B5330', lineHeight:1.65 }}>{sp.anecdote}</div>
                </div>
              )}
              <div style={{ marginTop:10, padding:'9px 11px', border:`1px dashed ${T.line}`, borderRadius:10, fontSize:11.5, color:T.mute, display:'flex', alignItems:'center', gap:7 }}>
                <i className="ti ti-volume" style={{ fontSize:15 }} aria-hidden="true" />
                Cri / chant de l'espèce — à venir
              </div>
            </>}

            {detTab==='saisons' && seasons && (
              <div style={{ display:'grid', gridTemplateColumns: wide?'1fr 1fr':'1fr', gap:9 }}>
                {[['printemps','Printemps','🌱','#8FA96B'],['ete','Été','☀️','#C0913E'],['automne','Automne','🍂','#B5602F'],['hiver','Hiver','❄️','#7C8B95']].map(([k,l,e,c])=>(
                  <div key={k} style={{ borderRadius:12, overflow:'hidden', border:`1px solid ${T.line}` }}>
                    <div style={{ background:c, padding:'7px 11px', display:'flex', alignItems:'center', gap:6 }}>
                      <span style={{ fontSize:14 }}>{e}</span>
                      <span className="serif" style={{ fontSize:12.5, fontWeight:700, color:'#fff' }}>{l}</span>
                    </div>
                    <div style={{ padding:'9px 11px', background:T.card, fontSize:11.5, color:T.soft, lineHeight:1.55 }}>{seasons[k]}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // ═════ INDIVIDU ═════
  const IndividuSheet = () => {
    if (!curInd || !sp) return null
    const ind = curInd
    const M = ind.method ? METHODS[ind.method] : null
    return (
      <div style={{ position:'fixed', inset:0, background:'rgba(43,38,32,.6)', zIndex:80, display:'flex', alignItems: wide?'center':'flex-end', justifyContent:'center', padding: wide?24:0 }} onClick={()=>setCurInd(null)}>
        <div onClick={e=>e.stopPropagation()} style={{ background:T.bg, borderRadius: wide?20:'20px 20px 0 0', width:'100%', maxWidth:560, maxHeight: wide?'86vh':'90vh', overflow:'auto', border:`1px solid ${T.line}` }}>
          <div style={{ position:'relative', height:160, background:gradientFor(sp.id+ind.n), display:'flex', alignItems:'flex-end', padding:18 }}>
            <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top, rgba(20,20,14,.6), transparent 62%)' }} />
            <button onClick={()=>setCurInd(null)} style={{ position:'absolute', top:12, right:12, width:28, height:28, borderRadius:'50%', background:'rgba(0,0,0,.3)', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <i className="ti ti-x" style={{ fontSize:14 }} aria-hidden="true" />
            </button>
            <div style={{ position:'absolute', top:12, left:14, fontSize:34 }}>{sp.e}</div>
            <div style={{ position:'relative' }}>
              <div style={{ fontSize:10.5, color:'rgba(242,238,226,.7)', textTransform:'uppercase', letterSpacing:'1px' }}>{sp.n}</div>
              <div className="serif" style={{ fontSize:24, fontWeight:900, color:'#F2EEE2', lineHeight:1.05 }}>{ind.n}</div>
              <div style={{ fontSize:11.5, color:'rgba(242,238,226,.78)', marginTop:3 }}>{ind.note}</div>
            </div>
          </div>
          <div style={{ padding:'14px 18px 22px' }}>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(110px,1fr))', gap:8, marginBottom:14 }}>
              {[['Date',ind.d,'ti-calendar'],['Heure',ind.time||'—','ti-clock'],['Observé par',ind.by||'—','ti-user'],['Conditions',ind.weather||'—','ti-cloud']].map(([l,v,ic])=>(
                <div key={l} style={{ background:T.card, border:`1px solid ${T.line}`, borderRadius:10, padding:'8px 10px' }}>
                  <div style={{ fontSize:9.5, color:T.mute, textTransform:'uppercase', letterSpacing:'.5px', display:'flex', alignItems:'center', gap:4, marginBottom:3 }}>
                    <i className={`ti ${ic}`} style={{ fontSize:11 }} aria-hidden="true" />{l}
                  </div>
                  <div style={{ fontSize:12, fontWeight:600, color:T.ink }}>{v}</div>
                </div>
              ))}
            </div>
            {M && (
              <div style={{ display:'inline-flex', alignItems:'center', gap:6, background:M.c, color:M.on, padding:'5px 11px', borderRadius:14, fontSize:11.5, fontWeight:600, marginBottom:14 }}>
                {ind.method==='eye'?'👁':ind.method==='scope'?'🔭':ind.method==='night'?'🌙':'📷'} {M.l}
              </div>
            )}
            {ind.gps && <MiniMap gps={ind.gps} />}
            {ind.story && (
              <div style={{ background:T.card, border:`1px solid ${T.line}`, borderRadius:12, padding:13, marginBottom:9 }}>
                <div style={{ fontSize:10.5, fontWeight:600, color:T.mute, textTransform:'uppercase', letterSpacing:'.5px', marginBottom:7, display:'flex', alignItems:'center', gap:5 }}>
                  <i className="ti ti-quote" style={{ fontSize:12 }} aria-hidden="true" />Récit de {ind.by||'l\'observateur'}
                </div>
                <div className="serif" style={{ fontSize:13.5, color:T.ink, lineHeight:1.7, fontStyle:'italic' }}>« {ind.story} »</div>
              </div>
            )}
            {ind.desc && (
              <div style={{ background:T.card, border:`1px solid ${T.line}`, borderRadius:12, padding:13 }}>
                <div style={{ fontSize:10.5, fontWeight:600, color:T.mute, textTransform:'uppercase', letterSpacing:'.5px', marginBottom:6 }}>Description</div>
                <div style={{ fontSize:12.5, color:T.soft, lineHeight:1.6 }}>{ind.desc}</div>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // ═════ SCORES ═════
  const Scores = () => {
    const rows = PLAYERS.map(p=>({ ...p, pts:totalPts(p.name), spp:speciesPts(p.name), bp:badgePts(p.name), sps:SPECIES.filter(s=>(s.obs[p.name]||[]).length).length })).sort((a,b)=>b.pts-a.pts)
    const max = Math.max(rows[0].pts,1)
    return (
      <div style={{ padding: wide?'18px 40px 40px':'16px 20px 30px' }}>
        <div style={{ display:'grid', gridTemplateColumns: wide?'1fr 1fr':'1fr', gap:16 }}>
          <div>
            <div className="serif" style={{ fontSize:13, fontWeight:600, color:T.mute, textTransform:'uppercase', letterSpacing:'1px', marginBottom:12 }}>Classement</div>
            {rows.map((p,i)=>(
              <button key={p.id} onClick={()=>setCurPlayer(p.name)} style={{ width:'100%', textAlign:'left', background:T.card, border:`1px solid ${T.line}`, borderRadius:12, padding:'11px 13px', display:'flex', alignItems:'center', gap:11, marginBottom:7 }}>
                <span style={{ fontSize:16, width:24 }}>{['🥇','🥈','🥉','4️⃣'][i]}</span>
                <div className="serif" style={{ width:32, height:32, borderRadius:'50%', background:T.sage, color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:600, flexShrink:0 }}>{p.id}</div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div className="serif" style={{ fontSize:14, fontWeight:600, color:T.ink }}>{p.name}</div>
                  <div style={{ fontSize:11, color:T.mute }}>{p.sps} espèce{p.sps!==1?'s':''} · {p.bp} pts de badges</div>
                </div>
                <div style={{ flex:1, maxWidth:110, background:'#DDD3BE', borderRadius:5, height:7, overflow:'hidden' }}>
                  <div style={{ height:'100%', borderRadius:5, background:T.clay, width:`${Math.round(p.pts/max*100)}%` }} />
                </div>
                <div className="serif" style={{ fontSize:15, fontWeight:900, color:T.clay, minWidth:48, textAlign:'right' }}>{p.pts}</div>
                <i className="ti ti-chevron-right" style={{ fontSize:14, color:T.mute }} aria-hidden="true" />
              </button>
            ))}
            <div style={{ fontSize:11, color:T.mute, marginTop:6, display:'flex', alignItems:'center', gap:5 }}>
              <i className="ti ti-info-circle" style={{ fontSize:13 }} aria-hidden="true" />Clique sur un observateur pour le détail du calcul
            </div>
          </div>
          <div>
            <div className="serif" style={{ fontSize:13, fontWeight:600, color:T.mute, textTransform:'uppercase', letterSpacing:'1px', marginBottom:12 }}>Système de points</div>
            <div style={{ background:'#F0E4CF', border:'1px solid #DCC79E', borderRadius:12, padding:'11px 13px', marginBottom:9 }}>
              <div className="serif" style={{ fontSize:13, fontWeight:700, color:'#8F6A2E', marginBottom:4, display:'flex', alignItems:'center', gap:6 }}>
                <i className="ti ti-award" style={{ fontSize:15 }} aria-hidden="true" />Les badges rapportent gros
              </div>
              <div style={{ fontSize:11.5, color:'#6B5330', lineHeight:1.6 }}>
                De <b>35 à 300 points</b> chacun — souvent plus qu'une observation rare. Voir un ours vaut 300 pts, une trace de loup 200 pts.
                C'est là que se joue le classement.
              </div>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
              {[
                ['Rareté', Object.values(RARITY).map(r=>[r.l,`+${r.p}`])],
                ['Méthode', Object.values(METHODS).map(m=>[m.l,`×${m.mult}`])],
                ['Taille', [['Très petit','×1'],['Petit','×1.5'],['Moyen','×2'],['Grand','×2.5'],['Géant','×3']]],
                ['Bonus', [['👶 Bébés','+20'],['🏠 Terrier','+30'],['📸 Photo nette','+10']]],
              ].map(([title,items])=>(
                <div key={title} style={{ background:T.card, border:`1px solid ${T.line}`, borderRadius:10, padding:'9px 11px' }}>
                  <div className="serif" style={{ fontSize:12, fontWeight:600, color:T.ink, marginBottom:5 }}>{title}</div>
                  {items.map(([l,v])=>(
                    <div key={l} style={{ fontSize:10.5, color:T.soft, lineHeight:1.9, display:'flex', justifyContent:'space-between', gap:6 }}>
                      <span>{l}</span><span style={{ color:T.clay, fontWeight:600 }}>{v}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ═════ DÉTAIL D'UN SCORE ═════
  const ScoreSheet = () => {
    if (!curPlayer) return null
    const lines = SPECIES.filter(s=>(s.obs[curPlayer]||[]).length).map(s=>{
      const m = s.obs[curPlayer]
      const best = m.reduce((b,x)=>(METHODS[x]?.mult||0)>(METHODS[b]?.mult||0)?x:b, m[0])
      const bonuses = s.bonus[curPlayer]||[]
      return { s, best, bonuses, pts: calcPts(s, curPlayer) }
    }).sort((a,b)=>b.pts-a.pts)
    const myBadges = ACHIEVEMENTS.filter(a=>a.on && a.w.includes(curPlayer))
    const spTotal = speciesPts(curPlayer), bTotal = badgePts(curPlayer)
    return (
      <div style={{ position:'fixed', inset:0, background:'rgba(43,38,32,.55)', zIndex:70, display:'flex', alignItems: wide?'center':'flex-end', justifyContent:'center', padding: wide?24:0 }} onClick={()=>setCurPlayer(null)}>
        <div onClick={e=>e.stopPropagation()} style={{ background:T.bg, borderRadius: wide?20:'20px 20px 0 0', width:'100%', maxWidth:600, maxHeight: wide?'88vh':'92vh', overflow:'auto', border:`1px solid ${T.line}` }}>
          <div style={{ position:'sticky', top:0, background:T.surface, borderBottom:`1px solid ${T.line}`, padding:'14px 18px', display:'flex', alignItems:'center', gap:11, zIndex:2 }}>
            <div className="serif" style={{ width:38, height:38, borderRadius:'50%', background:T.sage, color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:15, fontWeight:700 }}>{curPlayer[0]}</div>
            <div style={{ flex:1 }}>
              <div className="serif" style={{ fontSize:18, fontWeight:900, color:T.ink }}>{curPlayer}</div>
              <div style={{ fontSize:11.5, color:T.mute }}>{lines.length} observation{lines.length!==1?'s':''} · {myBadges.length} badge{myBadges.length!==1?'s':''}</div>
            </div>
            <div className="serif" style={{ fontSize:22, fontWeight:900, color:T.clay }}>{spTotal+bTotal}</div>
            <button onClick={()=>setCurPlayer(null)} style={{ width:28, height:28, borderRadius:'50%', border:`1px solid ${T.line}`, color:T.soft, display:'flex', alignItems:'center', justifyContent:'center' }}>
              <i className="ti ti-x" style={{ fontSize:14 }} aria-hidden="true" />
            </button>
          </div>
          <div style={{ padding:'14px 18px 22px' }}>
            <div style={{ fontSize:10.5, fontWeight:600, color:T.mute, textTransform:'uppercase', letterSpacing:'.5px', marginBottom:8 }}>Observations · {spTotal} pts</div>
            {lines.map(({s,best,bonuses,pts})=>{
              const r = RARITY[s.r], M = METHODS[best]
              return (
                <div key={s.id} onClick={()=>{setCurPlayer(null);selSpFull(s.id)}} style={{ background:T.card, border:`1px solid ${T.line}`, borderRadius:10, padding:'9px 11px', marginBottom:6, cursor:'pointer' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:5 }}>
                    <span style={{ fontSize:16 }}>{s.e}</span>
                    <span style={{ fontSize:12.5, fontWeight:600, color:T.ink, flex:1 }}>{s.n}</span>
                    <span className="serif" style={{ fontSize:14, fontWeight:900, color:T.clay }}>{pts}</span>
                  </div>
                  <div style={{ fontSize:10.5, color:T.soft, display:'flex', flexWrap:'wrap', gap:4, alignItems:'center' }}>
                    <span style={{ padding:'1px 6px', borderRadius:8, background:r.c, color:'#fff' }}>{r.p}</span>
                    <span>×</span>
                    <span style={{ padding:'1px 6px', borderRadius:8, background:'#DDD3BE' }}>{SIZE_MULT[s.sz]} taille</span>
                    <span>×</span>
                    <span style={{ padding:'1px 6px', borderRadius:8, background:M.c, color:M.on }}>{M.mult} {M.l}</span>
                    {bonuses.map(b=><span key={b} style={{ padding:'1px 6px', borderRadius:8, background:'#F0E4CF', color:'#8F6A2E' }}>+{b==='bebe'?'20 bébés':'30 terrier'}</span>)}
                    <span style={{ marginLeft:'auto', fontWeight:600, color:T.ink }}>= {pts} pts</span>
                  </div>
                </div>
              )
            })}
            {myBadges.length>0 && <>
              <div style={{ fontSize:10.5, fontWeight:600, color:T.mute, textTransform:'uppercase', letterSpacing:'.5px', margin:'16px 0 8px' }}>Badges · {bTotal} pts</div>
              {myBadges.map(a=>(
                <div key={a.n} style={{ background:'#F0E4CF', border:'1px solid #DCC79E', borderRadius:10, padding:'9px 11px', marginBottom:6, display:'flex', alignItems:'center', gap:9 }}>
                  <span style={{ fontSize:19 }}>{a.e}</span>
                  <div style={{ flex:1 }}>
                    <div className="serif" style={{ fontSize:12.5, fontWeight:700, color:'#6B5330' }}>{a.n}</div>
                    <div style={{ fontSize:10.5, color:'#8F6A2E' }}>{a.d}</div>
                  </div>
                  <span className="serif" style={{ fontSize:14, fontWeight:900, color:'#8F4A22' }}>+{a.pts}</span>
                </div>
              ))}
            </>}
            <div style={{ marginTop:14, padding:'11px 13px', background:T.surface, borderRadius:10, border:`1px solid ${T.line}`, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <span className="serif" style={{ fontSize:14, fontWeight:700, color:T.ink }}>Total</span>
              <span className="serif" style={{ fontSize:20, fontWeight:900, color:T.clay }}>{spTotal} + {bTotal} = {spTotal+bTotal} pts</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ═════ BADGES ═════
  const Badges = () => {
    const on = ACHIEVEMENTS.filter(a=>a.on), off = ACHIEVEMENTS.filter(a=>!a.on)
    const G = ({ list, locked }) => (
      <div style={{ display:'grid', gridTemplateColumns:`repeat(auto-fill,minmax(${wide?150:130}px,1fr))`, gap:10, marginBottom:20 }}>
        {list.map(a=>(
          <div key={a.n} style={{ borderRadius:14, overflow:'hidden', position:'relative', minHeight:120, border:`1px solid ${locked?T.line:T.clay}` }}>
            <div style={{ position:'absolute', inset:0, background: locked?'#DDD3BE':gradientFor(a.n), opacity: locked?1:1 }} />
            {!locked && <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top, rgba(20,20,14,0.5), transparent 60%)' }} />}
            <div style={{ position:'relative', height:'100%', display:'flex', flexDirection:'column', justifyContent:'space-between', padding:12, minHeight:120 }}>
              <div style={{ fontSize:26, filter: locked?'grayscale(1)':'none', opacity: locked?0.35:1 }}>{a.e}</div>
              <div>
                <div className="serif" style={{ fontSize:13, fontWeight:600, color: locked?T.ink:'#F2EEE2' }}>{a.n}</div>
                <div style={{ fontSize:10, color: locked?T.mute:'rgba(242,238,226,0.8)', marginTop:2, lineHeight:1.35 }}>{a.d}</div>
                <div style={{ fontSize:10, color: locked?T.mute:T.leaf, marginTop:4, fontWeight:600 }}>{locked?'???':a.w}</div>
                <div className="serif" style={{ fontSize:12, fontWeight:900, color: locked?T.clay:'#F0D9A8', marginTop:3 }}>+{a.pts} pts</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
    return (
      <div style={{ padding: wide?'18px 40px 40px':'16px 20px 30px' }}>
        <div className="serif" style={{ fontSize:13, fontWeight:600, color:T.mute, textTransform:'uppercase', letterSpacing:'1px', marginBottom:10 }}>Débloqués ({on.length})</div>
        <G list={on} locked={false} />
        <div className="serif" style={{ fontSize:13, fontWeight:600, color:T.mute, textTransform:'uppercase', letterSpacing:'1px', marginBottom:10 }}>À débloquer ({off.length})</div>
        <G list={off} locked={true} />
      </div>
    )
  }

  // ═════ EXPLORE (split) ═════
  const Explore = () => {
    if (!wide) {
      return (
        <div style={{ padding:'10px 14px 26px' }}>
          <div style={{ display:'flex', gap:6, marginBottom:12 }}>
            {[['map','Mindmap','ti-hierarchy-2'],['matrix','Matrice','ti-layout-grid']].map(([v,l,ic])=>(
              <button key={v} onClick={()=>setMobileTab(v)} style={{ flex:1, fontSize:13, padding:'9px', borderRadius:14, border:`1px solid ${mobileTab===v?T.clay:T.line}`, background:mobileTab===v?T.clay:'transparent', color:mobileTab===v?'#fff':T.soft, fontWeight:600, display:'flex', alignItems:'center', justifyContent:'center', gap:5 }}>
                <i className={`ti ${ic}`} style={{ fontSize:14 }} aria-hidden="true" />{l}
              </button>
            ))}
          </div>
          <div style={{ background:T.surface, borderRadius:16, border:`1px solid ${T.line}`, overflow:'hidden' }}>
            {mobileTab==='map' ? <MindMap onSelectSpecies={selSpFull} /> : <MatrixPane compact />}
          </div>
        </div>
      )
    }

    const mapFlex = focus==='map' ? 3 : focus==='matrix' ? 1 : 1.15
    const matFlex = focus==='matrix' ? 3 : focus==='map' ? 1 : 1
    return (
      <div style={{ padding:'12px 24px 28px', display:'flex', gap:12, alignItems:'stretch', height:'calc(100vh - 132px)', minHeight:520 }}>
        <div onMouseEnter={()=>setFocus('map')} onClick={()=>setFocus('map')}
          style={{ flex:mapFlex, minWidth:0, background:T.surface, borderRadius:18, border:`1px solid ${focus==='map'?T.clay:T.line}`,
            overflow:'hidden', display:'flex', flexDirection:'column',
            transition:'flex .28s cubic-bezier(.4,0,.2,1), border-color .2s' }}>
          <PaneHeader title="La map du vivant" icon="ti-hierarchy-2" expanded={focus==='map'} onExpand={()=>setFocus(focus==='map'?null:'map')} />
          <div style={{ flex:1, overflow:'hidden' }}>
            <MindMap onSelectSpecies={selSpFull} />
          </div>
        </div>
        <div onMouseEnter={()=>setFocus('matrix')} onClick={()=>setFocus('matrix')}
          style={{ flex:matFlex, minWidth:0, background:T.bg, borderRadius:18, border:`1px solid ${focus==='matrix'?T.clay:T.line}`,
            overflow:'hidden', display:'flex', flexDirection:'column',
            transition:'flex .28s cubic-bezier(.4,0,.2,1), border-color .2s' }}>
          <PaneHeader title="Matrice des observations" icon="ti-layout-grid" expanded={focus==='matrix'} onExpand={()=>setFocus(focus==='matrix'?null:'matrix')} />
          <div style={{ flex:1, overflowY:'auto' }}>
            <MatrixPane compact={focus!=='matrix'} />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight:'100vh', background:T.bg }}>
      {/* HEADER */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding: wide?'12px 24px':'11px 16px', borderBottom:`1px solid ${T.line}`, background:T.surface, position:'sticky', top:0, zIndex:30 }}>
        <button onClick={()=>setScreen('landing')} className="serif" style={{ fontSize:20, fontWeight:900, color:T.ink, letterSpacing:'-0.5px', display:'flex', alignItems:'center', gap:7 }}>
          <i className="ti ti-leaf" style={{ fontSize:19, color:T.sageDark }} aria-hidden="true" />Pluduni
        </button>
        <div style={{ display:'flex', alignItems:'center', gap:7 }}>
          {edit && <span style={{ fontSize:10.5, color:T.clay, fontWeight:600, background:'#F0DDD0', padding:'4px 9px', borderRadius:12 }}>Édition</span>}
          <button onClick={()=>edit?setEdit(false):setPwOpen(true)} style={{ fontSize:11.5, color:T.soft, padding:'5px 10px', borderRadius:14, border:`1px solid ${T.line}`, display:'flex', alignItems:'center', gap:4 }}>
            <i className="ti ti-pencil" style={{ fontSize:13 }} aria-hidden="true" />{wide && (edit?'Quitter':'Édition')}
          </button>
        </div>
      </div>

      {/* TABS */}
      <div style={{ display:'flex', gap:8, padding: wide?'14px 24px 0':'12px 16px 0', flexWrap:'wrap', alignItems:'center' }}>
        {[['explore','Explorer','ti-map-2'],['scores','Scores','ti-trophy'],['badges','Badges','ti-award']].map(([id,label,icon])=>{
          const on = nav===id
          return (
            <button key={id} onClick={()=>setNav(id)} className="serif"
              style={{ fontSize: wide?17:15, fontWeight:on?900:500, color:on?'#fff':T.ink,
                background:on?T.clay:'transparent', padding: wide?'9px 18px':'8px 14px', borderRadius:24,
                border:on?'none':`1px solid ${T.line}`, display:'flex', alignItems:'center', gap:6 }}>
              <i className={`ti ${icon}`} style={{ fontSize:16 }} aria-hidden="true" />{label}
            </button>
          )
        })}
        {nav==='explore' && (
          <button onClick={()=>edit?showToast("L'ajout d'espèce arrive bientôt !"):setPwOpen(true)} className="serif"
            style={{ fontSize: wide?17:15, fontWeight:600, color:'#fff', background:T.sageDark, padding: wide?'9px 18px':'8px 14px', borderRadius:24, display:'flex', alignItems:'center', gap:6, marginLeft:'auto' }}>
            <i className="ti ti-plus" style={{ fontSize:16 }} aria-hidden="true" />{wide?'Ajouter une espèce':'Ajouter'}
          </button>
        )}
      </div>

      {nav==='explore' && <Explore />}
      {nav==='scores' && <Scores />}
      {nav==='badges' && <Badges />}

      {curSp && <Detail />}
      {curInd && <IndividuSheet />}
      {curPlayer && <ScoreSheet />}
      {toast && <Toast msg={toast} />}

      {pwOpen && (
        <div style={{ position:'fixed', inset:0, background:'rgba(43,38,32,0.45)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:70, padding:20 }} onClick={()=>{ setPwOpen(false); setPw('') }}>
          <div onClick={e=>e.stopPropagation()} style={{ background:T.bg, borderRadius:18, padding:24, width:'100%', maxWidth:340, border:`1px solid ${T.line}` }}>
            <div className="serif" style={{ fontSize:19, fontWeight:900, color:T.ink, marginBottom:6 }}>Mode édition</div>
            <div style={{ fontSize:12.5, color:T.soft, marginBottom:14 }}>Entre le mot de passe pour modifier le Pokédex.</div>
            <input type="password" value={pw} onChange={e=>setPw(e.target.value)} onKeyDown={e=>e.key==='Enter'&&submitPw()} placeholder="Mot de passe" autoFocus
              style={{ width:'100%', padding:'10px 12px', borderRadius:10, border:`1px solid ${T.line}`, background:T.card, fontSize:13, marginBottom:12, color:T.ink }} />
            <div style={{ display:'flex', gap:8 }}>
              <button onClick={()=>{ setPwOpen(false); setPw('') }} style={{ flex:1, padding:'9px', borderRadius:10, border:`1px solid ${T.line}`, color:T.soft, fontSize:13 }}>Annuler</button>
              <button onClick={submitPw} className="serif" style={{ flex:1, padding:'9px', borderRadius:10, background:T.clay, color:'#fff', fontSize:13, fontWeight:600 }}>Déverrouiller</button>
            </div>
            <div style={{ fontSize:10.5, color:T.mute, marginTop:10, textAlign:'center' }}>Indice démo : « pluduni »</div>
          </div>
        </div>
      )}
    </div>
  )
}


function MiniMap({ gps }) {
  const [lat, lon] = gps
  const bbox = [lon-0.006, lat-0.003, lon+0.006, lat+0.003].join('%2C')
  const src = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat}%2C${lon}`
  return (
    <div style={{ borderRadius:12, overflow:'hidden', border:'1px solid #D3C7AE', marginBottom:9 }}>
      <iframe title="Localisation" src={src} style={{ width:'100%', height:170, border:'none', display:'block' }} loading="lazy" />
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'7px 11px', background:'#E6DDC8', fontSize:11, color:'#6B6357' }}>
        <span style={{ display:'flex', alignItems:'center', gap:5 }}>
          <i className="ti ti-map-pin" style={{ fontSize:13, color:'#B5602F' }} aria-hidden="true" />
          {lat.toFixed(4)}° N · {lon.toFixed(4)}° E
        </span>
        <a href={`https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=16/${lat}/${lon}`} target="_blank" rel="noreferrer" style={{ color:'#8F4A22', textDecoration:'none', fontWeight:600 }}>Ouvrir ↗</a>
      </div>
    </div>
  )
}

function Toast({ msg }) {
  return (
    <div style={{ position:'fixed', bottom:24, left:'50%', transform:'translateX(-50%)', zIndex:90,
      background:'#2B2620', color:'#F2EEE2', padding:'13px 20px', borderRadius:14, fontSize:13,
      maxWidth:'90vw', boxShadow:'0 8px 28px rgba(0,0,0,0.25)', display:'flex', alignItems:'center', gap:9 }}>
      <i className="ti ti-alert-circle" style={{ fontSize:17, color:'#C8DBA4' }} aria-hidden="true" />
      <span>{msg}</span>
    </div>
  )
}
