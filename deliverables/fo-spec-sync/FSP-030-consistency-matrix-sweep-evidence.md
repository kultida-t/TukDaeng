# FSP-030 — Cross-Doc Consistency Matrix + Contradiction Sweep Evidence

Date: 2026-10-22
Task: `4464d951` — "FSP-030 consistency matrix + sweep จุดขัดแย้งข้ามเอกสาร" (mission:cc291dc9)
Scope: สร้าง cross-doc consistency matrix (session model, asset statuses, login-required actions, notification types, share rules, deep link behavior) + sweep จุดขัดแย้งข้ามเอกสาร ตาม residual flags จาก FSP-028/029
Canonical: `TukDaeng_Master_Product_Definition.md` §16 Sync Decision Log (S-01–S-29) + locked `Prototypes/fo-flow/index.html` + `FSP-005-consolidated-gap-signoff.md`
Rule: ห้ามแตะ `Prototypes/` เด็ดขาด; DOCUMENT_VERSION historical entries v1.0–v1.8 ไม่แก้ย้อน (annotate ได้ — ไม่ rewrite)
Context: ต่อจาก FSP-029 (AC 5/5 PASS) — residual ที่ flag ไว้: 15_TRUST L114/L270, 16_INTEG L69-70, 17_NFR L85, 00_GLOBAL L356 (flag เดิมเขียน L15 ตำแหน่งจริง L356), DOCUMENT_VERSION §2 block "Module PRD 00-18"

## 1. Consistency Matrix (กฎหลัก × ตำแหน่งอ้างถึง)

| # | กฎหลัก | Canonical definition | เอกสารที่อ้างถึง | ผลตรวจ |
| --- | --- | --- | --- | --- |
| R-1 | Session model `member`/`new`/`guest` + transitions | `00_GLOBAL` §7 (GUEST-001) + §12 lifecycle; master session model | headers ของ 07_CHAT/09_NOTIFICATION/11_SOCIAL/12_BOARD cite §7; `15_TRUST` §7 User States = actor states (Guest→session `guest`, Member→`member`/`new`, Suspended/Banned→account status contract S-29) — คนละ axis ไม่ขัด; QA session items | **CONSISTENT** |
| R-2 | Asset statuses `Sale`/`Show`/`Hide`/`Sold` + kind `post` | `00_GLOBAL` §9–§10 visibility matrix + master | 15/16/17 ไม่ redefine status; block-impact refs ใช้ชุดเดียวกัน | **CONSISTENT** |
| R-3 | Login-required gate = Member Sheet `Join TukDaeng` (เดิม Global Login Required Dialog) | `00_GLOBAL` §11 + master Member Sheet def + rename table | module specs sync แล้วทุกเล่ม; **`15_TRUST` L114 + `16_INTEG` L69–70 ยังใช้ชื่อเดิม → FIXED** (§2 F-1/F-2/F-3); QA-TS-009 expected = Member Sheet | **FIXED** |
| R-4 | Notification types 5 types (`like`/`comment`/`follow`/`watch`/`system`) | `09_NOTIFICATION` + S-17 + `00_NAV` §8 (system = placeholder destination) | README_MODULE_INDEX L96 / DEV_BASELINE L96 / FINAL_HANDOFF L38 / DEV_IMPL L180 / master L1005 / QA L61+L1224 — มี system ครบ; **`00_GLOBAL` L356 + `16_INTEG` L95 ขาด `system` → FIXED** (§2 F-4/F-5); DEV_IMPL L262 = notification settings toggles 4 ตัว (S-06 — คนละ axis กับ feed types) intentional; 09_NOTIFICATION L49 = คอลัมน์ "spec เดิม" ใน deviation table intentional | **FIXED** |
| R-5 | Share = member-only ทุก surface | S-03 + `00_GLOBAL` §11 L236 | 11_SOCIAL/12_BOARD sync แล้ว; DOCUMENT_VERSION v1.4/v1.5 guest-share = historical เท่านั้น (FSP-029 classified) | **CONSISTENT** |
| R-6 | Deep link = contract-only + validation | `00_NAV` §12 + master (S-29) | `15_TRUST` L251 blocked-content deep-link guard ตรง; `17_NFR` L58 route guard ตรง; DOCUMENT_VERSION v1.4 entries = historical | **CONSISTENT** |
| R-7 | Feed pagination = render list ครั้งเดียว (ไม่มี infinite scroll/pull-to-refresh/end-of-list marker); Board end note `You're all caught up`/`คุณดูครบทั้งหมดแล้ว` | master §12 L920 + §14 L974 + `02_FEED` AC-FEED-035 + `03_SEARCH` AC-SEARCH-040 + QA L562 + D2 | DEV checklists/PRD/Use_Cases/master = negation ครบ; **`17_NFR` 7 rows claim "Feed ต้องรองรับ Infinite Scroll" + end-of-list `คุณดูรายการทั้งหมดแล้ว` (copy ที่ไม่มีใน prototype — actual = `คุณดูครบทั้งหมดแล้ว` ของ Board) → FIXED ทั้งไฟล์** (§2 F-6); flag เดิมระบุเฉพาะ L85 แต่ sweep พบขัดทุก section (§3/§4/§8/§9) | **FIXED** |
| R-8 | WA notification destination = Post Viewer ของ post ที่ match (S-08 — ไม่มี Result List) | `00_NAV` §8 + `09_NOTIFICATION` + master | **`16_INTEG` L96 เขียน "Asset Detail (post viewer)" → FIXED เป็น Post Viewer**; "Watch Alert Result" ใน `00_GLOBAL` §13/`15_TRUST` = WA match concept ตรง canonical (00_GLOBAL ใช้คำเดียวกัน — ไม่ใช่ stale surface) | **FIXED** |
| R-9 | Report types = Asset (post), User, Comment, Board Content (Board Content = contract-only S-04) | QA-TS-008 + `15_TRUST` §Report Type Rule + `12_BOARD` §13/§19 | taxonomy + impact rules ตรง; `12_BOARD` D16 flag "15_TRUST ยังไม่ sync" หมายถึง internals granularity (report stack `report:pick`/`report:post`/`report:user`/`report:done` + `PM_REASONS` + shared `blkSheet`/`unblockDlg` ไม่ได้อธิบายใน 15 — เป็น contract-level spec) | **FLAG → F-5** (ไม่ขัด — ระดับรายละเอียดต่างกัน) |
| R-10 | Chat block semantics (history read-only + ปิดส่ง/สร้างใหม่) | master §Block User + `07_CHAT` §Block | **`15_TRUST` L312 stale TODO "ต้อง update master และ Chat PRD ให้ explicit" — master/07 explicit แล้วตั้งแต่ FSP-020 → FIXED** | **FIXED** |
| R-11 | DOCUMENT_VERSION doc-set scope | §2 entry `FO-PRD-v1.9` (current) | block "Baseline scope หลักยังครอบคลุม: Module PRD `00-18`" ใต้ v1.1 — อ่านเป็น current scope ได้ (08 ถูกลบแล้ว, Figma docs ไม่มีแล้ว) → ตัดสินใจ **annotate แบบ additive** (§2 F-7) เพราะ historical entries ห้าม rewrite | **ANNOTATED** |
| R-12 | Cross-module flow refs ครบสองฝั่ง | — | 12_BOARD→15_TRUST `Board Content` (contract S-04, flag D16 คงไว้); 09_NOTIFICATION↔00_NAV §8 destination matrix ตรง; 16_INTEG FCM→09/10/07/11 dependent modules ตรงหลัง fix; Member Sheet refs ทั้งหมดชี้ 00_GLOBAL §11 | **CONSISTENT** |
| R-13 | AC/QA codes | QA v2.0 maps `AC-*` 502 unique refs → 0 missing (FSP-029 §4) | `AC-NFR-*` ไม่ถูก QA checklist อ้าง → แก้ criteria text ปลอดภัยไม่แหว่ง ref; `AC-TS-*` ถูก QA-TS-* map อยู่ — semantics คงเดิมหลัง fix; QA-TS-008 annotate "Asset (post)" สอดคล้อง 15_TRUST taxonomy | **CONSISTENT** |

## 2. รายการจุดขัดแย้งที่แก้แล้ว (Fix Log)

| # | File | จุดเดิม | แก้เป็น | ประเภท |
| --- | --- | --- | --- | --- |
| F-1 | `15_TRUST_SAFETY_MODULE.md` L114 | `Global Login Required Dialog` | Member Sheet `Join TukDaeng` ตาม global rule (00_GLOBAL §11) | flag จาก FSP-029 (rename canonical) |
| F-2 | `15_TRUST_SAFETY_MODULE.md` L270 | `Notification Center item` | `Alerts feed item` | flag จาก FSP-029 (rename canonical) |
| F-3 | `15_TRUST_SAFETY_MODULE.md` L312 | `ต้อง update master และ Chat PRD ให้ explicit ก่อนส่งต่อเป็น final rule` (stale TODO) | Master §Block User + 07_CHAT explicit แล้วเป็น canonical | sweep-found — pre-sync process note ที่ resolve แล้ว |
| F-4 | `00_GLOBAL_RULES_MODULE.md` L356 | notif types `Like, Comment, Follow, Watch Alert` (ขาด system) | + `system` (S-17 — placeholder destination ตาม 09_NOTIFICATION) | flag จาก FSP-029 (เขียน L15 ตำแหน่งจริง L356) |
| F-5 | `16_INTEGRATIONS_MODULE.md` L69–70 | dependent modules `Settings, Global Login Required` ×2 | `Settings, Member Sheet (guest gate)` | flag จาก FSP-029 (rename canonical) |
| F-6 | `16_INTEGRATIONS_MODULE.md` L95 | notif types ขาด `system` | + `system` (S-17) | sweep-found — class เดียวกับ F-4 |
| F-7 | `16_INTEGRATIONS_MODULE.md` L96 | `เปิด Asset Detail (post viewer)` | `เปิด Post Viewer ของ post ที่ match โดยตรง` (S-08) | sweep-found — ชื่อ surface ขัด canonical |
| F-8 | `17_NON_FUNCTIONAL_REQUIREMENTS.md` L28, L46 | `Feed ต้องรองรับ Infinite Scroll` (§3 Master Alignment + §4 Performance) | `Feed render list ครั้งเดียว — ไม่มี infinite scroll / pull-to-refresh / end-of-list marker ใน V1` | flag L85 ขยาย — ขัดทุก section |
| F-9 | `17_NON_FUNCTIONAL_REQUIREMENTS.md` L29, L47 | `End-of-list แสดง คุณดูรายการทั้งหมดแล้ว` | Feed ไม่มี end-of-list marker; Board end note `You're all caught up`/`คุณดูครบทั้งหมดแล้ว` (copy canonical จริง) | sweep-found — copy เดิมไม่มีใน prototype |
| F-10 | `17_NON_FUNCTIONAL_REQUIREMENTS.md` L85 | QA checklist `infinite scroll, end-of-list` | `single-render list (ไม่มี infinite scroll/end-of-list marker), Board end note` | flag เดิมจาก FSP-029 |
| F-11 | `17_NON_FUNCTIONAL_REQUIREMENTS.md` L98–99 | `AC-NFR-003` รองรับ Infinite Scroll / `AC-NFR-004` End-of-list `คุณดูรายการทั้งหมดแล้ว` | AC-NFR-003 = single-render list ไม่มี infinite scroll/pull-to-refresh/end-of-list; AC-NFR-004 = Board end note canonical | sweep-found — codes คงเดิม แก้ criteria (ไม่มี QA ref แหว่ง) |
| F-12 | `DOCUMENT_VERSION.md` §2 block `Baseline scope … Module PRD 00-18` (ใต้ v1.1) | อ่านเป็น current scope ได้ → stale implied (08 ถูกลบแล้ว) | **annotate additive** — เพิ่มหมายเหตุปิดท้าย block ว่าเป็น doc set ยุค v1.1 + doc set ปัจจุบันดู entry v1.9 (historical ไม่ rewrite) | flag จาก FSP-028 — ตัดสินใจ annotate |
| F-13 | `DOCUMENT_VERSION.md` L43 (entry v1.9 — current, แก้ได้) | `tracked เป็น FSP-029/FSP-030` | + `resolved ใน FSP-030` พร้อม pointer evidence file | bookkeeping — entry current version ไม่ใช่ historical |

รวม 13 fixes ใน 5 ไฟล์: `15_TRUST` (3), `16_INTEG` (3), `17_NFR` (4 จุด/7 rows), `00_GLOBAL` (1), `DOCUMENT_VERSION` (2)

ไม่ bump version — residual fixes อยู่ใน scope ของ `FO-PRD-v1.9` เอง (§2 bullet ระบุชัดว่า tracked FSP-029/030)

## 3. Verification

```
$ grep 'Global Login Required|Notification Center' 15_TRUST 16_INTEG   → 0 live hits
$ grep 'Like, Comment, Follow, Watch Alert' FrontOffice/               → ทุก list มี system/System แล้ว
                                                                       (DEV_IMPL L262 = settings toggles S-06 intentional,
                                                                        09_NOTIFICATION L49 = spec-เดิม column intentional)
$ grep 'Infinite Scroll|infinite scroll|คุณดูรายการทั้งหมด' 17_NFR     → เหลือเฉพาะ negation + Board canonical end note
$ git status --porcelain -- Prototypes/                                → (ว่าง — 0 lines)
$ git diff --stat -- Prototypes/                                       → (ว่าง — ไม่มี diff)
```

- `Prototypes/` ไม่ถูกแตะตามข้อห้าม
- DOCUMENT_VERSION historical entries v1.0–v1.8 ไม่ถูก rewrite — block `00-18` ใช้ additive annotation เท่านั้น
- `AC-NFR-*` ไม่มี QA checklist refs → แก้ criteria ไม่แหว่ง (ตรวจ grep `AC-NFR` = hits เฉพาะใน 17_NFR เอง)
- ไม่ commit — FSP-022–030 uncommitted รอคำสั่งแยก (FSP-001–021 committed `4f0e0ad`)

## 4. Findings (flag ให้ผู้ใช้ตัดสิน — ไม่แก้ใน task นี้)

| # | Finding | สถานะ / ข้อเสนอ |
| --- | --- | --- |
| F-1 (ต่อ FSP-029) | **BackOffice docs ยังอ้าง `../FrontOffice/08_OFFER_MODULE.md` ที่ถูกลบ** — `09_OFFER_CHAT` L12, `13_ACCOUNT_DELETION` L12, `14_NOTIFICATIONS` L7, `15_REPORTS_ANALYTICS` L7, `BackOffice/DOCUMENT_VERSION` L110 (+สำเนา historical ใน `deliverables/mission-1-obj*`) — dangle ตั้งแต่ FSP-006 | **ผู้ใช้ตัดสิน: บันทึกไว้สร้าง task แยกแก้ฝั่ง BO** — ไม่แก้ใน task นี้ |
| F-2 (ต่อ FSP-029) | **`ProjectAdmin/` ทั้งโฟลเดอร์ถูกลบใน `adb265a` (2026-07-10)** — ไม่ใช่แค่ `FO_BO_INTEGRATION_MAP.md` — refs ที่หลงเหลือ: `README.md` (Shared FO/BO integration map block, Folder Map row `ProjectAdmin`, Shared Project Files table, Notes bullet) + `README_MODULE_INDEX` L51 + `18_ADMIN_SCOPE_NOTE` L24 | **RESOLVED — ผู้ใช้สั่งลบ refs ทิ้ง**: ตัด 6 จุดออกแล้ว (README ×4, README_MODULE_INDEX ×1, 18_ADMIN_SCOPE_NOTE ×1); verify `grep ProjectAdmin` เหลือเฉพาะ DailyLogs (historical ไม่ใช่ source of truth) |
| F-5 (ใหม่) | **`15_TRUST_SAFETY_MODULE.md` internals ยังระดับ contract spec** — ไม่ได้อธิบาย prototype report stack (`report:pick`/`report:post`/`report:user`/`report:done`, `PM_REASONS`, done-step rows, shared `blkSheet`/`unblockDlg`) — taxonomy/impact/SLA ตรง canonical (QA-TS-008 map `AC-TS-*` ครบ) แต่ granularity ต่างจาก module specs ที่ rewrite; `12_BOARD` §19 D16 flag "ยังไม่ sync → FSP-025/030" หมายถึงจุดนี้ | **RESOLVED — ผู้ใช้ตัดสินสร้าง task แยก**: `a6ffd9b1` FSP-031 sync 15_TRUST_SAFETY ให้ระดับ prototype (mission เดียวกัน) — scope + canonical sources ระบุใน task card |

## 5. Summary

| Check | Result |
| --- | --- |
| Consistency matrix | 13 rule rows (R-1–R-13) ครบทุกพื้นที่ task card + sweep-found classes |
| Residual flags FSP-029 | 5/5 resolved (15_TRUST ×2, 16_INTEG ×1, 17_NFR ×1, 00_GLOBAL ×1) + DOCUMENT_VERSION block annotated |
| Sweep-found fixes | +7 จุด (15_TRUST L312, 16_INTEG L95/L96, 17_NFR เพิ่มอีก 6 rows นอกเหนือ L85) |
| Live stale เหลือ | 0 — ทุก hit ที่เหลือเป็น intentional (rename-trace/negation/deviation tables/historical/settings-toggles axis) |
| AC/QA refs | ไม่แหว่ง — AC-NFR ไม่มี QA ref; AC-TS semantics คงเดิม |
| Prototype | `Prototypes/` ว่างทั้ง status และ diff |
| Historical rule | DOCUMENT_VERSION v1.0–v1.8 ไม่ rewrite — annotate additive เท่านั้น |
| ไฟล์ที่แก้ | 5 ไฟล์ใน `FrontOffice/` + evidence file นี้ |

**Verdict: PASS** — consistency matrix ครบ + จุดขัดแย้งทุกจุดใน flag list แก้แล้ว + sweep พบและแก้ same-class contradictions เพิ่ม 7 จุด + F-2 resolved (ลบ `ProjectAdmin/` refs 6 จุด — ทั้งโฟลเดอร์ถูกลบใน `adb265a` ไม่ใช่แค่ไฟล์เดียว) + F-5 resolved (สร้าง FSP-031 `a6ffd9b1` sync 15_TRUST ระดับ prototype); F-1 บันทึกไว้สร้าง task แยกฝั่ง BO (ผู้ใช้จะสร้างเอง)
