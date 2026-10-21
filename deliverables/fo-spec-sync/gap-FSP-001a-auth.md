# FSP-001a — Gap Inventory: Onboarding / Auth / Consent / Guest

วันที่สแกน: 21 ต.ค. 2026
Source of truth: `Prototypes/fo-flow/index.html` (read-only, ~23k บรรทัด — onboarding zone อยู่ประมาณบรรทัด 22643–23100 + settings auth surfaces รอบ 14726–14780, 17185–17245, 20785–20995)
เทียบกับ: `FrontOffice/01_AUTHENTICATION_MODULE.md`

---

## A. Prototype มี แต่ Spec 01 ไม่มี (→ ต้องเพิ่มใน spec ตอน FSP-012a/b)

### A1. First-run onboarding sequence (ทั้ง flow ไม่มีใน spec เลย)
- `splash` — โลโก้ + loading, auto ไป `lang` หลัง ~3.2 วิ
- `lang` — เลือกภาษา English/ไทย (มี check mark บน row ที่เลือก) + ปุ่ม Continue
- `welcome` — "Welcome to the TukDaeng app" + illustration + ลิงก์ Terms/Privacy + ข้อความ fine print "By tapping Continue you agree to the Terms of Use and acknowledge the Privacy Policy" → กด Continue แล้วบันทึก `termsAt` + แสดง loading ~1.5 วิ ก่อนไป consent
- `consent` (first-run) — หน้า "Privacy notice": อธิบาย cookies/SDK, แยก essential (จำเป็น) กับ optional (analytics, personalization), ปุ่ม Accept all / Reject all / Cookie settings
- `prefs` — หน้า "Cookie settings": Essential (Always on), toggle Analytics, toggle Personalization, ปุ่ม Save preferences
- `notif` — หน้า pre-permission "Never miss an update" (Continue / Skip) → OS dialog mock "TukDaeng Would Like to Send You Notifications" (Don't Allow / Allow)
- `track` — หน้า ATT-style "We suggest news that suits you" → OS dialog mock "Allow TukDaeng to track your activity across other companies' apps and websites?" (Ask App Not to Track / Allow) — กด "ไม่ติดตาม" จะบังคับ personalization = off
- `member` — bottom sheet "Join TukDaeng": ปุ่ม Sign up / Sign in / Skip for now + social row (Google/Apple) + checkbox "Don't show this again" (เฉพาะ first-run, persist `fo_member_hide`)

### A2. Sign up (email)
- ฟอร์มมีแค่ Email + Password (password มีปุ่มตา show/hide + strength meter 4 แถบ + hint)
- ไม่มีช่อง Confirm Password (spec บังคับมี)
- ไม่มี explicit consent checkbox — ใช้ legal text ใต้ปุ่ม Create account แทน
- Email ซ้ำ: mock `taken@example.com` → error "This email is already registered. Try signing in."
- Password rule จริงในโค้ด: ยาว ≥8 **และ** score ≥2 (score นับจาก ยาว≥8 / มีตัวพิมพ์เล็ก+ใหญ่ / มีตัวเลข / มีสัญลักษณ์หรือยาว≥12) — คือยอมให้ผ่านด้วย "พิมพ์ใหญ่+เล็ก" โดยไม่มีตัวเลข/สัญลักษณ์ได้
- สมัครผ่านแล้วบันทึก credential ลง `fo_account` (localStorage) ทันทีก่อน OTP

### A3. Email OTP
- ช่อง OTP 6 ช่อง auto-advance, backspace ย้อนช่อง, auto-submit เมื่อครบ 6 หลัก (ไม่มีปุ่ม Verify)
- แสดง email ปลายทาง, countdown "Resend code in 0:30" → ปุ่ม Resend code
- OTP ผิด → shake + "That code is incorrect. Try again." แล้วล้างช่อง
- Banner "Demo code: 123456" (prototype artifact)
- ไม่มี OTP expiration / expired state เลย — OTP ไม่มีวันหมดอายุใน prototype

### A4. Profile setup step (หลัง OTP / social)
- หน้า "Set up your profile": avatar + "Add photo" (prototype toast เฉย ๆ), ช่อง Username (prefill จาก email/ชื่อ social), "Skip for now" (ใช้ suggested username ให้), Continue
- Username rule: 3–20 ตัวอักษร `a-z 0-9 _ .` (lowercase)
- Spec ไม่มีขั้น profile/username ใน registration flow เลย

### A5. Account created (เฉพาะ email signup)
- หน้า "Account created" + "Welcome, {name}. Sign in to start exploring." → ปุ่ม Sign in
- สำคัญ: email signup **ไม่ auto-login** — ผู้ใช้ต้องกด Sign in แล้วกรอกอีเมล/รหัสอีกครั้ง (prototype prefill ให้)
- Social sign-up ตรงข้ามกัน: เลือก username แล้วเข้าแอปเลย ไม่มี OTP ไม่มีหน้า created

### A6. Sign in
- Prefill demo account `demo@tukdaeng.com` / `Tukdaeng123` (prototype artifact)
- Credential ตรวจกับ demo + `fo_account` ที่เคยสมัครในเครื่อง
- Error นับครั้ง: "Email or password is incorrect. (n/5)" → ครบ 5 ครั้ง: "Too many attempts. Try again in 15 minutes or reset your password." + ปุ่ม disabled
- ลิงก์ "Forgot password?" และ "New here? Create account"
- Registered account sign in → session `new` (ข้อมูลว่าง), demo → session `member`
- Social sign-in ตอน returning: ถ้ามี `fo_account` provider เดียวกัน → เข้า session `new` เงียบ ๆ; ไม่มี → เข้า demo member

### A7. Forgot password
- หน้า "Reset password": ช่อง email → state "Check your email" พร้อมข้อความกลาง "If an account exists for {email}, we sent a reset link." → ปุ่ม Back to sign in
- ไม่มีหน้า Reset Password (ตั้งรหัสใหม่) และไม่มี invalid/expired link state

### A8. Guest browsing / login gate
- Session model 3 แบบ: `member` (demo data) / `guest` / `new` (บัญชีใหม่ ข้อมูลว่าง) — persist `fo_session`, `fo_newuser`, `fo_account`
- Guest เปิด feed/board/search ได้ แต่ action ที่ต้องใช้ตัวตนทั้งหมด (GUEST_GATE_SEL: like/save/share/wishlist/follow/chat/alerts tab/profile tab/comment/post menus/report/board actions/create/settings ฯลฯ) → เปิด member sheet แบบ gate
- Gate sheet ใช้ copy ต่างจาก first-run: "Sign in or create a free account to use this feature." ไม่มี checkbox "Don't show this again" และแตะ scrim เพื่อปิดได้
- Copy/ปุ่มของ gate **ไม่ตรง** Global Login Required Dialog ใน spec (ดู C3)
- มี guest coach marks ชุดแยก (OB_TOUR_GUEST) — "Sign up to create your first post" ฯลฯ

### A9. Coach marks tour
- หลัง onboarding ครั้งแรก: coach marks 4 จุด (create button, search, feed tabs, bottom nav) — มี version member และ guest
- persist `fo_toured` — แสดงครั้งเดียว

### A10. Re-consent (policy version bump)
- Dev button "v2" จำลอง Terms/Privacy version ใหม่ → consent sheet "We've updated our policies" ทับ feed
- Required rows: Terms v1.1 / Privacy v1.1 (แตะเปิด legal view ได้) + optional toggles Analytics/Personalized
- Accept & continue → toast "Thanks — updated policies accepted"
- Decline → banner "You need to accept the required Terms and Privacy Policy..." + ปุ่ม Sign out/Exit app
- Consent log: `fo_consent` + `fo_consent_log` เก็บ version, timestamp ยอมรับ terms, optional flags, lang
- Spec 01 ไม่มีเรื่อง re-consent / policy versioning เลย (น่าจะเป็นของ 00_GLOBAL หรือ 13_SETTINGS — ต้องตัดสินใจว่าใส่ที่ไหน)

### A11. Legal viewer
- Terms of Use (3 sections) + Privacy Policy (4 sections) เปิดเป็น full-screen view ในแอป มี label version + "Effective 19 Oct 2026"
- เปิดได้จาก welcome / consent sheet / signup legal links / (spec บอกต้องเปิดจาก Sign Up + Settings — prototype มี settings legal rows ด้วย)

### A12. Auth-adjacent surfaces ใน Settings (อยู่นอก onboarding แต่ spec 01 ครอบ)
- Settings row "ออกจากระบบ" → dialog "Log out of @{user}?" → ยืนยัน → session `guest`
- Settings > "เปลี่ยนรหัสผ่าน": 3 ฟิลด์ (current/new/re-type) + ลิงก์ "Forgot your password?" → dialog ส่ง reset link ไปอีเมลที่ mask แล้ว
- Delete account: dialog ยืนยันด้วยรหัสผ่าน → 30-day grace → dialog success → logout → session guest + member sheet (ทางกลับมากู้บัญชี)

### A13. Prototype artifacts ที่ spec ไม่ควรมี (หรือควรระบุว่า demo-only)
- Dev buttons "1st" (replay onboarding) / "v2" (simulate re-consent)
- Demo account + demo OTP 123456
- Sign-in prefill password หลังสมัคร

---

## B. Spec 01 มี แต่ Prototype ไม่มี (→ ตัดสินใจว่า spec เก็บไว้เป็น contract หรือต้องปรับ)

| # | ของใน spec | สถานะใน prototype |
|---|---|---|
| B1 | Confirm Password ช่องยืนยันรหัสตอน Sign Up + rule "ต้องตรงกัน" | ไม่มีช่องนี้เลย |
| B2 | OTP expiration 30 นาที + expired state + ขอ OTP ใหม่ | OTP ไม่หมดอายุ มีแค่ resend cooldown 30 วิ |
| B3 | Verification Success screen | ไม่มี — OTP ผ่าน → ไป profile เลย |
| B4 | Reset Password screen (ตั้งรหัสใหม่) + invalid/expired/used link state | ไม่มี — มีแค่ส่ง link + "Check your email" |
| B5 | Suspended / Banned account handling ทั้งหมด (block sign in, เหตุผล, วันสิ้นสุด, ช่องทาง Support, session revoke จาก BO) | ไม่มีเลย — sign in ตรวจแค่ credential |
| B6 | Auth method conflict error (บัญชี SSO ห้าม sign in ด้วย email/pw และกลับกัน) | ไม่มี error เฉพาะ — เป็น generic "incorrect" |
| B7 | Pending Verification state เป็น user state ถาวร | ไม่มี — OTP เป็นแค่ step ใน flow |
| B8 | Resend OTP rate-limit message | ไม่มี — มีแค่ cooldown 30 วิ ต่อครั้ง |
| B9 | AC ระดับระบบ (HTTPS, token-based, session revoke) | เป็น contract — prototype แสดงไม่ได้ (ปกติ) |
| B10 | Analytics events ทั้งตาราง | prototype ไม่มี tracking layer (ปกติ) |

หมายเหตุ: กลุ่ม B ส่วนใหญ่เป็น server-side/contract behavior ที่ prototype จำลองไม่ได้ — น่าจะเป็น "spec เก็บไว้ แต่ระบุชัดว่า prototype ไม่ครอบ" มากกว่า removal ยกเว้น B1–B4 ที่เป็น UI state จริง ๆ (ต้องถามว่า spec ยังต้องการ state เหล่านี้ไหม)

---

## C. ขัดกันโดยตรง (conflicts ต้อง sync)

| # | Spec 01 บอก | Prototype ทำจริง | ข้อเสนอ |
|---|---|---|---|
| C1 | OTP สำเร็จ → เปลี่ยนเป็น Authenticated Member ทันที | OTP → profile → "Account created" → ต้อง Sign in เองอีกรอบ | แก้ spec ให้ตรง prototype (created → sign in) หรือระบุว่า social เข้าทันที email ต้อง sign in |
| C2 | Password ≥8 + ต้องมีตัวเลขหรือสัญลักษณ์ | Sign up: ≥8 + score≥2 (พิมพ์ใหญ่-เล็กอย่างเดียวก็ผ่าน, ไม่บังคับเลข/สัญลักษณ์); Change password: **≥6 ตัวอักษร** เท่านั้น (!) | prototype เองก็ไม่ consistent — spec ต้องตัดสิน rule เดียว (แนะนำตาม spec เดิม 8+ แล้วแจ้งว่า prototype deviate) |
| C3 | Global Login Required Dialog: title "Sign in to use this feature", primary=Sign in, secondary=Create account, tertiary=Not now | Member sheet: title "Join TukDaeng", primary=Sign up, secondary=Sign in, tertiary="Skip for now" + social buttons + scrim-dismiss | sync copy/ปุ่มตาม prototype (sheet ไม่ใช่ dialog) หรือยืนยัน spec เดิม |
| C4 | "ต้องยอมรับ Terms/Privacy ก่อนสมัคร / ไม่ยอมรับ submit ไม่ได้" | ไม่มี checkbox — ใช้ consent ผ่านปุ่ม Continue บน welcome + legal text ใต้ปุ่มสมัคร | spec เขียนเป็น "implied consent ผ่านการกด Continue/Create account พร้อม legal text" |
| C5 | Guest ใช้ไม่ได้: Like, Follow, Comment, Chat, **Make Offer**, Favorites, Following, Watch Alert, Add/Edit/Delete Asset | Gate list กว้างกว่ามาก (share, saved/wishlist collections, alerts tab, profile tab, post menus, report, board actions, settings, create) และ **ไม่มี Make Offer แล้ว** (offer ถูกถอด) | แก้ list ใน spec ให้ตรง gate selectors จริง + เอา Make Offer ออก (เข้า removal scope FSP-007) |
| C6 | Change Password error copy (EN ตรงตัว: "Current password is incorrect." ฯลฯ) + helper "At least 8 characters, with a number or symbol." | Helper บอก 6 ตัวอักษร, error copy ไทย/อังกฤษไม่ตรง spec ("รหัสผ่านปัจจุบันไม่ถูกต้อง กรุณาตรวจสอบ...") | sync copy ตาม prototype หรือ fix prototype ภายหลัง (อยู่ใน scope 13_SETTINGS — จดไว้ให้ FSP-013/014) |
| C7 | "Push notification permission ไม่ควรถูกบังคับใน Authentication flow" | มี notif pre-permission + OS dialog ใน onboarding (มีปุ่ม Skip — ไม่บังคับจริง) | spec ควรบันทึกว่ามีขั้น ask-permission แบบ skippable หลัง consent |
| C8 | Sign In ตรวจ account status Active/Suspended/Banned/deletion | ไม่มี status check เลย | เก็บ spec เป็น contract + ระบุ prototype ไม่ครอบ |

---

## D. Cross-module notes (ไม่ใช่ spec 01 แต่เจอระหว่างสแกน)

- `08_OFFER_MODULE.md` + offer refs: spec 01 บรรทัด ~128 ยังเขียน "Make Offer" ในรายการที่ guest ใช้ไม่ได้ → เข้า removal list แน่นอน (FSP-006/007)
- Consent/re-consent + legal versioning อาจควรอยู่ 00_GLOBAL หรือ 13_SETTINGS มากกว่า 01 — flag ให้ FSP-010/013 ตัดสิน
- Session model (member/guest/new) + guest gate = ของ 00_GLOBAL (FSP-010 ครอบ session model อยู่แล้วตาม plan)
- Change password + sign out + delete account อยู่ใน settings → FSP-013/014 แต่ spec 01 ครอบ contract อยู่ (ต้องตัดสินแบ่ง ownership)
- Coach marks/tour อาจเป็นของ 00_GLOBAL หรือ section onboarding ใหม่ใน 01

## E. สรุปจำนวน

- Prototype-only (ต้องเพิ่มใน spec): 13 กลุ่ม (A1–A13)
- Spec-only (ต้องตัดสินใจ): 10 รายการ (B1–B10)
- Conflicts: 8 รายการ (C1–C8)
