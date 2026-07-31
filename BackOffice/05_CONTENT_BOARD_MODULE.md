# 05 BO Content / Board Module

**Version:** `BO-05-v0.2`
**Date:** 2026-07-31
**Status:** Prototype-aligned draft
**Platform:** Responsive Web Back Office
**Primary FO Source:** `../FrontOffice/12_BOARD_MODULE.md`
**Integration Map:** `../ProjectAdmin/FO_BO_INTEGRATION_MAP.md`

## 1. วัตถุประสงค์

BO Content / Board Module คือเครื่องมือสำหรับ Admin ใช้สร้าง แก้ไข เผยแพร่ ตั้งเวลา และจัดการบทความที่แสดงใน FO Board

FO Board เป็น Article Area ไม่ใช่ user-generated forum ใน V1 ดังนั้นผู้ใช้ FO อ่าน ค้นหา กรองหมวด กด Like, Share และ Report article ได้ แต่สร้าง/แก้ไข/ลบบทความไม่ได้ งาน authoring ทั้งหมดต้องอยู่ใน BO เท่านั้น

## 2. Scope

### Phase 1 Board Content Decision - 2026-07-30

ใน Phase 1 การจัดวาง visual หลักของ Board ต้องมาจาก Article เป็นหลัก ไม่ใช้ `Content Management > Banners`, manual `Featured Article`, หรือ `Featured Order` สำหรับ flow ปัจจุบัน รายการเหล่านี้ถือเป็น future scope เว้นแต่ Product จะเปิด scope campaign/promotion banners ใหม่อย่างชัดเจน

Source of truth ของ Phase 1 ตอนนี้:

- BO จัดการ Board content ผ่าน `Content Management > Articles` และ `Content Management > Categories`
- FO Board Main แสดง `Main Hero`, `Trending Now`, และ `Journal Board preview` จาก Published Articles
- FO ต้องไม่ใช้ Banner entity แยกสำหรับ Board Main Hero, Trending Now หรือ Journal Board preview
- Admin ไม่ต้องเลือก Hero/Featured เองใน Phase 1 เพราะ placement คำนวณจาก deterministic query rules ใน section 11
- reference เก่าในเอกสารนี้ที่พูดถึง `Featured Article`, `Featured Order`, หรือ `Board Banners` ให้ถือว่าถูก superseded ด้วย decision นี้สำหรับ Phase 1

### BO Prototype Alignment - 2026-07-31

สำหรับ BO `Content Management > Articles` ให้ใช้ `../Prototypes/bo-prototype.html` เป็น source of truth ปัจจุบันสำหรับ fields, display behavior, filters, actions, modals, validation states และ responsive presentation

ถ้าเอกสารนี้ขัดกับ prototype ปัจจุบันของ `Content Management > Articles` ให้ยึด behavior ตาม prototype ก่อน เว้นแต่ Product อนุมัติ change request ใหม่ชัดเจน

### In Scope

- Article list พร้อม search, filter, sort, pagination
- Create / edit article
- Article block builder
- Draft / Scheduled / Published / Archived lifecycle
- Preview as FO
- Automated Board Main placement from Published Articles
- Category management
- Article tags เป็น mock/list metadata เท่านั้นใน prototype ปัจจุบัน
- Reported Board Content review handoff
- Audit log ทุก publish/archive/category action
- Responsive web layout สำหรับ desktop, tablet และ mobile-width browser

### Out Of Scope

- User-generated post หรือ discussion thread
- Article comment ใน FO V1
- FO article authoring tool
- AI content generation
- Public SEO web scope นอกเหนือจาก FO Board เว้นแต่มี decision เพิ่ม
- Broadcast notification เมื่อ publish article ยังเป็น future/needs decision
- Board banner management เว้นแต่ Product เปิด scope นี้ใหม่ชัดเจน
- SEO fields, related articles, featured controls และ analytics เว้นแต่ถูกเพิ่มเข้า prototype แล้ว

## 3. Admin Access And Permissions

BO ใช้ Admin account type เดียว สิทธิ์การเข้าถึงควบคุมผ่าน module access, action policy, sensitive-data policy, confirmation, reason และ audit requirements แทนการแยกหลายประเภทของ BO admin account


| Access Area | Rule / เงื่อนไข |
| --- | --- |
| Module access | Admin ใช้ list/detail/search/filter ได้เมื่อมีสิทธิ์เข้า module |
| Write action | Create, update, status change, remove, restore, publish, archive, retry และ action ใกล้เคียงต้องตรวจ permission, มี confirmation สำหรับ action เสี่ยง, ใส่ reason เมื่อกระทบ FO/user และต้องมี audit log |
| Sensitive data | Mask เป็น default; reveal ได้เฉพาะเมื่อมี business reason, policy approval และ audit log |
| Export | ต้องตรวจ permission, จำกัด scope, ใช้ expiry/background job เมื่อจำเป็น และบันทึก audit export event |
| Direct URL/API | ต้อง enforce ที่ route, API และ service layer ห้ามพึ่งแค่การซ่อน UI |

## 4. Responsive Layout

| Width | Requirement / การแสดงผล |
| --- | --- |
| Mobile-width browser | Article list ต้อง collapse เป็น stacked card rows และ article editor ต้องแยก section ชัดเจนเป็น `Article Header`, `Hero / Cover`, `Content Blocks`, `Publish Control` |
| Tablet | List/detail/editor ใช้ responsive shell เดียวกัน และ grid field ต้อง collapse เมื่อพื้นที่จำกัด |
| Desktop | Article list แสดงเป็น table-like grid; detail และ editor ใช้ full-width section blocks ใน main content panel |

Editor ต้องป้องกัน text, uploaded-image preview, content-block controls, date/time inputs และ modal preview content ไม่ให้ overflow บนหน้าจอเล็ก

## 5. Article List

Article list ต้องตรงกับ table/card behavior ใน prototype ปัจจุบัน

Header controls:

- Page action: `สร้างบทความ`
- Filter toggle: เปิด/ปิด advanced filters
- Reset: reset search/filter/sort และกลับไปที่ Articles list default

Desktop table columns:

- Article ID
- Article title / ชื่อบทความ
- Category
- Publish Status
- Publish Date
- Action

Mobile/card metadata:

- Article ID
- Article title
- Category tag
- Status pill
- Read time tag
- Publish date/time

Row action menu:

- View detail
- Preview as FO
- Edit article
- Status-specific action ตามสถานะ:
  - Draft: `Delete draft`
  - Scheduled: `Cancel schedule`
  - Published: `Archive article`
  - Archived: `Restore article`

### Search And Filters

Prototype รองรับ:

- Search by Article ID, title, category, status, publish date/time และ tags
- Status: Draft, Scheduled, Published, Archived
- Category

Prototype ปัจจุบันยังไม่มี author filter, date range filter, featured-only filter หรือ reported-only filter บน Articles list

Sort options:

- Newest first
- Publish time
- Title A-Z

Pagination:

- Page size ตาม prototype: 10 articles per page
- มีปุ่ม Previous/next และ numbered page buttons ใต้ list
- เมื่อ search/filter แล้วไม่พบข้อมูล ให้แสดง shared empty state

## 6. Article Editor

### Required Fields

| Field | Rule / เงื่อนไข |
| --- | --- |
| Title | Required |
| Article URL / Slug | Required, unique, auto-generate จาก title ได้ ยกเว้น admin แก้เอง |
| Cover Image | Required ตาม save validation ใน prototype ปัจจุบัน |
| Cover Caption / Alt text | ใช้ field เดียวใน prototype สำหรับ cover caption และ image alt fallback |
| Category | Required |
| Author | Read-only; ใช้ค่า BO admin/editor ปัจจุบัน |
| Content Blocks | ต้องมีอย่างน้อย 1 content block ที่ไม่ใช่ divider |
| Status | Required |

### Prototype Fields

Article Header:

- Title
- Article URL
- Category
- Read-only Author

Hero / Cover:

- Cover image upload
- Caption / Alt text ของ cover image
- Deck / short intro หรือคำโปรยสั้น

Content Blocks:

- Add block
- Move block up/down
- Delete block
- Reorder ทำผ่าน block move controls

Publish Control:

- Status
- Publish date
- Publish time

Fields ที่มีเฉพาะใน mock/data model หรือ legacy fallback ห้ามนำมาเป็น required UI จนกว่า prototype จะเพิ่มเข้ามา ได้แก่ tags, read time, related articles, SEO title, SEO description, featured article, featured order

### Article Block Builder

Prototype ปัจจุบันใช้ block builder แทน full rich text toolbar โดยรองรับ block types:

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

Inline formatting เป็น prototype-level text parsing เท่านั้น:

- `**bold**`
- `_italic_`
- `~~strikethrough~~`

Prototype ปัจจุบันไม่มี toolbar controls สำหรับ underline, H1, rich text styling หรือ video embed

Hyperlink block ต้องมี link text และ safe URL โดย accepted URL forms คือ `http://`, `https://`, `www.` หลัง normalize หรือ internal path ที่ขึ้นต้นด้วย `/`

## 7. Article Status Lifecycle

| Status | BO Meaning | FO Result |
| --- | --- | --- |
| Draft | ยังไม่เผยแพร่ | ไม่แสดงใน FO |
| Scheduled | รอเวลาที่กำหนด | แสดงเมื่อ publish date/time <= current time |
| Published | เผยแพร่แล้ว | แสดงใน Board, category, search และ article detail |
| Archived | นำออกจาก public listing | หายจาก Board/Search/Category; direct link แสดง unavailable behavior ตาม FO |

เวลา publish/schedule ต้องใช้ `Asia/Bangkok`

Prototype status actions:

| Current Status | Available Prototype Action | Result / ผลลัพธ์ |
| --- | --- | --- |
| Draft | Delete draft | ลบ draft ออกจาก Articles list หลัง confirm |
| Scheduled | Cancel schedule | ล้าง publish date/time และเปลี่ยนบทความกลับเป็น Draft |
| Published | Archive article | เปลี่ยนสถานะเป็น Archived และนำออกจาก FO Board/Search/Category |
| Archived | Restore article | เปลี่ยนสถานะกลับเป็น Published โดยใช้ publish date เดิมเมื่อมีข้อมูล |

เมื่อ edit article ที่เป็น Published หรือ Archived อยู่แล้ว prototype จะทำให้ publish lifecycle status เป็น read-only ใน editor การเปลี่ยน status ของ article กลุ่มนี้ต้องทำผ่าน status action confirmation flow ไม่ใช่ editor status dropdown

## 8. Publish Rules

Prototype ปัจจุบันทำ save validation ก่อน create/update article:

- Title ต้องไม่ว่าง
- Slug unique
- Cover image ต้องมี
- Category ต้องมี และต้องเป็น Active category
- ต้องมีอย่างน้อย 1 non-divider content block
- Hyperlink block ต้องมี link text และ safe URL
- Cover/body image upload รองรับ JPG, PNG, WebP ขนาดไม่เกิน 5MB
- Cover image aspect ratio ควรอยู่ระหว่าง 1:1 ถึง 16:9
- Body image aspect ratio ต้องไม่แคบหรือสูงเกินไป

Publish Now behavior ใน prototype:

- เมื่อเลือก `Published` ระบบจะ set publish date/time เป็นเวลาปัจจุบันของ `Asia/Bangkok` เมื่อจำเป็น
- Publish date/time inputs จะ disabled เมื่อ status เป็น `Published` หลัง sync
- Existing Published articles จะคง publish status เดิมระหว่าง edit

Schedule Publish behavior ใน prototype:

- Status ต้องเป็น `Scheduled`
- ต้องมี publish date และ publish time
- Publish date/time ต้องไม่ย้อนหลังจากเวลาปัจจุบันของ `Asia/Bangkok`
- Date/time inputs ใช้ browser date/time pickers

Draft behavior ใน prototype:

- Status `Draft` จะ clear และ disable publish date/time inputs
- Draft articles ลบได้ผ่าน `Delete draft`

Archive behavior ใน prototype:

- Published articles archive ได้ผ่าน `Archive article`
- Action นี้ต้องผ่าน confirmation modal
- Archive จะ update status เป็น `Archived`, update `Updated At` และบันทึก change history
- Archived articles restore ได้ผ่าน `Restore article`

รายการต่อไปนี้เป็น implementation/back-end responsibilities และไม่ได้เป็น visible UI controls ใน prototype:

- Permission enforcement
- FO cache invalidation or sync event
- Background schedule job verification
- Persisted backend audit event schema

Prototype สื่อ behavior เหล่านี้ผ่าน confirmation modals, status/result changes, toast/result states และ Change History

## 9. Preview As FO

Preview as FO ใน prototype ปัจจุบัน:

- เปิดได้จาก article detail, article editor และ article row action surface ในจุดที่ prototype wiring ไว้
- ใช้ modal ที่มี Board card preview และ phone-style FO article preview
- แสดง cover image, title, category/status metadata, deck, body/content blocks, quote/list/link/image/comparison content และ share/action affordances ตาม prototype
- Editor preview update จาก form values ปัจจุบันก่อน save
- Prototype scenario tools จำลอง preview success หรือ preview failure ได้

Prototype ปัจจุบันยังไม่มี desktop preview mode แยก, ไม่มี view-count/analytics tracking และไม่มี explicit permission UI ใน preview modal สิ่งเหล่านี้ยังเป็น service/security responsibilities นอก visual prototype

## 10. Categories

Category is BO-managed master data:

- Admin สามารถเพิ่ม แก้ไข เปิด/ปิดใช้งาน จัดเรียง และลบ category ได้จาก `Content Management > Categories`
- ไม่มี fixed baseline ที่บังคับว่าต้องใช้ชื่อ category ใดถาวร
- Category names ใน prototype เป็น seed/example data เพื่อสาธิต behavior ของระบบเท่านั้น
- Active category แสดงใน FO filter/section และใช้เป็นตัวเลือกใน Add/Edit Article
- Inactive category ไม่แสดงใน FO filter/section และไม่เป็นตัวเลือกสำหรับบทความใหม่หรือบทความที่กำลังแก้ไข

Prototype current seed/example data:

| Category ID | Name | Slug | Status | Display order |
| --- | --- | --- | --- | --- |
| CAT-001 | Buying Guide | buying-guide | Active | 10 |
| CAT-002 | Watch 101 | watch-101 | Active | 20 |
| CAT-003 | Watch Market | watch-market | Active | 30 |
| CAT-004 | Watch Events | watch-events | Active | 40 |
| CAT-005 | Watch Apparel | watch-apparel | Active | 50 |
| CAT-006 | Journal Board | journal-board | Active | 60 |
| CAT-007 | Owner Stories | owner-stories | Inactive | 70 |

Category fields:

- Category ID: auto-generated as `CAT-###`
- Name
- Slug / URL
- Description
- Active/Inactive
- Display order
- Updated date/time
- Article count derived from linked articles

Category list:

- Route/menu: `Content Management > Categories`
- Breadcrumb: `การดำเนินงาน / Content Management / Categories`
- Page title: `Categories`
- Panel title: `CATEGORY LIST`
- Header actions:
  - `จัดเรียง Category`: opens reorder modal for active categories on FO Board
  - `เพิ่มหมวดหมู่`: opens create category modal
- Desktop table columns:
  - Category ID
  - Category
  - URL
  - Articles
  - Status
  - Action
- Mobile/card metadata:
  - Status pill
  - Article count
  - URL
  - Updated date/time
- Search placeholder: `ค้นหา Category ID, Name, URL`
- Search matches category ID, name, slug, description และ status
- Status filter: All status, Active, Inactive
- Sort options:
  - Display order
  - Article count
  - Name A-Z
  - Recently updated
- Pagination follows article list page size in the current prototype: 10 rows per page
- Empty/no result state uses the shared empty row text `ไม่พบข้อมูล`

Category detail modal:

- Opens from row/card or `View detail`
- Shows read-only name, URL/slug, status และ description
- Action buttons:
  - `แก้ไขหมวดหมู่`
  - `Set inactive` when category is Active and has no linked articles
  - `Set active` when category is Inactive
- Current prototype stores category action history in data, but category detail does not render a visible Change History section

Create/edit category modal:

- Required fields: Name, URL/slug, Status
- Optional field: Description
- Default status for new category: Active
- Default display order for new category: appended after the existing max display order
- Slug auto-fills from name when slug is empty, using lowercase alphanumeric words joined by hyphen
- Slug input is normalized with the same slug rule while typing
- Validation:
  - Name is required
  - Name must be unique across categories except the current edited category
  - Slug is required
  - Slug must be unique across categories except the current edited category
  - Setting an existing category to Inactive is blocked when linked articles exist
- Saving create/edit closes the editor, refreshes `Content Management > Categories`, opens the saved category detail modal, and shows success toast
- When an existing category name changes, linked article rows using the previous category name are synced to the new category name in the prototype data

Category row actions:

- `View detail`
- `แก้ไขหมวดหมู่`
- `Set inactive` for Active category only when article count is 0
- `Set active` for Inactive category
- `Delete category` only when article count is 0

Category reorder modal:

- Opens from `จัดเรียง Category`
- Lists Active categories only
- Supports drag reorder and keyboard focus on reorder rows
- Saving updates display order, resets sort to `Display order`, refreshes the category list, and shows success toast

Inactive category:

- ไม่แสดงใน FO filter/section
- ไม่ควรเลือกใช้กับ article publish ใหม่
- ไม่แสดงเป็นตัวเลือกใน Add/Edit Article สำหรับบทความใหม่หรือบทความที่กำลังแก้ไข
- Article list filter ยังรวม active master categories และ category names ที่ถูกใช้อยู่ใน article rows เพื่อให้กรองบทความเดิมได้
- Prototype จะ block การ deactivate category ที่ยังมี linked articles อยู่ Admin ต้อง move/archive linked articles ก่อนจึงจะ deactivate ได้

Delete category:

- Prototype แสดง action นี้เฉพาะ category ที่ไม่มี linked articles
- Delete ต้องผ่าน confirmation modal
- เมื่อลบแล้ว category หายจาก BO category list และแสดง success toast
- Prototype ไม่แสดง visible audit/history row สำหรับ delete category หลังลบ เพราะ row ถูกนำออกจาก mock list

## 11. Board Main Article Placement Rules

Phase 1 Board Main ไม่ใช้ Banner entity และไม่ต้องมี Admin-selected Featured/Hero flags พื้นที่แสดงผลด้านล่างทั้งหมดเลือกอัตโนมัติจาก eligible Published Articles

Hero selection เป็น automatic ในทุก Board article listing context:

- Board Main `Main Hero` ใช้ latest eligible Published Article จากทุก active Board categories
- Category page hero ใช้ latest eligible Published Article ภายใน active category ที่เลือกอยู่
- Admin ไม่ต้อง manually select hero articles ใน Phase 1

### Eligible Article Pool

Article จะ eligible สำหรับ Board Main placement ก็ต่อเมื่อครบทุกเงื่อนไข:

- `status = Published`
- `publishDateTime <= now` using `Asia/Bangkok`
- `category.status = Active`
- required FO card fields ต้องมีครบ: title, slug, cover image, cover image alt text, category, excerpt หรือ generated excerpt, read time
- article ต้องไม่ใช่ archived, unpublished, deleted หรือ policy-hidden

Base ordering สำหรับ automatic fallback ทุกจุด:

1. `publishDateTime` descending
2. `updatedAt` descending as tie-breaker
3. `articleId` descending as final tie-breaker

### Display Selection Order

| Display Area | Query Source | Selection Order | Deduplication Rule | Empty/Fallback Rule |
| --- | --- | --- | --- | --- |
| Main Hero | Eligible article pool | เลือก article แรกตาม base ordering | Reserve `articleId` ที่เลือกแล้ว และไม่แสดงซ้ำใน Trending Now หรือ Journal Board preview บน Board Main | ถ้าไม่มี eligible article ให้ซ่อน Main Hero และแสดง Board empty state ใต้ header |
| Trending Now | Eligible article pool ที่ exclude Main Hero | ถ้ามี analytics ranking ให้ sort ด้วย trending score ใน configurable recent window แล้วตามด้วย base ordering; ถ้าไม่มี analytics ใช้ base ordering | Exclude Main Hero และห้ามซ้ำใน Trending Now | ถ้าจำนวนไม่พอ layout ให้แสดงเท่าที่มี ห้าม backfill ด้วย Main Hero; ถ้าไม่มีเลยให้ซ่อน section |
| Journal Board preview | Eligible article pool ที่ exclude Main Hero และ Trending Now items ที่ render แล้วบน Board Main | เลือก article แรกที่เหลือเป็น large Journal Board preview card แล้วตามด้วย smaller list cards ถ้า layout มี | ห้าม repeat articles ที่แสดงใน Main Hero หรือ Trending Now บน Board Main page เดียวกัน | ถ้าไม่มี article เหลือให้ซ่อน Journal Board preview บน Board Main |
| Journal Board View All page | Eligible article pool | ใช้ base ordering จาก published articles ทั้งหมด | No cross-page dedupe; articles ที่ใช้ใน Board Main Hero หรือ Trending Now ต้องยังแสดงในหน้านี้ | ถ้าไม่มี eligible article ให้แสดง Journal Board empty state |
| Category page hero | Eligible article pool filtered by selected active category | เลือก article แรกใน category นั้นตาม base ordering | Reserve selected article จาก category page list ถ้าหน้าเดียวกันมีทั้ง hero และ list | ถ้า category ไม่มี eligible article ให้แสดง category empty state |
| Category article list | Eligible article pool filtered by selected active category | ใช้ base ordering | Default คือ exclude category hero ใน page preview/list เดียวกันเพื่อลดความซ้ำ | แสดง available items; empty state เมื่อไม่มีข้อมูล |

### Trending Score

Trending score เป็น optional สำหรับ Phase 1 ถ้า implement ต้อง deterministic และ backend ต้อง document วิธีคิด เช่น weighted views, likes, shares และ recency ระหว่างที่ยังไม่มี score ให้ Trending Now ใช้ latest eligible articles หลังจาก exclude Main Hero

### Future Banner Scope

Banner management เป็น future scope เฉพาะ non-article placements เช่น campaign, promotion, event, sponsor creative, external URL หรือ deep link ที่ไม่ใช่ Article Detail ห้ามใช้ Banner สำหรับ Board Main Hero, Trending Now หรือ Journal Board preview ใน Phase 1

Featured controls, manual featured order, manual curated Trending Now และ Board Banners ไม่ใช่ behavior ปัจจุบันของ BO Articles prototype ห้ามเพิ่มเข้า `Content Management > Articles` เว้นแต่ Product เปิด scope นี้ใหม่และ prototype ถูก update แล้ว

## 12. Reported Board Content

FO `Report article` ต้องส่ง report type `Board Content` และ target type `Article` เข้า BO moderation handoff

Rules / เงื่อนไข:

- Article ไม่หายจาก FO ทันทีหลังถูก report
- Admin review report ได้ตาม permission
- Action ที่เป็นไปได้: resolve/no action, edit article, archive article, escalate to Admin
- ถ้า archive จาก report ต้องมี reason และ audit
- Report history ต้องผูกกับ article detail

## 13. FO Display Rules

| BO Action | FO Result / ผลบน FO |
| --- | --- |
| Publish article | Article แสดงใน Board, category, search และ detail |
| Schedule article | ยังไม่แสดงจนถึง publish date/time |
| Archive article | Article หายจาก Board/Search/Category และ direct link แสดง unavailable |
| Update published article | FO แสดง content ล่าสุดหลัง sync/cache invalidation |
| Cancel schedule | Article กลับเป็น Draft และไม่แสดงใน FO |
| Delete draft | Draft ถูกลบออกจาก BO list และไม่เคยแสดงใน FO |
| Restore article | Article กลับเป็น Published และแสดงใน Board/Search/Category อีกครั้ง |
| Activate category | Category แสดงใน FO filter/section |
| Deactivate category | Category หายจาก FO filter/section หลัง linked articles ถูก resolve แล้ว |

Featured actions และ banner actions ไม่ใช่ behavior ปัจจุบันของ `Content Management > Articles` prototype

## 14. Analytics

Articles surfaces ใน prototype ปัจจุบันแสดงเฉพาะ lightweight mock metrics:

- Article list อาจแสดง read time ใน card metadata
- Article detail แสดง Likes เฉพาะ Published/Archived articles
- Article detail แสดง Change History

Prototype ปัจจุบันยังไม่มี Articles analytics dashboard, article views table, shares, report count column, top-articles analytics, category performance analytics หรือ search keyword analytics รายการเหล่านี้เป็น future scope เว้นแต่จะถูกเพิ่มเข้า prototype

## 15. Error, Empty, Loading States

States ที่ prototype ปัจจุบันรองรับ:

- Empty article list
- Empty category list
- No search result
- Save failed
- Publish validation failed
- Slug duplicate
- Category name duplicate
- Category slug duplicate
- Blocked category deactivate when linked articles exist
- Preview failed
- Image upload validation failed
- Unsafe/invalid hyperlink validation failed
- Cancel create/edit confirmation
- Status action confirmation
- Status action failure ผ่าน prototype scenario tools

Permission denied, concurrent edit warning และ schedule job failure เป็น service/backend states และยังไม่ใช่ Articles prototype UI ตอนนี้

## 16. Audit Requirements

Audit/history display ใน prototype ปัจจุบัน:

- Article detail แสดง `Change History` พร้อม Date/Time, Admin, Action, Change Detail และ Result
- Article create, update, cancel schedule, archive และ restore จะเพิ่ม visible history rows ใน prototype
- Draft delete จะลบ draft ออกจาก list ใน prototype
- Category create/update/activate/deactivate จะเพิ่ม action history ใน prototype data
- Category detail modal ใน prototype ปัจจุบันยังไม่แสดง visible Change History section
- Category delete จะลบ category ออกจาก mock list หลัง confirmation และไม่มี visible history row หลังลบ
- Report moderation result

Featured toggle/order change, banner create/update/activate/deactivate, export analytics และ preview audit ไม่ใช่ prototype requirements ปัจจุบัน

Backend audit event schema ยังเป็น implementation responsibility และควรมี admin ID, target type, target ID, timestamp, action, result, before/after values เมื่อมีข้อมูล, reason เมื่อจำเป็น และ session/IP context เมื่อมีข้อมูล

## 17. Acceptance Criteria

| ID | Criteria / เกณฑ์ยอมรับ |
| --- | --- |
| AC-BO-CONTENT-001 | Admin เปิด Articles, search/filter/sort, paginate, view detail, create article, edit article, preview article และใช้ status-specific actions ตาม prototype ได้ |
| AC-BO-CONTENT-002 | FO แสดงเฉพาะ Published article หรือ Scheduled article ที่ถึงเวลาแล้ว |
| AC-BO-CONTENT-003 | Archived article หายจาก Board/Search/Category และ direct link แสดง unavailable behavior |
| AC-BO-CONTENT-004 | Preview as FO เปิดใน prototype modal และ render article data เดียวกับที่กำลังกรอกหรือ saved แล้ว |
| AC-BO-CONTENT-005 | Article editor validate title, unique URL, active category, cover image, อย่างน้อย 1 content block, safe links และ schedule date/time ตาม prototype behavior |
| AC-BO-CONTENT-006 | Status actions ทำงานผ่าน confirmation flow: delete draft, cancel schedule, archive article, restore article |
| AC-BO-CONTENT-007 | Admin เปิด Categories, search/filter/sort, paginate, view detail, create/edit, reorder active categories, activate/deactivate และ delete category ที่ไม่มี linked articles ตาม prototype ได้ |
| AC-BO-CONTENT-007A | Category active/inactive behavior ต้องตาม prototype รวมถึง block deactivation เมื่อยังมี linked articles และ inactive category ไม่แสดงใน Add/Edit Article selector |
| AC-BO-CONTENT-008 | Report article เข้า BO moderation handoff โดย article ยังไม่หายจาก FO ทันที |
| AC-BO-CONTENT-009 | Article detail แสดง Change History สำหรับ create/update/status actions ตาม prototype |
| AC-BO-CONTENT-010 | UI responsive ใช้งานได้ที่ mobile-width, tablet และ desktop ตาม prototype |
| AC-BO-CONTENT-011 | Featured article controls, featured order, banner management, article analytics dashboard และ rich text toolbar ไม่ required เว้นแต่ถูกเพิ่มเข้า prototype |

## 18. Open Decisions

| ID | Decision Needed / เรื่องที่ต้องตัดสินใจ | Current Recommendation / แนวทางปัจจุบัน |
| --- | --- | --- |
| BO-CONTENT-DEC-001 | Board ต้องมี public SEO web page แยกจาก FO mobile หรือไม่ | Phase 1 ถือว่าเป็น FO Board ก่อน |
| BO-CONTENT-DEC-002 | Board Main placement algorithm ยังอยู่นอก BO Articles prototype UI ปัจจุบัน | ใช้ product rule เดิม: automatic latest eligible Published Article fallback; ห้ามเพิ่ม manual featured controls เว้นแต่ Product เปิด scope ใหม่ |
| BO-CONTENT-DEC-003 | Published article update ต้อง require re-approval หรือไม่ | Prototype ปัจจุบัน allow edit และบันทึก Change History; backend approval policy ยังเป็น product/service decision |
| BO-CONTENT-DEC-004 | Inactive category ส่งผลต่อ article เดิมอย่างไร | Prototype ปัจจุบัน block deactivation เมื่อยังมี linked articles; คง behavior นี้ไว้ เว้นแต่ Product อนุมัติ move/archive fallback |
| BO-CONTENT-DEC-005 | Articles ควรแสดง analytics columns เช่น views, likes, report count หรือไม่ | ยังไม่อยู่ใน prototype list ปัจจุบัน ให้ถือเป็น future scope |
