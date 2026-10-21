# FSP-012a — 01_AUTH Update Evidence (onboarding + sign up + OTP + social)

Date: 2026-10-21
Task: `89adbab5` — "FSP-012a อัปเดต 01_AUTH — onboarding + sign up + OTP + social"
Scope: `FrontOffice/01_AUTHENTICATION_MODULE.md` เท่านั้น (ไฟล์เดียว) — sync ตาม `Prototypes/fo-flow/index.html` (read-only) + sign-off FSP-005 + baseline 00_GLOBAL (FSP-010) / 00_NAV (FSP-011)
Gap source: `gap-FSP-001a-auth.md` (A1–A13, B1–B10, C1–C8, D cross-notes)
Prototype anchors verified: onboarding zone `.ob` ~22643–23100 — OB state/persist keys ~22648, `obScore`/`obEmailOk`/`OB_DEMO`/`OB_SOCIAL`/`obLoadAccount`/`obSaveAccount` ~22657–22670, `obLegalLinks`/`obSocial` ~22673–22676, `obSuggestUser`/`obSocialUser`/`obEnterAfterProfile` ~22677–22692, consent sheet ~22715–22729, legal viewer ~22734–22736, resend HTML ~22739, step renderer `obView` splash→forgot ~22744–22803, `obDraw`/`obGo`/`obMount` ~22807–22837, coach marks `OB_TOUR`/`OB_TOUR_GUEST` ~22838–22850, `obFinish`/`obLog`/`obAccept`/`obSignup`/`obSignin` ~22875–22925, session/`applySessionData`/`setSession`/`GUEST_GATE_SEL`/`obGate` ~22933–23011, `data-ob` click handler ~23012–23062, OTP input/keydown handlers ~23063–23087, dev replay/re-consent buttons ~23088–23100
Boundary: sign in detail / forgot / guest browsing / re-consent / suspended-banned = scope FSP-012b (task `902bc5c6`) — task นี้ทำเฉพาะ onboarding + sign up + OTP + profile setup + account created + social sign-up แต่ทำ rename `Global Login Required Dialog` → Member Sheet `Join TukDaeng` ทั้งไฟล์ตาม per-module rename plan (00_GLOBAL §11 note)

## 1. Sign-off decisions applied

| Decision | Applied in 01 |
| --- | --- |
| S-20 spec-only auth states | คง Out-of-scope list (Confirm Password / OTP expiry / Verification Success / Reset Password page) + อ้างใน AC-AUTH-031/033 — เนื้อหาเขียนตาม prototype |
| S-21 password policy canonical | §4, §9, §11, AC-AUTH-005 — spec = `≥8 + ตัวเลขหรือสัญลักษณ์` ตาม 00_GLOBAL §12; บันทึก prototype deviation `≥8 + score ≥2` ชัดเจนว่าไม่ใช่ spec |
| S-22 OTP→login | §4, §8, AC-AUTH-002A/037/038 — email signup ไม่ auto-login (OTP → profile → Account created → Sign in); social signup เข้าแอปทันทีหลัง profile step |
| S-29 contract-only keep | Pending Verification เป็น contract note (OTP = flow step ไม่ใช่ persistent state); analytics preamble "contract-only (D17/S-29)"; suspended/token/session rows คงเดิมรอ FSP-012b |
| D1 member sheet | rename `Global Login Required Dialog` → Member Sheet `Join TukDaeng` ทั้ง 10 hits; guest gate copy ชี้ canonical 00_GLOBAL §11 แทน copy table เก่าที่ขัด prototype (title/ปุ่ม/scrim) |
| D22 prototype artifacts | §3 + §8 — demo account `demo@tukdaeng.com`/`Tukdaeng123`, demo OTP `123456`, dev buttons `1st`/`v2`, sign-in prefill หลังสมัคร, photo-picker toast = demo-only |

## 2. What changed (section map)

| Section | Change |
| --- | --- |
| §2 Objective | + first-run onboarding, Member Sheet gateway, implied consent; canonical pointer ไป 00_GLOBAL §7/§8/§11 |
| §3 Prototype Reference | แทนที่ PNG list ด้วย fo-flow `.ob` surfaces จริง + artifacts note |
| §4 Master Alignment | + First-run onboarding / Registration tail rows; password → canonical S-21; Terms → implied consent; Login required → Member Sheet |
| §5 Scope | + onboarding chain, Member Sheet gateway, profile setup, account created; consent → implied consent |
| §6 Screen Mapping | + Splash/Language/Welcome/Privacy Notice/Cookie Settings/Notification Prompt/Track Prompt/Member Sheet (first-run + gate)/Profile Setup/Account Created; ลบ Global Login Required Dialog row → Member Sheet rows |
| §7 User States | Guest block — ตัด outdated gate copy table + forbidden list, ชี้ canonical 00_GLOBAL §11 (+ note ว่า FSP-012b sync guest scope เพิ่ม); Pending Verification + cooldown + contract note; SSO Account + auto-fill/no-password/instant-entry |
| §8 User Flow — NEW First-Run Onboarding | ตาราง 8 steps: splash (auto ~3.2s) → language → welcome (termsAt implied consent + ~1.5s loading) → privacy notice (Accept all/Reject all/Cookie settings) → cookie settings (essential always-on + toggles) → notification prompt (skippable, Continue→OS dialog) → track prompt (Ask App Not to Track→personalized off) → Member Sheet first-run (Sign up/Sign in/Skip + Don't show again + social row); + canonical refs (consent record, coach marks, gate variant) |
| §8 Email Registration | rewrite ตามจริง: `Create your account` form (email+password เท่านั้น), legal text implied consent, credential persist ก่อน OTP (`fo_account`), OTP 6 ช่อง auto-advance/backspace/auto-submit ไม่มีปุ่ม Verify, wrong→shake+`That code is incorrect. Try again.`, profile setup, `Account created` → Sign in (prefill = artifact), session `new` |
| §8 Apple/Google Registration | rewrite: provider auto-fill name/email/photo, ไม่มี password step/OTP, username suggest จาก display name, profile setup → session `new` ทันทีไม่มี Account created; returning social sign-in → `new` เงียบ ๆ |
| §9 Business Rules | Email/Password rules → OTP mechanics (auto-submit, resend 30s, no expiry, credential persist ก่อน OTP) + password canonical/deviation + meter=visual aid; + Username Rules ใหม่ (3–20 `[a-z0-9_.]`, suggestion email→`member####` / social→display name fallback email, Skip=suggested); SSO rules + auto-fill/instant/returning; Terms rules → implied consent model (required vs optional) |
| §10 Permission | Guest row → Member Sheet (gate variant — 00_GLOBAL §11) |
| §11 Validation | + Username row; OTP → auto-submit; email uniqueness + taken copy; consent → implied |
| §12 Exception | OTP ผิด → shake+copy+ล้าง; + Username ไม่ผ่าน rule; resend → cooldown 30s; email ซ้ำ → copy จริง `This email is already registered. Try signing in.` |
| §14 Notification Rules | push permission → pre-permission step skippable ใน onboarding (แก้ C7 — เดิมบอกไม่ควรถูกบังคับ ตอนนี้บันทึกว่ามี step แบบ skip ได้); dialog → Member Sheet |
| §15 Analytics | + contract-only preamble; +8 onboarding events (`auth_onboarding_started`, `auth_language_selected`, `auth_welcome_continued`, `auth_consent_responded`, `auth_notif_prompt_responded`, `auth_track_prompt_responded`, `auth_member_sheet_shown`, `auth_member_sheet_hidden`) + `auth_profile_setup_completed`, `auth_account_created_shown`; login_required event desc → Member Sheet |
| §16 ACs | reword AC-AUTH-001/005/014/022 (implied consent, canonical password, Member Sheet); +AC-AUTH-025–038 (onboarding chain once, welcome implied consent, privacy notice 3 choices, notif skippable, track-decline→personalized off, first-run member sheet + don't-show persistence, signup form fields, OTP auto-submit/shake/cooldown/no-expiry, credential persist, profile setup, username rules+suggestion, social instant entry, account created→sign in) |
| §17 Related Modules | + 00_GLOBAL, 00_NAV |

## 3. Cross-doc ref check (ก่อนปิดงาน)

| Check | Result |
| --- | --- |
| `AC-AUTH-` refs นอกไฟล์นี้ | 0 — AC-AUTH มีเฉพาะในไฟล์นี้ เพิ่ม AC-AUTH-025–038 ได้ปลอดภัย ไม่มี ref แหว่ง ✓ |
| `Global Login Required Dialog` ใน 01 | 0 (เดิม 10 hits — rename ครบ) ✓ |
| `Global Login Required Dialog` นอก 01 | 80 hits ใน 21 ไฟล์ — 00_GLOBAL×2 + 00_NAV×1 เป็น intentional alias notes; ที่เหลือ = module specs (FSP-012b/015a–024) + เอกสารกลาง/QA/DEV checklists (FSP-026) ตาม rename plan ✓ |
| `01_AUTHENTICATION` file refs | 00_GLOBAL×4 (§7 transition, §12 deviation note, scope, related) + 00_NAV related + README index + 16_INTEGRATIONS + DOCUMENT_VERSION history — ล้วน file-level refs ไม่มี section anchors แหว่ง ✓ |
| QA checklist OTP asserts | `QA-AUTH-002A` line ~230 "ปุ่ม verify ต้องไม่ active" — ขัดกับ OTP auto-submit ใหม่ → flag FSP-027 |
| `Make Offer` / offer ใน 01 | 0 ✓ (FSP-006/009 ทำไปแล้ว) |
| AC IDs | AC-AUTH-001–024 คงเดิม (reword 4 ตัว), +025–038 ท้ายตาราง — ไม่มี ID ถูกลบ/renumber ✓ |

## 4. Verification

| Check | Result |
| --- | --- |
| `git status --porcelain -- Prototypes/` | EMPTY — prototype untouched ✓ |
| ไฟล์ที่แก้ | `FrontOffice/01_AUTHENTICATION_MODULE.md` เท่านั้น (+179/−136 lines) ✓ |
| Prototype anchors | ตรวจสอบโค้ดจริงทุก step (chain order, transitions, copies, rules, persist keys) — ดู header ✓ |
| Chain order ที่ spec บันทึก | ตรง code comment + handler: splash→lang→welcome→consent→(prefs)→notif→track→member→signup→otp→profile→created/social-instant ✓ |

## 5. Flags ส่งต่อ (ไม่แก้นอก scope)

- `Global Login Required Dialog` ~80 hits นอก 01 — per-module rename (module specs → FSP-015a–024; เอกสารกลาง/QA/DEV/master/PRD/DOCUMENT_VERSION → FSP-026) — ต่อจาก FSP-011
- 01_AUTH ส่วนที่เหลือ = FSP-012b (task `902bc5c6`): sign-in detail (5-try lockout `(n/5)`, prefill artifact, session result member/new), forgot/reset, guest capabilities/account persistence, re-consent sheet, suspended/banned entry — spec บันทึก pointer ไว้ที่ §7 Guest block
- QA checklist `QA-AUTH-002A` verify-button assert + `QA-AUTH-001/002` OTP flow wording → sync ตอน FSP-027 (AC-AUTH-025–038 เป็น AC ใหม่ด้วย)
- `state.userPwd` vs `state.mockPassword` mock bug (sign-off §6) — อยู่ change-password scope → FSP-014 note
- DEV checklist guest-share items (lines ~165/173/289) → FSP-026 (รู้จาก FSP-011 flag แล้ว ยืนยันยังอยู่)
- Analytics events ชุดใหม่ (onboarding) เป็น contract — จดใน FSP-030 consistency matrix
- งานทั้งหมดยัง uncommitted รวม FSP-006–012a — รอพี่สั่ง commit แยก
