"""
TukDaeng INTRO v3 - Mascot story "นาฬิกาของคุณปู่" (Dang + Tick), 16:9 1920x1080 @ 24fps
Inputs : assets/video-guides/mascot/scene-01..10.png (AI generated 3D art) + real app screens
Output : dist/video-guides/INTRO-v3-mascot.mp4 (+ INTRO-v3-mascot-timeline.json)
"""
import asyncio, json, math, os, subprocess, sys
import edge_tts
import numpy as np
import soundfile as sf
from PIL import Image, ImageDraw, ImageFilter, ImageFont

sys.path.insert(0, os.path.dirname(__file__))
from generate_bgm_upbeat import make_bgm
import sfx_lib as sfxl

BASE = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
INTRO = os.path.join(BASE, "assets", "video-guides", "intro")
SHOTS = os.path.join(INTRO, "shots")
BRAND = os.path.join(INTRO, "brand")
UM = os.path.join(BASE, "screenshots", "user-manual")
MASCOT = os.path.join(BASE, "assets", "video-guides", "mascot")
WORK = os.path.join(BASE, "dist", "video-guides", "v3-work")
OUT = os.path.join(BASE, "dist", "video-guides", "INTRO-v3-mascot.mp4")
FFMPEG = r"C:\Users\Admin\AppData\Roaming\Python\Python313\site-packages\imageio_ffmpeg\binaries\ffmpeg-win-x86_64-v7.1.exe"
FONT = r"C:\Windows\Fonts\leelawad.ttf"
FONTB = r"C:\Windows\Fonts\leelawdb.ttf"

W, H, FPS, SR = 1920, 1080, 24, 48000
VOICES = {"dang": ("th-TH-NiwatNeural", "+4Hz"), "tick": ("th-TH-PremwadeeNeural", "+6Hz")}
NAMES = {"dang": "แดง", "tick": "ติ๊ก"}
CHIP = {"dang": (229, 9, 20), "tick": (197, 160, 89)}


def S(p): return os.path.join(SHOTS, p)
def U(p): return os.path.join(UM, p)


def ln(spk, beats, gap=0.22): return dict(spk=spk, beats=beats, gap=gap, text=" ".join(b[0] for b in beats))


# beats = [(text, emotion)] ; phone: dict(frm=line index, shots=[...], pos, tilt, cue)
SCENES = [
 dict(img="scene-01.png", focus=(0.52, 0.45), lines=[
     ln("dang", [("เฮ้อ…", "sad"), ("นาฬิกาของปู่… หายไปแล้วเหรอ", "sad")], gap=0.8),
     ln("tick", [("แดง…", "soft"), ("อย่าเพิ่งเศร้านะ", "soft"), ("เราหาเรือนแบบเดียวกันได้ต่างหาก!", "happy")], gap=0.5)]),
 dict(img="scene-02.png", focus=(0.55, 0.45), lines=[
     ln("dang", [("แต่… ซื้อมือสองออนไลน์เนี่ย", "worry"), ("ผมกลัวโดนหลอกอ่ะ", "worry")], gap=0.45),
     ln("tick", [("อืมม… เข้าใจเลย", "soft"), ("ใครๆ ก็กลัว", "soft"), ("แต่เดี๋ยวก่อนนะ", "happy")], gap=0.3)]),
 dict(img="scene-03.png", focus=(0.55, 0.42), lines=[
     ln("tick", [("ติ๊กรู้จักแอปนึงนะ!", "excited"), ("แอปตึกแดงไง!", "excited"), ("ซื้อ ขาย โชว์ คุยกัน ครบจบในที่เดียว", "happy")], gap=0.4),
     ln("dang", [("ห๊ะ?", "gasp"), ("ว้าว! ตึกแดง ฟังดูน่าสนใจ", "excited")], gap=0.15)],
     phone=dict(frm=0, shots=[S("s02_what_splash.png"), S("s03a_what_feed.png")], pos=(0.86, 0.52), tilt=-4)),
 dict(img="scene-04.png", focus=(0.6, 0.45), lines=[
     ln("dang", [("แล้วต้องสมัครก่อนมั้ยเนี่ย", "worry")], gap=0.45),
     ln("tick", [("ไม่ต้องเลย!", "excited"), ("เปิดแอปมาก็ไถดูได้ทันที", "happy")], gap=0.12),
     ln("dang", [("เฮ้ย", "gasp"), ("จริงดิ!", "excited")], gap=0.05)],
     phone=dict(frm=0, shots=[S("s05a_guest_entry.png"), S("s05b_guest_feed.png")], pos=(0.14, 0.52), tilt=4, cue=(0.5, 0.80))),
 dict(img="scene-05.png", focus=(0.55, 0.45), lines=[
     ln("tick", [("อยากได้เรือนไหน พิมพ์ค้นหาเลย", "happy"), ("หรือจะกรองตามยี่ห้อ รุ่น ราคาก็ได้นะ", "normal")], gap=0.4),
     ln("dang", [("โห…", "gasp"), ("เรือนที่ใกล้เคียงของปู่เลยนี่นา!", "excited")], gap=0.15)],
     phone=dict(frm=0, shots=[S("s08_tour_search.png"), S("s09_tour_filter.png")], pos=(0.88, 0.56), tilt=-3, cue=(0.5, 0.08))),
 dict(img="scene-06.png", focus=(0.5, 0.5), lines=[
     ln("dang", [("เจอแล้ว!", "excited"), ("แต่… ขอต่อราคาได้มั้ยเนี่ย", "worry")], gap=0.4),
     ln("tick", [("ได้สิ!", "excited"), ("กดเสนอราคา แล้วคุยกับคนขายในแชทได้เลย", "happy"), ("ตกลงกันจบในแอปเดียว ไม่ต้องไปไหนเลย", "normal")], gap=0.3),
     ln("dang", [("อ่า… สบายใจขึ้นเยอะเลย", "happy")], gap=0.2)],
     phone=dict(frm=0, shots=[S("s12_tour_make_offer.png"), S("s13a_tour_chatroom.png"), S("s13c_tour_offer_accepted.png")], pos=(0.585, 0.40), tilt=3, cue=(0.5, 0.85))),
 dict(img="scene-07.png", focus=(0.5, 0.5), lines=[
     ln("dang", [("แต่รุ่นเดียวกับปู่เป๊ะๆ", "sad"), ("ยังไม่มีใครลงขายเลย…", "sad")], gap=0.5),
     ln("tick", [("ไม่เป็นไรนะแดง", "soft"), ("เราตั้ง Watch Alert ไว้ไงล่ะ!", "excited"), ("ติ๊กจะเฝ้าให้เอง มีคนลงขายเมื่อไหร่ แจ้งเตือนทันที", "happy")], gap=0.4)],
     phone=dict(frm=1, shots=[U("10-watchalert-create.png"), S("s10_tour_watchalert_list.png")], pos=(0.13, 0.36), tilt=-4)),
 dict(img="scene-08.png", focus=(0.58, 0.5), lines=[
     ln("tick", [("ติ๊งง!", "shout"), ("แดง ตื่นๆๆ!", "shout"), ("มีคนลงขายแล้ว!", "excited")], gap=0.5),
     ln("dang", [("ห๊า…? อะไรนะ", "sleepy"), ("อ๊ะ!", "gasp"), ("ว้าวว! นี่แหละเรือนของปู่!", "shout"), ("ขอบใจนะติ๊ก!", "happy")], gap=0.2)],
     phone=dict(frm=0, shots=[S("s11_tour_watchalert_noti.png")], pos=(0.17, 0.52), tilt=4)),
 dict(img="scene-09.png", focus=(0.45, 0.5), lines=[
     ln("tick", [("เก็บไว้ในพอร์ตตัวเองเลย", "proud"), ("ดูมูลค่ารวม กำไร แล้วโชว์คอลเลกชันให้เพื่อนๆ ชมได้ด้วยนะ", "normal")], gap=0.45),
     ln("dang", [("เท่ชะมัด!", "proud"), ("เหมือนมีพิพิธภัณฑ์ส่วนตัวเลย", "happy")], gap=0.15)],
     phone=dict(frm=0, shots=[S("s15_tour_profile_owner.png"), S("s15b_tour_assets_value.png"), U("06-assets-value-list.png")], pos=(0.85, 0.52), tilt=-3, cue=(0.50, 0.30))),
 dict(img="scene-10.png", focus=(0.5, 0.5), lines=[
     ln("dang", [("แล้วมาคุยเรื่องนาฬิกากันนะทุกคน!", "excited")], gap=0.45),
     ln("tick", [("TukDaeng ตึกแดง", "happy"), ("โหลดได้แล้วที่ Google Play และ App Store นะ", "normal")], gap=0.3)]),
]
END_HOLD = 4.2
XFADE = 0.55

FLAT = [(si, li, l) for si, sc in enumerate(SCENES) for li, l in enumerate(sc["lines"])]

# emotion -> (rate, pitch offset Hz, volume, pause-after seconds, Gemini style hint)
EMO = {
    "normal": ("+0%", 0, "+0%", 0.14, "naturally, conversational"),
    "soft": ("-6%", 2, "-10%", 0.2, "softly and kindly, comforting"),
    "sad": ("-16%", -9, "-18%", 0.32, "sad, quiet and heartbroken, with a sigh"),
    "worry": ("-4%", 3, "-6%", 0.2, "worried and hesitant"),
    "happy": ("+9%", 6, "+4%", 0.14, "cheerful and warm, smiling"),
    "excited": ("+18%", 12, "+14%", 0.12, "very excited and energetic"),
    "shout": ("+14%", 10, "+34%", 0.1, "shouting loudly with urgency and joy"),
    "gasp": ("+8%", 16, "+8%", 0.1, "surprised, a sudden gasp"),
    "proud": ("+3%", 4, "+8%", 0.16, "proud and impressed"),
    "sleepy": ("-18%", -8, "-30%", 0.25, "groggy, half asleep, mumbling"),
}
BASE_PITCH = {"dang": 0, "tick": 8}
GEMINI_VOICES = {"dang": "Puck", "tick": "Leda"}


def _beat_key(spk, text, emo):
    import hashlib
    return hashlib.md5(f"{spk}|{text}|{emo}|{'g' if os.environ.get('GEMINI_API_KEY') else 'e'}".encode("utf-8")).hexdigest()[:12]


def gemini_beat(spk, text, emo, out_wav):
    import base64, requests, wave
    key = os.environ["GEMINI_API_KEY"]
    prompt = f"Say the following Thai line {EMO[emo][4]}, like a real animated movie character, natural and expressive: {text}"
    body = {"contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {"responseModalities": ["AUDIO"],
                                 "speechConfig": {"voiceConfig": {"prebuiltVoiceConfig": {"voiceName": GEMINI_VOICES[spk]}}}}}
    r = requests.post("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent",
                      params={"key": key}, json=body, timeout=120)
    r.raise_for_status()
    pcm = base64.b64decode(r.json()["candidates"][0]["content"]["parts"][0]["inlineData"]["data"])
    with wave.open(out_wav, "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(24000); w.writeframes(pcm)


async def synth_all():
    os.makedirs(WORK, exist_ok=True)
    for _, _, l in FLAT:
        for text, emo in l["beats"]:
            k = _beat_key(l["spk"], text, emo)
            if os.path.exists(os.path.join(WORK, f"b{k}.wav")): continue
            raw = os.path.join(WORK, f"b{k}.raw")
            if os.environ.get("GEMINI_API_KEY"):
                gemini_beat(l["spk"], text, emo, raw + ".wav"); os.replace(raw + ".wav", raw)
            else:
                v, _ = VOICES[l["spk"]]
                rate, pitch, vol = EMO[emo][0], BASE_PITCH[l["spk"]] + EMO[emo][1], EMO[emo][2]
                await asyncio.sleep(0.8)
                for attempt in range(14):
                    try:
                        await edge_tts.Communicate(text, v, rate=rate, volume=vol, pitch=f"{pitch:+d}Hz").save(raw + ".tmp")
                        os.replace(raw + ".tmp", raw); break
                    except edge_tts.exceptions.NoAudioReceived:
                        await asyncio.sleep(2 + attempt)
                        if attempt == 13: raise
            subprocess.run([FFMPEG, "-y", "-loglevel", "error", "-i", raw, "-ar", str(SR), "-ac", "2", os.path.join(WORK, f"b{k}.wav")], check=True)


def load_voice(i):
    _, _, l = FLAT[i]
    parts = []
    for j, (text, emo) in enumerate(l["beats"]):
        d, _ = sf.read(os.path.join(WORK, f"b{_beat_key(l['spk'], text, emo)}.wav"))
        nz = np.where(np.max(np.abs(d), axis=1) > 0.015)[0]
        d = d[max(0, nz[0] - 200): nz[-1] + 300] if len(nz) else d
        parts.append(d)
        if j < len(l["beats"]) - 1:
            pause = EMO[emo][3] + (0.2 if text.endswith("…") else 0)
            parts.append(np.zeros((int(pause * SR), 2)))
    return np.concatenate(parts)


def smooth(x, sec):
    k = int(sec * SR)
    return np.convolve(x, np.ones(k) / k, mode="same")


def whoosh(rng):
    n = int(0.45 * SR); t = np.arange(n) / SR
    x = np.convolve(rng.standard_normal(n), np.ones(24) / 24, mode="same")
    env = np.sin(np.pi * np.minimum(1, t / 0.45)) ** 2
    sw = np.sin(2 * np.pi * np.cumsum(260 + 1500 * (t / 0.45) ** 2) / SR) * 0.25
    return (x * 2.4 + sw) * env * 0.35


def build_audio():
    asyncio.run(synth_all())
    rng = np.random.default_rng(3)
    t, tl, chunks = 0.7, [], []
    for i, (_, _, l) in enumerate(FLAT):
        d = load_voice(i); dur = len(d) / SR
        t += l["gap"] if i else 0
        tl.append((t, t + dur)); chunks.append((t, d)); t += dur
    total = t + END_HOLD
    n = int(total * SR)
    voice = np.zeros((n, 2))
    for st, d in chunks:
        a = int(st * SR); voice[a:a + len(d)] += d[: n - a]
    voice = sfxl.reverb(voice, wet=0.13, tail=0.8)
    first_line = {}
    for i, (si, li, _) in enumerate(FLAT):
        if li == 0: first_line[si] = i
    sc_start = {si: (0.0 if si == 0 else tl[i][0] - 0.45) for si, i in first_line.items()}
    sc_end = {si: (sc_start[si + 1] if si + 1 in sc_start else total) for si in sc_start}
    fx = np.zeros((n, 2))
    P = lambda at, sig, g=1.0, pan=0.0: sfxl.place(fx, at, sig, g, pan)
    for si in range(len(SCENES)):
        a, b = sc_start[si], sc_end[si]
        if si > 0: P(a - 0.1, whoosh(rng), 0.45)
        if si == 0:
            P(a + 0.4, sfxl.wind(max(4, b - a)), 0.5); P(a + 0.9, sfxl.creak(), 0.8, -0.3)
        if si < 7:
            k = a
            while k < b - 0.2:
                P(k, sfxl.clock_tick(int(k) % 2 == 0), 0.55 if si in (0, 1) else 0.35, 0.4)
                k += 1.0
        if si == 6:
            P(a, sfxl.cricket(min(6.0, b - a)), 1.0, 0.2); P(a + 1.0, sfxl.cricket(min(6.0, b - a)), 0.6, -0.4)
        if si == 7:
            for q in range(int((b - a) / 1.3)): P(a + 0.2 + q * 1.3, sfxl.tweet(3 + q % 2, 3000 + 200 * (q % 3)), 0.28, -0.5 + 0.35 * (q % 3))
        if si == 9:
            for q in range(int((b - a) / 1.7)): P(a + 0.3 + q * 1.7, sfxl.tweet(2, 3400), 0.22, 0.5 - 0.5 * (q % 2))
    for i, (si, li, l) in enumerate(FLAT):
        if l["spk"] == "tick": P(tl[i][0] - 0.16, sfxl.chirp(3000, 4600, 0.1), 0.5, 0.3)
    for si, sc in enumerate(SCENES):
        ph = sc.get("phone")
        if not ph: continue
        ps = tl[first_line[si] + ph["frm"]][0]
        P(ps - 0.1, sfxl.phone_in(), 0.9)
        shots = len(ph["shots"]); dur = sc_end[si] - ps
        for q in range(1, shots): P(ps + q * dur / shots, sfxl.msg_pop() if si == 5 else (sfxl.coin() if si == 8 else sfxl.swipe(0.25)), 0.7)
        if ph.get("cue"): P(ps + 0.6, sfxl.click(), 0.9)
    P(tl[first_line[2]][0] + 1.8, sfxl.sparkle(), 0.5)
    P(tl[first_line[7]][0] - 0.05, sfxl.notify(), 0.9)
    P(tl[first_line[7] + 1][0] + 1.5, sfxl.party_pop(), 0.9); P(tl[first_line[7] + 1][0] + 1.6, sfxl.confetti(), 0.7)
    P(tl[first_line[8]][0] + 0.1, sfxl.sparkle(), 0.45)
    P(tl[first_line[9]][0], sfxl.cheer(3.2), 0.95); P(tl[first_line[9]][0] + 0.2, sfxl.clap_burst(18, 2.4), 0.8)
    sad = sfxl.make_sad_bgm(total + 1)[:n].astype(np.float64)
    up = make_bgm(total + 1)[:n].astype(np.float64)
    tt_ = np.arange(n) / SR
    t3 = sc_start[2] - 0.3
    up_g = np.clip((tt_ - t3) / 1.6, 0, 1)
    sad_g = 1 - up_g
    w7 = ((tt_ >= tl[first_line[6]][0] - 0.2) & (tt_ <= tl[first_line[6]][1] + 0.3)).astype(float)
    w7 = smooth(w7, 0.6)
    up_g = up_g * (1 - 0.7 * w7); sad_g = np.clip(sad_g + 0.9 * w7, 0, 1)
    env = smooth(np.clip(np.max(np.abs(voice), axis=1) * 6, 0, 1), 0.2)
    duck = 1 - 0.6 * env
    fade = np.minimum(1, tt_ / 1.5) * np.minimum(1, (total - tt_) / 3.0)
    mix = voice + (up * (0.26 * up_g * duck * fade)[:, None]) + (sad * (0.34 * sad_g * duck * fade)[:, None]) + fx * 0.85
    mix *= 0.92 / np.max(np.abs(mix))
    wav = os.path.join(WORK, "master-m2.wav")
    sf.write(wav, mix, SR, subtype="PCM_16")
    return wav, tl, total, first_line


# ---------- visuals ----------

COMB = set("ัิีึืฺุู็่้๊๋์ํ")
UPPER = set("ัิีึื็ํ")
TONE = set("่้๊๋์")


def th_len(font, text):
    return sum(font.getlength(c) for c in text if c not in COMB)


def th_text(d, xy, text, font, fill):
    x, y = xy
    prev = ""
    size = font.size
    for c in text:
        if c in COMB:
            raise_ = size * 0.26 if (c in TONE and prev in UPPER) else 0
            d.text((x, y - raise_), c, font=font, fill=fill)
        else:
            d.text((x, y), c, font=font, fill=fill)
            x += font.getlength(c)
        prev = c

def layout(text, maxw=1500):
    probe = ImageDraw.Draw(Image.new("RGB", (4, 4)))
    for size in (46, 42, 38, 34):
        f = ImageFont.truetype(FONTB, size)
        lines = []
        for seg in text.split("\n"):
            cur = ""
            for tok in seg.split(" "):
                trial = (cur + " " + tok).strip()
                if cur and th_len(f, trial) > maxw: lines.append(cur); cur = tok
                else: cur = trial
            lines.append(cur)
        if all(th_len(f, x) <= maxw for x in lines): return f, lines, size
    return f, lines, size


def make_sub(l):
    f, lines, size = layout(l["sub"])
    p = ImageDraw.Draw(Image.new("RGB", (4, 4)))
    lh = int(size * 1.4)
    tw = int(max(th_len(f, x) for x in lines))
    chip_w = 130
    bw, bh = tw + chip_w + 90, len(lines) * lh + 34
    im = Image.new("RGBA", (bw + 20, bh + 20), (0, 0, 0, 0))
    sh = Image.new("RGBA", im.size, (0, 0, 0, 0)); ImageDraw.Draw(sh).rounded_rectangle([14, 16, bw + 6, bh + 16], 36, fill=(0, 0, 0, 120))
    im.alpha_composite(sh.filter(ImageFilter.GaussianBlur(8)))
    d = ImageDraw.Draw(im)
    d.rounded_rectangle([10, 10, bw + 10, bh + 10], 36, fill=(8, 23, 46, 225), outline=(197, 160, 89, 255), width=2)
    cf = ImageFont.truetype(FONTB, 34)
    cw = int(p.textlength(NAMES[l["spk"]], font=cf)) + 36
    cy = 10 + (bh - 52) // 2
    d.rounded_rectangle([28, cy, 28 + cw, cy + 52], 26, fill=CHIP[l["spk"]])
    d.text((28 + 18, cy + 4), NAMES[l["spk"]], font=cf, fill=(255, 255, 255))
    for i, x in enumerate(lines):
        th_text(d, (28 + cw + 24, 10 + 17 + i * lh - int(size * 0.08)), x, f, (255, 255, 255))
    return im


PH = 640; PW = int(PH * 0.43)
PSC_W, PSC_H = PW - 20, PH - 20


def phone_sprite(path, cue=None, cue_t=0.0):
    src = Image.open(path).convert("RGB")
    h0 = min(src.height, int(src.width * PSC_H / PSC_W))
    crop = src.crop((0, 0, src.width, h0)).resize((PSC_W, PSC_H), Image.BILINEAR)
    sp = Image.new("RGBA", (PW + 60, PH + 60), (0, 0, 0, 0))
    sh = Image.new("RGBA", sp.size, (0, 0, 0, 0)); ImageDraw.Draw(sh).rounded_rectangle([30, 44, 30 + PW, 44 + PH], 40, fill=(0, 0, 0, 190))
    sp.alpha_composite(sh.filter(ImageFilter.GaussianBlur(18)))
    d = ImageDraw.Draw(sp)
    d.rounded_rectangle([30, 30, 30 + PW, 30 + PH], 40, fill=(10, 12, 18), outline=(197, 160, 89), width=3)
    m = Image.new("L", (PSC_W, PSC_H), 0); ImageDraw.Draw(m).rounded_rectangle([0, 0, PSC_W - 1, PSC_H - 1], 30, fill=255)
    sp.paste(crop, (40, 40), m)
    if cue:
        ring = Image.open(os.path.join(BRAND, "cue-highlight-ring-gold.png")).convert("RGBA")
        sz = int(190 * (0.5 + 0.12 * math.sin(cue_t * 6)) * 1.1)
        sp.alpha_composite(ring.resize((sz, sz)), (int(40 + cue[0] * PSC_W - sz / 2), int(40 + cue[1] * PSC_H - sz / 2)))
    return sp


def ease(x): x = min(1, max(0, x)); return 1 - (1 - x) ** 3


def bg_frame(img, focus, local_t, dur, idx, zoom_in=True):
    p = min(1, max(0, local_t / max(dur, 0.1)))
    z = 1.04 + 0.08 * (p if zoom_in else 1 - p)
    cw, ch = img.width / z, img.height / z
    drift = (p - 0.5) * 0.03 * (1 if idx % 2 == 0 else -1)
    fx = 0.5 + (focus[0] - 0.5) * 0.35 + drift
    fy = 0.5 + (focus[1] - 0.5) * 0.25
    x0 = min(max(fx * img.width - cw / 2, 0), img.width - cw)
    y0 = min(max(fy * img.height - ch / 2, 0), img.height - ch)
    return img.crop((int(x0), int(y0), int(x0 + cw), int(y0 + ch))).resize((W, H), Image.BILINEAR)


def render():
    wav, tl, total, first_line = build_audio()
    nframes = int(total * FPS)
    imgs = [Image.open(os.path.join(MASCOT, sc["img"])).convert("RGB") for sc in SCENES]
    # scene boundaries
    starts = []
    for si in range(len(SCENES)):
        starts.append(0.0 if si == 0 else tl[first_line[si]][0] - 0.45)
    ends = starts[1:] + [total]
    logo = Image.open(os.path.join(BRAND, "logo-tukdaeng.png")).convert("RGBA")
    logo_s = logo.resize((70, 70))
    big_logo = logo.resize((300, 300))
    f_big = ImageFont.truetype(FONTB, 76); f_med = ImageFont.truetype(FONT, 42)
    last_start = tl[-1][0]
    cmd = [FFMPEG, "-y", "-loglevel", "error", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-",
           "-i", wav, "-c:v", "libx264", "-preset", "medium", "-crf", "19", "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "192k", "-shortest", OUT]
    pr = subprocess.Popen(cmd, stdin=subprocess.PIPE)
    vignette = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    vd = ImageDraw.Draw(vignette)
    for y in range(260): vd.line([(0, H - y), (W, H - y)], fill=(0, 0, 0, int(150 * (1 - y / 260) ** 1.6)))
    for f in range(nframes):
        t = f / FPS
        si = max(i for i, s in enumerate(starts) if s <= t)
        sc = SCENES[si]
        loc = t - starts[si]; dur = ends[si] - starts[si]
        im = bg_frame(imgs[si], sc["focus"], loc, dur, si, si % 2 == 0)
        if si > 0 and loc < XFADE:
            pdur = ends[si - 1] - starts[si - 1]
            prev = bg_frame(imgs[si - 1], SCENES[si - 1]["focus"], pdur + loc, pdur, si - 1, (si - 1) % 2 == 0)
            im = Image.blend(prev, im, ease(loc / XFADE))
        im = im.convert("RGBA")
        im.alpha_composite(vignette)
        ph = sc.get("phone")
        if ph:
            pstart = tl[first_line[si] + ph["frm"]][0]
            pdur_ = ends[si] - pstart
            if t >= pstart - 0.1 and t < ends[si] - 0.1:
                lt = t - pstart
                n = len(ph["shots"]); k = min(n - 1, int(lt / (pdur_ / n)))
                cue = ph.get("cue") if k == 0 and lt > 0.6 else None
                spr = phone_sprite(ph["shots"][k], cue, t)
                if k > 0 and lt - k * (pdur_ / n) < 0.3:
                    a = (lt - k * (pdur_ / n)) / 0.3
                    spr = Image.blend(phone_sprite(ph["shots"][k - 1]), spr, a)
                e = ease(lt / 0.5)
                spr = spr.rotate(ph["tilt"] + (1 - e) * 8 + math.sin(t * 1.5) * 0.8, resample=Image.BICUBIC, expand=True)
                if e < 1: spr.putalpha(spr.getchannel("A").point(lambda v: int(v * e)))
                cx = int(ph["pos"][0] * W + (1 - e) * (90 if ph["pos"][0] > 0.5 else -90))
                cy = int(ph["pos"][1] * H + math.sin(t * 1.8) * 5)
                im.alpha_composite(spr, (cx - spr.width // 2, cy - spr.height // 2))
        # logo watermark
        im.alpha_composite(logo_s, (34, 26))
        d = ImageDraw.Draw(im)
        d.text((112, 36), "TukDaeng", font=ImageFont.truetype(FONTB, 36), fill=(255, 255, 255, 235), stroke_width=2, stroke_fill=(0, 0, 0, 160))
        # end overlay
        if t > last_start + 0.8:
            e = ease((t - last_start - 0.8) / 0.8)
            ov = Image.new("RGBA", (W, H), (8, 23, 46, int(190 * e)))
            im.alpha_composite(ov)
            bl = big_logo.copy(); sc_ = 1 + 0.03 * math.sin(t * 3)
            bl = bl.resize((int(300 * sc_), int(300 * sc_)))
            bl.putalpha(bl.getchannel("A").point(lambda v: int(v * e)))
            im.alpha_composite(bl, ((W - bl.width) // 2, 250 - (bl.height - 300) // 2))
            d = ImageDraw.Draw(im)
            for txt, fnt, yy, col in (("TukDaeng · ตึกแดง", f_big, 580, (255, 255, 255)), ("ซื้อ ขาย โชว์ คุย จบในแอปเดียว", f_med, 690, (197, 160, 89)), ("ดาวน์โหลดได้แล้วที่ Google Play และ App Store", f_med, 770, (255, 255, 255))):
                tw = th_len(fnt, txt)
                th_text(d, ((W - tw) / 2, yy), txt, fnt, col + (int(255 * e),))
        pr.stdin.write(im.convert("RGB").tobytes())
    pr.stdin.close(); pr.wait()
    json.dump([{"line": i, "scene": si + 1, "speaker": l["spk"], "text": l["text"], "start": round(a, 2), "end": round(b, 2)} for i, ((si, _, l), (a, b)) in enumerate(zip(FLAT, tl))],
              open(os.path.join(os.path.dirname(OUT), "INTRO-v3-mascot-timeline.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    print("DONE", OUT, f"{total:.1f}s")


if __name__ == "__main__":
    if sys.stdout.encoding != "utf-8":
        try: sys.stdout.reconfigure(encoding="utf-8")
        except Exception: pass
    render()
