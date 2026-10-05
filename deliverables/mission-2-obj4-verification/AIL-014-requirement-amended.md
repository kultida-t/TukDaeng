# Requirement [bf08de1f] BO Admin Identity Lifecycle — Invitation, My Account และ Password Security
**Status:** finalized | **Author:** Matem | **Updated:** 2026-09-23 19:02 GMT+7

## Summary

เก็บ baseline งานที่ยังขาดของ BO ฝั่ง Admin identity lifecycle เพื่อใช้ถามยืนยันและสร้าง Mission แยกเป็นช่วงในภายหลัง

## Current Spec (Living Spec)

## Status

Finalized — Amended 2026-09-23 ตาม Change Mission `0a5b2b14` (BO Login Baseline Simplification / CW-1 / task AIL-014): BO Login baseline = `Email + Password → BO`; Login Email OTP, OTP verification, MFA และ 2FA ถูกนำออกจาก current phase; Change Password ใช้ current password verification; `SEC-EMAIL-OTP` ถูกนำออกจาก current BO security policy

## Context And Current State

BO มี Login (email/password), Admin Accounts, Roles & Permissions, Delivery Logs และ Audit Log ในระดับ static/in-memory prototype แล้ว แต่ Admin identity lifecycle หลัง Invite, My Account และ password recovery/change ยังไม่ครบ

- Existing/complete เฉพาะ prototype baseline: Login email/password → BO (Login OTP ถูกนำออกจาก current baseline ตาม Change Mission `0a5b2b14`; protected prototype UI/copy ถูก amend ใน CW-2), account statuses, Admin Account list/detail, Role safeguards และ Delivery/Audit screens
- Partial: Invite Admin สร้าง account สถานะ Invited พร้อม audit/toast แต่ยังไม่มี recipient lifecycle
- UI only: ข้อมูลและ mutation ปัจจุบันเป็น static/in-memory
- Backend/API/database: ไม่พบ implementation, schema หรือ migration ใน repository นี้
- Missing: invitation token/link lifecycle, acceptance/activation, real delivery integration, Forgot/Reset/Change Password, My Account, Active Sessions, Logout All Devices และ E2E security tests
- Conflict ที่ต้องแก้ใน Mission: เอกสารเดิมจัด My Account เป็น Future แต่ requirement นี้นำกลับเข้า scope; Invite toast อ้างว่าส่งอีเมลทั้งที่ยังไม่มี delivery implementation จริง

## Final Scope And Business Rules

### 1. Admin Invitation And Activation

1. Admin ที่มี existing Admin Accounts manage permission กรอก Name, unique Email และ eligible Role
2. ระบบสร้าง Admin Account สถานะ Invited โดยไม่สร้างหรือส่ง temporary password
3. ระบบสร้าง one-time invitation token และส่ง invitation link ทางอีเมล
4. Invitation link อายุ 72 ชั่วโมง
5. การเปิด valid one-time link ถือเป็น possession verification แล้ว ไม่ต้องมี verification challenge เพิ่มเติมใน activation
6. Accept Invitation แสดง Name, Email และ Role แบบ read-only
7. ผู้รับตั้ง initial password ตาม BO Password Policy
8. เมื่อสำเร็จ token เป็น Used, account เปลี่ยน Invited → Active และกลับไป Login
9. Login หลัง activation ใช้ email/password → BO ตาม baseline ปัจจุบัน (ไม่มี Login OTP step)
10. expired, used, cancelled, invalid, superseded token หรือ account/Role ที่ไม่ eligible ต้องไม่ activate และต้องแสดง safe recovery state

### 2. Resend And Cancel Invitation

- Resend cooldown 60 วินาที
- สูงสุด 5 ครั้งต่อ rolling 24 ชั่วโมงต่อ target Admin account เป็น quota รวมของผู้รับ ไม่แยกตาม Admin ผู้กด
- Resend สำเร็จ invalidate token เดิมทันทีและสร้าง token ใหม่อายุ 72 ชั่วโมง
- มี hidden IP/device abuse protection ใน security layer โดยไม่เปลี่ยน business-facing quota
- Cancel ต้องมี confirmation, เปลี่ยน invitation substate เป็น Cancelled แต่ account คงสถานะ Invited
- Cancelled invitation ใช้งานไม่ได้ และสามารถออก invitation ใหม่ภายหลัง
- Initial send, resend, cancel, expiry, delivery failure, acceptance และ activation ต้อง trace ผ่าน Audit Log; email attempts/results ต้อง trace ผ่าน Delivery Log
- Invitation email failure ให้คง account Invited, บันทึก Failed/Retry ตามสถานะจริงและอนุญาต Resend ห้าม rollback account creation

### 3. My Account

- เปิดจาก profile box ท้าย sidebar โดยไม่เพิ่ม Settings submenu
- แสดง Name, Email, Role, Status และ Last Login
- Name แก้ไขได้; Email, Role และ Status read-only
- Route/API บังคับ self-only access ไม่อาศัยการซ่อน UI
- การแก้ Name ต้อง validate และ audit โดยไม่เปลี่ยน Role/permission/session โดยอ้อม

### 4. BO Password Policy

Initial/new password ต้อง:
- อย่างน้อย 12 ตัวอักษร
- มี uppercase, lowercase, number และ special character อย่างน้อยประเภทละ 1 ตัว
- confirm password ตรงกัน
- ยังไม่มี password history เพราะไม่พบ existing requirement
- password/token/OTP ห้ามเก็บหรือ log เป็น plaintext

### 5. Forgot And Reset Password

- เป็น BO self-service แยกจาก FO reset
- Forgot Password ตอบ generic response เหมือนกันเสมอ ไม่เปิดเผย account existence, eligibility, throttle หรือ delivery result
- Reset link อายุ 30 นาที, one-time use และ request ใหม่ invalidate reset token เดิมของ account
- Business quota: cooldown 60 วินาทีและสูงสุด 5 ครั้งต่อ rolling 24 ชั่วโมงต่อ normalized email
- มี hidden IP/device abuse protection เพิ่มเติมโดยไม่เปลี่ยน business-facing quota
- Eligible: Active และ Locked เฉพาะ lock จาก failed login attempts
- Reset สำเร็จสำหรับ failed-login Locked ต้อง clear failed attempts, เปลี่ยน account กลับ Active, invalidate reset token และ revoke ทุก existing session
- security/admin lock ห้ามถูกปลดด้วย Reset Password และต้องใช้ authorized Unlock flow
- Invited ใช้ Invitation flow
- Suspended, Archived, Invited และ email ที่ไม่มีอยู่ตอบ generic response และไม่ส่ง reset email
- Reset สำเร็จต้องกลับ Login และเข้าสู่ระบบด้วย email/password ตาม baseline ปัจจุบัน (ไม่มี Login OTP step)
- invalid, expired, used, superseded และ account-status-blocked token ต้องมี safe state
- reset email failure ไม่เปลี่ยน generic response; บันทึก Delivery Log และ retry ตาม provider/security policy โดยไม่เปิดเผย account detail
- Admin-triggered reset จาก Admin Accounts อยู่นอก scope

### 6. Change Password

- ใช้จาก My Account ของตัวเอง
- ต้องมี current password, new password และ confirm password
- ต้องยืนยัน current password ก่อน commit และไม่ใช้ Email OTP สำหรับ re-authentication
- สำเร็จแล้ว revoke session อื่นทั้งหมดและ refresh security context ของ current session
- current session คงอยู่และไม่ต้อง re-login เพิ่มอีกชั้นหลัง current password ผ่าน validation
- current password ผิด, rate limit และ stale session ต้องมี safe error/retry state
- audit ตาม security-sensitive action policy โดยไม่บันทึก password/OTP

### 7. Active Sessions And Logout

- อยู่ใน Mission 2
- แสดงเฉพาะ session ของ account ตัวเอง พร้อม current-session marker และ metadata ที่ผ่าน privacy/masking policy
- รองรับ revoke session รายรายการ
- Logout All Devices ต้องมี confirmation, revoke ทุก session รวม current session, audit แล้วกลับ Login

## Permission Baseline

- Invite/Resend/Cancel: existing Admin Accounts manage permission; enforce ที่ route/UI/API/service
- My Account/edit Name/Change Password/Active Sessions: authenticated Active Admin, self-only object check
- Forgot/Reset: public BO auth route แต่ mutation ต้องผ่าน token/status/rate-limit checks
- Unlock security/admin lock: existing authorized Admin lifecycle flow เท่านั้น
- Delivery/Audit links ต้องใช้ module permission เดิมและห้าม bypass direct URL/API
- Email uniqueness, eligible Role, account status, lock reason, invitation substate และ token revision ต้อง revalidate ก่อน mutation

## Security And Data Contract Baseline

- แยก failed-login lock ออกจาก security/admin lock ด้วย lock reason หรือข้อมูลเทียบเท่า
- invitation/reset token ต้อง cryptographically random, one-time, เก็บแบบ hash, มี expiry/revision และ invalidate atomically
- Session baseline เดิมคง idle timeout 8 ชั่วโมง และ max session 24 ชั่วโมง โดยไม่มี Login OTP dependency
- Locked/Suspended/Archived session enforcement คงตาม lifecycle policy เดิม
- ทุก sensitive operation ต้องป้องกัน replay, race/stale update, account enumeration และ secret leakage
- Backend/API/database ไม่มีใน repository ปัจจุบัน; Mission ใน workspace นี้ต้องระบุให้ชัดว่าอะไรเป็น prototype/spec/test และอะไรเป็น production contract หรือ external integration dependency

## Delivery And Audit Baseline

- Trace จาก Admin Detail/My Account ไป Audit Log และจาก email attempt ไป Delivery Logs ได้ด้วย correlation/reference
- Delivery record มี event, source reference, recipient, channel, status, timestamp และ provider/result detail ที่ไม่เปิดเผย secret
- Audit record มี actor, target/self, action, before/after ที่เหมาะสม, result, timestamp, reason/failure code และ correlation/reference
- ห้ามเก็บ plaintext password, OTP, raw invitation token หรือ raw reset token
- Invitation, activation, profile update, password request/change/reset, session revoke และ Logout All Devices ต้อง audit ตาม risk policy

## Required States

Loading, submitting, success, empty, unauthorized, forbidden, invalid/expired/used/cancelled/superseded token, delivery failed/retry, rate-limited, stale/revision conflict, account-status blocked, lock-reason blocked และ session-expired

## Acceptance Criteria Baseline

- Invite สร้าง Invited account และส่ง one-time link โดยไม่มี temporary password
- Valid invitation ภายใน 72 ชั่วโมงตั้ง initial passwordและ activate ได้โดยไม่ใช้ activation OTP
- Login หลัง activation ใช้ email/password → BO ตาม baseline ปัจจุบัน (ไม่มี Login OTP step)
- Resend/Cancel/expiry/used/superseded/delivery failure ทำงานตาม rules และ trace Delivery/Audit ได้
- My Account เปิดจาก profile footer; Name edit ได้; Email/Role/Status read-only; self-only guard ครบ
- Password validation ครบ 12 ตัวและ 4 character classes
- Forgot response ไม่เปิดเผย existence/status/throttle/delivery result
- Reset token 30 นาที one-time; request ใหม่ยกเลิกของเดิม
- Active และ failed-login Locked reset ได้; security/admin Locked, Invited, Suspended, Archived reset ไม่ได้
- Successful reset clear failed-login lock เมื่อเกี่ยวข้อง, revoke ทุก session และกลับ Login
- Change Password ต้อง current password + new password + confirm password โดยไม่ใช้ Email OTP, revoke session อื่นและคง current session โดยไม่ต้อง re-login เพิ่ม
- Active Sessions แสดง/revoke เฉพาะ session ตนเอง
- Logout All Devices มี confirmation, revoke รวม current session, audit และกลับ Login
- Business quotas ใช้ rolling 24 ชั่วโมงตามที่ยืนยัน และ hidden abuse controls ไม่เปลี่ยนข้อความ/โควตาที่ผู้ใช้เห็น
- Direct URL/API ต้อง enforce permission/object ownership; UI hiding อย่างเดียวไม่พอ
- Secret ไม่ปรากฏใน storage/log/audit/delivery
- Required loading/error/security states และ responsive/accessibility/regression coverage ต้องมี
- Protected screens ต้องไม่ถูกแก้จนกว่าจะมี explicit approval ของ Mission ที่เกี่ยวข้อง

## Out Of Scope

- Temporary password
- Activation OTP ซ้ำ
- Login Email OTP, Login OTP verification, MFA และ 2FA ใน current phase (นำออกตาม Change Mission `0a5b2b14`)
- Email/Role/Status self-edit
- Password history
- Admin-triggered password reset
- เปลี่ยน security/admin lock ผ่าน Reset Password
- เพิ่ม My Account เป็น Settings submenu
- Real backend/email-provider implementation ใน repository นี้จนกว่าจะมี service/repository ที่รองรับ
- การสร้าง Mission/Objective/Feature/implementation task ก่อนผู้ใช้ตรวจรับ Pre-Mission Summary
- Implementation หรือแก้ protected screen ใน AIL-001

## Dependencies

- Existing Login (email/password → BO)/session/lockout policy
- Settings > Admin Accounts account/Role/permission safeguards
- Roles & Permissions eligibility and revision checks
- Settings > Delivery Logs and Audit Log contracts
- Shared sidebar/profile/navigation
- Email provider/delivery retry capability
- Future backend/API/database/session store หรือ repository ของ service จริง
- Protected-screen approval before implementation

## Risks

- Protected Login/Admin Accounts/Delivery Logs/Audit/shared navigation อาจ regression หากแก้โดยไม่แยก scope และ QA
- Static prototype อาจทำให้ผู้ตรวจเข้าใจผิดว่า email/token/session ทำงานจริง ต้อง label simulated states ชัดเจน
- Token replay/race ระหว่าง accept/resend/cancel/reset ต้องใช้ atomic invalidation
- Generic Forgot response อาจรั่วผ่าน timing, delivery UI หรือ error differences
- Role/status/lock reason เปลี่ยนระหว่างเปิดหน้าและ submit ต้อง revalidate
- Delivery/Audit failure อาจทำให้ state mutation กับ traceability ไม่ตรงกัน ต้องกำหนด transaction/outbox/retry contract
- Session revoke ต้องกระจายถึง request guard/cache/session store อย่างสม่ำเสมอ

## Non-Blocking Open Items For Mission Design

- ชื่อ route, API, table/schema, event type และ Delivery ID pattern
- Email subject/body/template และ provider-specific retry schedule
- Active Session metadata ที่จะแสดงและระดับ IP/location masking
- Exact hidden IP/device thresholds และ telemetry
- Backend/service repository หรือ integration environment สำหรับ production implementation
- จำนวนวัน ชั่วโมง น้ำหนัก Objective และ Kanban task mapping ของแต่ละ Mission

รายการเหล่านี้ไม่เปลี่ยน confirmed behavior และกำหนดได้ระหว่าง Mission Planning/technical design โดยไม่ต้องเปิด Requirement decision gate ใหม่ เว้นแต่พบผลกระทบต่อ business rule

## Proposed Mission Structure

### Mission 1 — Admin Invitation & Account Activation
Invitation email/link/token, Accept Invitation, initial password, Invited → Active, expired/used/cancelled/superseded states, Resend/Cancel, rate limit, Delivery Log, Audit และ Admin Detail invitation context

### Mission 2 — My Account & Credential Security
Profile-footer entry, My Account, edit Name, Change Password (current password + new + confirm), Forgot/Reset + lock reason, session invalidation, Active Sessions, individual revoke และ Logout All Devices

### Mission 3 — End-to-End Integration, QA & Documentation Lock
E2E/security/error tests, responsive/accessibility, regression ของ Login/Admin Accounts/Roles & Permissions/sidebar/Delivery Logs/Audit Log, production contract/spec/baseline/checklist sync และ protected-screen lock หลังตรวจรับ

Dependency: Mission 1 → Mission 2 → Mission 3

2026-09-23: เพิ่ม Change Mission `0a5b2b14` — BO Login Baseline Simplification (CW-1 Requirement/Docs → CW-2 Prototype → CW-3 Tests/Regression) ระหว่าง Mission 1 และ Mission 2 ตามผล reassessment AIL-013; Mission 1 completed แล้วและไม่ reopen

แต่ละ Mission ต้องวางแผนและสร้างทีละอัน, ไม่เกิน 5 วัน, มี Objective/Feature/Task mapping และขอ explicit approval ก่อนแก้ protected scope

## Final Blocking Decision Check

ตรวจ Scope, Business Rule, Security, Permission, Acceptance Criteria และ Mission Boundary แล้ว ไม่พบ Blocking Decision เพิ่มเติม ณ baseline นี้

## Working Agreement

- Requirement คงสถานะ in_review จนผู้ใช้ตรวจรับ Pre-Mission Summary
- ยังไม่สร้าง Mission และยังไม่เริ่ม implementation
- หลังผู้ใช้ยืนยัน: save session note → ปิด AIL-001 ด้วย auto-timer → เริ่ม mission-planning สำหรับ Mission แรก
- สร้าง Mission ทีละอัน เว้นแต่ผู้ใช้สั่งเป็นอย่างอื่น
- Task ที่แก้ไฟล์ต้องคง in_progress จนผู้ใช้ตรวจรับ
- ห้ามเรียก log_time ด้วยมือ

## Discussion & Decision History

### 🗓️ Session Date: 2026-09-26T00:00:00.000Z (by Matem)
- **Summary:** AIL-031 (Mission 2 — Doc Sync): sync self-service contract notes ให้ตรง implementation/tests ที่ผ่านการตรวจรับแล้ว — แก้ contract 3 จุดตาม findings ที่ AIL-027 defer มา (ทิศทางแก้: เอกสาร → implementation, ไม่แก้ prototype)
- **Decisions / Changes:** Contract ที่ finalize ไว้ใน session notes ของ AIL-018 (2026-09-23) ถูกแก้ 3 จุดให้ตรง accepted implementation + approved tests (qa-bo-019b/019d/023):
(1) §7 Audit Contract — ADMIN_SESSION_REVOKE_ALL: risk เปลี่ยนจาก High → **Medium** (impl ที่ bo-prototype.html ใช้ Medium; test qa-bo-019d assert risk Medium, module My Account, aggregate 1 event)
(2) §5 Logout All Devices — ลบ requirement "หลัง redirect: login form พร้อม info 'ออกจากระบบทุกอุปกรณ์แล้ว'": impl redirect กลับ **Login form เปล่า** (trigger logout flow เดิม) โดยไม่แสดง info/toast — การกลับหน้า Login คือ feedback ของ flow อยู่แล้ว (test qa-bo-019d assert #login-screen visible + logged-out + ไม่มี success toast)
(3) §3 Change Password — wrong current password **ไม่สร้าง audit event ต่อครั้ง** (ลบ "audit result=Failed failure_code=WRONG_CURRENT_PASSWORD ทุกครั้ง"): impl แสดง field error + เพิ่ม attempt counter เท่านั้น; audit Failed ถูก emit เฉพาะครบ rate limit → failure_code=**RATE_LIMITED** 1 event; boundary rejection (stale revision / non-Active / non-self) reject โดยไม่ mutate และไม่สร้าง audit event (test qa-bo-019b #20 assert RATE_LIMITED + #25-27 assert auditEventCount ไม่เปลี่ยน)
- **Notes:** DOC-VS-IMPL CORRECTIONS (AIL-031 — docs follow implementation)

ที่มา: AIL-027 (cross-flow verification) พบ doc-vs-impl 3 จุด → defer ให้ AIL-031. ทิศทางแก้ที่ confirm แล้ว: implementation ผ่าน approved functional tests + scoped regression (1,122 pass / 0 fail, AIL-029a+b) + UI/a11y smoke 68/68 (AIL-030) → เอกสารคือส่วนที่ stale, แก้เอกสารไม่แก้ code.

Contract ที่แก้ไข (supersede wording ใน AIL-018 session notes ด้านล่าง):

## §3 Change Password — wrong current password
- เดิม (contract): wrong current → field error + audit result=Failed (failure_code=WRONG_CURRENT_PASSWORD) ทุกครั้ง
- ใหม่ (ตาม impl/tests): wrong current → field error "รหัสผ่านปัจจุบันไม่ถูกต้อง" + เพิ่ม attempt counter เท่านั้น (ไม่มี audit ต่อครั้ง); wrong current ครบ 5 ครั้งติด → lock action + audit ADMIN_PASSWORD_CHANGE result=Failed, failure_code=RATE_LIMITED (1 event, ไม่มี password material); boundary rejection (stale revision, account ไม่ Active, ไม่ใช่ self) → reject + toast โดยไม่ mutate และไม่สร้าง audit event

## §5 Logout All Devices — post-redirect state
- เดิม (contract): หลัง redirect → login form พร้อม info "ออกจากระบบทุกอุปกรณ์แล้ว"
- ใหม่ (ตาม impl/tests): redirect กลับ Login form เปล่า (เหมือน logout ปกติ) ไม่แสดง info message/toast — transition คือ feedback ของ flow อยู่แล้ว

## §7 Audit Contract — ADMIN_SESSION_REVOKE_ALL
- เดิม (contract): risk High
- ใหม่ (ตาม impl/tests): risk **Medium** (aggregate event เดียวต่อ action, module "My Account")

Resolution เพิ่มเติม (confirmed 2026-09-26): §3 Rate limit — contract ระบุ "lock change-password action 15 นาที (mirror failed-login lockout)" แต่ impl ใช้ **cooldown 60 วินาที** (MY_ACCOUNT_PW_COOLDOWN_MS=60000; tests assert countdown หน่วยวินาที) — ตัดสินใจแล้วว่า **policy คง 15 นาที** (mirror failed-login lockout baseline) และ prototype **simulate cooldown เป็น 60 วินาที** เพื่อให้ demo/test ได้ (impl comment ระบุ "rate-limit simulation" ชัดเจน) — ถือเป็น simulation value ภายใต้ §9 Prototype Simulation Contract ไม่ใช่ doc หรือ impl ที่ผิด

### 🗓️ Session Date: 2026-09-23T00:00:00.000Z (by Matem)
- **Summary:** AIL-019 (Mission 2, 18598f33): Finalize Password Recovery Contract — Forgot Password entry จาก #forgot-password-btn + email input + generic response anti-enumeration, eligibility matrix (Active + failed-login Locked เท่านั้น; Invited/Suspended/Archived/security-admin lock/unknown email ไม่ eligible), reset token lifecycle แยกจาก invitation (RST-xxxxx, hash storage, 30 นาที, one-time, supersede-on-new-request, revision guard), cooldown 60s + quota 5/rolling 24h per normalized email นับเฉพาะ committed issuance, Reset Password form (New+Confirm, policy 12+4classes, new≠current), atomic commit (password+token consume+failed-login lock clear+revoke all sessions+audit/outbox), session revoke ทั้งหมดแล้วกลับ Login, Delivery DLV-ACCT-<seq>-PWD-<seq> + retry token เดิม, audit ADMIN_PASSWORD_RESET_* events, security/privacy boundary และ UI/flow states ครบสำหรับ AIL-024/025/026/028. ไม่มี Login OTP/MFA/2FA/temp password; ไม่มี implementation
- **Decisions / Changes:** Resolved non-blocking design items จาก requirement §Non-Blocking Open Items (ไม่เปลี่ยน confirmed behavior, ไม่เปิด decision gate ใหม่): (1) route/API naming — `/bo/reset-password#token=` (fragment transport เหมือน invitation), `POST /api/bo/password-recovery/requests|resolve|reset`; prototype ใช้ `#reset-token=` แยกจาก `#token=` (2) reset request record — `password_reset_requests` display ID `RST-xxxxx`, field/revision/idempotency mirror `admin_invitations` (3) audit event naming — ADMIN_PASSWORD_RESET_REQUEST / ADMIN_PASSWORD_RESET / ADMIN_PASSWORD_RESET_DELIVERY_ATTEMPT, module "Settings" ตาม auth seed events เดิม, reuse auditLogData.events schema (4) delivery ID — `DLV-ACCT-<admin-seq>-PWD-<attempt-seq>`, event "Password reset email", tags Email/PasswordReset/Lifecycle/Audit linked (5) quota counting — นับเฉพาะ committed issuance (มี RST record), provider failure หลัง commit ยังนับ, validation/ineligible/unknown/throttled ไม่นับ (6) safe state mapping — invalid/expired/used/superseded เป็น terminal แยกกัน, account-status-blocked รวมกับ invalid เป็น generic terminal เพื่อตัด enumeration, stale/commit_failed/duplicate_submit เป็น transient re-resolve (7) routine token expiry = state transition + telemetry ไม่สร้าง audit event (mirror AIL-018) (8) valid-token form แสดง masked email เท่านั้น ไม่แสดง name/role (9) reset success clear failed-login lock อยู่ใน audit event เดียวกับ reset (before/after Locked→Active) ไม่แยก event — atomic boundary (10) request ที่ resolve target ได้แต่ถูก block ต้อง audit Failed+failure_code ตาม §10.1 pattern; unresolvable → rate-limited security telemetry
- **Notes:** PASSWORD RECOVERY CONTRACT — FINALIZED (AIL-019)
Trace: Requirement bf08de1f §5 → Mission 2 `18598f33` → Objective "Credential Security Contract" → Task AIL-019. Downstream: AIL-024 (Forgot Password), AIL-025 (Reset Password), AIL-026 (Failed Login Lockout), AIL-028 (Password Recovery Functional Tests). Design contract เท่านั้น — ไม่มี implementation/prototype/test mutation ใน task นี้

## 1. Forgot Password — Entry, Input, Generic Response
- Entry: `#forgot-password-btn` ("ลืมรหัสผ่าน?") บน Login → เปิด public Forgot Password screen (auth-adjacent: dark theme, split/single-column layout, brand identity, auth-state/auth-error pattern ตาม BO_UI_UX_STANDARD Login Pattern; ไม่มี sidebar/breadcrumb/KPI/table)
- Implementation entry อยู่ใน AIL-024 ภายใต้ approved scope "Forgot Password entry" — ห้ามเปลี่ยน Login fields/copy/submit behavior อื่นของ protected Login
- API: `POST /api/bo/password-recovery/requests` — public unauthenticated, mutation ผ่าน token/status/rate-limit checks ที่ service layer (ไม่ใช่ UI hiding)
- Input: Email field เดียว (type=email, autocomplete=username) — canonical identifier = login email; normalize = trim + lowercase ก่อน lookup และ quota key; ไม่เพิ่ม field อื่น
- Validation: required + email format → field-level error; validation failure ไม่นับ quota ไม่สร้าง audit ไม่ส่งอีเมล
- Generic response เหมือนกันทุก outcome: "ถ้าอีเมลนี้ลงทะเบียนและมีสิทธิ์ใช้งาน ระบบจะส่งลิงก์สำหรับตั้งรหัสผ่านใหม่ไปให้" + CTA กลับ Login — identical สำหรับ exists / not-exists / ineligible / cooldown / quota-exceeded / delivery-failed / hidden-abuse-blocked
- Anti-enumeration: response text, HTTP status, redirect และ processing path เหมือนกันทุกเคส; ไม่มี timing/behavior differential ที่ probe ได้; delivery visibility มีเฉพาะทางอีเมลของ address นั้น
- States: ready / submitting (ปุ่ม disable + idempotent submit กัน double-click) / accepted (generic success — terminal ของ request flow) / validation error / system error (generic "ระบบขัดข้อง กรุณาลองใหม่" + retry, ไม่เปิดเผยสาเหตุ)
- rate-limited / abuse-blocked render เหมือน accepted ทุกประการ — ห้ามมี state หรือ copy ต่าง
- ไม่มี Login OTP / MFA / 2FA / temporary password ในทุกขั้นตอน

## 2. Eligibility Matrix (enforce ที่ service layer ตอน request และ revalidate ตอน consume)
- `Active` → eligible (issue reset token)
- `Locked` + lock_reason = failed-login → eligible
- `Locked` + lock_reason = security/admin action → NOT eligible (generic response, ไม่ส่งอีเมล, ปลดได้เฉพาะ authorized Unlock flow)
- `Invited` → NOT eligible (ใช้ Invitation flow; generic response)
- `Suspended` / `Archived` → NOT eligible
- Unknown normalized email → NOT eligible (generic response เดียวกัน)
- Lock reason ต้อง track แยกจาก status (`lock_reason` หรือข้อมูลเทียบเท่า) — status `Locked` อย่างเดียวแยก failed-login กับ security/admin lock ไม่ได้ (confirmed baseline §Security And Data Contract)
- Eligibility ตรวจซ้ำตอน token resolve/consume — account ที่เปลี่ยนเป็น ineligible ระหว่าง token alive ต้องถูก block (account-status-blocked)

## 3. Token Lifecycle
- Record: `password_reset_requests`; display ID `RST-xxxxx`
- Fields (mirror canonical invitation record): request_id, target_admin_id, target_email_normalized (snapshot ตอน issue), token_hash, token_revision (+1 ทุก issuance ของ account), status, expires_at, issued_at/created_at/updated_at, used_at, superseded_at, superseded_by_request_id, issuance_idempotency_key, correlation_id
- Raw token: opaque CSPRNG ≥256-bit; ส่งเฉพาะผ่าน HTTPS link fragment; ไม่ส่งกลับใน API/list; ไม่อยู่ใน audit/delivery/analytics/application log
- Storage: keyed hash/MAC เท่านั้น (HMAC-SHA-256 หรือวิธีที่ security team อนุมัติ + key rotation metadata) — ห้ามเก็บ raw token
- Status: `Pending` → `Used` | `Expired` | `Superseded` (terminal); `invalid` ไม่ใช่ stored state — คือ token ที่ resolve record ไม่ได้ (unknown/malformed)
- One-time: consume สำเร็จครั้งเดียว → `Used` + used_at; concurrent submit มี winner เดียว ที่เหลือได้ safe used/stale result ห้าม mutate ซ้ำ
- Request ใหม่ที่ commit → token `Pending` เดิม → `Superseded` ใน transaction เดียวก่อนเรียก provider — ไม่มี valid token สองชุดพร้อมกัน
- Lifecycle แยกสมบูรณ์จาก login session, invitation token และ activation token — reuse เฉพาะ convention/pattern จาก §10.1
- Idempotency: durable operation ledger pattern เดียวกับ `admin_invitation_operations` — exact retry คืนผลเดิมไม่ duplicate audit/delivery; key เดิมกับ payload ต่าง → reject

## 4. Expiry
- Reset link อายุ 30 นาทีจาก issued_at (server timestamp — confirmed; client เปลี่ยนไม่ได้)
- Expired → terminal safe state "ลิงก์หมดอายุ" + CTA ขอลิงก์ใหม่ผ่าน Forgot flow หรือกลับ Login — ไม่เปิดเผย account detail
- Expiry ประเมิน lazy ตอน resolve และ persist transition เมื่อ observe (pattern เดียวกับ invitation expiry)
- Routine expiry = state transition + telemetry เท่านั้น ไม่สร้าง audit event แยก (mirror AIL-018 routine-expiry decision)

## 5. Rate Limit / Cooldown / Quota
- Cooldown 60 วินาที + สูงสุด 5 ครั้งต่อ rolling 24 ชั่วโมงต่อ normalized email (confirmed)
- Counting semantics: นับเฉพาะ issuance ที่ commit สำเร็จ (มี RST record ใหม่) — mirror invitation "successful issuances"; validation fail / ineligible / unknown email / throttled request ไม่นับ; provider failure หลัง commit ยังนับเพราะ issuance มีจริง
- Throttled → generic response เดียวกัน, ไม่สร้าง issuance ใหม่, token `Pending` เดิมคงใช้ได้, ไม่ส่งอีเมลซ้ำ
- Hidden IP/device/velocity abuse control อยู่ security layer — ห้ามเปลี่ยน business-facing quota หรือเปิดเผย threshold (confirmed)
- Duplicate submit / retry → idempotent, ไม่สร้าง request/audit/email ซ้ำ

## 6. Reset Password
- Route: `/bo/reset-password#token=<opaque>` — fragment transport เหมือน invitation: token ไม่อยู่ใน request line/referrer; page capture token เข้า memory แล้ว `history.replaceState` ลบ fragment; `Referrer-Policy: no-referrer`, `Cache-Control: no-store`, ห้ามโหลด third-party resource ก่อน strip; ห้ามเก็บ token ใน cookie/local/session storage/telemetry
- APIs: `POST /api/bo/password-recovery/resolve` (token → safe context) และ `POST /api/bo/password-recovery/reset` (token + new password + confirm + idempotency key) — public, ไม่สร้าง authenticated session
- Valid token → form: New Password + Confirm New Password (ไม่มี Current Password — recovery flow); แสดง masked email ของ account (เช่น `na***@tukdaeng.example`) เป็น confirmation เท่านั้น ไม่แสดง name/role
- Validation: ≥12 chars + uppercase/lowercase/number/special อย่างน้อยประเภทละ 1 + confirm ตรง + new ≠ current password (hash-compare ฝั่ง server — sanity rule เดียวกับ Change Password ของ AIL-018 ไม่ใช่ password history)
- Commit revalidate ใหม่ทั้งชุดใน transaction เดียว: token `Pending`, expiry, token_revision ตรงล่าสุด, account status (`Active` หรือ failed-login `Locked`), lock_reason, normalized email ตรง snapshot, account revision — การตรวจเฉพาะตอนเปิดหน้าไม่เพียงพอ
- Atomic boundary: persist password hash (approved KDF) + token `Pending→Used` + clear failed-login attempts + `Locked→Active` เฉพาะ failed-login lock + revoke ทุก existing session + account revision+1 + audit + outbox — commit/rollback พร้อมกัน ไม่มี partial state
- Success → redirect Login + generic info "ตั้งรหัสผ่านใหม่สำเร็จ กรุณาเข้าสู่ระบบ"; login ต่อด้วย email/password baseline (ไม่มี OTP step)
- Transient: stale revision ระหว่างเปิดหน้า→submit, commit_failed, duplicate_submit → "RESET NOT COMPLETED — ยังไม่มีข้อมูลถูกบันทึก" + retry ที่ re-resolve server state ใหม่ทั้งชุด (ไม่ใช่ blind retry)

## 7. Failed-Login Lock Interaction
- Reset สำเร็จบน failed-login `Locked` → clear failed attempts + clear lock + กลับ `Active` ใน transaction เดียวกับ §6
- security/admin lock → ไม่ eligible ตั้งแต่ request; ถ้า lock เปลี่ยนระหว่าง token alive → account-status-blocked ตอน consume; ปลดได้เฉพาะ authorized Unlock flow (Settings > Admin Accounts)
- `Suspended` / `Archived` ไม่ถูกแตะโดย reset
- Login lockout message คง generic ตาม spec 01 §9 — ไม่เปิดเผย lock reason; AIL-026 ทำ display interaction; หลัง reset สำเร็จ account `Active` → lockout state หายตาม state จริง

## 8. Session Security After Reset
- Revoke ทุก existing session ของ account — recovery context เป็น public unauthenticated flow ไม่มี "current session" ให้คง (ต่างจาก Change Password ของ AIL-018 ที่คง current session)
- Session revocation อยู่ใน atomic boundary เดียวกับ password update + token consume
- Session ที่ถูก revoke แล้ว → request ถัดไป Session Expired ตาม baseline
- ห้ามสร้าง session จาก reset flow; session ใหม่เกิดจาก Login เท่านั้น; idle 8h / max 24h baseline คงเดิม

## 9. Delivery
- Delivery event "Password reset email"; Delivery ID `DLV-ACCT-<admin-sequence>-PWD-<attempt-sequence>` (เช่น `DLV-ACCT-007-PWD-001`) — mirror `DLV-ACCT-<seq>-INV-<seq>`; attempt sequence เพิ่มต่อ target account ห้าม reuse
- Source = `RST-xxxxx`; recipient = masked email (`xx***@domain`) + target_admin_id; channel Email; status Sent/Failed/Retry ตามจริง; tags อย่างน้อย `Email`, `PasswordReset`, `Lifecycle`, `Audit linked`
- แยก "Recovery Request Accepted" ออกจาก "Email Successfully Delivered" — provider call เกิดหลัง commit; provider failure เปลี่ยนเฉพาะ delivery state + retry schedule ไม่ rollback issuance และไม่เปลี่ยน generic response
- Retry ตาม provider/security policy (exponential/backoff ตาม spec 16) — retry ส่ง token เดิมแบบ idempotent ไม่ mint token ใหม่; invalid destination ไม่ retry; retry ครบยัง fail → `Failed` terminal และ user ต้อง request ใหม่ (นับ quota + supersede เดิม)
- ห้ามมี raw/hashed token, password หรือ secret ใน Delivery Log

## 10. Audit (reuse auditLogData.events schema — AUD-xxxxx, module "Settings" ตาม auth seed events เดิม)
- `ADMIN_PASSWORD_RESET_REQUEST` — action "Request Password Reset" — risk Medium — actor = target admin (owner via recovery) — reference `RST-xxxxx` เมื่อ issue สำเร็จ; `ADM-xxxxx` เมื่อ resolve target ได้แต่ถูก block → result Failed + failure_code `ACCOUNT_INELIGIBLE` | `LOCK_REASON_BLOCKED` | `COOLDOWN_ACTIVE` | `QUOTA_EXCEEDED`
- `ADMIN_PASSWORD_RESET` — action "Reset Password" — risk High — reference `RST-xxxxx` — before/after `Locked → Active` เมื่อ clear failed-login lock (note ระบุ) หรือ `- → Password reset` — result Success/Failed + failure_code `TOKEN_EXPIRED` | `TOKEN_USED` | `TOKEN_SUPERSEDED` | `STALE_REVISION` | `ACCOUNT_INELIGIBLE` | `COMMIT_FAILED`
- `ADMIN_PASSWORD_RESET_DELIVERY_ATTEMPT` — action "Password Reset Delivery" — risk Low — reference `DLV-ACCT-…-PWD-…` — result Sent/Failed/Retry
- Attempt ที่ resolve target ได้แต่ถูก block ต้อง audit เพื่อพิสูจน์ safeguard (§10.1 pattern); malformed/unknown token ที่ resolve target ไม่ได้ → rate-limited security telemetry เท่านั้น ห้ามสร้าง audit reference ที่เปิดเผย account
- Exact idempotent retry → event/result เดิม ไม่ emit duplicate; routine token expiry ไม่ audit
- ห้าม log: password/password hash, raw/hashed reset token, OTP, provider credential, idempotency secret

## 11. Security / Privacy
- Generic response ตลอด Forgot flow; ห้าม leak ผ่าน message, HTTP status, timing, redirect, delivery visibility หรือ audit reference
- Token opaque ≥256-bit, keyed hash/MAC storage, one-time, fragment transport, 30-นาที expiry, supersede-on-new-request
- Eligibility + account status + lock reason + revision revalidate ตอน resolve และ commit
- Enumeration prevention ครอบคลุม unknown email (telemetry ไม่ audit ref), cooldown/quota (response เดิม), token probing (generic invalid)
- Public route ไม่ expose account state; authorization/status checks อยู่ service layer ไม่ใช่ UI hiding
- Prototype/in-memory เป็น simulation เท่านั้น — label ชัดเจนว่าไม่ใช่ security enforcement จริง

## 12. UI / Flow States (implementation contract สำหรับ AIL-024/025/026/028)
- Forgot: ready / submitting / accepted (generic) / validation error / system error + retry — rate-limited และ abuse-blocked render เหมือน accepted ทุกประการ
- Reset: validating token / valid (form) / invalid / expired / used / superseded / account-unavailable (invalid+ineligible รวม generic terminal เดียว) / submitting / password policy error / confirm mismatch / success → Login / transient "reset not completed" (re-resolve)
- Flow: Login → Forgot entry → enter email → submit → generic success → email delivery → open reset link → resolve state → form → validate → commit → redirect Login → login email/password — ไม่มี OTP/MFA/2FA ที่จุดใด
- Failed-login lock display (AIL-026): login fail บน failed-login Locked → generic lockout message + Forgot Password เป็น self-service path; ไม่เปิดเผย lock reason หรือว่า reset จะปลด lock
- Prototype simulation contract: `#reset-token=` fragment (แยกจาก `#token=` invitation), mock `passwordResetData.requests[]` (RST-xxxxx) + opaque token fixture map, scenario control ใน prototype-tools ตาม pattern invite-scenario, auth-adjacent screens reuse Login dark pattern — ทั้งหมด simulated, ห้ามอ้างเป็น enforcement

### 🗓️ Session Date: 2026-09-23T00:00:00.000Z (by Matem)
- **Summary:** AIL-018 (Mission 2, 18598f33): Finalize Self-Service Account Contract — My Account entry จาก .admin-box + self-only boundary + field matrix, Edit Name validation/no-op/audit, Change Password (current+new+confirm, policy 12+4classes, revoke sessions อื่น, current session คงอยู่, wrong-current rate limit), Active Sessions fields+masking+individual revoke+current restriction, Logout All (รวม current → Login), Session Expired generic semantics, audit event list (reuse AUD-xxxxx schema), permission/security boundary, prototype simulation contract. ไม่มี Login OTP/MFA/2FA/forced re-login; ไม่มี implementation
- **Decisions / Changes:** Resolved non-blocking design items จาก requirement §Non-Blocking Open Items: (1) session metadata fields + masking level — device label (browser/OS summary), masked IP (octet 3–4), created/last-activity Bangkok time, masked session id, current-session marker; ไม่มี geolocation/raw token (2) audit event naming — ADMIN_PROFILE_UPDATE / ADMIN_PASSWORD_CHANGE / ADMIN_SESSION_REVOKE / ADMIN_SESSION_REVOKE_ALL, module "My Account", reuse auditLogData.events schema (3) self-service event mapping — change เท่านั้นที่ audit; validation fail ไม่ audit; wrong-current/rate-limit audit ด้วย result=Failed+failure_code; routine session expiry ไม่สร้าง audit event (telemetry เท่านั้น) (4) current-session restriction — individual revoke ไม่รวม current session; Logout All รวม current (5) Edit Name no-op — unchanged ไม่ mutate ไม่ audit (6) Change Password wrong-current rate limit — 5 ครั้ง → lock action 15 นาที mirror lockout policy (7) session-expired simulation contract — prototype scenario control + in-memory mock, label simulated ชัดเจน (8) route naming — module key `my-account`, entry จาก .admin-box เท่านั้น. ไม่มีการเปลี่ยน confirmed behavior; ไม่เปิด decision gate ใหม่
- **Notes:** SELF-SERVICE ACCOUNT CONTRACT — FINALIZED (AIL-018)

## 1. My Account — Entry & Boundary
- Entry: คลิก `.admin-box` (sidebar profile footer) → เปิด My Account page (module key `my-account`); ไม่เพิ่ม item ใน navGroups และไม่เป็น Settings submenu
- Self-only boundary: ทุก read/mutation ผูกกับ authenticated admin ของ session ปัจจุบันเท่านั้น; ไม่รับ target admin id parameter; enforce ที่ route/API/service layer — UI hiding อย่างเดียวไม่พอ
- Access: authenticated Active Admin เท่านั้น; ถ้า account status เปลี่ยนระหว่าง session (Suspended/Archived/Locked) → revalidate → session ถูกยกเลิก → Session Expired state
- Field matrix: Name editable | Email read-only (login identifier) | Role read-only | Status read-only | Last Login read-only
- Sections: Profile (Edit Name), Security (Change Password), Active Sessions (list + revoke + Logout All)
- Required states: loading, ready, load error + retry, session-expired

## 2. Edit Name
- Field: fullName เท่านั้น
- Validation: required, trim whitespace, ≥1 ตัวหลัง trim, ≤100 ตัวอักษร; field-level error ใต้ input
- Unchanged (หลัง trim เท่าค่าเดิม): no-op — info state "ไม่มีการเปลี่ยนแปลง", ไม่ mutate, ไม่ audit
- Success: commit name, toast success, audit ADMIN_PROFILE_UPDATE, sync `.admin-box` display (updateAdminProfileFooter) และ self record
- Stale/concurrent: revalidate session + account revision ก่อน commit; stale → safe error + refresh
- Audit payload: actor=self, before/after=name, reference=ADM-id, result; ไม่มี password/secret

## 3. Change Password
- Fields: Current Password + New Password + Confirm New Password (confirmed baseline — ไม่มี OTP/forced re-login)
- Verify current password ก่อน commit เสมอ; wrong current → field error "รหัสผ่านปัจจุบันไม่ถูกต้อง" + audit result=Failed (failure_code=WRONG_CURRENT_PASSWORD, ไม่มี password material)
- New password policy: ≥12 chars + uppercase/lowercase/number/special อย่างน้อยประเภทละ 1; confirm ต้องตรง; new ≠ current (sanity rule, ไม่ใช่ password history)
- Rate limit: wrong-current 5 ครั้งติด → lock change-password action 15 นาที (mirror failed-login lockout baseline) + audit result=Failed (failure_code=RATE_LIMITED)
- Success: update password, revoke session อื่นทั้งหมด, refresh security context ของ current session, current session คงอยู่, ไม่บังคับ re-login, toast success, audit ADMIN_PASSWORD_CHANGE result=Success
- Stale session ระหว่าง submit → Session Expired state, ไม่มี partial commit

## 4. Active Sessions
- Self-only: เฉพาะ session ของ admin ปัจจุบัน; current session มี marker "อุปกรณ์นี้"
- Session fields (masked): session id แบบ mask (SES-…xxxx), device/browser label จาก UA summary (เช่น "Chrome · Windows"), IP mask octet 3–4 (203.0.xxx.xxx), created/login time (Asia/Bangkok), last activity time; ไม่แสดง geolocation, raw token หรือ credential
- Individual revoke: action ต่อ session + confirmation modal แสดง session identity; success → เอาออกจาก list + toast + audit ADMIN_SESSION_REVOKE; revoked session request ถัดไป → Session Expired
- Restriction: current session ไม่มี individual revoke (ใช้ Logout ปกติหรือ Logout All แทน)
- Error: revoke fail → error toast + คง row; stale (session หายไปแล้ว) → refresh list + info
- Validity: idle 8h / max 24h ตาม security baseline; list แสดงเฉพาะ valid sessions

## 5. Logout All Devices
- Confirmation modal อธิบายว่าทุก session รวมอุปกรณ์นี้จะถูกออกจากระบบ
- Confirm → revoke ทุก session รวม current (all-or-nothing, ไม่มี partial) → audit ADMIN_SESSION_REVOKE_ALL (note มีจำนวน session) → redirect Login
- หลัง redirect: login form พร้อม info "ออกจากระบบทุกอุปกรณ์แล้ว"

## 6. Session Expired
- Trigger: idle timeout 8h, max session 24h, session ถูก revoke (individual/logout-all จากอุปกรณ์อื่น), account Suspended/Locked/Archived โดย admin, invalid session
- Semantics: ตรวจที่ request/render guard ถัดไป → logged-out state → Login screen พร้อม session-expired message (ตาม spec 01 §8)
- Message: generic "เซสชันหมดอายุ กรุณาเข้าสู่ระบบอีกครั้ง" — ไม่เปิดเผยสาเหตุ (idle/revoked/admin action) เพื่อไม่ leak security detail
- Re-login CTA: login form ปกติ (email/password baseline); protected route หลัง expiry ไม่ render เนื้อหา

## 7. Audit Contract (reuse auditLogData.events schema — AUD-xxxxx)
- ADMIN_PROFILE_UPDATE — action "Update Profile" — module "My Account" — risk Low — before/after=name — reference=ADM-id — result Success
- ADMIN_PASSWORD_CHANGE — action "Change Password" — module "My Account" — risk High — before "-" / after "Password changed" (ไม่มี material) — result Success/Failed + failure_code
- ADMIN_SESSION_REVOKE — action "Revoke Session" — module "My Account" — risk Medium — reference=ADM-id, note มี masked session id — result Success
- ADMIN_SESSION_REVOKE_ALL — action "Logout All Devices" — module "My Account" — risk High — note มี session count — result Success
- Routine session expiry ไม่สร้าง audit event (telemetry ภายในเท่านั้น); expiry จาก admin action ถูก audit โดย event ของ action นั้นอยู่แล้ว
- ห้าม log: password/password hash, raw session token, OTP, secret อื่น

## 8. Permission / Security
- authenticated Active Admin + self-only object check ที่ route/API/service (ไม่ใช่แค่ UI hiding)
- read-only fields (Email/Role/Status/Last Login) ปฏิเสธ mutation จาก self-service
- revalidate account status + revision ก่อนทุก mutation
- self-service flows ไม่มี email delivery — ไม่ต้องมี Delivery Log event

## 9. Prototype Simulation Contract (สำหรับ implementation tasks)
- Mock: ขยาย auth.admin ผูก accountId (ADM-010) + sessionData.sessions (in-memory, current flag)
- Scenario control สำหรับ session-expired/wrong-current ตาม pattern invite-scenario
- Demo current password เป็นค่าคงที่ที่ระบุชัดใน mock; ทุกอย่าง simulated — label ชัดเจนว่าไม่ใช่ security boundary จริง

### 🗓️ Session Date: 2026-09-23T00:00:00.000Z (by Matem)
- **Summary:** Amend finalized requirement ตาม Change Mission `0a5b2b14` (BO Login Baseline Simplification / CW-1 / AIL-014): BO Login baseline เปลี่ยนเป็น Email + Password → BO และนำ Login Email OTP/OTP verification/MFA/2FA ออกจาก current phase; Change Password ใช้ Current Password + New + Confirm (ไม่ใช้ Email OTP, ไม่ต้อง re-login เพิ่ม); session baseline ไม่มี OTP dependency; My Account ไม่มี Login OTP field; SEC-EMAIL-OTP ถูกนำออกจาก current security policy; Mission 1 invitation/activation contract คงเดิม (ไม่ reopen)
- **Decisions / Changes:** Confirmed Decisions 5 ข้อที่นำมา amend: (1) BO Login baseline = Email + Password → BO, ไม่ใช้ Login Email OTP/OTP Verification/MFA/2FA ใน current phase; (2) อนุมัติแก้ protected Login screen ภายใต้ scope ของ change นี้เท่านั้น; (3) อนุมัติ amend finalized requirement bf08de1f; (4) Change Password = Current Password + New Password + Confirm New Password โดยไม่ใช้ Email OTP และไม่ต้อง re-login เพิ่มหลัง current password ผ่าน, คง session revocation/audit เดิม; (5) SEC-EMAIL-OTP ถูกนำออกจาก current BO security policy โดยไม่แสดงเป็น Disabled/Deprecated — historical decision/version history เก็บไว้ตามเดิม. Spec changes: section 1 item 9 (login หลัง activation), section 3 My Account field, section 5 reset handoff, section 6 Change Password re-auth, Security baseline session bullet, Acceptance Criteria (login หลัง activation, Change Password), Out Of Scope (เพิ่ม Login OTP/MFA/2FA), Dependencies (ลบ mandatory Email OTP), Mission structure note เพิ่ม Change Mission `0a5b2b14` ระหว่าง Mission 1 → Mission 2.

### 🗓️ Session Date: 2026-09-20T00:00:00.000Z (by Matem)
- **Summary:** ยืนยัน Final Blocking Decisions ครบและผ่าน Final Blocking Decision Check; Living Requirement อยู่ในสถานะ in_review รอผู้ใช้ตรวจรับ Pre-Mission Summary
- **Decisions / Changes:** กำหนด Forgot/Reset eligibility สำหรับ Active และ failed-login Locked; reset สำเร็จ clear attempts/กลับ Active/revoke sessions ขณะที่ security/admin lock ใช้ Unlock flow เท่านั้น; กำหนด Invitation Resend ต่อ target account และ Forgot ต่อ normalized email แบบ rolling 24 ชั่วโมง cooldown 60 วินาทีสูงสุด 5 ครั้ง พร้อม hidden IP/device protection; Logout All Devices ต้อง confirmation, revoke รวม current session, audit และกลับ Login; ปิดรายการ Blocking Decisions เดิมทั้ง 3 ข้อ
- **Notes:** ผู้ใช้ยืนยัน 1A, 2A, 3A และสั่งให้อัปเดต Living Requirement, ตรวจ decision gate รอบสุดท้าย, สรุป Final Pre-Mission Baseline และ AIL-001 พร้อม actual Kanban time โดยยังไม่สร้าง Mission ไม่ปิด task ไม่เริ่ม implementation และรอการตรวจรับก่อน save_session_note

### 🗓️ Session Date: 2026-09-20T00:00:00.000Z (by Matem)
- **Summary:** ยืนยัน business/security decisions 8 กลุ่มสำหรับ Admin Invitation, password lifecycle และ session management; อัปเดต living baseline แล้ว และเหลือ decision gate รอบสุดท้าย 3 ประเด็น
- **Decisions / Changes:** กำหนด invitation expiry 72 ชม.; activation ใช้ valid one-time link เป็น possession verification โดยไม่ใช้ OTP ซ้ำ; Resend cooldown 60 วินาทีและ 5 ครั้ง/วันพร้อม invalidate token เดิม; Cancel คง account Invited + invitation Cancelled; email failure คง account และบันทึก Failed/Retry; BO password อย่างน้อย 12 ตัวพร้อม uppercase/lowercase/number/special และไม่มี password history; reset token 30 นาที one-time/new request invalidates old/revoke ทุก session; Change Password ใช้ current password + Email OTP และคง current session; Mission 2 รวม Active Sessions และ Logout All Devices
- **Notes:** ผู้ใช้ยืนยัน decisions 1B, 2B, 3A, 4A, 5A, 6A, 7A, 8A และสั่งให้ตรวจ blocking decisions ที่เหลือก่อนสรุป Final Pre-Mission Baseline โดยห้ามสร้าง Mission หรือปิด AIL-001 จนกว่าจะยืนยัน summary

### 🗓️ Session Date: 2026-09-19T00:00:00.000Z (by Matem)
- **Summary:** 19/09/2026 — ผู้ใช้ชี้ว่า BO ยังขาด flow จัดการโปรไฟล์ตัวเองและวงจรหลัง Invite Admin ได้แก่ อีเมลคำเชิญ, การคลิกลิงก์, ตั้ง password ครั้งแรก, activation, password recovery/change และ profile editing จึงเสนอแบ่งงานเป็น 3 Mission: (1) Admin Invitation & Account Activation (2) My Account & Credential Security (3) End-to-End Integration, QA & Documentation Lock ผู้ใช้ขอให้บันทึกการสนทนานี้ไว้ และกำชับว่าเมื่อจะสร้าง Mission แต่ละอันให้ถามยืนยันเพื่อให้ตรงกับ baseline ที่คุยกัน
- **Notes:** ## Context

ภาพรวม BO มีเมนู operational และ Settings หลักค่อนข้างครบแล้ว แต่ flow ของ Admin identity lifecycle ยังไม่สมบูรณ์ใน prototype แม้ spec จะระบุ baseline บางส่วนไว้แล้ว

## Gap ที่ยืนยันจากการสนทนา

- หลัง Invite Admin ระบบแสดงเพียงว่าส่งอีเมลและสร้างบัญชีสถานะ Invited แต่ยังไม่มี flow จากอีเมลจนเข้าใช้งานได้จริง
- ยังไม่มีตัวอย่างอีเมลคำเชิญ, invitation link, Accept Invitation, ตั้ง password ครั้งแรก และการเปลี่ยนสถานะ Invited → Active
- ยังไม่มีสถานะ invitation link หมดอายุ/ถูกใช้แล้ว/ถูกยกเลิก รวมถึง Resend/Cancel Invitation
- ยังไม่เห็น Delivery Log และ Audit ที่เชื่อมกับ lifecycle คำเชิญครบเส้นทาง
- ปุ่มลืมรหัสผ่านมีอยู่ แต่ยังไม่มี Forgot/Reset Password flow ที่ใช้งานได้
- กล่องโปรไฟล์ Admin ท้าย sidebar ยังไม่เปิดหน้า My Account
- ยังไม่มี self-service สำหรับแก้ชื่อ, เปลี่ยน password, ดูข้อมูลบัญชี และจัดการ session ของตัวเอง

## แนวทางหลักที่ตกลงเบื้องต้น

### Admin Invitation & Activation

1. ผู้ดูแลกรอกชื่อ อีเมล และ Role
2. ระบบสร้างบัญชีสถานะ Invited
3. ส่ง one-time invitation link ทางอีเมล โดยไม่ส่ง temporary password
4. ผู้รับเปิด Accept Invitation และเห็นชื่อ/อีเมล/Role ที่ได้รับ
5. ผู้รับตั้ง password และยืนยันตัวตนตาม policy
6. บัญชีเปลี่ยน Invited → Active
7. พาไป Login ด้วย email/password และบังคับ Email OTP ตาม baseline
8. Admin Detail ต้องเห็นเวลาส่ง/หมดอายุ/delivery status และมี Resend/Cancel Invitation

### My Account & Password Security

- เปิด My Account จากกล่องโปรไฟล์ท้าย sidebar มากกว่าการเพิ่ม submenu ใน Settings
- แสดงชื่อ, อีเมล, Role, Status, Last Login และ Email OTP requirement
- ชื่อแก้ไขได้
- Email, Role และ Status เป็น read-only
- Change Password ต้องใช้ current password, new password, confirm password และ re-auth/OTP ตาม security policy
- Forgot Password ใช้ reset link แบบไม่เปิดเผยว่ามีบัญชีหรือไม่
- Reset Password ต้องรองรับ token หมดอายุ/ถูกใช้แล้ว และ session invalidation ตาม policy
- Active Sessions / Logout All Devices เป็น scope ที่ต้องถามยืนยันก่อนสร้าง Mission

## Mission Baseline ที่เสนอ

### Mission 1 — Admin Invitation & Account Activation

ครอบคลุมอีเมลคำเชิญ, invitation link, Accept Invitation, ตั้ง password ครั้งแรก, OTP/verification, Invited → Active, expired/used/cancelled link, Resend/Cancel Invitation, Delivery Log และ Audit

### Mission 2 — My Account & Credential Security

ครอบคลุม My Account, แก้ชื่อ, read-only account context, Change Password, Forgot/Reset Password, re-auth/OTP และ optional session management

### Mission 3 — End-to-End Integration, QA & Documentation Lock

ครอบคลุม end-to-end scenarios, responsive, accessibility, error/expired/unauthorized states, regression ของ Login/Admin Accounts/Roles & Permissions/sidebar, Delivery Logs/Audit integration, sync spec/baseline และ protected-screen lock หลังตรวจรับ

## Dependency

Mission 1 → Mission 2 → Mission 3

## Working Agreement สำหรับการสร้าง Mission

- ยังไม่สร้าง Mission หรือ Task จาก requirement นี้อัตโนมัติ
- ก่อนสร้าง Mission แต่ละอัน ต้องดึง requirement นี้ขึ้นมาและถามผู้ใช้ยืนยัน scope ของ Mission นั้น
- ต้องถาม open decisions ที่เกี่ยวข้องกับ Mission นั้นก่อนสร้าง เช่น token expiry, resend policy, password policy, session invalidation และ session management
- สร้าง Mission ทีละอัน ไม่สร้างทั้งสามอันพร้อมกัน เว้นแต่ผู้ใช้สั่งชัดเจน
- งานที่แก้ prototype กระทบ protected Login, Settings > Admin Accounts, Settings > Roles & Permissions, Delivery Logs, Audit Log และ shared sidebar จึงต้องได้รับ explicit approval ตามขอบเขตของ Mission ก่อนแก้
- Task ที่มีการแก้ไฟล์ต้องคง in_progress จนผู้ใช้ตรวจรับ และห้ามเรียก log_time ด้วยมือ
