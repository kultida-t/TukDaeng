# 00 Back Office Global Rules Module

อ้างอิง:

- `BO_MASTER_BASELINE.md`
- `README_MODULE_INDEX.md`
- `../ProjectAdmin/FO_BO_INTEGRATION_MAP.md`
- `../FrontOffice/18_ADMIN_SCOPE_NOTE.md`

---

# 1. ข้อมูลเอกสาร

| Field | Detail |
| --- | --- |
| Module Name | Back Office Global Rules |
| Platform | Responsive Web Back Office |
| Version | `BO-PRD-v0.1` |
| Status | Draft |
| Owner | Product / UX / Engineering / Operations |
| Document Type | Cross-Module Functional PRD |

# 2. วัตถุประสงค์

เอกสารนี้เป็นกฎกลางที่ทุกโมดูลของ Back Office ต้องใช้ร่วมกัน เพื่อให้การออกแบบและพัฒนา BO สอดคล้องกันทั้งระบบ และรองรับทุกฟังก์ชั่นของ FO ที่ต้องมีการจัดการจากฝั่ง Admin เช่น moderation, user support, content publishing, market data, report, notification และ audit

BO เป็น responsive web application สำหรับทีมภายใน รองรับการใช้งานบน desktop, tablet และ mobile-width browser โดยยัง optimize งานที่มีข้อมูลหนาแน่น เช่น table, review queue, report และ export สำหรับหน้าจอใหญ่เป็นหลัก

# 3. ขอบเขต

## In Scope

- กฎ responsive web layout
- BO Admin Access และ permission model
- Navigation และ page structure กลาง
- Pattern กลางของ table, filter, form, detail, modal, export, empty/error state
- Canonical status ที่ BO ต้องใช้ร่วมกับ FO
- BO-to-FO sync และผลกระทบต่อ visibility
- Audit log requirement
- Sensitive data และ privacy rule
- Destructive action rule
- Coverage rule สำหรับฟังก์ชั่น FO ที่ต้องมี BO รองรับ

## Out Of Scope

- Layout รายละเอียดของแต่ละหน้าจอ
- Technical API schema แบบละเอียดของแต่ละ endpoint
- Final visual design token
- รายละเอียด FO mobile UI ยกเว้นกรณีที่ BO action ส่งผลกลับไปที่ FO โดยตรง

# 4. กฎระดับ Platform

| Area | Rule |
| --- | --- |
| Platform | BO เป็น Web Back Office เท่านั้น Admin ไม่ใช่ admin access ใน FO mobile app |
| Device support | Responsive web app รองรับ desktop, tablet และ mobile-width browser |
| Primary usage | งาน operation หลักควรเหมาะกับ desktop/tablet |
| Mobile usage | ต้องใช้ค้นหา ดู detail review approve/resolve และ emergency moderation ได้ในหน้าจอเล็ก งาน bulk ที่ซับซ้อนสามารถ optimize สำหรับ desktop/tablet ได้ |
| Language | UI ภาษาไทยเป็นหลัก ใช้ภาษาอังกฤษได้กับ technical term หรือ status ที่จำเป็น |
| Timezone | เวลาใน BO แสดงเป็น `Asia/Bangkok` |
| Currency | ราคาแสดงเป็น THB |
| Accessibility | Control ต้องมี label ชัดเจน keyboard reachable มี focus state และไม่ใช้สีเป็นข้อมูลเดียว |

# 5. Responsive Layout Rules

| Breakpoint | Width | Layout Rule |
| --- | --- | --- |
| Mobile | `< 768px` | Layout 1 column, navigation แบบ collapsed/drawer, filter stack หรือ drawer, detail แยกเป็น section/accordion/tab, table แปลงเป็น card หรือ horizontal scroll เฉพาะกรณีจำเป็น |
| Tablet | `768px - 1199px` | Side navigation ยุบ/ขยายได้, detail ใช้ 2 column ได้เมื่อพื้นที่พอ, filter drawer รองรับ |
| Desktop | `>= 1200px` | Side navigation แสดงถาวร, data table แบบ dense, ใช้ split list/detail ได้เมื่อเหมาะสม |
| Wide Desktop | `>= 1440px` | รองรับ split pane, expanded metric, audit/detail panel คู่กัน |

ข้อกำหนด responsive:

- Action สำคัญของ Admin ต้องไม่หายหรือใช้งานไม่ได้บน mobile/tablet
- Table ที่มีหลาย column ต้องมี priority column และ drill-in ไปหน้า detail
- Sticky action bar ใช้ได้ใน review workflow แต่ต้องไม่บัง content
- Modal ต้องพอดีกับ viewport และ scroll ภายในได้เมื่อเนื้อหายาว
- Search/filter ต้องใช้งานได้ด้วย touch device
- Bulk selection ซ่อนบน mobile ได้ถ้า individual action ยังทำได้
- Mobile-width navigation ใช้ hamburger button เปิด side drawer พร้อม backdrop, ปุ่มปิดใน drawer, และต้องไม่ทำให้ content/table/modal ซ้อนหรือ overflow จนใช้งานไม่ได้
- Side navigation สามารถ scroll ได้เมื่อรายการยาว แต่ไม่ควรแสดง scrollbar และต้อง contain scroll ไม่ให้ wheel/touch scroll เลื่อนไปกระทบ content ด้านหลัง

# 6. Navigation Rules

Navigation ของ BO ต้องขึ้นกับ admin access และ permission ของ Admin

Baseline navigation:

```text
การดำเนินงาน
- Dashboard
- User Management
  - User List
  - Reported Users
- Asset Management
  - Asset Details
  - Asset List
  - Offer / Chat
- Content Management
  - Content Board
  - Directory
  - Watch Alert
- Market Data
- Help / Support
- Account Deletion

เครื่องมือ & รายงาน
- Notifications
- Reports

ระบบ
- Settings
  - Admin Settings
  - Audit Log
```

กฎ navigation:

- Module ที่ไม่มีสิทธิ์ต้องไม่แสดงใน navigation
- หากเข้าผ่าน direct URL แต่ไม่มีสิทธิ์ ต้องแสดง access denied state
- Browser back ควรรักษา context เช่น active filter, list/detail state ตามความเหมาะสม
- เมนูต้องเรียงตามลำดับการใช้งานจริง: งานปฏิบัติการที่ต้องจัดการบ่อยก่อน, งานสนับสนุน/คำขอเฉพาะทางถัดมา, รายงานและเครื่องมือระบบท้ายสุด
- เมนูแม่ที่มีเมนูย่อยใช้สำหรับเปิด/ปิดกลุ่มเท่านั้น และไม่ควรเปลี่ยนหน้าเองจนกว่า Admin จะเลือกเมนูย่อย
- Mobile navigation ใช้ drawer หรือ collapsed menu
- Parent menu ที่มี sub menu ต้องทำหน้าที่ expand/collapse เท่านั้น ไม่ควรเปลี่ยนหน้าเป็น child/default page เอง ผู้ใช้ต้องเลือก sub menu ก่อนจึงเปลี่ยนหน้า

# 7. Admin Access Model

BO has exactly one admin account type: `Admin`. There are no BO sub-types such as content, support, market, moderation, or highest-privilege admin concept. Access differences are defined by module access, action policy, sensitive-data policy, confirmation, reason, and audit requirements.

| Admin Account Type | Global Access Intent |
| --- | --- |
| Admin | Operates every BO module allowed by product scope. High-risk actions require explicit permission checks, confirmation, reason when needed, and audit logging. |

Permission rules:

- Enforce access at route level and action/API/service level.
- Hidden UI is not enough; every mutation must check access before write.
- BO Admin access never creates a separate account type in FO.
- Sensitive fields, exports, destructive actions, public-impact actions, and admin account changes must follow policy-based controls and audit requirements.
# 8. Shared Page Patterns

## 8.1 List Page

List page ควรรองรับตามความเหมาะสม:

- Search
- Filter
- Sort
- Pagination
- Saved filter state
- Export เฉพาะ admin access ที่มีสิทธิ์
- Empty state
- Error state
- Row action menu
- Detail drill-in

ข้อมูลขนาดใหญ่ต้องใช้ server-side pagination/search/filter

## 8.2 Detail Page

Detail page ควรมี:

- Entity identity และ status
- Key metadata
- ผลกระทบต่อ FO surface ที่เกี่ยวข้อง
- Activity/timeline เมื่อจำเป็น
- Audit summary หรือ link ไป audit log สำหรับ admin access ที่มีสิทธิ์
- Action panel ตาม permission
- Sensitive section ที่ mask ถ้าไม่มีสิทธิ์

## 8.3 Forms

Form ต้องรองรับ:

- Required field indicator
- Validation error ใกล้ field
- Save draft เมื่อ module รองรับ draft
- Confirmation สำหรับ destructive หรือ public-impacting change
- Unsaved-change warning สำหรับฟอร์มยาว
- File/image preview ก่อน upload

## 8.4 Modals And Drawers

ใช้ modal/drawer สำหรับ:

- Confirmation
- Quick review
- Assign/reassign
- Status change
- Audit note
- Filter panel บนหน้าจอเล็ก

ไม่ควรใช้ modal เป็น flow หลักของงานยาว เช่น article editor

# 9. Shared States And Copy

| State | Required Behavior |
| --- | --- |
| Loading | แสดง skeleton หรือ loading state ที่ชัดเจน |
| Empty | แสดง empty message ตาม module และมี reset filter เมื่อเกิดจาก filter |
| Error | อธิบาย failure และมี retry เมื่อทำได้ |
| Access denied | แจ้งว่า admin access นี้ไม่มีสิทธิ์เข้า module/action |
| Session expired | กลับไป login พร้อม message ชัดเจน |
| Unsaved changes | เตือนก่อนออกจาก create/edit form |
| Export processing | แสดง queued/in-progress สำหรับ export ใหญ่ |
| Data unavailable | ใช้เมื่อ entity ถูก remove, archive หรือ hide ตาม policy |

# 10. Canonical Status Contracts

BO ต้องใช้ state contract เดียวกับ `FO_BO_INTEGRATION_MAP.md`

## 10.1 User Status

`Guest / Unauthenticated` เป็น access state ของ FO เท่านั้น ไม่ใช่ BO user status, ไม่ใช่ account record และไม่ต้องแสดงเป็น filter/status ใน User Management. BO จะเห็นผู้ใช้ใน User Management เฉพาะเมื่อมี account record แล้ว เช่น `Pending Verification`, `Active`, `Suspended`, `Banned` หรือสถานะ deletion/archive ตาม policy.

| Status | BO Meaning | FO Impact |
| --- | --- | --- |
| Active | User ใช้ FO ได้ปกติ | Login และ action ปกติทำได้ |
| Suspended | ระงับบัญชีชั่วคราวโดย Admin หรือ policy ที่มี guardrail ชัดเจน | Session ปัจจุบันต้องถูก revoke/block, login blocked และแสดง account status state ตาม FO Auth rule |
| Banned | ระงับบัญชีถาวรจนกว่า Admin จะปลด | Session ปัจจุบันต้องถูก revoke/block, login blocked และสร้าง activity ใหม่ใน FO ไม่ได้ |
| Soft Deleted / Archived | ผ่าน account deletion/archive workflow | Login blocked; profile/assets ถูกซ่อนหรือ anonymized ตาม policy |

## 10.2 Asset Status

| Status | BO Meaning | FO Impact |
| --- | --- | --- |
| Sale | Marketplace listing | แสดงใน Feed, Search, public Profile, Asset Detail และ match Watch Alert ได้ |
| Show | Public collection asset | แสดงใน profile/detail ตามที่ FO อนุญาต แต่ไม่ขึ้น Feed/Search/Watch Alert |
| Hide | Owner-only asset | เห็นเฉพาะ owner ใน FO |
| Sold | Sold history item | เห็นเฉพาะ owner ใน Sold tab และแก้จาก FO ไม่ได้ |
| Removed / Hidden | Admin-moderated unavailable asset | หายจาก public FO surfaces; direct link แสดง unavailable behavior |

หมายเหตุ: BO implementation ต้องใช้ status ตาม FO คือ `Show` และ `Hide` เป็นหลัก หากพบคำเก่าใน legacy source ให้ normalize เป็น status ชุดนี้ก่อนใช้งาน

## 10.3 Content Status

| Status | BO Meaning | FO Impact |
| --- | --- | --- |
| Draft | Content/data ยังไม่เผยแพร่ | ไม่แสดงใน FO |
| Scheduled | รอเวลา publish | แสดงเมื่อถึงเวลา |
| Published / Active | Live content/data | แสดงใน FO surfaces ที่เกี่ยวข้อง |
| Archived / Inactive | ไม่ใช้งานแล้ว | ซ่อนจาก FO list/search/autocomplete ตามประเภทข้อมูล |

## 10.4 Offer Status

| Status | BO Meaning | FO Impact |
| --- | --- | --- |
| Pending | รอ owner ตอบ | เป็น active pending offer |
| Accepted | Owner รับ offer | แสดง accepted state และส่ง notification |
| Rejected | Owner กด `Decline` แล้ว offer ถูกปฏิเสธ | ไม่เป็น active pending แต่ history ยังอยู่; FO action/copy ใช้ `Decline` ได้ แต่ status/API/BO ใช้ `Rejected`; legacy `Declined` ต้อง normalize เป็น `Rejected` |
| Cancelled | Buyer ยกเลิกก่อนตอบ | ไม่เป็น active pending |
| Expired | หมดอายุหรือถูก force expire | accept/decline ไม่ได้ |
| Invalidated | Asset/user state ทำให้ offer ใช้ไม่ได้ | แสดง unavailable/invalidated state |

# 11. FO Coverage Rule

ทุกฟังก์ชั่นของ FO ที่สร้างข้อมูล เปลี่ยน state หรือจำเป็นต้องมี operation oversight ต้องมีหนึ่งใน outcome ต่อไปนี้ใน BO:

- มี BO management module ใน Phase 1
- มี BO management module ใน Phase 2
- ระบุเป็น future/backlog ชัดเจน
- ระบุชัดว่าไม่ต้องมี BO action พร้อมเหตุผล

Source of truth สำหรับ coverage นี้คือ `../ProjectAdmin/FO_BO_INTEGRATION_MAP.md`

FO functions ขั้นต่ำที่ BO ต้องรองรับ:

- Report Asset / User / Comment / Board Content
- Asset lifecycle: Sale, Show, Hide, Sold, ซ่อนชั่วคราว, ซ่อนถาวร, ลบโดยเจ้าของ
- Board article/category/banner publication
- Brand/model/reference/price index management
- Directory item publication
- Offer lifecycle และ offer invalidation
- Chat review สำหรับ reported content
- Comment moderation
- Like/favorite/follow analytics
- Watch Alert criteria และ trigger history
- Help/support ticket
- Account deletion/archive validation
- Broadcast และ system notifications
- Audit trail สำหรับทุก admin action

Guest public access rule:

- FO Guest สามารถดูและแชร์ public surface ที่ระบบอนุญาตได้ เช่น public asset/detail, public profile/detail หรือ published article ตาม status/visibility ของ entity นั้น
- Guest action ที่เป็น public view/share ไม่สร้าง User Management record และไม่เปิด BO account action
- Action ที่สร้างข้อมูลหรือ state ของระบบ เช่น like, follow, comment, report, offer, chat, watch alert, add/edit/delete asset หรือ support ticket ต้อง require login ตาม FO Auth rule ก่อนจึงจะเข้า BO workflow ที่เกี่ยวข้อง
- BO modules ที่ควบคุม public visibility เช่น Asset, Content/Board, Directory และ Market Data ต้องทำให้ public deep link ที่ Guest เปิดหรือแชร์ไว้สะท้อนสถานะล่าสุด เช่น unavailable, removed, archived หรือ inactive

# 12. BO-To-FO Sync Rules

| BO Change | FO Sync Requirement |
| --- | --- |
| User suspended/banned | FO ต้อง revoke/block session ปัจจุบัน, block login/action permission และแสดง account status state |
| Asset removed/hidden/status changed | FO public surfaces ต้องสะท้อน visibility ใหม่ |
| Article published/scheduled/archived | FO Board, Search, Category, Detail ต้องสะท้อน status |
| Brand/model inactive | FO autocomplete/filter และ Watch Alert trigger ใหม่ต้อง exclude ข้อมูล inactive |
| Price index updated | FO price index และ asset value surfaces ต้องใช้ active value ล่าสุด |
| Directory item inactive | FO directory surfaces ต้องซ่อน item |
| Comment hidden/removed | FO Asset Detail ต้องซ่อนหรือแสดง removed state ตาม policy |
| Watch Alert disabled | Alert ต้องไม่ trigger notification ใหม่ |
| Offer expired/invalidated | FO offer/chat state ต้องเป็น unavailable หรือ not actionable |
| Notification type disabled/template changed | Notification ใหม่ใน FO ต้องใช้ enabled template ล่าสุด |

Account suspension baseline:

- V1 ใช้เฉพาะ `Active`, `Suspended`, `Banned` และ deletion/archive states ที่ระบุใน module ที่เกี่ยวข้อง; ไม่มี `Restricted` หรือ feature-level restriction เป็น account status กลาง
- `Suspended` และ `Banned` ต้อง block authenticated app access ไม่ใช่ปล่อยให้ผู้ใช้เข้าแอปหลักแล้วค่อย block เป็นราย action
- Account action ที่ทำให้ผู้ใช้ถูก `Suspended` หรือ `Banned` ต้องส่ง email notification เป็น primary channel และอาจมี in-app notification เป็น secondary เท่านั้น
- Email notification ต้องรองรับ email ที่ผูกกับบัญชีจาก Email/Password, Google และ Apple private relay ตาม integration/provider configuration

Public/Guest sync requirement:

- Public FO surfaces ต้อง validate entity visibility ก่อนแสดงให้ Guest หรือ logged-in user
- Public share links ต้องไม่ bypass BO hide/remove/archive/inactive status
- Guest public view/share event สามารถเข้า analytics/event log ได้ แต่ไม่ถือเป็น BO audit event และไม่ถือเป็น registered user activity เว้นแต่ผู้ใช้ login แล้ว

Sync timing:

- Security และ moderation action ควรสะท้อนผลใกล้เคียงทันทีที่สุดเท่าที่ทำได้
- Cached FO list ต้อง validate entity status ก่อนแสดงหรือเมื่อ refresh
- รายละเอียด cache invalidation/API timing ให้สรุปอีกครั้งตอนออกแบบ backend

# 13. Audit Rules

BO action ที่ create, update, remove, export, publish, archive, resolve, retry หรือเปลี่ยน permission/status ต้องเขียน audit data

Minimum audit fields:

- Admin ID
- Admin Access
- Action type
- Target entity type
- Target entity ID
- Before value
- After value
- Reason/note เมื่อจำเป็น
- IP address หรือ session context ถ้ามี
- Timestamp

Audit access:

- Full audit log view/export เฉพาะ Admin
- Module-level audit snippet แสดงให้ admin access ที่มีสิทธิ์ได้
- Audit record ห้ามแก้ไขผ่าน BO UI ปกติ

# 14. Sensitive Data Rules

Sensitive data ต้องถูก mask เป็น default ยกเว้น admin access และ permission อนุญาต

ตัวอย่าง sensitive data:

- User email, phone, auth identifiers, IP address, login history
- Provenance
- Purchase price/date/source
- Proof of payment
- Consignment contact และ terms
- Sale history buyer/payment details
- Chat exports
- Account deletion archive data
- Notification target audience exports

การเข้าถึง sensitive data ต้อง audit-log เมื่อเป็น high-risk access, export หรือเกี่ยวกับ dispute/support workflow

# 15. Destructive And Public-Impact Actions

Action ที่กระทบ FO visibility, user access หรือ public content ต้องมี:

- Permission check
- Confirmation
- Reason/note เมื่อ policy ต้องการ
- Before/after audit
- Success/error feedback ที่ชัดเจน

ตัวอย่าง:

- Suspend/ban/unban user
- Remove asset
- Force asset status change
- Hide/remove comment
- Remove chat message
- Publish/archive article
- Activate/deactivate brand/model/directory item/banner
- Disable watch alert
- Force expire/invalidate offer
- Approve account archive
- Send broadcast notification

# 16. Export Rules

- Export ต้องควบคุมด้วย permission
- Sensitive export ต้อง audit-log
- Export ขนาดใหญ่ต้องใช้ background job
- Export file ควรมี expiry หรือ controlled access
- Data ที่ export ต้อง respect policy-based field masking

# 17. Responsive QA Requirements

ทุก BO module ต้องตรวจที่:

- Mobile width: 375px
- Tablet width: 768px
- Desktop width: 1280px
- Wide desktop width: 1440px

Responsive QA ต้องตรวจ:

- Navigation ใช้งานได้
- Search/filter ใช้งานได้
- Primary action กดได้
- Detail content ไม่ overlap หรือ clip
- Table/card อ่านได้
- Modal fit viewport
- Sticky bar ไม่บัง content
- Destructive confirmation เห็นและใช้งานได้

# 18. Acceptance Criteria

| ID | Criteria |
| --- | --- |
| AC-BO-GLOBAL-001 | BO ถูกนิยามเป็น responsive web Back Office ไม่ใช่ FO mobile Admin access |
| AC-BO-GLOBAL-002 | ทุก BO route และ action enforce Admin Permission |
| AC-BO-GLOBAL-003 | BO navigation เป็น access-aware และ responsive |
| AC-BO-GLOBAL-004 | List/detail/form pattern ใช้สม่ำเสมอข้าม module |
| AC-BO-GLOBAL-005 | Canonical user, asset, content, offer status ตรงกับ FO/BO integration map |
| AC-BO-GLOBAL-006 | ทุก FO function ที่ต้องมี admin support ถูก map ไป BO module, backlog หรือ no-action decision |
| AC-BO-GLOBAL-007 | BO action ที่กระทบ FO visibility/access ต้องระบุ FO sync impact |
| AC-BO-GLOBAL-008 | Sensitive fields ถูก mask ถ้า admin access ไม่มีสิทธิ์ |
| AC-BO-GLOBAL-009 | Destructive และ public-impact actions ต้องมี confirmation และ audit |
| AC-BO-GLOBAL-010 | Large export ใช้ background job และควบคุมด้วย permission |
| AC-BO-GLOBAL-011 | Responsive QA ครอบคลุม mobile, tablet, desktop, wide desktop |
| AC-BO-GLOBAL-012 | Audit log ครอบคลุม sensitive, destructive, public-impact, export, permission และ login events |
| AC-BO-GLOBAL-013 | Guest / Unauthenticated ต้องไม่ถูกใช้เป็น BO user status หรือ User Management filter และ public view/share ต้องแยกจาก registered-user action |

# 19. Related Modules

- `01_AUTHENTICATION_MODULE.md`
- `02_DASHBOARD_MODULE.md`
- `03_USER_MANAGEMENT_MODULE.md`
- `04_ASSET_MANAGEMENT_MODULE.md`
- `05_CONTENT_BOARD_MODULE.md`
- `06_MARKET_DATA_MODULE.md`
- `07_DIRECTORY_MODULE.md`
- `08_AUDIT_LOG_MODULE.md`
- `../ProjectAdmin/FO_BO_INTEGRATION_MAP.md`

