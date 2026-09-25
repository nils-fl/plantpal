"""Compose Zepp store screenshots from the real sprites and the page layouts.

The Zepp store wants 360x360 PNGs with a transparent background; for square
screens the screen is centered with equal left/right margins and no top/bottom
margin. Positions, sizes and colors mirror page/home/index.js and page/stats/index.js.

    python3 tools/store_screenshots.py      # writes store/screenshots/*.png
"""
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
ASSETS = ROOT / 'assets/default.s'
OUT = ROOT / 'store/screenshots'
W, H = 390, 450
CORNER = 70  # rounded display corners
FONT = '/System/Library/Fonts/SFNS.ttf'


def font(size):
    return ImageFont.truetype(FONT, size)


def hexc(v):
    return f'#{v:06x}'


def img(rel):
    return Image.open(ASSETS / rel).convert('RGBA')


def text_center(d, y, h, s, size, color):
    f = font(size)
    box = d.textbbox((0, 0), s, font=f)
    tw, th = box[2] - box[0], box[3] - box[1]
    d.text(((W - tw) / 2 - box[0], y + (h - th) / 2 - box[1]), s, font=f, fill=hexc(color))


def text_left(d, x, y, h, s, size, color):
    f = font(size)
    box = d.textbbox((0, 0), s, font=f)
    d.text((x - box[0], y + (h - (box[3] - box[1])) / 2 - box[1]), s, font=f, fill=hexc(color))


def button(d, x, y, w, h, label, color, text_color):
    d.rounded_rectangle((x, y, x + w, y + h), radius=h // 2, fill=hexc(color))
    f = font(26)
    box = d.textbbox((0, 0), label, font=f)
    tw, th = box[2] - box[0], box[3] - box[1]
    d.text((x + (w - tw) / 2 - box[0], y + (h - th) / 2 - box[1]), label, font=f, fill=hexc(text_color))


def bar(d, x, y, w, h, frac, color, bg=0x333333):
    d.rounded_rectangle((x, y, x + w, y + h), radius=h // 2, fill=hexc(bg))
    fw = max(h, round(w * min(1, frac)))
    d.rounded_rectangle((x, y, x + fw, y + h), radius=h // 2, fill=hexc(color))


def home(sprite, name, mood, clock, stats, bloomed=False):
    im = Image.new('RGBA', (W, H), 'black')
    d = ImageDraw.Draw(im)
    bars = [('ui/drop.png', 0x4fc3f7, 35), ('ui/sun.png', 0xffd54f, 145), ('ui/heart.png', 0xf06292, 255)]
    for (icon, color, x), v in zip(bars, stats):
        im.alpha_composite(img(icon), (x, 44))
        bar(d, x + 30, 50, 70, 12, v / 100, 0xe53935 if v < 20 else color)
    text_center(d, 10, 28, clock, 22, 0x888888)
    text_center(d, 72, 36, name, 26, 0xffffff)
    im.alpha_composite(img(f'plants/{sprite}.png'), ((W - 192) // 2, 110))
    text_center(d, 304, 32, mood, 22, 0xaaaaaa)
    bw = 110 if bloomed else 170
    btns = [('Water', 0x1565c0, 0xffffff), ('Sun', 0xf9a825, 0x000000)]
    if bloomed:
        btns.append(('Seed', 0x2e7d32, 0xffffff))
    for i, (label, color, tc) in enumerate(btns):
        button(d, 20 + i * (bw + 10), 344, bw, 62, label, color, tc)
    text_center(d, 410, 24, 'Tap plant · swipe up for stats', 16, 0x666666)
    return im


def stats():
    im = Image.new('RGBA', (W, H), 'black')
    d = ImageDraw.Draw(im)
    pad, y = 32, 48

    def line(s, size, color, h=None):
        nonlocal y
        h = h or size + 12
        text_left(d, pad, y, h, s, size, color)
        y += h

    def meter(frac, color):
        nonlocal y
        bar(d, pad, y, W - 2 * pad, 10, frac, color)
        y += 20

    line('Sunflower · Young', 30, 0xffffff)
    line('Day 4 · Thriving', 20, 0xaaaaaa)
    y += 8
    line('Growth 131 / 200', 22, 0xffffff)
    meter(131 / 200, 0x66bb6a)
    line('69 to next stage', 18, 0xaaaaaa)
    y += 8
    line('Steps today: 7240', 22, 0xffffff)
    line('+14 of 30 growth from walking', 18, 0xaaaaaa)
    y += 8
    line('Care profile', 22, 0xffffff)
    for label, pct, color in [('Water 18%', 0.18, 0x4fc3f7), ('Sun 52%', 0.52, 0xffd54f)]:
        line(label, 18, 0xaaaaaa, 26)
        meter(pct, color)
    return im


def to_store(screen):
    """Round the display corners, scale to 360 high and center on a transparent 360x360 canvas."""
    mask = Image.new('L', (W, H), 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, W - 1, H - 1), radius=CORNER, fill=255)
    screen = screen.copy()
    screen.putalpha(mask)
    h = 360
    w = round(W * h / H)
    screen = screen.resize((w, h), Image.LANCZOS)
    out = Image.new('RGBA', (360, 360), (0, 0, 0, 0))
    out.alpha_composite(screen, ((360 - w) // 2, 0))
    return out


SHOTS = {
    '1-thriving': home('sunflower_young_0', 'Sunflower · Young', 'Thriving', '10:24 · Day 4', (86, 74, 92)),
    '2-bloom': home('rose_bloom_1', 'Rose · Bloom', 'In full bloom!', '18:02 · Day 7', (65, 58, 97), bloomed=True),
    '3-wilting': home('sapling_0_w', 'Sapling', 'Wilting - thirsty!', '7:45 · Day 2', (8, 35, 40)),
    '4-stats': stats(),
}

if __name__ == '__main__':
    OUT.mkdir(parents=True, exist_ok=True)
    for name, shot in SHOTS.items():
        to_store(shot).save(OUT / f'{name}.png')
    print(f'wrote {len(SHOTS)} screenshots to {OUT.relative_to(ROOT)}')
