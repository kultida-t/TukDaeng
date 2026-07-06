# 16 BO Admin Settings Module

**Version:** `BO-16-v0.1`  
**Date:** 2026-07-06  
**Status:** Draft baseline  
**Platform:** Responsive Web Back Office  
**Primary BO Sources:** `00_GLOBAL_RULES_MODULE.md`, `01_AUTHENTICATION_MODULE.md`, `08_AUDIT_LOG_MODULE.md`, `15_REPORTS_ANALYTICS_MODULE.md`  
**Integration Map:** `../ProjectAdmin/FO_BO_INTEGRATION_MAP.md`

## 1. วัตถุประสงค์

Admin Settings Module ใช้สำหรับตั้งค่าและตรวจสอบ configuration ระดับ Back Office ได้แก่ admin account settings, role permission matrix, security settings, system defaults, retention/export policy และ operational settings ที่มีผลต่อการทำงานของ BO

Module นี้ต้องไม่เป็นทางลัดเพื่อข้าม RBAC, audit, privacy หรือ FO sync rule ที่ระบุใน Global Rules และแต่ละ module

## 2. ขอบเขต

### 2.1 In Scope

- Admin profile และ own security settings
- Admin account management shortcut / settings view
- Role permission matrix
- Permission change request / review workflow baseline
- Security policy settings ที่แก้ได้ใน BO
- Session / 2FA / lockout policy display
- IP whitelist configuration สำหรับ production
- Export policy settings
- Retention policy display/config baseline
- System setting list and detail
- Feature flags / module availability settings ตาม permission
- Audit log สำหรับทุก settings change
- Responsive layout สำหรับ desktop, tablet และ mobile

### 2.2 Out of Scope

- FO user settings
- FO notification preference center
- External identity provider integration
- Hardware security key support
- Legal/compliance policy drafting
- Direct database maintenance tools
- Secret management UI สำหรับ production credentials
- Manual audit log deletion

## 3. Roles & Permissions

| Action | Super Admin | Support Admin | Moderator | Content Admin | Market Admin |
| --- | --- | --- | --- | --- | --- |
| View own profile/settings | Yes | Yes | Yes | Yes | Yes |
| Change own password | Yes | Yes | Yes | Yes | Yes |
| Enable own 2FA | Yes | Yes | Yes | Yes | Yes |
| View admin account list | Yes | No | No | No | No |
| Invite/update/suspend admin | Yes | No | No | No | No |
| Reset admin 2FA | Yes | No | No | No | No |
| View role permission matrix | Yes | Read-only own role summary | Read-only own role summary | Read-only own role summary | Read-only own role summary |
| Change role permissions | Super Admin only, high-risk | No | No | No | No |
| Change security/system settings | Super Admin only | No | No | No | No |
| View export/retention settings | Yes | Read-only scoped | Read-only scoped | Read-only scoped | Read-only scoped |
| Export settings/audit summary | Yes | No | No | No | No |

Super Admin คนสุดท้ายที่ active อยู่ต้องไม่สามารถถูก suspend, archive, role downgrade หรือ disable 2FA requirement ได้ถ้าไม่มี Super Admin active คนอื่นรองรับ

## 4. Responsive Layout

| Breakpoint | Layout |
| --- | --- |
| Mobile <= 767px | Settings sections เป็น stacked list, detail/editor เปิด full screen, permission matrix เป็น grouped cards |
| Tablet 768px - 1199px | Section list + detail แบบ single column หรือ split view ตามพื้นที่ |
| Desktop >= 1200px | Left settings navigation + detail panel + audit/context sidebar |
| Wide Desktop >= 1440px | รองรับ permission matrix table แบบ dense พร้อม sticky header/columns |

High-risk action ต้องใช้ confirmation modal ที่อ่านง่ายบน mobile และต้องไม่ใช้ hover-only action

## 5. Settings Sections

| Section | Purpose |
| --- | --- |
| My Account | ดู profile, เปลี่ยน password, เปิด/ตั้งค่า 2FA ของตัวเอง |
| Admin Accounts | Invite, update role, suspend, unlock, reset 2FA, archive admin |
| Role Permissions | Matrix สิทธิ์ตาม role/module/action |
| Security Policy | 2FA requirement, session timeout, lockout, IP whitelist |
| System Defaults | Timezone, currency, language mode, pagination/export defaults |
| Retention Policy | Audit, chat/offer, report, export file, notification log retention |
| Export Policy | CSV/Excel, background job, file expiry, sensitive export controls |
| Feature Flags | เปิด/ปิด module/feature ตาม phase/decision |
| Integration Settings | Provider status/config metadata แบบ non-secret |
| Audit & Change History | Settings change history and permission change history |

## 6. My Account

Admin ทุก role ต้องเข้าถึง own settings ได้:

| Field / Action | Requirement |
| --- | --- |
| Full name | แสดงชื่อ admin |
| Email | Login identifier; เปลี่ยนไม่ได้จาก self-service ถ้า policy ไม่เปิด |
| Role | Read-only |
| Status | Read-only |
| 2FA status | Not Enabled, Setup Required, Enabled, Reset Required |
| Last login | Read-only |
| Change password | ต้อง re-auth และ audit |
| Enable / reset own 2FA | ตาม Auth module rule |
| Active sessions | View / revoke own session ถ้า implementation รองรับ |

Super Admin และ Content Admin ต้องใช้ 2FA ตาม Auth baseline ส่วน role อื่นแนะนำให้ใช้ 2FA และสามารถเปิดเองได้

## 7. Admin Accounts

Admin Accounts section ต้อง reuse contract จาก `01_AUTHENTICATION_MODULE.md`

### 7.1 Admin Account Status

| Status | Meaning |
| --- | --- |
| `Invited` | สร้าง account แล้ว แต่ยังไม่ได้ตั้ง password |
| `Active` | Login ได้ตาม role/2FA rule |
| `Locked` | ถูก lock จาก failed attempts หรือ security action |
| `Suspended` | ถูก disable โดย Super Admin |
| `Archived` | เอาออกจาก active use แต่ยังเก็บ audit history |

### 7.2 Admin Account Actions

| Action | Requirement |
| --- | --- |
| Invite Admin | Super Admin only, email unique |
| Change Role | Super Admin only, confirmation required |
| Suspend / Reactivate | Super Admin only, reason required |
| Unlock Admin | Super Admin only |
| Reset 2FA | Super Admin only, reason required |
| Archive Admin | Super Admin only, reason required |
| Export Admin List | Super Admin only, audit required |

ต้องป้องกันการเปลี่ยนแปลง Super Admin คนสุดท้ายตาม rule ใน section 3

## 8. Role Permission Matrix

Role permission matrix ต้องแสดงสิทธิ์อย่างน้อยตาม module:

| Module | Super Admin | Content Admin | Moderator | Support Admin | Market Admin |
| --- | --- | --- | --- | --- | --- |
| Dashboard | Full | Scoped | Scoped | Scoped | Scoped |
| User Management | Full | No | Limited reported-user context | Support view/reset password | No |
| Asset Management | Full | No | Moderate/review | Ticket-related view | Market aggregate/context |
| Content / Board | Full | Full | Reported content view | No | No |
| Market Data | Full | No | No | No | Full |
| Directory | Full | No | No | No | Full |
| Audit Log | Full | No | No | No | No |
| Offer / Chat | Full | No | Reported/moderation view | Ticket/dispute view | No |
| Social Interaction | Full | No | Moderate | Ticket-related view | Aggregate view |
| Watch Alert | Full | No | View | User alert support view | Aggregate/full market view |
| Help / Support | Full | No | Reported cases only | Full | No |
| Account Deletion | Full | No | No | View/recheck | No |
| Notifications | Full | Content broadcast draft if approved | Scoped logs | Ticket-related logs | Watch alert/market logs |
| Reports & Analytics | Full | Content reports | Moderation reports | Support reports | Market reports |
| Admin Settings | Full | Own settings only | Own settings only | Own settings only | Own settings only |

### 8.1 Permission Change Rules

- Permission change ต้องเป็น Super Admin only
- ต้องมี confirmation และ reason
- ต้องแสดง before/after diff
- ต้อง audit-log
- ถ้าเปลี่ยน role ของ admin ที่กำลัง login อยู่ permission check ต้องสะท้อน role ล่าสุดใน request ถัดไปหรือ token refresh ถัดไป
- ไม่ควรเปิด fine-grained permission editor เกิน baseline role model ใน V1 เว้นแต่ Product ตัดสินใจเพิ่ม scope

## 9. Security Policy Settings

| Setting | Baseline | Editable In BO |
| --- | --- | --- |
| Admin login method | Email/password only | No |
| BO SSO | Not supported in V1 | No |
| Mandatory 2FA roles | Super Admin, Content Admin | Super Admin can view; edit requires policy decision |
| Optional 2FA roles | Moderator, Support Admin, Market Admin | View / encourage |
| Idle timeout | 8 hours | Super Admin edit only if policy allows |
| Max session | 24 hours | Super Admin edit only if policy allows |
| Failed login limit | 5 attempts | Super Admin edit only if policy allows |
| Lockout duration | 15 minutes | Super Admin edit only if policy allows |
| IP whitelist | Production supported | Super Admin only |
| Password policy | Minimum secure baseline per auth implementation | Super Admin view/edit if supported |

Security policy change ต้อง audit และควร require re-authentication

## 10. System Defaults

| Setting | Baseline |
| --- | --- |
| Timezone | `Asia/Bangkok` |
| Currency | THB |
| BO Language | Thai primary; English technical terms allowed |
| Default date range | Today for operational queues, 7 days for trend metrics |
| Table pagination | Server-side pagination for large lists |
| Large export | Background job |
| Sensitive data display | Mask by default |

System defaults ที่กระทบทุก module ต้องแสดง impacted modules ก่อนบันทึก

## 11. Retention Policy Settings

Retention settings ต้องแสดงเป็น policy/config โดยไม่ให้ admin ลบข้อมูลสำคัญแบบ manual

| Data | Baseline / Rule |
| --- | --- |
| Audit log | เก็บอย่างน้อย 1 ปี |
| Security/permission/export events | ควรเก็บนานกว่า 1 ปีถ้า policy อนุญาต |
| Chat / offer records | Open decision ตาม legal/compliance |
| Support tickets | ต้องกำหนด retention ตาม policy |
| Account deletion archive | ใช้ 30-day grace period ก่อน hard delete/anonymization ตาม FO baseline เว้นแต่ legal เปลี่ยน |
| Export files | ต้องมี expiry |
| Notification delivery logs | ต้องกำหนด retention ตาม report/provider policy |

Retention cleanup ต้องเป็น system job ที่ audit ตัวเอง ห้าม admin ลบ audit record จาก UI ปกติ

## 12. Export Policy Settings

| Setting | Requirement |
| --- | --- |
| Allowed formats | CSV, Excel |
| Large export threshold | ใช้ background job |
| Sensitive export | ต้องมี permission, confirmation, reason และ audit |
| Export expiry | ต้องกำหนดจำนวนวันตาม policy |
| Export download | ต้อง audit download event |
| Export scope | จำกัดตาม role และ report/module permission |

Export policy ต้อง sync กับ `15_REPORTS_ANALYTICS_MODULE.md` และ `08_AUDIT_LOG_MODULE.md`

## 13. Feature Flags / Module Availability

Feature flag ใช้เพื่อควบคุม phase/decision เท่านั้น ไม่ใช่เพื่อ bypass business rule

| Feature / Module | Rule |
| --- | --- |
| Directory FO route | ถ้า FO ยังเป็น placeholder ต้องไม่เปิด production route โดยไม่มี Product decision |
| Broadcast in FO Notification Center | ต้องรอ master decision ก่อนเพิ่ม generic Broadcast type |
| FO Support ticket history | ต้องรอ Product decision; contact-only mode ยังรองรับใน BO |
| Market Update notification | Future; ไม่ส่ง FO V1 จนกว่า master เพิ่ม scope |
| Scheduled reports | Future unless Product opens scope |
| Fine-grained permission editor | Future unless Product opens scope |

Feature flag change ต้อง audit และต้องแสดง FO/BO impact ก่อนบันทึก

## 14. Integration Settings

Integration settings ต้องแสดง metadata และสถานะ ไม่เก็บหรือเปิดเผย secret ใน BO UI ปกติ

| Integration | Editable / Visible |
| --- | --- |
| The Watch API | Provider name, sync status, last synced, rate/error status, config metadata |
| Notification provider | Delivery provider status, callback health, non-secret config |
| Export jobs | Queue status, retry policy metadata |
| Import jobs | Dry-run rules, duplicate detection status |
| Map provider | Availability/status only if Directory uses map |

Secret เช่น API key, provider token, database credentials ต้องอยู่ใน secure secret manager ไม่ใช่ Admin Settings UI

## 15. Audit & Change History

Admin Settings ต้องมี change history สำหรับ:

- Admin account changes
- Role changes
- Permission changes
- Security policy changes
- System default changes
- Retention/export policy changes
- Feature flag changes
- Integration setting changes

Change history ต้อง link ไป Audit Log detail ตาม permission

## 16. Admin Actions

| Action | Permission | Confirmation | Reason | Audit |
| --- | --- | --- | --- | --- |
| Change own password | All admins | Yes | No | Yes |
| Enable own 2FA | All admins | Yes | No | Yes |
| Invite admin | Super Admin | Yes | Optional | Yes |
| Change admin role | Super Admin | Yes | Required | Yes |
| Suspend/reactivate admin | Super Admin | Yes | Required | Yes |
| Reset admin 2FA | Super Admin | Yes | Required | Yes |
| Update permission matrix | Super Admin | Yes | Required | Yes |
| Update security policy | Super Admin | Yes + re-auth | Required | Yes |
| Update retention/export policy | Super Admin | Yes | Required | Yes |
| Update feature flag | Super Admin | Yes | Required | Yes |
| Export settings | Super Admin | Yes | Required if sensitive | Yes |

## 17. Audit Requirements

Audit log ต้องบันทึกอย่างน้อย:

- `ADMIN_SETTING_VIEW_SENSITIVE`
- `ADMIN_ACCOUNT_INVITE`
- `ADMIN_ACCOUNT_UPDATE`
- `ADMIN_ACCOUNT_SUSPEND`
- `ADMIN_ACCOUNT_REACTIVATE`
- `ADMIN_ACCOUNT_ARCHIVE`
- `ADMIN_ACCOUNT_UNLOCK`
- `ADMIN_2FA_RESET`
- `ROLE_PERMISSION_UPDATE`
- `SECURITY_POLICY_UPDATE`
- `SYSTEM_SETTING_UPDATE`
- `RETENTION_POLICY_UPDATE`
- `EXPORT_POLICY_UPDATE`
- `FEATURE_FLAG_UPDATE`
- `INTEGRATION_SETTING_UPDATE`
- `ADMIN_SETTINGS_EXPORT`

Audit payload ต้องมี:

- `setting_key` หรือ `target_admin_id`
- `admin_id`
- `actor_role`
- `old_value`
- `new_value`
- `reason`
- `impact_summary`
- `ip_address`
- `user_agent`
- `created_at`

Sensitive settings value ต้อง mask ใน audit payload ถ้าเป็น secret หรือ high-risk data

## 18. Error / Empty / Loading States

| State | Requirement |
| --- | --- |
| Permission denied | ไม่แสดง setting/action ที่ไม่มีสิทธิ์ และ direct URL ต้อง block |
| Loading | Skeleton สำหรับ section/detail/matrix |
| Empty admin list | แสดง empty state พร้อม invite action สำหรับ Super Admin |
| Save failed | แสดง error และไม่เปลี่ยนค่า optimistic ถ้า backend fail |
| Validation failed | แสดง field-level error |
| Last Super Admin protected | แสดงเหตุผลว่าทำ action ไม่ได้ |
| Audit write failed | Block high-risk settings change หรือเข้าคิว reliable retry ตาม risk policy |
| Feature flag impact warning | แสดง impacted modules ก่อน confirm |

## 19. Acceptance Criteria

| ID | Criteria |
| --- | --- |
| AC-BO-SET-001 | Admin ทุก role เข้าดู own profile/settings และเปลี่ยน password/ตั้งค่า 2FA ตาม rule ได้ |
| AC-BO-SET-002 | Super Admin จัดการ admin account lifecycle ได้โดยไม่กระทบ Super Admin คนสุดท้าย |
| AC-BO-SET-003 | Role permission matrix แสดงสิทธิ์ตาม module/role และ enforce ทั้ง UI/API level |
| AC-BO-SET-004 | Permission/security/system/retention/export setting changes ต้องมี confirmation, reason และ audit |
| AC-BO-SET-005 | Security policy ต้องสอดคล้องกับ Auth baseline: email/password only, 2FA mandatory สำหรับ Super Admin/Content Admin, idle 8h, max 24h, failed login 5 ครั้ง, lockout 15 นาที |
| AC-BO-SET-006 | Retention settings ต้องไม่อนุญาต manual delete audit logs จาก UI ปกติ |
| AC-BO-SET-007 | Export policy ต้องรองรับ background job, expiry, sensitive export audit และ role-based scope |
| AC-BO-SET-008 | Feature flags ต้องแสดง FO/BO impact และ audit ทุกครั้ง |
| AC-BO-SET-009 | Integration settings ต้องไม่เปิดเผย secrets ใน BO UI |
| AC-BO-SET-010 | Admin Settings UI ต้อง responsive ที่ 375px, 768px, 1280px และ 1440px |

## 20. Open Decisions

| ID | Decision Needed | Impact |
| --- | --- | --- |
| SET-DEC-001 | Fine-grained permission editor จะเปิดใน V1 หรือใช้ fixed role matrix | กระทบ data model และ QA scope |
| SET-DEC-002 | Security policy fields ใดให้ Super Admin แก้ได้จริงใน production | กระทบ compliance และ operation |
| SET-DEC-003 | Retention period ราย entity เช่น chat, offer, support ticket, export file ต้องเก็บกี่วัน/ปี | กระทบ archive/export/report jobs |
| SET-DEC-004 | ต้องมี approval workflow สำหรับ high-risk setting change หรือไม่ | กระทบ admin operation และ audit |
