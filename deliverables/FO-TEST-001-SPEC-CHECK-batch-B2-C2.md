# FO-TEST-001 — ตรวจ expected เทียบ spec รายเคส: Batch B2/C2 (เล่ม 10, 12, 13, 14–19)

> Task: 3e724767 · วันที่: 2026-11-02
> ต่อจาก batch A/B/C — เล่ม 01–09 และ 11 เคยตรวจรายเคสแล้ว รอบนี้ทำเล่มที่เหลือให้ครบ
> กติกาตัดสินเดิม: expected ต้องตรง spec/contract/DEC ข้อเดียวเด็ดขาด · พฤติกรรมมาตรฐาน IG ตัดสินเองได้ · เรื่องขอบเขตผลิตภัณฑ์รวมถามผู้ใช้
> วิธี: อ่าน expected ทุกแถวของ MD แล้วเทียบกับ spec module ที่เคสอ้าง (copy ตรวจตามตัวอักษร + พฤติกรรม/สถานะ/ตัวเลขเทียบหมวด spec ที่เกี่ยว) + เทียบ CSV ให้ตรง MD + ตรวจเลขสถิติท้ายเล่ม

## สรุปผลรวม

| เล่ม | เคส | ตรง | แก้เคส (MD+CSV) | แก้ spec | หมายเหตุ |
|---|---:|---:|---:|---:|---|
| 10 Alerts (ALT-001–079, ถอน 070) | 78 | 76 | 2 | 1 | ALT-015 อ้างเคสที่ถอนแล้ว · ALT-075 ขัด DEC-25 offline |
| 12 Profile (PROF-001–111) | 111 | 110 | 1 | 1 | PROF-069 มี "Cancel" ที่ไม่มีจริง · spec ขาด Chat บน following row |
| 13 Portfolio (AST-001–106) | 106 | 106 | 0 | 0 | D1–D21 + ล็อก 2026-10-30 ครอบทุกจุดแล้ว |
| 14 Library (LIB-001–118) | 120* | 120 | 0 | 0 | LIB-050 เคยแก้ใน batch C แล้ว · สถิติท้ายเล่มเขียน 120 TC (นับจริง 118 IDs — LIB-106/107 เป็น DEC-11/12 เคสเพิ่มจึงมี ID เกินช่วง) |
| 15 Settings (SET-001–121) | 121 | 121 | 0 | 0 | copy/toggle/flow ตรง spec 13; SET-024 SSO ตรง contract |
| 16 Report/Block (TRS-001–067) | 67 | 67 | 0 | 0 | 9 เหตุผล = PM_REASONS; TRS-062/063 DEC-28 · 047/066 DEC-06 · 067 DEC-07 |
| 17 Guest gate (GATE-001–056) | 56 | 56 | 0 | 0 | Member Sheet `Join TukDaeng` ตรง 00_GLOBAL §11 ทุกเคส |
| 18 E2E (E2E-001–016) | 16 | 16 | 0 | 0 | ตรง DEC-12 deep-link flow + เส้นทางข้ามโมดูล |
| 19 Lang/Theme (LANG-001–048, THM-001–016) | 64 | 63 | 0 | 0 | LANG-045 ผ่านได้เมื่อ build แปลครบตาม DEC-19 (งาน prototype f2f1934f) |
| **รวม** | **739** | **735** | **3** | **2** | |

*เล่ม 14 มี LIB-001–118 (118 IDs) + LIB-106/107 ที่เพิ่มตอน FO-TEST-22 (DEC-02/11) — ระบบนับ "120 TC" ถูกต้องตามจำนวนเคสจริงในไฟล์

## รายการที่แก้ (MD + CSV sync แล้วทั้งคู่)

| เคส | ปัญหา | ที่แก้ |
|---|---|---|
| ALT-015 | precondition อ้าง `(ALT-070)` — เคสที่ถอนแล้วตาม DEC-26 | เปลี่ยนเป็น `มี system row ใน feed (seed/ข้อมูลจริง)` |
| ALT-075 | expected = `Unable to load data`+`ลองใหม่` ขัดกับตัวเองท้ายเล่มและ DEC-25/ERROR_STATE (offline-with-cache: precondition ระบุ "alerts เคยโหลดไว้") | expected = แสดงข้อมูลที่โหลดไว้ + แถบ `You're offline`/`คุณออฟไลน์อยู่` ไม่บัง tabs/nav · เน็ตกลับแล้ว refresh · CSV sync |
| PROF-069 | expected มี "Cancel ปิดไม่ block" — spec 06 AC-040 ระบุ blkSheet **ไม่มี Cancel row** (dismiss ผ่าน backdrop) | แก้เป็น "ไม่มีปุ่ม Cancel; แตะ backdrop/back ปิด = ไม่ block" · CSV sync |

## รายการแก้อื่นใน MD เล่ม 10 (ความสอดคล้อง ไม่ใช่ expected)

- สถิติท้ายเล่ม `79 TC — Med 45` → `78 TC — Med 44` (ALT-070 ถอนแล้ว)
- coverage/§4 ตัดคำ `system` ออกจากคำอธิบาย Real generation (เคส generation ของ system ถูกถอนแล้ว)
- หมายเหตุท้าย `ALT-015/070 (system trigger)` → `ALT-015 (ต้องมี system row จริง)`
- หัวข้อ DEC-25 Amendments ท้ายเล่ม 12: `CSV ยังไม่ sync` → `MD+CSV sync แล้ว` (ตรวจแล้ว PROF-033/091/095 ตรงกันทั้งสองไฟล์)

## รายการที่แก้ spec (ให้ตรงเคส/prototype)

| ไฟล์ | จุด | ที่แก้ |
|---|---|---|
| `09_NOTIFICATION_MODULE.md` | DEC-25 amendment เขียน "ไม่มี system alert 'new device login' ใน V1" กว้างเกิน — body ยังคง type `system` + seed row + placeholder destination ตาม §9 | แก้เป็น "ไม่มี **generation** ของ system alert … (ถอนเคส ALT-070 เท่านั้น; type `system` + placeholder destination ยังอยู่ตาม §9)" — ตีความ DEC-26 ให้ตรง scope เดิม (ถอนเฉพาะ ALT-070) |
| `06_PROFILE_MODULE.md` | §8/AC-029 เขียน own following rows มีแค่ `...` popover — แต่ prototype (SoT) และเคส PROF-047/062 มีปุ่ม `แชท`/`Chat` (`pf-msg`) บนทั้ง followers และ following | เพิ่ม `แชท`/`Chat` (`pf-msg` — DM ห้องเดียวกัน) ใน §8 following rows + ขยาย deviation #27 ครอบทั้งสอง tab |

## เคสที่ตรวจแล้วว่า "ตรง" แต่มีบริบทต้องรู้ (ไม่แก้)

| เคส | บริบท |
|---|---|
| PROF-009 | spec 06 §9 บันทึก `ring` = own profile เสมอ (prototype quirk) — เคสคาดหวัง ring เมื่อมี story จริง = พฤติกรรม IG/contract ที่ถูกต้อง เก็บเคสไว้ |
| PROF-089 | copy `Username required — 3–20 characters: a–z, 0–9, _ or .` ตรงกับ prototype (L22678) และ spec §11 — ตรง |
| PROF-042/043/044 | toast `Unfollowed`/`Added to favorites`/`Removed from favorites` — spec ระบุชัดบน surface อื่น (pfl-pop/11 §toasts) ใช้ชุดเดียวกัน — ตรง |
| AST-001/005 | spec 14 เขียน guest ที่หลุดเข้ามาเห็น empty state แต่เคสคาดหวัง "guest ไม่มีทางถึงเลย" — สอดคล้องกัน (guest เข้าไม่ถึง own profile → ไม่มี entry; หลุดทางลึก → empty) |
| LIB-001/111 | guest เปิด `saved` ผ่าน bookmark ได้แต่เห็น `Nothing saved yet` — ตรง spec 11 (hub เปิดเสรี ข้อมูลว่าง) |
| LIB-056/057 | move semantics ตรง spec 11: in-col = `Moved to` (เปลี่ยน membership), move→new col = ล้าง col เดิมทั้งหมด (lock 2026-10-29) |
| SET-024 | SSO-only ไม่เห็น/ปิด Change Password — ตรง spec 13 contract (prototype แสดงเสมอ = documented) |
| LANG-005 | ใช้ร่างไทย `FO-TEST-001-LEGAL-TH-draft.md` เป็นตัวอย่าง — ตรง DEC-29 |
| LANG-045 | "ไม่มี EN เหลือ" ขึ้นกับ coverage การแปลของ build — ผ่านได้เมื่องาน prototype แปลครบตาม DEC-19 (ระบุไว้แล้วใน batch C) |

## คำถาม/ประเด็นที่รวมไว้ถามผู้ใช้ (ไม่มีที่ต้องบล็อกงาน)

1. **ALT-015/ALT-030 ควรอยู่ต่อไหม?** — DEC-26 ตัด "new device login" generation ออกจาก V1 แต่ spec ยังคง `system` type + seed row + placeholder destination. รอบนี้ตีความว่า type ยังอยู่ (เพราะ DEC-26 ระบุถอนเฉพาะ ALT-070) แล้วแก้ข้อความ amendment ใน spec 09 ให้ชัด — ถ้าพี่ตั้งใจให้ `system` type ออกจาก feed ทั้ง type ต้องถอน ALT-015/030 เพิ่ม (ห้ามถอนเคสเองตามกติกา)

## ข้อที่ยังค้าง (ไม่ใช่ของ task นี้)

- LANG-045 ผ่านได้เมื่อ prototype/build แปลครบ (งาน f2f1934f)
- batch A รายการ "ไม่ตรงที่ยังไม่ตัดสิน" (ดู CONSOLIDATED หัวข้อ D ข้อ 6) — อยู่นอกขอบเขตรอบนี้
- รอผู้ใช้ยืนยันผลรอบนี้ก่อนปิด task 3e724767
