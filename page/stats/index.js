import { createWidget, widget, align, text_style, setStatusBarVisible } from '@zos/ui'
import { px } from '@zos/utils'
import * as G from '../../lib/game.js'
import { load, readSteps } from '../../lib/store.js'

const W = 390
const PAD = 32
const CARE = [
  { key: 'water', label: 'Water', color: 0x4fc3f7 },
  { key: 'sun', label: 'Sun', color: 0xffd54f },
  { key: 'love', label: 'Love', color: 0xf06292 },
  { key: 'walk', label: 'Walk', color: 0x81c784 }
]
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

Page({
  build() {
    setStatusBarVisible(false)
    // Read-only view: tick a copy without saving so the home page stays the single writer.
    const now = Date.now()
    const s = G.tick(load(now), now, readSteps(), G.dateKey(new Date(now)))
    let y = 48 // clear of the rounded top corners

    const text = (str, size, color, h = size + 12) => {
      createWidget(widget.TEXT, {
        x: px(PAD), y: px(y), w: px(W - 2 * PAD), h: px(h),
        color, text_size: px(size), text: str,
        align_h: align.LEFT, align_v: align.CENTER_V, text_style: text_style.WRAP
      })
      y += h
    }
    const bar = (frac, color) => {
      createWidget(widget.FILL_RECT, { x: px(PAD), y: px(y), w: px(W - 2 * PAD), h: px(10), radius: px(5), color: 0x333333 })
      const w = Math.max(10, Math.round((W - 2 * PAD) * Math.min(1, frac)))
      createWidget(widget.FILL_RECT, { x: px(PAD), y: px(y), w: px(w), h: px(10), radius: px(5), color })
      y += 20
    }

    text(G.displayName(s), 30, 0xffffff)
    text(`Day ${G.ageDay(s, now)} · ${G.mood(s)}`, 20, 0xaaaaaa)
    y += 8

    text(`Growth ${Math.floor(s.gp)} / ${G.MAX_GP}`, 22, 0xffffff)
    bar(s.gp / G.MAX_GP, 0x66bb6a)
    const next = G.gpToNext(s)
    text(next ? `${next} to next stage` : 'Fully grown - plant a seed!', 18, 0xaaaaaa)
    y += 8

    const st = s.steps
    text(`Steps today: ${st.last}`, 22, 0xffffff)
    text(`+${st.gpToday} of ${G.STEP_GP_DAILY_CAP} growth from walking`, 18, 0xaaaaaa)
    text('Steps count when you check in before midnight.', 16, 0x888888, 44)
    y += 8

    text('Care profile', 22, 0xffffff)
    text('Whatever you keep topped up (or walking) shapes its final form.', 16, 0x888888, 44)
    const total = CARE.reduce((sum, c) => sum + s.care[c.key], 0)
    CARE.forEach((c) => {
      const frac = total ? s.care[c.key] / total : 0
      text(`${c.label} ${Math.round(frac * 100)}%`, 18, 0xaaaaaa, 26)
      bar(frac, c.color)
    })
    if (!s.form) {
      text(`Growing toward: ${G.FORMS[G.chooseForm(s.care)].name}`, 20, 0x9ccc65)
    }
    y += 8

    text(`Garden (${s.garden.length})`, 22, 0xffffff)
    if (!s.garden.length) text('No blooms yet', 18, 0xaaaaaa)
    s.garden
      .slice()
      .reverse()
      .forEach((g) => {
        const d = new Date(g.bloomed)
        const days = G.ageDay({ born: g.born }, g.bloomed)
        text(`${G.FORMS[g.form].name} · ${MONTHS[d.getMonth()]} ${d.getDate()} · ${days} days`, 20, 0xcccccc, 30)
      })
    y += 40

    // Invisible spacer so the page can scroll past the last line.
    createWidget(widget.FILL_RECT, { x: 0, y: px(y), w: px(W), h: px(1), color: 0x000000 })
  }
})
