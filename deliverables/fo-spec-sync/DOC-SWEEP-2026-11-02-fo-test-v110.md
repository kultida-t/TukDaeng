# DOC-SWEEP — FO-TEST 01–19 wording + FO-PRD-v1.10 baseline sweep

> **Audit trail only** — บันทึกการแก้เอกสารของ task `ef5ae602` (FO-DOC) วันที่ 2026-11-02 · ไม่ใช่ spec change · ไฟล์ gap/evidence เดิมในโฟลเดอร์นี้ไม่ถูกแก้
> กฎที่ยึด: `FrontOffice/DOCUMENT_VERSION.md` (ทุกไฟล์อ้าง baseline กลาง `FO-PRD-v1.10`) + `deliverables/FO-TEST-001-20-traceability.md` §0 (นิยาม "ครบ" = มีเคสเขียนแล้ว)

## 1. สถานะเอกสารทุกเล่ม (19 ไฟล์)

- เล่ม 01–06: เพิ่มบรรทัด `> **สถานะเอกสาร**:` ท้าย header block (ไม่มีสถานะเดิม)
- เล่ม 07–08: แทนบรรทัด stale `> **เขียนเสร็จรอรีวิว — อย่าเพิ่งปิดงาน**`
- เล่ม 09–15: แทน `**หมายเหตุ**: เขียนเสร็จรอรีวิว — อย่าเพิ่งปิดงาน` ด้วย `**สถานะเอกสาร**:`
- เล่ม 16–19: แยกเป็น `**สถานะเอกสาร**:` + เก็บหมายเหตุชื่อไฟล์/TC ID เดิมไว้ใน `**หมายเหตุ**:` บรรทัดถัดไป
- ข้อความสถานะที่ใช้ร่วมกัน: `Draft — ยังไม่มีผลการรันเทส (Result ว่างทุกเคส) · "ครบ" ในเอกสารนี้ = มีเคสเขียนแล้ว ไม่ใช่ทดสอบผ่าน — นิยามเต็มที่ deliverables/FO-TEST-001-20-traceability.md §0`

## 2. คำ "ครบ/ผ่าน" — สรุปการพิจารณา

- เก็บไว้ตามเดิม (ศัพท์เคสปกติ ไม่ได้สื่อผลรัน): `save ผ่าน`, `layout ครบทุกส่วน`, `เห็นครบทุกแถว`, `เทสผ่าน browser` (=ผ่านช่องทาง), `signup/OTP/profile ผ่านแล้ว` (=precondition ทำสำเร็จแล้ว), `ผ่าน Settings/flow` (=ผ่านทาง)
- แก้แล้ว: `LANG-045` precondition `ตั้ง TH + เดินทุกหน้าหลักผ่านแล้ว` → `ตั้ง TH + เดินครบทุกหน้าหลักแล้ว` (md + checklist.csv) — คำเดิมอ่านเพลียนเป็น "ผ่านเทส" ได้

## 3. Baseline FO-PRD-v1.10

- SoT line เล่มเทส: `FO-TEST-001-08/09/10/11/12` จาก `(FO-PRD-v1.9)` → `(FO-PRD-v1.10)`
- `FO-TEST-001-testcase-prompt.md`: `docs baseline FO-PRD-v1.9` → `v1.10`
- `FrontOffice/DOCUMENT_VERSION.md` §4 Dev Reference Note: `Version: FO-PRD-v1.9` → `v1.10` (เดิมขัดกับ §2 ในไฟล์เดียวกัน)
- Module SoT clause 12 ไฟล์ (02,03,04,05,06,07,09,10,11,12,14,15): `(FO-PRD-v1.9)` → `(spec-sync FO-PRD-v1.9 · baseline FO-PRD-v1.10)` — คง provenance ว่า sync มาตอน v1.9
- Module stamps (ตัดสินโดยผู้ใช้ 2026-11-02 — bump เป็น v1.10 คง provenance):
  - `12_BOARD`: `Version | 1.10 (baseline FO-PRD-v1.10 · spec-synced FO-PRD-v1.9 FSP-023)`
  - `14_PORTFOLIO`: `Version | 1.10 (baseline FO-PRD-v1.10 · spec-synced FO-PRD-v1.9 FSP-024)`
  - `15_TRUST_SAFETY`: `Version | 1.10 (baseline FO-PRD-v1.10 · spec-synced FO-PRD-v1.9 FSP-031)`
  - `11_SOCIAL`: `Document Type | Functional PRD — prototype-synced (spec-sync FO-PRD-v1.9 · baseline FO-PRD-v1.10)`
- คงเดิม (historical/provenance): sync note ที่ระบุวันที่, Version History ใน DOCUMENT_VERSION, master §16 title `Sync Decision Log (FO-PRD-v1.9)`, QA checklist removed-behaviors guard table, DEV_BASELINE superseded note

## 4. ตัวเลข TC (นับจาก CSV จริง)

- เล่ม 03 Feed: traceability 82 → จริง **84** (H33/M42/L9) — CSV มี FEED-001..084 ครบ เพิ่ม FEED-083/084 (double-tap like) หลัง audit
- เล่ม 10 Alerts: traceability 79 → จริง **78** (H31/M44/L3) — ALT-070 ถูกถอนตาม DEC-26
- ยอดรวม: 1,620 → **1,621 TC** (High **808** / Medium 693 / Low 120) · SETUP 195 แถว — อัปเดตที่ traceability §0, §1 index, §2 map (เพิ่ม FEED-083/084 เข้าแถว `action like`), §7.1, §7 note, §8
- เล่มอื่นทั้ง 17 เล่มตรงกับตารางเดิมทุกตัว

## 5. ขอบเขตที่ไม่แตะ

- ไม่เปลี่ยน expected ของเคสใด ๆ · ไม่แตะ prototype · ไม่แตะไฟล์ gap-FSP/FSP-*-evidence ในโฟลเดอร์นี้ · ไม่แตะ BO protected screens
