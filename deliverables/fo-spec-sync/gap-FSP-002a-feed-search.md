# FSP-002a — Gap Inventory: Feed / Search / Post Viewer

วันที่สแกน: 21 ต.ค. 2026
Source of truth: `Prototypes/fo-flow/index.html` (read-only — POSTS seed ~12751–13100, postCard/sheets ~13292–14177, search consts+state ~14178–14302, search/landing/recents/results ~14304–14633, filter ~14634–14685, post viewer ~14419–14586, detail ~13355–13555 + openPostDetail ~14686–14705, pm/ni/report handlers ~20465–20645 + ~17512–17570, search handlers ~21103–21273 + ~21849–22028, save/wl ~22437–22546, like/details/caption/photo ~22553–22640, guest gate ~22997–23006, feed shell ~19332–19366, prefs/favorites/muted/ni/sensitive pages ~17428–17510, wa criteria ~16124–16203)
เทียบกับ: `FrontOffice/02_FEED_MODULE.md` + `FrontOffice/03_SEARCH_FILTER_MODULE.md`

---

## A. Prototype มี แต่ Spec 02/03 ไม่มี (→ ต้องเพิ่มใน spec ตอน FSP-015a/015b/016)

### A1. Feed = social feed จริง (post-centric ไม่ใช่ asset-centric)
- `POSTS` ผสม `type:"sale"` (มี price + specGroups), `type:"showcase"` (ไม่มี price, โพสต์โชว์ของ), และ `pfkind:"post"` (โพสต์ธรรมดาจาก composer ไม่ผูก asset) — `feedContentHTML()` กรองออกแค่ `ni/muted/blocked/archived` + `pfkind` ใน `show/hide/sold` (สถานะตู้ลิ้นชัก portfolio) → feed มีโพสต์ที่ไม่ใช่ประกาศขายอยู่จริง ขัด global rule (ดู C1)
- caption + hashtags (`igCaptionHTML` render `#tag` เป็น `.igd-tag` กดแล้วเข้า search), views count, liked-by row ("ถูกใจโดย X และคนอื่น ๆ" — like count เป็น private, แสดงตัวเลขเฉพาะโพสต์ตัวเอง `lk-n`), clip (video) badge + progress bar บนรูป
- `refreshPostViews()` sync ทุก surface: feed card / pv-post / pfp-post / svf-post / detail — ยืนยัน model เป็น post ศูนย์กลาง ไม่ใช่ asset

### A2. Feed tabs semantics แบบ IG (ไม่ใช่ asset filters)
- แท็บ: `ทั้งหมด / กำลังติดตาม / รายการโปรด` (All Posts / Following / Favorites) — `state.feedTab`, segmented control ใต้ app-header (`ft:"segment"`; variant `ft:"none"` ใช้ brand-menu dropdown แต่ dead)
- All = โพสต์ทั้งหมด (ถ้า `state.snooze` เปิด → เหลือเฉพาะ following); Following = โพสต์ของ seller ที่ follow; **Favorites = โพสต์ของ seller ที่อยู่ใน favorites (account-level)** ไม่ใช่ asset ที่ like (ดู C2)
- Empty states: Following → "Follow others to see their posts here" + ไอคอน users; Favorites → "No favorites yet" + ไอคอน star; All ไม่มี empty path
- Guest กดทั้ง 3 แท็บได้ (ไม่ gate — แค่ไม่มีข้อมูล relation) ขัด AC-FEED-008 (ดู C3)
- กดแท็บ Feed ซ้ำตอนอยู่ feed = re-render + scroll to top (IG refresh); ไม่มี pull-to-refresh

### A3. Own-post "..." menu (IG own-post sheet)
- `pmOwnMenuHTML()`: **Archive/Unarchive**, **Turn off/on commenting** (ซ่อนปุ่ม comment + count), **Edit** (เปิด post editor `openPostEdit` — แก้ caption/location/audience/noComments ไม่ใช่ asset edit), **Mark as sold** (เปิด `sell:` form ตรง ใช้ asset ที่ลิงก์/สร้างจากโพสต์), **Pin to top of grid** (`p.pins[tab]` ต่อ profile tab, PIN_MAX=3, เกินแล้ว confirm dialog แทนหมุดเก่าสุด), **Delete** (confirm dlg "Delete post? …permanently deleted", ไม่มี undo)
- โพสต์ sold: Edit หาย เหลือ **View sale record** (`sold:` page); sellable = `pfkind` sale/show/hide เท่านั้น
- เมนูนี้เปิดจาก `.post-head .more` + `.pm-btn` ทุก surface (feed/pv/detail/pfp) โดยเช็ค `isOwnPost()` (seller === CP_ME)

### A4. Not-interested feedback loop (แทน Hide this asset)
- เมนูคนอื่น (`pmMenuHTML`): Add/Remove from favorites (แสดงเฉพาะโพสต์ที่ following หรือ fav แล้ว) + **Not interested** + Report
- `p.ni=true` → card เปลี่ยนเป็น **ni-card**: "Thanks for your feedback" + ปุ่ม Undo ใน card + sub "We'll suggest fewer posts like this" + action rows: ถ้า following → `Mute {seller}` (เปิด muteDlg "Mute X?") + `Unfollow {seller}`; ถ้าไม่ follow → `Manage content preferences` (เปิด prefs page); + `This post made me uncomfortable` → **uncomfCard** (check + "Thanks for letting us know" + Report + Undo)
- Undo = ปุ่มใน card (ไม่ใช่ timed snackbar); restore ระยะยาวผ่าน Settings > Content preferences > Not interested (`ni` page list + Restore)
- Mute เป็น account-level (ซ่อนโพสต์ seller ทั้งหมด) unmute ผ่าน Settings > Muted accounts / report flow

### A5. Content preferences + feed tuning (settings แต่ผูก feed โดยตรง)
- `prefs` page: Sensitive content (Less/Standard radio), Interested (list โพสต์ที่ like + Remove/m-unlike), Not interested (list + Restore), **Snooze suggested posts in feed** toggle ("ซ่อนโพสต์จากบัญชีที่ไม่ได้ติดตาม 30 วัน" → All tab เหลือเฉพาะ following), Reset suggested content (confirm dlg → เคลียร์ p.ni)
- `favorites` page (Settings): list บัญชี favorite + suggested + search + remove all — คำโปรย "New posts from your favorites will appear higher in feed"
- `muted` page: Muted accounts + Unmute

### A6. Feed card จริง (variant a1 = active, flat IG)
- Head: avatar-ring + seller + **location sub-line** + Follow button (เฉพาะโพสต์ที่ยังไม่ follow — follow/unfollow sheet confirm) + "..." ; avatar/who/caption-owner กด → `profile:{seller}`
- Photo: carousel tap ครึ่งซ้าย/ขวา + drag swipe, counter `1/N`, dots, clip badge+progress; **tap รูปไม่เปิด detail** (ดู C5)
- Actions: like / comment(+count) / views / share / **Ask Seller pill** (`ask-pill` → `chatQuickAsk` เปิด item-scoped chatroom จริง; own → "This is your own listing", blocked → toast) / save bookmark
- liked-by row (stack avatar + "ถูกใจโดย X และคนอื่น ๆ") → likes sheet (liker list + Follow; โพสต์คนอื่นมี note "Only {seller} can see the total number of likes")
- caption สั้น → "more" expand inline; **"Tap for details" toggle → details-body** (price row + spec groups + "View full detail" → `.page-detail`)
- Design variants: a2/b2/c2 = price+cond overlay บนรูป, a3 quiet price, b3/c3 price footer, mixed = FOR SALE/SHOWCASE type tags — ทั้งหมด dead (active=a1) จดเป็น artifact ต่อจาก 001b A10

### A7. Post detail layer (.page-detail) = asset-detail equivalent
- `detailHTML` dl1: head back + "รายละเอียด/Detail" + "..." (pm-btn → own/others menu เดียวกับ feed), hero carousel (tap ซ้าย/ขวาเหมือน feed), actions like/comment/views/share + **mf-btn Follow this model** (bell → waSheet สร้าง WA จาก spec โพสต์) + **wl-btn Wish List** (gift → wlSheet), FOR SALE/SHOWCASE tag, detail-name (Brand+Model), Ref., Descriptions, spec groups (รวม "Price & Data Source" — ราคาอยู่ใน spec กลุ่มสุดท้าย)
- `POST_DETAIL_CFG` per-post overrides (dev artifact เปลี่ยน ask/ds/pr/dh/tg ตามโพสต์)
- `chat-fab` + chatPopHTML (floating DM pop) มีในโค้ดแต่ dead (ต้อง `ask:"bubble"` — active=`outline` ทำให้ detail ไม่มี Ask เลย)

### A8. Immersive post viewer (.page-pv) 3 โหมด
- เปิดจาก: explore tile / search result tile / saved+wl+archive tile / notification / watch-alert / board post — **ไม่ได้เปิดจาก feed card โดยตรง**
- Default mode: full-bleed photo snap แนวตั้ง (เปิดที่ pid/phi) + rail (like, "Likes"→likes sheet, comment→comment sheet, views, share, save, "...") + foot (seller+Follow, caption "…"→pvPostSheet, "Tap for details"→details sheet `dt`) + "Add comment…"→comment sheet (`nt` variant) + pv-srch (กลับไป search typing)
- `feed` mode (Saved/Archive/Wish List): head title + back + search icon + `svf-track` feed-cards
- `pfp` mode (profile grid tile): head "Posts/{user}" + Follow pill + `pfp-post` cards (own posts เห็น like count)
- Comment เปิดได้จาก viewer sheet โดยตรง ไม่ผ่าน detail (ยืนยัน context จาก FSP-001b)

### A9. Comment surface (read-only mock)
- `commentsHTML`: sheet "ความคิดเห็น" + rows (avatar→profile, name, time, text, Reply, like toggle `c-like` ใช้งานได้ local) + replies + emoji row + input "เพิ่มความคิดเห็น..."
- input/emoji/Reply/Reply-like = dead → toast "Not in this prototype yet" (member); guest โดน gate — **ยังเขียน comment จริงไม่ได้** มีแต่เปิดดู
- `noComments` (Turn off commenting) ซ่อนปุ่ม+count ทุก surface

### A10. Search = IG explore flow (header icon → sub page)
- Entry: `.search-btn` ใน app-header → `openSub("search")` (ไม่ใช่ nav tab — ยืนยัน 001b C8)
- `srchState`: mode landing/typing/results, q, tab(foryou/profiles/tags), sort("new"), err, recents(≤8), f, fDraft
- Landing: chips `[filter icon] [For you] [Rolex] [Submariner] ...` (SEARCH_POPULAR 10 chips คงที่ กด = ยิง query) + **explore grid** (xp-tile = รูปทุกใบของทุกโพสต์ไม่กรอง sale, บาง tile แสดง views) — tile กด → post viewer
- Typing (กด fake field): field จริง + Cancel; q ว่าง → Recent (4 แถว + See all → `recents` page: Clear all + X รายแถว); q ไม่ว่าง → suggestions (brand/model kw พร้อม `N listings`, refs, sellers พร้อม `N listings`/`Following` — max 6+4)
- Submit/pick chip/suggestion/recent/tag → `mode:"results"`, pushRecent

### A11. Search results page (IG-style ไม่ใช่ card list)
- Head: back + fake field (กดกลับ typing เก็บ q) + **sr-wa bell** (Create watch alert) + filter icon (→ sfilter)
- Tabs: **For you / Profiles / Tags**; active filter chips (รายตัวลบได้ `data-rm`)
- For you = "Accounts" section (seller name match, ไม่นับโพสต์ที่ขาย) + "Posts" section (`xp-grid two` รูปล้วน — **ไม่ใช่ feed card** ดู C12) → tile กดเปิด post viewer
- Profiles = seller cards (avatar, `N listings`, Following state, Follow btn)
- Tags = hashtag rows + `N posts` (ค้นจากทุก caption — `isTag` ใช้ POSTS ทั้งกอง **ไม่กรอง sale** ดู C13)
- Results ใช้ `salePosts()` = `price && !ni && !muted && !blocked` สำหรับ Posts grid — ตรง Sale-only บางส่วน แต่ explore/tags ไม่กรอง (ดู C12/C13)
- Back จาก results → landing (IG); Error: `S.err` → sad icon + "Something went wrong. Please try again." + Try again (**hardcode EN ทั้ง TH/EN**); Empty: "No data found" + "Try a different keyword or adjust your filters" (EN อย่างเดียว); "No suggestions"/"No recent searches" ก็ EN

### A12. Filter page (sfilter) — chip-group multi-select + draft pattern
- Sections: Brand, Model (**dependent** — กรองตาม brand ที่เลือก, title แสดง `· Rolex + Omega`, เลือก brand แล้ว prune model ที่ไม่ใช่ของ brand นั้นออก), Price range (min/max inputs), Year (จาก salePosts), Reference (จาก salePosts), Condition, Case size, Movement, Dial color, Strap / Bracelet, Delivery contents
- ทุก option แสดง `(N)` = จำนวน Sale listing ที่เห็น — รวม `(0)` เลือกได้ (ตรง Filter Visibility Rule)
- Price inputs: auto-comma ขณะพิมพ์ + digits-only (`input` handler ~20108 `unNum`+`fmtNum`), validate ตอน Apply เท่านั้น — min>max → "Minimum price must not exceed maximum price"; max>2,000,000 → error; **ไม่มี slider**, validation messages EN
- Draft pattern: chip edits `fDraft`; `Apply (N)` commit + jump results; back/ออก = ทิ้ง draft; `Clear all` reset draft (ชิปบน results ลบตัวที่ apply แล้ว)
- **ไม่มี Popular Model section** (model list = SEARCH_BRANDS ตามลำดับ ไม่มี top-10 popular), ไม่มี Popular Filter ในหน้า filter

### A13. Watch Alert entry จาก search + post detail
- `sr-wa` bell บน results head → `waSheetHTML` shared sheet: criteria snapshot (`waCriteriaFromSearch` = keyword + ทุก filter + price range), name auto (`waName` — brand+model+ref หรือ `"keyword"` หรือ "Any new listing"), matchMode pick (all/any/model), save/update/delete + dedupe sig ("You already saved this alert")
- `mf-btn` บน post detail → WA จาก `waCriteriaFromPost` (specs ของโพสต์) — **entry ที่ 2 นอกจาก search filter** (ขัด spec "สร้างจาก Search Filter เท่านั้น" ดู C19)
- Alert เปลี่ยน `modelFollowing` → bell on; match นับจาก `salePosts()` เท่านั้น (ตรง spec)
- ชื่อว่าง → ไม่ block, fallback auto-name เสมอ (ขัด AC-SEARCH-031A ดู C18)

### A14. Report flow = IG full-page multi-step (แทน bottom sheet)
- `pm-go-report` → `rpOpenFromPost` → `report` page (full-page, X ปิดทั้งกอง, < กลับ): reason list 9 ข้อ (IG reasons) → `report:done:{user}` "Thanks for your feedback" + **Other steps: Block/Unblock, Unfollow, Mute** (step ที่ทำแล้วมี green check) + Done
- `report:pick:` = "A specific post / Something about this account" picker; `report:posts:` = เลือกโพสต์ของ user + Next
- Anonymous note "Your report is anonymous..."; toast fallback "Report submitted · thanks for letting us know" เมื่อไม่มี user context
- **Block User ไม่มีในเมนู feed โดยตรง** — เข้าผ่าน report:done เท่านั้น (หรือ profile)

### A15. Save/Wishlist/sheets บน feed (ส่วน feed ของ hub — รายละเอียด hub อยู่ FSP-002b)
- `save-btn` → saveSheet (Saved + Collections + New collection); `wl-btn` (detail) → wlSheet (Wish List + lists); archive → `archive` page + archive viewer (feed mode); saved viewer/wishlist viewer = pv feed mode
- Share sheet: friends grid + app row (Messenger/Direct/LINE/Facebook/Copy link) — mock, "Link copied"/"Sent to X" toast ไม่มี link จริง (สอดคล้อง 001b C5)

---

## B. Spec 02/03 มี แต่ Prototype ไม่มี (→ ต้องตัดสินใจว่าเก็บเป็น contract หรือปรับ)

| # | ของใน spec | สถานะใน prototype |
|---|---|---|
| B1 | Full Screen Image Viewer จาก Feed Card (AC-FEED-016) | ไม่มีเลย — รูป tap = carousel ซ้าย/ขวาเท่านั้น ไม่มี zoom/fullscreen image mode (pv คือ post viewer ไม่ใช่ image viewer) |
| B2 | Infinite scroll + load-more state + end-of-list `คุณดูรายการทั้งหมดแล้ว` (AC-FEED-018/019, SEARCH-035/036) | feed render ทั้งกองครั้งเดียว ไม่มี pagination/end state (มีแค่ board "You're all caught up" / TH "คุณดูครบทั้งหมดแล้ว" — copy ไม่ตรง spec ด้วย) |
| B3 | Feed network states ทั้งชุด: skeleton, slow-network note, full-page error+`ลองใหม่`, offline no-cache/cache+banner, refresh-fail snackbar, load-more-fail inline retry (AC-FEED-020/021/021A–C) | ไม่มีเลย — feed ไม่มี loading/error/offline path |
| B4 | Image-level failure states (placeholder + retry เฉพาะรูป + partial gallery) + Owner fallback (`Unknown seller`, `Seller unavailable`, skeleton, avatar fallback) | ไม่มีเลย |
| B5 | Hide this asset = user-level hidden asset (ซ่อน asset เดียว + undo snackbar + persist ข้าม refresh, ไม่กระทบ search/WA) | มีแค่ "Not interested" (post-level feedback loop + ni-card + Settings restore list) — คนละ semantics (ดู C10) |
| B6 | Block User เป็น feed menu item + confirmation copy (AC-FEED-017E) | ไม่มีในเมนู — block เข้าผ่าน report:done steps หรือ profile เท่านั้น |
| B7 | Owner menu: Edit provenance + Change status (AC-FEED-017F/017I + toast `Asset status updated.`) | ไม่มี — Edit คือ post editor ไม่ใช่ asset; เปลี่ยน status ทำผ่าน portfolio drawer toggle ไม่ใช่ feed menu |
| B8 | Sort UI 5 ตัวเลือก (Relevance/Price↑/Price↓/Newest/Popularity) + default Newest (AC-SEARCH-015/004) | **ไม่มี UI** — `S.sort` เป็น dead state ("new" ตลอด; เผื่อ plo/phi/pop ไว้แต่ไม่มี control) + ไม่มี Relevance concept |
| B9 | Result Count บน search result (AC-SEARCH-014) | ไม่มี — มีแค่ count ในวงเล็บข้าง filter option และจำนวนบน Apply button (count = จำนวน filter ไม่ใช่ผลลัพธ์) |
| B10 | Pull to refresh / Reload result / infinite scroll บน search result (AC-SEARCH-034/035) | ไม่มี — grid static |
| B11 | Autocomplete = entity/option `is_active` จาก Market Data + option master ทุกหมวด พร้อม count (AC-SEARCH-009A/E) | suggestions = hardcoded SEARCH_BRANDS/REFS + sellers จาก POSTS; count มีเฉพาะ brand/model rows — ไม่มี option-master entities (Condition/Delivery/Case/Movement/Dial/Strap) ใน suggest และไม่มี is_active concept |
| B12 | Popular Filter ในหน้า Filter ตามหมวด + Popular Model top-10 context-aware ตอนเลือก Brand (AC-SEARCH-009C, 010B/C) | ไม่มี — Popular มีแค่ chips คงที่ 10 อันบน landing; model filter เป็น list ตรง ๆ ไม่มี popular section |
| B13 | Price range slider/range control + sync กับ typed input + validation messages ครบตาราง (ตัวอักษร/ติดลบ/ทศนิยม/min>max/เกินเพดาน) | inputs อย่างเดียว ไม่มี slider; comma auto-format + digits-only **มีแล้ว** (input handler ~20108); ตัวอักษร/ทศนิยม/ติดลบถูก strip เงียบไม่มี error; validate เฉพาะ min>max + เกินเพดานตอน Apply; message EN hardcode ไม่ตรงตาราง TH ของ spec |
| B14 | Watch Alert Alert Name validation: ลบชื่อจนว่าง + Save → ต้องเตือนและไม่สร้าง (AC-SEARCH-031A) | prototype auto-fill ชื่อเสมอ (`|| waName()`) ไม่มีช่องทางเจอ validation — ไม่ block (ดู C18) |
| B15 | Watch Alert Result List destination (AC-SEARCH-032/033 + §15) | ไม่มี — ซ้ำ FSP-001b C1/B3 (cross-ref ไม่นับซ้ำ) |
| B16 | Report Asset bottom sheet (drag handle, ไม่มี Cancel, submit disabled จนเลือก reason, copy ตามตาราง, success state "review ภายใน 24 ชม.") | flow คนละแบบ — IG full-page multi-step + thanks page + other steps (ดู C11); ไม่มี reason-required-disabled pattern แยก |
| B17 | TH copy ของ search empty/error (`ไม่พบข้อมูล`, `เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง`) + feed empty ตามตาราง §14 | prototype hardcode EN ทุกจุด (No data found / Something went wrong / No suggestions / No recent searches); feed empty ก็ EN/TH ของตัวเอง ("Follow others...", "No favorites yet") ไม่ตรง spec copy |
| B18 | `Make Offer` refs ใน 02: guest forbidden list, Mark-as-sold auto-reject offers, Delete → offer `Cancelled`, AC-FEED-017B กระทบ Offer, block copy "ส่งข้อเสนอใหม่" + `feed_owner_*` analytics | Offer ถูกถอดแล้ว → removal scope FSP-006/007 (cross-ref) |
| B19 | Analytics events `feed_*` + search event list (incl. Make Offer From Search, Search Funnel) | ไม่มี tracking layer (contract-level เหมือน 001b B11) |
| B20 | Perf contract: โหลด ≤2s, lazy load, real-time refresh exclusion | images มี `loading="lazy"` บน tiles; ที่เหลือ contract-level |

---

## C. ขัดกันโดยตรง (conflicts ต้อง sync)

| # | Spec 02/03 บอก | Prototype ทำจริง | ข้อเสนอ |
|---|---|---|---|
| C1 | Feed = marketplace เฉพาะ Asset `Sale`, **ต้องไม่เป็น social feed** (Objective + AC-FEED-001/002 + Out-of-scope "social post feed") | Feed = social feed จริง: sale + showcase + plain posts (`pfkind:"post"`), caption/hashtags/views/liked-by/comments | **หลักฐานเพิ่มเติมยืนยันประเด็น FSP-001b C6** — spec ต้องเขียนใหม่เป็น post-centric (flag FSP-010 แก้ 00_GLOBAL §9/§14 + FSP-015a เขียน 02 ใหม่); showcase/post/sale เป็น post `type` + `pfkind` ไม่ใช่ asset status เดี่ยว |
| C2 | Following = Sale ของคนที่ follow, **Favorites = Sale ที่กด Like** (AC-FEED-006/007/012) | Following = โพสต์ของ seller ที่ follow; **Favorites = โพสต์ของ seller ที่อยู่ใน favorites (account-level, IG-style)** — ตั้งผ่านเมนู "Add to favorites" | tab semantics ต้องเขียนใหม่: favorites เป็น account list (มี settings page ของตัวเอง) ไม่ใช่ liked assets; liked posts ไปอยู่ Interested list แทน |
| C3 | Guest กด Following/Favorites → Global Login Required Dialog (AC-FEED-008) | Guest กดได้ทั้ง 3 แท็บ ไม่ gate (ว่างอยู่แล้ว); gate list ไม่ครอบ `.feed-tab` | ต้องตัดสินว่า spec ยังบังคับ gate แท็บ หรือรับพฤติกรรม IG (tab ไม่ gate แต่ action gate) |
| C4 | Card required = Images/Brand/Model/Price/PostedTime/Owner/LikeCount/CommentCount; ห้าม Location/Status badge (AC-FEED-009/010) | variant a1: **ไม่มี price บน card** (ซ่อนหลัง Tap for details), brand/model ไม่มี field (caption text เท่านั้น), like count เป็น private ("and others"), **แสดง location sub-line**, views count, Ask pill, save btn | ขัดทั้งสองทิศ — ต้องนิยาม card fields ใหม่ตาม prototype (หรือตัดสินใจให้ prototype ตรง spec — แต่ mission baseline คือ spec ตาม prototype) |
| C5 | Feed Card tap → Asset Detail (AC-FEED-014) | tap card ไม่ทำอะไร; tap รูป = carousel ซ้าย/ขวา; detail เปิดผ่าน "View full detail" ใน expander หรือ viewer/notification เท่านั้น | map "Feed Card เปิด Asset Detail" → "View full detail" link/viewer ตามพฤติกรรมจริง |
| C6 | ไม่รองรับ Comment จาก Feed โดยตรง — Comment ผ่าน Asset Detail เท่านั้น (AC-FEED-017 + §15) | comment-btn บน feed card + pv rail + detail เปิด comment **sheet** โดยตรงทุกที่ (input ยัง dead แต่ surface เปิดได้) | รับพฤติกรรมจริง: comment เป็น bottom sheet shared ทุก surface (ขยาย C3 ของ FSP-001b — หลักฐานชัดแล้ว) |
| C7 | Like → เพิ่ม Favorites, Unlike → ลบ (AC-FEED-012 + Like And Favorites Sync) | like = local toggle เท่านั้น ไม่ไป Favorites; liked posts อยู่ Settings > Content preferences > **Interested** | Favorites vs Interested สองระบบคนละความหมาย — spec ต้องเขียนแยก (feed tab ที่ 3 = favorites ของ account) |
| C8 | เมนูคนอื่น: Share / Hide this asset / Report Asset / Block User (AC-FEED-017A/017J) | เมนูคนอื่น: Add to favorites (conditional) / Not interested / Report; Share เป็น action button แยก; Block ไม่มีในเมนู (อยู่ใน report:done) | เขียนเมนูตามจริง + ตัดสินว่า Block/Hide spec-intent map ไปที่ไหน (report:done / ni-card) |
| C9 | Owner menu: Share / Edit asset / Edit provenance / Mark as sold / Change status / Delete (AC-FEED-017F/017K) | Owner menu: Archive / Turn off commenting / Edit(post) / Mark as sold / Pin to grid / Delete (+View sale record สำหรับ sold); ไม่มี Share/Edit provenance/Change status | เขียนใหม่ตามจริง — own-post มี lifecycle ของตัวเอง (archive/pin/commenting) ที่ spec ไม่มีเลย; Mark as sold + Delete map ได้บางส่วน (Edit = post edit ไม่ใช่ asset edit) |
| C10 | Hide Feed Item + timed snackbar Undo + error snackbar + persist (AC-FEED-017B/C + copy table) | ni-card "Thanks for your feedback" + Undo ใน card + rows Mute/Unfollow/Manage prefs + uncomfortable→uncomfCard; persist ใน Settings > Not interested + Restore | model ต่างกัน: spec = hide-asset ตรง ๆ, prototype = not-interested feedback loop แบบ IG — ต้องเขียน flow ใหม่ |
| C11 | Report Asset bottom sheet: ไม่มี Cancel, ปิดด้วย drag/backdrop/back, submit disabled จนเลือก reason, success "review ภายใน 24 ชม." | Report = full-page flow: reason list → report:done "Thanks for your feedback" + Other steps (Block/Unfollow/Mute + green check) + Done; report:pick/posts สำหรับ account-level | คนละ pattern — เขียน report flow ตามจริง (อยู่ใน scope 15_TRUST_SAFETY ด้วย แต่ entry จาก feed ต้อง sync) |
| C12 | Search Result = card layout เดียวกับ Feed ครบทุก field (AC-SEARCH-016/017) | Results = explore grid รูปล้วน (xp-grid two) + Accounts section + tabs — ไม่มี card fields เลย เปิดผ่าน post viewer | เขียนใหม่: result = photo grid + post viewer (IG) ไม่ใช่ feed card |
| C13 | Search เฉพาะ Asset `Sale` (AC-SEARCH-001/002) | Posts grid ใช้ salePosts() ✓ แต่ **explore landing + Tags tab + hashtag query ค้นทุกโพสต์** (ไม่กรอง sale) + Accounts = sellers | scope แยก: result grid = sale, explore/tags/social surfaces = ทุกโพสต์ — ต้องนิยามกฎให้ตรงจริง |
| C14 | Recent Search "ไม่รวมใน V1" (§6 Out of scope) | Recents เต็มระบบ: 4 แถว + See all page + per-row X + Clear all + push อัตโนมัติทุก pick | ต้องตัดสิน: เพิ่ม Recent Search เข้า scope V1 (ตาม prototype) หรือถือว่า prototype เกิน spec — แนะนำเพิ่มเข้า spec |
| C15 | Sort รองรับ 5 ค่า + default Newest (AC-SEARCH-015/004) | ไม่มี sort UI เลย (dead `S.sort`) | เขียนว่า V1 ไม่มี sort หรือเพิ่ม UI — ต้องถาม (prototype ไม่มี = ตาม baseline spec ควรบอกไม่มี) |
| C16 | Popular Filter บนหน้า Search+Filter, context-aware Popular Model 10 อันดับ (AC-SEARCH-009C/010B/C) | chips คงที่ 10 อันบน landing เท่านั้น (SEARCH_POPULAR hardcode); ไม่มี popular ใน filter; model list ไม่มี popular section | spec เกิน prototype — เขียนเฉพาะ popular chips ที่มีจริง หรือเก็บเป็น contract ว่าจะเพิ่ม |
| C17 | Price Range: slider + input sync + comma auto-format + validation TH ครบ (§12) | inputs 2 ช่องไม่มี slider; auto-comma + digits-only มีแล้ว; `unNum` strip เงียบ; validate 2 rules EN (min>max, max>2,000,000) | เขียนเฉพาะที่มีจริง: min/max inputs + auto-format + 2 validation rules + MAX 2,000,000 |
| C18 | Alert Name ว่างตอน Save → เตือน + ไม่สร้าง (AC-SEARCH-031A); "Save this search" modal | ชื่อว่าง → auto-name เสมอ ไม่เคย block (criteria ว่างก็ได้ = "Any new listing") | ทิศทาง spec ขัด prototype: prototype ไม่บังคับชื่อ — ต้องตัดสินว่า spec เขียน auto-name หรือบังคับ validation |
| C19 | Create Watch Alert ต้องสร้างจาก Search Filter เท่านั้น (§10 Watch Alert Entry Point) | มี 2 entries: `sr-wa` จาก search results + **`mf-btn` Follow this model บน post detail** (+ walerts settings list) | เพิ่ม entry ที่ 2 ใน spec (flag ไป FSP-021 เอกสาร 10 ด้วย) |
| C20 | Deleted/blocked handling บน search result (AC-SEARCH-025/026 + Deleted Asset state) | blocked กรองจาก salePosts/resultSellers ✓ (พฤติกรรมตรง); deleted → toast "This post is no longer available" ตอนเปิด ไม่มี deleted state page (ซ้ำ 001b B4) | ส่วนกรองตรงอยู่แล้ว; deleted state รวมใน note 001b |
| C21 | Search TH/EN copy ทุก state (§13/14) | ทุก search strings hardcode EN (ไม่มี isTh branch) | เพิ่ม localization ให้ครบหรือระบุว่า prototype EN-only |

---

## D. Cross-module notes (ไม่ใช่ spec 02/03 แต่เจอระหว่างสแกน)

- **Offer refs ใน 02**: guest forbidden ("Make Offer"), §9 Mark-as-sold auto-reject, Delete → `Cancelled`, AC-FEED-017B, block-confirm copy "ส่งข้อเสนอใหม่", analytics `Make Offer From Search` ใน 03 → removal list FSP-006/007 (03 มี `Make Offer From Search` ใน Analytics ด้วย)
- **FSP-015b (create post/clip composer)**: โพสต์ใหม่เข้า feed ด้วย `pfkind:"post"`, composer มี toggle Turn off commenting + location + audience — สอดคล้อง model post-centric ที่เจอใน task นี้
- **FSP-016 (03 update)**: รายการใหญ่สุดของ task นี้ (A10–A13, C12–C19) ทั้งโมดูล search ต้องเขียนแทบใหม่ — spec ปัจจุบันเป็น marketplace search ไม่ใช่ IG explore
- **FSP-018 (05_ASSET_DETAIL)**: detail layer (`detailHTML` dl1 + mf-btn + wl-btn + spec groups + Price & Data Source + POST_DETAIL_CFG) เป็น post-detail ไม่ใช่ asset detail — mapping เดียวกับที่ 001b flag ไว้; จำไว้ว่า `chat-fab`/igDetailHTML/variant configs เป็น dead paths
- **FSP-021 (10_WATCH_ALERT)**: `waSheetHTML` shared sheet ใช้จาก 3 entries (search/detail/settings list); matchMode all/any/model + modelKey — spec 10 ต้องรับ model-follow alert + entry จาก post detail
- **FSP-022 (11_SOCIAL)**: like/likes-sheet/private-like-count/follow/favorite-sellers/mute เป็น social graph features ทั้งหมดที่ spec 02 เคยเขียนเป็น asset actions — เนื้อหา social น่าจะย้าย/ขยายไป 11
- **FSP-002b (saved/wishlist)**: save-sheet + wl-sheet + collections + archive viewer เชื่อมจาก feed save-btn/wl-btn ที่ task นี้เจอ (A15)
- **Archive**: `archive` page + archived posts หลุด feed (`archived` + `archivedAt`, pins ถูกล้างตอน archive) — own-post lifecycle ที่ spec ไม่มี; เกี่ยว profile (settings link) + feed
- **copy consistency**: board end "คุณดูครบทั้งหมดแล้ว" vs spec end-of-list "คุณดูรายการทั้งหมดแล้ว" — terminology sweep ใน FSP-026
- **search TH gap**: ทุก search surface ไม่มี isTh branch — language sweep กว้างกว่า task นี้ (จดไว้ให้ FSP-026)
- ยืนยัน context ที่ได้รับมา: feed มี social posts (A1/C1), search = header icon (A10), comment เปิดจาก post viewer sheet โดยตรง (A8/C6)

## E. สรุปจำนวน

- Prototype-only (ต้องเพิ่มใน spec): 15 กลุ่ม (A1–A15)
- Spec-only (ต้องตัดสินใจ): 20 รายการ (B1–B20)
- Conflicts: 21 รายการ (C1–C21)
