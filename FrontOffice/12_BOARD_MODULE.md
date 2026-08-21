# 12 Board Module

อ้างอิงหลักจาก [TukDaeng_Master_Product_Definition.md](TukDaeng_Master_Product_Definition.md)

---

# 1. Document Information

| Field | Detail |
| --- | --- |
| Module Name | Board |
| Version | 1.0 |
| Status | Functional PRD - Master Aligned |
| Owner | Tuk Daeng Project |
| Document Type | Front Office Functional PRD |
| Source of Truth | TukDaeng Master Product Definition |

---

# 2. Objective

Board Module เป็น Community Content / Article Area สำหรับให้ผู้ใช้ทั่วไปอ่านบทความเกี่ยวกับนาฬิกา ดูหมวดหมู่ ค้นหาบทความ และทำ Article Like / Article Share

Phase 1 บทความสร้างและจัดการโดย Admin ผ่าน Back Office เท่านั้น User ทั่วไปไม่สามารถสร้างหรือแก้ไขบทความได้

---

# 3. Prototype Reference

| Prototype | Usage |
| --- | --- |
| Board.png | Board landing, article sections, article list, article detail |

---

# 4. Master Alignment Summary

| Topic | Master Baseline | Board Module Rule |
| --- | --- | --- |
| Board Type | Community Content / Article Area | Board ไม่ใช่ user-generated discussion board ใน V1 |
| Content Sections | Feature Article, Trending Now, Journal Board, Watch Brands, Watch 101, Watch Apparel, Watch Events | Figma/PRD ต้องมี section หรือ category mapping ครบ |
| Article Detail | รองรับ Article Detail | User เปิดอ่านรายละเอียดบทความได้ |
| Article Actions | Article Like, Article Share | User ทั่วไปอ่าน, Like และ Share บทความได้ |
| Search / Filter | Search Article, Category Filter | Board ต้องรองรับ search และ category filter |
| Pagination | Infinite Scroll | Board list ต้องรองรับ infinite scroll |
| Content Management | บทความสร้างและจัดการโดย Admin ผ่าน Back Office | Front Office ไม่มี Create/Edit/Delete Article สำหรับ user |
| User Permission | User ทั่วไปไม่สามารถสร้างหรือแก้ไขบทความได้ใน Phase 1 | ห้ามมี Create Post / Edit Post flow ใน FO |

---

# 5. Figma Gap Checklist For Board Module

| Priority | Figma Gap | Master Baseline | Action |
| --- | --- | --- | --- |
| Must Fix | Board อาจถูกออกแบบเป็น user-generated post/community discussion | Board เป็น Community Content / Article Area | ปรับ wording และ flow ให้เป็น Article Board ไม่ใช่ forum/post board |
| Must Fix | Figma/PRD อาจมี Create Post / Edit Post / Delete Post สำหรับ user | บทความสร้างและจัดการโดย Admin ผ่าน Back Office เท่านั้น | ตัด FO create/edit/delete article flow ออกจาก V1 |
| High | ต้องยืนยัน section/category ครบตาม master | รองรับ Feature Article, Trending Now, Journal Board, Watch Brands, Watch 101, Watch Apparel, Watch Events | map section/category ใน Figma ให้ครบ |
| High | Search Article และ Category Filter ต้องชัด | Master รองรับ Search Article และ Category Filter | เพิ่ม search state, category filter state และ no-result state |
| High | Article Detail ต้องรองรับ Like / Share | User ทั่วไปอ่าน, Like และ Share บทความได้ใน Phase 1 | เพิ่ม Like/Share action บน Article Detail |
| Medium | Infinite Scroll state ยังต้องตรวจ | Board รองรับ Infinite Scroll | เพิ่ม load more/loading/end state สำหรับ article list |
| Medium | Guest behavior ของ Article Like ยังต้องตัดสินตาม login baseline | Master ระบุ user ทั่วไป Like/Share ได้ แต่ global login rule ระบุ Like ต้อง login | ใช้ Member สำหรับ Article Like จนกว่า master แยก Article Like สำหรับ Guest |
| Medium | Menu label `Community` อาจไม่ตรงกับ master module name | Master module คือ Board | normalize label หรือ map `Community` เป็น Board ให้ชัด |
| Medium | Article Share สำหรับ Guest ต้องชัด | Master lock ให้ Article Share เป็น public share action | เพิ่ม Guest share state โดยไม่ต้อง Login |
| High | Article Comment / Report Article ต้องไม่ขยายเป็น Board V1 interaction | Master ระบุ Article Like / Share และอนุญาต `Report article` ที่ map เข้า Trust & Safety `Report Board Content` | ซ่อน Article Comment และใช้ `Report article` เฉพาะเมื่อผูกกับ Trust & Safety moderation handoff |

---

# 6. Scope

## In Scope

- Board landing / article area
- Feature Article
- Trending Now
- Journal Board
- Watch Brands
- Watch 101
- Watch Apparel
- Watch Events
- Article list
- Article detail
- Article Like
- Article Share
- Search Article
- Category Filter
- Infinite Scroll
- Empty state / no result state

## Out of Scope For V1

- User Create Post
- User Edit Post
- User Delete Post
- User-generated discussion thread
- Article Comment
- Report Article as article-specific interaction
- Poll Post
- Rich text editor in Front Office
- Back Office article authoring UI detail

## Report Board Content Boundary

- Article Comment ไม่อยู่ใน FO V1 baseline
- Article-specific moderation tooling is not in Board V1 baseline; use UI label `Report article` mapped to Trust & Safety `Report Board Content`
- หากต้องรองรับ compliance ให้ใช้ Trust & Safety `Report Board Content` เป็น generic report action บน Article Detail
- Report Board Content ต้องส่งเข้า moderation handoff และไม่ทำให้ article หายทันที
- Front Office user ยังสร้าง แก้ไข ลบ หรือ comment article ไม่ได้

---

# 7. Screen Mapping

| Screen / Component | Description |
| --- | --- |
| Board Landing | รวม section หลักของ Board |
| Feature Article | highlight article สำคัญ |
| Trending Now | รายการบทความที่กำลังเป็นที่สนใจ |
| Journal Board | หมวดบทความ journal |
| Watch Brands | หมวดบทความแบรนด์นาฬิกา |
| Watch 101 | หมวดบทความความรู้พื้นฐาน |
| Watch Apparel | หมวดบทความ apparel/accessory |
| Watch Events | หมวดบทความ event |
| Article List | รายการบทความตาม section/category/search |
| Article Detail | รายละเอียดบทความ พร้อม Like / Share |
| Search Article | ค้นหาบทความ |
| Category Filter | filter บทความตาม category |

---

# 8. User States

## Guest

- อ่าน Board และ Article Detail ได้
- ใช้ Search Article และ Category Filter ได้
- Share Article ได้โดยไม่ต้อง Login เพราะเป็น public share action
- Guest share ต้องไม่เปิดสิทธิ์ Article Like หรือ Report Article
- เปิด shared Article deep link ได้โดยไม่ต้อง Login แต่กด Article Like หรือ Report Article ต้องเจอ Global Login Required Dialog
- Article Like ควรใช้ login-required baseline จนกว่า master จะแยกกติกา Article Like สำหรับ Guest

## Member

- อ่าน Board และ Article Detail ได้
- Like / Unlike Article ได้
- Share Article ได้โดยใช้ system share sheet เป็น primary channel และ copy public Article deep link เป็น fallback
- ใช้ Search Article และ Category Filter ได้

## Admin

- สร้างและจัดการบทความผ่าน Back Office เท่านั้น
- ไม่ใช้ Front Office Board Module เพื่อ create/edit article

---

# 9. User Flow

## Browse Board Flow

```text
Open Board
-> View Board Landing
-> Select section/category
-> View Article List
-> Open Article Detail
```

## Search Article Flow

```text
Board
-> Search Article
-> Enter keyword
-> View Article Result List
-> Open Article Detail
```

## Category Filter Flow

```text
Board
-> Select Category Filter
-> View filtered Article List
-> Open Article Detail
```

## Article Like Flow

```text
Article Detail
-> Like
-> Update Article Like Count
```

## Article Share Flow

```text
Article Detail
-> Share
-> Open system share sheet (primary) or copy public Article deep link (fallback)
-> Show copy success state if fallback used
```

## Infinite Scroll Flow

```text
Article List
-> Scroll to end
-> Load next page
-> Append articles
```

---

# 10. Business Rules

## Board Content Model

- Board เป็น Community Content / Article Area
- Board ไม่ใช่ forum หรือ user-generated post board ใน V1
- Content หลักคือ Article
- Article สร้างและจัดการโดย Admin ผ่าน Back Office

## Supported Sections

Board ต้องรองรับ section/category ต่อไปนี้:

- Feature Article
- Trending Now
- Journal Board
- Watch Brands
- Watch 101
- Watch Apparel
- Watch Events

## Article Detail Rule

- User เปิด Article Detail เพื่ออ่านเนื้อหาได้
- Article Detail ต้องรองรับ Article Like
- Article Detail ต้องรองรับ Article Share
- Article Detail ไม่รองรับ user comment ใน master baseline

## Front Office Permission Rule

- User ทั่วไปไม่สามารถสร้างบทความได้
- User ทั่วไปไม่สามารถแก้ไขบทความได้
- User ทั่วไปไม่สามารถลบบทความได้
- Create/Edit/Delete Article เป็น Back Office/Admin scope

## Search Article Rule

- Board ต้องรองรับ keyword search สำหรับ article
- Search result ต้องแสดง article ที่ตรง keyword
- ถ้าไม่มีผลลัพธ์ให้ใช้ empty state กลาง

## Category Filter Rule

- Board ต้องรองรับ category filter
- Category ต้อง map กับ section/category ตาม master
- Category filter และ keyword search สามารถทำงานร่วมกันได้หาก implementation รองรับ

## Infinite Scroll Rule

- Article list ต้องรองรับ Infinite Scroll
- ระหว่างโหลดหน้าถัดไปต้องมี loading state
- เมื่อไม่มีข้อมูลเพิ่มเติมควรแสดง end state ตาม pattern ของ list ในระบบ

## Article Like Rule

- Article Like ใช้กับ Article Detail
- Like สำเร็จต้อง update Article Like Count
- Unlike Article รองรับหากมี liked state แล้ว
- Guest Article Like เป็นจุดที่ต้องตัดสินใจ เพราะ global login rule ระบุ Like ต้อง login

## Article Share Rule

- Article Share entry point: Article Detail เท่านั้น (อ้างอิง [11_SOCIAL_MODULE.md](11_SOCIAL_MODULE.md) Share Rules และ [00_NAVIGATION_AND_CROSS_MODULE_FLOW.md](00_NAVIGATION_AND_CROSS_MODULE_FLOW.md) Deep Link Rules)
- Share เป็น public share action สำหรับ published Article
- Share ไม่รองรับ Article ที่ถูก unpublish หรือ deleted เพราะไม่ใช่ public content
- Guest สามารถ Share Article ได้โดยไม่ต้อง Login เพราะเป็น public share action
- Guest share ต้องไม่เปิดสิทธิ์ Article Like, Report Article หรือ action อื่นที่ต้อง Login
- Primary share channel คือ system share sheet เมื่อ platform รองรับ
- Fallback share channel คือ copy public Article deep link และต้องแสดง copy success state เช่น `Article link copied`
- Article Share ไม่สร้าง Notification Center item และไม่เปลี่ยน permission ของบทความ
- Public Article deep link ที่แชร์ต้อง validate publish state, deletion state และ availability ก่อน render (ดู Article Deep Link Display State Rule ด้านล่าง)

## Article Deep Link Display State Rule

เมื่อเปิด shared public Article deep link ระบบต้อง validate ก่อน render และแสดง state ตามตารางนี้ (อ้างอิง [00_NAVIGATION_AND_CROSS_MODULE_FLOW.md](00_NAVIGATION_AND_CROSS_MODULE_FLOW.md) Deep Link Rules และ Unavailable Fallback Rules):

| Case | Guest | Login User | Admin (self-published) |
| --- | --- | --- | --- |
| Published Article | แสดง Article Detail (Guest Mode) | แสดง Article Detail | แสดง Article Detail |
| Unpublished Article (stale link) | Article Unavailable State | Article Unavailable State | แสดง Article Detail พร้อม admin preview note |
| Deleted Article | Article Unavailable State `บทความนี้ไม่พร้อมใช้งานแล้ว` | Article Unavailable State `บทความนี้ไม่พร้อมใช้งานแล้ว` | Article Unavailable State `บทความนี้ไม่พร้อมใช้งานแล้ว` |
| Article ที่ไม่มีอยู่ (invalid ID) | Article Not Found State | Article Not Found State | Article Not Found State |

Rules:

- ทุก Article deep link ต้อง validate publish state, deletion state และ availability ก่อน render
- Deep link ไปยัง unavailable Article ต้องไม่ crash และต้องไม่แสดงเนื้อหาที่ค้างอยู่
- สำหรับ unpublished stale link ของ non-admin ให้แสดง Article Unavailable State ไม่ใช่เปิดเนื้อหา
- Guest เปิด published Article deep link ได้โดยไม่ต้อง Login แต่เมื่อ Guest กด action ที่ต้อง Login (เช่น Article Like, Report Article) ต้องแสดง Global Login Required Dialog เช่นเดียวกับการเข้าผ่าน Article Detail ปกติ
- Login user ที่เปิด deep link แล้ว Article เปลี่ยน publish state ระหว่าง session ต้องอัปเดต visibility ตาม matrix เมื่อ sync/refresh

## Article Back Button And Navigation After Deep Link Rule

เมื่อ Article Detail เปิดจาก external deep link (ไม่มี in-app navigation history) ต้องจัดการ back button และ main navigation ดังนี้ (อ้างอิง [00_NAVIGATION_AND_CROSS_MODULE_FLOW.md](00_NAVIGATION_AND_CROSS_MODULE_FLOW.md) Back Button And Main Navigation After Deep Link):

### Back Button บน Normal Article Detail

- ถ้ามี in-app navigation history (เช่น เปิดจาก Board, Search Article, Category Filter) ให้ back button กลับไปหน้าก่อนหน้าตามปกติ
- ถ้าไม่มี navigation history (เปิดจาก external deep link โดยตรง) ให้ back button fallback ไป Feed
- ห้ามปิด app หรือแสดงหน้าจอว่างเปล่าเมื่อกด back button จาก Article Detail ที่เปิดจาก external deep link

### Back Button บน Error / Unavailable State

- ใช้ rule เดียวกับ Exception Handling > Article Not Found / Deleted: primary CTA `Go back`
- ถ้ามี navigation history ให้กลับหน้าก่อนหน้า
- ถ้าไม่มี navigation history (external deep link) ให้ fallback ไป Feed

### Main Navigation หลังเปิด Article Deep Link

- หลังเปิด Article deep link ทั้ง Guest และ Login user ต้องใช้งาน main navigation (bottom tab / menu) ต่อได้ เพื่อเข้าถึง Feed, Search, Profile, Notification, Board และ surface อื่น ๆ ตามสิทธิ์
- ห้ามล็อก user อยู่ใน Article Detail อย่างเดียวหลังเปิด deep link โดยไม่มีทางออกนอกจาก back button
- Guest ที่เปิด Article deep link แล้วใช้ main navigation ต้องเจอ Global Login Required Dialog เมื่อกด login-required surface เช่นเดียวกับการเข้าผ่าน entry point ปกติ

## Report Article Rule

Report article is allowed as the Front Office entry label for Trust & Safety `Report Board Content`.

Article Detail overflow menu:

- `Report article`

Report article reason sheet:

- Title: `Report article`
- Prompt: `Why are you reporting this article?`
- Reasons:
  - `Spam or misleading`
  - `Harassment or hate`
  - `Scam or fraud`
  - `Illegal or restricted item`
  - `Inappropriate content`
  - `Other`
- Optional field label: `Additional details (optional)`
- Primary action: `Submit report`

Report article behavior:

- `Submit report` must be disabled until a reason is selected.
- Report submit sends Trust & Safety report type `Board Content` with target type `Article`.
- On success, close the reason sheet and show success modal or system-consistent confirmation.
- Success title: `Report submitted`
- Success body: `Our team will review it. This article will remain visible until moderation is complete.`
- Success action: `Done`
- Article must remain visible after report submit until Admin moderation is complete.
- Do not show `Hide article` or `Hide this asset from feed?` in the article report success state.
- Duplicate report state: `You already reported this article.`
- API error state: `Unable to submit report. Please try again.`
- Guest report entry must show Global Login Required Dialog.

## Sorting / Ranking Rule

- Trending Now ใช้ ranking logic ตาม content/admin configuration หรือ analytics implementation
- หากยังไม่สรุป algorithm ให้ Figma แสดงเป็น content section โดยไม่ระบุ ranking formula เป็น source of truth

## Menu Label Rule

- Master module name คือ Board
- หาก Figma ใช้ label `Community` ต้อง map ให้ชัดว่าเป็น Board Article Area ไม่ใช่ discussion community

---

# 11. Permission Rules

| Actor | Permission |
| --- | --- |
| Guest | Read Board / Article Detail, Search, Category Filter, Article Share |
| Member | Read, Search, Category Filter, Article Like, Article Share |
| Admin | Create/Edit/Delete Article ผ่าน Back Office |
| Front Office User | ห้าม Create/Edit/Delete Article |

---

# 12. Validation Rules

Board Front Office ไม่มี create/edit form สำหรับ user ใน V1

| Field / Condition | Rule |
| --- | --- |
| Search Keyword | Optional |
| Category Filter | Optional |
| Article Like | 1 User = 1 Like ต่อ Article |
| Article Share | Primary = system share sheet; Fallback = copy public Article deep link; ต้องแสดง copy success state; ต้องไม่สร้าง notification |
| Article Deep Link | ต้อง validate publish state, deletion state และ availability ก่อน render; unpublished/deleted/invalid ต้องแสดง Article Unavailable / Not Found state |

---

# 13. Exception Handling

## Article Not Found / Deleted

- TH: `บทความนี้ไม่พร้อมใช้งานแล้ว`
- EN: `This article is no longer available.`

## Search Failed

- TH: `ไม่สามารถค้นหาได้`
- EN: `Unable to search.`

## Load Failed

- TH: `ไม่สามารถโหลดข้อมูลได้`
- EN: `Unable to load data.`
- Action: แสดงปุ่ม `ลองใหม่`

## Permission Denied

- TH: `คุณไม่มีสิทธิ์ดำเนินการ`
- EN: `Permission denied.`

---

# 14. Empty State

ใช้ข้อความกลางตาม master:

| State | TH | EN |
| --- | --- | --- |
| No Articles | `ไม่พบข้อมูล` | `No data found` |
| No Search Results | `ไม่พบข้อมูล` | `No data found` |

---

# 15. Notification Rules

Master ยังไม่ได้ระบุ Board notification type ใน Notification baseline

- Article Like notification ไม่เป็น baseline notification type ใน V1 เว้นแต่ master เพิ่ม scope
- Article Share ไม่ต้องสร้าง notification
- Admin publishing notification เป็น future / Needs Decision

---

# 16. Analytics Events

- `board_opened`
- `board_section_opened`
- `article_list_viewed`
- `article_detail_opened`
- `article_search_submitted`
- `article_category_selected`
- `article_liked`
- `article_unliked`
- `article_share_started`
- `article_shared`
- `article_report_started`
- `article_report_submitted`
- `article_report_failed`
- `article_list_load_more`

---

# 17. Acceptance Criteria

## AC-BOARD-001: Board Is Article Area

Given user เปิด Board  
When Board แสดงเนื้อหา  
Then Board ต้องแสดงเป็น Community Content / Article Area  
And ต้องไม่แสดง create post flow สำหรับ user

## AC-BOARD-002: Supported Sections

Given user เปิด Board  
When Board landing แสดง section  
Then ต้องรองรับ Feature Article, Trending Now, Journal Board, Watch Brands, Watch 101, Watch Apparel และ Watch Events

## AC-BOARD-003: Open Article Detail

Given user เห็น article ใน Board  
When user กด article  
Then ระบบต้องเปิด Article Detail

## AC-BOARD-004: User Cannot Create Article

Given user อยู่ใน Front Office Board  
When user ใช้งาน Board  
Then ระบบต้องไม่แสดง Create Article / Create Post action ใน V1

## AC-BOARD-005: User Cannot Edit Article

Given user เปิด Article Detail  
When user ไม่ใช่ Admin Back Office  
Then ระบบต้องไม่แสดง Edit Article action

## AC-BOARD-006: Search Article

Given user อยู่ใน Board  
When user search article ด้วย keyword  
Then ระบบต้องแสดง article result ที่ตรง keyword  
And หากไม่มีผลลัพธ์ต้องแสดง `ไม่พบข้อมูล` / `No data found`

## AC-BOARD-007: Category Filter

Given user อยู่ใน Board  
When user เลือก category  
Then ระบบต้องแสดง article list ตาม category นั้น

## AC-BOARD-008: Infinite Scroll

Given user อยู่ใน Article List  
When user scroll ถึงท้าย list และยังมีข้อมูลต่อ  
Then ระบบต้องโหลด article ชุดถัดไปและ append เข้า list

## AC-BOARD-009: Article Like

Given Member เปิด Article Detail  
When Member กด Like  
Then ระบบต้อง Like Article สำเร็จ  
And Article Like Count ต้อง update

## AC-BOARD-010: Article Share

Given user เปิด Article Detail
When user กด Share
Then ระบบต้องเปิด system share sheet เป็น primary channel หรือ copy public Article deep link เป็น fallback พร้อม copy success state

## AC-BOARD-010A: Guest Article Share Without Login

Given Guest เปิด Article Detail
When Guest กด Share
Then ระบบต้องเริ่ม share behavior โดยไม่บังคับ Login
And ต้องไม่เปิดสิทธิ์ Article Like หรือ Report Article

## AC-BOARD-010B: Article Share No Notification

Given user กด Share Article
When share สำเร็จ
Then ระบบต้องไม่สร้าง Notification Center item

## AC-BOARD-010C: Article Deep Link Validation

Given user เปิด shared Article deep link
When linked Article เป็น published
Then ระบบต้องแสดง Article Detail

Given user เปิด shared Article deep link
When linked Article ถูก unpublish หรือ deleted หรือไม่มีอยู่
Then ระบบต้องแสดง Article Unavailable / Not Found state ไม่ใช่เปิดเนื้อหา

## AC-BOARD-010D: Article Deep Link Display State By User

Given Guest เปิด shared published Article deep link
Then ระบบต้องแสดง Article Detail โดยไม่ต้อง Login
And เมื่อ Guest กด Article Like หรือ Report Article ต้องเจอ Global Login Required Dialog

Given Login user เปิด shared published Article deep link
Then ระบบต้องแสดง Article Detail ตามสิทธิ์

## AC-BOARD-010E: Article Back Button From External Deep Link

Given user เปิด Article Detail จาก external deep link โดยไม่มี navigation history
When user กด back button
Then ระบบต้อง fallback ไป Feed ไม่ใช่ปิด app หรือแสดงหน้าว่าง

Given user เปิด Article Detail จาก Board, Search Article หรือ Category Filter (มี navigation history)
When user กด back button
Then ระบบต้องกลับไปหน้าก่อนหน้าตามปกติ

## AC-BOARD-010F: Main Navigation Available After Article Deep Link

Given Guest เปิด Article Detail จาก external deep link
When Guest ใช้ main navigation ไปยัง Feed, Search, Board หรือ Public Profile
Then ระบบต้องอนุญาตให้เข้าถึง surface เหล่านั้นได้
And เมื่อ Guest กด login-required surface ต้องเจอ Global Login Required Dialog

Given Login user เปิด Article Detail จาก external deep link
When Login user ใช้ main navigation ไปยัง surface อื่น
Then ระบบต้องอนุญาตให้เข้าถึงได้ตามสิทธิ์

## AC-BOARD-011: No Article Comment Baseline

Given user เปิด Article Detail  
When Article Detail แสดง action  
Then ระบบต้องไม่แสดง Article Comment เป็น V1 baseline เว้นแต่ master เพิ่ม scope

## AC-BOARD-011A: Report Board Content Boundary

Given user เปิด Article Detail  
When user เห็น report action  
Then action label must be `Report article` and submit to Trust & Safety moderation handoff without opening Article Comment or Front Office moderation tooling

## AC-BOARD-011B: Report Article Locked Flow

Given Member opens Article Detail
When Member taps `Report article`
Then the sheet must show title `Report article`
And prompt `Why are you reporting this article?`
And reasons `Spam or misleading`, `Harassment or hate`, `Scam or fraud`, `Illegal or restricted item`, `Inappropriate content`, and `Other`
And optional field label must be `Additional details (optional)`
And `Submit report` must be disabled until a reason is selected
And report must submit Trust & Safety report type `Board Content` with target type `Article`

## AC-BOARD-011C: Report Article Submitted

Given Member selected a report reason
When Member taps `Submit report` and API succeeds
Then the article must remain visible
And success must show title `Report submitted`
And body `Our team will review it. This article will remain visible until moderation is complete.`
And action `Done`
And the success state must not show `Hide article` or `Hide this asset from feed?`

## AC-BOARD-011D: Report Article Error States

Given Member submits report article
When the user already reported this article
Then show `You already reported this article.`
When API fails
Then show `Unable to submit report. Please try again.`
Given Guest opens Article Detail
When Guest taps `Report article`
Then show Global Login Required Dialog

## AC-BOARD-012: Article Not Found

Given article ถูกลบหรือไม่พร้อมใช้งาน  
When user เปิด Article Detail  
Then ระบบต้องแสดง `บทความนี้ไม่พร้อมใช้งานแล้ว`

---

# 18. Related Modules

- Notification Module
- Social Module
- Trust & Safety Module
- Back Office / Admin Content Management

---

# 19. Future Enhancement

- Article Comment
- Article-specific moderation tooling beyond Trust & Safety `Report Board Content`
- Admin publish notification
- Personalized article recommendation
- Saved Article
- Rich media / video article
- Poll article
- Trending algorithm definition
