"""
Synthesized foley / ambience / mood music for INTRO v3 (pure numpy, 48 kHz).
All generators return mono float arrays; place() adds them to a stereo bed with pan + gain.
"""
import numpy as np

SR = 48000
RNG = np.random.default_rng(11)


def tt(d): return np.arange(int(d * SR)) / SR
def lp(x, k): return np.convolve(x, np.ones(k) / k, mode="same")
def hp(x, k): return x - lp(x, k)


def place(buf, start, sig, gain=1.0, pan=0.0):
    a = int(start * SR)
    if a < 0 or a >= len(buf): return
    sig = sig[: len(buf) - a]
    buf[a:a + len(sig), 0] += sig * gain * (1 - max(0, pan))
    buf[a:a + len(sig), 1] += sig * gain * (1 + min(0, pan))


def clock_tick(high=True):
    t = tt(0.06)
    f = 2600 if high else 1900
    return (np.sin(2 * np.pi * f * t) * np.exp(-t * 140) + 0.4 * hp(RNG.standard_normal(len(t)), 8) * np.exp(-t * 200)) * 0.5


def chirp(f0=2600, f1=4200, d=0.12):
    t = tt(d)
    f = f0 + (f1 - f0) * (t / d)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * t / d) ** 0.6 * 0.5


def tweet(n=3, base=3200):
    out = np.zeros(int(0.5 * SR))
    for i in range(n):
        c = chirp(base + RNG.integers(-300, 400), base + RNG.integers(600, 1500), 0.08 + 0.03 * RNG.random())
        a = int(i * 0.13 * SR); out[a:a + len(c)] += c
    return out


def cricket(d=3.0):
    t = tt(d)
    pulse = (np.sin(2 * np.pi * 22 * t) > 0.3).astype(float)
    return np.sin(2 * np.pi * 4300 * t) * pulse * 0.07 * (0.6 + 0.4 * np.sin(2 * np.pi * 0.7 * t))


def wind(d=4.0):
    n = lp(RNG.standard_normal(int(d * SR)), 220)
    t = tt(d)
    return n * (0.5 + 0.5 * np.sin(2 * np.pi * 0.25 * t)) * 1.2


def creak(d=0.9):
    t = tt(d)
    f = 180 + 60 * np.sin(2 * np.pi * 7 * t) + 90 * t / d
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * t / d) * 0.12 * (0.7 + 0.3 * np.sign(np.sin(2 * np.pi * 31 * t)))


def pop(f=700, d=0.12):
    t = tt(d)
    return np.sin(2 * np.pi * np.cumsum(f * (1 + 1.5 * np.exp(-t * 40))) / SR) * np.exp(-t * 32) * 0.6


def click():
    t = tt(0.05)
    return (hp(RNG.standard_normal(len(t)), 5) * np.exp(-t * 160) * 0.5 + np.sin(2 * np.pi * 1800 * t) * np.exp(-t * 120) * 0.3)


def swipe(d=0.35):
    t = tt(d)
    n = lp(RNG.standard_normal(len(t)), 10 + int(40 * (1 - t / d).mean()))
    return n * np.sin(np.pi * t / d) ** 2 * 1.4 + np.sin(2 * np.pi * np.cumsum(300 + 1200 * (t / d) ** 2) / SR) * 0.08 * np.sin(np.pi * t / d)


def phone_in():
    a = swipe(0.3) * 0.6
    b = np.pad(pop(900, 0.1) * 0.7, (int(0.22 * SR), 0))
    out = np.zeros(max(len(a), len(b))); out[:len(a)] += a; out[:len(b)] += b
    return out


def msg_pop():
    return np.concatenate([pop(520, 0.1), np.zeros(int(0.07 * SR)), pop(780, 0.12)])


def bell(f=1318, d=1.2, gain=0.5):
    t = tt(d)
    w = sum(np.sin(2 * np.pi * f * k * t) * a for k, a in ((1, 1.0), (2.01, 0.5), (3.02, 0.25), (4.2, 0.12)))
    return w * np.exp(-t * 4.2) * np.minimum(1, t * 800) * gain


def notify():
    return np.concatenate([bell(1568, 0.5, 0.5), bell(2093, 1.0, 0.5)])


def sparkle(d=0.9):
    out = np.zeros(int(d * SR))
    for i in range(9):
        b = bell(2400 + 400 * RNG.integers(0, 6), 0.25, 0.22)
        a = int(i * 0.08 * SR); out[a:a + len(b)] += b[: len(out) - a]
    return out


def coin():
    return np.concatenate([bell(1976, 0.12, 0.35), bell(2637, 0.7, 0.45)])


def confetti(d=0.9):
    t = tt(d)
    n = hp(RNG.standard_normal(len(t)), 6)
    bursts = np.exp(-t * 6) * (0.6 + 0.4 * RNG.random(len(t)))
    return n * bursts * 0.45 + pop(160, 0.25).repeat(1)[: 1].sum() * 0


def party_pop():
    t = tt(0.25)
    return (np.sin(2 * np.pi * np.cumsum(220 * np.exp(-t * 14)) / SR) * np.exp(-t * 18) * 0.9 + hp(RNG.standard_normal(len(t)), 5) * np.exp(-t * 30) * 0.7)


def gasp():
    t = tt(0.35)
    return lp(RNG.standard_normal(len(t)), 6) * np.sin(np.pi * np.minimum(1, t / 0.35)) ** 2 * 0.25


def cheer(d=3.0):
    t = tt(d)
    out = np.zeros(len(t))
    for _ in range(26):
        f0 = RNG.uniform(220, 520)
        st = RNG.uniform(0, d * 0.6)
        dur = RNG.uniform(0.5, 1.4)
        m = (t > st) & (t < st + dur)
        tm = t[m] - st
        v = (np.sin(2 * np.pi * np.cumsum(f0 * (1 + 0.15 * np.sin(2 * np.pi * 6 * tm))) / SR)
             + 0.5 * np.sin(2 * np.pi * np.cumsum(2.4 * f0 * (1 + 0.1 * np.sin(2 * np.pi * 5 * tm))) / SR)) * np.sin(np.pi * tm / dur)
        out[m] += v * 0.05
    out += lp(RNG.standard_normal(len(t)), 5) * 0.06 * np.sin(np.pi * np.minimum(1, t / d)) ** 0.5
    return out * np.minimum(1, t / 0.4) * np.minimum(1, (d - t) / 1.0)


def clap_burst(n=14, d=2.0):
    out = np.zeros(int(d * SR))
    for i in range(n):
        c = hp(RNG.standard_normal(int(0.05 * SR)), 5) * np.exp(-tt(0.05) * 120) * 0.35
        a = int(RNG.uniform(0, d - 0.1) * SR); out[a:a + len(c)] += c
    return out


def reverb(x, wet=0.15, tail=0.7):
    t = tt(tail)
    ir = RNG.standard_normal((len(t), 2)) * np.exp(-t * (6.0 / tail))[:, None]
    ir[0] = 1.0
    n = len(x) + len(ir)
    nf = 1 << (n - 1).bit_length()
    out = np.zeros((len(x), 2))
    for c in range(2):
        y = np.fft.irfft(np.fft.rfft(x[:, c] if x.ndim == 2 else x, nf) * np.fft.rfft(ir[:, c], nf), nf)[: len(x)]
        out[:, c] = y
    out /= max(1e-6, np.max(np.abs(out))) / max(1e-6, np.max(np.abs(x)))
    return x * (1 - wet) + out * wet


# ---------- sad / warm piano-pad mood music ----------
def piano(m, d=1.6, v=0.5):
    f = 440 * 2 ** ((m - 69) / 12)
    t = tt(d)
    w = np.sin(2 * np.pi * f * t) + 0.4 * np.sin(4 * np.pi * f * t) * np.exp(-t * 3) + 0.15 * np.sin(6 * np.pi * f * t) * np.exp(-t * 5)
    return w * np.exp(-t * 2.2) * np.minimum(1, t * 300) * v


def pad(ms, d):
    t = tt(d)
    out = np.zeros(len(t))
    for m in ms:
        f = 440 * 2 ** ((m - 69) / 12)
        out += np.sin(2 * np.pi * f * t) + 0.5 * np.sin(2 * np.pi * f * 1.004 * t)
    return out * np.minimum(1, t / 0.8) * np.minimum(1, (d - t) / 0.8) * 0.06


def make_sad_bgm(seconds):
    bpm = 66.0; beat = 60 / bpm
    prog = [([57, 60, 64], 45), ([53, 57, 60], 41), ([48, 52, 55], 36), ([55, 59, 62], 43)]
    n = int(seconds * SR)
    buf = np.zeros((n, 2))
    for bar in range(int(seconds / (beat * 4)) + 2):
        tri, root = prog[bar % 4]
        t0 = bar * beat * 4
        place(buf, t0, pad([m - 12 for m in tri], beat * 4), 1.0)
        place(buf, t0, piano(root, 3.0, 0.45), 1.0, -0.2)
        for k in range(8):
            place(buf, t0 + k * beat / 2, piano(tri[k % 3] + 12 + (12 if k == 6 else 0), 1.4, 0.32 if k % 2 == 0 else 0.22), 1.0, 0.25)
    return (buf / max(1e-6, np.max(np.abs(buf))) * 0.5).astype(np.float32)
