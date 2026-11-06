ต่อยอดงาน "Automate Test แอป FO บน Play Store" — Mission 7189b3fd ใน kanban
โปรเจกต์ TukDaeng ที่ D:\TukDaeng — เช็ค board เพื่อดู task ที่ in_progress/todo ล่าสุดก่อนเริ่ม

== สถานะล่าสุด (2026-11-06 ปิด task a368e0db) ==
- Triage matrix ครบทั้ง 19 เล่มแล้ว: deliverables/AUTO-TEST-001-triage-01..19-*.csv
  รวม 1,832 rows — auto 389 / semi 1,346 / manual 97
- F-001 CLOSED: manual signup tukdaengworktest@gmail.com + worktest1234 → sign in ผ่าน
  (ต้นตอ = input พิมพ์เพี้ยนรอบแรก ไม่ใช่ backend)
- F-005 reframe: canonical rule = ≥8 + เลข/อักขระ (ตรง prototype fo-flow/index.html :24397/:22108)
  ตัวเบี้ยว = reset form ลิงก์อีเมลบังคับเข้มกว่า — dev ยึด prototype เป็น source of truth
  เพิ่ม AUTH-105 ใน checklist + triage ครอบ reset-form แล้ว
- F-006 NEW+CONFIRMED: own profile บัญชีใหม่โหลดค้าง (spinner ไม่จบ) — รอ dev ตรวจ
- ส่ง dev reply กลับแล้ว (deliverables/AUTO-TEST-001-reply-F001-F005.md เก็บไว้)

== setup (ทำเสร็จแล้ว ห้ามทำซ้ำ) ==
- JDK 17: C:\Program Files\Microsoft\jdk-17.0.21.21-hotspot
- Android SDK: %LOCALAPPDATA%\Android\Sdk · AVD: tukdaeng_api34
- Maestro v2.12.1: ~/maestro-cli/maestro/bin/maestro.bat (Windows ตรง ไม่ต้อง WSL)
  env (Git Bash): export MSYS_NO_PATHCONV=1
    export JAVA_HOME="C:\Program Files\Microsoft\jdk-17.0.21.21-hotspot"
    export ANDROID_HOME="C:\Users\mailt\AppData\Local\Android\Sdk"
    export ANDROID_SDK_ROOT="$ANDROID_HOME" && export MAESTRO_CLI_NO_ANALYTICS=1
  รัน: "$HOME/maestro-cli/maestro/bin/maestro.bat" test <flow.yaml>
- แอป com.univerza.tukdaeng · บัญชีหลัก three3.work.test@gmail.com / Worktest1234*
  (ห้าม delete · จดที่ mobile-tests/.env) · บัญชีใหม่ tukdaengworktest@gmail.com / worktest1234
- Appium 2.x + UiAutomator2 พร้อม (ใน AppData npm) ถ้า Maestro ไม่พอ

== ข้อเท็จจริงที่ล็อก (เล่มก่อน) ==
- Flutter ไม่มี resource-id → desc/text regex "th|en"
- bottom nav tap point: chat~32% board~50% alerts~68% (y~93%)
- coach-mark กิน tap แรก → tap "ทั้งหมด" ทิ้งก่อน · member sheet เด้งทุก launchApp → dismiss ก่อน assert
- EditText กรอกผ่าน tap hintText · ห้าม env:"" ใน flow · auth limit 50/15min/IP
- sign-in lock 5 ครั้ง เปิดหน้าใหม่นับใหม่

== งาน session ถัดไป (เรียงความสำคัญ) ==
1. ขยาย PoC flows ตาม triage: เล่ม 17 guest-gate มี auto 25 เคสพร้อมเขียนสุด
   (gate sheet anatomy, dismiss paths, Don't-show flag, free-browse sweeps)
   + search guest / member post actions / sign-out — ทุก flow อ้าง TC ID เดิม
2. รอ staging APK จาก Dev แก้ว (แจ้งทาง LINE) → เทส report/block/delete บน staging เท่านั้น
3. ติดตามผล dev: F-005 (reset validator fix), F-006 (profile spinner), F-001/F-005 ตาม reply
4. verify F-002/F-003/F-004 บนเครื่องจริง + TalkBack เมื่อมีเครื่อง
5. Blocker ที่ต้องขอเพิ่ม: บัญชี ACCT-2 (เคส social/chat/alerts/e2e จำนวนมาก), media gallery

== กติกา ==
- prod เฉพาะ guest/read-only + write ของบัญชีเทสตัวเอง · report/block/delete บน staging
- เจอบั๊ก → deliverables/AUTO-TEST-001-findings.md (F-007 ถัดไป)
- จบชิ้นใหญ่ add_task_note · จบ session save_session_note · ห้าม move task done เอง
- ห้ามแตะ protected screens ตาม AGENTS.md · credential เทสต้องจดทันที
