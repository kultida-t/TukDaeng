# บัญชีรายการและคู่มือการใช้สื่อ (Asset Manifest) — คลิป INTRO

> **รหัสงาน:** VGD-003  
> **ภารกิจ (Mission):** ผลิตคลิปแนะนำแอป TukDaeng (ภาพรวม ≤3 นาที) [fa6c030e]  
> **อ้างอิงสคริปต์:** [intro-script.md](file:///c:/Users/Admin/Desktop/TukDaeng/scripts/video-guides/intro-script.md)  
> **แหล่งภาพต้นฉบับ:** `screenshots/user-manual/`  
> **โฟลเดอร์ผลลัพธ์หลัก:** `assets/video-guides/intro/`  
> **สถานะการตรวจสอบความปลอดภัย (Privacy & Compliance):** ผ่านเกณฑ์ 100% (No PII, Status Bar Masked)

---

## 1. โครงสร้างโฟลเดอร์สื่อ (Directory Structure)

```text
assets/video-guides/intro/
├── [ไฟล์ภาพหน้าจอหลัก 21 ไฟล์ ทำความสะอาดแถบสถานะแล้ว]
│   ├── 00-splash.png
│   ├── 00-entry.png
│   ├── 00-bottom-nav-member.png
│   ├── 00-playstore.png
│   ├── 02-feed-member.png
│   ├── 02-feed-guest.png
│   ├── 02-feed-card.png
│   ├── 03-search-result.png
│   ├── 03-filter-applied.png
│   ├── 05-assetdetail-viewer.png
│   ├── 05-assetdetail-viewer-show.png
│   ├── 06-profile-public.png
│   ├── 06-profile-owner.png
│   ├── 07-chat-room.png
│   ├── 07-offercard-pending.png
│   ├── 07-offercard-accepted.png
│   ├── 07-offercard-accepted-seller.png
│   ├── 08-make-offer.png
│   ├── 09-noti-watchalert.png
│   ├── 10-watchalert-list.png
│   └── 12-board.png
├── raw/                    # สำเนาภาพหน้าจอต้นฉบับดั้งเดิม (Unmodified 100%)
├── shots/                  # ไฟล์ภาพที่จัดเรียงตามลำดับฉาก S01 - S20 พร้อมใช้ตัดต่อทันที
└── brand/                  # กราฟิกแบรนด์ End Card, โลโก้, ป้ายกำกับ, และ Overlay Cues
    ├── endcard-9x16.png              (1080×1920) กราฟิก End Card สรุปและ CTA ปิดท้าย
    ├── logo-tukdaeng.png             (500×500) แบดจ์โลโก้ Univerza Tukdaeng คมชัด
    ├── badge-sale.png                (400×160) ป้าย SALE สีแดงสำหรับเปรียบเทียบใน S07
    ├── badge-show.png                (400×160) ป้าย SHOW สีน้ำเงินสำหรับเปรียบเทียบใน S07
    ├── cue-highlight-ring-red.png    (240×240) วงแหวนไฮไลต์สีแดงสำหรับชี้ตำแหน่งแตะ (S05/S07)
    ├── cue-highlight-ring-gold.png   (240×240) วงแหวนไฮไลต์สีทองประกายหรูหรา
    ├── tag-value-1-allinone.png      (900×180) แถบไฮไลต์คุณค่า #1 ครบวงจรเพื่อคนรักนาฬิกา (S16)
    ├── tag-value-2-secure.png        (900×180) แถบไฮไลต์คุณค่า #2 ซื้อขายสบายใจ ปลอดภัย (S17)
    └── tag-value-3-growth.png        (900×180) แถบไฮไลต์คุณค่า #3 เริ่มง่าย โตไปด้วยกัน (S18)
```

---

## 2. ตารางแมปสื่อแยกตามฉาก (Scene-by-Scene Shot Mapping)

| ฉาก (Scene) | เวลา (Timecode) | ช่วงเนื้อหา | ไฟล์ในโฟลเดอร์ `shots/` | ไฟล์หลักอ้างอิง | มิติภาพ (Resolution) | หมายเหตุและการแสดงผล (Visual Cue & Motion) |
| :---: | :---: | :---: | :--- | :--- | :---: | :--- |
| **S01** | 0:00 – 0:08 | **HOOK** | `s01_hook_feed.png` | `02-feed-member.png` | 1080×2400 | แพนเลื่อนหน้าฟีดลงช้า ๆ แสดงรายการนาฬิกา |
| **S02** | 0:08 – 0:16 | **WHAT** | `s02_what_splash.png` | `00-splash.png` | 1080×2400 | ค่อย ๆ ซูมเข้าหาไอคอนตึกแดงบนพื้นแดงสด |
| **S03** | 0:16 – 0:25 | **WHAT** | `s03a_what_feed.png`<br>`s03b_what_detail.png` | `02-feed-member.png`<br>`05-assetdetail-viewer.png` | 1080×2400 | Transition สไลด์จากการ์ดฟีดเข้าสู่หน้ารายละเอียดเรือน |
| **S04** | 0:25 – 0:34 | **WHO** | `s04_who_profile.png` | `06-profile-public.png` | 1080×2400 | แสดงหน้าโปรไฟล์สาธารณะของนักสะสม |
| **S05** | 0:34 – 0:45 | **GUEST** | `s05a_guest_entry.png`<br>`s05b_guest_feed.png` | `00-entry.png`<br>`02-feed-guest.png` | 1080×2400 | วงแหวนไฮไลต์แดง (`cue-highlight-ring-red.png`) เน้นปุ่ม "สำรวจนาฬิกา" |
| **S06** | 0:45 – 0:54 | **TOUR 1** | `s06a_tour_bottomnav.png`<br>`s06b_tour_feed.png` | `00-bottom-nav-member.png`<br>`02-feed-member.png` | 1080×2400 | เน้นแถบนำทาง 5 เมนูหลักด้านล่าง |
| **S07** | 0:54 – 1:05 | **TOUR 1** | `s07a_tour_feedcard.png`<br>`s07b_tour_detailshow.png` | `02-feed-card.png`<br>`05-assetdetail-viewer-show.png` | 1080×2400 | ซูมเทียบป้าย `badge-sale.png` (แดง) และ `badge-show.png` (น้ำเงิน) |
| **S08** | 1:05 – 1:14 | **TOUR 2** | `s08_tour_search.png` | `03-search-result.png` | 1080×2400 | ซูมเข้าที่ช่องค้นหาและตัวเลขผลลัพธ์ Rolex |
| **S09** | 1:14 – 1:22 | **TOUR 2** | `s09_tour_filter.png` | `03-filter-applied.png` | 1080×2400 | เลื่อนแสดงชีตตัวกรอง: แบรนด์, รุ่น, ราคา, ปี, สภาพ |
| **S10** | 1:22 – 1:31 | **TOUR 3** | `s10_tour_watchalert_list.png` | `10-watchalert-list.png` | 1080×2400 | แสดงรายการ Watch Alert และสวิตช์เปิดรับแจ้งเตือน |
| **S11** | 1:31 – 1:39 | **TOUR 3** | `s11_tour_watchalert_noti.png` | `09-noti-watchalert.png` | 1080×2400 | แจ้งเตือนข้อความพบเรือนที่ตรงเงื่อนไข |
| **S12** | 1:39 – 1:48 | **TOUR 4** | `s12_tour_make_offer.png` | `08-make-offer.png` | 1080×2400 | แสดงแผ่นป๊อปอัปกรอกราคาเสนอซื้อ Make Offer |
| **S13** | 1:48 – 1:57 | **TOUR 4** | `s13a_tour_chatroom.png`<br>`s13b_tour_offer_pending.png`<br>`s13c_tour_offer_accepted.png` | `07-chat-room.png`<br>`07-offercard-pending.png`<br>`07-offercard-accepted-seller.png` | 1080×2400 | ซูมแสดงการ์ดข้อเสนอในแชท เปลี่ยนสถานะเป็นการ์ดยอมรับ |
| **S14** | 1:57 – 2:06 | **TOUR 5** | `s14_tour_board.png` | `12-board.png` | 1080×2400 | เลื่อนชมกระดานข่าวสารและบทความวงการนาฬิกา |
| **S15** | 2:06 – 2:15 | **TOUR 5** | `s15_tour_profile_owner.png` | `06-profile-owner.png` | 1080×2400 | ไฮไลต์กล่องสถิติพอร์ต มูลค่ารวม และจำนวนเรือน |
| **S16** | 2:15 – 2:25 | **WHY** | `s16_why_allinone.png` | `05-assetdetail-viewer.png` | 1080×2400 | ซูมช้า ๆ พร้อมโอเวอร์เลย์ `tag-value-1-allinone.png` |
| **S17** | 2:25 – 2:35 | **WHY** | `s17_why_secure_chat.png` | `07-chat-room.png` | 1080×2400 | แชทต่อรอง พร้อมโอเวอร์เลย์ `tag-value-2-secure.png` |
| **S18** | 2:35 – 2:45 | **WHY** | `s18a_why_entry.png`<br>`s18b_why_profile_owner.png` | `00-entry.png`<br>`06-profile-owner.png` | 1080×2400 | สลับภาพ Guest สู่พอร์ตสะสม พร้อมโอเวอร์เลย์ `tag-value-3-growth.png` |
| **S19** | 2:45 – 2:53 | **CTA** | `s19_cta_playstore.png` | `00-playstore.png` | 1080×2400 | หน้าดาวน์โหลด Play Store & App Store |
| **S20** | 2:53 – 3:00 | **CTA** | `s20_cta_endcard.png` | `brand/endcard-9x16.png` | 1080×1920 | End Card กราฟิกแบรนด์ ตึกแดง แดง-กรมท่า-ทอง + ปุ่ม Store + ติดตามซีรีส์ |

---

## 3. รายละเอียดกราฟิก End Card (S20)

- **ไฟล์:** `assets/video-guides/intro/brand/endcard-9x16.png`
- **อัตราส่วนและมิติ:** 9:16 แนวตั้ง (1080 × 1920 px) ความละเอียดสูง คมชัดทุกพิกเซล
- **ชุดสีแบรนด์ (Brand Color Palette):**
  - กรมท่าลึก (Navy Background): `#08172e` ผสมการไล่เฉดเรเดียลสู่ `#030a14` และวงหน้าปัดนาฬิกาสีทองบางเบา
  - แดงตึกแดง (TukDaeng Red): `#e50914` ใช้กับไอคอนแอป, ไตเติลภาษาไทย และปุ่มติดตาม
  - สีทองประกาย (Gold Accents): `#c5a059` / `#e5ca8f` ใช้กับขอบไอคอน, เส้นขอบการ์ด และป้ายคุณค่า
  - สีขาว (Pure White): `#ffffff` สำหรับข้อความอ่านง่าย
- **องค์ประกอบหลักใน End Card:**
  1. **ส่วนบน (Brand Identity):**
     - ไอคอนแอปขนาดใหญ่พร้อมกรอบทองและแสงเงาตกกระทบ
     - ชื่อแบรนด์ `UNIVERZA TUKDAENG` และชื่อไทย `แอปตึกแดง`
     - สโลแกน "แพลตฟอร์มเพื่อคนรักนาฬิกาโดยเฉพาะ"
     - แบดจ์ 3 เสาหลัก: ซื้อขาย · จัดแสดง · คอมมูนิตี้
  2. **ส่วนกลาง (Series CTA Box):**
     - กล่องข้อความกรอบทองกระจกหรู (Glassmorphic Card)
     - ป้ายกำกับ "🎬 ซีรีส์วิดีโอสอนใช้งาน"
     - หัวข้อตอนถัดไป: "ตอนถัดไป: EP.0 เล่นแอปได้ทันที ไม่ต้องสมัครสมาชิก (Guest Mode)"
     - ปุ่มแอคชันสีแดงสด "กดติดตาม & รับการแจ้งเตือน" พร้อมไอคอนกระดิ่ง
  3. **ส่วนล่าง (Store Download):**
     - ข้อความ "ดาวน์โหลดได้แล้ววันนี้ โหลดฟรี!"
     - ช่องเน้นคำค้นหา "ค้นหาคำว่า TukDaeng ทั้งสองระบบ"
     - การ์ดปุ่มสโตร์ทางการ 2 สโตร์: **Google Play** และ **Apple App Store**
  4. **ส่วนท้าย (Footer):**
     - ลิขสิทธิ์และสโลแกนความน่าเชื่อถือ "Univerza Tukdaeng © 2026 • ปลอดภัย โปร่งใส เป็นระบบ"

---

## 4. บันทึกการตรวจสอบความปลอดภัยและความเป็นส่วนตัว (Privacy & Compliance Audit)

1. **ไม่มีข้อมูลส่วนบุคคลจริง (Zero Real PII):**
   - ทุกภาพเป็นหน้าจอระบบหรือข้อมูลทดสอบที่ปลอดภัย
   - ไม่มีอีเมลส่วนบุคคลจริง, เบอร์โทรศัพท์, หรือเลขบัญชีของผู้ใช้งานปรากฏบนหน้าจอ
   - ข้อมูลบัญชีที่ปรากฏคือชื่อโปรไฟล์ในระบบทดสอบ เช่น `Matem Mickey` ซึ่งปลอดภัยสำหรับการเผยแพร่
2. **การทำความสะอาดแถบสถานะ (Status Bar Masking):**
   - ภาพหน้าจอขนาด 1080×2400 ทุกไฟล์ได้รับการเซนเซอร์/ลบแถบสถานะ Android Emulator (นาฬิกา, สัญญาณ Wi-Fi, แบตเตอรี่) ในช่วงพิกัด `y = 0..86` ด้วยสีพื้นหลังที่กลมกลืนเป็นเนื้อเดียวกับแถบด้านบน
   - แถบนำทางด้านล่าง (Navigation Pill) ในช่วงพิกัด `y = 2345..2400` ได้รับการเคลียร์แถบสีขาวออก คงไว้ซึ่งแถบเมนู 5 ไอคอนหลักที่สมบูรณ์ 100%
3. **ความสมบูรณ์ของภาพ (No Degradation):**
   - เมนู, หัวข้อ, รูปภาพเรือนนาฬิกา, ราคา และปุ่มกดทุกจุดยังคงความคมชัดตามมาตรฐาน ไม่ถูกตัดทอน

---

## 5. คำแนะนำสำหรับการตัดต่อใน VGD-005 (Video Composition Handoff)

- **Canvas อัตราส่วน:** วิดีโอหลักใช้เฟรม 1080 × 1920 (9:16)
- **การจัดวางภาพหน้าจอ 1080×2400:**
  - รูปแบบที่ 1: วางตรงกลาง ย่อขนาดลงเล็กน้อย (ความกว้าง ~850–900 px) ใส่เงาละมุน (Drop Shadow `rgba(0,0,0,0.5)`) บนพื้นหลังสีกรมท่า `#08172e`
  - รูปแบบที่ 2: ครอปแพนเฉพาะส่วนที่สำคัญตามสคริปต์ (เช่น ซูมกล่องค้นหาใน S08, การ์ดข้อเสนอใน S13, หรือสถิติพอร์ตใน S15)
- **การใช้ Overlay Cues:**
  - นำไฟล์จากโฟลเดอร์ `brand/` วางทับตามตำแหน่งและไทม์โค้ดในสคริปต์
  - S05: ใช้ `cue-highlight-ring-red.png` วางตรงตำแหน่งปุ่มสำรวจนาฬิกา
  - S07: วาง `badge-sale.png` และ `badge-show.png`
  - S16–S18: วาง `tag-value-1-allinone.png`, `tag-value-2-secure.png`, `tag-value-3-growth.png` บริเวณด้านล่างของหน้าจอ

---

## 6. บัญชีรายการไฟล์เสียงพากย์และซับไตเติล (VGD-004 Audio & Subtitles)

ไฟล์ทั้งหมดผลิตจากเสียงพากย์ Microsoft Azure Neural TTS (`th-TH-NiwatNeural`) ด้วยโทนเสียงอบอุ่น สุภาพ เป็นกันเองตามบรีฟ สอดคล้องกับตาราง Shot List 20 ฉาก (S01–S20) และระยะเวลา 180 วินาทีพอดี:

| ลำดับ | ชื่อไฟล์ | รูปแบบไฟล์ (Format) | ขนาดไฟล์ (Size) | วัตถุประสงค์และการใช้งาน |
| :---: | :--- | :---: | :---: | :--- |
| **1** | [`intro-voice.wav`](file:///c:/Users/Admin/Desktop/TukDaeng/assets/video-guides/intro/intro-voice.wav) | WAV 48kHz Stereo 16-bit | ~34.56 MB | ไฟล์เสียงพากย์มาสเตอร์ความยาว 180.00 วินาทีเต็ม (Normalized -1.0 dBFS) |
| **2** | [`voice.wav`](file:///c:/Users/Admin/Desktop/TukDaeng/assets/video-guides/intro/voice.wav) | WAV 48kHz Stereo 16-bit | ~34.56 MB | สำเนาไฟล์เสียงหลักสำหรับ Task VGD-004 / Pipeline Video Editor |
| **3** | [`intro-timestamps.json`](file:///c:/Users/Admin/Desktop/TukDaeng/assets/video-guides/intro/intro-timestamps.json) | JSON (UTF-8) | ~21.7 KB | โครงสร้าง Timestamp รายฉาก (S01–S20), Voiceover timecode, On-screen Subtitle timecode, Lead-in และ Tail gaps |
| **4** | [`intro-subtitles.srt`](file:///c:/Users/Admin/Desktop/TukDaeng/assets/video-guides/intro/intro-subtitles.srt) | SubRip Subtitle (.srt) | ~3.8 KB | ซับไตเติลหน้าจอ (On-screen Subtitles) ตาม Shot List ตัดแบ่งบรรทัดกระชับ เหมาะสำหรับ Burn-in Subtitles |
| **5** | [`intro-narration.srt`](file:///c:/Users/Admin/Desktop/TukDaeng/assets/video-guides/intro/intro-narration.srt) | SubRip Subtitle (.srt) | ~6.5 KB | ซับไตเติลเสียงพากย์ฉบับเต็มคำ (Full Voiceover Transcript) ซิงก์ตรงกับเสียงพูด |
| **6** | [`intro-subtitles.vtt`](file:///c:/Users/Admin/Desktop/TukDaeng/assets/video-guides/intro/intro-subtitles.vtt) | WebVTT (.vtt) | ~3.8 KB | ซับไตเติลสำหรับ Web Video Player / Mobile Preview |
| **7** | [`synthesize_intro_voice.py`](file:///c:/Users/Admin/Desktop/TukDaeng/scripts/video-guides/synthesize_intro_voice.py) | Python 3 Script | ~18.5 KB | สคริปต์ผลิตและตรวจสอบเสียงพากย์ สามารถรันซ้ำเพื่อปรับเปลี่ยนพารามิเตอร์ได้อัตโนมัติ |

### สรุปตัวชี้วัดด้านเสียง (Audio Performance Metrics)
- **ความยาววิดีโอรวม:** 180.00 วินาที (3 นาทีพอดีเป๊ะ)
- **จำนวนคำทั้งหมด:** 391 คำ (ภาษาไทยต่อเนื่อง)
- **เวลาเสียงพูดสุทธิ:** 133.91 วินาที (74.4% ของคลิป)
- **เวลาหยุดพักตามธรรมชาติ (Natural Pauses):** 46.09 วินาที (25.6% เพื่อให้ผู้ชมได้ดูอินเทอร์เฟซและกราฟิก)
- **อัตราการพูดเฉลี่ยทั้งคลิป:** 130.3 คำ/นาที (อยู่ในเกณฑ์ 130–140 คำ/นาที ตามมาตรฐานสคริปต์)
- **คุณภาพสัญญาณเสียง:** 48,000 Hz, 16-bit PCM Stereo, Peak Level -1.0 dBFS

