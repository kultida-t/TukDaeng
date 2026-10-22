# TukDaeng Dev Implementation Checklist

Reference:

- [TukDaeng_Master_Product_Definition.md](TukDaeng_Master_Product_Definition.md)
- [README_MODULE_INDEX.md](README_MODULE_INDEX.md)

Purpose:

เอกสารนี้ใช้เป็น implementation checklist สำหรับ Dev รายการด้านล่างเน้นสิ่งที่ต้องทำในระบบจริง เช่น data model, API, permission, routing, state handling, integration และ logging

> **Sync note (FO-PRD-v1.9, 2026-10-22):** checklist นี้ sync ตาม baseline ใหม่ที่ lock ด้วย `Prototypes/fo-flow/index.html` เป็น source of truth + master §16 Sync Decision Log (S-01–S-29) — feed post-centric, Member Sheet, Alerts feed 5 types, Sale Record 2 ฟิลด์, Total invested, share member-only, ไม่มี infinite scroll/`Price on request`/multi-step form — รายการที่เป็น production contract แต่ prototype ไม่ครอบ mark `(contract — prototype ไม่ครอบ)`

---

# 0. Global Implementation Rules

- [ ] ใช้ canonical asset status ชุดเดียว: `Sale`, `Show`, `Hide`, `Sold` (+ kind `post` ของโพสต์ที่ไม่ผูก asset — ไม่ใช่ asset status)
- [ ] บังคับ visibility matrix ตาม master ทุก query/list/detail
- [ ] Session model 3 สถานะ `member` / `new` / `guest` ตาม 00_GLOBAL §7 — guest browse ได้ แต่ action ที่ต้องมีตัวตน gate ทั้งหมด
- [ ] Guest action ที่ต้อง Login ต้องเปิด Member Sheet (`Join TukDaeng`) — เดิมเรียก Global Login Required Dialog
- [ ] Deleted Asset/Post ต้องหายจาก public list และ detail แสดง unavailable state
- [ ] Blocked user/content ต้องถูก filter จาก Feed, Search, Watch Alert Result และ Profile entry ที่เกี่ยวข้อง
- [ ] Empty state ใช้ `ไม่พบข้อมูล` / `No data found`
- [ ] Error state ที่ recover ได้ต้องมี retry action
- [ ] Deep link ทุกประเภทต้อง validate auth, permission, asset status, deleted state และ block state ก่อน render (contract — prototype ไม่ครอบ)

---

# 1. Authentication

- [ ] รองรับ Email / Password Sign Up
- [ ] Consent เป็น implied (sign-up ถือว่ายอมรับ Terms/Privacy) + optional marketing opt-in แยก + re-consent เมื่อ policy version bump ตาม 00_GLOBAL §8
- [ ] Email / Password ต้อง verify OTP 6 หลัก (auto-submit เมื่อครบ)
- [ ] รองรับ Resend OTP (FO V1 ไม่ได้กำหนด OTP expiry duration — S-20)
- [ ] Email signup ไม่ auto-login — แสดง `Account created` แล้วให้ Sign in เอง (S-22); SSO signup/signin เข้า session `new` → profile setup
- [ ] Password อย่างน้อย 8 ตัวอักษร และต้องมีตัวเลขหรือสัญลักษณ์ (rule เดียวทุกจุด — S-21)
- [ ] 1 Email สมัครได้ 1 บัญชี
- [ ] SSO Email ไม่ต้อง OTP
- [ ] Apple Sign In รองรับตาม App Store requirement
- [ ] Google OAuth รองรับตาม integration baseline
- [ ] บัญชี SSO-only ห้าม Sign In ด้วย Email / Password
- [ ] บัญชี Email / Password ห้าม Sign In ด้วย SSO หากไม่ได้ linked ตาม policy
- [ ] Email หลัง verify แล้วแก้ไขไม่ได้
- [ ] Sign in ผิดมี attempt counter `(n/5)` + lockout ตาม 01 spec
- [ ] Forgot Password ส่ง reset link และแสดง generic confirmation — ไม่มี Reset Password page ในแอป (S-20)
- [ ] Change Password รองรับเฉพาะ authenticated Email / Password account — อยู่ใน About your account > Security (S-28)
- [ ] Change Password ต้องมี Current password, New password และ Confirm new password
- [ ] Change Password ต้อง validate current password, password policy, new password ต้องต่างจาก current password และ confirm ต้องตรงกับ new password
- [ ] Change Password field errors ต้องรองรับ `Current password is incorrect.`, `New password must be different from current password.`, `Passwords do not match.`
- [ ] Change Password API/network error ต้องแสดง `Unable to change password. Please try again.` โดยไม่ผูก error กับ field เฉพาะ
- [ ] Change Password success ต้องแสดง `Password changed` และไม่จำเป็นต้อง sign out
- [ ] Suspended Account ต้อง block login พร้อม reason/support path
- [ ] Sign Out ต้อง clear local session/token และกลับ session `guest`

---

# 2. Feed

- [ ] Feed เป็น post-centric — แสดงโพสต์ `sale` + โพสต์ `post` (ไม่ผูก asset); `show`/`hide`/`sold`/deleted ไม่ขึ้น feed (S-09)
- [ ] Feed tabs: `ทั้งหมด`/`All`, `กำลังติดตาม`/`Following` (seller ที่ follow), `รายการโปรด`/`Favorites` (favorite sellers)
- [ ] Guest เข้า feed ทุก tab ได้โดยไม่ gate — Following/Favorites แสดง empty state (S-16)
- [ ] Feed Card anatomy ตาม 02: media, seller row (avatar/name), caption/spec, price เฉพาะ sale post, action rail (like, comment, share, save, `...`)
- [ ] Feed Card ไม่แสดง Location ใน V1
- [ ] Like เป็น per-post — liked posts ไป Interested list ใน Settings (`interested`) **ไม่ใช่** Favorites tab (D7); like count เป็น private เห็นเฉพาะเจ้าของโพสต์ (S-26)
- [ ] Comment/Share/Save จาก card เปิด shared sheets (comments / share / save) โดยตรง ไม่บังคับผ่าน Post Detail
- [ ] Others-post `...` menu และ own-post menu ตาม canonical 02 — `Not interested` loop แทน Hide this asset เดิม (viewer-level preference ไม่ใช่ status)
- [ ] Not interested ซ่อนโพสต์เฉพาะ feed ของผู้กดและไม่กระทบ owner/ผู้ใช้อื่น/public profile/chat
- [ ] Report จาก post menu เปิด Trust & Safety report stack และไม่ทำให้โพสต์หายทันที
- [ ] Block User จาก post menu ต้องมี confirmation และใช้ block filtering rule หลัง block สำเร็จ
- [ ] ไม่มี Pull to Refresh / Infinite Scroll / load-more / end-of-list marker — render list ทั้งก้อนครั้งเดียว
- [ ] Error state มี retry ตาม ERROR_STATE_UI_COPY_CATALOG (contract — prototype ไม่ครอบ)
- [ ] Offline state แสดง cached data ล่าสุดเมื่อมี (contract)

---

# 3. Search & Filter

- [ ] Search match เฉพาะ sale listing สำหรับ filter option count `(N)` และ Watch Alert match; post `post` kind / `show`/`hide`/`sold`/deleted ไม่เข้า result listing
- [ ] Search landing = popular chips + explore photo grid; typing = recent searches (≤8, session memory — S-23) + live suggestions
- [ ] Result/explore tile เปิด Post Viewer เต็มจอเลื่อนแนวตั้ง
- [ ] Results tabs: `For you` (Accounts + Posts), `Profiles` (seller cards + Follow), `Tags` (hashtag rows)
- [ ] Keyword search match seller name + caption + chips + spec snapshot text (รวม free-text ที่ owner save)
- [ ] Filter `sfilter` = 11 sections (Brand, Model, Price, Year, Reference, Condition, Case size, Movement, Dial, Strap, Delivery) แบบ chip multi-select draft pattern — Apply เท่านั้นที่ commit
- [ ] Brand → Model เป็น dependent filter
- [ ] Filter option แสดง `(N)` = จำนวน sale listing ที่เห็น และ `(0)` เลือกได้ (no current listing ≠ inactive)
- [ ] ไม่มี Sort UI และไม่มี result count บนหน้า results (S-24) — `Apply (N)` คือจำนวน filter ที่เลือก
- [ ] `Clear all` reset criteria ทั้งหมด
- [ ] No result ใช้ empty state กลาง
- [ ] Create Watch Alert จาก Search Filter ผ่าน shared `Create watch alert` sheet — name auto-filled (แก้ได้), เลือก match mode 3 แบบ (`ตรงทุกเงื่อนไข`/`ตรงเงื่อนไขใดเงื่อนไขหนึ่ง`/`เฉพาะรุ่น`) พร้อม `N now` count, criteria เป็น snapshot (S-11)

---

# 4. Asset Management

- [ ] Add Asset = composer asset mode (drawer-first) ตาม canonical 02 — ไม่ใช่ multi-step listing form (ตัดแล้ว)
- [ ] Required field เดียวคือ media ≥1 รูป (primary `Add Asset` disabled จนกว่ามี media) — ไม่มี required matrix ต่อ status, ไม่มี confirmation dialog (S-25)
- [ ] Gallery รองรับสูงสุด 10 รูป
- [ ] Visibility pick ตอน Add Asset: `Show` (default) / `Hide` / `Post to feed` + `Also save to My Assets` toggle (post mode)
- [ ] ทุกเส้นทางสร้าง drawer record (`PF_ASSETS`) ก่อน + link `assetId`; `Post to feed` เพิ่ม post เข้า feed ด้วย
- [ ] Asking Price (Add price pane) เป็น optional ทุก status — **ไม่มี `Price on request` label**; ถ้ากรอกต้องเป็นตัวเลขมากกว่า 0
- [ ] Spec fields เป็น free-text ตาม composer — ไม่มี Market Data autocomplete / option-master dropdown ใน V1 (S-25); spec text ที่ owner save ต้องค้นเจอผ่าน Search keyword
- [ ] Cost details (private) = Purchase Price + Purchase Date — owner-private เสมอ ห้ามหลุด public surface
- [ ] Status เปลี่ยนได้ 3 ทางเท่านั้น: Visibility pick ตอนสร้าง, Edit info `Profile status` pick (drawer ON), Mark as Sold → `Sold`
- [ ] `Sold` ต้องเข้าผ่าน Mark as Sold เท่านั้น — Sale Record = `Sale price` + `Sale date` เท่านั้น (required ทั้งคู่) ไม่มี Buyer/Contact/Payment/Attachment (D3)
- [ ] Mark as Sold entries: own-post menu + portfolio asset detail; eligible = `sale`/`show`/`hide`
- [ ] Delete เกิดที่ post level เสมอ — own-post menu `Delete` → dialog `Delete post?` → โพสต์หายทุก surface; ไม่มี delete บน drawer surfaces และไม่มี Undo/restore UI ใน V1
- [ ] Deleted post/asset ต้องหายจาก Feed, Search, Watch Alert, Public Profile
- [ ] Chat ที่ผูกกับ post ที่ถูกลบยังอยู่ — reference card แสดง unavailable state
- [ ] Purchase Price / Purchase Date (cost data), sale history และ portfolio value detail เป็น owner-private — ไม่มี Provenance/Consignment entity ใน V1 (S-25)
- [ ] Status transition ต้อง trigger reindex/filter impact ต่อ Feed/Search/Watch Alert/Profile
- [ ] Location ไม่เป็น required/display field หลักใน V1

---

# 5. Post Detail (เดิมเรียก Asset Detail)

- [ ] Viewer เปิดได้เฉพาะ post สถานะ `sale` และ `show` (public post)
- [ ] Owner เปิด post/asset ตัวเองได้ทุก status: `sale`, `show`, `hide`, `sold`, `post`
- [ ] Hide/Sold ของ user อื่นต้อง unavailable/permission denied
- [ ] Deleted post แสดง `รายการนี้ไม่พร้อมใช้งานแล้ว` / `This item is no longer available.`
- [ ] Detail anatomy ตาม 05: hero media, action row (like/comment/share/save/`...`), `mf-btn`, `wl-btn`, specs — ไม่มี owner block/follow/Ask นอก sale post/inline comments/full-screen viewer
- [ ] `Ask Seller` pill แสดงเฉพาะ sale post เท่านั้น (chat entry — listing-scoped)
- [ ] Comment เปิด shared comments sheet จากทุก surface; composer = emoji quick-react (S-12 — text input ยังไม่ implement)
- [ ] Comment รองรับ IG-style one-level replies ใต้ comment หลักเท่านั้น
- [ ] Comment ต้องไม่รองรับ multi-level nested thread หรือ reply ซ้อนเกิน 1 ชั้น
- [ ] ไม่มี Edit Comment ใน V1
- [ ] Comment action = long-press popover: own → `Delete` (confirm + cascade replies) / others → `Block` + `Report` → report:comment
- [ ] Report Comment success ต้องไม่ซ่อน comment ทันที
- [ ] Show post เปิด detail ได้แต่ไม่ขึ้น Feed/Search/Watch Alert และไม่มี chat entry
- [ ] Post Detail ไม่แสดง Market Comparison / Expected Profit — Price Analytics อยู่ Portfolio เท่านั้น (locked decision)
- [ ] Purchase data, Sold History, Portfolio Value Detail เป็น Owner-only

---

# 6. Profile

- [ ] Owner Profile แสดง post/asset ของตัวเองทุก status ใน tabs 5 แบบ post grid (`ทั้งหมด`/`ขาย`/`โชว์`/`ซ่อน`/`ขายแล้ว`) — ไม่มี headline ตัวเลขมูลค่า
- [ ] Public Profile แสดงเฉพาะ `sale` และ `show` (S-14 — prototype `all` tab leak = defect ไม่ทำตาม)
- [ ] Public Profile ห้ามแสดง `hide`, `sold`, purchase data, sale history, portfolio value detail
- [ ] Public Profile `...` menu ของ viewer: `Report`, `Block`, `About`, `Copy URL`, `Share` — ไม่มี asset quick actions บน card
- [ ] Owner Profile entries: `pf-pfo` wallet icon (portfolio), `+` (composer), `pf-menu` (settings/drawer), `pedit` (edit profile), QR
- [ ] Share profile เป็น member-only — guest เจอ Member Sheet (S-03); share sheet = in-app sheet + copy link
- [ ] Report User success ต้องไม่ซ่อน profile ทันที
- [ ] Block User จาก Public Profile ต้องผ่าน shared `blkSheet` confirmation และ cancel/dismiss ต้องไม่ apply block
- [ ] Blocked profile แสดง keep-page state ตาม IG model (S-13 — ไม่ใช่ unavailable)
- [ ] Portfolio entry = wallet icon `.pf-pfo` บน own profile เท่านั้น (D1 — ไม่มีตัวเลข Total Asset Value บน profile)
- [ ] Follow/Unfollow ทำงานเฉพาะ Member — account-level ทุก post ของ seller
- [ ] Guest Follow/Like/Comment/Share/Chat action ใด ๆ ต้องเปิด Member Sheet
- [ ] Unfollow ต้องล้าง favorite/mute ของ seller นั้น
- [ ] Owner ไม่เห็น Follow ตัวเอง
- [ ] Blocked profile/content ต้อง apply keep-page/filtering ตาม Trust & Safety rule

---

# 7. Chat

- [ ] Chat เป็น member-only surface (`แชท` bottom nav) — guest เจอ Member Sheet
- [ ] Thread key = user + item (listing) — seller เดิมคนละโพสต์ = ห้องใหม่เสมอ ไม่มี room merge (S-07)
- [ ] Draft room `C.draft` สร้างตอนกด Ask (Quick Ask prefill `cfg.quick`) — เข้า list จริงเมื่อส่งข้อความแรกเท่านั้น
- [ ] Chat Center มี 2 views: `Chats` (คู่สนทนา) และ `Items` (`Your listings` / `Items you asked about`)
- [ ] Chat Room รองรับ text + media message (photos) เท่านั้น — **ไม่มี File message / Asset Card message** (ตัดตาม prototype)
- [ ] Post reference card แสดงในห้อง (snapshot) — กดแล้วไป Post Detail; post ที่ถูกลบแสดง unavailable state
- [ ] Search in chat list + search in room (`room-search` + highlight)
- [ ] Unread count/badge แสดงใน Chat menu เท่านั้น (cap `99+`) — ไม่เข้า Alerts feed
- [ ] Swipe actions บน chat row: pin / mute / hide / delete
- [ ] Room menu `chmenu` = 4 circular actions (Mute/Unmute, Profile, Block/Unblock, Report) + `Photos & videos` gallery + `Listings & Items` row
- [ ] Block User จาก Chat ผ่าน shared `blkSheet` — หลัง block ห้องเป็น read-only (`You blocked this account` + `Unblock`)
- [ ] หลัง block แล้วส่งข้อความใหม่ไม่ได้และสร้าง Chat ใหม่ระหว่างคู่ที่ block กันไม่ได้
- [ ] Hide chat = `Hiding chats doesn't delete their messages.`; Delete chat = `Are you sure you want to delete this chat?` → ซ่อนเฉพาะฝั่งผู้กด ไม่ลบ server history ไม่มี restore UI
- [ ] Report จาก chat = `Report` / `Report and delete` (report:user stack)
- [ ] Deleted post/asset แล้ว Chat ยังอยู่; Sold post แล้ว Chat ยังใช้งานได้ (reference card ตามสถานะ)
- [ ] ไม่เขียน E2E/Letter Sealing เป็น feature claim (S-18 — footer copy ใน prototype เป็น dead copy); `chsettings` เป็น dead route ไม่ implement

---

# 8. Notification (Alerts feed)

- [ ] Alerts feed (เดิมเรียก Notification Center) เป็น member-only surface — guest เจอ Member Sheet
- [ ] รองรับ 5 types: Like, Comment, Follow, Watch Alert, `system` (S-17 — placeholder destination ใน V1)
- [ ] Chat/New Message ไม่เข้า Alerts feed — badge-only ที่ Chat menu
- [ ] Moderation, Account Action, Market Update, Price/Valuation, Sale Success ไม่เข้า FO V1 Alerts feed
- [ ] List แสดงเฉพาะของ current user แบ่งกลุ่ม age buckets (`Today`/`Yesterday`/`Last 7 days`/`Earlier`)
- [ ] Read/Unread state + `Mark all as read` + nav badge (cap `99+`)
- [ ] Follow row มี inline `Follow back`/`Following` + dismiss `x`
- [ ] Like notification ไป Post Viewer ของโพสต์ตัวเอง
- [ ] Comment notification ไป Post Viewer ของโพสต์ตัวเอง (ไม่มี focus comment — D12)
- [ ] Watch Alert notification เปิด Post Viewer ของ post ที่ match โดยตรง (S-08)
- [ ] Follow notification ไป Public Profile ของผู้ติดตาม
- [ ] ไม่มี Watch Alert Result List เป็น destination คั่นใน V1
- [ ] Destination ต้อง handle Deleted post, Deleted User, Permission Denied, Block state ตาม fallback rule

---

# 9. Watch Alert

- [ ] Watch Alert match เฉพาะ `sale` posts/listings
- [ ] Watch Alert ไม่ match `show`, `hide`, `sold`, deleted หรือ `post` kind
- [ ] Create Watch Alert ผ่าน shared sheet (3 entries) — name auto-filled แก้ได้, criteria เป็น snapshot ตอนสร้าง (S-11)
- [ ] Match mode 3 แบบ: `ตรงทุกเงื่อนไข` / `ตรงเงื่อนไขใดเงื่อนไขหนึ่ง` / `เฉพาะรุ่น` พร้อม `N now` count
- [ ] ไม่มี required field สำหรับ criteria — alert name ใช้ auto-name (ไม่บังคับ user พิมพ์)
- [ ] Watch Alert list อยู่ Settings > Your library (`walerts` page)
- [ ] รองรับ toggle notification ต่อ alert
- [ ] Delete alert = instant delete ทันที ไม่มี confirmation (S-11)
- [ ] Watch Alert notification เปิด Post Viewer ของ post ที่ match โดยตรง ไม่มี Result List คั่น
- [ ] Blocked user/post ต้องถูก filter ออกจาก Watch Alert match/notification
- [ ] Inactive market-data dependency warning เป็น contract (no current listing ≠ inactive)

---

# 10. Social

- [ ] Like ทำได้จากทุก surface ที่มี action rail (feed/detail/viewer/search tile) — toggle + count sync
- [ ] Like count เป็น private — แสดงตัวเลขเฉพาะเจ้าของโพสต์ (S-26, IG model)
- [ ] Liked posts ไป Interested list (Settings `interested`, `m-unlike`) — **ไม่ใช่** Favorites
- [ ] Comment เปิด shared sheet ทุก surface; 1-level reply; composer = emoji quick-react
- [ ] Long-press comment: own → Delete (confirm + cascade) / others → Block + Report
- [ ] Report Comment ต้องไม่ทำให้ comment หายทันที
- [ ] ไม่มี Edit Comment ใน V1
- [ ] Follow/Unfollow account-level ทุก post ของ seller; Following Feed ใช้ follow relation ที่ไม่ถูก block
- [ ] Unfollow ล้าง favorite + muted ของ seller นั้น; uf confirm sheet เมื่อ following
- [ ] Saved hub (`savedCol` + collections CRUD + select/move/unsave + `nc` sheet) และ Wish List hub (`wlCol`) = ระบบ private collections แยกกันสมบูรณ์
- [ ] Share เป็น member-only ทุก surface (S-03) — guest เจอ Member Sheet
- [ ] Share ใช้ in-app share sheet (ส่งให้เพื่อน + Messenger/Direct/LINE/Facebook + Copy link)
- [ ] Share ไม่สร้าง Alerts feed item
- [ ] Public deep link ต้อง validate status, permission, deleted state และ block state เมื่อเปิด (contract — prototype ไม่ครอบ)
- [ ] Shared post deep link ของ `hide`/`sold` โดย non-owner แสดง Permission Denied / Unavailable state; Owner เห็น Owner-only detail (contract)
- [ ] Shared Profile deep link ของ user ที่ถูก block/ไม่มีอยู่แสดง keep-page / unavailable state (contract)
- [ ] Back button บนหน้าที่เปิดจาก external deep link (ไม่มี navigation history) fallback ไป Feed (contract)
- [ ] Social action ไม่สร้าง notification ให้ตัวเอง (เช่น share/save/not-interested)

---

# 11. Board

- [ ] Board เป็น editorial magazine (S-01) — hero featured ≤5 + Latest list + freeform category tags; **ตัด** 7 master sections เดิม (Feature Article, Trending Now, Journal Board, Watch Brands, Watch 101, Watch Apparel, Watch Events)
- [ ] Article สร้าง/แก้/ลบโดย Admin ผ่าน Back Office เท่านั้น
- [ ] Front Office user สร้าง/แก้/ลบบทความไม่ได้
- [ ] รองรับ Article List และ Article Detail
- [ ] รองรับ Search Article เป็น surface แยก (live filter title+category+sub ไม่ combine กับ category filter)
- [ ] Static list + end note — ไม่มี Infinite Scroll (D2)
- [ ] Article Like + Article Share เป็น member-only — guest เจอ Member Sheet (S-03)
- [ ] Article Share ใช้ in-app share sheet และไม่สร้าง notification
- [ ] Report Article เป็น contract-only (S-04 — prototype menu dead); spec contract map เข้า Trust & Safety `Board Content` / target `Article`
- [ ] Article Comment ไม่อยู่ใน V1 baseline
- [ ] Public Article deep link ต้อง validate publish state, deletion state และ availability เมื่อเปิด (contract)
- [ ] Shared Article deep link ของ unpublished/deleted/invalid ต้องแสดง Article Unavailable / Not Found state (contract)
- [ ] Back button บน Article Detail ที่เปิดจาก external deep link fallback ไป Feed (contract)
- [ ] Article not found/deleted แสดง unavailable state

---

# 12. Settings

- [ ] Settings เป็น IG-style 6-section structure (S-05) — เข้าได้เฉพาะ Member
- [ ] Edit profile อยู่ own profile (`pedit`) ไม่ใช่ Settings entry (S-05)
- [ ] About your account: Security (Change password — S-28) + Account management (Delete account)
- [ ] Username, Phone, Line แก้ได้ตาม profile validation
- [ ] Email Display เป็น read-only หลัง verify
- [ ] Language รองรับ English / Thai
- [ ] Theme Mode รองรับ Dark Mode / Light Mode
- [ ] Notification Settings รองรับ 4 toggles: Like, Comment, Follow, Watch Alert (S-06 — ไม่มี Offer/Chat toggle)
- [ ] Notification Settings default ON และ auto-save toggle โดยไม่มี Save button
- [ ] Content preferences / what-you-see pages (Interested list, Not interested, Muted, Blocked) ตาม 13 spec
- [ ] Change Password แสดงเฉพาะ Email / Password account — SSO-only ไม่เห็น active action
- [ ] Help แสดง Contact support, Available daily, 09:00 - 22:00 (GMT+7), LINE `@mrfoxthailand`, Phone `(+66) 80-008-8088`, Email `service@mrfox.com`
- [ ] Help contact rows เปิด LINE, dialer และ mail composer ตาม type
- [ ] About app แสดง `TUK DAENG`, tagline, `Version 0.0.1`, `Mister Fox Co., Ltd.`, `Est. 2026`, Privacy Policy, Terms of Use และ Contact support
- [ ] About app ต้องไม่แสดงข้อมูลบัญชี, Date joined, Change Password หรือ Delete Account
- [ ] Privacy Policy และ Terms of Use เข้าถึงได้ (legal viewer — guest อ่านได้)
- [ ] Sign Out ต้องมี confirmation copy `Sign out?`, `You will need to sign in again to access your account.`, actions `Cancel` / `Sign out`
- [ ] Sign Out สำเร็จต้อง clear session → session `guest`, ไป Sign In / pre-auth และกด back กลับ Settings ไม่ได้
- [ ] Delete Account = 2-page flow (terms → reason → password → scheduled → guest) ตาม S-27
- [ ] Delete Account ต้อง revoke session และ clear local token ทันที
- [ ] Delete Account ใช้ grace period 30 วันแบบ **login-to-restore** (S-02 — sign in ระหว่าง grace = คืนบัญชี) ก่อน hard delete/anonymization
- [ ] Delete Account API fail ต้องไม่ revoke session และต้องแสดง error/retry state

---

# 13. Portfolio

- [ ] Portfolio เป็น Owner-only — เข้าผ่าน wallet icon `.pf-pfo` บน own profile เท่านั้น (D1 — ไม่มีตัวเลขบน profile)
- [ ] Public Profile ห้ามแสดง Portfolio data ใด ๆ
- [ ] Headline = `Total invested` = Σ Purchase Price ของ eligible asset (D2 — ไม่ใช่ Total Asset Value)
- [ ] Market value เป็น secondary line และต้องมี ≥1 asset ที่มี market value ถึงแสดง
- [ ] Eligible = `sale`/`show`/`hide` + `own !== false`; ไม่รวม `sold`, asset ที่ลบ, asset ที่ BO ซ่อนถาวร
- [ ] Current Value priority: Watch Price API Market Price → Purchase Price fallback → No Valuation (contract — prototype ใช้ mock `market` field)
- [ ] Purchase Price fallback ต้องแสดง label ว่าใช้ราคาซื้อเป็นค่าประมาณ
- [ ] No Valuation แสดง `—` และไม่รวม market value
- [ ] Unrealized Gain/Loss คำนวณเมื่อมีทั้ง market value และ purchase price เท่านั้น
- [ ] Expected Profit = Asking Price − Purchase Price (Portfolio เท่านั้น)
- [ ] Market Comparison = Asking Price เทียบ Market Price (Portfolio เท่านั้น) — Above/At/Below threshold ±1%
- [ ] Realized Gain/Loss = Sale Price − Purchase Price แสดงใน Sold History / sold detail
- [ ] Holding Period ใช้ Today − Purchase Date หรือ Sale Date − Purchase Date (format `Yy Mm`)
- [ ] Sold History / Sale Record = `Sale price` + `Sale date` เท่านั้น (D3 — ไม่มี Buyer/Contact/Payment/Attachment)
- [ ] ไม่มี Top Brand Holdings และ YTD Performance ใน V1 (D5)
- [ ] Consignment เป็น copy-only foot note + `own` flag — ไม่มี implementation/entity (D12)
- [ ] Permission-denied/load-failed states เป็น dev-sim เท่านั้น ไม่ใช่ production path (contract อยู่ error catalog)

---

# 14. Trust & Safety

- [ ] Report post ได้จาก post menu / Post Detail
- [ ] Report User ได้จาก Public Profile `...` menu / Chat room menu
- [ ] Report Comment ได้จาก comment long-press popover
- [ ] Report ไม่ทำให้ content หายทันที — content หายเมื่อ Admin moderation action
- [ ] Block User ทุก entry point ต้องใช้ shared `blkSheet` confirmation ก่อน apply block
- [ ] Block ต้องซ่อน post/content ของคู่นั้นจาก Feed, Search, Watch Alert Result
- [ ] Block ต้อง unfollow ทั้งสองทิศ + ล้าง favorite + mute ตาม social rule
- [ ] Block ต้องทำให้ Chat read-only และกัน new message/new chat ระหว่างคู่ที่ block กัน
- [ ] Blocked profile แสดง keep-page state (S-13)
- [ ] Unblock behavior ต้อง restore visibility ตาม normal permission (`unblockDlg`)
- [ ] Suspended/Banned account ต้อง login เข้า main app ไม่ได้ และต้องเห็น account status state พร้อมเหตุผล/support contact (contract)
- [ ] เมื่อ BO เปลี่ยน account เป็น Suspended/Banned ต้อง revoke/block active session และ clear authenticated app state (contract)
- [ ] V1 ไม่มี `Restricted` หรือ feature-level account state
- [ ] Admin moderation handoff ต้องมี reference/report id

---

# 15. Integrations

- [ ] Apple Sign In integration พร้อม callback/error handling
- [ ] Google OAuth integration พร้อม callback/error handling
- [ ] Firebase Cloud Messaging สำหรับ Push Notifications
- [ ] FCM token register/update/delete ตาม session/device lifecycle
- [ ] Image Storage/CDN สำหรับ asset/post images, profile images, attachments
- [ ] Image upload ต้องรองรับ loading/failure/retry
- [ ] CDN image display ต้องมี placeholder/error state
- [ ] Watch Price API เป็น source แรกของ Portfolio market value (contract — prototype ใช้ mock)
- [ ] Watch Price API failure ต้อง fallback ตาม Portfolio rule
- [ ] Payment Gateway ไม่อยู่ใน V1
- [ ] External integration timeout/error ต้องไม่ทำให้ app crash

---

# 16. Non-Functional Requirements

- [ ] Feed initial load target ต้องเป็นไปตาม NFR baseline
- [ ] Search/filter response target ต้องเป็นไปตาม NFR baseline
- [ ] Image loading ต้องใช้ CDN/cache strategy
- [ ] Offline/cached state อย่างน้อยต้องรองรับ Feed (contract)
- [ ] ไม่มี infinite scroll / load-more rendering path ใน V1 (feed/board = static list)
- [ ] Sensitive data ต้องไม่ log เป็น plain text
- [ ] Private data ต้องถูก enforce ทั้ง frontend และ backend/API
- [ ] API ต้อง validate permission server-side
- [ ] Localization รองรับ Thai/English ตาม supported copy
- [ ] Accessibility: touch target, contrast, text scaling ตาม NFR
- [ ] Error handling ต้องมี user-safe message
- [ ] Analytics events ต้องไม่เก็บ private/sensitive data เกินจำเป็น

---

# 17. Admin / Back Office Boundary

- [ ] Front Office mobile ไม่มี Admin UI
- [ ] Admin ใช้งานผ่าน Web Back Office เท่านั้น
- [ ] Front Office ต้องส่ง report/moderation handoff data ให้ Back Office ได้
- [ ] Admin Review, Moderation, Audit Trail อยู่ใน Back Office scope
- [ ] Mobile V1 ใช้ `18_ADMIN_SCOPE_NOTE.md` เป็น boundary
- [ ] Full Back Office PRD เริ่มหลัง FO baseline, Dev checklist และ QA checklist ครบ/นิ่งแล้วเท่านั้น

---

# 18. Implementation Handoff Gates

- [ ] Dev อ่าน source-of-truth order ใน `README_MODULE_INDEX.md`
- [ ] Dev อ่าน `ERROR_STATE_UI_COPY_CATALOG.md` ก่อน implement error/loading/empty/retry states
- [ ] Dev ใช้ master เป็น source สูงสุดเมื่อเอกสารขัดกัน
- [ ] API contract ต้องระบุ permission และ visibility filtering ชัดเจน
- [ ] QA ต้องมี test cases ครอบคลุม Guest, Member, Owner, Other User, Admin boundary
- [ ] QA ต้อง test Sale/Show/Hide/Sold/Deleted + post kind lifecycle ครบ
- [ ] QA ต้อง test Block, Report, Alerts feed routing, Portfolio fallback และ No market price
- [ ] Retry scope ต้องตรง catalog: image-only, section-only, refresh-only หรือ screen reload ตาม state (ไม่มี pagination retry ใน V1 — ไม่มี load-more)
- [ ] Existing data ต้องไม่ถูก clear เมื่อ refresh/image/section retry fail
