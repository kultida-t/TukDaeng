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
| Supported actions | Like / Unlike, Swipe image, เปิด Asset Detail, เปิด Public Profile, เปิด Full Screen Image Viewer |
| Unsupported actions | ไม่รองรับ Comment หรือ Share จาก Feed โดยตรง |
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
| High | ยังไม่เห็น Guest restriction state | Guest กด Like, Follow, Chat, Offer, Favorites, Following ต้องเจอ Global Login Required Dialog | เพิ่ม dialog/state สำหรับ guest interaction |
| High | ยังไม่เห็น Feed load more / Infinite Scroll state | Feed ต้องรองรับ Infinite Scroll | เพิ่ม loading state ระหว่างโหลดรายการถัดไป |
| High | ยังไม่เห็น End-of-list state | เมื่อ Scroll ถึงท้ายรายการต้องแสดง `คุณดูรายการทั้งหมดแล้ว` | เพิ่ม state ท้ายรายการ |
| High | ยังไม่เห็น Feed Error state พร้อม retry | โหลด Feed ไม่สำเร็จต้องแสดง Error State และปุ่ม `ลองใหม่` | เพิ่ม error screen/state พร้อม retry |
| High | ยังไม่เห็น Offline cached data state | Feed ต้องแสดงข้อมูลล่าสุดที่โหลดไว้เมื่อ Offline | เพิ่ม offline/cached state หรือ banner |
| Medium | Feed Card ยังไม่ยืนยัน required fields ครบ | Card ต้องแสดง Asset Images, Brand, Model, Price, Posted Time, Owner Name, Like Count, Comment Count | ตรวจและ annotate card fields ให้ครบ |
| Medium | Feed อาจสื่อว่า Comment / Share ทำจาก Feed ได้ | Comment และ Share ต้องทำผ่าน Asset Detail เท่านั้น | ตัดหรือปรับ action ที่ทำให้เข้าใจผิด |
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
- Share จาก Feed โดยตรง
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

เมื่อ Guest ใช้ feature ที่ต้อง Login ระบบต้องแสดง Global Login Required Dialog

## Member

Member สามารถใช้ Feed ได้ตามสิทธิ์และ visibility rule ของระบบ รวมถึง Like / Unlike, เปิด Following, เปิด Favorites, เปิด Asset Detail, เปิด Public Profile และเปิด Full Screen Image Viewer

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
3. Comment และ Share ต้องทำจาก Asset Detail เท่านั้น

## Open Public Profile

1. User กด Owner Name หรือ Profile area
2. ระบบเปิด Public Profile ของเจ้าของ Asset
3. หากถูก Block หรือไม่มีสิทธิ์ดู ให้แสดง unavailable state ตาม Trust & Safety rule

## Image Interaction

1. User swipe รูปใน Feed Card
2. ระบบเปลี่ยนรูปตาม gallery ของ Asset
3. User กดรูปเพื่อเปิด Full Screen Image Viewer

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

Feed ไม่รองรับ:

- Comment จาก Feed โดยตรง
- Share จาก Feed โดยตรง

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

## Performance And Loading

- Feed ควรโหลดภายใน 2 วินาที
- รูปภาพต้อง Lazy Load
- Feed ต้องรองรับ Infinite Scroll
- ระหว่างโหลดรายการถัดไปต้องมี load-more state
- เมื่อ Scroll ถึงรายการสุดท้ายต้องแสดง `คุณดูรายการทั้งหมดแล้ว`
- V1 ไม่รองรับ Real-time Feed Refresh สำหรับ Asset ใหม่, Like จากอุปกรณ์อื่น หรือ Comment จากอุปกรณ์อื่น

# 11. Permission Rules

| Actor | Permission |
| --- | --- |
| Guest | ดู Feed `All`, Asset Detail public, Public Profile, Like Count, Comment Count, Full Screen Image |
| Guest | ห้าม Like, Follow, Favorites, Following, Comment, Chat, Make Offer, Watch Alert, Add/Edit/Delete Asset |
| Member | ใช้ Feed และ action ที่เกี่ยวข้องตาม visibility rule |
| Blocked User | ไม่เห็น Asset ของอีกฝ่ายใน Feed |
| Admin | ไม่ใช่ primary actor ของ Feed V1 |

# 12. Validation Rules

- Asset ที่จะแสดงใน Feed ต้องมี status = `Sale`
- Asset ต้องผ่าน permission filtering
- Asset ต้องไม่อยู่ใน block relationship กับผู้ใช้ปัจจุบัน
- Like / Unlike ต้องตรวจสอบ authentication
- Following และ Favorites ต้องตรวจสอบ authentication
- Full Screen Image Viewer เปิดได้เฉพาะรูปของ Asset ที่ผู้ใช้มีสิทธิ์มองเห็น

# 13. Exception Handling

| Case | Expected Handling |
| --- | --- |
| โหลด Feed ไม่สำเร็จ | แสดง Error State และปุ่ม `ลองใหม่` |
| Offline แต่มี cache | แสดงข้อมูลล่าสุดที่โหลดไว้ พร้อม offline/cached indicator |
| Offline และไม่มี cache | แสดง empty/error state ที่สื่อว่าไม่มีข้อมูลพร้อม retry |
| Asset ถูกเปลี่ยนสถานะระหว่างดู Feed | ถ้าไม่ใช่ `Sale` ให้หายจาก Feed เมื่อ refresh หรือ sync |
| Asset owner ถูก Block | Asset ต้องหายจาก Feed ทันทีเมื่อข้อมูล sync |
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
| AC-FEED-017 | Feed ไม่อนุญาต Comment หรือ Share จาก Feed โดยตรง |
| AC-FEED-018 | Feed รองรับ Infinite Scroll และมี load-more state |
| AC-FEED-019 | เมื่อ Scroll ถึงท้ายรายการต้องแสดง `คุณดูรายการทั้งหมดแล้ว` |
| AC-FEED-020 | โหลด Feed ไม่สำเร็จต้องแสดง Error State และปุ่ม `ลองใหม่` |
| AC-FEED-021 | Offline ต้องแสดงข้อมูลล่าสุดที่โหลดไว้ได้อย่างน้อยสำหรับ Feed |
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
