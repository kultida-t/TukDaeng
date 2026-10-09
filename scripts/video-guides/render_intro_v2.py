"""
TukDaeng INTRO v2 (character version: Nont / P'Daeng) - 16:9 1920x1080 @ 24fps
Task: VGD-007 | Script: deliverables/tukdaeng-intro-video-script.md
Pipeline: edge-tts (2 voices, natural back-and-forth w/ overlaps) -> upbeat BGM + SFX + ducking
          -> anime sprites + real app screens -> PIL frames piped to ffmpeg -> dist/video-guides/INTRO-v2.mp4
"""
import asyncio, json, math, os, subprocess, sys
import edge_tts
import numpy as np
import soundfile as sf
from PIL import Image, ImageDraw, ImageFilter, ImageFont

sys.path.insert(0, os.path.dirname(__file__))
from anime_chars import build_sprites
from generate_bgm_upbeat import make_bgm

BASE = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
INTRO = os.path.join(BASE, "assets", "video-guides", "intro")
SHOTS = os.path.join(INTRO, "shots")
BRAND = os.path.join(INTRO, "brand")
UM = os.path.join(BASE, "screenshots", "user-manual")
WORK = os.path.join(BASE, "dist", "video-guides", "v2-work")
OUT = os.path.join(BASE, "dist", "video-guides", "INTRO-v2.mp4")
FFMPEG = r"C:\Users\Admin\AppData\Roaming\Python\Python313\site-packages\imageio_ffmpeg\binaries\ffmpeg-win-x86_64-v7.1.exe"
FONT = r"C:\Windows\Fonts\leelawad.ttf"
FONTB = r"C:\Windows\Fonts\leelawdb.ttf"

W, H, FPS = 1920, 1080, 24
SR = 48000
VOICES = {"nont": ("th-TH-NiwatNeural", "+4Hz"), "daeng": ("th-TH-PremwadeeNeural", "+2Hz")}
NAMES = {"nont": "นนท์", "daeng": "พี่แดง"}
CX = {"nont": 330, "daeng": 790}


def S(p): return os.path.join(SHOTS, p)
def U(p): return os.path.join(UM, p)


# scene, speaker, voice text, subtitle (\n = manual break), shots (None = keep previous), cue, gap(s) before, rate, reaction?
L = lambda *a, **k: (*a, k.get("cue"), k.get("gap", 0.22), k.get("rate", "+0%"), k.get("r", False))
LINES = [
 L(1, "nont", "โอ๊ยยย ปวดหัวจัง อยากได้นาฬิกาสักเรือนอ่ะ แต่ไม่รู้จะไปหาซื้อที่ไหน แล้วก็กลัวโดนหลอกด้วย", "อยากได้นาฬิกา แต่กลัวโดนหลอก\nไม่รู้จะซื้อที่ไหนดี", [S("s01_hook_feed.png")], gap=0.5, rate="+8%"),
 L(1, "daeng", "อ้าว ทำไมไม่ลองแอปตึกแดงล่ะ", "ทำไมไม่ลองแอปตึกแดงล่ะ?", [S("s02_what_splash.png")], rate="+6%"),
 L(1, "nont", "ตึกแดง? แอปอะไรเหรอครับ", "ตึกแดง? แอปอะไรเหรอ?", None, gap=0.12, r=True),
 L(1, "daeng", "แอปรวมทุกเรื่องของคนรักนาฬิกาเลยนะ ซื้อ ขาย โชว์ของสะสม แล้วก็มีคอมมูนิตี้ไว้คุยกันด้วย", "ซื้อ ขาย โชว์ของสะสม\nและคอมมูนิตี้คนรักนาฬิกา", [S("s03a_what_feed.png")]),
 L(2, "nont", "ต้องสมัครสมาชิกก่อนหรือเปล่าครับ ขี้เกียจกรอกอะไรยาว ๆ อ่ะ", "ต้องสมัครสมาชิกก่อนไหม?", [S("s05a_guest_entry.png")], cue=(0.5, 0.80), gap=0.35),
 L(2, "daeng", "ไม่ต้องเลยค่ะ! เปิดแอปมาก็ไถดูได้ทันที", "เปิดแอป ไถดูได้ทันที\nไม่ต้องสมัคร!", [S("s05b_guest_feed.png")], gap=0.12, rate="+8%"),
 L(2, "nont", "เฮ้ย จริงดิ", "จริงดิ!", None, gap=0.05, rate="+10%", r=True),
 L(2, "daeng", "จริงสิ อยากได้เรือนไหน ก็พิมพ์ค้นหา หรือกรองตามยี่ห้อ รุ่น ราคาได้เลย", "ค้นหา กรองตามยี่ห้อ รุ่น ราคา", [S("s08_tour_search.png"), S("s09_tour_filter.png")], cue=(0.5, 0.08)),
 L(2, "nont", "โห สะดวกดีอ่ะ", "สะดวกดีอ่ะ!", None, gap=0.08, r=True),
 L(3, "nont", "แล้วถ้าผมมีเรือนเก่าอยากปล่อยล่ะครับ", "ถ้ามีเรือนเก่าอยากขายล่ะ?", [S("s07a_tour_feedcard.png")], gap=0.4),
 L(3, "daeng", "โพสต์ลงแอปได้เลยค่ะ จะตั้งเป็นขาย หรือแค่โชว์ให้เพื่อน ๆ ชมก็ได้นะ", "โพสต์ขาย หรือโชว์คอลเลกชันก็ได้", [S("s07b_tour_detailshow.png")]),
 L(3, "daeng", "ใส่รูป ใส่รายละเอียด แป๊บเดียวก็เสร็จแล้ว", "ใส่รูป ใส่รายละเอียด\nแป๊บเดียวเสร็จ", [U("04-add-asset-form.png"), U("04-add-asset-gallery-filled.png"), U("04-add-success.png")], gap=0.12),
 L(3, "nont", "ง่ายกว่าที่คิดอีกนะเนี่ย", "ง่ายกว่าที่คิด!", None, gap=0.1, r=True),
 L(4, "nont", "ทีนี้ถ้าเจอเรือนที่ชอบ แล้วอยากต่อราคาล่ะ", "เจอเรือนที่ชอบ ต่อราคาได้ไหม?", [S("s12_tour_make_offer.png")], cue=(0.5, 0.85), gap=0.4),
 L(4, "daeng", "กดเสนอราคาได้เลย แล้วก็คุยกับคนขายต่อในแชทได้ทันที", "เสนอราคา แล้วคุยกับผู้ขายในแชท", [S("s13a_tour_chatroom.png"), S("s13b_tour_offer_pending.png")]),
 L(4, "daeng", "ตกลงกันเสร็จในแอปเดียว ไม่ต้องย้ายไปแชทที่อื่นเลย", "ตกลงกันจบในแอปเดียว", [S("s13c_tour_offer_accepted.png")], gap=0.12),
 L(4, "nont", "แบบนี้ก็สบายใจขึ้นเยอะเลย", "สบายใจขึ้นเยอะ!", None, gap=0.1, r=True),
 L(5, "nont", "แต่เรือนที่ผมฝันไว้ ตอนนี้ยังไม่มีใครลงขายเลยอ่ะ", "เรือนที่ฝันไว้ ยังไม่มีใครลงขาย", [S("s09_tour_filter.png")], gap=0.4),
 L(5, "daeng", "งั้นต้องใช้ Watch Alert แล้วล่ะ!", "งั้นต้องใช้ Watch Alert!", [U("10-watchalert-create.png")], gap=0.1, rate="+6%"),
 L(5, "daeng", "ตั้งเงื่อนไขไว้ว่าอยากได้เรือนแบบไหน พอมีคนลงขายปุ๊บ แอปก็แจ้งเตือนให้ทันที", "ตั้งเงื่อนไขไว้\nมีคนลงขาย แอปแจ้งเตือนทันที", [S("s10_tour_watchalert_list.png"), S("s11_tour_watchalert_noti.png")], gap=0.15),
 L(5, "nont", "ว้าว เหมือนมีคนช่วยเฝ้าให้ตลอดเลย", "เหมือนมีคนช่วยเฝ้าให้ตลอด!", None, gap=0.1, rate="+8%", r=True),
 L(6, "nont", "แล้วเรือนที่ผมซื้อไปแล้ว ตอนนี้มูลค่าเท่าไหร่แล้วนะ", "เรือนที่มี ตอนนี้มูลค่าเท่าไหร่?", [S("s15_tour_profile_owner.png")], cue=(0.50, 0.30), gap=0.4),
 L(6, "daeng", "แตะที่ตัวเลขมูลค่าสินทรัพย์ในโปรไฟล์ได้เลย จะเห็นมูลค่ารวม กำไร กราฟ แล้วก็สัดส่วนแยกตามแบรนด์", "ดูมูลค่ารวม กำไร กราฟ\nและสัดส่วนแยกตามแบรนด์", [S("s15b_tour_assets_value.png"), U("06-assets-value-list.png")]),
 L(6, "daeng", "ราคาตลาดเป็นค่าประเมินจากข้อมูลตลาดนะ แล้วก็เห็นได้แค่เจ้าของบัญชีเท่านั้น", "ประเมินจากข้อมูลตลาด\nเห็นเฉพาะเจ้าของบัญชี", [U("06-assets-value-list2.png")], gap=0.15),
 L(6, "nont", "เหมือนมีพอร์ตของตัวเองเลย เท่ชะมัด", "เหมือนมีพอร์ตของตัวเอง!", None, gap=0.1, r=True),
 L(7, "daeng", "ยังมีกระดานข่าว บทความนาฬิกาให้อ่านเพลิน ๆ", "กระดานข่าว บทความนาฬิกา", [S("s14_tour_board.png")], gap=0.35),
 L(7, "daeng", "มีโปรไฟล์ไว้โชว์คอลเลกชัน แล้วก็ติดตามคนที่เล่นเหมือนกันได้ด้วยนะ", "โปรไฟล์โชว์คอลเลกชัน\nติดตามเพื่อนนักสะสม", [U("06-follow.png"), S("s06a_tour_bottomnav.png")], gap=0.15),
 L(8, "nont", "โอเค ผมโหลดเลยครับ!", "ผมโหลดเลย!", [S("s16_why_allinone.png")], gap=0.3, rate="+10%", r=True),
 L(8, "daeng", "ซื้อ ขาย โชว์ คุย จบในแอปเดียว ค้นหาตึกแดงได้ที่ Play Store หรือ App Store นะ", "TukDaeng · ซื้อ ขาย โชว์ คุย\nโหลดที่ Play Store / App Store", [S("s02_what_splash.png")], gap=0.12),
]
END_HOLD = 3.6


async def synth_all():
    os.makedirs(WORK, exist_ok=True)
    for i, ln in enumerate(LINES):
        mp3 = os.path.join(WORK, f"n{i:02d}.mp3")
        if os.path.exists(mp3): continue
        v, pitch = VOICES[ln[1]]
        for attempt in range(8):
            try:
                await edge_tts.Communicate(ln[2], v, rate=ln[7], pitch=pitch).save(mp3 + ".tmp")
                os.replace(mp3 + ".tmp", mp3); break
            except edge_tts.exceptions.NoAudioReceived:
                await asyncio.sleep(3 * (attempt + 1))
                if attempt == 7: raise


def load_voice(i):
    wav = os.path.join(WORK, f"n{i:02d}.wav")
    if not os.path.exists(wav):
        subprocess.run([FFMPEG, "-y", "-loglevel", "error", "-i", os.path.join(WORK, f"n{i:02d}.mp3"), "-ar", str(SR), "-ac", "2", wav], check=True)
    d, _ = sf.read(wav)
    nz = np.where(np.max(np.abs(d), axis=1) > 0.015)[0]
    return d[max(0, nz[0] - 240): nz[-1] + 480] if len(nz) else d


def whoosh(rng):
    n = int(0.42 * SR); t = np.arange(n) / SR
    x = rng.standard_normal(n)
    x = np.convolve(x, np.ones(24) / 24, mode="same")
    env = np.sin(np.pi * np.minimum(1, t / 0.42)) ** 2
    sw = np.sin(2 * np.pi * np.cumsum(260 + 1500 * (t / 0.42) ** 2) / SR) * 0.25
    return (x * 2.4 + sw) * env * 0.35


def ding():
    t = np.arange(int(0.9 * SR)) / SR
    return (np.sin(2 * np.pi * 1318 * t) + 0.5 * np.sin(2 * np.pi * 1976 * t)) * np.exp(-t * 5) * 0.35


def build_audio():
    asyncio.run(synth_all())
    rng = np.random.default_rng(3)
    t, tl, chunks = 0.5, [], []
    for i, ln in enumerate(LINES):
        d = load_voice(i); dur = len(d) / SR
        t += ln[6] if i else 0
        tl.append((t, t + dur)); chunks.append((t, d))
        t += dur
    total = t + END_HOLD
    n = int(total * SR)
    voice = np.zeros((n, 2))
    for st, d in chunks:
        a = int(st * SR); voice[a:a + len(d)] += d[: n - a]
    sfx = np.zeros((n, 2))
    prev_scene = None
    for (a, _), ln in zip(tl, LINES):
        if ln[0] != prev_scene:
            w = whoosh(rng); s0 = int(max(0, a - 0.3) * SR); sfx[s0:s0 + len(w), 0] += w[: n - s0]; sfx[s0:s0 + len(w), 1] += w[: n - s0]
        prev_scene = ln[0]
        if ln[4] and any("s11_tour_watchalert_noti" in p for p in ln[4]):
            dg = ding(); s0 = int((a + 3.0) * SR) if len(ln[4]) == 2 else int(a * SR); sfx[s0:s0 + len(dg), :] += dg[: n - s0, None]
    bgm = make_bgm(total + 1)[:n].astype(np.float64)
    env = np.convolve(np.max(np.abs(voice), axis=1), np.ones(2400) / 2400, mode="same")
    env = np.clip(env * 6, 0, 1)
    env = np.convolve(env, np.ones(9600) / 9600, mode="same")
    duck = 1 - 0.62 * env
    fade = np.minimum(1, np.arange(n) / (SR * 1.5)) * np.minimum(1, (n - np.arange(n)) / (SR * 3.0))
    mix = voice * 1.0 + bgm * (0.26 * duck * fade)[:, None] + sfx * 0.8
    mix *= 0.92 / np.max(np.abs(mix))
    wav = os.path.join(WORK, "master-v3.wav")
    sf.write(wav, mix, SR, subtype="PCM_16")
    return wav, tl, total


# ---------- visuals ----------
PH_H = 980; PH_W = int(PH_H * 1080 / 2400) + 24
PH_X = 1270; PH_Y = (H - PH_H) // 2 - 6
SC_PAD = 12
SC_W, SC_H = PH_W - SC_PAD * 2, PH_H - SC_PAD * 2


def rr(d, box, r, fill, outline=None, w=1): d.rounded_rectangle(box, r, fill=fill, outline=outline, width=w)


def bg():
    im = Image.new("RGB", (W, H))
    d = ImageDraw.Draw(im)
    for y in range(H):
        r = y / H
        d.line([(0, y), (W, y)], fill=(int(18 * (1 - r) + 6 * r), int(44 * (1 - r) + 14 * r), int(80 * (1 - r) + 28 * r)))
    im = im.convert("RGBA")
    ov = Image.new("RGBA", (W, H), (0, 0, 0, 0)); od = ImageDraw.Draw(ov)
    od.ellipse([PH_X - 350, PH_Y - 100, PH_X + PH_W + 350, PH_Y + PH_H + 100], fill=(197, 160, 89, 40))
    od.ellipse([40, 120, 900, 820], fill=(229, 9, 20, 26))
    ov = ov.filter(ImageFilter.GaussianBlur(120)); im.alpha_composite(ov)
    dots = Image.new("RGBA", (W, H), (0, 0, 0, 0)); dd = ImageDraw.Draw(dots)
    rng = np.random.default_rng(5)
    for _ in range(26):
        x, y, r = int(rng.integers(40, 1180)), int(rng.integers(120, 980)), int(rng.integers(8, 34))
        dd.ellipse([x - r, y - r, x + r, y + r], fill=(255, 255, 255, int(rng.integers(8, 22))))
    im.alpha_composite(dots.filter(ImageFilter.GaussianBlur(3)))
    d = ImageDraw.Draw(im)
    sh = Image.new("RGBA", (W, H), (0, 0, 0, 0)); sd = ImageDraw.Draw(sh)
    sd.rounded_rectangle([PH_X - 8, PH_Y + 14, PH_X + PH_W + 8, PH_Y + PH_H + 22], 46, fill=(0, 0, 0, 170))
    sh = sh.filter(ImageFilter.GaussianBlur(26)); im.alpha_composite(sh)
    d = ImageDraw.Draw(im)
    d.rounded_rectangle([PH_X, PH_Y, PH_X + PH_W, PH_Y + PH_H], 46, fill=(10, 12, 18), outline=(197, 160, 89), width=3)
    logo = Image.open(os.path.join(BRAND, "logo-tukdaeng.png")).convert("RGBA").resize((90, 90))
    im.alpha_composite(logo, (50, 40))
    d.text((152, 56), "TukDaeng", font=ImageFont.truetype(FONTB, 44), fill=(255, 255, 255))
    d.text((154, 106), "ตึกแดง · แพลตฟอร์มคนรักนาฬิกา", font=ImageFont.truetype(FONT, 22), fill=(197, 160, 89))
    return im


def layout(text, maxw=1040):
    f_probe = ImageDraw.Draw(Image.new("RGB", (4, 4)))
    for size in (46, 42, 38, 34, 30):
        f = ImageFont.truetype(FONTB, size)
        lines = []
        for seg in text.split("\n"):
            cur = ""
            for tok in seg.split(" "):
                trial = (cur + " " + tok).strip()
                if cur and f_probe.textlength(trial, font=f) > maxw: lines.append(cur); cur = tok
                else: cur = trial
            lines.append(cur)
        if all(f_probe.textlength(l, font=f) <= maxw for l in lines): return f, lines, size
    return f, lines, size


def make_bubble(text, spk):
    f, lines, size = layout(text)
    d0 = ImageDraw.Draw(Image.new("RGB", (4, 4)))
    lh = int(size * 1.45)
    bw = int(max(d0.textlength(l, font=f) for l in lines)) + 80
    bh = len(lines) * lh + 36
    im = Image.new("RGBA", (bw + 40, bh + 60), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    d.rounded_rectangle([20, 30, 20 + bw, 30 + bh], 34, fill=(255, 255, 255, 250), outline=(197, 160, 89), width=3)
    tx = 20 + bw // 2 if spk == "daeng" else 90
    tx = min(max(tx, 80), 20 + bw - 80) if False else 90 if spk == "nont" else bw - 70
    d.polygon([(tx, 12), (tx - 18, 32), (tx + 18, 32)], fill=(255, 255, 255, 250))
    for i, l in enumerate(lines):
        tw = d.textlength(l, font=f)
        d.text((20 + (bw - tw) / 2, 30 + 18 + i * lh - int(size * 0.08)), l, font=f, fill=(8, 23, 46))
    return im


def cue_ring(im, px, py, t):
    ring = Image.open(os.path.join(BRAND, "cue-highlight-ring-gold.png")).convert("RGBA")
    sz = int(240 * (0.5 + 0.12 * math.sin(t * 6)) * 1.1)
    im.alpha_composite(ring.resize((sz, sz)), (int(px - sz / 2), int(py - sz / 2)))


def render():
    wav, tl, total = build_audio()
    nframes = int(total * FPS)
    base = bg()
    sprites = build_sprites(0.78)
    bubbles = [make_bubble(ln[3], ln[1]) for ln in LINES]
    # shot segments: (start, path) ; reaction lines keep the previous shot
    segs = []
    last_shots = None
    for i, ln in enumerate(LINES):
        a, b = tl[i]
        if ln[4]:
            dur = (tl[i + 1][0] if i + 1 < len(tl) else b) - a
            for k, p in enumerate(ln[4]): segs.append((a + k * dur / len(ln[4]) - 0.05, p, ln[5] if k == 0 else None, i))
    scr = {}
    def screen(p):
        if p not in scr: scr[p] = Image.open(p).convert("RGB")
        return scr[p]
    mask = Image.new("L", (SC_W, SC_H), 0); ImageDraw.Draw(mask).rounded_rectangle([0, 0, SC_W - 1, SC_H - 1], 34, fill=255)
    cmd = [FFMPEG, "-y", "-loglevel", "error", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-",
           "-i", wav, "-c:v", "libx264", "-preset", "medium", "-crf", "20", "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "192k", "-shortest", OUT]
    pr = subprocess.Popen(cmd, stdin=subprocess.PIPE)
    voice_end = max(b for _, b in tl)

    def seg_at(t):
        j = 0
        for q, s in enumerate(segs):
            if s[0] <= t: j = q
        return j

    def frame_of(src, zoom):
        w0 = src.width; h0 = min(src.height, int(w0 * SC_H / SC_W))
        cw, ch = w0 / zoom, h0 / zoom
        return src.crop((int((w0 - cw) / 2), 0, int((w0 + cw) / 2), int(ch))).resize((SC_W, SC_H), Image.BILINEAR)

    for f in range(nframes):
        t = f / FPS
        idx = 0
        for i, (a, _) in enumerate(tl):
            if a - 0.05 <= t: idx = i
        sc_no, spk = LINES[idx][0], LINES[idx][1]
        a, b = tl[idx]
        im = base.copy()
        final_card = False
        j = seg_at(t)
        s0 = segs[j][0]
        ken = 1 + 0.05 * min(1, (t - s0) / 3.0)
        cur = frame_of(end if final_card else screen(segs[j][1]), 1.0 if final_card else ken)
        if j > 0 and t - s0 < 0.28 and not final_card:
            prev = frame_of(screen(segs[j - 1][1]), 1.05)
            cur = Image.blend(prev, cur, (t - s0) / 0.28)
        canvas = Image.new("RGBA", (SC_W, SC_H)); canvas.paste(cur, (0, 0))
        im.paste(canvas, (PH_X + SC_PAD, PH_Y + SC_PAD), mask)
        cue = None
        for ci in (idx,):
            if LINES[ci][5] and a <= t <= b + 0.8 and segs[j][3] == ci: cue = LINES[ci][5]
        if cue and t - s0 > 0.3 and not final_card:
            cue_ring(im, PH_X + SC_PAD + cue[0] * SC_W, PH_Y + SC_PAD + cue[1] * SC_H, t)
        d = ImageDraw.Draw(im)
        d.rounded_rectangle([PH_X + PH_W // 2 - 70, PH_Y + 8, PH_X + PH_W // 2 + 70, PH_Y + 22], 7, fill=(10, 12, 18))
        # characters
        for kd in ("nont", "daeng"):
            sp = sprites[kd]
            talking = any(l[1] == kd and tl[q][0] <= t <= tl[q][1] for q, l in enumerate(LINES))
            active = (spk == kd)
            cx = CX[kd]
            if active:
                im.alpha_composite(sp["glow"], (cx - 280, 110))
            react = LINES[idx][8] and talking
            phase = int(t * 12 + (3 if kd == "daeng" else 0))
            m = [1, 2, 3, 2, 1, 3, 2, 0][phase % 8] if talking else 0
            blink = int(t * 24) % 96 in (0, 1) or (int(t * 24) + (30 if kd == "daeng" else 0)) % 110 in (0, 1)
            eyes = "happy" if (react or (not talking and LINES[idx][8] and active is False)) else ("blink" if blink else "open")
            lift = 0 if not talking else int(abs(math.sin(t * 7)) * 8)
            sway = math.sin(t * 1.8 + (0 if kd == "nont" else 1.4)) * 4
            up = talking and (int(t * 2.2) % 2 == 0)
            body = sp["body"]["up" if up else "down"]
            by = 408 + int(sway * 0.5)
            im.alpha_composite(body, (cx - body.width // 2, by))
            hd = sp["head"][(eyes, m)]
            ang = math.sin(t * 2.4 + (0 if kd == "nont" else 2)) * (3.5 if talking else 1.5) + (-4 if (not talking and not active) else 0)
            hr = hd.rotate(ang, resample=Image.BICUBIC, center=(hd.width // 2, hd.height - 40))
            im.alpha_composite(hr, (cx - hd.width // 2, 150 - lift + int(sway)))
            # name tag
            fnt = ImageFont.truetype(FONTB, 30)
            tw = d.textlength(NAMES[kd], font=fnt)
            col = (255, 255, 255) if active else (150, 165, 185)
            rr(d, [cx - tw / 2 - 20, 690, cx + tw / 2 + 20, 736], 23, col, outline=(197, 160, 89) if active else None, w=2)
            d.text((cx - tw / 2, 691), NAMES[kd], font=fnt, fill=(8, 23, 46))
        if not final_card:
            bi = bubbles[idx]
            age = t - a
            off = int(26 * max(0, 1 - age / 0.2) ** 2)
            x0 = 40 if spk == "nont" else 1180 - bi.width - 20
            im.alpha_composite(bi, (x0, 762 + off))
        for s in range(1, 9):
            col = (229, 9, 20) if s == sc_no else ((197, 160, 89) if s < sc_no else (80, 96, 120))
            d.ellipse([70 + (s - 1) * 34, 1030, 86 + (s - 1) * 34, 1046], fill=col)
        pr.stdin.write(im.convert("RGB").tobytes())
    pr.stdin.close(); pr.wait()
    json.dump([{"line": i, "speaker": l[1], "text": l[2], "start": round(a, 2), "end": round(b, 2)} for i, (l, (a, b)) in enumerate(zip(LINES, tl))],
              open(os.path.join(os.path.dirname(OUT), "INTRO-v2-timeline.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    print("DONE", OUT, f"{total:.1f}s")


if __name__ == "__main__":
    if sys.stdout.encoding != "utf-8":
        try: sys.stdout.reconfigure(encoding="utf-8")
        except Exception: pass
    render()
