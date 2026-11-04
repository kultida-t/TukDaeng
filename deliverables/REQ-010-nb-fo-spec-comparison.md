# REQ-010 — Requirement Comparison: NB-001–051 vs FO Module Specs (00–17)

- **Task:** REQ-010 [ee47cc83] — Mission 5 Objective 2 (Requirement Gap Analysis)
- **Date:** 2026-11-04
- **Source of truth (requirements):** `SourceInputs/requirements/2026-11-04-notebook-review-app-tukdaeng-09-10-2026.md` (51 ข้อ NB-001–NB-051)
- **เทียบกับ:** `FrontOffice/00_GLOBAL_RULES_MODULE.md`, `00_NAVIGATION_AND_CROSS_MODULE_FLOW.md`, `01`–`17` module specs
- **คู่เอกสาร:** `REQ-010-decision-log.md` (verdict/decision อยู่ฝั่งนั้น — เอกสารนี้เป็น evidence การเทียบ)
- **หมายเหตุ:** เทียบกับ **module specs เท่านั้น** (ยังไม่เทียบ fo-flow prototype — นั่นคือ REQ-011) ตัว spec เอง sync กับ prototype แล้วระดับหนึ่ง (spec-sync FO-PRD-v1.9) จึงอ้าง prototype ref ใน spec ได้เป็นหลักฐานประกอบ

## เกณฑ์ Verdict

| Verdict | ความหมาย |
|---------|-----------|
| `covered` | spec มี requirement นี้ครอบอยู่ชัดเจน (อาจเขียนคนละมุมแต่ intent เดียวกัน) |
| `partial` | spec มีบางส่วน แต่ขาดรายละเอียด/เงื่อนไข/ประเภทที่ NB ระบุ |
| `gap` | ไม่มีใน spec เลย |
| `design-ref` | ไม่ใช่ requirement ตรง — ผู้ใช้ยืนยันแล้วว่าเป็นภาพตัวอย่างที่พี่คิงให้ดู (design reference) ดูการตัดสินใจใน decision log |

---

## ตารางเทียบ NB-001 – NB-014 (source: docx ออกแบบฟีดโซเชียล)

| NB | หัวข้อ | Verdict | Spec reference | หมายเหตุ |
|----|--------|---------|----------------|----------|
| NB-001 | คอนเซปต์ "Collectible Social" (social มากกว่า marketplace) | covered | 02_FEED §2, §4 (post-centric S-09, "ไม่ใช่ marketplace list") | feed เป็น post-centric social ตรง intent |
| NB-002 | สถาปัตยกรรมล้อ IG | covered | 02_FEED §4/§9 (variant `a1` flat IG card, IG behaviors), 06_PROFILE (IG-style), 00_NAV (IG transitions) | IG parity เป็น baseline ของทั้งชุด spec |
| NB-003 | Hero Content / Slider ไม่ใช้ thumbnail | covered | 02_FEED §9 Post Card Anatomy — photo carousel + counter + dots | carousel หยุดที่ปลาย ไม่วน (IG) |
| NB-004 | หลีกเลี่ยงบรรยากาศ marketplace (ไม่อัด spec/ราคาเต็มจอ) | covered | 02_FEED §9 — spec/price ซ่อนหลัง `Tap for details`; card ไม่แสดง type tag/price overlay | |
| NB-005 | ชั้นที่ 1: ภาพ + caption สั้น 2–3 บรรทัด | covered | 02_FEED §9 — caption `{seller}` + short caption + `more` | |
| NB-006 | ชั้นที่ 2: tap-to-expand spec ย่อบนฟีดเดิม | covered | 02_FEED §8/§9 — `Tap for details` → `details-body` inline (price + spec groups + `View full detail`) | expander เปิดทีละ card |
| NB-007 | ชั้นที่ 3: หน้ารายละเอียดเต็ม | covered | `View full detail` → Post Detail (`.page-detail`) — 05_ASSET_DETAIL | |
| NB-008 | สเกลไอคอนปฏิสัมพันธ์เท่า IG | covered | 02_FEED §9 action row (like/comment/views/share) ภายใต้ IG-parity baseline | spec ไม่ระบุ pixel size แต่ยึด IG anatomy เป็นตัวตั้ง — ถือว่า intent ครอบอยู่ |
| NB-009 | ปุ่มปฏิสัมพันธ์ 4–5 ปุ่ม (Like/Comment/Share/View/Quick Ask) | covered | 02_FEED §9 action row = like / comment+count / views stat / share + `Ask` pill + save | ครบทั้ง 5 + save bookmark (IG) |
| NB-010 | Quick Ask ทักถามด่วน | covered | 02_FEED §8 Ask Seller pill → item-scoped chat (canonical 07_CHAT) | own post → toast, guest → Member Sheet |
| NB-011 | Soft UI ลดความฉูดฉาด | partial | IG-parity baseline (02_FEED, 00_GLOBAL §design tokens) | ไม่มีกฎชัดเจนเรื่องโทนสี/ขนาดปุ่ม "ไม่ตะโกน" — เป็น design direction ที่ spec ไม่ได้เขียนเป็น rule |
| NB-012 | โพสต์อิสระไม่บังคับบันทึก Asset | covered | 02_FEED §9 — post mode `pfkind:"post"` (drawer OFF default), `Also save to My Assets` เป็น opt-in | |
| NB-013 | รองรับหลายประเภทคอนเทนต์ (ขาย/โชว์/WTB/บริการ) | covered | 02_FEED §2 — `sale` + `showcase` + plain `post` | ✅ ชี้แจงโดยผู้ใช้ 2026-11-04: พี่คิงหมายถึง **โพสต์ธรรมดา (plain post)** ที่มีอยู่แล้ว — โพสต์รับซื้อ/รับซ่อม คือโพสต์ทั่วไปเลย ไม่ต้องการ post type เฉพาะ |
| NB-014 | Clean UI Header (ย่อ search + WA เป็นปุ่มเล็ก) | partial | 00_NAV §6.4 — app header = burger + **search icon** + wordmark + `+` | search เป็นไอคอนแล้ว ✓ แต่ **ไม่มี Watch Alert บน feed header เลย** (WA entry = `sr-wa` bell ใน search, `mf-btn` ใน detail, Settings > Watch Alerts) — ✅ ยืนยันใน snapshot: NB-036 ระบุชัด "ปุ่ม Watch Alert **บนหน้าฟีด**เป็นปุ่มขนาดเล็กเท่าปุ่ม (+)" → ✅ อนุมัติเพิ่ม: ทำแล้วใน prototype (ไอคอนกระดิ่งข้าง + → walerts, guest gated) — spec delta รอ REQ-020 |

## ตารางเทียบ NB-015 – NB-021 (source: รูป ThaiLand News) — **design reference**

ผู้ใช้ยืนยันแล้ว (บันทึกใน requirement record 20885c46): รูป 1791522927333.jpg เป็นภาพตัวอย่างที่พี่คิงให้ดู — design reference/mood board **ไม่ใช่ requirement ตรง** — การตัดสินใจรายข้ออยู่ที่ `REQ-010-decision-log.md` DEC-R010-02

| NB | หัวข้อ | Verdict | หมายเหตุ |
|----|--------|---------|----------|
| NB-015 | Today Dashboard "ThaiLand News" modular widgets | design-ref | ไม่ผูกเป็น requirement — ไม่มี Today/dashboard surface ใน spec (feed คือ home) |
| NB-016 | Dashboard header (ธงชาติ/โลโก้/search/notif/widget mgmt) | design-ref | ไม่ผูก — header pattern ของ TukDaeng ตาม 00_NAV §6.4 แล้ว |
| NB-017 | Shortcut toolbar 5 ไอคอน (ตำแหน่ง/สกุลเงิน/เวลา/เตือน/วิดเจ็ต) | design-ref | ไม่ผูก — ไม่มี widget framework |
| NB-018 | Today Time widget | design-ref | ไม่ผูก |
| NB-019 | Calendar & cultural events widget | design-ref | ไม่ผูก |
| NB-020 | Weather forecast widget | design-ref | ไม่ผูก |
| NB-021 | Bottom nav 5 เมนู (Today/All/Your/Local/Profile) | design-ref | ไม่ผูก — TukDaeng มี bottom nav 5 แท็บอยู่แล้วแต่ semantics ต่างกัน (Feed/Chat/Boards/Alerts/Profile); ความเหมือนเป็นเรื่องบังเอิญ |

## ตารางเทียบ NB-022 – NB-051 (source: เสียงบันทึกพี่คิง .m4a)

| NB | หัวข้อ | Verdict | Spec reference | หมายเหตุ |
|----|--------|---------|----------------|----------|
| NB-022 | จักรวาล "Use Thailand" หมวด Collectible, เริ่มนาฬิกา | covered | Master Product Definition (watch marketplace community) | ✅ ชี้แจงโดยผู้ใช้ 2026-11-04: "Use Thailand" = **กลุ่มแอปแยกกัน** ไม่ใช่หลายหมวดในแอปเดียว — TukDaeng เป็นแอปของสะสมหมวดนาฬิกาก่อน ถ้าโอเคค่อย clone เป็นแอปหมวดอื่น (พระ/กีตาร์ ฯลฯ) ใต้ umbrella เดียวกัน → spec เป็น watch-only **ถูกต้องตาม intent** ไม่ต้องเผื่อ multi-category data model |
| NB-023 | ระบบจัดเก็บ Asset ส่วนตัว + ประเมินมูลค่า | covered | 04_ASSET_MGMT (drawer/`pfkind`), 14_PORTFOLIO (Total invested + market value, `pfoCur` mkt→purchase→none) | ตรง "ไม่ใช่ marketplace เพียว" |
| NB-024 | เชื่อมข้อมูลข้ามไป Family Office (import) | gap | 16_INTEGRATIONS ไม่มี Family Office (in-scope: Apple/Google sign-in, FCM, CDN, Watch Price API) | integration ใหม่ทั้งระบบ |
| NB-025 | UX ล้อ IG | covered | เหมือน NB-002 | duplicate ของ NB-002 |
| NB-026 | ยกเลิก thumbnail บนฟีด | covered | 02_FEED §9 — card `a1` hero carousel; grid thumbnails มีเฉพาะ profile/search grid (IG pattern) | |
| NB-027 | สไลด์รูป + ตัวเลขอัลบั้ม (1/N) | covered | 02_FEED §9 — `photo-counter` `1/N` + `photo-dots` | |
| NB-028 | description สั้น 2–3 บรรทัดใต้อิมเมจ | covered | 02_FEED §9 — caption short + `more` | |
| NB-029 | Information 3 ชั้น | covered | เหมือน NB-005/006/007 รวมกัน | duplicate summary |
| NB-030 | spec table ซ้าย-ขวา ฟิลด์ว่าง = `n/a` | covered | 05_ASSET_DETAIL §9 — `spec-row` label–value, `N/A` render ตรง ๆ ไม่มี row-hiding; composer emit `N/A` (02_FEED Publish Rule) | `detail-name`/`detail-ref` ตัด n/a ตอนประกอบชื่อ — ไม่ขัด (นั่นคือ title ไม่ใช่ตาราง) |
| NB-031 | ยกเลิก sticky price bar; ราคาอยู่ในเนื้อหา ตัวเลขใหญ่กว่าปกติเล็กน้อย | covered | 05_ASSET_DETAIL — ไม่มี sticky bar (sticky เฉพาะ `detail-head`); ราคาอยู่ใน `Price & Data Source` spec group | ✅ ผู้ใช้ตัดสินใจ 2026-11-04: **คงดีไซน์ล่าสุด** (ราคาเป็น spec row ธรรมดา) ไม่ขยายตัวเลข — intent หลัก (ไม่มี sticky bar + ราคาอยู่ในเนื้อหา) ครอบแล้ว |
| NB-032 | Engagement 5 ปุ่ม + Quick Ask | covered | เหมือน NB-009/010 | duplicate |
| NB-033 | เงื่อนไขนับ view (อนุโลมนับทุก scroll ช่วงแรก) | partial | 02_FEED §9 — `views` read-only stat (eye + count) | ✅ อนุมัติ rule ตามพี่คิง: นับทุก scroll-pass (นับซ้ำ) ช่วงแรก — ทำแล้วใน prototype; spec delta รอ REQ-020 |
| NB-034 | ลดความฉูดฉาดปุ่ม Follow | partial | เหมือน NB-011 | Follow button มีอยู่ แต่ไม่มี rule เรื่องขนาด/สีเฟด |
| NB-035 | ย่อช่อง search เป็นไอคอนข้าง burger | covered | 00_NAV §6.4 — search เป็น icon บน app header | |
| NB-036 | Watch Alert เป็นปุ่มเล็กบนฟีด + ย้าย config เข้า Page Config | partial | 00_NAV §6.4 (header ไม่มี WA), 10_WATCH_ALERT, 07_CHAT `chatcfg` | ✅ ยืนยันใน snapshot: requirement ระบุ "ปุ่ม Watch Alert **บนหน้าฟีด**เป็นปุ่มขนาดเล็กเท่าปุ่ม (+)" ชัดเจน → ✅ อนุมัติเพิ่ม WA button (ทำแล้วใน prototype); page-config → เพิ่มเฉพาะหน้าที่มีของให้ตั้งจริง |
| NB-037 | ปุ่ม (+) ฟีด = Post / (+) โปรไฟล์ = Add Asset | covered | 02_FEED §9 Composer Entry & Modes Rule + AC-FEED-040 | ตรงทุกประการ |
| NB-038 | โพสต์หลากประเภท (ไม่มีของในมือ/WTB/โชว์/บริการ) | covered | เหมือน NB-013 | ✅ ชี้แจงโดยผู้ใช้ 2026-11-04: พี่คิงหมายถึงโพสต์ธรรมดา — feed รองรับ plain post ไม่ผูก asset อยู่แล้ว = intent ครอบ |
| NB-039 | โควตาการโพสต์ผู้ค้า | gap | ไม่มีใน spec ใด ๆ | business rule + constraint ใหม่ทั้งระบบ — ✅ ผู้ใช้ตัดสินใจ 2026-11-04: **เรื่องอนาคต** (รอเปิดใช้จริง คนใช้เยอะขึ้นค่อยเพิ่ม) ไม่เอาเข้า V1 — บันทึกเป็น future consideration |
| NB-040 | แชทธรรมชาติซ้าย-ขวา ไม่มีการ์ด accept/reject | covered | 07_CHAT §2 — bubble ซ้าย-ขวาแบบ LINE/IG; Offer/accept-reject ถอดออกจาก V1 ทั้งชุด | |
| NB-041 | โพสต์อ้างอิงฝังใน bubble (reply-story style) | covered | 07_CHAT — `ch-post-card` render จาก `m.pid` ในสายข้อความ | ตรงเป๊ะ IG story-reply pattern |
| NB-042 | ไม่มีแถบปักหมุดสินค้าบนหัวห้องแชท | covered | 07_CHAT §3 — "ไม่มีการ์ด pin ค้าง" (card มาจาก `m.pid` เท่านั้น) | |
| NB-043 | รวมแชทต่อคน (User View) | covered | 07_CHAT §2 — Chats view เรียงตามคู่สนทนา | |
| NB-044 | สลับ Item View (group by listing) | covered | 07_CHAT §2 — Items view (`Your listings` / `Items you asked about`) + filter popover | |
| NB-045 | ฟีเจอร์เสริม: read receipts + ปักหมุดห้อง | covered | 07_CHAT — `Sent`/`Read` บนข้อความล่าสุด + pin room (`pinnedAt`, pin-first, badge) | เป็น optional ตาม NB; spec มีอยู่แล้ว (read receipts "จริง" lifecycle เป็น future enhancement — แต่ NB ก็ระบุเป็นเสริมเช่นกัน) |
| NB-046 | Notification Center รวมทุกประเภท + filter หมวด | partial | 09_NOTIFICATION — Alerts feed รวม like/comment/follow/watch จุดเดียว | ✅ ยืนยันใน snapshot: requirement ระบุ "ระบบ" ชัด → system type ต้องเอากลับ; "ฟิลเตอร์กรองหมวดหมู่" = กรองหมวดการแจ้งเตือน (ไม่ใช่ WA filter) → ต้องเพิ่ม; **chat แยก badge-only ถูกต้อง** — ✅ ผู้ใช้อนุมัติ proposed subtypes 2026-11-04: security (login เครื่องใหม่/เปลี่ยนรหัส), account status (verify/โพสต์ถูกลบ), announcements (อัปเดต/กิจกรรม/นโยบาย) — ทำ spec delta ไปเสนอพี่คิง |
| NB-047 | Page Config pattern ทุกหน้า | partial | 07_CHAT `chatcfg` (chat เท่านั้น); feed/board/ฯลฯ ใช้ Settings > Content preferences | pattern มี prototype อยู่ที่ chat — แต่ไม่ได้เป็น global rule ทุกหน้า; ✅ อนุมัติ 2026-11-04: เพิ่ม config เฉพาะหน้าที่มีของให้ตั้งจริง ไม่บังคับทุกหน้า |
| NB-048 | โปรไฟล์ล้อ IG + ปุ่ม Setting เป็นฟันเฟือง | partial | 06_PROFILE — IG-style (avatar+ring+stats+bio+tabs+grid) ✓; settings entry = `pf-menu` **burger** | ✅ อนุมัติเปลี่ยนเป็น gear ตามพี่คิง — ทำแล้วใน prototype (`pf-menu` burger→gear) |
| NB-049 | Release cycle 2 ครั้ง/สัปดาห์ | gap | 17_NFR ครอบ perf/security/l10n/a11y เท่านั้น | development process constraint — อยู่นอกขอบเขต module specs โดยธรรมชาติ |
| NB-050 | ทดสอบบน production env จริง | gap | ไม่มี | process/environment rule |
| NB-051 | กระบวนการ Figma Make/AI + สรุปประชุมด้วย AI | gap | ไม่มี | process constraint |

---

## สรุปผล (Spec-level)

| Verdict | จำนวน | รายการ |
|---------|-------|--------|
| covered | 31 | NB-001,002,003,004,005,006,007,008,009,010,012,013,022,023,025,026,027,028,029,030,031,032,035,037,038,040,041,042,043,044,045 |
| partial | 8 | NB-011,014,033,034,036,046,047,048 |
| gap | 5 | NB-024,039,049,050,051 |
| design-ref | 7 | NB-015,016,017,018,019,020,021 |

> verdict อัปเดตหลังชี้แจงกับผู้ใช้ 2026-11-04: NB-013/022/031/038 จาก partial → covered (เหตุผลอยู่ในตารางรายข้อ); NB-039 คง gap แต่ผู้ใช้ตัดสินใจ **defer — เรื่องอนาคต ไม่เอาเข้า V1**

**จุดที่ spec แข็งแรงสุด:** feed UX ล้อ IG + 3-layer info + engagement actions + composer 2 mode + chat (เกือบทั้งชุด NB-040–045 ตรงเป๊ะ)

**จุดที่เป็น gap/partial หลัก:**
1. **Integration ใหม่** — Family Office link (NB-024) อยู่นอก spec (เสนอ defer phase 2)
2. **Business rules ใหม่** — view counting rule (NB-033); posting quota (NB-039) defer เป็นเรื่องอนาคต
3. **UI details** — soft-UI/เฟดปุ่ม Follow (NB-011/034), WA button บน feed header (NB-014/036 — requirement ยืนยันชัดใน snapshot), gear-vs-burger (NB-048)
4. **Notification** — system type ต้องเอากลับ (subtypes อนุมัติแล้ว: security/account/announcement) + category filter ต้องเพิ่ม (NB-046); chat แยก badge-only ถูกต้องแล้ว
5. **Pattern** — page-config (NB-047) มีแค่ chat — แต่เสนอเพิ่มเฉพาะหน้าที่มีของให้ตั้งจริง (ทบทวนโดยผู้ใช้)
6. **Process** — release cycle, prod-env test, Figma/AI workflow (NB-049–051) — นอกขอบเขต module spec

> ⚠️ ตารางนี้เป็น **evidence ระดับ spec เท่านั้น** — verdict ขั้นสุดท้าย (proposed action) อยู่ที่ `REQ-010-decision-log.md` และ Gap Report รวม (REQ-012) หลังเทียบ prototype ใน REQ-011
