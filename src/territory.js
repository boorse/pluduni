// ── Calendrier des travaux & observations, par thème ──
export const THEMES = {
  agri:   { l:'Agriculture',  ru:'Сельское хозяйство', c:'#8B9B6E', e:'🌾' },
  brico:  { l:'Bricolage',    ru:'Строительство',      c:'#B5602F', e:'🔨' },
  bois:   { l:'Bois',         ru:'Заготовка дров',     c:'#7A5A3A', e:'🪓' },
  faune:  { l:'Faune',        ru:'Наблюдение',         c:'#4A5D32', e:'🦌' },
  ciel:   { l:'Ciel',         ru:'Небо',               c:'#5B6B7E', e:'🔭' },
  recolte:{ l:'Récolte',      ru:'Урожай',             c:'#C08A3E', e:'🧺' },
  cueil:  { l:'Cueillette',   ru:'Сбор',               c:'#9A7B4F', e:'🍄' },
  fleur:  { l:'Floraison',    ru:'Цветение',           c:'#A9799A', e:'🌸' },
  plant:  { l:'Plantation',   ru:'Посадка',            c:'#6E8A6A', e:'🌱' },
}

export const MONTHS = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre']
export const MONTHS_RU = ['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь']

// m : index du mois (0-11), peut couvrir plusieurs mois
export const EVENTS = [
  // Agriculture
  { m:[2,3],   t:'agri',   l:'Taille de l\u2019argousier',            d:'Avant le débourrement. Aérer le centre des plants.' },
  { m:[3,4],   t:'agri',   l:'Semis potager sous abri',              d:'Tomates, courges, poivrons en godets.' },
  { m:[4,5],   t:'agri',   l:'Mise en terre du potager',             d:'Après les dernières gelées (mi-mai en Vidzeme).' },
  { m:[5,6,7], t:'agri',   l:'Désherbage & paillage',                d:'Entre les rangs d\u2019argousier et au potager.' },
  { m:[9,10],  t:'agri',   l:'Fumure d\u2019automne',                 d:'Compost au pied des arbres fruitiers.' },
  // Récolte
  { m:[7,8],   t:'recolte',l:'Récolte de l\u2019argousier',           d:'Coupe des branches, congélation puis vibration.' },
  { m:[8,9],   t:'recolte',l:'Récolte des pommes',                   d:'Verger — tri cidre / table / jus.' },
  { m:[8,9],   t:'recolte',l:'Pressage & fermentation cidre',        d:'Presse, cuves, contrôle des densités.' },
  { m:[6,7,8], t:'recolte',l:'Potager en pleine production',         d:'Récolte continue, conserves et lacto-fermentation.' },
  { m:[8,9],   t:'recolte',l:'Coupe des hortensias à sécher',        d:'Quand les panicules ont rosi. Séchage tête en bas.' },
  // Cueillette
  { m:[4,5],   t:'cueil',  l:'Morilles & premières pousses',         d:'Lisières, vieux vergers, sols sableux.' },
  { m:[6,7],   t:'cueil',  l:'Myrtilles sauvages',                   d:'Pinèdes acides. Pic mi-juillet.' },
  { m:[7,8,9], t:'cueil',  l:'Cèpes, bolets, girolles',              d:'Après les pluies, sous épicéas et bouleaux.' },
  { m:[8,9],   t:'cueil',  l:'Airelles & canneberges',               d:'Tourbières et sous-bois humides.' },
  { m:[9],     t:'cueil',  l:'Noisettes & sorbes',                   d:'Lisières. Sorbes après la première gelée.' },
  // Bois
  { m:[10,11,0,1], t:'bois', l:'Abattage & débardage',               d:'Sève descendue, sol gelé — meilleure période.' },
  { m:[1,2],   t:'bois',   l:'Fendage & mise en stères',             d:'Séchage 18 mois minimum avant usage.' },
  { m:[9,10],  t:'bois',   l:'Rentrer le bois de l\u2019année',       d:'Bûcher couvert, à l\u2019abri du vent d\u2019est.' },
  // Bricolage
  { m:[3,4],   t:'brico',  l:'Réfection des clôtures',               d:'Basse-cour : grillage enterré 30 cm (chien viverrin).' },
  { m:[4,5,6], t:'brico',  l:'Chantier affût semi-enterré',          d:'Terrassement puis coffrage. Sol ressuyé.' },
  { m:[5,6],   t:'brico',  l:'Plateforme sur pilotis (Līčupe)',      d:'Étiage bas. Yakisugi sur les bois immergés.' },
  { m:[6,7],   t:'brico',  l:'Hangar argousier',                     d:'Base en pierres de champ, bardage sombre.' },
  { m:[9,10],  t:'brico',  l:'Hivernage des bâtiments',              d:'Purge des circuits d\u2019eau, calfeutrage.' },
  // Plantation
  { m:[3,4],   t:'plant',  l:'Plantation d\u2019arbres fruitiers',    d:'Antonovka, Sīpoliņš, Pepiņš, Yarlington Mill.' },
  { m:[9,10],  t:'plant',  l:'Plantation d\u2019automne',             d:'Meilleure reprise pour arbustes et haies.' },
  { m:[3],     t:'plant',  l:'Bouturage des hortensias',             d:'Multiplication gratuite des pieds existants.' },
  // Floraison
  { m:[3,4],   t:'fleur',  l:'Floraison de l\u2019argousier',         d:'Discrète. Vérifier le ratio mâles / femelles.' },
  { m:[4,5],   t:'fleur',  l:'Vergers en fleurs',                    d:'Pommiers, cerisiers. Surveiller les gelées tardives.' },
  { m:[6,7],   t:'fleur',  l:'Tilleuls en fleurs',                   d:'Miellée majeure. Récolte des fleurs pour tisane.' },
  { m:[6,7,8], t:'fleur',  l:'Hortensias paniculés',                 d:'Blanc-vert en juillet, rosé en septembre.' },
  // Faune
  { m:[2,3],   t:'faune',  l:'Retour des grues cendrées',            d:'Passages migratoires spectaculaires.' },
  { m:[3,4],   t:'faune',  l:'Parade du grand tétras',               d:'À l\u2019aube, vieilles pinèdes. Très sensible au dérangement.' },
  { m:[4,5],   t:'faune',  l:'Naissance des renardeaux',             d:'Terrier actif — observation depuis l\u2019affût.' },
  { m:[4,5],   t:'faune',  l:'Mise bas chevreuils & élans',          d:'Prudence : femelles très défensives.' },
  { m:[6,7],   t:'faune',  l:'Rut du chevreuil',                     d:'Poursuites en cercles. Brocards très actifs.' },
  { m:[8,9],   t:'faune',  l:'Brame du cerf',                        d:'Le grand rendez-vous sonore de l\u2019année.' },
  { m:[10,11], t:'faune',  l:'Traces dans la neige',                 d:'Lynx, loup, martre — pistage idéal.' },
  { m:[1,2],   t:'faune',  l:'Rut du lynx',                          d:'Cris nocturnes. Fenêtre d\u2019observation rare.' },
  // Ciel
  { m:[0,1],   t:'ciel',   l:'Nuits les plus noires',                d:'Orion, Pléiades. 17 h de nuit en janvier.' },
  { m:[7],     t:'ciel',   l:'Perséides',                            d:'Pic autour du 12 août. Idéal depuis la prairie.' },
  { m:[9,10],  t:'ciel',   l:'Draconides & Orionides',               d:'Ciel dégagé fréquent début octobre.' },
  { m:[11,0],  t:'ciel',   l:'Géminides',                            d:'Mi-décembre. La plus riche pluie de l\u2019année.' },
  { m:[8,9,10],t:'ciel',   l:'Aurores boréales possibles',           d:'Rare mais réel à cette latitude, par forte activité.' },
]

// ── Points d'intérêt du territoire ──
// x,y = pourcentage sur la carte schématique
export const POIS = [
  { id:'cam1',   x:52, y:31, t:'cam',    l:'Caméra Zeiss — corridor nord', d:'14 espèces documentées. Le spot le plus riche.' },
  { id:'terrier',x:64, y:44, t:'terrier',l:'Terrier de renard',            d:'Actif — renardeaux observés en juin 2026.' },
  { id:'blair',  x:38, y:52, t:'terrier',l:'Blairaudière probable',        d:'À confirmer. Poser une caméra.' },
  { id:'affut',  x:47, y:38, t:'projet', l:'Affût semi-enterré (projet)',  d:'Emplacement pressenti, à 40 m du corridor.' },
  { id:'lac1',   x:24, y:26, t:'eau',    l:'Grand lac',                    d:'Élan et castor probables sur les berges.' },
  { id:'lac2',   x:31, y:63, t:'eau',    l:'Petit lac',                    d:'Baignade. Libellules en juin.' },
  { id:'riv',    x:70, y:66, t:'eau',    l:'Coude de la Līčupe',           d:'Projet de plateforme sur pilotis.' },
  { id:'champ',  x:16, y:44, t:'cueil',  l:'Coin à cèpes',                 d:'Sous les vieux épicéas, après la pluie.' },
  { id:'myrt',   x:80, y:24, t:'cueil',  l:'Myrtilles',                    d:'Pinède sèche. Pic mi-juillet.' },
  { id:'argo',   x:58, y:74, t:'agri',   l:'Plantation d\u2019argousier',   d:'~3 ha. Récolte août-septembre.' },
  { id:'verger', gps:[57.30760,25.27300], x:44, y:82, t:'agri',   l:'Verger & potager',             d:'Pommiers, légumes, ruches à venir.' },
  { id:'maison', gps:[57.30700,25.27450], x:50, y:88, t:'bati',   l:'Maisons',                      d:'Maison principale et dépendances.' },
  { id:'ciel',   x:26, y:80, t:'ciel',   l:'Spot d\u2019observation du ciel',d:'Prairie dégagée, aucune lumière parasite.' },
  { id:'grotte', gps:[57.31250,25.28600], x:86, y:52, t:'explo',  l:'Cavité à explorer',            d:'Repérée mais jamais visitée.' },
]

export const POI_TYPES = {
  cam:    { c:'#4A5D32', e:'📷', l:'Caméra' },
  terrier:{ c:'#7A5A3A', e:'🕳️', l:'Terrier' },
  projet: { c:'#B5602F', e:'🔨', l:'Projet' },
  eau:    { c:'#5B7E8E', e:'💧', l:'Eau' },
  cueil:  { c:'#9A7B4F', e:'🍄', l:'Cueillette' },
  agri:   { c:'#8B9B6E', e:'🌾', l:'Culture' },
  bati:   { c:'#8A7B62', e:'🏠', l:'Bâti' },
  ciel:   { c:'#5B6B7E', e:'🔭', l:'Ciel' },
  explo:  { c:'#8B3A2E', e:'❓', l:'À explorer' },
}
