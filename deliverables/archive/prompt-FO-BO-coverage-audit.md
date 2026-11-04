# FO-BO-001 — Prompt สำหรับ Audit ความครบ FO↔BO Cross-System Flow

> เอา block ด้านล่างนี้ทั้งก้อนไปวางให้ agent/AI ตัวที่จะทำ coverage audit ได้เลย
> ปรับ code prefix (`FO-BO`) ตามระบบงานที่ใช้อยู่

---

## COPY BLOCK — วางให้ agent ได้เลย

```text
คุณคือ Senior System Analyst / BA ของโปรเจกต์ TukDaeng (ตึกแดง) —
mobile marketplace community นาฬิกาหรู ที่มี 2 ฝั่งทำงานคู่กัน:
- Front Office (FO): mobile app สำหรับ member — prototype เสร็จและ lock แล้ว
  (baseline FO-PRD-v1.10)
- Back Office (BO): web console สำหรับ admin — prototype + spec อยู่ระหว่าง
  finalize (baseline BO-PRD-v0.1)

=================================================================
เป้าหมาย
=================================================================
พิสูจน์ว่า BO prototype + BO spec รองรับ "ทุก flow ที่เชื่อมกับ FO" ครบแล้ว
หรือยัง — โดยตั้งต้นจาก FO ฝั่งที่ lock แล้วเป็นตัวตั้ง (FO = demand side,
BO = supply side ต้องรับครบ)

ผลงานที่ต้องส่ง:
1. Coverage Matrix — ทุก FO↔BO touchpoint เทียบฝั่งรับ/ฝั่งส่งครบทีละเส้น
2. Gap Register — รายการสิ่งที่ขาด/ไม่ครบ/ขัดกัน พร้อม severity
3. Remediation Proposal — ต้องเพิ่ม/แก้ไขอะไร ที่ไฟล์/จอไหน อย่างไร
   (แยกกลุ่มตามประเภทงาน)

งานนี้เป็น AUDIT เท่านั้น — ห้ามแก้ไขไฟล์ spec/prototype ใด ๆ ทั้งสิ้น

=================================================================
Source of Truth (อ่านก่อนเริ่มเสมอ ห้ามข้าม)
=================================================================
FO side (lock แล้ว — ใช้เป็นตัวตั้ง ห้ามเสนอแก้นอกเหนือจาก mark gap):
1. D:\TukDaeng\Prototypes\fo-flow\index.html
   - FO prototype SPA ไฟล์เดียว (~23,600+ บรรทัด) = source of truth ของ
     พฤติกรรม FO — inventory ทุก route/overlay/action ที่ส่ง signal ไป BO
     หรือรับผลจาก BO
2. D:\TukDaeng\FrontOffice\*.md — spec ราย module 00–18 + PRD/master/checklists
   - อ่านทุกไฟล์ที่กล่าวถึง Admin / Back Office / moderation / handoff /
     contract / delivery — grep `admin|back office|moderation|contract`
     แล้วไล่อ่านบริบท
   - จุดที่ต้องเปิดแน่ ๆ:
     * 18_ADMIN_SCOPE_NOTE — boundary + AC-ADMIN-001..010 + 24h SLA
     * 15_TRUST_SAFETY — report stack, PM_REASONS (9 เหตุผลชุดเดียวทุก type),
       moderation handoff, block impact, Apple compliance
     * 13_SETTINGS — delete account (grace 30 วัน login-to-restore),
       help/support channels, terms/privacy, reset password email
     * 09_NOTIFICATION — alerts feed 4 types (like/comment/follow/watch —
       type `system` ถูกถอนออกจาก V1 แล้วตาม DEC-41)
     * 10_WATCH_ALERT — trigger → notification → Post Viewer
     * 12_BOARD — article จาก BO, Report Board Content (contract-only S-04)
     * 04/05_ASSET — สถานะ Sale/Show/Hide/Sold + unavailable/hidden state
     * 06_PROFILE — suspend/ban, follow, public profile
     * 07_CHAT — report from chat (`chatReportSheet`, `Report and delete`)
     * 03_SEARCH — option/`ระบุเอง` free-text, search analytics
     * 16_INTEGRATIONS — FCM push, email, Watch Price API
3. D:\TukDaeng\deliverables\FO-TEST-001-00-inventory.md
   D:\TukDaeng\deliverables\FO-DIAG-001-fo-app-diagrams.md
   D:\TukDaeng\deliverables\FO-TEST-001-22-decision-register.md
   - inventory + decision register ล่าสุดของ FO (DEC-xx คือ locked decisions)

BO side (ฝั่งที่ถูก audit):
4. D:\TukDaeng\Prototypes\bo-prototype.html — BO prototype SPA ไฟล์เดียว
   - inventory ทุก route/menu/submenu/list/detail/modal/action
5. D:\TukDaeng\BackOffice\*.md — spec ราย module 00–17 +
   BO_Spec.md + BO_PRD.md + BO_MASTER_BASELINE.md +
   BO_Spec_Completion_Addendum.md + BO_FINAL_REVIEW_AND_HANDOFF.md +
   BO_DEV_IMPLEMENTATION_CHECKLIST.md
6. D:\TukDaeng\AGENTS.md — Protected Prototype Screens list
   - จอ BO หลายจอ lock แล้ว — gap ที่ remediation ต้องแตะจอเหล่านี้ต้อง
     mark ชัดเจนแยกกลุ่ม ห้ามฝังเงียบ ๆ ในข้อเสนอทั่วไป

=================================================================
นิยาม "ครบ flow" — ต้องผ่านทั้ง 3 แกนถึงจะ Covered
=================================================================
A. FO→BO (upstream): ทุก signal/action ที่ user ทำใน FO ซึ่ง spec กำหนดว่า
   ต้องไปถึง admin — ต้องมี queue/list/detail/data surface ใน BO รับครบ
   ทั้ง prototype และ spec
B. BO→FO (downstream): ทุก admin action/config ใน BO ที่ spec กำหนดว่า
   ส่งผลกลับ FO — ต้องมี contract ชัดเจน (sync ทันทีหรือ async state ระบุชัด)
   และ FO ต้องมี state/ surface รับผลนั้น (unavailable, hidden, removed,
   session revoked, email ฯลฯ)
C. Contract & data alignment: ID/ref pattern, status enum, reason taxonomy,
   email/delivery template contract, audit ref และ mock data ใน BO
   prototype ต้องสอดคล้องกับ entity/seed/enum ของ FO

=================================================================
Checklist touchpoint ขั้นต่ำ (seeded list — verify เอง + หาเพิ่มจาก spec
ทั้งสองฝั่ง ห้ามจบแค่ list นี้)
=================================================================
R1  Report post/asset (post `...` → `report` / `report:post`) →
    BO Reported Assets queue + Asset Report Detail + moderation actions
R2  Report user (profile `...` → `report:pick` → `report:user`) →
    BO Reported Users + Report Detail + user actions
R3  Report comment (long-press → `report:comment`) →
    BO Reported Comments + Hide/Restore/Remove/Close no violation +
    View Asset / View all comments modals
R4  Report Board Content (contract-only S-04 — entry ยัง dead ใน prototype
    แต่ spec มี) → BO Reported Articles + Board Report Detail
R5  Report from chat (`chatReportSheet` → `report:user` ตรง +
    `Report and delete`) → map เข้า BO queue ไหน — BO spec/prototype
    ระบุปลายทางชัดหรือยัง
R6  PM_REASONS (9 เหตุผลชุดเดียวทุก type) + Board Content reason set แยก
    (12 §13) ↔ reason taxonomy/label/filter ที่ BO ใช้ใน report queues
    และ detail
R7  24h report SLA (contract AC-ADMIN-006) → BO queue/dashboard มี
    SLA/due/aging indicator หรือยัง
R8  Moderation result → FO states: asset unavailable/hidden, comment
    hidden/removed, article removed — FO spec มี state รับผลครบไหม และ
    BO action แต่ละตัว map ผลลัพธ์ฝั่ง FO ครบทุกเคสไหม
R9  Suspend/ban user (BO action) → FO contract 3 ขา: เข้า app ไม่ได้ +
    session revoke/block + email เป็น primary channel (FO-PRD-v1.3 note)
R10 Block/mute/not-interested — FO-internal: ยืนยันว่า spec ไม่ require
    BO surface (ถ้า BO user detail อ้างเห็น block state ให้เช็คตาม spec)
R11 Account deletion (FO 2-page flow → request + grace 30 วัน
    login-to-restore + auto delete ครบกำหนด) → BO Deletion Requests
    queue/detail, restore/reject modals, countdown, lifecycle emails
    5 จุด, dependency summary 3 tiles
R12 Board content authoring (BO Articles/Categories CRUD +
    publish/schedule/archive) → FO Board hero/latest/categories/article
    detail + removed-article fallback
R13 Policy & Versioning (Terms/Privacy TH/EN draft/publish/archive/
    version restore) → FO legal surfaces (settings → terms/privacy +
    onboarding consent)
R14 Support Center (channels active/inactive, business hours,
    availability TH/EN) → FO Help screen (`Support channels` +
    `Available daily` + LINE/Call/Email rows + Help topics)
R15 Option Master (groups/options add/edit/deactivate/reorder/delete +
    group audit + suggestion queue §23.5) → FO Add/Edit Asset fields,
    Search Filter options, Watch Alert criteria, `ระบุเอง` free-text →
    suggestion pool/alias contract
R16 Market Data (brand/model/reference/price index + sync log) →
    FO autocomplete, search filter options, watch alert criteria,
    portfolio asset value + inactive market data warning consistency
R17 Watch Alert trigger → FO alert row + destination Post Viewer →
    BO Market Demand Watch Alert List/Detail (read-only, 6 sections) +
    trigger & notification history + delivery status badges
R18 Search Insights (popular keyword/no-result/filter combinations —
    aggregate only ไม่มี user-identifying) → BO Search Insights widgets
    ครบทุกตัวที่ FO ส่งข้อมูลได้
R19 Notification delivery → BO Delivery Logs (DLV-* refs, email/push,
    Sent/Retry, read-only) + jump links จาก Account Deletion/User
    Management/Dashboard — และ FO alert feed 4 types (ไม่มี system)
R20 Email ที่ FO user ได้รับจาก BO action: suspend/ban notice, deletion
    lifecycle 5 จุด, restore/reject result, moderation outcome (ถ้ามี) —
    มี template contract + email preview/note ใน BO modal ครบไหม และ
    FO spec รับรู้ email เหล่านี้ไหม
R21 Audit trail: ทุก BO action ที่กระทบ FO entity ต้องมี audit event
    (AUD-xxxxx) + ref pattern (U-/AST-/RCO-/ART-/DEL-) + jump links —
    FO spec/test อ้างอิง ref เหล่านี้ได้ครบไหม
R22 Sold asset retained for Admin Review (AC-ADMIN-008) → BO asset
    list/detail มี sold state + sale record/sales history หรือยัง
R23 Admin Identity Lifecycle — BO-internal เท่านั้น: mark N/A ชัดเจน
    (requirement bf08de1f finalized แล้ว แยก scope)
R24 Chat moderation/monitoring + real-time admin-user chat — Phase 1
    exclusion ตาม BO README: mark N/A แต่ต้องยืนยันจาก spec ไม่ใช่เดา
R25 Guest gate/Member Sheet, i18n/theme, onboarding, portfolio
    owner-view — FO-internal: mark N/A

=================================================================
รูปแบบผลลัพธ์ (บังคับตามนี้)
=================================================================
ส่วนที่ 1 — Touchpoint Inventory (2 ตาราง)
  ตาราง A: ทุก FO→BO handoff ที่ inventory ได้จาก FO spec/prototype
  ตาราง B: ทุก BO→FO contract/result ที่ inventory ได้จาก BO spec/prototype
  แต่ละแถวระบุ source อ้างอิง (ไฟล์ §/route/function)

ส่วนที่ 2 — Coverage Matrix (ตารางเดียวรวมทุก touchpoint)
  | # | Touchpoint | FO source (spec §/route/prototype) |
   BO surface (route/modal/panel) | BO spec ref | สถานะ | หมายเหตุ |
  สถานะ: Covered / Partial / Gap / Contract-only / N-A
  - Contract-only = spec มีแต่ prototype ไม่ครอบโดยตั้งใจ (ต้องอ้าง spec)
  - N-A = ยืนยันแล้วว่าไม่ใช่ cross-system touchpoint

ส่วนที่ 3 — Gap Register
  ต่อ gap ระบุ: ID (FOBO-GAP-xx) | severity | สิ่งที่ขาด/ขัดกัน |
  ไฟล์/จอที่กระทบ | protected-screen impact (Y/N + ชื่อจอ)
  severity: Blocker = flow ขาดทั้งเส้น (user action ไม่มีที่ไป /
            admin action ไม่มีผล) / Major = มีบางส่วนแต่ไม่ครบ /
            Minor = รายละเอียด/เอกสาร/label ไม่ตรง

ส่วนที่ 4 — Remediation Proposal (แยกกลุ่ม)
  (a) แก้ BO spec/doc อย่างเดียว — ระบุไฟล์ § ที่ต้องแก้ + เนื้อหาที่ต้องเพิ่ม
  (b) เพิ่มจอ/modal/panel ใหม่ใน bo-prototype — ระบุจุดเมนู/route + สรุป
      content ที่ต้องมี
  (c) ต้องแตะ protected screen — list แยกต่างหากพร้อมเหตุผล รอ user
      approve ก่อนเสมอ (ดู list ใน AGENTS.md)
  (d) mock data/seed alignment — entity ID/enum/reason/status ที่ต้อง sync
  (e) FO side gap — mark ชัดว่า FO lock แล้ว เสนอเป็น decision item
      ให้ product ตัดสินเท่านั้น ห้ามเสนอแก้ prototype FO ตรง ๆ

ส่วนที่ 5 — Evidence & Open Items
  - citation (file:line) ทุก claim สำคัญ ทั้งฝั่ง FO และ BO
  - [OPEN] สำหรับจุดที่ spec ไม่ชัด/ขัดกันเอง ต้องให้ product ตัดสิน
  - [CONFLICT] เมื่อ FO spec กับ BO spec ขัดกัน — ระบุไฟล์/บรรทัดทั้งสอง
    ฝั่ง ห้ามเลือกข้างเอง

=================================================================
ขั้นตอนการทำงาน (ห้ามข้าม)
=================================================================
1. Inventory FO handoffs ก่อน: grep + อ่าน FO spec/prototype หาทุกจุดที่
   กล่าวถึง Admin/Back Office/moderation/handoff/contract-only/delivery/
   email/audit/24h — ทำ list ครบก่อน แล้วค่อยเทียบ
2. Inventory BO surfaces: route/menu/submenu/list/detail/modal/action
   ทั้งหมดใน bo-prototype + module list ใน BackOffice spec/README
3. เทียบทีละ touchpoint ตามแกน A/B/C → coverage matrix
4. ทุก Gap/Partial/[CONFLICT] ต้องมี evidence อ้างบรรทัด — ห้ามสรุปจาก
   ความจำหรือเดาจากชื่อฟีเจอร์
5. ปิดท้าย: gap register + remediation proposal แยกกลุ่ม (a)–(e)
6. ส่งออกเป็นไฟล์ deliverables\FO-BO-001-coverage-audit.md
   (inventory + matrix + register + proposal + evidence ในไฟล์เดียว —
   ถ้าใหญ่เกินแยกเป็น FO-BO-001-<section>.md พร้อม index)

=================================================================
ข้อห้าม
=================================================================
- ห้ามแก้ไขไฟล์ใด ๆ (spec, prototype, AGENTS.md, deliverables อื่น) —
  audit-only ผลลัพธ์เขียนเฉพาะไฟล์รายงานของตัวเอง
- ห้ามนับ future/Phase 2/postponed เป็น gap ถ้า spec ระบุชัด (เช่น
  BO 07 Directory, BO 15 Reports/Analytics, Broadcast notification,
  real-time admin-user chat) — mark Contract-only/N-A พร้อมอ้าง spec
- ห้ามฝังข้อเสนอที่แตะ protected screens ในกลุ่มอื่น — ต้องอยู่กลุ่ม (c)
  เสมอ
- ห้ามประกาศ "ครบ" ถ้า coverage matrix ยังไม่ครบทุก touchpoint ใน
  checklist + ที่ inventory เจอเพิ่มเอง
- ห้ามเขียน finding แบบลอย ("BO น่าจะรองรับ") — ทุกแถวต้องมี ref จริง
```

---

## หมายเหตุการใช้งาน

- prompt นี้สมมติ agent ฝั่งรับอ่านไฟล์ในเครื่องได้ (Devin / agent ใน repo
  เดียวกัน) — ถ้าเอาไปวางใน chat ที่ไม่มีไฟล์ งานนี้ทำไม่ได้ เพราะต้อง
  เทียบ spec/prototype ทั้งสองฝั่งจริง
- ถ้า context เล็ก/อยากทำทีละกลุ่ม ให้ตัด checklist เป็น batch เช่น
  "ทำเฉพาะ R1–R8 (Report & Moderation)" แล้วค่อยรวม coverage matrix ทีหลัง —
  แต่รอบสุดท้ายต้องรัน inventory sweep (ขั้นตอน 1–2) เพื่อกันตกหล่น
- ผล audit รอบแรกควร review กับ product ก่อน เพราะ remediation กลุ่ม (c)
  แตะ protected screens และกลุ่ม (e) แตะ FO ที่ lock แล้ว — ทั้งสองกลุ่ม
  ต้องผ่านการอนุมัติก่อนเปิด implementation task
- prefix `FO-BO` ปรับตาม convention งานจริงของทีม
