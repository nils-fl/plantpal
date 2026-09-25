import { LocalStorage } from '@zos/storage'
import { Step } from '@zos/sensor'
import { newPlant, migrate, tick, dateKey } from './game.js'

const KEY = 'plantpal'
const storage = new LocalStorage()

export function load(now) {
  try {
    const raw = storage.getItem(KEY)
    if (raw) return migrate(JSON.parse(raw), now)
  } catch (e) {
    console.log('plantpal: unreadable save, starting fresh')
  }
  return newPlant(now)
}

export function save(s) {
  storage.setItem(KEY, JSON.stringify(s))
}

export function readSteps() {
  try {
    return new Step().getCurrent()
  } catch (e) {
    return undefined
  }
}

// Load, catch the plant up to now (time + steps), persist, and return it.
export function sync(s) {
  const now = Date.now()
  const state = s || load(now)
  tick(state, now, readSteps(), dateKey(new Date(now)))
  save(state)
  return state
}
