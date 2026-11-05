# DSR Manual Process — TukDaeng (Data Subject Request SOP)

| รายการ | ข้อมูล |
|---|---|
| Version | 0.1 |
| Date | 2026-11-05 · Asia/Bangkok |
| Task | BAC-008 [`5c0b61c2`] — Mission `0e19c244` Objective: PDPA Compliance Mapping / Feature: Compliance Map |
| Status | **ADOPTED — ตาม DEC-54** (manual process สำหรับ V1; self-service export = Phase 2) |
| Source | ตอบ gap G-04/G-06 ใน `docs/pdpa-compliance-map.md` |

## 0. สรุป

ผู้ใช้ใช้สิทธิ์ PDPA (ขอเข้าถึง/สำเนาข้อมูล, แก้ไข, ลบ, ถอนความยินยอม, คัดค้าน) ผ่าน **process manual — ไม่ build ฟีเจอร์ใน V1** SLA ตอบกลับ **30 วัน** ตาม PDPA §31 (ต่อเวลาได้อีก 30 วันถ้าเหตุจำเป็น ต้องแจ้งผู้ขอ)

## 1. Intake — รับคำขอ

| ช่องทาง | วิธี |
|---|---|
| Support email / Help & Support channel (`BO-12` Support Center) | รับคำขอทุกรูปแบบ เขียนลง DSR log ทันที |
| In-app Help | ชี้ไปช่องทาง email เดียวกัน |

ไม่ต้องมีฟอร์มพิเศษใน V1 — คำขอเขียนมาแบบไหนก็รับ (PDPA ไม่บังคับฟอร์ม) แต่ต้อง log ทุกใบ

## 2. Steps (owner = Support/Privacy contact)

| Step | ทำอะไร | SLA ภายใน 30 วันรวม |
|---|---|---|
| 1 | Log คำขอ: วันที่รับ, ช่องทาง, ประเภทสิทธิ์ (ตาราง §3), ผู้ขอ | วันเดียวกัน |
| 2 | Verify ตัวตน: ยืนยันว่าผู้ขอ = เจ้าของบัญชีจริง (เช่น ส่งลิงก์ยืนยันไป account email — ห้ามขอเอกสารเกินจำเป็น) | ≤7 วัน |
| 3 | ประเมินคำขอ: สิทธิ์อะไร, ข้อมูลชุดไหน (ดู `pdpa-data-processing-register.md` §1), มีข้อยกเว้นไหม (เช่น ข้อมูลที่ต้องเก็บตามกฎหมาย — reports/audit) | ≤10 วัน |
| 4 | ดำเนินการ: ดึงข้อมูล/ลบ/แก้ตามสิทธิ์ — ลบบัญชี = flow เดิม (30-day grace); export ข้อมูล = dev ดึงจากระบบส่งไฟล์ปลอดภัย | ≤25 วัน |
| 5 | ตอบกลับผู้ขอพร้อมผล + บันทึกปิด log | ≤30 วัน |

## 3. สิทธิ์และวิธีตอบใน V1

| สิทธิ์ (PDPA) | ตอบยังไงใน V1 |
|---|---|
| เข้าถึง/สำเนาข้อมูล (§30) | dev ดึงข้อมูลบัญชี+กิจกรรมเป็นไฟล์ (CSV/JSON) ส่งทาง email ที่ verify แล้ว — ห้ามส่งผ่านช่องทางอื่น |
| แก้ไขข้อมูล (§35) | ชี้แก้เองใน Profile — ถ้าแก้ไม่ได้ support แก้ให้ผ่าน BO (มี audit) |
| ลบข้อมูล (§33) | Delete Account flow เดิม — เจ้าหน้าที่ guide หรือดำเนินการแทนผ่าน BO-13 |
| ถอนความยินยอม (§19) | optional consent ถอนเองที่ Settings > Privacy & cookies; required = Delete Account (ตาม DEC-52 — required เป็น contract basis ไม่ใช่ consent) |
| คัดค้าน/จำกัด (§32/34) | ประเมินเคสต่อเคส — เช่น หยุด personalization ให้ปิด toggle; เคสอื่น escalate PO |

## 4. DSR Log (สร้างครั้งแรกเมื่อมีคำขอจริง)

| Field | คำอธิบาย |
|---|---|
| DSR ID | DSR-YYYY-NNN |
| รับเมื่อ / ประเภท / ช่องทาง | intake fields |
| Verify ผ่าน | Y/N + วิธี |
| ผลลัพธ์ | ตอบครบ / ตอบบางส่วน + เหตุยกเว้น / ปฏิเสธ + เหตุผล (ต้องบันทึกเหตุผลเสมอ — PDPA ให้ปฏิเสธได้เฉพาะกรณีกฎหมายกำหนด) |
| ปิดเมื่อ | timestamp — ต้อง ≤30 วันจากรับ |
