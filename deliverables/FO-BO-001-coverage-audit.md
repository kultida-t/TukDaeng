# FO-BO-001 — FO↔BO Cross-System Coverage Audit

> **Task**: ad22178a (FO-BO-AUDIT) · **Date**: 2026-11-02 · **Type**: Audit-only (no files modified)
> **Baselines**: FO-PRD-v1.10 (locked — demand side) vs BO-PRD-v0.1 (finalizing — supply side)
> **Sources**: `Prototypes/fo-flow/index.html` (24,494 lines) · `Prototypes/bo-prototype.html` (50,330 lines) · `FrontOffice/*.md` (00–18) · `BackOffice/*.md` (00–17 + PRD/Spec/Addendum/Handoff) · `AGENTS.md` (protected screens) · `deliverables/FO-TEST-001-00-inventory.md`, `FO-TEST-001-22-decision-register.md`
> **Verdict format**: Covered / Partial / Gap / Contract-only / N-A — ต้องผ่าน 3 แกน (A: FO→BO upstream, B: BO→FO downstream, C: contract & data alignment) ถึงจะ Covered

---

## ส่วนที่ 1 — Touchpoint Inventory

### ตาราง A: FO→BO handoffs (signals/actions ที่ FO ส่งให้ admin)

| # | FO signal | FO source (spec § / route / prototype) | หมายเหตุ |
|---|---|---|---|
| A1 | Report post (direct) | 15 §6 `report` page; entry `pm-go-report` ~L20813; `uc-report` ~L20863 | reason-only submit (ไม่มี details field — D3) |
| A2 | Report post via user pick | 15 §6 `report:pick:{u}` → `report:posts:{u}` → `report:post` | same reason set |
| A3 | Report user (profile `...`) | 15 §6 `report:pick` → `report:user`; entry `pf-sh-report` ~L21746 | — |
| A4 | Report user via `Block and report` | 15 §9 `blk-rep` ~L21827 | block first → `report:pick` |
| A5 | Report comment | 15 §6 `report:comment` (X-only); entry long-press popover ~L13746–13772 | `rpTargetType="comment"` + `rpPid`/`rpCid` |
| A6 | Report Board Content (article) | ตัดออกจาก V1 ทั้งระบบ (e4 — FO contract ลบแล้ว 2026-11-03) | contract deleted; BO queue pending removal |
| A7 | Report user from chat | 07 `chatReportSheet` → `report:user` (ข้าม `report:pick`); `Report and delete` ~L21796–21810 | `rpDelChat` = remove-from-actor-list เท่านั้น ไม่ใช่ server delete |
| A8 | Account deletion request | 13 §9 `del_account` 2-page flow + password confirm + scheduled dialog | soft delete → deactivate + hide public + grace 30 วัน login-to-restore (S-02, 00_GLOBAL §12) |
| A9 | Sign-in during grace (login-to-restore) | 13 §9 L472–477 + 00_GLOBAL §12 L292 + DEC-10 | cancel deletion + restore; Watch Alerts ไม่กลับ |
| A10 | Watch Alert CRUD (create/edit/pause/delete) | 10 §8–9; `WATCH_ALERTS`; entries `sr-wa`/`mf-btn`/list edit | per-account server-backed (lock 2026-10-29) |
| A11 | Watch Alert match → `watch` alert row | 10 §14 + 09 §9/§14; `_waHits` simulation | production: server match → row → Post Viewer |
| A12 | Search/filter events (keyword, filter select/combo, no-result, funnel) | 03 §15 analytics contract (events `search_query_submitted` ฯลฯ) | aggregate only — prototype ไม่มี tracking layer |
| A13 | User registration + auth method (Email/Apple/Google) | 01 §7–8; Apple private relay email (16 §7 L83) | BO User List record + auth method + relay-aware email |
| A14 | Asset lifecycle owner actions (Sale/Show/Hide/Sold, mark-as-sold) | 00_GLOBAL §9–§12; 04 `markAssetSold`; 14 `sell:{id}` | BO sees status + sale record (AC-ADMIN-008) |
| A15 | `ระบุเอง` free-text option values | 03 §9 filter contract L333–335 + 10 §9 Production Contract L275–279 | → option suggestion pool/alias (BO §23.5) |
| A16 | Legal consent records (required + optional) | 00_GLOBAL §8 L143–151; `fo_consent`/`fo_consent_log` | consent record stores policy version → re-consent on bump |
| A17 | Report fail/exception contract | 15 §16 exception copies L450–468 | BO ไม่เกี่ยวกับ transport fail — contract note |

### ตาราง B: BO→FO contracts/results (admin action/config → FO effect)

| # | BO action/config | BO source (spec § / prototype) | FO surface รับผล |
|---|---|---|---|
| B1 | Suspend user (reason + duration, default 7 วัน) | 03 §10 L330–352; modal ~L30108/L30281 | revoke session + login block + account status state (01 §Suspended L168–177, L387–404); **email primary channel** (00 §12 L353 + 01 L394 + 16 L83/L90) |
| B2 | Ban user | 03 §10 L353–365 | same contract, permanent; email primary |
| B3 | Unsuspend / Unban | 03 §10 L367–393 | login กลับมาใช้ได้; account status cleared |
| B4 | Send Password Reset (email acct only) | 03 §10 L304–328 | FO reset-link email → `forgot`/`change_pwd` path (01 L250–253) |
| B5 | Asset moderation: Force Hide / Restore / Remove | 04 (BO_Spec §3.3 L138–141); 00 §10.2 L289 | FO visibility matrix 00_GLOBAL §10; direct link → `รายการนี้ไม่พร้อมใช้งานแล้ว` (00_NAV §10; DEC-07) |
| B6 | Comment moderation: Hide/Restore/Remove/Close no violation | Reported Comments module (locked 2026-08-19); 00 §12 L346 | comment sheet hidden/removed state (15 §Removed Content Rule L375–378) |
| B7 | Article publish/schedule/archive/unpublish | BO_Spec §3.4 + §7 L558–561; Content Management (locked) | FO Board hero/latest/category/detail ตาม eligibility (BO_Spec L173–183); invalid/removed → `Article not found` fallback (12 §13 L275–286) |
| B8 | Board report actions (close/archive article) | prototype `boardReport*` L44785–45318 | article removed → FO unavailable copy |
| B9 | Report queue close (user/asset/comment/board) | 03 §12 L507–513; queue specs | report status → Closed; reporter ไม่ถูกแจ้ง (FO anonymous contract 15 §7 L149–150) |
| B10 | Deletion lifecycle: auto-close on FO confirm, grace countdown, restore/reject, auto delete (archive+anonymize) | 13 + BO_Spec §3.14 L475–492 | FO: deactivated + hidden (DEC-08), chat disabled + `ผู้ใช้งานที่ปิดบัญชี` (DEC-09), login-to-restore (S-02/DEC-10), post-delete no restore |
| B11 | Lifecycle email 5 จุด (confirm/warn/restore/reject/anonymized) | 13 + 14 §9.3; restore/reject modals email preview (AGENTS.md) | FO user รับ email ตาม lifecycle |
| B12 | Policy publish (Terms/Privacy TH/EN, version bump, archive old) | 12_HELP + Settings > Policy & Versioning (locked); audit `POLICY_PUBLISH` | FO legal viewer content + **re-consent sheet on version change** (00_GLOBAL §8 L155–159) |
| B13 | Support Center config (channels 5 types, business hours, availability TH/EN) | 12_HELP + Settings > Support Center (locked) | FO Help screen rows + availability (13 §9 L356–364) |
| B14 | Market Data sync (brand/model/ref/price index read-only + sync log) | 06; BO_Spec §3.6–3.8 | FO autocomplete (Add Asset), search filters, WA criteria, portfolio/asset value (16 §Watch Price API L106–111) |
| B15 | Market Data inactive (`is_active=false`) | 00 §12 L343 + 06 | FO exclude จาก autocomplete/filter + WA หยุด trigger + dependency warning (10 §9 L277, 03 §9 L335) |
| B16 | Option Master add/edit/deactivate/reactivate/reorder/delete + group audit | 17 (locked 2026-08-25) | FO Add/Edit Asset fields, search filter options, WA criteria — `is_active=false` ไม่แสดงเป็นตัวเลือกใหม่ (03 L335) |
| B17 | `ระบุเอง` suggestion → promote/map alias/ignore | 17 §23.5 (Suggestion Queue UI; ~195 refs in prototype) | FO contract: backfill re-match + dedup (`alert_id`,`asset_id`) (10 §9 L278); criteria อ้างเฉพาะ `is_active=true` (L279) |
| B18 | Watch Alert read-only monitoring | 11 + Market Demand (locked 2026-09-01) | no FO effect — observability of A10/A11 incl. delivery status badges |
| B19 | Search Insights aggregate read-only | 11 + Market Demand (locked) | no FO effect — observability of A12 |
| B20 | Delivery Logs (DLV-ACCT/DLV-DEL/DLV-WA, Sent/Retry, read-only) | 14 + 16 + Settings > Delivery Logs (locked 2026-09-15) | trace delivery of B4/B11/watch-notif/emails; jump links จาก Deletion/User Mgmt/Dashboard |
| B21 | Audit trail (AUD-xxxxx + refs ADM-/DEL-/AST-/ART-/RCO-/U-) | 08 + Settings > Audit Log (locked 2026-09-16) | FO spec/test อ้าง audit contract (AC-ADMIN-009; 15 §12 L385) |
| B22 | Admin Identity Lifecycle (invite/activate/login/session) | 01/16 (locked; req bf08de1f) | **N/A** — BO-internal, no FO surface |
| B23 | Moderation outcome email/note (comment moderation email preview) | Reported Comments modals (locked — email preview/notes) | FO user รับ email ตาม outcome (contract) |

---

## ส่วนที่ 2 — Coverage Matrix

| # | Touchpoint | FO source | BO surface | BO spec ref | สถานะ | หมายเหตุ |
|---|---|---|---|---|---|---|
| R1 | Report post/asset → Reported Assets queue + detail + moderation | 15 §6/§8 | Asset Mgmt > Reported Assets (locked) | 04 + BO_Spec §3.3 | Covered | reason taxonomy mismatch → GAP-01 |
| R2 | Report user → Reported Users + Report Detail + user actions | 15 §6/§8 | User Mgmt > Reported Users (locked) | 03 §11–12 | Covered | — |
| R3 | Report comment → Reported Comments + Hide/Restore/Remove/Close + View Asset/comments modals | 15 §6/§8; 11 §popover | Asset Mgmt > Reported Comments (locked 2026-08-19) | 04 §comment report (L783 SLA note) | Covered | additionalDetails mismatch → GAP-05 |
| R4 | Report Board Content → Reported Articles + Board Report Detail | ตัดออกจาก V1 (e4 — FO contract deleted) | Content Mgmt > Reported Articles (locked — pending removal) | 05 | Removed (e4) | ตัดทั้งระบบ 2026-11-03; board reason set ไม่ต้องใช้แล้ว |
| R5 | Report from chat → map เข้า queue | 07 `chatReportSheet` → `report:user` | Reported Users (source `Chat`) | 03 §12 L500–505 | Covered | `Report and delete` = FO-local teardown เท่านั้น; chat context review → GAP-06/[OPEN] |
| R6 | PM_REASONS 9 เหตุผล + Board reason set ↔ BO reason taxonomy/labels/filters | 15 §6 L112–129; 12 §13 L267 | `reportReasonThaiLabels` + submission mocks | — | **Gap** | **FOBO-GAP-01** — 3 taxonomy sets ไม่ map กัน |
| R7 | 24h report SLA (AC-ADMIN-006) → SLA/due/aging indicator | 18 §10; 15 §12 L383 | Dashboard card `ใกล้ครบกำหนด` chips + comment tag `SLA 4h` | 02 §L210/L367; BO_PRD L486 | Partial | **FOBO-GAP-03** — queue columns ไม่มี SLA/due field |
| R8 | Moderation result → FO states (asset unavailable/hidden, comment hidden/removed, article removed) | 00_NAV §10; DEC-07; 15 §12 L375–378; 12 §13 matrix | moderation actions ทุก queue | 00 §10.2/§12 L341–346 | Covered | `Removed/Hidden` = admin state แยกจาก owner `Hide` ชัดเจน |
| R9 | Suspend/ban → FO contract 3 ขา | 01 L168–177/L387–404; 16 L117 | suspend/ban modals + email note (~L30184–30196) | 03 §10; 00 §12 L340/L353–354 | Covered | email primary + revoke + status state — ครบทั้ง 3 ขา |
| R10 | Block/mute/not-interested — BO surface | 15 §12 | — | — | N-A | FO-internal; BO spec ไม่อ้าง block state — ตรง spec ทั้งคู่ |
| R11 | Account deletion → queue/detail/restore/reject/countdown/5 lifecycle emails/dependency tiles | 13 §9; 00_GLOBAL §12 | Account Deletion (locked 2026-09-09) + DLV-DEL refs | 13; 14 §9.3; BO_Spec §3.14 | Covered | login-to-restore = FO contract ↔ BO restore flow ตรงกัน |
| R12 | Board authoring → FO Board surfaces + removed-article fallback | 12 §2/§6/§13 | Content Mgmt Articles/Categories (locked) | 05; BO_Spec §3.4/§7 | Partial | **FOBO-GAP-02** — category taxonomy ไม่ตรง |
| R13 | Policy & Versioning → FO legal surfaces + re-consent | 13 §9 L388–397; 00_GLOBAL §8 | Settings > Policy & Versioning (locked) | 12_HELP | Partial | **FOBO-GAP-07** — re-consent trigger ไม่ชัดใน BO spec |
| R14 | Support Center → FO Help screen | 13 §9 L356–364 | Settings > Support Center (locked) | 12_HELP | Covered | ~~FOBO-GAP-04~~ resolved 2026-11-03 — e1 approved dynamic contract; FO spec amended |
| R15 | Option Master + suggestion queue → FO fields/filters/criteria/`ระบุเอง` pool | 03 L333–335; 10 §9 L275–279 | Option Master + Suggestion Queue §23.5 (locked) | 17 | Covered | — |
| R16 | Market Data → FO autocomplete/filters/WA criteria/portfolio + inactive warning | 03 L335; 10 §9 L277; 16 L106–111; 14 §portfolio | Market Data (locked) + inactive warning ใน WA Detail | 06; 00 §12 L343–344 | Covered | — |
| R17 | WA trigger → FO alert row + Post Viewer → BO WA List/Detail + history + delivery badges | 09 §9; 10 §14 | Market Demand > Watch Alert List/Detail (locked) | 11; blueprint | Covered | — |
| R18 | Search Insights (aggregate) → BO widgets | 03 §15 events contract | Market Demand > Search Insights (locked) | 11 | Covered | aggregate only — ตรง constraint |
| R19 | Notification delivery → Delivery Logs + jump links + FO 4 types | 09 (4 types, DEC-41) | Settings > Delivery Logs (locked) | 14; 16 | Covered | `system` type ถูกถอนทั้งคู่ฝั่ง — ไม่ขัด |
| R20 | Emails: suspend/ban, deletion 5 จุด, restore/reject, moderation outcome | 01 L394; 13; 15 §18 | email note/preview ใน action modals; 14 §templates | 14; 03 §10; 13 | Covered | moderation outcome email = contract เดียวกัน |
| R21 | Audit trail AUD-xxxxx + ref pattern + jump links | 18 §9; 15 §12 L385 | Settings > Audit Log (locked) | 08 | Covered | refs ADM-/DEL-/AST-/ART-/RCO-/U- ตรง spec |
| R22 | Sold asset retained for Admin Review (AC-ADMIN-008) | 14 §soldhist; 00_GLOBAL §9–10 | Asset List `Sold` status + `Sale History` modal (L21802/L22510/L23127) | 04; BO_Spec §3.3 L144 | Covered | — |
| R23 | Admin Identity Lifecycle | — | Settings > Admin Accounts + auth (locked) | 01/16 | N-A | BO-internal — requirement bf08de1f finalized แยก scope |
| R24 | Chat moderation/monitoring + real-time admin-user chat | — | — | README L107 Phase 1 exclusion | N-A | spec ยืนยัน exclusion — ดู [OPEN-2] เรื่อง chat context |
| R25 | Guest gate/Member Sheet, i18n/theme, onboarding, portfolio owner-view | FO-internal | — | — | N-A | ไม่ใช่ cross-system touchpoint |
| R26 *(inventory เพิ่ม)* | Report reason-only (ไม่มี additional details บน live stack) vs BO reporter submissions | 15 §12 D3 L514/L126 | `additionalDetails` populated ใน mocks (L18735–37, L20077+) | — | Partial | **FOBO-GAP-05** — mock แสดง field ที่ FO ไม่ส่ง |
| R27 *(inventory เพิ่ม)* | Post-only report (feed post ไม่ผูก asset, kind `post`) → queue | 15 §6 (`report` = Asset (post) type); 00_GLOBAL §9 L177 | Reported Assets (AST- refs) | 04 | Partial | **FOBO-GAP-08** — contract ambiguity post vs asset entity |
| R28 *(inventory เพิ่ม)* | FO Help channels จาก BO config (active/inactive per channel) | 13 §9 L360–364 (3 rows fixed) | Support Center 5 channel types | 12_HELP | Covered | ซ้ำ GAP-04 — resolved 2026-11-03 ตาม e1 |
| R29 *(inventory เพิ่ม)* | BO publish policy → FO re-consent sheet | 00_GLOBAL §8 L155–159 | `POLICY_PUBLISH` | 12_HELP | Partial | ซ้ำ GAP-07 |
| R30 *(inventory เพิ่ม)* | FO comment removed → viewer state (restore contract) | 15 §Removed Content Rule | Restore comment action | 04 | Covered | contract ครอบ hide/restore/remove |
| R31 *(inventory เพิ่ม)* | FO `Report and delete` flag → BO distinguish | 07/15 §9 | — | 03 | N-A | spec ไม่ต้องการ flag แยก — report เหมือนกัน |
| R32 *(inventory เพิ่ม)* | FO analytics events (15 §19, 09 §15, 12 §20, 10 §15) → BO analytics | ทุกเล่ม analytics contract | Reports & Analytics Phase 2 | 15_REPORTS | Contract-only | Phase 2/future — ไม่นับ gap ตามข้อห้าม |
| R33 *(inventory เพิ่ม)* | FO deep link → BO-moderated entity → unavailable | 00_NAV §10/§12; DEC-07 | moderation status sync | 00 §12 L358–359 | Covered | public share links ห้าม bypass status |
| R34 *(inventory เพิ่ม)* | BO suspend duration (default 7 วัน, editable) → FO status state `ระยะเวลาถ้ามี` | 01 L172; modal L30281 | suspend modal end-date | 03 §10 | Covered | — |
| R35 *(inventory เพิ่ม)* | Deletion-requested user ยังถูก report → queue rules | — | 03 §12 L515–522 (Reports Of Deletion Requested Users) | 03 | Covered | explicit rule มีอยู่ |

**สรุปสถานะ**: Covered 24 · Partial 5 (R7, R12, R13, R26, R27) · Gap 1 (R6) · Contract-only 1 (R32) · Removed 1 (R4 — e4) · N-A 4 (R10, R23, R24, R25, R31) — R14/R28 resolved 2026-11-03 ตาม e1 (R28/R29 ซ้ำกับ touchpoint หลักตามเดิม)

---

## ส่วนที่ 3 — Gap Register

| ID | Severity | สิ่งที่ขาด/ขัดกัน | ไฟล์/จอที่กระทบ | Protected impact |
|---|---|---|---|---|
| FOBO-GAP-01 | **Major** | **Report reason taxonomy ไม่ตรง 3 ชุด**: FO live `PM_REASONS` 9 เหตุผล (`15_TRUST_SAFETY_MODULE.md` L112–129) vs FO Board contract 6 เหตุผล (`12_BOARD_MODULE.md` L267) vs BO labels `reportReasonThaiLabels` 9+1 ค่า (`bo-prototype.html` L20063–20073 + `"Spam or scam"` L18729–18737) — BO queue/detail/filter จะไม่เข้ากับเหตุผลที่ FO ส่งจริง; ไม่มี canonical mapping ใน spec ฝั่งไหน | BO report queues (Assets/Users/Comments/Articles) + spec 03/04/05; mock submissions | **Y** — Reported Users, Reported Assets, Reported Comments, Reported Articles (locked) |
| FOBO-GAP-02 | **Major** | **Article category taxonomy**: FO magazine model ใช้ freeform `cat` + `BD_CATEGORIES` = `All/Market Watch/Rolex/Technical/Collector/Guides/Industry` (`12_BOARD_MODULE.md` L166–169, deviation D1 — 7-section master model ถูก supersede, mapping = FSP-025 pending) vs BO fixed category dropdown `Watch Brands/Watch 101/Watch Apparel/Watch Events/Watch Market/Journal Board` (`BO_Spec.md` L212, L236–247) — article ที่ publish ด้วย BO category จะ map เข้า FO pill/filter ไม่ได้ตาม contract ใด ๆ | BO_Spec §3.4.2/3.4.4; Content Management > Categories (locked); FO `boardall` pills | **Y** — Content Management (locked) |
| FOBO-GAP-03 | **Major** | **Per-queue SLA/due/aging indicator**: contract 24h (AC-ADMIN-006, `18_ADMIN_SCOPE_NOTE.md` L141; `BO_PRD.md` L486) — signal มีแค่ระดับ Dashboard (`ใกล้ครบกำหนด` chips `bo-prototype.html` L17906/L19421/L19431–32) และ tag `SLA 4h` ใน comment mock (L18729); Reported Users columns (`03_USER_MANAGEMENT_MODULE.md` L441–454) และ queue specs ฝั่ง asset/comment/article ไม่มี due/aging field → admin เข้า queue แล้วบอกไม่ได้ว่ารายการไหนเกิน/ใกล้ 24h | Dashboard (ok); Reported Users/Assets/Comments/Articles queues | **Y** — Reported Users, Reported Assets, Reported Comments, Reported Articles + Dashboard (ทั้งหมด locked) |
| FOBO-GAP-04 | **Major** | **Support channel taxonomy**: FO Help = 3 rows ตายตัว `LINE Official @mrfoxthailand` / `Call (+66) 80-008-8088` / `Email service@mrfox.com` (`13_SETTINGS_MODULE.md` L360–364) vs BO Support Center 5 channel types `LINE, Phone, Email, Facebook, Website` (`BO_Spec.md` L463) — ถ้า admin เปิด Facebook/Website channel FO ไม่มี surface แสดง → admin config ไม่มีผลฝั่ง FO | BO Support Center (locked) + FO Help (locked) | **Y** — Support Center (locked) + FO-side decision required |
| FOBO-GAP-05 | Minor | **Reporter `additionalDetails` ใน BO mock ที่ FO ไม่ส่ง**: FO live stack = เหตุผลอย่างเดียว ไม่มี details field (`15` L126, deviation D3 L514) แต่ BO mock ทุก queue มี `additionalDetails` populated (`bo-prototype.html` L18735–18737, L20077–20097) — เฉพาะ Board contract เท่านั้นที่มี `Additional details (optional)` (12 §13) | mock data + report detail specs ทุก queue | **Y** — report detail screens (locked) ถ้าแก้ field |
| FOBO-GAP-06 | Minor | **Chat report context ไม่ครบ**: BO coverage rule ระบุ `Chat review สำหรับ reported content` (`00_GLOBAL_RULES_MODULE.md` L321) แต่ Reported Users Detail sections ไม่มี chat transcript/context (`03` L491–498); FO `chatReportSheet` ส่งแค่ user report + reason (15 §9 L204–208) — ยังไม่ชัดว่า BO ต้องเห็น message context หรือไม่ → [OPEN-2] | 03 spec; 00 spec §11 | N — spec decision ก่อน |
| FOBO-GAP-07 | Minor | **Policy publish → FO re-consent trigger contract หลุด**: FO บังคับ re-consent ทุก session เมื่อ policy version เปลี่ยน (`00_GLOBAL_RULES_MODULE.md` §8 L155–159) แต่ BO spec 12_HELP/`POLICY_PUBLISH` ไม่ระบุว่า publish ต้อง trigger version bump → FO re-consent | `12_HELP_SUPPORT_MODULE.md`; `08` audit `POLICY_PUBLISH` | N — spec-only |
| FOBO-GAP-08 | Minor | **Post-only entity vs Asset entity ใน report queue**: FO `report`/`report:post` = type `Asset (post)` ครอบ feed post ที่ไม่ผูก asset (kind `post`, `00_GLOBAL` §9 L177) แต่ BO queue = `Reported Assets` + `AST-` refs — post-only report จะเข้า queue ไหน/ใช้ ref อะไร ไม่ชัด | 04 spec + queue mocks | N — spec-only |
| FOBO-GAP-09 | Minor | **Naming drift `Reported Articles` vs `Reported Board`**: nav label = `Reported Articles` (L17837) แต่ code/back-button/spec เรียก `Reported Board` (L45121, `boardReport*`, `24918/24951`) — ไม่กระทบ flow แต่ spec/label ควร unify | nav + Content Management spec | **Y** — Content Management (locked) — label เท่านั้น |
| FOBO-GAP-10 | Minor | **Unavailable copy drift (article)**: prototype `บทความนี้ไม่มีให้บริการแล้ว` vs contract `บทความนี้ไม่พร้อมใช้งานแล้ว` (`12` D11 L286/L397) — FO deviation ที่บันทึกแล้ว ไม่ใช่ BO gap แต่ BO spec ควรอ้าง canonical copy เดียวกันเมื่อเขียน removed-article contract | 12 spec D11; BO 05 spec | N — FO documented deviation |

**เพดาน severity**: Blocker 0 · Major 4 · Minor 6 · [OPEN] 2 (ด้านล่าง) · [CONFLICT] 0 — spec ทั้งสองฝั่งไม่พบข้อความขัดกันตรง ๆ ที่ต้องเลือกข้าง (GAP-02/GAP-04 เป็น taxonomy mismatch ไม่ใช่ statement ขัดกันโดยตรง — จัดเป็น Gap ตามนิยาม)

**[OPEN-1]** Board report → ผลลัพธ์ FO: archive บทความแล้ว user ที่กด shared link เจอ unavailable — FO contract matrix ครอบ (`12` L275–286) แต่ reporter ไม่ได้รับ feedback ใด ๆ (FO V1 ไม่มี report-tracking — ตาม 15 §5 out-of-scope) — ไม่ใช่ gap ยืนยันแล้ว
**[OPEN-2]** จาก GAP-06: ต้องให้ product ตัดสินว่า chat-report ต้องแนบ message context ไป BO หรือไม่ (FO ตอนนี้ไม่แนบ; spec BO แค่เขียน "chat review" คลุม ๆ)
**[OPEN-3]** Watch Alert `source:"detail"` (mf-btn model-follow) — BO WA List มี filter/source column แยก alert origin หรือไม่ ไม่ได้ยืนยันใน spec (read-only list criteria chips มีครบ — ปริมาณงานตกค้างต่ำมาก)

---

## ส่วนที่ 4 — Remediation Proposal (แยกกลุ่ม)

### (a) แก้ BO spec/doc อย่างเดียว — ไม่แตะ prototype

| # | ไฟล์ § | เนื้อหาที่ต้องเพิ่ม |
|---|---|---|
| a1 | `03/04/05_*_MODULE.md` (report sections) + เอกสารใหม่หรือ `00_GLOBAL` §11 | **Canonical report reason taxonomy** — table map `PM_REASONS` 9 ค่า (FO canonical) ↔ BO queue reason enum/label (TH+EN) รวม Board reason set 6 ค่า และเก็บ alias เดิม (`Fraud or scam`, `Spam or scam` ฯลฯ) ให้ชัดว่า display-only หรือ canonical — ครอบ GAP-01 |
| a2 | `BO_Spec.md` §3.4.2/3.4.4 + `05_CONTENT_BOARD_MODULE.md` | **Article category contract** — แทน fixed 7-category dropdown ด้วย contract ใหม่: category = freeform/curated tag ตาม FO magazine model (`BD_CATEGORIES` + extended `cat` list); ระบุ mapping `Category` field → FO `cat` ตรง ๆ — ครอบ GAP-02 (taxonomy เดิม master 7-section ถูก FO D1 supersede แล้ว) |
| a3 | `02_DASHBOARD_MODULE.md` + queue specs 03/04/05 | **24h SLA contract** — นิยาม due = `reportedAt + 24h`, state `on-track / near-due / breached`, threshold near-due (เช่น >18h) และ required surface: aging/due badge ต่อ row หรือ SLA column ใน report queues — ครอบ GAP-03 |
| a4 | `12_HELP_SUPPORT_MODULE.md` | **Support channel taxonomy ↔ FO Help contract** — ระบุชุด channel ที่ FO render ได้ (LINE/Phone/Email 3 rows ตาม 13 §9) + decision: channel types อื่น (Facebook/Website) = config-only หรือต้องเพิ่ม FO row; ระบุ availability/business-hours contract format — ครอบ GAP-04 (spec ฝั่ง BO) |
| a5 | `12_HELP_SUPPORT_MODULE.md` + `13_SETTINGS` cross-ref note | **Policy publish → FO re-consent**: publish ต้อง bump version → FO consent record mismatch → re-consent sheet (00_GLOBAL §8) — ครอบ GAP-07 |
| a6 | `04_ASSET_MANAGEMENT_MODULE.md` + `00_GLOBAL` §10.2 | **Report entity model** — report target = `post` (feed entity) หรือ `asset`; post-only report (kind `post`) เข้า queue เดียวกันโดย ref `POST-`/`AST-` mapping — ครอบ GAP-08 |
| a7 | `03_USER_MANAGEMENT_MODULE.md` §12 | **Reporter submission schema** — ระบุ `additionalDetails` เป็น optional field ที่ FO live stack ไม่ส่ง (มีเฉพาะ Board contract) — ครอบ GAP-05 spec ฝั่ง |
| a8 | `03` §12 + `00_GLOBAL` §11 | **Chat report context decision** — ระบุว่ารายงาน source `Chat` ต้องแนบ thread/message excerpt หรือไม่ — ครอบ GAP-06 + [OPEN-2] |
| a9 | `05_CONTENT_BOARD_MODULE.md` | label unify `Reported Articles` (canonical nav) vs `Reported Board` — ครอบ GAP-09 |

### (b) เพิ่มจอ/modal/panel ใหม่ใน bo-prototype — (จุดเมนู/route + content)

| # | จุด | content ที่ต้องมี |
|---|---|---|
| b1 | — | ไม่มีจอใหม่ที่จำเป็น — ทุก gap อยู่ระดับ field/column/taxonomy บนจอที่มีอยู่ ไม่ใช่จอที่ขาดทั้งจอ |

### (c) ต้องแตะ protected screen — **list แยก รอ user approve ก่อนเสมอ** (อ้าง `AGENTS.md`)

| # | Protected screen | การเปลี่ยนที่เสนอ | เหตุผล | Gap |
|---|---|---|---|---|
| c1 | User Management > Reported Users + Report Detail | reason labels ตาม canonical taxonomy + (optional) SLA/due badge ต่อ row | รับ FO reason จริง + enforce 24h | GAP-01, GAP-03 |
| c2 | Asset Management > Reported Assets + Asset Report Detail | เหมือน c1 + reporter `additionalDetails` field ตัด/ทำ optional | เหมือนกัน + mock ตรง schema | GAP-01, GAP-03, GAP-05 |
| c3 | Asset Management > Reported Comments + Comment Report Detail | reason labels + SLA badge + details field optional | เหมือนกัน | GAP-01, GAP-03, GAP-05 |
| c4 | Content Management > Reported Articles (Board Report Detail) | reason labels ตาม board reason set 6 ค่า + SLA badge + label unify | เหมือนกัน | GAP-01, GAP-03, GAP-09 |
| c5 | Content Management > Categories + Article editor | category model ใหม่ตาม a2 (FO magazine tags) | publish → FO `cat` ตรงกัน | GAP-02 |
| c6 | Settings > Support Center | channel list จำกัด/ขยายตาม a4 decision + preview sync | channel taxonomy | GAP-04 |
| c7 | Dashboard | (optional) เพิ่ม link/แยก chip ใกล้ครบกำหนดต่อ queue — มีอยู่แล้วบางส่วน | SLA visibility | GAP-03 (minor enhancement) |

### (d) mock data/seed alignment

| # | สิ่งที่ต้อง sync |
|---|---|
| d1 | `reportReasonThaiLabels` + ทุก `*ReportSubmissions` mocks → reason strings ตาม canonical taxonomy (a1) — ปัจจุบันใช้ `Fraud or scam`, `Impersonation`, `Suspected fake or scam`, `Spam or scam` ฯลฯ ที่ไม่อยู่ใน `PM_REASONS` |
| d2 | `additionalDetails` ใน user/asset/comment report submissions — ตัดหรือ mark optional/absent ตาม a7 (Board contract เท่านั้นที่มี field นี้) |
| d3 | Report entity refs: เพิ่ม post-only sample (kind `post`, ไม่ผูก `AST-`) หลังตัดสิน a6 |
| d4 | Article `Category` values → FO `cat` values (`Rolex`, `Market Watch`, `Technical`, `Collector`, `Guides`, `Industry`, `Featured`, `Watch Trends` ฯลฯ ตาม `12` L168) หลังตัดสิน a2 |
| d5 | Support Center seed channels → ให้สอดคล้อง FO Help rows (LINE @mrfoxthailand / phone / email) จนกว่า a4 ตัดสิน |
| d6 | Report queue seed `Reported At` spread — ให้มีตัวอย่าง near-due/breached เพื่อ demo SLA badge หลังเพิ่ม (c1–c4) |

### (e) FO side gap — **FO lock แล้ว เสนอเป็น decision item ให้ product เท่านั้น ห้ามเสนอแก้ prototype FO**

| # | Decision item |
|---|---|
| e1 | FO Help รองรับ channel เพิ่มเติม (Facebook/Website) หรือจำกัด BO config เหลือ 3 ช่องทาง — จาก GAP-04 · **resolved 2026-11-03 — dynamic ตาม BO config (approved)** |
| e2 | FO `report` stack ไม่มี `Additional details` — ต้องการให้มี (ตาม Board contract) หรือคง reason-only แล้ว BO ตัด field — จาก GAP-05 |
| e3 | FO chat report แนบ message/thread context ไป BO หรือไม่ (anonymous + retention concern) — จาก GAP-06/[OPEN-2] |
| e4 | Report Article entry (`data-bdmore`) ยัง dead — confirm ว่า Board report อยู่ contract-only ต่อใน V1 — **resolved 2026-11-03 — ตัดออกจาก V1 ทั้งระบบ (FO contract ลบ; BO queue pending removal — task แยก)** |

---

## ส่วนที่ 5 — Evidence & Open Items

### Citations (file:line)

**FO**:
- `FrontOffice/15_TRUST_SAFETY_MODULE.md` L112–129 (PM_REASONS 9 เหตุผล) · L126 (reason row = submit ไม่มี details) · L204–208 (`chatReportSheet`) · L333–340 (report types + Board contract-only) · L375–378 (Removed Content Rule) · L383 (24h contract) · L514 (D3)
- `FrontOffice/12_BOARD_MODULE.md` L267–271 (board report contract 6 reasons + details field) · L275–286 (availability matrix) · L166–169 (BD_CATEGORIES/cat freeform) · L387 (D1 magazine vs 7-section)
- `FrontOffice/13_SETTINGS_MODULE.md` L360–364 (Help 3 channels) · L419–477 (delete 2-page + grace + login-to-restore) · L388–397 (legal pages + re-consent rule)
- `FrontOffice/00_GLOBAL_RULES_MODULE.md` L143–159 (consent record + re-consent trigger) · L170–193 (statuses + visibility matrix) · L276–282 (transition impact) · L292 (deletion lifecycle)
- `FrontOffice/01_AUTHENTICATION_MODULE.md` L168–177 (suspended/banned state) · L387–404 (session revoke → status state) · L394 (email primary channel)
- `FrontOffice/16_INTEGRATIONS_MODULE.md` L83/L90 (account-status email รวม Apple relay) · L117 (token revoke contract)
- `FrontOffice/09_NOTIFICATION_MODULE.md` L51 (4 types; `system` removed DEC-41) · L345–360 (trigger contract)
- `FrontOffice/10_WATCH_ALERT_MODULE.md` L271–279 (production contract: relation-id/is_active/backfill dedup) · L362–366 (notification rules)
- `FrontOffice/18_ADMIN_SCOPE_NOTE.md` L136–145 (AC-ADMIN-001..010)
- `deliverables/FO-TEST-001-22-decision-register.md` DEC-07/08/09/10 (moderation/deactivation FO effects) · DEC-41 (system type removal)

**BO**:
- `BackOffice/00_GLOBAL_RULES_MODULE.md` L304–333 (FO coverage rules) · L340–360 (sync rules + suspend email + public sync) · L289 (Removed/Hidden status)
- `BackOffice/03_USER_MANAGEMENT_MODULE.md` L441–454 (Reported Users columns — no SLA) · L500–505 (sources = Profile|Chat) · L515–522 (deletion-requested reports)
- `BackOffice/BO_Spec.md` L212 (category dropdown) · L236–247 (category mgmt) · L463 (5 channel types) · L475–492 (deletion features) · L556–568 (BO→FO sync table)
- `BackOffice/BO_PRD.md` L486 (24h response time)
- `BackOffice/README_MODULE_INDEX.md` L107 (Phase 1 exclusions) · L70–75 (module scope)
- `Prototypes/bo-prototype.html` L17832–17848 (navGroups — full menu inventory) · L17906/L19421–19434 (dashboard SLA chips) · L18729–18737 (comment SLA tag + `Spam or scam` + additionalDetails) · L20063–20073 (`reportReasonThaiLabels`) · L20075+ (`userReportSubmissions` source `Chat`) · L21802/L22510/L23127 (Sold + Sale History) · L30184–30281 (suspend modal email note + duration) · L44785–45318 (`boardReport*` queue/detail/actions)
- `AGENTS.md` protected screens list (locks: Reported Users/Assets/Comments/Articles, Content Mgmt, Market Demand, Option Master, Policy & Versioning, Support Center, Account Deletion, Delivery Logs, Audit Log, Admin Accounts, Dashboard)

### Open items

- **[OPEN-1]** Board report reporter feedback — ยืนยันแล้วว่า V1 ไม่มี (15 §5 out-of-scope report tracking) — ไม่ใช่ gap
- **[OPEN-2]** Chat report message context → BO (ดู GAP-06 + e3) — ต้อง product ตัดสิน
- **[OPEN-3 — resolved 2026-11-02]** WA `source` field (search vs detail origin) — implement แล้วใน prototype: `source` field บน `WAL-*` mocks (`search`/`detail` ตาม FO `10` `sr-wa`/`mf-btn`), source tag บน Alert Name + filter `Source` + Source badge/tile ใน Alert Detail + spec `11_WATCH_ALERT_MODULE.md` sync (entry point 2 ทาง, filter, column, mobile card, Detail Head, Section 1)
- **[OPEN-5 — resolved 2026-11-03]** Product decision — คำถามเดิม (รวม `Asset Management` เข้า `Content Management` เป็นโดเมน `Posts/Content`) ถูก reframe โดยผู้ใช้: `Content Management` = Board article domain คนละ entity กับ feed post — ประเด็นจริงคือ post-only (feed post kind `post` ไม่ผูก asset) ต้องมี surface นอกคิว report หรือไม่; **ตัดสิน: คง scope เดิม** — `Asset List` = asset entity เท่านั้น (ไม่ขยายเป็น Post List รวม และไม่เพิ่ม Post List แยกใน V1), post-only เข้า BO เฉพาะผ่านคิว `Reported Assets` ตาม Report Entity Model (GAP-08) โดย moderation action ทำใน Report Detail ได้ครบ; boundary เขียนใน `04` §3 Out Of Scope + §7 Asset List และ `05` §3 Out Of Scope (`BO-04-v1.6`/`BO-05-v1.3`)
- **[e1 — resolved 2026-11-03]** FO decision: FO Help = dynamic rows ตาม BO Support Center config (เฉพาะ channel `Active` + interaction ตาม channel type + empty state เมื่อไม่มี Active channel) — FO spec `13_SETTINGS_MODULE.md` §9 + AC-SETTING-007 + `TukDaeng_Master_Product_Definition.md` + `QA_TEST_SCENARIO_CHECKLIST.md` + `DEV_IMPLEMENTATION_CHECKLIST.md` amended; canonical contract `12_HELP_SUPPORT_MODULE.md` §4 (FO-PRD-v1.12 / BO-12-v0.4) — GAP-04 resolved
- **[e4 — resolved 2026-11-03]** FO decision: **ตัด Report Article/`Board Content` ออกจาก V1 ทั้งระบบ** (ไม่ใช่ contract-only) — ลบ contract จาก FO spec ครบ (`12_BOARD` §13 report section/AC-BOARD-016/D4→REMOVED, `15_TRUST` type + AC-TS-009, `00_GLOBAL` report types, `11_SOCIAL` dead refs, `18_ADMIN_SCOPE`, Master S-04→superseded, `PRD`/`FO_Functional_PRD`/`README_MODULE_INDEX`/`FINAL_HANDOFF_SUMMARY`, `QA-BOARD-008` + `DEV` checklist) — FO baseline `FO-PRD-v1.13`; BO spec cleanup: `00` §11/03/04 reason refs + `05` §14 mark queue **pending removal** (BO-00-v1.3/BO-03-v1.4/BO-04-v1.5/BO-05-v1.2); ถอด `Reported Articles`/`Board Report Detail` จาก BO prototype = task แยก (protected screen — ผู้ใช้อนุมัติแตะแล้ว) — R4 → Removed; remediation items ที่เกี่ยว Board Content (a1 board reason set, c4, a9, d6 ส่วน board) เป็น moot
- **[CONFLICT]** — ไม่พบ statement ขัดกันตรง ๆ ที่ต้องเลือกข้าง (GAP-02/04 = taxonomy contract ขาด ไม่ใช่ conflicting rules)

### ข้อสรุปการ audit

- **ครบแล้ว (Covered)**: report queues ทั้ง 4 type, moderation actions→FO states, suspend/ban 3 ขา, account deletion lifecycle ครบวงจร, board authoring CRUD, policy versioning, option master + suggestion queue, market data, watch alert monitoring, search insights, delivery logs, audit trail, sold retention — โครง BO ครบทุก flow หลักที่ FO lock ไว้
- **ต้องแก้ก่อน dev handoff**: GAP-01 (reason taxonomy — กระทบทุก report queue), GAP-02 (article category — กระทบ publish→FO mapping), GAP-03 (SLA per-row — enforce AC-ADMIN-006 ไม่ได้ใน queue) — ~~GAP-04~~ resolved 2026-11-03 ตาม e1 (FO Help dynamic ตาม BO config)
- **FO contract-only ที่ต้องรับทราบ**: R32 analytics Phase 2 (R4 ตัดออกจาก V1 แล้วตาม e4 — 2026-11-03)

---

## ส่วนที่ 6 — Product Decisions (ผู้ใช้ตัดสิน 2026-11-02)

ตารางนี้แทนสถานะ remediation เดิมในส่วนที่ 4 สำหรับ gap ที่มีการตัดสินแล้ว — ทิศทางทั้งหมดคือ **"ปรับ BO ให้เข้ากับ FO ที่ lock แล้ว"** (FO = SoT)

| Gap | การตัดสิน | Action ที่เกิด |
|---|---|---|
| GAP-01 | **ใช้ taxonomy ของ FO เป็นชุดเดียว** — BO ปรับ reason ให้ตรง `PM_REASONS` 9 เหตุผล (post/user/comment) + Board reason set 6 เหตุผล (article) ตาม `15` L112–129 / `12` L267 | (a1) เขียน canonical reason table ลง spec 03/04/05 — EN/TH label เดียวกับ FO; (c1–c4) อัปเดต labels/filter ใน 4 queues; (d1) แก้ `reportReasonThaiLabels` + mock submissions ให้ใช้เหตุผลชุด FO เท่านั้น |
| GAP-02 | **ใช้หมวดของ FO (magazine model)** — BO ปรับ category เป็น `BD_CATEGORIES` + freeform `cat` values ตาม `12` L166–169 | (a2) เขียน category contract ใหม่ใน BO_Spec §3.4.2/3.4.4 + 05; (c5) Categories + editor; (d4) seed ให้ตรง FO `cat` |
| GAP-03 | **ลบ deadline/time tracking ออกทั้งหมด** — ผู้ใช้ตัดสิน: ไม่มี SLA/due countdown ให้แอดมินติดตามที่ไหนเลยใน BO (ออกทุกจุดที่มีเวลาแสดงอยู่) | **งานเพิ่มเข้า (ไม่ใช่ปิด)** — ต้องลบ: chip `ใกล้ครบกำหนด` บน Dashboard cards/queue summaries (L17906/L19421/L19431–32/L19434), tag `SLA 4h` ใน comment mock (L18729), ข้อความ "รอตรวจ 22 ชม." (L19431), "ใกล้ครบกำหนดลบบัญชี" ที่หมายถึง admin action (เก็บ grace countdown ของ Account Deletion ไว้ — นั่นคือ system lifecycle ไม่ใช่ admin SLA); spec cleanup: `02_DASHBOARD_MODULE.md` SLA signals/`ครบกำหนดตอบ` rules, `BO_PRD.md` L486 `< 24 ชม.`, `04` L783 SLA baseline note · **แตะ protected screens: Dashboard + Reported Comments mock** → กลุ่ม (c) รอ approve · FO AC-ADMIN-006 ยังคงเป็น process contract (24h) แต่ไม่มี UI enforcement — บันทึกเป็น [OPEN-4] ให้ product ยืนยันว่า SLA ยังเป็นข้อผูกพันระดับนโยบายหรือถอนออก |
| GAP-04 | **BO เป็นตัวขับ — FO แสดงตาม config ที่ BO เปิด** — FO Help ไม่ตายตัว 3 rows แต่ render ตาม channel ที่ BO active (dynamic contract) — **approved 2026-11-03 (e1) — อยู่ในแพ็กเกจส่ง dev** | (a4) spec `12_HELP` เขียน contract: FO Help = data-driven rows จาก Support Center config (channel type + value + availability TH/EN); **(e1) FO decision — approved 2026-11-03**: spec 13 §9 amended รองรับ dynamic channels + AC-SETTING-007/Master/QA/DEV checklist sync (FO-PRD-v1.12); c6 Support Center ปรับตาม contract |
| GAP-05 | **ใช้ schema ของ FO — reason-only** — BO ตัด `additionalDetails` ออกจาก user/asset/comment reports (คงเฉพาะ Board contract ที่ FO มี field จริง) | (a7) spec schema note; (d2) ลบ `additionalDetails` จาก mocks ทุก queue ยกเว้น board |
| GAP-06 | **ตาม IG — report ส่ง account context ไม่ส่ง transcript** — IG user-report จาก chat = report ตัว account เหตุผล + context ว่ามาจากแชท (message-level report = feature แยกที่ TukDaeng ตัดแล้วตาม 15 §5) | **ปิด gap เป็น by-design** — (a8) spec note ว่า source `Chat` เก็บ thread reference เฉย ๆ (ไม่มี transcript) เผื่อ support ตามทีหลัง; ไม่ต้องแนบ message |
| GAP-07 | **BO publish ต้อง trigger FO re-consent** — เขียน contract ให้ชัด | (a5) spec `12_HELP`: `POLICY_PUBLISH` → version bump → FO consent record mismatch → re-consent sheet ตาม 00_GLOBAL §8 |
| GAP-08 | **ทุกโพสต์ที่ publish/คนอื่นเห็นได้ รายงานได้ และอยู่ queue เดียวกัน** — report target = post entity (published posts ทุกชนิด ไม่แยก asset/non-asset) | (a6) spec 04/00: queue `Reported Assets` = คิวรายงานโพสต์ที่ published (entity = post ref; asset-linked posts ใช้ `AST-`, post-only ใช้ post ref ตามนิยามใหม่); (d3) seed เพิ่ม post-only case; **OPEN-5 resolved 2026-11-03**: post-only ไม่มี list/browse surface นอกคิว report — boundary เขียน spec 04 §3/§7 + 05 §3 (`BO-04-v1.6`/`BO-05-v1.3`) |
| GAP-09 | **ใช้ `Reported Articles` เป็น canonical** — ตรง nav label + sibling naming (Articles / Categories / Reported Articles) | (a9) spec/code comments เปลี่ยน `Reported Board` → `Reported Articles`; เขียน "(Board Content reports)" กำกับใน spec เพื่อ map กับ FO report type `Board Content` |
| GAP-10 | **ใช้ contract copy `บทความนี้ไม่พร้อมใช้งานแล้ว` เป็น canonical เดียว** | (a10) BO 05 spec อ้าง canonical copy เดียวกัน; FO prototype ตามไปใน language sweep (deviation D11 — อยู่นอก scope audit นี้) |
| e4 | **ตัด Report Article/`Board Content` ออกจาก V1 ทั้งระบบ** — ไม่ใช่ contract-only: FO ลบ contract ทั้งหมด และ BO queue `Reported Articles`/`Board Report Detail` ถูกถอดตามเพื่อไม่ให้สับสน (protected — ผู้ใช้อนุมัติแตะแล้ว) | FO spec ลบครบ (FO-PRD-v1.13 — S-04 superseded, AC-BOARD-016/AC-TS-009/QA-BOARD-008 ถูกลบ); BO spec mark queue pending removal (BO-00-v1.3/BO-03-v1.4/BO-04-v1.5/BO-05-v1.2); **follow-up task**: ถอด queue จาก `bo-prototype.html` (menu/routing/renderer/mock `boardReport*`/dashboard refs) + spec cleanup เต็ม |

**สถานะหลัง decision**: Blocker 0 · เหลือ implementation items: spec-only ~10 ข้อ (a1–a10 + SLA cleanup ใน 02/BO_PRD/04), mock data ~7 ข้อ (d1–d6 + ลบ SLA/due tags จาก seeds), protected-screen edits 7 จุด (c1–c6 + **Dashboard/comment-mock ลบเวลา** ตาม GAP-03 — รอ approve), FO decision items ครบ (e1 + e4 resolved 2026-11-03 — e4 = ตัด Report Article ทั้งระบบ, BO queue pending removal) + OPEN-5 resolved 2026-11-03 (post-only = คิว Reported Assets เท่านั้น ไม่มี list แยกใน V1) · GAP-06 ปิดแบบ by-design ตาม IG; GAP-03 = removal task ไม่ใช่ by-design · remediation ที่เกี่ยว Board Content (a1 ส่วน board reasons, c4, a9) เป็น moot ตาม e4

**[OPEN-4 — resolved 2026-11-02]**: ผู้ใช้ตัดสินถอน report review SLA/deadline ออกทั้งระบบ **รวมฝั่ง FO** — เคลียร์ 24h จาก `15_TRUST_SAFETY_MODULE.md` (rename AC-TS-012 → Report Handling), `18_ADMIN_SCOPE_NOTE.md` (AC-ADMIN-006 → no-deadline), `TukDaeng_Master_Product_Definition.md`, `11_SOCIAL_MODULE.md`, `FO_Functional_PRD.md`, `QA_TEST_SCENARIO_CHECKLIST.md` (baseline `FO-PRD-v1.11`) และตัด helpdesk ticket SLA ออกจาก Phase 2 scope notes ฝั่ง BO — FO ไม่มี policy contract 24h แล้ว AC-ADMIN-006 เปลี่ยนเป็น review-coverage contract (ทำใน task `ef329529`)
