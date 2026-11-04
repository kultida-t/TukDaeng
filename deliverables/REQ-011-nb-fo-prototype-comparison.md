# REQ-011 — Requirement Comparison: NB-001–051 vs fo-flow Prototype

- **Task:** REQ-011 [02765acf] — Mission 5 Objective 2 (Requirement Gap Analysis)
- **Date:** 2026-11-04
- **Source of truth (requirements):** `SourceInputs/requirements/2026-11-04-notebook-review-app-tukdaeng-09-10-2026.md` (51 ข้อ NB-001–NB-051)
- **เทียบกับ:** `Prototypes/fo-flow/index.html` (read-only audit — ไม่ได้แก้ไข; เลขบรรทัด = evidence ณ snapshot ปัจจุบัน)
- **คู่เอกสาร:** `REQ-010-nb-fo-spec-comparison.md` + `REQ-010-decision-log.md` (verdict/decision ระดับ spec — เอกสารนี้เป็น evidence ระดับ prototype)
- **หมายเหตุ:** prototype นำ spec อยู่ 4 delta ที่พี่มาเต็มสั่ง implement ไว้เพื่อเดโมพี่คิง (ดู DEC-R010-05/05b/06 + ตาราง "Prototype deltas" ท้าย decision log) — ข้อเหล่านี้ได้กลุ่ม verdict พิเศษ `covered-in-prototype` ไม่ใช่ gap

## เกณฑ์ Verdict (ระดับ prototype)

| Verdict | ความหมาย |
|---------|-----------|
| `covered` | prototype render/behavior ตรง requirement (อาจต่างรายละเอียดแต่ intent เดียวกัน) |
| `covered-in-prototype` | มีใน prototype แล้วแต่ **spec ยังไม่ sync** — 1 ใน 4 delta ที่ทำไว้เดโมพี่คิง รอเขียน spec delta ใน REQ-020 |
| `partial` | prototype มีบางส่วน ขาดอีกส่วนตามที่ NB ระบุ |
| `gap` | ไม่มีใน prototype เลย |
| `design-ref` | ไม่ใช่ requirement ตรง — NB-015–021 ผู้ใช้ยืนยันแล้วว่าเป็นภาพตัวอย่าง (DEC-R010-02) |

---

## ตารางเทียบ NB-001 – NB-014 (source: docx ออกแบบฟีดโซเชียล)

| NB | หัวข้อ | Verdict | Prototype evidence | หมายเหตุ |
|----|--------|---------|--------------------|----------|
| NB-001 | คอนเซปต์ "Collectible Social" | covered | default variant `a1` "Flat IG layout" (L13554), feed = post-centric + community entries ใน hamburger (L20237–20245) | ฟีดอ่านเป็น social gallery ไม่ใช่ marketplace list |
| NB-002 | สถาปัตยกรรมล้อ IG | covered | variant `a1` default, IG card anatomy (`.post-head`/photo carousel/actions/caption/`.more`), bottom nav 5 แท็บ (L17493–17497), viewer IG-style | IG parity เป็น baseline ของ prototype ทั้งชุด |
| NB-003 | Hero Content / Slider ไม่ใช้ thumbnail | covered | feed card = photo carousel เต็มความกว้าง + `photo-counter`/`photo-dots` (L13668–13674); ไม่มี thumbnail ในฟีด | grid thumbnails มีเฉพาะ search explore/profile (IG pattern) |
| NB-004 | หลีกเลี่ยงบรรยากาศ marketplace | covered | variant `a1` ซ่อน price/specs หลัง tap-to-expand; card ไม่มี price overlay/type tag | ตรง "เดินชมแกลเลอรี" |
| NB-005 | ชั้นที่ 1: ภาพ + caption สั้น | covered | `.caption` = seller + `cap-short` + `more-link` (L13808, L14551) | |
| NB-006 | ชั้นที่ 2: tap-to-expand spec ย่อ | covered | `.details-toggle` "Tap for details" → `.details-body.open` inline spec rows + "View full detail" (L13588–13611, L24000) | เปิดทีละ card บนฟีดเดิม |
| NB-007 | ชั้นที่ 3: หน้ารายละเอียดเต็ม | covered | `openPostDetail` → `.page-detail` overlay, `detail-head` + `detail-scroll` + spec groups (L15251–15270, L13815–13828) | |
| NB-008 | สเกลไอคอนเท่า IG | covered | action row `I.heart(23)/I.comment(23)/I.share(22)` + `views-stat` (L13677–13680) | ขนาด ~23px ตาม IG touch scale |
| NB-009 | ปุ่มปฏิสัมพันธ์ 4–5 ปุ่ม | covered | like / comment+count / views-stat (eye) / share + `ask-pill` + save (`post-head .more`/save-btn) | ครบทั้ง 5 + bookmark |
| NB-010 | Quick Ask | covered | `ask-pill` → `chatQuickAsk` เปิดห้องแชท item-scoped พร้อม post card (L20087–20092, L19683–19696) | own post → toast "This is your own listing" |
| NB-011 | Soft UI ลดฉูดฉาด | covered | `.follow-btn` = `--btn-gray` muted 13px (L761–788), ปุ่ม/ป้ายโทนกลางทั้งชุด | ตรง design principle; บันทึกเป็น guideline ต่อ DEC-R010-03 ไม่ต้องมี rule ใน spec |
| NB-012 | โพสต์อิสระไม่บังคับบันทึก Asset | covered | composer `pfkind:"post"` (L16592), drawer OFF default (L16164), "Also save to My Assets" เป็น opt-in toggle (L16484) | |
| NB-013 | หลายประเภทคอนเทนต์ | covered | POSTS มี `price: null` (plain/showcase) ปนกับ sale posts (L13076, L13139 ฯลฯ); feed = ขาย + โพสต์ธรรมดา (L14596) | ตามชี้แจง REQ-010: WTB/บริการ = โพสต์ธรรมดา ไม่ต้องมี type เฉพาะ |
| NB-014 | Clean UI Header | covered-in-prototype | `app-header` = burger + `search-btn` icon + wordmark + `feed-wa` (นาฬิกาข้อมือ) + `+` (L20204–20211) | **delta** — WA button ทำแล้วใน prototype (`feed-wa` → `pushSub "walerts"` L22255); spec 00_NAV ยังไม่ sync รอ REQ-020 |

## ตารางเทียบ NB-015 – NB-021 (source: รูป ThaiLand News) — **design reference**

ผู้ใช้ยืนยัน 2 รอบแล้ว (DEC-R010-02): เป็นภาพตัวอย่างที่พี่คิงให้ดู ไม่ใช่ requirement — ไม่ผูก verdict ระดับ prototype เช่นกัน

| NB | หัวข้อ | Verdict | หมายเหตุ |
|----|--------|---------|----------|
| NB-015 | Today Dashboard modular widgets | design-ref | ไม่มี Today/dashboard surface (feed คือ home) |
| NB-016 | Dashboard header (ธงชาติ/โลโก้/ปุ่ม) | design-ref | header ของ TukDaeng ตาม IG pattern |
| NB-017 | Shortcut toolbar 5 ไอคอน | design-ref | ไม่มี widget framework |
| NB-018 | Time widget | design-ref | ไม่มี |
| NB-019 | Calendar & cultural events | design-ref | ไม่มี |
| NB-020 | Weather widget | design-ref | ไม่มี |
| NB-021 | Bottom nav 5 เมนู | design-ref | prototype มี bottom nav 5 แท็บอยู่แล้ว (Feed/Chat/Boards/Alerts/Profile) แต่ semantics ต่าง — coincidence ไม่ใช่ requirement |

## ตารางเทียบ NB-022 – NB-051 (source: เสียงบันทึกพี่คิง .m4a)

| NB | หัวข้อ | Verdict | Prototype evidence | หมายเหตุ |
|----|--------|---------|--------------------|----------|
| NB-022 | จักรวาล Use Thailand, เริ่มนาฬิกา | covered | seed content = นาฬิกาล้วน (Rolex/Tudor/Grand Seiko); hamburger = Watch Brands/Price Index/Shops/Repair/Auction/Auth Center/Community (L20237–20245) | watch-only ถูกต้องตามชี้แจง (Use Thailand = กลุ่มแอปแยกกัน) |
| NB-023 | ระบบจัดเก็บ Asset ส่วนตัว + ประเมินมูลค่า | covered | asset drawer (`PF_ASSETS`, `pfkind` statuses) + PORTFOLIO-001 dashboard `.pfo-total/.pfo-mktd` (market value, gain/loss), sold history (L8470+, L17029–17037) | ไม่ใช่ marketplace เพียว ตรง intent |
| NB-024 | เชื่อมข้อมูลไป Family Office | gap | ไม่มี "family office" ในไฟล์เลย | integration ใหม่ทั้งระบบ — เสนอ defer phase 2 (DEC-R010-07) |
| NB-025 | UX ล้อ IG | covered | = NB-002 | duplicate |
| NB-026 | ยกเลิก thumbnail บนฟีด | covered | feed card = hero carousel เท่านั้น | grid มีเฉพาะ explore/profile ตาม IG |
| NB-027 | สไลด์ + ตัวเลขอัลบั้ม 1/N | covered | `photo-counter` `1/N` + `photo-dots` (L13668–13674) | |
| NB-028 | description สั้นใต้อิมเมจ | covered | = NB-005 | |
| NB-029 | Information 3 ชั้น | covered | = NB-005/006/007 | duplicate summary |
| NB-030 | spec table ซ้าย-ขวา + `n/a` | covered | `.spec-row .l/.v` label–value (L1278–1295); ฟิลด์ว่าง render `N/A` คงตำแหน่ง (L13655 `|| "n/a"`, L16513–16527 emit `N/A`) | title ตัด n/a ตอนประกอบชื่อ — ถูกต้อง นั่นคือ title ไม่ใช่ตาราง |
| NB-031 | ไม่มี sticky price bar; ราคาในเนื้อหา | covered | ไม่มี bottom/sticky price bar (sticky เฉพาะ `.detail-head` ตาม IG); ราคาอยู่ใน `priceRow`/spec group "Price & Data Source" ใน detail scroll | ผู้ใช้ตัดสิน: คงดีไซน์ล่าสุด ไม่ขยายตัวเลข |
| NB-032 | Engagement 5 ปุ่ม + Quick Ask | covered | = NB-009/010 | duplicate |
| NB-033 | นับ view ทุก scroll-pass ช่วงแรก | covered-in-prototype | scroll listener `.feed-scroll`: card โผล่ ≥55% นับ +1, `_vSeen` reset เมื่อหลุดจอ → เลื่อนกลับนับซ้ำ, counter อัปเดต in place (L20809–20830) | **delta** — rule อนุมัติแล้ว (DEC-R010-05b); spec 02_FEED ยังไม่ sync รอ REQ-020 |
| NB-034 | ลดฉูดฉาดปุ่ม Follow | covered | = NB-011 — `.follow-btn` เฟดสีเทา ขนาดเล็ก | design principle ต่อ DEC-R010-03 |
| NB-035 | search เป็นไอคอนข้าง burger | covered | `hb-btn` burger + `search-btn` icon ทางซ้าย wordmark (L20205–20207) | |
| NB-036 | WA ปุ่มเล็กบนฟีด + config ประจำหน้า | covered-in-prototype | `feed-wa` icon ขนาดเท่า `+` บน feed header → `walerts` (L20209, L22255) | **delta** — WA button done; ครึ่ง "config ประจำหน้า" อยู่ภายใต้ decision selective ของ NB-047 (ไม่บังคับทุกหน้า) |
| NB-037 | (+) ฟีด = Post / (+) โปรไฟล์ = Add Asset | covered | feed `data-flow="create"` → mode `post` (L20210); profile `data-flow="create" data-mode="asset"` → "เพิ่มสินทรัพย์ใหม่" (L17529, L17555, L16163 comment) | ตรงทุกประการ |
| NB-038 | โพสต์หลากประเภท | covered | = NB-013 — plain posts รองรับแล้ว | |
| NB-039 | โควตาการโพสต์ผู้ค้า | gap | ไม่มี quota/limit ในไฟล์ | ผู้ใช้ตัดสิน: defer อนาคต ไม่เข้า V1 (DEC-R010-04) |
| NB-040 | แชทธรรมชาติซ้าย-ขวา | covered | `.ch-m.me` / `.ch-m.them` bubbles (L19247–19252); ไม่มีการ์ด accept/reject (Offer ถอดจาก V1) | |
| NB-041 | โพสต์อ้างอิงใน bubble | covered | `m.pid` → `.ch-post-card` render ในสายข้อความ (L19212–19245) | reply-story style ตรง IG |
| NB-042 | ไม่มีแถบปักหมุดสินค้าบนหัวห้อง | covered | comment ชัด "item cards live in the message flow only — never pinned to the room" (L19208–19209) | |
| NB-043 | รวมแชทต่อคน | covered | Chats view (`data-chview="user"`) เรียงตามคู่สนทนา latest-first (L19635) | |
| NB-044 | สลับ Item View | covered | `ch-top-tab` Chats/Items view switch + `ch-sec` "Your listings"/"Items you asked about" + filter popover (L19104–19105, L19635–19636) | |
| NB-045 | read receipts + ปักหมุดห้อง | covered | `Sent`/`Read` บนข้อความล่าสุด (L19248) + pin room `pinnedAt`/`ch-pin-badge` pin-first sort (L19030, L19086, L19827) | optional ตาม NB — มีแล้ว |
| NB-046 | Notification Center รวมทุกประเภท + filter | covered-in-prototype | alerts feed รวม like/comment/follow/watch + `type:"system"` 4 rows (security→`change_pwd`, account โพสต์ถูกซ่อน→`al_unavail`, announce→`about_app`, account verified→`about_account` L18414–18439) + `al-fchip` filter ทั้งหมด/ระบบ/กิจกรรม/Watch Alert (L18505–18508) | **delta** — ทั้ง 2 ชิ้น (system type + category filter) ทำแล้ว; spec 09_NOTIFICATION ยังไม่ sync รอ REQ-020; guest เห็น empty ตาม GUEST-001 |
| NB-047 | Page Config ทุกหน้า | partial | มีเฉพาะ `ch-cfg-btn` gear บนหัว chat list → `chatcfg` (L19149, L18227) — feed/board/alerts ไม่มี per-page config | ตรง decision selective (อนุมัติแล้ว): เพิ่มเฉพาะหน้าที่มีของให้ตั้งจริง — หน้าอื่นประเมินรายตัวใน REQ-012 |
| NB-048 | โปรไฟล์ IG + Setting ฟันเฟือง | covered-in-prototype | profile IG-style (avatar/ring/stats/bio/tabs/grid); `pf-menu` = `I.gear(22)` แทน burger (L17559) | **delta** — gear ทำแล้ว; spec 06_PROFILE ยังเขียน burger รอ REQ-020 |
| NB-049 | Release cycle 2 ครั้ง/สัปดาห์ | gap | n/a — process constraint | อยู่นอกขอบเขต prototype โดยธรรมชาติ (DEC-R010-08) |
| NB-050 | ทดสอบบน production env | gap | n/a — environment rule | นอกขอบเขต prototype |
| NB-051 | Figma Make/AI + สรุปประชุมด้วย AI | gap | n/a — process rule | นอกขอบเขต prototype |

---

## สรุปผล (Prototype-level)

| Verdict | จำนวน | รายการ |
|---------|-------|--------|
| covered | 33 | NB-001–010, 011, 012, 013, 022, 023, 025, 026, 027, 028, 029, 030, 031, 032, 034, 035, 037, 038, 040, 041, 042, 043, 044, 045 |
| covered-in-prototype (spec pending sync) | 5 | NB-014, 033, 036, 046, 048 |
| partial | 1 | NB-047 |
| gap | 5 | NB-024, 039, 049, 050, 051 |
| design-ref | 7 | NB-015–021 |

> เทียบกับ spec-level (REQ-010): partial ทั้ง 8 ข้อฝั่ง spec ลดเหลือ 1 ข้อฝั่ง prototype เพราะ delta 4 ชิ้นถูก implement ลง fo-flow ไปแล้วระหว่างเดโม (NB-014/033/036/046/048) และ NB-011/034 (soft UI) ที่ spec ไม่เขียนเป็น rule — prototype สะท้อน design direction นั้นอยู่แล้วจึงตัดเป็น covered; gap 5 ข้อเดิมคงไว้ (NB-024 phase-2, NB-039 defer, NB-049–051 process)

**จุดที่ prototype แข็งแรงสุด:** ทั้ง 3-layer info architecture, IG-parity feed, engagement actions + Quick Ask → chat flow, chat center ครบ (user/item view, pinned, read receipts, embedded post card, ไม่มี pin bar), notification center + system types + filter

**ประเด็นคงเหลือสำหรับ Gap Report (REQ-012):**
1. **spec sync** — delta 5 ข้อ (NB-014/033/036/046/048) ต้องเขียน spec delta ใน REQ-020 ให้ spec ตาม prototype
2. **NB-047 partial** — page-config มีเฉพาะ chat; ตาม decision selective ต้องประเมินรายหน้าใน gap report (ไม่บังคับทุกหน้า)
3. **gap 5 ข้อ** — NB-024 (Family Office, เสนอ phase 2), NB-039 (defer อนาคต), NB-049–051 (process constraints นอก spec/prototype)

> ⚠️ verdict นี้คือ **prototype-level evidence** — verdict รวม + proposed action ขั้นสุดท้ายอยู่ที่ Gap Report (REQ-012) ซึ่งรวม spec-level (REQ-010) + prototype-level (เอกสารนี้)
