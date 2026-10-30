# FO-TEST-01 — Test Cases: Auth & Onboarding (สำหรับเทสแอปจริงบนมือถือ)

> Task: FO-TEST-01 ของชุด FO-TEST-001 · ปรับเป็นเวอร์ชันเทสแอปจริง: 2026-10-28
> กติกาหลัก: `deliverables/FO-TEST-001-testcase-prompt.md` · Task breakdown: `deliverables/FO-TEST-001-task-breakdown.md`
> แหล่งออกแบบเคส: `Prototypes/fo-flow/index.html` (ใช้เป็นแม่แบบแตกเคส/expected เท่านั้น — ทุกเคสเขียนให้ทำบนแอปจริงได้)
> สัญญาความครอบคลุม: `deliverables/FO-TEST-001-00-inventory.md` §2.1 เท่านั้น — ไม่เดา behavior เพิ่ม

## 0. สภาพแวดล้อมเทส + วิธีใช้เอกสาร

- **อุปกรณ์:** โทรศัพท์มือถือเครื่องจริง ติดตั้งแอป TukDaeng build ทดสอบจาก Google Play (Android) / App Store หรือ TestFlight (iOS) ตามที่ทีมแจก หรือ build stg ที่เดฟ implement — ห้ามเทสผ่าน browser/prototype
- รีเซ็ต onboarding ด้วย **การลบแอปแล้วติดตั้งใหม่** หรือ Clear app data (Android: ตั้งค่าระบบ → Apps → TukDaeng → Storage → Clear data)
- **Actor**: `GUEST` = ยังไม่ล็อกอิน (เดิน onboarding แล้วกด Skip for now หรือ logout), `MEMBER` = ล็อกอินบัญชีทดสอบที่ทีมมอบหมาย, `NEW` = สมัครบัญชีใหม่ผ่าน flow จริง (member powers แต่ข้อมูลว่าง)
- **ข้อมูลทดสอบที่ต้องได้จากทีมก่อนเริ่ม (SETUP-06):** บัญชีทดสอบ (email+password), อีเมลที่ลงทะเบียนแล้ว (สำหรับเคส duplicate), ช่องทางรับ OTP จริง (อีเมล/SMS ของ tester หรือ test OTP ที่ backend รองรับ)
- **ตัวเลขเวลา** (เช่น splash ~3 วิ, OTP resend ~30 วิ, lockout ~15 นาที) — ตัวเลขที่มี ~ คือพฤติกรรมโดยประมาณ (contract = พฤติกรรมนั้นเกิด เช่น toast หายเอง); ตัวเลขเป๊ะ (lockout 15 นาที, cap, เพดาน) ต้องตรง design — ต่าง = FAIL
- **ข้อความ EN ในคอลัมน์ expected** เป็นค่าอ้างอิงจาก design — wording ต่างจาก spec = FAIL (ข้อความ UI ที่ spec ระบุเป็นค่าล็อก)
- **คอลัมน์ "ทดสอบบน (Device/OS)"** ใน checklist(เช่น `iPhone 15 · iOS 18`, `Galaxy S24 · Android 15`); เคสที่รันคนละเครื่องให้บันทึกค่าที่ใช้
- **Type**: UI = การแสดงผล · Func = การทำงาน · Int = เชื่อมข้าม module · Edge = negative/boundary
- **Priority**: High = core flow/กติการะบบ · Medium = feature หลัก · Low = edge/cosmetic
- **[GATE]**: action ที่ guest แตะแล้วเด้ง Member Sheet — เคสในชุดนี้เทสต์ mechanics ของ sheet กับ session เท่านั้น; เมทริกซ์ gated action ทั้งหมดอยู่ใน task FO-TEST-17
- ⚠️ **เคส destructive** (ลบบัญชี AUTH-088–092) ใช้เฉพาะบัญชีทดสอบที่สร้างมาเพื่อลบเท่านั้น
- ⚠️ **เคสที่ต้องอาศัยฝั่ง backend** (re-consent AUTH-069–072) ทำได้เฉพาะเมื่อทีมออก policy version ใหม่จริง — ถ้าทำไม่ได้ให้ mark BLOCK พร้อมเหตุผล

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
| onboarding `signin` | AUTH-044 – 049, 098 – 104 |
| onboarding `forgot` | AUTH-050 – 052 |
| overlay เอกสาร legal (Terms/Privacy) | AUTH-053 – 054 |
| actions exit/decline/hide/social/resend | AUTH-055 – 060 |
| Guest Gate — Member Sheet จาก gated action [GATE] | AUTH-061 – 068 |
| re-consent | AUTH-069 – 072 |
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
| FO-TC-AUTH-001 | onboarding `splash` | GUEST | Func | ติดตั้งแอปใหม่/เคลียร์ data แล้ว | 1. เปิดแอป 2. สังเกต splash โดยไม่แตะอะไร | splash auto-advance ไปหน้าเลือกภาษาเองโดยไม่ต้องแตะ | โลโก้ + ชื่อ "TukDaeng" + แถบ loading เคลื่อนไหว อยู่กลางจอ | High | |
| FO-TC-AUTH-002 | onboarding `splash` | GUEST | Edge | เหมือน 001 | 1. ระหว่าง splash แสดง แตะจอหลายครั้ง/รัว ๆ | splash ไม่ถูกข้าม — แสดงครบเวลาแล้วค่อยไปหน้าภาษา ไม่เกิดกระโดดข้ามซ้ำ | หน้าจอนิ่ง ไม่มี error/กระพริบ | Low | |

### 2.2 Language select (`lang`)

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
|---|---|---|---|---|---|---|---|---|---|
| FO-TC-AUTH-003 | onboarding `lang` | GUEST | Func | onboarding ถึงหน้าภาษา | 1. แตะแถว "ไทย" 2. แตะปุ่มต่อไป | เลือกไทยแล้วแตะ Continue ไปหน้า welcome ภาษาไทย; แถวที่เลือกมีเครื่องหมายถูก | แถวที่เลือกมีเครื่องหมายถูก; แถว English ไม่มีเครื่องหมาย | High | |
| FO-TC-AUTH-004 | onboarding `lang` | GUEST | Func | onboarding ถึงหน้าภาษา | 1. แตะ "ไทย" แล้วแตะ "English" สลับกลับ | การเลือก toggle ได้ทั้งสองทิศทาง — check ย้ายตามแถวล่าสุด มีเครื่องหมายถูกแถวเดียวเสมอ | มีเครื่องหมายถูกแค่แถวเดียวเสมอ | Medium | |
| FO-TC-AUTH-005 | onboarding `lang` | GUEST | UI | onboarding ถึงหน้าภาษา | 1. สังเกตหน้าจอโดยไม่แตะ | ภาษาเริ่มต้นตามภาษาของอุปกรณ์ (ไม่ใช่ไทยใช้ English) พร้อมเครื่องหมายถูก | หัวข้อสองภาษา "Select your language · เลือกภาษา" + แถว English/ไทย + ปุ่ม Continue | Medium | |

### 2.3 Welcome

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
|---|---|---|---|---|---|---|---|---|---|
| FO-TC-AUTH-006 | onboarding `welcome` | GUEST | UI | ผ่านหน้าภาษาแล้ว | 1. ตรวจองค์ประกอบหน้า welcome | — | รูปนาฬิกา + หัวข้อ "Welcome to the TukDaeng app" + ข้อความรอง + ลิงก์ Terms of Use / Privacy Policy + ข้อความเล็กเรื่องยอมรับเงื่อนไข + ปุ่ม Continue ชิดล่าง | Medium | |
| FO-TC-AUTH-007 | onboarding `welcome` | GUEST | Func | อยู่หน้า welcome | 1. แตะ Continue 2. แตะซ้ำระหว่าง loading | ปุ่ม disable/แสดง loading กดซ้ำไม่ได้; ผ่านไปชั่วครู่แล้ว auto ไปหน้า privacy notice | indicator loading แสดงชัด; ปุ่มกดซ้ำไม่ได้ | High | |
| FO-TC-AUTH-008 | onboarding `welcome` | GUEST | Func | อยู่หน้า welcome | 1. แตะ "Terms of Use" 2. กด back/ปิดใน overlay 3. แตะ "Privacy Policy" | เปิด overlay เอกสารที่ถูกต้อง; ปิดแล้วกลับหน้า welcome สภาพเดิม | overlay มี back + ชื่อเอกสาร + เวอร์ชัน/วันที่ประกาศ + เนื้อหา + ปุ่ม Close | Medium | |

### 2.4 Consent (first-run page)

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
|---|---|---|---|---|---|---|---|---|---|
| FO-TC-AUTH-009 | onboarding `consent` | GUEST | UI | ผ่าน welcome | 1. ตรวจหน้า privacy notice | — | หัวข้อ "Privacy notice" + ย่อหน้าการเก็บข้อมูลบนอุปกรณ์และเซิร์ฟเวอร์ + ประโยค "We do not track your activity in other companies' apps or websites, and we do not share your data with advertisers or data brokers." (TH: เราไม่ติดตามกิจกรรมในแอปหรือเว็บไซต์ของบริษัทอื่น และไม่แชร์ข้อมูลให้ผู้ลงโฆษณาหรือ data broker) + รายการอธิบาย (essential/optional) + ลิงก์ Privacy Policy + 3 ปุ่ม: Accept all / Reject all / Privacy settings | Medium | |
| FO-TC-AUTH-010 | onboarding `consent` | GUEST | Func | อยู่หน้า consent | 1. แตะ Accept all | ยอมรับทั้งหมดแล้วไปหน้าถาม notification | หน้า "Never miss an update" แสดง | High | |
| FO-TC-AUTH-011 | onboarding `consent` | GUEST | Func | อยู่หน้า consent | 1. แตะ Reject all | ปฏิเสธทั้งหมดก็ยังไปหน้า notification ได้ปกติ (ไม่บังคับ accept) | ไม่มี error; flow เดินหน้าต่อเหมือน Accept; Analytics ปิด — ไม่มี analytics event (รวม search event) ถูกส่ง (AC-AUTH-031 — ตรวจด้วย event log ของ build stg/app จริงเท่านั้น; วิธีตรวจดู AC-AUTH-031) | High | |
| FO-TC-AUTH-012 | onboarding `consent` | GUEST | Func | อยู่หน้า consent | 1. แตะ Privacy settings | ไปหน้า Privacy settings ที่มีสวิตช์ | หน้ามีปุ่ม back + toggles | Medium | |
| FO-TC-AUTH-013 | onboarding `consent` | GUEST | Func | อยู่หน้า consent | 1. แตะลิงก์ "Privacy Policy" ในเนื้อความ | เปิด overlay เอกสาร; ปิดกลับมาหน้า consent เดิม | overlay ครอบทับ ไม่ทำลาย state หน้าเดิม | Low | |

### 2.5 Privacy settings (`prefs`)

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
|---|---|---|---|---|---|---|---|---|---|
| FO-TC-AUTH-014 | onboarding `prefs` | GUEST | UI | consent → Privacy settings | 1. ตรวจหน้า Privacy settings | — | ปุ่ม back + หัวข้อ "Privacy settings" + แถว Essential (ป้าย "Always on" ไม่มีสวิตช์) + สวิตช์ Analytics/Personalization (default ปิด) + ปุ่ม Save preferences | Medium | |
| FO-TC-AUTH-015 | onboarding `prefs` | GUEST | Func | อยู่หน้า Privacy settings | 1. เปิดสวิตช์ Analytics 2. แตะ Save preferences | สวิตช์ติดได้; Save → ไปหน้าถาม notification | สวิตช์ Analytics เลื่อนเป็น on | High | |
| FO-TC-AUTH-016 | onboarding `prefs` | GUEST | Func | อยู่หน้า Privacy settings (เคยเลื่อนสวิตช์) | 1. แตะ back ด้านบน | กลับหน้า privacy notice; ค่าสวิตช์ที่ตั้งไว้ไม่หายเมื่อเข้า Privacy settings อีกครั้ง | หน้า consent เหมือนเดิม | Medium | |

### 2.6 Notification ask (`notif`)

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
|---|---|---|---|---|---|---|---|---|---|
| FO-TC-AUTH-017 | onboarding `notif` | GUEST | UI | ผ่าน consent | 1. ตรวจหน้า notification | — | ปุ่ม back + รูป + หัวข้อ "Never miss an update" + ข้อความรอง + ปุ่ม Continue + Skip | Medium | |
| FO-TC-AUTH-018 | onboarding `notif` | GUEST | Func | อยู่หน้า notif | 1. แตะ Continue 2. ใน dialog ระบบเลือก "ไม่อนุญาต" 3. (ทำซ้ำบนเครื่อง/บัญชีอื่นหรือ reset สิทธิ์) เลือก "อนุญาต" | Continue เปิด dialog ขอสิทธิ์ notification ของ OS จริง (iOS/Android ข้อความต่างกัน); เลือกได้ทั้งอนุญาต/ไม่อนุญาต → ไปหน้า tracking เหมือนกัน | dialog ของ OS แสดงกลางจอ; ถ้าตอบแล้วระบบจำคำตอบ — เทสอีกทางต้อง reset สิทธิ์ใน settings ของเครื่อง | High | |
| FO-TC-AUTH-019 | onboarding `notif` | GUEST | Func | อยู่หน้า notif | 1. แตะ Skip 2. (ทำซ้ำ) แตะ back | Skip → ไปหน้า tracking โดยไม่เปิด dialog สิทธิ์; back → กลับหน้า consent | ไม่มี dialog ปรากฏในเส้นทาง Skip | Medium | |

### 2.7 Tracking ask (`track`)

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
|---|---|---|---|---|---|---|---|---|---|
| FO-TC-AUTH-020 | onboarding `track` | GUEST | UI | ผ่าน notif | 1. ตรวจหน้า tracking | — | ปุ่ม back + รูป + หัวข้อ "We suggest news that suits you" + ข้อความรอง "We use your activity in TukDaeng only to recommend watches and news. We do not track you across other companies' apps or websites." (TH: เราใช้กิจกรรมของคุณในตึกแดง เพื่อแนะนำนาฬิกาและข่าวสารเท่านั้น ไม่ติดตามข้ามแอปหรือเว็บไซต์อื่น) + ปุ่ม Continue (ไม่มี Skip) | Medium | |
| FO-TC-AUTH-021 | onboarding `track` | GUEST | Func | อยู่หน้า track | 1. แตะ Continue 2. เลือกไม่ให้ติดตาม | เปิด dialog ขอสิทธิ์ติดตามของ OS (iOS: App Tracking Transparency); เลือกไม่ให้ → ไป Member Sheet (Android ไม่มี dialog นี้ — ข้ามไป Member Sheet ทันทีตาม contract เฉพาะ OS) | dialog สิทธิ์ของ OS แสดง; ตอบแล้วไปต่อ | High | |
| FO-TC-AUTH-022 | onboarding `track` | GUEST | Func | อยู่หน้า track | 1. แตะ Continue → อนุญาตติดตาม 2. (ทำซ้ำ) back จาก track | อนุญาต → ไป Member Sheet เช่นกัน; back → กลับหน้า notification | Member Sheet "Join TukDaeng" เด้งทับ | Medium | |

### 2.8 Member Sheet first-run (non-gate)

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
|---|---|---|---|---|---|---|---|---|---|
| FO-TC-AUTH-023 | onboarding `member` | GUEST | UI | ผ่าน track | 1. ตรวจ sheet | — | bottom sheet + grab handle + หัวข้อ "Join TukDaeng" + ข้อความรอง + checkbox "Don't show this again" + ปุ่ม Sign up / Sign in / Skip for now + แถว or continue with Google/Apple | High | |
| FO-TC-AUTH-024 | onboarding `member` | GUEST | Func | อยู่ member sheet | 1. แตะ Sign up 2. (ทำซ้ำ) Sign in | Sign up → หน้าสมัครเต็มจอ; Sign in → หน้า sign in เต็มจอ (back กลับมา sheet ได้) | sheet เปลี่ยนเป็นหน้าเต็ม | High | |
| FO-TC-AUTH-025 | onboarding `member` | GUEST | Func | อยู่ member sheet (checkbox ไม่ติ๊ก) | 1. แตะ Skip for now | เป็น guest เข้า feed browse ได้; sheet ปิดเงียบ (ไม่มี toast); coach mark/คำแนะนำจุดแรกเด้ง (spec บังคับ — ไม่เด้ง = FAIL) | feed แสดงปกติ | High | |
| FO-TC-AUTH-026 | onboarding `member` | GUEST | Func | อยู่ member sheet | 1. ติ๊ก "Don't show this again" 2. แตะ Skip for now 3. ปิดแอปแล้วเปิดใหม่ 4. (เพิ่มเติม) ลอง trigger gate เช่นกด like | sheet ต้องไม่เด้งอัตโนมัติตอนเปิดแอปครั้งถัดไป; หมายเหตุ: gate จาก action (เช่น like) ยังเด้งได้ปกติเพราะ checkbox หมายถึงไม่แสดงซ้ำเองเท่านั้น| checkbox มีเครื่องหมายถูก; เปิดแอปใหม่ไม่เห็น sheet เด้งเอง | Medium | |
| FO-TC-AUTH-027 | onboarding `member` | GUEST | Edge | อยู่ member sheet (first-run) | 1. แตะบริเวณมืด (scrim) หลัง sheet | sheet ไม่ปิด — first-run sheet ต้องเลือก action เท่านั้น (scrim tap ปิดได้เฉพาะ sheet จากการ gate) | sheet ค้างอยู่ ไม่มีอะไรเปลี่ยน | Medium | |

### 2.9 Sign up (`signup`)

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
|---|---|---|---|---|---|---|---|---|---|
| FO-TC-AUTH-028 | onboarding `signup` | GUEST | UI | member sheet → Sign up | 1. ตรวจฟอร์ม | — | ปุ่ม back + หัวข้อ "Create your account" + ช่อง Email/Password + แถบวัดความแข็งรหัส + hint + ปุ่ม social Google/Apple + ปุ่ม Create account + ลิงก์ Terms/Privacy | Medium | |
| FO-TC-AUTH-029 | onboarding `signup` | GUEST | Func | อยู่หน้า signup | 1. กด Create account เว้นว่าง 2. email "abc" → submit 3. email ที่ลงทะเบียนแล้ว (SETUP-06) + pw ≥8 → submit 4. email ถูก + pw ว่าง → submit 5. pw 7 ตัวอักษร → submit | email ว่าง `Enter your email.`; รูปแบบผิด `Enter a valid email address.`; ซ้ำ `This email is already registered. Try signing in.`; password ว่าง `Enter your password.`; ไม่ผ่าน policy `Password must be at least 8 characters and include at least one number or special character.` | ข้อความ error สีแดงใต้ช่องที่ผิด; ไม่ไปหน้าถัดไป | High | |
| FO-TC-AUTH-030 | onboarding `signup` | GUEST | Func | อยู่หน้า signup | 1. กรอก email ใหม่ถูกรูป (อีเมลที่รับ OTP จริงได้) + pw ≥8 2. แตะ Create account | ผ่าน validation → ไปหน้า OTP แสดง email ที่กรอก; ระบบส่งรหัส OTP จริงมาทางช่องทางที่กำหนด | หน้า OTP: "We sent a 6-digit code to" + email | High | |
| FO-TC-AUTH-031 | onboarding `signup` | GUEST | Edge | อยู่หน้า signup | 1. พิมพ์ pw ทีละแบบ (สั้น→ยาวผสม) ดู meter 2. แตะไอคอนตา 3. กด Enter/ปุ่มยืนยันบนคีย์บอร์ด | meter เปลี่ยนตามความแข็งรหัส; eye สลับ show/hide; กด submit จากคีย์บอร์ด = เหมือนกด Create account | meter เปลี่ยนสด ๆ; ไอคอนตาเปลี่ยน | Medium | |

### 2.10 OTP (`otp`)

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
|---|---|---|---|---|---|---|---|---|---|
| FO-TC-AUTH-032 | onboarding `otp` | GUEST | UI | signup ผ่านแล้ว | 1. ตรวจหน้า OTP | — | ปุ่ม back + หัวข้อ "Verify your email" + อีเมลปลายทาง + ช่อง OTP 6 ช่อง (focus ช่องแรก) + บรรทัด resend พร้อมตัวนับถอยหลัง | Medium | |
| FO-TC-AUTH-033 | onboarding `otp` | GUEST | Func | อยู่หน้า OTP | 1. กรอกรหัส OTP 6 หลักที่ได้รับจริง (SETUP-06) | แต่ละช่องรับเฉพาะตัวเลข + auto-focus ช่องถัดไป; ครบ 6 หลัก verify อัตโนมัติโดยไม่ต้องกดปุ่ม → ไปหน้า profile | ช่องเต็มทีละช่อง ไม่ต้องกดยืนยัน | High | |
| FO-TC-AUTH-034 | onboarding `otp` | GUEST | Func | อยู่หน้า OTP | 1. กรอกรหัสผิด เช่น 000000 | ครบ 6 หลัก → `That code is incorrect. Try again.` + ช่องสั่น + ล้างช่องอัตโนมัติ + focus ช่องแรก | ข้อความ error + feedback ผิด (เช่น ช่องสั่น/สีแดง) | High | |
| FO-TC-AUTH-035 | onboarding `otp` | GUEST | Func | อยู่หน้า OTP | 1. รอตัวนับ resend ถอยหลังจนหมด 2. แตะ Resend code | ระหว่างนับแสดง `Resend code in 0:NN` (ไม่ใช่ปุ่ม); หมดเวลา → ปุ่ม `Resend code`; กด → นับใหม่และรหัสใหม่ถูกส่งจริง | ปุ่มไม่แสดง/กดไม่ได้ระหว่างนับ; รหัสใหม่มาถึงจริง | High | |
| FO-TC-AUTH-036 | onboarding `otp` | GUEST | Edge | อยู่หน้า OTP | 1. ลองพิมพ์ตัวอักษร/สัญลักษณ์ 2. ช่องว่างกด Backspace 3. แตะ back | ช่องรับเฉพาะตัวเลข; Backspace บนช่องว่าง → focus ช่องก่อนหน้า; back → กลับหน้า signup โดยค่าที่กรอกยังอยู่ครบ (ค่าหาย = FAIL) | ช่องไม่รับ non-digit | Medium | |

### 2.11 Profile setup (`profile`)

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
|---|---|---|---|---|---|---|---|---|---|
| FO-TC-AUTH-037 | onboarding `profile` | GUEST | UI | OTP ผ่านแล้ว | 1. ตรวจหน้า | — | ปุ่ม "Skip for now" มุมขวาบน + avatar default + ลิงก์ Add photo + ช่อง Username (เติมข้อเสนอแนะไว้) + ปุ่ม Continue | Medium | |
| FO-TC-AUTH-038 | onboarding `profile` | GUEST | Func | อยู่หน้า profile | 1. ดู username ที่ระบบ suggest 2. แตะ Continue | username แนะนำถูกเติมจากข้อมูลที่สมัคร (เช่นส่วนหน้าอีเมล); Continue → ไปหน้า Account created | หน้า created แสดง "Account created" | High | |
| FO-TC-AUTH-039 | onboarding `profile` | GUEST | Func | อยู่หน้า profile | 1. ลบ username ใส่ "ab" → Continue 2. ใส่ "ABC!!" → Continue 3. ใส่ username ถูกกติกา → Continue | username 3–20 ตัว a–z 0–9 _ . — ผิดแสดง `Username required — 3–20 characters: a–z, 0–9, _ or .`; ถูกกติกา → ผ่าน | error ชัดเจนบอกกติกา | High | |
| FO-TC-AUTH-040 | onboarding `profile` | GUEST | Edge | อยู่หน้า profile | 1. แตะ "Add photo" | เปิด photo picker/ตัวเลือกรูปของระบบจริง → เลือกรูปได้แล้ว avatar เปลี่ยน (ไม่มี picker = FAIL) | picker ของ OS เปิด; avatar อัปเดตหลังเลือก | Low | |
| FO-TC-AUTH-041 | onboarding `profile` | GUEST | Func | อยู่หน้า profile | 1. ล้างช่อง username ให้ว่าง/invalid 2. แตะ Skip for now | Skip ไม่บังคับ validation — ระบบสร้าง username ให้เองแล้วไปหน้า created | ผ่านไป created เหมือนกรอกถูก | Medium | |

### 2.12 Account created (`created`)

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
|---|---|---|---|---|---|---|---|---|---|
| FO-TC-AUTH-042 | onboarding `created` | NEW | Func | profile ผ่านแล้ว | 1. ตรวจหน้า 2. แตะ Sign in | check icon + `Account created` + `Welcome, {name}. Sign in to start exploring.`; กด Sign in → หน้า sign in prefill email ที่เพิ่งสมัคร (password ว่าง) | check icon + "Account created" + "Welcome, {username}..." | High | |
| FO-TC-AUTH-043 | onboarding `created` | NEW | Int | อยู่หน้า created | 1. แตะ Sign in 2. เข้าสู่ระบบด้วยบัญชีที่เพิ่งสมัคร | เข้าระบบสำเร็จ → feed แบบ member ใหม่ (ข้อมูลว่าง: saved/alert/chat ว่าง, ชื่อ = username ที่ตั้ง) + coach mark ชุด member เด้ง (spec บังคับ — ไม่เด้ง = FAIL) | feed แสดงสถานะ new member | High | |

### 2.13 Sign in (`signin`)

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
|---|---|---|---|---|---|---|---|---|---|
| FO-TC-AUTH-044 | onboarding `signin` | GUEST | UI | member sheet → Sign in | 1. ตรวจหน้า | — | ปุ่ม back + หัวข้อ "Sign in" + ช่อง Email/Password + ไอคอนตา + ลิงก์ "Forgot password?" + ปุ่ม Sign in + social block + "New here? Create account" | Medium | |
| FO-TC-AUTH-045 | onboarding `signin` | GUEST | Func | อยู่หน้า sign in (ช่องว่าง) | 1. กรอก email+password บัญชีทดสอบ (SETUP-06) 2. กด Sign in | credential ถูก → เข้าสู่ระบบ session member → feed แสดงข้อมูลสมาชิก | feed ของ member (มีข้อมูลตามบัญชีนั้น) | High | |
| FO-TC-AUTH-046 | onboarding `signin` | GUEST | Func | อยู่หน้า signin | 1. เว้นว่างทั้งสองช่อง → Sign in 2. email "abc" → Sign in 3. email ถูก + pw ว่าง → Sign in | error รายฟิลด์: `Enter your email.` / `Enter a valid email address.` / `Enter your password.` — ไม่นับเป็น failed attempt | error แดงใต้ช่องที่ผิด; ไม่ไปต่อ | High | |
| FO-TC-AUTH-047 | onboarding `signin` | GUEST | Edge | อยู่หน้า signin | 1. กรอก email ถูกรูปแบบ + pw ผิด → Sign in 2. กดซ้ำจนครบ 5 ครั้ง | ผิด → banner `Email or password is incorrect.` (ไม่แสดงตัวนับ); ครบ 5 ครั้ง → `Please try again in {X min Y sec} or choose Forgot password.` นับถอยหลังทุกวินาที ล็อกเฉพาะอีเมลนั้น ปุ่ม Sign in disabled | banner แดงเหนือฟอร์ม; ปุ่มกดไม่ได้เมื่อล็อก | High | |
| FO-TC-AUTH-048 | onboarding `signin` | GUEST | Func | เคยสมัครบัญชีใหม่ผ่านแอปแล้ว | 1. sign in ด้วย email+pw ที่สมัครไว้ | เข้าระบบได้ → feed แบบ member ของบัญชีนั้น (ข้อมูลตามจริงของบัญชี) | feed ตรงบัญชี; ชื่อ/username ถูก | High | |
| FO-TC-AUTH-049 | onboarding `signin` | GUEST | Edge | โดนล็อกจากเคส 047 | 1. ตอนล็อก: ใส่ credential ถูก → พยายาม Sign in 2. รอครบระยะล็อกตาม design (15 นาที) → ลองใหม่ | ช่วงล็อก: ปุ่ม disabled/ปฏิเสธ; หลังครบเวลา: ปลดล็อก sign in ได้ (ปลดเองเมื่อครบ 15 นาที — ไม่ปลด = FAIL) | สถานะล็อก/ปลดชัดเจน | Medium | |

### 2.14 Forgot password (`forgot`)

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
|---|---|---|---|---|---|---|---|---|---|
| FO-TC-AUTH-050 | onboarding `forgot` | MEMBER | UI | signin → Forgot password? | 1. แตะลิงก์ 2. ตรวจหน้า | เข้าหน้า reset password | back + หัวข้อ "Reset password" + ช่อง Email + ปุ่ม Send reset link | Medium | |
| FO-TC-AUTH-051 | onboarding `forgot` | MEMBER | Func | อยู่หน้า forgot | 1. กรอก email ที่รับจดหมายจริง → Send reset link 2. แตะ Back to sign in | หน้า sent "Check your email / If an account exists for {email}, we sent a reset link."; ตรวจกล่องจดหมาย — ลิงก์รีเซ็ตมาถึงจริง (เช็ก inbox/spam); Back → กลับ sign in | หน้า sent มี check icon + ปุ่ม Back to sign in | High | |
| FO-TC-AUTH-052 | onboarding `forgot` | MEMBER | Func | อยู่หน้า forgot | 1. เว้นว่าง/ใส่ email ผิด → Send reset link | error "Enter a valid email address."; ไม่ไปหน้า sent | error แดงใต้ช่อง | Medium | |

### 2.15 Legal overlay (เอกสาร Terms/Privacy)

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
|---|---|---|---|---|---|---|---|---|---|
| FO-TC-AUTH-053 | overlay legal | GUEST | Func | อยู่ขั้นที่มี legal link (welcome/consent/signup) | 1. แตะ "Terms of Use" 2. แตะ "Privacy Policy" | overlay เอกสารเปิดทับขั้นเดิมและแสดงเอกสารที่เลือกถูกต้อง | header: back + ชื่อเอกสาร + เวอร์ชัน/วันที่ + เนื้อหาแบ่งหัวข้อ + ปุ่ม Close ล่าง | Medium | |
| FO-TC-AUTH-054 | overlay legal | GUEST | Func | overlay legal เปิดอยู่ | 1. กด back 2. (ทำซ้ำ) กด Close | ทั้งสองวิธีปิด overlay กลับขั้นเดิมพอดี (ค่าที่กรอกค้าง เช่นฟอร์ม signup ไม่หาย) | หน้าจอเดิมกลับมาสมบูรณ์ | Medium | |

### 2.16 Onboarding actions (hide / eye / resend / social / exit·decline)

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
|---|---|---|---|---|---|---|---|---|---|
| FO-TC-AUTH-055 | action `hide` | GUEST | Func | member sheet (first-run) | 1. แตะ checkbox "Don't show this again" ซ้ำหลายครั้ง | checkbox สลับติ๊ก/ไม่ติ๊กทุกครั้ง ไม่ค้าง | เครื่องหมายถูกปรากฏ/หายตาม | Low | |
| FO-TC-AUTH-056 | action `eye` | GUEST | Func | signup หรือ signin | 1. แตะปุ่ม eye ข้างช่อง password 2. แตะอีกครั้ง | ข้อความสลับ แสดง↔ซ่อน (•••); ไม่กระทบช่องอื่น | ไอคอนเปลี่ยน; ข้อความโชว์/ปิดตาม | Medium | |
| FO-TC-AUTH-057 | action `resend` | GUEST | UI | หน้า OTP ระหว่างนับถอยหลัง | 1. สังเกตบริเวณ resend ทุก ๆ 5 วิ | ขณะนับแสดง text "Resend code in 0:NN" (ไม่ใช่ปุ่ม — กดไม่ได้) จนหมดเวลา | ตัวนับอัปเดตทุกวินาที | Medium | |
| FO-TC-AUTH-058 | action `social` — Google | GUEST | Func | member sheet หรือหน้า signup | 1. แตะ Continue with Google 2. เลือกบัญชี Google จริงของ tester | เปิดหน้าเลือกบัญชี Google ของระบบ (OS-level) → เลือกแล้วไปหน้า profile ที่ prefill ชื่อ/username จากบัญชีนั้น | account chooser ของระบบแสดง; avatar/username ตรงบัญชีที่เลือก | High | |
| FO-TC-AUTH-059 | action `social` — Apple | GUEST | Func | member sheet หรือหน้า signup (iOS) | 1. แตะ Continue with Apple 2. ยืนยันด้วย Apple ID จริง | เหมือน Google — เปิด Sign in with Apple ของระบบ → ไปหน้า profile พร้อมข้อมูลจาก Apple ID (หมายเหตุ: เทสบน iOS เป็นหลัก) | เหมือนเคส 058 | Medium | |
| FO-TC-AUTH-060 | action `exit`/`decline` | MEMBER | Edge | หน้า consent first-run | 1. ไล่หาปุ่ม Decline/Exit บนหน้า privacy notice | ไม่มีปุ่ม Decline/Exit บน consent รอบแรก — มีแค่ Accept all / Reject all / Privacy settings (ยืนยันว่าออกจาก consent ไม่ได้นอกจากเลือกอย่างใดอย่างหนึ่ง) | ไม่มีปุ่ม Decline/Exit บนหน้านี้ | Low | |

### 2.17 Guest Gate — Member Sheet จาก action ที่ล็อกไว้ [GATE]

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
|---|---|---|---|---|---|---|---|---|---|
| FO-TC-AUTH-061 | gate trigger | GUEST | Func | session guest บน feed | 1. แตะไอคอนหัวใจ (like) ใต้โพสต์ใดก็ได้ | action ถูกดักก่อนทำงาน — Member Sheet เปิด; โพสต์ **ไม่ถูก like** | sheet "Join TukDaeng" + ข้อความต้องตรง "Sign in or create a free account to use this feature." | High | |
| FO-TC-AUTH-062 | gate dismiss | GUEST | Func | gate sheet เปิดอยู่ | 1. แตะ scrim ด้านหลัง | sheet ปิด (เฉพาะ gate variant) — ยังเป็น guest, หน้าเดิมไม่เปลี่ยน, action เดิมไม่ทำงาน | sheet เลื่อนลงหาย; feed สภาพเดิม | High | |
| FO-TC-AUTH-063 | gate skip | GUEST | Func | gate sheet เปิดอยู่ | 1. แตะ "Skip for now" | session ยัง guest, sheet ปิดเงียบ ไม่มี toast | กลับหน้าเดิมเหมือนไม่เคยเปิด | High | |
| FO-TC-AUTH-064 | gate UI | GUEST | UI | gate sheet เปิดอยู่ | 1. เทียบกับ first-run member sheet (AUTH-023) | gate variant **ไม่มี** checkbox "Don't show this again" และข้อความรองเป็นฉบับ gate | ปุ่มยัง Sign up / Sign in / Skip for now + social row | Medium | |
| FO-TC-AUTH-065 | gate → sign in | GUEST→MEMBER | Int | guest แตะ like → sheet เปิด | 1. แตะ Sign in 2. sign in ด้วยบัญชีทดสอบ 3. กลับดูโพสต์เดิม | เข้าสู่ระบบ member → กลับ feed หน้าเดิม; **action เดิมไม่ auto-resume** — โพสต์ยังไม่ถูก like ต้องแตะใหม่เอง | feed เหมือนเดิม + ตอนนี้ member (gate ไม่เด้งอีก) | High | |
| FO-TC-AUTH-066 | gate → sign up | GUEST→NEW | Int | gate sheet เปิดอยู่ | 1. Sign up → กรอก email+pw → OTP จริง → profile → created → Sign in | เดิน signup flow ครบเหมือน first-run → session member ใหม่ → feed | flow เดียวกันกับ first-run sign-up | Medium | |
| FO-TC-AUTH-067 | gate bypass [GATE] | MEMBER | Func | session member บน feed | 1. แตะ like/save/share/comment/create ทีละอัน | member ไม่เจอ sheet — action ทำงานปกติทุกตัว (คู่เทียบ guest ของ 061) | ไม่มี Member Sheet; action ทำงานตามปกติ | High | |
| FO-TC-AUTH-068 | gate nav [GATE] | GUEST vs MEMBER | Func | feed | 1. guest: แตะแท็บ Chat / Alerts / Profile ในแถบล่างทีละแท็บ 2. member: แตะแท็บเดิม | guest → Member Sheet ทุกแท็บ และแท็บ**ไม่สลับ** (อยู่ feed); member → สลับแท็บปกติ | guest: sheet ทับบน feed เสมอ; member: เปลี่ยนหน้าปกติ | High | |

### 2.18 Re-consent (นโยบายเวอร์ชันใหม่)

> ⚠️ กลุ่มนี้เทสได้เฉพาะเมื่อมีการออก Terms/Privacy เวอร์ชันใหม่จริงฝั่ง server (ทีม backend/dev ต้อง trigger) — ถ้าไม่มีทางจำลองบน build ทดสอบให้ mark BLOCK พร้อมเหตุผล

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
|---|---|---|---|---|---|---|---|---|---|
| FO-TC-AUTH-069 | re-consent sheet | MEMBER | Func | member ล็อกอินอยู่ + ทีมออก policy version ใหม่ | 1. เปิดแอป/กลับเข้าแอปหลังเวอร์ชันนโยบายถูก bump | sheet re-consent เด้งทับ feed โดยอัตโนมัติ | sheet: "We've updated our policies" + แถวเอกสาร Terms/Privacy (ป้าย Required + เวอร์ชันใหม่) + toggles + Accept & continue + Decline | Medium | |
| FO-TC-AUTH-070 | re-consent legal | MEMBER | Func | re-consent sheet เปิด | 1. แตะแถว Terms of Use / Privacy Policy ใน sheet | เปิดเอกสารเวอร์ชันใหม่ภายใน overlay; ปิดกลับมา sheet เดิม | เอกสารแสดงเวอร์ชันล่าสุด | Medium | |
| FO-TC-AUTH-071 | re-consent accept | MEMBER | Func | re-consent sheet เปิด | 1. (ปรับ toggle ตามใจ) แตะ Accept & continue | บันทึก consent ใหม่ → ปิด sheet → ใช้งานต่อเป็น member ได้ปกติ | sheet หาย; toast/feedback แสดง | High | |
| FO-TC-AUTH-072 | re-consent decline→sign out | MEMBER | Func | re-consent sheet เปิด | 1. แตะ Decline 2. ทำตามที่ UI เสนอ (เช่น Sign out) | Decline → banner `You need to accept the required Terms and Privacy Policy to use TukDaeng. You can review them again or exit the app.` + ทางเลือก Sign out; sign out → member sheet ให้ sign in ใหม่ | เตือนชัดเจน; หลัง sign out เห็น member sheet | High | |

### 2.19 Settings → About your account

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
|---|---|---|---|---|---|---|---|---|---|
| FO-TC-AUTH-073 | `about_account` | MEMBER | UI | settings → About your account | 1. ตรวจหน้า | — | ส่วนบน: รูป + ชื่อ + @username; หมวด Account information: Date joined + Account based in {ภูมิภาค}; Security: Change password; Account management: Delete account (ตัวแดง) | Medium | |
| FO-TC-AUTH-074 | `about_account` | MEMBER vs NEW | Func | เปิด about_account | 1. member (บัญชีทดสอบเก่า) ดู Date joined 2. บัญชีสมัครใหม่ (NEW) เปิดดูอีกครั้ง | ข้อมูลตรงบัญชีจริง: Date joined = เดือน/ปีที่สมัคร; รูป/ชื่อ/@user ตรงบัญชีที่ล็อกอิน — บัญชีเก่า vs ใหม่ต้องแสดงต่างกันถูก | ข้อมูลตรง session จริง | Medium | |
| FO-TC-AUTH-075 | `about_account` nav | MEMBER | Func | อยู่หน้า about_account | 1. แตะ Change password 2. back 3. แตะ Delete account | ไปหน้าเปลี่ยนรหัส / หน้าลบบัญชีถูกต้อง; back กลับ about_account | หน้าเปลี่ยนตามปกติ | Medium | |

### 2.20 Change password (`change_pwd`)

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
|---|---|---|---|---|---|---|---|---|---|
| FO-TC-AUTH-076 | `change_pwd` | MEMBER | UI | about_account → Change password | 1. ตรวจหน้า | — | คำอธิบายกติการหัส (≥8 ตัว + เงื่อนไขอื่น); 3 ฟิลด์ Current/New/Re-type แต่ละอันมี eye; ลิงก์ "Forgot your password?"; ปุ่ม Change password | Medium | |
| FO-TC-AUTH-077 | `change_pwd` | MEMBER | Func | อยู่หน้า change_pwd (รู้รหัสปัจจุบันของบัญชีทดสอบ) | กด Change password ทีละเคส: 1. เว้นหมด 2. current ผิด 3. current ถูก + new ว่าง 4. new <8 ตัว 5. new = current เดิม 6. new ถูก + confirm ไม่ตรง | ไล่ตามลำดับ: current ว่าง `Please enter your current password.` → current ผิด `Your current password was entered incorrectly. Please check it and try again.` → new ว่าง `Please enter a new password.` → ไม่ผ่าน policy `Password must be at least 8 characters and include at least one number or special character.` → ซ้ำ current `New password must be different from your current password.` → re-type ไม่ตรง `Passwords do not match. Please re-enter your new password.` | error แดง + ช่องที่ผิดมีสถานะผิด + focus ไปช่องนั้น | High | |
| FO-TC-AUTH-078 | `change_pwd` | MEMBER | Func | อยู่หน้า change_pwd | 1. current = รหัสปัจจุบันจริง 2. new = รหัสใหม่ถูกกติกา 3. confirm ตรงกัน 4. กด Change password | ผ่าน → กลับหน้าก่อน + confirmation (toast ต้องตรง "Password changed successfully"); รหัสใหม่มีผลทันที | toast/feedback แสดง; กลับหน้าก่อนหน้า | High | |
| FO-TC-AUTH-079 | `change_pwd` | MEMBER | Edge | เปลี่ยนรหัสแล้ว (078) | 1. เข้า change_pwd อีกครั้ง 2. current = รหัสเดิม → submit 3. current = รหัสใหม่ → submit ให้จบ | รหัสเดิมถูกปฏิเสธ `Your current password was entered incorrectly. Please check it and try again.`; รหัสใหม่ active ใช้เปลี่ยนรอบต่อได้ | error ตามเงื่อนไข | Medium | |
| FO-TC-AUTH-080 | `change_pwd` forgot | MEMBER | Func | อยู่หน้า change_pwd | 1. แตะ "Forgot your password?" | เปิด dialog รีเซ็ตรหัส (ดู 2.22) | dialog เด้งกลางจอ | Medium | |
| FO-TC-AUTH-081 | `change_pwd` eye | MEMBER | Edge | อยู่หน้า change_pwd | 1. พิมพ์ทั้ง 3 ช่อง 2. แตะ eye ของแต่ละช่องทีละอัน | แต่ละช่องสลับ show/hide อิสระกัน | icon เปลี่ยนเฉพาะช่องนั้น | Low | |

### 2.21 Delete account (`del_account` step 1–2)

> ⚠️ เคส 088–092 เป็นการลบบัญชีจริง — ใช้เฉพาะบัญชีทดสอบที่สร้างมาเพื่อลบเท่านั้น ห้ามใช้บัญชีหลัก

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
|---|---|---|---|---|---|---|---|---|---|
| FO-TC-AUTH-082 | `del_account` step1 | MEMBER | UI | about_account → Delete account | 1. ตรวจหน้า | — | icon + "We're sorry to see you go" + การ์ดเงื่อนไข (grace period / permanent deletion / watch alerts ถูกยกเลิก) + ปุ่ม Continue to delete + Keep my account | Medium | |
| FO-TC-AUTH-083 | `del_account` step1 | MEMBER | Func | อยู่ step1 | 1. แตะ Keep my account | ออกจากหน้าลบบัญชี กลับ about_account โดยไม่ลบอะไร | ไม่มี dialog; กลับหน้าเดิม | Medium | |
| FO-TC-AUTH-084 | `del_account` step1→2 | MEMBER | Func | อยู่ step1 | 1. แตะ Continue to delete | ไปหน้าเลือกเหตุผล | หัวข้อ "Why are you leaving?" | High | |
| FO-TC-AUTH-085 | `del_account` step2 | MEMBER | UI | อยู่ step2 | 1. ตรวจหน้า | — | title+sub + radio เหตุผลหลายตัวเลือก + textarea Additional feedback (optional) + ปุ่ม Continue + Back | Medium | |
| FO-TC-AUTH-086 | `del_account` step2 validation | MEMBER | Func | อยู่ step2 | 1. กด Continue โดยไม่เลือกเหตุผล 2. เลือกเหตุผลแล้วดู error | ไม่เลือก → error "Please select a reason to continue."; เลือกเหตุผล → error หายทันที | radio เลือกได้ทีละตัว; error ชัดเจน | High | |
| FO-TC-AUTH-087 | `del_account` step2 back | MEMBER | Func | อยู่ step2 | 1. กด Back ในหน้า 2. กดลูกศร back ของหน้า | ทั้งสองกลับ step1 — back ถูกดักให้ถอยขั้น ไม่ออกจาก flow ลบบัญชี | กลับหน้าเงื่อนไข | Medium | |
| FO-TC-AUTH-088 | `del_account` step2 → dialog | MEMBER | Func | เลือกเหตุผลแล้ว | 1. (ไม่กรอก feedback — optional) กด Continue | เปิด dialog ยืนยันรหัสผ่าน; feedback ว่างไว้ได้ (optional ตาม design) | dialog อยู่กลางจอ + focus ช่องรหัสผ่าน | High | |

### 2.22 Dialogs: delPasswordConfirm / delAccountSuccess / forgotPwd

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
|---|---|---|---|---|---|---|---|---|---|
| FO-TC-AUTH-089 | `delPasswordConfirm` | MEMBER | UI | dialog เปิดจาก step2 | 1. ตรวจ dialog | — | "Confirm account deletion" + คำอธิบาย grace period + ช่อง Current password + eye + ปุ่ม Delete account (danger) + Cancel | Medium | |
| FO-TC-AUTH-090 | `delPasswordConfirm` validation | MEMBER | Func | dialog เปิด | 1. กด Delete account โดยว่าง 2. กรอกรหัสผิด → submit | ว่าง `Please enter your password.`; ผิด `Incorrect password. Please try again.` | error แดง + ช่องสถานะผิด + focus กลับช่อง | High | |
| FO-TC-AUTH-091 | `delAccountSuccess` | MEMBER | Func | กรอกรหัสถูกของบัญชีทดสอบ | 1. submit 2. อ่านเนื้อหา success dialog | ถูก → success dialog แจ้งวันที่ลบถาวร = วันนี้+30 วัน (ตรวจ format ตาม locale เครื่อง — TH แสดง พ.ศ.) | trash icon + "Account deletion scheduled" + วันที่ + ข้อความ login ก่อนกำหนดเพื่อ restore + ปุ่ม Log out | High | |
| FO-TC-AUTH-092 | `delAccountSuccess` → logout/restore | MEMBER→GUEST | Int | success dialog เปิด | 1. กด Log out 2. sign in กลับด้วยบัญชีเดิม (ทดสอบ restore ใน grace) | ปิดทุกอย่าง → session guest + confirmation (toast ต้องตรง "Account deactivated. 30-day grace period started.") + member sheet เด้ง; sign in กลับ → บัญชีกลับมาใช้ได้ (= restore)| toast + sheet "Join TukDaeng"; sign in กลับได้ | High | |
| FO-TC-AUTH-093 | `forgotPwd` dialog | MEMBER | Func | change_pwd → Forgot your password? | 1. ตรวจ dialog 2. กด Send reset link 3. (ทำซ้ำ) Cancel | dialog "Reset password?" แสดงอีเมล mask ของบัญชีที่ล็อกอิน; Send → ปิด + confirmation toast (ลิงก์ส่งจริง — เช็กกล่องจดหมาย); Cancel → ปิดเฉย ๆ | mask = ตัวแรก + *** + @domain (เทียบจริง) | Medium | |
| FO-TC-AUTH-094 | `forgotPwd` session new | NEW | Edge | session NEW + เปิด dialog | 1. เปิด forgotPwd | อีเมล mask เป็นของบัญชีตัวเองที่สมัคร ไม่ใช่ค่าอื่น | mask ตรงอีเมลที่สมัคร | Low | |

### 2.23 Log out dialog

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
|---|---|---|---|---|---|---|---|---|---|
| FO-TC-AUTH-095 | `logout` dialog | MEMBER | UI | settings → Log out (ท้ายรายการ หมวด Login) | 1. แตะ Log out | เปิด confirm dialog | "Log out of @{username}?" + "You will need to sign in again to access your account." + ปุ่ม Log out (danger) + Cancel | Medium | |
| FO-TC-AUTH-096 | `logout` confirm | MEMBER→GUEST | Func | dialog เปิด | 1. กด Log out | ปิด dialog + กลับ feed แบบ guest + toast `Logged out successfully` + Member Sheet เด้ง | feed guest + sheet | High | |
| FO-TC-AUTH-097 | `logout` cancel | MEMBER | Func | dialog เปิด | 1. กด Cancel | ปิด dialog เฉย ๆ — ยัง member, อยู่หน้า settings เดิม | ไม่มี toast; state ไม่เปลี่ยน | Medium | |
| FO-TC-AUTH-098 | onboarding `signin` (lockout) | GUEST | Edge | ล็อกอีเมล A แล้ว (ผิดครบ 5 ครั้ง) ; มีอีเมล B ที่ถูกต้อง | 1. กรอกอีเมล B + รหัสที่ถูกต้อง → Sign in | เข้าได้ปกติ (ตัวนับของ A ไม่กระทบ B) — เข้าไม่ได้ = FAIL | ไม่มีข้อความล็อกบนหน้า | High | |
| FO-TC-AUTH-099 | onboarding `signin` (lockout) | GUEST | Edge | ล็อกอีเมล A แล้ว ระยะเวลาเหลือ > 2 นาที | 1. ปิดแอปสนิท (kill) 2. เปิดใหม่ → onboarding signin → กรอก A | ยังล็อก ปุ่ม Sign in กดไม่ได้ เวลาที่เหลือต่อจากเดิม (ไม่รีเซ็ต) — เข้าได้ = FAIL | ข้อความล็อก + เวลานับถอยหลังต่อเนื่อง | High | |
| FO-TC-AUTH-100 | onboarding `signin` (lockout) | GUEST | Edge | ล็อกอีเมล A แล้ว ระยะเวลาเหลือ > 2 นาที (ทดสอบบนแอปจริงเท่านั้น — prototype จำลองได้แค่การเก็บในเครื่อง ล้างข้อมูลเว็บจะรีเซ็ต จึงไม่ใช่ผลที่ใช้ตัดสิน) | 1. ล้างข้อมูลแอปหรือถอนแล้วติดตั้งใหม่ 2. Sign in ด้วย A | ยังล็อก — ตัวนับและเวลาเก็บที่เซิร์ฟเวอร์ เข้าได้ = FAIL | ข้อความล็อกเหมือนเดิม | High | |
| FO-TC-AUTH-101 | onboarding `signin` (lockout) | GUEST | Edge | ล็อกอีเมล A แล้ว | 1. กรอก A + รหัสที่ถูกต้อง → Sign in | ปฏิเสธด้วยข้อความล็อก (ไม่ใช่ข้อความรหัสผิด) เข้า feed ไม่ได้ | ข้อความล็อกคงเดิม ปุ่มกดไม่ได้ | High | |
| FO-TC-AUTH-102 | onboarding `signin` (lockout) | GUEST | Edge | ล็อกอีเมล A แล้ว | 1. แตะ "ลืมรหัสผ่าน?" 2. กรอก A → ส่ง reset link | เปิดหน้า Forgot ได้และส่งลิงก์ได้ (ไม่ถูกบล็อกตามการล็อก) — ถูกบล็อก = FAIL | หน้า Reset password ปกติ | High | |
| FO-TC-AUTH-103 | onboarding `signin` (lockout) | GUEST | Edge | อีเมล C ที่ไม่มีบัญชี | 1. ผิด 5 ครั้งด้วยอีเมล C 2. ดูข้อความที่ขึ้น 3. เทียบกับ AUTH-047 (อีเมลมีบัญชี) | ล็อกเหมือนกัน ข้อความเหมือนกันทุกตัวอักษร — ต่างกัน = FAIL (รั่วว่ามีบัญชีหรือไม่) | ข้อความและเวลาเหมือนกัน | High | |
| FO-TC-AUTH-104 | onboarding `signin` (lockout) | GUEST | Func | ล็อกอีเมล A ครบ 15 นาที (ดูเวลาที่เซิร์ฟเวอร์กำหนด) | 1. รอจนตัวนับถึง 0 2. Sign in ด้วย A + รหัสที่ถูกต้อง | ข้อความล็อกหายและปุ่มกดได้ เข้าได้ ผิดครั้งถัดไปนับจาก 0 — ไม่ปลด = FAIL | ข้อความล็อกหาย ปุ่มกลับเป็นปกติ | High | |

## 3. หมายเหตุ / OPEN items (สำหรับเทสแอปจริง)

- **RESOLVED (2026-10-29) AUTH-047/049 lockout** (prototype มี timer 15 นาทีแล้ว) — design ระบุล็อก 15 นาทีหลังผิด 5 ครั้ง; lockout ต้อง 15 นาทีตาม design และปลดจริงหลังครบเวลา — ระยะต่าง/ไม่ปลด = FAIL; build ไม่มี lockout = FAIL
- **[OPEN] AUTH-060** — first-run consent ไม่มี Decline/Exit (ตาม design) — เคสนี้คือยืนยันว่า "ไม่มีทางออกจาก consent นอกจากตอบ" บนแอปจริง
- **[OPEN] AUTH-069–072 re-consent** — ต้องอาศัยทีม backend ออก policy version ใหม่บน build ทดสอบ; ถ้าไม่มีช่องทาง trigger ให้ mark BLOCK พร้อมเหตุผล
- **[OPEN] AUTH-092 restore** — design คือ sign in กลับระหว่าง grace period = กู้บัญชีอัตโนมัติ; ยืนยันบนแอปจริงว่า restore เกิดจริงและข้อมูลกลับครบ
- **OTP (AUTH-032–036)** — แอปจริงส่งรหัสทางอีเมล/SMS จริง; ถ้า backend มี test OTP คงที่ให้ใช้ตามที่ทีมกำหนดแล้วบันทึกลง SETUP-06
- **Social sign-in (AUTH-058/059)** — ใช้บัญชี Google/Apple จริงของ tester; expected คือข้อมูลจากบัญชีนั้นถูก prefill (ไม่ใช่ค่าคงที่)
- ขอบเขตที่ตัดออกตาม task breakdown: เมทริกซ์ gated action ทั้งหมด (FO-TEST-17), change_pwd/del_account ในฐานะหน้า settings (FO-TEST-15 ครอบ entry/menu), E2E journey (FO-TEST-18)

- สถิติ: **104 TC** — High 50 / Medium 47 / Low 7 (SETUP rows 7 แถวแยกใน checklist; รวมใน csv 111 แถว)
