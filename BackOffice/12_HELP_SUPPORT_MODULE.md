# 12 BO Help / Support Module

**Version:** `BO-12-v0.1`  
**Date:** 2026-07-06  
**Status:** Draft baseline  
**Platform:** Responsive Web Back Office  
**Primary FO Sources:** `../FrontOffice/13_SETTINGS_MODULE.md`, `../FrontOffice/01_AUTHENTICATION_MODULE.md`, `../FrontOffice/08_OFFER_MODULE.md`, `../FrontOffice/07_CHAT_MODULE.md`, `../FrontOffice/15_TRUST_SAFETY_MODULE.md`  
**Integration Map:** `../ProjectAdmin/FO_BO_INTEGRATION_MAP.md`

## 1. วัตถุประสงค์

Help / Support Module ใช้สำหรับให้ทีม Support และ Admin จัดการคำขอช่วยเหลือของผู้ใช้ที่เริ่มจาก FO Settings > Help, About > Contact support, สถานะบัญชีที่ต้องติดต่อ support, หรือเคสที่ทีมงานสร้างแทนผู้ใช้จากช่องทาง LINE / Phone / Email

BO ต้องเป็นศูนย์กลางของ support ticket เพื่อให้ทีมงานเห็นบริบทผู้ใช้, ticket history, related asset / offer / chat / report, SLA และ audit trail ได้ครบ โดยไม่บังคับให้ FO V1 ต้องมี ticket history เต็มรูปแบบทันที

## 2. ขอบเขต

### 2.1 In Scope

- Ticket queue สำหรับคำขอช่วยเหลือ
- Ticket detail พร้อม user context และ related entity
- Ticket assignment, priority, status และ SLA tracking
- Reply history และ internal note
- Manual ticket creation จาก LINE / Phone / Email
- Support case ที่เกี่ยวกับ account, asset, offer, chat, report, watch alert, notification และ account deletion
- Export ticket ตาม permission
- Audit log สำหรับ action สำคัญ
- Responsive layout สำหรับ desktop, tablet และ mobile

### 2.2 Out of Scope

- External CRM integration แบบเต็ม
- Live chat ระหว่าง Support Admin กับผู้ใช้
- ระบบโทรศัพท์ call center
- AI chatbot
- Payment dispute workflow
- FO ticket history UI ถ้า Product ยังไม่เปิด scope

## 3. FO Help State และ BO Responsibility

FO Settings > Help ตาม baseline ปัจจุบันเป็นหน้าช่องทางติดต่อ support โดยแสดง:

- `Contact support`
- `Available daily`
- `09:00 - 22:00 (GMT+7)`
- LINE: `@mrfoxthailand`
- Phone: `(+66) 80-008-8088`
- Email: `service@mrfox.com`

FO interaction:

- LINE row เปิด LINE หรือ external link
- Phone row เปิด dialer
- Email row เปิด mail composer
- `Contact support` จาก About route ไป Help screen เดิม

ดังนั้น BO ต้องรองรับ 2 mode:

| Mode | FO Behavior | BO Behavior |
| --- | --- | --- |
| Contact-only V1 | ผู้ใช้ติดต่อผ่าน LINE / Phone / Email | Support Admin สร้างหรือรับ ticket ใน BO และบันทึก source channel |
| In-app ticket future | ผู้ใช้ submit ticket หรือเห็น ticket history ใน FO | Ticket, reply และ status sync กลับ FO ตาม API contract |

## 4. Roles & Permissions

| Action | Super Admin | Support Admin | Moderator | Content Admin | Market Admin |
| --- | --- | --- | --- | --- | --- |
| View ticket queue | Yes | Yes | Related reported cases only | No | Related market data cases only |
| View ticket detail | Yes | Yes | Related reported cases only | No | Related market data cases only |
| Create manual ticket | Yes | Yes | No | No | No |
| Assign ticket | Yes | Yes | No | No | No |
| Reply to user | Yes | Yes | No | No | No |
| Add internal note | Yes | Yes | Related reported cases only | No | Related market data cases only |
| Change priority/status | Yes | Yes | No | No | No |
| Link related entity | Yes | Yes | No | No | Related market data only |
| Export ticket | Yes | Yes with scope limit | No | No | No |
| Delete ticket | No by default | No | No | No | No |

Ticket deletion ไม่อยู่ใน normal operation ให้ใช้ `Closed`, `Spam / Invalid` หรือ retention policy แทน เพื่อรักษาประวัติ support และ audit

## 5. Responsive Layout

| Breakpoint | Layout |
| --- | --- |
| Mobile <= 767px | Ticket list เป็น card stack, filter อยู่ใน bottom sheet หรือ collapsible panel, detail เปิด full screen |
| Tablet 768px - 1199px | List/detail ใช้ 1 column หรือ split view ตามพื้นที่, sticky action bar |
| Desktop >= 1200px | Queue table + right detail panel หรือ full detail page, filter sidebar แสดงพร้อมกัน |

ทุกหน้าต้องไม่พึ่ง hover-only action และต้องมี touch target ที่เหมาะกับ mobile

## 6. Ticket List

Ticket list ต้องแสดงข้อมูลขั้นต่ำ:

| Field | Requirement |
| --- | --- |
| Ticket ID | รหัส ticket ที่ searchable ได้ |
| Subject | หัวข้อคำขอช่วยเหลือ |
| User | ชื่อ, username, email หรือ phone ตามที่มี |
| Contact Channel | In-app, LINE, Phone, Email, Admin-created |
| Type | ประเภท ticket |
| Priority | Urgent, High, Medium, Low |
| Status | สถานะ ticket ตาม section 8 |
| Assigned Admin | ผู้รับผิดชอบ |
| Related Entity | Asset / Offer / Chat / Report / Watch Alert / Deletion Request ถ้ามี |
| SLA Due | เวลาที่ต้องตอบครั้งแรกหรือแก้ไขตาม SLA |
| Last Response | ข้อความล่าสุดมาจาก User หรือ Admin |
| Created At / Updated At | วันที่สร้างและแก้ไขล่าสุด |

## 7. Search & Filters

ต้องค้นหาและกรองได้อย่างน้อย:

- Ticket ID
- User ID / username / email / phone
- Subject / message keyword
- Contact channel
- Type
- Priority
- Status
- Assigned admin
- SLA state: On track, Near breach, Breached
- Related entity type
- Created date / updated date

## 8. Ticket Status Contract

ใช้ status กลางต่อไปนี้ใน BO:

| Status | Meaning | FO Impact |
| --- | --- | --- |
| `New` | Ticket ถูกสร้างและยังไม่มี admin รับงาน | ถ้า FO มี ticket history ให้แสดง submitted/open |
| `Open` | Ticket เปิดอยู่และพร้อมให้ทีมรับงาน | ถ้า FO มี ticket history ให้แสดง open |
| `In Progress` | Admin เริ่มตรวจสอบหรือแก้ไขแล้ว | ถ้า FO มี ticket history ให้แสดง in progress |
| `Waiting User` | รอข้อมูลเพิ่มเติมจากผู้ใช้ | ถ้า FO มี ticket history ให้แสดง waiting for user |
| `Resolved` | ทีมแก้ไขและแจ้งผลแล้ว | ถ้า FO มี ticket history ให้แสดง resolved |
| `Closed` | ปิด ticket หลัง resolved หรือไม่มี action ต่อ | ถ้า FO มี ticket history ให้แสดง closed |
| `Spam / Invalid` | ไม่ใช่ ticket ที่ต้องดำเนินการ | ไม่ควรแสดงเป็นเคส active ใน FO |

สถานะ `Resolved` และ `Closed` ต่างกันดังนี้:

- `Resolved` = มีผลลัพธ์แล้ว แต่ยังอาจ reopen ได้ถ้าผู้ใช้ตอบกลับ
- `Closed` = จบกระบวนการแล้ว และไม่อยู่ใน active queue

## 9. Ticket Types

Ticket type ต้องครอบคลุม flow ของ FO:

| Type | Example |
| --- | --- |
| Account / Login | เข้าใช้งานไม่ได้, บัญชีถูก suspend, account scheduled for deletion |
| Profile / Settings | แก้ profile, phone, LINE, language, theme, notification settings |
| Asset / Listing | ปัญหาการลงขาย, Show/Hide, รูปภาพ, reference number |
| Offer / Chat | Offer dispute, chat issue, asset unavailable ใน chat |
| Report / Safety | รายงาน user, asset, comment, chat |
| Watch Alert / Notification | Watch Alert ไม่แจ้ง, notification destination ผิด |
| Market Data / Price Index | Brand, model, reference, price index ไม่ถูกต้อง |
| Account Deletion Support | ขอช่วยเหลือเกี่ยวกับ delete account หรือ grace period |
| Technical Issue | Bug, loading fail, app crash |
| Other | เรื่องอื่นที่ยังไม่เข้าประเภท |

## 10. Ticket Detail

Ticket detail ต้องมีส่วนข้อมูล:

### 10.1 Requester Context

- User ID
- Display name / username
- Email / phone / LINE ถ้ามี
- Account status: Active, Suspended, Banned, Scheduled for deletion, Archived
- Auth method: Email, Apple, Google
- Joined date และ last active
- Warning ถ้าผู้ใช้ถูก ban/suspend หรืออยู่ใน deletion grace period

### 10.2 Ticket Content

- Subject
- Original message
- Source channel
- Attachments ถ้ามี
- Conversation / reply history
- Internal notes
- Status / priority / assignee
- SLA timer

### 10.3 Related Entity

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

## 11. Priority & SLA

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

## 12. Reply & Internal Note Rules

| Item | Rule |
| --- | --- |
| Reply to user | Support Admin / Super Admin เท่านั้น |
| Internal note | เห็นเฉพาะ admin ตาม permission และไม่ส่งให้ผู้ใช้ |
| FO contact-only mode | Reply ออกผ่าน channel ต้นทาง เช่น LINE / Phone / Email และบันทึก summary ใน BO |
| FO in-app ticket mode | Reply และ status sync กลับ FO ticket history |
| Sensitive data | ต้อง mask หรือ require permission reveal ตาม Global Rules |
| Attachment | ต้องแสดง scan status ถ้ามี file upload |

## 13. Admin Actions

| Action | Requirement | Audit |
| --- | --- | --- |
| Create manual ticket | ต้องเลือก user หรือระบุ external contact, channel, type, subject | Required |
| Assign ticket | ต้องเลือก assignee และ optional note | Required |
| Change priority | ต้องบันทึก old/new priority | Required |
| Change status | ต้องบันทึก old/new status และ reason เมื่อปิด ticket | Required |
| Reply to user | ต้องบันทึก message metadata และ channel | Required |
| Add internal note | ต้องบันทึก admin, timestamp, visibility | Required |
| Link entity | ต้องบันทึก entity type/id | Required |
| Export ticket | ต้องบันทึก filter, scope, file metadata | Required |

## 14. Cross-Module Integration

| Module | Integration |
| --- | --- |
| Dashboard | Open support tickets, SLA risk, oldest ticket |
| User Management | Requester profile, account status, login/auth context |
| Asset Management | Related asset/listing context |
| Offer / Chat | Dispute context, offer status, related chat room |
| Social Interaction | Reported comments/replies linked to support case |
| Watch Alert | Alert criteria and trigger history for notification issue |
| Market Data | Brand/model/reference/price index issue |
| Account Deletion Requests | Deletion mistake/support escalation |
| Notifications | Delivery log when support reply or system update sends notification |
| Audit Log | Ticket actions and sensitive reveal events |
| Reports & Analytics | Ticket volume, SLA, resolution time, type breakdown |

## 15. Audit Requirements

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

## 16. Error / Empty / Loading States

| State | Requirement |
| --- | --- |
| Empty queue | แสดงข้อความว่าไม่มี ticket ที่ตรง filter และมีปุ่ม clear filter |
| Loading | Skeleton สำหรับ table/card และ detail |
| Permission denied | แสดง error ชัดเจนและไม่โหลด sensitive data |
| Ticket not found | แสดง not found พร้อมกลับไป queue |
| Related entity unavailable | แสดง unavailable state โดยไม่ทำให้ ticket detail พัง |
| Reply failed | เก็บ draft และให้ retry |
| Export failed | แสดง error พร้อม audit เฉพาะ attempt ที่เริ่มแล้วตาม policy |

## 17. Acceptance Criteria

| ID | Criteria |
| --- | --- |
| AC-BO-SUPPORT-001 | Support Admin และ Super Admin เห็น ticket queue พร้อม search/filter/status/priority/SLA ครบ |
| AC-BO-SUPPORT-002 | BO รองรับ manual ticket จาก LINE / Phone / Email ตาม FO Help contact-only baseline |
| AC-BO-SUPPORT-003 | Ticket detail แสดง requester context, conversation, internal note, related entity และ audit context ได้ |
| AC-BO-SUPPORT-004 | Admin assign, reply, add note, change priority และ change status ได้ตาม permission |
| AC-BO-SUPPORT-005 | First response SLA 8 ชั่วโมงต้องแสดงใน list/detail และ highlight near breach/breached |
| AC-BO-SUPPORT-006 | Internal note ต้องไม่ sync ไป FO หรือ user-facing channel |
| AC-BO-SUPPORT-007 | ถ้า FO เปิด in-app ticket history ในอนาคต BO status/reply ต้อง sync กลับ FO ตาม contract |
| AC-BO-SUPPORT-008 | Sensitive reveal, export และ status change ต้องมี audit log |
| AC-BO-SUPPORT-009 | Help / Support UI ต้อง responsive ที่ 375px, 768px, 1280px และ 1440px |

## 18. Open Decisions

| ID | Decision Needed | Impact |
| --- | --- | --- |
| SUP-DEC-001 | FO จะมี support ticket submit/history ใน V1 หรือใช้ contact-only ตาม Help screen ปัจจุบัน | กระทบ API, FO UI และ BO reply sync |
| SUP-DEC-002 | SLA 8 ชั่วโมงนับตาม business hours `09:00 - 22:00 (GMT+7)` หรือ calendar hours | กระทบ SLA timer และ dashboard |
| SUP-DEC-003 | LINE / Email จะ integrate เข้า BO อัตโนมัติหรือให้ Support Admin create manual ticket | กระทบ implementation และ operation workload |
| SUP-DEC-004 | Support reply จะส่ง notification ใน FO หรือส่งผ่าน channel ต้นทางเท่านั้น | กระทบ Notification module และ FO notification center |
