import { useState } from 'react'
import { allPlayers, addPlayer, allCats, addSpecies, editSpecies, setObservation, getMe, setMe } from './store.js'
import { RARITY, METHODS, SIZE_MULT } from './data'

const T = { bg:'#EDE7D8', card:'#E6DDC8', ink:'#2B2620', soft:'#6B6357',
  mute:'#9A9081', line:'#D3C7AE', clay:'#B5602F', sageDark:'#4A5D32', gold:'#C9A046' }

const Modal = ({ children, onClose, wide, max=460 }) => (
  <div onClick={onClose} style={{ position:'fixed', inset:0, background:'rgba(43,38,32,.62)', zIndex:150,
    display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
    <div onClick={e=>e.stopPropagation()} style={{ background:T.bg, borderRadius:18, width:'100%',
      maxWidth:max, maxHeight:'88vh', overflow:'auto', border:`1px solid ${T.line}` }}>{children}</div>
  </div>
)
const label = { fontSize:11, color:T.mute, display:'block', marginBottom:4, marginTop:11 }
const input = { width:'100%', padding:'10px 12px', borderRadius:10, border:`1px solid ${T.line}`,
  background:T.card, fontSize:13.5, color:T.ink }

// ══════ Choix d'identité ══════
export function IdentityPicker({ lang, onClose }) {
  const [me, setLocal] = useState(getMe())
  const [adding, setAdding] = useState('')
  const players = allPlayers().filter(p=>!p.demo)
  return (
    <Modal onClose={onClose}>
      <div style={{ padding:22 }}>
        <div className="serif" style={{ fontSize:19, fontWeight:900, color:T.ink, marginBottom:4 }}>
          {lang==='ru'?'Кто вы?':'Qui es-tu ?'}
        </div>
        <div style={{ fontSize:12.5, color:T.soft, marginBottom:14, lineHeight:1.5 }}>
          {lang==='ru'?'Ваши добавления будут записаны на ваше имя.'
                     :'Tes ajouts seront enregistrés à ton nom.'}
        </div>
        <div style={{ display:'flex', gap:7, flexWrap:'wrap', marginBottom:14 }}>
          {players.map(p=>{
            const on = me===p.name
            return (
              <button key={p.name} onClick={()=>{ setLocal(p.name); setMe(p.name) }}
                style={{ display:'flex', alignItems:'center', gap:8, padding:'9px 14px', borderRadius:20,
                  border:`1px solid ${on?T.clay:T.line}`, background:on?T.clay:'transparent' }}>
                <span className="serif" style={{ width:26, height:26, borderRadius:'50%',
                  background:on?'rgba(255,255,255,.22)':'#7A8B5C', color:'#fff', display:'flex',
                  alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:700 }}>{p.id}</span>
                <span className="serif" style={{ fontSize:14, fontWeight:on?900:600, color:on?'#fff':T.ink }}>{p.name}</span>
              </button>
            )
          })}
        </div>
        <div style={{ display:'flex', gap:7 }}>
          <input value={adding} onChange={e=>setAdding(e.target.value)}
            onKeyDown={e=>{ if(e.key==='Enter'&&adding.trim()){ addPlayer(adding); setLocal(adding.trim()); setMe(adding.trim()); setAdding('') } }}
            placeholder={lang==='ru'?'Новый наблюдатель':'Nouvel observateur'}
            style={{ ...input, flex:1 }} />
          <button onClick={()=>{ if(adding.trim()){ addPlayer(adding); setLocal(adding.trim()); setMe(adding.trim()); setAdding('') } }}
            style={{ padding:'10px 16px', borderRadius:10, background:T.sageDark, color:'#fff', fontSize:13, fontWeight:700 }}>+</button>
        </div>
        <button onClick={onClose} disabled={!me} className="serif"
          style={{ width:'100%', marginTop:16, padding:'11px', borderRadius:12,
            background: me?T.clay:'#DDD3BE', color: me?'#fff':T.mute, fontSize:14, fontWeight:700,
            display:'flex', alignItems:'center', justifyContent:'center', gap:7 }}>
          <i className="ti ti-check" style={{ fontSize:16 }} aria-hidden="true" />
          {lang==='ru'?'Продолжить':'Continuer'}
        </button>
      </div>
    </Modal>
  )
}

// ══════ Nouvelle espèce ══════
const EMOJIS = ['🦌','🦊','🐺','🐆','🦡','🦫','🐗','🐇','🐿️','🦔','🦉','🦅','🐦','🪽','🦆','🌳','🌲','🍁','🍄','🍃','🦋','🪲','🐝','🐌','🐸','🐍','🐟','🌸','🌾','🧍']

export function SpeciesEditor({ lang, initial, presetCat, presetSub, onClose, onSaved }) {
  const isEdit = !!initial
  const cats = allCats()
  const [n, setN] = useState(initial?.n || '')
  const [lat, setLat] = useState(initial?.lat || '')
  const [e, setE] = useState(initial?.e || '🦌')
  const [cat, setCat] = useState(initial?.cat || presetCat || cats[0].id)
  const [sub, setSub] = useState(initial?.sub || presetSub || cats[0].subs[0].id)
  const [newSub, setNewSub] = useState('')
  const [r, setR] = useState(initial?.r || 'commun')
  const [sz, setSz] = useState(initial?.sz || 'm')
  const [alim, setAlim] = useState(initial?.alim || '')
  const [hab, setHab] = useState(initial?.hab || '')
  const [dng, setDng] = useState(initial?.dng || '')
  const [busy, setBusy] = useState(false)
  const catObj = cats.find(c=>c.id===cat) || cats[0]

  const save = async () => {
    if (!n.trim()) return
    setBusy(true)
    const fields = { n:n.trim(), lat:lat.trim(), e, cat, sub:(newSub.trim()||sub), r, sz,
      alim:alim.trim(), hab:hab.trim(), dng:dng.trim() }
    if (isEdit) await editSpecies(initial.id, fields)
    else await addSpecies(fields)
    setBusy(false); onSaved?.(); onClose()
  }

  return (
    <Modal onClose={onClose} max={520}>
      <div style={{ padding:'20px 22px 0' }}>
        <div className="serif" style={{ fontSize:19, fontWeight:900, color:T.ink }}>
          {isEdit ? (lang==='ru'?'Изменить вид':'Modifier l\u2019espèce')
                  : (lang==='ru'?'Новый вид':'Nouvelle espèce')}
        </div>
      </div>
      <div style={{ padding:'0 22px 12px' }}>
        <label style={label}>{lang==='ru'?'Название':'Nom courant'}</label>
        <input value={n} onChange={ev=>setN(ev.target.value)} autoFocus style={input}
          placeholder={lang==='ru'?'Например: Рысь':'Ex. Lynx boréal'} />

        <label style={label}>{lang==='ru'?'Латинское название':'Nom latin'}</label>
        <input value={lat} onChange={ev=>setLat(ev.target.value)} style={input} placeholder="Lynx lynx" />

        <label style={label}>{lang==='ru'?'Значок':'Pictogramme'}</label>
        <div style={{ display:'flex', gap:4, flexWrap:'wrap' }}>
          {EMOJIS.map(x=>(
            <button key={x} onClick={()=>setE(x)} style={{ fontSize:19, width:34, height:34, borderRadius:9,
              border:`1px solid ${e===x?T.clay:T.line}`, background:e===x?'#F0DDD0':'transparent' }}>{x}</button>
          ))}
        </div>

        <label style={label}>{lang==='ru'?'Царство':'Règne'}</label>
        <div style={{ display:'flex', gap:5, flexWrap:'wrap' }}>
          {cats.map(c=>(
            <button key={c.id} onClick={()=>{ setCat(c.id); setSub(c.subs[0]?.id||'') }}
              style={{ fontSize:11.5, padding:'6px 11px', borderRadius:14,
                border:`1px solid ${cat===c.id?T.clay:T.line}`, background:cat===c.id?T.clay:'transparent',
                color:cat===c.id?'#fff':T.soft }}>{c.e} {c.n}</button>
          ))}
        </div>

        <label style={label}>{lang==='ru'?'Семейство':'Famille'}</label>
        <div style={{ display:'flex', gap:5, flexWrap:'wrap', marginBottom:6 }}>
          {catObj.subs.map(sv=>(
            <button key={sv.id} onClick={()=>{ setSub(sv.id); setNewSub('') }}
              style={{ fontSize:11.5, padding:'6px 11px', borderRadius:14,
                border:`1px solid ${!newSub && sub===sv.id?T.clay:T.line}`,
                background:!newSub && sub===sv.id?'#F0DDD0':'transparent', color:T.soft }}>{sv.id}</button>
          ))}
        </div>
        <input value={newSub} onChange={ev=>setNewSub(ev.target.value)} style={{ ...input, fontSize:12.5 }}
          placeholder={lang==='ru'?'…или новое семейство':'…ou créer une nouvelle famille'} />

        <label style={label}>{lang==='ru'?'Редкость':'Rareté'}</label>
        <div style={{ display:'flex', gap:5, flexWrap:'wrap' }}>
          {Object.entries(RARITY).map(([k,v])=>(
            <button key={k} onClick={()=>setR(k)} style={{ fontSize:11.5, padding:'6px 11px', borderRadius:14,
              border:`1px solid ${r===k?v.c:T.line}`, background:r===k?v.c:'transparent',
              color:r===k?'#fff':T.soft }}>{v.l} · {v.p}</button>
          ))}
        </div>

        <label style={label}>{lang==='ru'?'Размер':'Taille'}</label>
        <div style={{ display:'flex', gap:5, flexWrap:'wrap' }}>
          {[['xs','Très petit'],['s','Petit'],['m','Moyen'],['l','Grand'],['xl','Géant']].map(([k,l])=>(
            <button key={k} onClick={()=>setSz(k)} style={{ fontSize:11.5, padding:'6px 11px', borderRadius:14,
              border:`1px solid ${sz===k?T.clay:T.line}`, background:sz===k?'#F0DDD0':'transparent',
              color:T.soft }}>{l} ×{SIZE_MULT[k]}</button>
          ))}
        </div>

        <label style={label}>{lang==='ru'?'Питание':'Alimentation'}</label>
        <textarea value={alim} onChange={ev=>setAlim(ev.target.value)} rows={2} style={{ ...input, fontSize:12.5, resize:'vertical' }} />
        <label style={label}>{lang==='ru'?'Среда обитания':'Habitat & territoire'}</label>
        <textarea value={hab} onChange={ev=>setHab(ev.target.value)} rows={2} style={{ ...input, fontSize:12.5, resize:'vertical' }} />
        <label style={label}>{lang==='ru'?'Опасность':'Danger'}</label>
        <textarea value={dng} onChange={ev=>setDng(ev.target.value)} rows={2} style={{ ...input, fontSize:12.5, resize:'vertical' }} />
      </div>

      <ValidateBar lang={lang} onCancel={onClose} onSave={save} busy={busy} disabled={!n.trim()} />
    </Modal>
  )
}

// ══════ Barre de validation ══════
export function ValidateBar({ lang, onCancel, onSave, busy, disabled }) {
  return (
    <div style={{ position:'sticky', bottom:0, background:T.bg, borderTop:`1px solid ${T.line}`,
      padding:'12px 22px', display:'flex', gap:9, zIndex:3 }}>
      <button onClick={onCancel} style={{ flex:1, padding:'11px', borderRadius:12,
        border:`1px solid ${T.line}`, color:T.soft, fontSize:13 }}>
        {lang==='ru'?'Отмена':'Annuler'}
      </button>
      <button onClick={onSave} disabled={busy||disabled} className="serif"
        style={{ flex:1.6, padding:'11px', borderRadius:12,
          background: (busy||disabled)?'#DDD3BE':T.clay, color:(busy||disabled)?T.mute:'#fff',
          fontSize:14, fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center', gap:7 }}>
        <i className="ti ti-check" style={{ fontSize:17 }} aria-hidden="true" />
        {busy ? (lang==='ru'?'Сохранение…':'Enregistrement…') : (lang==='ru'?'Подтвердить':'Valider')}
      </button>
    </div>
  )
}

// ══════ Marquer une observation ══════
export function ObservationEditor({ sp, lang, onClose, onSaved }) {
  const me = getMe() || allPlayers()[0]?.name
  const [who, setWho] = useState(me)
  const [methods, setMethods] = useState(sp.obs?.[me] || [])
  const [busy, setBusy] = useState(false)
  const toggle = (m) => setMethods(v => v.includes(m) ? v.filter(x=>x!==m) : [...v, m])
  return (
    <Modal onClose={onClose}>
      <div style={{ padding:'20px 22px 12px' }}>
        <div className="serif" style={{ fontSize:18, fontWeight:900, color:T.ink, marginBottom:3 }}>
          {lang==='ru'?'Отметить наблюдение':'Marquer une observation'}
        </div>
        <div style={{ fontSize:12.5, color:T.soft, marginBottom:6 }}>{sp.e} {sp.n}</div>
        <label style={label}>{lang==='ru'?'Наблюдатель':'Observateur'}</label>
        <div style={{ display:'flex', gap:5, flexWrap:'wrap' }}>
          {allPlayers().filter(p=>!p.demo).map(p=>(
            <button key={p.name} onClick={()=>{ setWho(p.name); setMethods(sp.obs?.[p.name]||[]) }}
              style={{ fontSize:12, padding:'6px 12px', borderRadius:14,
                border:`1px solid ${who===p.name?T.clay:T.line}`,
                background:who===p.name?T.clay:'transparent', color:who===p.name?'#fff':T.soft }}>{p.name}</button>
          ))}
        </div>
        <label style={label}>{lang==='ru'?'Способ':'Comment ?'}</label>
        <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
          {Object.entries(METHODS).map(([k,m])=>{
            const on = methods.includes(k)
            return (
              <button key={k} onClick={()=>toggle(k)} style={{ fontSize:12, padding:'8px 13px', borderRadius:14,
                border:`1px solid ${on?m.c:T.line}`, background:on?m.c:'transparent',
                color:on?m.on:T.soft, fontWeight:on?600:400, display:'flex', alignItems:'center', gap:5 }}>
                {k==='eye'?'👁':k==='scope'?'🔭':k==='night'?'🌙':'📷'} {m.l} ×{m.mult}
              </button>
            )
          })}
        </div>
        {methods.length===0 && (
          <div style={{ fontSize:11.5, color:T.mute, marginTop:10 }}>
            {lang==='ru'?'Без способа наблюдение будет удалено.':'Sans méthode, l\u2019observation sera retirée.'}
          </div>
        )}
      </div>
      <ValidateBar lang={lang} onCancel={onClose} busy={busy}
        onSave={async()=>{ setBusy(true); await setObservation(sp.id, who, methods); setBusy(false); onSaved?.(); onClose() }} />
    </Modal>
  )
}
