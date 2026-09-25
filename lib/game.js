// Pure game logic for PlantPal. No @zos imports so it can be unit-tested with node.

// Speed multiplier for testing: 60 = one in-game hour per real minute. Keep at 1 for release.
export const TIME_SCALE = 1

export const SCHEMA_VERSION = 1
export const HOUR = 3600 * 1000
export const MAX_CATCHUP_H = 24 * 7

export const WILT_AT = 20
export const THRIVE_AT = 60
export const DECAY = { water: 4, light: 4, love: 4 } // points per hour

export const GP_PER_HOUR = 1
export const GP_THRIVE_BONUS = 0.5
export const STEPS_PER_GP = 500
export const STEP_GP_DAILY_CAP = 30
export const WALK_CARE_PER_GP = 0.6

export const STAGES = [
  { id: 'seed', name: 'Seed', gp: 0 },
  { id: 'sprout', name: 'Sprout', gp: 10 },
  { id: 'sapling', name: 'Sapling', gp: 40 },
  { id: 'young', name: 'Young', gp: 100 },
  { id: 'bloom', name: 'Bloom', gp: 200 }
]
export const MAX_GP = STAGES[STAGES.length - 1].gp
const BRANCH_GP = STAGES[3].gp

export const FORMS = {
  fern: { name: 'Fern', care: 'water' },
  sunflower: { name: 'Sunflower', care: 'sun' },
  rose: { name: 'Rose', care: 'love' },
  oak: { name: 'Oak', care: 'walk' },
  bonsai: { name: 'Bonsai', care: null }
}
export const BALANCED_MAX_SHARE = 0.4

const clamp = (v) => Math.max(0, Math.min(100, v))

export function newPlant(now, prev) {
  return {
    v: SCHEMA_VERSION,
    born: now,
    last: now,
    water: 70,
    light: 70,
    love: 70,
    gp: 0,
    form: null,
    care: { water: 0, sun: 0, love: 0, walk: 0 },
    steps: prev ? prev.steps : { date: '', last: 0, pool: 0, gpToday: 0 },
    garden: prev ? prev.garden : []
  }
}

// Bring a save from any older app version up to date instead of discarding it:
// fields added in later versions get their defaults, everything saved is kept.
export function migrate(saved, now) {
  const base = newPlant(now)
  if (!saved || typeof saved !== 'object') return base
  const s = Object.assign(base, saved)
  s.care = Object.assign(newPlant(now).care, saved.care)
  s.steps = Object.assign(newPlant(now).steps, saved.steps)
  s.garden = Array.isArray(saved.garden) ? saved.garden : []
  if (s.form && !FORMS[s.form]) s.form = chooseForm(s.care)
  s.v = SCHEMA_VERSION
  return s
}

export function isWilted(s) {
  return s.water < WILT_AT || s.light < WILT_AT
}

export function stageIndex(gp) {
  let i = 0
  while (i + 1 < STAGES.length && gp >= STAGES[i + 1].gp) i++
  return i
}

export function stageOf(s) {
  return STAGES[stageIndex(s.gp)]
}

export function isBloomed(s) {
  return s.gp >= MAX_GP
}

export function chooseForm(care) {
  const keys = Object.keys(FORMS).filter((k) => FORMS[k].care)
  const total = keys.reduce((sum, k) => sum + (care[FORMS[k].care] || 0), 0)
  if (total <= 0) return 'bonsai'
  let best = keys[0]
  for (const k of keys) {
    if (care[FORMS[k].care] > care[FORMS[best].care]) best = k
  }
  return care[FORMS[best].care] / total < BALANCED_MAX_SHARE ? 'bonsai' : best
}

// Hours until `value` decaying at `rate`/h drops below `limit` (0 if already below).
function hoursAbove(value, rate, limit) {
  return value < limit ? 0 : (value - limit) / rate
}

function addGrowth(s, gp) {
  s.gp = Math.min(MAX_GP, s.gp + gp)
  if (s.form === null && s.gp >= BRANCH_GP) s.form = chooseForm(s.care)
}

// Advance the plant to `now`. `stepsToday` is the watch's step count since midnight, `date` is 'YYYY-MM-DD'.
export function tick(s, now, stepsToday, date) {
  const dtH = Math.min(MAX_CATCHUP_H, (Math.max(0, now - s.last) / HOUR) * TIME_SCALE)
  s.last = now

  if (dtH > 0) {
    // Growth only while healthy; a thriving plant (all stats high) grows faster.
    const healthyH = Math.min(
      dtH,
      hoursAbove(s.water, DECAY.water, WILT_AT),
      hoursAbove(s.light, DECAY.light, WILT_AT)
    )
    const thriveH = Math.min(
      healthyH,
      hoursAbove(s.water, DECAY.water, THRIVE_AT),
      hoursAbove(s.light, DECAY.light, THRIVE_AT),
      hoursAbove(s.love, DECAY.love, THRIVE_AT)
    )
    // Care profile: hours each need was kept topped up. Shapes the final form.
    s.care.water += Math.min(dtH, hoursAbove(s.water, DECAY.water, THRIVE_AT))
    s.care.sun += Math.min(dtH, hoursAbove(s.light, DECAY.light, THRIVE_AT))
    s.care.love += Math.min(dtH, hoursAbove(s.love, DECAY.love, THRIVE_AT))
    s.water = clamp(s.water - DECAY.water * dtH)
    s.light = clamp(s.light - DECAY.light * dtH)
    s.love = clamp(s.love - DECAY.love * dtH)
    addGrowth(s, healthyH * GP_PER_HOUR + thriveH * GP_THRIVE_BONUS)
  }

  creditSteps(s, stepsToday, date)
  return s
}

function creditSteps(s, stepsToday, date) {
  if (typeof stepsToday !== 'number' || !date) return
  const st = s.steps
  if (st.date !== date) {
    st.date = date
    st.last = 0
    st.pool = 0
    st.gpToday = 0
  }
  // Counter went backwards (sensor reset): just resync.
  if (stepsToday < st.last) st.last = stepsToday
  st.pool += stepsToday - st.last
  st.last = stepsToday

  // Wilted plants bank their steps until they recover (same day only).
  if (isWilted(s) || isBloomed(s)) return
  const gp = Math.min(Math.floor(st.pool / STEPS_PER_GP), STEP_GP_DAILY_CAP - st.gpToday)
  if (gp <= 0) return
  st.pool -= gp * STEPS_PER_GP
  st.gpToday += gp
  s.care.walk += gp * WALK_CARE_PER_GP
  addGrowth(s, gp)
}

// Actions return a short message for the UI.
export function water(s) {
  if (s.water >= 90) {
    s.love = clamp(s.love - 5)
    return 'Too much water!'
  }
  s.water = clamp(s.water + 35)
  return 'Glug glug'
}

export function sun(s) {
  if (s.light >= 90) return 'Already sunny'
  s.light = clamp(s.light + 40)
  return 'Soaking up sun'
}

export function love(s) {
  const happy = s.love < 90
  s.love = clamp(s.love + 15)
  return happy ? '♥ Happy!' : '♥'
}

// Move a bloomed plant into the garden and start a fresh seed.
export function replant(s, now) {
  if (!isBloomed(s)) return s
  s.garden.push({ form: s.form, born: s.born, bloomed: now })
  return newPlant(now, s)
}

export function mood(s) {
  if (isWilted(s)) return s.water < s.light ? 'Wilting - thirsty!' : 'Wilting - needs sun!'
  if (isBloomed(s)) return 'In full bloom!'
  const low = Math.min(s.water, s.light, s.love)
  if (low >= THRIVE_AT) return 'Thriving'
  if (low === s.water) return 'A bit thirsty'
  if (low === s.light) return 'Wants some sun'
  return 'Feeling lonely'
}

export function displayName(s) {
  const stage = stageOf(s)
  return s.form ? `${FORMS[s.form].name} · ${stage.name}` : stage.name
}

// Sprite path for the current state; frame is 0 or 1 for the idle sway.
export function spritePath(s, frame) {
  const stage = stageOf(s).id
  const base = s.form ? `${s.form}_${stage}` : stage
  return `plants/${base}_${frame}${isWilted(s) ? '_w' : ''}.png`
}

// Tamagotchi-style age: the day it was planted is Day 1.
export function ageDay(s, now) {
  return Math.floor(Math.max(0, now - s.born) / (24 * HOUR)) + 1
}

export function gpToNext(s) {
  const i = stageIndex(s.gp)
  return i + 1 < STAGES.length ? Math.ceil(STAGES[i + 1].gp - s.gp) : 0
}

export function dateKey(d) {
  const m = d.getMonth() + 1
  const day = d.getDate()
  return `${d.getFullYear()}-${m < 10 ? '0' : ''}${m}-${day < 10 ? '0' : ''}${day}`
}
