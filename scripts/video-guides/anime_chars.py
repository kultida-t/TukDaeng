"""
Anime-style bust sprites for Nont / P'Daeng. Cel shading, big eyes with highlights, outlines.
build_sprites(scale) -> {kind: {"body": {"down","up"}, "head": {(eyes, mouth): RGBA}, "glow": RGBA}}
eyes: open | blink | happy ; mouth: 0 closed smile, 1 small, 2 mid, 3 wide
"""
import math
from PIL import Image, ImageDraw, ImageFilter

S = 3
OUT = (38, 26, 44)
HW, HH = 340, 400
BW, BH = 400, 330


def sc(v): return [int(x * S) for x in v]
def pts(p): return [(x * S, y * S) for x, y in p]


def face_poly(cx=170, cy=205):
    p = []
    for i in range(72):
        th = 2 * math.pi * i / 72
        s = math.sin(th)
        x = cx + 104 * math.cos(th) * (1 - 0.34 * max(0, s) ** 2)
        y = cy + (112 * s if s < 0 else 124 * s)
        p.append((x, y))
    return p


def masked(layer, poly, size):
    m = Image.new("L", size, 0)
    ImageDraw.Draw(m).polygon(pts(poly), fill=255)
    out = Image.new("RGBA", size, (0, 0, 0, 0))
    out.paste(layer, (0, 0), m)
    return out


def eye(d, cx, cy, kind, iris, flip):
    if kind == "blink":
        d.arc(sc([cx - 26, cy - 14, cx + 26, cy + 22]), 15, 165, fill=OUT, width=7 * S)
        return
    if kind == "happy":
        d.arc(sc([cx - 26, cy - 6, cx + 26, cy + 38]), 200, 340, fill=OUT, width=8 * S)
        return
    d.ellipse(sc([cx - 27, cy - 34, cx + 27, cy + 34]), fill=(255, 255, 255), outline=OUT, width=2 * S)
    d.ellipse(sc([cx - 19, cy - 30, cx + 19, cy + 32]), fill=iris[0])
    d.ellipse(sc([cx - 19, cy - 2, cx + 19, cy + 32]), fill=iris[1])
    d.ellipse(sc([cx - 9, cy - 14, cx + 9, cy + 14]), fill=(18, 14, 24))
    d.ellipse(sc([cx - 15, cy - 24, cx - 1, cy - 8]), fill=(255, 255, 255))
    d.ellipse(sc([cx + 5, cy + 8, cx + 13, cy + 16]), fill=(255, 255, 255, 230))
    d.arc(sc([cx - 30, cy - 38, cx + 30, cy + 22]), 188, 352, fill=OUT, width=8 * S)
    w = 1 if flip else -1
    d.line(sc([cx + w * 28, cy - 14, cx + w * 36, cy - 22]), fill=OUT, width=5 * S)


def mouth(d, cx, cy, m):
    if m == 0:
        d.arc(sc([cx - 22, cy - 16, cx + 22, cy + 12]), 20, 160, fill=OUT, width=5 * S)
    elif m == 1:
        d.ellipse(sc([cx - 12, cy - 6, cx + 12, cy + 12]), fill=(120, 30, 46), outline=OUT, width=3 * S)
    elif m == 2:
        d.ellipse(sc([cx - 17, cy - 8, cx + 17, cy + 20]), fill=(120, 30, 46), outline=OUT, width=3 * S)
        d.ellipse(sc([cx - 9, cy + 8, cx + 9, cy + 19]), fill=(238, 110, 120))
    else:
        d.pieslice(sc([cx - 24, cy - 18, cx + 24, cy + 28]), 0, 180, fill=(120, 30, 46), outline=OUT, width=3 * S)
        d.chord(sc([cx - 24, cy - 18, cx + 24, cy + 28]), 0, 180, fill=(120, 30, 46), outline=OUT, width=3 * S)
        d.ellipse(sc([cx - 12, cy + 8, cx + 12, cy + 24]), fill=(238, 110, 120))
        d.rectangle(sc([cx - 20, cy - 8, cx + 20, cy - 1]), fill=(255, 255, 255))


STYLE = {
    "nont": dict(skin=(250, 218, 188), shade=(232, 184, 154), hair=(34, 38, 66), hair2=(70, 96, 170), iris=((72, 52, 40), (150, 104, 70)),
                 shirt=(52, 118, 220), shirt2=(34, 84, 170), long=False),
    "daeng": dict(skin=(252, 222, 194), shade=(234, 188, 160), hair=(168, 24, 44), hair2=(240, 90, 96), iris=((120, 28, 40), (230, 110, 96)),
                  shirt=(232, 20, 32), shirt2=(168, 10, 24), long=True),
}


def head(kind, eyes, m):
    st = STYLE[kind]
    size = (HW * S, HH * S)
    im = Image.new("RGBA", size, (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    if st["long"]:
        d.rounded_rectangle(sc([40, 40, 300, 312]), 100 * S, fill=st["hair"], outline=OUT, width=4 * S)
        d.polygon(pts([(250, 250), (330, 300), (318, 396), (270, 330)]), fill=st["hair"], outline=OUT, width=4 * S)
    d.ellipse(sc([60, 205, 84, 255]), fill=st["skin"], outline=OUT, width=3 * S)
    d.ellipse(sc([256, 205, 280, 255]), fill=st["skin"], outline=OUT, width=3 * S)
    fp = face_poly()
    d.polygon(pts(fp), fill=st["skin"])
    sh = Image.new("RGBA", size, (0, 0, 0, 0))
    sd = ImageDraw.Draw(sh)
    sd.ellipse(sc([40, 70, 300, 170]), fill=st["shade"])
    sd.ellipse(sc([208, 120, 330, 360]), fill=st["shade"])
    sd.ellipse(sc([170, 150, 320, 340]), fill=(0, 0, 0, 0))
    sh2 = Image.new("RGBA", size, (0, 0, 0, 0))
    ImageDraw.Draw(sh2).ellipse(sc([40, 75, 300, 175]), fill=st["shade"])
    ImageDraw.Draw(sh2).pieslice(sc([30, 110, 310, 410]), 295, 70, fill=st["shade"])
    im.alpha_composite(masked(sh2, fp, size))
    d = ImageDraw.Draw(im)
    d.line(pts(fp + [fp[0]]), fill=OUT, width=4 * S, joint="curve")
    bl = Image.new("RGBA", size, (0, 0, 0, 0))
    ImageDraw.Draw(bl).ellipse(sc([84, 252, 128, 276]), fill=(255, 130, 140, 150))
    ImageDraw.Draw(bl).ellipse(sc([212, 252, 256, 276]), fill=(255, 130, 140, 150))
    im.alpha_composite(bl.filter(ImageFilter.GaussianBlur(4 * S)))
    d = ImageDraw.Draw(im)
    eye(d, 122, 218, eyes, st["iris"], False)
    eye(d, 218, 218, eyes, st["iris"], True)
    d.arc(sc([92, 160, 150, 196]), 200, 335, fill=st["hair"], width=6 * S)
    d.arc(sc([190, 160, 248, 196]), 205, 340, fill=st["hair"], width=6 * S)
    d.line(sc([170, 252, 166, 262]), fill=(190, 130, 110), width=3 * S)
    mouth(d, 170, 292, m)
    if kind == "nont":
        bangs = [(56, 200), (50, 130), (76, 62), (130, 24), (170, 14), (214, 24), (262, 62), (290, 130), (284, 200), (262, 150), (246, 132), (226, 180), (206, 128), (182, 172), (156, 122), (130, 176), (106, 130), (92, 168)]
        d.polygon(pts(bangs), fill=st["hair"], outline=OUT, width=4 * S)
        for a, b in [((92, 70), (140, 40)), ((170, 38), (220, 46)), ((236, 80), (264, 104))]:
            d.line(sc([a[0], a[1], b[0], b[1]]), fill=st["hair2"], width=7 * S)
        d.polygon(pts([(118, 28), (130, -8), (150, 22)]), fill=st["hair"], outline=OUT, width=3 * S)
        d.polygon(pts([(186, 14), (206, -14), (222, 20)]), fill=st["hair"], outline=OUT, width=3 * S)
    else:
        bangs = [(50, 232), (46, 130), (74, 60), (130, 22), (180, 14), (236, 28), (276, 70), (296, 140), (292, 232), (268, 170), (252, 120), (200, 142), (150, 108), (110, 140), (92, 176), (72, 150)]
        d.polygon(pts(bangs), fill=st["hair"], outline=OUT, width=4 * S)
        for x0, x1 in ((46, 82), (258, 294)):
            d.polygon(pts([(x0, 200), (x1, 200), (x1 + (4 if x0 < 100 else -4), 300), (x0 - (-4 if x0 < 100 else 4), 300)]), fill=st["hair"], outline=OUT, width=3 * S)
        for a, b in [((84, 66), (140, 36)), ((190, 32), (250, 52)), ((120, 130), (150, 112))]:
            d.line(sc([a[0], a[1], b[0], b[1]]), fill=st["hair2"], width=7 * S)
        d.ellipse(sc([236, 52, 270, 86]), fill=(197, 160, 89), outline=OUT, width=3 * S)
        d.ellipse(sc([244, 60, 262, 78]), fill=(255, 238, 190), outline=OUT, width=2 * S)
    return im


def body(kind, up):
    st = STYLE[kind]
    size = (BW * S, BH * S)
    im = Image.new("RGBA", size, (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    d.rectangle(sc([172, 0, 228, 80]), fill=STYLE[kind]["skin"], outline=OUT, width=3 * S)
    d.rectangle(sc([172, 0, 228, 30]), fill=STYLE[kind]["shade"])
    torso = [(54, 330), (66, 130), (110, 76), (200, 62), (290, 76), (334, 130), (346, 330)]
    d.polygon(pts(torso), fill=st["shirt"], outline=OUT, width=4 * S)
    shade = Image.new("RGBA", size, (0, 0, 0, 0))
    ImageDraw.Draw(shade).polygon(pts([(250, 60), (350, 100), (350, 330), (230, 330)]), fill=st["shirt2"])
    im.alpha_composite(masked(shade, torso, size))
    d = ImageDraw.Draw(im)
    d.line(pts(torso + [torso[0]]), fill=OUT, width=4 * S)
    if kind == "nont":
        d.polygon(pts([(150, 66), (200, 120), (250, 66), (230, 60), (200, 84), (170, 60)]), fill=(255, 255, 255), outline=OUT, width=3 * S)
        d.line(sc([188, 120, 184, 190]), fill=(255, 255, 255), width=5 * S)
        d.line(sc([212, 120, 216, 190]), fill=(255, 255, 255), width=5 * S)
    else:
        d.polygon(pts([(150, 66), (200, 150), (250, 66), (230, 60), (200, 100), (170, 60)]), fill=(255, 255, 255), outline=OUT, width=3 * S)
        d.ellipse(sc([190, 190, 210, 210]), fill=(197, 160, 89), outline=OUT, width=3 * S)
        d.ellipse(sc([190, 240, 210, 260]), fill=(197, 160, 89), outline=OUT, width=3 * S)
    # arms
    if up:
        limb(d, [(318, 150), (368, 226), (342, 150)], 48, st["shirt"])
        d.ellipse(sc([318, 100, 366, 148]), fill=st["skin"], outline=OUT, width=3 * S)
        d.rounded_rectangle(sc([324, 138, 360, 152]), 5 * S, fill=(197, 160, 89), outline=OUT, width=2 * S)
    else:
        limb(d, [(336, 150), (352, 290)], 48, st["shirt"])
        d.ellipse(sc([330, 284, 374, 326]), fill=st["skin"], outline=OUT, width=3 * S)
    limb(d, [(64, 150), (48, 290)], 48, st["shirt2"])
    return im


def tl(d, a, b, w, fill):
    d.line(sc([a[0], a[1], b[0], b[1]]), fill=fill, width=w * S)
    for x, y in (a, b):
        d.ellipse(sc([x - w / 2, y - w / 2, x + w / 2, y + w / 2]), fill=fill)


def limb(d, path, w, fill):
    for a, b in zip(path, path[1:]): tl(d, a, b, w + 8, OUT)
    for a, b in zip(path, path[1:]): tl(d, a, b, w, fill)


def down(im, k):
    return im.resize((int(im.width * k / S), int(im.height * k / S)), Image.LANCZOS)


def build_sprites(k=0.78):
    out = {}
    for kind in ("nont", "daeng"):
        heads = {}
        for e in ("open", "blink", "happy"):
            for m in range(4):
                heads[(e, m)] = down(head(kind, e, m), k)
        glow = Image.new("RGBA", (560, 560), (0, 0, 0, 0))
        ImageDraw.Draw(glow).ellipse([60, 60, 500, 500], fill=(229, 9, 20, 70) if kind == "daeng" else (60, 130, 240, 70))
        out[kind] = {"head": heads, "body": {"down": down(body(kind, False), k), "up": down(body(kind, True), k)},
                     "glow": glow.filter(ImageFilter.GaussianBlur(40))}
    return out


if __name__ == "__main__":
    sp = build_sprites()
    c = Image.new("RGBA", (900, 560), (14, 36, 66, 255))
    for i, kind in enumerate(("nont", "daeng")):
        b = sp[kind]["body"]["up"]; h = sp[kind]["head"][("open", 2)]
        x = 40 + i * 440
        c.alpha_composite(b, (x, 250)); c.alpha_composite(h, (x + 20, 10))
    c.save("char_preview.png")
