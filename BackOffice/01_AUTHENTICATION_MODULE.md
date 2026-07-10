# 01 BO Authentication And Admin Accounts Module

อ้างอิง:

- `00_GLOBAL_RULES_MODULE.md`
- `BO_MASTER_BASELINE.md`
- `BO_PRD.md`
- `BO_Spec.md`
- `../ProjectAdmin/FO_BO_INTEGRATION_MAP.md`

---

# 1. ข้อมูลเอกสาร

| Field | Detail |
| --- | --- |
| Module Name | BO Authentication And Admin Accounts |
| Platform | Responsive Web Back Office |
| Version | `BO-PRD-v0.1` |
| Status | Draft |
| Owner | Product / UX / Engineering / Operations |
| Document Type | Functional PRD |

# 2. วัตถุประสงค์

เอกสารนี้กำหนด authentication, session, Email OTP verification, admin account lifecycle และ permission enforcement สำหรับ Back Office web application

BO authentication แยกจาก FO authentication โดยสมบูรณ์ FO user ไม่สามารถ login เข้า BO ได้ และ BO admin ไม่ใช้ Apple/Google SSO สำหรับ BO access ใน V1

# 3. ขอบเขต

## In Scope

- BO login ด้วย email/password
- Email OTP verification บังคับสำหรับ BO Admin login ทุกครั้ง
- Session timeout และ logout
- Failed login lockout
- Password reset สำหรับ BO admin
- Admin account lifecycle
- Admin access assignment
- Route/action permission enforcement
- Login/security audit events
- Responsive auth screens

## Out Of Scope

- FO user authentication
- Apple/Google SSO สำหรับ BO
- External identity provider integration
- Fine-grained permission editor นอกเหนือจาก baseline Admin access context Model
- Hardware security key support

# 4. Admin Account Type

BO uses exactly one admin account type: `Admin`. Authentication requirements do not split Admin into sub-types.

| Admin Account Type | Auth Requirement |
| --- | --- |
| Admin | Email/password + mandatory Email OTP |
# 5. Responsive Screen Requirements

| Screen | Mobile | Tablet | Desktop |
| --- | --- | --- | --- |
| Login | Single-column form, input/action เต็มความกว้าง | Centered form card | Centered form panel พร้อม optional security/help content |
| Email OTP Verify | Single-column code input | Centered form | Centered form |
| Reset Password | Single-column form | Centered form | Centered form |
| Session Expired | Full-width message/action | Centered message | Centered message |
| Access Denied | Message ชัดเจนและ back action | Same | Same |
| Admin Account List | Card/list view พร้อม priority fields | Table หรือ cards | Dense table |
| Admin Account Detail | Stacked sections | Two-column sections | Detail layout พร้อม audit/sidebar เมื่อเหมาะสม |

Auth action ทุกอย่างต้องใช้งานได้บน mobile-width browser

# 6. Login Flow

1. Admin เปิด BO login
2. Admin กรอก email และ password
3. ระบบ validate credentials
4. หลัง password ถูกต้อง ระบบสร้าง Email OTP 6 หลักและส่งไปยัง email ของ Admin account
5. ระบบพาไปหน้า Email OTP verification
6. Admin กรอก OTP
7. ถ้า OTP ถูกต้องและยังไม่หมดอายุ ระบบสร้าง BO session
8. Admin เข้าสู่ Dashboard หรือ authorized deep link เดิม
9. Login success และ OTP verified ถูก audit-log

## Requirements

- Login ใช้ email/password เท่านั้น
- Login form ต้องมี password visibility toggle
- Invalid credentials ต้องแสดง generic error
- Lockout error ต้องไม่เปิดเผย security detail เกินจำเป็น
- ถ้า admin เปิด unauthorized deep link หลัง login ให้แสดง access denied ไม่ใช่ redirect เงียบ ๆ

# 7. Email OTP Verification

## Requirements

- Admin must pass Email OTP verification after password validation before entering BO
- V1 ใช้ Email OTP แทนแอปยืนยันตัวตนภายนอก เพื่อลด friction สำหรับทีม BO ขนาดเล็ก
- OTP ต้องเป็นรหัส 6 หลัก สร้างใหม่ต่อ login attempt และผูกกับ Admin account/session challenge
- OTP ต้องหมดอายุภายใน 5 นาที
- Resend OTP ต้องมี cooldown อย่างน้อย 60 วินาที และต้อง invalidate หรือ supersede OTP เดิมตาม implementation policy
- OTP verification ผิดครบ 5 ครั้งต้อง block challenge และให้เริ่ม login ใหม่ หรือ lock account ตาม risk policy
- Email delivery failure ต้องแสดง state ให้ retry/resend ได้โดยไม่เปิดเผย security detail เกินจำเป็น

## Email OTP Challenge States

| State | Meaning | Required Behavior |
| --- | --- | --- |
| Pending | Password ถูกต้องและระบบส่ง OTP แล้ว | แสดงหน้า Email OTP verification |
| Verified | OTP ถูกต้องและยังไม่หมดอายุ | สร้าง BO session และเข้า Dashboard/deep link ที่ได้รับอนุญาต |
| Invalid | OTP ผิด | แจ้ง invalid code และให้ retry จนถึง attempt limit |
| Expired | OTP หมดอายุ | ให้ resend OTP และไม่รับรหัสเดิม |
| Delivery Failed | ส่ง email ไม่สำเร็จ | แสดง retry/resend state และ audit event ตาม risk policy |

# 8. Session Rules

| Rule | Requirement |
| --- | --- |
| Idle timeout | Session หมดอายุหลัง idle 8 ชั่วโมง |
| Max session | Session หมดอายุสูงสุด 24 ชั่วโมง |
| Logout | Manual logout ต้อง clear BO session |
| Session expired | Redirect ไป login พร้อม session expired message |
| Admin access changed during session | Permission ต้องสะท้อน admin access ล่าสุดใน permission check หรือ token refresh ถัดไป |
| Admin account suspended/banned | Session ต้องถูก revoke หรือ block ใน request ถัดไป |

# 9. Failed Login And Lockout

| Rule | Requirement |
| --- | --- |
| Failed attempt limit | 5 ครั้ง |
| Lockout duration | 15 นาที |
| Audit | Failed login และ lockout ต้อง audit-log |
| Message | แสดง lockout message ชัดเจนแต่ไม่เปิดเผยข้อมูลเกินจำเป็น |
| Reset | Admin unlock account ได้ตาม policy |

# 10. Admin Account Lifecycle

## Admin Account Status

| Status | Meaning |
| --- | --- |
| Invited | สร้าง account แล้ว แต่ admin ยังไม่ได้ตั้ง password |
| Active | Admin login ได้ตาม admin access/Email OTP rule |
| Locked | ถูก lock จาก failed attempts หรือ security action |
| Suspended | ถูก disable โดย Admin |
| Archived | เอาออกจาก active use แต่เก็บไว้เพื่อ audit history |

## Admin Account Fields

| Field | Required | Notes |
| --- | --- | --- |
| Admin ID | Yes | System generated |
| Full Name | Yes | ชื่อที่แสดงภายใน |
| Email | Yes | Unique login identifier |
| Admin access | Yes | ใช้ baseline BO Admin Access |
| Status | Yes | Admin account status |
| Email OTP Required | Yes | Required for BO Admin login |
| Last Login At | No | แสดงใน account detail |
| Created By | Yes | Audit |
| Updated By | Yes | Audit |
| Created At | Yes | Audit |
| Updated At | Yes | Audit |

# 11. Admin Account Actions

| Action | Permission | Audit Required |
| --- | --- | --- |
| Invite Admin | Admin | Yes |
| Change Admin access | Admin | Yes |
| Suspend Admin | Admin | Yes |
| Reactivate Admin | Admin | Yes |
| Unlock Admin | Admin | Yes |
| Archive Admin | Admin | Yes |
| View Admin List | Admin | เฉพาะ export ต้อง audit |
| View Own Profile | All admins | No ยกเว้นดู sensitive/security data |
| Change Own Password | All admins | Yes |

Admin ต้องไม่สามารถลบ/ระงับ/เปลี่ยน admin access ของ Admin คนสุดท้ายได้ ถ้ายังไม่มี Admin active คนอื่นรองรับ

# 12. Permission Enforcement

ต้องตรวจ permission ที่:

- Route access
- Navigation rendering
- API/action access
- Field-level sensitive data access
- Export access
- Audit log access

ถ้า UI permission กับ API permission ไม่ตรงกัน ให้ API permission เป็นตัวตัดสิน

# 13. Security Events To Audit

- Login success
- Login failure
- Logout
- Session expired
- Account locked
- Account unlocked
- Password reset requested
- Password changed
- Email OTP sent
- Email OTP verified
- Email OTP failed/expired/resend
- Admin access changed
- Admin invited
- Admin suspended/reactivated
- Admin archived
- Access denied for restricted route/action

# 14. Error And Empty States

| Case | Required State |
| --- | --- |
| Invalid credentials | Generic login error |
| Email OTP invalid code | แจ้ง invalid code และให้ retry |
| Email OTP expired | แจ้ง expired state และให้ resend OTP |
| Email OTP delivery failed | แจ้งว่าส่งรหัสไม่ได้และให้ retry/resend |
| Account locked | แสดง lockout message และ support/admin contact route ถ้ามี |
| Account suspended | แสดง access unavailable message |
| Session expired | แสดง session expired message และ login action |
| Unauthorized route | แสดง access denied state |
| No admin accounts found | แสดง empty state พร้อม invite action สำหรับ Admin |

# 15. Acceptance Criteria

| ID | Criteria |
| --- | --- |
| AC-BO-AUTH-001 | BO login รองรับ email/password เท่านั้น |
| AC-BO-AUTH-002 | FO user login เข้า BO ไม่ได้ |
| AC-BO-AUTH-003 | Admin must pass mandatory Email OTP verification before entering BO |
| AC-BO-AUTH-004 | Failed login ครบ 5 ครั้งแล้ว lock account 15 นาที |
| AC-BO-AUTH-005 | Idle session หมดอายุหลัง 8 ชั่วโมง และ max session หมดอายุหลัง 24 ชั่วโมง |
| AC-BO-AUTH-006 | Route และ action permission check ต้อง block unauthorized access |
| AC-BO-AUTH-007 | Navigation ซ่อน module ที่ไม่มีสิทธิ์ แต่ direct URL ยังต้อง enforce permission |
| AC-BO-AUTH-008 | Admin account lifecycle รองรับ invited, active, locked, suspended, archived |
| AC-BO-AUTH-009 | Admin active คนสุดท้ายต้องไม่ถูก archive/suspend/change admin access policy ถ้ายังไม่มี replacement |
| AC-BO-AUTH-010 | Login, logout, failed login, lockout, password, Email OTP, admin access และ admin account changes ต้อง audit-log |
| AC-BO-AUTH-011 | Auth screens ใช้งานได้บน mobile, tablet, desktop และ wide desktop widths |

# 16. Related Modules

- `00_GLOBAL_RULES_MODULE.md`
- `02_DASHBOARD_MODULE.md`
- `08_AUDIT_LOG_MODULE.md`
- `16_ADMIN_SETTINGS_MODULE.md`
