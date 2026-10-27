# FO-TEST-001 — Task Breakdown: แยกงานสร้าง Test Case ทีละ Module

> แตกจาก master prompt `FO-TEST-001-testcase-prompt.md` ออกเป็น **21 task**
> ทำทีละ task ได้ ไม่ต้องทำรวดเดียว — แต่ละ block คือ prompt สมบูรณ์ในตัว
> ก๊อปทีละ block ไปวางสั่ง agent ได้เลย

## ภาพรวม Task ทั้งหมด

| # | Task ID | Module | Depends on | ประมาณ TC |
|---|---------|--------|-----------|-----------|
| 0 | FO-TEST-00 | Inventory & Master Coverage Map | — (ทำก่อนเสมอ) | — |
| 1 | FO-TEST-01 | Auth & Onboarding | 00 | 40–60 |
| 2 | FO-TEST-02 | Shell & Navigation | 00 | 30–45 |
| 3 | FO-TEST-03 | Feed & Post Cards | 00 | 50–70 |
| 4 | FO-TEST-04 | Search & Filter | 00 | 35–50 |
| 5 | FO-TEST-05 | Create Composer (post/asset) | 00 | 45–65 |
| 6 | FO-TEST-06 | Post Viewer & Post Detail | 00 | 40–60 |
| 7 | FO-TEST-07 | Bottom Sheets & Quick Actions | 00, 03 | 35–50 |
| 8 | FO-TEST-08 | Chat | 00 | 45–65 |
| 9 | FO-TEST-09 | Board (นิตยสาร) | 00 | 25–40 |
| 10 | FO-TEST-10 | Alerts & Notifications | 00 | 30–45 |
| 11 | FO-TEST-11 | Watch Alert | 00, 04 | 30–45 |
| 12 | FO-TEST-12 | Profile (own + public) | 00 | 45–65 |
| 13 | FO-TEST-13 | Portfolio & Asset Management | 00, 05 | 45–65 |
| 14 | FO-TEST-14 | Library (saved/wishlist/archive/ni) | 00, 03 | 35–50 |
| 15 | FO-TEST-15 | Settings (15 หน้าย่อย) | 00 | 60–90 |
| 16 | FO-TEST-16 | Trust & Safety (report/block) | 00 | 35–50 |
| 17 | FO-TEST-17 | Guest Gate & Member Sheet | 00–16 (ทำหลัง module หลัก) | 30–45 |
| 18 | FO-TEST-18 | E2E Integration Scenarios | 01–17 | 15–25 เส้น |
| 19 | FO-TEST-19 | i18n & Theme Sweep | 01–16 | 30–50 |
| 20 | FO-TEST-20 | Traceability & Gap Audit | ทั้งหมด (ปิดท้าย) | — |

**ลำดับแนะนำ:** 00 → (01–16 ทำขนานหรือเรียงตามสะดวก) → 17, 18, 19 → 20 ปิดท้าย

---

## TASK FO-TEST-00 — Inventory & Master Coverage Map (ทำก่อนเสมอ)

```text
อ่าน D:\TukDaeng\deliverables\FO-TEST-001-testcase-prompt.md เป็นกติกาหลัก
(โดยเฉพาะ Source of Truth / Actors / กติการะบบ / format)

งานของ task นี้ทำแค่ "ส่วนที่ 1 — Master Coverage Map" เท่านั้น:
1. อ่าน D:\TukDaeng\Prototypes\fo-flow\index.html ทั้งไฟล์
   inventory ออกมาให้ครบ:
   - ทุก route / sub-page (ดึงจาก renderSub / openSub / route map จริง)
   - ทุก overlay / bottom sheet / modal / dialog / toast
   - ทุก menu entry / tab / ปุ่ม action (รวม post menu ..., row menu)
   - ทุก state/สถานะ (asset status, post status, session guest/member)
   - ทุก validation / error / empty / loading state ที่โค้ด render จริง
2. เทียบกับ Feature map + Sitemap ใน
   D:\TukDaeng\deliverables\FO-DIAG-001-fo-app-diagrams.md
   - พบในโค้ดแต่ไม่มีใน diagram → mark [OPEN-CODE-ONLY]
   - มีใน diagram แต่หาในโค้ดไม่เจอ → mark [OPEN-NO-CODE]
3. ส่งออกตาราง: | Module | Route/Overlay | Feature | Actor ที่เกี่ยว |
   จำนวน TC ที่ควรมี | หมายเหตุ |
   ครบทุก route — ตารางนี้คือ "สัญญาความครอบคลุม" ที่ task อื่นต้องอ้าง
Output: deliverables/FO-TEST-001-00-inventory.md
```

---

## TASK FO-TEST-01 — Auth & Onboarding

```text
อ่าน D:\TukDaeng\deliverables\FO-TEST-001-testcase-prompt.md เป็นกติกาหลัก
ใช้ inventory จาก deliverables/FO-TEST-001-00-inventory.md เป็น checklist ครอบ

ขอบเขต: เฉพาะ Auth + Onboarding
- onboarding (first launch, welcome/track/notif slides, skip, จบแล้วเข้าอะไร)
- sign up / sign in (email+password, OTP, validation ทุกฟิลด์, error states)
- SSO Apple + Google (success / cancel / error / guest→member resume)
- session state: guest → member, member → logout → guest
- change password (ใน settings — ทำแค่ flow auth ส่วนนี้)
- delete account (grace 30 วัน, login-to-restore, post-restore state)
- Member Sheet "Join TukDaeng" (ทำเฉพาะ mechanics ของ sheet ตัวมัน:
  เปิด/ปิด/skip/ไป auth — เคส gated action ทั้งหมดอยู่ใน task FO-TEST-17)

เคสบังคับ: ทุกฟอร์มต้องมี happy + validation error ทุกฟิลด์ + guest variant
TC ID: FO-TC-AUTH-nnn
Output: deliverables/FO-TEST-001-01-auth.md
```

---

## TASK FO-TEST-02 — Shell & Navigation

```text
อ่าน master prompt + inventory เหมือน task อื่น

ขอบเขต: App Shell ที่ mount ตลอด + navigation ทั่วไป
- App Header: burger drawer / search icon / wordmark / + create button
  (member vs guest ต่างกันไหม)
- Drawer 9 รายการ (Watch Shops, Auction Center ฯลฯ) — ทุกรายการต้องมีเคส
  ยืนยันพฤติกรรม placeholder ว่าแสดงถูก (ห้ามข้ามเพราะ "ดูเหมือน placeholder")
- Bottom Nav 5 แท็บ: active state, กดซ้ำ tab เดิม, สลับ tab ค้าง state,
  badge บนแท็บ (alerts)
- Feed Tabs segmented control: All Posts / Following / Favorites —
  pill สไลด์, active color, เนื้อหาเปลี่ยน
- Scroll-to-hide/show: header หลบขึ้น + bottom nav จมลงตอนเลื่อนลง,
  กลับมาตอนเลื่อนขึ้น, edge case สลับแท็บตอนแถบหลบ
- Back navigation ทุกรูปแบบ: back button / browser back / deep overlay back
- กติกาบังคับที่ต้องมีเคส: "ปุ่ม back ของ Alerts กลับ Feed เสมอ"

TC ID: FO-TC-SHELL-nnn
Output: deliverables/FO-TEST-001-02-shell.md
```

---

## TASK FO-TEST-03 — Feed & Post Cards

```text
อ่าน master prompt + inventory

ขอบเขต: หน้า Feed (root) + post card ทุกแบบ + action บนการ์ด
- Post card 2 แบบ: Sale post (มีราคา/specs/Ask Seller pill) vs โพสต์ธรรมดา
- Media carousel ในการ์ด: swipe, dot indicator, หลายรูป/รูปเดียว/ไม่มีรูป
  กติกาบังคับ: กด media บน feed card ได้แค่ carousel ในการ์ดเดิม
  ห้ามเปิด Post Viewer (ต้องมีเคสยืนยันทั้ง 2 ฝั่ง)
- Actions บนการ์ด: like (toggle/count), comment (เปิด sheet), share
  (member-only — guest เจอ Member Sheet), save, wishlist, not-interested,
  follow seller, กด avatar/name → public profile
- Post menu (...): archive, pin, edit, mark as sold, report —
  เมนูของเจ้าของโพสต์ vs ของคนอื่นต้องต่างกัน
- Feed content: การ์ดแรก/การ์ดสุดท้าย, pull refresh (ถ้ามี), infinite scroll,
  empty feed (ติดตาม 0 คนในแท็บ Following), filter ที่ feed ว่าง
- i18n/ข้อความยาว: caption ยาว, ชื่อยาว, ราคา (อ้าง docs/money-display-rules.md
  ถ้าครอบการแสดงเงิน)

TC ID: FO-TC-FEED-nnn
Output: deliverables/FO-TEST-001-03-feed.md
```

---

## TASK FO-TEST-04 — Search & Filter

```text
อ่าน master prompt + inventory

ขอบเขต: search landing → recents → suggest → results + sfilter
- Search landing: explore tiles, recents (มี/ว่าง/ลบรายการ), suggest ขณะพิมพ์
- Results: ผลเยอะ/น้อย/0 ผล (no-result state + UI แนะนำ), sort, layout grid
- Filter sfilter: brand, model, price range, delivery, strap, box&papers —
  เลือกทีละตัว, เลือกหลายตัวรวมกัน, clear/reset, apply แล้วผลเปลี่ยน,
  chip/tag แสดง filter ที่เลือก, filter ค้างเมื่อ back
- Search bell → สร้าง Watch Alert (entry point — flow สร้างอยู่ใน FO-TEST-11)
- Tap ผลลัพธ์ → Post Viewer (กติกา: viewer เปิดจาก grid tile)
- Guest: search/filter ใช้ได้ฟรี? action ไหน gated → Member Sheet

TC ID: FO-TC-SRCH-nnn
Output: deliverables/FO-TEST-001-04-search.md
```

---

## TASK FO-TEST-05 — Create Composer

```text
อ่าน master prompt + inventory

ขอบเขต: + create → composer 2 โหมด (post / asset)
- Entry: ปุ่ม + บน header (member เท่านั้น — guest เจอ Member Sheet)
- Mode post ธรรมดา: feed-only ไม่ผูก asset — เขียน caption, แนบรูป
- Mode asset: ฟอร์ม specs ครบ (brand, model, ราคา, condition, delivery,
  strap, box&papers ฯลฯ ตามที่โค้ด render จริง), photo upload
  (เพิ่ม/ลบ/เรียง), validation ทุก required field + error UI
- Visibility/สถานะเริ่มต้น: "โพสต์ลงฟีด" (Post to feed) vs สถานะอื่น —
  ทุก vis option ที่โค้ดมี (sale / show / hide / feed)
- Save → drawer record (PF_MINE link assetId) + toast ถูกข้อความ +
  โพสต์ไปขึ้นที่ไหนบ้าง (feed/search ตาม vis)
- Cancel/discard mid-form, draft persistence (ถ้ามี), กดออกกลางทาง
- เคสเชื่อม: สร้างเสร็จ → โพสต์ไปโผล่ feed ทันทีไหม (mark เป็น Int type)

TC ID: FO-TC-CRE-nnn
Output: deliverables/FO-TEST-001-05-create.md
```

---

## TASK FO-TEST-06 — Post Viewer & Post Detail

```text
อ่าน master prompt + inventory

ขอบเขต: overlay 2 ชั้นนี้เท่านั้น (ไม่รวม bottom sheets — อยู่ FO-TEST-07)
- Post Viewer (.page-pv): immersive 3 modes — ทุก mode, swipe ระหว่างโพสต์,
  feedMode vs collection mode, เปิดจาก grid tile / notification / saved /
  profile grid / alerts row — ทุก entry point ที่ inventory เจอ
- Post Detail (.page-detail = asset-detail equivalent): เนื้อหา specs ครบ,
  gallery, owner section, ปุ่ม Ask Seller, bell (follow model), wl-btn
- กติกาบังคับ (ต้องมีเคสยืนยัน):
  * viewer เปิดได้เฉพาะจาก grid tiles / notifications
  * detail อยู่เหนือ viewer เสมอ — detail-back เผย viewer ข้างล่าง
  * "View full detail" จาก viewer → detail
  * "Tap for details" จาก feed card → detail โดยตรง
- ปิด overlay ทุกวิธี: back button, backdrop, swipe (ถ้ามี), ESC
- Action บน detail: like/comment/save/share/wishlist/watch alert/report
  (mechanics ของ sheet อยู่ task 07 — ที่นี่เช็คแค่ entry + state sync)

TC ID: FO-TC-PV-nnn / FO-TC-DET-nnn
Output: deliverables/FO-TEST-001-06-viewer-detail.md
```

---

## TASK FO-TEST-07 — Bottom Sheets & Quick Actions

```text
อ่าน master prompt + inventory

ขอบเขต: bottom sheets ทั้งหมด (openSheet mechanics + แต่ละ sheet)
- comments sheet: ดู/พิมพ์/sent, reply ได้ 1 ชั้น (กติกาบังคับ —
  ต้องมีเคส reply ชั้น 2 ว่าทำไม่ได้), like comment, popover จุดต่าง ๆ
- likes sheet: รายชื่อคน like, ว่าง, เยอะ
- share sheet: member-only — member เห็นอะไร กดแล้วเกิดอะไร
- save sheet / wishlist sheet: เลือก collection, สร้าง collection ใหม่,
  เคส asset อยู่หลาย collection
- watch alert sheet (entry จาก detail bell — flow เต็มอยู่ FO-TEST-11)
- openDlg / openSub mechanics: เปิด/ปิด/backdrop/ESC, sheet ซ้อน sheet,
  toast หลัง action สำเร็จ, sheet บน guest → Member Sheet แทน

TC ID: FO-TC-SHT-nnn
Output: deliverables/FO-TEST-001-07-sheets.md
```

---

## TASK FO-TEST-08 — Chat

```text
อ่าน master prompt + inventory

ขอบเขต: chat list + chatroom:id + ฟีเจอร์ในห้องทั้งหมด
- Chat list: รายการคุย, preview ล่าสุด, unread badge, empty state,
  กดเข้าห้อง, long-press/menu บน item (ถ้ามี)
- Chat room (chatroom:id): item-scoped เสมอ — การ์ด asset ปักหัวห้อง,
  กดการ์ด → Post Detail แล้วกลับมา, ส่งข้อความ, สถานะข้อความ
- chatitem / chmenu / chmedia / chatcfg ทุก route:
  * attach sheet (openChatAttachSheet): รูป/กล้อง/อื่น ๆ ตามโค้ด
  * media viewer (openChatMediaViewer): ซูม/ปิด/swipe
  * chatcfg: ตั้งค่าห้อง, hide chat (openChatHideConfirm),
    delete chat (openChatDeleteConfirm) — ทุก confirm state
- block / report จาก chat (entry point — flow report อยู่ FO-TEST-16)
- Ask Seller entry: จาก feed card / detail → เปิดห้องผูก item เดิมหรือสร้างใหม่
- Edge: ห้องของ asset ที่ sold/hide แล้ว, ข้อความยาว, หลายรูป

TC ID: FO-TC-CHAT-nnn
Output: deliverables/FO-TEST-001-08-chat.md
```

---

## TASK FO-TEST-09 — Board

```text
อ่าน master prompt + inventory

ขอบเขต: board → boardall / boardsearch → boardart:id
- Board landing: hero, latest, categories — layout แต่ละส่วน
- boardall: รายการทั้งหมด, pagination/scroll, empty
- boardsearch: ค้นหาใน board, ผล/ไม่มีผล
- boardart:id (article detail): เนื้อหา editorial, รูป, แชร์, like —
  like/share ของ article gated ไหม (guest variant)
- Navigation: board → article → back กลับตำแหน่งเดิม
- Edge: บทความยาว, รูปเสีย, ชื่อ category ยาว

TC ID: FO-TC-BRD-nnn
Output: deliverables/FO-TEST-001-09-board.md
```

---

## TASK FO-TEST-10 — Alerts & Notifications

```text
อ่าน master prompt + inventory

ขอบเขต: alerts tab + กลไก notification (ไม่รวม walerts — อยู่ FO-TEST-11)
- Alert list: 5 types (Like / Comment / Follow / Watch Alert / System) —
  รูปแบบ row แต่ละ type, actor avatar, เวลา, read/unread state
- Badge: นับถูก, แสดง 99+ เมื่อเกิน (กติกาบังคับ), เคลียร์เมื่ออ่าน
- mark all read: state ทุก row เปลี่ยน + badge หาย
- Tap row → Post Viewer ตรง (like/comment/watch alert) —
  follow alert ไปไหน, system alert ไปไหน — เช็คทุก type
- กติกาบังคับ: back button ของ Alerts กลับ Feed เสมอ (ไม่ pop stack)
- Empty state, alert ที่ target ถูกลบแล้ว (post ลบ/asset sold)

TC ID: FO-TC-ALT-nnn
Output: deliverables/FO-TEST-001-10-alerts.md
```

---

## TASK FO-TEST-11 — Watch Alert

```text
อ่าน master prompt + inventory

ขอบเขต: watch alert ทั้งวงจร
- สร้าง: จาก search bell + จาก bell ใน Post Detail (follow model) —
  ฟอร์ม criteria ที่โค้ดมีจริง, validation, บันทึก
- walerts list (เข้าจาก alerts tab): รายการ alert, สถานะ, แก้ไข/ลบ/ปิด,
  empty state, alert ที่ inactive
- Match & notify: asset ใหม่ match criteria → alert row เด้ง →
  tap → Post Viewer ตรง (กติกาบังคับ)
- Alert ที่ trigger แล้ว vs ยังไม่ trigger — แสดงต่างกันไหม
- Guest: ทุก entry สร้าง alert → Member Sheet
- Edge: criteria ขัดแย้งกัน, alert ซ้ำ, ลบแล้ว notif เก่ายังกดได้ไหม

TC ID: FO-TC-WA-nnn
Output: deliverables/FO-TEST-001-11-watchalert.md
```

---

## TASK FO-TEST-12 — Profile

```text
อ่าน master prompt + inventory

ขอบเขต: own profile + public profile (profile:user) + sub-pages
- Own profile: header (avatar, bio, stats), grid tabs (ทุก tab ใน TABS —
  all + อื่น ๆ ตามโค้ด), empty แต่ละ tab, QR, ปุ่ม edit → pedit
- pedit (edit profile): ทุกฟิลด์, avatar upload, validation, save/cancel
- Public profile: เห็นอะไรของคนอื่น, ปุ่ม follow/unfollow, message,
  block/report entry, grid ของเขา
- pfollow: followers / following list, กดเข้า profile ซ้อน, unfollow จาก list
- pfasset: asset ของ user นั้น
- tap grid tile → Post Viewer (กติกา viewer entry)
- Follow mechanics: follow → เข้า Following tab ของ feed + favorites seller
- Edge: profile ของคนที่ block เรา/เรา block (keep-page rule), ชื่อยาว

TC ID: FO-TC-PROF-nnn
Output: deliverables/FO-TEST-001-12-profile.md
```

---

## TASK FO-TEST-13 — Portfolio & Asset Management

```text
อ่าน master prompt + inventory

ขอบเขต: portfolio + soldhist / sold / sell + asset lifecycle ทั้งหมด
- Portfolio: total invested dashboard, asset value detail แต่ละชิ้น,
  รูป/สเปก, ค่าที่คำนวณ (ถ้ามีกติกาเงินอ้าง docs/money-display-rules.md)
- soldhist: รายการ sold history, รายละเอียดแต่ละ record
- sell (openSellForm / sell:id): ฟอร์มลงขาย asset จาก portfolio
- Asset lifecycle ครบทุก transition: Sale → Sold, Sale ↔ Hide,
  Show → Sale (ลงขายทีหลัง), Sold → (ย้อนได้ไหม)
- Mark as Sold + Sale Record: ฟอร์ม record, ผลต่อ portfolio,
  ผลต่อ feed post (badge sold?), ผลต่อ search/alert
- Gallery/drawer: asset ที่ save ในลิ้นชัก (vis ไม่ใช่ feed)
- POSTS ↔ PF_MINE ↔ assetId link: edit info ย้าย ขาย/โชว์ แล้ว sync ถูก
- Edge: asset รูปเสีย, ราคา 0/ใหญ่มาก, sold แล้วคนยัง chat ได้ไหม

TC ID: FO-TC-AST-nnn / FO-TC-PF-nnn
Output: deliverables/FO-TEST-001-13-portfolio-asset.md
```

---

## TASK FO-TEST-14 — Library (Saved / Wishlist / Archive / NI)

```text
อ่าน master prompt + inventory

ขอบเขต: saved → savedcol / archive, wishlist → wishcol, interested / ni
- saved: SAVED_TABS ทุกแท็บ, savedcol (collection), ย้ายระหว่าง collection,
  ลบออก, empty แต่ละ collection
- archive: โพสต์ที่ archive, unarchive กลับ, archive แล้วหายจาก feed ไหม
- wishlist → wishcol: ต่างจาก saved ยังไง, item ใน wishlist
- interested / ni (not-interested list): ของที่กด "ไม่สนใจ" มาอยู่นี่,
  undo แล้วกลับ feed ไหม
- tap item → Post Viewer (entry อีกจุด)
- Sync: save จาก feed/detail/viewer แล้วมาโผล่ที่นี่ครบ — เคส Int
- Edge: collection ว่าง, ชื่อ collection ยาว, asset ใน collection ถูกลบ

TC ID: FO-TC-LIB-nnn
Output: deliverables/FO-TEST-001-14-library.md
```

---

## TASK FO-TEST-15 — Settings

```text
อ่าน master prompt + inventory

ขอบเขต: settings landing + 15 หน้าย่อย (ครบทุก route ห้ามตก)
  about_account / change_pwd / del_account / lang / theme /
  notif_settings / favorites / muted / blocked / prefs / sensitive /
  help / privacy / terms / about_app
- Settings list: ทุก menu row, กลุ่ม section, chevron/navigate ถูกหน้า
- แต่ละหน้าย่อย: form/toggle/list ตามที่โค้ด render — ทุก control ต้องมีเคส
  * lang: สลับ TH↔EN แล้วทั้งแอปเปลี่ยน (เชื่อม task 19)
  * theme: Light↔Dark (เชื่อม task 19)
  * change_pwd: validation + wrong current (flow detail ร่วมกับ task 01)
  * del_account: เชื่อม task 01 — ที่นี่เช็ค entry + confirm UI
  * blocked/muted: list + unblock/unmute + ผลกลับไป feed
  * sensitive/prefs/notif_settings: toggle เปลี่ยนพฤติกรรมจริงตรงไหน
  * privacy/terms/about_app/help: content page render ถูก
- back กลับ settings landing ทุกหน้า, state ค้างหลังตั้งค่า
- Edge: toggle รัว ๆ, สลับภาษาค้างอยู่หน้าย่อย

TC ID: FO-TC-SET-nnn
Output: deliverables/FO-TEST-001-15-settings.md
```

---

## TASK FO-TEST-16 — Trust & Safety (Report / Block)

```text
อ่าน master prompt + inventory

ขอบเขต: report flow + block + moderation entry ทั้งหมด
- Report Stack: report → report:pick → report:done — ทุกขั้น,
  เหตุผลแต่ละตัวเลือก, note/รายละเอียดเพิ่ม, cancel กลาง flow,
  done state + ผลลัพธ์ที่เห็น (โพสต์หาย? toast?)
- Report entry ทุกจุด: post menu, profile, chat, comment — ครบทุก entry
- Report target ทุกแบบ: user / post / comment / chat
- Block: จาก profile/chat — IG keep-page rule (หน้าอยู่แต่ interaction ตัด),
  เข้า blocked list (เชื่อม task 15), unblock
- Moderation handoff → BO: เคสเชื่อมว่า report ส่งไป BO (ระดับ prototype:
  เช็ค UI/state ฝั่ง FO ที่บ่ง handoff)
- Edge: report ซ้ำ, report ตัวเอง (ทำได้ไหม), report ของที่ถูกลบแล้ว

TC ID: FO-TC-TRS-nnn
Output: deliverables/FO-TEST-001-16-trust-safety.md
```

---

## TASK FO-TEST-17 — Guest Gate & Member Sheet (ทำหลัง module หลัก)

```text
อ่าน master prompt + inventory + test case ที่ module อื่นทำแล้ว

ขอบเขต: cross-cutting — guest × ทุก gated action ในแอป
1. ลิสต์ gated actions ทั้งหมดจาก inventory + โค้ด (guestCanX / member sheet
   trigger): like, comment, share, save, wishlist, follow, not-interested,
   create, chat/ask seller, watch alert, report, block, ฯลฯ ที่โค้ด gate จริง
2. เคสเมทริกซ์: | Action | Entry point | Guest result (Member Sheet?) |
   Sheet shown | Resume หลัง sign in |
3. Member Sheet mechanics: เขียน/sign in/SSO/skip/ปิด — กลับมาหน้าเดิม
   และ action เดิม resume หรือต้องกดใหม่ (ตามโค้ด)
4. สิ่งที่ guest ทำได้ฟรี — เคสยืนยันว่า "ไม่เจอ" sheet: browse feed,
   search/filter, board, profile ดู, legal pages
TC ID: FO-TC-GATE-nnn
Output: deliverables/FO-TEST-001-17-guest-gate.md
```

---

## TASK FO-TEST-18 — E2E Integration Scenarios (ทำหลัง 01–17)

```text
อ่าน master prompt + inventory + ไฟล์ test case ทุก module

ขอบเขต: เคส E2E แบบเล่าเรื่อง ข้ามหลาย module — อ้าง TC ID ย่อยที่เกี่ยว
เส้นบังคับ (อย่างน้อย):
- E2E-01 Buyer journey เต็ม: guest browse → gate → สมัคร → search/filter →
  viewer → detail → save+watch alert → ask seller → chat → (deal นอกแอป)
- E2E-02 Seller journey เต็ม: create asset(Sale) → feed → ถูก search เจอ →
  match alert ผู้ซื้อ → รับ chat → mark as sold → sale record → portfolio
- E2E-03 Watch alert loop: A ตั้ง alert → B ลง asset match → A ได้ notif →
  viewer → detail → chat
- E2E-04 Social loop: B โพสต์ → A like/comment/follow → B ได้ alerts 3 type →
  mark all read → badge เคลียร์
- E2E-05 Moderation loop: A report โพสต์ B → report:done → (BO handoff) →
  ผลกลับมาที่ FO (ถ้าโค้ดมี)
- E2E-06 Delete & restore: ลบบัญชี → grace → login → restore → ข้อมูลกลับ
- E2E-07 Lifecycle asset: show → sale → hide → sale → sold → portfolio
- เพิ่มเส้นที่เจอจากโค้ดได้ (ระบุเหตุผล)
แต่ละเส้น: steps เป็นตาราง + expected ต่อขั้น + list TC ย่อยที่ครอบ
TC ID: FO-TC-E2E-nnn
Output: deliverables/FO-TEST-001-18-e2e.md
```

---

## TASK FO-TEST-19 — i18n & Theme Sweep

```text
อ่าน master prompt + inventory

ขอบเขต: cross-cutting — TH/EN × Light/Dark × ทุกหน้า
- Sweep matrix: ทุก route/overlay จาก inventory × 2 ภาษา × 2 ธีม
  (ไม่ต้องเขียนทุกช่องเป็นเคสแยก — เขียนเป็นชุด spot-check ต่อหน้า:
  หน้าที่ label เยอะ/ฟอร์ม/ข้อความยาว = เช็คละเอียด, หน้า content ล้วน =
  เช็คหัวข้อ+ปุ่มพอ)
- หาจุด hardcode ภาษาในโค้ด (label ที่ไม่ผ่าน isTh) → ระบุเป็นเคสบั๊กคาดหวัง
- theme: คอนทราสต์, รูปภาพ dark variant (ob-*.png มี dark คู่), เงา/กระจก
- ข้อความยาวล้น: ภาษาไทยยาวกว่าอังกฤษหลายจุด — เคส truncation/overflow
- สลับ lang/theme กลาง flow: ค้างฟอร์ม, ค้าง sheet, ค้าง viewer — state หายไหม

TC ID: FO-TC-I18N-nnn / FO-TC-THM-nnn
Output: deliverables/FO-TEST-001-19-i18n-theme.md
```

---

## TASK FO-TEST-20 — Traceability & Gap Audit (ปิดท้ายเสมอ)

```text
อ่าน master prompt + inventory + ไฟล์ FO-TEST-001-*.md ทั้งหมด

งานปิดท้าย — ห้าม declare "ครบ" ถ้ายังไม่ผ่านข้อนี้:
1. เอา Master Coverage Map (task 00) มาไล่ทีละแถว:
   ทุก route/overlay/action/state มี TC ID อย่างน้อย 1 ตัวชี้กลับ —
   ทำตาราง | Route/Feature | TC ID ที่ครอบ | ครบ? |
2. เช็ค actor coverage: ทุก gated action มี guest + member คู่
3. เช็ค integration list ใน master prompt ครบทุกเส้นใน task 18
4. รวม [OPEN] ทั้งหมดจากทุกไฟล์ + จุดที่โค้ดขัด spec → Gap list
   พร้อมข้อเสนอแนะ (ถามทีม / ถือ prototype เป็น spec / ฯลฯ)
5. สรุปสถิติ: จำนวน TC ต่อ module, P0/P1/P2 ratio, coverage %
Output: deliverables/FO-TEST-001-20-traceability.md + index รวมทุกไฟล์
```

---

## วิธีใช้

1. สั่ง **FO-TEST-00** ก่อนเสมอ — ได้ inventory เป็น contract กลาง
2. Task 01–16 สั่งทีละก้อนหรือขนานกันได้ (คนละไฟล์ output ไม่ชนกัน)
3. 17, 18, 19 ต้องรอ module หลักเสร็จ — เพราะอ่านเคสของ task ก่อนหน้า
4. 20 ทำสุดท้าย — ถ้าเจอช่องว่าง ค่อยย้อนไปเติมเคสใน module นั้น
5. ถ้า task ไหนใหญ่เกินรอบเดียว (เช่น 15 Settings 15 หน้า) แตกย่อยอีกชั้น
   ตามหน้าย่อย เช่น FO-TEST-15a (about/pwd/del/lang/theme)
   FO-TEST-15b (notif/fav/muted/blocked), FO-TEST-15c (prefs/sensitive/
   help/legal)
