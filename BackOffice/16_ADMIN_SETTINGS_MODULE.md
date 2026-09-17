# 16 BO Admin Settings Module

**Version:** `BO-16-v0.7`
**Date:** 2026-09-17
**Status:** Updated — Role-change audit record defined
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
| Version | `BO-16-v0.7` |
| Status | Updated — Role-change audit record defined |
| Owner | Product / UX / Engineering / Operations |
| Document Type | Functional PRD |

## 2. Objective

Admin Settings Module ใช้สำหรับตั้งค่าและตรวจสอบ configuration ระดับ Back Office ได้แก่ admin account settings, Roles & Permissions matrix, security settings, system defaults, retention/export policy และ operational settings ที่มีผลต่อการทำงานของ BO

Module นี้ต้องไม่เป็นทางลัดเพื่อข้าม admin access control, audit, privacy หรือ FO sync rule ที่ระบุใน Global Rules และแต่ละ module

## 3. Scope

### In Scope

- Admin profile และ own security settings
- Admin account management shortcut / settings view
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

Settings submenu ใน prototype (`../Prototypes/bo-prototype.html` บรรทัด 15944) มี 6 รายการสอดคล้องกับ Phase 1 scope ส่วน section อื่นในเอกสารนี้ยังคงเป็น policy/contract baseline แต่ยังไม่ implement ใน prototype และทำเครื่องหมาย future/deferred ไว้ใน 6.2

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

Admin Accounts section ต้อง reuse contract จาก `01_AUTHENTICATION_MODULE.md` และสอดคล้องกับ prototype ADM-PTO-001 (`../Prototypes/bo-prototype.html` บรรทัด 16985–23138) ที่ lock แล้ว 2026-09-15

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

**ตาราง 7 คอลัมน์** (prototype บรรทัด 22553):

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

**Filter bar** (prototype บรรทัด 22513–22520):
- เปิด/ปิดตัวกรอง toggle
- Search: Admin ID, ชื่อ, อีเมล, Role
- Filter account status: Invited / Active / Locked / Suspended / Archived
- Filter role: 8 standard role templates ตาม section 9.1
- Sort: latest (default) / oldest / name / status
- รีเซ็ตค่าทั้งหมด (reset icon button)

**Sort behavior** (prototype บรรทัด 22540–22546): master admin หลักแสดงบนสุดเสมอ ไม่ว่าจะเรียงด้วยอะไร

**Pagination**: 10/page (ตาม `adminAccountListPageSize`) + footer range + pager

**Row menu** (prototype บรรทัด 22576–22586): ดูรายละเอียด (ทุกแถว) + action ตาม permission gating (section 8.7) — action ที่ไม่อนุญาตไม่แสดงใน DOM

**Mobile card** (prototype บรรทัด 22560–22568): แสดง tags (status pill + role pill + Master badge ถ้ามี) + meta (Name / Email / Last Login) ไม่มีกรอบปุ่ม ... แยกต่างหาก

**Empty state** (prototype บรรทัด 22555): "ไม่พบ admin account" + "ลองปรับคำค้นหรือตัวกรอง แล้วลองใหม่"

**Add admin entry**: ปุ่ม "Add admin" ที่ `#page-actions` (prototype บรรทัด 22499) เปิด Invite Admin modal (section 8.6)

**Filter state persistence**: เก็บสถานะ filter เมื่อ detail→back แต่ถูกล้างเมื่อสลับ module (ตาม `restoreListFilterState("admin-account-list")`)

### 8.3 Admin Account Detail

Pattern: full-width detail ตาม Deletion Request Detail (prototype บรรทัด 22599–22745) — body class `admin-account-detail-mode` (ไม่ใช้ `user-detail-mode` เพื่อไม่กระทบ protected screens)

**Detail head** (prototype บรรทัด 22726–22737):
- `ADM-xxx : fullName` (heading)
- Status pill + Role pill + Master badge (ถ้าเป็น master) ใน chips

**Section 1: Account Summary** (prototype บรรทัด 22652–22661) — 3 tiles:
- Email
- Created At
- Last Login

**Section 1.5: Role & Permissions** (prototype บรรทัด 22663–22686) — matrix 3 คอลัมน์:
- เมนู / Module
- สิทธิ์ (pill: green=จัดการ, amber=จัดการบางส่วน, blue=ดูอย่างเดียว)
- หมายเหตุ

แสดงเฉพาะเมนูที่ `level !== "none"` (เมนูที่ role นี้ไม่เห็นไม่แสดง) อ้างอิง `roleMenuAccess` (prototype บรรทัด 22401–22457)

**Section 2: History & Actions** (prototype บรรทัด 22688–22721) — ตาราง 5 คอลัมน์:
- วันที่ / เวลา
- Action
- Reference (ใครเป็นคนทำ action นี้กับ account — ADM-xxx หรือ System)
- Audit (รหัส audit event, คลิกเปิด Audit Log กรองด้วย reference — ไม่มีแสดง `—`)
- รายละเอียด

แสดงเฉพาะ lifecycle ของ account ตัวเอง (เรียงล่าสุดก่อน): Status change (Suspend/Reactivate/Unlock/Lock/Archive/Role change) → Activated → Invited/Created — ไม่รวมงานที่ admin ไปทำใน module อื่น (มี history แยกใน module ของมัน) ตาม prototype comment บรรทัด 16999–17001

**Action buttons** (prototype บรรทัด 22633–22648): แสดงตาม permission gating (section 8.7) ที่ส่วนล่างของ History & Actions section — action ที่ไม่อนุญาตไม่แสดงใน DOM

**Back button**: ปุ่ม "กลับไป Admin Accounts" ที่ `#page-actions` (prototype บรรทัด 22623)

### 8.4 Action Modals (Suspend / Reactivate / Unlock / Archive)

Pattern: `renderAdminAccountActionModal` (prototype บรรทัด 22846–22905) คล้าย `renderDeletionActionModal`

**Modal structure**:
- Head: title + summary + close button
- Target: fullName + id · email + status pill
- Form: reason selector (required) + note (ไม่บังคับ) + impact note + ปุ่มยืนยัน/ยกเลิก
- Result state: success message + timestamp (หลังยืนยัน)

**Action config** (prototype บรรทัด 22748–22813):

| Action | Title | Tone | Audit type | Impact note |
| --- | --- | --- | --- | --- |
| suspend | Suspend Admin | danger | `ADMIN_ACCOUNT_SUSPEND` | เข้าสู่ระบบไม่ได้ทันที และ session ถูกยกเลิก |
| reactivate | Reactivate Admin | primary | `ADMIN_ACCOUNT_REACTIVATE` | กลับเข้าสู่ระบบได้ตามปกติ |
| unlock | Unlock Admin | primary | `ADMIN_ACCOUNT_UNLOCK` | กลับเข้าสู่ระบบได้ทันที ไม่ต้องรอ lockout หมดอายุ |
| archive | Archive Admin | warning | `ADMIN_ACCOUNT_ARCHIVE` | บัญชีปิดใช้งาน แต่ยังเก็บประวัติไว้ตามกำหนดเก็บรักษา |

**Reason selector**: required (placeholder "เลือกเหตุผล" + 4 reasons ตาม config ต่อ action) — บังคับเลือกก่อนยืนยัน

**Reasons ต่อ action** (prototype บรรทัด 22754–22759, 22770–22775, 22786–22791, 22802–22807):
- suspend: ตรวจพบการเข้าถึงข้อมูลนอก scope / พฤติกรรมละเมิดนโยบาย BO / รอตรวจสอบ security incident / คำขอจากผู้บริหาร/HR
- reactivate: ตรวจสอบเสร็จแล้ว ไม่พบความผิด / ได้รับอนุมัติให้กลับมาใช้งาน / สิ้นสุดช่วงรอตรวจสอบ / คำขอจากผู้บริหาร/HR
- unlock: ยืนยันตัวตนกับ admin แล้ว / ตรวจสอบแล้วไม่พบความเสี่ยง / รอครบช่วง lockout 15 นาทีแล้ว / คำขอจากผู้บริหาร/HR
- archive: ออกจากทีมแล้ว / ย้ายไปทีมอื่น / สิ้นสุดการจ้างงาน / คำขอจากผู้บริหาร/HR

**Impact note** (prototype บรรทัด 22821–22834): แสดงผลกระทบตาม action ในกล่อง warning

**Email note** (prototype บรรทัด 22836–22843): `renderAdminAccountActionEmailNote` define ไว้แต่ไม่เรียกใน modal (ไม่มี email note ใน action modal จริง)

**Confirm tone**: suspend=danger / reactivate=primary / unlock=primary / archive=warning (กำหนด class ของปุ่มยืนยัน)

**Success flow**: หลังยืนยัน → แสดง success toast + บันทึก audit event (`ensureAdminAccountAuditEvent` prototype บรรทัด 23065) + re-render list/detail

### 8.5 Change Role Modal

Pattern: `openAdminAccountChangeRoleModal` (prototype บรรทัด 22908–22987) คล้าย action modal + before/after diff

**Form fields**:
- Role ปัจจุบัน: disabled input (แสดง role เดิม)
- Role ใหม่: required selector (เลือก role ใหม่ — ยกเว้น role ปัจจุบัน, ใช้ 8 standard role templates จาก `roleMenuAccess`)
- เหตุผลการเปลี่ยน Role: required selector (4 reasons: ย้ายทีม/เปลี่ยนหน้าที่งาน / ได้รับอนุมัติจากผู้บริหาร / ปรับ scope ความรับผิดชอบตามโครงสร้างใหม่ / คำขอจากผู้บริหาร/HR)
- Note / หมายเหตุ: ไม่บังคับ

**Permission diff** (prototype บรรทัด 22970): แสดง "เปลี่ยนสิทธิ: <role เดิม> → <role ใหม่>" ในกล่อง warning — อัปเดต live เมื่อเลือก role ใหม่

**Safeguard validation**: ก่อนเปิดให้ยืนยัน ต้องตรวจ rule ใน section 9.7 ทุกครั้ง โดยเฉพาะ self-change, master admin, last Super Admin / last admin-capable account, downgrade จาก role ที่มีสิทธิ์จัดการ role, และสถานะ account ที่ไม่อนุญาตให้เปลี่ยน role; ถ้าไม่ผ่านต้องไม่บันทึก mutation และต้องแสดง policy-blocked state แทนการเปลี่ยน role

**Confirm**: ปุ่ม "ยืนยันเปลี่ยน Role" (warning tone) + บันทึก audit event `ADMIN_ACCOUNT_ROLE_CHANGE` (`ensureAdminAccountRoleChangeAuditEvent` prototype บรรทัด 23120) + re-render list/detail

### 8.6 Invite Admin Modal

Pattern: `openAdminAccountInviteModal` (prototype บรรทัด 22991–23045) คล้าย Option Master Add Option modal

**Form fields** (required มีเครื่องหมาย `*`):
- ชื่อ-นามสกุล: required
- อีเมล: required + unique (`isAdminAccountEmailUnique` prototype บรรทัด 23048 — ตรวจซ้ำกับ admin ที่มีอยู่แล้ว)
- Role Template: required selector (8 standard role templates ตาม section 9.1)
- Note / หมายเหตุ: ไม่บังคับ

**Email OTP note** (prototype บรรทัด 23034–23036): "ผู้รับต้องยืนยันตัวตนด้วย Email OTP ทุกครั้งที่เข้าสู่ระบบ"

**Confirm**: ปุ่ม "ส่งคำเชิญ" (primary tone) + สร้าง admin id ใหม่ (`nextAdminAccountId` prototype บรรทัด 23054 — `ADM-xxx` ลำดับถัดไป) + บันทึก audit event `ADMIN_ACCOUNT_INVITE` (`ensureAdminAccountInviteAuditEvent` prototype บรรทัด 23096) + re-render list

### 8.7 Permission Gating

Pattern: `can*Admin` functions (prototype บรรทัด 22463–22496) — action ที่ไม่อนุญาตไม่แสดงใน DOM (ทั้ง row menu และ detail action buttons)

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
| Invite Admin | Admin | Yes | Optional | Yes (`ADMIN_ACCOUNT_INVITE`) |
| Change Admin Role | Admin | Yes | Required | Yes (`ADMIN_ACCOUNT_ROLE_CHANGE`) |
| Suspend Admin | Admin | Yes | Required | Yes (`ADMIN_ACCOUNT_SUSPEND`) |
| Reactivate Admin | Admin | Yes | Required | Yes (`ADMIN_ACCOUNT_REACTIVATE`) |
| Unlock Admin | Admin | Yes | Required | Yes (`ADMIN_ACCOUNT_UNLOCK`) |
| Archive Admin | Admin | Yes | Required | Yes (`ADMIN_ACCOUNT_ARCHIVE`) |
| Export Admin List | Admin | Yes | Required if sensitive | Yes |

ต้องป้องกันการเปลี่ยนแปลง Admin คนสุดท้ายตาม rule ใน section 4 และ permission gating ใน section 8.7

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
| Content Editor | สร้าง/แก้ draft, category, metadata และ preview content ใน Content Management | ไม่มีสิทธิ์ publish, schedule, archive, restore หรือจัดการ reported Board แบบปิดเคส |
| Content Publisher | publish, schedule, archive, restore content และจัดการ reported Board content ตาม policy | ไม่มีสิทธิ์แก้ Admin Settings, user/account status, asset moderation หรือ sensitive reveal/export นอก content scope |

Role templates are presets. Production enforcement must use explicit permission keys at route, navigation, UI action, API, service, export, sensitive-field, and audit layers. The Roles & Permissions screen may later support Custom Role, but the 8 standard templates above are system roles: they cannot be deleted, cannot be renamed, and cannot have their system identity changed. If a standard role does not fit a team, create a Custom Role derived from it instead of editing the system role identity.

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
| Settings/admin | `settings.admin_accounts.manage`, `settings.roles.manage`, `settings.security.update`, `settings.retention.update`, `settings.delivery.retry` | เปลี่ยน admin lifecycle, role/permission, security, retention/export policy และ retry delivery |
| Audit visibility | `audit.view`, `audit.detail`, `audit.export`, `audit.sensitive_payload.view` | อ่าน audit list/detail, export audit และเห็น payload ที่ sensitive |

Permission result has 5 levels:

| Level | Meaning | UI behavior |
| --- | --- | --- |
| `none` | ไม่มีสิทธิ์ | ซ่อนเมนู/action; direct URL/API ต้องถูกปฏิเสธ |
| `view` | ดู list/detail ได้ | แสดงข้อมูลตาม masking policy; ไม่มี mutation |
| `operate` | ทำงานปกติใน scope ได้ | เปิด action ที่ matrix อนุญาต พร้อม validation/audit ตาม module |
| `approve` | ทำ action high-risk หรือ publish/close ได้ | ต้องมี confirmation, reason, before/after diff และ audit |
| `admin` | จัดการ settings/role/policy ได้ | ใช้เฉพาะ role ที่ได้รับอนุญาตและต้องมี safeguard เพิ่มเติม |

### 9.3 Baseline Permission Matrix By Role

Matrix นี้เป็น baseline กลางสำหรับ 8 standard role templates. Custom Role ต้อง derive จาก role template หนึ่ง แล้วเพิ่ม/ลด permission key แบบ explicit เท่านั้น ห้ามผูกสิทธิ์เฉพาะรายบุคคลกับ Admin account โดยตรง.

| Area / permission scope | Super Admin | Admin Manager | Operations Manager | Support Agent | Trust & Safety Moderator | Asset Operations | Content Editor | Content Publisher |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Dashboard / global queues | admin | view | operate | view | operate | operate | view | view |
| User Management | admin | view | operate | view | operate | view | none | none |
| User sensitive reveal / export | admin | none | approve | none | view | none | none | none |
| Asset List / Asset Detail | admin | view | operate | view | operate | operate | view | view |
| Asset moderation / reported assets | admin | none | approve | none | approve | operate | none | none |
| Reported comments | admin | none | approve | none | approve | operate | none | none |
| Content articles/categories draft | admin | none | view | none | operate | none | operate | operate |
| Content publish/schedule/archive/restore | admin | none | view | none | approve | none | none | approve |
| Reported Board moderation | admin | none | view | none | approve | none | view | approve |
| Market Data catalog | admin | none | view | none | view | view | none | none |
| Market Data import/sync/update | admin | none | approve | none | none | none | none | none |
| Offer Management | admin | view | view | view | view | view | none | none |
| Market Demand / Watch Alerts | admin | view | view | view | view | view | none | none |
| Policy & Versioning | admin | approve | view | none | view | none | view | approve |
| Support Center settings | admin | approve | view | operate | view | none | none | none |
| Account Deletion requests | admin | view | approve | view | approve | none | none | none |
| Delivery Logs | admin | operate | view | view | view | view | none | none |
| Retry failed delivery | admin | approve | none | operate | none | none | none | none |
| Audit Log list/detail | admin | view | view | none | view | none | none | none |
| Audit sensitive payload / export | admin | none | none | none | none | none | none | none |
| Admin Accounts lifecycle | admin | approve | none | none | none | none | none | none |
| Roles & Permissions management | admin | approve | none | none | none | none | none | none |
| Security / retention / export policy | admin | approve | none | none | none | none | none | none |

### 9.4 Permission Rule Notes

- `Super Admin` is the only standard role with full `admin` coverage, but it is still subject to self-change, master, last-active-admin, confirmation, reason, and audit safeguards.
- `Admin Manager` can manage admin lifecycle and role/policy changes, but cannot bypass Super Admin/master protection, cannot view audit sensitive payload by default, and cannot delete audit trail.
- `Operations Manager` can operate across queue-heavy modules but cannot change Admin Settings, Roles & Permissions, security policy, audit payload visibility, or system role identity.
- `Support Agent` is intentionally read-heavy. It may use support and delivery-retry actions needed for user assistance, but cannot mutate user/account/asset status or reveal full sensitive data.
- `Trust & Safety Moderator` can close moderation cases for user/asset/comment/board reports with required reason, impact note, confirmation, FO-impact handling, and audit.
- `Asset Operations` focuses on asset lifecycle review and asset-related moderation. It cannot publish content, change Market Data master data, or manage settings.
- `Content Editor` can create/update draft content and preview within content scope only. Publish, schedule, archive, restore, reported Board case close, export, and settings are blocked.
- `Content Publisher` can publish/schedule/archive/restore content and close content/report cases inside content scope, but cannot edit Admin Settings or act on user/account/asset status.
- Any `sensitive.reveal`, `export`, `download`, `case.close`, `status.update`, `publish`, `archive`, `restore`, `roles.manage`, or security/retention policy update must be independently auditable even when the role has the required permission.

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

Role change is a high-risk account lifecycle action. UI hiding is only a presentation layer; the same safeguards must be enforced at route, API, service, and persistence layers before the role value is changed.

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
| ผู้ดำเนินการ | `actor_admin_id`, `actor_name`, `actor_role`, `actor_type`, `ip_address`, `user_agent`, `session_id` หรือ session reference | ระบุผู้ยืนยัน action จริง ไม่ใช้ข้อมูลจาก target แทน actor; `ip_address`/`user_agent` ถูกจำกัดการเข้าถึงตาม audit visibility policy |
| ผู้ถูกเปลี่ยน Role | `target_admin_id`, `target_name`, `target_account_status`, `target_is_master` | เก็บ snapshot ขณะตรวจ safeguard เพื่ออธิบายว่าทำไม action ผ่านหรือถูก block |
| การเปลี่ยนแปลง | `old_role_id`, `old_role_name`, `old_role_type`, `new_role_id`, `new_role_name`, `new_role_type`, `permission_diff` | ต้องเก็บ before/after ของ Role และ summary ของ permission ที่เพิ่ม/ลด/คงเดิม; Custom Role ต้องระบุ version หรือ immutable revision reference ของ template ที่ถูกเลือก |
| เหตุผลและบริบท | `reason_code`, `reason_label`, `note`, `impact_summary`, `confirmation_version` | `reason_code` เป็น required; `note` เก็บเมื่อผู้ดำเนินการระบุ; `confirmation_version` ชี้ข้อความยืนยัน/นโยบายที่ใช้ ณ เวลานั้น |
| ผลตรวจและผลลัพธ์ | `safeguard_checks`, `decision`, `result`, `failure_code`, `failure_detail`, `persisted_at` | `safeguard_checks` ระบุผลของ rule ที่เกี่ยวข้อง; `decision` เป็น `Allowed` หรือ `Blocked`; `result` ใช้เฉพาะ `Success`, `Failed` หรือ `Partial` ตาม Audit Log contract; `persisted_at` มีเฉพาะเมื่อเปลี่ยน Role สำเร็จ |

กติกา result:

- `Success`: บันทึก before/after ครบ, audit write สำเร็จ และ role ใหม่ถูก persist แล้ว
- `Blocked`: ตั้ง `decision: Blocked` และ `result: Failed` โดยไม่เปลี่ยน Role; เก็บ actor/target/role เดิม, requested role และ reason เฉพาะที่มีอยู่จริง พร้อม `failure_code` ของ safeguard ที่ block ห้ามเดาหรือเติม role/reason ที่ผู้ใช้ยังไม่ได้เลือก
- `Failed`: ผ่านการตรวจหรือเริ่ม persist แล้วแต่ transaction/audit write ล้มเหลว; เก็บข้อมูลที่ปลอดภัยสำหรับ trace และต้องไม่เหลือ role เปลี่ยนครึ่งทาง
- `Partial`: ใช้ได้เฉพาะกรณีผลข้างเคียงที่ไม่ใช่การเปลี่ยน Role ล้มเหลวหลัง transaction หลักสำเร็จ; ห้ามใช้แทน `Success` เมื่อ audit write หรือ role persistence ไม่สมบูรณ์

ก่อนแสดงใน Audit Log ให้ mask ข้อมูลเครือข่าย/session และไม่เก็บ secret, token, password หรือ permission payload ที่เกิน audit visibility ของผู้ดู หาก retry request เดิม ให้ใช้ `correlation_id`/idempotency key เดิมและไม่สร้างการเปลี่ยน Role ซ้ำ; การ retry ที่ไม่ทำ mutation ใหม่อาจบันทึก attempt เพิ่มได้ แต่ต้องอ้าง event หลักเดิมชัดเจน

การสร้าง แก้ไข และปิดใช้งาน Role template/Custom Role ใช้ field กลางข้างต้นตามที่เกี่ยวข้อง และต้องบันทึก event เพิ่มเติมดังนี้:

| เหตุการณ์ | Event type | ข้อมูลเฉพาะที่ต้องมี |
| --- | --- | --- |
| สร้าง Custom Role | `ROLE_CREATE` | `role_id`, `role_name`, `role_type`, source template/revision, permission set เริ่มต้น, creator และ result |
| แก้ไขชื่อ คำอธิบาย หรือ Permission ของ Custom Role | `ROLE_UPDATE` หรือ `ROLE_PERMISSION_UPDATE` | `role_id`, before/after ของ field ที่เปลี่ยน, permission added/removed/changed, reason, affected-admin count และ result |
| ปิดใช้งานหรือเปิดใช้งาน Custom Role | `ROLE_DEACTIVATE` หรือ `ROLE_REACTIVATE` | `role_id`, old/new status, reason, affected Admin accounts, migration/rollback reference และ result |

System Role ห้ามเปลี่ยน identity; attempt ที่ถูก block ต้องใช้ event type ของคำขอที่เกี่ยวข้องพร้อม `decision: Blocked`, `result: Failed` และ `failure_code` ตาม safeguard โดยไม่บันทึก mutation ที่ไม่เกิดขึ้น

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
| Fine-grained permission editor | Future unless Product opens scope |

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
| Status | Sent, Retry (Phase 2 จะเพิ่ม Queued, Delivered, Opened, Failed, Skipped) |
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
| Account Deletion lifecycle email failed | Mark failed, expose retry/admin-visible failure state, and keep deletion action mutation intact; อีเมลลบตัวตนแล้วต้องส่งก่อน anonymize — ถ้าส่งไม่สำเร็จต้อง retry ก่อน anonymize personal fields หรือตาม product policy |

Retry action ต้องมี audit log และต้องไม่สร้าง notification ซ้ำใน FO list โดยไม่มี idempotency guard

### 16.5 Export Delivery Log

Export delivery log ต้องมี scope, reason และ audit (`NOTIFICATION_DELIVERY_EXPORT`); ใช้ export policy เดียวกับ section 13 (allowed formats, background job, sensitive export, expiry, download audit, scope)

### 16.6 Cross-Module Reference

- `14_NOTIFICATIONS_MODULE.md` — delivery log fields (section 12), retry rules (section 13), Account Deletion lifecycle email (section 9.3)
- `13_ACCOUNT_DELETION_MODULE.md` — lifecycle email 5 จุดใช้ delivery ID pattern `DLV-DEL-<request-id>-<event>` และ trace กลับไปยัง History & Actions ของ Request Detail
- User Management — account-status email ใช้ delivery ID pattern `DLV-ACCT-xxx` และ trace กลับไปยัง Admin Action History ของรายงาน
- Dashboard — failed delivery และ delivery rate ของ lifecycle/account-status email (Phase 1)

## 17. Audit & Change History

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

## 18. Admin Actions

| Action | Permission | Confirmation | Reason | Audit |
| --- | --- | --- | --- | --- |
| Change own password | All admins | Yes | No | Yes |
| Invite admin | Admin | Yes | Optional | Yes |
| Change Admin Access | Admin | Yes | Required | Yes |
| Suspend/reactivate admin | Admin | Yes | Required | Yes |
| Update Roles & Permissions Matrix | Admin | Yes | Required | Yes |
| Update security policy | Admin | Yes + re-auth | Required | Yes |
| Update retention/export policy | Admin | Yes | Required | Yes |
| Update feature flag | Admin | Yes | Required | Yes |
| Export settings | Admin | Yes | Required if sensitive | Yes |
| Retry failed delivery | Admin | Yes | Required | Yes |
| Export delivery log | Admin | Yes | Required | Yes |

## 19. Audit Requirements

Audit log ต้องบันทึกอย่างน้อย:

- `ADMIN_SETTING_VIEW_SENSITIVE`
- `ADMIN_ACCOUNT_INVITE`
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

## 21. Acceptance Criteria

| ID | Criteria |
| --- | --- |
| AC-BO-SET-001 | Admin ทุก admin access เข้าดู own profile/settings และเปลี่ยน password ตาม rule ได้ |
| AC-BO-SET-002 | Admin จัดการ admin account lifecycle ได้โดยไม่กระทบ Admin คนสุดท้าย |
| AC-BO-SET-003 | Roles & Permissions matrix แสดง 8 standard role templates (Super Admin, Admin Manager, Operations Manager, Support Agent, Trust & Safety Moderator, Asset Operations, Content Editor, Content Publisher), แสดง permission key taxonomy + baseline permission matrix ตาม role, enforce ทั้ง UI/API/service level และห้ามลบ/เปลี่ยน system role identity |
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
| AC-BO-SET-024 | Role change ที่ทำให้ไม่มี active `Super Admin`, ไม่มี account ที่จัดการ role ได้, ไม่มี admin recovery coverage, assign Custom Role ที่ inactive/invalid, หรือเปลี่ยน role ตัวเอง/master admin ต้องถูก block ทั้ง UI/API/service พร้อม policy-blocked state และ audit result ตาม policy |
| AC-BO-SET-025 | ทุกคำขอเปลี่ยน Role สร้าง `ADMIN_ACCOUNT_ROLE_CHANGE` ตาม section 9.8 โดยบันทึก event/reference/correlation, actor, target, before/after Role และ permission diff, reason, safeguard outcome, result และเวลา; การสร้าง/แก้ไข/ปิดใช้งาน Role ใช้ `ROLE_CREATE`/`ROLE_UPDATE`/`ROLE_PERMISSION_UPDATE`/`ROLE_DEACTIVATE` ตามข้อมูลเฉพาะ; audit write ต้องสำเร็จก่อน commit mutation และไม่มี secret/token/password ใน payload |

## 22. Open Decisions

| ID | Decision Needed | Impact |
| --- | --- | --- |
| SET-DEC-001 | Fine-grained permission editor จะเปิดใน V1 หรือใช้ fixed role template matrix | กระทบ data model และ QA scope |
| SET-DEC-002 | Security policy fields ใดให้ Admin แก้ได้จริงใน production | กระทบ compliance และ operation |
| SET-DEC-003 | Retention period ราย entity เช่น chat, offer, export file ต้องเก็บกี่วัน/ปี | กระทบ archive/export/report jobs |
| SET-DEC-004 | ต้องมี approval workflow สำหรับ high-risk setting change หรือไม่ | กระทบ admin operation และ audit |
