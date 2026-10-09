"""
Upbeat pop BGM (116 BPM, I-V-vi-IV) for INTRO v2: bouncy bass, plucked chord stabs,
marimba-like arpeggios, kick/clap/hat. Pure numpy. make_bgm(seconds) -> float32 stereo @48k.
"""
import numpy as np

SR = 48000
BPM = 116.0
BEAT = 60.0 / BPM
CHORDS = [(48, [60, 64, 67]), (43, [59, 62, 67]), (45, [57, 60, 64]), (41, [57, 60, 65])]
PENTA = [72, 74, 76, 79, 81, 84, 79, 76]


def hz(m): return 440.0 * 2 ** ((m - 69) / 12)


def add(buf, start, sig, gain=1.0, pan=0.0):
    a = int(start * SR)
    if a >= len(buf): return
    sig = sig[: len(buf) - a]
    buf[a:a + len(sig), 0] += sig * gain * (1 - max(0, pan))
    buf[a:a + len(sig), 1] += sig * gain * (1 + min(0, pan))


def kick():
    t = np.arange(int(0.28 * SR)) / SR
    f = 45 + 95 * np.exp(-t * 28)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 11)


def clap(rng):
    t = np.arange(int(0.16 * SR)) / SR
    n = rng.standard_normal(len(t))
    n = n - np.convolve(n, np.ones(6) / 6, mode="same")
    return n * np.exp(-t * 26) * 0.7


def hat(rng, open_=False):
    t = np.arange(int((0.12 if open_ else 0.035) * SR)) / SR
    n = rng.standard_normal(len(t))
    n = n - np.convolve(n, np.ones(4) / 4, mode="same")
    return n * np.exp(-t * (30 if open_ else 110)) * 0.35


def bass(m, dur):
    t = np.arange(int(dur * SR)) / SR
    f = hz(m)
    w = np.sin(2 * np.pi * f * t) + 0.35 * np.sin(2 * np.pi * 2 * f * t) + 0.12 * np.sin(2 * np.pi * 3 * f * t)
    return w * np.exp(-t * 7) * np.minimum(1, t * 400)


def pluck(m, dur=0.35):
    t = np.arange(int(dur * SR)) / SR
    f = hz(m)
    w = sum(np.sin(2 * np.pi * f * k * t) / k for k in range(1, 7))
    return w * np.exp(-t * 11) * np.minimum(1, t * 600) * 0.28


def marimba(m, dur=0.45):
    t = np.arange(int(dur * SR)) / SR
    f = hz(m)
    w = np.sin(2 * np.pi * f * t) + 0.5 * np.sin(2 * np.pi * 4 * f * t) * np.exp(-t * 30)
    return w * np.exp(-t * 9) * np.minimum(1, t * 800) * 0.5


def make_bgm(seconds):
    rng = np.random.default_rng(7)
    n = int(seconds * SR)
    buf = np.zeros((n, 2))
    bars = int(seconds / (BEAT * 4)) + 2
    for bar in range(bars):
        root, tri = CHORDS[bar % 4]
        t0 = bar * BEAT * 4
        lift = 1.0 if bar >= 2 else 0.55
        for b in range(4):
            tb = t0 + b * BEAT
            if b in (0, 2) or (b == 3 and bar % 2 == 1):
                add(buf, tb, kick(), 0.9 * lift)
            if b in (1, 3):
                add(buf, tb, clap(rng), 0.8 * lift)
        for e in range(8):
            te = t0 + e * BEAT / 2
            add(buf, te, hat(rng, e % 4 == 3), 0.55 * lift, pan=0.25)
            m = root if e % 4 != 3 else root + 12
            if e % 2 == 0 or e == 5:
                add(buf, te, bass(m, 0.3), 0.55 * lift)
        for e in (0, 3, 6):
            te = t0 + e * BEAT / 2 + BEAT / 2 * (0 if e == 0 else 0)
            for k, m in enumerate(tri):
                add(buf, te, pluck(m), 0.5 * lift, pan=-0.3 + 0.3 * k)
        if bar >= 2:
            for s in range(16):
                if s in (0, 3, 6, 8, 10, 13):
                    m = PENTA[(s + bar * 3) % len(PENTA)]
                    if (bar % 4) == 2: m -= 2 if m > 76 else 0
                    add(buf, t0 + s * BEAT / 4, marimba(m), 0.42, pan=0.35)
    peak = np.max(np.abs(buf))
    return (buf / peak * 0.6).astype(np.float32)
