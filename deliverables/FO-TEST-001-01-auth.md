# FO-TEST-01 — Test Cases: Auth & Onboarding (FO prototype)

> Task: FO-TEST-01 ของชุด FO-TEST-001 · วันที่: 2026-10-27
> กติกาหลัก: `deliverables/FO-TEST-001-testcase-prompt.md` · Task breakdown: `deliverables/FO-TEST-001-task-breakdown.md`
> Source of Truth: `Prototypes/fo-flow/index.html` (โค้ด onboarding อยู่ช่วง ~L23106–23644; settings auth ~L15041–15095, 17474–17652, handler ~L21082–21333)
> สัญญาความครอบคลุม: `deliverables/FO-TEST-001-00-inventory.md` §2.1 เท่านั้น — ไม่เดา behavior เพิ่ม

## 0. วิธีใช้เอกสาร + สภาพแวดล้อม

- เปิด prototype ที่ `http://localhost:8901/index.html` (หรือเปิดไฟล์ตรง) — Viewport 440×956, ทดสอบทั้ง Light/Dark และ TH/EN ตามที่ระบุในเคส
- **First-run onboarding** จะขึ้นเฉพาะเมื่อ `localStorage.fo_onboarded` ว่าง — รีเซ็ตได้ 2 วิธี: ปุ่ม dev `"1st"` (obReplay — ล้าง fo_onboarded/fo_session/fo_newuser/fo_account/fo_member_hide/fo_toured แล้ว render ใหม่) หรือเคลียร์ localStorage ใน DevTools
- ปุ่ม dev `"v2"` (obRecon) ใช้จำลอง re-consent — ใช้ได้เฉพาะหลังจบ first-run onboarding แล้ว
- **Actor**: `GUEST` = session guest (เลือก Skip for now หรือ logout), `MEMBER` = sign in ด้วย demo `demo@tukdaeng.com` / `Tukdaeng123`, `NEW` = สมัครใหม่ (member powers แต่ข้อมูลว่าง — GUEST-001)
- **Type**: UI = การแสดงผล · Func = การทำงาน · Int = เชื่อมข้าม module · Edge = negative/boundary
- **Priority**: High = core flow/กติการะบบ · Medium = feature หลัก · Low = edge/cosmetic
- **[GATE]**: ทุก action ใน `GUEST_GATE_SEL` ที่ guest แตะ → `obGate()` (Member Sheet) — เคสในชุดนี้เทสต์ "mechanics ของ sheet กับ session" เท่านั้น; เมทริกซ์ gated action ทั้งหมดอยู่ใน task FO-TEST-17 ตามขอบเขต task breakdown
- localStorage keys ที่เกี่ยว: `fo_onboarded`, `fo_session`, `fo_account`, `fo_newuser`, `fo_member_hide`, `fo_toured`, `fo_consent`, `fo_consent_log`

## 1. Coverage Map ของ task นี้ (เทียบ inventory §2.1)

| Route/Overlay (inventory §2.1) | TC ID ที่ครอบ |
|---|---|
| onboarding `splash` | AUTH-001, 002 |
| onboarding `lang` | AUTH-003 – 005 |
| onboarding `welcome` | AUTH-006 – 008 |
| onboarding `consent` | AUTH-009 – 013 |
| onboarding `prefs` | AUTH-014 – 016 |
| onboarding `notif` | AUTH-017 – 019 |
| onboarding `track` | AUTH-020 – 022 |
| onboarding `member` (Join TukDaeng) | AUTH-023 – 027 |
| onboarding `signup` | AUTH-028 – 031 |
| onboarding `otp` | AUTH-032 – 036 |
| onboarding `profile` | AUTH-037 – 041 |
| onboarding `created` | AUTH-042 – 043 |
| onboarding `signin` | AUTH-044 – 049 |
| onboarding `forgot` | AUTH-050 – 052 |
| overlay `ob-legal` | AUTH-053 – 054 |
| actions exit/decline/hide/social/resend | AUTH-055 – 060 |
| `obGate()` + `GUEST_GATE_SEL` [GATE] | AUTH-061 – 068 |
| re-consent (`OB.recon`) | AUTH-069 – 072 |
| `settings → about_account` | AUTH-073 – 075 |
| `change_pwd` | AUTH-076 – 081 |
| `del_account` step 1–2 | AUTH-082 – 088 |
| dialog `delPasswordConfirm` / `delAccountSuccess` | AUTH-089 – 092 |
| dialog `forgotPwd` | AUTH-093 – 094 |
| dialog `logout` | AUTH-095 – 097 |

## 2. Test Cases

### 2.1 Splash & Language

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
|---|---|---|---|---|---|---|---|---|---|
| FO-TC-AUTH-001 | onboarding `splash` | GUEST | Func | เคลียร์ `fo_onboarded` (หรือกด "1st") | 1. เปิดแอป 2. สังเกต splash 3. รอ ~3.2 วินาที | splash auto-advance ไปหน้า `lang` โดยไม่ต้องแตะ | โลโก้ td-logo + ชื่อ "TukDaeng" + แถบ loading เคลื่อนไหว อยู่กลางจอ | High | |
| FO-TC-AUTH-002 | onboarding `splash` | GUEST | Edge | เหมือน 001 | 1. ระหว่าง splash แสดง แตะจอหลายครั้ง/รัว ๆ | ไม่มี skip — ต้องรอครบ 3.2s ถึงไป `lang`; ไม่เกิดกระโดดข้ามซ้ำ | หน้าจอนิ่ง ไม่มี error/กระพริบ | Low | |

### 2.2 Language select (`lang`)

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
|---|---|---|---|---|---|---|---|---|---|
| FO-TC-AUTH-003 | onboarding `lang` | GUEST | Func | onboarding ถึง `lang` | 1. แตะแถว "ไทย" 2. แตะ Continue | `state.lang` = th; แถวไทยมีเครื่องหมายถูก ปุ่ม Continue เปลี่ยนเป็น "ต่อไป" ทันที; ไปหน้า welcome ภาษาไทย | แถวที่เลือกมี class on + icon check 17px; แถว English ไม่มีเครื่องหมาย | High | |
| FO-TC-AUTH-004 | onboarding `lang` | GUEST | Func | onboarding ถึง `lang` | 1. แตะ "ไทย" แล้วแตะ "English" สลับกลับ | การเลือก toggle ได้ทั้งสองทิศทาง — check ย้ายตามแถวล่าสุด ปุ่มกลับเป็น "Continue" | มีเครื่องหมายถูกแค่แถวเดียวเสมอ | Medium | |
| FO-TC-AUTH-005 | onboarding `lang` | GUEST | UI | onboarding ถึง `lang` | 1. สังเกตหน้าจอโดยไม่แตะ | ค่าเริ่มต้นตรง `state.lang` ปัจจุบัน (default en → แถว English on) | หัวข้อ "Select your language · เลือกภาษา" สองภาษาเสมอ, 2 แถว English/ไทย + ปุ่ม Continue | Medium | |

### 2.3 Welcome

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
|---|---|---|---|---|---|---|---|---|---|
| FO-TC-AUTH-006 | onboarding `welcome` | GUEST | UI | ผ่าน `lang` แล้ว | 1. ตรวจองค์ประกอบหน้า welcome | — | รูปนาฬิกา (ob-welcome-hand), h1 "Welcome to the TukDaeng app", sub, ลิงก์ Terms of Use / Privacy Policy คั่นจุด, ข้อความ fine print เรื่องยอมรับเงื่อนไข, ปุ่ม Continue ชิดล่าง | Medium | |
| FO-TC-AUTH-007 | onboarding `welcome` | GUEST | Func | อยู่หน้า welcome | 1. แตะ Continue 2. แตะซ้ำระหว่าง loading 3. รอ ~1.5s | ปุ่ม disable + spinner แสดง กดซ้ำไม่ได้; ~1.5s แล้ว auto ไปหน้า `consent` | class loading บน page + `.ob-spin` ข้างลิงก์ legal; ปุ่มมี attribute disabled | High | |
| FO-TC-AUTH-008 | onboarding `welcome` | GUEST | Func | อยู่หน้า welcome | 1. แตะ "Terms of Use" 2. กด back/ปิดใน overlay 3. แตะ "Privacy Policy" | เปิด overlay `ob-legal` แสดงเอกสารที่ถูกต้อง; ปิดแล้วกลับมาหน้า welcome สภาพเดิม | overlay มี back + ชื่อเอกสาร + "v1.0 · Effective 19 Oct 2026" + เนื้อหาเป็น section + ปุ่ม Close | Medium | |

### 2.4 Consent (first-run page)

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
|---|---|---|---|---|---|---|---|---|---|
| FO-TC-AUTH-009 | onboarding `consent` | GUEST | UI | ผ่าน welcome | 1. ตรวจหน้า privacy notice | — | h1 "Privacy notice" + เอกสาร bullets 4 ข้อ (essential 2 / optional 2) + ย่อหน้าอธิบาย Accept/Reject + ลิงก์ Privacy Policy + 3 ปุ่ม: Accept all / Reject all (primary คู่) + Cookie settings (outline) | Medium | |
| FO-TC-AUTH-010 | onboarding `consent` | GUEST | Func | อยู่หน้า consent | 1. แตะ Accept all | `OB.opt` = analytics+personalized เปิดทั้งคู่, บันทึก `fo_consent`/`fo_consent_log`, ไปหน้า `notif` | หน้า notif permission แสดง | High | |
| FO-TC-AUTH-011 | onboarding `consent` | GUEST | Func | อยู่หน้า consent | 1. แตะ Reject all | `OB.opt` ทั้งคู่ปิด, ยังไปหน้า `notif` ได้ปกติ (ไม่มีบังคับ) | ไม่มี error; flow เดินหน้าต่อเหมือน Accept | High | |
| FO-TC-AUTH-012 | onboarding `consent` | GUEST | Func | อยู่หน้า consent | 1. แตะ Cookie settings | ไปหน้า `prefs` (Cookie settings page) | page มีปุ่ม back + toggles | Medium | |
| FO-TC-AUTH-013 | onboarding `consent` | GUEST | Func | อยู่หน้า consent | 1. แตะลิงก์ "Privacy Policy" ในเนื้อความ | เปิด `ob-legal` overlay ของ privacy; ปิดกลับมา consent เดิม | overlay ครอบทับ ไม่ทำลาย state หน้าเดิม | Low | |

### 2.5 Cookie settings (`prefs`)

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
|---|---|---|---|---|---|---|---|---|---|
| FO-TC-AUTH-014 | onboarding `prefs` | GUEST | UI | consent → Cookie settings | 1. ตรวจหน้า prefs | — | ปุ่ม back + h1 "Cookie settings" + แถว Essential (ป้าย "Always on" ไม่มี switch) + toggles Analytics/Personalization (default off) + ปุ่ม Save preferences | Medium | |
| FO-TC-AUTH-015 | onboarding `prefs` | GUEST | Func | อยู่หน้า prefs | 1. เปิด toggle Analytics 2. แตะ Save preferences | `OB.opt.analytics`=true (switch .on); Save → บันทึก consent + ไปหน้า `notif` | switch แถว Analytics เลื่อนเป็น on | High | |
| FO-TC-AUTH-016 | onboarding `prefs` | GUEST | Func | อยู่หน้า prefs (เคยเปิด toggle) | 1. แตะ back ด้านบน | กลับหน้า `consent`; ค่า toggle ที่ตั้งไว้คงอยู่ใน `OB.opt` | หน้า consent เหมือนเดิม | Medium | |

### 2.6 Notification ask (`notif`)

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
|---|---|---|---|---|---|---|---|---|---|
| FO-TC-AUTH-017 | onboarding `notif` | GUEST | UI | ผ่าน consent | 1. ตรวจหน้า notif | — | ปุ่ม back + รูป ob-notif-phone + h1 "Never miss an update" + sub + ปุ่ม Continue (primary) + Skip (outline) | Medium | |
| FO-TC-AUTH-018 | onboarding `notif` | GUEST | Func | อยู่หน้า notif | 1. แตะ Continue 2. ใน dialog แตะ Don't Allow 3. (ทำซ้ำ) แตะ Allow | Continue เปิด OS-style dialog; ทั้ง Don't Allow และ Allow → ไปหน้า `track` เหมือนกัน | dialog `ob-os` กลางจอ: "“TukDaeng” Would Like to Send You Notifications" + อธิบาย alerts/sounds/badges + ปุ่ม Don't Allow/Allow แนวนอน | High | |
| FO-TC-AUTH-019 | onboarding `notif` | GUEST | Func | อยู่หน้า notif | 1. แตะ Skip 2. (ทำซ้ำ) แตะ back | Skip → ไป `track` โดยไม่เปิด OS dialog; back → กลับ `consent` | ไม่มี dialog ปรากฏในเส้นทาง Skip | Medium | |

### 2.7 Tracking ask (`track`)

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
|---|---|---|---|---|---|---|---|---|---|
| FO-TC-AUTH-020 | onboarding `track` | GUEST | UI | ผ่าน notif | 1. ตรวจหน้า track | — | ปุ่ม back + รูป ob-track-phone + h1 "We suggest news that suits you" + sub + ปุ่ม Continue (ไม่มี Skip) | Medium | |
| FO-TC-AUTH-021 | onboarding `track` | GUEST | Func | อยู่หน้า track | 1. แตะ Continue 2. แตะ "Ask App Not to Track" | dialog tracking เด้ง; เลือกไม่ติดตาม → `OB.opt.personalized`=false → ไป `member` sheet | dialog: "Allow “TukDaeng” to track your activity across other companies’ apps and websites?" + ปุ่มแนวตั้ง Ask App Not to Track / Allow | High | |
| FO-TC-AUTH-022 | onboarding `track` | GUEST | Func | อยู่หน้า track | 1. แตะ Continue → Allow 2. (ทำซ้ำ) back จาก track | Allow → ไป `member` (ไม่แตะค่า personalized); back → กลับ `notif` | Member Sheet "Join TukDaeng" เด้งทับ | Medium | |

### 2.8 Member Sheet first-run (non-gate)

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
|---|---|---|---|---|---|---|---|---|---|
| FO-TC-AUTH-023 | onboarding `member` | GUEST | UI | ผ่าน track | 1. ตรวจ sheet | — | bottom sheet + grab handle + icon member + h2 "Join TukDaeng" + sub "Create a free account to follow collectors, chat and list your watches." + checkbox "Don't show this again" + ปุ่ม Sign up (pri) / Sign in (out) / Skip for now (text) + แถว or continue with + ปุ่ม Google/Apple สั้น | High | |
| FO-TC-AUTH-024 | onboarding `member` | GUEST | Func | อยู่ member sheet | 1. แตะ Sign up 2. (ทำซ้ำ) Sign in | Sign up → หน้า `signup`; Sign in → หน้า `signin` (เต็มจอ มี statusbar) | sheet เปลี่ยนเป็นหน้าเต็ม ob-page | High | |
| FO-TC-AUTH-025 | onboarding `member` | GUEST | Func | อยู่ member sheet (checkbox ไม่ติ๊ก) | 1. แตะ Skip for now | session = guest เข้า feed browse ได้; sheet ปิดเงียบ (ไม่มี toast); coach marks ชุด guest (OB_TOUR_GUEST) เด้งจุดแรก | feed แสดงปกติ + coach "Sign up to create your first post." ชี้ปุ่ม + | High | |
| FO-TC-AUTH-026 | onboarding `member` | GUEST | Func | อยู่ member sheet | 1. ติ๊ก "Don't show this again" 2. แตะ Skip for now 3. DevTools ลบ `fo_onboarded` แล้ว reload → เดิน onboarding ซ้ำถึงขั้น member | checkbox เปลี่ยนสถานะทันที; Skip + hide → `fo_member_hide`="1"; เมื่อ onboarding เล่นซ้ำ (ลบเฉพาะ `fo_onboarded`) ขั้น `member` จะถูก `obFinish` ข้ามเงียบ ๆ ไม่แสดง sheet ไป feed เลย | checkbox มี icon check + class on เมื่อติ๊ก; รอบสองไม่เห็น sheet เลย | Medium | |
| FO-TC-AUTH-027 | onboarding `member` | GUEST | Edge | อยู่ member sheet (first-run, non-gate) | 1. แตะ scrim ด้านหลัง sheet | sheet ไม่ปิด — scrim-tap ปิดได้เฉพาะ gate variant เท่านั้น | sheet ค้างอยู่ ไม่มีอะไรเปลี่ยน | Medium | |

### 2.9 Sign up (`signup`)

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
|---|---|---|---|---|---|---|---|---|---|
| FO-TC-AUTH-028 | onboarding `signup` | GUEST | UI | member → Sign up | 1. ตรวจฟอร์ม | — | back + h1 "Create your account" + sub + field Email/Password + แถบ strength meter 4 ขีด + hint + social block (Continue with Google/Apple) + ปุ่ม Create account + ลิงก์ Terms/Privacy | Medium | |
| FO-TC-AUTH-029 | onboarding `signup` | GUEST | Func | อยู่หน้า signup | 1. Create account โดยเว้นว่าง 2. กรอก email "abc" → submit 3. email `taken@example.com` + pw ≥8 → submit 4. email ถูก + pw ว่าง → submit 5. pw "abc1234" (7 ตัว) → submit | เคส 1: error ทั้ง email "Enter a valid email address." + pw "Enter a password."; เคส 2: email invalid error; เคส 3: "This email is already registered. Try signing in."; เคส 4: "Enter a password."; เคส 5: "Password must be at least 8 characters long." | field ที่ผิดมี class err + `.ob-msg` แดงใต้ช่อง; ไม่ไปหน้าถัดไป | High | |
| FO-TC-AUTH-030 | onboarding `signup` | GUEST | Func | อยู่หน้า signup | 1. กรอก email ถูกต้อง (เช่น `new@test.com`) + pw ≥8 2. แตะ Create account | ผ่าน validation → บันทึก credential ลง `fo_account` → ไปหน้า `otp` แสดง email ที่กรอก | หน้า otp: "We sent a 6-digit code to" + email ตัวหนา | High | |
| FO-TC-AUTH-031 | onboarding `signup` | GUEST | Edge | อยู่หน้า signup | 1. พิมพ์ pw ทีละแบบ (สั้น/ยาวผสม) ดู meter 2. แตะไอคอนตา (eye) 3. เคอร์เซอร์อยู่ช่องใดช่องหนึ่งกด Enter | meter `data-s` 0–4 ตาม obScore (ว่าง=0, pw มีค่าแรก≥1); eye สลับ type password↔text + ไอคอนเปลี่ยน; Enter = submit เหมือนกด Create account | meter 4 ขีดเปลี่ยนสถานะสด ๆ; eye ↔ eyeOff icon | Medium | |

### 2.10 OTP (`otp`)

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
|---|---|---|---|---|---|---|---|---|---|
| FO-TC-AUTH-032 | onboarding `otp` | GUEST | UI | signup ผ่านแล้ว | 1. ตรวจหน้า otp | — | back + h1 "Verify your email" + อีเมลที่ส่ง + ช่อง OTP 6 ช่อง (focus ช่องแรก) + บรรทัด resend + banner info "Demo code: 123456" | Medium | |
| FO-TC-AUTH-033 | onboarding `otp` | GUEST | Func | อยู่หน้า otp | 1. พิมพ์ `123456` | แต่ละช่องรับเฉพาะตัวเลข + auto-focus ช่องถัดไป; ครบ 6 หลัก auto-verify โดยไม่มีปุ่ม → ไปหน้า `profile` | ช่องเต็มทีละช่อง ไม่ต้องกดยืนยัน | High | |
| FO-TC-AUTH-034 | onboarding `otp` | GUEST | Func | อยู่หน้า otp | 1. พิมพ์ `000000` | ครบ 6 หลัก → msg "That code is incorrect. Try again." + ช่องทั้งหมดล้างหลัง ~450ms + focus กลับช่อง 1 | `.ob-otp` เพิ่ม class bad (shake/error style), `#obOtpMsg` แสดงข้อความ | High | |
| FO-TC-AUTH-035 | onboarding `otp` | GUEST | Func | อยู่หน้า otp | 1. รอนับถอยหลัง 30s จนเห็น "Resend code" 2. แตะ Resend code | ช่วงนับแสดง "Resend code in 0:NN" นับลงทีละวิ; เหลือ 0 → ปุ่ม Resend code; กด → reset 30 + toast "New code sent" | ปุ่มไม่แสดงระหว่างนับถอยหลัง; toast ขึ้นบน | High | |
| FO-TC-AUTH-036 | onboarding `otp` | GUEST | Edge | อยู่หน้า otp | 1. พิมพ์ตัวอักษร/อีโมจิในช่อง 2. ช่อง 3 ว่างแล้วกด Backspace 3. แตะ back | input ถูก strip เหลือเฉพาะเลข; Backspace บนช่องว่าง → focus ช่องก่อนหน้า; back → กลับ `signup` (ค่าฟอร์มยังอยู่ใน OB.f) | ช่องไม่รับ non-digit; ไม่มี error | Medium | |

### 2.11 Profile setup (`profile`)

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
|---|---|---|---|---|---|---|---|---|---|
| FO-TC-AUTH-037 | onboarding `profile` | GUEST | UI | otp ผ่านแล้ว | 1. ตรวจหน้า profile | — | ปุ่ม "Skip for now" มุมขวาบน (ไม่มี back) + avatar default + ลิงก์ Add photo + field Username (prefill ข้อเสนอแนะ) + ปุ่ม Continue | Medium | |
| FO-TC-AUTH-038 | onboarding `profile` | GUEST | Func | อยู่หน้า profile (สมัคร `new@test.com`) | 1. ดู username ที่ suggest 2. แตะ Continue | suggest = local-part อีเมล sanitize เป็น a-z0-9_. (fallback `memberNNNN`); Continue ด้วย username valid → บันทึกลง `fo_account` → ไปหน้า `created` (provider email) | หน้า created แสดง "Account created" | High | |
| FO-TC-AUTH-039 | onboarding `profile` | GUEST | Func | อยู่หน้า profile | 1. ลบ username ใส่ `ab` → Continue 2. ใส่ `ABC!!` → Continue 3. ใส่ `valid_name` → Continue | regex `^[a-z0-9_.]{3,20}$` (lowercase+trim ก่อนเช็ก); ผิด → error "Username required — 3–20 characters: a–z, 0–9, _ or ." + class err; ถูก → ผ่าน | error แดงใต้ช่อง user; field เดิมค้าง | High | |
| FO-TC-AUTH-040 | onboarding `profile` | GUEST | Edge | อยู่หน้า profile | 1. แตะ "Add photo" | toast "Photo picker opens here (prototype)" — `[DEAD]` placeholder | toast ปรากฏ ~1.8s ไม่มี picker จริง | Low | |
| FO-TC-AUTH-041 | onboarding `profile` | GUEST | Func | อยู่หน้า profile (username ที่ suggest ว่าง/invalid) | 1. ล้างช่องให้ว่าง/invalid 2. แตะ Skip for now | Skip ไม่บังคับ validation — ถ้า invalid ระบบ gen `obSuggestUser()` ให้แล้วเข้าสู่ `created` | ผ่านไป created เหมือนกรอกถูก | Medium | |

### 2.12 Account created (`created`)

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
|---|---|---|---|---|---|---|---|---|---|
| FO-TC-AUTH-042 | onboarding `created` | NEW | Func | profile ผ่านแล้ว | 1. ตรวจหน้า 2. แตะ Sign in | ปุ่ม Sign in → หน้า `signin` (ฟิลด์ยังคงค่าที่สมัคร เพราะ OB.f ไม่ว่าง → ไม่ prefill demo) | check icon วงกลม + h1 "Account created" + "Welcome, {username}. Sign in to start exploring." จัดกลาง | High | |
| FO-TC-AUTH-043 | onboarding `created` | NEW | Int | อยู่หน้า created | 1. แตะ Sign in 2. กด Sign in ด้วย credential ที่เพิ่งสมัคร | เข้าระบบ session `new` → feed (member powers แต่ข้อมูลว่าง: saved/alert/chat ว่าง, CP_ME.name=username); onboarding จบ + coach marks ชุด member เด้ง (ครั้งแรกเท่านั้น) | feed ปกติ + coach จุดแรก "Tap + to create your first post." | High | |

### 2.13 Sign in (`signin`)

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
|---|---|---|---|---|---|---|---|---|---|
| FO-TC-AUTH-044 | onboarding `signin` | GUEST | UI | member → Sign in | 1. ตรวจหน้า | — | back + h1 "Sign in" + sub "Welcome back to TukDaeng." + Email/Password + eye + ลิงก์ "Forgot password?" + ปุ่ม Sign in + social block + "New here? Create account" | Medium | |
| FO-TC-AUTH-045 | onboarding `signin` | GUEST | Func | เข้าหน้า signin ตรง (ฟิลด์ว่าง) | 1. สังเกตค่า prefill 2. กด Sign in | ฟิลด์ว่าง → prefill demo `demo@tukdaeng.com`/`Tukdaeng123`; กด → credential ตรง OB_DEMO → session `member` เข้า feed เงียบ (ไม่มี toast, ไม่มี coach ถ้าเคยจบ onboarding) | feed mock data เต็ม (member เดิม) | High | |
| FO-TC-AUTH-046 | onboarding `signin` | GUEST | Func | อยู่หน้า signin | 1. ล้างทั้งสองช่อง → Sign in 2. email `abc` → Sign in 3. email ถูก + pw ว่าง → Sign in | เคส 1: "Enter your email." + "Enter your password."; เคส 2: "Enter a valid email address."; เคส 3: "Enter your password." | error รายฟิลด์ `.ob-msg` + class err; ไม่นับ tries | High | |
| FO-TC-AUTH-047 | onboarding `signin` | GUEST | Edge | อยู่หน้า signin | 1. กรอก email ถูกรูปแบบ + pw ผิด → Sign in 2. กดซ้ำถึงครั้งที่ 5 | ผิด → form banner "Email or password is incorrect. (N/5)" นับ tries++; ครั้งที่ 5 → banner "Too many attempts. Try again in 15 minutes or reset your password." + ปุ่ม Sign in disabled | banner แดงเหนือฟิลด์ (E.form); ปุ่มมี disabled | High | |
| FO-TC-AUTH-048 | onboarding `signin` | GUEST | Func | มีบัญชีสมัครใหม่ใน `fo_account` | 1. signin ด้วย email+pw ที่สมัครไว้ | credential ตรง OB.account/fo_account → session `new` (empty member) — ต่างจาก demo ที่เป็น `member` | feed ว่างสไตล์ new member; CP_ME.name = username ที่ตั้ง | High | |
| FO-TC-AUTH-049 | onboarding `signin` | GUEST | Edge | อยู่หน้า signin | 1. ผิดจนโดนล็อก (≥5) 2. ลองกรอก credential ถูก → กด Sign in | ปุ่ม disabled ตั้งแต่ render — submit ไม่ได้เลย ไม่มีเส้นทางปลดล็อกใน prototype นอกจาก reload หน้า (`OB.tries` เป็น state ใน JS รีเซ็ตเอง) `[OPEN]` cooldown 15 นาทีไม่มี timer จริง | ปุ่มค้าง disabled; banner ยังแสดง | Medium | |

### 2.14 Forgot password (`forgot`)

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
|---|---|---|---|---|---|---|---|---|---|
| FO-TC-AUTH-050 | onboarding `forgot` | MEMBER | UI | signin → Forgot password? | 1. แตะลิงก์ 2. ตรวจหน้า | เข้าหน้า `forgot` | back + h1 "Reset password" + sub + field Email + ปุ่ม Send reset link | Medium | |
| FO-TC-AUTH-051 | onboarding `forgot` | MEMBER | Func | อยู่หน้า forgot | 1. กรอก email ถูกรูปแบบ → Send reset link 2. แตะ Back to sign in | email valid → `OB.sent`=true → หน้า sent "Check your email / If an account exists for {email}, we sent a reset link."; Back → กลับ `signin` | หน้า sent มี check icon + ปุ่ม Back to sign in | High | |
| FO-TC-AUTH-052 | onboarding `forgot` | MEMBER | Func | อยู่หน้า forgot | 1. เว้นว่าง/ใส่ email ผิด → Send reset link | error "Enter a valid email address."; ไม่ไปหน้า sent | field err + `.ob-msg` | Medium | |

### 2.15 Legal overlay (`ob-legal`)

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
|---|---|---|---|---|---|---|---|---|---|
| FO-TC-AUTH-053 | overlay `ob-legal` | GUEST | Func | อยู่ขั้นใดก็ได้ที่มี legal link (welcome/consent/signup) | 1. แตะ "Terms of Use" 2. แตะ "Privacy Policy" | overlay เปิดทับขั้นเดิม แสดงเอกสารที่เลือก (Terms 3 sections / Privacy 4 sections) | header: back + ชื่อเอกสาร + "v1.0 · Effective 19 Oct 2026" + h3/p แต่ละ section + ปุ่ม Close ล่าง | Medium | |
| FO-TC-AUTH-054 | overlay `ob-legal` | GUEST | Func | ob-legal เปิดอยู่ | 1. กด back 2. (ทำซ้ำ) กด Close | ทั้งสองวิธีปิด overlay กลับขั้นเดิมพอดี (state ไม่หาย — เช่นฟอร์ม signup ที่กรอกค้าง) | หน้าจอเดิมกลับมาสมบูรณ์ | Medium | |

### 2.16 Onboarding actions (hide / eye / resend / social / exit·decline)

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
|---|---|---|---|---|---|---|---|---|---|
| FO-TC-AUTH-055 | action `hide` | GUEST | Func | member sheet (non-gate) | 1. แตะ checkbox "Don't show this again" ซ้ำหลายครั้ง | toggle `OB.hide` สลับทุกครั้ง ไม่พลิกผิดจังหวะ | icon check ปรากฏ/หาย + aria-checked ตาม | Low | |
| FO-TC-AUTH-056 | action `eye` | GUEST | Func | signup หรือ signin | 1. แตะปุ่ม eye ข้างช่อง password 2. แตะอีกครั้ง | input type สลับ password↔text; กับช่องอื่นไม่เกี่ยว | icon eye ↔ eyeOff เปลี่ยน; ข้อความโชว์/เป็น • เมื่อ hide | Medium | |
| FO-TC-AUTH-057 | action `resend` | GUEST | UI | หน้า otp ระหว่างนับถอยหลัง | 1. สังเกตบริเวณ resend ทุก ๆ 5 วิ | ขณะ `resend>0` แสดง text "Resend code in 0:NN" (ไม่ใช่ปุ่ม — กดไม่ได้) | hint อัปเดตทุกวินาที 0:30→0:00 | Medium | |
| FO-TC-AUTH-058 | action `social` — Google | GUEST | Func | member sheet (non-gate) หรือหน้า signup | 1. แตะ Continue with Google | first-time path → prefill OB_SOCIAL.google (email `matem.watch@gmail.com`, ชื่อ, รูป) → ข้ามไปหน้า `profile` username suggest `matem_watch` | profile step มีรูป social เป็น avatar + username เติมให้ | High | |
| FO-TC-AUTH-059 | action `social` — Apple | GUEST | Func | เหมือน 058 | 1. แตะ Continue with Apple | เหมือน Google แต่ใช้ OB_SOCIAL.apple (`matem@privaterelay.appleid.com`) → username suggest `matem` | avatar = รูป u-1104 | Medium | |
| FO-TC-AUTH-060 | action `exit`/`decline` | MEMBER | Edge | — | 1. ไล่หา trigger ของ Decline/Exit ใน first-run consent page | หน้า consent first-run **ไม่มี** Decline/Exit (มีแค่ Accept all/Reject all/Cookie settings) — ปุ่มทั้งสองมีเฉพาะใน re-consent sheet; branch "App closed (demo)" แทบ unreachable `[OPEN]` mark เป็น dead-path | ไม่มีปุ่ม Decline/Exit บน consent page | Low | |

### 2.17 Guest Gate — `obGate()` + `GUEST_GATE_SEL` [GATE]

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
|---|---|---|---|---|---|---|---|---|---|
| FO-TC-AUTH-061 | `obGate()` trigger | GUEST | Func | session guest บน feed | 1. แตะ like บน post card (`.like-btn` อยู่ใน GUEST_GATE_SEL) | action ถูกดักก่อนทำงาน — Member Sheet เปิด; โพสต์ **ไม่ถูก like** | sheet "Join TukDaeng" + sub "Sign in or create a free account to use this feature." (gate copy ต่างจาก first-run) | High | |
| FO-TC-AUTH-062 | `obGate()` dismiss | GUEST | Func | gate sheet เปิดอยู่ | 1. แตะ scrim ด้านหลัง | sheet ปิด (เฉพาะ gate variant) — ยังเป็น guest, หน้าเดิมไม่เปลี่ยน, action เดิมไม่ทำงาน | sheet เลื่อนลงหาย; feed สภาพเดิม | High | |
| FO-TC-AUTH-063 | `obGate()` skip | GUEST | Func | gate sheet เปิดอยู่ | 1. แตะ "Skip for now" | session ยัง guest, sheet ปิดเงียบ ไม่มี toast/coach | กลับหน้าเดิมเหมือนไม่เคยเปิด | High | |
| FO-TC-AUTH-064 | `obGate()` UI | GUEST | UI | gate sheet เปิดอยู่ | 1. เทียบกับ first-run member sheet (AUTH-023) | gate variant **ไม่มี** checkbox "Don't show this again" และ sub เป็น gate copy | ปุ่มยัง Sign up / Sign in / Skip for now + social row | Medium | |
| FO-TC-AUTH-065 | `obGate()` → sign in | GUEST→MEMBER | Int | guest แตะ like → sheet เปิด | 1. แตะ Sign in 2. sign in ด้วย demo creds | เข้าสู่ระบบ session member → กลับ feed หน้าเดิม; **action เดิมไม่ auto-resume** — โพสต์ยังไม่ถูก like ต้องแตะใหม่ | feed เหมือนเดิม + ตอนนี้ member (gate ไม่เด้งอีก) | High | |
| FO-TC-AUTH-066 | `obGate()` → sign up | GUEST→NEW | Int | gate sheet เปิดอยู่ | 1. Sign up → กรอก email+pw → OTP `123456` → profile → created → Sign in | เดิน signup flow ครบเหมือน non-gate → session `new` → feed | flow เดียวกันกับ first-run sign-up | Medium | |
| FO-TC-AUTH-067 | `GUEST_GATE_SEL` [GATE] | MEMBER | Func | session member บน feed | 1. แตะ like/save/share/comment/create/follow ฯลฯ | member ไม่เจอ sheet — action ทำงานปกติทุกตัว (คู่ guest ของ 061) | ไม่มี Member Sheet; like toggle/save sheet ฯลฯ เปิดตามปกติ | High | |
| FO-TC-AUTH-068 | `GUEST_GATE_SEL` nav [GATE] | GUEST vs MEMBER | Func | feed | 1. guest: แตะ bottom nav chat/alerts/profile ทีละแท็บ 2. member: แตะแท็บเดิม | guest → Member Sheet ทุกครั้ง แท็บ**ไม่สลับ** (อยู่ feed); member → สลับแท็บปกติ | guest: sheet ทับอยู่บน feed เสมอ; badge/แท็บไม่เปลี่ยน | High | |

### 2.18 Re-consent (`OB.recon`)

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
|---|---|---|---|---|---|---|---|---|---|
| FO-TC-AUTH-069 | re-consent sheet | MEMBER | Func | จบ onboarding แล้ว (member) | 1. กดปุ่ม dev "v2" | sheet consent แบบ recon เด้งทับ feed | sheet: "We've updated our policies" + อธิบาย + แถวเอกสาร Terms/Privacy (ป้าย Required, "v1.1 · Tap to read") + toggles Analytics/Personalized content + Accept & continue + Decline | Medium | |
| FO-TC-AUTH-070 | re-consent legal | MEMBER | Func | recon sheet เปิด | 1. แตะแถว Terms of Use / Privacy Policy | เปิด `ob-legal` view ภายใน overlay แสดง "v1.1"; ปิดกลับมา sheet เดิม | header back + เอกสาร v1.1 | Medium | |
| FO-TC-AUTH-071 | re-consent accept | MEMBER | Func | recon sheet เปิด | 1. (ปรับ toggle ตามใจ) แตะ Accept & continue | `obAccept()` → บันทึก `fo_consent` + ปิด sheet + toast "Thanks — updated policies accepted"; session ยัง member | toast ปรากฏบน feed; sheet หาย | High | |
| FO-TC-AUTH-072 | re-consent decline→exit | MEMBER | Func | recon sheet เปิด | 1. แตะ Decline 2. แตะ "Sign out" (ปุ่มที่เปลี่ยนจาก Decline) | Decline → banner เตือน "You need to accept the required Terms..." + ปุ่มเปลี่ยนเป็น Sign out; Sign out → toast "Signed out (demo)" + onboarding เด้งที่ `member` step ให้ sign in ใหม่ | banner แดงใน sheet; หลัง exit เห็น member sheet | High | |

### 2.19 Settings → About your account

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
|---|---|---|---|---|---|---|---|---|---|
| FO-TC-AUTH-073 | `about_account` | MEMBER | UI | settings → About your account | 1. ตรวจหน้า | — | hero: avatar + display name + @username; section Account information: Date joined + Account based in Thailand; Security: Change password (chev); Account management: Delete account (ตัวแดง) | Medium | |
| FO-TC-AUTH-074 | `about_account` | MEMBER vs NEW | Func | เปิด about_account | 1. member demo เปิดดู Date joined 2. session `new` (สมัครใหม่) เปิดดูอีกครั้ง | member → "October 2024"; new → "October 2026"; hero name/@ = CP_ME/PROFILES ของ session นั้น (new → username ที่ตั้งเอง) | ข้อมูลตรง session | Medium | |
| FO-TC-AUTH-075 | `about_account` nav | MEMBER | Func | อยู่หน้า about_account | 1. แตะ Change password 2. back 3. แตะ Delete account | ไป `change_pwd` / `del_account` ถูกต้อง; back กลับ about_account | sub-page slide ตามปกติ | Medium | |

### 2.20 Change password (`change_pwd`)

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
|---|---|---|---|---|---|---|---|---|---|
| FO-TC-AUTH-076 | `change_pwd` | MEMBER | UI | about_account → Change password | 1. ตรวจหน้า | — | คำอธิบายกติกา ≥8 ตัว+ตัวเลข+อักขระพิเศษ; 3 ฟิลด์ Current/New/Re-type แต่ละอันมี eye; ลิงก์ "Forgot your password?"; ปุ่ม Change password | Medium | |
| FO-TC-AUTH-077 | `change_pwd` | MEMBER | Func | อยู่หน้า change_pwd (pwd ปัจจุบัน `fox1234`) | กด Change password ทีละเคส: 1. เว้นหมด 2. current ผิด (`wrong123`) 3. current ถูก + new ว่าง 4. new `abc1234` (<8) 5. new = `fox1234` (=current) 6. new ถูก + confirm ไม่ตรง | error ตามลำดับ: "Please enter your current password." → "Your current password was entered incorrectly..." → "Please enter a new password." → "Password must be at least 8 characters long." → "New password must be different from your current password." → "Passwords do not match..." — เช็กทีละข้อ ข้อก่อนหน้าผ่านก่อนถึงเจอข้อถัดไป | `#cpwd-err` แดง + field ที่ผิด `.is-err` + focus ไปช่องนั้น | High | |
| FO-TC-AUTH-078 | `change_pwd` | MEMBER | Func | อยู่หน้า change_pwd | 1. current `fox1234` 2. new `Newpass1!` 3. confirm `Newpass1!` 4. กด Change password | ผ่าน → `state.userPwd` อัปเดต → `subBack` กลับ about_account + toast "Password changed successfully" | toast ปรากฏ; กลับหน้าก่อนหน้า | High | |
| FO-TC-AUTH-079 | `change_pwd` | MEMBER | Edge | เปลี่ยนรหัสผ่านแล้ว (078) | 1. เข้า change_pwd อีกครั้ง 2. current `fox1234` เดิม → submit 3. current `Newpass1!` → submit ต่อให้จบ | pwd เดิมผิดแล้ว → "entered incorrectly"; pwd ใหม่เป็น active แทน — เปลี่ยนรอบสองได้ | error ตามเงื่อนไข | Medium | |
| FO-TC-AUTH-080 | `change_pwd` forgot | MEMBER | Func | อยู่หน้า change_pwd | 1. แตะ "Forgot your password?" | เปิด dialog `forgotPwd` (ดู 2.22) | dialog เด้งกลางจอ | Medium | |
| FO-TC-AUTH-081 | `change_pwd` eye | MEMBER | Edge | อยู่หน้า change_pwd | 1. พิมพ์ทั้ง 3 ช่อง 2. แตะ eye ของแต่ละช่องทีละอัน | แต่ละช่องสลับ show/hide อิสระกัน | icon เปลี่ยนเฉพาะช่องนั้น | Low | |

### 2.21 Delete account (`del_account` step 1–2)

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
|---|---|---|---|---|---|---|---|---|---|
| FO-TC-AUTH-082 | `del_account` step1 | MEMBER | UI | about_account → Delete account | 1. ตรวจหน้า | — | hero icon trash + "We're sorry to see you go" + การ์ดเงื่อนไข 3 ใบ: 30-Day Grace Period / Permanent Deletion after 30 days / Watch Alerts Cancelled + ปุ่ม Continue to delete (primary) + Keep my account (secondary) | Medium | |
| FO-TC-AUTH-083 | `del_account` step1 | MEMBER | Func | อยู่ step1 | 1. แตะ Keep my account | `sub-back` ออกจาก del_account กลับ about_account | ไม่มี dialog; stack ปกติ | Medium | |
| FO-TC-AUTH-084 | `del_account` step1→2 | MEMBER | Func | อยู่ step1 | 1. แตะ Continue to delete | `_delStep`=2 → หน้าเหตุผล | h1 "Why are you leaving?" | High | |
| FO-TC-AUTH-085 | `del_account` step2 | MEMBER | UI | อยู่ step2 | 1. ตรวจหน้า | — | title+sub + radio เหตุผล 6 ตัว (no longer using / privacy concerns / too many notifications / second account / trouble / something else) + textarea Additional feedback (optional) + ปุ่ม Continue + Back | Medium | |
| FO-TC-AUTH-086 | `del_account` step2 validation | MEMBER | Func | อยู่ step2 | 1. กด Continue โดยไม่เลือกเหตุผล 2. เลือกเหตุผลแล้วดู error | ไม่เลือก → `#del-reason-err` "Please select a reason to continue." แสดง + scroll ไปหา; เลือกเหตุผล → error ซ่อนทันที | radio `.is-selected` เฉพาะตัวที่เลือก (เลือกได้ทีละตัว) | High | |
| FO-TC-AUTH-087 | `del_account` step2 back | MEMBER | Func | อยู่ step2 | 1. กด Back (ในหน้า) 2. กด header back (`sub-back`) | ทั้งสองกลับ step1 — เฉพาะ del_account ที่ back ถูก intercept ให้ถอย step ไม่ pop ทั้งหน้า | กลับหน้า terms cards | Medium | |
| FO-TC-AUTH-088 | `del_account` step2 → dialog | MEMBER | Func | เลือกเหตุผลแล้ว | 1. (ไม่กรอก feedback — optional) กด Continue | เปิด `delPasswordConfirm` dialog; feedback ว่างก็ผ่านได้ | dialog อยู่กลางจอ + input focus รหัสผ่าน | High | |

### 2.22 Dialogs: delPasswordConfirm / delAccountSuccess / forgotPwd

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
|---|---|---|---|---|---|---|---|---|---|
| FO-TC-AUTH-089 | `delPasswordConfirm` | MEMBER | UI | dialog เปิดจาก step2 | 1. ตรวจ dialog | — | "Confirm account deletion" + คำอธิบาย 30-day grace + ช่อง Current password + eye + ปุ่ม Delete account (danger) + Cancel | Medium | |
| FO-TC-AUTH-090 | `delPasswordConfirm` validation | MEMBER | Func | dialog เปิด | 1. กด Delete account โดยว่าง 2. กรอก `wrong999` → submit | ว่าง → "Please enter your password."; ผิด (`state.mockPassword` หรือ `fox1234`) → "Incorrect password. Please try again." | `#del-acc-pwd-err` แดง + input `.is-err` + focus กลับช่อง | High | |
| FO-TC-AUTH-091 | `delAccountSuccess` | MEMBER | Func | กรอกรหัส `fox1234` ถูก | 1. submit 2. อ่านเนื้อหา success dialog | ถูก → success dialog; วันที่ลบ = today+30d format ตาม locale (EN `en-US` / TH `th-TH` ปี พ.ศ.) | trash icon + "Account deletion scheduled" + "scheduled for permanent deletion on {date} (30 days)" + ข้อความ login ก่อนกำหนดเพื่อ restore + ปุ่ม Log out เพียงปุ่มเดียว | High | |
| FO-TC-AUTH-092 | `delAccountSuccess` → logout | MEMBER→GUEST | Int | success dialog เปิด | 1. กด Log out 2. (optional) sign in กลับ | ปิด dialog+stack → session guest + feed scroll top + toast "Account deactivated. 30-day grace period started." + Member Sheet เด้งให้ sign in เพื่อ restore; sign in demo กลับ → member ใช้งานได้ตามปกติ (= restore ใน grace) | toast + sheet "Join TukDaeng" | High | |
| FO-TC-AUTH-093 | `forgotPwd` dialog | MEMBER | Func | change_pwd → Forgot your password? | 1. ตรวจ dialog 2. กด Send reset link 3. (ทำซ้ำ) Cancel | dialog "Reset password?" + อีเมล mask `k***@tukdaeng.com` (member demo); Send → ปิด + toast "Password reset link sent to k***@tukdaeng.com"; Cancel → ปิดเฉย ๆ | mask = ตัวอักษรตัวแรก + *** + @domain | Medium | |
| FO-TC-AUTH-094 | `forgotPwd` session new | NEW | Edge | session `new` + เปิด dialog | 1. เปิด forgotPwd | อีเมล mask จาก `fo_account` ของตัวเอง (ตัวแรก + `***@domain`) ไม่ใช่ค่า demo | mask ตรงอีเมลที่สมัคร | Low | |

### 2.23 Log out dialog

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
|---|---|---|---|---|---|---|---|---|---|
| FO-TC-AUTH-095 | `logout` dialog | MEMBER | UI | settings → Log out | 1. แตะ Log out ที่ท้าย settings | เปิด confirm dialog | "Log out of @{username}?" + "You will need to sign in again to access your account." + ปุ่ม Log out (danger) + Cancel | Medium | |
| FO-TC-AUTH-096 | `logout` confirm | MEMBER→GUEST | Func | dialog เปิด | 1. กด Log out | ปิด dialog + ล้าง sub-stack + session guest + feed scroll top + toast "Logged out successfully" + Member Sheet เด้ง (sign in กลับได้ทันที) | feed guest + sheet | High | |
| FO-TC-AUTH-097 | `logout` cancel | MEMBER | Func | dialog เปิด | 1. กด Cancel | ปิด dialog เฉย ๆ — ยัง member, อยู่หน้า settings เดิม | ไม่มี toast; state ไม่เปลี่ยน | Medium | |

## 3. หมายเหตุ / OPEN items

- **[OPEN] AUTH-049** — ปุ่ม Sign in disabled ตลอดหลัง tries ≥5 และไม่มี timer ปลดล็อกใน prototype; ข้อความบอก "15 minutes" แต่ไม่มีจับเวลาจริง (recover ด้วย refresh/1st)
- **[OPEN] AUTH-060** — branch "App closed (demo)" ของ `exit` แทบ unreachable: Decline/Exit มีเฉพาะใน re-consent sheet (recon แสดง "Sign out" → "Signed out (demo)"); first-run consent ไม่มีปุ่ม Decline เลย
- **[OPEN]** "login-to-restore" ของ delete account — prototype ไม่มีหน้า restore เฉพาะ; sign in กลับปกติ = restore (AUTH-092 step 2 ครอบเท่าที่โค้ดทำได้)
- **`?dev=1` / ปุ่ม "1st" "v2"** = prototype harness — ใช้เป็น test setup เท่านั้น ไม่ใช่ production behavior
- ทุก coach mark (OB_TOUR / OB_TOUR_GUEST) แสดงครั้งเดียวต่อ `fo_toured` — เคสที่เกี่ยวอยู่ใน AUTH-025/043; tour mechanics เต็ม (Next/Got it/แตะนอกปิด) จะอยู่ใน task Shell ถ้าต้องการ detail เพิ่ม
- ขอบเขตที่ตัดออกตาม task breakdown: เคส gated action ทุกตัวของแอป (FO-TEST-17), change_pwd/del_account ในฐานะหน้า settings (FO-TEST-15 ครอบ entry/menu), E2E buyer/seller journey (FO-TEST-18)
