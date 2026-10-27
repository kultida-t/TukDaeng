# FO-TEST-00 — Master Coverage Map (FO Prototype Inventory)

> Task: FO-TEST-00 ของชุด FO-TEST-001 · วันที่: 2026-10-27
> Source of Truth (primary): `Prototypes/fo-flow/index.html` (SPA ไฟล์เดียว ~23,6xx บรรทัด)
> Secondary (เช็ก gap): `deliverables/FO-DIAG-001-fo-app-diagrams.md` (Feature Map + Sitemap)
> ตารางหลักในส่วนที่ 2 คือ **"สัญญาความครอบคลุม"** — task FO-TEST-01…20 ต้องอ้าง route/overlay/state จากตารางนี้เท่านั้น

## 0. วิธีอ่าน

- **Route** = ชื่อ sub-page จริงจาก `subHTML(name)` dispatch (`openSub` / `pushSub` / `rpPush` / `openSubOver`) — ไม่ใช่ hash route
- **Overlay** = sheet/dialog/viewer ที่เปิดทับ (`pm-open`, `comments-open`, `detail-open`, `pv-open`, `dialog-open`, `wa-open`, `hb-open`, `pf-qr-open`, `cap-open` ฯลฯ)
- **Actor**: `GUEST` (session=guest), `MEMBER` (session=member), `OWNER` (member ฐานะเจ้าของ asset/โพสต์ตัวเอง), `ADMIN` (มีแต่ใน diagram — FO ไม่มีหน้าจอ)
- session ที่ 3 คือ `new` (สมัครใหม่) — ทำตัวเหมือน member แต่เริ่มด้วยข้อมูลว่าง (GUEST-001)
- **Tag**:
  - `[OPEN-CODE-ONLY]` — มีในโค้ด แต่ Feature Map / Sitemap ไม่ได้ระบุ
  - `[OPEN-NO-CODE]` — diagram ระบุ แต่หาในโค้ดไม่เจอ
  - `[GATE]` — guest กดแล้วเจอ `obGate()` (Member Sheet "Join TukDaeng")
  - `[DEAD]` — render จริงแต่ wiring เป็น placeholder/toast "Not in this prototype yet"

## 1. สถาปัตยกรรมที่สรุปจากโค้ด (สั้น)

- หน้าหลัก = Feed shell (`screenHTML`) + bottom nav 5 แท็บ (`botNavHTML`: feed / chat / board / alerts / profile)
- Sub-page stack: `openSub(scr,name,swap)` → `renderSub` → `subHTML(name)` — ไฟล์เดียว dispatch ทุก route
- Layer เหนือ feed (ตามลำดับ z): `.page-sub` (sub pages) → `.page-pv` (post viewer) → `.page-detail` (post detail) → `.comment-sheet` (bottom sheets ทุกชนิด) → `.dlg` (center dialogs) → onboarding overlay (`.ob`)
- bottom sheet ทุกอันใช้ `.comment-sheet` เดียวกัน สลับด้วย class variant: `pm` `pm-rp` `lk` `sh` `sv` `dt` `nt` `ps` `nc` `wl` `wa` `mf` `uf` (และ class state บน `.screen`: `pm-open`/`likes-open`/`share-open`/`save-open`/`details-open`/`wa-open`/`mf-open`/`unfollow-open`)
- `sort-open` มีใน CSS เท่านั้น — ไม่มี sheet ที่ใช้ (`S.sort` มี state new/plo/phi/pop แต่ไม่มี UI เปลี่ยน sort) `[OPEN-CODE-ONLY]` (dead CSS/state)
- guest: `GUEST_GATE_SEL` gate เฉพาะ action ที่ต้องมีตัวตน → `obGate()`; เดินหน้าจอทั่วไปได้ฟรี
- i18n: `state.lang` en/th + MutationObserver translate (I18N-001) · theme: `data-theme` light/dark (THEME-001) · dev: `?dev=1` preview states + review sidebar variant toggles (`state.variant/dl/dh/pr/ask/ds/ft/nav/tg/tStyle/dStyle`)

## 2. ตาราง Master Coverage Map — สัญญาความครอบคลุม

### 2.1 Onboarding / Authentication / Session

| Module | Route/Overlay | Feature | Actor ที่เกี่ยว | จำนวน TC ที่ควรมี | หมายเหตุ |
|---|---|---|---|---|---|
| Auth | onboarding `splash` | Splash auto-advance → `lang` (3.2s) | GUEST | 2 | |
| Auth | onboarding `lang` | เลือกภาษาเริ่มต้น (en/th) + Continue | GUEST | 3 | |
| Auth | onboarding `welcome` | Welcome page + ปุ่ม Get started → loading 1.5s → consent | GUEST | 3 | loading state จริง |
| Auth | onboarding `consent` | Privacy notice — Accept all / Essential only (analytics+personalized toggles) | GUEST | 5 | มี `ob-legal` overlay ข้างใน |
| Auth | onboarding `prefs` | Cookie settings page (consent→prefs) | GUEST | 3 | [OPEN-CODE-ONLY] (diagram ไม่แยกหน้า) |
| Auth | onboarding `notif` | Notification permission ask — Allow/Not now | GUEST | 3 | |
| Auth | onboarding `track` | Tracking/personalisation ask | GUEST | 3 | [OPEN-CODE-ONLY] |
| Auth | onboarding `member` | Member Sheet "Join TukDaeng" (gate + signup/signin/social/skip) | GUEST | 5 | ใช้กับทั้ง gate, sign-in path, re-consent |
| Auth | onboarding `signup` | Sign up form — email → send OTP | GUEST | 4 | |
| Auth | onboarding `otp` | OTP verify + resend (30s countdown) | GUEST | 5 | resend state จริง |
| Auth | onboarding `profile` | Profile setup — username validation `^[a-z0-9_.]{3,20}$` + photo picker placeholder + Skip | GUEST | 5 | invalid → localized error; photo = `[DEAD]` toast |
| Auth | onboarding `created` | Account created → เข้า feed เป็น session `new` | MEMBER | 2 | |
| Auth | onboarding `signin` | Sign in — email+password, eye toggle, forgot link, social | MEMBER | 6 | |
| Auth | onboarding `forgot` | Forgot password → `sent` state (check email) | MEMBER | 3 | |
| Auth | overlay `ob-legal` | Legal doc overlay ข้างใน onboarding (terms/privacy) | GUEST | 2 | `[OPEN-CODE-ONLY]` |
| Auth | actions `exit`/`decline`/`hide`/`social`/`resend` | ปิด onboarding (demo), decline consent, hide/show pwd, social sign-in, resend code | GUEST/MEMBER | 6 | toasts จริงทุกอัน |
| Auth | `obGate()` + `GUEST_GATE_SEL` | Member gate ทุกจุด: like/save/share/follow/comment/ask/create/chat/nav profile … | GUEST | 8 | ต้องทดสอบแยกแต่ละ entry point |
| Auth | re-consent (`OB.recon`) | re-consent flow หลัง sign out (decline → member sheet → sign out demo) | MEMBER | 4 | `[OPEN-CODE-ONLY]` |
| Auth | `settings → about_account` | About your account (joined/based-in/change pwd/delete) | MEMBER | 3 | |
| Auth | `change_pwd` | เปลี่ยนรหัส — 3 ฟิลด์ + eye + forgot + validation | MEMBER | 6 | |
| Auth | `del_account` step 1–2 | ลบบัญชี: terms cards → reason picker (6 เหตุ + feedback) | MEMBER | 7 | |
| Auth | dialog `delPasswordConfirm` / `delAccountSuccess` | ยืนยันด้วยรหัสปัจจุบัน → 30-day grace success + log out | MEMBER | 4 | |
| Auth | dialog `forgotPwd` | ส่ง reset link (mask email ตาม session) | MEMBER | 2 | `[OPEN-CODE-ONLY]` (dialog ใน settings) |
| Auth | dialog `logout` | Log out confirm → กลับ guest | MEMBER→GUEST | 3 | |

### 2.2 Feed / Post Card / Social

| Module | Route/Overlay | Feature | Actor ที่เกี่ยว | จำนวน TC ที่ควรมี | หมายเหตุ |
|---|---|---|---|---|---|
| Feed | feed shell `feed` | feed list + 3 tabs (ทั้งหมด/กำลังติดตาม/รายการโปรด) + seg-thumb + brand-menu (ft=none variant) + `feedEmptyHTML` empty ต่อ tab | GUEST/MEMBER | 6 | favorites tab ใช้ `favorite`; `snooze` กรองเฉพาะ following |
| Feed | post card | card = head(avatar+follow+more) + photo carousel (tap ซ้าย/ขวา ครึ่งหน้า + dots + counter) + actions + liked-by + caption more/less + details-toggle | GUEST/MEMBER | 10 | media tap = carousel เท่านั้น (ไม่เปิด detail) |
| Feed | post card — clip posts | คลิป autoplay ≥55% visible + progress bar + duration badge | GUEST/MEMBER | 4 | FEED-023 `[OPEN-CODE-ONLY]` |
| Feed | post card — details inline | "Tap for details" toggle → spec block inline (d1/d2/d3 render rows) + "View full detail" → detail | GUEST/MEMBER | 5 | collapse others เมื่อเปิดอันใหม่ |
| Feed | action `follow` | follow button ใน head — toggle ทั้ง seller ทุก card + เอฟเฟกต์ unfollow clears fav+mute | MEMBER `[GATE]` | 5 | |
| Feed | action `like` | like-btn toggle + liked state + own post shows count | MEMBER `[GATE]` | 4 | |
| Feed | action `save` (sv sheet) | save → bottom sheet เลือก All posts / collection / สร้าง collection ใหม่ | MEMBER `[GATE]` | 6 | |
| Feed | action `share` (sh sheet) | share sheet: friends row (toast "Sent to x") + Messenger/Direct/LINE/Facebook/Copy link | MEMBER `[GATE]` | 6 | diagram: member-only ✓ |
| Feed | action `comment` | เปิด comments sheet | GUEST(อ่านได้)/MEMBER | 3 | |
| Feed | action `Ask` pill | ask-pill (รูปแบบ auto/solid/outline/txt/ico/bubble) → `chatQuickAsk` → chatroom | MEMBER `[GATE]` | 6 | own post → toast "This is your own listing"; blocked → toast |
| Feed | action `liked-by` (lk sheet) | likes sheet: รายชื่อคนกดไลก์ + follow toggle ต่อคน | MEMBER | 4 | `[OPEN-CODE-ONLY]` |
| Feed | post menu — คนอื่น (pm) | sheet: Add/Remove favorites (เฉพาะ following/fav) · Not interested · Report | MEMBER | 5 | reportOnly=true ใน pv → เหลือแถว Report เดียว |
| Feed | post menu — ของตัวเอง (pm-own) | Archive/Unarchive · Turn off/on commenting · Edit / View sale record · Mark as sold · Pin/Unpin (≤3) · Delete | OWNER | 12 | PIN_MAX=3 → pin-limit dialog; pin → pill+toast |
| Feed | feedback card `ni-card` | หลัง Not interested → card แทนที่: Undo / Mute seller / Unfollow / หรือ "จัดการความต้องการเนื้อหา" (ไม่ follow) | MEMBER | 6 | `[OPEN-CODE-ONLY]` |
| Feed | feedback card `uncomf` | "This post made me uncomfortable" → ack card: Report / Undo | MEMBER | 3 | `[OPEN-CODE-ONLY]` |
| Feed | overlay `detail-open` | Post Detail: hero carousel+counter+dots+clip, follow, like/comment/share, Ask, save, `wl-btn`, `mf-btn`(bell), price/spec groups (ds variants), desc, chat-fab | GUEST/MEMBER | 14 | มี `POST_DETAIL_CFG` override รายโพสต์; detail เหนือ viewer เสมอ |
| Feed | overlay `pv-open` (immersive) | Post viewer: pv-head(back+search) + vertical track ของโพสต์ + pv-post card ต่อใบ + caption→`ps` sheet + details→`dt` sheet | GUEST/MEMBER | 8 | เปิดได้จาก tile/notification เท่านั้น |
| Feed | overlay `pv-open` feed mode (svf) | viewer แบบ list feed-card (จาก search tile ฯลฯ) + pv-srch กลับหน้า search typing | GUEST/MEMBER | 4 | `[OPEN-CODE-ONLY]` |
| Feed | overlay `pv-open` pfp mode | viewer "Posts" จาก profile grid — head มี Follow pill + เมนูเปลี่ยนเป็น pm-own/pm ตามเจ้าของ | MEMBER | 5 | `[OPEN-CODE-ONLY]` |
| Feed | sheet `ps` (caption) | pv caption full sheet (tap "more" ใน pv) | GUEST/MEMBER | 2 | |
| Feed | sheet `dt` (details) | pv details sheet (pv-dt toggle) | GUEST/MEMBER | 2 | |
| Feed | sheet `uf` unfollow confirm | confirm ก่อน unfollow (ต่อจาก pf-foll / following button) | MEMBER | 3 | `[OPEN-CODE-ONLY]` |
| Feed | sheet `mf` manage following | Following ⌄ → Remove/Add favorites · Mute · Unfollow | MEMBER | 4 | `[OPEN-CODE-ONLY]` |
| Feed | tag click `igd-tag` | caption hashtag → เปิด search results (foryou) | GUEST/MEMBER | 2 | `[OPEN-CODE-ONLY]` |
| Feed | state `archived`/`ni`/`muted`/`blocked`/`favorite`/`pinned`/`noComments`/`hideCounts`/`modelFollowing` | post flags ที่กระทบ render/feed | MEMBER/OWNER | 10 | รวมใน TC ของ row ที่เกี่ยว |

### 2.3 Search & Filter

| Module | Route/Overlay | Feature | Actor ที่เกี่ยว | จำนวน TC ที่ควรมี | หมายเหตุ |
|---|---|---|---|---|---|
| Search | `search` — landing | Explore tiles grid + popular chips + ปุ่ม filter + bookmark shortcut (`sr-saved`→saved) | GUEST/MEMBER | 5 | tile → post viewer (feed mode) |
| Search | `search` — typing | suggest rows (kw+seller) เมื่อมี q / recents 4 แถวเมื่อว่าง | GUEST/MEMBER | 5 | |
| Search | `recents` | Recent searches page — รายการ 8 รายการ, ลบรายแถว, Clear all, See all | GUEST/MEMBER | 5 | `[OPEN-CODE-ONLY]` |
| Search | `search` — results | tabs For you / Profiles / Tags + active filter chips (ลบทีละอัน) + grid results + seller cards + empty "No data found" + err→retry | GUEST/MEMBER | 10 | q `#tag` → tag mode; err state `S.err` |
| Search | `sfilter` | Filter page: Brand/Model/Price(min-max)/Year/Reference/Condition/Case/Movement/Dial/Strap/Delivery + counts + Clear all/Apply | GUEST/MEMBER | 12 | brand→model dependency (model ถูกกรองตาม brand) |
| Search | `sfilter` validation | `min>max` → "Minimum price must not exceed maximum price"; `max>2,000,000` → "Maximum price must not exceed 2,000,000" | GUEST/MEMBER | 4 | back จาก filter = discard draft |
| Search | `sr-wa` bell | results head bell → สร้าง watch alert จาก query+filters | MEMBER `[GATE]` | 4 | on-state เมื่อมี alert แล้ว |
| Search | state `S.sort` | sort field new/plo/phi/pop มีใน state แต่ **ไม่มี UI** | — | 1 | `[OPEN-NO-CODE]` (ถ้าจะเอาจริง) |

### 2.4 Create / Edit Composer

| Module | Route/Overlay | Feature | Actor ที่เกี่ยว | จำนวน TC ที่ควรมี | หมายเหตุ |
|---|---|---|---|---|---|
| Create | `create` — picker | IG picker: Recents roll (photos+clips), Select หลายรายการ + เลขลำดับ, camera cell `[DEAD]`, hero preview, Next (disabled เมื่อว่าง) | MEMBER `[GATE]` | 8 | max 10 media |
| Create | `create` — step2 caption | thumb strip + caption (contenteditable) + hashtag chips + rows (loc/price/spec/cond/cost?/more) + Share (disabled เมื่อว่าง) | MEMBER | 8 | asset mode แสดง cost+visibility |
| Create | pane `loc` | เพิ่มตำแหน่ง + ค้นหาสถานที่ + ระยะ km + ลบตำแหน่ง | MEMBER | 5 | |
| Create | pane `price` | ระบุราคา (auto comma) — เว้นว่าง = showcase | MEMBER | 4 | |
| Create | pane `spec` | Watch details 20 ฟิลด์ + Item details + Description | MEMBER | 6 | fields → specGroups พร้อม N/A |
| Create | pane `cond` | Condition (5) + Box & papers (4) | MEMBER | 3 | |
| Create | pane `cost` | Cost details (ส่วนตัว): purchase price + bought date (≤วันนี้) | OWNER | 4 | `[OPEN-CODE-ONLY]` (asset mode เท่านั้น) |
| Create | pane `more` | Turn off commenting toggle + audience Everyone/Followers only | MEMBER | 4 | `[OPEN-CODE-ONLY]` |
| Create | visibility `stt/vis` | asset mode: Show / Hide / Post to feed · post edit: ขาย/โชว์/ซ่อน + "บันทึกลงสินทรัพย์ของฉัน" toggle | OWNER | 6 | edit post = `openPostEdit` prefilled + restore surface |
| Create | publish `cf-share` | → `insertNewPost` (type sale/showcase ตาม price, pfkind=post) + `_waHits` toast ถ้า match alert | MEMBER/OWNER | 5 | `[OPEN-CODE-ONLY]` wa-hit toast |
| Create | edit `V.editPid` | Edit info → เพิ่ม/ลบรูป (`ig-add`, ≤10) + ปุ่ม Done/Cancel + restore viewer/detail ใต้ | OWNER | 6 | `[OPEN-CODE-ONLY]` (diagram ไม่ระบุแยก) |
| Create | clip preview | playable clip: play/pause + countdown + progress + viewer zoom | MEMBER | 4 | `[OPEN-CODE-ONLY]` |

### 2.5 Saved / Wishlist / Library

| Module | Route/Overlay | Feature | Actor ที่เกี่ยว | จำนวน TC ที่ควรมี | หมายเหตุ |
|---|---|---|---|---|---|
| Saved | `saved` | hub: posts tab / collections tab / "See all" / grid tiles → viewer + search icon + Manage | MEMBER `[GATE]` | 6 | empty state 2 แบบ (no saved / no collections) |
| Saved | `saved` — search mode | `mode=search` filter ในชื่อ caption | MEMBER | 3 | back exits search ก่อน pop |
| Saved | `saved` — manage mode | select multi + select all + unsave / move to collection | MEMBER | 6 | |
| Saved | `savedcol` | คอลเลกชันหน้า: menu mode (Rename?/Delete collection dlg / Change cover / Add posts) | MEMBER | 8 | `[OPEN-CODE-ONLY]` modes cover/edit/add/allmenu |
| Saved | `savedcol` — edit cover / add posts | cover picker + add-posts grid + addSel | MEMBER | 4 | |
| Saved | dialog `delcol` | Delete collection confirm (โพสต์ยังอยู่) | MEMBER | 2 | `[OPEN-CODE-ONLY]` |
| Saved | `nc` sheet | New collection — ชื่อ + สร้าง (มีทั้งจาก sv sheet และจาก manage) | MEMBER | 3 | `[OPEN-CODE-ONLY]` |
| Saved | `archive` | คลังเก็บถาวร — grid + "เฉพาะคุณที่เห็น" + empty | OWNER | 3 | |
| Saved | `wishlist` / `wishcol` | Wish List hub — parallel กับ saved (wl posts, wl collections, manage/search/edit) | MEMBER `[GATE]` | 6 | `[OPEN-CODE-ONLY]` (diagram เขียน Saved+Wishlist รวม) |
| Saved | sheet `wl` wishlist picker | wl-btn บน detail → sheet เลือก wishlist collection + สร้างใหม่ | MEMBER `[GATE]` | 4 | `[OPEN-CODE-ONLY]` |
| Saved | settings `interested` | รายการที่สนใจ (liked posts) + Remove | MEMBER | 3 | `[OPEN-CODE-ONLY]` |
| Saved | settings `ni` | รายการที่ไม่สนใจ + Restore | MEMBER | 3 | `[OPEN-CODE-ONLY]` |

### 2.6 Watch Alerts & Notifications

| Module | Route/Overlay | Feature | Actor ที่เกี่ยว | จำนวน TC ที่ควรมี | หมายเหตุ |
|---|---|---|---|---|---|
| Watch | sheet `wa` (create) | create/edit: name (autofill+แก้ได้) + match modes all/any/model (disabled เมื่อไม่มี criteria) + create/save + delete + match counts | MEMBER `[GATE]` | 10 | entry: detail bell `mf-btn` / search bell `sr-wa` / settings row edit |
| Watch | `walerts` | list: row มีชื่อ+criteria+mode+match count + pause/resume toggle + Edit | MEMBER | 6 | empty state + note "sitemap alerts→walerts ในโค้ดอยู่ใต้ settings เท่านั้น" `[OPEN-NO-CODE]` (path ไม่ตรง) |
| Watch | model follow `mf-btn` | bell บน post/detail — สร้าง/แก้ alert จาก spec ของโพสต์ + on-state | MEMBER `[GATE]` | 5 | `[OPEN-CODE-ONLY]` model-following flag |
| Watch | alert fire `_waHits` | post ใหม่ที่ match → toast แจ้ง | MEMBER | 2 | `[OPEN-CODE-ONLY]` |
| Alerts | `alerts` | activity list: groups Today/Yesterday/Last7/Earlier + unread badge + mark-all-read + dismiss(x บน follow) | MEMBER | 8 | guest/new → empty; back กลับ feed เสมอ |
| Alerts | row types | like/comment → PV own post; watch → PV listing; follow → profile; system → toast | MEMBER | 6 | `[OPEN-CODE-ONLY]` (system เป็น toast only) |
| Alerts | badge `nav-badge` | unread count บน bottom nav + `99+` cap + sync หลังอ่าน | MEMBER | 3 | |

### 2.7 Chat

| Module | Route/Overlay | Feature | Actor ที่เกี่ยว | จำนวน TC ที่ควรมี | หมายเหตุ |
|---|---|---|---|---|---|
| Chat | `chat` — user view | list chats: swipe left → Hide/Delete; swipe right → Pin/Mute; unread badge; search | MEMBER `[GATE]` | 10 | empty: guest/new → "No chats yet"; q → "No chats found" |
| Chat | `chat` — item view | group by item: "Your listings" + "Items you asked about" + filter popover all/mine/asked | MEMBER | 7 | `[OPEN-CODE-ONLY]` |
| Chat | `chatcfg` | Chat settings: notif toggle / message preview / followOnly / default view / Quick Ask message | MEMBER | 6 | `[OPEN-CODE-ONLY]` |
| Chat | `chatitem:id` | item chats page: item card + search people/messages + list threads | MEMBER | 4 | `[OPEN-CODE-ONLY]` |
| Chat | `chatroom:id` | room: day dividers, post reference card, media bubbles, Read/Sent, in-room search (highlight), draft prefill, send (disabled เมื่อว่าง) | MEMBER | 12 | blocked room → blocked bar + Unblock (ส่งไม่ได้) |
| Chat | `chatroom` attach sheet | `ch-attach-sheet`: Photos & videos grid → send media | MEMBER | 4 | `[OPEN-CODE-ONLY]` |
| Chat | `ch-media-viewer` | fullscreen media viewer | MEMBER | 2 | `[OPEN-CODE-ONLY]` |
| Chat | `chmenu:id` | room menu: Mute · Profile · Block/Unblock · Report · Photos & videos strip · Listings row · E2E note | MEMBER | 8 | `[OPEN-CODE-ONLY]` |
| Chat | `chsettings:id` | room settings: Note notifications toggle · Chat wallpaper `[DEAD]` · Export chat (copy) · Encryption keys (ข้อมูล) · Delete data · Report | MEMBER | 7 | `[OPEN-CODE-ONLY]` |
| Chat | `chmedia:id` | media gallery + Select → numbered pick → Delete / Download | MEMBER | 5 | `[OPEN-CODE-ONLY]` |
| Chat | dialog `ch-modal` hide/del | confirm Hide chat / Delete chat | MEMBER | 3 | `[OPEN-CODE-ONLY]` |
| Chat | sheet `blk` block confirm | Block sheet (avatar + 3 impact rows + Block [+ Block and report]) | MEMBER | 4 | fromChat → เหลือปุ่มเดียว |
| Chat | sheet `chatReport` | "Are you sure you want to report X?" → Report and delete / Report / Cancel → report:user | MEMBER | 4 | `[OPEN-CODE-ONLY]` |
| Chat | `chatQuickAsk` | Ask จาก post → หา/สร้าง draft thread + prefill quick msg → openSub chatroom | MEMBER `[GATE]` | 5 | |
| Chat | state `blocked` | pfIsBlocked/t.blocked → blocked bar + badge "Blocked" ใน list + send disabled | MEMBER | 4 | `[OPEN-CODE-ONLY]` |

### 2.8 Board (Editorial)

| Module | Route/Overlay | Feature | Actor ที่เกี่ยว | จำนวน TC ที่ควรมี | หมายเหตุ |
|---|---|---|---|---|---|
| Board | `board` home | hero carousel (dots+drag) + Latest Articles + "View all" + bd-head (burger=Categories sheet, search) | GUEST/MEMBER | 6 | |
| Board | `boardall` | all articles + category pills (drag+center) + breadcrumb | GUEST/MEMBER | 5 | |
| Board | `boardsearch` | search bar + popular tags chips + results count + empty state | GUEST/MEMBER | 5 | |
| Board | `boardart:id` | article detail: cover, author/meta, likes count, tags, like pill, share pill, back | GUEST/MEMBER | 5 | ไม่พบ → "Article not found" |
| Board | sheet `bdmenu` categories | Categories sheet → เลือก → boardall + focus pill | GUEST/MEMBER | 3 | `[OPEN-CODE-ONLY]` |
| Board | sheet `bdmore` (article more) | Share / Copy link / Save to favorites / Report article | — | 0 | `[DEAD]` — handler เขียนไว้ (≈L18517) แต่ไม่มี `data-bdmore` ถูก render บนหน้าไหนเลย → dead wiring `[OPEN-CODE-ONLY]` |
| Board | action like/save | article like toggle + count / save toggle (session flag) | MEMBER `[GATE]` | 4 | saved article ไม่มีหน้ารวม — `[OPEN-CODE-ONLY]` |

### 2.9 Profile & Portfolio

| Module | Route/Overlay | Feature | Actor ที่เกี่ยว | จำนวน TC ที่ควรมี | หมายเหตุ |
|---|---|---|---|---|---|
| Profile | `profile:uname[:tab]` | own profile: + (Add asset) · username · menu → settings · avatar→pf-avov · stats → pfollow · bio/link · Edit/Share/Portfolio buttons | OWNER | 8 | own tabs: All/Sale/Show/Hide/Sold (PRD 06) |
| Profile | `profile:uname` public | public profile: back · ⋯ menu · follow/unfollow pill (mf sheet) · Chat · fby row · avatar→pf-avov | MEMBER/GUEST | 8 | public tabs: All/Sale/Show เท่านั้น; blocked → Unblock + stats "-" |
| Profile | tabs `pf-tab` | tab switch: swap + keep scroll pos + pin order | MEMBER | 5 | `[OPEN-CODE-ONLY]` scroll-keep |
| Profile | grid tile → `pv-open` pfp | Posts viewer (profile-scoped) + pinTab-aware menu | MEMBER | 4 | |
| Profile | overlay `pf-avov` | avatar overlay: Follow/Share/Copy link/QR actions | MEMBER `[GATE]` | 4 | `[OPEN-CODE-ONLY]` |
| Profile | overlay `pf-qr` | QR card + color themes + Scan camera + Share/Copy/Download | MEMBER `[GATE]` | 6 | `[OPEN-CODE-ONLY]` (diagram พูด QR แต่ไม่ละเอียด) |
| Profile | sheet `pf-more` (viewer ⋯) | Report · Block/Unblock · About this account · Copy URL · Share | MEMBER/GUEST | 6 | |
| Profile | `pedit` | Edit profile: picture `[DEAD]` · username (3–20 a-z0-9_. + taken) · bio ≤150 · link URL/@handle | MEMBER | 7 | `[OPEN-CODE-ONLY]` (validation detail) |
| Profile | `pfollow:uname:tab` | followers/following list + search + Remove (own) + Follow pill | MEMBER | 7 | guest own → ว่าง (GUEST-001) |
| Profile | `about:uname` | About this account — joined/country/verified + why-note | GUEST/MEMBER | 3 | `[OPEN-CODE-ONLY]` |
| Profile | `pf-rhint` restrict hint | หลัง unblock → banner restrict 6s | MEMBER | 2 | `[OPEN-CODE-ONLY]` |
| Profile | `pf-sleep` / `pf-note` | sleep mode / note placeholder | — | 1 | `[DEAD]` `[OPEN-CODE-ONLY]` |
| Profile | `pfp-follow` pill | Follow pill ใน Posts viewer head (unfollowed เท่านั้น) | MEMBER `[GATE]` | 3 | `[OPEN-CODE-ONLY]` |
| Portfolio | `portfolio` | dashboard: Total invested (private) + Market value + G/L + asset rows + link soldhist + pfo-simbar | OWNER | 7 | guest → "No data found"; `?dev=1` → preview states (nomkt/empty/failed/denied) `[DEAD]` |
| Portfolio | `pfasset:id` | asset detail: hero + counter+dots + status chip + value card (cur/src/est/last-upd/src/purchase/bought/GL/hold) + Listing card (asking/exp profit/mkt cmp) + Mark as sold | OWNER | 8 | `[OPEN-CODE-ONLY]` |
| Portfolio | `soldhist` | Sold history list + empty state | OWNER | 3 | |
| Portfolio | `sold:id` | sale record detail: sale price + realized G/L + holding period | OWNER | 4 | `[OPEN-CODE-ONLY]` |
| Portfolio | `sell:id` | Mark as sold form: sale price* + sale date* (≤today) + expected gain preview + validation + save → move to sold + toast | OWNER | 6 | asset ไม่ผูก → `assetFromPost` materialize |

### 2.10 Trust & Safety / Report

| Module | Route/Overlay | Feature | Actor ที่เกี่ยว | จำนวน TC ที่ควรมี | หมายเหตุ |
|---|---|---|---|---|---|
| T&S | `report` | reason list (post) — anonymous note | MEMBER `[GATE]` | 4 | entry: pm menu, uncomfortable card |
| T&S | `report:user` | reason list (account) — fromChat ไม่มี back | MEMBER | 4 | |
| T&S | `report:comment` | reason list (comment) | MEMBER | 3 | `[OPEN-CODE-ONLY]` |
| T&S | `report:pick:u` | picker "What do you want to report?" → post / account | MEMBER | 3 | `[OPEN-CODE-ONLY]` |
| T&S | `report:posts:u` | select-a-post grid + Next (disabled จนเลือก) | MEMBER | 4 | `[OPEN-CODE-ONLY]` |
| T&S | `report:done:u` | Thanks page + "Other steps": Block/Unblock · Unfollow · Mute/Unmute (completed = ✓) + Done→close stack | MEMBER | 7 | `[OPEN-CODE-ONLY]` |
| T&S | comment popover `c-popover` | own comment → Delete; คนอื่น → Block + Report | MEMBER | 5 | guest long-press → gate |
| T&S | dialog `delComment` | delete comment confirm (root+replies / single) | MEMBER | 3 | `[OPEN-CODE-ONLY]` |
| T&S | sheet `blk` + dialog `unblock` | Block/Unblock — โพสต์หาย feed, profile คงอยู่ + Unblock btn, comments ถูกซ่อน | MEMBER | 6 | `[OPEN-CODE-ONLY]` |
| T&S | dialog `mute` | Mute seller confirm → posts หาย feed | MEMBER | 3 | `[OPEN-CODE-ONLY]` |
| T&S | `blocked` / `muted` settings | lists + Unmute/Unblock | MEMBER | 4 | |
| T&S | `ADMIN` moderation handoff | diagram: BO handoff | ADMIN | 0 | `[OPEN-NO-CODE]` — ไม่มีหน้าจอ FO |

### 2.11 Settings & Content Preferences

| Module | Route/Overlay | Feature | Actor ที่เกี่ยว | จำนวน TC ที่ควรมี | หมายเหตุ |
|---|---|---|---|---|---|
| Settings | `settings` | hub: About your account · library (saved/wishlist/archive/walerts มี count) · what you see (favorites/muted/blocked/prefs) · app (lang/theme) · notif settings · help/privacy/terms/about · Log out | MEMBER | 8 | |
| Settings | `lang` | language picker en/th + MutationObserver retranslate | GUEST/MEMBER | 4 | |
| Settings | `theme` | Light/Dark picker | GUEST/MEMBER | 3 | |
| Settings | `notif_settings` | toggles: likes/comments/follows/watch alerts | MEMBER | 4 | `[OPEN-CODE-ONLY]` |
| Settings | `favorites` | manage favorites: list+remove+remove all+suggested add+search | MEMBER | 6 | `[OPEN-CODE-ONLY]` |
| Settings | `muted` | muted accounts list + unmute | MEMBER | 3 | `[OPEN-CODE-ONLY]` |
| Settings | `blocked` | blocked list + unblock (dialog) | MEMBER | 3 | `[OPEN-CODE-ONLY]` |
| Settings | `prefs` | content preferences hub: sensitive/interested/ni + Snooze toggle (30d) + Reset suggested content | MEMBER | 5 | `[OPEN-CODE-ONLY]` |
| Settings | `sensitive` | sensitive content level Less/Standard | MEMBER | 3 | `[OPEN-CODE-ONLY]` |
| Settings | `interested` / `ni` | liked list + remove / not-interested list + restore | MEMBER | 5 | `[OPEN-CODE-ONLY]` |
| Settings | dialog `reset` | Reset suggested content confirm | MEMBER | 2 | `[OPEN-CODE-ONLY]` |
| Settings | `help` | support channels LINE/tel/email + help topics | GUEST/MEMBER | 4 | external links |
| Settings | `privacy` / `terms` | legal pages (static) | GUEST/MEMBER | 3 | |
| Settings | `about_app` | About TukDaeng — version + legal links | GUEST/MEMBER | 2 | `[OPEN-CODE-ONLY]` |

### 2.12 Global / Cross-cutting

| Module | Route/Overlay | Feature | Actor ที่เกี่ยว | จำนวน TC ที่ควรมี | หมายเหตุ |
|---|---|---|---|---|---|
| Global | bottom nav 5 แท็บ | feed/chat/board/alerts/profile + badge บน chat+alerts | GUEST/MEMBER | 5 | guest กด profile/chat → gate |
| Global | app header | burger drawer + search + wordmark caret + create + | GUEST/MEMBER | 4 | |
| Global | `hb-open` drawer | 9 เมนู: Watch Brands/Price Index/Watch Shops/Accessories/Repair/Auction/Consignment/Authentication/Community | GUEST/MEMBER | 2 | ทุกอัน `[DEAD]` "Not in this prototype yet" — Phase-1 ตัดออกตาม diagram |
| Global | i18n EN/TH | `state.lang` + MutationObserver swap ทุก node + เลือกจาก onboarding/settings | GUEST/MEMBER | 6 | sweep ทุกหน้าตอน i18n task |
| Global | theme light/dark | `data-theme` + dev toggle + settings picker | GUEST/MEMBER | 4 | sweep ทุกหน้าตอน theme task |
| Global | scrToast / toast / pin pill+toast | toasts: copied, saved, sent, blocked, pinned, wa on/off, post updated, wa hits… | MEMBER | 4 | `[OPEN-CODE-ONLY]` |
| Global | dev sidebar + `?dev=1` + POST_DETAIL_CFG | review sidebar variants + portfolio sim + per-post detail override | — | 0 | `[OPEN-CODE-ONLY]` ไม่ต้องเทสต์ใน production scope |
| Global | scroll/anim mechanics | sub open/push/back, ghost slides, rp-over, pg-swap, pv scroll snap | — | 4 | `[OPEN-CODE-ONLY]` เช็ก regression เท่านั้น |

**รวมประมาณ TC ที่ควรมีทั้งระบบ: ~470** (ยังไม่รวม i18n/theme sweep ซึ่งคูณตาม matrix แยก)

## 3. Inventory แยกตามชนิด (ใช้อ้างใน test cases)

### 3.1 Route map จาก `subHTML` (ครบทุก branch)

`create` · `search` · `sfilter` · `recents` · `settings` · `about_account` · `change_pwd` · `del_account` · `lang` · `notif_settings` · `help` · `privacy` · `terms` · `about_app` · `favorites` · `muted` · `blocked` · `prefs` · `sensitive` · `theme` · `interested` · `ni` · `saved` · `savedcol` · `archive` · `wishlist` · `wishcol` · `walerts` · `alerts` · `board` · `boardall` · `boardsearch` · `boardart:<id>` · `chat` · `chatitem:<id>` · `chatroom:<id>` · `chmenu:<id>` · `chsettings:<id>` · `chmedia:<id>` · `chatcfg` · `report` · `report:user` · `report:post` · `report:comment` · `report:pick:<u>` · `report:posts:<u>` · `report:done:<u>` · `profile:<uname>[:tab]` · `pfollow:<uname>:<tab>` · `about:<uname>` · `pedit` · `portfolio` · `pfasset:<id>` · `soldhist` · `sold:<id>` · `sell:<id>` — **58 route patterns**

### 3.2 Overlays / sheets / dialogs / toasts (ครบ)

- **Bottom sheets** (`.comment-sheet` variants): `pm` post menu (own/others/reportOnly) · `mf` manage following · `uf` unfollow confirm · `lk` likes list · `sh` share · `sv` save · `wl` wishlist · `nc` new collection · `dt` details (pv) · `ps` caption (pv) · `nt` comments-in-pv variant · `wa` watch alert · `pm-rp` report menu (legacy) · `blk` block confirm · `chatReport` report-chat confirm · `bdmenu` categories · `bdmore` article more · `pf-more` profile more · `pfo` dev sim menu
- **Center dialogs** (`.dlg` / `.ch-modal`): mute · unblock · reset suggested · logout · delete post · delete comment · delete collection · pin limit (3) · delAccount password · delAccount success · forgot password · chat hide · chat delete
- **Fullscreen/overlay**: `.page-pv` post viewer (3 modes) · `.page-detail` post detail · `pf-avov` avatar overlay · `pf-qr` QR + camera · `hb` burger drawer · `ch-attach-sheet` · `ch-media-viewer` · `c-popover` comment context · `ob` onboarding root (steps + `ob-legal` inside) · `ob-msheet` member gate sheet
- **Toasts/feedback**: `scrToast` (screen) · `toast`/`flowToast` (dev) · `pin-pill` + `pin-toast` · `pf-rhint` restrict hint · `chToast` chat

### 3.3 States/statuses

- **Session**: `guest` / `member` / `new` (+ `OB.gate`, `OB.recon`)
- **Post `pfkind`**: `post` (feed-only) / `sale` / `show` / `hide` / `sold` — feed render เฉพาะ sale+post
- **Post flags**: `archived` · `ni` (not interested) · `muted` · `blocked` · `following` · `favorite` · `saved`(+`savedCol`) · `wishlisted`(+`wlCol`) · `pins[tab]` (≤3) · `noComments` · `hideCounts` · `modelFollowing` · `liked`
- **Asset status (PF_ASSETS)**: `sale` / `show` / `hide` (+`own` flag) — sold ไป `PF_SOLD` แยก; `market`/`purchase`/`bought`/`asking` nullable
- **Alert**: `type` like/comment/follow/watch/system · `unread` · `grp` Today/Yesterday/Last7/Earlier
- **Chat thread**: `unread` · `pinned`(+pinnedAt) · `muted` · `hidden` · `blocked` · `draft` (Quick Ask ยังไม่ส่ง)
- **Search**: `mode` landing/typing/results · `err` · `fDraft` vs applied `f` · `tab` foryou/profiles/tags · `sort` (no UI)
- **Saved/wishlist**: `tab` posts/collections · `manage`+`sel` · `mode` search/menu/cover/edit/add/allmenu/allposts · `col` · `addSel`
- **Composer**: `mode` post/asset · `step` 1/2 · `sel` multi · `editPid` · `asset` · `pfkind` · `vis` · `editSold` · `audience` · `noComments` · panes loc/price/spec/cond/cost/more
- **Chat list**: `view` user/item · `itemFilter` all/mine/asked · `filterMenuOpen` · `q`/`iq` · room `searching`+`roomQuery`
- **Portfolio sim (dev)**: nomkt/empty/failed/denied
- **Dev variants**: `variant` (a/b feed cards) · `dl/dh/pr/ask/ds/ft/nav/tg/tStyle/dStyle` — harness เท่านั้น ไม่ใช่ product spec

### 3.4 Validation / error / empty / loading ที่ render จริง

- **Validation**: price min>max · max>2,000,000 (sfilter) · username format+taken (onboarding profile + pedit) · bio ≤150 (pedit) · link format URL/domain/@ (pedit) · sell price+date required + date ≤today · del-account reason required · chg-pwd rules · wa name (autofill fallback) · wa dedupe (`waSig`)
- **Error**: `S.err` → "Something went wrong. Please try again." + Try again (search) · `pfo failed` → "Unable to load data." + Try again · chat room not found · item not found · article not found · asset not found
- **Empty**: saved / collections / wishlist / archive / recents / suggestions / results / sellers / tags / board search / board category / alerts (guest/new) / chats (guest/new) / item chats / media gallery / comments ("No comments yet") / portfolio (guest/new/empty) / pf tabs / pfollow (own guest) / favorites / muted / blocked / walerts / interested / ni
- **Loading**: ob splash (3.2s) · welcome loading (1.5s) · img lazy · composer clip countdown · OTP resend 30s · pin toast timing · pf-rhint 6s auto-dismiss

### 3.5 Menus & actions ที่ยังไม่ครอบคลุมในตาราง (รวมใน TC rows แล้ว)

- post card: avatar→profile · follow-btn · more· like/comment/share/save/ask/liked-by/caption-more/details-toggle/photo-tap/tag
- pv card: same as feed card + pv-back + pv-srch + pfp-follow + dt/ps sheet opens
- detail: back · more(pm) · follow · like/comment/share · ask/chat-fab · save · wl · mf · tags
- chat list rows: swipe left (Hide/Delete) · swipe right (Pin/Mute) · tap → room · filter popover · cfg gear · search
- room: back · profile · search · burger menu · attach + · send · media bubble → viewer
- settings rows: ตาม list ใน 2.11
- profile: + · uname · menu · stats · edit/share/pfo · follow/msg/more/qr

## 4. Gap Analysis เทียบ diagram

### 4.1 `[OPEN-NO-CODE]` — diagram ระบุ แต่โค้ดไม่มี (ต้องยกให้ทีมตัดสิน)

1. **Sitemap: `alerts → walerts`** — route walerts มีจริงแต่ entry อยู่ใต้ **Settings เท่านั้น** (ไม่มีลิงก์จากหน้า alerts); diagram เขียนเหมือนอยู่ใต้ alerts
2. **ADMIN / moderation handoff** — diagram ระบุ BO handoff; FO ไม่มีหน้าจอ ADMIN ใด ๆ (by design, ไม่เทสต์ใน FO scope)
3. **Share member-only** — ในโค้ด share ถูก gate ด้วย obGate ครับ ✓ ไม่ใช่ gap (mark ไว้ว่าเช็กแล้ว)
4. **No Auction / Live / Authentication** — diagram บอกไม่มี; ใน drawer มีเมนู placeholder แต่ `[DEAD]` ทั้งหมด ✓ ไม่ใช่ gap
5. **Search sort UI** — `S.sort` มี field แต่ไม่มี control (observation, ไม่ใช่สิ่งที่ diagram สัญญา)

### 4.2 `[OPEN-CODE-ONLY]` — มีในโค้ด แต่ diagram ไม่ระบุชัด (ต้องเขียน TC เพิ่มเติมจาก code)

- `recents` page + See all/Clear all/remove รายแถว
- `chatitem`, `chmenu`, `chsettings`, `chmedia`, `chatcfg` (chat sub-pages ทั้งชุด — diagram บอกแค่ "chat → chatroom")
- swipe actions pin/mute/hide/delete ใน chat list + item-view filter popover
- attach sheet + media viewer + hide/delete confirm dialogs + chat report sheet + block sheet (chat variant)
- `pf-avov` + `pf-qr` (color themes + scan + download)
- `uf` unfollow confirm sheet · `mf` manage following sheet · `lk` likes sheet · `sv/wl/nc` collection sheets · `dt/ps` pv sheets · `nt` pv comments
- `ni-card` feedback card + `uncomf` uncomfortable card
- own-post menu (archive/pin/edit/mark-sold/delete) + pin limit + pin toasts
- `pedit` validation rules + change_pwd + forgot-pwd dialog + del_account 2-step + del-account dialogs
- `notif_settings`, `favorites`, `muted`, `blocked`, `prefs` (snooze+reset+sensitive+interested+ni), `theme`, `about_app`, `about_account`
- `report:pick` / `report:posts` / `report:done` (thanks + other-steps) — diagram บอก "report flow" แต่ไม่ลงลึก
- comment popover + delete-comment dialog + guest long-press gate
- Watch alert: modes all/any/model · name edit · pause/resume · dedupe · match counts · `_waHits` toast · model follow flag
- Composer: clip support (play/pause/autoplay/progress) · panes loc/price/spec/cond/cost/more · audience followers-only · turn off commenting · asset mode visibility show/hide/feed · cost (private) · edit mode + drawer toggle + pfkind switch · `_waHits` toast
- Portfolio: market-vs-asking cmp chips · estimated range · unrealized/realized G/L · holding period · `?dev=1` sim states
- Composer → `insertNewPost` types (`sale`/`showcase`/`pfkind=post`) + chips + specGroups + N/A filling
- Feed mechanics: snooze suggested · seg-thumb · brand-menu (ft=none) · clip autoplay (FEED-023) · refreshPostViews surfaces (feed/svf/pv/pfp/tile/detail)
- i18n MutationObserver + dev sidebar + POST_DETAIL_CFG + themeToggle (dev-only)
- Chat: draft thread materialize on first send · blocked-bar behavior · E2E/wallpaper placeholders `[DEAD]`
- Alerts: system-type row (toast) · dismiss x · watch-alert row opens PV with "solo" title
- `sr-saved` bookmark shortcut in search landing head → saved

## 5. หมายเหตุต่อ task ถัดไป

- Task FO-TEST-01..N ต้อง **อ้าง Route/Overlay + Feature column** จากตาราง §2 — ไม่เดา behavior เพิ่ม; ถ้าพบ route ใหม่ในโค้ดให้เพิ่มแถวและ tag `[OPEN-CODE-ONLY]`
- ทุก `[GATE]` ต้องเทสต์ 2 กรณี: guest → member sheet / member → flow ปกติ
- ทุก OWNER row ต้องเทสต์กับโพสต์ที่ seller === `king.mr.fox` หรือ PF_ASSETS ของตัวเองเท่านั้น
- dev sidebar, `?dev=1`, `POST_DETAIL_CFG`, `.sort-open` CSS = prototype harness — เขียนเป็น "out of scope" rows แยกถ้าจำเป็น แต่ไม่เขียน TC production
- toasts/pills ทุกอันมี timing (~1.8–3s; pf-rhint 6s) — manual checklist ควรรอดู
