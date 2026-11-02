# FSP-003b — Gap Inventory: Chat / Notifications (Alerts)

วันที่สแกน: 21 ต.ค. 2026
Source of truth: `Prototypes/fo-flow/index.html` (read-only — chatPopHTML ~13401–13442 + fab wiring ~13518/~21816–21835, blkSheet/chatReportSheet/unblockDlg ~16690–16738, report-close/delete wiring ~14926–14944, route table ~17490–17503, CHAT state+cfg ~17591–17594, chatInit/reset/unread/badge ~17595–17667, ALERTS seed + list + rows + click ~17669–17825, chThreadMatch/chRowHTML/item groups/list body ~18274–18367, chatList ~18368–18419, chatItem ~18430–18455, chatRoom ~18456–18550, attach sheet ~18552–18595, media viewer ~18596–18614, chmenu ~18616–18696, media gallery ~18698–18780, chsettings ~18781–18836 (dead), chatcfg ~18837–18857, chSend/chatQuickAsk ~18858–18892, hide/delete confirm ~18901–18967, chatClick ~18970–19243, swipe ~19247–19330, notif_settings ~17178/~17348–17361 + toggle ~21005–21012, navGo+chatReset ~21284–21302, report handlers ~21557–21628, guest gate ~20157/~22997–23006)
เทียบกับ: `FrontOffice/07_CHAT_MODULE.md` + `FrontOffice/09_NOTIFICATION_MODULE.md`

**Note ขอบเขต:** spec 07 มี §1.1 Revision 2026-10 (CHAT-001) ที่ sync กับ prototype ไปแล้วพอสมควร — LINE-style bubbles, Chats/Items toggle + filter popover, item chats, Quick Ask, Chat Config, swipe Hide/Delete + Pin/Mute ตรงกับโค้ดเกือบทุกข้อ จุดที่เหลือคือ (1) ส่วน §2–§17 ของ spec ยังเขียนเป็น Offer-centric + Asset Reference model เก่า (Offer ถูกถอดจาก prototype แล้ว — commit ab7e4fd, grep `offer` ในไฟล์เจอ 0 hit) (2) หลายอย่างใน prototype เป็น LINE/IG extras ที่ spec ไม่มี + dead routes (3) notifications = IG activity feed (ชื่อ "Alerts") มี type `system` นอก baseline และไม่มี destination fallback states เลย; guest เห็นแค่ icon ใน nav — ทุก entry โดน member-sheet gate

---

## A. Prototype มี แต่ Spec 07/09 ไม่มี (→ ต้องเพิ่มใน spec ตอน FSP-020/021)

### A1. Chat thread model = key ต่อ `user + item` (ไม่ใช่ต่อ user)
- `chatQuickAsk` หา thread ด้วย `x.user === post.seller && x.item.id === post.id` → same seller แต่คนละ item สร้าง **ห้องใหม่** พร้อม post ref card ของ item นั้น — ขัด spec Different Asset Rule (ดู C1)
- Draft room จริง: `C.draft` สร้างตอนกด Ask, ยังไม่เข้า `C.threads` จนกว่า `chSend` แรก (unshift) — ตรง AC-CHAT-001 room-created-on-first-send; draft text per-room (`t.draft`) persist ระหว่าง navigate (spec ไม่มี draft concept)
- Thread fields: `unread`, `draft`, `pinned`+`pinnedAt`, `muted`, `hidden`, `blocked` (sync จาก `pfSetBlocked`), `msgs[{f,t,at,day,read}]`, `item{cap,price,photo,owner,pid}` snapshot, `media[]`, `galState`, `searching`/`roomQuery`
- การ์ดอ้างอิง = `ch-post-card` (รูปเต็ม + scrim บน avatar/ชื่อ + scrim ล่าง caption/price) อยู่ในคอลัมน์ "me" ตอน msgs ว่างหรือ msg แรก — tap → `openPostDetail` — **เป็น post snapshot ไม่ใช่ asset reference** (ดู C2)

### A2. Bubble extras + composer ที่ spec เขียนไม่ครบ
- Read/Sent receipt text ข้าง bubble เฉพาะข้อความ "me" ล่าสุด (`lastMe`), time ทุก bubble, avatar เฉพาะ bubble "them" แรกของกลุ่ม (`ch-mav-sp` spacer), `ch-day` divider ต่อวัน — §1.1 บอกหลักการแต่ spec ไม่มี bubble anatomy ละเอียด
- Composer: `+` attach (media sheet), input, send disabled จนมี text; send ใส่ `read:false` → แสดง "Sent"; ไม่มี simulation ฝั่งรับ/typing
- Media message: bubble รูป + play overlay ถ้า `isVideo`; attach sheet = grid รูปจาก POSTS ทั้งหมด (mock picker, `isVideo:false` เสมอ); tap รูป → `ch-media-viewer` overlay ใน frame (AC-CHAT-034 ✓)
- **ไม่มี File message** (spec §6/§10 Message Type Rule มี File) — attach มีแค่ photos & videos; **ไม่มี Offer Card** (ดู C8)

### A3. Chat list / Items tab mechanics เกิน spec
- `ch-q` list search match `user + item.cap + ทุก msg text`; `ch-iq` item-chats page search แยก (spec มีแค่ "Search Chat ต้องใช้งานได้" — implement เกิน)
- Items grouping: `chItemGroups` group ตาม `item.id`, `mine = item.owner===CP_ME` → section `Your listings` (row = price + `N chats`) / `Items you asked about` (row = price + last msg); **!mine ที่มี thread เดียวกดตรงเข้า room** (`isDirectRoom`), mine → `chatitem:` page (floating pill item card + rows + search + swipe ได้ทุก row)
- Row badges: unread count pill, muted icon, `Blocked` chip (blocked user ยังอยู่ใน list), pin badge บน avatar; preview prefix `You:`; time = HH:MM (Today) / day label
- Swipe: right → Pin/Mute วงกลมเขียว, left → Hide/Delete สี่เหลี่ยมเทา (§1.1 ✓); hide = `t.hidden` (ยังหาเจอตอน? no — filtered out แต่ un-hide กลับอัตโนมัติเมื่อส่งข้อความใหม่ `t.hidden=false` ใน chSend/chatQuickAsk); pin เรียงก่อนเสมอ + `pinnedAt` tie-break
- `chatResetToDefault()` ทุก `data-navgo` → กลับ Chat tab ใหม่ = view user + filter all + clear q/iq — ตรง §1.1 reset rule ✓
- Empty copy จริง: `No chats yet` / `Tap Ask on a post to start chatting with the seller.` / `No chats found` / `No item chats yet` / filter-empty variants — ไม่ใช่ copy กลาง (ดู C10)

### A4. Chat room menu (≡) = sub-page `chmenu:` + gallery + settings-dead-route
- `chmenu:` = head back `<` + ชื่อคู่สนทนา + **4 ปุ่มวงกลม** Mute/Unmute, Profile (→ `data-pf-user`), Block/Unblock, Report + rows `Photos & videos` (thumbnail strip หรือ empty card `No photos or videos found.`) + `Listings & Items` (→ post detail) + footer `This chat is protected with End-to-End Encryption` — ปุ่มวงกลมมี **Report เป็นปุ่มที่ 4** (AC-032 บอก 3 ปุ่ม) และ **ไม่มี Delete chat entry** ในหน้านี้ (ดู C3)
- `chmedia:` gallery: head `✕` + Select mode (badge ลำดับ 1,2,…), bottom bar Trash + Download (ไม่มี Share ✓ ตาม AC-035), date group label เป็น mock ตายตัว `October 2569 BE` (ไม่ได้ group ตามวันจริง)
- `chsettings:` **route มีแต่ไม่มี entry ใด ๆ** (grep `data-chgo="chsettings"` = 0) — หน้า Settings per-room (Note notifications toggle / Chat wallpaper dead toast / Export chat history→clipboard+toast / Encryption keys "Letter Sealing" row / Delete data → delete confirm / Report → report:user) เป็น dead code ทั้งหน้า
- **E2E/Letter Sealing claims** ทั้ง chmenu footer + chsettings — spec ไม่มี encryption claim เลย (LINE leftover; prototype อ้าง feature ที่ไม่มีจริง — ต้องตัดสินว่าเก็บใน spec ไหม)

### A5. Dead chat artifacts (K5 bubble variant)
- `chatPopHTML` + `.chat-fab` floating bubble บน detail เมื่อ `state.ask === "bubble"` (p2/p5/p6) — แต่ `.chat-fab` click ถูก `chatClick` (`.ask-pill,.chat-fab` → `chatQuickAsk`) จับก่อนเสมอ → **`.chat-pop` DM popup + `sendChat` (เขียนลง `.cp-thread` ไม่เข้า CHAT.threads) unreachable** — dead UI path ทั้งก้อน
- Ask affordances ที่ใช้จริง: `ask-pill` variants (ico/txt/outline/solid ตาม post/state.ask) + `.chat-fab` — ทั้งหมด → `chatQuickAsk` → `chatroom:` (own listing → toast `This is your own listing`; blocked seller → toast `Cannot message a blocked account`)

### A6. Block/Report ใน chat = IG sheets เต็มรูปแบบ
- Block: `blkSheetHTML(u, fromChat=true)` → bottom sheet avatar + `Block {user}?` + 3 impact rows + **ปุ่ม `Block` อย่างเดียว** (ตัด Block-and-report ตาม spec §10 ✓) — dismiss = backdrop (ไม่มีปุ่ม Cancel)
- Blocked room: composer ถูกแทนด้วย `ch-blocked-bar` — `You blocked this account` + `You can't message or call them unless you unblock them.` + `Unblock` → `unblockDlgHTML` center dlg + `pfRestrictHint` banner; history อ่านได้ (read-only ✓); `chSend` guard `pfIsBlocked||t.blocked` ซ้ำอีกชั้น
- Report: `chatReportSheetHTML` — title `Are you sure you want to report {user}?` + `Report and delete` (red, set `rpDelChat`) / `Report` / `Cancel` → `report:user` (header ไม่มี `<`, มี `✕`; ปิด = pop ทุก `report*` กลับ chmenu) → `report:done:` (จาก chat = ไม่มี back; step `Block {user}` เปิด blkSheet fromChat → Block อย่างเดียว ✓)
- `Report and delete`: เมื่อ report flow จบและปิด → `t.hidden`, splice ออกจาก `C.threads`, stack ตัด `chatroom:/chmenu:` + unshift `chat` → กลับ list (ตรง spec "delete this chat and its associated history" ✓ แต่เป็นลบจริงใน mock — ดู C4)

### A7. Chat Config (`chatcfg`) + per-room extras
- Gear ใน ch-head → `chatcfg`: toggles `notif`/`preview`/`followOnly`, `defView` Chats/Items (เลือกแล้วเปลี่ยน `C.view` ทันที), Quick Ask input `chc-quick` (live save ≤80 chars) — ครบตาม §1.1 Chat Config ✓; `followOnly` มี toggle แต่ไม่มี enforcement surface ให้ทดสอบ
- Per-room mute toast = TH `ปิด/เปิดการแจ้งเตือนแล้ว` (spec §10 กำหนด EN `Notifications muted/unmuted`) — copy mismatch เล็ก (ดู C9)
- Send timestamp mock ตายตัว `09:41`; incoming ไม่มี → ทุก "me" แสดง Sent ไม่เคย Read ใหม่

### A8. Alerts feed = IG activity list (ไม่ใช่ notification list เรียบ ๆ)
- Seed `ALERTS`: types = `like` (multi-user aggregate `X, Y และคนอื่น ๆ อีก N คน` + avatar stack + post thumb), `comment` (user + text + thumb), `follow` (+ **inline `Follow back/Following` button** + **dismiss `x` บน row**), `watch` (bell icon + seller avatar mini + name + price + thumb), **`system`** (icon + text `A new device just logged in…` — type นอก master baseline → ดู C11)
- Group headers `Today / Yesterday / Last 7 days / Earlier` (language) + **`Mark all as read`** บน section แรก (spec มีแค่ mark-on-open) — sorting เป็น grouped-by-age ไม่ใช่ flat DESC list
- Read/unread: `.al-row.unread` + tap → unread=false + `alBadgeSync`; badge = nav pill รวม unread; dismiss x ลบ row ออกจาก list (follow เท่านั้น)
- Empty copy จริง: `No alerts yet` / `Watch alerts, likes, comments and new followers will show up here.` — ไม่ใช่ `ไม่พบข้อมูล` (ดู C14)
- Head = detail-head back→feed + title `แจ้งเตือน/Alerts`; ชื่อแท็บ nav = Alerts (ซ้ำประเด็น naming จาก 001b)

### A9. Alert destinations (post-centric, ไม่ใช่ asset-centric)
- `follow` → `profile:{user}` ✓ (ตรง spec Public Profile)
- `watch` → `openPostViewer` โพสต์ตรง + solo header + inject Follow btn — **ไม่ผ่าน Watch Alert Result List** (ขัด AC-NOTI-007 — ซ้ำจาก 001b, ดู C12)
- `like`/`comment` → `openPostViewer` own post (`pfTabPosts(me,"all")`) — **ไม่มี focus comment** (ขัด AC-NOTI-005, ดู C13); post หาย → toast `This post is no longer available` (ไม่ใช่ unavailable state, ดู C15)
- `system` → dead toast `Security details aren't in this prototype yet`

### A10. Notification settings page (out-of-scope ตาม spec แต่มีจริง)
- Settings row `การตั้งค่าการแจ้งเตือน/Notification settings` → `notif_settings`: toggles Likes / Comments / New followers / Watch Alerts (`state.notif`, persist ใน memory) — spec 09 §6 ระบุ "Notification preference center" = out of scope V1 (ดู C16)

---

## B. Spec 07/09 มี แต่ Prototype ไม่มี (→ ต้องตัดสินใจว่าเก็บเป็น contract หรือปรับ)

| # | ของใน spec | สถานะใน prototype |
|---|---|---|
| B1 | Same User + Different Asset = ห้องเดิม + Reference เปลี่ยนเป็น asset ล่าสุด (AC-CHAT-003/004) | ไม่มี — thread key คือ user+item → ห้องใหม่เสมอ (ดู C1) |
| B2 | Asset Reference states: Active / **Sold** / **Deleted → `รายการนี้ไม่พร้อมใช้งานแล้ว`** (AC-CHAT-005/007/009) | `ch-post-card` snapshot นิ่ง — sold/deleted ไม่เปลี่ยนการ์ด; tap post ที่หาย → toast `Listing detail isn't in this prototype yet` (ดู C2) |
| B3 | File message type (§6 scope + Message Type Rule) | ไม่มี — attach = photos/videos เท่านั้น |
| B4 | **Offer ทั้งชุด**: Offer Card 6 states (Pending/Paused/Accepted/Rejected/Cancelled/Invalidated), Incoming Offers view/filter, Make-Offer→Chat flow, offer→chat notification destinations (§4/§6/§10/§15 + AC-CHAT-016–021B) | ถูกถอดหมดแล้ว (0 hit) — เข้า removal scope FSP-006/007 |
| B5 | Block confirm: copy `Block this user?` + Cancel/Block, cancel ไม่เปลี่ยน state (§9 + AC-CHAT-026B) | sheet `Block {user}?` ไม่มีปุ่ม Cancel (dismiss=backdrop เท่านั้น) — semantics ตรง, copy/format ต่าง (ดู C6) |
| B6 | Delete Chat copy: `Delete chat?` + body 3 บรรทัด (inbox-only/other person sees/retained for safety) + toast `Chat deleted` + error `Unable to delete chat…` (§10 Delete Chat Rule + §13) | iOS modal `Are you sure you want to delete this chat?` + `ลบแชทเรียบร้อยแล้ว` (ตรง §1.1 แต่ขัด §10 — spec ขัดกันเอง, ดู C4) |
| B7 | Send error state `ส่งข้อความไม่สำเร็จ…` / `Unable to send message.` (§13) | ไม่มี — mock ส่งสำเร็จเสมอ (blocked → composer ถูกแทน bar ไม่ใช่ error) |
| B8 | Chat list sort = Latest Message DESC ตลอด (AC-CHAT-013) | seed order นิ่ง + re-sort เฉพาะตอนส่ง (unshift); pin overrides — ใกล้ spec แต่ไม่มี timestamp จริงให้เรียง |
| B9 | Search Chat contract-level (§10 Search Chat Rule) | มีจริง list+item+room search — ตรงและเกิน (นับเป็น aligned) |
| B10 | Empty states `ไม่พบข้อมูล`/`No data found` ทั้ง Chat List + Incoming Offers (§14) | custom copy ทุกจุด (A3) + Incoming Offers ไม่มี (ดู C10) |
| B11 | Global Login Required Dialog เมื่อ guest กด Chat (AC-CHAT-023) | member sheet (Join TukDaeng gate) — copy/UX ต่าง, ซ้ำประเด็น 001a C (ดู C7) |
| B12 | Unable To Send state / Pre-Chat empty room เป็น screen mapping (§7) | draft room มี post card + composer เติม quick text — ไม่มี dedicated empty/error state |
| B13 | Analytics `Chat *` 14 events + `notification_*` 9 events | ไม่มี tracking layer (contract-level เหมือนทุก task) |
| B14 | Notification types ตาม baseline: Like, Comment, Follow, **Offer**, Watch Alert (AC-NOTI-002) | มี like/comment/follow/watch — **ไม่มี offer** (removal) + **มี system เพิ่ม** (ดู C11) |
| B15 | Destinations: Like→Asset Detail, Comment→Asset Detail+Focus comment, WA→Result List, offer→chat/asset (§10) | post viewer ทุก type (A9) — asset detail ไม่ใช่ destination เลย (ดู C12/C13) |
| B16 | Deleted asset → `รายการนี้ไม่พร้อมใช้งานแล้ว`; deleted user → `ไม่พบผู้ใช้งาน`; deep link failed → `ไม่สามารถเปิดข้อมูลได้`; load failed → `ไม่สามารถโหลดข้อมูลได้` + `ลองใหม่` (§12/§13 + AC-NOTI-011) | ไม่มี state เหล่านี้ — fallback เดียว = toast `This post is no longer available` (ดู C15) |
| B17 | Validation routing table §12 (Missing/Deleted/Under Review/Hidden/Deleted User/Permission/Unsupported) | ไม่มี routing validation เลย — mock data resolve ได้เสมอ |
| B18 | Member เห็นเฉพาะ notification ตัวเอง + FCM push (§11/§15) | single-user mock — ไม่มี push/permission surface |
| B19 | Retention / preference center / moderation / account-action types = ห้ามใน V1 (§6 Out of scope) | ไม่มี moderation/account ✓ — แต่ **มี preference page + system type** (ดู C11/C16) |
| B20 | Chat notification rule: New Message = in-chat badge เท่านั้น ไม่ใช่ Notification Center type (§15 ทั้ง 07/09) | ตรง — alerts feed ไม่มี chat type, chat badge = nav pill รวม unread ✓ (aligned, บันทึกไว้ว่าไม่ใช่ gap) |

---

## C. ขัดกันโดยตรง (conflicts ต้อง sync)

| # | Spec บอก | Prototype ทำจริง | ข้อเสนอ |
|---|---|---|---|
| C1 | Different asset same user → ห้องเดิม + reference เปลี่ยน (AC-CHAT-003/004, §10 Different Asset Rule) | thread key = user+item → **ห้องใหม่ทุก item** + การ์ด ref ต่อห้อง | ขัดทิศ — เลือก per-item rooms ตาม prototype (เขียน spec ใหม่เป็น "thread ต่อ user+listing") หรือบังคับ room-merge — **ต้อง sign-off** กระทบ data model + Items tab semantics |
| C2 | Asset Reference Card + unavailable/sold states `รายการนี้ไม่พร้อมใช้งานแล้ว` (AC-CHAT-005/007/009) | `ch-post-card` post snapshot; tap → post detail หรือ toast; ไม่มี state ใด ๆ | เขียน spec เป็น post-reference-card ตาม prototype + เพิ่ม unavailable rule เป็น contract (prototype ยังไม่โชว์) — ตัดสิน FSP-020 |
| C3 | AC-CHAT-032: menu = 3 ปุ่มวงกลม (Mute/Profile/Block); §10: overflow `...` list 5 items (View profile/Mute/**Delete chat**/Report/Block) | `≡` → chmenu **4 ปุ่มวงกลม** (มี Report) + ไม่มี Delete chat ในหน้า (delete มีแค่ swipe บน list + dead `chsettings`) | spec ขัดกันเองอยู่แล้ว (§10 vs AC-032) + prototype เพิ่ม Report เป็นปุ่มที่ 4 — เขียนใหม่ตาม prototype: menu page 4 actions + rows; ตัดสินว่า Delete chat ควรอยู่ตรงไหน |
| C4 | Delete Chat copy §10 (`Delete chat?` + 3-line body + `Chat deleted`) และ semantics "ซ่อนฝั่งผู้กด ไม่ลบ server" | copy ตาม §1.1 (iOS `Are you sure…`) + **ลบ thread+msgs จริงใน mock** | spec ขัดกันเอง §1.1 vs §10 — unify copy; semantics ให้เขียนเป็น "remove from actor list" + retention note (mock ลบจริงเป็น prototype simplification) |
| C5 | Blocked room: spec §8 read-only history + ปิดส่ง (copy `ไม่สามารถส่งข้อความได้`) | `ch-blocked-bar` `You blocked this account` / `can't message or call them` + Unblock — **copy พูดถึง call ที่ไม่มีใน scope** | แก้ copy ตัด "or call"; เขียน blocked-bar pattern ลง spec (ตรงเจตนา AC-CHAT-024/026A) |
| C6 | Block confirm `Block this user?` + Cancel/Block (AC-CHAT-026B + §9 flow) | `Block {user}?` sheet + Block เดียว (fromChat) + dismiss=backdrop | ตาม pattern เดียวกับ 003a C9 — เขียน spec เป็น IG sheet (แนะนำ) |
| C7 | Guest กด Chat/Notification → Global Login Required Dialog (AC-CHAT-022/023, AC-NOTI-001) | `[data-navgo="chat"/"alerts"]` อยู่ใน GUEST_GATE_SEL → member sheet; guest เห็นแค่ icon (list/feed ว่างอยู่แล้วผ่าน chatInit/alInit guard) | พฤติกรรมตรง (gate ก่อนเข้าหน้า) แต่ dialog เป็น member sheet — ซ้ำประเด็น copy จาก 001a; guest เห็น: nav icon + badge ว่าง + ทุก chat action (ask-pill/chat-fab/report/block/mute) โดน gate |
| C8 | Message types: Text, Image, File, **Asset Card**, **Offer Card** (AC-CHAT-011) | text + image/video + **post ref card**; ไม่มี File/Offer | File → spec-only contract; Asset Card → rename เป็น post ref card; Offer → removal list |
| C9 | Mute toast `Notifications muted`/`unmuted` (§10 menu rule) | TH `ปิด/เปิดการแจ้งเตือนแล้ว` + mute state เดียวกันใช้ทั้ง swipe + menu button | copy ไม่ตรง — เขียน language pair ลง spec |
| C10 | Empty copy `ไม่พบข้อมูล`/`No data found` (§14 ทั้ง chat + noti) | custom ทุกจุด: `No chats yet`/`Tap Ask…`, `No chats found`, `No item chats yet`, `No alerts yet`+desc, `Item not found` | copy ต่าง — รวมกับ gap เดิมของทุก module (empty copy ไม่เคยตรง spec ใน prototype) |
| C11 | V1 types เฉพาะ Like/Comment/Follow/Offer/Watch Alert; type นอก baseline ห้ามแสดง (AC-NOTI-002/003) | มี `system` (`A new device just logged in…` → dead toast) + ไม่มี offer | `system` = prototype-only type → ตัดสิน: เก็บเป็น type ใหม่ (security) หรือตัดออก (001b flag ไว้แล้ว); offer → removal |
| C12 | Watch Alert notif → **Result List เท่านั้น** ห้ามเปิด Asset Detail ตรง (AC-NOTI-007 + §10 WA rule) | เปิด post viewer ตรง (+solo header+Follow inject) | ซ้ำ 001b — model ไม่มี Result List; ต้องตัดสินว่า destination = post viewer (เขียน spec ใหม่) หรือสร้าง result list |
| C13 | Comment notif → Asset Detail + **focus comment** (AC-NOTI-005) | post viewer เฉย ๆ ไม่ focus | post viewer ไม่มี comment-focus affordance — เขียน spec เป็น "เปิด post (viewer)" หรือเพิ่ม requirement focus |
| C14 | Mark-as-read เมื่อเปิด item (AC-NOTI-010) | ✓ + เพิ่ม **Mark all as read** + **dismiss x** (follow rows) + **inline Follow back** | ตรง spec + extras ที่ spec ไม่มี — เขียน extras ลง spec หรือ mark เป็น prototype-only |
| C15 | Deleted/unavailable destination → unavailable states + copy กลาง (AC-NOTI-011, §12/13) | toast เดียว `This post is no longer available`; ไม่มี deleted-user/user-not-found/deep-link-failed/load-failed+retry | ทั้งชุดเป็น contract-only — spec เก็บ states; prototype ยังไม่ implement (ตัดสินว่าจะ demo state ไหม) |
| C16 | Notification preference center = **out of scope V1** (§6) | `notif_settings` page 4 toggles (likes/comments/follows/walerts) มีจริง | ขัดโดยตรง — เขียนเข้า spec (เป็น settings feature) หรือถอดออกจาก prototype — ต้อง sign-off (กระทบ FSP-013/014) |
| C17 | Chat entry: จาก Asset Detail/notification flows ที่ spec map ไว้ | เข้าได้เฉพาะ `ask-pill`/`chat-fab`/Items/Chats list — **profile `pf-msg` = dead toast** `Open a listing to chat with this seller` (ยืนยัน context 003a), follower-row Chat = dead เช่นกัน | chat entry = listing-scoped เท่านั้น — เขียน spec ว่า start chat ต้องผ่าน listing (ไม่มี user→user chat เปล่า) |
| C18 | Spec §1.1: `Report and delete` ลบแชท+history | ทำจริงหลัง report flow ปิด (`rpDelChat` + splice + unshift `chat`) | ตรง spec — บันทึก aligned (ไม่ใช่ gap) |
| C19 | Chat name/title ใน nav = Chat; notification = "Notification Center" | tab `แชท` + tab `แจ้งเตือน/Alerts` — module 09 ชื่อ Notification แต่ UI ใช้ Alerts | naming drift ซ้ำ 001b — unify ตอนเขียน spec 09 (เลือก Alerts ตาม UI หรือ Notifications) |

---

## สรุปสำหรับ task ถัดไป

- **FSP-020 (07_CHAT rewrite):** spec เก่า §2–§17 เป็น Offer/Asset-Reference model ที่ไม่มีใน prototype — เขียนใหม่รอบ §1.1 + รายละเอียดจาก A1–A7 (thread=per user+item, post ref card, swipe, chmenu 4 actions, gallery, chatcfg, dead routes ตัดทิ้ง); เก็บ contract-only items (file type, unavailable ref state, send error, retention) ไว้หรือตัดตาม sign-off
- **FSP-021 (09_NOTIFICATION + 10_WATCH_ALERT):** feed = IG activity list; types = like/comment/follow/watch (+system ต้องตัดสิน); destinations = post viewer/profile (ไม่มี Result List/focus comment); extras = mark-all/dismiss/follow-back/group headers/notif_settings
- **FSP-006/007 (removal):** offer refs ใน 07 §2/§4/§6/§9/§10/§15/§16/§17 (AC-CHAT-016–021B ทั้งก้อน) + 09 §10/§15/§17 (Offer rows/ACs) — เยอะสุดใน 07
- **FSP-009 (dead features):** `chsettings:` route ไร้ entry, `.chat-pop`/`.cp-*` unreachable path, wallpaper dead toast — เป็น prototype dead code (spec ฝั่งไม่มี; ถ้าจะเก็บ spec-only claims เช่น E2E ต้องตัดสินเพิ่ม)
- **Verify:** `git status --porcelain Prototypes/` ว่าง — ไม่แตะ prototype
