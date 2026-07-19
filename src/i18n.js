// ── Noms russes des espèces + libellés d'interface ──
export const RU = {
  elan:'Лось', cerf:'Благородный олень', chevreuil:'Косуля', sanglier:'Кабан',
  renard:'Лисица', loup:'Волк', viverrin:'Енотовидная собака',
  lynx:'Рысь', chat_sauvage:'Лесной кот',
  blaireau:'Барсук', martre:'Лесная куница', putois:'Хорёк', hermine:'Горностай',
  loutre:'Выдра', vison:'Европейская норка',
  castor:'Бобр', ecureuil:'Белка', lievre:'Заяц-русак', herisson:'Ёж',
  grue:'Серый журавль', hulotte:'Серая неясыть', pic_noir:'Желна',
  pygargue:'Орлан-белохвост', cigogne_noire:'Чёрный аист', geai:'Сойка', grand_tetras:'Глухарь',
  chene:'Дуб черешчатый', hetre:'Бук лесной', bouleau:'Берёза пушистая', aulne:'Ольха чёрная',
  epicea:'Ель обыкновенная', pin:'Сосна обыкновенная', tremble:'Осина',
  sorbier:'Рябина', tilleul:'Липа мелколистная', erable:'Клён остролистный',
  cepe:'Белый гриб', bolet_orange:'Подосиновик', girolle:'Лисичка',
  amanite:'Мухомор красный', russule:'Сыроежка', coprin:'Навозник белый',
  cladonie:'Ягель', usnee:'Уснея', sphaigne:'Сфагнум', polytric:'Кукушкин лён',
  machaon:'Махаон', petit_paon:'Павлиний глаз', lucane:'Жук-олень',
  carabe:'Жужелица', libellule:'Стрекоза', bourdon:'Шмель',
}

export const CAT_RU = {
  mammiferes:'Млекопитающие', oiseaux:'Птицы', arbres:'Деревья',
  champignons:'Грибы', lichens:'Лишайники и мхи', insectes:'Насекомые',
}

export const UI = {
  fr:{
    pokedex:'Le Pokédex', quiz:'Le Quiz', gallery:'La Galerie',
    calendar:'Le Calendrier', territory:'Le Territoire',
    explore:'Explorer', scores:'Scores', badges:'Badges',
    consult:'Consulter', play:'Jouer', browse:'Parcourir', plan:'Planifier', locate:'Situer',
    heroTitle:'Tout ce qui vit ici,\nrépertorié.',
    heroSub:"Un inventaire naturaliste collaboratif de la forêt, des lacs et de la rivière — observé à l'œil nu, à la longue-vue, à la lampe et au piège photo.",
    species:'espèces référencées', observed:'observées', reigns:'règnes', observers:'observateurs',
    mapTitle:'La map du vivant', matrixTitle:'Matrice des observations',
    obs:'Observations', infos:'Infos', seasons:'Saisons', individuals:'Individus observés',
    whoObserved:'Qui a observé', notObserved:'Pas encore observée', toObserve:'À observer',
    quizSoon:"Oups — le Quiz n'est pas encore prêt. Il arrivera quand le Pokédex sera bien rempli !",
    gallerySoon:"La galerie se remplira dès que les premières photos seront importées.",
  },
  ru:{
    pokedex:'Покедекс', quiz:'Викторина', gallery:'Галерея',
    calendar:'Календарь', territory:'Территория',
    explore:'Обзор', scores:'Очки', badges:'Значки',
    consult:'Смотреть', play:'Играть', browse:'Листать', plan:'Планировать', locate:'Карта',
    heroTitle:'Всё, что здесь живёт,\nв одном каталоге.',
    heroSub:'Совместный натуралистический каталог леса, озёр и реки — наблюдения невооружённым глазом, в зрительную трубу, ночью и фотоловушкой.',
    species:'видов внесено', observed:'замечено', reigns:'царств', observers:'наблюдателей',
    mapTitle:'Карта живого', matrixTitle:'Матрица наблюдений',
    obs:'Наблюдения', infos:'Сведения', seasons:'Сезоны', individuals:'Замеченные особи',
    whoObserved:'Кто наблюдал', notObserved:'Ещё не замечен', toObserve:'Найти',
    quizSoon:'Ой — викторина ещё не готова. Она появится, когда Покедекс наполнится!',
    gallerySoon:'Галерея заполнится, как только появятся первые фотографии.',
  }
}

// nom principal + nom secondaire (en filigrane)
export function nameOf(sp, lang) {
  const ru = RU[sp.id]
  return lang === 'ru'
    ? { main: ru || sp.n, sub: sp.n }
    : { main: sp.n, sub: ru || null }
}
export function catNameOf(cat, lang) {
  return lang === 'ru' ? { main: CAT_RU[cat.id] || cat.n, sub: cat.n } : { main: cat.n, sub: CAT_RU[cat.id] || null }
}
