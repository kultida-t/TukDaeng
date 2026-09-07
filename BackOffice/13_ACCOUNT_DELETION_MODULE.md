# 13 BO Account Deletion Requests Module

**Version:** `BO-13-v0.2`  
**Date:** 2026-09-07  
**Status:** Logic/contract layer reviewed against confirmed decisions  
**Platform:** Responsive Web Back Office

## UI Standards And Prototype Reference

เอกสารนี้ต้องใช้ร่วมกับ `00_GLOBAL_RULES_MODULE.md` และยึดรูปแบบหน้าจอ/พฤติกรรมที่ยืนยันแล้วใน `../Prototypes/bo-prototype.html` เป็นมาตรฐานหลัก

เอกสารอ้างอิง: `../FrontOffice/13_SETTINGS_MODULE.md`, `../FrontOffice/08_OFFER_MODULE.md`, `../FrontOffice/07_CHAT_MODULE.md`, `../FrontOffice/04_ASSET_MANAGEMENT_MODULE.md`, `../FrontOffice/06_PROFILE_MODULE.md`

## 1. Document Information

| Field | Detail |
| --- | --- |
| Module Name | BO Account Deletion Requests |
| Platform | Responsive Web Back Office |
| Version | `BO-13-v0.2` |
| Status | Logic/contract layer reviewed against confirmed decisions |
| Owner | Product / UX / Engineering / Operations |
| Document Type | Functional PRD |

## 2. Objective

Account Deletion Requests Module ใช้ให้ BO ตรวจสอบและติดตามคำขอลบบัญชีที่เริ่มจาก FO Settings > About your account > Delete account

FO ทำหน้าที่รับ confirmation, soft delete/deactivate account, revoke session และพาผู้ใช้กลับ Sign In ส่วน BO ทำหน้าที่เป็น operational queue สำหรับติดตามคำขอ, ดูสถานะล่าสุด, ดูประวัติ, คืน/ปฏิเสธคืนบัญชีในช่วง grace period, archive/anonymization อัตโนมัติ, retention และ audit trail

## 3. Scope

### In Scope

- Account deletion request queue
- Request detail พร้อม user, offer, asset, chat และ retention context
- System action อัตโนมัติ: ยกเลิก offer ที่ Pending + ปิดรายงาน + ซ่อน public surfaces
- ดูสถานะล่าสุด (dependency snapshot) และดูประวัติ
- คืนบัญชี / ปฏิเสธคืนบัญชี โดยแอดมินในช่วง grace period 30 วัน
- Track 30-day grace period
- Archive/anonymization อัตโนมัติตามช่วงเวลา (grace period / retention)
- Export archive report ตาม permission
- Audit log สำหรับทุก action สำคัญ
- Responsive layout สำหรับ desktop, tablet และ mobile

### Out Of Scope

- FO Delete Account UI
- Legal policy drafting
- Payment/transaction settlement workflow
- Fully automated hard delete โดยไม่มี policy approval
- User self-service restore ถ้า Product ยังไม่เปิด scope
- External compliance tool integration

## 4. FO Deletion Contract

FO Settings module กำหนด behavior หลักดังนี้:

- Delete Account ต้องอยู่ใน `About your account`
- Delete Account ต้องไม่อยู่บน Settings Home โดยตรง
- ต้องมี confirmation title `Delete account?`
- เมื่อ confirm สำเร็จ ระบบต้อง soft delete/deactivate account
- ต้อง revoke session และ clear local token ทันที
- ต้องแสดง `Account deletion started` success modal
- ปุ่ม `Back to sign in` พาไปหน้า Sign In / pre-auth
- ใช้ grace period 30 วันก่อน archive อัตโนมัติ และ anonymization หลัง retention ตาม policy
- ระหว่าง grace period user login ไม่ได้ หรือเห็น account-deleted support state
- ถ้า API fail ต้องไม่ revoke session, ไม่ sign out และแสดง retry/error state

เมื่อ FO ส่ง Delete Account request สำเร็จ ระบบต้องทำการอัตโนมัติพร้อมกัน (atomic) ดังนี้ก่อนคำขอเข้าคิว BO:

- ระงับบัญชี (deactivate) และ revoke session
- ซ่อน public profile/assets จาก FO surfaces ทันที (ไม่ต้องรอครบ 30 วัน)
- ยกเลิก offer ที่ยัง `Pending` ทั้ง incoming/outgoing อัตโนมัติ (ไม่มี block)
- ปิดรายงาน (report) ที่ยังเปิดอยู่อัตโนมัติตาม policy (ไม่มี block)
- สร้าง deletion request ในคิว BO สถานะ `รอดำเนินการ`

BO ต้องไม่เปลี่ยน copy หรือ flow ของ FO แต่ต้องรับข้อมูลคำขอและประมวลผลต่อหลัง FO ส่ง request สำเร็จ การยกเลิก offer และปิดรายงานเป็น system action อัตโนมัติที่บันทึก audit ทุกครั้ง ไม่ใช่ block ที่ต้องรอ Admin ตรวจสอบ

## 5. Admin Access And Permissions

ระบบใช้ Admin access เดียว โดยตรวจสิทธิ์ตามเมนูและ action ที่ทำ ไม่แยกประเภทบัญชี Admin ในสเปกนี้

| Access Area | Rule |
| --- | --- |
| Module access | Admin ที่มีสิทธิ์เข้าเมนูสามารถดู list, detail, search และ filter ได้ |
| Write action | Action เช่น create, update, status change, remove, restore, publish, archive, retry และ action ทำนองนี้ ต้องตรวจ permission, แสดง confirmation สำหรับ action ที่มีความเสี่ยงสูง, บังคับกรอก reason เมื่อมีผลต่อ FO/user และบันทึก audit |
| Sensitive data | แสดง masked โดยค่าเริ่มต้น; เปิดเฉพาะเมื่อมี business reason, ผ่าน policy approval และบันทึก audit |
| Export | ต้องตรวจ permission, ควบคุม scope, กำหนด expiry/background job เมื่อจำเป็น และบันทึก audit event ของการ export |
| Direct URL/API | ต้องตรวจสิทธิ์ที่ route, API และ service layer เสมอ; ห้ามพึ่งพาแค่การซ่อน UI |

## 6. Responsive Layout

| Breakpoint | Layout |
| --- | --- |
| Mobile <= 767px | Request list เป็น card stack, filter ใช้ collapsible panel, detail เปิด full screen |
| Tablet 768px - 1199px | List/detail แบบ single column หรือ split view ตามพื้นที่ |
| Desktop >= 1200px | Queue table + detail panel หรือ full detail page พร้อม validation sidebar |

Action ที่มีผล irreversible ต้องมี confirmation และต้องไม่อยู่ใน hover-only control

## 7. Request List

Request list ต้องแสดงข้อมูลขั้นต่ำ:

| Field | Requirement |
| --- | --- |
| Request ID | รหัสคำขอลบบัญชี |
| User | User ID, display name, username/email masked ตาม permission |
| Account Status | Active, Deletion Requested, Deactivated, Archived, Anonymized |
| Request Status | Requested, Blocked, Approved, Archived, Cancelled |
| Pending Offers | จำนวน incoming/outgoing pending offer |
| Assets | จำนวน asset ที่ต้อง hide/archive |
| Chat Rooms | จำนวน chat room ที่ต้อง retain/mask |
| Grace Period Ends | วันที่ครบ 30 วัน |
| Requested At | วันที่ผู้ใช้กด Delete account |
| Processed By | Admin/System ที่ดำเนินการล่าสุด |
| Updated At | วันที่แก้ไขล่าสุด |

## 8. Search & Filters

ต้องค้นหาและกรองได้อย่างน้อย:

- Request ID
- User ID / username / email / phone
- Request status
- Account status
- Has pending offer
- Has accepted offer in retention window
- Grace period state: Active, Ending soon, Expired
- Requested date
- Processed by

## 9. Request Status Contract

ใช้ status กลางต่อไปนี้:

| Status | Meaning | FO Impact |
| --- | --- | --- |
| `รอดำเนินการ` | ผู้ใช้ confirm Delete Account สำเร็จ ระบบระงับ+ไล่ออก+ซ่อน+ยกเลิก offer+ปิดรายงานอัตโนมัติ และคำขอเข้าคิว | FO revoke session แล้วและ user กลับ Sign In; public profile/assets ถูกซ่อนทันที |
| `คืนบัญชีแล้ว` | แอดมินกู้คืนบัญชีให้ผู้ใช้ในช่วง grace period 30 วัน ตาม policy (มีเหตุผล + audit) | บัญชีกลับใช้งานได้ (Active) ต้อง sync account status กลับ + log ใน User Management |
| `ปฏิเสธคืนบัญชี` | แอดมินปฏิเสธคำขอคืนบัญชี (เช่น รายงานร้ายแรง) รอครบ 30 วัน เก็บถาวรอัตโนมัติ (ไม่เริ่มนับใหม่) | User ยัง login ไม่ได้; รอระบบเก็บถาวรอัตโนมัติเมื่อครบ grace period |
| `เก็บถาวรแล้ว` | ครบ grace period 30 วัน ระบบเก็บถาวร (archive) อัตโนมัติ ข้อมูลถูกจัดเก็บตาม retention policy | ไม่มี FO access; public surfaces ยังซ่อน/anonymized ตาม policy |
| `ลบตัวตนแล้ว` | ครบ retention period ระบบลบตัวตน (anonymize) อัตโนมัติ personal fields ถูกแทนที่ด้วย anonymous value | ไม่มี FO access; สมัครใหม่ด้วยอีเมลเดิมได้เป็นบัญชีใหม่ |

หมายเหตุ:

- ไม่มี status `Blocked` หรือ `Approved` เพราะ validation เป็น system action อัตโนมัติ (ยกเลิก offer + ปิดรายงาน) ไม่มี block ที่ต้องรอ Admin ตรวจสอบ
- การเก็บถาวรและลบตัวตนเป็น system job อัตโนมัติตามช่วงเวลา (grace period 30 วัน / retention period) ไม่ใช่ action ที่แอดมินกดทำเอง
- `คืนบัญชีแล้ว` และ `ปฏิเสธคืนบัญชี` เป็น action ของแอดมินในช่วง grace period เท่านั้น หลังเก็บถาวรแล้วไม่สามารถคืนบัญชีได้
- ปุ่ม `คืนบัญชี` และ `ปฏิเสธคืนบัญชี` แสดงตลอดช่วง 30 วัน เพราะผู้ใช้ติดต่อขอคืนผ่านช่องทางภายนอก (support) ระบบ BO ไม่มีทางรู้อัตโนมัติว่าผู้ใช้ขอคืนแล้ว

## 10. Account Status Contract

BO ต้องแยก request status ออกจาก account status:

| Account Status | Meaning |
| --- | --- |
| `Active` | ใช้งาน FO ได้ตามปกติ |
| `Deactivated` | Login/session ถูก block ระหว่าง grace period หลังผู้ใช้กดลบบัญชี |
| `Archived` | ครบ grace period 30 วัน ข้อมูลถูกจัดเก็บตาม retention policy |
| `Anonymized` | ครบ retention period personal fields ถูก anonymize ตาม policy |

ใน flow ปกติหลัง FO confirm สำเร็จ account เข้าสู่ `Deactivated` ทันทีพร้อมการยกเลิก offer/ปิดรายงานอัตโนมัติ ถ้าแอดมินคืนบัญชีในช่วง grace period account ต้อง sync กลับเป็น `Active` พร้อมบันทึกใน Account Status History ของ User Management

### 10.1 Deleted / Restore / Retention Policy

ตาม pattern ทั่วไปของเว็บที่ต้องรองรับ audit, dispute และ compliance ไม่ควร hard delete ทุก record ทันทีหลังผู้ใช้กดลบบัญชี

Recommended lifecycle:

| Account State | When It Happens | Data Handling | Can Restore? |
| --- | --- | --- | --- |
| `Deactivated` | User confirm delete account จาก FO และระบบระงับ+ไล่ออก+ซ่อน+ยกเลิก offer+ปิดรายงานอัตโนมัติ | ซ่อน public profile/assets ทันที; retain data สำหรับ dependency, support และ audit | กู้คืนได้ภายใน grace period 30 วัน โดยแอดมินตาม policy (มีเหตุผล + audit) |
| `Archived` | ครบ grace period 30 วัน ระบบเก็บถาวรอัตโนมัติ | เก็บเฉพาะข้อมูลที่จำเป็น เช่น transaction, offer, chat, report, audit reference; personal fields เริ่มถูก mask ตาม policy | ไม่ควร restore ตรงเป็นบัญชีใช้งาน |
| `Anonymized` | ครบ retention period ระบบลบตัวตนอัตโนมัติ | ลบหรือแทนที่ personal fields เช่น email, phone, display name, profile image ด้วย anonymous value | กู้คืนไม่ได้ |

UI / Reporting rules:

- ใน Account Deletion module สามารถแสดง `ลบตัวตนแล้ว` เป็น label ที่อ่านง่ายสำหรับ deletion สำเร็จสูงสุด
- ใน backend/audit ควรเก็บสถานะละเอียดเป็น `Archived` และ `Anonymized` เพื่อรู้ว่าข้อมูลถูกจัดการถึงขั้นไหนแล้ว
- Prototype ปัจจุบันแสดง `Deleted / Archived` ได้ใน User List/filter เพื่อ historical review ตาม permission; production ต้อง mask/anonymize personal data, จำกัด action และยังต้องค้นย้อนหลังได้ใน Account Deletion, Reports และ Audit ตาม permission
- ข้อมูลย้อนหลังที่เรียกดูได้ต้องเป็นข้อมูลที่จำเป็น เช่น user ID, deletion request ID, dates, processed by, retained offer/chat/report references และ audit event
- Personal data หลัง deletion ต้องถูก mask/anonymize ตาม retention policy และ Admin Permission
- Restore เปิดได้เฉพาะในช่วง grace period 30 วัน โดยแอดมิน พร้อม reason และ audit; หลังเก็บถาวรแล้วไม่สามารถ restore ได้
- หลัง anonymization แล้วไม่ควร restore เพราะข้อมูลส่วนตัวที่ใช้สร้าง account กลับมาอย่างถูกต้องไม่ควรมีอยู่แล้ว

### 10.2 Restore Policy

- Phase 1 เปิดให้แอดมินกู้คืน/ยกเลิกคำขอให้ผู้ใช้ในช่วง grace period 30 วัน โดยมีเหตุผล + บันทึก audit; ไม่มี user self-service (อนาคตเปิดทีหลังได้)
- ปุ่ม `คืนบัญชี` และ `ปฏิเสธคืนบัญชี` แสดงตลอดช่วง 30 วัน เพราะผู้ใช้ติดต่อขอคืนผ่านช่องทางภายนอก (support) ระบบ BO ไม่มีทางรู้อัตโนมัติว่าผู้ใช้ขอคืนแล้ว
- กรณีรายงานร้ายแรง (serious safety/legal report) แอดมินควรปฏิเสธคืนบัญชี และให้ระบบเก็บถาวรอัตโนมัติเมื่อครบ grace period
- การคืนบัญชีต้อง sync account status กลับเป็น `Active` และบันทึก row ใน Account Status History ของ User Management (ขอลบบัญชี / คืนบัญชี / เก็บถาวร / ลบตัวตน)
- การปฏิเสธคืนบัญชีไม่เริ่มนับ grace period ใหม่ ให้รอครบ 30 วันตามเดิมแล้วเก็บถาวรอัตโนมัติ

### 10.3 Re-registration Policy

- หลังลบตัวตน (anonymize) แล้ว ผู้ใช้สามารถสมัครใหม่ด้วยอีเมลเดิมได้ โดยบัญชีใหม่เป็นคนละบัญชี (คนละรหัส) ไม่เชื่อมประวัติเดิม
- เก็บ audit log ของบัญชีเดิมไว้ตาม retention policy
- สอดคล้อง GDPR
- ถ้าอนาคตต้องการกันคนไม่ดีสมัครใหม่ด้วยอีเมลเดิม ใช้แฮชอีเมลเช็คซ้ำ — เก็บเป็น Open Decision DEL-DEC-005 รอ Legal

### 10.4 Sensitive Reveal Policy

- แสดงข้อมูลส่วนตัว (email, phone, LINE, display name) เป็น masked โดยค่าเริ่มต้น
- มีปุ่ม reveal แบบ on-demand ต้องมี permission และบันทึก audit ทุกครั้งที่เปิดเผย
- เปิดเฉพาะเมื่อมี business reason และผ่าน policy approval

## 11. Validation Rules

เมื่อผู้ใช้ confirm Delete Account สำเร็จ ระบบทำ system action อัตโนมัติ (atomic) แทนการ block และรอ Admin ตรวจสอบ:

| Rule | System Action (อัตโนมัติ) |
| --- | --- |
| Pending incoming offer | ยกเลิก offer ที่ยัง `Pending` อัตโนมัติ พร้อมบันทึก audit |
| Pending outgoing offer | ยกเลิก offer ที่ยัง `Pending` อัตโนมัติ พร้อมบันทึก audit |
| Accepted offer retention | เก็บ offer/chat record ไว้ตาม retention policy และ mask personal fields ตาม policy |
| Active Sale asset | ซ่อน asset จาก Feed/Search/Watch Alert/Public Profile ทันที |
| Show/Hide/Sold asset | ซ่อนจาก public surface ทันทีให้สอดคล้องกับ account deletion state |
| Chat history | เก็บตาม retention policy และ mask personal profile fields เมื่อถึงขั้น anonymization |
| Reports/safety records | ปิดรายงานที่ยังเปิดอยู่อัตโนมัติตาม policy พร้อมบันทึก audit; เก็บ record ตาม legal/safety/audit policy |
| Help / Support context | ไม่มี ticket ใน Phase 1 — module 12 เป็น Policy & Versioning + Support Center; support ticket linkage เป็น future scope |

การยกเลิก offer และปิดรายงานเป็น system action ที่บันทึก audit ทุกครั้ง ไม่ใช่ block ที่ต้องรอ Admin ตรวจสอบ แอดมินสามารถตรวจสอบ dependency snapshot ใน request detail ได้แต่ไม่ต้องกด approve เพื่อ archive เพราะ archive เป็น system job อัตโนมัติเมื่อครบ grace period

Offer dependency ต้องใช้ source เดียวกับ `09_OFFER_CHAT_MODULE.md` และต้อง audit ทุกครั้งที่ยกเลิก offer ด้วย system action รายงาน (report) dependency ต้องใช้ source เดียวกับ User Management > Reported Users / Asset Management > Reported Assets และต้อง audit ทุกครั้งที่ปิดรายงานด้วย system action การลบบัญชีไม่ cancel offer หรือปิด dispute โดยไม่มี audit; ต้องให้ module ต้นทางเป็นตัวบันทึกผลและ audit event

## 12. Request Detail

Request detail ต้องมีส่วนข้อมูล:

### 12.1 User Context

- User ID
- Display name / username
- Email / phone / LINE แบบ masked ตาม permission
- Auth method
- Joined date
- Last active
- Current account status
- Current request status

### 12.2 Deletion Timeline

- Requested at
- Session revoked at
- Deactivated at
- Grace period start
- Grace period end
- Last validation run
- Approved at
- Archived at
- Anonymized at
- Cancelled at ถ้ามี

### 12.3 Dependency Summary

- Pending incoming offers
- Pending outgoing offers
- Accepted offers in retention
- Assets by status: Sale, Show, Hide, Sold, Removed/Hidden
- Chat rooms
- Reports/safety cases

### 12.4 Archive / Anonymization Plan

ต้องแสดงว่า field หรือ entity ใดจะถูก hide, retain, archive หรือ anonymize:

| Data | Action |
| --- | --- |
| Public profile | Hide from public surfaces |
| Profile image | Hide or replace placeholder ตาม policy |
| Username / display name | Mask/anonymize เมื่อถึงขั้น policy |
| Email / phone / LINE | Retain masked แล้ว anonymize เมื่อพ้น retention |
| Assets | Hide from Feed/Search/Public Profile/Watch Alert results |
| Offers | Retain status/timeline ตาม audit/dispute policy |
| Chats | Retain content ตาม retention แต่ mask profile identity ตาม policy |
| Reports | Retain ตาม safety/legal/audit policy |
| Audit logs | Retain immutable |

## 13. Admin Actions

แอดมินเปิด Request Detail จาก list เพื่อดูข้อมูลคำขอ (sensitive fields masked ตาม default; reveal ตาม Sensitive Reveal Policy ใน section 10.4 — audit required สำหรับ sensitive reveal) และมี action 5 ปุ่ม:

| Action | Permission | Requirement | Audit |
| --- | --- | --- | --- |
| คืนบัญชี (Restore) | Admin | ใช้ได้เฉพาะในช่วง grace period 30 วัน ต้องมี reason + confirmation; sync account status กลับ `Active` + บันทึกใน Account Status History ของ User Management | Required |
| ปฏิเสธคืนบัญชี (Reject Restore) | Admin | ใช้ได้เฉพาะในช่วง grace period 30 วัน ต้องมี reason (เช่น รายงานร้ายแรง); ไม่เริ่มนับ grace period ใหม่ รอเก็บถาวรอัตโนมัติเมื่อครบ 30 วัน | Required |
| ดูสถานะล่าสุด (View Latest Status) | Admin | ดู dependency snapshot ล่าสุด (offer/asset/chat/report) แบบ read-only | Not required (read-only) |
| ดูประวัติ (View History) | Admin | ดู timeline และ audit history ของคำขอแบบ read-only | Not required (read-only) |
| ส่งออกรายงาน (Export Archive Report) | Admin | ต้องมี reason และ export scope; ควบคุม scope, expiry/background job เมื่อจำเป็น | Required |

หมายเหตุ:

- ปุ่ม `คืนบัญชี` และ `ปฏิเสธคืนบัญชี` แสดงตลอดช่วง grace period 30 วัน (สถานะ `รอดำเนินการ`) ไม่ใช่แสดงเฉพาะเมื่อผู้ใช้ขอคืน
- หลังเก็บถาวร (สถานะ `เก็บถาวรแล้ว`) ปุ่ม `คืนบัญชี` และ `ปฏิเสธคืนบัญชี` ต้องไม่แสดง
- การเก็บถาวรและลบตัวตนเป็น system job อัตโนมัติตามช่วงเวลา ไม่ใช่ manual action ของแอดมิน

## 14. Grace Period Rules

- Grace period baseline: 30 วัน
- Start: เมื่อ Delete Account API สำเร็จและ account ถูก deactivated (พร้อมยกเลิก offer + ปิดรายงานอัตโนมัติ)
- End: `deactivated_at + 30 days`
- ระหว่าง grace period user login ไม่ได้
- Public profile/assets ต้องถูกซ่อนทันที ไม่ต้องรอครบ 30 วัน
- ระหว่าง grace period แอดมินเห็นปุ่ม `คืนบัญชี` และ `ปฏิเสธคืนบัญชี` ตลอด กดได้เมื่อรับเรื่องจาก support
- เมื่อครบ grace period ระบบเก็บถาวร (archive) อัตโนมัติ — ไม่ใช่ manual action ของแอดมิน
- เมื่อครบ retention period (แยกจาก grace period ตาม DEL-DEC-002 รอ Legal/Product) ระบบลบตัวตน (anonymize) อัตโนมัติ
- ถ้าแอดมินปฏิเสธคืนบัญชี ไม่เริ่มนับ grace period ใหม่ ให้รอครบ 30 วันตามเดิมแล้วเก็บถาวรอัตโนมัติ
- ถ้าแอดมินคืนบัญชีในช่วง grace period account กลับเป็น `Active` และคำขอเปลี่ยนเป็น `คืนบัญชีแล้ว`

## 15. FO Visibility Impact

| BO / System State | FO Expected Behavior |
| --- | --- |
| Deletion request succeeded | User ถูก sign out และกลับ Sign In; offer ค้างถูกยกเลิกอัตโนมัติ รายงานถูกปิดอัตโนมัติ |
| Account in grace period | Login ไม่ได้หรือเห็น `Account scheduled for deletion` support state |
| Public profile hidden | Public Profile ต้องไม่แสดงข้อมูลผู้ใช้ปกติ |
| Assets hidden | Asset ไม่ขึ้น Feed, Search, Watch Alert results, Public Profile |
| Account restored by admin | Account status ต้อง sync กลับ `Active` ก่อนอนุญาต login |
| Account archived (auto) | ไม่มี FO access; public surfaces ยังซ่อน/anonymized ตาม policy |
| Account anonymized (auto) | ไม่มี FO access; สมัครใหม่ด้วยอีเมลเดิมได้เป็นบัญชีใหม่ |

## 16. Cross-Module Integration

| Module | Integration |
| --- | --- |
| User Management | Account status sync (`Active`/`Deactivated`/`Archived`/`Anonymized`), profile/contact masking, login block; drill-in จาก User List > action `Open Account Deletion` (protected scope); เพิ่ม row ใน Account Status History ของ User Management บันทึก ขอลบบัญชี / คืนบัญชี / เก็บถาวร / ลบตัวตน (ต้องขอ approval ก่อนแก้ protected scope) |
| Offer Management | ระบบยกเลิก offer ที่ยัง `Pending` อัตโนมัติเมื่อ delete request สำเร็จ; accepted offer เก็บตาม retention policy และ mask personal fields; related chat retention |
| Asset Management | ระบบซ่อน assets จาก FO surfaces (Feed/Search/Watch Alert/Public Profile) ทันทีเมื่อ delete request สำเร็จ |
| Chat | เก็บ chat history ตาม retention policy และ mask personal profile fields เมื่อถึงขั้น anonymization |
| Report (User/Asset) | ระบบปิดรายงานที่ยังเปิดอยู่อัตโนมัติเมื่อ delete request สำเร็จ; เก็บ record ตาม legal/safety/audit policy |
| Help / Support | ไม่มี ticket ใน Phase 1 — module 12 เป็น Policy & Versioning + Support Center; support ticket linkage เป็น future scope |
| Notification | Optional system notification/log for account deletion events ถ้า Product เปิด scope |
| Audit Log | Request create, session revoke, offer cancel auto, report close auto, restore, restore reject, archive auto, anonymize auto, export, sensitive reveal |
| Reports & Analytics | Account deletion report, restore/reject count, archive completion, anonymization completion |

## 17. Audit Requirements

Audit log ต้องบันทึกอย่างน้อย:

Admin actions:
- `ACCOUNT_DELETION_RESTORE` — แอดมินคืนบัญชีในช่วง grace period
- `ACCOUNT_DELETION_RESTORE_REJECT` — แอดมินปฏิเสธคืนบัญชี
- `ACCOUNT_DELETION_EXPORT` — ส่งออกรายงาน
- `ACCOUNT_DELETION_SENSITIVE_REVEAL` — เปิดเผยข้อมูลส่วนตัวแบบ on-demand

System actions (อัตโนมัติ บันทึกโดย system job):
- `ACCOUNT_DELETION_REQUEST_CREATE` — คำขอถูกสร้างหลัง FO confirm สำเร็จ
- `ACCOUNT_DELETION_SESSION_REVOKE` — ระบบ revoke session และ deactivate account
- `ACCOUNT_DELETION_OFFER_CANCEL_AUTO` — ระบบยกเลิก offer ที่ยัง Pending อัตโนมัติ
- `ACCOUNT_DELETION_REPORT_CLOSE_AUTO` — ระบบปิดรายงานที่ยังเปิดอยู่อัตโนมัติ
- `ACCOUNT_DELETION_ARCHIVE_AUTO` — ระบบเก็บถาวรอัตโนมัติเมื่อครบ grace period 30 วัน
- `ACCOUNT_DELETION_ANONYMIZE_AUTO` — ระบบลบตัวตนอัตโนมัติเมื่อครบ retention period

Audit payload ต้องมี:

- `request_id`
- `target_user_id`
- `admin_id` หรือ `system_job_id`
- `old_status`
- `new_status`
- `reason`
- `dependency_snapshot` (offer/asset/chat/report counts ณ เวลา action)
- `retention_policy_version`
- `ip_address`
- `user_agent`
- `created_at`

## 18. Error, Empty, Loading States

| State | Requirement |
| --- | --- |
| Empty queue | แสดงว่าไม่มี deletion request ที่ตรง filter และมีปุ่ม clear filter |
| Loading | Skeleton สำหรับ queue/detail/validation summary |
| Permission denied | ไม่โหลด sensitive archive data |
| Request not found | แสดง not found และกลับ queue ได้ |
| Recheck failed | แสดง error พร้อม retry โดยไม่เปลี่ยน status |
| Archive job failed | คง status เดิมหรือ mark failed ตาม job policy และต้อง audit |
| Export failed | แสดง error และ audit attempt ถ้าเริ่ม export แล้ว |

## Module-Specific Exceptions

ไม่มี

Account Deletion Requests ต้องใช้ app shell, navigation, breakpoint, list toolbar, desktop table/grid, mobile card, pagination, reset และ detail ตาม `00_GLOBAL_RULES_MODULE.md` และ `../Prototypes/bo-prototype.html` โดยไม่มี UI/layout override เฉพาะโมดูล

## 19. Acceptance Criteria

| ID | Criteria |
| --- | --- |
| AC-BO-DEL-001 | BO แสดง deletion request queue พร้อม search/filter/status/grace period/dependency summary ครบ |
| AC-BO-DEL-002 | Request detail แสดง user context, timeline, offers, assets, chats และ reports ได้ |
| AC-BO-DEL-003 | เมื่อผู้ใช้ confirm delete สำเร็จ ระบบยกเลิก offer ที่ Pending และปิดรายงานอัตโนมัติ พร้อมบันทึก audit (ไม่มี block) |
| AC-BO-DEL-004 | ปุ่ม `คืนบัญชี` และ `ปฏิเสธคืนบัญชี` แสดงตลอดช่วง grace period 30 วัน และต้องมี reason + audit |
| AC-BO-DEL-005 | คืนบัญชีต้อง sync account status กลับ `Active` และบันทึกใน Account Status History ของ User Management |
| AC-BO-DEL-006 | หลัง FO delete สำเร็จ account ต้อง login ไม่ได้และ public profile/assets ต้องถูกซ่อนทันทีตาม contract |
| AC-BO-DEL-007 | Grace period 30 วันต้องแสดงใน queue/detail และมี state active/ending soon/expired |
| AC-BO-DEL-008 | ครบ grace period ระบบเก็บถาวรอัตโนมัติ และครบ retention ระบบลบตัวตนอัตโนมัติ พร้อม audit |
| AC-BO-DEL-009 | Sensitive reveal, restore, reject restore และ export ต้องมี audit log |
| AC-BO-DEL-010 | Account Deletion UI ต้อง responsive ที่ 375px, 768px, 1280px และ 1440px |
| AC-BO-DEL-011 | หลังลบตัวตน สมัครใหม่ด้วยอีเมลเดิมได้เป็นบัญชีใหม่ (คนละรหัส) ไม่เชื่อมประวัติเดิม |

## 20. Open Decisions

| ID | Decision Needed | Current Recommendation |
| --- | --- | --- |
| DEL-DEC-001 ✅ | Restore policy | **ยืนยัน Phase 1** — แอดมินยกเลิก/กู้คืนให้ผู้ใช้ในช่วง grace period 30 วัน โดยมีเหตุผล + audit; ไม่มี user self-service (อนาคตเปิดทีหลังได้); รายละเอียดใน section 10.2 |
| DEL-DEC-002 | Retention period ของ chat, offer, report และ audit log ต้องเก็บกี่ปีก่อนลบตัวตน (anonymize) | รอ Legal/Product; กระทบ anonymization job และ data model |
| DEL-DEC-003 ✅ | Anonymization timing | **ยืนยัน: แยก 2 จังหวะ** — Archive หลัง grace period 30 วัน (อัตโนมัติ) / Anonymize หลัง retention period แยก (อัตโนมัติ); รายละเอียดใน section 10.1 และ 14 |
| DEL-DEC-004 ✅ | Sensitive reveal policy | **ยืนยัน: masked default + ปุ่ม reveal on-demand + permission + audit**; รายละเอียดใน section 10.4 |
| DEL-DEC-005 | ถ้าอนาคตต้องการกันคนไม่ดีสมัครใหม่ด้วยอีเมลเดิม ใช้แฮชอีเมลเช็คซ้ำหรือไม่ | รอ Legal; กระทบ re-registration policy และ privacy/compliance; Phase 1 สมัครใหม่ด้วยอีเมลเดิมได้เป็นบัญชีใหม่ตาม section 10.3 |
