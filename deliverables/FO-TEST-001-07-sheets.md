# FO-TEST-001-07 — Test Cases: Bottom Sheets & Quick Actions (แอปมือถือจริง)

> Task: FO-TEST-07 ของชุด FO-TEST-001 · รอบแรก (prototype): 2026-10-27 · แปลงเป็นเวอร์ชันเทสแอปจริง: 2026-10-28
> กติกาหลัก: `deliverables/FO-TEST-001-testcase-prompt.md` · Task breakdown: `deliverables/FO-TEST-001-task-breakdown.md`
> Source of Truth: แอป TukDaeng build ทดสอบบนมือถือจริง — ทดสอบผ่านหน้าจอ/ท่าทางนิ้วเท่านั้น (ห้ามใช้ช่องทาง dev ทุกชนิด)
> สัญญาความครอบคลุม: `deliverables/FO-TEST-001-00-inventory.md` §2.2 + §3.2 — TC ID เดิม FO-TC-SHT-001–115 + SETUP-01–09 คงไว้ครบเพื่อ traceability · เพิ่ม FO-TC-SHT-116–125 เป็น entry-level coverage ของ sheet/quick action ที่ inventory ระบุแต่ยังไม่มีเคส (chat report sheet, board post menu, profile more menu, chat attach sheet, Ask pill, Follow pill)
> สืบทอดจาก FO-TEST-01/02R/03R/04/05/06: actors (GUEST/MEMBER/OWNER), ขั้นตอน sign in/out, กติกา [GATE] เทส guest+member คู่, entry ของแต่ละ sheet จาก viewer/detail (FO-TEST-06 PV/DET), post menus (FO-TEST-06 §2.6) — ไฟล์นี้เทส **กลไกภายใน sheet/overlay หลังเปิดสำเร็จ** บนอุปกรณ์จริง
> **เขียนเสร็จรอรีวิว — อย่าเพิ่งปิดงาน**

## 0. วิธีใช้ + สภาพแวดล้อม

- **อุปกรณ์:** มือถือจริง Android และ/หรือ iOS (ตามที่ทีมกำหนด) — จด "รุ่นเครื่อง + OS" ลงคอลัมน์ "ทดสอบบน (Device/OS)" ทุกเคสที่รัน · ทุกการกระทำ = ท่าทางนิ้วบนจอจริง (แตะ / กดค้าง / ลาก / swipe) + ปุ่ม back ของระบบ (Android)
- **ห้าม:** browser, prototype file, DevTools, viewport emulator, localStorage, ปุ่ม dev/dev harness, demo creds ที่เติมอัตโนมัติ, status bar จำลอง — ใช้บัญชีทดสอบจริงและข้อมูลจริงที่สร้างผ่าน UI เท่านั้น
- **Layer model (บน→ล่าง):** Member Sheet "Join TukDaeng" → confirm dialog → bottom sheet → report/sub page → detail → viewer → feed — **ทุกชั้นปิดทีละชั้นเสมอ** (spec ล็อก): การปิดครั้งหนึ่ง (แตะพื้นมืด / ลากลง / device back / ปุ่ม Cancel) ปิดเฉพาะชั้นบนสุด
- **Bottom sheet:** แสดงทีละใบบนจอ — sheet ที่ "ซ้อน" กัน (เช่น save → new collection, caption → unfollow confirm, comments → block) คือการแทนที่เนื้อหาใน panel เดิมและย้อนกลับได้ตาม design
- **วิธีปิด sheet:** แตะพื้นมืด (scrim) · **ลาก sheet ลง** (drag-to-dismiss — spec ล็อกทุกใบ) · ปุ่ม Cancel/✕ ใน sheet · device back (เทียบเท่าปุ่ม ←/✕ ในแอป — spec ล็อก)
- **Type:** Func = พฤติกรรม · UI = การแสดงผล · Edge = เคสขอบ
- **Priority:** High = กติกาหลัก/flow สำคัญ (reply 1 ชั้น, gate, delete/block, save/wishlist state, watch alert, share จริง) · Medium = feature หลัก · Low = edge/cosmetic
- **ตัวเลขเวลา/จำนวน** (toast ~2 วินาที, drag threshold, จำนวนแถว) เป็นค่าอ้างอิง design — แอปต่างเล็กน้อยให้ **จดค่าจริงลง Note** แต่พฤติกรรมหลักผิด = FAIL
- **เงื่อนไขผลลัพธ์:** ทุกเคสระบุ expected ชัดเจน — ไม่ตรง = FAIL; ถ้า build ไม่มีคุณสมบัติ/ข้อมูลที่เคสต้องการเลย → mark **BLOCK** พร้อมเหตุผล (ห้ามเขียน "จดพฤติกรรม" แทน expected)
- **ภาษา:** เคสภาษาไทยใช้ Profile → ≡ → "Language" (spec ล็อก: ข้อความใน sheet ทุกตัวแปลตามภาษาแอปครบ — เว้นชื่อผลิตภัณฑ์ภายนอก เช่น Messenger/LINE)
- **สิ่งที่อยู่นอก scope:** entry จาก viewer/detail ว่าเปิด sheet ได้หรือไม่ (FO-TEST-06) · post menus ⋯ (FO-TEST-06 §2.6) · report flow ข้างในหลัง entry (FO-TEST-15/16) · watch alert form/derivation/matching (FO-TEST-11) · saved/wishlist hub internals + manage/move (FO-TEST-14) · Member Sheet เนื้อหาข้างใน (FO-TEST-01/17) · chat room internals (FO-TEST-16)

## 1. Coverage map — sheets & mechanics

| Route/Overlay (inventory §2.2+§3.2) | ปกติ | Edge/[GATE] | รวม |
|---|---|---|---|
| Sheet mechanics (เปิด/ปิด/scrim/ลากลง/ทีละชั้น/dialog ซ้อน/toast/z-order) | SHT-001..007,010 | SHT-008(ทีละชั้น), SHT-009(ย้อน caption sheet), SHT-011(report ทับ), SHT-012(z-order) | 12 |
| Comments sheet (ดู/พิมพ์/ส่ง/emoji/Reply 1 ชั้น/like/popover/delete/block/report) | SHT-013..019,021..027,029..033,036,037,039,040 | SHT-020(negative ชั้น 2), SHT-034,035(blocked), SHT-038(noComments), SHT-041[GATE], SHT-028[GATE] | 29 |
| Likes sheet | SHT-042..046 | SHT-047,048(0 likes ไม่มีทางเข้า), SHT-046[GATE] | 7 |
| Share sheet | SHT-049..052,054,055 | SHT-053[GATE] | 7 |
| Save sheet + collections (multi-collection) | SHT-056..062,064..066 | SHT-063[GATE] | 11 |
| Wishlist sheet | SHT-067..071 | SHT-072[GATE] | 6 |
| New collection sheet (ซ้อนใน save/wishlist/move) | SHT-073..079 | SHT-077,080 | 8 |
| Watch alert sheet (entry — flow เต็มอยู่ FO-TEST-11) | SHT-081,082,084,085,087,088 | SHT-083,086,089, SHT-090[GATE] | 10 |
| Unfollow confirmation sheet + Manage following sheet | SHT-091..093,095..098 | SHT-094(ซ้อนบน caption sheet) | 8 |
| Caption sheet (ps) + Details sheet (dt) | SHT-099..103 | — | 5 |
| Block sheet + unblock | SHT-104,105 | SHT-106 | 3 |
| Guest matrix + Language + theme + integration | SHT-107..113 | SHT-114,115 | 9 |
| Additional sheets + quick actions (chat report / board menu / profile more / chat attach / Ask pill / Follow pill) | SHT-116..122,124 | SHT-123,125[GATE] | 10 |

## 2. Test cases

### Setup (ทำก่อนเริ่มเทส)

| TC ID | เริ่มจาก | ขั้นตอน | ผลที่ต้องเห็น |
|---|---|---|---|
| SETUP-01 | - | ติดตั้งแอป TukDaeng build ทดสอบบนมือถือจริง (Android Play Store / iOS App Store หรือ TestFlight ตามที่ทีมแจก) → เปิดแอป | splash แล้วไหลเข้า onboarding — ห้ามเทสผ่าน browser/prototype |
| SETUP-02 | - | รีเซ็ตสถานะแอป: Android = Settings → Apps → TukDaeng → Storage → Clear data · iOS = ลบแอปติดตั้งใหม่ | onboarding เด้งใหม่เหมือนใช้ครั้งแรก ข้อมูลเก่าถูกล้าง |
| SETUP-03 | - | GUEST: รีเซ็ต (SETUP-02) หรือ Log out → เดิน onboarding ถึง sheet "Join TukDaeng" → "Skip for now" | อยู่ feed แบบ guest |
| SETUP-04 | - | MEMBER: member sheet → "Sign in" → กรอก email+password บัญชีทดสอบจริง (SETUP-06) | อยู่ feed แบบ member เห็นข้อมูลจริงของบัญชีนั้น |
| SETUP-05 | MEMBER | เตรียม own posts: (a) feed post ธรรมดา + → รูป 1 ใบ → caption → Share (0 comment / 0 like สำหรับ empty state) · (b) own post ที่ปิดคอมเมนต์: โพสต์ → ⋯ → "Turn off commenting" (เรียก POST-NC) · (c) comment ของตัวเอง ≥1 รายการใต้โพสต์คนอื่น + reply ของตัวเอง ≥1 รายการ (สำหรับ delete flows) | own post ขึ้น feed · POST-NC ไม่มี 💬/Add comment ทุกที่ · มี own comment/reply พร้อมทดสอบลบ — ใช้กับ SHT-027..032, 038, 039, 043, 047, 048 |
| SETUP-06 | MEMBER | จดข้อมูลอ้างอิงจากข้อมูลจริง (จดลง Note ทุกเคสใช้ชุดนี้): บัญชีทดสอบ email+password · ACCT-2 = บัญชีที่สองจริง · POST-CM = โพสต์ของ user อื่นที่มี ≥2 root comments + ≥1 reply + ≥1 like (ถ้ายังไม่มีให้ MEMBER+ACCT-2 คุยกันใต้โพสต์แล้ว log out กลับ) · POST-LK = โพสต์คนอื่นที่มี ≥1 like · POST-SALE = โพสต์ขายของ seller อื่นที่มี specs+ราคา · USER-F = user ที่ MEMBER follow อยู่ · USER-NF = user ที่ยังไม่ follow · COL-A/COL-B = saved collections 2 ใบ (สร้างผ่าน save sheet) · WL-A = wishlist collection · จด "รุ่นเครื่อง + OS" ลงทุกเคสที่รัน | มีข้อมูลครบ — ถ้าขาดตัวใด (เช่นไม่มี ACCT-2) mark BLOCK เคสที่เกี่ยว |
| SETUP-07 | - | ทางเข้า sheet แต่ละตัวบนแอปจริง: comments = 💬 ใต้โพสต์บน feed / rail ใน viewer / บน detail + "Add comment…" ท้ายการ์ด viewer · likes = "Likes"/liked-by บนการ์ดหรือ rail viewer (เฉพาะโพสต์ที่มี like) · share = ↗ บนการ์ด/viewer/detail · save = 🔖 บนการ์ด/viewer · wishlist = 🎁 บน detail · watch alert = 🔔 บน detail / 🔔 บนหน้าผลค้นหา / Edit ใน Alerts → Watch alerts · unfollow confirm = กด "Following" บนการ์ด/หัว caption sheet · manage following = "Following ⌄" บน profile คนที่ follow · caption sheet = แตะ "… more" ใน caption บน viewer · details sheet = "Tap for details" · block = long-press comment → Block · chat report = เมนูในห้องแชท · profile more = ⋯ บน profile คนอื่น · chat attach = "+" ในห้องแชท · board menu = ⋯ บนโพสต์บอร์ด · Ask pill = ปุ่ม Ask บนการ์ด sale · follow pill = "Follow" บน head ของ viewer/profile | sheet แต่ละตัวเปิดทับ surface เดิมถูกต้องตามทางเข้า |
| SETUP-08 | - | Member Sheet "Join TukDaeng" (เด้งเวลา guest แตะ action ที่ gate): ปิดโดยแตะพื้นมืดหรือ "Skip for now" · ทุกเคส [GATE] ทำคู่ — guest เห็น Member Sheet → ปิด → sign in member → ทำซ้ำเห็น flow จริง | sheet ปิดแล้วกลับหน้าเดิม ไม่มี action เกิด |
| SETUP-09 | - | เทคนิคกดค้าง (long-press) บนจอสัมผัส: แตะนิ้วค้างบนแถว comment ~1 วินาที (หลีกเลี่ยง ♡ / "Reply" / avatar) → popover ขึ้นที่ตำแหน่งแถว · ปิด popover = แตะพื้นมืดรอบมัน | own comment เห็นแค่ "Delete" · comment คนอื่นเห็น "Block"+"Report" |

### 2.1 Sheet mechanics — open, close, layer order, toast

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
|---|---|---|---|---|---|---|---|---|---|
| FO-TC-SHT-001 | sheet แสดงทีละใบ — ใบใหม่แทนที่เนื้อหาใน panel เดิม | MEMBER | Func | member เปิด comments ของ POST-CM | 1. เปิด comments sheet 2. กดค้าง comment ของคนอื่น → "Block" | block sheet แทนที่เนื้อหาใน panel เดิม — ไม่มี panel ที่สองเลื่อนทับซ้อน; หลัง action/กลับ เนื้อหาเป็นไปตาม flow | เห็น sheet เดียวบนจอตลอด | Medium | |
| FO-TC-SHT-002 | แตะพื้นมืด (scrim) ปิด sheet | MEMBER | Func | comments เปิดอยู่ | 1. แตะพื้นที่มืดเหนือ sheet | sheet เลื่อนลงหาย — หน้าเบื้องหลังเลื่อนได้ปกติ (scroll ปลดล็อก) ไม่มี toast | scrim หายพร้อม sheet | High | |
| FO-TC-SHT-003 | ปิดผ่าน handle ด้านบน sheet | MEMBER | Func | comments เปิดอยู่ | 1. แตะแถบจับ (handle) — ถ้าแตะไม่ปิดให้ลากมันลง | handle ต้องปิด sheet ได้อย่างน้อยหนึ่งวิธี (แตะหรือลากลง) ตาม design — จดวิธีที่ใช้ได้ลง Note | handle เห็นชัดบน sheet | Medium | |
| FO-TC-SHT-004 | drag-to-dismiss — ลาก sheet ลงปิด (spec ล็อก) | MEMBER | Func | comments เปิดอยู่ | 1. กดตัว sheet ลากลงช้า ๆ ครึ่งทาง → ปล่อย 2. ลากลงยาวพ้นจุดกึ่งกลาง → ปล่อย | ปล่อยกลางทาง → sheet เด้งกลับเปิดเต็ม; ลากพ้น threshold → sheet ไหลลงปิด — ใช้ได้กับ sheet ทุกใบ (ลองซ้ำบน save/share/likes) | sheet ติดนิ้วขณะลาก | High | |
| FO-TC-SHT-005 | device back ปิดชั้นบนสุด (Android) | MEMBER | Func | comments เปิดอยู่ | 1. กด back ของระบบ (Android) | sheet ปิดเหมือนแตะ scrim — เทียบเท่าปุ่ม ←/✕ ในแอป (spec ล็อก); iOS ไม่มี back ใช้ scrim/ลากลงแทน mark N/A | กลับ surface เดิม | Medium | |
| FO-TC-SHT-006 | scroll/swipe เบื้องหลังถูกล็อก | MEMBER | Func | comments เปิดบน viewer | 1. พยายาม swipe โพสต์/เลื่อนเนื้อหาเบื้องหลัง 2. เลื่อน list ใน sheet | เบื้องหลังนิ่งสนิท — เลื่อนได้เฉพาะ list ใน sheet | sheet list เลื่อนลื่น | Medium | |
| FO-TC-SHT-007 | dialog ซ้อนบน sheet — Cancel ปิดเฉพาะ dialog | MEMBER | Func | comments ของ own comment → กดค้าง → "Delete" → dialog "Delete this comment?" | 1. กด "Cancel" ใน dialog | dialog ปิดเฉพาะตัว — comments sheet ยังเปิดอยู่ข้างหลัง ไม่มีการลบ ไม่มี toast | sheet เห็นหลัง dialog ปิด | High | |
| FO-TC-SHT-008 | ปิดทีละชั้นเมื่อ dialog ซ้อน sheet (spec ล็อก) | MEMBER | Func | dialog "Delete this comment?" เปิดบน comments sheet | 1. แตะพื้นมืดครั้งที่ 1 2. แตะพื้นมืดครั้งที่ 2 | ครั้งแรกปิด **เฉพาะ dialog** (comments sheet ยังอยู่); ครั้งที่สองปิด sheet — ห้ามปิดสองชั้นพร้อมกัน (device back ก็ต้องทีละชั้นเหมือนกัน) | เห็น sheet ค้างหลังครั้งแรก | High | |
| FO-TC-SHT-009 | unfollow confirm ซ้อนบน caption sheet → กลับ caption sheet (spec ล็อก) | MEMBER | Func | caption sheet เปิดบนโพสต์ของ USER-F (กด "Following" ได้จากหัว sheet) | 1. กด "Following" → confirm sheet "Unfollow @X?" ขึ้น 2. กด "Cancel" | confirm แทนที่เนื้อหา panel → กด Cancel แล้ว **ย้อนกลับ caption sheet เดิม** — ไม่ปิดทั้งก้อน | caption เห็นเหมือนเดิม | High | |
| FO-TC-SHT-010 | toast หลัง action ใน sheet | MEMBER | Func | member อยู่ feed | 1. save โพสต์ลง collection → ดู toast 2. share ส่งให้เพื่อน → ดู toast | toast ขึ้นหลัง sheet ปิด ข้อความตรง action ("Saved to X" / "Sent to X") หายเองภายใน ~2 วินาที (จดเวลาจริงลง Note) | toast อ่านชัดทั้ง light/dark | High | |
| FO-TC-SHT-011 | Report จาก comment → report screen ทับ | MEMBER | Func | comments sheet เปิด | 1. กดค้าง comment คนอื่น → "Report" | comments sheet ปิด + หน้า report เลื่อนทับทันที (flow ข้างในอยู่ FO-TEST-15/16) — back กลับ surface เดิม | report page ทับเต็ม | High | |
| FO-TC-SHT-012 | sheet อยู่เหนือหน้าอื่นเสมอ (z-order) | MEMBER | Edge | detail เปิดทับ viewer → กด 🔔 เปิด watch alert sheet | 1. สังเกตลำดับชั้น + status bar + nav | sheet เหนือ detail → เหนือ viewer → เหนือ feed; status bar/system UI เห็นปกติ ไม่มี element หลุดทับ sheet | พื้นมืด dim ถูกทุกชั้น | Low | |

### 2.2 Comments sheet

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
|---|---|---|---|---|---|---|---|---|---|
| FO-TC-SHT-013 | เปิด comments จาก feed card | MEMBER | Func | POST-CM อยู่ feed | 1. กด 💬 ใต้โพสต์ | comments sheet เปิดเต็ม | หัวข้อ "Comments" (ตามภาษาแอป) + list + emoji row + input | High | |
| FO-TC-SHT-014 | เปิด comments จาก viewer rail และ detail — sheet เดียวกัน | MEMBER | Func | viewer เปิด POST-CM | 1. กด 💬 ใน rail → ปิด 2. เปิด detail → กด 💬 บน detail | sheet เปิดเหมือนกันจากทั้งสอง entry; ปิดแล้วกลับ context เดิมถูกต้อง | หน้าตาเหมือนกันทุกทางเข้า | Low | |
| FO-TC-SHT-015 | "Add comment…" ท้ายการ์ด viewer เปิด sheet | MEMBER | Func | viewer เปิด POST-CM | 1. แตะ "Add comment…" | comments sheet เปิด + input พร้อมพิมพ์ | เหมือนกด 💬 | Medium | |
| FO-TC-SHT-016 | โครง comments sheet + ไม่มีไอคอนแนบไฟล์ (spec ล็อก) | MEMBER | UI | comments ของ POST-CM เปิด | 1. อ่านโครงบนล่าง | handle → "Comments" → comment list → emoji row 8 ตัว → input (avatar + placeholder + ปุ่มส่ง) — **ไม่มีไอคอนรูปภาพ/GIF** ในช่องพิมพ์ | ครบตามลำดับ | High | |
| FO-TC-SHT-017 | โครง comment row + reply เยื้อง | MEMBER | UI | comments ของ POST-CM เปิด | 1. อ่านแต่ละ row | root row: avatar+ชื่อ+เวลา+text+♡ n+"Reply" — reply ใต้ root เยื้องเข้าแสดงว่าเป็นตอบ root นั้น | reply เยื้องชัด | High | |
| FO-TC-SHT-018 | reply มี 1 ชั้นเท่านั้น (spec ล็อก) | MEMBER | Func | comments ที่มี reply หลายรายการ | 1. ตรวจ reply ทุกตัวว่ามีชั้นซ้อนต่อไหม | reply row **ไม่มี** ปุ่ม "Reply" และไม่มี reply ซ้อนใต้ reply — โครงตื้นแค่ 2 ระดับเสมอ | ไม่มีชั้นที่ 3 | High | |
| FO-TC-SHT-019 | Reply ใส่ @ชื่อผู้เขียนอัตโนมัติ + ส่งได้ (spec ล็อก) | MEMBER | Func | comments ของ POST-CM | 1. แตะ "Reply" บน root comment ของ ACCT-2 2. พิมพ์ข้อความ → ส่ง | input prefill "@username " + keyboard เด้ง; ส่งแล้ว reply ขึ้นใต้ root นั้น + comment count +1 | เห็น "@user " ก่อนพิมพ์ | High | |
| FO-TC-SHT-020 | สร้าง reply ชั้น 2 ไม่ได้ (negative, spec ล็อก) | MEMBER | Func | comments ที่มี reply row | 1. แตะ/กดค้าง reply row หาทาง reply ต่อ | ไม่มีปุ่ม "Reply" บน reply row — popover ก็ไม่มีตัวเลือก reply เช่นกัน | — | High | |
| FO-TC-SHT-021 | พิมพ์ + ส่ง comment ใหม่ (spec ล็อก) | MEMBER | Func | comments ของ POST-CM | 1. แตะช่อง comment → พิมพ์ "Nice piece!" → กดส่ง 2. ปิด sheet → เปิดใหม่ | comment ใหม่ขึ้นใน list ทันที (ตำแหน่งตาม design) + count บนการ์ด/detail +1; เปิดใหม่ยังอยู่ — **persist จริง** | ปุ่มส่งใช้งานเมื่อมี text | High | |
| FO-TC-SHT-022 | แตะ emoji = ส่ง comment ทันที (spec ล็อก) | MEMBER | Func | comments ของ POST-CM | 1. แตะ emoji ตัวใดตัวหนึ่งใน emoji row | emoji นั้นถูกโพสต์เป็น comment ของ member ทันที + count +1 — ไม่ต้องกดส่งซ้ำ | comment emoji ขึ้น list | Medium | |
| FO-TC-SHT-023 | like comment — toggle ใจ+ตัวเลข | MEMBER | Func | comments ของ POST-CM | 1. กด ♡ บน comment ที่มี n likes 2. กด ♥ อีกครั้ง | ♥ เติม + count +1 → กดซ้ำกลับค่าเดิม; comment 0 like แสดง "1" หลังกด | ไอคอนสลับสถานะ | High | |
| FO-TC-SHT-024 | like comment persist (spec ล็อก) | MEMBER | Func | like comment แล้ว | 1. ปิด sheet → เปิด comments ใหม่ | ใจ+count ยังคงค่าที่กด — like ถูกบันทึกจริง ไม่ reset เมื่อ sheet ปิด | ♥ ค้างหลัง reopen | High | |
| FO-TC-SHT-025 | กดค้าง comment คนอื่น → popover Block/Report | MEMBER | Func | comments ของ POST-CM | 1. กดค้าง ~1 วิ บน comment ของ ACCT-2 (SETUP-09) | popover ขึ้นที่แถว: "Block" + "Report" + พื้นมืดรอบ popover | popover ชิดแถว | High | |
| FO-TC-SHT-026 | กดค้าง reply row → popover เดียวกัน | MEMBER | Func | มี reply ของ ACCT-2 | 1. กดค้าง reply row | popover เดียวกัน ("Block"+"Report") ขึ้นที่ reply row | — | Medium | |
| FO-TC-SHT-027 | popover ของ own comment = Delete เท่านั้น | MEMBER | Func | own comment ใน POST-CM (SETUP-05c) | 1. กดค้าง own comment | popover มีแค่ "Delete" — ไม่มี Block/Report บนของตัวเอง | — | High | |
| FO-TC-SHT-028 | [GATE] guest กดค้าง comment → Member Sheet | GUEST | Func | guest เปิด comments | 1. กดค้าง comment คนอื่น | Member Sheet "Join TukDaeng" ขึ้นแทน popover | — | High | |
| FO-TC-SHT-029 | แตะพื้นมืดปิด popover เฉพาะตัว | MEMBER | Func | popover เปิดอยู่ | 1. แตะพื้นมืดรอบ popover | popover ปิด — comments sheet ยังเปิด | — | Medium | |
| FO-TC-SHT-030 | ลบ root comment พร้อม replies | MEMBER | Func | own root comment ที่มี reply (SETUP-05c) | 1. กดค้าง → "Delete" 2. อ่าน dialog → ยืนยัน 3. ดู count บนการ์ด | dialog ระบุว่า comment **และ replies** จะถูกลบ → ยืนยันแล้วหายทั้งกลุ่ม + count -n ตามจำนวนที่หาย + toast "comment removed" | แถวหายทันที | High | |
| FO-TC-SHT-031 | ลบ reply เดี่ยว | MEMBER | Func | own reply ใต้ comment คนอื่น (SETUP-05c) | 1. กดค้าง reply → "Delete" → ยืนยัน | dialog ไม่พูดถึง replies → ลบ 1 รายการ count -1 | — | Medium | |
| FO-TC-SHT-032 | Cancel ใน dialog ลบ → ไม่ลบ | MEMBER | Func | dialog ลบเปิดอยู่ | 1. กด "Cancel" | dialog ปิด — comment อยู่ครบ sheet ยังเปิด ไม่มี toast | — | Medium | |
| FO-TC-SHT-033 | Block จาก popover → block sheet → block จริง | MEMBER | Func | comment ของ ACCT-2 | 1. กดค้าง → "Block" 2. อ่าน block sheet → กด "Block" | comments เปลี่ยนเป็น block sheet (avatar + "Block {user}?" + impact rows + "Block" + "Block and report") → ยืนยัน → กลับ comments ที่กรอง ACCT-2 ออก + toast "Blocked and hidden comments" | sheet เปลี่ยนเนื้อหาใน panel เดิม | High | |
| FO-TC-SHT-034 | คนถูก block ถูกกรองทุกระดับ | MEMBER | Func | block ACCT-2 ไว้แล้ว | 1. เปิด comments ของโพสต์อื่นที่ ACCT-2 เคย comment/reply | comments+replies ของ ACCT-2 ไม่แสดงเลยทุกที่ (count ตัวเลขอาจคำนวณต่าง — จดจริงลง Note) | ไม่มีแถวของคนถูก block | Medium | |
| FO-TC-SHT-035 | Unblock → comments กลับมาเห็น | MEMBER | Func | ACCT-2 ถูก block อยู่ (ทำตาม SHT-033 หรือ settings) | 1. Settings → Blocked → Unblock ACCT-2 2. เปิด comments เดิม | unblock ผ่าน confirm → toast "Unblocked" + comments ของ ACCT-2 กลับมาเห็นครบ | — | Medium | |
| FO-TC-SHT-036 | "Block and report" → block + เข้า report flow | MEMBER | Func | block sheet เปิดอยู่ | 1. กด "Block and report" | block สำเร็จ + หน้า report เปิดทับ (flow ข้างในอยู่ FO-TEST-15/16) | — | Medium | |
| FO-TC-SHT-037 | "Report" จาก popover → report entry | MEMBER | Func | popover เปิดอยู่ | 1. กด "Report" | comments ปิด → หน้า report เปิดทับ — back กลับได้ปกติ | — | High | |
| FO-TC-SHT-038 | โพสต์ปิดคอมเมนต์ → ไม่มีทางเข้า comments (spec ล็อก) | OWNER | Func | POST-NC (SETUP-05b) | 1. ดูการ์ด feed 2. เปิด viewer 3. เปิด detail | ไม่มีไอคอน 💬 และไม่มี "Add comment…" ทุก surface — verify ผ่าน ⋯ เมนู own post ("Turn off commenting" ⇄ "Turn on commenting") | ทางเข้าหายทั้งหมด | Medium | |
| FO-TC-SHT-039 | comments ว่าง | MEMBER | Func | own post 0 comment (SETUP-05a) | 1. เปิด comments | list แสดง "No comments yet" + emoji row + input ยัง render | empty state ชัด | Medium | |
| FO-TC-SHT-040 | แตะ avatar/ชื่อ comment → profile author | MEMBER | Func | comments เปิดอยู่ | 1. แตะ avatar/ชื่อของ comment | sheet ปิด + profile ของ author เปิดทับ | — | Medium | |
| FO-TC-SHT-041 | [GATE] guest ทุก action ใน comments | GUEST | Func | guest เปิด comments sheet | 1. ลองทีละ: แตะช่อง comment / emoji / "Reply" / ♡ / กดค้าง comment | ทุก action → Member Sheet "Join TukDaeng" — guest อ่าน comments ได้อย่างเดียว | — | High | |

### 2.3 Likes sheet

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
|---|---|---|---|---|---|---|---|---|---|
| FO-TC-SHT-042 | เปิด likes sheet ของโพสต์คนอื่น + โน้ต privacy | MEMBER | Func | POST-LK มี ≥1 like (SETUP-06) | 1. แตะ "Likes"/liked-by บน rail หรือการ์ด | likes sheet: "Likes" + โน้ต "Only {seller} can see the total number of likes on this post." + แถว avatar+username+display name+ปุ่ม Follow/Following | โน้ตแสดงชื่อ seller จริง | High | |
| FO-TC-SHT-043 | likes sheet ของ own post ไม่มีโน้ต privacy | MEMBER | Func | own post มี ≥1 like (ให้ ACCT-2 like โพสต์ SETUP-05a) | 1. เปิด viewer → แตะ "Likes" | **ไม่มี** บรรทัด "Only ... can see" — เจ้าของเห็นยอดเองได้ | — | Medium | |
| FO-TC-SHT-044 | แถว liker เลื่อนครบ | MEMBER | Func | likes sheet เปิด (หลายคน) | 1. เลื่อน list | แสดงครบทุกคนที่ like — เลื่อนลื่นไม่กระตุก | — | Medium | |
| FO-TC-SHT-045 | Follow จาก likes sheet = follow จริง (spec ล็อก) | MEMBER | Func | liker USER-NF ยังไม่ follow | 1. กด "Follow" บนแถว 2. ปิด sheet → เปิด profile ของคนนั้น → เปิด likes ใหม่ | ปุ่มเปลี่ยน "Following" ทันที + profile แสดง following จริง + reopen sheet ยัง "Following" — **sync ทั้งแอป persist** | — | High | |
| FO-TC-SHT-046 | [GATE] แถว liker → profile; guest กด Follow → Member Sheet | GUEST + MEMBER | Func | likes sheet เปิด | 1. (member) แตะแถว liker ที่ไม่ใช่ปุ่ม 2. (guest) เปิด sheet → กด "Follow" | แตะแถว → profile ของคนนั้นเปิด (sheet ปิด); guest กด Follow → Member Sheet | — | High | |
| FO-TC-SHT-047 | โพสต์ 0 likes → ไม่มีทางเข้า likes (spec ล็อก) | MEMBER | Func | own post likes=0 (SETUP-05a) | 1. หา "Likes"/liked-by บนการ์ด feed 2. ใน viewer 3. บน detail | **ไม่มี** element likes เลยทุก surface — entry โผล่เฉพาะเมื่อมี like แรก | ไม่มีป้าย/แถว likes | High | |
| FO-TC-SHT-048 | likes entry โผล่หลัง like แรก | MEMBER | Edge | ACCT-2 กด like โพสต์ SETUP-05a | 1. refresh ดูการ์ด + เปิด viewer | "Likes"/liked-by ปรากฏพร้อม count 1 — แตะเปิด sheet ได้ | — | Medium | |

### 2.4 Share sheet

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
|---|---|---|---|---|---|---|---|---|---|
| FO-TC-SHT-049 | เปิด share sheet — โครงครบ | MEMBER | Func | viewer เปิด POST-SALE | 1. กด ↗ share | share sheet: ช่อง "Search" + เพื่อน grid + แถวแอป (Messenger/Direct/LINE/Facebook/Copy link ตาม design — จดรายการจริงลง Note) | grid เลื่อนได้ | High | |
| FO-TC-SHT-050 | ค้นหาเพื่อนใน sheet | MEMBER | Func | share sheet เปิด | 1. พิมพ์ชื่อบางส่วน → ลบออก | grid filter สดตามชื่อ; ล้างแล้วกลับครบ | — | Medium | |
| FO-TC-SHT-051 | ส่งให้เพื่อน → โพสต์เข้าแชทจริง (spec ล็อก) | MEMBER | Func | share sheet เปิดบน POST-SALE | 1. กดเพื่อนคนหนึ่ง 2. เปิด nav chat → ห้องของเพื่อนนั้น | toast "Sent to {name}" + **ในห้องแชทมีข้อความ post card ของ POST-SALE จริง** — แตะ post card เปิดโพสต์ได้ | ข้อความขึ้นใน thread | High | |
| FO-TC-SHT-052 | Copy link / แอปภายนอก → ทำงานจริง (spec ล็อก) | MEMBER | Func | share sheet เปิด | 1. กด "Copy link" → เปิดแอป Notes/แชท → วาง 2. เปิด share ใหม่ → กด Messenger/LINE (ที่ติดตั้งอยู่) | "Copy link" → ลิงก์โพสต์อยู่ใน clipboard วางได้จริง; เลือกแอป → OS share intent/แอปนั้นเปิดพร้อมลิงก์โพสต์ (ไม่มีแอปติดตั้ง → ลองตัวที่มี จดจริงลง Note) | — | High | |
| FO-TC-SHT-053 | [GATE] share | GUEST + MEMBER | Func | feed | 1. guest กด ↗ → ปิด Member Sheet → sign in → กดซ้ำ | guest → Member Sheet; member → share sheet เปิดปกติ | — | High | |
| FO-TC-SHT-054 | เนื้อหาที่แชร์ตรงกับโพสต์ที่แตะ (spec ล็อก) | MEMBER | Func | โพสต์สองใบต่างกัน (POST-CM + POST-SALE) | 1. share โพสต์ A ให้เพื่อน 2. share โพสต์ B ให้เพื่อนเดิม 3. เปิดแชทดูทั้งสองข้อความ | ข้อความ/ลิงก์/post card ในแชทอ้างถึงโพสต์ที่แตะ **ถูกใบ** ทีละรายการ (รูป/ชื่อ/ลิงก์ตรง) — ไม่ใช่ข้อความเดียวกันหมด | — | High | |
| FO-TC-SHT-055 | share จาก detail | MEMBER | Func | detail เปิดอยู่ | 1. กด ↗ บน detail | sheet เปิดเหนือ detail ปกติ + ปิดแล้วกลับ detail ครบ | — | Medium | |

### 2.5 Save sheet + collections (multi-collection — spec ล็อก)

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
|---|---|---|---|---|---|---|---|---|---|
| FO-TC-SHT-056 | save ครั้งแรก → auto-save + sheet | MEMBER | Func | โพสต์ที่ยังไม่ save | 1. กด 🔖 | โพสต์ถูก save ลง "Saved" ทันที (ไอคอนเติม) แล้ว save sheet เปิด: หัว "Saved"/Private (thumb=รูปโพสต์) + "Collections" + "New collection" + collection rows | check/plus ถูกต้อง | High | |
| FO-TC-SHT-057 | collection ที่มีโพสต์แสดง check ทุกใบ | MEMBER | Func | โพสต์อยู่ COL-A (อยู่หลายใบดู SHT-062) | 1. เปิด save sheet | COL-A แสดง check (แถวอื่น plus) — ถ้าโพสต์อยู่หลาย collection check **ทุกใบ** | — | High | |
| FO-TC-SHT-058 | เลือก collection → toast + เข้า collection นั้น | MEMBER | Func | save sheet เปิด | 1. กด COL-B | toast "Saved to COL-B" + sheet ปิด + โพสต์ยัง saved + อยู่ COL-B | — | High | |
| FO-TC-SHT-059 | check คงอยู่หลังเปิดใหม่ (persist) | MEMBER | Func | save ลง COL-B แล้ว | 1. เปิด save sheet ซ้ำ | check ยังอยู่บน COL-B (+ ใบอื่นที่เคยใส่) — สถานะ persist จริง | — | Medium | |
| FO-TC-SHT-060 | แตะ collection ที่ check → เอาออกเฉพาะใบนั้น (spec ล็อก) | MEMBER | Func | โพสต์อยู่ COL-A+COL-B | 1. แตะ COL-A (check อยู่) | toast "Removed from COL-A" + โพสต์ **ยัง saved** (อยู่ COL-B/"Saved") — check เหลือเฉพาะ COL-B | — | High | |
| FO-TC-SHT-061 | แตะหัว "Saved" → unsave ทั้งโพสต์ | MEMBER | Func | save sheet เปิดบนโพสต์ที่ saved | 1. กดแถวหัว "Saved" | toast "Removed from your saved" + โพสต์ออกจากทุก collection + ไอคอน 🔖 โล่ง | — | High | |
| FO-TC-SHT-062 | โพสต์อยู่ได้หลาย collection พร้อมกัน (spec ล็อก) | MEMBER | Func | โพสต์อยู่ COL-A | 1. เปิด save sheet → เลือก COL-B เพิ่ม 2. เปิด Saved hub → ดูทั้ง COL-A และ COL-B | โพสต์อยู่ **ทั้งสอง** collection พร้อมกัน (เพิ่ม ไม่ใช่ย้าย) — save sheet check ทั้ง COL-A+COL-B | check สองใบ | High | |
| FO-TC-SHT-063 | [GATE] save | GUEST + MEMBER | Func | feed | 1. guest กด 🔖 → ปิด Member Sheet → sign in → กดซ้ำ | guest → Member Sheet; member → auto-save + save sheet | — | High | |
| FO-TC-SHT-064 | New collection → Cancel กลับ save sheet | MEMBER | Func | save sheet เปิด | 1. กด "New collection" 2. กด "Cancel" บน new-collection sheet | nc แทนที่เนื้อหา panel → Cancel **ย้อนกลับ save sheet** เดิม ไม่ปิดทิ้ง | — | Medium | |
| FO-TC-SHT-065 | สร้าง collection จาก save sheet | MEMBER | Func | new-collection sheet เปิดจาก save | 1. พิมพ์ "Grail picks" → กด "Next" 2. เปิด save sheet รอบถัดไป | collection ใหม่ถูกสร้าง + โพสต์เข้าใบนั้น + toast "Saved to Grail picks"; รอบหน้ามีแถว "Grail picks" | — | High | |
| FO-TC-SHT-066 | สถานะ save sync ทุก surface | MEMBER | Func | save โพสต์จาก feed แล้ว | 1. เปิด viewer + detail ของโพสต์เดียวกัน 2. เปิด Saved hub | ไอคอน 🔖 เติมทุก surface + โพสต์อยู่ใน Saved hub | — | Medium | |

### 2.6 Wishlist sheet

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
|---|---|---|---|---|---|---|---|---|---|
| FO-TC-SHT-067 | เปิด wishlist sheet → auto-wishlist ก่อน | MEMBER | Func | detail ของ POST-SALE | 1. กด 🎁 | โพสต์ถูก wishlist ลง "Wish List" ทันที + wl sheet เปิด: หัว "Wish List"/Private + collection rows + "New collection" | — | High | |
| FO-TC-SHT-068 | เลือก wishlist collection | MEMBER | Func | wl sheet เปิด | 1. กด WL-A → เปิด wl ซ้ำ | toast "Added to WL-A" + ปิด; เปิดใหม่ check อยู่ WL-A (persist) | — | High | |
| FO-TC-SHT-069 | แตะหัว "Wish List" → เอาออกทั้งหมด | MEMBER | Func | wl เปิดบนโพสต์ที่ wishlisted | 1. กดแถวหัว "Wish List" | toast "Removed from your wish list" + โพสต์ออกจากทุก wishlist collection + ไอคอนโล่ง | — | Medium | |
| FO-TC-SHT-070 | แตะ collection ที่ check → เอาออกเฉพาะใบ (spec ล็อก multi) | MEMBER | Func | โพสต์อยู่ WL-A | 1. แตะ WL-A ซ้ำ | toast "Removed from WL-A" + โพสต์ **ยัง wishlisted** (อยู่ "Wish List") — ไม่ un-wishlist ทั้งโพสต์ | — | Medium | |
| FO-TC-SHT-071 | สร้าง wishlist collection ใหม่ | MEMBER | Func | wl → "New collection" | 1. พิมพ์ "Someday" → กด "Next" | collection ใหม่เข้า wishlist + โพสต์เข้าใบนั้น + toast "Added to Someday" | — | Medium | |
| FO-TC-SHT-072 | [GATE] wishlist | GUEST + MEMBER | Func | detail เปิด | 1. guest กด 🎁 → ปิด Member Sheet → sign in → กดซ้ำ | guest → Member Sheet; member → auto-wishlist + wl sheet | — | High | |

### 2.7 New collection sheet (ซ้อนใน save/wishlist/move)

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
|---|---|---|---|---|---|---|---|---|---|
| FO-TC-SHT-073 | โครง new-collection sheet | MEMBER | UI | เปิดจาก save → "New collection" | 1. อ่าน sheet | หัว "Cancel / New collection / Next (ปิดใช้)" + input "Collection name" + counter "0 / 40" — ไม่มี preview (กรณีมาจาก save) | — | High | |
| FO-TC-SHT-074 | พิมพ์ชื่อ → Next เปิดใช้ + counter + ปุ่มล้าง | MEMBER | Func | nc sheet เปิด | 1. พิมพ์ "abc" | counter "3 / 40" + ปุ่ม ✕ ล้างโผล่ + Next เปิดใช้ | — | High | |
| FO-TC-SHT-075 | ปุ่มล้าง + จำกัดความยาว 40 ตัว | MEMBER | Func | nc sheet เปิดมีชื่อ | 1. กด ✕ 2. พิมพ์ยาวกว่า 40 ตัว | ✕ ล้าง input + Next ปิดใช้; ชื่อถูกตัดที่ **40 ตัว** counter "40 / 40" (จด cap จริงลง Note) | — | Medium | |
| FO-TC-SHT-076 | ปุ่มยืนยันบนคีย์บอร์ด = Next | MEMBER | Func | nc พิมพ์ชื่อแล้ว | 1. กด enter/done บนคีย์บอร์ด | สร้าง collection เหมือนกด Next | — | Low | |
| FO-TC-SHT-077 | ชื่อเป็นช่องว่างล้วน → Next ปิด | MEMBER | Edge | nc sheet เปิด | 1. พิมพ์แต่ space | Next ยังปิดใช้ (trim ชื่อ) | — | Medium | |
| FO-TC-SHT-078 | สร้างจาก Saved hub โดยตรง (ไม่ผูกโพสต์) | MEMBER | Func | Saved hub เปิด | 1. กด "+" สร้าง collection → ตั้งชื่อ → Next | toast "Collection created" + แถวใหม่ใน hub — ไม่ผูกโพสต์ใด | — | Medium | |
| FO-TC-SHT-079 | nc จาก move flow มี preview + ปุ่ม "Save" | MEMBER | Func | Saved hub → เข้า collection → Manage → เลือกหลายใบ | 1. กด Move → "+ New collection" → ใส่ชื่อ → Save | nc มี **preview thumb โพสต์ที่เลือก** + ปุ่ม "Save" → toast "Moved to X" (manage ละเอียด = FO-TEST-14) | — | Medium | |
| FO-TC-SHT-080 | ชื่อซ้ำสร้างได้ (spec ล็อก) | MEMBER | Func | nc sheet เปิด | 1. ใช้ชื่อเดียวกับ collection ที่มีอยู่ → Next | สร้างสำเร็จ — **ชื่อซ้ำอนุญาต** ไม่มี error/block (มีสองแถวชื่อเดียวกันได้) | — | Low | |

### 2.8 Watch alert sheet (entry — flow เต็มอยู่ FO-TEST-11)

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
|---|---|---|---|---|---|---|---|---|---|
| FO-TC-SHT-081 | create mode จาก 🔔 บน detail | MEMBER | Func | detail ของ POST-SALE (มี specs) | 1. กด 🔔 | wa sheet create mode: "Create watch alert" + ชื่อ autofill (ยี่ห้อ·รุ่น·ref จาก specs) + 3 mode rows + "N now" ใต้แต่ละแถว + "Create alert" — ไม่มีปุ่มลบ | — | High | |
| FO-TC-SHT-082 | edit mode เมื่อมี alert เดิมอยู่ | MEMBER | Func | โพสต์เดิมมี alert ON (criteria ตรงกัน) | 1. กด 🔔 อีกครั้ง | "Edit watch alert" + name/mode prefill + "Save changes" + ปุ่ม "Delete alert" | — | High | |
| FO-TC-SHT-083 | โพสต์ไม่มี details → ไม่เปิด sheet | MEMBER | Edge | detail ของโพสต์ไม่มี specs (POST-Z) | 1. กด 🔔 (ถ้ามี) | ไม่มี sheet เปล่า — toast "No details on this post to watch" หรือไม่มี 🔔 เลย (จดรูปแบบจริงลง Note) | — | Medium | |
| FO-TC-SHT-084 | จาก 🔔 บนหน้าผลค้นหา | MEMBER | Func | search + เลือก filter แล้ว | 1. กด 🔔 บนหน้าผลลัพธ์ | wa sheet create mode criteria จากคำค้น+filters; ถ้าชุดเดิมมีอยู่ → เปิด edit ตรง | — | High | |
| FO-TC-SHT-085 | Edit จากรายการ watch alerts | MEMBER | Func | Alerts → watch alerts มีรายการ | 1. กด "Edit" บนแถว alert | wa sheet เปิด edit mode ของ alert นั้น | — | Medium | |
| FO-TC-SHT-086 | mode rows disabled เมื่อไม่มี criteria | MEMBER | Edge | หน้า search ว่าง ไม่เลือก filter → กด 🔔 | 1. อ่าน mode rows | "Match any criteria"/"Model only" disabled — เลือกได้แค่ "Match all criteria"; "N now" นับจริงต่อ mode | — | Medium | |
| FO-TC-SHT-087 | แก้ชื่อแล้วสลับ mode ชื่อไม่หาย | MEMBER | Func | wa sheet create mode | 1. แก้ชื่อในช่อง name → เลือก "Match any criteria" | radio ย้ายไป any + ชื่อที่แก้คงอยู่ | — | Medium | |
| FO-TC-SHT-088 | Create / Save / Delete — alert ทำงานจริง (spec ล็อก) | MEMBER | Func | wa sheet เปิด | 1. "Create alert" 2. เปิด edit → "Save changes" 3. เปิด edit → "Delete alert" | Create → toast "Watch alert on" + 🔔 เปลี่ยน on + **alert ทำงานจริง** (โพสต์ match ขึ้น alert — flow เต็ม FO-TEST-11); Save → "Watch alert updated"; Delete → "Watch alert removed" — sheet ปิดทุกครั้ง | 🔔 สลับสถานะ | High | |
| FO-TC-SHT-089 | dedupe — สร้างซ้ำ criteria+mode เดิม | MEMBER | Func | มี alert ที่ criteria+mode เดียวกันอยู่ | 1. สร้างซ้ำด้วย criteria+mode เดิม | ไม่สร้างใหม่ — เปิด edit ของ alert เดิม + toast "You already saved this alert" | — | Medium | |
| FO-TC-SHT-090 | [GATE] watch alert | GUEST + MEMBER | Func | detail/search | 1. guest กด 🔔 → ปิด Member Sheet → sign in → กดซ้ำ | guest → Member Sheet; member → wa sheet ตาม SHT-081/084 | — | High | |

### 2.9 Unfollow confirmation sheet + Manage following sheet

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
|---|---|---|---|---|---|---|---|---|---|
| FO-TC-SHT-091 | unfollow confirmation sheet | MEMBER | Func | feed เห็นโพสต์ของ USER-F | 1. กด "Following" บนการ์ด | sheet "Unfollow @{user}?" + avatar + ปุ่ม "Unfollow" (danger) + "Cancel" | — | High | |
| FO-TC-SHT-092 | Cancel → ยัง follow | MEMBER | Func | uf sheet เปิด | 1. กด "Cancel" | sheet ปิดเฉย ๆ — ยัง following ไม่เปลี่ยน | — | Medium | |
| FO-TC-SHT-093 | Unfollow → unfollow จริง | MEMBER | Func | uf sheet เปิด | 1. กด "Unfollow" | unfollow จริง + sheet ปิด + toast "Unfollowed" + ปุ่มกลับ "Follow" บน surface เดิม + Following list ลด | ปุ่มสลับสถานะ | High | |
| FO-TC-SHT-094 | uf จาก caption sheet → ย้อน caption sheet (spec ล็อก) | MEMBER | Func | caption sheet เปิดบนโพสต์ของ USER-F | 1. กด "Following" บนหัว sheet → uf ขึ้น 2. ทำรอบแรก "Cancel" รอบสอง "Unfollow" | ทั้งสองทาง **ย้อนกลับ caption sheet เดิม** (ไม่ปิดทั้งก้อน) — ปุ่มบนหัว caption อัปเดตตามสถานะ (Following→Follow) | — | High | |
| FO-TC-SHT-095 | manage-following sheet จาก profile | MEMBER | Func | profile ของ USER-F | 1. กด "Following ⌄" | sheet เปิด: title=username + 3 แถว ("Add to favorites" / "Mute" / "Unfollow") | — | High | |
| FO-TC-SHT-096 | favorites toggle ใน sheet | MEMBER | Func | mf sheet เปิด | 1. กด "Add to favorites" → กดซ้ำ | label สลับ "Remove from favorites" ↔ "Add to favorites" + icon สลับ inline — sheet ไม่ปิด + ผล favorite จริง | — | Medium | |
| FO-TC-SHT-097 | Mute → confirm dialog ซ้อน sheet | MEMBER | Func | mf sheet เปิด | 1. กด "Mute" → อ่าน dialog → ทำสองรอบ: Confirm / Cancel | dialog "Mute X?" ซ้อนบน sheet → Confirm = toast "Muted" (+ โพสต์หายจาก feed ตามกติกา mute); Cancel = กลับ mf sheet | — | Medium | |
| FO-TC-SHT-098 | Unfollow จาก mf ทันทีไม่ยืนยัน (spec ล็อก) | MEMBER | Func | mf sheet เปิด | 1. กด "Unfollow" | **unfollow ทันทีไม่มี confirm** + sheet ปิด + ปุ่ม profile กลับ "Follow" — ต่างจาก SHT-091 โดย design (IG parity) | — | Medium | |

### 2.10 Caption sheet (full caption + comments) + Details sheet

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
|---|---|---|---|---|---|---|---|---|---|
| FO-TC-SHT-099 | caption "… more" บน viewer → caption sheet | MEMBER | Func | viewer ของโพสต์ caption ยาว (มี "… more") | 1. แตะ "… more" | caption sheet เปิดแสดง caption เต็ม — ต่างจาก feed card ที่ขยาย caption inline (ถูกต้องตาม design ทั้งสองแบบ) | — | High | |
| FO-TC-SHT-100 | โครง caption sheet + ภาษาตามแอป (spec ล็อก) | MEMBER | UI | caption sheet เปิด | 1. อ่านเนื้อหา 2. เปลี่ยน Language เป็นไทยแล้วเปิดใหม่ | หัว: avatar+seller+ปุ่ม "Follow" (เฉพาะยังไม่ follow) หรือ "Following" → caption เต็ม → เวลา → comment rows → input placeholder "Add a comment for X" **แปลตามภาษาแอป** | — | Medium | |
| FO-TC-SHT-101 | comments ใน caption sheet ใช้งานได้เหมือน comments sheet | MEMBER | Func | caption sheet เปิด | 1. กด ♡ บน comment 2. กดค้าง row → popover 3. แตะ "Reply" | like/popover/reply ทำงานเหมือน §2.2 ทุกอย่าง | — | Medium | |
| FO-TC-SHT-102 | details sheet จาก "Tap for details" | MEMBER | Func | viewer ของ POST-SALE | 1. แตะ "Tap for details" | details sheet: spec groups **ยกเว้น** "Price & Data Source" (กลุ่มนี้อยู่แค่หน้า detail) + ลิงก์ "View full detail ›" ท้าย list | — | High | |
| FO-TC-SHT-103 | "View full detail ›" → หน้า detail | MEMBER | Func | details sheet เปิด | 1. แตะ "View full detail ›" | sheet ปิด + detail เลื่อนทับ viewer — back กลับ viewer ไม่ใช่ sheet | — | Medium | |

### 2.11 Block sheet

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
|---|---|---|---|---|---|---|---|---|---|
| FO-TC-SHT-104 | โครง block sheet | MEMBER | UI | popover → "Block" | 1. อ่านเนื้อหา | avatar+ชื่อ + "Block {user}?" + คำอธิบาย + impact rows (หาโปรไฟล์ไม่เจอ / ส่งข้อความไม่ได้ / ไม่รู้ว่าถูก block) + ปุ่ม "Block" + "Block and report" | — | Medium | |
| FO-TC-SHT-105 | block มีผลทั้งแอป | MEMBER | Func | block ACCT-2 จาก comments (SHT-033) | 1. กลับ feed + เปิด comments + เปิด profile ของ ACCT-2 | comments กรองออก + toast "Blocked and hidden comments"; feed/profile ไม่มีเนื้อหาของ ACCT-2 — ผลจริงทุก surface | — | High | |
| FO-TC-SHT-106 | unblock → กลับมาเห็นครบ | MEMBER | Func | unblock ACCT-2 ผ่าน Settings | 1. เปิด comments/feed เดิม | เนื้อหาของ ACCT-2 กลับมาเห็นครบทุกระดับ | — | Low | |

### 2.12 Guest matrix + Language + theme + integration

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
|---|---|---|---|---|---|---|---|---|---|
| FO-TC-SHT-107 | [GATE] matrix ทุก gated entry | GUEST | Func | guest อยู่ feed/detail | 1. ลองทีละอัน: ↗ share / 🔖 save / 🎁 wishlist / 🔔 watch alert / Follow ใน likes sheet / ♡ บน comment | ทุกอัน → Member Sheet "Join TukDaeng" ใบเดียวกัน — sheet ปลายทางไม่เปิดเลย | — | High | |
| FO-TC-SHT-108 | ปิด Member Sheet → ไม่มี action ค้าง | GUEST | Func | Member Sheet เปิดอยู่ | 1. แตะพื้นมืด หรือ "Skip for now" | กลับ surface เดิม — ไม่มี action เกิด ไม่มี sheet ค้าง | — | Medium | |
| FO-TC-SHT-109 | ภาษาไทย — comments/likes/follow/watch sheets | MEMBER | UI | Language = ไทย (Profile → ≡ → Language) | 1. เปิด comments / likes / uf / mf / wa | หัวข้อ+ปุ่ม+placeholder แปลครบ — "ความคิดเห็น" / "ตอบกลับ" / "เพิ่มความคิดเห็น…" / "ยอดถูกใจ" และข้อความ uf/mf/wa ครบ | — | Medium | |
| FO-TC-SHT-110 | ภาษาไทย — save/wishlist/new-collection/block/caption input/share (spec ล็อก: แปลครบ) | MEMBER | UI | Language = ไทย | 1. เปิด save / wishlist / nc / block / caption sheet / share | **ทุกข้อความใน sheet เป็นภาษาไทยครบ** — "Saved"/"Private"/"Collections"/"New collection"/"Collection name"/block ทั้ง sheet/placeholder input — ไม่มี hardcode อังกฤษเหลือ (เว้นชื่อผลิตภัณฑ์ภายนอก เช่น Messenger/LINE) | — | High | |
| FO-TC-SHT-111 | dark theme | MEMBER | UI | Theme = Dark (Profile → ≡ → Theme) | 1. เปิด comments + save + wa | sheet bg/foreground ตาม dark tokens + scrim dim ถูก + toast อ่านได้ | — | Low | |
| FO-TC-SHT-112 | multi-collection เห็นจาก Saved hub (spec ล็อก) | MEMBER | Func | โพสต์อยู่ COL-A+COL-B (SHT-062) | 1. เปิด Saved hub → เข้า COL-A → ออก → เข้า COL-B | โพสต์อยู่ **ทั้งสอง** collection + จำนวนนับถูกต้อง — ยืนยัน multi-collection จากฝั่ง collection viewer | — | High | |
| FO-TC-SHT-113 | ลบ comment → count sync ทุก surface | MEMBER | Func | ลบ comment ตาม SHT-030/031 | 1. ออกไปดู feed card + detail ของโพสต์เดิม | comment count บนการ์ดและ detail ลดตรงกับจำนวนที่ลบ (รวม replies ที่หายไป — จดวิธีนับจริงลง Note ถ้าต่าง) | — | Medium | |
| FO-TC-SHT-114 | sheet บน watch-alert solo viewer | MEMBER | Edge | viewer ที่เปิดจาก watch alert row (ต้องมี alert row — ดู FO-TEST-11/06) | 1. กด "Likes" / 💬 บนการ์ด | sheet เปิดเหนือ viewer ได้ปกติ (ถ้าไม่มี alert row mark BLOCK) | — | Low | |
| FO-TC-SHT-115 | ต้องปิด sheet ก่อนออกจาก viewer | MEMBER | Edge | comments sheet เปิดบน viewer | 1. พยายามกด ← ของ viewer ขณะ sheet เปิด 2. ปิด sheet → กด ← | ← ถูก scrim บังจนกว่าปิด sheet — ไม่มีทางให้ sheet ค้างหลัง viewer ปิด | — | Low | |

### 2.13 Additional sheets + quick actions (entry-level)

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
|---|---|---|---|---|---|---|---|---|---|
| FO-TC-SHT-116 | report-user sheet จากห้องแชท | MEMBER | Func | ห้องแชทกับ ACCT-2 เปิด | 1. เมนู/⋯ ในห้องแชท → "Report" | confirm sheet "Are you sure you want to report {user}?" + ปุ่ม "Report and delete" + "Report" + "Cancel" | — | High | |
| FO-TC-SHT-117 | Report / Report and delete / Cancel | MEMBER | Func | report sheet เปิด | 1. "Cancel" → เปิดใหม่ → "Report" 2. (รอบสอง ห้องอื่น) "Report and delete" | Cancel → ปิดเฉย ๆ; "Report" → เข้า report flow/ยืนยัน (FO-TEST-15/16); "Report and delete" → แชทถูกลบออกจากรายการ + เข้า report flow | — | Medium | |
| FO-TC-SHT-118 | เมนู ⋯ บนโพสต์บอร์ด/community | MEMBER | Func | หน้า board/community มีโพสต์ (ถ้า build ยังไม่มี board mark BLOCK) | 1. กด ⋯ บนโพสต์ | menu sheet เปิดพร้อมแถว action ตาม design (จดรายการจริงลง Note) — แถวแต่ละอันทำงาน/เข้า flow ของมัน | — | Medium | |
| FO-TC-SHT-119 | เมนู ⋯ บน profile คนอื่น (profile more) | MEMBER | Func | profile ของ ACCT-2 | 1. กด ⋯ บน profile | options sheet เปิดตาม design (เช่น Share this profile / About this account / Copy profile URL / Report / Block — จดรายการจริงลง Note) | — | Medium | |
| FO-TC-SHT-120 | attach sheet ในห้องแชท | MEMBER | Func | ห้องแชทเปิด | 1. กด "+" ใกล้ช่องพิมพ์ | attach sheet เปิดพร้อมตัวเลือกแนบ (รูป/กล้อง/อื่น ๆ ตาม design — จดจริงลง Note) + ปิดด้วย scrim/ลากลงได้ | — | Medium | |
| FO-TC-SHT-121 | Ask pill → แชท seller พร้อมบริบทลิสติ้ง (spec ล็อก) | MEMBER | Func | การ์ด/viewer ของโพสต์ sale ของ seller อื่น | 1. กด "Ask" | เข้าห้องแชทกับ seller นั้นทันที — มีการ์ด/ลิงก์อ้างถึงลิสติ้งที่กด + ช่องพิมพ์พร้อมใช้ (ถ้ามีข้อความ prefilled จดจริงลง Note); กดซ้ำจากโพสต์เดิมใช้ห้องเดิม | — | High | |
| FO-TC-SHT-122 | Ask บนลิสติ้งตัวเอง | MEMBER | Edge | own sale post | 1. หา/กด "Ask" | ไม่มีปุ่ม Ask บนลิสติ้งตัวเอง — หรือถ้ามี กดแล้ว **ต้องไม่** สร้างห้องคุยกับตัวเอง (toast/ไม่ทำงานตาม design จดจริงลง Note) | — | Medium | |
| FO-TC-SHT-123 | [GATE] Ask pill | GUEST + MEMBER | Func | โพสต์ sale | 1. guest กด "Ask" → ปิด Member Sheet → sign in → กดซ้ำ | guest → Member Sheet; member → เข้าแชทตาม SHT-121 | — | High | |
| FO-TC-SHT-124 | Follow pill บน viewer/profile → follow จริง | MEMBER | Func | viewer head/profile ของ USER-NF | 1. กด "Follow" | follow จริง — ปุ่มเปลี่ยน "Following"/หายตาม design + sync ทั้งแอป (Following list +1) | — | High | |
| FO-TC-SHT-125 | [GATE] Follow pill | GUEST | Func | viewer head/profile ของ USER-NF | 1. guest กด "Follow" | Member Sheet — ไม่มีการ follow เกิด | — | High | |

## 3. Traceability audit — sheets vs inventory §2.2 + §3.2

| Inventory row | TC ที่ครอบ |
|---|---|
| Comments bottom sheet (open/rows/reply/like/popover/delete/block/report) | SHT-013..041 |
| Likes sheet | SHT-042..048 |
| Share sheet | SHT-049..055 |
| Save sheet + collections (multi) | SHT-056..066, SHT-112 |
| Wishlist sheet | SHT-067..072 |
| New collection sheet (nested) | SHT-064,065,071,073..080 |
| Watch alert sheet (entry+mechanics — flow FO-TEST-11) | SHT-081..090 |
| Unfollow confirmation sheet | SHT-009,091..094 |
| Manage following sheet | SHT-095..098 |
| Caption sheet / details sheet | SHT-099..103 |
| Block sheet + unblock | SHT-033..036,104..106 |
| Sheet mechanics (scrim/drag/layer order/dialog/toast/z-order) | SHT-001..012 |
| Guest gate → Member Sheet | SHT-028,041,046,053,063,072,090,107,108,123,125 |
| Language + dark + integration | SHT-109..115 |
| Chat report sheet | SHT-116,117 |
| Board post menu (bdmenu) | SHT-118 |
| Profile more menu (pf-more) | SHT-119 |
| Chat attach sheet (ch-attach) | SHT-120 |
| Ask pill (quick action) | SHT-121..123 |
| Follow pill (quick action) | SHT-124,125 |

## 4. Spec decisions — findings เดิม GAP-SHT-01..11 ถูกล็อกเป็นพฤติกรรมจริง

| Finding เดิม (รอบ prototype) | Spec ล็อกสำหรับแอปจริง | TC ที่ verify |
|---|---|---|
| GAP-SHT-01 comment input/emoji/Reply เป็น dead zone | พิมพ์+ส่ง comment ได้จริง, emoji ส่ง comment ทันที, Reply prefill @ชื่อและส่งได้ (ชั้น 1) | SHT-019,021,022 |
| GAP-SHT-02 reply ซ้อนไม่ได้ | reply ได้ 1 ชั้นเท่านั้น — reply row ไม่มี Reply affordance (negative เคส) | SHT-018,020 |
| GAP-SHT-03 like comment ไม่ persist | like/ unlike persist จริง หลังปิด-เปิด sheet | SHT-023,024 |
| GAP-SHT-04 Follow ใน likes sheet เป็น local toggle | Follow เปลี่ยนสถานะจริง sync ทั้งแอป | SHT-045 |
| GAP-SHT-05 โพสต์ 0 like มี/ไม่มี likes entry คลุมเครือ | ซ่อน entry ทุก surface เมื่อ 0 likes โผล่หลัง like แรก (IG parity) | SHT-047,048 |
| GAP-SHT-06 single-collection (move) | **multi-collection** — โพสต์อยู่หลาย collection พร้อมกัน; แตะใบที่ check = เอาออกเฉพาะใบนั้นไม่ unsave ทั้งโพสต์ | SHT-057,060,062,070,112 |
| GAP-SHT-07 ชื่อ collection ซ้ำ | อนุญาต — สร้างชื่อซ้ำได้ไม่ block | SHT-080 |
| GAP-SHT-08 ไม่มี ESC/drag-dismiss + backdrop ปิด dlg+sheet พร้อมกัน | ลากลงปิดได้ทุก sheet; ปิดทีละชั้นเสมอ (scrim/device back = ชั้นบนสุดก่อน) | SHT-004,005,008 |
| GAP-SHT-09 uf ทับ caption sheet แล้วปิดทิ้ง | Cancel/Unfollow เสร็จย้อนกลับ caption sheet เดิม | SHT-009,094 |
| GAP-SHT-10 overlay class ค้างตอน swap | เปิด sheet ใบใหม่เคลียร์ overlay เดิมหมด — ไม่มี UI/สถานะค้าง | SHT-001,002 |
| GAP-SHT-11 ข้อความ sheet hardcode อังกฤษ | ข้อความทุก sheet แปลตามภาษาแอปครบ (เว้นชื่อผลิตภัณฑ์) | SHT-109,110 |

- **spec ล็อกเพิ่มเติมรอบนี้:** เอาไอคอนแนบรูป/GIF ออกจากช่อง comment (SHT-016) · share ส่งเพื่อนเข้าแชทจริง + post card ตรงโพสต์ + Copy link ลง clipboard จริง + แอปภายนอกผ่าน share intent จริง (SHT-051,052,054) · Unfollow จาก manage-following sheet ทันทีไม่มี confirm (SHT-098) · watch alert Create = alert ON จริง (SHT-088) · Ask pill เข้าแชท seller พร้อมบริบทลิสติ้ง (SHT-121)
- **ยังอยู่ task อื่น (ไม่ซ้ำที่นี่):** watch-alert criteria derivation/matching/firing = FO-TEST-11 · report flow ข้างในหลัง entry = FO-TEST-15/16 · savedcol manage/select/move ละเอียด = FO-TEST-14 · chat room internals = FO-TEST-16 · Member Sheet เนื้อหา = FO-TEST-01/17
