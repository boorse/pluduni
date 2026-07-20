// ══════════════════════════════════════════════════════════════
//  Familiers (individus reconnus) — partagé via Supabase
//  Cache local pour un affichage instantané.
// ══════════════════════════════════════════════════════════════
import { sb } from './supabase.js'

let CACHE = {}
let loaded = false
const subs = new Set()

function notify() { subs.forEach(f => f()) }
export function subscribe(fn) { subs.add(fn); return () => subs.delete(fn) }

export async function loadOverrides() {
  const { data, error } = await sb.from('overrides').select('*').eq('kind', 'named')
  if (!error && data) {
    CACHE = {}
    data.forEach(r => { CACHE[r.key] = r.value })
  }
  loaded = true
  notify()
  return CACHE
}

export function isLoaded() { return loaded }

export async function promote(spId, obsName, newName, traits = '') {
  const key = `${spId}::${obsName}`
  const value = { named: true, name: newName, traits, at: Date.now() }
  CACHE[key] = value
  notify()
  await sb.from('overrides').upsert({ kind: 'named', key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' })
}

export async function demote(spId, obsName) {
  const key = `${spId}::${obsName}`
  delete CACHE[key]
  notify()
  await sb.from('overrides').delete().eq('key', key)
}

export function getOverride(spId, obsName) {
  return CACHE[`${spId}::${obsName}`] || null
}

export function resolve(sp) {
  return (sp.inds || []).map(ind => {
    const ov = CACHE[`${sp.id}::${ind.n}`]
    if (ov) return { ...ind, named: true, displayName: ov.name, traits: ov.traits, promoted: true }
    return { ...ind, displayName: ind.n, named: !!ind.named }
  })
}

export function splitInds(sp) {
  const all = resolve(sp)
  return { named: all.filter(i => i.named), sightings: all.filter(i => !i.named) }
}

// ── Tâches partagées ──
export async function getTodos() {
  const { data } = await sb.from('overrides').select('*').eq('kind', 'todo').order('updated_at')
  return (data || []).map(r => ({ ...r.value, key: r.key }))
}
export async function saveTodo(todo) {
  const key = `todo_${todo.id}`
  await sb.from('overrides').upsert({ kind: 'todo', key, value: todo, updated_at: new Date().toISOString() }, { onConflict: 'key' })
}
export async function deleteTodo(id) {
  await sb.from('overrides').delete().eq('key', `todo_${id}`)
}

// ── Repères de carte partagés ──
export async function getPins() {
  const { data } = await sb.from('overrides').select('*').eq('kind', 'pin').order('updated_at')
  return (data || []).map(r => ({ ...r.value, key: r.key }))
}
export async function savePin(pin) {
  await sb.from('overrides').upsert({ kind: 'pin', key: `pin_${pin.id}`, value: pin, updated_at: new Date().toISOString() }, { onConflict: 'key' })
}
export async function deletePin(id) {
  await sb.from('overrides').delete().eq('key', `pin_${id}`)
}
