# FSP-010 — 00_GLOBAL Update Evidence (session model + consent + lifecycle)

Date: 2026-10-21
Task: `a3c6c6a1` — "FSP-010 อัปเดต 00_GLOBAL — session model + consent + lifecycle"
Scope: `FrontOffice/00_GLOBAL_RULES_MODULE.md` เท่านั้น (ไฟล์เดียว) — sync ตาม `Prototypes/fo-flow/index.html` (read-only) + sign-off FSP-005
Gap sources: `gap-FSP-001a-auth.md` (session/consent/guest), `gap-FSP-001b-nav.md` (session ใน nav), `gap-FSP-002a-feed-search.md` (feed post-centric)

## 1. Sign-off decisions applied

| Decision | Applied in 00_GLOBAL |
| --- | --- |
| D1 (auto) Guest gate = member sheet | §11 rewrite — Member Sheet `Join TukDaeng` (gate copy, scrim-dismiss, no Don't-show-again in gate mode) + alias note `Global Login Required Dialog` → same surface รอ per-module rename |
| S-02 delete = login-to-restore | §12 Account & Session Lifecycle — grace 30 วัน, sign in ระหว่าง grace = restore (detail อยู่ 13_SETTINGS → FSP-014) |
| S-03 share gated | §11 Login-Required Actions — Share ทุก surface อยู่ใน gate list |
| S-09 feed post-centric | §4/§10/§15/§18 — Feed = post-centric (`Sale` + `post`); `Show`/`Hide`/`Sold` หลุด feed |
| S-10 `salePosts()` leak = defect | §10 note — Search/WA match เฉพาะ `Sale`; prototype priced-post leak บันทึกเป็น defect |
| S-14 public profile filter | §10 matrix — `post` row + note public = `Sale`/`Show` เท่านั้น |
| S-16 guest feed tabs ไม่ gate | §11 Guest Capabilities — Following/Favorites กดได้ เห็น empty state |
| S-21 password policy unify | §12 Password Policy — canonical `≥8 + ตัวเลขหรือสัญลักษณ์ ≥1`; บันทึก prototype deviation (signup score≥2, chg-pwd ≥6) → FSP-012a/014 |
| S-29 contract-only keep | Deleted-asset state, offline cache, suspended/banned revoke — เก็บเป็น contract + ระบุ prototype ไม่ครอบ |

## 2. What changed (section map)

| Section | Change |
| --- | --- |
| §2 Objective | + session model, consent, guest gate ใน coverage |
| §3 Prototype Reference | onboarding sequence, member sheet, re-consent sheet, legal viewer |
| §4 Master Alignment | + Session model, Consent rows; Login required → Member Sheet; Feed visibility / Marketplace matching split (post-centric vs Sale-only match); contract annotations |
| §5 Scope | + session model, consent, guest capabilities, account/session lifecycle |
| §6 Canonical User Context | + pointer ไป §7 |
| §7 Session Model (GUEST-001) — NEW | 3 สถานะ member/guest/new + transitions + data rules + persist keys + coach marks |
| §8 Consent & Policy Versioning — NEW | required/optional model, implied consent, ATT→personalized off, re-consent sheet (accept/decline), consent log contract, legal viewer entries |
| §9 Asset Status (เดิม §7) | + kind `post` ไม่นับเป็น asset status |
| §10 Visibility Matrix (เดิม §8) | + `post` row + post-centric/defect notes |
| §11 Global State Rules (เดิม §9) | Login Required → Member Sheet + Guest Capabilities + Login-Required Actions list ตาม `GUEST_GATE_SEL`; Deleted/Error/Offline annotate prototype behavior |
| §12 Lifecycle Rules (เดิม §10) | + post↔asset transitions, Account & Session Lifecycle table, Password Policy |
| §15 Source of Truth (เดิม §13) | feed post-centric rule + member sheet rule |
| §16 Validation (เดิม §14) | + session-gate validation + consent validation |
| §17 Exception Handling (เดิม §15) | member sheet + first-run hide + re-consent decline cases |
| §18 ACs (เดิม §16) | AC-GLOBAL-002/007 updated; +AC-GLOBAL-016–020 (session, guest browse, consent, re-consent, sign out/delete) |
| §19 Related Modules | + 00_NAV, 13_SETTINGS |
| §20 Future Enhancement | + server-side consent log + policy version API |

Renumbered: เก่า §7–§18 → §9–§20 (section numbers ไม่มี cross-doc refs — ตรวจแล้วทุกไฟล์อ้างที่ชื่อไฟล์ไม่ใช่เลข section; `BackOffice/17_OPTION_MASTER_MODULE.md` ที่อ้าง `00_GLOBAL_RULES_MODULE.md` section 13 ชี้ไป BO copy ของตัวเอง ไม่ใช่ไฟล์นี้)

## 3. Cross-doc grep findings (flag ไป task ถัดไป — ไม่แก้นอก scope)

- `Global Login Required Dialog` เหลือ ~75 hits ใน 20 ไฟล์ (01/02/03/04/05/06/07/09/10/11/12/13/15/00_NAV/QA/DEV/master/PRD ฯลฯ) — alias note ไว้ใน §11; rename เป็น scope ของ FSP-012a/b, 015a–024, 026
- `00_NAV` §8 matrix + §9 rows ยังเขียน "Guest can share without Login" (4 จุด — lines ~101/114/116/119) ขัด S-03 → flag ให้ FSP-011
- `02_FEED` line ~350 + AC-FEED-008 gate Following/Favorites สำหรับ guest ขัด S-16 → flag ให้ FSP-015a
- `QA-GLOBAL-003/003F/003G` assert guest share without login ขัด S-03; `QA-GLOBAL-001` ใช้ชื่อ dialog เก่า → flag ให้ FSP-027
- Feed Sale-only claims ใน `02_FEED` (หลายจุด), `06` (~530), `11` (~54/102/283/501), `00_NAV` §7, `master`, `PRD`, `DEV_IMPLEMENTATION`, `DEV_BASELINE` → flag ให้ FSP-015a/016/022/025/026
- Consent claims เก่าใน `01` ("ต้องยอมรับก่อนสมัครทุกช่องทาง" — ตอนนี้คือ implied consent) + `15_TRUST` (Legal Consent flow/AC-TS-013) → flag ให้ FSP-012a (01) และตรวจซ้ำ FSP-030 consistency matrix
- AC-GLOBAL-016–020 เป็น AC ใหม่ — QA checklist ยังไม่มี scenario → flag ให้ FSP-027

## 4. Verification

| Check | Result |
| --- | --- |
| `git status --porcelain -- Prototypes/` | EMPTY — prototype untouched ✓ |
| ไฟล์ที่แก้ | `FrontOffice/00_GLOBAL_RULES_MODULE.md` เท่านั้น (+193/−86 lines) ✓ |
| Section cross-refs | 0 refs ไปยังเลข section ของไฟล์นี้ใน FO/BO (ตรวจ `00_GLOBAL` + `§`/`section`) ✓ |
| `Make Offer` ในไฟล์ | 0 ✓ |
| AC IDs | AC-GLOBAL-001–015 คงเดิม (002/007 wording updated), +016–020 ท้ายตาราง — ไม่มี renumber ที่ทำ ref แหว่ง ✓ |

## 5. Deliberately NOT changed (routed)

- `Global Login Required Dialog` rename ใน module specs — per-module tasks + FSP-026
- Guest share claims ใน 00_NAV/QA — FSP-011/027
- Feed Sale-only ใน 02/06/11/master/PRD/DEV — FSP-015a/022/025/026
- Consent wording ใน 01/15 — FSP-012a + FSP-030
- `system` notification type (S-17), like-count privacy (S-26) — FSP-021/022
- Delete-account flow details, change-password helper — FSP-014
- Settings > Privacy toggles UI — FSP-013
