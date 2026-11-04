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
| 10 | มาตรฐานการแสดงหน่วยเงินและระยะเวลาถือครอง | 19 / LANG-035, 047 | **Contract ชัดเจน**: ภาษาไทยใช้สัญลักษณ์ `฿`, ภาษาอังกฤษใช้ `THB` — **superseded โดย DEC-42** (ทั้งสองภาษาใช้ `฿`); ระยะเวลาถือครองใช้ `y` (ปี) และ `m` (เดือน) สม่ำเสมอทุกหน้าจอ |
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

### [DEC-13 — parameters] ค่า pagination (อนุมัติ 2026-10-30)
- 10 โพสต์ต่อหน้า; เริ่มโหลดหน้าถัดไปเมื่อเหลือ 3 การ์ดสุดท้าย — annex ของ DEC-13 (ไม่ใช่ DEC ใหม่ เลขซ้ำโดยตั้งใจให้อ่านว่าเป็นพารามิเตอร์ของ decision เดิม)

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
- อัปเดต (2026-11-04): **ALT-070 superseded โดย DEC-48** — DEC-43 กลืน carve-out ฝั่งนี้ (new device login คืนเป็น security trigger ตัวหลักตาม spec 09 §14 · เคส ALT-070 restore ในเล่ม 10) — **WA-054 ยัง current** (ไม่สร้าง notification ให้ตัวเองเมื่อโพสต์ตัวเองตรงเงื่อนไข alert ตัวเอง)

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

### [DEC-32] ตีความ DEC-26: `system` type คงอยู่ใน V1 (2026-11-02)
- ตัดสิน: DEC-26 ถอนเฉพาะ **generation** ของ system alert "new device login" (เคส ALT-070) — type `system` + seed row + placeholder destination ยังอยู่ตาม spec 09 §9; เคส ALT-015/030 ยังใช้ได้
- ผลต่อ spec: แก้ข้อความ amendment ท้าย `09_NOTIFICATION_MODULE.md` ให้ชัด scope
- อัปเดต (2026-11-02): **superseded โดย DEC-41** — เจ้าของตัดสินถอน `system` type ออกจาก V1 ทั้งประเภท (type + seed row + placeholder destination หมด); เคส ALT-015/030 ถูกถอนตาม

### [DEC-33] own `following` rows มีปุ่ม `แชท`/`Chat` (2026-11-02)
- ตัดสิน: ยืนยันตาม prototype (SoT) — pfollow rows ทั้ง followers และ following มี `pf-msg` Chat + ปุ่มที่สอง (`x` Remove / `...` popover ตาม tab)
- ผลต่อ spec: `06_PROFILE_MODULE.md` §8 + deviation #27 แก้แล้ว; เคส PROF-047/062 ตรงอยู่แล้ว

### [DEC-34] ผลตรวจ batch B2/C2 — เล่ม 10,12,13,14–19 รายเคส (2026-11-02)
- ตรวจทีละเคสเทียบ spec ตาม AC ที่เคสอ้าง ครบ 739 เคส: ตรง 735 · แก้เคส 3 (ALT-015, ALT-075, PROF-069) · แก้ spec 2 (09 DEC-26 wording, 06 following Chat)
- รายงาน: `deliverables/FO-TEST-001-SPEC-CHECK-batch-B2-C2.md` — ALT-075 ยึด DEC-25 offline-with-cache (ERROR_STATE catalogue)
- ค้างถาม: ALT-015/030 ถ้าเจ้าของตั้งใจให้ `system` type ออกทั้ง type (ดู DEC-32) — ถ้าจะถอนเคสต้องสั่งเพิ่ม
- ค้างงาน: LANG-045 รอ prototype/build แปลครบตาม DEC-19 (f2f1934f)

### [DEC-35] หน่วยเงิน `THB`+comma ทั้งสองภาษาใน V1 (2026-11-02)
- ตัดสิน: V1 แสดงราคาเป็น `THB {n}` + comma ทั้ง TH/EN สม่ำเสมอทุก surface (ตาม expected LANG-024/035/047 ที่ตรวจผ่านแล้ว) — ข้อความ contract §3 ข้อ 10 (TH→`฿`) ถือว่า superseded; ถ้าอนาคตอยากใช้ `฿` ในโหมด TH ให้ทำ display-layer ทีหลัง
- ผลต่อ prototype: ไม่มีการเปลี่ยน (ใช้ `THB` อยู่แล้วทุกจุด — audit LANG-045 ยืนยัน)
- ผลต่องาน: ปิดประเด็น money-format ที่ค้าง draft ใน §3 เล่ม 19
- อัปเดต (2026-11-02): **superseded โดย DEC-42** — เจ้าของสั่งเปลี่ยนหน่วยเงิน FO เป็น `฿` ทั้งระบบ (TH/EN เหมือนกัน) วันเดียวกัน

### [DEC-36] Suggestion/Recent rows ไม่แสดง `N listings` (2026-11-02)
- ตัดสิน: เอาจำนวนรายการประกาศออกจาก live suggestion rows (kw/seller) และ recent-search seller rows — seller sub แสดง `Following` เฉพาะที่ follow; Profiles tab/results ยังคง `N listings` ตาม spec
- ผลต่อ spec: `03_SEARCH_FILTER_MODULE.md` (Suggestions, Recent searches) แก้แล้ว · ผลต่อเคส: SRCH-007, SRCH-008 (MD+CSV) แก้แล้ว · SRCH-060 คงเดิม (count ยังอยู่บน Profiles results)
- ผลต่อ prototype: `suggestRows` kw sub = "" + seller sub = `Following`-only; `recentRowHTML` seller sub = `Following`-only (แก้แล้วใน f2f1934f)

### [DEC-37] Renumber `AC-AUTH-031` แถว Sign Up → `AC-AUTH-001A` (2026-11-02)
- ประเด็น: spec 01 มี `AC-AUTH-031` ซ้ำ 2 ความหมาย — Analytics-off (เพิ่มใน v1.10 ตาม DOCUMENT_VERSION) และ Sign Up email+password form (S-20) — เคส AUTH-011 อ้างความหมาย analytics
- ตัดสิน: คง `AC-AUTH-031` = analytics (อ้างโดย AUTH-011 MD+CSV, QA-AUTH-001, DOCUMENT_VERSION) แล้วเปลี่ยนแถว Sign Up เป็น `AC-AUTH-001A` — ใช้ suffix convention เดิมของ spec (AC-AUTH-002A/016A/020A–E) เพราะเป็น sub-requirement ของ AC-AUTH-001 registration
- ผลต่อ spec: `01_AUTHENTICATION_MODULE.md` แถว Sign Up → `AC-AUTH-001A`; `QA_TEST_SCENARIO_CHECKLIST.md` QA-AUTH-002/017 maps → `AC-AUTH-001A`
- หมายเหตุ: reference เก่าใน evidence รอบก่อน (`fo-spec-sync/FSP-012a`) ที่เขียนว่า `AC-AUTH-031` ในบริบท Sign Up/S-20 ให้อ่านเป็น `AC-AUTH-001A` — ไม่แก้เอกสาร evidence ย้อนหลัง

### [DEC-38] Change Password canonical = 13_SETTINGS §9 (2026-11-02)
- ประเด็น: spec 01 §Change Password + AC-AUTH-020A–D + exception table + DEV_IMPLEMENTATION_CHECKLIST ใช้ label/copy รุ่นเก่า (`Confirm new password`, `Current password is incorrect.`, `Passwords do not match.`, `Password changed`) ขัดกับ canonical 13_SETTINGS §9 ที่เขียนตาม prototype verbatim (`Re-type new password`, `Your current password was entered incorrectly. Please check it and try again.`, `Passwords do not match. Please re-enter your new password.`, toast `Password changed successfully` ฯลฯ) — เคส AUTH-076–078, SET-021 ยึด spec 13 อยู่แล้ว
- ตัดสิน: ยึด spec 13 + prototype เป็น SoT — sync spec 01 §Change Password (label, helper, success toast, flow step), AC-AUTH-020A–D copies, exception table 3 แถว ให้ตรง canonical; คง `AC-AUTH-020E` (`Unable to change password. Please try again.`) เป็น API-layer contract ที่ spec 13 ไม่ครอบ (prototype ไม่มี API path — ไม่ขัด)
- ผลต่อ spec: `01_AUTHENTICATION_MODULE.md`, `DEV_IMPLEMENTATION_CHECKLIST.md`, `QA_TEST_SCENARIO_CHECKLIST.md` — ไม่มีการแก้เคส (expected เดิมถูกแล้ว)

### [DEC-39] ตีความ locked row §3 ข้อ 1 — legal consent ไม่ใช่ privacy consent (2026-11-02)
- ประเด็น: register §3 ข้อ 1 (AUTH-060) เขียนว่า "ต้อง Accept จึงเข้าใช้งานได้" — อ่านคลุมเครือได้ว่าขัดกับ `Reject all` บน Privacy Notice ที่เดินหน้าได้ปกติ (AUTH-011)
- ตัดสิน: ข้อ 1 หมายถึง **legal consent** (Terms/Privacy ผ่าน Welcome `Continue` + implied consent + re-consent) เท่านั้น — ไม่มีปุ่ม Decline/Exit บน consent surfaces; ผู้ใช้ที่ไม่ยอมรับทางเลือกเดียวคือปิดแอป — ส่วน **Privacy Notice** optional toggles (analytics/personalization) เลือกได้ทั้ง `Accept all`/`Reject all`/`Privacy settings` ทุกทางเดินหน้าได้และบันทึก consent record (AC-AUTH-027/031, AUTH-011) — ไม่มี conflict กัน
- ผลต่อ spec/เคส: ไม่มี (คงพฤติกรรมเดิม ตีความให้ชัดเท่านั้น)

### [DEC-40] ปิด batch A — spec/citation hygiene sweep (2026-11-02)
- ตัดสินรวมประเด็นค้างของ SPEC-CHECK batch A (ระดับ consistency/citation ไม่เปลี่ยนพฤติกรรม):
  1. spec 13 validation table ตัดข้อความ stale `prototype deviate — เช็กเฉพาะความยาว` ออก — FO-SYNC-01 resolved แล้ว (prototype enforce ทั้ง length + num/sym)
  2. spec 11 sync บรรทัด stale ให้ตรง DEC-17 + amendment ตัวเอง: composer อยู่ใน V1 (ลบออกจาก Out of Scope + Future Enhancement + inventory L33 + deviation D2), `.comment-input` ไม่มี img/gif icons แต่มี send จริง, `.c-like` persist (ตาม amendment "ไม่ใช่ cosmetic"), heading emoji ไม่ใช่วิธีเดียวที่เขียน comment อีกต่อไป — sweep เดียวกันปิด stale "ไม่มี infinite scroll/pull-to-refresh ใน V1" ที่ขัด DEC-13/15 ใน `TukDaeng_Master_Product_Definition.md` (L220/358/921/975), `17_NON_FUNCTIONAL_REQUIREMENTS.md` (L28/46/85/98), `PRD.md` (L111), `Use_Cases.md` (L193), `DEV_IMPLEMENTATION_CHECKLIST.md` (L343/374), `QA_TEST_SCENARIO_CHECKLIST.md` (QA-FEED-019), `ERROR_STATE_UI_COPY_CATALOG.md` (sync note) — คงเดิมเฉพาะ Search grid (03 L413), Board static list และ DOCUMENT_VERSION/changelog ที่เป็น historical record
  3. SHELL-066 citation: `กติการะบบ 10` ไม่มีข้อความ payment ใน 00_GLOBAL §10 (เป็น visibility matrix) — แก้ citation เป็น DEC-01/GAP-7 + canonical `04` §Phase 1 ("Payment ในแอป — Phase 1 ไม่มี") + `16` AC-INT-012 (Payment Gateway = Phase 2)
  4. citation "spec ล็อก/ยืนยัน spec แล้ว 2026-10-28" ที่อ้างตำแหน่งไม่มีจริงใน notes SHELL-046/054/065 → ชี้ anchor จริง: DEC-18 + 00_NAV §6.3A (scroll-to-hide), 00_NAV Batch A Amendments (Android device back), 00_NAV DEC-25 Amendment (tab state/re-tap)
  5. PV-026 / DET-007 — ตรวจยืนยันแก้ตาม DEC-16 ครบทั้ง MD+CSV แล้ว (ปิดค้าง §14.1)
- ผลต่อเคส: แก้เฉพาะ citation/notes ของ SHELL-046/054/065/066 (expected ไม่เปลี่ยน — MD+CSV sync แล้ว)
- ผลลัพธ์: รายการไม่ตรง batch A ทั้ง 102 เคส + ประเด็นระบบ §9 ทั้ง 14 ข้อปิดครบ — เหลือ backlog ข้ามงานเดิม (LANG-045 รอ build แปลครบตาม DEC-19; DEC-29 รอ legal TH ฉบับจริง)

### [DEC-41] ถอน `system` notification type ออกจาก V1 ทั้งประเภท (2026-11-02)
- อัปเดต (2026-11-04): **superseded โดย DEC-43** — `system` type คืนเข้า V1 ตาม requirement NB-046 ด้วย 3 subtypes + destinations จริง + category filter (เคส ALT-015/030 ที่เคยถอนรอ restore ใน test-book sync)
- ตัดสิน (เจ้าของ): alerts feed แบบ IG เหลือเฉพาะ social/watch alert — ถอน `system` type ออกจาก V1 ทั้งประเภท: row anatomy, placeholder destination, seed row ใน prototype และ security/session trigger contract หมดทั้งหมด — **supersede DEC-32** (ข้อ "type `system` + seed + placeholder คงอยู่") และ**ขยาย DEC-26** (เดิมถอนเฉพาะ generation "new device login" → คราวนี้ถอนทั้ง type รวม S-17/FSP-021 ที่เคยรับ `system` เข้า baseline)
- ผลต่อ spec: `09_NOTIFICATION_MODULE.md` — ถอน `system` จาก §2/§3 (seed 13→12 rows, `.al-sys` anatomy)/§4/§5/§8/§9 (data model, row anatomy, destination rule, `system` Type Rule ทั้ง section, deviations #3/#5)/§11/§14 (trigger + no-toggle + erasure)/§15 (`alert_system_placeholder`)/§16 (AC-NOTI-002/020; **AC-NOTI-013 repurpose** เป็น guard "ไม่มี system row ใน feed"; AC-NOTI-021 รวม system เข้าชุด type นอก baseline) + amendment ท้ายไฟล์ — sync ไฟล์ spec ที่อ้าง `system`/S-17 อีก 13 ฉบับ: `00_GLOBAL` (types list), `00_NAV` §8 (destination matrix), `16_INTEGRATIONS`, `PRD.md`, `FO_Functional_PRD.md` (sync note + types + destination table), `TukDaeng_Master_Product_Definition.md` (glossary, supported/unsupported lists, S-17 mark superseded), `Use_Cases.md` (UC-ALERT-001 5→4 types), `README_MODULE_INDEX.md`, `QA_TEST_SCENARIO_CHECKLIST.md` (seed content + diff table + QA-NOTI-002 เปลี่ยนเป็น verify 4 types + QA-NOTI-003 ถอน system tap), `DEV_IMPLEMENTATION_CHECKLIST.md`, `DEV_BASELINE_HANDOFF_2026-06-22.md`, `DOCUMENT_VERSION.md`, `FINAL_HANDOFF_SUMMARY.md` — ทุกฉบับเหลือ 4 types (like/comment/follow/watch)
- ผลต่อเคส: ถอน **ALT-015** (system row anatomy) + **ALT-030** (system → ไม่ navigate) — เล่ม 10 MD+CSV sync, สถิติ 78→76 (Medium 44→42, csv rows 89→87); **LANG-031** ปรับ precondition "ครบ 5 types"→"4 types" + ถอน system-row expectation (MD+CSV); book 19 §3 watchpoint "system-type alert text = server copy" → moot; traceability §0/§1/§2.6/§6.3/§6.4/§7.1/§8 sync — TC รวม 1,621→1,619 (Medium 693→691); inventory (row types/`Alert` type list/[OPEN-CODE-ONLY] note) + task-breakdown + FO-DIAG diagram → 4 types
- ผลต่อ prototype: `Prototypes/fo-flow/index.html` — เอา `system` seed row ออกจาก `ALERTS` (member seed 13→12 rows) + ถอน `.al-sys` avatar branch/CSS block/`system` text branch/toast fallback `Security details aren't in this prototype yet`/i18n dict entry + comment อ้าง DEC-32
- เอกสาร historical (FSP-*/SPEC-CHECK batch A-B2-C2/CONSOLIDATED-IG/FO-PROTO report/task-* evidence) คงเดิมเป็นบันทึกย้อนหลัง — ไม่แก้ตาม convention (อ้าง `system` ในนั้นให้อ่านเป็นสภาพ ณ เวลาที่เขียน)

### [DEC-42] หน่วยเงิน FO = `฿` สัญลักษณ์เดียวทั้งระบบ (2026-11-02)
- ตัดสิน (เจ้าของ — task FO-CURRENCY): ราคาเงินบาททุกจุดใน FO แสดง `฿` เหมือนกันทั้งแอป ทั้ง TH/EN — ไม่เหลือตัวย่อ `THB`/`USD` ค้างใน UI; label หน่วย `(THB)`/`(บาท)` → `(฿)`; **supersede DEC-35** (ที่ล็อก `THB`+comma ไว้วันเดียวกัน) — ข้อ `USD`→`$` เป็น no-op เพราะไม่มี USD ใน FO scope เลย (อยู่แต่ฝั่ง BO/contract)
- ผลต่อ prototype: `Prototypes/fo-flow/index.html` — mock price strings, formatters (filter chip `฿{min|0}–{max|Any}`, cfVal price/cost, Estimated Market Price band, WA criteria label, portfolio headline), labels `Price range/Asking price/Purchase price/Sale price (THB)` → `(฿)`, label TH `(บาท)` → `(฿)`, i18n pattern `THB {n}–Any`→`฿{n}–ไม่จำกัด` + `·`-split guard — เหลือ `THB` เฉพาะชื่อ helper `pfoTHB`/`pfoSignTHB` (identifier โดยเจตนา); satellite files `feed-social-redesign`/`feed-create-post`/`create-post` sync ตาม (อนุมัติแล้ว)
- ผลต่อ spec: `02_FEED`, `03_SEARCH` (price chip + filter label + WA criteria), `04_ASSET` (row summary + `Sale price (฿)` + AC-ASSET-MGMT-027), `10_WATCH_ALERT` (criteria label), `14_PORTFOLIO` (headline `฿N` — **ปิด quirk D14**: headline/rows ใช้สัญลักษณ์เดียวกันแล้ว), `17_NFR`, `PRD`, `Use_Cases`, `QA_TEST_SCENARIO_CHECKLIST`, `TukDaeng_Master_Product_Definition`, `DEV_UPDATE_PACKAGE_2026-11-02` — semantic mentions คงไว้โดยเจตนา (เช่น `MAX_PRICE` 2,000,000 THB, `purchase` (ราคาซื้อ THB), ชื่อ helper `pfoTHB`)
- ผลต่อเคส: expected copy เล่ม 03/04/05/06/11/13/19 (MD+CSV คู่กัน) → `฿` ทุกจุด; เคสที่เคย assert "ไม่มี ฿ ปน" flip เป็น "ไม่มี THB ปน"; `20-traceability` annotate แถว contract เงินว่า superseded โดย DEC-35 → DEC-42; `docs/money-display-rules.md` (DRAFT shared FO+BO) ไม่แตะตามที่เจ้าของตัดสิน
- ขอบเขต: FO เท่านั้น — BO (`bo-prototype` + BackOffice spec) คง `THB` ตาม contract เดิม ห้ามแตะ
- เอกสาร historical (FSP-*/SPEC-CHECK/mission-*/MONEY-001 evidence) คงเดิมตาม convention — อ้าง `THB` ในนั้นให้อ่านเป็นสภาพ ณ เวลาที่เขียน

### [DEC-43] คืน `system` notification type เข้า V1 (3 subtypes) + category filter บน Alerts feed (2026-11-04)
- ตัดสิน (เจ้าของ — sign-off Gap Report `deliverables/REQ-012-gap-report.md`): NB-046 (`SourceInputs/requirements/2026-11-04-notebook-review-app-tukdaeng-09-10-2026.md`) ยืนยัน "รวมการแจ้งเตือนทุกประเภท (ระบบ, กิจกรรม, Watch Alert) ไว้ที่จุดเดียว พร้อมฟิลเตอร์กรองหมวดหมู่" — `system` type คืนเข้า V1 ด้วย 3 subtypes ที่อนุมัติ: **security** (login อุปกรณ์ใหม่/เปลี่ยนรหัสผ่าน), **account status** (ยืนยันตัวตน/โพสต์ถูกซ่อน), **announcements** (อัปเดตแอป/กิจกรรม/นโยบาย) + `.al-fchip` category filter `ทั้งหมด`/`ระบบ`/`กิจกรรม`/`Watch Alert` บน Alerts feed — **supersede DEC-41** (ที่เคยถอน `system` ทั้งประเภทตอนอิง IG เกินไป)
- ผลต่อ spec: `09_NOTIFICATION_MODULE.md` — คืน `system` ใน §2/§3 (seed 12→16 rows, `kind`/`dest`/`title`/`body` fields, `.al-sys-{kind}` avatar)/§4/§5/§6 (filter chips)/§8 (filter flow + system destination)/§9 (data model, row anatomy, destination rule, **Category Filter Rule** ใหม่, settings boundary — system ไม่มี toggle)/§11 (dest fallback `settings`)/§13 (filtered-empty copy)/§14 (trigger contract 3 subtypes)/§15 (`alerts_filter_changed`)/§16 (AC-NOTI-012A/013/021/023–025) + amendments — sync ไฟล์อ้าง `system`/DEC-41: `00_GLOBAL` §15, `00_NAV` §4/§8, `16_INTEGRATIONS`, `README_MODULE_INDEX`, `TukDaeng_Master_Product_Definition` (supported list + S-17 row), `DOCUMENT_VERSION`, `FO_Functional_PRD` (sync note + types), `Use_Cases` (UC-ALERT-001 4→5), `QA_TEST_SCENARIO_CHECKLIST` (diff table + QA-NOTI-002/003/004/008), `DEV_IMPLEMENTATION_CHECKLIST`, `DEV_BASELINE_HANDOFF`, `FINAL_HANDOFF_SUMMARY`
- ผลต่อ prototype: **ทำแล้วก่อน spec** (เดโมเสนอพี่คิงตามคำสั่งผู้ใช้) — seed 4 system rows + `.al-fchip` filter; REQ-021 = verify + sync lock notes
- ผลต่อเคส: **ค้าง sync** — FO-TEST-001 test books (`deliverables/FO-TEST-001-*`) ยัง assert 4 types; เคส ALT-015/030 ที่เคยถอนตาม DEC-41 รอ restore + เคส filter/system ใหม่ — เป็น follow-up ฝั่ง QA นอก scope spec sync นี้

### [DEC-44] Watch Alert button บน feed header (2026-11-04)
- ตัดสิน (เจ้าของ — sign-off Gap Report): NB-014 + NB-036 ครึ่งแรก (`SourceInputs/requirements/2026-11-04-notebook-review-app-tukdaeng-09-10-2026.md`) — เพิ่ม `.feed-wa` (ไอคอนนาฬิกาข้อมือ ขนาดเท่า `+`) บน app header ของ feed shell ข้างปุ่ม `+` → `pushSub walerts`; guest → Member Sheet (`.feed-wa` ∈ `GUEST_GATE_SEL`)
- ผลต่อ spec: `00_NAVIGATION_AND_CROSS_MODULE_FLOW.md` — §3 (header inventory), §4 (header entries), §6.4 (control row), §6.6 (`walerts` entry note), §7 (entry matrix row), §9 (gate list)
- ผลต่อ prototype: ทำแล้ว (`feed-wa` + `pushSub "walerts"`) — REQ-021 verify

### [DEC-45] View counting rule — scroll-pass ช่วงแรก (2026-11-04)
- ตัดสิน (เจ้าของ — sign-off Gap Report + DEC-R010-05b): NB-033 (`SourceInputs/requirements/2026-11-04-notebook-review-app-tukdaeng-09-10-2026.md`) — ช่วงเริ่มต้น (ผู้ใช้น้อย) นับ view ทุก scroll-pass: card โผล่ในวิวพอร์ต ≥55% → `views +1`, เลื่อนซ้ำนับซ้ำ (`_vSeen` reset เมื่อหลุดจอ), counter อัปเดต in-place read-only, นับเฉพาะ `.feed-scroll`, ไม่นับโพสต์ `hideCounts` — **contract transition**: อนาคตเมื่อผู้ใช้มากขึ้นเปลี่ยนเป็นนับเฉพาะ detail click
- ผลต่อ spec: `02_FEED_MODULE.md` — §9 **View Counting Rule** (ใหม่) + §15 `post_view_counted` event
- ผลต่อ prototype: ทำแล้ว (scroll listener `.feed-scroll` ≥55%/`_vSeen`) — REQ-021 verify

### [DEC-46] Profile settings entry: burger → gear (2026-11-04)
- ตัดสิน (เจ้าของ — sign-off Gap Report): NB-048 (`SourceInputs/requirements/2026-11-04-notebook-review-app-tukdaeng-09-10-2026.md`) — `.pf-menu` บน own profile head เปลี่ยนจาก burger เป็น gear icon (`I.gear(22)`, title `Settings and activity`) ให้เข้าถึงง่ายตาม IG; destination `settings` เหมือนเดิม
- ผลต่อ spec: `06_PROFILE_MODULE.md` (§3/§6/§9/§16 AC-PROFILE-001), `13_SETTINGS_MODULE.md` (entry refs), `QA_TEST_SCENARIO_CHECKLIST` (own-head anatomy + gated-control list + settings-entry expected)
- ผลต่อ prototype: ทำแล้ว (`I.gear(22)`) — REQ-021 verify

### [DEC-47] Selective per-page config policy (2026-11-04)
- ตัดสิน (เจ้าของ — sign-off Gap Report + DEC-R010-05): NB-036 ครึ่งหลัง + NB-047 (`SourceInputs/requirements/2026-11-04-notebook-review-app-tukdaeng-09-10-2026.md`) — ปุ่ม Config ประจำหน้า **เพิ่มเฉพาะหน้าที่มีของให้ตั้งจริง** ไม่บังคับทุกหน้า; V1 มีที่ Chat (`chatcfg`) + Alerts (category filter นับเป็น per-page config); หน้าอื่นที่ไม่มี setting จริงไม่เพิ่ม — setting ส่วนกลางคงที่ Settings จุดเดียว
- ผลต่อ spec: `00_GLOBAL_RULES_MODULE.md` — §11 **Per-Page Config Policy (selective)** (ใหม่)
- ผลต่อ prototype: ไม่มี delta (policy ระดับ spec) — หน้าใหม่ที่มี setting จริงค่อยประเมินรายตัว

### [DEC-48] ตีความ DEC-26 carve-out — `new device login` generation คืนตามทิศทาง DEC-43 (2026-11-04)
- ประเด็น (เจอตอน FO-TEST-002 sync เล่มเทส): spec `09_NOTIFICATION_MODULE.md` มี 2 จุดที่ขัดกันในตัวเอง — §14 trigger contract (เพิ่มตาม DEC-43) ระบุ `Security event (login อุปกรณ์ใหม่ / password change) → system kind:"security"` แต่ DEC-25 Amendments ท้ายไฟล์ยังเขียน "ไม่มี generation ของ system alert 'new device login' ใน V1 (DEC-26 — ถอนเคส ALT-070)"
- ตัดสิน (เจ้าของ — FO-TEST-002 review): ยึดทิศทาง DEC-43 + มาตรฐานแอปจริง — new-device-login คือ security alert ที่มีมูลค่าสูงสุดของ subtype `security` และเป็น trigger ตัวหลักของ §14 อยู่แล้ว; ถือว่า DEC-26 carve-out ถูกกลืนโดย DEC-43 — เคส **ALT-070 restore** แบบอัปเดต (anatomy/`dest` ใหม่) อยู่ใน §2.9 เล่ม 10 แล้ว
- ผลต่อเคส: ALT-070 restore (FO-TEST-002) — เสร็จแล้วในเล่ม 10 MD+CSV
- ผลต่อ spec: **ค้าง annotate** — บรรทัด "ไม่มี generation ของ system alert 'new device login' ใน V1 (DEC-26)" ในส่วน DEC-25 Amendments ของ `09_NOTIFICATION_MODULE.md` เป็น stale ต้อง annotate ว่า superseded ใน spec sync รอบถัดไป (spec ล็อก — ไม่แก้ในงานนี้, ติดตามเป็น task แยก)
