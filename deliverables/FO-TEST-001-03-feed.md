# FO-TEST-03 — Test Cases: Feed & Post Cards (FO prototype)

> Task: FO-TEST-03 ของชุด FO-TEST-001 · วันที่: 2026-10-27
> กติกาหลัก: `deliverables/FO-TEST-001-testcase-prompt.md` · Task breakdown: `deliverables/FO-TEST-001-task-breakdown.md`
> Source of Truth: `Prototypes/fo-flow/index.html` (postCard ~L14302–14377, feed filter ~L14389–14393, carousel ~L20068–20270 + ~L23016–23028, clip autoplay ~L15958–15986, details toggle ~L23030–23051, post menu ~L14191–14229 + handler ~L20802–20973, follow ~L14422–14450 + ~L22211–22250, like ~L23086–23103, comment/likes/share/save sheets ~L13889–14000 + ~L22367–22420 + ~L22843–22887, Ask ~L19551–19556 + chatQuickAsk ~L19188–19207, ni/uncomf cards ~L14260–14289, gate ~L23461–23475 + ~L20494)
> สัญญาความครอบคลุม: `deliverables/FO-TEST-001-00-inventory.md` §2.2 — ไม่เดา behavior เพิ่ม

## 0. วิธีใช้เอกสาร + สภาพแวดล้อม

- เปิด prototype ที่ `http://localhost:8901/index.html` (หรือเปิดไฟล์ตรง) — Viewport 440×956, ทดสอบทั้ง Light/Dark และ TH/EN ตามที่ระบุในเคส
- **Actor**: `GUEST` = session guest · `MEMBER` = demo `demo@tukdaeng.com` / `Tukdaeng123` · `NEW` = สมัครใหม่ (member powers แต่ข้อมูลว่าง — follow 0 คน) · `OWNER` = member ที่มีโพสต์ของตัวเองบน feed (สร้างผ่านปุ่ม `+` หรือ seed `fo_newpost` — ดู SETUP-09/10)
- **Type**: UI = การแสดงผล · Func = การทำงาน · Int = เชื่อมข้าม module · Edge = negative/boundary
- **Priority**: High = core flow/กติการะบบ · Medium = feature หลัก · Low = edge/cosmetic
- **[GATE]**: guest แตะ action ใน `GUEST_GATE_SEL` → `obGate()` = Member Sheet "Join TukDaeng" + ข้อความ "Sign in or create a free account to use this feature." + ปุ่ม Sign up / Sign in / Skip for now — ทุกเคส [GATE] มีคู่ guest/member ครบ (sheet mechanics อยู่ FO-TEST-01, เมทริกซ์ทั้งแอปอยู่ FO-TEST-17)
- **Variant เริ่มต้น** `data-variant="a1"` + `state.ask="outline"` + `tStyle="t3"` + `dStyle="d2"` — variant อื่น (a2/b2/c2/a3/b3/c3, mixed, ask styles) เป็น dev harness → ไม่เขียน TC production
- **Feed mock data (POSTS, 11 การ์ด ตามลำดับ)**: p1 Watch 777 (sale, 3 รูป, THB 420,000) · p7 wrist.story (showcase, follow แล้ว) · p2 the watch (sale, 1 รูป, THB 145,000, follow แล้ว) · p8 dial.dude (showcase, 1 รูป) · p4 davikah (sale, 2 รูป, THB 380,000) · p9 nat_collection (showcase) · p5 watch.daily (sale, 2 รูป, THB 890,000) · p10 slow.hand (showcase, 2 รูป, follow แล้ว) · p6 neng_mua (sale, 1 รูป, THB 165,000) · p11 gmt.bkk (showcase) · p3 chrono.th (showcase) — ไม่มีโพสต์ของตัวเอง / ไม่มี clip ใน mock เริ่มต้น
- **เรื่องเงิน** อ้าง `docs/money-display-rules.md` (DRAFT v0.1): ราคา feed เป็น literal string จาก mock (เช่น `"THB 380,000"`); `1.2K` ใน views-stat คือ **จำนวน view ไม่ใช่เงิน** ห้ามตีความเป็นสกุลเงิน
- **สิ่งที่อยู่นอก scope** (มีเคสใน task อื่น — ห้ามทำซ้ำ): feed tabs/seg-thumb/empty ต่อ tab (FO-TEST-02 SHELL-035–041), scroll-to-hide (SHELL-042–048), Post Viewer ทุก mode + Post Detail internals (FO-TEST-06), internals ของ comments/likes/share/save sheet (FO-TEST-07 — ที่นี่เช็คแค่ entry + เนื้อหาระดับผิว), chatroom internals (FO-TEST-08), report stack internals (FO-TEST-16), composer (FO-TEST-05), settings/prefs internals (FO-TEST-15)

## 1. Coverage Map ของ task นี้ (เทียบ inventory §2.2)

| Route/Feature (inventory §2.2) | TC ID ที่ครอบ |
|---|---|
| feed shell — tabs/seg-thumb/brand-menu/empty ต่อ tab | FO-TEST-02 (SHELL-035–041) — ยกเว้น snooze filter → FEED-073–075 |
| post card — head/photo/actions/liked-by/caption/details-toggle | FEED-001 – 008, 020 – 026 |
| post card — clip posts `[OPEN-CODE-ONLY]` | FEED-017 – 019 |
| post card — details inline + "View full detail" entry | FEED-020 – 026 |
| action `follow` `[GATE]` + uf sheet entry | FEED-027 – 031 |
| action `like` `[GATE]` | FEED-032 – 034 |
| action `save` (sv sheet) `[GATE]` | FEED-035 – 039 |
| action `share` (sh sheet) `[GATE]` | FEED-040 – 042 |
| action `comment` | FEED-043 – 046 |
| action `Ask` pill `[GATE]` | FEED-047 – 050 |
| action `liked-by` (lk sheet) `[OPEN-CODE-ONLY]` | FEED-051 – 053 |
| post menu — คนอื่น (pm) | FEED-054 – 059 |
| post menu — ของตัวเอง (pm-own) | FEED-060 – 067 |
| feedback card `ni-card` `[OPEN-CODE-ONLY]` | FEED-068 – 070, 072 |
| feedback card `uncomf` `[OPEN-CODE-ONLY]` | FEED-071 |
| overlay `detail-open` / `pv-open` / sheet `ps`/`dt`/`mf` | FO-TEST-06/07/12 — ที่นี่เช็คเฉพาะ entry (FEED-025/026) + negative pv (FEED-011/012) |
| tag click `igd-tag` `[OPEN-CODE-ONLY]` + avatar/name → profile | FEED-076 – 078 |
| state flags (archived/ni/muted/blocked/favorite/pinned/noComments) | รวมในเคสที่เกี่ยว (057, 060–070) |
| filter → feed ว่าง (snooze) | FEED-073 – 075 |
| i18n / theme / money display spot-check | FEED-079 – 082 (sweep เต็ม → FO-TEST-19) |

## 2. Test Cases

### 2.1 Post Card — Anatomy & Feed Content

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
|---|---|---|---|---|---|---|---|---|---|
| FO-TC-FEED-001 | Sale card anatomy (variant a1) | MEMBER | UI | member อยู่ feed แท็บ All | 1. เลื่อนหาการ์ด p4 (davikah · Rolex Datejust) 2. ตรวจทุกส่วนบนการ์ด | — | head: avatar ring + "davikah" + ปุ่ม "Follow" + ปุ่ม ⋯ (ไม่มี sub-line เพราะไม่มี location); รูป + counter "1/2" + dots 2 จุด; actions: ♡ + 💬(เลข 2) + 👁 "980" + share + ปุ่ม "Ask" (outline) + bookmark; แถว "Liked by Watch 777 and others"; caption + "more"; "2 days ago"; **ไม่มีราคา/ไม่มีป้าย FOR SALE/ไม่มี "Tap for details" จนกว่าจะกด more** | High | |
| FO-TC-FEED-002 | Showcase card anatomy | MEMBER | UI | อยู่ feed | 1. เลื่อนหาการ์ด p8 (dial.dude) | — | head เหมือน sale; รูปเดียว (ไม่มี counter/dots); actions เหมือนกันรวมถึงปุ่ม "Ask"; liked-by "Liked by Watch 777 and others"; caption + "more"; "11 hours ago"; **ไม่มี details toggle แม้หลัง expand caption** (hasDetails=false) | High | |
| FO-TC-FEED-003 | การ์ดของ seller ที่ follow แล้ว | MEMBER | UI | อยู่ feed | 1. ดูการ์ด p7 (wrist.story) / p2 (the watch) | — | ไม่มีปุ่ม Follow บน head (following=true → render ไม่ออกมา) — ต่างจาก p1/p8 ที่มี | Medium | |
| FO-TC-FEED-004 | Feed order + ขอบลิสต์ | MEMBER | Func | member อยู่ feed บนสุด | 1. ดูการ์ดแรกสุด 2. เลื่อนลงจนสุดท้าย 3. เลื่อนต่ออีก | การ์ดแรก = p1 (Watch 777, Rolex Submariner, 3 รูป); สุดท้าย = p3 (chrono.th); รวม 11 การ์ด; ไม่มี infinite scroll/load-more; ไม่มี pull-to-refresh — ดึงลงที่บนสุดไม่เกิดอะไร | จบลิสต์ที่ p3 แล้วตัดจบ (ไม่มี skeleton/spinner) | Medium | |
| FO-TC-FEED-005 | views-stat ≠ เงิน | MEMBER | UI | อยู่ feed | 1. ดูไอคอน 👁 ในแถว actions ของ p1 ("1.2K") และ p4 ("980") | — | แสดงค่า literal จาก mock เช่น "1.2K" / "980" — เป็นจำนวน view ไม่ใช่สกุลเงิน ไม่มี "THB" ไม่มี comma format (อ้าง money-display-rules §views) | Medium | |
| FO-TC-FEED-006 | การ์ดบน guest | GUEST | UI | guest อยู่ feed | 1. ดูการ์ด p4 เทียบกับ member | render เหมือน member ทุกส่วน (รวม Follow + Ask + bookmark) — gate อยู่ที่ "ตอนแตะ" ไม่ใช่ตอน render | เหมือน FEED-001 | Medium | |
| FO-TC-FEED-007 | post-time แปลไทย | MEMBER | UI | lang=TH (Settings → Language → ไทย) | 1. ดูเวลาใต้ caption ของ p1/p8 | `formatPostTime` แปล "3 days ago"→"3 วันที่แล้ว", "11 hours ago"→"11 ชั่วโมงที่แล้ว" | ตัวหนังสือไทยตาม map | Medium | |
| FO-TC-FEED-008 | caption short + hashtag | MEMBER | UI | อยู่ feed | 1. ดู caption ของ p1 ก่อนกด more 2. กด "more" | cap-short = บรรทัดแรก "Rolex Submariner Date · Ref. 126610LN" + " more"; กด more → cap-full เปลี่ยน \n เป็นบรรทัดจริง + hashtag `#Rolex #Submariner #TukDaeng` เป็นสีลิงก์ (.igd-tag) | hashtag เป็นสี accent กดได้ | Medium | |

### 2.2 Media Carousel ในการ์ด (กติกาบังคับ: ไม่เปิด Post Viewer)

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
|---|---|---|---|---|---|---|---|---|---|
| FO-TC-FEED-009 | ตัวบอกรูปหลายใบ | MEMBER | UI | อยู่ feed | 1. ดู p1 (3 รูป), p4 (2 รูป), p8 (1 รูป) | — | p1: counter "1/3" มุมขวาบนของรูป + dots 3 จุดใต้รูป (จุดแรก on); p4: "1/2" + 2 จุด; p8: ไม่มีทั้ง counter/dots | High | |
| FO-TC-FEED-010 | tap ซ้าย/ขวาครึ่งรูป | MEMBER | Func | อยู่ feed ที่ p1 | 1. แตะครึ่งขวาของรูป 2. แตะครึ่งขวาอีก 3. แตะครึ่งขวาอีก (ครบรอบ) 4. แตะครึ่งซ้าย | ตำแหน่งแตะ > ครึ่งความกว้าง → next; ≤ → prev; index วน `(i±1) mod 3` — รูปเปลี่ยนเฉพาะในการ์ดเดิม | counter 1/3→2/3→3/3→1/3→3/3; dot on ย้ายตาม | High | |
| FO-TC-FEED-011 | **กติกาบังคับ — tap media ไม่เปิด Post Viewer** | MEMBER | Func | อยู่ feed ที่ p1 | 1. แตะรูปหลายครั้งทั้งซ้าย/ขวา 2. แตะรูปของ p8 (รูปเดียว) ด้วย | `.screen` **ไม่ได้** `pv-open` เลย; `.page-pv` ว่าง; เกิดแค่ `applyPhoto` ในการ์ดเดิม (multi-photo) หรือไม่เกิดอะไร (single photo `photos.length<2` → return) | ไม่มี immersive viewer/ไม่มีหน้าใหม่เด้ง — การ์ดอยู่ที่เดิม | High | |
| FO-TC-FEED-012 | **กติกาบังคับ — drag media ไม่เปิด Post Viewer** | MEMBER | Func | อยู่ feed ที่ p4 | 1. ลากรูปไปซ้ายเกิน ~64px แล้วปล่อย 2. ลากซ้ำอีกครั้ง | swipe ผ่าน threshold `min(64, w*0.2)` → slide เปลี่ยน; `suppressPhotoClick` กัน click หลังปล่อย → ไม่มี viewer เปิด | counter 1/2→2/2; viewer ไม่เปิดทั้งสองครั้ง | High | |
| FO-TC-FEED-013 | swipe ไม่ถึง threshold | MEMBER | Edge | อยู่ feed ที่ p1 | 1. ลากรูปซ้ายนิด ๆ (<64px) แล้วปล่อย | รูปตามนิ้วระหว่างลาก (`translateX(dx)` ไม่มี transition); ปล่อย → transition .22s สแนปกลับ index เดิม | รูปเด้งกลับ 1/3 | Medium | |
| FO-TC-FEED-014 | rubber-band ต้น/ท้าย | MEMBER | Edge | อยู่ feed ที่ p1 slide 1/3 | 1. ลากรูปไปขวา (ออกนอกขอบแรก) 2. ไป slide 3/3 แล้วลากซ้าย | `eff *= 0.35` ที่ขอบ → รูปขยับตามนิดเดียว; ปล่อย → สแนปกลับ ไม่ wrap | index ไม่เปลี่ยน | Low | |
| FO-TC-FEED-015 | รูปเดียว — tap/swipe ไม่ทำอะไร | MEMBER | Edge | อยู่ feed ที่ p8 | 1. แตะรูปซ้าย/ขวา 2. ลากซ้ายขวา | `photos.length<2` → pointerdown return + click guard → ไม่เปลี่ยนรูป ไม่เปิด viewer | การ์ดนิ่ง | Medium | |
| FO-TC-FEED-016 | gesture แนวตั้งชนะ | MEMBER | Edge | อยู่ feed ที่ p1 | 1. กดรูปค้างแล้วลากแนวตั้ง (เหมือนจะเลื่อนฟีด) | `|dy| > |dx|+4` → swipe=null → รูปไม่ translate; feed-scroll เลื่อนปกติ | รูปไม่ลากตาม ฟีดเลื่อน | Medium | |

### 2.3 Clip Posts `[OPEN-CODE-ONLY]` — mock POSTS ไม่มี clip; ต้องสร้างเอง (SETUP-10)

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
|---|---|---|---|---|---|---|---|---|---|
| FO-TC-FEED-017 | clip card UI | MEMBER | UI | โพสต์ clip อยู่บน feed (SETUP-10) | 1. ดูการ์ด clip | `clipState.has` → `.post-photo.clip-ph` + `data-dur` | badge ▶"0:12" มุมรูป + แถบ `.prog` ใต้รูป; counter/dots ตามจำนวนรูป | Medium | |
| FO-TC-FEED-018 | clip autoplay ≥55% | MEMBER | Func | การ์ด clip บน feed | 1. เลื่อนให้การ์ดเข้าเฟรม 2. เลื่อนผ่านจนเห็น <55% 3. เลื่อนกลับ | `feedClipTick` (100ms): ≥55% visible → `playing` + `rem` นับถอยหลัง + bar เดิน; <55% → pause (rem คงที่); กลับมา → เล่นต่อจากจุดเดิม; rem≤0 → วนกลับ total | badge นับวินาทีลง + แถบ progress ขยับ; หยุด/ต่อตามมุมมอง | Medium | |
| FO-TC-FEED-019 | clip ถูกบัง / slide อื่น | MEMBER | Edge | การ์ด clip บน feed (มี ≥2 media: clip+photo) | 1. เปิดหน้า sub (เช่น แตะ avatar → profile) ทับ feed 2. back กลับ 3. swipe ไป slide รูปถ่าย | `sub-open` → clip ใน feed pause (feed media เล่นเฉพาะตอนไม่ถูกบัง); back → resume; `phClipSet` อัปเดต badge ต่อ slide — slide ที่ไม่ใช่ clip → badge ซ่อน | pause/resume ตาม overlay; badge ตาม slide | Low | |

### 2.4 Details Inline ("Tap for details")

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
|---|---|---|---|---|---|---|---|---|---|
| FO-TC-FEED-020 | more → เผย toggle | MEMBER | Func | อยู่ feed ที่ p4 | 1. แตะ "more" ใน caption | caption ได้ `.expanded` → cap-short ซ่อน cap-full แสดง + `.details-toggle` ที่เคย `display:none` โผล่ (CSS rule L1091) | ปุ่ม "Tap for details ⌄" เส้นบรรจบสองข้าง (t3) โผล่ใต้เวลา | High | |
| FO-TC-FEED-021 | เปิด details block | MEMBER | Func | caption p4 expand แล้ว | 1. แตะ "Tap for details" | toggle ได้ `.open` + `.details-body` เปิด (max-height) + label เปลี่ยน "Hide details" | กล่อง spec: บรรทัดแรก = ราคา "THB 380,000" แดง + "View full detail ›"; ตามด้วยกลุ่ม "Watch Specifications" + "Item Details" แบบ label:value rows (d2); **กลุ่ม "Price & Data Source" ถูกกรองออก** (detailsHTML filter) | High | |
| FO-TC-FEED-022 | ปิด details + single-open | MEMBER | Func | details ของ p4 เปิดอยู่ | 1. แตะ "Hide details" → ปิด 2. เปิด details ของ p4 แล้วไปเปิดของ p5 | toggle ซ้ำ → body หุบ label กลับ "Tap for details"; เปิดการ์ดใหม่ → การ์ดเดิมปิดอัตโนมัติ (loop ปิด `.details-toggle.open` อื่นทั้งจอ) | มี details เปิดได้ทีละการ์ดเดียวทั้ง feed | Medium | |
| FO-TC-FEED-023 | แตะ caption ที่ expand → ยุบทั้งคู่ | MEMBER | Func | p4: caption expanded + details เปิด | 1. แตะ caption (พื้นข้อความ ไม่ใช่ hashtag/ปุ่ม) | `.caption.expanded` → ลบ expanded → toggle+body ปิดตาม กลับสภาพเดิม | cap-full ซ่อน cap-short กลับ; details หาย | Medium | |
| FO-TC-FEED-024 | showcase ไม่มี toggle | MEMBER | Func | อยู่ feed ที่ p8 | 1. แตะ "more" ของ p8 | caption ขยายตามปกติ แต่ `hasDetails=false` → ไม่ render `.details-toggle` เลย | ไม่มี "Tap for details" | Medium | |
| FO-TC-FEED-025 | "View full detail" → Post Detail | MEMBER | Func | details ของ p4 เปิด | 1. แตะ "View full detail ›" | `openPostDetail` → `.screen` ได้ `detail-open` — หน้า detail ทับ feed | detail page เต็มจอ (hero+specs); `detail-back` ปิดกลับ feed ที่เดิม | High | |
| FO-TC-FEED-026 | entry เดียวกันบน guest | GUEST | Func | guest อยู่ feed ที่ p4, expand+เปิด details | 1. แตะ "View full detail" | `view-full` ไม่อยู่ใน gate → detail เปิดได้ฟรี | เหมือน FEED-025 | Medium | |

### 2.5 Follow Seller `[GATE]`

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
|---|---|---|---|---|---|---|---|---|---|
| FO-TC-FEED-027 | Follow — guest [GATE] | GUEST | Func | guest อยู่ feed ที่ p8 | 1. แตะ "Follow" บน head การ์ด 2. แตะ scrim/Skip for now | `.follow-btn` ∈ gate → Member Sheet เด้ง; ไม่มีการ follow | sheet "Join TukDaeng" ทับ feed; ปิดแล้วปุ่มยัง "Follow" | High | |
| FO-TC-FEED-028 | Follow — member | MEMBER | Func | อยู่ feed ที่ p8 (dial.dude ยังไม่ follow) | 1. แตะ "Follow" | `setFollowing(seller,true)` → ปุ่ม flip เป็น "Following" ใน place (ไม่ re-render บนแท็บ all); `p.following=true` | ปุ่มเปลี่ยน label/สไตล์เป็น Following | High | |
| FO-TC-FEED-029 | Follow → เข้าแท็บ Following | MEMBER | Int | follow dial.dude แล้ว | 1. แตะแท็บ "Following" | feed กรอง `p.following` → การ์ด p8 โผล่ร่วมกับ p7/p2/p10 | Following tab มี 4 การ์ด | Medium | |
| FO-TC-FEED-030 | Unfollow ผ่านปุ่ม "Following" + uf sheet | MEMBER | Func | follow dial.dude แล้ว อยู่หน้าการ์ด | 1. แตะ "Following" 2. sheet เด้ง → แตะ "Unfollow" | แตะ → uf sheet "Unfollow @dial.dude?" + Unfollow/Cancel; ยืนยัน → `setFollowing(false)` → toast "Unfollowed" + (all tab ไม่ re-render แต่ปุ่ม flip กลับ); Cancel → ไม่เปลี่ยน | toast ลอย ~1.8s; ปุ่มกลับ "Follow" | High | |
| FO-TC-FEED-031 | Unfollow ล้าง favorite+mute | MEMBER | Edge | follow+fav dial.dude แล้ว (⋯ → Add to favorites) | 1. แตะ "Following" → "Unfollow" 2. เปิดแท็บ Favorites + ⋯ เมนูการ์ด p8 | `setFollowing(off)` ล้าง `favorite`+`muted` ด้วย → ออกจาก Favorites list; เมนู ⋯ กลับไม่มีแถว favorites (canFav=false) | Favorites tab = empty state; เมนูเหลือ NI/Report | Medium | |

### 2.6 Like `[GATE]`

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
|---|---|---|---|---|---|---|---|---|---|
| FO-TC-FEED-032 | Like — guest [GATE] | GUEST | Func | guest อยู่ feed ที่ p4 | 1. แตะ ♡ | `.like-btn` ∈ gate → Member Sheet; `liked` ไม่เปลี่ยน | sheet เด้ง; หัวใจยังโบก | High | |
| FO-TC-FEED-033 | Like — member toggle | MEMBER | Func | อยู่ feed ที่ p4 | 1. แตะ ♡ 2. แตะ ♡ ซ้ำ | `post.liked` toggle + `likes ±1`; ซิงก์ทุก `.like-btn` ของ pid เดียวกัน (เช่นถ้า detail เปิดอยู่); บนการ์ดคนอื่นไม่มีตัวเลขกำกับ | หัวใจเติมสี (`.liked`) ↔ โบก; liked-by แถวไม่เปลี่ยน | High | |
| FO-TC-FEED-034 | like ค้างข้าม surface | MEMBER | Int | like p4 แล้ว | 1. เปิด detail (more → Tap for details → View full detail) 2. ดู ♡ บน detail 3. back กลับ | `p.liked` persist → detail render heart liked; unlike บน detail → การ์ดบน feed ซิงก์กลับ (querySelectorAll .like-btn) | สถานะหัวใจตรงกันทั้งสองชั้น | Medium | |

### 2.7 Comment

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
|---|---|---|---|---|---|---|---|---|---|
| FO-TC-FEED-035 | เลขบนไอคอน comment | MEMBER | UI | อยู่ feed | 1. ดู 💬 ของ p4 (comments=2) เทียบโพสต์ที่ comments=0 (โพสต์ตัวเอง SETUP-09) | — | มีเลขต่อท้ายไอคอนเมื่อ `comments>0`; เป็น 0 → ไอคอนล้วน | Low | |
| FO-TC-FEED-036 | เปิด comments sheet — member | MEMBER | Func | อยู่ feed ที่ p4 | 1. แตะ 💬 | `commentsHTML(post)` ใน sheet singleton + `comments-open` | sheet "Comments": รายการ seeded จาก LIKER_POOL + commentPreview เป็นแถวแรก, emoji row ❤️🙌🔥…, input "Add a comment..." | High | |
| FO-TC-FEED-037 | comments sheet — guest อ่านได้ แตะเขียนไม่ได้ | GUEST | Func | guest อยู่ feed ที่ p4 | 1. แตะ 💬 → sheet เปิด 2. แตะ "Add a comment..." 3. ปิด sheet 4. เปิดใหม่แล้วแตะ emoji row / ♡ ข้าง comment / "Reply" | `.comment-btn` **ไม่อยู่ใน gate** → sheet เปิดฟรี; แต่ `.comment-input`, `.emoji-row`, `.c-like`, `.c-meta` ∈ gate → Member Sheet เด้งแทนทุกตัว | อ่านคอมเมนต์ได้; ทุก input control → "Join TukDaeng" | High | |
| FO-TC-FEED-038 | comment sheet ว่าง | OWNER | Edge | โพสต์ตัวเองบน feed (comments=0) — SETUP-09 | 1. แตะ 💬 การ์ดตัวเอง | `commentsFor` คืน [] → fallback copy | "No comments yet / ยังไม่มีความคิดเห็น" | Low | |

### 2.8 Share `[GATE]`

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
|---|---|---|---|---|---|---|---|---|---|
| FO-TC-FEED-039 | Share — guest [GATE] | GUEST | Func | guest อยู่ feed | 1. แตะไอคอน share (↗) ใต้รูป | `.share-btn` ∈ gate → Member Sheet | sheet เด้ง; share sheet ไม่เปิด | High | |
| FO-TC-FEED-040 | share sheet layout — member | MEMBER | Func | อยู่ feed ที่ p4 | 1. แตะ share | `shareSheetHTML()` + `share-open` | sheet: ช่องค้นหา "Search", grid เพื่อน (FRIENDS 11 คน), แถวแอป Messenger / Direct / LINE / Facebook / "Copy link" (ปุ่มเทา) | Medium | |
| FO-TC-FEED-041 | ส่งให้เพื่อน / แอป / copy | MEMBER | Func | share sheet เปิด | 1. แตะเพื่อน (เช่น chrono.th) → เปิดใหม่ → แตะ "LINE" → เปิดใหม่ → แตะ "Copy link" | `.sh-fr` → ปิด sheet + toast "Sent to chrono.th"; `.sh-app` → ปิด + toast "Shared to LINE"; copy → toast "Link copied" | toast ~1.8s ลอยล่างจอ | Medium | |

### 2.9 Save `[GATE]` (sv sheet)

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
|---|---|---|---|---|---|---|---|---|---|
| FO-TC-FEED-042 | Save — guest [GATE] | GUEST | Func | guest อยู่ feed | 1. แตะ bookmark 🔖 | `.save-btn` ∈ gate → Member Sheet | sheet เด้ง | High | |
| FO-TC-FEED-043 | save โพสต์ที่ยังไม่ save | MEMBER | Func | อยู่ feed ที่ p3 (chrono.th — ไม่ได้ seed save) | 1. แตะ bookmark | `saved=true, savedCol="Saved"` + `syncSaveBtns` (icon เติมทุก surface) + `saveSheetHTML` เปิด | icon bookmark เติม + sheet: แถวหัว "Saved / Private" + ส่วน Collections (Grail list, Wishlist, Vintage picks, New) + "New collection" | High | |
| FO-TC-FEED-044 | เลือก collection | MEMBER | Func | save sheet ของ p3 เปิด | 1. แตะ "Vintage picks" | `savedCol="Vintage picks"` → ปิด sheet + toast "Saved to Vintage picks" | toast ลอย; icon ยังเติม | Medium | |
| FO-TC-FEED-045 | เอาออกจาก saved | MEMBER | Func | p3 อยู่ใน Vintage picks | 1. แตะ bookmark (เปิด sheet โดยไม่ unsave ทันที) 2. แตะแถว "Saved" | กด bookmark บนโพสต์ saved → เปิด sheet เฉย ๆ; เลือกแถว Saved → `saved=false` → toast "Removed from your saved" + icon โบกลง | sheet ปิด; bookmark ว่าง | Medium | |

### 2.10 Ask Seller `[GATE]`

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
|---|---|---|---|---|---|---|---|---|---|
| FO-TC-FEED-046 | Ask — guest [GATE] | GUEST | Func | guest อยู่ feed ที่ p4 | 1. แตะ "Ask" | `.ask-pill` ∈ gate → Member Sheet | sheet เด้ง; ไม่เข้า chat | High | |
| FO-TC-FEED-047 | Ask → chatroom (sale) | MEMBER | Func | อยู่ feed ที่ p4 | 1. แตะ "Ask" | `chatQuickAsk` → สร้าง/หา draft thread (seller+davikah, item=p4) → `openSub("chatroom:tid")` — ออกจาก feed ไปห้องแชท | ห้องแชทมีการ์ด item (รูป+caption+ราคา THB 380,000) ปักหัว + ช่องพิมพ์มี draft quick message | High | |
| FO-TC-FEED-048 | Ask บนการ์ด showcase | MEMBER | Func | อยู่ feed ที่ p8 | 1. แตะ "Ask" | showcase ก็มี ask-pill (showAsk=!isOwnPost) → chatQuickAsk เหมือนกัน; item card ไม่มีราคา | chatroom เปิด ปกติ | Medium | |
| FO-TC-FEED-049 | Ask ซ้ำโพสต์เดิม | MEMBER | Edge | เคย Ask p4 แล้วกลับ feed | 1. แตะ "Ask" ของ p4 อีกครั้ง | หา thread เดิม `seller+item.id` → `t.hidden=false` → เปิดห้องเดิม ไม่สร้างใหม่ | ห้องเดิมเปิด (ไม่ซ้ำใน chat list) | Medium | |
| FO-TC-FEED-050 | Ask seller ที่ block แล้ว | MEMBER | Edge | block davikah ไว้ก่อน (profile davikah → ⋯ → Block — flow อยู่ FO-TEST-16) | 1. เปิดการ์ด p4 ผ่าน detail/viewer แล้วแตะ Ask (การ์ด p4 หายจาก feed เพราะ p.blocked) | `chatQuickAsk` → `pfIsBlocked` → toast "Cannot message a blocked account" — ไม่เปิดห้อง | toast เตือนแทนห้องแชท | Low | |

### 2.11 Liked-by → Likes Sheet (lk)

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
|---|---|---|---|---|---|---|---|---|---|
| FO-TC-FEED-051 | เปิด likes sheet | MEMBER | Func | อยู่ feed ที่ p4 | 1. แตะแถว "Liked by Watch 777 and others" | `.liked-by` ไม่ถูก gate → `likesSheetHTML` + `likes-open`; แตะชื่อ/avatar liker → ไป profile (data-pf-user) | sheet "Likes": note "Only davikah can see the total number of likes on this post." (เพราะไม่ใช่โพสต์เรา) + รายชื่อ likers + ปุ่ม "Follow" ท้ายแถว | Medium | |
| FO-TC-FEED-052 | Follow ใน lk sheet | MEMBER | Edge | likes sheet เปิด | 1. แตะ "Follow" ของ liker | handler แค่ toggle `.on` + label "Following" — **ไม่เรียก setFollowing** (คือไม่ follow จริงใน state) `[OPEN]` พฤติกรรม visual-only | ปุ่ม flip เฉพาะใน sheet | Low | |
| FO-TC-FEED-053 | lk sheet — guest | GUEST | Func | guest อยู่ feed ที่ p4 | 1. แตะ liked-by → sheet เปิด 2. แตะ "Follow" ในแถว | `.liked-by` เปิดฟรี; `.lk-follow` ∈ gate → Member Sheet | อ่านรายชื่อได้ กด follow ไม่ได้ | Medium | |

### 2.12 Post Menu (⋯) — โพสต์คนอื่น

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
|---|---|---|---|---|---|---|---|---|---|
| FO-TC-FEED-054 | ⋯ — guest [GATE] | GUEST | Func | guest อยู่ feed ที่ p4 | 1. แตะ ⋯ บน head การ์ด | `.post-head .more` ∈ gate → Member Sheet; เมนูไม่เปิด | sheet เด้ง | High | |
| FO-TC-FEED-055 | เมนูโพสต์ที่ยังไม่ follow | MEMBER | Func | อยู่ feed ที่ p4 (davikah ไม่ได้ follow) | 1. แตะ ⋯ 2. แตะ scrim ปิด | `pmMenuHTML` + `pm-open`; `canFav=false` → ไม่มีการ์ด favorites; ปิดด้วยแตะ backdrop/scrim (open classes ถูกลบ) | sheet การ์ดเดียว: "Not interested" + "Report"(แดง) | High | |
| FO-TC-FEED-056 | เมนูโพสต์ที่ follow แล้ว | MEMBER | Func | อยู่ feed ที่ p7 (wrist.story follow แล้ว) | 1. แตะ ⋯ | `canFav` → เพิ่มการ์ดบน: "Add to favorites" + การ์ดล่าง: NI + Report | เมนู 2 กลุ่ม | High | |
| FO-TC-FEED-057 | Add/Remove favorites | MEMBER | Func | ⋯ เมนูของ p7 เปิด | 1. แตะ "Add to favorites" 2. เปิด ⋯ ใหม่ 3. แตะ "Remove from favorites" 4. ดูแท็บ Favorites ระหว่างขั้น | `pm-fav` → `setFavorite` + toast "Added to favorites"; เมนูเปิดใหม่ = icon starFill + "Remove from favorites"; remove → toast "Removed from favorites"; ช่วง fav อยู่ → p7 โผล่ในแท็บ Favorites | toast ตาม action; label สลับตาม state | High | |
| FO-TC-FEED-058 | Report — entry | MEMBER | Func | ⋯ เมนูของ p4 เปิด | 1. แตะ "Report" | `rpOpenFromPost` → pushSub("report") — หน้ารายงานเลื่อนทับ (stack internals → FO-TEST-16); ไม่ได้อยู่ใน pv → ไม่มี rp-over | หน้า report เลือกเหตุผลเด้งเต็มจอ | Medium | |
| FO-TC-FEED-059 | Not interested → ni-card | MEMBER | Func | ⋯ เมนูของ p4 เปิด | 1. แตะ "Not interested" | `post.ni=true` → การ์ดถูกแทนด้วย `niCardHTML` (sheet ปิด) | การ์ดกลายเป็น "Thanks for your feedback" + Undo + "We'll suggest fewer posts like this." + แถว "Manage content preferences" (เพราะไม่ follow) + "This post made me uncomfortable" | High | |

### 2.13 Post Menu (⋯) — โพสต์ตัวเอง (OWNER — ต้องมีโพสต์ตัวเองบน feed, SETUP-09)

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
|---|---|---|---|---|---|---|---|---|---|
| FO-TC-FEED-060 | การ์ดตัวเอง anatomy + เมนู | OWNER | UI | โพสต์ตัวเองบนสุดของ feed | 1. ดู head การ์ดตัวเอง 2. แตะ ⋯ | `isOwnPost` → ไม่ render Follow + ไม่ render Ask; ⋯ → `pmOwnMenuHTML` | เมนู: Archive · Turn off commenting · Edit · Pin to top of grid · Delete(แดง) — **ไม่มี** Mark as sold (pfkind="post" ไม่ sellable), ไม่มี Report/Not interested, likes=0 → ไม่มี liked-by | High | |
| FO-TC-FEED-061 | **กติกาบังคับ — เมนูเจ้าของ vs คนอื่นต่างกัน** | OWNER | Func | มีทั้งการ์ดตัวเองและของคนอื่นใน feed | 1. เปิด ⋯ การ์ดตัวเอง จำรายการ 2. ปิด 3. เปิด ⋯ การ์ด p4 เทียบ | `pmOwnMenuHTML` vs `pmMenuHTML` เป็น 2 renderer คนละชุดรายการ | own: Archive/Commenting/Edit/Pin/Delete; other: (fav)/Not interested/Report — ไม่มีรายการซ้ำกันเลย | High | |
| FO-TC-FEED-062 | Archive | OWNER | Func | ⋯ เมนูโพสต์ตัวเองเปิด | 1. แตะ "Archive" | `archived=true` + `archivedAt` + `pins=null` → feed re-render → การ์ดหายจาก feed + toast "Post archived" | การ์ดหายทันที (ย้อนได้ผ่านหน้า Archive — FO-TEST-14) | High | |
| FO-TC-FEED-063 | Turn off/on commenting | OWNER | Func | ⋯ เมนูเปิด | 1. แตะ "Turn off commenting" 2. ดูการ์ด 3. ⋯ → "Turn on commenting" | `noComments=true` → `refreshPostViews` re-render การ์ด → comment-btn หาย + toast "Commenting turned off"; on → ปุ่มกลับ + toast "Commenting turned on" | 💬 หาย/กลับบนการ์ด | Medium | |
| FO-TC-FEED-064 | Edit — entry | OWNER | Func | ⋯ เมนูเปิด | 1. แตะ "Edit" | `openPostEdit` → composer โหมด edit (`editPid`, step 2, meta ย้อนจากโพสต์) — internals → FO-TEST-05 | หน้า composer prefilled เด้ง | Medium | |
| FO-TC-FEED-065 | Pin to top of grid | OWNER | Func | ⋯ เมนูเปิด (pin <3) | 1. แตะ "Pin to top of grid" | `applyPin(on)` → `pins[all]=seq` → pill "Pinning..." 700ms → toast icon+​"Your post has been pinned"; เมนูครั้งถัดไปเป็น "Unpin from grid" | pill+toast feedback (ผลบน grid อยู่ profile — FO-TEST-12) | Medium | |
| FO-TC-FEED-066 | Pin limit 3 | OWNER | Edge | pin ไปแล้ว 3 โพสต์ใน tab all | 1. ⋯ โพสต์ที่ 4 → "Pin to top of grid" 2. แตะ "Confirm" / "Cancel" | `pinnedIn>=PIN_MAX` → dialog "Pin limit reached" + Confirm(น้ำเงิน)/Cancel; Confirm → pin แทนตัวเก่าสุด (seq ใหม่) | dialog กลางจอ | Low | |
| FO-TC-FEED-067 | Delete | OWNER | Func | ⋯ เมนูเปิด | 1. แตะ "Delete" 2. กด "Cancel" → เปิดใหม่กด "Delete" | dialog "Delete post? This post will be permanently deleted."; Cancel → อยู่; Confirm (dlg-delpost-go) → ลบออกจาก POSTS/feed | การ์ดหายถาวรหลังยืนยัน | High | |

### 2.14 Feedback Cards (ni-card / uncomf) `[OPEN-CODE-ONLY]`

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
|---|---|---|---|---|---|---|---|---|---|
| FO-TC-FEED-068 | ni-card — ยังไม่ follow | MEMBER | Func | p4 กลายเป็น ni-card แล้ว (FEED-059) | 1. แตะ "Manage content preferences" | `.ni-pref` → `openSub("prefs")` — หน้า Content preferences เด้ง | prefs page (เชื่อม FO-TEST-15) | Medium | |
| FO-TC-FEED-069 | ni-card — follow อยู่: Mute/Unfollow | MEMBER | Func | NI โพสต์ของ wrist.story (p7, follow อยู่) | 1. ⋯ → "Not interested" 2. แตะ "Unfollow wrist.story" 3. (ทำซ้ำบนโพสต์ follow อื่นแล้วแตะ "Mute wrist.story"→"Mute posts") | p7 following → แถว "Mute {seller}" + "Unfollow {seller}"; Unfollow → `setFollowing(false)` + การ์ดถูกลบ + toast "Unfollowed"; Mute → dialog "Mute {seller}?" → "Mute posts" → `setMuted` → โพสต์ seller นั้นหายจาก feed | ni-card แสดง 2 แถวบนลัพธ์ตาม follow state | High | |
| FO-TC-FEED-070 | Undo บน ni-card | MEMBER | Func | ni-card แสดงอยู่ | 1. แตะ "Undo" | `pm-undo` → `ni=false` → `postCard` render กลับเดิม | การ์ดปกติกลับมา | Medium | |
| FO-TC-FEED-071 | uncomf card | MEMBER | Func | ni-card แสดงอยู่ | 1. แตะ "This post made me uncomfortable" 2. แตะ "Undo" / "Report" | `uncomfCardHTML` แทน: เช็คใหญ่ + "Thanks for letting us know" + คำอธิบาย Community Standards + ปุ่ม Report(แดง)/Undo; Undo → กลับ ni-card (หรือการ์ดเดิมตาม handler); Report → `openSub("report")` | ack card แล้ว 2 ทางเลือก | Medium | |
| FO-TC-FEED-072 | ni-card ไม่โผล่บน guest | GUEST | Edge | guest อยู่ feed | 1. ลองหาเส้นทางไป NI | ⋯ ถูก gate → guest เข้าไม่ถึง pm-ni เลย ไม่มี ni-card บน session guest | — | Low | |

### 2.15 Filter → Feed ว่าง (Snooze — ผ่าน Content preferences)

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
|---|---|---|---|---|---|---|---|---|---|
| FO-TC-FEED-073 | snooze on — member | MEMBER | Func | member อยู่ feed; เข้า Settings → "Content preferences" (SETUP-07) | 1. เปิด toggle "Snooze suggested posts in feed" 2. back กลับ feed แท็บ All | `state.snooze=true` → filter all = เฉพาะ `p.following` → เหลือ 3 การ์ด (p7, p2, p10) | feed เหลือเฉพาะคนที่ follow (เทียบ Following tab หน้าตาเดียวกัน) | Medium | |
| FO-TC-FEED-074 | snooze → feed ว่าง (NEW) | NEW | Func | session new (follow 0 คน); เข้า prefs เหมือนกัน | 1. เปิด snooze 2. back กลับ feed | `clearUserData` ทำ following หมด → filter ว่าง → `feedEmptyHTML("all")` (ข้อความกลุ่ม favorites — quirk ของโค้ด) | icon ดาว + "No favorites yet / ยังไม่มีรายการโปรด" | Medium | |
| FO-TC-FEED-075 | snooze off คืนค่า | MEMBER | Func | snooze เปิดอยู่ | 1. ปิด toggle 2. back กลับ feed | `snooze=false` → all tab กลับ 11 การ์ด | feed เต็มเหมือนเดิม | Medium | |

### 2.16 Hashtag + Profile Entry (ไม่ gate)

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
|---|---|---|---|---|---|---|---|---|---|
| FO-TC-FEED-076 | แตะ hashtag — member+guest | MEMBER + GUEST | Func | caption expand แล้ว (hashtag อยู่ใน cap-full) | 1. แตะ "#Rolex" | `.igd-tag` ไม่อยู่ใน gate → `openSub("search")` mode=results tab=foryou q="#Rolex" — ใช้ได้ทั้ง member/guest | หน้า search results เด้งเต็มจอ | Medium | |
| FO-TC-FEED-077 | avatar/ชื่อ → profile — member | MEMBER | Func | อยู่ feed ที่ p4 | 1. แตะ avatar วงแหวน 2. back 3. แตะชื่อ "davikah" 4. back 5. แตะชื่อ seller หน้า caption (bold) | `.post-head .avatar-ring/.who` และ `.caption > b` → `pushSub("profile:davikah")` | public profile เด้ง (search/FO-TEST-12 รับต่อ) | High | |
| FO-TC-FEED-078 | avatar/ชื่อ → profile — guest | GUEST | Func | guest อยู่ feed ที่ p4 | 1. แตะ avatar | pfWho ไม่อยู่ใน gate → profile เปิดฟรี | เหมือน FEED-077 | Medium | |

### 2.17 i18n / Theme / Money — Spot-check (sweep เต็ม → FO-TEST-19)

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
|---|---|---|---|---|---|---|---|---|---|
| FO-TC-FEED-079 | การ์ดภาษาไทย | MEMBER | UI | lang=TH | 1. ดูการ์ด p4 ครบทุก label | ปุ่ม/ข้อความแปลตาม isTh: "ติดตาม", "สอบถาม", "ถูกใจโดย Watch 777 และคนอื่น ๆ", "เพิ่มเติม", "2 วันที่แล้ว", "แตะเพื่อดูรายละเอียด"; ราคา/username/hashtag คงเดิม (ไม่แปล) | ไม่มี label เหลือเป็น EN บนพาธหลัก (สังเกต: caption content + เมนูบางข้อ EN ตาม mock) | Medium | |
| FO-TC-FEED-080 | การ์ดธีม Light | MEMBER | UI | theme=light (☾/☀ dev หรือ Settings→Theme) | 1. ดูการ์ด p4 + sheet ⋯ + comments | surface/chip/line/photo-dots/contrast ปรับตาม theme vars; sheet+dialog ใช้ theme เดียวกัน | อ่านได้ปกติทั้งคู่ | Low | |
| FO-TC-FEED-081 | เงินบนการ์ด = literal mock | MEMBER | UI | อยู่ feed ที่ p4, details เปิด | 1. ดูราคาใน details block 2. เทียบ views "980" | `p.price` render ตรง ๆ "THB 380,000" (mock literal — money rules DRAFT ยังไม่ lock formatter); views-stat ไม่ใช่เงิน (ไม่ format เป็น THB) | "THB 380,000" แดงตัวหนาใน details-top | Medium | |
| FO-TC-FEED-082 | toast/pill รวมของ module | MEMBER | UI | — | 1. สังเกต toast จากเคสก่อน ๆ | `scrToast` เดี่ยวต่อ screen (~1.8s หาย); pin feedback มี 2 ชั้น (pill "Pinning..." → toast icon) | consistent | Low | |

## 3. หมายเหตุ / ข้อจำกัดที่ต้องรีวิว

1. **ไม่มี own-post / clip ใน mock POSTS** — เคส OWNER (060–067) + clip (017–019) + comment-empty (038) ต้องสร้างโพสต์ก่อนผ่าน composer (`+`) หรือ seed `localStorage.fo_newpost` (SETUP-09/10) — รายละเอียด composer อยู่ FO-TEST-05
2. **"Mark as sold" ไม่มีในเมนูโพสต์ feed** — `pfKind("post")` ไม่ sellable; ขึ้นเฉพาะโพสต์ที่ผูก drawer (sale/show/hide) → เมนูที่เห็นบน feed ของตัวเองมี 5 แถวตาม FEED-060
3. **lk-follow ใน Likes sheet = visual-only** — toggle class แต่ไม่เรียก `setFollowing` (FEED-052, `[OPEN]` ยืนยันกับโค้ด)
4. **snooze ทำ feed ว่างแสดงข้อความ "No favorites yet"** — `feedEmptyHTML` แยกแค่ following vs อื่น ๆ ไม่มีข้อความเฉพาะ snooze (FEED-074)
5. ** unfollow จากการ์ดทำได้ผ่านปุ่ม "Following" (หลัง follow ใน session เดียวกัน) หรือผ่าน ni-card "Unfollow"** — การ์ดที่ follow มาตั้งแต่ต้น (mock) ไม่มีปุ่มบน head; เส้นทางหลักอยู่ profile (`.pf-foll`)
6. **`.ask-pill` อยู่ใน dead-click list ด้วย** แต่ `chatClick(e)` จับก่อน → Ask ใช้งานจริง (อย่าสับสนตอนรีวิวโค้ด)
7. **feed tabs/empty/scroll-hide/refresh re-tap** ครอบแล้วใน FO-TEST-02 — ไม่ซ้ำ
8. ข้อเสนอแนะ traceability: rows `detail-open`/`pv-open`/`ps`/`dt`/`mf`/`wa` ถูก defer ไป FO-TEST-06/07/11/12 ตาม breakdown — เหลือเคส "media ไม่เปิด viewer" + "View full detail entry" เป็นตัวเชื่อมในไฟล์นี้
