#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
สคริปต์สังเคราะห์เสียงพากย์ TTS ภาษาไทยสำหรับคลิป INTRO (180 วินาที / 3 นาที)
ใช้ Microsoft Edge Neural TTS (เสียง th-TH-NiwatNeural) โทนอบอุ่น สุภาพ เป็นกันเอง
ผลิตไฟล์:
1. assets/video-guides/intro/intro-voice.wav (ความยาว 180 วินาที 48kHz Stereo)
2. assets/video-guides/intro/voice.wav (สำเนาสำหรับ VGD-004/Kanban)
3. assets/video-guides/intro/intro-timestamps.json (Metadata ละเอียดราย Scene และประโยค)
4. assets/video-guides/intro/intro-subtitles.srt (ซับไตเติล On-screen ตาม Shot List)
5. assets/video-guides/intro/intro-narration.srt (ซับไตเติลเสียงพากย์เต็มคำ)
6. assets/video-guides/intro/intro-subtitles.vtt (WebVTT Format)
"""

import asyncio
import json
import os
import io
import sys
import edge_tts
import numpy as np
import soundfile as sf

# บังคับ stdout และ stderr เป็น utf-8 เพื่อรองรับ console ทุกภาษาบน Windows
if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
        sys.stderr.reconfigure(encoding='utf-8')
    except Exception:
        pass

# รายการ 20 Scenes ตามตาราง Shot List ใน scripts/video-guides/intro-script.md
SCENES_DATA = [
    {
        "id": "S01",
        "phase": "HOOK",
        "start_sec": 0.0,
        "end_sec": 8.0,
        "voice_script": "เคยเจอปัญหานี้ไหมครับ? อยากหานาฬิกาถูกใจสักเรือน หรืออยากปล่อยต่อเรือนที่มี แต่ไม่รู้จะไปโพสต์ที่ไหนที่ไว้ใจได้จริง ๆ",
        "on_screen_sub": "เคยเจอปัญหานี้ไหม?\nอยากซื้อขายนาฬิกา แต่ไม่รู้จะไปที่ไหนที่ไว้ใจได้",
        "rate": "+8%",
        "words": 24
    },
    {
        "id": "S02",
        "phase": "WHAT",
        "start_sec": 8.0,
        "end_sec": 16.0,
        "voice_script": "นี่คือ Univerza Tukdaeng หรือแอปตึกแดง แพลตฟอร์มที่รวมทุกเรื่องของคนรักนาฬิกาไว้ในที่เดียว",
        "on_screen_sub": "Univerza Tukdaeng (ตึกแดง)\nแพลตฟอร์มเพื่อคนรักนาฬิกาโดยเฉพาะ",
        "rate": "+5%",
        "words": 15
    },
    {
        "id": "S03",
        "phase": "WHAT",
        "start_sec": 16.0,
        "end_sec": 25.0,
        "voice_script": "ทั้งพื้นที่ซื้อขาย จัดแสดงคอลเลกชันส่วนตัว และคอมมูนิตี้แลกเปลี่ยนเรื่องราวนาฬิกาของพวกเราครับ",
        "on_screen_sub": "ซื้อขาย · จัดแสดงคอลเลกชัน · คอมมูนิตี้\nครบจบในที่เดียว",
        "rate": "+5%",
        "words": 18
    },
    {
        "id": "S04",
        "phase": "WHO",
        "start_sec": 25.0,
        "end_sec": 34.0,
        "voice_script": "ไม่ว่าคุณจะเป็นนักสะสมสายจริงจัง คนที่อยากปล่อยต่อเปลี่ยนเรือนใหม่ หรือคนที่กำลังมองหานาฬิกาเรือนแรก",
        "on_screen_sub": "ไม่ว่าจะเป็นนักสะสม ผู้ขาย\nหรือคนที่กำลังหาเรือนแรก",
        "rate": "+5%",
        "words": 20
    },
    {
        "id": "S05",
        "phase": "GUEST",
        "start_sec": 34.0,
        "end_sec": 45.0,
        "voice_script": "หรือแค่อยากเข้ามาดูคอลเลกชันสวย ๆ ก็เปิดแอปแล้วสำรวจได้ทันทีผ่าน Guest mode โดยยังไม่ต้องสมัครสมาชิกครับ",
        "on_screen_sub": "เปิดแอปแล้วส่องได้ทันที\nด้วย Guest mode ไม่ต้องสมัครสมาชิกก่อน",
        "rate": "+5%",
        "words": 21
    },
    {
        "id": "S06",
        "phase": "TOUR 1",
        "start_sec": 45.0,
        "end_sec": 54.0,
        "voice_script": "เริ่มจากแถบเมนูด้านล่าง มีครบทั้ง ฟีด, แชท, กระดานข่าว, การแจ้งเตือน และโปรไฟล์ บนหน้าฟีดจะรวมนาฬิกาที่น่าสนใจไว้ทั้งหมด",
        "on_screen_sub": "แถบนำทาง 5 เมนูหลัก\nฟีด · แชท · กระดานข่าว · แจ้งเตือน · โปรไฟล์",
        "rate": "+6%",
        "words": 25
    },
    {
        "id": "S07",
        "phase": "TOUR 1",
        "start_sec": 54.0,
        "end_sec": 65.0,
        "voice_script": "โดยมีทั้งป้าย SALE สีแดง สำหรับเรือนที่ลงขายพร้อมราคาชัดเจน และป้าย SHOW สีน้ำเงิน สำหรับเรือนที่เจ้าของนำมาโชว์คอลเลกชันส่วนตัวครับ",
        "on_screen_sub": "ป้าย SALE สีแดง = ลงขายระบุราคา\nป้าย SHOW สีน้ำเงิน = จัดแสดงโชว์คอลเลกชัน",
        "rate": "+5%",
        "words": 21
    },
    {
        "id": "S08",
        "phase": "TOUR 2",
        "start_sec": 65.0,
        "end_sec": 74.0,
        "voice_script": "อยากได้เรือนไหน ค้นหาได้แม่นยำมาก มีตัวกรองที่คัดสรรมาเพื่อนาฬิกาโดยเฉพาะ",
        "on_screen_sub": "ค้นหาแม่นยำ พร้อมระบุจำนวนเรือนที่พบ",
        "rate": "+5%",
        "words": 14
    },
    {
        "id": "S09",
        "phase": "TOUR 2",
        "start_sec": 74.0,
        "end_sec": 82.0,
        "voice_script": "เลือกแบรนด์ปุ๊บ รุ่นจะกรองให้ตรงรุ่นทันที พร้อมระบุช่วงราคา ปีที่ผลิต และสภาพเรือนได้ครบถ้วน",
        "on_screen_sub": "ตัวกรองตรงรุ่น แบรนด์ ช่วงราคา ปี สภาพเรือน",
        "rate": "+5%",
        "words": 20
    },
    {
        "id": "S10",
        "phase": "TOUR 3",
        "start_sec": 82.0,
        "end_sec": 91.0,
        "voice_script": "และถ้าคุณกำลังตามหาเรือนหายาก ระบบ Watch Alert จะเป็นผู้ช่วยส่วนตัว แค่ตั้งเงื่อนไขแบรนด์และงบที่ต้องการไว้",
        "on_screen_sub": "Watch Alert ผู้ช่วยเฝ้าหานาฬิกาในฝัน\nตั้งเงื่อนไขและงบประมาณไว้ล่วงหน้า",
        "rate": "+5%",
        "words": 21
    },
    {
        "id": "S11",
        "phase": "TOUR 3",
        "start_sec": 91.0,
        "end_sec": 99.0,
        "voice_script": "พอมีคนลงขายเรือนที่ตรงกันเมื่อไหร่ แอปจะแจ้งเตือนคุณทันที ไม่ต้องคอยนั่งเฝ้าหน้าจอตลอดเวลา",
        "on_screen_sub": "แจ้งเตือนทันทีเมื่อมีของตรงสเปกเข้ามา",
        "rate": "+5%",
        "words": 19
    },
    {
        "id": "S12",
        "phase": "TOUR 4",
        "start_sec": 99.0,
        "end_sec": 108.0,
        "voice_script": "เมื่อเจอเรือนที่ใช่ ก็กดเสนอราคาเพื่อต่อรองได้เลย ข้อเสนอจะถูกส่งเป็นการ์ดเข้าไปในห้องแชทกับเจ้าของเรือนโดยตรง",
        "on_screen_sub": "กดเสนอราคา (Make Offer)\nส่งการ์ดข้อเสนอเข้าห้องแชทโดยตรง",
        "rate": "+5%",
        "words": 21
    },
    {
        "id": "S13",
        "phase": "TOUR 4",
        "start_sec": 108.0,
        "end_sec": 117.0,
        "voice_script": "ให้ผู้ขายพิจารณากดยอมรับหรือปฏิเสธได้ทันที คุยจบ ต่อรองปลอดภัย และโปร่งใสในแชทเดียว",
        "on_screen_sub": "ตกลงราคากันในแชท ปลอดภัยและโปร่งใส\nกดยอมรับหรือปฏิเสธได้ทันที",
        "rate": "+5%",
        "words": 17
    },
    {
        "id": "S14",
        "phase": "TOUR 5",
        "start_sec": 117.0,
        "end_sec": 126.0,
        "voice_script": "นอกจากนี้ยังมี กระดานข่าว ที่รวบรวมบทความ เทรนด์ และสาระน่ารู้ของวงการนาฬิกาให้ติดตาม",
        "on_screen_sub": "กระดานข่าว บทความ สาระ และเทรนด์นาฬิกา",
        "rate": "+5%",
        "words": 16
    },
    {
        "id": "S15",
        "phase": "TOUR 5",
        "start_sec": 126.0,
        "end_sec": 135.0,
        "voice_script": "รวมถึงหน้า โปรไฟล์ ที่เป็นเสมือนตู้เซฟดิจิทัล ช่วยบันทึกประวัติและมูลค่ารวมของคอลเลกชันของคุณได้อย่างเป็นระเบียบครับ",
        "on_screen_sub": "โปรไฟล์ส่วนตัว บันทึกพอร์ตและมูลค่าคอลเลกชัน",
        "rate": "+5%",
        "words": 20
    },
    {
        "id": "S16",
        "phase": "WHY",
        "start_sec": 135.0,
        "end_sec": 145.0,
        "voice_script": "ทำไมต้องแอปตึกแดง? อย่างแรกคือ ออกแบบมาเพื่อคนรักนาฬิกาจริง ๆ รวมทั้งตลาด ตู้โชว์ และคอมมูนิตี้ไว้ในที่เดียว",
        "on_screen_sub": "1. ครบวงจรเพื่อคนรักนาฬิกาโดยเฉพาะ\nตลาด · ตู้โชว์ · คอมมูนิตี้",
        "rate": "+5%",
        "words": 22
    },
    {
        "id": "S17",
        "phase": "WHY",
        "start_sec": 145.0,
        "end_sec": 155.0,
        "voice_script": "อย่างที่สองคือ ซื้อขายต่อรองง่าย มีระบบเสนอราคาและการแจ้งเตือนที่ชัดเจน ปลอดภัย",
        "on_screen_sub": "2. ซื้อขายสบายใจ ระบบเสนอราคาชัดเจน ปลอดภัย",
        "rate": "+5%",
        "words": 16
    },
    {
        "id": "S18",
        "phase": "WHY",
        "start_sec": 155.0,
        "end_sec": 165.0,
        "voice_script": "และอย่างที่สามคือ เข้าถึงง่ายมาก ไม่ต้องสมัครก็ส่องได้ และพร้อมดูแลคอลเลกชันของคุณในระยะยาวครับ",
        "on_screen_sub": "3. เริ่มต้นง่าย ส่องได้ทันที พร้อมเติบโตไปกับพอร์ตคุณ",
        "rate": "+5%",
        "words": 20
    },
    {
        "id": "S19",
        "phase": "CTA",
        "start_sec": 165.0,
        "end_sec": 173.0,
        "voice_script": "ดาวน์โหลดแอป Univerza Tukdaeng ได้แล้ววันนี้ ค้นหาคำว่า TukDaeng ทั้งบน Google Play และ App Store โหลดฟรี",
        "on_screen_sub": "ดาวน์โหลดได้แล้ววันนี้\nค้นหา \"TukDaeng\" บน Play Store & App Store",
        "rate": "+5%",
        "words": 22
    },
    {
        "id": "S20",
        "phase": "CTA",
        "start_sec": 173.0,
        "end_sec": 180.0,
        "voice_script": "แล้วมาเริ่มเปิดตู้โชว์นาฬิกาไปด้วยกันนะครับ ฝากกดติดตาม และรอชมคลิปสอนใช้งานแบบละเอียดในซีรีส์ถัดไปได้เลยครับ",
        "on_screen_sub": "โหลดฟรี แล้วมาเปิดตู้โชว์นาฬิกาด้วยกัน\nกดติดตามเพื่อรอชมคลิปสอนใช้งานละเอียด",
        "rate": "+22%",
        "words": 19
    }
]

def format_srt_time(seconds: float) -> str:
    """แปลงค่าวินาทีเป็นรูปแบบ HH:MM:SS,mmm สำหรับไฟล์ .srt"""
    hours = int(seconds // 3600)
    minutes = int((seconds % 3600) // 60)
    secs = int(seconds % 60)
    millis = int(round((seconds - int(seconds)) * 1000))
    if millis >= 1000:
        millis = 999
    return f"{hours:02d}:{minutes:02d}:{secs:02d},{millis:03d}"

def format_vtt_time(seconds: float) -> str:
    """แปลงค่าวินาทีเป็นรูปแบบ HH:MM:SS.mmm สำหรับไฟล์ WebVTT"""
    hours = int(seconds // 3600)
    minutes = int((seconds % 3600) // 60)
    secs = int(seconds % 60)
    millis = int(round((seconds - int(seconds)) * 1000))
    if millis >= 1000:
        millis = 999
    return f"{hours:02d}:{minutes:02d}:{secs:02d}.{millis:03d}"

async def generate_speech_for_scene(scene: dict, voice: str = "th-TH-NiwatNeural"):
    """สังเคราะห์เสียงสำหรับ 1 ฉาก และถอดข้อมูลเสียงเป็น numpy array"""
    rate = scene.get("rate", "+5%")
    comm = edge_tts.Communicate(scene["voice_script"], voice, rate=rate)
    
    mp3_buf = io.BytesIO()
    sentence_boundaries = []
    
    async for chunk in comm.stream():
        if chunk["type"] == "audio":
            mp3_buf.write(chunk["data"])
        elif chunk["type"] == "SentenceBoundary":
            # 1 tick = 100 ns = 1e-7 s
            offset_sec = chunk["offset"] / 1e7
            dur_sec = chunk["duration"] / 1e7
            sentence_boundaries.append({
                "offset": offset_sec,
                "duration": dur_sec,
                "text": chunk.get("text", "")
            })
            
    mp3_buf.seek(0)
    audio_data, sample_rate = sf.read(mp3_buf)
    
    # ถ้าเป็น mono แปลงเป็น 1D array
    if audio_data.ndim > 1:
        audio_data = audio_data[:, 0]
        
    return audio_data, sample_rate, sentence_boundaries

async def main():
    print("=== เริ่มกระบวนการสังเคราะห์เสียงพากย์คลิป INTRO (VGD-004) ===")
    
    target_sample_rate = 48000
    total_video_duration = 180.0  # 3:00 นาทีพอดี
    total_samples = int(total_video_duration * target_sample_rate)
    
    # สร้าง Master Audio Track (Stereo 48kHz)
    master_audio = np.zeros((total_samples, 2), dtype=np.float32)
    
    scene_results = []
    srt_sub_entries = []
    srt_narration_entries = []
    vtt_sub_entries = []
    
    lead_in_gap = 0.20  # เว้นว่างต้นฉาก 0.20 วินาที ให้ภาพแสดงก่อน
    
    for idx, scene in enumerate(SCENES_DATA, 1):
        print(f"[{idx}/{len(SCENES_DATA)}] สังเคราะห์เสียงฉาก {scene['id']} ({scene['phase']})...")
        audio, sr, s_bounds = await generate_speech_for_scene(scene)
        
        # Resample ถ้าจำเป็น (ส่วนใหญ่ mp3 จาก edge-tts คือ 24000Hz)
        if sr != target_sample_rate:
            # Resample ด้วย linear interpolation คุณภาพสูง
            num_target_samples = int(len(audio) * target_sample_rate / sr)
            audio = np.interp(
                np.linspace(0, len(audio), num_target_samples, endpoint=False),
                np.arange(len(audio)),
                audio
            )
            
        dur_sec = len(audio) / target_sample_rate
        slot_dur = scene["end_sec"] - scene["start_sec"]
        
        # จัดตำแหน่งเสียงใน Timeline ของฉาก
        # ถ้าความยาวเสียง + lead_in_gap ยังไม่เกิน slot ให้วางที่ start_sec + lead_in_gap
        # ถ้าฉากแน่นมาก (เช่น S20) ให้ลด lead_in_gap ลงเหลือ 0.1s
        actual_lead = lead_in_gap if (dur_sec + lead_in_gap <= slot_dur) else max(0.05, slot_dur - dur_sec)
        voice_start_time = scene["start_sec"] + actual_lead
        voice_end_time = voice_start_time + dur_sec
        
        # ตรวจสอบขอบเขต
        start_sample = int(voice_start_time * target_sample_rate)
        end_sample = start_sample + len(audio)
        
        if end_sample > total_samples:
            end_sample = total_samples
            audio = audio[:(end_sample - start_sample)]
            dur_sec = len(audio) / target_sample_rate
            voice_end_time = voice_start_time + dur_sec
            
        # ผสมลงใน stereo track
        master_audio[start_sample:end_sample, 0] += audio
        master_audio[start_sample:end_sample, 1] += audio
        
        # คำนวณช่วงเวลา On-screen Subtitle ให้โชว์เกือบตลอดฉาก (มีเว้นช่องว่างเล็กน้อยท้ายฉาก)
        sub_start_time = scene["start_sec"] + 0.10
        sub_end_time = max(voice_end_time + 0.30, scene["end_sec"] - 0.15)
        if sub_end_time > scene["end_sec"]:
            sub_end_time = scene["end_sec"] - 0.05
            
        scene_info = {
            "scene_id": scene["id"],
            "phase": scene["phase"],
            "scene_timecode": {
                "start_sec": scene["start_sec"],
                "end_sec": scene["end_sec"],
                "duration_sec": slot_dur
            },
            "voiceover": {
                "text": scene["voice_script"],
                "words_count": scene["words"],
                "rate": scene["rate"],
                "voice_start_sec": round(voice_start_time, 3),
                "voice_end_sec": round(voice_end_time, 3),
                "voice_duration_sec": round(dur_sec, 3),
                "lead_in_sec": round(actual_lead, 3),
                "tail_gap_sec": round(scene["end_sec"] - voice_end_time, 3)
            },
            "on_screen_subtitle": {
                "text": scene["on_screen_sub"],
                "sub_start_sec": round(sub_start_time, 3),
                "sub_end_sec": round(sub_end_time, 3),
                "sub_duration_sec": round(sub_end_time - sub_start_time, 3)
            }
        }
        scene_results.append(scene_info)
        
        # เพิ่มข้อมูล SRT On-screen Subtitle
        srt_sub_entries.append(
            f"{idx}\n{format_srt_time(sub_start_time)} --> {format_srt_time(sub_end_time)}\n{scene['on_screen_sub']}\n"
        )
        
        # เพิ่มข้อมูล VTT On-screen Subtitle
        vtt_sub_entries.append(
            f"{idx}\n{format_vtt_time(sub_start_time)} --> {format_vtt_time(sub_end_time)}\n{scene['on_screen_sub']}\n"
        )
        
        # เพิ่มข้อมูล SRT Narration เต็มคำ
        srt_narration_entries.append(
            f"{idx}\n{format_srt_time(voice_start_time)} --> {format_srt_time(voice_end_time)}\n{scene['voice_script']}\n"
        )
        
        print(f"  [OK] {scene['id']}: Voice {dur_sec:.2f}s ในกรอบ {slot_dur:.1f}s (Start: {voice_start_time:.2f}s, End: {voice_end_time:.2f}s)")
        
    # ปรับระดับเสียง Normalize ให้ได้มาตรฐาน Broadcast / Online Video (-1.0 dBFS Peak)
    max_val = np.max(np.abs(master_audio))
    if max_val > 0:
        target_peak = 0.89125  # ประมาณ -1.0 dBFS
        master_audio = master_audio * (target_peak / max_val)
        print(f"\nNormalize เสียงพากย์: Peak ปรับจาก {max_val:.3f} เป็น {target_peak:.3f} (-1.0 dBFS)")
        
    # กำหนด Output Paths
    output_dir = os.path.abspath("assets/video-guides/intro")
    os.makedirs(output_dir, exist_ok=True)
    
    wav_path = os.path.join(output_dir, "intro-voice.wav")
    wav_alt_path = os.path.join(output_dir, "voice.wav")
    json_path = os.path.join(output_dir, "intro-timestamps.json")
    srt_sub_path = os.path.join(output_dir, "intro-subtitles.srt")
    srt_narr_path = os.path.join(output_dir, "intro-narration.srt")
    vtt_sub_path = os.path.join(output_dir, "intro-subtitles.vtt")
    
    # 1. เขียนไฟล์ WAV (16-bit PCM 48kHz Stereo)
    sf.write(wav_path, master_audio, target_sample_rate, subtype='PCM_16')
    sf.write(wav_alt_path, master_audio, target_sample_rate, subtype='PCM_16')
    print(f"\n[บันทึกสำเร็จ] ไฟล์เสียง WAV: {wav_path} ({len(master_audio)/target_sample_rate:.1f} วินาที)")
    print(f"[บันทึกสำเร็จ] ไฟล์เสียง WAV (Alt): {wav_alt_path}")
    
    # 2. เขียนไฟล์ JSON Timestamps
    total_words = sum(s["words"] for s in SCENES_DATA)
    total_voice_time = sum(s["voiceover"]["voice_duration_sec"] for s in scene_results)
    speech_wpm = (total_words / (total_voice_time / 60.0))
    overall_script_wpm = (total_words / (total_video_duration / 60.0))
    
    metadata = {
        "title": "Univerza Tukdaeng INTRO Voiceover Master",
        "voice_engine": "Microsoft Azure Neural TTS (edge-tts)",
        "voice_name": "th-TH-NiwatNeural",
        "voice_tone": "อบอุ่น สุภาพ เป็นกันเอง ชัดถ้อยชัดคำ",
        "total_video_duration_sec": total_video_duration,
        "total_scenes": len(SCENES_DATA),
        "total_words": total_words,
        "total_voice_duration_sec": round(total_voice_time, 2),
        "total_pause_duration_sec": round(total_video_duration - total_voice_time, 2),
        "overall_script_wpm": round(overall_script_wpm, 1),
        "active_speech_wpm": round(speech_wpm, 1),
        "audio_specs": {
            "format": "WAV",
            "channels": 2,
            "sample_rate_hz": target_sample_rate,
            "bit_depth": 16,
            "peak_level_dbfs": -1.0
        },
        "scenes": scene_results
    }
    
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(metadata, f, ensure_ascii=False, indent=2)
    print(f"[บันทึกสำเร็จ] ข้อมูล Metadata Timestamps: {json_path}")
    
    # 3. เขียนไฟล์ Subtitles (.srt และ .vtt)
    with open(srt_sub_path, "w", encoding="utf-8") as f:
        f.write("\n".join(srt_sub_entries))
    print(f"[บันทึกสำเร็จ] ไฟล์ On-screen Subtitles (.srt): {srt_sub_path}")
    
    with open(srt_narr_path, "w", encoding="utf-8") as f:
        f.write("\n".join(srt_narration_entries))
    print(f"[บันทึกสำเร็จ] ไฟล์ Narration Subtitles (.srt): {srt_narr_path}")
    
    with open(vtt_sub_path, "w", encoding="utf-8") as f:
        f.write("WEBVTT\n\n" + "\n".join(vtt_sub_entries))
    print(f"[บันทึกสำเร็จ] ไฟล์ WebVTT Subtitles (.vtt): {vtt_sub_path}")
    
    print("\n=== สรุปผลการสังเคราะห์เสียง ===")
    print(f"- จำนวนฉาก: {len(SCENES_DATA)} ฉาก (S01 - S20 ครบถ้วน)")
    print(f"- จำนวนคำทั้งหมด: {total_words} คำ")
    print(f"- ความยาววิดีโอรวม: {total_video_duration:.0f} วินาที (3 นาทีพอดีเป๊ะ)")
    print(f"- เวลาเสียงพูดรวม: {total_voice_time:.1f} วินาที (เหลือช่องว่างหายใจและดูหน้าจอ {total_video_duration - total_voice_time:.1f} วินาที)")
    print(f"- อัตราการพูดเฉลี่ยทั้งคลิป: {overall_script_wpm:.1f} คำ/นาที (ตรงตามบรีฟ ~130-140 คำ/นาที)")
    print(f"- อัตราการพูดเฉพาะช่วงเสียงพากย์: {speech_wpm:.1f} คำ/นาที")
    print("====================================")

if __name__ == "__main__":
    asyncio.run(main())
