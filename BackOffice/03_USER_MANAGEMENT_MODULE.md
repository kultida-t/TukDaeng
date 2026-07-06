# 03 BO User Management Module

อ้างอิง:

- `00_GLOBAL_RULES_MODULE.md`
- `01_AUTHENTICATION_MODULE.md`
- `02_DASHBOARD_MODULE.md`
- `BO_MASTER_BASELINE.md`
- `../ProjectAdmin/FO_BO_INTEGRATION_MAP.md`
- `../FrontOffice/01_AUTHENTICATION_MODULE.md`
- `../FrontOffice/06_PROFILE_MODULE.md`
- `../FrontOffice/15_TRUST_SAFETY_MODULE.md`

---

# 1. ข้อมูลเอกสาร

| Field | Detail |
| --- | --- |
| Module Name | BO User Management |
| Platform | Responsive Web Back Office |
| Version | `BO-PRD-v0.1` |
| Status | Draft |
| Owner | Product / UX / Engineering / Operations |
| Document Type | Functional PRD |

# 2. วัตถุประสงค์

User Management ใช้ให้ Admin ตรวจสอบและจัดการบัญชีผู้ใช้ FO ในมุม operation, support และ trust & safety โดยต้องรองรับ user search, profile review, login history, auth method, report status, suspend/ban, reset password เฉพาะบัญชี Email/Password, soft delete/archive และ export ตามสิทธิ์

Module นี้ต้องไม่สร้าง role แยกใน FO ผู้ใช้ FO ทุกคนยังเป็น `User` role เดียว แต่ BO สามารถเปลี่ยน account status เพื่อควบคุมการ login และ public visibility ตาม policy

# 3. ขอบเขต

## In Scope

- User list
- Search/filter/sort/pagination
- User profile detail
- Auth method visibility: Email, Apple, Google
- Login history
- User status: Active, Suspended, Banned, Soft Deleted / Archived
- Reported user review context
- Suspend / Ban / Unsuspend / Unban
- Reset password เฉพาะ Email/Password account
- Soft delete / archive user โดย Admin ตามสิทธิ์
- Export CSV/Excel ตาม permission
- Audit log สำหรับทุก mutation และ sensitive access
- FO impact mapping
- Responsive list/detail/action layout

## Out Of Scope

- FO sign up/sign in implementation
- Account deletion workflow เต็มรูปแบบจาก FO request queue ซึ่งอยู่ใน `13_ACCOUNT_DELETION_MODULE.md`
- Appeal ban flow
- Automated risk scoring
- CRM integration
- User role segmentation แบบ Buyer/Seller/Collector

# 4. Users And Permissions

| BO Role | Access |
| --- | --- |
| Super Admin | Full access, suspend/ban/unban, soft delete/archive, export, sensitive fields, audit link |
| Support Admin | View user profile, login history, reset password เฉพาะ Email/Password, view/recheck deletion-related conditions |
| Moderator | View limited user profile, reported user context, linked assets/reports, recommend or perform moderation action ตาม policy |
| Content Admin | ไม่มี access โดย default |
| Market Admin | ไม่มี access โดย default |

Permission rules:

- Action ที่เปลี่ยน account status ต้องตรวจ permission ที่ API/action level
- Sensitive fields ต้อง mask ถ้า role ไม่มีสิทธิ์
- Export user data เฉพาะ Super Admin หรือ role ที่ได้รับ explicit permission
- Support Admin ห้าม suspend/ban/unban เว้นแต่ policy เพิ่มสิทธิ์ภายหลัง

# 5. Responsive Layout

| Breakpoint | Layout |
| --- | --- |
| Mobile `< 768px` | User list เป็น card list พร้อม search/filter drawer; detail เป็น stacked sections; action menu ใช้ bottom sheet |
| Tablet `768px - 1199px` | Table หรือ card list ตามพื้นที่; detail ใช้ 2 column ได้; filter drawer |
| Desktop `>= 1200px` | Dense table, side filter, detail page พร้อม action panel |
| Wide Desktop `>= 1440px` | รองรับ split list/detail หรือ detail + audit/activity side panel |

ข้อกำหนด:

- Action สำคัญ เช่น suspend/ban ต้องใช้งานได้บน mobile แต่ต้องมี confirmation ชัดเจน
- Login history และ activity list ต้องอ่านได้บนจอเล็กโดยไม่ overflow สำคัญ
- Sensitive data mask ต้องชัดเจนและไม่ทำให้ layout พัง

# 6. User List

User list ต้องรองรับ:

- Search by User ID, username/display name, email, phone
- Filter by status
- Filter by auth method
- Filter by date joined
- Filter by last active
- Filter by reported status
- Filter by asset count range หรือ has assets
- Sort by created date, last active, report count, asset count
- Pagination
- Export ตาม permission

## Columns / Priority Fields

| Field | Desktop Table | Mobile Card |
| --- | --- | --- |
| User ID | Yes | Secondary |
| Display Name | Yes | Primary |
| Email | Yes, masked by permission | Secondary / masked |
| Auth Method | Yes | Yes |
| Phone | Optional, masked | Optional |
| Status | Yes | Primary badge |
| Date Joined | Yes | Secondary |
| Last Active | Yes | Secondary |
| Total Assets | Yes | Secondary |
| Report Count | Yes | Badge if > 0 |
| Actions | Yes | More menu |

# 7. User Detail

User detail ต้องแสดงข้อมูลเป็น sections:

| Section | Content |
| --- | --- |
| Account Summary | User ID, display name, profile image, status, joined date, last active |
| Contact / Auth | Email, phone, auth method, SSO provider, email verification state |
| FO Profile Preview | Public profile summary และ link/deep link reference |
| Assets Summary | Asset counts by Sale, Show, Hide, Sold, Removed/Hidden |
| Reports | Reported user history, report reasons, status, latest report |
| Login History | Recent login attempts, auth method, device/IP where allowed |
| Support Context | Linked tickets, account issues, reset password history |
| Account Deletion Context | Pending offers/assets/chats summary when relevant |
| Activity Timeline | Recent FO and BO-related events |
| Audit Summary | Recent admin actions for permitted roles |

Sensitive fields:

- Email
- Phone
- IP address
- Device identifiers
- Login history details
- Account deletion archive details

ต้อง mask ตาม role และ audit-log เมื่อ access/export เป็น high-risk

# 8. User Status Model

| Status | BO Meaning | FO Impact |
| --- | --- | --- |
| Active | User ใช้ FO ได้ปกติ | Login และ action ปกติทำได้ |
| Suspended | จำกัดชั่วคราวตาม policy | Login blocked หรือ session revoked; ต้องเห็น suspension state ตาม FO Auth rule |
| Banned | จำกัดถาวรจนกว่า Super Admin จะปลด | Login blocked และ user ไม่สามารถสร้าง activity ใหม่ |
| Soft Deleted / Archived | Account ถูกลบ/archived ตาม workflow | Login blocked; public profile/assets ถูกซ่อนหรือ anonymized ตาม retention policy |

Status transition:

| Transition | Permission | Required Inputs | FO Impact | Audit |
| --- | --- | --- | --- | --- |
| Active -> Suspended | Super Admin | Reason, optional duration | Login/action blocked | Yes |
| Suspended -> Active | Super Admin | Reason | Login/action restored | Yes |
| Active/Suspended -> Banned | Super Admin | Reason | Login/action blocked permanently until unban | Yes |
| Banned -> Active | Super Admin | Reason | Login/action restored | Yes |
| Active/Suspended/Banned -> Soft Deleted / Archived | Super Admin | Reason, retention/validation note | Login blocked, public profile/assets hidden/anonymized | Yes |

# 9. Admin Actions

| Action | Role | Confirmation | Reason Required | FO Impact |
| --- | --- | --- | --- | --- |
| View User | Super Admin, Support Admin, Moderator limited | No | No | No direct change |
| Reset Password | Super Admin, Support Admin | Yes | Optional | Sends reset flow for Email/Password account only |
| Suspend User | Super Admin | Yes | Yes | User login/action blocked |
| Unsuspend User | Super Admin | Yes | Yes | User access restored |
| Ban User | Super Admin | Yes | Yes | User login/action blocked until unban |
| Unban User | Super Admin | Yes | Yes | User access restored |
| Soft Delete / Archive User | Super Admin | Yes | Yes | User/profile/assets hidden or anonymized by policy |
| Export User Data | Super Admin | Yes for sensitive export | Optional/required by policy | No FO UI change |

# 10. Reset Password Rules

- Reset password จาก BO ใช้ได้เฉพาะ FO account ที่สมัครด้วย Email/Password
- Apple/Google accounts reset password จาก BO ไม่ได้
- Reset password action ต้องไม่เปิดเผย password เดิม
- BO ควรส่ง reset link หรือ trigger reset process ตาม auth system
- Reset action ต้อง audit-log
- ถ้า account suspended/banned อยู่ การ reset password ไม่ควร restore access เอง ต้องแก้ status แยกต่างหาก

# 11. Reported User Handling

Reported user ใน BO ต้องแสดง:

- Report reason
- Reporter identity ตาม permission/policy
- Report timestamp
- Related asset/chat/comment ถ้ามี
- Report status
- Previous reports
- Admin action history

กฎ:

- Report User จาก FO ไม่ทำให้ profile/content หายทันที
- Admin review แล้วจึง suspend/ban/clear ได้ตาม policy
- ผู้ถูก report ไม่เห็นตัวตนของ reporter
- Report handling target: ภายใน 24 ชั่วโมง

# 12. FO Impact

| BO Change | FO Required Behavior |
| --- | --- |
| Suspend user | User sign in ไม่ได้ หรือ session ถูก block/revoked; แสดง suspended account state พร้อมเหตุผลและ support contact |
| Ban user | User sign in ไม่ได้จนกว่า Super Admin unban |
| Unsuspend/Unban | User กลับมา login/action ได้ตามปกติ |
| Soft delete/archive | User login ไม่ได้; public profile/assets hidden หรือ anonymized ตาม policy |
| Reset password | User ได้ reset flow; ไม่เปลี่ยน auth method |
| Clear report without action | FO content/profile ยังแสดงต่อ |

Integration map ที่เกี่ยวข้อง:

- `INT-002` User reports user/profile
- `INT-023` User requests account deletion
- `INT-026` Admin performs sensitive action

# 13. Filters And Saved Views

Default views:

- All Users
- Active Users
- Suspended Users
- Banned Users
- Reported Users
- New Users Today
- Recently Active
- Email/Password Accounts
- Apple Accounts
- Google Accounts

Dashboard drill-in:

- New Users metric -> `New Users Today` หรือ date range ที่ส่งมา
- Reported Users queue -> `Reported Users`
- Support user shortcut -> filter by linked ticket/user issue

# 14. Empty / Error / Loading States

| State | Required Behavior |
| --- | --- |
| Loading | Skeleton สำหรับ table/card และ detail |
| Empty list | แสดงว่าไม่พบผู้ใช้ตาม filter และมี reset filter |
| User not found | แสดง data unavailable พร้อมกลับไป list |
| Access denied | แสดงว่า role ไม่มีสิทธิ์เข้า user management/action |
| Partial detail error | Section ที่ load fail ต้อง retry ได้ โดย detail หลักยังแสดงถ้าเป็นไปได้ |
| Export processing | แสดง queued/in-progress และ download เมื่อสำเร็จ |

# 15. Audit Requirements

ต้อง audit-log:

- View/export sensitive user data เมื่อเข้าข่าย high-risk
- Reset password
- Suspend/ban/unsuspend/unban
- Soft delete/archive
- Status change
- Report review decision
- Permission denied on sensitive action
- Export user list/data

Audit fields ใช้ตาม `00_GLOBAL_RULES_MODULE.md`

# 16. Performance Requirements

- User list ต้องใช้ server-side pagination/search/filter
- Search ควรตอบสนองเร็วพอสำหรับ operation workflow
- Detail page สามารถ lazy load sections หนัก เช่น login history/activity ได้
- Export ขนาดใหญ่ต้องใช้ background job

# 17. Acceptance Criteria

| ID | Criteria |
| --- | --- |
| AC-BO-USER-001 | User list รองรับ search/filter/sort/pagination |
| AC-BO-USER-002 | User detail แสดง account summary, auth method, profile, assets summary, reports, login history และ activity ตาม permission |
| AC-BO-USER-003 | Support Admin reset password ได้เฉพาะ Email/Password account |
| AC-BO-USER-004 | Apple/Google accounts reset password จาก BO ไม่ได้ |
| AC-BO-USER-005 | Super Admin suspend/ban/unsuspend/unban ได้พร้อม confirmation และ reason |
| AC-BO-USER-006 | Suspended/Banned user login FO ไม่ได้ |
| AC-BO-USER-007 | Report User ไม่ทำให้ profile/content หายทันทีจนกว่า Admin moderation action |
| AC-BO-USER-008 | Reported user queue/detail ต้องรองรับ SLA 24 ชั่วโมง |
| AC-BO-USER-009 | Sensitive user fields ต้อง mask สำหรับ role ที่ไม่มีสิทธิ์ |
| AC-BO-USER-010 | Export user data ต้องควบคุมด้วย permission และ audit-log |
| AC-BO-USER-011 | User status mutation ทุกครั้งต้องมี audit log พร้อม before/after state |
| AC-BO-USER-012 | Module ใช้งานได้ที่ mobile, tablet, desktop และ wide desktop widths |

# 18. Related Modules

- `00_GLOBAL_RULES_MODULE.md`
- `01_AUTHENTICATION_MODULE.md`
- `02_DASHBOARD_MODULE.md`
- `04_ASSET_MANAGEMENT_MODULE.md`
- `08_AUDIT_LOG_MODULE.md`
- `12_HELP_SUPPORT_MODULE.md`
- `13_ACCOUNT_DELETION_MODULE.md`
- `../ProjectAdmin/FO_BO_INTEGRATION_MAP.md`
