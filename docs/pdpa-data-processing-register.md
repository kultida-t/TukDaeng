# PDPA Data Processing Register — TukDaeng (Purpose ↔ Data ↔ Basis ↔ Processor)

| รายการ | ข้อมูล |
|---|---|
| Version | 0.1 (draft) |
| Date | 2026-11-05 · Asia/Bangkok |
| Task | BAC-008 [`5c0b61c2`] — Mission `0e19c244` Objective: PDPA Compliance Mapping / Feature: Compliance Map |
| Status | **v0.1 — decisions ตัดสินแล้ว 2026-11-05** (พี่มาเต็มมอบหมายให้ Devin ตัดสินแทนตามมาตรฐาน — ลง DEC-52..DEC-56 ใน `docs/DECISION_LOG.md` §8 + ปิด spec open decisions `DEL-DEC-002`/`DEL-DEC-005`/`SET-DEC-003`/`BO-DEC-002`/`NOTI-DEC-003`) |
| Source of truth | `docs/data-dictionary.md` v0.2 (E-01..E-25, BE-01..BE-27) · `FrontOffice/` + `BackOffice/` module specs · `docs/pdpa-compliance-map.md` v0.1 (gap refs G-01/G-02/G-05) |
| ใช้ทำอะไร | input เขียน Privacy Policy จริง (`docs/privacy-policy-draft.md`) · ตอบคำถาม compliance audit · ตัวเลข retention draft ให้ Legal ติ๊กเลือก |

## 0. วิธีอ่านเอกสารนี้

- ตารางนี้คือ **ROPA เวอร์ชันเบา** — แถวละ data category: เก็บอะไร (entity ref) → เอาไปทำอะไร (purpose) → เก็บด้วยสิทธิ์อะไร (lawful basis) → ส่งให้ใคร (processor/recipient) → อยู่ที่ไหน (location) → เก็บนานแค่ไหน (retention)
- **Lawful basis ตาม PDPA**: `สัญญา` = จำเป็นต่อการให้บริการตามสัญญา (§24) · `หน้าที่ตามกฎหมาย` = legal obligation (§24) · `ประโยชน์อันชอบธรรม` = legitimate interest (§24) · `ความยินยอม` = consent (§19 — optional processing เท่านั้น)
- `(DEC-53)` = ตัวเลข retention ตัดสินแล้ว 2026-11-05 — นำไป build ได้ (รายละเอียด §3); ประเด็น consent/DSR/breach ตัดสินที่ §4 (DEC-52..56)
- ref รูปแบบเดียวกับชุดเอกสาร: `E-xx`/`BE-xx` = entity · `NN §X` = FO spec · `BO-NN §X` = BO spec

## 1. Register — ข้อมูลส่วนบุคคลที่ระบบเก็บ

| Data category | Fields หลัก (entity) | Purpose | Lawful basis | Processor / Recipient | Location | Retention |
|---|---|---|---|---|---|---|
| ตัวตนบัญชี | email, display name, password hash, social auth id (E-01, E-03) | สร้าง/เข้าบัญชี, แจ้งสถานะบัญชี (suspend/ban/deletion) | สัญญา | Email provider `(contract)`, Apple relay (ผู้ใช้ Apple ที่ซ่อนอีเมล — `16 §7`) | server บริษัท + provider ต่างประเทศ | ตลอดอายุบัญชี + grace 30 วัน → anonymize (`BO-13 §10.1`) |
| OTP | code, expiry (E-04) | ยืนยันตัวตนตอนสมัคร/กู้รหัส | สัญญา | Email provider | server | ใช้แล้วทิ้ง — อายุสั้นตาม expiry (spec) |
| Consent record | policy version, optional flags, timestamp, ภาษา (E-05) | พิสูจน์การยินยอม + trigger re-consent | หน้าที่ตามกฎหมาย | — (server-side log, `00G §8`) | server | อายุบัญชี + 2 ปีหลังลบ (DEC-53) |
| โปรไฟล์สาธารณะ | avatar, bio, followers/following (E-01, E-12) | แสดงโปรไฟล์/สังคมในแอป | สัญญา | แสดงสาธารณะตาม visibility (`00G §10`) | server | ตลอดอายุบัญชี |
| ลิสติ้ง/โพสต์ | post content, รูป, ราคาขาย, spec fields (E-06, E-07, E-09) | marketplace listing, search, watch alert matching | สัญญา | Image CDN (`16 §7`) — public เท่านั้น | CDN ต่างประเทศ | ตลอดอายุโพสต์; ลบบัญชี → ซ่อน+anonymize |
| ข้อมูลส่วนตัวของลิสติ้ง | purchase price/date, sold history, provenance, proof of payment (E-07, E-08) | Portfolio valuation ส่วนตัว | สัญญา | owner เท่านั้น + admin masked (`00G §14`, `BO-00G §14`) | server | ตลอดอายุบัญชี |
| แชท | message text, รูปแนบ, read state (E-16) | สื่อสารผู้ซื้อ-ผู้ขาย | สัญญา | คู่สนทนา; FCM เฉพาะ push payload ไม่ใส่เนื้อความ (`16 §8`) | server | ตลอดอายุบัญชี → หลังลบ: mask ตัวตน (`BO-13 §11`) + purge เนื้อความ 1 ปี (DEC-53) |
| รายงาน/report | reporter id, เหตุผล, evidence refs (E-15, BE-06) | trust & safety, moderation, ป้องกันการฟ้องร้อง | ประโยชน์อันชอบธรรม + หน้าที่ตามกฎหมาย | admin ตาม permission (masked) | server | 2 ปีหลังปิดเคส (DEC-53) |
| Notification | type, actor refs, read state (E-17) | แจ้งกิจกรรมในแอป | สัญญา | FCM (push) — payload จำกัด (`16 §8`) | server + FCM ต่างประเทศ | ตลอดอายุบัญชี |
| Watch Alert | criteria, notification prefs (E-18, BE-16) | แจ้งลิสติ้งที่ตรงเงื่อนไข | สัญญา | — | server | ตลอดอายุบัญชี |
| พฤติกรรมการใช้งาน | search recents, content prefs, hide/mute flags (E-14, E-19, E-22) | personalize feed/search | ความยินยอม (Personalized toggle — `00G §8`) / สัญญา (ส่วนจำเป็น) | analytics provider เฉพาะเมื่อ opt-in `(contract)` | server + provider เมื่อ opt-in | recents ตลอด session/บัญชี; aggregate ไม่ระบุตัว (`BO-11`) |
| Analytics events | `auth_*`, search, screen events (spec §15 ทุกโมดูล) | ปรับปรุงผลิตภัณฑ์ | ความยินยอม (Analytics toggle — default off) | analytics provider TBD `(contract)` | provider ต่างประเทศ | ⟳ รอ provider decision |
| ช่องทางติดต่อ support | ค่า channel ที่ user กรอก (E-23) | support center | ประโยชน์อันชอบธรรม | support channels ภายนอก (LINE/phone/email — user ไปเอง) | server | ตลอดอายุบัญชี |
| เซสชัน/อุปกรณ์ | session id, masked IP, browser/OS (E-02, BE-03) | security, session management | ประโยชน์อันชอบธรรม | — | server | 90 วัน (DEC-53) |
| คำขอลบบัญชี | request context, masked user context (E-21, BE-19) | ดำเนินการสิทธิ์ลบข้อมูล | หน้าที่ตามกฎหมาย | admin masked | server | anonymized refs 5 ปี (DEC-53) |
| Audit events | actor, action, ref, before/after (BE-15) | security audit, traceability | หน้าที่ตามกฎหมาย + ประโยชน์อันชอบธรรม | admin ตาม permission | server | ≥1 ปี baseline (`BO-08 §11`); security/sensitive 2 ปี (DEC-53) |
| Delivery logs | recipient (masked), channel, status (BE-20) | ตรวจการส่ง email/push | ประโยชน์อันชอบธรรม | — | server | 1 ปี (DEC-53) |
| บัญชีแอดมิน | admin email, name, role, login history (BE-01..03) | BO access, accountability | สัญญา (จ้างงาน) + หน้าที่ตามกฎหมาย | — | server | ตลอดจ้างงาน + audit retention |

## 2. Processor / Third-Party Register (ตอบ G-05)

| Provider | ข้อมูลที่ส่ง | Purpose | Basis | Location | หมายเหตุ |
|---|---|---|---|---|---|
| Apple (Sign in with Apple) | auth token, relay email | SSO authentication | สัญญา | ต่างประเทศ (US) | relay email เป็น account email ได้ (`16 §7`) |
| Google (OAuth) | auth token, account email | SSO authentication | สัญญา | ต่างประเทศ (US) | `16 §7` |
| Firebase Cloud Messaging | device token + push payload | push notification | สัญญา | ต่างประเทศ (US) | spec ห้ามใส่ private data ใน payload (`16 §8`) |
| Image Storage / CDN | รูป asset ที่ user อัปโหลด | เก็บ/เสิร์ฟรูป | สัญญา | ต่างประเทศ (CDN edge) | private asset ตรวจสิทธิ์ก่อนส่ง (`16 §8`) |
| Watch Price API | คำค้น brand/model/reference (ไม่ควรมี user data) | ราคาตลาด Portfolio | สัญญา | ต่างประเทศ TBD | **ข้อควรระวัง**: spec ไม่ได้บอกชัดว่าส่ง user data ไหม — ถ้า provider log query+user id = รั่วไหล → ควรยืนยันส่งเฉพาะ query (F-05 ใน compliance map) |
| Email provider `(contract)` | recipient email + เนื้อหาจดหมาย | transactional email (OTP, account status, deletion lifecycle) | สัญญา/หน้าที่ตามกฎหมาย | TBD | provider ยังไม่เลือก — DLV-xxx trace มีอยู่ (`BO-14`) |
| Analytics provider TBD `(contract)` | events เมื่อ opt-in | product analytics | ความยินยอม | TBD | ไม่มีใน prototype; enforce opt-out ที่ stg build (`AC-AUTH-031`) |

**Cross-border note (PDPA §28-29)**: providers ข้างบนทั้งหมดคือ transfer ต่างประเทศ — Privacy Policy draft (F-03 fix) มี clause ครอบแล้ว (`privacy-policy-draft.md` §2) ระบุว่าส่งไปยังผู้ให้บริการต่างประเทศที่มีมาตรฐานคุ้มครองเพียงพอหรือได้ความยินยอม

## 3. Retention Schedule — **DECIDED (DEC-53, 2026-11-05)**

ปัญหาเดิม: spec หลายจุดเขียน "เก็บตาม retention policy" แต่ไม่มีตัวเลข (`DEL-DEC-002`, `SET-DEC-003`, `BO-DEC-002`, `NOTI-DEC-003`) — ตัวเลขด้านล่างตัดสินแล้วตามมาตรฐาน marketplace ไทย (เทียบอายุความฟ้องละเมิด/แพ่ง) และปิด open decisions ใน spec register เดิมแล้ว

| ID | Data | Retention | เหตุผล | ปิด decision |
|---|---|---|---|---|
| R-01 | Consent record (หลังลบบัญชี) | **2 ปี** | พิสูจน์ยินยอมย้อนหลังช่วงอายุฟ้องละเมิด (2 ปี) | DEL-DEC-002 |
| R-02 | Chat content (หลัง anonymize) | mask ตัวตนทันที + **purge เนื้อความ 1 ปี** | dispute/support window; ไม่จำเป็นต้องเก็บเนื้อความนาน | DEL-DEC-002, BO-DEC-002 |
| R-03 | Report/moderation records | **2 ปีหลังปิดเคส** | เทียบอายุความละเมิด; safety ย้อนหลัง | DEL-DEC-002 |
| R-04 | Session/login metadata | **90 วัน** | security investigation window มาตรฐาน | SET-DEC-003 |
| R-05 | Deletion archive (anonymized refs) | **5 ปี** | ครอบอายุฟ้องแพ่งส่วนใหญ่ | DEL-DEC-002 |
| R-06 | Audit log | **1 ปี (ตาม spec baseline) + sensitive/security 2 ปี** | spec ล็อก ≥1 ปีแล้ว (`BO-08 §11`) — ขยายเฉพาะ high-risk | SET-DEC-003 (ผูก BO-AUDIT-DEC-001) |
| R-07 | Delivery/notification logs | **1 ปี** | trace การส่ง + dispute support | SET-DEC-003, NOTI-DEC-003 |
| R-08 | Export files (BO export, Phase 2) | **ลบ 7 วันหลังสร้าง** | export มี sensitive data — ยิ่งเก็บยิ่งเสี่ยง | SET-DEC-003 (สอดคล้อง REP-DEC-001 defer) |

## 4. Decisions Record — ตัดสินแล้ว 2026-11-05 (พี่มาเต็มมอบหมาย Devin ตัดสินแทน; ลง `DECISION_LOG.md` §8)

| ID | คำถามเดิม | คำตอบที่ตัดสิน | เหตุผล | Decision ref |
|---|---|---|---|---|
| Q-01 | Required consent ใช้ implied consent พอไหม? | **คง implied consent — ไม่เพิ่ม checkbox** | core processing ใช้ lawful basis `สัญญา` (§24) ไม่ใช่ consent อยู่แล้ว — การกดผ่าน legal text คือการยอมรับเงื่อนไข/รับทราบ notice ไม่ใช่ PDPA consent; consent จริงมีแค่ optional (analytics/personalization) ซึ่ง opt-in ชัดเจนอยู่แล้ว | **DEC-52** |
| Q-02 | ถอน required consent = Delete Account เท่านั้น พอไหม? | **พอ — ไม่ต้องมี granular consent** | ไม่มี required consent ให้ถอนอยู่แล้ว (ไม่ได้ใช้ consent basis); optional consent ถอนได้ตลอดที่ Settings > Privacy & cookies; หยุดรับบริการ = Delete Account | **DEC-52** |
| Q-03 | แต่งตั้ง DPO ไหม / ช่องทาง privacy request? | **ไม่ตั้ง DPO เต็มตำแหน่งใน V1 — ใช้ support email channel เดิมรับ privacy request** | ขนาด processing ยังไม่ถึงเกณฑ์บังคับ DPO; Privacy Policy draft ชี้ช่องทาง Help & Support อยู่แล้ว — ไม่ต้องแก้ protected screen; owner = privacy contact (PO) | **DEC-54** |
| Q-04 | DSR ตอบยังไงใน V1? | **manual SOP — `docs/pdpa-dsr-sop.md`** | รับผ่าน support channel → verify → ตอบ ≤30 วัน; self-service export = Phase 2 | **DEC-54** |
| Q-05 | ตัวเลข retention? | **ตามตาราง §3 (R-01..R-08)** | เทียบอายุความละเมิด/แพ่งของไทย — ปิด `DEL-DEC-002`/`SET-DEC-003`/`BO-DEC-002`/`NOTI-DEC-003` ใน spec registers | **DEC-53** |
| Q-06 | breach process adopt ไหม? | **adopt `docs/pdpa-breach-runbook.md`** | owner = role-level (PO/dev lead/privacy contact); เติมชื่อจริงใน launch checklist | **DEC-55** |
| Q-07 | DEL-DEC-005 แฮชอีเมลกันสมัครซ้ำ? | **ไม่ทำใน V1** | spec §10.3 อนุญาตสมัครใหม่อีเมลเดิมอยู่แล้ว; hash guard เพิ่ม privacy surface โดยไม่มี abuse case จริง — revisit เมื่อมีเหตุ | ปิด DEL-DEC-005 |

## 5. เอกสารที่เกี่ยวข้อง

- `docs/pdpa-compliance-map.md` — gap/finding ต้นทางของ register นี้ (G-01/G-02/G-05)
- `docs/privacy-policy-draft.md` — ร่างเนื้อหา Privacy Policy 4 sections จาก register นี้ (F-03)
- `docs/pdpa-breach-runbook.md` — breach response process (G-03)
- `docs/data-dictionary.md` — entity/field ต้นทาง
- `docs/uat-plan.md` §3.4 — boundary prototype vs production
