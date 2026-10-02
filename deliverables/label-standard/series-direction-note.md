# Series Direction Note — Mission 1 Handoff (PVR-004)

ส่งต่อให้ mission ถัดไปใน series "ตรวจ Prototype ทีละเมนู + มาตรฐานภาษา/ปุ่ม"

## ยืนยันแล้วใน Mission 1

- **กติกา 2 ชั้นล็อกแล้ว:** ชั้นโครง (nav/page title/modal title/breadcrumb/detail head/status pills/technical keys) = English; ชั้นเนื้อหา (buttons/field labels/copy/filter) = ไทย
- **ปุ่มทุกปุ่มต้องมาจาก canonical table เท่านั้น** — source of truth: `docs/bo-canonical-label-table.md` §2 (Confirmed 02/10/2026, decisions §5.1–5.6 ล็อกครบ)
- **`BO_UI_UX_STANDARD.md` §Navigation and Context อัปเดตแล้ว** (บรรทัด ~613–619) — supersede กฎภาษาเดิม พร้อม pointer ไป canonical table
- **Inventory เสร็จและ re-runnable:** `node Prototypes/scan-labels.mjs` → `deliverables/label-standard/inventory.{md,json}` (1,847 entries, 16 action groups)
- **bo-prototype.html ไม่ถูกแตะ** — ทุก deviation เป็น candidate เท่านั้น

## เหตุผลที่เลือกทิศทางนี้

- โครง UI เดิม (nav/title/modal title) เป็น English อยู่แล้วทั้งระบบ → เปลี่ยนเป็นไทยจะ refactor ใหญ่และชน locked contracts
- ปุ่มส่วนใหญ่เป็นไทยอยู่แล้ว (`ยืนยัน`/`ยกเลิก`/`ปิด`/`ดูรายละเอียด` dominant) → canonical ไทยลดการแก้จอล็อกให้น้อยสุด
- กติกา "คำจำเป็น" คั่นกลางชัดเจน: action verb ไทย / entity+technical term English → dev ตัดสินใจเองได้โดยไม่ต้องถามทุกคำ

## Artifacts ที่เป็น canonical

| File | บทบาท |
|---|---|
| `docs/bo-canonical-label-table.md` | source of truth ของ label เป้าหมาย (canonical + exceptions + deviations + decisions) |
| `deliverables/label-standard/inventory.{md,json}` | สภาพจริงของ label ใน prototype (regenerate ได้) |
| `deliverables/label-standard/manual-review-checklist.md` | checklist สำหรับ module review missions |
| `Prototypes/scan-labels.mjs` | scanner — run ใหม่ได้ทุกครั้ง |

## ยังเปิดอยู่ / ข้อควรระวัง

- §4 deviations (D1–D15) ยังไม่ได้แก้ — ทุกจุดอยู่บนจอ locked ต้อง normalize ต่อจอใน module missions เท่านั้น
- Thai modal titles (`ยืนยันการปิดรายงาน`/`ยืนยันการเผยแพร่`/`ยืนยันการ Restore` ฯลฯ) = normalize candidates → `<EN> Confirm` pattern ตาม §3.2
- `js-label` group `other` (400 labels) ส่วนใหญ่เป็น status/mock-data strings — ถ้าเจอ label ใหม่ที่ไม่มีในตาราง §2 ให้เพิ่ม row (proposed) ก่อนใช้
- ⚠️ Planning accuracy lesson: baseline 4 ชม. over-estimate มาก — actual 0.60 ชม. (แก้ hours_spent ตามหน้าต่างเวลาจริงแล้ว: 0.30/0.15/0.05/0.10) เพราะ scanner automate งานอ่านไฟล์; mission ถัดไปที่เป็น scan/document-heavy ให้ประเมินเวลา AI ต่ำลงตามจริง และยึด in_progress ทีละ task เดียว (mission นี้ timer เดินขนานจน banked hours เบี้ยว ต้องแก้ทีหลัง)
- ตารางนี้บังคับกับปุ่มใหม่ทันที; กับจอเดิมบังคับเฉพาะเมื่อ mission นั้นได้รับ approval normalize

## Mission ถัดไปควรทำอะไร

1. เลือก module แรก (แนะนำเริ่มจาก module ที่ deviation ชัด เช่น Market Data sync modal D1/D12 หรือ Categories D5/D7)
2. เทียบ label จริงของจอกับ canonical table → list deviation เฉพาะจอ
3. เช็ค protected status + เทียบ contract ที่ confirm แล้ว → ถ้าไม่ตรง **ชี้แจ้งก่อนแก้ทุกครั้ง**
4. ขอ approval → normalize ต่อจอ → regenerate inventory ยืนยัน count ลดลง
5. ใช้ `manual-review-checklist.md` เป็น gate ก่อนปิดแต่ละ mission
