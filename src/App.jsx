import { useState } from 'react'
import { SPECIES, CATS, PLAYERS, RARITY, ACHIEVEMENTS, calcPts, totalPts } from './data'

const C = {
  bg: '#F7F6F3', surface: '#FFFFFF', s1: '#F0EEE9', s0: '#ECEAE4',
  border: '#E4E2DC', borderStrong: '#C8C6C0',
  text: '#1A1A18', textSec: '#6B6B67', textMuted: '#9B9B96',
  accent: '#2563EB', accentBg: '#EFF6FF', accentBorder: '#93C5FD', accentText: '#1D4ED8',
  success: '#16A34A', successBg: '#F0FDF4', successBorder: '#BBF7D0', successText: '#15803D',
  warning: '#D97706', warningBg: '#FFFBEB', warningText: '#92400E',
  pro: '#7C3AED', proBg: '#F5F3FF', proBorder: '#C4B5FD', proText: '#6D28D9',
  danger: '#DC2626', dangerBg: '#FEF2F2', dangerBorder: '#FCA5A5', dangerText: '#B91C1C',
}

const s = {
  app: { minHeight:'100vh', display:'flex', flexDirection:'column', background:C.bg, maxWidth:700, margin:'0 auto' },
  header: { padding:'10px 16px', borderBottom:`0.5px solid ${C.border}`, display:'flex', alignItems:'center', justifyContent:'space-between', background:C.surface, position:'sticky', top:0, zIndex:10 },
  logo: { fontSize:17, fontWeight:600, color:C.text },
  logoEm: { color:C.accent },
  navBar: { display:'flex', borderBottom:`0.5px solid ${C.border}`, background:C.surface, overflowX:'auto' },
  navTab: (on) => ({ padding:'8px 14px', fontSize:12, color:on?C.accent:C.textSec, cursor:'pointer', borderBottom:`2px solid ${on?C.accent:'transparent'}`, fontWeight:on?500:400, whiteSpace:'nowrap', transition:'all .15s' }),
  body: { flex:1, overflowY:'auto', padding:'14px 16px' },
  secTitle: { fontSize:10, fontWeight:500, color:C.textMuted, textTransform:'uppercase', letterSpacing:'.6px', marginBottom:8 },
  catGrid: { display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(110px,1fr))', gap:8, marginBottom:16 },
  catCard: (on) => ({ background:on?C.accentBg:C.s1, border:`0.5px solid ${on?C.accentBorder:C.border}`, borderRadius:10, padding:'12px 10px', cursor:'pointer', transition:'all .15s' }),
  spGrid: { display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(130px,1fr))', gap:8 },
  spCard: { background:C.surface, border:`0.5px solid ${C.border}`, borderRadius:10, overflow:'hidden', cursor:'pointer', transition:'all .15s' },
  spImg: { height:65, display:'flex', alignItems:'center', justifyContent:'center', fontSize:30, background:C.s1, position:'relative' },
  tag: (bg,tc,bc) => ({ fontSize:9, padding:'2px 5px', borderRadius:8, background:bg, color:tc, border:`0.5px solid ${bc||tc}`, fontWeight:500 }),
  back: { display:'flex', alignItems:'center', gap:5, fontSize:11, color:C.textSec, cursor:'pointer', background:'none', border:'none', padding:0, marginBottom:12 },
  detHeader: { display:'flex', gap:12, marginBottom:14 },
  detEmoji: { fontSize:42, background:C.s1, borderRadius:10, width:68, height:68, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 },
  tabBar: { display:'flex', borderBottom:`0.5px solid ${C.border}`, marginBottom:12 },
  tab: (on) => ({ fontSize:11, padding:'6px 12px', color:on?C.accent:C.textSec, cursor:'pointer', borderBottom:`2px solid ${on?C.accent:'transparent'}`, fontWeight:on?500:400, transition:'all .15s' }),
  obsGrid: { display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:6, marginBottom:12 },
  obsBox: (ok) => ({ background:ok?C.successBg:C.s1, border:`0.5px solid ${ok?C.successBorder:C.border}`, borderRadius:8, padding:8, textAlign:'center' }),
  infoBlock: { background:C.s1, border:`0.5px solid ${C.border}`, borderRadius:8, padding:10, marginBottom:8 },
  indRow: { background:C.s1, border:`0.5px solid ${C.border}`, borderRadius:8, padding:'8px 10px', marginBottom:6, display:'flex', alignItems:'center', gap:8 },
  scoreRow: { background:C.s1, border:`0.5px solid ${C.border}`, borderRadius:8, padding:'10px 12px', display:'flex', alignItems:'center', gap:10, marginBottom:6 },
  achCard: (on) => ({ background:on?C.warningBg:C.s1, border:`0.5px solid ${on?'#F59E0B':C.border}`, borderRadius:8, padding:8, textAlign:'center' }),
  achGrid: { display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(120px,1fr))', gap:6 },
}

const RC = {
  commun:     { fill:'#F0FDF4', stroke:'#16A34A', text:'#15803D' },
  peu_commun: { fill:'#EFF6FF', stroke:'#2563EB', text:'#1D4ED8' },
  rare:       { fill:'#F5F3FF', stroke:'#7C3AED', text:'#6D28D9' },
  tres_rare:  { fill:'#FEF2F2', stroke:'#DC2626', text:'#B91C1C' },
}

function MindMap({ species, cat, onSelectSpecies, onSelectCat }) {
  const W = 560, H = 400, cx = W/2, cy = H/2
  const subs = cat ? [...new Set(species.map(s=>s.sub))] : CATS.map(c=>c.id)
  const subAngle = (2*Math.PI) / Math.max(subs.length, 1)
  const DSUB = cat ? 120 : 130, DLEAF = 72

  let lines = [], nodes = []

  if (!cat) {
    // Root mindmap — all categories
    CATS.forEach((c, ci) => {
      const sa = subAngle*ci - Math.PI/2
      const sx = cx + DSUB*Math.cos(sa), sy = cy + DSUB*Math.sin(sa)
      const catSpecies = SPECIES.filter(s=>s.cat===c.id)
      const observed = catSpecies.filter(s=>Object.values(s.obs).some(v=>v.length)).length
      lines.push(<line key={`l${ci}`} x1={cx} y1={cy} x2={sx} y2={sy} stroke="#D1D5DB" strokeWidth="1.5" strokeDasharray="5,3"/>)
      // Leaf species around each cat (max 4 shown)
      catSpecies.slice(0,4).forEach((sp, li) => {
        const spread = catSpecies.slice(0,4).length > 1 ? 0.5 : 0
        const la = sa + spread*(li-(Math.min(catSpecies.length,4)-1)/2)
        const lx = sx + DLEAF*Math.cos(la), ly = sy + DLEAF*Math.sin(la)
        const hasObs = Object.values(sp.obs).some(v=>v.length)
        const rc = RC[sp.r]
        lines.push(<line key={`ll${ci}-${li}`} x1={sx} y1={sy} x2={lx} y2={ly} stroke="#E5E7EB" strokeWidth="1"/>)
        nodes.push(
          <g key={`sp${sp.id}`} style={{cursor:'pointer'}} onClick={()=>onSelectSpecies(sp.id)}>
            <circle cx={lx} cy={ly} r={18} fill={hasObs?rc.fill:'#F9FAFB'} stroke={hasObs?rc.stroke:'#D1D5DB'} strokeWidth={hasObs?2:1}/>
            <text x={lx} y={ly+1} textAnchor="middle" dominantBaseline="middle" fontSize="13">{sp.e}</text>
            <text x={lx} y={ly+26} textAnchor="middle" fontSize="7.5" fill={hasObs?rc.text:'#9CA3AF'} fontFamily="sans-serif">{sp.n.split(' ')[0]}</text>
          </g>
        )
      })
      nodes.push(
        <g key={`cat${c.id}`} style={{cursor:'pointer'}} onClick={()=>onSelectCat(c.id)}>
          <circle cx={sx} cy={sy} r={28} fill="#EFF6FF" stroke="#93C5FD" strokeWidth="1.5"/>
          <text x={sx} y={sy-5} textAnchor="middle" fontSize="16" dominantBaseline="middle">{c.e}</text>
          <text x={sx} y={sy+12} textAnchor="middle" fontSize="8" fill="#1D4ED8" fontWeight="500" fontFamily="sans-serif">{c.n}</text>
          <text x={sx} y={sy+22} textAnchor="middle" fontSize="7" fill="#93C5FD" fontFamily="sans-serif">{observed}/{catSpecies.length}</text>
        </g>
      )
    })
    nodes.unshift(
      <g key="center">
        <circle cx={cx} cy={cy} r={36} fill="#F5F3FF" stroke="#7C3AED" strokeWidth="2"/>
        <text x={cx} y={cy-6} textAnchor="middle" fontSize="18" dominantBaseline="middle">🌿</text>
        <text x={cx} y={cy+14} textAnchor="middle" fontSize="9" fill="#6D28D9" fontWeight="600" fontFamily="sans-serif">Pluduni</text>
      </g>
    )
  } else {
    // Category mindmap
    subs.forEach((sub, si) => {
      const sa = subAngle*si - Math.PI/2
      const sx = cx + DSUB*Math.cos(sa), sy = cy + DSUB*Math.sin(sa)
      const members = species.filter(s=>s.sub===sub)
      lines.push(<line key={`l${si}`} x1={cx} y1={cy} x2={sx} y2={sy} stroke="#D1D5DB" strokeWidth="1.5" strokeDasharray="5,3"/>)
      const spread = members.length > 1 ? 0.55 : 0
      members.forEach((sp, li) => {
        const la = sa + spread*(li-(members.length-1)/2)
        const lx = sx + DLEAF*Math.cos(la), ly = sy + DLEAF*Math.sin(la)
        const hasObs = Object.values(sp.obs).some(v=>v.length)
        const rc = RC[sp.r]
        lines.push(<line key={`ll${si}-${li}`} x1={sx} y1={sy} x2={lx} y2={ly} stroke="#E5E7EB" strokeWidth="1"/>)
        nodes.push(
          <g key={sp.id} style={{cursor:'pointer'}} onClick={()=>onSelectSpecies(sp.id)}>
            <circle cx={lx} cy={ly} r={22} fill={hasObs?rc.fill:'#F9FAFB'} stroke={hasObs?rc.stroke:'#D1D5DB'} strokeWidth={hasObs?2:1}/>
            <text x={lx} y={ly+1} textAnchor="middle" dominantBaseline="middle" fontSize="15">{sp.e}</text>
            <text x={lx} y={ly+30} textAnchor="middle" fontSize="8" fill={hasObs?rc.text:'#9CA3AF'} fontFamily="sans-serif">{sp.n.split(' ')[0]}</text>
            {hasObs && <text x={lx} y={ly+40} textAnchor="middle" fontSize="7" fill={rc.stroke} fontFamily="sans-serif">{RARITY[sp.r].p}pts</text>}
          </g>
        )
      })
      nodes.push(
        <g key={`sub${sub}`} style={{cursor:'pointer'}}>
          <circle cx={sx} cy={sy} r={26} fill="#EFF6FF" stroke="#93C5FD" strokeWidth="1.5"/>
          <text x={sx} y={sy} textAnchor="middle" dominantBaseline="middle" fontSize="8.5" fill="#1D4ED8" fontWeight="500" fontFamily="sans-serif">{sub}</text>
        </g>
      )
    })
    const catObj = CATS.find(c=>c.id===cat)
    nodes.unshift(
      <g key="center">
        <circle cx={cx} cy={cy} r={34} fill="#F5F3FF" stroke="#7C3AED" strokeWidth="2"/>
        <text x={cx} y={cy-5} textAnchor="middle" fontSize="18" dominantBaseline="middle">{catObj?.e}</text>
        <text x={cx} y={cy+14} textAnchor="middle" fontSize="9" fill="#6D28D9" fontWeight="600" fontFamily="sans-serif">{catObj?.n}</text>
      </g>
    )
  }

  return (
    <div style={{background:C.surface,border:`0.5px solid ${C.border}`,borderRadius:10,overflow:'hidden'}}>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} xmlns="http://www.w3.org/2000/svg">
        {lines}{nodes}
      </svg>
      <div style={{display:'flex',gap:10,flexWrap:'wrap',padding:'8px 12px',borderTop:`0.5px solid ${C.border}`,fontSize:10,color:C.textSec}}>
        {Object.entries(RC).map(([k,rc])=>(
          <span key={k}><span style={{display:'inline-block',width:10,height:10,borderRadius:'50%',background:rc.fill,border:`1.5px solid ${rc.stroke}`,marginRight:4,verticalAlign:'middle'}}/>{RARITY[k].l}</span>
        ))}
        <span><span style={{display:'inline-block',width:10,height:10,borderRadius:'50%',background:'#F9FAFB',border:'1.5px solid #D1D5DB',marginRight:4,verticalAlign:'middle'}}/>Non observé</span>
      </div>
    </div>
  )
}

export default function App() {
  const [nav, setNav] = useState('explore')
  const [curCat, setCurCat] = useState(null)
  const [curSub, setCurSub] = useState('Tous')
  const [curSp, setCurSp] = useState(null)
  const [detTab, setDetTab] = useState('obs')
  const [view, setView] = useState('mindmap')

  const selCat = (c) => { setCurCat(c); setCurSub('Tous'); setCurSp(null) }
  const selSp = (id) => { setCurSp(id); setDetTab('obs') }
  const selSpFull = (id) => { const sp = SPECIES.find(s=>s.id===id); setCurCat(sp?.cat); setCurSp(id); setDetTab('obs'); setNav('explore') }
  const goBack = () => { if(curSp) setCurSp(null); else setCurCat(null) }
  const goHome = () => { setCurCat(null); setCurSp(null) }

  const filteredSp = () => {
    let f = SPECIES.filter(s=>s.cat===curCat)
    if(curSub !== 'Tous') f = f.filter(s=>s.sub===curSub)
    return f
  }

  const sp = SPECIES.find(s=>s.id===curSp)
  const catObj = CATS.find(c=>c.id===curCat)

  const BreadCrumb = () => {
    const parts = curSp ? [catObj?.n, sp?.n] : curCat ? [catObj?.n] : ['Accueil']
    return <div style={{fontSize:11,color:C.textMuted,display:'flex',alignItems:'center',gap:4}}>
      {parts.map((p,i) => <span key={i}>{i>0&&<span style={{margin:'0 3px',color:C.textMuted}}>/</span>}<span style={i===parts.length-1?{color:C.text,fontWeight:500}:{}}>{p}</span></span>)}
    </div>
  }

  // ── DETAIL VIEW ─────────────────────────────────────────────────────────────
  const DetailView = () => {
    if(!sp) return null
    const r = RARITY[sp.r]
    const allM = new Set(Object.values(sp.obs).flat())
    const baseP = Math.round(r.p * (sp.sz==='xs'?1:sp.sz==='s'?1.5:sp.sz==='m'?2:sp.sz==='l'?2.5:3))
    return <>
      <button style={s.back} onClick={goBack}>← {catObj?.n || 'Retour'}</button>
      <div style={s.detHeader}>
        <div style={s.detEmoji}>{sp.e}</div>
        <div>
          <div style={{fontSize:16,fontWeight:500,color:C.text}}>{sp.n}</div>
          <div style={{fontSize:11,color:C.textMuted,fontStyle:'italic'}}>{sp.lat}</div>
          <div style={{display:'flex',gap:4,marginTop:6,flexWrap:'wrap'}}>
            <span style={s.tag(r.bg,r.tc)}>{r.l}</span>
            {allM.has('eye') && <span style={s.tag(C.successBg,C.successText,C.successBorder)}>👁️ Direct</span>}
            {allM.has('cam') && <span style={s.tag(C.accentBg,C.accentText,C.accentBorder)}>📷 Caméra</span>}
            {allM.has('night') && <span style={s.tag(C.proBg,C.proText,C.proBorder)}>🌙 Nuit</span>}
          </div>
          <div style={{fontSize:12,fontWeight:500,color:C.warning,marginTop:5}}>⭐ {baseP}pts base · max {baseP*3+50}pts</div>
        </div>
      </div>
      <div style={s.tabBar}>
        {['obs','individus','infos'].map(t=><div key={t} style={s.tab(detTab===t)} onClick={()=>setDetTab(t)}>{t==='obs'?'Observations':t==='individus'?'Individus':'Infos'}</div>)}
      </div>
      {detTab==='obs' && <>
        <div style={s.obsGrid}>
          {PLAYERS.map(pl=>{const m=sp.obs[pl.name]||[];const best=m.includes('eye')?'eye':m.includes('night')?'night':m.includes('cam')?'cam':null;const ico=best==='eye'?'👁️':best==='night'?'🌙':best==='cam'?'📷':'—';const p2=calcPts(sp,pl.name);return<div key={pl.id} style={s.obsBox(!!best)}><div style={{fontSize:14,marginBottom:2}}>{ico}</div><div style={{fontSize:9,color:C.textSec}}>{pl.name}</div><div style={{fontSize:10,fontWeight:500,color:C.text,marginTop:1}}>{p2?p2+'pts':'—'}</div></div>})}
        </div>
        {Object.entries(sp.bonus||{}).some(([,b])=>b.length) && <div style={{marginTop:6}}>
          <div style={{...s.secTitle,marginBottom:5}}>Bonus obtenus</div>
          {Object.entries(sp.bonus).map(([pl,bs])=>bs.map(b=><div key={b} style={{fontSize:10,color:C.textSec,marginBottom:3}}>• <b>{pl}</b> : {b==='terrier'?'🏠 Terrier trouvé (+30pts)':b==='bebe'?'👶 Bébés observés (+20pts)':b}</div>))}
        </div>}
      </>}
      {detTab==='individus' && sp.inds.map((ind,i)=>(
        <div key={i} style={s.indRow}>
          <span style={{fontSize:18}}>{sp.e}</span>
          <div style={{flex:1}}><div style={{fontSize:11,fontWeight:500,color:C.text}}>{ind.n}</div><div style={{fontSize:10,color:C.textSec}}>{ind.note}</div></div>
          <div style={{fontSize:10,color:C.textMuted}}>{ind.d}</div>
          {ind.b.length>0 && <div style={{display:'flex',gap:3}}>{ind.b.map(b=><span key={b} style={s.tag(C.warningBg,'#92400E','#FCD34D')}>{b==='bebe'?'👶 Juvénile':b==='adulte'?'🦁 Adulte':'⭐'}</span>)}</div>}
        </div>
      ))}
      {detTab==='infos' && <>
        <div style={s.infoBlock}><div style={{...s.secTitle,marginBottom:6}}>Alimentation</div><p style={{fontSize:11,color:C.textSec,lineHeight:1.6}}>{sp.alim}</p></div>
        <div style={s.infoBlock}><div style={{...s.secTitle,marginBottom:6}}>Habitat & territoire</div><p style={{fontSize:11,color:C.textSec,lineHeight:1.6}}>{sp.hab}</p></div>
        <div style={s.infoBlock}><div style={{...s.secTitle,marginBottom:6}}>Danger</div><p style={{fontSize:11,color:C.textSec,lineHeight:1.6}}>{sp.dng}</p></div>
        <div style={s.infoBlock}><div style={{...s.secTitle,marginBottom:6}}>Calcul des points</div><p style={{fontSize:11,color:C.textSec,lineHeight:1.8}}>Rareté {r.l} ({r.p}pts) × taille (×{sp.sz==='xs'?1:sp.sz==='s'?1.5:sp.sz==='m'?2:sp.sz==='l'?2.5:3}) = <strong>{baseP}pts base</strong><br/>Vue directe ×3 · Vision nocturne ×2 · Caméra ×1<br/>+20pts bébés · +30pts gîte/terrier trouvé</p></div>
      </>}
    </>
  }

  // ── LIST VIEW ────────────────────────────────────────────────────────────────
  const ListView = () => {
    const sps = filteredSp()
    const subs = catObj?.subs || ['Tous']
    return <>
      <button style={s.back} onClick={goHome}>← Accueil</button>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:10}}>
        <div style={{fontSize:14,fontWeight:500,color:C.text}}>{catObj?.e} {catObj?.n}</div>
        <div style={{display:'flex',gap:4}}>
          {['mindmap','grid'].map(v=><button key={v} onClick={()=>setView(v)} style={{fontSize:10,padding:'3px 9px',borderRadius:12,cursor:'pointer',border:`0.5px solid ${view===v?C.accentBorder:C.border}`,background:view===v?C.accentBg:'transparent',color:view===v?C.accentText:C.textSec}}>{v==='mindmap'?'🗺️ Mindmap':'📋 Grille'}</button>)}
        </div>
      </div>
      <div style={{display:'flex',gap:6,flexWrap:'wrap',marginBottom:12}}>
        {subs.map(sub=><div key={sub} onClick={()=>setCurSub(sub)} style={{fontSize:10,padding:'4px 10px',borderRadius:14,cursor:'pointer',border:`0.5px solid ${curSub===sub?C.accentBorder:C.border}`,background:curSub===sub?C.accentBg:C.s1,color:curSub===sub?C.accentText:C.textSec,fontWeight:curSub===sub?500:400}}>{sub}</div>)}
      </div>
      {view==='mindmap'
        ? <MindMap species={sps} cat={curCat} onSelectSpecies={selSp} onSelectCat={selCat}/>
        : <div style={s.spGrid}>
            {sps.map(sp2=>{
              const r=RARITY[sp2.r]; const ms=new Set(Object.values(sp2.obs).flat())
              return <div key={sp2.id} style={s.spCard} onClick={()=>selSp(sp2.id)}>
                <div style={s.spImg}>
                  {sp2.e}
                  <span style={{...s.tag(r.bg,r.tc),position:'absolute',top:4,left:4}}>{r.l}</span>
                </div>
                <div style={{padding:8}}>
                  <div style={{fontSize:11,fontWeight:500,color:C.text}}>{sp2.n}</div>
                  <div style={{fontSize:9,color:C.textMuted,fontStyle:'italic'}}>{sp2.lat}</div>
                  <div style={{display:'flex',gap:3,marginTop:5,flexWrap:'wrap'}}>
                    {ms.has('eye')&&<span style={s.tag(C.successBg,C.successText,C.successBorder)}>👁️</span>}
                    {ms.has('cam')&&<span style={s.tag(C.accentBg,C.accentText,C.accentBorder)}>📷</span>}
                    {ms.has('night')&&<span style={s.tag(C.proBg,C.proText,C.proBorder)}>🌙</span>}
                    {!ms.size&&<span style={{fontSize:9,color:C.textMuted}}>Non observé</span>}
                  </div>
                </div>
              </div>
            })}
          </div>
      }
    </>
  }

  // ── HOME VIEW ────────────────────────────────────────────────────────────────
  const HomeView = () => <>
    <MindMap species={SPECIES} cat={null} onSelectSpecies={selSpFull} onSelectCat={selCat}/>
    <div style={{marginTop:14,...s.secTitle}}>Catégories</div>
    <div style={s.catGrid}>
      {CATS.map(c=>{const cnt=SPECIES.filter(s=>s.cat===c.id).length;const obs=SPECIES.filter(s=>s.cat===c.id&&Object.values(s.obs).some(v=>v.length)).length;return<div key={c.id} style={s.catCard(false)} onClick={()=>selCat(c.id)}><div style={{fontSize:20,marginBottom:4}}>{c.e}</div><div style={{fontSize:12,fontWeight:500,color:C.text}}>{c.n}</div><div style={{fontSize:10,color:C.textMuted,marginTop:2}}>{obs}/{cnt} observées</div></div>})}
    </div>
    <div style={s.secTitle}>Dernières observations</div>
    {SPECIES.filter(s=>Object.values(s.obs).some(v=>v.length)).slice(0,4).map(s2=><div key={s2.id} onClick={()=>selSpFull(s2.id)} style={{background:C.s1,border:`0.5px solid ${C.border}`,borderRadius:8,padding:'8px 10px',display:'flex',alignItems:'center',gap:8,cursor:'pointer',marginBottom:6}}><span style={{fontSize:16}}>{s2.e}</span><div style={{flex:1}}><div style={{fontSize:11,fontWeight:500,color:C.text}}>{s2.n}</div><div style={{fontSize:9,color:C.textMuted}}>{s2.sub}</div></div><span style={s.tag(RARITY[s2.r].bg,RARITY[s2.r].tc)}>{RARITY[s2.r].p}pts</span></div>)}
  </>

  // ── MATRIX VIEW ──────────────────────────────────────────────────────────────
  const MatrixView = () => {
    const cats2 = [...new Set(SPECIES.map(s=>s.cat))]
    return <div style={{overflowX:'auto'}}>
      {cats2.map(cat2=>{
        const co=CATS.find(c=>c.id===cat2); const sps=SPECIES.filter(s=>s.cat===cat2)
        return <div key={cat2}>
          <div style={{...s.secTitle,margin:'12px 0 6px'}}>{co?.e} {co?.n}</div>
          <table style={{width:'100%',borderCollapse:'collapse',fontSize:11}}>
            <thead><tr>
              <th style={{padding:'6px 8px',textAlign:'left',color:C.textMuted,fontSize:10,fontWeight:500,borderBottom:`0.5px solid ${C.border}`,minWidth:130}}>Espèce</th>
              <th style={{padding:'6px 8px',color:C.textMuted,fontSize:10,fontWeight:500,borderBottom:`0.5px solid ${C.border}`}}>Rareté</th>
              {PLAYERS.map(p=><th key={p.id} style={{padding:'6px 8px',textAlign:'center',color:p.tc,fontSize:10,fontWeight:500,borderBottom:`0.5px solid ${C.border}`,minWidth:55}}>{p.id}</th>)}
              <th style={{padding:'6px 8px',textAlign:'center',color:C.textMuted,fontSize:10,fontWeight:500,borderBottom:`0.5px solid ${C.border}`}}>Max</th>
            </tr></thead>
            <tbody>{sps.map(sp2=>{
              const r=RARITY[sp2.r]; const mx=Math.round(r.p*(sp2.sz==='xs'?1:sp2.sz==='s'?1.5:sp2.sz==='m'?2:sp2.sz==='l'?2.5:3)*3+50)
              return <tr key={sp2.id} onClick={()=>selSpFull(sp2.id)} style={{cursor:'pointer'}}>
                <td style={{padding:'6px 8px',borderBottom:`0.5px solid ${C.border}`}}>
                  <div style={{display:'flex',alignItems:'center',gap:6}}><span style={{fontSize:15}}>{sp2.e}</span><div><div style={{fontSize:11,fontWeight:500,color:C.text}}>{sp2.n}</div><div style={{fontSize:9,color:C.textMuted,fontStyle:'italic'}}>{sp2.lat}</div></div></div>
                </td>
                <td style={{padding:'6px 8px',borderBottom:`0.5px solid ${C.border}`}}><span style={s.tag(r.bg,r.tc)}>{r.l}</span></td>
                {PLAYERS.map(pl=>{
                  const m=sp2.obs[pl.name]||[]; const best=m.includes('eye')?'eye':m.includes('night')?'night':m.includes('cam')?'cam':null
                  const ico=best==='eye'?'👁️':best==='night'?'🌙':best==='cam'?'📷':'—'
                  const bg=best==='eye'?C.successBg:best==='night'?C.proBg:best==='cam'?C.accentBg:C.s0
                  const bc=best==='eye'?C.successBorder:best==='night'?C.proBorder:best==='cam'?C.accentBorder:C.border
                  return <td key={pl.id} style={{padding:'6px 8px',borderBottom:`0.5px solid ${C.border}`}}>
                    <div style={{width:26,height:26,borderRadius:'50%',background:bg,border:`1.5px solid ${bc}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,margin:'0 auto'}}>{ico}</div>
                  </td>
                })}
                <td style={{padding:'6px 8px',borderBottom:`0.5px solid ${C.border}`,textAlign:'center',fontSize:10,fontWeight:500,color:C.warning}}>⭐{mx}</td>
              </tr>
            })}</tbody>
          </table>
        </div>
      })}
      <div style={{display:'flex',gap:10,marginTop:10,flexWrap:'wrap',fontSize:10,color:C.textSec}}>
        <span>Légende :</span><span>👁️ Direct ×3pts</span><span>🌙 Nuit ×2pts</span><span>📷 Caméra ×1pt</span>
      </div>
    </div>
  }

  // ── SCORES VIEW ──────────────────────────────────────────────────────────────
  const ScoresView = () => {
    const sorted = PLAYERS.map(p=>({...p,pts:totalPts(p.name),sps:SPECIES.filter(s=>(s.obs[p.name]||[]).length).length})).sort((a,b)=>b.pts-a.pts)
    const mx = sorted[0].pts
    const podOrder = [1,0,2]; const podH = [60,90,50]
    return <>
      <div style={s.secTitle}>Classement</div>
      <div style={{display:'flex',justifyContent:'center',alignItems:'flex-end',gap:10,margin:'10px 0 18px',padding:'10px 0'}}>
        {podOrder.map((ri,pi)=>{const p=sorted[ri];if(!p)return null;const medals=['🥇','🥈','🥉'];return<div key={p.id} style={{display:'flex',flexDirection:'column',alignItems:'center',gap:3}}>
          <div style={{fontSize:pi===1?20:14}}>{medals[ri]}</div>
          <div style={{width:pi===1?46:36,height:pi===1?46:36,borderRadius:'50%',background:p.bg,color:p.tc,display:'flex',alignItems:'center',justifyContent:'center',fontSize:pi===1?17:13,fontWeight:500}}>{p.id}</div>
          <div style={{fontSize:10,color:C.textSec}}>{p.name}</div>
          <div style={{fontSize:12,fontWeight:500,color:C.text}}>{p.pts}pts</div>
          <div style={{width:pi===1?46:36,height:podH[pi],background:p.bar,opacity:.7,borderRadius:'4px 4px 0 0'}}/>
        </div>})}
      </div>
      <div style={{marginBottom:16}}>
        {sorted.map((p,i)=><div key={p.id} style={s.scoreRow}>
          <span style={{fontSize:16}}>{['🥇','🥈','🥉','4️⃣'][i]}</span>
          <div style={{width:32,height:32,borderRadius:'50%',background:p.bg,color:p.tc,display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,fontWeight:500,flexShrink:0}}>{p.id}</div>
          <div style={{flex:1}}><div style={{fontSize:12,fontWeight:500,color:C.text}}>{p.name}</div><div style={{fontSize:10,color:C.textMuted}}>{p.sps} espèce{p.sps!==1?'s':''} observée{p.sps!==1?'s':''}</div></div>
          <div style={{flex:1,background:C.s0,borderRadius:4,height:6,overflow:'hidden'}}><div style={{height:'100%',borderRadius:4,background:p.bar,width:`${Math.round(p.pts/mx*100)}%`}}/></div>
          <div style={{fontSize:13,fontWeight:500,color:C.warning,minWidth:50,textAlign:'right'}}>⭐{p.pts}</div>
        </div>)}
      </div>
      <div style={s.secTitle}>Système de points</div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:6,marginTop:8}}>
        {[
          {title:'Rareté',items:Object.values(RARITY).map(r=>[r.l,`+${r.p}pts`])},
          {title:'Méthode d\'observation',items:[['👁️ Vue directe','×3'],['🌙 Vision nocturne','×2'],['📷 Caméra piège','×1']]},
          {title:'Taille',items:[['Petit (renard)','×1.5'],['Moyen (lynx)','×2'],['Grand (cerf)','×2.5'],['Géant (élan)','×3']]},
          {title:'Bonus spéciaux',items:[['👶 Bébés observés','+20'],['🏠 Terrier trouvé','+30'],['📸 Photo nette','+10']]},
        ].map(card=><div key={card.title} style={{background:C.s1,border:`0.5px solid ${C.border}`,borderRadius:8,padding:'8px 10px'}}>
          <div style={{fontSize:10,fontWeight:500,color:C.text,marginBottom:4}}>{card.title}</div>
          {card.items.map(([l,r])=><div key={l} style={{fontSize:10,color:C.textSec,lineHeight:1.9,display:'flex',justifyContent:'space-between'}}><span>{l}</span><span style={{color:C.warning,fontWeight:500}}>{r}</span></div>)}
        </div>)}
      </div>
    </>
  }

  // ── BADGES VIEW ──────────────────────────────────────────────────────────────
  const BadgesView = () => {
    const on=ACHIEVEMENTS.filter(a=>a.on), off=ACHIEVEMENTS.filter(a=>!a.on)
    return <>
      <div style={s.secTitle}>Débloqués ({on.length})</div>
      <div style={{...s.achGrid,marginBottom:16}}>{on.map(a=><div key={a.n} style={s.achCard(true)}><div style={{fontSize:20,marginBottom:3}}>{a.e}</div><div style={{fontSize:10,fontWeight:500,color:C.text}}>{a.n}</div><div style={{fontSize:9,color:C.textMuted,marginTop:2,lineHeight:1.4}}>{a.d}</div><div style={{fontSize:9,color:C.warning,marginTop:3,fontWeight:500}}>{a.w}</div></div>)}</div>
      <div style={s.secTitle}>À débloquer ({off.length})</div>
      <div style={s.achGrid}>{off.map(a=><div key={a.n} style={s.achCard(false)}><div style={{fontSize:20,marginBottom:3,filter:'grayscale(1)',opacity:.35}}>{a.e}</div><div style={{fontSize:10,fontWeight:500,color:C.text}}>{a.n}</div><div style={{fontSize:9,color:C.textMuted,marginTop:2,lineHeight:1.4}}>{a.d}</div><div style={{fontSize:9,color:C.textMuted,marginTop:3}}>???</div></div>)}</div>
    </>
  }

  return (
    <div style={s.app}>
      <div style={s.header}>
        <div style={{display:'flex',alignItems:'center',gap:10}}>
          <div style={s.logo}>Plu<span style={s.logoEm}>duni</span></div>
          <BreadCrumb/>
        </div>
        <span style={{fontSize:18,cursor:'pointer'}} title="Ajouter observation">＋</span>
      </div>
      <div style={s.navBar}>
        {[['explore','Explorer'],['matrix','Matrice'],['scores','Scores'],['badges','Badges']].map(([id,label])=>(
          <div key={id} style={s.navTab(nav===id)} onClick={()=>{setNav(id);setCurCat(null);setCurSp(null)}}>{label}</div>
        ))}
      </div>
      <div style={s.body}>
        {nav==='explore' && (curSp ? <DetailView/> : curCat ? <ListView/> : <HomeView/>)}
        {nav==='matrix'  && <MatrixView/>}
        {nav==='scores'  && <ScoresView/>}
        {nav==='badges'  && <BadgesView/>}
      </div>
    </div>
  )
}
