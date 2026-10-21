# FSP-020 — 07_CHAT Update Evidence (LINE-style + items tab + block/report)

Date: 2026-10-22
Task: `f84ffda9` — "FSP-020 อัปเดต 07_CHAT — LINE-style + items tab + block/report"
Scope: `FrontOffice/07_CHAT_MODULE.md` เท่านั้น (rewrite ทั้งไฟล์ ~630 บรรทัด) + 1 บรรทัดใน `05_ASSET_DETAIL_MODULE.md` (แก้ stale entry claim) — sync ตาม `Prototypes/fo-flow/index.html` (read-only) + baseline 00_GLOBAL (session §7, gate §11, lifecycle §12, block §13, private §14) / 00_NAV (routes §6.6, back §6.7, entry matrix §7, unavailable §10) / 06_PROFILE (blkSheet/unblockDlg/pf-msg dead/`th.blocked` sync canonical — FSP-019 lock) / 05_ASSET_DETAIL (`data-chgo="post"` entry semantics — FSP-018 lock) / 02_FEED (post model + `ask-pill` canonical) / 15_TRUST_SAFETY (report stack boundary — pending sync)
Context: FSP-019 session note (`6684c203` done) + `FSP-016-search-flow-post-viewer-evidence.md` + `FSP-017-asset-mgmt-add-statuses-purchase-evidence.md` + `FSP-018-asset-detail-evidence.md` + `FSP-019-profile-module-evidence.md` + `gap-FSP-003b-chat-notifications.md` + `FSP-005-consolidated-gap-signoff.md`

Prototype anchors verified (scan บน working copy ปัจจุบัน — line numbers ขยับจาก evidence ก่อน ๆ เพราะ prototype มี uncommitted diff ของ owner ระหว่าง session): routes `chat`/`chatitem:`/`chatroom:`/`chmenu:`/`chsettings:`(dead)/`chmedia:`/`chatcfg` ~17696–17702; state `CHAT`+`cfg` ~17791–17794; `chatInit` seed member/non-member ~17795–17834; `chatResetToDefault` ~17835–17842; `chGet`/`chTimeLbl`/`chUnread`/`chBadgeHTML`/`chBadgeSync` (cap 99+) ~17843–17858; `chPostRender`/`chEmptyHTML`/`chatNavHTML` ~17860–17867; `chThreadMatch`/`chRowHTML`/`chItemGroups`/`chItemRowHTML` (`isDirectRoom`)/`chListBody`/`chatListHTML` (tabs + `Filter items by` popover + gear + `ch-q`) ~18474–18619; `chItemBody`/`chatItemHTML` (floating pill itemcard + `ch-iq`) ~18620–18655; `chatRoomHTML` (header/`ch-post-card`/`ch-day`/avatar group/`Sent`/`Read`/`ch-blocked-bar`/composer/search mode) ~18656–18750; `openChatAttachSheet`/`openChatMediaViewer` ~18752–18814; `chatRoomMenuHTML` (4 ปุ่มวงกลม + `Photos & videos`/`Listings & Items` + E2E footer) ~18816–18896; `chatMediaGalleryHTML` ~18898–18980; `chatRoomSettingsHTML` (**dead**)/`chatCfgHTML` ~18981–19057; `chSend`/`chatQuickAsk` ~19058–19092; `openChatHideConfirm`/`openChatDeleteConfirm` ~19101–19167; `chatClick` ~19170–19443; swipe gestures ~19445–19530; shared `blkSheetHTML(u,fromChat)`/`chatReportSheetHTML`/`unblockDlgHTML` ~16891–16928; `pfSetBlocked`/`pfIsBlocked` (`th.blocked` loop) ~16868–16888; `ch-rep-*` handlers (`rpFromChat`/`rpDelChat`) ~21757–21787; report head no-`<` ~17713/~17745; `rp-step`→blkSheet fromChat ~21812–21822; `rp-done`/`rpClose` delete wiring ~21830–21836/~15125–15144; `dlg-unblock-go` ~20888–20896; `askBtnHTML`/`state.ask` variants ~13379–13387; `data-chgo="post"`→`openPostDetail` ~19325–19334; input handlers `ch-input`/`ch-room-search-in`/`ch-q`/`ch-iq`/`chc-quick`/Enter ~20138/~20223–20255; `data-navgo`→`chatResetToDefault`+`openSub` ~21484–21501; back slide-out-right ~20977; `chmedia` pop+swap ~20965–20976; `applySessionData` reset ~23230; `GUEST_GATE_SEL`/`obGate` ~23269–23283; dead `chatPopHTML`/`.cp-*`/`chat-fab`/`sendChat` ~13488–13529/~22016–22036; `pfRestrictHint` defined-no-callsite ~16930–16938; ask-fail dead fallback ~21996–21997

## 1. What changed (section map)

| Section | Change |
| --- | --- |
| Header/§1 Doc Info | rename → **Chat (Chat Center)** — spec เดิม Offer-centric + Asset Reference model; prototype คือ LINE/IG Direct-style, thread ผูก user+listing |
| §2 Objective | rewrite — bottom-nav `แชท` member-only, Chats/Items 2 views, room LINE-style, chmenu/gallery/cfg, thread key user+item |
| §3 Prototype Reference | **ใหม่ทั้งก้อน** — anchor index ครอบ routes/state/list/items/room/attach/menu/gallery/dead-settings/cfg/actions/swipe/block-report shared/entries/nav-gate/dead (~80 anchors พร้อม line numbers ปัจจุบัน) |
| §4 Master Alignment | rewrite — thread key user+listing, post ref card snapshot (ไม่มี Asset Reference states), lifecycle §12 (การ์ดนิ่ง + unavailable-on-tap), block/report ผ่าน shared surfaces 06/15, guest = Member Sheet |
| §5 Scope | rewrite — In = list 2 views/item chats/room/search/attach/menu/gallery/cfg/swipe/quick-ask/block/report/gate/nav; Out = post model (02), detail (05), blkSheet/report internals (06/15), Member Sheet (00/01), notif internals (09), settings lists (13), deep-link contract |
| §6 Screen Mapping | rewrite — 17 surfaces (2 list views, filter popover, item chats, room 4 variants, attach, media viewer, chmenu, chmedia, chatcfg, dead chsettings, blkSheet, unblockDlg, chatReportSheet, report stack, hide/delete modals, Member Sheet) |
| §7 User States | rewrite — Guest (icon เท่านั้น + gate map), New member (empty), Member (buyer+seller ใน account เดียว — `mine` ขับด้วย owner), Blocked (read-only + bar + ask-guard) |
| §8 User Flow | **rewrite ทั้งก้อน** — Open Chat Center (navgo reset), Quick Ask (guard chain → draft room → first-send insertion), List interactions, Swipe, Room interactions, Block/Unblock, Report (del vs keep), Chat Config |
| §9 Business Rules | **rewrite ทั้งก้อน** — Thread Model (key/draft/snapshot/session-only), Entry Points (listing-scoped เท่านั้น + pf-msg dead canonical), Post Ref Card, Chats view, Items view+filter, chatitem:, Room, Room Search, Attach/Media, chmenu (4 ปุ่ม ไม่มี Delete), Gallery, chatcfg, Swipe, Block (`blkSheet` fromChat `Block` เดียว), Report (`chatReportSheet`→`report:user` ไม่มี `<` + `rpDelChat` unwind), Session/Nav/Reset, **Deviations & Dead-Code Notes 25 รายการ** |
| §10–12 Permission/Validation/Exception | rewrite — gate table ตาม `GUEST_GATE_SEL` (`[data-navgo="chat"]`/`.ask-pill`/`.chat-fab`/`.ch-rep-*`/`.blk-*`); validation (non-empty message, `chc-quick` ≤80, mock attach); exceptions (own/blocked/not-found toasts, `Chat not found`/`Item not found`, `Chat options aren't in this prototype yet`) |
| §13 Empty State | rewrite — verbatim copies ทั้งชุด (No chats yet/No chats found/No item chats yet/No items found/filter-empty/No photos or videos found./Chat not found/Item not found) — EN-hardcode flag |
| §14 Notification | rewrite — unread row + nav badge cap `99+` เท่านั้น ไม่ใช่ notif type (ตรง canonical 09); mute ไม่ filter `chUnread` (deviation) |
| §15 Analytics | rewrite — contract `chat_*` event set (17 events) |
| §16 ACs | **rewrite ทั้งชุด** — AC-CHAT-001–042 sequential จัดกลุ่ม 9 หมวด (Entry/Thread, Chats view, Items, Swipe, Room, Search/Menu/Gallery, Config, Block, Report, Session/Nav/Guest/Guard) — เดิม Offer-centric set + `Global Login Required` ACs ลบทิ้ง — renumber; ไม่มี live cross-ref ดู §2 |
| §17 Related | +00_GLOBAL/00_NAV/02/03/04/05/06/09/13/15 links ตาม boundary ใหม่ |
| §18 Future | +voice/typing/reactions/pinned msg/group, real receipts+incoming, file msg, followOnly enforcement, unavailable card state, persistence, chsettings revive/ตัด, gallery date grouping, pfRestrictHint, mute-badge filter, deep links, i18n sweep, report queue wiring |

## 2. Cross-doc ref check (ก่อนปิดงาน)

| Check | Result |
| --- | --- |
| `AC-CHAT` refs นอก 07 | **0 hits** ใน FrontOffice/ (เหลือแค่ refs เก่าใน gap/evidence docs ใน deliverables/ — historical) → renumber ปลอดภัย ✓ |
| `Global Login Required` ใน 07 ใหม่ | **0 hits** — แทนด้วย Member Sheet `Join TukDaeng` + `GUEST_GATE_SEL` ทั้งหมด (FSP-019 handoff ปิดเรียบร้อย) ✓ |
| Stale Offer/Asset-Reference terms ใน 07 ใหม่ | `Make Offer`/`Incoming Offers`/`Offer Card`/`Different Asset Rule`/`Asset Reference`(feature context)/`Block this user?`/`File Message`/`Typing Indicator` = **0** — เหลือเฉพาะการอ้าง spec-เดิม/deviation จงใจ (`Offer-centric`, `Asset Reference Card + states (spec เดิม)`, `ไม่มี Offer Card`) ✓ |
| `pf-msg` dead claim | 07 เขียนว่า Chat เข้าเฉพาะ listing (`ask-pill` 3 surfaces); อ้าง `pf-msg` dead + toast `Open a listing to chat with this seller` เป็น canonical 06 — ไม่มี claim "เข้าแชตจากโปรไฟล์" ✓ |
| `th.blocked` semantics | เขียนเป็น `pfSetBlocked` sync (PF_BLOCKED + unfollow + `th.blocked` loop + `p.blocked` + feed re-render) — ไม่ใช่ local-only flag ✓ |
| Boundary claims ที่ baselines ฝากไว้ | 00_NAV §6.6: routes + `chsettings:` dead → §3/§6 + AC-042 ✓; 00_NAV §7: `Feed | Ask Seller pill | Chat room (item-scoped)` + `Chat room | item card | Post Detail` + `Report entry … chat` → §8/§9 ✓; 00_GLOBAL §12: chat อยู่เมื่อ sold/deleted → §4/§9 Post Ref Card ✓; 02_FEED: `ask → chatQuickAsk` + `chat-fab` dead + own-post pill-hide → §9 Entries ✓; 05: `data-chgo="post"` + missing-post toast → §9/§12 + AC-021 ✓; 06: `pf-msg` dead + `[data-pf-user]` entries + `th.blocked` + `ch-rep-*`→`report:user` → §9 Block/Report ✓; 13: "chat notification prefs อยู่ที่ Chat config" → chatcfg `notif` ✓; 09: "Chat ไม่ใช่ Notification Center type" → §14 ✓ |
| Stale claim ใน baseline ที่เจอระหว่าง check | **05_ASSET_DETAIL L364**: "chat เข้าผ่าน feed card Ask / **profile / notifications**" — profile Chat = dead (FSP-019 lock), ไม่มี chat notif type → **แก้แล้ว 1 บรรทัด** เป็น "feed card Ask / item chat rows" + note canonical ✓ |
| Stale terms ใน not-yet-synced modules (flag ไม่แก้) | `Global Login Required`: 09(3 hits — FSP-021 rename-note รองรับ), 10/11/12/15/16/17 ยังไม่ได้นับซ้ำ (pending sync ตามลำดับ); 15 block-confirm EN body `You will no longer see…` ≠ blkSheet copy จริง → flag FSP-023; FO_Functional_PRD/PRD/DEV_CHAT_CHECKLIST/QA_CHECKLIST = legacy stale → flag FSP-025/026/027 ✓ |
| `Chat / New Message` notif claims | 09 §scope ตรง spec ใหม่ §14 (badge-only, ไม่ใช่ type) ✓ |
| ERROR_STATE_UI_COPY_CATALOG | 0 chat copies — flag เพิ่มตอน i18n sweep FSP-026 ✓ |
| 00_NAV L158 cosmetic | "chat room `...` = room menu" — icon จริงคือ `≡` (hamburger) ไม่ใช่ `...` — flag cosmetic ไม่แก้ baseline ✓ |

## 3. Verification

| Check | Result |
| --- | --- |
| ไฟล์ที่แก้ | `FrontOffice/07_CHAT_MODULE.md` (rewrite ~630 บรรทัด) + `FrontOffice/05_ASSET_DETAIL_MODULE.md` (1 บรรทัด stale entry fix) + evidence file นี้ ✓ |
| `git status --porcelain -- Prototypes/` | `M Prototypes/fo-flow/index.html` = **diff เดิมของ owner ก่อน session นี้** (ขยายจาก FSP-019: ตอนนี้ 10 hunks ~360 บรรทัด — comment long-press popover `c-popover-*`/`c-pop-*` + handler wiring; verified hunk list @@ 6131/13114/13197/13570/17209/17509/20976/22532/22890/23099 — ไม่มีส่วน chat) — **งานนี้ไม่แตะ Prototypes/ (read-only เท่านั้น); anchors สแกนจาก state ปัจจุบัน** ✓ |
| Thread model | key `user+item.id` + `C.draft` first-send `unshift` + `t.draft` persist — ตรง ~19073–19092/~19058–19072/~17843–17846 ✓ |
| Chats view | pin-first/`pinnedAt` + `You:` + `Blocked` chip/mute icon/time/unread pill/`ch-q` match — ตรง ~18474–18567 ✓ |
| Items view | `chItemGroups` ตาม item.id (ไม่ filter hidden — deviation), mine=`Your listings` `{price} · N chats`, asked=`{price} · last msg`, `isDirectRoom`, filter popover 3 options + checkmark — ตรง ~18512–18540/~18568–18619 ✓ |
| chatitem: | head `Item chats` + floating pill + `ch-iq` + `chRowHTML` เดิม — ตรง ~18620–18655 ✓ |
| Room | day divider + avatar เฉพาะต้นกลุ่ม + `Sent`/`Read` เฉพาะ `lastMe` + post card (ว่าง=me col, มี=แนบ msg แรก) + composer draft/send-enable + blocked bar — ตรง ~18656–18750 ✓ |
| Room search | header swap + `<mark>` + dim 0.25 + media dim เสมอ — ตรง ~18656/~19228–19242 ✓ |
| chmenu | 4 ปุ่มวงกลม รวม Report + `Photos & videos` + `Listings & Items` + E2E footer + **ไม่มี Delete** — ตรง ~18816–18896 ✓ |
| chmedia | Select/`{n} selected`/Deselect + badge ลำดับ + Trash/Download (ไม่มี Share) + `October 2569 BE` — ตรง ~18898–18980 ✓ |
| chatcfg | 3 toggles + defView (`data-chdef` → set `C.view` ทันที) + `chc-quick` ≤80 — ตรง ~19037–19057/~19343–19354 ✓ |
| Swipe | lock>8px/reveal±40/dismiss±30/rubber-band/250ms suppress + iOS modals + toasts TH — ตรง ~19445–19530/~19101–19167 ✓ |
| Block from chat | `blkSheetHTML(u,true)` `Block` เดียว → `pfSetBlocked` (`th.blocked` loop) → `Blocking` toast → bar + `Blocked` chip; Unblock → `unblockDlg` → `Unblocked` — ตรง ~16891–16906/~16871–16888/~21798–21808/~20888–20896 ✓ |
| Report from chat | `chatReportSheet` → `report:user` (ไม่มี `<`, rpFromChat) → `report:done:` + steps → `rpClose` + toast + `rpDelChat` unwind→chat list — ตรง ~16908–16919/~21757–21787/~17713/~21812–21836/~15125–15144 ✓ |
| Guest gate | `[data-navgo="chat"]`/`.ask-pill`/`.chat-fab`/`.ch-rep-*`/`.blk-*` → `obGate` Member Sheet; `chatInit` non-member → `threads=[]` — ตรง ~23269–23283/~17798 ✓ |
| Nav/reset | `data-navgo`→`chatResetToDefault`+`openSub`; back slide-out-right (`chat*`/`chmenu:`/`chsettings:`/`profile:`); `chmedia` ✕ pop+swap; `applySessionData` reset — ตรง ~21484–21501/~20977/~20965–20976/~23230 ✓ |
| Dead code | `chsettings:` (no emit), `chatPopHTML`/`.cp-*`/`chat-fab`/`sendChat` (bubble-only dl2 + intercepted), `state.ask` variants, E2E/Letter Sealing claims, `pfRestrictHint` no callsite, dl2 ask row — ทั้งหมดเขียนเป็น "ห้ามเป็น feature" ใน §9 deviations + AC-042 ✓ |
| ACs ใหม่ | AC-CHAT-001–042 ทุกข้ออ้างพฤติกรรมจริง (`ask-pill`/`chatQuickAsk`/`ch-q`/`ch-iq`/`chItemGroups`/`isDirectRoom`/`ch-post-card`/`data-chgo="post"`/`chSend`/`room-search`/`chmenu`/`chmedia`/`data-chdef`/`chc-quick`/`data-chact`/`blkSheet`/`unblockDlg`/`chatReportSheet`/`rpDelChat`/`GUEST_GATE_SEL`/`chatResetToDefault`) ✓ |

## 4. Deviations flagged (spec เลือก prototype — documented, not spec)

| Deviation | Note |
| --- | --- |
| Thread key = user+item | same seller คนละ listing = ห้องใหม่ทุกครั้ง — spec เดิม Same-User+Different-Asset merge ขัดทิศ (เลือก per-item rooms) |
| Post ref card = snapshot นิ่ง | ไม่มี Active/Sold/Deleted states — เหลือ unavailable-on-tap contract เท่านั้น |
| ไม่มี File/Asset/Offer card types | types จริง = text + image/video + post ref (Offer ถอดทั้ง codebase — FSP-006/007) |
| chmenu = `≡` page 4 ปุ่มวงกลม รวม Report | spec เดิม 3 ปุ่ม + overflow 5 items ขัดกันเอง; **ไม่มี Delete chat ในหน้านี้** |
| Block confirm = `blkSheet` `Block` เดียว | ไม่มี center dlg + Cancel ของ spec เดิม (canonical S-13) |
| `ch-blocked-bar` copy มี "call" | `You can't message or call them` — LINE leftover ไม่มี call feature |
| Report จาก chat ไม่มี `<` back | `rpFromChat` → title+`✕` เท่านั้น; ข้าม `report:pick` เสมอ |
| `Report and delete` ลบ thread จริงใน mock | spec เดิมบอกซ่อนฝั่งเดียว — spec ใหม่ = remove-from-actor-list + retention contract |
| Hide มี iOS modal + auto un-hide on send/Ask | spec เดิมไม่มี hide; **แต่ `chItemGroups` ไม่ filter `t.hidden`** → leak quirk ใน Items view |
| Mute toast TH `ปิด/เปิดการแจ้งเตือนแล้ว` | spec เดิม EN `Notifications muted/unmuted` |
| Sort = insertion + pin-first | ไม่มี timestamp DESC จริง; re-order เฉพาะ send (`unshift`) |
| Send at `09:41` + ไม่มี incoming | `Sent` ไม่เคย→`Read` ใหม่; `Read`/`Sent` เฉพาะ `lastMe` (visual mock) |
| `followOnly` toggle ไม่มี enforcement | config มี ไม่มี surface ให้ทดสอบ |
| E2E / Letter Sealing = claim copy | chmenu footer + chsettings row — ห้าม spec เป็น feature |
| `chsettings:{id}` dead ทั้งหน้า | มี render+handler แต่ไม่มี `data-chgo="chsettings"` emit |
| `chatPop`/`.chat-fab`/`sendChat` dead | bubble-only dl2 + `chatQuickAsk` intercept เสมอ → `.chat-pop` unreachable |
| `state.ask` variants = dev artifact | ico/txt/outline/solid/bubble/auto — 00_NAV §11 tooling rule |
| `t.media` lazy mock เฉพาะ `t1` | gallery date label hardcode `October 2569 BE` — ไม่มี date grouping จริง |
| media send ไม่ un-hide/ไม่ move-top | quirk ต่างจาก `chSend` |
| `cfg` ไม่ reset ตอน session switch | `applySessionData` เคลียร์แค่ inited/threads/draft |
| Ask post lookup fail → `Not in this prototype yet` | `.ask-pill` อยู่ใน dead-handler list (fallback เมื่อ chatClick ไม่จับ) |
| EN/TH hardcoded ~40 copies | `Your listings`/`Item chats`/`Filter items by`/`Messages`/gallery labels/section labels ฯลฯ → i18n sweep |
| `pfRestrictHint` defined ไม่มี call site | 06 spec อ้าง banner หลัง unblock — ไม่แสดงจริง (flag consistency) |
| Session-only state ทั้งโมดูล | threads/pins/mutes/hidden/cfg/draft/galState memory เท่านั้น |
| `chUnread` ไม่ filter muted | mute icon แสดง แต่ badge ยังนับ (§14 deviation note) |

## 5. Flags ส่งต่อ (ไม่แก้นอก scope)

- **FSP-021** — `09_NOTIFICATION`/`10_WATCH_ALERT`: stale `Global Login Required` (09: 3 hits, rename-note 00_GLOBAL §11 รองรับ) + chat = badge-only claim ตรงแล้ว ✓ + `system` notif type decision (gap-FSP-003b)
- **FSP-023** — `15_TRUST_SAFETY`: block-confirm EN body `You will no longer see this user's assets…` ≠ `blkSheet` copy จริง (`Block {u}?` + `This will also block any other profiles…` + 3 impact rows); chat report entry (`rpFromChat`/`rpDelChat`/no-`<` head/`chatReportSheet`) canonical ฝากไว้ที่ 07 §9; `PM_REASONS`/`report:user` internals เป็นของ 15
- **FSP-025/026/027** — FO_Functional_PRD/PRD/DEV_CHAT_IMPLEMENTATION_CHECKLIST/QA_TEST_SCENARIO_CHECKLIST = stale ทั้งชุด (Offer-centric chat checks, `AC-CHAT` เดิม, `Global Login Required`) — sync ตาม 07 ใหม่ + **EN-hardcode copies เข้า i18n sweep**: `Your listings`/`Items you asked about`/`Item chats`/`Your listing`/`Filter items by`/`All items`/`Search people or messages`/`Messages`/`You:`/`Blocked`/`Sent`/`Read`/`Hiding chats doesn't delete…`/`Are you sure you want to delete this chat?`/`No chats yet`/`Tap Ask on a post…`/`No chats found`/`No item chats yet`/`No items found`/`No listings found`/`No asked items found`/`No items match your filter`/`Chat not found`/`This conversation is no longer available`/`Item not found`/`No photos or videos found.`/`This chat is protected with End-to-End Encryption`/`Select`/`Deselect`/`{n} selected`/`October 2569 BE`/`You blocked this account`/`You can't message or call them…`/`Are you sure you want to report {u}?`/`Report and delete`/`Thanks for your feedback` + ERROR_STATE_UI_COPY_CATALOG ยังไม่มี chat copies
- **FSP-030 consistency sweep** — `pfRestrictHint` defined-no-callsite (06 spec อ้าง banner — reconcile กับ 06), `chItemGroups` ไม่ filter hidden (leak quirk), `chUnread` ไม่ filter muted, 00_NAV L158 `...` vs `≡` cosmetic, media-send ไม่ un-hide quirk, `cfg` ไม่ reset ตอน session switch, E2E claim copy (revive หรือตัด), `chsettings:` route (revive หรือตัด)
- **Prototype drift note** — `Prototypes/fo-flow/index.html` มี uncommitted diff ของ owner (comment long-press popover ~360 บรรทัด) — anchors ของ spec ทุกไฟล์อาจ drift; task ถัดไป verify ด้วย function-name search เหมือนเดิม
- งานทั้งหมดยัง uncommitted รวม FSP-006–020 — รอพี่สั่ง commit แยก
