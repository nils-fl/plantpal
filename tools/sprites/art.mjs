// Pixel art sources. Each plant is drawn bottom-up onto a 32x32 grid: its last line
// sits on the soil and is centered over the pot by the average column of that line.
// '.' is transparent; every other character is a palette key.

export const PALETTE = {
  g: '#5cb85c', // leaf
  G: '#2e7d32', // dark leaf
  l: '#9ccc65', // light leaf
  b: '#8d6e63', // light wood
  B: '#5d4037', // wood
  y: '#ffd54f', // yellow
  Y: '#f9a825', // dark yellow
  o: '#a1662f', // acorn
  r: '#e53935', // red
  R: '#9e1b1b', // dark red
  p: '#f8bbd0', // pink
  P: '#ec407a', // hot pink
  k: '#3e2723', // near black
  s: '#d7b98e', // seed shell
  S: '#4e342e', // soil
  L: '#f0a57a', // pot rim light
  T: '#d4764a', // pot
  D: '#a0522d', // pot shadow
  w: '#ffffff'
}

export const POT = [
  '.......SSSSSSSSSSSSSSSSSS.......',
  '......LLLLLLLLLLLLLLLLLLLL......',
  '......TTTTTTTTTTTTTTTTTTTT......',
  '.......DDDDDDDDDDDDDDDDDD.......',
  '.......TTTTTTTTTTTTTTTTTT.......',
  '........TTTTTTTTTTTTTTTT........',
  '........TTTTTTTTTTTTTTTT........',
  '.........TTTTTTTTTTTTTT.........',
  '.........DDDDDDDDDDDDDD.........'
] // rows 23..31

// Pot faces, as [col, row, key] pixels drawn over the pot.
export const FACES = {
  happy: [
    [12, 27, 'k'], [12, 28, 'k'], [19, 27, 'k'], [19, 28, 'k'],
    [14, 29, 'k'], [15, 30, 'k'], [16, 30, 'k'], [17, 29, 'k'],
    [10, 29, 'p'], [21, 29, 'p']
  ],
  sad: [
    [11, 27, 'k'], [12, 28, 'k'], [20, 27, 'k'], [19, 28, 'k'],
    [14, 30, 'k'], [15, 29, 'k'], [16, 29, 'k'], [17, 30, 'k']
  ]
}

export const PLANTS = {
  seed: [
    '..sss..',
    '.ssssk.',
    'sssskss',
    '.sssss.'
  ],

  sprout: [
    '.ll.....ll.',
    'lggl...lggl',
    '.lGgl.lgGl.',
    '..llgggll..',
    '.....g.....',
    '.....g.....',
    '.....g.....',
    '.....G.....'
  ],

  sapling: [
    '.....l.....',
    '....lgl....',
    '...lgGgl...',
    '..lgGgGgl..',
    '...lgGgl...',
    '....lgl.l..',
    '.l...g.lgl.',
    'lgl..g.lgGl',
    'lgGl.gggGl.',
    '.lgggg.ll..',
    '.....g.....',
    '.....g.....',
    '.....g.....',
    '.....G.....'
  ],

  fern_young: [
    '..........l..........',
    '.........lgl.........',
    '...l....lgGgl....l...',
    '..lgl....gGg....lgl..',
    '.lgGgl...gGg...lgGgl.',
    '..lgGgl..gGg..lgGgl..',
    '...lgGgl.gGg.lgGgl...',
    '....lgGggGGGggGgl....',
    '.lg..lgGGGGGGGgl..gl.',
    'lgGgl..gGGGGGg..lgGgl',
    '.lgGgggGGGGGGGgggGgl.',
    '..lggGGGGGGGGGGGggl..',
    '....llgGGGGGGGgll....',
    '.......gGGGGGg.......'
  ],

  fern_bloom: [
    '....ll...........ll....',
    '...l..l....l....l..l...',
    '...l.l....lgl....l.l...',
    '....l..l.lgGgl.l..l....',
    '....g.lgl.gGg.lgl.g....',
    '.l..glgGgl.gGg.lgGglg..l.',
    'lgl.gGlgGgggGgggGglGg.lgl',
    'lgGlgGglgGgGGGgGglgGglgGl',
    '.lgGgGGglgGGGGGGglgGGgGgl.',
    '..lgGGGGggGGGGGGgGGGGGgl.',
    'l..lgGGGGGGGGGGGGGGGGgl..l',
    'gl..lgGGGGGGGGGGGGGGgl..lg',
    'Ggl..lgGGGGGGGGGGGGgl..lgG',
    'lGgl.lgGGGGGGGGGGGGgl.lgGl',
    '.lGgggGGGGGGGGGGGGGGgggGl.',
    '..lgGGGGGGGGGGGGGGGGGGgl..',
    '....llgGGGGGGGGGGGGGgll...',
    '.......llgGGGGGGGGgll.....',
    '..........gGGGGGGg........'
  ],

  sunflower_young: [
    '.....lgl.....',
    '....lgGgl....',
    '....gGGGg....',
    '.....gGg.....',
    '......g......',
    '..ll..g......',
    '.lggl.g......',
    '.lgGgggg.....',
    '..lgg.g..ll..',
    '......g.lggl.',
    '......gggGgl.',
    '......g.lgl..',
    '..l...g......',
    '.lgl..g......',
    '.lgGggg......',
    '..ll..g......',
    '......g......',
    '......G......'
  ],

  sunflower_bloom: [
    '......y.y.y......',
    '....y.yyyyy.y....',
    '...yyyyyyyyyyy...',
    '..yyyYBBBBBYyyy..',
    '.yyyYBBkBkBBYyyy.',
    '..yyBBkBBBkBByy..',
    '.yyyBBBkBkBBByyy.',
    '..yyBBkBBBkBByy..',
    '.yyyYBBBkBBBYyyy.',
    '..yyyYBBBBBYyyy..',
    '...yyyyyyyyyyy...',
    '....y.yyyyy.y....',
    '......y.g.y......',
    '........g........',
    '...ll...g........',
    '..lggl..g...ll...',
    '..lgGgggg..lggl..',
    '...lgg..gggGgl...',
    '........g.lgl....',
    '....l...g........',
    '...lgl..g........',
    '...lgGggg........',
    '....ll..g........',
    '........G........'
  ],

  rose_young: [
    '......P......',
    '.....pPp.....',
    '.....gPg.....',
    '....lgggl....',
    '......g......',
    '..ll..g..ll..',
    '.lggl.g.lggl.',
    '.lgGgggggGgl.',
    '..lgl.g.lgl..',
    '......g......',
    '......gG.....',
    '..lgl.g......',
    '..lgGgg......',
    '...ll.g..ll..',
    '.....Gg.lggl.',
    '......gggGgl.',
    '......g.ll...',
    '......G......'
  ],

  rose_bloom: [
    '....RrR.......RrR....',
    '...RrprR.....RrprR...',
    '...rPprr.....rPprr...',
    '....rrr...R...rrr....',
    '....lgl..RrR..lgl....',
    '.....g..RrprR..g.....',
    '..ll.g..rPprr..g.ll..',
    '.lggggl..rrr..lgggGl.',
    '.lgGl.g..lgl..g..lgl.',
    '..ll..gg..g..gg...l..',
    '.......gg.g.gg.......',
    '...ll...gggg...ll....',
    '..lggl...gg...lggl...',
    '..lgGggg.gg.gggGgl...',
    '...lgl..gggg....ll...',
    '.........gg..........',
    '.....ll..gg..ll......',
    '....lggl.gg.lggl.....',
    '....lgGggggggGgl.....',
    '.....ll..gg..ll......',
    '.........gg..........',
    '.........GG..........'
  ],

  oak_young: [
    '.....lllll.....',
    '...llggggglll..',
    '..lggggGgggggl.',
    '.lgggGggggGgggl',
    '.lggGGggggGGggl',
    '..lgggggGgggGl.',
    '...lgGgggggGl..',
    '....llgBgGll...',
    '.......BB......',
    '......BB.......',
    '.......B.......',
    '.......BB......',
    '.......B.......',
    '......BBB......'
  ],

  oak_bloom: [
    '.........lllllllll.........',
    '......llllgggggggllll......',
    '....llgggggggGggggggll.....',
    '...lggggGggggggggGgggggl...',
    '..lgggGGggggoggggGGggggl...',
    '.lggggggggggggggggggogggl..',
    '.lgggoggggGGgggggggggggggl.',
    'lggggggggGGggggGgggggGGggl.',
    'lgggGGgggggggggGGgggggggGl.',
    '.lggGggggggoggggggggGggggl.',
    '.lgggggggggggggggggggggogl.',
    '..lggggGGgggbgggggGGgggl...',
    '...lgggggggbBbggggggggl....',
    '....llGggggbBbgBgggGll.....',
    '......llgggbBbbBgGll.......',
    '.........BbbBBbB...........',
    '...........bBBb............',
    '...........BBbB............',
    '...........bBBb............',
    '...........bBBB............',
    '..........BbBBbB...........',
    '.........BB.BB.BB..........'
  ],

  bonsai_young: [
    '........lll....',
    '.......lgggl...',
    '......lgGggl...',
    '.......lgBl....',
    '..lll...B......',
    '.lgggl.B.......',
    '.lgGggBB.......',
    '..llBB.B.......',
    '.......BB......',
    '........B......',
    '.......BB......',
    '......BB.......'
  ],

  bonsai_bloom: [
    '..........pp.pp.........',
    '.........pPppppl........',
    '........lpgpPpgpl.......',
    '.......lgpggpggPgl......',
    '........lgGggggl........',
    '..pp......lBBl......pp..',
    '.pPpp......B.......ppPp.',
    'lpgpPpl....BB....lpPgpgl',
    'lgPggpgl..BB.B..lgpggPgl',
    '.lgGgggBBBB...BBBgggGgl.',
    '...lllBB..BB....Bllll...',
    '...........BB...........',
    '............BB..........',
    '...........BB...........',
    '..........BBB...........',
    '.........BBB............',
    '..........BBB...........',
    '..........BBBB..........'
  ]
}

// 8x8 UI icons for the stat bars.
export const ICONS = {
  drop: [
    '...ww...',
    '...ww...',
    '..wwww..',
    '.wwwwww.',
    'wwwwwwww',
    'wwwwwwww',
    '.wwwwww.',
    '..wwww..'
  ],
  sun: [
    'w..ww..w',
    '.w....w.',
    '...ww...',
    'w.wwww.w',
    'w.wwww.w',
    '...ww...',
    '.w....w.',
    'w..ww..w'
  ],
  heart: [
    '.ww..ww.',
    'wwwwwwww',
    'wwwwwwww',
    'wwwwwwww',
    '.wwwwww.',
    '..wwww..',
    '...ww...',
    '........'
  ]
}
