# 08 BO Audit Log Module

**Version:** `BO-08-v0.4`<br>
**Date:** 2026-09-23<br>
**Status:** Screen layer synced with prototype (Audit Log Phase 1 — list/detail drawer/date range filter/cross-module jump) + audit catalog synced กับ BO Login baseline ตาม Change Mission `0a5b2b14`<br>
**Platform:** Responsive Web Back Office

## UI Standards And Prototype Reference

เอกสารนี้ต้องใช้ร่วมกับ `00_GLOBAL_RULES_MODULE.md` และยึดรูปแบบหน้าจอ/พฤติกรรมที่ยืนยันแล้วใน `../Prototypes/bo-prototype.html` เป็นมาตรฐานหลัก

เอกสารอ้างอิง: `BO_PRD.md`, `BO_Spec.md`

## 1. Document Information

| Field | Detail |
| --- | --- |
| Module Name | BO Audit Log |
| Platform | Responsive Web Back Office |
| Version | `BO-08-v0.4` |
| Status | Screen layer synced with prototype (Audit Log Phase 1) + Admin invitation lifecycle audit events cataloged + Login OTP audit events removed ตาม BO Login baseline |
| Owner | Product / UX / Engineering / Operations |
| Document Type | Functional PRD |

## 2. Objective

BO Audit Log Module คือระบบบันทึกและตรวจสอบประวัติการกระทำสำคัญของ Admin, system job และ provider sync ที่มีผลต่อข้อมูล ความปลอดภัย สิทธิ์ผู้ใช้ หรือการแสดงผลบน FO

Audit Log ต้องเป็น source สำหรับ traceability, dispute support, operation review และ security investigation โดยต้องแก้ไขหรือลบจาก admin UI ปกติไม่ได้

## 3. Scope

### In Scope

- Audit event capture สำหรับ BO write actions
- Audit event capture สำหรับ login/security events
- Audit event capture สำหรับ sensitive data reveal/export
- Audit event capture สำหรับ provider sync/import/export/background jobs
- Search/filter audit log
- View audit detail
- Export audit log ตาม permission (Phase 2 — ไม่มีใน prototype Phase 1)
- Immutable/read-only audit records
- Retention policy baseline
- Responsive web layout

### Out Of Scope

- SIEM integration ใน Phase 1
- Real-time anomaly detection
- User-facing audit history ใน FO
- Manual edit/delete audit record จาก BO UI
- Full legal hold workflow เว้นแต่มี compliance decision เพิ่ม

## 4. Admin Access And Permissions

ระบบใช้ Admin access เดียว โดยตรวจสิทธิ์ตามเมนูและ action ที่ทำ ไม่แยกประเภทบัญชี Admin ในสเปกนี้


| Access Area | Rule |
| --- | --- |
| Module access | Admin ที่มีสิทธิ์เข้าเมนูสามารถใช้ list, detail, search และ filter ได้ |
| Write action | Create, update, status change, remove, restore, publish, archive, retry และ action ที่คล้ายกัน ต้องตรวจ permission, แสดง confirmation สำหรับ high-risk action, บังคับกรอก reason เมื่อมี FO/user impact และบันทึก audit |
| Sensitive data | Mask เป็น default; reveal เฉพาะเมื่อมี business reason, policy approval และ audit log |
| Export | ต้องตรวจ permission, ควบคุม scope, มี expiry/background job เมื่อจำเป็น และบันทึก audit export event |
| Direct URL/API | ต้องตรวจสิทธิ์ที่ route, API และ service layer เสมอ ไม่พึ่งเฉพาะ hidden UI |
## 5. Audit Event Schema

ทุก audit event ต้องมี field ขั้นต่ำ:

| Field | Requirement |
| --- | --- |
| Audit ID | Unique immutable ID |
| Timestamp | Required, store UTC, display Asia/Bangkok |
| Actor Type | Admin, System, ProviderJob |
| Actor ID | Admin ID หรือ system job ID |
| actor access context | Admin access ณ เวลาที่ทำ action |
| Action Type | Required enum/string |
| Target Entity Type | User, Asset, Article, Brand, Model, PriceIndex, Directory (future), etc. |
| Target Entity ID | Required เมื่อมี target |
| Before Value | JSON snapshot หรือ diff ก่อน action |
| After Value | JSON snapshot หรือ diff หลัง action |
| Reason / Note | Required เมื่อเป็น destructive/public-impact action |
| IP Address | ถ้ามี |
| Session ID / Request ID | ถ้ามี |
| User Agent | ถ้ามี |
| Result | Success, Failed, Partial, Skipped |
| Error Code | เมื่อ action fail |
| FO Impact | Optional summary เมื่อ action กระทบ FO |
| Correlation ID | ใช้เชื่อมหลาย event ใน workflow/job เดียวกัน |

Sensitive values ใน before/after ต้อง mask ตาม policy ถ้าไม่จำเป็นต่อ audit detail หรือ admin access ไม่มีสิทธิ์ดู

## 6. Target Entity Types

Baseline entity types:

- AdminAccount
- AdminInvitation (Mission 1 — Admin invitation lifecycle events)
- User
- Asset
- Offer
- ChatRoom
- ChatMessage
- Comment
- Article
- Category
- Banner
- Brand
- Model
- Reference
- PriceIndex
- MarketDataProviderSync
- WatchAlert
- Directory (future/postponed)
- Policy
- PolicyVersion
- SupportCenter
- AccountDeletionRequest
- Notification (Phase 2/future — template/broadcast audit action; delivery log audit อยู่ใต้ Settings entity ใน Phase 1)
- RolePermission
- ExportJob
- ImportJob
- SystemSetting
- SpecOption
- SpecOptionGroup

## 7. Action Groups

### User / Auth

- Admin login/logout
- Failed login
- Account lockout
- Admin create/update/disable
- User suspend/unsuspend
- User ban/unban
- Account status notification send/retry/fail linked to suspend/ban/unban action
- User soft delete/archive
- Reset password trigger

### Asset / Moderation

- Asset flag/unflag
- Asset remove/archive
- Asset force status change
- Sensitive asset field reveal
- Report resolve/escalate

### Content / Board

- Article create/update/publish/schedule/archive
- Featured article update
- Category activate/deactivate
- Banner activate/deactivate
- Reported Article Content resolve/archive

### Market Data / Directory

- Brand/model/reference create/update/activate/inactivate
- Price index create/update/activate/inactivate
- The Watch API provider sync trigger/result
- Provider conflict resolution
- Directory item create/update/activate/inactivate/archive (future/postponed; not Phase 1)
- Directory import/export (future/postponed; not Phase 1)

### Offer Management / Asset Reported Comments Phase 2

- Offer force expire/invalidate
- Chat message hide/remove/export
- Comment hide/unhide/delete
- Watch Alert sensitive reveal / trigger job run (read-only module — no admin disable/enable/export)

### Help / Support / Settings

- Policy draft create/save
- Policy publish (archive เวอร์ชัน Published เดิมอัตโนมัติ)
- Policy restore (Archived → Draft ใหม่)
- Support Center update (channels, business hours, availability)
- Account deletion restore / reject restore / auto delete (เก็บถาวร + ลบตัวตน ขั้นเดียว) / dependency check / request create / session revoke / offer cancel auto / report close auto
- Delivery log retry / export (Phase 1, Settings > Delivery Logs)
- Admin invitation lifecycle — create / resend / cancel / reissue / link accepted / activated / delivery attempt (`ADMIN_INVITATION_*` ตาม `01_AUTHENTICATION_MODULE.md` section 10.1 และ `16_ADMIN_SETTINGS_MODULE.md` section 8.9)
- Notification template update (Phase 2/future)
- Broadcast send/retry/cancel (Phase 2/future)
- Permission/access update
- System setting update

### Admin Identity Lifecycle Audit Contract

Admin identity lifecycle ใช้ event, result และ reference เดียวกันตลอด Invitation, Authentication, My Account และ Session Management เพื่อให้ trace กลับไปยัง Admin Detail, Audit Log และ Delivery Logs ได้โดยไม่สร้าง event ซ้ำจาก action เดียวกัน:

| Event | Action / Module | Risk | Result และ payload ที่อนุญาต |
| --- | --- | --- | --- |
| `ADMIN_INVITATION_CREATE` | Create Invitation / Admin Accounts | ตาม approved invitation risk policy | Success/Failed; reference เป็น `ADM-xxx` และ correlation เชื่อม invitation/outbox/delivery โดยไม่เก็บ raw token; `ADMIN_ACCOUNT_INVITE` เป็น legacy alias เท่านั้นและห้าม emit ซ้ำ |
| `ADMIN_INVITATION_RESEND` / `ADMIN_INVITATION_REISSUE` / `ADMIN_INVITATION_CANCEL` / `ADMIN_INVITATION_EXPIRE` | Invitation lifecycle / Admin Accounts | ตาม approved invitation risk policy | เก็บ invitation revision, actor/target, result, reason/failure code และ correlation ที่ไม่เปิดเผย token |
| `ADMIN_INVITATION_ACCEPT` / `ADMIN_INVITATION_ACTIVATE` | Invitation lifecycle / Authentication | ตาม approved invitation risk policy | เก็บ safe token state/revision และ target reference; malformed/unknown token ที่ resolve target ไม่ได้เข้า security telemetry แทน target audit |
| `ADMIN_INVITATION_DELIVERY_ATTEMPT` | Invitation delivery / Admin Accounts | ตาม approved delivery risk policy | เก็บ provider result, delivery reference และ retryable category; ห้ามเก็บ provider credential หรือ message secret |
| `ADMIN_PROFILE_UPDATE` | Update Profile / My Account | Low | Success; before/after เฉพาะชื่อที่ผ่าน policy และ reference เป็น self `ADM-xxx` |
| `ADMIN_PASSWORD_CHANGE` | Change Password / My Account | High | Success หรือ Failed เฉพาะเมื่อครบ rate limit พร้อม `failure_code=RATE_LIMITED`; summary ต้องไม่มี password material |
| `ADMIN_SESSION_REVOKE` | Revoke Session / My Account | Medium | Success; note ใช้ masked session reference เท่านั้น |
| `ADMIN_SESSION_REVOKE_ALL` | Logout All Devices / My Account | Medium | Success; aggregate event เดียวต่อ action พร้อมจำนวน session โดยไม่บันทึก session id/token รายตัว |

กติกา Change Password ตาม accepted implementation และหลักฐาน E2E:

- Wrong current password แต่ละครั้งแสดง field error และเพิ่ม counter เท่านั้น ไม่สร้าง audit event ต่อครั้ง
- เมื่อผิดครบ 5 ครั้งติดจึงสร้าง `ADMIN_PASSWORD_CHANGE` result `Failed` พร้อม `failure_code=RATE_LIMITED` หนึ่ง event; production block 15 นาที ส่วน prototype simulation ใช้ 60 วินาที
- Boundary rejection เช่น stale revision, account ไม่ Active หรือไม่ใช่ self ต้อง reject โดยไม่ mutate และไม่สร้าง audit event
- Logout All Devices สำเร็จแล้วกลับ Login form เปล่า; feedback หลัง redirect ไม่ใช่ audit payload และไม่เพิ่ม event อีกตัว

ทุก multi-step workflow ต้องใช้ correlation/reference เดียวกันกับ source entity และ Delivery Log ที่เกี่ยวข้อง. Audit payload ห้ามมี plaintext password, password hash, OTP, raw/hashed invitation token, raw/hashed reset token, raw session token, provider credential หรือ idempotency secret. Routine session expiry ไม่สร้าง event เพิ่ม; expiry จาก admin action trace ผ่าน event ของ action ต้นทางอยู่แล้ว

### Export / Import

- CSV/Excel export start/finish/fail
- Sensitive export download
- Import dry-run/start/finish/fail
- Background job retry/cancel

### Option Master

- Option add
- Option edit (label/description/key/sort_order)
- Option deactivate
- Option reactivate
- Option delete (destructive)
- Option reorder
- Group create
- Group edit (display_name/description/allows_multi_select)
- Group reorder
- Group deactivate
- Group reactivate
- Group delete (destructive)

## 8. Immutable Rules

- Audit records ต้องไม่ถูกแก้ไขจาก BO admin UI
- Audit records ต้องไม่ถูก hard delete ก่อน retention policy
- ถ้าต้อง mask หรือ redact ตาม legal/compliance ให้สร้าง redaction event แยก ไม่แก้ record เดิมแบบเงียบ ๆ
- Audit log ต้องเขียนสำเร็จก่อนหรือพร้อมกับ mutation สำคัญ ถ้า audit write fail ต้อง block action หรือเข้าคิว reliable retry ตาม risk policy
- Audit event ต้องมี correlation ID สำหรับ workflow ที่เกิดหลาย action ต่อเนื่อง

## 9. Search And Filter

Audit Log UI Phase 1 (ตาม prototype `bo-prototype.html` — Settings > Audit Log) รองรับ:

- Search ช่องเดียวครอบคลุม Event ID, Actor, Action, Module, Risk, Reason, Reference และ Note (placeholder: "ค้นหา Event ID, Actor, Action, Reference") — actor/admin และ target entity ID ถูก cover โดยช่อง search นี้ ไม่มี filter แยก
- Filter by module (Asset, Content, Users, Account Deletion, Reported Comments, Offers, Settings)
- Filter by risk level (High, Medium, Low)
- Filter by date range (from/to date picker — picker-only, sync min/max ข้ามกันและ clamp ให้ from ≤ to เสมอ)
- Sort ล่าสุดก่อน / เก่าสุดก่อน (ตาม timestamp)
- Filter bar เปิด/ปิดได้, ปุ่ม reset ค่าทั้งหมด และ filter state persist เฉพาะ scope detail → back / re-render ภายใน module — การ jump เข้ามาจาก module อื่นผ่าน audit ref link เป็น fresh filtered view เสมอ (ล้าง filter state ที่ค้างจาก session ก่อนหน้า แล้วกรองด้วย ref/event id เป้าหมาย)
- Pagination 10 รายการต่อหน้า

Phase 2/future (ยังไม่มีใน prototype Phase 1):

- Filter by action type
- Filter by result status (Success / Partial / Failed)
- Filter by actor access context
- Filter by target entity type
- Filter by IP address
- Filter by correlation ID
- Actor filter แบบ exact-match (ตัดออกจาก Phase 1 16/09 — search ครอบคลุม actor แล้ว ถ้าจำเป็นค่อยพิจารณาร่วม Phase 2)

Production ต้องใช้ server-side pagination, filter และ sort (prototype เป็น client-side mock)

## 10. Audit Detail

Detail เปิดด้วยการคลิกแถวใน Audit Log List — แสดงเป็น right sidebar drawer (pattern: market-reference-drawer) read-only ไม่มี action footer

Phase 1 sections (ตาม prototype):

- Header: eyebrow "Audit Log Detail" + Event ID + action
- Event Summary: Date/Time (Asia/Bangkok), Action, Tags (module badge + risk pill + result pill), Actor, Actor Type และ Reference
- Reference แสดงเป็น pill ที่คลิกได้ — jump ไปหน้า entity detail ตาม prefix (ADM → Admin Detail, DEL → Deletion Detail, AST → Asset Detail, ART → Article Detail, RCO → Reported Comment Detail, U- → User Detail); ref ที่ map ไม่ได้จะ fallback กรอง Audit Log ด้วย ref นั้น + toast ยืนยัน
- Before/After: diff box แสดงเฉพาะเมื่อ before/after ต่างกัน — ซ่อนทั้ง section เมื่อไม่มี before/after หรือค่าเท่ากัน (no-change)
- Reason/Note: แสดงเฉพาะ field ที่มีข้อมูล (ซ่อน field ว่าง)

Phase 2/future sections (ยังไม่มี field ใน mock data — เพิ่มเมื่อ schema ขยาย):

- Actor access context (สิทธิ์ ณ เวลาที่ทำ action)
- Target context เพิ่มเติมนอกเหนือ reference
- FO impact
- Related events ผ่าน correlation ID
- Request/session metadata (IP, session ID, user agent)
- Export/download metadata สำหรับ export event

Admin access ที่ไม่มีสิทธิ์ต้องเห็น masked payload หรือ permission denied section

## 11. Retention

Baseline retention:

- Audit log เก็บอย่างน้อย 1 ปี
- Security, permission, export, sensitive reveal และ destructive/public-impact actions ควรเก็บนานกว่า 1 ปีถ้า policy อนุญาต
- Retention cleanup ต้องเป็น system job ที่ audit ตัวเอง
- ห้ามให้ Admin ลบ audit record แบบ manual จาก UI ปกติ

## 12. Export Rules

- Full audit export เฉพาะ Admin
- Export ต้อง audit-log ตัวเอง
- Export ขนาดใหญ่ใช้ background job
- Export file ต้องมี expiry หรือ controlled access
- Sensitive fields ใน export ต้อง respect Admin Permission และ masking policy
- Export ควรระบุ filter ที่ใช้, admin ที่ export, timestamp และ file checksum ถ้ามี

## 13. Responsive Layout

| Width | Requirement |
| --- | --- |
| Mobile-width browser | Audit rows เป็น stacked cards, filter bar stack แนวตั้ง 1 คอลัมน์ (เปิด/ปิดตัวกรองได้), detail เปิดเป็น right drawer แบบ sections |
| Tablet | Table แสดงครบทุก column (เลื่อนแนวนอนเมื่อจอแคบ), filter bar บรรทัดเดียว, เปิด detail drawer |
| Desktop | Full table, filter bar ด้านบนตาราง, detail เป็น right sidebar drawer (export controls อยู่ Phase 2) |

Before/after JSON diff ต้อง wrap และ scroll ภายใน container ไม่ทำให้หน้าจอ overflow

## 14. Error, Empty, Loading States

ต้องรองรับ:

- Empty audit list
- No search result
- Partial payload masked
- Permission denied
- Export failed
- Audit detail not found
- Related event load failed
- Large payload loading

## 15. Integration With Other Modules

| Module | Integration |
| --- | --- |
| Auth / Admin Accounts | Login, session, admin lifecycle audit — Admin Detail > History & Actions มี audit ref link (`AUD-xxx`) กระโดดมา Audit Log กรองด้วย event id + toast |
| User Management | Suspend/ban/reset/archive audit |
| Asset Management | Flag/remove/status/sensitive reveal audit |
| Content / Board | Publish/archive/category/banner audit |
| Market Data | Provider sync, manual override, price index audit |
| Account Deletion | Request lifecycle audit (ขอลบ/คืน/ปฏิเสธคืน/auto delete/dependency check) — Request Detail > History & Actions มีคอลัมน์ Audit กระโดดมา Audit Log กรองด้วย event id + toast |
| Directory | Future/postponed; activate/inactivate/import/export audit only when Directory scope is reopened |
| Help / Support | Policy draft/publish/archive/restore และ Support Center update audit |
| Dashboard | Recent activity feed และ SLA/queue context — ไม่มี audit jump link จาก Dashboard (ตัดออก 16/09: audit link เหมาะอยู่ใน detail/history context เท่านั้น) |
| Reports (Phase 2/future) | Export audit events และ report export history |
| Admin Settings | Permission/system setting changes audit |

ทิศทางกลับ (Audit Log → module): Reference pill ใน detail drawer jump ไปหน้า entity detail ตาม prefix (ADM / DEL / AST / ART / RCO / U-) — ref ที่ map ไม่ได้จะกรอง Audit Log ด้วย ref นั้นแทน; ปุ่ม back จาก entity detail กลับมา Audit Log พร้อม filter state เดิม และทุก jump-in ตั้ง nav active ที่ Settings > Audit Log เหมือนเข้าผ่านเมนู

## Module-Specific Exceptions

ไม่มี

Audit Log ต้องใช้ app shell, navigation, breakpoint, list toolbar, desktop table/grid, mobile card, pagination, reset และ detail ตาม `00_GLOBAL_RULES_MODULE.md` และ `../Prototypes/bo-prototype.html` โดยไม่มี UI/layout override เฉพาะโมดูล

## 16. Acceptance Criteria

| ID | Criteria |
| --- | --- |
| AC-BO-AUDIT-001 | ทุก BO write action สำคัญต้องสร้าง audit event |
| AC-BO-AUDIT-002 | Destructive/public-impact action ต้องมี before/after, reason และ actor context |
| AC-BO-AUDIT-003 | Sensitive data reveal/export ต้องถูก audit |
| AC-BO-AUDIT-004 | Provider sync/import/export/background job ต้องถูก audit |
| AC-BO-AUDIT-005 | Audit log read ได้ตาม Admin Permission และ full access เฉพาะ Admin |
| AC-BO-AUDIT-006 | Audit record ต้อง immutable จาก admin UI ปกติ |
| AC-BO-AUDIT-007 | Search/filter/sort/pagination ทำงานแบบ server-side |
| AC-BO-AUDIT-008 | Export audit log ต้อง audit ตัวเองและควบคุมสิทธิ์ |
| AC-BO-AUDIT-009 | Retention baseline อย่างน้อย 1 ปี |
| AC-BO-AUDIT-010 | UI responsive ใช้งานได้ที่ mobile-width, tablet และ desktop |
| AC-BO-AUDIT-011 | Audit Log List ใช้ standard table pattern — full-width panel, ไม่มี KPI cards, responsive table-to-card, pagination 10/หน้า, filter bar เปิด/ปิด + reset + state persist |
| AC-BO-AUDIT-012 | คลิกแถวเปิด read-only detail drawer แสดง Event Summary / Before-After diff / Reason-Note ครบ — ซ่อน field/section ที่ไม่มีข้อมูล รวมถึง Before/After เมื่อค่าเท่ากัน |
| AC-BO-AUDIT-013 | Date range filter กรอง event ตามช่วงวันที่ และ picker sync min/max ให้ from ≤ to เสมอ |
| AC-BO-AUDIT-014 | Reference pill ใน detail drawer jump ไป entity detail ตาม prefix (ADM/DEL/AST/ART/RCO/U-) หรือ fallback กรอง Audit Log ด้วย ref + toast |
| AC-BO-AUDIT-015 | Audit ref link จาก Account Deletion > History & Actions และ Admin Accounts > History & Actions กระโดดมา Audit Log กรองด้วย event id + toast ยืนยัน — jump-in เริ่มจาก filter state สะอาดเสมอและ nav active ที่ Settings > Audit Log |
| AC-BO-AUDIT-016 | Admin identity lifecycle ใช้ canonical event/risk/result ตาม contract: wrong-current ไม่ audit ต่อครั้ง, ครบ limit จึงมี `RATE_LIMITED` หนึ่ง event, boundary rejection ไม่ mutate/ไม่ audit และ `ADMIN_SESSION_REVOKE_ALL` เป็น aggregate risk Medium หนึ่ง event |
| AC-BO-AUDIT-017 | Audit/Delivery trace ใช้ correlation/reference เดียวกันและห้ามบันทึก password, OTP, raw/hashed invitation/reset token, raw session token, provider credential หรือ secret |

## 17. Open Decisions

| ID | Decision Needed | Current Recommendation |
| --- | --- | --- |
| BO-AUDIT-DEC-001 | Retention ระยะยาวเกิน 1 ปีสำหรับ security/export/sensitive events | เก็บนานกว่า 1 ปีถ้า storage/compliance อนุญาต |
| BO-AUDIT-DEC-002 | Audit write fail ต้อง block action หรือ queue retry | Block high-risk action; queue retry สำหรับ low-risk read/report events |
| BO-AUDIT-DEC-003 | Redaction policy สำหรับข้อมูลส่วนบุคคลใน audit payload | ใช้ masked payload เป็น default และ redaction event แยกเมื่อจำเป็น |
| BO-AUDIT-DEC-004 | ส่ง audit log เข้า external SIEM หรือไม่ | Future phase |
