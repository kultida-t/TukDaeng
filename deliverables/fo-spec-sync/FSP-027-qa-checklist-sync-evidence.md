# FSP-027 — QA Test Scenario Checklist Sync Evidence (FO-PRD-v1.9)

Date: 2026-10-22
Task: `200a6dbf` — "FSP-027 อัปเดต QA_TEST_SCENARIO_CHECKLIST ตาม spec ใหม่" (mission:cc291dc9)
Scope: `FrontOffice/QA_TEST_SCENARIO_CHECKLIST.md` — full rewrite v1.1 → v2.0 (FO-PRD-v1.9)
Context: FSP-026 evidence §4 flag — checklist มี live stale หนัก (`Global Login Required Dialog` ~10 จุด, `Price on request` 3 จุด, `Notification Center` ~6 จุด, `Hide this asset`, `Total Asset Value` 3 จุด, `Contact Seller` offer-era entries)
Rule: canonical = locked `Prototypes/fo-flow` + master §16 Sync Decision Log (S-01–S-29) + module specs 00–17; behavior ที่ prototype ไม่ครอบ mark `(contract)`; ห้ามแตะ `Prototypes/` เด็ดขาด

## 1. What changed (file map)

| File | Change |
| --- | --- |
| `FrontOffice/QA_TEST_SCENARIO_CHECKLIST.md` | Full rewrite (~1,545 → 1,767 บรรทัด): header → v2.0 FO-PRD-v1.9 + source-of-truth note; เพิ่ม Conventions (`Maps to`/`Prototype`/`(contract)`/documented-defects list); เพิ่ม §1.3 **Removed/renamed behaviors guard table** (24 rows — legacy → canonical); Test Data Setup → actor/post/pfkind/portfolio/alert/chat model ชุดใหม่; โครง section จัดใหม่ mirror spec modules (Global/Auth/Feed/Search/Profile/Post Detail/Watch Alert/Asset+Portfolio/Chat/Alerts Feed/Social/Settings/Board/T&S/Integrations/Nav) + Sign-off matrix; ทุก scenario มี `Maps to` AC refs ที่ grep-verify แล้ว |

## 2. Stale-term resolution map (FSP-026 §4 flags → ผลลัพธ์)

| Flag เดิม | Resolution ใน checklist ใหม่ |
| --- | --- |
| `Global Login Required Dialog` ~10 live refs | แทนด้วย Member Sheet `Join TukDaeng` bottom sheet (scrim-dismiss, คง surface) ใน QA-GLOBAL-001/002 + gate assertions ทุก section — live refs เหลือ 0 (อยู่แค่ Removed-table + negation) |
| `Price on request` 3 refs | ตัดออก — empty price = `showcase`; QA-ASSET-005 assert ว่า label ต้องไม่มีที่ไหนเลย |
| `Notification Center` ~6 refs | แทนด้วย **Alerts feed** — section 11 (QA-NOTI-001–009): 5 types (`like`/`comment`/`follow`/`watch`/`system`), destinations (like/comment→own Post Viewer, watch→matched Post Viewer ตรง, follow→profile, system→placeholder) |
| `Hide this asset` | แยก concept: owner lifecycle = status `Hide` ผ่าน Edit info `Profile status` pick (QA-ASSET-008) / viewer feed hiding = `Not interested` ni-card loop (QA-FEED-011) |
| `Total Asset Value` 3 refs | แทนด้วย `Total invested` (Σ purchase, private, excludes sold/deleted) ใน QA-PORT-001; Top Brand/YTD ถูกตัด + guard QA-PORT-005 |
| `Contact Seller` / offer-era entries | ตัด offer ทั้งชุด (amount/status/accept/reject/notification) — ไม่มี Offer ใน V1; `Ask Seller` pill = chat entry บน sale posts เท่านั้น (QA-FEED-008, QA-CHAT-001) |

Stale เพิ่มเติมที่เจอระหว่าง rewrite และแก้พร้อมกัน: guest share allowed → member-only (S-03, QA-GLOBAL-004); `Block this user?` center dialog → `blkSheet` (QA-TS-001); report copy `Report submitted. Thank you…` → `report:pick`→`report:done`+`Report submitted · thanks for letting us know` (QA-TS-004); comment free-text input → emoji quick-react (QA-SOCIAL-002, S-12); `Favorites`=liked posts → seller-level favorites + Interested list (QA-SOCIAL-012/013); standalone `Change Status` sheet → Edit info `Profile status` pick (QA-ASSET-008); 6-field Sale Record → 2-field (QA-ASSET-011); sale-only feed → post-centric (QA-FEED-001, S-09); WA Result List → direct Post Viewer (QA-WA-010, S-08); same-user chat merge → `{user,item}` key (QA-CHAT-001, S-07); sort UI/result count/saved search (S-24, QA-SEARCH-006); like count บนโพสต์คนอื่น → private (S-26, QA-FEED-004); Edit Profile row ใน Settings → own profile only (S-05, QA-SETTING-002); OTP expiry/Confirm Password/Reset Password/Verification Success pages (S-20, QA-AUTH-017); ไม่ auto-login หลัง signup (S-22, QA-AUTH-004); E2E/Letter Sealing claim (S-18, QA-CHAT-011); drawer 9 placeholders (S-19, QA-NAV-002)

## 3. QA code integrity

| Check | Result |
| --- | --- |
| Total items | **228 scenarios** ใน 17 prefixes (QA-GLOBAL/AUTH/FEED/SEARCH/PROFILE/DETAIL/WA/ASSET/PORT/CHAT/NOTI/SOCIAL/SETTING/BOARD/TS/INT/NAV) |
| Header-code duplicates | **0** (`grep '^### QA-' \| sort \| uniq -d` ว่าง) |
| `QA-PORT-*` prefix | คงไว้สำหรับ portfolio-route items (dashboard/pfasset/soldhist/privacy/guard) — continuity กับ historical refs ใน `DOCUMENT_VERSION.md` |
| Retired codes | codes รูปแบบเดิม (`QA-ASSET-002A/002D`, `QA-PROFILE-002A/002B`, `QA-VIS-*`, `QA-DETAIL-005/006` ความหมายเดิม) ถูก renumber ทั้งชุด — refs ที่เหลือใน `DOCUMENT_VERSION.md`/`DailyLogs/` เป็น historical version-log entries (intentional — ไม่แก้ย้อน; version entries = FSP-028 scope) |

## 4. AC mapping verification

| Check | Result |
| --- | --- |
| `Maps to` coverage | ทุก scenario มี `Maps to` — AC IDs หรือ spec-section cite เมื่อไม่มี AC ตรง |
| AC refs ที่อ้างใน checklist | **462 unique codes** |
| AC refs ที่ไม่มีใน `FrontOffice/*.md` | **0** (`comm -23` เทียบ AC inventory ทุก module: GLOBAL/NAV/AUTH/FEED/SEARCH/ASSET-MGMT/DETAIL/PROFILE/CHAT/NOTI/WA/SOCIAL/BOARD/SETTING/PORT/TS/INT) |

## 5. Cross-doc grep verify (ก่อนปิดงาน)

Pattern sweep ทั้ง checklist: `Global Login Required`, `Price on request`, `Notification Center`, `Hide this asset`, `Total Asset Value`, `Contact Seller`, `offer/Offer`, `YTD`, `Top Brand`, `Result List`, `Change Status`, `Same-User`, `Confirm Password`, `Block this user`, `Thank you for letting us`, `saved search`, `Consignment`

| Check | Result |
| --- | --- |
| Live stale hits | **0** — hits ทั้งหมดตกใน 3 กลุ่ม intentional: (a) §1.3 Removed-behaviors guard table (b) negation guards `ไม่มี …` / `replaces …` / `never …` (c) spec'd absent-feature assertions (QA-AUTH-017, QA-WA-014, QA-CHAT-018, QA-PORT-005 ฯลฯ) |
| QA codes referenced elsewhere | `DOCUMENT_VERSION.md` + `DailyLogs/DAILY_WORK_REPORT_2026-06-23.md` — historical log entries เท่านั้น (intentional) |
| `git status --porcelain -- Prototypes/` | **ว่าง** — ไม่มีไฟล์ใน Prototypes/ ถูกแตะ ✓ |

## 6. Deviations / stale ที่ flag ต่อ (นอก scope FSP-027)

| Item | Flag ไป |
| --- | --- |
| `15_TRUST_SAFETY_MODULE.md` ยังไม่ sync (old `Block this user?` dialog, `Global Login Required` L114, `Notification Center` L270, `Watch Alert Result` wording) | FSP-030 — checklist assert canonical 06/07 behavior ไปแล้ว; TS module spec เองยัง stale |
| `00_GLOBAL_RULES_MODULE.md` L15 notif-type list ไม่มี `system`; `17_NON_FUNCTIONAL_REQUIREMENTS.md` `Infinite Scroll` + AC-NFR-003 | FSP-030 (flag เดิม FSP-025/026 — ไม่เปลี่ยน) |
| `DOCUMENT_VERSION.md` baseline `FO-PRD-v1.8` + historical stale terms | FSP-028 (owner task เดิม) |
| `(contract)` items ใน checklist (deep links, suspended/banned, moderation SLA, FCM, cookie prefs ฯลฯ) | production/staging verify — prototype satisfy ไม่ได้เอง; sign-off rules ใน §18 ระบุไว้แล้ว |
| `salePosts()` pfkind leak (S-10), public `all` tab leak (S-14), sold-post `FOR SALE` tag quirk | documented defects — sign-off rules บังคับ log เป็น defect ห้าม waive |

## 7. Verification

| Check | Result |
| --- | --- |
| ไฟล์ที่แก้ | `FrontOffice/QA_TEST_SCENARIO_CHECKLIST.md` (rewrite ทั้งไฟล์) + evidence ไฟล์นี้ |
| Scenario coverage | 228 items ครบทุก module 00–17 + onboarding/guest/session/lifecycle/deep-link/failure matrix — ตาม task requirement (onboarding, guest mode, portfolio mark-as-sold, Alerts 5 types, post-centric, Not interested, Total invested, Ask Seller sale-only) |
| QA uniqueness | 0 header duplicates |
| AC existence | 462 refs → 0 missing |
| Stale sweep | 0 live stale — remaining = intentional Removed-table/negation/historical |
| Prototype cleanliness | `git status --porcelain -- Prototypes/` ว่าง ✓ |
| Commit | ไม่ commit — FSP-006–027 uncommitted รอคำสั่งแยก ✓ |
