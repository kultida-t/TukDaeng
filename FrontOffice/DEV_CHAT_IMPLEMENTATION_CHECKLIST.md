# TukDaeng Dev Chat Implementation Checklist

**Purpose:** Checklist สำหรับ Dev ที่รับผิดชอบเฉพาะ Chat  
**Baseline Version:** `FO-PRD-v1.10`  
**Baseline branch:** `docs-frontoffice-spec-updates`  
**Main PRD:** [07_CHAT_MODULE.md](07_CHAT_MODULE.md)  
**Use with:** [DEV_BASELINE_HANDOFF_2026-06-22.md](DEV_BASELINE_HANDOFF_2026-06-22.md)
**Version Registry:** [DOCUMENT_VERSION.md](DOCUMENT_VERSION.md)

> **Sync note (FO-PRD-v1.9, 2026-10-22):** checklist นี้ sync ตาม `Prototypes/fo-flow/index.html` (source of truth) + 07_CHAT_MODULE — thread ผูก user+item, draft room + Quick Ask, media message เท่านั้น, swipe actions, Member Sheet gate, badge-only notification

---

# 1. Files To Read

| Priority | File | Use For |
| --- | --- | --- |
| Required | [DEV_BASELINE_HANDOFF_2026-06-22.md](DEV_BASELINE_HANDOFF_2026-06-22.md) | Understand that this replaces old baseline docs |
| Required | [07_CHAT_MODULE.md](07_CHAT_MODULE.md) | Main Chat functional PRD |
| Required | [00_GLOBAL_RULES_MODULE.md](00_GLOBAL_RULES_MODULE.md) | Session model, Member Sheet, deleted asset, block, permission, visibility rules |
| Required | [00_NAVIGATION_AND_CROSS_MODULE_FLOW.md](00_NAVIGATION_AND_CROSS_MODULE_FLOW.md) | Routing, notification destination, deep link fallback |
| Required | [09_NOTIFICATION_MODULE.md](09_NOTIFICATION_MODULE.md) | Alerts feed boundary — chat badge-only rule |
| Required | [15_TRUST_SAFETY_MODULE.md](15_TRUST_SAFETY_MODULE.md) | Block user, report user, blocked chat read-only state |
| Reference | [QA_TEST_SCENARIO_CHECKLIST.md](QA_TEST_SCENARIO_CHECKLIST.md) | QA cases Dev should expect |

---

# 2. Chat Scope

- [ ] Chat List (Chats view / Items view)
- [ ] Chat Room
- [ ] Quick Ask entry จาก sale post (`Ask Seller` pill / `askBtn`) → draft room
- [ ] Draft room `C.draft` + prefill `cfg.quick`
- [ ] Text message
- [ ] Media message (photos — attach sheet `Photos & videos`)
- [ ] Post reference card (snapshot) ในห้อง
- [ ] Search Chat (list-level + in-room search)
- [ ] Unread count / badge (Chat menu only)
- [ ] Swipe actions: pin / mute / hide / delete
- [ ] Room menu `chmenu` (Mute/Unmute, Profile, Block/Unblock, Report)
- [ ] Media gallery `chmedia` (select mode, Trash, Download)
- [ ] Block User / Report User จาก Chat (shared `blkSheet` + report stack)
- [ ] Deleted post reference state
- [ ] Sold post reference state
- [ ] Member Sheet for Guest Chat action
- [ ] Chat Config `chatcfg` (notif / preview / followOnly / default view / quick-ask text)

Out of scope for V1:

- File message / Asset Card message
- Voice message
- Read receipt (real) — `Sent`/`Read` เป็น display state
- Typing indicator
- Message reaction
- Pinned message
- Message edit
- Group chat
- Delete Chat restore UI
- E2E encryption / Letter Sealing (S-18 — footer copy เป็น dead copy)
- Chat wallpaper / Export chat / Room settings page (`chsettings` dead route)
- Chat entry จาก profile / follower row (`pf-msg` dead — canonical 06)

---

# 3. Room Creation And Thread Rules

- [ ] Thread key = `{user, item.id}` — seller เดิมคนละ listing = ห้องใหม่เสมอ ไม่มี room merge (S-07)
- [ ] Tapping `Ask Seller` บน sale post เปิด draft room หรือ existing room ของ user+item นั้น
- [ ] Draft room `C.draft` เก็บนอก threads — เข้า list จริงเมื่อ `chSend` แรกเท่านั้น (unshift + clear draft)
- [ ] Draft room prefill composer ด้วย `cfg.quick` (Quick Ask text, default `สนใจสินค้าชิ้นนี้ครับ ยังอยู่ไหมครับ?`)
- [ ] Ask บน post ของตัวเองแสดง `This is your own listing` — ไม่สร้างห้อง
- [ ] Ask ห้องที่ hidden → un-hide แล้วเปิด
- [ ] Post reference card แสดง snapshot ของ listing ในห้อง และ route ไป Post Detail เมื่อกด
- [ ] Post reference card supports Active, Sold และ Deleted/Unavailable states
- [ ] ไม่มี user→user chat เปล่า ๆ — ทุกห้องผูก listing

---

# 4. Message And Media Rules

- [ ] Text message is required and cannot be empty (send disabled จนมี text)
- [ ] Chat รองรับ Text + Media message (photos) เท่านั้น — ไม่มี File message / Asset Card message
- [ ] Attach sheet `Photos & videos` เลือกรูปส่งเป็น media message
- [ ] Media bubble แตะเปิด `.ch-media-viewer` overlay
- [ ] Send message error shows retry/error copy (contract)
- [ ] Chat List sorts by latest message descending; send แล้วห้องขึ้นบนสุด
- [ ] Composer draft persist ต่อห้อง (`t.draft`) ระหว่าง navigate
- [ ] Search in room live-highlight match (`<mark>`) + dim non-match
- [ ] Empty Chat List uses global empty state: `ไม่พบข้อมูล` / `No data found`
- [ ] `Sent`/`Read` แสดงบนข้อความล่าสุดของฝั่งเราเท่านั้น

---

# 5. Deleted / Sold Post Behavior

- [ ] If post is Deleted, Chat remains available
- [ ] Deleted post reference displays `รายการนี้ไม่พร้อมใช้งานแล้ว` / `This item is no longer available.`
- [ ] Opening deleted post reference routes to unavailable state
- [ ] If post is Sold, Chat remains usable
- [ ] Sold post reference must not imply normal active sale availability

---

# 6. Notification And Unread Rules

- [ ] New Message is not an Alerts feed type in V1 (badge-only — 07/09 canonical)
- [ ] New Message appears only as Chat menu/list unread badge/count (cap `99+`)
- [ ] Unread count updates when new message arrives
- [ ] Unread count clears/updates when user opens Chat Room
- [ ] Chat/New Message must not appear as notification type in FO Alerts feed

---

# 7. Permission And Guest Rules

- [ ] Chat เป็น member-only — Guest cannot open Chat List / Chat Room / send message
- [ ] Guest tapping Chat opens Member Sheet (`Join TukDaeng`) — เดิมเรียก Global Login Required Dialog
- [ ] Member can open Chat, send message, view list, search, pin/mute/hide/delete chat, block user and report user
- [ ] Non-authenticated deep links to Chat must route through login/auth handling (contract)

---

# 8. Block User Rules

- [ ] Chat has Block User entry (room menu `chmenu` + shared `blkSheet`)
- [ ] Block User requires confirmation (shared `blkSheet` canonical 06)
- [ ] After block, both users cannot send new messages to each other
- [ ] Existing chat history remains readable (read-only)
- [ ] Blocked room shows `You blocked this account` + `You can't message or call them unless you unblock them.` + `Unblock`
- [ ] After block, creating new Chat between the pair is blocked
- [ ] Posts of blocked user are filtered from Feed, Search and Watch Alert Result
- [ ] Existing notification/deep link to blocked content must not reveal inaccessible content
- [ ] Unblock ผ่าน `unblockDlg` — restore messaging + visibility ตาม normal permission

---

# 9. Report User Rules

- [ ] Chat has Report entry (`chmenu` → `Report` / `Report and delete`)
- [ ] Report routes to Trust & Safety report stack (`report:user`)
- [ ] Report reason is required — Submit disabled until reason selected
- [ ] Dismiss without submit must not create report
- [ ] Report success does not remove content immediately
- [ ] Report Submitted does not create Alerts feed item
- [ ] `Report and delete` submits report then removes room for actor
- [ ] Admin moderation happens through Back Office handoff

---

# 10. Hide / Delete Chat Rules

- [ ] Swipe actions บน chat row: pin / mute / hide / delete
- [ ] Hide chat confirmation: `Hiding chats doesn't delete their messages.` + Cancel / Hide → `ซ่อนแชทแล้ว`
- [ ] Delete Chat confirmation: `Are you sure you want to delete this chat?` + Cancel / Delete → `ลบแชทเรียบร้อยแล้ว`
- [ ] Delete Chat hides room from Chat List only for the actor
- [ ] Delete Chat does not delete server message/archive history
- [ ] Delete Chat does not affect the other user
- [ ] Delete Chat does not remove chat evidence
- [ ] Delete Chat has no restore UI in V1
- [ ] Confirmation copy must clearly say it removes the room only from this user's list

---

# 11. Chat Center Views And Config

- [ ] `Chats` view = ห้องเรียงตามคู่สนทนา/latest message
- [ ] `Items` view = จัดกลุ่มตาม listing (`Your listings` / `Items you asked about`)
- [ ] `chatcfg` toggles: notifications / message preview / follow-only / default view (Chats|Items) / quick-ask text (≤80 chars)
- [ ] Mute notifications auto-saves (swipe mute / room menu Mute↔Unmute)
- [ ] `chmedia` gallery: Select mode → `{n} selected` + Trash / Download — ไม่มี Share

---

# 12. Routing / Deep Link Rules

- [ ] `Ask Seller` จาก sale post (feed card / post detail / post viewer) opens draft or existing room
- [ ] Chat List opens Chat Room; Items view groups by listing
- [ ] Post reference card opens Post Detail (missing → fallback toast)
- [ ] Deleted post reference opens unavailable state
- [ ] Blocked / permission-denied destination shows unavailable or permission state
- [ ] Deep link validates auth, permission, post status, deleted state and block state before render (contract)

---

# 13. Analytics Events

- [ ] Chat List Open
- [ ] Chat Room Open
- [ ] Create Chat Room (first send from draft)
- [ ] Send Message
- [ ] Receive Message
- [ ] Search Chat
- [ ] Pin / Mute / Hide / Delete Chat
- [ ] Block User From Chat
- [ ] Report User From Chat
- [ ] Open Post Reference

---

# 14. QA Handoff

Dev should be ready to verify these QA areas:

- [ ] Guest Chat action opens Member Sheet
- [ ] Draft room created on Ask; enters list only after first message
- [ ] Same user + same item reuses room; same user + different item creates new room
- [ ] Deleted post keeps chat but shows unavailable reference
- [ ] Sold post keeps chat usable
- [ ] Chat unread badge/count works outside Alerts feed
- [ ] Block makes existing chat read-only with Unblock bar
- [ ] Report user does not remove content immediately
- [ ] Hide/Delete Chat removes room only for actor
- [ ] No restore UI exists for Delete Chat
- [ ] Swipe actions (pin/mute/hide/delete) work per spec

---

# 15. Dev Output Expected

When reviewing current implementation, mark each item as:

- `Done`
- `Needs Fix`
- `Not Applicable`
- `Needs Product Clarification`

Return gap list grouped by:

- Chat room / message
- Post reference
- Notification / unread
- Block / report
- Hide / Delete chat
- Routing / deep link

Please cite baseline version `FO-PRD-v1.10` in the returned gap list.
