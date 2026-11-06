# TukDaeng Decision Log — Canonical Index (DOC-030)

| รายการ | ข้อมูล |
|---|---|
| Version | 1.4 |
| Date | 2026-11-05 · Asia/Bangkok |
| Task | DOC-030 [`d9ae9924`] — Mission 6 [`31829e57`] Objective 3 (Decision Log Unification) · v1.2 = DOC-033 [`ee3c153a`] implement approved decisions (DEC-49/50 + spec row closures) · v1.3 = DOC-035 [`b8a33f8b`] implement DEC-51 (ตัด BO consignment data model + prototype surface) · v1.4 = BAC-010 [`7e4ee919`] record DEC-57 (grace-period restore path — amend DEL-DEC-001) + DEC-58 (success-metrics v0.1 = draft ไม่ใช่ spec contract) · v1.5 = FSP-036 [`53f3f41e`] record DEC-59 (WA match pool = priced sale+post) + DEC-60 (followers/following lists = guest-viewable) |
| Status | **CANONICAL** — index เดียวของ decision ทั้งระบบ (FO + BO + product) |

## 0. วิธีใช้เอกสารนี้

- **เอกสารนี้คือจุดค้นเดียวของ decision ทุกตัว** — fact ของแต่ละ decision อยู่ที่ *register of record* เพียงที่เดียวตาม §1; เอกสารอื่นอ้างด้วย **ID เท่านั้น** ห้ามคัดลอกเนื้อความ decision ซ้ำ
- ถ้า index กับ register of record ขัดกัน ให้ยึด **register of record** แล้วแจ้งแก้ index
- **Decision ใหม่ระดับ product/cross-module** → ลงทะเบียนใน §8 ของเอกสารนี้ด้วยเลขต่อ `DEC-49` ขึ้นไป (ทั้งฝั่ง FO/BO)
- **Open decision ระดับ module spec** → ยังเขียนใน section `Open Decisions` ของ module spec นั้น ๆ ตามเดิม (`XXX-DEC-NNN`/`BO-XXX-NNN`) แต่**ต้องเพิ่ม/อัปเดตแถวใน index นี้ด้วยทุกครั้ง**
- การ supersede ไม่ลบ decision เดิม — mark status `superseded` พร้อมชี้ไปตัวใหม่ใน §7

## 1. Register of Record ต่อ namespace

| Namespace | Register of record (fact อยู่ที่นี่) | Scope |
|---|---|---|
| `S-01`–`S-29` | `FrontOffice/TukDaeng_Master_Product_Definition.md` §16 (archived master — เก็บเป็น decision history เท่านั้น) + sign-off `deliverables/fo-spec-sync/FSP-005-consolidated-gap-signoff.md` | FO spec-sync sign-off ของ baseline `FO-PRD-v1.9` (2026-10-22) |
| `D1`–`D21` (portfolio sign-off) | `FrontOffice/14_PORTFOLIO_MODULE.md` deviation table (D1–D21) + สำเนา sign-off ใน master §16 (D1–D5, D12) | Portfolio spec-sync sign-off (FSP-024) |
| `DEC-01`–`DEC-48` | `deliverables/FO-TEST-001-22-decision-register.md` (APPROVED & LOCKED) — รายละเอียดชุด IG อยู่ใน `deliverables/FO-TEST-001-CONSOLIDATED-IG-decisions-and-backlog.md` | FO product/test decisions 2026-10-30 → 2026-11-04 |
| `DEC-R010-01`–`09` (+`05b`) | `deliverables/REQ-010-decision-log.md` | NB requirement gap decisions (Mission 5, 2026-11-04) |
| `e1`–`e4`, `OPEN-1`–`OPEN-5` | `deliverables/FO-BO-001-coverage-audit.md` §6 | FO↔BO coverage-audit product decisions (resolved 2026-11-02/03) |
| `BO-MARKET-DEC-001`–`004` | `BackOffice/06_MARKET_DATA_MODULE.md` §26 | BO Market Data |
| `BO-DIR-DEC-001`–`004` | `BackOffice/07_DIRECTORY_MODULE.md` §18 | BO Directory |
| `BO-AUDIT-DEC-001`–`004` | `BackOffice/08_AUDIT_LOG_MODULE.md` §17 | BO Audit Log |
| `BO-WA-DEC-001`–`003` | `BackOffice/11_WATCH_ALERT_MODULE.md` §20 | BO Watch Alert |
| `SUP-DEC-001`–`004` | `BackOffice/12_HELP_SUPPORT_MODULE.md` §19 | BO Support Center / Policy |
| `DEL-DEC-001`–`006` | `BackOffice/13_ACCOUNT_DELETION_MODULE.md` §20 | BO Account Deletion |
| `NOTI-DEC-001`–`005` | `BackOffice/14_NOTIFICATIONS_MODULE.md` §19 | BO Notifications (Phase 2 deferred) |
| `REP-DEC-001`–`004` | `BackOffice/15_REPORTS_ANALYTICS_MODULE.md` §23 | BO Reports & Analytics (Phase 2) |
| `SET-DEC-002`–`004` | `BackOffice/16_ADMIN_SETTINGS_MODULE.md` §22 (`SET-DEC-001` ถูกลบใน BO-16-v1.0 — ดู §7) | BO Admin Settings |
| `BO-OPT-001`–`005`, `009`, `010` | `BackOffice/17_OPTION_MASTER_MODULE.md` §21 | BO Option Master (prefix ไม่มี `DEC`) |
| `BO-DEC-001`–`006` | `BackOffice/BO_MASTER_BASELINE.md` §10 | BO cross-module baseline |
| `O-01`–`O-09` (+ open items) | `docs/money-display-rules.md` §9 — **DRAFT รอพี่คิงตัดสิน** (owner decision: ห้ามแตะเอกสารนี้ตาม DEC-42) | Money display rules ร่วม FO+BO |
| `D1`–`D13`/`D7b`, `D1`–`D16`, `D1`–`D10` (deviations) | deviation tables ใน `FrontOffice/11_SOCIAL`, `12_BOARD`, `15_TRUST_SAFETY_MODULE.md` (per-spec namespace — D ของแต่ละเล่มเป็นคนละชุด) | Documented prototype deviations ของ spec แต่ละเล่ม |

## 2. Index — FO sign-off (`S-xx`) + Portfolio (`D`)

Record: master §16 (archived) + `FSP-005` sign-off · ทุกแถว = sign-off ที่ล็อก baseline `FO-PRD-v1.9` เว้นแต่ระบุ

| ID | Decision | Status | Notes |
|---|---|---|---|
| S-01 | Board = editorial magazine model | active | `12_BOARD` |
| S-02 | Delete account grace = login-to-restore | active | `13_SETTINGS` |
| S-03 | Share ต้อง login ทุก surface | active | `00_GLOBAL` §11 |
| S-04 | Report Article = contract-only | **superseded** → `e4` (FO-BO-001) | ตัดออกจาก V1 ทั้งระบบ 2026-11-03 |
| S-05 | Settings = IG 6-section | active | `13_SETTINGS` |
| S-06 | Notification settings 4 toggles ไม่มี Offer | active | `13_SETTINGS` |
| S-07 | Chat thread = user+item | active | `07_CHAT` |
| S-08 | WA notification → Post Viewer ตรง | active | `00_NAV` §8 |
| S-09 | Feed = post-centric | active | `00_GLOBAL` §10 |
| S-10 | `salePosts()` pfkind leak = defect | active | ไม่แก้ prototype |
| S-11 | WA auto-name + instant delete + snapshot criteria | active | `10_WATCH_ALERT` |
| S-12 | Comment composer = emoji quick-react only | **superseded** → `DEC-17` | composer จริงอยู่ใน V1 แล้ว |
| S-13 | Blocked profile = IG keep-page | active | `06_PROFILE` |
| S-14 | Public `all` tab leak = defect | active | `06_PROFILE` |
| S-15 | Portfolio headline = Total invested | active | `14_PORTFOLIO` |
| S-16 | Guest กด feed tabs ได้ไม่ gate | active | `02_FEED` |
| S-17 | `system` notification type | **superseded → restored** — ดู `DEC-41`→`DEC-43` | ปัจจุบัน: `system` อยู่ใน V1 (3 subtypes + category filter) |
| S-18 | ไม่เขียน E2E/Letter Sealing เป็น claim | active | `07_CHAT` |
| S-19 | Drawer 9 items = placeholder | active | `00_NAV` §11 |
| S-20 | ตัด spec-only auth states | active | `01_AUTHENTICATION` |
| S-21 | Password rule เดียว ≥8 + เลข/สัญลักษณ์ | active | `00_GLOBAL` §12 |
| S-22 | Email signup ไม่ auto-login | active | `01_AUTHENTICATION` |
| S-23 | Recent Searches อยู่ใน V1 (≤8) | active | `03_SEARCH` |
| S-24 | ไม่มี Search Sort UI | active | `03_SEARCH` |
| S-25 | ไม่มี provenance/consignment entity | active | `04_ASSET_MGMT`/`14_PORTFOLIO` |
| S-26 | Like count = private (own post) | active | `11_SOCIAL` |
| S-27 | Delete account = 2-page flow | active | `13_SETTINGS` |
| S-28 | Change password = in-app page | active | `13_SETTINGS` |
| S-29 | Contract-only keep (deep link, analytics, network ฯลฯ) | active | ทุกเล่ม |
| D1/D4 | Portfolio entry = wallet icon; sellable = sale/show/hide | active | record: `14_PORTFOLIO` D1/D4 |
| D2 | Headline = Total invested (Σ purchase) | active | record: `14_PORTFOLIO` D2 |
| D3 | Sale Record = price + date เท่านั้น | active | record: `14_PORTFOLIO` D3 |
| D5 | ตัด Top Brand Holdings + YTD | active (reopen ได้ใน future) | record: `14_PORTFOLIO` D5 |
| D12 | Consignment = copy + flag เท่านั้น | **superseded** → `DEC-50` | consignment ถูกตัดออกจาก FO ทั้งหมด 2026-11-04 (BO data model ตัดตาม `DEC-51`) |

## 3. Index — FO product decisions (`DEC-01`–`DEC-48`)

Record: `deliverables/FO-TEST-001-22-decision-register.md` (locked) · รายละเอียด A/B/C ของ DEC-25/26/27 อยู่ใน `deliverables/FO-TEST-001-CONSOLIDATED-IG-decisions-and-backlog.md` · spec landing อยู่ใน amendment sections ของ module specs (DEC-25 amendments ใน 00_NAV/06/07/09/10/12, DEC-28 amendment ใน 15)

| ID | Decision (ย่อ) | Status | ผูกกับ |
|---|---|---|---|
| DEC-01 | ไม่มีระบบชำระเงินในแอป V1 ทุก surface (GAP-7) | active | SHELL-066 |
| DEC-02 | โพสต์ Sold ยังแสดงบน Saved พร้อม badge (GAP-8) | active | LIB-106 |
| DEC-03 | WA match count ลดทันทีเมื่อของขาย (GAP-9) | active | WA-064 |
| DEC-04 | เปิด Post Detail จาก chat card ของ Sold ได้ (GAP-10) | active | CHAT-125 |
| DEC-05 | Stale Ask → toast ไม่เปิด chat (GAP-11) | active | CHAT-126 |
| DEC-06 | Report เป็น anonymous — ผู้ถูกรายงานไม่ได้รับแจ้งเตือน (GAP-12) | active | TRS-062 |
| DEC-07 | BO moderation (Hide/Remove) สะท้อน FO: กรองออก + `al_unavail` (GAP-13) | active | TRS-063 |
| DEC-08 | Deactivated account ซ่อนจาก public ทันที (GAP-14) | active | PROF-111 |
| DEC-09 | Chat คู่สนทนาเมื่ออีกฝ่าย deactivated: อ่านย้อนได้ ส่งไม่ได้ (GAP-15) | active | CHAT-127 · DEC-25/A12 |
| DEC-10 | Restore scope ใน grace: กู้ทุกอย่างยกเว้น Watch Alerts (GAP-16) | active | SET-121 |
| DEC-11 | Not-interested undo คืน pool เมื่อ refresh (GAP-17) | active | LIB-107 |
| DEC-12 | Deep link → gated surface: เปิดหน้า + Member Sheet ทับ (GAP-18) | active | E2E-016 |
| DEC-13 | Feed pagination + infinite scroll (params: 10/หน้า โหลดเมื่อเหลือ 3) | active | AC-FEED-035 |
| DEC-14 | Carousel swipe หยุดปลาย + double-tap = like | active | AC-FEED-010 |
| DEC-15 | Pull-to-refresh บนสุด feed | active | AC-FEED-035 |
| DEC-16 | Viewer/Detail carousel ใช้กติกาเดียวกับ feed | active | PV-015/026/027, DET-007 |
| DEC-17 | Comment reply flat แบบ IG + composer อยู่ใน V1 | active (supersede S-12) | SHT-018/020 · 11 D2 |
| DEC-18 | Feed scroll-to-hide เฉพาะหน้า Feed | active | 00_NAV §6.3A |
| DEC-19 | แปลไทยเต็มทั้งแอป ยกเว้นเนื้อหาผู้ใช้/board | active | LANG-045 ค้าง build |
| DEC-20 | Share post ให้เพื่อน → เข้าห้อง chat จริง | active | FEED-041, SHT-051 |
| DEC-21 | Status tag ตาม pfKind (SOLD/HIDDEN รวม) | active | DET-009, PV-053 |
| DEC-22 | Recents ค้นหาเก็บบนเครื่องข้ามเปิดแอป | active | SRCH-016 |
| DEC-23 | Hashtag results กรอง ni/muted/blocked | active | SRCH-032 |
| DEC-24 | เปิด search ใหม่ = landing + ล้าง state | active | SRCH-030 |
| DEC-25 | ชุดตัดสิน IG A1–A27 (alerts pagination, board like per-user, tab state, chat server-backed ฯลฯ) | active — detail ใน CONSOLIDATED doc §A | amendments หลายเล่ม |
| DEC-26 | ตัดออกจาก V1: ALT-070 (new-device login) + WA-054 (self-match noti) | **partially superseded** — ALT-070 restore โดย DEC-48; **WA-054 ยัง active** | spec 09 amendment |
| DEC-27 | คำตอบ C1–C6 (message requests, board deep link V1 ฯลฯ) | active | CONSOLIDATED §C |
| DEC-28 | Block state server-backed ข้ามเครื่อง/sign-out | active | 15 amendment |
| DEC-29 | Legal TH — ใช้ draft เป็นตัวอย่างก่อน | closed-conditionally — รอเนื้อหาฉบับจริง | FO-TEST-001-LEGAL-TH-draft.md |
| DEC-30 | ชุดแก้ batch A ตาม SPEC-CHECK | active | batch-A §16 |
| DEC-31 | batch C ตรวจรายแถวแล้ว | active | batch-C report |
| DEC-32 | `system` type คงอยู่ (ตีความ DEC-26) | **superseded → DEC-41** | — |
| DEC-33 | own `following` rows มีปุ่ม Chat | active | PROF-047/062 |
| DEC-34 | ผลตรวจ batch B2/C2 รายเคส (739 เคส) | active | batch-B2-C2 report |
| DEC-35 | หน่วยเงิน `THB`+comma ทั้งสองภาษา | **superseded → DEC-42** | — |
| DEC-36 | Suggestion/Recent rows ไม่แสดง `N listings` | active | SRCH-007/008 |
| DEC-37 | `AC-AUTH-031` (sign-up) → `AC-AUTH-001A` | active | spec 01 renumber |
| DEC-38 | Change Password canonical = 13_SETTINGS §9 | active | spec 01 sync |
| DEC-39 | Legal consent ≠ privacy consent (ตีความ register ข้อ 1) | active | AUTH-060/011 |
| DEC-40 | ปิด batch A — spec/citation hygiene sweep | active | — |
| DEC-41 | ถอน `system` type ออกจาก V1 | **superseded → DEC-43** | — |
| DEC-42 | หน่วยเงิน FO = `฿` สัญลักษณ์เดียวทั้งแอป | active (supersede DEC-35; resolve 14 D14) | FO-CURRENCY |
| DEC-43 | `system` type คืน V1 (3 subtypes) + category filter | active (supersede DEC-41; ตาม NB-046) | ALT-015/030 restore |
| DEC-44 | Watch Alert button บน feed header | active (NB-014/036) | `00_NAV` §4 |
| DEC-45 | View counting = scroll-pass ≥55% เลื่อนซ้ำนับซ้ำ ช่วงแรก | active (NB-033 · DEC-R010-05b) | `02_FEED` §9 |
| DEC-46 | Profile settings: burger → gear | active (NB-048) | `06_PROFILE` |
| DEC-47 | Per-page config = selective (เฉพาะหน้าที่มีของให้ตั้ง) | active (NB-036/047 · DEC-R010-05) | `00_GLOBAL` §11 |
| DEC-48 | ตีความ DEC-26: new-device login คืนตาม DEC-43 | active (supersede DEC-26 ส่วน ALT-070) | ALT-070 restore |

## 4. Index — Requirement-gap decisions (`DEC-R010-xx`)

Record: `deliverables/REQ-010-decision-log.md` · ทุกข้อปิด verdict แล้ว 2026-11-04 (covered 31 / partial 8 / gap 5 / design-ref 7) — deltas ที่อนุมัติถูกบันทึกซ้ำเป็น `DEC-43`–`DEC-47` ใน register หลัก

| ID | Decision | Status |
|---|---|---|
| DEC-R010-01 | วิธีอ่าน verdict (covered/partial/gap/design-ref) | closed |
| DEC-R010-02 | NB-015–021 (ThaiLand News) = design context ไม่ใช่ requirement | closed |
| DEC-R010-03 | NB-011/034 = design principle ไม่เขียน spec rule; NB-031 คงดีไซน์เดิม | closed |
| DEC-R010-04 | NB-013/038 covered; NB-033 view-counting rule; NB-039 defer อนาคต | closed → DEC-45 |
| DEC-R010-05 | WA button บน feed (NB-014/036) + page-config selective + gear icon | closed → DEC-44/46/47 |
| DEC-R010-05b | View counting rule (NB-033) — scroll-pass ช่วงแรก | closed → DEC-45 |
| DEC-R010-06 | NB-046: system type คืน + category filter (chat badge-only ถูกต้อง) | closed → DEC-43 |
| DEC-R010-07 | NB-022 covered (แอปแยกหมวด); NB-024 Family Office defer phase 2 | closed |
| DEC-R010-08 | NB-049–051 = process constraints นอก spec | closed |
| DEC-R010-09 | NB-025/029/032 = duplicates ไม่นับซ้ำ | closed |

## 5. Index — FO↔BO coverage decisions (`e-x`, `OPEN-x`)

Record: `deliverables/FO-BO-001-coverage-audit.md` §6 · ทุกข้อ resolved 2026-11-02/03

| ID | Decision | Status |
|---|---|---|
| e1 | FO Help = dynamic rows ตาม BO Support Center config | resolved 2026-11-03 (FO-PRD-v1.12 / BO-12-v0.4) |
| e2 | Report ไม่มี `Additional details` — reason-only | resolved (BO ตัด field) |
| e3 | Chat report ส่ง account context เท่านั้น ไม่แนบ transcript | resolved 2026-11-02 (by-design IG) |
| e4 | ตัด Report Article/Board Content ออกจาก V1 ทั้งระบบ | resolved 2026-11-03 (FO-PRD-v1.13; supersede S-04) |
| OPEN-1 | ไม่มี report-tracking feedback ใน V1 | resolved — ไม่ใช่ gap (15 §5) |
| OPEN-2 | Chat report message context → BO | resolved 2026-11-02 (= e3) |
| OPEN-3 | WA `source` field (search vs detail origin) | resolved 2026-11-02 (implement + spec 11 sync) |
| OPEN-4 | ถอน report review SLA/deadline ทั้งระบบ รวม FO | resolved 2026-11-02 (FO-PRD-v1.11) |
| OPEN-5 | Post-only surface: ไม่มี list นอกคิว report; Asset List = asset entity | resolved 2026-11-03 (BO-04-v1.6/BO-05-v1.3) |

## 6. Index — BO spec Open Decisions

Record: section `Open Decisions` ของ module spec แต่ละเล่ม · ✅ = ตัดสินแล้วใน spec

| ID | Decision | Status |
|---|---|---|
| BO-MARKET-DEC-001 | เปิด manual sync trigger บน BO หรือไม่ | ✅ resolved 2026-11-04 — operations permission only + audit + rate-limit guard |
| BO-MARKET-DEC-002 | FX rate source USD→THB | **open — P0** (BO_FINAL_REVIEW §6) |
| BO-MARKET-DEC-003 | Mapping warning queue แยกหรือไม่ | ✅ resolved 2026-11-04 — Phase 1 read-only warning; correction = backend/provider process |
| BO-MARKET-DEC-004 | The Watch API plan/quota production | **open — P0** |
| BO-DIR-DEC-001 | FO Directory production V1 หรือ placeholder-only | ✅ resolved 2026-11-04 — placeholder-only V1 (กดแล้ว toast `เร็ว ๆ นี้`); activation = requirement ใหม่ |
| BO-DIR-DEC-002 | Community category taxonomy | open (รอ Product — จอดจนกว่า Directory activation) |
| BO-DIR-DEC-003 | Consignment Centers ผูก workflow Phase 1 | ✅ resolved 2026-11-04 — ตัด consignment binding ทั้งหมด (ไม่ใช่แค่ FK-ready); binding ตัดสินใหม่ตอน Directory activation |
| BO-DIR-DEC-004 | Map provider production | open (ตอบเมื่อ Directory เปิด) |
| BO-AUDIT-DEC-001 | Audit retention >1 ปี | ✅ resolved 2026-11-04 — เก็บนานกว่า 1 ปีสำหรับ security/export/sensitive events ถ้า storage/compliance อนุญาต (ตัวเลขจริงผูก retention cluster รอ Legal) |
| BO-AUDIT-DEC-002 | Audit write fail: block หรือ queue retry | ✅ resolved 2026-11-04 — block high-risk; queue retry สำหรับ low-risk read/report events |
| BO-AUDIT-DEC-003 | Redaction policy PII ใน audit payload | ✅ resolved 2026-11-04 — masked payload default + redaction event แยก (ตาม AC-BO-AUDIT-017) |
| BO-AUDIT-DEC-004 | ส่ง audit เข้า external SIEM | ✅ resolved 2026-11-04 — defer future phase (ไม่มีใน Phase 1/2 scope) |
| BO-WA-DEC-001 | FO แสดง Admin Disabled alert | ✅ resolved — ไม่มี Admin Disabled (read-only) |
| BO-WA-DEC-002 | Inactive market data → alert disabled หรือหยุด trigger | ✅ resolved — หยุด trigger ใหม่ เก็บ alert ไว้ |
| BO-WA-DEC-003 | Bulk disable alert | ✅ resolved — ไม่เปิด (read-only) |
| SUP-DEC-001 | Policy publish ส่ง notification หรือไม่ | ✅ resolved 2026-11-04 — ไม่ส่งใน Phase 1 (broadcast infra Phase 2); ถ้าต้องการ = task ใหม่ใน module 14 Phase 2 |
| SUP-DEC-002 | Channel type นอก 5 ประเภท | ✅ resolved 2026-11-04 — fixed list 5 ประเภทใน Phase 1 |
| SUP-DEC-003 | Policy HTML tag นอก allowed list | ✅ resolved 2026-11-04 — allowed list เท่านั้น; เพิ่ม tag = task ใหม่ + ปรับ sanitizer |
| SUP-DEC-004 | Policy version retention | ✅ resolved 2026-11-04 — เก็บ Archived ตลอดใน Phase 1 |
| DEL-DEC-001 | Restore policy | ✅ resolved — amended 2026-11-05 → `DEC-57`: restore 2 ช่องทาง (login-to-restore default + admin support path); reject blocks self-restore |
| DEL-DEC-002 | Retention period chat/report/audit ก่อน purge | ✅ resolved 2026-11-05 — DEC-53 (chat mask+purge 1 ปี, report 2 ปี, audit 1 ปี+sensitive 2 ปี, archive 5 ปี, consent +2 ปี) |
| DEL-DEC-003 | Anonymization timing | ✅ resolved — superseded โดย DEL-DEC-006 (ขั้นเดียว) |
| DEL-DEC-004 | Sensitive reveal policy | ✅ resolved — masked + reveal on-demand + audit |
| DEL-DEC-005 | แฮชอีเมลกันสมัครซ้ำ | ✅ resolved 2026-11-05 — ไม่ใช้ hash check ใน V1 (revisit เมื่อมี abuse) |
| DEL-DEC-006 | Lifecycle รวมขั้นเดียว (archive+anonymize พร้อมกันที่ครบ grace) | ✅ resolved 2026-09-08 (supersede DEL-DEC-003 เดิม) |
| NOTI-DEC-001 | Broadcast ใน FO Notification Center หรือ push-only | ✅ resolved 2026-11-04 — formal defer to Phase 2 (ตัดสินพร้อม Phase 2 scoping) |
| NOTI-DEC-002 | Broadcast approval workflow | ✅ resolved 2026-11-04 — formal defer to Phase 2 |
| NOTI-DEC-003 | Notification retention period | ✅ resolved 2026-11-05 — DEC-53: delivery/notification logs 1 ปี |
| NOTI-DEC-004 | FCM/APNs provider payload schema | ✅ resolved 2026-11-04 — formal defer to Phase 2 |
| NOTI-DEC-005 | Market Update/Sale Success/Account Action เข้า FO phase ใด | ✅ resolved 2026-11-04 — formal defer to Phase 2 |
| REP-DEC-001 | Retention period report/export files | ✅ resolved 2026-11-04 — formal defer to Phase 2 (อาจต้องคำตอบก่อนถ้า Phase 1 มี export → ผูก retention cluster) |
| REP-DEC-002 | Scheduled report email/export | ✅ resolved 2026-11-04 — formal defer to Phase 2 |
| REP-DEC-003 | Report aggregation: live query vs snapshot | ✅ resolved 2026-11-04 — formal defer to Phase 2 |
| REP-DEC-004 | Sensitive export ต้อง approval เพิ่มหรือไม่ | ✅ resolved 2026-11-04 — permission + reason + audit พอ Phase 1; approval workflow = Phase 2 backlog (ผูก SET-DEC-004) |
| SET-DEC-002 | Security policy fields ใดแก้ได้จริง | ✅ resolved 2026-11-04 — freeze ทั้ง section Phase 1 (แก้ผ่าน config/deploy); reopen Phase 2 พร้อม decision field editable |
| SET-DEC-003 | Retention period ราย entity (chat/export) | ✅ resolved 2026-11-05 — DEC-53 (session 90 วัน, audit 1+2 ปี, logs 1 ปี, export ลบ 7 วัน) |
| SET-DEC-004 | Approval workflow สำหรับ high-risk setting change | ✅ resolved 2026-11-04 — permission + reason + audit พอ Phase 1; approval = Phase 2 backlog ผูก Roles & Permissions policy |
| BO-OPT-001 | Option Master phase | ✅ resolved — Phase 1 |
| BO-OPT-002 | Prototype screen | ✅ resolved — สร้างครบแล้ว |
| BO-OPT-003 | System option deactivate policy | ✅ resolved — Controlled Deactivation |
| BO-OPT-004 | Reorder UI | ✅ resolved — Reorder Modal + up/down fallback |
| BO-OPT-005 | Group-level actions policy | ✅ resolved — 4 actions บน Option Group List |
| BO-OPT-009 | Option key lock policy | ✅ resolved — ล็อกตั้งแต่สร้าง |
| BO-OPT-010 | Delete option policy | ✅ resolved — รองรับใน Phase 1 (type-to-confirm) |
| BO-DEC-001 | BO language mode | ✅ resolved 2026-11-04 — Thai primary V1; English deferred (ไม่มี EN toggle ใน V1) |
| BO-DEC-002 | Chat retention period | ✅ resolved 2026-11-05 — DEC-53 (ผูก DEL-DEC-002) |
| BO-DEC-003 | Account deletion anonymization timing | ✅ resolved — 30-day grace ตาม DEL-DEC-006 (lifecycle ขั้นเดียว); แถว baseline annotate แล้ว 2026-11-04 |
| BO-DEC-004 | Admin remove asset permission | ✅ resolved 2026-11-04 — remove = `Permanently Hidden` + required reason + audit; ไม่มี hard delete Phase 1; high-value/disputed ใช้ approval path ร่วม SET-DEC-004 |
| BO-DEC-005 | Board public SEO web requirement | ✅ resolved 2026-11-04 — mobile Board content only; no public web SEO in V1 |
| BO-DEC-006 | Integration map FO↔BO รูปแบบใหม่ | ✅ resolved 2026-11-04 — distributed model + lightweight Integration Reference index (§11) |

## 7. Money display (`O-xx`, draft) + supersession chains + dangling refs

### 7.1 FOX `O-01`–`O-09` — `docs/money-display-rules.md` §9 (DRAFT รอพี่คิง — ห้ามแตะเอกสารตาม DEC-42)

| ID | สาระ | สถานะ |
|---|---|---|
| O-01 | การปัด/เลื่อนหน่วย | pending-confirm (ใช้ได้ตรง §3.1) |
| O-02 | ทศนิยม 2 หลักเสมอ | **ต้องตัดสินใหม่** — §3.2 ตัวเลือก A/B/C |
| O-03 | Auto Extended M + manual unit | pending-confirm (เสนอข้าม Settings หน่วย phase นี้) |
| O-04 | กลุ่มเปรียบเทียบหน่วยร่วม | pending-confirm |
| O-05 | ลบ/ศูนย์/ไม่มีข้อมูล (`−`,`—`,`<0.01`) | pending-confirm + แก้ `N/A`→`—` |
| O-06 | Mobile tap→popup | pending-confirm (BO = tooltip/detail) |
| O-07 | ช่องกรอกจำนวนจริง + auto comma | pending-confirm (ตรงของเดิม) |
| O-08 | วันที่ยอด vs วันประเมิน | pending-confirm |
| O-09 | THB ก่อน / หลายสกุลภายหลัง | pending-confirm |

Open items ในเอกสารเดียวกัน (§9): ทศนิยม A/B/C · Settings หน่วย · copy `—` vs `No market price` · Market Data `Median` ไม่มีหน่วย · ตัวนับที่ไม่ใช่เงิน (`1.2K` views) · migrate mock เป็น number — **หมายเหตุ:** การแสดงสกุลเงิน FO ตัดสินแล้วแยกต่างหากใน DEC-42 (`฿` ทั้งแอป); doc นี้คง draft เดิมตามคำสั่งเจ้าของ

### 7.2 Supersession chains

```
S-04 ──superseded──▶ e4 (FO-BO-001)                         [Report Article ตัดจาก V1]
S-12 ──superseded──▶ DEC-17                                 [composer จริงเข้า V1]
S-17 ──superseded──▶ DEC-41 ──superseded──▶ DEC-43          [system type: baseline→ถอน→คืน]
DEC-26 (ALT-070 part) ──superseded──▶ DEC-48                [new-device login คืน; WA-054 ยัง active]
DEC-32 ──superseded──▶ DEC-41 ──superseded──▶ DEC-43        [system type interpretation]
DEC-35 ──superseded──▶ DEC-42                               [THB+comma → ฿ unified]
DEL-DEC-003 ──superseded──▶ DEL-DEC-006                     [anonymization แยกจังหวะ → ขั้นเดียว]
14_PORTFOLIO D14 ──resolved──▶ DEC-42                       [THB vs ฿ headline]
14_PORTFOLIO D12 ──superseded──▶ DEC-50                     [consignment copy+flag ตัดออก FO ทั้งหมด; BO data model ตัดตาม DEC-51]
12_BOARD D8 ──resolved──▶ DEC-25 (A2)                       [board like per-user]
11_SOCIAL D2 ──resolved──▶ DEC-17                           [comment composer]
SET-DEC-001 ──removed──▶ (BO-16-v1.0, 2026-09-19 — แถวถูกลบออกจาก spec)
```

### 7.3 Dangling / legacy references

- **`INT-DEC-005`** — ✅ **re-anchored 2026-11-04 (DOC-031):** เดิมอ้างใน `BackOffice/07_DIRECTORY_MODULE.md` (§9, L156) ชี้ไป integration map file ที่เก็บ `INT-DEC-*` ซึ่งถูกตัดไปแล้ว (ดู BO-DEC-006) — re-anchor ไป `BO-DIR-DEC-001` (`07_DIRECTORY_MODULE.md` §18) โดยคง constraint เดิม: FO Directory ยังเป็น placeholder → BO ไม่ถือว่า Active = production route เปิด
- **`CLOSED-DEC-01`** — label ใน `deliverables/FO-TEST-001-02-shell.md` L158 ชี้ไป `DEC-01` (ไม่ใช่ decision ใหม่)

## 8. New decisions (`DEC-49+`)

ลงทะเบียน decision ใหม่ระดับ product/cross-module ที่นี่ (append ตารางนี้; อย่าแก้ register เก่าที่ locked)

| ID | Date | Decision | Status | Ref |
|---|---|---|---|---|
| DEC-49 | 2026-11-04 | FO sync timing 3 ชั้น (product contract — implementation detail ตัดสินตอน backend design): **security actions** (suspend/ban/deletion/session revoke) FO enforce ภายใน request ถัดไปของ user — ไม่มี tolerated delay, session/token invalidation เป็นวิธีหลักไม่อาศัย cache expiry · **moderation actions** (hide/remove/restore content, comment moderation) visible propagation ≤ 60 วินาที + public surfaces validate entity status ก่อน render · **reference/master data** (option master, market data, directory, support center, policy) propagation ≤ 24 ชม.ผ่าน scheduled sync/refresh, FO อ่านผ่าน cached read-model · Watch Alert match/notification delivery = async job ไม่ผูก SLA | active | `BackOffice/00_GLOBAL_RULES_MODULE.md` §12 sync timing |
| DEC-50 | 2026-11-04 | ลบ consignment ออกจาก FO surfaces ทั้งหมด (supersede D12 ส่วน copy+flag): ตัด foot note `สินค้าฝากขาย`/`consignment` TH/EN บน portfolio dashboard + ลบ `own` flag/เงื่อนไข `own !== false` ออกจาก data model และ `pfoEligible` — Consignment Center ยังเป็น drawer placeholder row ตาม BO-DIR-DEC-001 และ consignment binding ถูกตัดตาม BO-DIR-DEC-003 (re-decide ตอน Directory activation) | active | `FrontOffice/14_PORTFOLIO_MODULE.md`, `Prototypes/fo-flow/index.html`, `FrontOffice/PRODUCT_DEFINITION.md`, `FrontOffice/04_ASSET_MANAGEMENT_MODULE.md` |
| DEC-51 | 2026-11-04 | ตัด consignment ออกจาก BO data model + protected prototype surface พร้อมกัน bundle เดียว (ต่อ `DEC-50` ที่ตัดฝั่ง FO — DOC-034 sign-off Option 2): ถอด `Consignment` pill / `Sale + Consignment` filter + semantics / consignment sensitive fields / portfolio rule / masked rows (`04_ASSET_MANAGEMENT_MODULE.md` + `00_GLOBAL_RULES_MODULE.md` §14) · ถอด consignment surface ทั้งหมดใน `Prototypes/bo-prototype.html` (filter option, list pill, filter matcher, flag 5 assets, asking price path, provenance branches, Consignment Details modal, search text, CSS) — 5 mock assets (AST-8831/8802/8579/8559/8548) กลายเป็น `Sale` ธรรมดา · ไม่มี production consignment data → ไม่มี data migration · Directory "Consignment Center" taxonomy + FO drawer placeholder อยู่นอก scope (re-decide ตอน Directory activation ตาม `BO-DIR-DEC-001`/`003`) | active | `BackOffice/04_ASSET_MANAGEMENT_MODULE.md`, `BackOffice/00_GLOBAL_RULES_MODULE.md`, `Prototypes/bo-prototype.html`, `BackOffice/BO_DEV_IMPLEMENTATION_CHECKLIST.md`, `BackOffice/BO_UI_UX_STANDARD.md`, `deliverables/DOC-034-consignment-brief.md` |
| DEC-52 | 2026-11-05 | PDPA consent model ยืนยันแบบเดิม (BAC-008 — พี่มาเต็มมอบหมาย Devin ตัดสินแทน): required consent ใช้ implied consent (legal text กำกับ submit action, ไม่มี checkbox) — lawful basis ของ core processing = `สัญญา` (PDPA §24) ไม่ใช่ consent จึงไม่ต้องมี explicit checkbox; consent จริงมีเฉพาะ optional (analytics/personalization) ซึ่ง opt-in ชัดเจน default off อยู่แล้ว · ถอน optional consent = Settings > Privacy & cookies; หยุดรับบริการ = Delete Account · ไม่ต้องแก้ spec/prototype ใด ๆ | active | `FrontOffice/00_GLOBAL_RULES_MODULE.md` §8, `docs/pdpa-data-processing-register.md` §4 Q-01/Q-02 |
| DEC-53 | 2026-11-05 | Retention schedule รวม (BAC-008 — ปิด retention cluster): consent record = อายุบัญชี + 2 ปี · chat = mask ตัวตนที่ anonymization + purge เนื้อความ 1 ปี · report/moderation = 2 ปีหลังปิดเคส · session/login metadata = 90 วัน · deletion archive (anonymized refs) = 5 ปี · audit log = 1 ปี baseline + security/sensitive 2 ปี · delivery/notification logs = 1 ปี · export file (Phase 2) = ลบ 7 วันหลังสร้าง — ปิด `DEL-DEC-002`/`SET-DEC-003`/`BO-DEC-002`/`NOTI-DEC-003` ใน spec registers (`REP-DEC-001` คง defer Phase 2) | active | `docs/pdpa-data-processing-register.md` §3, spec open-decision rows `BackOffice/13` §20, `BackOffice/16` §22, `BackOffice/14`, `BackOffice/BO_MASTER_BASELINE.md` §10 |
| DEC-54 | 2026-11-05 | Privacy contact + DSR process สำหรับ V1 (BAC-008): ไม่แต่งตั้ง DPO เต็มตำแหน่ง (ขนาด processing ยังไม่ถึงเกณฑ์บังคับ) — privacy owner = PO · DSR intake ผ่าน support email channel เดิม (Help & Support — ไม่ต้องเพิ่ม channel/แก้ protected Support Center) · manual SOP: intake → verify → ตอบ ≤30 วัน (PDPA §31); self-service export = Phase 2 | active | `docs/pdpa-dsr-sop.md`, `docs/pdpa-data-processing-register.md` §4 Q-03/Q-04 |
| DEC-55 | 2026-11-05 | Adopt `docs/pdpa-breach-runbook.md` v0.1 เป็น breach response process อย่างเป็นทางการ (BAC-008): severity S1–S3, 8 steps + SLA (PDPC ≤72 ชม.เมื่อ S1/เสี่ยงสูง, แจ้งผู้ใช้เมื่อ high risk), breach register, template — owner ระดับ role (PO/dev lead/privacy contact); เติมชื่อจริง + tabletop ใน launch checklist | active | `docs/pdpa-breach-runbook.md` |
| DEC-56 | 2026-11-05 | Third-party processor contract rule (BAC-008 — ตอบ F-05): data providers ต้องไม่รับ user identifier — Watch Price API และ provider อนาคตส่งเฉพาะ query (brand/model/reference) ไม่ผูก user; push payload ห้ามใส่ private data (คง spec `16 §8` เดิม); processor register = living doc `docs/pdpa-data-processing-register.md` §2 | active | `FrontOffice/16_INTEGRATIONS_MODULE.md` §8, `docs/pdpa-data-processing-register.md` §2 |
| DEC-57 | 2026-11-05 | Restore path ช่วง grace period 30 วัน (BAC-002 — แก้ cross-side conflict F-07): **login-to-restore เป็น default** — user sign-in ด้วยบัญชีเดิมระหว่าง grace = cancel deletion + restore ทันที (FO contract `S-02`); **admin restore = support path** (reason + audit) สำหรับผู้ใช้ที่ติดต่อ support หรือกู้เองไม่ได้; **ปฏิเสธคืนบัญชี = block self-restore** — sign-in เจอ account-deleted support state ไม่ restore · amend `DEL-DEC-001` (เดิม admin-only ไม่มี self-service) + audit event ใหม่ `ACCOUNT_DELETION_SELF_RESTORE` | active | `BackOffice/13_ACCOUNT_DELETION_MODULE.md` §10.2/§20, `FrontOffice/13_SETTINGS_MODULE.md` §9, `docs/business-process-flows.md` F-07 |
| DEC-58 | 2026-11-05 | `docs/success-metrics.md` v0.1 มีสถานะ metrics framework draft — **ไม่ใช่ spec contract** (BAC-010): KPI ที่ mark `DRAFT` ทุกตัว (รวม draft North Star = Weekly Successful Listings §1 + rejected alternates) เป็น proposal รอ PO sign-off (§9) ไม่ก่อข้อผูกพันกับ spec/prototype/QA; metric ที่ `SPEC` ยึด spec/PRD เดิมต่อไป | active (DRAFT items รอ PO sign-off) | `docs/success-metrics.md` §0/§9 |
| DEC-59 | 2026-11-05 | Watch Alert match pool = **feed-visible priced posts ทุก kind** (`sale` + `post`) — ไม่จำกัดเฉพาะ `pfkind==="sale"` เพราะผู้ขายอาจลงขายของที่ไม่ได้ผูก asset ตัวเอง (ruling พี่มาเต็มจาก FSP-036 C1): prototype `salePosts()`/`discoverablePosts()` ตรง ruling อยู่แล้ว — ฝั่งที่ stale คือ spec text `00_GLOBAL` §10 matrix row `post` ("WA ไม่ match") + `04_ASSET_MANAGEMENT` lifecycle claim "หลุด WA match" — implement ใน doc re-sync task ตาม ruling นี้ | active | `FrontOffice/00_GLOBAL_RULES_MODULE.md` §10, `FrontOffice/10_WATCH_ALERT_MODULE.md`, `Prototypes/fo-flow/index.html` |
| DEC-60 | 2026-11-05 | Follower/following lists = **guest-viewable surface** (ruling พี่มาเต็มจาก FSP-036 C2 — IG parity): สิ่งที่ member-only คือ row actions ภายใน list เท่านั้น ตาม literal reading ของ `00_GLOBAL` §11 "follower/following row actions" — `.pf-stat`/`data-pfgo` ไม่อยู่ใน `GUEST_GATE_SEL` ถือว่าถูกต้อง ไม่ใช่ gate hole; ต้อง tighten wording `00_NAV` §9 (เดิมเขียนกว้าง "follower/following rows" อ่านได้ว่าตัว list ก็ member-only) ใน doc re-sync task | active | `FrontOffice/00_GLOBAL_RULES_MODULE.md` §11, `FrontOffice/00_NAVIGATION_AND_CROSS_MODULE_FLOW.md` §9 |
| DEC-61 | 2026-11-06 | Auth/session verb = **`Sign` pair ชุดเดียว** (ruling พี่มาเต็มจาก FSP-037 QA): unify เป็น `Sign in`/`Sign out` — Settings logout row + confirmation dialog เปลี่ยน EN copy `Log out`/`Log out of @{user}?` → `Sign out`/`Sign out of @{user}?`; TH `ออกจากระบบ` คงเดิม (ครอบทั้งสอง verb) · social rows `Sign in with Apple/Google` อยู่แล้วตรง · implement ใน FSP-038 (auth copy batch) + spec re-sync 13_SETTINGS Log Out Rule ใน FSP-040 | active | `FrontOffice/13_SETTINGS_MODULE.md` Log Out Rule, `FrontOffice/01_AUTHENTICATION_MODULE.md`, `Prototypes/fo-flow/index.html` |

## 9. Deviation registries (ไม่ใช่ product decision — documented prototype deviations)

Per-spec `D` tables (namespace แยกตามเล่ม — D1 ของเล่ม 11 ≠ D1 ของเล่ม 14):

| Spec | Table | Rows |
|---|---|---|
| `FrontOffice/11_SOCIAL_MODULE.md` | deviations | D1–D13 (+D7b) |
| `FrontOffice/12_BOARD_MODULE.md` | deviations | D1–D16 |
| `FrontOffice/14_PORTFOLIO_MODULE.md` | deviations | D1–D21 (= portfolio sign-off D-ids ของ master §16) |
| `FrontOffice/15_TRUST_SAFETY_MODULE.md` | deviations | D1–D10 |

## 10. Open/pending decisions — consolidated view

ที่ยังต้องตัดสิน (ไม่รวม draft O-xx ใน §7.1) — อัปเดตหลัง DOC-035 (2026-11-04): กลุ่ม A ของ DOC-032 resolved/deferred ครบแล้ว เหลือเฉพาะกลุ่ม B ที่รอ input ภายนอก

- **P0 (BO_FINAL_REVIEW §6):** ~~`DEL-DEC-002`/`BO-DEC-002`/`SET-DEC-003`/`NOTI-DEC-003`~~ ✅ **resolved 2026-11-05 ตาม DEC-53** (retention schedule เต็มใน `docs/pdpa-data-processing-register.md` §3; `REP-DEC-001` defer Phase 2 อยู่แล้ว) · `BO-MARKET-DEC-002`/`004` (FX + Watch API plan — รอข้อมูล external team)
- **P1:** — (กลุ่ม P1 เดิม resolved ครบใน DOC-033: `BO-DIR-DEC-001`, `SUP-DEC-001`, `NOTI-DEC-001`, `REP-DEC-004`/`SET-DEC-004`)
- **P2/other open:** `BO-DIR-DEC-002` (Community taxonomy — รอ Product, จอดจนกว่า Directory activation) · `BO-DIR-DEC-004` (map provider — ตอบเมื่อ Directory เปิด) · ~~`DEL-DEC-005`~~ ✅ resolved 2026-11-05
- **Deferred (formal — ตัดสินแล้วให้เลื่อน Phase 2):** `NOTI-DEC-001/002/004/005` · `REP-DEC-001/002/003` · `BO-AUDIT-DEC-004` (future phase)
- **Conditional/pending content:** `DEC-29` (legal TH ฉบับจริงรอเจ้าของ) · `DEC-19` follow-up (`LANG-045` รอ build แปลครบ) · `O-01`–`O-09` (money display draft — รอพี่คิง) · `DEC-58` (success-metrics DRAFT KPIs รอ PO sign-off)

## 11. Integration Reference Index (lightweight — resolution ของ `BO-DEC-006`)

ตัดสินใจ 2026-11-04 (DOC-033, owner sign-off DOC-032/A5): คง **distributed model** — fact integration FO↔BO อยู่ในเอกสารเจ้าของแต่ละตัว ไม่สร้าง integration map กลางใหม่และไม่ duplicate fact; section นี้เป็น index เบา ๆ ที่ชี้ไปจุดที่ fact อยู่จริงเท่านั้น

| Integration area | Register of record (fact อยู่ที่นี่) |
|---|---|
| BO→FO sync rules + sync timing contract | `BackOffice/00_GLOBAL_RULES_MODULE.md` §12 BO-to-FO Sync Rules (timing 3 ชั้นตาม `DEC-49`) |
| Cross-module integration ต่อ module | section `Integration With Other Modules` / `FO Integration Guidelines` / `Cross-Module Integration` ใน spec แต่ละเล่ม (เช่น `BackOffice/17_OPTION_MASTER_MODULE.md` §22) |
| FO↔BO coverage map เชิง decision | `deliverables/FO-BO-001-coverage-audit.md` §6 (decisions `e1`–`e4`, `OPEN-1`–`OPEN-5`) |
| FO continuity baseline | `BackOffice/BO_MASTER_BASELINE.md` §1–§2 (FO continuity goal) |
| FO navigation/route contract | `FrontOffice/00_NAVIGATION_AND_CROSS_MODULE_FLOW.md` §6–§10 |
