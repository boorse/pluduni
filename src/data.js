export const RARITY = {
  commun:      { l:'Commun',      p:5,   bg:'#F0FDF4', tc:'#15803D', bc:'#BBF7D0' },
  peu_commun:  { l:'Peu commun',  p:15,  bg:'#EFF6FF', tc:'#1D4ED8', bc:'#93C5FD' },
  rare:        { l:'Rare',        p:40,  bg:'#F5F3FF', tc:'#6D28D9', bc:'#C4B5FD' },
  tres_rare:   { l:'Très rare',   p:100, bg:'#FEF2F2', tc:'#B91C1C', bc:'#FCA5A5' },
}

export const SIZE_MULT = { xs:1, s:1.5, m:2, l:2.5, xl:3 }
export const METHOD_MULT = { eye:3, night:2, cam:1 }

export const PLAYERS = [
  { id:'F', name:'Ferdinand', bg:'#EFF6FF', tc:'#1D4ED8', bar:'#2563EB' },
  { id:'P', name:'Pierre',    bg:'#F0FDF4', tc:'#15803D', bar:'#16A34A' },
  { id:'N', name:'Noan',      bg:'#F5F3FF', tc:'#6D28D9', bar:'#7C3AED' },
  { id:'V', name:'Vera',      bg:'#FFFBEB', tc:'#92400E', bar:'#D97706' },
]

export const CATS = [
  { id:'faune',    e:'🦁', n:'Faune',    subs:['Tous','Cervidés','Canidés','Félidés','Mustélidés','Invasifs'] },
  { id:'oiseaux',  e:'🦅', n:'Oiseaux',  subs:['Tous','Échassiers','Rapaces','Passereaux'] },
  { id:'flore',    e:'🌿', n:'Flore',    subs:['Tous','Arbres','Arbustes','Fleurs'] },
  { id:'insectes', e:'🦋', n:'Insectes', subs:['Tous','Lépidoptères','Coléoptères'] },
]

export const SPECIES = [
  { id:'lynx', n:'Lynx boréal', lat:'Lynx lynx', e:'🐆', cat:'faune', sub:'Félidés', r:'tres_rare', sz:'m',
    obs:{ Ferdinand:['cam'], Pierre:[], Noan:[], Vera:[] },
    bonus:{ Ferdinand:['terrier'] },
    inds:[{n:'Loki',note:'Adulte mâle, roux tacheté',d:'07/06/2026',b:['adulte']},{n:'Inconnu',note:'À identifier',d:'07/06/2026',b:[]}],
    alim:'Chevreuil (70–80%), cerf élaphe, lièvre. Chasse à l\'affût, bond à moins de 10m.',
    hab:'Forêt dense mixte. Territoire 200–500 km². Solitaire. Crépusculaire et nocturne.',
    dng:'Aucun danger pour l\'humain. Très craintif. Faible risque pour les grands chiens.' },

  { id:'elan', n:'Élan', lat:'Alces alces', e:'🫎', cat:'faune', sub:'Cervidés', r:'rare', sz:'xl',
    obs:{ Ferdinand:['cam'], Pierre:[], Noan:[], Vera:[] },
    bonus:{},
    inds:[{n:'Gustav',note:'Femelle ou jeune mâle, sans bois',d:'12/06/2026',b:[]}],
    alim:'Saule, bouleau, plantes aquatiques. 20–30 kg de végétaux par jour.',
    hab:'Zones humides, lisières. Territoire 10–30 km². Solitaire.',
    dng:'Femelle avec veau dangereuse. Mâle imprévisible en rut (sept–oct).' },

  { id:'cerf', n:'Cerf élaphe', lat:'Cervus elaphus', e:'🦌', cat:'faune', sub:'Cervidés', r:'peu_commun', sz:'l',
    obs:{ Ferdinand:['cam'], Pierre:['eye'], Noan:[], Vera:[] },
    bonus:{},
    inds:[{n:'Biche 1',note:'Femelle adulte, pelage roux d\'été',d:'Juin 2026',b:[]}],
    alim:'Herbes, baies, glands, champignons, écorce.',
    hab:'Forêt et lisières. Sociable en hardes.',
    dng:'Aucun danger hors période de rut.' },

  { id:'chevreuil', n:'Chevreuil', lat:'Capreolus capreolus', e:'🦔', cat:'faune', sub:'Cervidés', r:'commun', sz:'s',
    obs:{ Ferdinand:['cam','eye'], Pierre:['eye'], Noan:['cam'], Vera:[] },
    bonus:{},
    inds:[{n:'Velours',note:'Mâle, bois en velours',d:'Juin 2026',b:['jeune_bois']},{n:'Chevrette 1',note:'Probable allaitante',d:'Juin 2026',b:['bebe']}],
    alim:'Pousses, baies, champignons, lierre. Sélectif et gourmet.',
    hab:'Lisières et clairières. Territoire 30–60 ha. Semi-solitaire.',
    dng:'Aucun. Cri d\'alarme (aboiement) signale votre présence.' },

  { id:'renard', n:'Renard roux', lat:'Vulpes vulpes', e:'🦊', cat:'faune', sub:'Canidés', r:'commun', sz:'s',
    obs:{ Ferdinand:['cam','eye'], Pierre:['cam'], Noan:[], Vera:['eye'] },
    bonus:{ Ferdinand:['terrier','bebe'] },
    inds:[{n:'Roux 1',note:'Adulte sain, actif le matin',d:'Avril 2026',b:[]},{n:'Galeux',note:'⚠️ Gale sarcoptique avancée',d:'Juin 2026',b:[]},{n:'Renardeau A',note:'Jeune de l\'année',d:'Juin 2026',b:['bebe']},{n:'Renardeau B',note:'Jeune de l\'année',d:'Juin 2026',b:['bebe']}],
    alim:'Rongeurs, lapins, oeufs, fruits, insectes. Opportuniste complet.',
    hab:'Lisières, bocage. Terrier actif avec renardeaux identifié sur la propriété.',
    dng:'⚠️ Un individu porteur de gale sarcoptique — contagieux pour le chien.' },

  { id:'blaireau', n:'Blaireau européen', lat:'Meles meles', e:'🦡', cat:'faune', sub:'Mustélidés', r:'peu_commun', sz:'m',
    obs:{ Ferdinand:['cam'], Pierre:[], Noan:['cam'], Vera:[] },
    bonus:{},
    inds:[{n:'Blaireau 1',note:'Nocturne, blairaudière probable',d:'Hiver 2025',b:[]}],
    alim:'Vers de terre (80%), baies, insectes, rongeurs.',
    hab:'Blairaudière multigénérationnelle. Torpeur partielle en hiver.',
    dng:'Inoffensif. Ne s\'attaque pas à la basse-cour.' },

  { id:'viverrin', n:'Chien viverrin', lat:'Nyctereutes procyonoides', e:'🦝', cat:'faune', sub:'Invasifs', r:'peu_commun', sz:'s',
    obs:{ Ferdinand:['cam','night'], Pierre:[], Noan:[], Vera:[] },
    bonus:{},
    inds:[{n:'Viverrin 1',note:'Plusieurs clichés nocturnes',d:'Multiple',b:[]}],
    alim:'Grenouilles, poissons, baies, rongeurs, charognes. Omnivore total.',
    hab:'Zones humides. Espèce invasive asiatique. Torpeur hivernale.',
    dng:'⚠️ Vecteur de rage. Danger pour la basse-cour (creuse sous les clôtures).' },

  { id:'martre', n:'Martre des pins', lat:'Martes martes', e:'🦦', cat:'faune', sub:'Mustélidés', r:'rare', sz:'xs',
    obs:{ Ferdinand:['cam'], Pierre:[], Noan:[], Vera:[] },
    bonus:{},
    inds:[{n:'Martre 1',note:'Silhouette longiligne nocturne',d:'Nuit',b:[]}],
    alim:'Rongeurs, oiseaux, oeufs, baies, miel.',
    hab:'Forêt de conifères et mixte. Arboricole.',
    dng:'Aucun pour l\'humain. Peut s\'attaquer aux poulaillers.' },

  { id:'grue', n:'Grue cendrée', lat:'Grus grus', e:'🪽', cat:'oiseaux', sub:'Échassiers', r:'rare', sz:'m',
    obs:{ Ferdinand:['cam'], Pierre:['eye'], Noan:[], Vera:[] },
    bonus:{},
    inds:[{n:'Grue 1',note:'Calotte rouge, ~120cm de haut',d:'Juin 2026',b:[]}],
    alim:'Grains, insectes, vers, amphibiens, baies.',
    hab:'Zones humides pour la nidification. Migratrice partielle.',
    dng:'Aucun.' },

  { id:'argousier', n:'Argousier', lat:'Hippophae rhamnoides', e:'🫐', cat:'flore', sub:'Arbustes', r:'commun', sz:'s',
    obs:{ Ferdinand:['eye'], Pierre:['eye'], Noan:[], Vera:['eye'] },
    bonus:{},
    inds:[{n:'Plantation principale',note:'~3 ha, production Year 1',d:'2024',b:[]}],
    alim:'Baies riches en oméga-7. Consommées par oiseaux et chevreuil.',
    hab:'Lisières ensoleillées, sols pauvres. Résistant au gel letton.',
    dng:'Épines acérées lors de la récolte.' },
]

export const ACHIEVEMENTS = [
  { e:'🏆', n:'Grand prédateur',    d:'Observer le lynx',             w:'Ferdinand', on:true },
  { e:'🌙', n:'Chasseur nocturne',  d:'3 espèces nocturnes en 1 nuit',w:'Ferdinand', on:true },
  { e:'🦊', n:'Famille renard',     d:'Observer des renardeaux',      w:'Ferdinand', on:true },
  { e:'🏠', n:'Détective terrier',  d:'Trouver un gîte ou terrier',   w:'Ferdinand', on:true },
  { e:'👶', n:'Nurserie',           d:'Observer des jeunes de l\'année',w:'Ferdinand, Pierre', on:true },
  { e:'❄️', n:'Trace de loup',      d:'Première trace ou observation', w:'—', on:false },
  { e:'🐻', n:'Ours observé',       d:'Observer un ours brun',        w:'—', on:false },
  { e:'🦌', n:'Brame du cerf',      d:'Entendre le brame en sept–oct',w:'—', on:false },
  { e:'🦫', n:'Barrage castor',     d:'Trouver un barrage sur la Līčupe',w:'—', on:false },
  { e:'🌊', n:'Loutre aperçue',     d:'Observer une loutre',          w:'—', on:false },
  { e:'🌿', n:'Botaniste',          d:'30 espèces végétales identifiées',w:'—', on:false },
  { e:'🦋', n:'Entomologiste',      d:'20 espèces d\'insectes',       w:'—', on:false },
]

export function calcPts(sp, playerName) {
  const methods = sp.obs[playerName] || []
  if (!methods.length) return 0
  const best = methods.includes('eye') ? 'eye' : methods.includes('night') ? 'night' : 'cam'
  const bonuses = sp.bonus[playerName] || []
  return Math.round(
    RARITY[sp.r].p * SIZE_MULT[sp.sz] * METHOD_MULT[best] +
    (bonuses.includes('bebe') ? 20 : 0) +
    (bonuses.includes('terrier') ? 30 : 0)
  )
}

export function totalPts(playerName) {
  return SPECIES.reduce((sum, sp) => sum + calcPts(sp, playerName), 0)
}
