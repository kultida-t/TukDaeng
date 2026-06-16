# 01 Authentication Module

อ้างอิงหลักจาก [TukDaeng_Master_Product_Definition.md](TukDaeng_Master_Product_Definition.md)

---

# 1. Document Information

| Item | Detail |
|---|---|
| Module Name | Authentication |
| Platform | Mobile Application |
| Version | V1 |
| Owner | Product / UX / Engineering |
| Status | Draft |

---

# 2. Objective

Authentication Module ใช้สำหรับการสมัครสมาชิก เข้าสู่ระบบ กู้รหัสผ่าน เปลี่ยนรหัสผ่าน และออกจากระบบ โดยต้องรองรับทั้ง Email/Password และ Social Sign In ตามหลักยึดของระบบ TukDaeng

---

# 3. Prototype Reference

- `Auth Sign up.png`
- `Auth Sign in & Reset password.png`
- `Auth Reset password.png`

---

# 4. Scope

Authentication Module ใน V1 ครอบคลุม:

- Sign Up
- OTP Verification
- Sign In
- Forgot Password
- Reset Password
- Change Password
- Sign Out
- Suspended Account Handling

ไม่รวมใน V1:

- Two Factor Authentication (2FA)
- Passkey
- Biometric Login
- Account Linking
- Account Merge
- Device Management

---

# 5. Screen Mapping

หน้าจอที่เกี่ยวข้องในโมดูลนี้:

1. Sign Up
2. Terms of Service
3. Privacy Policy
4. OTP Verification
5. Verification Success
6. Sign In
7. Sign In Error State
8. Suspended Account State
9. Forgot Password
10. Reset Link Sent / Check Email
11. Reset Password
12. Password Updated Success
13. Change Password
14. Sign Out Confirmation

---

# 6. User States

## Guest / Unauthenticated

สามารถ:

- เปิด Sign In
- เปิด Sign Up
- เปิด Forgot Password
- เปิด Terms of Service
- เปิด Privacy Policy

ไม่สามารถ:

- เข้าใช้งานฟังก์ชันที่ต้องล็อกอิน

## Pending Verification

ผู้ใช้สมัครด้วย Email แล้ว แต่ยังไม่ Verify OTP

สามารถ:

- กรอก OTP
- ขอ Resend OTP

ไม่สามารถ:

- Sign In เข้าสู่ระบบหลักได้

## Authenticated

ผู้ใช้ยืนยันตัวตนสำเร็จและเข้าใช้งานระบบได้

## Suspended User

ผู้ใช้ถูกระงับการใช้งาน

เมื่อพยายาม Sign In:

- ต้องเห็นสถานะบัญชีถูกระงับ
- ต้องเห็นเหตุผลการระงับ
- ต้องเห็นช่องทางติดต่อ support

## Deleted User

บัญชีถูกลบแล้ว

เมื่อพยายาม Sign In:

- ต้องไม่เข้าสู่ระบบได้
- ต้องแสดงข้อความว่าบัญชีนี้ไม่พร้อมใช้งาน

---

# 7. User Flow

## Email Registration Flow

Sign Up
→ กรอก Email
→ กรอก Password
→ กรอก Confirm Password
→ ยอมรับ Terms of Service และ Privacy Policy
→ กด Sign Up
→ ระบบส่ง OTP ไปยัง Email
→ OTP Verification
→ Verification Success
→ กลับไป Sign In

## Social Sign Up Flow

Sign Up
→ Continue with Google / Apple
→ ตรวจสอบสิทธิ์กับ Provider
→ สมัครสำเร็จ
→ เข้าใช้งานระบบได้

หมายเหตุ:

- Social Sign Up ใน V1 ไม่ต้อง Verify OTP

## Sign In Flow

Sign In
→ กรอก Email + Password หรือเลือก Google / Apple
→ ตรวจสอบสิทธิ์
→ เข้าใช้งานระบบ

## Forgot Password Flow

Forgot Password
→ กรอก Email
→ Send Reset Link
→ Check Email
→ เปิด Reset Link
→ Reset Password
→ Password Updated
→ Sign In

## Change Password Flow

Settings
→ Change Password
→ กรอก Current Password
→ กรอก New Password
→ กรอก Confirm Password
→ Save

## Sign Out Flow

Settings
→ Sign Out
→ Confirm
→ กลับสู่หน้า Sign In

---

# 8. Business Rules

## Registration Methods

ระบบรองรับ 3 วิธี:

- Email / Password
- Sign in with Google
- Sign in with Apple

## Identity Rule

- 1 Email = 1 Account
- ระบบต้อง Normalize Email เป็น Lowercase ก่อนตรวจสอบ

## Duplicate Registration Rule

กรณี Email ถูกใช้งานแล้ว:

- ต้องสมัครซ้ำไม่ได้
- ต้องแสดงข้อความแจ้งว่ามีบัญชีนี้อยู่แล้ว
- ต้องแนะนำให้ Sign In
- ต้องไม่เปิดเผยว่าบัญชีนี้สมัครด้วยวิธีใด เพื่อป้องกันความเสี่ยงด้านความปลอดภัยของบัญชี

## Account Linking Rule

- V1 ไม่รองรับ Account Linking
- V1 ไม่รองรับ Account Merge
- ห้าม Auto-Link ระหว่าง Email Account กับ Social Account

ตัวอย่าง:

- หากผู้ใช้สมัครด้วย Google มาก่อน แล้วมาสมัครด้วย Email เดิม ต้องไม่สร้างบัญชีซ้ำ และต้องแจ้งให้ Sign In ด้วย Google
- หากผู้ใช้สมัครด้วย Email มาก่อน แล้วมากด Sign in with Apple โดยใช้ Email เดียวกัน ต้องไม่ Auto-Merge

## Apple Private Relay Rule

- ต้องรองรับกรณี Apple ส่งอีเมลแบบ Private Relay
- ให้ถือว่าเป็น Identity ตามค่า Email ที่ Apple ส่งมา

## Terms & Privacy Rule

ผู้ใช้ทุกช่องทางการสมัครต้องยอมรับ:

- Terms of Service
- Privacy Policy

ก่อนสร้างบัญชีสำเร็จ

## OTP Rule

ใช้เฉพาะการสมัครด้วย Email

### OTP Configuration

- OTP Length = 6 Digits
- OTP Type = Numeric
- Expiry = 30 Minutes
- Wrong Attempt Limit = 5 Times

### Resend OTP Rule

- Resend ได้หลังจาก Cooldown 60 วินาที
- การ Resend ต้องสร้าง OTP ใหม่
- OTP เก่าต้องหมดสิทธิ์ใช้งานทันทีเมื่อมี OTP ใหม่ถูกส่ง

## Session Rule

- ผู้ใช้สามารถ Login พร้อมกันหลายอุปกรณ์ได้
- Sign Out เป็นการออกจากระบบเฉพาะอุปกรณ์ปัจจุบัน

## Password Policy

ใช้กับบัญชี Email / Password เท่านั้น

- Minimum 8 Characters
- Maximum 64 Characters
- ต้องมีตัวเลขหรือสัญลักษณ์อย่างน้อย 1 ตัว

## Forgot Password Rule

- ใช้ได้เฉพาะบัญชี Email / Password
- Google Account ใช้ Forgot Password ไม่ได้
- Apple Account ใช้ Forgot Password ไม่ได้
- ระบบต้องส่ง Password Reset Link ไปยัง Email
- Reset Link มีอายุ 30 นาที

## Change Password Rule

- ใช้ได้เฉพาะบัญชี Email / Password
- Google Account ไม่มีเมนู Change Password
- Apple Account ไม่มีเมนู Change Password

## Sign In Error Rule

หาก Sign In ไม่สำเร็จ ต้องแสดง Error State เช่น:

- Incorrect email or password
- Email not verified
- Suspended account
- Account not found / unavailable

## Suspended Account Rule

กรณีบัญชีถูกระงับ:

- ต้องไม่เข้าสู่ระบบได้
- ต้องแสดงเหตุผลการระงับ
- ต้องแสดงช่องทางติดต่อ support

## Sign Out Rule

- Sign Out แล้วต้องล้าง Session ของอุปกรณ์ปัจจุบัน
- อุปกรณ์อื่นยังคงใช้งาน Session เดิมได้

---

# 9. Permission Rules

## Guest

สามารถ:

- Open Sign In
- Open Sign Up
- Open Forgot Password
- Open Terms of Service
- Open Privacy Policy

## Email Account User

สามารถ:

- Sign In
- Forgot Password
- Reset Password
- Change Password
- Sign Out

## Google Account User

สามารถ:

- Sign In with Google
- Sign Out

ไม่สามารถ:

- Forgot Password
- Change Password

## Apple Account User

สามารถ:

- Sign In with Apple
- Sign Out

ไม่สามารถ:

- Forgot Password
- Change Password

---

# 10. Validation Rules

## Sign Up

Email:

- Required
- Valid Format
- Unique

Password:

- Required
- Minimum 8 Characters
- Maximum 64 Characters
- Must include number or symbol

Confirm Password:

- Required
- Must Match Password

Terms & Privacy:

- Required

## OTP

- Required
- Numeric Only
- 6 Digits

## Sign In

Email:

- Required
- Valid Format

Password:

- Required

## Forgot Password

Email:

- Required
- Valid Format

## Reset Password

New Password:

- Required
- Minimum 8 Characters
- Maximum 64 Characters
- Must include number or symbol

Confirm Password:

- Required
- Must Match New Password

## Change Password

Current Password:

- Required

New Password:

- Required
- Must match password policy
- Must not be the same as current password

Confirm Password:

- Required
- Must Match New Password

---

# 11. Exception Handling

## Sign Up

- Email Already Exists
- Invalid Email Format
- Password Policy Failed
- Terms Not Accepted

## OTP

- OTP Invalid
- OTP Expired
- OTP Attempt Exceeded

## Sign In

- Invalid Credential
- Email Not Verified
- Suspended Account
- Deleted Account

## Forgot Password

- Email Not Found
- Forgot Password Not Available For SSO Account

## Reset Password

- Reset Link Expired
- Reset Link Invalid
- Password Not Match

## Change Password

- Current Password Invalid
- Password Not Match
- New Password Same As Current Password

---

# 12. Empty State

Authentication Module ไม่มี Empty State

---

# 13. Notification Rules

ส่ง Email เมื่อ:

- Register (OTP)
- Resend OTP
- Forgot Password (Reset Link)
- Password Reset Success

---

# 14. Analytics Events

- Sign Up Success
- OTP Verification Success
- Sign In Success
- Sign In Failed
- Forgot Password Request
- Password Reset Success
- Change Password Success
- Sign Out Success
- Suspended Account Viewed

---

# 15. Acceptance Criteria

## Sign Up

- สมัครสมาชิกได้เมื่อกรอกข้อมูลครบ
- ยอมรับ Terms & Privacy แล้ว
- OTP ถูกส่งสำเร็จ
- SSO Sign Up ต้องไม่ต้อง Verify OTP

## OTP Verification

- OTP ถูกต้องจึงผ่าน
- OTP หมดอายุภายใน 30 นาที
- กรอกผิดเกิน 5 ครั้งต้องขอ OTP ใหม่
- Resend OTP ได้เมื่อ cooldown ครบ

## Sign In

- Email Account ต้อง Verify แล้วจึงเข้าใช้งานได้
- SSO Account ใช้งานได้ตาม provider ที่เชื่อมไว้
- กรณี credential ไม่ถูกต้องต้องแสดง error
- กรณีบัญชีถูก suspend ต้องแสดงเหตุผลและช่องทางติดต่อ support

## Forgot Password

- Email Account ขอ Reset Link ได้
- SSO Account ใช้ Forgot Password ไม่ได้
- Reset Link ถูกส่งไปยัง Email สำเร็จ
- Reset Link หมดอายุภายใน 30 นาที

## Reset Password

- เปิดลิงก์แล้วตั้งรหัสผ่านใหม่ได้
- Password ใหม่ต้องผ่าน policy
- Confirm Password ต้องตรงกัน
- เมื่อสำเร็จต้องเห็นหน้า Password Updated และ Sign In ต่อได้

## Change Password

- Email Account เปลี่ยนรหัสผ่านได้
- Google Account ไม่เห็นเมนู
- Apple Account ไม่เห็นเมนู

## Sign Out

- Session อุปกรณ์ปัจจุบันถูกล้าง
- อุปกรณ์อื่นยังใช้งานได้

---

# 16. Related Modules

- Profile Module
- Settings Module
- Notification Module
- Trust & Safety Module

---

# 17. Future Enhancement

- Two Factor Authentication (2FA)
- Face ID
- Touch ID
- Passkey Login
- Device Management
