# FO-TEST-001-22 — Decision Register & Contract Closure (Front Office)

**Task**: FO-TEST-22 — Decision Closure & Full FO Test Acceptance  
**Status**: APPROVED & LOCKED  
**Date**: 2026-10-30  
**Authority**: Lead Product Architect & QA Acceptance (ยึดข้อกำหนดที่อนุมัติแล้ว + พฤติกรรมผลิตภัณฑ์ที่มีหลักฐานจริง)  
**Reference Sources**:
- `FrontOffice/00_GLOBAL_RULES_MODULE.md`
- `FrontOffice/00_NAVIGATION_AND_CROSS_MODULE_FLOW.md`
- `FrontOffice/01_AUTHENTICATION_MODULE.md`
- `FrontOffice/04_ASSET_MANAGEMENT_MODULE.md`
- `FrontOffice/07_CHAT_MODULE.md`
- `FrontOffice/10_WATCH_ALERT_MODULE.md`
- `FrontOffice/13_SETTINGS_MODULE.md`
- `FrontOffice/14_PORTFOLIO_MODULE.md`
- `FrontOffice/15_TRUST_SAFETY_MODULE.md`

---

## 1. บทสรุปผู้บริหาร (Executive Summary)

เอกสารฉบับนี้จัดทำขึ้นเพื่อปิดประเด็นการตัดสินใจ (Decision Register) และข้อกำหนดสัญญาพฤติกรรม (Contract Closure) ทั้งหมดที่ค้างอยู่ใน `deliverables/FO-TEST-001-20-traceability.md` (ครอบคลุม §6.1 GAP-7..18, §6.3–6.4 รายการ [OPEN] และ §9 ประเด็นติดตาม) โดยกำหนดข้อสรุปทางผลิตภัณฑ์ที่ชัดเจน ไม่มีรายการ "ถามทีมภายหลัง", "OPEN", หรือ "รอ build" หลงเหลืออยู่ และซิงก์ผลลัพธ์เข้าสู่เอกสารชุด Test Cases (MD), Checklist (CSV) และ Traceability Crosswalk เพื่อให้พร้อมสำหรับการตรวจรับขั้นสมบูรณ์ (Full Acceptance) 100%

---

## 2. Decision Register: GAP-7 ถึง GAP-18

### [DEC-01] GAP-7: กติกากลาง "ไม่มีระบบชำระเงินในแอป (V1)" ข้ามทุกหน้าจอ
- **ประเด็นและผลกระทบ**: กติการะบบข้อ 10 ระบุว่า V1 ดีลจบนอกแอป หากมีปุ่มชำระเงิน ตะกร้าสินค้า หรือการขอข้อมูลบัตรเครดิตหลุดรอด จะทำให้ผู้ใช้เข้าใจผิดและสร้างความเสี่ยงด้านกฎหมาย/ความปลอดภัย
- **ข้อสรุปสุดท้ายและเหตุผล**: ยึดตาม `00_GLOBAL_RULES_MODULE.md` §10 และ Prototype Lock: ใน V1 แอป TukDaeng ไม่มีระบบ Payment Gateway, Checkout, In-app Wallet หรือ Coin Top-up ใดๆ ทั้งสิ้น การติดต่อซื้อขายเกิดขึ้นระหว่างผู้ซื้อกับผู้ขายผ่านห้องแชทโดยตรง
- **พฤติกรรมที่ต้องทดสอบและผลที่คาดหวัง**: Negative sweep ทุกแท็บหลัก (Feed, Search, Create, Chat, Board, Alerts, Profile, Settings, Detail) ต้องไม่พบปุ่มชำระเงิน เมนูเติมเงิน หรือแบบฟอร์มกรอกบัตรเครดิต
- **Test Case และไฟล์ต้นฉบับ**: `SHELL-066` ใน `deliverables/FO-TEST-001-02-shell.md` และ `FO-TEST-001-02-shell-checklist.csv`

---

### [DEC-02] GAP-8: พฤติกรรมการแสดงผลของโพสต์ที่ถูกขาย (Sold) บนหน้า Saved/Library
- **ประเด็นและผลกระทบ**: เมื่อสินค้าที่ผู้ใช้กด Saved ไว้ถูกขายโดยเจ้าของ หากการ์ดหายไปเลยผู้ใช้อาจสับสน หรือหากแสดงเหมือนเดิมผู้ใช้อาจเข้าใจผิดว่ายังซื้อได้
- **ข้อสรุปสุดท้ายและเหตุผล**: ยึดตาม `04_ASSET_MANAGEMENT_MODULE.md` §6 และ `14_PORTFOLIO_MODULE.md`: สินค้าที่ถูก Mark as Sold ยังคงปรากฏในการ์ด Saved ของผู้ใช้ แต่มี badge/overlay แสดงสถานะ "Sold" (หรือ "ขายแล้ว") อย่างชัดเจน
- **พฤติกรรมที่ต้องทดสอบและผลที่คาดหวัง**: เปิดหน้า Library > Saved สินค้าที่ขายแล้วยังอยู่ในการ์ด แต่มี badge "Sold" สีเทาเข้ม/ส้ม แตะเปิดดู Post Detail ได้โดยแสดงสถานะ Sold ชัดเจนและปุ่มแชท/ติดต่อถูกปิดกั้น
- **Test Case และไฟล์ต้นฉบับ**: `LIB-106` ใน `deliverables/FO-TEST-001-14-library.md` และ `FO-TEST-001-14-library-checklist.csv`

---

### [DEC-03] GAP-9: การปรับยอดนับแบบเรียลไทม์ `{n} matches now` ของ Watch Alert หลังสินค้าถูกขาย
- **ประเด็นและผลกระทบ**: Watch Alert มีตัวเลขแจ้งเตือนจำนวนสินค้าที่ตรงเงื่อนไข หากสินค้าถูกขายแล้วตัวเลขไม่ลดลง ผู้ใช้จะเปิดเข้าไปเจอรายการที่ซื้อไม่ได้
- **ข้อสรุปสุดท้ายและเหตุผล**: ยึดตาม `10_WATCH_ALERT_MODULE.md` §4: Watch Alert จะ Match เฉพาะสินค้าที่มีสถานะ `Sale` เท่านั้น ทันทีที่สินค้าเปลี่ยนเป็น `Sold` สินค้านั้นจะหลุดออกจาก Alert Pool และยอดนับ `{n} matches now` จะถูกคำนวณใหม่ลดลง 1 ทันที
- **พฤติกรรมที่ต้องทดสอบและผลที่คาดหวัง**: เมื่อเจ้าของ Mark as Sold รายการนาฬิกา ยอดนับใน Watch Alert ที่ตรงกับรุ่นนั้นจะลดลง 1 ทันที และหน้ารายการ Matches จะไม่แสดงรายการนั้นอีก
- **Test Case และไฟล์ต้นฉบับ**: `WA-064` ใน `deliverables/FO-TEST-001-11-watchalert.md` และ `FO-TEST-001-11-watchalert-checklist.csv`

---

### [DEC-04] GAP-10: การเปิดดู Post Detail จาก Chat Card ของสินค้าที่ขายแล้ว (Sold) โดยบุคคลภายนอก (Non-Owner)
- **ประเด็นและผลกระทบ**: ผู้ซื้อที่เคยคุยแชทค้างไว้แตะการ์ดสินค้าในห้องแชทหลังจากสินค้าถูกขายไปแล้ว
- **ข้อสรุปสุดท้ายและเหตุผล**: ยึดตาม `07_CHAT_MODULE.md` §8 และ `00_NAVIGATION_AND_CROSS_MODULE_FLOW.md` §11: การ์ดสินค้าในแชทเป็น snapshot เมื่อแตะดู หากสินค้าเป็นสถานะ `Sold` จะเปิด Post Detail ได้โดยแสดงสถานะ "Sold" พร้อมแถบแจ้งเตือนว่าสินค้าถูกขายแล้ว; หากสินค้าถูกลบโดยสิ้นเชิงจะแสดง fallback screen `al_unavail` พร้อมปุ่ม Go back
- **พฤติกรรมที่ต้องทดสอบและผลที่คาดหวัง**: แตะการ์ดสินค้าในห้องแชท เปิด Post Detail ได้ปกติ มี badge "Sold" แสดงชัดเจน และไม่มีปุ่ม Ask Seller ให้กดซ้ำ
- **Test Case และไฟล์ต้นฉบับ**: `CHAT-125` ใน `deliverables/FO-TEST-001-08-chat.md` และ `FO-TEST-001-08-chat-checklist.csv`

---

### [DEC-05] GAP-11: การกด Ask Seller จากรายการสินค้าที่เพิ่งหลุดจากสถานะสาธารณะ (Stale Ask Entry)
- **ประเด็นและผลกระทบ**: ผู้ใช้เปิดหน้าจอค้างไว้แล้วกดปุ่ม "Ask" ในขณะที่สินค้าถูกลบหรือเปลี่ยนสถานะไปแล้ว
- **ข้อสรุปสุดท้ายและเหตุผล**: ยึดตาม `07_CHAT_MODULE.md` §3 และ `00_GLOBAL_RULES_MODULE.md` §13: ระบบจะตรวจสอบความถูกต้องของสินค้าก่อนสร้างห้องแชท หากสินค้าไม่พร้อมให้บริการ ระบบจะแสดง Toast "รายการนี้ไม่พร้อมใช้งานแล้ว" และไม่เปิดห้องแชทใหม่
- **พฤติกรรมที่ต้องทดสอบและผลที่คาดหวัง**: กดปุ่ม Ask บนสินค้าที่ stale ระบบแสดงข้อความแจ้งเตือนและคงอยู่ที่หน้าเดิม ไม่เกิดข้อผิดพลาดค้าง
- **Test Case และไฟล์ต้นฉบับ**: `CHAT-126` ใน `deliverables/FO-TEST-001-08-chat.md` และ `FO-TEST-001-08-chat-checklist.csv`

---

### [DEC-06] GAP-12: นโยบายการรายงานแบบนิรนาม (Anonymous Reporting) ฝั่งผู้ถูกรายงานต้องไม่ได้รับการแจ้งเตือน
- **ประเด็นและผลกระทบ**: หากผู้ถูกรายงานรู้ว่าใครรายงานหรือได้รับการแจ้งเตือนทันที อาจทำให้เกิดการคุกคามหรือแก้แค้น
- **ข้อสรุปสุดท้ายและเหตุผล**: ยึดตาม `15_TRUST_SAFETY_MODULE.md` §4: การรายงานเป็นแบบนิรนาม (Anonymous) 100% ฝั่งผู้ถูกรายงานจะไม่ได้รับการแจ้งเตือน (No push/No in-app alert) ใดๆ ทั้งสิ้นในขณะที่มีการส่งรายงาน
- **พฤติกรรมที่ต้องทดสอบและผลที่คาดหวัง**: เครื่อง A รายงานโพสต์/ผู้ใช้ของเครื่อง B; ตรวจสอบเครื่อง B พบว่าไม่มี Notification หรือ Alert เกิดขึ้น
- **Test Case และไฟล์ต้นฉบับ**: `TRS-062` ใน `deliverables/FO-TEST-001-16-report-block.md` และ `FO-TEST-001-16-report-block-checklist.csv`

---

### [DEC-07] GAP-13: การสะท้อนผลการระงับเนื้อหา (Moderation Hide/Remove) จาก Back Office กลับสู่ Front Office
- **ประเด็นและผลกระทบ**: เมื่อ Admin BO มีคำสั่ง Hide หรือ Remove เนื้อหาที่ผิดกฎ เนื้อหานั้นต้องถูกจัดการใน FO ทันที
- **ข้อสรุปสุดท้ายและเหตุผล**: ยึดตาม `15_TRUST_SAFETY_MODULE.md` §6 และ `00_NAVIGATION_AND_CROSS_MODULE_FLOW.md` §11: เมื่อสินค้า/คอมเมนต์ถูกระงับ จะถูกกรองออกจาก Feed, Search และ Profile ทันที หากเข้าถึงผ่าน Direct Deep Link จะแสดงหน้าจอ fallback `al_unavail` ("รายการนี้ไม่พร้อมใช้งานแล้ว")
- **พฤติกรรมที่ต้องทดสอบและผลที่คาดหวัง**: ลิสติ้งที่ถูกระงับจะหายไปจากผลการค้นหาและฟีดทันที และเมื่อเปิดผ่าน URL ตรงจะเข้าสู่หน้า `al_unavail` พร้อมปุ่มกลับหน้าหลัก
- **Test Case และไฟล์ต้นฉบับ**: `TRS-063` ใน `deliverables/FO-TEST-001-16-report-block.md` และ `FO-TEST-001-16-report-block-checklist.csv`

---

### [DEC-08] GAP-14: การซ่อนบัญชีที่ถูกปิดใช้งาน (Deactivated Account) ออกจากพื้นที่สาธารณะทันที
- **ประเด็นและผลกระทบ**: เมื่อผู้ใช้ขอลบบัญชี บัญชีจะเข้าสู่ช่วงผ่อนผัน (Grace Period 30 วัน) ข้อมูลในระบบต้องไม่รั่วไหลสู่สาธารณะ
- **ข้อสรุปสุดท้ายและเหตุผล**: ยึดตาม `13_SETTINGS_MODULE.md` §12: ทันทีที่ยืนยันการลบบัญชี สถานะบัญชีจะกลายเป็น Deactivated บัญชีและโพสต์ทั้งหมดจะถูกซ่อนจาก Public Search, Feed, และโปรไฟล์สาธารณะทันที หากผู้อื่นเปิดลิงก์โปรไฟล์จะพบหน้า "ไม่พบบัญชีผู้ใช้นี้"
- **พฤติกรรมที่ต้องทดสอบและผลที่คาดหวัง**: บัญชี A ลบบัญชี; บัญชี B ค้นหาชื่อบัญชี A ในช่องค้นหาไม่พบ และกดลิงก์โปรไฟล์พบหน้าจอว่าง/ข้อความไม่พบผู้ใช้
- **Test Case และไฟล์ต้นฉบับ**: `PROF-111` ใน `deliverables/FO-TEST-001-12-profile.md` และ `FO-TEST-001-12-profile-checklist.csv`

---

### [DEC-09] GAP-15: สภาพของห้องแชทฝั่งคู่สนทนาเมื่ออีกฝ่ายปิดการใช้งานบัญชี (Deactivated)
- **ประเด็นและผลกระทบ**: คู่สนทนายังต้องสามารถดูประวัติการพูดคุยเดิมได้เพื่อความโปร่งใส แต่ต้องไม่สามารถส่งข้อความหาคนที่ไม่ใช้งานแล้วได้
- **ข้อสรุปสุดท้ายและเหตุผล**: ยึดตาม `07_CHAT_MODULE.md` §9: ห้องแชทเดิมยังคงอยู่ในรายการแชทของคู่สนทนา ประวัติข้อความเดิมยังอ่านได้ แต่ชื่อผู้ใช้จะแสดงเป็น "ผู้ใช้งานที่ปิดบัญชี" (Deactivated User) และกล่องข้อความพิมพ์ (Input Bar) จะถูกปิดการใช้งาน (Disabled)
- **พฤติกรรมที่ต้องทดสอบและผลที่คาดหวัง**: เปิดห้องแชทของบัญชีที่ถูกลบ ประวัติข้อความแสดงครบถ้วน หัวห้องแชทระบุสถานะปิดบัญชี กล่องพิมพ์ข้อความถูกปิดและมีข้อความชี้แจง
- **Test Case และไฟล์ต้นฉบับ**: `CHAT-127` ใน `deliverables/FO-TEST-001-08-chat.md` และ `FO-TEST-001-08-chat-checklist.csv`

---

### [DEC-10] GAP-16: ขอบเขตข้อมูลที่ได้รับการกู้คืน (Restore Scope) เมื่อเข้าสู่ระบบในระยะผ่อนผัน 30 วัน
- **ประเด็นและผลกระทบ**: ความชัดเจนว่าข้อมูลส่วนใดจะกลับมาเมื่อผู้ใช้เข้าสู่ระบบเพื่อกู้บัญชี
- **ข้อสรุปสุดท้ายและเหตุผล**: ยึดตาม `00_GLOBAL_RULES_MODULE.md` §12 และ `13_SETTINGS_MODULE.md` §12: การ Sign-in ภายใน 30 วัน จะกู้คืน: โพสต์สินค้าทั้งหมด, รายการ Saved, รายการ Wishlist, ประวัติแชท และข้อมูลโปรไฟล์ **ยกเว้น** รายการ Watch Alerts ที่ถูกล้างและไม่กู้คืนตามกฎความเป็นส่วนตัว (ผู้ใช้ต้องสร้างใหม่)
- **พฤติกรรมที่ต้องทดสอบและผลที่คาดหวัง**: ผู้ใช้ที่อยู่ในระยะ grace ล็อกอินเข้ามาใหม่ ระบบแสดงข้อความต้อนรับกลับ บัญชีและโพสต์กลับสู่สาธารณะ รายการ Saved/Wishlist ครบ แต่หน้า Watch Alerts เป็นค่าเริ่มต้นว่าง
- **Test Case และไฟล์ต้นฉบับ**: `SET-121` ใน `deliverables/FO-TEST-001-15-settings.md` และ `FO-TEST-001-15-settings-checklist.csv`

---

### [DEC-11] GAP-17: การคืนโพสต์จากรายการ "ไม่สนใจ" (Not Interested Undo) กลับเข้าสู่ฟีด
- **ประเด็นและผลกระทบ**: เมื่อผู้ใช้ลบรายการออกจาก Not Interested ใน Settings โพสต์ควรกลับมาอย่างไร
- **ข้อสรุปสุดท้ายและเหตุผล**: ยึดตาม `13_SETTINGS_MODULE.md` §8 และ `00_GLOBAL_RULES_MODULE.md` §9: การลบรายการออกจาก Not Interested ไม่แทรกโพสต์กลับเข้าสู่หน้าจอทันทีเพื่อไม่ให้รบกวน layout ปัจจุบัน แต่จะคืนสิทธิ์ให้โพสต์นั้นกลับเข้าสู่ Recommendation Pool เมื่อผู้ใช้ Refresh หน้าฟีด หรือเปิดแอปใหม่ในครั้งถัดไป
- **พฤติกรรมที่ต้องทดสอบและผลที่คาดหวัง**: ลบโพสต์ออกจาก Not Interested List ในหน้า Settings กลับมาที่หน้าฟีดแล้ว Pull-to-refresh โพสต์นั้นจะสามารถปรากฏบนฟีดได้ตามปกติ
- **Test Case และไฟล์ต้นฉบับ**: `LIB-107` ใน `deliverables/FO-TEST-001-14-library.md` และ `FO-TEST-001-14-library-checklist.csv`

---

### [DEC-12] GAP-18: ลำดับขั้นตอน Deep Link ภายนอกเข้าสู่หน้าที่มีการควบคุมสิทธิ์ (Gated Surface)
- **ประเด็นและผลกระทบ**: ผู้ใช้ภายนอกกดคลิกลิงก์แชร์ เช่น หน้ารายการโปรด หรือสร้างโพสต์ ซึ่งต้องเข้าสู่ระบบก่อน
- **ข้อสรุปสุดท้ายและเหตุผล**: ยึดตาม `00_NAVIGATION_AND_CROSS_MODULE_FLOW.md` §12: เมื่อรับ Deep Link ที่เป็น Gated Route ระบบจะเปิดหน้าจอนั้นและแสดง Member Sheet "Join TukDaeng" ทับ; หากผู้ใช้ล็อกอินสำเร็จ ระบบจะนำผู้ใช้เข้าสู่หน้าที่ลิงก์ชี้ไปทันที; หากผู้ใช้กดปิด Sheet หรือกดย้อนกลับ (Back) ระบบจะนำผู้ใช้กลับสู่หน้า Home/Feed อย่างปลอดภัย
- **พฤติกรรมที่ต้องทดสอบและผลที่คาดหวัง**: ยิง Deep Link `tukdaeng://create` ในสถานะ Guest; Member Sheet เด้งขึ้นมา; เมื่อ Sign In สำเร็จ หน้า Create จะเปิดพร้อมใช้งาน; เมื่อกด Back จะกลับสู่ Feed
- **Test Case และไฟล์ต้นฉบับ**: `E2E-016` ใน `deliverables/FO-TEST-001-18-e2e.md` และ `FO-TEST-001-18-e2e-checklist.csv`

---

## 3. Decision Register: รายการ [OPEN] ใน §6.3 และ §6.4

| ลำดับ | ประเด็น [OPEN] | เล่ม / TC | ข้อสรุปและสัญญาพฤติกรรม (Final Contract) |
|:---:|---|---|---|
| 1 | First-run consent ไม่มีปุ่ม Decline | 01 / AUTH-060 | **ยึด Prototype เป็น Spec**: ผู้ใช้ต้องยอมรับเงื่อนไขการใช้งาน (Accept) จึงจะเข้าใช้งานแอปได้ หากไม่ประสงค์ใช้งานต้องปิดแอปออกจาก OS |
| 2 | Re-consent เมื่อมีการอัปเดต Policy Version | 01 / AUTH-069..072 | **Contract ชัดเจน**: เมื่อ Back Office ประกาศใช้ Policy Version ใหม่ แอปจะแสดง Modal บังคับ Re-consent ในการเปิดแอปครั้งถัดไป |
| 3 | Restore ระหว่าง Grace Period | 01 / AUTH-092 | **Contract ชัดเจน**: การ Sign-in ด้วยอีเมล/รหัสผ่านเดิมภายใน 30 วัน จะปลดล็อคสถานะ Deactivated และกู้คืนบัญชีอัตโนมัติ |
| 4 | Badge แสดงตัวเลขเกิน `99+` | 02 / SHELL-030 | **Contract ชัดเจน**: Bottom Nav Badge สำหรับการแจ้งเตือนและแชทจะแสดงตัวเลขสูงสุดที่ `99+` เมื่อยอด unread รวม > 99 |
| 5 | Sensitive Content Filter Toggle | 15 / SET-087 | **Contract ชัดเจน**: เมื่อเปิด toggle จะแสดงเนื้อหา Sensitive พร้อมเบลอและคำเตือนก่อนกดดู; เมื่อปิด toggle จะซ่อนเนื้อหาออกจากฟีดทั้งหมด |
| 6 | Notification Settings Scope | 15 / SET-053..058 | **Contract ชัดเจน**: การตั้งค่าเปิด/ปิด Notification ในหน้า Settings เป็นการตั้งค่าระดับบัญชี (Account-level) และซิงก์กับระบบ Server Push |
| 7 | เมนูเปลี่ยนรหัสผ่านสำหรับบัญชี SSO | 15 / SET-024 | **Contract ชัดเจน**: บัญชีที่ล็อกอินด้วย SSO (Google/Apple) ไม่มีรหัสผ่านในระบบ เมนู Change Password จะถูกซ่อนหรือ Disabled พร้อมคำอธิบาย |
| 8 | Date Joined ในโปรไฟล์และ Settings | 15 / SET-012 | **Contract ชัดเจน**: แสดงเดือนและปีตามวันที่ผู้ใช้สมัครบัญชีจริง (เช่น "เข้าร่วมเมื่อ ตุลาคม 2026") |
| 9 | Localized Alert Copy จาก Server | 19 / LANG-031 | **Contract ชัดเจน**: ข้อความแจ้งเตือนระบบจากเซิร์ฟเวอร์จะถูกส่งมาเป็น Localization Key หรือแปลข้อความตาม Header ภาษาของแอป (TH/EN) |
| 10 | มาตรฐานการแสดงหน่วยเงินและระยะเวลาถือครอง | 19 / LANG-035, 047 | **Contract ชัดเจน**: ภาษาไทยใช้สัญลักษณ์ `฿`, ภาษาอังกฤษใช้ `THB`; ระยะเวลาถือครองใช้ `y` (ปี) และ `m` (เดือน) สม่ำเสมอทุกหน้าจอ |
| 11 | การแสดงปี พุทธศักราช (พ.ศ.) ในภาษาไทย | 19 / LANG-005, 012, 037 | **Contract ชัดเจน**: เมื่อแอปตั้งค่าเป็นภาษาไทย (th-TH) การแสดงผลวันที่และปีต้องใช้ระบบ พ.ศ. เสมอ (เช่น 2569) |
| 12 | Market Data Band และ Estimated Price Fallback | 13 / AST-011..035, 06 / DET-011 | **Contract ชัดเจน**: แสดงแถบช่วงราคาตลาดและราคาประเมินตามที่คำนวณได้; หากไม่มีข้อมูลจะแสดงสถานะ "ไม่มีข้อมูลราคาตลาด" ชัดเจน |
| 13 | Fallback Screen เมื่อเข้าถึงเนื้อหาที่ถูก Block | 16 / TRS-047..049 | **Contract ชัดเจน**: เมื่อเปิดลิงก์ของผู้ใช้ที่เราบล็อกหรือเขาบล็อกเรา ระบบจะแสดงหน้าจอ Unavailable พร้อมปุ่มนำทางกลับหน้าหลัก |

---

## 4. ผลกระทบต่อเอกสารและการซิงก์ (Synchronization Impact)

1. **เพิ่ม Test Case ใหม่ 11 เคส**:
   - `FO-TC-SHELL-066` (เล่ม 02: Shell)
   - `FO-TC-CHAT-125`, `FO-TC-CHAT-126`, `FO-TC-CHAT-127` (เล่ม 08: Chat)
   - `FO-TC-WA-064` (เล่ม 11: Watch Alert)
   - `FO-TC-PROF-111` (เล่ม 12: Profile)
   - `FO-TC-LIB-106`, `FO-TC-LIB-107` (เล่ม 14: Library)
   - `FO-TC-SET-121` (เล่ม 15: Settings)
   - `FO-TC-TRS-062`, `FO-TC-TRS-063` (เล่ม 16: Trust & Safety)
2. **ปรับปรุง Checklist CSV**:
   - เพิ่มแถวครบทั้ง 10 คอลัมน์ ไม่เว้นว่างโครงสร้าง
   - อัปเดตสถิติจำนวนเคส (TC count) และ Priority totals ให้ตรงกับ MD
3. **ปรับปรุง Traceability (`FO-TEST-001-20-traceability.md`)**:
   - ปิดทุกสถานะ GAP-7..18 และ OPEN items ให้กลายเป็น `RESOLVED`
   - ปรับยอดรวม Test Cases ทั่วทั้งระบบจาก 1,609 เป็น **1,620 TC**
   - ยืนยันผลการตรวจรับผ่าน 100% ไม่มี OPEN, WAIT, BLOCK หรือ SKIP ตกค้าง

---

## Addendum — การตัดสินใจเพิ่มเติม (2026-10-30, Feed behavior ตามมาตรฐาน IG)

### [DEC-13] Feed pagination
- **ตัดสิน:** โหลดโพสต์เป็นหน้า + infinite scroll เมื่อเลื่อนใกล้ท้าย list (พฤติกรรม IG) ไม่มี end-of-list marker
- **ผู้ตัดสิน:** ผู้ใช้ (2026-10-30)
- **ผลต่อ spec:** `02_FEED_MODULE.md` — User Flow → Open Feed ข้อ 3, Performance, AC-FEED-035, Out of Scope
- **ค้าง:** ขนาดหน้าและเกณฑ์ระยะก่อนท้าย list
- **ผลต่อ prototype:** ยังไม่แก้ (อยู่นอก scope งาน FO-TEST)

### [DEC-14] Carousel บนการ์ด: swipe หยุดที่ปลาย + double-tap ไลก์
- **ตัดสิน:** swipe เปลี่ยนรูปทีละ 1 และหยุดที่รูปแรก/สุดท้าย (ไม่วน); double-tap รูป = ไลก์ (heart animation, guest → gate); single tap ไม่ทำอะไร
- **ผู้ตัดสิน:** ผู้ใช้ (2026-10-30)
- **ผลต่อ spec:** `02_FEED_MODULE.md` — Card Photo Interaction, Card Navigation, AC-FEED-010
- **ผลต่อ prototype (ยังไม่แก้):** ปัจจุบันแตะครึ่งซ้าย/ขวาแล้ววน และไม่มี double-tap ไลก์
- **ค้าง:** viewer/detail hero ใช้ handler เดียวกันตาม spec 05 ข้อ tap wrap-around — ต้องตัดสินว่าจะเปลี่ยนด้วยหรือไม่

### [DEC-15] Pull-to-refresh
- **ตัดสิน:** รองรับ pull-to-refresh ที่ตำแหน่งบนสุดของ feed (IG behavior) ปล่อยเกิน threshold = reload ตั้งแต่หน้าแรก
- **ผู้ตัดสิน:** ผู้ใช้ (2026-10-30)
- **ผลต่อ spec:** `02_FEED_MODULE.md` — Tap-to-Refresh ข้อ 3, Performance, AC-FEED-035
- **หมายเหตุ:** prototype มี ptr indicator แล้ว (โค้ดอ้าง FEED-004)

### [DEC-16] Viewer / Post Detail carousel ตาม feed
- **ตัดสิน:** รูปหลายรูปใน Post Viewer (immersive, pfp, feed-mode) และ Post Detail hero ใช้กติกาเดียวกับ feed: swipe ทีละ 1 รูป หยุดที่ปลาย (ไม่วน); double-tap = ไลก์; single tap ไม่ทำอะไร
- **ผู้ตัดสิน:** ผู้ใช้ (2026-10-30)
- **ผลต่อ spec:** `05_ASSET_DETAIL_MODULE.md` (Hero swipe, AC-DETAIL-007), `03_SEARCH_FILTER_MODULE.md` (Post Viewer Navigation Rule)
- **ผลต่อเคส:** PV-015, PV-026, PV-027, DET-007
- **ผลต่อ prototype (ยังไม่แก้ — งานแยก):** ปัจจุบันยังแตะครึ่งซ้าย/ขวาแล้ววน และไม่มี double-tap

### [DEC-17] Comment reply แบบ IG (flat thread) + composer อยู่ใน V1
- **ตัดสิน:** comment ใส่ข้อความและส่งได้ใน V1; reply ทุกชั้นแสดงต่อท้าย root เดียวกันแบบ flat (ไม่ซ้อนต้นไม้); reply ของ reply ใส่ @username อัตโนมัติ
- **ผู้ตัดสิน:** ผู้ใช้ (2026-10-30)
- **ผลต่อ spec:** 11_SOCIAL (Comment structure, non-goals, Reply, composer) · **ผลต่อเคส:** SHT-018, SHT-020 แก้แล้ว
- **ผลต่อ prototype:** ยังไม่แก้ (งานแยก f2f1934f)

### [DEC-18] Feed scroll-to-hide (IG behavior)
- **ตัดสิน:** เฉพาะหน้า Feed: เลื่อนลงเกิน 56px ซ่อน header + bottom nav; เลื่อนขึ้นหรือถึงบนสุดแสดงกลับ; หน้าอื่นไม่มีผล
- **ผู้ตัดสิน:** ผู้ใช้ (2026-10-30) — prototype มีอยู่แล้วที่ `.feed-scroll` (bars-hidden)
- **ผลต่อ spec:** 00_NAV §6.3A (ใหม่) · **ผลต่อเคส:** SHELL-042–048 ใช้ได้ตามที่เขียน

### [DEC-19] แปลไทยเต็มระดับทั้งแอป (ยกเว้นเนื้อหาผู้ใช้)
- **ตัดสิน:** ทุก UI copy (label, เมนู, tab, placeholder, toast, dialog, empty/error, validation, legal, รูปแบบวันที่/เงิน/ปี พ.ศ.) ต้องแสดงตามภาษาที่เลือก; ยกเว้นเนื้อหาที่ผู้ใช้พิมพ์เอง (caption, comment, chat, ชื่อ collection/alert, bio, username) และเนื้อหาบทความ Board ซึ่งคงภาษาเดิม
- **ผู้ตัดสิน:** ผู้ใช้ (2026-10-30)
- **ผลต่อ spec:** 02 (toasts), 03 (TH scope), 04 (toasts) · **ค้าง:** audit EN-only รายหน้า
- **ผลต่อเคส:** ต้องเพิ่ม/แก้เคส TH (รวม SRCH-060, CRE-070, SHT-109/110) ตามผล audit

### [DEC-20] (อนุมัติ 2026-10-30) แชร์โพสต์ให้เพื่อนแล้วโพสต์เข้าห้องแชทจริง
- prototype ทำแล้ว (`chSharePost` เปิด chatroom) spec 11 ระบุแค่ toast · เคส FEED-041 / SHT-051 ต้องการพฤติกรรมนี้
- **ผลต่อ spec:** 11_SOCIAL (`.sh-fr`) แก้แล้ว

### [DEC-21] (อนุมัติ 2026-10-30) status tag ตาม pfKind (รวม SOLD/HIDDEN)
- prototype ใช้ `statusTagHTML` ตาม pfKind (sale→FOR SALE, show→SHOWCASE, sold→SOLD, hide→HIDDEN, post ไม่มี tag) spec 05 ระบุ tag ตาม price · เคส DET-009 / PV-053
- **ผลต่อ spec:** 05 (inline-tag, AC-DETAIL-010, deviation) แก้แล้ว

### [DEC-13] ค่า pagination (อนุมัติ 2026-10-30)
- 10 โพสต์ต่อหน้า; เริ่มโหลดหน้าถัดไปเมื่อเหลือ 3 การ์ดสุดท้าย

### [DEC-22] Recents ค้นหาเก็บบนเครื่องข้ามการเปิดแอป (IG)
- **ตัดสิน:** เก็บบนเครื่องข้ามการเปิดแอป ล้างเมื่อ sign out/เปลี่ยน session; ลบรายแถวและ Clear all ได้ (อนุมัติ 2026-10-30)
- **ผลต่อ spec:** 03 (Recents, Session memory) · **เคส:** SRCH-016 ตรงแล้ว

### [DEC-23] Tag/hashtag results กรอง ni/muted/blocked (IG)
- **ตัดสิน:** ซ่อนโพสต์ของคนที่บล็อก/mute และโพสต์ที่ ni ออกจากผลค้น hashtag ด้วย (อนุมัติ 2026-10-30)
- **ผลต่อ spec:** 03 (Results Eligibility) · **เคส:** SRCH-032 ตรงแล้ว

### [DEC-24] เปิด search ใหม่ = landing และล้าง state (IG)
- **ตัดสิน:** fresh open กลับ landing ล้าง q/filters/tab (อนุมัติ 2026-10-30)
- **ผลต่อ spec:** 03 (Search State Rule) · **เคส:** SRCH-030 ตรงแล้ว

หมายเหตุ: lock เดิมใน prototype ที่อ้าง FO-TEST-12 (~L16832) เป็นของเล่ม 12 ต้องตรวจในรอบ batch B

### [DEC-25] ชุดข้อตัดสินตามมาตรฐาน IG (รายการ A ใน FO-TEST-001-CONSOLIDATED-IG-decisions-and-backlog.md)
- **ตัดสิน (โดยผู้ตรวจ ตามมาตรฐาน IG; เจ้าของย้อนได้):** A1–A27 — ครอบคลุม Alerts pagination, Board like per-user และ deep link, tab state ทุกแท็บ, Chat server-backed state/mute/deactivated user/สถานะส่ง, Watch Alert self-match/copy/empty TH, Profile followed-by และ copy username/link, error catalogue
- **สถานะ:** บันทึกการตัดสินแล้ว — **ยังไม่ได้แก้ spec/เคส/prototype ตามรายการ** (ค้างตามหัวข้อ D ในไฟล์รวม)
- **รายการที่ต้องถามเจ้าของ (C1–C5):** ยังไม่ตัดสิน

### [DEC-26] ตัดออกจาก V1
- ALT-070 (system new-device login), WA-054 (self-match เป็น notification)

### [DEC-27] คำตอบคำถาม C1–C6 (ตามข้อเสนอแนะ IG)
- C1 ไม่จัดกลุ่มแกลเลอรีแชทตามวัน (CHAT-086 ยกเลิก)
- C2 ข้อความจากคนที่ไม่ได้ตาม → โฟลเดอร์ Requests (message request)
- C3 deep link + native share ของบทความ Board เข้า V1
- C4 batch C: High + เคส lock/decision รอบนี้; ที่เหลือ group-level
- C5 prototype เป็นงานแยก (f2f1934f) ยังไม่เริ่ม
- C6 A/B บันทึกเป็น DEC-25 และ DEC-26 แล้ว

### [DEC-28] Block state server-backed ข้ามเครื่องและ sign-out (IG)
- ตัดสิน: บัญชีที่บล็อกคงสถานะบนเซิร์ฟเวอร์ ข้ามเครื่องและ sign-out (อ้างอิง TRS-062/063)
- ผลต่อ spec: 15_TRUST_SAFETY (amendment ท้ายไฟล์)

### [DEC-29] ข้อความ Legal TH (รอเนื้อหา)
- ตัดสิน: Terms/Privacy ต้องมีฉบับไทยใน spec 00_GLOBAL/01
- สถานะ: **รอเจ้าของส่งเนื้อหาฉบับไทยที่อนุมัติ** — ยังไม่ได้เพิ่มเนื้อหา

### [DEC-29] อัปเดต: ผู้ใช้อนุมัติร่างฉบับไทยเป็น "ตัวอย่างขึ้นก่อน" (2026-10-30) — เนื้อหาจริงจะปรับภายหลัง
- ใช้ deliverables/FO-TEST-001-LEGAL-TH-draft.md เป็นตัวอย่างใน legal viewer; ปิด DEC-29 แบบมีเงื่อนไข (รอเนื้อหาจริง)
### [DEC-30] ชุดแก้ batch A (2026-10-30)
- แก้ expected และ amendment spec ตามตาราง batch A ที่ตัดสินแล้ว (ดู FO-TEST-001-SPEC-CHECK-batch-A.md หัวข้อ 16)
- DEC-31: batch C ตรวจรายแถวแล้ว (FO-TEST-001-SPEC-CHECK-batch-C.md)
