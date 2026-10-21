# FSP-009 — Dead Features Removal + Dangling Ref Sweep (RL-04) Evidence

Date: 2026-10-21
Task: `7e4c7cdb-3bd0-4fe6-8011-79fd7c6b2094` — "FSP-009 ลบ dead features ตาม removal list + sweep refs แหว่ง"
Scope: `deliverables/fo-spec-sync/FSP-005-consolidated-gap-signoff.md` → RL-04 (spec-side dead/orphan removal + prototype-side dead-code documentation). Prototype untouched by design.

## 1. Sign-off decisions applied (spec-side removals)

| Decision | What was removed/changed | Files |
| --- | --- | --- |
| S-08 | Watch Alert Result List removed as destination — WA notification opens Asset Detail (post viewer) of matched asset directly; all tables/ACs/rules updated to say "no Result List intermediate" | `00_NAV`, `03`, `09`, `10`, `16`, `master`, `FO_Functional_PRD`, `QA`, `DEV_IMPLEMENTATION` |
| S-18 | E2E encryption / Letter Sealing / read-receipt / typing-indicator claims — 07_CHAT documents them as dead/no-impl; DEV_CHAT already lists them under Out of scope V1 | `07_CHAT_MODULE`, `DEV_CHAT_IMPLEMENTATION_CHECKLIST` |
| S-20 | Confirm Password field on Sign Up removed; OTP expiry 30-min claim removed (resend kept as contract); Verification Success page, Reset Password page, Password Updated page marked spec-only/out-of-scope — Forgot Password keeps reset-link contract only | `01_AUTHENTICATION`, `master`, `PRD`, `FO_Functional_PRD`, `Use_Cases`, `QA` (QA-AUTH-002 rewritten), `DEV_IMPLEMENTATION` |
| S-24 | Sort UI claims removed (Relevance/Price/Newest/Popularity) — spec now states V1 has no sort control; internal ordering rules (chat list, board ranking, notif sorting) kept | `03`, `master`, `PRD`, `DEV_IMPLEMENTATION`, `README_MODULE_INDEX`, `ERROR_STATE_UI_COPY_CATALOG` |
| S-25 | Provenance/Consignment entities, steps, tabs, type selection, validation, edit-confirmation copy, status-conversion warnings, and UC/QA scenarios removed. Retained: optional owner-private `Purchase Price` / `Purchase Date` (Purchase Information) used by Portfolio fallback/Gain-Loss | `04`, `05`, `06`, `14`, `02` (Edit purchase history), `master`, `PRD`, `Use_Cases` (UC-ASSET-005 rewritten, UC-ASSET-006 deleted), `QA` (QA-ASSET-002G-002L rewritten; 002S/006A/006H/008A removed), `DEV_IMPLEMENTATION`, `DEV_BASELINE` |
| S-04 | `Report article` kept as contract-only mapping to Trust & Safety `Report Board Content`; article overflow menu (`data-bdmore`/`data-bdsave`/`a.saved`/`data-bdact`) documented as dead code | `12_BOARD_MODULE` |
| S-19 | Hamburger drawer 9 items documented as future/placeholder rows (toast "Not in this prototype yet"); `Consignment Center` kept as future menu item only | `00_NAV`, `README_MODULE_INDEX`, `FINAL_HANDOFF` |
| Read-receipts/typing/E2E | `07_CHAT` marks read mark as mock visual, lists typing/read-receipt/E2E under non-V1/dead claims | `07_CHAT_MODULE` |

## 2. Prototype-side dead code documented (not implemented — spec-side notes added)

- `.set-btn` dead handler — settings entry = `.pf-menu` only → `06_PROFILE_MODULE`
- `chsettings:` route unreachable; `.chat-pop`/`.cp-*` + `chat-fab` (`ask:"bubble"`) unreachable → `07_CHAT_MODULE`
- Article menu dead group → `12_BOARD_MODULE`
- `delAccountDlgHTML` / `data-dlg="del-account"` / `.dlg-delaccount-go` legacy dialog variant → `13_SETTINGS_MODULE`
- `pf-msg`/`pf-uname`/`pf-note`/`pf-sleep`/`pf-atch`/avatar-overlay QR/`pe-pic` dead toasts → `06_PROFILE_MODULE` (+ `pf-msg` in `07_CHAT`)
- Drawer 9 dead items → `00_NAV` (as placeholder rows per S-19)
- `lk-follow` visual-only (no `setFollowing` sync) → `02_FEED_MODULE` + `PRD` feed card note
- Design variants (`a2/b2/c2/a3/b3/c3/mixed` cards, `ft:"none"` brand menu, `data-nav` icon variants) + dev tooling (`?dev`, `PFO_SIMS`, `POST_DETAIL_CFG`, demo OTP) → `00_NAV` prototype-only artifacts note

## 3. Cross-doc ref sweep

- Owner quick action menus: `Edit provenance` → `Edit purchase history` everywhere (master, 06, QA-FEED-011A, QA-PROFILE-002A/002B); viewer exclusion lists no longer name `Edit provenance`; Sold owner menu = `View sale history` (aligned master ↔ 06 ↔ QA)
- Notification destination tables aligned: `00_NAV` §table, `09`, `10`, `16`, `master`, `FO_Functional_PRD`, `QA-NOTI-003`, `DEV_IMPLEMENTATION` §8/§9
- UC-ASSET-006 (Consignment) deleted; UC-ASSET-005 rewritten as Purchase Information; UC-ASSET-001 step 9 updated; no dangling references to UC-ASSET-006 remain
- Private-data rules narrowed: `00_GLOBAL`/`04`/`05`/`06`/`master`/`PRD`/QA-GLOBAL-004/DEV_BASELINE — viewer excludes Purchase Price/Date + Sale History + Portfolio detail; no provenance/consignment data exists to leak
- `README_MODULE_INDEX` search-module summary no longer claims `sort`
- `ERROR_STATE_UI_COPY_CATALOG` §7 renamed "Search / Result States"; retry copy no longer mentions sort
- `DEV_BASELINE_HANDOFF_2026-06-22` private-data line narrowed; "Consignment-specific workflow" open item removed (resolved by S-25)

## 4. Verification results

| Check | Result |
| --- | --- |
| `git status --porcelain -- Prototypes/` | EMPTY — prototype untouched ✓ |
| `Offer|ข้อเสนอ` in FrontOffice/ | 0 matches ✓ |
| `figma` (i) in FrontOffice/ | 0 live refs — remaining hits are all `DOCUMENT_VERSION.md` changelog history + `README_MODULE_INDEX`/`FINAL_HANDOFF` retrospective notes (history not rewritten, same rule as FSP-008) ✓ |
| `Provenance|Consignment|Purchase From|Consignor` | 0 active-feature claims — remaining hits are explicit "ไม่มี entity นี้ใน V1 / ตัดตาม S-25" annotations or `Consignment Center` future-menu placeholder ✓ |
| `Result List` | Remaining only in "ไม่มี Result List" annotations + `12` "View Article Result List" (board article view — unrelated name, kept) ✓ |
| `Popular Filter/Selection/Model` | 0 active claims — only removed-notes ✓ |
| `Sort` UI claims | 0 — remaining = "ไม่มี Sort UI" notes + internal ordering rules (chat/board/notif) + future-enhancement rows ✓ |
| `Confirm Password` | 0 active (Sign Up); Change Password's Confirm new password retained (not in S-20 scope) ✓ |
| `Reset Password` page / `Verification Success` / OTP expiry 30min | 0 active claims — annotated spec-only/S-20 ✓ |
| `Typing|Read receipt|E2E|Letter Sealing` | Only dead-code/out-of-scope annotations ✓ |
| Deleted UC/QA ids dangling | 0 references to `UC-ASSET-006`, `QA-ASSET-002I/002K/002L` (blocks removed inline) ✓ |
| `system` notification type | 0 mentions in spec — S-17 decided KEEP as future type (has real seed); adding it is FSP-021 scope, no removal needed ✓ |

## 5. Deliberately NOT changed (routed to other FSPs / out of RL-04)

- S-26 Like count privacy (public → private) — spec still claims public like count; assigned FSP-022 (social rewrite). Flagged here so FSP-022 knows the claims live in `11_SOCIAL` (feed card like count, `Liked by` list), `05_ASSET_DETAIL` (AC-DETAIL-017A/B), `master` L531/536, `PRD` L104, `DEV_IMPLEMENTATION` L61, `QA` L831.
- S-12 comment composer contract (view-only mock) — FSP-022.
- S-02/S-27 delete-account grace-period semantics + 2-page flow — FSP-014 (spec 13 still describes single-dialog + login-blocked model).
- S-28 change-password in-settings page + 6-char helper — FSP-014.
- S-11 WA details (auto-name, instant delete, name+mode-only edit) — FSP-021 (spec 10 still says alert name required + delete confirm).
- S-10 `salePosts()` pfkind leak — flag-only; FSP-016/021/024.
- S-23 Recent Search in-scope rewrite — FSP-016.
- S-05/S-06 settings structure + notif preferences — FSP-013.
- S-01 board magazine model — FSP-023; S-13/S-14 profile/blocked/privacy — FSP-019; S-15 portfolio headline — FSP-024; S-16 guest tabs — FSP-015a; S-17 system type — FSP-021; S-21/S-22 password policy + OTP→sign-in — FSP-010/012a/014.
- Sale Record fields (Buyer/Contact/Payment Method/Attachment/`Proof of Payment` in sale record) — prototype sold form lacks these (gap 003a A11/C7) but NO S-decision covers them; left as spec + flagged for FSP-024/owner decision.
- `DOCUMENT_VERSION.md` — changelog history, not rewritten (same rule as FSP-008 figma sweep).
- `PRD` line ~215 Sale History fields — kept (same reason as Sale Record above).

## 6. Files changed in this pass (RL-04)

`00_NAVIGATION_AND_CROSS_MODULE_FLOW`, `01_AUTHENTICATION_MODULE`, `02_FEED_MODULE`, `03_SEARCH_FILTER_MODULE`, `04_ASSET_MANAGEMENT_MODULE`, `05_ASSET_DETAIL_MODULE`, `06_PROFILE_MODULE`, `07_CHAT_MODULE`, `09_NOTIFICATION_MODULE`, `10_WATCH_ALERT_MODULE`, `12_BOARD_MODULE`, `13_SETTINGS_MODULE`, `14_PORTFOLIO_MODULE`, `16_INTEGRATIONS_MODULE`, `TukDaeng_Master_Product_Definition`, `PRD`, `FO_Functional_PRD`, `Use_Cases`, `QA_TEST_SCENARIO_CHECKLIST`, `DEV_IMPLEMENTATION_CHECKLIST`, `DEV_BASELINE_HANDOFF_2026-06-22`, `ERROR_STATE_UI_COPY_CATALOG`, `README_MODULE_INDEX`

(00_GLOBAL_RULES, 11_SOCIAL, 15_TRUST_SAFETY, 17_NFR, 18_ADMIN_SCOPE, DOCUMENT_VERSION, FINAL_HANDOFF verified — no RL-04 changes needed beyond prior FSP passes.)

## 7. Misc cleanup

- Removed stray zero-byte `nul` file at repo root (artifact of a `>nul` redirect in git-bash, untracked).
