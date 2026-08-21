# 02 Feed Module

อ้างอิงหลักจาก [TukDaeng_Master_Product_Definition.md](TukDaeng_Master_Product_Definition.md)

---

# 1. Document Information

| Field | Detail |
| --- | --- |
| Module Name | Feed |
| Platform | Mobile Application |
| Version | V1 |
| Status | Draft |
| Owner | Product / UX / Engineering |
| Document Type | Functional PRD - Master Aligned |

# 2. Objective

Feed Module เป็น marketplace หลักของ TukDaeng สำหรับแสดง Asset ที่เปิดขายอยู่ในระบบ โดยต้องแสดงเฉพาะ Asset สถานะ `Sale` ที่ผู้ใช้มีสิทธิ์มองเห็น และต้องไม่ทำหน้าที่เป็น social feed

เป้าหมายหลักคือให้ผู้ใช้ค้นพบ Asset ที่กำลังขาย เข้า Asset Detail, เข้า Public Profile ของเจ้าของ Asset, ดูรูปแบบเต็มจอ, Like / Unlike และติดตามรายการผ่าน Favorites หรือ Following ตามสิทธิ์ของผู้ใช้

# 3. Prototype Reference

- `Menu Feed.png`
- `Detail asset viewer.png`
- `Detail asset owner.png`
- `Main Viewer Profile.png`
- `Main Owner Profile.png`

# 4. Master Alignment Summary

| Area | Master Baseline |
| --- | --- |
| Feed purpose | Feed เป็น marketplace หลัก ไม่ใช่ social feed |
| Visibility | Feed แสดงเฉพาะ Asset สถานะ `Sale` |
| Permission filtering | Feed ต้องกรอง Asset ที่ผู้ใช้ไม่มีสิทธิ์มองเห็นออก |
| Block filtering | Feed ต้องไม่แสดง Asset ของผู้ใช้ที่ถูก Block หรือ Block กันอยู่ |
| Tabs | `All`, `Following`, `Favorites` |
| Card required fields | Asset Images, Brand, Model, Price, Posted Time, Owner Name, Like Count, Comment Count |
| Card exclusions in V1 | ไม่แสดง Location, Verified Badge, Status Badge |
| Supported actions | Like / Unlike, Swipe image, เปิด Asset Detail, เปิด Public Profile, เปิด Full Screen Image Viewer, Share Asset |
| More menu actions | Asset ของผู้อื่นรองรับ Hide this asset, Report Asset, Block User, Share Asset; Asset ของ Owner รองรับ Edit asset, Mark as sold, Delete asset, Share Asset |
| Unsupported actions | ไม่รองรับ Comment จาก Feed โดยตรง |
| Guest access | Guest ดู Feed ได้ แต่ action ที่ต้อง Login ต้องแสดง Global Login Required Dialog |
| Performance | Feed โหลดภายใน 2 วินาที, รูปภาพ Lazy Load, รองรับ Infinite Scroll |
| End state | เมื่อ Scroll ถึงรายการสุดท้ายให้แสดง `คุณดูรายการทั้งหมดแล้ว` |
| Error / Offline | โหลด Feed ไม่สำเร็จต้องมี Error State + `ลองใหม่`; Offline ต้องแสดงข้อมูลล่าสุดที่โหลดไว้ได้อย่างน้อยสำหรับ Feed |

# 5. Figma Gap Checklist For Feed Module

รายการนี้ใช้เป็น checklist สำหรับปรับ Figma เฉพาะ Feed Module ให้ตรงกับ master ก่อนส่งต่อ Dev / QA

| Priority | Gap | Master Baseline | Figma Action |
| --- | --- | --- | --- |
| Must Fix | Feed Card ยังแสดง Location เช่น `5 hours ago • Pathum Wan` | Feed Card V1 ต้องไม่แสดง Location | เอา Location ออกจาก Feed Card และเหลือเฉพาะ Posted Time |
| Must Fix | Feed อาจแสดง Asset ที่ไม่ใช่ `Sale` | Feed, Search และ Watch Alert ใช้เฉพาะ Asset สถานะ `Sale` | ระบุ filter/status rule ว่า Feed render เฉพาะ `Sale` เท่านั้น |
| High | ยังไม่เห็น behavior ของแท็บ `All`, `Following`, `Favorites` ครบ | `All` = Sale ทั้งหมดที่มองเห็น, `Following` = Sale ของคนที่ Follow, `Favorites` = Sale ที่กด Like | เพิ่ม annotation หรือ state ของแต่ละแท็บให้ชัด |
| High | ยังไม่เห็น Block filtering ใน Feed | Asset ของผู้ถูก Block ต้องหายจาก Feed ทันที และ Following Feed ต้องไม่ใช้ความสัมพันธ์ Follow ระหว่างผู้ที่ Block กัน | เพิ่ม blocked/hidden asset state หรือ rule note ใน Feed |
| High | ยังไม่เห็นเมนูสามจุดสำหรับจัดการ Asset ของผู้อื่น | Feed more menu ควรรองรับ Hide this asset, Report Asset, Block User โดยไม่ชนกับ asset status `Hide` | เพิ่ม overflow menu, hide success + undo, report entry และ Block User confirmation |
| High | ยังไม่เห็นเมนูสามจุดสำหรับ Asset ของ Owner | Owner Feed more menu ควรรองรับ Edit asset, Mark as sold, Delete asset โดยใช้ rule เดียวกับ Asset Management | เพิ่ม owner overflow menu, Mark as sold shortcut ไป Sale Record Form, Delete confirmation และ success/error state |
| High | ยังไม่เห็น Guest restriction state | Guest กด Like, Follow, Chat, Offer, Favorites, Following ต้องเจอ Global Login Required Dialog | เพิ่ม dialog/state สำหรับ guest interaction |
| High | ยังไม่เห็น Feed load more / Infinite Scroll state | Feed ต้องรองรับ Infinite Scroll | เพิ่ม loading state ระหว่างโหลดรายการถัดไป |
| High | ยังไม่เห็น End-of-list state | เมื่อ Scroll ถึงท้ายรายการต้องแสดง `คุณดูรายการทั้งหมดแล้ว` | เพิ่ม state ท้ายรายการ |
| High | ยังไม่เห็น Feed Error state พร้อม retry | โหลด Feed ไม่สำเร็จต้องแสดง Error State และปุ่ม `ลองใหม่` | เพิ่ม error screen/state พร้อม retry |
| High | ยังไม่เห็น Offline cached data state | Feed ต้องแสดงข้อมูลล่าสุดที่โหลดไว้เมื่อ Offline | เพิ่ม offline/cached state หรือ banner |
| Medium | Feed Card ยังไม่ยืนยัน required fields ครบ | Card ต้องแสดง Asset Images, Brand, Model, Price, Posted Time, Owner Name, Like Count, Comment Count | ตรวจและ annotate card fields ให้ครบ |
| Medium | Feed อาจสื่อว่า Comment ทำจาก Feed ได้ | Comment ต้องทำผ่าน Asset Detail เท่านั้น แต่ Share ทำได้จาก Feed | ตัดหรือปรับ Comment action ที่ทำให้เข้าใจผิด และเพิ่ม Share Asset action บน Feed |
| Medium | ยังไม่เห็น Like / Unlike sync กับ Favorites | Like ต้องเพิ่มเข้า Favorites และ Unlike ต้องลบออกจาก Favorites | เพิ่ม state หลัง Like / Unlike และผลต่อ Favorites |
| Medium | ยังไม่เห็น Swipe image / Full Screen Image Viewer จาก Feed card | Feed action ต้องรองรับ Swipe image และเปิด Full Screen Image Viewer | เพิ่ม image interaction state |
| Medium | ยังไม่เห็น navigation destination ชัด | Feed Card ต้องเปิด Asset Detail และ Owner Name/Profile area ต้องเปิด Public Profile | ระบุ tap target และ destination ให้ชัด |

# 6. Scope

## In Scope

- Feed tabs: `All`, `Following`, `Favorites`
- Sale-only feed list
- Feed Card display
- Image swipe บน Feed Card
- Full Screen Image Viewer
- Like / Unlike
- More menu สำหรับ Asset ของผู้อื่น
- More menu สำหรับ Asset ของ Owner
- Hide this asset / ไม่ต้องการเห็นรายการนี้
- Report Asset
- Block User
- Edit asset
- Mark as sold / บันทึกว่าขายแล้ว
- Delete asset
- เปิด Asset Detail
- เปิด Public Profile
- Infinite Scroll และ load-more state
- End-of-list state
- Feed Error state พร้อม retry
- Offline cached data state
- Guest Login Required Dialog สำหรับ action ที่ต้อง Login
- Visibility filtering ตาม permission และ block relationship

## Out Of Scope

- Comment จาก Feed โดยตรง
- Location บน Feed Card
- Verified Badge บน Feed Card
- Status Badge บน Feed Card
- Real-time Feed Refresh สำหรับ Asset ใหม่, Like จากอุปกรณ์อื่น หรือ Comment จากอุปกรณ์อื่น
- Asset สถานะ `Show`, `Hide`, `Sold`
- Auction, live bidding, social post feed

# 7. Screen Mapping

| Screen / State | Description |
| --- | --- |
| Feed - All | แสดง Asset `Sale` ทั้งหมดที่ผู้ใช้มีสิทธิ์มองเห็น |
| Feed - Following | แสดง Asset `Sale` ของผู้ใช้ที่ Member กำลัง Follow |
| Feed - Favorites | แสดง Asset `Sale` ที่ Member กด Like |
| Feed Card | แสดงข้อมูลหลักของ Asset และ action ที่รองรับ |
| Feed Loading | แสดง initial loading หรือ load-more loading |
| Feed Empty | แสดงเมื่อไม่มี Asset ที่ตรงเงื่อนไขของ tab |
| Feed End Of List | แสดง `คุณดูรายการทั้งหมดแล้ว` เมื่อถึงท้ายรายการ |
| Feed Error | แสดง error state และปุ่ม `ลองใหม่` |
| Feed Offline Cached | แสดงข้อมูลล่าสุดที่โหลดไว้พร้อมสถานะ offline/cached |
| Global Login Required Dialog | แสดงเมื่อ Guest ใช้ feature ที่ต้อง Login |
| Full Screen Image Viewer | เปิดรูป Asset แบบเต็มจอจาก Feed Card |
| Feed More Menu | เมนูสามจุดบน Asset ของผู้อื่น |
| Owner Feed More Menu | เมนูสามจุดบน Asset ของ Owner |
| Hide Feed Item Undo | Snackbar หลังซ่อนรายการ พร้อม action Undo |
| Report Asset Entry | เปิด Report Asset flow จาก Feed more menu |
| Report Asset Bottom Sheet | Bottom sheet สำหรับส่ง Report Asset จาก Feed |
| Block User Confirmation | ยืนยันก่อน Block User จาก Feed more menu |
| Mark As Sold From Feed | เปิด Sale Record Form จาก Feed owner menu |
| Delete Asset From Feed Confirmation | ยืนยันก่อน Delete Asset จาก Feed owner menu |

# 8. User States

## Guest

Guest สามารถ:

- ดู Feed
- ดู Asset Detail ที่เป็น Public
- ดู Public Profile
- ดู Like Count
- ดู Comment Count
- ดู Full Screen Image

Guest ไม่สามารถ:

- Like / Unlike
- Follow / Unfollow
- เปิด Favorites
- เปิด Following
- Comment
- Chat
- Make Offer
- ตั้ง Watch Alert
- Add / Edit / Delete Asset
- Hide this asset
- Report Asset
- Block User

เมื่อ Guest ใช้ feature ที่ต้อง Login ระบบต้องแสดง Global Login Required Dialog

## Member

Member สามารถใช้ Feed ได้ตามสิทธิ์และ visibility rule ของระบบ รวมถึง Like / Unlike, เปิด Following, เปิด Favorites, เปิด Asset Detail, เปิด Public Profile และเปิด Full Screen Image Viewer

Member สามารถใช้เมนูสามจุดบน Asset ของผู้อื่นเพื่อ Hide this asset, Report Asset หรือ Block User ได้ตาม Trust & Safety rule

## Owner

เมื่อ Feed แสดง Asset ของ Owner เอง Owner สามารถใช้เมนูสามจุดบน Feed Card เพื่อ:

- Edit asset / แก้ไขรายการ
- Mark as sold / บันทึกว่าขายแล้ว
- Delete asset / ลบรายการ

Owner ต้องไม่เห็น Hide this asset, Report Asset หรือ Block User บน Asset ของตัวเอง

## Blocked Relationship

เมื่อมีความสัมพันธ์ Block ระหว่างผู้ใช้:

- Asset ของผู้ถูก Block ต้องไม่แสดงใน Feed
- Asset ของผู้ที่ Block ผู้ใช้ปัจจุบันต้องไม่แสดงใน Feed
- Following Feed ต้องไม่ใช้ความสัมพันธ์ Follow ระหว่างผู้ที่ Block กัน

# 9. User Flow

## Open Feed

1. User เปิดแอปหรือกดเมนู Feed
2. ระบบโหลด Feed tab ล่าสุด หรือ default เป็น `All`
3. ระบบดึงเฉพาะ Asset สถานะ `Sale`
4. ระบบกรอง permission และ block relationship
5. ระบบแสดง Feed Card ตามลำดับที่ backend ส่งกลับ

## Switch Tab

1. User เลือก `All`, `Following` หรือ `Favorites`
2. ระบบโหลดรายการตาม rule ของ tab
3. หากไม่มีรายการ ให้แสดง empty state ของ tab นั้น

## Like / Unlike

1. Member กด Like บน Feed Card
2. ระบบ update Like Count ทันทีเมื่อสำเร็จ
3. ระบบเพิ่ม Asset เข้า Favorites
4. เมื่อ Member กด Unlike ระบบ update Like Count และลบ Asset ออกจาก Favorites
5. หาก Guest กด Like ให้แสดง Global Login Required Dialog

## Open Asset Detail

1. User กด Feed Card
2. ระบบเปิด Asset Detail
3. Comment ต้องทำจาก Asset Detail เท่านั้น ส่วน Share ทำได้จาก Feed และ Asset Detail

## Open Public Profile

1. User กด Owner Name หรือ Profile area
2. ระบบเปิด Public Profile ของเจ้าของ Asset
3. หากถูก Block หรือไม่มีสิทธิ์ดู ให้แสดง unavailable state ตาม Trust & Safety rule

## Image Interaction

1. User swipe รูปใน Feed Card
2. ระบบเปลี่ยนรูปตาม gallery ของ Asset
3. User กดรูปเพื่อเปิด Full Screen Image Viewer

## Hide Feed Item

1. Member กดเมนูสามจุดบน Feed Card ของ Asset ผู้อื่น
2. Member เลือก `Hide this asset` / `ไม่ต้องการเห็นรายการนี้`
3. ระบบซ่อน Asset นั้นจาก Feed ของ Member ทันที
4. ระบบแสดง snackbar พร้อม `Undo`
5. หาก Member กด Undo ระบบนำ Asset กลับมาใน Feed ตามตำแหน่งหรือ refresh state ที่เหมาะสม
6. หากไม่ Undo ระบบบันทึก user-level hidden asset preference และ Asset นั้นไม่กลับมาใน Feed เมื่อ refresh/reload

Snackbar copy:

| Language | Message | Action |
| --- | --- | --- |
| TH | ซ่อนรายการนี้จากฟีดของคุณแล้ว | เลิกทำ |
| EN | This asset has been hidden from your feed | Undo |

Error snackbar:

| Language | Message |
| --- | --- |
| TH | ซ่อนรายการไม่สำเร็จ กรุณาลองใหม่ |
| EN | Couldn’t hide this asset. Please try again. |

หาก Hide this asset ล้มเหลว ระบบต้องคืน Feed Card กลับมา, ไม่บันทึก hidden preference และไม่แสดง Undo เพราะ action ไม่สำเร็จ

## Report Asset From Feed

1. Member กดเมนูสามจุดบน Feed Card ของ Asset ผู้อื่น
2. Member เลือก `Report Asset` / `รายงานรายการนี้`
3. ระบบเปิด Report Asset bottom sheet ของ Trust & Safety
4. เมื่อ report สำเร็จ Asset ต้องไม่หายทันทีจาก public surfaces เว้นแต่ Member เลือก Hide this asset แยกต่างหาก

Report Asset bottom sheet:

- มี drag handle
- ไม่มีปุ่ม Cancel / ยกเลิก
- ปิดได้ด้วย drag down, tap backdrop หรือ system back
- Dismiss โดยไม่ submit ต้องไม่สร้าง report
- Unsaved input สามารถ discard ได้เมื่อปิด bottom sheet
- Primary button เดียวคือ `ส่งรายงาน` / `Submit report`
- Primary button ต้อง disabled จนกว่า Member จะเลือก Reason

Report Asset copy:

| Language | Title | Body | Primary |
| --- | --- | --- | --- |
| TH | รายงานรายการนี้ | เลือกเหตุผลที่ต้องการรายงาน ทีมงานจะตรวจสอบตามขั้นตอน | ส่งรายงาน |
| EN | Report this asset | Select a reason for reporting this asset. Our team will review it. | Submit report |

Report Asset fields:

| Field | Requirement |
| --- | --- |
| Reason / เหตุผล | Required |
| Additional details / รายละเอียดเพิ่มเติม | Optional |

Reason validation:

| Language | Message |
| --- | --- |
| TH | กรุณาเลือกเหตุผล |
| EN | Please select a reason. |

ถ้ายังไม่ได้เลือก Reason ให้แสดงปุ่ม `ส่งรายงาน` / `Submit report` เป็น disabled state และไม่อนุญาตให้ submit

Success state:

| Language | Title | Body | Button |
| --- | --- | --- | --- |
| TH | ส่งรายงานแล้ว | ทีมงานจะตรวจสอบภายใน 24 ชั่วโมง รายการนี้จะยังแสดงอยู่จนกว่าจะมีการตรวจสอบ | ตกลง |
| EN | Report submitted | Our team will review this within 24 hours. This asset will remain visible until moderation is complete. | Done |

Error snackbar:

| Language | Message |
| --- | --- |
| TH | ส่งรายงานไม่สำเร็จ กรุณาลองใหม่ |
| EN | Couldn’t submit report. Please try again. |

## Block User From Feed

1. Member กดเมนูสามจุดบน Feed Card ของ Asset ผู้อื่น
2. Member เลือก `Block User` / `บล็อกผู้ใช้งาน`
3. ระบบแสดง confirmation ก่อน block
4. เมื่อ block สำเร็จ Asset/content ของ user นั้นต้องหายจาก Feed ตาม Trust & Safety rule

Confirmation copy:

| Language | Title | Body | Primary | Secondary |
| --- | --- | --- | --- | --- |
| TH | บล็อกผู้ใช้งานนี้? | คุณจะไม่เห็นรายการของผู้ใช้งานนี้ในฟีด ค้นหา และผลลัพธ์ Watch Alert อีก ผู้ใช้งานนี้จะไม่สามารถเริ่มแชทหรือส่งข้อเสนอใหม่กับคุณได้ | บล็อก | ยกเลิก |
| EN | Block this user? | You will no longer see this user's assets in Feed, Search, or Watch Alert results. This user will not be able to start a new chat or send you new offers. | Block | Cancel |

Success / error snackbar:

| State | TH | EN |
| --- | --- | --- |
| Success | บล็อกผู้ใช้งานแล้ว | User blocked |
| Error | บล็อกไม่สำเร็จ กรุณาลองใหม่ | Couldn’t block user. Please try again. |

## Edit Asset From Feed

1. Owner กดเมนูสามจุดบน Feed Card ของ Asset ตัวเอง
2. Owner เลือก `Edit asset` / `แก้ไขรายการ`
3. ระบบเปิด Edit Asset flow ของ Asset Management
4. Edit Asset ต้องเลือก status ได้เฉพาะ `Sale`, `Show`, `Hide` และต้องไม่ให้เลือก `Sold`

## Mark As Sold From Feed

1. Owner กดเมนูสามจุดบน Feed Card ของ Asset ตัวเอง
2. Owner เลือก `Mark as sold` / `บันทึกว่าขายแล้ว`
3. ระบบเปิด Sale Record Form โดยตรง
4. Owner กรอก Sale Date, Buyer, Contact, Sale Price, Payment Method และ Attachment ตาม Asset Management rule
5. เมื่อ Confirm สำเร็จ ระบบเปลี่ยน Asset status เป็น `Sold`
6. Asset หายจาก Feed, Following, Favorites, Search และ Watch Alert ทันที
7. Offer อื่นที่เกี่ยวข้องต้องถูก Auto Reject ตาม Offer / Asset Management rule

## Delete Asset From Feed

1. Owner กดเมนูสามจุดบน Feed Card ของ Asset ตัวเอง
2. Owner เลือก `Delete asset` / `ลบรายการ`
3. ระบบแสดง Delete Asset confirmation ก่อนลบ
4. หาก Owner ยืนยัน ระบบลบ Asset ตาม Asset Management rule
5. เมื่อ Delete สำเร็จ Asset ต้องหายจาก Feed, Search, Watch Alert และ Public Profile
6. Chat ที่เกี่ยวข้องยังอยู่ แต่ Reference Asset ต้องใช้ deleted asset state
7. Offer ที่เกี่ยวข้องต้องเป็น `Cancelled`

# 10. Business Rules

## Feed Visibility

- Feed แสดงเฉพาะ Asset สถานะ `Sale`
- Feed ต้องไม่แสดง Asset สถานะ `Show`, `Hide`, `Sold`
- Feed ต้องกรอง Asset ที่ผู้ใช้ไม่มีสิทธิ์มองเห็น
- Feed ต้องกรอง Asset ของผู้ใช้ที่ถูก Block หรือ Block กันอยู่
- Feed, Search และ Watch Alert ใช้ Sale-only rule เหมือนกัน

## Feed Tabs

| Tab | Rule |
| --- | --- |
| All | แสดง Asset `Sale` ทั้งหมดที่ผู้ใช้มีสิทธิ์มองเห็น |
| Following | แสดงเฉพาะ Asset `Sale` ของผู้ใช้ที่ Member กำลัง Follow |
| Favorites | แสดงเฉพาะ Asset `Sale` ที่ Member กด Like |

Guest ดู `All` ได้ แต่การเปิด `Following` หรือ `Favorites` ต้องแสดง Global Login Required Dialog

## Feed Card Required Display

Feed Card ต้องแสดง:

- Asset Images
- Brand
- Model
- Price
- Posted Time
- Owner Name
- Like Count
- Comment Count

## Feed Card Must Not Display In V1

Feed Card ต้องไม่แสดง:

- Location
- Verified Badge
- Status Badge

## Feed Actions

Feed รองรับ:

- Like / Unlike
- Swipe image
- เปิด Asset Detail
- เปิด Public Profile
- เปิด Full Screen Image Viewer
- Share Asset (system share sheet / copy public deep link)
- เมนูสามจุดสำหรับ Asset ของผู้อื่น:
  - Share Asset / แชร์รายการนี้
  - Hide this asset / ไม่ต้องการเห็นรายการนี้
  - Report Asset / รายงานรายการนี้
  - Block User / บล็อกผู้ใช้งาน
- เมนูสามจุดสำหรับ Asset ของ Owner:
  - Share Asset / แชร์รายการนี้
  - Edit asset / แก้ไขรายการ
  - Edit provenance / แก้ไขประวัติหรือข้อมูลฝากขาย
  - Mark as sold / บันทึกว่าขายแล้ว
  - Change status / เปลี่ยนสถานะ
  - Delete asset / ลบรายการ

Feed ไม่รองรับ:

- Comment จาก Feed โดยตรง

## Share Asset From Feed

1. User กด Share Asset จาก Feed Card หรือ Feed more menu
2. ระบบเปิด system share sheet หรือ copy public deep link fallback
3. Shared link เปิดแล้วไป Asset Detail

Share Asset from Feed rules:

- Share เป็น public share action สำหรับ Asset สถานะ `Sale` (Feed แสดงเฉพาะ `Sale`)
- Guest สามารถ Share ได้โดยไม่ต้อง Login
- Primary channel คือ system share sheet เมื่อ platform รองรับ
- Fallback คือ copy public deep link พร้อม copy success state
- Share ไม่สร้าง Notification Center item
- Shared deep link ต้อง validate asset status, deleted state, permission และ block state เมื่อเปิด (ดู [05_ASSET_DETAIL_MODULE.md](05_ASSET_DETAIL_MODULE.md) Deep Link Display State Rule)
- สำหรับ navigation หลังเปิด shared deep link ดู [00_NAVIGATION_AND_CROSS_MODULE_FLOW.md](00_NAVIGATION_AND_CROSS_MODULE_FLOW.md) Back Button And Main Navigation After Deep Link

## Hide Feed Item Rule

- Hide Feed Item เป็น user-level preference ของ viewer เท่านั้น
- Hide Feed Item ไม่ใช่ asset status `Hide`
- Hide Feed Item ไม่กระทบ Owner, ผู้ใช้อื่น, Public Profile, Offer หรือ Chat
- Hide Feed Item ต้องซ่อนเฉพาะ Asset นั้นจาก Feed ของผู้กด
- Hide Feed Item ไม่ทำให้ Asset หายจาก Search, Watch Alert Result หรือ Public Profile ใน V1 เว้นแต่มี block/moderation/status rule อื่น
- หลัง Hide สำเร็จต้องมี undo ชั่วคราว
- หากไม่ Undo ระบบต้องไม่แสดง Asset นั้นใน Feed ของผู้กดเมื่อ refresh/reload
- Hide Feed Item ไม่สร้าง Notification Center item

## Owner Feed Action Rule

- Owner Feed more menu ต้องแยกจาก more menu ของ Asset ผู้อื่น
- Owner Feed more menu รองรับ Edit asset, Edit provenance, Mark as sold, Change status และ Delete asset
- Owner Feed more menu แสดงเฉพาะ Asset status `Sale` เพราะ Feed แสดงเฉพาะรายการที่ขายอยู่
- Edit provenance ต้อง route ตาม active provenance type: `Owner (Asset)` ไป purchase history และ `Consignment` ไป consignment details
- Mark as sold จาก Feed เป็น shortcut ไป Sale Record Form โดยตรง ไม่ต้องผ่าน Edit Asset
- Change status จาก Feed เปิด Change Status sheet โดยตรง ไม่ต้องผ่าน Edit Asset
- หาก Change status จาก Feed สำเร็จเป็น `Show` หรือ `Hide` ต้องแสดง toast `Asset status updated.` และเอา card ออกจาก Feed ทันที
- Edit Asset ต้องไม่ให้เลือก `Sold` เป็น status ปกติ
- Delete asset จาก Feed ต้องใช้ Delete Asset confirmation เสมอ
- Delete asset ไม่มี Undo เพราะกระทบ public surfaces, Chat reference และ Offer status
- Sold Asset ไม่ควรถูก Delete ผ่าน Asset Management V1

## Like And Favorites Sync

- Like สำเร็จต้อง update Like Count ทันที
- Like สำเร็จต้องเพิ่ม Asset เข้า Favorites
- Unlike สำเร็จต้อง update Like Count ทันที
- Unlike สำเร็จต้องลบ Asset ออกจาก Favorites
- หาก Asset หลุดจาก `Sale` ต้องหายจาก Favorites list แม้เคย Like ไว้

## Lifecycle Impact

| Status Change | Feed Impact |
| --- | --- |
| `Sale` -> `Sold` | หายจาก Feed, Following, Favorites ทันที |
| `Sale` -> `Hide` | หายจาก Feed, Following, Favorites ทันที |
| `Hide` -> `Sale` | กลับเข้า Feed ทันที และกลับเข้า Following/Favorites ตามเงื่อนไข |
| `Show` -> `Sale` | แสดงใน Feed |
| `Sale` -> `Show` | หายจาก Feed |
| Deleted Asset | หายจาก Feed และ public surfaces |
| Reported Asset | ไม่หายจาก Feed ทันที จนกว่า Admin ดำเนินการ moderation |
| Hidden Feed Item | หายจาก Feed เฉพาะผู้กด hide และไม่กระทบผู้ใช้อื่น |
| Owner Mark as sold from Feed | เปิด Sale Record Form และเมื่อ confirm สำเร็จ Asset หายจาก Feed |
| ลบโดยเจ้าของจาก Feed | ต้องมี confirmation และเมื่อสำเร็จ Asset หายจาก Feed |

## Performance And Loading

- Feed ควรโหลดภายใน 2 วินาที
- รูปภาพต้อง Lazy Load
- Feed ต้องรองรับ Infinite Scroll
- ระหว่างโหลดรายการถัดไปต้องมี load-more state
- เมื่อ Scroll ถึงรายการสุดท้ายต้องแสดง `คุณดูรายการทั้งหมดแล้ว`
- V1 ไม่รองรับ Real-time Feed Refresh สำหรับ Asset ใหม่, Like จากอุปกรณ์อื่น หรือ Comment จากอุปกรณ์อื่น

## Feed Network States

หน้าฟีดต้องแยกสถานะ network ให้ชัดเจน เพื่อไม่ให้ผู้ใช้เห็นหน้าว่างหรือ loading ค้างเมื่อสัญญาณไม่ดี

| State | Trigger | UI Behavior | TH Copy | EN Copy |
| --- | --- | --- | --- | --- |
| Initial loading | ผู้ใช้เปิด Feed และยังไม่มีข้อมูลบนหน้าจอ | แสดง skeleton ของ Feed Card ในตำแหน่งรายการ ห้ามแสดงหน้าว่าง | ไม่ต้องมีข้อความ | No copy |
| Slow network | โหลดนานเกิน 2 วินาที แต่ request ยังไม่ fail | คง skeleton/loading ไว้ และแสดงข้อความเล็กใต้ search หรือเหนือ list | `กำลังโหลดข้อมูล อาจใช้เวลาสักครู่` | `Loading data. This may take a moment.` |
| Initial load failed, no cache | API fail หรือ timeout และไม่มี cached Feed | แสดง full-page error state กลางพื้นที่ list พร้อมปุ่ม `ลองใหม่` | Title: `โหลดฟีดไม่สำเร็จ` Body: `สัญญาณอินเทอร์เน็ตอาจไม่เสถียร กรุณาตรวจสอบการเชื่อมต่อแล้วลองอีกครั้ง` Button: `ลองใหม่` | Title: `Unable to load feed` Body: `Your internet connection may be unstable. Check your connection and try again.` Button: `Try again` |
| Offline, no cache | อุปกรณ์ offline ตั้งแต่เปิด Feed และไม่มี cached Feed | แสดง full-page offline state กลางพื้นที่ list พร้อมปุ่ม `ลองใหม่` | Title: `ไม่มีการเชื่อมต่ออินเทอร์เน็ต` Body: `เชื่อมต่ออินเทอร์เน็ตแล้วลองโหลดฟีดอีกครั้ง` Button: `ลองใหม่` | Title: `No internet connection` Body: `Connect to the internet and try loading the feed again.` Button: `Try again` |
| Offline with cache | อุปกรณ์ offline แต่เคยโหลด Feed สำเร็จมาก่อน | แสดง Feed Card จาก cache ต่อไป และมี offline banner ด้านบน list | `คุณกำลังออฟไลน์ ข้อมูลอาจไม่ใช่ข้อมูลล่าสุด` | `You are offline. This information may not be up to date.` |
| Refresh failed with existing data | ผู้ใช้ pull-to-refresh หรือ retry แล้ว fail แต่ยังมีข้อมูลเดิมบนหน้าจอ | คงข้อมูลเดิมไว้ ห้ามล้าง list และแสดง snackbar/banner สั้น ๆ พร้อม retry ได้ | `อัปเดตฟีดไม่สำเร็จ กรุณาลองใหม่` + `ลองใหม่` | `Unable to update feed. Please try again.` + `Retry` |
| Load more failed | Infinite Scroll โหลดหน้าถัดไปไม่สำเร็จ | คงรายการเดิมไว้ และแสดง inline retry ที่ท้าย list หลัง card สุดท้ายที่โหลดสำเร็จ | Title: `โหลดรายการฟีดเพิ่มเติมไม่สำเร็จ` Body: `ตรวจสอบการเชื่อมต่อแล้วลองอีกครั้ง` Button: `ลองใหม่` | Title: `Unable to load more feed items` Body: `Check your connection and try again.` Button: `Try again` |

Network state rules:

- ห้ามแสดง loading spinner ค้างเกิน timeout โดยไม่มีข้อความหรือ action
- ปุ่ม `ลองใหม่` ต้องเรียกโหลด Feed tab ปัจจุบันซ้ำ และต้อง track event `feed_retry_tapped`
- หากมี cache ต้องให้ cache สำคัญกว่า full-page error เพื่อให้ผู้ใช้ยังดู Feed ล่าสุดได้
- Offline/cached indicator ต้องไม่บัง tab, search, card action หรือ bottom navigation
- เมื่อ reconnect สำเร็จ ให้ refresh Feed แบบเงียบหรือผ่าน user action ตาม platform behavior และเอา offline banner ออกเมื่อข้อมูลใหม่โหลดสำเร็จ

## Feed Image Load States

กรณี Feed API โหลดข้อมูลสำเร็จ แต่รูป Asset โหลดไม่สำเร็จ ต้องถือเป็น image-level failure ไม่ใช่ Feed error

| State | Trigger | UI Behavior | TH Copy | EN Copy |
| --- | --- | --- | --- | --- |
| Image loading | Card data มาแล้ว แต่รูปยังโหลดอยู่ | แสดง image skeleton หรือ blurred placeholder ในพื้นที่รูป โดยพื้นที่ card ต้องไม่กระโดดหรือเปลี่ยนขนาด | ไม่ต้องมีข้อความ | No copy |
| Image failed | รูปหลักของ Feed Card โหลดไม่สำเร็จ | แสดง placeholder สี neutral ในพื้นที่รูป พร้อม icon รูปภาพ/แจ้งเตือน และให้ข้อมูล text ของ card แสดงต่อได้ครบ | `โหลดรูปไม่สำเร็จ` | `Image failed to load` |
| Retry image | ผู้ใช้กดพื้นที่ placeholder หรือปุ่ม retry เฉพาะรูป | โหลดรูปของ card นั้นใหม่เท่านั้น ห้าม reload ทั้ง Feed | `ลองโหลดรูปใหม่` | `Retry image` |
| Partial gallery failed | Asset มีหลายรูปและบางรูปโหลดไม่สำเร็จ | แสดงรูปที่โหลดได้ก่อน ถ้ารูปปัจจุบัน fail ให้แสดง placeholder เฉพาะ slide นั้น | `โหลดรูปไม่สำเร็จ` | `Image failed to load` |

Image failure rules:

- ห้ามซ่อน Feed Card เพียงเพราะรูปโหลดไม่สำเร็จ หากข้อมูล Asset โหลดสำเร็จแล้ว
- Brand, Model, Price, Owner Name, Posted Time, Like Count และ Comment Count ต้องยังแสดงและกด action ได้ตามสิทธิ์
- Placeholder ต้องใช้ขนาดเท่าพื้นที่รูปจริง เพื่อไม่ให้ layout กระโดด
- การ retry รูปต้อง retry เฉพาะ image request ของ card/slide นั้น ไม่ใช่ reload Feed ทั้งหน้า
- หากรูปโหลดไม่สำเร็จเพราะ offline และมี cached thumbnail ให้แสดง cached thumbnail ก่อน placeholder
- หากไม่มีรูปที่โหลดได้เลย ให้ยังเปิด Asset Detail ได้ แต่ Full Screen Image Viewer ต้องแสดง image unavailable state เฉพาะรูป

## Feed Owner Fallback States

กรณีข้อมูล Asset โหลดสำเร็จ แต่ข้อมูล Owner/Profile บางส่วนโหลดไม่สำเร็จ ต้อง fallback เฉพาะ owner row และห้ามซ่อนทั้ง Feed Card

| State | Trigger | UI Behavior | EN Copy / UI |
| --- | --- | --- | --- |
| Profile image failed, owner data loaded | รูปโปรไฟล์โหลดไม่สำเร็จ แต่ owner id และ display name มาแล้ว | ใช้ default avatar หรือ initials; ชื่อจริง, เวลา, Follow และ action ที่มี permission ชัดเจนยังแสดงได้ | Avatar fallback; keep actual seller name |
| Owner data loading | Owner/profile request ยัง pending | แสดง avatar/name/time skeleton; ซ่อนหรือ disable Follow และ more menu จนรู้ owner id/action permission | Skeleton only |
| Owner data failed, asset data loaded | Asset data มาแล้ว แต่ owner/profile resolve ไม่สำเร็จ | ใช้ default avatar, แสดง `Unknown seller`, ซ่อน Follow, ซ่อน owner-dependent menu | `Unknown seller` |
| Seller unavailable | Owner ถูกลบ unavailable หรือ blocked ตาม Trust & Safety | ใช้ default avatar, แสดง `Seller unavailable`, ซ่อน Follow และ owner actions | `Seller unavailable` |

Owner fallback rules:

- `Unknown seller` ใช้เฉพาะเมื่อ owner/profile request fail หลัง asset data โหลดสำเร็จแล้ว ไม่ใช้ระหว่าง loading
- ถ้า owner id หรือ follow state ไม่ชัด ห้ามแสดงปุ่ม `Follow`
- ถ้า more menu ต้องพึ่ง owner id ให้ซ่อนเมนู; ถ้ายังมี listing-level action ที่ valid เช่น report listing อาจแสดงเฉพาะ action นั้นได้
- ถ้าแค่รูปโปรไฟล์โหลดไม่สำเร็จ แต่ owner data มาแล้ว ให้ใช้ชื่อจริงของ seller และเปิด owner/profile action ได้ตาม permission

# 11. Permission Rules

| Actor | Permission |
| --- | --- |
| Guest | ดู Feed `All`, Asset Detail public, Public Profile, Like Count, Comment Count, Full Screen Image |
| Guest | ห้าม Like, Follow, Favorites, Following, Comment, Chat, Make Offer, Watch Alert, Add/Edit/Delete Asset, Hide this asset, Report Asset, Block User |
| Member | ใช้ Feed และ action ที่เกี่ยวข้องตาม visibility rule |
| Member | Hide this asset, Report Asset และ Block User ได้จากเมนูสามจุดของ Asset ผู้อื่น |
| Owner | Edit asset, Mark as sold และ Delete asset ได้จากเมนูสามจุดของ Asset ตัวเองตาม Asset Management rule |
| Blocked User | ไม่เห็น Asset ของอีกฝ่ายใน Feed |
| Admin | ไม่ใช่ primary actor ของ Feed V1 |

# 12. Validation Rules

- Asset ที่จะแสดงใน Feed ต้องมี status = `Sale`
- Asset ต้องผ่าน permission filtering
- Asset ต้องไม่อยู่ใน block relationship กับผู้ใช้ปัจจุบัน
- Asset ต้องไม่อยู่ใน user-level hidden feed item preference ของผู้ใช้ปัจจุบัน
- Like / Unlike ต้องตรวจสอบ authentication
- Hide this asset, Report Asset และ Block User ต้องตรวจสอบ authentication
- Report Asset จาก Feed ต้องใช้ Report type = `Asset`
- Report reason ต้องเป็น required
- Submit report ต้อง disabled จนกว่าจะเลือก reason
- Report Asset bottom sheet ที่ถูก dismiss โดยไม่ submit ต้องไม่สร้าง report
- Edit asset, Mark as sold และ Delete asset จาก Feed ต้องตรวจสอบ ownership
- Mark as sold จาก Feed ต้องเปิด Sale Record Form ก่อนเปลี่ยน status เป็น `Sold`
- Delete asset จาก Feed ต้องมี confirmation และห้ามทำแบบ Undo
- Following และ Favorites ต้องตรวจสอบ authentication
- Full Screen Image Viewer เปิดได้เฉพาะรูปของ Asset ที่ผู้ใช้มีสิทธิ์มองเห็น

# 13. Exception Handling

| Case | Expected Handling |
| --- | --- |
| โหลด Feed ไม่สำเร็จ | แสดง Error State และปุ่ม `ลองใหม่` |
| เน็ตช้าและ Feed ยังไม่ fail | แสดง loading/skeleton ต่อพร้อมข้อความ `กำลังโหลดข้อมูล อาจใช้เวลาสักครู่` |
| Offline แต่มี cache | แสดงข้อมูลล่าสุดที่โหลดไว้ พร้อม offline/cached indicator |
| Offline และไม่มี cache | แสดง empty/error state ที่สื่อว่าไม่มีข้อมูลพร้อม retry |
| Refresh fail แต่มีข้อมูลเดิม | คงข้อมูลเดิมไว้และแสดง snackbar/banner `อัปเดตฟีดไม่สำเร็จ กรุณาลองใหม่` |
| Load more fail | คงรายการเดิมไว้และแสดง inline retry ท้าย list |
| Feed data โหลดสำเร็จแต่รูปโหลดไม่ขึ้น | คง Feed Card ไว้ แสดง placeholder ในพื้นที่รูปพร้อม `โหลดรูปไม่สำเร็จ` และ retry เฉพาะรูป |
| Asset ถูกเปลี่ยนสถานะระหว่างดู Feed | ถ้าไม่ใช่ `Sale` ให้หายจาก Feed เมื่อ refresh หรือ sync |
| Asset owner ถูก Block | Asset ต้องหายจาก Feed ทันทีเมื่อข้อมูล sync |
| Asset ถูก Hide Feed Item โดยผู้ใช้ | Asset ต้องหายจาก Feed ของผู้ใช้นั้น แต่ไม่กระทบผู้ใช้อื่น |
| Hide Feed Item ล้มเหลว | คืน Asset กลับใน Feed และแสดง error ที่เหมาะสม |
| User กด Undo หลัง Hide Feed Item | นำ Asset กลับมาใน Feed ตาม state ที่เหมาะสม |
| Mark as sold สำเร็จจาก Feed | แสดง success state และนำ Asset ออกจาก Feed ทันที |
| Mark as sold ล้มเหลวจาก Feed | คง Asset ใน Feed และแสดง error ที่เหมาะสม |
| Delete Asset สำเร็จจาก Feed | แสดง success state และนำ Asset ออกจาก Feed ทันที |
| Delete Asset ล้มเหลวจาก Feed | คง Asset ใน Feed และแสดง error ที่เหมาะสม |
| Report Asset สำเร็จจาก Feed | แสดง success state แต่ไม่ทำให้ Asset หายจาก Feed ทันที |
| Report Asset ล้มเหลวจาก Feed | คง Asset ใน Feed และแสดง error ที่เหมาะสม |
| Report Asset bottom sheet ถูก dismiss | ไม่สร้าง report และ discard unsaved input ได้ |
| Guest ใช้ action ที่ต้อง Login | แสดง Global Login Required Dialog |
| Like / Unlike ล้มเหลว | คืนค่า UI เป็นสถานะก่อนหน้าและแสดง error ที่เหมาะสม |

# 14. Empty State

| State | Message / Behavior |
| --- | --- |
| All empty | แสดงว่าไม่มีรายการขายที่พร้อมแสดง |
| Following empty | แสดงว่าไม่มีรายการจากผู้ขายที่กำลัง Follow |
| Favorites empty | แสดงว่าไม่มีรายการที่กด Like |
| End of list | แสดง `คุณดูรายการทั้งหมดแล้ว` |

# 15. Notification Rules

- Feed ไม่สร้าง notification โดยตรง
- Like notification ถูกกำหนดใน Notification / Social Module
- Comment notification ต้องพาไป Asset Detail ไม่ใช่ comment action บน Feed
- Watch Alert notification ต้องพาไป Watch Alert Result List ไม่ใช่เปิด Asset Detail โดยตรง

# 16. Analytics Events

| Event | Trigger |
| --- | --- |
| `feed_viewed` | User เปิด Feed |
| `feed_tab_changed` | User เปลี่ยน tab |
| `feed_card_tapped` | User เปิด Asset Detail จาก Feed |
| `feed_owner_profile_tapped` | User เปิด Public Profile จาก Feed |
| `feed_asset_liked` | Member Like Asset จาก Feed |
| `feed_asset_unliked` | Member Unlike Asset จาก Feed |
| `feed_image_swiped` | User swipe รูปใน Feed Card |
| `feed_fullscreen_image_opened` | User เปิด Full Screen Image Viewer |
| `feed_more_menu_opened` | Member เปิดเมนูสามจุดบน Feed Card |
| `feed_asset_hidden` | Member เลือก Hide this asset |
| `feed_asset_hide_undone` | Member กด Undo หลัง Hide this asset |
| `feed_asset_report_tapped` | Member เลือก Report Asset จาก Feed |
| `feed_user_block_tapped` | Member เลือก Block User จาก Feed |
| `feed_owner_edit_asset_tapped` | Owner เลือก Edit asset จาก Feed |
| `feed_owner_mark_as_sold_tapped` | Owner เลือก Mark as sold จาก Feed |
| `feed_owner_delete_asset_tapped` | Owner เลือก Delete asset จาก Feed |
| `feed_load_more_triggered` | Infinite Scroll โหลดรายการถัดไป |
| `feed_retry_tapped` | User กด `ลองใหม่` ใน Error State |
| `feed_guest_login_required_shown` | Guest ใช้ action ที่ต้อง Login |

# 17. Acceptance Criteria

| ID | Criteria |
| --- | --- |
| AC-FEED-001 | Feed แสดงเฉพาะ Asset สถานะ `Sale` |
| AC-FEED-002 | Feed ไม่แสดง Asset สถานะ `Show`, `Hide`, `Sold` |
| AC-FEED-003 | Feed กรอง Asset ที่ผู้ใช้ไม่มีสิทธิ์มองเห็นออก |
| AC-FEED-004 | Feed กรอง Asset ของผู้ใช้ที่ถูก Block หรือ Block กันอยู่ออก |
| AC-FEED-005 | `All` แสดง Asset `Sale` ทั้งหมดที่ผู้ใช้มีสิทธิ์มองเห็น |
| AC-FEED-006 | `Following` แสดงเฉพาะ Asset `Sale` ของผู้ใช้ที่ Member กำลัง Follow |
| AC-FEED-007 | `Favorites` แสดงเฉพาะ Asset `Sale` ที่ Member กด Like |
| AC-FEED-008 | Guest กด `Following` หรือ `Favorites` แล้วต้องเห็น Global Login Required Dialog |
| AC-FEED-009 | Feed Card แสดง Asset Images, Brand, Model, Price, Posted Time, Owner Name, Like Count, Comment Count |
| AC-FEED-010 | Feed Card ไม่แสดง Location, Verified Badge หรือ Status Badge |
| AC-FEED-011 | Member สามารถ Like / Unlike จาก Feed และ Like Count ต้อง update เมื่อสำเร็จ |
| AC-FEED-012 | Like ต้องเพิ่ม Asset เข้า Favorites และ Unlike ต้องลบ Asset ออกจาก Favorites |
| AC-FEED-013 | Guest กด Like หรือ action ที่ต้อง Login แล้วต้องเห็น Global Login Required Dialog |
| AC-FEED-014 | Feed Card เปิด Asset Detail ได้ |
| AC-FEED-015 | Owner Name หรือ Profile area เปิด Public Profile ได้ |
| AC-FEED-016 | Feed รองรับ Swipe image และ Full Screen Image Viewer |
| AC-FEED-017 | Feed ไม่อนุญาต Comment จาก Feed โดยตรง แต่ Share Asset ทำได้จาก Feed |
| AC-FEED-017J | Feed more menu สำหรับ Asset ของผู้อื่นต้องมี Share Asset, Hide this asset, Report Asset และ Block User |
| AC-FEED-017K | Owner Feed more menu ต้องมี Share Asset, Edit asset, Edit provenance, Mark as sold, Change status และ Delete asset |
| AC-FEED-017L | Guest ต้อง Share Asset จาก Feed ได้โดยไม่ต้อง Login และ shared link ต้องเปิด Asset Detail |
| AC-FEED-017A | Feed more menu สำหรับ Asset ของผู้อื่นต้องมี Hide this asset, Report Asset และ Block User |
| AC-FEED-017B | Hide this asset ต้องซ่อน Asset เฉพาะ Feed ของผู้กด และไม่กระทบ Owner, ผู้ใช้อื่น, Public Profile, Offer หรือ Chat |
| AC-FEED-017C | Hide this asset ต้องมี Undo ชั่วคราว และถ้าไม่ Undo ต้องไม่กลับมาใน Feed หลัง refresh/reload |
| AC-FEED-017D | Report Asset จาก Feed ต้องเปิด Trust & Safety Report Asset bottom sheet และไม่ทำให้ Asset หายทันที |
| AC-FEED-017D-1 | Report Asset bottom sheet ต้องไม่มี Cancel button และต้องปิดได้ด้วย drag down, tap backdrop หรือ system back |
| AC-FEED-017D-2 | Report Asset bottom sheet ที่ถูก dismiss โดยไม่ submit ต้องไม่สร้าง report |
| AC-FEED-017D-3 | Submit report button ต้อง disabled จนกว่า Member จะเลือก reason |
| AC-FEED-017E | Block User จาก Feed ต้องมี confirmation และเมื่อ block สำเร็จ Asset/content ของ user นั้นต้องหายจาก Feed ตาม Trust & Safety rule |
| AC-FEED-017F | Owner Feed more menu ต้องมี Edit asset, Edit provenance, Mark as sold, Change status และ Delete asset |
| AC-FEED-017G | Mark as sold จาก Feed ต้องเปิด Sale Record Form โดยตรง และไม่ต้องผ่าน Edit Asset |
| AC-FEED-017H | Delete asset จาก Feed ต้องมี confirmation, ไม่มี Undo และเมื่อสำเร็จ Asset ต้องหายจาก Feed |
| AC-FEED-017I | Change status จาก Feed ต้องเปิด Change Status sheet และหากเปลี่ยนเป็น Show หรือ Hide สำเร็จต้องแสดง `Asset status updated.` พร้อมเอา card ออกจาก Feed ทันที |
| AC-FEED-018 | Feed รองรับ Infinite Scroll และมี load-more state |
| AC-FEED-019 | เมื่อ Scroll ถึงท้ายรายการต้องแสดง `คุณดูรายการทั้งหมดแล้ว` |
| AC-FEED-020 | โหลด Feed ไม่สำเร็จต้องแสดง Error State และปุ่ม `ลองใหม่` |
| AC-FEED-021 | Offline ต้องแสดงข้อมูลล่าสุดที่โหลดไว้ได้อย่างน้อยสำหรับ Feed |
| AC-FEED-021A | หากเน็ตช้าเกิน 2 วินาทีแต่ request ยังไม่ fail ต้องแสดง loading/skeleton พร้อมข้อความ `กำลังโหลดข้อมูล อาจใช้เวลาสักครู่` |
| AC-FEED-021B | หาก Offline และไม่มี cache ต้องแสดง full-page offline state พร้อมปุ่ม `ลองใหม่` และต้องไม่แสดง Feed ว่าง |
| AC-FEED-021C | หาก refresh หรือ load more fail แต่มีข้อมูลเดิม ต้องคงข้อมูลเดิมไว้และแสดง retry state เฉพาะจุดที่ fail |
| AC-FEED-021D | หาก Feed data โหลดสำเร็จแต่รูปโหลดไม่สำเร็จ ต้องคง Feed Card และข้อมูล text ไว้ พร้อม image placeholder และ retry เฉพาะรูป |
| AC-FEED-022 | เมื่อ Asset เปลี่ยนจาก `Sale` เป็น `Sold`, `Hide` หรือ `Show` ต้องหายจาก Feed ตาม lifecycle rule |
| AC-FEED-023 | Feed ต้อง Lazy Load รูปภาพ และควรโหลดภายใน 2 วินาที |
| AC-FEED-024 | V1 ไม่รองรับ Real-time Feed Refresh สำหรับ Asset ใหม่, Like จากอุปกรณ์อื่น หรือ Comment จากอุปกรณ์อื่น |

# 18. Related Modules

- [03_SEARCH_FILTER_MODULE.md](03_SEARCH_FILTER_MODULE.md)
- [05_ASSET_DETAIL_MODULE.md](05_ASSET_DETAIL_MODULE.md)
- [06_PROFILE_MODULE.md](06_PROFILE_MODULE.md)
- [10_WATCH_ALERT_MODULE.md](10_WATCH_ALERT_MODULE.md)
- [11_SOCIAL_MODULE.md](11_SOCIAL_MODULE.md)
- [15_TRUST_SAFETY_MODULE.md](15_TRUST_SAFETY_MODULE.md)

# 19. Future Enhancement

- Personalized ranking
- Feed recommendation model
- Real-time Feed Refresh
- Saved feed preferences
- Advanced marketplace sorting
- Sponsored listing
