// Tâches et repères partagés
import { sb } from './supabase.js'

export async function getTodos() {
  const { data } = await sb.from('overrides').select('*').eq('kind','todo').order('updated_at')
  return (data||[]).map(r=>r.value)
}
export async function saveTodo(t) {
  await sb.from('overrides').upsert({ kind:'todo', key:`todo_${t.id}`, value:t, updated_at:new Date().toISOString() }, { onConflict:'key' })
}
export async function deleteTodo(id) { await sb.from('overrides').delete().eq('key', `todo_${id}`) }

export async function getPins() {
  const { data } = await sb.from('overrides').select('*').eq('kind','pin').order('updated_at')
  return (data||[]).map(r=>r.value)
}
export async function savePin(p) {
  await sb.from('overrides').upsert({ kind:'pin', key:`pin_${p.id}`, value:p, updated_at:new Date().toISOString() }, { onConflict:'key' })
}
export async function deletePin(id) { await sb.from('overrides').delete().eq('key', `pin_${id}`) }

// Réglages du site (image d'accueil, etc.)
export async function getSetting(key) {
  const { data } = await sb.from('overrides').select('*').eq('key', `set_${key}`).maybeSingle()
  return data?.value ?? null
}
export async function setSetting(key, value) {
  await sb.from('overrides').upsert({ kind:'setting', key:`set_${key}`, value, updated_at:new Date().toISOString() }, { onConflict:'key' })
}
