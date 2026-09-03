# 12 BO Help / Support Module

**Version:** `BO-12-v0.2`  
**Date:** 2026-09-03  
**Status:** สเปกปัจจุบัน  
**Platform:** Responsive Web Back Office

## UI Standards And Prototype Reference

เอกสารนี้ต้องใช้ร่วมกับ `00_GLOBAL_RULES_MODULE.md` และยึดรูปแบบหน้าจอ/พฤติกรรมที่ยืนยันแล้วใน `../Prototypes/bo-prototype.html` เป็นมาตรฐานหลัก

ห้ามออกแบบ pattern แยกเองสำหรับ list toolbar, breakpoint, table/card layout, pagination, reset, drill-down, drawer, modal หรือ detail layout ยกเว้นเอกสารนี้ระบุไว้ชัดเจนว่าเป็น override ที่อนุมัติแล้ว

หมายเหตุ prototype: หน้าจอ Policy & Versioning และ Support Center ถูกสร้างและยืนยันใน `../Prototypes/bo-prototype.html` แล้ว ภายใต้เมนู Settings > Policy & Versioning และ Settings > Support Center ตามลำดับ

เอกสารอ้างอิง: `../FrontOffice/13_SETTINGS_MODULE.md`

## 1. Document Information

| Field | Detail |
| --- | --- |
| Module Name | BO Help / Support |
| Platform | Responsive Web Back Office |
| Version | `BO-12-v0.2` |
| Status | สเปกปัจจุบัน |
| Owner | Product / UX / Engineering / Operations |
| Document Type | Functional PRD |

## 2. Objective

Help / Support Module ใช้สำหรับให้ Admin จัดการเนื้อหาเอกสารกฎหมาย (Terms of Use, Privacy Policy) และข้อมูลช่องทางติดต่อ support ที่แสดงใน FO Settings > Help โดยทั้งสองส่วนนี้เป็น submenu ภายใต้เมนู Settings ของ BO

โมดูลนี้ประกอบด้วย 2 sub-module:

1. **Policy & Versioning** — จัดการเนื้อหา Terms of Use และ Privacy Policy แบบ versioned (Draft / Published / Archived) พร้อม bilingual content (TH/EN), change summary, preview และ version history เพื่อให้ FO แสดงเอกสารกฎหมายเวอร์ชันล่าสุดได้ และ Admin สามารถย้อนดูเวอร์ชันเก่าได้
2. **Support Center** — จัดการช่องทางติดต่อ support (LINE, Phone, Email, Facebook, Website), เวลาทำการ และความพร้อมให้บริการ (TH/EN) ที่แสดงใน FO Help screen พร้อม preview ก่อนบันทึก

## 3. Scope

### In Scope

- Policy & Versioning List (Terms of Use, Privacy Policy)
- Policy Detail (ดูเนื้อหาเวอร์ชัน Published, metadata, change summary)
- Policy Editor (สร้าง/แก้ไข Draft, bilingual content TH/EN, formatting toolbar, change summary)
- Policy Publish (เผยแพร่ Draft → Published, เวอร์ชันเดิมกลายเป็น Archived อัตโนมัติ)
- Policy Version History (ดูประวัติทุกเวอร์ชัน, view version, restore archived → Draft)
- Policy Preview (ดูตัวอย่างเนื้อหา Draft 2 ภาษา ก่อนเผยแพร่)
- Support Center edit form (toggle channel Active/Inactive, channel value, description TH/EN, business hours, availability TH/EN)
- Support Center Preview (ดูตัวอย่าง FO Help screen ใน phone frame, สลับภาษา TH/EN)
- Audit log สำหรับ action สำคัญ
- Responsive layout ตาม `00_GLOBAL_RULES_MODULE.md`

### Out Of Scope

- Ticket queue, ticket detail, ticket assignment, priority, SLA tracking (ถูกตัดออกจาก Phase 1)
- Reply history และ internal note (ถูกตัดออกจาก Phase 1)
- Manual ticket creation จาก LINE / Phone / Email (ถูกตัดออกจาก Phase 1)
- About App content management (เป็นหน้าที่ของ FO Settings ไม่ใช่ BO module นี้)
- Approval workflow สำหรับ policy publish (Admin ที่มีสิทธิ์ publish ได้โดยตรง ไม่ต้องอนุมัติหลายขั้นตอน)
- App/API sync dashboard (policy content ส่งไป FO ผ่าน API ปกติ ไม่มี dashboard แยก)
- External CRM integration
- Live chat ระหว่าง Admin กับผู้ใช้

## 4. FO Help State And BO Responsibility

FO Settings > Help ตาม baseline ปัจจุบันเป็นหน้าช่องทางติดต่อ support โดยแสดง:

- Title: `Help`
- Heading: `Contact support`
- Availability: `Available daily`
- Business hours: `09:00 - 22:00 (GMT+7)`
- Contact rows:
  - LINE: `@mrfoxthailand`
  - Phone: `(+66) 80-008-8088`
  - Email: `service@mrfox.com`

FO interaction:

- LINE row เปิด LINE หรือ external link
- Phone row เปิด dialer
- Email row เปิด mail composer
- `Contact support` จาก About route ไป Help screen เดิม

นอกจากนี้ FO Settings ยังมี entry `Privacy Policy` และ `Terms of Use` ที่ผู้ใช้เปิดอ่านเอกสารกฎหมายได้

BO มีหน้าที่จัดการข้อมูลทั้งสองส่วนที่ FO แสดง:

| ส่วนที่ FO แสดง | BO Responsibility | Sub-module |
| --- | --- | --- |
| Help screen — ช่องทางติดต่อ, เวลาทำการ, ความพร้อมให้บริการ | Admin แก้ไขช่องทางติดต่อ, เปิด/ปิดการแสดงผลแต่ละช่องทาง, แก้ไขเวลาทำการและความพร้อมให้บริการ (TH/EN) พร้อม preview ก่อนบันทึก | Support Center |
| Settings entry — Privacy Policy, Terms of Use | Admin แก้ไขเนื้อหา 2 ภาษา (TH/EN), สร้าง Draft, preview, publish เวอร์ชันใหม่ และดู version history | Policy & Versioning |

## 5. Admin Access And Permissions

ระบบใช้ Admin access เดียว โดยตรวจสิทธิ์ตามเมนูและ action ที่ทำ ไม่แยกประเภทบัญชี Admin ในสเปกนี้

| Access Area | Rule |
| --- | --- |
| Module access | Admin ที่มีสิทธิ์เข้าเมนู Settings > Policy & Versioning หรือ Settings > Support Center สามารถดู list, detail, form ได้ |
| Write action — Policy | Create Draft, Save Draft, Preview, Publish, Restore version ต้องตรวจ permission, แสดง confirmation สำหรับ Publish และ Restore และบันทึก audit |
| Write action — Support Center | Save changes ต้องตรวจ permission และบันทึก audit; Preview ไม่ต้องบันทึก audit (เป็นการดูตัวอย่างเท่านั้น) |
| Sensitive data | Policy content และ Support Center contact info เป็นข้อมูลสาธารณะที่ FO แสดงอยู่แล้ว ไม่ต้อง mask |
| Direct URL/API | ต้องตรวจสิทธิ์ที่ route, API และ service layer เสมอ ห้ามพึ่งแค่การซ่อน UI |

## 6. Responsive Layout

| Breakpoint | Width | Layout Rule |
| --- | --- | --- |
| Mobile | `<= 760px` | Policy & Versioning list เป็น card rows พร้อม label/value; Policy Detail/Editor เป็น vertical sections; Support Center form ใช้ single column; modal ต้องไม่ล้นจอ |
| Tablet | `761px - 1365px` | ตารางยังคงอ่านได้; Policy Editor ใช้ sidebar แคบลง; Support Center form ใช้ 2-column field row ได้ |
| Desktop | `> 1365px` | Policy & Versioning list เป็น table เต็ม; Policy Editor แสดง sidebar ข้อมูลการแก้ไข; Support Center form ใช้ field row เต็มความกว้าง |

ข้อกำหนดเพิ่มเติม:

- ข้อความ, badge, button และตัวเลขต้องไม่ล้น container
- Policy Editor contenteditable ต้อง scroll ได้เมื่อเนื้อหายาว
- Confirmation modal และ Preview modal ต้อง scroll ได้เมื่อเนื้อหายาว
- Support Center Preview phone frame ต้องขยายได้บน desktop และย่อพอดีจอบน mobile
- ทุกหน้าต้องไม่พึ่ง hover-only action และต้องมี touch target ที่เหมาะกับ mobile

## 7. Policy & Versioning List

เมนู: `Settings > Policy & Versioning`

Breadcrumb: `เครื่องมือ & รายงาน / Settings / Policy & Versioning`

Policy & Versioning List แสดง policy ทั้งหมดในระบบ ใน Phase 1 มีเพียง 2 policy types คือ Terms of Use และ Privacy Policy

> หมายเหตุ: Policy & Versioning List ไม่แสดง summary cards เพราะมี policy เพียง 2 ตัว จำนวนซ้ำซ้อนกับตารางและไม่บอก workload (ตามเกณฑ์ When NOT To Use ใน `BO_UI_UX_STANDARD.md`)

ตาราง Policy & Versioning List:

| Column | ข้อกำหนด |
| --- | --- |
| Policy | แสดง policy type เป็น badge (Terms of Use = blue, Privacy Policy = purple) |
| Description | คำอธิบายสั้น ๆ ของ policy |
| Status | แสดง `Published` เป็น badge green; ถ้ามี Draft อยู่ให้แสดง badge amber `Draft {version}` เพิ่มด้วย |
| Version | เวอร์ชันปัจจุบันที่ Published เป็น badge slate |
| Updated | วันที่/เวลาที่แก้ไขล่าสุด |
| Updated By | ผู้แก้ไขล่าสุด |
| Action | ปุ่ม chevron เปิด Policy Detail |

กฎการแสดงผล:

- Row ทั้ง row และปุ่ม chevron ต้องเปิด Policy Detail ของ policy นั้น
- Mobile ต้องแสดง metadata (Description, Status, Version, Updated, Updated By) ใน card row พร้อม label/value
- ไม่มี search และ filter เพราะมี policy เพียง 2 ตัว
- ไม่มี pagination เพราะแสดงทั้งหมดในหน้าเดียว

## 8. Search & Filters

Policy & Versioning List ไม่มี search และ filter เพราะมี policy เพียง 2 ตัว (Terms of Use, Privacy Policy) การเพิ่ม search/filter จะซ้ำซ้อนและไม่ช่วยให้ค้นหาได้เร็วกว่าการเลื่อนดู

Support Center เป็นหน้า form เดียว ไม่มี list จึงไม่มี search และ filter

## 9. Policy Status Contract

ใช้ status 3 สถานะสำหรับ policy version:

| Status | Meaning | FO Impact |
| --- | --- | --- |
| `Draft` | Admin กำลังแก้ไขเนื้อหาและยังไม่เผยแพร่ | FO ยังแสดงเวอร์ชัน Published เดิม ไม่แสดง Draft |
| `Published` | เวอร์ชันที่เผยแพร่แล้วและ FO แสดงอยู่ | FO แสดงเนื้อหาเวอร์ชันนี้ทันที |
| `Archived` | เวอร์ชันเก่าที่เคย Published แล้วถูกแทนที่ | FO ไม่แสดง แต่ Admin ยังดูและ restore ได้ |

กฎการเปลี่ยนสถานะ:

- เมื่อสร้าง Draft ใหม่: เวอร์ชันปัจจุบันที่ Published ยังคงเป็น Published สถานะของ policy ใน list แสดง `Published` พร้อม badge `Draft {version}` เพิ่ม
- เมื่อ Publish Draft: Draft ใหม่กลายเป็น `Published`, เวอร์ชัน Published เดิมกลายเป็น `Archived` อัตโนมัติ
- เมื่อ Restore Archived version: สร้าง Draft ใหม่จากเนื้อหาเวอร์ชันที่เลือก (ไม่เปลี่ยนสถานะของเวอร์ชันต้นทาง) Admin ต้อง Publish Draft นั้นอีกครั้งเพื่อใช้งาน
- ในเวลาใด ๆ มี `Published` ได้เพียง 1 เวอร์ชันต่อ policy type
- มี `Draft` ได้ไม่เกิน 1 เวอร์ชันต่อ policy type ถ้ามี Draft อยู่แล้ว ปุ่มจะเปลี่ยนจาก "สร้าง Draft เวอร์ชันใหม่" เป็น "แก้ไข Draft"

## 10. Policy Types

ใน Phase 1 ระบบรองรับ 2 policy types ครอบคลุมเอกสารกฎหมายที่ FO Settings แสดง:

| Policy Type | ID | Description | FO Entry |
| --- | --- | --- | --- |
| Terms of Use | `POL-TOU` | เงื่อนไขการใช้งานแพลตฟอร์ม TukDaeng สำหรับผู้ใช้และพันธมิตร | Settings > Terms of Use |
| Privacy Policy | `POL-PP` | นโยบายความเป็นส่วนตัวและการจัดการข้อมูลส่วนบุคคลของผู้ใช้ | Settings > Privacy Policy |

ข้อกำหนด:

- Policy type เป็น fixed list ใน Phase 1 — Admin ไม่สามารถสร้าง policy type ใหม่ได้
- แต่ละ policy type มีเนื้อหา 2 ภาษา (TH/EN) ที่แก้ไขแยกกันได้
- ทั้งสองภาษาต้องกรอกให้ครบก่อน Publish (validation บังคับ)
- Policy ID เป็น stable identifier ที่ FO/API อ้างอิง ห้ามเปลี่ยน

## 11. Ticket Detail

Ticket detail ต้องมีส่วนข้อมูล:

### 11.1 Requester Context

- User ID
- Display name / username
- Email / phone / LINE ถ้ามี
- Account status: Active, Suspended, Banned, Scheduled for deletion, Archived
- Auth method: Email, Apple, Google
- Joined date และ last active
- Warning ถ้าผู้ใช้ถูก ban/suspend หรืออยู่ใน deletion grace period

### 11.2 Ticket Content

- Subject
- Original message
- Source channel
- Attachments ถ้ามี
- Conversation / reply history
- Internal notes
- Status / priority / assignee
- SLA timer

### 11.3 Related Entity

Ticket หนึ่งรายการสามารถ link entity ได้มากกว่า 1 รายการ:

- User
- Asset
- Offer
- Chat room / message
- Comment / reply
- Report case
- Watch Alert
- Notification delivery log
- Market data record
- Account deletion request

Related entity ต้องเปิดไป module ต้นทางได้ตาม permission ของ admin

## 12. Priority & SLA

Priority baseline:

| Priority | Use Case |
| --- | --- |
| Urgent | Account lockout จำนวนมาก, safety risk, legal/safety escalation |
| High | Offer/chat dispute, report/safety issue, account deletion mistake |
| Medium | Asset/listing issue, notification/watch alert issue, technical issue ที่มี workaround |
| Low | คำถามทั่วไป, profile/settings, request ข้อมูลทั่วไป |

SLA baseline:

- First response target: ภายใน 8 ชั่วโมง
- Support availability ที่ FO แสดง: `09:00 - 22:00 (GMT+7)`
- BO ต้องแสดง SLA state: On track, Near breach, Breached
- ต้องมี open decision ว่า SLA clock นับตาม business hours หรือ calendar hours

## 13. Reply & Internal Note Rules

| Item | Rule |
| --- | --- |
| Reply to user | Admin access policy required |
| Internal note | เห็นเฉพาะ admin ตาม permission และไม่ส่งให้ผู้ใช้ |
| FO contact-only mode | Reply ออกผ่าน channel ต้นทาง เช่น LINE / Phone / Email และบันทึก summary ใน BO |
| FO in-app ticket mode | Reply และ status sync กลับ FO ticket history |
| Sensitive data | Mask by default; reveal only with business reason, policy approval, and audit log. |
| Attachment | ต้องแสดง scan status ถ้ามี file upload |

## 14. Admin Actions

| Action | Requirement | Audit |
| --- | --- | --- |
| Create manual ticket | ต้องเลือก user หรือระบุ external contact, channel, type, subject | Required |
| Assign ticket | ต้องเลือก assignee และ optional note | Required |
| Change priority | ต้องบันทึก old/new priority | Required |
| Change status | ต้องบันทึก old/new status และ reason เมื่อปิด ticket | Required |
| Reply to user | Admin access policy required |
| Add internal note | ต้องบันทึก admin, timestamp, visibility | Required |
| Link entity | ต้องบันทึก entity type/id | Required |
| Export ticket | ต้องบันทึก filter, scope, file metadata | Required |

## 15. Cross-Module Integration

| Module | Integration |
| --- | --- |
| Dashboard | Open support tickets, SLA risk, oldest ticket |
| User Management | Requester profile, account status, login/auth context |
| Asset Management | Related asset/listing context |
| Offer Management | Dispute context, offer status, related chat room |
| Asset Management (Reported Comments) | Reported comments/replies linked to support case |
| Watch Alert | Alert criteria and trigger history for notification issue |
| Market Data | Brand/model/reference/price index issue |
| Account Deletion Requests | Deletion mistake/support escalation |
| Notifications | Delivery log when support reply or system update sends notification |
| Audit Log | Ticket actions and sensitive reveal events |
| Reports & Analytics | Ticket volume, SLA, resolution time, type breakdown |

## 16. Audit Requirements

Audit log ต้องบันทึกอย่างน้อย:

- `SUPPORT_TICKET_CREATE`
- `SUPPORT_TICKET_ASSIGN`
- `SUPPORT_TICKET_REPLY`
- `SUPPORT_TICKET_INTERNAL_NOTE`
- `SUPPORT_TICKET_STATUS_CHANGE`
- `SUPPORT_TICKET_PRIORITY_CHANGE`
- `SUPPORT_TICKET_LINK_ENTITY`
- `SUPPORT_TICKET_EXPORT`
- `SUPPORT_SENSITIVE_REVEAL`

Audit payload ต้องมี:

- `ticket_id`
- `admin_id`
- `target_user_id` ถ้ามี
- `old_value` / `new_value` สำหรับ status, priority, assignee
- `reason` เมื่อ close, mark spam/invalid หรือ export
- `ip_address`
- `user_agent`
- `created_at`

## 17. Error, Empty, Loading States

| State | Requirement |
| --- | --- |
| Empty queue | แสดงข้อความว่าไม่มี ticket ที่ตรง filter และมีปุ่ม clear filter |
| Loading | Skeleton สำหรับ table/card และ detail |
| Permission denied | แสดง error ชัดเจนและไม่โหลด sensitive data |
| Ticket not found | แสดง not found พร้อมกลับไป queue |
| Related entity unavailable | แสดง unavailable state โดยไม่ทำให้ ticket detail พัง |
| Reply failed | เก็บ draft และให้ retry |
| Export failed | แสดง error พร้อม audit เฉพาะ attempt ที่เริ่มแล้วตาม policy |

## Module-Specific Exceptions

ไม่มี

Help / Support ต้องใช้ app shell, navigation, breakpoint, list toolbar, desktop table/grid, mobile card, pagination, reset และ detail ตาม `00_GLOBAL_RULES_MODULE.md` และ `../Prototypes/bo-prototype.html` โดยไม่มี UI/layout override เฉพาะโมดูล

## 18. Acceptance Criteria

| ID | Criteria |
| --- | --- |
| AC-BO-SUPPORT-001 | Admin sees ticket queue with complete search/filter/status/priority/SLA controls according to action policy |
| AC-BO-SUPPORT-002 | BO รองรับ manual ticket จาก LINE / Phone / Email ตาม FO Help contact-only baseline |
| AC-BO-SUPPORT-003 | Ticket detail แสดง requester context, conversation, internal note, related entity และ audit context ได้ |
| AC-BO-SUPPORT-004 | Admin assign, reply, add note, change priority และ change status ได้ตาม permission |
| AC-BO-SUPPORT-005 | First response SLA 8 ชั่วโมงต้องแสดงใน list/detail และ highlight near breach/breached |
| AC-BO-SUPPORT-006 | Internal note ต้องไม่ sync ไป FO หรือ user-facing channel |
| AC-BO-SUPPORT-007 | ถ้า FO เปิด in-app ticket history ในอนาคต BO status/reply ต้อง sync กลับ FO ตาม contract |
| AC-BO-SUPPORT-008 | Sensitive reveal, export และ status change ต้องมี audit log |
| AC-BO-SUPPORT-009 | Help / Support UI ต้อง responsive ที่ 375px, 768px, 1280px และ 1440px |

## 19. Open Decisions

| ID | Decision Needed | Impact |
| --- | --- | --- |
| SUP-DEC-001 | FO จะมี support ticket submit/history ใน V1 หรือใช้ contact-only ตาม Help screen ปัจจุบัน | กระทบ API, FO UI และ BO reply sync |
| SUP-DEC-002 | SLA 8 ชั่วโมงนับตาม business hours `09:00 - 22:00 (GMT+7)` หรือ calendar hours | กระทบ SLA timer และ dashboard |
| SUP-DEC-003 | LINE / Email จะ integrate เข้า BO อัตโนมัติหรือให้ Admin create manual ticket | กระทบ implementation และ operation workload |
| SUP-DEC-004 | Support reply จะส่ง notification ใน FO หรือส่งผ่าน channel ต้นทางเท่านั้น | กระทบ Notification module และ FO notification center |
