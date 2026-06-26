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

Offer Module ใช้สำหรับให้ Buyer เสนอราคาซื้อ Asset จากหน้า Asset Detail และให้ Seller พิจารณา Accept หรือ Reject Offer โดยเชื่อมกับ Chat และ Notification

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
| Asset Sold | Offer อื่นถูก Auto Reject | เมื่อ Owner mark as Sold ต้อง reject pending offers อื่นโดยอัตโนมัติ |
| Chat | Chat Room รองรับ Offer Card | Offer ต้องแสดงใน Chat เป็น Offer Card |
| Notification | New Offer -> Chat Room + Focus Offer Card, Offer Accepted -> Chat Room, Offer Rejected -> Asset Detail, Offer Cancelled -> Chat Room + Focus Offer Card | Destination ต้องตรง master |

---

# 5. Figma Gap Checklist For Offer Module

| Priority | Figma Gap | Master Baseline | Action |
| --- | --- | --- | --- |
| High | Make Offer entry point อาจกระจายหลายหน้า | Make Offer ทำผ่าน Asset Detail เท่านั้น | จำกัด entry point ใน Figma ให้เริ่มจาก Asset Detail |
| High | Accepted / Rejected destination ยังต้องตรวจให้ครบ | Accepted เปิด Chat Room, Rejected เปิด Asset Detail | เพิ่มหรือ annotate destination state ให้ตรง master |
| High | ยังไม่เห็น Asset Deleted -> Offer Cancelled state ชัดเจน | Asset Deleted ทำให้ Offer เป็น Cancelled | เพิ่ม cancelled offer state |
| High | ยังไม่เห็น Asset Sold -> Auto Reject other offers ชัดเจน | Asset Sold ต้อง Auto Reject Offer อื่น | เพิ่ม sold impact state และ auto rejected offer state |
| Medium | Incoming Offers ต้องแยก Pending ที่รอ action | Pending Offer ที่ยังไม่ Accept/Reject ต้องอยู่ใน Incoming Offers | ตรวจ list/filter และ empty state |
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
- Seller Reject Offer
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
- Accept หรือ Reject Offer ได้
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

## Reject Offer Flow

```text
Incoming Offers or Chat Room
-> Open Pending Offer
-> Reject
-> Confirm
-> Offer status = Rejected
-> Buyer receives Offer Rejected notification
-> Destination = Asset Detail
```

## Asset Sold Impact Flow

```text
Owner marks Asset as Sold
-> Sold state is recorded
-> Other pending offers are Auto Rejected
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

| Status | Meaning |
| --- | --- |
| Pending | Offer ถูกส่งแล้วและรอ Seller ตัดสินใจ |
| Accepted | Seller ยอมรับ Offer |
| Rejected | Seller ปฏิเสธ Offer |
| Cancelled | Offer ถูกยกเลิกจาก system impact เช่น Asset Deleted |

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

- เมื่อ Asset เปลี่ยนเป็น Sold ต้อง Auto Reject pending offers อื่น
- Chat ที่เกี่ยวข้องยังใช้งานได้
- Sold Asset หายจาก public surfaces ตาม master

## Deleted Asset Impact

- เมื่อ Asset ถูกลบ Offer ที่เกี่ยวข้องทั้งหมดต้องเป็น Cancelled
- Asset Detail ต้องแสดง unavailable state
- Chat ยังอยู่ และ reference asset ต้องแสดงว่า `รายการนี้ไม่พร้อมใช้งานแล้ว`

## Incoming Offers

- Incoming Offers แสดงเฉพาะ Pending Offer ที่ Seller ยังต้องตัดสินใจ
- Offer ที่อ่านแล้วแต่ยังไม่ Accept/Reject ต้องยังอยู่ใน Incoming Offers
- Offer ที่ Accepted, Rejected หรือ Cancelled ต้องไม่อยู่ใน Incoming Offers

## Offer Card In Chat

- Chat Room ต้องรองรับ Offer Card
- Offer Card ต้องแสดงอย่างน้อย: Asset reference, Offer Price, Message, Status, Timestamp
- Seller action บน Offer Card แสดงเฉพาะ Pending Offer ที่ตนมีสิทธิ์ตัดสินใจ
- Buyer เห็น status ของ Offer แต่กด Accept/Reject ไม่ได้

---

# 11. Permission Rules

| Actor | Permission |
| --- | --- |
| Guest | ดู public detail ได้ แต่ใช้ Offer ไม่ได้ |
| Buyer | Make Offer, ดู Offer ของตัวเอง, เปิด Chat ที่เกี่ยวข้อง |
| Seller | ดู Incoming Offers, Accept Offer, Reject Offer |
| Asset Owner | ไม่สามารถ Make Offer กับ Asset ตัวเอง |
| Other User | ไม่มีสิทธิ์เห็นหรือจัดการ Offer |

---

# 12. Validation Rules

| Field / Condition | Rule |
| --- | --- |
| Offer Price | Required |
| Offer Price | ต้องมากกว่า 0 |
| Offer Price Currency | THB |
| Offer Message | รองรับตาม master flow `Add Message` |
| Asset Status | ต้องเป็น Sale ใน V1 |
| Asset Availability | ต้องไม่ Sold และไม่ Deleted |
| Auth State | ต้อง Login ก่อน Make Offer |

---

# 13. Exception Handling

## Asset Sold

- TH: `รายการนี้ขายแล้ว`
- EN: `This item has been sold.`
- Result: ไม่สามารถสร้าง Offer ใหม่ และ pending offers อื่นถูก Auto Rejected

## Asset Deleted

- TH: `รายการนี้ไม่พร้อมใช้งานแล้ว`
- EN: `This item is no longer available.`
- Result: Offer ที่เกี่ยวข้องเป็น Cancelled

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
When user ส่ง Offer โดยไม่กรอก Offer Price หรือกรอกราคาไม่มากกว่า 0  
Then ระบบต้องไม่สร้าง Offer และต้องแสดง validation error

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

## AC-OFFER-006: Seller Rejects Offer

Given Seller เห็น Pending Offer ของ Asset ตัวเอง  
When Seller Reject Offer และ Confirm  
Then Offer ต้องเปลี่ยนเป็น Rejected  
And Buyer ต้องได้รับ Offer Rejected notification  
And notification destination ต้องเป็น Asset Detail

## AC-OFFER-007: Incoming Offers Pending Rule

Given Offer ยังเป็น Pending  
When Seller อ่าน Offer แต่ยังไม่ Accept หรือ Reject  
Then Offer ต้องยังอยู่ใน Incoming Offers

## AC-OFFER-008: Accepted / Rejected Removed From Incoming

Given Offer ถูก Accept หรือ Reject แล้ว  
When Seller กลับไป Incoming Offers  
Then Offer นั้นต้องไม่อยู่ใน Incoming Offers  
And Offer Card ยังอยู่ใน Chat history

## AC-OFFER-009: Sold Auto Rejects Other Offers

Given Asset มีหลาย Pending Offers  
When Owner mark Asset as Sold  
Then pending offers อื่นต้องถูก Auto Rejected  
And Chat ที่เกี่ยวข้องยังใช้งานได้

## AC-OFFER-010: Deleted Asset Cancels Offers

Given Asset มี Offer ที่เกี่ยวข้อง  
When Asset ถูกลบ  
Then Offer ที่เกี่ยวข้องต้องเปลี่ยนเป็น Cancelled  
And Chat ยังอยู่พร้อม unavailable asset reference

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
