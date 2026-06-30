# 05 Asset Detail Module

อ้างอิงหลักจาก [TukDaeng_Master_Product_Definition.md](TukDaeng_Master_Product_Definition.md)

---

# 1. Document Information

| Item | Detail |
|---|---|
| Module Name | Asset Detail |
| Platform | Mobile Application |
| Version | V1 |
| Owner | Product / UX / Engineering |
| Status | Draft |
| Document Type | Functional PRD |

---

# 2. Objective

Asset Detail Module ใช้สำหรับแสดงรายละเอียดของ Asset นาฬิกา ทั้งในมุม Viewer, Guest, Member และ Owner โดยเป็นจุดรวมของการดูข้อมูล Asset, Gallery, Owner Information, Like, Comment, Make Offer, Chat, Share, Report และการเข้าถึง Owner actions ตามสิทธิ์

โมดูลนี้ต้องคุม visibility ของ Asset แต่ละสถานะให้ตรง master และต้องไม่เปิดเผยข้อมูล private เช่น Provenance, Consignment, Purchase Data, Sold History หรือ Portfolio Value Detail ให้ Viewer ที่ไม่มีสิทธิ์เห็น

---

# 3. Prototype Reference

- `Detail asset viewer.png`
- `Detail asset owner.png`

---

# 4. Master Alignment Summary

Asset Detail Module ต้องยึด master baseline ต่อไปนี้เป็นหลัก:

- Viewer เห็น Asset Detail เฉพาะ Asset ที่เป็น Public: `Sale`, `Show`
- Owner เห็น Asset Detail ของตัวเองได้ทุกสถานะ: `Sale`, `Show`, `Hide`, `Sold`
- `Hide` และ `Sold` ต้องไม่ Public
- Deleted Asset ต้องแสดง `รายการนี้ไม่พร้อมใช้งานแล้ว`
- Asset Detail ต้องรองรับ Gallery รูปภาพ, Swipe รูป และ Full Screen Image Viewer
- Asset Detail ต้องแสดง Brand, Model, Reference No., Description, Price, Owner Information, Technical Specifications และ Comments Section
- Owner ต้องไม่เห็นปุ่ม Follow ตัวเอง
- Comment รองรับ IG-style one-level replies ใต้ comment หลัก
- ไม่รองรับ multi-level nested thread หรือ reply ซ้อนเกิน 1 ชั้น
- ไม่มี Edit Comment ใน V1
- รองรับ Delete Comment
- Make Offer ทำผ่าน Asset Detail เท่านั้น
- Accepted Offer เปิด Chat Room
- Rejected Offer เปิด Asset Detail
- Asset Deleted ทำให้ Offer เป็น Cancelled
- Asset Sold ต้อง Auto Reject Offer อื่น
- Provenance, Purchase Price, Purchase Date, Purchase From, Proof of Payment, Consignment Owner Contact, Consignment Terms, Sold History และ Portfolio Value Detail เป็น private data

---

# 5. Figma Gap Checklist For Asset Detail Module

รายการนี้ใช้เป็น checklist สำหรับปรับ Figma เฉพาะ Asset Detail Module ให้ตรงกับ master ก่อนส่งต่อ Dev/QA

| Priority | Gap | Master Baseline | Figma Action |
|---|---|---|---|
| Must Fix | Comment UI ต้องรองรับการตอบโต้แบบ IG โดยไม่กลายเป็น forum thread | Comment รองรับ one-level replies ใต้ comment หลักเท่านั้น และไม่รองรับ reply ซ้อนหลายระดับ | ปรับ comment UI ให้แสดง reply ได้ 1 ชั้นใต้ comment หลัก และป้องกัน reply ต่อจาก reply |
| High | ยังไม่เห็น Deleted Asset state ชัดเจน | Asset Detail ของ Asset ที่ถูกลบต้องแสดง `รายการนี้ไม่พร้อมใช้งานแล้ว` | เพิ่ม deleted/unavailable asset state |
| High | Detail อาจแสดงข้อมูล private ให้ Viewer | Provenance, Consignment, purchase data, Sold History และ Portfolio Value Detail เป็น private | แยก Owner-only private sections และห้ามแสดงใน Viewer/Public mode |
| High | ยังไม่เห็น state ของ Hide / Sold ที่เป็น Owner-only ชัดเจน | Viewer เห็นเฉพาะ Sale/Show; Owner เห็น Sale/Show/Hide/Sold | เพิ่ม Owner-only detail states สำหรับ Hide และ Sold |
| High | Sold Asset ยังไม่ชัดว่า read-only / owner-only | Sold Asset เห็นเฉพาะ Owner และแก้ข้อมูลหลักไม่ได้ | เพิ่ม Sold Mode ที่ lock edit main info และแสดง Sold History |
| Medium | Detail ยังมี field `Location` | Master Asset Detail ไม่ได้กำหนด Location เป็น required display field และ Feed/Search ไม่แสดง Location | ตัด Location ออกจาก V1 detail หรือย้ายเป็น future/optional หลัง master decision |
| Medium | Image/gallery ยังอาจสื่อว่าสูงสุด 3 รูป | Asset Management รองรับ Gallery สูงสุด 10 รูป และ Detail ต้องรองรับ Gallery / Swipe / Full Screen | ปรับ gallery indicator/viewer ให้รองรับได้ถึง 10 รูป |
| Medium | Guest restriction state ยังไม่ครบ | Guest ดูได้ แต่ Like, Follow, Comment, Chat, Offer ต้อง Login | เพิ่ม Global Login Required Dialog สำหรับ guest action |
| Medium | Detail ของ Asset สถานะ Show ต้องรองรับ `Make an Offer` / `Contact seller` | Master อนุญาตให้ `Show` เสนอราคา/ติดต่อได้จาก Detail แต่ยังไม่ขึ้น Feed, Search หรือ Watch Alert | คง Make Offer / Contact Seller บน `Show` และ annotate ว่า entry มาจาก Detail/Public Profile เท่านั้น |
| High | Market Comparison / Expected Profit ยังไม่ชัด | Market Comparison ใช้ Asking Price เทียบ Watch Price API Market Price, Expected Profit เป็น Owner-only เพราะใช้ Purchase Price | เพิ่ม Above/At/Below state และ Owner-only Expected Profit |

---

# 6. Scope

Asset Detail Module ใน V1 ครอบคลุม:

- Viewer Asset Detail
- Owner Asset Detail
- Sold Asset Detail สำหรับ Owner
- Deleted Asset State
- Gallery / Image Swipe
- Full Screen Image Viewer
- Asset Information Display
- Owner Information
- Follow / Unfollow จาก Asset Detail
- Like / Unlike
- Comment
- Delete Comment
- Report Comment
- Make Offer
- Open Chat
- Share Asset Deep Link
- Report Asset
- Block User

ไม่รวมใน V1:

- Multi-level Nested Comment เกิน 1 reply level
- Edit Comment
- Asset View Count
- Asset Share Count
- Related Watches
- Similar Listings
- Video Gallery

---

# 7. Screen Mapping

หน้าจอที่เกี่ยวข้องในโมดูลนี้:

1. Asset Detail - Viewer Mode
2. Asset Detail - Guest Mode
3. Asset Detail - Owner Mode
4. Asset Detail - Sold Mode
5. Deleted Asset State
6. Full Screen Image Viewer
7. Comment Section
8. Report Asset
9. Report Comment
10. Block User
11. Global Login Required Dialog
12. Permission Denied State

---

# 8. User States

## Guest

สามารถ:

- View public Asset Detail สำหรับ `Sale` และ `Show`
- View Gallery
- Open Full Screen Image Viewer
- View Like Count
- View Comment Count
- View Comments
- View Owner Information
- Open Public Profile
- Share Asset Deep Link

ไม่สามารถ:

- Like
- Follow
- Comment
- Chat
- Make Offer
- Report
- Block User

เมื่อ Guest ใช้ feature ที่ต้อง Login ต้องแสดง Global Login Required Dialog

## Member / Viewer

สามารถ:

- View public Asset Detail สำหรับ `Sale` และ `Show`
- Like / Unlike
- Follow / Unfollow Owner
- Comment
- Delete Comment ของตัวเอง
- Make Offer ตาม rule ของ Offer Module
- Open Chat
- Share
- Report Asset
- Block User

ไม่สามารถ:

- View `Hide` Asset ของผู้อื่น
- View `Sold` Asset ของผู้อื่น
- View private asset data ของผู้อื่น
- Edit / Delete / Change Status Asset ของผู้อื่น

## Owner

สามารถ:

- View Asset Detail ของตัวเองทุกสถานะ: `Sale`, `Show`, `Hide`, `Sold`
- View private asset data ของตัวเอง
- Open Edit Asset ตาม rule ของ Asset Management Module
- Delete / Change Status ตาม rule ของ Asset Management Module
- View Sold History สำหรับ Sold Asset
- Like Asset ตัวเอง

Owner ต้องไม่เห็นปุ่ม Follow ตัวเอง

---

# 9. User Flow

## View Asset Detail

```text
Feed / Search / Public Profile / Notification
→ Asset Detail
→ View Asset Information
```

## Open Full Screen Image

```text
Asset Detail
→ Tap Image
→ Full Screen Image Viewer
→ Swipe Images
```

## Like Asset

```text
Asset Detail
→ Like
→ Update Like Count
→ Add To Favorites
```

## Unlike Asset

```text
Asset Detail
→ Unlike
→ Update Like Count
→ Remove From Favorites
```

## Comment Asset

```text
Asset Detail
→ Comment Section
→ Enter Comment
→ Submit
→ Comment Added
```

## Delete Comment

```text
Asset Detail
→ Own Comment
→ Delete
→ Confirm
→ Comment Deleted
```

## Report Comment

```text
Asset Detail
→ Comment more menu
→ Report Comment
→ Select reason
→ Submit
→ Report submitted successfully
```

## Comment Action Behavior

- Comment action ใช้ปุ่ม `...` แนวนอนข้างเวลาของแต่ละ comment / reply
- Comment ของตัวเองต้องแสดง action `Delete comment`
- Comment ของคนอื่นต้องแสดง action `Report comment`
- ไม่ใช้ `Hide comment` ใน V1

Delete Comment:

- User ลบได้เฉพาะ comment หรือ reply ของตัวเอง
- `Delete comment` ต้องเปิด confirmation ก่อนลบ
- Confirmation title: `Delete this comment?`
- Confirmation body สำหรับ root comment ที่มี replies: `This action cannot be undone. This comment and its replies will be removed.`
- Confirmation body สำหรับ reply หรือ root comment ที่ไม่มี replies: `This action cannot be undone. This comment will be removed.`
- Actions: `Cancel`, `Delete`
- ไม่มี Undo
- ลบ root comment แล้วต้องลบ replies ใต้ root comment ทั้งที่แสดงอยู่และที่ collapsed อยู่
- ลบ reply แล้วลบเฉพาะ reply นั้น
- เมื่อลบสำเร็จให้แสดง feedback `This comment was removed.`

Report Comment:

- `Report comment` ต้องเปิด report reason sheet หัวข้อ `Report this comment`
- Description: `Select a reason for reporting this comment. Our team will review it.`
- Reasons: `Harassment or hate`, `Spam or scam`, `Inappropriate content`, `False or misleading information`, `Other`
- Additional details เป็น optional
- `Submit report` disabled จนกว่าจะเลือก reason
- Report สำเร็จต้องไม่ทำให้ comment หายทันที
- Success title: `Report submitted`
- Success copy: `Our team will review this comment. It will remain visible until moderation is complete.`
- Success action ใช้ปุ่ม `Done` และปิด modal กลับ Asset Detail หรือ Comments sheet เดิม

## Comments Bottom Sheet Behavior

- `View all comments` เปิด Comments bottom sheet
- หากกด `...` บน comment ภายใน Comments bottom sheet ให้เปิด comment action sheet เป็นชั้นบนสุด
- กดนอก action sheet หรือ swipe down ต้องปิดเฉพาะ action sheet ไม่ปิด Comments sheet
- หากเลือก `Report comment` ให้เปิด report form เป็น sheet/modal ชั้นบนสุด
- หลัง report/delete สำเร็จ ให้กลับมาที่ Comments sheet เดิมและคง scroll context เท่าที่ทำได้
- Comment action sheet แบบ nested ใช้ได้ แต่ต้อง dim Comments sheet ด้านหลังเล็กน้อยเพื่อสื่อ modal layering

## Make Offer

```text
Asset Detail
→ Make Offer
→ Enter Offer Price
→ Add Message
→ Send Offer
→ Offer Sent Successfully
→ Go to Chat
```

## Open Chat

```text
Asset Detail
→ Contact Seller / Chat
→ Chat Room
```

## Report Asset

```text
Asset Detail
→ More Menu
→ Report
→ Submit Report
```

## Block User

```text
Asset Detail
→ More Menu / Owner Menu
→ Block User
→ Confirm
→ Block Applied
```

## Deleted Asset

```text
Open old Asset Detail link
→ Asset Deleted State
→ Back
```

---

# 10. Business Rules

## Asset Detail Visibility Rule

Viewer เห็นเฉพาะ Asset ที่เป็น Public:

- Sale
- Show

Owner เห็น Asset ของตัวเองได้ทุกสถานะ:

- Sale
- Show
- Hide
- Sold

Viewer ต้องไม่เห็น:

- Hide
- Sold
- Deleted Asset detail แบบปกติ
- Private Asset Data

## Asset Status Display Rule

| Status | Viewer Detail | Owner Detail | Public Surfaces |
|---|---|---|---|
| Sale | แสดง | แสดง | Public Profile, Feed, Search, Watch Alert |
| Show | แสดง | แสดง | Public Profile เท่านั้น |
| Hide | ไม่แสดง | แสดง | ไม่ Public |
| Sold | ไม่แสดง | แสดง | ไม่ Public |

## Gallery Rule

- Asset Detail ต้องรองรับ Gallery รูปภาพ
- ต้องรองรับ Swipe รูป
- ต้องรองรับ Full Screen Image Viewer
- Gallery ต้องรองรับจำนวนรูปตาม Asset Management สูงสุด 10 รูป

## Asset Information Display

Asset Detail ต้องแสดง:

- Gallery รูปภาพ
- Brand
- Model
- Reference No.
- Description
- Price
- Owner Information
- Technical Specifications
- Comments Section

Technical Specifications อ้างอิงจาก Asset Management fields:

- Year
- Condition
- Scope of Delivery
- Case Size
- Thickness
- Case Material
- Movement
- Dial Color
- Strap / Bracelet Type

V1 ไม่กำหนดให้แสดง Location เป็น field หลักใน Asset Detail

## Owner Information Rule

แสดง:

- Owner Name
- Owner Profile Image
- Follow / Unfollow สำหรับ Viewer ที่ไม่ใช่ Owner

Owner ต้องไม่เห็นปุ่ม Follow ตัวเอง

## Private Data Rule

ข้อมูลต่อไปนี้ต้องไม่แสดงใน Viewer/Public mode:

- Provenance
- Purchase Price
- Purchase Date
- Purchase From
- Proof of Payment
- Consignment Owner Contact
- Consignment Terms
- Sold History
- Portfolio Value Detail

ข้อมูลเหล่านี้เห็นเฉพาะ Owner หรือ Admin ตามสิทธิ์

## Owner Private Provenance Display Rule

Owner Asset Detail ต้องแยก private provenance เป็น section เฉพาะ Owner และต้องไม่ปนกับข้อมูล public listing:

| Section | Visible To | Display Rule |
| --- | --- | --- |
| Purchase Information / Owner (Asset) | Owner, Admin | แสดงเฉพาะ field ที่มีค่า เช่น Purchase Price, Purchase Date, Purchase From |
| Consignment Information | Owner, Admin | แสดงเฉพาะ field ที่มีค่า เช่น Consignor name, contact, payout, consignment date, duration |
| Price & Terms | Owner, Admin | แสดงเฉพาะ field ที่มีค่า เช่น Asking Price, Commission, Minimum Acceptable Price, Price Negotiable |
| Documentation | Owner, Admin | แสดงเฉพาะเอกสารหรือรูปที่ upload แล้ว |
| Note | Owner, Admin | แสดงเฉพาะเมื่อมีข้อความ |

Post-save display behavior:

- Public / Viewer mode แสดงเฉพาะ Gallery, Brand, Model, Reference No. ที่มีค่า, Description ที่มีค่า, Price เฉพาะ Sale, Owner Information, Technical Specifications ที่มีค่า และ Comments / Like Count
- Public / Viewer mode ต้องไม่แสดง Purchase Price, Purchase Date, Purchase From, Proof of Payment, Consignment Owner Contact, Payout Method, Commission, Minimum Acceptable Price, Consignment Terms, Portfolio Value Detail หรือ Sold History
- Owner mode แสดง public data ทั้งหมด และแสดง private provenance section ตาม type ที่บันทึกไว้
- Owner mode สำหรับ `Owner (Asset)` ต้องแสดง Purchase Information โดยมี Purchase Price เสมอ และแสดง Purchase Date / Purchase From เฉพาะเมื่อมีค่า
- Owner mode สำหรับ `Consignment` ต้องแสดง Consignment Information และ Price & Terms เฉพาะ field ที่มีค่า

Empty private field behavior:

- ถ้ามี `Owner (Asset)` provenance record แล้ว Purchase Price ต้องมีค่าเสมอ เพราะเป็น required field ของ record นั้น
- ถ้า optional field ไม่ได้กรอก ห้ามแสดงชื่อ field นั้นใน Viewer/Public mode
- ใน Owner mode ให้ซ่อน field ที่ว่าง เพื่อให้หน้ารายละเอียดอ่านง่าย
- ถ้า private section ไม่มีข้อมูลเลย ให้แสดง owner-only action prompt เช่น `Add provenance` หรือซ่อน section ตาม layout
- ห้ามแสดง placeholder เช่น `N/A`, `-`, `Not provided` สำหรับ optional descriptive fields ที่ว่าง
- Price analytics ที่ต้องคง layout เช่น Expected Profit สามารถใช้ `—` ได้ตาม Price Analytics Rule

Provenance edit behavior:

- Asset สถานะ `Sale`: Owner สามารถแก้ `Owner (Asset)` หรือ `Consignment` provenance ได้ตาม type ที่เลือก
- Asset สถานะ `Show` หรือ `Hide`: Owner แก้ได้เฉพาะ `Owner (Asset)` provenance และต้องไม่เห็น `Consignment` option
- Asset สถานะ `Sold` ต้องแสดง Provenance / Consignment แบบ read-only และไม่ให้แก้ผ่าน Edit Asset ปกติ
- การแก้ข้อมูลที่มีผลต่อ portfolio หรือ consignment settlement หลังขายต้องใช้ correction/audit flow ไม่ใช่แก้ทับประวัติเดิม

## Price Analytics Rule

Asset Detail สามารถแสดง price analytics ได้ตามสิทธิ์และข้อมูลที่มี:

- Market Comparison แสดงได้ใน Public Asset Detail หากมี Asking Price และ Watch Price API Market Price
- Expected Profit แสดงเฉพาะ Owner view เพราะใช้ Purchase Price
- Purchase Price, Purchase Date และ Portfolio Value Detail ต้องไม่แสดงใน Viewer/Public mode

### Market Comparison

```text
Market Comparison = Asking Price - Market Price
```

```text
Market Comparison % = (Market Comparison / Market Price) * 100
```

Display state:

| Condition | Label |
| --- | --- |
| Market Comparison % > 1% | `Above Market` |
| Market Comparison % >= -1% และ <= 1% | `At Market` |
| Market Comparison % < -1% | `Below Market` |

Rules:

- ใช้ Watch Price API Market Price เท่านั้น
- ไม่ใช้ Owner Estimated Value หรือ Purchase Price fallback เพื่อแสดง Above/At/Below
- หากไม่มี Market Price ให้แสดง `ไม่มีราคาตลาด` / `No market price`
- หากไม่มี Asking Price ให้ซ่อนหรือแสดง `—` ตาม layout

### Expected Profit

```text
Expected Profit = Asking Price - Purchase Price
```

```text
Expected Profit % = (Expected Profit / Purchase Price) * 100
```

Rules:

- แสดงเฉพาะ Owner view
- หากไม่มี Asking Price, Purchase Price หรือ Purchase Price <= 0 ให้แสดง `—`
- Expected Profit เป็นกำไรคาดการณ์ ไม่ใช่ Realized Gain/Loss

## Like Rule

- User สามารถ Like Asset ได้
- Owner สามารถ Like Asset ตัวเองได้
- Like สำเร็จต้อง Update Like Count ทันที
- Like สำเร็จต้องเพิ่ม Asset เข้า Favorites
- Unlike สำเร็จต้อง Update Like Count ทันที
- Unlike สำเร็จต้องลบ Asset ออกจาก Favorites

## Comment Rule

- Comment ทำใน Asset Detail เท่านั้น
- Comment รองรับ IG-style one-level replies ใต้ comment หลัก
- ไม่รองรับ multi-level nested thread หรือ reply ซ้อนเกิน 1 ชั้น
- ไม่มี Edit Comment ใน V1
- รองรับ Delete Comment
- User ลบได้เฉพาะ Comment ของตัวเองตามสิทธิ์
- Comment action menu ใช้ปุ่ม `...` แนวนอน
- Comment ของตัวเองแสดง `Delete comment`
- Comment ของคนอื่นแสดง `Report comment`
- ไม่รองรับ `Hide comment` ใน V1
- Root comment deletion ลบ root comment และ replies ใต้ comment นั้น
- Reply deletion ลบเฉพาะ reply นั้น

## Share Rule

- Share ทำผ่าน Asset Detail
- Share เป็น Deep Link ของ Asset
- หากเปิด link ของ Asset ที่ถูกลบ ต้องแสดง Deleted Asset State

## Make Offer Rule

- Make Offer ทำผ่าน Asset Detail เท่านั้น
- Accepted Offer เปิด Chat Room
- Rejected Offer เปิด Asset Detail
- Asset Deleted ทำให้ Offer เป็น Cancelled
- Asset Sold ต้อง Auto Reject Offer อื่น

## Show Asset Action Rule

Master ระบุว่า `Show` เป็น Public Asset Detail ได้ แต่ไม่ขึ้น Feed, Search หรือ Watch Alert

Product review สำหรับ V1:

- `Show` เป็น public collection/detail ที่ไม่ขึ้น Feed, Search หรือ Watch Alert
- `Show` สามารถแสดง Make Offer / Contact Seller / Chat จาก Asset Detail ได้
- เหตุผลคือผู้ใช้อาจสนใจสอบถามหรือเสนอราคากับเจ้าของ Asset แม้ Asset ไม่ได้ถูกวางใน marketplace feed
- Entry point ของ `Show` ต้องมาจาก Public Profile / Asset Detail เท่านั้น ไม่ใช่ Feed, Search หรือ Watch Alert
- Master ระบุ rule นี้แล้ว และต้องให้ Figma annotate entry point ให้ชัด

## Chat Rule

- Chat เปิดจาก Asset Detail ได้
- Same Asset ใช้ห้องเดิม
- Asset Deleted แล้ว Chat ยังอยู่
- Asset Sold แล้ว Chat ยังใช้งานได้

## Deleted Asset Rule

เมื่อ Asset ถูกลบ:

- Asset ต้องหายจาก Feed, Search, Watch Alert และ Public Profile
- Asset Detail ต้องแสดง `รายการนี้ไม่พร้อมใช้งานแล้ว`
- Chat ยังอยู่
- Offer ที่เกี่ยวข้องต้องเป็น Cancelled

## Report Rule

- Report Asset ทำจาก Asset Detail ได้
- Report ไม่ทำให้ Asset หายจาก Feed หรือ Search ทันที
- Asset จะหายเมื่อ Admin ดำเนินการตาม Moderation เท่านั้น

## Report Comment Rule

- Report Comment ทำจาก Comment action ใน Asset Detail ได้
- Report Comment ต้องเปิด Trust & Safety Report Comment flow
- Report ไม่ทำให้ Comment หายทันที
- Comment จะหายเมื่อ Admin ดำเนินการตาม Moderation เท่านั้น

## Block User Rule

- Block User ทำจาก Asset Detail ได้
- เมื่อ Block แล้ว Asset ของผู้ถูก Block ต้องหายจาก Feed, Search และ Watch Alert Result ทันที

---

# 11. Permission Rules

## Guest

ดูได้:

- Public Asset Detail
- Gallery
- Full Screen Image
- Like Count
- Comment Count
- Comments
- Owner Information

ใช้ไม่ได้:

- Like
- Follow
- Comment
- Chat
- Make Offer
- Report
- Block User

## Member / Viewer

สามารถ:

- Like / Unlike
- Follow / Unfollow
- Comment
- Delete own Comment
- Make Offer
- Open Chat
- Share
- Report Asset
- Block User

ไม่สามารถ:

- Edit Asset ของผู้อื่น
- Delete Asset ของผู้อื่น
- View private asset data ของผู้อื่น
- View Hide / Sold Asset ของผู้อื่น

## Owner

สามารถ:

- View Asset ของตัวเองทุกสถานะ
- View private asset data ของตัวเอง
- Open Edit Asset ตามสิทธิ์
- Delete / Change Status ตาม rule ของ Asset Management Module
- View Sold History
- Like Asset ตัวเอง

ไม่ควรเห็น:

- Follow button ของตัวเอง

---

# 12. Validation Rules

## Comment

- Required
- ต้องไม่เป็นค่าว่าง
- ต้องไม่เกิน max length ที่กำหนดโดย implementation

## Offer

ตรวจสอบใน Offer Module

## Report

ตรวจสอบใน Trust & Safety Module

---

# 13. Exception Handling

## Asset Deleted

| Language | Message |
|---|---|
| TH | รายการนี้ไม่พร้อมใช้งานแล้ว |
| EN | This item is no longer available. |

ปุ่ม:

- `Go back`

CTA behavior:

- ถ้ามี navigation history ให้กลับไปหน้าก่อนหน้าที่ user เข้ามา เช่น Feed, Public Profile, Chat หรือ Watch Alert Result
- ถ้าไม่มี navigation history เช่นเปิดจาก external deep link โดยตรง ให้ fallback ไป Feed
- shared unavailable / permission state ไม่ควรใช้ label `Back to feed` เว้นแต่รู้แน่นอนว่า entry point มาจาก Feed เท่านั้น

## Permission Denied

| Language | Message |
|---|---|
| TH | คุณไม่มีสิทธิ์ดำเนินการ |
| EN | Permission denied |

ปุ่ม:

- `Go back`

CTA behavior ใช้ rule เดียวกับ Asset Deleted / Unavailable state: กลับไปหน้าก่อนหน้าถ้ามี navigation history; ถ้าไม่มี history ให้ fallback ไป Feed

## Asset Not Found

| Language | Message |
|---|---|
| TH | ไม่พบรายการ |
| EN | Asset not found |

## Action Requires Login

ใช้ Global Login Required Dialog

---

# 14. Empty State

## Comment Empty State

| Language | Message |
|---|---|
| TH | ไม่พบข้อมูล |
| EN | No data found |

---

# 15. Notification Rules

- Like Asset ส่ง Like Notification ตาม Notification Module
- Comment Asset ส่ง Comment Notification ตาม Notification Module
- Make Offer ส่ง Offer Notification ตาม Offer / Notification Module
- Comment Notification เปิด Asset Detail และ focus comment ที่เกี่ยวข้อง
- Offer Accepted เปิด Chat Room
- Offer Rejected เปิด Asset Detail

---

# 16. Analytics Events

- Open Asset Detail
- Open Asset Detail From Feed
- Open Asset Detail From Search
- Open Asset Detail From Profile
- Open Asset Detail From Notification
- Full Screen Image Open
- Like Asset
- Unlike Asset
- Comment Asset
- Delete Comment
- Report Comment
- Open Chat
- Make Offer
- Share Asset
- Report Asset
- Block User
- Deleted Asset Viewed

---

# 17. Acceptance Criteria

## Visibility

| AC ID | Criteria |
|---|---|
| AC-DETAIL-001 | Viewer ต้องเปิด Asset Detail ได้เฉพาะ Asset สถานะ Sale และ Show |
| AC-DETAIL-002 | Owner ต้องเปิด Asset Detail ของตัวเองได้ทุกสถานะ Sale, Show, Hide และ Sold |
| AC-DETAIL-003 | Viewer ต้องไม่เห็น Asset สถานะ Hide และ Sold ของผู้อื่น |
| AC-DETAIL-004 | Viewer ต้องไม่เห็น private asset data ของผู้อื่น |
| AC-DETAIL-005 | Owner ต้องไม่เห็นปุ่ม Follow ตัวเอง |

## Asset Detail Display

| AC ID | Criteria |
|---|---|
| AC-DETAIL-006 | Asset Detail ต้องแสดง Gallery, Brand, Model, Reference No., Description, Price, Owner Information, Technical Specifications และ Comments Section |
| AC-DETAIL-007 | Asset Detail ต้องรองรับ Full Screen Image Viewer |
| AC-DETAIL-008 | Asset Detail ต้องรองรับ Swipe รูป |
| AC-DETAIL-009 | Gallery ใน Asset Detail ต้องรองรับจำนวนรูปสูงสุด 10 รูปตาม Asset Management |
| AC-DETAIL-010 | Asset Detail V1 ต้องไม่ใช้ Location เป็น field หลัก เว้นแต่ master จะตัดสินใจเพิ่มภายหลัง |
| AC-DETAIL-010A | Market Comparison ต้องใช้ Asking Price เทียบกับ Watch Price API Market Price เท่านั้น และต้องไม่ใช้ Owner Estimated Value หรือ Purchase Price fallback เพื่อแสดง Above/At/Below |
| AC-DETAIL-010B | Expected Profit ต้องแสดงเฉพาะ Owner view และต้องไม่แสดง Purchase Price หรือ expected profit ให้ Viewer/Public mode |
| AC-DETAIL-010C | Owner Asset Detail ต้องแยก Purchase Information / Owner Provenance ออกจาก Consignment Information และแสดงเฉพาะ Owner หรือ Admin |
| AC-DETAIL-010D | Optional private fields ที่ไม่ได้กรอกต้องไม่แสดง label หรือ placeholder ใน Viewer/Public mode และ Owner private section ควรซ่อน field ว่าง |
| AC-DETAIL-010E | Sold Asset ต้องแสดง Provenance / Consignment เป็น read-only และไม่ให้แก้ผ่าน Edit Asset ปกติ |
| AC-DETAIL-010F | Public / Viewer Asset Detail ต้องไม่แสดง Purchase Price, Purchase Date, Purchase From, Proof of Payment, Consignment Owner Contact, Payout Method, Commission, Minimum Acceptable Price, Portfolio Value Detail หรือ Sold History |
| AC-DETAIL-010G | Owner Asset Detail ของ Status = Show หรือ Hide ต้องแสดง/แก้ได้เฉพาะ `Owner (Asset)` provenance และต้องไม่มี `Consignment` option |
| AC-DETAIL-010H | Owner Asset Detail ของ Consignment ต้องแสดง Consignment Information และ Price & Terms เฉพาะ field ที่มีค่า |

## Guest User

| AC ID | Criteria |
|---|---|
| AC-DETAIL-011 | Guest ต้องดู Public Asset Detail, Gallery, Comment, Like Count, Comment Count และ Owner Information ได้ |
| AC-DETAIL-012 | Guest ต้องไม่สามารถ Like, Follow, Comment, Chat, Make Offer, Report หรือ Block User ได้ |
| AC-DETAIL-013 | เมื่อ Guest ใช้ action ที่ต้อง Login ต้องแสดง Global Login Required Dialog |

## Like & Comment

| AC ID | Criteria |
|---|---|
| AC-DETAIL-014 | User ต้อง Like และ Unlike Asset จาก Asset Detail ได้ |
| AC-DETAIL-015 | Owner ต้อง Like Asset ตัวเองได้ |
| AC-DETAIL-016 | Like สำเร็จต้อง Update Like Count และเพิ่ม Asset เข้า Favorites |
| AC-DETAIL-017 | Unlike สำเร็จต้อง Update Like Count และลบ Asset ออกจาก Favorites |
| AC-DETAIL-018 | Comment ต้องรองรับ IG-style one-level replies ใต้ comment หลัก |
| AC-DETAIL-019 | Asset Detail ต้องไม่รองรับ multi-level nested thread หรือ reply ซ้อนเกิน 1 ชั้น |
| AC-DETAIL-020 | Asset Detail ต้องไม่มี Edit Comment ใน V1 |
| AC-DETAIL-021 | User ต้องลบ Comment ของตัวเองได้ตามสิทธิ์ |

## Offer / Chat / Share

| AC ID | Criteria |
|---|---|
| AC-DETAIL-022 | Make Offer ต้องทำจาก Asset Detail เท่านั้น |
| AC-DETAIL-023 | เมื่อ Offer Accepted ต้องเปิด Chat Room |
| AC-DETAIL-024 | เมื่อ Offer Rejected ต้องเปิด Asset Detail |
| AC-DETAIL-025 | User ต้องเปิด Chat จาก Asset Detail ได้ตามสิทธิ์ |
| AC-DETAIL-026 | User ต้อง Share Asset Deep Link จาก Asset Detail ได้ |
| AC-DETAIL-027 | Asset สถานะ `Show` ต้องแสดง Make Offer / Contact Seller / Chat ได้จาก Asset Detail แต่ต้องไม่ขึ้น Feed, Search หรือ Watch Alert |

## Deleted / Sold Asset

| AC ID | Criteria |
|---|---|
| AC-DETAIL-028 | Deleted Asset ต้องแสดงข้อความ `รายการนี้ไม่พร้อมใช้งานแล้ว` / `This item is no longer available.` |
| AC-DETAIL-029 | เมื่อ Asset Deleted แล้ว Chat ต้องยังอยู่ |
| AC-DETAIL-030 | เมื่อ Asset Deleted แล้ว Offer ที่เกี่ยวข้องต้องเป็น Cancelled |
| AC-DETAIL-031 | Sold Asset ต้องเห็นเฉพาะ Owner |
| AC-DETAIL-032 | Sold Asset ต้องแสดง Sold History ให้ Owner ดูได้ |
| AC-DETAIL-033 | Sold Asset ต้องไม่ให้ Edit ข้อมูลหลักผ่าน Asset Detail |

## Report & Block

| AC ID | Criteria |
|---|---|
| AC-DETAIL-034 | User ต้อง Report Asset จาก Asset Detail ได้ |
| AC-DETAIL-035 | Report Asset ต้องไม่ทำให้ Asset หายทันทีจนกว่า Admin จะดำเนินการ |
| AC-DETAIL-036 | User ต้อง Block User จาก Asset Detail ได้ |
| AC-DETAIL-037 | เมื่อ Block User แล้ว Asset ของผู้ถูก Block ต้องหายจาก Feed, Search และ Watch Alert Result |
| AC-DETAIL-038 | User ต้อง Report Comment จาก Comment action ใน Asset Detail ได้ |
| AC-DETAIL-039 | Report Comment ต้องไม่ทำให้ Comment หายทันทีจนกว่า Admin จะดำเนินการ |

---

# 18. Related Modules

- Asset Management Module
- Feed Module
- Search & Filter Module
- Profile Module
- Chat Module
- Offer Module
- Notification Module
- Watch Alert Module
- Trust & Safety Module

---

# 19. Future Enhancement

- Asset View Count
- Asset Share Count
- Related Watches
- Similar Listings
- Video Gallery
