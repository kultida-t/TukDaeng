# UAT Plan — TukDaeng (User Acceptance Test Plan + Sign-off Template + Mini RACI)

| รายการ | ข้อมูล |
|---|---|
| Version | 0.1 (draft) |
| Date | 2026-11-05 · Asia/Bangkok |
| Task | BAC-006 [`c02700a5`] — Mission `0e19c244` Objective: UAT Readiness / Feature: UAT Plan |
| Status | **DRAFT — รอ review** (รอพี่มาเต็มตรวจ) |
| Source of truth | `FrontOffice/` + `BackOffice/` module specs · `docs/business-process-flows.md` v0.2 (journeys) · `docs/data-dictionary.md` v0.2 (entities) · `docs/data-model-erd.md` v0.1 (relationships) — ทุกจุดในเอกสารนี้อ้าง ref เหล่านั้น |

## 0. วิธีอ่านเอกสารนี้

- รูปแบบอ้างอิงตามเอกสารชุดเดียวกัน: `NN §X` = `FrontOffice/NN_*_MODULE.md` section X; `BO-NN §X` = `BackOffice/`; `00G`/`00NAV` = เอกสารกลาง FO; `J-xx`/`B-xx`/`X-xx` = journey ใน `business-process-flows.md`; `E-xx`/`BE-xx` = entity ใน `data-dictionary.md`
- **เอกสารนี้คือ UAT readiness package เท่านั้น — ไม่รวมการรัน UAT จริง** (ข้อห้ามของ Mission `0e19c244`)
- Environment ของ UAT ชุดนี้ = **prototype** (`Prototypes/fo-flow/index.html` ฝั่ง FO + `Prototypes/bo-prototype.html` ฝั่ง BO) — จุดที่ prototype ไม่ครอบถูก mark เป็น `(contract)` และ defer ไป production UAT (§3.4)
- เอกสารนี้รวบรวมจาก spec/repo จริง — ถ้าพบจุดที่ spec ขัดกันเองหรือขัด prototype ให้ดู §11 Findings (บันทึกเท่านั้น ไม่แก้ spec/prototype)

## 1. วัตถุประสงค์และขอบเขต

### 1.1 วัตถุประสงค์

เตรียมกรอบ UAT ที่ใช้งานได้จริงกับโครงสร้างโปรเจค เพื่อให้เมื่อทีมเปิดรอบ UAT บน prototype จะมี: (a) scope/test basis ที่ trace กลับ spec ได้ทุกจุด, (b) เกณฑ์เข้า-ออกชัดเจน, (c) วิธีจัดการ defect และ spec conflict, (d) แบบฟอร์ม sign-off ต่อ module, (e) ตาราง RACI บอกว่าใครทำ/ใครอนุมัติอะไร

### 1.2 In Scope (UAT บน prototype)

| ฝั่ง | Scope units | Test basis |
|---|---|---|
| Front Office | 14 feature modules (`01`–`07`, `09`–`15`; เลข `08` ถูกถอดพร้อม Offer) + doc-tier `16`/`17`/`18` (review ระดับ contract) | J-01..J-13 (`business-process-flows.md` §4–15) |
| Back Office | 15 modules (`01`–`08`, `11`–`17`; เลข `09`/`10` ไม่มีไฟล์) + `00G` เป็น cross-cutting ทุก unit | B-01..B-14 (`business-process-flows.md` §17.4–17.15) |
| Cross-side FO↔BO | 9 sync/moderation contracts | X-01..X-09 (`business-process-flows.md` §17.16) |

### 1.3 Out of Scope (Phase 1 UAT)

- **Deferred/postponed modules**: Reports & Analytics (`BO-15` — Phase 2), Directory (`BO-07` — postponed), Broadcast/template/trigger config (`BO-14 §8-11` — Phase 2), chat moderation module (Phase 2), Offer Management (ถอดแล้ว), Reported Articles (ถอดแล้ว — FO-BO-001 e4)
- **Contract-only behaviors** — spec contract สำหรับ production ที่ prototype ไม่ครอบ เช่น deep link, analytics tracking, suspended/banned enforcement ที่ sign-in, delivery timing ≤60s/≤24h, อีเมลส่งจริง, OTP จริง (รายการหลักใน §3.4 — ย้ายไป production UAT)
- **Business Case/ROI** — out-of-scope ของ mission ทั้งชุด (PO/Sponsor)
- **Production NFR** (performance/security/infra จริง) — เหลือเฉพาะสิ่งที่ตรวจบนหน้าจอ prototype ได้

## 2. Test Basis & Traceability

| Input | ไฟล์ | ใช้ทำอะไรใน UAT |
|---|---|---|
| Module specs | `FrontOffice/` 19 ไฟล์ (00G, 00NAV, 01–18 ไม่มี 08) · `BackOffice/` 16 ไฟล์ (00G, 01–08, 11–17) | Expected result + AC IDs (`AC-XXX-###`) ต่อเคส |
| Journeys | `docs/business-process-flows.md` v0.2 | แบ่ง scope unit + เขียน scenario ตาม flow จริง (J/B/X) |
| Entities | `docs/data-dictionary.md` v0.2 (E-01..25, BE-01..27) | test data checklist + field-level expected (mask, type, enum) |
| Relationships | `docs/data-model-erd.md` v0.1 (5 diagrams, 80 mappings) | cross-entity cases (report→case, deletion→cascade, WA→match) |
| QA baseline เดิม | `FrontOffice/QA_TEST_SCENARIO_CHECKLIST.md` v2.0 + `FrontOffice/DEV_*` + `BackOffice/BO_DEV_IMPLEMENTATION_CHECKLIST.md` | seed data/actor ที่มีอยู่แล้ว + เคส regression ของเดิม |
| AC Traceability Matrix | BAC-007 (task ถัดไป) | mapping AC → scenario ครบทุก module — input สำหรับขยาย checklist ตอน execute |

กฎ traceability: ทุก UAT scenario ต้องชี้กลับ ≥1 ในนี้ — `J-xx`/`B-xx`/`X-xx` step, spec `§`, หรือ AC ID; scenario ที่ไม่มี basis ถือว่า exploratory และต้อง tag แยก

## 3. Environment & Test Data

### 3.1 Environment

| ฝั่ง | Environment | Entry point | viewport หลัก |
|---|---|---|---|
| FO | `Prototypes/fo-flow/index.html` (mobile-app simulation, mock data ในไฟล์) | เปิดไฟล์ตรง / serve ผ่าน `Prototypes/server.mjs` | Mobile `440×956` + เช็ก `390`/`768`/`1280`/`1440` ตาม responsive checklist ถ้าเกี่ยว |
| BO | `Prototypes/bo-prototype.html` (desktop web admin, mock data ในไฟล์) | เปิดไฟล์ตรง | Desktop `1920×1080` + responsive states ตาม `docs/responsive-table-standard.md` |

หลักฐานแคปจอตามมาตรฐานเดิมของ repo: `d`=1920×1080, `t`=768×1024, `m`=440×956 — surface ที่ capture ต้องเข้าถึงได้จริงผ่าน UI เท่านั้น

### 3.2 Test Actors (อิง QA checklist §1 + BO session model)

- **FO**: Guest (read-only + Member Sheet gate) · Member A (viewer — follow/save/WA) · Member B (seller/owner — ครบทุก `pfkind`) · Member C (target ของ favorite/mute/block) · New Member (เพิ่งสมัคร — ข้อมูลว่าง)
- **BO**: Master Admin (`ADM-010`) · Admin ตาม 8 System Roles (`BO-16 §9`) — ต้องมีอย่างน้อย 2 admin เพื่อเทส self/last-admin safeguard · Admin สถานะ `Invited`/`Locked`/`Suspended` สำหรับ B-01/B-12
- **System actors**: ProviderJob (Market Data sync — B-09), system job (auto-delete, auto-hide, WA match) — บน prototype เป็น simulation

### 3.3 Seed Data ขั้นต่ำ

ใช้ชุดเดียวกับ `FrontOffice/QA_TEST_SCENARIO_CHECKLIST.md` §1 (seller ครบทุก post kind, portfolio drawer assets, alerts 5 types, WA 3 แบบ, chat states, collections) + BO queues ที่มีอยู่ใน mock: report cases ทั้ง 3 คิว, deletion request, admin accounts ครบทุก status, option groups/suggestions, delivery log rows, audit events — entity checklist อ้าง `data-dictionary.md` §1 + §B-inventory

### 3.4 ข้อจำกัดของ Prototype — เทสไม่ได้ / เทสแบบจำกัด

| กลุ่ม | เทสบน prototype ได้ไหม | ทำอะไรแทน |
|---|---|---|
| `(contract)` items: deep link, analytics, email ส่งจริง, OTP จริง, suspend/ban enforcement, payment | ไม่ได้ | mark `Production UAT` ใน scope register — ไม่นับเข้า exit criteria ของ prototype UAT |
| Timing contracts (moderation ≤60s, reference ≤24h, WA async) | ไม่ได้จริง | ตรวจ UI state/empty/notice ที่ spec กำหนด + trace ผ่าน Delivery Logs surface |
| Deviation พฤติกรรมที่ spec บันทึกเป็น `(deviation)` | ได้ แต่ต้องรู้ | expected = ตาม spec ไม่ใช่ตามที่เห็น — deviation ที่เจอ log เป็น defect ชนิด Known-Deviation |
| Protected screens (AGENTS.md lock list) | ได้ | regression ว่าพฤติกรรมล็อกไม่เปลี่ยน — ห้าม propose แก้จอเหล่านี้จาก defect |

## 4. Entry / Exit Criteria

### 4.1 Entry Criteria (เริ่มรอบ UAT ได้เมื่อครบ)

1. Spec baseline ล็อก + version registry เป็นปัจจุบัน (`FO-PRD-v1.14`, `BO-PRD-v0.1`) — ไม่มี spec change ค้างใน scope ที่จะเทส
2. UAT plan + sign-off template + RACI ออกจาก DRAFT (เอกสารนี้ผ่าน review ของ PO)
3. Test scenarios พร้อม — ครอบทุก scope unit ใน §1.2 และ trace กลับ test basis (§2) ได้
4. Prototype เข้าถึงได้ทั้ง 2 ฝั่ง + seed data ตาม §3.3 ตรวจแล้ว
5. Defect log + triage owner ตาม RACI (§8) ตั้งไว้แล้ว
6. Protected screens baseline เช็กแล้ว — regression reference ชัดก่อนเริ่มกด

### 4.2 Exit Criteria (ปิดรอบ UAT ได้เมื่อครบ)

1. Execute ครบ 100% ของ planned scenarios (รวม blocked ที่แก้แล้วรันใหม่) — exploratory เพิ่มได้แต่ต้อง log
2. **ไม่มี defect ค้างระดับ S1 Blocker / S2 Critical**; S3 Major ต้องมี approved disposition (fix-later ลง DECISION_LOG หรือ scope decision)
3. Defect ทุกตัวมี disposition ครบ: Fixed-retested / Accepted-deviation / Deferred (มี owner+phase) / Not-a-defect (spec-compliant)
4. Sign-off ครบทุก scope unit ที่เข้าเงื่อนไข §1.2 (§9 register)
5. Cross-side flows (X-01..X-09) มีผลตรวจสองฝั่งครบ — moderation ≤60s/reference ≤24h mark เป็น contract-verify note
6. UAT Summary Report (§10) + decision ใหม่ลง `docs/DECISION_LOG.md` §8 ตามกฎ (ถ้ามี)

## 5. ขั้นตอนการทำ UAT (Phases)

| Phase | งาน | Output |
|---|---|---|
| 0 — Readiness | เช็ก entry criteria ทั้ง 6 ข้อ · freeze scope register · เตรียม defect log | readiness checklist ผ่าน |
| 1 — Execution | รัน scenario เป็นวงรอบ: **วง A** FO journeys J-01..J-13 · **วง B** BO journeys B-01..B-14 · **วง C** cross-side X-01..X-09 (ต้องเปิดทั้ง 2 prototypes) | executed log + defect entries |
| 2 — Triage loop | triage defect รายวัน (severity + disposition + owner) — แยก defect / spec-conflict / contract / exploratory finding | defect log อัปเดต + findings |
| 3 — Regression | รันเคสที่ defect fix แล้วซ้ำ + protected screens regression sweep | retest results |
| 4 — Sign-off | รวมผลต่อ scope unit → กรอก sign-off form ทีละหน่วย → consolidated sign-off | sign-off register ครบ + summary report |

หมายเหตุ cadence (แนะนำ ไม่ล็อก): วง A ก่อนเพราะ FO เป็นฐานที่ BO moderation อ้างถึง; วง C ทำหลัง A+B เพราะต้องรู้พฤติกรรมปลายทั้งสองฝั่ง

## 6. Defect Handling

### 6.1 Severity

| ระดับ | นิยาม | ตัวอย่างในโปรเจคนี้ |
|---|---|---|
| S1 Blocker | journey หลักเดินต่อไม่ได้ / ข้อมูลเสีย | sign in ไม่ได้, delete account ไม่ไปต่อ, post หายทั้งระบบ |
| S2 Critical | ฟังก์ชันหลักผิด contract ที่ user กระทบจริง | moderation action ไม่เปลี่ยน visibility, grace countdown ผิด |
| S3 Major | ผิด spec แต่มีทางรอบ / ขอบ scope ย่อย | filter ไม่ persist, badge นับผิด, audit event ขาด field |
| S4 Minor | UX/จอผิดเล็กน้อยไม่กระทบ flow | label drift, spacing, tooltip |
| S5 Cosmetic/Question | คำถาม/ข้อสังเกต ไม่ใช่บั๊กชัดเจน | wording suggestion, spec interpretation |

### 6.2 Lifecycle

`New → Triaged → (In-fix → Fixed → Retest → Closed)` หรือ `Triaged → Disposed` ด้วยหนึ่งใน: `Accepted-deviation` (บันทึกใน spec แล้ว) / `Deferred` (owner + phase) / `Not-a-defect` (spec-compliant — ชี้ `§` ประกอบ) / `Spec-conflict` (ไปขั้นตอน §6.4)

### 6.3 Defect Log Template (ตารางเดียวพอ — เก็บในไฟล์/เครื่องมือที่ทีมเลือก)

| Field | คำอธิบาย |
|---|---|
| `UAT-D-###` | running ID |
| Scope unit / Journey | เช่น `FO-04` หรือ `J-06`/`B-07`/`X-02` |
| Severity + Status | ตาม §6.1/§6.2 |
| Steps + Actual | ขั้นกดจริง + สิ่งที่เห็น (ภาษาหน้าจอ) |
| Expected + Basis | ผลที่ควร + ref (`NN §X` / `J-xx` step / AC ID) |
| Disposition + Owner | ตัวตัดสินตาม RACI |
| Evidence | path ภาพ (`d/t/m` prefix) หรือ `-` |

### 6.4 Spec-conflict Path (สำคัญ — กฎเดิมของโปรเจค)

พบ spec ขัดกันเอง / spec ขัด prototype → **ห้ามแก้เอง** — บันทึกเป็น Finding (`UF-##` ใน §11 หรือ defect ชนิด Spec-conflict) แล้วส่งให้ผู้มีสิทธิ์ตัดสินตาม RACI แถว "spec-conflict decision" — เมื่ออนุมัติแล้วค่อย implement + ลง DECISION_LOG ถ้าระดับ product/cross-module

## 7. UAT Scope Register (ครอบ sign-off)

หน่วย sign-off = module (FO) / module (BO) / cross-side group — journey map ให้ดูว่าแต่ละหน่วยเทสผ่าน flow ไหน

### 7.1 Front Office (14 feature modules + 3 doc-tier)

| Unit | Spec | Journeys หลักที่ครอบ | Prototype surface | Sign-off |
|---|---|---|---|---|
| FO-01 Authentication | `01` | J-01 (sign up/in/out), guest gate | onboarding, auth, member sheet | รอ execute |
| FO-02 Feed | `02` | J-02, J-04, J-08, J-10 (archive/pin) | feed, composer, post menus | รอ execute |
| FO-03 Search & Filter | `03` | J-03, J-06 (bell entry) | search, filter, viewer | รอ execute |
| FO-04 Asset Management | `04` | J-04 (create/status/sold) | asset composer, drawer | รอ execute |
| FO-05 Asset/Post Detail | `05` | J-02, J-04, J-07, J-08 | post detail, comments, viewer | รอ execute |
| FO-06 Profile | `06` | J-11, J-02, J-07, J-08 (follow) | owner/public profile, QR | รอ execute |
| FO-07 Chat | `07` | J-05, J-07 (chat report/block) | chat list/room | รอ execute |
| FO-09 Notification | `09` | J-09 (+ J-06 watch row) | alerts feed, destinations | รอ execute |
| FO-10 Watch Alert | `10` | J-06 | WA sheet/list/manage | รอ execute |
| FO-11 Social | `11` | J-08, J-10 (library), J-07 | like/comment/share/save, collections | รอ execute |
| FO-12 Board | `12` | J-13 | board, article detail | รอ execute |
| FO-13 Settings | `13` | J-12, J-01 (delete account) | settings, legal, delete flow | รอ execute |
| FO-14 Portfolio | `14` | J-04, J-10 | portfolio, sold history | รอ execute |
| FO-15 Trust & Safety | `15` | J-07 | report flow, block | รอ execute |
| FO-16 Integrations (doc-tier) | `16` | — (contract review) | — | contract sign-off |
| FO-17 NFR (doc-tier) | `17` | — (contract review) | — | contract sign-off |
| FO-18 Admin Scope (doc-tier) | `18` | — (boundary check) | — | contract sign-off |
| FO-00G/00NAV cross-cutting | `00G`, `00NAV` | ทุก J (session/gate/visibility/nav) | ทุกจอ | ผูกกับทุก FO unit — ไม่ sign แยก |

### 7.2 Back Office (15 modules + 00G cross-cutting)

| Unit | Spec | Journeys หลัก | Prototype surface | Sign-off |
|---|---|---|---|---|
| BO-01 Authentication | `BO-01` | B-01 | login, invitation, reset, sessions | รอ execute |
| BO-02 Dashboard | `BO-02` | B-02 | KPI, work queue, panels | รอ execute |
| BO-03 User Management | `BO-03` | B-03, B-04 | user accounts, reported users | รอ execute |
| BO-04 Asset Management | `BO-04` | B-05, B-06 | asset list, reported assets/comments | รอ execute |
| BO-05 Content Board | `BO-05` | B-08 | articles, categories, editor | รอ execute |
| BO-06 Market Data | `BO-06` | B-09 | catalog, sync history (read-only) | รอ execute |
| BO-07 Directory | `BO-07` | — | **deferred — postponed** | ข้าม Phase 1 |
| BO-08 Audit Log | `BO-08` | B-14 | audit list + detail drawer | รอ execute |
| BO-11 Watch Alert / Market Demand | `BO-11` | B-10 | demand overview, insights, WA list/detail | รอ execute |
| BO-12 Help & Support | `BO-12` | B-11 | policy versioning, support center | รอ execute |
| BO-13 Account Deletion | `BO-13` | B-07 | request queue/detail, restore/reject | รอ execute |
| BO-14 Notifications | `BO-14` | B-14 (delivery contract) | delivery logs (ผ่าน BO-16 surface) | รอ execute |
| BO-15 Reports & Analytics | `BO-15` | — | **deferred — Phase 2** | ข้าม Phase 1 |
| BO-16 Admin Settings | `BO-16` | B-01, B-12, B-14 | my account, admin accounts, roles, delivery logs | รอ execute |
| BO-17 Option Master | `BO-17` | B-13 | groups/options, reorder, suggestions | รอ execute |
| BO-00G cross-cutting | `BO-00G` | ทุก B (permission/write-contract/safeguard) | ทุกจอ | ผูกกับทุก BO unit — ไม่ sign แยก |

### 7.3 Cross-side (9 flows — sign-off เป็นกลุ่มเดียวต่อชุด)

| Unit | Flows | ต้องเทสอะไร | Sign-off |
|---|---|---|---|
| XS-1 Moderation loop | X-01, X-09 | report intake → queue → action → FO visibility/email state | รอ execute |
| XS-2 Account lifecycle | X-02, X-04 | delete → review → restore/reject/auto-delete; suspend/ban → FO blocked | รอ execute |
| XS-3 Content & reference | X-05, X-06, X-07 | article publish → board; policy → legal + re-consent; support → help rows | รอ execute |
| XS-4 Data & alerts | X-03, X-08 | WA criteria → monitoring/delivery; market data/option → FO autocomplete/filter + inactive warning | รอ execute |

## 8. Mini RACI + Stakeholder Register

### 8.1 Stakeholder Register (พับมาตามข้อตกลง mission — ไม่แยกเอกสาร)

| Stakeholder | Role | Interest / Influence | หน้าที่ใน UAT | Sign-off authority |
|---|---|---|---|---|
| พี่มาเต็ม | Product Owner / Approver | สูง — approver ของ spec/prototype ทุกการเปลี่ยนแปลง (evidence: ทุก finding ใน `business-process-flows.md`/`data-dictionary.md` ปิดด้วยอนุมัติของพี่) | อนุมัติ plan, ตัดสิน spec-conflict, final sign-off | **ทุก scope unit + final** |
| พี่คิง | Domain Decision Owner | สูงเฉพาะ domain — money display rules O-01..O-09 (`docs/money-display-rules.md`, DEC-42) | ตัดสิน defect/conflict ที่เกี่ยว money display; ร่วม sign-off จุดที่แตะเงิน | **conditional — money-related units** |
| Matem (Devin/หนู) | BA / Doc author | เตรียม package + test basis | เขียน plan/scenarios, defect log upkeep, session notes, summary report | — |
| QA Executor | tester | รันเคส | execute, log defect, retest | — (ไม่มีสิทธิ์ sign) |
| Dev / Prototype maintainer | fixer | แก้ defect ในจอ | fix, mark ready-for-retest | — |
| Business Users (TBD) | end-user representative | acceptance จากมุมผู้ใช้จริง | execute วง A/B ร่วม, ให้ verdict เชิง usability | — (recommend เท่านั้น) |

> ช่อง QA Executor / Dev / Business Users = **placeholder** — repo ไม่มีชื่อจริง ให้ PO เติมตอนอนุมัติ plan (ดู UF-02)

### 8.2 RACI Matrix (R=ทำ, A=รับผิดชอบสุดท้าย — แถวละ 1 ตัว, C=ปรึกษา, I=แจ้ง)

| กิจกรรม | PO (พี่มาเต็ม) | พี่คิง | BA | QA | Dev | Business Users |
|---|---|---|---|---|---|---|
| อนุมัติ UAT plan ฉบับนี้ | **A** | C | R | I | I | I |
| เตรียม scenarios + test basis | C | I | **A**/R | R | I | C |
| เตรียม environment + seed data | I | I | **A** | R | R | I |
| Execute — วง A (FO) | I | I | C | **A**/R | C | R |
| Execute — วง B (BO) | I | I | C | **A**/R | C | R |
| Execute — วง C (cross-side) | I | I | C | **A**/R | R | C |
| Defect triage + severity | I | C | R | **A**/R | C | I |
| Defect disposition (fix/defer/accept) | **A** | C (money เท่านั้น) | R | C | C | I |
| Spec-conflict decision | **A** | C (domain ของตน) | R | C | I | I |
| Fix prototype defect | I | I | I | C | **A**/R | I |
| Regression / retest | I | I | I | **A**/R | C | I |
| Sign-off ต่อ scope unit | **A** | C (money units) | R | C | I | C |
| Final UAT sign-off | **A** | C | R | C | I | C |
| บันทึก decision ลง DECISION_LOG | **A** | C | R | I | I | I |

## 9. Sign-off Template

### 9.1 แบบฟอร์มต่อ Scope Unit (copy ไปกรอกทีละหน่วย)

```markdown
## UAT Sign-off — <UNIT-ID> <ชื่อ unit>

| Field | ค่า |
|---|---|
| Scope unit | <เช่น FO-04 Asset Management / BO-13 Account Deletion / XS-2 Account lifecycle> |
| Spec baseline | <FO-PRD-v1.14 / BO-PRD-v0.1 + spec file เวอร์ชันล่าสุดที่เทส> |
| Prototype ref | <commit หรือวันที่ของ fo-flow / bo-prototype ที่เทส> |
| Journeys covered | <J-xx/B-xx/X-xx> |
| Scenarios | planned <n> · executed <n> · passed <n> · failed <n> · blocked <n> |
| Defects | S1 <n> · S2 <n> · S3 <n> · S4 <n> · S5 <n> |
| Open defects | <UAT-D-### + disposition — ต้องไม่มี S1/S2> |
| Findings | <UF-## ที่เกี่ยว + สถานะ decision> |
| Contract-deferred | <รายการที่ defer ไป production UAT> |
| Verdict | ☐ Approved · ☐ Approved with conditions (ระบุ) · ☐ Rejected (ระบุ) |
| Signed — Tester | <ชื่อ + วันที่> |
| Signed — Approver | <ชื่อ + วันที่> |
| Note | <เงื่อนไข/ข้อสงวน> |
```

### 9.2 Final Consolidated Sign-off (ครั้งเดียวท้ายรอบ)

```markdown
## UAT Final Sign-off — TukDaeng Prototype Phase 1

| Field | ค่า |
|---|---|
| รอบ UAT | <ช่วงวันที่ + environment ref> |
| Scope | FO <n>/14 modules · BO <n>/13 modules · XS 4/4 groups (deferred: BO-07, BO-15, contract items) |
| Exit criteria | <ทีละข้อ §4.2 ผ่าน/ไม่ผ่าน + เหตุ> |
| Defect summary | total <n> — open <n> (dispositions ครบ) |
| Findings pending | <UF-## ที่ยังรอ decision — ห้ามมีตัว block> |
| Verdict | ☐ UAT Passed · ☐ Passed with conditions · ☐ Failed |
| Signed — PO | พี่มาเต็ม + วันที่ |
| Signed — QA | <ชื่อ + วันที่> |
| Signed — BA | Matem + วันที่ |
```

## 10. UAT Summary Report (skeleton — กรอกตอนปิดรอบ)

1. ช่วงเวลา + environment + baseline ที่เทส
2. Coverage: ตาราง scope unit × verdict (จาก register §9)
3. Defect analytics: จำนวนตาม severity/module + aging + top root causes
4. Findings & decisions: รายการ UF-## + decision ref (DEC-##) ที่เกิดจากรอบนี้
5. Contract-deferred list → hand-off ไป production UAT plan
6. บทเรียน/ข้อเสนอแนะ process (เช่น seed data ที่ขาด, scenario ที่ spec ไม่ชัด)

## 11. Findings — จุดที่พบระหว่างเขียน plan (บันทึกเท่านั้น ไม่แก้ spec/prototype)

| ID | Finding | สถานะ | Refs |
|---|---|---|---|
| UF-01 | `FrontOffice/QA_TEST_SCENARIO_CHECKLIST.md` v2.0 (synced FO-PRD-v1.14) ยัง list "known documented defects" (`salePosts()` นับ show/hide/sold, viewer `all` tab รั่ว post/hide/sold, `FOR SALE` tag by price) แต่ F-02/F-06 บันทึกว่า **แก้ prototype + spec แล้ว 2026-11-05** — checklist อาจ stale ก่อน execute ต้อง sweep อัปเดตมิฉะนั้นเคสจะ assert ผลผิด | **บันทึก — รอพี่มาเต็มตัดสิน** (แนะนำ: sweep checklist ในงาน QA ก่อน UAT จริง ไม่ใช่ scope BAC-006) | `QA_TEST_SCENARIO_CHECKLIST.md` §Conventions, `business-process-flows.md` F-02/F-06 |
| UF-02 | ไม่มีชื่อจริงของ QA executor / Dev maintainer / Business users ใน repo — RACI §8 ใช้ placeholder | open — รอ PO เติมตอน approve plan | §8.1 |
| UF-03 | BO domain reviewer นอกเหนือ PO ที่มีหลักฐานในเอกสารคือพี่คิงเฉพาะ money display — ไม่มี owner รองสำหรับ domain อื่น (เช่น market data, moderation policy) → ตอนนี้ spec-conflict ทุก domain วิ่งเข้า PO จุดเดียว | open — ทำงานได้แต่ bottleneck เดี่ยว | §8.1/§8.2 |
| UF-04 | Module count drift: FO spec files = `01`–`18` ไม่มี `08` (17 ไฟล์ แบ่ง 14 feature + 3 doc-tier) ส่วน BO = `01`–`17` ไม่มี `09`/`10` (15 ไฟล์) + `00G` — brief เดิมนับ "FO 15 / BO 17" ซึ่งไม่ตรงไฟล์จริงเป๊ะ ๆ plan นี้ยึดไฟล์จริงใน repo | documented — scope register §7 คือ canonical | `FrontOffice/`, `BackOffice/` README_MODULE_INDEX |
| UF-05 | `Prototypes/` root มีไฟล์ scratch/test/diag จำนวนมาก (`test-*.mjs`, `diag-*.mjs`, `scratch/`, `feed-*.html`) — UAT environment ต้องล็อกว่าใช้เฉพาะ `fo-flow/index.html` + `bo-prototype.html` ไม่ให้เคสไปแตะไฟล์ทดลอง | documented — เขียนไว้ใน §3.1 แล้ว | `Prototypes/` |
