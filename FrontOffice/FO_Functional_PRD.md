# Tuk Daeng App

**FO Functional PRD v2.0**  
**Document:** Project Vision & Confirmed Requirements Summary

## 1. เป้าหมายของแอปพลิเคชัน

Tuk Daeng เป็น Marketplace Community สำหรับซื้อขาย สะสม และติดตามนาฬิกาหรู

เป้าหมายหลัก:

- ช่วยให้ผู้ซื้อค้นหานาฬิกาที่ต้องการได้ง่าย
- ช่วยให้ผู้ขายสามารถลงขายและบริหาร Asset ของตนเองได้

ขอบเขตที่ไม่ใช่เป้าหมายของระบบ:

- ไม่ใช่ Social Network
- ไม่ใช่ E-commerce
- ไม่มีระบบชำระเงินภายในแอป

## 2. แนวทางการทำเอกสารที่ต้องการ

สิ่งที่ต้องการจาก PRD:

- Functional Requirement
- Business Rule
- User Flow
- Permission
- Validation
- Exception
- Acceptance Criteria

สิ่งที่ไม่ใช่เป้าหมายของเอกสารนี้:

- ไม่ใช่ Technical Design
- ไม่ใช่ API Design
- ไม่ใช่ Database Design

เอกสารต้องตอบคำถามได้ครบเพื่อให้:

- Dev ไม่ต้องเดา
- QA ไม่ต้องเดา
- AI สามารถสร้างระบบได้จากเอกสาร

## 3. Scope ของ FO

### Authentication

- Sign Up
- OTP Verification
- Sign In
- Forgot Password
- Reset Password
- Change Password
- Sign Out

### Feed

- Marketplace หลัก
- แสดงเฉพาะ Asset สถานะ Sale

### Search & Filter

- ค้นหา Asset ที่เปิดขาย
- แสดงเฉพาะ Sale

### Asset

- Add Asset
- Edit Asset
- Delete Asset
- Change Status
- Asset Detail

### Profile

- Owner Profile
- Public Profile

### Chat

- สนทนาระหว่างผู้ซื้อและผู้ขาย

### Offer

- เสนอราคา

### Watch Alert

- แจ้งเตือน Asset ที่ตรงเงื่อนไข

### Notification

- ศูนย์กลางการแจ้งเตือน

### Social

- Like
- Comment
- Follow

### Board

- Community Board

### Settings

- ตั้งค่าบัญชี

### Portfolio

- วิเคราะห์ Asset ที่ถือครอง

### Trust & Safety

- Block User
- Report User
- Report Asset
- Report Comment
- Moderation

## 4. Asset Status Model

ระบบใช้สถานะ:

- Sale
- Show
- Hide
- Sold

### Visibility Matrix

| Status | Owner Profile | Public Profile | Feed | Search | Watch Alert |
| --- | --- | --- | --- | --- | --- |
| Sale | แสดง | แสดง | แสดง | แสดง | แสดง |
| Show | แสดง | แสดง | ไม่แสดง | ไม่แสดง | ไม่แสดง |
| Hide | แสดงเฉพาะ Owner | ไม่แสดง | ไม่แสดง | ไม่แสดง | ไม่แสดง |
| Sold | แสดงเฉพาะ Owner | ไม่แสดง | ไม่แสดง | ไม่แสดง | ไม่แสดง |

สรุปเงื่อนไข:

- Sale แสดงใน Owner Profile, Public Profile, Feed, Search และ Watch Alert
- Show แสดงใน Owner Profile และ Public Profile เท่านั้น
- Hide เห็นเฉพาะเจ้าของใน Owner Profile เท่านั้น
- Sold เห็นเฉพาะเจ้าของใน Owner Profile เท่านั้น
- Hide และ Sold ไม่ Public, ไม่ขึ้น Feed, ไม่ขึ้น Search และไม่ขึ้น Watch Alert

## 5. Feed Visibility Rule

- Feed แสดงเฉพาะ Asset สถานะ Sale เท่านั้น

## 6. Search Visibility Rule

- Search แสดงเฉพาะ Asset สถานะ Sale เท่านั้น

## 7. Watch Alert Rule

- Watch Alert Match เฉพาะ Asset สถานะ Sale เท่านั้น

## 8. Public Profile Rule

Public Profile เห็น:

- Sale
- Show

Public Profile ไม่เห็น:

- Hide
- Sold

### Owner Profile Rule

Owner Profile เห็น Asset ของเจ้าของทุกสถานะ:

- Sale
- Show
- Hide
- Sold

## 9. Sold Asset Rule

Sold Asset:

- ไม่ Public
- เห็นเฉพาะ Owner
- ไม่ขึ้น Feed
- ไม่ขึ้น Search
- ไม่ขึ้น Watch Alert

เก็บไว้เพื่อ:

- Sales History
- Portfolio
- Admin Review

## 10. Global Empty State

ทุกหน้าที่ไม่มีข้อมูลใช้ข้อความเดียวกัน:

| Language | Message |
| --- | --- |
| TH | ไม่พบข้อมูล |
| EN | No data found |

## 11. Global Login Required Dialog

Guest กด Feature ที่ต้อง Login ให้ใช้ Dialog เดียวกันทั้งระบบ

ตัวอย่าง Feature ที่ต้อง Login:

- Like
- Follow
- Offer
- Chat
- Favorites
- Following

## 12. Chat Module

### Room Creation

- สร้างห้องเมื่อส่งข้อความแรก

### Same Asset

- ใช้ห้องเดิม

### Different Asset

- ใช้ห้องเดิม
- `Reference Asset` เปลี่ยนเป็น Asset ล่าสุด

### Asset Deleted

- Chat ยังอยู่
- `Reference Asset` แสดงว่า `รายการนี้ไม่พร้อมใช้งานแล้ว`

### Asset Sold

- Chat ยังใช้งานได้

### Search Chat

- รองรับ

### Block User

- รองรับ

### Report User

- รองรับ

## 13. Offer Module

- Make Offer ผ่าน Asset Detail เท่านั้น
- Accepted Offer เปิด Chat Room
- Rejected Offer เปิด Asset Detail

### Asset Deleted

- Offer กลายเป็น Cancelled

### Sold

- Auto Reject Offer อื่น

## 14. Notification Module

Notification รองรับ:

- Like
- Comment
- Follow
- Offer
- Watch Alert

### Notification Destination

| Notification | Destination |
| --- | --- |
| Watch Alert Notification | เปิด Watch Alert Result List ไม่เปิด Asset ตรง |
| Like Notification | เปิด Asset Detail |
| Comment Notification | เปิด Asset Detail และ Focus Comment |

## 15. Social Module

### Like

- Owner กด Like Asset ตัวเองได้

### Comment

- รองรับ IG-style one-level replies ใต้ comment หลัก
- ไม่รองรับ multi-level nested thread หรือ reply ซ้อนเกิน 1 ชั้น
- ไม่มี Edit Comment ใน V1
- รองรับ Delete Comment

### Follow

- รองรับ

## 16. Watch Alert

- สร้างจากหน้า Search Filter
- ไม่มี Required Field
- Match เฉพาะ Sale
- เปิด Notification แล้วไป Result List

## 17. Portfolio

Portfolio เป็น Private และเห็นเฉพาะ Owner

คำนวณจาก:

- Sale
- Show
- Hide

ไม่รวม:

- Sold

### Sold History

เก็บข้อมูล:

- Sale Date
- Buyer
- Contact
- Sale Price
- Payment Method
- Attachment

## 18. Trust & Safety

### Block User

เมื่อ Block แล้ว Asset ของผู้ถูก Block หายจากรายการต่อไปนี้ทันที:

- Feed
- Search
- Watch Alert

### Report

รองรับ:

- Asset
- User
- Comment
- Board Content

### Admin Moderation

- Admin ต้องตรวจสอบ Report และดำเนินการภายใน 24 ชั่วโมง

## 19. Apple Compliance

รองรับ:

- Report
- Block
- Terms of Use
- Privacy Policy
- Moderation Flow
