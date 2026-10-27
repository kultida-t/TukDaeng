# FO-TEST-001-08 — Test Cases: Chat (list + room + chatitem / chmenu / chmedia / chatcfg / attach / viewer)

> **สืบทอดจาก FO-TEST-02/03/06/07:** กติกาเดิมทั้งหมด (เคสหลัก = ทีละการกระทำ, ทุก [GATE] เทส guest+member คู่, ปิด sheet = backdrop/handle ไม่มี ESC/drag, dlg ซ้อน sheet ได้, toast ~2–3s) + sheet mechanics จาก FO-TEST-07 เทสแล้ว — task นี้เทสเฉพาะ **attach sheet (`ch-attach-sheet`), report/block sheet, `ch-modal` confirm ของ chat** ซึ่งเป็น overlay แยกจาก `.comment-sheet`
> **Source of truth (index.html):** CHAT seed+init `L17902–17948` (`CHAT` obj `L17906`, cfg defaults `L17908`) · `chRowHTML` `L18592` · `chItemGroups/chItemRowHTML/chListBody/chatListHTML` `L18627–18733` · `chatItemHTML` `L18745` · `chatRoomHTML` `L18771–18865` · `openChatAttachSheet` `L18867` · `openChatMediaViewer` `L18911` · `chatRoomMenuHTML` `L18931` · `chatMediaGalleryHTML` `L19013` · `chatRoomSettingsHTML` `L19096` · `chatCfgHTML` `L19152` · `chSend` `L19173` · `chatQuickAsk` `L19188` · `openChatHideConfirm/DeleteConfirm` `L19216–19282` · `chatClick` `L19285–19558` · swipe pointers `L19560–19645` · badge `chUnread/chBadgeSync` `L17966–17974`
> **Handlers:** guest gate `L20494` + `GUEST_GATE_SEL` `L23461` · navgo→chat `L21622–21639` (+`chatResetToDefault` `L17950`) · input/keydown `L20275`, `L20360–20392` · `ch-rep-del/only/cancel` `L21895–21925` · `blk-go/blk-rep` `L21926–21960` · `dlg-unblock-go` `L21025` · `rpClose`+`rpDelChat` `L15232–15260` · sub-back chain `L21087–21116` · dead-list `L22148` · `.chat-fab` dead branch `L22168`
> **ค้นพบสำคัญ (รายละเอียด §4):** `chsettings:id` มี route+handler แต่ **ไม่มี entry point ใน DOM เลย** (dead route) · `.chat-pop` (chat-fab inline DM) unreachable เพราะ `chatClick` ดัก `.chat-fab` ก่อน → เปิด chatroom เสมอ · `ch-modal` append เข้า `document.body` → dark theme ไม่ติด + fixed ทั้ง viewport · ส่งรูปเป็นข้อความแรกบน draft thread ไม่ materialize · badge นับ unread ของห้องที่ hidden · ปุ่ม chat ทุกตัวไม่โดน dead-list (chatClick `L21618` มาก่อน dead check `L22148` เสมอ; `.ask-pill` อยู่ใน dead-list แต่โดนดักก่อน — dead toast เฉพาะตอนหา post ไม่เจอ)
> **เขียนเสร็จรอรีวิว — อย่าเพิ่งปิดงาน**

## 0. วิธีใช้ + สภาพแวดล้อม

- เปิด `http://localhost:8901/index.html` (หรือเปิดไฟล์ตรง) · viewport 440×956 · desktop mouse — **swipe แถวแชท = กดซ้ายลากซ้าย/ขวาบนแถว** (pointer events จริง ไม่ใช่ long-press; threshold ±40px, overdrag rubber-band; หลัง swipe จะมี suppress click ~250ms)
- **Actors:** GUEST (เข้า chat ไม่ได้เลย — ทุก entry gate) / MEMBER `demo@tukdaeng.com` / `Tukdaeng123` (= king.mr.fox) / NEW (สมัครใหม่ — chat list ว่าง) / OWNER (ห้องฝั่งขาย = item `owner === king.mr.fox`)
- **Seed threads (`chatInit` L17917–17945):** M1 = ของตัวเอง "Rolex Datejust 36 · Ref. 126234" THB 380,000 (pid p4) · M2 = ของตัวเอง "Breguet Classique 5177" THB 890,000 (pid p5) · asked items: p1 (Watch 777), p2 (the watch), p6 (neng_mua "ขายไปแล้วครับ") — item view: p1/p2/p6 มี thread เดียว → แตะเข้าห้องตรง; M1/M2 → `chatitem:` · t5 gmt.bkk = muted · pinned: t1–t4 · unread รวม seed ≈ 11
- **Layer/z:** chat pages อยู่ใน `.page-sub` stack เดียวกับ settings/profile (`rpPush` สไลด์ขวา, back สไลด์ออกขวา) · `.page-detail` เปิดทับห้องได้ · `ch-attach-sheet` / `ch-media-viewer` append เข้า `.screen` · **`ch-modal` append เข้า `document.body`** (ต่างจาก `.dlg`)
- **Priority:** High = core flow/กติกา (gate, send, swipe, block, report+delete, Ask loop) · Medium = feature หลัก · Low = edge/quirk
- **dead-list check (ตามที่สั่ง):** dead-list `L22148` = `.nav-item, .sh-add, .act:not(.like-btn):not(.comment-btn):not(.share-btn), .ask-pill, .app-header .icon-btn..., .emoji-row, .comment-input, .c-meta` — **ไม่มี selector ของ chat** (`data-chgo`/`data-chact`/`data-chgal*`/`.ch-*` ทั้งหมดปลอด) และ `chatClick(e)` ถูกเรียกที่ `L21618` **ก่อน** dead check — ปุ่ม chat ทุกตัวทำงานจริง เหลือแค่ `.ask-pill` ที่อยู่ใน dead-list แต่ถูก chatClick รับก่อนเสมอ (เคสที่ handler `return false` — หา post ไม่เจอ — ถึงจะไหลไปโดน dead toast)
- Sheet `.comment-sheet` variants ที่ chat ใช้: `pm` (blk + chatReport ใส่ใน variant เดียว) — mechanics เทสใน FO-TEST-07 แล้ว ที่นี่เช็กเนื้อหา/ปลายทางเท่านั้น

## 1. Coverage map — chat routes & overlays (inventory §2.7)

| Route/Overlay (inventory §2.7) | ปกติ | Edge | รวม |
|---|---|---|---|
| `chat` user view (list/search/badge/swipe/hide/del) | CHAT-011..029 | CHAT-016(long-press none),030..031(hide/unhide/unread) | 21 |
| `chat` item view + filter popover | CHAT-032..034,039..041 | CHAT-042,043(reset) | 9 |
| `chatitem:id` | CHAT-035..038 | CHAT-044(delete/hide last thread) | 5 |
| `chatroom:id` | CHAT-045..057 | CHAT-058..061(blocked/notfound) | 17 |
| attach sheet `ch-attach-sheet` | CHAT-062..065 | CHAT-066,067(video badge/draft) | 6 |
| `ch-media-viewer` | CHAT-068,069 | CHAT-070(zoom/swipe none) | 3 |
| `chmenu:id` + blk/chatReport sheets | CHAT-071..080 | CHAT-081..085(report branches) | 15 |
| `chmedia:id` gallery + select | CHAT-086..090 | CHAT-091,092(empty/desync) | 7 |
| `chatcfg` | CHAT-093..096,098 | CHAT-097(followOnly no-op) | 6 |
| `chsettings:id` (dead route) | CHAT-099(no entry proof) | — | 1 |
| Ask Seller entry + draft lifecycle | CHAT-003,004,007 | CHAT-005,006,008,009,010 | 9 |
| Guest gate + block state + i18n/theme + sold/hide edge | CHAT-001,002,100..107 | (ในตาราง) | 10 |
| **รวม** | | | **107** |

## 2. Test cases

### 2.1 Entries — nav / Ask Seller / draft lifecycle

| TC ID | Steps | Expected | Actor | Priority | Note |
|---|---|---|---|---|---|
| FO-TC-CHAT-001 | [GATE] guest: แตะแท็บ Chat บน bottom nav → ปิด Member Sheet → sign in → แตะซ้ำ | guest → Member Sheet "Join TukDaeng" (chat list ไม่เปิด); member → chat list เปิด swap (ไม่สไลด์) | GUEST/MEMBER | High | `[data-navgo="chat"]` ใน GUEST_GATE_SEL + `openSub(scr,"chat",true)` |
| FO-TC-CHAT-002 | [GATE] guest: feed card โพสต์ sale → แตะปุ่ม Ask (💬 Ask/สอบถาม) → ปิด sheet → member ทำซ้ำ | guest → Member Sheet; member → `chatroom:` เปิด | GUEST/MEMBER | High | `.ask-pill` gated L20494 ก่อน chatClick |
| FO-TC-CHAT-003 | member: Ask บน feed card ของโพสต์ที่ยังไม่เคยคุย (เช่น p3 ถ้าไม่มี thread) | `chatroom:` เปิด: หัว = seller, การ์ด item ปักบนสุด (รูป + owner avatar + title + price), day divider "Today", ไม่มี bubble, input prefill = quick msg "สนใจสินค้าชิ้นนี้ครับ ยังอยู่ไหมครับ?", send enabled | MEMBER | High | `chatQuickAsk` L19188 สร้าง `C.draft` + prefill `cfg.quick` |
| FO-TC-CHAT-004 | member: Ask โพสต์ p1 (มี thread Watch 777 อยู่แล้ว) | เปิดห้อง **เดิม** — msgs เดิมอยู่ครบ ไม่สร้างซ้ำ (match ด้วย user+item.id) | MEMBER | High | item-scoped thread — `C.threads.find(user+item.id)` |
| FO-TC-CHAT-005 | member: Ask บนโพสต์ของตัวเอง (own listing ใน feed หลังสร้าง/pfasset) | toast **"This is your own listing"** — ไม่เปิดห้อง | OWNER | Medium | L19190 guard |
| FO-TC-CHAT-006 | member: block seller X ไว้แล้ว (ผ่าน profile/chmenu) → หาโพสต์ของ X ที่ยังเห็น → Ask | toast **"Cannot message a blocked account"** — ไม่เปิดห้อง *(หมายเหตุ: โพสต์คนถูก block หายจาก feed — ต้องกดจาก detail ที่เปิดค้างไว้ก่อน block หรือเส้นทางอื่น)* | MEMBER | Medium | L19191 guard; pfIsBlocked กรอง feed ด้วย → entry ยาก — เทสผ่าน detail ที่เปิดก่อน |
| FO-TC-CHAT-007 | member: เปิด Post Detail p1 → กดปุ่ม "Ask Seller" (outline) ใน price-footer → ปิด → เปิด detail ของ p2/p5/p6 (cfg ask=bubble → มี 💬 chat-fab ลอย) → แตะ fab | p1: pill → chatroom; p2/p5/p6: **fab ก็เปิด chatroom เหมือนกัน — `.chat-pop` inline popup ไม่เปิด** *(quirk — chatClick ดัก `.chat-fab` ก่อน handler ป๊อป L22168)* | MEMBER | High | GAP-CHAT-02 — inline pop dead |
| FO-TC-CHAT-008 | member: จาก detail กด Ask → อยู่ห้อง → กด back ในห้อง | **กลับ feed ไม่ใช่กลับ detail** — `chatQuickAsk` ลบ `detail-open` แล้ว `openSub` reset stack เหลือ `[chatroom]` → back ปิดทับลง feed *(quirk ถ้า spec อยากให้กลับ detail)* | MEMBER | Medium | GAP-CHAT-07 |
| FO-TC-CHAT-009 | member: public profile คนอื่น → กดปุ่ม "Chat" (`.pf-msg`) | toast **"Open a listing to chat with this seller"** — ไม่เปิดห้อง [DEAD-adjacent] | MEMBER | Medium | L21829 — profile Chat ไม่ใช่ chat entry |
| FO-TC-CHAT-010 | member: Ask โพสต์ใหม่ → ไม่ส่งอะไรเลย → back ออก → เปิด chat list | **ไม่มีแถวใหม่ใน list** — thread เป็น `C.draft` ไม่เข้า threads; Ask โพสต์เดิมอีกครั้ง → ห้องเดิมเปิดพร้อม prefill/msgs ที่ค้าง | MEMBER | High | draft materialize เฉพาะตอน `chSend` text เท่านั้น (ดู CHAT-066) |

### 2.2 Chat list — user view + swipe actions

| TC ID | Steps | Expected | Actor | Priority | Note |
|---|---|---|---|---|---|
| FO-TC-CHAT-011 | member: เปิดแท็บ Chat → อ่านหน้า | tabs "แชท/Chats"(active) + "สินค้า/Items"(มี caret) + ⚙ gear + ช่อง Search + list แถว + bottom nav ยังอยู่ | MEMBER | High | `chatListHTML` L18683 |
| FO-TC-CHAT-012 | อ่านแถว: pinned 4 แถวขึ้นก่อน (t1–t4 มี pin badge), แต่ละแถว avatar+name+preview+เวลา+unread pill | preview ขึ้น "You: " เมื่อข้อความสุดท้ายจากเรา; เวลา = HH:MM ถ้า Today ไม่งั้นชื่อวัน; unread เป็น pill ตัวเลข; t5 gmt.bkk มีไอคอน mute แทน badge | MEMBER | High | `chRowHTML`/`chTimeLbl` |
| FO-TC-CHAT-013 | สังเกต badge บนแท็บ Chat → เข้าห้อง t2 (unread 1) → ออกมา | badge = ผลรวม unread; เข้าห้องแล้ว `t.unread=0` + `chBadgeSync` → badge ลด 1 ทันที | MEMBER | High | L18775 + L17966–17974 |
| FO-TC-CHAT-014 | แตะแถว t1 | ห้องสไลด์เข้าจากขวา (rpPush); back สไลด์ออกขวากลับ list — list state เดิม | MEMBER | High | `data-chgo="room"` + rpBack chain L21114 |
| FO-TC-CHAT-015 | พิมพ์ "watch" ในช่อง Search → ลบ → พิมพ์ "zzz" | filter สด ครอบ user + item cap + msg text; "zzz" → **"No chats found"** + "Try another name, item or message."; ล้าง → แถวกลับครบ | MEMBER | High | `chThreadMatch` L18589 + `.ch-q` input L20380 |
| FO-TC-CHAT-016 | long-press แถวแชท (กดค้าง 450ms+) / right-click แถว | **ไม่มีอะไรเกิด** — ไม่มี contextmenu/long-press handler บน `.ch-row`; actions มีแค่ swipe เท่านั้น | MEMBER | Low | ยืนยัน "long-press/menu (ถ้ามี)" = ไม่มี |
| FO-TC-CHAT-017 | ลากแถวไปทางขวา >40px แล้วปล่อย | แถวเลื่อนขวา reveal ปุ่มวงกลมซ้าย: 📌 pin + 🔕 mute (ตำแหน่ง `revealed-left`); ลาก <40px → snap กลับ; ลากเกิน → rubber-band | MEMBER | High | pointer handlers L19560–19645 |
| FO-TC-CHAT-018 | ลากแถวไปทางซ้าย >40px แล้วปล่อย | reveal ปุ่มขวา: ปุ่มสี่เหลี่ยม "Hide" + "Delete" (`revealed-right`) | MEMBER | High | |
| FO-TC-CHAT-019 | ขณะแถว reveal อยู่ → แตะตัวแถว (ไม่ใช่ปุ่ม) | reveal หุบกลับ — **ไม่เข้าห้อง** (openWrap handler กลืนคลิก) | MEMBER | Medium | L19338–19342 |
| FO-TC-CHAT-020 | ขณะแถว reveal → แตะพื้นว่างนอกแถว | reveal หุบกลับ | MEMBER | Medium | pointerdown L19563–19570 |
| FO-TC-CHAT-021 | reveal แถว A อยู่ → เริ่มลากแถว B | A หุบอัตโนมัติ (reveal ได้ทีละแถว) | MEMBER | Low | L19576–19578 |
| FO-TC-CHAT-022 | ลากแถวซ้ายช้า ๆ แล้วปล่อยที่ dx <40px | แถว snap กลับ ไม่ reveal; คลิกต่อทันทีเข้าห้องได้ (suppress click 250ms เฉพาะกรณี lock แล้ว) | MEMBER | Low | suppressChatClick L19628 |
| FO-TC-CHAT-023 | reveal ขวา → กด **📌 pin** | toast **"ปักหมุดแชทแล้ว"** + แถวกระโดดขึ้นกลุ่ม pinned + มี pin badge บน avatar; reveal หุบ | MEMBER | High | `data-chact="pin"` L19295–19301 |
| FO-TC-CHAT-024 | กด pin บนแถวที่ pin อยู่แล้ว (t1) | unpin — toast "ยกเลิกการปักหมุดแล้ว" + badge หาย + แถวลงกลุ่มปกติ | MEMBER | Medium | |
| FO-TC-CHAT-025 | reveal ขวา → กด 🔕 mute | toast "ปิดการแจ้งเตือนแล้ว" + ไอคอน mute ข้างชื่อ; กดซ้ำ (icon เดิมตำแหน่ง unmute) → "เปิดการแจ้งเตือนแล้ว" | MEMBER | Medium | icon title ไทย แต่ toast ไทย — ทั้งคู่ hardcode |
| FO-TC-CHAT-026 | reveal ซ้าย → กด **Hide** → อ่าน modal | `ch-modal` กลางจอ: **"Hiding chats doesn't delete their messages."** + Cancel / Hide; modal เป็น EN hardcode | MEMBER | High | `openChatHideConfirm` L19216 |
| FO-TC-CHAT-027 | modal Hide เปิด → กด Cancel / แตะ backdrop | modal ปิด + reveal หุบ — แถวยังอยู่ ไม่มี toast | MEMBER | Medium | close() + chCloseRevealedRows |
| FO-TC-CHAT-028 | modal Hide → กด **Hide** | toast **"ซ่อนแชทแล้ว"** + แถวหายจาก list (hidden filter); ห้องยังคงอยู่ใน threads | MEMBER | High | toast ไทย hardcode ↔ title EN — i18n gap |
| FO-TC-CHAT-029 | reveal ซ้าย → **Delete** → modal "Are you sure you want to delete this chat?" → Delete | toast **"ลบแชทเรียบร้อยแล้ว"** + thread ถูก splice ออกจาก threads + msgs ถูกล้าง — หายถาวร | MEMBER | High | `openChatDeleteConfirm` L19245 |
| FO-TC-CHAT-030 | member: ซ่อน thread ของ the watch (item p2) → กลับไป feed → Ask โพสต์ p2 อีกครั้ง | `chatQuickAsk` เจอ thread เดิม → `t.hidden=false` → **unhide อัตโนมัติ** เปิดห้อง msgs ครบ; กรณี delete แล้ว Ask → ห้องใหม่ msgs ว่าง | MEMBER | Medium | L19203 unhide path |
| FO-TC-CHAT-031 | member: hide แถว chrono.th (unread=1, item M1 ของตัวเอง — Ask ซ้ำไม่ได้เพราะ own listing) → ดู badge | **badge ยังนับ unread ของห้องที่ hidden** — `chUnread` ไม่ filter hidden และเปิดห้องไม่ได้ → badge ค้าง *(quirk — คาด fail ถ้า spec อยากให้ hidden ไม่นับ)* | MEMBER | Low | GAP-CHAT-06 |

### 2.3 Item view + filter popover + `chatitem:id`

| TC ID | Steps | Expected | Actor | Priority | Note |
|---|---|---|---|---|---|
| FO-TC-CHAT-032 | member: แตะแท็บ "สินค้า/Items" | สลับเป็น item view: section "Your listings" (M1 Rolex Datejust 36, M2 Breguet) + "Items you asked about" (p1/p2/p6); tab active-pill ย้าย | MEMBER | High | `chListBody` item branch L18668–18681 |
| FO-TC-CHAT-033 | อ่าน item row | thumb รูปสินค้า + ชื่อ + preview = "price · N chats" (mine) หรือ "price · ข้อความล่าสุด" (asked) + เวลา + unread รวมของกลุ่ม | MEMBER | Medium | `chItemRowHTML` L18637 |
| FO-TC-CHAT-034 | แตะ item p1 (Watch 777 — thread เดียว ไม่ใช่ mine) | **เข้าห้องตรงเลย ไม่ผ่าน chatitem** (`isDirectRoom` → `data-chgo="room"`) | MEMBER | High | L18639–18640 |
| FO-TC-CHAT-035 | แตะ item M1 (ของตัวเอง, ~14 threads) | เปิด `chatitem:mi1`: head "Item chats" + back + การ์ด item pill (รูป+cap+price+"Your listing · N chats") + search "Search people or messages" + list threads | OWNER | High | `chatItemHTML` L18745 |
| FO-TC-CHAT-036 | ใน chatitem: ลากแถวซ้าย/ขวา + แตะแถว | swipe pin/mute/hide/del ทำงานเหมือน list หลัก (markup `ch-row-wrap` เดียวกัน); tap → ห้อง | OWNER | Medium | shared chRowHTML |
| FO-TC-CHAT-037 | chatitem: พิมพ์ "chrono" ในช่อง search | filter สดเฉพาะ thread ใน item นี้; ไม่เจอ → "No chats found" + "Try another name or message." | OWNER | Medium | `.ch-iq` → `chItemBody` L20385 |
| FO-TC-CHAT-038 | chatitem: back | กลับ chat list (item view ค้างไว้ — iq ไม่ reset) | MEMBER | Medium | rpBack; reset เฉพาะตอน navgo |
| FO-TC-CHAT-039 | Items view: แตะแท็บ "สินค้า/Items" ซ้ำ | เปิด filter popover: "Filter items by/กรองตามรายการ" + 3 แถว (All items ✓ / Your listings / Items you asked about) + backdrop | MEMBER | High | `filterMenuOpen` toggle L19374–19376 |
| FO-TC-CHAT-040 | popover → เลือก "Your listings" → เลือก "Items you asked about" | เหลือเฉพาะกลุ่ม mine / เฉพาะกลุ่ม asked; check ย้ายตาม; popover ปิดเอง; ถ้าไม่มีของกลุ่มนั้น → "No listings found" / "No asked items found" | MEMBER | High | `data-chitemfilter` L19357 |
| FO-TC-CHAT-041 | popover เปิด → แตะ backdrop / แตะพื้นใน popover | backdrop → ปิด popover; แตะใน popover (ไม่ใช่แถว) → ไม่ปิด ไม่ทำอะไร | MEMBER | Low | L19348–19369 |
| FO-TC-CHAT-042 | item view ค้าง → แตะแท็บ "แชท/Chats" | กลับ user view + **`C.q` ถูกล้าง + `itemFilter` รีเซ็ต all** | MEMBER | Medium | seg handler L19382–19387 |
| FO-TC-CHAT-043 | member: อยู่ chat (เปลี่ยน view/search ไว้) → แตะ nav แท็บ Feed → แตะ Chat กลับ | `chatResetToDefault` ทำงานทุก navgo → list กลับ **default view** (ตาม cfg), q/iq ว่าง — ไม่ค้างหน้าเดิม | MEMBER | Medium | L17950 + L21626 |
| FO-TC-CHAT-044 | member: ใน chatitem ลบ/ซ่อน thread สุดท้ายของ item นั้น | ลบ → หน้ากลายเป็น "Item not found / No chats for this item." (group หายจาก chItemGroups); ซ่อน → การ์ดยังอยู่ + body "No chats found" *(quirk: ผลต่างกัน)* | OWNER | Low | delete=splice จาก threads, hide=flag เฉยๆ |

### 2.4 `chatroom:id` — ห้องสนทนา

| TC ID | Steps | Expected | Actor | Priority | Note |
|---|---|---|---|---|---|
| FO-TC-CHAT-045 | member: เปิดห้อง t2 (Watch 777 / p1) | head: back + ชื่อ user + 🔍 + ☰; day divider "Today"; **post reference card** แถวแรก (รูปใหญ่+scrim บน owner+ล่าง title/price); bubbles ซ้าย=them (avatar), ขวา=me | MEMBER | High | `chatRoomHTML` L18771 |
| FO-TC-CHAT-046 | อ่าน bubble meta: ข้อความ them ติดกันหลายอัน / me สุดท้าย | them ติดกัน → avatar โชว์เฉพาะ bubble แรกของกลุ่ม (ที่เหลือ spacer); meta time ข้าง bubble; **เฉพาะข้อความ me อันสุดท้าย** โชว์ Read/Sent | MEMBER | Medium | L18807–18824 `prev`/`lastMe` |
| FO-TC-CHAT-047 | พิมพ์ข้อความ → ลบ → พิมพ์แต่ช่องว่าง | พิมพ์ → send เปิดใช้; ลบ/ช่องว่างล้วน → send disabled (trim) | MEMBER | High | `.ch-input` input L20360 |
| FO-TC-CHAT-048 | พิมพ์ "สวัสดีครับ" → กดปุ่ม send | bubble ใหม่ขวา + meta "Sent" + เวลา **09:41** (fixed seed) + input ล้าง + focus กลับ; กลับ list → แถวขึ้นบนสุด (ยกเว้น pinned กลุ่ม) + preview "You: สวัสดีครับ" | MEMBER | High | `chSend` L19173 — unshift + renderSub |
| FO-TC-CHAT-049 | พิมพ์ → กด **Enter** | ส่งเหมือนกด send | MEMBER | Medium | keydown L20275 |
| FO-TC-CHAT-050 | พิมพ์ค้างไว้ → back ออก → เข้าห้องเดิม | input prefill ด้วย draft เดิม + send enabled — draft ค้างใน `t.draft` | MEMBER | Medium | L18861 value=t.draft |
| FO-TC-CHAT-051 | ส่งข้อความยาวมาก (หลายบรรทัด/อีโมจิ/ไทยผสม) | bubble wrap ไม่ล้นกรอบ; ไม่มี maxlength; ส่งได้ปกติ | MEMBER | Low | edge ข้อความยาว |
| FO-TC-CHAT-052 | กด **การ์ด item** ปักหัวห้อง | `Post Detail` เปิดทับห้อง (`.page-detail` เหนือ `.page-sub`); กด detail-back → กลับห้องเดิม ทุกอย่างครบ | MEMBER | High | `data-chgo="post"` L19440 — integration กับ FO-TEST-06 |
| FO-TC-CHAT-053 | ลบโพสต์ต้นทางออกก่อน (own post p4 ผ่าน post menu Delete) → เปิดห้อง M1 ที่ผูก p4 → กดการ์ด | การ์ดยัง render (item เก็บค่าไว้) แต่กดแล้ว toast **"Listing detail isn't in this prototype yet"** (findPost ไม่เจอ) | OWNER | Medium | edge: item ที่ post ถูกลบ — เทียบเคส sold/hide ใน CHAT-104/105 |
| FO-TC-CHAT-054 | แตะชื่อ user ใน head ห้อง | `profile:` sub สไลด์ทับห้อง; back → ห้องเดิม | MEMBER | Medium | `data-pf-user` → pushSub L22130 |
| FO-TC-CHAT-055 | แตะ 🔍 ใน head → พิมพ์ "ลด" → กด X ล้าง → กด X ปิด | head สลับเป็นกล่องค้นหา (autofocus); พิมพ์ → ข้อความ match มี `<mark>` ไฮไลต์ ที่ไม่ match จาง 0.25 (media จางเสมอเมื่อมี query); X ล้าง → ครบ; X ปิด → head กลับปกติ | MEMBER | High | room search L18827–18834 + L19533–19548 |
| FO-TC-CHAT-056 | ขณะ search mode → ดูด้านล่าง | **composer หาย** (searching → ไม่ render ch-comp/blocked bar) — ส่งข้อความไม่ได้จนกว่าจะออกจาก search | MEMBER | Low | L18848 ternary |
| FO-TC-CHAT-057 | เปิดห้องที่มีข้อความเยอะ (t1) | เปิดมา scroll ลงล่างสุดอัตโนมัติ (ข้อความล่าสุดเห็น) | MEMBER | Low | `chPostRender` L17975 + renderSub L15132 |
| FO-TC-CHAT-058 | member: block Watch 777 (ผ่าน chmenu) → เปิดห้อง t2 | composer ถูกแทนด้วย **blocked bar**: 🚫 + "You blocked this account" + "You can't message or call them unless you unblock them." + ปุ่ม **Unblock** — ไม่มี input/send | MEMBER | High | `isBlk` L18776 → blocked bar L18849 |
| FO-TC-CHAT-059 | ในห้อง blocked → กด **Unblock** → dlg | center dlg "Unblock X?" → Unblock → toast "Unblocked" + composer กลับมา + badge Blocked หายจาก list | MEMBER | High | `unblock-room` → unblockDlg L19313 |
| FO-TC-CHAT-060 | ห้อง blocked → พยายามส่ง (เรียก chSend ตรงไม่ได้ — composer ไม่มี) → ยืนยันด้วย block แล้วยังส่ง media ผ่าน attach ได้ไหม | composer/ปุ่ม + ไม่มีเลย → ไม่มีทางส่ง; *(code: `chSend` guard blocked อยู่แล้ว)* | MEMBER | Low | defense-in-depth L19178 |
| FO-TC-CHAT-061 | member: เปิด `chatroom:` ที่ thread ถูกลบไปแล้ว (ลบจากหน้าอื่นไม่ได้ — ตรวจเฉพาะเชิงโค้ด/ถ้าเข้าถึงได้) | "Chat not found" + "This conversation is no longer available." — ใน UI ปกติเข้าถึง state นี้ไม่ได้ (delete จะ pop ห้องทิ้งให้) | MEMBER | Low | `chGet` null branch L18774 — mark เป็น unreachable-state |

### 2.5 Attach sheet + media viewer + media bubbles

| TC ID | Steps | Expected | Actor | Priority | Note |
|---|---|---|---|---|---|
| FO-TC-CHAT-062 | member: ในห้อง → กดปุ่ม **+** (attach) ใน composer | `ch-attach-sheet` เลื่อนขึ้นทับห้อง: handle + "Photos & videos" + X + grid รูป (≤8 รูป unique จาก photos ของ POSTS) — เป็น overlay แยก ไม่ใช่ `.comment-sheet` | MEMBER | High | `openChatAttachSheet` L18867 |
| FO-TC-CHAT-063 | attach sheet → แตะรูปหนึ่ง | ส่งทันทีเป็น media bubble (ไม่มี caption/confirm) + sheet ปิด + bubble อยู่ในห้อง + thread ขึ้นลำดับบนสุด | MEMBER | High | `data-chsendmedia` L19452 |
| FO-TC-CHAT-064 | ส่งรูปแล้ว → เปิด ☰ menu → ดู Photos & videos | รูปที่ส่งเข้า `t.media` → โผล่ใน strip ของ chmenu + ใน `chmedia` gallery | MEMBER | Medium | L19460–19461 |
| FO-TC-CHAT-065 | attach sheet เปิด → ปิดด้วย X / แตะ backdrop | ทั้งสองปิด — ไม่ส่งอะไร; ไม่มี drag-dismiss | MEMBER | Medium | L18908–18909 |
| FO-TC-CHAT-066 | attach sheet → สังเกตว่ามี badge ▶ บน thumb ไหม | **ไม่มีเลย** — sampleMedia ทุกตัว `isVideo:false` → เส้นทาง video badge/play icon ใน bubble เป็น dead render | MEMBER | Low | GAP-CHAT-13 |
| FO-TC-CHAT-067 | member: Ask โพสต์ใหม่ (draft room) → กด + → ส่งรูปเป็นข้อความแรก → back → ดู chat list | รูปขึ้นในห้อง แต่ **แถวไม่เข้า list** — media-send path ไม่มี `C.draft` materialize (`chSend` มี) *(quirk — คาด fail)*; ส่ง text ตามทีหลัง → thread ถึงเข้า list | MEMBER | Medium | GAP-CHAT-05 |
| FO-TC-CHAT-068 | member: แตะ media bubble ในห้อง / thumb ใน chmenu strip / item ใน gallery | `ch-media-viewer` fullscreen: รูปกลางจอ + ปุ่ม X บนซ้าย — เหนือทุก layer ใน `.screen` | MEMBER | High | `openChatMediaViewer` L18911 |
| FO-TC-CHAT-069 | viewer เปิด → ปิดด้วย X / แตะพื้นมืดหรือ body รอบรูป | ทั้งสองวิธีปิด (`.remove()`); แตะบนตัวรูปไม่ปิด | MEMBER | Medium | L18927–18928 |
| FO-TC-CHAT-070 | viewer: พยายาม pinch/double-tap zoom / swipe ไปรูปถัดไป | **ไม่มี zoom ไม่มี swipe** — viewer เป็นรูปเดียว static *(spec ขอ zoom/swipe — คาด fail เป็น expectation gap)* | MEMBER | Low | GAP-CHAT — บันทึกเป็น missing feature |

### 2.6 `chmenu:id` + block/report จาก chat

| TC ID | Steps | Expected | Actor | Priority | Note |
|---|---|---|---|---|---|
| FO-TC-CHAT-071 | member: ในห้อง → กด ☰ | `chmenu:` สไลด์ทับ: head=username + 4 action tiles (Mute / Profile / Block / Report) + แถว "Photos & videos ›" + strip รูป หรือ "No photos or videos found." + แถว "Listings & Items › ชื่อ item" + footer 🔒 "This chat is protected with End-to-End Encryption" | MEMBER | High | `chatRoomMenuHTML` L18931 |
| FO-TC-CHAT-072 | chmenu → กด tile **Mute** | toast "ปิดการแจ้งเตือนแล้ว" + tile เปลี่ยน Unmute + สไตล์ active; กลับห้อง/list → mute icon ตรงกัน | MEMBER | Medium | `data-chact="mute"` shared |
| FO-TC-CHAT-073 | chmenu → tile **Profile** | profile ของ user นั้นสไลด์ทับ; back กลับ chmenu | MEMBER | Low | `data-pf-user` |
| FO-TC-CHAT-074 | chmenu → แถว "Photos & videos" | เปิด `chmedia:` gallery | MEMBER | Medium | `data-chgo="chmedia"` |
| FO-TC-CHAT-075 | chmenu → แตะรูปใน media strip | media viewer เปิดตรง (ไม่ผ่าน gallery) | MEMBER | Low | `data-chmedia` |
| FO-TC-CHAT-076 | chmenu → แถว "Listings & Items" | Post Detail ของ item เปิดทับ (เหมือนการ์ดในห้อง) | MEMBER | Medium | `data-chgo="post"` |
| FO-TC-CHAT-077 | chmenu → tile **Block** → อ่าน sheet | blk sheet (variant pm): avatar + "Block X?" + "This will also block any other profiles…" + **3 impact rows** + ปุ่ม **Block เดียว** — **ไม่มี "Block and report"** เพราะ fromChat=true | MEMBER | High | `blkSheetHTML(u,true)` L17019 |
| FO-TC-CHAT-078 | blk sheet → กด **Block** | sheet ปิด + toast **"Blocking"** + chmenu tile กลายเป็น Unblock + ห้องมี blocked bar + list มี badge "Blocked" + โพสต์/comment ของคนนั้นหายจาก feed/sheet | MEMBER | High | `blk-go` L21936 + `pfSetBlocked` L16986 |
| FO-TC-CHAT-079 | chmenu ของคนที่ block แล้ว → tile เป็น **Unblock** → กด | center dlg "Unblock X?" (ไม่ใช่ sheet) → Unblock → toast "Unblocked" + ทุกอย่างกลับ | MEMBER | High | `block-user` branch L19313 |
| FO-TC-CHAT-080 | chmenu → tile **Report** | `chatReport` sheet (variant pm): avatar + **"Are you sure you want to report X?"** + คำอธิบาย (Report and delete จะลบแชท+ประวัติ) + ปุ่ม **Report and delete** / **Report** / **Cancel** | MEMBER | High | `chatReportSheetHTML` L17023 |
| FO-TC-CHAT-081 | chatReport sheet → **Cancel** | sheet ปิด กลับ chmenu — ไม่มีอะไรเกิด | MEMBER | Medium | `.ch-sheet-cancel-btn` L21920 |
| FO-TC-CHAT-082 | chatReport → **Report** | sheet ปิด → `report:user` sub เปิด (rpFromChat → **ไม่มีปุ่ม back มีแค่ X**) → เลือกเหตุ → `report:done:` → Done → กลับ chmenu + toast "Report submitted…" — thread ยังอยู่ | MEMBER | High | L21908–21918; hasBack L17828 |
| FO-TC-CHAT-083 | chatReport → **Report and delete** → ทำ report จนจบ → Done/X | flow เดียวกัน + `rpDelChat` → เมื่อผ่าน `report:done` แล้วปิด stack → **thread ถูกลบ** + ลงที่ chat list (ห้อง/chmenu ถูก pop ทิ้ง) | MEMBER | High | `rpClose` L15242–15253 |
| FO-TC-CHAT-084 | chatReport → Report and delete → กด **X กลาง flow** (ก่อนถึง done) | ปิด stack โดย `hadDone=false` → **chat ไม่ถูกลบ** กลับ chmenu | MEMBER | Medium | เช็กเงื่อนไข `hadDone && delTid` |
| FO-TC-CHAT-085 | report:done (จาก chat) → ขั้นตอน "Other steps" → กด **Block X** | เปิด blk sheet **แบบปุ่มเดียว** (rpFromChat ทำ fromChat=true → ไม่มี Block and report แม้อยู่ในหน้า report) | MEMBER | Low | L21969 quirk |

### 2.7 `chmedia:id` — media gallery

| TC ID | Steps | Expected | Actor | Priority | Note |
|---|---|---|---|---|---|
| FO-TC-CHAT-086 | member: chmenu → Photos & videos (ห้อง t1) | gallery: X ปิด + ชื่อ user + ปุ่ม "Select" + label "October 2569 BE" (**hardcode**) + grid รูป (item photo + post photos ≤9 — auto-seed เฉพาะ t1) | MEMBER | Medium | `chatMediaGalleryHTML` L19013; GAP-CHAT-10 |
| FO-TC-CHAT-087 | gallery (ไม่ select) → แตะรูป | media viewer เปิด | MEMBER | Low | `data-chgalitem` non-select branch L19512 |
| FO-TC-CHAT-088 | gallery → กด **Select** → แตะ 2 รูป | head สลับ "Cancel / **2 selected** / Deselect" + checkbox วงกลมเลขลำดับ 1,2 บนรูป + bottom bar: 🗑 + ⬇ (ทั้งคู่ enabled เมื่อมีเลือก; Deselect disabled เมื่อ 0) | MEMBER | High | galState L19032–19047 |
| FO-TC-CHAT-089 | select mode → กด 🗑 | รูปที่เลือกหายจาก gallery + toast **"ลบรูปภาพที่เลือกแล้ว"** + ออกจาก select mode; **แต่ media bubble ในห้องยังแสดงรูปเดิม** (ลบเฉพาะ t.media ไม่แตะ msgs — desync) *(quirk)* | MEMBER | Medium | L19522–19527 GAP-CHAT-17 |
| FO-TC-CHAT-090 | select mode → กด ⬇ | toast **"บันทึกลงในรูปภาพแล้ว"** (ไม่มีการดาวน์โหลดจริง) | MEMBER | Low | L19528–19530 |
| FO-TC-CHAT-091 | select mode → Deselect / Cancel / X ปิดหน้า | Deselect → เลือก 0; Cancel → ออก select; X → ปิดหน้า + reset galState | MEMBER | Low | L19473–19500 |
| FO-TC-CHAT-092 | เปิด chmedia ของห้องที่ไม่มี media (เช่น t2 ก่อนส่งรูป) | "No photos or videos found." กลางหน้า + **ไม่มีปุ่ม Select** (มี placeholder กว้างแทน) | MEMBER | Low | L19053 else branch |

### 2.8 `chatcfg` (ตั้งค่าแชทกลาง) + `chsettings:id` (dead route)

| TC ID | Steps | Expected | Actor | Priority | Note |
|---|---|---|---|---|---|
| FO-TC-CHAT-093 | member: chat list → กด ⚙ gear | `chatcfg` เปิด: back + "การตั้งค่าแชท/Chat settings" + section Notifications (Message notifications **on**, Show message preview **on**) + Privacy (Only people I follow can message me **off**) + Default chat view (Chats ✓ / Items) + Quick Ask input (ค่า seed "สนใจสินค้าชิ้นนี้ครับ ยังอยู่ไหมครับ?") + note | MEMBER | High | `chatCfgHTML` L19152 |
| FO-TC-CHAT-094 | chatcfg → กด toggle ทั้ง 3 ทีละตัว | toggle flip ทันที (`.ch-tgl` on/off) + เขียน `C.cfg` — **แต่ไม่มีผลต่อระบบอื่นใน prototype** (ไม่มี incoming msg/notif sim) | MEMBER | Medium | `data-chtgl` L19393 — display-only |
| FO-TC-CHAT-095 | chatcfg → Default view เลือก **Items** → back → แตะ nav Feed → Chat | รอบนี้เปิด chat = **item view** (defView มีผลจริงผ่าน chatResetToDefault) | MEMBER | Medium | `data-chdef` L19400 เซ็ตทั้ง cfg+view |
| FO-TC-CHAT-096 | chatcfg → แก้ Quick Ask message เป็น "ขอรูปเพิ่มครับ" → back → Ask โพสต์ใหม่ | draft prefill = ข้อความใหม่ (**integration**); maxlength 80 | MEMBER | High | `chc-quick` L20392 → cfg.quick → L19197 |
| FO-TC-CHAT-097 | เปิด followOnly=on → ให้ "คนที่เราไม่ follow" Ask เรา (prototype เป็น actor เดียว — เช็กเชิงโค้ด/ทำเท่าที่ UI อนุญาต) | **ไม่มี enforcement** — toggle เป็น display state เฉย ๆ ไม่มี gate ที่อ่าน `cfg.followOnly` *(quirk — บันทึก)* | MEMBER | Low | GAP-CHAT-09 |
| FO-TC-CHAT-098 | chatcfg → back | กลับ chat list (rpBack เพราะ stack [chat, chatcfg]) | MEMBER | Low | |
| FO-TC-CHAT-099 | ตรวจทุกจุดเข้า `chsettings:` — head ห้อง (มีแค่ back/ชื่อ/🔍/☰), chmenu (ไม่มีแถว settings), chatcfg (global แยก) | **ไม่มี entry point ใด ๆ** — `data-chgo="chsettings"` ไม่ถูก render ที่ไหนเลย → หน้า room settings (Note notifications/Chat wallpaper/Export/Encryption keys/Delete data/Report) **เข้าถึงไม่ได้ทาง UI** — [DEAD ROUTE] ยืนยันแล้วบันทึก GAP | MEMBER | Medium | GAP-CHAT-01 — inventory แถวนี้เทสได้แค่ "พิสูจน์ว่าเข้าไม่ได้" |

### 2.9 Guest matrix / blocked state / i18n / theme / edge

| TC ID | Steps | Expected | Actor | Priority | Note |
|---|---|---|---|---|---|
| FO-TC-CHAT-100 | guest: ลองทีละ entry — แท็บ Chat / Ask pill บน card / chat-fab บน detail p2 / Ask บน detail p1 | ทุกอัน → Member Sheet "Join TukDaeng" — ไม่มี chat UI เปิดเลย | GUEST | High | `.ask-pill` `.chat-fab` `[data-navgo=chat]` ใน GUEST_GATE_SEL |
| FO-TC-CHAT-101 | guest: gate เด้งจากแท็บ Chat → ปิด / Sign in → กลับมา | ปิด → อยู่ feed เดิม (ไม่ resume ไป chat); sign in → member session แต่ยังต้องแตะ Chat เองอีกครั้ง | GUEST→MEMBER | Medium | ไม่มี pending-action resume สำหรับ navgo |
| FO-TC-CHAT-102 | member: block user แล้วดูผลข้ามจุด — list แถวมี badge "Blocked" / ห้องมี blocked bar / feed ไม่มีโพสต์เขา / comments ถูกกรอง / profile ยังเปิดได้มี Unblock | ครบทุกผลของ `pfSetBlocked` (IG keep-page) — ผล feed/comment เทสร่วม FO-TEST-16 | MEMBER | High | L16986–17003 |
| FO-TC-CHAT-103 | member: ในห้อง blocked → ☰ menu → ดู tile + กลับ list ดู badge | tile = Unblock (active); แถว list แสดง "Blocked" badge แทน mute icon | MEMBER | Medium | `isBlk` render L18612,18969 |
| FO-TC-CHAT-104 | member: mark โพสต์ own เป็น sold (post menu → Mark as sold) → เปิดห้องที่ผูก item นั้น → กดการ์ด | ห้องยังใช้ได้ปกติ; การ์ดยังกด → detail เปิด (post ยังอยู่ใน POSTS แค่ pfkind=sold) — ข้อความส่งต่อได้ *(edge: ไม่มี sold badge/ล็อกในห้อง)* | OWNER | Medium | ขอบเขตบังคับ: ห้องของ asset sold |
| FO-TC-CHAT-105 | member: ซ่อนลิสติ้ง own (post menu → Hide/ซ่อน) → ห้องที่ผูก → กดการ์ด | เหมือนข้อบน — เปิด detail ได้ (prototype ไม่กรอง) — จับคู่กับ CHAT-053 (ลบ = toast) | OWNER | Low | edge: asset hide |
| FO-TC-CHAT-106 | TH: เปิด chat list + ห้อง + chmenu + attach sheet + ch-modal | localized: tabs "แชท/สินค้า", ph "ค้นหา", filter popover ไทย, chatcfg ไทย / **EN hardcode:** "You:", "Blocked", "Hide/Delete", day labels, "Read/Sent", "Message...", "Search people or messages", "No chats yet", attach "Photos & videos", ch-modal titles, blk/report sheets, chmenu rows, E2E note / **TH hardcode:** toast ทั้งชุด (ซ่อนแชทแล้ว, ลบแชทเรียบร้อยแล้ว, ปักหมุดแชทแล้ว, ลบรูปภาพที่เลือกแล้ว, บันทึกลงในรูปภาพแล้ว) — mismatch ทั้งสองทิศ *(i18n gap)* | MEMBER | Medium | GAP-CHAT-04 |
| FO-TC-CHAT-107 | dark theme: เปิด chat list/room/menu → เปิด ch-modal (Hide) | หน้า chat ทั้งหมด dark ถูกต้อง (`.page-sub.pg-chat` + ch-* dark rules); **ch-modal ยังเป็น light** เพราะ append เข้า `document.body` — selector `.screen[data-theme=dark] .ch-modal` ไม่มีวันจับได้ + modal center ทั้ง viewport ไม่ใช่เฟรมมือถือ *(คาด fail)* | MEMBER | Medium | GAP-CHAT-03 |

## 3. Traceability audit — chat vs inventory §2.7

| Inventory row | TC ที่ครอบ |
|---|---|
| `chat` user view (swipe Hide/Delete, Pin/Mute, unread badge, search) | CHAT-011..031 |
| `chat` item view ("Your listings"/"Items you asked about"/filter popover) | CHAT-032..042 |
| `chatcfg` | CHAT-093..098 |
| `chatitem:id` | CHAT-035..038,044 |
| `chatroom:id` (day dividers, post card, Read/Sent, in-room search, draft, send disabled, blocked bar) | CHAT-003,004,010,045..061 |
| attach sheet `ch-attach-sheet` | CHAT-062..067 |
| `ch-media-viewer` | CHAT-068..070 |
| `chmenu:id` (Mute/Profile/Block/Report/media strip/Listings/E2E note) | CHAT-071..085 |
| `chsettings:id` | CHAT-099 (**dead route — เข้าถึงไม่ได้**, พิสูจน์แล้วว่าไม่มี entry) |
| `chmedia:id` | CHAT-086..092 |
| dialog `ch-modal` hide/del | CHAT-026..029,107 |
| sheet `blk` (fromChat ปุ่มเดียว) | CHAT-077,078,085 |
| sheet `chatReport` | CHAT-080..084 |
| `chatQuickAsk` (Ask entries/draft/prefill/own/blocked) | CHAT-001..010,030,067,096 |
| state `blocked` | CHAT-058..060,102,103 |
| ปุ่ม chat vs dead-list (ตามที่สั่งตรวจ) | ผ่าน — ไม่มี chat selector ใน dead-list; chatClick ก่อน dead check เสมอ (ยกเว้น `.ask-pill` ที่ถูกกินก่อนอยู่แล้ว) |

## 4. Gaps / quirks ที่พบในระหว่างออกแบบ (ยืนยันกับทีมก่อน file bug)

- **GAP-CHAT-01 (dead route):** `chsettings:id` มี renderer `chatRoomSettingsHTML` + dispatch + handler ครบ แต่ **ไม่มี element ใด render `data-chgo="chsettings"`** — room settings ทั้งหน้า (Note notifications toggle ที่ wire ไป `data-chact="mute"` ของ thread, Chat wallpaper [DEAD], Export chat copy, Encryption keys info, Delete data, Report) เข้าถึงไม่ได้ผ่าน UI เลย → TC ทำได้แค่พิสูจน์ว่าไม่มีทางเข้า (CHAT-099)
- **GAP-CHAT-02 (dead UI):** `.chat-fab` + `.chat-pop` (inline DM pop บน detail ของโพสต์ cfg `ask:"bubble"` = p2/p5/p6) — `chatClick` ดัก `.chat-fab` ที่ L19551 **ก่อน** handler ป๊อป L22168 → fab เปิด chatroom เต็มเสมอ ป๊อป inline เปิดไม่ได้ (เปิดได้เฉพาะตอน `findPost` fail)
- **GAP-CHAT-03:** `ch-modal` (hide/delete confirm) append เข้า `document.body` ไม่ใช่ `.screen` → **dark theme ไม่มีผล** (selector ต้องการ ancestor `.screen[data-theme=dark]`) และ `position:fixed;inset:0` ครอบทั้ง browser viewport ไม่ใช่เฟรมมือถือ
- **GAP-CHAT-04 (i18n mismatch สองทิศ):** ข้อความ UI จำนวนมาก EN hardcode (preview "You:", badge "Blocked", ปุ่ม Hide/Delete, day labels, Read/Sent, "Message...", empty states, attach/ch-modal/blk/chatReport/chmenu ทั้งชุด) ขณะที่ **toast กลับ TH hardcode** ("ซ่อนแชทแล้ว"/"ลบแชทเรียบร้อยแล้ว"/"ปักหมุดแชทแล้ว"/"ลบรูปภาพที่เลือกแล้ว"/"บันทึกลงในรูปภาพแล้ว"/"การเปลี่ยนพื้นหลังแชทจะเปิดให้ใช้งานเร็ว ๆ นี้") — แม้ lang=EN toast ก็ไทย
- **GAP-CHAT-05:** ส่งรูปเป็นข้อความแรกบน draft thread → msg เข้าห้องแต่ thread ไม่เข้า list — `data-chsendmedia` handler ไม่มี `C.draft` materialize + ไม่ `t.hidden=false` เหมือน `chSend` (media ในห้องที่ hidden ก็ไม่ unhide)
- **GAP-CHAT-06:** `chUnread` นับ unread ของ thread ที่ `hidden` ด้วย → ซ่อนห้องที่ยังไม่อ่าน = badge ค้างไม่มีทางเคลียร์ผ่าน UI
- **GAP-CHAT-07:** Ask Seller จาก detail → `chatQuickAsk` ลบ `pv-open/detail-open` แล้ว `openSub` reset stack → back จากห้องลง **feed** ไม่กลับ detail (เช็กกับ spec "Detail → Ask → Chat → กลับ Detail ได้")
- **GAP-CHAT-08:** `.pf-msg` (ปุ่ม Chat บน public profile + followers list) → toast "Open a listing to chat with this seller" — ไม่เปิดห้อง, เป็น hint dead-end ไม่ใช่ chat entry
- **GAP-CHAT-09:** `chatcfg` toggles notif/preview/**followOnly** = display state ล้วน — ไม่มี logic ใดอ่าน `cfg.followOnly` ("Only people I follow can message me" ไม่ถูกบังคับ)
- **GAP-CHAT-10:** gallery date label **"October 2569 BE"** hardcode ไม่อิงข้อมูล media
- **GAP-CHAT-11:** block toast แสดง **"Blocking"** (transient EN, ไม่ใช่ "Blocked") — IG parity flash toast แต่อ่านแล้วงง ๆ
- **GAP-CHAT-12:** ข้อความที่ส่งได้ `at:"09:41"`/`day:"Today"` ตายตัวทุกครั้ง (fixed seed)
- **GAP-CHAT-13:** attach grid มีแต่รูป (`isVideo:false` ทั้งหมด) → เส้นทาง video badge + `m.isVideo` ใน bubble เป็น dead render; media viewer ไม่มี zoom/swipe (single-image static) แม้ task spec ขอ zoom/swipe
- **GAP-CHAT-14 (เช็กตามสั่ง):** dead-list L22148 ไม่ชนปุ่ม chat ตัวไหนเลย — `chatClick` ทำงานก่อน dead check เสมอ; `.ask-pill` อยู่ใน dead-list แต่ chatClick กินก่อน → dead toast เกิดเฉพาะ edge ที่หา post ไม่เจอ; `.chat-fab` ไม่อยู่ใน dead-list แต่ถูก chatClick กินเช่นกัน
- **GAP-CHAT-15:** item-view rows (`.ch-row` ไม่มี `.ch-row-wrap`) **swipe ไม่ได้** — actions pin/mute/hide/del มีเฉพาะใน user view + chatitem
- **GAP-CHAT-16:** `chatResetToDefault` ถูกเรียกทุก navgo (ทุกแท็บ) → ออก/เข้า chat ผ่าน bottom nav = view/filter/search reset เสมอ (state ค้างเฉพาะภายใน session เดียวกัน)
- **GAP-CHAT-17:** chmedia ลบรูป → ลบเฉพาะ `t.media` — media bubble ในห้องยังแสดงรูปเดิม (gallery↔thread desync)
- **GAP-CHAT-18:** delete แถวสุดท้ายของ item ขณะอยู่ใน `chatitem:` → หน้ากลายเป็น "Item not found" (group หาย); hide แถวสุดท้าย → การ์ดอยู่ + "No chats found" — ผลต่างกัน
- **เชื่อม task อื่น:** report stack หลัง entry (report:pick/posts/done detail) = FO-TEST-16 · blocked list/unblock ใน settings = FO-TEST-15/16 · Post Detail เนื้อหา = FO-TEST-06 · `.chat-pop`/`cp-*` dead code เหลือไว้เป็นหลักฐาน UI ที่ไม่ถึง
