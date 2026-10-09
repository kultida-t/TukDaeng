"""
Generate a warm, relaxed Lo-Fi / Chill Ambient BGM track for the TukDaeng Intro video.
Specifications:
- Duration: 180.0 seconds
- Sample Rate: 48,000 Hz, Stereo 16-bit
- Tone: Relaxed, friendly, warm, non-intrusive
- Levels: -20 dBFS throughout narration, rising to -14 dBFS in the final 3 seconds.
"""

import numpy as np
import soundfile as sf
import os

SAMPLE_RATE = 48000
DURATION = 180.0
TOTAL_SAMPLES = int(SAMPLE_RATE * DURATION)
BPM = 72.0
BEAT_DUR = 60.0 / BPM
BAR_DUR = BEAT_DUR * 4.0

def note_freq(midi_note):
    return 440.0 * (2.0 ** ((midi_note - 69) / 12.0))

def synth_electric_piano(freq, dur, velocity=0.8):
    t = np.linspace(0, dur, int(SAMPLE_RATE * dur), endpoint=False)
    # Fundamental and gentle harmonic overtone series for Fender Rhodes sound
    # Rhodes has strong 1st, slightly warm 2nd & 3rd, soft bell tone at 7th
    env = np.exp(-t * 2.2) * (1.0 - np.exp(-t * 60.0))
    bell_env = np.exp(-t * 8.0) * (1.0 - np.exp(-t * 120.0))
    
    wave = (
        0.65 * np.sin(2 * np.pi * freq * t) +
        0.25 * np.sin(2 * np.pi * freq * 2.0 * t) +
        0.12 * np.sin(2 * np.pi * freq * 3.0 * t) +
        0.06 * np.sin(2 * np.pi * freq * 4.0 * t) +
        0.08 * np.sin(2 * np.pi * freq * 7.0 * t) * bell_env
    )
    return (wave * env * velocity).astype(np.float32)

def synth_warm_pad(chord_freqs, dur):
    t = np.linspace(0, dur, int(SAMPLE_RATE * dur), endpoint=False)
    # Slow attack, smooth decay
    attack_samples = int(SAMPLE_RATE * 0.8)
    release_samples = int(SAMPLE_RATE * 0.8)
    env = np.ones_like(t)
    if len(env) > attack_samples + release_samples:
        env[:attack_samples] = np.linspace(0, 1, attack_samples)
        env[-release_samples:] = np.linspace(1, 0, release_samples)
    else:
        env = np.sin(np.pi * t / dur)
    
    pad = np.zeros_like(t)
    for i, f in enumerate(chord_freqs):
        # Detuned oscillators for stereo richness
        detune = 1.0 + (i % 3 - 1) * 0.003
        pad += (
            0.5 * np.sin(2 * np.pi * f * detune * t) +
            0.3 * np.sin(2 * np.pi * f * 2.0 * t)
        )
    return (pad / max(1, len(chord_freqs)) * env * 0.35).astype(np.float32)

def generate_intro_bgm(output_path):
    print("Synthesizing 180s Lo-Fi BGM track at 48kHz Stereo...")
    left_channel = np.zeros(TOTAL_SAMPLES, dtype=np.float32)
    right_channel = np.zeros(TOTAL_SAMPLES, dtype=np.float32)

    # Chord progression: 8 bars cycle (each bar = 3.333s)
    # Key: C Major / A Minor (Warm, uplifting, modern)
    # Bar 1: Cmaj7 (C3, G3, B3, E4)
    # Bar 2: Am7   (A2, E3, G3, C4)
    # Bar 3: Dm7   (D3, A3, C4, F4)
    # Bar 4: G7sus4->G7 (G2, D3, F3, C4 -> B3)
    # Bar 5: Em7   (E3, B3, D4, G4)
    # Bar 6: Am9   (A2, E3, G3, B3, C4)
    # Bar 7: Fmaj7 (F2, C3, E3, A3, C4)
    # Bar 8: G11   (G2, D3, F3, A3, C4)
    chords_midi = [
        [48, 55, 59, 64],       # Cmaj7
        [45, 52, 55, 60],       # Am7
        [50, 57, 60, 65],       # Dm7
        [43, 50, 53, 59],       # G7
        [52, 59, 62, 67],       # Em7
        [45, 52, 55, 59, 60],   # Am9
        [41, 48, 52, 57, 60],   # Fmaj7
        [43, 50, 53, 57, 60]    # G11
    ]

    total_bars = int(np.ceil(DURATION / BAR_DUR))
    
    for bar_idx in range(total_bars):
        bar_start_sec = bar_idx * BAR_DUR
        if bar_start_sec >= DURATION:
            break
        
        chord_idx = bar_idx % len(chords_midi)
        chord_notes = chords_midi[chord_idx]
        chord_freqs = [note_freq(n) for n in chord_notes]
        
        # 1. Warm Pad layer
        pad_dur = min(BAR_DUR * 1.05, DURATION - bar_start_sec)
        pad_wave = synth_warm_pad(chord_freqs, pad_dur)
        start_samp = int(bar_start_sec * SAMPLE_RATE)
        end_samp = start_samp + len(pad_wave)
        if end_samp > TOTAL_SAMPLES:
            pad_wave = pad_wave[:TOTAL_SAMPLES - start_samp]
            end_samp = TOTAL_SAMPLES
            
        left_channel[start_samp:end_samp] += pad_wave * 0.7
        right_channel[start_samp:end_samp] += pad_wave * 0.75
        
        # 2. Electric Piano arpeggio / rhythm
        # Strum / play chord on beat 1, syncopated note on beat 2.5, chord on beat 3.5
        hit_offsets = [0.0, BEAT_DUR * 1.5, BEAT_DUR * 2.5]
        for hit_idx, hit_off in enumerate(hit_offsets):
            hit_time = bar_start_sec + hit_off
            if hit_time >= DURATION:
                break
            hit_samp = int(hit_time * SAMPLE_RATE)
            note_dur = min(BEAT_DUR * 2.2, DURATION - hit_time)
            
            for ni, n in enumerate(chord_notes):
                # Strum delay between chord notes (15ms)
                strum_delay = ni * 0.018
                note_start = hit_samp + int(strum_delay * SAMPLE_RATE)
                if note_start >= TOTAL_SAMPLES:
                    continue
                
                wave = synth_electric_piano(note_freq(n), note_dur, velocity=0.7 - ni*0.05)
                note_end = note_start + len(wave)
                if note_end > TOTAL_SAMPLES:
                    wave = wave[:TOTAL_SAMPLES - note_start]
                    note_end = TOTAL_SAMPLES
                    
                # Stereo pan: lower notes slightly left, higher notes slightly right
                pan = 0.35 + (ni / max(1, len(chord_notes) - 1)) * 0.3
                left_channel[note_start:note_end] += wave * (1.0 - pan)
                right_channel[note_start:note_end] += wave * pan

    # 3. Soft lo-fi vinyl warmth & texture
    np.random.seed(42)
    noise = np.random.normal(0, 0.005, TOTAL_SAMPLES).astype(np.float32)
    # Simple lowpass on noise
    left_channel += noise * 0.3
    right_channel += noise * 0.3

    # Normalize to -20 dBFS standard for background music
    # RMS target for -20 dBFS is 10^(-20/20) = 0.10
    rms_l = np.sqrt(np.mean(left_channel ** 2))
    rms_r = np.sqrt(np.mean(right_channel ** 2))
    current_rms = (rms_l + rms_r) / 2.0
    target_rms = 10.0 ** (-20.0 / 20.0) # 0.10
    
    gain = target_rms / max(current_rms, 1e-6)
    left_channel *= gain
    right_channel *= gain
    
    # 4. Fade In at start (1.5s)
    fade_in_samples = int(SAMPLE_RATE * 1.5)
    fade_in_curve = np.linspace(0.0, 1.0, fade_in_samples)
    left_channel[:fade_in_samples] *= fade_in_curve
    right_channel[:fade_in_samples] *= fade_in_curve
    
    # 5. Volume swell in final 3 seconds to -14 dBFS (seconds 177 - 180)
    # -14 dBFS target is 10^(-14/20) = 0.1995 (gain increase factor ~ 2.0)
    final_start_samp = int(177.0 * SAMPLE_RATE)
    final_samples = TOTAL_SAMPLES - final_start_samp
    if final_samples > 0:
        swell_curve = np.linspace(1.0, 1.95, final_samples)
        # Fade out very gently at the last 0.5s to avoid hard clip
        last_fade_samples = int(SAMPLE_RATE * 0.5)
        swell_curve[-last_fade_samples:] *= np.linspace(1.0, 0.0, last_fade_samples)
        left_channel[final_start_samp:] *= swell_curve
        right_channel[final_start_samp:] *= swell_curve

    # Clip protection
    max_peak = max(np.max(np.abs(left_channel)), np.max(np.abs(right_channel)))
    if max_peak > 0.95:
        left_channel = left_channel / max_peak * 0.95
        right_channel = right_channel / max_peak * 0.95

    stereo_audio = np.column_stack([left_channel, right_channel])
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    sf.write(output_path, stereo_audio, SAMPLE_RATE, subtype='PCM_16')
    print(f"Generated BGM successfully: {output_path} (Duration: {DURATION}s, Peak: {max_peak:.2f})")

if __name__ == "__main__":
    generate_intro_bgm("assets/video-guides/intro/bgm/intro-bgm.wav")
