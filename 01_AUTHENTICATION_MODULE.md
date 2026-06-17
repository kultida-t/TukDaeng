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

Authentication Module ใช้สำหรับสมัครสมาชิก เข้าสู่ระบบ ยืนยัน OTP กู้รหัสผ่าน เปลี่ยนรหัสผ่าน และออกจากระบบ โดยต้องรองรับ Email / Password, Sign in / Sign up with Apple และ Sign in / Sign up with Google ตาม master baseline

โมดูลนี้ต้องทำให้ Guest เปลี่ยนเป็น Member ได้อย่างถูกต้อง ป้องกัน account duplication, บังคับยอมรับ Terms of Service และ Privacy Policy ก่อนสมัคร และจัดการบัญชี Suspended ให้เห็นเหตุผลพร้อมช่องทางติดต่อ Support

# 3. Prototype Reference

- `Auth Sign up.png`
- `Auth Sign in & Reset password.png`
- `Auth Reset password.png`

# 4. Master Alignment Summary

| Area | Master Baseline |
| --- | --- |
| Supported auth methods | Sign Up, OTP Verification, Sign In, Forgot Password, Reset Password, Change Password, Sign Out, Apple, Google |
| Email / Password verification | Email / Password ต้องยืนยัน OTP |
| OTP expiration | OTP หมดอายุภายใน 30 นาที |
| Password policy | Password อย่างน้อย 8 ตัวอักษร และต้องมีตัวเลขหรือสัญลักษณ์ |
| Email uniqueness | 1 Email สมัครได้ 1 บัญชีเท่านั้น |
| SSO verification | SSO Email ไม่ต้องยืนยัน OTP |
| Email immutability | Email ไม่สามารถเปลี่ยนได้หลังยืนยันแล้ว |
| Auth method separation | บัญชี SSO ไม่สามารถ Sign In ด้วย Email / Password ได้ และกลับกัน |
| Suspended account | บัญชี Suspended ต้องเห็น error พร้อมเหตุผลและช่องทางติดต่อ Support |
| Terms / Privacy | ทุกช่องทางต้องยอมรับ Terms of Service และ Privacy Policy ก่อนสมัคร |
| Login required | Guest ใช้ feature ที่ต้อง Login ต้องเห็น Global Login Required Dialog |
| Security | ทุก API ใช้ HTTPS และใช้ Token-based Authentication |

# 5. Figma Gap Checklist For Authentication Module

รายการนี้ใช้เป็น checklist สำหรับปรับ Figma เฉพาะ Authentication Module ให้ตรงกับ master ก่อนส่งต่อ Dev / QA

| Priority | Gap | Master Baseline | Figma Action |
| --- | --- | --- | --- |
| Must Fix | ยังไม่เห็น Suspended Account state ชัดเจน | บัญชี Suspended ต้องเห็น error พร้อมเหตุผลและช่องทางติดต่อ Support | เพิ่ม suspended account screen/state ใน Sign In |
| Must Fix | Sign Up ทุกช่องทางอาจยังไม่บังคับ Terms / Privacy ชัดเจน | ทุกช่องทางต้องยอมรับ Terms of Service และ Privacy Policy ก่อนสมัคร | ตรวจให้ Email, Google และ Apple flow มี consent ครบก่อน submit |
| High | ยังไม่เห็น OTP expiration state | OTP หมดอายุภายใน 30 นาที | เพิ่ม expired OTP state และ action ขอ OTP ใหม่ |
| High | ยังไม่เห็น password policy ชัดเจน | Password อย่างน้อย 8 ตัวอักษร และต้องมีตัวเลขหรือสัญลักษณ์ | เพิ่ม validation copy ใน Sign Up, Reset Password, Change Password |
| High | ยังไม่เห็น duplicate email error | 1 Email สมัครได้ 1 บัญชีเท่านั้น | เพิ่ม existing email state และ copy ที่พาไป Sign In |
| High | ยังไม่เห็น SSO / Email auth method conflict | บัญชี SSO ไม่สามารถ Sign In ด้วย Email / Password ได้ และกลับกัน | เพิ่ม error state เมื่อใช้วิธี sign in ผิดกับบัญชีเดิม |
| High | ยังไม่เห็นว่า SSO Email ไม่ต้อง OTP | SSO Email ไม่ต้องยืนยัน OTP | ระบุ flow ของ Apple / Google ให้ข้าม OTP |
| Medium | ยังไม่เห็น rule ว่า Email เปลี่ยนไม่ได้หลังยืนยันแล้ว | Email ไม่สามารถเปลี่ยนได้หลังยืนยันแล้ว | เพิ่ม note หรือ locked email state หลัง verification |
| Medium | Forgot / Reset Password ยังไม่เห็น invalid/expired reset link state | Reset Password ต้องจัดการ token/link ที่ใช้ไม่ได้หรือหมดอายุ | เพิ่ม invalid/expired reset link state และทางขอ link ใหม่ |
| Medium | Global Login Required Dialog ยังไม่ผูกกับ Authentication ชัด | Guest ใช้ feature ที่ต้อง Login ต้องแสดง Global Login Required Dialog | เพิ่ม reusable dialog state และ destination ไป Sign In / Sign Up |

# 6. Scope

## In Scope

- Sign Up ด้วย Email / Password
- OTP Verification สำหรับ Email / Password
- Sign In ด้วย Email / Password
- Sign in / Sign up with Apple
- Sign in / Sign up with Google
- Forgot Password
- Reset Password
- Change Password
- Sign Out
- Suspended Account handling
- Global Login Required Dialog
- Terms of Service และ Privacy Policy consent ก่อนสมัคร

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

# 7. Screen Mapping

| Screen / State | Description |
| --- | --- |
| Sign Up | สมัครด้วย Email / Password และ consent |
| OTP Verification | กรอก OTP หลังสมัครด้วย Email / Password |
| OTP Expired | OTP หมดอายุ ต้องขอ OTP ใหม่ |
| Verification Success | ยืนยัน Email สำเร็จ |
| Sign In | เข้าระบบด้วย Email / Password, Apple, Google |
| Sign In Error | Email/password ผิด, account ไม่ตรง auth method, หรือ account unavailable |
| Suspended Account | แสดงเหตุผล suspension และช่องทางติดต่อ Support |
| Forgot Password | ขอ reset password ด้วย Email |
| Reset Link Sent | แจ้งให้ตรวจ Email |
| Reset Password | ตั้งรหัสผ่านใหม่ |
| Reset Link Invalid / Expired | reset link ใช้ไม่ได้หรือหมดอายุ |
| Password Updated Success | เปลี่ยนรหัสผ่านสำเร็จ |
| Change Password | เปลี่ยนรหัสผ่านจากสถานะ Login แล้ว |
| Sign Out Confirmation | ยืนยันออกจากระบบ |
| Global Login Required Dialog | แจ้ง Guest ให้ Login เมื่อต้องใช้ feature ที่ต้อง Login |

# 8. User States

## Guest / Unauthenticated

Guest สามารถ:

- เปิด Sign In
- เปิด Sign Up
- เปิด Forgot Password
- เปิด Terms of Service
- เปิด Privacy Policy
- ดู public surfaces ตามสิทธิ์ของ Guest

Guest ไม่สามารถใช้ feature ที่ต้อง Login เช่น Like, Follow, Comment, Chat, Make Offer, Favorites, Following, Watch Alert, Add / Edit / Delete Asset

เมื่อ Guest ใช้ feature ที่ต้อง Login ต้องแสดง Global Login Required Dialog

## Pending Verification

ผู้ใช้ที่สมัครด้วย Email / Password แล้วแต่ยังไม่ยืนยัน OTP:

- ต้องกรอก OTP เพื่อยืนยัน Email
- ขอ resend OTP ได้
- ไม่ควรเข้าใช้งาน authenticated feature ก่อน verification สำเร็จ

## Authenticated Member

ผู้ใช้ที่ยืนยันตัวตนสำเร็จสามารถใช้งานระบบตามสิทธิ์ Member และสามารถ Sign Out หรือ Change Password ได้ตาม auth method ที่รองรับ

## Suspended User

บัญชี Suspended ต้องไม่เข้าสู่ระบบได้ และต้องเห็น:

- error state ว่าบัญชีถูกระงับ
- เหตุผลการระงับ
- ช่องทางติดต่อ Support

## SSO Account

บัญชีที่สมัครด้วย Apple หรือ Google:

- ไม่ต้องยืนยัน OTP
- ต้องยอมรับ Terms of Service และ Privacy Policy ก่อนสมัคร
- ต้องใช้ SSO provider เดิมในการ Sign In
- ไม่สามารถ Sign In ด้วย Email / Password ได้

# 9. User Flow

## Email Registration

1. User เปิด Sign Up
2. User กรอก Email, Password, Confirm Password
3. User ยอมรับ Terms of Service และ Privacy Policy
4. ระบบตรวจ email uniqueness และ password policy
5. ระบบสร้าง Pending Verification account
6. ระบบส่ง OTP
7. User กรอก OTP
8. ระบบยืนยัน OTP และเปลี่ยนสถานะเป็น Authenticated Member

## Apple / Google Registration

1. User เลือก Apple หรือ Google
2. Provider ส่ง email กลับมา
3. ระบบตรวจว่า email ยังไม่ผูกกับบัญชีแบบอื่น
4. User ยอมรับ Terms of Service และ Privacy Policy
5. ระบบสร้างหรือเข้าสู่บัญชี SSO โดยไม่ต้อง OTP

## Sign In

1. User เลือก Email / Password, Apple หรือ Google
2. ระบบตรวจ auth method ให้ตรงกับบัญชีเดิม
3. ระบบตรวจ suspended status
4. หากผ่าน validation ให้เข้าสู่ระบบ
5. หากไม่ผ่าน ให้แสดง error state ที่ตรงสาเหตุ

## Forgot / Reset Password

1. User เปิด Forgot Password
2. User กรอก Email
3. ระบบส่ง reset link หากบัญชีรองรับ Email / Password
4. User เปิด reset link
5. User ตั้ง Password ใหม่ตาม policy
6. ระบบยืนยันและแสดง Password Updated Success

## Change Password

1. Authenticated Member เปิด Change Password
2. User กรอก current password
3. User กรอก new password และ confirm password
4. ระบบ validate current password และ password policy
5. ระบบเปลี่ยน password สำเร็จ

## Sign Out

1. Authenticated Member กด Sign Out
2. ระบบแสดง confirmation
3. User ยืนยัน
4. ระบบลบ local session/token และกลับสู่ Guest state

# 10. Business Rules

## Supported Authentication Methods

- Email / Password
- Apple Sign In
- Google OAuth

## Email / Password Rules

- Email / Password ต้องยืนยัน OTP
- OTP หมดอายุภายใน 30 นาที
- Password ต้องมีอย่างน้อย 8 ตัวอักษร
- Password ต้องมีตัวเลขหรือสัญลักษณ์อย่างน้อย 1 ตัว
- Confirm Password ต้องตรงกับ Password
- 1 Email สมัครได้ 1 บัญชีเท่านั้น
- Email ไม่สามารถเปลี่ยนได้หลังยืนยันแล้ว

## SSO Rules

- Apple และ Google ใช้ได้ทั้ง Sign In และ Sign Up
- SSO Email ไม่ต้องยืนยัน OTP
- บัญชี SSO ไม่สามารถ Sign In ด้วย Email / Password ได้
- บัญชี Email / Password ไม่สามารถ Sign In ด้วย SSO provider ได้ เว้นแต่มี account linking ในอนาคต
- Account Linking และ Account Merge ไม่อยู่ใน V1

## Terms And Privacy Rules

- ทุกช่องทางต้องยอมรับ Terms of Service และ Privacy Policy ก่อนสมัคร
- หากยังไม่ยอมรับ ต้องไม่สามารถ submit registration ได้
- Terms of Service และ Privacy Policy ต้องเปิดอ่านได้จาก Sign Up และ Settings

## Suspended Account Rules

- Suspended User ต้องไม่เข้าสู่ระบบได้
- Sign In ต้องแสดงเหตุผล suspension
- Sign In ต้องแสดงช่องทางติดต่อ Support

## Token And Session Rules

- ทุก API ใช้ HTTPS
- ระบบใช้ Token-based Authentication
- Sign Out ต้อง clear local token/session
- เมื่อ token หมดอายุ ให้กลับไป Guest state หรือแสดง Login Required ตาม context

# 11. Permission Rules

| Actor / State | Permission |
| --- | --- |
| Guest | เปิด Sign In, Sign Up, Forgot Password, Terms, Privacy และ public surfaces |
| Guest | ใช้ feature ที่ต้อง Login ไม่ได้ ต้องเห็น Global Login Required Dialog |
| Pending Verification | กรอก OTP และขอ resend OTP ได้ แต่ยังไม่ใช้ authenticated feature |
| Authenticated Member | ใช้ feature ตามสิทธิ์ Member |
| Suspended User | Sign In ไม่ได้ และต้องเห็น suspension reason + Support contact |
| SSO User | Sign In ด้วย provider เดิมเท่านั้น |

# 12. Validation Rules

| Field / Action | Validation |
| --- | --- |
| Email | ต้องเป็นรูปแบบ email ที่ถูกต้อง |
| Email uniqueness | 1 Email สมัครได้ 1 บัญชีเท่านั้น |
| Password | อย่างน้อย 8 ตัวอักษร และต้องมีตัวเลขหรือสัญลักษณ์ |
| Confirm Password | ต้องตรงกับ Password |
| OTP | ต้องถูกต้องและยังไม่หมดอายุ |
| OTP expiration | หมดอายุภายใน 30 นาที |
| Terms / Privacy consent | ต้องถูกยอมรับก่อนสมัครทุกช่องทาง |
| Auth method | ต้องตรงกับ method ที่บัญชีใช้สมัคร |
| Suspended status | ต้อง block sign in |
| Reset password link | ต้องถูกต้องและยังไม่หมดอายุ |
| Current password | ต้องถูกต้องก่อน Change Password |

# 13. Exception Handling

| Case | Expected Handling |
| --- | --- |
| Email ถูกใช้แล้ว | แสดง existing account error และเสนอไป Sign In |
| Password ไม่ผ่าน policy | แสดง validation message ตาม policy |
| Confirm Password ไม่ตรง | แสดง validation message |
| OTP ผิด | แสดง OTP invalid error |
| OTP หมดอายุ | แสดง expired state และให้ขอ OTP ใหม่ |
| Resend OTP ถี่เกินไป | แสดง cooldown หรือ rate limit message |
| ใช้ auth method ผิด | แจ้งว่าบัญชีนี้ต้อง Sign In ด้วย method เดิม |
| SSO provider error | แสดง error และให้ลองใหม่ |
| Reset link ใช้ไม่ได้หรือหมดอายุ | แสดง invalid/expired reset link state และให้ขอ link ใหม่ |
| Suspended account | แสดงเหตุผลและช่องทาง Support |
| Network error | แสดง error พร้อม retry |

# 14. Empty State

Authentication Module ไม่มี empty list state โดยตรง แต่ต้องมี neutral state สำหรับ:

- Form initial state
- Reset link sent confirmation
- Password updated success
- Verification success
- Sign out completed state

# 15. Notification Rules

- OTP และ reset password เป็น transactional message
- Authentication Module ไม่สร้าง in-app notification หลักของระบบ
- Push notification permission ไม่ควรถูกบังคับใน Authentication flow
- Global Login Required Dialog เป็น global state ไม่ใช่ notification

# 16. Analytics Events

| Event | Trigger |
| --- | --- |
| `auth_sign_up_started` | User เปิด Sign Up |
| `auth_terms_opened` | User เปิด Terms of Service |
| `auth_privacy_opened` | User เปิด Privacy Policy |
| `auth_sign_up_submitted` | User submit Sign Up |
| `auth_otp_submitted` | User submit OTP |
| `auth_otp_resend_tapped` | User ขอ OTP ใหม่ |
| `auth_sign_in_submitted` | User submit Sign In |
| `auth_sso_started` | User เริ่ม Apple / Google Sign In |
| `auth_sso_completed` | Apple / Google สำเร็จ |
| `auth_forgot_password_submitted` | User ขอ reset password |
| `auth_reset_password_submitted` | User submit password ใหม่ |
| `auth_change_password_submitted` | User submit Change Password |
| `auth_sign_out_confirmed` | User ยืนยัน Sign Out |
| `auth_login_required_shown` | Global Login Required Dialog แสดง |
| `auth_suspended_blocked` | Suspended account ถูก block ตอน Sign In |

# 17. Acceptance Criteria

| ID | Criteria |
| --- | --- |
| AC-AUTH-001 | User สมัครด้วย Email / Password ได้เมื่อกรอกข้อมูลครบและยอมรับ Terms / Privacy |
| AC-AUTH-002 | Email / Password registration ต้องส่งผู้ใช้ไป OTP Verification |
| AC-AUTH-003 | OTP ต้องหมดอายุภายใน 30 นาที |
| AC-AUTH-004 | OTP ที่หมดอายุต้องไม่สามารถ verify ได้ และต้องมีทางขอ OTP ใหม่ |
| AC-AUTH-005 | Password ต้องมีอย่างน้อย 8 ตัวอักษร และมีตัวเลขหรือสัญลักษณ์ |
| AC-AUTH-006 | Confirm Password ต้องตรงกับ Password |
| AC-AUTH-007 | 1 Email สมัครได้ 1 บัญชีเท่านั้น |
| AC-AUTH-008 | Email ไม่สามารถเปลี่ยนได้หลังยืนยันแล้ว |
| AC-AUTH-009 | Apple Sign In / Sign Up ต้องรองรับใน V1 |
| AC-AUTH-010 | Google Sign In / Sign Up ต้องรองรับใน V1 |
| AC-AUTH-011 | SSO Email ไม่ต้องยืนยัน OTP |
| AC-AUTH-012 | บัญชี SSO ไม่สามารถ Sign In ด้วย Email / Password ได้ |
| AC-AUTH-013 | บัญชี Email / Password ไม่สามารถ Sign In ด้วย SSO provider ได้ใน V1 |
| AC-AUTH-014 | ทุกช่องทางการสมัครต้องยอมรับ Terms of Service และ Privacy Policy ก่อนสมัคร |
| AC-AUTH-015 | Suspended account ต้อง Sign In ไม่ได้ |
| AC-AUTH-016 | Suspended account ต้องเห็น error พร้อมเหตุผลและช่องทางติดต่อ Support |
| AC-AUTH-017 | Forgot Password ต้องส่ง reset link สำหรับบัญชี Email / Password |
| AC-AUTH-018 | Reset Password ต้อง validate password policy |
| AC-AUTH-019 | Invalid หรือ expired reset link ต้องมี state แยกและทางขอ link ใหม่ |
| AC-AUTH-020 | Authenticated Member สามารถ Change Password ได้เมื่อ current password ถูกต้อง |
| AC-AUTH-021 | Sign Out ต้อง clear local token/session |
| AC-AUTH-022 | Guest ใช้ feature ที่ต้อง Login ต้องเห็น Global Login Required Dialog |
| AC-AUTH-023 | ทุก API ที่เกี่ยวกับ Authentication ต้องใช้ HTTPS และ Token-based Authentication |
| AC-AUTH-024 | V1 ไม่รองรับ 2FA, Passkey, Biometric Login, Account Linking, Account Merge หรือ Device Management |

# 18. Related Modules

- [02_FEED_MODULE.md](02_FEED_MODULE.md)
- [06_PROFILE_MODULE.md](06_PROFILE_MODULE.md)
- [13_SETTINGS_MODULE.md](13_SETTINGS_MODULE.md)
- [15_TRUST_SAFETY_MODULE.md](15_TRUST_SAFETY_MODULE.md)

# 19. Future Enhancement

- Two-Factor Authentication
- Passkey
- Biometric Login
- Account Linking
- Account Merge
- Device Management
- Login history
- Risk-based authentication
