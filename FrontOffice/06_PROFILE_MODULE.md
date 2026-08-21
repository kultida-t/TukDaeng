# 06 Profile Module

อ้างอิงหลักจาก [TukDaeng_Master_Product_Definition.md](TukDaeng_Master_Product_Definition.md)

---

# 1. Document Information

| Item | Detail |
|---|---|
| Module Name | Profile |
| Platform | Mobile Application |
| Version | V1 |
| Owner | Product / UX / Engineering |
| Status | Draft |
| Document Type | Functional PRD |

---

# 2. Objective

Profile Module ใช้สำหรับแสดงข้อมูลผู้ใช้งาน แสดง Asset ของผู้ใช้งานตามสิทธิ์ แยกมุมมอง Owner Profile และ Public Profile ให้ชัดเจน และเป็น entry point สำหรับ Edit Profile, Follow / Unfollow, Public Asset browsing และ Portfolio ของ Owner

โมดูลนี้ต้องควบคุม asset visibility และ private data ตาม master โดย Public Profile เห็นเฉพาะ Asset ที่ public เท่านั้น และต้องไม่เปิดเผยข้อมูล Provenance, Consignment, Sold History หรือ Portfolio Value Detail ให้ Viewer

---

# 3. Prototype Reference

- `Main Owner Profile.png`
- `Main Viewer Profile.png`
- `Menu & Profile Setting.png`

---

# 4. Master Alignment Summary

Profile Module ต้องยึด master baseline ต่อไปนี้เป็นหลัก:

- Owner Profile เห็น Asset ของตัวเองทุกสถานะ: `Sale`, `Show`, `Hide`, `Sold`
- Owner Profile ต้องมี Profile Image, Name, Followers, Following, Total Asset Value, Edit Profile
- Owner Profile ต้องมี Asset Tabs: `All`, `Sale`, `Show`, `Hide`, `Sold`
- Total Asset Value เป็น entry point สำหรับกดเข้า Portfolio
- Public Profile เห็นเฉพาะ Asset สถานะ `Sale` และ `Show`
- Public Profile ต้องมี Profile Image, Name, Followers, Following, Follow / Unfollow
- Public Profile ต้องมี Asset Tabs: `All`, `Sale`, `Show`
- Public Profile Tab `All` ต้องแสดง Asset สถานะ `Sale` และ `Show` รวมกัน
- Public Profile ต้องไม่แสดง `Hide`, `Sold`, Provenance และ Consignment
- Portfolio เป็น Private และเห็นเฉพาะ Owner
- Portfolio คำนวณจาก `Sale`, `Show`, `Hide` ที่ยังใช้งานได้
- Portfolio ไม่รวม `Sold`, ลบโดยเจ้าของ และ Asset ที่ถูก Back Office ซ่อนถาวร
- Sold History เก็บ Sale Date, Sale Price, Payment Method เป็น required และ Buyer, Contact, Attachment เป็น optional

---

# 5. Figma Gap Checklist For Profile Module

รายการนี้ใช้เป็น checklist สำหรับปรับ Figma เฉพาะ Profile Module ให้ตรงกับ master ก่อนส่งต่อ Dev/QA

| Priority | Gap | Master Baseline | Figma Action |
|---|---|---|---|
| Must Fix | Public Profile ยังไม่มีแท็บ `All` | Public Profile ต้องมี `All`, `Sale`, `Show` | เพิ่มแท็บ `All` ใน Public Profile |
| Must Fix | `All` tab ใน Public Profile ยังไม่ถูกนิยาม | `All` ต้องแสดง Asset สถานะ `Sale + Show` รวมกัน | ระบุ behavior ของ `All` ให้ชัดใน Figma |
| High | Owner Profile ยังไม่ชัดว่ามี tabs ครบทุกสถานะ | Owner Profile ต้องมี `All`, `Sale`, `Show`, `Hide`, `Sold` | ตรวจ/เพิ่ม tab ของ Owner Profile ให้ครบ |
| High | Total Asset Value / Portfolio entry ยังไม่ชัด | Total Asset Value เป็น entry point สำหรับ Portfolio | เพิ่ม Total Asset Value และ interaction ไป Portfolio |
| High | Portfolio privacy ยังไม่ชัด | Portfolio เห็นเฉพาะ Owner และคำนวณจาก Sale, Show, Hide ที่ยังใช้งานได้ โดยไม่รวม Sold, ลบโดยเจ้าของ และซ่อนถาวร | เพิ่ม Owner-only Portfolio state และระบุ exclusion ให้ชัด |
| High | Public Profile อาจแสดงข้อมูล private | Public Profile ต้องไม่แสดง Provenance, Consignment, Hide, Sold | ตรวจ Public Profile และ asset card/detail entry ไม่ให้มี private data |
| Medium | ยังใช้ label legacy `Collection Show` ในหลายจุด | Canonical term คือ `Show` | Normalize label เป็น `Show` หรือระบุ legacy mapping ให้ชัด |
| Medium | Guest Follow restriction ยังไม่ชัด | Guest กด Follow ต้องเห็น Global Login Required Dialog | เพิ่ม guest dialog/state เมื่อกด Follow |
| Medium | Blocked / unavailable profile state ยังไม่ชัด | Blocked profile ต้องไม่สามารถเข้าถึงได้ตาม Trust & Safety rule | เพิ่ม blocked/unavailable profile state |

---

# 6. Scope

Profile Module ใน V1 ครอบคลุม:

- Owner Profile
- Public Profile
- Edit Profile entry point
- Follow / Unfollow
- Report User from Public Profile
- Block User from Public Profile
- Followers Count
- Following Count
- Owner Asset Tabs
- Public Profile Asset Tabs
- Total Asset Value entry point
- Portfolio entry point
- User Not Found State
- Blocked / Unavailable Profile State

ไม่รวมใน V1:

- Verification Badge
- Dealer Badge
- Rating System
- Achievement System
- Profile Analytics
- Public Portfolio
- Public Sold History

---

# 7. Screen Mapping

หน้าจอที่เกี่ยวข้องในโมดูลนี้:

1. Owner Profile
2. Public Profile
3. Edit Profile Entry
4. Owner Asset Tab - All
5. Owner Asset Tab - Sale
6. Owner Asset Tab - Show
7. Owner Asset Tab - Hide
8. Owner Asset Tab - Sold
9. Public Asset Tab - All
10. Public Asset Tab - Sale
11. Public Asset Tab - Show
12. Portfolio Entry / Total Asset Value
13. User Not Found State
14. Blocked / Unavailable Profile State
15. Global Login Required Dialog
16. Report User
17. Block User Confirmation

---

# 8. User States

## Guest

สามารถ:

- View Public Profile
- View Public Profile Asset Tab `All`
- View Public Profile Asset Tab `Sale`
- View Public Profile Asset Tab `Show`
- Open public Asset Detail
- Share Public Profile public deep link

ไม่สามารถ:

- Follow
- Report User
- Block User
- Chat
- Make Offer
- View Owner-only Asset
- View Portfolio
- View private asset data

เมื่อ Guest กด Follow หรือ feature ที่ต้อง Login ต้องแสดง Global Login Required Dialog

## Member / Viewer

สามารถ:

- View Public Profile
- Follow / Unfollow
- Open public Asset Detail

ไม่สามารถ:

- View `Hide` Asset ของผู้อื่น
- View `Sold` Asset ของผู้อื่น
- View Portfolio ของผู้อื่น
- View Provenance / Consignment / private asset data ของผู้อื่น

## Owner

สามารถ:

- View Owner Profile
- View Asset ของตัวเองทุกสถานะ
- View Total Asset Value
- Open Portfolio
- Open Edit Profile
- Open Asset Detail ของตัวเองทุกสถานะ

Owner Profile เป็น context ของผู้ใช้เอง ไม่ใช่ role แยกจาก User

## Blocked Relationship

เมื่อ User Block กัน:

- Public Profile ของผู้ถูก Block ต้องไม่สามารถเข้าถึงได้ตาม Trust & Safety rule
- Asset ของผู้ถูก Block ต้องไม่ถูกใช้ในการแสดง Feed, Search หรือ Watch Alert Result
- ความสัมพันธ์ Follow ระหว่างกันต้องไม่ถูกใช้ในการแสดงผล

---

# 9. User Flow

## Open Owner Profile

```text
Profile Tab
→ Owner Profile
→ View Profile Info
→ View Asset Tabs
```

## Open Public Profile

```text
Feed / Search / Asset Detail
→ Tap Owner
→ Public Profile
→ View Sale / Show Assets
```

## Follow User

```text
Public Profile
→ Follow
→ Follow Count Updated
→ Following Relationship Created
```

## Unfollow User

```text
Public Profile
→ Unfollow
→ Follow Count Updated
→ Following Relationship Removed
```

## Guest Follow User

```text
Public Profile
→ Follow
→ Global Login Required Dialog
```

## Report User From Profile

```text
Public Profile
→ More Menu
→ Report User
→ Select reason
→ Submit
→ Report submitted successfully
```

## Share Profile

```text
Owner Profile / Public Profile
→ More Menu
→ Share Profile
→ Profile Share Sheet
→ System Share or Copy Link
```

## Guest Share Public Profile

```text
Guest
→ Public Profile
→ Share Profile
→ Profile Share Sheet
→ System Share or Copy Link
```

## Block User From Profile

```text
Public Profile
→ More Menu
→ Block User
→ Confirm `Block this user?`
→ Block Applied
→ Profile becomes unavailable according to Trust & Safety rule
```

## Edit Profile

```text
Owner Profile
→ Edit Profile
→ Save
→ Owner Profile Updated
```

## Open Portfolio

```text
Owner Profile
→ Total Asset Value
→ Portfolio
```

## Open Sold Asset

```text
Owner Profile
→ Sold Tab
→ Sold Asset Detail
→ Sold History
```

---

# 10. Business Rules

## Profile Type Rule

Owner Profile:

- แสดงข้อมูลของผู้ใช้เอง
- แสดง Asset ของตัวเองทุกสถานะ
- แสดง Owner-only private entry points ตามสิทธิ์

Public Profile:

- แสดงข้อมูล public ของผู้ใช้อื่น
- แสดงเฉพาะ Asset สถานะ `Sale` และ `Show`
- ไม่แสดง private data

## Owner Profile Display

Owner Profile ต้องแสดง:

- Profile Image
- Name
- Followers
- Following
- Total Asset Value
- Edit Profile
- Add Asset button
- More menu
- Asset Tabs: `All`, `Sale`, `Show`, `Hide`, `Sold`

Total Asset Value เป็น entry point สำหรับกดเข้า Portfolio

Owner Profile more menu:

- ต้องใช้ปุ่ม `...` มุมขวาบน ไม่ใช้ gear หากเมนูมี action มากกว่า Settings
- รายการในเมนู: `Share profile`, `Settings`
- `Share profile` เปิด Profile Share Sheet ของตัวเอง
- `Settings` ไปหน้า Settings
- ปุ่ม `+` มุมซ้ายบนเป็น Add Asset
- ปุ่ม `Edit Profile` คงเป็น primary owner action บนหน้า profile

## Public Profile Display

Public Profile ต้องแสดง:

- Profile Image
- Name
- Followers
- Following
- Follow / Unfollow
- More menu
- Asset Tabs: `All`, `Sale`, `Show`

Public Profile ต้องไม่แสดง:

- Hide
- Sold
- Provenance
- Consignment
- Purchase Price
- Purchase Date
- Purchase From
- Proof of Payment
- Consignment Owner Contact
- Consignment Terms
- Sold History
- Portfolio Value Detail

## Owner Profile Tab Rules

| Tab | Rule |
|---|---|
| All | แสดง Asset ของ Owner ทุกสถานะ: Sale, Show, Hide, Sold |
| Sale | แสดงเฉพาะ Asset สถานะ Sale |
| Show | แสดงเฉพาะ Asset สถานะ Show |
| Hide | แสดงเฉพาะ Asset สถานะ Hide |
| Sold | แสดงเฉพาะ Asset สถานะ Sold |

## Public Profile Tab Rules

| Tab | Rule |
|---|---|
| All | แสดง Asset สถานะ Sale และ Show รวมกัน |
| Sale | แสดงเฉพาะ Asset สถานะ Sale |
| Show | แสดงเฉพาะ Asset สถานะ Show |

Public Profile ไม่มี tab:

- Hide
- Sold

## Profile More Menu Rules

Public Profile ของ user อื่นต้องใช้ more menu `...` มุมขวาบน และมีรายการ:

- `Share profile`
- `Report user`
- `Block user`

Rules:

- `Share profile` เปิด Profile Share Sheet
- `Report user` เปิด Trust & Safety Report User flow
- `Block user` ต้องเปิด confirmation ก่อน block
- ไม่แสดง `Edit profile`, `Settings`, `Delete asset`, `Report asset`, `Hide asset`, `Edit asset` หรือ `Mark as sold` บน Public Profile more menu

Owner Profile ต้องใช้ more menu `...` มุมขวาบน และมีรายการ:

- `Share profile`
- `Settings`

Rules:

- ไม่แสดง `Report user` หรือ `Block user` ให้ owner report/block ตัวเอง
- ใช้ label `Settings` ไม่ใช่ `Setting`

## Owner Profile Asset Card Quick Actions

Owner Profile asset grid ต้องให้ Owner จัดการ Asset จาก card ได้โดยไม่ต้องเปิด Asset Detail ก่อน

Entry point:

- แสดงปุ่ม `...` บนรูป asset card เฉพาะ Owner view
- Public Profile / Visitor view ต้องไม่แสดง `...` บน asset card
- Tap card หรือรูป asset ต้องเปิด Asset Detail
- Tap `...` ต้องเปิด quick action menu เท่านั้น และต้องไม่ trigger Asset Detail
- ปุ่ม `...` ควรอยู่มุมขวาบนของรูป asset, hit area อย่างน้อย `32x32px`, พื้นหลังดำ/เทาเข้มโปร่งเพื่ออ่านได้บนรูปทุกแบบ

Quick actions by status:

| Asset Status | Owner Quick Actions |
|---|---|
| Sale | Share asset, Edit asset, Edit provenance, Mark as sold, Change status, Delete asset |
| Show | Share asset, Edit asset, Edit purchase history, Change status, Delete asset |
| Hide | Share asset, Edit asset, Edit purchase history, Change status, Delete asset |
| Sold | View sale history, View provenance |

Rules:

- `Sold` ต้องไม่มี `Delete asset`, `Edit asset`, `Change status` หรือ `Mark as sold`
- `Sold` quick actions เป็น read-only entry เท่านั้น
- `Mark as sold` แสดงเฉพาะ `Sale`
- `Consignment` provenance ใช้ได้เฉพาะ `Sale`
- `Show` และ `Hide` ต้องแก้ได้เฉพาะ `Owner (Asset)` / Purchase History
- `Delete asset` ต้องอยู่ท้ายเมนูและใช้ destructive color
- `Change status` ต้องเปิด Change Status sheet ตาม Asset Management Module

Status badge on asset card:

| Status | Badge Treatment |
|---|---|
| Sale | Red badge |
| Show | Blue badge |
| Hide | Neutral / outline badge |
| Sold | Muted gray or dark red badge, not the same style as Sale |

## Profile Share Sheet Rule

Profile Share Sheet ใช้ได้ทั้ง Owner Profile และ Public Profile:

- เปิดเป็น bottom sheet
- แสดง profile preview card พร้อม profile image และ display name
- รองรับ system share channels ตาม platform เช่น LINE, Instagram, Facebook เมื่อ available
- ต้องมี `Copy Link` fallback
- `Copy Link` ต้องแสดง feedback เช่น `Profile link copied`
- Link ที่แชร์ต้องเป็น public profile deep link และต้อง validate blocked/unavailable profile เมื่อเปิด
- Guest สามารถ Share Public Profile ได้โดยไม่ต้อง Login เพราะเป็น public share action
- Guest share ต้องไม่เปิดสิทธิ์ Follow, Report User, Block User, Chat, Make Offer หรือ private profile/portfolio data

## Share Asset From Profile Grid Rule

Share Asset จาก Profile asset grid เป็น public share action สำหรับ public Asset:

- Owner Profile: Share asset อยู่ใน quick action menu (`...`) ของ asset card สำหรับ Asset สถานะ `Sale`, `Show`, `Hide`
- Public Profile: Share asset ต้องเข้าถึงได้จาก asset card ของ Asset สถานะ `Sale` และ `Show` (เช่น long-press, share icon หรือ card action)
- `Sold` ไม่มี Share asset เพราะไม่ใช่ public content และ Owner quick action เป็น read-only
- Guest สามารถ Share asset จาก Public Profile grid ได้โดยไม่ต้อง Login
- Primary channel คือ system share sheet เมื่อ platform รองรับ
- Fallback คือ copy public deep link พร้อม copy success state
- Share ไม่สร้าง Notification Center item
- Shared deep link เปิดแล้วไป Asset Detail และต้อง validate asset status, deleted state, permission และ block state (ดู [05_ASSET_DETAIL_MODULE.md](05_ASSET_DETAIL_MODULE.md) Deep Link Display State Rule)
- สำหรับ navigation หลังเปิด shared deep link ดู [00_NAVIGATION_AND_CROSS_MODULE_FLOW.md](00_NAVIGATION_AND_CROSS_MODULE_FLOW.md) Back Button And Main Navigation After Deep Link

## Profile Deep Link Display State Rule

เมื่อเปิด shared Public Profile deep link ระบบต้อง validate ก่อน render และแสดง state ตามตารางนี้ (อ้างอิง [00_NAVIGATION_AND_CROSS_MODULE_FLOW.md](00_NAVIGATION_AND_CROSS_MODULE_FLOW.md) Deep Link Rules และ Unavailable Fallback Rules):

| Case | Guest | Login User | Owner (self) |
| --- | --- | --- | --- |
| Active public profile | แสดง Public Profile | แสดง Public Profile | แสดง Owner Profile |
| Profile ของ user ที่ถูก block | Unavailable / blocked state | Unavailable / blocked state | n/a |
| Profile ของ user ที่ไม่มีอยู่ (deleted) | User Not Found State | User Not Found State | n/a |
| Account Suspended / Banned | แสดง Public Profile ตามปกติ (profile ยังเป็น public) | Account status state ถ้าเป็น profile ตัวเอง | Account status state |

Rules:

- ทุก profile deep link ต้อง validate block relationship และ user existence ก่อน render
- Shared profile link ต้องไม่เปิด private profile data, Portfolio, Hide asset หรือ Sold asset
- Guest เปิด Public Profile deep link ได้โดยไม่ต้อง Login แต่เมื่อ Guest กด action ที่ต้อง Login (เช่น Follow, Report User, Block User, Chat, Make Offer) ต้องแสดง Global Login Required Dialog เช่นเดียวกับการเข้าผ่าน entry point ปกติ
- Back button และ main navigation หลังเปิด profile deep link ใช้ rule เดียวกับ [00_NAVIGATION_AND_CROSS_MODULE_FLOW.md](00_NAVIGATION_AND_CROSS_MODULE_FLOW.md) Back Button And Main Navigation After Deep Link

## Asset Visibility Rule

| Status | Owner Profile | Public Profile |
|---|---|---|
| Sale | แสดง | แสดง |
| Show | แสดง | แสดง |
| Hide | แสดงเฉพาะ Owner | ไม่แสดง |
| Sold | แสดงเฉพาะ Owner | ไม่แสดง |

## Portfolio Rule

Portfolio:

- เป็น Private
- เห็นเฉพาะ Owner
- เข้าจาก Total Asset Value
- คำนวณจาก Asset สถานะ `Sale`, `Show`, `Hide` ที่ยังใช้งานได้
- ไม่รวม `Sold`, ลบโดยเจ้าของ และ Asset ที่ถูก Back Office ซ่อนถาวร

## Sold History Rule

Sold History:

- เห็นเฉพาะ Owner
- เข้าจาก Sold Asset / Sold History surface ตาม Portfolio / Asset Detail
- เก็บ Sale Date, Buyer, Contact, Sale Price, Payment Method, Attachment

## Follow Rule

- Member สามารถ Follow / Unfollow User อื่นได้
- Guest กด Follow ต้องเห็น Global Login Required Dialog
- User ไม่ควร Follow ตัวเอง
- Following Feed ใช้ความสัมพันธ์ Follow เพื่อแสดง Asset Sale ของ User ที่กำลัง Follow

## Edit Profile Rule

Owner สามารถเปิด Edit Profile จาก Owner Profile

ข้อมูล Edit Profile รายละเอียดอยู่ใน Settings / Edit Profile flow โดยต้องสอดคล้องกับ master settings:

- Username
- Phone
- Line
- Email Display

Email ที่ยืนยันแล้วต้องไม่แก้ไขได้ตาม Authentication / Settings rule

## Deleted / Unavailable User Rule

หาก User ถูกลบหรือไม่พร้อมใช้งาน Public Profile ต้องแสดง User Not Found / Unavailable State

## Block User Rule

Member ต้องสามารถ Block User จาก Public Profile ได้ตาม Trust & Safety rule

Block User จาก Public Profile:

- ต้องเปิด confirmation ก่อน block
- ใช้ title `Block this user?`
- ใช้ actions `Cancel`, `Block`
- หากกด `Cancel` หรือ dismiss confirmation ต้องไม่เปลี่ยน block state
- Body และ success feedback ให้ใช้ copy กลางจาก Trust & Safety Module

เมื่อ User ถูก Block:

- Public Profile ต้องไม่สามารถเข้าถึงได้ตาม rule
- Asset ของผู้ถูก Block ต้องหายจาก Feed, Search และ Watch Alert Result ทันที

## Report User Rule

- Member ต้องสามารถ Report User จาก Public Profile ได้
- Report User ต้องเปิด Trust & Safety Report User flow
- Report submit ต้องไม่ทำให้ profile/content หายทันที
- ผู้ถูก report ไม่เห็นตัวตนของ reporter
- Report success ต้องแสดง `Report submitted`
- Success copy: `Our team will review this user. This profile will remain visible until moderation is complete.`
- Success action ใช้ปุ่ม `Done` และปิด modal กลับ Public Profile

---

# 11. Permission Rules

## Guest

สามารถ:

- View Public Profile
- View Sale / Show Asset
- Open public Asset Detail
- Share Public Profile

ไม่สามารถ:

- Follow
- Report User
- Block User
- Chat
- Make Offer
- View Portfolio
- View private asset data

## Member / Viewer

สามารถ:

- View Public Profile
- Follow / Unfollow
- Report User
- Block User
- Open public Asset Detail

ไม่สามารถ:

- View Hide / Sold Asset ของผู้อื่น
- View Portfolio ของผู้อื่น
- View private asset data ของผู้อื่น
- Edit Profile ของผู้อื่น

## Owner

สามารถ:

- View Owner Profile
- Edit Profile
- View Asset ทุกสถานะของตัวเอง
- View Total Asset Value
- Open Portfolio
- Open Sold History ของตัวเอง

---

# 12. Validation Rules

## Edit Profile Entry

รายละเอียด validation อยู่ใน Settings / Edit Profile flow

Profile Module ต้องรับผลหลัง Save สำเร็จและแสดงข้อมูลล่าสุด

## Display Name / Name

- Required ตาม Edit Profile policy

## Follow / Unfollow

- ต้องไม่สามารถ Follow ตัวเอง
- ต้องไม่สามารถ Follow เมื่อยังไม่ Login
- ต้องไม่ใช้ follow relationship หากมี Block ระหว่างกัน

---

# 13. Exception Handling

## User Not Found

| Language | Message |
|---|---|
| TH | ไม่พบผู้ใช้งาน |
| EN | User not found |

## Profile Unavailable / Blocked

| Language | Message |
|---|---|
| TH | ไม่สามารถเข้าถึงผู้ใช้งานนี้ได้ |
| EN | This profile is unavailable. |

## Action Requires Login

ใช้ Global Login Required Dialog

## Permission Denied

| Language | Message |
|---|---|
| TH | คุณไม่มีสิทธิ์ดำเนินการ |
| EN | Permission denied |

---

# 14. Empty State

ใช้ข้อความมาตรฐานเดียวกับระบบเมื่อไม่มี Asset ใน tab:

| Language | Message |
|---|---|
| TH | ไม่พบข้อมูล |
| EN | No data found |

ใช้กับ:

- Owner Profile Asset Tabs
- Public Profile Asset Tabs
- Portfolio Empty State

---

# 15. Notification Rules

- Follow สำเร็จส่ง Follow Notification ตาม Notification Module
- Unfollow ไม่ส่ง Notification
- Profile Module ไม่สร้าง Notification อื่นโดยตรง

---

# 16. Analytics Events

- Open Owner Profile
- Open Public Profile
- Profile Tab Change
- Follow User
- Unfollow User
- Report User From Profile
- Block User From Profile
- Edit Profile Open
- Portfolio Open
- Public Profile Asset Click
- Owner Profile Asset Click
- User Not Found Viewed
- Profile Unavailable Viewed

---

# 17. Acceptance Criteria

## Owner Profile

| AC ID | Criteria |
|---|---|
| AC-PROFILE-001 | Owner Profile ต้องแสดง Profile Image, Name, Followers, Following, Total Asset Value และ Edit Profile |
| AC-PROFILE-002 | Owner Profile ต้องมี Asset Tabs: All, Sale, Show, Hide, Sold |
| AC-PROFILE-003 | Owner Profile Tab All ต้องแสดง Asset ของ Owner ทุกสถานะ Sale, Show, Hide, Sold |
| AC-PROFILE-004 | Owner Profile Tab Sale ต้องแสดงเฉพาะ Asset สถานะ Sale |
| AC-PROFILE-005 | Owner Profile Tab Show ต้องแสดงเฉพาะ Asset สถานะ Show |
| AC-PROFILE-006 | Owner Profile Tab Hide ต้องแสดงเฉพาะ Asset สถานะ Hide |
| AC-PROFILE-007 | Owner Profile Tab Sold ต้องแสดงเฉพาะ Asset สถานะ Sold |
| AC-PROFILE-007A | Owner Profile asset card ต้องแสดงปุ่ม `...` เฉพาะ Owner view เพื่อเปิด quick action menu โดยไม่ trigger Asset Detail |
| AC-PROFILE-007B | Owner Profile quick action menu ต้องแสดง action ตาม status: Sale มี Share asset, Edit asset, Edit provenance, Mark as sold, Change status, Delete asset; Show/Hide มี Share asset, Edit asset, Edit purchase history, Change status, Delete asset; Sold มีเฉพาะ View sale history และ View provenance |
| AC-PROFILE-007C | Public Profile / Visitor view ต้องไม่แสดง asset-card quick action `...` |
| AC-PROFILE-007D | Owner ต้อง Share asset จาก Owner Profile grid ได้สำหรับ Asset สถานะ Sale, Show และ Hide |
| AC-PROFILE-007E | Guest ต้อง Share asset จาก Public Profile grid ได้โดยไม่ต้อง Login สำหรับ Asset สถานะ Sale และ Show |
| AC-PROFILE-007F | Shared profile deep link ต้อง validate block relationship และ user existence ก่อน render และต้องไม่เปิด private data |
| AC-PROFILE-007G | เมื่อเปิด shared profile deep link ของ user ที่ถูก block ต้องแสดง Unavailable / blocked state |
| AC-PROFILE-007H | เมื่อเปิด shared profile deep link ของ user ที่ไม่มีอยู่ ต้องแสดง User Not Found State |
| AC-PROFILE-007I | Guest เปิด Public Profile deep link ได้โดยไม่ต้อง Login แต่เมื่อ Guest กด action ที่ต้อง Login (Follow, Report User, Block User, Chat, Make Offer) ต้องแสดง Global Login Required Dialog |

## Public Profile

| AC ID | Criteria |
|---|---|
| AC-PROFILE-008 | Public Profile ต้องแสดง Profile Image, Name, Followers, Following และ Follow / Unfollow |
| AC-PROFILE-009 | Public Profile ต้องมี Asset Tabs: All, Sale, Show |
| AC-PROFILE-010 | Public Profile Tab All ต้องแสดง Asset สถานะ Sale และ Show รวมกัน |
| AC-PROFILE-011 | Public Profile Tab Sale ต้องแสดงเฉพาะ Asset สถานะ Sale |
| AC-PROFILE-012 | Public Profile Tab Show ต้องแสดงเฉพาะ Asset สถานะ Show |
| AC-PROFILE-013 | Public Profile ต้องไม่แสดง Hide และ Sold |
| AC-PROFILE-014 | Public Profile ต้องไม่แสดง Provenance, Consignment, Sold History หรือ Portfolio Value Detail |

## Guest / Member Permission

| AC ID | Criteria |
|---|---|
| AC-PROFILE-015 | Guest ต้องเปิด Public Profile ได้ |
| AC-PROFILE-016 | Guest ต้องดู Sale และ Show Asset ใน Public Profile ได้ |
| AC-PROFILE-017 | Guest ต้องไม่สามารถ Follow ได้ |
| AC-PROFILE-018 | เมื่อ Guest กด Follow ต้องแสดง Global Login Required Dialog |
| AC-PROFILE-018A | Guest ต้อง Share Public Profile ได้โดยไม่ต้อง Login ผ่าน system share หรือ `Copy Link` fallback |
| AC-PROFILE-019 | Member ต้อง Follow / Unfollow User อื่นได้ |
| AC-PROFILE-020 | User ต้องไม่สามารถ Follow ตัวเองได้ |
| AC-PROFILE-020A | Member ต้อง Report User จาก Public Profile ได้ |
| AC-PROFILE-020B | Member ต้อง Block User จาก Public Profile ได้ |

## Portfolio / Sold History

| AC ID | Criteria |
|---|---|
| AC-PROFILE-021 | Total Asset Value ต้องเป็น entry point ไป Portfolio |
| AC-PROFILE-022 | Portfolio ต้องเห็นเฉพาะ Owner |
| AC-PROFILE-023 | Portfolio ต้องคำนวณจาก Asset สถานะ Sale, Show และ Hide ที่ยังใช้งานได้ |
| AC-PROFILE-024 | Portfolio ต้องไม่รวม Sold, ลบโดยเจ้าของ และ Asset ที่ถูก Back Office ซ่อนถาวร |
| AC-PROFILE-025 | Sold History ต้องเห็นเฉพาะ Owner |
| AC-PROFILE-026 | Sold History ต้องเก็บ Sale Date, Buyer, Contact, Sale Price, Payment Method และ Attachment |

## Error / Blocked State

| AC ID | Criteria |
|---|---|
| AC-PROFILE-027 | เมื่อเปิด Profile ของ User ที่ไม่มีอยู่ ต้องแสดง User Not Found State |
| AC-PROFILE-028 | เมื่อเปิด Profile ที่ถูก Block / unavailable ต้องแสดง Profile Unavailable State |
| AC-PROFILE-029 | เมื่อ User ถูก Block Asset ของผู้ถูก Block ต้องไม่ถูกใช้ใน Feed, Search และ Watch Alert Result |
| AC-PROFILE-030 | Owner Profile more menu ต้องใช้ `...` และมี `Share profile`, `Settings` |
| AC-PROFILE-031 | Public Profile more menu ของ user อื่นต้องมี `Share profile`, `Report user`, `Block user` |
| AC-PROFILE-032 | Profile Share Sheet ต้องมี profile preview และ `Copy Link` fallback |
| AC-PROFILE-033 | Report User success ต้องใช้ `Report submitted` และ profile ต้อง remain visible until moderation is complete |
| AC-PROFILE-034 | Block User จาก Public Profile ต้องเปิด confirmation `Block this user?`; cancel/dismiss ต้องไม่ block user |

---

# 18. Related Modules

- Feed Module
- Search & Filter Module
- Asset Management Module
- Asset Detail Module
- Chat Module
- Offer Module
- Notification Module
- Portfolio Module
- Settings Module
- Trust & Safety Module

---

# 19. Future Enhancement

- Verification Badge
- Dealer Badge
- Rating System
- Achievement System
- Profile Analytics

