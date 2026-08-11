# 08 Offer Module

อ้างอิงหลักจาก [TukDaeng_Master_Product_Definition.md](TukDaeng_Master_Product_Definition.md)

---

# 1. Document Information

| Field | Detail |
| --- | --- |
| Module Name | Offer |
| Version | 1.0 |
| Status | Functional PRD - Master Aligned |
| Owner | Tuk Daeng Project |
| Document Type | Front Office Functional PRD |
| Source of Truth | TukDaeng Master Product Definition |

---

# 2. Objective

Offer Module ใช้สำหรับให้ Buyer เสนอราคาซื้อ Asset จากหน้า Asset Detail และให้ Seller พิจารณา Accept หรือ Decline Offer โดยเชื่อมกับ Chat และ Notification

Phase 1 ไม่มีระบบชำระเงินในแอป ไม่มี Counter Offer และไม่มี Withdraw Offer

---

# 3. Prototype Reference

| Prototype | Usage |
| --- | --- |
| Detail asset viewer.png | Entry point สำหรับ Make Offer |
| Chat.png | แสดง Offer Card และ action ของ Seller |
| Notification.png | แจ้งเตือน Offer และ destination |

---

# 4. Master Alignment Summary

| Topic | Master Baseline | Offer Module Rule |
| --- | --- | --- |
| Entry Point | Make Offer ทำผ่าน Asset Detail เท่านั้น | ห้ามสร้าง Offer จาก Feed, Search, Profile หรือ Chat โดยตรง |
| Offer Flow | Asset Detail -> Make Offer -> Enter Offer Price -> Add Message -> Send Offer -> Offer Sent Successfully -> Go to Chat | หลังส่ง Offer สำเร็จต้องไป Chat Room |
| Accepted Offer | เปิด Chat Room | Accepted state ต้องพาผู้ใช้กลับไปคุยต่อใน Chat |
| Rejected Offer | เปิด Asset Detail | Rejected notification ต้องเปิด Asset Detail |
| Asset Deleted | Offer ที่เกี่ยวข้องต้องเป็น Cancelled | Offer ทั้งหมดของ Asset ที่ถูกลบต้องเปลี่ยนเป็น Cancelled |
| Asset Sold | Offer อื่นถูก Auto Rejected | เมื่อ Owner mark as Sold ต้องเปลี่ยน pending offers อื่นเป็น `Rejected` โดยอัตโนมัติ |
| Chat | Chat Room รองรับ Offer Card | Offer ต้องแสดงใน Chat เป็น Offer Card |
| Notification | New Offer -> Chat Room + Focus Offer Card, Offer Accepted -> Chat Room, Offer Rejected -> Asset Detail, Offer Cancelled -> Chat Room + Focus Offer Card | Destination ต้องตรง master |

---

# 5. Figma Gap Checklist For Offer Module

| Priority | Figma Gap | Master Baseline | Action |
| --- | --- | --- | --- |
| High | Make Offer entry point อาจกระจายหลายหน้า | Make Offer ทำผ่าน Asset Detail เท่านั้น | จำกัด entry point ใน Figma ให้เริ่มจาก Asset Detail |
| High | Accepted / Rejected destination ยังต้องตรวจให้ครบ | Accepted เปิด Chat Room, Rejected เปิด Asset Detail | เพิ่มหรือ annotate destination state ให้ตรง master |
| High | ยังไม่เห็น Asset Deleted -> Offer Cancelled state ชัดเจน | Asset Deleted ทำให้ Offer เป็น Cancelled | เพิ่ม cancelled offer state |
| High | ยังไม่เห็น Asset Sold -> Auto Rejected other offers ชัดเจน | Asset Sold ต้องเปลี่ยน Offer อื่นเป็น `Rejected` อัตโนมัติ | เพิ่ม sold impact state และ auto rejected offer state |
| Medium | Incoming Offers ต้องแยก Pending ที่รอ action | Pending Offer ที่ยังไม่ Accept/Decline ต้องอยู่ใน Incoming Offers | ตรวจ list/filter และ empty state |
| Medium | Offer Card ใน Chat ต้องรองรับ status | Chat Room รองรับ Offer Card | เพิ่ม card state: Pending, Accepted, Rejected, Cancelled |
| Medium | Guest action state ยังไม่ชัด | Guest กด Offer ต้องเห็น Global Login Required Dialog | เพิ่ม guest dialog state |
| Medium | Asset สถานะ Show ต้องรองรับ Make Offer / Contact Seller จาก Detail | Master อนุญาตให้ Offer/Contact บน `Show` เพื่อรองรับผู้สนใจเสนอราคาหรือสอบถาม | ระบุว่า `Show` สร้าง Offer ได้จาก Asset Detail เท่านั้น แต่ไม่ปรากฏใน Feed/Search/Watch Alert |
| Medium | Offer Cancelled destination ต้องชัด | Master ระบุ Offer Cancelled -> Chat Room + Focus Offer Card | เพิ่ม cancelled offer card destination state |

---

# 6. Scope

## In Scope

- Make Offer จาก Asset Detail
- Enter Offer Price
- Add Message ตอนส่ง Offer
- Offer Sent Successfully
- Go to Chat หลังส่ง Offer สำเร็จ
- Offer Card ใน Chat Room
- Seller Accept Offer
- Seller Decline Offer
- Incoming Offers สำหรับ Offer ที่รอการตัดสินใจ
- Offer status: Pending, Accepted, Rejected, Cancelled
- Notification สำหรับ New Offer, Offer Accepted, Offer Rejected และ Offer Cancelled
- Asset Deleted impact ต่อ Offer
- Asset Sold impact ต่อ Offer อื่น

## Out of Scope For V1

- In-app payment
- Escrow
- Counter Offer
- Withdraw Offer
- Offer Expiration
- Auto Expire Offer
- Negotiation History
- Multiple-round bidding
- Auction

---

# 7. Screen Mapping

| Screen / Component | Description |
| --- | --- |
| Asset Detail | แสดงปุ่ม Make Offer สำหรับ Asset ที่ offer ได้ |
| Make Offer | ใส่ราคาและข้อความประกอบ |
| Offer Sent Successfully | Success state หลังส่ง Offer |
| Chat Room | แสดง Offer Card และสนทนาต่อ |
| Incoming Offers | รายการ Pending Offer ที่ Seller ต้องตัดสินใจ |
| Offer Notification | แจ้งผล Accepted / Rejected |

---

# 8. User States

## Guest

- ดู Asset Detail ตาม visibility rule ได้
- กด Make Offer ไม่ได้
- เมื่อกด Make Offer ต้องแสดง Global Login Required Dialog

## Buyer

- สร้าง Offer จาก Asset Detail ได้
- ดู Offer ของตัวเองได้
- เข้า Chat Room หลังส่ง Offer สำเร็จ
- รับ notification เมื่อ Offer ถูก Accept หรือ Reject

## Seller

- เห็น Offer ที่ส่งมาหา Asset ของตัวเอง
- Accept หรือ Decline Offer ได้
- เห็น Incoming Offers เฉพาะ Offer ที่ยังต้องตัดสินใจ

## Owner Viewing Own Asset

- ไม่ควรเห็น Make Offer สำหรับ Asset ของตัวเอง
- ใช้ Asset Management / Mark as Sold flow แทน

---

# 9. User Flow

## Make Offer Flow

```text
Asset Detail
-> Make Offer
-> Enter Offer Price
-> Add Message
-> Send Offer
-> Offer Sent Successfully
-> Go to Chat
```

## Accept Offer Flow

```text
Incoming Offers or Chat Room
-> Open Pending Offer
-> Accept
-> Confirm
-> Offer status = Accepted
-> Buyer receives Offer Accepted notification
-> Destination = Chat Room
```

## Decline Offer Flow

```text
Incoming Offers or Chat Room
-> Open Pending Offer
-> Decline
-> Confirm
-> Offer status = Rejected
-> Buyer receives Offer Rejected notification
-> Destination = Asset Detail
```

## Asset Sold Impact Flow

```text
Owner marks Asset as Sold
-> Sold state is recorded
-> Other pending offers become Rejected automatically
-> Existing Chat Rooms remain usable
```

## Asset Deleted Impact Flow

```text
Owner deletes Asset
-> Asset Detail becomes unavailable
-> Related Offers become Cancelled
-> Existing Chat Rooms remain usable with unavailable asset reference
```

---

# 10. Business Rules

## Offer Entry Point

- Offer สร้างได้จาก Asset Detail เท่านั้น
- Feed, Search, Profile, Notification และ Chat ไม่สามารถสร้าง Offer ใหม่โดยตรง
- Notification และ Chat ทำหน้าที่เปิด Offer/Chat ที่มีอยู่แล้วเท่านั้น

## Offer Availability

- V1 Offer ใช้กับ Asset สถานะ `Sale` และ `Show`
- `Show` สร้าง Offer ได้จาก Asset Detail / Public Profile detail entry เท่านั้น
- `Show` ยังต้องไม่ปรากฏใน Feed, Search หรือ Watch Alert
- Hide และ Sold ไม่สามารถสร้าง Offer ได้
- Asset ที่ถูกลบไม่สามารถสร้าง Offer ได้
- Master ระบุแล้วว่า `Show` รองรับ Offer/Contact Seller/Chat จาก Detail

## Offer Status

FO ต้องแยกคำว่า `Decline` กับ `Rejected` ให้ชัด:

- `Decline` คือ action/copy บนหน้าจอที่ Seller กด เช่น ปุ่ม `Decline`
- `Rejected` คือ status หลังจาก Seller กด `Decline` แล้ว
- DB/API/state enum ควรใช้ `Rejected` หรือ `REJECTED` ไม่ใช้ `Declined`

| Status | Meaning |
| --- | --- |
| Pending | Offer ถูกส่งแล้วและรอ Seller ตัดสินใจ |
| Paused | Offer ยังรอการตัดสินใจ แต่ถูกพักชั่วคราวเพราะ Asset อยู่ระหว่าง review หรือถูกซ่อนชั่วคราว |
| Accepted | Seller ยอมรับ Offer |
| Rejected | Seller กด `Decline` และ Offer ถูกปฏิเสธแล้ว |
| Cancelled | Offer ถูกยกเลิกจาก system impact เช่น Asset Deleted |
| Invalidated | Offer ใช้งานไม่ได้ถาวรเพราะ Asset ถูกซ่อนถาวรหรือไม่ผ่าน moderation |

## Offer Ownership

- Buyer คือผู้สร้าง Offer
- Seller คือ Owner ของ Asset
- Buyer และ Seller เห็นเฉพาะ Offer ที่เกี่ยวข้องกับตนเอง
- User อื่นไม่มีสิทธิ์เห็น Offer

## Accept Rule

- Seller สามารถ Accept ได้ 1 Offer ต่อ Asset
- Accepted Offer เปิด Chat Room เพื่อคุยต่อ
- Accepted Offer ไม่เท่ากับการชำระเงินสำเร็จ
- การเปลี่ยน Asset เป็น Sold ต้องเกิดผ่าน Mark as Sold / Sale Record flow

## Sold Impact

- เมื่อ Asset เปลี่ยนเป็น Sold ต้องเปลี่ยน pending offers อื่นเป็น `Rejected` โดยอัตโนมัติ
- Chat ที่เกี่ยวข้องยังใช้งานได้
- Sold Asset หายจาก public surfaces ตาม master

## Asset Review / Moderation Impact

เมื่อ Asset ที่มี Pending Offer ถูก report และระบบซ่อนชั่วคราวอัตโนมัติ หรือ Admin ซ่อนชั่วคราวระหว่าง review:

- Offer ต้องเปลี่ยนเป็น `Paused`
- Offer ต้องไม่อยู่ใน Incoming Offers ที่ต้องตัดสินใจแบบ active
- Offer Card ใน Chat ยังอยู่เพื่อเป็น history/context
- Seller ต้องกด `Accept` หรือ `Decline` ไม่ได้ระหว่าง `Paused`
- Buyer และ Seller เห็นข้อความ `Offer Paused` และเหตุผลว่า Asset อยู่ระหว่าง review
- ถ้า review ผ่านและ Asset กลับเป็น `Sale` หรือ `Show` ให้ Offer กลับเป็น `Pending` และ Seller action กลับมากดได้
- ถ้า review ไม่ผ่านและ Asset ถูก `ซ่อนถาวร` ให้ Offer เปลี่ยนเป็น `Invalidated`

เมื่อ Owner เปลี่ยน Asset จาก `Sale` หรือ `Show` เป็น `Hide` ขณะมี Pending Offer:

- Offer ต้องเปลี่ยนเป็น `Cancelled`
- เหตุผลคือ Asset ไม่รับ offer ต่อจาก owner-controlled visibility change
- Chat ยังอยู่ และ Offer Card แสดง final state `Offer Cancelled`

เมื่อ Asset ถูก BO ซ่อนถาวรจาก moderation:

- Pending/Paused Offer ที่เกี่ยวข้องต้องเปลี่ยนเป็น `Invalidated`
- Offer Card แสดง final state `Offer Unavailable`
- ห้ามแสดง `Accept` / `Decline`

## Deleted Asset Impact

- เมื่อ Asset ถูกลบ Offer ที่เกี่ยวข้องทั้งหมดต้องเป็น Cancelled
- Asset Detail ต้องแสดง unavailable state
- Chat ยังอยู่ และ reference asset ต้องแสดงว่า `รายการนี้ไม่พร้อมใช้งานแล้ว`

## Incoming Offers

- Incoming Offers แสดงเฉพาะ `Pending` Offer ที่ Seller ยังต้องตัดสินใจและ Asset ยัง action ได้
- Offer ที่อ่านแล้วแต่ยังไม่ Accept/Decline ต้องยังอยู่ใน Incoming Offers
- Offer ที่ `Paused`, `Accepted`, `Rejected`, `Cancelled` หรือ `Invalidated` ต้องไม่อยู่ใน Incoming Offers active list

## Offer Card In Chat

- Chat Room ต้องรองรับ Offer Card
- Offer Card ต้องแสดงอย่างน้อย: Asset reference, Offer Price, Message, Status, Timestamp
- Seller action บน Offer Card แสดงเฉพาะ `Pending` Offer ที่ตนมีสิทธิ์ตัดสินใจและ Asset ยัง action ได้
- Buyer เห็น status ของ Offer แต่กด Accept/Decline ไม่ได้

### Offer Card State Display

| Offer state | Header copy | Body / Subcopy | Offer price color | Seller action |
| --- | --- | --- | --- | --- |
| `Pending` | ไม่ต้องมี result header | แสดง Offer Card พร้อมราคาและ message | Brand red / normal offer style | แสดง `Decline` และ `Accept` |
| `Paused` | `Offer Paused` | `This asset is under review. The offer cannot be accepted or declined right now.` | Neutral / disabled | ไม่แสดงปุ่ม หรือ disabled ทั้ง `Decline` และ `Accept` |
| `Accepted` | `Offer Accepted` | `The buyer has been notified.` | Green | ไม่มี action |
| `Rejected` | `Offer Declined` | `The buyer has been notified.` | Red | ไม่มี action |
| `Cancelled` | `Offer Cancelled` | `This asset is no longer available for offers.` | Neutral / disabled | ไม่มี action |
| `Invalidated` | `Offer Unavailable` | `This asset was removed after review.` | Neutral / disabled | ไม่มี action |

Asset reference card ด้านบน Chat ต้องสะท้อน asset state ด้วย เช่น `SALE`, `SHOW`, `UNDER REVIEW`, `HIDDEN`, `SOLD`, หรือ unavailable state ตาม lifecycle ล่าสุด

---

# 11. Permission Rules

| Actor | Permission |
| --- | --- |
| Guest | ดู public detail ได้ แต่ใช้ Offer ไม่ได้ |
| Buyer | Make Offer, ดู Offer ของตัวเอง, เปิด Chat ที่เกี่ยวข้อง |
| Seller | ดู Incoming Offers, Accept Offer, Decline Offer |
| Asset Owner | ไม่สามารถ Make Offer กับ Asset ตัวเอง |
| Other User | ไม่มีสิทธิ์เห็นหรือจัดการ Offer |

---

# 12. Validation Rules

| Field / Condition | Rule |
| --- | --- |
| Offer Price | Required |
| Offer Price Empty | ถ้าไม่กรอก ต้อง disable ปุ่ม `Send offer` |
| Offer Price Format | รับเฉพาะตัวเลขจำนวนเงินที่ parse ได้ ห้ามตัวอักษรหรือค่าที่ไม่ใช่ตัวเลข |
| Offer Price Value | ต้องมากกว่า 0; ถ้าเป็น 0 หรือติดลบ ต้องแสดง `Please enter a valid offer amount` |
| Offer Price Currency | THB |
| Offer Message | Optional |
| Offer Message Format | Trim ก่อนส่ง; ถ้ากรอกเฉพาะช่องว่างให้ถือว่าไม่กรอก |
| Offer Message Length | ไม่เกิน 500 characters; ถ้าเกินต้องแสดง field-level validation error |
| Asset Status | ต้องเป็น `Sale` หรือ `Show` |
| Show Asset Entry | `Show` สร้าง Offer ได้จาก Asset Detail / Public Profile detail entry เท่านั้น |
| Asset Availability | `Hide`, `Sold`, `Deleted`, `ซ่อนชั่วคราว`, `ซ่อนถาวร` และ asset ที่อยู่ระหว่าง review สร้าง Offer ใหม่ไม่ได้ |
| Auth State | ต้อง Login ก่อน Make Offer |
| Owner Restriction | Owner ไม่สามารถ Make Offer กับ Asset ของตัวเอง |
| Duplicate Pending Offer | ถ้า user มี Pending Offer เดิมของ Asset นี้อยู่แล้ว ต้องไม่สร้างซ้ำ และแสดง `You already have a pending offer. Go to chat to view it.` |

---

# 13. Exception Handling

## Asset Sold

- TH: `รายการนี้ขายแล้ว`
- EN: `This item has been sold.`
- Result: ไม่สามารถสร้าง Offer ใหม่ และ pending offers อื่นถูกเปลี่ยนเป็น `Rejected` โดยอัตโนมัติ

## Asset Under Review

- TH: `รายการนี้อยู่ระหว่างการตรวจสอบ`
- EN: `This item is under review.`
- Result: ไม่สามารถสร้าง Offer ใหม่ และ existing pending offer ต้องเป็น `Paused` จนกว่า review จะจบ

## Asset Deleted

- TH: `รายการนี้ไม่พร้อมใช้งานแล้ว`
- EN: `This item is no longer available.`
- Result: Offer ที่เกี่ยวข้องเป็น Cancelled

## Asset Permanently Hidden

- TH: `รายการนี้ไม่พร้อมใช้งานแล้ว`
- EN: `This item is no longer available.`
- Result: Pending/Paused Offer ที่เกี่ยวข้องเป็น `Invalidated`

## Invalid Offer Price

- EN: `Please enter a valid offer amount`
- Result: ไม่สร้าง Offer เมื่อ Offer Price เป็น 0, ติดลบ, ไม่ใช่ตัวเลข หรือ parse ไม่ได้

## Duplicate Pending Offer

- EN: `You already have a pending offer. Go to chat to view it.`
- Result: ไม่สร้าง Offer ซ้ำ และให้ user ไปดู Pending Offer เดิมใน Chat

## Offer Not Available

- TH: `ไม่สามารถดำเนินการได้`
- EN: `Unable to proceed.`
- Result: แสดงเมื่อ Offer ไม่อยู่ในสถานะที่ action ได้ หรือ user ไม่มีสิทธิ์

## Guest Required

- ใช้ Global Login Required Dialog
- หลัง Login สำเร็จสามารถกลับมาที่ Asset Detail เดิมได้

---

# 14. Empty State

## Incoming Offers Empty

- TH: `ไม่พบข้อมูล`
- EN: `No data found`

ใช้เมื่อไม่มี Pending Offer ที่ Seller ต้องตัดสินใจ

---

# 15. Notification Rules

| Notification | Recipient | Destination | Rule |
| --- | --- | --- | --- |
| New Offer | Seller | Chat Room + Focus Offer Card | ใช้แจ้ง Seller ว่ามี Offer ใหม่ |
| Offer Accepted | Buyer | Chat Room | ต้องตรง master |
| Offer Rejected | Buyer | Asset Detail | ต้องตรง master |
| Offer Cancelled | Buyer / Seller | Chat Room + Focus Offer Card | เปิด Offer Card ที่เป็น Cancelled; หาก Asset ถูกลบให้ Chat reference แสดง unavailable state |
| Offer Paused | Buyer / Seller | Chat Room + Focus Offer Card | ใช้เมื่อ Asset ถูก auto hidden หรือซ่อนชั่วคราวระหว่าง review; Offer Card ต้องไม่มี Accept/Decline |
| Offer Invalidated | Buyer / Seller | Chat Room + Focus Offer Card | ใช้เมื่อ Asset ถูกซ่อนถาวรจาก moderation; Offer Card ต้องเป็น final unavailable state |

---

# 16. Analytics Events

- `offer_make_started`
- `offer_sent`
- `offer_sent_success`
- `offer_accept_started`
- `offer_accepted`
- `offer_reject_started`
- `offer_rejected`
- `offer_auto_rejected_asset_sold`
- `offer_cancelled_asset_deleted`
- `offer_cancelled_asset_hidden`
- `offer_paused_asset_under_review`
- `offer_resumed_asset_review_passed`
- `offer_invalidated_asset_permanently_hidden`
- `incoming_offers_viewed`

---

# 17. Acceptance Criteria

## AC-OFFER-001: Offer Entry Point

Given user อยู่ที่ Asset Detail ของ Asset ที่ offer ได้  
When user กด Make Offer  
Then ระบบต้องเปิด Make Offer flow

And ไม่สามารถเริ่ม Make Offer จาก Feed, Search, Profile หรือ Chat โดยตรง

## AC-OFFER-002: Guest Restriction

Given user เป็น Guest  
When user กด Make Offer  
Then ระบบต้องแสดง Global Login Required Dialog

## AC-OFFER-003: Price Validation

Given user อยู่ใน Make Offer form  
When user ไม่กรอก Offer Price  
Then ปุ่ม `Send offer` ต้อง disabled  

When user กรอก Offer Price เป็น 0, ติดลบ, ตัวอักษร หรือค่าที่ parse เป็นจำนวนเงินไม่ได้  
Then ระบบต้องไม่สร้าง Offer  
And ต้องแสดง `Please enter a valid offer amount`

## AC-OFFER-003A: Message Validation

Given user อยู่ใน Make Offer form  
When user ไม่กรอก Message หรือกรอกเฉพาะช่องว่าง  
Then ระบบต้องส่ง Offer ได้โดยไม่มี Message หลัง trim  

When user กรอก Message เกิน 500 characters  
Then ระบบต้องไม่สร้าง Offer  
And ต้องแสดง field-level validation error

## AC-OFFER-003B: Duplicate Pending Offer

Given Buyer มี Pending Offer เดิมของ Asset เดียวกัน  
When Buyer พยายามส่ง Offer ใหม่  
Then ระบบต้องไม่สร้าง Offer ซ้ำ  
And ต้องแสดง `You already have a pending offer. Go to chat to view it.`

## AC-OFFER-004: Offer Sent Success

Given Buyer กรอก Offer Price ถูกต้อง  
When Buyer ส่ง Offer  
Then ระบบต้องสร้าง Offer status Pending  
And แสดง Offer Sent Successfully  
And เปิด Chat Room

## AC-OFFER-005: Seller Accepts Offer

Given Seller เห็น Pending Offer ของ Asset ตัวเอง  
When Seller Accept Offer และ Confirm  
Then Offer ต้องเปลี่ยนเป็น Accepted  
And Buyer ต้องได้รับ Offer Accepted notification  
And notification destination ต้องเป็น Chat Room

## AC-OFFER-006: Seller Declines Offer

Given Seller เห็น Pending Offer ของ Asset ตัวเอง  
When Seller Decline Offer และ Confirm  
Then Offer ต้องเปลี่ยนเป็น Rejected  
And Buyer ต้องได้รับ Offer Rejected notification  
And notification destination ต้องเป็น Asset Detail

## AC-OFFER-007: Incoming Offers Pending Rule

Given Offer ยังเป็น Pending  
When Seller อ่าน Offer แต่ยังไม่ Accept หรือ Decline  
Then Offer ต้องยังอยู่ใน Incoming Offers

## AC-OFFER-008: Accepted / Rejected Removed From Incoming

Given Offer ถูก Accept หรือ Decline แล้ว  
When Seller กลับไป Incoming Offers  
Then Offer นั้นต้องไม่อยู่ใน Incoming Offers  
And Offer Card ยังอยู่ใน Chat history

## AC-OFFER-009: Sold Auto-Rejects Other Offers

Given Asset มีหลาย Pending Offers  
When Owner mark Asset as Sold  
Then pending offers อื่นต้องถูกเปลี่ยนเป็น `Rejected` โดยอัตโนมัติ  
And Chat ที่เกี่ยวข้องยังใช้งานได้

## AC-OFFER-010: Deleted Asset Cancels Offers

Given Asset มี Offer ที่เกี่ยวข้อง  
When Asset ถูกลบ  
Then Offer ที่เกี่ยวข้องต้องเปลี่ยนเป็น Cancelled  
And Chat ยังอยู่พร้อม unavailable asset reference

## AC-OFFER-010A: Asset Under Review Pauses Offer

Given Asset มี Pending Offer  
When Asset ถูก report จนระบบซ่อนชั่วคราวอัตโนมัติ หรือ Admin ซ่อนชั่วคราวระหว่าง review  
Then Offer ต้องเปลี่ยนเป็น `Paused`  
And Offer ต้องไม่อยู่ใน Incoming Offers active list  
And Offer Card ใน Chat ต้องแสดง `Offer Paused`  
And ต้องไม่มีปุ่ม `Accept` หรือ `Decline`

## AC-OFFER-010B: Review Passed Resumes Offer

Given Offer อยู่ในสถานะ `Paused` เพราะ Asset อยู่ระหว่าง review  
When review ผ่านและ Asset กลับเป็น `Sale` หรือ `Show`  
Then Offer ต้องกลับเป็น `Pending`  
And Seller ต้องเห็น `Accept` และ `Decline` ได้อีกครั้ง

## AC-OFFER-010C: Permanent Hide Invalidates Offer

Given Asset มี Pending หรือ Paused Offer  
When Admin ซ่อนถาวร Asset จาก moderation  
Then Offer ต้องเปลี่ยนเป็น `Invalidated`  
And Offer Card ใน Chat ต้องแสดง `Offer Unavailable`  
And ต้องไม่มีปุ่ม `Accept` หรือ `Decline`

## AC-OFFER-010D: Owner Hide Cancels Offer

Given Asset สถานะ `Sale` หรือ `Show` มี Pending Offer  
When Owner เปลี่ยน Asset เป็น `Hide`  
Then Offer ต้องเปลี่ยนเป็น `Cancelled`  
And Offer Card ใน Chat ต้องแสดง `Offer Cancelled`  
And ต้องไม่มีปุ่ม `Accept` หรือ `Decline`

## AC-OFFER-011: No Counter Offer In V1

Given Offer อยู่ใน Pending state  
When Seller หรือ Buyer เปิด Offer  
Then ระบบต้องไม่แสดง Counter Offer action ใน V1

## AC-OFFER-012: No Withdraw Offer In V1

Given Buyer ส่ง Offer แล้ว  
When Buyer เปิด Offer ของตัวเอง  
Then ระบบต้องไม่แสดง Withdraw Offer action ใน V1

---

# 18. Related Modules

- Asset Detail Module
- Asset Management Module
- Chat Module
- Notification Module
- Profile Module
- Portfolio Module

---

# 19. Future Enhancement

- Counter Offer
- Withdraw Offer
- Offer Expiration
- Auto Expire Offer
- Negotiation History
- Payment / Escrow integration
- Offer comparison dashboard
