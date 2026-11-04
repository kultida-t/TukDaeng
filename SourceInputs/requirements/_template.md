# Requirements Snapshot — <notebook title>

- Snapshot date: YYYY-MM-DD
- Source: Gemini Notebook "<notebook title>"
- Notebook ID: <uuid>
- Notebook account: <google account>
- Captured by: <ผู้จับ snapshot + วิธี เช่น Devin agent via gemini-notebook-mcp (notebook_query)>
- Status: raw intake — ยังไม่ได้เทียบกับ module specs / prototype

> Notebook เป็น input เท่านั้น — snapshot ไฟล์นี้ใน repo คือ source of truth
> ถ้า notebook เปลี่ยน ให้สร้าง snapshot ไฟล์ใหม่ตาม convention ห้ามแก้ไฟล์เก่าย้อนหลัง

## Sources ใน Notebook (<n> ตัว)

| Source | ประเภท | Source ID | ข้อที่อ้างถึง |
|--------|--------|-----------|--------------|
| <source title> | <docx / รูปภาพ / เสียง / url / text> | <source uuid> | NB-001 – NB-0xx |

รวม requirement ทั้งหมด <n> ข้อ — ID รูปแบบ NB-### ใช้อ้างอิงภายใน snapshot นี้ (unique เมื่อระบุคู่กับชื่อไฟล์) เลขในวงเล็บเหลี่ยม [n] ท้ายแต่ละข้อคือ citation อ้างกลับไปหา source ใน notebook

## Requirements

### **หมวดที่ 1: แหล่งข้อมูล "<source title>" (<ประเภท>)**

1. **NB-001 — <ชื่อ requirement สั้น ๆ>**
   * **ประเภท:** <Functional / UX/UI / Business Rule / Constraint>
   * **แหล่งที่มา:** <ชื่อ source>
   * **บริบท/ความหมาย:** <อธิบาย requirement นี้หมายถึงอะไร ผลกระทบต่อระบบ/หน้าจอ> [<citation>]
