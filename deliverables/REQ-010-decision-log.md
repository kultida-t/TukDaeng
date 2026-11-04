# REQ-010 — Decision Log: NB-001–051 vs FO Module Specs (00–17)

- **Task:** REQ-010 [ee47cc83] — Mission 5 Objective 2 (Requirement Gap Analysis)
- **Date:** 2026-11-04
- **Requirement record:** kanban `20885c46` (status: gathering)
- **Source of truth:** `SourceInputs/requirements/2026-11-04-notebook-review-app-tukdaeng-09-10-2026.md` (NB-### อ้างคู่ชื่อไฟล์เสมอ)
- **Evidence:** `deliverables/REQ-010-nb-fo-spec-comparison.md`
- **สถานะ:** proposed — รอพี่มาเต็มรีวิว แล้วไป confirm รวมใน Gap Report (REQ-012) ก่อน REQ-020/021 (gated)

> ตาม intake convention: verdict/decision อยู่เอกสารนี้เท่านั้น — ห้ามเขียนทับ snapshot
> ID decision ใช้ `DEC-R010-xx` (scope เฉพาะ REQ-010 — DOC-030 จะรวม/index รวมภายหลัง)

---

## DEC-R010-01 — วิธีอ่าน verdict

- `covered` = spec ครอบ intent แล้ว — **ไม่ต้องแก้ spec**; ถ้า prototype ขัดก็เป็นประเด็นฝั่ง REQ-011
- `partial` = spec มีบางส่วน — เสนอ **spec delta เล็ก** (เพิ่ม rule/field/affordance) หรือถามพี่คิง ขึ้นกับรายการ
- `gap` = ไม่มีเลย — เสนอ **ตัดสินใจ scope**: เข้า V1 / defer phase 2 / จัดเป็น process rule ไม่ใช่ spec
- `design-ref` = ไม่ใช่ requirement (ดู DEC-R010-02)

## DEC-R010-02 — NB-015–021 (รูป ThaiLand News) = design context เท่านั้น

**Decision:** ทั้ง 7 ข้อ **ไม่ผูกเป็น requirement** — ใช้เป็น design context/mood board เท่านั้น

**เหตุผล:**
- ผู้ใช้ยืนยันแล้วว่าเป็นภาพตัวอย่างที่พี่คิงให้ดู (บันทึกใน requirement record 20885c46)
- เนื้อหา (ThaiLand News branding, เวลา/ปฏิทิน/อากาศ widgets) ไม่ตรงโดเมน TukDaeng (collectible marketplace community)
- ไม่มีข้อใดซ้อนทับ requirement ที่ยังไม่ครอบ — แม้ NB-021 (bottom nav 5 เมนู) จะดูคล้าย แต่ TukDaeng มี nav 5 แท็บต่าง semantics อยู่แล้ว (coincidence ไม่ใช่ requirement)
- **Open question ให้พี่คิง (ไม่ใช่ gap):** ถ้า concept "Today/home dashboard widgets" เป็น intent จริง (เช่น อยากได้หน้า home แยกจาก feed ในอนาคต) ให้บันทึกเป็น requirement ใหม่ใน snapshot รอบถัดไป — ตอนนี้ไม่ action
- ✅ ผู้ใช้ยืนยันอีกครั้ง 2026-11-04: "อิงภาพตัวอย่างมาให้ดูเฉย ๆ ไม่ได้ให้เพิ่มข้อมูลตาม" — ปิดประเด็นสมบูรณ์

## DEC-R010-03 — Partial: design-direction ที่ spec ไม่เขียนเป็น rule (NB-011/034/031)

| NB | Proposed action |
|----|-----------------|
| NB-011, NB-034 | ไม่เพิ่ม functional rule — บันทึกเป็น **design principle ใน gap report** ("soft UI / ปุ่มไม่ฉูดฉาด / Follow เฟดสี") ให้ตอน design/dev ถือเป็น guideline; spec ไม่จำเป็นต้องระบุสี/ขนาดระดับนี้ใน V1 doc — **เสนอพี่มาเต็มยืนยัน** |
| NB-031 | ✅ **ปิดประเด็น — covered** ผู้ใช้ตัดสินใจ 2026-11-04: คงดีไซน์ล่าสุด (ราคาเป็น spec row ธรรมดา) ไม่ขยายตัวเลข |

## DEC-R010-04 — Business rules (NB-033/039) + ข้อที่ชี้แจงแล้ว (NB-013/038)

| NB | สถานะ / Proposed action |
|----|--------------------------|
| NB-013, NB-038 | ✅ **ปิดประเด็น — covered** ผู้ใช้ชี้แจง 2026-11-04: พี่คิงหมายถึงโพสต์ธรรมดา (plain post) อยู่แล้ว — โพสต์รับซื้อ/รับซ่อม คือโพสต์ทั่วไป ไม่ต้องการ post type เฉพาะ → ไม่ต้องแก้ spec |
| NB-033 | business rule ใหม่: กำหนด view-counting semantics (ช่วงแรกนับทุก scroll-pass รวมซ้ำ; อนาคตนับเฉพาะ click เข้า detail) — เสนอเพิ่มใน 02_FEED §9 views rule + contract note |
| NB-039 | ✅ **ตัดสินใจแล้ว — defer อนาคต** ผู้ใช้ตัดสินใจ 2026-11-04: โควตาโพสต์เป็นเรื่องอนาคต (รอเปิดใช้จริง ผู้ใช้เยอะขึ้นค่อยเพิ่ม) **ไม่เอาเข้า V1** — บันทึกใน gap report เป็น future consideration ไม่ต้องถามพี่คิงรอบนี้ |

## DEC-R010-05 — Partial: navigation & page-config (NB-014/036/047/048)

| NB | Verdict (พี่มาเต็ม 2026-11-04) |
|----|-------------------------------|
| NB-014, NB-036 (WA บนฟีด) | ✅ **อนุมัติ — เพิ่ม** WA button ปุ่มเล็กบน feed header — implement แล้วใน prototype: ไอคอนนาฬิกาข้อมือ ข้างปุ่ม (+) → `walerts` page (guest → Member Sheet ตาม GUEST_GATE_SEL) |
| NB-036 (config) / NB-047 | ✅ **อนุมัติ — selective** page-config เฉพาะหน้าที่มีของให้ตั้งจริง (chat มี `chatcfg` แล้ว หน้าอื่นประเมินรายตัว) ไม่บังคับทุกหน้า |
| NB-048 | ✅ **อนุมัติ — gear** เปลี่ยนปุ่ม settings บน own profile จาก burger เป็นเฟืองตามที่พี่คิงต้องการ — implement แล้วใน prototype (`pf-menu` burger→gear) |

## DEC-R010-05b — View counting rule (NB-033)

- ✅ **อนุมัติ — เขียน rule ตามที่พี่คิงต้องการ:** ช่วงเริ่มต้น (ผู้ใช้น้อย) นับยอดวิวทุกครั้งที่ card เลื่อนผ่านหน้าจอ **เลื่อนซ้ำนับซ้ำ** เพื่อดันตัวเลข; อนาคตเปลี่ยนเป็นนับเฉพาะกดเข้า detail — spec delta จะเพิ่มใน 02_FEED views rule (REQ-020)
- Implement แล้วใน prototype: scroll listener บน `.feed-scroll` — card โผล่ ≥55% นับ +1, เลื่อนออกแล้วกลับมานับใหม่, counter อัปเดตในที่

## DEC-R010-06 — Partial: Notification Center (NB-046)

✅ ยืนยันใน snapshot (ผู้ใช้ชี้แจง 2026-11-04):
- "ระบบ" ระบุชัดใน requirement → **system type ต้องเอากลับ** — DEC-41 ถอดไปตอนอิง IG เกินไป → spec delta คืน system notifications (นิยามประเภทย่อยต้องกำหนดตอนเขียน delta เช่น security/account)
- "ฟิลเตอร์กรองหมวดหมู่" = **ตัวกรองหมวดการแจ้งเตือนในหน้าแจ้งเตือน** (ไม่ใช่ filter ของ watch alert) → spec delta เพิ่ม category filter บน Alerts feed (data model มี `type` อยู่แล้ว — effort ต่ำ)
- **chat แยก badge-only = ถูกต้อง** ผู้ใช้ยืนยันแชทไม่ควรไปอยู่เมนูแจ้งเตือน → ไม่ต้องแก้

→ ปิดเป็น spec delta 2 ชิ้น (restore system type + เพิ่ม category filter) — **ขอ verdict สุดท้ายจากพี่มาเต็ม**

✅ ผู้ใช้อนุมัติ proposed system-notification subtypes 2026-11-04 — ทำ spec delta ด้วย 3 ประเภทย่อยนี้แล้วเอาไปเสนอพี่คิงให้เห็นภาพ:
- **Security** — login เครื่องใหม่ / เปลี่ยนรหัสผ่าน
- **Account status** — ยืนยันตัวตนเรียบร้อย / โพสต์ถูกลบเพราะผิดกฎ
- **Announcements** — อัปเดตแอป / กิจกรรม / นโยบายใหม่

✅ **Implemented in prototype 2026-11-04** (ผู้ใช้สั่งให้ทำใน `Prototypes/fo-flow/index.html` เพื่อเอาไปเสนอพี่คิง — พี่เปิด gate เฉพาะ delta นี้ ก่อน REQ-021):
- seed 4 system rows (security login เครื่องใหม่ → `change_pwd`, account โพสต์ถูกซ่อน → `al_unavail`, account verified → `about_account`, announce อัปเดตเวอร์ชัน → `about_app`)
- ไอคอนวงกลมตาม subtype (shield/award/info), TH+EN copy, dismiss `x` ได้
- **category filter chips** (ทั้งหมด/ระบบ/กิจกรรม/Watch Alert) บน Alerts page — ครอบทั้ง 2 ส่วนของ NB-046 delta
- หมายเหตุ: เปิดดูต้อง sign in member (demo@tukdaeng.com / Tukdaeng123) — guest/fresh account เห็น empty ตาม GUEST-001
- ⚠️ spec 09_NOTIFICATION + fo-flow lock note จะต้อง sync ใน REQ-020/021 เมื่อ gate เปิด — ตอนนี้ prototype นำ spec อยู่สำหรับ delta นี้

## DEC-R010-07 — Vision & integrations (NB-022/024)

- **NB-022:** ✅ **ปิดประเด็น — covered** ผู้ใช้ชี้แจง 2026-11-04: "Use Thailand" = **กลุ่มแอปแยกกัน** (TukDaeng = แอปของสะสมหมวดนาฬิกาก่อน ถ้าโอเคค่อย clone เป็นแอปหมวดอื่นภายใต้ umbrella เดียวกัน) **ไม่ใช่** หลายหมวดในแอปเดียว → spec watch-only ถูกต้อง ไม่ต้องเผื่อ multi-category
- **NB-024:** Family Office import/link — gap เต็ม — **เสนอ defer phase 2** (อยู่นอก V1 scope ตามธรรมชาติของ integrations module) บันทึกใน gap report เป็น "phase-2 candidate" — **เสนอพี่ยืนยัน**

## DEC-R010-08 — Gap: process constraints (NB-049/050/051)

- ทั้ง 3 ข้อเป็น **development/ops process rules ไม่ใช่ module spec** (release cycle 2×/wk, prod-env testing, Figma Make/AI workflow)
- **Decision (เสนอ):** จัดเป็น "business constraints" บันทึกใน gap report/requirement record — **ไม่เขียนลง module spec** (module spec ไม่ใช่ที่ของ process rules) — แต่มีผลต่อ planning/QA process ภายนอก spec

## DEC-R010-09 — Duplicates (ไม่นับซ้ำใน gap report)

- NB-025 = NB-002 (IG architecture)
- NB-029 = NB-005+006+007 (3-layer summary)
- NB-032 = NB-009+010 (engagement + Quick Ask)
- Gap Report (REQ-012) รวมเป็นกลุ่มเดียวไม่นับซ้ำ

---

## Clarifications จากพี่มาเต็ม (2026-11-04 — ปิดประเด็นแล้ว 3 ข้อ)

| ประเด็น | คำชี้แจง | ผล |
|---------|-----------|-----|
| NB-022 Use Thailand | กลุ่มแอปแยกกัน — TukDaeng ของสะสมนาฬิกาก่อน ค่อย clone เป็นแอปหมวดอื่น | partial → covered, ไม่ต้องเผื่อ multi-category |
| NB-013/038 WTB/บริการ | พี่คิงหมายถึงโพสต์ธรรมดา | partial → covered |
| NB-046 chat แยก | แชทแจ้งเตือนเฉพาะในแชท ถูกต้องแล้ว | ถอดออกจากประเด็น gap |
| NB-046 system+filter | ยืนยันใน snapshot — system type ต้องกลับ + ต้องมี category filter | spec delta 2 ชิ้น |
| NB-014/036 WA บนฟีด | ยืนยันใน snapshot — อยากได้ปุ่มเล็กบนหน้าฟีดจริง | spec delta (ขอ verdict) |
| NB-047 page-config | เสนอเพิ่มเฉพาะหน้าที่มีของให้ตั้งจริง กัน UI รก | แก้ proposal |
| NB-031 price emphasis | คงดีไซน์ล่าสุด ไม่ขยายตัวเลข | partial → covered |
| NB-039 posting quota | เรื่องอนาคต — รอผู้ใช้จริงเยอะขึ้นค่อยเพิ่ม | gap → defer (ไม่เข้า V1) |
| NB-015–021 ThaiLand News | ยืนยันอีกครั้ง — ภาพตัวอย่างเท่านั้น | design-ref ปิดสมบูรณ์ |
| NB-046 system subtypes | อนุมัติ 3 ประเภทที่เสนอ (security/account/announcement) ทำ delta ไปเสนอพี่คิง | proposal approved |

## คำถาม/ข้อเสนอค้างไปหาพี่คิง (รวมไว้ใน Gap Report)

1. **NB-046 system notifications** — เอา spec delta ที่ทำ (3 ประเภทย่อย) ไปเสนอให้เห็นภาพ รอ feedback
2. ~~NB-039 โควตา~~ — ปิด: defer อนาคต
3. ~~NB-031 price~~ — ปิด: คงดีไซน์เดิม
4. ~~NB-015–021~~ — ปิด: ยืนยันเป็นภาพตัวอย่าง

## ผลลัพธ์ — ปิด verdict ครบแล้ว (2026-11-04)

- ตาราง verdict ใน comparison doc: covered 31 / partial 8 / gap 5 / design-ref 7 — **ทุก partial/gap มีทิศทางตัดสินแล้ว**
- DEC-R010-02: NB-015–021 = design context เท่านั้น (ยืนยันรอบ 2)
- DEC-R010-03/04: NB-031 คงดีไซน์เดิม / NB-039 defer อนาคต / NB-033 rule เขียนแล้ว + ทำใน prototype แล้ว
- DEC-R010-05: WA button บน feed header ✅ + page-config selective ✅ + gear icon ✅ — ทำใน prototype ครบ
- DEC-R010-06: system type (3 subtypes) + category filter — ✅ ทำใน prototype แล้ว
- DEC-R010-07/08: NB-024 defer phase 2 / NB-049–051 = process constraints นอก spec

## Prototype deltas ที่ implement แล้ว (เพื่อเสนอพี่คิงรอบเดียว)

| Delta | NB | ใน fo-flow |
|-------|----|-----------|
| System notifications + category filter | NB-046 | seed 4 rows (security→change_pwd, post hidden→al_unavail, verified→about_account, update→about_app) + filter chips ทั้งหมด/ระบบ/กิจกรรม/Watch Alert |
| WA button บน feed header | NB-014/036 | ไอคอนนาฬิกาข้อมือ ข้าง (+) → `walerts`, guest gated |
| Settings icon = gear | NB-048 | `pf-menu` burger → gear บน own profile head |
| View counting (scroll-pass) | NB-033 | +1 ต่อ card ที่โผล่ ≥55%, เลื่อนซ้ำนับซ้ำ, counter อัปเดตจริง |

> ทุก delta นี้ยังต้อง sync ลง module specs ตอน REQ-020 เมื่อ gate เปิด — prototype นำ spec อยู่ (เดโมก่อนเสนอพี่คิง ตามคำสั่งผู้ใช้)
