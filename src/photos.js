// ══════════════════════════════════════════════════════════════
//  Stockage des photos — IndexedDB (local)
//  Pour passer au cloud plus tard : seul ce fichier change.
// ══════════════════════════════════════════════════════════════

const DB = 'pluduni_photos'
const STORE = 'photos'
let _db = null

function open() {
  if (_db) return Promise.resolve(_db)
  return new Promise((res, rej) => {
    const r = indexedDB.open(DB, 1)
    r.onupgradeneeded = () => {
      const db = r.result
      if (!db.objectStoreNames.contains(STORE)) {
        const st = db.createObjectStore(STORE, { keyPath: 'id' })
        st.createIndex('target', 'target', { unique: false })
      }
    }
    r.onsuccess = () => { _db = r.result; res(_db) }
    r.onerror = () => rej(r.error)
  })
}

// target = 'sp:lynx' ou 'ind:lynx:Loki'
export async function addPhoto({ target, blob, caption = '', by = '' }) {
  const db = await open()
  const id = `${target}__${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
  const rec = { id, target, blob, caption, by, at: Date.now() }
  return new Promise((res, rej) => {
    const tx = db.transaction(STORE, 'readwrite')
    tx.objectStore(STORE).add(rec)
    tx.oncomplete = () => res(rec)
    tx.onerror = () => rej(tx.error)
  })
}

export async function getPhotos(target) {
  const db = await open()
  return new Promise((res, rej) => {
    const tx = db.transaction(STORE, 'readonly')
    const idx = tx.objectStore(STORE).index('target')
    const out = []
    idx.openCursor(IDBKeyRange.only(target)).onsuccess = (e) => {
      const c = e.target.result
      if (c) { out.push(c.value); c.continue() } else res(out.sort((a, b) => a.at - b.at))
    }
    tx.onerror = () => rej(tx.error)
  })
}

export async function getAllPhotos() {
  const db = await open()
  return new Promise((res, rej) => {
    const tx = db.transaction(STORE, 'readonly')
    const rq = tx.objectStore(STORE).getAll()
    rq.onsuccess = () => res((rq.result || []).sort((a, b) => b.at - a.at))
    rq.onerror = () => rej(rq.error)
  })
}

export async function deletePhoto(id) {
  const db = await open()
  return new Promise((res, rej) => {
    const tx = db.transaction(STORE, 'readwrite')
    tx.objectStore(STORE).delete(id)
    tx.oncomplete = () => res(true)
    tx.onerror = () => rej(tx.error)
  })
}

export async function countPhotos() {
  const all = await getAllPhotos()
  const bytes = all.reduce((s, p) => s + (p.blob?.size || 0), 0)
  return { n: all.length, mb: (bytes / 1048576).toFixed(1) }
}

// ── Compression avant stockage : max 1600px, JPEG q0.82 ──
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
      const ctx = c.getContext('2d')
      ctx.drawImage(img, 0, 0, w, h)
      c.toBlob(b => b ? res(b) : rej(new Error('compression échouée')), 'image/jpeg', quality)
    }
    img.onerror = () => { URL.revokeObjectURL(url); rej(new Error('image illisible')) }
    img.src = url
  })
}

// ── Filtre colorimétrique homogène (LUT) ──
export const LUT = 'sepia(0.28) saturate(1.22) hue-rotate(342deg) brightness(0.97) contrast(1.06)'
