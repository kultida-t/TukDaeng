# AUTO-TEST-001 — Prompt สำหรับ Session ถัดไป (ต่อยอดงาน Automate Test แอป FO)

> Mission: 7189b3fd · อัปเดต: 2026-11-06 (หลังปิดงานเตรียม)
> ก๊อป COPY BLOCK ด้านล่างไปวางเปิด session ใหม่ได้เลย — สมบูรณ์ในตัว

---

## COPY BLOCK

```text
ต่อยอดงาน "Automate Test แอป FO บน Play Store" — Mission 7189b3fd ใน kanban
โปรเจกต์ TukDaeng ที่ D:\TukDaeng — เช็ค board เพื่อดู task ที่ in_progress/todo
ล่าสุดก่อนเริ่ม

== สถานะ setup (ทำเสร็จแล้ว ห้ามทำซ้ำ) ==
- JDK 17 ที่ C:\Program Files\Microsoft\jdk-17.0.21.21-hotspot
- Android SDK ที่ %LOCALAPPDATA%\Android\Sdk
  (platform-tools/adb, emulator, image android-34 google_apis_playstore x86_64)
- AVD `tukdaeng_api34` — เปิดด้วย:
  %LOCALAPPDATA%\Android\Sdk\emulator\emulator.exe -avd tukdaeng_api34
- แอป com.univerza.tukdaeng ลงบน emulator + **member login ค้างอยู่**
  (three3.work.test@gmail.com / session refresh token อายุ 90 วัน — reuse ได้
  ไม่ต้อง login ใหม่ทุกรัน สำคัญมากเพราะ rate limit auth 50 ครั้ง/15 นาที/IP)

== การตัดสินใจที่ล็อกแล้ว ==
- Framework = **Maestro** (release build ใช้ Flutter Driver ไม่ได้,
  Flutter Key ไม่ขึ้น UiAutomator2 → ใช้ desc/text selector)
- แอปเป็น Flutter — ไม่มี resource-id แต่ content-desc ครบทุกจุด
- desc เปลี่ยนตาม locale TH/EN → flow เขียนรองรับทั้งคู่หรือ lock locale
- เฟส 1 = Android เท่านั้น (iOS Ready for Distribution แล้ว เฟส 2 ค่อยทำ)

== เอกสารอ้างอิง (อ่านก่อนทำ) ==
- deliverables/AUTO-TEST-001-dev-answers.md — คำตอบ dev ครบ:
  stg API/build, rate limits, OTP ไม่มี test code (อ่าน Gmail IMAP + เช็ค Spam),
  report/block เข้าคิวจริงต้องแจ้ง Dev แก้วทาง LINE ก่อน + unblock ท้ายเคส,
  push notification ยังไม่พร้อมเทส (park), deep link มี tukdaeng://...
- deliverables/AUTO-TEST-001-selector-probe.md — ผล probe + desc ตัวอย่าง
- deliverables/AUTO-TEST-001-triage-01-auth.csv — ต้นแบบ triage (เล่มอื่นทำตาม)
- deliverables/AUTO-TEST-001-findings.md — defect register (เจออะไรเพิ่มใส่ที่นี่)
- deliverables/AUTO-TEST-001-element-request.md — รายการขอ dev ใส่
  Semantics(identifier) → resource-id (ส่งแล้วรอเวอร์ชันถัดไป)

== กติกาเครื่องมือ ==
- adb: %LOCALAPPDATA%\Android\Sdk\platform-tools\adb.exe
- Git Bash: `export MSYS_NO_PATHCONV=1` ก่อนทุก adb command
- dump UI: adb shell uiautomator dump /sdcard/x.xml → adb pull มาอ่าน
- tap: `adb shell input tap cx cy` คำนวณจาก bounds ใน xml
- ⚠️ คีย์บอร์ดเปิดอยู่ทำ layout เลื่อน → พับด้วย keyevent 111 แล้ว dump ใหม่
  ก่อนคำนวณ tap เสมอ
- reset onboarding: adb shell pm clear com.univerza.tukdaeng

== งานของ session นี้ ==
1. ลง WSL2 (admin PowerShell: wsl --install → reboot → Ubuntu setup)
   ใน Ubuntu: ลง JDK17 + Maestro CLI
   (curl -fsSL "https://get.maestro.mobile.dev" | bash)
   เชื่อม adb ฝั่ง Windows ผ่าน /mnt/c/.../platform-tools/adb.exe
2. เขียน PoC Maestro flows (folder ใหม่ เช่น mobile-tests/flows/ + README):
   - flow A: guest feed browse — เปิดแอป (session member ค้างอยู่ ใช้ noReset)
     → feed, สลับ 3 tabs, เปิด post detail
   - flow B: guest gate — pm clear → onboarding → guest → กดแท็บแชท
     → assert gate sheet "เข้าร่วมตึกแดง" + ปิดด้วย scrim/ข้ามไปก่อน
   - flow C: sign in — จาก gate → เข้าสู่ระบบ → กรอก credential → member feed
     (ใช้ credential บัญชีเทสหลัก — เก็บในไฟล์แยก .env ไม่ commit)
   อ้าง TC ID เดิมจาก FO-TEST-001 CSV ใน comment ของแต่ละ flow
3. ถ้าเหลือเวลา: triage เล่ม 02-shell ตามต้นแบบ AUTO-TEST-001-triage-01-auth.csv
   → ออก AUTO-TEST-001-triage-02-shell.csv

== กติกางาน ==
- ทุก flow อ้าง TC ID เดิมจาก deliverables/FO-TEST-001-*-checklist.csv
- เทสเฉพาะบน emulator; บน prod ทำได้เฉพาะ guest/read-only + write ของ
  บัญชีเทสตัวเอง — กลุ่ม report/block/delete เทสบน staging build เท่านั้น
  (APK รอ Dev แก้วส่ง — ถ้าขอแล้วได้มาให้ติดตั้ง package
  com.univerza.tukdaeng.staging คู่กับ prod ได้)
- เจอบั๊ก/ข้อสงสัย → เพิ่มใน deliverables/AUTO-TEST-001-findings.md
- จบชิ้นใหญ่ add_task_note ลง task ที่ทำอยู่ทุกครั้ง; จบ session
  save_session_note; ห้าม move task เป็น done เอง (ผู้ใช้ยืนยันเท่านั้น)
- ห้ามแตะไฟล์/หน้าจอ protected ตาม AGENTS.md
- rate limit: auth 50/15min/IP — reuse session, อย่า login ใหม่ทุก flow
```

---

## หมายเหตุผู้สั่ง

- Pending ฝั่งพี่ (ทำเองทาง LINE หา Dev แก้ว): ส่ง element-request + ขอ staging APK + แจ้ง F-001
- เป้า session นี้: 3 PoC flows รันผ่านจริงบน emulator
