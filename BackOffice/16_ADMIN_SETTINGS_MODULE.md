# 16 BO Admin Settings Module

**Version:** `BO-16-v1.2`
**Date:** 2026-09-20
**Status:** Updated — Admin invitation lifecycle/security contract defined
**Platform:** Responsive Web Back Office
**Primary BO Sources:** `00_GLOBAL_RULES_MODULE.md`, `01_AUTHENTICATION_MODULE.md`, `08_AUDIT_LOG_MODULE.md`, `15_REPORTS_ANALYTICS_MODULE.md`

## UI Standards And Prototype Reference

เอกสารนี้ต้องใช้ร่วมกับ `00_GLOBAL_RULES_MODULE.md` และยึดรูปแบบหน้าจอ/พฤติกรรมที่ยืนยันแล้วใน `../Prototypes/bo-prototype.html` เป็นมาตรฐานหลัก

ห้ามออกแบบ pattern แยกเองสำหรับ list toolbar, breakpoint, table/card layout, pagination, reset, drill-down, drawer, modal หรือ detail layout ยกเว้นเอกสารนี้ระบุไว้ชัดเจนว่าเป็น override ที่อนุมัติแล้ว

## 1. Document Information

| Field | Detail |
| --- | --- |
| Module Name | BO Admin Settings |
| Platform | Responsive Web Back Office |
| Version | `BO-16-v1.2` |
| Status | Updated — Admin invitation lifecycle/security contract defined |
| Owner | Product / UX / Engineering / Operations |
| Document Type | Functional PRD |

## 2. Objective

Admin Settings Module ใช้สำหรับตั้งค่าและตรวจสอบ configuration ระดับ Back Office ได้แก่ admin account settings, Roles & Permissions matrix, security settings, system defaults, retention/export policy และ operational settings ที่มีผลต่อการทำงานของ BO

Module นี้ต้องไม่เป็นทางลัดเพื่อข้าม admin access control, audit, privacy หรือ FO sync rule ที่ระบุใน Global Rules และแต่ละ module

## 3. Scope

### In Scope

- Admin profile และ own security settings
- Admin account management shortcut / settings view
- Admin invitation lifecycle: create, resend, cancel, reissue, delivery trace และ activation handoff
- Roles & Permissions matrix
- Permission change request / review workflow baseline
- Security policy settings ที่แก้ได้ใน BO
- Session / Email OTP / lockout policy display
- IP whitelist configuration สำหรับ production
- Export policy settings
- Retention policy display/config baseline
- System setting list and detail
- Feature flags / module availability settings ตาม permission
- Audit log สำหรับทุก settings change
- Delivery Logs — อ่าน delivery log ของ notification/email lifecycle, retry failed delivery และ export delivery log (Phase 1, ย้ายจาก Notifications module)
- Responsive layout สำหรับ desktop, tablet และ mobile

### Out Of Scope

- FO user settings
- FO notification preference center
- External identity provider integration
- Hardware security key support
- Legal/compliance policy drafting
- Direct database maintenance tools
- Secret management UI สำหรับ production credentials
- Manual audit log deletion

## 4. Admin Access And Permissions

BO uses exactly one admin account type: `Admin`. Admin Settings may define role templates and a Roles & Permissions matrix, but it must not define separate BO admin account types. It controls account lifecycle, security policy, module/action policy, retention/export settings, feature flags, and integration metadata through policy-based access rules.

| Action | Admin access rule |
| --- | --- |
| View own profile/settings | Allowed for Admin. |
| Change own password | Allowed for Admin with audit where required. |
| Manage admin accounts | Requires high-risk action policy, confirmation, reason where applicable, and audit. |
| Change module/action policy | Requires confirmation, reason, before/after diff, and audit. |
| Change security/system/retention/export settings | Requires confirmation, reason, re-auth for high-risk security changes, and audit. |
| Export settings/audit summary | Requires export policy, scope control, and audit. |

The last active Admin account must be protected from suspension/archive or access downgrade unless another active Admin account can maintain BO access.

## 5. Responsive Layout

| Breakpoint | Layout |
| --- | --- |
| Mobile <= 767px | Settings sections เป็น stacked list, detail/editor เปิด full screen, Roles & Permissions matrix เป็น grouped cards |
| Tablet 768px - 1199px | Section list + detail แบบ single column หรือ split view ตามพื้นที่ |
| Desktop >= 1200px | Left settings navigation + detail panel + audit/context sidebar |
| Wide Desktop >= 1440px | รองรับ Roles & Permissions matrix table แบบ dense พร้อม sticky header/columns |

High-risk action ต้องใช้ confirmation modal ที่อ่านง่ายบน mobile และต้องไม่ใช้ hover-only action

## 6. Settings Sections

Settings submenu ใน prototype (`../Prototypes/bo-prototype.html`, `navGroups` entry `id: "settings"`) มี 6 รายการสอดคล้องกับ Phase 1 scope ส่วน section อื่นในเอกสารนี้ยังคงเป็น policy/contract baseline แต่ยังไม่ implement ใน prototype และทำเครื่องหมาย future/deferred ไว้ใน 6.2

### 6.1 Sections ใน Settings nav (Phase 1 — implement ใน prototype)

| Nav label | Section / cross-ref | Purpose |
| --- | --- | --- |
| Admin Accounts | Section 8 (เอกสารนี้) | Invite, update role, suspend, unlock, archive admin account |
| Roles & Permissions | Section 9 (เอกสารนี้) | Role templates และ matrix สิทธิ์ตาม module/action policy |
| Policy & Versioning | `12_HELP_SUPPORT_MODULE.md` (Policy & Versioning) | จัดการ policy document TH/EN, draft/publish, version history |
| Support Center | `12_HELP_SUPPORT_MODULE.md` (Support Center) | ตั้งค่าช่องทาง support, business hours, availability |
| Delivery Logs | Section 16 (เอกสารนี้) | อ่าน delivery log ของ notification/email lifecycle, retry failed delivery และ export (Phase 1) |
| Audit Log | `08_AUDIT_LOG_MODULE.md` (module: `audit`) | ดู/export audit log ทั้งระบบตาม permission |

### 6.2 Future / deferred sections (policy baseline — ยังไม่ implement ใน prototype)

Section เหล่านี้ยังคงเป็น policy/contract baseline ในเอกสารนี้ แต่ยังไม่มีใน Settings nav ของ Phase 1 (อ้างอิง commit `20d705d` 2026-09-15 ที่ปรับ Settings submenu ตาม ADM-PTO-001) จะเปิดเมื่อ Product เปิด scope ตาม Open Decisions (section 22)

| Section | สถานะ | Purpose | เงื่อนไขการเปิด |
| --- | --- | --- | --- |
| My Account (Section 7) | Future | ดู profile และเปลี่ยน password ของตัวเอง | ยังไม่อยู่ใน Phase 1 nav |
| Security Policy (Section 10) | Deferred | Email OTP requirement, session timeout, lockout, IP whitelist | เอาออกจาก nav ตาม commit `20d705d`; รอ SET-DEC-002 |
| System Defaults (Section 11) | Future | Timezone, currency, language mode, pagination/export defaults | ยังไม่อยู่ใน Phase 1 nav |
| Retention Policy (Section 12) | Deferred | Audit, chat/offer, report, export file, notification log retention | เอาออกจาก nav ตาม commit `20d705d`; รอ SET-DEC-003 |
| Export Policy (Section 13) | Future | CSV/Excel, background job, file expiry, sensitive export controls | ยังไม่อยู่ใน Phase 1 nav |
| Feature Flags (Section 14) | Future | เปิด/ปิด module/feature ตาม phase/decision | ยังไม่อยู่ใน Phase 1 nav |
| Integration Settings (Section 15) | Future | Provider status/config metadata แบบ non-secret | ยังไม่อยู่ใน Phase 1 nav |
| Audit & Change History (Section 17) | Future | Settings change history and permission change history (แยกจาก Audit Log nav entry ซึ่งเป็น standalone module ใน `08_AUDIT_LOG_MODULE.md`) | ยังไม่อยู่ใน Phase 1 nav |

## 7. My Account

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

## 8. Admin Accounts

Admin Accounts section ต้อง reuse contract จาก `01_AUTHENTICATION_MODULE.md` และสอดคล้องกับ prototype ADM-PTO-001 (`../Prototypes/bo-prototype.html`: `adminAccountData`, `roleMenuAccess`, `renderAdminAccounts`, `renderAdminAccountDetail` และ `openAdminAccount*Modal`) ที่ lock แล้ว 2026-09-15

Mock data reference: `adminAccountData.accounts` 10 records (ADM-001..ADM-010) ครอบคลุมสถานะ Invited/Active/Locked/Suspended/Archived + master account (ADM-010)

### 8.1 Admin Account Status

| Status | Meaning |
| --- | --- |
| `Invited` | สร้าง account แล้ว แต่ยังไม่ได้ตั้ง password (รอผู้รับยืนยันอีเมลและตั้ง password) |
| `Active` | Login ได้ตาม admin access/Email OTP rule |
| `Locked` | ถูก lock จาก failed attempts หรือ security action (รอ unlock หรือครบ lockout 15 นาที) |
| `Suspended` | ถูก disable โดย Admin (เข้าสู่ระบบไม่ได้ทันที, session ถูกยกเลิก) |
| `Archived` | เอาออกจาก active use แต่ยังเก็บ audit history ตาม retention |

### 8.2 Admin Account List

Pattern: full-width panel เหมือน Audit Log / Deletion Requests — ไม่มี KPI cards (จำนวนซ้ำซ้อนกับตารางและ filter)

**ตาราง 7 คอลัมน์** (`renderAdminAccountRows`):

| คอลัมน์ | รายละเอียด |
| --- | --- |
| Admin ID | รหัส admin (เช่น `ADM-001`) |
| Name | ชื่อ-นามสกุล (แสดง Master badge ถ้าเป็น master admin) |
| Email | อีเมล admin |
| Role | Role pill จาก 8 standard role templates ใน section 9.1 |
| Status | Status pill (Invited / Active / Locked / Suspended / Archived) |
| Last Login | เวลา login ล่าสุด (แสดง `—` ถ้ายังไม่เคย login) |
| Action | Row menu (ดูรายละเอียด + action ตามสถานะที่อนุญาต) |

**Master badge** แยกจาก status/role pill — แสดงที่ Name cell (desktop) และที่ tags (mobile) สำหรับ master admin หลัก (ADM-010) เท่านั้น

**Filter bar** (`renderAdminAccounts`):
- เปิด/ปิดตัวกรอง toggle
- Search: Admin ID, ชื่อ, อีเมล, Role
- Filter account status: Invited / Active / Locked / Suspended / Archived
- Filter role: 8 standard role templates ตาม section 9.1
- Sort: latest (default) / oldest / name / status
- รีเซ็ตค่าทั้งหมด (reset icon button)

**Sort behavior** (`renderAdminAccountRows`): master admin หลักแสดงบนสุดเสมอ ไม่ว่าจะเรียงด้วยอะไร

**Pagination**: 10/page (ตาม `adminAccountListPageSize`) + footer range + pager

**Row menu** (`renderAdminAccountRows`): ดูรายละเอียด (ทุกแถว) + action ตาม permission gating (section 8.7) — action ที่ไม่อนุญาตไม่แสดงใน DOM

**Mobile card** (`renderAdminAccountRows`): แสดง tags (status pill + role pill + Master badge ถ้ามี) + meta (Name / Email / Last Login) ไม่มีกรอบปุ่ม ... แยกต่างหาก

**Empty state** (`renderAdminAccountRows`): "ไม่พบ admin account" + "ลองปรับคำค้นหรือตัวกรอง แล้วลองใหม่"

**Add admin entry**: ปุ่ม "Add admin" ที่ `#page-actions` ใน `renderAdminAccounts` เปิด Invite Admin modal (section 8.6)

**Filter state persistence**: เก็บสถานะ filter เมื่อ detail→back แต่ถูกล้างเมื่อสลับ module (ตาม `restoreListFilterState("admin-account-list")`)

### 8.3 Admin Account Detail

Pattern: full-width detail ตาม Deletion Request Detail (`renderAdminAccountDetail`) — body class `admin-account-detail-mode` (ไม่ใช้ `user-detail-mode` เพื่อไม่กระทบ protected screens)

**Detail head** (`renderAdminAccountDetail`):
- `ADM-xxx : fullName` (heading)
- Status pill + Role pill + Master badge (ถ้าเป็น master) ใน chips

**Section 1: Account Summary** (`renderAdminAccountDetail`) — 3 tiles:
- Email
- Created At
- Last Login

**Section 1.5: Role & Permissions** (`renderAdminAccountDetail`) — matrix 3 คอลัมน์:
- เมนู / Module
- สิทธิ์ (pill: green=จัดการ, amber=จัดการบางส่วน, blue=ดูอย่างเดียว)
- หมายเหตุ

แสดงเฉพาะเมนูที่ `level !== "none"` (เมนูที่ role นี้ไม่เห็นไม่แสดง) อ้างอิง `roleMenuAccess`

**Section 2: History & Actions** (`renderAdminAccountDetail`) — ตาราง 5 คอลัมน์:
- วันที่ / เวลา
- Action
- Reference (ใครเป็นคนทำ action นี้กับ account — ADM-xxx หรือ System)
- Audit (รหัส audit event, คลิกเปิด Audit Log กรองด้วย reference — ไม่มีแสดง `—`)
- รายละเอียด

แสดงเฉพาะ lifecycle ของ account ตัวเอง (เรียงล่าสุดก่อน): Status change (Suspend/Reactivate/Unlock/Lock/Archive/Role change) → Activated → Invited/Created — ไม่รวมงานที่ admin ไปทำใน module อื่น (มี history แยกใน module ของมัน) ตาม `adminAccountData.accounts[].history`

**Action buttons** (`renderAdminAccountDetail`): แสดงตาม permission gating (section 8.7) ที่ส่วนล่างของ History & Actions section — action ที่ไม่อนุญาตไม่แสดงใน DOM

**Back button**: ปุ่ม "กลับไป Admin Accounts" ที่ `#page-actions` ใน `renderAdminAccountDetail`

### 8.4 Action Modals (Suspend / Reactivate / Unlock / Archive)

Pattern: `renderAdminAccountActionModal` คล้าย `renderDeletionActionModal`

**Modal structure**:
- Head: title + summary + close button
- Target: fullName + id · email + status pill
- Form: reason selector (required) + note (ไม่บังคับ) + impact note + ปุ่มยืนยัน/ยกเลิก
- Result state: success message + timestamp (หลังยืนยัน)

**Action config** (`adminAccountActionConfig`):

| Action | Title | Tone | Audit type | Impact note |
| --- | --- | --- | --- | --- |
| suspend | Suspend Admin | danger | `ADMIN_ACCOUNT_SUSPEND` | เข้าสู่ระบบไม่ได้ทันที และ session ถูกยกเลิก |
| reactivate | Reactivate Admin | primary | `ADMIN_ACCOUNT_REACTIVATE` | กลับเข้าสู่ระบบได้ตามปกติ |
| unlock | Unlock Admin | primary | `ADMIN_ACCOUNT_UNLOCK` | กลับเข้าสู่ระบบได้ทันที ไม่ต้องรอ lockout หมดอายุ |
| archive | Archive Admin | warning | `ADMIN_ACCOUNT_ARCHIVE` | บัญชีปิดใช้งาน แต่ยังเก็บประวัติไว้ตามกำหนดเก็บรักษา |

**Reason selector**: required (placeholder "เลือกเหตุผล" + 4 reasons ตาม config ต่อ action) — บังคับเลือกก่อนยืนยัน

**Reasons ต่อ action** (`adminAccountActionConfig`):
- suspend: ตรวจพบการเข้าถึงข้อมูลนอก scope / พฤติกรรมละเมิดนโยบาย BO / รอตรวจสอบ security incident / คำขอจากผู้บริหาร/HR
- reactivate: ตรวจสอบเสร็จแล้ว ไม่พบความผิด / ได้รับอนุมัติให้กลับมาใช้งาน / สิ้นสุดช่วงรอตรวจสอบ / คำขอจากผู้บริหาร/HR
- unlock: ยืนยันตัวตนกับ admin แล้ว / ตรวจสอบแล้วไม่พบความเสี่ยง / รอครบช่วง lockout 15 นาทีแล้ว / คำขอจากผู้บริหาร/HR
- archive: ออกจากทีมแล้ว / ย้ายไปทีมอื่น / สิ้นสุดการจ้างงาน / คำขอจากผู้บริหาร/HR

**Impact note** (`renderAdminAccountActionImpactNote`): แสดงผลกระทบตาม action ในกล่อง warning

**Email note**: `renderAdminAccountActionEmailNote` define ไว้แต่ไม่เรียกใน modal (ไม่มี email note ใน action modal จริง)

**Confirm tone**: suspend=danger / reactivate=primary / unlock=primary / archive=warning (กำหนด class ของปุ่มยืนยัน)

**Success flow**: หลังยืนยัน → แสดง success toast + บันทึก audit event (`ensureAdminAccountAuditEvent`) + re-render list/detail

### 8.5 Change Role Modal

Pattern: `openAdminAccountChangeRoleModal` คล้าย action modal + before/after diff

**Form fields**:
- Role ปัจจุบัน: disabled input (แสดง role เดิม)
- Role ใหม่: required selector (เลือก role ใหม่ — ยกเว้น role ปัจจุบัน, ใช้ 8 standard role templates จาก `roleMenuAccess`)
- เหตุผลการเปลี่ยน Role: required selector (4 reasons: ย้ายทีม/เปลี่ยนหน้าที่งาน / ได้รับอนุมัติจากผู้บริหาร / ปรับ scope ความรับผิดชอบตามโครงสร้างใหม่ / คำขอจากผู้บริหาร/HR)
- Note / หมายเหตุ: ไม่บังคับ

**Permission diff** (`openAdminAccountChangeRoleModal`): แสดง "เปลี่ยนสิทธิ: <role เดิม> → <role ใหม่>" ในกล่อง warning — อัปเดต live เมื่อเลือก role ใหม่

**Safeguard validation**: ก่อนเปิดให้ยืนยัน ต้องตรวจ rule ใน section 9.7 ทุกครั้ง โดยเฉพาะ self-change, master admin, last Super Admin / last admin-capable account, downgrade จาก role ที่มีสิทธิ์จัดการ role, และสถานะ account ที่ไม่อนุญาตให้เปลี่ยน role; ถ้าไม่ผ่านต้องไม่บันทึก mutation และต้องแสดง policy-blocked state แทนการเปลี่ยน role

**Confirm**: ปุ่ม "ยืนยันเปลี่ยน Role" (warning tone) + บันทึก audit event `ADMIN_ACCOUNT_ROLE_CHANGE` (`ensureAdminAccountRoleChangeAuditEvent`) + re-render list/detail

### 8.6 Invite Admin Modal

Pattern: `openAdminAccountInviteModal` คล้าย Option Master Add Option modal

**Form fields** (required มีเครื่องหมาย `*`):
- ชื่อ-นามสกุล: required
- อีเมล: required + unique (`isAdminAccountEmailUnique` — ตรวจซ้ำกับ admin ที่มีอยู่แล้ว)
- Role Template: required selector (8 standard role templates ตาม section 9.1)
- Note / หมายเหตุ: ไม่บังคับ

**Email OTP note** (`openAdminAccountInviteModal`): "ผู้รับต้องยืนยันตัวตนด้วย Email OTP ทุกครั้งที่เข้าสู่ระบบ"

**Confirm**: ปุ่ม "ส่งคำเชิญ" (primary tone) + สร้าง admin id ใหม่ (`nextAdminAccountId` — `ADM-xxx` ลำดับถัดไป) + บันทึก audit event `ADMIN_ACCOUNT_INVITE` (`ensureAdminAccountInviteAuditEvent`) + re-render list

### 8.7 Permission Gating

Pattern: `canSuspendAdmin` / `canReactivateAdmin` / `canUnlockAdmin` / `canArchiveAdmin` / `canChangeRoleAdmin` — action ที่ไม่อนุญาตไม่แสดงใน DOM (ทั้ง row menu และ detail action buttons)

| Function | เงื่อนไขอนุญาต |
| --- | --- |
| `canSuspendAdmin` | ไม่ใช่ตัวเอง + ไม่ใช่ master + สถานะไม่ใช่ Suspended/Archived + ถ้า Active ต้องไม่ใช่ active admin คนสุดท้าย |
| `canReactivateAdmin` | ไม่ใช่ตัวเอง + สถานะเป็น Suspended |
| `canUnlockAdmin` | ไม่ใช่ตัวเอง + สถานะเป็น Locked |
| `canArchiveAdmin` | ไม่ใช่ตัวเอง + ไม่ใช่ master + สถานะเป็น Suspended หรือ Locked |
| `canChangeRoleAdmin` | ไม่ใช่ตัวเอง + ไม่ใช่ master + สถานะเป็น Active หรือ Invited |

**Protection rules**:
- **Master admin หลัก** (ADM-010, `isMaster: true`): ห้าม suspend / archive / change role (ป้องกันระบบไม่มีผู้ดูแล full access)
- **Self protection** (`isSelf: true`): ห้าม suspend / reactivate / unlock / archive / change role ตัวเอง
- **Last active admin protection**: ถ้า active admin เหลือเพียง 1 คน ห้าม suspend (ป้องกันระบบไม่มีผู้ดูแล — ต่อยอด section 4)

### 8.8 Admin Account Actions

| Action | Permission | Confirmation | Reason | Audit |
| --- | --- | --- | --- | --- |
| Invite Admin | Admin | Yes | Optional | Yes (`ADMIN_INVITATION_CREATE`; protected mock ใช้ `ADMIN_ACCOUNT_INVITE` compatibility alias) |
| Change Admin Role | Admin | Yes | Required | Yes (`ADMIN_ACCOUNT_ROLE_CHANGE`) |
| Suspend Admin | Admin | Yes | Required | Yes (`ADMIN_ACCOUNT_SUSPEND`) |
| Reactivate Admin | Admin | Yes | Required | Yes (`ADMIN_ACCOUNT_REACTIVATE`) |
| Unlock Admin | Admin | Yes | Required | Yes (`ADMIN_ACCOUNT_UNLOCK`) |
| Archive Admin | Admin | Yes | Required | Yes (`ADMIN_ACCOUNT_ARCHIVE`) |
| Export Admin List | Admin | Yes | Required if sensitive | Yes |

ต้องป้องกันการเปลี่ยนแปลง Admin คนสุดท้ายตาม rule ใน section 4 และ permission gating ใน section 8.7

### 8.9 Admin Invitation Contract And Admin-Side Actions

Canonical token/state/activation contract อยู่ใน `01_AUTHENTICATION_MODULE.md` section 10.1. Section นี้กำหนด Admin Settings surface และ production boundary ที่เชื่อม Invite Admin, Admin Detail, Delivery Logs และ Audit Log โดยไม่เปลี่ยน protected prototype ในขั้น contract design

**Create invitation**

- Invite form ใช้ Name, normalized unique Email, eligible `role_id` + `expected_role_revision` และ optional note ตาม section 8.6/9.11; ไม่มี temporary password
- Production service สร้าง Admin Account `Invited`, canonical invitation `Pending` revision 1, `ADMIN_INVITATION_CREATE`, transactional email outbox และ correlation เดียวกันแบบ atomic
- Response ต้องคืนเฉพาะ account/invitation metadata ที่ปลอดภัย เช่น `admin_id`, `invitation_id`, status, `issued_at`, `expires_at`, masked delivery status และ revision/concurrency token; ห้ามคืน raw token หรือ password
- Protected prototype ปัจจุบันที่สร้าง in-memory account + `ADMIN_ACCOUNT_INVITE` + toast เป็น UI/mock baseline เท่านั้น. Adapter อาจคง `ADMIN_ACCOUNT_INVITE` เป็น compatibility alias แต่ production canonical event ของ lifecycle ใหม่คือ `ADMIN_INVITATION_CREATE`; ห้ามเขียนสอง event ซ้ำสำหรับ mutation เดียว

**Invitation context ใน Admin Detail**

Read model สำหรับ account `Invited` ต้องรองรับ `invitation_id`, `invitation_status`, `issued_at`, `expires_at`, `last_delivery_status`, `last_delivery_at`, `resend_available_at`, `resend_count_rolling_24h` และ safe action capabilities (`can_resend`, `can_cancel`, `can_reissue`) ที่คำนวณจาก server. Client ห้ามคำนวณ permission/quota/eligibility เองและต้อง refresh ก่อนยืนยัน action

Action gating:

| Account / invitation state | Resend | Cancel | Reissue |
| --- | --- | --- | --- |
| `Invited` + valid `Pending` | แสดงเมื่อ permission/cooldown/quota ผ่าน | แสดงเมื่อ permission ผ่าน | ไม่แสดง |
| `Invited` + `Expired` หรือ `Cancelled` | ไม่แสดง | ไม่แสดง | แสดงเมื่อ permission/eligibility ผ่าน |
| `Invited` + `Superseded` | resolve current invitation ก่อน; ห้าม action บน stale record | ไม่แสดง | ไม่แสดงถ้ามี current `Pending` |
| `Active`, `Locked`, `Suspended`, `Archived` | ไม่แสดง | ไม่แสดง | ไม่แสดง |

Action ที่ไม่แสดงใน DOM ยังต้องถูก reject ที่ route/API/service. ก่อน mutation ต้องตรวจ actor permission, target account status/revision, current invitation ID/status/token revision, Role status/revision/permission validity, cooldown/quota และ idempotency key ใหม่จาก server state

**Resend, Cancel And Reissue**

| Action | Confirmation/context | Production result |
| --- | --- | --- |
| Resend | แสดงเวลาที่ส่งล่าสุด, cooldown, quota ที่เหลือแบบ business-facing และ destination แบบ mask | สร้าง invitation revision ใหม่, supersede `Pending` เดิม, เขียน audit/outbox; cooldown 60 วินาทีและ quota 5 successful issuances/rolling 24h ต่อ target account |
| Cancel | ต้อง confirmation และแสดงว่า account ยังคง `Invited`; reason/note ใช้เมื่อ policy บังคับ | `Pending -> Cancelled`, token ใช้ไม่ได้ทันที, account ไม่เปลี่ยน |
| Reissue | แสดง terminal state เดิมและ Role/Email ปัจจุบันแบบ read-only | สร้าง `Pending` revision ถัดไปหลัง `Expired`/`Cancelled`; คง terminal history เดิม |

Resend quota นับเฉพาะ issuance ที่ commit สำเร็จ; initial invite ไม่ใช่ Resend. Hidden IP/device/velocity protection เป็น security configuration และห้ามเปิด threshold หรือเปลี่ยน quota ที่ผู้ใช้เห็น. Provider failure ไม่ rollback account/invitation; Admin Detail แสดง safe Failed/Retry state และอนุญาต Resend เมื่อ server capabilities อนุญาต

**API and concurrency contract**

ใช้ endpoint canonical จาก `01_AUTHENTICATION_MODULE.md` section 10.1. ทุก mutation ต้องมี `expected_account_revision`, current invitation concurrency fields เมื่อมี, `idempotency_key`, `correlation_id` และ server-authoritative authorization. Stale/no-op/race/duplicate request ต้องไม่เกิด partial mutation. Exact retry ด้วย idempotency key เดิมคืนผลเดิม; key เดิมกับ payload ต่างกันต้อง reject

**Cross-module trace**

- History & Actions ของ Admin Detail แสดง lifecycle event โดย reference ไป `invitation_id`; audit pill เปิด Audit Log ตาม permission และ delivery pill เปิด Delivery Log ที่ `delivery_id`
- Invitation email ใช้ Delivery ID `DLV-ACCT-<admin-sequence>-INV-<attempt-sequence>` และ `source = invitation_id`; ทุก provider attempt มี record แยกตามสถานะจริง
- Audit/Delivery payload ห้ามมี raw/hashed token, password/password hash, OTP, idempotency secret, provider credential หรือ secret อื่น; destination ต้อง mask ตาม privacy policy
- Core mutation + audit + transactional outbox commit/rollback พร้อมกัน; provider attempt เกิดหลัง commit และ retry ตาม provider policy โดยไม่สร้าง invitation/account ซ้ำ

**Scope boundary**

Contract นี้ไม่เพิ่ม navigation/menu/route ของ protected prototype, ไม่เปลี่ยน Invite Admin modal/Admin Detail/Delivery Logs/Audit Log ที่ล็อก และไม่รวม My Account, Change/Forgot/Reset Password, failed-login Locked recovery, Active Sessions หรือ Logout All Devices. การเปิด UI flow ใหม่ต้องเป็นงาน implementation ที่ได้รับอนุมัติแยก

## 9. Roles & Permissions Policy Catalog

The previous multi-Admin access policy catalog is replaced by a single Admin account type with role templates and module/action policy. The UI may show a `Roles & Permissions` policy catalog, but it must not show separate BO admin account types.

### 9.1 Baseline Role Templates

Roles & Permissions must start with 8 standard role templates. These templates are system presets for assigning permission sets to Admin accounts; they are not separate BO admin account types.

| Role template | Primary responsibility | Baseline restrictions |
| --- | --- | --- |
| Super Admin | ดูแล BO ทั้งระบบ รวม Admin Settings, Audit Log, sensitive reveal/export และ policy changes | ต้องมี last-active-admin protection; ห้ามปิด/ลดสิทธิ์ตัวเองถ้าทำให้ BO ไม่มีผู้ดูแลสูงสุดเหลืออยู่ |
| Admin Manager | จัดการ Admin Accounts, Roles & Permissions, security/system policy และ high-risk settings ตาม approval | ไม่มีสิทธิ์แก้ Super Admin/master protection, ลบ audit trail, หรือข้าม confirmation/reason/audit |
| Operations Manager | ดูภาพรวมงานปฏิบัติการข้าม User, Asset, Offer, Account Deletion, Delivery Logs และ Dashboard queue | ทำ mutation ได้เฉพาะ action ที่ permission matrix อนุญาต; export/sensitive reveal ต้องใช้ policy แยก |
| Support Agent | ช่วยเหลือผู้ใช้จาก Support Center, User context แบบจำกัด, delivery status และประวัติที่จำเป็นต่อการช่วยเหลือ | ไม่มีสิทธิ์เปลี่ยนสถานะบัญชี/สินทรัพย์, ดู sensitive data เต็ม, export หรือแก้ Settings |
| Trust & Safety Moderator | จัดการ report/moderation queue สำหรับ user, asset, comment และ board content ตามเหตุผล/audit | Sensitive fields ถูก mask เป็นค่าเริ่มต้น; action ที่กระทบ FO ต้องมี reason, impact note และ audit |
| Asset Operations | ตรวจสอบ Asset List/Asset Detail, reported assets/comments และข้อมูลที่เกี่ยวกับ asset lifecycle | ไม่มีสิทธิ์แก้ Market Data master, Admin Settings, policy, หรือ export sensitive asset/user data เว้นแต่ matrix อนุญาต |
| Content Editor | สร้าง/แก้ draft, category, metadata และ preview content ใน Content Management | ไม่มีสิทธิ์ publish, schedule, archive, restore หรือจัดการ Reported Articles แบบปิดเคส |
| Content Publisher | publish, schedule, archive, restore content และจัดการ Reported Articles ตาม policy | ไม่มีสิทธิ์แก้ Admin Settings, user/account status, asset moderation หรือ sensitive reveal/export นอก content scope |

Role templates are presets. Production enforcement must use explicit permission keys at route, navigation, UI action, API, service, export, sensitive-field, and audit layers. Phase ปัจจุบันสร้าง Custom Role แบบ `from_scratch` เท่านั้นและไม่มี action `Copy`, `Clone`, `Duplicate` หรือ source-template selector; หาก standard role ไม่ตรงงาน ให้สร้าง Custom Role ใหม่หรือแก้ Custom Role เดิมด้วย permission set แบบ explicit. ค่า lineage `derived/copied` ใน section 9.11 เป็น schema reservation สำหรับ future/import compatibility เท่านั้น ไม่ใช่ flow ที่เปิดใช้ใน UI ปัจจุบัน. ส่วน 8 standard templates ข้างต้นเป็น System Role ที่ห้ามลบ เปลี่ยนชื่อ เปลี่ยน permission baseline หรือเปลี่ยน system identity จาก UI.

### 9.2 Permission Key Taxonomy

Permission enforcement must use explicit keys, not role names, at navigation, route, UI action, API, service, export, sensitive-field, and audit layers. A Role or Custom Role is only a named collection of these keys.

| Permission group | Key pattern | Scope |
| --- | --- | --- |
| Module access | `<module>.view`, `<module>.detail` | เห็นเมนู, เปิด list/detail, search/filter/sort/pagination และ deep link ที่เกี่ยวข้อง |
| Create/update | `<module>.create`, `<module>.update`, `<module>.draft.update` | สร้างหรือแก้ไขข้อมูลตาม module contract โดยต้องเคารพ validation, confirmation และ audit |
| Status/moderation | `<module>.status.update`, `<module>.moderate`, `<module>.case.close` | ปิดเคส, restore, hide/remove, suspend/reactivate หรือ action ที่กระทบผู้ใช้/FO |
| Publish policy | `<module>.publish`, `<module>.schedule`, `<module>.archive`, `<module>.restore` | ใช้กับ Content/Policy flow ที่เปลี่ยนสถานะเผยแพร่ |
| Sensitive data | `<module>.sensitive.reveal`, `<module>.proof.view`, `<module>.owner_contact.view` | เปิดข้อมูลที่ mask เป็นค่าเริ่มต้น ต้องมี audit และอาจต้องมี reason |
| Export/download | `<module>.export`, `<module>.download` | ดาวน์โหลดข้อมูล, export file, background job, expiry และ audit ตาม export policy |
| Settings/admin | `settings.admin_accounts.view`, `settings.admin_accounts.manage`, `settings.roles.view`, `settings.roles.manage`, `settings.security.update`, `settings.retention.update`, `settings.delivery.retry` | อ่าน/เปลี่ยน admin lifecycle, อ่าน/จัดการ role/permission, security, retention/export policy และ retry delivery |
| Audit visibility | `audit.view`, `audit.detail`, `audit.export`, `audit.sensitive_payload.view` | อ่าน audit list/detail, export audit และเห็น payload ที่ sensitive |

Permission result has 5 levels:

| Level | Meaning | UI behavior |
| --- | --- | --- |
| `none` | ไม่มีสิทธิ์ | ซ่อนเมนู/action; direct URL/API ต้องถูกปฏิเสธ |
| `view` | ดู list/detail ได้ | แสดงข้อมูลตาม masking policy; ไม่มี mutation |
| `manage` | ทำงานหรือแก้ไขข้อมูลปกติใน scope ได้ | เปิด action ที่ matrix อนุญาต พร้อม validation/audit ตาม module |
| `approve` | ทำ action high-risk หรือ publish/close ได้ | ต้องมี confirmation, reason, before/after diff และ audit |
| `admin` | จัดการ settings/role/policy ได้ | ใช้เฉพาะ role ที่ได้รับอนุญาตและต้องมี safeguard เพิ่มเติม |

**Phase 1 permission action catalog**

Role Detail และ Create/Edit Custom Role ใช้ action catalog ที่สอดคล้องกับเมนูและ action ซึ่งมีอยู่จริงใน prototype ปัจจุบัน รวม 40 permission keys. ตารางนี้แสดง key ที่ prototype ใช้; `admin_accounts.*` และ `roles.*` ต้อง normalize เป็น canonical `settings.admin_accounts.*` และ `settings.roles.*` ที่ production boundary ตาม section 9.11.

| Module | Submenu / scope | Permission keys ที่เปิดใช้ใน Phase 1 |
| --- | --- | --- |
| Dashboard | Dashboard | `dashboard.view` |
| User Management | User Accounts / Reported Users | `users.accounts.view`, `users.accounts.manage`, `users.reports.view`, `users.reports.manage` |
| Asset Management | Asset List / Reported Assets / Reported Comments | `assets.list.view`, `assets.list.manage`, `assets.reports.view`, `assets.reports.manage`, `comments.reports.view`, `comments.reports.manage` |
| Offer Management | Offer List / Detail | `offers.view` |
| Content Management | Articles / Categories / Reported Articles | `articles.view`, `articles.manage`, `articles.publish`, `categories.view`, `categories.manage`, `board.reports.view`, `board.reports.manage` |
| Market Data | Dashboard / Brands & Models / Sync History | `market.dashboard.view`, `market.catalog.view`, `market.sync.view`, `market.sync.run` |
| Option Master | Option Groups / Options | `option.view`, `option.manage` |
| Market Demand | Demand Overview / Search Insights / Watch Alert List | `demand.overview.view`, `demand.search.view`, `demand.watch.view` |
| Account Deletion | Requests / Detail | `deletion.view`, `deletion.manage` |
| Settings | Admin Accounts / Roles & Permissions / Policy & Versioning / Support Center / Delivery Logs / Audit Log | `admin_accounts.view`, `admin_accounts.manage`, `roles.view`, `roles.manage`, `policy.view`, `policy.manage`, `support_center.view`, `support_center.manage`, `delivery.view`, `audit.view` |

Permission taxonomy และ level 5 ระดับเป็น canonical policy/service contract; Role Detail ปัจจุบันจงใจแสดงเฉพาะชื่อ action ที่ granted โดยไม่แสดง key หรือ level และ Create/Edit ใช้ checkbox เลือก action โดยไม่มี level selector. Permission ที่ยังไม่อยู่ใน Phase 1 catalog ห้ามแสดงหรืออนุมานว่าเปิดใช้จาก baseline matrix เพียงอย่างเดียว.

### 9.3 Baseline Permission Matrix By Role

Matrix นี้เป็น baseline กลางสำหรับ 8 standard role templates. Phase ปัจจุบันสร้าง Custom Role จาก permission set แบบ explicit (`from_scratch`) เท่านั้น; schema รองรับ lineage `derived/copied` ไว้สำหรับ future/import compatibility ตาม section 9.11 แต่ไม่มี flow ดังกล่าวใน UI ปัจจุบัน. ทุกแบบห้ามผูกสิทธิ์เฉพาะรายบุคคลกับ Admin account โดยตรง.

| Area / permission scope | Super Admin | Admin Manager | Operations Manager | Support Agent | Trust & Safety Moderator | Asset Operations | Content Editor | Content Publisher |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Dashboard / global queues | admin | view | manage | view | manage | manage | view | view |
| User Management | admin | view | manage | view | manage | view | none | none |
| User sensitive reveal / export | admin | none | approve | none | view | none | none | none |
| Asset List / Asset Detail | admin | view | manage | view | manage | manage | view | view |
| Asset moderation / reported assets | admin | none | approve | none | approve | manage | none | none |
| Reported comments | admin | none | approve | none | approve | manage | none | none |
| Content articles/categories draft | admin | none | view | none | manage | none | manage | manage |
| Content publish/schedule/archive/restore | admin | none | view | none | approve | none | none | approve |
| Reported Articles moderation | admin | none | view | none | approve | none | view | approve |
| Market Data catalog | admin | none | view | none | view | view | none | none |
| Market Data import/sync/update | admin | none | approve | none | none | none | none | none |
| Option Master | admin | none | approve | none | none | none | none | none |
| Offer Management | admin | view | view | view | view | view | none | none |
| Market Demand / Watch Alerts | admin | view | view | view | view | view | none | none |
| Policy & Versioning | admin | approve | view | none | view | none | view | approve |
| Support Center settings | admin | approve | view | manage | view | none | none | none |
| Account Deletion requests | admin | view | approve | view | approve | none | none | none |
| Delivery Logs | admin | manage | view | view | view | view | none | none |
| Retry failed delivery | admin | approve | none | manage | none | none | none | none |
| Audit Log list/detail | admin | view | view | none | view | none | none | none |
| Audit sensitive payload / export | admin | none | none | none | none | none | none | none |
| Admin Accounts lifecycle | admin | approve | none | none | none | none | none | none |
| Roles & Permissions management | admin | approve | none | none | none | none | none | none |
| Security / retention / export policy | admin | approve | none | none | none | none | none | none |

Matrix นี้กำหนด policy baseline ของ 8 System Roles ส่วนสิทธิ์ที่ Role Detail แสดงจริงต้องมาจาก Phase 1 permission action catalog ด้านบนเท่านั้น. Capability ที่ยังไม่มี key/action ใน catalog ปัจจุบัน เช่น delivery retry/export หรือ sensitive audit export เป็น policy/future implementation baseline และต้องไม่ปรากฏเป็น action ใน Roles & Permissions จนกว่าจะมี scope ที่อนุมัติและ module ปลายทางรองรับ.

### 9.4 Permission Rule Notes

- `Super Admin` is the only standard role with full `admin` coverage, but it is still subject to self-change, master, last-active-admin, confirmation, reason, and audit safeguards.
- `Admin Manager` can manage admin lifecycle and role/policy changes, but cannot bypass Super Admin/master protection, cannot view audit sensitive payload by default, and cannot delete audit trail.
- `Operations Manager` can operate across queue-heavy modules but cannot change Admin Settings, Roles & Permissions, security policy, audit payload visibility, or system role identity.
- `Support Agent` is intentionally read-heavy. It may use support and delivery-retry actions needed for user assistance, but cannot mutate user/account/asset status or reveal full sensitive data.
- `Trust & Safety Moderator` can close moderation cases for user/asset/comment/board reports with required reason, impact note, confirmation, FO-impact handling, and audit.
- `Asset Operations` focuses on asset lifecycle review and asset-related moderation. It cannot publish content, change Market Data master data, or manage settings.
- `Content Editor` can create/update draft content and preview within content scope only. Publish, schedule, archive, restore, Reported Articles case close, export, and settings are blocked.
- `Content Publisher` can publish/schedule/archive/restore content and close content/report cases inside content scope, but cannot edit Admin Settings or act on user/account/asset status.
- Any `sensitive.reveal`, `export`, `download`, `case.close`, `status.update`, `publish`, `archive`, `restore`, `settings.roles.manage`, or security/retention policy update must be independently auditable even when the role has the required permission.

### 9.5 Module / Action Policy Catalog

| Module | Admin access rule |
| --- | --- |
| Dashboard | Admin sees metrics and queues allowed by module/action policy. |
| User Management | Admin can manage users subject to sensitive-data, account-status, export, confirmation, reason, and audit rules. |
| Asset Management | Admin can review and change assets subject to FO-impact, sensitive-data, confirmation, reason, and audit rules. |
| Content / Board | Admin can create, edit, preview, publish, schedule, archive, and audit content actions. |
| Market Data / Directory | Admin can manage brand/model/reference/price data with provider-source, inactive/restore, and audit controls; Directory is future/postponed from Phase 1. |
| Audit Log | Admin can view/export audit data according to audit visibility and sensitive-payload policy. |
| Offer Management / Asset Reported Comments / Watch Alert | Admin can review permitted records by policy with privacy masking and audit. Offer Management V1 remains read-only. |
| Help / Support / Account Deletion | Admin can manage Policy & Versioning, Support Center และ deletion workflows with dependency checks, confirmation, reason, and audit. |
| Notifications / Reports (Phase 2/future) | Admin can manage templates, broadcasts, and exports according to approval/export/sensitive-data policy. Reports module is deferred to Phase 2/future scope. |
| Delivery Logs (Phase 1) | Admin can view delivery logs, retry failed delivery, and export delivery log under Settings with scope/reason/audit. Broadcast/System Templates config remains Phase 2/future (ดู `14_NOTIFICATIONS_MODULE.md`). |
| Admin Settings | Admin can manage BO settings through high-risk policy controls and audit. |

### 9.6 Permission Change Rules

- Permission changes are policy changes for the single Admin account type and its role templates.
- Require confirmation, reason, before/after diff, and audit.
- Direct API/service enforcement is required for every changed policy.
- Changes affecting the current session must be reflected on the next request or token/session refresh.

### 9.7 Critical Role Change Safeguards

Role change is a high-risk account lifecycle action. UI hiding is only a presentation layer; the same safeguards must be enforced at route, API, service, and persistence layers before the role value is changed. กฎที่กล่าวถึง Custom Role ใน section นี้เป็น production/data contract; current protected Admin Accounts UI ยังมีเฉพาะ 8 System Roles และไม่ได้ implement Custom Role assignment.

| Safeguard | Rule | Blocked outcome / UI state |
| --- | --- | --- |
| Self-change protection | Admin cannot change their own role, including upgrade, downgrade, or switching to another role with similar permissions. | Hide action; direct URL/API returns permission denied with audit attempt if applicable. |
| Master admin protection | Master admin account cannot be changed away from its protected role and cannot be assigned a weaker role. | Hide action and show policy-blocked state if reached by deep link. |
| Last Super Admin protection | If the target account is the only active `Super Admin`, changing it to any non-`Super Admin` role is blocked. | Show blocked reason that at least one active Super Admin must remain. |
| Last role-manager protection | If the target account is the only active account with `settings.roles.manage` or equivalent role-management capability, changing it to a role without that capability is blocked. | Show blocked reason that at least one role-management admin must remain. |
| Last admin-capable protection | If the change would leave no active account that holds all of `settings.admin_accounts.manage`, `settings.roles.manage`, and `settings.security.update`, block the change. | Show blocked reason that BO must retain admin recovery coverage. |
| Privilege escalation confirmation | Changing to a role with broader access than the current role requires a selected reason and high-risk confirmation. | Confirmation must display before/after permission diff and cannot submit without reason. |
| Privilege downgrade warning | Changing from `Super Admin`, `Admin Manager`, or any Custom Role with role-management permission to a weaker role must show high-risk downgrade warning. | Confirmation must clearly state lost admin-management capabilities. |
| Account status guard | Role can change only for `Active` or `Invited` accounts. `Suspended`, `Locked`, and `Archived` accounts must be restored/unlocked through the correct lifecycle action first. | Hide action in row/detail; direct API rejects mutation. |
| Standard role identity guard | System role identity cannot be renamed, deleted, or repurposed through role-change flow. Admin account role assignment may reference a standard role or Custom Role only. | Block attempts to mutate role template identity from account lifecycle flow. |
| Custom Role status guard | Admin cannot assign an inactive, archived, deleted, draft-only, or invalid Custom Role. If a Custom Role is later deactivated, affected Admin accounts require a governed migration path, not silent reassignment. | Role selector excludes unavailable roles; API rejects stale selections. |
| Session freshness | Role changes affecting current admin access must invalidate stale permission cache and apply on next request or token/session refresh. If the changed account is currently online, production must define whether to force refresh or require re-login. | Show success with access-refresh note; stale sessions cannot keep removed permissions. |
| Audit completeness | Every submitted role-change attempt must preserve actor, target account, old role, requested new role, reason, before/after permission diff summary, result, timestamp, and reference id. For attempts rejected before form submission, record available fields and the block reason; do not invent a selected role or user-entered reason. | Audit Log can trace completed and blocked attempts according to audit visibility policy. |

For production implementation, these safeguards must run after permission check and before persistence. Race conditions must be handled transactionally: the last Super Admin, last role-manager, and last admin-capable checks must use current committed account state, not stale UI state.

### 9.8 Role Change Audit Record Contract

ทุกคำขอเปลี่ยน Role ต้องสร้าง audit event `ADMIN_ACCOUNT_ROLE_CHANGE` โดย event เดียวต้องผูกกับ target Admin account และ correlation/reference เดียวกันตลอด request เพื่อให้ตรวจย้อนกลับจาก History & Actions ไปยัง Audit Log ได้ การบันทึกสำเร็จเป็นส่วนหนึ่งของ transaction เดียวกับการเปลี่ยน Role; ถ้าเขียน audit ไม่สำเร็จ ห้าม persist role ใหม่

| กลุ่มข้อมูล | ฟิลด์ที่ต้องบันทึก | กติกา |
| --- | --- | --- |
| ตัวระบุเหตุการณ์ | `event_id`, `event_type`, `created_at`, `correlation_id`, `reference` | `event_type` คงที่เป็น `ADMIN_ACCOUNT_ROLE_CHANGE`; `reference` ใช้ Admin ID ของผู้ถูกเปลี่ยน Role (เช่น `ADM-xxx`) และ `correlation_id` เชื่อม request/retry เดียวกันโดยไม่สร้างผลซ้ำ |
| ผู้ดำเนินการ | `actor_admin_id`, `actor_name_snapshot`, `actor_role_id`, `actor_role_name_snapshot`, `actor_role_revision`, `actor_type`, `ip_address`, `user_agent`, `session_id` หรือ session reference | ใช้ immutable ID/revision เป็น canonical และชื่อเป็น display snapshot; ระบุผู้ยืนยัน action จริง ไม่ใช้ข้อมูลจาก target แทน actor; `ip_address`/`user_agent` ถูกจำกัดการเข้าถึงตาม audit visibility policy |
| ผู้ถูกเปลี่ยน Role | `target_admin_id`, `target_name_snapshot`, `target_account_status`, `target_account_revision`, `target_is_master` | เก็บ snapshot ขณะตรวจ safeguard เพื่ออธิบายว่าทำไม action ผ่านหรือถูก block |
| การเปลี่ยนแปลง | `old_role_id`, `old_role_name_snapshot`, `old_role_type`, `old_role_revision`, `new_role_id`, `new_role_name_snapshot`, `new_role_type`, `new_role_revision`, `permission_diff` | ต้องเก็บ immutable ID/revision และ before/after ของ Role พร้อม summary ของ permission ที่เพิ่ม/ลด/คงเดิมสำหรับทุก role type; ชื่อเป็น snapshot เพื่อแสดงผล ไม่ใช่ key อ้างอิง |
| เหตุผลและบริบท | `reason_code`, `reason_label`, `note`, `impact_summary`, `confirmation_version` | `reason_code` required เมื่อ flow ถึงขั้น submit หลังเลือกเหตุผล; pre-form policy block ให้เป็น null; `note` nullable; `confirmation_version` required เฉพาะเมื่อแสดง confirmation แล้ว |
| ผลตรวจและผลลัพธ์ | `safeguard_checks`, `decision`, `result`, `failure_code`, `failure_detail`, `persisted_at` | `safeguard_checks` ระบุผลของ rule ที่เกี่ยวข้อง; `decision` เป็น `Allowed` หรือ `Blocked`; `result` ใช้เฉพาะ `Success`, `Failed` หรือ `Partial` ตาม Audit Log contract; `persisted_at` มีเฉพาะเมื่อเปลี่ยน Role สำเร็จ |

สำหรับ `ADMIN_ACCOUNT_ROLE_CHANGE` ที่ submit โดย Admin ให้ actor/target/current Role fields เป็น required และ non-null. หาก request ถูก block ก่อนเลือก new Role ให้ new Role fields, user-entered reason และ note เป็น null ตามข้อมูลจริง; ห้ามสร้างค่าทดแทน. Event ของ `System` ใช้ `actor_type=System`, เก็บ system/job actor ID และให้ Admin-specific actor Role fields เป็น null.

กติกา result:

- `Success`: บันทึก before/after ครบ, audit write สำเร็จ และ role ใหม่ถูก persist แล้ว
- `Blocked`: ตั้ง `decision: Blocked` และ `result: Failed` โดยไม่เปลี่ยน Role; เก็บ actor/target/role เดิม, requested role และ reason เฉพาะที่มีอยู่จริง พร้อม `failure_code` ของ safeguard ที่ block ห้ามเดาหรือเติม role/reason ที่ผู้ใช้ยังไม่ได้เลือก
- `Failed`: ผ่านการตรวจหรือเริ่ม persist แล้วแต่ transaction/audit write ล้มเหลว; เก็บข้อมูลที่ปลอดภัยสำหรับ trace และต้องไม่เหลือ role เปลี่ยนครึ่งทาง
- `Partial`: ใช้ได้เฉพาะกรณีผลข้างเคียงที่ไม่ใช่การเปลี่ยน Role ล้มเหลวหลัง transaction หลักสำเร็จ; ห้ามใช้แทน `Success` เมื่อ audit write หรือ role persistence ไม่สมบูรณ์

ก่อนแสดงใน Audit Log ให้ mask ข้อมูลเครือข่าย/session และไม่เก็บ secret, token, password หรือ permission payload ที่เกิน audit visibility ของผู้ดู หาก retry request เดิม ให้ใช้ `correlation_id`/idempotency key เดิมและไม่สร้างการเปลี่ยน Role ซ้ำ; การ retry ที่ไม่ทำ mutation ใหม่อาจบันทึก attempt เพิ่มได้ แต่ต้องอ้าง event หลักเดิมชัดเจน

การสร้าง แก้ไข ปิดใช้งาน และเปิดใช้งาน Role template/Custom Role ใช้ field กลางข้างต้นตามที่เกี่ยวข้อง และต้องบันทึก event เพิ่มเติมดังนี้:

| เหตุการณ์ | Event type | ข้อมูลเฉพาะที่ต้องมี |
| --- | --- | --- |
| สร้าง System Role จาก baseline/seed | `ROLE_CREATE` | `role_id`, `role_display_name_snapshot`, `role_type=system`, `role_revision=1`, `creation_mode=system_baseline`, source pair เป็น null, `source_provenance_status=not_applicable`, permission baseline, `actor_type=System` และ result |
| สร้าง Custom Role | `ROLE_CREATE` | `role_id`, `role_display_name_snapshot`, `role_type=custom`, `role_revision=1`, current UI ใช้ `creation_mode=from_scratch` + source pair null + provenance `not_applicable`, permission set เริ่มต้น, creator และ result; future/import flow ใช้ source/provenance ตาม section 9.11 |
| แก้ไขชื่อ คำอธิบาย หรือ Permission ของ Custom Role | `ROLE_UPDATE` หรือ `ROLE_PERMISSION_UPDATE` | `role_id`, before/after ของ field ที่เปลี่ยน, permission added/removed/changed, reason, affected-admin count และ result |
| ปิดใช้งานหรือเปิดใช้งาน Custom Role | `ROLE_DEACTIVATE` หรือ `ROLE_REACTIVATE` | `role_id`, old/new status, reason, affected Admin accounts, migration/rollback reference และ result |

Role lifecycle event ใช้ target entity `RolePermission`, target/reference เป็น `role_id` และเก็บ `event_id` แยกจาก correlation ID. Role Audit History อาจแสดง history reference ของ prototype (`ROLE-HIST-*`) แต่ production cross-reference ต้อง resolve ไป immutable audit event/correlation ได้โดยไม่ใช้ชื่อ Role.

System Role ห้ามเปลี่ยน identity; attempt ที่ถูก block ต้องใช้ event type ของคำขอที่เกี่ยวข้องพร้อม `decision: Blocked`, `result: Failed` และ `failure_code` ตาม safeguard โดยไม่บันทึก mutation ที่ไม่เกิดขึ้น

### 9.9 Role List

หน้าจอ `Settings > Roles & Permissions` เป็น full-width master-data list สำหรับดูและจัดการ Role โดยใช้ drill-in ไป Role Detail; ไม่มี KPI cards และไม่มี list-detail split เพราะจำนวนและสถานะเป็นข้อมูลที่อ่านได้จากรายการโดยตรง. การเห็นเมนู/รายการใช้ `settings.roles.view`; create/edit/deactivate/reactivate และ mutation อื่นใช้ `settings.roles.manage`. ผู้ไม่มี `view` ต้องไม่เห็นเมนูและ direct URL/API ต้องถูกปฏิเสธ ส่วนผู้มี `view` แต่ไม่มี `manage` เห็นข้อมูลแบบ read-only และ action mutation ต้องไม่ render.

**Page structure**

1. Breadcrumb: `เครื่องมือ & รายงาน / Settings / Roles & Permissions`
2. Page title `Roles & Permissions`, panel title `Role List`; prototype ไม่แสดง page meta/subtitle
3. ปุ่ม primary `สร้าง Custom Role` แสดงเฉพาะผู้มีสิทธิ์สร้าง; System Role ไม่มี entry point สำหรับสร้างหรือแก้ identity
4. Filter bar: search, ตัวกรองประเภท Role, สถานะ, sort และปุ่ม reset
5. Role List panel และ pagination 10 รายการต่อหน้า

**Search, filters, and sort**

| Control | Requirement |
| --- | --- |
| Search | ค้น `Role ID`, ชื่อ Role, `role_key` และคำอธิบาย; debounce ได้, reset กลับหน้า 1 และต้องไม่ค้นจาก permission payload ที่ไม่อยู่ในขอบเขตการมองเห็น |
| ประเภท Role | All / System Role / Custom Role; ค่าเริ่มต้น All |
| สถานะ | All / Active / Inactive; System Role แสดง Active เสมอและไม่ต้องมี Archived/Deleted ในรายการปกติ |
| Sort | Role ID (default), ชื่อ A–Z, สร้างล่าสุด, แก้ไขล่าสุด, ผู้ดูแลที่ใช้งานมาก–น้อย |
| Reset | ล้าง search/filter/sort กลับค่า default และกลับหน้า 1 |
| State persistence | คง filter, sort และหน้าปัจจุบันเมื่อ Role Detail → Back; ล้างเมื่อสลับ module |

**Desktop list columns**

| Column | Display and behavior |
| --- | --- |
| Role ID | `ROL-xxx`; ใช้เป็นตัวระบุใน list และเปิด Role Detail เมื่อคลิก row |
| Role | ชื่อ Role; คลิก row เปิด Role Detail |
| Type | chip `System Role` หรือ `Custom Role` |
| Status | status pill `Active` / `Inactive`; System Role แสดง `Active` และห้ามแสดง control ปิดใช้งาน |
| Detail | คำอธิบาย Role แบบตัดบรรทัดพร้อม full text tooltip |
| Admins | จำนวน Admin ที่ Active และใช้งาน Role นี้; ไม่เป็น link ไป filtered Admin Accounts ใน Phase นี้ |
| Last Updated | วันเวลาแก้ไขล่าสุด; System Role ที่ยังไม่เคยเปลี่ยนใช้ baseline timestamp |
| Action | ปุ่ม `...` ที่แสดงตาม permission และชนิด Role; คลิกทั้ง row ยกเว้น action menu เปิด Role Detail |

**Action menu and list rules**

| Role type / status | Available actions | Rules |
| --- | --- | --- |
| System Role / Active | ดูรายละเอียด | ห้าม Rename, Edit permissions, Deactivate, Reactivate หรือ Delete System Role จาก list |
| Custom Role / Active | ดูรายละเอียด, แก้ไข, ปิดใช้งาน | `ปิดใช้งาน` ต้องผ่าน impact check, reason และ confirmation; action ที่ไม่มีสิทธิ์ห้าม render ใน DOM |
| Custom Role / Inactive | ดูรายละเอียด, แก้ไข, เปิดใช้งาน | ห้ามเลือก Role นี้ใน assignment; prototype อนุญาตแก้ข้อมูล/Permission ขณะ Inactive โดยยังใช้ revision guard และ audit |

Row action ต้องไม่เปลี่ยน status หรือ permission จาก list โดยตรง. Mutation ทุกชนิดเปิด flow เฉพาะของตนพร้อม confirmation, safeguard และ audit contract ใน section 9.8; Edit/Deactivate/Reactivate บังคับ user-entered reason ส่วน Create ใช้ generated audit context ตาม section 9.12. List refresh หลังผลสำเร็จโดยคง filter/sort/page เท่าที่รายการยังอยู่ในผลลัพธ์.

Role List ไม่มี action `ดู Audit Log`, `Copy`, `Clone`, `Duplicate` หรือ `Delete`. System Role เปิดได้เฉพาะ `ดูรายละเอียด`; Role history อ่านจาก section `Role Audit History` ใน Role Detail และไม่ deep-link ไป Settings > Audit Log จาก list/detail ใน Phase นี้.

**Mobile card and states**

- ที่ viewport `<= 760px` ซ่อน table header/columns และแสดง Role card: ชื่อ Role เป็น heading, chips ประเภท/สถานะ/จำนวน Active Admin, meta `Role ID` และ `Last Updated`; ปุ่ม `...` ไม่มีกรอบและไม่ชนกับ row tap target.
- Pagination ใช้ compact `ก่อนหน้า  current / total  ถัดไป`; desktop ใช้ shared adaptive pager ตาม `00_GLOBAL_RULES_MODULE.md`.
- Loading ใช้ list/card skeleton, no-result ระบุว่าค้นหาไม่พบและมีปุ่มล้างตัวกรอง, empty base state อธิบายว่ายังไม่มี Custom Role พร้อม `สร้าง Custom Role` เฉพาะผู้มีสิทธิ์, และ error มี retry โดยไม่ล้าง filter.
- Permission denied, stale/deleted role และ API failure ต้องไม่เปิด detail/mutation flow และแสดงข้อความไทยที่บอกทางกลับ Role List ได้.

**Role List acceptance boundary**

- Role List ไม่แสดงหรือกำหนดสิทธิ์เฉพาะรายบุคคล; Admin ทุกคนอ้าง Role เดียวตาม contract.
- ไม่แก้หรือ deep-link เข้าหน้า `Settings > Admin Accounts` ในงานนี้ เพราะเป็น protected screen.
- การสร้าง, แก้ไข Permission, impact check และ deactivate/reactivate เปิดเป็น modal/flow จาก list ตาม prototype; production ต้องใช้ validation, revision, safeguard, audit, data และ lifecycle contract ใน section 9.7–9.12.

### 9.10 Role Detail And Permissions

Role Detail เป็นหน้ารายละเอียดเต็มหน้าที่เปิดจาก Role List และใช้เพื่ออ่านขอบเขตสิทธิ์ของ Role โดยไม่แสดงหรือกำหนดสิทธิ์เฉพาะรายบุคคล. ใช้ `settings.roles.view` สำหรับเข้าถึงรายละเอียด และใช้ `settings.roles.manage` เฉพาะ mutation; ทุกข้อมูลและ action ต้องตรวจ permission ซ้ำที่ route/API/service ไม่พึ่ง UI อย่างเดียว.

**Detail header and navigation**

1. Breadcrumb: `เครื่องมือ & รายงาน / Settings / Roles & Permissions / <Role Name>`
2. ปุ่ม `กลับไปยัง Role List` ต้องคืน search, filter, sort และหน้าปัจจุบันตาม section 9.9
3. Detail head แสดง `Role ID : Role Name`, chip `System Role` หรือ `Custom Role` และ status pill; panel subtitle แสดง `Role Name · role_key`
4. Role Summary แสดง 4 tiles: `Role Key`, `Created`, `Last Updated`, `Active Admins`; prototype ปัจจุบันไม่แสดง created/updated actor, creation mode หรือ source lineage บนหน้าจอ แม้ production contract ต้องเก็บข้อมูลเหล่านั้น
5. action อยู่ท้ายหน้า: System Role ไม่มี mutation action; Custom Role แสดง `แก้ไข` และ `ปิดใช้งาน` หรือ `เปิดใช้งาน` ตามสถานะ โดย action ที่ไม่มีสิทธิ์ต้องไม่ render ใน DOM

จำนวนผู้ดูแลที่ใช้งานเป็นข้อมูลสรุปแบบ read-only ไม่เป็น link ไป `Settings > Admin Accounts` ใน Phase นี้ เพื่อไม่แก้ flow ของ protected screen. หาก Role เป็น Inactive ให้แสดง contextual warning ว่า Role ไม่ eligible สำหรับ assignment ใหม่ตาม production/data contract แต่ข้อความนี้ไม่ได้หมายความว่า current protected Admin Accounts UI รองรับ Custom Role selector; prototype อนุญาตแก้ข้อมูลและ Permission ได้ตามปกติภายใต้ revision guard/audit.

**Detail sections**

| Section | Content and behavior |
| --- | --- |
| Role Summary | 4 tiles: Role Key, Created, Last Updated, Active Admins; type/status อยู่ใน detail head |
| Permissions | แสดงเฉพาะ granted permissions (`level !== none`) แบบ accordion แยก module/submenu; permission ที่ไม่มีไม่แสดง |
| Role Audit History | ตาราง 5 คอลัมน์ Date & Time / Actor / Action / Result / Detail; action label มาตรฐาน, Actor แสดงชื่ออย่างเดียวหรือ `System`, Detail แสดง reason และข้อมูล sensitive ถูก mask |
| Actions | อยู่ท้ายหน้า; Custom Role แก้ไขและ deactivate/reactivate ตาม status/permission ส่วน System Role ไม่มี mutation action |

**Permissions accordion**

Permissions section ใช้ Phase 1 permission action catalog ใน section 9.2 และ production mapper ต้อง resolve จาก canonical `permission_set` ใน section 9.11. แสดงเฉพาะ permission ที่ Role ได้รับ (`level !== none`) เป็นชื่อ action ภาษาไทยพร้อมเครื่องหมาย ✓ โดย group ตาม Module และ submenu.

- Module group เป็น accordion; ค่าเริ่มต้นขยายทุก group ที่มี granted permission และคง collapse state ระหว่าง session ของ Role เดิม.
- ไม่มี search/filter/sort, permission key, level pill, constraint column หรือรายการ `none` บน Role Detail prototype ปัจจุบัน; ข้อมูล canonical เหล่านี้ยังต้องอยู่ใน service/data contract สำหรับ enforcement และ audit.
- Group ที่ไม่มี granted permission ไม่แสดง; หาก Role ไม่มี granted permission เลย ให้แสดง `Role นี้ยังไม่ได้รับสิทธิ์ใน module ใด` แต่ create/edit validation ปกติต้องกัน permission set ว่างก่อน persist.
- Permission section ไม่มี row action; การแก้ Permission เปิดผ่าน action `แก้ไข` ของ Custom Role เท่านั้น.
- Role Audit History แสดง action กลาง `Create Role`, `Edit Role`, `Deactivate Role`, `Reactivate Role`; การแก้ permission ใช้ label `Edit Role`. ตารางแสดงเหตุผล/ผลลัพธ์แบบอ่านอย่างเดียว ส่วน before/after, target และ immutable reference ยังคงเป็น audit data แต่ไม่แสดงเป็น diff ในตารางนี้.
- Role Detail ไม่มีปุ่ม `ดู Audit Log` และ Role Audit History ไม่มี deep-link ไป central Audit Log ใน Phase นี้.

**Responsive and states**

- ที่ `<= 760px` Detail head และ Role Summary เป็น stacked layout; Permissions คง accordion แบบ grouped action list และ Role Audit History เปลี่ยนจาก table เป็น card layout.
- Loading แสดง skeleton สำหรับ detail head, summary และ permission rows; skeleton ไม่เปิดเผยจำนวนหรือ key ที่ยังไม่ผ่าน permission check.
- กรณีไม่มี granted permission แสดง empty message ของ Permissions; ไม่มี permission search/filter no-result state ใน prototype ปัจจุบัน.
- Role not found, deleted/stale revision หรือ permission denied แสดง full-page state พร้อมกลับ Role List ได้; ห้ามแสดง partial permission data หรือ action mutation.
- Permission data โหลดล้มเหลวแยกจาก role summary ได้: คง detail head ที่ได้รับอนุญาต, แสดง error ใน Permissions section พร้อม `ลองอีกครั้ง`.

**Role Detail acceptance boundary**

- หน้านี้เป็น detail surface ที่เปิด flow แก้ไข/deactivate/reactivate ของ Custom Role ได้ตาม prototype; mutation ทุก flow ต้อง revalidate permission, revision, safeguard, reason/confirmation และ audit ที่ service ก่อน persist.
- ไม่แสดงรายชื่อผู้ดูแล, ไม่ทำ individual permission override และไม่แก้, deep-link หรือเปลี่ยน state ของ `Settings > Admin Accounts`.
- System Role แก้ identity หรือ Permission ไม่ได้; Custom Role action ต้องใช้ revision/safeguard/reason/audit contract ใน section 9.7–9.8 และ lifecycle contract ใน section 9.12 เมื่อเข้าสู่ flow ที่เกี่ยวข้อง.

### 9.11 Role And Admin Account Data Contract

Contract นี้เป็น boundary ระหว่าง Role master กับ Admin Accounts สำหรับ production implementation โดยไม่เปลี่ยน UI/data/flow ของหน้า `Settings > Admin Accounts`. Prototype ปัจจุบันเก็บชื่อ Role ใน `adminAccountData.accounts[].role` และใช้ชื่อเทียบ `roleListData.roles[].name`; รูปแบบนั้นเป็น mock compatibility เท่านั้นและห้ามใช้ชื่อ Role เป็น foreign key ใน production.

**Canonical Role record**

| Field | Type / nullable | Constraint and business rule |
| --- | --- | --- |
| `role_id` | opaque string, required, non-null; รูปแบบ BO ปัจจุบัน `ROL-xxx` | Primary key, immutable, unique, ห้าม reuse; client ต้องไม่แยกความหมายจากลำดับเลข |
| `role_key` | string, required, non-null, trim แล้ว 1–64 chars | ต้องผ่าน `^[a-z0-9_]+$`, unique, immutable; trim ก่อน validate/ตรวจ uniqueness แต่ห้าม silently lowercase input ที่ไม่ผ่าน และห้ามใช้เป็น relational FK |
| `display_name` | string, required, non-null, trim แล้ว 1–64 chars | case-insensitive unique หลัง trim ด้วย Unicode-aware case-insensitive comparison; ไม่ collapse ช่องว่างภายในชื่อ; Custom Role แก้ชื่อได้โดย assignment ไม่เปลี่ยนเพราะอ้าง `role_id` |
| `description` | string, nullable, trim แล้วไม่เกิน 512 chars | ค่า blank หลัง trim persist เป็น null; read model แปลง null เป็นข้อความว่างได้เฉพาะเพื่อ render |
| `role_type` | enum `system` / `custom`, required, non-null | System Role ล็อก identity/permission baseline และห้าม deactivate; Custom Role อยู่ภายใต้ lifecycle/safeguard |
| `status` | enum `active` / `inactive`, required, non-null | มีผลต่อ assignment eligibility; System Role ต้องเป็น `active`; ห้ามใช้ hard delete แทน inactive |
| `revision` | integer, required, non-null, `>= 1` | เริ่ม 1 และเพิ่มครั้งละ 1 เมื่อ `display_name`, `description`, permission set หรือ status เปลี่ยน; ใช้ optimistic concurrency (`expected_revision`) กับ edit/deactivate/reactivate/assign |
| `permission_set` | array ของ `{ permission_key, level }`, required, non-null | เก็บเฉพาะ granted entry; `permission_key` ต้องไม่ซ้ำและต้องอยู่ใน catalog, `level` ต้องเป็น `view` / `manage` / `approve` / `admin`; absence แปล `none` ใน read model และห้าม persist row ระดับ `none` |
| `creation_mode` | enum `system_baseline` / `from_scratch` / `derived` / `copied` / `legacy`, required, non-null | System Role ใช้ `system_baseline`; prototype Create Custom Role ใช้ `from_scratch`; `derived` คือเริ่มจาก source แล้วปรับก่อนสร้าง, `copied` คือ clone permission set ณ source revision, `legacy` ใช้เฉพาะ migration/import |
| `source_role_id` | opaque string, nullable | Self-FK ไป `roles.role_id`; required สำหรับ `derived/copied`, null สำหรับ `system_baseline/from_scratch`; `legacy` ใช้เมื่อพิสูจน์ source ได้เท่านั้น |
| `source_revision` | integer, nullable, `>= 1` เมื่อมีค่า | ต้องมี/ไม่มีพร้อม `source_role_id`; อ้าง immutable source revision ณ ตอนสร้างและห้ามเปลี่ยนตาม source ปัจจุบัน |
| `source_provenance_status` | enum `verified` / `not_applicable` / `legacy_unknown`, required, non-null | `derived/copied` ใช้ `verified`; `system_baseline/from_scratch` ใช้ `not_applicable`; `legacy` ใช้ `verified` เมื่อ source pair พิสูจน์ได้ หรือ `legacy_unknown` เมื่อ source pair เป็น null พร้อม migration audit |
| `created_at`, `updated_at` | server timestamp, required, non-null | เก็บเวลา canonical ตาม platform policy และแสดง Asia/Bangkok |
| `created_by`, `updated_by` | actor reference, required, non-null | ใช้ immutable Admin ID หรือ `System`; ชื่อผู้กระทำเป็น display snapshot ใน audit เท่านั้น |

`permission_set` ต้องมีอย่างน้อย 1 granted entry. Custom Role ห้ามใช้ level `admin` ตาม prototype และเลือกได้เฉพาะ level ที่ permission catalog รองรับสำหรับ key นั้น; `admin` ใช้ได้เฉพาะ approved System Role baseline (ปัจจุบันคือ Super Admin). Unknown key/level, duplicate key, dependency ที่ขาด `.view` หรือ permission ที่ actor ไม่มีสิทธิ์ grant ต้องถูก reject แบบ atomic.

**Relational keys and checks**

| Relation / constraint | Requirement |
| --- | --- |
| `roles` | PK `role_id`; unique indexes บน normalized `role_key` และ normalized `display_name`; CHECK ของ type/status/revision/creation/provenance/source-pair ตามตารางด้านบน |
| `role_permissions` | PK `(role_id, permission_key)`; FK `role_id -> roles.role_id` แบบ `ON UPDATE RESTRICT`, `ON DELETE RESTRICT`; CHECK level เป็น `view/manage/approve/admin`; permission key ต้อง resolve catalog revision ที่ใช้งาน |
| `admin_accounts.role_id` | required, non-null FK ไป `roles.role_id` แบบ `ON UPDATE RESTRICT`, `ON DELETE RESTRICT`; Admin ทุกสถานะรวม Archived ต้องคง reference ที่ตรวจย้อนหลังได้ |
| `roles.source_role_id` | nullable self-FK ไป `roles.role_id` แบบ `ON UPDATE RESTRICT`, `ON DELETE RESTRICT`; source revision ต้อง resolve จาก immutable role-version/audit snapshot |

Role lifecycle ใช้ inactive + immutable history จึงไม่มี cascade delete. หาก implementation แยก `role_versions`, ให้ใช้ composite unique/PK `(role_id, revision)` และผูก `source_role_id + source_revision` กับคู่นี้; หากยังไม่แยกตาราง ต้องบังคับ resolution ผ่าน immutable version/audit store ก่อนรับ source pair.

Creation/provenance CHECK ต้องยอมรับเฉพาะ combination ต่อไปนี้:

| Role / creation mode | Source pair | Provenance |
| --- | --- | --- |
| `system` + `system_baseline` | null ทั้งคู่ | `not_applicable` |
| `custom` + `from_scratch` | null ทั้งคู่ | `not_applicable` |
| `custom` + `derived` หรือ `copied` | non-null ทั้งคู่และ resolve source revision ได้ | `verified` |
| `custom` + `legacy` ที่พิสูจน์ source ได้ | non-null ทั้งคู่และ resolve source revision ได้ | `verified` |
| `custom` + `legacy` ที่พิสูจน์ source ไม่ได้ | null ทั้งคู่ | `legacy_unknown` + migration audit |

Combination อื่นทั้งหมดต้อง reject; `source_role_id` กับ `source_revision` ห้ามมีเพียงค่าเดียว, `source_role_id` ห้ามเท่ากับ `role_id` ของ record ใหม่ และ lineage ห้ามเกิด cycle.

**Admin Account reference**

- Admin Account หนึ่งรายการต้องมี `role_id` เดียว (`many Admin Accounts : one Role`) และ resolve ชื่อ/สิทธิ์จาก Role master; payload write ห้ามรับ `display_name` หรือ `role_key` แทน `role_id`.
- Field `Admin access` ใน `01_AUTHENTICATION_MODULE.md` เป็นชื่อเชิงแนวคิดของ auth contract; ใน production data model ให้ map เป็น `role_id` ตาม section นี้ ไม่ใช่ free-text access label, role name หรือ permission payload ที่ฝังใน Admin Account.
- `admin_accounts.role_id` required สำหรับ `Invited`, `Active`, `Locked`, `Suspended` และ `Archived`; status ไม่ได้ทำให้ FK nullable. Archived account คง reference เพื่อ audit แต่ไม่ได้ authorize session.
- Invite Admin request ต้องส่ง `role_id` และ `expected_role_revision` ของ Role ที่เลือก พร้อม field บัญชีตาม section 8.6 และ invitation idempotency/correlation fields ตาม section 8.9. Service ต้องตรวจ normalized email uniqueness, Role eligibility/revision และ actor permission ก่อนสร้าง account; หาก stale/inactive/invalid ให้ reject ทั้ง account, invitation, assignment, audit และ outbox โดยไม่สร้างข้อมูลบางส่วน. เมื่อผ่านให้สร้าง Admin Account `Invited` + invitation `Pending` ตาม `01_AUTHENTICATION_MODULE.md` section 10.1 แบบ atomic.
- Change Role request ต้องส่ง `target_admin_id`, `expected_target_account_revision` (หรือ concurrency token ที่เทียบเท่า), `expected_current_role_id`, `expected_current_role_revision`, `new_role_id`, `expected_new_role_revision`, `reason_code`, optional `note`, `idempotency_key` และ `correlation_id`. ID/revision/reason/idempotency/correlation เป็น required และ non-null; note เป็น nullable. Service ต้องโหลด Admin Account, current Role และ new Role ล่าสุดแล้วตรวจ account/role safeguards ใน section 9.7 ก่อนเขียน; หาก account revision, current Role ID/revision หรือ new Role revision ไม่ตรงต้อง reject เป็น stale conflict โดยไม่ mutation. `new_role_id` ที่เท่ากับ current Role ต้อง reject เป็น no-op.
- Response สำหรับ list/detail อาจคืน read model `{ role_id, role_key, display_name, role_type, status, revision }` เพื่อแสดงผล แต่ field ที่ซ้ำเป็น snapshot/read model ไม่ใช่ source of truth.
- Authorization ของ request ถัดไปต้อง resolve permission set จาก Role revision ล่าสุดตาม policy; session/token cache ต้องถูก invalidate หรือมีอายุสั้นพอที่จะไม่คงสิทธิ์เดิมหลัง Role assignment, permission, status หรือ revision เปลี่ยน.
- ทุก transition ที่ทำให้ Admin Account เข้า `Active` หรือกลับมามี session ที่ authorize ได้—including invite activation, manual/automatic unlock และ reactivate—ต้องตรวจว่า `role_id` ยังชี้ Role ที่ eligible และ revision/permission set valid ก่อนเสมอ. หากไม่ผ่านให้ block standalone transition; การกู้คืนต้องใช้ governed combined transition ที่เปลี่ยนไป eligible replacement Role และ activate/unlock/reactivate แบบ atomic พร้อม concurrency/safeguard/audit ทั้งสองส่วน ห้าม fallback ไป default Role หรือสิทธิ์เดิมแบบเงียบ.

**Active Admin count**

`active_admin_count` เป็น integer `>= 0` เท่ากับจำนวน Admin Account ที่ `account.status = Active` และ `account.role_id = role.role_id`. ค่านี้เป็น derived aggregate แบบ read-only ไม่เก็บซ้ำใน Role master และไม่นับ `Invited`, `Locked`, `Suspended` หรือ `Archived`. List/detail อาจรับค่าจาก aggregate query/read model ที่มี `calculated_at`; ก่อน deactivate หรือ safeguard decision ต้องคำนวณใหม่ใน transaction ห้ามเชื่อ count จาก client หรือ cache.

`active_admin_count` ใช้แสดงผลเท่านั้น ไม่ใช่ impact set ทั้งหมดของ deactivate. Service ต้องคำนวณ `assigned_admin_count_by_status` เป็น map ที่มี key `Active`, `Invited`, `Locked`, `Suspended`, `Archived` ครบทุก key และ value เป็น integer `>= 0` จาก `role_id` เดียวกัน เพื่อไม่ให้ account ที่ยังอยู่ใน lifecycle ถูกมองข้าม; ผลรวมของ map คือ assignment count ทั้งหมด ณ snapshot นั้น.

**Assignment eligibility**

Role เลือก assign ได้เมื่อ record ยังมีอยู่, `status = active`, revision ตรงกับ request, permission set ผ่าน validation และ actor/target ผ่าน safeguard ทั้งหมด. System และ Custom Role ที่ Active ใช้กฎเดียวกันด้าน reference; Role ที่ `inactive`, stale, invalid หรือหาไม่พบต้องไม่อยู่ใน selector และ API ต้อง reject แม้ client ส่ง ID ตรง. Account status ที่อนุญาตให้ assign/change Role ให้เป็นไปตาม lifecycle ใน section 8 และ safeguard section 9.7; UI visibility ไม่ถือเป็น enforcement.

Admin Accounts prototype ที่ล็อกใน Phase ปัจจุบันยังแสดงเฉพาะ 8 System Role ใน Invite/Change Role selector ตาม section 8.5–8.6. Contract นี้ทำให้ service/data model รองรับ Active Custom Role โดยไม่เปลี่ยน protected UI; การเปิด Custom Role ใน selector ต้องเป็นงาน Admin Accounts แยกที่ได้รับอนุมัติ พร้อม QA safeguard/regression และห้ามตีความ contract นี้เป็นสิทธิแก้หน้าจอเดิมโดยอัตโนมัติ.

**Deactivate and migration behavior**

1. System Role ห้าม deactivate. Custom Role จะ deactivate ได้เมื่อ `expected_revision` ตรง พร้อม reason, confirmation, audit และไม่มี assignment ที่ยังดำเนิน lifecycle ค้างโดยไม่ถูกจัดการ.
2. ก่อน deactivate ต้องคำนวณ assignment ตามสถานะใหม่ใน transaction. `Active` และ `Invited` ต้องถูกย้ายไป replacement `role_id` ที่ eligible ผ่าน governed migration. `Locked` และ `Suspended` ห้ามใช้ standalone Change Role; ต้องจัดการด้วย governed combined lifecycle + Role replacement transaction ตาม activation guard ก่อน หรือ block คำขอ deactivate. `Archived` คง historical `role_id` ได้และไม่ grant permission.
3. Migration plan ต้องระบุ Admin IDs, `expected_target_account_revision`, current `role_id` + `expected_current_role_revision` ของแต่ละ account, replacement `role_id` + `expected_new_role_revision` ที่ eligible และ rollback/correlation reference. ห้าม silent reassignment หรือ fallback ไป default Role.
4. Migration ต้อง revalidate `assigned_admin_count_by_status`, last-Super-Admin/role-manager/recovery coverage และทุก target ใน transaction เดียว. การ reassign ทั้งหมดกับ deactivate ต้อง commit พร้อม audit หรือ rollback ทั้งชุด; core assignment/deactivate result ห้ามเป็น `Partial`.
5. Audit ของ batch ใช้ correlation เดียวกัน: สร้าง `ADMIN_ACCOUNT_ROLE_CHANGE` หนึ่ง event ต่อ Admin Account ที่ย้าย และ `ROLE_DEACTIVATE` หนึ่ง event สำหรับ Role โดยทุก event ต้องสำเร็จก่อน commit. Target entity ใช้ `AdminAccount` สำหรับ assignment event และ `RolePermission` + `role_id` สำหรับ Role lifecycle event ตาม `08_AUDIT_LOG_MODULE.md`.
6. เมื่อ deactivate สำเร็จ status เปลี่ยนเป็น `inactive` และ revision เพิ่ม 1. การ reactivate เพิ่ม revision, เขียน `ROLE_REACTIVATE` และไม่ restore/reassign account อัตโนมัติ.

**Prototype-to-production mapping**

| Prototype mock | Production contract |
| --- | --- |
| `accounts[].role` (ชื่อ Role) | `accounts.role_id` FK; ชื่อมาจาก Role read model |
| `roles[].id` | `role_id` immutable |
| `roles[].name` / `roles[].description` | `display_name` / `description` ตาม validation และ null rule ใน canonical record |
| `roles[].roleKey` | `role_key` immutable |
| `roles[].type` / `status` | enum canonical lowercase; mapper แปลงเป็น label สำหรับ UI |
| `roles[].revision \|\| 1` | `revision` required และห้าม default เงียบเมื่อ persist |
| `rolePermissionCatalog[].perms[].levels[roleKey]` | `permission_set` ผูกด้วย `role_id` + Role revision และใช้ canonical permission key; `role_key` ใช้ lookup/integration เท่านั้น ไม่ใช้เป็น relational foreign key |
| `roleMenuAccess[roleName]` ระดับ `none/view/limited/manage` ใน Admin Detail | Protected display mock แบบ coarse module summary; production ต้อง derive จาก canonical `permission_set` ผ่าน `role_id` ห้าม persist `limited` เป็น permission level. Mapper แสดง `none` เมื่อไม่มี granted key, `view` เมื่อมี read-only เท่านั้น, `manage` เมื่อได้ full module policy และ `limited` เมื่อได้เพียงบาง action/approval ตาม policy |
| Create Custom Role ไม่มี source template/revision | เก็บ `creation_mode=from_scratch`, source ทั้งคู่เป็น null และ `source_provenance_status=not_applicable`; หากอนาคตเปิด derive/copy จึงบังคับ source pair + `verified` |
| Legacy Custom Role ที่ไม่ทราบ source | เก็บ `creation_mode=legacy`, source ที่พิสูจน์ไม่ได้เป็น null และ `source_provenance_status=legacy_unknown` พร้อม migration audit; ห้ามเดาจากชื่อ/permission similarity |
| `countActiveAdminsUsingRole(role.name)` | aggregate ด้วย `role_id` + account status `Active` |
| Permission aliases `roles.view`, `roles.manage`, `admin_accounts.view`, `admin_accounts.manage` | Prototype-only aliases; production normalize เป็น `settings.roles.view`, `settings.roles.manage`, `settings.admin_accounts.view`, `settings.admin_accounts.manage` ก่อน validate/persist/audit และ response ต้องคืน canonical key เท่านั้น |
| Admin Accounts `confirmAdminAccountChangeRole` เปลี่ยน `accounts[].role` ด้วยชื่อทันที | Production ส่ง target-account revision + current/new Role ID/revision ตาม Admin Account reference, revalidate safeguard และ commit assignment + audit แบบ atomic; protected prototype flow ไม่ถูกแก้ใน task นี้ |
| `checkRoleDeactivateImpact` ตรวจ assignment สถานะ `Active`, `Invited`, `Locked`, `Suspended`; `Archived` อย่างเดียวไม่ block | Current prototype ตรงกับ Phase 1 blocking contract; production ยังต้องคำนวณ `assigned_admin_count_by_status` ครบทุกสถานะใน transaction และใช้ governed migration/combined lifecycle ตาม section นี้เมื่อรองรับการย้าย assignment |
| Reactivate modal เปลี่ยน Role `Inactive` → `Active`, validate stored permission set/dependency และระบุว่าไม่ restore/reassign บัญชีหรือสิทธิ์เดิมอัตโนมัติ | Production คง no-auto-reassign/no-auto-permission-change contract; Role ที่ Active กลับมา eligible สำหรับ assignment ใหม่ที่ service/data-contract layer โดยไม่เปลี่ยน protected Admin Accounts UI |
| Role history `actor`/`createdBy`/`updatedBy` อาจเป็น username | Production audit ใช้ immutable `actor_admin_id` เป็น canonical และเก็บชื่อเป็น snapshot เพื่อแสดงผลเท่านั้น |

**Conformance boundary**

- สิ่งที่ตรงกับ prototype: รูปแบบ `ROL-xxx`, `roleKey`, type `system/custom`, status `Active/Inactive`, revision guard ใน edit/deactivate/reactivate (prototype ใช้ default 1), Active Admin count แบบคำนวณสด, reason/confirmation, event `ROLE_CREATE`/`ROLE_UPDATE`/`ROLE_PERMISSION_UPDATE`/`ROLE_DEACTIVATE`/`ROLE_REACTIVATE` และ deactivate blocking สำหรับ assignment สถานะ `Active`/`Invited`/`Locked`/`Suspended`. Protected Admin Accounts UI ปัจจุบันยังมีเฉพาะ 8 System Roles และไม่ได้ implement Custom Role assignment.
- สิ่งที่เป็น production hardening ไม่ได้หมายความว่า prototype ผิด: `role_id` FK แทนชื่อ, stale-write concurrency สำหรับ mutation ของ existing Role, explicit creation/provenance mode, impact ทุก account status, atomic migration/audit, immutable actor ID และ activation/session guard. Create เป็น record ใหม่ที่เริ่ม revision 1 โดยไม่มี existing Role revision ให้เปรียบเทียบ. Implementation ต้องทำตาม production contract นี้โดยคงหน้าตา/interaction ของ protected prototype จนกว่าจะมีงานที่ได้รับอนุมัติให้เปลี่ยน.
- Permission key ใน production ต้องใช้ canonical namespace ของ section 9.2 เท่านั้น. Alias แบบสั้นใน prototype ใช้ได้เฉพาะ adapter/test fixture และห้าม persist, audit หรือส่งออก API; unknown/ambiguous alias ต้อง reject ไม่เดาค่า.
- หาก prototype wording หรือ in-memory behavior ขัดกับ production rule ใน section 9.11 ให้ใช้ section 9.11 สำหรับ data/service persistence และใช้ prototype เป็น source of truth เฉพาะ visual/interaction ที่ล็อกแล้ว; ห้ามใช้ divergence นี้เป็นเหตุแก้ protected Admin Accounts โดยไม่มี approval.

ทุก mutation ต้องเขียน Role/Admin assignment และ audit ตาม section 9.8 ใน transaction เดียว, ใช้ idempotency ป้องกัน retry ซ้ำ และไม่เก็บ secret/token/password ใน event. หน้าจอ Role Detail ใช้ count แบบ read-only ต่อไป; contract นี้ไม่เพิ่ม deep-link, mutation หรือ state change ให้ protected Admin Accounts/Audit Log.

### 9.12 Custom Role Lifecycle Flows

Phase ปัจจุบันรองรับ Create, Edit, Deactivate และ Reactivate Custom Role จาก Role List/Role Detail. System Role เป็น read-only และไม่มี mutation action. ทุก flow ต้องตรวจ `settings.roles.manage` ซ้ำตอนเปิด flow, ก่อนแสดง confirmation และก่อน persist; การซ่อนปุ่มใน UI ไม่ใช่ enforcement.

**Shared form and permission rules**

- Create/Edit ใช้ฟอร์ม `Role ID`, ชื่อ Role, `Role Key`, คำอธิบาย และ Permission picker แบบ checkbox แยก module/submenu. `Role ID` สร้างอัตโนมัติและ read-only; `Role Key` สร้างอัตโนมัติจากชื่อได้จนกว่าผู้ใช้จะแก้เอง และล็อกถาวรหลังสร้าง.
- ชื่อ Role required, trim แล้ว 1–64 ตัวอักษรและ unique แบบ case-insensitive; `Role Key` required, ยาวไม่เกิน 64, ใช้ `^[a-z0-9_]+$`, unique และ immutable; คำอธิบาย optional ยาวไม่เกิน 512; ต้องมี granted permission อย่างน้อย 1 รายการ.
- Permission ที่เป็น action จัดการ/อนุมัติต้องมี permission ดูของกลุ่มเดียวกันก่อน. UI ต้อง lock dependent checkbox จนเลือก view และถอน dependent permission อัตโนมัติเมื่อถอน view.
- Current editor ไม่มี level selector. Permission เดิมที่ยังเป็น non-admin level ซึ่ง catalog รองรับต้องคงระดับเดิมเมื่อแก้ชื่อ/คำอธิบายหรือคง checkbox นั้นไว้; permission ใหม่ใช้ระดับ non-admin ที่ catalog รองรับและต้องไม่สูงกว่า actor permission ceiling. Unknown key/level, `admin` สำหรับ Custom Role, missing dependency, tampered payload หรือ grant/raise เกิน actor ceiling ต้องถูก reject แบบ atomic.
- No-op edit ต้องถูก block ก่อน confirmation พร้อมพาผู้ใช้ไปยังข้อความ `ไม่มีข้อมูลเปลี่ยนแปลง`.
- Create เป็น record ใหม่ จึงไม่มี existing Role revision ให้ compare และไม่ต้องส่ง `expected_revision`; ต้องตรวจ payload, uniqueness, permission dependency และ actor ceiling ซ้ำก่อน persist แล้วสร้างด้วย revision 1.
- Edit/Deactivate/Reactivate เป็น mutation ของ existing Role ต้องตรวจ role type/status, permission, payload และ `expected_revision` ซ้ำก่อน persist; stale revision ต้องถูก reject โดยไม่เกิด partial mutation.
- Phase ปัจจุบันไม่มี source template, `Copy`, `Clone` หรือ `Duplicate Custom Role`. การสร้างใหม่ใช้ `creation_mode=from_scratch`, source pair เป็น null และ `source_provenance_status=not_applicable` เท่านั้น.

**Create Custom Role**

1. เปิดจากปุ่ม `สร้าง Custom Role` ซึ่ง render เฉพาะผู้มี `settings.roles.manage`.
2. เมื่อ validation ผ่าน ให้แสดง confirmation สรุป Role ID, ชื่อ, Role Key, คำอธิบาย, Type, Status และ granted permissions แยก module/submenu; ปุ่มย้อนกลับต้องคงค่าที่กรอก.
3. Create ไม่ขอ user-entered reason; audit context ใช้เหตุการณ์ `ROLE_CREATE` และข้อมูล Role/permission ที่กำลังสร้าง.
4. เมื่อยืนยันสำเร็จ สร้าง Custom Role สถานะ `Active`, revision 1, แสดงใน List/Detail ทันที และเพิ่ม baseline Role Audit History. หากชื่อหรือ Role Key ถูกใช้ระหว่างอยู่หน้า confirmation ให้กลับฟอร์มพร้อม error โดยไม่สร้างข้อมูลบางส่วน.

**Edit Custom Role**

1. เปิดได้สำหรับ Custom Role ทั้ง `Active` และ `Inactive`; System Role หรือข้อมูล type/status ที่ไม่ valid ต้องไม่มี action และ direct flow ต้องถูกปฏิเสธ.
2. Confirmation แสดง revision ถัดไป, before → after ของชื่อ/คำอธิบาย, จำนวน Permission ก่อน/หลัง, รายการสิทธิ์เพิ่ม/ลด และจำนวน Active Admin ที่อาจได้รับผลกระทบ.
3. ต้องระบุเหตุผล 1–512 ตัวอักษรก่อนยืนยัน. บันทึกสำเร็จเพิ่ม revision, updated metadata และ `ROLE_UPDATE` หรือ `ROLE_PERMISSION_UPDATE` ตามสิ่งที่เปลี่ยน.
4. ถ้า revision/status/Role Key เปลี่ยนก่อน persist ให้ปฏิเสธโดยไม่ mutation, บันทึก Failed history ด้วย `STALE_REVISION`, แสดง failure message และเปิดฟอร์มใหม่พร้อม draft กับเหตุผลเดิมเพื่อให้ตรวจข้อมูลล่าสุดก่อนยืนยันซ้ำ.

**Deactivate Custom Role**

1. เปิดได้เฉพาะ Active Custom Role. Modal แสดง target, Role Key, status diff, Active Admin count และจำนวน assignment ที่ต้องจัดการก่อน.
2. Current prototype ต้อง block เมื่อยังมี Admin Account สถานะ `Active`, `Invited`, `Locked` หรือ `Suspended` อ้าง Role นี้; `Archived` คง historical reference ได้และไม่ block. ไม่มี migration action หรือ deep-link ไป Admin Accounts ใน flow นี้.
3. เมื่อไม่มี blocking assignment ให้บังคับเหตุผล 1–512 ตัวอักษรและ confirmation; ก่อน persist ต้องตรวจ revision, assignment impact และ last role-manager/admin-recovery safeguard ซ้ำ.
4. สำเร็จแล้วเปลี่ยนเป็น `Inactive`, เพิ่ม revision/updated metadata และ `ROLE_DEACTIVATE`. Production ที่รองรับ governed migration ให้ใช้ atomic contract ใน section 9.11 แทนการ silent reassign.

**Reactivate Custom Role**

1. เปิดได้เฉพาะ Inactive Custom Role. ต้องตรวจ actor permission, role type/status/revision, permission set, dependency และ level validity ก่อนแสดงและก่อนยืนยัน.
2. Modal แสดง target, status diff, จำนวนบัญชีที่อ้าง Role และผลกระทบ; ต้องระบุเหตุผล 1–512 ตัวอักษร.
3. สำเร็จแล้วเปลี่ยนเป็น `Active`, เพิ่ม revision/updated metadata และ `ROLE_REACTIVATE`; permission set เดิมต้องคงเดิมและห้าม restore/reassign บัญชีหรือสิทธิ์อัตโนมัติ. ใน production/data-contract layer Role จึงกลับมา eligible สำหรับ assignment ใหม่ตาม section 9.11 แต่ current protected Admin Accounts UI ยังเลือกได้เฉพาะ 8 System Roles และไม่ได้ implement Custom Role assignment.

**Cancel, stale, and failure behavior**

- Cancel/close ก่อนยืนยันต้องไม่เปลี่ยน Role, Permission หรือ history.
- Validation, permission, no-op, stale revision, assignment safeguard หรือ audit/persistence failure ต้องไม่เกิด partial mutation.
- List/Detail ต้อง refresh หลังสำเร็จโดยรักษา navigation/filter context ตาม section 9.9; failure ที่กลับไปแก้ไขต้องคงข้อมูลที่ผู้ใช้กรอกเท่าที่ปลอดภัย.

## 10. Security Policy Settings

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

## 11. System Defaults

| Setting | Baseline |
| --- | --- |
| Timezone | `Asia/Bangkok` |
| Currency | THB |
| BO Language | Thai primary; English technical terms allowed |
| Default date range | Applies to Reports/trend views (Phase 2/future) when a screen exposes date controls; Dashboard prototype uses a fixed snapshot with `Last updated` and no Date Range control |
| Table pagination | Server-side pagination for large lists |
| Large export | Background job |
| Sensitive data display | Mask by default |

System defaults ที่กระทบทุก module ต้องแสดง impacted modules ก่อนบันทึก

## 12. Retention Policy Settings

Retention settings ต้องแสดงเป็น policy/config โดยไม่ให้ admin ลบข้อมูลสำคัญแบบ manual

| Data | Baseline / Rule |
| --- | --- |
| Audit log | เก็บอย่างน้อย 1 ปี |
| Security/permission/export events | ควรเก็บนานกว่า 1 ปีถ้า policy อนุญาต |
| Chat / offer records | Open decision ตาม legal/compliance |
| Account deletion archive | ใช้ 30-day grace period ก่อนระบบลบบัญชีอัตโนมัติ (เก็บถาวร + ลบตัวตน ในขั้นเดียว) ตาม FO baseline เว้นแต่ legal เปลี่ยน |
| Export files | ต้องมี expiry |
| Notification delivery logs | ต้องกำหนด retention ตาม report/provider policy |

Retention cleanup ต้องเป็น system job ที่ audit ตัวเอง ห้าม admin ลบ audit record จาก UI ปกติ

## 13. Export Policy Settings

| Setting | Requirement |
| --- | --- |
| Allowed formats | CSV, Excel |
| Large export threshold | ใช้ background job |
| Sensitive export | ต้องมี permission, confirmation, reason และ audit |
| Export expiry | ต้องกำหนดจำนวนวันตาม policy |
| Export download | ต้อง audit download event |
| Export scope | จำกัดตาม admin access และ report/module permission |

Export policy ต้อง sync กับ `15_REPORTS_ANALYTICS_MODULE.md` และ `08_AUDIT_LOG_MODULE.md`

## 14. Feature Flags / Module Availability

Feature flag ใช้เพื่อควบคุม phase/decision เท่านั้น ไม่ใช่เพื่อ bypass business rule

| Feature / Module | Rule |
| --- | --- |
| Directory FO route | Future/postponed from Phase 1; ถ้า FO ยังเป็น placeholder ต้องไม่เปิด production route โดยไม่มี Product decision |
| Broadcast in FO Notification Center | ต้องรอ master decision ก่อนเพิ่ม generic Broadcast type |
| FO Support ticket history | Future scope — module 12 Phase 1 เป็น Policy & Versioning + Support Center; ticket history กลับเข้า Phase ถัดไปเมื่อ ticket queue เปิด scope |
| Market Update notification | Future; ไม่ส่ง FO V1 จนกว่า master เพิ่ม scope |
| Scheduled reports | Future unless Product opens scope |

Feature flag change ต้อง audit และต้องแสดง FO/BO impact ก่อนบันทึก

## 15. Integration Settings

Integration settings ต้องแสดง metadata และสถานะ ไม่เก็บหรือเปิดเผย secret ใน BO UI ปกติ

| Integration | Editable / Visible |
| --- | --- |
| The Watch API | Provider name, sync status, last synced, rate/error status, config metadata |
| Notification provider | Delivery provider status, callback health, non-secret config |
| Export jobs | Queue status, retry policy metadata |
| Import jobs | Dry-run rules, duplicate detection status |
| Map provider | Future only; availability/status only if Directory scope is reopened and uses map |

Secret เช่น API key, provider token, database credentials ต้องอยู่ใน secure secret manager ไม่ใช่ Admin Settings UI

## 16. Delivery Logs

> **Phase 1 scope (NTF-RSTR-001)** — Delivery Logs ย้ายจาก Notifications module เข้ามาอยู่ใต้ Settings; ไม่มี Notifications menu entry ใน sidebar ใน Phase 1 เนื้อหา delivery log fields, status enum, retry rules และ export อิง `14_NOTIFICATIONS_MODULE.md` section 12 (Delivery Log) และ section 13 (Retry Rules); Broadcast/System Templates config เป็น Phase 2/future

Delivery Logs เป็น read-only list แบบเดียวกับ Audit Log / Deletion Requests — full-width panel, ไม่มี KPI cards, มี filter bar, pagination 10/page และ mobile card; row click เปิด read-only detail modal

### 16.1 Delivery Log List

| คอลัมน์ | รายละเอียด |
| --- | --- |
| Delivery ID | รหัส delivery event (เช่น `DLV-DEL-033-REQ`, `DLV-ACCT-010`, `DLV-WA-1050`) |
| Event | ชื่อ event (เช่น Account deletion confirmation email, Account suspension email, Watch alert push notification) |
| Source | แหล่งที่มา (เช่น `DEL-033`, `RPU-560`, `WAL-1050`) |
| Recipient | ผู้รับ (เช่น `U-1104`, `U-1120`) |
| Channel | Email หรือ Push |
| Status | Sent, Retry ใน protected Phase 1 UI; production record เก็บ provider result `Queued/Sent/Delivered/Opened/Failed/Skipped` และ mapper แสดง retryable failure เป็น Retry โดยไม่ทำข้อมูลต้นทางหาย |
| Detail | รายละเอียด/เหตุผล (เช่น "หลัง Admin confirm restore action", "mailbox full — เข้าคิว retry") |

Filter bar: search (Delivery ID, Source, Recipient, Event), filter สถานะ (Sent, Retry), filter channel (Email, Push), sort (ล่าสุด/เก่าสุด), reset ค่าทั้งหมด — ตาม pattern Deletion Requests / Audit Log

### 16.2 Delivery Log Detail Modal

Read-only modal เปิดจาก row click แสดง: Source, Recipient, Channel, Status, Priority, Detail, Tags, Admin note — ตาม pattern option-audit-modal (read-only) ไม่มี action footer

### 16.3 Delivery Log Fields

อิง `14_NOTIFICATIONS_MODULE.md` section 12:

| Field | Requirement |
| --- | --- |
| Delivery ID | รหัส delivery event |
| Notification ID | อ้างถึง broadcast/system notification |
| Notification Type | Broadcast หรือ system trigger type |
| Recipient User ID | ผู้รับ |
| Channel | Push, In-app, Email, Push + In-app |
| Provider | เช่น FCM หรือ email provider ถ้ามี |
| Status | Queued, Sent, Delivered, Opened, Failed, Skipped |
| Failure Reason | Required ถ้า failed/skipped |
| Destination | Deep link / route |
| Created At | เวลาสร้าง |
| Sent At / Delivered At / Opened At | เวลาตาม event |

สำหรับ Admin invitation email ให้ใช้ extension ต่อไปนี้:

| Field | Invitation delivery rule |
| --- | --- |
| Delivery ID | `DLV-ACCT-<admin-sequence>-INV-<attempt-sequence>`; immutable และไม่ reuse |
| Notification ID / Source | ใช้ `invitation_id` เป็น source reference; ไม่ใช้ raw token |
| Notification Type / Event | `AdminInvitationCreated`, `AdminInvitationResent` หรือ `AdminInvitationReissued` |
| Recipient User ID | ใช้ `target_admin_id`; destination email เก็บ/แสดงแบบ mask ตาม privacy policy |
| Status | เก็บ provider status จริง; `Failed` ต้องมี failure category และ `retryable` flag, Phase 1 UI map retryable failure เป็น Retry |
| Correlation | ใช้ `correlation_id` เดียวกับ account/invitation/audit/outbox mutation |
| Sensitive data | ห้ามมี raw/hashed token, password/password hash, OTP, provider credential หรือ idempotency secret |

Delivery tracking target ตาม BO PRD: มากกว่า 95% ของ notification ต้องมี delivery status

### 16.4 Retry Rules

อิง `14_NOTIFICATIONS_MODULE.md` section 13; retry action เข้าถึงได้จาก Settings > Delivery Logs ใน Phase 1:

| Case | Rule |
| --- | --- |
| Temporary provider failure | Retry ได้ตาม exponential/backoff policy |
| Invalid token/device | Mark failed/skipped และไม่ retry จนกว่า token refresh |
| Disabled notification type | ห้าม retry notification ใหม่สำหรับ type นั้น |
| Destination invalid | ห้าม retry จนกว่าข้อมูล destination ถูกแก้ |
| Broadcast already sent | Retry เฉพาะ failed recipients ถ้า policy อนุญาต (Phase 2) |
| System notification duplicate | ต้องมี idempotency key ป้องกันส่งซ้ำ |
| Account suspension email failed | Mark failed, expose retry/admin-visible failure state, and keep account status mutation intact unless product policy requires blocking mutation on delivery failure |
| Admin invitation email failed | คง account `Invited` และ invitation issuance ที่ commit แล้ว, บันทึก Failed/Retry ตาม provider result, retry outbox แบบ idempotent และให้ Resend เมื่อ invitation policy อนุญาต; ห้ามสร้าง account/invitation ซ้ำจาก provider retry |
| Account Deletion lifecycle email failed | Mark failed, expose retry/admin-visible failure state, and keep deletion action mutation intact; อีเมลลบตัวตนแล้วต้องส่งก่อน anonymize — ถ้าส่งไม่สำเร็จต้อง retry ก่อน anonymize personal fields หรือตาม product policy |

Retry action ต้องมี audit log และต้องไม่สร้าง notification ซ้ำใน FO list โดยไม่มี idempotency guard

### 16.5 Export Delivery Log

Export delivery log ต้องมี scope, reason และ audit (`NOTIFICATION_DELIVERY_EXPORT`); ใช้ export policy เดียวกับ section 13 (allowed formats, background job, sensitive export, expiry, download audit, scope)

### 16.6 Cross-Module Reference

- `14_NOTIFICATIONS_MODULE.md` — delivery log fields (section 12), retry rules (section 13), Account Deletion lifecycle email (section 9.3)
- `13_ACCOUNT_DELETION_MODULE.md` — lifecycle email 5 จุดใช้ delivery ID pattern `DLV-DEL-<request-id>-<event>` และ trace กลับไปยัง History & Actions ของ Request Detail
- User Management — account-status email ใช้ delivery ID pattern `DLV-ACCT-xxx` และ trace กลับไปยัง Admin Action History ของรายงาน
- Admin invitation — ใช้ `DLV-ACCT-<admin-sequence>-INV-<attempt-sequence>`, source เป็น `INV-xxxxx` และ trace กลับ Admin Detail History & Actions ตาม section 8.9 และ `01_AUTHENTICATION_MODULE.md` section 10.1
- Dashboard — failed delivery และ delivery rate ของ lifecycle/account-status email (Phase 1)

## 17. Audit & Change History

Admin Settings ต้องมี change history สำหรับ:

- Admin account changes
- Admin Role assignment changes
- Permission changes
- Security policy changes
- System default changes
- Retention/export policy changes
- Feature flag changes
- Integration setting changes

Change history ต้อง link ไป Audit Log detail ตาม permission

## 18. Admin Actions

| Action | Permission | Confirmation | Reason | Audit |
| --- | --- | --- | --- | --- |
| Change own password | All admins | Yes | No | Yes |
| Invite admin | `settings.admin_accounts.manage` | Yes | Optional | Yes |
| Resend invitation | `settings.admin_accounts.manage` | Yes | No | Yes |
| Cancel invitation | `settings.admin_accounts.manage` | Yes | No | Yes |
| Reissue invitation | `settings.admin_accounts.manage` | Yes | No | Yes |
| Change Admin Role | `settings.admin_accounts.manage` | Yes | Required | Yes |
| Suspend/reactivate admin | `settings.admin_accounts.manage` | Yes | Required | Yes |
| Create Custom Role | `settings.roles.manage` | Yes | No user-entered reason; ใช้ generated audit context | Yes |
| Edit Custom Role / Permissions | `settings.roles.manage` | Yes | Required | Yes |
| Deactivate/reactivate Custom Role | `settings.roles.manage` | Yes | Required | Yes |
| Update security policy | Admin | Yes + re-auth | Required | Yes |
| Update retention/export policy | Admin | Yes | Required | Yes |
| Update feature flag | Admin | Yes | Required | Yes |
| Export settings | Admin | Yes | Required if sensitive | Yes |
| Retry failed delivery | Admin | Yes | Required | Yes |
| Export delivery log | Admin | Yes | Required | Yes |

## 19. Audit Requirements

Audit log ต้องบันทึกอย่างน้อย:

- `ADMIN_SETTING_VIEW_SENSITIVE`
- `ADMIN_INVITATION_CREATE` (`ADMIN_ACCOUNT_INVITE` ใช้ได้เฉพาะ prototype compatibility alias และห้าม emit ซ้ำ)
- `ADMIN_INVITATION_RESEND`
- `ADMIN_INVITATION_CANCEL`
- `ADMIN_INVITATION_REISSUE`
- `ADMIN_INVITATION_EXPIRE`
- `ADMIN_INVITATION_ACCEPT`
- `ADMIN_INVITATION_ACTIVATE`
- `ADMIN_INVITATION_DELIVERY_ATTEMPT`
- `ADMIN_ACCOUNT_ROLE_CHANGE`
- `ROLE_CREATE`
- `ROLE_UPDATE`
- `ADMIN_ACCOUNT_SUSPEND`
- `ADMIN_ACCOUNT_REACTIVATE`
- `ADMIN_ACCOUNT_UNLOCK`
- `ADMIN_ACCOUNT_ARCHIVE`
- `ADMIN_EMAIL_OTP_POLICY_UPDATE`
- `ROLE_PERMISSION_UPDATE`
- `ROLE_DEACTIVATE`
- `ROLE_REACTIVATE`
- `SECURITY_POLICY_UPDATE`
- `SYSTEM_SETTING_UPDATE`
- `RETENTION_POLICY_UPDATE`
- `EXPORT_POLICY_UPDATE`
- `FEATURE_FLAG_UPDATE`
- `INTEGRATION_SETTING_UPDATE`
- `ADMIN_SETTINGS_EXPORT`
- `NOTIFICATION_DELIVERY_RETRY`
- `NOTIFICATION_DELIVERY_EXPORT`
- `NOTIFICATION_DELETION_EMAIL_DELIVERY` — การส่งอีเมล lifecycle ของ Account Deletion (reference ไปยัง `ACCOUNT_DELETION_*` audit event ของ `13_ACCOUNT_DELETION_MODULE.md`)

Audit payload กลางต้องมี:

- `setting_key`, `target_admin_id` หรือ `role_id` ตาม target จริง
- `actor_admin_id` หรือ system/job actor ID
- `actor_role_id` และ `actor_role_revision` เมื่อ actor เป็น Admin
- `old_value`
- `new_value`
- `reason` เมื่อ flow/policy บังคับ
- `impact_summary`
- `ip_address`
- `user_agent`
- `created_at`

Invitation audit payload ต้องเพิ่ม `invitation_id`, `target_admin_id`, `invitation_status_before`, `invitation_status_after`, `token_revision` (เลข revision เท่านั้น), `account_revision`, `role_id`, `role_revision`, `correlation_id`, safeguard/quota outcome, `result` และ safe `failure_code` ตาม event. Success กับ rejected/blocked attempt ที่ resolve target ได้ใช้ canonical action event เดียวกันโดยแยก result; malformed/unknown token ที่ resolve target ไม่ได้ใช้ rate-limited security telemetry และห้ามสร้าง target reference. Exact idempotent retry ห้าม emit event ซ้ำ. ห้ามบันทึก raw/hashed token, password/password hash, OTP, destination email แบบไม่ mask, idempotency secret หรือ provider credential

สำหรับ `ADMIN_ACCOUNT_ROLE_CHANGE` ต้องใช้ field contract ใน section 9.8 เพิ่มเติม และต้องเก็บผลของ safeguard ทุกครั้งที่ submit โดย Audit Log แสดง before/after role และ permission diff summary ตามสิทธิ์ของผู้ดู

Sensitive settings value ต้อง mask ใน audit payload ถ้าเป็น secret หรือ high-risk data

## 20. Error, Empty, Loading States

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
| Empty delivery log | แสดง "ไม่พบ delivery log" พร้อมคำแนะนำปรับคำค้นหรือตัวกรอง |
| Provider failed | แสดง failed/retry state และ retry option ตาม permission |
| Invitation stale/race/replay | refresh server context, ไม่ทำ mutation ซ้ำ และแสดง safe state ตาม current invitation/account |
| Invitation cooldown/quota exceeded | disable/reject Resend ตาม `resend_available_at`/rolling quota โดยไม่เปิดเผย hidden abuse threshold |
| Invitation audit/outbox write failed | rollback account/invitation core mutation ทั้งชุด; ห้ามแสดง success |

## 21. Acceptance Criteria

| ID | Criteria |
| --- | --- |
| AC-BO-SET-001 | Admin ทุก admin access เข้าดู own profile/settings และเปลี่ยน password ตาม rule ได้ |
| AC-BO-SET-002 | Admin จัดการ admin account lifecycle ได้โดยไม่กระทบ Admin คนสุดท้าย |
| AC-BO-SET-003 | Roles & Permissions policy กำหนด 8 standard role templates (Super Admin, Admin Manager, Operations Manager, Support Agent, Trust & Safety Moderator, Asset Operations, Content Editor, Content Publisher), canonical taxonomy/levels, baseline matrix และ Phase 1 permission action catalog; Role Detail แสดงเฉพาะ granted action names ส่วน enforcement ใช้ explicit key ทั้ง UI/API/service และห้ามลบ/เปลี่ยน system role identity |
| AC-BO-SET-004 | Permission/security/system/retention/export setting changes ต้องมี confirmation, reason และ audit |
| AC-BO-SET-005 | Security policy ต้องสอดคล้องกับ Auth baseline: email/password only, Email OTP mandatory สำหรับ Admin, idle 8h, max 24h, failed login 5 ครั้ง, lockout 15 นาที |
| AC-BO-SET-006 | Retention settings ต้องไม่อนุญาต manual delete audit logs จาก UI ปกติ |
| AC-BO-SET-007 | Export policy ต้องรองรับ background job, expiry, sensitive export audit และ policy-based scope |
| AC-BO-SET-008 | Feature flags ต้องแสดง FO/BO impact และ audit ทุกครั้ง |
| AC-BO-SET-009 | Integration settings ต้องไม่เปิดเผย secrets ใน BO UI |
| AC-BO-SET-010 | Admin Settings UI ต้อง responsive ที่ 375px, 768px, 1280px และ 1440px |
| AC-BO-SET-011 | Delivery Logs แสดงใต้ Settings ไม่มี Notifications menu entry ใน sidebar ใน Phase 1; row click เปิด read-only detail modal |
| AC-BO-SET-012 | Delivery log เก็บ status (Sent/Retry ใน Phase 1) และ failure reason; retry failed delivery ต้องมี idempotency guard และ audit log |
| AC-BO-SET-013 | Export delivery log ต้องมี scope, reason และ audit (`NOTIFICATION_DELIVERY_EXPORT`) |
| AC-BO-SET-014 | Account Deletion lifecycle email delivery log ใช้รหัส `DLV-DEL-<request-id>-<event>` และ trace กลับไปยัง History & Actions ของ Request Detail ได้ |
| AC-BO-SET-015 | Admin Account List แสดงตาราง 7 คอลัมน์ (Admin ID/Name/Email/Role/Status/Last Login/Action) พร้อม filter bar (search + status + role + sort + reset) และ pagination 10/page โดยไม่มี KPI cards |
| AC-BO-SET-016 | Master admin หลักแสดง Master badge แยกจาก status/role pill และแสดงบนสุดของ list เสมอไม่ว่าจะเรียงด้วย sort ใด |
| AC-BO-SET-017 | Admin Account Detail แสดง Account Summary tiles (Email/Created At/Last Login) + Role & Permissions matrix (เฉพาะเมนูที่ level ≠ none) + History & Actions 5 คอลัมน์ (วันที่/Action/Reference/Audit/รายละเอียด) โดย history แสดงเฉพาะ lifecycle ของ account ตัวเอง ไม่รวมงานใน module อื่น |
| AC-BO-SET-018 | Audit link pill ใน History & Actions คลิกได้และเปิด Audit Log กรองด้วย reference ของ account นั้น; รายการที่ไม่มี audit แสดง `—` |
| AC-BO-SET-019 | Action modals Suspend/Reactivate/Unlock/Archive บังคับเลือก reason (4 reasons ต่อ action) แสดง impact note ตาม action และใช้ confirm tone ที่ถูกต้อง (suspend=danger, reactivate/unlock=primary, archive=warning) พร้อม success toast และ audit event |
| AC-BO-SET-020 | Change Role modal แสดง role ปัจจุบัน disabled, เลือก role ใหม่ยกเว้น role เดิม, บังคับ reason, แสดง permission diff live update, ตรวจ critical role-change safeguards ก่อนยืนยัน และบันทึก audit `ADMIN_ACCOUNT_ROLE_CHANGE` |
| AC-BO-SET-021 | Invite Admin modal ตรวจอีเมล unique, บังคับเลือก role template จาก 8 standard role templates, แสดง Email OTP note และบันทึก audit `ADMIN_ACCOUNT_INVITE` พร้อมสร้าง admin id ใหม่ (`ADM-xxx` ลำดับถัดไป) |
| AC-BO-SET-022 | Permission gating ตาม `canSuspendAdmin`/`canReactivateAdmin`/`canUnlockAdmin`/`canArchiveAdmin`/`canChangeRoleAdmin` — action ที่ไม่อนุญาตต้องไม่ปรากฏใน DOM ทั้งใน row menu และ detail action buttons |
| AC-BO-SET-023 | Master admin หลัก (ADM-010) ห้าม suspend/archive/change role; self ห้าม suspend/reactivate/unlock/archive/change role ตัวเอง; ถ้า active admin เหลือ 1 คน ห้าม suspend (ป้องกันระบบไม่มีผู้ดูแล) |
| AC-BO-SET-024 | Production Role assignment/change ที่ทำให้ไม่มี active `Super Admin`, ไม่มี account ที่จัดการ role ได้, ไม่มี admin recovery coverage, assign Custom Role ที่ inactive/invalid, หรือเปลี่ยน role ตัวเอง/master admin ต้องถูก block ที่ API/service และ UI เมื่อมี surface นั้น พร้อม policy-blocked state และ audit result ตาม policy; current protected Admin Accounts UI ยังรองรับเฉพาะ 8 System Roles |
| AC-BO-SET-025 | ทุกคำขอเปลี่ยน Role สร้าง `ADMIN_ACCOUNT_ROLE_CHANGE` ตาม section 9.8 โดยบันทึก event/reference/correlation, actor, target, before/after Role และ permission diff, reason, safeguard outcome, result และเวลา; การสร้าง/แก้ไข/ปิดใช้งาน/เปิดใช้งาน Role ใช้ `ROLE_CREATE`/`ROLE_UPDATE`/`ROLE_PERMISSION_UPDATE`/`ROLE_DEACTIVATE`/`ROLE_REACTIVATE` ตามข้อมูลเฉพาะ; audit write ต้องสำเร็จก่อน commit mutation และไม่มี secret/token/password ใน payload |
| AC-BO-SET-026 | Role List แสดง 8 คอลัมน์ Role ID/Role/Type/Status/Detail/Admins/Last Updated/Action, ค้นหาและกรองตาม section 9.9, sort Role ID เป็น default, ไม่มี KPI cards หรือ list-detail split, แยก System/Custom Role ชัดเจน, คง filter state เมื่อกลับจาก detail และ responsive เป็น mobile card ที่ `<= 760px` |
| AC-BO-SET-027 | Role Detail แสดง detail head, Role Summary 4 tiles, granted Permissions แบบ accordion แยก module/submenu, Role Audit History 5 คอลัมน์ และ action ท้ายหน้า; responsive เป็น stacked layout/history cards ที่ `<= 760px`, ไม่แสดง permission `none`, ไม่รองรับ individual permission override หรือ Admin Accounts drill-in |
| AC-BO-SET-028 | Production เชื่อม Admin Account กับ Role ด้วย immutable `role_id` ไม่ใช้ชื่อ Role, บังคับ `role_key`/type/status/revision และ target-account concurrency contract, แยก Active display count จาก assignment impact ทุก account status, reject assignment/activation ที่ inactive/stale/invalid, ไม่เดา source template ของ legacy Custom Role และบังคับ governed atomic migration พร้อม correlated per-account/Role audit ก่อน deactivate ตาม section 9.11 |
| AC-BO-SET-029 | Create/Edit Custom Role ใช้ form + confirmation ตาม section 9.12 และ validate ชื่อ/Role Key/คำอธิบาย/permission dependency/permission ceiling; Create สร้าง record ใหม่ revision 1 โดยไม่ใช้ `expected_revision` ของ existing Role; Edit คง valid existing permission level, block no-op/stale revision โดยไม่เกิด partial mutation และรองรับทั้ง Active/Inactive Custom Role |
| AC-BO-SET-030 | Deactivate ต้อง block assignment สถานะ Active/Invited/Locked/Suspended จนจัดการแล้วและ recheck safeguard ก่อน persist; Reactivate ต้อง validate permission set, คง permission เดิม และห้าม restore/reassign account อัตโนมัติ; ทั้งสอง flow บังคับ reason/confirmation/revision/audit |
| AC-BO-SET-031 | Phase ปัจจุบันไม่มี `Copy`, `Clone`, `Duplicate`, source-template selector หรือ `ดู Audit Log` action ใน Role List/Detail; Role history อ่านจาก read-only Role Audit History ใน Role Detail และการสร้างใหม่ใช้ `from_scratch` เท่านั้น |
| AC-BO-SET-032 | Production Invite Admin สร้าง normalized unique account `Invited`, eligible Role assignment, invitation `Pending`, audit และ transactional outbox แบบ atomic โดยไม่มี temporary password; protected prototype ถูกระบุเป็น mock/UI baseline แยกจาก enforcement จริง |
| AC-BO-SET-033 | Admin Detail invitation capabilities ต้องมาจาก server และ Resend/Cancel/Reissue แสดงเฉพาะ state/permission ที่อนุญาต; direct route/API/service mutation ที่ unauthorized, stale หรือ ineligible ต้อง reject โดยไม่เกิด partial mutation |
| AC-BO-SET-034 | Resend ใช้ cooldown 60 วินาทีและ quota 5 successful issuances/rolling 24h ต่อ target account, supersede active token เดิม; Cancel คง account `Invited`; Reissue สร้าง revision ถัดไปหลัง Expired/Cancelled |
| AC-BO-SET-035 | Invitation email ทุก attempt ใช้ Delivery ID `DLV-ACCT-<admin-sequence>-INV-<attempt-sequence>`, trace `invitation_id`/Admin Detail/Audit ได้ และ provider failure คง account `Invited` พร้อม Failed/Retry state โดยไม่สร้าง account/invitation ซ้ำ |
| AC-BO-SET-036 | Invitation lifecycle audit ใช้ canonical events/immutable IDs/revisions/correlation ตาม section 8.9/19 และ Audit/Delivery payload ห้ามมี raw/hashed token, password/password hash, OTP หรือ secret |

## 22. Open Decisions

| ID | Decision Needed | Impact |
| --- | --- | --- |
| SET-DEC-002 | Security policy fields ใดให้ Admin แก้ได้จริงใน production | กระทบ compliance และ operation |
| SET-DEC-003 | Retention period ราย entity เช่น chat, offer, export file ต้องเก็บกี่วัน/ปี | กระทบ archive/export/report jobs |
| SET-DEC-004 | ต้องมี approval workflow สำหรับ high-risk setting change หรือไม่ | กระทบ admin operation และ audit |
