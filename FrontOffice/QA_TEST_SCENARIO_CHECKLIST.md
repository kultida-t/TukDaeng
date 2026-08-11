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
- [ ] มี Portfolio asset ที่ไม่มี Market Price แต่มี Purchase Price
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
When user Share public Asset deep link, Public Profile deep link หรือ Article deep link  
Then ระบบต้องเริ่ม share behavior ได้โดยไม่บังคับ Login

## QA-GLOBAL-003A: Share Channel Fallback

Given platform รองรับ system share sheet  
When user กด Share public Asset, Public Profile หรือ Article  
Then ระบบต้องเปิด system share sheet

Given platform ไม่รองรับ system share sheet  
When user กด Share public Asset, Public Profile หรือ Article  
Then ระบบต้อง fallback เป็น copy public deep link และแสดง copy success state

## QA-GLOBAL-003B: Shared Deep Link Validation

Given user เปิด public deep link  
When linked content เป็น Deleted, Hide, Sold หรือ user ไม่มี permission / ถูก block  
Then ระบบต้องไม่แสดง private content และต้องแสดง unavailable / permission state ตาม baseline
And primary CTA ต้องเป็น `Go back`
And ถ้ามี navigation history ต้องกลับไปหน้าก่อนหน้า
And ถ้าไม่มี navigation history ต้อง fallback ไป Feed

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
And ถ้ามี suspension end date ต้องแสดงวันสิ้นสุด
And user ต้องไม่เข้า main app หรือทำ authenticated action ได้

## QA-AUTH-007A: Active Session Revoked After Suspension

Given Member กำลังใช้งาน app อยู่
When BO เปลี่ยน account เป็น Suspended หรือ Banned
Then ระบบต้อง revoke/block session
And clear authenticated app state
And แสดง account status state พร้อมเหตุผลและช่องทาง Support

## QA-AUTH-007C: Temporary Suspension End Date

Given account ถูก Suspended แบบชั่วคราวและมี end date
When ถึง end date และ backend เปลี่ยนสถานะกลับเป็น Active
Then user ต้อง Sign In ใหม่ได้
And session เดิมต้องไม่กลับมาใช้งานเอง

## QA-AUTH-007B: Banned Account

Given account ถูก Banned
When user Sign In ด้วย Email, Apple หรือ Google
Then ระบบต้อง block login พร้อมเหตุผลและช่องทาง Support
And user ต้องไม่เข้า main app หรือทำ authenticated action ได้

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

## QA-FEED-006: Feed Slow Network

Given Feed API ยังไม่ตอบกลับเกิน 2 วินาที
When user เปิด Feed
Then ต้องแสดง skeleton/loading ต่อ
And ต้องแสดงข้อความ `กำลังโหลดข้อมูล อาจใช้เวลาสักครู่`
And ต้องไม่แสดงหน้าว่าง

## QA-FEED-007: Feed Offline Cache

Given user เคยโหลด Feed แล้ว  
When network offline  
Then Feed ต้องแสดง cached data ล่าสุดพร้อม offline indicator

## QA-FEED-008: Feed Offline No Cache

Given user ยังไม่เคยโหลด Feed สำเร็จ
When network offline
Then ต้องแสดง full-page offline state
And ต้องมีปุ่ม `ลองใหม่`
And ต้องไม่แสดง list ว่างเหมือน empty state ปกติ

## QA-FEED-009: Feed Refresh Failed With Existing Data

Given Feed มีข้อมูลแสดงอยู่แล้ว
When user refresh แล้ว API fail
Then ต้องคง Feed Card เดิมไว้
And ต้องแสดงข้อความ `อัปเดตฟีดไม่สำเร็จ กรุณาลองใหม่`
And EN copy ต้องเป็น `Unable to update feed. Please try again.`
And action ต้องเป็น `Retry`
And Retry ต้อง retry เฉพาะ refresh current Feed tab ไม่ใช่ load more

## QA-FEED-010: Feed Load More Failed

Given Feed มีข้อมูลแสดงอยู่แล้ว
When user scroll ถึงท้าย list และ load more fail
Then ต้องคงรายการเดิมไว้
And ต้องแสดง inline retry ท้าย list
And EN title ต้องเป็น `Unable to load more feed items`
And EN body ต้องเป็น `Check your connection and try again.`
And button ต้องเป็น `Try again`
And retry ต้องโหลด next page เท่านั้น ไม่ refresh หรือล้าง Feed ทั้งหน้า

## QA-FEED-011: Feed More Menu Actions

Given Member เห็น Feed Card ของ Asset คนอื่น  
When Member เปิดเมนูสามจุด  
Then ต้องเห็น Hide this asset, Report Asset และ Block User  
And ต้องไม่เห็น Comment หรือ Share direct action จาก Feed

## QA-FEED-011A: Owner Feed More Menu Actions

Given Owner เห็น Feed Card ของ Asset ตัวเอง status `Sale`
When Owner เปิดเมนูสามจุด
Then ต้องเห็น `Edit asset`, `Edit provenance`, `Mark as sold`, `Change status`, `Delete asset`
And ต้องไม่เห็น `Hide this asset`, `Report Asset` หรือ `Block User`

## QA-FEED-011B: Owner Feed Change Status Removes Card

Given Owner เห็น Feed Card ของ Asset ตัวเอง status `Sale`
When Owner เลือก `Change status` และเปลี่ยนเป็น `Show` หรือ `Hide` สำเร็จ
Then ระบบต้องแสดง `Asset status updated.`
And Feed Card ต้องหายจาก Feed ทันที
And ต้องไม่ใช้ `Mark as sold` flow

## QA-FEED-012: Feed Image Load Failed

Given Feed API โหลดข้อมูล Asset สำเร็จ
And image request ของ Feed Card fail
When user เห็น Feed
Then ต้องแสดง Feed Card เดิมพร้อม Brand, Model, Price, Owner Name, Posted Time, Like Count และ Comment Count
And พื้นที่รูปต้องแสดง placeholder พร้อมข้อความ `โหลดรูปไม่สำเร็จ`
And EN copy ต้องเป็น `Image failed to load`
And button ต้องเป็น `Retry image`
And ต้องมี retry เฉพาะรูป
And ต้องไม่ reload Feed ทั้งหน้า

## QA-FEED-012A: Feed Owner Fallback

Given Feed API โหลดข้อมูล Asset สำเร็จ
And owner/profile request fail
When user เห็น Feed Card
Then card ต้องยังแสดง asset data เดิม
And owner row ต้องแสดง default avatar และ `Unknown seller`
And ต้องไม่แสดงปุ่ม `Follow` ถ้า owner id หรือ follow state ไม่ชัด
And owner-dependent more menu ต้องซ่อน หรือแสดงเฉพาะ listing-level action ที่ยัง valid

Given owner/profile data โหลดสำเร็จ
And profile image request fail
When user เห็น Feed Card
Then ต้องแสดง default avatar หรือ initials
And ต้องยังแสดง seller display name จริง
And action ที่มี owner id และ permission ชัดเจนต้องยังใช้งานได้

## QA-FEED-013: Hide This Asset From Feed

Given Member เห็น Feed Card ของ Asset คนอื่น  
When Member เลือก Hide this asset  
Then Asset ต้องหายจาก Feed ของ Member คนนั้นทันที  
And ต้องแสดง undo ชั่วคราว  
And Asset ต้องไม่หายจาก Feed ของ user คนอื่น

## QA-FEED-014: Hide This Asset Persists After Reload

Given Member เลือก Hide this asset และไม่กด Undo  
When Member refresh หรือ reload Feed  
Then Asset เดิมต้องไม่กลับมาใน Feed ของ Member คนนั้น

## QA-FEED-015: Hide This Asset Undo

Given Member เลือก Hide this asset  
When Member กด Undo ใน snackbar  
Then Asset ต้องกลับมาใน Feed ตาม state ที่เหมาะสม

## QA-FEED-016: Report Asset From Feed

Given Member เห็น Feed Card ของ Asset คนอื่น  
When Member เลือก Report Asset จากเมนูสามจุดและ submit report  
Then report ต้องส่งเข้า Trust & Safety Report Asset flow  
And Asset ต้องไม่หายจาก public surfaces ทันที

## QA-FEED-017: Block User From Feed

Given Member เห็น Feed Card ของ Asset คนอื่น  
When Member เลือก Block User และ confirm  
Then Asset/content ของ user นั้นต้องหายจาก Feed ตาม block filtering rule

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

## QA-ASSET-001A: Minimum Photo Required

Given Owner สร้าง Asset status `Sale`, `Show` หรือ `Hide`
When Owner submit โดยไม่มีรูป
Then ระบบต้องแสดง validation error และไม่ save

## QA-ASSET-002: Sold Not Normal Edit Status

Given Owner เปิด Edit Asset  
When status selector แสดง  
Then ต้องมีเฉพาะ `Sale`, `Show`, `Hide`  
And `Sold` ต้องเข้าผ่าน Mark as Sold / Sale Record flow

## QA-ASSET-002A: Sale Required Fields

Given Owner เลือก Status = `Sale`
When Owner submit โดยขาด Brand, Model / Series, Condition หรือ Description
Then ระบบต้องแสดง validation error
And Price เป็น optional แต่ถ้ากรอกต้องมากกว่า 0
And ถ้าไม่กรอก Price buyer-facing surface ต้องแสดง `Price on request`

## QA-ASSET-002B: Show Required Fields

Given Owner เลือก Status = `Show`
When Owner submit โดยมี Photos, Brand และ Model / Series ครบ แต่ไม่กรอก Price
Then ระบบต้อง save ได้
And Asset ต้องไม่ขึ้น Feed, Search หรือ Watch Alert

## QA-ASSET-002C: Hide Required Fields

Given Owner เลือก Status = `Hide`
When Owner submit โดยมี Photos และ Brand ครบ แต่ไม่กรอก Model / Series, Condition หรือ Description
Then ระบบต้อง save ได้
And Asset ต้องเห็นเฉพาะ Owner
And form ต้องไม่ใช้ listing price สำหรับ `Hide`

## QA-ASSET-002G: Add Asset Requires Provenance Step

Given Owner กรอก Add Asset detail ครบตาม required fields
When Owner กด `Next`
Then ระบบต้องเปิด Provenance step ก่อน final Save / Upload
And ระบบต้องยังไม่สร้าง Asset จนกว่า Provenance step จะ Save สำเร็จ

## QA-ASSET-002H: Sale Provenance Type Options

Given Owner เลือก Status = `Sale`
When Owner เข้าหน้า Provenance step
Then ระบบต้องให้เลือก `Owner (Asset)` หรือ `Consignment`

## QA-ASSET-002I: Show Hide Owner Provenance Only

Given Owner เลือก Status = `Show` หรือ `Hide`
When Owner เข้าหน้า Provenance step
Then ระบบต้องแสดงเฉพาะ `Owner (Asset)` provenance form
And ต้องไม่แสดงตัวเลือกหรือ tab `Consignment`

## QA-ASSET-002J: Owner Provenance Purchase Price Required

Given Owner อยู่ใน `Owner (Asset)` provenance form
When Owner กด Save โดยไม่กรอก Purchase Price
Then ระบบต้องแสดง validation `กรุณากรอกราคาซื้อ`
And ต้องไม่ Save / Upload Asset

## QA-ASSET-002K: Consignment Required Fields

Given Owner เลือก Status = `Sale`
And Owner เลือก provenance type = `Consignment`
When Owner กด Save โดยไม่กรอก Full Name, Phone Number หรือ Asking Price
Then ระบบต้องแสดง validation ตาม field ที่ขาด
And ต้องไม่ Save / Upload Asset

## QA-ASSET-002L: Consignment Asking Price Sync

Given Owner กรอก Commerce / listing Asking Price ใน Asset detail step
When Owner เลือก provenance type = `Consignment`
Then Consignment Asking Price ต้อง prefill จาก listing Asking Price
When Owner แก้ Consignment Asking Price
Then listing Asking Price ต้อง sync เป็นค่าเดียวกัน

## QA-ASSET-002M: Optional Empty Fields Hidden After Save

Given Owner Save Asset สำเร็จโดยเว้น optional fields ว่าง
When Viewer เปิด Public Asset Detail
Then Viewer ต้องไม่เห็น label หรือ placeholder ของ optional/private fields ที่ไม่ได้กรอก
And ต้องไม่เห็น `N/A`, `-` หรือ `Not provided`

## QA-ASSET-002N: Owner Private Fields Visibility

Given Owner Save Asset พร้อม Provenance หรือ Consignment
When Viewer เปิด Public Asset Detail
Then Viewer ต้องไม่เห็น Purchase Price, Purchase Date, Purchase From, Proof of Payment, Consignment Owner Contact, Payout Method, Commission หรือ Minimum Acceptable Price
When Owner เปิด Owner Asset Detail
Then Owner ต้องเห็น private provenance section ตามข้อมูลที่บันทึกไว้

## QA-ASSET-002O: Uploading State After Save

Given Owner กรอก Add/Edit Asset ครบตาม required fields และมีรูปที่ต้อง upload
When Owner กด `Save`
Then ระบบต้องแสดง loading popup/overlay หรือ persistent toast ว่า `กำลังอัปโหลด...`
And ปุ่ม `Save` ต้อง disabled ระหว่าง upload/save
And ระบบต้องป้องกัน duplicate submit
And เมื่อ upload/save สำเร็จต้องไปยัง Asset Created หรือ Asset Updated flow

## QA-ASSET-002P: Uploading State Failure

Given Owner กรอก Add/Edit Asset ครบตาม required fields และมีรูปที่ต้อง upload
When Owner กด `Save` แล้ว upload/save ล้มเหลว
Then ระบบต้องแสดง error state
And ต้องมี action ให้ retry หรือกลับไปแก้ไขรูป/ข้อมูลได้

## QA-ASSET-002Q: Edit Asset Confirmation Copy

Given Owner แก้ไขข้อมูล Asset
When Owner กด `Save`
Then ระบบต้องแสดง confirmation title `Save changes?` / `บันทึกการแก้ไข?`
And body ต้องแจ้งว่าจะบันทึกข้อมูลที่แก้ไขและอัปเดตรายการตามสถานะปัจจุบัน
And ต้องไม่ใช้คำว่า `Save edit asset?`
And action ต้องเป็น `Cancel` และ `Save` / `บันทึก`
When Owner กด `Cancel`
Then popup ต้องปิดและข้อมูลที่แก้ไว้ใน form ต้องยังคงอยู่

## QA-ASSET-002R: Edit Purchase History Confirmation Copy

Given Owner แก้ไข Owner (Asset) purchase history
When Owner กด `Save`
Then ระบบต้องแสดง confirmation title `Save purchase history?` / `บันทึกประวัติการซื้อ?`
And body ต้องแจ้งว่าจะบันทึกการแก้ไขประวัติการซื้อของรายการนี้
And ต้องไม่ใช้ body ของ Edit Asset ที่อ้างถึง current status
And action ต้องเป็น `Cancel` และ `Save` / `ยกเลิก` และ `บันทึก`
When Owner กด `Cancel`
Then popup ต้องปิดและข้อมูลที่แก้ไว้ใน Provenance form ต้องยังคงอยู่

## QA-ASSET-002S: Edit Consignment Confirmation Copy

Given Owner แก้ไข Consignment details
When Owner กด `Save`
Then ระบบต้องแสดง confirmation title `Save consignment details?` / `บันทึกข้อมูลฝากขาย?`
And body ต้องแจ้งว่าจะบันทึกการแก้ไขข้อมูลฝากขายของรายการนี้
And ต้องไม่ใช้ body ของ Edit Asset ที่อ้างถึง current status
And action ต้องเป็น `Cancel` และ `Save` / `ยกเลิก` และ `บันทึก`

## QA-ASSET-002T: Add Asset Confirmation Copy

Given Owner กรอก Asset Detail และ Provenance ครบตาม required fields
When Owner กด final action เพื่อสร้าง Asset
Then ระบบต้องแสดง confirmation title `Add this asset?` / `เพิ่มรายการนี้?`
And body ต้องแจ้งว่าจะบันทึก asset ลง collection ตาม selected status
And action ต้องเป็น `Cancel` และ `Add asset` / `ยกเลิก` และ `เพิ่มรายการ`
When Owner กด `Add asset`
Then ปุ่มต้องเปลี่ยนเป็น `Adding...` และป้องกัน duplicate submit
And หาก save สำเร็จต้องแสดง `Asset added.` และไป Owner Asset Detail ของ asset ที่เพิ่งสร้าง

## QA-ASSET-002U: Add Asset Failure Keeps Form

Given Owner กด `Add asset` จาก Add Asset confirmation
When save/upload ล้มเหลว
Then ระบบต้องแสดง `Unable to add asset. Please try again.`
And ต้องคงข้อมูลทั้งหมดใน Asset Detail และ Provenance form
And ต้องไม่สร้าง asset ซ้ำ

## QA-ASSET-003: Mark As Sold

Given Owner mark Asset as Sold  
When Owner submit Sale Record  
Then ระบบต้องเก็บ Sale Date, Buyer, Contact, Sale Price, Payment Method, Attachment
And required fields ต้องมีเฉพาะ Sale Date, Sale Price, Payment Method
And Buyer Name, Buyer Phone, Buyer Contact, Attachment, Note ต้องเป็น optional

## QA-ASSET-003A: Sale Record Confirmation Copy

Given Owner กรอก Sale Record / Sale History ครบ
When Owner กด `Save`
Then ระบบต้องแสดง confirmation title `Save sale history?` / `บันทึกการขาย?`
And body ต้องแจ้งว่าจะบันทึกประวัติการขาย เปลี่ยนสถานะเป็น Sold และนำรายการออกจาก Feed, Search และ Watch Alert
And ต้องไม่ใช้คำว่า `Confirm sold out?`
And action ต้องเป็น `Cancel` และ `Save sale` / `บันทึกการขาย`

## QA-ASSET-003B: Sale Record Required Field Validation

Given Owner เปิด Add Sale History
When Owner ไม่กรอก Sale Price หรือกรอก `0`
Then ระบบต้องแสดง validation error และห้าม Save

Given Owner เปิด Add Sale History
When Owner ไม่เลือก Sale Date
Then ระบบต้องแสดง `Sale date is required` และห้าม Save

Given Owner เปิด Add Sale History
When Owner ไม่เลือก Payment Method
Then ระบบต้องแสดง `Payment method is required` และห้าม Save

## QA-ASSET-003C: Sale Record Optional Field Validation

Given Owner เปิด Add Sale History
When Owner ไม่กรอก Buyer Name, Buyer Phone, Buyer Contact, Attachment, Note
Then Owner ต้องยัง Save ได้ ถ้า Sale Date, Sale Price, Payment Method ถูกต้อง

Given Owner กรอก Buyer Phone
When Buyer Phone ไม่ตรงรูปแบบเบอร์ที่รองรับ
Then ระบบต้องแสดง validation error เฉพาะ Buyer Phone และห้าม Save จนกว่าจะแก้หรือเว้นว่าง

Given Owner กรอก Buyer Name, Buyer Contact หรือ Note
When field มีเฉพาะช่องว่าง, เกินความยาวที่กำหนด หรือมี HTML/script
Then ระบบต้อง trim/sanitize และแสดง validation error ถ้ายังไม่ถูกต้อง

## QA-ASSET-003D: Sale Record Date And Upload Validation

Given Owner เปิด Add Sale History
When Sale Date เป็นวันที่อนาคต
Then ระบบต้องแสดง `Sale date cannot be in the future` และห้าม Save

Given Asset มี Purchase Date
When Sale Date ก่อน Purchase Date
Then ระบบต้องแสดง `Sale date cannot be before purchase date` และห้าม Save

Given Owner อัปโหลด Equipment & Accessories หรือ Proof of Payment
When ไฟล์ไม่ใช่รูปภาพ `jpg/png/webp/heic`, ขนาดเกิน 10MB ต่อไฟล์, หรือเกิน 3 รูปต่อ section
Then ระบบต้องแสดง upload validation error และห้าม Save ไฟล์ที่ไม่ถูกต้อง

## QA-ASSET-004: Sold Locks Main Fields

Given Asset status เป็น `Sold`  
When Owner เปิด Edit main info  
Then main fields ต้องถูก lock

## QA-ASSET-005: Delete Asset Impact

Given Owner ลบ Asset  
When deletion สำเร็จ  
Then Asset ต้องหายจาก Feed/Search/Watch Alert/Public Profile  
And related Offer ต้องเป็น `Cancelled`  
And related Chat ต้องยังอยู่
And ต้องไม่มี Undo / restore action

## QA-ASSET-006: Status Switch Sale To Show

Given Owner มี Asset status `Sale`
When Owner เปลี่ยน status เป็น `Show` และ save สำเร็จ
Then Asset ต้องหายจาก Feed, Search และ Watch Alert
And Asset ต้องยังแสดงใน Public Profile
And ระบบต้องไม่ require Asking Price สำหรับ `Show`

## QA-ASSET-006E: Change Status Sheet Behavior

Given Owner เปิด Change Status จาก Owner Profile, Feed หรือ Asset Detail
When sheet เปิด
Then title ต้องเป็น `Change status`
And ต้องแสดงเฉพาะตัวเลือก `Sale`, `Show`, `Hide`
And ต้องไม่แสดง `Sold`
And สถานะปัจจุบันต้อง selected
And ถ้าเลือกสถานะเดิม ปุ่ม `Save` ต้อง disabled

## QA-ASSET-006F: Change Status Success Feedback

Given Owner เปลี่ยนสถานะ Asset ที่ยังไม่ใช่ Sold
When save สำเร็จ
Then ระบบต้องปิด sheet
And แสดง toast `Asset status updated.`
And update card/detail/feed ตาม visibility ของสถานะใหม่ทันที

## QA-ASSET-006G: Change Status Failure Feedback

Given Owner เปลี่ยนสถานะ Asset
When save ล้มเหลว
Then ระบบต้องแสดง `Unable to update asset status. Please try again.`
And ต้องคง selection ใน sheet
And ต้องไม่เปลี่ยนสถานะจริงของ Asset

## QA-ASSET-006H: Consignment Change Status Requires Owner Provenance

Given Asset เป็น `Consignment` และ status `Sale`
When Owner เปลี่ยน status เป็น `Show` หรือ `Hide`
Then ระบบต้องแสดง warning title `Change to owner asset?`
And body ต้องแจ้งว่า Consignment details ใช้ได้เฉพาะ assets listed for sale
When Owner กด `Continue`
Then ระบบต้องพาไป Provenance และบังคับใช้ `Owner (Asset)`
And ต้อง require `Purchase Price` ก่อนบันทึก status ใหม่

## QA-ASSET-006A: Consignment Sale Cannot Switch To Show Without Provenance Conversion

Given Owner มี Asset status `Sale`
And Asset provenance type เป็น `Consignment`
When Owner เปลี่ยน status เป็น `Show`
Then ระบบต้องบังคับเปลี่ยน provenance type เป็น `Owner (Asset)` หรือปิด consignment data ก่อนบันทึก
And ต้องไม่อนุญาตให้ Asset status `Show` เก็บ provenance type เป็น `Consignment`

## QA-ASSET-007: Status Switch Show To Sale

Given Owner มี Asset status `Show`
When Owner เปลี่ยน status เป็น `Sale`
Then ระบบต้อง require Condition และ Description ตาม Sale validation
And Asking Price ต้องเป็น optional แต่ถ้ากรอกต้องมากกว่า 0
And ถ้าไม่กรอก Asking Price buyer-facing surface ต้องแสดง `Price on request`
When save สำเร็จ
Then Asset ต้องแสดงใน Feed, Search และสามารถ match Watch Alert ได้

## QA-ASSET-008: Status Switch Sale To Hide

Given Owner มี Asset status `Sale`
When Owner เปลี่ยน status เป็น `Hide` และ save สำเร็จ
Then Asset ต้องหายจาก Feed, Search, Watch Alert และ Public Profile
And Asset ต้องเห็นเฉพาะ Owner
And ระบบต้องไม่ใช้ Asking Price เป็น public/listing field อีกต่อไป

## QA-ASSET-008A: Consignment Sale Cannot Switch To Hide Without Provenance Conversion

Given Owner มี Asset status `Sale`
And Asset provenance type เป็น `Consignment`
When Owner เปลี่ยน status เป็น `Hide`
Then ระบบต้องบังคับเปลี่ยน provenance type เป็น `Owner (Asset)` หรือปิด consignment data ก่อนบันทึก
And ต้องไม่อนุญาตให้ Asset status `Hide` เก็บ provenance type เป็น `Consignment`

## QA-ASSET-009: Status Switch Hide To Sale

Given Owner มี Asset status `Hide`
When Owner เปลี่ยน status เป็น `Sale`
Then ระบบต้อง require Model / Series, Condition และ Description ตาม Sale validation
And Asking Price ต้องเป็น optional แต่ถ้ากรอกต้องมากกว่า 0
And ถ้าไม่กรอก Asking Price buyer-facing surface ต้องแสดง `Price on request`
When save สำเร็จ
Then Asset ต้องกลับเข้า Feed, Search และ Watch Alert หากตรงเงื่อนไข visibility/filter

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

## QA-DETAIL-002A: Asset Detail Like Count Versus Like Action

Given user เปิด Asset Detail ของ Asset ที่ publish
When user กดหัวใจด้านบนของรูป/detail header
Then ระบบต้องทำ Like / Unlike action
When user กด heart icon หรือ like count ใต้ชื่อ Asset / Reference No.
Then ระบบต้องเปิด `Liked by` list
And ต้องไม่ toggle Like / Unlike จาก metadata row

## QA-DETAIL-002B: Asset Detail Comment Count Navigation

Given user เปิด Asset Detail
When user กด comment icon หรือ comment count ใต้ชื่อ Asset / Reference No.
Then ระบบต้อง scroll ไป Comments section
And หาก comment count = 0 สามารถแสดง icon อย่างเดียวโดยไม่แสดงตัวเลข 0 ได้

## QA-DETAIL-002C: Empty Comments Section

Given Asset ยังไม่มี comment
When user เปิด Asset Detail
Then Comments section ต้องแสดง `No comments yet.`
And ต้องแสดง `Be the first to comment.`
And ต้องแสดง input placeholder `Write a comment...`
And ต้องไม่แสดง `View all`

## QA-DETAIL-003: IG-Style One-Level Comment Replies

Given user เปิด Comments  
When comments แสดง  
Then ระบบต้องรองรับ reply ใต้ comment หลักได้ 1 ชั้นแบบ IG-style  
And ต้องไม่รองรับ reply ซ้อนต่อจาก reply หรือ thread หลายระดับ

## QA-DETAIL-004: Delete Comment Permission

Given Member A สร้าง comment  
When Member B พยายาม delete comment ของ Member A  
Then ระบบต้อง reject  
When Member A delete comment ตัวเอง  
Then ระบบต้องลบได้
And ต้องไม่มี Undo / restore action

## QA-DETAIL-004B: Delete Root Comment With Replies

Given Member มี root comment ที่มี replies ทั้งที่แสดงอยู่และ collapsed อยู่
When Member delete root comment ของตัวเองและ confirm
Then root comment ต้องหาย
And replies ใต้ root comment นั้นต้องหายทั้งหมด
And ต้องแสดง feedback `This comment was removed.`

## QA-DETAIL-004C: Delete Reply Only

Given Member มี reply ของตัวเองใต้ root comment
When Member delete reply และ confirm
Then reply นั้นต้องหาย
And root comment และ replies อื่นต้องยังอยู่

## QA-DETAIL-004A: Report Comment From Asset Detail

Given Member เห็น Comment ใน Asset Detail
When Member เลือก Report Comment และ submit reason
Then report ต้องส่งเข้า Trust & Safety Report Comment flow
And Comment ต้องไม่หายทันที
And success ต้องแสดง `Report submitted`
And success copy ต้องระบุว่า comment remains visible until moderation is complete

## QA-DETAIL-004D: Nested Comment Action Sheet

Given Member เปิด `View all comments` เป็น Comments bottom sheet
When Member กด `...` บน comment
Then comment action sheet ต้องเปิดเป็นชั้นบนสุด
And เมื่อปิด comment action sheet ต้องไม่ปิด Comments bottom sheet

## QA-DETAIL-005: Market Comparison

Given Asset มี Asking Price และ Watch Price API Market Price  
When Asset Detail แสดง price analytics  
Then ต้องแสดง Above Market / At Market / Below Market ตาม threshold  
And ต้องไม่ใช้ Purchase Price fallback

## QA-DETAIL-006: Expected Profit Owner Only

Given Asset มี Asking Price และ Purchase Price  
When Owner เปิด Detail  
Then Owner เห็น Expected Profit  
When Viewer เปิด Detail  
Then Viewer ต้องไม่เห็น Expected Profit หรือ Purchase Price

---

# 7A. Profile

## QA-PROFILE-001: Public Profile More Menu

Given Member เปิด Public Profile ของ user อื่น
When Member กด `...`
Then menu ต้องแสดง `Share profile`, `Report user`, `Block user`
And ต้องไม่แสดง owner-only หรือ asset-level actions

## QA-PROFILE-002: Owner Profile More Menu

Given Owner เปิด Owner Profile ของตัวเอง
When Owner กด `...`
Then menu ต้องแสดง `Share profile` และ `Settings`
And ต้องไม่แสดง `Report user` หรือ `Block user`
And label ต้องใช้ `Settings`

## QA-PROFILE-002A: Owner Profile Asset Card Quick Actions

Given Owner เปิด Owner Profile asset grid
When Asset card แสดง
Then แต่ละ asset card ต้องแสดงปุ่ม `...` บนรูปเฉพาะ Owner view
And Public / Visitor Profile ต้องไม่แสดงปุ่ม `...` บน asset card
When Owner tap ที่ card หรือรูป asset
Then ระบบต้องเปิด Asset Detail
When Owner tap ปุ่ม `...`
Then ระบบต้องเปิด quick action menu และต้องไม่เปิด Asset Detail

## QA-PROFILE-002B: Owner Profile Quick Actions By Status

Given Owner เปิด quick action menu ของ asset card
When Asset status เป็น `Sale`
Then menu ต้องแสดง `Edit asset`, `Edit provenance`, `Mark as sold`, `Change status`, `Delete asset`
When Asset status เป็น `Show` หรือ `Hide`
Then menu ต้องแสดง `Edit asset`, `Edit purchase history`, `Change status`, `Delete asset`
And ต้องไม่แสดง `Mark as sold`
When Asset status เป็น `Sold`
Then menu ต้องแสดงเฉพาะ `View sale history` และ `View provenance`
And ต้องไม่แสดง `Delete asset`, `Edit asset`, `Change status` หรือ `Mark as sold`

## QA-PROFILE-003: Share Profile Sheet

Given user กด `Share profile`
When share sheet เปิด
Then ต้องแสดง profile preview card
And ต้องมี `Copy Link` fallback
And เมื่อกด `Copy Link` ต้องแสดง feedback ว่า link ถูก copy แล้ว

## QA-PROFILE-003A: Guest Share Public Profile

Given user เป็น Guest และเปิด Public Profile
When user กด `Share profile`
Then ระบบต้องเปิด Profile Share Sheet โดยไม่บังคับ Login
And ต้องรองรับ system share หรือ `Copy Link` fallback
And shared profile link ต้องไม่เปิด private profile data, Portfolio, Hide asset หรือ Sold asset

## QA-PROFILE-004: Report User Success

Given Member report user จาก Public Profile
When report submit สำเร็จ
Then success ต้องแสดง `Report submitted`
And copy ต้องระบุว่า profile remains visible until moderation is complete
And profile ต้องไม่หายทันที

## QA-PROFILE-005: Block User Confirmation From Profile

Given Member เปิด Public Profile ของ user อื่น
When Member เลือก `Block user`
Then ต้องเห็น confirmation title `Block this user?`
And ต้องมี actions `Cancel` และ `Block`
When Member กด `Cancel` หรือ dismiss confirmation
Then user ต้องยังไม่ถูก block และ Public Profile ต้องยังแสดงตาม permission เดิม

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

## QA-CHAT-004A: Block User Confirmation From Chat

Given Member A เปิด Chat Room กับ Member B
When Member A เลือก Block User
Then ต้องเห็น confirmation title `Block this user?`
And ต้องมี actions `Cancel` และ `Block`
When Member A กด `Cancel` หรือ dismiss confirmation
Then chat ต้องไม่เปลี่ยนเป็น read-only และ block state ต้องไม่ถูก apply

## QA-CHAT-005: Delete Chat Hides Only For Actor

Given Member A และ Member B มี Chat Room เดียวกัน  
When Member A กด Delete Chat และ confirm  
Then Chat Room ต้องหายจาก Chat List ของ Member A  
And Chat Room ต้องยังอยู่ใน Chat List ของ Member B  
And message/archive และ offer/chat history ต้องไม่ถูกลบจาก server

## QA-CHAT-005A: Chat Room Overflow Menu

Given Member เปิด Chat Room
When Member กดปุ่ม `...`
Then menu ต้องเรียง `View profile`, `Mute notifications`, `Delete chat`, `Report user`, `Block user`
And ต้องไม่มี `Search in chat` ซ้ำเมื่อ header มี search icon แล้ว

## QA-CHAT-005B: Mute Chat Notifications

Given Member เปิด Chat Room overflow menu
When Member กด `Mute notifications`
Then setting ต้อง auto-save
And ต้องแสดง `Notifications muted`
When Member เปิด menu อีกครั้ง
Then label ต้องเปลี่ยนเป็น `Unmute notifications`
When Member กด `Unmute notifications`
Then ต้องแสดง `Notifications unmuted`

## QA-CHAT-005C: Delete Chat Confirmation Copy

Given Member เปิด Chat Room overflow menu
When Member กด `Delete chat`
Then confirmation title ต้องเป็น `Delete chat?`
And actions ต้องเป็น `Cancel` และ `Delete chat`
And copy ต้องแจ้งว่า chat จะถูกลบจาก inbox ฝั่งผู้กด แต่อีกฝ่ายอาจยังเห็น conversation และ records บางส่วนอาจถูก retain
When delete สำเร็จ
Then ต้องกลับ Chat List และแสดง `Chat deleted`
When API fail
Then ต้องแสดง `Unable to delete chat. Please try again.`

## QA-CHAT-006: Delete Chat Has No Restore UI

Given Member กด Delete Chat สำเร็จ  
When Member เปิด Chat surfaces ใน V1  
Then ต้องไม่มี Restore Chat UI

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
Then ต้องใช้ลำดับ Watch Price API Market Price -> Purchase Price fallback -> No Valuation

## QA-PORT-004: Purchase Price Fallback Label

Given Asset ไม่มี Market Price แต่มี Purchase Price
When Portfolio แสดง Current Value  
Then ต้องใช้ Purchase Price fallback  
And แสดง label ว่าใช้ราคาซื้อเป็นค่าประมาณ

## QA-PORT-005: No Valuation

Given Asset ไม่มี Market Price หรือ Purchase Price
When Portfolio แสดง Asset  
Then Current Value ต้องเป็น `—`  
And Asset ต้องไม่รวม Total Asset Value

## QA-PORT-006: Unrealized Gain

Given Asset มี Current Value จาก Market Price และมี Purchase Price
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
Then ต้องมี Account section พร้อม Edit profile, Change password และ About your account  
And ต้องมี Your app and media section พร้อม Language และ Theme mode  
And ต้องมี Notifications section พร้อม Notification settings  
And ต้องมี More info and support section พร้อม Help, Privacy Policy, Terms of Use และ About  
And ต้องมี Sign out เป็น bottom action  
And ต้องไม่มี Delete Account เป็น direct action บน Settings Home

## QA-SETTING-003: Notification Settings Baseline

Given Member เปิด Notification Settings  
When toggle list แสดง  
Then ต้องมีเฉพาะ Like, Comment, Follow, Offer, Watch Alert  
And ต้องไม่มี Chat/New Message, Market Update, Price/Valuation, Sale Success, Moderation หรือ Account Action
And default state ของ Member ใหม่ต้องเป็น ON ทุก type
And การเปิด/ปิด toggle ต้อง auto-save โดยไม่มี Save button

## QA-SETTING-003A: Help Screen Content

Given Member เปิด Settings
When Member กด Help
Then ต้องแสดง title `Help`
And ต้องแสดง heading `Contact support`
And ต้องแสดง `Available daily` และ `09:00 - 22:00 (GMT+7)`
And ต้องแสดง LINE `@mrfoxthailand`, Phone `(+66) 80-008-8088`, Email `service@mrfox.com`
And contact rows ต้องเปิด LINE, dialer หรือ mail composer ตาม type

## QA-SETTING-003B: About App Content

Given Member เปิด Settings
When Member กด About
Then ต้องแสดง title `About`
And ต้องแสดง `TUK DAENG`
And ต้องแสดง `The digital curator for watch collectors`
And ต้องแสดง `Version 0.0.1`
And ต้องแสดง `Mister Fox Co., Ltd.` และ `Est. 2026`
And ต้องมี Privacy Policy, Terms of Use และ Contact support
And ต้องไม่แสดง Delete Account, Change Password, Edit Profile, Date joined หรือ profile/contact fields

## QA-SETTING-004: Change Password Email Account

Given Member ใช้ Email / Password account  
When Member เปิด Settings  
Then ต้องเห็น Change Password entry  
And route ไป Authentication Change Password flow
And Change Password screen ต้องมี Current password, New password และ Confirm new password

## QA-SETTING-005: Change Password SSO Account

Given Member ใช้ SSO-only account  
When Member เปิด Settings  
Then Change Password ต้องไม่เป็น active action

## QA-SETTING-005A: Change Password Validation Errors

Given Member ใช้ Email / Password account และเปิด Change Password
When Member submit ด้วย current password ที่ไม่ถูกต้อง
Then ต้องแสดง field error `Current password is incorrect.`
When Member กรอก new password ซ้ำกับ current password
Then ต้องแสดง field error `New password must be different from current password.`
When Member กรอก confirm password ไม่ตรงกับ new password
Then ต้องแสดง field error `Passwords do not match.`

## QA-SETTING-005B: Change Password API Error

Given Member ใช้ Email / Password account และกรอก Change Password ถูกต้อง
When API เปลี่ยน password ล้มเหลวจาก network/server error
Then ต้องแสดง `Unable to change password. Please try again.`
And ต้องไม่ mark field ใด field หนึ่งเป็น error เฉพาะ

## QA-SETTING-005C: Change Password Success

Given Member ใช้ Email / Password account และกรอก Change Password ถูกต้อง
When API เปลี่ยน password สำเร็จ
Then ต้องแสดง `Password changed`
And user ต้องยังอยู่ signed in

## QA-SETTING-006: Delete Account Confirmation

Given Member เปิด About your account และกด Delete Account  
When flow เริ่ม  
Then ต้องแสดง warning/confirmation ก่อนดำเนินการ
And title ต้องเป็น `Delete account?`
And actions ต้องเป็น `Cancel` และ `Delete account`
And copy ต้องแจ้งว่าจะ deactivate account, remove public profile, ซ่อน listed assets จาก public surfaces, retain records บางส่วน, sign out ทันที และ complete หลัง 30-day grace period

## QA-SETTING-007: Delete Account Soft Delete And Session Revoke

Given Member confirm Delete Account สำเร็จ  
When ระบบดำเนินการลบบัญชี  
Then ระบบต้อง soft delete account  
And ต้อง revoke session และ sign out user
And ต้องแสดง success modal `Account deletion started`
When user กด `Back to sign in`
Then ต้องไปหน้า Sign In / pre-auth
And user ต้องกด back กลับเข้า About Account, Profile หรือ Settings ไม่ได้

## QA-SETTING-007A: Sign Out Confirmation

Given Member อยู่ใน Settings
When Member กด Sign out
Then ต้องแสดง confirmation title `Sign out?`
And body ต้องเป็น `You will need to sign in again to access your account.`
And actions ต้องเป็น `Cancel` และ `Sign out`
When Member confirm Sign out
Then ระบบต้อง clear session และไป Sign In / pre-auth
And user ต้องกด back กลับเข้า Settings ไม่ได้

## QA-SETTING-008: Deleted Account Grace Period Login

Given account อยู่ใน grace period 30 วันหลัง Delete Account  
When user พยายาม login  
Then ระบบต้องไม่ให้เข้าใช้งานบัญชีปกติ  
And ต้องแสดง account-deleted support state

## QA-SETTING-009: Delete Account Failure

Given Member confirm Delete Account
When API delete account ล้มเหลว
Then ระบบต้องไม่ revoke session
And ต้องไม่พาออกจาก account context
And ต้องแสดง error/retry state

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

## QA-BOARD-005: Report Board Content Boundary

Given user เปิด Article Detail  
When user กด Report article  
Then report ต้องส่งเข้า Trust & Safety moderation handoff  
And article ต้องไม่หายทันที  
And ระบบต้องไม่เปิด Article Comment หรือ article-specific moderation flow

## QA-BOARD-005A: Report Article Reason Sheet

Given Member เปิด Article Detail
When Member กด `Report article`
Then sheet ต้องแสดง title `Report article`
And prompt `Why are you reporting this article?`
And reasons ต้องมี `Spam or misleading`, `Harassment or hate`, `Scam or fraud`, `Illegal or restricted item`, `Inappropriate content`, `Other`
And optional field ต้องใช้ label `Additional details (optional)`
And `Submit report` ต้อง disabled จนกว่าเลือก reason

## QA-BOARD-005B: Report Article Submitted

Given Member เลือก report reason
When Member กด `Submit report` และ API สำเร็จ
Then ต้องแสดง `Report submitted`
And ต้องแสดง `Our team will review it. This article will remain visible until moderation is complete.`
And action ต้องเป็น `Done`
And article ต้องยัง visible
And success state ต้องไม่มี `Hide article` หรือ `Hide this asset from feed?`

## QA-BOARD-005C: Report Article Error States

Given Member report article เดิมซ้ำ
When ระบบตรวจพบ duplicate
Then ต้องแสดง `You already reported this article.`
Given API submit report fail
When Member submit report
Then ต้องแสดง `Unable to submit report. Please try again.`
Given Guest เปิด Article Detail
When Guest กด `Report article`
Then ต้องแสดง Global Login Required Dialog

---

# 14. Trust & Safety

## QA-TRUST-001: Report Does Not Hide Immediately

Given Member report Asset/User/Comment  
When report submit สำเร็จ  
Then content ต้องไม่หายทันทีเพราะต้องรอ Admin moderation

## QA-TRUST-001A: Report User Entry Points

Given Member เปิด Public Profile หรือ Chat Room ของ user อื่น
When Member เลือก Report User และ submit reason
Then report ต้องส่งเข้า Trust & Safety Report User flow
And profile/chat/content ต้องไม่หายทันทีเพราะ report เพียงอย่างเดียว

## QA-TRUST-001B: Block User Entry Points

Given Member เปิด Public Profile หรือ Chat Room ของ user อื่น
When Member เลือก Block User และ confirm
Then ระบบต้องใช้ Block User rule เดียวกัน
And content ของ user นั้นต้องถูก filter จาก Feed/Search/Watch Alert Result ตาม baseline

## QA-TRUST-001C: Block User Confirmation Copy

Given Member เลือก Block User จาก Profile, Asset Detail, Feed หรือ Chat
When confirmation แสดง
Then title ต้องเป็น `Block this user?`
And body ต้องอธิบายว่า asset/content ของ user นั้นจะถูก filter, chat history เดิมยังอ่านได้แบบ read-only, และไม่สามารถส่งข้อความหรือสร้าง offer ใหม่กับ user นั้นได้
And actions ต้องเป็น `Cancel` และ `Block`

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
- [ ] Comment IG-style one-level replies และไม่มี multi-level nested thread
- [ ] Offer Pending / Accepted / Rejected / Cancelled
- [ ] Chat unread badge and block read-only
- [ ] Notification routing ทุก supported type
- [ ] Watch Alert Result List
- [ ] Portfolio valuation fallback and no market price
- [ ] Settings baseline and account-type behavior
- [ ] Board guest share and login-required article like
- [ ] Report and Block trust impact
- [ ] Integration failure: image, FCM, Watch Price API
