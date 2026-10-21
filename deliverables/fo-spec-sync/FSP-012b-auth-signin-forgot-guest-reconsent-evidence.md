# FSP-012b — 01_AUTH Update Evidence (sign in + forgot + guest + re-consent)

Date: 2026-10-21
Task: `902bc5c6` — "FSP-012b อัปเดต 01_AUTH — sign in + forgot + guest + re-consent"
Scope: `FrontOffice/01_AUTHENTICATION_MODULE.md` เท่านั้น (ไฟล์เดียว) — sync ตาม `Prototypes/fo-flow/index.html` (read-only) + sign-off FSP-005 + baseline 00_GLOBAL (FSP-010) / 00_NAV (FSP-011)
Gap source: `gap-FSP-001a-auth.md` (A6–A8, A10, A12, B5–B7, C3, C5, C8, D cross-notes)
Boundary: ส่วน onboarding/signup/OTP/social sign-up sync แล้วใน FSP-012a (task `89adbab5`) — task นี้แตะเฉพาะ consistency fixes ในส่วนนั้น (ชี้ canonical เดิม ไม่ rewrite)
Prototype anchors verified: OB state ~22647–22651, `obScore`/`obEmailOk`/`OB_DEMO`/`OB_SOCIAL` ~22657–22664, `obLoadAccount`/`obSaveAccount` ~22666–22670, `obEnterAfterProfile` ~22686–22692, consent sheet `obConsentSheet` (re-consent variant) ~22713–22731, legal viewer ~22732–22736, obView signin/forgot cases ~22794–22803, `obGo`/`obDraw` ~22808–22837, `obFinish`/`obLog`/`obAccept` ~22875–22888, `obSignin` ~22900–22925, session/`applySessionData`/`setSession` ~22930–22995, `GUEST_GATE_SEL` ~22997–23006, `obGate` ~23007–23011, `data-ob` click handler (social returning/guest/forgot/exit) ~23012–23062, gate scrim-dismiss ~23057–23058, logout handler ~20785–20797, delete-account handler ~20893–20908, dev replay/re-consent buttons ~23088–23100

## 1. Sign-off decisions applied

| Decision | Applied in 01 |
| --- | --- |
| S-02 login-to-restore | §8 Sign In step 8 + §9 Sign In Rules + AC-AUTH-045 — บัญชีใน deletion grace sign in = restore (flow detail 13_SETTINGS) |
| S-03 share gated | Guest gate login-required list ชี้ canonical 00_GLOBAL §11 (รวม share ทุก surface) — ไม่เขียน list ซ้ำ |
| S-20 spec-only auth states | Forgot flow ย้ำไม่มี Reset Password / invalid-expired link state (นอก FO V1 screens) |
| S-22 OTP→login | เชื่อมกับ Sign In — registered account sign in → session `new` |
| S-29 contract-only keep | Suspended/Banned, auth-method check, account-status check, server lockout 15 นาที, server credential store — ทุกจุด mark contract ชัดเจน |
| D1 member sheet | gate variant copy/ปุ่ม/scrim-dismiss ชี้ canonical 00_GLOBAL §11 + layer position 00_NAV §6 — ไม่ copy ตารางมาซ้ำ |
| D22 prototype artifacts | demo account ใน credential match + dev re-consent button — mark artifact ชัดเจน |

## 2. What changed (section map)

| Section | Change |
| --- | --- |
| §2 Objective | + re-consent scope, attempt counter + lockout, credential persistence หลัง logout |
| §3 Prototype Reference | + Sign In form mechanics, Forgot flow, guest gate, re-consent, sign out→gate anchors |
| §4 Master Alignment | + Re-consent / Sign in protection / Account persistence rows |
| §5 Scope | + Sign In (attempt counter+lockout), Forgot generic sent state, guest browsing+gate, account persistence, re-consent |
| §6 Screen Mapping | + Re-Consent Sheet, Sign In Lockout rows; Sign In Error + Reset Link Sent descriptions sync ตามจริง |
| §7 Guest block | เขียน guest browsing scope จริง (ลบ TODO pointer เดิม): capabilities ชี้ §11, gate intercept ทับทุก layer, actions, scrim-dismiss, guest coach marks variant |
| §7 Suspended/Banned | + contract note (prototype ไม่มี status check — B5/C8/S-29) |
| §8 Sign In | rewrite ตามจริง: หน้า `Sign in` (back→Member Sheet), field validation copies, credential match vs persisted `fo_account` + demo artifact, `(n/5)` counter, 5-try lockout copy + disabled button (contract 15 นาที), silent entry, session member/new, deletion-grace login-to-restore, social returning |
| §8 Forgot Password | rewrite: `Reset password` + email + `Send reset link`, submit-time validation `Enter a valid email address.`, sent state `Check your email` + `If an account exists for {email}, we sent a reset link.` + `Back to sign in` — copy เปลี่ยนจาก spec เดิม `If this email exists, a reset link has been sent.` ตาม prototype |
| §8 Guest Browsing & Login Gate — NEW | gate intercept → Member Sheet ทับทุก layer ไม่นำทางออก, actions mapping, scrim/Skip dismiss ไม่ persist, auth จาก gate → session ใหม่เงียบ ๆ, bottom-nav gated, guest coach marks |
| §8 Sign Out | rewrite ตามจริง: `Log out of @{user}?` confirm → session `guest` + toast + Member Sheet gate ทันที; credential persist รอด logout; Delete Account เท่านั้นที่ล้าง |
| §8 Re-Consent — NEW | `We've updated our policies` sheet ทับ surface บังคับทุก session: required rows→legal viewer, optional toggles, Accept→record+continue, Decline→banner+Sign out/Exit app, trigger=backend version (contract) — canonical 00_GLOBAL §8 |
| §9 Sign In Rules — NEW | form rules, field validation copies, `(n/5)` counter+reset, lockout, silent entry, session result, social returning, login-to-restore, auth-method contract, Enter=submit |
| §9 Account Persistence Rules — NEW | `fo_account` persist semantics, Sign Out ลบเฉพาะ session, Delete Account ล้าง credential, session data swap ชี้ §7 |
| §9 Terms Rules | + re-consent rule ชี้ canonical §8 |
| §9 Suspended/Banned | + contract note ท้าย section |
| §10 Permission | + Guest browse capabilities row + gate scrim-dismiss note |
| §11 Validation | + Sign In email/password rows; Forgot row → submit-time validation + generic sent state |
| §12 Exception | + sign-in `(n/5)`, lockout, re-consent Decline; auth-method row → contract note; forgot SSO row → copy ใหม่ |
| §15 Analytics | + `auth_sign_in_succeeded`/`_failed`/`_locked`, `auth_gate_dismissed`, `auth_reconsent_shown`/`_accepted`/`_declined` (contract-only ตาม preamble เดิม) |
| §16 ACs | +AC-AUTH-039–052 (sign-in form/validation/counter/lockout/silent entry/session result/social returning/method+status check, forgot form+sent copy, gate overlay+dismiss, sign-out persistence, delete-account credential drop, re-consent sheet/accept/decline) |

## 3. Cross-doc ref check (ก่อนปิดงาน)

| Check | Result |
| --- | --- |
| `AC-AUTH-` refs นอกไฟล์นี้ | 0 — AC-AUTH มีเฉพาะในไฟล์นี้ เพิ่ม 039–052 ปลอดภัย ✓ |
| `Global Login Required Dialog` ใน 01 | 0 (คงจาก FSP-012a) ✓ |
| `01_AUTHENTICATION_MODULE` refs นอกไฟล์ | file-level เท่านั้น (00_GLOBAL/00_NAV related lists, README index, 16_INTEGRATIONS, DOCUMENT_VERSION history) — ไม่มี section anchors แหว่ง ✓ |
| Re-consent refs | 00_GLOBAL §8 เป็น canonical — 01 ชี้กลับถูกจุด, copy `We've updated our policies` + Decline→Sign out/Exit app ตรงกัน ✓ |
| Member Sheet refs | 00_GLOBAL §11 canonical + 00_NAV §6 layer — 01 ชี้กลับ ไม่ copy ซ้ำ ✓ |
| Old forgot copy `If this email exists, a reset link has been sent.` | เหลือ 3 จุดนอก 01: `QA_TEST_SCENARIO_CHECKLIST.md`:290 (QA-AUTH-008), `Use_Cases.md`:184, `PRD.md`:94 → flag FSP-026 (master/use-cases) + FSP-027 (QA) |
| `Make Offer` / offer ใน 01 | 0 ✓ (FSP-006/009 เคลียร์แล้ว) |
| AC IDs | 001–038 คงเดิม, +039–052 ท้ายตาราง — ไม่มี ID ถูกลบ/renumber ✓ |

## 4. Verification

| Check | Result |
| --- | --- |
| `git status --porcelain -- Prototypes/` | EMPTY — prototype untouched ✓ |
| ไฟล์ที่แก้ | `FrontOffice/01_AUTHENTICATION_MODULE.md` เท่านั้น (+ evidence file นี้) ✓ |
| Prototype anchors | ตรวจโค้ดจริงทุกจุด: signin case ~22794, `obSignin` ~22900–22925 (tries/lockout/demo+persist match/session result), forgot case ~22799–22803 + `data-ob="forgot"` handler ~23051, gate `GUEST_GATE_SEL`/`obGate`/scrim ~22997–23011/23057, consent sheet recon ~22713–22731 + `obAccept`/exit ~23023–23025, logout ~20785–20797, del-account ~20902, persist keys `fo_account`/`fo_newuser`/`fo_session` ~22666–22670/22987–22994 ✓ |
| Copies ที่เขียนลง spec | ตรง prototype verbatim: `Enter your email.`/`Enter a valid email address.`/`Enter your password.`/`Email or password is incorrect. (n/5)`/`Too many attempts. Try again in 15 minutes or reset your password.`/`Reset password`/`Send reset link`/`Check your email`/`If an account exists for {email}, we sent a reset link.`/`Back to sign in`/`We've updated our policies`/`You need to accept the required Terms and Privacy Policy to use TukDaeng. You can review them again or exit the app.` ✓ |

## 5. Flags ส่งต่อ (ไม่แก้นอก scope)

- Old forgot copy `If this email exists, a reset link has been sent.` → `Use_Cases.md`:184 + `PRD.md`:94 → **FSP-026**; `QA_TEST_SCENARIO_CHECKLIST.md`:290 QA-AUTH-008 → **FSP-027**
- `QA-AUTH-009` Reset Link Invalid/Used state — spec ตัดเป็น S-20 out-of-scope แล้ว → **FSP-027**
- `QA-SETTING-007/007A` — wording "ไป Sign In / pre-auth", dialog copy `Sign out?`/`You will need to sign in again...` ขัด prototype จริง (logout→guest feed+member sheet; `Log out of @{user}?`) → เก็บ flag ให้ FSP-014 (13_SETTINGS sync) + **FSP-027**
- Re-consent onboarding-consent sheet variant `Before you start` (obConsentSheet title ที่ไม่ใช่ recon) — dead variant ใน prototype (first-run ใช้ privacy-notice page ไม่ใช่ sheet) → spec ไม่เขียนรองรับ, จด prototype artifact ใน dead-code list รอบ FSP-030 ถ้าจำเป็น
- `Global Login Required Dialog` ~80 hits นอก 01 → per-module rename ต่อ (FSP-015a–024, เอกสารกลาง FSP-026) — ตาม FSP-011/012a flags เดิม
- Analytics events ชุดใหม่ (sign-in/re-consent/gate) เป็น contract — จดใน FSP-030 consistency matrix รวมกับ onboarding events ของ FSP-012a
- งานทั้งหมดยัง uncommitted รวม FSP-006–012b — รอพี่สั่ง commit แยก
