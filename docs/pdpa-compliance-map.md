# PDPA Compliance Map — TukDaeng (PDPA → Spec Mapping + Gap List)

| รายการ | ข้อมูล |
|---|---|
| Version | 0.1 (draft) |
| Date | 2026-11-05 · Asia/Bangkok |
| Task | BAC-008 [`5c0b61c2`] — Mission `0e19c244` Objective: PDPA Compliance Mapping / Feature: Compliance Map |
| Status | **v0.1 — APPROVED** (พี่มาเต็ม 2026-11-05; F-02 resolved + gap decisions ตัดสินแล้วลง DEC-52..DEC-56) |
| Source of truth | `FrontOffice/` + `BackOffice/` module specs · `docs/data-dictionary.md` v0.2 (entities/fields) · `docs/uat-ac-matrix.md` v0.1 (AC refs) · `docs/uat-plan.md` v0.1 §3.4 (prototype vs production boundary) |
| Deliverables ต่อเนื่อง | `docs/pdpa-data-processing-register.md` (ตอบ G-01/G-02/G-05 — decisions DEC-52..56) · `docs/pdpa-breach-runbook.md` (ตอบ G-03 — adopted DEC-55) · `docs/privacy-policy-draft.md` (ตอบ F-03) · `docs/pdpa-dsr-sop.md` (ตอบ G-04/G-06 — adopted DEC-54) |

## 0. วิธีอ่านเอกสารนี้

- เอกสารนี้ map **หลักการ PDPA (พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562)** → spec section ที่ cover แล้ว หรือช่องว่างที่ยังไม่มี ออกเป็น gap list พร้อมระดับความสำคัญ
- รูปแบบอ้างอิงตามเอกสารชุดเดียวกัน: `NN §X` = `FrontOffice/NN_*_MODULE.md` section X; `BO-NN §X` = `BackOffice/`; `00G`/`00NAV` = เอกสารกลาง FO; `E-xx`/`BE-xx` = entity ใน `data-dictionary.md`; `XXX-DEC-xxx` = open decision ใน spec/`DECISION_LOG.md`
- **สถานะ mapping**: `Covered` = spec กำหนดพฤติกรรมครบและทดสอบได้ · `Partial` = มีครอบบางส่วน แต่ยังขาดชิ้นสำคัญ · `Gap` = ไม่มี spec เลย
- **Boundary prototype vs production** ตาม `uat-plan.md` §3.4: พฤติกรรมที่ prototype ไม่ครอบ (server-side consent log, analytics pipeline, email จริง, token session, purge job) mark เป็น `(contract)` — เทสได้เฉพาะ production UAT
- **ข้อห้ามของ Mission**: เอกสารนี้ไม่แก้ spec/prototype/protected screens — ทุก gap/ข้อขัดแย้งบันทึกเป็น finding §5 รออนุมัติเท่านั้น
- เอกสารนี้คือ **spec coverage map ไม่ใช่ legal opinion** — ประเด็นที่ต้องตัดสินทางกฎหมาย tag `[Legal]` ให้ Legal/PO พิจารณา

## 1. Personal Data Inventory (สรุปจาก data-dictionary)

Entity ที่เก็บข้อมูลส่วนบุคคล/ระบุตัวตนได้ — ต้นกำเนิดของ scope PDPA ทั้งหมด:

| Entity | Personal data หลัก | Privacy treatment ใน spec |
|---|---|---|
| E-01 User/Account, BE-05 | email, phone, LINE, display name, auth id, IP/login history | masked default ใน BO; reveal ต้อง permission + reason + audit (BO-00G §14, BO-13 §10.4) |
| E-03 Credential & Sign-in Guard | password/credential | sensitive — ห้ามอยู่ใน audit/delivery payload (BO-16) |
| E-04 OTP Verification | OTP codes | sensitive, transient |
| E-05 Consent Record | policy version, optional flags, timestamp, ภาษา | `fo_consent`/`fo_consent_log` (prototype) → server-side log (contract) |
| E-07/E-08 Asset & Sold Record | purchase price/date, sold history | private data — เห็นเฉพาะ owner/admin (00G §14) |
| E-10 Comment, E-15 Report | user-generated content + reporter identity | moderation view ใน BO ตาม permission |
| E-16 Chat Thread/Message | private communications, รูปแนบ | retention + mask ตัวตนเมื่อ anonymize (BO-13 §10.1) |
| E-17/E-18 Notification & Watch Alert | behavioral preference | owner เท่านั้น; BO view read-only + mask |
| E-19 Search/Recent | search behavior | viewer state; aggregate-only ใน Search Insights (BO-11) |
| E-21/BE-19 Account Deletion Request | deletion context, masked user context | masked ใน Request Detail |
| BE-01..03 Admin Account/Invitation/Session | admin email, name, IP/browser metadata | masked; session metadata masked (BE-03) |
| BE-15 Audit Event, BE-20 Delivery Log | actor id, recipient | masked destination (BO-16) |

จุดแข็งระดับ data minimization ที่ spec ล็อกไว้แล้ว: `AC-BO-USER-016` ห้ามปุ่ม export user data จาก User List · Search Insights = aggregate only ไม่มี user-identifying data (BO-11) · push payload ห้ามใส่ private data ที่ไม่จำเป็น (16 §8) · audit/delivery payload ห้ามมี secret/credential (BO-16)

## 2. PDPA Principle → Spec Mapping

### 2.1 Lawful Basis / Consent — `Covered`

| Requirement | Spec ref | รายละเอียด |
|---|---|---|
| แยก required vs optional consent | `00G §8` Consent Model | Required = Terms + Privacy (implied consent, ไม่มี checkbox); Optional = Analytics/Personalized (opt-in, default off) |
| บันทึก consent record | `00G §8`, `E-05 §3.5` | fields: policy version, requiredAcceptedAt, optional flags, ภาษา, recordedAt — server-side consent log `(contract)` |
| Consent UI ตอน onboarding | `01 §6, §8` Privacy Notice / Privacy Settings | Accept all / Reject all / เลือกทีละตัว — ทุกทางบันทึก record (`AC-AUTH-027`) |
| Re-consent เมื่อ policy เปลี่ยน | `00G §8` Re-consent, `01 §8` Re-Consent, `BO-12 §12.2` Policy Publish | version bump → sheet บังคับทุก session; `Decline` → เหลือ Sign out/Exit (`AC-AUTH-051/052`, `AC-BO-SUPPORT` publish flow) |
| Consent enforcement จริง | `00G §8`, `AC-AUTH-031` | Analytics=off ต้องไม่ส่ง analytics event ทุกตัว — `(contract)` ทดสอบบน stg build เท่านั้น |
| Withdraw optional consent | `13 §9` Privacy & cookies | toggle เปลี่ยนได้ทุกเมื่อ + บันทึก consent record ทันที |
| ATT-style tracking | `00G §8`, `AC-AUTH-029` | `Ask App Not to Track` บังคับ Personalized=off |
| Legal docs เข้าถึงได้ | `00G §8` Legal Documents, `13 §9`, `BO-12` | in-app legal viewer + version/effective date; BO จัดการ TH/EN versioned content |

หมายเหตุ `[Legal]`: required consent ใช้ *implied consent* (กด Continue/Create account พร้อม legal text = ยอมรับ) — PDPA §19 ต้องการ consent ที่ชัดเจน; การ bundle Privacy Policy เข้ากับเงื่อนไขการใช้งาน (ไม่ยอมรับ = ใช้ไม่ได้) เป็น design choice ที่ควรให้ Legal ยืนยัน — F-01

### 2.2 Purpose Limitation / Data Minimization — `Partial`

| Requirement | Spec ref | สถานะ |
|---|---|---|
| แยกวัตถุประสงค์ essential vs optional | `00G §8` (essential always-on / optional off) | ✅ spec ชัด |
| จำกัดข้อมูลบน public surface | `00G §10` Visibility, `00G §14` Data Privacy | ✅ private list ชัด (purchase price/date, sold history, portfolio value) |
| Admin เห็นเฉพาะที่จำเป็น | `BO-00G §14` Sensitive mask, `BO-13 §10.4` reveal policy | ✅ mask default + audit on reveal |
| Aggregate-only analytics ฝั่ง BO | `BO-11` Search Insights | ✅ "aggregate only, no user-identifying data" |
| **Register purpose ↔ data category** | — | ⚠️ **GAP** — ไม่มีเอกสารระบุว่า data category ไหนใช้เพื่ออะไรภายใต้ basis ไหน (เช่น email → account status email / LINE → support) — Privacy Policy มี section `How We Use Information` แต่ยังไม่มีเนื้อหา canonical |

### 2.3 Data Retention — `Partial`

| Requirement | Spec ref | สถานะ |
|---|---|---|
| Lifecycle หลัง delete | `BO-13 §10.1` | ✅ Deactivated (30-day grace) → Anonymized (เก็บถาวร+ลบตัวตนขั้นเดียว, restore ไม่ได้) |
| Audit log retention | `BO-08 §11`, `BO-AUDIT-DEC-001` | ✅ baseline ≥1 ปี; เกิน 1 ปีถ้า storage/compliance อนุญาต |
| Retention เป็น system job | `BO-08 §11`, `BO-16 §12`, `AC-BO-SET-006` | ✅ cleanup = system job audit ตัวเอง; admin ลบ audit จาก UI ไม่ได้ |
| **ตัวเลข retention ราย data type** | `DEL-DEC-002`, `SET-DEC-003`, `BO-DEC-002` | ✅ **DECIDED (DEC-53)** — retention schedule ครบ R-01..R-08 (`pdpa-data-processing-register.md` §3) |
| Retention settings UI | `BO-16 §12` | `deferred` — เอาออกจาก nav รอ SET-DEC-003 |
| Policy version retention | `SUP-DEC-004` | ✅ เก็บ Archived ตลอดใน Phase 1 |

### 2.4 Right to Erasure ↔ Account Deletion — `Covered` (จุดแข็งสุดของชุดนี้)

| Requirement | Spec ref | รายละเอียด |
|---|---|---|
| Self-service delete | `13 §9` Delete Account Rule | 2-page flow + password confirm + scheduled dialog |
| Grace period + restore | `13 §9`, `BO-13 §10.1–10.2` | 30 วัน; login-to-restore หรือ admin restore; ปฏิเสธคืน = block self-restore |
| Anonymize เมื่อครบ grace | `BO-13 §10.1` | auto-delete ขั้นเดียว: personal fields → anonymous value; เก็บเฉพาะที่จำเป็น (transaction/chat/report/audit ref) |
| Erasure scope | `data-dictionary §3.21` erasureScope | personal data, chat history, watch alerts, posts — hard delete/anonymize; retained records (reports/audit) = server-side retention |
| Cascade actions | `BO-13 §11` | asset ซ่อนทันที, reports ปิดอัตโนมัติ + audit, chat retain+mask |
| Re-registration | `BO-13 §10.3` | อีเมลเดิมสมัครใหม่ได้ = คนละบัญชี ไม่เชื่อมประวัติ; hashed-email guard = `DEL-DEC-005` resolved (ไม่ใช้ใน V1) |
| User-level erase ย่อย | `07` chat delete/hide, `04` asset delete | ผู้ใช้ลบเนื้อหาของตัวเองได้ระดับ item |

### 2.5 Data Breach — `Gap`

| Requirement | ที่มีใน spec | ที่ขาด |
|---|---|---|
| Detect/log security events | `BO-01 §13` Security Events To Audit, `BO-08` audit capture | — |
| User security notification | `09 §system kind:"security"` (login อุปกรณ์ใหม่/password change) | — |
| **Breach response process** | — | ❌ ไม่มี spec: ไม่มี breach severity classification, ไม่มี flow แจ้ง PDPC ภายใน 72 ชม., ไม่มี flow แจ้งผู้ใช้ที่ได้รับผลกระทบ, ไม่มี breach register |
| **Breach communication template** | — | ❌ ไม่มี — Delivery Log/Broadcast infra มี (`BO-14`, Phase 2) แต่ไม่ผูก breach use case |

### 2.6 Chat / Private Communications — `Partial`

| Requirement | Spec ref | สถานะ |
|---|---|---|
| Chat = private surface | `00G §14`, `07` | ✅ ไม่แสดง private data; room ของ blocked = read-only |
| User controls | `07` mute/hide/delete/block/report | ✅ ครบ |
| Retention post-deletion | `BO-13 §10.1/§11` | ✅ เก็บตาม retention + mask ตัวตนเมื่อ anonymize |
| BO เข้าถึง chat | `BO-13` (Chat Rooms tile read-only context) | ✅ Phase 1 ไม่มี chat moderation module (Phase 2) — admin ไม่อ่านเนื้อหาแชท |
| **Encryption claim** | `07` chat room menu | ✅ **RESOLVED** — เคยมี footer อ้าง E2E ทั้งที่ `ไม่มีใน V1` → ถอด copy แล้ว (F-02) |
| Export chat | `07` (`chsettings` dead route) | ไม่มีใน V1 — ผูกกับ right to access (§2.7) |

### 2.7 Third-Party Sharing / Processors — `Partial`

| Requirement | Spec ref | สถานะ |
|---|---|---|
| Integration inventory | `16 §6` | ✅ Apple OAuth, Google OAuth, FCM, Image CDN, Watch Price API — ครบ 5 providers |
| Security baseline | `16 §8` | ✅ HTTPS ทุก call, token revocation, private data ตรวจสิทธิ์ก่อนส่ง CDN, push payload ไม่ใส่ private data เกินจำเป็น |
| Apple private relay | `16 §7` | ✅ เก็บ relay email เป็น account email + provider รองรับส่งผ่าน relay |
| "ไม่แชร์ให้โฆษณา/data broker" | `01 §6` Privacy Notice copy | ✅ statement มีใน UI copy |
| **Processor/sharing register** | — | ⚠️ **GAP** — ไม่มี spec ว่า field ไหนส่ง provider ไหน ภายใต้ basis อะไร (เช่น FCM ได้ token+payload, CDN ได้ asset images, Watch Price API ได้ query) |
| **Cross-border transfer** | — | ❌ ไม่กล่าวถึงเลย — FCM/CDN/OAuth providers เป็น transfer ต่างประเทศตามนิยาม PDPA |

### 2.8 หลักการอื่นที่ไม่ได้อยู่ใน task scope แต่ PDPA บังคับ — `Gap`

| Requirement | สถานะ | หมายเหตุ |
|---|---|---|
| Right to Access / ขอสำเนาข้อมูลตน (§30) | ❌ Gap | ไม่มี data access request flow หรือ self-service export — `AC-BO-USER-016` ห้าม export จาก BO ด้วยซ้ำ; user ขอผ่าน support channel ได้แต่ไม่มี spec การตอบกลับ |
| Data Portability (§31) | ❌ Gap | ไม่มี machine-readable export — chat export เป็น dead route ไม่มีใน V1 |
| DPO / ช่องทางติดต่อเรื่อง privacy | ❌ Gap | Support Center (`BO-12`) มี channel config แต่ไม่ผูก privacy request/DSR intake; Privacy Policy `Your Rights` section ยังเป็น outline |
| Records of Processing (ROPA) | ❌ Gap | inventory §1 ช่วยได้บางส่วน แต่ไม่มี formal register |
| Security safeguards (§37) | `Partial` | password policy (`00G §12`), session/token rules, HTTPS, mask/permission/audit มีครบใน spec — แต่ไม่มี security policy document รวม |

## 3. Coverage Summary

| หลักการ | สถานะ | จุดแข็ง | ช่องว่างหลัก |
|---|---|---|---|
| Lawful basis / consent | **Covered** | consent record + re-consent + enforcement spec ครบ | implied consent ต้อง Legal ยืนยัน (F-01) |
| Purpose limitation | Partial | minimization rules ล็อกหลายจุด | ไม่มี purpose↔data register (G-02) |
| Data retention | **Covered** | lifecycle + audit baseline + ตัวเลขครบ (DEC-53) | — |
| Right to erasure | **Covered** | 30-day grace + anonymize + cascade + audit | — |
| Data breach | **Gap** | security events + audit มี | ไม่มี breach response/notification spec เลย (G-03) |
| Chat/private data | Partial | private rules + retention + BO ไม่อ่านแชท | E2E claim แก้แล้ว (F-02 ✅), export ไม่มี (G-04) |
| Third-party sharing | Partial | integration list + security rules | ไม่มี processor register + cross-border (G-05) |
| Data subject rights อื่น | **Gap** | — | access/portability/DPO/ROPA (G-04, G-06, G-07) |

## 4. Gap List (รออนุมัติ — ไม่แก้ spec)

| ID | Gap | Severity | ผลกระทบ | ข้อเสนอแนะ + สถานะ |
|---|---|---|---|---|
| **G-01** | ตัวเลข retention period ราย data type ยังไม่มี (`DEL-DEC-002`/`SET-DEC-003`/`BO-DEC-002` รอ Legal ทั้งกลุ่ม) | **High** | anonymize/purge job build ไม่ได้; "เก็บตาม retention policy" ใน BO-13 ไม่มีตัวเลขจริงให้อ้าง | ✅ **RESOLVED — DEC-53** ตัวเลขครบ R-01..R-08 ใน register §3; spec open decisions ปิดแล้ว (DEL-DEC-002/SET-DEC-003/BO-DEC-002/NOTI-DEC-003) |
| **G-02** | ไม่มี purpose ↔ data category ↔ lawful basis register | **High** | Privacy Policy section `How We Use Information` ไม่มีเนื้อหา canonical; audit/compliance เช็คไม่ได้ว่า data ใช้ตรงวัตถุประสงค์ | ✅ **register ร่างแล้ว** — `pdpa-data-processing-register.md` §1 (15 data categories) + privacy policy draft ใช้เป็น input แล้ว |
| **G-03** | ไม่มี data breach response spec | **High** | PDPA §37(4) บังคับแจ้ง PDPC ≤72 ชม. + แจ้งผู้ใช้เมื่อ high risk — ตอนนี้ไม่มี process, owner, template | ✅ **RESOLVED — DEC-55** adopt `pdpa-breach-runbook.md` เป็น process อย่างเป็นทางการ; owner role set ยืนยันแล้ว 2026-11-05 — เหลือชื่อจริง + tabletop ใน launch checklist (B-01..B-05) |
| **G-04** | ไม่มี data subject access/portability channel | **Medium** | user ขอสำเนาข้อมูลตัวเองไม่ได้ในระบบ; ต้อง handle manual นอกระบบโดยไม่มี spec | ✅ **RESOLVED — DEC-54** adopt `docs/pdpa-dsr-sop.md` (manual intake ผ่าน support channel + verify + ตอบ ≤30 วัน); self-service export คง Phase 2 |
| **G-05** | ไม่มี third-party processor register + cross-border clause | **Medium** | FCM/CDN/OAuth = transfer ต่างประเทศแต่ไม่มี spec/privacy notice กล่าวถึง | ✅ **processor register ร่างแล้ว** — `pdpa-data-processing-register.md` §2 (7 providers + location/basis) + cross-border clause ใน privacy draft §2 |
| **G-06** | ไม่มี DPO/privacy contact spec | **Medium** | data subject exercise rights ไม่มีช่องทาง canonical | ✅ **RESOLVED — DEC-54** ไม่ตั้ง DPO (ไม่ถึงเกณฑ์); privacy requests ผ่าน support channel เดิม ไม่ต้องแก้ protected screen |
| **G-07** | ไม่มี ROPA / security policy document | **Low** | compliance audit ต้องประกอบเอกสารเองจาก spec หลายเล่ม | **Deferred** — register §1 ทำหน้าที่ ROPA เบาแทนได้แล้ว ไม่ต้องเอกสารเพิ่ม |
| **G-08** | Consent withdrawal ของ required consent = delete account เท่านั้น | **Low** `[Legal]` | PDPA อนุญาต withdraw consent; การผูก required consent กับการใช้งานเป็น design ที่พบทั่วไป แต่ควร Legal ยืนยัน | ✅ **RESOLVED — DEC-52** required = contract basis ไม่ใช่ consent จึงไม่มี required consent ให้ถอน; optional ถอนได้ที่ Privacy & cookies |

## 5. Findings — ข้อขัดแย้งใน spec (บันทึกเท่านั้น ไม่แก้)

| ID | ประเด็น | ตำแหน่ง | รายละเอียด |
|---|---|---|---|
| **F-01** | ~~Implied consent สำหรับ Privacy Policy~~ | `00G §8`, `01`, `13` | ✅ **RESOLVED — DEC-52** implied consent คงไว้: required เป็น contract basis + notice (ไม่ใช่ PDPA consent); optional consent opt-in ชัดเจนอยู่แล้ว — ไม่ต้องเพิ่ม checkbox |
| **F-02** | ~~UI อ้าง E2E Encryption แต่ spec บอกไม่มีใน V1~~ | `07` chat room menu footer | ✅ **RESOLVED 2026-11-05** — ถอด copy claim + CSS ออกจาก `Prototypes/fo-flow/index.html` (อนุมัติพี่มาเต็ม), อัปเดต `07` §chat menu + `QA-CHAT-011` ตาม; E2E/Letter Sealing ยัง `ไม่มีใน V1` |
| **F-03** | Privacy Policy content = outline 4 sections เท่านั้น | `13 §9`, `BO-12` | ร่างเนื้อหา TH 4 sections แล้ว — `docs/privacy-policy-draft.md` (รอ Legal ตรวจ + EN translation + ชื่อนิติบุคคลจริงก่อนกรอก `POL-PP`) |
| **F-04** | Consent log เป็น localStorage ใน prototype | `00G §7/§8`, `uat-plan §3.4` | `fo_consent`/`fo_consent_log` อยู่ฝั่ง client — production ต้อง server-side consent log `(contract)`; UAT บน prototype ทดสอบ persistence/audit ของ consent ไม่ได้จริง → mark Production UAT แล้วใน uat-plan |
| **F-05** | ~~Watch Price API อาจส่ง user data โดยไม่ได้ระบุ~~ | `16 §7` Watch Price API, `14` Portfolio | ✅ **RESOLVED — DEC-56** processor contract rule: providers ส่งเฉพาะ query (brand/model/reference) ห้ามผูก user identifier |

## 6. Prototype vs Production Boundary (อ้าง `uat-plan.md` §3.4)

| PDPA behavior | Prototype เทสได้ | ต้อง Production UAT |
|---|---|---|
| Consent UI + record save | ✅ (localStorage) | server-side consent log |
| Re-consent on version bump | ✅ (dev button จำลอง) | trigger จาก backend version check จริง |
| Analytics off = no events | ❌ | stg build + proxy verification (`AC-AUTH-031`) |
| Delete account flow + grace period | ✅ (UI ครบ) | auto-anonymize job จริง, credential purge |
| Mask/anonymize ใน BO | ✅ | retention policy engine + purge job |
| Breach response | — | ไม่มี spec ทั้งคู่ (G-03) |

## 7. Next Actions (อัปเดต 2026-11-05 — ตัดสินครบแล้ว เหลืองาน launch checklist)

**ทำและตัดสินแล้ว:**
1. ✅ G-02+G-05 → `docs/pdpa-data-processing-register.md` §1-2 (purpose↔data↔basis↔processor register)
2. ✅ G-01 → **DEC-53** retention schedule R-01..R-08 — ปิด spec open decisions `DEL-DEC-002`/`DEL-DEC-005`/`SET-DEC-003`/`BO-DEC-002`/`NOTI-DEC-003`
3. ✅ G-03 → **DEC-55** adopt `docs/pdpa-breach-runbook.md`
4. ✅ G-04+G-06 → **DEC-54** adopt `docs/pdpa-dsr-sop.md`; privacy contact = support channel เดิม ไม่ตั้ง DPO
5. ✅ F-03 → `docs/privacy-policy-draft.md` (เนื้อหา TH 4 sections)
6. ✅ F-02 → ถอด E2E claim ออกจาก prototype + spec + QA checklist
7. ✅ F-01+G-08 → **DEC-52** consent model ยืนยัน (required = contract basis, ไม่ต้องเพิ่ม checkbox)
8. ✅ F-05 → **DEC-56** processor contract rule (providers ห้ามผูก user identifier)

**เหลือ — งาน launch checklist ไม่ใช่งาน spec/doc:**
9. Legal review `docs/privacy-policy-draft.md` + EN translation + ชื่อนิติบุคคล/contact จริง → กรอก `POL-PP` ผ่าน `BO-12` Policy & Versioning
10. Breach runbook: เติมชื่อ owner จริง (B-01 — role set confirmed 2026-11-05) + internal channel (B-02) + template confirm (B-03) + tabletop ซ้อม 1 รอบ (B-05) ก่อน launch
11. DSR SOP: สื่อสารช่องทาง intake ให้ support รู้ก่อน launch
