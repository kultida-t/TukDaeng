# SourceInputs/requirements — Requirements Intake Convention

โฟลเดอร์นี้เก็บ **snapshot ของ business requirements** ที่ถ่ายมาจากแหล่งต้นทางภายนอก repo (ตอนนี้คือ Gemini Notebook) — snapshot ในโฟลเดอร์นี้คือ **source of truth** สำหรับ requirement ฝั่ง business แหล่งต้นทาง (notebook) เป็นเพียง input เท่านั้น

## กฎหลัก

- **ต้องอ่าน snapshot ในโฟลเดอร์นี้ก่อนวางแผน/เช็คงานทุกครั้ง** ที่งานเกี่ยวกับ requirement, spec, หรือ prototype
- **Notebook = input only** — ห้ามถือว่าเนื้อหาใน notebook ที่ยังไม่ได้ snapshot เป็น requirement อย่างเป็นทางการ
- **Snapshot เป็น append-only** — ถ้า notebook เปลี่ยน/มี requirement ใหม่ ให้สร้างไฟล์ snapshot ใหม่ด้วยวันที่ปัจจุบัน ห้ามแก้ไฟล์ snapshot เก่าย้อนหลัง (เก็บเป็นประวัติ)
- การแก้ไขเชิงแปลความ/ตัดสินใจ (verdict, gap decision) ไม่เขียนทับลงใน snapshot — ไปอยู่ในเอกสารวิเคราะห์แยก (เช่น gap report, decision log)

## การตั้งชื่อไฟล์

```
YYYY-MM-DD-notebook-<title-slug>.md
```

- `YYYY-MM-DD` = วันที่จับ snapshot (ไม่ใช่วันที่ของ notebook)
- `<title-slug>` = ชื่อ notebook แปลงเป็นตัวเล็ก คั่นด้วย `-` (เช่น `review-app-tukdaeng-09-10-2026`)
- `_template.md` = template มาตรฐาน ก๊อปไปตั้งต้นทุกครั้งที่ทำ snapshot ใหม่

## โครงสร้างในไฟล์ snapshot

1. Header metadata — วันที่จับ, ชื่อ+ID+account ของ notebook, ผู้จับ/วิธีจับ, status
2. ตาราง Sources — source แต่ละตัวใน notebook + source ID + ช่วงข้อที่อ้างถึง
3. รายการ Requirements — แยกหมวดตาม source แต่ละข้อมี ID `NB-###`, ประเภท, แหล่งที่มา, บริบท/ความหมาย, citation [n]

## ID convention

- `NB-###` = เลข requirement ภายใน snapshot นั้น — อ้างอิงภายนอกไฟล์ให้ระบุคู่กับชื่อไฟล์ เช่น `NB-022 (2026-11-04-notebook-review-app-tukdaeng-09-10-2026)`
- ID ใน snapshot เป็น read-only — ถ้ามี snapshot ใหม่ให้เลข NB ขึ้นต้นใหม่ตามไฟล์นั้น ไม่ carry over
- การลงทะเบียน requirement อย่างเป็นทางการ (kanban requirement record) ใช้ระบบ ID ของตัวเอง แต่ควรอ้างกลับมาที่ `NB-###` + ชื่อไฟล์ snapshot เป็น provenance

## วิธีจับ snapshot จาก Gemini Notebook

1. เรียก `notebook_query` (gemini-notebook-mcp) ด้วย notebook ID เป้าหมาย ขอ requirement ทั้งหมดแยกข้อ + ระบุ source
2. ตัดส่วนเกิน (เช่น คำถามต่อท้ายของ AI) ออก ใส่ header metadata + ตาราง sources + ID `NB-###`
3. บันทึกตาม naming convention แล้ว commit — อย่าแก้เนื้อ requirement เอง ถ้า query ได้มาไม่ครบให้ query รอบใหม่แล้วเขียนไฟล์ทับ snapshot วันเดียวกันได้ (ยังไม่ commit) หรือสร้างไฟล์วันใหม่ (commit แล้ว)

## Snapshots

| ไฟล์ | วันที่จับ | Notebook | จำนวน requirement |
|------|-----------|----------|-------------------|
| `2026-11-04-notebook-review-app-tukdaeng-09-10-2026.md` | 2026-11-04 | review app tukdaeng 09/10/2026 | 51 |
