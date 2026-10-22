# Tuk Daeng Master Product Definition

**Document Type:** Master Product Definition / PRD Baseline  
**Source Documents:** `PRD.md`, `FO_Functional_PRD.md`  
**Purpose:** ใช้เป็นหลักยึดกลางก่อนแตกเป็น Functional PRD รายโมดูล  
**Status:** Synced to fo-flow prototype baseline (FO-PRD-v1.9) — Draft for Dev & QA Review

> **Sync note (FO-PRD-v1.9, 2026-10-22):** เอกสารนี้ sync ตาม module specs ที่ rewrite ให้ตรง `Prototypes/fo-flow/index.html` (locked prototype — source of truth) ผ่าน mission FSP-006–024 + sign-off S-01–S-29 ใน `deliverables/fo-spec-sync/FSP-005-consolidated-gap-signoff.md` — ทุกจุดที่ master เดิมขัด prototype ให้ยึด prototype (ตัวเลือก default ของ sign-off) ส่วนรายการที่เป็น production contract แต่ prototype ไม่ครอบ ให้ mark เป็น `(contract — prototype ไม่ครอบ)` ตามแบบ module specs — decision log รวมอยู่ที่ §16

## 1. Product Definition

Tuk Daeng เป็น Mobile Application สำหรับ Marketplace Community ของนักสะสมนาฬิกาหรูในประเทศไทย

ระบบออกแบบมาเพื่อ:

- ให้ผู้ซื้อค้นหาและติดตามนาฬิกาที่สนใจได้ง่าย
- ให้ผู้ขายลงขายและบริหาร Asset ของตัวเองได้
- ให้ผู้ใช้เก็บและแสดงคอลเลกชันนาฬิกาของตัวเองได้
- ให้ผู้ใช้โพสต์แชร์นาฬิกา/คอลเลกชันในรูปแบบ social post โดยไม่ต้องลงขาย
- ให้ผู้ใช้พูดคุย ติดตามผู้ขาย และตั้ง Watch Alert ได้
- ให้ Admin ตรวจสอบเนื้อหา Report และบริหารระบบผ่าน Back Office

ระบบนี้ไม่ใช่:

- Social Network เต็มรูปแบบ (feed เป็น post-centric แบบ social แต่ปลายทางคือ marketplace/community ของนาฬิกา ไม่ใช่ platform social ทั่วไป)
- E-commerce ที่มีการชำระเงินในแอป
- ระบบประมูลหรือ Live Selling ใน Phase 1
- ระบบยืนยันนาฬิกาในแอปใน Phase 1

## 2. Platforms

| Platform | Scope |
| --- | --- |
| iOS | Front Office Mobile App |
| Android | Front Office Mobile App |
| Web Back Office | Admin ใช้จัดการระบบและตรวจสอบ Report |

## 3. User Model

### User

ผู้ใช้ทั่วไปมี Role เดียวกันทั้งหมดหลังสมัครสมาชิก ไม่แยก Buyer / Seller / Collector เป็นคนละ Role

User เดียวกันสามารถ:

- ซื้อหรือค้นหานาฬิกา
- ลงขาย Asset
- โพสต์แชร์นาฬิกาแบบโพสต์ทั่วไป (feed-only post ไม่ผูก asset)
- แสดงคอลเลกชัน
- ซ่อนคอลเลกชัน
- แชท
- Follow ผู้ใช้คนอื่น
- Like และ Comment
- ตั้ง Watch Alert
- จัดเก็บโพสต์ใน Saved / Wish List collections

### Session Model

ระบบใช้ session 3 สถานะ (canonical อยู่ที่ `00_GLOBAL_RULES_MODULE.md` §7):

| Session | นิยาม | พฤติกรรมข้อมูล |
| --- | --- | --- |
| `member` | ผู้ใช้ที่ sign in ด้วยบัญชีที่มีข้อมูลเดิม | เห็นข้อมูลของบัญชีครบทุก surface |
| `new` | บัญชีที่สมัครใหม่ (fresh account) | มี member powers ทุกอย่าง แต่เริ่มต้นไม่มีข้อมูลของตัวเอง — followers/following = 0, ไม่มี assets/chats/alerts/saved/collections |
| `guest` | ผู้ใช้ที่ยังไม่ sign in | ไม่มีข้อมูลส่วนตัวใด ๆ; browse ได้ตาม guest capabilities — action ที่ต้องมีตัวตนถูก gate ด้วย Member Sheet |

### Owner

Owner คือ User ในฐานะเจ้าของ Asset ชิ้นนั้น ไม่ใช่ Role แยกต่างหาก

Owner สามารถเห็น Asset ของตัวเองทุกสถานะ:

- Sale
- Show
- Hide
- Sold
- ซ่อนถาวรโดยผู้ดูแล แบบ read-only

Owner ยังเห็นโพสต์ `post` ของตัวเองบน Owner Profile grid (โพสต์ feed-only ไม่ผูก asset ไม่นับเป็น asset status)

Asset ที่ลบโดยเจ้าของไม่แสดงใน owner list ปกติ แต่ backend/BO ควรเก็บ record ตาม retention policy เพื่อ audit, report history, dispute หรือ compliance

### Viewer

Viewer คือ User หรือ Guest ที่กำลังดู Asset หรือ Profile ของคนอื่น

Viewer เห็นเฉพาะ Asset ที่เป็น Public:

- Sale
- Show

Viewer เห็นโพสต์ `post` ของคนอื่นบน Feed เท่านั้น — Public Profile grid แสดงเฉพาะ `Sale` + `Show` (prototype `all` tab ที่รั่ว `post`/`Hide`/`Sold` ถือเป็น defect ไม่ใช่ spec)

### Guest

Guest คือผู้ใช้ที่ยังไม่ Login (session `guest`)

Guest ดูได้ (browse ฟรี ไม่ gate):

- Feed ทุก surface รวม feed tabs `All` / `Following` / `Favorites` (guest เห็น empty state เพราะไม่มีความสัมพันธ์)
- Search (explore, results, filters) และ Post Viewer
- Public Post Detail
- Public Profile และ followers/following lists (read-only)
- Boards และ Article Detail (read-only)
- Legal viewer (Privacy Policy, Terms of Use) และ onboarding surfaces

Guest ใช้งานไม่ได้ (identity actions — กดแล้วเปิด Member Sheet `Join TukDaeng`):

- Like / Comment / Save / Wishlist / Share **ทุก surface รวม asset, profile และ article** (S-03: share ต้อง login)
- Follow / Favorite / Unfollow / Mute / Not-interested feedback
- Post menus ทั้งของตนเองและคนอื่น (archive, pin, edit, mark as sold, report, block)
- Report ทุกประเภท และ Board actions ทั้งหมด
- Chat ทุก entry (Ask Seller, chat list, room actions)
- Watch Alert create / manage
- Create composer (`+` post/asset), Settings surfaces, Profile actions ของตัวเอง
- Bottom-nav tabs: Chat / Alerts / Profile

เมื่อ Guest ใช้งาน Feature ที่ต้อง Login ต้องแสดง Member Sheet `Join TukDaeng` (bottom sheet, scrim-dismiss ได้ — canonical `00_GLOBAL_RULES_MODULE.md` §11)

### Admin

Admin ใช้งานผ่าน Back Office เท่านั้น

Admin รับผิดชอบ:

- ตรวจสอบ Report
- Moderation
- จัดการ Board Content
- จัดการ User / Asset ตาม policy
- ดำเนินการภายใน 24 ชั่วโมงสำหรับ Report ที่เข้ามา

Full Back Office PRD ยังไม่เริ่มระหว่าง FO cleanup รอบนี้ ให้ใช้ `18_ADMIN_SCOPE_NOTE.md` เป็น boundary ก่อน และเริ่ม Full Back Office PRD หลัง FO baseline, Dev checklist, QA checklist และ FO sign-off ครบ/นิ่งแล้วเท่านั้น

## 4. Canonical Terminology

| Canonical Term | Meaning |
| --- | --- |
| Asset | นาฬิกาแต่ละเรือนในระบบ (drawer record ใน My Assets / Portfolio) |
| Post | โพสต์บน feed/profile — อาจผูก asset (`pfkind` = sale/show/hide/sold) หรือเป็นโพสต์ธรรมดาไม่ผูก asset (`post` — feed-only ไม่นับเป็น asset status) |
| Sale | Asset ที่เปิดขายและ Public |
| Show | Asset ที่แสดงเป็นคอลเลกชัน Public แต่ไม่ได้ขึ้น Marketplace |
| Hide | Asset ที่ซ่อน เห็นเฉพาะ Owner |
| Sold | Asset ที่ขายแล้ว เห็นเฉพาะ Owner |
| ลบโดยเจ้าของ | Asset ที่เจ้าของเป็นผู้ลบจาก Front Office; ไม่แสดงใน owner list ปกติหรือ public surfaces แต่ backend/BO เก็บ record ตาม retention policy |
| ซ่อนถาวร | Moderation state จาก Back Office สำหรับ asset ที่ไม่ควรแสดงต่อสาธารณะ; owner ยังเห็นแบบ read-only แต่แก้ไขหรือ delete เองไม่ได้ (contract — prototype ไม่ครอบ) |
| Post Detail | `.page-detail` — detail layer เหนือ viewer; asset-detail equivalent เดียวของ V1 ไม่มี "Asset Detail page" แยก (canonical `00_NAV` §6.1) |
| Post Viewer | `.page-pv` — immersive full-screen viewer (feed/pfp/explore modes) |
| Owner Profile | โปรไฟล์ของ User เอง เห็น post/asset ตัวเองทุกสถานะรวม `post` |
| Public Profile | โปรไฟล์ของ User อื่น เห็นเฉพาะ Asset สถานะ Sale และ Show |
| Watch Alert | การตั้งเงื่อนไขแจ้งเตือนเมื่อมี Asset Sale ที่ตรง Criteria |
| Member Sheet | bottom sheet `Join TukDaeng` — guest gate เดียวของระบบ (เดิมเรียก Global Login Required Dialog) |
| Alerts feed | หน้าแจ้งเตือนในแอป (เดิมเรียก Notification Center) — like/comment/follow/watch/system rows |
| Liked | flag per-post — โพสต์ที่ user กด like; รายการอยู่ Settings > Content preferences > Interested |
| Favorites | account-level favorite sellers — ใช้เป็น feed filter tab `Favorites`; **ไม่ใช่** liked posts |
| Saved / Wish List | private post collections ของ user (hub + collection CRUD) |
| Sale Record | record ของ Sold Asset — เก็บเฉพาะ Sale Price + Sale Date (V1) |
| Total invested | headline ของ Portfolio dashboard = Σ purchase price (cost basis) ของ eligible assets |

### Legacy Term Mapping

| Term จาก PRD เดิม | Canonical Term |
| --- | --- |
| Collection Show | Show |
| Collection Hide | Hide |
| Viewer Profile | Public Profile |
| Asset Detail (page) | Post Detail (`.page-detail`) |
| Global Login Required Dialog | Member Sheet `Join TukDaeng` |
| Notification Center | Alerts feed |
| Total Asset Value (headline/entry) | Total invested (Σ purchase) + wallet icon `.pf-pfo` entry |
| Hide this asset (feed menu) | Not interested (viewer-level feedback loop) |

## 5. Asset Status Model

ระบบใช้สถานะ Asset ตามชุดนี้เท่านั้น:

- Sale
- Show
- Hide
- Sold

โพสต์บน feed ที่ไม่ผูก asset ใช้ kind `post` (feed-only ไม่มี asset status) — ไม่นับเป็น asset status เพิ่ม แต่มีผลใน visibility matrix

### Visibility Matrix

| Status | Owner Profile | Public Profile | Feed | Search | Watch Alert |
| --- | --- | --- | --- | --- | --- |
| Sale | แสดง | แสดง | แสดง | แสดง | Match |
| Show | แสดง | แสดง | ไม่แสดง | ไม่แสดง | ไม่ Match |
| Hide | แสดงเฉพาะ Owner | ไม่แสดง | ไม่แสดง | ไม่แสดง | ไม่ Match |
| Sold | แสดงเฉพาะ Owner | ไม่แสดง | ไม่แสดง | ไม่แสดง | ไม่ Match |
| `post` (ไม่ผูก asset) | แสดง | ไม่แสดง | แสดง | ไม่แสดง | ไม่ Match |

### Status Rules

- Feed เป็น social post feed (S-09) — แสดงโพสต์ `Sale` และโพสต์ `post` ที่ไม่ติด viewer-level exclusion (not-interested / muted / blocked / archived)
- Search และ Watch Alert เป็น asset surfaces — match เฉพาะ `Sale` เท่านั้น (prototype `salePosts()` นับ priced post ทุกสถานะรวม `Hide`/`Sold` — pfkind leak ถือเป็น documented defect ไม่ใช่ spec, S-10)
- Show แสดงใน Owner Profile และ Public Profile เท่านั้น
- Show ไม่แสดงใน Feed, Search และ Watch Alert แต่เปิด Post Detail แบบ Public ได้จาก Public Profile
- Hide เห็นเฉพาะเจ้าของใน Owner Profile เท่านั้น
- Sold เห็นเฉพาะเจ้าของใน Owner Profile และ Sold History เท่านั้น
- Hide และ Sold ไม่ Public, ไม่ขึ้น Feed, ไม่ขึ้น Search และไม่เข้า Watch Alert
- Sold Asset ไม่สามารถ Edit ข้อมูลหลักได้
- Sold Asset เก็บไว้เพื่อ Sales History, Portfolio และ Admin Review
- Asset ที่ลบโดยเจ้าของหายจาก owner list ปกติและ public surfaces แต่ backend/BO เก็บ record ตาม retention policy
- Asset ที่ถูก Back Office ซ่อนถาวรหายจาก public surfaces ทั้งหมด แต่ owner ยังเห็นแบบ read-only พร้อมสถานะถูกซ่อนถาวร (contract — prototype ไม่ครอบ)
- Asset ที่ถูก Back Office ซ่อนถาวร owner ไม่สามารถ Edit, Change Status, Publish ใหม่, Mark as Sold, Boost หรือ Delete เองได้ (contract)

## 6. Global Visibility Rules

### Feed

- Feed เป็น post-centric social feed (S-09) — ไม่ใช่ marketplace Sale-only list
- Feed แสดงโพสต์ `Sale` และโพสต์ `post` ที่ไม่ติด viewer-level exclusion
- Feed ต้องกรองโพสต์ที่ viewer กด Not interested, ของ account ที่ muted หรือ blocked, และโพสต์ของตัวเองที่ archived ออก
- Feed tabs: `All` / `Following` / `Favorites`
  - All: ทุกโพสต์ที่ user มีสิทธิ์มองเห็น
  - Following: ทุกโพสต์ eligible ของ sellers ที่ user follow (ไม่จำกัด sale)
  - Favorites: โพสต์ของ favorite sellers (account-level favorite — **ไม่ใช่** liked posts)
- Guest ดู feed และกดทุก tab ได้โดยไม่ gate (S-16)
- Feed ไม่มี infinite scroll / pull-to-refresh ใน V1 — render list ครั้งเดียว (contract: performance targets อยู่ §12)

### Search

- Search entry = search icon บน app header → `search` sub page (ไม่ใช่ bottom-nav tab)
- Result model = photo grid → Post Viewer (post-centric ไม่ใช่ asset card list)
- Search match เฉพาะ `Sale` (contract — prototype `salePosts()` มี pfkind leak เป็น defect ไม่ใช่ spec)
- Results tabs: `For you` (Accounts + Posts) / `Profiles` / `Tags`
- Filter = chip multi-select draft pattern — `Apply` commit เท่านั้น, price = typed inputs ไม่มี slider, ทุก option มี `(N)` count (`(0)` เลือกได้ — no current listing ≠ inactive)
- Recent Searches อยู่ใน scope V1 — session-memory ≤8 รายการ (S-23)
- ไม่มี Sort UI, result count, saved search หรือ Popular Filter context-aware ใน V1 (S-24)

### Watch Alert

- Watch Alert Match เฉพาะ Asset สถานะ `Sale` (contract — pfkind leak defect เหมือน Search)
- Watch Alert เปิดผ่าน shared sheet เดียวกัน 3 entries: bell บน search results, `Follow this model` (`mf-btn`) บน Post Detail, Edit บน alert list row
- Alert Name เป็น auto-name เสมอ (prefill + regen ตอน save ถ้าว่าง) — ไม่มี required-field validation block
- Criteria = snapshot ไม่แก้ใน sheet — edit ได้เฉพาะ name + match mode; เปลี่ยน criteria = สร้าง alert ใหม่
- Delete Alert = instant ไม่มี confirm dialog (prototype decision)
- Watch Alert Notification เปิดไปที่ Post Viewer ของ Asset ที่ match โดยตรง ไม่มี Result List คั่น (S-08)

### Public Profile

- Public Profile เห็นเฉพาะ Sale และ Show (post-centric grid — viewer ต้องไม่เห็น `post`/`Hide`/`Sold`; prototype `all` tab leak = defect S-14)
- Public Profile tabs: `all` / `sale` / `show`
- Public Profile grid tile → Post Viewer (`pfp` mode)
- Viewer `...` menu บน profile head: Report, Block, About this account, Copy profile URL, Share this profile
- ไม่มี asset-card `...` quick actions บน grid และไม่มี portfolio value หรือ private data บน public profile

### Owner Profile

- Owner Profile เห็น post/asset ของตัวเองทุก kind — tabs: `all` / `sale` / `show` / `hide` / `sold`
- Own entries: `+` composer (asset mode), portfolio icon `.pf-pfo`, empty-state CTA, `pf-menu` → Settings
- Own-post `...` menu (canonical `02_FEED`): Archive / Turn off commenting / Edit info / Mark as sold / View sale record (sold) / Pin to grid (max 3) / Delete
- ไม่มี Total Asset Value หรือตัวเลขมูลค่าบน profile head — portfolio เข้าผ่าน wallet icon เท่านั้น

Asset ที่ลบโดยเจ้าของไม่แสดงใน owner list ปกติ ส่วน asset ที่ถูก Back Office ซ่อนถาวรยังแสดงให้ owner เห็นแบบ read-only เพื่อรับรู้สถานะและประวัติ แต่ไม่รวมใน Portfolio / Asset Value (contract)

## 7. Functional Scope

### Authentication

รองรับ:

- First-run onboarding chain: splash → language → welcome → privacy notice → cookie settings → notification prompt → tracking prompt → Member Sheet `Join TukDaeng` gateway
- Sign Up (Email / Password)
- OTP Verification 6 หลัก (auto-submit)
- Profile setup step (avatar + username) หลัง OTP / social sign-up
- `Account created` state → Sign in เอง (email signup **ไม่ auto-login** — S-22)
- Sign In (Email / Password) พร้อม attempt counter `(n/5)` + 5-try lockout (contract: server lockout 15 นาที)
- Forgot Password (ส่ง reset link → generic `Check your email` sent state ไม่เปิดเผย account existence/auth method; ไม่มีหน้า Reset Password ในแอป)
- Change Password (in-app page ใน About your account > Security — S-28)
- Sign Out → session `guest` + Member Sheet gate
- Sign in / Sign up with Apple
- Sign in / Sign up with Google (social signup เข้าแอปทันทีหลัง profile step)
- Coach marks ครั้งเดียวหลัง onboarding (member version + guest version)
- Re-consent sheet `We've updated our policies` เมื่อ policy version เปลี่ยน — บังคับทุก session

Rules:

- Email / Password ต้องยืนยัน OTP
- Password อย่างน้อย 8 ตัวอักษร และต้องมีตัวเลขหรือสัญลักษณ์อย่างน้อย 1 ตัว (canonical rule เดียวทุกจุด — S-21)
- 1 Email สมัครได้ 1 บัญชีเท่านั้น
- SSO Email ไม่ต้องยืนยัน OTP และไม่มี password step — provider auto-fill name/email/photo
- Email ไม่สามารถเปลี่ยนได้หลังยืนยันแล้ว
- บัญชี SSO ไม่สามารถ Sign In ด้วย Email / Password ได้ และกลับกัน
- บัญชี Suspended / Banned ต้องเห็น account status state พร้อมเหตุผล ระยะเวลาถ้ามี และช่องทางติดต่อ Support (contract — prototype ไม่ครอบ)
- Consent เป็น implied consent — การกด Continue/Create account พร้อม legal text ถือเป็นยอมรับ Terms of Use + Privacy Policy (ไม่มี checkbox แยก); optional consent (Analytics, Personalized) = opt-in default off เปลี่ยนได้ใน Settings
- Credential ที่สมัคร persist รอด logout/restart เพื่อ sign in กลับ — Delete Account เท่านั้นที่ล้าง
- ไม่มี Confirm Password field, OTP expiry UI, Verification Success page ใน V1 (S-20)

### Feed

Feed Tabs:

- `ทั้งหมด` / All Posts: ทุกโพสต์ eligible (sale + post)
- `กำลังติดตาม` / Following: ทุกโพสต์ eligible ของ followed sellers
- `รายการโปรด` / Favorites: โพสต์ของ favorite sellers

Feed Card (flat IG-style card) รองรับ:

- Media (photo/clip) + in-card carousel
- Action row: like, comment (shared sheet), views, share (shared sheet), save (shared sheet)
- Ask Seller pill (โพสต์ `sale` เท่านั้น) + price footer
- Liked-by row → Likes sheet
- Caption + hashtag chips → Search
- `Tap for details` → Post Detail (`View full detail`)
- Owner area → Public Profile
- `...` post menu

Feed Card ไม่แสดงใน V1:

- Location (เป็น composer field ไม่ใช่ card field)
- Verified Badge
- Status Badge

Feed Actions:

- Like / Unlike (sync ทุก `.like-btn` ของโพสต์เดียวกัน)
- Comment — shared comment sheet เปิดจากทุก surface (feed card / viewer / detail) ไม่บังคับผ่าน detail (D8)
- Save → Saved sheet (collections)
- Share → shared share sheet (member-only)
- Follow / Unfollow
- Ask Seller (sale) → Chat
- `...` menu

Others-post `...` menu:

- Add / Remove from favorites (conditional)
- Not interested
- Report (full-page multi-step report stack)

Own-post `...` menu:

- Archive / Unarchive
- Turn off / on commenting
- Edit (Edit info composer)
- Mark as sold → Sale Record form
- View sale record (sold)
- Pin / Unpin to grid (max 3)
- Delete (confirm, permanent)

Not-interested feedback loop (เดิมเรียก Hide Feed Item):

- เป็น viewer-level preference — ไม่ใช่ asset status `Hide` และไม่ใช่ moderation
- ซ่อนโพสต์นั้นจาก Feed ของผู้กด + ni-card feedback พร้อม Undo และทางลัด Mute / Unfollow / Manage content preferences
- Uncomfortable card → Report / Undo
- Restore ผ่าน Settings > Content preferences > Not interested
- ไม่สร้าง Alerts feed item

Create Composer (`create` sub page):

- Entries: feed header `+` (post mode), own profile `+` / empty-state CTA (asset mode) — guest gated ทั้งคู่
- 2-step flow: media picker (photo/clip ≤10) → caption/details
- Fields: caption + hashtags, location, price (sale vs showcase), watch details, condition + box & papers, cost details (private), more options (commenting + audience), `Also save to My Assets` toggle, asset-mode visibility pick

Feed ไม่รองรับใน V1:

- Infinite scroll / pull-to-refresh / end-of-list marker
- Comment text composer (`.comment-input` dead — เพิ่ม comment ได้เฉพาะ emoji quick-react ใน V1)

### Share & Deep Links

Share V1:

- Share เป็น member-only action ทุก surface (S-03 — guest กด share เจอ Member Sheet)
- Surface = shared in-app share sheet เดียวกัน: friends grid + app row (Messenger / Direct / LINE / Facebook) + Copy link
- Share entry points: post action row (feed/viewer/detail), share profile, article share (`data-bdshare`)
- Copy link = toast `Link copied` — ไม่มี native OS share sheet ใน V1 (contract — prototype ไม่ครอบ)
- Share ไม่สร้าง Alerts feed item

Deep Link (contract — prototype ไม่ครอบเลย, canonical `00_NAV` §12):

- ทุก deep link ต้อง validate auth, permission, asset status, block relationship และ deletion state ก่อน render
- Owner เปิด deep link ของ Asset ตัวเองที่ `Hide`/`Sold` ต้องแสดง Owner-only detail; non-owner → Permission Denied / Unavailable
- Deleted asset → `รายการนี้ไม่พร้อมใช้งานแล้ว`; invalid article → Article Not Found
- Deep link entry ไม่มี navigation history → back fallback ไป Feed และ main navigation ใช้ต่อได้ทั้ง guest/member

### Search & Filter

Search รองรับ:

- Keyword Search พร้อม live suggestions (keyword rows brand/model/reference + seller rows)
- Recent Searches (≤8, session memory) — inline 4 แถว + `See all` page + `Clear all`
- Landing: popular chips + explore photo grid
- Results tabs: For you (Accounts + Posts grid) / Profiles (seller cards + Follow) / Tags (hashtag rows + `N posts`)
- Active filter chips + per-chip remove
- Hashtag จากทุก caption surface → search
- Watch Alert bell บน results head → shared WA sheet

Filter page (`sfilter`) 11 sections:

- Brand, Model (dependent ← Brand), Price range, Year, Reference, Condition, Case size, Movement, Dial color, Strap/Bracelet, Delivery contents

Filter rules:

- Chip multi-select draft pattern — edits ลง draft, `Apply (N)` commit เท่านั้น; back/ออกกลางทางทิ้ง draft
- Price range = typed inputs + validation (ไม่มี slider)
- ทุก option แสดง `(N)` = จำนวน sale listing ที่เห็น; `(0)` เลือกได้ (no current listing ≠ inactive market data)
- `Clear all` ล้าง draft ไม่ commit

Search Result แสดงเฉพาะ Asset `Sale` (contract — pfkind leak เป็น defect); ไม่มี Sort UI, result count, pull-to-refresh, infinite scroll

### Post Detail & Post Viewer (เดิม: Asset & Asset Detail)

Post Detail (`.page-detail`) คือ asset-detail equivalent เดียวของ V1 — ไม่มี Asset Detail page แยก (canonical `00_NAV` §6.1)

Post Detail รองรับ:

- Hero media carousel (+ clip UI)
- Action row: like / comment / views / share + `mf-btn` (Watch Alert `Follow this model`) + `wl-btn` (Wish List)
- Sale tag, name/ref, Descriptions, spec groups, `Price & Data Source`
- `...` own/others post menu (canonical 02_FEED)

Post Detail ไม่มีใน V1:

- Owner/contact block, Follow button, Ask Seller (chat entry อยู่ที่ Ask Seller pill บน feed card/viewer เท่านั้น)
- Save (bookmark) button, Full Screen Image Viewer
- Inline comment section หรือ per-comment `...` (comments อยู่ใน shared sheet เท่านั้น)
- Private data ใด ๆ (purchase cost, sold history, portfolio value — อยู่ `pfasset:`/`sold:`/`portfolio` เท่านั้น)

Visibility:

- Viewer เปิด detail ได้เฉพาะโพสต์ที่ visible ผ่าน entry นั้น (feed = sale+post, public profile = sale+show)
- Owner เปิด detail ของตัวเองได้ทุกสถานะรวม hide/sold ผ่าน own profile tabs
- Guest เปิด detail + อ่าน specs/comments ได้เสรี; actions ทุกตัว gated → Member Sheet

Contact / Chat rules:

- การติดต่อผู้ขาย (Ask Seller) มีเฉพาะโพสต์ `Sale` — Chat entry = listing-scoped เท่านั้น (D20)
- ไม่มี chat จาก profile (`pf-msg` dead), follower row หรือ Post Detail

Post Detail Price Analytics (locked decision — คงเดิม):

- Market Comparison และ Expected Profit ไม่แสดงใน Post Detail (product decision: ไม่เพิ่ม)
- Analytics ทั้งสองอยู่ใน Portfolio (`pfasset` Value card / Listing card) เท่านั้น
- สูตรและ permission ของ analytics ทั้งสองอยู่ใน Portfolio Module (canonical `14_PORTFOLIO_MODULE.md` §9)

Owner ไม่เห็นปุ่ม Follow ตัวเอง

### Asset Management

Add / Edit Asset ใช้ **composer asset mode** (drawer-first) — ไม่มี multi-step listing form แยกใน V1:

- Entries: own-profile `+` icon + `all`-tab empty-state CTA
- Shared composer mechanics (picker/caption/panes) canonical `02_FEED`; asset-mode deltas + drawer linkage canonical `04_ASSET_MANAGEMENT`
- Visibility pick ตอนสร้าง: `Show` / `Hide` / `Post to feed` (= `Sale`)
- `Also save to My Assets` toggle บน post mode → drawer record
- `Cost details (private)` row: purchase price + purchase date — owner-private, ใช้เป็น cost basis ของ Portfolio

Asset data model:

- Drawer record (`PF_ASSETS`) + `assetId` link + `pfkind` status mirror บนโพสต์
- Fields: photos (≤10), brand, model/series, reference, meta, asking price (optional), purchase/bought (private), status
- `asking` optional ทุก status — โพสต์ไม่มี price = showcase (ไม่มี `Price on request` label ใน V1)
- ไม่มี Market Data autocomplete / relation id / option-master `ระบุเอง` ใน V1 — fields เป็น free-text (contract/future เท่านั้น)
- ไม่มี provenance / consignment entity (S-25)

Status transitions:

- ตั้งตอนสร้างด้วย visibility pick
- เปลี่ยนผ่าน Edit info `Profile status` pick (`stt-opt`) — Sale / Show / Hide เท่านั้น
- `post` ↔ drawer detach/link
- `Sold` ผ่าน Mark as Sold เท่านั้น — ไม่มี Sold ใน status pick
- ไม่มี Change Status sheet แยกหรือ confirmation `Add this asset?`/`Save sale history?` ใน V1

Mark as Sold:

- Entries: own-post menu + portfolio asset detail (`pfasset`)
- ใช้ได้กับ asset สถานะ Sale, Show, Hide (D4 — drawer asset ที่ไม่ได้ลงขายก็บันทึกการขายได้)
- Sale Record form: `Sale price` (required, prefill asking, live Expected gain) + `Sale date` (required, default/max = วันนี้) **เท่านั้น**
- Transition: ย้าย asset → sold list + โพสต์ที่ link → `sold` + landing `sold:{id}` + toast

Sold Asset:

- ไม่สามารถ Edit ข้อมูลหลัก
- เปิดดู Sale Record / Sold History ได้ (owner-only)
- ไม่สามารถ Delete จาก own-post menu ปกติ

ลบ Asset โดยเจ้าของ:

- Owner ลบ post/asset ที่ไม่ใช่ Sold และไม่ถูก Back Office ซ่อนถาวรได้ตาม policy ของ V1
- หลังลบแล้ว Asset หายจาก owner list ปกติและ public surfaces ทั้งหมด
- Chat ที่เกี่ยวข้องยังอยู่ แต่ Reference Asset ต้องแสดง unavailable/deleted state (contract — prototype: snapshot card นิ่ง + toast)
- Backend/BO ควรเก็บ record ตาม retention policy เพื่อ audit, report history, dispute หรือ compliance
- การลบนี้ไม่ใช่ hard delete ทันที เว้นแต่นโยบายระบบระบุไว้ต่างหาก

Back Office ซ่อนถาวร (contract — prototype ไม่ครอบ):

- ใช้แทน action เดิมที่เรียก "ลบ/เก็บถาวร" ใน moderation flow ปกติ
- หายจาก Feed, Search, Watch Alert, Public Profile และ public deep link
- Owner ยังเห็นได้แบบ read-only พร้อมสถานะ `ถูกซ่อนถาวรโดยผู้ดูแล`
- Owner ไม่สามารถ Edit, Change Status, Publish ใหม่, Mark as Sold, Boost หรือ Delete เองได้
- ไม่ถูกนำไปรวมใน Portfolio / Asset Value
- Restore ใน moderation flow ปกติรองรับเฉพาะซ่อนชั่วคราว ไม่รองรับซ่อนถาวร
- การลบข้อมูลจริงถือเป็นกรณีพิเศษตามนโยบายระบบ ไม่ใช่ action ปกติใน Asset Management

### Chat

Chat ใช้สำหรับการสนทนาระหว่างผู้ซื้อและเจ้าของ listing — member-only surface (ทุก entry อยู่ใน guest gate)

Rules:

- Thread ผูกคู่ **user + item (listing)** เสมอ — ทัก seller เดิมแต่คนละโพสต์ = ห้องใหม่พร้อม post reference card ของโพสต์นั้น (ไม่มี room merge, ไม่มี user→user chat เปล่า ๆ)
- สร้างห้องจริงเมื่อส่งข้อความแรก — Ask สร้าง draft room (`C.draft`) ก่อน; draft prefill Quick Ask text และมีได้ทีละ 1 ห้อง
- Post reference card = snapshot นิ่ง (รูป + owner + caption + price) — โพสต์แก้/ขาย/ลบภายหลังไม่เปลี่ยนการ์ด
- Asset Deleted/Sold แล้ว Chat ยังอยู่ใช้งานได้ (tap การ์ด post ที่หาย → toast/unavailable contract)
- Chat entry = listing-scoped เท่านั้น (Ask Seller pill บน sale post) — ไม่มี chat จาก profile/follower row
- Ask ไป own listing → guard `This is your own listing`; seller ที่ block อยู่ → `Cannot message a blocked account`
- Search Chat รองรับ (list + in-room search mode)
- Block / Report ผ่าน shared surfaces — block จาก chat ใช้ `blkSheet` fromChat variant; report ข้าม `report:pick` → `report:user` ตรง + `Report and delete` path
- หลัง Block แล้ว Chat history เดิมยังอ่านได้แบบ read-only (`ch-blocked-bar` + `Unblock`)
- หลัง Block แล้วไม่สามารถส่งข้อความใหม่หรือสร้าง Chat ใหม่ระหว่างคู่ที่ Block กัน

Chat Center:

- Chats view (เรียงตามคู่สนทนา — pinned-first, unread badge, search) + Items view (`Your listings` / `Items you asked about` + filter popover)
- `chatitem:{itemId}` — item chats page
- Swipe actions บน row: Pin / Mute / Hide / Delete (iOS confirm modals)
- `chatcfg` — toggles + default view + Quick Ask text

Chat Room รองรับ:

- Text + Image (attach sheet → media message) — **ไม่มี File, Asset Card หรือ Offer card type ใน V1**
- Post reference card ในสายข้อความ → Post Detail
- Draft persist ระหว่าง navigate, `Sent`/`Read` state
- Room menu (`chmenu`): 4 circular actions + media strip + `Listings & Items`
- Media gallery (`chmedia`) + select mode + Trash/Download
- Hide/Delete chat พร้อม Confirmation (`Are you sure you want to delete this chat?` / `Hiding chats doesn't delete their messages.`)

Delete/Hide Chat V1:

- Hide = ซ่อนห้องจาก list เฉพาะฝั่งผู้กด ไม่ลบ message
- Delete = ลบห้องฝั่งผู้กด ไม่ลบ message/archive ฝั่ง server และไม่กระทบคู่สนทนา
- ไม่มี restore UI ใน V1

ไม่มีใน V1: Offer ทั้งชุด (ถอดแล้ว), File message, typing indicator, real read receipts, E2E encryption (footer claim เป็น dead copy ไม่เขียน spec — S-18), room settings page (`chsettings` dead route), voice/group/edit/reaction/pinned message

### Social

Like:

- User สามารถ Like post ได้ทุก surface (feed card / Post Detail / Post Viewer rail / pfp card) — sync ทุก `.like-btn` ของโพสต์เดียวกัน
- Owner สามารถ Like โพสต์ตัวเองได้
- Like count = private แบบ IG — เฉพาะโพสต์ตัวเองที่แสดง `lk-n` count บนปุ่ม (S-26); Likes sheet แสดง liker list + privacy note
- Liked posts ไป list `Interested` (Settings > Content preferences) — **ไม่ใช่** Favorites (D7)
- หาก like count หรือ comment count = 0 สามารถแสดง icon อย่างเดียวโดยไม่แสดงเลข 0 ได้

Comment:

- รองรับ IG-style one-level replies ใต้ comment หลัก
- ไม่รองรับ multi-level nested thread หรือ reply ซ้อนเกิน 1 ชั้น
- ไม่มี Edit Comment ใน V1
- Comment sheet (`commentsHTML`) เปิดได้จากทุก surface ไม่บังคับผ่าน detail (D8)
- Comment text composer ยังไม่ implement — เพิ่ม comment ได้เฉพาะ emoji quick-react (push comment ของตัวเอง)
- Long-press (450ms) บน comment เปิด popover: own → `Delete` (confirm + cascade replies); คนอื่น → `Block` + `Report` → report stack
- ไม่มี `...` บน comment และไม่มี Hide comment; report ไม่ทำให้ comment หายทันที

Follow:

- Follow / Unfollow ระดับ account (`setFollowing` propagate ทุก surface)
- Unfollow ล้าง favorite + muted ของ account นั้น
- Entries: `.follow-btn` (post-head/detail/viewer foot/sheets), `pfp-follow` head pill, search seller card, profile surfaces, alerts `Follow back`, `lk-follow` (cosmetic — deviation)
- Following Feed แสดงทุกโพสต์ eligible ของ followed sellers (ไม่จำกัด sale)
- Favorites = account-level favorite sellers — feed tab + manage ผ่าน Settings > What you see

Saved / Wish List:

- Saved: `save-btn` → save sheet (Saved + collections + New collection) + hub `saved`/`savedcol` + collection CRUD + select/move/unsave
- Wish List: `wl-btn` (Post Detail only) → wl sheet + hub `wishlist`/`wishcol` — ระบบแยกจาก Saved สมบูรณ์

Social actions ไม่สร้าง Alerts feed item ใน session (ALERTS seed-only — contract `09_NOTIFICATION` §14)

### Watch Alert

Rules:

- Match เฉพาะ Asset `Sale` (contract)
- Shared Watch Alert sheet เดียวกัน — 3 entries: `sr-wa` (search results), `mf-btn` `Follow this model` (Post Detail), Edit บน `walerts` row
- Alert Name auto-name เสมอ — ไม่มี required validation block (S-11)
- Criteria = snapshot จาก source ตอนสร้าง — edit ได้เฉพาะ name + match mode (3 modes); เปลี่ยน criteria = สร้างใหม่
- Dedupe: signature + mode ตอน save; bell `on` state sync ตาม modelKey
- Match เฉพาะ public fields (asking price) — ไม่ใช้ private data

Management (`walerts` page — เข้าผ่าน Settings > Your library เท่านั้น):

- แสดงรายการ Watch Alert ทั้งหมดพร้อมชื่อ, criteria text, mode badge, live `N now` count
- Pause / Resume ต่อ Alert (`wa-tgl`)
- Delete Alert = instant ไม่มี confirm (S-11)
- Empty state: `No watch alerts yet — tap the bell on a post or save a search to start one`

Notification:

- `watch` row ใน Alerts feed → Post Viewer ของ post ที่ match โดยตรง ไม่มี Result List
- Match feedback ตอน publish โพสต์ใหม่ = toast simulation `Watch alert matched: {name}`

### Notification (Alerts feed)

Alerts feed รองรับ notification types:

- Like
- Comment
- Follow
- Watch Alert
- System (security — `A new device just logged in...`; placeholder destination ใน V1)

Alerts feed ไม่รองรับใน Front Office V1:

- Chat / New Message ไม่เป็น alert type และแจ้งเตือนเฉพาะในเมนู Chat ด้วย unread badge/count (Σunread cap `99+`)
- Moderation / Account Action
- Market Update
- Price / Valuation
- Sale Success

Feed structure:

- แบ่ง section ตาม age bucket (Today / Yesterday / Last 7 days / Earlier)
- `Mark all as read` บน section แรก; row unread → read เมื่อเปิด; nav badge sync
- Follow row มี dismiss `x` + inline `Follow back` / `Following`

Destination:

| Notification | Destination |
| --- | --- |
| Watch Alert | Post Viewer — post ที่ match โดยตรง (ไม่มี Result List) |
| Like | Post Viewer — โพสต์ของตัวเอง 1 ใบ |
| Comment | Post Viewer — โพสต์ของตัวเอง 1 ใบ (ไม่ focus/deep-scroll comment) |
| Follow | Public Profile — `profile:{user}` |
| System | placeholder — ไม่มี destination ใน V1 |

Post ที่ destination ชี้ถึงถูกลบ → toast `This post is no longer available` (contract: unavailable state)

### Profile

Owner Profile:

- Profile Image, Name, bio, Followers, Following counts
- Own entries: `+` composer (asset mode), `.pf-pfo` portfolio icon, empty-state CTA, `pf-menu` → Settings
- Edit Profile (`pedit`) — entry จาก own profile เท่านั้น (ไม่มีบน Settings Home — S-05)
- QR profile share overlay (own) — themes / camera scan / share / copy / download
- Grid tabs: `all` / `sale` / `show` / `hide` / `sold` (post-centric `pfkind` grid) + pin ordering (max 3)
- **ไม่มี Total Asset Value หรือตัวเลขมูลค่าใด ๆ บน profile head** — portfolio เข้าผ่าน wallet icon เท่านั้น

Public Profile:

- Profile Image, Name, Followers, Following (follower/following lists เปิดได้ read-only)
- Follow / Unfollow (+ unfollow confirm sheet)
- `...` menu: Report, Block, About this account, Copy profile URL, Share this profile
- Grid tabs: `all` / `sale` / `show` — viewer เห็นเฉพาะ `Sale` + `Show` (prototype `all` leak = defect)
- About this account page (`about:{u}`)
- Blocked variant = IG keep-page (masked stats + empty grid + `Unblock` — S-13; ไม่ใช่ unavailable page)

Public Profile ต้องไม่แสดง:

- Hide, Sold, `post`
- ข้อมูล Purchase Information (Purchase Price, Purchase Date), Sold History, Portfolio value และ private asset data อื่น

### Portfolio

Portfolio เป็น Private และเห็นเฉพาะ Owner — entry เดียวคือ wallet icon `.pf-pfo` บน own profile (ไม่มีตัวเลข/headline บน profile)

Portfolio dashboard:

- Headline = `ต้นทุนรวม` / **Total invested** = Σ `purchase` (cost basis) ของ eligible assets + `ส่วนตัว`/`Private` tag (D2 sign-off — **ไม่ใช่** Total Asset Value = Σ current value)
- `มูลค่าตลาด` / Market value line แสดงเมื่อมี asset ที่คำนวณ G/L ได้อย่างน้อย 1 รายการ (มิฉะนั้น `Market value unavailable`)
- Coverage note `ต้นทุนซื้อของ N/M รายการ` + `รายการนาฬิกา` rows (แสดง purchase value) + `ประวัติการขาย` / Sold history link
- Foot note กล่าวถึง consignment (`สินค้าฝากขาย`) — **copy-only ไม่มี implementation** (D12)

Portfolio คำนวณจาก (eligible = `pfoEligible`):

- Sale
- Show
- Hide
- `own !== false` (consignment flag — copy+flag เท่านั้น ไม่มี UI/seed จริง)

Portfolio ไม่รวม:

- Sold
- ลบโดยเจ้าของ
- ซ่อนถาวรจาก Back Office
- Consignment items (`own === false`)

Portfolio valuation baseline (canonical `14_PORTFOLIO_MODULE.md` §9):

- Current Value ใช้ลำดับแหล่งข้อมูล: Watch Price API market price (`market` field — prototype เป็น mock + `TukDaeng Market Data` label) → Purchase Price fallback → No Valuation
- หากไม่มี market price หรือ purchase price ให้แสดง `ไม่มีราคาตลาด` / `No market price` และไม่รวมใน market value
- Unrealized Gain/Loss คำนวณเฉพาะ Asset ที่มี market price และ purchase price — = Current Value − Purchase Price; % = G/L / Purchase × 100
- Expected Profit (sale Listing card) = Asking − Purchase; % = / Purchase × 100 — ต้องมีทั้ง asking และ purchase
- Market Comparison = (Asking − Market) / Market × 100 — Above > +1%, Below < −1%, At ระหว่าง ±1% (dead band); ไม่มี market → `none`
- Holding Period: asset ที่ยังไม่ขาย = Today − Purchase Date; sold = Sale Date − Purchase Date (`Yy Mm` human form)
- Realized Gain/Loss = Sale Price − Purchase Price; % = / Purchase × 100; ขาดค่า → `—`

**ไม่มีใน V1 (ตัดตาม prototype/user feedback — D5 sign-off):**

- Top Brand Holdings (top-3 brand tile)
- YTD Performance
- Portfolio benchmark / allocation / brand analytics / export
- Production denied/failed/empty states — เป็น dev-preview (`PFO_SIMS` `?dev`) เท่านั้น; production path ของ non-member → empty `ไม่พบข้อมูล`

Sold History:

- List เรียง + rows `Sold {date}` + price → sold record detail
- Sale Record เก็บ **เฉพาะ 2 fields (D3 sign-off):**
  - Sale Price (required)
  - Sale Date (required)
- **ไม่มี** Buyer / Contact / Payment Method / Attachment / Note ใน V1 (6-field contract เดิมถูกตัด — prototype ไม่มี)
- Sold detail = Sale price headline + Realized G/L + Sale record card + Return card (purchase/bought carry-over สำหรับ G/L)
- Sold ไม่รวม Total invested / market value / Unrealized G-L — แสดงแยกใน Sold History

### Board

Board เป็น Community Content / Article Area — **editorial magazine model** (S-01)

รองรับ:

- Board home (`board` — bottom-nav tab `กระดานข่าว`/`Boards`): `bd-head` (burger Categories + brand + search icon), hero featured carousel (≤5), `Latest Articles` + `View all`, row list, end note `You're all caught up` / `คุณดูครบทั้งหมดแล้ว`
- All-articles list (`boardall`) — crumb + freeform category pills + filtered list (static)
- Categories sheet (`data-bdmenu` → bottom sheet)
- Article search page (`boardsearch`) — search bar + Popular Topics + live results + empty state
- Article Detail (`boardart:{id}`) — floating nav pill (back + like/share), author meta, cover, body, tags
- Article Like (`data-bdlike` toggle) + Article Share (`data-bdshare` → shared share sheet)

Rules:

- บทความสร้างและจัดการโดย Admin ผ่าน Back Office — FO ไม่มี create/edit/delete/comment entry
- User ทั่วไปอ่าน, Like และ Share บทความได้ (member-only actions — guest เจอ Member Sheet)
- Guest อ่านบทความได้เสรี แต่ like/share/report ต้อง login (S-03 — spec เดิม "guest share ได้" ผิด)
- 7 master sections เดิม (Feature Article / Trending Now / Journal Board / Watch Brands / Watch 101 / Watch Apparel / Watch Events) **ไม่มีใน prototype** — ตัดออก; category = freeform tags ของบทความ (D1)
- ไม่มี Infinite Scroll — list นิ่ง + end note (D2)
- Article search ครอบทุกบทความเสมอ แยก surface จาก category filter (ไม่ combine)
- Article Like ต้อง Login ผ่าน Member Sheet
- Article Comment ไม่อยู่ใน FO V1 baseline
- Report Article = contract-only — report type `Board Content` + target `Article` เข้า Trust & Safety (prototype menu `data-bdmore` dead ทั้งก้อน — S-04); รายละเอียด flow canonical `15_TRUST_SAFETY` + `12_BOARD` §13
- Report Board Content ไม่ทำให้บทความหายทันทีจนกว่า Admin moderation
- Board actions ไม่สร้าง alert — Alerts feed canonical 09

ไม่มีใน V1: user create/edit article, article comment, saved article UI (`data-bdsave` dead), native share/public deep link implementation, trending algorithm, publish/deleted-state simulation

### Settings

Settings Home ใช้โครง `Settings and activity` 6 sections (S-05 — IG model):

| # | Section | Rows |
| --- | --- | --- |
| 1 | `บัญชี` / Account | About your account |
| 2 | `คลังของคุณ` / Your library | Saved, Wish List, Archive, Watch Alerts (count badge) |
| 3 | `สิ่งที่คุณเห็น` / What you see | Favorites, Muted accounts, Blocked (count badge), Content preferences |
| 4 | `แอปและสื่อของคุณ` / Your app and media | Language, Theme mode |
| 5 | `การแจ้งเตือน` / Notifications | Notification settings |
| 6 | `ข้อมูลเพิ่มเติมและการสนับสนุน` / More info and support | Help, Privacy & cookies (contract), Privacy Policy, Terms of Use, About |
| — | `การเข้าสู่ระบบ` / Login | `ออกจากระบบ` / Log out (danger row) |

Settings รองรับ:

- About your account — hero + account information (Date joined, Account based in) + Security (Change Password) + Account management (Delete account)
- Language: English / Thai — apply ทันทีผ่าน display layer
- Theme Mode: Dark Mode / Light Mode — apply ทันทีทั้งแอป
- Notification Settings — 4 toggles (Likes / Comments / New followers / Watch Alerts) ใน 2 groups, default ON, auto-save (S-06 — ไม่มี Offer toggle)
- Content preferences — Interested (liked posts), Not interested (restore list), Sensitive, snooze, Reset suggested content
- What you see pages — Favorites / Muted accounts / Blocked (add/remove/search/unmute/unblock)
- Privacy & cookies — Essential always-on + Analytics / Personalized toggles (contract — prototype ไม่มีหน้านี้ แต่ required โดย consent model)
- Help — support channels (LINE `@mrfoxthailand`, Phone `(+66) 80-008-8088`, Email `service@mrfox.com`, เวลาทำการ `09:00 - 22:00 (GMT+7)`) + help topics
- About app — `TUK DAENG`, tagline, version, `Mister Fox Co., Ltd.`, `Est. 2026`, Privacy Policy, Terms of Use, Contact support
- Privacy Policy / Terms of Use — in-app legal viewer (version + effective date)
- Log out — `Log out of @{user}?` confirm → session `guest` + toast + Member Sheet
- Change Password — in-app page ใน About your account > Security (S-28): 3 fields + forgot link
- Delete Account — 2-page flow (terms → reason required) + password confirmation + `Account deletion scheduled` dialog → session `guest`

Contract-only (prototype ไม่ครอบ — S-29):

- Account contact fields — Username, Phone, Line, Email Display (ไม่มี contact rows)
- SSO account visibility rules ของ Change Password
- Delete Account failure path / restore-failed support state

Delete Account V1:

- Entry = About your account > Account management > Delete account (danger row) เท่านั้น — ไม่มีบน Settings Home direct action
- 2-page flow: Step 1 terms → Step 2 reason (required) → `Confirm account deletion` password dialog → `Account deletion scheduled` dialog (วันที่ลบถาวร = request +30 วัน) → `Log out` → session `guest` + toast `Account deactivated. 30-day grace period started.`
- Soft delete + grace period 30 วัน — **login-to-restore** (S-02): sign in ภายใน grace period = ยกเลิก deletion (สอดคล้อง BO Account Deletion restore flow); เกิน grace = hard delete/anonymization ตาม policy
- Delete Account สำเร็จต้อง revoke session, clear local token และลบ credential ที่ persist
- Transaction, chat, report และ audit record ที่จำเป็นยังเก็บตาม legal/safety policy
- Failure path (contract): ถ้า Delete Account API fail ต้องไม่ sign out, ไม่ clear session และแสดง error/retry จาก context เดิม

## 8. Global State & Error Rules

### Empty State

ทุกหน้าที่ไม่มีข้อมูลใช้ข้อความเดียวกัน:

| Language | Message |
| --- | --- |
| TH | ไม่พบข้อมูล |
| EN | No data found |

Context-specific empty variants ที่ prototype ใช้จริง (`No alerts yet`, `No posts yet`, `You're all caught up`, `Article not found`, `Chat not found`, `No watch alerts yet…`) อยู่ในความรับผิดชอบของ module spec นั้น ๆ

### Login Required — Member Sheet

Guest ใช้งาน Feature ที่ต้อง Login ต้องแสดง Member Sheet `Join TukDaeng` (bottom sheet — เดิมเรียก Global Login Required Dialog):

- Title `เข้าร่วมตึกแดง`/`Join TukDaeng` + primary `สมัครสมาชิก`/`Sign up` + secondary `เข้าสู่ระบบ`/`Sign in` + tertiary `ข้ามไปก่อน`/`Skip for now` + social row (Google/Apple)
- แตะ scrim ปิดได้ ไม่จำ choice — เปิดใหม่ทุกครั้งที่ guest กด gated action
- `Don't show this again` มีเฉพาะ first-run member sheet เท่านั้น — gate mode ไม่มี

Feature ที่ต้อง Login: ตาม guest gate list ใน §3 Guest + `00_GLOBAL` §11 (รวม **Share ทุก surface** — S-03)

Feature ที่ Guest ใช้ได้โดยไม่ต้อง Login: ตาม Guest capabilities ใน §3 (browse เท่านั้น — ไม่มี action ใดที่เปลี่ยน state หรือผูกตัวตน)

### Deleted Asset

เมื่อ Asset ถูกลบ:

- Asset ต้องหายจาก Feed, Search, Watch Alert และ Public Profile
- Post Detail ต้องแสดงว่า `รายการนี้ไม่พร้อมใช้งานแล้ว` (contract — prototype แสดง toast `This post is no longer available` + empty states)
- Chat ยังอยู่ (post reference card เป็น snapshot นิ่ง)

### Re-consent Decline

เมื่อ re-consent sheet ถูก Decline:

- แสดง inline banner ว่าต้องยอมรับ required จึงจะใช้งานต่อได้
- ทางเลือกเดียวคือ `Sign out` (member/new) หรือ `Exit app` — ไม่มี path ใช้งานต่อโดยไม่ยอมรับ

### Feed Error

หากโหลด Feed ไม่สำเร็จ (contract — prototype ไม่มี feed error path):

- แสดง Error State
- แสดงปุ่ม `ลองใหม่`

### Offline / Cached Data

ระบบต้องรองรับการแสดงข้อมูลล่าสุดที่โหลดไว้เมื่ออินเทอร์เน็ตขาดหาย อย่างน้อยสำหรับ Feed (contract — prototype ไม่ครอบ)

## 9. Lifecycle Rules

### Asset Lifecycle

| Transition | Required Impact |
| --- | --- |
| `Sale` -> `Sold` | หายจาก Feed, Following, Favorites, Search, Watch Alert ทันที; Chat ยังอยู่; Owner เห็นใน Owner Profile + Sold History |
| `Sale` -> `Hide` | หายจาก Feed, Following, Favorites, Search, Watch Alert ทันที; Owner ยังเห็นใน Owner Profile |
| `Hide` -> `Sale` | กลับเข้า Feed, Search, Watch Alert และกลับเข้า Following/Favorites ตามเงื่อนไข |
| `Show` -> `Sale` | แสดงใน Feed, Search และ Match Watch Alert; ยังคงแสดงใน Public Profile |
| `Sale` -> `Show` | หายจาก Feed, Search, Watch Alert แต่ยังแสดงใน Public Profile |
| Deleted | หายจาก public surfaces และ Detail แสดง unavailable state |
| `post` -> ผูก asset `Sale` | เข้า/อยู่ใน Feed เหมือน sale post และปรากฏใน Public Profile |
| Asset-linked post -> `post` (แยกออกจาก asset) | ยังอยู่ใน Feed แต่หลุดจาก Search/Watch Alert matching และ Public Profile |

### Account & Session Lifecycle

| Transition | Required Impact |
| --- | --- |
| Sign Up (email/social) สำเร็จ | session `new` — member powers แต่ข้อมูลว่าง |
| Sign In | session `member` (บัญชีเดิม) หรือ `new` (บัญชีที่สมัครในเครื่อง) |
| Sign Out | session `guest` — เคลียร์ข้อมูลส่วนตัวจากทุก surface |
| Delete Account | soft delete → grace period 30 วัน → session `guest`; sign in ระหว่าง grace = restore (login-to-restore, S-02); เกิน grace = hard delete/anonymization (contract) |
| Suspended / Banned | revoke session + account status state (contract — prototype ไม่ครอบ) |
| Policy version เปลี่ยน | ทุก session ต้องผ่าน re-consent sheet ก่อนใช้งานต่อ |

## 10. Trust & Safety

### Block User

เมื่อ User Block ผู้ใช้อีกคน:

- Asset ของผู้ถูก Block ต้องหายจาก Feed ทันที
- Asset ของผู้ถูก Block ต้องหายจาก Search ทันที
- Asset ของผู้ถูก Block ต้องหยุดถูก match ใน Watch Alert ทันที
- ความสัมพันธ์ Follow ระหว่างกันต้องไม่ถูกใช้ในการแสดง Following Feed — block บังคับ unfollow ทั้งสองทิศ + ล้าง favorite/muted ของคู่นั้น
- Chat history เดิมระหว่างคู่ที่ Block กันยังอ่านได้แบบ read-only
- ผู้ใช้ที่ Block กันไม่สามารถส่งข้อความใหม่หรือสร้าง Chat ใหม่ระหว่างกันได้
- Blocked profile = IG keep-page — profile แสดงปกติแต่ grid ว่าง (`No posts yet`) + ปุ่ม `Unblock` แทน Follow (S-13)

Block confirm = IG bottom sheet `Block {user}?` + impact rows (canonical `06_PROFILE` / `15_TRUST_SAFETY`)

### Report

ระบบต้องรองรับ Report:

- Asset (post)
- User
- Comment
- Board Content (contract-only — prototype `data-bdmore` menu dead)

Report flow = IG-style full-page multi-step stack (reasons → report:done + other steps) — ไม่ใช่ bottom sheet (D9)

Report ไม่ทำให้ Asset หรือ Content หายจาก public surfaces ทันที — Asset หรือ Content จะหายเมื่อ Admin ดำเนินการตาม Moderation เท่านั้น (24h review SLA)

### Apple Compliance

ระบบต้องรองรับ:

- Report
- Block
- Terms of Use
- Privacy Policy
- Moderation Flow

## 11. Data Privacy Rules

ข้อมูลต่อไปนี้เป็น Private และเห็นเฉพาะ Owner หรือ Admin ตามสิทธิ์:

- Purchase Price
- Purchase Date
- Sold History / Sale Record
- Portfolio Value Detail (Total invested, market value, G/L, expected profit, market comparison)

ข้อมูล Purchase Information และเอกสารส่วนตัวต้องไม่ Public

Public Profile, Feed, Search, Watch Alert, Post Detail และ Post Viewer ต้องไม่แสดง private data เหล่านี้ — portfolio value ไม่มี headline หรือตัวเลขบน public surfaces เลย (entry = icon บน own profile เท่านั้น)

Like count เป็น private แบบ IG — เฉพาะโพสต์ตัวเองที่แสดง count (S-26)

## 12. Non-Functional Requirements

### Performance

- Feed ควรโหลดภายใน 2 วินาที
- รูปภาพต้อง Lazy Load
- Feed render list ครั้งเดียว — **ไม่มี infinite scroll / pull-to-refresh / end-of-list marker ใน V1** (ตัดตาม prototype; Board ใช้ static list + `You're all caught up` end note)

### Security

- ทุก API ใช้ HTTPS
- ใช้ Token-based Authentication
- Private Asset Data ต้องตรวจสิทธิ์ทุกครั้ง
- Admin Action ต้องมี Audit Trail ใน Back Office
- Deep link / notification destination ต้อง validate auth, permission, deletion, block และ asset status (contract)

### Localization

- รองรับภาษาไทยและอังกฤษ
- ราคาแสดงเป็น THB
- Empty State ใช้ข้อความกลางตามที่กำหนด

### Accessibility

- Font size รองรับการปรับตามระบบ
- รองรับ Screen Reader ตามความเหมาะสมของ Mobile Platform

## 13. Integrations

| Integration | Purpose |
| --- | --- |
| Apple Sign In | Sign In / Sign Up ด้วย Apple ID |
| Google OAuth | Sign In / Sign Up ด้วย Google Account |
| Firebase Cloud Messaging | Push Notifications |
| Image Storage / CDN | จัดเก็บและแสดงรูปภาพ |
| Watch Price API | ดึงข้อมูลราคาตลาดสำหรับ Portfolio valuation (contract — prototype ใช้ `market` mock field + fixed updated date) |
| Payment Gateway | Phase 2 เท่านั้น |

## 14. Phase 1 Exclusions

ไม่รวมใน Phase 1:

- ระบบชำระเงินออนไลน์ในแอป
- Offer / price negotiation system (ถอดออกจาก baseline แล้ว — ไม่มี Offer entity, card, notification หรือ Accept/Reject flow)
- Video Upload (composer รองรับ clip playback เท่านั้น — ไม่มี video upload pipeline)
- Live Streaming
- Watch Authentication Service ในแอป
- Watch Shops
- Accessories Shop
- Repair Shop
- Auction Center
- Consignment Center (มีเฉพาะ copy + `own` flag ใน portfolio — ไม่มี entity/flow)
- Authentication Center
- Watch Brands / Watch Price Index / Community (drawer placeholder rows เท่านั้น — กดแล้ว toast)
- Multi-level Nested Comment เกิน 1 reply level
- Edit Comment
- Comment text composer (emoji quick-react เท่านั้น)
- Verified Badge
- Status Badge บน Feed Card
- Real-time Feed Refresh สำหรับ Asset ใหม่, Like จากอุปกรณ์อื่น และ Comment จากอุปกรณ์อื่น
- Infinite scroll / pull-to-refresh / end-of-list marker บน Feed
- Search Sort UI, result count, saved search, Popular Filter context-aware
- Watch Alert Result List destination
- Native OS share sheet + real deep-link mechanism (contract เท่านั้น)
- Full Screen Image Viewer
- Inline comment section บน Post Detail
- Chat File / Asset Card message types, E2E encryption, room settings page
- Market Data autocomplete / option-master / provenance entity ใน composer
- Top Brand Holdings / YTD Performance / portfolio benchmark-export
- User-generated Board content, Article Comment, Saved Article
- `Price on request` label (price optional ทุก status — ไม่มี price = showcase)

## 15. Source Of Truth Rules

หากเอกสารเดิมมีคำหรือเงื่อนไขไม่ตรงกัน ให้ตัดสินตามลำดับ:

1. `TukDaeng_Master_Product_Definition.md` (เอกสารนี้)
2. `00_GLOBAL_RULES_MODULE.md`
3. Module PRD รายโมดูล (ที่ sync ตาม prototype แล้ว)
4. Legacy documents (`PRD.md`, `FO_Functional_PRD.md`, `Use_Cases.md` — assumption docs เก่า)

หลักการตัดสินความขัดแย้ง:

- ใช้สถานะ canonical: Sale, Show, Hide, Sold (+ kind `post` สำหรับโพสต์ไม่ผูก asset)
- ใช้ Owner / Viewer เป็น context ไม่ใช่ Role
- Session ใช้ 3 สถานะ `member` / `new` / `guest`
- Feed เป็น post-centric (โพสต์ `Sale` + `post`); Search และ Watch Alert ใช้เฉพาะ `Sale`
- Public Profile ใช้ Sale และ Show
- Owner Profile เห็นทุกสถานะ
- Hide และ Sold ต้องไม่ Public
- Guest gate ใช้ Member Sheet `Join TukDaeng` — share รวมอยู่ใน gate (ต้อง login)
- Notification types ใช้ Like, Comment, Follow, Watch Alert, System (placeholder)
- ไม่มี Payment ภายในแอปใน Phase 1
- จุดที่ prototype มี documented defect (`salePosts()` pfkind leak, public `all` tab leak) ให้ยึด spec contract ไม่ใช่พฤติกรรม defect

## 16. Sync Decision Log (FO-PRD-v1.9)

Sign-off decisions ที่ลงใน master รอบนี้ (อ้างอิง `deliverables/fo-spec-sync/FSP-005-consolidated-gap-signoff.md` + module specs ที่ sync แล้ว):

| # | Decision | ผลลัพธ์ใน master | Ref |
| --- | --- | --- | --- |
| S-01 | Board = editorial magazine model | ตัด 7 master sections → freeform category tags | `12_BOARD` |
| S-02 | Delete account grace = login-to-restore | แทน login-blocked model — สอดคล้อง BO restore flow | `13_SETTINGS` |
| S-03 | Share ต้อง login ทุก surface | guest share ถูกตัด — Member Sheet | `00_GLOBAL` §11 |
| S-04 | Report Article = contract-only | เก็บ Trust & Safety contract; prototype menu dead | `12_BOARD` §13 |
| S-05 | Settings = IG 6-section + Edit profile อยู่ own profile | แทน 5-section เดิม | `13_SETTINGS` |
| S-06 | Notification settings in-scope 4 toggles ไม่มี Offer | resolve ข้อขัดแย้งเดิม | `13_SETTINGS` |
| S-07 | Chat thread = user+item | ไม่มี room merge | `07_CHAT` |
| S-08 | WA notification → Post Viewer ตรง | ไม่มี Result List | `00_NAV` §8 |
| S-09 | Feed = post-centric | แทน Sale-only marketplace model | `00_GLOBAL` §10 |
| S-10 | `salePosts()` pfkind leak = defect | spec = Sale-only; ไม่แก้ prototype | `00_GLOBAL` §10 |
| S-11 | WA auto-name + instant delete + snapshot criteria | แทน required-name/confirm-delete/editable-criteria | `10_WATCH_ALERT` |
| S-12 | Comment composer = emoji quick-react only | text input ยังไม่ implement | `11_SOCIAL` |
| S-13 | Blocked profile = IG keep-page | แทน unavailable state | `06_PROFILE` |
| S-14 | Public `all` tab leak = defect | spec = viewer เห็น Sale+Show เท่านั้น | `06_PROFILE` |
| S-15 | Portfolio headline = Total invested (Σ purchase) | แทน Total Asset Value (Σ current) — §7 Portfolio | `14_PORTFOLIO` |
| S-16 | Guest กด feed tabs ได้ไม่ gate | guest browse-only + empty tabs | `02_FEED` |
| S-17 | `system` notification type อยู่ใน baseline | type ที่ 5 — placeholder destination | `09_NOTIFICATION` |
| S-18 | ไม่เขียน E2E/Letter Sealing เป็น feature claim | dead copy เท่านั้น | `07_CHAT` |
| S-19 | Drawer 9 items = placeholder rows | ไม่ใช่ active routes | `00_NAV` §11 |
| S-20 | ตัด spec-only auth states | ไม่มี Confirm Password / OTP expiry / Verification Success / Reset Password page | `01_AUTHENTICATION` |
| S-21 | Password rule เดียวทุกจุด: ≥8 + ตัวเลขหรือสัญลักษณ์ | canonical 00_GLOBAL §12 | `00_GLOBAL` |
| S-22 | Email signup ไม่ auto-login | `Account created` → Sign in เอง | `01_AUTHENTICATION` |
| S-23 | Recent Searches อยู่ใน V1 | session-memory ≤8 | `03_SEARCH` |
| S-24 | ไม่มี Search Sort UI | ตัด sort 5 ตัวเลือกเดิม | `03_SEARCH` |
| S-25 | ไม่มี provenance / consignment entity | ตัด step + type selection; portfolio consignment = copy-only | `04_ASSET_MGMT` / `14_PORTFOLIO` |
| S-26 | Like count = private (own post only) | IG model | `11_SOCIAL` |
| S-27 | Delete account = 2-page flow | terms → reason → password → scheduled → guest | `13_SETTINGS` |
| S-28 | Change password = in-app page | About your account > Security | `13_SETTINGS` |
| S-29 | Contract-only keep | deep link, analytics, suspended/banned, network states, HTTPS/token, unavailable refs — เก็บเป็น spec contract ระบุ "prototype ไม่ครอบ" | ทุกเล่ม |

Portfolio sign-off เพิ่มเติมจาก FSP-024 (ลงที่ §7 Portfolio):

| # | Decision | ผลลัพธ์ |
| --- | --- | --- |
| D2 | Headline = Total invested (Σ purchase) | ไม่ใช่ Total Asset Value — metric ต่างกัน; market value เป็นบรรทัดรองที่ต้องมี ≥1 GL row |
| D3 | Sale Record = Sale price + Sale date เท่านั้น | ตัด Buyer / Contact / Payment Method / Attachment / Note (6-field contract เดิม) — extended fields เป็น future |
| D5 | ตัด Top Brand Holdings + YTD Performance | ตาม user feedback (minimal dashboard) — reopen ได้ใน future |
| D12 | Consignment = copy-only | foot note + `own` flag พร้อมรองรับ แต่ไม่มี implementation/entity |
| D1/D4 | Entry = wallet icon; sellable = sale/show/hide | ไม่มีตัวเลขบน profile; Mark as sold ใช้ได้ทุก drawer asset ที่ไม่ใช่ sold |

## 17. Module PRD Checklist

ทุก Functional PRD รายโมดูลต้องมีหัวข้อต่อไปนี้:

- Purpose
- Screen Mapping
- User State
- User Flow
- Business Rules
- Permission Rules
- Validation Rules
- Exception Handling
- Empty State
- Notification Rules
- Analytics Events
- Acceptance Criteria
- Related Modules
- Future Enhancement

Acceptance Criteria ต้องเขียนให้ QA ทดสอบได้โดยไม่ต้องตีความเพิ่ม
