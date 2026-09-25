import { test } from 'node:test'
import assert from 'node:assert/strict'
import * as G from '../lib/game.js'

const H = G.HOUR
const T0 = Date.UTC(2026, 8, 24, 8)
const DAY = '2026-09-24'

const plant = (over = {}) => Object.assign(G.newPlant(T0), over)

test('TIME_SCALE is 1 for release', () => {
  assert.equal(G.TIME_SCALE, 1)
})

test('stats decay over time and clamp at 0', () => {
  const s = plant()
  G.tick(s, T0 + 5 * H)
  assert.equal(s.water, 70 - 20)
  assert.equal(s.light, 70 - 20)
  assert.equal(s.love, 70 - 20)
  G.tick(s, T0 + 100 * H)
  assert.equal(s.water, 0)
  assert.equal(s.light, 0)
})

test('ticking backwards in time changes nothing', () => {
  const s = plant()
  G.tick(s, T0 - 3 * H)
  assert.equal(s.water, 70)
  assert.equal(s.gp, 0)
})

test('growth only accrues while healthy (exact catch-up)', () => {
  // water/light 70 hit 20 after 12.5h -> 12.5h healthy; all >= 60 for 2.5h -> bonus.
  const s = plant()
  G.tick(s, T0 + 48 * H)
  assert.ok(Math.abs(s.gp - (12.5 + 2.5 * 0.5)) < 1e-9)
  assert.ok(G.isWilted(s))
})

test('wilted plant does not grow and recovers with care', () => {
  const s = plant({ water: 10, gp: 5 })
  G.tick(s, T0 + 3 * H)
  assert.equal(s.gp, 5)
  assert.ok(G.isWilted(s))
  G.water(s)
  assert.ok(!G.isWilted(s))
  G.tick(s, T0 + 4 * H)
  assert.ok(s.gp > 5)
})

test('catch-up is capped at 7 days', () => {
  const s = plant({ water: 100, light: 100, love: 100 })
  G.tick(s, T0 + 30 * 24 * H)
  assert.equal(s.water, 0)
  assert.ok(s.gp < 30)
})

test('steps convert to growth within the daily cap', () => {
  const s = plant({ water: 100, light: 100 })
  G.tick(s, T0, 1200, DAY)
  assert.equal(s.gp, 2)
  assert.equal(s.steps.pool, 200)
  G.tick(s, T0, 1500, DAY)
  assert.equal(s.gp, 3)
  assert.equal(s.steps.pool, 0)
  G.tick(s, T0, 100000, DAY)
  assert.equal(s.steps.gpToday, G.STEP_GP_DAILY_CAP)
  assert.equal(s.gp, G.STEP_GP_DAILY_CAP)
  assert.equal(s.care.walk, G.STEP_GP_DAILY_CAP * G.WALK_CARE_PER_GP)
})

test('steps reset on a new day and resync if counter goes backwards', () => {
  const s = plant({ water: 100, light: 100 })
  G.tick(s, T0, 5000, DAY)
  assert.equal(s.gp, 10)
  G.tick(s, T0, 700, '2026-09-25')
  assert.equal(s.steps.gpToday, 1)
  assert.equal(s.steps.last, 700)
  G.tick(s, T0, 300, '2026-09-25')
  assert.equal(s.steps.last, 300)
  assert.equal(s.steps.pool, 200)
})

test('wilted plants bank steps until recovered', () => {
  const s = plant({ water: 5 })
  G.tick(s, T0, 2000, DAY)
  assert.equal(s.gp, 0)
  assert.equal(s.steps.pool, 2000)
  G.water(s)
  G.tick(s, T0, 2000, DAY)
  assert.equal(s.gp, 4)
})

test('stages follow growth points', () => {
  assert.equal(G.stageOf({ gp: 0 }).id, 'seed')
  assert.equal(G.stageOf({ gp: 9.9 }).id, 'seed')
  assert.equal(G.stageOf({ gp: 10 }).id, 'sprout')
  assert.equal(G.stageOf({ gp: 40 }).id, 'sapling')
  assert.equal(G.stageOf({ gp: 150 }).id, 'young')
  assert.equal(G.stageOf({ gp: 200 }).id, 'bloom')
})

test('branch form is chosen from the dominant care type', () => {
  assert.equal(G.chooseForm({ water: 10, sun: 2, love: 2, walk: 2 }), 'fern')
  assert.equal(G.chooseForm({ water: 1, sun: 9, love: 2, walk: 2 }), 'sunflower')
  assert.equal(G.chooseForm({ water: 1, sun: 1, love: 9, walk: 2 }), 'rose')
  assert.equal(G.chooseForm({ water: 1, sun: 1, love: 2, walk: 9 }), 'oak')
  assert.equal(G.chooseForm({ water: 5, sun: 5, love: 5, walk: 5 }), 'bonsai')
  assert.equal(G.chooseForm({ water: 0, sun: 0, love: 0, walk: 0 }), 'bonsai')
})

test('form is fixed when crossing into the young stage', () => {
  const s = plant({ water: 100, light: 100, love: 100, gp: 99 })
  s.care = { water: 1, sun: 8, love: 1, walk: 0 }
  G.tick(s, T0 + 2 * H)
  assert.equal(s.form, 'sunflower')
  s.care.water = 100
  G.tick(s, T0 + 3 * H)
  assert.equal(s.form, 'sunflower')
})

test('growth is capped at bloom', () => {
  const s = plant({ water: 100, light: 100, love: 100, gp: 199, form: 'oak' })
  G.tick(s, T0 + 10 * H)
  assert.equal(s.gp, G.MAX_GP)
  assert.ok(G.isBloomed(s))
})

test('care profile counts hours each need stayed topped up', () => {
  const s = plant({ water: 100, light: 60, love: 80 })
  G.tick(s, T0 + 20 * H)
  assert.equal(s.care.water, 10)
  assert.equal(s.care.sun, 0)
  assert.equal(s.care.love, 5)
})

test('actions restore needs; overwatering hurts', () => {
  const s = plant({ water: 50, light: 30, love: 95 })
  assert.equal(G.water(s), 'Glug glug')
  assert.equal(s.water, 85)
  G.water(s)
  assert.equal(s.water, 100)
  assert.equal(G.water(s), 'Too much water!')
  assert.equal(s.water, 100)
  assert.equal(s.love, 90)
  G.sun(s)
  assert.equal(s.light, 70)
  assert.equal(G.love(s), 'Loved!')
  assert.equal(s.love, 100)
  assert.deepEqual(s.care, { water: 0, sun: 0, love: 0, walk: 0 })
})

test('replant moves bloom into the garden and keeps steps', () => {
  const s = plant({ gp: G.MAX_GP, form: 'rose' })
  s.steps.gpToday = 12
  const n = G.replant(s, T0 + H)
  assert.equal(n.gp, 0)
  assert.equal(n.form, null)
  assert.deepEqual(n.garden, [{ form: 'rose', born: T0, bloomed: T0 + H }])
  assert.equal(n.steps.gpToday, 12)
  // Not bloomed yet: no-op
  const young = plant({ gp: 50 })
  assert.equal(G.replant(young, T0), young)
})

test('sprite paths', () => {
  assert.equal(G.spritePath(plant(), 0), 'plants/seed_0.png')
  assert.equal(G.spritePath(plant({ gp: 120, form: 'oak', water: 5 }), 1), 'plants/oak_young_1_w.png')
})

test('migrate keeps old saves and fills in new fields', () => {
  const old = { v: 0, born: T0, last: T0, water: 42, light: 50, love: 60, gp: 77, form: null,
    care: { water: 3 }, garden: [{ form: 'rose', born: 1, bloomed: 2 }] }
  const s = G.migrate(old, T0 + H)
  assert.equal(s.v, G.SCHEMA_VERSION)
  assert.equal(s.gp, 77)
  assert.equal(s.water, 42)
  assert.deepEqual(s.care, { water: 3, sun: 0, love: 0, walk: 0 })
  assert.equal(s.steps.pool, 0)
  assert.equal(s.garden.length, 1)
  assert.equal(G.migrate(null, T0).gp, 0)
})

test('age starts at Day 1', () => {
  const s = plant()
  assert.equal(G.ageDay(s, T0), 1)
  assert.equal(G.ageDay(s, T0 + 23 * H), 1)
  assert.equal(G.ageDay(s, T0 + 24 * H), 2)
})

test('dateKey pads month and day', () => {
  assert.equal(G.dateKey(new Date(2026, 0, 5)), '2026-01-05')
})
