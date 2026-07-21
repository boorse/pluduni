// ══════════════════════════════════════════════════════════════
//  Magasin central — cache partagé, une seule source de vérité
// ══════════════════════════════════════════════════════════════
import { sb, publicUrl } from './supabase.js'
import { SPECIES as BASE_SPECIES, CATS as BASE_CATS, PLAYERS as BASE_PLAYERS, DEMO } from './data'

const S = {
  photos: {},        // target -> [{id,url,caption,by,path}]
  named: {},         // "spId::obsName" -> {name, traits}
  species: [],       // espèces ajoutées
  players: [],       // joueurs ajoutés
  edits: {},         // spId -> champs modifiés
  ready: false,
}
const subs = new Set()
export function subscribe(fn) { subs.add(fn); return () => subs.delete(fn) }
function notify() { subs.forEach(f => f()) }

export function isReady() { return S.ready }

// ── Chargement initial : tout en 2 requêtes ──
export async function loadAll() {
  const [ph, ov] = await Promise.all([
    sb.from('photos').select('*').order('created_at'),
    sb.from('overrides').select('*'),
  ])
  S.photos = {}
  ;(ph.data || []).forEach(p => {
    const rec = { id: p.id, path: p.path, url: publicUrl(p.path),
      thumbUrl: publicUrl(p.path.replace(/\.jpg$/, '_t.jpg')),
      caption: p.caption, by: p.author }
    ;(S.photos[p.target] ||= []).push(rec)
  })
  S.named = {}; S.species = []; S.players = []; S.edits = {}
  ;(ov.data || []).forEach(r => {
    if (r.kind === 'named')   S.named[r.key] = r.value
    if (r.kind === 'species') S.species.push({ ...r.value, key: r.key })
    if (r.kind === 'player')  S.players.push({ ...r.value, key: r.key })
    if (r.kind === 'spedit')  S.edits[r.value.id] = r.value
  })
  S.ready = true
  notify()
}

// ══════ PHOTOS ══════
const EMPTY = Object.freeze([])
export function photosFor(target) { return S.photos[target] || EMPTY }
export function allPhotos() {
  return Object.entries(S.photos).flatMap(([target, list]) => list.map(p => ({ ...p, target })))
}
export async function addPhotoRec({ target, path, caption, by }) {
  const ins = await sb.from('photos').insert({ target, path, caption, author: by }).select().single()
  if (ins.error) throw new Error(ins.error.message)
  const rec = { id: ins.data.id, path, url: publicUrl(path),
    thumbUrl: publicUrl(path.replace(/\.jpg$/, '_t.jpg')), caption, by }
  S.photos[target] = [...(S.photos[target] || []), rec]
  notify(); return rec
}
export async function removePhoto(target, id, path) {
  if (path) await sb.storage.from('photos').remove([path, path.replace(/\.jpg$/, '_t.jpg')])
  await sb.from('photos').delete().eq('id', id)
  S.photos[target] = (S.photos[target] || []).filter(p => p.id !== id)
  notify()
}

// ══════ FAMILIERS ══════
export function namedOf(spId, obsName) { return S.named[`${spId}::${obsName}`] || null }
export async function promote(spId, obsName, name, traits = '') {
  const key = `${spId}::${obsName}`, value = { named: true, name, traits, at: Date.now() }
  S.named[key] = value; notify()
  await sb.from('overrides').upsert({ kind: 'named', key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' })
}
export async function demote(spId, obsName) {
  const key = `${spId}::${obsName}`
  delete S.named[key]; notify()
  await sb.from('overrides').delete().eq('key', key)
}
export function splitInds(sp) {
  const all = (sp.inds || []).map(ind => {
    const ov = S.named[`${sp.id}::${ind.n}`]
    return ov ? { ...ind, named: true, displayName: ov.name, traits: ov.traits }
              : { ...ind, displayName: ind.n, named: !!ind.named }
  })
  return { named: all.filter(i => i.named), sightings: all.filter(i => !i.named) }
}

// ══════ ESPÈCES ══════
export function allSpecies() {
  const custom = S.species.map(c => ({
    inds: [], obs: c.obs || {}, bonus: {}, alim: '', hab: '', dng: '', ...c, custom: true,
  }))
  const merged = [...BASE_SPECIES, ...custom]
  return merged.map(sp => S.edits[sp.id] ? { ...sp, ...S.edits[sp.id].fields } : sp)
}
export async function addSpecies(sp) {
  const id = sp.id || ('c_' + Date.now().toString(36))
  const value = { ...sp, id }
  S.species.push({ ...value, key: 'sp_' + id }); notify()
  await sb.from('overrides').upsert({ kind: 'species', key: 'sp_' + id, value, updated_at: new Date().toISOString() }, { onConflict: 'key' })
  return id
}
export async function editSpecies(id, fields) {
  const value = { id, fields }
  S.edits[id] = value; notify()
  await sb.from('overrides').upsert({ kind: 'spedit', key: 'edit_' + id, value, updated_at: new Date().toISOString() }, { onConflict: 'key' })
}
export async function removeSpecies(id) {
  S.species = S.species.filter(s => s.id !== id); notify()
  await sb.from('overrides').delete().eq('key', 'sp_' + id)
}

// ── Observations : marquer qu'un joueur a vu une espèce ──
export async function setObservation(spId, player, methods) {
  const sp = allSpecies().find(s => s.id === spId); if (!sp) return
  const obs = { ...(sp.obs || {}) }
  if (methods && methods.length) obs[player] = methods; else delete obs[player]
  const prev = S.edits[spId]?.fields || {}
  await editSpecies(spId, { ...prev, obs })
}

// ══════ JOUEURS ══════
export function allPlayers() {
  return [...BASE_PLAYERS, ...S.players.map(p => ({ id: p.id, name: p.name, custom: true })), DEMO]
}
export async function addPlayer(name) {
  const id = name.trim()[0]?.toUpperCase() || '?'
  const value = { id, name: name.trim() }
  S.players.push({ ...value, key: 'pl_' + value.name }); notify()
  await sb.from('overrides').upsert({ kind: 'player', key: 'pl_' + value.name, value, updated_at: new Date().toISOString() }, { onConflict: 'key' })
}
export async function removePlayer(name) {
  S.players = S.players.filter(p => p.name !== name); notify()
  await sb.from('overrides').delete().eq('key', 'pl_' + name)
}

// ══════ CATÉGORIES (familles ajoutées à la volée) ══════
export function allCats() {
  const extra = {}
  S.species.forEach(c => {
    if (!c.cat) return
    const base = BASE_CATS.find(x => x.id === c.cat)
    if (base && c.sub && !base.subs.some(s => s.id === c.sub)) (extra[c.cat] ||= new Set()).add(c.sub)
  })
  return BASE_CATS.map(c => extra[c.id]
    ? { ...c, subs: [...c.subs, ...[...extra[c.id]].map(id => ({ id, lat: '' }))] }
    : c)
}

// ══════ IDENTITÉ ══════
export function getMe() { try { return localStorage.getItem('pluduni_me') || '' } catch { return '' } }
export function setMe(n) { try { localStorage.setItem('pluduni_me', n) } catch {} ; notify() }
