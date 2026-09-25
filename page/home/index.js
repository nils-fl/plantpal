import { createWidget, widget, prop, event, align, text_style, setStatusBarVisible } from '@zos/ui'
import { onGesture, offGesture, GESTURE_UP } from '@zos/interaction'
import { push, replace } from '@zos/router'
import { setPageBrightTime } from '@zos/display'
import { px } from '@zos/utils'
import * as G from '../../lib/game.js'
import { sync, save } from '../../lib/store.js'

const W = 390
const SPRITE = 192
const SPRITE_X = (W - SPRITE) / 2
const SPRITE_Y = 110
// Kept clear of the rounded display corners: clock at top center, bars below it, inset from the sides.
const BAR_Y = 50
const BAR_W = 70
const BARS = [
  { key: 'water', icon: 'ui/drop.png', color: 0x4fc3f7, x: 35 },
  { key: 'light', icon: 'ui/sun.png', color: 0xffd54f, x: 145 },
  { key: 'love', icon: 'ui/heart.png', color: 0xf06292, x: 255 }
]
const LOW_COLOR = 0xe53935
const SWAY_MS = 700
const TICK_MS = 60 * 1000
const TOAST_MS = 1500

Page({
  state: {},

  onInit() {
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
      x: 0, y: px(10), w: px(W), h: px(28),
      color: 0x888888, text_size: px(22),
      align_h: align.CENTER_H, align_v: align.CENTER_V, text_style: text_style.NONE,
      text: ''
    })

    w.name = createWidget(widget.TEXT, {
      x: 0, y: px(72), w: px(W), h: px(36),
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
      x: 0, y: px(304), w: px(W), h: px(32),
      color: 0xaaaaaa, text_size: px(22),
      align_h: align.CENTER_H, align_v: align.CENTER_V, text_style: text_style.NONE,
      text: ''
    })

    const bloomed = this.state.bloomedAtBuild
    const btnW = bloomed ? 110 : 170
    const btn = (i, text, color, press, textColor, fn) =>
      createWidget(widget.BUTTON, {
        x: px(20 + i * (btnW + 10)), y: px(344), w: px(btnW), h: px(62), radius: px(31),
        normal_color: color, press_color: press, color: textColor,
        text_size: px(26), text, click_func: fn
      })
    btn(0, 'Water', 0x1565c0, 0x0d47a1, 0xffffff, () => this.act(G.water))
    btn(1, 'Sun', 0xf9a825, 0xf57f17, 0x000000, () => this.act(G.sun))
    if (bloomed) btn(2, 'Seed', 0x2e7d32, 0x1b5e20, 0xffffff, () => this.replant())

    createWidget(widget.TEXT, {
      x: 0, y: px(410), w: px(W), h: px(24),
      color: 0x666666, text_size: px(16),
      align_h: align.CENTER_H, align_v: align.CENTER_V, text_style: text_style.NONE,
      text: 'Tap plant · swipe up for stats'
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
