# FO-TEST-001 — ตรวจ expected เทียบ spec: Batch C (เล่ม 14–19) — ผลรายแถว (2026-10-30)

> อ่าน expected ทุกแถวของเล่ม 14–19 แล้วเทียบกับ spec 11/13/15/00_GLOBAL/09/14 (copy ตรวจด้วย grep, พฤติกรรมเทียบกับหมวดของ spec)

| เล่ม | แถว | ตรง | แก้แล้ว | หมายเหตุ |
|---|---:|---:|---:|---|
| 14 Library (LIB-001–120) | 120 | 118 | 2 | LIB-050 แก้ copy เป็น `Add posts to your saved first, then add them here.` (ตาม 11); LIB-049 เพิ่ม head ใน spec 11 |
| 15 Settings (SET-001–121) | 121 | 121 | 0 | copy help/blocked/muted/favorites ตรง 13; SET-121 ตรง DEC-10 |
| 16 Report/Block (TRS-001–067) | 67 | 67 | 0 | 9 เหตุผลตรง 15 (PM_REASONS); TRS-062/063 ตรง DEC-28; TRS-047/066 ตรง DEC-06; TRS-067 ตรง DEC-07 |
| 17 Guest gate (GATE-001–056) | 56 | 56 | 0 | GATE-024/025 expected อยู่ในคอลัมน์การแสดงผล (คอลัมน์การทำงานเป็น `—` ตามแบบ UI) ตรงกับ 00_GLOBAL §11 และ 01 |
| 18 E2E | 10 | 10 | 0 | ตรง DEC-12 และเส้นทางใน batch A/B |
| 19 Lang/theme (LANG-001–048) | 48 | 47 | 0 | LANG-005 ใช้ร่างไทยเป็นตัวอย่าง (DEC-29); LANG-045 (ไม่มี EN เหลือ) ขึ้นกับ prototype/build |

## ข้อที่ยังต้องทำ
1. LANG-045: ผ่านได้เมื่อ prototype/build แปลครบตาม DEC-19 (อยู่ในงาน prototype f2f1934f)
2. CSV เล่ม 14–19: sync แล้วเฉพาะ LIB-050; ที่เหลือไม่เปลี่ยน expected
