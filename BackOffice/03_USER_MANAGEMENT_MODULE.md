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

Module นี้ต้องไม่สร้างสิทธิ์หรือประเภทผู้ใช้แบบ Admin ใน FO ผู้ใช้ FO ทุกคนยังเป็น account type เดียวคือ `User` แต่ BO สามารถเปลี่ยน account status เพื่อควบคุมการ login และ public visibility ตาม policy

# 3. ขอบเขต

## In Scope

- User list
- Search/filter/sort/pagination
- User profile detail
- Auth method visibility: Email, Apple, Google
- Login history
- User status: Pending Verification, Active, Suspended, Banned, Deletion Requested, Deleted / Archived
- Reported user review context
- Suspend / Ban / Unsuspend / Unban
- Reset password เฉพาะ Email/Password account
- Soft delete / archive user โดย Admin ตามสิทธิ์
- Export policy/permission สำหรับ user data โดยไม่เพิ่มปุ่ม export ใน User List ใน Phase 1
- Audit log สำหรับทุก mutation และ sensitive access
- FO impact mapping
- Responsive list/detail/action layout

## Out Of Scope

- FO sign up/sign in implementation
- Account deletion workflow เต็มรูปแบบจาก FO request queue ซึ่งอยู่ใน `13_ACCOUNT_DELETION_MODULE.md`
- Appeal ban flow
- Automated risk scoring
- CRM integration
- User account segmentation แบบ Buyer/Seller/Collector

# 4. Admin Access And Permissions

BO มีประเภทบัญชีผู้ดูแลเพียงประเภทเดียวคือ `Admin` ไม่มีการแยกเป็น admin ย่อยหลายระดับใน module นี้ การเข้าถึงและการกระทำใน User Management ต้องควบคุมด้วย policy ของแต่ละ action และ policy สำหรับข้อมูล sensitive แทน

หลักการสำคัญคือ Admin เห็นหรือทำ action ได้เฉพาะเมื่อได้รับสิทธิ์ใน module นั้นแล้ว และ action ที่มีผลต่อผู้ใช้ FO หรือเกี่ยวข้องกับข้อมูลส่วนตัวต้องมี confirmation, reason และ audit log ตามระดับความเสี่ยง

| พื้นที่การเข้าถึง | กฎการใช้งาน |
| --- | --- |
| ดูข้อมูลผู้ใช้ | Admin ดู User List และ User Detail ได้เมื่อได้รับสิทธิ์เข้าใช้งาน User Management module |
| Reset password | ทำได้เฉพาะบัญชีที่สมัครด้วย Email/Password เท่านั้น และต้องบันทึก audit log ทุกครั้ง |
| Suspend / ban / unban | ต้องมีหน้าจอยืนยัน action, ระบุ reason, แสดงผลกระทบต่อ FO ให้ Admin เห็นก่อนยืนยัน และบันทึก audit log |
| Soft delete / archive | ต้องมีหน้าจอยืนยัน action, ระบุ reason, ตรวจสอบ retention/dependency ที่เกี่ยวข้อง และบันทึก audit log |
| ข้อมูล sensitive | ต้อง mask เป็นค่าเริ่มต้น เช่น email, phone, IP หรือ device detail การกดดูข้อมูลเต็มต้องมี policy รองรับและต้องถูกบันทึก audit |
| Export user data | ต้องอยู่ภายใต้ export policy, จำกัด scope ของข้อมูลที่ export, ระบุ reason เมื่อมีข้อมูล sensitive และบันทึก audit event |

หมายเหตุ: สิทธิ์ในตารางนี้เป็น baseline สำหรับ Phase 1 หากอนาคตต้องมี role หรือ permission level ที่ละเอียดขึ้น ให้เพิ่มผ่าน policy กลางของ BO ไม่ควรเพิ่ม account type ใหม่ใน FO user model

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

- ค้นหาจาก display name, email และ internal User ID/reference ในกรณีที่ support ได้ ID มาจาก report หรือ audit log
- Filter ตาม account status
- Filter ตาม auth method
- Filter ตามวันที่สมัคร
- Filter ตามวันที่ใช้งานล่าสุด
- Filter ตาม reported status
- Filter ตามช่วงจำนวน asset หรือบัญชีที่มี asset
- Sort ตามวันที่สร้างบัญชี, วันที่ใช้งานล่าสุด, จำนวน report และจำนวน asset
- Pagination แบบ server-side
- User List ใน Phase 1 ไม่ต้องมีปุ่ม export โดยตรง หากต้อง export ข้อมูลผู้ใช้ให้ใช้ workflow ที่ควบคุม permission ใน Reports/export หรือ system-level export แยกต่างหาก

## Columns / Priority Fields

| Field | Desktop Table | Mobile Card |
| --- | --- | --- |
| User ID | No in list; available in detail/search support | Detail only |
| Display Name | Yes | Primary |
| Email | Yes, masked by permission | Secondary / masked |
| Auth Method | Yes | Yes |
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
| Contact / Auth | Email, auth method, SSO provider, email verification state; optional contact fields such as phone/Line/Facebook/Instagram are shown only if the user later filled them in profile/contact details |
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

Contact / Auth display rule:

- BO ต้องดึงข้อมูล contact/profile ที่ผู้ใช้กรอกจาก FO มาแสดงเท่าที่มีจริง และต้องไม่แสดง row ว่าง
- Field หลักจาก FO Settings / Edit Profile ได้แก่ `Username`, `Phone`, `Line`, และ `Email Display`
- Email แสดงจาก auth/provider ตาม rule ของ FO และโดยทั่วไปเปลี่ยนไม่ได้เมื่อ verify แล้ว
- Social/contact เพิ่มเติม เช่น `Facebook` หรือ `Instagram` แสดงได้เฉพาะเมื่อมีข้อมูลจาก flow ที่รองรับ เช่น consignment/contact context หรือ future profile field ที่ Product อนุมัติ
- Contact fields ต้อง mask ตาม permission และ audit เมื่อต้องดูข้อมูล sensitive แบบ unmasked
- User Detail prototype แสดง email แบบเต็ม และแสดง phone/Line/Facebook/Instagram เฉพาะกรณีที่ผู้ใช้กรอกไว้ภายหลังใน profile/contact details; ระบบจริงยังต้องควบคุม permission และ audit การเข้าถึงข้อมูล sensitive ตาม global security rule

ต้อง mask ตาม admin access และ audit-log เมื่อ access/export เป็น high-risk

# 8. User Status Model

| Status | BO Meaning | FO Impact |
| --- | --- | --- |
| Pending Verification | ผู้ใช้สมัครด้วย Email/Password แล้ว แต่ยังไม่ยืนยัน OTP/email | ยังไม่ถือเป็น authenticated member; ใช้ได้เฉพาะ flow ยืนยันตัวตนหรือ resend OTP ตาม FO Auth rule |
| Active | User ใช้ FO ได้ปกติ | Login และ action ปกติทำได้ |
| Suspended | จำกัดชั่วคราวตาม policy | Login blocked หรือ session revoked; ต้องเห็น suspension state ตาม FO Auth rule |
| Banned | จำกัดถาวรจนกว่า Admin จะปลด | Login blocked และ user ไม่สามารถสร้าง activity ใหม่ |
| Deletion Requested | User ขอปิด/ลบบัญชีแล้ว และกำลังอยู่ใน workflow ตรวจ dependency | Login/session และ public visibility ต้องเป็นไปตาม Account Deletion policy |
| Deleted / Archived | Account ถูกลบหรือ archive ตาม workflow สำเร็จแล้ว | Login blocked; public profile/assets ถูกซ่อนหรือ anonymized ตาม retention policy |

Status transition:

| Transition | Permission | Required Inputs | FO Impact | Audit |
| --- | --- | --- | --- | --- |
| Pending Verification -> Active | System | OTP/email verified | User เริ่มใช้งาน authenticated FO features ได้ | Yes |
| Active -> Suspended | Admin | Reason, optional duration | Login/action blocked | Yes |
| Suspended -> Active | Admin | Reason | Login/action restored | Yes |
| Active/Suspended -> Banned | Admin | Reason | Login/action blocked permanently until unban | Yes |
| Banned -> Active | Admin | Reason | Login/action restored | Yes |
| Active/Suspended/Banned -> Deletion Requested | System / Account Deletion | Deletion request created | เข้าสู่ deletion workflow และต้องตรวจ dependency ก่อนลบจริง | Yes |
| Deletion Requested -> Deleted / Archived | Admin / Account Deletion | Reason, retention/validation note, dependency cleared | Login blocked, public profile/assets hidden/anonymized | Yes |

## 8.1 Suspension / Ban Policy

การเปลี่ยนสถานะจาก report ต้องแยกเป็น 2 ชั้น:

1. `Reported Users` queue คือรายการที่ต้อง review
2. `Suspended` / `Banned` คือผลลัพธ์จาก policy หรือ Admin decision

Report count ไม่ควรทำให้ user ถูก ban อัตโนมัติทันที เพราะอาจมี false report หรือการกลั่นแกล้งได้ แต่สามารถใช้เป็น threshold เพื่อให้ระบบเพิ่มความเร่งด่วนและระงับชั่วคราวได้ตาม policy

Recommended policy:

| Condition | System / BO Behavior | Resulting Status |
| --- | --- | --- |
| 1-2 valid-looking reports | เข้าคิว `Reported Users` และแสดงใน report count | ยังเป็น `Active` จนกว่า Admin review |
| >= 3 reports ภายในช่วงเวลาสั้น เช่น 7 วัน หรือมาจากผู้รายงานต่างคน | เพิ่ม priority เป็น high-risk review และแจ้ง Dashboard / Work Queue | ยังเป็น `Active` หรือ `Suspended` ถ้าเข้า risk rule |
| >= 5 reports, duplicate scam pattern, impersonation, spam offer, หรือมี asset/chat evidence เสี่ยงสูง | ระบบสามารถแนะนำหรือทำ `Suspended` ชั่วคราวตาม policy เพื่อหยุดความเสียหายระหว่าง review | `Suspended` |
| Admin review แล้วพบว่าไม่ผิด / report ไม่สมเหตุสมผล | ปิด report เป็น cleared และคืนสิทธิ์ | `Active` |
| Admin review แล้วผิดจริงแต่ไม่รุนแรง | คง `Suspended` พร้อม duration / reason หรือ warning ตาม policy | `Suspended` |
| Admin review แล้วผิดจริงรุนแรง เช่น scam, impersonation, repeated abuse, phishing, bypass system | Admin ยืนยัน action พร้อม reason | `Banned` |

Rules:

- `Suspended` = ระงับชั่วคราวเพื่อรอ review หรือควบคุมความเสี่ยงระยะสั้น สามารถกลับเป็น `Active` ได้เมื่อ clear report แล้ว
- `Banned` = ระงับถาวรหลัง review แล้วผิดจริงหรือมีความเสี่ยงสูง ต้องใช้ Admin, reason และ audit เสมอ
- Auto-suspend ต้องมี guardrail เช่น unique reporter count, report reason severity, evidence type, time window และ previous violation history
- Auto-ban ไม่ควรทำใน Phase 1 เว้นแต่ Product/Policy อนุมัติ rule ชัดเจนมาก เช่น known fraud list หรือ security abuse

## 8.2 Deletion Status Policy

`Deletion Requested` ไม่ใช่สถานะลบสำเร็จ แต่เป็นช่วงที่ user กดขอลบบัญชีแล้วและระบบกำลังเข้าสู่ deletion workflow

Lifecycle ที่ควรใช้:

| Stage | Meaning | User List Visibility | Restore |
| --- | --- | --- | --- |
| `Deletion Requested` | ผู้ใช้กดขอลบบัญชีแล้ว request ถูกสร้าง | แสดงได้ใน User List เพื่อให้ทีมเห็นว่าอยู่ระหว่าง process | ยกเลิกได้เฉพาะตาม policy / support escalation |
| `Deactivated` | session ถูก revoke และ login ถูก block ระหว่าง grace period | ไม่ควรอยู่ใน default User List แต่ค้นเจอได้ตาม permission หรือผ่าน Account Deletion | กู้คืนได้ภายใน grace period ถ้า policy อนุญาต |
| `Deleted` / `Archived` | ครบ grace period หรือ Admin approve แล้ว public profile/assets ถูกซ่อนและ record ถูก archive | ไม่แสดงใน default User List; ดูย้อนหลังผ่าน Account Deletion / Reports / Audit | โดยปกติไม่ควรกู้คืนเป็นบัญชีใช้งานจริง |
| `Anonymized` | personal data ถูก mask/anonymize ตาม retention/privacy policy | ดูได้เฉพาะ record ที่จำเป็นต่อ audit/legal โดยข้อมูลส่วนตัวถูก mask | กู้คืนไม่ได้ |

Recommended UI rule:

- User List filter หลักควรแสดงบัญชีที่ใช้งานหรือยังต้องปฏิบัติการ ได้แก่ `Pending Verification`, `Active`, `Suspended`, `Banned`, `Deletion Requested`
- `Pending Verification` ใช้เฉพาะบัญชี Email/Password ที่กรอก signup แล้วระบบสร้าง record เพื่อรอ OTP / resend OTP ได้ แต่ยังไม่ถือเป็น authenticated member และยังไม่ควรถูกนับเป็น Active user
- Apple / Google sign-up ข้าม OTP ตาม FO Auth requirement ดังนั้น BO ไม่ควรแสดง Apple/Google เป็น `Unverified`
- บัญชีที่ลบสำเร็จแล้วควรใช้ label `Deleted` ใน report/detail สำหรับผู้ใช้ทั่วไปของ BO แต่ backend/audit สามารถแยก `Archived` และ `Anonymized` ได้
- ข้อมูลหลังลบต้องเก็บเท่าที่จำเป็นต่อ audit, legal, dispute, safety และ reporting โดยต้อง mask/anonymize personal fields ตาม policy
- หลัง `Anonymized` ไม่ควรกู้คืนบัญชีได้ เพราะข้อมูลส่วนตัวที่จำเป็นต่อการ restore ถูกลบหรือทำให้ไม่ระบุตัวตนแล้ว

# 9. Admin Actions

| Action | Admin access | Confirmation | Reason Required | FO Impact |
| --- | --- | --- | --- | --- |
| View User | Admin | No | No | No direct change |
| Reset Password | Admin | Yes | Optional | Sends reset flow for Email/Password account only |
| Suspend User | Admin | Yes | Yes | User login/action blocked |
| Unsuspend User | Admin | Yes | Yes | User access restored |
| Ban User | Admin | Yes | Yes | User login/action blocked until unban |
| Unban User | Admin | Yes | Yes | User access restored |
| Soft Delete / Archive User | Admin | Yes | Yes | User/profile/assets hidden or anonymized by policy |
| Export User Data | Admin | Yes for sensitive export | Optional/required by policy | No FO UI change |

Action availability ตามสถานะบัญชี:

| Current Status | Allowed Primary Actions | Blocked / Notes |
| --- | --- | --- |
| Pending Verification | View detail และดู verification context ที่มาจาก Auth module | Reset password ต้องยังไม่แสดงจนกว่าจะ verify สำเร็จ; suspend/ban ทำได้เฉพาะผ่าน policy กรณี abuse ชัดเจน |
| Active | Reset password สำหรับ Email/Password, suspend, ban, start deletion/archive workflow ตาม policy | Apple/Google reset password ต้อง block ด้วย rule-based message |
| Suspended | Unsuspend, ban, view report context, continue deletion/archive workflow ตาม policy | Reset password ไม่ควร restore access เอง ต้องแก้ status แยกต่างหาก |
| Banned | Unban, view audit/report context, continue deletion/archive workflow ตาม policy | Reset password ไม่ควรเปิดให้ใช้เป็นทางกลับเข้า FO |
| Deletion Requested | View detail, review dependency, open Account Deletion, resolve related report/dispute | ห้าม archive/delete ทันทีจาก User List ถ้ายังมี offer/chat/asset/report dependency |
| Deleted / Archived | View historical detail ตาม permission, audit/report lookup | ห้าม reset password, suspend, ban, unban หรือ restore เป็น active account โดยตรง |

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
| Ban user | User sign in ไม่ได้จนกว่า Admin unban |
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

Navigation clarification:

- `Reported Users` is an operational review queue under `User Management` because admins must inspect the reported profile, review reason, related assets/chats/comments, and decide whether to clear, suspend, or ban the user.
- `Reports & Analytics` should only contain aggregate reporting/export views such as report volume, user growth, moderation performance, and trend summaries. It should not replace the operational `Reported Users` queue.
- `Help / Support` and `Account Deletion` are separate main navigation modules because they have their own queues, detail workflows, permissions, audit requirements, and cross-module dependencies.

# 14. Empty / Error / Loading States

| State | Required Behavior |
| --- | --- |
| Loading | Skeleton สำหรับ table/card และ detail |
| Empty list | แสดงว่าไม่พบผู้ใช้ตาม filter และมี reset filter |
| User not found | แสดง data unavailable พร้อมกลับไป list |
| Access denied | แสดงว่า admin access ไม่มีสิทธิ์เข้า user management/action |
| Partial detail error | Section ที่ load fail ต้อง retry ได้ โดย detail หลักยังแสดงถ้าเป็นไปได้ |
| Export processing | สำหรับ export workflow แยก ต้องแสดง queued/in-progress และ download เมื่อสำเร็จ |

# 15. Audit Requirements

ต้อง audit-log:

- View/export sensitive user data เมื่อเข้าข่าย high-risk
- Reset password
- Suspend/ban/unsuspend/unban
- Soft delete/archive
- Status change
- Report review decision
- Permission denied on sensitive action
- Export user data ผ่าน permitted export workflow

Audit fields ใช้ตาม `00_GLOBAL_RULES_MODULE.md`

# 16. Performance Requirements

- User list ต้องใช้ server-side pagination/search/filter
- Search ควรตอบสนองเร็วพอสำหรับ operation workflow
- Detail page สามารถ lazy load sections หนัก เช่น login history/activity ได้
- Export ขนาดใหญ่ใน workflow แยกต้องใช้ background job

# 17. Acceptance Criteria

| ID | Criteria |
| --- | --- |
| AC-BO-USER-001 | User list รองรับ search/filter/sort/pagination |
| AC-BO-USER-002 | User detail แสดง account summary, auth method, profile, assets summary, reports, login history และ activity ตาม permission |
| AC-BO-USER-003 | Admin reset password ได้เฉพาะ Email/Password account |
| AC-BO-USER-004 | Apple/Google accounts reset password จาก BO ไม่ได้ |
| AC-BO-USER-005 | Admin suspend/ban/unsuspend/unban ได้พร้อม confirmation และ reason |
| AC-BO-USER-006 | Suspended/Banned user login FO ไม่ได้ |
| AC-BO-USER-007 | Report User ไม่ทำให้ profile/content หายทันทีจนกว่า Admin moderation action |
| AC-BO-USER-008 | Reported user queue/detail ต้องรองรับ SLA 24 ชั่วโมง |
| AC-BO-USER-009 | Sensitive user fields ต้อง mask สำหรับ admin access ที่ไม่มีสิทธิ์ |
| AC-BO-USER-010 | Export user data ต้องควบคุมด้วย permission และ audit-log และไม่ต้องมีปุ่ม export ใน User List ใน Phase 1 |
| AC-BO-USER-011 | User status mutation ทุกครั้งต้องมี audit log พร้อม before/after state |
| AC-BO-USER-012 | Module ใช้งานได้ที่ mobile, tablet, desktop และ wide desktop widths |
| AC-BO-USER-013 | Pending Verification account ต้องไม่แสดงเป็น Active และต้องไม่เปิด reset password action จนกว่า verify สำเร็จ |
| AC-BO-USER-014 | Deletion Requested account ต้อง route ไป Account Deletion/dependency review ก่อน archive/delete จริง |
| AC-BO-USER-015 | UI และ API ต้อง block action ที่ไม่อนุญาตตาม current account status |

# 18. Related Modules

- `00_GLOBAL_RULES_MODULE.md`
- `01_AUTHENTICATION_MODULE.md`
- `02_DASHBOARD_MODULE.md`
- `04_ASSET_MANAGEMENT_MODULE.md`
- `08_AUDIT_LOG_MODULE.md`
- `12_HELP_SUPPORT_MODULE.md`
- `13_ACCOUNT_DELETION_MODULE.md`
- `../ProjectAdmin/FO_BO_INTEGRATION_MAP.md`

# 19. Prototype Alignment Notes

Current BO prototype aligns User List with the finalized Dashboard visual system:

- Primary UI font remains IBM Plex Sans Thai; section/page headings use Bebas Neue where suitable.
- User List uses the same clean control-center layout: page header, compact summary cards, bordered panel, filter bar, dense table, standard modal, and standard button pattern.
- User List summary cards use English titles and number-only primary values, consistent with Dashboard KPI cards. Units and explanation should be placed in the helper text below the number.
- User Accounts uses the shared BO list-table pattern: rounded white panel, compact title/count header, right-aligned table utilities, pale table header row, and separated rows.
- Header remains clean and does not add search/notification/profile controls.
- User-facing account status labels are shown in Thai for consistency across filters, table badges, and detail modals, while backend/API values remain English enums such as `Active`, `Suspended`, `Banned`, and `Deletion Requested`.
- Account status actions must use explicit action labels such as `ระงับบัญชี` or `กู้คืนสิทธิ์` instead of generic `ตกลง`; destructive suspension requires a second confirmation modal before applying.

Current User List prototype data and interactions:

- Shows realistic mock FO users with display name/username, masked email, auth method, verification state, account status, joined date, last active, asset count, report count, and latest login/activity context. Internal User ID is not shown in the main list, but remains available in detail views and search for report/audit/support references.
- The main User List table does not show a separate `FO impact` column because account availability is already communicated by `Status`. FO impact remains in detail and account-action modals where Admin needs to understand the result before changing an account state.
- Email users who have not completed OTP are shown as `Pending Verification` / `รอยืนยันอีเมล`, not `Active`. They cannot use authenticated FO features and should not show password reset action until verification is completed.
- Uses a larger mock dataset so list behavior can be reviewed realistically across multiple pages.
- Supports search by name, masked email, auth, verification state, account status, and internal User ID/reference. User location and phone are not stored or shown as primary User List columns.
- Includes a newly registered FO user mock with no profile details, no assets, no offers, no reports, and no activity yet, so the empty/new-account state can be reviewed.
- Supports filters for account status, auth method, reported status, and sort mode using compact custom dropdowns so the option list matches the BO visual system.
- Joined-date sorting is newest first (`เรียงตามวันที่สมัครล่าสุด`) so recently registered accounts, including empty-profile new accounts, appear before older accounts when this sort is selected.
- User Detail opens a structured modal with a profile/contact card, account summary, auth/access context, profile/trust context, and recent activity. Contact rows render only when the user has provided that field.
- Reset password confirmation uses the same structured modal style as User Detail and clearly shows destination email, auth method, security note, and FO impact. Apple/Google accounts show a rule-based unsupported state instead of a send action.
- Account status modal uses the same structured modal style as reset password, shows status before action, intended action, current FO access, after-action impact, and audit note, then asks for an additional confirmation before suspending an active account. Confirmation copy must keep `Status before action` and label the result as `After confirmation` so Admin does not confuse current access with the result of the pending action.
- Final suspension confirmation should label the current state as `Status before action` and show a red warning note so Admin clearly understands the account is not suspended yet, but will be suspended after confirming.
- Pagination displays 10 users per page after search/filter/sort are applied. The footer shows the visible item range, total filtered rows, and page navigation.
- `รีเซ็ตค่าทั้งหมด` belongs in the list header as an icon utility because it only clears search/filter/sort state and returns the list to default values.
- `Reported Users` remains accessible from the left navigation instead of a duplicate button in User List, keeping the page focused on account browsing and direct account actions.
- Row actions keep `ดูรายละเอียด` visible in each row. Secondary account actions such as sending a password reset link for Email accounts or suspending/restoring an account are grouped in a compact row `...` dropdown menu with action icons to keep the table clean.
- Reset password action is allowed only for Email accounts; Apple/Google accounts show a rule-based blocked state.
- Account deletion is not handled from User List. Deletion-related work belongs in the Account Deletion module.
- User List does not show Export in the current prototype. If user data export is required later, it should be added through a permission-controlled Reports/export workflow.
- `Reported Users` remains an operational queue under User Management; aggregate report analytics remain under Reports.

Current Reported Users prototype data and interactions:

- Uses the same visual system as Dashboard and User List: module header, four summary cards, compact list utilities, filter bar, paginated table, standard modal, and standard button pattern.
- Reported Users is an operational queue for FO user/profile reports. It is not an analytics report page and should not duplicate Reports & Analytics.
- Suspended examples in the prototype must align with policy: use `>= 5 reports/reporters` or clear high-risk evidence before showing `Suspended`; `>= 3 reports` only raises review priority unless the risk rule is met.
- The mock report queue covers all account-status contexts used in Phase 1: `Active`, `Pending Verification`, `Suspended`, `Banned`, and `Deletion Requested`.
- The mock report queue covers the main report-handling outcomes: new/open report, in-review report, false report cleared with no account action, report resolved after action, active account with 1-2 reports, active account with 3 reports raised to priority review, suspended account with 5+ reports/reporters, banned account after confirmed severe abuse, and deletion-request account that must be reviewed before archive/anonymize.
- Summary cards show `Open Reports`, `In Review`, `Urgent Cases`, and `Due Soon` so Admin can prioritize the queue without reading every row.
- Table rows show report ID/category, reported user, reason, reporter count, priority, report status, and one clear `ดูรายละเอียด` action. Evidence, related data, waiting time, and detailed actions stay inside the modal to keep the list clean.
- Filters support search by report ID, user ID, display name, reason, category, status, and priority. Sorting supports oldest waiting first, urgent first, reporter count, and status.
- Detail modal shows report summary, current user account status, reported reference, FO reporter note, masked reporter identity/count, latest report timestamp, evidence/context, related data, recommendation, Admin action history, and a clear note that a report does not hide profile or restrict the account until Admin takes action.
- Every report detail must include the reported reference so Admin can trace the source: reference type, reference ID, source location, related module, and what needs to be checked. Examples include asset ID, profile ID, chat transcript ID, offer ID, deletion request ID, or signup/auth log ID.
- Deletion-related reported-user cases must still show the original FO report source, such as offer/chat dispute, asset report, or profile report. `Account Deletion` is a blocking/dependency context, not the report source by itself.
- If the reported user is already `Deletion Requested`, the report action must route Admin to the source reference first, then to `Account Deletion`. Admin must not close the report and immediately delete/archive the account until the related offer/chat/asset/profile dispute is reviewed and the dependency is cleared.
- Recommended review flow: open report detail -> click reported reference deep link -> jump directly to the related module/detail context -> inspect source evidence -> return to the report -> start review / clear report / manage account status according to policy.
- Queue actions supported in the prototype: open reported reference as a deep link to Asset Management, Offer / Chat, Account Deletion, or User detail; start review; close report as cleared; open the related user detail; and open account status management when account action is needed.
- Closing a report updates the mock status to `Cleared`, resets waiting time, shows a toast, and keeps the user account unchanged.
- Account status changes remain handled by the shared User account status modal so suspension/restore wording and confirmation rules stay consistent.
