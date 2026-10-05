# 01 BO Authentication And Admin Accounts Module

**Version:** `BO-01-v1.4`<br>
**Date:** 2026-09-23<br>
**Status:** สเปกปัจจุบัน — BO Login baseline = Email + Password → BO (no Login OTP step) ตาม Change Mission `0a5b2b14`<br>
**Platform:** Responsive Web Back Office

## UI Standards And Prototype Reference

เอกสารนี้ต้องใช้ร่วมกับ `00_GLOBAL_RULES_MODULE.md` และยึดรูปแบบหน้าจอ/พฤติกรรมที่ยืนยันแล้วใน `../Prototypes/bo-prototype.html` เป็นมาตรฐานหลัก โดยเฉพาะ Login screen ที่ล็อกแล้ว รวมถึง layout (split บน desktop, single column บน tablet/mobile), dark theme, brand identity, form pattern ตาม Login Pattern ใน `BO_UI_UX_STANDARD.md`

เอกสารอ้างอิง: `00_GLOBAL_RULES_MODULE.md`, `BO_UI_UX_STANDARD.md`, `BO_MASTER_BASELINE.md`, `BO_PRD.md`, `BO_Spec.md`

## 1. Document Information

| Field | Detail |
| --- | --- |
| Module Name | BO Authentication And Admin Accounts |
| Platform | Responsive Web Back Office |
| Version | `BO-01-v1.4` |
| Status | สเปกปัจจุบัน — BO Login baseline = Email + Password → BO (amended ตาม Change Mission `0a5b2b14`); Admin invitation lifecycle/security contract synced กับ accepted Mission 1 prototype/tests |
| Owner | Product / UX / Engineering / Operations |
| Document Type | Functional PRD |

## 2. Objective

เอกสารนี้กำหนด authentication, session, admin account lifecycle และ permission enforcement สำหรับ Back Office web application

BO authentication แยกจาก FO authentication โดยสมบูรณ์ FO user ไม่สามารถ login เข้า BO ได้ และ BO admin ไม่ใช้ Apple/Google SSO สำหรับ BO access ใน V1

## 3. Scope

### In Scope

- BO login ด้วย email/password
- Session timeout และ logout
- Failed login lockout
- Password reset สำหรับ BO admin
- Admin account lifecycle
- Admin invitation, acceptance และ initial-password activation lifecycle
- Admin Role assignment
- Route/action permission enforcement
- Login/security audit events
- Responsive auth screens

### Out Of Scope

- FO user authentication
- Apple/Google SSO สำหรับ BO
- External identity provider integration
- Individual permission override บน Admin Account; Role/permission editor และ assignment contract อยู่ใน `16_ADMIN_SETTINGS_MODULE.md` section 9
- Hardware security key support

## 4. Admin Account Type

BO uses exactly one admin account type: `Admin`. Authentication requirements do not split Admin into sub-types.

| Admin Account Type | Auth Requirement |
| --- | --- |
| Admin | Email/password |

## 5. Responsive Screen Requirements

Login และ auth-adjacent screens ใช้ layout และ breakpoint ตาม Login Pattern ใน `BO_UI_UX_STANDARD.md` โดย desktop ใช้ split layout (hero visual + form panel, dark theme) และเปลี่ยนเป็น single column เมื่อ viewport ≤ 1180px (ต่างจาก list/detail module ที่ใช้ breakpoint 760px เป็นหลัก) รายละเอียด layout/visual ยึด prototype ที่ล็อกแล้ว

| Screen | Mobile (≤ 760px) | Tablet (761-1180px) | Desktop (> 1180px) |
| --- | --- | --- | --- |
| Login | Single column: hero visual บน (compact) + form panel ล่าง | Single column: hero visual บน + form panel ล่าง (content จำกัด 390px, center) | Split layout: hero visual ซ้าย (decorative) + form panel ขวา (dark theme) |
| Reset Password | Single-column form | Centered form | Centered form หรือ reuse Login split layout |
| Session Expired | Full-width message/action | Centered message | Centered message |
| Access Denied | Message ชัดเจนและ back action | Same | Same |
| Admin Account List | Card/list view พร้อม priority fields | Table หรือ cards | Dense table |
| Admin Account Detail | Stacked sections | Two-column sections | Detail layout พร้อม audit/sidebar เมื่อเหมาะสม |
| Accept Invitation (recipient link) | Single-column form/recovery state ใน auth layout เดียวกับ Login (ไม่มี app shell) | Same | Same |

Login form ต้องมี "ลืมรหัสผ่าน?" link ใน meta row ตาม prototype ที่ล็อกแล้ว

Auth action ทุกอย่างต้องใช้งานได้บน mobile-width browser

## 6. Login Flow

1. Admin เปิด BO login
2. Admin กรอก email และ password
3. ระบบ validate credentials
4. ถ้า credentials ถูกต้อง ระบบสร้าง BO session ทันที
5. Admin เข้าสู่ Dashboard หรือ authorized deep link เดิม
6. Login success ถูก audit-log

### Requirements
- Login ใช้ email/password เท่านั้น
- Login form ต้องมี password visibility toggle
- Invalid credentials ต้องแสดง generic error
- Lockout error ต้องไม่เปิดเผย security detail เกินจำเป็น
- ถ้า admin เปิด unauthorized deep link หลัง login ให้แสดง access denied ไม่ใช่ redirect เงียบ ๆ

## 7. Login Authentication Baseline

Current BO Login baseline คือ `Email + Password → BO` — เมื่อ credentials ถูกต้องระบบสร้าง BO session ทันทีตาม section 6 โดยไม่มี verification challenge เพิ่มเติม

### Requirements
- Login ใช้ email/password เท่านั้นและไม่มีขั้นตอนยืนยันตัวตนเพิ่มเติมใน current phase (ไม่ใช้ Login Email OTP, OTP verification step, MFA หรือ 2FA)
- Session creation, idle/max expiry และ lifecycle enforcement ตาม section 8
- Failed login และ lockout policy ตาม section 9
- Invitation activation ใช้ possession verification ของ one-time link (section 10.1) และไม่เกี่ยวกับ Login challenge; หลัง activation ผู้ใช้กลับ Login ด้วย email/password ตาม baseline นี้

## 8. Session Rules

| Rule | Requirement |
| --- | --- |
| Idle timeout | Session หมดอายุหลัง idle 8 ชั่วโมง |
| Max session | Session หมดอายุสูงสุด 24 ชั่วโมง |
| Logout | Manual logout ต้อง clear BO session |
| Session expired | Redirect ไป login พร้อม session expired message |
| Role assignment/permission changed during session | Permission ต้อง resolve จาก Role revision ล่าสุดใน request หรือ token refresh ถัดไปตาม `16_ADMIN_SETTINGS_MODULE.md` section 9.11 |
| Admin account locked/suspended/archived | Session ต้องถูก revoke หรือ block ใน request ถัดไปตาม lifecycle policy |

## 9. Failed Login And Lockout

| Rule | Requirement |
| --- | --- |
| Failed attempt limit | 5 ครั้ง |
| Lockout duration | 15 นาที |
| Audit | Failed login และ lockout ต้อง audit-log |
| Message | แสดง lockout message ชัดเจนแต่ไม่เปิดเผยข้อมูลเกินจำเป็น |
| Reset | Admin unlock account ได้ตาม policy |

## 10. Admin Account Lifecycle

### Admin Account Status
| Status | Meaning |
| --- | --- |
| Invited | สร้าง account แล้ว แต่ admin ยังไม่ได้ตั้ง password |
| Active | Admin login ได้ด้วย email/password ตาม admin access rule |
| Locked | ถูก lock จาก failed attempts หรือ security action |
| Suspended | ถูก disable โดย Admin |
| Archived | เอาออกจาก active use แต่เก็บไว้เพื่อ audit history |

### Admin Account Fields
| Field | Required | Notes |
| --- | --- | --- |
| Admin ID | Yes | System generated |
| Full Name | Yes | ชื่อที่แสดงภายใน |
| Email | Yes | Unique login identifier |
| Admin access / Role assignment | Yes | ชื่อเชิงแนวคิดใน Auth; production persist เป็น required `role_id` FK ตาม `16_ADMIN_SETTINGS_MODULE.md` section 9.11 ไม่เก็บชื่อ Role หรือ permission payload ซ้ำ |
| Status | Yes | Admin account status |
| Account Revision | Yes | Integer `>= 1`; เพิ่มเมื่อ account identity/status/Role/password activation state เปลี่ยน และใช้ optimistic concurrency |
| Last Login At | No | แสดงใน account detail |
| Created By | Yes | Audit |
| Updated By | Yes | Audit |
| Created At | Yes | Audit |
| Updated At | Yes | Audit |

### 10.1 Admin Invitation Lifecycle And Security Contract

Contract นี้เป็น production boundary สำหรับ Admin Account สถานะ `Invited` ตั้งแต่สร้างคำเชิญจน activation สำเร็จ โดยไม่เปลี่ยน Login baseline (Email + Password → BO) ใน section 6–7 และไม่ถือว่า in-memory state ใน prototype เป็น security enforcement จริง

> Requirement trace (Mission 1 scope): `bf08de1f` → Mission 1 `0248791b` (Admin Invitation & Account Activation) → Objective 4 → Feature "Mission 1 authentication/admin-settings contract update" → Task `AIL-012`; behavior ที่ sync ใน section นี้ implement/accepted แล้วใน AIL-002–AIL-011

#### Account And Invitation State Relationship

Admin Account status และ Invitation status เป็นคนละ state machine:

| Account status | Invitation status ที่ยอมรับได้ | Rule |
| --- | --- | --- |
| `Invited` | `Pending`, `Expired`, `Cancelled`, `Superseded` | Account ยัง login ไม่ได้; มี `Pending` ได้สูงสุด 1 record ต่อ target account |
| `Invited` | `Used` | ห้ามคง state นี้หลัง commit; การ consume สำเร็จต้องเปลี่ยน account เป็น `Active` ใน transaction เดียวกัน |
| `Active` | activation record เป็น `Used`; older records เป็น terminal state อื่นได้ | ผลลัพธ์หลัง activation สำเร็จ; invitation ทุก record ใช้ซ้ำไม่ได้ |
| `Locked`, `Suspended`, `Archived` | ไม่มี active `Pending` ที่ activate ได้ | Service ต้อง block activation และคืน safe recovery state โดยไม่เปลี่ยน account/Role |

Invitation status canonical:

| Status | Meaning | Allowed transition |
| --- | --- | --- |
| `Pending` | token ล่าสุดยัง valid, ยังไม่หมดอายุและยังไม่ถูก consume | `Used`, `Expired`, `Cancelled`, `Superseded` |
| `Used` | token ถูก consume พร้อม activation สำเร็จแล้ว | terminal |
| `Expired` | server time เท่ากับหรือเกิน `expires_at` | terminal; ออก invitation ใหม่ได้ตาม Reissue policy |
| `Cancelled` | Admin ยืนยันยกเลิก; account ยังคง `Invited` | terminal; Reissue ได้ |
| `Superseded` | มี issuance ใหม่แทน record นี้ | terminal |

- State transition ทุกชนิดต้อง server-authoritative; client label, countdown หรือ cached status ใช้ตัดสินไม่ได้
- Read ต้อง derive `Expired` เมื่อ `expires_at <= server_now`; mutation ถัดไปต้อง persist/trace transition ตาม implementation policy โดยผล authorization ต้องเหมือน record หมดอายุแล้วเสมอ
- Cancel/Resend/Reissue/Activate ต้อง lock target account และ active invitation row หรือใช้ compare-and-swap ที่เทียบเท่า เพื่อคง invariant ว่ามี `Pending` ที่ใช้ได้เพียง 1 record
- Data store ต้องมี unique partial constraint หรือ serialization ที่เทียบเท่าบน `target_admin_id` สำหรับ record status `Pending`; application-only check ไม่เพียงพอ
- ไม่ใช้ hard delete กับ invitation record; terminal record คงไว้ตาม retention/audit policy

#### Canonical Invitation Record

Production schema ใช้ตาราง/aggregate `admin_invitations`; durable idempotency ledger ใช้ `admin_invitation_operations`; transactional email outbox ใช้ `delivery_outbox`. ชื่อ storage ภายในเปลี่ยนได้เมื่อ backend convention บังคับ แต่ field/invariant/transaction boundary ใน section นี้ต้องคงเดิมและ migration ต้อง trace กลับ canonical contract ได้

| Field | Type / nullable | Constraint and business rule |
| --- | --- | --- |
| `invitation_id` | opaque string, required; display pattern `INV-xxxxx` | Primary key, immutable, unique, ห้าม reuse |
| `target_admin_id` | Admin ID, required | FK ไป Admin Account; account ต้องเป็น `Invited` ตอน issue/consume |
| `target_email_normalized` | string, required | snapshot ของ normalized unique email ตอน issue; activation ต้องตรงกับ email ปัจจุบันของ account |
| `role_id` | opaque string, required | snapshot/reference ของ Role ที่ได้รับ; ต้องตรงกับ `admin_accounts.role_id` ตอน consume |
| `role_revision` | integer `>= 1`, required | revision ตอน issue; activation ต้อง revalidate Role ปัจจุบันและ eligibility ตาม `16_ADMIN_SETTINGS_MODULE.md` section 9.11 |
| `token_hash` | fixed-length hash/MAC, required | เก็บเฉพาะ keyed hash/MAC ของ token; unique; ห้ามเก็บ raw token |
| `token_revision` | integer `>= 1`, required | เพิ่มทุก issuance ของ target account; ใช้ reject stale/superseded token |
| `status` | enum ตามตารางด้านบน, required | transition ตาม state machine เท่านั้น |
| `expires_at` | server timestamp, required | เท่ากับ `issued_at + 72 ชั่วโมง`; client เปลี่ยนไม่ได้ |
| `issued_at`, `created_at`, `updated_at` | server timestamp, required | เวลา canonical ตาม platform policy |
| `issued_by_admin_id` | Admin ID, required | actor ของ initial invite/resend/reissue |
| `cancelled_at`, `used_at`, `superseded_at` | timestamp, nullable | มีค่าเฉพาะ terminal transition ที่ตรงกัน |
| `cancelled_by_admin_id` | Admin ID, nullable | required เมื่อ status เป็น `Cancelled` |
| `superseded_by_invitation_id` | Invitation ID, nullable | required เมื่อ status เป็น `Superseded`; ชี้ issuance ใหม่ |
| `issuance_idempotency_key`, `correlation_id` | opaque string, required | key ของ initial invite/resend/reissue ที่สร้าง record นี้ และ correlation ที่เชื่อม account/invitation/audit/delivery events |

Raw invitation token ต้องสร้างด้วย CSPRNG ความสุ่มอย่างน้อย 256 bits, ส่งออกเฉพาะผ่าน HTTPS link, ไม่ส่งกลับใน list/detail API, ไม่เก็บใน analytics/audit/delivery log และไม่เขียนลง application/proxy log. Production เก็บ keyed HMAC-SHA-256 หรือวิธี hash/MAC ที่ security team อนุมัติพร้อม key rotation metadata; secret/pepper อยู่ใน secret manager ไม่อยู่ใน record หรือ Admin Settings UI.

#### Token Verification And Atomic Activation

1. Public recipient route ใช้ `/bo/accept-invitation#token=<opaque-token>` เพื่อไม่ให้ token เข้า HTTP request line/referrer; client ส่ง token ใน POST body ไป `POST /api/bo/admin-invitations/resolve` เพื่อรับ safe context และ `POST /api/bo/admin-invitations/activate` เพื่อ submit token + initial password + confirmation + idempotency key. Route/resolve นี้ไม่สร้าง authenticated BO session.
   - Page ต้องใช้ `Referrer-Policy: no-referrer`, `Cache-Control: no-store`, ห้ามโหลด third-party resource ก่อนลบ token ออกจาก URL และต้อง capture token ไว้ใน memory แล้วใช้ `history.replaceState` ลบ fragment; ห้ามเก็บ token ใน cookie, local/session storage หรือ telemetry
2. Valid invitation link เป็น possession verification สำหรับ activation จึงไม่ต้องมี verification challenge เพิ่มเติม. หลัง activation ผู้ใช้กลับ Login และเข้าสู่ระบบด้วย email/password ตาม section 6–7.
3. Service hash/MAC token แล้วค้นด้วย constant-time comparison, ตรวจ `Pending`, expiry, token revision, target account `Invited`, normalized email, account revision, `role_id`, Role status/revision/permission validity และ invitation-account relationship ใหม่ใน transaction ตอน submit; การตรวจเฉพาะตอนเปิดหน้าไม่เพียงพอ.
4. Initial password ต้องอย่างน้อย 12 ตัวอักษรและมี uppercase, lowercase, number และ special character อย่างน้อยประเภทละ 1 ตัว; confirmation ต้องตรงกัน. Password ถูก hash ด้วย approved password KDF และห้ามอยู่ใน log/audit/delivery/idempotency response.
5. Commit สำเร็จต้อง compare-and-consume invitation `Pending -> Used`, set `used_at`, เปลี่ยน account `Invited -> Active`, persist password hash, เพิ่ม account revision และเขียน audit/outbox ใน transaction เดียว. ถ้าเงื่อนไขใด stale หรือ audit/outbox write ล้มเหลวให้ rollback ทั้งชุด.
6. Concurrent submit มีผู้ชนะได้หนึ่งคำขอเท่านั้น. คำขออื่นต้องได้ safe `used/stale` result และห้ามเปลี่ยน password/account ซ้ำ. Retry ด้วย idempotency key เดิมคืนผลเดิมโดยไม่สร้าง audit/delivery ซ้ำ.

#### Admin-Side Issuance Actions

Canonical service endpoints:

| Action | Endpoint | Required permission | Core rule |
| --- | --- | --- | --- |
| Initial invite | `POST /api/bo/admin-accounts/invitations` | `settings.admin_accounts.manage` | สร้าง account `Invited` + invitation `Pending` revision 1 + audit/outbox แบบ atomic; ไม่มี temporary password |
| Resend | `POST /api/bo/admin-accounts/{admin_id}/invitations/resend` | `settings.admin_accounts.manage` | account ต้อง `Invited`; cooldown 60 วินาที; สูงสุด 5 successful issuances ต่อ rolling 24 ชั่วโมงต่อ target account; issuance ใหม่ supersede `Pending` เดิมทันที |
| Cancel | `POST /api/bo/admin-accounts/{admin_id}/invitations/cancel` | `settings.admin_accounts.manage` | ต้อง confirmation; `Pending -> Cancelled`; account คง `Invited` |
| Reissue | `POST /api/bo/admin-accounts/{admin_id}/invitations/reissue` | `settings.admin_accounts.manage` | ใช้เมื่อไม่มี valid `Pending` หลัง Cancelled/Expired; สร้าง revision ถัดไปและคง terminal history เดิม |

- ทุก mutation รับ `expected_account_revision`, `expected_invitation_id/status/token_revision` เมื่อมี current invitation, `idempotency_key` และ `correlation_id`; service ต้อง reject stale/no-op/unauthorized request แบบไม่เกิด partial mutation
- Idempotency ใช้ durable operation ledger ที่ unique ตาม operation scope + actor/target + key และเก็บ request fingerprint/result reference; key เดิมกับ payload ต่างกันต้อง reject. ห้ามอาศัย field ใน invitation record เพียงอย่างเดียวสำหรับ Cancel/Activate retry
- Resend quota นับเฉพาะ issuance ที่ commit สำเร็จ; validation/stale/permission failure ไม่นับ. Initial invite ไม่ใช่ Resend. Hidden IP/device/velocity control อยู่ security layer และห้ามเปลี่ยนหรือเปิดเผย business-facing cooldown/quota
- การสร้าง issuance ใหม่ต้องสร้าง record/outbox และเปลี่ยน current `Pending -> Superseded` ใน transaction เดียวก่อนเรียก provider เพื่อไม่ให้มี valid token พร้อมกันหลายชุด
- Provider failure ห้าม rollback account หรือ invitation issuance; account คง `Invited`, invitation ใหม่คง `Pending`, Delivery Log บันทึก `Failed`/`Retry` ตามจริง และ Admin สามารถ Resend เมื่อผ่าน policy
- Unauthorized action ต้องไม่แสดงใน UI และ direct route/API/service call ต้องตอบ forbidden โดยไม่เปลี่ยนข้อมูล

#### Audit, Delivery And Transaction Boundary

| Lifecycle action | Audit event | Delivery requirement |
| --- | --- | --- |
| Initial invite committed | `ADMIN_INVITATION_CREATE` | สร้าง email outbox/attempt และ Delivery Log |
| Resend committed | `ADMIN_INVITATION_RESEND` | สร้าง email attempt ใหม่; token เดิมถูก supersede |
| Cancel | `ADMIN_INVITATION_CANCEL` | ไม่ส่ง email เว้นแต่ Product เปิด policy ภายหลัง |
| Reissue committed | `ADMIN_INVITATION_REISSUE` | สร้าง email attempt ใหม่ |
| Expiry observed/persisted | `ADMIN_INVITATION_EXPIRE` | ไม่มี email บังคับ |
| Link context accepted | `ADMIN_INVITATION_ACCEPT` | ไม่มี email บังคับ; ห้าม log raw token |
| Activation committed | `ADMIN_INVITATION_ACTIVATE` | ไม่มี email บังคับใน baseline นี้ |
| Provider attempt/result | `ADMIN_INVITATION_DELIVERY_ATTEMPT` | ทุก attempt มี Delivery Log status จริง |

Core state + audit + transactional outbox ต้อง commit หรือ rollback พร้อมกัน. Provider call เกิดหลัง commit; provider failure เปลี่ยนเฉพาะ delivery state และ retry schedule ไม่ย้อน account/invitation state. Audit payload ใช้ immutable IDs/revisions, actor, target, before/after status, reason เมื่อบังคับ, safeguard result, correlation, result และ timestamp; Delivery payload ใช้ destination แบบ mask. ทั้งสองชนิดห้ามมี raw/hashed token, password/password hash, OTP, provider credential, idempotency secret หรือข้อมูล secret อื่น.

Canonical action event เดิมใช้บันทึกทั้ง success และ rejected/blocked attempt ด้วย `result` + `failure_code` ที่ไม่เปิดเผย secret. Attempt ที่ resolve `invitation_id`/target ได้แต่ถูก expiry, replay, stale, permission, quota หรือ eligibility block ต้อง audit เพื่อพิสูจน์ safeguard. Malformed/unknown token ที่ resolve target ไม่ได้ให้ส่งเข้า rate-limited security telemetry โดยไม่เดาหรือสร้าง target reference และห้ามทำให้ Audit Log กลายเป็นช่องทาง enumerate account. Exact idempotent retry ต้องคืน event/result เดิมและห้าม emit duplicate.

Delivery ID สำหรับ invitation email ใช้ `DLV-ACCT-<admin-sequence>-INV-<attempt-sequence>` เช่น `DLV-ACCT-010-INV-001`; `source` ใช้ `invitation_id`, `recipient` ใช้ `target_admin_id`, tag อย่างน้อย `AdminInvitation` และ event name แยก `Invitation created`, `Invitation resent` หรือ `Invitation reissued`. Attempt sequence เพิ่มต่อ target account และห้าม reuse.

#### Safe Resolution States

Public context/activation API ต้อง map invalid, expired, used, cancelled, superseded, account-ineligible, role-ineligible และ stale revision เป็น safe state ที่ไม่เปิดเผย hash, revision ภายใน, account existence หรือ permission detail. เฉพาะ valid link จึงคืน Name/Email/Role แบบ read-only ที่จำเป็นต่อ activation. Unknown token และ malformed token ใช้ generic invalid response; rate-limit/abuse result ห้ามเปิดเผย threshold.

Safe resolution states แบ่งเป็น terminal และ transient ตาม accepted prototype (`getInviteRecoveryState`/`resolveAdminInvitationActivation`):

| Safe state | Trigger code | Kind | Required recovery |
| --- | --- | --- | --- |
| Invalid link | `invalid_token`, `not_allowed` | Terminal | กลับ Login; generic message ที่ไม่เปิดเผยว่า account/invitation มีอยู่หรือไม่ |
| Link expired | `expired` | Terminal | กลับ Login พร้อมช่องทางติดต่อ Admin เพื่อขอคำเชิญใหม่ |
| Link already used | `already_used` | Terminal | นำทางไป Login; account activate แล้วและ Login ด้วย email/password ตามปกติ |
| Invitation cancelled | `cancelled` | Terminal | กลับ Login พร้อมช่องทางติดต่อ Admin |
| Link superseded | `superseded`, `stale_revision` | Terminal | กลับ Login พร้อมคำแนะนำให้ใช้ลิงก์จากอีเมลคำเชิญฉบับล่าสุด |
| Activation unavailable | `account_ineligible`, `role_ineligible` | Terminal | Block โดยไม่เปลี่ยน account/Role/password; แสดง safe message และช่องทางติดต่อ Admin |
| Activation not completed | `stale_invitation`, `commit_failed`, `duplicate_submit` | Transient | แสดง retry action ที่ re-resolve server state ใหม่ทั้งชุด (ไม่ใช่ blind retry ของ request เดิม); ถ้า re-resolve พบ terminal state ให้แสดง terminal state ตามจริง และห้ามเกิด partial mutation |

#### Prototype And Production Boundary

- Protected prototype สาธิต lifecycle ครบชุดแบบ in-memory แล้ว: Invite Admin modal → account `Invited` + invitation record `Pending`, invitation context ใน Admin Detail, Resend/Cancel/Reissue พร้อม cooldown 60 วินาที + quota 5/rolling 24h, recipient link `#token=` capture/strip, initial-password activation, safe recovery states ทั้ง terminal/transient และ Delivery/Audit trace (`DLV-ACCT-<seq>-INV-<seq>`/`AUD-xxxxx`) — ทั้งหมดเป็น UI/mock baseline เท่านั้น; ยังไม่มี server-side token hash storage, durable idempotency/outbox, transaction, provider integration หรือ abuse/rate-limit enforcement จริง
- Prototype state ใช้สาธิต interaction และต้องไม่ถูกอ้างเป็นหลักฐานว่า one-time token, permission, race/replay, quota หรือ audit/delivery durability ถูก enforce แล้ว
- Section นี้เป็น production contract และไม่อนุญาตให้แก้ protected Login, Admin Accounts, Delivery Logs, Audit Log, navigation หรือ routing โดยอัตโนมัติ; UI implementation ต้องทำใน task ที่ได้รับอนุมัติและคง behavior ที่ล็อกไว้

## 11. Admin Account Actions

| Action | Permission | Audit Required |
| --- | --- | --- |
| Invite Admin | `settings.admin_accounts.manage` | Yes (`ADMIN_INVITATION_CREATE`) |
| Resend Invitation | `settings.admin_accounts.manage` | Yes (`ADMIN_INVITATION_RESEND`) |
| Cancel Invitation | `settings.admin_accounts.manage` | Yes (`ADMIN_INVITATION_CANCEL`) |
| Reissue Invitation | `settings.admin_accounts.manage` | Yes (`ADMIN_INVITATION_REISSUE`) |
| Change Admin Role | `settings.admin_accounts.manage` | Yes (`ADMIN_ACCOUNT_ROLE_CHANGE`) |
| Suspend Admin | `settings.admin_accounts.manage` | Yes |
| Reactivate Admin | `settings.admin_accounts.manage` | Yes |
| Unlock Admin | `settings.admin_accounts.manage` | Yes |
| Archive Admin | `settings.admin_accounts.manage` | Yes |
| View Admin List | `settings.admin_accounts.view` | เฉพาะ export ต้อง audit |
| View Own Profile | All admins | No ยกเว้นดู sensitive/security data |
| Change Own Password | All admins | Yes |

Admin ต้องไม่สามารถ archive/suspend/เปลี่ยน Role ของ Admin คนสุดท้ายหรือ account สุดท้ายที่คง admin recovery coverage ได้ โดย safeguard และ concurrency ใช้ contract ใน `16_ADMIN_SETTINGS_MODULE.md` section 9.7–9.11

## 12. Permission Enforcement

ต้องตรวจ permission ที่:

- Route access
- Navigation rendering
- API/action access
- Field-level sensitive data access
- Export access
- Audit log access

ถ้า UI permission กับ API permission ไม่ตรงกัน ให้ API permission เป็นตัวตัดสิน

Invitation action ต้อง enforce permission และ stale-state safeguard ซ้ำที่ route, API และ service ตาม section 10.1; การซ่อน action ใน UI ไม่ใช่ authorization

## 13. Security Events To Audit

- Login success
- Login failure
- Logout
- Session expired
- Account locked
- Account unlocked
- Password reset requested
- Password changed
- Admin Role assignment/permission changed
- Admin invited
- Admin invitation created/resend/cancel/reissue/expired/accepted/activated
- Admin invitation delivery attempted/failed/retried
- Admin suspended/reactivated
- Admin archived
- Access denied for restricted route/action

## 14. Error And Empty States

| Case | Required State |
| --- | --- |
| Invalid credentials | Generic login error |
| Account locked | แสดง lockout message และ support/admin contact route ถ้ามี |
| Account suspended | แสดง access unavailable message |
| Session expired | แสดง session expired message และ login action |
| Unauthorized route | แสดง access denied state |
| No admin accounts found | แสดง empty state พร้อม invite action สำหรับ Admin |
| Invitation invalid/malformed | แสดง safe invalid-link state โดยไม่เปิดเผยว่ามี account หรือ invitation หรือไม่ |
| Invitation expired/used/cancelled/superseded | แสดง terminal safe state และช่องทางกลับ Login/ติดต่อ Admin ตาม state ที่อนุมัติ |
| Invitation account/Role ineligible หรือ stale | block activation โดยไม่เปลี่ยน account/password และแสดง safe recovery state |
| Invitation transient failure (stale invitation, commit race, duplicate submit) | แสดง transient safe state "ยังไม่มีข้อมูลใดถูกบันทึก" พร้อม retry ที่ re-resolve server state ใหม่ทั้งชุด ไม่ทำ mutation ซ้ำ |
| Invitation delivery failed | account คง `Invited`, Delivery Log แสดง Failed/Retry และ Resend ใช้ได้ตาม cooldown/quota |

## 15. Acceptance Criteria

| ID | Criteria |
| --- | --- |
| AC-BO-AUTH-001 | BO login รองรับ email/password เท่านั้น |
| AC-BO-AUTH-002 | FO user login เข้า BO ไม่ได้ |
| AC-BO-AUTH-003 | Admin เข้าสู่ BO ทันทีหลัง email/password ถูกต้อง — ไม่มี Login OTP/MFA/2FA step ใน current phase |
| AC-BO-AUTH-004 | Failed login ครบ 5 ครั้งแล้ว lock account 15 นาที |
| AC-BO-AUTH-005 | Idle session หมดอายุหลัง 8 ชั่วโมง และ max session หมดอายุหลัง 24 ชั่วโมง |
| AC-BO-AUTH-006 | Route และ action permission check ต้อง block unauthorized access |
| AC-BO-AUTH-007 | Navigation ซ่อน module ที่ไม่มีสิทธิ์ แต่ direct URL ยังต้อง enforce permission |
| AC-BO-AUTH-008 | Admin account lifecycle รองรับ invited, active, locked, suspended, archived |
| AC-BO-AUTH-009 | Admin active คนสุดท้ายหรือ account สุดท้ายที่คง admin recovery coverage ต้องไม่ถูก archive/suspend/change Role โดยไม่มี eligible replacement |
| AC-BO-AUTH-010 | Login, logout, failed login, lockout, password, Role/permission และ admin account changes ต้อง audit-log |
| AC-BO-AUTH-011 | Auth screens ใช้งานได้บน mobile, tablet, desktop และ wide desktop widths |
| AC-BO-AUTH-012 | Admin invitation ใช้ one-time opaque token อายุ 72 ชั่วโมง เก็บเฉพาะ hash/MAC พร้อม token revision และมี `Pending/Used/Expired/Cancelled/Superseded` transition ตาม section 10.1 |
| AC-BO-AUTH-013 | Activation ต้อง revalidate invitation, expiry, account/email/Role/revision และ consume invitation พร้อมเปลี่ยน account `Invited -> Active` + persist password + audit/outbox แบบ atomic; race/replay/stale request เปลี่ยน state ซ้ำไม่ได้ |
| AC-BO-AUTH-014 | Valid invitation link เป็น possession verification จึงไม่ต้องมี verification challenge ซ้ำ; activation สำเร็จกลับ Login และ Login ใช้ email/password ตาม baseline ปัจจุบัน |
| AC-BO-AUTH-015 | Resend ใช้ cooldown 60 วินาทีและไม่เกิน 5 successful issuances ต่อ rolling 24 ชั่วโมงต่อ target account, supersede token เดิม และมี hidden abuse control ที่ไม่เปิดเผย/ไม่เปลี่ยน quota |
| AC-BO-AUTH-016 | Cancel คง account `Invited`; Reissue สร้าง token revision ถัดไป; delivery failure ไม่ rollback account/invitation และทุก email attempt มี Delivery Log |
| AC-BO-AUTH-017 | Invitation UI/route/API/service enforce `settings.admin_accounts.manage`, account/Role eligibility และ stale revision; action ที่ไม่อนุญาตไม่แสดงและ direct mutation ถูก reject |
| AC-BO-AUTH-018 | Audit/Delivery payload ไม่มี raw/hashed token, password/password hash, OTP หรือ secret; prototype/mock state ถูกแยกจาก production enforcement ชัดเจน |
| AC-BO-AUTH-019 | Invitation link ที่ invalid/expired/used/cancelled/superseded/account-or-role-ineligible ต้องแสดง terminal safe state ตาม section 10.1 โดยไม่เปิดเผย account existence, hash หรือ revision ภายใน; transient failure (stale invitation, commit race, duplicate submit) ต้องแสดง retry state ที่ re-resolve server state ใหม่ทั้งชุดโดยไม่มี partial mutation |

## 16. Related Modules

- `00_GLOBAL_RULES_MODULE.md`
- `BO_UI_UX_STANDARD.md`
- `02_DASHBOARD_MODULE.md`
- `08_AUDIT_LOG_MODULE.md`
- `16_ADMIN_SETTINGS_MODULE.md`
