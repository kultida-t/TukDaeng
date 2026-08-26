# 08 BO Audit Log Module

**Version:** `BO-08-v0.1`  
**Date:** 2026-07-06  
**Status:** Draft baseline  
**Platform:** Responsive Web Back Office

## UI Standards And Prototype Reference

เอกสารนี้ต้องใช้ร่วมกับ `00_GLOBAL_RULES_MODULE.md` และยึดรูปแบบหน้าจอ/พฤติกรรมที่ยืนยันแล้วใน `../Prototypes/bo-prototype.html` เป็นมาตรฐานหลัก

เอกสารอ้างอิง: `BO_PRD.md`, `BO_Spec.md`

## 1. Document Information

| Field | Detail |
| --- | --- |
| Module Name | BO Audit Log |
| Platform | Responsive Web Back Office |
| Version | `BO-08-v0.1` |
| Status | Draft baseline |
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
- Export audit log ตาม permission
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
- SupportTicket
- AccountDeletionRequest
- Notification
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
- Email OTP sent/verified/failed/resend
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
- Watch Alert disable/enable

### Support / Notification / Settings

- Ticket assign/reply/resolve/close
- Account deletion approve/reject/archive
- Notification template update
- Broadcast send/retry/cancel
- Permission/access update
- System setting update

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

Audit Log UI ต้องรองรับ:

- Search by audit ID
- Search by actor/admin
- Search by target entity ID
- Filter by date range
- Filter by actor access context
- Filter by action type
- Filter by target entity type
- Filter by result status
- Filter by module
- Filter by IP address ถ้ามี
- Filter by correlation ID

ต้องใช้ server-side pagination, filter และ sort

## 10. Audit Detail

Detail view ต้องแสดง:

- Summary ของ event
- Actor context
- Target context
- Before/after value หรือ diff
- Reason/note
- FO impact ถ้ามี
- Related events ผ่าน correlation ID
- Request/session metadata
- Export/download metadata ถ้าเป็น export event

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
| Mobile-width browser | Audit rows เป็น stacked cards, filter อยู่ใน drawer, detail ใช้ sections |
| Tablet | Table แสดง column สำคัญและเปิด detail drawer |
| Desktop | Full table, side filters, detail split panel และ export controls |

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
| Auth / Admin Accounts | Login, Email OTP, session, admin lifecycle audit |
| User Management | Suspend/ban/reset/archive audit |
| Asset Management | Flag/remove/status/sensitive reveal audit |
| Content / Board | Publish/archive/category/banner audit |
| Market Data | Provider sync, manual override, price index audit |
| Directory | Future/postponed; activate/inactivate/import/export audit only when Directory scope is reopened |
| Dashboard | Recent activity feed และ SLA/queue context |
| Reports | Export audit events และ report export history |
| Admin Settings | Permission/system setting changes audit |

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

## 17. Open Decisions

| ID | Decision Needed | Current Recommendation |
| --- | --- | --- |
| BO-AUDIT-DEC-001 | Retention ระยะยาวเกิน 1 ปีสำหรับ security/export/sensitive events | เก็บนานกว่า 1 ปีถ้า storage/compliance อนุญาต |
| BO-AUDIT-DEC-002 | Audit write fail ต้อง block action หรือ queue retry | Block high-risk action; queue retry สำหรับ low-risk read/report events |
| BO-AUDIT-DEC-003 | Redaction policy สำหรับข้อมูลส่วนบุคคลใน audit payload | ใช้ masked payload เป็น default และ redaction event แยกเมื่อจำเป็น |
| BO-AUDIT-DEC-004 | ส่ง audit log เข้า external SIEM หรือไม่ | Future phase |
