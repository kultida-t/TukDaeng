ต่อยอดงาน "Automate Test แอป FO บน Play Store" — Mission 7189b3fd ใน kanban
โปรเจกต์ TukDaeng ที่ D:\TukDaeng — เช็ค board เพื่อดู task ที่ in_progress/todo ล่าสุดก่อนเริ่ม

== สถานะล่าสุด (2026-11-06 รอบเย็น — commit ee45a5a · task 099ad65c in_progress) ==
- PoC suite = 6 flows เขียวครบ: A feed-browse / B guest-gate / C sign-in /
  D guest-gate-deep / E search-guest / F member+sign-out (+ 2 subflows)
- Triage matrix ครบ 19 เล่ม 1,832 TC (auto 389 / semi 1,346 / manual 97)
- Findings เปิดอยู่ F-002..F-011: ruling อนุมัติแล้ว — F-007/F-011 = บั๊ก dev
  (copy block + bug-list file AUTO-TEST-001-bug-report-F007-F011.md พร้อมส่ง)
  F-008/009/010 = ปรับ spec ฝั่ง QA (งานแรก session นี้)
- member session ตอนนี้ถูก sign-out แล้ว (flow-f จบด้วย logout) — emulator = guest

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
- Flutter ไม่มี resource-id → desc/text regex "th|en"
- bottom nav point tap: chat~32% board~50% alerts~68% profile~86% (y~93%)
- coach-mark กิน tap แรก → tap "ทั้งหมด" ทิ้งก่อน · member sheet เด้งทุก launchApp
  (ไม่ติ๊ก Don't show) → ต้อง extendedWaitUntil sheet ก่อนเสมอ (when:visible = race)
- EditText กรอกผ่าน tap hintText · ห้าม env:"" ใน flow · auth limit 50/15min/IP
- post action row ขยับตาม scroll → scrollUntilVisible + tapOn text เท่านั้น
- like toggle: desc "ถูกใจ"↔"เลิกถูกใจ" assert ได้
- member sheet modal: point tap โซน nav ขณะเปิดโดนปุ่ม sheet (68% = Google)
- search: icon 17%,8% · bell 80%,8% · filter 92%,8% · clear-X 76%,8% · refocus 40%,8%
  typing state จำ query เดิม → clear-X ก่อนพิมพ์เสมอ
- price ceiling ฿2,000,000 · sign-out: profile tab → burger 93%,8% → ออกจากระบบ → dialog

== งาน session ถัดไป (เรียงลำดับ — พี่อนุมัติ ruling แล้ว 2026-11-06) ==
1. ปรับ spec/prototype test case ตาม QA ruling ที่พี่อนุมัติ:
   - F-008: แก้ GATE-042 → Following/Favorites = gated entry (expected = Member Sheet)
     · อัปเดต checklist FO-TEST-001-17 + triage-17 + flow-d comment (เอา F-008 marker ออก)
   - F-009: แก้ GATE-033 tail → action gate หลัง Don't-show = sheet หรือ full sign-in page ก็ได้
     · อัปเดต checklist/triage/flow-d comment
   - F-010: แก้ GATE-015 → bookmark shortcut = gated entry (ไม่เปิด saved hub ว่าง)
     · อัปเดต checklist/triage/flow-e comment
   - F-007 + F-011 = บั๊ก dev ต้องแก้ — copy block ส่ง Dev แก้วทาง LINE อยู่ใน
     session ก่อน (chat 2026-11-06 เย็น) · เปลี่ยนสถานะเป็น REPORTED เมื่อพี่ส่งแล้ว
   - flow asserts ที่เขียนตาม actual เดี๋ยวนี้ถูกแล้วกับ spec ใหม่ → ปรับ comment
     เลิกอ้าง F-008/009/010; F-007/F-011 คง assert actual ไว้เป็น signal จน dev fix
2. ขยาย coverage ต่อ: board/article read (GATE-044), viewer/detail read (045),
   public profile read (046), legal viewer (047), free-browse sweep (048),
   เล่มอื่นที่ auto ได้บน guest (feed detail/viewer เล่ม 06/07)
3. รอ staging APK จาก Dev แก้ว → report/block/delete บน staging เท่านั้น
4. ติดตามผล fix: F-005 (reset validator), F-006 (profile spinner), F-007/F-011
5. verify F-002/F-003/F-004 + TalkBack บนเครื่องจริงเมื่อมี
6. Blocker ที่ต้องขอ: บัญชี ACCT-2 (social/chat/alerts/e2e), media gallery

== กติกา ==
- prod เฉพาะ guest/read-only + write ของบัญชีเทสตัวเอง · report/block/delete บน staging
- เจอบั๊ก → deliverables/AUTO-TEST-001-findings.md (F-012 ถัดไป)
- จบชิ้นใหญ่ add_task_note · จบ session save_session_note · ห้าม move task done เอง
- ห้ามแตะ protected screens ตาม AGENTS.md · credential เทสต้องจดทันที
