# Success Metrics & KPI Framework — TukDaeng

| รายการ | ข้อมูล |
|---|---|
| Version | 0.1 (draft) |
| Date | 2026-11-05 · Asia/Bangkok |
| Task | BAC-009 [`35542808`] — Mission `0e19c244` Objective: Metrics & Scope Decisions / Feature: Metrics Framework |
| Status | **v0.1 — DRAFT รอ PO sign-off** — ไม่ใช่ spec contract; KPI ใหม่ทุกตัวต้องผ่าน PO อนุมัติก่อนใช้จริง |
| Source of truth | `FrontOffice/` + `BackOffice/` module specs · `BackOffice/BO_PRD.md` §6 (success metrics ที่ spec ล็อกแล้ว) · `docs/uat-ac-matrix.md` §1 (module coverage) · `docs/business-process-flows.md` (journeys J/B/X) · `docs/DECISION_LOG.md` |

## 0. สถานะเอกสาร & ข้อจำกัด

- เอกสารนี้เป็น **metrics framework draft** — รวม (a) metric ที่ spec/PRD กำหนดไว้แล้ว และ (b) KPI ที่เสนอใหม่เพื่อให้ครบทุก module — สถานะต่อตัวระบุในคอลัมน์ `Status`:
  - `SPEC` = นิยาม/target ล็อกใน spec หรือ PRD แล้ว (reuse ตรง ๆ ห้ามนิยามซ้ำ)
  - `DRAFT` = เสนอใหม่ในเอกสารนี้ — รอ PO sign-off ไม่ใช่ข้อผูกพัน
- **ไม่มี time-bound moderation SLA** — ตัดสินแล้ว 2026-11-02 (FO-BO-001 GAP-03): moderation วัดด้วย *review coverage* และ *queue aging indicator* (ตัวชี้เฝ้าระวัง ไม่ใช่ SLA ผูกผล) — KPI ที่เกี่ยวกับ report queue ทั้งหมดยึดกฎนี้
- **Guest/public analytics เป็น Phase 2** — Dashboard/user KPI นับเฉพาะ registered users (`BO-02 §8`); metric ชุด guest/public (Guest Visitors, Public Views, Public Shares, Guest-to-Signup Conversion) วัดได้เมื่อ tracking + Reports & Analytics เปิดใช้ (`BO-15`, `BO_PRD §4.11`) — ทุก KPI ที่พึ่งข้อมูลชุดนี้ mark Phase `P2`
- **Deferred scope ไม่ตั้ง KPI ใช้งาน** — Reports & Analytics (`BO-15`), Directory (`BO-07`), Broadcast/template (`BO-14` ส่วน Phase 2) เป็น Phase 2/postponed; KPI ของ module เหล่านี้เป็น *catalog เตรียมพร้อม* เท่านั้น
- KPI ใหม่ทุกตัวระบุ **owner ที่เสนอ** (PO ตัดสินจริง) และ **แหล่งวัด** — ตัวที่วัดไม่ได้ใน Phase 1 (ต้องมี tracking/analytics pipeline) ระบุ Phase `P2` ชัดเจน

## 1. North Star Metric

**North Star (draft decision): Weekly Successful Listings** = จำนวน asset ที่เข้าสู่สถานะ `Sold` ต่อสัปดาห์ (นับเฉพาะ mark-as-sold ที่ผ่าน sale record ตาม `FO-04 §16` — ไม่นับ Show/Hide ที่หายไปเฉย ๆ)

เหตุผล:

- ตรงวิสัยทัศน์สองข้างของ marketplace — "ผู้ซื้อหาของเจอ" และ "ผู้ขายขายได้" บรรจบกันที่ sold เดียว (`FO_Functional_PRD` §1)
- วัดได้ด้วยข้อมูลที่ระบบมีอยู่แล้วใน Phase 1 (asset status transition + sold history) ไม่ต้องรอ tracking Phase 2
- เป็น output metric — input metrics ของ funnel (activation → listing → discovery → contact) แยกอยู่ใน §4 และขับตัวนี้ได้ทุกตัว

ตัวเลือกที่ไม่เลือก (rejected alternates — บันทึกเหตุผลไว้):

- **Weekly Transacting Members** = member ที่มี ≥1 listing activity หรือ ≥1 buyer contact ต่อสัปดาห์ — กว้างกว่า แต่ "transact" ใน TukDaeng ไม่มี payment (ไม่ใช่ e-commerce ตาม PRD) นิยามคลุมเครือกว่า
- **Watch Alert Match Rate** = สัดส่วน active alerts ที่มี match ต่อสัปดาห์ — แข็งแรงฝั่ง demand แต่ครอบเฉพาะผู้ซื้อที่ตั้ง alert ไม่ครอบตลาดทั้งหมด

> Draft decision นี้ยังต้องผ่าน PO sign-off ตาม §9 — แต่ภายใน framework ใช้ตัวนี้เป็นฐาน ไม่ใช่ open question ค้างไว้

**Guardrail metrics** (ห้ามแลก north star ด้วยค่าเหล่านี้):

- Pending report coverage ต้องคง 100% (`SPEC` — `BO_PRD §6`)
- No-result search rate ต้องไม่แย่ลง (`SPEC` — Search Insights)
- Report rate ต่อ active user ต้องไม่พุ่งผิดปกติ (สัญญาณคุณภาพตลาด)

## 2. KPI Taxonomy

| Code | Category | ครอบคลุม |
|---|---|---|
| `NS` | North Star | ตัวชี้วัดหลักระดับผลิตภัณฑ์ (§1) |
| `ACT` | Activation & Adoption | signup→first value, feature adoption, guest conversion |
| `ENG` | Engagement | usage frequency/depth ของ member |
| `LIQ` | Marketplace Liquidity | ฝั่งอุปสงค์-อุปทานเจอกัน: listing, match, sold, demand |
| `TNS` | Trust & Safety | report/block/moderation coverage, account enforcement |
| `DQ` | Data Quality & Ops Health | delivery, sync, audit, data freshness, system health |

คอลัมน์ในตาราง §4–§6:

- `นิยาม/การวัด` = สูตรหรือวิธีนับแบบสั้น — รายละเอียด event schema อยู่ §7
- `Owner (เสนอ)` = role ที่เสนอให้รับผิดชอบ metric (PO ตัดสินจริง): `PO` = Product Owner · `Ops` = หัวหน้าทีมปฏิบัติการ BO/moderation · `Market` = ทีม Market Data (`BO_PRD §1.3`) · `Content` = ทีม content · `Platform` = ทีมพัฒนา/infra
- `แหล่งวัด` = จอ/ข้อมูลที่มีแล้ว (`Dashboard card`, `Demand Overview`, `Delivery Logs`, report Phase 2 ฯลฯ) หรือ `tracking` = ต้องมี analytics pipeline (Phase 2)
- `Phase` = `P1` วัดได้ใน Phase 1 · `P2` ต้องรอ tracking/Reports & Analytics

## 3. Metric ที่ Spec ล็อกไว้แล้ว (Baseline — ไม่เสนอใหม่)

### 3.1 Success metrics ระดับผลิตภัณฑ์ (`BO_PRD §6` — target ล็อก)

| Metric | Target | Category |
|---|---|---|
| Pending report review coverage | 100% ของ pending reports ถูก review (ไม่มี time-bound SLA — GAP-03) | TNS |
| Article publish success | 100% แสดงบน FO ตาม schedule | DQ |
| Asset moderation audit completeness | 100% มี audit log | TNS |
| Notification delivery tracking | > 95% มี delivery status | DQ |
| Admin Access violation | 0 case | TNS |

### 3.2 Dashboard KPI cards (`BO-02 §8` — โครงสร้างล็อก, registered-only)

`New Users` (Today/Week/Month) · `Active Users Today` · `New Assets` (Sale/Show/Hide/Sold) · `Reported Items` (Assets/Users/Comments) · `Articles` (Published/Scheduled) · `Watch Alert` (Active/Triggered) — กฎ: ห้ามนับ guest/public/anonymous รวมใน user KPI

### 3.3 Market Demand (`BO-11` — aggregate เท่านั้น)

Demand Overview tiles: `Active Alerts` · `Alerts with Matches` · `Unmet Demand` · `Notification Success Rate` + Trigger Trend 12 เดือน + Frequently Triggered + Top Criteria (Brand/Model/Reference) · Search Insights: popular keyword/filter/combination, no-result searches, search trend, **search funnel** (Search Submit → Result Click → Asset Detail Open → Watch Alert), average results per search — ทั้งหมด aggregate ไม่เปิดเผยตัว user

### 3.4 นิยาม metric ที่ spec ล็อกรายตัว

- Feed view counting = scroll-pass ≥55%, เลื่อนซ้ำนับซ้ำ (DEC-45; มีแผนเปลี่ยนเป็น detail-click metric ในอนาคต — `02 §9` เป็น planned transition ไม่ใช่ V1)
- Portfolio headline = `Total invested` = Σ purchase cost basis (D2 — ไม่ใช่ market value)
- Account Deletion Report metrics (`BO-15 §17`): requests / restored / restore rejected / auto-deleted (+processing time) / cancelled
- Sync contract timing (DEC-49): security = request ถัดไปทันที · moderation ≤60s · reference ≤24h · WA notification = async ไม่ผูก SLA

## 4. FO KPI ต่อ Module (J-01..J-13)

> Coverage note: `FO-DOC` (doc-tier bundle — Integrations/NFR/Admin scope) ไม่มี product surface ของตัวเอง จึงไม่มี KPI แยก — ข้อผูกพัน NFR/contract ของมันถูกวัดผ่าน §6 platform health และ DQ metrics ของ module ที่เกี่ยว

### FO-01 Authentication — J-01 (Account Lifecycle)

| KPI | นิยาม/การวัด | Cat | Owner (เสนอ) | แหล่งวัด | Phase | Status |
|---|---|---|---|---|---|---|
| Signup completion rate | เริ่ม sign up → account created (ต่อช่องทาง email/SSO) | ACT | PO | tracking | P2 | DRAFT |
| Guest → signup conversion | guest visitor → registered ใน attribution window | ACT | PO | User Report (guest analytics) | P2 | SPEC (นิยาม `BO-15 §9`) |
| Pending Verification → Active conversion | OTP/verify สำเร็จภายใน session เดียวกัน | ACT | PO | account status data | P1 | DRAFT |
| Sign-in success / lockout rate | login สำเร็จต่อพยายาม · lockout ต่อวัน | DQ | Platform | auth events | P1 | DRAFT |
| Deletion request rate | คำขอลบบัญชีต่อ active users/เดือน (churn signal) | ACT | PO | Deletion Requests list | P1 | DRAFT |
| Grace-period restore rate | restored / completed deletion requests | ACT | PO | Account Deletion Report | P2 | SPEC (metric ใน `BO-15 §17`) |
| Returning member rate (D30 retention) | member ที่กลับมา active ภายใน 30 วัน นับจาก signup หรือ active window ก่อนหน้า | ACT | PO | tracking | P2 | DRAFT |

### FO-02 Feed — J-02 (Discovery)

| KPI | นิยาม/การวัด | Cat | Owner (เสนอ) | แหล่งวัด | Phase | Status |
|---|---|---|---|---|---|---|
| DAU / WAU / MAU | active registered users รายวัน/สัปดาห์/เดือน | ENG | PO | `Active Users Today` card + User Report | P1 (DAU) / P2 (WAU/MAU) | SPEC (DAU card, DAU/MAU `BO-15 §9`) |
| Post view count | scroll-pass ≥55% ต่อโพสต์ | ENG | PO | tracking | P2 | SPEC (DEC-45) |
| Feed engagement rate | like/comment/save/share ต่อ active user ต่อวัน | ENG | PO | tracking | P2 | DRAFT |
| Post creation rate | โพสต์ใหม่ต่อวัน (composer → created) | LIQ | PO | New Assets card (asset ส่วน), tracking (post) | P1/P2 | DRAFT |

### FO-03 Search & Filter — J-03

| KPI | นิยาม/การวัด | Cat | Owner (เสนอ) | แหล่งวัด | Phase | Status |
|---|---|---|---|---|---|---|
| No-result search rate | ค้นแล้วไม่ได้ผล / ค้นทั้งหมด | LIQ | PO | Search Insights | P1 | SPEC |
| Avg results per search | ผลลัพธ์เฉลี่ยต่อ query | LIQ | PO | Search Insights | P1 | SPEC |
| Search funnel conversion | Submit → Result Click → Detail Open → Watch Alert (ต่อขั้น) | LIQ | PO | Search Insights funnel | P1 | SPEC |
| Popular keyword/filter usage | top keywords, filter select/impression | DQ | Market | Search Insights | P1 | SPEC |

### FO-04 Asset Management — J-04 (Listing → Sold)

| KPI | นิยาม/การวัด | Cat | Owner (เสนอ) | แหล่งวัด | Phase | Status |
|---|---|---|---|---|---|---|
| **Weekly Successful Listings** | asset → `Sold` ต่อสัปดาห์ (north star) | NS | PO | asset status transitions | P1 | DRAFT (ตัวเลือก §1) |
| New listing rate | asset ใหม่ต่อวัน แยก status | LIQ | PO | `New Assets` card | P1 | SPEC (card) |
| Listing → sold conversion | sold / listings ที่สร้างใน cohort เดียวกัน | LIQ | PO | status transitions | P1 | DRAFT |
| Time-to-sold | median วัน สร้าง → sold | LIQ | PO | status transitions | P1 | DRAFT |
| Listing completion rate | composer เปิด → asset created | ACT | PO | tracking | P2 | DRAFT |

### FO-05 Asset/Post Detail — J-02

| KPI | นิยาม/การวัด | Cat | Owner (เสนอ) | แหล่งวัด | Phase | Status |
|---|---|---|---|---|---|---|
| Detail open rate | viewer/card tap → detail เปิด ต่อ impression | ENG | PO | tracking (search funnel ครอบขั้น Detail Open แล้ว) | P1 (funnel ช่วง search) / P2 (ทั่วไป) | SPEC (funnel step) / DRAFT |
| Ask-seller tap rate | detail → เข้า chat (ปลายทาง LIQ ต่อ J-05) | LIQ | PO | tracking | P2 | DRAFT |
| Save / wishlist rate per view | save+wishlist ต่อ detail view | ENG | PO | tracking | P2 | DRAFT |

### FO-06 Profile — J-11

| KPI | นิยาม/การวัด | Cat | Owner (เสนอ) | แหล่งวัด | Phase | Status |
|---|---|---|---|---|---|---|
| Profile completeness | % member ที่มี avatar + display name (หลัง profile setup) | ACT | PO | user records | P1 | DRAFT |
| Public profile views | view โปรไฟล์สาธารณะ (guest/member แยกกัน) | ENG | PO | User Report (public views) | P2 | SPEC (metric `BO-15 §9`) |
| Follow growth | followers ใหม่ต่อสัปดาห์ (network effect) | ENG | PO | tracking | P2 | DRAFT |

### FO-07 Chat — J-05

| KPI | นิยาม/การวัด | Cat | Owner (เสนอ) | แหล่งวัด | Phase | Status |
|---|---|---|---|---|---|---|
| Ask → thread creation rate | กด Ask Seller → ส่งข้อความแรกจริง | LIQ | PO | tracking | P2 | DRAFT |
| Seller first-response rate | thread ที่ seller ตอบกลับ / thread ใหม่ | LIQ | PO | chat message data | P1 | DRAFT |
| Seller response time | median เวลา ข้อความแรก → ตอบกลับแรก | LIQ | PO | chat message data | P1 | DRAFT |
| Active chat rooms | rooms created/active ต่อช่วงเวลา | ENG | PO | Chat Report | P2 | SPEC (metric `BO-15 §11`) |
| Chats per sold listing | thread ต่อ asset ที่ขายได้ (funnel support) | LIQ | PO | tracking | P2 | DRAFT |

### FO-09 Notification — J-09

| KPI | นิยาม/การวัด | Cat | Owner (เสนอ) | แหล่งวัด | Phase | Status |
|---|---|---|---|---|---|---|
| Delivery tracking coverage | notification ที่มี delivery status | DQ | Platform | Delivery Logs | P1 | SPEC (>95% target) |
| Delivery success rate | sent/delivered ต่อ triggered แยก channel | DQ | Platform | Delivery Logs + Notification Report | P1/P2 | SPEC (metric `BO-15 §16`) |
| Notification open rate | tap → destination เปิด ต่อ delivered | ENG | PO | tracking | P2 | DRAFT |

### FO-10 Watch Alert — J-06

| KPI | นิยาม/การวัด | Cat | Owner (เสนอ) | แหล่งวัด | Phase | Status |
|---|---|---|---|---|---|---|
| Active alerts | alert active ทั้งหมด (+ Today trigger) | LIQ | PO | `Watch Alert` card + Demand Overview | P1 | SPEC |
| Alerts with matches | alert ที่มี matched Sale assets | LIQ | PO | Demand Overview | P1 | SPEC |
| Alert trigger rate | trigger events ต่อ active alert ต่อสัปดาห์ | LIQ | PO | Demand Overview trend | P1 | DRAFT |
| Unmet demand | alerts/searches ไม่มี match (demand gap signal) | LIQ | Market | Demand Overview | P1 | SPEC |
| WA notification success rate | notification ส่งสำเร็จต่อ trigger | DQ | Platform | Demand Overview + Delivery Logs | P1 | SPEC |
| Search → WA save conversion | save-as-alert จาก search/detail | ACT | PO | Search funnel (ขั้นสุดท้าย) + Search Report | P1/P2 | SPEC (funnel step + `BO-15 §14`) |

### FO-11 Social — J-08

| KPI | นิยาม/การวัด | Cat | Owner (เสนอ) | แหล่งวัด | Phase | Status |
|---|---|---|---|---|---|---|
| Social actions per active user | like+comment+share+save ต่อ DAU | ENG | PO | tracking | P2 | DRAFT |
| Comment volume & health | comments ต่อวัน · % ที่ถูก report/remove | ENG+TNS | PO+Ops | Asset Reported Comments Report | P2 | SPEC (metric `BO-15 §13`) |

### FO-12 Board — J-13

| KPI | นิยาม/การวัด | Cat | Owner (เสนอ) | แหล่งวัด | Phase | Status |
|---|---|---|---|---|---|---|
| Article publish success | ตีพิมพ์ตาม schedule → แสดงบน FO | DQ | Content | publish status | P1 | SPEC (100% target) |
| Articles live | Published/Scheduled count | DQ | Content | `Articles` card | P1 | SPEC (card) |
| Public article views | view บทความ (guest/member แยก) | ENG | Content | User Report (public views) | P2 | SPEC (metric `BO-15 §9`) |
| Article engagement | like/share ต่อบทความ | ENG | Content | tracking | P2 | DRAFT |

### FO-13 Settings — J-12

| KPI | นิยาม/การวัด | Cat | Owner (เสนอ) | แหล่งวัด | Phase | Status |
|---|---|---|---|---|---|---|
| Delete-account flow completion | เข้า flow → ยืนยันคำขอ | DQ | PO | tracking | P2 | DRAFT |
| Settings preference mix | language TH/EN, theme split (product context ไม่ใช่ target) | DQ | PO | user prefs | P1 | DRAFT |

### FO-14 Portfolio — J-04/J-10

| KPI | นิยาม/การวัด | Cat | Owner (เสนอ) | แหล่งวัด | Phase | Status |
|---|---|---|---|---|---|---|
| Portfolio adoption | owner ที่มี eligible asset ≥1 แล้วเปิด portfolio / eligible owners | ACT | PO | tracking | P2 | DRAFT |
| Sold-history recording rate | asset sold ที่มี sale record ครบ (price/date) | DQ | PO | sale records | P1 | DRAFT |

### FO-15 Trust & Safety — J-07

| KPI | นิยาม/การวัด | Cat | Owner (เสนอ) | แหล่งวัด | Phase | Status |
|---|---|---|---|---|---|---|
| Report volume by type | post/user/comment/chat reports ต่อช่วงเวลา | TNS | Ops | Report queues + reports Phase 2 | P1/P2 | DRAFT |
| Report rate per active user | reports / MAU (guardrail §1) | TNS | Ops | tracking | P2 | DRAFT |
| Block usage | block actions ต่อช่วงเวลา (community health signal) | TNS | Ops | tracking | P2 | DRAFT |

### FO-00G/00NAV Cross-cutting

| KPI | นิยาม/การวัด | Cat | Owner (เสนอ) | แหล่งวัด | Phase | Status |
|---|---|---|---|---|---|---|
| Guest gate conversion | Member Sheet แสดง → สมัคร/เข้าสู่ระบบ | ACT | PO | tracking | P2 | DRAFT |
| Unavailable fallback hit rate | deep link/entry → unavailable state (data quality signal) | DQ | Platform | tracking | P2 | DRAFT |

## 5. BO KPI ต่อ Module (B-01..B-14)

> BO เป็น internal tool — KPI เป็น *operational* (coverage, throughput, data quality) ไม่ใช่ growth; ตัวที่ spec ล็อกอยู่แล้ว reuse ตรง ๆ

### BO-01 Authentication — B-01 (Admin Identity)

| KPI | นิยาม/การวัด | Cat | Owner (เสนอ) | แหล่งวัด | Phase | Status |
|---|---|---|---|---|---|---|
| Invitation → activation rate | invite ที่ activate ภายใน token 72h | DQ | Ops | admin account data + delivery trace | P1 | DRAFT |
| Lockout frequency | lockout events ต่อสัปดาห์ (attack/misconfig signal) | TNS | Platform | audit events | P1 | DRAFT |
| Active admin coverage | admin active / invited ทั้งหมด (เผื่อสิทธิ์ค้าง) | DQ | Ops | Admin Account List | P1 | DRAFT |

### BO-02 Dashboard — B-02 (Triage)

| KPI | นิยาม/การวัด | Cat | Owner (เสนอ) | แหล่งวัด | Phase | Status |
|---|---|---|---|---|---|---|
| KPI cards 6 ใบ | New Users / Active Users / New Assets / Reported Items / Articles / Watch Alert | ผสม | PO | ล็อก `BO-02 §8` | P1 | SPEC |
| Queue drill-in usage | card/chip/row → module (adoption ของ triage workflow) | DQ | Ops | tracking | P2 | DRAFT |

### BO-03 User Management — B-03/B-04

| KPI | นิยาม/การวัด | Cat | Owner (เสนอ) | แหล่งวัด | Phase | Status |
|---|---|---|---|---|---|---|
| Reported-users review coverage | pending user reports ที่ถูก review | TNS | Ops | Reported Users queue | P1 | SPEC (coverage 100%) |
| Queue aging indicator | pending reports เก่า >7 วัน (indicator ไม่ใช่ SLA — GAP-03) | TNS | Ops | queue data | P1 | DRAFT |
| Account action volume | suspend/ban/unsuspend/unban/reset ต่อช่วงเวลา | TNS | Ops | History & Actions / Audit Log | P1 | DRAFT |

### BO-04 Asset Management — B-05/B-06 (Moderation Queues)

| KPI | นิยาม/การวัด | Cat | Owner (เสนอ) | แหล่งวัด | Phase | Status |
|---|---|---|---|---|---|---|
| Reported-assets / comments review coverage | pending ที่ถูก review | TNS | Ops | Reported Assets / Comments queues | P1 | SPEC (coverage 100%) |
| Moderation audit completeness | action มี audit log ครบ | TNS | Platform | Audit Log | P1 | SPEC (100% target) |
| Moderation action mix | hide/restore/remove/close-no-violation ratio | TNS | Ops | queue data | P1 | DRAFT |
| FO propagation adherence | visibility change แสดงบน FO ≤60s (DEC-49) | DQ | Platform | monitoring | P1 | SPEC (contract) |

### BO-05 Content Board — B-08

| KPI | นิยาม/การวัด | Cat | Owner (เสนอ) | แหล่งวัด | Phase | Status |
|---|---|---|---|---|---|---|
| Publish success on schedule | article แสดง FO ตามเวลาที่ตั้ง | DQ | Content | publish status | P1 | SPEC (100% target) |
| Article inventory health | draft/scheduled/published/archived mix | DQ | Content | `Articles` card + list | P1 | SPEC (card) / DRAFT (mix) |

### BO-06 Market Data — B-09

| KPI | นิยาม/การวัด | Cat | Owner (เสนอ) | แหล่งวัด | Phase | Status |
|---|---|---|---|---|---|---|
| Provider sync success rate | sync job สำเร็จ / ทั้งหมด | DQ | Market | sync history | P1 | DRAFT |
| Reference data freshness | ข้อมูลล่าสุด ≤24h ตาม sync contract | DQ | Market | sync history | P1 | SPEC (contract ≤24h) |
| Catalog coverage | brand/model ที่ FO ใช้มีใน catalog (autocomplete/filter quality) | DQ | Market | catalog data | P1 | DRAFT |

### BO-07 Directory — postponed

ไม่ตั้ง KPI ใช้งาน (postponed scope); activation เป็น requirement ใหม่ (`BO-DIR-DEC-001`)

### BO-08 Audit Log — B-14

| KPI | นิยาม/การวัด | Cat | Owner (เสนอ) | แหล่งวัด | Phase | Status |
|---|---|---|---|---|---|---|
| Write-action audit coverage | action ที่ต้อง audit มี event ครบ (ทุก module) | TNS | Platform | Audit Log | P1 | DRAFT |
| Audit retention | retention ≥1 ปี ตาม `BO_PRD §5.2` | DQ | Platform | infra | P1 | SPEC (NFR) |

### BO-11 Market Demand — B-10

| KPI | นิยาม/การวัด | Cat | Owner (เสนอ) | แหล่งวัด | Phase | Status |
|---|---|---|---|---|---|---|
| Demand Overview tiles | Active Alerts / Alerts with Matches / Unmet Demand / Notification Success Rate | LIQ/DQ | Market | ล็อก `BO-11` | P1 | SPEC |
| Search demand health | no-result rate, avg results/search, funnel conversion | LIQ | Market | Search Insights | P1 | SPEC |
| Popular filter usage | tag impression/select (FO แสดง aggregate) | DQ | Market | Search Insights | P1 | SPEC |

### BO-12 Help & Support — B-11

| KPI | นิยาม/การวัด | Cat | Owner (เสนอ) | แหล่งวัด | Phase | Status |
|---|---|---|---|---|---|---|
| Policy version currency | FO legal viewer แสดงเวอร์ชันล่าสุด ≤24h + re-consent triggered | DQ | Content | publish + delivery trace | P1 | DRAFT |
| Support channel availability | active channels แสดงครบบน FO Help | DQ | Ops | support center save → FO preview | P1 | DRAFT |

### BO-13 Account Deletion — B-07

| KPI | นิยาม/การวัด | Cat | Owner (เสนอ) | แหล่งวัด | Phase | Status |
|---|---|---|---|---|---|---|
| Request review coverage | pending restore/reject requests ที่ถูก review | TNS | Ops | Deletion Requests list | P1 | DRAFT |
| Restore outcome mix | restored / rejected / auto-deleted ratio | TNS | Ops | Account Deletion Report | P2 | SPEC (metrics `BO-15 §17`) |
| Lifecycle email delivery | DLV-DEL-* ส่งสำเร็จต่อ event | DQ | Platform | Delivery Logs | P1 | SPEC (delivery tracking) |
| Auto-delete completion | เก็บถาวร+ลบตัวตนสำเร็จเมื่อครบ grace | DQ | Platform | system job + report | P1/P2 | SPEC (metric `BO-15 §17`) |

### BO-14 Notifications — B-14

| KPI | นิยาม/การวัด | Cat | Owner (เสนอ) | แหล่งวัด | Phase | Status |
|---|---|---|---|---|---|---|
| Delivery status coverage | >95% มี delivery status | DQ | Platform | Delivery Logs | P1 | SPEC |
| Failed delivery rate | failed / triggered แยก channel + retryable count | DQ | Platform | Delivery Logs + Notification Report | P1/P2 | SPEC (metric `BO-15 §16`) |

### BO-15 Reports & Analytics — Phase 2

ไม่มี KPI ใช้งาน Phase 1 — module นี้ *คือ* แหล่งวัดของ KPI P2 ส่วนใหญ่; report catalog ล็อกแล้ว 9 รายการ (`BO-15 §8`)

### BO-16 Admin Settings — B-12

| KPI | นิยาม/การวัด | Cat | Owner (เสนอ) | แหล่งวัด | Phase | Status |
|---|---|---|---|---|---|---|
| Admin access violations | เคสเข้าถึงเกินสิทธิ์ | TNS | Platform | Audit Log / security events | P1 | SPEC (target 0) |
| Role-change audit coverage | change role/permission มี audit + reason ครบ | TNS | Ops | Audit Log | P1 | DRAFT |

### BO-00G Global Rules — cross-cutting

| KPI | นิยาม/การวัด | Cat | Owner (เสนอ) | แหล่งวัด | Phase | Status |
|---|---|---|---|---|---|---|
| Permission enforcement integrity | route/action/field enforcement violation = 0 (ผูกกับ Admin Access violation) | TNS | Platform | Audit Log / security events | P1 | SPEC (contract `BO-00G §13-15`) |
| FO sync contract adherence | ผ่าน §6 ตาราง sync timing (security/moderation/reference/WA) | DQ | Platform | monitoring | P1 | SPEC (contract `BO-00G §12`) |

### BO-17 Option Master — B-13

| KPI | นิยาม/การวัด | Cat | Owner (เสนอ) | แหล่งวัด | Phase | Status |
|---|---|---|---|---|---|---|
| Option data health | active/inactive ratio ต่อ group · inactive option ที่ยังถูกอ้างใน criteria (dependency warning) | DQ | Market | Option Group List + WA criteria | P1 | DRAFT |
| Spec suggestion queue coverage | suggestion ที่ถูก curate / ทั้งหมด | DQ | Market | suggestion queue | P1 | DRAFT |

## 6. Cross-Side & Platform Health (X flows)

| KPI | นิยาม/การวัด | Cat | Owner (เสนอ) | แหล่งวัด | Phase | Status |
|---|---|---|---|---|---|---|
| Security enforcement latency | suspend/ban/revoke → มีผล request ถัดไป (no tolerated delay) | TNS | Platform | audit + session data | P1 | SPEC (contract X-04/DEC-49) |
| Moderation propagation | BO visibility action → FO surfaces ≤60s | DQ | Platform | monitoring | P1 | SPEC (contract) |
| Reference sync freshness | option master/market data/policy/support → FO ≤24h | DQ | Platform+Market | scheduled sync logs | P1 | SPEC (contract) |
| WA notification trace | trigger → delivery trace ครบใน Delivery Logs (async ไม่ผูก SLA) | DQ | Platform | Delivery Logs | P1 | DRAFT |
| NFR performance adherence | feed load ≤2s (NFR-001), BO dashboard ≤3s (`BO_PRD §5.1`), pagination/offline ตาม NFR contract | DQ | Platform | monitoring | P1 | SPEC (NFR-001..005) |

## 7. Measurement & Instrumentation Notes

- **Registered-only rule** — user-level KPI ทุกตัวนับเฉพาะ registered users; guest/public traffic ห้ามปน (`BO-02 §8`, `BO-15 §9` rules); metric guest/public ต้อง label แยกเสมอ
- **Event schema ขั้นต่ำสำหรับ tracking (Phase 2)** — ตาม `BO-15 §9`: `surface_type`, `entity_id`, `user_state`, `timestamp` + attribution fields สำหรับ guest→signup
- **View counting** — scroll-pass ≥55% เลื่อนซ้ำนับซ้ำ (DEC-45); การเปลี่ยนเป็น detail-click เป็น planned transition ต้องประกาศ metric definition change เมื่อทำ (`02 §9`)
- **Aggregate-only analytics** — Search Insights/Demand Overview ห้ามเปิดเผยข้อมูลระบุตัว user (`BO-11`); KPI จากแหล่งนี้คงกฎเดียวกัน
- **Onboarding analytics** — spec มี stg-only analytics hook บางจุด (`AC-AUTH-031`) — ยืนยันว่าเป็น foundation ของ tracking Phase 2 ไม่ใช่ production metric
- **Queue aging ≠ SLA** — ตัวเลข pending >N วันใช้เฝ้าระวังเท่านั้น ห้ามผูกเป้าหมายเวลาแบบ SLA (GAP-03)

## 8. Findings — ตัดสินแล้วใน draft (พี่มาเต็มอนุมัติให้ BA ตัดสินตามมาตรฐาน, 2026-11-05)

| ID | ประเด็น | การตัดสิน |
|---|---|---|
| SM-01 | North Star ต้องเลือก 1 ตัว | **DECIDED** — Weekly Successful Listings (§1); ตัวเลือกอื่นเก็บเป็น rejected alternates พร้อมเหตุผล |
| SM-02 | KPI P2 พึ่ง tracking pipeline ที่ยังไม่มีใน spec | **DECIDED** — KPI นิยามไว้ก่อนแบบ phase-tagged; Phase column (`P1`/`P2`) คือ measurement readiness ไม่ใช่ blocker — tracking pipeline เป็น prerequisite ของ Reports & Analytics Phase 2 อยู่แล้ว ไม่ต้องมี decision แยก |
| SM-03 | Chat response rate/time spec ไม่ได้กำหนด metric | **DECIDED** — ใส่เป็น LIQ KPI (P1, วัดจาก message data ที่มีอยู่) เพราะ response เชื่อมตรงกับ marketplace liquidity ตามจุดประสงค์ "หาของเจอ/ขายได้" |
| SM-04 | Retention/churn ไม่มีนิยามใน spec เลย | **DECIDED** — เพิ่ม `Returning member rate (D30 retention)` เข้า FO-01 เป็น ACT/P2 — ครบ taxonomy (activation+retention คู่กันตาม funnel มาตรฐาน) ไม่พึ่ง proxy |
| SM-05 | Owner เป็น role ที่เสนอ | **DECIDED** — convention ล็อก: owner = draft role assignment ตาม taxonomy (`PO` growth/engagement, `Ops` moderation/support, `Market` demand/reference data, `Content` publishing, `Platform` infra/contract) — PO confirm mapping ทีมจริงตอน sign-off §9 |

## 9. Sign-off

| Role | ชื่อ | ผล | วันที่ |
|---|---|---|---|
| PO | _(รอเติม)_ | pending | — |
| พี่มาเต็ม (review) | — | pending | — |
