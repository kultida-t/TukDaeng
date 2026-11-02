# FO-TEST-001 — ข้อเสนอแนะยึด IG เป็นมาตรฐาน + รายการค้าง (รวม batch A/B)

> Task: 53c64847 · วันที่: 2026-10-30
> หลักการ: ยึด IG เฉพาะพฤติกรรม interaction ของแอปทั่วไป — กติกาผลิตภัณฑ์ของ TukDaeng (guest browse, ไม่มีชำระเงินใน V1, ไลก์ของโพสต์คนอื่นไม่โชว์ตัวเลข, Watch Alert/Portfolio) ยังคงเดิม
> สถานะ: **ข้อเสนอ/การตัดสินเบื้องต้นโดยผู้ตรวจ** — ยังไม่ได้แก้ spec/prototype/เคสตามข้อ A เลย (ยังไม่ได้บันทึกเป็น DEC)

## A. ตัดสินตามมาตรฐาน IG แล้ว (ไม่ต้องถาม — ย้อนได้ถ้าเจ้าของไม่เห็นด้วย)

| # | เรื่อง | ตัดสิน | เคส/เล่มที่เกี่ยว | งานที่ต้องทำ |
|---|---|---|---|---|
| A1 | Alerts ใช้ infinite scroll เหมือน Feed | โหลดเป็นหน้า 10 รายการ | ALT-008 | เพิ่มใน 09 |
| A2 | Board like เป็น per-user, persist, sync ข้ามเครื่อง | ใช่ | BRD-059, 060, 061 | แก้ 12 §Session (D8) และ contract |
| A3 | Board copy link ใช้ได้จริง; deep link เปิดบทความได้; ไม่พบ → หน้า not found; back ตก Feed | ใช่ (ต้อง implement) | BRD-062–065 | เพิ่มใน 12 + งาน dev |
| A4 | Tab state ทุกแท็บ (รวม Board) คงตำแหน่ง/หน้าลึก; re-tap แท็บ = กลับ root | ใช่ | BRD-051, SHELL-027/028/065 | ขยาย 00_NAV §6.3 |
| A5 | Chat state (threads, pin, mute, hide, draft) เป็น server-backed | ใช่ | CHAT-110 | แก้ 07 (session-only ปัจจุบัน) |
| A6 | Chat ข้อความสองทาง realtime | ใช่ (contract backend) | CHAT-109 | 07 |
| A7 | ห้องที่ hide ไม่โผล่ใน Items view | ใช่ | CHAT-031 | แก้ prototype (งานแยก) |
| A8 | ส่งรูปแล้ว thread ขึ้นบนสุด + un-hide เหมือนส่งข้อความ | ใช่ | CHAT-067 | แก้ prototype (งานแยก) |
| A9 | ใน viewer รูปแชท: swipe ข้ามรูป + pinch zoom | ใช่ | CHAT-070 | แก้ prototype; 07 |
| A10 | เวลาข้อความเป็นเวลาจริง (ไม่ใช่ค่าคงที่) | ใช่ | CHAT-048 | แก้ prototype |
| A11 | สถานะส่งข้อความ: Sending / Failed + แตะเพื่อส่งใหม่ | ใช่ เพิ่มใน 07 | CHAT-118 | เพิ่มสเปกและ copy |
| A12 | ผู้ใช้ที่ปิดบัญชีแสดงเป็น "ผู้ใช้งานที่ปิดบัญชี / Deactivated user" | ใช่ | CHAT-127, DEC-09 | แก้ DEC-09 ให้ชี้ที่เพิ่มใน 07 |
| A13 | Chat mute ตัดทั้ง push และ badge | ใช่ | CHAT-114 | 07 |
| A14 | ค้นหาในห้องแชท: composer ถูกซ่อนระหว่างค้นหา | ใช่ | CHAT-056 | 07 |
| A15 | ยกเลิกกลาง report-and-delete → ห้องไม่ถูกลบ | ใช่ | CHAT-084 | 07 (ตรง expected แล้ว) |
| A16 | Watch Alert self-match: ไม่สร้าง watch row ให้ตัวเอง (toast ก็ไม่จำเป็น) | ใช่ | WA-054 | แก้ 10 |
| A17 | Watch Alert ลำดับใหม่สุดบนสุด | ใช่ | WA-029 | ยืนยันใน 10 |
| A18 | Watch Alert ชื่อว่าง → auto name ไม่ block | ใช่ | WA-017, WA-036 | ยืนยันใน 10 |
| A19 | ลบ alert แล้ว notification ที่เคยได้รับยังอยู่ | ใช่ | WA-057 | ยืนยันใน 10 |
| A20 | Watch Alert copy: Edit/Delete/Updated/Removed ตามที่ prototype ใช้ + TH ครบ | ใช่ เพิ่มใน 10 | WA-034, 041, 032 | เพิ่ม copy |
| A21 | Watch Alert empty state TH | ใช่ เพิ่มใน 10 | WA-028 | เพิ่ม TH copy |
| A22 | Profile แสดง "Followed by {name} and others" ใต้ profile คนอื่น | ใช่ เพิ่มใน 06 | PROF-033 | เพิ่ม |
| A23 | Username ซ้ำ `This username is already taken.` และ link ผิดรูปแบบ `Invalid link — enter a URL (https://...) or @username` | ใช่ เพิ่ม copy ใน 06/01 | PROF-091, 095 | เพิ่ม copy (TH คู่) |
| A24 | Error โหลดไม่ได้: `Unable to load data` + `Try again` / `ลองใหม่` และ offline | ใช่ เพิ่มใน ERROR_STATE catalogue | WA-074, ALT-075 | เพิ่ม catalogue |
| A25 | ใช้ copy และ state เดิมของ prototype ที่ตรงกับ IG-style ทั้งหมด (ที่ไม่ได้ระบุด้านบน) | ใช่ | — | ตรวจทีละเล่มในรอบ C |
| A26 | Pagination ขนาด 10 ทุกรายการที่เป็นฟีดยาว (Feed, Alerts, Board latest) | ใช่ | DEC-13 | ใช้ค่าเดียวกัน |
| A27 | Pull-to-refresh ทุกหน้าที่เป็น list ยาว (Feed, Alerts, Chat list) | ใช่ | DEC-15 | เพิ่มใน 09/07 |

## B. ไม่อยู่ใน V1 (ตัดออกจากเคส/สเปก)

| # | เรื่อง | การตัดสิน | เคส |
|---|---|---|---|
| B1 | System alert "new device login" | ไม่อยู่ใน V1 ถอนเคส | ALT-070 |
| B2 | Watch Alert self-match เป็น notification | ไม่ทำ (ดู A16) | WA-054 |

## C. ต้องถามเจ้าของ (พร้อมข้อเสนอแนะ)

| # | คำถาม | ข้อเสนอแนะ | เคส |
|---|---|---|---|
| C1 | แชทแยกห้องตามวันที่ในแกลเลอรี (จัดกลุ่มตามวัน) เป็น V1 หรือไม่ | IG ไม่ได้จัดกลุ่มตามวันในแกลเลอรีแชทตรง ๆ → **แนะนำไม่ทำใน V1** (ถอน expected) | CHAT-086 |
| C2 | Chat "Only people I follow" ทำอย่างไร | IG ใช้ message requests (ข้อความจากคนที่ไม่ได้ตาม ไปโฟลเดอร์แยก) → **แนะนำ V1 ทำเป็น message request** หรือยกไป V2 | CHAT-097 |
| C3 | Deep link + native share ของบทความ Board (A3) เข้า V1 หรือไม่ | IG มี deep link ทุกโพสต์ → **แนะนำเข้า V1** (งาน dev มีต้นทุน) | BRD-062–065 |
| C4 | Batch C (เล่ม 14–19, ~480 แถว): ตรวจรายแถวทั้งหมด หรือเฉพาะ High + เคส lock/decision | **แนะนำ High + lock/decision รอบนี้** แล้วหมวดที่เหลือเป็น group-level ระบุชัดในรายงาน | — |
| C5 | ยืนยันชุดงาน prototype (f2f1934f) ทั้งหมดตาม A4–A10, A22, A23 และ carousel/double-tap/pagination (DEC-13/14/15) | อนุมัติเป็นงานแยก | — |
| C6 | ยืนยันการบันทึกข้อ A/B เป็น DEC ใหม่ (ยังไม่ได้บันทึกใน decision register) | ยืนยันได้ แล้วจะบันทึกเป็น DEC-25 ขึ้นไป | — |

## D. งานค้างที่ยังไม่ได้ทำ (ตามลำดับ)

1. **Spec ตามข้อ A** — ~25 จุด ใน 00_NAV §6.3, 06, 07, 09, 10, 12, ERROR_STATE catalogue (ยังไม่แก้)
2. **เคสตามข้อ A/B** — เปลี่ยน expected และถอนเคส ALT-070 (MD และ CSV) ยังไม่แก้
3. **Prototype (f2f1934f)** — ตามข้อ A/C5 และ DEC-13–16 (งานแยก ยังไม่เริ่ม)
4. **Batch B รายแถว**: เล่ม 10 (90), 12 (121), 13 (116) ยังทำระดับหมวด
5. **Batch C รายแถว** (14–19) ยังไม่เริ่ม (ดู C4)
6. **Batch A ไม่ตรงที่ยังไม่ได้ตัดสิน**: AUTH-034/035/039/046/047/072/077/079/090/096, SHELL-010–019, SHELL-038, SHELL-056/059–060/064/065, SRCH-060, CRE-009/012/013/041/067/069/070, PV-003/011/035/039/047/053, DET-032/034/037, SHT-009/016/019/024/035/038/051/052/064/073–075/082/094/098/109/110/118–120 — อยู่ในไฟล์ batch A หัวข้อ 2–8 และ 12–15
7. **Batch B ไม่ตรงที่ยังไม่แก้**: CHAT-031/048/067/070/086/109/110/118/127; BRD-059–065; ALT-008/070/075; PROF-033/091/095; WA-054/074 — รวมอยู่ในข้อ A/B/C ด้านบน
8. **DEC-09** ต้องแก้การอ้างอิงให้ตรงกับ spec ที่จะเพิ่ม (A12)
9. **task 53c64847**: ยังเป็น todo — ปิดได้หลังข้อ 1–3 เสร็จ และข้อ 4–5 ถูกระบุชัดว่าเป็นผล group-level

## E. สรุปที่ต้องรู้
- ข้อ A เป็นข้อที่ตัดสินแล้วตามมาตรฐาน IG เจ้าของย้อนได้ทุกข้อ
- ข้อ C ต้องรอคำตอบ โดยมีข้อเสนอแนะกำกับแต่ละข้อ
- ผลรายแถวของ batch B เล่ม 10, 12, 13 และ batch C ยังไม่ครบ อย่านำผลระดับหมวดไปใช้ตัดสินเคสโดยตรง

## อัปเดตสถานะ (ปลายรอบ)
- spec: แก้บรรทัดเดิมแล้ว — 00_NAV (re-tap), 07 (server-backed), 11 (flat replies), 12 (per-user like) และเพิ่ม amendment ท้ายไฟล์ 00_NAV, 07, 09, 10, 12, 06, ERROR_STATE
- เคส MD: หมายเหตุ DEC-25 ท้ายไฟล์ 08–12; ALT-070 ถอนแล้ว
- เคส CSV: sync แล้วสำหรับ CHAT (086, 097, 118, 127, 031, 048, 067, 070, 110, 109, 114, 056), BRD (059–065), WA (054, 074), PROF (033, 091, 095)
- ยังค้าง: prototype (f2f1934f); batch A ไม่ตรงที่ยังไม่ตัดสิน; batch B รายแถว 10/12/13; batch C ทั้งเล่ม (14–19)

## อัปเดต batch C (ปลายรอบ)
- batch C: ตรวจกลุ่ม + High ด้วยคีย์เวิร์ด (ดู FO-TEST-001-SPEC-CHECK-batch-C.md) — ยังไม่ใช่ผลรายแถว
- DEC-28 (block server-backed) amendment เพิ่มใน spec 15 แล้ว
- DEC-29 (legal TH) ค้าง: ต้องการเนื้อหาฉบับไทยที่อนุมัติจากเจ้าของ
- ค้างทั้งหมด: prototype f2f1934f; batch A ไม่ตรงที่ยังไม่ตัดสิน; รายแถว batch B 10/12/13; รายแถว batch C 14–19; sync CSV 14–19
