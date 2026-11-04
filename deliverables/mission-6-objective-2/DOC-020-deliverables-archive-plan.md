# DOC-020 — Deliverables Audit + Archive Plan (draft รอ approve)

> **Task:** DOC-020 `6c5d1ac9` — Mission 6 `31829e57` Objective 2 (Deliverables Archive)
> **Date:** 2026-11-04 · **Type:** Audit + plan — **สถานะ: ✅ approved โดยพี่มาเต็ม 2026-11-04** (§9) → พร้อมให้ DOC-021 execute
> **หลักการ mission:** fact อยู่ที่เดียว ที่อื่นชี้ reference · ห้ามลบเอกสาร — ย้าย/mark legacy เท่านั้น
> **Out of scope:** `DailyLogs/`, `SourceInputs/`, prototype/protected screens, เล่มเทส `FO-TEST-001-*`

---

## 1. สภาพปัจจุบัน

- `deliverables/` = 705 tracked files ≈ 238 MB · root มี ~146 entries (ไฟล์ ~74 + โฟลเดอร์ ~63 + zip 4 + อื่น ๆ)
- Convention ปัจจุบัน (จาก skills): หลักฐานใหม่ตกลงที่ root เสมอ — `mission-<N>-objective-<M>/` (งาน mission) และ `task-<TASK-CODE>/` (งาน standalone) ตาม `work-summary` + `submission-evidence` skills → archive ต้องไม่ทำลาย convention นี้
- ทุกไฟล์ tracked ใน git → ย้ายด้วย `git mv` ได้ (ไม่ใช่ไฟล์ที่ regenerate อัตโนมัติ)

## 2. Inventory แยกประเภท

| ประเภท | รายการ | จำนวน |
|---|---|---|
| Evidence bundles — task | `task-*/` (NAV-008..017, CHAT-007..009, FEED-025/026, AUTH-002/003, BO-QA-IMPL-026..028, FOBO-* ×5, GUEST-001, FONT-001, I18N-001, MONEY-001, FO-CURRENCY, REPORT-FIX, f2f1934f, 28d3b1c9, 3d2b6f50, 45c27755, 716b8972) | 36 dirs |
| Evidence bundles — mission | `mission-1-obj1-contract`, `mission-1-obj4-verification`, `mission-2-obj4-verification`, `mission-2-objective-2`, `mission-3-objective-1..5`, `mission-4-objective-1..2`, `mission-fa6c030e-obj3-acceptance`, `mission-umn-review-obj1` (+ `.zip` ×4 คู่ bundle) | 13 dirs + 4 zips |
| Evidence bundles — audit wave | `bo-prototype-audit-objective-1..5` | 5 dirs |
| Evidence bundles — active mission | `mission-6-objective-1` (DOC-010/011 วันนี้), `mission-6-objective-2` (task นี้) | 2 dirs |
| AIL evidence (loose) | `AIL-014`, `AIL-016`, `AIL-017` ×2, `AIL-018-019`, `AIL-029-030`, `AIL-029a`, `AIL-030`, `AIL-031`, `AIL-032` ×2 | 11 files |
| Audit reports (loose) | `FO-BO-001-coverage-audit.md`, `BO-TEST-COVERAGE-AUDIT.md`, `FO-PROTO-f2f1934f-report.md`, `FO-TEST-AUDIT-*` ×2, `FEED-027-manual-review-checklist.txt` | 6 files |
| เล่มเทส FO-TEST-001-* | spec .md ×20 + checklist .csv ×19 + SPEC-CHECK ×4 + inventory/task-breakdown/traceability/decision-register/LEGAL-TH/CONSOLIDATED/testcase-prompt/FO-TEST-AUDIT… (อยู่ใน protected scope) | ~46 files |
| Spec-sync canonical | `fo-spec-sync/` (FSP-005 sign-off + FSP-007..031 evidence + gap-FSP-* + DOC-SWEEP) | 1 dir (37 files) |
| Living/regenerable | `label-standard/` (re-scan ด้วย `Prototypes/scan-labels.mjs`) | 1 dir |
| Products/media | `Univerza_Tukdaeng_User_Manual.{html,pdf,lite.pdf,original.pdf}`, `appstore-screenshots/`, `manual-previews/`, `FO-DIAG-001/` + `FO-DIAG-001-fo-app-diagrams.md` | 4 files + 3 dirs + 1 file |
| Review captures | `create-post-review/`, `feed-redesign-review/` (PNG/HTML sheets จาก capture scripts) | 2 dirs |
| REQ-01x analysis | `REQ-010` ×2, `REQ-011`, `REQ-012`, `REQ-021` | 5 files |
| Prompt snapshots | `prompt-FO-BO-coverage-audit.md`, `prompt-Tukdaeng-Video-Guides.md`, `prompt-Univerza_Tukdaeng_User_Manual.md` | 3 files |
| Marketing/content | `INTRO-post-caption.md`, `tukdaeng-intro-video-script.md`, `tukdaeng-mascot-story-pack.md` | 3 files |
| Build intermediates/evidence | `manual_orig.txt`, `umn-pdf-compression-checklist.txt`, `chk2-p1.png`, `chk2-p28.png`, `mission-fa6c030e-checklist.txt`, `mission-fa6c030e-intro-acceptance-review.txt`, `mission-fa6c030e-checklist-card.png`, `FO-SPEC-changed-files.txt` | 8 files |

## 3. Keep vs Archive

### KEEP — living / canonical / protected / script-bound (ไม่ย้าย)

| รายการ | เหตุผล |
|---|---|
| `FO-TEST-001-*` ทั้งชุด (~46 files) | ห้ามแตะตาม constraint + living refs จาก `DEV_UPDATE_PACKAGE_2026-11-02.md`, `00_GLOBAL_RULES_MODULE.md` (LEGAL-TH draft) |
| `fo-spec-sync/` | **Canonical decision source** — `PRODUCT_DEFINITION.md` §8/§218, `README_MODULE_INDEX.md`, `DOCUMENT_VERSION.md` (FO-PRD-v1.9), `DEV_UPDATE_PACKAGE` ชี้ FSP-005 sign-off + FSP evidence |
| `FO-BO-001-coverage-audit.md` | **Canonical product decisions** — `BackOffice/DOCUMENT_VERSION.md` อ้าง §6 เป็นแหล่ง decision ของ remediation กลุ่ม a |
| `label-standard/` | Living regenerable inventory — `scan-labels.mjs` เขียนผลลง dir นี้ + `bo-canonical-label-table.md` อ้าง audit/plan ภายใน |
| `Univerza_Tukdaeng_User_Manual.*` ×4 | Script-bound: `build-manual-pdf.mjs`, `render-pdf.mjs`, `check-times.mjs` + อ้างจาก `scripts/video-guides/intro-script.md` |
| `appstore-screenshots/`, `manual-previews/` | Script-bound: `build-manual-pdf.mjs`, `crop-appstore-phones.mjs`, `inspect-images.mjs`, `check-times.mjs` |
| `FO-DIAG-001/` + `FO-DIAG-001-fo-app-diagrams.md` | Product deliverable — อ้างใน `DEV_UPDATE_PACKAGE_2026-11-02.md`; ใช้เล่า stakeholder ได้ต่อ |
| `REQ-010-*` ×2, `REQ-011-*`, `REQ-012-*` | Mission 5 evidence ปิดวันนี้ + `REQ-010-decision-log.md` เป็น input ของ **DOC-030** (รวม decision log — todo อยู่ใน mission เดียวกัน) |
| `REQ-021-manual-qa-checklist.txt`, `FO-SPEC-changed-files.txt` | Evidence ปิดวันนี้ — keep ไว้ sweep รอบถัดไปเมื่อ mission 5/6 ปิดสนิท |
| `mission-6-objective-1/`, `mission-6-objective-2/` | Evidence mission ที่ยังเปิดอยู่ — sweep เมื่อ mission 6 ปิด |
| `BO-TEST-COVERAGE-AUDIT.md` | Gap Register GAP-BO-TEST-04..09 ยังเป็น open backlog (edge cases/responsive/error sweep) — **พี่มาเต็มยืนยัน keep 04/11** → archive sweep หน้าเมื่อ gap ปิด |

### ARCHIVE — point-in-time ที่ปิดงานแล้ว

| กลุ่ม | รายการ | เหตุผล |
|---|---|---|
| Closed task evidence | `task-*/` ทั้ง 36 dirs | ทุก task ปิดแล้ว; evidence อย่างเดียว ไม่มี living ref ชี้เข้ามา |
| Closed mission bundles | `mission-1-*`, `mission-2-*`, `mission-3-objective-1..5`, `mission-4-objective-1..2`, `mission-fa6c030e-*` (dir+zip+loose ×3), `mission-umn-review-obj1` + `.zip` ×4 | มิชชัน 1–4/intro/manual-review ปิด + ส่งตรวจแล้ว; ⚠️ `mission-3-objective-1` + `mission-4-objective-1` มี living refs (ดู §5) |
| BO audit wave | `bo-prototype-audit-objective-1..5` | Mission 3 audit ปิดแล้ว; ⚠️ 3 ไฟล์ใน obj-1/2/3 มี living refs (ดู §5) |
| AIL evidence | `AIL-*` 11 files | Admin Identity Lifecycle lock ไป 28/09 — evidence เท่านั้น |
| Closed audits/reports | `FO-TEST-AUDIT-*` ×2, `FEED-027-manual-review-checklist.txt`, `FO-PROTO-f2f1934f-report.md` | รายงาน point-in-time ปิดงานแล้ว |
| Review captures | `create-post-review/`, `feed-redesign-review/` | รีวิวจบแล้ว; ⚠️ capture scripts ยัง hardcode path นี้ (ดู §6) — **พี่มาเต็ม approve archive 04/11** (ไม่แก้ script) |
| Prompt snapshots | `prompt-*` ×3 | snapshot ณ วันสั่งงาน — historical เท่านั้น |
| Content drafts | `INTRO-post-caption.md` (มีสำเนาใน `mission-fa6c030e-obj3-acceptance/`), `tukdaeng-intro-video-script.md` (ร่างเก่า — living อยู่ที่ `scripts/video-guides/intro-script.md`), `tukdaeng-mascot-story-pack.md` (prompt pack gen มาสคอต — พี่มาเต็มยืนยัน 04/11 ไม่ใช้แล้ว → archive) | superseded/draft ปิดการใช้งานแล้ว |
| Build intermediates | `manual_orig.txt`, `umn-pdf-compression-checklist.txt`, `chk2-p*.png` ×2 | intermediate/evidence ปิดงานแล้ว |

รวม archive candidates ≈ **56 dirs + 4 zips + ~28 loose files** (~88 root entries → เหลือ ~58)

## 4. โครงสร้าง archive ที่เสนอ

```
deliverables/
  archive/
    INDEX.md                    ← manifest เดียว (ดู convention ด้านล่าง)
    task-NAV-008/ ...           ← mirror path เดิมเป๊ะ ไม่ rename
    mission-1-obj1-contract/
    bo-prototype-audit-objective-1/
    AIL-014-requirement-amended.md
    prompt-FO-BO-coverage-audit.md
    ...
```

- **Flat mirror** ใต้ `archive/` — คง path เดิมทุกตัวอักษร (ย้าย `deliverables/X` → `deliverables/archive/X`) → ref update เป็น mechanical sed ได้, grep หาชื่อเดิมเจอเหมือนเดิม
- **ไม่แยก sub-category** — prefix เดิม (`task-`, `mission-`, `AIL-`, `FSP-`, `prompt-`) บอกประเภทอยู่แล้ว ลดงาน + ลดโอกาส ref พัง
- zip ย้ายคู่ dir เสมอ (zip = package ส่งตรวจชุดเดียวกัน — ห้ามลบเช่นกัน)

### `archive/INDEX.md` convention (ไฟล์เดียวคุมทั้ง archive)

| คอลัมน์ | ความหมาย |
|---|---|
| path | path ใน archive |
| type | task-evidence / mission-bundle / audit / report / prompt / review / draft |
| closed-by | task/mission ที่สร้าง |
| archived | วันที่ย้าย (DOC-021) + commit ref |
| referenced-by | living docs ที่ชี้มา (ถ้ามี — update แล้วใน commit เดียวกัน) |

**Convention ต่อเนื่อง:** หลักฐานใหม่ตก root ตามเดิม → เมื่อ task/mission ปิดและไม่มี living doc อ้าง (หรืออัปเดต ref แล้ว) → ย้ายลง `archive/` + เพิ่มแถว INDEX → ไม่มีการลบ

## 5. Living-doc refs ที่ต้องอัปเดตตอน DOC-021 (ถ้า archive ตามนี้)

| ไฟล์ living doc | บรรทัด | ชี้ไปที่ | action |
|---|---|---|---|
| `docs/bo-navigation-naming-contract.md` | 190–192 | `bo-prototype-audit-objective-1/system-coverage-audit.txt`, `objective-2/cross-module-ui-consistency.txt`, `objective-3/navigation-information-architecture.txt` | prepend `archive/` ×3 |
| `docs/bo-shared-remediation-coverage.md` | 261 | `bo-prototype-audit-objective-2/cross-module-ui-consistency.txt` | prepend `archive/` ×1 |
| `docs/bo-canonical-label-table.md` | 231, 288 | `mission-3-objective-1/USR-001-label-audit.txt` + `USR-002-normalization-plan.txt`, `mission-4-objective-1/CTM-001-label-audit.txt` + `CTM-002-normalization-plan.txt` | prepend `archive/` ×4 |

**รวม 8 ref edits ใน 3 ไฟล์เท่านั้น** — refs อื่นทั้งหมด (`PRODUCT_DEFINITION`, `README_MODULE_INDEX`, `DOCUMENT_VERSION` ทั้ง FO/BO, `DEV_UPDATE_PACKAGE`, `00_GLOBAL_RULES`, `intro-script.md`) ชี้ไฟล์กลุ่ม KEEP → ไม่ต้องแก้

- หมายเหตุ: `BackOffice/DOCUMENT_VERSION.md` L25 พูดถึง task `45c27755` เป็น **task id** ไม่ใช่ path → ไม่กระทบ
- `2026-11-03_ai-log.json` มีคำว่า deliverables เป็น log data → ไม่ต้องแก้
- Kanban notes/descriptions อ้าง task id ไม่ใช่ file path → ไม่กระทบ

## 6. Scripts ที่ hardcode `deliverables/` — ผลกระทบ

| Script | path ที่ผูก | สถานะหลัง archive |
|---|---|---|
| `Prototypes/scan-labels.mjs` | `label-standard/` | KEEP — ไม่กระทบ |
| `build-manual-pdf.mjs` / `render-pdf.mjs` / `check-times.mjs` / `crop-appstore-phones.mjs` / `inspect-images.mjs` | manual + appstore/manual-previews | KEEP — ไม่กระทบ |
| `capture-feed-redesign*.js` / `build-feed-review-sheets.js` | `feed-redesign-review/` | ⚠️ จะชี้ path เก่าถ้า re-run — เป็น one-shot review tool; เสนอ archive ปกติ + note ใน INDEX ว่า script path stale (ไม่แก้ script — งานปิดแล้ว) |
| `render-test-output.js` | รับ path เป็น arg (comment อ้าง AIL-016) | ไม่กระทบการทำงาน |
| `test-pw.mjs` / `test-node.mjs` | เขียนไฟล์ scratch ลง root | ไม่กระทบ |

## 7. ทางเลือกที่พิจารณา

| ทางเลือก | ข้อดี | ข้อเสีย | เลือก? |
|---|---|---|---|
| **A. flat mirror `archive/` + อัปเดต 8 refs** (เสนอ) | root สะอาดจริง; ref update น้อยมาก; convention เดียวจบ | ต้องแตะ living docs 3 ไฟล์ | ✅ |
| B. archive เฉพาะที่ไม่มี ref — ยกเว้น evidence ที่ living docs อ้าง | ไม่แตะ living docs เลย | root ยังรกด้วย mission-3/4 + bo-audit dirs; กฎ "อ้างอยู่ = ห้ามย้าย" ทำ archive ไม่เสร็จสมบูรณ์ | ❌ |
| C. แยก sub-folder ตามประเภท (`archive/missions/`, `archive/tasks/`…) | อ่านง่ายขึ้น | path เปลี่ยนไม่ uniform → ref update ยากขึ้น, เสี่ยงพลาด; prefix เดิมบอกประเภทอยู่แล้ว | ❌ |

## 8. Execute checklist สำหรับ DOC-021 (หลัง approve)

1. `mkdir deliverables/archive` + สร้าง `INDEX.md` skeleton
2. `git mv` ตาม §3 archive list (~88 entries) — ห้ามแตะกลุ่ม KEEP
3. อัปเดต 8 refs ใน `docs/` 3 ไฟล์
4. เติม INDEX.md ครบทุกแถว + commit ref
5. Sweep verify: `grep -rn "deliverables/" docs/ FrontOffice/ BackOffice/` ยืนยันไม่มี ref ตาย
6. Evidence: `deliverables/mission-6-objective-2/DOC-021-changed-files.txt`

## 9. การตัดสิน — ✅ approved โดยพี่มาเต็ม 2026-11-04

| ข้อ | เรื่อง | คำตัดสิน |
|---|---|---|
| 1 | `BO-TEST-COVERAGE-AUDIT.md` | **keep** — GAP-04..09 ยังเป็น open backlog → archive sweep หน้าเมื่อปิด |
| 2 | `tukdaeng-mascot-story-pack.md` | **archive** — ยืนยันไม่ใช้แล้ว |
| 3 | `manual_orig.txt` | **archive** — rebuild manual ใช้ `build-manual-pdf.mjs` ไม่ต้องการไฟล์นี้ |
| 4 | `create-post-review/`, `feed-redesign-review/` | **archive** — ยอมรับ capture scripts ชี้ path เก่า (ไม่แก้ script — งานปิดแล้ว) |
| 5 | โครงสร้าง archive | **แบบ A — flat mirror `deliverables/archive/` + INDEX.md** |

→ DOC-021 ungated: execute ตาม §8 checklist ได้เลย (git mv ~88 entries + อัปเดต 8 refs ใน docs/ 3 ไฟล์ + เติม INDEX.md)
