# 07 Chat Module

อ้างอิงหลักจาก [TukDaeng_Master_Product_Definition.md](TukDaeng_Master_Product_Definition.md)

---

# 1. Document Information

| Item | Detail |
|---|---|
| Module Name | Chat |
| Platform | Mobile Application |
| Version | V1 |
| Owner | Product / UX / Engineering |
| Status | Draft |
| Document Type | Functional PRD |

---

# 1.1 Revision 2026-10 — Chat View (CHAT-001)

ข้อสรุปจากประชุมล่าสุด (พี่คิง) **override กฎเดิมในเอกสารนี้ที่ขัดกัน** โดยเฉพาะเรื่อง Offer Card / Accept-Reject ในห้องแชท และ Pinned Asset Bar

| หัวข้อ | กฎใหม่ |
|---|---|
| รูปแบบห้องแชท | แชทซ้าย-ขวาแบบ LINE / IG Direct — ข้อความเรา = ขวา (สีหลัก), คู่สนทนา = ซ้าย (พร้อม avatar), เวลา/สถานะ Read อยู่ข้าง bubble, คั่นวัน |
| การต่อรองราคา | พิมพ์คุยกันตามธรรมชาติ **ไม่มี Offer Card และไม่มีปุ่ม Accept / Reject ในห้องแชท** |
| อ้างอิงโพสต์สินค้า (CHAT-004) | เมื่อทักจากฟีด/โพสต์ แสดงการ์ดอ้างอิงโพสต์สินค้า (รูป + ชื่อ + ราคา + เจ้าของโพสต์) **แนบอยู่ในสายแชท (Message Stream) ฝั่งของผู้ส่งข้อความสอบถาม** ตามสไตล์การแชร์โพสต์ใน Instagram Direct (ไม่มีการ์ดลอยคั่นกลางจอ และในแอปไม่มี Story) มีข้อความแชทที่พิมพ์สอบถามต่อท้ายทันที แตะที่การ์ดแล้วเปิด Asset Detail ได้ |
| Pinned Item Bar | **ยกเลิก** — ไม่มีแถบปักหมุดสินค้าด้านบนห้อง (ข้อความ/สินค้าล่าสุดอยู่ล่างสุดตามธรรมชาติของแชท) |
| Chat Center | หน้ารวมแชท = ศูนย์กลางประวัติสนทนา สอบถาม และซื้อขายทั้งหมด |
| View Toggle | ปุ่มสลับมุมมอง 2 แบบในหน้า Chat List: **Chats** (เรียงตามคู่สนทนา + เวลาล่าสุด, unread badge) และ **Items** (จัดกลุ่มตามสินค้า) |
| Items Filter Dropdown (CHAT-002, CHAT-003) | แท็บ Items มีลูกศรชี้ลง `▼` สไตล์ LINE (แท็บ Chats ไม่มีลูกศร) — กดแล้วกาง Popover Filter มุมมน มีตัวเลือก **All items**, **Your listings**, และ **Items you asked about** พร้อม checkmark `✓` แสดงตัวเลือกปัจจุบัน กรองรายการสินค้าทันที; เมื่อสลับเมนูไปหน้าอื่น (เช่น Feed หรือ Profile) หรือกดไอคอน Chat ที่แถบเมนูล่างเพื่อเข้าแชทใหม่ ระบบจะรีเซ็ตกลับสู่มุมมองเริ่มต้นที่หน้า **Chats** ปกติ พร้อมเคลียร์ตัวกรองกลับเป็นค่าเริ่มต้นเสมอ |
| Item → ผู้ทัก (CHAT-003) | **Your listings**: แถวสินค้าแสดงชื่อสินค้าคลีน (ไม่มีเลขวงเล็บซ้ำซ้อน) + ราคาและจำนวนแชท (เช่น `THB 380,000 · 14 chats` โดยตัดข้อความ unread ออกไม่ให้ซ้ำกับป้ายตัวเลขสีแดงทางขวา), เมื่อกดสินค้าจะเปิดหน้า Item chats เพื่อเลือกดูรายชื่อผู้ทักทั้งหมด โดยการ์ดหัวเรื่องปรับเป็นดีไซน์แคปซูลลอย (Floating Pill Capsule สไตล์เดียวกับแคปซูล Chats/Items ขอบมนกลม 999px + เงาลอยโปร่งแสง + รูปสินค้าทรงกลม badge 52px) บรรจุอยู่ภายในคอนเทนเนอร์เลื่อน (`ch-scroll`) ทำให้เลื่อนหน้าจอได้ทั้งหมดโดยไม่ฟิกตำแหน่งช่องค้นหา (แถวแชทสูง ~64px, avatar 44×44px เต็มรูป, preview 1 บรรทัด, unread badge, swipe actions) → กดเข้าห้องแชท; เมื่อกดย้อนกลับ `<` มาหน้า Items แล้วแตะสลับแท็บ Chats จะสลับมุมมองทันทีโดยไม่สไลด์หน้าจอซ้ำ<br>**Items you asked about**: แถวสินค้าแสดงราคา + ข้อความล่าสุดที่คุยกับผู้ขาย, เมื่อแตะสินค้าจะเปิดตรงเข้าสู่ห้องแชท (Chat Room) กับผู้ขายรายนั้นทันที โดยไม่ต้องผ่านหน้า Item chats ซ้ำซ้อน เนื่องจากมีคู่สนทนารายเดียวเสมอ |
| Quick Ask | ปุ่ม Ask บนโพสต์ฟีด/Post viewer/Detail เปิดห้องแชททันทีพร้อมการ์ดอ้างอิงโพสต์และข้อความเริ่มต้นที่แก้ไขได้ (ค่าตั้งใน Chat Config) — ถ้ามีห้องเดิมของ user+สินค้าเดียวกันให้เปิดห้องเดิม, ห้องใหม่จะถูกสร้างในรายการเมื่อส่งข้อความแรก, ทักโพสต์ของตัวเองไม่ได้ |
| Chat Config | ปุ่มตั้งค่าอยู่ที่หน้า Chat โดยตรง (ไอคอนเฟืองใน header) ไม่อยู่ใน Profile Settings: แจ้งเตือนข้อความ, แสดง preview, Read receipts, เฉพาะคนที่ follow ทักได้, มุมมองเริ่มต้น (People/Items), ข้อความ Quick Ask |
| Swipe Actions (LINE Style) | **Swipe Left (ปัดซ้าย)**: ปุ่ม `Hide` (สีเทา) ซ่อนแชท และ `Delete` (สีแดง) ลบแชทพร้อม Modal ยืนยัน<br>**Swipe Right (ปัดขวา)**: ปุ่มวงกลมสีเขียว LINE 2 ปุ่ม ได้แก่ `Mute/Unmute` (เปิด/ปิดแจ้งเตือน มีไอคอนลำโพงข้างชื่อ) และ `Pin/Unpin` (ปักหมุด มี badge หมุดสีน้ำเงินมุมขวาล่างของ Avatar และจัดแชทที่ Pin ขึ้นบนสุดของรายการ) |

Prototype: `Prototypes/fo-flow/index.html` — เมนู Chat ใน bottom nav (`data-navgo="chat"`), sub pages `chat`, `chatitem:<itemId>`, `chatroom:<threadId>`, `chatcfg`.

---

# 2. Objective

Chat Module ใช้สำหรับการสนทนาระหว่างผู้ซื้อและผู้ขาย โดยผูกบริบทกับ Asset Reference และ Offer Card เพื่อให้ผู้ใช้พูดคุย ต่อรองราคา ติดตาม Offer และดูสถานะ Asset ที่เกี่ยวข้องได้จากห้องสนทนาเดียวกัน

โมดูลนี้ต้องคุม behavior ของ Chat Room, Asset Reference, Offer lifecycle, Block / Report และ Deleted / Sold Asset ให้ตรง master เพื่อไม่ให้ Chat หายผิดเงื่อนไขหรือแสดง Asset ที่ไม่พร้อมใช้งานเหมือนยังใช้งานได้

---

# 3. Prototype Reference

- `Chat.png`
- `Detail asset viewer.png`
- `Detail asset owner.png`
- `Notification.png`

---

# 4. Master Alignment Summary

Chat Module ต้องยึด master baseline ต่อไปนี้เป็นหลัก:

- Chat ใช้สำหรับการสนทนาระหว่างผู้ซื้อและผู้ขาย
- สร้าง Chat Room เมื่อส่งข้อความแรก ไม่ใช่เมื่อกดปุ่ม Chat อย่างเดียว
- Same Asset ใช้ห้องเดิม
- Different Asset ใช้ห้องเดิม แต่ Reference Asset เปลี่ยนเป็น Asset ล่าสุด
- Asset Deleted แล้ว Chat ยังอยู่
- Asset Deleted ต้องแสดง Reference Asset ว่า `รายการนี้ไม่พร้อมใช้งานแล้ว`
- Asset Sold แล้ว Chat ยังใช้งานได้
- Search Chat รองรับ
- Block User รองรับ
- Report User รองรับ
- Chat Room รองรับ Text, Image, File, Asset Card, Offer Card
- Delete Chat ต้องมี Confirmation
- Accepted Offer เปิด Chat Room
- Rejected Offer เปิด Asset Detail
- Asset Deleted ทำให้ Offer เป็น Cancelled
- Asset Sold ต้อง Auto Reject Offer อื่น
- Offer Accepted Notification เปิด Chat Room
- Offer Rejected Notification เปิด Asset Detail

---

# 5. Figma Gap Checklist For Chat Module

รายการนี้ใช้เป็น checklist สำหรับปรับ Figma เฉพาะ Chat Module ให้ตรงกับ master ก่อนส่งต่อ Dev/QA

| Priority | Gap | Master Baseline | Figma Action |
|---|---|---|---|
| High | ยังไม่เห็น Asset Deleted state ใน Chat ชัดเจน | Chat ยังอยู่ แต่ Reference Asset ต้องแสดง `รายการนี้ไม่พร้อมใช้งานแล้ว` | เพิ่ม deleted asset reference state ใน Chat Room |
| High | ยังไม่เห็น Asset Sold state / sold continuation ชัดเจน | Asset Sold แล้ว Chat ยังใช้งานได้ | เพิ่ม sold asset reference state และยืนยันว่าส่งข้อความต่อได้ |
| High | ยังไม่เห็น Block / Report entry ใน Chat | Chat ต้องรองรับ Block User และ Report User | เพิ่ม action menu/state สำหรับ block/report |
| High | Offer Accepted / Rejected destination ยังไม่ครบ | Accepted Offer เปิด Chat Room; Rejected Offer เปิด Asset Detail | เพิ่ม destination states จาก notification และ offer cards |
| Medium | Room creation อาจสื่อว่าสร้างเมื่อกด Chat | Chat Room ต้องสร้างเมื่อส่งข้อความแรก | ปรับ empty/pre-chat state ให้ชัดว่า room created หลังส่งข้อความแรก |
| Medium | Different Asset same user rule ยังไม่ชัด | Different Asset ใช้ห้องเดิม แต่ Reference Asset เปลี่ยนเป็น Asset ล่าสุด | เพิ่ม flow/state ที่ reference asset เปลี่ยนตาม asset ล่าสุด |
| Medium | Delete Chat behavior ยังไม่ผูก confirmation ชัดเจน | Delete Chat ซ่อนห้องจาก Chat List เฉพาะฝั่งผู้กด ไม่ลบ server history และไม่กระทบคู่สนทนา | เพิ่ม delete confirmation state พร้อม copy ว่าเป็นการซ่อนจากรายการของผู้ใช้คนนี้เท่านั้น |
| Medium | Attachment type ยังไม่ล็อกใน Figma | Master รองรับ Text, Image, File, Asset Card, Offer Card | ระบุ allowed attachment/content types ตาม master |
| Medium | Delete Chat restore UI ต้องไม่อยู่ใน V1 | V1 ไม่มี restore UI และยังคง message/archive ฝั่ง server ตาม retention policy | ห้ามเพิ่ม restore UI ใน Figma V1 |

---

# 6. Scope

Chat Module ใน V1 ครอบคลุม:

- Chat List
- Chat Room
- Start Chat from Asset Detail
- Text Message
- Image Message
- File Message
- Asset Reference Card
- Offer Card
- Incoming Offers view / filter
- Search Chat
- Unread Count
- Delete Chat with Confirmation
- Block User
- Report User
- Asset Deleted Reference State
- Asset Sold Reference State

ไม่รวมใน V1:

- Voice Message
- Read Receipt
- Typing Indicator
- Message Reaction
- Pinned Message
- Message Edit
- Group Chat

---

# 7. Screen Mapping

หน้าจอที่เกี่ยวข้องในโมดูลนี้:

1. Chat List
2. Chat Room
3. Pre-Chat / First Message State
4. Incoming Offers
5. Asset Reference Card
6. Offer Card
7. Deleted Asset Reference State
8. Sold Asset Reference State
9. Search Chat
10. Delete Chat Confirmation
11. Block User Confirmation
12. Report User
13. Empty Chat State
14. Unable To Send State
15. Global Login Required Dialog

---

# 8. User States

## Guest

ไม่สามารถใช้งาน Chat

เมื่อ Guest กด Chat, Make Offer หรือ feature ที่ต้อง Login ต้องแสดง Global Login Required Dialog

## Member

สามารถ:

- Start Chat จาก Asset Detail
- Send Message
- View Chat List
- Open Chat Room
- Search Chat
- View Asset Reference Card
- View Offer Card
- Delete Chat ตาม rule
- Block User
- Report User

## Blocked Relationship

เมื่อ User ถูก Block หรือ Block กัน:

- ต้องไม่สามารถส่งข้อความหากันได้
- Asset ของผู้ถูก Block ต้องหายจาก Feed, Search และ Watch Alert Result
- Chat history เดิมยังอ่านได้แบบ read-only
- การส่งข้อความใหม่และการสร้าง Offer / Chat ใหม่ระหว่างคู่ที่ block กันต้องถูกปิด

---

# 9. User Flow

## Start Chat

```text
Asset Detail
→ Chat
→ Pre-Chat / Empty Room State
→ Send First Message
→ Chat Room Created
```

## Continue Chat

```text
Chat List
→ Chat Room
→ Send Message
```

## Same Asset Chat

```text
Asset Detail
→ Chat
→ Existing Chat Room
→ Reference Asset remains same
```

## Different Asset Same User Chat

```text
Different Asset Detail
→ Chat
→ Existing Chat Room With Same User
→ Reference Asset updates to latest Asset
```

## Make Offer To Chat

```text
Asset Detail
→ Make Offer
→ Send Offer
→ Offer Sent Successfully
→ Chat Room
→ Offer Card
```

## Open Offer Accepted Notification

```text
Notification
→ Offer Accepted
→ Chat Room
```

## Open Offer Rejected Notification

```text
Notification
→ Offer Rejected
→ Asset Detail
```

## Delete Chat

```text
Chat Room / Chat List
→ Delete Chat
→ Confirmation
→ Chat Removed From User View
```

## Block User

```text
Chat Room
→ More Menu
→ Block User
→ Confirmation `Block this user?`
→ Block Applied
```

## Report User

```text
Chat Room
→ More Menu
→ Report User
→ Submit Report
```

---

# 10. Business Rules

## Room Creation Rule

- Chat Room สร้างเมื่อส่งข้อความแรก
- การกดปุ่ม Chat เพียงอย่างเดียวเปิด Pre-Chat / Empty Room State ได้ แต่ยังไม่ถือว่าสร้าง room ถ้ายังไม่มีข้อความ

## Same Asset Rule

หากเป็นคู่ User เดิมและ Asset เดิม:

- ใช้ Chat Room เดิม
- Reference Asset คงเป็น Asset เดิม

## Different Asset Rule

หากเป็นคู่ User เดิมแต่ Asset ใหม่:

- ใช้ Chat Room เดิม
- Reference Asset เปลี่ยนเป็น Asset ล่าสุดที่เริ่ม conversation
- ประวัติการอ้างอิง Asset เดิมยังอยู่ใน Chat History ผ่าน message / asset card เดิม

## Asset Reference Rule

Chat Room ต้องมี Asset Reference Card เพื่อบอกบริบท Asset ล่าสุด

Asset Reference Card ต้องรองรับ state:

- Active Asset
- Sold Asset
- Deleted Asset / Unavailable Asset

## Asset Deleted Rule

เมื่อ Asset ถูกลบ:

- Chat ยังอยู่
- Reference Asset ต้องแสดง `รายการนี้ไม่พร้อมใช้งานแล้ว`
- Offer ที่เกี่ยวข้องต้องเป็น Cancelled
- หากเปิด Asset Detail จาก reference เก่า ต้องใช้ Deleted Asset State ของ Asset Detail Module

## Asset Sold Rule

เมื่อ Asset ถูก Sold:

- Chat ยังใช้งานได้
- Asset Sold ต้อง Auto Reject Offer อื่น
- Owner ยังเห็น Asset ใน Owner Profile และ Sold History
- Reference Asset ต้องไม่ทำให้เข้าใจว่า Asset ยังซื้อขายได้ตามปกติ

## Offer Card Rule

Chat Room ต้องรองรับ Offer Card

Offer state และ validation ให้ยึด Offer Module

ผลของ Offer:

- Accepted Offer เปิด Chat Room
- Rejected Offer เปิด Asset Detail
- Asset Deleted ทำให้ Offer เป็น Cancelled
- Asset Sold ต้อง Auto Reject Offer อื่น

## Incoming Offers Rule

Incoming Offers แสดงเฉพาะ Offer ที่รอการตัดสินใจ

เมื่อ Offer Accepted หรือ Rejected:

- Offer ต้องหายจาก Incoming Offers
- Chat Room ยังอยู่ใน Chat List / All Chat

Offer ที่อ่านแล้วแต่ยังไม่ action:

- ยังคงอยู่ใน Incoming Offers

## Message Type Rule

Chat Room รองรับ:

- Text
- Image
- File
- Asset Card
- Offer Card

## Search Chat Rule

Search Chat ต้องรองรับการค้นหาห้องสนทนา

รายละเอียด search field / searchable content ให้กำหนดใน implementation หรือ Chat sub-spec หากต้องการเพิ่มความละเอียด

## Chat Room Action Menu Rule

Chat Room overflow menu (`...`) must show only room-level and user-safety actions in this order:

1. `View profile`
2. `Mute notifications` or `Unmute notifications`
3. `Delete chat`
4. `Report user`
5. `Block user`

Menu behavior:

- `View profile` opens the other user's Public Profile.
- `Search in chat` must not be duplicated in this menu when the header already has a search icon.
- `Mute notifications` toggles room-level chat notifications immediately and auto-saves.
- After mute succeeds, show toast `Notifications muted` and change the menu label to `Unmute notifications`.
- After unmute succeeds, show toast `Notifications unmuted` and change the menu label back to `Mute notifications`.
- `Delete chat`, `Report user`, and `Block user` are destructive/safety actions and must be visually separated or styled as destructive actions according to design system.

## Chat Sorting Rule

Chat List เรียงตาม:

- Latest Message DESC

## Unread Count Rule

Chat List ต้องรองรับ Unread Count

Unread Count ต้องอัปเดตเมื่อ:

- มีข้อความใหม่
- User เปิดอ่าน Chat Room

## Delete Chat Rule

- Delete Chat ต้องมี Confirmation
- Delete Chat V1 = ซ่อนห้องแชทจาก Chat List เฉพาะฝั่งผู้กด
- Delete Chat ไม่ลบ message/archive ฝั่ง server
- Delete Chat ไม่กระทบคู่สนทนา
- Delete Chat ไม่ลบหลักฐาน offer/chat history
- ไม่มี restore UI ใน V1
- Confirmation copy ต้องสื่อว่าเป็นการซ่อนจากรายการของผู้ใช้คนนี้เท่านั้น ไม่ใช่การลบประวัติของอีกฝ่าย

Delete Chat confirmation copy:

- Title: `Delete chat?`
- Body:
  - `This chat will be removed from your inbox.`
  - `The other person may still see the conversation.`
  - `Some records may be retained for safety, fraud prevention, legal, or audit purposes.`
- Actions: `Cancel`, `Delete chat`

Delete Chat result:

- Success toast: `Chat deleted`
- API error: `Unable to delete chat. Please try again.`
- On success, return to Chat List and remove the room from the actor's Chat List only.

## Block User Rule

Chat ต้องรองรับ Block User

Product review สำหรับ V1:

- Chat history เดิมยังอ่านได้แบบ read-only
- การส่งข้อความใหม่ต้องถูกปิดหลัง block
- การสร้าง Chat / Offer ใหม่ระหว่างคู่ที่ block กันต้องถูกปิด
- Block User จาก Chat ต้องเปิด confirmation ก่อน block
- Confirmation ใน Chat Menu แสดงปุ่ม `Block` เพียงปุ่มเดียว (ตัดปุ่ม `Block and report` ออกเฉพาะในแชท ส่วนจุดอื่นในแอป เช่น Profile ยังคงมีทั้ง `Block` และ `Block and report` ตามเดิม)
- หากกด `Cancel` หรือ dismiss confirmation ต้องไม่เปลี่ยน block state และต้องยังส่งข้อความได้ตาม permission เดิม
- Body และ success feedback ให้ใช้ copy กลางจาก Trust & Safety Module

เมื่อ Block แล้ว:

- ส่งข้อความหากันไม่ได้
- Asset ของผู้ถูก Block ต้องหายจาก Feed, Search และ Watch Alert Result ตาม Trust & Safety
- ความสัมพันธ์ Follow ระหว่างกันต้องไม่ถูกใช้ใน Following Feed

## Report User Rule

Chat Menu รองรับปุ่ม Quick Action `Report` ควบคู่กับ Mute, Profile, Block

- เมื่อกดปุ่ม Report ใน Chat Menu จะเปิด Bottom Sheet ในรูปแบบและสไตล์เดียวกับ Block Bottom Sheet (Handle ด้านบน, Avatar ผู้ใช้กึ่งกลาง, Title, Description และปุ่มการกระทำ)
- Title: `Are you sure you want to report [User]?`
- Description: `If this user appears suspicious, please report them. Selecting "Report and delete" will delete this chat and its associated history.`
- Actions:
  - `Report and delete` (ปุ่มหลักสีแดง): เข้าสู่ Flow รายงานผู้ใช้ (หากส่งรายงานสำเร็จจะลบแชทออกจากอุปกรณ์/รายการแชทของผู้ใช้)
  - `Report` (ปุ่มรอง): เข้าสู่ Flow รายงานผู้ใช้โดยไม่ลบประวัติการสนทนา
  - `Cancel`: ปิด Bottom Sheet และอยู่บนหน้า Chat Menu ต่อไป
- Flow การรายงานจาก Chat Menu:
  - เข้าสู่หน้าเหตุผลการรายงานบัญชี (`Why are you reporting this account?`) โดยตรงทันที ไม่ต้องผ่านหน้าเลือกว่าจะรายงานโพสต์หรือบัญชี
  - Header ของหน้ารายงานที่เปิดจากแชทจะไม่มีปุ่มย้อนกลับ `<` โดยมีเพียงชื่อหน้า `Report` ตรงกลาง และปุ่มปิด `✕` ด้านขวา
  - เมื่อกดปุ่มปิด `✕` จะปิดหน้ารายงานและกลับมายังหน้า Chat Menu (การตั้งค่าแชท)
  - ในหน้ายืนยันผลการรายงาน (`Thanks for your feedback`) หากกดขั้นตอนเพิ่มเติม `Block [User]` แผ่นยืนยันการบล็อกจะแสดงปุ่ม `Block` เพียงปุ่มเดียว (ไม่มีปุ่ม `Block and report` เนื่องจากอยู่ใน Flow รายงานแล้ว เพื่อไม่ให้เกิดความซ้ำซ้อน)
- การ Report ไม่ทำให้ Asset หรือ Content หายทันที แต่จะเข้าสู่คิวการตรวจสอบของ Admin ตาม Moderation Policy

---

# 11. Permission Rules

## Guest

ไม่สามารถ:

- Open Chat
- Send Message
- Make Offer
- View Chat List

## Member

สามารถ:

- Open Chat
- Send Message
- View Chat List
- Search Chat
- Delete Chat
- Block User
- Report User

## Blocked User

ไม่สามารถ:

- Send Message ไปยัง User ที่ Block หรือถูก Block

---

# 12. Validation Rules

## Message

- Required
- ต้องไม่เป็นค่าว่าง

## Image / File

- ต้องเป็น file type ที่ระบบอนุญาต
- รายละเอียด max size / type ให้กำหนดใน implementation หรือ sub-spec

## Offer

ตรวจสอบใน Offer Module

## Report

ตรวจสอบใน Trust & Safety Module

---

# 13. Exception Handling

## User Blocked

| Language | Message |
|---|---|
| TH | ไม่สามารถส่งข้อความได้ |
| EN | Unable to send message. |

## Asset Deleted Reference

| Language | Message |
|---|---|
| TH | รายการนี้ไม่พร้อมใช้งานแล้ว |
| EN | This item is no longer available. |

## Send Message Error

| Language | Message |
|---|---|
| TH | ส่งข้อความไม่สำเร็จ กรุณาลองใหม่อีกครั้ง |
| EN | Message could not be sent. Please try again. |

## Delete Chat Confirmation

ต้องแสดง confirmation ก่อน Delete Chat

---

# 14. Empty State

## Chat List Empty State

| Language | Message |
|---|---|
| TH | ไม่พบข้อมูล |
| EN | No data found |

## Incoming Offers Empty State

| Language | Message |
|---|---|
| TH | ไม่พบข้อมูล |
| EN | No data found |

---

# 15. Notification Rules

- New Message แสดงเป็น unread/badge ภายใน Chat ได้ แต่ไม่ใช่ Notification Center type ใน FO V1 baseline
- New Offer ส่ง Notification ตาม Offer / Notification Module
- Offer Accepted ส่ง Notification และเปิด Chat Room
- Offer Rejected ส่ง Notification และเปิด Asset Detail
- Offer Paused เปิด Chat Room และ Focus Offer Card โดยไม่มี Accept/Decline
- Offer Cancelled เปิด Chat Room และ Focus Offer Card ที่เป็น final state
- Offer Invalidated เปิด Chat Room และ Focus Offer Card ที่เป็น unavailable final state

## Offer Card State In Chat

| Offer state | Chat display | Seller action |
|---|---|---|
| `Pending` | แสดง Offer Card พร้อมราคา, asset, message และ timestamp | แสดง `Decline` / `Accept` เฉพาะ Seller |
| `Paused` | แสดง `Offer Paused` และข้อความ `This asset is under review. The offer cannot be accepted or declined right now.` | ไม่มี action หรือ disabled ทั้งคู่ |
| `Accepted` | แสดง `Offer Accepted` และข้อความ `The buyer has been notified.` | ไม่มี action |
| `Rejected` | แสดง `Offer Declined` และข้อความ `The buyer has been notified.` | ไม่มี action |
| `Cancelled` | แสดง `Offer Cancelled` และข้อความ `This asset is no longer available for offers.` | ไม่มี action |
| `Invalidated` | แสดง `Offer Unavailable` และข้อความ `This asset was removed after review.` | ไม่มี action |

`Paused` ต้องไม่ถูกนับเป็น active Incoming Offer ระหว่าง asset review; ถ้า review ผ่านและ Offer กลับเป็น `Pending` จึงแสดงใน Incoming Offers อีกครั้ง

Notification destination:

| Notification | Destination |
|---|---|
| New Message | In-chat unread/badge only; no FO Notification Center type in V1 |
| Offer Accepted | Chat Room |
| Offer Rejected | Asset Detail |
| Offer Paused | Chat Room + Focus Offer Card |
| Offer Cancelled | Chat Room + Focus Offer Card |
| Offer Invalidated | Chat Room + Focus Offer Card |

---

# 16. Analytics Events

- Chat List Open
- Chat Room Open
- Create Chat Room
- Send Message
- Receive Message
- Search Chat
- Delete Chat
- Mute Chat Notifications
- Block User From Chat
- Report User From Chat
- Open Asset Reference
- Offer Card Viewed
- Offer Accepted From Chat
- Offer Rejected From Chat

---

# 17. Acceptance Criteria

## Room & Reference

| AC ID | Criteria |
|---|---|
| AC-CHAT-001 | Chat Room ต้องถูกสร้างเมื่อส่งข้อความแรก ไม่ใช่แค่กดปุ่ม Chat |
| AC-CHAT-002 | Same User + Same Asset ต้องใช้ Chat Room เดิม |
| AC-CHAT-003 | Same User + Different Asset ต้องใช้ Chat Room เดิม |
| AC-CHAT-004 | Same User + Different Asset ต้องเปลี่ยน Reference Asset เป็น Asset ล่าสุด |
| AC-CHAT-005 | Asset Reference Card ต้องแสดงใน Chat Room |

## Deleted / Sold Asset

| AC ID | Criteria |
|---|---|
| AC-CHAT-006 | เมื่อ Asset ถูกลบ Chat ต้องยังอยู่ |
| AC-CHAT-007 | เมื่อ Asset ถูกลบ Reference Asset ต้องแสดง `รายการนี้ไม่พร้อมใช้งานแล้ว` / `This item is no longer available.` |
| AC-CHAT-008 | เมื่อ Asset ถูกลบ Offer ที่เกี่ยวข้องต้องเป็น Cancelled |
| AC-CHAT-009 | เมื่อ Asset Sold Chat ต้องยังใช้งานได้ |
| AC-CHAT-010 | เมื่อ Asset Sold Offer อื่นต้องถูก Auto Reject ตาม Offer Module |

## Message / Chat List

| AC ID | Criteria |
|---|---|
| AC-CHAT-011 | Chat Room ต้องรองรับ Text, Image, File, Asset Card และ Offer Card |
| AC-CHAT-012 | Message ต้องไม่เป็นค่าว่าง |
| AC-CHAT-013 | Chat List ต้องเรียงตาม Latest Message DESC |
| AC-CHAT-014 | Chat List ต้องรองรับ Unread Count |
| AC-CHAT-015 | Search Chat ต้องใช้งานได้ |

## Offer Integration

| AC ID | Criteria |
|---|---|
| AC-CHAT-016 | Incoming Offers ต้องแสดงเฉพาะ Offer ที่รอการตัดสินใจ |
| AC-CHAT-017 | Offer Accepted ต้องหายจาก Incoming Offers และยังอยู่ใน Chat Room / All Chat |
| AC-CHAT-018 | Offer Rejected ต้องหายจาก Incoming Offers และยังอยู่ใน Chat Room / All Chat |
| AC-CHAT-019 | Offer ที่อ่านแล้วแต่ยังไม่ action ต้องยังอยู่ใน Incoming Offers |
| AC-CHAT-020 | Offer Accepted Notification ต้องเปิด Chat Room |
| AC-CHAT-021 | Offer Rejected Notification ต้องเปิด Asset Detail |
| AC-CHAT-021A | Offer Paused ต้องหายจาก Incoming Offers active list และ Offer Card ต้องไม่มี `Accept` / `Decline` |
| AC-CHAT-021B | Offer Cancelled และ Invalidated ต้องเป็น final Offer Card state และไม่มี `Accept` / `Decline` |

## Permission / Safety

| AC ID | Criteria |
|---|---|
| AC-CHAT-022 | Guest ต้องไม่สามารถใช้งาน Chat ได้ |
| AC-CHAT-023 | เมื่อ Guest กด Chat ต้องแสดง Global Login Required Dialog |
| AC-CHAT-024 | Blocked User ต้องไม่สามารถส่งข้อความหากันได้ |
| AC-CHAT-025 | Chat ต้องมี entry สำหรับ Block User |
| AC-CHAT-026 | Chat ต้องมี entry สำหรับ Report User |
| AC-CHAT-026A | หลัง Block แล้ว chat history เดิมยังอ่านได้แบบ read-only และไม่สามารถสร้าง Chat / Offer ใหม่ระหว่างคู่ที่ block กัน |
| AC-CHAT-026B | Block User จาก Chat ต้องเปิด confirmation `Block this user?`; cancel/dismiss ต้องไม่ block user |

## Delete Chat

| AC ID | Criteria |
|---|---|
| AC-CHAT-027 | Delete Chat ต้องมี Confirmation |
| AC-CHAT-028 | Delete Chat ต้องซ่อนห้องแชทจาก Chat List เฉพาะฝั่งผู้กด |
| AC-CHAT-029 | Delete Chat ต้องไม่ลบ message/archive ฝั่ง server และไม่กระทบคู่สนทนา |
| AC-CHAT-030 | Delete Chat ต้องไม่ลบหลักฐาน offer/chat history และไม่มี restore UI ใน V1 |

---

## Chat Room Header Search & LINE-Style Menu Criteria

| AC ID | Criteria |
|---|---|
| AC-CHAT-031 | When tapping search icon in Chat Room header, the search bar replaces the entire header (`placeholder="Messages"`, search icon, clear button, and close `✕` button); typing highlights matching terms and dims non-matching messages; closing returns to normal header |
| AC-CHAT-032 | When tapping hamburger menu (`≡`) in Chat Room header, opens Chat Menu sub-page with back `<` pinned left and centered partner name, 3 circular action buttons (`Mute/Unmute`, `Profile`, `Block/Unblock` which opens TukDaeng app standard Block confirmation bottom sheet with Block & Report actions, or Unblock dialog), and content rows |
| AC-CHAT-033 | Chat Menu list rows include `Photos & videos` (showing horizontal thumbnail strip without border and 4px radius when populated, or a light rounded card with "No photos or videos found." when empty), and `Listings & Items` (single-line label, truncated item caption with ellipsis, navigating to post detail screen) |
| AC-CHAT-034 | Chat Media Gallery sub-page displays in-chat media grouped by date; direct photo grid without unnecessary tabs (no Links/Files tabs); tapping a photo opens the Photo Viewer strictly contained within the mobile device frame |
| AC-CHAT-035 | In Chat Media Gallery Select Mode, selected items display sequential badges (`1`, `2`, ...); bottom action bar provides Delete (Trash) and Download actions (Share action is excluded); empty gallery displays "No photos or videos found." empty card; closing (`✕`) returns smoothly to Chat Menu without sliding animation |

---

# 18. Related Modules

- Asset Detail Module
- Asset Management Module
- Offer Module
- Notification Module
- Profile Module
- Trust & Safety Module

---

# 19. Future Enhancement

- Voice Message
- Read Receipt
- Typing Indicator
- Message Reaction
- Pinned Message
- Message Edit
- Group Chat
