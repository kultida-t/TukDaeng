# FSP-026 — Legacy Central Docs Sync Evidence (FO-PRD-v1.9)

Date: 2026-10-22
Task: `b6d83f45` — "FSP-026 sync index + DEV checklists + Use Cases/PRD" (mission:cc291dc9)
Scope: `FrontOffice/` เอกสารกลาง legacy tier — `README_MODULE_INDEX.md`, `DEV_IMPLEMENTATION_CHECKLIST.md`, `DEV_CHAT_IMPLEMENTATION_CHECKLIST.md`, `Use_Cases.md`, `PRD.md`, `FO_Functional_PRD.md`, `ERROR_STATE_UI_COPY_CATALOG.md`, `FINAL_HANDOFF_SUMMARY.md`, `DEV_BASELINE_HANDOFF_2026-06-22.md` + แก้ stale `Notification Center` 2 จุดที่ FSP-022 flag (`02_FEED_MODULE.md` L662, `13_SETTINGS_MODULE.md` L539)
Context: FSP-025 evidence §4 flags — legacy docs ยังเขียน `Price on request`, Sale-only feed, multi-step asset form, `Notification Center`, offer-era wording — sync เทียบ master ใหม่ (§16 Sync Decision Log เป็น canonical S-01–S-29)
Rule: legacy docs เป็น assumption tier ต่ำสุด — ทุกจุดที่ขัด prototype/master ให้เลือก prototype; production contract ที่ prototype ไม่ครอบ mark `(contract — prototype ไม่ครอบ)`; ไม่แตะ `Prototypes/` เด็ดขาด

## 1. What changed (file map)

| File | Change |
| --- | --- |
| `README_MODULE_INDEX.md` | Baseline → FO-PRD-v1.9 + sync note; แก้ L94 stale — supported notification types = Like, Comment, Follow, Watch Alert + `system` (placeholder — S-17); source-of-truth order ยืนยัน master → 00_GLOBAL → 00_NAV → module 01–18 → legacy; ไม่มี Figma เป็น source of truth |
| `DEV_IMPLEMENTATION_CHECKLIST.md` | เพิ่ม sync note FO-PRD-v1.9; Global Login Required Dialog → Member Sheet `Join TukDaeng`; feed post-centric + ไม่มี infinite scroll/load-more; composer asset mode ไม่ใช่ multi-step form; `Price on request` ถูกตัด; Alerts feed 5 types; Total invested แทน Total Asset Value; ไม่มี Top Brand/YTD; share member-only; auth states ตาม S-20/S-22 |
| `DEV_CHAT_IMPLEMENTATION_CHECKLIST.md` | Sync note + baseline v1.9; Member Sheet แทน Global Login Required Dialog; Alerts feed terminology; thread key = user+item (S-07 — seller เดิมคนละ listing = ห้องแยก ไม่ merge) |
| `Use_Cases.md` | Sync note FO-PRD-v1.9; feed render ครั้งเดียวไม่มี infinite scroll; ตัด `Price on request`; asset/post terminology + status ชุดใหม่ (`Show`/`Hide` แทน `Collection Show`/`Collection Hide` ใน precondition); Sale Record = price+date 2 ฟิลด์; Board static list editorial; portfolio `Total invested`/ไม่มี Top Brand/YTD; Member Sheet/Alerts feed/share gating/login-to-restore |
| `PRD.md` | Sync note FO-PRD-v1.9 + header คงเวอร์ชัน legacy ไว้; §2 architecture → post-centric feed/Member Sheet/Saved-Wish List/Portfolio `Total invested`; §3.1 implied consent แทน tickbox; §3.2 feed post-centric (ไม่มี `Price on request`, Favorites=favorite sellers, guest ungated S-16); §3.3 search (typed price inputs, ไม่มี result count/sort, WA auto-name+match modes); §3.4 Detail Asset → Post Detail (`Ask Seller` sale-only, own-post menu, comments sheet emoji); §3.5 composer asset mode (required เดียว = media≥1, ไม่มี required matrix/autocomplete/option-master/provenance, Sale Record 2 ฟิลด์, ไม่มี confirm dialog); §3.6 chat user+item + text/media เท่านั้น + `chmenu` 4 actions; §3.7 board editorial magazine + share/like member-only + report contract-only; §3.8 Alerts feed 5 types + walerts ใน Settings>Your library; §3.9 profile tabs 5 (ทั้งหมด/ขาย/โชว์/ซ่อน/ขายแล้ว) + viewer ขาย/โชว์ + portfolio wallet entry; §3.10 drawer 9 placeholders (S-19) + settings 6 sections; glossary +Post/Cost details/Member Sheet/Alerts feed/`Show` |
| `FO_Functional_PRD.md` | Sync note FO-PRD-v1.9; §3 feed = post-centric; §5 feed visibility rule post kinds `sale`+`post`; §11 → Member Sheet (+share/favorites/comment gated, S-03/S-16); §12 chat thread user+item (S-07, reference คงเดิม); §13 5 notification types +`system` + destinations Post Viewer/Public Profile; §15 WA shared sheet/auto-name/snapshot; §16 portfolio `Total invested` + Sale Record 2 ฟิลด์; §17 block → blocked profile IG-style (S-13) |
| `ERROR_STATE_UI_COPY_CATALOG.md` | Baseline `FO-PRD-v1.2` → `FO-PRD-v1.9` + sync note; load-more state + retry checklist mark `(contract — ไม่มี load-more ใน V1)`; feed card copy ตัด Like Count ออกจาก required-visible (private — S-26) |
| `FINAL_HANDOFF_SUMMARY.md` | Baseline `FO-PRD-v1.3` → `FO-PRD-v1.9` + หมายเหตุรอบ 2026-10-22; notification decisions → Alerts feed 5 types; `Show` contact decision supersede (chat listing-scoped เท่านั้น); drawer 9 placeholders (S-19); share member-only (S-03); report article contract-only (S-04); delete account 2-page + login-to-restore (S-02/S-27); chat swipe actions |
| `DEV_BASELINE_HANDOFF_2026-06-22.md` | Baseline note `FO-PRD-v1.0` → marked superseded by `FO-PRD-v1.9`; Global → Member Sheet; feed post-centric/Search+WA sale-only; `Not interested` แทน Hide this asset; composer required = media≥1 + ไม่มี `Price on request`/required matrix/autocomplete; Sale Record 2 ฟิลด์; chat = `Ask Seller` บน sale post + user+item key; profile tabs canonical + S-14 defect note; portfolio `Total invested`/Sale Record; Alerts feed 5 types; settings 6 sections + login-to-restore; share member-only |
| `02_FEED_MODULE.md` L662 | `Notification Center` → `Alerts feed` (flag จาก FSP-022) |
| `13_SETTINGS_MODULE.md` L539 | `Notification Center` → `Alerts feed` (flag จาก FSP-022) |

## 2. Canonical decisions ที่ลง legacy docs (จาก master §16)

| Decision | ลงตรงไหน |
| --- | --- |
| S-09 feed post-centric (ไม่ใช่ Sale-only marketplace) | README, DEV_IMP, Use_Cases, PRD §3.2, FO_Functional §3/§5, DEV_BASELINE |
| S-03 share member-only ทุก surface (guest → Member Sheet) | Use_Cases, PRD §3.7, FO_Functional §11, FINAL_HANDOFF, DEV_BASELINE |
| S-07 chat thread = user+item ไม่ merge | DEV_CHAT_IMP, PRD §3.6, FO_Functional §12, DEV_BASELINE |
| S-08 WA notification → Post Viewer ตรง | FO_Functional §13/§15, DEV_BASELINE |
| S-11 WA auto-name + instant delete + snapshot | PRD §3.3/§3.8, FO_Functional §15 |
| S-14 public `all` tab = defect (public เห็น sale+show) | DEV_BASELINE, PRD §3.9 |
| S-16 guest browse feed ทุก tab ungated | PRD §3.2, FO_Functional §11 |
| S-17 `system` = 5th notif type placeholder | README L94, FINAL_HANDOFF, FO_Functional §13, DEV_IMP |
| S-19 drawer = 9 placeholder rows | PRD §3.10, FINAL_HANDOFF |
| S-20/S-22 auth states + ไม่ auto-login | DEV_IMP, Use_Cases |
| S-25 ไม่มี provenance/consignment entity | PRD §3.5, DEV_BASELINE, DEV_IMP |
| S-26 like count private เฉพาะเจ้าของ | ERROR_STATE (feed card copy), PRD §3.2 |
| S-02/S-27/S-28 delete account login-to-restore + chg-pwd in-app | FINAL_HANDOFF, DEV_BASELINE, PRD §3.10 |
| D2 `Total invested` แทน Total Asset Value | PRD §3.9, FO_Functional §16, DEV_BASELINE, DEV_IMP |
| D3 Sale Record = price+date เท่านั้น | Use_Cases, PRD §3.5, FO_Functional §16, DEV_BASELINE, DEV_IMP |
| D5 ไม่มี Top Brand/YTD | Use_Cases, PRD §3.9, DEV_IMP |
| ตัด `Price on request` / infinite scroll / multi-step form / required matrix | ทุกไฟล์ใน scope (PRD, Use_Cases, DEV_IMP, DEV_BASELINE, ERROR_STATE, FO_Functional) |
| Member Sheet แทน Global Login Required Dialog / Alerts feed แทน Notification Center | ทุกไฟล์ใน scope + 02_FEED L662 + 13_SETTINGS L539 |

## 3. Cross-doc grep verify (ก่อนปิดงาน)

Pattern grep ครอบทั้ง `FrontOffice/*.md`: `Price on request`, `Notification Center`, `Global Login Required`, `multi-step`, `Sale-only`, `offer/Offer`, `Total Asset Value`, `Top Brand`, `infinite scroll`, `Figma`, `Hide this asset`, `Contact seller`, `Collection Show/Hide`, `Sale Record Form`, auth stale (`OTP expiry`/`Confirm Password`/`Reset Password`/`auto-login`)

| Check | Result |
| --- | --- |
| Scope 9 ไฟล์ + 02_FEED/13_SETTINGS | **0 live stale hits** — hits ที่เหลือทั้งหมดเป็น (a) rename-trace `เดิมเรียก …` (b) negation `ไม่มี …` (c) exclusion list (d) sync notes — ตรวจทีละจุดแล้ว |
| `Price on request` | 0 live — เหลือเฉพาะ `ไม่มี Price on request` statements + QA checklist (FSP-027) |
| `Notification Center` | 0 live ใน scope — เหลือ negation/rename-trace ใน module specs + 15_TRUST/16_INTEG (FSP-030) + QA (FSP-027) + DOCUMENT_VERSION historical entries (FSP-028) |
| `Global Login Required` | 0 live ใน scope — เหลือ rename-trace `(เดิมเรียก …)` + 15_TRUST L114/16_INTEG L69-70 (FSP-030) + QA (FSP-027) + DOCUMENT_VERSION (FSP-028) |
| `Total Asset Value`/`Top Brand`/`YTD` | 0 live ใน scope — negation/rename-trace เท่านั้น + QA (FSP-027) |
| `infinite scroll`/`load-more` | 0 live ใน scope — เหลือ `ไม่มี …` statements + ERROR_STATE contract-only marks + 17_NFR (FSP-030) |
| `Figma`/`figma` | 0 hits ใน scope docs — เหลือเฉพาะ DOCUMENT_VERSION historical version entries (FSP-028 scope; ไฟล์ `FIGMA_UX_CLEANUP_TASK_BREAKDOWN`/`Figma_Gap_Checklist` ถูกลบไปแล้วตั้งแต่ FSP-008 — refs เป็น historical log เท่านั้น) |
| `offer`/`Offer` | 0 live — master/module negation เท่านั้น + ไม่มี hits ใน scope docs |
| Cross-doc refs → ไฟล์ที่ถูกลบ | ไม่มี ref ไป `08_*` module; module file ทั้งหมดที่ ref มีอยู่จริง (01–18 ยกเว้น 08 ที่ไม่มีใครอ้าง); FIGMA refs เหลือเฉพาะ DOCUMENT_VERSION historical log (intentional) |
| `git status --porcelain -- Prototypes/` | **ว่าง** — ไม่มีไฟล์ใน Prototypes/ ถูกแตะ ✓ |

## 4. Deviations / stale ที่ flag ต่อ (นอก scope FSP-026)

| Item | Flag ไป |
| --- | --- |
| `QA_TEST_SCENARIO_CHECKLIST.md` — live stale หนัก (`Global Login Required Dialog` ~10 จุด, `Price on request` 3 จุด, `Notification Center` ~6 จุด, `Hide this asset`, `Total Asset Value` 3 จุด, `Contact Seller` offer-era entries) | FSP-027 (QA checklist rewrite — owner task เดิม) |
| `00_GLOBAL_RULES_MODULE.md` L15 stale notif-type (`Like/Comment/Follow/Watch Alert` ไม่มี `system`) | FSP-030 (flag เดิม FSP-025) |
| `17_NON_FUNCTIONAL_REQUIREMENTS.md` L28/46/85/98 `Infinite Scroll` requirement + AC-NFR-003 | FSP-030 (flag เดิม FSP-025) |
| `15_TRUST_SAFETY_MODULE.md` L114 `Global Login Required Dialog`, L270 `Notification Center`; `16_INTEGRATIONS_MODULE.md` L69-70 `Global Login Required` | FSP-030 (flag เดิม FSP-025) |
| `DOCUMENT_VERSION.md` — current baseline ยัง `FO-PRD-v1.8` + historical entries มี stale terms (guest share allowed, Notification Center, Global Login Required) | FSP-028 (version registry bump — owner task เดิม; historical entries ไม่แก้ย้อน) |
| `07_CHAT_MODULE.md` L90 `Notification center / alerts feed` cross-ref + L472 `ไม่ใช่ Notification Center type` negation | ปลอดภัย — negation/rename-trace; รวม sweep FSP-030 ถ้าต้อง normalize |
| `salePosts()` pfkind leak + public `all` tab leak | documented defects — spec เขียน contract ถูกแล้ว ไม่แก้ prototype (S-10/S-14, FSP-030 quirk list) |

## 5. Verification

| Check | Result |
| --- | --- |
| ไฟล์ที่แก้ | 11 ไฟล์ใน `FrontOffice/` (9 scope docs + 02_FEED + 13_SETTINGS) + evidence ไฟล์นี้ |
| Canonical coverage | S-01–S-29 + D1–D5/D12 ที่เกี่ยวข้องกับ legacy docs ลงครบ — ดู §2 |
| Stale-term sweep | 191 hits เดิม → categorize แล้ว; scope docs = 0 live stale (negation/rename-trace/historical เท่านั้น) |
| Prototype cleanliness | `git status --porcelain -- Prototypes/` ว่าง ✓ |
| Commit | ไม่ commit — FSP-006–026 uncommitted รอคำสั่งแยก ✓ |
