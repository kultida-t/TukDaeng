# 02 Feed Module

**FO Functional PRD v2.0**  
**Status:** Approved & Locked Draft  
**Note:** Pending MD Generation

## Document Information

| Field | Detail |
| --- | --- |
| Module Name | Feed |
| Version | 2.0 |
| Status | Approved & Locked Draft |
| Owner | Tuk Daeng Project |
| Document Type | FO Functional PRD |

### Prototype Reference

- `Menu Feed.png`
- `Detail asset viewer.png`
- `Detail asset owner.png`
- `Main Viewer Profile.png`
- `Main Owner Profile.png`

## 1. Purpose

Feed Module เป็น Marketplace หลักของระบบ

ใช้สำหรับ:

- แสดงรายการนาฬิกาที่เปิดขายในระบบ
- ช่วยให้ผู้ซื้อค้นหานาฬิกาที่สนใจ
- เข้าถึง Asset Detail
- เข้าถึง Public Profile ของเจ้าของ Asset
- ติดตามนาฬิกาที่สนใจผ่าน Favorites
- ติดตามผู้ขายผ่าน Following

Feed ไม่ใช่ Social Feed

เป้าหมายหลักคือช่วยให้ผู้ซื้อค้นหาและเข้าถึงนาฬิกาที่เปิดขายอยู่ในระบบ

## 2. Screen Mapping

### Feed Tabs

| Tab | Description |
| --- | --- |
| All | แสดง Asset Sale ทั้งหมดที่ User มีสิทธิ์มองเห็น |
| Following | แสดงเฉพาะ Asset Sale ของ User ที่กำลัง Follow |
| Favorites | แสดงเฉพาะ Asset Sale ที่ User กด Like |

## 3. User State

### Guest

สามารถ:

- ดู Feed
- ดู Asset Detail
- ดู Public Profile
- ดู Like Count
- ดู Comment Count
- ดู Full Screen Image

ไม่สามารถ:

- Like
- Follow
- Chat
- Make Offer
- เปิด Favorites
- เปิด Following

หากกดใช้งาน Feature ที่ต้อง Login ให้แสดง:

- Global Login Required Dialog

### Member

- ใช้งาน Feed ได้ทั้งหมดตามสิทธิ์ของ User

### Blocked Relationship

เมื่อ User Block กัน จะไม่เห็น Asset ของกันและกันใน:

- Feed
- Search Result
- Watch Alert Result

## 4. User Flow

### Browse Feed

```text
Feed
→ เลื่อนดูรายการ
→ เปิด Asset Detail
→ ดูข้อมูลเพิ่มเติม
```

### Like Asset

```text
Feed
→ Like
→ Update Like Count
→ เพิ่มเข้า Favorites
```

### Unlike Asset

```text
Feed
→ Unlike
→ Update Like Count
→ ลบออกจาก Favorites
```

### View Full Screen Image

```text
Feed
→ Tap Image
→ Full Screen Image Viewer
→ Swipe ดูรูปอื่นใน Asset เดียวกัน
```

### Open Owner Profile

```text
Feed
→ Tap Owner Name
→ Public Profile
```

### Open Asset From Notification

```text
Notification
→ Feed Deep Link
→ Asset Detail
```

## 5. Business Rules

### Feed Visibility Rule

Feed แสดงเฉพาะ:

- Asset สถานะ Sale
- Asset ที่ User มีสิทธิ์มองเห็น
- Asset ของ User ที่ไม่ถูก Block และไม่ได้ Block กัน

ไม่แสดง:

- Show
- Hide
- Sold

### Feed Sorting

- เรียงตาม `Created Date DESC`
- ล่าสุดขึ้นก่อน

### Owner Visibility

- Owner เห็น Asset ของตัวเองใน Feed

### Following Feed

- แสดงเฉพาะ Asset สถานะ Sale ของ User ที่กำลัง Follow

### Favorites Feed

- แสดงเฉพาะ Asset สถานะ Sale ที่ User กด Like
- หาก Asset ใน Favorites ถูกเปลี่ยนเป็น Sold ต้องหายจาก Favorites ทันที

### Feed Card Display

แสดง:

- Asset Images
- Brand
- Model
- Price
- Posted Time
- Owner Name
- Like Count
- Comment Count

ไม่แสดงใน V1:

- Location
- Verified Badge
- Status Badge

### Feed Card Actions

สามารถ:

- Like
- Swipe Images
- Open Asset Detail
- Open Public Profile
- Open Full Screen Image Viewer

ไม่สามารถ:

- Comment จาก Feed
- Share จาก Feed

Comment และ Share ต้องทำจาก Asset Detail เท่านั้น

### Full Screen Image Viewer

- ผู้ใช้สามารถกดรูปจาก Feed Card เพื่อเปิด Full Screen Image Viewer
- ผู้ใช้สามารถ Swipe ดูรูปอื่นของ Asset เดียวกันได้

### Asset Status Change

#### Sale → Sold

Asset หายจากรายการต่อไปนี้ทันที:

- Feed
- Following
- Favorites
- Search
- Watch Alert

#### Sale → Hide

Asset หายจากรายการต่อไปนี้ทันที:

- Feed
- Following
- Favorites
- Search
- Watch Alert

#### Hide → Sale

Asset กลับเข้าสู่รายการต่อไปนี้ทันที:

- Feed
- Following
- Favorites
- Search
- Watch Alert

### Edit Asset

- Feed Update ทันที
- ไม่เปลี่ยนลำดับ Feed

### Delete Asset

#### Owner Delete

- Asset หายจาก Feed ทันที

#### Admin Delete

- Asset หายจาก Feed แบบ Real-time

### Block User

เมื่อ Block แล้ว:

- Asset ของผู้ถูก Block หายจาก Feed ทันที

### Report Asset

- Report ไม่ทำให้ Asset หายจาก Feed
- Asset จะหายเมื่อ Admin ดำเนินการ

### Feed Update Behavior

รองรับ Local UI Update สำหรับ:

- Like
- Unlike
- Follow
- Unfollow
- Block User
- Edit Asset
- Delete Asset
- Sale → Sold
- Hide → Sale

หาก Backend Error:

- Rollback UI
- Error Toast

### Feed Refresh And Pagination Behavior

Feed ต้องรองรับ:

- Pull To Refresh
- Infinite Scroll
- Reload Feed
- โหลดข้อมูลล่าสุดที่เคยโหลดไว้เมื่ออินเทอร์เน็ตขาดหาย

เมื่อ Scroll ถึงรายการสุดท้าย ต้องแสดงข้อความ:

```text
คุณดูรายการทั้งหมดแล้ว
```

หากโหลด Feed ไม่สำเร็จ ต้องแสดง Error State พร้อมปุ่ม:

- ลองใหม่

V1 ไม่รองรับ Real-time Feed Refresh สำหรับ:

- Asset ใหม่
- Like จากอุปกรณ์อื่น
- Comment จากอุปกรณ์อื่น

### Feed State Persistence

- เมื่อ User Scroll Feed ลงไป เปิด Asset Detail และกด Back ต้องกลับมายังตำแหน่งเดิมของ Feed
- เมื่อเปิดแอปใหม่ Feed ต้องเปิดที่ Tab All เสมอ
- ระบบไม่ต้องจำ Tab ล่าสุดหลังเปิดแอปใหม่

## 6. Permission Rules

### Guest

ดูได้:

- Feed
- Asset Detail
- Public Profile
- Like Count
- Comment Count
- Full Screen Image

ใช้งานไม่ได้:

- Like
- Favorites
- Following
- Follow
- Chat
- Offer

### Member

- ใช้งานได้ทั้งหมดตามสิทธิ์ของ User

## 7. Validation Rules

ไม่มี Validation โดยตรงใน Feed

Validation อยู่ใน:

- Asset Module
- Like Module
- Follow Module

## 8. Exception Handling

### Asset Deleted

| Language | Message |
| --- | --- |
| TH | รายการนี้ไม่พร้อมใช้งานแล้ว |
| EN | This item is no longer available. |

ปุ่ม:

- กลับ

### Feed Error

| Language | Message |
| --- | --- |
| TH | เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง |
| EN | Something went wrong. Please try again. |

ปุ่ม:

- ลองใหม่

## 9. Empty State

| Language | Message |
| --- | --- |
| TH | ไม่พบข้อมูล |
| EN | No data found |

ใช้กับ:

- Feed
- Following
- Favorites

## 10. Notification Rules

- Feed ไม่สร้าง Notification
- รองรับ Deep Link จาก Like Notification โดยเปิด Asset Detail
- รองรับ Deep Link จาก Comment Notification โดยเปิด Asset Detail และโฟกัส Comment ที่เกี่ยวข้อง

## 11. Analytics Events

- Feed Open
- Feed Refresh
- Feed Infinite Scroll Load
- Asset Click
- Full Screen Image Open
- Like Asset
- Unlike Asset
- Open Public Profile
- Open Asset From Notification

## 12. Acceptance Criteria

### Feed Tabs

| AC ID | Criteria |
| --- | --- |
| AC-FEED-005 | Tab All ต้องแสดง Asset Sale ทั้งหมดที่ User มีสิทธิ์มองเห็น |
| AC-FEED-006 | Tab Following ต้องแสดงเฉพาะ Asset Sale ของ User ที่กำลัง Follow |
| AC-FEED-007 | Tab Favorites ต้องแสดงเฉพาะ Asset Sale ที่ User กด Like |
| AC-FEED-008 | หาก Asset ใน Favorites ถูกเปลี่ยนเป็น Sold Asset ต้องหายจาก Favorites ทันที |

### Guest User

| AC ID | Criteria |
| --- | --- |
| AC-FEED-009 | Guest ต้องสามารถดู Feed, Asset Detail, Public Profile, Like Count, Comment Count และ Full Screen Image ได้ |
| AC-FEED-010 | Guest ไม่สามารถ Like, Follow, Chat, Make Offer, เปิด Favorites และเปิด Following ได้ |
| AC-FEED-011 | เมื่อ Guest พยายามใช้งาน Feature ที่ต้อง Login ต้องแสดง Global Login Required Dialog |

### Feed Card

| AC ID | Criteria |
| --- | --- |
| AC-FEED-012 | Feed Card ต้องแสดง Asset Images, Brand, Model, Price, Posted Time, Owner Name, Like Count และ Comment Count |
| AC-FEED-013 | Feed Card ต้องไม่แสดง Location, Verified Badge และ Status Badge ใน V1 |
| AC-FEED-014 | ผู้ใช้ต้องสามารถ Swipe รูปภายใน Feed Card ได้ |
| AC-FEED-015 | ผู้ใช้ต้องสามารถกดรูปเพื่อเปิด Full Screen Image Viewer ได้ |
| AC-FEED-016 | ภายใน Full Screen Image Viewer ผู้ใช้ต้องสามารถ Swipe ดูรูปอื่นของ Asset เดียวกันได้ |

### Feed Actions

| AC ID | Criteria |
| --- | --- |
| AC-FEED-017 | ผู้ใช้สามารถกด Like จาก Feed ได้ |
| AC-FEED-018 | เมื่อ Like สำเร็จ Like Count ต้องอัปเดตทันที และ Asset ต้องถูกเพิ่มเข้า Favorites |
| AC-FEED-019 | เมื่อ Unlike สำเร็จ Like Count ต้องอัปเดตทันที และ Asset ต้องถูกลบออกจาก Favorites |
| AC-FEED-020 | Feed ต้องไม่รองรับการ Comment จาก Feed โดยตรง |
| AC-FEED-021 | Feed ต้องไม่รองรับการ Share จาก Feed โดยตรง |
| AC-FEED-022 | Comment และ Share ต้องทำผ่าน Asset Detail เท่านั้น |

### Asset Lifecycle

| AC ID | Criteria |
| --- | --- |
| AC-FEED-023 | เมื่อ Asset เปลี่ยนสถานะ Sale → Sold Asset ต้องหายจาก Feed, Following, Favorites, Search และ Watch Alert ทันที |
| AC-FEED-024 | เมื่อ Asset เปลี่ยนสถานะ Sale → Hide Asset ต้องหายจาก Feed, Following, Favorites, Search และ Watch Alert ทันที |
| AC-FEED-025 | เมื่อ Asset เปลี่ยนสถานะ Hide → Sale Asset ต้องกลับเข้าสู่ Feed, Following, Favorites, Search และ Watch Alert ทันที |
| AC-FEED-026 | เมื่อ Owner แก้ไข Asset ข้อมูลบน Feed ต้องอัปเดตทันที แต่ลำดับ Feed ต้องไม่เปลี่ยน |
| AC-FEED-027 | เมื่อ Owner ลบ Asset Asset ต้องหายจาก Feed ทันที |
| AC-FEED-028 | เมื่อ Admin ลบ Asset Asset ต้องหายจาก Feed แบบ Real-time |

### Block & Report

| AC ID | Criteria |
| --- | --- |
| AC-FEED-029 | เมื่อ User Block ผู้ใช้อีกคน Asset ของผู้ถูก Block ต้องหายจาก Feed ทันที |
| AC-FEED-030 | การ Report Asset ต้องไม่ทำให้ Asset หายจาก Feed จนกว่า Admin จะดำเนินการ |

### Feed Refresh

| AC ID | Criteria |
| --- | --- |
| AC-FEED-031 | Feed ต้องรองรับ Pull To Refresh |
| AC-FEED-032 | Feed ต้องรองรับ Infinite Scroll |
| AC-FEED-033 | เมื่อ Scroll ถึงรายการสุดท้าย ต้องแสดงข้อความ `คุณดูรายการทั้งหมดแล้ว` |
| AC-FEED-034 | Feed ต้องรองรับการแสดงข้อมูลล่าสุดที่โหลดไว้ หากอินเทอร์เน็ตขาดหาย |
| AC-FEED-035 | หากโหลด Feed ไม่สำเร็จ ต้องแสดง Error State พร้อมปุ่ม `ลองใหม่` |

### Feed State Persistence

| AC ID | Criteria |
| --- | --- |
| AC-FEED-036 | เมื่อ User Scroll Feed ลงไป เปิด Asset Detail และกด Back ระบบต้องกลับมายังตำแหน่งเดิมของ Feed |
| AC-FEED-037 | เมื่อเปิดแอปใหม่ Feed ต้องเปิดที่ Tab All เสมอ และไม่จำ Tab ล่าสุด |

### Notification Integration

| AC ID | Criteria |
| --- | --- |
| AC-FEED-038 | เมื่อเปิด Feed ผ่าน Like Notification ต้องเปิด Asset Detail |
| AC-FEED-039 | เมื่อเปิด Feed ผ่าน Comment Notification ต้องเปิด Asset Detail และโฟกัส Comment ที่เกี่ยวข้อง |

## 13. Related Modules

- Asset Module
- Asset Detail Module
- Profile Module
- Search & Filter Module
- Watch Alert Module
- Notification Module
- Trust & Safety Module

## 14. Future Enhancement

- Feed Recommendation
- Trending Asset
- Featured Asset
- Sponsored Asset
- Personalized Feed
