# TukDaeng QA Test Scenario Checklist

Reference:

- [TukDaeng_Master_Product_Definition.md](TukDaeng_Master_Product_Definition.md)
- [DEV_IMPLEMENTATION_CHECKLIST.md](DEV_IMPLEMENTATION_CHECKLIST.md)
- [Figma_Gap_Checklist_Against_Master.md](Figma_Gap_Checklist_Against_Master.md)

Purpose:

เอกสารนี้ใช้เป็น QA scenario checklist สำหรับตรวจระบบหลัง Dev implement โดยเน้น role, permission, lifecycle, routing, fallback และ edge case ที่มีโอกาสเกิดกับผู้ใช้จริง

---

# 0. Test Data Setup

- [ ] มี Guest session
- [ ] มี Member A และ Member B
- [ ] มี Owner account ที่มี Asset ครบ status: `Sale`, `Show`, `Hide`, `Sold`
- [ ] มี Admin / Back Office reference หรือ mock moderation endpoint
- [ ] มี Asset ที่ถูก Deleted
- [ ] มี Asset ที่มี Offer Pending / Accepted / Rejected / Cancelled
- [ ] มี Chat Room พร้อม Asset Card และ Offer Card
- [ ] มี Watch Alert ที่ match และไม่ match
- [ ] มี Portfolio asset ที่มี Market Price
- [ ] มี Portfolio asset ที่ไม่มี Market Price แต่มี Owner Estimated Value
- [ ] มี Portfolio asset ที่ไม่มี Market Price/Owner Estimate แต่มี Purchase Price
- [ ] มี Portfolio asset ที่ไม่มี valuation data เลย
- [ ] มี Sold Asset ที่มี Sale Price และ Purchase Price
- [ ] มี user pair ที่ block กัน

---

# 1. Global Role And Permission

## QA-GLOBAL-001: Guest Login Required

Given user เป็น Guest  
When user กด Like, Follow, Comment, Offer, Chat, Favorites, Following, Watch Alert, Add Asset หรือ Article Like  
Then ระบบต้องแสดง Global Login Required Dialog

## QA-GLOBAL-002: Guest Public Browsing

Given user เป็น Guest  
When user เปิด Feed, Search, Public Asset Detail, Public Profile หรือ Board Article  
Then user ต้องดู public content ได้โดยไม่ต้อง Login

## QA-GLOBAL-003: Guest Public Share

Given user เป็น Guest  
When user Share public Asset deep link หรือ Article deep link  
Then ระบบต้องเริ่ม share behavior ได้โดยไม่บังคับ Login

## QA-GLOBAL-004: Private Data Not Public

Given user ไม่ใช่ Owner  
When user เปิด Public Asset Detail หรือ Public Profile  
Then user ต้องไม่เห็น Purchase Price, Purchase Date, Purchase From, Proof of Payment, Provenance, Consignment, Sold History หรือ Portfolio Value Detail

---

# 2. Asset Visibility Matrix

## QA-VIS-001: Sale Visibility

Given Asset status เป็น `Sale`  
When user เปิด Owner Profile, Public Profile, Feed, Search หรือ Watch Alert Result  
Then Asset ต้องแสดงตาม permission และ match Watch Alert ได้

## QA-VIS-002: Show Visibility

Given Asset status เป็น `Show`  
When user เปิด Owner Profile หรือ Public Profile  
Then Asset ต้องแสดง  
When user เปิด Feed, Search หรือ Watch Alert Result  
Then Asset ต้องไม่แสดง

## QA-VIS-003: Show Asset Actions

Given Asset status เป็น `Show` และ user เป็น Member  
When user เปิด Asset Detail จาก Public Profile  
Then ต้องเห็น Make Offer / Contact Seller / Chat  
And การสร้าง Offer ต้องทำได้จาก Detail เท่านั้น

## QA-VIS-004: Hide Visibility

Given Asset status เป็น `Hide`  
When Owner เปิด Owner Profile หรือ Owner Asset Detail  
Then Asset ต้องแสดง  
When user อื่นเปิด Public Profile, Feed, Search หรือ deep link  
Then Asset ต้องไม่แสดงหรือแสดง permission/unavailable state

## QA-VIS-005: Sold Visibility

Given Asset status เป็น `Sold`  
When Owner เปิด Owner Profile หรือ Sold History  
Then Asset ต้องแสดง  
When user อื่นเปิด Public Profile, Feed, Search หรือ Watch Alert  
Then Asset ต้องไม่แสดง

## QA-VIS-006: Deleted Asset

Given Asset ถูก Deleted  
When user เปิด public list ใด ๆ  
Then Asset ต้องไม่แสดง  
When user เปิด deep link เดิม  
Then Asset Detail ต้องแสดง `รายการนี้ไม่พร้อมใช้งานแล้ว`

---

# 3. Authentication

## QA-AUTH-001: Email Sign Up OTP

Given user สมัครด้วย Email / Password  
When user submit sign up  
Then ระบบต้องส่ง OTP และรอ verify ก่อนใช้งานเป็น Member

## QA-AUTH-002: OTP Expired

Given OTP ถูกสร้างเกิน 30 นาที  
When user submit OTP  
Then ระบบต้อง reject และให้ขอ OTP ใหม่

## QA-AUTH-003: Password Policy

Given user ตั้ง password น้อยกว่า 8 ตัวอักษร หรือไม่มีตัวเลข/สัญลักษณ์  
When user submit  
Then ระบบต้องแสดง validation error

## QA-AUTH-004: Duplicate Email

Given email ถูกใช้สมัครแล้ว  
When user สมัครด้วย email เดิม  
Then ระบบต้อง reject และแนะนำให้ Sign In

## QA-AUTH-005: SSO Skips OTP

Given user สมัครด้วย Apple หรือ Google  
When provider auth สำเร็จ  
Then ระบบต้องไม่บังคับ OTP

## QA-AUTH-006: Wrong Auth Method

Given account เป็น SSO-only  
When user Sign In ด้วย Email / Password  
Then ระบบต้องแสดง auth method conflict error

## QA-AUTH-007: Suspended Account

Given account ถูก Suspended  
When user Sign In  
Then ระบบต้อง block login พร้อมเหตุผลและช่องทาง Support

---

# 4. Feed

## QA-FEED-001: Feed Sale Only

Given มี Asset ทุก status  
When Member เปิด Feed `All`  
Then Feed ต้องแสดงเฉพาะ `Sale`

## QA-FEED-002: Following Feed Block Filter

Given Member A follow Member B  
And Member A block Member B หรือ Member B block Member A  
When Member A เปิด Following Feed  
Then Asset ของ Member B ต้องไม่แสดง

## QA-FEED-003: Favorites Sync

Given Member กด Like Asset status `Sale`  
When Member เปิด Favorites  
Then Asset ต้องแสดง  
When Member Unlike Asset  
Then Asset ต้องหายจาก Favorites

## QA-FEED-004: Feed No Location

Given Feed Card แสดง  
When QA ตรวจ card content  
Then card ต้องไม่แสดง Location

## QA-FEED-005: Feed Error Retry

Given Feed API fail  
When user เปิด Feed  
Then ต้องแสดง Error State พร้อมปุ่ม retry

## QA-FEED-006: Feed Offline Cache

Given user เคยโหลด Feed แล้ว  
When network offline  
Then Feed ต้องแสดง cached data ล่าสุดพร้อม offline indicator

---

# 5. Search And Watch Alert

## QA-SEARCH-001: Search Sale Only

Given มี Asset ทุก status  
When user search ด้วย keyword หรือ filter  
Then result ต้องแสดงเฉพาะ `Sale`

## QA-SEARCH-002: Dependent Filter

Given user เลือก Brand = Rolex  
When user เปิด Model filter  
Then Model list ต้องเหลือเฉพาะ model ของ Rolex

## QA-SEARCH-003: Watch Alert No Required Field

Given user เปิด Create Watch Alert  
When user ไม่กรอก field เพิ่มและกด save  
Then ระบบต้องสร้าง Watch Alert ได้และตั้งชื่อจาก criteria

## QA-WATCH-001: Watch Alert Match Sale Only

Given Watch Alert criteria ตรงกับ Asset status `Sale` และ `Show`  
When match job ทำงาน  
Then notification/result ต้องสร้างเฉพาะ `Sale`

## QA-WATCH-002: Watch Alert Notification Destination

Given user มี Watch Alert notification  
When user กด notification  
Then ต้องเปิด Watch Alert Result List  
And ต้องไม่เปิด Asset Detail โดยตรง

---

# 6. Asset Management

## QA-ASSET-001: Gallery Limit

Given Owner เพิ่มรูป Asset  
When Owner upload รูป  
Then ระบบต้องรองรับสูงสุด 10 รูปและป้องกันเกิน limit

## QA-ASSET-002: Sold Not Normal Edit Status

Given Owner เปิด Edit Asset  
When status selector แสดง  
Then ต้องมีเฉพาะ `Sale`, `Show`, `Hide`  
And `Sold` ต้องเข้าผ่าน Mark as Sold / Sale Record flow

## QA-ASSET-003: Mark As Sold

Given Owner mark Asset as Sold  
When Owner submit Sale Record  
Then ระบบต้องเก็บ Sale Date, Buyer, Contact, Sale Price, Payment Method, Attachment

## QA-ASSET-004: Sold Locks Main Fields

Given Asset status เป็น `Sold`  
When Owner เปิด Edit main info  
Then main fields ต้องถูก lock

## QA-ASSET-005: Delete Asset Impact

Given Owner Delete Asset  
When deletion สำเร็จ  
Then Asset ต้องหายจาก Feed/Search/Watch Alert/Public Profile  
And related Offer ต้องเป็น `Cancelled`  
And related Chat ต้องยังอยู่

---

# 7. Asset Detail And Social

## QA-DETAIL-001: Detail Public Status

Given user ไม่ใช่ Owner  
When user เปิด Asset Detail  
Then user เปิดได้เฉพาะ `Sale` และ `Show`

## QA-DETAIL-002: Owner Detail All Status

Given user เป็น Owner  
When Owner เปิด Asset Detail ของตัวเอง  
Then Owner เปิดได้ทุก status: `Sale`, `Show`, `Hide`, `Sold`

## QA-DETAIL-003: Single Level Comment

Given user เปิด Comments  
When comments แสดง  
Then ต้องไม่มี nested reply, reply chain หรือ view replies

## QA-DETAIL-004: Delete Comment Permission

Given Member A สร้าง comment  
When Member B พยายาม delete comment ของ Member A  
Then ระบบต้อง reject  
When Member A delete comment ตัวเอง  
Then ระบบต้องลบได้

## QA-DETAIL-005: Market Comparison

Given Asset มี Asking Price และ Watch Price API Market Price  
When Asset Detail แสดง price analytics  
Then ต้องแสดง Above Market / At Market / Below Market ตาม threshold  
And ต้องไม่ใช้ Owner Estimate หรือ Purchase Price fallback

## QA-DETAIL-006: Expected Profit Owner Only

Given Asset มี Asking Price และ Purchase Price  
When Owner เปิด Detail  
Then Owner เห็น Expected Profit  
When Viewer เปิด Detail  
Then Viewer ต้องไม่เห็น Expected Profit หรือ Purchase Price

---

# 8. Offer

## QA-OFFER-001: Offer Entry Point

Given Member ต้องการ Make Offer  
When Member อยู่ Feed/Search/Profile list/Chat  
Then ต้องไม่สามารถสร้าง Offer ใหม่โดยตรง  
When Member เปิด Asset Detail ของ `Sale` หรือ `Show`  
Then Make Offer ต้องทำได้

## QA-OFFER-002: Offer Unavailable Status

Given Asset status เป็น `Hide`, `Sold` หรือ `Deleted`  
When Member พยายาม Make Offer  
Then ระบบต้องไม่สร้าง Offer

## QA-OFFER-003: Offer Sent Opens Chat

Given Buyer submit valid offer  
When offer created  
Then status ต้องเป็น `Pending`  
And ระบบต้องเปิด Chat Room พร้อม Offer Card

## QA-OFFER-004: Accept Offer

Given Seller มี Pending Offer  
When Seller Accept และ confirm  
Then Offer status ต้องเป็น `Accepted`  
And Buyer ได้ Offer Accepted notification  
And notification เปิด Chat Room

## QA-OFFER-005: Reject Offer

Given Seller มี Pending Offer  
When Seller Reject และ confirm  
Then Offer status ต้องเป็น `Rejected`  
And Buyer ได้ Offer Rejected notification  
And notification เปิด Asset Detail

## QA-OFFER-006: New Offer Notification

Given Buyer ส่ง Offer ใหม่  
When Seller ได้ New Offer notification  
Then notification ต้องเปิด Chat Room และ focus Offer Card

## QA-OFFER-007: Offer Cancelled

Given Asset ถูก Deleted  
When related Offer ถูกเปลี่ยนเป็น `Cancelled`  
Then Buyer/Seller notification ต้องเปิด Chat Room และ focus Offer Card ที่ Cancelled  
And Asset reference ต้องแสดง unavailable state

## QA-OFFER-008: Asset Sold Auto Reject

Given Asset มีหลาย Pending Offer  
When Owner mark Asset as Sold  
Then Offer อื่นที่ไม่ใช่รายการที่เลือกขายต้อง Auto Reject

---

# 9. Chat

## QA-CHAT-001: New Message Badge Only

Given Member ได้รับข้อความใหม่  
When user ดู notification surfaces  
Then Chat menu ต้องมี unread badge/count  
And Notification Center ต้องไม่มี Chat/New Message item

## QA-CHAT-002: Deleted Asset Reference

Given Chat Room อ้างถึง Asset ที่ถูก Deleted  
When user เปิด Chat Room  
Then Chat ต้องยังอยู่  
And Asset reference ต้องแสดง unavailable state

## QA-CHAT-003: Block Chat Read Only

Given Member A block Member B  
When A หรือ B เปิด Chat history เดิม  
Then history ต้องอ่านได้  
And message input ต้อง disabled/read-only

## QA-CHAT-004: Block Prevents New Offer

Given Member A และ B block กัน  
When A หรือ B พยายามสร้าง Chat หรือ Offer ใหม่  
Then ระบบต้อง reject

---

# 10. Notification

## QA-NOTI-001: Supported Types Only

Given Notification Center แสดงรายการ  
When QA ตรวจ type  
Then type ต้องอยู่ใน Like, Comment, Follow, Offer, Watch Alert เท่านั้น

## QA-NOTI-002: Unsupported Types Hidden

Given system มี Market Update, Price/Valuation, Sale Success, Moderation หรือ Account Action  
When user เปิด FO Notification Center  
Then type เหล่านั้นต้องไม่แสดง

## QA-NOTI-003: Destination Routing

Given user มี notification type ต่อไปนี้  
When user กด notification  
Then destination ต้องตรงนี้:

| Type | Expected Destination |
| --- | --- |
| Like | Asset Detail |
| Comment | Asset Detail + Focus Comment |
| Follow | Public Profile |
| Watch Alert | Watch Alert Result List |
| New Offer | Chat Room + Focus Offer Card |
| Offer Accepted | Chat Room |
| Offer Rejected | Asset Detail |
| Offer Cancelled | Chat Room + Focus Offer Card |

## QA-NOTI-004: Read Unread Badge

Given notification เป็น Unread  
When user เปิด notification item  
Then notification ต้องเป็น Read  
And unread count ต้องลดลง

## QA-NOTI-005: Deleted Destination

Given notification อ้างถึง deleted asset หรือ deleted user  
When user กด notification  
Then ระบบต้องแสดง unavailable/user not found state ตามประเภท

---

# 11. Portfolio

## QA-PORT-001: Portfolio Owner Only

Given user ไม่ใช่ Owner  
When user พยายามเปิด Portfolio ของคนอื่น  
Then ระบบต้อง deny หรือแสดง unavailable state

## QA-PORT-002: Portfolio Eligible Status

Given Owner มี Asset status `Sale`, `Show`, `Hide`, `Sold`, `Deleted`  
When Portfolio คำนวณ Total Asset Value  
Then ต้องรวมเฉพาะ `Sale`, `Show`, `Hide` ที่ไม่ deleted  
And ต้องไม่รวม `Sold` หรือ `Deleted`

## QA-PORT-003: Current Value Priority

Given Asset มีหลาย valuation source  
When Portfolio เลือก Current Value  
Then ต้องใช้ลำดับ Watch Price API Market Price -> Owner Estimated Value -> Purchase Price fallback -> No Valuation

## QA-PORT-004: Purchase Price Fallback Label

Given Asset ไม่มี Market Price และ Owner Estimate แต่มี Purchase Price  
When Portfolio แสดง Current Value  
Then ต้องใช้ Purchase Price fallback  
And แสดง label ว่าใช้ราคาซื้อเป็นค่าประมาณ

## QA-PORT-005: No Valuation

Given Asset ไม่มี Market Price, Owner Estimate หรือ Purchase Price  
When Portfolio แสดง Asset  
Then Current Value ต้องเป็น `—`  
And Asset ต้องไม่รวม Total Asset Value

## QA-PORT-006: Unrealized Gain

Given Asset มี Current Value จาก Market Price หรือ Owner Estimate และมี Purchase Price  
When Portfolio คำนวณ Gain/Loss  
Then Unrealized Gain/Loss = Current Value - Purchase Price  
And Unrealized Gain/Loss % = Unrealized Gain/Loss / Purchase Price * 100

## QA-PORT-007: Expected Profit

Given Asset มี Asking Price และ Purchase Price  
When Owner เปิด Portfolio/Owner Detail  
Then Expected Profit = Asking Price - Purchase Price  
And Expected Profit แสดงเฉพาะ Owner

## QA-PORT-008: Market Comparison No Market Price

Given Asset ไม่มี Watch Price API Market Price  
When Portfolio หรือ Asset Detail แสดง Market Comparison  
Then ต้องแสดง `ไม่มีราคาตลาด` / `No market price`  
And ต้องไม่แสดง Above/At/Below จาก fallback source

## QA-PORT-009: Realized Gain

Given Sold Asset มี Sale Price และ Purchase Price  
When Owner เปิด Sold History  
Then Realized Gain/Loss = Sale Price - Purchase Price  
And Sold Asset ไม่รวม Total Asset Value หรือ Total Unrealized Gain/Loss

## QA-PORT-010: YTD Performance

Given มี Portfolio Value Today และ Portfolio Value Start Of Year  
When ระบบคำนวณ YTD  
Then YTD = (Portfolio Value Today - Portfolio Value Start Of Year) / Portfolio Value Start Of Year * 100  
And ไม่รวม Realized Gain/Loss จาก Sold Asset ในสูตรหลัก

## QA-PORT-011: YTD Missing Snapshot

Given ไม่มี snapshot วันที่ 1 มกราคมแต่มี snapshot แรกของปี  
When ระบบแสดง YTD  
Then ต้องใช้ snapshot แรกของปี  
And แสดง label `YTD จากข้อมูลแรกของปี` / `YTD from first available data`

---

# 12. Settings

## QA-SETTING-001: Settings Member Only

Given user เป็น Guest  
When user เปิด account Settings  
Then ต้องแสดง Login Required หรือไม่ให้เข้า account Settings

## QA-SETTING-002: Settings Menu Baseline

Given Member เปิด Settings  
When menu แสดง  
Then ต้องมี Edit Profile, Username, Phone, Line, Email Display, Language, Theme Mode, Notification Settings, Change Password entry ตาม account type, Help, About, Privacy Policy, Terms of Service, Sign Out, Delete Account

## QA-SETTING-003: Notification Settings Baseline

Given Member เปิด Notification Settings  
When toggle list แสดง  
Then ต้องมีเฉพาะ Like, Comment, Follow, Offer, Watch Alert  
And ต้องไม่มี Chat/New Message, Market Update, Price/Valuation, Sale Success, Moderation หรือ Account Action

## QA-SETTING-004: Change Password Email Account

Given Member ใช้ Email / Password account  
When Member เปิด Settings  
Then ต้องเห็น Change Password entry  
And route ไป Authentication Change Password flow

## QA-SETTING-005: Change Password SSO Account

Given Member ใช้ SSO-only account  
When Member เปิด Settings  
Then Change Password ต้องไม่เป็น active action

## QA-SETTING-006: Delete Account Confirmation

Given Member กด Delete Account  
When flow เริ่ม  
Then ต้องแสดง warning/confirmation ก่อนดำเนินการ

---

# 13. Board

## QA-BOARD-001: Board Is Article Area

Given user เปิด Board  
When UI แสดง  
Then ต้องเป็น article/content area  
And ต้องไม่มี user create post/edit post/delete post flow ใน Front Office

## QA-BOARD-002: Guest Article Share

Given Guest เปิด Article Detail  
When Guest กด Share  
Then ระบบต้องเริ่ม public share behavior โดยไม่บังคับ Login

## QA-BOARD-003: Guest Article Like

Given Guest เปิด Article Detail  
When Guest กด Like  
Then ต้องแสดง Global Login Required Dialog

## QA-BOARD-004: Article Comment Not Baseline

Given user เปิด Article Detail  
When action list แสดง  
Then Article Comment ต้องไม่แสดงใน V1 baseline

---

# 14. Trust & Safety

## QA-TRUST-001: Report Does Not Hide Immediately

Given Member report Asset/User/Comment  
When report submit สำเร็จ  
Then content ต้องไม่หายทันทีเพราะต้องรอ Admin moderation

## QA-TRUST-002: Block Hides Public Content

Given Member A block Member B  
When Member A เปิด Feed/Search/Watch Alert Result/Public Profile ที่เกี่ยวข้อง  
Then content ของ Member B ต้องไม่แสดง

## QA-TRUST-003: Unblock Restores Normal Visibility

Given Member A unblock Member B  
When visibility ตาม status/permission ปกติอนุญาต  
Then content ต้องกลับมาแสดงตาม rule ปกติ

---

# 15. Integrations And Failure

## QA-INT-001: FCM Token Lifecycle

Given Member login  
When device token พร้อมใช้งาน  
Then ระบบต้อง register/update FCM token  
When Member logout  
Then token/session mapping ต้องถูก clear หรือ invalidate ตาม implementation

## QA-INT-002: Image Upload Failure

Given user upload image  
When CDN/storage upload fail  
Then UI ต้องแสดง failure state และ retry ได้

## QA-INT-003: Watch Price API Failure

Given Watch Price API unavailable  
When Portfolio หรือ Asset Detail ต้องใช้ market price  
Then ระบบต้อง fallback ตาม valuation priority  
And ห้าม crash หรือแสดงค่าผิดเป็น Market Price

## QA-INT-004: Payment Gateway Not V1

Given user อยู่ Offer/Asset flow  
When user ทำ purchase/offer  
Then ต้องไม่มี Payment Gateway หรือ payment UI ใน V1

---

# 16. Regression Sign-Off Matrix

QA sign-off ก่อนส่ง Dev complete ต้องครอบคลุม:

- [ ] Guest / Member / Owner / Other User
- [ ] Sale / Show / Hide / Sold / Deleted
- [ ] Like / Unlike / Favorites sync
- [ ] Comment single level
- [ ] Offer Pending / Accepted / Rejected / Cancelled
- [ ] Chat unread badge and block read-only
- [ ] Notification routing ทุก supported type
- [ ] Watch Alert Result List
- [ ] Portfolio valuation fallback and no market price
- [ ] Settings baseline and account-type behavior
- [ ] Board guest share and login-required article like
- [ ] Report and Block trust impact
- [ ] Integration failure: image, FCM, Watch Price API
