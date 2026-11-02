# FO Dev Update Package — 2026-11-02

> ชุดอัปเดตส่งต่อให้ Dev ให้ implement ตรงกัน — ครอบคลุมทุกการเปลี่ยนแปลงหลัง handoff ชุดล่าสุดวันที่ **26 ตุลาคม 2569**
> Baseline ปัจจุบัน: **FO-PRD-v1.10** (Release 2026-10-30) · Source of truth ภาพรวม = `Prototypes/fo-flow/index.html` + spec `FrontOffice/` + เคส `deliverables/FO-TEST-001-*`

## 0. ภาพรวมสั้น ๆ

หลังส่งชุด 26 ต.ค. ทีมทำ 3 เรื่องใหญ่: (1) สร้างชุด Test Case ฝั่ง FO ทั้งระบบ **FO-TEST-001** เล่ม 00–19 ครบ พร้อม traceability/decision register, (2) ล็อกการตัดสินใจพฤติกรรมแอปชุดใหญ่ **DEC-13…DEC-41** ตามมาตรฐาน IG และ sync ลง spec/prototype ครบ, (3) bump baseline spec เป็น **FO-PRD-v1.10** — dev ใช้เอกสารชุดนี้เป็นเป้าหมาย implement/เทียบผลเทสได้เลย

## 1. Source of Truth ที่ dev ต้องยึด

| ชุด | Path | บทบาท |
|---|---|---|
| Spec (canonical) | `FrontOffice/*.md` (baseline `FO-PRD-v1.10`) | พฤติกรรม/contract ของทุก module |
| Prototype (SoT ภาพ/flow) | `Prototypes/fo-flow/index.html` | reference ภาพ+interaction ที่ล็อกแล้ว |
| Test Case | `deliverables/FO-TEST-001-00…19` (+ `-checklist.csv`) | เคสทดสอบบน **build จริง** 1,619 TC + 195 SETUP rows |
| Traceability | `deliverables/FO-TEST-001-20-traceability.md` | map เคส ↔ spec AC/feature |
| Decision Register | `deliverables/FO-TEST-001-22-decision-register.md` | DEC-01…41 (ของใหม่ในชุดนี้ DEC-13…41) |
| Diagram | `deliverables/FO-DIAG-001-fo-app-diagrams.md` | ภาพรวม flow ของแอป |

## 2. ของใหม่: ชุด Test Case FO-TEST-001 (ทั้งระบบ)

สร้างเสร็จ 27–29 ต.ค. — ครอบคลุมทุก module ฝั่ง FO:

- เล่ม 01–19: auth, shell, feed, search, create, viewer-detail, sheets, chat, board, alerts, watchalert, profile, portfolio, library, settings, report/block, guest-gate, e2e, lang-theme — แต่ละเล่มมี `-checklist.csv` คู่สำหรับรัน manual
- `FO-TEST-001-00-inventory.md` — inventory ฟีเจอร์/หน้าจอทั้งหมด
- `FO-TEST-001-20-traceability.md` — เคสรวม **1,619** (High 808 / Medium 691 / Low 120) + SETUP 195 แถว
- `FO-TEST-001-task-breakdown.md` + `FO-DIAG-001` + `FO-TEST-001-SPEC-CHECK-batch-A.md` + `FO-TEST-001-SPEC-CHECK-batch-B2-C2.md` + `FO-TEST-001-CONSOLIDATED-IG-decisions-and-backlog.md` + `FO-TEST-001-LEGAL-TH-draft.md`
- หมายเหตุ: เคสทั้งหมดเขียนสำหรับ **build/implement จริง** (ไม่ใช่เทส prototype) — Result ว่างทุกเคสรอรันบน build

## 3. Spec ที่อัปเดต (sync เป็น FO-PRD-v1.10)

แก้ทั้งชุด `FrontOffice/` ให้ตรง prototype + decisions:

- ทุก module spec `00`–`17` (GLOBAL, NAV, AUTH, FEED, SEARCH, ASSET x2, PROFILE, CHAT, NOTIFICATION, WATCH ALERT, SOCIAL, BOARD, SETTINGS, PORTFOLIO, TRUST, INTEGRATIONS, NFR) — sync เนื้อหา + bump stamp v1.10
- `09_NOTIFICATION_MODULE.md` — **ถอน `system` type ออกทั้งประเภท** (เหลือ like/comment/follow/watch); AC-NOTI-013 เปลี่ยนเป็น guard "ห้ามมี system row"
- `06_PROFILE_MODULE.md` — contract lock: state server-backed + DM/QR/picker จริง; following/follower rows มีปุ่ม Chat
- `13_SETTINGS_MODULE.md` §9 — canonical Change Password (re-auth ด้วย current password)
- `00_GLOBAL/01_AUTH` — consent copy + analytics gating (v1.10), legal consent ≠ privacy consent, renumber `AC-AUTH-031`→`AC-AUTH-001A`
- เอกสารกลาง: `PRD.md`, `FO_Functional_PRD.md`, `TukDaeng_Master_Product_Definition.md`, `Use_Cases.md`, `README_MODULE_INDEX.md`, `QA_TEST_SCENARIO_CHECKLIST.md`, `DEV_IMPLEMENTATION_CHECKLIST.md`, `DEV_BASELINE_HANDOFF_2026-06-22.md`, `ERROR_STATE_UI_COPY_CATALOG.md`, `DOCUMENT_VERSION.md`, `FINAL_HANDOFF_SUMMARY.md`

## 4. Prototype fo-flow ที่เปลี่ยน (reference ภาพจริง)

- Feed/Viewer แบบ IG: pagination, carousel swipe หยุดปลาย + double-tap like, pull-to-refresh, viewer carousel เหมือน feed, comment flat thread + composer, scroll-to-hide header
- Search: recents persist ข้ามเปิดแอป, tag/hashtag กรอง ni/muted/blocked, เปิดใหม่ = landing, suggestion/recent rows ไม่แสดง `N listings`
- ภาษา: แปลไทยเต็มระดับทั้งแอป (ยกเว้น UGC/proper nouns), หน่วยเงิน `฿{n}`+comma ทั้ง TH/EN
- Alerts: เอา system row "new device login" + toast/ไอคอน/code ที่เกี่ยวออก — เหลือ 4 types
- Profile: following/follower rows มีปุ่ม Chat; status tag SOLD/HIDDEN ตาม pfKind
- Chat: share โพสต์เข้าห้องแชทจริง, message request folder สำหรับคนที่ไม่ได้ตาม, ไม่จัดกลุ่ม gallery ตามวัน

## 5. Decisions ใหม่ที่ dev ต้อง implement (DEC-13…41)

| DEC | สาระ | DEC | สาระ |
|---|---|---|---|
| 13 | Feed pagination | 28 | Block state server-backed ข้ามเครื่อง/sign-out |
| 14 | Carousel หยุดปลาย + double-tap like | 29 | Legal TH ใช้ draft เป็น placeholder (เนื้อหาจริงอยู่ระบบอื่น) |
| 15 | Pull-to-refresh | 30 | ชุดแก้ batch A (ดู SPEC-CHECK-batch-A §16) |
| 16 | Viewer carousel เหมือน feed | 33 | own following/follower rows มีปุ่ม Chat |
| 17 | Comment flat thread + composer ใน V1 | 34 | ตรวจ batch B2/C2 739 เคสผ่าน (ALT-075 ยึด offline-with-cache) |
| 18 | Feed scroll-to-hide | 35 | `฿{n}`+comma ทั้ง TH/EN |
| 19 | แปลไทยเต็มระดับ (ยกเว้น UGC) | 36 | Suggestion/Recent rows ไม่แสดง `N listings` |
| 20 | Share post เข้าห้องแชทจริง | 37 | `AC-AUTH-031`→`AC-AUTH-001A` |
| 21 | Status tag ตาม pfKind (SOLD/HIDDEN) | 38 | Change Password canonical = 13_SETTINGS §9 |
| 22 | Search recents persist บนเครื่อง | 39 | legal consent ≠ privacy consent |
| 23 | Tag/hashtag กรอง ni/muted/blocked | 40 | ปิด batch A + citation sweep |
| 24 | เปิด search ใหม่ = landing ล้าง state | 41 | **ถอน `system` notification type ออกจาก V1 ทั้งประเภท** (supersede DEC-32) |
| 25 | ชุด IG-standard A1–A27 (alerts/board tabs/chat/profile/errors) | | |
| 26 | ตัดออกจาก V1: system new-device login (ALT-070), self-match notify (WA-054) | | |
| 27 | C1–C6: ไม่ group gallery ตามวัน · msg request folder · board deep link+native share · batch C scope | | |

## 6. สิ่งที่เปลี่ยนจากชุดเดิม — dev อย่าทำตามของเก่า

- **Alerts เหลือ 4 types เท่านั้น** (like/comment/follow/watch) — ไม่มี system/security row, ไม่มี placeholder destination
- ไม่มี system new-device login generation, ไม่มี WA self-match notification
- Chat gallery ไม่จัดกลุ่มตามวัน; ข้อความจาก non-follower เข้า message Requests folder
- `system` type มีบทบาทเดียวในสเปคคือ negative guard (ห้ามปรากฏใน feed)

## 7. หมายเหตุขอบเขต

- เคสทั้งหมดรอรันบน build จริง — Result ว่าง; จุด regression เสี่ยงอยู่ในเล่ม 19 (LANG-045 EN-hardcode sweep)
- Legal/Terms/Privacy เนื้อหาภาษาไทยฉบับจริงปรับในระบบอื่นแล้วดึงมาแสดง — draft ใน repo เป็นตัวอย่างเท่านั้น
- เอกสาร historical (`deliverables/fo-spec-sync/FSP-*`, รายงาน audit เก่า) คงเดิมเป็นบันทึกย้อนหลัง
- การเปลี่ยนเอกสาร/เครื่องมือภายใน (skills, AGENTS) ไม่เกี่ยวกับ dev scope

## 8. Commit อ้างอิง (หลัง 26 ต.ค.)

```
e589ae2 27/10 FO-TEST-001 manual test suite (books 00–09)
1365012 28/10 sync specs+evidence เป็น FO-PRD-v1.9
b545da4 28/10 เคส 00–09 convert เป็น real-app test versions
fc94ce6 28/10 fo-flow align locked specs
7de231e 29/10 PROFILE contract lock (server-backed + DM/QR/picker)
447e946 29/10 เคส 10–19 + prototype audit evidence ครบ
38e5603 30/10 FO-PRD-v1.10 baseline + batch A amendments
cff801e 02/11 fo-flow align DEC-13..17/19/22/25/35/36
16cc8b3 02/11 DEC-37..41 — ถอน system alert type (เล่ม 10 เหลือ 76 เคส, รวม 1,619)
```
