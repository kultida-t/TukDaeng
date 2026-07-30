# 05 BO Content / Board Module

**Version:** `BO-05-v0.1`  
**Date:** 2026-07-06  
**Status:** Draft baseline  
**Platform:** Responsive Web Back Office  
**Primary FO Source:** `../FrontOffice/12_BOARD_MODULE.md`  
**Integration Map:** `../ProjectAdmin/FO_BO_INTEGRATION_MAP.md`

## 1. วัตถุประสงค์

BO Content / Board Module คือเครื่องมือสำหรับ Admin ใช้สร้าง แก้ไข เผยแพร่ ตั้งเวลา และจัดการบทความที่แสดงใน FO Board

FO Board เป็น Article Area ไม่ใช่ user-generated forum ใน V1 ดังนั้นผู้ใช้ FO อ่าน ค้นหา กรองหมวด กด Like, Share และ Report article ได้ แต่สร้าง/แก้ไข/ลบบทความไม่ได้ งาน authoring ทั้งหมดต้องอยู่ใน BO เท่านั้น

## 2. Scope

### Phase 1 Board Content Decision - 2026-07-30

Board Main visual placements are article-driven in Phase 1. `Content Management > Banners`, manual `Featured Article`, and `Featured Order` are not required for the current Board flow and are treated as future scope unless Product explicitly re-opens campaign/promotion banners.

Current Phase 1 source of truth:

- BO manages Board content through `Content Management > Articles` and `Content Management > Categories`.
- FO Board Main renders `Main Hero`, `Trending Now`, and `Journal Board preview` from Published Articles.
- FO must not use a separate Banner entity for Board Main Hero, Trending Now, or Journal Board preview.
- Admin does not need to choose Hero/Featured manually in Phase 1; placement is calculated by deterministic query rules in section 11.
- Any older reference in this document to `Featured Article`, `Featured Order`, or `Board Banners` is superseded by this decision for Phase 1.

### In Scope

- Article list พร้อม search, filter, sort, pagination
- Create / edit article
- Rich text editor
- Draft / Scheduled / Published / Archived lifecycle
- Preview as FO
- Automated Board Main placement from Published Articles
- Category management
- Tags และ related articles
- Board banner management is future scope
- SEO fields
- Board analytics summary
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

## 3. Admin Access And Permissions

BO uses a single Admin account type only. Admin access is controlled by module access, action policy, sensitive-data policy, confirmation, reason, and audit requirements instead of separate BO admin account types.


| Access Area | Rule |
| --- | --- |
| Module access | Admin can use list/detail/search/filter when module access is granted. |
| Write action | Create, update, status change, remove, restore, publish, archive, retry, and similar actions require permission check, confirmation for high-risk actions, reason when FO/user impact exists, and audit log. |
| Sensitive data | Mask by default; reveal only with business reason, policy approval, and audit log. |
| Export | Requires permission check, scope control, expiry/background job where needed, and audit export event. |
| Direct URL/API | Enforce access at route, API, and service layers; never rely only on hidden UI. |
## 4. Responsive Layout

| Width | Requirement |
| --- | --- |
| Mobile-width browser | Article list เป็น stacked cards, editor แยก section ชัดเจน, publish controls อยู่ใน sticky action area |
| Tablet | List/detail หรือ editor form ใช้ two-column เฉพาะเมื่อพื้นที่พอ |
| Desktop | Full table, side filters, editor + metadata panel, preview panel ได้ |

Editor ต้องป้องกัน content overflow, image overflow และ toolbar ซ้อนกันบนหน้าจอเล็ก

## 5. Article List

Article list ต้องแสดง:

- Article ID
- Title
- Slug
- Category
- Author
- Status
- Publish date/time
- Updated date/time
- Featured flag
- Featured order
- Views
- Likes
- Report count

### Search And Filters

ต้องรองรับ:

- Search by title, slug, tag, author
- Status: Draft, Scheduled, Published, Archived
- Category
- Author
- Date range
- Featured only
- Reported only

Sort ขั้นต่ำ:

- Updated date
- Publish date
- Views
- Likes
- Featured order

## 6. Article Editor

### Required Fields

| Field | Rule |
| --- | --- |
| Title | Required |
| Slug | Required, unique, auto-generate จาก title ได้ และแก้มือได้ |
| Cover Image | Required ก่อน publish |
| Cover Image Alt Text | Required ก่อน publish |
| Category | Required |
| Author | Required |
| Body Content | Required ก่อน publish |
| Status | Required |

### Optional Fields

- Excerpt
- Tags
- Read time
- Quote highlight / pull quote
- Related articles
- SEO title
- SEO description
- Featured article
- Featured order

### Rich Text Editor

Editor ต้องรองรับ:

- Bold / Italic / Underline / Strikethrough
- Heading 1-3
- Bullet list / Numbered list
- Quote block
- Image insert + caption + alt text
- Hyperlink
- Video embed เช่น YouTube
- Divider

ต้อง sanitize HTML/content ก่อนบันทึกและก่อนแสดงใน FO

## 7. Article Status Lifecycle

| Status | BO Meaning | FO Result |
| --- | --- | --- |
| Draft | ยังไม่เผยแพร่ | ไม่แสดงใน FO |
| Scheduled | รอเวลาที่กำหนด | แสดงเมื่อ publish date/time <= current time |
| Published | เผยแพร่แล้ว | แสดงใน Board, category, search และ article detail |
| Archived | นำออกจาก public listing | หายจาก Board/Search/Category; direct link แสดง unavailable behavior ตาม FO |

เวลา publish/schedule ต้องใช้ `Asia/Bangkok`

## 8. Publish Rules

Publish Now ต้องผ่าน validation:

- Required fields ครบ
- Slug unique
- Cover image พร้อม alt text
- Category active
- Body content ไม่ว่าง
- No unsafe embed/link ตาม policy

Schedule Publish ต้องมี:

- Publish date/time ในอนาคต
- Timezone แสดงเป็น `Asia/Bangkok`
- Job หรือ scheduled state ที่ตรวจสอบได้
- Audit log ตอนตั้ง schedule และตอน publish สำเร็จ

Archive ต้องมี:

- Confirmation
- Reason เมื่อ archive จาก moderation/report
- Audit log
- FO cache invalidation หรือ sync event

## 9. Preview As FO

Preview as FO ต้อง:

- เปิดได้เฉพาะ Admin ที่มีสิทธิ์
- ใช้ rendering ใกล้ FO Article Detail มากที่สุด
- ไม่เพิ่ม view count
- ไม่ trigger article analytics ของผู้ใช้จริง
- แสดงสถานะ preview ชัดเจน
- รองรับ mobile preview width 375px และ desktop preview

## 10. Categories

Category baseline:

- Feature Article
- Trending Now
- Journal Board
- Watch Brands
- Watch 101
- Watch Apparel
- Watch Events
- Watch Market ถ้า BO legacy/source ยังใช้อยู่ ให้ถือเป็น category เพิ่มที่ต้อง confirm กับ Product ก่อนเปิดบน FO

Category fields:

- Name TH/EN ถ้ารองรับหลายภาษา
- Slug
- Description
- Active/Inactive
- Display order
- Parent/section mapping ถ้ามี

Inactive category:

- ไม่แสดงใน FO filter/section
- ไม่ควรเลือกใช้กับ article publish ใหม่
- Article เดิมต้องมี fallback rule เช่น archive, move category หรือยังแสดงภายใต้ existing category ตาม decision

## 11. Board Main Article Placement Rules

Phase 1 Board Main does not use a Banner entity and does not require Admin-selected Featured/Hero flags. All visible areas below are selected automatically from eligible Published Articles.

Hero selection is automatic in every Board article listing context:

- Board Main `Main Hero` always uses the latest eligible Published Article across all active Board categories.
- Each category page hero always uses the latest eligible Published Article within that selected active category.
- Admin does not manually select these hero articles in Phase 1.

### Eligible Article Pool

An article is eligible for Board Main placement only when all conditions are true:

- `status = Published`
- `publishDateTime <= now` using `Asia/Bangkok`
- `category.status = Active`
- required FO card fields are present: title, slug, cover image, cover image alt text, category, excerpt or generated excerpt, read time
- article is not archived, unpublished, deleted, or policy-hidden

Base ordering for every automatic fallback:

1. `publishDateTime` descending
2. `updatedAt` descending as tie-breaker
3. `articleId` descending as final tie-breaker

### Display Selection Order

| Display Area | Query Source | Selection Order | Deduplication Rule | Empty/Fallback Rule |
| --- | --- | --- | --- | --- |
| Main Hero | Eligible article pool | Pick the first article by base ordering. | Reserve selected `articleId`; do not show it again in Trending Now or Journal Board preview on Board Main. | If no eligible article exists, hide Main Hero and show Board empty state below header. |
| Trending Now | Eligible article pool excluding Main Hero | If analytics ranking exists, sort by trending score within a configurable recent window, then base ordering. If analytics is not available, use base ordering. | Exclude Main Hero and exclude duplicates within Trending Now. | If fewer items than layout needs, show available items only; do not backfill with Main Hero. If none, hide section. |
| Journal Board preview | Eligible article pool excluding Main Hero and Trending Now items already rendered on Board Main | Pick the first remaining article as the large Journal Board preview card, then continue with smaller list cards if the layout includes them. | Do not repeat articles already rendered in Main Hero or Trending Now on the same Board Main page. | If no remaining article exists, hide Journal Board preview on Board Main. |
| Journal Board View All page | Eligible article pool | Use base ordering across all published articles. | No cross-page dedupe. Articles used in Board Main Hero or Trending Now must still appear here. | If no eligible article exists, show Journal Board empty state. |
| Category page hero | Eligible article pool filtered by selected active category | Pick the first article in that category by base ordering. | Reserve selected article from that category page list if the page also shows a hero plus list in the same viewport. | If category has no eligible article, show category empty state. |
| Category article list | Eligible article pool filtered by selected active category | Use base ordering. | Default is exclude the category hero within the same page preview/list to avoid repetition. | Show available items; empty state when none. |

### Trending Score

Trending score is optional for Phase 1. If implemented, it must be deterministic and documented by backend, for example weighted views, likes, shares, and recency. Until that score is available, Trending Now uses the latest eligible articles after Main Hero.

### Future Banner Scope

Banner management is future scope only for non-article placements such as campaign, promotion, event, sponsor creative, external URL, or deep link that is not an Article Detail. It must not be used for Board Main Hero, Trending Now, or Journal Board preview in Phase 1.

## 11A. Superseded Legacy Featured And Banner Notes

The legacy Featured/Banner notes below are retained only for historical context and must not be implemented for Phase 1 Board Main placement.

## 11. Featured And Trending

### Featured Article

- Legacy only: Admin-set Featured is not required for Phase 1 Board Main.
- Legacy only: featured order is not required for Phase 1 Board Main.
- Legacy only: FO Board hero/featured area now uses the automatic article placement rules above.
- Legacy only: archived articles are excluded by the eligible article pool rules above.

### Trending Now

Trending Now อาจมาจาก:

- Manual curated list ใน BO
- Analytics/ranking ในอนาคต

Superseded Phase 1 recommendation: manual curated list is no longer required. Current Phase 1 uses the automatic article placement rules above; analytics ranking can replace the latest-article fallback when available.

## 12. Legacy Board Banners (Future Scope)

Banner fields:

- Banner title
- Image
- Alt text
- Placement: Board top, Board mid, Feed top, Feed mid ตาม scope ที่เปิด
- Target link: FO deep link หรือ external URL
- Start date/time
- End date/time
- Status: Draft, Active, Scheduled, Inactive, Expired
- Display order

Banner rules:

- Active banner แสดงเฉพาะช่วง start/end
- Expired banner หายจาก FO
- External URL ต้อง validate และเปิดตาม security policy
- Preview banner ก่อน activate
- ทุก activate/deactivate/update ต้อง audit-log

## 13. Reported Board Content

FO `Report article` ต้องส่ง report type `Board Content` target type `Article` เข้า BO moderation handoff

Rules:

- Article ไม่หายจาก FO ทันทีหลังถูก report
- Admin review report ได้ตาม permission
- Action ที่เป็นไปได้: resolve/no action, edit article, archive article, escalate to Admin
- ถ้า archive จาก report ต้องมี reason และ audit
- Report history ต้องผูกกับ article detail

## 14. FO Display Rules

| BO Action | FO Result |
| --- | --- |
| Publish article | Article แสดงใน Board, category, search และ detail |
| Schedule article | ยังไม่แสดงจนถึง publish date/time |
| Archive article | Article หายจาก Board/Search/Category และ direct link แสดง unavailable |
| Update published article | FO แสดง content ล่าสุดหลัง sync/cache invalidation |
| Set featured | Article แสดงใน featured/hero area ตาม order |
| Remove featured | Article ไม่อยู่ใน featured/hero area แต่ยังอยู่ใน listing ถ้า Published |
| Activate category | Category แสดงใน FO filter/section |
| Deactivate category | Category หายจาก FO filter/section ตาม fallback rule |
| Activate banner | Banner แสดงตาม placement และ date range |
| Expire/deactivate banner | Banner หายจาก FO |

## 15. Analytics

BO ควรแสดง summary:

- Article views
- Likes
- Shares ถ้าเก็บ event
- Report count
- Top articles
- Category performance
- Search keyword performance ถ้า available

BO analytics ต้องไม่รวม preview as FO เป็น user view count

## 16. Error, Empty, Loading States

ต้องรองรับ:

- Empty article list
- Empty category list
- Empty banner list
- No search result
- Save failed
- Publish validation failed
- Schedule failed
- Slug duplicate
- Preview failed
- Permission denied
- Concurrent edit warning

## 17. Audit Requirements

ต้อง audit อย่างน้อย:

- Article create/update/delete/archive/publish/schedule
- Featured toggle/order change
- Category create/update/activate/deactivate
- Banner create/update/activate/deactivate
- Preview ไม่จำเป็นต้อง audit เว้นแต่ policy ต้องการ
- Export analytics
- Report moderation result

Audit event ต้องมี admin ID, admin access, target type, target ID, before/after value, timestamp, reason เมื่อเกี่ยวข้อง และ IP/session context ถ้ามี

## 18. Acceptance Criteria

| ID | Criteria |
| --- | --- |
| AC-BO-CONTENT-001 | Admin สร้าง แก้ไข save draft publish schedule archive article ได้ตาม permission |
| AC-BO-CONTENT-002 | FO แสดงเฉพาะ Published article หรือ Scheduled article ที่ถึงเวลาแล้ว |
| AC-BO-CONTENT-003 | Archived article หายจาก Board/Search/Category และ direct link แสดง unavailable behavior |
| AC-BO-CONTENT-004 | Preview as FO ไม่เพิ่ม view count และเปิดได้เฉพาะ Admin |
| AC-BO-CONTENT-005 | Board Main Hero, Trending Now, and Journal Board preview are selected automatically from eligible Published Articles with deterministic ordering and no duplicate article within the same Board Main page |
| AC-BO-CONTENT-006 | Category active/inactive ส่งผลต่อ FO category filter/section |
| AC-BO-CONTENT-007 | Banner management is out of Phase 1 Board scope; Board Main visual placements must come from Article data |
| AC-BO-CONTENT-008 | Report article เข้า BO moderation handoff โดย article ยังไม่หายจาก FO ทันที |
| AC-BO-CONTENT-009 | Publish/archive/category actions ต้อง audit-log |
| AC-BO-CONTENT-010 | UI responsive ใช้งานได้ที่ mobile-width, tablet และ desktop |

## 19. Open Decisions

| ID | Decision Needed | Current Recommendation |
| --- | --- | --- |
| BO-CONTENT-DEC-001 | Board ต้องมี public SEO web page แยกจาก FO mobile หรือไม่ | Phase 1 ถือว่าเป็น FO Board ก่อน |
| BO-CONTENT-DEC-002 | Trending Now ใช้ manual curated หรือ algorithm | Phase 1 uses automatic latest-article fallback after Main Hero; analytics ranking can replace fallback when available |
| BO-CONTENT-DEC-003 | Published article update ต้อง require re-approval หรือไม่ | Admin update ได้ แต่ต้อง audit และ version history |
| BO-CONTENT-DEC-004 | Inactive category ส่งผลต่อ article เดิมอย่างไร | ต้องตัดสินก่อน implementation; default คือไม่ให้ publish ใหม่กับ inactive category |
