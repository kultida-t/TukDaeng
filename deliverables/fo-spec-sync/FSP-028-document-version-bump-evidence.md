# FSP-028 — DOCUMENT_VERSION Bump → FO-PRD-v1.9 Evidence

Date: 2026-10-22
Task: `2fac4268` — "FSP-028 bump DOCUMENT_VERSION → FO-PRD-v1.9 + history entry" (mission:cc291dc9)
Scope: `FrontOffice/DOCUMENT_VERSION.md` — bump current baseline `FO-PRD-v1.8` → `FO-PRD-v1.9` + เพิ่ม Version History entry สรุป sync batch FSP-006–027 + sync version reference ที่ root `README.md`
Context: FSP-027 evidence §6 flag — DOCUMENT_VERSION baseline ยัง `FO-PRD-v1.8` + historical entries มี stale terms (guest share, Notification Center, Global Login Required — เป็น version log ไม่แก้ย้อน)
Rule: canonical = locked `Prototypes/fo-flow/index.html` + master §16 Sync Decision Log (S-01–S-29) + `FSP-005-consolidated-gap-signoff.md`; historical entries v1.0–v1.8 ไม่แก้ย้อน; ห้ามแตะ `Prototypes/` เด็ดขาด

## 1. What changed (file map)

| File | Change |
| --- | --- |
| `FrontOffice/DOCUMENT_VERSION.md` | Header: `Current Baseline Version` v1.8 → **v1.9** + `Release Date` 2026-10-05 → **2026-10-22**; §2 เพิ่ม `FO-PRD-v1.9` scope paragraph (11 bullets — source-of-truth rule, removed scope, canonical replacements, feed/composer/social/chat/profile/settings/auth model, contract-only keeps, doc set changes, documented defects, residual sweep); §3 Version History เพิ่ม row `FO-PRD-v1.9` (2026-10-22) สรุป batch + key files; §4 Dev Reference Note `Version:` → v1.9 |
| `README.md` (root) | `Current Front Office baseline:` `FO-PRD-v1.2` → `FO-PRD-v1.9` — live stale ref ที่ grep เจอระหว่าง verify; ถือเป็น version-reference sync ตาม task description ("sync version references") — ไฟล์นี้คือ Start-Here pointer ของ repo |

## 2. History entry coverage (FO-PRD-v1.9 ↔ FSP batch)

| กลุ่ม | รายละเอียดใน entry | ที่มา |
| --- | --- | --- |
| Audit + sign-off | prototype = source of truth เดียว; `(contract)` convention; gap files + sign-off package | FSP-001–005 |
| Removed scope | ลบ `08_OFFER_MODULE.md` + offer refs (~1,145 hits → 0); ลบ `Figma_Gap_Checklist_Against_Master.md` + `FIGMA_UX_CLEANUP_TASK_BREAKDOWN.md` + Figma refs/sections; ตัด provenance/consignment (S-25) | FSP-006–009 |
| Canonical replacements | Member Sheet `Join TukDaeng`, Alerts feed 5 types +`system` (S-17), ตัด `Price on request`, owner `Hide` vs viewer `Not interested`, `Total invested` (S-15), `Ask Seller` sale-only, Post Viewer direct (S-08) | module rewrites + FSP-026/027 |
| Behavior model | feed post-centric (S-09), composer asset mode media≥1, Sale Record 2 ฟิลด์, chat key user+item (S-07), share member-only (S-03), like count private (S-26), profile tabs 5, blocked IG keep-page (S-13), settings 6 sections (S-05), delete login-to-restore (S-02/S-27), board magazine (S-01), drawer 9 placeholders (S-19), auth onboarding/consent + OTP→sign in (S-22) + password unify (S-21) + ตัด spec-only auth pages (S-20) | FSP-010–024 |
| Contract-only keeps | deep links, analytics, suspended/banned, network/error, HTTPS/token, file message, unavailable ref states (S-29) | ทุก rewrite |
| Doc set | module PRDs `00`–`14` rewrite + master §16 + legacy tier sync notes + QA checklist v2.0 (228 scenarios / 17 prefixes + Removed-behaviors guard table) | FSP-025–027 |
| Documented defects | `salePosts()` pfkind leak (S-10), public `all` tab leak (S-14), sold-post `FOR SALE` tag — ไม่แก้ prototype, QA บังคับ log เป็น defect | ตามที่ sign-off |
| Residual sweep | 15_TRUST L114/270, 16_INTEG L69-70, 00_GLOBAL L15 notif-type list, 17_NFR infinite scroll → FSP-029/030 | flag เดิม (ไม่เปลี่ยน) |
| Historical entries | v1.0–v1.8 เก็บเดิม — stale terms ใน entries เก่าเป็น version log ไม่แก้ย้อน (เขียนชัดใน entry ใหม่) | กติกา task |

## 3. Cross-doc grep verify (ก่อนปิดงาน)

Sweep `FO-PRD-v1\.[0-8]` ทั้ง repo — hits ที่เหลือทั้งหมดเป็น intentional:

| Location | เหตุผล |
| --- | --- |
| `FrontOffice/DOCUMENT_VERSION.md` §2/§3 (entries v1.0–v1.8) | historical version log — ไม่แก้ย้อนตาม task rule ✓ |
| `FrontOffice/DEV_BASELINE_HANDOFF_2026-06-22.md` L14/20/30 (v1.0/v1.1) | historical handoff text — header L4 mark superseded by v1.9 แล้ว (FSP-026) ✓ |
| `FrontOffice/FINAL_HANDOFF_SUMMARY.md` + `README_MODULE_INDEX.md` `หมายเหตุรอบ` rows | historical per-version notes ✓ |
| `FrontOffice/10_WATCH_ALERT_MODULE.md` L271 | อ้าง "spec เดิม (FO-PRD-v1.8) sign-off ไว้" — historical citation ✓ |
| `screenshots/user-manual/SCREEN_INVENTORY.md` comment | provenance ตอนสร้าง inventory (baseline v1.3 ณ ตอนนั้น) ✓ |
| `DailyLogs/*` | historical daily reports ✓ |
| `deliverables/fo-spec-sync/FSP-02x-*-evidence.md` | evidence records ✓ |

| Check | Result |
| --- | --- |
| Live `Current Baseline Version` ที่ไม่ใช่ v1.9 | **0** — ทุกไฟล์ที่ claim baseline ปัจจุบัน (DOCUMENT_VERSION, README_MODULE_INDEX, FINAL_HANDOFF_SUMMARY, ERROR_STATE, DEV_CHAT checklist, root README) = `FO-PRD-v1.9` หมดแล้ว |
| `git status --porcelain -- Prototypes/` | **ว่าง (0 lines)** — ไม่มีไฟล์ใน Prototypes/ ถูกแตะ ✓ |

## 4. Deviations / stale ที่ flag ต่อ (นอก scope FSP-028)

| Item | Flag ไป |
| --- | --- |
| `DOCUMENT_VERSION.md` §2 block "Baseline scope หลักยังครอบคลุม:" (ใต้ paragraph v1.1) ยังอ้าง `Module PRD 00-18` — ตอนนี้ 08 ถูกลบแล้ว | ตีเป็น historical block ตามกติกาไม่แก้ย้อน; ให้ FSP-030 consistency sweep ตัดสินว่าจะ annotate เพิ่มไหม |
| `15_TRUST_SAFETY_MODULE.md`, `16_INTEGRATIONS_MODULE.md`, `17_NON_FUNCTIONAL_REQUIREMENTS.md`, `00_GLOBAL_RULES_MODULE.md` L15 — residual stale | FSP-029/FSP-030 (flag เดิม FSP-026/027 — ไม่เปลี่ยน) |
| Documented prototype defects (`salePosts()` pfkind leak S-10, public `all` tab S-14, sold-post `FOR SALE` tag) | ไม่แก้ prototype — QA checklist บังคับ log defect |

## 5. Verification

| Check | Result |
| --- | --- |
| ไฟล์ที่แก้ | `FrontOffice/DOCUMENT_VERSION.md` (header + §2 paragraph + §3 row + §4 note) + `README.md` (root baseline ref) + evidence ไฟล์นี้ |
| Baseline bump | `FO-PRD-v1.8` → `FO-PRD-v1.9`, Release Date 2026-10-22 ✓ |
| History entry | row ใหม่สรุป FSP-006–027 ครบ (removed scope/canonical replacements/model changes/contract-only/defects/residual) ✓ |
| Historical entries | v1.0–v1.8 ไม่ถูกแตะ — stale terms คงไว้ตาม version-log rule ✓ |
| Cross-doc version refs | sweep เสร็จ — remaining v1.0–v1.8 hits = intentional historical เท่านั้น ✓ |
| Prototype cleanliness | `git status --porcelain -- Prototypes/` ว่าง ✓ |
| Commit | ไม่ commit — FSP-022–028 uncommitted รอคำสั่งแยก (FSP-001–021 ถูก commit ไปแล้วใน `4f0e0ad`) ✓ |
