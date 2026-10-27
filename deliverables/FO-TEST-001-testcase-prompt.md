# FO-TEST-001 — Prompt สำหรับสร้าง Test Case ครบทั้งระบบ TukDaeng FO

> เอา block ด้านล่างนี้ทั้งก้อนไปวางให้ agent/AI ตัวที่จะทำ test case ได้เลย
> ปรับชื่อ task/code prefix (`FO-TEST`) ตามระบบงานที่ใช้อยู่

---

## COPY BLOCK — วางให้ agent ได้เลย

```text
คุณคือ Senior QA Engineer / Test Designer ของโปรเจกต์ TukDaeng (ตึกแดง) —
mobile marketplace community นาฬิกาหรู ฝั่ง Front Office (FO)

=================================================================
เป้าหมาย
=================================================================
สร้างชุด Test Case + Manual Checklist ที่ครอบคลุม "ทุกเงื่อนไข ทุก scenario"
ของแอป FO ทั้งระบบ โดยตั้งต้นจาก prototype จริง ไม่ใช่เดาจากชื่อฟีเจอร์
ทดสอบทั้ง "การแสดงผล (UI/Display)" และ "การทำงาน (Function/Behavior)"
แยกตาม module/flow และครอบคลุมการเชื่อมต่อข้าม module ทั้งหมด
แตกงานออกเป็น task ย่อยเล็ก ๆ ต่อ module เพื่อทดสอบทีละส่วนแบบไม่ตกหล่น

=================================================================
Source of Truth (ต้องอ่านก่อนเริ่มทำเสมอ ห้ามข้าม)
=================================================================
1. D:\TukDaeng\Prototypes\fo-flow\index.html
   - prototype หลัก SPA ไฟล์เดียว (~23,600 บรรทัด) render ด้วย JS ในไฟล์
   - ให้ inventory จริงจากโค้ด: ทุก route, ทุก overlay, ทุกปุ่ม, ทุก action,
     ทุก state/สถานะ, ทุก validation, ทุก empty/error state
2. D:\TukDaeng\deliverables\FO-DIAG-001-fo-app-diagrams.md
   - Feature map 14 กลุ่ม / Sitemap / Screen flow / Buyer-Seller flow
   - ใช้เป็น checklist ครอบ เพื่อเช็คว่า inventory จากข้อ 1 ไม่ตกหล่น
3. ไฟล์ประกอบในโฟลเดอร์เดียวกัน (ถ้าเกี่ยวข้องกับ flow นั้น):
   - Prototypes\fo-flow\create-post.html
   - Prototypes\fo-flow\feed-create-post.html
   - Prototypes\fo-flow\feed-social-redesign.html
4. docs baseline FO-PRD-v1.9 (ถ้าพบใน repo ให้ใช้ยืนยัน spec; ถ้าหาไม่เจอ
   ให้ยึด prototype เป็นหลักและ mark ข้อสงสัยไว้ท้ายเอกสาร)

วิธีเปิดทดสอบ: serve static ที่ http://localhost:8901/index.html
(หรือเปิดไฟล์ตรง) — Viewport หลัก 440×956 (mobile frame)
ทดสอบ 2 ธีม: Light + Dark และ 2 ภาษา: ไทย (TH) + อังกฤษ (EN)

=================================================================
Actors ที่ต้องครอบคลุม (ทดสอบแยกทุก actor)
=================================================================
- GUEST   : ยังไม่ sign in — browse ฟรี แต่ทุก action ที่ต้องมีตัวตน
            ต้องเจอ Member Sheet "Join TukDaeng" ก่อนเสมอ
- MEMBER  : role เดียว ทำได้ทั้งซื้อ/ขาย/โพสต์/สะสม
  - ในฐานะ BUYER  : search / save / watch alert / ask seller / chat
  - ในฐานะ SELLER : create post / create asset / mark as sold / portfolio
  - ในฐานะ OWNER  : เจ้าของ asset — เห็น asset ตัวเองทุกสถานะ
- SYSTEM  : push notification (FCM), SSO (Apple/Google), watch alert matcher
- ADMIN   : ทำงานฝั่ง Back Office เท่านั้น — test เฉพาะจุดเชื่อม
            (report → moderation handoff, delivery/audit ที่ FO รับผล)

=================================================================
ขอบเขต Module + Route ที่ต้องครบ (ห้ามตกแม้แต่ route เดียว)
=================================================================
SHELL    : App Header (burger drawer / search / wordmark / + create),
           Feed Tabs (All Posts / Following / Favorites), Bottom Nav 5 แท็บ,
           scroll-to-hide/show ของ header + bottom nav

TAB 1 FEED     : post card ทั้ง 2 แบบ (Sale post / โพสต์ธรรมดา),
                 media carousel ในการ์ด, like / comment / share / save /
                 wishlist / not-interested / follow / post menu (...)
                 (archive, pin, edit, mark as sold, report)
TAB 2 CHAT     : chat list → chatroom:id, item-scoped card, chatitem /
                 chmenu / chmedia (media viewer + attach sheet) / chatcfg,
                 block / report จาก chat, Ask Seller entry
TAB 3 BOARD    : board → boardall / boardsearch → boardart:id,
                 hero / latest / categories, article like / share
TAB 4 ALERTS   : 5 types (Like / Comment / Follow / Watch Alert / System),
                 badge 99+, mark all read, tap row → Post Viewer,
                 walerts (watch alert list)
TAB 5 PROFILE  : own profile + public profile (profile:user), grid tabs,
                 followers/following, QR, pedit (edit profile),
                 portfolio (total invested + asset value detail + sold
                 history), pfollow / pfasset / soldhist / sold / sell

HEADER   : search (landing → recents → suggest → results) + sfilter
           (brand, model, price, delivery, strap, box&papers) +
           create (composer: post / asset) + drawer 9 รายการ
           (future/placeholder เช่น Watch Shops, Auction Center)

LIBRARY  : saved → savedcol / archive, wishlist → wishcol,
           interested / ni (not-interested list)

SETTINGS : settings → about_account / change_pwd / del_account
           (grace 30 วัน login-to-restore) / lang / theme /
           notif_settings / favorites / muted / blocked / prefs /
           sensitive / help / privacy / terms / about_app

OVERLAYS : Post Viewer (.page-pv immersive 3 modes),
           Post Detail (.page-detail = asset-detail equivalent),
           Bottom Sheets (comments / likes / share / save / wishlist /
           watch alert), Report Stack (report → report:pick → report:done),
           Member Sheet (guest gate)

ASSET    : สถานะ Sale / Show / Hide / Sold, Mark as Sold + Sale Record,
           gallery/drawer ใน portfolio, เชื่อม POSTS ↔ PF_MINE ↔ assetId
WATCH ALERT : สร้างจาก search bell / follow model ใน detail,
           list จัดการ + notif → Post Viewer ตรง
AUTH     : onboarding (first launch), sign up / sign in / OTP,
           SSO Apple+Google, change password, delete account,
           session state guest ↔ member
TRUST    : report flow (user / post / chat), block (IG keep-page),
           muted list, sensitive content prefs

=================================================================
กติกาพิเศษของระบบที่ต้องมี test case ยืนยันเสมอ
=================================================================
1. Post Viewer เปิดได้เฉพาะจาก grid tiles / notifications เท่านั้น —
   feed card กด media ได้แค่ carousel ในการ์ดเดิม (ต้องเทสทั้ง 2 ฝั่ง)
2. Post Detail อยู่เหนือ viewer เสมอ — กด detail-back ต้องเผย viewer ข้างล่าง
3. ทุก gated action ของ guest → Member Sheet ก่อนเสมอ (like, comment,
   save, share, follow, chat, create, watch alert, report ฯลฯ — ลิสต์ให้ครบ)
4. ปุ่ม back ของ Alerts กลับ Feed เสมอ (ไม่ใช่ pop stack)
5. ไม่มีจ่ายเงินในแอป (V1) — deal จบนอกแอป
6. Share เป็น member-only, comment reply ได้ 1 ชั้น, badge แสดง 99+
7. ลบบัญชี → grace period 30 วัน, login กลับมา = restore

=================================================================
มิติที่ต้องครอบใน "ทุก" test case
=================================================================
A. Display/UI   : layout, spacing, font, icon, badge, pill, สถานะปุ่ม
                  (active/disabled/loading), skeleton, empty state,
                  error state, i18n TH/EN ครบทุก label, theme Light/Dark,
                  safe-area/mobile viewport, truncation ข้อความยาว
B. Function     : action ทำงานจริง, navigation ถูกปลายทาง, state เปลี่ยนถูก,
                  validation + error message, confirmation modal,
                  persistence (state คงอยู่เมื่อ back/refresh ตาม spec)
C. Integration  : flow ข้าม module (ดู list ด้านล่าง)
D. Edge/Negative: empty list ครั้งแรก, ข้อมูล 0/1/เยอะมาก, รูปเสีย/ไม่มี,
                  ข้อความยาวล้น, กดซ้ำรัว ๆ, back กลาง flow, guest ทุกจุด,
                  สลับภาษา/ธีมค้าง state, session หมดระหว่างทำ

Integration flows ขั้นต่ำที่ต้องมีเคส (เชื่อมโยงต่อเนื่อง):
- Create asset(Sale) → ขึ้น Feed + เข้า Search results + match Watch Alert
- Watch Alert match → push/alert row → Post Viewer → Post Detail
- Detail → Ask Seller → Chat room (ผูก item card) → กลับ Detail ได้
- Detail → follow model → เข้า walerts list
- Mark as Sold → Sale Record → Portfolio (total invested + sold history)
- Like/Comment/Follow → Alerts ของอีกฝั่ง + badge + mark all read
- Save → saved/savedcol, Wishlist → wishcol, archive → archive list
- not-interested → หายจาก feed + เข้า ni list + undo
- Report → report:pick → report:done → (BO moderation handoff)
- Block → เข้า blocked list + พฤติกรรม keep-page + unblock ใน settings
- Delete account → grace countdown → login restore → กลับมาใช้ได้
- Guest → Member Sheet → sign up/SSO → กลับมาทำ action เดิมต่อ (resume)

=================================================================
รูปแบบผลลัพธ์ (บังคับตามนี้)
=================================================================
ส่วนที่ 1 — Master Coverage Map
  ตาราง: | Module | Route/Overlay | Feature | Actor ที่เกี่ยว | จำนวน TC |
  ต้องมีทุก route/overlay ใน scope ด้านบน — ใช้ตารางนี้พิสูจน์ว่าไม่ตกหล่น

ส่วนที่ 2 — Task Breakdown (แตกงานย่อยต่อ module)
  แบ่งเป็น Task ย่อย เช่น FO-TEST-FEED-01..NN, FO-TEST-CHAT-01..NN
  แต่ละ Task = กลุ่ม test case ทำได้จบในรอบเดียว (~5–15 เคส)
  ระบุ dependency ของ task (เช่น ต้องมี member account / ต้องมี asset ก่อน)

ส่วนที่ 3 — Test Case Tables แยกตาม module
  ตาราง markdown คอลัมน์:
  | TC ID | Feature | Actor | Type (UI/Func/Int/Edge) | Precondition |
   Test Steps (เลขขั้นตอน) | Expected — การทำงาน | Expected — การแสดงผล |
   Priority (P0/P1/P2) | Result (เว้นว่างให้ติ๊ก) |

  กติกา TC ID : FO-TC-<MODULE>-<nnn> เช่น FO-TC-AUTH-001, FO-TC-FEED-012
  P0 = core flow/กติการะบบ, P1 = feature หลัก, P2 = edge/cosmetic

ส่วนที่ 4 — Integration / End-to-End Scenarios
  เคส E2E แบบเล่าเรื่อง (buyer journey เต็ม, seller journey เต็ม,
  guest→member conversion, deal จนถึง mark as sold) อ้าง TC ID ย่อยที่เกี่ยว

ส่วนที่ 5 — Traceability & Gap Audit
  - ตารางยืนยันทุก route/overlay/action มี TC อย่างน้อย 1 เคส
  - list จุดที่ spec ไม่ชัด / prototype ขัดกับ PRD → mark [OPEN]

=================================================================
ขั้นตอนการทำงาน (ห้ามข้าม)
=================================================================
1. อ่าน index.html → inventory ทุก route/sub-page/overlay/sheet/menu/
   ปุ่ม/action/state ออกมาเป็น list ก่อน (แสดงใน Master Coverage Map)
2. เทียบ inventory กับ Feature map ใน FO-DIAG-001 → ถ้าพบในโค้ดแต่ไม่มี
   ใน diagram (หรือกลับกัน) ให้ mark [OPEN] ไว้ ห้ามตัดทิ้งเงียบ ๆ
3. ระบาย test case ทีละ module ตาม format — ทุก action ต้องมีอย่างน้อย
   happy path + 1 edge/negative + guest variant (ถ้าเป็น gated action)
   + i18n/theme spot-check สำหรับหน้าที่มี label เยอะ
4. เขียน E2E scenarios ข้าม module ตาม list ด้านบน (เพิ่มได้ถ้าเจอในโค้ด)
5. ทำ Traceability audit ปิดท้าย — ห้ามมี route ไหนว่างจาก test case
6. ส่งออกเป็นไฟล์ deliverables\FO-TEST-001-testcases.md
   (หรือแยกไฟล์ต่อ module ถ้าใหญ่เกิน — ตั้งชื่อ FO-TEST-001-<module>.md
   พร้อมไฟล์ index รวม)

ข้อห้าม:
- ห้ามเขียน test case แบบ generic ("กดปุ่มแล้วทำงานถูกต้อง") — ทุกเคสต้อง
  มี step + expected ที่เช็คได้จริงจาก prototype
- ห้ามตัดฟีเจอร์เพราะ "ดูเหมือน placeholder" — drawer 9 รายการก็ต้องมี
  เคสยืนยันพฤติกรรม placeholder ว่าแสดงถูก
- ห้ามลืม actor Guest — ทุก gated action ต้องมีเคสคู่ (guest vs member)
- ห้ามสรุปว่าครบถ้ายังไม่ได้ทำ Traceability audit ในข้อ 5
```

---

## หมายเหตุการใช้งาน

- prompt นี้สมมติ agent ฝั่งรับอ่านไฟล์ในเครื่องได้ (Devin / agent ใน repo เดียวกัน)
  ถ้าเอาไปวางใน chat ที่ไม่มีไฟล์ ให้แนบ `index.html` + `FO-DIAG-001-fo-app-diagrams.md` ไปด้วย
- ถ้าต้องการทีละ module (context เล็ก) ให้ตัด prompt นี้เหลือ source of truth
  + actor + กติการะบบ + format แล้วสั่ง module เดียว เช่น "ทำเฉพาะ CHAT ให้ครบ"
- prefix `FO-TEST` ปรับตาม convention งานจริงของทีม
