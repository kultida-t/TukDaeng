# mobile-tests — Maestro E2E สำหรับแอป TukDaeng (FO)

Task: ae852ae5 · Mission: 7189b3fd · เริ่ม: 2026-11-06

PoC สำหรับ automate test แอป FO `com.univerza.tukdaeng` (Play Store build) บน Android emulator
ทุก flow อ้าง TC ID จาก `deliverables/FO-TEST-001-*-checklist.csv` ใน comment หัวไฟล์

## ทำไมไม่ใช้ WSL2

แผนเดิมตั้งใจรัน Maestro ผ่าน WSL2 แต่เครื่องนี้ยังไม่ได้ลง WSL และการลงต้องใช้
admin PowerShell + reboot (ฆ่า session กลางทาง) — Maestro มี `maestro.bat` ใน
distribution เดียวกันและทำงานบน Windows ตรง ๆ ได้ จึงใช้ native Windows แทน

- Maestro CLI: `~/maestro-cli/maestro/bin/maestro.bat` (v2.12.1)
  ติดตั้งด้วย `curl -fsSL -o maestro.zip https://github.com/mobile-dev-inc/maestro/releases/latest/download/maestro.zip` + unzip
- JAVA_HOME: `C:\Program Files\Microsoft\jdk-17.0.21.21-hotspot`
- ANDROID_HOME: `C:\Users\mailt\AppData\Local\Android\Sdk` (adb อยู่ใน platform-tools)
- AVD: `tukdaeng_api34` (Pixel 6, API 34 google_apis_playstore x86_64)
- ถ้าอยากย้ายไป WSL ทีหลัง: flows ไม่ผูก platform — ลง WSL+JDK17+Maestro แล้วรันชุดเดิมได้เลย

## Run

```bash
# Git Bash, จาก repo root — env สำหรับ maestro.bat
export MSYS_NO_PATHCONV=1
export JAVA_HOME="C:\Program Files\Microsoft\jdk-17.0.21.21-hotspot"
export ANDROID_HOME="C:\Users\mailt\AppData\Local\Android\Sdk"
export ANDROID_SDK_ROOT="$ANDROID_HOME"
export MAESTRO_CLI_NO_ANALYTICS=1
MAESTRO="$HOME/maestro-cli/maestro/bin/maestro.bat"

# เปิด emulator (ถ้ายังไม่เปิด)
"$ANDROID_HOME/emulator/emulator.exe" -avd tukdaeng_api34 &

# Flow A — feed browse, reuse member session (ไม่ login ใหม่)
"$MAESTRO" test mobile-tests/flows/flow-a-feed-browse.yaml

# Flow B — guest gate (clearState → ลบ session member ทิ้ง!)
"$MAESTRO" test mobile-tests/flows/flow-b-guest-gate.yaml

# Flow C — sign in ด้วยบัญชีเทส (ต้องกรอก mobile-tests/.env ก่อน)
set -a; source mobile-tests/.env; set +a
"$MAESTRO" test mobile-tests/flows/flow-c-sign-in.yaml \
  -e TEST_EMAIL="$TEST_EMAIL" -e TEST_PASSWORD="$TEST_PASSWORD"
```

## Flow inventory

| Flow | ไฟล์ | ครอบคลุม TC | State ที่ต้องการ |
|---|---|---|---|
| A Feed browse | `flows/flow-a-feed-browse.yaml` | SHELL-021/022/035–038, FEED-020/021/025 | member session ค้าง (noReset) |
| B Guest gate | `flows/flow-b-guest-gate.yaml` | SETUP-02/03, GATE-019/024/027/028/029, SHELL-023 | fresh (clearState) |
| C Sign in | `flows/flow-c-sign-in.yaml` | SETUP-04, AUTH-044/045, GATE-019/031 | fresh + .env credentials |
| D Guest gate deep | `flows/flow-d-guest-gate-deep.yaml` | GATE-019/024/025/026/027/028/029/030/031/032(cancel)/033/034/041/042/049/055(TH) | fresh (clearState) |
| E Search guest | `flows/flow-e-search-guest.yaml` | SETUP-05, SRCH-001/002/005/006/007/010/011/016/017/019/029/030/033/040/045/046/048/050/051/055/056/058/059/060, GATE-011/015/043 | fresh (clearState) |
| F Member + sign out | `flows/flow-f-member-signout.yaml` | SETUP-04, GATE-001B/005B/035/050(บางส่วน) | fresh + .env credentials |
| G Guest free-browse | `flows/flow-g-guest-browse.yaml` | GATE-044/045/046/047/048 + GATE-002/009/010/013/017/018 spot legs (F-012/013/014 encode actual) | fresh (clearState) |
| subflow onboarding | `flows/subflows/onboarding-to-guest.yaml` | SETUP-02/03 | fresh |
| subflow sign in | `flows/subflows/gate-sheet-sign-in.yaml` | AUTH-044/045 | member sheet เปิดอยู่ |

## ข้อเท็จจริงใหม่จาก session 2026-11-06 (รอบ 2)

- **action row ของโพสต์ขยับตาม scroll** — ห้าม point tap ถูกใจ/แชร์/บันทึก/⋯
  ใช้ `scrollUntilVisible` + `tapOn text` เสมอ (nav ยัง point tap เหมือนเดิม)
- **like toggle assert ได้** — desc เปลี่ยน `ถูกใจ` ↔ `เลิกถูกใจ`
- **member ⋯ menu** = `ไม่สนใจ` + `รายงาน` · **save** = collection picker
  (`คอลเลกชัน`/`คอลเลกชันใหม่`/`บันทึกแล้ว·ส่วนตัว`) · **share** = in-app sheet
  (`Direct`/`Facebook`/`LINE`/`Messenger`/`คัดลอกลิ้ง`)
- **sign out path**: profile tab (86%,93%) → burger (93%,8%) → scroll ลง →
  `ออกจากระบบ` → dialog `ออกจากระบบหรือไม่?` → ยืนยัน `^ออกจากระบบ$`
- **typing state ของ search จำ query เดิม** — ต้อง clear-X (76%,8%) + refocus
  (40%,8%) ก่อนพิมพ์ทุกครั้ง · search icon = 17%,8% · bell = 80%,8% ·
  filter = 92%,8% (header icons ไม่มี desc)
- **price ceiling = ฿2,000,000** (SRCH-046 error `ราคาสูงสุดต้องไม่เกิน`)
- **launchApp ไม่ guarantee landing** — re-prompt sheet เด้งทุกครั้งที่ยังไม่
  tick Don't show → ต้อง `extendedWaitUntil` sheet ก่อนเสมอ อย่าใช้
  `when: visible` เช็คทันที (race: sheet ขึ้นช้ากว่า check)
- **member sheet modal** — point tap โซน nav ขณะ sheet เปิดโดนปุ่ม sheet
  (68%,93% = ปุ่ม Google → เปิด provider UI); scrim = โซนบน ~40%
  (y<914/2337) ปุ่ม sheet อยู่ล่าง ~60% (ย≈1943+) — ห้าม point tap ขณะเปิด
- **nav items มี text desc** (`ฟีด` `แชท` `กระดานข่าว` `แจ้งเตือน` `โปรไฟล์`)
  `tapOn text` ได้ — แต่ bar auto-hide ตอน scroll ลง → tap ตอนเพิ่ง land
  หรือ swipe DOWN สั้นให้ bar กลับมาก่อน · feed=11% chat=32% board=50%
  alerts=68% profile=86% (y~93%)
- **back จาก feed ออกแอปเลย** (feed = root) — ห้าม pressKey back เกินบน feed;
  back จาก external app (Chrome) ไม่กลับ TukDaeng ตรง ๆ ด้วย
- **board verified labels**: head `TUK DAENG | กระดานข่าว` · burger ~8%,8%
  (categories sheet `หมวดหมู่`+`ปิด`) · magnifier ~92%,8% (`ค้นหา` + chips
  `หัวข้อยอดนิยม` → `N ผลลัพธ์ สำหรับ "q"`) · `อ่านต่อ` ·
  `บทความล่าสุด\nดูทั้งหมด` (desc เดียว) · rows `cat\ntitle\nอ่าน N นาที`
  · end note `คุณดูครบทั้งหมดแล้ว` · pills `ทั้งหมด/ตลาดนาฬิกา/Rolex/...`
- **article detail**: floating pills ไม่มี desc — back ~9%,8% · like
  ~75%,8% · share ~83%,8% · ⋯ ~90%,8% (Maestro point = whole % เท่านั้น)
  · author `ผู้เขียน\nTuk Daeng` · like/share ตอน guest = F-012 actual
  (optimistic +1 revert / dead no-op) · ⋯ → report sheet เปิดไม่ gate
  (F-013 — ห้ามกด ส่งรายงาน)
- **post viewer จาก grid tile**: head `โพสต์` + `ติดตาม` pill · comments
  sheet guest: `เพิ่มความคิดเห็น...` input → gate · likes sheet guest:
  `ยอดถูกใจ` + rows `name\nติดตาม` + hideCounts note `มีเพียง…สามารถดูจำนวน`
- **public profile read**: stats `N ผู้ติดตาม`/`N กำลังติดตาม` tap ได้ →
  followers list free (rows + ติดตาม ต่อแถว) · avatar → overlay
  `ติดตาม/แชร์/คัดลอกลิงก์/คิวอาร์โค้ด` (shell ฟรี actions gate)
- **legal links บนหน้า auth → Chrome ภายนอก** (F-014) — ห้าม tap ใน flow
  (ออกนอกแอป flow พัง) assert แค่ presence

## กติกาที่ล็อกแล้ว (อ้าง deliverables/AUTO-TEST-001-*)

- **Flutter app — ไม่มี resource-id** locator ใช้ `text:` (match content-desc) เท่านั้น
- **desc ตาม locale** — selector ทุกจุดเป็น regex สองภาษา `"th|en"`; onboarding subflow lock ภาษาไทยไว้
- **Session member ค้าง 90 วัน** (refresh token) — flow A ใช้ `launchApp` เปล่า ๆ reuse session
  เพราะ auth rate limit 50 ครั้ง/15 นาที/IP → อย่ารัน flow C ซ้ำเกินจำเป็น
- **`clearState: true` = `pm clear`** — ใช้ใน flow B/C เท่านั้น (ฆ่า session member)
- **Prod = read-only + guest + write ของบัญชีเทสตัวเองเท่านั้น** — report/block/delete
  เทสบน staging build (`com.univerza.tukdaeng.staging`, APK รอ Dev แก้วส่ง)
- bottom nav zone ทับ element แถวล่างจอ — ใช้ `scrollUntilVisible` ก่อน tap เสมอ
- หา bug → ลง `deliverables/AUTO-TEST-001-findings.md`
