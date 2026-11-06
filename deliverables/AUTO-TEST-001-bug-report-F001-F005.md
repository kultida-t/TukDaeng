# Bug report → Dev แก้ว (LINE) — 2026-11-06

> สำเนาข้อความที่ส่งทาง LINE รายงานบั๊กจากงาน AUTO-TEST-001
> รายละเอียดเต็ม: `AUTO-TEST-001-findings.md` F-001 + F-005

---

แจ้ง bug 2 ตัวที่เจอระหว่างทำ automation test บนแอป prod (build จาก Play Store ล่าสุด) — เชื่อมกันเป็น root cause เดียว

**[Bug 1] Signup รับ password ที่ไม่ผ่าน policy โดยไม่เตือน**
**[Bug 2] บัญชีที่สมัครด้วยรหัสดังกล่าว sign-in ไม่ได้ถาวร** (credential record ไม่ถูกสร้าง)

Repro (ทำซ้ำได้ 100%):
1. สมัครบัญชีใหม่ด้วยอีเมล + password `worktest1234` — ไม่ผ่าน policy (ไม่มีตัวพิมพ์ใหญ่ + ไม่มีอักขระพิเศษ)
2. signup ผ่านทุกขั้นปกติ → ได้บัญชี + session member ใช้งานได้ทันที
3. sign out → sign in ด้วย credential เดิม → โดน "อีเมลหรือรหัสผ่านไม่ถูกต้อง" ทุกครั้ง (ลอง 7+ ครั้ง ข้ามหลายชั่วโมงและหลาย page instance — verify แล้วว่า field มีค่าถูกต้อง)
4. ผ่าน forgot-password → ตั้งรหัสใหม่ `Worktest1234*` (ผ่าน policy) → sign-in สำเร็จทันทีรอบแรก

ผลกระทบผู้ใช้จริง: ใครตั้งรหัสที่ไม่ผ่าน policy จะ sign-in ไม่ได้ถาวรโดยไม่เห็นสาเหตุ หนีรอดได้แค่ forgot-password

เดาสาเหตุ: backend บังคับ policy ฝั่ง server อยู่แล้ว แต่ signup สำเร็จครึ่งเดียว — account ถูกสร้าง ส่วน credential write fail เงียบ ๆ → ขอ (a) validate password policy ที่ form signup และ (b) ถ้า credential write fail ให้ signup แจ้ง error ชัด อย่าปล่อยบัญชีสำเร็จครึ่งเดียว

บัญชีเทสที่เจอเคสนี้: three3.work.test@gmail.com (ตอนนี้ reset แล้วใช้ได้ปกติ)

*สังเกตเพิ่มเติมที่กำลัง verify ก่อนแจ้ง (ยังไม่ยืนยัน): ปุ่ม bottom nav ไม่ตอบ accessibility click (TalkBack อาจสลับแท็บไม่ได้) — ส่งตามหลังถ้า verify บนเครื่องจริงแล้วเป็นจริง*
