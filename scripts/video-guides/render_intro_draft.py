"""
Video Composer Script for TukDaeng Intro Video Draft
Mission: fa6c030e | Task: VGD-005

Features:
- Video Resolution: 1080x1920 (9:16 Vertical) @ 30fps
- Total Duration: 180.0 seconds (5,400 frames, Scenes S01-S20)
- Master Audio: Voiceover (intro-voice.wav) + BGM (intro-bgm.wav at -20dBFS)
- Motion: Smooth Ken Burns pan/zoom, scene transitions, and interactive cues
- Clean UI: No burn-in subtitles (full unblocked app visibility requested by user)
- Portfolio Drilldown: S15 features profile tap on asset value box -> drilldown to portfolio asset value dashboard & chart
- Codec: H.264 (libx264) / AAC 48kHz Stereo
- Output: dist/video-guides/intro-draft.mp4
"""

import os
import sys
import subprocess
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
import soundfile as sf

# Paths
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
ASSETS_DIR = os.path.join(BASE_DIR, "assets", "video-guides", "intro")
SHOTS_DIR = os.path.join(ASSETS_DIR, "shots")
BRAND_DIR = os.path.join(ASSETS_DIR, "brand")
DIST_DIR = os.path.join(BASE_DIR, "dist", "video-guides")
OUTPUT_MP4 = os.path.join(DIST_DIR, "intro-draft.mp4")
OUTPUT_AUDIO = os.path.join(DIST_DIR, "intro-master-audio.wav")

VOICE_PATH = os.path.join(ASSETS_DIR, "intro-voice.wav")
BGM_PATH = os.path.join(ASSETS_DIR, "bgm", "intro-bgm.wav")

FFMPEG_EXE = r"C:\Users\Admin\AppData\Roaming\Python\Python313\site-packages\imageio_ffmpeg\binaries\ffmpeg-win-x86_64-v7.1.exe"

# Canvas specs
WIDTH = 1080
HEIGHT = 1920
FPS = 30
TOTAL_DURATION = 180.0
TOTAL_FRAMES = int(FPS * TOTAL_DURATION) # 5400 frames

# Phone Frame specs
PHONE_W = 844
PHONE_H = 1710
PHONE_X = (WIDTH - PHONE_W) // 2 # 118
PHONE_Y = 60
PHONE_R = 40

SCREEN_PAD = 8
SCREEN_W = PHONE_W - SCREEN_PAD * 2 # 828
SCREEN_H = PHONE_H - SCREEN_PAD * 2 # 1694
SCREEN_X = PHONE_X + SCREEN_PAD     # 126
SCREEN_Y = PHONE_Y + SCREEN_PAD     # 68
SCREEN_R = 34

def mix_master_audio():
    print("Mixing master audio track (Voiceover + BGM)...")
    voice, sr_v = sf.read(VOICE_PATH)
    bgm, sr_b = sf.read(BGM_PATH)
    
    assert sr_v == 48000 and sr_b == 48000, "Sample rates must be 48000 Hz"
    
    # Ensure same length
    min_len = min(len(voice), len(bgm))
    voice = voice[:min_len]
    bgm = bgm[:min_len]
    
    # Voice is primary, BGM sits softly under voice (-20dBFS)
    mixed = voice * 0.95 + bgm * 0.85
    
    # Peak normalization to -0.8 dBFS (factor ~0.912)
    peak = np.max(np.abs(mixed))
    if peak > 0:
        target_peak = 10.0 ** (-0.8 / 20.0) # ~0.912
        mixed = mixed * (target_peak / peak)
    
    os.makedirs(os.path.dirname(OUTPUT_AUDIO), exist_ok=True)
    sf.write(OUTPUT_AUDIO, mixed, 48000, subtype="PCM_16")
    print(f"Master audio saved: {OUTPUT_AUDIO} (Duration: {len(mixed)/48000:.2f}s, Peak: {np.max(np.abs(mixed)):.3f})")

def create_base_canvas():
    """Create a luxury navy gradient canvas with subtle gold accents and ambient glow."""
    canvas = Image.new("RGBA", (WIDTH, HEIGHT), (8, 23, 46, 255))
    draw = ImageDraw.Draw(canvas)
    
    # Vertical gradient from Deep Navy #0c203b to Rich Midnight #030812
    for y in range(HEIGHT):
        ratio = y / HEIGHT
        r = int(12 * (1 - ratio) + 3 * ratio)
        g = int(32 * (1 - ratio) + 8 * ratio)
        b = int(59 * (1 - ratio) + 18 * ratio)
        draw.line([(0, y), (WIDTH, y)], fill=(r, g, b, 255))
    
    # Ambient radial glow top center
    glow = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
    g_draw = ImageDraw.Draw(glow)
    g_draw.ellipse([WIDTH//2 - 420, -200, WIDTH//2 + 420, 640], fill=(26, 58, 105, 75))
    glow = glow.filter(ImageFilter.GaussianBlur(130))
    canvas.alpha_composite(glow)
    
    # Subtle elegant clockwork circle watermark at background
    watermark = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
    w_draw = ImageDraw.Draw(watermark)
    w_draw.ellipse([WIDTH//2 - 520, HEIGHT//2 - 520, WIDTH//2 + 520, HEIGHT//2 + 520], outline=(197, 160, 89, 16), width=3)
    w_draw.ellipse([WIDTH//2 - 460, HEIGHT//2 - 460, WIDTH//2 + 460, HEIGHT//2 + 460], outline=(197, 160, 89, 10), width=1)
    w_draw.ellipse([WIDTH//2 - 380, HEIGHT//2 - 380, WIDTH//2 + 380, HEIGHT//2 + 380], outline=(197, 160, 89, 8), width=1)
    canvas.alpha_composite(watermark)
    
    # Drop shadow for phone frame baked into base canvas
    shadow = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
    s_draw = ImageDraw.Draw(shadow)
    s_draw.rounded_rectangle(
        [PHONE_X - 12, PHONE_Y + 12, PHONE_X + PHONE_W + 12, PHONE_Y + PHONE_H + 26],
        radius=PHONE_R + 8,
        fill=(0, 0, 0, 180)
    )
    shadow = shadow.filter(ImageFilter.GaussianBlur(36))
    canvas.alpha_composite(shadow)
    
    return canvas

def create_phone_frame_overlay():
    """Create phone frame rim and bezels that overlay ON TOP of the screen (transparent center)."""
    overlay = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    
    # 1. Outer phone bezel rim (Dark obsidian)
    draw.rounded_rectangle(
        [PHONE_X, PHONE_Y, PHONE_X + PHONE_W, PHONE_Y + PHONE_H],
        radius=PHONE_R,
        outline=(197, 160, 89, 230), # Gold rim
        width=2
    )
    
    # 2. Sleek dark border between outer frame and screen
    for i in range(1, SCREEN_PAD):
        draw.rounded_rectangle(
            [PHONE_X + i, PHONE_Y + i, PHONE_X + PHONE_W - i, PHONE_Y + PHONE_H - i],
            radius=PHONE_R - i,
            outline=(15, 18, 24, 255),
            width=1
        )
        
    # 3. Inner screen edge accent (subtle dark line)
    draw.rounded_rectangle(
        [SCREEN_X - 1, SCREEN_Y - 1, SCREEN_X + SCREEN_W + 1, SCREEN_Y + SCREEN_H + 1],
        radius=SCREEN_R,
        outline=(5, 8, 14, 220),
        width=2
    )
    
    return overlay

def create_screen_mask():
    """Create rounded mask for the display screen."""
    mask = Image.new("L", (SCREEN_W, SCREEN_H), 0)
    draw = ImageDraw.Draw(mask)
    draw.rounded_rectangle([0, 0, SCREEN_W, SCREEN_H], radius=SCREEN_R, fill=255)
    return mask

class IntroVideoComposer:
    def __init__(self):
        print("Initializing assets and visual models (Clean UI mode - No subtitles)...")
        self.base_canvas = create_base_canvas()
        self.phone_frame_overlay = create_phone_frame_overlay()
        self.screen_mask = create_screen_mask()
        
        # Load Brand Overlay assets
        self.overlays = {
            "endcard": Image.open(os.path.join(BRAND_DIR, "endcard-9x16.png")).convert("RGB"),
            "badge_sale": Image.open(os.path.join(BRAND_DIR, "badge-sale.png")).convert("RGBA"),
            "badge_show": Image.open(os.path.join(BRAND_DIR, "badge-show.png")).convert("RGBA"),
            "ring_red": Image.open(os.path.join(BRAND_DIR, "cue-highlight-ring-red.png")).convert("RGBA"),
            "ring_gold": Image.open(os.path.join(BRAND_DIR, "cue-highlight-ring-gold.png")).convert("RGBA"),
            "tag_val1": Image.open(os.path.join(BRAND_DIR, "tag-value-1-allinone.png")).convert("RGBA"),
            "tag_val2": Image.open(os.path.join(BRAND_DIR, "tag-value-2-secure.png")).convert("RGBA"),
            "tag_val3": Image.open(os.path.join(BRAND_DIR, "tag-value-3-growth.png")).convert("RGBA")
        }
        
        # Load shots into cache
        print("Preloading shot assets...")
        self.shots = {}
        for fname in os.listdir(SHOTS_DIR):
            if fname.endswith(".png"):
                key = os.path.splitext(fname)[0]
                img_path = os.path.join(SHOTS_DIR, fname)
                self.shots[key] = Image.open(img_path).convert("RGB")
        print(f"Loaded {len(self.shots)} shot assets.")

    def render_content_to_screen(self, img, y_offset_ratio=0.0, zoom=1.0):
        """Fit 1080x2400 screenshot into SCREEN_W x SCREEN_H with pan and zoom."""
        base_w = SCREEN_W
        base_h = int(img.height * (SCREEN_W / img.width)) # ~1840 px
        
        w = int(base_w * zoom)
        h = int(base_h * zoom)
        
        resized = img.resize((w, h), Image.Resampling.BILINEAR)
        
        # Max pan scroll range
        max_scroll_y = max(0, h - SCREEN_H)
        max_scroll_x = max(0, w - SCREEN_W)
        
        crop_y = int(max_scroll_y * y_offset_ratio)
        crop_x = int(max_scroll_x * 0.5)
        
        cropped = resized.crop((crop_x, crop_y, crop_x + SCREEN_W, crop_y + SCREEN_H))
        return cropped

    def generate_frame(self, frame_idx):
        t = frame_idx / FPS # Current timestamp in seconds
        
        # S20 Endcard special case (Full 1080x1920 canvas)
        if t >= 173.0:
            scene_progress = (t - 173.0) / 7.0
            zoom = 1.0 + scene_progress * 0.035
            endcard_img = self.overlays["endcard"]
            w = int(WIDTH * zoom)
            h = int(HEIGHT * zoom)
            scaled = endcard_img.resize((w, h), Image.Resampling.BILINEAR)
            x_off = (w - WIDTH) // 2
            y_off = (h - HEIGHT) // 2
            frame = scaled.crop((x_off, y_off, x_off + WIDTH, y_off + HEIGHT)).copy()
            return frame

        # Standard scene frame creation
        frame = self.base_canvas.copy()
        screen_img = None
        overlay_elements = [] # list of (img, x, y)
        
        # --- SCENE DETERMINATION ---
        if 0.0 <= t < 8.0:
            # S01: Pan down on feed
            p = t / 8.0
            screen_img = self.render_content_to_screen(self.shots["s01_hook_feed"], y_offset_ratio=p * 0.75)
            
        elif 8.0 <= t < 16.0:
            # S02: Slow zoom in on TukDaeng splash logo
            p = (t - 8.0) / 8.0
            zoom = 1.0 + p * 0.06
            screen_img = self.render_content_to_screen(self.shots["s02_what_splash"], y_offset_ratio=0.15, zoom=zoom)
            
        elif 16.0 <= t < 25.0:
            # S03: S03a Feed -> Transition -> S03b Detail
            if t < 20.2:
                p = (t - 16.0) / 4.2
                screen_img = self.render_content_to_screen(self.shots["s03a_what_feed"], y_offset_ratio=p * 0.3)
            elif t < 20.7: # 0.5s crossfade
                alpha = (t - 20.2) / 0.5
                img_a = self.render_content_to_screen(self.shots["s03a_what_feed"], y_offset_ratio=0.3)
                img_b = self.render_content_to_screen(self.shots["s03b_what_detail"], y_offset_ratio=0.0)
                screen_img = Image.blend(img_a, img_b, alpha)
            else:
                p = (t - 20.7) / 4.3
                screen_img = self.render_content_to_screen(self.shots["s03b_what_detail"], y_offset_ratio=p * 0.25)
                
        elif 25.0 <= t < 34.0:
            # S04: Public profile pan down
            p = (t - 25.0) / 9.0
            screen_img = self.render_content_to_screen(self.shots["s04_who_profile"], y_offset_ratio=p * 0.6)
            
        elif 34.0 <= t < 45.0:
            # S05: S05a Entry with pulsing red ring on Guest button -> S05b Guest Feed
            if t < 39.5:
                screen_img = self.render_content_to_screen(self.shots["s05a_guest_entry"], y_offset_ratio=1.0)
                # Pulsing ring cue at explore button (center x=540, center y=1660 on canvas)
                pulse = 1.0 + 0.12 * np.sin((t - 34.0) * 8.0)
                rw = int(170 * pulse)
                rh = int(170 * pulse)
                ring = self.overlays["ring_red"].resize((rw, rh), Image.Resampling.BILINEAR)
                overlay_elements.append((ring, (WIDTH - rw)//2, 1660 - rh//2))
            else:
                p = (t - 39.5) / 5.5
                screen_img = self.render_content_to_screen(self.shots["s05b_guest_feed"], y_offset_ratio=p * 0.4)
                
        elif 45.0 <= t < 54.0:
            # S06: Bottom nav spotlight -> Feed
            if t < 49.5:
                # Zoom in slightly on bottom nav area
                screen_img = self.render_content_to_screen(self.shots["s06a_tour_bottomnav"], y_offset_ratio=1.0, zoom=1.02)
            else:
                p = (t - 49.5) / 4.5
                screen_img = self.render_content_to_screen(self.shots["s06b_tour_feed"], y_offset_ratio=p * 0.35)
                
        elif 54.0 <= t < 65.0:
            # S07: S07a Feed card (SALE) -> S07b Detail (SHOW) with badge overlays
            if t < 59.5:
                screen_img = self.render_content_to_screen(self.shots["s07a_tour_feedcard"], y_offset_ratio=0.18)
                # Badge SALE floating cue
                b_sale = self.overlays["badge_sale"].resize((300, 120), Image.Resampling.BILINEAR)
                overlay_elements.append((b_sale, SCREEN_X + 40, SCREEN_Y + 700))
            else:
                screen_img = self.render_content_to_screen(self.shots["s07b_tour_detailshow"], y_offset_ratio=0.1)
                # Badge SHOW floating cue
                b_show = self.overlays["badge_show"].resize((300, 120), Image.Resampling.BILINEAR)
                overlay_elements.append((b_show, SCREEN_X + 40, SCREEN_Y + 700))
                
        elif 65.0 <= t < 74.0:
            # S08: Tour Search result
            p = (t - 65.0) / 9.0
            zoom = 1.0 + p * 0.05
            screen_img = self.render_content_to_screen(self.shots["s08_tour_search"], y_offset_ratio=0.05, zoom=zoom)
            
        elif 74.0 <= t < 82.0:
            # S09: Tour Filter sheet
            p = (t - 74.0) / 8.0
            screen_img = self.render_content_to_screen(self.shots["s09_tour_filter"], y_offset_ratio=p * 0.5)
            
        elif 82.0 <= t < 91.0:
            # S10: Watch Alert list
            p = (t - 82.0) / 9.0
            screen_img = self.render_content_to_screen(self.shots["s10_tour_watchalert_list"], y_offset_ratio=p * 0.3)
            
        elif 91.0 <= t < 99.0:
            # S11: Watch Alert notification popup
            p = (t - 91.0) / 8.0
            zoom = 1.0 + p * 0.04
            screen_img = self.render_content_to_screen(self.shots["s11_tour_watchalert_noti"], y_offset_ratio=0.1, zoom=zoom)
            # Gold ring cue around notification
            pulse = 1.0 + 0.08 * np.sin(p * 12.0)
            gw = int(140 * pulse)
            gh = int(140 * pulse)
            g_ring = self.overlays["ring_gold"].resize((gw, gh), Image.Resampling.BILINEAR)
            overlay_elements.append((g_ring, SCREEN_X + 60, SCREEN_Y + 220))
            
        elif 99.0 <= t < 108.0:
            # S12: Make Offer sheet
            p = (t - 99.0) / 9.0
            zoom = 1.0 + p * 0.04
            screen_img = self.render_content_to_screen(self.shots["s12_tour_make_offer"], y_offset_ratio=0.45, zoom=zoom)
            
        elif 108.0 <= t < 117.0:
            # S13: Chatroom (108-111) -> Pending Offer (111-114) -> Accepted Offer (114-117)
            if t < 111.0:
                p = (t - 108.0) / 3.0
                screen_img = self.render_content_to_screen(self.shots["s13a_tour_chatroom"], y_offset_ratio=0.25 + p*0.1)
            elif t < 114.0:
                p = (t - 111.0) / 3.0
                screen_img = self.render_content_to_screen(self.shots["s13b_tour_offer_pending"], y_offset_ratio=0.25 + p*0.1)
            else:
                p = (t - 114.0) / 3.0
                screen_img = self.render_content_to_screen(self.shots["s13c_tour_offer_accepted"], y_offset_ratio=0.25 + p*0.1)
                
        elif 117.0 <= t < 126.0:
            # S14: Board / articles
            p = (t - 117.0) / 9.0
            screen_img = self.render_content_to_screen(self.shots["s14_tour_board"], y_offset_ratio=p * 0.6)
            
        elif 126.0 <= t < 135.0:
            # S15: Profile stats overview -> Tap Asset Value box -> Drilldown to Portfolio Dashboard
            if t < 129.2:
                # 126.0 - 129.2s (3.2s): Profile Owner screen with tapping gold ring on "1.2M ฿ มูลค่าสินทรัพย์"
                p = (t - 126.0) / 3.2
                screen_img = self.render_content_to_screen(self.shots["s15_tour_profile_owner"], y_offset_ratio=0.08)
                # Tap ring cue at asset value box (approx x=730, y=620 on canvas)
                pulse = 1.0 + 0.12 * np.sin(p * 12.0)
                rw = int(150 * pulse)
                rh = int(150 * pulse)
                ring = self.overlays["ring_gold"].resize((rw, rh), Image.Resampling.BILINEAR)
                overlay_elements.append((ring, 730 - rw//2, 620 - rh//2))
            else:
                # 129.2 - 135.0s (5.8s): Inside Portfolio Dashboard ("มูลค่าทรัพย์สิน ฿ 7,380,000" + Chart + Brand breakdown)
                p = (t - 129.2) / 5.8
                screen_img = self.render_content_to_screen(self.shots["s15b_tour_assets_value"], y_offset_ratio=p * 0.45)
            
        elif 135.0 <= t < 145.0:
            # S16: Why 1 (All-in-one)
            p = (t - 135.0) / 10.0
            zoom = 1.0 + p * 0.05
            screen_img = self.render_content_to_screen(self.shots["s16_why_allinone"], y_offset_ratio=0.15, zoom=zoom)
            # Overlay tag value 1 positioned cleanly at bottom
            tag1 = self.overlays["tag_val1"].resize((760, 152), Image.Resampling.BILINEAR)
            overlay_elements.append((tag1, (WIDTH - 760)//2, 1420))
            
        elif 145.0 <= t < 155.0:
            # S17: Why 2 (Secure & Fair)
            p = (t - 145.0) / 10.0
            zoom = 1.0 + p * 0.05
            screen_img = self.render_content_to_screen(self.shots["s17_why_secure_chat"], y_offset_ratio=0.25, zoom=zoom)
            # Overlay tag value 2 positioned cleanly at bottom
            tag2 = self.overlays["tag_val2"].resize((760, 152), Image.Resampling.BILINEAR)
            overlay_elements.append((tag2, (WIDTH - 760)//2, 1420))
            
        elif 155.0 <= t < 165.0:
            # S18: Why 3 (Easy start & Growth) S18a -> S18b
            if t < 160.0:
                p = (t - 155.0) / 5.0
                screen_img = self.render_content_to_screen(self.shots["s18a_why_entry"], y_offset_ratio=0.35 + p*0.1)
            else:
                p = (t - 160.0) / 5.0
                screen_img = self.render_content_to_screen(self.shots["s18b_why_profile_owner"], y_offset_ratio=0.1 + p*0.1)
            # Overlay tag value 3 positioned cleanly at bottom
            tag3 = self.overlays["tag_val3"].resize((760, 152), Image.Resampling.BILINEAR)
            overlay_elements.append((tag3, (WIDTH - 760)//2, 1420))
            
        elif 165.0 <= t < 173.0:
            # S19: CTA Store download
            p = (t - 165.0) / 8.0
            zoom = 1.0 + p * 0.05
            screen_img = self.render_content_to_screen(self.shots["s19_cta_playstore"], y_offset_ratio=0.2, zoom=zoom)
            
        # 1. Composite screen inside phone frame
        if screen_img:
            screen_rgba = screen_img.convert("RGBA")
            frame.paste(screen_rgba, (SCREEN_X, SCREEN_Y), self.screen_mask)
            
        # 2. Composite phone frame border & gold rim overlay (Transparent center)
        frame.alpha_composite(self.phone_frame_overlay)
        
        # 3. Composite overlays (cues, tags)
        for ov_img, ox, oy in overlay_elements:
            frame.alpha_composite(ov_img, (ox, oy))
            
        return frame.convert("RGB")

def render_full_video():
    os.makedirs(DIST_DIR, exist_ok=True)
    mix_master_audio()
    
    composer = IntroVideoComposer()
    
    print(f"Starting video encoding pipeline to {OUTPUT_MP4}...")
    print(f"Target: 1080x1920 @ {FPS}fps, Total Frames: {TOTAL_FRAMES} (180.0s)")
    print("Mode: Full App Visibility (No Subtitles) + Portfolio Drilldown in S15")
    
    cmd = [
        FFMPEG_EXE, "-y",
        "-f", "rawvideo",
        "-vcodec", "rawvideo",
        "-s", f"{WIDTH}x{HEIGHT}",
        "-pix_fmt", "bgr24",
        "-r", str(FPS),
        "-i", "-",
        "-i", OUTPUT_AUDIO,
        "-c:v", "libx264",
        "-preset", "fast",
        "-crf", "18",
        "-pix_fmt", "yuv420p",
        "-c:a", "aac",
        "-b:a", "192k",
        "-ar", "48000",
        "-shortest",
        OUTPUT_MP4
    ]
    
    proc = subprocess.Popen(cmd, stdin=subprocess.PIPE, stderr=subprocess.PIPE)
    
    report_step = 150 # every 5 seconds
    try:
        for idx in range(TOTAL_FRAMES):
            frame_img = composer.generate_frame(idx)
            
            # Convert RGB PIL Image to BGR Numpy array for FFmpeg
            bgr_arr = np.array(frame_img)[:, :, ::-1]
            proc.stdin.write(bgr_arr.tobytes())
            
            if (idx + 1) % report_step == 0 or idx == TOTAL_FRAMES - 1:
                cur_sec = (idx + 1) / FPS
                pct = (idx + 1) / TOTAL_FRAMES * 100.0
                print(f"Render progress: {idx + 1}/{TOTAL_FRAMES} frames ({cur_sec:.1f}s / {TOTAL_DURATION}s - {pct:.1f}%)")
                
    except Exception as e:
        print(f"Error during video composition: {e}")
        proc.kill()
        raise e
    finally:
        if proc.stdin:
            proc.stdin.close()
            
    print("Waiting for FFmpeg to finalize encoding...")
    stdout, stderr = proc.communicate()
    if proc.returncode != 0:
        print(f"FFmpeg failed with code {proc.returncode}:")
        print(stderr.decode("utf-8", errors="ignore"))
        sys.exit(1)
        
    file_size_mb = os.path.getsize(OUTPUT_MP4) / (1024 * 1024)
    print(f"SUCCESS! Rendered intro video draft: {OUTPUT_MP4}")
    print(f"File Size: {file_size_mb:.2f} MB")

if __name__ == "__main__":
    render_full_video()
