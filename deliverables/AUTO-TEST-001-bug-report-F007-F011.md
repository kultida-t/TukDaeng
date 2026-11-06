# Bug list → Dev แก้ว (LINE) — 2026-11-06 (รอบ 2)

> ลิสบั๊กจากงาน AUTO-TEST-001 — เทียบ spec FO-TEST-001-17 guest-gate
> พบจาก automate test (Maestro) บน Android emulator API 34, build จาก Play Store
> รายละเอียดเต็ม + QA reasoning: `AUTO-TEST-001-findings.md` F-007..F-011

## บั๊กที่ต้องแก้ (2 ตัว)

### F-007 — back จากหน้า Sign up / Sign in กลับ feed ไม่ใช่ Member Sheet

- **Steps:** guest → แตะแท็บ แชท → Member Sheet เด้ง → แตะ "สมัครสมาชิก" เข้าหน้า create account → กด device back · เช็คซ้ำทาง "เข้าสู่ระบบ" → Sign in page → back ผลเหมือนกัน
- **Expected (GATE-031):** back กลับ Member Sheet — user ที่ยังไม่ตัดสินใจต้องเจอทางเลือกเดิม (สมัคร/ล็อกอิน/ข้าม/social)
- **Actual:** back กลับ guest feed ตรง ๆ ทั้ง 2 จุด — sheet ถูก pop ไปพร้อมกัน ต้องกด trigger ใหม่ถ้าจะเปิดอีก
- **หมายเหตุ:** ไม่มี session ถูกสร้าง ผิดเฉพาะปลายทาง back · Severity: Low-Med

### F-011 — sign out แล้ว Member Sheet ไม่เด้งทันที

- **Steps:** member → profile tab → burger menu → ออกจากระบบ → ยืนยัน dialog → จบบน feed → รอ ~4 วิ สังเกต
- **Expected (GATE-035 / spec 01 §8):** เข้า feed เป็น guest + Member Sheet เด้งทันที (+ toast "Logged out")
- **Actual:** กลับ guest feed เงียบ ๆ ไม่มี sheet auto-pop — guest ถูกต้อง (แตะแท็บแชทเจอ sheet ปกติ) ขาดแค่ immediate prompt
- **หมายเหตุ:** re-prompt เด้งตอน launchApp ปกติ (GATE-034) — เฉพาะ logout transition ที่ไม่ trigger · Severity: Low-Med

## FYI — ฝั่ง QA ปรับ spec/test case เอง ไม่ต้องแก้แอป (3 ตัว)

- **F-008:** แท็บ Following/Favorites gate guest — app ทำตาม gate model consistent (relationship surfaces gate หมด) → spec จะนับเป็น gated entry
- **F-009:** ติ๊ก Don't-show แล้ว action gate = หน้า sign-in เต็มจอ (ไม่ใช่ sheet) — app ให้เกียรติ opt-out ของ user ถูกแล้ว → spec จะ accept ทั้ง sheet/page variant
- **F-010:** bookmark shortcut บน search head gate guest — saved ผูกบัญชี หน้าว่างไม่มีคุณค่า → spec จะนับเป็น gated entry *(ถ้า PO เห็นต่างจะกลับมาคุย)*

## สรุป

- ต้องแก้แอป: **F-007, F-011** (ทั้งคู่เจอระหว่าง guest-gate automation run)
- ไม่ต้องแก้: F-008/F-009/F-010 — QA ปรับ spec ฝั่งเอกสารเองตาม ruling ที่อนุมัติแล้ว
- งานก่อนหน้าที่ค้างอยู่: F-005 (reset validator เข้มกว่า spec), F-006 (own profile spinner บัญชีใหม่) — รอผลตรวจ/แก้เหมือนเดิม
