// ══════════════════════════════════════════════════════════════
//  Photos — stockage partagé Supabase
// ══════════════════════════════════════════════════════════════
import { sb, BUCKET, publicUrl } from './supabase.js'

export const LUT = 'sepia(0.28) saturate(1.22) hue-rotate(342deg) brightness(0.97) contrast(1.06)'

// ── Compression avant envoi : max 1600 px, JPEG q0.82 ──
export function compress(file, maxSide = 1600, quality = 0.82) {
  return new Promise((res, rej) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(url)
      let { width: w, height: h } = img
      if (Math.max(w, h) > maxSide) {
        const r = maxSide / Math.max(w, h)
        w = Math.round(w * r); h = Math.round(h * r)
      }
      const c = document.createElement('canvas')
      c.width = w; c.height = h
      c.getContext('2d').drawImage(img, 0, 0, w, h)
      c.toBlob(b => b ? res(b) : rej(new Error('compression échouée')), 'image/jpeg', quality)
    }
    img.onerror = () => { URL.revokeObjectURL(url); rej(new Error('image illisible')) }
    img.src = url
  })
}

const safe = (s) => String(s).replace(/[^a-zA-Z0-9_-]/g, '_')

export async function addPhoto({ target, blob, caption = '', by = '' }) {
  const path = `${safe(target)}/${Date.now()}_${Math.random().toString(36).slice(2, 7)}.jpg`
  const up = await sb.storage.from(BUCKET).upload(path, blob, { contentType: 'image/jpeg', upsert: false })
  if (up.error) throw new Error(up.error.message)
  const ins = await sb.from('photos').insert({ target, path, caption, author: by }).select().single()
  if (ins.error) throw new Error(ins.error.message)
  return { ...ins.data, url: publicUrl(path) }
}

export async function getPhotos(target) {
  const { data, error } = await sb.from('photos').select('*').eq('target', target).order('created_at')
  if (error) return []
  return (data || []).map(p => ({ ...p, url: publicUrl(p.path), by: p.author }))
}

export async function getAllPhotos() {
  const { data, error } = await sb.from('photos').select('*').order('created_at', { ascending: false })
  if (error) return []
  return (data || []).map(p => ({ ...p, url: publicUrl(p.path), by: p.author }))
}

export async function deletePhoto(id, path) {
  if (path) await sb.storage.from(BUCKET).remove([path])
  await sb.from('photos').delete().eq('id', id)
  return true
}

export async function countPhotos() {
  const { count } = await sb.from('photos').select('*', { count: 'exact', head: true })
  return { n: count || 0, mb: '—' }
}
