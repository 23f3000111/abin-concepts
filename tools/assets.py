#!/usr/bin/env python3
"""ABIN asset pipeline: the client's material -> optimised web assets in both site folders.

Run from the project root:  python tools/assets.py [section ...]
Sections (default: all): packs sticks kernels orbs logo certs photos posters stills channels stock video docs

Inputs:  'ui images/', 'Catalogue aBin Corn Stick.pdf', 'ABIN PACKAGING.pdf' (kept out of git),
         stock photos downloaded from Unsplash (see CREDITS.md).
Outputs: site-a-kali-nak-lagi/assets/... and site-b-jagung-rangup/assets/... (same relative paths).
Optional: set ESRGAN to the path of realesrgan-ncnn-vulkan.exe for crisper logo and badge upscales;
          without it the script falls back to Lanczos resampling.
Cut-outs are cached in tools/.cache so re-runs are quick.
"""
import io
import os
import subprocess
import sys
import urllib.request
from pathlib import Path

import fitz
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageOps

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / 'ui images'
CACHE = ROOT / 'tools' / '.cache'
SITES = [ROOT / 'site-a-kali-nak-lagi', ROOT / 'site-b-jagung-rangup']
SITE_B = [ROOT / 'site-b-jagung-rangup']
CATALOGUE = ROOT / 'Catalogue aBin Corn Stick.pdf'
PACKAGING = ROOT / 'ABIN PACKAGING.pdf'
CACHE.mkdir(parents=True, exist_ok=True)

PACKS = {  # (flavour, grams): source render on white
    ('spicy', 30): 'WhatsApp Image 2026-10-06 at 8.03.19 AM.jpeg',
    ('spicy', 60): 'WhatsApp Image 2026-10-06 at 8.03.16 AM (1).jpeg',
    ('cheese', 30): 'WhatsApp Image 2026-10-06 at 8.03.15 AM (1).jpeg',
    ('cheese', 60): 'WhatsApp Image 2026-10-06 at 8.03.15 AM.jpeg',
    ('original', 30): 'WhatsApp Image 2026-10-06 at 8.03.17 AM (2).jpeg',
    ('original', 60): 'WhatsApp Image 2026-10-06 at 8.03.17 AM.jpeg',
    ('seaweed', 30): 'WhatsApp Image 2026-10-06 at 8.03.18 AM.jpeg',
    ('seaweed', 60): 'WhatsApp Image 2026-10-06 at 8.03.15 AM (2).jpeg',
}
VIDEOS = {  # reel number: source clip
    1: 'WhatsApp Video 2026-10-06 at 8.03.17 AM.mp4',      # sticks falling, lineup, "Original flavour"
    2: 'WhatsApp Video 2026-10-06 at 8.03.19 AM.mp4',      # flavour by flavour
    3: 'WhatsApp Video 2026-10-06 at 8.03.15 AM.mp4',      # flat lay, "Which flavour will you choose?"
    4: 'WhatsApp Video 2026-10-06 at 8.03.18 AM.mp4',      # family snacking
    5: 'WhatsApp Video 2026-10-06 at 8.03.19 AM (1).mp4',  # boy with the Spicy pack
    6: 'WhatsApp Video 2026-10-06 at 8.03.18 AM (1).mp4',  # kids and family, 35 s
}
FLAVOUR_CLIPS = {'spicy': (0.05, 1.9), 'cheese': (2.05, 1.9), 'original': (4.05, 1.9), 'seaweed': (6.05, 1.9)}
STOCK = {  # name: (images.unsplash.com id, unsplash page)
    'cafe': ('photo-1783085937862-f0c689ab103a', 'https://unsplash.com/photos/cafe-interior-with-a-display-counter-and-shelves-Z-v4bNSBlSw'),
    'gift': ('photo-1760602672748-6a570286ce73', 'https://unsplash.com/photos/hands-opening-a-bright-orange-gift-box-with-ribbon-iPy5gzQMZX4'),
}

def src(name):
    return Image.open(SRC / name)


def save(img, rel, sites=SITES, quality=84):
    for site in sites:
        out = site / 'assets' / rel
        out.parent.mkdir(parents=True, exist_ok=True)
        if rel.endswith('.webp'):
            img.save(out, 'WEBP', quality=quality, method=6)
        elif rel.endswith('.jpg'):
            img.convert('RGB').save(out, 'JPEG', quality=quality, optimize=True, progressive=True)
        else:
            img.save(out)
    print('  ', rel)


CUT = ("import sys; from PIL import Image; from rembg import remove, new_session; "
       "o = remove(Image.open(sys.argv[1]), session=new_session('birefnet-general-lite')); o.crop(o.getbbox()).save(sys.argv[2])")


def cutout(img, key):
    """Background removal (cached). Returns an RGBA image trimmed to its content.
    Each cut runs in its own process: birefnet leaks enough memory to fail on the second image otherwise."""
    cached = CACHE / f'{key}.png'
    if not cached.exists():
        tmp = CACHE / f'{key}-src.png'
        img.convert('RGB').save(tmp)
        subprocess.run([sys.executable, '-c', CUT, str(tmp), str(cached)], check=True, stderr=subprocess.DEVNULL)
        tmp.unlink()
    return Image.open(cached)


def fit_h(img, h):
    return img.resize((round(img.width * h / img.height), h), Image.LANCZOS)


def fit_w(img, w):
    return img.resize((w, round(img.height * w / img.width)), Image.LANCZOS)


def upscale(img, key, model='realesrgan-x4plus-anime'):
    """4x upscale with Real-ESRGAN when available (cached), else Lanczos."""
    cached = CACHE / f'{key}-x4.png'
    if cached.exists():
        return Image.open(cached)
    exe = os.environ.get('ESRGAN')
    if exe and Path(exe).exists():
        tmp_in, tmp_out = CACHE / f'{key}-in.png', cached
        img.save(tmp_in)
        subprocess.run([exe, '-i', str(tmp_in), '-o', str(tmp_out), '-n', model], check=True,
                       cwd=str(Path(exe).parent), stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        tmp_in.unlink()
        return Image.open(cached)
    out = img.resize((img.width * 4, img.height * 4), Image.LANCZOS)
    out.save(cached)
    return out


def circle(img, cx, cy, r, size):
    """Circular crop -> RGBA disc of the given size."""
    box = img.convert('RGB').crop((cx - r, cy - r, cx + r, cy + r)).resize((size, size), Image.LANCZOS)
    mask = Image.new('L', (size * 4, size * 4), 0)
    ImageDraw.Draw(mask).ellipse((0, 0, size * 4 - 1, size * 4 - 1), fill=255)
    box.putalpha(mask.resize((size, size), Image.LANCZOS))
    return box


def cover(img, w, h, fx=0.5, fy=0.5):
    """Crop to the w:h ratio around the focal point (fx, fy), then resize."""
    img = img.convert('RGB')
    r = w / h
    if img.width / img.height > r:
        nw = round(img.height * r)
        x = min(max(0, round(img.width * fx - nw / 2)), img.width - nw)
        img = img.crop((x, 0, x + nw, img.height))
    else:
        nh = round(img.width / r)
        y = min(max(0, round(img.height * fy - nh / 2)), img.height - nh)
        img = img.crop((0, y, img.width, y + nh))
    return img.resize((w, h), Image.LANCZOS)


def catalogue_image(page, width):
    doc = fitz.open(CATALOGUE)
    for x in doc[page].get_images(full=True):
        if x[2] == width:
            return Image.open(io.BytesIO(doc.extract_image(x[0])['image']))
    raise SystemExit(f'catalogue page {page}: no image {width} px wide')


def white_matte(img):
    """Matte for renders on pure white: flood-fill the near-white background from the edges.
    Exact on the cream Original packs, where the AI matte confuses cream with white."""
    import cv2
    im = np.array(img.convert('RGB'))
    h, w = im.shape[:2]
    flood = (im.min(axis=2) >= 238).astype(np.uint8)
    mask = np.zeros((h + 2, w + 2), np.uint8)
    for x, y in [(0, 0), (w - 1, 0), (0, h - 1), (w - 1, h - 1), (w // 2, 0), (w // 2, h - 1), (0, h // 2), (w - 1, h // 2)]:
        if flood[y, x] == 1:
            cv2.floodFill(flood, mask, (x, y), 2)
    fg = np.where(flood == 2, 0, 255).astype(np.uint8)
    fg = cv2.morphologyEx(fg, cv2.MORPH_OPEN, np.ones((3, 3), np.uint8))
    n, lab, stats, _ = cv2.connectedComponentsWithStats((fg > 0).astype(np.uint8))
    fg = np.where(lab == 1 + np.argmax(stats[1:, cv2.CC_STAT_AREA]), 255, 0).astype(np.uint8)
    fg = cv2.GaussianBlur(cv2.erode(fg, np.ones((3, 3), np.uint8)), (0, 0), 0.7)
    out = Image.fromarray(np.dstack([im, fg]), 'RGBA')
    return out.crop(out.getbbox())


# ------------------------------------------------------------------ sections
def packs():
    print('packs')
    cuts = {}
    for (flavour, g), name in PACKS.items():
        cut = white_matte(src(name))
        cuts[(flavour, g)] = cut
        save(fit_h(cut, 1100), f'img/packs/{flavour}-{g}.webp', quality=86)
        save(fit_h(cut, 560), f'img/packs/{flavour}-{g}-sm.webp', quality=84)
    # Variety 4-pack: the four 30 g packs fanned out
    canvas = Image.new('RGBA', (1900, 1300), (0, 0, 0, 0))
    for flavour, angle, dx in [('spicy', 13, 40), ('cheese', 4, 380), ('original', -4, 720), ('seaweed', -13, 1060)]:
        p = fit_h(cuts[(flavour, 30)], 980).rotate(angle, resample=Image.BICUBIC, expand=True)
        canvas.alpha_composite(p, (dx, 1300 - p.height - 60 + abs(angle) * 4))
    save(canvas.crop(canvas.getbbox()), 'img/packs/variety.webp', quality=86)


def tinted(stick, dark, mid, light, specks=None):
    gray = ImageOps.grayscale(stick.convert('RGB'))
    gray = ImageOps.autocontrast(gray, cutoff=1)
    col = ImageOps.colorize(gray, black=dark, white=light, mid=mid).convert('RGBA')
    col.putalpha(stick.getchannel('A'))
    if specks:
        rng = np.random.default_rng(7)
        draw = ImageDraw.Draw(col)
        alpha = np.array(stick.getchannel('A'))
        ys, xs = np.nonzero(alpha > 200)
        for k in rng.choice(len(xs), size=specks, replace=False):
            x, y = int(xs[k]), int(ys[k])
            rw, rh = int(rng.integers(1, 5)), int(rng.integers(1, 3))
            shade = tuple(int(c) for c in rng.choice([[30, 58, 26], [44, 74, 32], [70, 98, 40]]))
            pts = [(x + rw * np.cos(a) * rng.uniform(.6, 1.2), y + rh * np.sin(a) * rng.uniform(.6, 1.2)) for a in np.linspace(0, 6.28, 7)]
            draw.polygon(pts, fill=shade + (int(rng.integers(120, 215)),))
        col.putalpha(stick.getchannel('A'))
    return col


def sticks():
    print('sticks')
    raw = cutout(catalogue_image(1, 2595), 'stick-catalogue')
    base = fit_w(raw, 900)
    save(base, 'img/sticks/stick-spicy.webp', quality=86)
    save(tinted(base, '#A66408', '#F2AE22', '#FFE28A'), 'img/sticks/stick-cheese.webp', quality=86)
    save(tinted(base, '#B8902E', '#F3D47A', '#FFF3C8'), 'img/sticks/stick-original.webp', quality=86)
    save(tinted(base, '#6B8A28', '#BCD66C', '#EEF6C2', specks=240), 'img/sticks/stick-seaweed.webp', quality=86)


def kernels():
    print('kernels')
    im = src(PACKS[('original', 30)]).convert('RGB')
    # loose kernels around the sticks on the Original 30 g render (centre x, y, half-size)
    for i, (cx, cy, s) in enumerate([(292, 932, 62), (700, 985, 62), (412, 872, 50)], 1):
        cut = cutout(im.crop((cx - s, cy - s, cx + s, cy + s)), f'kernel-{i}')
        save(fit_w(upscale(cut, f'kernel-{i}', 'realesrgan-x4plus'), 220), f'img/kernels/kernel-{i}.webp', quality=86)


def nori_piece(im):
    """A torn-edged piece of nori, cut from inside the sheet on the Seaweed 60 g render (the sheet overlaps
    the pack lettering, so it cannot be matted cleanly)."""
    tex = upscale(im.crop((590, 590, 740, 700)), 'nori-texture', 'realesrgan-x4plus').convert('RGB')
    tex = tex.resize((660, 480), Image.LANCZOS).convert('RGBA')
    rng = np.random.default_rng(11)
    pts = []
    for (x0, y0), (x1, y1) in [((24, 30), (636, 18)), ((636, 18), (648, 452)), ((648, 452), (16, 462)), ((16, 462), (24, 30))]:
        for t in np.linspace(0, 1, 22, endpoint=False):
            pts.append((x0 + (x1 - x0) * t + rng.normal(0, 3.5), y0 + (y1 - y0) * t + rng.normal(0, 3.5)))
    mask = Image.new('L', (660 * 2, 480 * 2), 0)
    ImageDraw.Draw(mask).polygon([(x * 2, y * 2) for x, y in pts], fill=255)
    tex.putalpha(mask.resize((660, 480), Image.LANCZOS))
    return tex.rotate(-14, resample=Image.BICUBIC, expand=True)


def orbs():
    """Ingredient cut-outs (chilli, cheese, corn, nori) from the 60 g renders, saved loose for floating
    decorations and as round stickers on a flavour-coloured disc."""
    print('orbs')
    spec = {  # name: (pack, crop box, disc colour)
        'chilli': (('spicy', 60), (55, 725, 380, 1050), '#FFE3DA'),
        'cheese': (('cheese', 60), (165, 650, 655, 1075), '#FFF1C2'),
        'corn': (('original', 60), (470, 370, 805, 850), '#FFF6D6'),
        'nori': (('seaweed', 60), None, '#DFF0C8'),
    }
    size = 360
    for name, (pack, box, disc) in spec.items():
        im = src(PACKS[pack]).convert('RGB')
        if name == 'nori':
            save(nori_piece(im), 'img/ingredients/nori.webp', quality=86)
            save(circle(im, 680, 630, 84, size), 'img/orbs/nori.webp', quality=86)
            continue
        cut = cutout(im.crop(box), f'ingredient-{name}')
        save(fit_w(cut, 520) if cut.width > cut.height else fit_h(cut, 520), f'img/ingredients/{name}.webp', quality=86)
        tile = Image.new('RGBA', (size * 2, size * 2), (0, 0, 0, 0))
        ImageDraw.Draw(tile).ellipse((0, 0, size * 2 - 1, size * 2 - 1), fill=disc)
        obj = cut.copy()
        obj.thumbnail((round(size * 2 * .78), round(size * 2 * .78)), Image.LANCZOS)
        tile.alpha_composite(obj, ((tile.width - obj.width) // 2, (tile.height - obj.height) // 2))
        mask = Image.new('L', tile.size, 0)
        ImageDraw.Draw(mask).ellipse((0, 0, size * 2 - 1, size * 2 - 1), fill=255)
        tile.putalpha(Image.fromarray(np.minimum(np.array(tile.getchannel('A')), np.array(mask))))
        save(tile.resize((size, size), Image.LANCZOS), f'img/orbs/{name}.webp', quality=86)


def logo():
    print('logo')
    im = src(PACKS[('original', 30)]).convert('RGB').crop((380, 100, 660, 235))
    cut = cutout(im, 'logo')
    big = upscale(cut, 'logo')
    big = big.crop(big.getbbox())
    save(fit_w(big, 900), 'img/brand/logo.webp', quality=90)
    save(fit_w(big, 360), 'img/brand/logo-sm.webp', quality=90)
    # icons: the logo on an ABIN-yellow rounded square
    for size, rel in [(48, 'img/brand/favicon.png'), (180, 'img/brand/apple-touch-icon.png'), (512, 'img/brand/icon-512.png')]:
        tile = Image.new('RGBA', (size * 4, size * 4), (0, 0, 0, 0))
        ImageDraw.Draw(tile).rounded_rectangle((0, 0, size * 4 - 1, size * 4 - 1), radius=size, fill='#FFF3C4')
        mark = fit_w(big, round(size * 4 * 0.86))
        tile.alpha_composite(mark, ((tile.width - mark.width) // 2, (tile.height - mark.height) // 2))
        save(tile.resize((size, size), Image.LANCZOS), rel)


def certs():
    """Halal mark from the Spicy 30 g render; MeSTI and Produk Malaysia rendered from the catalogue's vector
    artwork with the background photo redacted out, so they come out crisp on transparency."""
    print('certs')
    halal = circle(src(PACKS[('spicy', 30)]), 290, 760, 46, 92)
    save(fit_w(upscale(halal, 'halal'), 300), 'img/certs/halal.webp', quality=88)
    doc = fitz.open(CATALOGUE)
    page = doc[0]
    page.add_redact_annot(page.rect)
    page.apply_redactions(images=fitz.PDF_REDACT_IMAGE_REMOVE, graphics=fitz.PDF_REDACT_LINE_ART_NONE,
                          text=fitz.PDF_REDACT_TEXT_NONE)
    for name, rect in {'mesti': (49, 747, 122, 782), 'produk': (129, 740, 184, 785)}.items():
        pix = page.get_pixmap(dpi=600, clip=fitz.Rect(*rect), alpha=True)
        img = Image.frombytes('RGBA', (pix.width, pix.height), pix.samples)
        img = img.crop(img.getbbox())
        save(fit_w(img, 420), f'img/certs/{name}.webp', quality=90)


def photos():
    print('photos')
    cover_img = catalogue_image(0, 5185).convert('RGB')
    save(fit_w(cover_img.crop((684, 2450, 4729, 6040)), 1800), 'img/photo/bowl-hero.webp', quality=82)
    back = catalogue_image(3, 2329).convert('RGB')
    save(fit_w(back.crop((0, 1945, 2329, 3293)), 1800), 'img/photo/bowl-crispy.webp', quality=82)
    team = src('WhatsApp Image 2026-10-06 at 8.03.17 AM (1).jpeg').convert('RGB')
    save(team, 'img/photo/team.webp', quality=84)
    for i, name in enumerate(['727178795_1304388648517003_6528185017802302213_n.jpg',
                              '669797006_1247806344175234_8962056301170164839_n.jpg',
                              '666604394_1244912434464625_4037553437418398396_n.jpg',
                              '669043967_1244912477797954_2657838520300469267_n.jpg'], 1):
        im = src(name).convert('RGB')
        im.thumbnail((1400, 1400), Image.LANCZOS)
        save(im, f'img/photo/shelf-{i}.webp', quality=80)


def posters():
    print('posters')
    for rel, name in {
        'four-flavours-en': 'WhatsApp Image 2026-10-06 at 8.03.19 AM (1).jpeg',
        'four-flavours-bm': 'WhatsApp Image 2026-10-06 at 8.03.16 AM.jpeg',
        'four-flavours-zh': 'WhatsApp Image 2026-10-06 at 8.03.16 AM (2).jpeg',
        'banner': '813431997_1376101038012430_6703698950726158600_n.jpg',
        'its-3pm': '727621663_1305978015024733_6707288889232010653_n.jpg',
        'game-night': '730854727_1307760758179792_8951752991850824261_n.jpg',
        'affiliate': '706055008_1283286680627200_713192706725480862_n.jpg',
        'bold-flavour': '731328626_1308579314764603_3461576592183296600_n.jpg',
    }.items():
        im = src(name).convert('RGB')
        im.thumbnail((1280, 1280), Image.LANCZOS)
        save(im, f'img/posters/{rel}.webp', quality=82)


def grab(video, t, w=720):
    out = CACHE / f'frame-{Path(video).stem}-{t}.png'
    if not out.exists():
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-ss', str(t), '-i', str(SRC / video), '-frames:v', '1',
                        '-vf', f'scale={w}:-2', str(out)], check=True)
    return Image.open(out).convert('RGB')


def stills():
    print('stills')
    save(grab(VIDEOS[5], 8.9), 'img/stills/recess.webp', quality=84)
    save(grab(VIDEOS[4], 3.6), 'img/stills/family.webp', quality=84)
    save(grab(VIDEOS[6], 12.0), 'img/stills/boy-pack.webp', quality=84)
    save(grab(VIDEOS[1], 0.4), 'img/stills/sticks-falling.webp', quality=84)
    save(grab(VIDEOS[1], 9.4), 'img/stills/lineup.webp', quality=84)
    save(grab(VIDEOS[3], 1.0), 'img/stills/flatlay.webp', quality=84)


def stock():
    print('stock')
    for name, (pid, _) in STOCK.items():
        dest = CACHE / f'stock-{name}.jpg'
        if not dest.exists():
            req = urllib.request.Request(f'https://images.unsplash.com/{pid}?w=1800&q=85&fm=jpg', headers={'User-Agent': 'Mozilla/5.0'})
            dest.write_bytes(urllib.request.urlopen(req, timeout=60).read())


def channels():
    print('channels')
    stock()
    save(cover(src('727178795_1304388648517003_6528185017802302213_n.jpg').crop((360, 140, 1680, 1077)), 1200, 900),
         'img/channels/supermarket.webp', quality=80)
    save(cover(src('669797006_1247806344175234_8962056301170164839_n.jpg'), 1200, 900, fy=0.72),
         'img/channels/convenience.webp', quality=80)
    save(cover(src('666604394_1244912434464625_4037553437418398396_n.jpg').crop((420, 220, 1280, 865)), 1200, 900),
         'img/channels/export.webp', quality=80)
    save(cover(Image.open(CACHE / 'stock-cafe.jpg'), 1200, 900, fx=0.45), 'img/channels/horeca.webp', quality=80)
    gift = Image.open(CACHE / 'stock-gift.jpg').convert('RGB')
    s = gift.width / 1600
    for box in [(950, 600, 1290, 680), (560, 915, 900, 1000), (1180, 920, 1600, 1010)]:  # printed brand names
        b = tuple(round(v * s) for v in box)
        gift.paste(gift.crop(b).filter(ImageFilter.GaussianBlur(14 * s)), b[:2])
    save(cover(gift, 1200, 900, fx=0.55), 'img/channels/gifts.webp', quality=80)


def ffmpeg_video(source, dest, start=None, dur=None, audio=True, width=540, crf=28, poster_at=1.0):
    for site in SITES:
        out = site / 'assets' / dest
        out.parent.mkdir(parents=True, exist_ok=True)
        args = ['ffmpeg', '-v', 'error', '-y']
        if start is not None:
            args += ['-ss', str(start)]
        args += ['-i', str(SRC / source)]
        if dur is not None:
            args += ['-t', str(dur)]
        args += ['-vf', f'scale={width}:-2', '-c:v', 'libx264', '-crf', str(crf), '-preset', 'slow',
                 '-pix_fmt', 'yuv420p', '-movflags', '+faststart']
        args += ['-c:a', 'aac', '-b:a', '96k'] if audio else ['-an']
        subprocess.run(args + [str(out)], check=True)
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-ss', str(poster_at), '-i', str(out), '-frames:v', '1',
                        '-q:v', '4', str(out.with_suffix('.jpg'))], check=True)
    print('  ', dest)


def video():
    print('video')
    for n, source in VIDEOS.items():
        ffmpeg_video(source, f'video/reel-{n}.mp4')
    for flavour, (start, dur) in FLAVOUR_CLIPS.items():
        ffmpeg_video(VIDEOS[2], f'video/flavour-{flavour}.mp4', start=start, dur=dur, audio=False, crf=26, poster_at=0.6)


def docs():
    print('docs')
    src_doc = fitz.open(CATALOGUE)
    out = fitz.open()
    for page in src_doc:
        pix = page.get_pixmap(dpi=120)
        jpg = pix.tobytes('jpeg', jpg_quality=72)
        new = out.new_page(width=page.rect.width, height=page.rect.height)
        new.insert_image(new.rect, stream=jpg)
    for site in SITE_B:
        dest = site / 'assets' / 'docs' / 'abin-kali-kali-catalogue.pdf'
        dest.parent.mkdir(parents=True, exist_ok=True)
        out.save(dest, deflate=True, garbage=4)
        (site / 'assets' / 'docs' / 'abin-packaging-specs.pdf').write_bytes(PACKAGING.read_bytes())
    print('   docs/abin-kali-kali-catalogue.pdf, docs/abin-packaging-specs.pdf')


SECTIONS = {'packs': packs, 'sticks': sticks, 'kernels': kernels, 'orbs': orbs, 'logo': logo, 'certs': certs,
            'photos': photos, 'posters': posters, 'stills': stills, 'channels': channels, 'stock': stock,
            'video': video, 'docs': docs}

if __name__ == '__main__':
    for name in (sys.argv[1:] or list(SECTIONS)):
        SECTIONS[name]()
