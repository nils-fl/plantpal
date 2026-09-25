import { set, cancel, getAllAlarms, REPEAT_DAY } from '@zos/alarm'
import { LocalStorage } from '@zos/storage'
import { nextAt } from './game.js'

// Late-evening check-ins that credit the day's steps even if the app isn't opened
// again before midnight. Two runs, because a background service can't write storage
// while the screen happens to be on.
export const NIGHTLY = [
  [23, 30],
  [23, 55]
]
export const SERVICE = 'app-service/nightly'

const KEY = 'plantpal.nightly'

// Make sure the daily alarms exist (they persist across reboots once set). They're
// recreated if missing or if NIGHTLY changed since they were set.
export function ensureNightly() {
  try {
    const storage = new LocalStorage()
    const signature = JSON.stringify(NIGHTLY)
    const existing = getAllAlarms() || []
    if (existing.length === NIGHTLY.length && storage.getItem(KEY) === signature) return
    existing.forEach((id) => cancel(id))
    const now = Date.now()
    NIGHTLY.forEach(([h, m]) => {
      set({ url: SERVICE, time: Math.floor(nextAt(now, h, m) / 1000), repeat_type: REPEAT_DAY, store: true })
    })
    storage.setItem(KEY, signature)
  } catch (e) {
    console.log('plantpal: could not schedule nightly check-in')
  }
}
