# FSP-002b — Gap Inventory: Create / Saved / Wishlist / Watch Alert / Social sheets

วันที่สแกน: 21 ต.ค. 2026
Source of truth: `Prototypes/fo-flow/index.html` (read-only — save/wl sheets ~13685–13735, nc sheet ~15513–15528, Saved hub ~14956–15175, Wishlist hub ~15176–15549, Archive ~14964–14982, WA engine+sheet+list ~16109–16279, composer ~15529–16100 + openPostEdit ~15992–16065, settings library rows ~17159–17186 + notif settings ~17350–17360, salePosts ~14218, composer handlers ~20155–20463, WA handlers ~21899–22013, saved/wl handlers ~22068–22546, like ~22623–22640, share ~22046–22067, lk-follow ~22040–22044, sell→pfkind ~17146–17148, guest gate ~22996–23006)
เทียบกับ: `FrontOffice/10_WATCH_ALERT_MODULE.md` + `FrontOffice/11_SOCIAL_MODULE.md` (+ note กระทบ `04_ASSET_MANAGEMENT_MODULE.md` สำหรับ Add Asset)

**Note ขอบเขต:** spec 10/11 ไม่มี Saved/Wishlist/Collections/Composer เลย — ของเหล่านั้นทั้งหมดจึงเป็น prototype-only ที่ต้องเขียน spec เพิ่ม (หรือตัดสินใจตัด) ส่วน social actions (like/comment/follow/share) ที่ซ้ำกับ FSP-002a จะสรุปสั้นและอ้างกลับ

---

## A. Prototype มี แต่ Spec 10/11 ไม่มี (→ ต้องเพิ่มใน spec ตอน FSP-021/022 + note 015b/017)

### A1. Create composer = IG 2-step task flow (picker → caption/details)
- Entries: feed header `+` (`data-flow="create"` → post mode) และ own profile `+` / ปุ่ม "Add asset" (`data-mode="asset"` → asset mode) — guest โดน gate เพราะ `[data-flow]` อยู่ใน GUEST_GATE_SEL
- Step 1 picker: hero preview + Recents grid (CP_MEDIA ผสมรูป+clip), camera tile / Recents dropdown / expand = dead → toast; Select หลายรูปพร้อมเลขลำดับ, Next ปิดจนกว่าจะเลือก, clip เดี่ยวเล่น preview พร้อม countdown ได้, max 10 media (toast `You can add up to 10 photos or clips`)
- Step 2: caption contenteditable + hashtag chips 10 อัน (กดแทรกลง caption), rows: Add location (suggestions + ระยะ km), Add price (digits + auto-comma, เว้นว่าง = showcase), Watch details (CF_SPECS ~22 ช่อง free-text + Description textarea), Condition (5 ตัวเลือก + Box & papers 4 ตัวเลือก), Cost details ราคาซื้อ+วันที่ซื้อ (เฉพาะ asset mode / toggle เปิด), More options (Turn off commenting toggle + audience Everyone/Followers only)
- ปิดตอนมีของ → discard dialog IG (`เริ่มใหม่ใช่ไหม / If you go back now...`); zoom รูป/cilb preview เปิดได้
- ไม่มี required validation เลย — รูปอย่างเดียวก็ Share ได้

### A2. Post mode → social post (ไม่ใช่ asset listing)
- "Also save to My Assets" toggle **OFF ตาม default** (คอมเมนต์ในโค้ดยืนยัน feed = general posts, drawer = opt-in) → `pfkind:"post"` นั่งอยู่แท็บ "ทั้งหมด" อย่างเดียว
- Share → `insertNewPost` แทรกบนสุดของ feed + toast (`Posted · shared to feed ✓` / `Clip shared to feed ✓` / `Posted · shared to feed + My Assets ✓`); scrollTop 0
- audience followers/public ถูกเก็บในโพสต์แต่ feed ไม่กรองตาม audience; noComments ซ่อนปุ่ม comment ทุก surface
- โพสต์ใหม่เข้า specGroups ตาม CF_SPECS + "Price & Data Source" auto band (estimated ±5–6%, Data Source "TukDaeng Market Data") เมื่อกรอก details — ราคาที่ไม่กรอก render N/A

### A3. Asset mode ("Add Asset") = drawer-first ไม่ใช่ listing form
- จาก profile `+`/`Add asset` เท่านั้น; title `เพิ่มสินทรัพย์ใหม่/Add Asset`; ปุ่มล่าง = `Add Asset` (ไม่ใช่ Share)
- Visibility pick 3 ทาง: **Show** (default — ลงลิ้นชัก โชว์บนโปรไฟล์) / **Hide** (ลิ้นชักส่วนตัว) / **Post to feed** (ลิ้นชัก + โพสต์ feed เป็น `pfkind:"sale"`) — Show/Hide ลง `PF_MINE` อย่างเดียว **ไม่เข้า feed**
- ทุกเส้นทางสร้าง portfolio drawer record (`cfToPortfolio` สถานะตาม vis) + link `assetId` กลับ post; จบแล้วกลับ own profile grid + toast (ไม่ใช่ asset detail)
- ปิด composer จาก asset mode กลับ profile ไม่ใช่ feed; ไม่มี provenance/consignment step, ไม่มี confirm `Add this asset?`, ไม่มี `Adding...` state, ไม่มี required fields (ดู C11–C13 ฝั่ง spec 04)

### A4. Edit info mode (composer เดียวกัน prefilled)
- `openPostEdit` จาก own-post menu → step 2 เลย, title `แก้ไขข้อมูล/Edit info`, Cancel/Done, discard dialog `ทิ้งการแก้ไข?`
- เพิ่ม media ได้ผ่าน `+` tile (รวม ≤10, ต้องเหลือ ≥1: toast `Post needs at least 1 photo or clip`)
- toggle "Also save to My Assets" สะท้อน drawer membership จริง; เปิดแล้วมี **Profile status** pick ขาย/โชว์/ซ่อน (pfkind); โพสต์ sold → toggle locked ON (อยู่ Sold history)
- Done → `applyPostEdit` sync caption/price/specs/location/audience/noComments + link/unlink `assetId` + ย้าย pfkind; ปิดแล้วคืน surface เดิม (detail reopen / pv-over / profile / feed)

### A5. Save sheet + Saved hub (Settings > Saved) — IG Saved เต็มระบบ
- `save-btn` (feed card / pv rail / detail) → auto-save เข้า `Saved` ทันที + เปิด sheet: แถว **Saved (Private)** + section **Collections** + `New collection`; แตะแถว Saved ซ้ำ = unsave; แตะ collection = ย้ายเข้า/ออกคอลเลกชันนั้น (check ตำแหน่งปัจจุบัน)
- Saved page: head `บันทึกแล้ว/Saved` + search + `+`; tabs **ทั้งหมด / คอลเลกชัน / โพสต์**; all = collections section (≤4 + ดูทั้งหมด) + โพสต์ทั้งหมด + ปุ่ม จัดการ; collections = grid การ์ดใหญ่; posts = grid ล้วน
- savedcol page: ชื่อคอล + จำนวน + search + `...` menu (Add to collection / Edit collection / Select... / Delete collection)
- Manage/select mode: head Cancel + title + Select all/Deselect all, bar ล่าง `ยกเลิกการบันทึก|ลบออก` + `เพิ่มลงในคอลเลกชัน|ย้ายไปคอลเลกชัน`; long-press tile เข้า select mode (IG)
- Move sheet: collection rows (ยกเว้นปัจจุบัน) + New collection (เปิด nc sheet preview รูป)
- nc sheet: Cancel / Next (disabled จนพิมพ์) / input maxlength 40 + counter + clear-X; variant Save + preview ตอน move; edit-name variant ใช้เปลี่ยนชื่อคอล
- Edit collection page: cover + Change cover picker (เลือกจากโพสต์ในคอล) + name (40) + Delete collection
- Confirm dialogs: `Delete collection?` (ของยัง saved), `Unsave post?` (หลุดทุกคอล), `Remove from this collection?` (ยัง saved)
- Tile เปิด post viewer feed-mode (title `Saved`); empty states TH/EN; sub-count บน settings row; search-in-saved (live filter `matchQuery`, `No saved posts match "q"`)
- ทุกคอลเลกชันเป็น **Private** label; cover = picked coverPid หรือโพสต์ล่าสุดในคอล

### A6. Wish List sheet + hub (Settings > Wish List) — mirror ของ Saved
- `wl-btn` (gift icon — **มีเฉพาะบน post detail** ไม่มีบน feed card) → auto-add เข้า `Wishlist` + เปิด wl sheet (Wish List row + WISHLISTS + New collection) — flow เดียวกับ save แต่ state แยก (`wishlisted/wlCol/wlAt/wlColAt`, `WISHLISTS`)
- Hub: tabs เดียวกัน, `รายการทั้งหมด/All items`, empty `Tap the gift icon on a model page to add it here`; col page/menu/manage/search/edit/move/delete เหมือน Saved ทุกจุด (dialogs EN hardcode: `Remove from wish list?` / `Remove from this collection?` / `Collection deleted`)
- settings row `รายการที่อยากได้/Wish List` + count

### A7. Archive page (Settings > Archive)
- own-post Archive/Unarchive (จาก 002a A3) → คลัง `คลังเก็บ/Archive` พร้อม note `Only you can see posts you've archived` + grid → Archive viewer (pv feed mode); archive ล้าง pins และหลุด feed/grid

### A8. Watch Alert shared bottom sheet (3 entries เปิด sheet เดียวกัน)
- `waSheetHTML`: title Create/Edit, name field (auto-fill `waName` จาก criteria — brand+model+ref / `"keyword"` / 2 ค่าแรก / `Any new listing`), matchMode pick 3 ค่า:
  - `all` Match all criteria / `any` Match any criteria (can get noisy) / `model` Model only (brand+model+ref เท่านั้น) — **แต่ละ mode แสดงจำนวน match ปัจจุบัน `N now`**; any/model disabled เมื่อ criteria ว่าง
- criteria ไม่ได้แก้ใน sheet — snapshot ตอนสร้าง (คอมเมนต์โค้ดยืนยัน "criteria stay out of the sheet")
- Dedupe: `waSig` (criteria+matchMode) → เปิด alert เดิม + toast `You already saved this alert` (mf-btn dedupe ด้วย `modelKey` brand|model|ref)
- Save → toast `Watch alert on` / `Watch alert updated`; Delete (เฉพาะ edit) → ลบทันทีไม่ confirm + `Watch alert removed`
- WA hit simulation: โพสต์ใหม่ตรง alert ON → toast หน่วง `Watch alert matched: X (+N more)` — ไม่มี notification item/result list

### A9. Watch Alert list (Settings > Watch Alerts)
- `walertsHTML`: desc `รับการแจ้งเตือนเมื่อมีรายการใหม่ตรงกับนาฬิกาที่คุณกำลังติดตาม`, rows = name + criteria text + `Edit` badge (เปิด sheet) + mode badge + `N matches now` + **pause/resume toggle** (`wa-tgl`, toast `Watch alert paused/on`)
- Empty: `No watch alerts yet — tap the bell on a post or save a search to start one` (มี TH)
- settings row `การแจ้งเตือนนาฬิกา/Watch Alerts` + count; notif settings มี toggle หมวด `walerts` (`When new listings match your criteria`)
- match count จาก `salePosts()` — **รวมโพสต์ที่มี price แม้ pfkind = show/hide/sold** (ดู C4)

### A10. "Follow this model" (mf-btn) = model-follow entry ที่ 2
- กระดิ่งบน post detail → `waCriteriaFromPost` ดึงทุก spec ของโพสต์เป็น criteria (รวม unmapped spec rows)
- bell on (`modelFollowing`) เมื่อมี alert ON ที่ `modelKey` เดียวกัน — sync ทุก surface ผ่าน `syncModelFlags`+`refreshMfBtns`
- โพสต์ไม่มี spec → toast `No details on this post to watch` ไม่เปิด sheet

### A11. Social extras ที่ spec 11 ไม่ครอบ (สรุป — รายละเอียดอยู่ 002a)
- Unfollow confirm sheet (`unfollow-open`) — spec ไม่กำหนด
- Likes sheet: liker list + `lk-follow` ปุ่ม Follow — **visual only** (toggle class ไม่เรียก setFollowing → สถานะติดตามจริงไม่เปลี่ยน) + note `Only {seller} can see the total number of likes` บนโพสต์คนอื่น
- Save (bookmark) เป็นระบบแยกจาก Like สมบูรณ์ — spec ไม่มี saved concept
- Share sheet = IG friends grid + app row (Messenger/Direct/LINE/Facebook/Copy link) → toast `Sent to X`/`Link copied`/`Shared to X` ไม่มี link จริง (002a A15)

---

## B. Spec 10/11 มี แต่ Prototype ไม่มี (→ ต้องตัดสินใจว่าเก็บเป็น contract หรือปรับ)

| # | ของใน spec | สถานะใน prototype |
|---|---|---|
| B1 | Watch Alert Result List + notification → Result List (AC-WA-006/007/008 + §15) | ไม่มีหน้า result list เลย — WA hit = toast หลังโพสต์ของตัวเองเท่านั้น; notification WA เปิด post viewer ตรง (ซ้ำ 001b C1/B3) |
| B2 | WA error states ทั้งชุด: not found / save failed / delete failed / result load failed + `ลองใหม่` (§13) | ไม่มี error path ของ WA เลย (memory-only ไม่มี async fail) |
| B3 | Empty state ตาม master `ไม่พบข้อมูล`/`No data found` (§4/14) | copy เฉพาะของตัวเอง: `No watch alerts yet — tap the bell on a post or save a search to start one` |
| B4 | Option criteria match ด้วย relation id + keyword criteria ครอบ free-text + backfill re-match dedup + inactive market data warning + no current listing policy (§10, AC-WA-014~018) | ไม่มีเลย — prototype เทียบ string จาก spec text (`naSpec` กรอง `N/A`) ไม่มี relation/market-data/inactive concept; 0-match นับ `0 now` ได้ปกติ (พฤติกรรมตรง no-current-listing โดยบังเอิญ) |
| B5 | Delete Comment: `...` menu + confirm copy 2 แบบ (มี/ไม่มี replies) + `This comment was removed.` + ไม่มี undo + count update (§9/10, AC-SOCIAL-008/008B) | ไม่มี comment action เลยนอกจาก like (c-like) — ไม่มี `...`, Delete, หรือ confirm ใด ๆ |
| B6 | Report Comment flow + copy `remain visible until moderation` (AC-SOCIAL-008A) | ไม่มี — comment sheet ไม่มี report entry |
| B7 | Comment composer ใช้งานจริงจาก Asset Detail (Comment Flow + Required validation) | input/emoji/Reply = dead → toast `Not in this prototype yet` (member) — surface เปิดได้แต่ส่ง comment จริงไม่ได้ |
| B8 | System share sheet primary + copy public deep link fallback + deep-link validation (§10 Share Rules) | mock sheet + toast — ไม่มี system share/deep link/validation (สอดคล้อง 001b C5, 002a A15) |
| B9 | Comment notification → Asset Detail + focus comment; Like → detail; Follow → Public Profile (§15, AC-SOCIAL-013) | ยืนยันไม่ได้ใน scope นี้ — notifications อยู่ FSP-003b; เท่าที่เห็น like/comment ไม่สร้าง notif จริง (ไม่มีอีกฝั่ง) |
| B10 | Analytics events `watch_alert_*` (10 ตัว) + `asset_liked/commented/...` `user_followed` `guest_social_login_required_shown` (§16 ทั้งสองเอกสาร) | ไม่มี tracking layer (contract-level เหมือน 001b/002a) |
| B11 | TH/EN copy ตาราง exception/validation ของ spec 10/11 | WA toasts/dialog ผสม EN hardcode (`You already saved this alert`, `Watch alert on/paused/removed`, `No details on this post to watch` — ไม่มี isTh branch); saved/wl dialogs `Unsave post?`/`Remove from this collection?`/`Collection updated`/`Added N posts` ฯลฯ ก็ EN hardcode; sheet titles Saved/Collections/Edit collection ฯลฯ EN-only หลายจุด (ส่วน hub หลักมี TH) — ไม่ตรงตาราง |
| B12 | Spec 11 Prototype Reference surfaces: comment section บน Asset Detail (owner context + comment management) | comment เป็น sheet ลอยทุก surface — detail page ไม่มี comment section ในตัว (เปิดผ่านปุ่มเหมือน feed) |

---

## C. ขัดกันโดยตรง (conflicts ต้อง sync)

| # | Spec บอก | Prototype ทำจริง | ข้อเสนอ |
|---|---|---|---|
| C1 | Create Watch Alert จาก **Search Filter เท่านั้น** (§10 Entry Point Rule + AC-WA-001; list ใช้ manage ไม่ใช่สร้าง) | 3 ทาง: `sr-wa` จาก search results + **`mf-btn` Follow this model บน post detail** + list row Edit (edit ไม่ใช่ create — ok) — **ยืนยันประเด็น FSP-002a C19** | เพิ่ม entry post-detail ใน spec 10 (recommended ตาม baseline spec-ตาม-prototype) หรือตัด mf-btn — ต้อง sign-off FSP-005 |
| C2 | Alert Name required ตอน save — ว่าง → inline validation + ไม่สร้าง + focus กลับช่อง (§10 Alert Name Rule + AC-WA-004A) | `nameIn.value.trim() || waName(criteria)` — ว่างก็ auto-name เสมอ ไม่เคย block (ซ้ำ 002a C18 ขยายมาเอกสาร 10) | เลือกข้อใดข้อหนึ่ง: เขียน spec เป็น auto-name-always (ตาม prototype) หรือเก็บ required + เพิ่ม validation ใน prototype — ต้องตัดสิน |
| C3 | Delete Alert ต้องมี confirmation + หยุด notification ทันที (§10 Delete Rule + AC-WA-011) | `wa-del` ลบทันทีใน sheet ไม่มี confirm (toast `Watch alert removed`) — sync flags ถูกทำ (หยุดจริง) | เพิ่ม confirm dialog ตาม spec หรือเขียน spec เป็น instant-delete — ต้องตัดสิน (note: ส่วนอื่นของ prototype ใช้ dlg confirm เป็นปกติ) |
| C4 | Match เฉพาะ Asset `Sale` — Show/Hide/Sold/Deleted ห้าม match (§10 Match Rule + AC-WA-005 + Lifecycle Impact) | `alertMatch`/`alertMatchCount` รันบน `salePosts()` = `price && !ni && !muted && !blocked` — **ไม่กรอง pfkind** → โพสต์ `show`/`hide`/`sold` ที่ยังมี price ถูกนับเข้า match/count (sold ยังเก็บ price หลัง sell form ~17147) | จุดนี้ขัด spec ทั้งใน WA และ search result grid (002a A11 ใช้ฟังก์ชันเดียวกัน) — ต้อง flag เป็น prototype defect หรือเขียน spec ให้ชัดว่า `sale` = priced post; เกี่ยว FSP-016/021 |
| C5 | Notification tap → **Watch Alert Result List** ห้ามเปิด Asset Detail ตรง (§10 Notification Rule + AC-WA-006) | ไม่มี result list; WA notification เปิด post viewer ตรง (001b C1); hit simulation = toast เท่านั้น | ต้องตัดสินว่าสร้าง Result List ตาม spec หรือเขียน spec เป็น open-post-direct — รวมประเด็น FSP-021 (เอกสาร 09/10) |
| C6 | Edit Alert แก้ name / **criteria** / notification toggle (§9 Edit Alert Flow + §10 Update Rule) | sheet แก้ได้แค่ name + matchMode — **criteria แก้ไม่ได้เลย** (แก้ = ลบทิ้งสร้างใหม่) | เขียน spec เป็น name+mode-only หรือเพิ่ม criteria editing — ต้องตัดสิน (matchMode เอง spec ก็ไม่มี ดู A8) |
| C7 | Like → เพิ่ม Favorites, Unlike → ลบ (§10 Like Rules + AC-SOCIAL-002/003 + Master Alignment) | like = local toggle เท่านั้น; liked posts อยู่ Settings > Content preferences > **Interested**; Favorites = account-level (favorite sellers) | ซ้ำ 002a C7 — ยืนยันจากฝั่งเอกสาร 11: ระบบ Favorites/Interested/save 3 อย่างคนละความหมาย spec ต้องเขียนแยก |
| C8 | Comment ทำได้จาก **Asset Detail เท่านั้น** (§10 + AC-SOCIAL-005 + out-of-scope "comment จาก feed") | comment sheet เปิดได้ทุก surface (feed card btn / pv rail / detail) — ซ้ำ 002a C6 | รับพฤติกรรม sheet-everywhere (แต่ note ว่า input ยัง dead — spec จะเขียน composer จริงได้ไหมค่อยตัดสิน FSP-022) |
| C9 | Feed Card แสดง **Like Count** + update ทันที (§10 Feed Social Rules) | like count **private**: แสดง `ถูกใจโดย X และคนอื่น ๆ`; ตัวเลข `lk-n` เฉพาะโพสต์ตัวเอง; own-post เห็น count | ขัดทิศ private/public — เขียน spec เป็น private-like-count ตาม prototype หรือกลับ public — ต้องตัดสิน |
| C10 | Guest **Share** public content ได้โดยไม่ต้อง login (§10 Share Rules: "Guest สามารถ Share public content ได้") | `.share-btn` อยู่ใน GUEST_GATE_SEL → guest โดน member sheet | ขัดโดยตรง — เลือกข้อใด: guest share ได้ (แกะ share ออกจาก gate list ตอน implement) หรือเขียน spec เป็น gated; like/comment/follow gate ตรง spec |
| C11 | Add Asset = multi-step: Upload → Info → **Status Sale/Show/Hide** → **Provenance step (Owner/Consignment)** → Save → `Adding...` → `Asset added.` → Owner Asset Detail (04 §9/§10 + AC-ASSET-MGMT-006D/006E/008) | composer asset mode: picker → หน้าเดียว (visibility Show/Hide/Post-to-feed) → `Add Asset` → toast → กลับ profile grid; **ไม่มี provenance/consignment เลย** | กระทบเอกสาร 04 (note FSP-017): flow/field/validation/confirmation/landing ต่างหมด — เขียน spec ตาม composer หรือ redesign ต้อง sign-off |
| C12 | Add/Edit fields = structured list + Brand/Model/Ref ใช้ **Market Data autocomplete**; Video Upload **out of scope V1** (04 §10 + §6) | fields = free-text ทั้งหมด (CF_SPECS ~22 ช่อง) ไม่มี autocomplete/market-data link; **clip ใช้ได้ทั้ง post และ asset mode** | กระทบเอกสาร 04 — spec ต้องเลือก: เขียน field set ตาม CF_SPECS + ยอม clip (ยกเลิก video out-of-scope) หรือกลับ structured form |
| C13 | Required validation `ไม่ไปขั้นตอนถัดไปหรือ Save จนกว่า required ครบ` + provenance บังคับก่อน final save (04 §10 Validation) | composer ไม่มี required เลย — รูปอย่างเดียวก็โพสต์/เพิ่ม asset ได้ | กระทบเอกสาร 04 — เขียน spec เป็น no-required-fields ตาม prototype หรือเพิ่ม validation |

---

## D. Cross-module notes (ไม่ใช่ spec 10/11 แต่เจอระหว่างสแกน)

- **FSP-015b (composer/post)**: post mode ทั้งก้อน (picker/caption/hashtags/location/audience/noComments/clip/discard) + `pfkind:"post"` semantics + "Also save to My Assets" opt-in — วัตถุดิบเขียน spec 02 composer section
- **FSP-017 (04_ASSET_MGMT)**: conflict ใหญ่สุดของ task นี้ — Add Asset จริงคือ composer asset mode (drawer-first + Post-to-feed visibility) ไม่ใช่ multi-step provenance form; ต้องตัดสินทิศก่อนเขียนเอกสาร 04 ใหม่
- **FSP-021 (10_WATCH_ALERT + 09_NOTIF)**: รับทั้ง A8–A10 + C1–C6; เพิ่มเติม: notif settings มีหมวด `walerts` toggle (เอกสาร 09 ต้องรับหมวดนี้), WA hit เป็น toast simulation ไม่ใช่ notification item จริง
- **FSP-022 (11_SOCIAL)**: scope ใหญ่สุด — Saved/Wishlist/Collections/Archive ทั้งระบบไม่มีใน spec เลย (เขียน section ใหม่หรือแยก module), like/favorites/interested 3 ระบบ, share sheet mock, comment sheet-everywhere + dead composer, `lk-follow` visual-only, guest share gate conflict
- **FSP-014 (13_SETTINGS)**: settings page มี section `คลังของคุณ/Your library` (Saved/Wish List/Archive/Watch Alerts + counts) + `สิ่งที่คุณเห็น/What you see` (Favorites/Muted/Blocked/Content preferences) — เอกสาร 13 ต้องรับ library section นี้
- **FSP-004 (13/delete account)**: delete-account copy กล่าวถึง watch alerts โดยตรง (`watch alerts จะถูกยกเลิกอัตโนมัติเมื่อเริ่มลบบัญชี` ~17275/17283) — เอกสาร lifecycle ต้อง sync
- **EN-hardcode sweep**: WA toasts + saved/wl dialogs + nc/edit-collection surfaces จำนวนมากไม่มี isTh branch — รวมกับ search EN gap ของ 002a เป็น i18n sweep (FSP-026)
- **ยืนยัน context ที่ได้รับมา**: Watch Alert 2 entries ขัด spec search-only (C1), save/wl sheets เปิดจาก feed/detail (A5/A6), composer มี post+asset 2 โหมด (A1–A3 — เดิมเคยเขียนเป็น Add Asset)
- **`lk-follow` ไม่ sync สถานะจริง**: likes sheet ปุ่ม Follow toggle class อย่างเดียวไม่เรียก `setFollowing` — จดเป็น visual-only inconsistency ให้ FSP-022
- **`salePosts()` ใช้ร่วมกัน**: search result grid + WA match/count ใช้ฟังก์ชันเดียวกัน → C4 กระทบทั้ง 03 และ 10

## E. สรุปจำนวน

- Prototype-only (ต้องเพิ่มใน spec): 11 กลุ่ม (A1–A11)
- Spec-only (ต้องตัดสินใจ): 12 รายการ (B1–B12)
- Conflicts: 13 รายการ (C1–C13) — รวม 3 จุดที่กระทบเอกสาร 04 (C11–C13)
