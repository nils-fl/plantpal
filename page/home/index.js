import { createWidget, widget, prop, event, align, text_style, setStatusBarVisible } from '@zos/ui'
import { onGesture, offGesture, GESTURE_UP } from '@zos/interaction'
import { push, replace } from '@zos/router'
import { setPageBrightTime } from '@zos/display'
import { px } from '@zos/utils'
import * as G from '../../lib/game.js'
import { sync, save } from '../../lib/store.js'
import { ensureNightly } from '../../lib/nightly.js'
import { ROUND } from '../../lib/screen.js'

// Each text row is { y, h } plus x/w on round screens, where rows near the top and bottom are
// narrower to stay inside the circle (full width otherwise).
const SQUARE_LAYOUT = {
  W: 390,
  // Kept clear of the rounded display corners: clock at top center, bars below it, inset from the sides.
  barY: 50,
  barW: 70,
  barX: [35, 145, 255],
  clock: { y: 10, h: 28 },
  name: { y: 72, h: 36 },
  spriteY: 110,
  mood: { y: 304, h: 32 },
  btn: { x: 20, y: 344, h: 62, gap: 10, w2: 170, w3: 110, textSize: 26 },
  hint: { y: 410, h: 24, text: 'Tap plant · swipe up for stats' }
}
// Round design canvas is 480x480; everything stays 12 px inside the circle.
const ROUND_LAYOUT = {
  W: 480,
  barY: 78,
  barW: 60,
  barX: [95, 195, 295],
  clock: { x: 145, y: 34, w: 190, h: 28 },
  name: { x: 70, y: 96, w: 340, h: 34 },
  spriteY: 130,
  mood: { x: 50, y: 322, w: 380, h: 30 },
  btn: { y: 356, h: 54, gap: 10, w2: 144, w3: 94, textSize: 24 },
  hint: { x: 130, y: 414, w: 220, h: 22, text: 'Tap plant · swipe up' }
}
const L = ROUND ? ROUND_LAYOUT : SQUARE_LAYOUT
const W = L.W
const SPRITE = 192
const SPRITE_X = (W - SPRITE) / 2
const SPRITE_Y = L.spriteY
const BAR_Y = L.barY
const BAR_W = L.barW
const BARS = [
  { key: 'water', icon: 'ui/drop.png', color: 0x4fc3f7, x: L.barX[0] },
  { key: 'light', icon: 'ui/sun.png', color: 0xffd54f, x: L.barX[1] },
  { key: 'love', icon: 'ui/heart.png', color: 0xf06292, x: L.barX[2] }
]
// Position of a text row: full width unless the layout narrows it.
const row = (r) => ({ x: px(r.x || 0), y: px(r.y), w: px(r.w || W), h: px(r.h) })
const LOW_COLOR = 0xe53935
const SWAY_MS = 700
const TICK_MS = 60 * 1000
const TOAST_MS = 1500

Page({
  state: {},

  onInit() {
    ensureNightly()
    // Fresh state on every load: replace() may reuse the page object.
    const plant = sync()
    this.state = {
      plant,
      bloomedAtBuild: G.isBloomed(plant),
      frame: 0,
      widgets: {},
      timers: [],
      hopTimers: [],
      toastTimer: null,
      toast: null,
      clock: null,
      leaving: false
    }
  },

  build() {
    setPageBrightTime({ brightTime: 60 * 1000 })
    // The system header (app name + clock) would cover the stat bars; we draw our own clock.
    setStatusBarVisible(false)
    const w = this.state.widgets
    const s = this.state.plant

    w.bars = BARS.map((b) => {
      createWidget(widget.IMG, { x: px(b.x), y: px(BAR_Y - 6), src: b.icon })
      createWidget(widget.FILL_RECT, {
        x: px(b.x + 30), y: px(BAR_Y), w: px(BAR_W), h: px(12), radius: px(6), color: 0x333333
      })
      return createWidget(widget.FILL_RECT, {
        x: px(b.x + 30), y: px(BAR_Y), w: px(BAR_W), h: px(12), radius: px(6), color: b.color
      })
    })

    w.clock = createWidget(widget.TEXT, {
      ...row(L.clock),
      color: 0x888888, text_size: px(22),
      align_h: align.CENTER_H, align_v: align.CENTER_V, text_style: text_style.NONE,
      text: ''
    })

    w.name = createWidget(widget.TEXT, {
      ...row(L.name),
      color: 0xffffff, text_size: px(26),
      align_h: align.CENTER_H, align_v: align.CENTER_V, text_style: text_style.NONE,
      text: ''
    })

    w.sprite = createWidget(widget.IMG, {
      x: px(SPRITE_X), y: px(SPRITE_Y), w: px(SPRITE), h: px(SPRITE),
      src: G.spritePath(s, 0)
    })
    w.sprite.addEventListener(event.CLICK_UP, () => this.act(G.love, true))

    w.heart = createWidget(widget.IMG, {
      x: px(W / 2 - 12), y: px(SPRITE_Y + 4), src: 'ui/heart.png'
    })
    w.heart.setProperty(prop.VISIBLE, false)

    w.mood = createWidget(widget.TEXT, {
      ...row(L.mood),
      color: 0xaaaaaa, text_size: px(22),
      align_h: align.CENTER_H, align_v: align.CENTER_V, text_style: text_style.NONE,
      text: ''
    })

    const bloomed = this.state.bloomedAtBuild
    const B = L.btn
    const btnW = bloomed ? B.w3 : B.w2
    // Square keeps its left inset; round centres the row in the circle.
    const btnX = B.x !== undefined ? B.x : (W - (bloomed ? 3 : 2) * (btnW + B.gap) + B.gap) / 2
    const btn = (i, text, color, press, textColor, fn) =>
      createWidget(widget.BUTTON, {
        x: px(btnX + i * (btnW + B.gap)), y: px(B.y), w: px(btnW), h: px(B.h), radius: px(B.h / 2),
        normal_color: color, press_color: press, color: textColor,
        text_size: px(B.textSize), text, click_func: fn
      })
    btn(0, 'Water', 0x1565c0, 0x0d47a1, 0xffffff, () => this.act(G.water))
    btn(1, 'Sun', 0xf9a825, 0xf57f17, 0x000000, () => this.act(G.sun))
    if (bloomed) btn(2, 'Seed', 0x2e7d32, 0x1b5e20, 0xffffff, () => this.replant())

    createWidget(widget.TEXT, {
      ...row(L.hint),
      color: 0x666666, text_size: px(16),
      align_h: align.CENTER_H, align_v: align.CENTER_V, text_style: text_style.NONE,
      text: L.hint.text
    })

    onGesture({
      callback: (e) => {
        if (e === GESTURE_UP) {
          push({ url: 'page/stats/index' })
          return true
        }
        return false
      }
    })

    this.state.timers.push(
      setInterval(() => {
        this.state.frame = 1 - this.state.frame
        this.render()
      }, SWAY_MS),
      setInterval(() => {
        sync(this.state.plant)
        this.render()
      }, TICK_MS)
    )

    this.render()
  },

  act(action, hop) {
    const s = sync(this.state.plant)
    const msg = action(s)
    save(s)
    this.toast(msg)
    if (hop) this.hop()
    this.render()
  },

  replant() {
    // Keep state in sync so onDestroy doesn't save the old plant back.
    this.state.plant = G.replant(sync(this.state.plant), Date.now())
    save(this.state.plant)
    this.reload()
  },

  // Rebuild the page (buttons change on bloom). Stop the timers first so none of
  // them can fire again and trigger a second reload before this page is destroyed.
  reload() {
    if (this.state.leaving) return
    this.state.leaving = true
    this.state.timers.forEach((t) => clearInterval(t))
    this.state.timers = []
    replace({ url: 'page/home/index' })
  },

  hop() {
    const { sprite, heart } = this.state.widgets
    sprite.setProperty(prop.MORE, { y: px(SPRITE_Y - 8) })
    heart.setProperty(prop.VISIBLE, true)
    this.state.hopTimers.forEach((t) => clearTimeout(t))
    this.state.hopTimers = [
      setTimeout(() => sprite.setProperty(prop.MORE, { y: px(SPRITE_Y) }), 150),
      setTimeout(() => heart.setProperty(prop.VISIBLE, false), 600)
    ]
  },

  toast(msg) {
    this.state.toast = msg
    if (this.state.toastTimer) clearTimeout(this.state.toastTimer)
    this.state.toastTimer = setTimeout(() => {
      this.state.toast = null
      this.state.toastTimer = null
      this.render()
    }, TOAST_MS)
  },

  render() {
    const s = this.state.plant
    const w = this.state.widgets
    if (this.state.leaving) return
    if (G.isBloomed(s) !== this.state.bloomedAtBuild) {
      this.reload()
      return
    }
    BARS.forEach((b, i) => {
      const v = s[b.key]
      w.bars[i].setProperty(prop.MORE, {
        x: px(b.x + 30), y: px(BAR_Y), h: px(12),
        w: px(Math.max(12, Math.round((BAR_W * v) / 100))),
        color: v < G.WILT_AT ? LOW_COLOR : b.color
      })
    })
    const d = new Date()
    const clock = `${d.getHours()}:${d.getMinutes() < 10 ? '0' : ''}${d.getMinutes()} · Day ${G.ageDay(s, d.getTime())}`
    if (clock !== this.state.clock) {
      this.state.clock = clock
      w.clock.setProperty(prop.TEXT, clock)
    }
    w.name.setProperty(prop.TEXT, G.displayName(s))
    w.sprite.setProperty(prop.SRC, G.spritePath(s, this.state.frame))
    w.mood.setProperty(prop.TEXT, this.state.toast || G.mood(s))
  },

  onDestroy() {
    this.state.timers.forEach((t) => clearInterval(t))
    this.state.hopTimers.forEach((t) => clearTimeout(t))
    if (this.state.toastTimer) clearTimeout(this.state.toastTimer)
    offGesture()
    save(this.state.plant)
  }
})
