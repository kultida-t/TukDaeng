# AUTO-TEST-001 — Findings & Defect Register (แอป FO บน Store)

> Task: 531733e8 · Mission: 7189b3fd · เริ่มเก็บตั้งแต่ 2026-11-06
> เก็บบั๊ก/ข้อสงสัย/anomaly ที่เจอระหว่างเตรียมและรันเทสบนแอปจริง — เรียงตามวันที่พบ
> สถานะ: NEW = ยังไม่แจ้ง dev · REPORTED = แจ้ง Dev แก้วแล้ว · CONFIRMED/ WONTFIX / FIXED ตามผล

## F-001 — Sign in ทันทีหลังสมัครเสร็จโดนปฏิเสธ แต่ session active เองภายหลัง

| ฟิลด์ | รายละเอียด |
|---|---|
| สถานะ | REPORTED — ส่ง Dev แก้วทาง LINE แล้ว (2026-11-06) รอผล |
| พบเมื่อ | 2026-11-06 (Android, build จาก Play Store, account three3.work.test@gmail.com) |
| Severity | Medium — user สมัครเสร็จแล้ว sign in ไม่ได้ทันที อาจคิดว่ารหัสผิด |
| Steps | สมัครบัญชีใหม่ → OTP ผ่าน → profile → "สร้างบัญชีสำเร็จ" → กด เข้าสู่ระบบ → กรอก credential เดิมที่เพิ่งตั้ง → submit |
| Expected | เข้าสู่ระบบสำเร็จทันที |
| Actual | แจ้ง "อีเมลหรือรหัสผ่านไม่ถูกต้อง (1/5)" 2 ครั้งติด ทั้งที่ credential ตรง → session กลายเป็น active เองภายหลัง (ไม่ถึง ~10 นาที) เข้า Profile เห็น member ได้ |
| สาเหตุที่สงสัย | credential propagation delay/race ฝั่ง backend หลัง signup — หรือ verify OTP กับสร้าง credential ไม่ atomic |
| หมายเหตุเพิ่ม | counter แสดง "1/5" ซ้ำทั้ง 2 ครั้ง (คาดว่านับขึ้น หรือนับต่อการเปิดหน้า — ตรงกับคำตอบ dev ว่า lock ฝั่งแอปนับใหม่เมื่อเปิดหน้าใหม่) |
| Update 2026-11-06 (รอบ 2) | อาการเดิมเกิดซ้ำกับ flow C: credential `worktest1234` (user ยืนยันว่าเป็นรหัสที่ตั้งตอนสมัครจริง) โดนปฏิเสธรวม 7+ ครั้งข้าม 2 page instances (instance แรก counter ไต่ 1/5→3/5 แล้ว lock 15 นาทีที่ 5/5 — banner 'พยายามหลายครั้งเกินไป ลองใหม่ในอีก 15 นาที' หายเมื่อเปิดหน้าใหม่ตรงกับ dev answers 'นับใหม่เมื่อเปิดหน้าใหม่'; instance ใหม่ลองอีก 2 ครั้ง counter ค้างที่ 1/5 ไม่ขยับ — ตรงกับการสังเกต '1/5 ซ้ำ' ในรอบแรก) — ทุกครั้ง verify field ผ่าน dump ว่าค่าถูก |
| สาเหตุที่สงสัย (อัปเดต) | ไม่ใช่ delay ชั่วคราวแล้ว — rejection ค้างข้ามชั่วโมง+หลาย instance → น่าจะ credential record ของบัญชีนี้เขียนไม่สำเร็จ/เขียนผิดตอน signup (session ที่ active เองในรอบแรกน่าจะมาจาก token ฝั่ง signup flow ไม่ใช่ password path) → sign-in ด้วย password อาจไม่มีทางสำเร็จจนกว่า backend fix หรือ reset password ใหม่ |
| ทางออกที่เสนอ | (1) รายงาน Dev แก้วทาง LINE — bug backend: sign-in ปฏิเสธ credential ที่ถูก (2) unblock ตัวเองด้วย 'ลืมรหัสผ่าน' → reset link เข้า Gmail บัญชีเทส → ตั้งรหัสใหม่ (ทดสอบ credential write รอบสองด้วยในตัว) |
| RESOLVED 2026-11-06 | reset password เป็น `Worktest1234*` (ผ่าน policy) → sign-in สำเร็จทันทีรอบแรก (flow-c เขียว) → root cause เดิมที่คาด: signup รับรหัสไม่ผ่าน policy แต่ backend ไม่เก็บ credential — **ถูก dev แย้งแล้ว ดูบรรทัดถัดไป** |
| Dev reply 2026-11-06 | (deliverables/AUTO-TEST-001-reply-F001-F005.md) dev ตรวจโค้ดแล้ว: (1) `worktest1234` **ผ่าน policy** — กฎจริงคือ ≥8 ตัว + ตัวเลข/อักขระพิเศษ ≥1 ไม่บังคับตัวพิมพ์ใหญ่ (2) credential น่าจะถูกสร้างแล้ว เพราะ forgot-password reset สำเร็จ → สาเหตุที่ dev สงสัย: รหัสที่บันทึกตอนสมัครอาจไม่ใช่ `worktest1234` (automation พิมพ์เพี้ยน) — ตรวจย้อนไม่ได้เพราะ reset ทับแล้ว |
| ข้อมูลตอบ dev (จากฝั่งเรา) | automation พิมพ์รหัสผ่าน `inputText` ของ Maestro ลง EditText ที่จับด้วย hint text — ไม่ได้กดรูปตายืนยันก่อนสมัคร (ช่องว่างที่ dev เดาได้ถูก) — รอบ reset ใช้วิธีเดียวกันและผ่าน ดังนั้นโอกาสพิมพ์เพี้ยนรอบแรกมีอยู่จริงแต่ยังไม่ฟันธง |
| สถานะล่าสุด | PENDING-REVERIFY — dev ขอ manual re-test บนเครื่องจริง (ไม่ใช้ automation): สมัครอีเมลใหม่ + `worktest1234` + กดตาดูรหัสก่อนสมัคร → sign in/out → ส่งผล+เวลา+version+รุ่นเครื่องกลับ — ถ้า sign in ได้ = ปิด Bug 2 (ปัญหาอยู่ขั้นพิมพ์ของ automation); ถ้าไม่ได้ = bug จริง dev ตรวจ prod ต่อ |

## F-002 — tap "ถูกใจ" บน post card (guest) ครั้งแรกไม่เด้ง gate sheet

| ฟิลด์ | รายละเอียด |
|---|---|
| สถานะ | NEW — ยังไม่ยืนยัน (อาจเป็น tap พลาดของ automation) |
| พบเมื่อ | 2026-11-06 |
| Severity | Low — แท็บ nav ใช้เป็น gate trigger ได้ปกติ |
| Steps | guest บน feed → tap ถูกใจใต้โพสต์แรก (input tap ตาม bounds) |
| Expected | Member sheet เด้ง (ตาม AUTH-061) |
| Actual | ไม่มี sheet — feed นิ่ง; กดแท็บ แชท แทน gate เด้งปกติ |
| หมายเหตุเพิ่ม | ต้อง manual verify ก่อนฟันธงว่า bug — อาจเป็น hit area ของปุ่ม/จังหวะ tap ฝั่ง automation |

## F-005 — signup รับ password ที่ไม่ผ่าน policy โดยไม่เตือน (validation gap ฝั่ง form)

| ฟิลด์ | รายละเอียด |
|---|---|
| สถานะ | REPORTED — ส่ง Dev แก้วทาง LINE แล้ว (2026-11-06) รอผล |
| พบเมื่อ | 2026-11-06 (ย้อนจากการไขปม F-001) |
| Severity | Medium-High — user สมัครด้วยรหัสที่ "ผ่าน" แต่ sign-in ไม่ได้ตลอดกาล จนกว่าจะ reset เอง (กลายเป็น F-001) |
| Steps | signup → ใส่ password `worktest1234` (ไม่มีตัวพิมพ์ใหญ่ + ไม่มีอักขระพิเศษ ขาดตาม policy: ใหญ่+เล็ก+เลข+อักขระพิเศษ) → ผ่านทุกขั้นจนได้บัญชี + session |
| Expected | form ปฏิเสธตอนกรอก/submit พร้อมแจ้งเงื่อนไขรหัสผ่าน — ไม่ควรสร้างบัญชีถ้า credential ไม่ผ่าน policy |
| Actual | signup ผ่านเงียบ ๆ → credential record ไม่ถูกสร้าง (หรือถูกปฏิเสธฝั่ง server เงียบ ๆ) → sign-in ด้วยรหัสเดิมโดนปฏิเสธถาวร (F-001) — user มองไม่เห็นสาเหตุเลย |
| หมายเหตุเพิ่ม | verify แล้ว: reset เป็น `Worktest1234*` (ครบเงื่อนไข) → sign-in ผ่านทันที — ถ้า backend บังคับ policy ฝั่ง server อยู่แล้ว ควรส่ง error ชัดกลับมาให้ signup แสดง แทนปล่อยสำเร็จครึ่งเดียว |
| Dev reply 2026-11-06 | dev ยืนยัน Bug 1: ฟอร์มสมัครตรวจกฎตัวเลข/อักขระพิเศษแล้วในโค้ดล่าสุด (รอเวอร์ชันใหม่บน Store) — **แต่แย้ง premise ของเรา: `worktest1234` ผ่าน policy ตั้งแต่แรก** (กฎ = ≥8 + เลข/อักขระ ≥1 ไม่บังคับพิมพ์ใหญ่) → root cause ของ F-001 เปลี่ยนเป็น "รหัสที่บันทึกอาจพิมพ์เพี้ยน" ไม่ใช่ "รหัสถูกปฏิเสธฝั่ง server" |
| สถานะล่าสุด | PARTIAL-FIXED — validation ฝั่งฟอร์มถูกแก้ใน build ถัดไปแล้ว (รอ Store อัปเดต verify ซ้ำ); ส่วนสาเหตุ F-001 รอ manual re-verify ตามที่ dev ขอ |
| Counter-evidence 2026-11-06 | **ข้อขัดแย้งกับคำตอบ dev:** reset form บน build ปัจจุบันไม่ยอมรับ `worktest1234` — ต้อง `Worktest1234*` (เล็ก+ใหญ่+เลข+อักขระ) ถึงผ่าน → reset form เข้มกว่า signup/backend |
| Verified 2026-11-06 | manual test: signup `tukdaengworktest@gmail.com` + `worktest1234` → OTP → sign in สำเร็จ → **canonical rule = ≥8 + เลข/อักขระ ตรง spec/prototype** (เช็ก `fo-flow/index.html` :24397 signup + :22108 change_pwd — regex เดียวกัน `!(digit‖special)`); dev ยืนยันยึด prototype เป็น source of truth → **ตัวผิด = reset form (ลิงก์อีเมล) ที่บังคับเข้มกว่า prototype** — เสนอแก้: ผ่อน reset validator ให้ตรง canonical; spec เพิ่มบันทึกครอบ reset แล้ว (FO-TEST-001-01-auth.md) |

## F-003 — bottom nav hitbox ล้ำขึ้นไปทับแถว "แตะเพื่อดูรายละเอียด" — กดแล้วไปกระดานข่าวแทน

| ฟิลด์ | รายละเอียด |
|---|---|
| สถานะ | NEW — ยังไม่ manual verify บนเครื่องจริง (อาจจำเพาะ emulator) |
| พบเมื่อ | 2026-11-06 (emulator API 34 + Maestro run) |
| Severity | Low-Medium — แถวเปิด spec กดไม่ได้เมื่ออยู่ชิดขอบล่างจอ ผู้ใช้ต้องเลื่อนก่อน |
| Steps | feed (member) → แตะ "เพิ่มเติม" ใน caption → แถว "แตะเพื่อดูรายละเอียด" โผล่ตำแหน่ง ~y2276-2337 (ชิดขอบล่าง) → แตะกลางแถว (540,2306) |
| Expected | spec box เปิดในการ์ด (FEED-021) |
| Actual | แอปเปลี่ยนไปแท็บ กระดานข่าว แทน — hit area ของ bottom nav (bounds เริ่ม y2337) ดูเหมือนกินจุดสูงกว่าขอบจริง ~30px — เกิดซ้ำทั้ง manual tap และ Maestro run |
| หมายเหตุเพิ่ม | workaround ใน flow: scrollUntilVisible + centerElement ให้แถวอยู่กลางจอแล้วค่อย tap — ถ้าเครื่องจริงเป็นเหมือนกันถือเป็น UX bug (ปุ่มกดยาก) |

## F-004 — ปุ่ม bottom nav ไม่ตอบ accessibility click (TalkBack/automation กดไม่ได้)

| ฟิลด์ | รายละเอียด |
|---|---|
| สถานะ | NEW — พฤติกรรมยืนยันได้จาก automation แต่ยังไม่เทส TalkBack จริง |
| พบเมื่อ | 2026-11-06 (Maestro 2.12.1 บน emulator) |
| Severity | Medium — ผู้ใช้ screen reader สลับแท็บ nav ไม่ได้ถ้า a11y click ไม่ทำงานจริง |
| Steps | Maestro `tapOn` บน semantics node "แชท" (clickable=true, bounds [248,2183][443,2307], center 345,2245) → ไม่มีอะไรเกิด; `adb shell input tap` พิกัดเดียวกัน → gate sheet เด้งปกติ; Maestro point tap (32%,93%) → เด้ง |
| Expected | element ที่ clickable=true ควรทำ action เมื่อถูก accessibility click |
| Actual | nav item ไม่ตอบ a11y click — น่าจะเป็น GestureDetector ที่ไม่มี Semantics(onTap) — element อื่น (feed tabs, ปุ่ม onboarding, เพิ่มเติม/แตะเพื่อดูรายละเอียด) ตอบ a11y click ปกติ |
| หมายเหตุเพิ่ม | workaround: tapOn point ใน flow; แนะนำใส่ใน element-request รอบถัดไป (Semantics บน nav item หรือ identifier) — impact ทั้ง automation และ accessibility |

## ข้อสังเกตที่ไม่ใช่บั๊ก (documented behavior — มีผลต่อการเขียน flow)

- **Coach-mark tour กิน tap แรก** — bubble ทัวร์ (guest/member variant) เป็น canvas overlay ที่ดัก tap แรกทั้งจอ (SHELL-059 dismiss-on-tap) — flow ต้อง tap ทิ้ง 1 ครั้งหลังเข้า feed ครั้งแรกก่อนทำอย่างอื่น
- **Member sheet ดึง feed ออกจาก a11y tree** — ขณะ sheet เปิดอยู่ uiautomator/semantics tree เห็นเฉพาะ element ของ sheet (feed หายทั้งต้น) — assert "ยังอยู่ feed" ทำได้แค่ทางอ้อม (เช็ก tab กลับมาหลัง dismiss)
- **Re-prompt sheet เด้งทุก relaunch** — ตาม GATE-034: first-run sheet ที่ไม่ได้ติ๊ก "ไม่ต้องแสดงข้อความนี้อีก" จะเด้งใหม่ทุกครั้งที่ launchApp — flow ที่ assume feed หลัง launch ต้อง dismiss ก่อน

## วิธีใช้ไฟล์นี้

- เจออะไรระหว่างเทส/probe → เพิ่มรายการตาม template เดียวกัน
- เมื่อจะแจ้ง dev → ก๊อปตารางของ F-xxx ส่งทาง LINE แล้วเปลี่ยนสถานะเป็น REPORTED
- เชื่อมกับ TC: ถ้า finding ทำให้ TC fail ให้ note TC ID ไว้ในตารางด้วย

## F-006 — Own profile ของบัญชีใหม่โหลดค้าง (spinner ไม่จบ)

| ฟิลด์ | รายละเอียด |
|---|---|
| สถานะ | CONFIRMED — เปิดซ้ำยังหมุนค้าง (user verify 2026-11-06 ~15:50) รอรายงาน dev |
| พบเมื่อ | 2026-11-06 ~15:40 (emulator tukdaeng_api34, Store build, พิมพ์มือไม่ใช้ automation) |
| Severity | Medium — member ใหม่เปิดโปรไฟล์ตัวเองไม่ได้ (กริดค้าง spinner) |
| Steps | signup `tukdaengworktest@gmail.com` + `worktest1234` → OTP → profile → sign in สำเร็จ → แตะแท็บ โปรไฟล์ |
| Expected | own profile โหลดเสร็จ เห็นกริดว่าง/empty state |
| Actual | head/avatar/stats (0/0/0) + แท็บ โหลดมาแล้ว แต่พื้นที่กริดเป็น spinner แดงหมุนค้างไม่จบ |

## สรุปผล manual re-verify F-001/F-005 (2026-11-06)

- **F-001 → CLOSED (root cause = input รอบแรก):** manual signup `tukdaengworktest@gmail.com` + `worktest1234` บน emulator พิมพ์มือ → OTP → profile → **sign in สำเร็จทันที** → credential ถูกสร้างปกติ สอดคล้องสมมติฐาน dev (รหัสที่บันทึกรอบแรกไม่ใช่ worktest1234 — automation พิมพ์เพี้ยน) — บัญชีเดิม three3.work.test ใช้ Worktest1234* ต่อได้ปกติ
- **F-005 → แก้คำอธิบาย:** spec (FO-TC-AUTH-029/077) = `≥8 + เลข/อักขระ ≥1` — signup ตรง spec (รับ worktest1234) แต่ **reset form บังคับเล็ก+ใหญ่+เลข+อักขระ เข้มกว่า spec → บั๊กจริงที่เหลือคือ reset form deviate จาก spec** (ไม่ใช่ signup ที่หละ validation) — แนะนำ dev: ปรับ reset validator ให้ตรง spec หรือเปลี่ยน spec เป็นชุดเดียวกัน

## F-007 — back จากหน้า Sign up/Sign in กลับ feed ไม่ใช่ Member Sheet (GATE-031)

| ฟิลด์ | รายละเอียด |
|---|---|
| สถานะ | NEW — ยืนยันด้วย automation + screenshot |
| พบเมื่อ | 2026-11-06 (flow-d-guest-gate-deep, emulator API 34, Store build) |
| Severity | Low — ผู้ใช้กด back ออกจาก auth page หลุดไป feed แทนที่จะกลับมาตัดสินใจบน sheet อีกครั้ง |
| Steps | guest → แตะแท็บ แชท → Member Sheet → แตะ สมัครสมาชิก (เข้าหน้า Create account) → กด device back — ทำซ้ำกับ เข้าสู่ระบบ → Sign in page → back |
| Expected | back กลับ Member Sheet (GATE-031: "back กลับ Member Sheet ไม่ใช่ feed") |
| Actual | back ทั้งสองจุดกลับ guest feed ตรง ๆ — sheet ถูก pop ไปพร้อมกัน ไม่มี gate ค้าง (session ไม่ถูกสร้าง ผิดเฉพาะปลายทาง back) |
| หมายเหตุเพิ่ม | flow-d assert พฤติกรรมจริงไว้ — ถ้า dev แก้ให้ตรง spec flow จะแดงเป็น signal |
| QA recommendation | **บั๊ก — dev แก้ตาม spec:** spec สมเหตุสมผล (sheet = จุดตัดสินใจ user ยังไม่เลือก back ต้องเจอทางเลือกเดิม) ไม่มีเหตุผลให้เบี่ยง |

## F-008 — feed tabs กำลังติดตาม/รายการโปรด gate guest (spec ว่า free browse)

| ฟิลด์ | รายละเอียด |
|---|---|
| สถานะ | NEW — ยืนยันด้วย automation + screenshot (sheet เด้งเหนือ feed ชัดเจน) |
| พบเมื่อ | 2026-11-06 (flow-d-guest-gate-deep) |
| Severity | Low-Medium — guest อ่าน empty state ของ Following/Favorites ไม่ได้ ขัด spec free-browse |
| Steps | guest บน feed แท็บ ทั้งหมด → แตะ กำลังติดตาม → Member Sheet เด้ง → dismiss → แตะ รายการโปรด → เด้งอีก |
| Expected | สลับได้ทุกแท็บไม่มี sheet — Following/Favorites แสดง empty เพราะไม่มีความสัมพันธ์ (GATE-042) |
| Actual | ทั้งสองแท็บ → Member Sheet ทันที แท็บ ทั้งหมด เท่านั้นที่ free |
| หมายเหตุเพิ่ม | เข้าใจได้ในเชิงออกแบบ (Following ไม่มีความหมายกับ guest) แต่เบี่ยงจาก spec — ให้ dev/PO ตัดสินว่าจะแก้แอปหรือแก้ spec |
| QA recommendation | **เสนอปรับ spec = gated entry:** spec ตั้งใจเขียนแต่ไม่ consistent กับ gate model เดียวกัน (chat/alerts/profile ที่ผูก relationship gate หมด) — empty state Following/Favorites ไม่มีคุณค่าจริงสำหรับ guest แอปทำตาม pattern ตัวเองสม่ำเสมออยู่แล้ว |

## F-009 — ติ๊ก Don't-show แล้ว action gate เปลี่ยนเป็นหน้า Sign in เต็มจอ (ไม่ใช่ sheet)

| ฟิลด์ | รายละเอียด |
|---|---|
| สถานะ | NEW — ยืนยันด้วย automation + hierarchy dump |
| พบเมื่อ | 2026-11-06 (flow-d-guest-gate-deep, GATE-033 tail) |
| Severity | Low — gate ยังบล็อก action ได้ปกติ ต่างแค่รูปแบบ prompt |
| Steps | first-run sheet → ติ๊ก ไม่ต้องแสดงข้อความนี้อีก → ข้ามไปก่อน (relaunch เงียบถูกต้องตาม GATE-033) → แตะแท็บ แชท |
| Expected | Member Sheet เด้งจาก action ตามปกติ (GATE-033: "gate จาก action ยังเด้ง") |
| Actual | เปลี่ยนเป็นหน้า Sign in เต็มจอ (ยินดีต้อนรับกลับสู่ตึกแดง + ฟอร์มอีเมล/รหัสผ่าน + Google) แทน bottom sheet — เข้าท่าในเชิง UX (user บอกแล้วว่าไม่อยากเห็น sheet) แต่ deviate จาก spec literal |
| หมายเหตุเพิ่ม | flow-d assert แบบ tolerant (`เข้าร่วมตึกแดง‖ยินดีต้อนรับกลับ‖Welcome back`) — ขอ dev confirm ว่า by design; ถ้าใช่ spec 17 ควรอัปเดตคำว่า gate ให้ครอบ page variant |
| QA recommendation | **เสนอปรับ spec ชัด ๆ:** spec เป็นฝั่งไม่สมเหตุสมผล — user ติ๊ก opt-out แล้ว spec จะให้ sheet เดิมเด้งทับ ขัดเจตนา user; แอปเปิดหน้า sign-in เต็มจอ = ให้เกียรติ opt-out และยังบล็อก action เหมือนเดิม → action gate = sheet หรือ page ก็ได้ |

## F-010 — bookmark shortcut บน search head gate guest (spec ว่าเปิด Saved hub ว่าง)

| ฟิลด์ | รายละเอียด |
|---|---|
| สถานะ | NEW — ยืนยันด้วย automation + screenshot (ไอคอน bookmark ชัด + sheet เด้ง) |
| พบเมื่อ | 2026-11-06 (flow-e-search-guest) |
| Severity | Low — guest เปิดหน้า Saved ว่างไม่ได้ ขัด spec; เข้าใจได้ในเชิงออกแบบ (saved ผูกบัญชี) |
| Steps | guest → search landing → แตะไอคอน bookmark มุมขวาบนของ search head |
| Expected | เปิด Saved hub empty "Nothing saved yet" โดยไม่มี sheet (GATE-015: "sr-saved ไม่ gate") |
| Actual | Member Sheet เด้งทันที (body variant "เข้าสู่ระบบหรือสมัครสมาชิกฟรีเพื่อใช้ฟีเจอร์นี้") |
| หมายเหตุเพิ่ม | ให้ dev/PO ตัดสินแก้แอปหรือแก้ spec — ถ้า by design ให้ spec 17 ปรับ GATE-015 |
| QA recommendation | **เสนอ ruling 2 ทาง — หนูเอนปรับ spec = gate:** (ก) ตาม spec = dev เปิด saved hub ว่างให้ guest (ข) ปรับ spec = gate เหมือน feature ผูกบัญชีอื่น — saved คือข้อมูลผูกบัญชี หน้าว่างตลอดสำหรับ guest เป็น dead-end |

## F-011 — sign out แล้ว gate sheet ไม่เด้งทันที (spec ว่าเด้งหลัง logout)

| ฟิลด์ | รายละเอียด |
|---|---|
| สถานะ | NEW — ยืนยันด้วย automation + manual probe |
| พบเมื่อ | 2026-11-06 (flow-f-member-signout + manual adb verify) |
| Severity | Low — guest browse ต่อได้ปกติ gate ทำงานเมื่อแตะ action |
| Steps | member → profile → burger → ออกจากระบบ → ยืนยัน → จบบน feed → รอ ~4 วิ สังเกต |
| Expected | feed guest + Member Sheet เด้งทันที + toast "Logged out" (GATE-035 / spec 01 §8) |
| Actual | กลับ guest feed เงียบ ๆ ไม่มี sheet auto-pop (guest ยืนยันแล้ว — แตะแท็บแชทเจอ sheet ปกติ) · toast ไม่อยู่ใน a11y tree verify ไม่ได้ |
| หมายเหตุเพิ่ม | re-prompt เด้งเฉพาะตอน launchApp (GATE-034) — logout transition ไม่ trigger; ให้ dev confirm by design หรือ bug |
| QA recommendation | **บั๊ก — dev แก้ตาม spec:** re-prompt หลัง logout คือจุด re-engage ตั้งใจไว้ชัด (01 §8) แอปทำครึ่งเดียว — เด้งตอน launch แต่ไม่เด้งตอน logout transition |

## ข้อเท็จจริง selector เพิ่ม (จาก flow-d run)

- **Member sheet เป็น modal จริง** — tap โซน nav ขณะ sheet เปิดโดนปุ่มบน sheet แทน: พิกัด 68%,93% ตรงปุ่ม Google (เปิด OS provider UI ได้) — ห้ามใช้พิกัด nav ซ้ำตอน sheet เปิด จะลั่นเข้า social sign-in
- **Google SSO provider UI เปิดจาก sheet ได้** — emulator มี Google account (Kultida Tangtrakulsang) → "Choose an account" เด้ง → device back ยกเลิกกลับ feed/sheet ไม่มี session (ครอบ GATE-032 cancel leg บางส่วน)
- **Sign-up page assert text** — หน้า create account จับได้ด้วย `สร้างบัญชี` (หรือ `ยืนยันอีเมล`)
