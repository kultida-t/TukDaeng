# 07 Chat Module

อ้างอิงหลักจาก [TukDaeng_Master_Product_Definition.md](TukDaeng_Master_Product_Definition.md) + baseline [00_GLOBAL_RULES_MODULE.md](00_GLOBAL_RULES_MODULE.md) §7 (session), §9–§10 (status/visibility), §11 (guest gate), §12 (lifecycle — chat อยู่เมื่อ sold/deleted), §13 (block/report impact), §14 (private data) + [00_NAVIGATION_AND_CROSS_MODULE_FLOW.md](00_NAVIGATION_AND_CROSS_MODULE_FLOW.md) §6.1–§10 (layer model, routes, back, entry matrix, unavailable contract) + [06_PROFILE_MODULE.md](06_PROFILE_MODULE.md) (blkSheet/unblockDlg/report stack/`pf-msg` dead canonical — FSP-019 lock) + [05_ASSET_DETAIL_MODULE.md](05_ASSET_DETAIL_MODULE.md) (Post Detail entry semantics — FSP-018 lock) + [02_FEED_MODULE.md](02_FEED_MODULE.md) (post model canonical) — prototype `Prototypes/fo-flow/index.html` เป็น source of truth เดียวของพฤติกรรม (FO-PRD-v1.9)

---

# 1. Document Information

| Item | Detail |
|---|---|
| Module Name | Chat (Chat Center — spec เดิมตีความเป็น Offer-centric + Asset Reference model; prototype คือ LINE/IG Direct-style chat ที่ thread ผูก user + listing) |
| Platform | Mobile Application |
| Version | V1 |
| Owner | Product / UX / Engineering |
| Status | Draft |
| Document Type | Functional PRD - Master Aligned |

---

# 2. Objective

Chat คือ member-only surface บน bottom-nav `แชท` (route root `chat` + stack ของหน้าย่อย) สำหรับสนทนาระหว่างผู้ซื้อกับเจ้าของ listing — ห้องสนทนาผูกกับคู่ **user + item (listing)** เสมอ: ทัก seller เดิมแต่คนละโพสต์ = ห้องใหม่พร้อม post reference card ของโพสต์นั้น (ไม่มี room merge, ไม่มี user→user chat เปล่า ๆ)

Chat Center มี 2 มุมมอง: **Chats** (เรียงตามคู่สนทนา) และ **Items** (จัดกลุ่มตาม listing — `Your listings` ของตัวเอง / `Items you asked about`) ห้องแชทเป็นแบบ LINE/IG Direct: bubble ซ้าย-ขวา, day divider, avatar เฉพาะกลุ่มแรก, เวลาข้าง bubble, `Sent`/`Read` บนข้อความล่าสุดของฝั่งเรา, post reference card ในสายข้อความ, attach photos, search ในห้อง, เมนูห้อง (`≡` → `chmenu:`) พร้อม Mute/Profile/Block/Report, media gallery select-mode, และ Chat Config (`chatcfg`)

โมดูลนี้ต้องคุม thread lifecycle (draft → first send), swipe actions (pin/mute/hide/delete), block/unblock ผ่าน shared `blkSheet`/`unblockDlg` ของ 06_PROFILE (canonical S-13), report flow ที่ข้าม picker ของแชท (`Report and delete` / `Report`), guest gate ด้วย Member Sheet และ reset rules เมื่อสลับ nav — โดยยึดพฤติกรรม prototype เป็นตัวตัดสินเมื่อ spec เดิมขัดกัน

---

# 3. Prototype Reference

Source of truth: `Prototypes/fo-flow/index.html` (read-only — ห้ามแก้)

- Routes (`subHTML` ~17696–17702): `chat` → `chatListHTML`, `chatitem:{itemId}` → `chatItemHTML`, `chatroom:{threadId}` → `chatRoomHTML`, `chmenu:{threadId}` → `chatRoomMenuHTML`, `chsettings:{threadId}` → `chatRoomSettingsHTML` (**dead route** — ไม่มี emit `data-chgo="chsettings"` ที่ไหน), `chmedia:{threadId}` → `chatMediaGalleryHTML`, `chatcfg` → `chatCfgHTML`
- State: `CHAT` (~17791–17794 — `view`/`itemFilter`/`filterMenuOpen`/`q`/`iq`/`threads`/`draft` + `cfg{notif,preview,followOnly,defView,quick}` default quick `สนใจสินค้าชิ้นนี้ครับ ยังอยู่ไหมครับ?`), `chatInit` seed (~17795–17834 — non-member → `threads=[]`; member seed = own items `M1`/`M2` + `ref(post)` threads; thread fields `id/user/item{id,cap,price,photo,owner,pid}/unread/draft/pinned/pinnedAt/muted/hidden/blocked/msgs[{f,t,at,day,read,img,isVideo}]/media[]/galState/searching/roomQuery`), `chatResetToDefault` (~17835–17842), `chGet` (threads ∪ draft ~17843–17846), `chTimeLbl`/`chUnread`/`chBadgeHTML`/`chBadgeSync` (~17847–17858 — badge cap `99+`), `chPostRender` (~17860–17863), `chEmptyHTML` (~17864), `chatNavHTML` = `botNavHTML("chat")` (~17865–17867 — nav เฉพาะหน้า list)
- List helpers: `chThreadMatch` (~18474–18476 — match `user + item.cap + msg texts`), `chRowHTML` (~18477–18511 — avatar + pin badge + name + `Blocked` chip/mute icon + `You: ` preview + time + unread pill + swipe wrap), `chItemGroups` (~18512–18521 — group ตาม `item.id`, `mine = item.owner===CP_ME.name`, เก็บ insertion order), `chItemRowHTML` (~18522–18540 — mine → `{price} · N chats`; asked → `{price} · last msg`; `isDirectRoom` = !mine && 1 thread → `data-chgo="room"`), `chListBody` (~18541–18567 — pin-first sort + `pinnedAt` tie-break + filter sections + empties), `chatListHTML` (~18568–18619 — Chats/Items pill + Items caret + filter popover `Filter items by` (All items/Your listings/Items you asked about + checkmark) + gear `data-chgo="cfg"` + `ch-q` search), `chItemBody`/`chatItemHTML` (~18620–18655 — head `Item chats` + floating pill itemcard (`Your listing`/`@{owner}` · N chats) + `ch-iq` `Search people or messages` + rows)
- Room: `chatRoomHTML` (~18656–18750 — header back + `data-pf-user` name + `room-search` + `more` ≡; searching header (placeholder `Messages` + clear + ✕); `ch-post-card` (`data-chgo="post"` + top scrim avatar/user + bottom scrim cap/price) ใน `.ch-m me` เมื่อ msgs ว่าง หรือแนบ msg แรก; `ch-day` divider; `them` avatar เฉพาะต้นกลุ่ม (`ch-mav-sp`); `Sent`/`Read` เฉพาะ `lastMe`; `formatText` + `<mark class="ch-hl">` + dim `opacity:0.25` (media dim เสมอตอน search); blocked → `ch-blocked-bar` (`You blocked this account` + `You can't message or call them unless you unblock them.` + `Unblock`); composer `+` attach + `ch-input` + `ch-send` disabled จนมี text), `openChatAttachSheet` (~18752–18795 — `Photos & videos` grid ≤8 unique photos จาก POSTS, `isVideo:false`), `openChatMediaViewer` (~18796–18814 — overlay X/backdrop close), `chatRoomMenuHTML` (~18816–18896 — head back + username; 4 ปุ่มวงกลม Mute/Unmute·Profile(`data-pf-user`)·Block/Unblock·Report; rows `Photos & videos` → `chmedia:` + thumb strip/`No photos or videos found.`; `Listings & Items` (cap truncate) → `data-chgo="post"`; footer `This chat is protected with End-to-End Encryption`), `chatMediaGalleryHTML` (~18898–18980 — head ✕/`{n} selected`/`Select`/`Cancel`/`Deselect` + grid + date label hardcode `October 2569 BE` + select badges ลำดับ + bottom bar Trash/Download + empty card), `chatRoomSettingsHTML` (~18981–19036 — **dead page**: Note notifications toggle, Chat wallpaper dead toast, Export chat history → clipboard + `คัดลอกประวัติแชทเรียบร้อยแล้ว`, Encryption keys `Letter Sealing` row, Delete data, Report), `chatCfgHTML` (~19037–19057 — toggles `notif`/`preview`/`followOnly` + defView Chats/Items + `chc-quick` ≤80)
- Actions: `chSend` (~19058–19072 — blocked guard, `t.hidden=false`, draft → unshift เป็น thread จริง, move-to-top, push `{f:"me",at:"09:41",day:"Today",read:false}`, clear draft, refocus), `chatQuickAsk` (~19073–19092 — own → `This is your own listing`; blocked → `Cannot message a blocked account`; find thread `user+item.id` → un-hide; else `C.draft` prefill `cfg.quick` + item snapshot; remove `pv-open/detail-open/comments-open/pm-open/likes-open/details-open` → `openSub chatroom:{id}`), `openChatHideConfirm` (~19101–19128 — `Hiding chats doesn't delete their messages.` Cancel/Hide → `t.hidden` + `ซ่อนแชทแล้ว`), `openChatDeleteConfirm` (~19130–19167 — `Are you sure you want to delete this chat?` Cancel/Delete → splice + `ลบแชทเรียบร้อยแล้ว` + unwind `chatroom:`/`chmenu:`/`chsettings:` tops), `chatClick` (~19170–19443 — `data-chact` pin/mute/hide/del/block-user/unblock-room/report-chat-user/export-chat/wallpaper/report-chat + filter popover + `data-chview` + `data-chtgl`/`data-chdef` + `data-chgo` room/item/cfg/more/chsettings/chmedia/attach/room-search/post + `data-chsendmedia` + `data-chmedia` + gallery select/trash/download + send + `.ask-pill,.chat-fab`), swipe gestures (~19445–19530 — reveal ±40px, dismiss ±30px, vertical abort, rubber-band cap, suppress click 250ms)
- Block/report shared: `blkSheetHTML(u, fromChat)` (~16891–16906 — fromChat → `Block` เดียว), `chatReportSheetHTML` (~16908–16919 — `Are you sure you want to report {u}?` + `Report and delete`/`Report`/`Cancel`), `unblockDlgHTML` (~16921–16928), `pfSetBlocked`/`pfIsBlocked` (~16868–16888 — `th.blocked` loop ทุก thread ของ user + `p.blocked` + feed re-render), handlers `ch-rep-del-btn`/`ch-rep-only-btn`/`ch-sheet-cancel-btn` (~21757–21787 — set `rpFromChat`/`rpDelChat` → `rpPush report:user`), report head ไม่มี `<` เมื่อ `rpFromChat` (~17713/~17745), `rp-step` block → `blkSheetHTML(u, rpFromChat)` (~21812–21822), `rp-done` → `rpClose` + `Report submitted · thanks for letting us know` (~21830–21836), `rpClose` delete wiring (~15125–15144 — `hadDone && rpDelChat` → `t.hidden` + ออกจาก `C.threads` + strip `chmenu:`/`chatroom:` + unshift `chat`), `dlg-unblock-go` → `pfSetBlocked(false)` + `Unblocked` (~20888–20896), `blk-go` → `Blocking` toast (~21798–21808)
- Entries: `askBtnHTML` (~13379–13387 — styles ตาม `state.ask`: ico/txt/outline/solid; `auto`→solid/outline; label `สอบถาม`/`Ask` + title `สอบถามผู้ขาย`/`Ask seller`), feed card action-row + `price-footer` variant (~14255/~14280), pv post actions (~14713 — `p.type==="sale"` เท่านั้น), `data-chgo="post"` → `openPostDetail` หรือ `Listing detail isn't in this prototype yet` (~19325–19334), ask fallback `findPost` ไม่เจอ → `Not in this prototype yet` (~21996–21997), room `.ch-input` draft persist + send-enable (~20223–20227), `ch-room-search-in` live (~20228–20242), `ch-q`/`ch-iq` live (~20243–20254), `chc-quick` live (~20255), Enter → `chSend` (~20138)
- Nav/session: `data-navgo` → `chatResetToDefault()` + `openSub` (~21484–21501), chat/profile pages slide-back-out-right (~20977 — `topSub.startsWith("chat"/"chmenu:"/"chsettings:"/"profile:")` && stack>1 → `rpBack`), `chmedia:` close = pop + swap (~20965–20976), `applySessionData` reset `CHAT.inited/threads/draft` (~23230), `chatInit` non-member guard (~17798)
- Gate: `GUEST_GATE_SEL` (~23269–23278 — chat-family gated = `[data-navgo="chat"]`, `.ask-pill`, `.chat-fab`, `.ch-rep-del-btn`, `.ch-rep-only-btn`, `.blk-go`, `.blk-rep`), `obGate` (~23279–23283)
- Dead/tooling (ห้ามเขียนเป็น feature): `chsettings:{id}` route + หน้าทั้งหน้า (no emit), `chatPopHTML`/`.chat-fab`/`.cp-*`/`sendChat`/`closeChatPop` (~13488–13529 + handlers ~22016–22036 — render เฉพาะ `state.ask==="bubble"` ใน dl2 `igDetailHTML` (~13605) + ถูก `chatQuickAsk` intercept ทุกกรณี → `.chat-pop` unreachable), `state.ask` variant flag (dev artifact), `pfRestrictHint` defined แต่ไม่มี call site (~16930–16938), E2E/`Letter Sealing` copy claims ไม่มี implementation

---

# 4. Master Alignment Summary

| Topic | Master Baseline | Chat Module Rule |
| --- | --- | --- |
| Chat ใช้สนทนาผู้ซื้อ–ผู้ขาย | master เดิม | ตรง — แต่ thread ผูก **user + listing** ไม่ใช่ user คนเดียว (per-item rooms ตาม prototype) |
| Room creation | สร้างเมื่อส่งข้อความแรก | ตรง — `C.draft` สร้างตอนกด Ask; เข้า `C.threads` เมื่อ `chSend` แรกเท่านั้น |
| Reference Asset | Asset Reference Card + states (spec เดิม) | **post reference card** snapshot (รูป + owner + caption + price) — ไม่มี sold/deleted state บนการ์ด; tap → Post Detail ตาม 05 (missing → toast + unavailable contract) |
| Lifecycle โพสต์ | 00_GLOBAL §12 — chat อยู่เมื่อ sold/deleted | thread + ประวัติคงอยู่; การ์ดเป็น snapshot นิ่ง; tap post ที่หาย → `Listing detail isn't in this prototype yet` (contract: `รายการนี้ไม่พร้อมใช้งานแล้ว` ตาม 00_GLOBAL §11/00_NAV §10) |
| Block | 00_GLOBAL §13 + canonical 06 (S-13) | shared `blkSheetHTML(u, fromChat=true)` → `Block` ปุ่มเดียว; effects เดียวกับ profile (PF_BLOCKED + unfollow + `th.blocked` + `p.blocked`); room = read-only + `ch-blocked-bar` + `Unblock` |
| Report | 00_GLOBAL §13 + report stack 00_NAV §6.1/§6.6 | chat entry ข้าม `report:pick` → `report:user` ตรง (ไม่มี `<`, เฉพาะ ✕) + `Report and delete` path |
| Guest gate | 00_GLOBAL §11 Member Sheet | ทุก chat entry อยู่ใน `GUEST_GATE_SEL` — guest เห็นแค่ nav icon; session `new`/`guest` → `threads=[]` |
| Private data | 00_GLOBAL §14 | chat surfaces ไม่แสดง private data (purchase cost/sold history อยู่ 04/14) |
| Deep link | 00_NAV §10/§12 | contract เท่านั้น — prototype ไม่มี chat deep link |
| ไม่มีใน V1 | — | Offer ทั้งชุด (ถอดแล้ว), File message, Asset/Offer card types, typing indicator, incoming simulation, real read receipts, E2E encryption, chat wallpaper, export chat, room settings page (`chsettings` dead), chat จาก profile/follower row (`pf-msg` dead — canonical 06), chat entry บน Post Detail (canonical 05), voice/group/edit/reaction/pinned message |

---

# 5. Scope

## In Scope

- Chat Center root `chat` — Chats view (rows, unread, pin/mute/blocked chips, `You:` preview, time, search `ch-q`) + Items view (sections, filter popover, `isDirectRoom`) + gear → `chatcfg`
- `chatitem:{itemId}` — item chats page (floating pill itemcard, `ch-iq`, rows + swipe)
- `chatroom:{threadId}` — LINE-style room (header, bubbles, day dividers, `Sent`/`Read`, post ref card, composer, draft persist, blocked bar)
- Room search mode (`room-search` → header swap, highlight + dim)
- Attach sheet + media message + `ch-media-viewer` overlay
- `chmenu:{threadId}` — 4 circular actions + media strip + `Listings & Items` row
- `chmedia:{threadId}` — gallery + select mode + Trash/Download
- `chatcfg` — toggles + default view + Quick Ask text
- Swipe actions (Pin/Mute circular + Hide/Delete rect + iOS confirm modals)
- Quick Ask entry (`.ask-pill` surfaces) + own/blocked guards + draft room
- Block/Unblock ผ่าน shared surfaces (`blkSheet` fromChat, `unblockDlg`, `th.blocked` sync)
- Report จาก chat (`chatReportSheet` → `report:user` → `report:done` + `rpDelChat` unwind)
- Guest gate + session semantics + nav reset + back behavior
- Deviations vs spec เดิม + dead code + quirks

## Out Of Scope (module อื่นเป็นเจ้าของ)

- Post model / `findPost` / eligibility — canonical [02_FEED_MODULE.md](02_FEED_MODULE.md); เอกสารนี้ระบุเฉพาะ `ask-pill` entry + item snapshot fields
- Post Detail internals — [05_ASSET_DETAIL_MODULE.md](05_ASSET_DETAIL_MODULE.md) (FSP-018); เอกสารนี้ระบุเฉพาะ `data-chgo="post"` handoff
- `blkSheetHTML`/`unblockDlgHTML` anatomy + `pfSetBlocked` effects + `pf-msg` dead — canonical [06_PROFILE_MODULE.md](06_PROFILE_MODULE.md) (FSP-019); เอกสารนี้ระบุเฉพาะ fromChat variant + room effects
- Report stack mechanics (`rpPush`/`rpBack`/`rpClose`/`PM_REASONS`) + moderation semantics — [15_TRUST_SAFETY_MODULE.md](15_TRUST_SAFETY_MODULE.md); เอกสารนี้ระบุเฉพาะ chat entry paths (`rpFromChat`/`rpDelChat`)
- Member Sheet internals — 00_GLOBAL §11 / 01_AUTH; Bottom nav + layer model — 00_NAV §6
- Notification center / alerts feed — [09_NOTIFICATION_MODULE.md](09_NOTIFICATION_MODULE.md) (FSP-021); chat badge = nav pill เท่านั้น
- Settings `blocked` list (`m-unblock`) — [13_SETTINGS_MODULE.md](13_SETTINGS_MODULE.md)
- BO moderation — master contract เท่านั้น
- External deep-link routing — contract 00_NAV §10/§12

---

# 6. Screen Mapping

| Screen / State | Prototype | Description |
| --- | --- | --- |
| Chat List — Chats view | `chat` + `chatListHTML` view `user` | pill tabs + gear + `ch-q` + thread rows + swipe wraps + bottom nav |
| Chat List — Items view | `chat` view `item` + `chItemGroups` | sections `Your listings`/`Items you asked about` + aggregate rows |
| Items Filter Popover | `.ch-filter-popover` + `.ch-filter-backdrop` | `Filter items by` + 3 options + checkmark (เปิดเมื่อแตะ Items pill ซ้ำ) |
| Item Chats | `chatitem:{itemId}` + `chatItemHTML` | head `Item chats` + floating pill itemcard + `ch-iq` + rows + swipe |
| Chat Room | `chatroom:{threadId}` + `chatRoomHTML` | header + bubbles + post ref card + composer (หรือ blocked bar) |
| Chat Room — Searching | `chatroom:` `t.searching` | header แทนด้วย search box + highlight/dim |
| Chat Room — Draft | `C.draft` thread | post card ใน me-column + composer prefill `cfg.quick` |
| Chat Room — Blocked | `chatroom:` isBlk | `ch-blocked-bar` แทน composer |
| Attach Sheet | `.ch-attach-sheet` | `Photos & videos` grid ≤8 จาก POSTS (mock picker) |
| Media Viewer | `.ch-media-viewer` overlay | fullscreen-in-frame photo + X/body close |
| Chat Menu | `chmenu:{threadId}` | 4 circular actions + `Photos & videos`/`Listings & Items` rows + E2E footer |
| Media Gallery | `chmedia:{threadId}` | ✕ + username + Select → `{n} selected` + badges + Trash/Download |
| Chat Config | `chatcfg` | notif/preview/followOnly toggles + defView + Quick Ask input |
| Room Settings (dead) | `chsettings:{threadId}` | dead route — ไม่มี entry; documented only |
| Block Sheet | `pm-open` + `blkSheetHTML(u,true)` | avatar + `Block {u}?` + 3 impact rows + `Block` เดียว |
| Unblock Dialog | `.dlg` + `unblockDlgHTML` | `Unblock {u}?` + Unblock/Cancel |
| Chat Report Sheet | `pm-open` + `chatReportSheetHTML` | `Report and delete`/`Report`/`Cancel` |
| Report Stack (chat) | `report:user` → `report:done:{u}` | ไม่มี `<` (rpFromChat); ✕ ปิดทั้งกอง |
| Hide/Delete Modals | `#chConfirmModal` iOS-style | Cancel + Hide/Delete (แดง) |
| Member Sheet | `.ob` gate variant | guest gate — canonical 00_GLOBAL §11 |

---

# 7. User States

## Guest (session `guest`)

- เห็นเฉพาะ icon `แชท` บน bottom nav — ทุก chat entry (`[data-navgo="chat"]`, `.ask-pill`, `.chat-fab`, `.ch-rep-del-btn`, `.ch-rep-only-btn`, `.blk-go`, `.blk-rep`) เปิด Member Sheet `Join TukDaeng`
- `chatInit` → `threads=[]` (guard ซ้ำ) — guest ไม่มี surface ใดของ chat เลย

## New Member (session `new`)

- member powers ครบ แต่ `threads=[]` → Chat List แสดง `No chats yet` + `Tap Ask on a post to start chatting with the seller.`
- Ask จากโพสต์ใช้ได้ปกติ (สร้าง draft room ของตัวเอง)

## Member

- ใช้ Chat Center ครบ: list 2 views, search, item chats, room, attach, gallery, chmenu, chatcfg, swipe actions, block/unblock, report
- เป็นผู้ซื้อ (`Items you asked about`) และผู้ขาย (`Your listings`) ได้ใน account เดียว — `mine` ขับด้วย `item.owner===CP_ME.name`

## Blocked Relationship

- Room ของ user ที่ถูก block: composer ถูกแทนด้วย `ch-blocked-bar` + `Unblock`; ประวัติอ่านได้ read-only
- Thread row แสดง `Blocked` chip (แทน mute icon); ห้องยังอยู่ใน list จนกว่าจะ hide/delete
- Ask ไปยัง seller ที่ block อยู่ → toast `Cannot message a blocked account` (ไม่สร้างห้อง)
- `chSend` guard ซ้ำ (`pfIsBlocked || t.blocked`) — ส่งไม่ได้แม้ UI หลุด

---

# 8. User Flow

## Open Chat Center

```text
Bottom nav แชท (guest → Member Sheet)
→ chatResetToDefault() — ทุก data-navgo
→ openSub "chat" (swap ทันทีไม่ slide)
→ Chat List = view = cfg.defView (default Chats)
```

## Start Chat (Quick Ask)

```text
ask-pill บน feed card / price-footer / pv post (sale เท่านั้น)
→ guest → Member Sheet
→ own post → toast `This is your own listing`
→ blocked seller → toast `Cannot message a blocked account`
→ thread user+item มีอยู่ → un-hide + openSub chatroom
→ ไม่มี → C.draft (prefill cfg.quick + item snapshot) → openSub chatroom
→ send แรก → unshift เข้า threads (ห้องเกิดจริง)
```

## Continue Chat / List Interactions

```text
Chat List row → rpPush chatroom → back slide-out-right → list
Search ch-q → live filter (user + cap + msgs)
Items pill → view=item (เคลียร์ q); แตะซ้ำ → filter popover → pick → กรองทันที
Item row (asked, 1 thread) → เข้าห้องตรง; (mine หรือหลาย thread) → chatitem:
chatitem: row → chatroom; back → chatitem: → back → chat list
```

## Swipe Actions (row ใน list + chatitem)

```text
Swipe right >40px → ปุ่มวงกลมเขียว Pin/Unpin + Mute/Unmute
  Pin → pinnedAt + toast ปักหมุดแชทแล้ว/ยกเลิกการปักหมุดแล้ว → เรียงก่อน + badge บน avatar
  Mute → toast ปิด/เปิดการแจ้งเตือนแล้ว → mute icon บน row
Swipe left >40px → ปุ่มสี่เหลี่ยมเทา Hide + Delete
  Hide → iOS modal → t.hidden + toast ซ่อนแชทแล้ว (un-hide อัตโนมัติเมื่อส่ง/Ask ใหม่)
  Delete → iOS modal → ออกจาก threads + toast ลบแชทเรียบร้อยแล้ว + unwind stack กลับ list
แตะ row ที่ reveal อยู่ หรือ swipe ตรงข้าม >30px → ปิด actions
```

## Room Interactions

```text
Header: < back · username (→ profile:{u}) · 🔍 room-search · ≡ → chmenu:
Bubble: แตะ media → ch-media-viewer; แตะ post card / Listings & Items → Post Detail (missing → toast)
Composer: + → Photos & videos sheet → เลือก → media msg; input → draft persist + send enable; Enter/ปุ่ม send → chSend → bubble + Sent + ห้องขึ้นบนสุด
🔍 room-search → header swap → ค้นหาใน msgs (highlight + dim) → ✕ กลับ
```

## Block / Unblock จาก Chat

```text
chmenu: Block → blkSheet fromChat (Block เดียว, dismiss=backdrop)
→ pfSetBlocked(true) → th.blocked ทุก thread + toast Blocking + re-render
→ room = read-only + ch-blocked-bar; row = Blocked chip
Unblock (bar / chmenu Block↔Unblock / report done step) → unblockDlg → pfSetBlocked(false) → toast Unblocked → composer กลับ
```

## Report จาก Chat

```text
chmenu: Report → chatReportSheet
  Report → rpPush report:user (ไม่มี <, เฉพาะ ✕) → เลือกเหตุผล → report:done:{u}
  Report and delete → เหมือนกัน + set rpDelChat
report:done: steps (Block→blkSheet fromChat / Unblock→unblockDlg / Unfollow / Mute) → Done/✕
→ rpClose + toast Report submitted · thanks for letting us know
→ rpDelChat: t.hidden + ออกจาก threads + strip chmenu:/chatroom: + กลับ chat list
→ Report ธรรมดา: กลับหน้าที่เปิด report (chmenu:/chatroom:)
```

## Chat Config

```text
gear → chatcfg → toggles (notif/preview/followOnly) flip ทันที
→ defView Chats/Items → set cfg.defView + C.view ทันที + เคลียร์ q
→ chc-quick ≤80 live save → prefill Ask ครั้งถัดไป
→ back → chat list
```

---

# 9. Business Rules

## Thread Model

- Thread key = `{user, item.id}` — `chatQuickAsk` หา `x.user===post.seller && x.item.id===post.id` เจอ → เปิดห้องเดิม (+un-hide); ไม่เจอ → สร้าง `C.draft` ใหม่เสมอ → **same seller คนละ listing = ห้องใหม่ทุกครั้ง** (ขัด spec เดิม Same-User-Merge — เลือก prototype)
- Draft room: `C.draft` เก็บนอก `C.threads` — `chGet` ค้นทั้งสองที่; เข้า list จริงเมื่อ `chSend` แรก (`unshift` + `C.draft=null`); draft มีได้ทีละ 1 ห้อง (Ask ห้องอื่นทับ)
- Item snapshot ตอนสร้างห้อง: `{id:post.id, cap:post.caption, price:post.price||"", photo:post.photos[0], owner:post.seller, pid:post.id}` — **snapshot นิ่ง**: โพสต์แก้/ขาย/ลบภายหลังไม่เปลี่ยนการ์ด
- `t.draft` = draft ข้อความต่อห้อง (persist ระหว่าง navigate — composer เติมกลับ)
- Session-only: threads/flags/cfg/draft เป็น memory state — `applySessionData` reset ทุก session switch (persistence = contract §18)

## Chat Entry Points (Listing-scoped เท่านั้น)

- `.ask-pill` บน sale post surfaces: feed card action-row (`askBtnHTML` ตาม `state.ask`) + `price-footer` variant (`Ask Seller` outline) + post viewer actions (`p.type==="sale"` เท่านั้น) — ทั้งหมด → `chatQuickAsk`
- Post Detail (dl1) **ไม่มี** chat entry (canonical 05 — `chat-fab`/`.chat-pop` = dead path ต้อง `state.ask==="bubble"` + dl2 เท่านั้น)
- Profile `pf-msg` + follower-row Chat = **dead toast** `Open a listing to chat with this seller` (canonical 06 — ห้ามเขียน 07 ว่าเข้าแชตจากโปรไฟล์ได้)
- Guards ตามลำดับ: guest → Member Sheet → own post `This is your own listing` → blocked `Cannot message a blocked account` → findPost fail → `Not in this prototype yet`
- Ask ปิด overlays เดิม (`pv-open`/`detail-open`/`comments-open`/`pm-open`/`likes-open`/`details-open`) แล้ว `openSub chatroom:{id}` — stack ใหม่ 1 หน้า → back จากห้อง = ปิด layer กลับ surface ข้างล่าง

## Post Reference Card (`ch-post-card`)

- anatomy: รูปเต็ม + top scrim (avatar + username ของ `item.owner`) + bottom scrim (caption + price) + `title="View listing"`
- placement: msgs ว่าง → คอลัมน์ `me` อิสระเหนือ composer; msgs มี → แนบ bubble แรก (i===0 ฝั่งใดก็ตาม)
- tap (`data-chgo="post"`): `findPost(pid)` → `openPostDetail` (Post Detail ทับ — canonical 05); ไม่เจอ → toast `Listing detail isn't in this prototype yet` (contract: unavailable state `รายการนี้ไม่พร้อมใช้งานแล้ว` ตาม 00_GLOBAL §11)
- เหมือนกันใน `Listings & Items` row ของ `chmenu:` (`data-chgo="post"` เดียวกัน)
- การ์ดไม่มี sold/deleted/price-change states — deviation จาก spec เดิม (documented §4)

## Chat List — Chats View

- Row: avatar 44 (+ `ch-pin-badge` เมื่อ pinned) / username + `Blocked` chip (หรือ mute icon) / preview (prefix `You: ` เมื่อข้อความสุดท้ายของเรา) / time (`HH:MM` วันนี้, day label อื่น) / unread pill
- Ordering: **pinned-first** (`pinnedAt` desc tie-break) แล้ว insertion order — ไม่มี timestamp sort จริง; `chSend` ย้ายห้องขึ้นบนสุด (`unshift`)
- `ch-q` live search match `user + item.cap + msg texts` → ว่าง → `No chats found`/`Try another name, item or message.`
- unread: เปิดห้อง → `t.unread=0` + `chBadgeSync` — nav badge = Σunread cap `99+`
- `t.hidden` filtered ออกจาก Chats view และ `chatitem:` rows — **แต่ `chItemGroups` ไม่ filter hidden** → hidden thread ยังโผล่ใน Items view groups (preview/unread/N chats นับรวม — deviation); un-hide อัตโนมัติเมื่อ `chSend`/`chatQuickAsk`
- Gear → `chatcfg`; bottom nav `botNavHTML("chat")` เฉพาะหน้านี้

## Chat List — Items View + Filter

- `data-chview="item"`: ครั้งแรก → switch view + เคลียร์ `q`; แตะ Items pill ซ้ำขณะอยู่ view นี้ → toggle `filterMenuOpen` (backdrop ปิด)
- Popover `Filter items by`: `All items` / `Your listings` / `Items you asked about` + checkmark ตัวเลือกปัจจุบัน + icon — เลือก = `C.itemFilter` + ปิด + render ทันที (กลับ Chats → reset `all`)
- Groups = `chItemGroups` ตาม `item.id` เก็บ insertion order; `mine` (owner=me) → section `Your listings`, อื่น → `Items you asked about`; filter `mine`/`asked` → เหลือ section เดียว
- Item row: thumb + cap + `{price} · {N chats}` (mine) หรือ `{price} · {last msg}` (asked) + time + Σunread
- `isDirectRoom` (asked + thread เดียว) → `data-chgo="room"` เข้าห้องตรง; อื่น → `chatitem:{itemId}`
- Empties: `No item chats yet`/`Chats are grouped by item once people message about a listing.` · `No items found`/`Try another item name.` · filter-empty `No listings found`/`No asked items found` + `No items match your filter.`

## Item Chats Page (`chatitem:{itemId}`)

- Head `Item chats` + back (slide-out-right → list) — ไม่มี bottom nav
- Floating pill itemcard: รูป + cap + price + `Your listing`/`@{owner}` · `{n} chats` (นับเฉพาะ visible)
- `ch-iq` `Search people or messages` (EN hardcode — deviation) live filter เหมือน `ch-q`
- Rows = `chRowHTML` เดิม (swipe/pin/mute/hide/delete ทำงาน) — sorted pin-first
- group หาย/ไม่มี thread → `Item not found`/`No chats for this item.`; query ว่าง → `No chats found`/`Try another name or message.`

## Chat Room

- Header: `<` + username (`data-pf-user` → `profile:{u}` push) + 🔍 `room-search` + `≡` `more` → `chmenu:{tid}` (ไม่มี room element → `Chat options aren't in this prototype yet`)
- Bubble anatomy: `ch-day` divider ต่อวัน; `them` = ซ้าย + avatar เฉพาะ bubble แรกของกลุ่มต่อเนื่อง (`ch-mav-sp` แทนหลังจากนั้น); `me` = ขวา (สีหลัก); เวลาข้างทุก bubble; `Read`/`Sent` เฉพาะข้อความ `me` ล่าสุด (`lastMe` — send ใหม่ทุกอัน `read:false` → `Sent` เสมอ; seed `read:true` → `Read`)
- Composer: `+` → attach sheet; `ch-input` → `t.draft` persist + toggle send disabled; `.ch-send`/Enter → `chSend` (blocked guard + un-hide + draft-room→threads + move-to-top + `{f:"me",at:"09:41",day:"Today",read:false}` + refocus)
- Blocked (`pfIsBlocked || t.blocked`): composer ถูกแทนด้วย `ch-blocked-bar` — `You blocked this account` / `You can't message or call them unless you unblock them.` + `Unblock` → `unblockDlg` (copy มี "call" = LINE leftover — deviation)
- openSub (Quick Ask) → back ปิด layer; rpPush (จาก list) → back slide-out-right ไป list/chatitem (canonical 00_NAV §6.7)
- missing thread → `Chat not found`/`This conversation is no longer available.`

## Room Search

- 🔍 toggle `t.searching` → header ถูกแทนทั้งก้อน: search box (`placeholder="Messages"` + clear `✕` เมื่อมี query) + close `✕`
- `t.roomQuery` live → match `m.t` → `<mark class="ch-hl">` + non-match dim `opacity:0.25`; media bubbles dim เสมอ (match เฉพาะ text)
- Close = `searching=false` + clear query + header กลับ; clear = เคลียร์ query + refocus

## Attach / Media

- `+` → `.ch-attach-sheet` `Photos & videos` — grid ≤8 unique photos จาก POSTS ทั้งหมด (mock picker, `isVideo:false` เสมอ) + close/backdrop
- เลือก → push `{f:"me",img,isVideo,at:"09:41",day:"Today",read:false}` + `t.media.unshift(src)` + re-render — **ไม่** un-hide/ไม่ move-to-top (quirk ต่างจาก `chSend` — deviation)
- Media bubble = รูป + play overlay เมื่อ `isVideo` → tap → `ch-media-viewer` overlay ใน frame (X/body/backdrop ปิด)
- `t.media` lazy-init ใน `chmenu:`/`chmedia:` — เฉพาะ seed `t1` เติม item photo + POSTS ≤9 (mock); ห้องอื่นเริ่มว่างจนกว่าจะส่ง media เอง

## Chat Menu (`chmenu:{threadId}`)

- Head `<` + username (slide-back) — ไม่มี nav
- **4 ปุ่มวงกลม**: `Mute`↔`Unmute` (icon bell/bellOff + toggle + toast TH), `Profile` (`data-pf-user` → `profile:{u}`), `Block`↔`Unblock` (`block-user` → blkSheet fromChat หรือ unblockDlg), `Report` (`report-chat-user` → chatReportSheet)
- Rows: `Photos & videos` → `chmedia:` + thumbnail strip (`data-chmedia` → viewer) หรือ empty card `No photos or videos found.`; `Listings & Items` + cap ตัด ellipsis → `data-chgo="post"`
- Footer: lock icon + `This chat is protected with End-to-End Encryption` — **copy claim เท่านั้น ไม่มี implementation** (LINE leftover — deviation ห้าม spec เป็น feature)
- **ไม่มี Delete chat entry ในหน้านี้** — delete อยู่เฉพาะ swipe บน list/chatitem (+ dead `chsettings` `Delete data`)

## Media Gallery (`chmedia:{threadId}`)

- Head `✕` (pop + swap ไม่ slide — canonical back rule) + title username + `Select` (เฉพาะมี media); select mode: `Cancel` / `{n} selected` / `Deselect`
- Grid + date group label hardcode `October 2569 BE` (mock — deviation); tap item → viewer (non-select) หรือ toggle select (badge ลำดับ 1,2,…)
- Bottom bar (select mode): Trash → ลบ `t.media` ที่เลือก + `ลบรูปภาพที่เลือกแล้ว`; Download → `บันทึกลงในรูปภาพแล้ว` — **ไม่มี Share**
- Empty → `No photos or videos found.` card; missing thread → `Chat not found`
- `t.galState{selecting,selected}` reset เมื่อปิด

## Chat Config (`chatcfg`)

- Head `การตั้งค่าแชท`/`Chat settings` + back → list
- Toggles (`data-chtgl`): `notif` (`การแจ้งเตือนข้อความ`/`Message notifications`), `preview` (`แสดงตัวอย่างข้อความ`/`Show message preview`), `followOnly` (`รับข้อความเฉพาะผู้ที่คุณติดตาม`/`Only people I follow can message me`) — flip ทันที ไม่มี enforcement surface ของ `followOnly` (deviation)
- `Default chat view` (`data-chdef`): Chats/Items radio — set `cfg.defView` **และ** `C.view` ทันที + เคลียร์ `q` (เลือก Items = สลับมุมมองทันที)
- Quick Ask `chc-quick` input ≤80 chars live save → prefill composer ของ draft room (`สนใจสินค้าชิ้นนี้ครับ ยังอยู่ไหมครับ?` default)

## Swipe Actions (LINE-style)

- Pointer gestures บน `.ch-row-wrap`: horizontal lock >8px (vertical abort + ปิด reveal เดิม), reveal ±40px, dismiss ±30px, rubber-band cap (+140/−175), suppress click 250ms หลัง swipe
- Right → `ch-act-left` วงกลมเขียว LINE: `Pin`↔`Unpin` (`pinnedAt` + toast `ปักหมุดแชทแล้ว`/`ยกเลิกการปักหมุดแล้ว` + pin badge + เรียงก่อน), `Mute`↔`Unmute` (toast `ปิดการแจ้งเตือนแล้ว`/`เปิดการแจ้งเตือนแล้ว` + mute icon)
- Left → `ch-act-right` สี่เหลี่ยมเทา: `Hide` → iOS modal `Hiding chats doesn't delete their messages.` (Cancel/`Hide` แดง) → `t.hidden` + `ซ่อนแชทแล้ว`; `Delete` → iOS modal `Are you sure you want to delete this chat?` (Cancel/`Delete` แดง) → ลบออกจาก `C.threads` + `ลบแชทเรียบร้อยแล้ว` + unwind `chatroom:`/`chmenu:`/`chsettings:` tops จาก stack
- ทำงานทั้งหน้า list และ `chatitem:` (rows เดียวกัน); modal dismiss = Cancel/backdrop

## Block / Unblock (shared surfaces — canonical 06)

- Entry `block-user` (chmenu) หรือ blocked อยู่แล้ว → `unblockDlgHTML`; ยังไม่ block → `blkSheetHTML(u, fromChat=true)` = sheet เดียวกับ profile แต่ **ตัด `Block and report`** เหลือ `Block` เดียว (ไม่มี Cancel row — dismiss ผ่าน backdrop)
- `blk-go` → `pfSetBlocked(true)`: `PF_BLOCKED` + `PF_REMOVED_FOL` + unfollow + **`th.blocked=true` ทุก thread ของ user** + `p.blocked` ทุกโพสต์ + feed re-render → transient `Blocking` toast + re-render `chmenu:`/`chatroom:` ถ้าอยู่ top
- Effects ตาม 00_GLOBAL §13 ครบ (feed/search/WA/following) — canonical 06/15; ที่นี่ระบุเฉพาะ chat surfaces: `Blocked` chip บน row, `ch-blocked-bar`, `chSend` guard, `Cannot message a blocked account`
- Unblock (`unblock-room` bar / chmenu `Block`↔`Unblock` / report done step) → `unblockDlgHTML` (`Unblock {u}?` + desc + Unblock danger + Cancel) → `pfSetBlocked(false)` → `Unblocked` toast + re-render — ไม่ re-follow; `pfRestrictHint` defined แต่ไม่ถูกเรียก (dead — flag 06)
- ประวัติแชทคงอ่านได้ read-only ทั้งก่อนและหลัง unblock; block ไม่ลบ thread

## Report จาก Chat (`chatReportSheet` → `report:user`)

- Entry `report-chat-user` (chmenu) → `chatReportSheetHTML(u,tid)`: sheet layout เดียวกับ blkSheet — avatar + `Are you sure you want to report {u}?` + desc (`...Selecting "Report and delete" will delete this chat and its associated history.`) + `Report and delete` (แดง) + `Report` + `Cancel` (ปิด sheet อยู่หน้าเดิม)
- ทั้งสองปุ่ม → `rpFromChat=true` + `rpUser=u` → `rpPush report:user` — **ข้าม `report:pick`** (user-report ตรง); `Report and delete` เพิ่ม `rpDelChat=tid`
- `report:user` head: **ไม่มี `<`** เมื่อ `rpFromChat` — title `Report` + `✕` เท่านั้น; body `Why are you reporting this account?` + `PM_REASONS` (canonical 15)
- เลือกเหตุผล → `report:done:{u}` (ก็ไม่มี `<`): `Thanks for your feedback` + `rp-step` rows (Block→`blkSheet` fromChat=Block เดียว / Unblock→unblockDlg / Unfollow→instant `Unfollowed` / Mute↔Unmute→muteDlg/instant) + `Done`
- `Done`/`✕` → `rpClose` ปิดกองทั้งหมด + toast `Report submitted · thanks for letting us know`:
  - `rpDelChat` + เคยถึง done → `t.hidden` + splice ออกจาก `C.threads` + stack strip `chmenu:`/`chatroom:` + unshift `chat` → **กลับ Chat List** (ลบจริงใน mock — contract: remove-from-actor-list + retention §18)
  - ไม่ใช่ → กลับหน้าที่เปิด report เดิม (`chmenu:`/`chatroom:`)
- Report ไม่ลบ content/ไม่แจ้งฝั่งถูกรายงาน (00_GLOBAL §13); moderation queue = BO contract

## Session / Nav / Reset

- `chatInit`: `state.session!=="member"` → `threads=[]` + `view=defView` (GUEST-001 — `new`/`guest` ไม่มี seed)
- `applySessionData` ทุก session switch → `CHAT.inited=false` + `threads=[]` + `draft=null` (flags คงอยู่ใน cfg — quirk: toggles/defView/quick ไม่ reset — deviation)
- `data-navgo` ทุกครั้ง → `chatResetToDefault()`: `view→cfg.defView`, `itemFilter→"all"`, `filterMenuOpen→false`, `q→""`, `iq→""` → กลับ Chat tab ใหม่เสมอ = default view + เคลียร์ search/filter
- Back: `chat` root ไม่มี back; `chat*`/`chmenu:`/`chsettings:` บน stack>1 → slide-out-right (`rpBack`); `chmedia:` `✕` → pop + swap ไม่ slide + reset galState; Quick-Ask room (openSub, stack=1) → back ปิด `.page-sub`
- Nav badge: `chBadgeHTML` Σunread cap `99+` sync ทุกเปิดห้อง

## Deviations & Dead-Code Notes (spec เลือก prototype — documented, not spec)

1. **Thread key = user+item** — same seller คนละ listing = ห้องใหม่ทุกครั้ง (spec เดิม Same-User+Different-Asset merge + reference เปลี่ยน — ขัดทิศ เลือก per-item rooms)
2. **Post ref card = snapshot นิ่ง** — ไม่มี Active/Sold/Deleted states; sold/deleted ไม่เปลี่ยนการ์ด (spec เดิม 3 states + `รายการนี้ไม่พร้อมใช้งานแล้ว` — เหลือ unavailable-on-tap contract เท่านั้น)
3. **ไม่มี File message / Asset Card / Offer Card** — types จริง = text + image/video + post ref card (Offer ถูกถอดทั้ง codebase — FSP-006/007 aligned)
4. **Menu = `≡` → `chmenu:` page 4 ปุ่มวงกลม รวม Report** — spec เดิม 3 ปุ่ม + overflow `...` 5 items ขัดกันเอง; **ไม่มี Delete chat ในหน้านี้** (swipe เท่านั้น)
5. **Block confirm = `blkSheet` bottom sheet `Block` เดียว** — ไม่มี `Block this user?` center dlg + Cancel ของ spec เดิม (dismiss=backdrop; canonical S-13 06)
6. **`ch-blocked-bar` copy พูดถึง "call"** (`You can't message or call them`) — ไม่มี call feature (LINE leftover)
7. **Report จาก chat ไม่มี `<` back** (`rpFromChat`) — header เหลือ title + `✕`; ข้าม `report:pick` เสมอ
8. **`Report and delete` ลบ thread จริงใน mock** — spec เดิมบอก "ซ่อนฝั่งผู้กด ไม่ลบ server"; spec ใหม่ = remove-from-actor-list + retention contract (mock simplification)
9. **Hide มี iOS confirm + auto un-hide on send/Ask** — spec เดิมไม่มี hide เลย; แต่ `chItemGroups` ไม่ filter `t.hidden` → hidden thread ยังนับ/โชว์ใน Items view groups (leak quirk)
10. **Mute toast TH** `ปิด/เปิดการแจ้งเตือนแล้ว` — spec เดิม EN `Notifications muted/unmuted`
11. **Sort = insertion order + pin-first** — ไม่มี timestamp DESC จริง; re-order เฉพาะ send (`unshift`)
12. **Send timestamp mock `09:41`** + ไม่มี incoming simulation → `Sent` ไม่เคยกลาย `Read` ใหม่; `Read`/`Sent` เฉพาะ `lastMe` (visual mock — ไม่ใช่ receipt system)
13. **`followOnly` toggle ไม่มี enforcement surface** — config มีแต่ไม่มีที่ให้ทดสอบ
14. **E2E / Letter Sealing = claim copy เท่านั้น** — chmenu footer + chsettings row; ห้าม spec เป็น feature
15. **`chsettings:{id}` = dead route ทั้งหน้า** — มี render+handler (`data-chgo="chsettings"` ใน chatClick) แต่ไม่มี emit ที่ไหน (Note notifications/wallpaper/export/encryption/Delete data/Report)
16. **`chatPopHTML`/`.chat-fab`/`.cp-*`/`sendChat` = dead** — render เฉพาะ `state.ask==="bubble"` ใน dl2 `igDetailHTML` + ถูก `chatQuickAsk` intercept เสมอ → `.chat-pop` unreachable
17. **`state.ask` variants (ico/txt/outline/solid/bubble/auto)** = dev artifact ตาม 00_NAV §11 — production = single Ask style (spec ระบุแค่ pill มี label `สอบถาม`/`Ask` หรือ `Ask Seller`)
18. **dl2 `igDetailHTML` ask row + `chatPopHTML` mount** = dead detail variant (canonical 05 dead list)
19. **`t.media` lazy mock เฉพาะ `t1`** + gallery date label hardcode `October 2569 BE` — grouping-by-date ไม่ได้ implement
20. **media send ไม่ un-hide / ไม่ move-to-top** — quirk ต่างจาก `chSend`
21. **`cfg` toggles/defView/quick ไม่ reset ตอน session switch** — `applySessionData` เคลียร์แค่ inited/threads/draft
22. **Ask post lookup fail → `Not in this prototype yet`** — fallback dead toast (`.ask-pill` อยู่ใน dead-handler list หลัง chatClick)
23. **EN/TH hardcoded strings ~40 copies** → i18n sweep FSP-026 (ดู §13/§19)
24. **`pfRestrictHint` defined แต่ไม่มี call site** — 06 spec อ้าง banner หลัง unblock; ที่จริงไม่แสดง (flag FSP-030 consistency)
25. **Session-only state ทั้งโมดูล** — threads/pins/mutes/hidden/cfg/draft/galState memory เท่านั้น (persistence contract)

---

# 10. Permission Rules

## Guest

| Action | Result |
| --- | --- |
| Bottom nav `แชท` | Member Sheet `Join TukDaeng` (gated `[data-navgo="chat"]`) |
| `.ask-pill` / `.chat-fab` | Member Sheet |
| `.ch-rep-del-btn` / `.ch-rep-only-btn` / `.blk-go` / `.blk-rep` | Member Sheet (reachable เฉพาะผ่าน surface ที่ไม่ได้ gate — defense-in-depth) |
| Chat list/room/menu/cfg/media ทุกหน้า | ไม่มีทางเข้าถึง (tab gated + `threads=[]`) |

## Member / New Member

ทำได้ทุกอย่างใน §8 — `new` เห็น empty states

## Blocked User

| Action | Result |
| --- | --- |
| Send message ในห้องที่ block กัน | ปิด — composer ถูกแทน `ch-blocked-bar` + `chSend` guard ซ้ำ |
| Ask seller ที่ block | `Cannot message a blocked account` |
| อ่าน history ห้องเดิม | read-only ได้ |
| Unblock | `unblockDlg` → restore composer |

---

# 11. Validation Rules

| Field | Rule |
| --- | --- |
| `ch-input` message | ต้องไม่ว่างหลัง trim — `.ch-send` disabled จนมี text; `chSend` re-check `!v` |
| `chc-quick` | maxlength 80 — live save ทุก keystroke ไม่มี error |
| `ch-q` / `ch-iq` / `ch-room-search-in` | free text ไม่มี validation — live filter |
| Attach | mock grid เท่านั้น — ไม่มี file-type/size validation (contract §18) |
| Report reason | ต้องเลือก 1 เหตุผล → `report:done` (canonical 15 — ไม่มี reason-less submit) |

---

# 12. Exception Handling

| Case | Behavior |
| --- | --- |
| Ask own post | toast `This is your own listing` |
| Ask blocked seller | toast `Cannot message a blocked account` |
| Ask post ที่ `findPost` ไม่เจอ | toast `Not in this prototype yet` (dead fallback) |
| Post ref card / `Listings & Items` → missing post | toast `Listing detail isn't in this prototype yet` (contract: `รายการนี้ไม่พร้อมใช้งานแล้ว` — 00_GLOBAL §11) |
| Open `chatroom:`/`chmenu:`/`chmedia:`/`chsettings:` ของ thread ที่ไม่มี | `Chat not found` + `This conversation is no longer available.` |
| Open `chatitem:` ของ group ที่ไม่มี | `Item not found` + `No chats for this item.` |
| `data-chgo="more"` โดยไม่มี `.ch-room` | toast `Chat options aren't in this prototype yet` |
| Send error / incoming / offline | ไม่มี path — mock ส่งสำเร็จเสมอ (contract §18) |
| Unavailable destination ทั่วไป | canonical 00_NAV §10 — `Go back` pattern |

---

# 13. Empty State

| Surface | Copy จริง |
| --- | --- |
| Chats (ว่าง) | `No chats yet` + `Tap Ask on a post to start chatting with the seller.` |
| Chats (search ไม่เจอ) | `No chats found` + `Try another name, item or message.` |
| Items (ว่าง) | `No item chats yet` + `Chats are grouped by item once people message about a listing.` |
| Items (search ไม่เจอ) | `No items found` + `Try another item name.` |
| Items filter `mine`/`asked` ว่าง | `No listings found` / `No asked items found` + `No items match your filter.` |
| chatitem query ว่าง | `No chats found` + `Try another name or message.` |
| chmenu media strip ว่าง | `No photos or videos found.` |
| chmedia ว่าง | `No photos or videos found.` (ใน empty wrap) |
| room/chmenu/chmedia/chsettings missing thread | `Chat not found` + `This conversation is no longer available.` |
| chatitem missing group | `Item not found` + `No chats for this item.` |

EN-hardcode ทั้งชุด (i18n sweep — §19 flag)

---

# 14. Notification Rules

- New Message = unread count บน row + nav badge `แชท` (Σunread cap `99+`) เท่านั้น — **ไม่ใช่ Notification Center type** (canonical: alerts feed ไม่มี chat type — 09_NOTIFICATION)
- Mute per-thread = suppress badge contribution เท่านั้นใน contract (prototype mute ไม่ลด `chUnread` — deviation note: `chUnread` ไม่ filter muted)
- ไม่มี incoming message simulation → badge ขับด้วย seed unread เท่านั้น

---

# 15. Analytics Events

(contract — prototype ไม่มี tracking layer)

| Event | Trigger |
| --- | --- |
| `chat_list_open` | เปิด Chat tab |
| `chat_view_switch` | `data-chview` user/item |
| `chat_item_filter` | เลือก filter popover (all/mine/asked) |
| `chat_item_open` | เปิด `chatitem:` |
| `chat_room_open` | เปิด `chatroom:` (source: list/item/quick_ask) |
| `chat_thread_created` | draft → threads บน send แรก |
| `chat_message_send` | `chSend` text / `chsendmedia` media |
| `chat_quick_ask` | `.ask-pill`/`.chat-fab` tap |
| `chat_room_search` | toggle `room-search` |
| `chat_swipe_action` | pin/mute/hide/delete |
| `chat_menu_open` | `≡` → `chmenu:` |
| `chat_media_open` | `chmedia:` / `ch-media-viewer` |
| `chat_media_select_action` | Trash/Download ใน gallery |
| `chat_config_change` | `data-chtgl`/`data-chdef`/`chc-quick` |
| `chat_block` / `chat_unblock` | blkSheet Block / unblockDlg Unblock |
| `chat_report` | `ch-rep-del-btn`/`ch-rep-only-btn` |
| `chat_post_ref_open` | `data-chgo="post"` |

---

# 16. Acceptance Criteria

## Entry & Thread Model

| AC ID | Criteria |
|---|---|
| AC-CHAT-001 | Chat เข้าได้เฉพาะผ่าน listing — `.ask-pill` บน feed card/price-footer/post viewer (`p.type==="sale"` เท่านั้น); ไม่มี entry บน Post Detail (dl1), profile (`pf-msg` dead), follower row |
| AC-CHAT-002 | กด Ask บนโพสต์ตัวเอง → `This is your own listing`; seller ที่ block → `Cannot message a blocked account`; post ไม่เจอ → `Not in this prototype yet` |
| AC-CHAT-003 | Ask seller+item เดิม → เปิดห้องเดิม (+un-hide); seller เดิมคนละ item → **ห้องใหม่** พร้อม post card ของ item นั้น |
| AC-CHAT-004 | ห้องใหม่ = `C.draft` ไม่เข้า list จนกว่า `chSend` แรก (`unshift`); draft prefill `cfg.quick` และ `t.draft` persist ระหว่าง navigate |
| AC-CHAT-005 | Item snapshot `{cap,price,photo,owner,pid}` นิ่ง — โพสต์เปลี่ยนภายหลังไม่กระทบการ์ด/กลุ่ม |

## Chat List — Chats View

| AC ID | Criteria |
|---|---|
| AC-CHAT-006 | Row ต้องมี avatar (+pin badge), username, `Blocked` chip หรือ mute icon, preview prefix `You:`, time (`HH:MM`/day), unread pill |
| AC-CHAT-007 | List เรียง pinned-first (`pinnedAt` desc) แล้ว insertion order; `chSend` ย้ายห้องขึ้นบนสุด |
| AC-CHAT-008 | `ch-q` live match `user + item.cap + msg texts`; ว่าง → `No chats found`/`Try another name, item or message.` |
| AC-CHAT-009 | Empty → `No chats yet` + `Tap Ask on a post to start chatting with the seller.`; `t.hidden` ถูก filter ออกจาก Chats view + `chatitem:` rows (Items view groups ไม่ filter — documented deviation) |
| AC-CHAT-010 | เปิดห้อง → `t.unread=0` + badge sync; nav badge = Σunread cap `99+` |

## Items View & Item Chats

| AC ID | Criteria |
|---|---|
| AC-CHAT-011 | Items pill แตะครั้งแรก → view=item + เคลียร์ q; แตะซ้ำ → toggle popover `Filter items by` (3 options + checkmark + backdrop close); กลับ Chats → reset filter `all` |
| AC-CHAT-012 | Groups ตาม `item.id`: `mine` → `Your listings` (`{price} · N chats`), อื่น → `Items you asked about` (`{price} · last msg`); filter mine/asked → เหลือ section เดียว |
| AC-CHAT-013 | Asked + thread เดียว → เข้าห้องตรง (`isDirectRoom`); mine/หลาย thread → `chatitem:{id}` |
| AC-CHAT-014 | `chatitem:` ต้องมี head `Item chats` + floating pill itemcard (`Your listing`/`@{owner} · N chats`) + `ch-iq` + rows (swipe ทำงาน); group หาย → `Item not found`/`No chats for this item.` |

## Swipe Actions

| AC ID | Criteria |
|---|---|
| AC-CHAT-015 | Swipe right >40px → ปุ่มวงกลมเขียว Pin/Unpin + Mute/Unmute; Pin → `pinnedAt` + toast `ปักหมุดแชทแล้ว`/`ยกเลิกการปักหมุดแล้ว` + badge + เรียงก่อน |
| AC-CHAT-016 | Mute → toggle + toast `ปิดการแจ้งเตือนแล้ว`/`เปิดการแจ้งเตือนแล้ว` + mute icon บน row |
| AC-CHAT-017 | Swipe left >40px → ปุ่มเทา Hide/Delete; Hide → modal `Hiding chats doesn't delete their messages.` → `t.hidden` + `ซ่อนแชทแล้ว`; un-hide อัตโนมัติเมื่อ send/Ask |
| AC-CHAT-018 | Delete → modal `Are you sure you want to delete this chat?` → ออกจาก threads + `ลบแชทเรียบร้อยแล้ว` + strip `chatroom:`/`chmenu:`/`chsettings:` tops จาก stack |

## Chat Room

| AC ID | Criteria |
|---|---|
| AC-CHAT-019 | Header = `<` + username → `profile:{u}` + 🔍 room-search + `≡` → `chmenu:{tid}`; missing thread → `Chat not found` |
| AC-CHAT-020 | Bubbles: `ch-day` divider, `them` avatar เฉพาะต้นกลุ่ม, เวลาข้างทุก bubble, `Read`/`Sent` เฉพาะ `lastMe` |
| AC-CHAT-021 | Post ref card = `ch-post-card` (scrim owner + cap/price): msgs ว่าง → me-column; มี → แนบ msg แรก; tap → Post Detail หรือ `Listing detail isn't in this prototype yet` |
| AC-CHAT-022 | Composer: `+` attach, `ch-input` → `t.draft` + send-enable, Enter/send → `chSend` → bubble `{at:"09:41",read:false}` + un-hide + move-top + refocus |
| AC-CHAT-023 | `+` → `Photos & videos` sheet (≤8 จาก POSTS); เลือก → media bubble (+play overlay `isVideo`) + `t.media.unshift`; tap media → `ch-media-viewer` overlay |
| AC-CHAT-024 | Blocked room → `ch-blocked-bar` (`You blocked this account` + Unblock) แทน composer; `chSend` guard ซ้ำ; history read-only |

## Room Search & Menu & Gallery

| AC ID | Criteria |
|---|---|
| AC-CHAT-025 | 🔍 → header แทนทั้งก้อน (placeholder `Messages` + clear + ✕); query live → `<mark>` + dim non-match (media dim เสมอ); ✕ → restore header |
| AC-CHAT-026 | `chmenu:` = head `<` + username + 4 ปุ่มวงกลม (Mute/Unmute · Profile·→profile:{u} · Block/Unblock · Report) + `Photos & videos` row + `Listings & Items` row → `data-chgo="post"` + E2E footer; **ไม่มี Delete chat** |
| AC-CHAT-027 | `Photos & videos` → `chmedia:` + thumb strip หรือ `No photos or videos found.` card |
| AC-CHAT-028 | `chmedia:` = ✕ pop-swap + `Select` → `{n} selected`/`Cancel`/`Deselect` + badge ลำดับ + Trash (`ลบรูปภาพที่เลือกแล้ว`)/Download (`บันทึกลงในรูปภาพแล้ว`) — ไม่มี Share; date label `October 2569 BE`; tap → viewer |

## Chat Config

| AC ID | Criteria |
|---|---|
| AC-CHAT-029 | `chatcfg` = toggles `notif`/`preview`/`followOnly` (flip ทันที) + `Default chat view` Chats/Items (`data-chdef` → set `cfg.defView`+`C.view` ทันที + เคลียร์ q) + Quick Ask `chc-quick` ≤80 live save |
| AC-CHAT-030 | `followOnly` = toggle อย่างเดียว ไม่มี enforcement surface (documented deviation) |

## Block / Unblock

| AC ID | Criteria |
|---|---|
| AC-CHAT-031 | `block-user` → `blkSheetHTML(u, fromChat=true)` = sheet เดียวกับ profile แต่ `Block` เดียว (ไม่มี `Block and report`/Cancel row — backdrop dismiss) |
| AC-CHAT-032 | `blk-go` → `PF_BLOCKED` + `PF_REMOVED_FOL` + unfollow + `th.blocked` ทุก thread + `p.blocked` + feed re-render + `Blocking` toast + re-render chat pages บน top |
| AC-CHAT-033 | Unblock (`unblock-room`/chmenu/report step) → `unblockDlgHTML` → `pfSetBlocked(false)` + `Unblocked` + re-render — ไม่ re-follow |
| AC-CHAT-034 | Blocked room ต้องแสดง `Blocked` chip บน row + `ch-blocked-bar` + read-only history; block ไม่ลบ thread |

## Report

| AC ID | Criteria |
|---|---|
| AC-CHAT-035 | `report-chat-user` → `chatReportSheetHTML` = avatar + `Are you sure you want to report {u}?` + `Report and delete`/`Report`/`Cancel` |
| AC-CHAT-036 | ทั้งสองปุ่ม → `rpFromChat` + `report:user` ตรง (ข้าม `report:pick`) — head ไม่มี `<` เหลือ `Report` + `✕` |
| AC-CHAT-037 | เหตุผล → `report:done:{u}` (`Thanks for your feedback` + steps; Block step → blkSheet fromChat `Block` เดียว) → `Done`/`✕` → `rpClose` + `Report submitted · thanks for letting us know` |
| AC-CHAT-038 | `Report and delete` (`rpDelChat`) → หลัง done ปิด: `t.hidden` + ออกจาก `C.threads` + strip `chmenu:`/`chatroom:` + unshift `chat` → กลับ Chat List; `Report` ธรรมดา → กลับหน้าเดิม |

## Session / Nav / Guest / Guard

| AC ID | Criteria |
|---|---|
| AC-CHAT-039 | Guest แตะ chat entry ใด ๆ → Member Sheet `Join TukDaeng`; session `new`/`guest` → `threads=[]` + `No chats yet` |
| AC-CHAT-040 | `data-navgo` ทุกครั้ง → `chatResetToDefault` (view=defView + filter=all + ปิด popover + เคลียร์ q/iq); `applySessionData` → reset inited/threads/draft |
| AC-CHAT-041 | Back: stack>1 บน `chat*`/`chmenu:` → slide-out-right; `chmedia:` ✕ → pop+swap + reset galState; Quick-Ask room (stack=1) → back ปิด layer |
| AC-CHAT-042 | Dead/tooling ต้องไม่เป็น feature: `chsettings:` route+page, `chatPopHTML`/`.cp-*`/`.chat-fab`/`sendChat`, `state.ask` variants, E2E/Letter Sealing claims, `pfRestrictHint` (no call site), dl2 ask row |

---

# 17. Related Modules

- [00_GLOBAL_RULES_MODULE.md](00_GLOBAL_RULES_MODULE.md) — session §7, gate §11, lifecycle §12, block §13, private §14
- [00_NAVIGATION_AND_CROSS_MODULE_FLOW.md](00_NAVIGATION_AND_CROSS_MODULE_FLOW.md) — routes §6.6, back §6.7, entry matrix §7, unavailable §10
- [02_FEED_MODULE.md](02_FEED_MODULE.md) — post model + `ask-pill` surfaces canonical
- [03_SEARCH_FILTER_MODULE.md](03_SEARCH_FILTER_MODULE.md) — post viewer `pv-*` (Ask อยู่บน rail)
- [04_ASSET_MANAGEMENT_MODULE.md](04_ASSET_MANAGEMENT_MODULE.md) — listing semantics (item snapshot อ้าง post ไม่ใช่ asset record)
- [05_ASSET_DETAIL_MODULE.md](05_ASSET_DETAIL_MODULE.md) — `data-chgo="post"` handoff + missing-post fallback (FSP-018 lock)
- [06_PROFILE_MODULE.md](06_PROFILE_MODULE.md) — `blkSheet`/`unblockDlg`/`pfSetBlocked`/`pf-msg` dead/`data-pf-user` canonical (FSP-019 lock)
- [09_NOTIFICATION_MODULE.md](09_NOTIFICATION_MODULE.md) — alerts feed (ไม่มี chat type — FSP-021)
- [13_SETTINGS_MODULE.md](13_SETTINGS_MODULE.md) — `blocked` list `m-unblock` shared dlg
- [15_TRUST_SAFETY_MODULE.md](15_TRUST_SAFETY_MODULE.md) — report stack + `PM_REASONS` + moderation canonical

---

# 18. Future Enhancement

- Voice message / typing indicator / reactions / message edit+delete / pinned message / group chat
- Real read receipts + incoming simulation (`Sent`→`Read` lifecycle)
- File message + file-type/size validation
- `followOnly` enforcement (gate Ask จาก non-followed account)
- Unavailable post ref state บนการ์ด (canonical `รายการนี้ไม่พร้อมใช้งานแล้ว`) + sold marker
- Chat persistence (server threads/drafts/pins/mutes/hidden) + sync ข้าม device
- Room settings page revival หรือลบ `chsettings:` (wallpaper/export/Delete data)
- Media gallery real date grouping + Share action + video viewer
- `pfRestrictHint` consistency (call site หรือตัด — รวม 06)
- `mute` ไม่นับ badge (chUnread filter) + per-thread mute มีผล notification
- Deep link `chatroom:{id}` / `chat` contract (00_NAV §10/§12)
- i18n sweep — EN/TH hardcode (~40 copies) → localized pairs
- Real report reason wiring → moderation queue + ticket id (canonical 15)
