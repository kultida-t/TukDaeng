# 05 BO Content / Board Module

**Version:** `BO-05-v0.1`  
**Date:** 2026-07-06  
**Status:** Draft baseline  
**Platform:** Responsive Web Back Office  
**Primary FO Source:** `../FrontOffice/12_BOARD_MODULE.md`  
**Integration Map:** `../ProjectAdmin/FO_BO_INTEGRATION_MAP.md`

## 1. วัตถุประสงค์

BO Content / Board Module คือเครื่องมือสำหรับ Content Admin ใช้สร้าง แก้ไข เผยแพร่ ตั้งเวลา และจัดการบทความที่แสดงใน FO Board

FO Board เป็น Article Area ไม่ใช่ user-generated forum ใน V1 ดังนั้นผู้ใช้ FO อ่าน ค้นหา กรองหมวด กด Like, Share และ Report article ได้ แต่สร้าง/แก้ไข/ลบบทความไม่ได้ งาน authoring ทั้งหมดต้องอยู่ใน BO เท่านั้น

## 2. Scope

### In Scope

- Article list พร้อม search, filter, sort, pagination
- Create / edit article
- Rich text editor
- Draft / Scheduled / Published / Archived lifecycle
- Preview as FO
- Featured article และ featured order
- Category management
- Tags และ related articles
- Board banners
- SEO fields
- Board analytics summary
- Reported Board Content review handoff
- Audit log ทุก publish/archive/feature/banner/category action
- Responsive web layout สำหรับ desktop, tablet และ mobile-width browser

### Out Of Scope

- User-generated post หรือ discussion thread
- Article comment ใน FO V1
- FO article authoring tool
- AI content generation
- Public SEO web scope นอกเหนือจาก FO Board เว้นแต่มี decision เพิ่ม
- Broadcast notification เมื่อ publish article ยังเป็น future/needs decision

## 3. Roles And Permissions

| Role | Permission |
| --- | --- |
| Super Admin | Full access, publish/archive, manage categories/banners, override content status, export analytics |
| Content Admin | Create/edit/publish/schedule/archive articles, manage categories/banners, preview as FO |
| Moderator | Review reported Board Content, recommend archive/remove, view moderation context |
| Support Admin | View article/report context เฉพาะที่จำเป็นต่อ support |
| Market Admin | No default write access |

ทุก write action ต้อง enforce permission ทั้ง UI, route/API และ service layer

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

## 11. Featured And Trending

### Featured Article

- Content Admin ตั้ง Featured ได้
- ต้องมี featured order
- FO Board hero/featured area ใช้เฉพาะ Published article
- ถ้า Featured article ถูก archive ต้องหลุดจาก featured area

### Trending Now

Trending Now อาจมาจาก:

- Manual curated list ใน BO
- Analytics/ranking ในอนาคต

Phase 1 recommendation: ใช้ manual curated list เพื่อควบคุม content และลดความเสี่ยงของ algorithm ที่ยังไม่สรุป

## 12. Board Banners

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
- Moderator/Content Admin review report ได้ตาม permission
- Action ที่เป็นไปได้: resolve/no action, edit article, archive article, escalate to Super Admin
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

Audit event ต้องมี admin ID, role, target type, target ID, before/after value, timestamp, reason เมื่อเกี่ยวข้อง และ IP/session context ถ้ามี

## 18. Acceptance Criteria

| ID | Criteria |
| --- | --- |
| AC-BO-CONTENT-001 | Content Admin สร้าง แก้ไข save draft publish schedule archive article ได้ตาม permission |
| AC-BO-CONTENT-002 | FO แสดงเฉพาะ Published article หรือ Scheduled article ที่ถึงเวลาแล้ว |
| AC-BO-CONTENT-003 | Archived article หายจาก Board/Search/Category และ direct link แสดง unavailable behavior |
| AC-BO-CONTENT-004 | Preview as FO ไม่เพิ่ม view count และเปิดได้เฉพาะ Admin |
| AC-BO-CONTENT-005 | Featured article แสดงใน FO Board hero/featured area ตาม order |
| AC-BO-CONTENT-006 | Category active/inactive ส่งผลต่อ FO category filter/section |
| AC-BO-CONTENT-007 | Banner active/scheduled/expired ส่งผลต่อ FO placement ตาม date range |
| AC-BO-CONTENT-008 | Report article เข้า BO moderation handoff โดย article ยังไม่หายจาก FO ทันที |
| AC-BO-CONTENT-009 | Publish/archive/banner/category actions ต้อง audit-log |
| AC-BO-CONTENT-010 | UI responsive ใช้งานได้ที่ mobile-width, tablet และ desktop |

## 19. Open Decisions

| ID | Decision Needed | Current Recommendation |
| --- | --- | --- |
| BO-CONTENT-DEC-001 | Board ต้องมี public SEO web page แยกจาก FO mobile หรือไม่ | Phase 1 ถือว่าเป็น FO Board ก่อน |
| BO-CONTENT-DEC-002 | Trending Now ใช้ manual curated หรือ algorithm | ใช้ manual curated ใน Phase 1 |
| BO-CONTENT-DEC-003 | Published article update ต้อง require re-approval หรือไม่ | Content Admin update ได้ แต่ต้อง audit และ version history |
| BO-CONTENT-DEC-004 | Inactive category ส่งผลต่อ article เดิมอย่างไร | ต้องตัดสินก่อน implementation; default คือไม่ให้ publish ใหม่กับ inactive category |

