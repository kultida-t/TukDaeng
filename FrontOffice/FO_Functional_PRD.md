# Tuk Daeng App

**FO Functional PRD v2.0**  
**Document:** Project Vision & Confirmed Requirements Summary

> **Sync note (FO-PRD-v1.9, 2026-10-22):** เอกสารนี้ sync ตาม `Prototypes/fo-flow/index.html` + master §16 Sync Decision Log — feed post-centric (S-09), Member Sheet แทน Global Login Required Dialog, Alerts feed 5 types (+`system`), thread chat key = user+item (S-07), Sale Record 2 ฟิลด์ (D3) — จุดที่ขัด master/module spec ให้ยึด master/module spec เสมอ

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
- Forgot Password (ส่ง reset link; ไม่มีหน้า Reset Password ในแอป)
- Change Password
- Sign Out

### Feed

- Post-centric social feed (S-09)
- แสดงโพสต์ kind `sale` (ผูก asset สถานะ Sale) + kind `post` (ไม่ผูก asset)

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

### Watch Alert

- แจ้งเตือน Asset ที่ตรงเงื่อนไข

### Notification

- Alerts feed — ศูนย์กลางการแจ้งเตือน (member-only, 5 types)

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

- Feed = post-centric (S-09): แสดงโพสต์ kind `sale` ที่ผูก asset สถานะ Sale + โพสต์ kind `post` (ไม่ผูก asset)
- Asset สถานะ Show/Hide/Sold ไม่ขึ้น Feed

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

## 11. Member Sheet (เดิมเรียก Global Login Required Dialog)

Guest กด Feature ที่ต้อง Login ให้ใช้ sheet `Join TukDaeng` เดียวกันทั้งระบบ (Member Sheet)

ตัวอย่าง Feature ที่ต้อง Login:

- Like
- Follow
- Chat
- Share (member-only ทุก surface — S-03)
- Favorites / Wishlist / Saved
- Comment
- Following / Favorites feed tabs (guest เห็น empty ไม่ gate — S-16)

## 12. Chat Module

### Room Creation

- สร้างห้องเมื่อส่งข้อความแรก

### Same Listing

- ใช้ห้องเดิม (thread key = user + item — S-07)

### Different Listing (seller เดียวกัน คนละโพสต์)

- สร้างห้องแยก (ไม่ merge ห้อง — S-07)
- `Reference Asset` ของแต่ละห้องคงเดิม ไม่เปลี่ยนตาม listing ล่าสุด

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

## 13. Notification Module (Alerts feed)

Notification รองรับ 5 types:

- Like
- Comment
- Follow
- Watch Alert
- `system` (placeholder destination — S-17)

### Notification Destination

| Notification | Destination |
| --- | --- |
| Watch Alert Notification | เปิด Post Viewer ของ post ที่ match โดยตรง ไม่มี Result List คั่น (S-08) |
| Like Notification | เปิด Post Viewer |
| Comment Notification | เปิด Post Viewer และ Focus Comment |
| Follow Notification | เปิด Public Profile + inline Follow back |
| `system` | placeholder destination (S-17) |

## 14. Social Module

### Like

- Owner กด Like Asset ตัวเองได้

### Comment

- รองรับ IG-style one-level replies ใต้ comment หลัก
- ไม่รองรับ multi-level nested thread หรือ reply ซ้อนเกิน 1 ชั้น
- ไม่มี Edit Comment ใน V1
- รองรับ Delete Comment

### Follow

- รองรับ

## 15. Watch Alert

- สร้างจาก shared `Create watch alert` sheet (entry: search, feed, asset)
- ชื่อ auto-fill จาก criteria แก้ได้; criteria เป็น snapshot (S-11)
- Match เฉพาะ Sale post
- เปิด Notification แล้วไป Post Viewer ของ post ที่ match โดยตรง (S-08)

## 16. Portfolio

Portfolio เป็น Private และเห็นเฉพาะ Owner (ผ่าน wallet icon `.pf-pfo` — S-05)

Headline = `Total invested` = Σ Purchase Price (D2 — ไม่ใช่ Total Asset Value) + market value secondary + coverage

คำนวณจาก:

- Sale
- Show
- Hide

ไม่รวม:

- Sold

### Sale Record (เดิมเรียก Sold History)

เก็บข้อมูล 2 ฟิลด์เท่านั้น (D3):

- Sale Date
- Sale Price

## 17. Trust & Safety

### Block User

เมื่อ Block แล้ว post ของผู้ถูก Block หายจากรายการต่อไปนี้ทันที:

- Feed
- Search
- Watch Alert

Blocked profile page แสดง Instagram-style blocked state (S-13 — ไม่ใช่ unavailable page)

### Report

รองรับ:

- Asset
- User
- Comment
- Board Content

### Admin Moderation

- Admin ต้องตรวจสอบ Report และดำเนินการภายใน 24 ชั่วโมง

## 18. Apple Compliance

รองรับ:

- Report
- Block
- Terms of Use
- Privacy Policy
- Moderation Flow
