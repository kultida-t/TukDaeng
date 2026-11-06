# AUTO-TEST-001 — Selector Feasibility Probe (แอปจริงบน Emulator)

> Task: 531733e8 · Mission: 7189b3fd · วันที่: 2026-11-06
> วิธี: `adb shell uiautomator dump` บน emulator API 34 (google_apis_playstore, x86_64) กับแอป `com.univerza.tukdaeng` จาก Play Store — เดินจอจริง onboarding → member sheet → feed (guest)

## Verdict

**Automate ได้จริง ระดับดีมาก** — element ทุกจุดที่ probe มี `content-desc` ครบ รวมถึงปุ่มไอคอนล้วน (like/share/save/เมนู ...) และ bottom nav

## สิ่งที่พิสูจน์ได้

| เรื่อง | ผล |
|---|---|
| Stack แอป | **Flutter** (activity `com.example.tukdaeng_mobile.MainActivity`, render เป็น `android.view.View` canvas ล้วน) — ตอบข้อ 1.1 เองได้ไม่ต้องรอ dev |
| resource-id | **ไม่มีเลย** — locator ต้องพึ่ง text/desc เท่านั้น |
| content-desc | **ครบและมีคุณภาพ** — ทุกจอที่ probe (6 จอ) มี desc ทุก element สำคัญ |
| Tap/navigate | `input tap` ตาม bounds จาก dump ใช้ได้ — เดิน onboarding → guest feed สำเร็จ |

## ตัวอย่าง desc ที่จับได้ (feed guest)

- Tabs: `ทั้งหมด` `กำลังติดตาม` `รายการโปรด`
- Post card: author, `ติดตาม`, `ตัวเลือกเพิ่มเติม` (เมนู ...), `ถูกใจ`, `ความคิดเห็น`, `ยอดเข้าชม\n215`, `แชร์`, `สอบถาม` (Ask pill), `บันทึก`, `ถูกใจโดย Kaevv Ks และคนอื่น ๆ`, caption+`เพิ่มเติม`, carousel `1/3` + `ถัดไป`
- Bottom nav: `ฟีด` `แชท` `กระดานข่าว` `แจ้งเตือน` `โปรไฟล์`
- Member sheet: `เข้าร่วมตึกแดง` `สมัครสมาชิก` `เข้าสู่ระบบ` `ข้ามไปก่อน` `Google` `ไม่ต้องแสดงข้อความนี้อีก`
- Onboarding: `Select your language · เลือกภาษา` `English` `ไทย` `ต่อไป` `ข้าม`, consent toggles + links ครบ

## ข้อจำกัด/ความเสี่ยงที่เหลือ

1. **desc ตาม locale** — ภาษาไทย/อังกฤษให้ desc ต่างกัน → flow ต้องรองรับทั้ง 2 locale (หรือ lock locale ต่อ suite แล้ว map ข้อความ)
2. **toggle state** — label แถว consent เป็น `clickable=false` (text node) ต้องดู node ข้างเคียงสำหรับ switch จริง — probe ละเอียดขึ้นตอนเขียน flow
3. **element ไม่มีข้อความ** — รูปภาพ, indicator, บาง icon อาจต้อง index/bounds fallback
4. **text มี `\n` ปน** (`ยอดเข้าชม&#10;215`, `1/3&#10;4 สัปดาห์ที่แล้ว`) — matching ต้องระวัง
5. เคสที่ต้องเห็นข้อมูล dynamic (ชื่อ user, ตัวเลข) ต้อง match แบบ pattern ไม่ใช่เทียบเต็ม

## ข้อเสนอแนะ framework

**Maestro** — ใช้ desc/text เป็นหลักตรงกับสิ่งที่แอป expose, ไม่ต้องแตะ source, flow YAML map จากขั้นตอน CSV ได้ตรง, รองรับ Flutter ผ่าน semantics ดี
(ถ้า dev เปิด source ให้ Patrol ก็เป็นทางเลือกที่เสถียรกว่า แต่ไม่จำเป็นแล้วตามผล probe)

## Environment ที่ลงไว้บนเครื่องนี้

- JDK 17 (`C:\Program Files\Microsoft\jdk-17.0.21.21-hotspot`)
- Android SDK: `%LOCALAPPDATA%\Android\Sdk` (platform-tools, emulator, API 34 playstore x86_64)
- AVD: `tukdaeng_api34` (Pixel 6 profile)
- adb path: `%LOCALAPPDATA%\Android\Sdk\platform-tools\adb.exe`
- ⚠️ Git Bash: adb commands ต้อง `export MSYS_NO_PATHCONV=1` ไม่งั้น `/sdcard/...` โดนแปลงเป็น Windows path
