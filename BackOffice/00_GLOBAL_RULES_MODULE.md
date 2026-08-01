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
| Status | Current functional specification |
| Owner | Product / UX / Engineering / Operations |
| Document Type | Cross-Module Functional PRD |


## Prototype Source Of Truth

The confirmed Back Office visual and interaction standard for Dashboard, User Management, Asset Management, and Content Management is `../Prototypes/bo-prototype.html`. New implementation generated from these Markdown files must reproduce the same app shell, navigation behavior, responsive breakpoints, list toolbar, table/card behavior, pagination, action menus, detail pages, and confirmation modal patterns unless a module explicitly defines a later approved override.

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

The responsive standard follows the confirmed `../Prototypes/bo-prototype.html` behavior.

| Breakpoint | Width | Layout Rule |
| --- | --- | --- |
| Mobile | `<= 760px` | One-column app shell. List rows render as stacked cards with primary identity, status/context badges, key metadata, and compact action menu. Advanced filters are hidden behind an inline filter toggle in the list toolbar. Detail, editor, and report pages render as vertical sections. |
| Tablet | `761px - 1365px` | One-column content shell with desktop-like panels where space allows. Filter bars use compact grid layout. Dense tables may horizontally scroll inside their own container only when needed to preserve required columns/actions. |
| Desktop | `> 1365px` | Persistent sidebar and dense operation layout. Lists render as table/grid with header row, filter toolbar, summary cards when the module defines them, pagination footer, and compact row action menus. |

Responsive requirements:

- Dashboard, User Management, Asset Management, and Content Management must keep the same visual and interaction language as `../Prototypes/bo-prototype.html`.
- Mobile navigation uses the prototype hamburger side drawer with backdrop and close control.
- List filters use the prototype inline collapsible filter bar pattern. Do not use a separate drawer or bottom sheet for list filters in these confirmed modules.
- Important actions must remain reachable on mobile, tablet, and desktop.
- Table/list content, badges, buttons, image previews, forms, cards, and modal content must not overflow or overlap in a way that blocks operation.
- Long tables may scroll inside their table container on tablet/desktop, but primary actions must remain reachable.
- Modal dialogs must fit the viewport and scroll internally when content is long.
- Touch targets, keyboard focus states, labels, and visible control names must remain consistent across modules.

# 6. Navigation Rules

Navigation of the confirmed BO prototype is the baseline for Dashboard, User Management, Asset Management, and Content Management.

Baseline protected navigation:

```text
การดำเนินงาน
- Dashboard
- User Management
  - User List
  - Reported Users
- Asset Management
  - Asset List
  - Reported Assets
- Content Management
  - Articles
  - Categories
  - Reported Board
```

Global navigation rules:

- Module visibility depends on admin access and permission.
- A module without permission must not appear in navigation.
- Direct URL access must still enforce permission and show access denied when unauthorized.
- Browser back should preserve relevant context such as active module, submenu, search, filter, sort, list page, and originating list where appropriate.
- Menu groups with submenus expand/collapse only. They must not navigate to an implicit default child until Admin selects a submenu.
- Active menu and submenu states must match the current route/detail/report context.
- Mobile navigation uses the prototype collapsed side drawer behavior.
- Unprotected or future modules may extend navigation after the confirmed items, but must not change the order, labels, active states, or behavior of the protected navigation above unless explicitly approved.

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

These patterns are mandatory for Dashboard, User Management, Asset Management, and Content Management because they are confirmed in `../Prototypes/bo-prototype.html`.

## 8.1 App Shell And Page Structure

Standard page structure:

- Sidebar navigation using the confirmed module/submenu grouping.
- Mobile header with hamburger drawer behavior.
- Breadcrumb text in the main header.
- Page title and optional page meta.
- Page action area on the right side of the header when the screen has a primary action.
- Main content panel.
- Optional summary cards only where the module explicitly defines them.
- Filter toolbar for list pages.
- Desktop table/grid or mobile stacked cards for list results.
- Pagination footer for paged lists.
- Detail pages, preview modals, or confirmation modals using the same visual density and control style as the prototype.

## 8.2 List Toolbar Standard

Every confirmed list page must use the same toolbar pattern:

- Search input is the first control.
- A filter toggle button opens/closes advanced filters.
- A reset button is always available.
- Advanced filters use custom-select controls matching the prototype.
- Sort is part of the filter bar, not a separate visual pattern.
- On mobile, advanced filters collapse inline within the list area. They do not move to a drawer or bottom sheet.
- Reset clears search/filter/sort and returns the list to page 1.

## 8.3 Search, Filter, Sort, Pagination Order

List data operations must run in this order:

1. Apply search.
2. Apply filters.
3. Apply sort.
4. Apply pagination.

When search/filter/sort changes, the current page resets to page 1. When only the page changes, current search/filter/sort values must be preserved.

## 8.4 Pagination Standard

All confirmed list and history tables use the same pagination pattern:

- Page size: `10 rows per page` unless a module explicitly uses a domain noun such as `10 users per page`, `10 assets per page`, `10 articles per page`, or `10 reports per page`.
- Footer range text format: `แสดง X-Y จาก Z`.
- Empty result range text: `แสดง 0 จาก 0`.
- Controls: `ก่อนหน้า`, numbered page buttons, `ถัดไป`.
- Disable previous on the first page and next on the last page.
- Numbered page button for the current page uses the active button style.

## 8.5 Desktop Table/Grid Standard

Desktop list results use a dense table/grid pattern:

- Header row is visible.
- Body rows align to the same columns as the header.
- Primary identity field appears near the left.
- Status/context badges appear in their defined status column or metadata area.
- Last column is `Actions` and uses compact row action controls.
- Row/card click or `View` opens the relevant detail screen.
- Horizontal scroll is allowed only inside the table container when columns cannot compress safely.

## 8.6 Mobile Card Standard

Mobile list results use stacked cards:

- Hide the desktop table header.
- Show primary identity, status/context badge, key metadata, and compact action menu.
- Metadata labels must remain visible enough to understand the row without table headers.
- The same row actions available on desktop must remain reachable when permitted.
- Card content must wrap safely without text overlap.

## 8.7 Detail Page Standard

Detail pages should use the prototype sectioned layout:

- Header with entity identity, status/context badges, and back action where the flow originates from a list.
- Detail sections rendered as full-width panels or responsive grids.
- Action buttons grouped in the detail action area.
- Audit/history sections use the shared table/history layout and pagination where applicable.
- Sensitive sections are read-only and masked/summarized according to the module rules.

## 8.8 Forms And Editors

Form/editor pages follow the Content Management article/category patterns unless a module defines a more specific confirmed flow:

- Required field indicators.
- Field-level validation.
- Preview controls where the domain has a preview surface.
- Confirmation modal before status changes, destructive actions, or public-impacting changes.
- Unsaved-change protection for long editors when implemented.

## 8.9 Modals

Use the prototype modal pattern for:

- Confirmation.
- Status/action reason input.
- Preview.
- Compact detail reference from a report context.
- Action result or failure state.

Do not use a modal as the main long-form editor when a full editor page exists.

# 9. Shared States And Copy

| State | Required Behavior |
| --- | --- |
| Loading | Show skeleton, loading row, or loading panel in the same area where content will render. |
| Empty no data | Show empty state `ไม่พบข้อมูล`. |
| Empty after search/filter | Show empty state `ไม่พบข้อมูล` and keep reset available. |
| Error | Explain the failure and allow retry when retry is meaningful. |
| Action error | Keep the confirmation/action modal open, show the error/result state, and do not update the UI as success. |
| Stale state | Show that data changed before confirmation and require Admin to refresh or retry with latest data. |
| Access denied | แจ้งว่า admin access นี้ไม่มีสิทธิ์เข้า module/action. |
| Session expired | กลับไป login พร้อม message ชัดเจน. |

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

Every BO module must be checked at the prototype standard widths:

- Mobile width: 375px
- Mobile breakpoint edge: 760px
- Tablet width: 1024px
- Desktop width: 1366px
- Wide desktop width: 1440px

Responsive QA must verify:

- Navigation works.
- Search/filter works.
- Filter toggle opens/closes inline advanced filters on mobile.
- Reset clears search/filter/sort and returns list pagination to page 1.
- Primary action is reachable.
- Detail content does not overlap or clip.
- Table/card content is readable.
- Pagination range text and controls match the standard pattern.
- Modal fits viewport.
- Sticky/action areas do not block content.
- Destructive confirmation is visible and usable.

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

