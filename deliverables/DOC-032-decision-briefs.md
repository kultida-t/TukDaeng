# DOC-032 — Decision Briefs (Triage Open Decisions)

| รายการ | ข้อมูล |
|---|---|
| Date | 2026-11-04 · Asia/Bangkok |
| Task | DOC-032 [`0f7ca805`] — triage open decisions ใน `docs/DECISION_LOG.md` §10 |
| Status | **DRAFT — รอ owner sign-off** · เอกสารนี้เป็น proposal เท่านั้น ยังไม่แก้ spec/register/prototype |
| Gate | ข้อที่ approve แล้วค่อยเปิด task แยก implement — product-level decision ลง `DECISION_LOG.md` §8 ต่อ `DEC-49`; module-level ปิดใน `Open Decisions` ของ spec เจ้าของ + อัปเดต index §6 |

## 0. วิธีอ่าน

- ทุกข้อมี: **สถานะปัจจุบัน + file refs → options → recommendation → คำถามถึงเจ้าของ**
- กลุ่ม A = ตัดสินได้จาก evidence ใน spec/repo (draft recommendation พร้อม sign-off)
- กลุ่ม B = blocked รอ input ภายนอก (question list ส่งเจ้าของ — ห้ามตัดสินเอง)
- กลุ่ม C = doc-only contract note (draft เนื้อความเสนอ — ไม่มี DEC id)
- หลักการเดิม: fact อยู่ register of record ที่เดียว; brief นี้อ้าง DEC id เท่านั้น ไม่คัดลอกเนื้อ decision

## 1. Cross-check — canonical index §6 vs spec ต้นทาง (51 rows)

เทียบ `DECISION_LOG.md` §6 กับ `Open Decisions` section ของ spec 11 เล่มครบทุกแถว:

| Namespace | Spec (register of record) | Rows | เทียบ index |
|---|---|---|---|
| `BO-MARKET-DEC-001–004` | `BackOffice/06_MARKET_DATA_MODULE.md` §26 | 4 open | ✅ ตรง |
| `BO-DIR-DEC-001–004` | `BackOffice/07_DIRECTORY_MODULE.md` §18 | 4 open | ✅ ตรง |
| `BO-AUDIT-DEC-001–004` | `BackOffice/08_AUDIT_LOG_MODULE.md` §17 | 4 open | ✅ ตรง |
| `BO-WA-DEC-001–003` | `BackOffice/11_WATCH_ALERT_MODULE.md` §20 | 3 resolved | ✅ ตรง (spec mark `(resolved)`) |
| `SUP-DEC-001–004` | `BackOffice/12_HELP_SUPPORT_MODULE.md` §19 | 4 open | ✅ ตรง |
| `DEL-DEC-001–006` | `BackOffice/13_ACCOUNT_DELETION_MODULE.md` §20 | 2 open (002, 005) | ✅ ตรง |
| `NOTI-DEC-001–005` | `BackOffice/14_NOTIFICATIONS_MODULE.md` §19 | 5 open (4 deferred Phase 2 ตาม NTF-RSTR-001) | ✅ ตรง |
| `REP-DEC-001–004` | `BackOffice/15_REPORTS_ANALYTICS_MODULE.md` §23 | 4 open (Phase 2 module) | ✅ ตรง |
| `SET-DEC-002–004` | `BackOffice/16_ADMIN_SETTINGS_MODULE.md` §22 | 3 open | ✅ ตรง |
| `BO-OPT-001–005, 009, 010` | `BackOffice/17_OPTION_MASTER_MODULE.md` §21 | 7 resolved | ✅ ตรง |
| `BO-DEC-001–006` | `BackOffice/BO_MASTER_BASELINE.md` §10 | 6 rows (003 de-facto resolved) | ✅ ตรง |

**พบ doc hygiene 1 จุด (ไม่ใช่ mismatch ของ index):** `BO_FINAL_REVIEW_AND_HANDOFF.md` §6 (priority view) ยัง list `BO-DEC-003`/`DEL-DEC-003` เป็น P0 "anonymization timing" ทั้งที่ resolved แล้วโดย `DEL-DEC-006` (2026-09-08) — index §6 annotate ไว้ถูกต้อง ("แถว baseline ยังไม่ได้ annotate") แต่ตาราง P0 ใน FINAL_REVIEW stale → เสนอแก้ใน gated task รอบถัดไป (อยู่นอก scope task นี้ เพราะห้ามแก้ spec)

**สรุป:** index v1.1 ตรง spec ต้นทาง 51/51 แถว — ไม่มีการแก้ index ใน task นี้

## 2. กลุ่ม A — ตัดสินได้จาก evidence ใน spec/repo (draft recommendation)

### A1. BO-DEC-001 — BO language mode

- **สถานะ:** open · record: `BackOffice/BO_MASTER_BASELINE.md` §10 · index §6
- **Evidence:** baseline platform table (`BO_MASTER_BASELINE.md` §9) ระบุ "ภาษาไทยเป็นหลัก ใช้ English technical term ได้เมื่อจำเป็น"; prototype `Prototypes/bo-prototype.html` ทั้งระบบเป็นภาษาไทยและ lock แล้วทุก protected screen; `BO_FINAL_REVIEW_AND_HANDOFF.md` §8 dev note "Admin UI ใช้ภาษาไทยเป็นหลัก"
- **Options:** (1) Thai-only V1 (2) Thai primary + EN toggle V1 (3) full bilingual
- **Recommendation:** **Option 1 — confirm "Thai primary V1, English deferred"** ตาม spec rec เดิม; ไม่เพิ่ม EN toggle ใน V1 เพราะ prototype lock แล้วและ FO ฝั่ง user เท่านั้นที่ต้อง bilingual
- **คำถามถึงเจ้าของ:** ยืนยันไม่มี admin user ที่ต้องใช้ภาษาอังกฤษใน V1 ใช่ไหม
- **✅ APPROVED 2026-11-04 (พี่มาเต็ม — "ข้ออื่นโอเคตามนั้น")**

### A2. BO-DEC-003 — Account deletion anonymization timing

- **สถานะ:** open ใน baseline table แต่ **de-facto resolved** — `DEL-DEC-006` ยืนยัน lifecycle ขั้นเดียว (เก็บถาวร+ลบตัวตน พร้อมกันที่ครบ grace 30 วัน) เมื่อ 2026-09-08 · record: `BO_MASTER_BASELINE.md` §10 + `13_ACCOUNT_DELETION_MODULE.md` §20
- **Options:** (1) annotate แถว baseline ให้ชี้ DEL-DEC-006 (2) คง open ไว้
- **Recommendation:** **Option 1 — ปิดแถวนี้โดยชี้ `DEL-DEC-006`** (spec rec ใน baseline เองก็เขียน "ใช้ 30-day grace ตาม FO decision") — การแก้ตัว spec ทำใน implement task
- **คำถามถึงเจ้าของ:** ไม่มี (auto-consistent) — sign-off เป็นการอนุมัติ annotate
- **✅ APPROVED 2026-11-04 (พี่มาเต็ม)**

### A3. BO-DEC-004 — Admin remove asset permission

- **สถานะ:** open · record: `BO_MASTER_BASELINE.md` §10 · index §6
- **Evidence:** `04_ASSET_MANAGEMENT_MODULE.md` มี moderation action `Permanently Hidden` เป็น contract แล้ว — ต้อง confirmation + reason, owner เห็น read-only, ไม่นับ portfolio value (§ asset state contract ~L390–401); audit baseline ครอบ destructive/public-impact actions
- **Options:** (1) admin remove = `Permanently Hidden` + reason + audit (2) เพิ่ม hard delete (3) remove ต้อง approval ขั้นสูงเสมอ
- **Recommendation:** **Option 1 — "remove" ใน baseline = `Permanently Hidden` action ที่มีอยู่แล้ว** (reason required + audit); ไม่มี hard delete ใน Phase 1; กรณี high-value dispute ให้ผูกกับ approval workflow ของ SET-DEC-004 (ข้อ A9) แทนการทำ approval เฉพาะ asset
- **คำถามถึงเจ้าของ:** ตกลงให้ high-value/disputed asset ใช้ approval path ร่วมกับ high-risk setting หรืออยากได้ asset-specific approval แยก
- **✅ APPROVED 2026-11-04 (พี่มาเต็ม) — high-value ใช้ approval path ร่วมกับ high-risk setting (A13)**

### A4. BO-DEC-005 — Board public SEO web requirement

- **สถานะ:** open — P2 · record: `BO_MASTER_BASELINE.md` §10 · index §10
- **Evidence:** FO V1 เป็น app-only (ไม่มี public web surface — guest gate/guest view อยู่ในแอปตาม `00_NAV` และ guest-gate spec); ไม่มี requirement ใน `SourceInputs/requirements/` snapshot 51 ข้อที่ขอ public web/SEO
- **Options:** (1) mobile-app only, ไม่มี SEO scope (2) วาง public web board phase อนาคต
- **Recommendation:** **Option 1 — "mobile Board content only, no public web SEO in V1"** ตาม spec rec เดิม; ถ้าอนาคตต้องการ web SEO เปิด requirement ใหม่
- **คำถามถึงเจ้าของ:** ไม่มี — sign-off ยืนยัน out-of-scope
- **✅ APPROVED 2026-11-04 (พี่มาเต็ม)**

### A5. BO-DEC-006 — Integration map FO↔BO รูปแบบใหม่

- **สถานะ:** open · record: `BO_MASTER_BASELINE.md` §10 · index §6 + §7.3
- **Evidence:** DOC-031 re-anchor `INT-DEC-005` → `BO-DIR-DEC-001` แล้ว (commit `6c1e06f`) ลด urgency; integration facts กระจายอยู่ครบแล้ว: `00_GLOBAL_RULES_MODULE.md` §12 BO-to-FO Sync Rules (ตาราง + sync timing contract), per-module "Cross-Module Integration"/"FO Integration Guidelines" sections (เช่น `17_OPTION_MASTER_MODULE.md` §22), `FO-BO-001-coverage-audit.md` เป็น coverage map เชิง decision
- **Options:** (1) สร้าง integration map file กลางใหม่ (2) คง distributed model — map รวม = index ในเอกสารเดียวที่ชี้ไป module sections (3) คง distributed โดยไม่มี index
- **Recommendation:** **Option 2 — คง distributed model + เพิ่ม "Integration Reference" index เบา ๆ** ในเอกสารระดับ docs/ (เช่น section ใน DECISION_LOG หรือ README_MODULE_INDEX) ที่ชี้ไป section เจ้าของแต่ละตัว — ไม่สร้าง register ใหม่ ไม่ duplicate fact
- **คำถามถึงเจ้าของ:** โอเคกับ lightweight index หรือต้องการ full integration map document
- **✅ APPROVED 2026-11-04 (พี่มาเต็ม) — distributed model + lightweight index**

### A6. BO-MARKET-DEC-001 — Manual sync trigger บน BO

- **สถานะ:** open · record: `06_MARKET_DATA_MODULE.md` §26
- **Evidence:** spec rec "เปิดเฉพาะ operations permission พร้อม audit และ rate-limit guard"; The Watch API contract (`BO_FINAL_REVIEW` §5) = backend sync/cache เท่านั้น BO CRUD/override ตาม permission — manual trigger เข้า pattern เดียวกัน
- **Options:** (1) เปิดเฉพาะ ops permission + audit + rate-limit (2) ไม่เปิดเลย (3) เปิดทุก role
- **Recommendation:** **Option 1 ตาม spec rec** — operations-only + audit `MARKET_SYNC_MANUAL` (หรือชื่อตาม convention) + rate-limit guard
- **คำถามถึงเจ้าของ:** rate-limit เพดานเท่าไหร่ (เช่น 1 ครั้ง/ชม.ต่อ admin) — ถ้าไม่มีคำตอบใช้ค่าอนุรักษ์ใน spec
- **✅ APPROVED 2026-11-04 (พี่มาเต็ม) — ops-only + audit + rate-limit (เพดานใช้ค่าอนุรักษ์ใน spec)**

### A7. BO-MARKET-DEC-003 — Mapping warning queue แยกหรือไม่

- **สถานะ:** open · record: `06_MARKET_DATA_MODULE.md` §26
- **Options:** (1) Phase 1 read-only warning ตาม spec rec (2) queue แยกพร้อม workflow
- **Recommendation:** **Option 1 — Phase 1 = warning/read-only**; correction workflow เป็น backend/provider process ไม่ใช่ BO UI
- **✅ APPROVED 2026-11-04 (พี่มาเต็ม)**

### A8. BO-AUDIT-DEC-001/002/003/004 — Audit policy ชุด 4 ข้อ

- **สถานะ:** 4 open · record: `08_AUDIT_LOG_MODULE.md` §17
- **Evidence:** AC-BO-AUDIT-017 contract บังคับ masked payload/ห้าม secret แล้ว; baseline §9 บังคับ "audit retention ≥1 ปี"
- **Recommendation รายข้อ:**
  - **001 (retention >1 ปี):** adopt rec — "เก็บนานกว่า 1 ปีสำหรับ security/export/sensitive events ถ้า storage/compliance อนุญาต"; ตัวเลข retention จริงยังผูกกับ retention cluster (กลุ่ม B1) ไม่กำหนดตัวเลขใน brief นี้
  - **002 (write fail):** adopt rec — block high-risk action, queue retry สำหรับ low-risk read/report events
  - **003 (PII redaction):** adopt rec — masked payload default + redaction event แยก (สอดคล้อง AC-BO-AUDIT-017 เดิม)
  - **004 (SIEM):** defer — "future phase, ไม่มีใน Phase 1/2 scope"
- **คำถามถึงเจ้าของ:** 004 — SIEM อยู่ใน roadmap compliance ไหม (ตอบได้ภายหลัง ไม่ block)
- **✅ APPROVED 2026-11-04 (พี่มาเต็ม) — adopt recs ทั้ง 4 ข้อย่อย; 004 = defer future phase**

### A9. SUP-DEC-001/002/003/004 — Help/Support policy ชุด 4 ข้อ

- **สถานะ:** 4 open (001 = P1) · record: `12_HELP_SUPPORT_MODULE.md` §19
- **Evidence:** Broadcast notification deferred Phase 2 (`14_NOTIFICATIONS_MODULE.md` NTF-RSTR-001 note); FO Help = contact-only LINE/Phone/Email (`BO_FINAL_REVIEW` §5 locked decision row); allowed HTML tag list + sanitizer เป็น contract ใน spec §20 แล้ว
- **Recommendation รายข้อ:**
  - **001 (policy publish noti):** adopt rec — **ไม่ส่งใน Phase 1** (broadcast infra ยังไม่มี); ถ้าต้องการภายหลัง → task ใหม่ใน module 14 Phase 2
  - **002 (channel type นอก 5 ประเภท):** adopt rec — **fixed list Phase 1** (FO contact-only 3 ช่องทางยืนยันทิศเดียวกัน)
  - **003 (HTML tag นอก allowed list):** adopt rec — **allowed list เท่านั้น**; เพิ่ม tag = task ใหม่พร้อมปรับ sanitizer
  - **004 (policy version retention):** adopt rec — **เก็บ Archived ตลอดใน Phase 1** (policy 2 ตัว เวอร์ชันไม่เยอะ); retention policy เป็นส่วนหนึ่งของ retention cluster B1 ถ้าจำเป็น
- **คำถามถึงเจ้าของ:** ไม่มี — sign-off รวมได้
- **✅ APPROVED 2026-11-04 (พี่มาเต็ม) — adopt recs ทั้ง 4 ข้อย่อย**

### A10. BO-DIR-DEC-001 — FO Directory activation (P1)

- **สถานะ:** open — P1 · record: `07_DIRECTORY_MODULE.md` §18 · index §6/§10 · DOC-031 re-anchor target
- **Evidence (แข็งแรง):** FO drawer 9 รายการ (Watch Shops, Consignment Center, Authentication Center, Community ฯลฯ) เป็น placeholder rows ทั้งหมด — `FrontOffice/00_NAVIGATION_AND_CROSS_MODULE_FLOW.md` AC-NAV-022 + §future-menu (กดแล้ว toast, ไม่มี route จริง, production copy = `เร็ว ๆ นี้`); BO spec rec: placeholder-only จนกว่า Product ยืนยัน; ไม่มี NB requirement เปิด Directory ใน `SourceInputs/requirements/` snapshot
- **Options:** (1) placeholder-only V1 (2) เปิด Directory subset (3) full activation
- **Recommendation:** **Option 1 — placeholder-only ใน V1** (constraint เดิมจาก INT-DEC-005→BO-DIR-DEC-001: BO ไม่ถือ Active = production route เปิด); activation ภายหลัง = requirement ใหม่
- **✅ APPROVED 2026-11-04 (พี่มาเต็ม — "ให้เป็น placeholder ก่อน กดแล้วเด้ง เร็วๆ นี้"):** FO Directory/Community surfaces เป็น placeholder ต่อ กดแล้ว toast `เร็ว ๆ นี้` — implement = ปิดแถวใน spec + อัปเดต index ทำใน implement task แยก
- **ผลกระทบลูกโซ่:** ทำให้ BO-DIR-DEC-002/004 (taxonomy, map provider) urgent ลดลง → เหลือรอ product/vendor input ตามกลุ่ม B
- **คำถามถึงเจ้าของ:** ~~ยืนยัน Directory ไม่มีใน V1 launch scope~~ (ตอบแล้ว)

### A11. BO-DIR-DEC-003 — Consignment Centers FK

- **สถานะ:** open · record: `07_DIRECTORY_MODULE.md` §18
- **Options:** (1) FK-ready ไม่บังคับ ตาม spec rec (2) ผูก workflow Phase 1 (3) ตัด consignment binding ออกทั้งหมด
- **Recommendation เดิม:** Option 1 — FK-ready field, ยังไม่บังคับ
- **✅ APPROVED พร้อมปรับ 2026-11-04 (พี่มาเต็ม — "ตัดเรื่องฝากขายออกไปก่อน ในหน้า FO ไม่มีส่วนนี้แล้ว"):** **Option 3 — ไม่ผูก consignment workflow เลย** (ตัดทิ้งไม่ใช่แค่ FK-ready) — FO มีแค่ flag `Consignment` แบบ copy บน portfolio (sign-off `14_PORTFOLIO` D12) + placeholder drawer row ไม่มี consignment surface จริง; ถ้าอนาคต Directory activation ค่อยตัดสิน binding ใหม่รอบนั้น

### A12. SET-DEC-002 — Security policy fields แก้ได้จริง

- **สถานะ:** open · record: `16_ADMIN_SETTINGS_MODULE.md` §22; context: §10 Security Policy Settings table (L856–869) + nav-deferred table (L110: "เอาออกจาก nav ตาม commit `20d705d`; รอ SET-DEC-002")
- **Evidence:** spec §10 list field แล้วว่า login method/SSO = fixed (`No`), ส่วน idle timeout 8h / max session 24h / failed login 5 / lockout 15min / IP whitelist / password policy = "Admin edit only if policy allows"; security change ต้อง audit + re-auth ตาม spec
- **Options:** (1) เปิดแก้บาง field ผ่าน policy-gated UI (2) freeze ทั้งหมด แก้ผ่าน config/deploy เท่านั้น (3) freeze Phase 1 แล้ว reopen Phase 2
- **Recommendation:** **Option 3 — freeze ทั้ง section ใน Phase 1** (nav ถูกถอดแล้วตาม `20d705d`, ไม่มี UI ให้แก้จึงไม่มีช่องทางผิด policy); เปิด Security Policy section Phase 2 พร้อม decision ชุดเดียวว่า field ไหน editable — rec: session/lockout fields editable, auth method/IP whitelist = admin-access-gated
- **คำถามถึงเจ้าของ:** Phase 1 มี use case จริงที่ admin ต้องปรับ session/lockout ไหม — ถ้าไม่มี freeze ตาม rec ได้เลย
- **✅ APPROVED 2026-11-04 (พี่มาเต็ม) — freeze ทั้ง section Phase 1, reopen Phase 2**

### A13. SET-DEC-004 + REP-DEC-004 — Sensitive export approval (P1, linked)

- **สถานะ:** 2 open (linked) · record: `16_ADMIN_SETTINGS_MODULE.md` §22 + `15_REPORTS_ANALYTICS_MODULE.md` §23 · P1 ใน FINAL_REVIEW §6
- **Evidence:** spec ตอนนี้บังคับ permission + confirmation + reason + audit สำหรับ sensitive export (`15_REPORTS` L354, `16_ADMIN_SETTINGS` L906, `00_GLOBAL_RULES` L473) — ยังไม่มี approval workflow; Reports module เป็น Phase 2 แล้ว จึงกระทบแค่ Admin Settings + Audit ใน Phase 1
- **Options:** (1) permission+reason+audit พอ (ไม่เพิ่ม approval) (2) เพิ่ม 1-step approval สำหรับ sensitive export (3) approval เฉพาะ export ที่มี PII เกิน threshold
- **Recommendation:** **Option 1 สำหรับ Phase 1 — permission-gated + reason + audit เป็นพอ**; เพิ่ม Option-2 approval เป็น backlog Phase 2 ผูกกับ Roles & Permissions policy (module 16 มี matrix อยู่แล้ว) — เหตุผล: Phase 1 export scope เล็ก, approval workflow = operational overhead ที่ยังไม่มี infra (no approval engine)
- **คำถามถึงเจ้าของ:** compliance/ops ต้องการ human-approval ก่อน export PII ตั้งแต่วันแรกไหม — ถ้าใช่เปลี่ยนเป็น Option 2
- **✅ APPROVED 2026-11-04 (พี่มาเต็ม) — Option 1: permission+reason+audit พอ Phase 1; approval = Phase 2 backlog**

### A14. NOTI-DEC-001/002/004/005 — Broadcast/provider decisions (Phase 2 deferred)

- **สถานะ:** 4 open, deferred ตาม NTF-RSTR-001 note (`14_NOTIFICATIONS_MODULE.md` §19 header) · index §6 mark "Phase 2 deferred"
- **Options:** (1) formal defer — ปิด Phase 1 ไม่ตัดสิน (2) ตัดสินเผื่อ Phase 2
- **Recommendation:** **Option 1 — mark "deferred to Phase 2" เป็น decision อย่างเป็นทางการ** (NTF-RSTR-001 defer note มีอยู่แล้ว แค่ยังไม่ได้บันทึกเป็น verdict); NOTI-DEC-001 surface question จะตอบง่ายขึ้นเมื่อ DEC เกี่ยวกับ FO notification types ครบ (ปัจจุบัน V1 = Like/Comment/Follow/Watch Alert + system 3 subtypes ตาม DEC-43)
- **✅ APPROVED 2026-11-04 (พี่มาเต็ม — "โอเคตามนี้") — formal defer ทั้ง 4 ข้อ**

### A15. REP-DEC-001/002/003 — Reports decisions (Phase 2 module)

- **สถานะ:** 3 open · record: `15_REPORTS_ANALYTICS_MODULE.md` §23; module 15 ถูกเลื่อน Phase 2/future ทั้งเล่ม (BO-15-v0.2, 2026-09-14 — ตัดเมนูออกจาก prototype แล้ว)
- **Recommendation:** **formal defer ทั้ง 3 ข้อ** — ตัดสินพร้อม Phase 2 scoping; REP-DEC-001 (export file retention) อาจต้องคำตอบก่อนถ้า Phase 1 มี export feature ใด ๆ → ผูก retention cluster B1
- **คำถามถึงเจ้าของ:** Phase 1 มี export จริงไหม (เช่น audit export / deletion report export) — ถ้ามี REP-DEC-001 ย้ายไปรวม B1
- **✅ APPROVED 2026-11-04 (พี่มาเต็ม — "โอเคตามนี้") — formal defer ทั้ง 3 ข้อ (REP-DEC-001 ผูก B1 ถ้า Phase 1 มี export)**

### A16. Consignment cleanup ใน FO portfolio (owner direction ใหม่ — เกิดจาก sign-off A11)

- **สถานะ:** พี่มาเต็มสั่ง "ต้องเคลียร์ออกให้ไม่สับสน" · record: `FrontOffice/14_PORTFOLIO_MODULE.md` sign-off D12
- **ของที่ยังค้างอยู่ (FO):**
  1. **foot-note copy ใต้ยอดรวมพอร์ต (ผู้ใช้เห็นจริง)** — `14_PORTFOLIO_MODULE.md` L315: ข้อความ TH/EN กล่าวถึง `สินค้าฝากขาย`/`consignment items are excluded`
  2. **`own` flag ใน data model (dormant — ไม่มี seed/UI set เลย)** — `own === false` = consignment หลุด `pfoEligible` (L57/166/205)
  3. Consignment Center drawer row — เป็น placeholder อยู่แล้วตาม A10 (ไม่ต้องทำอะไร)
- **Options:** (1) ลบเฉพาะข้อความ foot note เก็บ flag dormant (2) ลบทั้ง copy + `own` flag/เงื่อนไขที่เกี่ยว
- **✅ APPROVED 2026-11-04 (พี่มาเต็ม):** **Option 2 — ลบ consignment ออกจาก FO surfaces ทั้งหมด** (foot note TH/EN + `own` flag + scope notes) — supersede sign-off D12 ส่วน "copy + flag" → product-level decision ลง `DECISION_LOG.md` §8 เป็น `DEC-50` ใน implement task
- **ข้อควรระวังตอน implement:** ถอด `own !== false` ออกจาก `pfoEligible` (L57/166/205) พร้อมกัน; foot note แก้เหลือ "นับเฉพาะนาฬิกาในสถานะ ลงขาย โชว์ และซ่อน" ทั้ง TH/EN; เช็ก `fo-flow` prototype ว่า foot note render จริงไหม — ถ้า render ต้องแก้ prototype ด้วย (FO prototype ไม่อยู่ใน protected list แต่ต้อง sync test เคสที่เกี่ยว)

## 3. กลุ่ม B — Blocked รอ input ภายนอก (question list ส่งเจ้าของ)

### B1. Retention cluster — `DEL-DEC-002` + `BO-DEC-002` + `SET-DEC-003` (+`NOTI-DEC-003`, +`REP-DEC-001` ถ้า Phase 1 มี export) — **P0**

- **สถานะ:** open — P0 (`BO_FINAL_REVIEW` §6) · records: `13_ACCOUNT_DELETION` §20, `BO_MASTER_BASELINE` §10, `16_ADMIN_SETTINGS` §22
- **Blocker:** Legal/compliance — ตัวเลข retention ต่อ entity (chat, report, audit log, notification delivery log, export file) ต้องมาจาก policy ภายนอก spec; ผลกระทบ: data purge job, data model, anonymization, dispute handling
- **Recommended defaults (เสนอให้ Legal "confirm หรือปรับ" แทนการตอบคำถามเปล่า — อิงมาตรฐาน marketplace ทั่วไป + baseline ที่ spec ล็อกไว้แล้ว):**

| Entity | เสนอ default | เหตุผลประกอบ |
|---|---|---|
| Chat | เก็บ 1 ปีหลังข้อความสุดท้ายของ thread; ผู้ใช้ถูกลบ → ลบตัวตนตาม lifecycle เดิม | ครอบ dispute window ทั่วไปของ marketplace (30–90 วัน) + เผื่อเวลาฟ้องร้อง |
| Report/moderation records | เก็บตลอดอายุบัญชี + 2 ปีหลังบัญชีปิด | เป็น audit trail ของการตัดสิน moderation ต้องย้อนดูได้นานกว่าเนื้อหา |
| Audit log | ≥1 ปีตาม baseline (`BO_MASTER_BASELINE` §9); security/sensitive events = 3 ปีถ้า storage อนุญาต | ตรง spec rec BO-AUDIT-DEC-001 |
| Notification delivery log | 90 วัน | เป็น operational trace (ส่งถึง/ไม่ถึง) ไม่ใช่ record นิติกรรม — สั้นกว่า audit ได้ |
| Export file | auto-expire 30 วันแล้วลบไฟล์ | ไฟล์ export มี PII — ยิ่งค้างนานยิ่งเสี่ยง |
| จุดเริ่มนับ | event date เป็นหลัก; ข้อมูลที่ผูกกับบัญชีนับตาม account lifecycle (grace → anonymize ตาม DEL-DEC-006) | สอดคล้อง lifecycle ที่ lock แล้ว |

- **คำถามส่ง Legal/Compliance (ให้ confirm ตารางข้างบนหรือแก้เป็นตัวเลขของตัวเอง):**
  1. Chat retention 1 ปีหลังข้อความสุดท้าย พอสำหรับ dispute ไหม หรือกฎหมายบังคับต่ำกว่า/สูงกว่านี้
  2. Report/moderation records 2 ปีหลังปิดบัญชี โอเคไหม
  3. Audit ≥1 ปี (security/sensitive 3 ปี) ตรง compliance ที่ต้องการไหม
  4. Notification delivery log 90 วัน แยกจาก audit retention ได้ไหม
  5. Export file expiry 30 วัน โอเคไหม (ถ้า Phase 1 มี export จริง)
  6. นับจาก event date vs account lifecycle ตามตาราง — ตรงนิยาม "retention" ที่ Legal ต้องการไหม
- **Owner direction (2026-11-04):** ✅ defaults ตารางข้างบน = ข้อเสนอฝั่งเราที่พี่มาเต็มยืนยันแล้ว ("เอาตามที่แนะนำ") — เหลือรอ Legal confirm หรือปรับตัวเลข

### B2. DEL-DEC-005 — Email hash กันสมัครซ้ำ

- **สถานะ:** open — รอ Legal · record: `13_ACCOUNT_DELETION_MODULE.md` §20
- **Blocker:** privacy/compliance — การเก็บ hash อีเมลหลังลบตัวตนอาจขัด "ลบตัวตนสมบูรณ์"
- **คำถามส่ง Legal/Privacy:**
  1. เก็บ salted-hash อีเมลเพื่อเช็ค re-registration ถือเป็น "เก็บข้อมูลส่วนบุคคล" หลัง anonymize ไหม
  2. ถ้าเก็บได้ — purpose limitation + retention ของ hash ต้องประกาศใน Privacy Policy แบบไหน
  3. Phase 1 (สมัครใหม่ = บัญชีใหม่ ตาม §10.3) รับความเสี่ยง re-registration abuse ได้ไหมจนกว่าจะมีคำตอบ

### B3. BO-MARKET-DEC-002 — FX rate source USD→THB — **P0**

- **สถานะ:** open — P0 · record: `06_MARKET_DATA_MODULE.md` §26
- **อยู่ส่วนไหน:** งาน backend data-feed — FX rate ใช้แปลงราคา USD→THB ใน price index ฝั่ง Market Data (module 06); contract คือ backend sync ลง DB TukDaeng ก่อน BO/FO อ่าน (`BO_FINAL_REVIEW` §5) — **P0 หมายถึง "ก่อน production launch" ไม่ใช่ block งาน spec/prototype ตอนนี้** ตอบได้ตอนทีมเชื่อม API จริง
- **Blocker:** vendor/ops — ต้องเลือก central FX source (BOT, commercial provider, ฯลฯ) + เก็บ fx metadata ใน price index ตาม spec rec
- **คำถามส่ง Dev/Ops + Product:**
  1. FX source เป้าหมายคือใคร (เช่น Bank of Thailand daily rate, provider API)
  2. Update cadence (daily intraday, on-demand)
  3. Fallback เมื่อ source down — ใช้ rate ล่าสุดที่ cache หรือ halt price display
  4. ต้องเก็บ fx metadata อะไรบ้างใน price index (source, timestamp, rate)
- **Owner direction (2026-11-04):** รอข้อมูล API จากทีม external — ไม่ส่งคำถามตอนนี้ คำถามเตรียมไว้ใช้ตอนได้ข้อมูลมาเชื่อม

### B4. BO-MARKET-DEC-004 — The Watch API production plan/quota — **P0**

- **สถานะ:** open — P0 · record: `06_MARKET_DATA_MODULE.md` §26
- **อยู่ส่วนไหน:** งาน backend data-feed เช่นเดียวกับ B3 — The Watch API คือแหล่งข้อมูลราคา/spec นาฬิกาภายนอกที่ backend ดึงมา cache ลง DB TukDaeng ก่อน BO (Market Data) และ FO (price index, Watch Alert criteria) ใช้งาน — **P0 = ก่อน go-live** ไม่ใช่งานด่วนของ spec ตอนนี้; ตอบพร้อมกันเมื่อทีม backend เริ่มเชื่อม
- **Blocker:** Dev/Ops ต้องยืนยัน plan, quota, endpoint access, rate limit ก่อน launch (ตาม spec rec)
- **คำถามส่ง Dev/Ops:**
  1. Production plan/tier ของ The Watch API ที่จะ subscribe คืออะไร
  2. Quota/rate limit ต่อช่วงเวลา และ sync cadence ที่รองรับ
  3. Endpoint access (prod vs sandbox) + auth method
  4. Backfill strategy ตอน onboarding และ retry/dead-letter เมื่อ quota หมด
- **Owner direction (2026-11-04):** รอข้อมูล API จากทีม external — ไม่ส่งคำถามตอนนี้ คำถามเตรียมไว้ใช้ตอนได้ข้อมูลมาเชื่อม

### B5. BO-DIR-DEC-002 — Community category taxonomy

- **สถานะ:** open · record: `07_DIRECTORY_MODULE.md` §18
- **อยู่ตรงไหน:** `Community` = แถวสุดท้ายใน hamburger drawer ฝั่ง FO — เมนูข้าง 9 แถว placeholder (Watch Brands, Watch Price Index, Watch Shops, Accessories Shop, Repair Shop, Auction Center, Consignment Center, Authentication Center, **Community**) ตาม `FrontOffice/00_NAVIGATION_AND_CROSS_MODULE_FLOW.md` AC-NAV-022; ตอนนี้กดแล้วแค่เด้ง toast ไม่มีหน้าจริง
- **Blocker:** Product — "Community category" หมายถึง Board (บทความ/editorial ที่มีอยู่แล้ว), Social feature หรือ Directory item แยก ต้อง map taxonomy ก่อนเปิด FO (spec rec)
- **Owner direction (2026-11-04):** พี่มาเต็มยืนยัน `Community` เป็น placeholder ต่อ — กดแล้วเด้ง `เร็ว ๆ นี้` → คำถาม taxonomy จอดไว้จนกว่า Directory activation จริง (ผูก A10 ที่ approve แล้ว)
- **คำถามส่ง Product:**
  1. `Community` ใน drawer map กับ Board module หรือเป็น Directory concept แยก
  2. ถ้า Directory — taxonomy เจ้าของคือใคร (BO Directory table หรือ Option Master group)
  3. มี plan เปิด Community surface ใน V1 ไหม (คาดว่าไม่ ตาม A10)

### B6. BO-DIR-DEC-004 — Map provider production

- **สถานะ:** open · record: `07_DIRECTORY_MODULE.md` §18
- **Blocker:** vendor selection + quota — แต่ urgency ต่ำมากถ้า A10 (placeholder-only) ได้ sign-off เพราะไม่มี FO surface ใช้ map ใน V1
- **คำถามส่ง Dev/Ops (ตอบได้เมื่อ Directory เปิด):**
  1. Provider shortlist (Google Maps / Longdo / OSM)
  2. Quota/pricing ต่อภูมิภาคไทย
  3. Fallback เมื่อ provider unavailable (AC-BO-DIR-008 บังคับ edit form ต้องใช้ได้)

### B7. DEC-29 — Legal TH ฉบับจริง (conditional, ไม่ใช่ open decision ใหม่)

- **สถานะ:** closed-conditionally · record: `deliverables/FO-TEST-001-22-decision-register.md`; draft อยู่ `deliverables/FO-TEST-001-LEGAL-TH-draft.md`
- **Blocker:** เจ้าของ — รอเนื้อหา Terms/Privacy ภาษาไทยฉบับจริงมาแทน draft
- **คำถามส่งเจ้าของ:** เอกสาร legal จริงจะส่งมาเมื่อไหร่ / draft ปัจจุบันใช้เป็น placeholder ต่อได้ไหมจนกว่าจะมีฉบับจริง

### B8. `O-01`–`O-09` — Money display rules (DRAFT)

- **สถานะ:** pending-confirm ทั้ง 9 ข้อ + open items · record: `docs/money-display-rules.md` §9 — **DRAFT รอพี่คิง ห้ามแตะเอกสารตาม DEC-42** (index §7.1; §10 ไม่นับรวม แต่ยังค้าง confirm)
- **Blocker:** พี่คิง sign-off; O-02 (ทศนิยม A/B/C) mark "ต้องตัดสินใหม่"
- **Owner context (2026-11-04):** เอกสารนี้เป็น reference input ที่ได้รับจากทีมอื่นผ่านพี่คิง — เอามาดูแนวทางเฉย ๆ ยังไม่ implement และไม่ใช่ blocker ของงานปัจจุบัน; คงสถานะ DRAFT ไว้ ไม่เร่งตอบ
- **คำถามส่งพี่คิง:**
  1. Confirm O-01/03/04/05/06/07/08/09 ตาม proposed ในตารางไหม
  2. O-02 เลือก A/B/C ข้อไหน
  3. Open items §9 (Settings หน่วย, copy `—` vs `No market price`, `Median` unit, non-money counter, migrate mock→number) ต้องการตัดสินรายข้อไหนในรอบนี้
- **หมายเหตุ:** DEC-42 (`฿` ทั้งแอป FO) resolved แล้ว — doc นี้คง draft ตามคำสั่งเจ้าของ ห้ามแก้จนกว่า sign-off

### B9. DEC-19 follow-up — LANG-045 (pending build, ไม่ใช่ decision ใหม่)

- **สถานะ:** DEC-19 active แต่ `LANG-045` ค้าง build (แปลครบทั้งแอปยกเว้น user/board content) · record: `FO-TEST-001-22-decision-register.md`
- **อยู่แอปไหน:** ฝั่ง **FO** (แอปผู้ใช้) — DEC-19 คือ "แปลไทยเต็มทั้งแอป ยกเว้นเนื้อหาผู้ใช้/board" ซึ่งเป็น product decision ฝั่ง FO; BO ไม่เกี่ยวเพราะ BO เป็นไทยอยู่แล้ว (ผูกกับ BO-DEC-001)
- **สถานะจริง:** งานแปลใน **prototype ทำเสร็จและ audit ผ่านแล้ว** — `deliverables/archive/FO-PROTO-f2f1934f-report.md` sweep 40+ surfaces โหมดไทย พบ EN เหลือเฉพาะเนื้อหาที่ผู้ใช้เขียนเอง (username/แคปชั่น/ชื่อนาฬิกา/เนื้อหา Board) ซึ่ง DEC-19 ยกเว้นไว้อยู่แล้ว ไม่มี UI copy ค้างแปล — ที่ register เขียนว่า "ค้าง build" หมายถึงรอแอปจริงมาทำเทียบอีกครั้ง ไม่ใช่งานที่ต้องทำตอนนี้
- **Blocker:** implementation — ไม่ใช่คำถามเชิง decision; เสนอ track เป็น build task แยก ไม่ต้องส่งคำถาม

## 4. กลุ่ม C — Doc-only contract note (draft เนื้อความเสนอ)

### C1. FO sync timing (P0 — ไม่มี DEC id)

- **สถานะ:** open — P0 (`BO_FINAL_REVIEW` §6) · contract note อยู่ `BackOffice/00_GLOBAL_RULES_MODULE.md` §12 "Sync timing" (L401–405): security/moderation action "ใกล้เคียงทันทีที่สุด" + cached FO list ต้อง validate ก่อนแสดง + "รายละเอียด cache invalidation/API timing ให้สรุปอีกครั้งตอนออกแบบ backend"
- **ปัญหา:** contract มี intent แต่ไม่มี number/slo — backend design ต้องการคำตอบ
- **Draft เนื้อความเสนอ (proposed contract note — แทรก/ขยาย §12 Sync timing):**

> **Sync timing contract (V1):**
> - **Security actions** (suspend/ban/deletion/session revoke): FO ต้อง enforce ภายใน request ถัดไปของ user — ไม่มี tolerated delay; session/token invalidation เป็นวิธีหลัก ไม่อาศัย cache expiry
> - **Moderation actions** (hide/remove/restore content, comment moderation): visible propagation ภายใน ≤ 60 วินาที; cache invalidate บน mutation + public surfaces validate entity status ก่อน render เสมอ (contract เดิม)
> - **Reference/master data** (option master, market data, directory, support center, policy): propagation ≤ 24 ชม.ผ่าน scheduled sync/refresh; FO อ่านผ่าน cached read-model ไม่ block user flow
> - **Watch Alert match/notification delivery:** เป็น async job — ไม่ผูก sync timing SLA กับ user action; delivery trace ผ่าน Delivery Logs
> - ตัวเลขนี้เป็น product contract — implementation detail (queue, push vs pull) ตัดสินตอน backend design ไม่กำหนดใน spec

- **Options:** (1) ใช้ draft ข้างบน (2) ปรับตัวเลข SLA (3) คง qualitative contract เดิมแล้วเลื่อนคำตอบไป backend design ทั้งหมด
- **Recommendation:** **Option 1** — ตัวเลขอนุรักษ์ (security=immediate-enforce, moderation ≤60s, reference ≤24h) สอดคล้อง intent เดิมและตอบ P0 โดยไม่เปลี่ยน scope หน้าจอ
- **✅ APPROVED 2026-11-04 (พี่มาเต็ม — "เอาตามที่แนะนำเลย"):** ใช้ draft 3 ชั้น → implement = ลงทะเบียน `DEC-49` ใน `DECISION_LOG.md` §8 + annotate contract note ใน `00_GLOBAL_RULES_MODULE.md` §12 ทำใน implement task แยก

## 5. Sign-off summary (owner checklist)

| # | DEC id | Group | Recommendation | เจ้าของตอบ |
|---|---|---|---|---|
| A1 | BO-DEC-001 | a | Thai primary V1, EN deferred | ☑ **approve 2026-11-04** |
| A2 | BO-DEC-003 | a | ปิดโดยชี้ DEL-DEC-006 | ☑ **approve 2026-11-04** |
| A3 | BO-DEC-004 | a | remove = Permanently Hidden + reason + audit; approval ผูก SET-DEC-004 | ☑ **approve 2026-11-04** |
| A4 | BO-DEC-005 | a | mobile-only, no web SEO V1 | ☑ **approve 2026-11-04** |
| A5 | BO-DEC-006 | a | distributed model + lightweight index | ☑ **approve 2026-11-04** |
| A6 | BO-MARKET-DEC-001 | a | ops-only + audit + rate-limit | ☑ **approve 2026-11-04** |
| A7 | BO-MARKET-DEC-003 | a | Phase 1 read-only warning | ☑ **approve 2026-11-04** |
| A8 | BO-AUDIT-DEC-001–004 | a | adopt recs; 004 defer | ☑ **approve 2026-11-04** |
| A9 | SUP-DEC-001–004 | a | adopt recs (no noti, fixed list, allowed tags, keep archived) | ☑ **approve 2026-11-04** |
| A10 | BO-DIR-DEC-001 | a | placeholder-only V1 | ☑ **approve 2026-11-04** |
| A11 | BO-DIR-DEC-003 | a | ☑ **approve แบบแก้จาก rec — ตัด consignment binding ออกทั้งหมด** (ไม่ใช่แค่ FK-ready) | approved 2026-11-04 |
| A12 | SET-DEC-002 | a | freeze section Phase 1, reopen Phase 2 | ☑ **approve 2026-11-04** |
| A13 | SET-DEC-004+REP-DEC-004 | a | permission+reason+audit พอ Phase 1; approval = Phase 2 backlog | ☑ **approve 2026-11-04** |
| A14 | NOTI-DEC-001/002/004/005 | a | formal defer Phase 2 | ☑ **approve 2026-11-04** |
| A15 | REP-DEC-001–003 | a | formal defer Phase 2 (001 อาจย้าย B1) | ☑ **approve 2026-11-04** |
| A16 | Consignment cleanup (FO portfolio) | a | ลบ consignment ออก FO ทั้งหมด (foot note + own flag) → §8 DEC-50 | ☑ **approve 2026-11-04** |
| B1 | DEL-DEC-002/BO-DEC-002/SET-DEC-003(+NOTI-003,REP-001) | b | ☑ defaults approved — รอ Legal confirm ตัวเลข | รอ Legal |
| B2 | DEL-DEC-005 | b | blocked — ส่งคำถาม 3 ข้อให้ Legal/Privacy | รอ Legal |
| B3 | BO-MARKET-DEC-002 | b | รอข้อมูล API จากทีม external — คำถามเตรียมไว้แล้ว | รอ external team |
| B4 | BO-MARKET-DEC-004 | b | รอข้อมูล API จากทีม external — คำถามเตรียมไว้แล้ว | รอ external team |
| B5 | BO-DIR-DEC-002 | b | blocked — ส่งคำถาม 3 ข้อให้ Product | รอ Product |
| B6 | BO-DIR-DEC-004 | b | blocked — ตอบเมื่อ Directory เปิด | รอ Ops |
| B7 | DEC-29 | b | รอ legal TH ฉบับจริง | รอเจ้าของ |
| B8 | O-01–O-09 | b | รอพี่คิง confirm + เลือก O-02 A/B/C | รอพี่คิง |
| B9 | DEC-19/LANG-045 | b | build task ไม่ใช่ decision | — |
| C1 | FO sync timing | c | draft contract 3 ชั้น (immediate/≤60s/≤24h) → §8 DEC-49 | ☑ **approve 2026-11-04** |

## 6. Next steps หลัง sign-off

1. ข้อ approve → เปิด implement task แยก: module-level ปิดใน `Open Decisions` ของ spec เจ้าของ + อัปเดต index §6; product-level (C1 และข้อที่เกิด decision ใหม่) ลง `DECISION_LOG.md` §8 ต่อ `DEC-49`
2. ข้อ reject → กลับมา redraft option ตาม feedback
3. กลุ่ม B → รวมคำถามส่งเจ้าของแต่ละฝ่าย (Legal / Dev-Ops / Product / พี่คิง) เป็น batch เดียว
4. Doc hygiene (ไม่ใช่ decision): `BO_FINAL_REVIEW_AND_HANDOFF.md` §6 P0 row `DEL-DEC-003`/`BO-DEC-003` stale → แก้ใน implement task ถัดไป
