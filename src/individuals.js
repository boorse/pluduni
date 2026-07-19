// ══════════════════════════════════════════════════════════════
//  Promotion d'une observation en individu nommé (reconnaissable)
//  Stocké localement en attendant le backend partagé.
// ══════════════════════════════════════════════════════════════
const KEY = 'pluduni_named'

function read() {
  try { return JSON.parse(localStorage.getItem(KEY) || '{}') } catch { return {} }
}
function write(o) {
  try { localStorage.setItem(KEY, JSON.stringify(o)) } catch {}
}

// clé : "spId::obsName"
export function getOverride(spId, obsName) {
  return read()[`${spId}::${obsName}`] || null
}

// promeut une observation en individu nommé
export function promote(spId, obsName, newName, traits = '') {
  const o = read()
  o[`${spId}::${obsName}`] = { named: true, name: newName, traits, at: Date.now() }
  write(o)
}

// retire le statut d'individu nommé
export function demote(spId, obsName) {
  const o = read()
  delete o[`${spId}::${obsName}`]
  write(o)
}

// applique les overrides à la liste d'individus d'une espèce
export function resolve(sp) {
  const o = read()
  return (sp.inds || []).map(ind => {
    const ov = o[`${sp.id}::${ind.n}`]
    if (ov) return { ...ind, named: true, displayName: ov.name, traits: ov.traits, promoted: true }
    return { ...ind, displayName: ind.n, named: !!ind.named }
  })
}

export function splitInds(sp) {
  const all = resolve(sp)
  return { named: all.filter(i => i.named), sightings: all.filter(i => !i.named) }
}
