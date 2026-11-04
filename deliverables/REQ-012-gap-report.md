# REQ-012 — Gap Report: NB-001–051 รวม verdict 2 ระดับ + Proposed Action

- **Task:** REQ-012 [82e4e9bb] — Mission 5 [3d27da7d] Objective 2 (Requirement Gap Analysis)
- **Date:** 2026-11-04
- **Requirement record:** kanban `20885c46` (status: in_review)
- **Source of truth (requirements):** `SourceInputs/requirements/2026-11-04-notebook-review-app-tukdaeng-09-10-2026.md` (NB-### อ้างคู่ชื่อไฟล์เสมอ)
- **Inputs:**
  - `deliverables/REQ-010-nb-fo-spec-comparison.md` — spec-level verdict (vs FO module specs 00–17)
  - `deliverables/REQ-010-decision-log.md` — DEC-R010-01–09
  - `deliverables/REQ-011-nb-fo-prototype-comparison.md` — prototype-level verdict (vs `Prototypes/fo-flow/index.html`)
- **สถานะ:** ✅ `approved` — พี่มาเต็ม sign-off 2026-11-04 → gate REQ-020 (spec sync) + REQ-021 (prototype sync) เปิดแล้ว

> เอกสารนี้คือ verdict ขั้นสุดท้ายของ Objective 2 — verdict ระดับ spec/prototype อยู่ในเอกสาร input เป็น evidence ไม่เขียนทับ snapshot

---

## 1. เกณฑ์ Verdict รวม (final)

| Verdict รวม | ความหมาย | Action |
|-------------|-----------|--------|
| `aligned` | spec + prototype ครอบ requirement ตรงกันทั้งคู่ | ไม่ action |
| `prototype-ahead` | ทำใน prototype แล้ว แต่ spec ยังไม่ sync | spec delta ใน REQ-020 |
| `design-principle` | spec ไม่เขียนเป็น rule (โดยตั้งใจ) แต่ prototype สะท้อน direction แล้ว | บันทึกเป็น principle ไม่ action |
| `partial-selective` | เหลือบางส่วน ตาม decision "เพิ่มเฉพาะจำเป็น" | ประเมินรายหน้าใน REQ-020/021 |
| `defer` | gap จริง ตัดสินใจแล้วว่าไม่เข้า V1 | บันทึก future consideration |
| `process` | constraint กระบวนการ นอกขอบเขต spec/prototype | บันทึกเป็น business constraint |
| `design-ref` | ไม่ใช่ requirement (ภาพตัวอย่างพี่คิง ยืนยัน 2 รอบ) | ไม่ action |

## 2. สรุปผลรวม (51 ข้อ)

| Verdict รวม | จำนวน | รายการ |
|-------------|-------|--------|
| aligned | 31 | NB-001–010, 012, 013, 022, 023, 026, 027, 028, 030, 031, 035, 037, 038, 040–045 (+duplicates NB-025, 029, 032 รวมกลุ่ม) |
| prototype-ahead | 5 | NB-014, 033, 036, 046, 048 |
| design-principle | 2 | NB-011, 034 |
| partial-selective | 1 | NB-047 |
| defer | 2 | NB-024 (phase 2), NB-039 (future) |
| process | 3 | NB-049, 050, 051 |
| design-ref | 7 | NB-015–021 |

**ภาพรวม:** จาก 51 ข้อ ต้อง action จริงเพียง **6 ข้อ** (spec delta 5 + ประเมิน selective 1) — ที่เหลือปิดด้วย verdict แล้ว

---

## 3. Aligned (31 ข้อ) — ไม่ action

spec ครอบ + prototype ตรงกันครบ ไม่มี spec/prototype delta ใด ๆ:

- **Feed / โครงสร้าง IG:** NB-001 (collectible social), NB-002 (IG architecture), NB-003 (hero slider ไม่ใช้ thumbnail), NB-004 (เลี่ยงบรรยากาศ marketplace), NB-026, NB-027 (1/N counter)
- **3-layer info:** NB-005 (caption สั้น), NB-006 (tap-to-expand), NB-007 (full detail), NB-028, NB-029 (summary)
- **Engagement:** NB-008 (สเกลไอคอน IG), NB-009 (5 ปุ่ม), NB-010 (Quick Ask → chat), NB-032 (duplicate)
- **Posting:** NB-012 (post อิสระ ไม่บังคับ asset), NB-013 (หลายประเภท — plain post ตามชี้แจง), NB-037 ((+) feed=Post / (+) profile=Add Asset), NB-038
- **Detail page:** NB-030 (spec table + `n/a`), NB-031 (no sticky price — ผู้ใช้ตัดสินคงดีไซน์เดิม)
- **Nav:** NB-025 (UX ล้อ IG — duplicate ของ NB-002), NB-035 (search เป็นไอคอน)
- **Chat (ตรงเป๊ะทั้งชุด):** NB-040 (ธรรมชาติซ้าย-ขวา), NB-041 (post card ใน bubble), NB-042 (no pinned bar), NB-043 (user view), NB-044 (item view), NB-045 (read receipts + pin room)
- **Vision:** NB-022 (Use Thailand = กลุ่มแอปแยกกัน — watch-first ถูกต้อง), NB-023 (asset mgmt + portfolio ประเมินมูลค่า)

## 4. Prototype-ahead (5 ข้อ) — spec delta ใน REQ-020

delta ทั้ง 4 กลุ่ม implement ใน fo-flow แล้วระหว่างเดโม (พี่มาเต็มสั่งทำเพื่อเสนอพี่คิง) — spec ต้องตามมา:

| NB | หัวข้อ | ใน prototype (done) | Spec delta ที่ต้องเขียน (REQ-020) |
|----|--------|---------------------|-----------------------------------|
| NB-014 + NB-036 (ครึ่งแรก) | WA button เล็กบน feed header | `feed-wa` icon ข้าง (+) → `walerts`, guest gated | 00_NAV §6.4 — เพิ่ม WA entry บน app header |
| NB-033 | view counting rule | scroll-pass ≥55% นับ +1, เลื่อนซ้ำนับซ้ำ | 02_FEED §9 — views rule + contract note (ช่วงแรก scroll-pass, อนาคตนับเฉพาะ detail click) |
| NB-046 | system notifications + category filter | seed 4 system rows (security/account×2/announce) + `al-fchip` filter chips | 09_NOTIFICATION — คืน `system` type (3 subtypes อนุมัติแล้ว: security/account status/announcements) + category filter บน Alerts feed |
| NB-048 | settings icon = gear | `pf-menu` burger → `I.gear(22)` | 06_PROFILE — entry point burger → gear |
| NB-036 (ครึ่งหลัง) | config ประจำหน้า | อยู่ภายใต้ decision selective ของ NB-047 | รวมกับข้อ 6 |

## 5. Design principle (2 ข้อ) — ไม่เขียน rule ใน spec

| NB | หัวข้อ | Verdict | เหตุผล |
|----|--------|---------|--------|
| NB-011 | Soft UI ลดความฉูดฉาด | covered ที่ prototype | `.follow-btn` muted โทนกลางอยู่แล้ว — spec ไม่จำเป็นต้องระบุสี/ขนาดระดับนี้ บันทึกเป็น design guideline ตอน design/dev (DEC-R010-03) |
| NB-034 | ปุ่ม Follow เฟดสี | covered ที่ prototype | เช่นเดียวกัน — เป็นรายการเฉพาะของ principle เดียวกัน |

**Proposed action:** บันทึก "Soft UI / ปุ่มไม่ตะโกน" เป็น design principle ในเอกสารนี้ — ไม่เขียน functional rule ลง module spec

## 6. Partial-selective (1 ข้อ) — NB-047 Page Config

- **Requirement:** ปุ่ม Config ประจำหน้าทุกหน้า (ไม่ซ่อนลึกใน Profile Settings)
- **Decision (อนุมัติแล้ว):** เพิ่มเฉพาะหน้าที่มีของให้ตั้งจริง ไม่บังคับทุกหน้า (DEC-R010-05)
- **สถานะปัจจุบัน:** chat มี `chatcfg` (gear บนหัว chat list); alerts page มี filter chips ประจำหน้า (de facto page config จาก NB-046 delta)

**Proposed action (ประเมินรายหน้า):**

| หน้า | มีของให้ตั้งจริง? | เสนอ |
|------|---------------------|------|
| Chat | ใช่ (layout/แจ้งเตือน/อ่านแล้ว) | มี `chatcfg` แล้ว — ไม่ action |
| Alerts | ใช่ (filter หมวด) | filter chips ถือเป็น per-page config แล้ว — ไม่ action |
| Feed | ไม่ชัด (content prefs อยู่ Settings) | ไม่เพิ่มใน V1 — ถ้ามี setting จริงค่อยเปิด config ประจำหน้า |
| Boards / Profile / อื่น | ไม่ชัด | เช่นเดียวกัน |

→ **Verdict เสนอ:** satisfied-by-selective — pattern ตั้งหลักไว้แล้ว หน้าที่มี setting จริงใช้ per-page config ได้ทันที; spec delta เล็กใน REQ-020 = บันทึก policy "selective page-config" เป็น global rule (ไม่ใช่เพิ่มปุ่มทุกหน้า)

## 7. Defer (2 ข้อ) — ไม่เข้า V1

| NB | หัวข้อ | การตัดสินใจ | บันทึก |
|----|--------|-------------|--------|
| NB-024 | เชื่อมข้อมูลไป Family Office | **defer phase 2** (พี่มาเต็ม — DEC-R010-07) | phase-2 candidate — integration ใหม่ทั้งระบบ อยู่นอก V1 scope ของ 16_INTEGRATIONS |
| NB-039 | โควตาการโพสต์ผู้ค้า | **defer อนาคต** (พี่มาเต็ม — DEC-R010-04) | future consideration — รอเปิดใช้จริง ผู้ใช้เยอะขึ้นค่อยเพิ่ม ไม่ต้องถามพี่คิงรอบนี้ |

## 8. Process constraints (3 ข้อ) — นอกขอบเขต spec/prototype

| NB | หัวข้อ | Proposed action |
|----|--------|-----------------|
| NB-049 | Release cycle 2 ครั้ง/สัปดาห์ (พุธ + เสาร์) | บันทึกเป็น business constraint ใน requirement record — ไม่เขียนลง module spec; มีผลต่อ planning/release process ภายนอก |
| NB-050 | ทดสอบบน production env จริง | เช่นเดียวกัน — environment/QA policy ภายนอก spec |
| NB-051 | Figma Make/AI workflow + AI สรุปประชุม | เช่นเดียวกัน — development process rule |

(DEC-R010-08 — module spec ไม่ใช่ที่ของ process rules)

## 9. Design reference (7 ข้อ) — ไม่ action

NB-015–021 (รูป ThaiLand News dashboard) — ผู้ใช้ยืนยัน 2 รอบว่าเป็นภาพตัวอย่างที่พี่คิงให้ดูเท่านั้น (DEC-R010-02) — ไม่ผูกเป็น requirement ทั้งระดับ spec และ prototype

## 10. Duplicates — รวมกลุ่มตาม DEC-R010-09

| Duplicate | รวมเข้ากับ |
|-----------|------------|
| NB-025 | NB-002 (IG architecture) |
| NB-029 | NB-005 + NB-006 + NB-007 (3-layer summary) |
| NB-032 | NB-009 + NB-010 (engagement + Quick Ask) |

## 11. คำถาม/ข้อเสนอค้างไปหาพี่คิง

เหลือ 1 ข้อ (ที่เหลือปิดหมดแล้ว):

1. **NB-046 system notification subtypes** — delta ที่ทำใน prototype (security / account status / announcements + category filter) เอาไปเสนอพี่คิงให้เห็นภาพ รอ feedback

ปิดแล้ว: NB-039 (defer), NB-031 (คงดีไซน์เดิม), NB-015–021 (ภาพตัวอย่าง), NB-014/036 WA button, NB-048 gear, NB-047 selective, NB-022 Use Thailand, NB-013/038 plain post

## 12. Scope งานหลัง sign-off

### REQ-020 — spec sync (gated)
1. 00_NAV §6.4 — WA button บน feed header (NB-014/036)
2. 02_FEED §9 — view counting rule (NB-033)
3. 09_NOTIFICATION — system type 3 subtypes + category filter (NB-046)
4. 06_PROFILE — settings entry burger → gear (NB-048)
5. Global rule/note — selective page-config policy (NB-036 ครึ่งหลัง + NB-047)

### REQ-021 — prototype sync (gated)
- delta ทั้งหมดทำใน fo-flow แล้ว → เหลือเพียง verify + sync lock notes/comments ใน prototype ให้ตรง spec ที่อัปเดต (และถ้ามี page-config หน้าใหม่ที่ approve เพิ่ม ให้ทำในงานนี้)

## 13. Sign-off

✅ **Approved by พี่มาเต็ม — 2026-11-04** — verdict + proposed action ทั้งหมดในเอกสารนี้ได้รับการยืนยัน → gate เปิด REQ-020 [e5ffe074] + REQ-021 [d7f07956]
