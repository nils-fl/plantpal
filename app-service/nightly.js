import { exit } from '@zos/app-service'
import { sync, save } from '../lib/store.js'

// Woken by the nightly alarms (lib/nightly.js): catch the plant up to now, credit
// today's steps and save. Must finish well within the 600 ms service limit.
AppService({
  onInit() {
    try {
      const s = sync()
      s.nightlyAt = Date.now() // shown on the stats page, confirms the check-in ran
      save(s)
    } catch (e) {
      console.log('plantpal: nightly check-in failed')
    }
    exit()
  }
})
