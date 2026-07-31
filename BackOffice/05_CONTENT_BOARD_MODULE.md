# 05 BO Content / Board Module

**Version:** `BO-05-v1.0`
**Date:** 2026-07-31
**Status:** Current Spec
**Platform:** Responsive Web Back Office

## 1. วัตถุประสงค์

BO Content / Board Module คือเมนูสำหรับ Admin ใช้จัดการบทความบน FO Board ตั้งแต่สร้าง แก้ไข ดูรายละเอียด ดูตัวอย่าง เผยแพร่ ตั้งเวลา นำออกจากการเผยแพร่ จัดการหมวดหมู่ และตรวจรายงานบทความที่ผู้ใช้แจ้งเข้ามา

FO Board เป็นพื้นที่อ่านบทความ ไม่ใช่ forum และไม่ใช่พื้นที่ให้ผู้ใช้สร้างบทความเอง ผู้ใช้ FO สามารถอ่าน ค้นหา กรองหมวด กด Like, Share และ Report article ได้ ส่วนการสร้างและจัดการบทความทั้งหมดทำใน BO เท่านั้น

## 2. Menu Structure

Content / Board Module อยู่ภายใต้เมนู `Content Management` และมี submenu ดังนี้:

| Menu | Purpose |
| --- | --- |
| `Articles` | จัดการบทความทั้งหมดของ Board |
| `Categories` | จัดการหมวดหมู่บทความ |
| `Reported Board` | ตรวจรายงานบทความที่ผู้ใช้แจ้งจาก FO |

## 3. Admin Access And Permissions

| Access Area | Rule / เงื่อนไข |
| --- | --- |
| Module access | Admin ที่มีสิทธิ์เข้า module สามารถเปิด list, detail, search, filter, sort และ preview ได้ |
| Write action | Create, update, status change, delete draft, cancel schedule, archive, restore, create/edit category, reorder category, activate/deactivate category และ delete category ต้องตรวจ permission |
| Confirmation | Action ที่เปลี่ยนสถานะ ลบข้อมูล หรือนำข้อมูลออกจาก FO ต้องผ่าน confirmation modal |
| Reason / Note | Action ที่มีผลต่อ FO หรือการตรวจรายงานต้องเลือก reason หรือกรอก note สำหรับ audit ได้ |
| Direct URL/API | ต้อง enforce permission ที่ route, API และ service layer ไม่พึ่งการซ่อนปุ่มบน UI อย่างเดียว |
| Audit | Action สำคัญต้องบันทึกประวัติพร้อม admin, target, action, timestamp, result และ reason/note เมื่อมี |

## 4. Responsive Layout

| Width | Requirement / การแสดงผล |
| --- | --- |
| Mobile-width browser | List แสดงเป็น stacked cards, action อยู่ใน card menu, form/editor แยก section ชัดเจน |
| Tablet | ใช้ responsive shell เดียวกับ desktop แต่ field/grid ต้อง collapse ได้เมื่อพื้นที่จำกัด |
| Desktop | List แสดงเป็น table-like grid, detail/editor ใช้ full-width section blocks ใน main content panel |

ทุกหน้าต้องป้องกัน text, image preview, form controls, table/card content และ modal content ไม่ให้ overflow หรือซ้อนกันบนหน้าจอเล็ก

## 5. Articles List

### Route And Header

- Route/menu: `Content Management > Articles`
- Breadcrumb: `การดำเนินงาน / Content Management / Articles`
- Page title: `Articles`
- Primary action: `สร้างบทความ`
- Filter toggle: เปิด/ปิด advanced filters
- Reset action: ล้าง search/filter/sort และกลับไปค่า default ของ list

### Desktop Columns

- Article ID
- Article title / ชื่อบทความ
- Category
- Publish Status
- Publish Date
- Action

### Mobile Card Metadata

- Article ID
- Article title
- Category
- Status
- Read time
- Publish date/time

### Search, Filter, Sort, Pagination

- Search by Article ID, title, category, status และ publish date/time
- Status filter: Draft, Scheduled, Published, Archived
- Category filter: active categories และ category names ที่ถูกใช้อยู่กับบทความเดิม
- Sort options:
  - Newest first
  - Publish time
  - Title A-Z
- Pagination:
  - Page size: 10 articles per page
  - มี Previous, Next และ numbered page buttons
  - เมื่อไม่พบข้อมูลให้แสดง empty state `ไม่พบข้อมูล`

### Row/Card Actions

| Article Status | Actions |
| --- | --- |
| Draft | View detail, Preview as FO, Edit article, Delete draft |
| Scheduled | View detail, Preview as FO, Edit article, Cancel schedule |
| Published | View detail, Preview as FO, Edit article, Archive article |
| Archived | View detail, Preview as FO, Edit article, Restore article |

## 6. Article Detail

Article detail เป็นหน้าหรือ panel สำหรับอ่านข้อมูลบทความแบบ read-only และดูประวัติการเปลี่ยนแปลง

Detail content:

- Article ID
- Title
- Article URL / Slug
- Category
- Author
- Publish Status
- Publish date/time
- Updated date/time
- Cover image
- Cover caption / alt text
- Deck / short intro
- Content blocks
- Likes สำหรับบทความที่เคยเผยแพร่
- Change History

Detail actions:

- Preview as FO
- Edit article
- Status-specific action ตามสถานะปัจจุบัน
- Back to Articles

Change History columns:

- Date/Time
- Admin
- Action
- Change Detail
- Result

## 7. Article Editor

Article editor ใช้สำหรับ Add Article และ Edit Article โดยแบ่ง section ดังนี้:

### Article Header

| Field | Rule / เงื่อนไข |
| --- | --- |
| Title | Required |
| Article URL / Slug | Required, unique, auto-generate จาก title ได้ และ admin แก้เองได้ |
| Category | Required, เลือกได้เฉพาะ active category |
| Author | Read-only ใช้ค่า BO admin/editor ปัจจุบัน |

### Hero / Cover

| Field | Rule / เงื่อนไข |
| --- | --- |
| Cover Image | Required |
| Cover Caption / Alt text | ใช้เป็น caption และ alt text fallback |
| Deck / Short intro | ใช้แสดงคำโปรยของบทความใน preview/detail |

Image validation:

- รองรับ JPG, PNG, WebP
- ขนาดไฟล์ไม่เกิน 5MB
- Cover image aspect ratio ควรอยู่ระหว่าง 1:1 ถึง 16:9

### Content Blocks

ต้องมีอย่างน้อย 1 content block ที่ไม่ใช่ Divider

Block controls:

- Add block
- Move block up
- Move block down
- Delete block

Supported block types:

- Paragraph
- Heading H2
- Heading H3
- Bullet List
- Numbered List
- Hyperlink
- Divider
- Image + Caption
- Quote block
- Comparison Table

Inline text parsing:

- `**bold**`
- `_italic_`
- `~~strikethrough~~`

Hyperlink validation:

- ต้องมี link text
- URL ต้องเป็น safe URL
- Accepted URL forms: `http://`, `https://`, `www.` หลัง normalize หรือ internal path ที่ขึ้นต้นด้วย `/`

Body image validation:

- รองรับ JPG, PNG, WebP
- ขนาดไฟล์ไม่เกิน 5MB
- Aspect ratio ต้องไม่แคบหรือสูงเกินไปจนใช้งานบน FO ไม่เหมาะสม

### Publish Control

| Field | Rule / เงื่อนไข |
| --- | --- |
| Status | Required: Draft, Scheduled, Published, Archived |
| Publish date | Required เมื่อ Status = Scheduled |
| Publish time | Required เมื่อ Status = Scheduled |

เวลา publish/schedule ต้องใช้ timezone `Asia/Bangkok`

## 8. Article Status Lifecycle

| Status | BO Meaning | FO Result |
| --- | --- | --- |
| Draft | ยังไม่เผยแพร่ | ไม่แสดงใน FO |
| Scheduled | รอเวลาที่กำหนด | แสดงเมื่อ publish date/time ถึงเวลาปัจจุบันแล้ว |
| Published | เผยแพร่แล้ว | แสดงใน Board, category, search และ article detail |
| Archived | นำออกจาก public listing | หายจาก Board/Search/Category และ direct link แสดง unavailable |

Status action rules:

| Current Status | Action | Result / ผลลัพธ์ |
| --- | --- | --- |
| Draft | Delete draft | ลบ draft ออกจาก Articles list หลัง confirm |
| Scheduled | Cancel schedule | ล้าง publish date/time และเปลี่ยนบทความกลับเป็น Draft |
| Published | Archive article | เปลี่ยนสถานะเป็น Archived และนำออกจาก FO Board/Search/Category |
| Archived | Restore article | เปลี่ยนสถานะกลับเป็น Published และกลับไปแสดงบน FO |

Editor behavior:

- New article เริ่มต้นเป็น Draft
- เมื่อเลือก Published ระบบ set publish date/time เป็นเวลาปัจจุบันของ `Asia/Bangkok` ถ้าค่า publish date/time ว่าง
- เมื่อเลือก Scheduled ต้องกรอก publish date/time และต้องไม่ย้อนหลัง
- เมื่อเลือก Draft ให้ clear และ disable publish date/time
- Published หรือ Archived article ที่เปิดแก้ไขต้องคง lifecycle status เดิมไว้ การเปลี่ยนสถานะให้ทำผ่าน status action confirmation flow

## 9. Preview As FO

Preview as FO เปิดได้จาก Articles list, Article detail และ Article editor

Preview modal ต้องแสดง:

- Board card preview
- Phone-style FO article preview
- Cover image
- Title
- Category/status metadata
- Deck
- Content blocks
- Quote/list/link/image/comparison content
- Share/action affordances ตามหน้าบทความ FO

เมื่อเปิดจาก editor preview ต้องใช้ form values ปัจจุบันก่อน save เพื่อให้ Admin ตรวจบทความได้ทันที

## 10. Categories

Category เป็น master data ที่จัดการจาก BO และใช้ควบคุมการจัดกลุ่มบทความใน FO Board

### Category Behavior

- Active category แสดงใน FO filter/section และเป็นตัวเลือกใน Add/Edit Article
- Inactive category ไม่แสดงใน FO filter/section และไม่เป็นตัวเลือกสำหรับบทความใหม่หรือบทความที่กำลังแก้ไข
- Deactivate category ถูก block เมื่อยังมี linked articles
- Admin ต้อง move/archive linked articles ก่อนจึง deactivate category ได้
- Delete category ทำได้เฉพาะ category ที่ไม่มี linked articles

### Route And Header

- Route/menu: `Content Management > Categories`
- Breadcrumb: `การดำเนินงาน / Content Management / Categories`
- Page title: `Categories`
- Panel title: `CATEGORY LIST`
- Header actions:
  - `จัดเรียง Category`
  - `เพิ่มหมวดหมู่`

### Category Fields

- Category ID: auto-generated as `CAT-###`
- Name
- Slug / URL
- Description
- Status: Active หรือ Inactive
- Display order
- Updated date/time
- Article count derived from linked articles

### Category List

Desktop columns:

- Category ID
- Category
- URL
- Articles
- Status
- Action

Mobile/card metadata:

- Status
- Article count
- URL
- Updated date/time

Search/filter/sort:

- Search placeholder: `ค้นหา Category ID, Name, URL`
- Search by category ID, name, slug, description และ status
- Status filter: All status, Active, Inactive
- Sort options:
  - Display order
  - Article count
  - Name A-Z
  - Recently updated
- Pagination: 10 rows per page
- Empty/no result state: `ไม่พบข้อมูล`

### Category Detail Modal

Detail modal เปิดจาก row/card หรือ `View detail` และแสดง:

- Category ID
- Name
- URL/slug
- Status
- Description
- Article count
- Updated date/time

Action buttons:

- `แก้ไขหมวดหมู่`
- `Set inactive` เมื่อ category เป็น Active และไม่มี linked articles
- `Set active` เมื่อ category เป็น Inactive

### Create/Edit Category Modal

Required fields:

- Name
- URL/slug
- Status

Optional field:

- Description

Rules:

- Default status ของ category ใหม่คือ Active
- Default display order ของ category ใหม่คือ append ต่อจาก display order สูงสุด
- Slug auto-fill จาก name เมื่อ slug ว่าง โดยใช้ lowercase alphanumeric words joined by hyphen
- Slug input normalize ด้วย slug rule ระหว่างพิมพ์
- Name ต้องไม่ซ้ำกับ category อื่น
- Slug ต้องไม่ซ้ำกับ category อื่น
- Save สำเร็จแล้วปิด modal, refresh list, เปิด detail ของ category ที่บันทึก และแสดง success toast
- เมื่อแก้ชื่อ category ต้อง sync ชื่อ category ใน article rows ที่ link อยู่

### Category Row Actions

- View detail
- แก้ไขหมวดหมู่
- Set inactive เฉพาะ Active category ที่ article count = 0
- Set active เฉพาะ Inactive category
- Delete category เฉพาะ category ที่ article count = 0

### Category Reorder Modal

- เปิดจาก `จัดเรียง Category`
- แสดงเฉพาะ Active categories
- รองรับ drag reorder และ keyboard focus บน reorder rows
- Save แล้ว update display order, reset sort เป็น `Display order`, refresh list และแสดง success toast

## 11. Board Main Article Placement Rules

Board Main ใช้บทความที่ Published แล้วเป็นแหล่งข้อมูลหลัก พื้นที่ Main Hero, Trending Now และ Journal Board preview เลือกบทความอัตโนมัติจาก eligible article pool

### Eligible Article Pool

Article จะ eligible เมื่อครบทุกเงื่อนไข:

- `status = Published`
- `publishDateTime <= now` โดยใช้ `Asia/Bangkok`
- `category.status = Active`
- มีข้อมูลสำหรับ FO card ครบ: title, slug, cover image, cover image alt text, category, excerpt หรือ generated excerpt และ read time
- article ไม่ถูก archived, unpublished, deleted หรือ policy-hidden

Base ordering:

1. `publishDateTime` descending
2. `updatedAt` descending
3. `articleId` descending

### Display Selection Order

| Display Area | Query Source | Selection Order | Deduplication Rule | Empty/Fallback Rule |
| --- | --- | --- | --- | --- |
| Main Hero | Eligible article pool | เลือก article แรกตาม base ordering | Reserve articleId ที่เลือกแล้ว ไม่แสดงซ้ำใน Trending Now หรือ Journal Board preview บน Board Main หน้าเดียวกัน | ถ้าไม่มี eligible article ให้ซ่อน Main Hero และแสดง Board empty state ใต้ header |
| Trending Now | Eligible article pool ที่ exclude Main Hero | ใช้ base ordering | ไม่ซ้ำกับ Main Hero และไม่ซ้ำกันเองใน section | ถ้าจำนวนไม่พอให้แสดงเท่าที่มี ถ้าไม่มีให้ซ่อน section |
| Journal Board preview | Eligible article pool ที่ exclude Main Hero และ Trending Now ที่ render แล้ว | เลือก article แรกที่เหลือเป็น large preview card แล้วตามด้วย smaller list cards ตาม layout | ไม่ซ้ำกับ Main Hero หรือ Trending Now บน Board Main หน้าเดียวกัน | ถ้าไม่มี article เหลือให้ซ่อน Journal Board preview |
| Journal Board View All page | Eligible article pool | ใช้ base ordering จาก published articles ทั้งหมด | ไม่ต้อง dedupe ข้ามหน้า | ถ้าไม่มี eligible article ให้แสดง Journal Board empty state |
| Category page hero | Eligible article pool filtered by selected active category | เลือก article แรกใน category นั้นตาม base ordering | Reserve article ที่เลือกแล้วจาก category page list หน้าเดียวกัน | ถ้า category ไม่มี eligible article ให้แสดง category empty state |
| Category article list | Eligible article pool filtered by selected active category | ใช้ base ordering | ไม่แสดงซ้ำกับ category hero ในหน้าเดียวกัน | แสดง available items; empty state เมื่อไม่มีข้อมูล |

## 12. Reported Board Content

FO `Report article` ส่ง report type `Board Content` และ target type `Article` เข้า BO ที่ `Content Management > Reported Board`

### Report Intake Rules

- Article ไม่หายจาก FO ทันทีหลังถูก report
- Admin review report ได้ตาม permission
- Report queue status: Pending หรือ Closed
- Article status ใน Reported Board แสดงตามสถานะ article master: Published, Scheduled, Draft หรือ Archived
- Reporter identity ต้อง mask ใน report detail
- List/detail แสดงจำนวน reporter และ reporter history ระดับ moderation เท่านั้น

### Reported Board List

Route/header:

- Route/menu: `Content Management > Reported Board`
- Breadcrumb: `การดำเนินงาน / Content Management / Reported Board`
- Page title: `Reported Board`
- Panel title: `Reported Board List`
- Filter toggle: เปิด/ปิด advanced filters
- Reset: ล้าง search/filter/sort และกลับไปค่า default

Desktop columns:

- Report ID
- Article
- Article Status
- Status
- Report Reason
- Reporters
- Priority
- Action

Mobile/card metadata:

- Report status
- Article status
- Reporter count
- Priority
- Article title
- Report reason

Search/filter/sort:

- Search by Report ID, Article ID, Article title, Category, Surface, Article Status, Report Status, Priority, Report Reason, Reported Part และ Reporter Note
- Report status filter: ทุกสถานะ, รอตรวจ/Pending, ปิดแล้ว/Closed
- Priority filter: ทุก priority, High, Medium, Low
- Sort options:
  - ล่าสุดก่อน
  - จำนวน reporter
  - รอนานสุด
- Pagination: 10 rows per page พร้อม Previous, Next และ numbered page buttons
- Empty/no result state: `ไม่พบข้อมูล`

### Report Detail

เมื่อเปิด report detail:

- Breadcrumb: `การดำเนินงาน / Content Management / Report Detail / {Report ID}`
- Page title: `Report Detail`
- Back button: `กลับไป Reported Board`
- Panel title ใช้ article title
- Panel subtitle แสดง `{Report ID} · {Article ID} · reporter identity masked`

Detail sections:

- Header: report id, article title, report status, article status, priority
- `Reported Article`: Report ID, Article ID, Article Title, Category, Article Status, `View Article`
- `Reporter History`: reporter, reported time, status, reason, additional details พร้อม pagination
- `Admin Action History`: Date/Time, Admin, Action, Status, details พร้อม pagination

`View Article` เปิด phone-style FO article preview โดยใช้ article data ล่าสุดจาก article master ถ้าพบ article id และใช้ report preview data เป็น fallback เมื่อ article master ไม่พบ

### Report Actions

| Action | Availability | Result / ผลลัพธ์ |
| --- | --- | --- |
| View detail | ทุก report | เปิด Report Detail |
| View Article | ทุก report | เปิด FO article preview modal |
| ปิดรายงาน | Pending report | เปลี่ยน report เป็น Closed โดยไม่เปลี่ยนสถานะ article |
| แก้ไขบทความ | Pending report ที่ article ยังไม่ Archived | เปิด Edit Article ของ article ที่ถูกรายงาน |
| Archive article | Pending report ที่ article ยังไม่ Archived | เปลี่ยน article master เป็น Archived, เปลี่ยน report content status เป็น Archived, เปลี่ยน report เป็น Closed, เพิ่ม Article Change History และเพิ่ม Reported Board Admin Action History |

### Close Report Confirmation

`ปิดรายงาน` ต้องเปิด confirmation modal:

- แสดง target เป็น article title, report id และ article id
- ต้องเลือก reason หรือกรอก note สำหรับ audit ได้
- Impact note ระบุว่าเป็นการปิดรายงานหลัง review โดยไม่เปลี่ยนสถานะ Board content
- เมื่อสำเร็จต้องเพิ่ม Admin Action History เป็น `Close Report`

### Archive From Report Confirmation

`Archive article` ต้องเปิด confirmation modal:

- แสดง target เป็น article title, report id และ article id
- ต้องเลือก reason หรือกรอก note สำหรับ audit ได้
- Impact note ระบุว่า action นี้นำบทความออกจาก Board public surfaces, ปิดรายงาน และอัปเดตสถานะบทความหลักเป็น Archived
- เมื่อสำเร็จต้อง:
  - เปลี่ยน article master status เป็น `Archived`
  - เพิ่ม Article Change History เป็น `Archived` พร้อม note ที่อ้างอิง report id
  - เปลี่ยน report content status เป็น `Archived`
  - เปลี่ยน report status เป็น `Closed`
  - เพิ่ม Reported Board Admin Action History เป็น `Archive Article`
  - เพิ่มหรือแสดง Admin Action History row สำหรับ `Close Report`

หลัง archive สำเร็จ FO ต้องไม่แสดง article นั้นใน Board/Search/Category และ direct link ต้องแสดง unavailable

## 13. FO Display Rules

| BO Action | FO Result / ผลบน FO |
| --- | --- |
| Publish article | Article แสดงใน Board, category, search และ detail |
| Schedule article | ยังไม่แสดงจนถึง publish date/time |
| Update published article | FO แสดง content ล่าสุดหลัง sync/cache invalidation |
| Cancel schedule | Article กลับเป็น Draft และไม่แสดงใน FO |
| Delete draft | Draft ถูกลบออกจาก BO list และไม่เคยแสดงใน FO |
| Archive article | Article หายจาก Board/Search/Category และ direct link แสดง unavailable |
| Restore article | Article กลับเป็น Published และแสดงใน Board/Search/Category อีกครั้ง |
| Activate category | Category แสดงใน FO filter/section และ Add/Edit Article selector |
| Deactivate category | Category หายจาก FO filter/section และ Add/Edit Article selector |
| Close report | Report ถูกปิดใน BO โดย article ยังอยู่ตามสถานะเดิม |
| Archive article from Reported Board | Article master เปลี่ยนเป็น Archived, article หายจาก FO Board/Search/Category, direct link แสดง unavailable และ report ถูกปิด |

## 14. Error, Empty, Loading States

ต้องรองรับ states ต่อไปนี้:

- Loading article list
- Empty article list
- No article search result
- Save failed
- Publish validation failed
- Slug duplicate
- Image upload validation failed
- Unsafe/invalid hyperlink validation failed
- Cancel create/edit confirmation
- Status action confirmation
- Status action failure
- Loading category list
- Empty category list
- No category search result
- Category name duplicate
- Category slug duplicate
- Blocked category deactivate when linked articles exist
- Delete category confirmation
- Loading Reported Board list
- Empty Reported Board list
- Reported Board no search result
- Reported Board action confirmation
- Reported Board action failure
- Preview failed
- Missing article fallback ใน View Article modal

## 15. Audit Requirements

### Article Audit

- Article detail แสดง `Change History`
- Article create/update/cancel schedule/archive/restore เพิ่ม visible history rows
- Draft delete บันทึก audit event แม้ draft หายจาก list หลังลบ

### Category Audit

- Category create/update/activate/deactivate/reorder/delete บันทึก audit event
- Category delete ต้องบันทึก audit ก่อนนำ row ออกจาก list

### Reported Board Audit

- Reported Board detail แสดง `Reporter History` และ `Admin Action History`
- `ปิดรายงาน` เพิ่ม Admin Action History เป็น `Close Report`
- `Archive article` เพิ่ม Admin Action History เป็น `Archive Article`, เปลี่ยน report เป็น `Closed`, เปลี่ยน report content status เป็น `Archived` และเพิ่ม Article Change History เป็น `Archived` พร้อม reference report id

### Backend Audit Event Fields

Audit event ควรมีข้อมูล:

- Admin ID
- Target type
- Target ID
- Timestamp
- Action
- Result
- Before/after values เมื่อมีข้อมูล
- Reason/note เมื่อจำเป็น
- Session/IP context เมื่อมีข้อมูล

## 16. Acceptance Criteria

| ID | Criteria / เกณฑ์ยอมรับ |
| --- | --- |
| AC-BO-CONTENT-001 | Admin เปิด Articles, search/filter/sort, paginate, view detail, create article, edit article, preview article และใช้ status-specific actions ได้ |
| AC-BO-CONTENT-002 | Article editor validate title, unique URL, active category, cover image, อย่างน้อย 1 content block, safe links และ schedule date/time ได้ถูกต้อง |
| AC-BO-CONTENT-003 | Draft, Scheduled, Published และ Archived lifecycle ทำงานครบตาม status rules |
| AC-BO-CONTENT-004 | Preview as FO render article data เดียวกับที่กำลังกรอกหรือ saved แล้ว |
| AC-BO-CONTENT-005 | FO แสดงเฉพาะ Published article หรือ Scheduled article ที่ถึงเวลาแล้ว |
| AC-BO-CONTENT-006 | Archived article หายจาก Board/Search/Category และ direct link แสดง unavailable |
| AC-BO-CONTENT-007 | Admin เปิด Categories, search/filter/sort, paginate, view detail, create/edit, reorder active categories, activate/deactivate และ delete category ที่ไม่มี linked articles ได้ |
| AC-BO-CONTENT-008 | Inactive category ไม่แสดงใน FO filter/section และ Add/Edit Article selector |
| AC-BO-CONTENT-009 | Deactivate/delete category ถูก block เมื่อยังมี linked articles |
| AC-BO-CONTENT-010 | Board Main placement เลือก Main Hero, Trending Now และ Journal Board preview อัตโนมัติจาก eligible published articles โดยไม่แสดงบทความซ้ำในหน้าเดียวกัน |
| AC-BO-CONTENT-011 | Report article เข้า BO Reported Board โดย article ยังไม่หายจาก FO ทันที |
| AC-BO-CONTENT-012 | Admin เปิด Reported Board list/detail, search/filter/sort, paginate, view article preview, close report, edit article และ archive article ได้ |
| AC-BO-CONTENT-013 | Archive article จาก Reported Board เปลี่ยน article master เป็น Archived, ปิด report เป็น Closed, เพิ่ม Article Change History และ Reported Board Admin Action History และทำให้ article หายจาก FO Board/Search/Category |
| AC-BO-CONTENT-014 | Article detail, Category actions และ Reported Board actions มี audit/history ตาม requirement |
| AC-BO-CONTENT-015 | UI responsive ใช้งานได้ที่ mobile-width, tablet และ desktop โดยไม่มี content overflow หรือ element overlap |
