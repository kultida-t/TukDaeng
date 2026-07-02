# TukDaeng Dev Implementation Checklist

Reference:

- [TukDaeng_Master_Product_Definition.md](TukDaeng_Master_Product_Definition.md)
- [README_MODULE_INDEX.md](README_MODULE_INDEX.md)
- [Figma_Gap_Checklist_Against_Master.md](Figma_Gap_Checklist_Against_Master.md)

Purpose:

เอกสารนี้ใช้เป็น implementation checklist สำหรับ Dev โดยแยกจาก Figma gap checklist รายการด้านล่างเน้นสิ่งที่ต้องทำในระบบจริง เช่น data model, API, permission, routing, state handling, integration และ logging

---

# 0. Global Implementation Rules

- [ ] ใช้ canonical asset status ชุดเดียว: `Sale`, `Show`, `Hide`, `Sold`
- [ ] บังคับ visibility matrix ตาม master ทุก query/list/detail
- [ ] Private data ต้องเห็นเฉพาะ Owner หรือ Admin ตาม permission
- [ ] Guest action ที่ต้อง Login ต้องเปิด Global Login Required Dialog
- [ ] Deleted Asset ต้องหายจาก public list และ detail แสดง unavailable state
- [ ] Blocked user/content ต้องถูก filter จาก Feed, Search, Watch Alert Result และ Profile entry ที่เกี่ยวข้อง
- [ ] Empty state ใช้ `ไม่พบข้อมูล` / `No data found`
- [ ] Error state ที่ recover ได้ต้องมี retry action
- [ ] Deep link ทุกประเภทต้อง validate auth, permission, asset status, deleted state และ block state ก่อน render

---

# 1. Authentication

- [ ] รองรับ Email / Password Sign Up
- [ ] บังคับ Terms of Use และ Privacy Policy ก่อนสมัครทุก auth method
- [ ] Email / Password ต้อง verify OTP
- [ ] OTP หมดอายุภายใน 30 นาที
- [ ] Password อย่างน้อย 8 ตัวอักษร และต้องมีตัวเลขหรือสัญลักษณ์
- [ ] 1 Email สมัครได้ 1 บัญชี
- [ ] SSO Email ไม่ต้อง OTP
- [ ] Apple Sign In รองรับตาม App Store requirement
- [ ] Google OAuth รองรับตาม integration baseline
- [ ] บัญชี SSO-only ห้าม Sign In ด้วย Email / Password
- [ ] บัญชี Email / Password ห้าม Sign In ด้วย SSO หากไม่ได้ linked ตาม policy
- [ ] Email หลัง verify แล้วแก้ไขไม่ได้
- [ ] Forgot / Reset Password รองรับ invalid/expired token
- [ ] Change Password รองรับเฉพาะ authenticated Email / Password account
- [ ] Change Password ต้องมี Current password, New password และ Confirm new password
- [ ] Change Password ต้อง validate current password, password policy, new password ต้องต่างจาก current password และ confirm ต้องตรงกับ new password
- [ ] Change Password field errors ต้องรองรับ `Current password is incorrect.`, `New password must be different from current password.`, `Passwords do not match.`
- [ ] Change Password API/network error ต้องแสดง `Unable to change password. Please try again.` โดยไม่ผูก error กับ field เฉพาะ
- [ ] Change Password success ต้องแสดง `Password changed` และไม่จำเป็นต้อง sign out
- [ ] Suspended Account ต้อง block login พร้อม reason/support path
- [ ] Sign Out ต้อง clear local session/token

---

# 2. Feed

- [ ] Feed `All` แสดงเฉพาะ Asset status `Sale` ที่ user มีสิทธิ์เห็น
- [ ] Feed `Following` แสดงเฉพาะ `Sale` ของ user ที่ follow และไม่ถูก block
- [ ] Feed `Favorites` แสดงเฉพาะ `Sale` ที่ user กด Like/Favorite
- [ ] Feed ไม่แสดง `Show`, `Hide`, `Sold`, `Deleted`
- [ ] Feed Card ไม่แสดง Location ใน V1
- [ ] Feed Card แสดง required fields: image, brand, model, price, posted time, owner, like count, comment count
- [ ] Feed more menu สำหรับ Asset ของผู้อื่นรองรับ Hide this asset, Report Asset, Block User
- [ ] Hide this asset เป็น user-level preference และไม่ใช่ asset status `Hide`
- [ ] Hide this asset ซ่อน Asset เฉพาะ Feed ของผู้กดและไม่กระทบ Owner/ผู้ใช้อื่น/Public Profile/Offer/Chat
- [ ] Hide this asset มี undo ชั่วคราว และถ้าไม่ undo ต้องไม่กลับมาใน Feed หลัง refresh/reload
- [ ] Report Asset จาก Feed เปิด Trust & Safety Report Asset flow และไม่ทำให้ Asset หายทันที
- [ ] Block User จาก Feed ต้องมี confirmation และใช้ block filtering rule หลัง block สำเร็จ
- [ ] Like ต้อง sync Favorites ทันที
- [ ] Unlike ต้อง remove Favorites ทันที
- [ ] Comment และ Share จาก Feed ต้อง route ไป Asset Detail
- [ ] รองรับ Pull to Refresh
- [ ] รองรับ Infinite Scroll
- [ ] End of list แสดง `คุณดูรายการทั้งหมดแล้ว`
- [ ] Error state มี retry
- [ ] Offline state แสดง cached data ล่าสุดเมื่อมี

---

# 3. Search & Filter

- [ ] Search result แสดงเฉพาะ Asset status `Sale`
- [ ] Search ไม่แสดง `Show`, `Hide`, `Sold`, `Deleted`
- [ ] Keyword search รองรับ brand/model/reference/description ตาม baseline
- [ ] Autocomplete ทำงานจาก supported searchable fields
- [ ] Filter รองรับ Brand, Model, Price Range, Year, Condition, Movement, Dial Color, Strap/Bracelet Type
- [ ] Brand -> Model เป็น dependent filter
- [ ] Sort รองรับ Relevance, Price Low to High, Price High to Low, Newest, Popularity
- [ ] Result Count แสดงจำนวนผลลัพธ์หลัง filter
- [ ] Clear Filters reset criteria ทั้งหมด
- [ ] No result ใช้ empty state กลาง
- [ ] Create Watch Alert จาก Search Filter ได้
- [ ] Watch Alert save ได้แม้ไม่มี required field
- [ ] หากไม่กรอกชื่อ Watch Alert ระบบสร้างชื่อจาก criteria

---

# 4. Asset Management

- [ ] Add Asset รองรับ Gallery สูงสุด 10 รูป
- [ ] Add/Edit ต้อง require อย่างน้อย 1 รูปสำหรับ `Sale`, `Show`, `Hide`
- [ ] Status `Sale` ต้อง require Photos, Brand, Model / Series, Condition, Price, Description
- [ ] Status `Show` ต้อง require Photos, Brand, Model / Series และไม่บังคับ Price
- [ ] Status `Hide` ต้อง require Photos, Brand เท่านั้น โดย Model / Series, Condition, Description เป็น optional และไม่ใช้ listing price
- [ ] Optional private valuation ต้องใช้ label `Owner Estimated Value (Private)` และห้ามแสดงใน public/viewer surfaces
- [ ] หลังกรอก Add/Edit Asset ครบและกด Save ต้องแสดง uploading/saving state พร้อมข้อความ `กำลังอัปโหลด...` เมื่อมีไฟล์ upload
- [ ] ระหว่าง uploading/saving ต้อง disable ปุ่ม Save และป้องกัน duplicate submit
- [ ] Add/Edit ใช้ status model เดียว: `Sale`, `Show`, `Hide`
- [ ] `Sold` ต้องเข้าผ่าน Mark as Sold / Sale Record flow เท่านั้น
- [ ] Sold Asset lock main editable fields
- [ ] Sale Record เก็บ Sale Date, Buyer, Contact, Sale Price, Payment Method, Attachment
- [ ] Delete Asset ต้องมี confirmation ที่ระบุ `This action cannot be undone.`
- [ ] Delete Asset สำเร็จแล้วต้องไม่มี Undo / restore UI ใน V1
- [ ] Asset Deleted ต้องหายจาก Feed, Search, Watch Alert, Public Profile
- [ ] Asset Deleted ทำให้ Offer ที่เกี่ยวข้องเป็น `Cancelled`
- [ ] Chat ที่เกี่ยวข้องกับ Deleted Asset ยังอยู่
- [ ] Provenance, Purchase Price, Purchase Date, Purchase From, Proof of Payment เป็น private
- [ ] Consignment Owner Contact และ Consignment Terms เป็น private
- [ ] Status transition ต้อง trigger reindex/filter impact ต่อ Feed/Search/Watch Alert/Profile
- [ ] Location ไม่เป็น required/display field หลักใน V1

---

# 5. Asset Detail

- [ ] Viewer เปิดได้เฉพาะ Asset status `Sale` และ `Show`
- [ ] Owner เปิด Asset ตัวเองได้ทุก status: `Sale`, `Show`, `Hide`, `Sold`
- [ ] Hide/Sold ของ user อื่นต้อง unavailable/permission denied
- [ ] Deleted Asset Detail แสดง `รายการนี้ไม่พร้อมใช้งานแล้ว`
- [ ] Gallery รองรับ swipe และ full screen viewer
- [ ] Detail รองรับรูปสูงสุด 10 รูป
- [ ] Comment รองรับ IG-style one-level replies ใต้ comment หลักเท่านั้น
- [ ] Comment ต้องไม่รองรับ multi-level nested thread หรือ reply ซ้อนเกิน 1 ชั้น
- [ ] ไม่มี Edit Comment ใน V1
- [ ] Comment action menu ใช้ `...` แนวนอน
- [ ] Own comment action แสดง `Delete comment` พร้อม confirmation และไม่มี Undo
- [ ] Delete root comment ต้องลบ replies ใต้ root comment ทั้งที่แสดงและ collapsed
- [ ] Other user's comment action แสดง `Report comment`
- [ ] Report Comment success ต้องไม่ซ่อน comment ทันที
- [ ] Comments sheet เปิด comment action sheet ซ้อนแล้วปิด action sheet ต้องไม่ปิด Comments sheet
- [ ] Show Asset เปิด Public Detail ได้แต่ไม่ขึ้น Feed/Search/Watch Alert
- [ ] Show Asset สามารถ Make Offer / Contact Seller / Chat จาก Detail ได้
- [ ] Market Comparison ใช้ Asking Price เทียบ Watch Price API Market Price เท่านั้น
- [ ] Market Comparison ไม่ใช้ Owner Estimate หรือ Purchase Price fallback
- [ ] Expected Profit แสดงเฉพาะ Owner view
- [ ] Expected Profit ห้ามแสดงให้ Viewer/Public mode
- [ ] Purchase data, Sold History, Portfolio Value Detail เป็น Owner-only

---

# 6. Profile

- [ ] Owner Profile แสดง Asset ของตัวเองทุก status: `Sale`, `Show`, `Hide`, `Sold`
- [ ] Public Profile แสดงเฉพาะ `Sale` และ `Show`
- [ ] Public Profile ห้ามแสดง `Hide`, `Sold`, purchase data, provenance, consignment, sold history, portfolio value detail
- [ ] Public Profile ต้องมี Report User และ Block User entry สำหรับ profile ของ user อื่น
- [ ] Public Profile more menu ต้องมี `Share profile`, `Report user`, `Block user`
- [ ] Owner Profile more menu ต้องมี `Share profile`, `Settings` และใช้ label `Settings`
- [ ] Profile Share Sheet ต้องมี preview และ `Copy Link` fallback
- [ ] Guest ต้อง Share Public Profile ได้โดยไม่ต้อง Login และ share link ต้อง validate blocked/unavailable profile เมื่อเปิด
- [ ] Report User success ต้องไม่ซ่อน profile ทันที
- [ ] Block User จาก Public Profile ต้องเปิด confirmation `Block this user?` และ cancel/dismiss ต้องไม่ apply block
- [ ] Owner Profile tabs รองรับ `All`, `Sale`, `Show`, `Hide`, `Sold`
- [ ] Public Profile tabs รองรับเฉพาะ public status
- [ ] Total Asset Value เป็น entry point เข้า Portfolio เฉพาะ Owner
- [ ] Follow/Unfollow ทำงานเฉพาะ Member
- [ ] Guest Follow ต้องเปิด Login Required Dialog
- [ ] Owner ไม่เห็น Follow ตัวเอง
- [ ] Blocked profile/content ต้อง unavailable ตาม Trust & Safety rule

---

# 7. Chat

- [ ] Chat list แสดงห้องสนทนาของ user เท่านั้น
- [ ] Chat Room รองรับ Text, Image, File, Asset Card, Offer Card
- [ ] Same Asset ระหว่าง buyer/seller ควรใช้ room เดิมตาม rule
- [ ] New Message แสดง unread/badge ใน Chat menu เท่านั้น
- [ ] New Message ไม่เข้า Notification Center
- [ ] Asset Deleted แล้ว Chat ยังอยู่
- [ ] Deleted Asset reference ใน Chat แสดง unavailable state
- [ ] Asset Sold แล้ว Chat ยังใช้งานได้
- [ ] Block User จาก Chat ได้
- [ ] Report User จาก Chat ได้
- [ ] Chat Room overflow menu ต้องเรียง `View profile`, `Mute notifications`/`Unmute notifications`, `Delete chat`, `Report user`, `Block user`
- [ ] Header search icon เป็น search entry แล้ว ไม่ต้องซ้ำ `Search in chat` ใน overflow menu
- [ ] Mute notifications ต้อง auto-save และแสดง `Notifications muted`; unmute แสดง `Notifications unmuted`
- [ ] Block User จาก Chat ต้องเปิด confirmation `Block this user?` และ cancel/dismiss ต้องไม่ apply block
- [ ] หลัง block แล้ว chat history เดิมอ่านได้แบบ read-only
- [ ] หลัง block แล้วส่งข้อความใหม่ไม่ได้
- [ ] หลัง block แล้วสร้าง Chat/Offer ใหม่ระหว่างคู่ที่ block กันไม่ได้
- [ ] Delete Chat รองรับ confirmation ตาม baseline
- [ ] Delete Chat confirmation ใช้ title `Delete chat?`, body ว่า chat ถูกลบจาก inbox ฝั่งเราและอีกฝ่ายยังอาจเห็น conversation, actions `Cancel` / `Delete chat`
- [ ] Delete Chat ซ่อนห้องจาก Chat List เฉพาะฝั่งผู้กด
- [ ] Delete Chat ไม่ลบ message/archive ฝั่ง server และไม่กระทบคู่สนทนา
- [ ] Delete Chat ไม่ลบหลักฐาน offer/chat history และไม่มี restore UI ใน V1
- [ ] Delete Chat success แสดง `Chat deleted`; API fail แสดง `Unable to delete chat. Please try again.`

---

# 8. Offer

- [ ] Make Offer ทำจาก Asset Detail เท่านั้น
- [ ] Offer รองรับ Asset status `Sale` และ `Show`
- [ ] Show สร้าง Offer ได้จาก Asset Detail / Public Profile detail entry เท่านั้น
- [ ] Hide, Sold, Deleted สร้าง Offer ใหม่ไม่ได้
- [ ] Guest กด Offer ต้องเปิด Login Required Dialog
- [ ] Offer Price ต้อง validate มากกว่า 0
- [ ] Offer ส่งสำเร็จแล้ว status = `Pending`
- [ ] Offer Sent Successfully แล้วเปิด Chat Room
- [ ] Offer Card ต้องแสดงใน Chat Room
- [ ] Seller Accept แล้ว status = `Accepted`
- [ ] Offer Accepted notification ไป Chat Room
- [ ] Seller Reject แล้ว status = `Rejected`
- [ ] Offer Rejected notification ไป Asset Detail
- [ ] Asset Deleted ทำให้ Offer เป็น `Cancelled`
- [ ] Offer Cancelled notification ไป Chat Room + Focus Offer Card
- [ ] Asset Sold ต้อง Auto Reject pending offers อื่น
- [ ] ไม่มี Counter Offer ใน V1
- [ ] ไม่มี Withdraw Offer ใน V1
- [ ] ไม่มี Payment Gateway ใน V1

---

# 9. Notification

- [ ] Notification Center รองรับเฉพาะ Like, Comment, Follow, Offer, Watch Alert
- [ ] Chat/New Message ไม่เข้า Notification Center
- [ ] Moderation, Account Action, Market Update, Price/Valuation, Sale Success ไม่เข้า FO V1 Notification Center
- [ ] Notification list แสดงเฉพาะของ current user
- [ ] Guest เข้า Notification Center ต้อง Login Required Dialog
- [ ] Read/Unread state ต้องทำงาน
- [ ] Badge count นับเฉพาะ unread notification type ที่อยู่ใน baseline
- [ ] Like notification ไป Asset Detail
- [ ] Comment notification ไป Asset Detail + Focus Comment
- [ ] Follow notification ไป Public Profile
- [ ] Watch Alert notification ไป Watch Alert Result List
- [ ] Watch Alert notification ห้ามเปิด Asset Detail โดยตรง
- [ ] New Offer notification ไป Chat Room + Focus Offer Card
- [ ] Offer Accepted notification ไป Chat Room
- [ ] Offer Rejected notification ไป Asset Detail
- [ ] Offer Cancelled notification ไป Chat Room + Focus Offer Card
- [ ] Destination ต้อง handle Deleted Asset, Deleted User, Permission Denied, Block state

---

# 10. Watch Alert

- [ ] Watch Alert match เฉพาะ Asset status `Sale`
- [ ] Watch Alert ไม่ match `Show`, `Hide`, `Sold`, `Deleted`
- [ ] Create Watch Alert จาก Search/Filter criteria ได้
- [ ] ไม่มี required field สำหรับ Watch Alert criteria
- [ ] หากไม่ตั้งชื่อ ระบบสร้างชื่อจาก filter criteria
- [ ] รองรับ Watch Alert list
- [ ] รองรับ toggle notification ต่อ alert
- [ ] รองรับ rename alert
- [ ] รองรับ delete alert พร้อม confirmation
- [ ] Watch Alert Result List แสดงรายการ match
- [ ] Notification เปิด Watch Alert Result List
- [ ] Blocked user/asset ต้องถูก filter ออกจาก Watch Alert Result

---

# 11. Social

- [ ] Like Asset ได้จาก Asset Detail/Feed ตาม route ที่อนุญาต
- [ ] Like ต้องเพิ่ม Favorites
- [ ] Unlike ต้องลบ Favorites
- [ ] Like Count update ทันที
- [ ] Comment ทำใน Asset Detail เท่านั้น
- [ ] Comment รองรับ IG-style one-level replies ใต้ comment หลักเท่านั้น
- [ ] Comment ต้องไม่รองรับ multi-level nested thread หรือ reply ซ้อนเกิน 1 ชั้น
- [ ] Delete Comment รองรับเฉพาะเจ้าของ comment ตาม permission
- [ ] Report Comment ได้จาก Comment action ใน Asset Detail และต้องไม่ทำให้ comment หายทันที
- [ ] ไม่มี Edit Comment ใน V1
- [ ] Follow/Unfollow user ได้
- [ ] Following Feed ใช้ follow relation ที่ไม่ถูก block
- [ ] Share Asset ต้องทำผ่าน Asset Detail
- [ ] Share public deep link ได้โดยไม่ต้อง Login ตาม public share rule
- [ ] Share ใช้ system share sheet เมื่อ platform รองรับ
- [ ] Share fallback เป็น copy public deep link
- [ ] Share ไม่สร้าง Notification Center item
- [ ] Public deep link ต้อง validate status, permission, deleted state และ block state เมื่อเปิด

---

# 12. Board

- [ ] Board เป็น Article Area ไม่ใช่ forum/user-generated post board
- [ ] Article สร้าง/แก้/ลบโดย Admin ผ่าน Back Office เท่านั้น
- [ ] Front Office user สร้าง/แก้/ลบบทความไม่ได้
- [ ] รองรับ Feature Article, Trending Now, Journal Board, Watch Brands, Watch 101, Watch Apparel, Watch Events
- [ ] รองรับ Article List และ Article Detail
- [ ] รองรับ Search Article
- [ ] รองรับ Category Filter
- [ ] รองรับ Infinite Scroll
- [ ] Article Like ต้อง Login
- [ ] Guest Article Like ต้องเปิด Login Required Dialog
- [ ] Article Share เป็น public share action และ Guest ใช้ได้
- [ ] Article Share ไม่สร้าง notification
- [ ] Article Comment ไม่อยู่ใน V1 baseline
- [ ] Article Detail overflow menu มี `Report article`
- [ ] Report article ใช้ Trust & Safety report type `Board Content` และ target type `Article`
- [ ] Report article reason sheet มี reasons ตาม Settings/Board spec และ `Additional details (optional)`
- [ ] `Submit report` disabled จนกว่าเลือก reason
- [ ] Report article success แสดง `Report submitted` และ `Our team will review it. This article will remain visible until moderation is complete.`
- [ ] Report article ต้องไม่แสดง `Hide article` หรือ `Hide this asset from feed?`
- [ ] Report article duplicate แสดง `You already reported this article.`
- [ ] Report article API fail แสดง `Unable to submit report. Please try again.`
- [ ] Article not found/deleted แสดง unavailable state

---

# 13. Settings

- [ ] Settings เข้าได้เฉพาะ Member
- [ ] Settings Home ต้องเรียง section: Account, Your app and media, Notifications, More info and support, bottom Sign out
- [ ] Account section ต้องมี Edit profile, Change password, About your account
- [ ] Username, Phone, Line แก้ได้ตาม profile validation
- [ ] Email Display เป็น read-only หลัง verify
- [ ] Language รองรับ English / Thai
- [ ] Theme Mode รองรับ Dark Mode / Light Mode
- [ ] Notification Settings รองรับเฉพาะ Like, Comment, Follow, Offer, Watch Alert
- [ ] Notification Settings ไม่รวม Chat/New Message
- [ ] Notification Settings default ON และ auto-save toggle โดยไม่มี Save button
- [ ] Change Password เป็น Auth-linked entry
- [ ] Change Password แสดงเฉพาะ Email / Password account
- [ ] SSO-only account ไม่เห็น active Change Password action
- [ ] Help แสดง Contact support, Available daily, 09:00 - 22:00 (GMT+7), LINE `@mrfoxthailand`, Phone `(+66) 80-008-8088`, Email `service@mrfox.com`
- [ ] Help contact rows เปิด LINE, dialer และ mail composer ตาม type
- [ ] About app แสดง `TUK DAENG`, tagline, `Version 0.0.1`, `Mister Fox Co., Ltd.`, `Est. 2026`, Privacy Policy, Terms of Use และ Contact support
- [ ] About app ต้องไม่แสดงข้อมูลบัญชี, Date joined, Change Password หรือ Delete Account
- [ ] Privacy Policy และ Terms of Use เข้าถึงได้
- [ ] Sign Out ต้องมี confirmation copy `Sign out?`, `You will need to sign in again to access your account.`, actions `Cancel` / `Sign out`
- [ ] Sign Out สำเร็จต้อง clear session, ไป Sign In / pre-auth และกด back กลับ Settings ไม่ได้
- [ ] Delete Account อยู่ใน V1 baseline ภายใน About your account ไม่ใช่ Settings Home direct action
- [ ] About your account ต้องแสดง Date joined และปุ่ม Delete account
- [ ] Delete Account ต้องมี warning/confirmation
- [ ] Delete Account ต้อง soft delete account หลัง confirm
- [ ] Delete Account ต้อง revoke session และ sign out user
- [ ] Delete Account success ต้องแสดง `Account deletion started` modal พร้อมปุ่ม `Back to sign in`
- [ ] `Back to sign in` ต้องพาไปหน้า Sign In / pre-auth และกด back กลับเข้า account/profile/settings ไม่ได้
- [ ] Delete Account API fail ต้องไม่ revoke session และต้องแสดง error/retry state
- [ ] Delete Account ใช้ grace period 30 วันก่อน hard delete/anonymization ตาม policy
- [ ] Deleted account ระหว่าง grace period ต้อง login ไม่ได้หรือเห็น account-deleted support state

---

# 14. Portfolio

- [ ] Portfolio เป็น Owner-only
- [ ] Public Profile ห้ามแสดง Portfolio Value Detail
- [ ] Total Asset Value เป็น entry point จาก Owner Profile
- [ ] Portfolio คำนวณจาก `Sale`, `Show`, `Hide`
- [ ] Portfolio ไม่รวม `Sold`
- [ ] Portfolio ไม่รวม Deleted Asset
- [ ] Current Value priority: Watch Price API Market Price -> Owner Estimated Value -> Purchase Price fallback -> No Valuation
- [ ] Purchase Price fallback ต้องแสดง label ว่าใช้ราคาซื้อเป็นค่าประมาณ
- [ ] No Valuation แสดง `—` และไม่รวม Total Asset Value
- [ ] Total Asset Value = SUM(Current Value ของ Eligible Asset ที่มี Current Value)
- [ ] Unrealized Gain/Loss = Current Value - Purchase Price
- [ ] Unrealized Gain/Loss % = Unrealized Gain/Loss / Purchase Price * 100
- [ ] Gain/Loss ไม่คำนวณเมื่อใช้ Purchase Price fallback
- [ ] Expected Profit = Asking Price - Purchase Price
- [ ] Expected Profit แสดงเฉพาะ Owner view
- [ ] Market Comparison ใช้ Asking Price เทียบ Watch Price API Market Price
- [ ] Above/At/Below ใช้ threshold ตาม Portfolio PRD
- [ ] Realized Gain/Loss = Sale Price - Purchase Price สำหรับ Sold Asset
- [ ] Realized Gain/Loss แสดงใน Sold History
- [ ] Holding Period ใช้ Today - Purchase Date หรือ Sale Date - Purchase Date
- [ ] Top Brand Holdings = Top 3 brand ของ Eligible Asset
- [ ] YTD Performance ใช้วิธี A ตาม Portfolio PRD
- [ ] YTD ไม่รวม Realized Gain/Loss ในสูตรหลัก
- [ ] Snapshot missing ต้อง fallback/label ตาม Portfolio PRD

---

# 15. Trust & Safety

- [ ] Report Asset ได้จาก Asset Detail
- [ ] Report User ได้จาก Profile/Chat ตาม entry point
- [ ] Report Comment ได้ตาม Social rule ถ้ามี entry
- [ ] Report ไม่ทำให้ content หายทันที
- [ ] Content หายเมื่อ Admin moderation action
- [ ] Block User ได้จาก Profile/Asset Detail/Chat ตาม module
- [ ] Block User ทุก entry point ต้องใช้ confirmation กลางจาก Trust & Safety ก่อน apply block
- [ ] Block ต้องซ่อน asset/content จาก Feed, Search, Watch Alert Result
- [ ] Block ต้องหยุด Following Feed relation ระหว่างคู่ที่ block กัน
- [ ] Block ต้องทำให้ Chat read-only
- [ ] Block ต้องกัน new message/new chat/new offer ระหว่างคู่ที่ block กัน
- [ ] Unblock behavior ต้อง restore visibility ตาม normal permission
- [ ] Suspended account ต้อง login ไม่ได้
- [ ] Admin moderation handoff ต้องมี reference/report id

---

# 16. Integrations

- [ ] Apple Sign In integration พร้อม callback/error handling
- [ ] Google OAuth integration พร้อม callback/error handling
- [ ] Firebase Cloud Messaging สำหรับ Push Notifications
- [ ] FCM token register/update/delete ตาม session/device lifecycle
- [ ] Image Storage/CDN สำหรับ asset images, profile images, attachments
- [ ] Image upload ต้องรองรับ loading/failure/retry
- [ ] CDN image display ต้องมี placeholder/error state
- [ ] Watch Price API เป็น source แรกของ Portfolio Current Value
- [ ] Watch Price API failure ต้อง fallback ตาม Portfolio rule
- [ ] Payment Gateway ไม่อยู่ใน V1
- [ ] External integration timeout/error ต้องไม่ทำให้ app crash

---

# 17. Non-Functional Requirements

- [ ] Feed initial load target ต้องเป็นไปตาม NFR baseline
- [ ] Search/filter response target ต้องเป็นไปตาม NFR baseline
- [ ] Image loading ต้องใช้ CDN/cache strategy
- [ ] Offline/cached state อย่างน้อยต้องรองรับ Feed
- [ ] Sensitive data ต้องไม่ log เป็น plain text
- [ ] Private data ต้องถูก enforce ทั้ง frontend และ backend/API
- [ ] API ต้อง validate permission server-side
- [ ] Localization รองรับ Thai/English ตาม supported copy
- [ ] Accessibility: touch target, contrast, text scaling ตาม NFR
- [ ] Error handling ต้องมี user-safe message
- [ ] Analytics events ต้องไม่เก็บ private/sensitive data เกินจำเป็น

---

# 18. Admin / Back Office Boundary

- [ ] Front Office mobile ไม่มี Admin UI
- [ ] Admin ใช้งานผ่าน Web Back Office เท่านั้น
- [ ] Front Office ต้องส่ง report/moderation handoff data ให้ Back Office ได้
- [ ] Admin Review, Moderation, Audit Trail อยู่ใน Back Office scope
- [ ] Mobile V1 ใช้ `18_ADMIN_SCOPE_NOTE.md` เป็น boundary
- [ ] Full Back Office PRD เริ่มหลัง FO baseline, Figma cleanup, Dev checklist และ QA checklist ครบ/นิ่งแล้วเท่านั้น

---

# 19. Implementation Handoff Gates

- [ ] Dev อ่าน source-of-truth order ใน `README_MODULE_INDEX.md`
- [ ] Dev อ่าน `ERROR_STATE_UI_COPY_CATALOG.md` ก่อน implement error/loading/empty/retry states
- [ ] Dev ใช้ master เป็น source สูงสุดเมื่อ Figma/PRD ขัดกัน
- [ ] Figma `Must Fix` ต้องแก้ก่อนเริ่ม implementation จริง
- [ ] Figma `High` ต้องมี owner/decision ก่อน QA sign-off
- [ ] API contract ต้องระบุ permission และ visibility filtering ชัดเจน
- [ ] QA ต้องมี test cases ครอบคลุม Guest, Member, Owner, Other User, Admin boundary
- [ ] QA ต้อง test Sale/Show/Hide/Sold/Deleted lifecycle ครบ
- [ ] QA ต้อง test Block, Report, Notification routing, Portfolio fallback และ No market price
- [ ] Retry scope ต้องตรง catalog: image-only, pagination-only, refresh-only, section-only หรือ screen reload ตาม state
- [ ] Existing data ต้องไม่ถูก clear เมื่อ refresh/load-more/image/section retry fail
