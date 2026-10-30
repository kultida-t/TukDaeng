# 01 Authentication Module

อ้างอิงหลักจาก [TukDaeng_Master_Product_Definition.md](TukDaeng_Master_Product_Definition.md)

---

# 1. Document Information

| Field | Detail |
| --- | --- |
| Module Name | Authentication |
| Platform | Mobile Application |
| Version | V1 |
| Status | Draft |
| Owner | Product / UX / Engineering |
| Document Type | Functional PRD - Master Aligned |

# 2. Objective

Authentication Module ใช้สำหรับ first-run onboarding, สมัครสมาชิก, เข้าสู่ระบบ, ยืนยัน OTP, ตั้งค่า profile เริ่มต้น, กู้รหัสผ่าน, เปลี่ยนรหัสผ่าน, ออกจากระบบ และ re-consent เมื่อ Terms of Use / Privacy Policy เปลี่ยน version โดยต้องรองรับ Email / Password, Sign in / Sign up with Apple และ Sign in / Sign up with Google ตาม master baseline

โมดูลนี้ต้องทำให้ Guest เปลี่ยนเป็น Member ได้อย่างถูกต้องผ่าน Member Sheet `Join TukDaeng` เป็น gateway เดียว ป้องกัน account duplication, ใช้ implied consent กับ Terms of Use และ Privacy Policy (legal text กำกับ action ไม่มี checkbox), จำกัดความพยายาม Sign In ผิดพลาดด้วย attempt counter + lockout, รักษา credential ที่สมัครให้ sign in กลับได้หลัง logout และจัดการบัญชี Suspended/Banned ให้เห็นเหตุผลพร้อมช่องทางติดต่อ Support

Session model (`member` / `guest` / `new`), consent model, Member Sheet definition และ login-required action list เป็น canonical ของ [00_GLOBAL_RULES_MODULE.md](00_GLOBAL_RULES_MODULE.md) §7/§8/§11 — เอกสารนี้อธิบายเฉพาะ auth flow ที่ผลิต session เหล่านั้น

# 3. Prototype Reference

Source of truth สำหรับพฤติกรรม auth: `Prototypes/fo-flow/index.html` (first-run onboarding zone `.ob`)

- First-run onboarding chain — splash → language → welcome → privacy notice → privacy settings → notification prompt → track prompt → Member Sheet gateway
- Sign Up — Email + Password + strength meter + social buttons
- Email OTP — 6-digit auto-submit boxes + resend cooldown
- Profile setup — avatar + username suggestion
- Account created — sign-in handoff (email signup ไม่ auto-login)
- Member Sheet `Join TukDaeng` — first-run variant + guest gate variant (canonical ที่ 00_GLOBAL §11)
- Sign In — email/password form + attempt counter + 5-try lockout + `Forgot password?` / `New here?` links + social row
- Forgot Password — หน้า `Reset password` (email) → `Check your email` generic sent state
- Guest gate — action ที่ต้องมีตัวตนเปิด Member Sheet gate variant ทับทุก layer (scrim-dismiss)
- Re-consent — consent sheet `We've updated our policies` เมื่อ policy version bump (canonical 00_GLOBAL §8; prototype ใช้ dev button จำลอง)
- Sign out → session `guest` + Member Sheet gate ทันที — credential `fo_account` persist สำหรับ sign in กลับ
- Prototype artifacts (demo account, demo OTP `123456`, dev replay/re-consent buttons, photo-picker toast) — demo-only ไม่ใช่ production requirement

# 4. Master Alignment Summary

| Area | Master Baseline |
| --- | --- |
| Supported auth methods | Sign Up, Email OTP Verification, Profile setup, Sign In, Forgot Password, Change Password, Sign Out, Apple, Google |
| First-run onboarding | แสดงครั้งเดียวก่อนเข้าแอป: splash → language → welcome → privacy notice → notification/track prompts → Member Sheet `Join TukDaeng` gateway |
| Email / Password verification | Email / Password ต้องยืนยัน OTP 6 หลัก (auto-submit) |
| Registration tail | Email signup ไม่ auto-login — OTP → profile setup → `Account created` → Sign in เอง (S-22); Social signup เข้าแอปทันทีหลัง profile step |
| Password policy | Password อย่างน้อย 8 ตัวอักษร และต้องมีตัวเลขหรือสัญลักษณ์ (canonical S-21 — 00_GLOBAL §12) |
| Email uniqueness | 1 Email สมัครได้ 1 บัญชีเท่านั้น |
| SSO verification | SSO Email ไม่ต้องยืนยัน OTP และไม่มี password step — provider auto-fill name/email/photo |
| Email immutability | Email ไม่สามารถเปลี่ยนได้หลังยืนยันแล้ว |
| Auth method separation | บัญชี SSO ไม่สามารถ Sign In ด้วย Email / Password ได้ และกลับกัน |
| Suspended / Banned account | บัญชี Suspended/Banned ต้องเห็น account status state พร้อมเหตุผล ระยะเวลาถ้ามี และช่องทางติดต่อ Support |
| Terms / Privacy | Implied consent — การกด Continue/Create account พร้อม legal text ถือเป็นยอมรับ (canonical 00_GLOBAL §8) — ไม่มี checkbox |
| Re-consent | Policy version bump → re-consent sheet `We've updated our policies` บังคับทุก session (canonical 00_GLOBAL §8) |
| Sign in protection | Attempt counter + 5-try lockout (contract: server lockout 15 นาที) |
| Account persistence | Credential ที่สมัครรอด logout/restart เพื่อ sign in กลับ — Delete Account เท่านั้นที่ล้าง |
| Login required | Guest ใช้ feature ที่ต้อง Login ต้องเห็น Member Sheet `Join TukDaeng` (canonical 00_GLOBAL §11) |
| Security | ทุก API ใช้ HTTPS และใช้ Token-based Authentication |

# 5. Scope

## In Scope

- First-run onboarding chain (splash / language / welcome / privacy notice / cookie settings / notification prompt / track prompt)
- Member Sheet `Join TukDaeng` เป็น auth gateway (first-run variant; guest gate variant canonical ที่ 00_GLOBAL §11)
- Sign Up ด้วย Email / Password
- OTP Verification สำหรับ Email / Password
- Profile setup step (avatar + username) หลัง OTP / social sign-up
- Account created handoff กลับ Sign In (email signup)
- Sign In ด้วย Email / Password (attempt counter + 5-try lockout)
- Sign in / Sign up with Apple
- Sign in / Sign up with Google
- Forgot Password → generic Reset Link Sent state (ไม่เปิดเผย account existence / auth method)
- Guest browsing + login-required gate (Member Sheet gate variant ทับทุก layer)
- Account persistence — credential ที่สมัครรอด logout / restart เพื่อ sign in กลับ
- Re-consent เมื่อ Terms of Use / Privacy Policy version bump (canonical 00_GLOBAL §8)
- Change Password
- Sign Out
- Suspended Account handling
- Terms of Use และ Privacy Policy implied consent ก่อน/ระหว่างสมัคร

## Out Of Scope

- Two-Factor Authentication (2FA)
- Passkey
- Biometric Login
- Account Linking
- Account Merge
- Device Management
- Watch Authentication Service ในแอป
- Admin user management
- Delete Account flow ซึ่งอยู่ใน Settings Module
- Reset Password page ในแอป — spec-only UI state (S-20); การตั้งรหัสผ่านใหม่ผ่าน reset link อยู่นอก FO V1 screens
- Verification Success page — spec-only UI state (S-20); OTP สำเร็จแล้วไปตาม flow โดยไม่มีหน้าแยก
- Confirm Password field บนหน้า Sign Up — spec-only UI state (S-20)
- OTP expiry UI state (OTP Expired page) — spec-only UI state (S-20)

# 6. Screen Mapping

| Screen / State | Description |
| --- | --- |
| Splash | หน้าเปิดแอปครั้งแรก — logo + loading แล้ว auto-advance |
| Language Selection | เลือกภาษา English/ไทย ก่อนเข้าแอปครั้งแรก |
| Welcome | intro + legal links + implied-consent fine print |
| Privacy Notice | consent หลัก — essential vs optional (analytics / personalization) |
| Cookie Settings | เลือก optional consent ทีละตัว |
| Notification Prompt | pre-permission skippable + OS dialog |
| Track Prompt | ATT-style prompt — ปฏิเสธแล้ว personalization ต้อง off |
| Member Sheet (first-run) | auth gateway `Join TukDaeng` + Don't show this again |
| Member Sheet (gate) | guest gate variant — canonical 00_GLOBAL §11 |
| Re-Consent Sheet | `We've updated our policies` — required rows + optional toggles บังคับทุก session (canonical 00_GLOBAL §8) |
| Sign Up | สมัครด้วย Email / Password + legal text implied consent |
| OTP Verification | กรอก OTP 6 หลัก auto-submit หลังสมัครด้วย Email / Password |
| Profile Setup | ตั้ง avatar + username หลัง OTP หรือ social sign-up |
| Account Created | ยืนยันสร้างบัญชีแล้วพาไป Sign In (email signup เท่านั้น) |
| Sign In | เข้าระบบด้วย Email / Password, Apple, Google |
| Sign In Error | Email/password ผิด (attempt counter), account ไม่ตรง auth method, หรือ account unavailable |
| Sign In Lockout | ผิดครบ 5 ครั้ง — lockout banner + ปุ่ม Sign in disabled |
| Suspended Account | แสดงเหตุผล suspension และช่องทางติดต่อ Support |
| Forgot Password | ขอ reset password ด้วย Email |
| Reset Link Sent | `Check your email` — generic confirmation ไม่เปิดเผย account existence |
| Change Password | เปลี่ยนรหัสผ่านจากสถานะ Login แล้ว |
| Change Password Validation Error | current password ผิด, new password ไม่ผ่าน policy, new password ซ้ำ current password หรือ confirm ไม่ตรง |
| Change Password API Error | เปลี่ยน password ไม่สำเร็จจาก network/server error |
| Sign Out Confirmation | ยืนยันออกจากระบบ |

# 7. User States

## Guest / Unauthenticated

Guest สามารถ:

- เปิด Sign In
- เปิด Sign Up
- เปิด Forgot Password
- เปิด Terms of Use
- เปิด Privacy Policy
- ดู public surfaces ตามสิทธิ์ของ Guest

Guest browse public surfaces ได้เสรี (feed + feed tabs, search, boards/articles, post detail/viewer, public profile, legal viewer — รายการเต็มที่ 00_GLOBAL §11 Guest Capabilities) โดยไม่มีข้อมูลส่วนตัวใด ๆ บน surface

เมื่อ Guest ใช้ action ที่ต้องมีตัวตน (login-required action list — canonical 00_GLOBAL §11) ต้องแสดง Member Sheet `Join TukDaeng` gate variant ทับ surface ปัจจุบันโดยไม่นำทางออก — sheet อยู่เหนือทุก navigation layer (00_NAV §6); sheet definition, copy, actions และ dismiss behavior เต็มอยู่ที่ [00_GLOBAL_RULES_MODULE.md](00_GLOBAL_RULES_MODULE.md) §11:

- `Sign up` → Registration; `Sign in` → Sign In; social row → Social Registration / Sign-In
- `Skip for now` หรือแตะ scrim → ปิด sheet กลับไป browse ต่อเป็น guest (ไม่จำ choice — เปิดใหม่ทุกครั้งที่ guest กด gated action)
- Guest มี coach marks variant ของตัวเอง (nudge sign-up แทน member actions — canonical 00_GLOBAL §7 Coach Marks)

Auth page และปุ่มใน flow สมัครสมาชิกใช้ label `Sign up` ตามปกติ — Member Sheet ใช้ `Sign up` เป็น primary และ `Sign in` เป็น secondary ตาม canonical copy ที่ 00_GLOBAL §11

## Pending Verification

ผู้ใช้ที่สมัครด้วย Email / Password แล้วแต่ยังไม่ยืนยัน OTP:

- ต้องกรอก OTP เพื่อยืนยัน Email
- ขอ resend OTP ได้ (cooldown 30 วินาทีต่อครั้ง)
- ไม่ควรเข้าใช้งาน authenticated feature ก่อน verification สำเร็จ

หมายเหตุ: OTP เป็น step ภายใน registration flow ไม่ใช่ persistent user state — production อาจ block sign in จนกว่า email จะ verified ตาม server policy (contract — prototype ไม่ครอบ; credential ที่สมัคร persist ไว้ก่อน OTP อยู่แล้ว)

## Authenticated Member

ผู้ใช้ที่ยืนยันตัวตนสำเร็จสามารถใช้งานระบบตามสิทธิ์ Member และสามารถ Sign Out หรือ Change Password ได้ตาม auth method ที่รองรับ

## Suspended / Banned User

บัญชี Suspended หรือ Banned ต้องไม่เข้าสู่ระบบเข้า main app ได้ และต้องเห็น:

- account status state ว่าบัญชีถูกระงับชั่วคราวหรือถาวร
- เหตุผลการระงับ
- วันที่สิ้นสุด ถ้าเป็น temporary suspension และมีข้อมูล
- ช่องทางติดต่อ Support

หากผู้ใช้มี session ค้างอยู่ตอน BO เปลี่ยนสถานะเป็น `Suspended` หรือ `Banned` ระบบต้อง revoke/block session และพาผู้ใช้ออกจาก authenticated app state ไปยัง account status state

(contract — prototype ไม่มี account-status check ที่ Sign In เลย ตรวจแค่ credential match; state นี้เป็น spec contract สำหรับ production ตาม S-29)

## SSO Account

บัญชีที่สมัครด้วย Apple หรือ Google:

- ไม่ต้องยืนยัน OTP และไม่มี password step
- Provider auto-fill name / email / photo ให้ — photo จาก provider กลายเป็น avatar เริ่มต้นของบัญชี
- ยอมรับ Terms of Use และ Privacy Policy ผ่าน implied consent (legal text บน auth surfaces — 00_GLOBAL §8)
- ผ่าน profile setup step เหมือน email signup แล้วเข้าใช้งานทันทีเป็น session `new` — ไม่มี OTP ไม่มีหน้า Account created
- ต้องใช้ SSO provider เดิมในการ Sign In
- ไม่สามารถ Sign In ด้วย Email / Password ได้

# 8. User Flow

## First-Run Onboarding

Onboarding แสดงครั้งเดียวตอนเปิดแอปครั้งแรก (persist `fo_onboarded`) — ลำดับบังคับ:

| # | Step | Content | Action → Next |
| --- | --- | --- | --- |
| 1 | Splash | Logo + name + loading bar | auto-advance ~3.2s → Language |
| 2 | Language | `Select your language` — rows English/ไทย (check mark บนตัวที่เลือก) | Continue → Welcome (ภาษาเปลี่ยนได้ภายหลังที่ Settings) |
| 3 | Welcome | `Welcome to the TukDaeng app` + tagline + Terms/Privacy links + fine print `By tapping Continue you agree to the Terms of Use and acknowledge the Privacy Policy.` | Continue → บันทึก `termsAt` (implied required consent) + loading ~1.5s → Privacy Notice |
| 4 | Privacy Notice | `Privacy notice` — อธิบายการเก็บข้อมูลบางส่วนบนอุปกรณ์และเซิร์ฟเวอร์ + ประโยค "เราไม่ติดตามกิจกรรมในแอปหรือเว็บไซต์ของบริษัทอื่น และไม่แชร์ข้อมูลให้ผู้ลงโฆษณาหรือ data broker" + essential (จำเป็น) vs optional (analytics, personalization) | `Accept all` (optional on ทั้งคู่) / `Reject all` (optional off ทั้งคู่) / `Privacy settings` (ตั้งค่าความเป็นส่วนตัว) → step 5 — ทุกทางบันทึก consent record แล้วไป step 6 |
| 5 | Privacy Settings | Essential `Always on` + toggles Analytics / Personalization | `Save preferences` → บันทึก consent record → step 6 |
| 6 | Notification Prompt | `Never miss an update` pre-permission | `Continue` → OS dialog `…Would Like to Send You Notifications` (Allow / Don't Allow) → step 7; `Skip` → step 7 โดยไม่ถาม OS |
| 7 | Track Prompt | `We suggest news that suits you` (ATT-style) | `Continue` → OS dialog `Allow … to track your activity…` — `Ask App Not to Track` ต้องบังคับ personalization = off → step 8 |
| 8 | Member Sheet (first-run) | `Join TukDaeng` + `Create a free account to follow collectors, chat and list your watches.` + checkbox `Don't show this again` | `Sign up` → Email Registration; `Sign in` → Sign In; `Skip for now` → session `guest` (ถ้าติ๊ก hide → persist `fo_member_hide`, run ถัดไปข้าม sheet); social row → Social Registration |

- Consent model, consent record fields และ re-consent เป็น canonical ของ 00_GLOBAL §8 — onboarding เป็นจุดที่สร้าง consent record แรก
- หลัง onboarding จบต้องแสดง coach marks ครั้งเดียว (member/guest variant — canonical 00_GLOBAL §7 Coach Marks)
- Member Sheet ตัวเดียวกันนี้ใช้เป็น guest gate ระหว่างใช้งาน (gate variant: copy `Sign in or create a free account to use this feature.`, ไม่มี Don't show checkbox, scrim-dismiss ได้ — 00_GLOBAL §11)

## Email Registration

1. User เปิด Sign Up (จาก Member Sheet หรือ `New here? Create account` บน Sign In) — หน้า `Create your account`
2. User กรอก Email, Password (password มีปุ่ม show/hide + strength meter 4 แถบ + hint)
3. Legal text ใต้ปุ่ม `Create account` = implied consent (ไม่มี checkbox — 00_GLOBAL §8)
4. ระบบตรวจ email format + email uniqueness + password policy
5. ระบบบันทึก credential ของบัญชีแล้วส่ง OTP 6 หลักไป email (prototype persist `fo_account` ทันทีก่อน OTP)
6. หน้า `Verify your email` — ช่อง OTP 6 ช่อง auto-advance, backspace ย้อนช่อง, auto-submit เมื่อครบ 6 หลัก (ไม่มีปุ่ม Verify)
7. OTP ถูก → Profile Setup; OTP ผิด → shake + `That code is incorrect. Try again.` + ล้างช่องให้กรอกใหม่
8. Profile Setup — `Set up your profile`: avatar + `Add photo`, ช่อง Username (suggest อัตโนมัติ), `Skip for now` (ใช้ suggested username), Continue
9. หน้า `Account created` — `Welcome, {name}. Sign in to start exploring.` → ปุ่ม `Sign in` → กลับ Sign In (prefill email ที่เพิ่งสมัครเท่านั้น password ว่าง — canonical lock 2026-10-29)
10. User sign in สำเร็จ → session `new` — email signup **ไม่ auto-login** (S-22)

## Apple / Google Registration

1. User เลือก `Continue with Google` / `Continue with Apple` (บน Sign Up / Member Sheet / Sign In)
2. Provider ส่ง name + email + photo กลับมา → auto-fill profile fields (ไม่มี password step)
3. ระบบตรวจว่า email ยังไม่ผูกกับบัญชีแบบอื่น + implied consent ตาม legal text
4. Profile Setup — username suggest จาก display name ของ provider ก่อน แล้ว fallback email-based; avatar = photo จาก provider
5. ระบบสร้างบัญชีแล้วเข้าใช้งานทันทีเป็น session `new` — ไม่มี OTP และไม่มีหน้า Account created (S-22)
6. Social sign-in ของ returning user (provider ตรงกับบัญชีที่ persist) → กลับเข้า session `new` เงียบ ๆ ไม่ผ่าน profile step (รายละเอียด 00_GLOBAL §7 Session Transitions)

## Sign In

1. User เปิด Sign In (จาก Member Sheet `Sign in` หรือหน้า Account created) — หน้า `Sign in` + `Welcome back to TukDaeng.` (back → Member Sheet)
2. User กรอก Email + Password (password มีปุ่ม show/hide) — submit ด้วยปุ่ม `Sign in` หรือ Enter
3. ระบบ validate field ก่อน credential check: email ว่าง → `Enter your email.`; email format ผิด → `Enter a valid email address.`; password ว่าง → `Enter your password.`
4. ระบบตรวจ credential กับบัญชีที่จดจำ (prototype: demo member account — artifact — + credential ที่สมัคร persist ใน `fo_account`; production: server-side credential store)
5. Credential ไม่ตรง → form-level banner `Email or password is incorrect.` — counter นับความพยายามผิดต่อเนื่อง; ครบ 5 ครั้ง → lockout `Please try again in {X min Y sec} or choose Forgot password.` (TH `กรุณาลองใหม่ในอีก {X นาที Y วินาที} หรือเลือกลืมรหัสผ่าน`; นับแยกตามอีเมล, ข้อความเดียวกันทุกอีเมล, นับถอยหลังทุกวินาที) + ปุ่ม Sign in disabled (contract: lockout 15 นาทีที่ server — prototype มี timer 15 นาทีและปลดเองเมื่อครบ — RESOLVED 2026-10-29)
6. Credential ตรง → ตรวจ auth method + account status ก่อนออก session (`Active` / `Suspended` / `Banned` / deletion-grace — contract, prototype ไม่ครอบ) — ผ่าน → เข้าแอปเงียบ ๆ ไม่มี welcome-back toast
7. Session result ตามบัญชี (canonical 00_GLOBAL §7 Session Transitions): returning member ที่มีข้อมูล → `member`; บัญชีที่สมัครใหม่ (ยังไม่มีข้อมูลของตัวเอง) → `new`
8. บัญชีที่อยู่ช่วง deletion grace period แล้ว sign in สำเร็จ = login-to-restore (ยกเลิก deletion — S-02, flow detail อยู่ที่ 13_SETTINGS)

ลิงก์บนหน้า Sign In: `Forgot password?` → Forgot Password; `New here? Create account` → Sign Up; social row `Continue with Google/Apple` → Social Sign-In (returning ที่ provider ตรง persisted account → session `new` เงียบ ๆ ไม่ผ่าน Profile Setup — canonical 00_GLOBAL §7)

## Forgot Password

1. User เปิด `Forgot password?` จาก Sign In — หน้า `Reset password` + `Enter your email and we'll send you a reset link.` (back → Sign In)
2. User กรอก Email → `Send reset link` — validate ตอน submit: email format ผิด → field error `Enter a valid email address.`
3. ระบบแสดง sent state `Check your email` + `If an account exists for {email}, we sent a reset link.` + ปุ่ม `Back to sign in` — ข้อความเดียวกันทุกกรณี (email ไม่มีบัญชี / SSO-only account) เพื่อไม่เปิดเผย account existence หรือ auth method
4. ระบบส่ง reset link เฉพาะบัญชี Email / Password ที่มีอยู่จริง (contract — prototype แสดง sent state เสมอ)

การตั้งรหัสผ่านใหม่ผ่าน reset link อยู่นอกขอบเขต FO V1 screens — ไม่มีหน้า Reset Password / Password Updated / invalid-expired link state ในแอป (S-20)

## Guest Browsing & Login Gate

- Guest (session `guest`) browse public surfaces ได้ตาม Guest Capabilities — canonical list อยู่ที่ 00_GLOBAL §11 (feed + tabs, search, boards, post detail/viewer, public profile, legal viewer)
- Guest แตะ action ใดใน login-required list (canonical 00_GLOBAL §11) → ระบบ intercept → เปิด Member Sheet `Join TukDaeng` gate variant ทับ surface เดิมโดยไม่นำทางออก (sheet เหนือทุก layer — 00_NAV §6)
- Gate sheet มี `Sign up` / `Sign in` / `Skip for now` + social row — `Sign up` → Registration, `Sign in` → Sign In, social → Social flow
- scrim tap หรือ `Skip for now` → ปิด sheet กลับไป browse ต่อเป็น guest — ไม่ persist การเลือก เปิดใหม่ทุกครั้ง (checkbox `Don't show this again` มีเฉพาะ first-run variant)
- สมัคร/เข้าสู่ระบบสำเร็จจาก gate → session ใหม่ตามบัญชี + กลับใช้งานต่อเงียบ ๆ (ไม่มี welcome toast)
- Bottom-nav tabs Chat / Alerts / Profile เป็น login-required เช่นเดียวกัน (00_NAV §6); guest coach marks variant nudge sign-up แทน member actions (00_GLOBAL §7)

## Sign Out

1. Authenticated Member กด Sign Out (entry อยู่ที่ Settings — UI detail 13_SETTINGS) → confirmation `Log out of @{user}?`
2. User ยืนยัน → ระบบ clear session → session `guest` บน feed (เคลียร์ข้อมูลส่วนตัวทุก surface ตาม Session Data Rules — 00_GLOBAL §7) + toast `Logged out successfully`
3. Member Sheet `Join TukDaeng` gate variant แสดงทันทีหลัง sign out เพื่อให้ sign in กลับได้ในจังหวะเดียว — scrim/`Skip for now` ปิดแล้ว browse ต่อเป็น guest
4. Credential ของบัญชีที่สมัครยัง persist (prototype `fo_account` — Account Persistence Rules §9) — sign in กลับด้วยบัญชีเดิมได้หลัง logout/restart; Delete Account สำเร็จเท่านั้นที่ล้าง credential (00_GLOBAL §12 — flow 13_SETTINGS)

## Change Password

1. Authenticated Member เปิด Change Password
2. User กรอก current password
3. User กรอก new password และ confirm password
4. ระบบ validate current password และ password policy
5. ระบบเปลี่ยน password สำเร็จ

Change Password form fields:

- `Current password`
- `New password`
- `Confirm new password`

Helper text under `New password`:

- `At least 8 characters, with a number or symbol.`

Submit button:

- Label: `Change password`
- Disabled until all required fields are filled and client-side validation passes

Change Password success:

- Show `Password changed`
- User may stay signed in
- After success, route back to Settings or show success feedback and allow user to return to Settings

## Re-Consent (Policy Version Bump)

เมื่อ Terms of Use หรือ Privacy Policy เปลี่ยน version ต้องแสดง consent sheet แบบ re-consent `We've updated our policies` ทับ surface ที่กำลังใช้งานก่อนทำอย่างอื่นต่อ — บังคับทุก session (canonical rules ที่ 00_GLOBAL §8 Re-consent):

1. Sheet แสดง required rows `Terms of Use v{version}` / `Privacy Policy v{version}` — แตะเปิด legal viewer อ่านได้ — + optional toggles Analytics / Personalized ตามค่าปัจจุบัน
2. `Accept & continue` → บันทึก consent record ใหม่ (implied consent — ไม่มี checkbox) → ใช้งานต่อ
3. `Decline` → inline banner `You need to accept the required Terms and Privacy Policy to use TukDaeng. You can review them again or exit the app.` + ทางเลือกเดียว `Sign out` (member/new → กลับ Member Sheet sign-in gateway) หรือ `Exit app` (guest) — ไม่มี path ใช้งานต่อโดยไม่ยอมรับ
4. Trigger = policy version จาก backend เทียบกับ consent record ล่าสุด (contract — prototype ใช้ dev button จำลอง version bump)

# 9. Business Rules

## Supported Authentication Methods

- Email / Password
- Apple Sign In
- Google OAuth

## Email / Password Rules

- Email / Password ต้องยืนยัน OTP ก่อนสร้างบัญชีสำเร็จ
- OTP ต้องเป็นตัวเลข 6 หลัก กรอกในช่อง 6 ช่องที่ auto-advance ไปข้างหน้าและ backspace ย้อนกลับ
- OTP auto-submit เมื่อกรอกครบ 6 หลัก — ไม่มีปุ่ม Verify
- OTP ผิดต้องแสดง `That code is incorrect. Try again.` พร้อม shake + ล้างช่องให้กรอกใหม่
- Resend OTP มี cooldown 30 วินาที (แสดง `Resend code in 0:30` ก่อนกลายเป็นปุ่ม `Resend code`)
- OTP ไม่มี expiry UI state — ไม่มีหน้า/ข้อความ "OTP expired" (S-20)
- Credential ต้อง persist ทันทีเมื่อ signup validation ผ่าน (ก่อนส่ง OTP) เพื่อให้บัญชีรอดจากการปิดแอปกลาง flow
- Password ต้องมีอย่างน้อย 8 ตัวอักษร และต้องมีตัวเลขหรือสัญลักษณ์อย่างน้อย 1 ตัว (canonical — 00_GLOBAL §12 Password Policy; prototype sign-up ใช้กฎ `≥8 + score ≥2` ถือเป็น deviation ที่บันทึกไว้ ไม่ใช่ spec)
- Password field ต้องมี show/hide toggle และ strength meter 4 แถบเป็น visual aid — meter ไม่ใช่ตัวบังคับ policy
- 1 Email สมัครได้ 1 บัญชีเท่านั้น
- Email ไม่สามารถเปลี่ยนได้หลังยืนยันแล้ว

## Sign In Rules

- Sign In form มี Email + Password เท่านั้น + ลิงก์ `Forgot password?` + `New here? Create account` + social row; back → Member Sheet
- Field validation ต้องทำก่อน credential check — `Enter your email.` / `Enter a valid email address.` / `Enter your password.`
- Credential ผิดต้องแสดง form banner `Email or password is incorrect.` — counter นับความพยายามผิดต่อเนื่องและ reset เมื่อ sign in สำเร็จ
- ผิดครบ 5 ครั้งต้อง lockout `Please try again in {X min Y sec} or choose Forgot password.` (TH `กรุณาลองใหม่ในอีก {X นาที Y วินาที} หรือเลือกลืมรหัสผ่าน`; นับแยกตามอีเมล, ข้อความเดียวกันทุกอีเมล, นับถอยหลังทุกวินาที) + ปุ่ม Sign in disabled (contract: server-side lockout 15 นาที — prototype มี timer 15 นาทีและปลดเองเมื่อครบ — RESOLVED 2026-10-29)
- Lockout ตามกติกาทั่วไปของแอป (contract ฝั่งเซิร์ฟเวอร์): ตัวนับและเวลาล็อกเก็บที่เซิร์ฟเวอร์ ผูกกับอีเมล (ไม่ผูกกับเครื่อง ไม่นับรวมทุกอีเมล) และอีเมลที่ไม่มีบัญชีใช้กลไกเดียวกัน
- ระหว่างล็อก ทุกการ Sign in ด้วยอีเมลนั้น รวมถึงรหัสที่ถูกต้อง ถูกปฏิเสธด้วยข้อความล็อก (เหมือนกันทุกอีเมล)
- การปิดแอป รีเฟรช ติดตั้งใหม่ หรือล้างข้อมูลแอป ต้องไม่รีเซ็ตการล็อก; เวลานับถอยหลังคำนวณจากเวลาที่เซิร์ฟเวอร์ ไม่ใช่เวลาเครื่อง
- ข้อจำกัดของ prototype (หมายเหตุ ไม่ใช่ข้อกำหนดของแอปจริง): prototype จำลองการล็อกด้วยการเก็บสถานะไว้ในเครื่องแยกตามอีเมล จึงผ่านการปิดแอปแล้วเปิดใหม่ได้ แต่การล้างข้อมูลเว็บจะรีเซ็ตการล็อก ซึ่งแอปจริงต้องไม่เกิด การทดสอบทุกเคสในเล่มนี้ทำบนแอปที่สร้างจริงเท่านั้น ไม่ได้ทดสอบกับ prototype
- ระหว่างล็อกยังใช้ "ลืมรหัสผ่าน?" ได้ (ไม่ถูกบล็อก) เพื่อกันการล็อกแบบจงใจ
- ปลดเองเมื่อครบเวลา และตัวนับเริ่มใหม่เมื่อ Sign in สำเร็จ
- ระดับความปลอดภัยเพิ่มเติม (ฝั่งเซิร์ฟเวอร์ ไม่ใช่ prototype): จำกัดความถี่ตามอุปกรณ์/IP และ CAPTCHA หลังผิดหลายครั้ง
- Sign in สำเร็จต้องเข้าแอปเงียบ ๆ — ไม่มี welcome-back toast/dialog
- Session result: returning member ที่มีข้อมูล → `member`; บัญชีที่สมัครใหม่ → `new` (canonical 00_GLOBAL §7 Session Transitions)
- Social sign-in returning ที่ provider ตรงกับบัญชี persist → session `new` เงียบ ๆ ไม่ผ่าน Profile Setup
- บัญชีที่อยู่ใน deletion grace period แล้ว sign in สำเร็จ = login-to-restore (S-02 — flow detail 13_SETTINGS)
- Auth method ต้องตรงบัญชี — SSO-only account ที่ sign in ด้วย email/password ต้องถูกปฏิเสธ (contract: production แสดง method-specific error; prototype รวมเป็น generic incorrect)
- Enter key บนฟอร์ม auth = submit primary action

## Account Persistence Rules

- Credential ที่สมัครต้อง persist บนเครื่อง (prototype `fo_account` — production: server-side account store) — บัญชีรอด logout, app restart และ reload
- Sign In ต้อง match ทั้งบัญชีที่ persist และบัญชีเดิมในระบบ (production: server directory)
- Sign Out ต้องไม่ลบ credential — ลบเฉพาะ session (session `guest`) เพื่อให้ sign in กลับได้ทันที
- Delete Account สำเร็จต้องลบ credential ที่ persist + revoke session → `guest` (00_GLOBAL §12; flow detail 13_SETTINGS)
- Session data swap ตาม Session Data Rules — 00_GLOBAL §7 (`member` restore ข้อมูลบัญชี / `new` + `guest` เคลียร์ข้อมูลส่วนตัวทุก surface)

## Username Rules (Profile Setup)

- Username ต้องยาว 3–20 ตัวอักษร ใช้ได้เฉพาะ `a–z`, `0–9`, `_`, `.` (lowercase)
- ระบบต้อง suggest username ให้อัตโนมัติ: email signup ใช้ส่วนหน้า @ ของ email (sanitize เหลือ charset ที่รับ) ถ้าไม่ valid ให้ใช้ `member` + เลขสุ่ม; social signup ใช้ display name จาก provider ก่อน (lowercase, เว้นวรรค → `_`, sanitize) แล้ว fallback แบบ email
- `Skip for now` บน Profile Setup ต้องใช้ suggested username ให้โดยอัตโนมัติ (ข้ามขั้นได้ ไม่บังคับตั้งเอง)
- Username ใช้เป็น handle ของบัญชีบน surfaces อื่น — การแก้ไขภายหลังอยู่ใน scope Profile/Settings

## SSO Rules

- Apple และ Google ใช้ได้ทั้ง Sign In และ Sign Up
- SSO Email ไม่ต้องยืนยัน OTP และไม่มี password step
- Provider ต้อง auto-fill name + email + photo (photo กลายเป็น avatar เริ่มต้น) — user แก้ username ได้ที่ Profile Setup
- Social sign-up ครั้งแรกเข้าแอปทันทีหลัง Profile Setup (session `new`) — ไม่มีหน้า Account created
- Social sign-in ของ returning user ที่ provider ตรงกับบัญชีเดิมเข้าเงียบ ๆ ไม่ผ่าน Profile Setup
- บัญชี SSO ไม่สามารถ Sign In ด้วย Email / Password ได้
- บัญชี Email / Password ไม่สามารถ Sign In ด้วย SSO provider ได้ เว้นแต่มี account linking ในอนาคต
- Account Linking และ Account Merge ไม่อยู่ใน V1

## Terms And Privacy Rules

- Required consent (Terms of Use + Privacy Policy) ใช้ implied consent — การกด `Continue` (welcome), `Create account` / `Continue with…` (sign up / social) หรือ `Accept & continue` (re-consent) พร้อม legal text กำกับถือเป็นยอมรับ — ไม่มี checkbox (canonical 00_GLOBAL §8)
- Legal text ต้องแสดงคู่กับทุก submit action ที่ถือเป็นการยอมรับ พร้อมลิงก์เปิด legal viewer ได้
- Optional consent (analytics / personalization) แยกจาก required — ตั้งค่าที่ Privacy Notice / Cookie Settings และเปลี่ยนได้ภายหลังที่ Settings > Privacy
- Terms of Use และ Privacy Policy ต้องเปิดอ่านได้จาก Welcome, Sign Up legal text, consent surfaces (รวม re-consent rows) และ Settings
- ทุก session ต้องผ่าน re-consent sheet เมื่อ policy version bump ก่อนใช้งานต่อ — canonical behavior 00_GLOBAL §8 (flow ที่ §8 Re-Consent)

## Suspended / Banned Account Rules

- Suspended และ Banned User ต้องไม่เข้าสู่ระบบเข้า main app ได้
- Sign In ต้องแสดงเหตุผล suspension/ban
- Temporary suspension ต้องแสดงวันสิ้นสุดเมื่อ backend ส่งข้อมูลมา
- Sign In ต้องแสดงช่องทางติดต่อ Support
- เมื่อ temporary suspension ครบกำหนดและ backend เปลี่ยนสถานะกลับเป็น Active แล้ว ผู้ใช้ต้อง Sign In ใหม่ เพราะ session เดิมถูก revoke ไปแล้ว
- ระบบต้องไม่ใช้ in-app notification เป็นช่องทางหลักในการแจ้ง suspend/ban เพราะผู้ใช้อาจเข้าแอปไม่ได้แล้ว; email เป็น primary channel ตาม BO User Management/Notification policy

หมายเหตุ: Suspended/Banned handling ทั้งหมดเป็น contract — prototype ไม่มี account-status check ที่ Sign In (ตรวจแค่ credential match) ตาม gap B5/C8; spec เก็บ enforcement นี้ไว้สำหรับ production (S-29)

## Token And Session Rules

- ทุก API ใช้ HTTPS
- ระบบใช้ Token-based Authentication
- Sign Out ต้อง clear local token/session
- เมื่อ token หมดอายุ ให้กลับไป Guest state หรือแสดง Member Sheet `Join TukDaeng` ตาม context
- เมื่อ token/session ถูก revoke จาก BO เพราะ `Suspended` หรือ `Banned` ต้อง clear local session และเปิด account status state แทน main app

# 10. Permission Rules

| Actor / State | Permission |
| --- | --- |
| Guest | เปิด Sign In, Sign Up, Forgot Password, Terms, Privacy และ public surfaces |
| Guest | browse feed/tabs, search, boards, post surfaces และ public profile ได้เสรี (Guest Capabilities — 00_GLOBAL §11) |
| Guest | ใช้ action ที่ต้องมีตัวตนไม่ได้ ต้องเห็น Member Sheet `Join TukDaeng` gate variant ทับ surface เดิม (scrim-dismiss — 00_GLOBAL §11) |
| Pending Verification | กรอก OTP และขอ resend OTP ได้ แต่ยังไม่ใช้ authenticated feature |
| Authenticated Member | ใช้ feature ตามสิทธิ์ Member |
| Suspended User | Sign In เข้า main app ไม่ได้ และต้องเห็น suspension reason + Support contact |
| Banned User | Sign In เข้า main app ไม่ได้ และต้องเห็น ban reason + Support contact ตาม policy |
| SSO User | Sign In ด้วย provider เดิมเท่านั้น |

# 11. Validation Rules

| Field / Action | Validation |
| --- | --- |
| Email | ต้องเป็นรูปแบบ email ที่ถูกต้อง |
| Email uniqueness | 1 Email สมัครได้ 1 บัญชีเท่านั้น — ซ้ำให้แสดง `This email is already registered. Try signing in.` |
| Password | อย่างน้อย 8 ตัวอักษร และต้องมีตัวเลขหรือสัญลักษณ์ |
| OTP | Required, ต้องเป็นตัวเลข 6 หลัก, auto-submit เมื่อกรอกครบ 6 หลัก, ต้องถูกต้อง |
| Username | Required ที่ Profile Setup (หรือใช้ suggested ผ่าน Skip), 3–20 ตัวอักษร `[a-z0-9_.]` lowercase |
| Terms / Privacy consent | Implied consent ผ่าน submit action พร้อม legal text ทุกช่องทาง |
| Auth method | ต้องตรงกับ method ที่บัญชีใช้สมัคร |
| Sign In email | Required — `Enter your email.`; รูปแบบต้องถูก — `Enter a valid email address.` |
| Sign In password | Required — `Enter your password.` |
| Suspended status | ต้อง block sign in |
| Forgot Password email | Required, validate ตอน submit — format ผิดแสดง `Enter a valid email address.`; ทุกกรณีแสดง generic sent state (ไม่เปิดเผย account existence / auth method) |
| Current password | ต้องถูกต้องก่อน Change Password |
| Change Password current password | Required และต้องตรงกับรหัสปัจจุบัน |
| Change Password new password | Required, อย่างน้อย 8 ตัวอักษร, ต้องมีตัวเลขหรือสัญลักษณ์ และต้องต่างจาก current password |
| Change Password confirm new password | Required และต้องตรงกับ new password |

# 12. Exception Handling

| Case | Expected Handling |
| --- | --- |
| Email ถูกใช้แล้ว | แสดง `This email is already registered. Try signing in.` และเสนอไป Sign In |
| Password ไม่ผ่าน policy | แสดง validation message ตาม policy |
| OTP ผิด | shake ช่อง + `That code is incorrect. Try again.` + ล้างช่องให้กรอกใหม่ |
| Username ไม่ผ่าน rule | แสดง `Username required — 3–20 characters: a–z, 0–9, _ or .` |
| Resend OTP ถี่เกินไป | cooldown 30 วินาทีต่อครั้ง — แสดง `Resend code in 0:30` แทนปุ่ม |
| Sign In credential ผิด | แสดง form banner `Email or password is incorrect.` — counter นับความพยายามผิดต่อเนื่อง |
| Sign In ผิดครบ 5 ครั้ง | lockout `Please try again in {X min Y sec} or choose Forgot password.` (TH `กรุณาลองใหม่ในอีก {X นาที Y วินาที} หรือเลือกลืมรหัสผ่าน`; นับแยกตามอีเมล, ข้อความเดียวกันทุกอีเมล, นับถอยหลังทุกวินาที) + ปุ่ม Sign in disabled (contract: server lockout 15 นาที) |
| ใช้ auth method ผิด | แจ้งว่าบัญชีนี้ต้อง Sign In ด้วย method เดิม (contract — prototype รวมเป็น generic incorrect) |
| SSO provider error | แสดง error และให้ลองใหม่ |
| Forgot Password email เป็นบัญชี Apple / Google SSO หรือไม่มีบัญชี | แสดง generic sent state `If an account exists for {email}, we sent a reset link.` เหมือนกรณีส่งจริง — ไม่เปิดเผย account existence / auth method |
| Re-consent Decline | inline banner + เหลือเฉพาะ `Sign out` (member/new) หรือ `Exit app` (guest) — ไม่มี path ใช้งานต่อโดยไม่ยอมรับ |
| Change Password current password ผิด | แสดง field error `Current password is incorrect.` |
| Change Password new password ซ้ำ current password | แสดง field error `New password must be different from current password.` |
| Change Password confirm ไม่ตรง | แสดง field error `Passwords do not match.` |
| Change Password API/network error | ไม่ mark field ใด field หนึ่งเป็น error; แสดง banner/toast `Unable to change password. Please try again.` |
| Suspended / Banned account | แสดง account status state พร้อมเหตุผล ระยะเวลาถ้ามี และช่องทาง Support |
| Network error | แสดง error พร้อม retry |

# 13. Empty State

Authentication Module ไม่มี empty list state โดยตรง แต่ต้องมี neutral state สำหรับ:

- Form initial state
- Reset link sent confirmation
- Sign out completed state

# 14. Notification Rules

- OTP และ reset password เป็น transactional message
- Authentication Module ไม่สร้าง in-app notification หลักของระบบ
- Push notification permission มี pre-permission step แบบ skippable ใน first-run onboarding (`Never miss an update` — Continue ถึงถาม OS dialog, Skip ข้ามได้) — ไม่บังคับและไม่ block auth flow
- Member Sheet `Join TukDaeng` เป็น global state ไม่ใช่ notification

# 15. Analytics Events

Analytics เป็น contract-only (prototype ไม่มี tracking layer — D17/S-29)

| Event | Trigger |
| --- | --- |
| `auth_onboarding_started` | First-run onboarding เริ่ม (splash) |
| `auth_language_selected` | User เลือกภาษาที่ Language step |
| `auth_welcome_continued` | User กด Continue บน Welcome (required implied consent) |
| `auth_consent_responded` | User เลือก Accept all / Reject all / Save preferences บน consent surfaces (ส่ง choice เป็น property) |
| `auth_notif_prompt_responded` | User ตอบ notification pre-permission (allow / deny / skip) |
| `auth_track_prompt_responded` | User ตอบ track prompt (allow / ask-not-to-track) |
| `auth_member_sheet_shown` | Member Sheet แสดง (first-run หรือ gate variant — ส่ง variant เป็น property) |
| `auth_member_sheet_hidden` | User ติ๊ก `Don't show this again` บน first-run Member Sheet |
| `auth_sign_up_started` | User เปิด Sign Up |
| `auth_terms_opened` | User เปิด Terms of Use |
| `auth_privacy_opened` | User เปิด Privacy Policy |
| `auth_sign_up_submitted` | User submit Sign Up |
| `auth_otp_submitted` | OTP auto-submit ครบ 6 หลัก |
| `auth_otp_resend_tapped` | User ขอ OTP ใหม่ |
| `auth_profile_setup_completed` | User ผ่าน Profile Setup (Continue หรือ Skip for now) |
| `auth_account_created_shown` | หน้า Account created แสดง (email signup) |
| `auth_sign_in_submitted` | User submit Sign In |
| `auth_sign_in_succeeded` | Sign In สำเร็จ (ส่ง session result `member`/`new` เป็น property) |
| `auth_sign_in_failed` | Sign In credential ผิด (ส่ง attempt count เป็น property) |
| `auth_sign_in_locked` | Sign In ถูก lockout หลังผิดครบ 5 ครั้ง |
| `auth_sso_started` | User เริ่ม Apple / Google Sign In |
| `auth_sso_completed` | Apple / Google สำเร็จ |
| `auth_forgot_password_submitted` | User ขอ reset password |
| `auth_change_password_submitted` | User submit Change Password |
| `auth_sign_out_confirmed` | User ยืนยัน Sign Out |
| `auth_login_required_shown` | Member Sheet `Join TukDaeng` gate variant แสดง |
| `auth_gate_dismissed` | Guest ปิด gate sheet ด้วย scrim หรือ `Skip for now` (กลับ browse) |
| `auth_reconsent_shown` | Re-consent sheet `We've updated our policies` แสดง (ส่ง policy version เป็น property) |
| `auth_reconsent_accepted` | User กด `Accept & continue` บน re-consent |
| `auth_reconsent_declined` | User กด `Decline` บน re-consent (→ Sign out / Exit app) |
| `auth_account_status_blocked` | Suspended/Banned account ถูก block ตอน Sign In หรือ session revoke |

# 16. Acceptance Criteria

| ID | Criteria |
| --- | --- |
| AC-AUTH-001 | User สมัครด้วย Email / Password ได้เมื่อกรอกข้อมูลครบผ่าน validation และ submit ผ่าน `Create account` ที่มี legal text implied consent กำกับ |
| AC-AUTH-002 | Email / Password registration ต้องส่งผู้ใช้ไป OTP Verification |
| AC-AUTH-002A | Email / Password signup หลัง OTP สำเร็จต้องสร้างบัญชีและพากลับไป Sign In ไม่ auto-login (S-22); SSO signup เข้าใช้งานได้ทันที |
| AC-AUTH-005 | Password ต้องมีอย่างน้อย 8 ตัวอักษร และมีตัวเลขหรือสัญลักษณ์ (canonical — 00_GLOBAL §12; prototype sign-up ใช้กฎ `≥8 + score ≥2` ถือเป็น deviation) |
| AC-AUTH-007 | 1 Email สมัครได้ 1 บัญชีเท่านั้น |
| AC-AUTH-008 | Email ไม่สามารถเปลี่ยนได้หลังยืนยันแล้ว |
| AC-AUTH-009 | Apple Sign In / Sign Up ต้องรองรับใน V1 |
| AC-AUTH-010 | Google Sign In / Sign Up ต้องรองรับใน V1 |
| AC-AUTH-011 | SSO Email ไม่ต้องยืนยัน OTP |
| AC-AUTH-012 | บัญชี SSO ไม่สามารถ Sign In ด้วย Email / Password ได้ |
| AC-AUTH-013 | บัญชี Email / Password ไม่สามารถ Sign In ด้วย SSO provider ได้ใน V1 |
| AC-AUTH-014 | ทุกช่องทางการสมัครต้องมี implied consent กับ Terms of Use และ Privacy Policy — legal text พร้อมลิงก์ต้องแสดงคู่กับ submit action ทุกจุด และไม่มี consent checkbox แยก |
| AC-AUTH-015 | Suspended/Banned account ต้อง Sign In เข้า main app ไม่ได้ |
| AC-AUTH-016 | Suspended/Banned account ต้องเห็น account status state พร้อมเหตุผล ระยะเวลาถ้ามี และช่องทางติดต่อ Support |
| AC-AUTH-016A | Session ที่ถูก BO revoke เพราะ Suspended/Banned ต้อง clear local session และแสดง account status state |
| AC-AUTH-017 | Forgot Password ต้องส่ง reset link สำหรับบัญชี Email / Password และแสดง generic confirmation; การตั้งรหัสผ่านใหม่ผ่าน link อยู่นอก FO V1 screens (ไม่มี Reset Password page ในแอป) |
| AC-AUTH-020 | Authenticated Member สามารถ Change Password ได้เมื่อ current password ถูกต้อง |
| AC-AUTH-020A | Change Password ต้องมี Current password, New password และ Confirm new password |
| AC-AUTH-020B | Change Password ต้อง reject current password ที่ไม่ถูกต้องด้วย `Current password is incorrect.` |
| AC-AUTH-020C | Change Password ต้อง reject new password ที่ซ้ำ current password ด้วย `New password must be different from current password.` |
| AC-AUTH-020D | Change Password ต้อง reject confirm password ที่ไม่ตรงด้วย `Passwords do not match.` |
| AC-AUTH-020E | Change Password API/network error ต้องแสดง `Unable to change password. Please try again.` โดยไม่ผูก error กับ field เฉพาะ |
| AC-AUTH-021 | Sign Out ต้อง clear local token/session |
| AC-AUTH-022 | Guest ใช้ feature ที่ต้อง Login ต้องเห็น Member Sheet `Join TukDaeng` gate variant (canonical 00_GLOBAL §11) |
| AC-AUTH-023 | ทุก API ที่เกี่ยวกับ Authentication ต้องใช้ HTTPS และ Token-based Authentication |
| AC-AUTH-024 | V1 ไม่รองรับ 2FA, Passkey, Biometric Login, Account Linking, Account Merge หรือ Device Management |
| AC-AUTH-025 | First-run onboarding ต้องแสดงครั้งเดียวตามลำดับ splash → language → welcome → privacy notice → notification prompt → track prompt → Member Sheet (persist เมื่อจบ flow) |
| AC-AUTH-026 | Continue บน Welcome ต้องบันทึก required consent (terms/privacy timestamp) เป็น implied consent — ไม่มี checkbox |
| AC-AUTH-027 | Privacy Notice ต้องแยก essential (always on) จาก optional (analytics / personalization) และรองรับ Accept all / Reject all / Privacy settings ที่บันทึก consent record ทุกทาง |
| AC-AUTH-028 | Notification pre-permission ต้อง skippable — Skip ข้ามไป track prompt โดยไม่แสดง OS dialog; Continue เท่านั้นที่เปิด OS permission dialog |
| AC-AUTH-029 | Track prompt ที่เลือก `Ask App Not to Track` ต้องบังคับ personalization consent = off |
| AC-AUTH-030 | First-run Member Sheet ต้องมี Sign up / Sign in / Skip for now + social row + `Don't show this again`; การติ๊ก hide แล้ว Skip ต้องทำให้ run ถัดไปไม่แสดง sheet อีก |
| AC-AUTH-031 | Analytics = off (จาก Reject all หรือ Privacy settings) ต้องไม่ส่ง analytics event ทุกตัว รวม search event และ `auth_*` event; consent record ยังบันทึกได้ตาม AC-AUTH-027 (ทดสอบบน build stg/app จริงเท่านั้น — prototype ไม่มี analytics pipeline) · วิธีตรวจค่าเริ่มต้น: (1) ติดตั้ง stg build ที่เปิด proxy หรือ analytics debug view (2) ล้างข้อมูลแล้วเข้า onboarding กด Reject all (3) ใช้งาน feed และค้นหา 1 ครั้ง (4) ตรวจว่าไม่มี request หรือ event ไปยัง analytics endpoint (5) control: ทำซ้ำกับ Accept all ต้องเห็น event จริง ไม่เช่นนั้นวิธีตรวจใช้ไม่ได้ — เดฟยืนยันหรือปรับได้ก่อนรันจริง |
| AC-AUTH-031 | Sign Up ต้องมีเฉพาะ Email + Password (ไม่มี Confirm Password — S-20), password ต้องมี show/hide toggle + strength meter 4 แถบ และ legal text ใต้ปุ่ม Create account |
| AC-AUTH-032 | OTP ต้องเป็น 6 ช่องตัวเลข auto-advance, backspace ย้อนช่อง และ auto-submit เมื่อครบ 6 หลัก — ไม่มีปุ่ม Verify |
| AC-AUTH-033 | OTP ผิดต้อง shake + `That code is incorrect. Try again.` + ล้างช่อง; Resend ต้องมี cooldown 30 วินาที; ไม่มี OTP expired state (S-20) |
| AC-AUTH-034 | Credential ต้อง persist ทันทีที่ signup validation ผ่าน (ก่อน OTP) เพื่อให้บัญชียัง sign in ได้หลังปิดแอปกลาง flow |
| AC-AUTH-035 | Profile Setup ต้องมี avatar + `Add photo`, ช่อง Username ที่ suggest อัตโนมัติ และ `Skip for now` ที่ใช้ suggested username ให้ |
| AC-AUTH-036 | Username ต้องยาว 3–20 ตัวอักษร charset `[a-z0-9_.]` lowercase — suggest จาก email local-part (email signup) หรือ provider display name (social signup) |
| AC-AUTH-037 | Social sign-up ต้อง auto-fill name/email/photo จาก provider, ไม่มี password step, ไม่มี OTP, ไม่มีหน้า Account created และเข้าแอปทันทีเป็น session `new` หลัง Profile Setup |
| AC-AUTH-038 | หน้า Account created (email signup เท่านั้น) ต้องแสดง `Welcome, {name}. Sign in to start exploring.` + ปุ่ม Sign in — ไม่ auto-login |
| AC-AUTH-039 | Sign In ต้องมี Email + Password (password show/hide) + `Forgot password?` + `New here? Create account` + social row — submit ได้ทั้งปุ่ม `Sign in` และ Enter; back → Member Sheet |
| AC-AUTH-040 | Sign In ต้อง validate field ก่อน credential check — email ว่าง `Enter your email.`, format ผิด `Enter a valid email address.`, password ว่าง `Enter your password.` |
| AC-AUTH-041 | Sign In credential ผิดต้องแสดง `Email or password is incorrect.` ที่นับความพยายามผิดต่อเนื่องและ reset เมื่อสำเร็จ |
| AC-AUTH-042 | Sign In ผิดครบ 5 ครั้งต้อง lockout `Please try again in {X min Y sec} or choose Forgot password.` (TH `กรุณาลองใหม่ในอีก {X นาที Y วินาที} หรือเลือกลืมรหัสผ่าน`; นับแยกตามอีเมล, ข้อความเดียวกันทุกอีเมล, นับถอยหลังทุกวินาที) + ปุ่ม Sign in disabled (contract: server lockout 15 นาที) |
| AC-AUTH-043 | Sign In สำเร็จต้องเข้าแอปเงียบ (ไม่มี welcome toast) และ set session `member` (returning member ที่มีข้อมูล) หรือ `new` (บัญชีที่สมัครใหม่) ตาม canonical 00_GLOBAL §7 |
| AC-AUTH-044 | Social sign-in ที่ provider ตรงบัญชี persist ต้องเข้า session `new` เงียบ ๆ ไม่ผ่าน Profile Setup |
| AC-AUTH-045 | Sign In ต้องตรวจ auth method + account status ก่อนออก session — SSO-only account ห้าม sign in ด้วย email/password; บัญชีใน deletion grace period sign in = login-to-restore (S-02); Suspended/Banned ต้อง block (contract — prototype ไม่ครอบ) |
| AC-AUTH-046 | Forgot Password ต้องเป็นหน้า `Reset password` (email field + `Send reset link`, back → Sign In) — invalid email แสดง `Enter a valid email address.` ตอน submit |
| AC-AUTH-047 | Reset link sent ต้องแสดง `Check your email` + `If an account exists for {email}, we sent a reset link.` + `Back to sign in` — copy เดียวกันทุกกรณี ไม่เปิดเผย account existence หรือ auth method |
| AC-AUTH-048 | Guest ที่กด login-required action ต้องเห็น Member Sheet gate variant ทับ surface เดิมโดยไม่นำทางออก — scrim หรือ `Skip for now` ปิดกลับ browse โดยไม่ persist choice |
| AC-AUTH-049 | Sign Out ต้อง → session `guest` + toast + แสดง Member Sheet gate — credential ที่ persist ต้องรอด logout/restart เพื่อ sign in กลับด้วยบัญชีเดิม |
| AC-AUTH-050 | Delete Account สำเร็จต้องลบ credential persist + revoke session → `guest` (00_GLOBAL §12; flow detail 13_SETTINGS) |
| AC-AUTH-051 | Policy version bump ต้องแสดง re-consent sheet `We've updated our policies` ทับทุก session ก่อนใช้งานต่อ — required rows Terms/Privacy v{version} เปิด legal viewer ได้ (canonical 00_GLOBAL §8) |
| AC-AUTH-052 | Re-consent `Accept & continue` ต้องบันทึก consent record ใหม่ (implied consent) แล้วใช้งานต่อ; `Decline` ต้องเหลือเฉพาะ `Sign out`/`Exit app` — ไม่มี path ใช้งานต่อโดยไม่ยอมรับ |

# 17. Related Modules

- [00_GLOBAL_RULES_MODULE.md](00_GLOBAL_RULES_MODULE.md)
- [00_NAVIGATION_AND_CROSS_MODULE_FLOW.md](00_NAVIGATION_AND_CROSS_MODULE_FLOW.md)
- [02_FEED_MODULE.md](02_FEED_MODULE.md)
- [06_PROFILE_MODULE.md](06_PROFILE_MODULE.md)
- [13_SETTINGS_MODULE.md](13_SETTINGS_MODULE.md)
- [15_TRUST_SAFETY_MODULE.md](15_TRUST_SAFETY_MODULE.md)

# 18. Future Enhancement

- Two-Factor Authentication
- Passkey
- Biometric Login
- Account Linking
- Account Merge
- Device Management
- Login history
- Risk-based authentication


## Contract updates — canonical lock 2026-10-29 (FO-TEST hardening)

- หลัง "Account created" → หน้า Sign in เติม email ที่เพิ่งสมัครไว้อัตโนมัติ (password ว่าง)
- Coach marks บังคับแสดงตอนเข้า feed ครั้งแรกของ member และครั้งแรกของ guest
- กลับจากหน้า OTP ค่าที่กรอกยังอยู่ครบ
- Lockout ใช้ระยะเวลาตาม design (15 นาที) หลังครบต้องปลดจริง
- สิทธิ์ติดตาม: iOS = ATT dialog; Android = ไม่มี dialog ข้ามขั้นนี้


## Batch A Amendments (2026-10-30)

- ภาษาเริ่มต้นของ Language step ตามภาษาของอุปกรณ์ (ไม่ใช่ไทยใช้ English)
- Track prompt body: "We use your activity in TukDaeng only to recommend watches and news. We do not track you across other companies' apps or websites." (TH: "เราใช้กิจกรรมของคุณในตึกแดงเพื่อแนะนำนาฬิกาและข่าวสารเท่านั้น ไม่ติดตามข้ามแอปหรือเว็บไซต์อื่น")
- Sign Up validation copy ใช้ชุดเดียวกับ Sign In: `Enter your email.` / `Enter a valid email address.` / `Enter your password.` และ policy `Password must be at least 8 characters and include at least one number or special character.`
- OTP subtitle: "We sent a 6-digit code to {email}"
