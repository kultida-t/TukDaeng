# 13 BO Account Deletion Requests Module

**Version:** `BO-13-v0.6`  
**Date:** 2026-09-09  
**Status:** Screen layer synced with prototype (`DEL-PTO-001` ถึง `DEL-PTO-007`) — lifecycle emails added + mobile Detail Head aligned with other detail pages  
**Platform:** Responsive Web Back Office

## UI Standards And Prototype Reference

เอกสารนี้ต้องใช้ร่วมกับ `00_GLOBAL_RULES_MODULE.md` และยึดรูปแบบหน้าจอ/พฤติกรรมที่ยืนยันแล้วใน `../Prototypes/bo-prototype.html` เป็นมาตรฐานหลัก

เอกสารอ้างอิง: `../FrontOffice/13_SETTINGS_MODULE.md`, `../FrontOffice/08_OFFER_MODULE.md`, `../FrontOffice/07_CHAT_MODULE.md`, `../FrontOffice/04_ASSET_MANAGEMENT_MODULE.md`, `../FrontOffice/06_PROFILE_MODULE.md`

## 1. Document Information

| Field | Detail |
| --- | --- |
| Module Name | BO Account Deletion Requests |
| Platform | Responsive Web Back Office |
| Version | `BO-13-v0.6` |
| Status | Screen layer synced with prototype (`DEL-PTO-001` ถึง `DEL-PTO-007`) — lifecycle emails added + mobile Detail Head aligned with other detail pages |
| Owner | Product / UX / Engineering / Operations |
| Document Type | Functional PRD |

## 2. Objective

Account Deletion Requests Module ใช้ให้ BO ตรวจสอบและติดตามคำขอลบบัญชีที่เริ่มจาก FO Settings > About your account > Delete account

FO ทำหน้าที่รับ confirmation, soft delete/deactivate account, revoke session และพาผู้ใช้กลับ Sign In ส่วน BO ทำหน้าที่เป็น operational queue สำหรับติดตามคำขอ, ดูสถานะล่าสุด, ดูประวัติ, คืน/ปฏิเสธคืนบัญชีในช่วง grace period, ลบบัญชีอัตโนมัติ (เก็บถาวร + ลบตัวตน ในขั้นเดียวเมื่อครบ grace period), retention และ audit trail

## 3. Scope

### In Scope

- Account deletion request queue
- Request detail พร้อม user, offer, asset, chat และ retention context
- System action อัตโนมัติ: ยกเลิก offer ที่ Pending + ปิดรายงาน + ซ่อน public surfaces
- ดูสถานะล่าสุด (dependency snapshot) และดูประวัติ
- คืนบัญชี / ปฏิเสธคืนบัญชี โดยแอดมินในช่วง grace period 30 วัน
- Track 30-day grace period
- ลบบัญชีอัตโนมัติเมื่อครบ grace period 30 วัน (เก็บถาวร + ลบตัวตน ในขั้นเดียว); retention ของข้อมูลแยกตาม policy
- Export archive report ตาม permission (ไม่แสดงเป็นปุ่มใน prototype Phase 1 — future scope)
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
- ใช้ grace period 30 วัน ก่อนระบบลบบัญชีอัตโนมัติ (เก็บถาวร + ลบตัวตน ในขั้นเดียว) เมื่อครบกำหนด
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

Request list เป็น full-width panel ตาม pattern ของ Reported Users — ไม่มี KPI summary cards (ข้อมูลสรุปซ้ำซ้อนกับตารางและ filter; archive/anonymize เป็น system job อัตโนมัติ) แสดงตาราง 7 คอลัมน์ + action ดังนี้

| Column | Requirement |
| --- | --- |
| Request ID | รหัสคำขอลบบัญชี (เช่น `DEL-033`) เป็นคอลัมน์หลักและ title ของ mobile card |
| User | Display name เป็น link button เปิด User Detail พร้อม User ID แสดงบรรทัดรองใต้ชื่อ |
| Assets | จำนวน asset ที่ผูกกับคำขอ |
| Request Status | Pill สถานะคำขอ: `รอดำเนินการ` (อำพัน), `คืนบัญชีแล้ว` (เขียว), `ปฏิเสธคืนบัญชี` (แดง), `ลบตัวตนแล้ว` (ถ่าน) |
| Account Status | Pill สถานะบัญชี: `Active` (เขียว), `Deactivated` (อำพัน), `Anonymized` (ถ่าน) |
| Grace Period | Countdown pill เฉพาะช่วงที่ยังนับอยู่ — `เหลือ X วัน` (น้ำเงิน/อำพันตามความใกล้ครบกำหนด), `ครบแล้ว` (แดง); คำขอที่จบแล้ว (คืนบัญชี/ลบตัวตน) แสดง `—` เพราะซ้ำกับ request status |
| Requested At | วันที่ผู้ใช้กด Delete account |
| Action | Row menu `...` มี 1 รายการ: ดูรายละเอียด (desktop/tablet เท่านั้น); คลิกแถวเปิด Request Detail |

Responsive: desktop/tablet เป็นตาราง, mobile <= 767px เป็น card stack — Request ID เป็นพาดหัว ตามด้วย pills สถานะคำขอ + grace period (แสดงเฉพาะช่วงที่ยังนับอยู่), tag จำนวน assets และ meta (User ID, User, Account Status, Requested At); การ์ดบน mobile ไม่แสดงปุ่ม `...` เพราะเมนูมีรายการเดียวซ้ำกับการคลิกการ์ดที่เปิด Request Detail อยู่แล้ว

หัวหน้า list: breadcrumb `งานตรวจสอบและบริการ / Account Deletion`, page title `Account Deletion Requests`, panel title `Deletion Requests List` — ไม่มี primary action ที่หัวหน้า (admin action ทำใน Request Detail)

Pagination 10 รายการ/หน้า พร้อม footer แสดงช่วงรายการ (เช่น `แสดง 1-10 จาก 12`) และ empty state `ไม่มีคำขอลบบัญชี` เมื่อไม่มีรายการที่ตรงเงื่อนไข

## 8. Search & Filters

Filter bar ใช้รูปแบบเดียวกับหน้า list ที่ล็อก — ปุ่มเปิด/ปิดตัวกรอง + ปุ่มรีเซ็ตค่าทั้งหมด (icon-only) ประกอบด้วย:

- Search box — ค้นหา Request ID, User ID, ชื่อ (ครอบคลุมสถานะคำขอ สถานะบัญชี และ detail ของคำขอ)
- Filter request status — สถานะคำขอทั้งหมด / `รอดำเนินการ` / `คืนบัญชีแล้ว` / `ปฏิเสธคืนบัญชี` / `ลบตัวตนแล้ว`
- Filter grace period state — สถานะระยะผ่อนผันทั้งหมด / ยังนับอยู่ / ใกล้ครบกำหนด / ครบแล้ว / คืนบัญชีแล้ว / ลบตัวตนแล้ว
- Sort — ล่าสุดก่อน (default) / เก่าสุดก่อน / วันครบกำหนด / สถานะคำขอ

ตัวกรองและคำค้นต้องคงสถานะไว้เมื่อ drill-in ไป Request Detail แล้วกลับมาที่ list

## 9. Request Status Contract

ใช้ status กลางต่อไปนี้:

| Status | Meaning | FO Impact |
| --- | --- | --- |
| `รอดำเนินการ` | ผู้ใช้ confirm Delete Account สำเร็จ ระบบระงับ+ไล่ออก+ซ่อน+ยกเลิก offer+ปิดรายงานอัตโนมัติ และคำขอเข้าคิว | FO revoke session แล้วและ user กลับ Sign In; public profile/assets ถูกซ่อนทันที |
| `คืนบัญชีแล้ว` | แอดมินกู้คืนบัญชีให้ผู้ใช้ในช่วง grace period 30 วัน ตาม policy (มีเหตุผล + audit) | บัญชีกลับใช้งานได้ (Active) ต้อง sync account status กลับ + log ใน User Management |
| `ปฏิเสธคืนบัญชี` | แอดมินปฏิเสธคำขอคืนบัญชี (เช่น รายงานร้ายแรง) รอครบ 30 วันแล้วระบบลบบัญชีอัตโนมัติ (ไม่เริ่มนับใหม่) | User ยัง login ไม่ได้; รอระบบลบบัญชีอัตโนมัติเมื่อครบ grace period |
| `ลบตัวตนแล้ว` | ครบ grace period 30 วัน ระบบลบบัญชีอัตโนมัติ — เก็บถาวร + ลบตัวตน ในขั้นเดียว personal fields ถูกแทนที่ด้วย anonymous value | ไม่มี FO access; public surfaces ยังซ่อน; สมัครใหม่ด้วยอีเมลเดิมได้เป็นบัญชีใหม่ |

หมายเหตุ:

- ไม่มี status `Blocked` หรือ `Approved` เพราะ validation เป็น system action อัตโนมัติ (ยกเลิก offer + ปิดรายงาน) ไม่มี block ที่ต้องรอ Admin ตรวจสอบ
- การลบบัญชีอัตโนมัติ (เก็บถาวร + ลบตัวตน ในขั้นเดียว) เป็น system job เมื่อครบ grace period 30 วัน ไม่ใช่ action ที่แอดมินกดทำเอง
- `คืนบัญชีแล้ว` และ `ปฏิเสธคืนบัญชี` เป็น action ของแอดมินในช่วง grace period เท่านั้น หลังลบบัญชีอัตโนมัติแล้วไม่สามารถคืนบัญชีได้
- ปุ่ม `คืนบัญชี` และ `ปฏิเสธคืนบัญชี` แสดงตลอดช่วง 30 วัน เพราะผู้ใช้ติดต่อขอคืนผ่านช่องทางภายนอก (support) ระบบ BO ไม่มีทางรู้อัตโนมัติว่าผู้ใช้ขอคืนแล้ว

## 10. Account Status Contract

BO ต้องแยก request status ออกจาก account status:

| Account Status | Meaning |
| --- | --- |
| `Active` | ใช้งาน FO ได้ตามปกติ |
| `Deactivated` | Login/session ถูก block ระหว่าง grace period หลังผู้ใช้กดลบบัญชี |
| `Anonymized` | ครบ grace period 30 วัน ระบบลบบัญชีอัตโนมัติ (เก็บถาวร + ลบตัวตน ในขั้นเดียว) personal fields ถูก anonymize ตาม policy |

ใน flow ปกติหลัง FO confirm สำเร็จ account เข้าสู่ `Deactivated` ทันทีพร้อมการยกเลิก offer/ปิดรายงานอัตโนมัติ ถ้าแอดมินคืนบัญชีในช่วง grace period account ต้อง sync กลับเป็น `Active` พร้อมบันทึกใน Account Status History ของ User Management

### 10.1 Deleted / Restore / Retention Policy

ตาม pattern ทั่วไปของเว็บที่ต้องรองรับ audit, dispute และ compliance ไม่ควร hard delete ทุก record ทันทีหลังผู้ใช้กดลบบัญชี

Recommended lifecycle:

| Account State | When It Happens | Data Handling | Can Restore? |
| --- | --- | --- | --- |
| `Deactivated` | User confirm delete account จาก FO และระบบระงับ+ไล่ออก+ซ่อน+ยกเลิก offer+ปิดรายงานอัตโนมัติ | ซ่อน public profile/assets ทันที; retain data สำหรับ dependency, support และ audit | กู้คืนได้ภายใน grace period 30 วัน โดยแอดมินตาม policy (มีเหตุผล + audit) |
| `Anonymized` | ครบ grace period 30 วัน ระบบลบบัญชีอัตโนมัติ — เก็บถาวร + ลบตัวตน ในขั้นเดียว | เก็บเฉพาะข้อมูลที่จำเป็น เช่น transaction, offer, chat, report, audit reference; personal fields ถูกแทนที่ด้วย anonymous value ตาม policy | กู้คืนไม่ได้ |

UI / Reporting rules:

- ใน Account Deletion module แสดง `ลบตัวตนแล้ว` เป็นสถานะปลายทางของ deletion (เก็บถาวร + ลบตัวตน เกิดพร้อมกันเมื่อครบ grace period)
- ใน backend/audit บันทึก event ลบบัญชีอัตโนมัติเป็นขั้นเดียว; retention ของข้อมูลแต่ละประเภท (chat, offer, report, audit log) ยังอ้าง DEL-DEC-002
- Prototype ปัจจุบันแสดงสถานะ `Deletion Requested` (รอลบบัญชี) และ `Deleted` ใน User List/filter เพื่อ historical review ตาม permission; production ต้อง mask/anonymize personal data, จำกัด action และยังต้องค้นย้อนหลังได้ใน Account Deletion และ Audit ตาม permission (ก่อนหน้านี้ระบุให้ดูใน Account Deletion, Reports และ Audit แต่ Reports ถูกเลื่อนเป็น Phase 2/future scope แล้ว ใน Phase 1 จึงดูย้อนหลังได้ใน Account Deletion และ Audit เท่านั้น)
- ข้อมูลย้อนหลังที่เรียกดูได้ต้องเป็นข้อมูลที่จำเป็น เช่น user ID, deletion request ID, dates, processed by, retained offer/chat/report references และ audit event
- Personal data หลัง deletion ต้องถูก mask/anonymize ตาม retention policy และ Admin Permission
- Restore เปิดได้เฉพาะในช่วง grace period 30 วัน โดยแอดมิน พร้อม reason และ audit; หลังลบบัญชีอัตโนมัติแล้วไม่สามารถ restore ได้
- หลังลบบัญชีอัตโนมัติ (anonymize รวมในขั้นเดียว) แล้วไม่ควร restore เพราะข้อมูลส่วนตัวที่ใช้สร้าง account กลับมาอย่างถูกต้องไม่ควรมีอยู่แล้ว

### 10.2 Restore Policy

- Phase 1 เปิดให้แอดมินกู้คืน/ยกเลิกคำขอให้ผู้ใช้ในช่วง grace period 30 วัน โดยมีเหตุผล + บันทึก audit; ไม่มี user self-service (อนาคตเปิดทีหลังได้)
- ปุ่ม `คืนบัญชี` และ `ปฏิเสธคืนบัญชี` แสดงตลอดช่วง 30 วัน เพราะผู้ใช้ติดต่อขอคืนผ่านช่องทางภายนอก (support) ระบบ BO ไม่มีทางรู้อัตโนมัติว่าผู้ใช้ขอคืนแล้ว
- กรณีรายงานร้ายแรง (serious safety/legal report) แอดมินควรปฏิเสธคืนบัญชี และให้ระบบลบบัญชีอัตโนมัติเมื่อครบ grace period
- การคืนบัญชีต้อง sync account status กลับเป็น `Active` และบันทึก row ใน Account Status History ของ User Management (ขอลบบัญชี / คืนบัญชี / ปฏิเสธคืนบัญชี / ลบบัญชีอัตโนมัติ)
- การปฏิเสธคืนบัญชีไม่เริ่มนับ grace period ใหม่ ให้รอครบ 30 วันตามเดิมแล้วระบบลบบัญชีอัตโนมัติ

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

การยกเลิก offer และปิดรายงานเป็น system action ที่บันทึก audit ทุกครั้ง ไม่ใช่ block ที่ต้องรอ Admin ตรวจสอบ แอดมินสามารถตรวจสอบ dependency snapshot ใน request detail ได้แต่ไม่ต้องกด approve เพราะการลบบัญชีเป็น system job อัตโนมัติเมื่อครบ grace period

Offer dependency ต้องใช้ source เดียวกับ `09_OFFER_CHAT_MODULE.md` และต้อง audit ทุกครั้งที่ยกเลิก offer ด้วย system action รายงาน (report) dependency ต้องใช้ source เดียวกับ User Management > Reported Users / Asset Management > Reported Assets และต้อง audit ทุกครั้งที่ปิดรายงานด้วย system action การลบบัญชีไม่ cancel offer หรือปิด dispute โดยไม่มี audit; ต้องให้ module ต้นทางเป็นตัวบันทึกผลและ audit event

## 12. Request Detail

Request detail เป็น full-width page ตาม pattern ของ Report Detail + Offer Detail — เปิดจากการคลิกแถวใน list หรือ drill-in ข้ามโมดูล มี back button `กลับไป Deletion Requests` และ breadcrumb `งานตรวจสอบและบริการ / Account Deletion / Requests / <Request ID>`

Detail Head แสดง profile image + `<Request ID> : <Display Name>` พร้อม chips: สถานะคำขอ, สถานะบัญชี และ `Serious flag` pill (แดง — แสดงเฉพาะคำขอที่มีรายงานร้ายแรงและยังอยู่ในช่วง grace period เป็นสัญญาณประกอบการตัดสินใจ reject/restore) — ส่วนหัว panel แสดง panel title เป็น Request ID พร้อม subtitle `<User ID> · <Display Name> · sensitive fields masked`

### 12.1 User Context

ข้อมูลพื้นฐานเท่านั้น — ไม่แสดง email/phone/LINE บนหน้า detail (sensitive fields masked; ดูข้อมูลติดต่อที่ User Detail ผ่านลิงก์ชื่อผู้ใช้ ตาม Sensitive Reveal Policy ใน section 10.4)

- User ID
- Display Name (link เปิด User Detail)
- Username
- Auth method
- Joined date
- Last active

### 12.2 Deletion Timeline

Vertical timeline ตามลำดับขั้น lifecycle แต่ละขั้นแสดง label + วันที่ (ถ้ามี) + สถานะขั้น (`เสร็จสิ้น` / `ปัจจุบัน` / `รอดำเนินการ`) — ขั้นที่ยังไม่ถึงหรือข้าม (เช่น คืนบัญชีก่อนครบกำหนด) ไม่แสดง:

| Step | แสดงเมื่อ |
| --- | --- |
| คำขอลบบัญชี | มีวันที่ requested at |
| ระงับบัญชี + เริ่มช่วงรอลบบัญชี | ระบบ deactivate + revoke session แล้ว (รวม session revoked = deactivated = grace start ไว้ในขั้นเดียว) |
| ช่วงรอลบบัญชี (30 วัน) | แสดงช่วง `grace start → grace end`; ครบกำหนดแล้วเป็น `เสร็จสิ้น` |
| คืนบัญชี | เฉพาะคำขอที่แอดมินคืนบัญชี (restored at) |
| รอลบบัญชีอัตโนมัติ | เฉพาะเมื่อครบ 30 วันแล้วรอ system job รอบถัดไป |
| ลบบัญชีอัตโนมัติ | ครบ grace period — ลบบัญชี + ลบตัวตนเกิดพร้อมกันในขั้นเดียว |

ส่วนเสริมใต้ timeline:

- Countdown `เหลือ X วัน ถึงลบบัญชีอัตโนมัติ` — เฉพาะช่วง grace period ที่ยังนับอยู่; เมื่อครบกำหนดแสดง `ครบกำหนดลบบัญชีอัตโนมัติแล้ว — ระบบจะลบบัญชีในรอบถัดไป`
- Note `ผู้ใช้ขอคืนบัญชีผ่านช่องทาง support` (ถ้ามี — ไม่แสดงวันที่/ช่องทางเพราะยืนยันเวลาจริงไม่ได้; ซ่อนเมื่อคืนบัญชีแล้ว)
- Note ปฏิเสธคืนบัญชี `ปฏิเสธคืนบัญชีเมื่อ <วันที่> โดย <แอดมิน> — เหตุผล: ...` (ถ้ามี; รองรับการปฏิเสธซ้ำ)
- Note `Cancelled: <วันที่>` กรณีคำขอถูกยกเลิก

### 12.3 Dependency Summary

ภาพรวม 6 ช่อง — รายละเอียดแยกตามสถานะดูที่โมดูลต้นทาง จำนวนที่มากกว่า 0 เป็น link เปิด drill-in แบบ read-only ไปยังโมดูลต้นทางพร้อมกรองด้วย User ID ของคำขอ:

| Tile | Drill-in |
| --- | --- |
| Pending Incoming Offers | Offer Management (กรองด้วย userId) |
| Pending Outgoing Offers | Offer Management (read-only) |
| Accepted Offers (Retention) | Offer Management (read-only) |
| Assets (Total) | Asset Management > Asset List (กรองด้วย userId) |
| Chat Rooms | ไม่มีโมดูลแชทใน BO — แสดงข้อความว่าเนื้อหาแชทเก็บตาม retention policy และ mask ตัวตนผู้ใช้ |
| Reports / Safety Cases | User Management > Reported Users (กรองด้วย userId) |

### 12.4 Deletion Plan

ตาราง Data / Action บอกว่าข้อมูลแต่ละอย่างจะถูกจัดการอย่างไรเมื่อครบช่วงรอลบบัญชี:

| Data | Action |
| --- | --- |
| Public profile | ซ่อนจากหน้าสาธารณะทันที |
| Profile image | ซ่อนหรือแทนด้วยรูป placeholder ตาม policy |
| Username / display name | แทนที่ด้วย anonymous value เมื่อครบช่วงรอลบบัญชี |
| Email / phone / LINE | แทนที่ด้วย anonymous value เมื่อครบช่วงรอลบบัญชี |
| Assets | ซ่อนจาก Feed / ค้นหา / โปรไฟล์สาธารณะ / Watch Alert |
| Offers | เก็บสถานะและ timeline ตาม policy การตรวจสอบ/ข้อพิพาท |
| Chats | เก็บเนื้อหาตาม retention แต่ mask ตัวตนผู้ใช้ |
| Reports | เก็บตาม policy ด้านความปลอดภัย/กฎหมาย/การตรวจสอบ |
| Audit logs | ลบบัญชีแล้วไม่สามารถแก้ไขได้ |

### 12.5 History & Actions

ส่วน action area ด้านท้ายประกอบด้วย:

- ตารางประวัติการดำเนินการ (read-only): วันที่ / เวลา, ผู้ดำเนินการ, Action, ส่งอีเมล, Audit, รายละเอียด — รวม event ขอลบบัญชี, ยกเลิก session, ระงับบัญชี + ยกเลิก offer/ปิดรายงานอัตโนมัติ, รับคำขอคืนบัญชี (ผ่าน support — ไม่แสดงวันที่เพราะยืนยันเวลาจริงไม่ได้ ใช้ `—`), ปฏิเสธคืนบัญชี (ทุกครั้ง), คืนบัญชี, ลบบัญชีอัตโนมัติ และยกเลิกคำขอ (ถ้ามี) — คอลัมน์ ส่งอีเมล แสดงสถานะการส่งอีเมล lifecycle (pill `ส่งแล้ว` + ลิงก์ไป delivery log ใน Settings > Delivery Logs) ตาม pattern Admin Action History ของ Report Detail; event ที่ไม่มีอีเมล lifecycle แสดง `—` — คอลัมน์ Audit แสดง audit ref link (`AUD-xxx`) ของ event นั้น คลิกกระโดดไป Settings > Audit Log กรองด้วย event id + toast (row ที่ไม่มี audit event แสดง `—`)
- ปุ่ม action 2 ปุ่ม: `คืนบัญชี` (primary) และ `ปฏิเสธคืนบัญชี` (danger) — แสดงเฉพาะช่วง grace period (สถานะ `รอดำเนินการ` / `ปฏิเสธคืนบัญชี` ที่ยังนับหรือครบกำหนด) หลังคำขอจบ (คืนบัญชีแล้ว / ลบตัวตนแล้ว) ปุ่มไม่แสดง และไม่แสดง note อธิบาย — สถานะคำขอใน Detail Head และตารางประวัติ (event คืนบัญชี / ลบบัญชีอัตโนมัติ) บอกเหตุผลอยู่แล้ว

## 13. Admin Actions

แอดมินเปิด Request Detail จาก list เพื่อดูข้อมูลคำขอ (sensitive fields masked ตาม default; ข้อมูล sensitive ดูได้ที่ User Detail ผ่านลิงก์ชื่อผู้ใช้ ตาม Sensitive Reveal Policy ใน section 10.4) และมี action 2 ปุ่ม แสดงเฉพาะช่วง grace period (สถานะ `รอดำเนินการ` / `ปฏิเสธคืนบัญชี` ที่ยังนับหรือครบกำหนด):

| Action | Permission | Requirement | Audit |
| --- | --- | --- | --- |
| คืนบัญชี (Restore) | Admin | ใช้ได้เฉพาะในช่วง grace period 30 วัน ต้องมี reason + confirmation; sync account status กลับ `Active` + บันทึกใน Account Status History ของ User Management | Required |
| ปฏิเสธคืนบัญชี (Reject Restore) | Admin | ใช้ได้เฉพาะในช่วง grace period 30 วัน ต้องมี reason (เช่น รายงานร้ายแรง); ไม่เริ่มนับ grace period ใหม่ รอลบบัญชีอัตโนมัติเมื่อครบ 30 วัน; ปฏิเสธซ้ำได้ — ปุ่มยังแสดงหลังปฏิเสธ | Required |

ข้อมูล `ดูสถานะล่าสุด` (dependency snapshot) และ `ดูประวัติ` (timeline + audit history) ไม่แสดงเป็นปุ่มแยก เพราะข้อมูลอยู่ในหน้า detail แล้ว (Dependency Summary ใน section 12.3 และ Deletion Timeline + History & Actions ใน section 12.2/12.5) ส่วน `ส่งออกรายงาน` ไม่แสดงเป็นปุ่มใน prototype Phase 1 (export เป็น future scope — ดู state Export failed ใน section 18)

### 13.1 Modal คืนบัญชี (Restore Account)

Confirmation modal ตาม pattern ของ Reported Users action flow (context note + reason + note + impact + confirm + result + audit):

| ส่วน | Copy |
| --- | --- |
| Title | `Restore Account` |
| Summary | คืนบัญชีให้ผู้ใช้กลับมาใช้งานได้ทันที ระบบจะยกเลิกคำขอลบบัญชีและคืนสถานะบัญชีเป็น Active |
| Target | ชื่อผู้ใช้ + `<Request ID> · <User ID>` + pill สถานะคำขอ |
| Context note (ถ้ามี) | `ผู้ใช้ขอคืนบัญชี: <รายละเอียดจาก support>` (แสดงเฉพาะเมื่อมี restore request) |
| Reason (required) | label `เหตุผลการคืนบัญชี` — ตัวเลือก: `ผู้ใช้ติดต่อ support และยืนยันตัวตนแล้ว` / `ตรวจสอบแล้วไม่พบความเสี่ยงเพิ่มเติม` / `ทีมช่วยเหลืออนุมัติให้กลับมาใช้งานได้` / `คำขอลบบัญชีเกิดจากความผิดพลาด` |
| Note / หมายเหตุ (optional) | placeholder: สรุปผลการตรวจสอบ เหตุผลที่คืนบัญชี และข้อมูลอ้างอิงที่เกี่ยวข้อง |
| Impact note | `ผลกระทบต่อผู้ใช้: บัญชีกลับเป็น Active ผู้ใช้เข้าสู่ระบบได้ทันที และคำขอลบบัญชีถูกยกเลิก` |
| Email note | `แจ้งผู้ใช้: ระบบจะส่งอีเมลแจ้งผลไปที่ <registered owner email> (registered owner email)` — ช่องทางหลักเป็นอีเมล ตาม pattern Account Status Email |
| Email preview | `details > ดูตัวอย่างอีเมลแจ้งเตือน` แสดงหัวข้อ + เนื้อหาอีเมล (TH/EN) ตาม action + reason — ตาม pattern email-preview ของ asset actions; อัปเดตตาม reason ที่เลือกแบบ live |
| Confirm / Cancel | `ยืนยัน` (primary) / `ยกเลิก` |
| Result | `<Display Name> คืนบัญชีแล้ว — สถานะกลับเป็น Active` + บรรทัดบันทึก `บันทึกการดำเนินการ: <วันที่เวลา>` + success toast; sync สถานะบัญชีกลับ `Active` ใน User Management (list + detail + รายงานที่ผูกกับผู้ใช้) และบันทึก row ใน Account Status History |

หลังยืนยัน: สถานะบัญชีกลับเป็น `Active` และผู้ใช้เข้าสู่ระบบได้ทันที; คำขอลบบัญชีถูกยกเลิกและไม่เริ่มนับช่วงรอลบบัญชีใหม่; ปุ่ม action หายไปจาก detail; บันทึก audit พร้อม admin, reason และเวลาดำเนินการ (ปฏิเสธก่อนหน้ายังอยู่ในประวัติ)

### 13.2 Modal ปฏิเสธคืนบัญชี (Reject Restore)

| ส่วน | Copy |
| --- | --- |
| Title | `Reject Restore` |
| Summary | ปฏิเสธคำขอคืนบัญชี ระบบยังคงช่วงรอลบบัญชีเดิมไว้ และรอลบบัญชีอัตโนมัติเมื่อครบ 30 วัน (ไม่เริ่มนับใหม่) |
| Target | ชื่อผู้ใช้ + `<Request ID> · <User ID>` + pill สถานะคำขอ |
| Context note (ถ้ามี) | `ปฏิเสธคืนบัญชีครั้งก่อน: <วันที่> โดย <แอดมิน> — <เหตุผล>` |
| Reason (required) | label `เหตุผลการปฏิเสธคืนบัญชี` — ตัวเลือก: `รายงานร้ายแรงยังไม่ได้รับการแก้ไข` / `พฤติกรรมละเมิดซ้ำ ไม่สมควรคืนบัญชี` / `หลักฐานไม่เพียงพอที่จะยืนยันตัวตน` / `ทีมที่รับผิดชอบไม่อนุมัติให้คืนบัญชี` |
| Note / หมายเหตุ (optional) | placeholder: ระบุหลักฐาน รายงาน หรือข้อมูลอ้างอิงที่เกี่ยวข้องกับการปฏิเสธ |
| Impact note | `ผลกระทบต่อผู้ใช้: บัญชียังคงถูกระงับ รอลบอัตโนมัติเมื่อครบช่วงรอลบบัญชีเดิม (ไม่เริ่มนับใหม่) ผู้ใช้ติดต่อขอคืนบัญชีใหม่ได้` |
| Email note | `แจ้งผู้ใช้: ระบบจะส่งอีเมลแจ้งผลไปที่ <registered owner email> (registered owner email)` — ช่องทางหลักเป็นอีเมล ตาม pattern Account Status Email |
| Email preview | `details > ดูตัวอย่างอีเมลแจ้งเตือน` แสดงหัวข้อ + เนื้อหาอีเมล (TH/EN) ตาม action + reason — ตาม pattern email-preview ของ asset actions; อัปเดตตาม reason ที่เลือกแบบ live |
| Confirm / Cancel | `ยืนยัน` (danger) / `ยกเลิก` |
| Result | `ปฏิเสธคืนบัญชี <Display Name> แล้ว — รอลบบัญชีอัตโนมัติเมื่อครบช่วงรอลบบัญชี` + บรรทัดบันทึก + success toast |

หลังยืนยัน: คำขอเปลี่ยนเป็น `ปฏิเสธคืนบัญชี`; ปุ่ม `คืนบัญชี` และ `ปฏิเสธคืนบัญชี` ยังแสดง (รับเรื่องซ้ำได้ — ประวัติการปฏิเสธแสดงทุกครั้งใน History & Actions); ช่วงรอลบบัญชีไม่เริ่มนับใหม่; บันทึก audit พร้อม admin, reason และเวลาดำเนินการ

หมายเหตุ:

- ปุ่ม `คืนบัญชี` และ `ปฏิเสธคืนบัญชี` แสดงตลอดช่วง grace period 30 วัน (สถานะ `รอดำเนินการ` / `ปฏิเสธคืนบัญชี`) ไม่ใช่แสดงเฉพาะเมื่อผู้ใช้ขอคืน — กรณีผู้ใช้ขอคืนผ่าน support จะแสดง context note เพิ่มใน modal
- หลังลบบัญชีอัตโนมัติ (สถานะ `ลบตัวตนแล้ว`) หรือคืนบัญชีแล้ว ปุ่ม action ทั้งสองต้องไม่แสดง และไม่แสดง note อธิบาย — สถานะคำขอใน Detail Head และตารางประวัติ (event คืนบัญชี / ลบบัญชีอัตโนมัติ) บอกเหตุผลอยู่แล้ว (ตัด note `คำขอนี้ผ่านช่วงรอลบบัญชีแล้ว` ออกตั้งแต่ BO-13-v0.4)
- การลบบัญชีอัตโนมัติ (เก็บถาวร + ลบตัวตน ในขั้นเดียว) เป็น system job เมื่อครบ grace period ไม่ใช่ manual action ของแอดมิน
- ข้อมูลดูสถานะล่าสุดและดูประวัติอยู่ในหน้า detail แล้ว (Dependency Summary + Deletion Timeline + History & Actions) จึงไม่มีปุ่มแยก

## 14. Grace Period Rules

- Grace period baseline: 30 วัน
- Start: เมื่อ Delete Account API สำเร็จและ account ถูก deactivated (พร้อมยกเลิก offer + ปิดรายงานอัตโนมัติ)
- End: `deactivated_at + 30 days`
- ระหว่าง grace period user login ไม่ได้
- Public profile/assets ต้องถูกซ่อนทันที ไม่ต้องรอครบ 30 วัน
- ระหว่าง grace period แอดมินเห็นปุ่ม `คืนบัญชี` และ `ปฏิเสธคืนบัญชี` ตลอด กดได้เมื่อรับเรื่องจาก support
- เมื่อครบ grace period ระบบลบบัญชีอัตโนมัติ (เก็บถาวร + ลบตัวตน ในขั้นเดียว) — ไม่ใช่ manual action ของแอดมิน
- Retention period ของข้อมูล (chat, offer, report, audit log) แยกจาก account lifecycle ตาม DEL-DEC-002 รอ Legal/Product
- ถ้าแอดมินปฏิเสธคืนบัญชี ไม่เริ่มนับ grace period ใหม่ ให้รอครบ 30 วันตามเดิมแล้วระบบลบบัญชีอัตโนมัติ
- ถ้าแอดมินคืนบัญชีในช่วง grace period account กลับเป็น `Active` และคำขอเปลี่ยนเป็น `คืนบัญชีแล้ว`
- ระบบส่งอีเมลเตือนใกล้ครบ grace period อัตโนมัติเมื่อเหลือ 7 วัน และ 3 วันก่อนครบกำหนด (ไปยัง registered email) — ตาม lifecycle email ใน `14_NOTIFICATIONS_MODULE.md` section 9.3; ไม่ส่งถ้าคำขอจบแล้ว (คืนบัญชี/ลบตัวตน)

## 15. FO Visibility Impact

| BO / System State | FO Expected Behavior |
| --- | --- |
| Deletion request succeeded | User ถูก sign out และกลับ Sign In; offer ค้างถูกยกเลิกอัตโนมัติ รายงานถูกปิดอัตโนมัติ |
| Account in grace period | Login ไม่ได้หรือเห็น `Account scheduled for deletion` support state |
| Public profile hidden | Public Profile ต้องไม่แสดงข้อมูลผู้ใช้ปกติ |
| Assets hidden | Asset ไม่ขึ้น Feed, Search, Watch Alert results, Public Profile |
| Account restored by admin | Account status ต้อง sync กลับ `Active` ก่อนอนุญาต login |
| Account auto-deleted (auto) | ไม่มี FO access; public surfaces ยังซ่อน/anonymized ตาม policy; สมัครใหม่ด้วยอีเมลเดิมได้เป็นบัญชีใหม่ |

## 16. Cross-Module Integration

| Module | Integration |
| --- | --- |
| User Management | Account status sync (`Active`/`Deactivated`/`Anonymized`), profile/contact masking, login block; drill-in จาก User List > action `Open Account Deletion` เปิด Request Detail ของคำขอนั้นตรง (ถ้าไม่พบคำขอในระบบ fallback เป็น list กรองด้วย deletion id); User List แสดงสถานะ `Deletion Requested` พร้อม block action ที่ไม่อนุญาต (เช่น Archive from User List, Reset after deletion starts); บัญชีที่ลบแล้วปุ่ม `View deleted summary` เปิด deletion request detail; เพิ่ม row ใน Account Status History ของ User Management ครบ lifecycle 4 ประเภท — ขอลบบัญชี / คืนบัญชี / ปฏิเสธคืนบัญชี / ลบบัญชีอัตโนมัติ (เก็บถาวร + ลบตัวตนรวมเป็นขั้นเดียว); การคืนบัญชี sync สถานะกลับ `Active` ทั้ง list, detail และรายงานที่ผูกกับผู้ใช้ |
| Offer Management | ระบบยกเลิก offer ที่ยัง `Pending` อัตโนมัติเมื่อ delete request สำเร็จ; accepted offer เก็บตาม retention policy และ mask personal fields; related chat retention; dependency link จาก Dependency Summary (Pending Incoming / Pending Outgoing / Accepted Offers) drill-in ไป Offer Management แบบ read-only กรองด้วย userId ของคำขอ |
| Asset Management | ระบบซ่อน assets จาก FO surfaces (Feed/Search/Watch Alert/Public Profile) ทันทีเมื่อ delete request สำเร็จ; dependency link จาก Dependency Summary เปิด Asset List แบบ read-only กรองด้วย userId |
| Chat | เก็บ chat history ตาม retention policy และ mask personal profile fields เมื่อถึงขั้น anonymization; ไม่มีโมดูลแชทใน BO — tile Chat Rooms ใน Dependency Summary เป็น read-only context (แสดงข้อความว่าเนื้อหาแชทเก็บตาม retention policy และ mask ตัวตนผู้ใช้) |
| Report (User/Asset) | ระบบปิดรายงานที่ยังเปิดอยู่อัตโนมัติเมื่อ delete request สำเร็จ; เก็บ record ตาม legal/safety/audit policy; dependency link จาก Dependency Summary เปิด Reported Users กรองด้วย userId; report context ของ user ที่ `Deletion Requested` แสดง warning ให้ review รายงานก่อนแล้วจัดการ Account Deletion แยก ห้าม delete/archive ทันทีจากคิวรายงาน |
| Help / Support | ไม่มี ticket ใน Phase 1 — module 12 เป็น Policy & Versioning + Support Center; support ticket linkage เป็น future scope |
| Notification | Lifecycle email 5 จุด (ยืนยันลบบัญชี / เตือนใกล้ครบ grace period / คืนบัญชีแล้ว / ปฏิเสธคืนบัญชี / ลบตัวตนแล้ว) ส่งไปยัง registered email เป็นช่องทางหลัก ตาม `14_NOTIFICATIONS_MODULE.md` section 9.3; delivery log `DLV-DEL-<req>-<event>` แสดงใน Settings > Delivery Logs (ดู `16_ADMIN_SETTINGS_MODULE.md`) และ trace กลับไปยัง History & Actions ของ Request Detail; อีเมลลบตัวตนต้องส่งก่อน anonymize personal fields; ไม่เข้า FO Notification Center |
| Audit Log | Request create, session revoke, offer cancel auto, report close auto, dependency check ระหว่างช่วงรอลบบัญชี, restore, restore reject, auto delete (archive + anonymize), export, sensitive reveal |
| Reports & Analytics (Phase 2/future) | Account deletion report, restore/reject count, auto-delete completion |

## 17. Audit Requirements

Audit log ต้องบันทึกอย่างน้อย:

Admin actions:
- `ACCOUNT_DELETION_RESTORE` — แอดมินคืนบัญชีในช่วง grace period
- `ACCOUNT_DELETION_RESTORE_REJECT` — แอดมินปฏิเสธคืนบัญชี
- `ACCOUNT_DELETION_EXPORT` — ส่งออกรายงาน
- `ACCOUNT_DELETION_SENSITIVE_REVEAL` — เปิดเผยข้อมูลส่วนตัวแบบ on-demand

System actions (อัตโนมัติ บันทึกโดย system job):
- `ACCOUNT_DELETION_REQUEST_CREATE` — คำขอถูกสร้างหลัง FO confirm สำเร็จ
- `ACCOUNT_DELETION_DEPENDENCY_CHECK_AUTO` — ระบบตรวจเงื่อนไข dependency (offer/asset/chat/report) ระหว่างช่วงรอลบบัญชี
- `ACCOUNT_DELETION_SESSION_REVOKE` — ระบบ revoke session และ deactivate account
- `ACCOUNT_DELETION_OFFER_CANCEL_AUTO` — ระบบยกเลิก offer ที่ยัง Pending อัตโนมัติ
- `ACCOUNT_DELETION_REPORT_CLOSE_AUTO` — ระบบปิดรายงานที่ยังเปิดอยู่อัตโนมัติ
- `ACCOUNT_DELETION_AUTO_DELETE` — ระบบลบบัญชีอัตโนมัติ (เก็บถาวร + ลบตัวตน ในขั้นเดียว) เมื่อครบ grace period 30 วัน

อีเมล lifecycle (reference ไปยัง `14_NOTIFICATIONS_MODULE.md` section 9.3):
- ทุก audit event ของ admin/system action ที่มีอีเมล lifecycle (REQUEST_CREATE / RESTORE / RESTORE_REJECT / AUTO_DELETE) ต้อง reference ไปยัง delivery log `DLV-DEL-<req>-<event>` ใน Settings > Delivery Logs
- อีเมลเตือนใกล้ครบ grace period (เหลือ 7/3 วัน) เป็น system job แยก ไม่ใช่ audit event ของ deletion action — บันทึกเป็น delivery log เท่านั้น

Audit payload ต้องมี:

- `request_id`
- `target_user_id`
- `admin_id` หรือ `system_job_id`
- `old_status`
- `new_status`
- `reason`
- `dependency_snapshot` (offer/asset/chat/report counts ณ เวลา action)
- `retention_policy_version`
- `notification_email_delivery_id` (reference ไปยัง `DLV-DEL-<req>-<event>` ถ้า action มีอีเมล lifecycle ตาม `14_NOTIFICATIONS_MODULE.md` section 9.3)
- `ip_address`
- `user_agent`
- `created_at`

## 18. Error, Empty, Loading States

| State | Requirement |
| --- | --- |
| Empty queue | แสดงข้อความ `ไม่มีคำขอลบบัญชี` เมื่อไม่มีรายการหรือไม่มีรายการที่ตรง filter — ล้างตัวกรองด้วยปุ่ม `รีเซ็ตค่าทั้งหมด` ที่ filter bar |
| Loading | Skeleton สำหรับ list/detail ตามมาตรฐานกลาง |
| Permission denied | ไม่โหลด sensitive archive data; sensitive fields masked ตาม default และดูข้อมูลติดต่อที่ User Detail ตาม Sensitive Reveal Policy |
| Request not found | ไม่แสดง detail ว่าง — กลับไปหน้า list ทันที (คง filter state เดิม) |
| Auto-delete job failed | คง status เดิมหรือ mark failed ตาม job policy และต้อง audit; countdown ยังแสดง `ครบกำหนดลบบัญชีอัตโนมัติแล้ว — ระบบจะลบบัญชีในรอบถัดไป` |
| Export failed | ไม่แสดงใน prototype — export ยังไม่เปิดเป็นปุ่ม (Phase 1); เมื่อเปิด scope ต้องแสดง error และ audit attempt ถ้าเริ่ม export แล้ว |

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
| AC-BO-DEL-008 | ครบ grace period ระบบลบบัญชีอัตโนมัติ (เก็บถาวร + ลบตัวตน ในขั้นเดียว) พร้อม audit |
| AC-BO-DEL-009 | Sensitive reveal, restore, reject restore และ export ต้องมี audit log |
| AC-BO-DEL-010 | Account Deletion UI ต้อง responsive ที่ 375px, 768px, 1280px และ 1440px |
| AC-BO-DEL-011 | หลังลบตัวตน สมัครใหม่ด้วยอีเมลเดิมได้เป็นบัญชีใหม่ (คนละรหัส) ไม่เชื่อมประวัติเดิม |
| AC-BO-DEL-012 | Account Deletion lifecycle email 5 จุด (ยืนยันลบบัญชี / เตือนใกล้ครบ grace period / คืนบัญชีแล้ว / ปฏิเสธคืนบัญชี / ลบตัวตนแล้ว) ต้องส่งไปยัง registered email พร้อม delivery log `DLV-DEL-xxx` ที่แสดงใน Settings > Delivery Logs และ trace กลับไปยัง History & Actions ของ Request Detail และ audit event ได้ ตาม `14_NOTIFICATIONS_MODULE.md` section 9.3 |
| AC-BO-DEL-013 | modal คืนบัญชี/ปฏิเสธคืนบัญชี ต้องมีข้อความแจ้งช่องทางหลักเป็นอีเมล + email preview ตาม pattern โมดูลอื่น; History & Actions ต้องแสดงคอลัมน์ ส่งอีเมล พร้อมสถานะและลิงก์ไป delivery log ใน Settings > Delivery Logs |

## 20. Open Decisions

| ID | Decision Needed | Current Recommendation |
| --- | --- | --- |
| DEL-DEC-001 ✅ | Restore policy | **ยืนยัน Phase 1** — แอดมินยกเลิก/กู้คืนให้ผู้ใช้ในช่วง grace period 30 วัน โดยมีเหตุผล + audit; ไม่มี user self-service (อนาคตเปิดทีหลังได้); รายละเอียดใน section 10.2 |
| DEL-DEC-002 | Retention period ของ chat, offer, report และ audit log ต้องเก็บกี่ปีก่อนลบข้อมูล (purge) | รอ Legal/Product; แยกจาก account lifecycle (ลบบัญชีอัตโนมัติเกิดที่ grace period ตาม DEL-DEC-006); กระทบ data purge job และ data model |
| DEL-DEC-003 ✅ | Anonymization timing | **ปรับใหม่ตาม prototype (supersede คำตัดสินเดิม "แยก 2 จังหวะ")** — ลบบัญชีอัตโนมัติ = เก็บถาวร + ลบตัวตน ในขั้นเดียวเมื่อครบ grace period 30 วัน; รายละเอียดใน section 10.1 และ 14; ดู DEL-DEC-006 |
| DEL-DEC-004 ✅ | Sensitive reveal policy | **ยืนยัน: masked default + ปุ่ม reveal on-demand + permission + audit**; รายละเอียดใน section 10.4 |
| DEL-DEC-005 | ถ้าอนาคตต้องการกันคนไม่ดีสมัครใหม่ด้วยอีเมลเดิม ใช้แฮชอีเมลเช็คซ้ำหรือไม่ | รอ Legal; กระทบ re-registration policy และ privacy/compliance; Phase 1 สมัครใหม่ด้วยอีเมลเดิมได้เป็นบัญชีใหม่ตาม section 10.3 |
| DEL-DEC-006 ✅ | Lifecycle รวมขั้นเดียว — ลบบัญชีอัตโนมัติ = เก็บถาวร + ลบตัวตน เกิดพร้อมกันเมื่อครบ grace period (สถานะคำขอ 4 ค่า ไม่มี `เก็บถาวรแล้ว`; สถานะบัญชี 3 ค่า ไม่มี `Archived`) | **ยืนยันตาม prototype (2026-09-08)** — supersede DEL-DEC-003 เดิม (แยก 2 จังหวะ); section 9/10/10.1/14/15/17 และ AC-BO-DEL-008 ปรับตามแล้ว; retention period ของข้อมูลยังอ้าง DEL-DEC-002 |
