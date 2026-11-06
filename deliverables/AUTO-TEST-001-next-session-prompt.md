ต่อยอดงาน "Automate Test แอป FO บน Play Store" — Mission 7189b3fd ใน kanban
โปรเจกต์ TukDaeng ที่ D:\TukDaeng — เช็ค board เพื่อดู task ที่ in_progress/todo ล่าสุดก่อนเริ่ม

== สถานะล่าสุด (2026-11-06 รอบค่ำ — commit 96a057f · task 099ad65c in_progress) ==
- PoC suite = 7 flows (G เขียวครบ 2026-11-06 รอบค่ำ): A feed-browse / B guest-gate / C sign-in /
  D guest-gate-deep / E search-guest / F member+sign-out / G guest-free-browse
  (+ 2 subflows)
- Spec adjustments F-008/009/010 ลงเอกสารครบแล้ว (checklist-17/md/triage-17/
  traceability + flow-d/e comments เลิกอ้าง F-xxx)
- Findings ใหม่รอ ruling: F-012 (article like optimistic no-gate + share dead
  no-op — น่าจะ dev bug), F-013 (⋯ → รายงานบทความ entry เปิด sheet เต็มไม่ gate
  — spec ว่า contract-only V1 · gate hole), F-014 (legal links → Chrome ภายนอก
  ไม่ใช่ in-app viewer — น่าจะปรับ spec เป็น external browser)
- F-007/F-011 = บั๊ก dev อนุมัติแล้ว รอพี่ส่ง LINE (copy block ใน
  AUTO-TEST-001-bug-report-F007-F011.md) · เปลี่ยน REPORTED เมื่อส่งแล้ว
- emulator เคยดับกลางรัน (host killed) — boot กลับแล้ว; รัน flow-g ซ้ำล่าสุด
  กำลัง verify tail ที่แก้ (scrollUntilVisible UP + conditional back pattern)

== setup (ทำเสร็จแล้ว ห้ามทำซ้ำ) ==
- JDK 17: C:\Program Files\Microsoft\jdk-17.0.21.21-hotspot
- Android SDK: %LOCALAPPDATA%\Android\Sdk · AVD: tukdaeng_api34
- Maestro v2.12.1: ~/maestro-cli/maestro/bin/maestro.bat (Windows ตรง)
  env (Git Bash): export MSYS_NO_PATHCONV=1
    export JAVA_HOME="C:\Program Files\Microsoft\jdk-17.0.21.21-hotspot"
    export ANDROID_HOME="C:\Users\mailt\AppData\Local\Android\Sdk"
    export ANDROID_SDK_ROOT="$ANDROID_HOME" && export MAESTRO_CLI_NO_ANALYTICS=1
  รัน: "$HOME/maestro-cli/maestro/bin/maestro.bat" test <flow.yaml>
- แอป com.univerza.tukdaeng · บัญชีหลัก three3.work.test@gmail.com / Worktest1234*
  (ห้าม delete · mobile-tests/.env) · บัญชีใหม่ tukdaengworktest@gmail.com / worktest1234

== ข้อเท็จจริงที่ล็อก ==
- Flutter ไม่มี resource-id → desc/text regex "th|en" · point = whole % เท่านั้น
- nav items มี text desc (ฟีด/แชท/กระดานข่าว/แจ้งเตือน/โปรไฟล์) แต่ auto-hide
  ตอน scroll ลง → tap ตอนเพิ่ง land หรือ swipe DOWN สั้นให้ bar กลับมา
  feed=11% chat=32% board=50% alerts=68% profile=86% (y~93%)
- back จาก feed/board-home ออกแอปเลย · back จาก external app ไม่กลับแอปตรง
  → ใช้ conditional back pattern: pressKey back + runFlow-when-marker
- coach-mark กิน tap แรก → tap "ทั้งหมด" ทิ้งก่อน · member sheet เด้งทุก launchApp
  (ไม่ติ๊ก Don't show) → ต้อง extendedWaitUntil sheet ก่อนเสมอ (when:visible = race)
- member sheet scrim = บน ~40% (y<914/2337) ปุ่ม sheet อยู่ล่าง ~60%
- EditText กรอกผ่าน tap hintText · ห้าม env:"" ใน flow · auth limit 50/15min/IP
- post action row ขยับตาม scroll → scrollUntilVisible + tapOn text เท่านั้น
- search: icon 17%,8% · bell 80%,8% · filter 92%,8% · clear-X 76%,8% · refocus 40%,8%
- board: head `TUK DAENG | กระดานข่าว` · burger ~8%,8% · magnifier ~92%,8%
  · `อ่านต่อ` · `บทความล่าสุด\nดูทั้งหมด` (desc เดียว → tap point ~86%,67%
  ขวาสุดเท่านั้นที่ work) · end note `คุณดูครบทั้งหมดแล้ว`
- article pills ไม่มี desc: back ~9%,8% · like ~75%,8% · share ~83%,8% · ⋯ ~90%,8%
- price ceiling ฿2,000,000 · sign-out: profile tab → burger 93%,8% → ออกจากระบบ

== งาน session ถัดไป (เรียงลำดับ) ==
1. รัน flow-g ซ้ำกันพลาด (emulator ต้องพ้น notification shade หลัง boot — ถ้า launch ไม่ขึ้นให้ `cmd statusbar collapse` + HOME ก่อน)
2. ruling F-012/F-013/F-014: เสนอหนู = F-012/013 dev bug (gate ต้องยิงก่อน
   handler + report entry ต้อง gate หรือถอด), F-014 spec-adjust (external
   browser OK ถ้า dev ยืนยัน) → รวม copy block ส่ง Dev แก้วชุดเดียวกับ
   F-007/F-011 (อัปเดต bug-report file ก่อนส่ง)
3. ขยาย coverage ต่อ: viewer/detail เล่ม 06/07 autos ที่เหลือบน guest,
   GATE-047 leg ถ้า dev บอก legal เป็น external by design ก็ปรับ checklist
4. รอ staging APK จาก Dev แก้ว → report/block/delete บน staging เท่านั้น
5. ติดตามผล fix: F-005 (reset validator), F-006 (profile spinner), F-007/F-011
6. verify F-002/F-003/F-004 + TalkBack บนเครื่องจริงเมื่อมี
7. Blocker ที่ต้องขอ: บัญชี ACCT-2 (social/chat/alerts/e2e), media gallery

== กติกา ==
- prod เฉพาะ guest/read-only + write ของบัญชีเทสตัวเอง · report/block/delete บน staging
- เจอบั๊ก → deliverables/AUTO-TEST-001-findings.md (F-015 ถัดไป)
- จบชิ้นใหญ่ add_task_note · จบ session save_session_note · ห้าม move task done เอง
- ห้ามแตะ protected screens ตาม AGENTS.md · credential เทสต้องจดทันที
