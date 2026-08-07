# TukDaeng Figma UX Cleanup Task Breakdown

**Reference:** [Figma_Gap_Checklist_Against_Master.md](Figma_Gap_Checklist_Against_Master.md)  
**Source of truth:** [TukDaeng_Master_Product_Definition.md](TukDaeng_Master_Product_Definition.md)  
**Purpose:** แปลง Figma gap checklist ให้เป็น task group สำหรับ UX/Figma cleanup ก่อนส่ง Dev และ QA

---

## 0. Current Figma Cleanup Status

**Status:** Figma cleanup in progress  
**Handoff rule:** ยังไม่สร้าง Dev / QA / Figma handoff package ใหม่จนกว่า Figma cleanup รอบนี้จะนิ่ง  
**Version rule:** ถ้า Figma แก้ให้ตรง baseline เดิม ไม่ต้อง bump version; ถ้ามี product decision ใหม่จริง ให้ update `DOCUMENT_VERSION.md` และไฟล์เดิมที่เกี่ยวข้องเท่านั้น

ใช้ไฟล์นี้เป็น tracker กลางสำหรับงาน Figma ระหว่าง cleanup ห้ามสร้าง checklist หรือ handoff ชุดใหม่ซ้ำ เพราะจะทำให้ทีมสับสนว่า version ไหนเป็น source of truth

### Current Working Queue

| Order | Area | Current Status | Next Figma Action | Source |
| --- | --- | --- | --- | --- |
| 1 | Add / Edit Asset required fields | In progress | ตรวจ status selector, required fields และ save/uploading state ตาม work pack 2.1 | `04_ASSET_MANAGEMENT_MODULE.md` |
| 2 | Feed / Search / Watch Alert visibility | Pending review | ยืนยันว่า list surfaces แสดงเฉพาะ `Sale`, ไม่มี Location บน cards และ Watch Alert notification ไป Result List | `02_FEED_MODULE.md`, `03_SEARCH_FILTER_MODULE.md`, `10_WATCH_ALERT_MODULE.md` |
| 3 | Notification / Chat unread | Pending review | ยืนยันว่า Chat/New Message ไม่อยู่ Notification Center และ unread แสดงเฉพาะ Chat menu/list | `07_CHAT_MODULE.md`, `09_NOTIFICATION_MODULE.md` |
| 4 | Public Profile guest share | Pending review | ยืนยันว่า Guest กด `Share profile` ได้โดยไม่ต้อง Login และมี system share / `Copy Link` fallback แต่ยังทำ Follow / Report / Block / Chat / Offer ไม่ได้ | `06_PROFILE_MODULE.md` |
| 5 | Board / Settings / Auth compliance | Pending review | ตรวจ Board เป็น Article Area, Settings มี Theme/Delete Account confirmation, `Account deletion started` success modal, Sign In destination, Terms/Privacy และ Suspended state | `01_AUTHENTICATION_MODULE.md`, `12_BOARD_MODULE.md`, `13_SETTINGS_MODULE.md` |
| 6 | Portfolio / valuation private states | Pending review | ตรวจ Owner-only Portfolio, Sold excluded, valuation fallback, Market Comparison และ Expected Profit owner-only | `14_PORTFOLIO_MODULE.md` |
| 7 | Final Figma sign-off | Not ready | หลังทุก `Must Fix` และ `High` เป็น Done / Not Applicable / Needs Product Decision ค่อยทำ handoff package | `README_MODULE_INDEX.md` |

### Already Reviewed In Current Round

| Area | Status | Note |
| --- | --- | --- |
| Asset Detail / Public Profile | Reviewed | Coverage marked complete in work pack 2.2 |
| Share sheet / copy link fallback | Reviewed | Keep as system share sheet with Copy Link fallback |
| Permission denied / unavailable state | Reviewed | Use minimal header, message by case, and primary CTA `Go back` |
| Report / Delete / Block core copy | Reviewed | Copy and confirmation behavior are synced into PRD, Dev checklist and QA checklist |

### Today Working Focus: 2026-06-29

วันนี้ให้เริ่มต่อจาก baseline เดิมโดยโฟกัส Figma coverage ไม่ใช่ product decision ใหม่ ดังนั้นไม่ต้อง bump `DOCUMENT_VERSION.md`

| Focus | Current Status | Figma / UX Action | Done When |
| --- | --- | --- | --- |
| Guest access coverage | In progress | ไล่ทุก public entry point ว่า Guest เข้า Feed, Search, Asset Detail, Public Profile, Board Article และ Share ได้ตามสิทธิ์ และ login-required action เปิด Global Login Required Dialog เดียวกัน | Guest path ไม่มี action ที่ bypass login rule และไม่มี dialog copy หลายแบบ |
| Report flows | In progress | ตรวจ Report Asset, Report User, Report Comment และ Report article/Board Content ว่ามี reason sheet, disabled submit, success state และไม่ซ่อน content ทันที | ทุก report type ใช้ Trust & Safety baseline และ success copy ระบุว่ายัง visible จน moderation complete |
| Delete flows | In progress | ตรวจ Delete asset, Delete comment, Delete chat และ Delete Account ว่าใช้ confirmation, success/error state และผลกระทบหลังลบตรง module owner | Delete แต่ละชนิดไม่ปน behavior กัน เช่น Delete asset ไม่มี Undo, Delete chat ซ่อนเฉพาะฝั่งผู้กด, Delete Account revoke session |
| Block flows | In progress | ตรวจ Block User entry จาก Feed, Public Profile, Asset Detail และ Chat รวมถึง blocked chat read-only, discovery filtering และ cancel/dismiss behavior | ทุก entry ใช้ confirmation copy เดียวกัน และหลัง block แล้ว Feed/Search/Watch Alert/Profile surfaces filter ตาม rule |
| Figma sign-off readiness | Pending | หลังตรวจครบ ให้ mark แต่ละ flow เป็น Done / Not Applicable / Needs Product Decision พร้อม note ใน Figma | ไม่เหลือ Must Fix/High ที่ต้องเดาจาก prototype |

---

## 1. Cleanup Rule

ให้แก้ตามลำดับนี้:

1. `Must Fix` เพราะเป็นรายการที่ขัดกับ master โดยตรง
2. `High` เพราะกระทบ Dev / QA sign-off
3. `Medium` หลังจากหน้าจอหลักนิ่งแล้ว
4. `Needs Decision` ต้องกลับไปตัดสินใน product decision log ก่อน implement

ถ้า Figma หรือเอกสารเก่าขัดกับ master ให้ยึด master ก่อนเสมอ

---

## 2. Must Fix Ticket Matrix

ตารางนี้ใช้แตกงาน `Must Fix` เป็น ticket สำหรับ UX/Figma cleanup รอบแรก ก่อนเริ่ม Dev / QA sign-off จริง

| Ticket ID | Module / Surface | Owner | Figma Action | Acceptance Gate | Dependency |
| --- | --- | --- | --- | --- | --- |
| UX-MF-001 | Global status model | UX Lead + Product | Normalize status ทุกหน้าจอให้เหลือ `Sale`, `Show`, `Hide`, `Sold` และลบ status model ซ้ำ | ไม่มี label/status นอก canonical set ใน mobile flow | `TukDaeng_Master_Product_Definition.md`, `00_GLOBAL_RULES_MODULE.md` |
| UX-MF-002 | Public / private visibility | UX Lead + UX Marketplace | แยก Owner-only/private data ออกจาก Viewer/Public state ให้ชัดใน Asset Detail, Profile, Portfolio และ related surfaces | Viewer/Public ไม่เห็น purchase data, provenance, consignment, sold history หรือ portfolio value detail | `00_GLOBAL_RULES_MODULE.md`, `05_ASSET_DETAIL_MODULE.md`, `14_PORTFOLIO_MODULE.md` |
| UX-MF-003 | Future / out-of-scope navigation | UX Lead | จัด Watch Shops, Accessories Shop, Repair Shop, Auction Center, Consignment Center, Authentication Center และ Community เป็น hidden, disabled หรือ placeholder | ไม่มี active route ที่สื่อว่า feature นอก V1 ใช้งานได้จริง | `00_NAVIGATION_AND_CROSS_MODULE_FLOW.md` |
| UX-MF-004 | Feed card baseline | UX Marketplace | เอา Location ออกจาก Feed Card และคง Posted Time เป็น metadata หลัก | Feed Card ไม่แสดง location เช่น district/province ใน V1 | `02_FEED_MODULE.md` |
| UX-MF-005 | Feed/Search/Watch Alert status filter | UX Marketplace | Annotate ว่า Feed, Search Result และ Watch Alert Result render เฉพาะ `Sale` | ไม่มี `Show`, `Hide`, `Sold`, `Deleted` ใน public list surfaces | `02_FEED_MODULE.md`, `03_SEARCH_FILTER_MODULE.md`, `10_WATCH_ALERT_MODULE.md` |
| UX-MF-006 | Asset add/edit status model and required fields | UX Marketplace | ปรับ Add/Edit Asset ให้เลือกได้เฉพาะ `Sale`, `Show`, `Hide`; แยก `Sold` ไป Mark as Sold / Sale Record flow; ทำ required field state ตาม Sale/Show/Hide matrix | `Sold` ไม่ปรากฏเป็นตัวเลือก status ปกติใน Edit Asset; Sale require Photo/Brand/Model/Condition/Asking Price/Description; Show require Photo/Brand/Model; Hide require Photo/Brand และไม่ใช้ listing price | `04_ASSET_MANAGEMENT_MODULE.md` |
| UX-MF-007 | Gallery upload limit | UX Marketplace | ปรับ Add/Edit gallery limit เป็นสูงสุด 10 รูป พร้อม state เมื่อเกิน limit | Upload UI และ validation copy ระบุ 10 รูป | `04_ASSET_MANAGEMENT_MODULE.md` |
| UX-MF-008 | Comment model | UX Marketplace + UX Transaction | ปรับ comment UI ใน Asset/Social ให้รองรับ IG-style one-level replies | Reply แสดงได้ 1 ชั้นใต้ comment หลัก แต่ไม่มี reply ซ้อนหลายระดับหรือ thread แบบ forum | `05_ASSET_DETAIL_MODULE.md`, `11_SOCIAL_MODULE.md` |
| UX-MF-009 | Public Profile tabs | UX Marketplace | เพิ่ม Public Profile tabs `All`, `Sale`, `Show`; `All` แสดง `Sale` + `Show` เท่านั้น | Public Profile ไม่มี `Hide` หรือ `Sold`; Owner profile แยกอีก state | `06_PROFILE_MODULE.md` |
| UX-MF-010 | Notification Center baseline | UX Transaction | เหลือ notification type เฉพาะ Like, Comment, Follow, Offer, Watch Alert | ไม่มี Chat/New Message, Moderation, Account Action, Market Update, Price/Valuation หรือ Sale Success ใน FO Notification Center | `09_NOTIFICATION_MODULE.md` |
| UX-MF-011 | Chat unread routing | UX Transaction | ย้าย Chat/New Message ออกจาก Notification Center และแสดงผ่าน Chat menu unread badge/count | New message ไม่สร้าง Notification Center item ใน prototype | `07_CHAT_MODULE.md`, `09_NOTIFICATION_MODULE.md` |
| UX-MF-012 | Board scope | UX Platform | ปรับ Board ให้เป็น Article Area และตัด Create/Edit/Delete Post สำหรับ Front Office user | FO user อ่าน/like/share article ได้ แต่สร้างหรือจัดการ article ไม่ได้ | `12_BOARD_MODULE.md` |
| UX-MF-013 | Settings baseline | UX Platform | เพิ่ม Theme Mode และ Delete Account พร้อม warning/confirmation/risk state | Settings มี Dark/Light Mode และ Delete Account ไม่ถูก mark เป็น future | `13_SETTINGS_MODULE.md` |
| UX-MF-014 | Admin boundary | UX Platform + Product | Separate Admin from mobile app user types and annotate it as Web Back Office | Mobile app has no Admin account type or working Admin flow | `18_ADMIN_SCOPE_NOTE.md` |
| UX-MF-015 | Payment scope | UX Platform + Product | ซ่อนหรือติดป้าย future ให้ payment/payment gateway UI ทั้งหมด | Payment Gateway ไม่ถูกสื่อว่าเป็น functional V1 | `16_INTEGRATIONS_MODULE.md` |
| UX-MF-016 | Auth consent and suspended state | UX Lead | เพิ่ม Suspended Account state และบังคับ Terms of Use / Privacy Policy ก่อน sign up ทุกช่องทาง | Email, Google, Apple sign up มี consent ก่อน submit และ Sign In มี suspended error/support path | `01_AUTHENTICATION_MODULE.md`, `15_TRUST_SAFETY_MODULE.md` |

### Must Fix Working Order

1. ปิด `UX-MF-001` ถึง `UX-MF-003` ก่อน เพราะเป็น global terminology, visibility และ navigation boundary
2. ทำ `UX-MF-004` ถึง `UX-MF-009` เพื่อให้ marketplace surfaces ตรง visibility matrix
3. ทำ `UX-MF-010` ถึง `UX-MF-011` ก่อน notification prototype review
4. ทำ `UX-MF-012` ถึง `UX-MF-016` เพื่อปิด scope, compliance และ integration boundary

### Must Fix Sign-off Rule

แต่ละ ticket ควรมีสถานะใน Figma เป็น `Done`, `Not Applicable` พร้อมเหตุผล หรือ `Needs Product Decision` เท่านั้นก่อนส่ง Dev / QA review ห้ามปล่อยเป็น implicit behavior ที่ต้องเดาจากหน้าจอ

### Figma Progress Update: 2026-06-19

รายการนี้เป็น progress ที่ทำใน Figma แล้ววันนี้ แต่ยังควร review กับ acceptance gate ก่อน mark ticket เป็น Done ทั้งก้อน

| Area | Figma Update | Related Ticket / Priority | Review Note |
| --- | --- | --- | --- |
| Feed guest flow | ทำ Feed แบบ Guest และลาก prototype ให้ login-required action เปิด Global Login Required Dialog | `UX-MF-016`, Feed High guest restriction | ตรวจทุก entry point เช่น Following, Favorites, Like, Report, Block, Hide |
| Global Login Required Dialog | สร้าง reusable dialog พร้อม Sign in, Create account, Not now และ close behavior | `UX-MF-016`, Global High | ต้องใช้ dialog เดียวกันทุก module |
| Feed Viewer more menu | ทำ Hide this asset, Report Asset และ Block User flow | Feed High / Trust & Safety High | Report ต้องไม่ทำให้ asset หายทันที; Hide เป็น user-level preference |
| Feed Owner more menu | ทำ Edit asset, Mark as sold และ Delete asset flow | `UX-MF-006`, Feed Owner action update | Mark as sold ต้องเข้า Sale Record Form โดยตรง; Delete ต้องไม่มี Undo |
| Report Asset bottom sheet | ทำ bottom sheet มี drag handle, no Cancel button, submit disabled จนเลือก reason | Trust & Safety High | Dismiss โดยไม่ submit ต้องไม่สร้าง report |
| Search & Filter guest | ทำ Search & Filter สำหรับ Guest | Search High / Medium | ต้องตรวจ Create Watch Alert guest restriction เพิ่ม |
| Pre-auth entry | ทำหน้าก่อนเข้าใช้งานสำหรับ Sign in, Sign up และ Guest explore | Auth / Navigation | ตรวจ Terms / Privacy และ guest path |
| Terms acceptance bottom sheet | ทำ bottom sheet แจ้งเงื่อนไขให้กดยอมรับก่อนเข้าใช้งาน | Auth / Legal consent | ต้องไม่ขัดกับ Terms of Use / Privacy Policy consent ใน Sign Up |
| Sign in remembered device | เพิ่ม Remember this device for 30 days ในหน้า Sign in | Auth update | ต้องรอ product/security confirm implementation rule หากยังไม่อยู่ใน V1 baseline |

---

## 2.1 Next Figma Work Pack: Add / Edit Asset

**Goal:** ปรับ Add/Edit Asset ให้ตรงกับ baseline ล่าสุดก่อนส่ง Dev เทียบ implementation

**Reference:** [04_ASSET_MANAGEMENT_MODULE.md](04_ASSET_MANAGEMENT_MODULE.md)

### Screens / Components To Review

- Add Asset
- Edit Asset
- Status selector / segmented control
- Gallery uploader
- Required field indicators
- Inline validation error state
- Save disabled / uploading / saving / save error state
- Status switching state: Sale -> Show, Show -> Sale, Sale -> Hide, Hide -> Sale
- Mark as Sold entry point / Sale Record Form entry

### Required Figma Changes

- Status selector ต้องมีเฉพาะ `Sale`, `Show`, `Hide`
- ห้ามมี `Sold` เป็นตัวเลือกใน Add/Edit Asset
- ห้ามมี status model ซ้ำ เช่น `Status` + `Sale Status`
- Gallery ต้องสื่อว่า required อย่างน้อย 1 รูป และรองรับสูงสุด 10 รูป
- `Sale` ต้อง mark required: Photos, Brand, Model / Series, Condition, Asking Price, Description
- `Show` ต้อง mark required: Photos, Brand, Model / Series
- `Hide` ต้อง mark required: Photos, Brand
- `Show` ต้องไม่สื่อว่า Price เป็น required marketplace listing field
- `Hide` ต้องไม่ใช้ label `Price` หรือ `Asking Price`
- หลังกรอกข้อมูลครบและกด Save ต้องมี loading popup/overlay หรือ persistent toast แสดง `กำลังอัปโหลด...` / `Uploading...` เมื่อมีไฟล์ upload
- ระหว่าง uploading/saving ต้องแสดง Save disabled state เพื่อป้องกันการกดซ้ำ
- Field `Location` ต้องไม่เป็น V1 required/display field หลักใน Add/Edit
- Mark as Sold จาก Owner flow ต้องพาไป Sale Record Form โดยตรง ไม่ใช่เลือก `Sold` จาก Edit Asset

### Status Switching Prototype Notes

| Transition | Figma Behavior / Annotation |
| --- | --- |
| Sale -> Show | Asset หายจาก Feed/Search/Watch Alert แต่ยังอยู่ Public Profile; Asking Price ไม่ required หลังเปลี่ยนเป็น Show |
| Show -> Sale | ต้อง require Condition, Asking Price และ Description ก่อน save เป็น Sale |
| Sale -> Hide | Asset หายจาก Feed/Search/Watch Alert/Public Profile; owner ยังเห็นใน Owner Profile |
| Hide -> Sale | ต้อง require Model / Series, Condition, Asking Price และ Description ก่อน save เป็น Sale |

### Acceptance Gate

- เปิด Add/Edit Asset แล้วไม่เห็น `Sold` ใน status selector
- Required indicator เปลี่ยนตาม status ที่เลือก
- Save validation error ตรงกับ required field matrix
- Save success path มี uploading/saving state ก่อน Asset Created / Asset Updated
- ระหว่าง uploading/saving ปุ่ม Save ต้อง disabled และสื่อว่ากำลังทำงาน
- ไม่มีคำว่า `Price` / `Asking Price` บน `Hide` ในฐานะ listing field
- Prototype หรือ note ระบุ lifecycle impact หลังเปลี่ยน status

## 2.2 Next Figma Work Pack: Asset Detail / Public Profile

**Goal:** ตรวจและปรับ Asset Detail กับ Public Profile ให้ไม่สื่อว่า `Show` เป็น marketplace listing และไม่เปิดเผยข้อมูล private/valuation ให้ Viewer

**Reference:** [05_ASSET_DETAIL_MODULE.md](05_ASSET_DETAIL_MODULE.md), [06_PROFILE_MODULE.md](06_PROFILE_MODULE.md)

### Screens / Components To Review

- [x] Asset Detail - Viewer Mode
- [x] Asset Detail - Guest Mode
- [x] Asset Detail - Owner Mode
- [x] Asset Detail - Show Mode
- [x] Asset Detail - Hide / Sold owner-only state
- [x] Public Profile
- [x] Public Profile tabs: `All`, `Sale`, `Show`
- [x] Owner Profile tabs: `All`, `Sale`, `Show`, `Hide`, `Sold`
- [x] Public Profile asset card / detail entry
- [x] Share sheet / copy link fallback
- [x] Permission denied / unavailable state

Current review status: Asset Detail / Profile coverage is complete, including Share sheet / copy link fallback and Permission denied / unavailable state.

### Required Figma Changes

- Viewer/Guest Asset Detail ต้องเปิดได้เฉพาะ `Sale` และ `Show`
- Owner Asset Detail ต้องเปิดได้ทุก status: `Sale`, `Show`, `Hide`, `Sold`
- Owner Asset Detail more menu ต้องมี Delete asset สำหรับ asset ที่ลบได้ และต้องเปิด confirmation ก่อนลบ
- Delete asset confirmation ต้องระบุ `This action cannot be undone.` และไม่มี Undo state หลังลบสำเร็จ
- `Show` ต้องเป็น public collection/detail ไม่ใช่ marketplace listing
- `Show` ต้องไม่ปรากฏใน Feed, Search หรือ Watch Alert Result
- `Show` เปิด Make Offer / Contact Seller / Chat ได้จาก Asset Detail หรือ Public Profile detail entry เท่านั้น
- Public Profile ต้องมี tabs `All`, `Sale`, `Show`
- Public Profile tab `All` ต้องรวมเฉพาะ `Sale` + `Show`
- Public Profile ต้องไม่มี `Hide`, `Sold`, Sold History, purchase data, provenance, consignment หรือ Portfolio Value Detail
- Public Profile more menu ต้องมี `Share profile`, `Report user`, `Block user`
- Owner Profile more menu ต้องใช้ `...` มุมขวาบน และมี `Share profile`, `Settings`
- Profile share sheet ต้องมี profile preview card, share channel options และ `Copy Link`
- Guest ต้อง Share Public Profile ได้โดยไม่ต้อง Login ผ่าน Profile Share Sheet แต่ Guest ยังต้องถูก block จาก Follow, Report User, Block User, Chat และ Make Offer
- Report User flow ต้องใช้ title `Report this user`, reason list ตาม Trust & Safety และ success copy ว่า profile remains visible until moderation is complete
- Block User confirmation ต้องใช้ title `Block this user?`, actions `Cancel` / `Block`, และ body ต้องบอกว่า assets/content ของ user นั้นจะถูก filter จาก Feed/Search/Watch Alert/profile surfaces, existing chat history ยังอ่านได้แบบ read-only, และไม่สามารถส่งข้อความหรือสร้าง offer ใหม่กับ user นั้นได้
- Cancel/dismiss บน Block User confirmation ต้องไม่ apply block state
- Comment action menu ต้องใช้ `...` แนวนอน; own comment = `Delete comment`, other user's comment = `Report comment`
- Delete comment confirmation ต้องใช้ copy เฉพาะ comment และไม่มี Undo
- Report Comment flow ต้องใช้ title `Report this comment`; success copy ว่า comment remains visible until moderation is complete
- Comments sheet สามารถเปิด comment action sheet ซ้อนเป็นชั้นบนสุดได้ โดยปิด action sheet แล้วต้องไม่ปิด Comments sheet
- Asset Detail Market Comparison ต้องใช้ `Asking Price` เทียบ Watch Price API Market Price เท่านั้น
- Expected Profit ต้องเป็น Owner-only เพราะใช้ purchase/private data
- Shared deep link ของ `Hide`, `Sold`, Deleted หรือ blocked asset ต้องไป unavailable / permission state ไม่ใช่เปิด private detail
- Permission denied / unavailable state ต้องใช้ CTA `Go back` และไม่ใช้ `Back to feed` บน shared fallback screen

### Status / Entry Point Notes

| Case | Figma Behavior / Annotation |
| --- | --- |
| `Sale` from Feed/Search | เปิด Asset Detail ได้และเป็น marketplace listing |
| `Show` from Public Profile | เปิด Asset Detail ได้ แต่ต้อง annotate ว่าไม่มาจาก Feed/Search/Watch Alert |
| `Hide` deep link by Viewer | แสดง permission denied / unavailable state |
| `Sold` deep link by Viewer | แสดง permission denied / unavailable state |
| Deleted asset deep link | แสดง `รายการนี้ไม่พร้อมใช้งานแล้ว` / `This item is no longer available.` |
| Permission / unavailable CTA | ใช้ primary CTA `Go back`; ถ้ามี navigation history ให้กลับหน้าก่อนหน้า ถ้าไม่มี history ให้ fallback ไป Feed |
| Owner opens own `Hide` | แสดง owner-only detail และไม่เปิดเป็น public/viewer detail |
| Owner opens own `Sold` | แสดง sold owner-only detail, Sold History และ lock main edit action |

### Acceptance Gate

- Public Profile ไม่มี tab `Hide` หรือ `Sold`
- Public Profile `All` แสดงเฉพาะ `Sale` + `Show`
- `Show` มี action จาก Detail/Public Profile แต่ไม่ถูกสื่อเป็น Feed/Search listing
- Viewer/Public ไม่เห็น private financial fields
- Market Comparison ไม่ใช้ Purchase Price fallback
- Deep link ของ non-public asset ไม่เปิด private detail
- Permission denied / unavailable screen ใช้ CTA `Go back` พร้อม fallback ไป Feed เมื่อไม่มี navigation history

### Visual Review Evidence: Owner Asset Detail - Sale

**Input:** `Owner asset detail.png`, `Owner asset detail1.png`, `Owner asset detail 2.png`, `Owner asset detail 3.png`  
**Review date:** 2026-06-23

Observed alignment:

- Owner Sale detail แสดง status `SALE`
- มี Owner actions `Edit` และ `Mark as Sold`
- ไม่มี Follow button ของตัวเอง
- มี gallery, title, reference, owner info, description, technical fields, comments และ bottom price/action bar

Observed update:

- Product decision ล่าสุดต้องการตอบโต้แบบ IG; comment UI ที่มี reply indent ใต้ comment หลักถือว่าใช้ได้ หากเป็น one-level replies เท่านั้นและไม่มี reply ซ้อนต่อจาก reply
- ภาพ `Owner asset detail 2.png` แสดง replies ใต้ comment หลักของ Marcus หลายรายการในระดับเดียวกัน และไม่เห็น reply ซ้อนใต้ reply; ถือว่าตรง direction ของ IG-style one-level replies
- ภาพ `Owner asset detail 3.png` แสดง collapsed replies ด้วย `View 2 more replies`; ถือว่าใช้ได้หากกดแล้วกาง replies ใต้ comment หลักเดิมเท่านั้น และไม่เปิด thread ซ้อนหลายระดับ

Observed gaps / notes:

- Gallery count `1 / 3` บน Detail เป็นจำนวนรูปของ asset นี้ ไม่ใช่ upload limit; ไม่เป็น gap หาก Add/Edit gallery รองรับสูงสุด 10 รูป
- Owner Sale detail ไม่จำเป็นต้องแสดง private fields บน detail หลัก หาก owner เข้าผ่าน `Edit asset` -> `Provenance`; ต้อง annotate ว่า route นี้เป็น Owner-only และห้าม Viewer/Public เข้าถึง
- Bottom price ใช้ได้กับ `Sale` แต่ต้องยืนยันว่า state `Hide` ไม่ใช้ price/asking price
- Prototype / Dev note ยังควรระบุว่าปุ่ม `Reply` บน reply item ต้องไม่สร้าง reply ชั้นที่ 2; หากกดจาก reply ให้ตอบกลับเข้าใต้ comment หลักเดิม หรือ prefill mention เท่านั้น
- `View more replies` ต้องนับและกางเฉพาะ replies ชั้นเดียวใต้ comment หลัก ไม่ใช่จำนวน comment รวมทั้งหมดหรือ thread ซ้อน

### Visual Review Evidence: Edit Asset / Provenance

**Input:** `edit asset.png`, `provenance.png`  
**Review date:** 2026-06-23

Observed alignment:

- Edit Asset แสดง gallery เป็น `4 / 10 Photos` ตรงกับ baseline สูงสุด 10 รูป
- มี entry `Provenance` จากหน้า Edit Asset สำหรับข้อมูล private
- Provenance แสดง Purchase Price, Purchase Date, Purchase From, Equipment & Accessories, Proof of Payment และ Note ซึ่งเป็น owner/private data ตาม baseline
- Price field ใน Edit Asset มี note `Only visible when the status is set to "Sale".` ซึ่งช่วยกันไม่ให้ `Show`/`Hide` ถูกตีความเป็น marketplace listing price

Required annotation:

- `Provenance` route ต้องเป็น Owner-only เสมอ
- Viewer/Public Asset Detail และ Public Profile ต้องไม่มีทางเห็น Purchase Price, Purchase Date, Purchase From, Proof of Payment หรือ Provenance note
- เมื่อ status เป็น `Hide` ต้องไม่ใช้ Price เป็น listing field

---

## 3. Wave 1: Global Foundation

**Goal:** ปิด conflict ระดับระบบก่อน เพราะกระทบหลาย screen

**Modules:** Global Rules, Navigation, Authentication, Integrations, Admin Scope

### Must Fix

- Normalize asset status ทุกหน้าจอให้เหลือ `Sale`, `Show`, `Hide`, `Sold`
- ลบ status model ซ้ำ เช่น `Status` + `Sale Status`
- แยก public state และ Owner-only/private state ให้ชัด
- จัด future menu items เป็น hidden, disabled หรือ placeholder
- Confirm Admin is not a mobile app user type and belongs only in Web Back Office
- ซ่อนหรือติดป้าย future ให้ payment/payment gateway UI
- บังคับ Terms of Use และ Privacy Policy ก่อน sign up ทุกช่องทาง
- เพิ่ม Suspended Account state ใน Sign In

### High

- ทำ Global Login Required Dialog เป็น reusable state และ map ทุก guest action
- เพิ่ม Deleted Asset unavailable state สำหรับ detail, deep link, chat reference และ offer impact
- เพิ่ม Block filtering rule สำหรับ Feed, Search, Watch Alert Result, Following Feed และ Profile entry
- เพิ่ม SSO path ที่ข้าม OTP สำหรับ Apple / Google
- เพิ่ม auth edge states: OTP expired, password policy, duplicate email, wrong auth method
- เพิ่ม FCM permission/destination mapping และ image upload/display error states
- ระบุ audit trail และ moderation handoff ใน Back Office scope

### Acceptance Check

- ไม่มี label status นอก `Sale`, `Show`, `Hide`, `Sold`
- ไม่มี active menu นอก V1 scope
- ไม่มี private data อยู่ใน Viewer/Public mode
- Guest action ที่ต้อง login ทุกจุดเปิด dialog เดียวกัน
- Admin flow ไม่ถูกนำเสนอเป็น mobile app flow

---

## 4. Wave 2: Core Marketplace Surfaces

**Goal:** ทำให้ Feed, Search, Asset Management, Asset Detail และ Profile ตรงกับ visibility matrix

**Modules:** Feed, Search & Filter, Asset Management, Asset Detail, Profile

### Must Fix

- Feed Card ไม่แสดง Location และเหลือ Posted Time
- Feed แสดงเฉพาะ Asset status `Sale`
- Search และ Watch Alert result ต้องแสดงเฉพาะ `Sale`
- Add/Edit Asset เลือกได้เฉพาะ `Sale`, `Show`, `Hide`
- `Sold` ต้องเข้าผ่าน Mark as Sold / Sale Record flow
- Gallery Add/Edit รองรับสูงสุด 10 รูป
- Comment UI รองรับ IG-style one-level replies เท่านั้น ไม่มี multi-level nested thread
- Public Profile ต้องมี tabs `All`, `Sale`, `Show`
- Public Profile `All` ต้องแสดง `Sale` + `Show`

### High

- Feed tabs ต้องนิยามครบ: `All`, `Following`, `Favorites`
- เพิ่ม Feed more menu สำหรับ Asset ของผู้อื่น: Hide this asset, Report Asset, Block User
- เพิ่ม Hide this asset success + undo state และระบุว่าเป็น user-level preference ไม่ใช่ asset status `Hide`
- เพิ่ม Feed infinite scroll, load-more, end-of-list, retry error และ offline cached state
- เพิ่ม Watch Alert Result List และห้าม notification เปิด Asset Detail ตรง
- เพิ่ม Sold Asset read-only state
- เพิ่ม Sale Record form และ Sold History display
- ระบุ private treatment ของ Provenance, Consignment, Purchase Data, Sold History และ Portfolio Value Detail
- เพิ่ม Owner-only detail state สำหรับ Hide และ Sold
- เพิ่ม Deleted Asset state ใน Asset Detail
- เพิ่ม Owner Profile tabs `All`, `Sale`, `Show`, `Hide`, `Sold`
- เพิ่ม Total Asset Value entry point ไป Portfolio เฉพาะ Owner

### Acceptance Check

- Feed/Search/Watch Alert ไม่มี `Show`, `Hide`, `Sold`, `Deleted`
- Viewer เห็น Asset Detail เฉพาะ `Sale` และ `Show`
- Owner เห็น asset ตัวเองครบ `Sale`, `Show`, `Hide`, `Sold`
- Public Profile ไม่แสดง `Hide`, `Sold`, purchase/private data
- Sold asset แก้ข้อมูลหลักไม่ได้

---

## 5. Wave 3: Communication, Offer, Notification

**Goal:** แก้ routing และ state ที่เชื่อม Chat, Offer และ Notification ให้ตรง master

**Modules:** Chat, Offer, Notification, Watch Alert, Social

### Must Fix

- Chat / New Message ไม่อยู่ใน Notification Center
- Chat unread ต้องแสดงผ่าน Chat menu badge/count
- Notification Center รองรับเฉพาะ Like, Comment, Follow, Offer, Watch Alert
- Feed Comment / Share ต้องพาไป Asset Detail ไม่ทำ action โดยตรงจาก Feed
- Social comment UI ต้องรองรับ IG-style one-level replies เท่านั้น และไม่มี multi-level nested thread

### High

- Make Offer ต้องเริ่มจาก Asset Detail เท่านั้น
- `Show` asset ทำ Offer / Contact Seller / Chat ได้จาก Detail หรือ Public Profile detail entry
- Hide, Sold, Deleted สร้าง Offer ใหม่ไม่ได้
- Offer Accepted เปิด Chat Room
- Offer Rejected เปิด Asset Detail
- Offer Cancelled เปิด Chat Room และ focus Offer Card
- Asset Deleted ต้องทำ Offer เป็น Cancelled
- Asset Sold ต้อง auto reject pending offers อื่น
- Chat asset reference ต้องมี Deleted / Sold state
- Block จาก Chat ต้องทำให้ history เดิม read-only และส่งข้อความใหม่ไม่ได้
- Notification destination ต้องครบทุก type
- Watch Alert notification ต้องเปิด Watch Alert Result List
- Comment notification ต้องเปิด Asset Detail และ focus comment

### Acceptance Check

- ไม่มี Chat/New Message ใน Notification Center
- Offer state ครบ Pending, Accepted, Rejected, Cancelled
- Watch Alert notification ไม่เปิด Asset Detail ตรง
- หลัง block แล้ว chat อ่านได้แต่ส่งข้อความไม่ได้
- New chat/new offer ระหว่างคู่ที่ block กันสร้างไม่ได้

---

## 6. Wave 4: Content, Settings, Portfolio, Trust

**Goal:** ปิด flow เสริมที่กระทบ compliance, privacy และ product boundary

**Modules:** Board, Settings, Portfolio, Trust & Safety, Non-Functional Requirements

### Must Fix

- Board เป็น Article Area ไม่ใช่ forum หรือ user-generated post board
- ตัด Create/Edit/Delete Post ของ Front Office user
- Settings ต้องมี Theme Mode: Dark Mode / Light Mode
- Settings ต้องมี Delete Account ภายใน `About your account` พร้อม confirmation/risk state, success modal `Account deletion started`, destination ไป Sign In / pre-auth และ API failure/retry state

### High

- Board categories ต้องครบ: Feature Article, Trending Now, Journal Board, Watch Brands, Watch 101, Watch Apparel, Watch Events
- Article Detail รองรับ Like / Share
- Settings ต้องมี Language: English / Thai
- Email Display ต้อง read-only หลัง verify
- Settings menu ต้องครบตาม locked order: Account, Your app and media, Notifications, More info and support, bottom Sign out
- About app ต้องแสดง `TUK DAENG`, tagline, `Version 0.0.1`, `Mister Fox Co., Ltd.`, `Est. 2026`, Privacy Policy, Terms of Use และ Contact support
- Help ต้องแสดง Contact support, Available daily, `09:00 - 22:00 (GMT+7)`, LINE `@mrfoxthailand`, Phone `(+66) 80-008-8088`, Email `service@mrfox.com`
- Change Password ต้องมี Current password, New password, Confirm new password, password helper text, field-level validation states และ API error state แยกจาก field error
- Portfolio เป็น Owner-only
- Portfolio คำนวณจาก `Sale`, `Show`, `Hide` และไม่รวม `Sold`
- เพิ่ม valuation source label: Watch Price API -> Purchase Price fallback -> No Valuation
- เพิ่ม Gain/Loss, Realized Gain/Loss, Expected Profit และ Market Comparison states
- Report submit ต้องไม่ทำให้ content หายทันที
- Report type ต้องตรง master: Asset, User, Comment, Board Content
- Apple compliance coverage ต้องครบ Report, Block, Terms, Privacy, Moderation Flow

### Acceptance Check

- Front Office user ไม่มี flow สร้างหรือจัดการ article
- Public Profile เข้า Portfolio ไม่ได้
- Portfolio/private financial data ไม่โผล่ใน public mode
- Report success state ไม่ซ่อน content ทันที
- Settings ไม่มี notification type นอก Like, Comment, Follow, Offer, Watch Alert
- Notification Settings toggles ต้อง default ON และ auto-save โดยไม่มี Save button

---

## 7. Wave 5: Dev / QA Handoff Review

**Goal:** ตรวจว่า Figma cleanup พร้อมให้ Dev และ QA ใช้ต่อ

### UX Deliverables

- Figma `Must Fix` มี status เป็น Done หรือมี decision note
- Figma `High` มี status เป็น Done, owner หรือ explicit decision note
- ทุก flow หลักมี empty, loading, error และ permission state ที่จำเป็น
- ทุก destination จาก Notification, Deep Link และ Guest Login ถูก annotate
- ทุก private/public state มี label หรือ frame separation ชัดเจน

### Dev Handoff Checks

- Dev อ่าน [README_MODULE_INDEX.md](README_MODULE_INDEX.md) ก่อนแตก ticket
- Dev ใช้ [DEV_IMPLEMENTATION_CHECKLIST.md](DEV_IMPLEMENTATION_CHECKLIST.md) เป็น implementation checklist
- API contract ต้องระบุ status filtering, permission, private data และ block filtering server-side
- ถ้า Figma ขัดกับ master ให้ยึด master และแจ้ง product owner

### QA Handoff Checks

- QA ใช้ [QA_TEST_SCENARIO_CHECKLIST.md](QA_TEST_SCENARIO_CHECKLIST.md)
- Test coverage ต้องครอบคลุม Guest, Member, Owner, Other User และ Admin boundary
- ต้อง test asset lifecycle: `Sale`, `Show`, `Hide`, `Sold`, `Deleted`
- ต้อง test Notification routing, Watch Alert result, Block/Report, Portfolio fallback และ No market price

---

## 8. Suggested Assignment

| Task Group | Owner | Primary Files |
| --- | --- | --- |
| Global status, visibility, guest login, deleted/block state | UX Lead + Product | `00_GLOBAL_RULES_MODULE.md`, `00_NAVIGATION_AND_CROSS_MODULE_FLOW.md` |
| Feed/Search/Profile/Asset surfaces | UX Marketplace | `02_FEED_MODULE.md`, `03_SEARCH_FILTER_MODULE.md`, `04_ASSET_MANAGEMENT_MODULE.md`, `05_ASSET_DETAIL_MODULE.md`, `06_PROFILE_MODULE.md` |
| Chat/Offer/Notification/Watch Alert | UX Transaction | `07_CHAT_MODULE.md`, `08_OFFER_MODULE.md`, `09_NOTIFICATION_MODULE.md`, `10_WATCH_ALERT_MODULE.md` |
| Board/Settings/Portfolio/Trust | UX Platform | `12_BOARD_MODULE.md`, `13_SETTINGS_MODULE.md`, `14_PORTFOLIO_MODULE.md`, `15_TRUST_SAFETY_MODULE.md` |
| Dev/QA readiness | Product + Tech Lead + QA Lead | `DEV_IMPLEMENTATION_CHECKLIST.md`, `QA_TEST_SCENARIO_CHECKLIST.md` |

---

## 9. Open Decision Items

รายการนี้ยังไม่ควร implement เป็น behavior final จนกว่าจะมี decision ใน master หรือ product decision log แต่สามารถเตรียม Figma เป็น placeholder / annotated state ได้ตาม recommendation ด้านล่าง

| Decision Item | Current Baseline | Recommended V1 Decision | Figma / UX Action | Dev / QA Note |
| --- | --- | --- | --- | --- |
| Delete Chat behavior แบบละเอียด | Locked in Chat Module for V1 | Delete Chat = ซ่อนห้องแชทจาก list เฉพาะฝั่งผู้กด, ไม่ลบ message/archive ฝั่ง server, ไม่กระทบคู่สนทนา, ไม่ลบหลักฐาน offer/chat history, และไม่มี restore UI ใน V1 | Chat overflow menu ต้องมี `View profile`, `Mute notifications`/`Unmute notifications`, `Delete chat`, `Report user`, `Block user`; Delete confirmation ใช้ `Delete chat?`, actions `Cancel`/`Delete chat`, success `Chat deleted`, API error `Unable to delete chat. Please try again.` | Backend ควรเก็บ conversation/message audit ไว้ตาม retention policy; QA ต้อง test menu order, mute/unmute toast, คู่สนทนายังเห็นห้องเดิม และ offer/chat record ไม่หาย |
| Share channel implementation | Social/Board ระบุว่า Share ต้องทำผ่าน Asset Detail หรือ Article Detail แต่ยังไม่ lock ว่าใช้ system share sheet, copy link หรือ deep link preview | ใช้ V1 เป็น public share action: primary = system share sheet ถ้า platform รองรับ, fallback = copy public deep link; ไม่ต้อง login สำหรับ share public content; ไม่สร้าง notification | เพิ่ม Share Sheet state, Copy Link success state และ unavailable state เมื่อ content ถูกลบ/ไม่ public; Asset share เริ่มจาก Asset Detail เท่านั้น ส่วน Article share เริ่มจาก Article Detail | Dev ต้อง generate public deep link ที่ validate status/permission เมื่อเปิด; QA ต้อง test guest share, deleted asset link, private/Hide/Sold link และ article share |
| Article Comment / Report Article ใน Board V1 | Locked in Board Module for V1 | คง Article Comment ออกจาก FO V1; เปิด report ผ่าน label `Report article` โดย map เข้า Trust & Safety report type `Board Content` และ target type `Article` | Article Detail overflow menu มี `Report article`; reason sheet มี 6 reasons, `Additional details (optional)`, disabled submit until reason selected; success ใช้ `Report submitted`, body ว่า article ยัง visible จน moderation complete, action `Done`; ห้ามแสดง `Hide article` หรือ `Hide this asset from feed?` | QA ต้องยืนยันว่า Front Office user สร้าง/edit/delete article หรือ comment ไม่ได้, report ไม่ทำให้บทความหายทันที, duplicate แสดง `You already reported this article.`, API fail แสดง retry error |
| Delete Account retention / grace period policy | Decision locked in Settings Module for V1 | Soft delete/deactivate account after confirm, revoke session immediately, show `Account deletion started`, route `Back to sign in` to Sign In / pre-auth, use 30-day grace period before hard delete/anonymization, and retain chats/offers/reports/transaction/audit records where required for safety/legal/audit | Add Delete Account confirmation, success modal, Sign In destination, account-deleted/support login state, and API failure/retry state; copy must not promise immediate full data deletion | Dev must separate profile/account deactivation from transaction/audit retention; QA must test session revoke, back navigation blocked, public profile unavailable, asset visibility, chat/offer historical reference, failed API handling, and re-login during grace period |
| Full Back Office PRD | Mobile V1 ใช้ `18_ADMIN_SCOPE_NOTE.md` เป็น boundary และ Admin อยู่บน Web Back Office เท่านั้น | ยังไม่เริ่ม Full Back Office PRD ในรอบนี้ ให้จัดการ FO ให้ครบก่อน: master/module PRD, Figma cleanup, Dev checklist, QA checklist และ FO sign-off ต้องนิ่งก่อน แล้วค่อยเปิด Back Office sprint แยก | ใน Figma FO ให้แสดงเฉพาะ handoff note หรือ moderation/admin boundary ที่จำเป็น ห้ามเพิ่ม Admin mobile flow | Dev/QA ใช้ `18_ADMIN_SCOPE_NOTE.md` เป็น boundary ชั่วคราว; งาน Full Back Office PRD จะเริ่มหลัง FO scope complete และไม่ควร block FO implementation |

### Decision Update Order

เมื่อ product owner approve รายการด้านบน ให้ update ตามลำดับนี้:

1. `TukDaeng_Master_Product_Definition.md`
2. Module PRD ที่เกี่ยวข้อง: `07_CHAT_MODULE.md`, `11_SOCIAL_MODULE.md`, `12_BOARD_MODULE.md`, `13_SETTINGS_MODULE.md`, `15_TRUST_SAFETY_MODULE.md`, `18_ADMIN_SCOPE_NOTE.md`
3. `Figma_Gap_Checklist_Against_Master.md`
4. `DEV_IMPLEMENTATION_CHECKLIST.md`
5. `QA_TEST_SCENARIO_CHECKLIST.md`
6. Figma annotation และ prototype states
