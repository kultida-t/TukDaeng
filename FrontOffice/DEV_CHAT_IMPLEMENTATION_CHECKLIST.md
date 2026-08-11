# TukDaeng Dev Chat Implementation Checklist

**Purpose:** Checklist สำหรับ Dev ที่รับผิดชอบเฉพาะ Chat  
**Baseline Version:** `FO-PRD-v1.1`
**Baseline branch:** `docs-frontoffice-spec-updates`  
**Main PRD:** [07_CHAT_MODULE.md](07_CHAT_MODULE.md)  
**Use with:** [DEV_BASELINE_HANDOFF_2026-06-22.md](DEV_BASELINE_HANDOFF_2026-06-22.md)
**Version Registry:** [DOCUMENT_VERSION.md](DOCUMENT_VERSION.md)

---

# 1. Files To Read

| Priority | File | Use For |
| --- | --- | --- |
| Required | [DEV_BASELINE_HANDOFF_2026-06-22.md](DEV_BASELINE_HANDOFF_2026-06-22.md) | Understand that this replaces old baseline docs |
| Required | [07_CHAT_MODULE.md](07_CHAT_MODULE.md) | Main Chat functional PRD |
| Required | [00_GLOBAL_RULES_MODULE.md](00_GLOBAL_RULES_MODULE.md) | Login, deleted asset, block, permission, visibility rules |
| Required | [00_NAVIGATION_AND_CROSS_MODULE_FLOW.md](00_NAVIGATION_AND_CROSS_MODULE_FLOW.md) | Routing, notification destination, deep link fallback |
| Required | [08_OFFER_MODULE.md](08_OFFER_MODULE.md) | Offer card, accepted/rejected/cancelled behavior |
| Required | [09_NOTIFICATION_MODULE.md](09_NOTIFICATION_MODULE.md) | Chat unread and offer notification destination |
| Required | [15_TRUST_SAFETY_MODULE.md](15_TRUST_SAFETY_MODULE.md) | Block user, report user, blocked chat read-only state |
| Reference | [QA_TEST_SCENARIO_CHECKLIST.md](QA_TEST_SCENARIO_CHECKLIST.md) | QA cases Dev should expect |

---

# 2. Chat Scope

- [ ] Chat List
- [ ] Chat Room
- [ ] Start Chat from Asset Detail
- [ ] Pre-Chat / first message state
- [ ] Text message
- [ ] Image message
- [ ] File message
- [ ] Asset Reference Card
- [ ] Offer Card
- [ ] Incoming Offers
- [ ] Search Chat
- [ ] Unread count / badge
- [ ] Delete Chat with confirmation
- [ ] Block User from Chat
- [ ] Report User from Chat
- [ ] Deleted Asset reference state
- [ ] Sold Asset reference state
- [ ] Global Login Required Dialog for Guest Chat action

Out of scope for V1:

- Voice message
- Read receipt
- Typing indicator
- Message reaction
- Pinned message
- Message edit
- Group chat
- Delete Chat restore UI

---

# 3. Room Creation And Reference Rules

- [ ] Tapping Chat opens Pre-Chat / Empty Room state first
- [ ] Chat Room is created only after user sends first message
- [ ] Same user + same asset must reuse existing room
- [ ] Same user + different asset must reuse existing room
- [ ] Same user + different asset updates latest Asset Reference to the latest asset
- [ ] Previous asset references remain in chat history through old messages/cards
- [ ] Chat Room always shows current Asset Reference Card
- [ ] Asset Reference Card supports Active, Sold and Deleted/Unavailable states

---

# 4. Message And Attachment Rules

- [ ] Text message is required and cannot be empty
- [ ] Chat supports Text, Image, File, Asset Card and Offer Card
- [ ] Image/file uploads validate allowed type and implementation max size
- [ ] Send message error shows retry/error copy
- [ ] Chat List sorts by latest message descending
- [ ] Search Chat is supported
- [ ] Empty Chat List uses global empty state: `ไม่พบข้อมูล` / `No data found`
- [ ] Incoming Offers empty state uses global empty state

---

# 5. Deleted / Sold Asset Behavior

- [ ] If asset is Deleted, Chat remains available
- [ ] Deleted asset reference displays `รายการนี้ไม่พร้อมใช้งานแล้ว` / `This item is no longer available.`
- [ ] Opening old asset reference for Deleted asset routes to Deleted Asset state
- [ ] If asset is Deleted, related Offer becomes `Cancelled`
- [ ] If asset is Sold, Chat remains usable
- [ ] Sold asset reference must not imply normal active sale availability
- [ ] If asset is Sold, other pending offers become `Rejected` automatically according to Offer Module
- [ ] If asset is auto hidden or temporarily hidden during review, pending Offer becomes `Paused`
- [ ] If review passes and asset returns to `Sale` / `Show`, `Paused` Offer returns to `Pending`
- [ ] If asset is permanently hidden by moderation, pending/paused Offer becomes `Invalidated`
- [ ] If owner changes asset from `Sale` / `Show` to `Hide`, pending Offer becomes `Cancelled`

---

# 6. Offer Integration

- [ ] Make Offer success opens Chat Room
- [ ] Sent Offer appears as Offer Card in Chat Room
- [ ] Chat Room supports Offer Card states from Offer Module
- [ ] Incoming Offers shows only pending offers waiting for action
- [ ] Accepted offer disappears from Incoming Offers
- [ ] Rejected offer disappears from Incoming Offers
- [ ] Accepted/rejected offer remains visible in Chat Room / All Chat history
- [ ] Read but not actioned pending offer remains in Incoming Offers
- [ ] Asset Deleted changes related offer to `Cancelled`
- [ ] Asset Sold changes other pending offers to `Rejected` automatically
- [ ] Offer Card state `Paused` shows `Offer Paused` and no `Accept` / `Decline`
- [ ] Offer Card state `Invalidated` shows `Offer Unavailable` and no `Accept` / `Decline`
- [ ] Incoming Offers excludes `Paused`, `Accepted`, `Rejected`, `Cancelled`, and `Invalidated`
- [ ] Offer Accepted notification opens Chat Room
- [ ] Offer Rejected notification opens Asset Detail
- [ ] Offer Cancelled notification opens Chat Room and focuses Offer Card when available
- [ ] Offer Paused notification opens Chat Room and focuses Offer Card when available
- [ ] Offer Invalidated notification opens Chat Room and focuses Offer Card when available

---

# 7. Notification And Unread Rules

- [ ] New Message is not a Front Office Notification Center type in V1
- [ ] New Message appears only as Chat menu/list unread badge/count
- [ ] Unread count updates when new message arrives
- [ ] Unread count clears/updates when user opens Chat Room
- [ ] Notification Center supports Offer notifications only as defined in Notification Module
- [ ] Chat/New Message must not appear as notification type in FO Notification Center

---

# 8. Permission And Guest Rules

- [ ] Guest cannot open Chat List
- [ ] Guest cannot open Chat Room
- [ ] Guest cannot send message
- [ ] Guest cannot make offer
- [ ] Guest tapping Chat opens Global Login Required Dialog
- [ ] Member can open Chat, send message, view list, search, delete chat, block user and report user
- [ ] Non-authenticated deep links to Chat must route through login/auth handling

---

# 9. Block User Rules

- [ ] Chat has Block User entry
- [ ] Block User requires confirmation
- [ ] After block, both users cannot send new messages to each other
- [ ] Existing chat history remains readable
- [ ] Blocked chat becomes read-only
- [ ] After block, creating new Chat between the pair is blocked
- [ ] After block, creating new Offer between the pair is blocked
- [ ] Assets of blocked user are filtered from Feed, Search and Watch Alert Result
- [ ] Existing notification/deep link to blocked content must not reveal inaccessible content
- [ ] Block state uses copy: `ไม่สามารถส่งข้อความได้` / `Unable to send message.`

---

# 10. Report User Rules

- [ ] Chat has Report User entry
- [ ] Report User routes to Trust & Safety report flow
- [ ] Report reason is required
- [ ] Submit is disabled until reason is selected
- [ ] Dismiss without submit must not create report
- [ ] Report success does not remove content immediately
- [ ] Report Submitted does not create Front Office Notification Center item
- [ ] Admin moderation happens through Back Office handoff

---

# 11. Delete Chat Rules

- [ ] Chat Room overflow menu shows `View profile`, `Mute notifications` / `Unmute notifications`, `Delete chat`, `Report user`, `Block user`
- [ ] Header search icon is the only search entry; do not duplicate `Search in chat` in overflow menu
- [ ] Mute notifications auto-saves and shows `Notifications muted`
- [ ] Unmute notifications auto-saves and shows `Notifications unmuted`
- [ ] Delete Chat has confirmation
- [ ] Delete Chat confirmation uses title `Delete chat?` and actions `Cancel` / `Delete chat`
- [ ] Delete Chat copy says the chat is removed from the actor inbox and the other person may still see the conversation
- [ ] Delete Chat hides room from Chat List only for the actor
- [ ] Delete Chat does not delete server message/archive history
- [ ] Delete Chat does not affect the other user
- [ ] Delete Chat does not remove offer/chat evidence
- [ ] Delete Chat has no restore UI in V1
- [ ] Confirmation copy must clearly say it hides the room only from this user's list
- [ ] Delete Chat success shows `Chat deleted`
- [ ] Delete Chat API fail shows `Unable to delete chat. Please try again.`

---

# 12. Routing / Deep Link Rules

- [ ] Chat entry from Asset Detail opens Pre-Chat or existing Chat Room
- [ ] Chat List opens Chat Room
- [ ] Offer Accepted notification opens Chat Room
- [ ] Offer Rejected notification opens Asset Detail
- [ ] Deleted asset reference opens Deleted Asset state
- [ ] Blocked / permission-denied destination shows unavailable or permission state
- [ ] Deep link validates auth, permission, asset status, deleted state and block state before render

---

# 13. Analytics Events

- [ ] Chat List Open
- [ ] Chat Room Open
- [ ] Create Chat Room
- [ ] Send Message
- [ ] Receive Message
- [ ] Search Chat
- [ ] Delete Chat
- [ ] Block User From Chat
- [ ] Report User From Chat
- [ ] Open Asset Reference
- [ ] Offer Card Viewed
- [ ] Offer Accepted From Chat
- [ ] Offer Rejected From Chat

---

# 14. QA Handoff

Dev should be ready to verify these QA areas:

- [ ] Guest Chat action opens Login Required Dialog
- [ ] Room created only after first message
- [ ] Same user + same asset reuses room
- [ ] Same user + different asset reuses room and updates reference asset
- [ ] Deleted asset keeps chat but shows unavailable reference
- [ ] Sold asset keeps chat usable
- [ ] Offer card appears and follows offer status
- [ ] Incoming Offers only shows pending offers
- [ ] Chat unread badge/count works outside Notification Center
- [ ] Block makes existing chat read-only
- [ ] Report user does not remove content immediately
- [ ] Delete Chat hides room only for actor
- [ ] No restore UI exists for Delete Chat

---

# 15. Dev Output Expected

When reviewing current implementation, mark each item as:

- `Done`
- `Needs Fix`
- `Not Applicable`
- `Needs Product Clarification`

Return gap list grouped by:

- Chat room / message
- Asset reference
- Offer integration
- Notification / unread
- Block / report
- Delete chat
- Routing / deep link

Please cite baseline version `FO-PRD-v1.1` in the returned gap list.
