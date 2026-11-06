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
| subflow onboarding | `flows/subflows/onboarding-to-guest.yaml` | SETUP-02/03 | fresh |
| subflow sign in | `flows/subflows/gate-sheet-sign-in.yaml` | AUTH-044/045 | member sheet เปิดอยู่ |

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
