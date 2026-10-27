# FO-TEST-001-07 — Test Cases: Bottom Sheets & Quick Actions ทั้งหมด

> **สืบทอดจาก FO-TEST-02/03/06:** กติกาโมดัลทั่วไป (เทสแยก actor เสมอ, เคสหลัก = ทีละการกระทำ, ทุก [GATE] เทส guest+member คู่, กติกาโอนลิงก์, เช็คผลคงที่หลัง sign-out), ขั้นตอน reset/logout/login (SETUP-00..03 + SETUP-04/05), gate ของ feed card entries (FED-012: like/save/share), gate ของ shell nav, และ **entry ของทุก sheet** จาก FO-TEST-06 (PV-017..030, DET-015..020) — ไฟล์นี้เทส **กลไกภายใน sheet/overlay เต็มรูปแบบ** หลังเปิดสำเร็จ
> **Source of truth (index.html):** `openSheet` L14032–14039 · `commentRowsHTML/commentsFor` L13738–13786 · `commentsHTML` L13889–13902 · `openCommentPopover` L13794–13848 · `delCommentDlgHTML`+`deleteComment` L13850–13887 · `likesSheetHTML` L13938–13955 · `shareSheetHTML` L13957–13977 · `saveSheetHTML` L13979–14000 · `wlSheetHTML` L14008–14029 · `ncSheetHTML` L15829–15843 · `waModesHTML/waSheetHTML` L16530–16566 · `blkSheetHTML` L17006–17021 · `mfSheetHTML` L17083–17094 · `uf` inline L22211–22250 · `pvPostSheetHTML` (ps) L14760–14779 · `pvDetailsSheetHTML` (dt) L14782–14785 · `openDlg/closeDlg` L15019–15026 · `pmDropCovered` L15205–15213 · `openSub/pushSub/rpBack` L15188–15235
> **Handlers:** gate `isGuest+obGate` L20494–20500 · dead-list L22148–22150 · `comment-btn/pv-add` L21552–21565+22367–22381 · `liked-by/lk-follow` L22383–22397 · `share-btn/sh-fr/sh-app` L22399–22420 · `save-btn/sv-*` L22843–22887 · `wl-*` L22790–22834 · `nc-*` L22726–22789 · `c-pop-*` L22888–22945 · `delComment` L22946–22966 · `emojiSpan` (unreachable) L22967–22995 · `closeSheet` L22996–23002 · `c-like` L23003–23010 · long-press/contextmenu L23566–23635 · `mf-btn/wa-*/sr-wa` L22251–22366 · `mf-*` (following sheet) L21705–21811 · `uf-*` L22238–22250 · `GUEST_GATE_SEL` L23461–23470
> **ค้นพบที่ยังต้องเทสต่อ:** emoji/comment-input/Reply เป็น dead-zone สำหรับ member (dead check มาก่อน emoji handler จริง), c-like toggle ไม่ persist, lk-follow ไม่ sync following state, sv/wl เป็น single-collection, ESC ไม่มี handler, backdrop tap ปิดทั้ง dlg+sheet พร้อมกัน, `.nt` variant เป็น marker class (ไม่มี CSS แยก), `pm-rp`/`sort-open` dead
> **เขียนเสร็จรอรีวิว — อย่าเพิ่งปิดงาน**

## 0. วิธีใช้ + สภาพแวดล้อม

- เปิด `http://localhost:8901/index.html` (หรือเปิดไฟล์ตรง) · viewport 440×956 · desktop mouse (long-press = กดค้าง 450ms; right-click = popover path เดียวกัน)
- **Actors:** GUEST / MEMBER (`demo@tukdaeng.com` / `Tukdaeng123` = king.mr.fox, own comments คือชื่อนี้) / NEW · OWNER เหมือนเดิม
- **Layer model (บน→ล่าง):** onboarding/member sheet `.ob` → `.dlg` (dialog-open) → `.comment-sheet` + `.sheet-backdrop` (`*-open`) → `.page-sub` (rp อาจเป็น `rp-over` บน pv) → `.page-detail` → `.page-pv` → `.page-feed`
- **Sheet model สำคัญ:** `.comment-sheet` มี **element เดียวต่อ screen** — `openSheet()` เปลี่ยน variant class + เปลี่ยน HTML ข้างใน → "sheet ซ้อน sheet" คือ **swap ข้างใน** ไม่ใช่ stack จริง (เช่น sv→nc, ps→uf, comments→blk) · ของที่ซ้อนจริง: c-popover (ใน sheet), dlg (บน sheet), report sub-page (บน sheet/viewer)
- **ปิด sheet:** backdrop tap (ปิด **ทุก** open-class พร้อม dlg + popover) · `.sheet-handle` tap · **ไม่มี** drag-to-dismiss · **ไม่มี** ESC
- **Priority:** High = กติกาหลัก/flow สำคัญ (reply 1 ชั้น, gate, delete/block, save/wl state, wa create) · Medium = feature หลัก · Low = edge/cosmetic
- **สัญลักษณ์:** หมายเหตุท้ายตารางอ้าง FO-TEST-02/03/05/06 + [GATE] = เทส guest+member · [DEAD]/[PLACE]/[OPEN-CODE-ONLY] ตามสัญญา · *(คาด fail)* = quirk ที่ยืนยันกับ PO/ทีมก่อนบันทึก bug
- Sheet ทุกชนิด render จาก state ตอนเปิด — reopen = re-render (state ที่เป็น DOM-only เช่น c-like จะหาย)
- `COMMENTS` seed: p1 (2 root +3 replies รวม reply ของ king.mr.fox), p2 (4 root +1 reply), p3 (5 root +2 replies), p7–p11 · `SEED_SAVED` L13251: p1,p9→"Grail list" · p2,p11→"Wishlist" · p8→"Vintage picks" · p7,p10→"Saved" · `COLLECTIONS` 4 ชุด (Grail list, Wishlist, Vintage picks, New) · `WISHLISTS` 2 ชุด (Next buy, Grail goals)

## 1. Coverage map — sheets & mechanics

| Route/Overlay (inventory §2) | ปกติ | Edge | รวม |
|---|---|---|---|
| `.comment-sheet` singleton + `.sheet-backdrop` + `openSheet` swap | SHT-001..004,006 | SHT-005(ESC), SHT-007,008(dlg ซ้อน), SHT-009(uf swap), SHT-010(toast), SHT-011,012(report over/z-order) | 12 |
| comments sheet (pv-add/comment-btn, nt variant) | SHT-013..018,039,040 | SHT-019..022(dead zone), SHT-023,024(c-like), SHT-025..037(popover/del/block/report), SHT-038(noComments+pv-add), SHT-041[GATE] | 29 |
| likes sheet (liked-by / pv rail Likes) | SHT-042..046 | SHT-047(0-like มี liker), SHT-048(likedBy=null ไม่เปิด) | 7 |
| share sheet (share-btn) | SHT-049..053 | SHT-054(ไม่ผูก post), SHT-055(บน detail) | 7 |
| save sheet (save-btn) + collections | SHT-056..059 | SHT-060..062(unsave/single-col), SHT-063[GATE], SHT-064,065(nc chain), SHT-066(sync) | 11 |
| wishlist sheet (wl-btn detail) | SHT-067..070 | SHT-071(nc), SHT-072[GATE] | 6 |
| nc sheet (new collection, sheet-ซ้อน-sheet) | SHT-073..076 | SHT-077..080(disabled/move/dup name) | 8 |
| watch alert sheet (mf-btn/sr-wa/wa-badge) | SHT-081,082,084,085,087,088 | SHT-083(no criteria), SHT-086(modes disabled), SHT-089(dedupe), SHT-090[GATE] | 10 |
| uf sheet (Unfollow @X?) | SHT-091..093 | SHT-094(ps swap) | 4 |
| mf sheet (manage following) | SHT-095..097 | SHT-098(unf ไม่มี confirm) | 4 |
| ps sheet (caption+comments) / dt sheet | SHT-099,100,102,103 | SHT-101(interactive ใน ps) | 5 |
| blk sheet + unblock dlg (comment popover path) | SHT-104,105 | SHT-106(unblock คืน comments) | 3 |
| guest matrix + i18n/theme + integration | SHT-107..115 | (ในตารางก) | 9 |

## 2. Test cases

### 2.1 Sheet mechanics — openSheet / backdrop / stack / toast

| TC ID | Steps | Expected | Actor | Priority | Note |
|---|---|---|---|---|---|
| FO-TC-SHT-001 | pv-open โพสต์ p1 → กด 💬 → ขณะ comments sheet เปิดอยู่ inspect DOM | `.comment-sheet` มี **element เดียว**ต่อ `.screen` — ทุก sheet variant ใช้ก้อนเดียวกัน เนื้อหา swap ไม่ใช่ stack | MEMBER | Medium | `openSheet` L14032 ลบ variant class เก่าออกก่อนใส่ใหม่ |
| FO-TC-SHT-002 | comments sheet เปิด → แตะ `.sheet-backdrop` (พื้นหลังมืดเหนือ sheet) | sheet เลื่อนลงหาย, `comments-open` ถูกลบ, feed/pv เบื้องหลังเลื่อนได้ปกติ (scroll unlock), ไม่มี toast | MEMBER | High | backdrop ปิดทุก open-class พร้อมกัน L22998 |
| FO-TC-SHT-003 | comments sheet เปิด → แตะ `.sheet-handle` (แถบจับด้านบน) | ปิดเหมือน backdrop — `closeSheet` ผูกที่ handle ด้วย | MEMBER | Medium | |
| FO-TC-SHT-004 | comments sheet เปิด → ลาก sheet/body ลง (drag-to-dismiss) | **ไม่ปิด** — ไม่มี gesture handler บน sheet; มีแค่ tap backdrop/handle | MEMBER | Low | pointer handlers L19562+ เป็น chat-row swipe ไม่เกี่ยว |
| FO-TC-SHT-005 | sheet เปิด → กด `ESC` | **ไม่มีอะไรเกิดขึ้น** — ไม่มี keydown handler ผูกกับ sheet/dlg เลย *(คาด fail ถ้า spec ต้องการ ESC)* | MEMBER | Low | quirk — บันทึก GAP |
| FO-TC-SHT-006 | sheet เปิดบน pv (comments) → พยายาม swipe รูป/เลื่อน list เบื้องหลัง | scroll/swipe เบื้องหลังถูกล็อก (CSS `*-open` ล็อก `.pv-track/.feed-scroll/.detail-scroll/.sub-scroll` L1360); sheet-list เลื่อนได้ปกติ | MEMBER | Medium | |
| FO-TC-SHT-007 | comments sheet → long-press comment ของตัวเอง → Delete → dlg "Delete this comment?" ขึ้น → กด **Cancel** | dlg ปิดเฉพาะตัว (`dialog-open` off) — comments sheet + popover state เบื้องหลังยังอยู่ (sheet ไม่ปิด) | MEMBER | High | dlg ซ้อนบน sheet ได้จริง; `dlg-cancel` L20995 |
| FO-TC-SHT-008 | ทำซ้ำถึง dlg เปิด → แตะ `.sheet-backdrop` (แทนปุ่ม Cancel) | **backdrop ปิดทั้ง dlg และ sheet พร้อมกัน** — ลบทุก open-class (`dialog-open`+`comments-open`) *(คาด fail ถ้า spec อยากให้ปิดทีละชั้น)* | MEMBER | Medium | quirk — backdrop เดียวกันใช้ร่วม L22998 |
| FO-TC-SHT-009 | pv "…" (more-link) → ps sheet → ใน ps-head กด Following (post ที่ follow อยู่ → ใช้ unfollow path ผ่าน uf) → กด **Cancel** บน uf | uf **swap ทับ ps** ใน element เดียว → Cancel ปิด sheet ทั้งก้อน — **ไม่ย้อนกลับไป ps** *(คาด fail ถ้าอยากให้กลับ caption sheet)* | MEMBER | Medium | uf inline handler L22211–22250 |
| FO-TC-SHT-010 | ทำ action ที่มี toast: save→pick collection ("Saved to X"), share→member ("Sent to X"), wa→Create ("Watch alert on") | toast ขึ้นหลัง sheet ปิด, ข้อความตรง, หายเองภายใน ~2–3 วินาที | MEMBER | High | `scrToast` ทุก branch |
| FO-TC-SHT-011 | comments sheet → long-press comment คนอื่น → Report | `comments-open` ถูกลบ + report:comment sub-page สไลด์ทับ (`rp-over` ถ้า pv เปิดอยู่) — sheet ปิด snap ไม่ซ้อน | MEMBER | High | `pmDropCovered` L15205 ปิด sheet แบบไม่มี transition |
| FO-TC-SHT-012 | เปิด wa sheet จาก detail → สังเกต z-order | sheet+backdrop เหนือ `.page-detail` → เหนือ `.page-pv` → เหนือ feed; `#themeToggle` ถูกซ่อนระหว่าง sheet เปิด (CSS `body:has(*-open)` L6795) | MEMBER | Low | |

### 2.2 Comments sheet — เนื้อหา / dead zone / c-like / popover / delete / block

| TC ID | Steps | Expected | Actor | Priority | Note |
|---|---|---|---|---|---|
| FO-TC-SHT-013 | feed card p1 → กด 💬 `comment-btn` | comments sheet เปิด variant ปกติ: หัวข้อ "Comments", list, emoji row, input | MEMBER | High | L22367–22369 |
| FO-TC-SHT-014 | pv เปิด p1 → กด 💬 ใน rail → ปิด → เปิด detail บน pv แล้วกด 💬 บน detail | pv → sheet ได้ class `nt` (marker สำหรับ "ส่งเข้า pv"); detail → **ไม่ใช่** nt (เงื่อนไข `pv-open && !detail-open` L22376) — หน้าตาเหมือนกันเพราะ nt ไม่มี CSS แยก | MEMBER | Low | nt = marker only, ไม่มี styling ต่าง |
| FO-TC-SHT-015 | pv เปิด → แตะ `pv-add` "Add comment…" | comments sheet เปิด (nt) — เหมือนกด 💬 | MEMBER | Medium | L21552–21565 |
| FO-TC-SHT-016 | เปิด comments ของ p1 อ่านโครง | handle → "Comments" → `.sheet-list` มี c-row → emoji-row 8 ตัว (❤️🙌🔥👏😢😍😮😂) → comment-input (avatar + "Add a comment…" + ไอคอนรูป/GIF) | MEMBER | High | `commentsHTML` L13889 |
| FO-TC-SHT-017 | อ่าน rows ของ p1 | root c-row: avatar+name+time+text+`♡ n`+meta "Reply" — p1-c1 chrono.th (likes 2) มี 2 reply: Watch 777 + **king.mr.fox (ของตัวเอง)**; p1-c2 king.mr.fox (root ของตัวเอง) มี 1 reply — reply rows เยื้องเข้า `.c-row.reply` | MEMBER | High | seed COMMENTS L13276–13292 |
| FO-TC-SHT-018 | ตรวจ reply ทุกตัวใน p1–p3 | **reply มีแค่ 1 ชั้น** — reply rows ไม่มี c-row ซ้อนลึกกว่านี้; โครง data ไม่มี replies ใน replies | MEMBER | High | กติกาบังคับ: reply ได้ 1 ชั้นเท่านั้น |
| FO-TC-SHT-019 | member: แตะ "Reply" (`.c-meta`) บน root comment | toast **"Not in this prototype yet"** — reply input ไม่เปิด [DEAD] | MEMBER | High | `.c-meta` อยู่ใน dead-list L22148 (มาก่อน emoji handler) |
| FO-TC-SHT-020 | member: แตะ "Reply" บน **reply row** (ชั้น 2) | toast "Not in this prototype yet" เช่นกัน — **ไม่มีทางสร้าง reply ชั้น 2** (ไม่มี affordance ใน popover ด้วย) | MEMBER | High | เคสบังคับ: reply ชั้น 2 ทำไม่ได้ |
| FO-TC-SHT-021 | member: แตะ comment-input / ไอคอนรูป / GIF | toast "Not in this prototype yet" — พิมพ์/sent comment ทำไม่ได้ [DEAD] | MEMBER | High | `.comment-input` ใน dead-list |
| FO-TC-SHT-022 | member: แตะ emoji ใน emoji-row | toast "Not in this prototype yet" — แม้ code มี handler ที่เพิ่ม comment จริง (L22967) แต่ dead check มาก่อน → **unreachable** *(คาด fail — emoji ควรส่ง comment ได้ตาม handler)* | MEMBER | Medium | GAP-SHT: dead-list บัง emoji-span |
| FO-TC-SHT-023 | member: กด ♡ บน comment (likes=2) → กดอีกครั้ง | ♥ แดง + ตัวเลข 2→3 → กลับ 2; comment likes=0 แสดง "1" หลังกด | MEMBER | High | `c-like` L23003–23010 toggle class+count |
| FO-TC-SHT-024 | like comment แล้วปิด sheet → เปิดใหม่ | **count กลับค่า seed** — c-like เป็น DOM-only ไม่เขียนกลับ `COMMENTS` *(คาด fail ถ้าต้อง persist)* | MEMBER | Low | quirk — sheet re-render ใหม่ทุกครั้ง |
| FO-TC-SHT-025 | member: กดค้าง 450ms บน comment คนอื่น (เช่น chrono.th) | `.c-popover` ขึ้นที่ตำแหน่งแถว: แถว Block + Report + backdrop ครอบใน sheet | MEMBER | High | `openCommentPopover` L13794; long-press L23566+ |
| FO-TC-SHT-026 | member: right-click comment คนอื่น | popover เดียวกัน (contextmenu path) | MEMBER | Medium | L23619+ |
| FO-TC-SHT-027 | member: long-press comment **ของ king.mr.fox** (ตัวเอง) | popover มีแค่ **Delete** — ไม่มี Block/Report | MEMBER | High | own = author===state.user.username L13819 |
| FO-TC-SHT-028 | guest: long-press comment | **Member Sheet** ขึ้นแทน popover | GUEST | High | `obGate` ใน long-press handler |
| FO-TC-SHT-029 | popover เปิด → แตะ `.c-popover-backdrop` | popover ปิดเฉพาะตัว — comments sheet ยังเปิด | MEMBER | Medium | |
| FO-TC-SHT-030 | member: popover → Delete บน root ที่มี replies (p1-c1 มี 2 replies) → dlg → **Delete** | dlg อธิบาย "...comment **and its replies** will be removed." → confirm → แถวหายทั้ง root+replies, `p.comments` ลด 3, ตัวเลขบน card/detail อัปเดต, toast "This comment was removed." | MEMBER | High | `delCommentDlgHTML`+`deleteComment` L13850+ |
| FO-TC-SHT-031 | member: Delete บน reply เดี่ยว (p1-r3) | dlg "...comment will be removed." (ไม่พูด replies) → ลบ 1 รายการ, count -1 | MEMBER | Medium | |
| FO-TC-SHT-032 | member: Delete → กด **Cancel** ใน dlg | dlg ปิด — comment ไม่หาย, sheet ยังเปิด, ไม่มี toast | MEMBER | Medium | |
| FO-TC-SHT-033 | member: popover → **Block** บน chrono.th → blk sheet → **Block** | comments sheet ปิด → blk เปิด (avatar + "Block chrono.th?" + impact 3 แถว + Block + Block and report) → Block → **comments sheet เปิดกลับ** แสดง list ที่กรอง chrono.th ออก + toast "Blocked and hidden comments" | MEMBER | High | `_cmtFromPid` reopen L22921–22933 |
| FO-TC-SHT-034 | หลัง block chrono.th → เปิด comments ของ post ที่เขา reply ใต้คนอื่น | reply ของ chrono.th **ถูกกรองออก** ด้วย (`commentsFor` กรองทุกระดับ) — ตัวเลข count บน post ไม่ลด → count vs แถวที่เห็นอาจไม่ตรง *(quirk)* | MEMBER | Medium | L13738–13750 filter |
| FO-TC-SHT-035 | member: block chrono.th ไว้แล้ว → long-press comment คนอื่น → Block บนคนที่ block อยู่ (เข้าทาง comments ที่มี comment เหลือของคนถูก block ไม่ได้ — ใช้ path settings/profile แทน: popover บน author ใหม่ที่กำลังจะ unblock) — หรือเปิด blk→Block ซ้ำบนคนเดิม | ถ้า author ถูก block อยู่ → เปิด **unblock dlg** (ไม่ใช่ blk sheet) → Unblock → toast "Unblocked" + comments กลับมาเห็น; **comments sheet ไม่ reopen เอง** หลัง unblock *(quirk)* | MEMBER | Medium | L22908–22920 branch |
| FO-TC-SHT-036 | member: blk sheet → **Block and report** | block สำเร็จ + `report:pick` sub-page เปิดทับ + sheet ปิด snap (pmDropCovered) | MEMBER | Medium | L22935–22944; report flow = FO-TEST-15/16 |
| FO-TC-SHT-037 | member: popover → **Report** | comments ปิด → report:comment เปิดเป็น sub (`rp-over` ถ้าอยู่บน pv) — เข้าได้, back กลับ pv/feed ปกติ | MEMBER | High | entry เท่านั้น |
| FO-TC-SHT-038 | pv เปิดโพสต์ `noComments` (เช่น p9 หรือ post ที่สร้างด้วย toggle "ปิดคอมเมนต์" — rail ไม่มี 💬 แต่ `pv-add` ยังโชว์) → แตะ pv-add | **comments sheet เปิดได้ปกติ** มี comments+input dead — quirk ต่อจาก GAP-07 (FO-TEST-06): entry pv-add ไม่เช็ก `p.noComments` | MEMBER | Medium | GAP-07 continue; pv rail ซ่อน 💬 แต่ pv-add ไม่ซ่อน L14738 |
| FO-TC-SHT-039 | เปิด comments ของโพสต์ 0 comment (own post ใหม่จาก composer) | "No comments yet" ใน list — emoji row + input ยัง render | MEMBER | Medium | `commentsHTML` empty branch |
| FO-TC-SHT-040 | comments sheet → แตะ avatar/name ของ comment | ปิด sheet + `profile` sub-page ของ author เปิด (`pfUserGo` ลบ pv/detail/comments/likes classes ก่อน pushSub) | MEMBER | Medium | `data-pf-user` L13820; handler L22133 |
| FO-TC-SHT-041 | [GATE] guest: เปิด comments ได้ → ลองแตะ comment-input / emoji / Reply / ♡ / long-press ทีละอย่าง | เปิด sheet อ่านได้ — แต่ **ทุกอย่างล้วนเด้ง Member Sheet** (input/emoji/c-meta อยู่ใน GUEST_GATE_SEL; c-like+long-press gate เอง) | GUEST | High | gate คู่กับ SHT-019..028 |

### 2.3 Likes sheet

| TC ID | Steps | Expected | Actor | Priority | Note |
|---|---|---|---|---|---|
| FO-TC-SHT-042 | pv เปิด p1 → แตะ rail **"Likes"** (`.liked-by`) | lk sheet เปิด: "Likes" + `.lk-note` "Only Watch 777 can see the total number of likes on this post." + rows avatar+username+display+ปุ่ม Follow | MEMBER | High | L13938; note โชว์เฉพาะโพสต์คนอื่น |
| FO-TC-SHT-043 | เปิด likes sheet บน **own post** (post ที่สร้างเอง) | **ไม่มี** `.lk-note` (เจ้าของเห็นจำนวนเองได้) | MEMBER | Medium | `isOwnPost(p) ? "" : note` |
| FO-TC-SHT-044 | นับ rows ใน likes sheet | = `p.likedBy` + `LIKER_POOL` (6 คน) หักซ้ำ → ~7 แถว เลื่อนได้ใน `.sheet-list` | MEMBER | Medium | L13947–13954 |
| FO-TC-SHT-045 | member: กด **Follow** (`.lk-follow`) บนแถวใด → ปิด sheet → เปิดใหม่ + เช็ก profile คนนั้น | ปุ่มเปลี่ยน "Following" ทันที — แต่ **เป็น local toggle เท่านั้น** (ไม่เรียก pfSetFollow): reopen กลับ "Follow", หน้า profile ไม่ follow *(คาด fail — quirk)* | MEMBER | Medium | L22393–22397 flip class only |
| FO-TC-SHT-046 | [GATE] แตะแถว liker (ไม่ใช่ปุ่ม) / guest กด Follow | แถว → profile sub เปิด (sheet ปิด); **guest กด Follow → Member Sheet** | GUEST/MEMBER | High | `.lk-follow` ใน GUEST_GATE_SEL; แถวมี data-pf-user |
| FO-TC-SHT-047 | own post ใหม่ (composer, likes=0) → pv → แตะ "Likes" | **sheet เปิดแสดง liker "the watch"** ทั้งที่ likes=0 — `insertNewPost` seed `likedBy` ตายตัว *(quirk)* | MEMBER | Low | L16300 |
| FO-TC-SHT-048 | post ที่ `likedBy=null` (post ที่ materialize จาก profile grid — ตาม FO-TEST-06 PV-034 note) → pv → แตะ "Likes" | **ไม่มีอะไรเกิดขึ้น** — handler เข้าถึง `p.likedBy.name` โดยไม่ guard → TypeError เงียบ sheet ไม่เปิด *(คาด fail — GAP)* | MEMBER | Medium | L22384–22390; edge จาก materialize |

### 2.4 Share sheet

| TC ID | Steps | Expected | Actor | Priority | Note |
|---|---|---|---|---|---|
| FO-TC-SHT-049 | member: pv → กด ↗ share-btn | sh sheet: search field "Search" + friends grid (13 `.sh-fr`) + apps row Messenger/Direct/LINE/Facebook/Copy link | MEMBER | High | `shareSheetHTML` L13957 |
| FO-TC-SHT-050 | member: พิมพ์ใน search `.sh-q` เช่น "watch" → ลบออก | grid filter สด ตาม name; ล้าง → กลับครบ 13 | MEMBER | Medium | input handler |
| FO-TC-SHT-051 | member: กดเพื่อน "Watch 777" | sheet ปิด + toast **"Sent to Watch 777"** | MEMBER | High | L22410–22415 |
| FO-TC-SHT-052 | member: กด Copy link / Messenger / LINE | sheet ปิด + toast **"Link copied"** / **"Shared to Messenger"** ตามปุ่ม | MEMBER | High | L22416–22420 |
| FO-TC-SHT-053 | [GATE] guest กด share-btn / member กด | **guest → Member Sheet; member → share sheet เปิด** | GUEST/MEMBER | High | `.share-btn` ใน GUEST_GATE_SEL |
| FO-TC-SHT-054 | เปิด share จาก 2 โพสต์ต่างกัน | เนื้อหา sheet เหมือนกันหมด — `shPid` ถูกเก็บแต่ไม่ได้ใช้ render อะไรเฉพาะ post *(quirk — ไม่มี post context)* | MEMBER | Low | |
| FO-TC-SHT-055 | detail → กด share-btn บน detail | sheet เปิดเหนือ `.page-detail` ปกติ + ปิดแล้วกลับ detail ครบ | MEMBER | Medium | detail dl1 มี share-btn (DET-018) |

### 2.5 Save sheet + collections

| TC ID | Steps | Expected | Actor | Priority | Note |
|---|---|---|---|---|---|
| FO-TC-SHT-056 | member: feed card โพสต์ยังไม่ save (p3) → กด 🔖 | **auto-save ลง "Saved" ก่อน** (icon เติม) แล้ว sv sheet เปิด: sv-head "Saved/Private" (thumb=รูปโพสต์, bookmark เติม) + "Collections" + "New collection" + 4 collection rows (plus icon) | MEMBER | High | `save-btn` handler L22843+ บันทึกก่อนเปิด |
| FO-TC-SHT-057 | member: เปิด sv บน p1 (saved+savedCol="Grail list" จาก seed) | sv-head bookmark เติม + row "Grail list" โชว์ **check** (ไม่ใช่ plus) — แถวอื่น plus | MEMBER | High | `.savedCol===name → ✓` L13994 |
| FO-TC-SHT-058 | member: sv → กด "Vintage picks" | toast **"Saved to Vintage picks"** + sheet ปิด + savedCol=Vintage picks (icon ยังเติม) | MEMBER | High | L22851–22860 |
| FO-TC-SHT-059 | member: เปิด sv ซ้ำหลังย้าย | check ย้ายไป "Vintage picks"; Grail list กลับ plus | MEMBER | Medium | |
| FO-TC-SHT-060 | member: กด collection เดิมซ้ำ ("Vintage picks") | ย้ายกลับ "Saved" + toast **"Removed from Vintage picks"** + savedCol=null | MEMBER | Medium | L22861–22866 |
| FO-TC-SHT-061 | member: กด sv-head "Saved" ขณะ saved | **unsave** ทั้งโพสต์ + toast "Removed from your saved" + icon โล่ง | MEMBER | High | L22867–22872 |
| FO-TC-SHT-062 | member: post อยู่ "Grail list" → pick "Vintage picks" → เปิด savedcol ของทั้งสอง | **post หายจาก Grail list ไปอยู่ Vintage picks** — savedCol เป็น field เดียว → **อยู่ได้ collection เดียวเท่านั้น** (multi-collection ไม่มีใน prototype) *(คาด fail ถ้า spec ต้องการหลาย collection)* | MEMBER | High | เคสบังคับ: asset หลาย collection — model เป็น move ไม่ใช่ add |
| FO-TC-SHT-063 | [GATE] guest กด 🔖 / member กด | guest → Member Sheet; member → auto-save+sheet | GUEST/MEMBER | High | `.save-btn` ใน GUEST_GATE_SEL |
| FO-TC-SHT-064 | member: sv → **New collection** → nc sheet → กด **Cancel** | nc swap ทับ sv → Cancel **กลับมา sv sheet** (จาก `ncFrom==="save"` → reopen sv) — ไม่ปิดทิ้ง | MEMBER | Medium | `nc-cancel` L22726–22740 |
| FO-TC-SHT-065 | member: sv → New collection → พิมพ์ "Rolex grails" → **Next** | collection ใหม่เข้า `COLLECTIONS` + post.savedCol=มัน + toast **"Saved to Rolex grails"** + ปิด; เปิด sv รอบหน้ามีแถวใหม่ | MEMBER | High | `nc-next` L22744+ |
| FO-TC-SHT-066 | member: save จาก feed → เปิด pv/detail โพสต์เดียวกัน | icon 🔖 เติมทุก surface (`syncSaveBtns`) | MEMBER | Medium | |

### 2.6 Wishlist sheet

| TC ID | Steps | Expected | Actor | Priority | Note |
|---|---|---|---|---|---|
| FO-TC-SHT-067 | member: detail โพสต์ sale → กด 🎁 `wl-btn` | **auto-wishlist ลง "Wishlist"** ก่อน + wl sheet เปิด: wl-head "Wish List/Private" + 2 rows (Next buy, Grail goals) + "New collection" | MEMBER | High | L22790–22834 mirror save |
| FO-TC-SHT-068 | member: wl → กด "Next buy" | toast **"Added to Next buy"** + ปิด + wlCol=Next buy; เปิดใหม่ check อยู่ Next buy | MEMBER | High | |
| FO-TC-SHT-069 | member: กด wl-head "Wish List" ขณะ wishlisted | un-wishlist + toast **"Removed from your wish list"** + icon โล่ง | MEMBER | Medium | |
| FO-TC-SHT-070 | member: กด "Next buy" ซ้ำ | ย้ายกลับ "Wishlist" + toast "Removed from Next buy" | MEMBER | Medium | |
| FO-TC-SHT-071 | member: wl → New collection → สร้าง "Someday" | เข้า `WISHLISTS` + wishlisted+wlCol + toast "Added to Someday" | MEMBER | Medium | |
| FO-TC-SHT-072 | [GATE] guest กด 🎁 / member กด | guest → Member Sheet; member → auto-wishlist+sheet | GUEST/MEMBER | High | `.wl-btn` ใน GUEST_GATE_SEL |

### 2.7 New collection sheet (sheet-ซ้อน-sheet)

| TC ID | Steps | Expected | Actor | Priority | Note |
|---|---|---|---|---|---|
| FO-TC-SHT-073 | member: sv → New collection | nc sheet: หัว "Cancel / **New collection** / **Next**(disabled)" + input "Collection name" + counter "0 / 40" — ไม่มี preview (กรณีมาจาก save) | MEMBER | High | `ncSheetHTML` L15829 |
| FO-TC-SHT-074 | member: พิมพ์ "abc" | counter "3 / 40", ปุ่ม X (`.nc-x`) โผล่ (has-v), **Next เปิดใช้** | MEMBER | High | |
| FO-TC-SHT-075 | member: กด X → พิมพ์ยาว 45 ตัว | X ล้าง input + Next disable + focus กลับ; 45 ตัวถูก cap ที่ **40** (maxlength) counter "40 / 40" | MEMBER | Medium | |
| FO-TC-SHT-076 | member: พิมพ์ชื่อ → กด **Enter** (แทน Next) | สร้างเหมือนกด Next (input keydown → trigger) | MEMBER | Low | |
| FO-TC-SHT-077 | member: พิมพ์แต่ช่องว่าง "   " | Next ยัง disabled (trim check) | MEMBER | Medium | |
| FO-TC-SHT-078 | member: saved hub → กด "+" สร้าง collection ตรง (ไม่ผ่านโพสต์) | nc sheet → สร้าง → toast **"Collection created"** (ไม่ผูกโพสต์) + แถวใหม่ใน hub | MEMBER | Medium | `svd-plus` path; `nc-next` else-branch L22770+ |
| FO-TC-SHT-079 | member: savedcol → Manage → เลือกหลายใบ → Move → "+ New collection" | nc sheet มี **preview thumb โพสต์แรกที่เลือก** + ปุ่ม "Save" (ไม่ใช่ Next) → สร้าง+ย้าย + toast "Moved to X" / "Added to X" | MEMBER | Medium | `_ncSel` move flow L22749–22769 |
| FO-TC-SHT-080 | member: สร้าง collection ชื่อ "Grail list" ซ้ำ seed | **สร้างซ้ำได้** — ไม่มี dedupe check → มี "Grail list" สองแถวใน list *(quirk — คาด fail ถ้าต้องกันชื่อซ้ำ)* | MEMBER | Low | |

### 2.8 Watch alert sheet (entry เท่านั้น — flow เต็มอยู่ FO-TEST-11)

| TC ID | Steps | Expected | Actor | Priority | Note |
|---|---|---|---|---|---|
| FO-TC-SHT-081 | member: detail sale post (เช่น p1 Rolex) → กด 🔔 `.mf-btn` | wa sheet create mode: "Create watch alert" + "Give this watch alert a name" + `.wa-name` autofill (เช่น "Rolex Submariner · 126610LN" จาก waName) + 3 mode rows + "N now" ใต้แต่ละ + ปุ่ม "Create alert" — **ไม่มีปุ่มลบ** | MEMBER | High | L22252–22268; `waSheetHTML` L16530+ |
| FO-TC-SHT-082 | member: post เดิมที่มี alert ON อยู่แล้ว (modelKey ตรง) → กด 🔔 | **edit mode**: "Edit watch alert" + name/mode prefill + ปุ่ม "Save changes" + ปุ่ม **"Delete alert"** โผล่ | MEMBER | High | existing modelKey → draft มี id L22260 |
| FO-TC-SHT-083 | member: detail โพสต์ **showcase** (ไม่มี spec criteria — p3) → กด 🔔 | **sheet ไม่เปิด** — toast "No details on this post to watch" | MEMBER | Medium | L22264 guard |
| FO-TC-SHT-084 | member: search "rolex" (+ filter) → กด 🔔 `.sr-wa` บนผลลัพธ์ | wa sheet create mode criteria จาก search (Keyword+filters); ถ้า sig เดิมมีอยู่ → เปิด **edit** ตรง | MEMBER | High | L22354–22366 |
| FO-TC-SHT-085 | member: alerts → watch alerts sub → กด **Edit** บนแถว alert | wa sheet เปิด edit mode ของ alert นั้น | MEMBER | Medium | `.wa-badge` handler |
| FO-TC-SHT-086 | member: สร้าง draft จาก search ที่ **ไม่มี criteria** (search ว่าง + ไม่มี filter) → เปิด sheet | rows "Match any criteria"/"Model only" **disabled** (criteria ว่าง) เลือกได้แค่ "Match all criteria"; "N now" นับตาม alertMatchCount ต่อ mode | MEMBER | Medium | `waModesHTML` L16538+ disabled flag |
| FO-TC-SHT-087 | member: แก้ชื่อใน `.wa-name` → เลือก mode "Match any criteria" | radio `.on` ย้ายไป any + ชื่อที่แก้ไม่หาย (draft.name ถูกเก็บก่อน re-render) | MEMBER | Medium | `.wa-mode` saves name L22270+ |
| FO-TC-SHT-088 | member: Create alert / Save changes / Delete alert | Create → toast **"Watch alert on"** + ปิด + 🔔 เปลี่ยนเป็น on (modelFollowing sync); Save → "Watch alert updated"; Delete → "Watch alert removed" | MEMBER | High | `wa-go`/`wa-del` L22277–22310 |
| FO-TC-SHT-089 | member: Create alert ที่ criteria+mode เดิมมีอยู่แล้ว | **ไม่สร้างซ้ำ** — sheet เปิดกลับเป็น edit ของ alert เดิม + toast "You already saved this alert" | MEMBER | Medium | dedupe sig+matchMode L22298–22302 |
| FO-TC-SHT-090 | [GATE] guest กด 🔔 (detail/search) / member กด | guest → Member Sheet; member → sheet ตาม SHT-081/084 | GUEST/MEMBER | High | `.mf-btn`/`.sr-wa` ใน GUEST_GATE_SEL |

### 2.9 uf (Unfollow @X?) + mf (manage following) sheets

| TC ID | Steps | Expected | Actor | Priority | Note |
|---|---|---|---|---|---|
| FO-TC-SHT-091 | member: feed card post ที่ following=true → กด "Following" | uf sheet: "Unfollow @X?" + avatar + ปุ่ม **Unfollow** (danger) + **Cancel** | MEMBER | High | inline L22211–22250 |
| FO-TC-SHT-092 | member: uf → **Cancel** | sheet ปิด — ยัง following ไม่เปลี่ยน | MEMBER | Medium | |
| FO-TC-SHT-093 | member: uf → **Unfollow** | unfollow + sheet ปิด + toast "Unfollowed" + ปุ่มกลับ "Follow" บน surface เดิม | MEMBER | High | `uf-confirm` → setFollowing |
| FO-TC-SHT-094 | member: ps sheet (caption) ที่มี Follow/Following ใน ps-head → กด | ถ้า following → **uf swap ทับ ps ในก้อนเดียว** (ปุ่มยัง render ตอน following=false เท่านั้น แต่ follow-btn handler เรียก uf ถ้า state เปลี่ยน); action เสร็จ sheet ปิดหมด ไม่ย้อน ps | MEMBER | Medium | SHT-009 คู่กัน |
| FO-TC-SHT-095 | member: profile คนที่ follow อยู่ → กด "Following ⌄" (`.pf-foll`) | mf sheet เปิด: title = username + 3 แถว (Add to favorites / Mute / Unfollow) | MEMBER | High | `mfSheetHTML` L17083 |
| FO-TC-SHT-096 | member: mf → **Add to favorites** | label สลับเป็น **"Remove from favorites"** + icon ดาวเติม **inline** — sheet ไม่ปิด; กดซ้ำสลับกลับ | MEMBER | Medium | `mf-fav` L21720+ toggle label |
| FO-TC-SHT-097 | member: mf → **Mute** | openDlg "Mute X?" ซ้อนบน mf sheet → Confirm → toast "Muted"; Cancel → กลับ mf | MEMBER | Medium | dlg บน sheet อีกตัวอย่าง |
| FO-TC-SHT-098 | member: mf → **Unfollow** | **unfollow ทันทีไม่มียืนยัน** + sheet ปิด + renderSub — ต่างจาก follow-btn ที่ถาม uf ก่อน *(IG parity — บันทึกไว้)* | MEMBER | Medium | `mf-unf` L21805+ |

### 2.10 ps (caption+comments) / dt (tap for details) sheets

| TC ID | Steps | Expected | Actor | Priority | Note |
|---|---|---|---|---|---|
| FO-TC-SHT-099 | member: pv-post → แตะ "…" (`.more-link` ใน caption) | **ps sheet เปิด** — ต่างจาก feed card ที่ more-link ขยาย caption inline; ใน viewer "…" คือเปิด sheet | MEMBER | High | L23062–23072 `.pv-post` branch |
| FO-TC-SHT-100 | member: อ่าน ps sheet | `.ps-head` (avatar+seller+ปุ่ม Follow เฉพาะตอนไม่ follow) → caption เต็ม → `.ps-time` → comment rows → comment-input "Add a comment for X" (hardcode EN แม้ภาษาไทย) — ไม่มี title bar | MEMBER | Medium | `pvPostSheetHTML` L14760 |
| FO-TC-SHT-101 | member: ใน ps sheet — กด ♡ comment / long-press row | **interactive เหมือน comments sheet** (c-like + popover ทำงานเพราะแถวเป็น `.c-row` ใน `.comment-sheet` เดียวกัน) | MEMBER | Medium | shared selectors |
| FO-TC-SHT-102 | member: pv-post โพสต์ sale → "Tap for details" | dt sheet: price row + spec groups **ยกเว้น** "Price & Data Source" + ลิงก์ "View full detail ›" ท้าย list | MEMBER | High | `pvDetailsSheetHTML` L14782; detailsHTML dStyle=rows |
| FO-TC-SHT-103 | member: dt → "View full detail ›" | `details-open` ถูกลบ + `openPostDetail` — detail สไลด์บน pv; back กลับ viewer ไม่ใช่ sheet | MEMBER | Medium | L14785+ |

### 2.11 blk sheet (block from comment popover)

| TC ID | Steps | Expected | Actor | Priority | Note |
|---|---|---|---|---|---|
| FO-TC-SHT-104 | member: popover → Block → อ่าน blk sheet | avatar+name + "Block X?" + คำอธิบาย + **3 impact rows** (เช่น "They won't be able to find your profile…", "They won't be able to message you…", "They won't know you blocked them") + ปุ่ม **Block** + **Block and report** | MEMBER | Medium | `blkSheetHTML` L17006 |
| FO-TC-SHT-105 | member: blk → Block (comments path) — เช็กผล feed ด้วย | comments reopen กรอง author + toast "Blocked and hidden comments"; feed หลัง refresh ไม่มีโพสต์ author นั้น (pfIsBlocked กรองทั้งระบบ) | MEMBER | High | |
| FO-TC-SHT-106 | member: unblock ผ่าน settings แล้วเปิด comments เดิม | comment ของ author กลับมาเห็นครบ | MEMBER | Low | |

### 2.12 Guest matrix / i18n / theme / integration

| TC ID | Steps | Expected | Actor | Priority | Note |
|---|---|---|---|---|---|
| FO-TC-SHT-107 | guest: ลอง 6 gated entries ทีละอัน — share-btn / save-btn / wl-btn / mf-btn / lk-follow / c-like | ทุกอัน → **Member Sheet "Join TukDaeng"** เดียวกัน — sheet ปลายทางไม่เปิดเลย | GUEST | High | GUEST_GATE_SEL L23461 |
| FO-TC-SHT-108 | guest: Member Sheet ขึ้น → ปิด (scrim/ข้าม) | กลับ surface เดิม — ไม่มี action เกิดขึ้น, ไม่มี sheet ค้าง | GUEST | Medium | |
| FO-TC-SHT-109 | TH: เปิด comments / likes / uf / mf / wa | "Comments"→"ความคิดเห็น", "Reply"→"ตอบกลับ", "Add a comment"→"เพิ่มความคิดเห็น…", "Likes"→"ยอดถูกใจ", uf/mf/wa localize ครบ | MEMBER | Medium | i18n data-t ทั่ว sheet |
| FO-TC-SHT-110 | TH: เปิด save/wishlist/nc/blk/ps input / share apps | **hardcode EN หลายจุด**: "Saved"/"Private"/"Collections"/"New collection", nc ทั้ง sheet ("Cancel/New collection/Next/Collection name"), blk ทั้ง sheet, ps input "Add a comment for X", app names *(i18n gap — บันทึก)* | MEMBER | Low | saveSheetHTML/ncSheetHTML/blkSheetHTML ไม่ใส่ data-t |
| FO-TC-SHT-111 | dark theme: เปิด comments + sv + wa | sheet bg/border/foreground ตาม dark tokens; backdrop dim ถูก; toast อ่านได้ | MEMBER | Low | |
| FO-TC-SHT-112 | member: save p3 ลง "Vintage picks" → เปิด Saved hub → เข้า savedcol | tile/row นับเพิ่ม; post อยู่ใน "Vintage picks" (savedCol) — **single-collection ยืนยันอีกครั้งจากฝั่ง collection viewer** | MEMBER | Medium | integration กับ FO-TEST-14 (Library) |
| FO-TC-SHT-113 | member: delete comment ใน sheet → ออกไปดู feed card + detail โพสต์เดิม | `.comment-count` ลดตาม (icon บน card + counts บน detail sync จาก `p.comments`) | MEMBER | Medium | `deleteComment` update L13873+ |
| FO-TC-SHT-114 | member: เปิด likes/comments บน **watch-alert solo viewer** (post ที่ inject จาก wa — FO-TEST-06 PV-039 note) | sheet เปิดเหนือ pfp viewer ได้ปกติ (comment-btn ให้ `nt` เพราะ pv-open); pm ⋯ บน injected card ยังเป็น reportOnly ตาม finding เดิม | MEMBER | Low | continue FO-TEST-06 finding |
| FO-TC-SHT-115 | member: เปิด comments sheet บน pv → ปิด pv (pv-back) ระหว่าง sheet ยังเปิดไม่ได้ — แตะ backdrop ก่อนแล้วค่อย back | backdrop บังปุ่ม pv-back → ต้องปิด sheet ก่อนถึง back ได้ (no path ที่ sheet ค้างหลัง viewer ปิด) | MEMBER | Low | ป้องกัน sheet กำพร้า |

## 3. Traceability audit — sheets vs inventory §2

| Inventory row | TC ที่ครอบ |
|---|---|
| Comments bottom sheet (open/rows/reply/popover/delete) | SHT-013..041 |
| Likes sheet | SHT-042..048 |
| Share sheet | SHT-049..055 |
| Save/Collections sheet | SHT-056..066 |
| Wishlist sheet | SHT-067..072 |
| New collection sheet (nested) | SHT-064,065,071,073..080 |
| Watch alert sheet (entry+mechanics) | SHT-081..090 |
| Unfollow confirm sheet (uf) | SHT-009,091..094 |
| Manage following sheet (mf) | SHT-095..098 |
| Caption sheet (ps) / details sheet (dt) | SHT-099..103 |
| Block sheet + unblock dlg | SHT-033..036,104..106 |
| Sheet mechanics (backdrop/handle/swap/dlg/toast/z-order) | SHT-001..012 |
| Guest gate → Member Sheet | SHT-028,041,046,053,063,072,090,107,108 |
| i18n + dark + integration | SHT-109..115 |

## 4. Gaps / quirks ที่พบในระหว่างออกแบบ (ยืนยันกับทีมก่อน file bug)

- **GAP-SHT-01 (dead zone สำคัญ):** member แตะ comment-input / emoji / "Reply" → toast "Not in this prototype yet" — ทั้งที่มี emoji→comment handler (L22967) แต่ dead check (L22148) มาก่อน → **ส่ง comment/reply ทำไม่ได้เลยใน prototype**
- **GAP-SHT-02:** reply ซ้อนไม่ได้ — render แค่ 1 ชั้นและไม่มี affordance สร้าง reply เลย (กติกาบังคับ SHT-018/020 ผ่านแน่)
- **GAP-SHT-03:** c-like ♥ เป็น DOM toggle — ปิด/เปิด sheet ใหม่ count กลับ seed (ไม่ persist)
- **GAP-SHT-04:** lk-follow "Follow→Following" local only — ไม่ sync `following` state, profile ไม่เปลี่ยน, reopen กลับเดิม
- **GAP-SHT-05:** `likedBy=null` (post materialize จาก profile grid) → pv rail "Likes" กดแล้ว TypeError เงียบ sheet ไม่เปิด; own composer post กลับมี `likedBy` seed ตายตัว (likes=0 แต่มีคนใน list)
- **GAP-SHT-06:** savedCol/wlCol = **single-collection** — ย้าย collection คือ replace ไม่ใช่ add (ไม่มี multi-collection ให้เทสเชิงบวก)
- **GAP-SHT-07:** nc ไม่กันชื่อซ้ำ — สร้าง "Grail list" ซ้ำ seed ได้
- **GAP-SHT-08:** ไม่มี ESC handler; backdrop tap ปิด **ทั้ง dlg+sheet** พร้อมกัน (ไม่ใช่ทีละชั้น)
- **GAP-SHT-09:** uf swap ทับ ps → Cancel/Unfollow ปิดทั้งก้อน ไม่ย้อน caption sheet
- **GAP-SHT-10:** comment-btn เปิด sheet โดยไม่ลบ class `wl-open/wa-open/mf-open/save-open` ออกจาก remove-list บางตัว → swap เร็วอาจเหลือ class ค้าง (race เล็ก)
- **GAP-SHT-11:** i18n gap — sv/wl/nc/blk/ps-input เป็นภาษาอังกฤษ hardcode แม้ UI ไทย
- **ต่อจาก FO-TEST-06:** GAP-07 (`pv-add` บน noComments เปิด sheet ได้) → SHT-038 ยืนยันว่า sheet ภายในทำงานปกติ; PV-039 (wa solo viewer) → SHT-114 sheet เปิดบน injected card ได้; `pm-rp` variant + `sort-open` เป็น dead code ไม่มี trigger
- **Open-code-only ที่ยังไม่ได้เทส (FO-TEST-11/15/16 จัดการ):** watch-alert criteria derivation/match counting/alert firing; report flow หลัง entry; savedcol manage/select/move ละเอียด (มี SHT-079 แค่ entry-level)
