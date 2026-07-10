# 16 BO Admin Settings Module

**Version:** `BO-16-v0.1`  
**Date:** 2026-07-06  
**Status:** Draft baseline  
**Platform:** Responsive Web Back Office  
**Primary BO Sources:** `00_GLOBAL_RULES_MODULE.md`, `01_AUTHENTICATION_MODULE.md`, `08_AUDIT_LOG_MODULE.md`, `15_REPORTS_ANALYTICS_MODULE.md`  
**Integration Map:** `../ProjectAdmin/FO_BO_INTEGRATION_MAP.md`

## 1. วัตถุประสงค์

Admin Settings Module ใช้สำหรับตั้งค่าและตรวจสอบ configuration ระดับ Back Office ได้แก่ admin account settings, Admin Access Matrix, security settings, system defaults, retention/export policy และ operational settings ที่มีผลต่อการทำงานของ BO

Module นี้ต้องไม่เป็นทางลัดเพื่อข้าม admin access control, audit, privacy หรือ FO sync rule ที่ระบุใน Global Rules และแต่ละ module

## 2. ขอบเขต

### 2.1 In Scope

- Admin profile และ own security settings
- Admin account management shortcut / settings view
- Admin Access Matrix
- Permission change request / review workflow baseline
- Security policy settings ที่แก้ได้ใน BO
- Session / Email OTP / lockout policy display
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

## 3. Admin Access & Permissions

BO uses exactly one admin account type: `Admin`. Admin Settings must not define or display sub-Admin access matrices. It controls account lifecycle, security policy, module/action policy, retention/export settings, feature flags, and integration metadata through policy-based access rules.

| Action | Admin access rule |
| --- | --- |
| View own profile/settings | Allowed for Admin. |
| Change own password | Allowed for Admin with audit where required. |
| Manage admin accounts | Requires high-risk action policy, confirmation, reason where applicable, and audit. |
| Change module/action policy | Requires confirmation, reason, before/after diff, and audit. |
| Change security/system/retention/export settings | Requires confirmation, reason, re-auth for high-risk security changes, and audit. |
| Export settings/audit summary | Requires export policy, scope control, and audit. |

The last active Admin account must be protected from suspension/archive or access downgrade unless another active Admin account can maintain BO access.
## 4. Responsive Layout

| Breakpoint | Layout |
| --- | --- |
| Mobile <= 767px | Settings sections เป็น stacked list, detail/editor เปิด full screen, Admin Access Matrix เป็น grouped cards |
| Tablet 768px - 1199px | Section list + detail แบบ single column หรือ split view ตามพื้นที่ |
| Desktop >= 1200px | Left settings navigation + detail panel + audit/context sidebar |
| Wide Desktop >= 1440px | รองรับ Admin Access Matrix table แบบ dense พร้อม sticky header/columns |

High-risk action ต้องใช้ confirmation modal ที่อ่านง่ายบน mobile และต้องไม่ใช้ hover-only action

## 5. Settings Sections

| Section | Purpose |
| --- | --- |
| My Account | ดู profile และเปลี่ยน password ของตัวเอง |
| Admin Accounts | Invite, update admin access policy, suspend, unlock, archive admin |
| Admin Permissions | Matrix สิทธิ์ตาม module/action policy |
| Security Policy | Email OTP requirement, session timeout, lockout, IP whitelist |
| System Defaults | Timezone, currency, language mode, pagination/export defaults |
| Retention Policy | Audit, chat/offer, report, export file, notification log retention |
| Export Policy | CSV/Excel, background job, file expiry, sensitive export controls |
| Feature Flags | เปิด/ปิด module/feature ตาม phase/decision |
| Integration Settings | Provider status/config metadata แบบ non-secret |
| Audit & Change History | Settings change history and permission change history |

## 6. My Account

Admin ทุก admin access ต้องเข้าถึง own settings ได้:

| Field / Action | Requirement |
| --- | --- |
| Full name | แสดงชื่อ admin |
| Email | Login identifier; เปลี่ยนไม่ได้จาก self-service ถ้า policy ไม่เปิด |
| Admin access | Read-only |
| Status | Read-only |
| Email OTP requirement | Required for BO Admin login |
| Last login | Read-only |
| Change password | ต้อง re-auth และ audit |
| Active sessions | View / revoke own session ถ้า implementation รองรับ |

Admin must pass mandatory Email OTP verification according to Auth baseline

## 7. Admin Accounts

Admin Accounts section ต้อง reuse contract จาก `01_AUTHENTICATION_MODULE.md`

### 7.1 Admin Account Status

| Status | Meaning |
| --- | --- |
| `Invited` | สร้าง account แล้ว แต่ยังไม่ได้ตั้ง password |
| `Active` | Login ได้ตาม admin access/Email OTP rule |
| `Locked` | ถูก lock จาก failed attempts หรือ security action |
| `Suspended` | ถูก disable โดย Admin |
| `Archived` | เอาออกจาก active use แต่ยังเก็บ audit history |

### 7.2 Admin Account Actions

| Action | Requirement |
| --- | --- |
| Invite Admin | Admin access required, email unique |
| Change Admin access | Admin access required, confirmation required |
| Suspend / Reactivate | Admin access required, reason required |
| Unlock Admin | Admin access required |
| Archive Admin | Admin access required, reason required |
| Export Admin List | Admin access required, audit required |

ต้องป้องกันการเปลี่ยนแปลง Admin คนสุดท้ายตาม rule ใน section 3

## 8. Admin Access Policy Catalog

The previous multi-Admin access policy catalog is replaced by a single Admin account type with module/action policy. The UI may show a policy catalog, but it must not show separate BO admin account types.

| Module | Admin access rule |
| --- | --- |
| Dashboard | Admin sees metrics and queues allowed by module/action policy. |
| User Management | Admin can manage users subject to sensitive-data, account-status, export, confirmation, reason, and audit rules. |
| Asset Management | Admin can review and change assets subject to FO-impact, sensitive-data, confirmation, reason, and audit rules. |
| Content / Board | Admin can create, edit, preview, publish, schedule, archive, and audit content actions. |
| Market Data / Directory | Admin can manage brand/model/reference/price/directory data with provider-source, inactive/restore, and audit controls. |
| Audit Log | Admin can view/export audit data according to audit visibility and sensitive-payload policy. |
| Offer / Chat / Social / Watch Alert | Admin can review and moderate by policy with privacy masking and audit. |
| Help / Support / Account Deletion | Admin can process support and deletion workflows with dependency checks, confirmation, reason, and audit. |
| Notifications / Reports | Admin can manage templates, broadcasts, reports, and exports according to approval/export/sensitive-data policy. |
| Admin Settings | Admin can manage BO settings through high-risk policy controls and audit. |

### 8.1 Permission Change Rules

- Permission changes are policy changes for the single Admin account type.
- Require confirmation, reason, before/after diff, and audit.
- Direct API/service enforcement is required for every changed policy.
- Changes affecting the current session must be reflected on the next request or token/session refresh.
## 9. Security Policy Settings

| Setting | Baseline | Editable In BO |
| --- | --- | --- |
| Admin login method | Email/password only | No |
| BO SSO | Not supported in V1 | No |
| Mandatory Email OTP policy | Admin | Required for every BO Admin login after password validation |
| OTP expiration | 5 minutes | Admin edit only if policy allows |
| OTP resend cooldown | 60 seconds | Admin edit only if policy allows |
| OTP attempt limit | 5 attempts | Admin edit only if policy allows |
| Idle timeout | 8 hours | Admin edit only if policy allows |
| Max session | 24 hours | Admin edit only if policy allows |
| Failed login limit | 5 attempts | Admin edit only if policy allows |
| Lockout duration | 15 minutes | Admin edit only if policy allows |
| IP whitelist | Production supported | Admin access required |
| Password policy | Minimum secure baseline per auth implementation | Admin view/edit if supported |

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
| Export scope | จำกัดตาม admin access และ report/module permission |

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
- Admin access changes
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
| Invite admin | Admin | Yes | Optional | Yes |
| Change Admin Access | Admin | Yes | Required | Yes |
| Suspend/reactivate admin | Admin | Yes | Required | Yes |
| Update Admin Access Matrix | Admin | Yes | Required | Yes |
| Update security policy | Admin | Yes + re-auth | Required | Yes |
| Update retention/export policy | Admin | Yes | Required | Yes |
| Update feature flag | Admin | Yes | Required | Yes |
| Export settings | Admin | Yes | Required if sensitive | Yes |

## 17. Audit Requirements

Audit log ต้องบันทึกอย่างน้อย:

- `ADMIN_SETTING_VIEW_SENSITIVE`
- `ADMIN_ACCOUNT_INVITE`
- `ADMIN_ACCOUNT_UPDATE`
- `ADMIN_ACCOUNT_SUSPEND`
- `ADMIN_ACCOUNT_REACTIVATE`
- `ADMIN_ACCOUNT_ARCHIVE`
- `ADMIN_ACCOUNT_UNLOCK`
- `ADMIN_EMAIL_OTP_POLICY_UPDATE`
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
| Empty admin list | แสดง empty state พร้อม invite action สำหรับ Admin |
| Save failed | แสดง error และไม่เปลี่ยนค่า optimistic ถ้า backend fail |
| Validation failed | แสดง field-level error |
| Last Admin protected | แสดงเหตุผลว่าทำ action ไม่ได้ |
| Audit write failed | Block high-risk settings change หรือเข้าคิว reliable retry ตาม risk policy |
| Feature flag impact warning | แสดง impacted modules ก่อน confirm |

## 19. Acceptance Criteria

| ID | Criteria |
| --- | --- |
| AC-BO-SET-001 | Admin ทุก admin access เข้าดู own profile/settings และเปลี่ยน password ตาม rule ได้ |
| AC-BO-SET-002 | Admin จัดการ admin account lifecycle ได้โดยไม่กระทบ Admin คนสุดท้าย |
| AC-BO-SET-003 | Admin Access Matrix แสดงสิทธิ์ตาม module/action และ enforce ทั้ง UI/API level |
| AC-BO-SET-004 | Permission/security/system/retention/export setting changes ต้องมี confirmation, reason และ audit |
| AC-BO-SET-005 | Security policy ต้องสอดคล้องกับ Auth baseline: email/password only, Email OTP mandatory สำหรับ Admin, idle 8h, max 24h, failed login 5 ครั้ง, lockout 15 นาที |
| AC-BO-SET-006 | Retention settings ต้องไม่อนุญาต manual delete audit logs จาก UI ปกติ |
| AC-BO-SET-007 | Export policy ต้องรองรับ background job, expiry, sensitive export audit และ policy-based scope |
| AC-BO-SET-008 | Feature flags ต้องแสดง FO/BO impact และ audit ทุกครั้ง |
| AC-BO-SET-009 | Integration settings ต้องไม่เปิดเผย secrets ใน BO UI |
| AC-BO-SET-010 | Admin Settings UI ต้อง responsive ที่ 375px, 768px, 1280px และ 1440px |

## 20. Open Decisions

| ID | Decision Needed | Impact |
| --- | --- | --- |
| SET-DEC-001 | Fine-grained permission editor จะเปิดใน V1 หรือใช้ fixed admin access matrix | กระทบ data model และ QA scope |
| SET-DEC-002 | Security policy fields ใดให้ Admin แก้ได้จริงใน production | กระทบ compliance และ operation |
| SET-DEC-003 | Retention period ราย entity เช่น chat, offer, support ticket, export file ต้องเก็บกี่วัน/ปี | กระทบ archive/export/report jobs |
| SET-DEC-004 | ต้องมี approval workflow สำหรับ high-risk setting change หรือไม่ | กระทบ admin operation และ audit |
