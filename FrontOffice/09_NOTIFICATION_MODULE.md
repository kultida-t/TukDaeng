# 09 Notification Module

อ้างอิงหลักจาก [TukDaeng_Master_Product_Definition.md](TukDaeng_Master_Product_Definition.md)

---

# 1. Document Information

| Field | Detail |
| --- | --- |
| Module Name | Notification |
| Version | 1.0 |
| Status | Functional PRD - Master Aligned |
| Owner | Tuk Daeng Project |
| Document Type | Front Office Functional PRD |
| Source of Truth | TukDaeng Master Product Definition |

---

# 2. Objective

Notification Module ใช้สำหรับแจ้งเหตุการณ์สำคัญใน Front Office Mobile App และพาผู้ใช้ไปยัง destination ที่ตรงกับ master baseline

Notification ใน V1 ต้องไม่ขยาย type เกิน master โดยไม่มี decision เพิ่มเติม

---

# 3. Prototype Reference

| Prototype | Usage |
| --- | --- |
| Notification.png | Notification list, unread/read state, destination entry |
| Detail asset viewer.png | Destination สำหรับ Like, Comment, Offer Rejected |
| Chat.png | Destination สำหรับ Offer Accepted |
| Watch Alert.png | Destination สำหรับ Watch Alert Result List |

---

# 4. Master Alignment Summary

| Topic | Master Baseline | Notification Module Rule |
| --- | --- | --- |
| Supported Types | Like, Comment, Follow, Offer, Watch Alert | V1 Notification list ต้องใช้ type ชุดนี้เป็น baseline |
| Watch Alert Destination | Watch Alert Result List | ห้ามเปิด Asset Detail ตรงจาก Watch Alert notification |
| Like Destination | Asset Detail | เปิด Asset Detail ของ Asset ที่ถูก Like |
| Comment Destination | Asset Detail และ Focus Comment | เปิด Asset Detail พร้อม focus comment |
| Offer Accepted Destination | Chat Room | เปิด Chat Room |
| Offer Rejected Destination | Asset Detail | เปิด Asset Detail |
| Guest Restriction | Guest ใช้ feature ที่ต้อง Login ต้องเห็น Global Login Required Dialog | Guest ไม่เข้าถึง Notification Center |
| Empty State | `ไม่พบข้อมูล` / `No data found` | ใช้ข้อความกลางตาม master |

---

# 5. Figma Gap Checklist For Notification Module

| Priority | Figma Gap | Master Baseline | Action |
| --- | --- | --- | --- |
| Must Fix | Figma มี notification type เกิน master เช่น `Like Valuation`, `Market Update`, `Sale Success` | Master รองรับ Like, Comment, Follow, Offer, Watch Alert | ลบ/ซ่อน type นอก scope หรืออัปเดต master ก่อน |
| Must Fix | Figma อาจมี Chat / New Message / Moderation / Account Action เป็น FO notification baseline | Master ระบุว่า Chat / New Message ไม่เป็น Notification Center type และ FO V1 รองรับเฉพาะ Like, Comment, Follow, Offer, Watch Alert | ซ่อน type นอก baseline หรือแยก Back Office / Future scope |
| High | Destination state ยังไม่ครบ | Like -> Asset Detail, Comment -> Asset Detail + Focus Comment, Watch Alert -> Result List, New Offer -> Chat Room + Focus Offer Card, Offer Accepted -> Chat Room, Offer Rejected -> Asset Detail, Offer Cancelled -> Chat Room + Focus Offer Card | เพิ่ม destination screens/states ให้ครบ |
| High | Watch Alert อาจเปิด Asset Detail โดยตรง | Watch Alert Notification ต้องเปิด Watch Alert Result List | เพิ่ม Watch Alert Result List และ route ให้ตรง |
| High | Comment notification ยังไม่เห็น focus comment state | Comment ต้องเปิด Asset Detail และ Focus Comment | เพิ่ม scroll/focus state ใน Asset Detail |
| Medium | Read / Unread และ badge count ต้องตรวจให้ชัด | Notification ต้องรองรับ unread state เพื่อใช้งาน list/badge | เพิ่ม unread/read state และ badge count behavior |
| Medium | Deleted Asset destination ยังไม่ชัด | Deleted Asset detail ต้องแสดง `รายการนี้ไม่พร้อมใช้งานแล้ว` | เพิ่ม unavailable state เมื่อ notification อ้างถึง asset ที่ถูกลบ |
| Medium | Guest Notification Center state ยังไม่ชัด | Guest ใช้ feature ที่ต้อง Login ต้องเห็น Global Login Required Dialog | เพิ่ม login required state เมื่อเข้า Notification Center |
| Medium | New Offer destination ต้องชัด | Master ระบุ New Offer -> Chat Room + Focus Offer Card | เพิ่ม offer card focus state |
| Medium | Offer Cancelled destination ต้องชัด | Master ระบุ Offer Cancelled -> Chat Room + Focus Offer Card | เพิ่ม cancelled offer card state และ unavailable asset reference |

---

# 6. Scope

## In Scope

- Notification List
- Read / Unread status
- Badge / Unread count
- Notification destination routing
- Notification types ตาม master baseline:
  - Like
  - Comment
  - Follow
  - Offer
  - Watch Alert
- Empty state
- Deleted / unavailable destination handling

## Out of Scope For V1 Unless Master Adds Decision

- Like Valuation
- Market Update
- Sale Success
- Chat / New Message in Notification Center (not supported; Chat menu badge/count only)
- Moderation Action in Front Office notification list
- Account Action notification
- Notification retention period rule
- Notification preference center

หมายเหตุ: การแจ้งผู้ใช้เรื่อง `Suspended` หรือ `Banned` ไม่ใช่ FO Notification Center type ใน V1. ระบบใช้ email เป็น primary channel ตาม BO policy และแสดง account status state ผ่าน Authentication เมื่อผู้ใช้เปิดแอปหรือพยายาม Sign In

---

# 7. Screen Mapping

| Screen / Component | Description |
| --- | --- |
| Notification List | แสดงรายการ Notification ทั้งหมดของ user |
| Notification Item | แสดง type, message, timestamp, read/unread state |
| Notification Badge | แสดงจำนวน unread notification |
| Destination Screen | หน้าที่เปิดหลัง user กด notification |
| Empty State | แสดงเมื่อไม่มี notification |
| Error / Unavailable State | แสดงเมื่อ destination ถูกลบหรือเข้าถึงไม่ได้ |

---

# 8. User States

## Guest

- ไม่สามารถเข้า Notification Center ได้
- เมื่อพยายามเข้า Notification Center ต้องแสดง Global Login Required Dialog

## Member

- เห็น Notification List ของตัวเอง
- เปิด notification item ได้
- notification ที่เปิดแล้วเปลี่ยนเป็น Read
- เห็น unread count / badge count

## Blocked / Unavailable Context

- ถ้า notification อ้างถึง content หรือ user ที่เข้าถึงไม่ได้ ระบบต้องแสดง unavailable/error state
- Notification เดิมไม่จำเป็นต้องถูกลบออกจาก list ทันที เว้นแต่ policy กำหนดเพิ่ม

---

# 9. User Flow

## Open Notification Center

```text
Member
-> Open Notification Center
-> View Notification List
-> See Read / Unread states
```

## Open Notification Item

```text
Notification List
-> Tap Notification Item
-> Mark as Read
-> Route to Destination
```

## Watch Alert Notification Flow

```text
Watch Alert Notification
-> Open Watch Alert Result List
-> Do not open Asset Detail directly
```

## Comment Notification Flow

```text
Comment Notification
-> Open Asset Detail
-> Focus target comment
```

---

# 10. Business Rules

## Supported Notification Types

V1 Notification รองรับ type ตาม master baseline เท่านั้น:

| Type | Description |
| --- | --- |
| Like | มี user like Asset |
| Comment | มี user comment บน Asset |
| Follow | มี user follow |
| Offer | เหตุการณ์เกี่ยวกับ Offer |
| Watch Alert | มี Asset Sale ที่ match Watch Alert criteria |

## Types Not In Master Baseline

type ต่อไปนี้ห้ามใช้เป็น V1 source of truth จนกว่า master จะเพิ่ม scope:

- Like Valuation
- Market Update
- Sale Success
- Moderation Action
- Account Action
- Chat / New Message in Notification Center (not supported; Chat menu badge/count only)

New Message สามารถใช้เป็น unread badge/count ภายในเมนู Chat ได้ แต่ไม่ใช่ Notification Center type ของ Front Office V1

## Notification Sorting

- Notification List เรียงตาม Created Date DESC
- รายการล่าสุดอยู่บนสุด

## Read / Unread

- Notification ใหม่เริ่มต้นเป็น Unread
- เมื่อ user เปิด notification item ให้เปลี่ยนเป็น Read
- Badge count คำนวณจาก unread notifications

## Destination Routing

| Notification | Destination |
| --- | --- |
| Like | Asset Detail |
| Comment | Asset Detail และ Focus Comment |
| Follow | Public Profile |
| Watch Alert | Watch Alert Result List |
| New Offer | Chat Room + Focus Offer Card |
| Offer Accepted | Chat Room |
| Offer Rejected | Asset Detail |
| Offer Cancelled | Chat Room + Focus Offer Card |

## Offer Notification Detail

- New Offer เปิด Chat Room และ Focus Offer Card เพื่อให้ Seller ตอบรับหรือปฏิเสธได้ทันที
- Offer Accepted เปิด Chat Room
- Offer Rejected เปิด Asset Detail
- Offer Cancelled เปิด Chat Room และ Focus Offer Card ที่เป็น Cancelled
- หาก Offer Cancelled เกิดจาก Asset Deleted ให้ Chat asset reference แสดง unavailable state

## Watch Alert Rule

- Watch Alert Notification ต้องเปิด Watch Alert Result List
- ห้ามเปิด Asset Detail โดยตรงจาก notification
- Watch Alert match เฉพาะ Asset สถานะ Sale

## Deleted Asset Impact

- ถ้า notification อ้างถึง Asset ที่ถูกลบ ให้ destination แสดง unavailable state
- ข้อความที่ต้องใช้: `รายการนี้ไม่พร้อมใช้งานแล้ว`
- Notification item เดิมยังอยู่ได้ แต่ต้องไม่เปิด content ที่ไม่มีสิทธิ์หรือไม่มีอยู่แล้ว

## Deleted User Impact

- ถ้า notification อ้างถึง user ที่ถูกลบหรือเข้าถึงไม่ได้ ให้แสดง `ไม่พบผู้ใช้งาน`
- ห้ามเปิด Public Profile ที่ไม่มีอยู่หรือถูกจำกัดสิทธิ์

## Block User Impact

- ถ้า user ถูก block หรือ block กันอยู่ destination ต้องเคารพ Trust & Safety rule
- Content ของผู้ถูก block ต้องไม่ถูกเปิดผ่าน notification

---

# 11. Permission Rules

| Actor | Permission |
| --- | --- |
| Guest | เข้า Notification Center ไม่ได้ |
| Member | เห็น Notification ของตัวเองเท่านั้น |
| Other User | ไม่มีสิทธิ์เห็น Notification ของ user อื่น |
| Admin | ใช้งานผ่าน Back Office เท่านั้น ไม่ใช่ Front Office Notification Center |

---

# 12. Validation Rules

Notification Module ไม่มี form validation โดยตรง แต่ต้อง validate routing ก่อนเปิด destination:

| Condition | Rule |
| --- | --- |
| Missing Destination | แสดง unable to open content |
| Deleted Asset | แสดง unavailable asset state |
| Deleted User | แสดง user not found state |
| Permission Denied | แสดง unable to open content |
| Unsupported Type | ไม่ควรแสดงใน V1 list |

---

# 13. Exception Handling

## Asset Deleted

- TH: `รายการนี้ไม่พร้อมใช้งานแล้ว`
- EN: `This item is no longer available.`

## User Deleted

- TH: `ไม่พบผู้ใช้งาน`
- EN: `User not found.`

## Deep Link Failed

- TH: `ไม่สามารถเปิดข้อมูลได้`
- EN: `Unable to open content.`

## Notification Load Failed

- TH: `ไม่สามารถโหลดข้อมูลได้`
- EN: `Unable to load data.`
- Action: แสดงปุ่ม `ลองใหม่`

---

# 14. Empty State

ใช้ข้อความกลางตาม master:

| Language | Message |
| --- | --- |
| TH | `ไม่พบข้อมูล` |
| EN | `No data found` |

---

# 15. Notification Rules

| Trigger | Recipient | Type | Destination |
| --- | --- | --- | --- |
| User likes Asset | Asset Owner | Like | Asset Detail |
| User comments on Asset | Asset Owner / related user | Comment | Asset Detail + Focus Comment |
| User follows another user | Followed User | Follow | Public Profile |
| Offer accepted | Buyer | Offer | Chat Room |
| Offer rejected | Buyer | Offer | Asset Detail |
| Watch Alert criteria matched | Alert Owner | Watch Alert | Watch Alert Result List |

Push Notification รองรับผ่าน Firebase Cloud Messaging ตาม integration baseline แต่ in-app list ต้องยังคงใช้ supported types ตาม master

---

# 16. Analytics Events

- `notification_center_opened`
- `notification_item_opened`
- `notification_marked_read`
- `notification_open_asset_detail`
- `notification_open_comment_focus`
- `notification_open_public_profile`
- `notification_open_chat_room`
- `notification_open_watch_alert_result`
- `notification_deeplink_failed`

---

# 17. Acceptance Criteria

## AC-NOTI-001: Guest Cannot Access Notification Center

Given user เป็น Guest  
When user เปิด Notification Center  
Then ระบบต้องแสดง Global Login Required Dialog

## AC-NOTI-002: Supported Types Only

Given Notification List แสดงใน V1  
When user เห็นรายการ notification  
Then type ต้องอยู่ในชุด Like, Comment, Follow, Offer, Watch Alert เท่านั้น

## AC-NOTI-003: Unsupported Types Are Not Shown

Given system มี type นอก master เช่น Market Update, Sale Success หรือ Like Valuation  
When แสดง Notification List ใน V1  
Then type เหล่านั้นต้องไม่แสดง เว้นแต่ master เพิ่ม scope แล้ว

## AC-NOTI-004: Like Opens Asset Detail

Given user มี Like notification  
When user กด notification  
Then ระบบต้องเปิด Asset Detail ของ Asset ที่ถูก Like

## AC-NOTI-005: Comment Opens Asset Detail And Focus Comment

Given user มี Comment notification  
When user กด notification  
Then ระบบต้องเปิด Asset Detail  
And focus comment ที่เกี่ยวข้อง

## AC-NOTI-006: Follow Opens Public Profile

Given user มี Follow notification  
When user กด notification  
Then ระบบต้องเปิด Public Profile ของผู้ที่ follow

## AC-NOTI-007: Watch Alert Opens Result List

Given user มี Watch Alert notification  
When user กด notification  
Then ระบบต้องเปิด Watch Alert Result List  
And ต้องไม่เปิด Asset Detail โดยตรง

## AC-NOTI-008: Offer Accepted Opens Chat Room

Given user มี Offer Accepted notification  
When user กด notification  
Then ระบบต้องเปิด Chat Room

## AC-NOTI-009: Offer Rejected Opens Asset Detail

Given user มี Offer Rejected notification  
When user กด notification  
Then ระบบต้องเปิด Asset Detail

## AC-NOTI-009A: New Offer Opens Chat Room Offer Card

Given Seller มี New Offer notification  
When Seller กด notification  
Then ระบบต้องเปิด Chat Room  
And focus Offer Card ที่เกี่ยวข้อง

## AC-NOTI-009B: Offer Cancelled Opens Chat Room Offer Card

Given user มี Offer Cancelled notification  
When user กด notification  
Then ระบบต้องเปิด Chat Room  
And focus Offer Card ที่มีสถานะ Cancelled  
And หาก Asset ถูกลบ Chat asset reference ต้องแสดง unavailable state

## AC-NOTI-010: Mark As Read

Given notification อยู่ใน Unread state  
When user เปิด notification item  
Then notification ต้องเปลี่ยนเป็น Read  
And unread badge count ต้องลดลงตามจริง

## AC-NOTI-011: Deleted Asset Destination

Given notification อ้างถึง Asset ที่ถูกลบ  
When user กด notification  
Then ระบบต้องแสดง `รายการนี้ไม่พร้อมใช้งานแล้ว`

## AC-NOTI-012: Empty State

Given user ไม่มี notification  
When user เปิด Notification Center  
Then ระบบต้องแสดง `ไม่พบข้อมูล` / `No data found`

---

# 18. Related Modules

- Asset Detail Module
- Offer Module
- Watch Alert Module
- Social Module
- Chat Module
- Profile Module
- Trust & Safety Module

---

# 19. Future Enhancement

- Notification preference center
- Retention period rule
- Chat / New Message notification in Notification Center (not supported; Chat menu badge/count only)
- Moderation / Account Action notification for Front Office
- Market Update notification
- Price / Valuation notification
