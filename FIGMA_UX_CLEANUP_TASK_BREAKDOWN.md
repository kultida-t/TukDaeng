# TukDaeng Figma UX Cleanup Task Breakdown

**Reference:** [Figma_Gap_Checklist_Against_Master.md](Figma_Gap_Checklist_Against_Master.md)  
**Source of truth:** [TukDaeng_Master_Product_Definition.md](TukDaeng_Master_Product_Definition.md)  
**Purpose:** แปลง Figma gap checklist ให้เป็น task group สำหรับ UX/Figma cleanup ก่อนส่ง Dev และ QA

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
| UX-MF-006 | Asset add/edit status model and required fields | UX Marketplace | ปรับ Add/Edit Asset ให้เลือกได้เฉพาะ `Sale`, `Show`, `Hide`; แยก `Sold` ไป Mark as Sold / Sale Record flow; ทำ required field state ตาม Sale/Show/Hide matrix | `Sold` ไม่ปรากฏเป็นตัวเลือก status ปกติใน Edit Asset; Sale require Photo/Brand/Model/Condition/Price/Description; Show require Photo/Brand/Model; Hide require Photo/Brand | `04_ASSET_MANAGEMENT_MODULE.md` |
| UX-MF-007 | Gallery upload limit | UX Marketplace | ปรับ Add/Edit gallery limit เป็นสูงสุด 10 รูป พร้อม state เมื่อเกิน limit | Upload UI และ validation copy ระบุ 10 รูป | `04_ASSET_MANAGEMENT_MODULE.md` |
| UX-MF-008 | Comment model | UX Marketplace + UX Transaction | ปรับ comment UI ใน Asset/Social ให้เป็น single level และตัด nested reply/reply chain | ไม่มี `View replies`, nested indentation หรือ reply thread ใน V1 | `05_ASSET_DETAIL_MODULE.md`, `11_SOCIAL_MODULE.md` |
| UX-MF-009 | Public Profile tabs | UX Marketplace | เพิ่ม Public Profile tabs `All`, `Sale`, `Show`; `All` แสดง `Sale` + `Show` เท่านั้น | Public Profile ไม่มี `Hide` หรือ `Sold`; Owner profile แยกอีก state | `06_PROFILE_MODULE.md` |
| UX-MF-010 | Notification Center baseline | UX Transaction | เหลือ notification type เฉพาะ Like, Comment, Follow, Offer, Watch Alert | ไม่มี Chat/New Message, Moderation, Account Action, Market Update, Price/Valuation หรือ Sale Success ใน FO Notification Center | `09_NOTIFICATION_MODULE.md` |
| UX-MF-011 | Chat unread routing | UX Transaction | ย้าย Chat/New Message ออกจาก Notification Center และแสดงผ่าน Chat menu unread badge/count | New message ไม่สร้าง Notification Center item ใน prototype | `07_CHAT_MODULE.md`, `09_NOTIFICATION_MODULE.md` |
| UX-MF-012 | Board scope | UX Platform | ปรับ Board ให้เป็น Article Area และตัด Create/Edit/Delete Post สำหรับ Front Office user | FO user อ่าน/like/share article ได้ แต่สร้างหรือจัดการ article ไม่ได้ | `12_BOARD_MODULE.md` |
| UX-MF-013 | Settings baseline | UX Platform | เพิ่ม Theme Mode และ Delete Account พร้อม warning/confirmation/risk state | Settings มี Dark/Light Mode และ Delete Account ไม่ถูก mark เป็น future | `13_SETTINGS_MODULE.md` |
| UX-MF-014 | Admin boundary | UX Platform + Product | แยก Admin ออกจาก mobile role และ annotate ว่าอยู่ใน Web Back Office | Mobile app ไม่มี Admin role/flow ที่ทำงานจริง | `18_ADMIN_SCOPE_NOTE.md` |
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

## 3. Wave 1: Global Foundation

**Goal:** ปิด conflict ระดับระบบก่อน เพราะกระทบหลาย screen

**Modules:** Global Rules, Navigation, Authentication, Integrations, Admin Scope

### Must Fix

- Normalize asset status ทุกหน้าจอให้เหลือ `Sale`, `Show`, `Hide`, `Sold`
- ลบ status model ซ้ำ เช่น `Status` + `Sale Status`
- แยก public state และ Owner-only/private state ให้ชัด
- จัด future menu items เป็น hidden, disabled หรือ placeholder
- ยืนยันว่า Admin ไม่ใช่ mobile role และอยู่ใน Web Back Office เท่านั้น
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
- Comment UI เป็น single level เท่านั้น ไม่มี nested reply
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
- Social comment UI ต้อง single level และไม่มี nested comment

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
- Settings ต้องมี Delete Account และ confirmation/risk state

### High

- Board categories ต้องครบ: Feature Article, Trending Now, Journal Board, Watch Brands, Watch 101, Watch Apparel, Watch Events
- Article Detail รองรับ Like / Share
- Settings ต้องมี Language: English / Thai
- Email Display ต้อง read-only หลัง verify
- Settings menu ต้องครบตาม master และไม่รวม type นอก baseline
- Portfolio เป็น Owner-only
- Portfolio คำนวณจาก `Sale`, `Show`, `Hide` และไม่รวม `Sold`
- เพิ่ม valuation source label: Watch Price API -> Owner Estimated Value -> Purchase Price fallback -> No Valuation
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
| Delete Chat behavior แบบละเอียด | Master และ Chat PRD ระบุว่า Delete Chat ต้องมี confirmation แต่ยังไม่สรุปว่าลบเฉพาะฝั่งตัวเอง, ซ่อนจาก list, ลบทั้งคู่สนทนา หรือกู้ history ได้หรือไม่ | ใช้ V1 แบบ conservative: Delete Chat = ซ่อนห้องแชทจาก list เฉพาะฝั่งผู้กด, ไม่ลบ message/archive ฝั่ง server, ไม่กระทบคู่สนทนา, ไม่ลบหลักฐาน offer/chat history, และไม่มี restore UI ใน V1 | เพิ่ม confirmation copy ให้ชัดว่าเป็นการซ่อนจากรายการของผู้ใช้คนนี้เท่านั้น ไม่ลบประวัติของอีกฝ่าย; หลังลบให้กลับ Chat List และห้องหายจาก list ของผู้กด | Backend ควรเก็บ conversation/message audit ไว้ตาม retention policy; QA ต้อง test ว่าคู่สนทนายังเห็นห้องเดิม และ offer/chat record ไม่หาย |
| Share channel implementation | Social/Board ระบุว่า Share ต้องทำผ่าน Asset Detail หรือ Article Detail แต่ยังไม่ lock ว่าใช้ system share sheet, copy link หรือ deep link preview | ใช้ V1 เป็น public share action: primary = system share sheet ถ้า platform รองรับ, fallback = copy public deep link; ไม่ต้อง login สำหรับ share public content; ไม่สร้าง notification | เพิ่ม Share Sheet state, Copy Link success state และ unavailable state เมื่อ content ถูกลบ/ไม่ public; Asset share เริ่มจาก Asset Detail เท่านั้น ส่วน Article share เริ่มจาก Article Detail | Dev ต้อง generate public deep link ที่ validate status/permission เมื่อเปิด; QA ต้อง test guest share, deleted asset link, private/Hide/Sold link และ article share |
| Article Comment / Report Article ใน Board V1 | Board baseline รองรับ Article List/Detail, Search, Category Filter, Like และ Share; Article Comment และ article-specific Report Article ไม่อยู่ใน FO V1 | คง Article Comment และ article-specific Report Article ออกจาก FO V1 เพื่อไม่ขยาย moderation scope; หากต้องรองรับ report สำหรับ compliance ให้ใช้ generic Report Board Content ผ่าน Trust & Safety โดยไม่เปิด comment thread | ซ่อน Article Comment UI, comment count, reply และ user post affordance; ถ้าจำเป็นให้มี report action แบบ minimal บน Article Detail พร้อม label `Report content` และส่งเข้า moderation handoff | QA ต้องยืนยันว่า Front Office user สร้าง/edit/delete article หรือ comment ไม่ได้; ถ้าเปิด Report Board Content ต้อง test ว่า report ไม่ทำให้บทความหายทันที |
| Delete Account retention / grace period policy | Settings baseline มี Delete Account พร้อม warning/confirmation แต่ retention/grace period ยังไม่สรุป | ใช้ V1 recommendation: soft delete account ทันทีหลัง confirm, sign out และ revoke session; ตั้ง grace period 30 วันก่อน hard delete/anonymization; ระหว่าง grace period login ไม่ได้หรือเข้าสู่ account-deleted support state; เก็บ transaction, offer, chat, report/audit record เท่าที่จำเป็นตาม legal/safety | เพิ่ม Delete Account warning, final confirmation, success/signed-out state และ account-deleted/support state; copy ต้องบอกผลกระทบต่อ profile, assets, chat, offers และ retention แบบไม่สัญญาลบข้อมูลที่ต้องเก็บตามกฎหมาย/ความปลอดภัย | Dev ต้องแยก personal profile deletion/anonymization ออกจาก transaction/audit retention; QA ต้อง test session revoke, public profile unavailable, asset visibility, chat/offer historical reference และ re-login หลัง delete |
| Full Back Office PRD | Mobile V1 ใช้ `18_ADMIN_SCOPE_NOTE.md` เป็น boundary และ Admin อยู่บน Web Back Office เท่านั้น | ยังไม่เริ่ม Full Back Office PRD ในรอบนี้ ให้จัดการ FO ให้ครบก่อน: master/module PRD, Figma cleanup, Dev checklist, QA checklist และ FO sign-off ต้องนิ่งก่อน แล้วค่อยเปิด Back Office sprint แยก | ใน Figma FO ให้แสดงเฉพาะ handoff note หรือ moderation/admin boundary ที่จำเป็น ห้ามเพิ่ม Admin mobile flow | Dev/QA ใช้ `18_ADMIN_SCOPE_NOTE.md` เป็น boundary ชั่วคราว; งาน Full Back Office PRD จะเริ่มหลัง FO scope complete และไม่ควร block FO implementation |

### Decision Update Order

เมื่อ product owner approve รายการด้านบน ให้ update ตามลำดับนี้:

1. `TukDaeng_Master_Product_Definition.md`
2. Module PRD ที่เกี่ยวข้อง: `07_CHAT_MODULE.md`, `11_SOCIAL_MODULE.md`, `12_BOARD_MODULE.md`, `13_SETTINGS_MODULE.md`, `15_TRUST_SAFETY_MODULE.md`, `18_ADMIN_SCOPE_NOTE.md`
3. `Figma_Gap_Checklist_Against_Master.md`
4. `DEV_IMPLEMENTATION_CHECKLIST.md`
5. `QA_TEST_SCENARIO_CHECKLIST.md`
6. Figma annotation และ prototype states
