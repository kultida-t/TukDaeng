# Daily Work Report: Tuk Daeng

**วันที่:** 2026-06-18  
**ผู้ทำงาน:** เต็ม / Codex handoff continuation  
**โปรเจกต์:** Tuk Daeng  
**Environment ที่ focus:** docs / PRD handoff / Figma cleanup planning  
**Branch:** `docs-frontoffice-spec-updates-2026-06-16`  
**สถานะ repo ตอนเริ่มวัน:** branch ahead remote 2 commits, working tree clean

---

## 1. สถานะล่าสุดก่อนเริ่มงานวันนี้

ชุดเอกสาร Front Office PRD ถูกจัดเป็น module-level baseline แล้ว โดยมีไฟล์หลักสำหรับอ้างอิงดังนี้:

- `TukDaeng_Master_Product_Definition.md` เป็น source of truth หลัก
- `README_MODULE_INDEX.md` เป็น entry point และ source-of-truth order
- `00_GLOBAL_RULES_MODULE.md` และ `00_NAVIGATION_AND_CROSS_MODULE_FLOW.md` เป็นกฎกลาง
- Module PRD `01-18` ครอบคลุม functional scope รายโมดูล
- `Figma_Gap_Checklist_Against_Master.md` เป็นรายการ gap สำหรับ UX/Figma
- `DEV_IMPLEMENTATION_CHECKLIST.md` เป็น checklist สำหรับแตก implementation ticket
- `QA_TEST_SCENARIO_CHECKLIST.md` เป็น checklist สำหรับ QA และ regression sign-off
- `FINAL_HANDOFF_SUMMARY.md` เป็นสรุป handoff ล่าสุด

สถานะ handoff โดยรวม:

- Master, module PRD, Figma checklist, Dev checklist, QA checklist และ final handoff summary ถูกสร้างครบแล้ว
- งานที่ยัง pending คือ Figma visual update, Dev review และ QA sign-off
- ประเด็น decision ที่ยังไม่ block V1 ถูกเก็บไว้ใน decision log แล้ว

---

## 2. งานที่ควรเริ่มต่อวันนี้

### งานที่ทำต่อแล้ว

- สร้าง `FIGMA_UX_CLEANUP_TASK_BREAKDOWN.md` เพื่อแปลง Figma gap checklist ให้เป็น task group ตาม wave งาน
- แบ่งงาน cleanup เป็น 5 wave: Global Foundation, Core Marketplace Surfaces, Communication/Offer/Notification, Content/Settings/Portfolio/Trust และ Dev/QA Handoff Review
- เพิ่ม suggested assignment สำหรับ UX Lead, UX Marketplace, UX Transaction, UX Platform, Product, Tech Lead และ QA Lead
- ขยาย Open Decision Items ให้มี current baseline, recommended V1 decision, Figma/UX action และ Dev/QA note สำหรับ Delete Chat, Share, Article Comment/Report Article, Delete Account retention และ Full Back Office PRD
- ปรับ Full Back Office PRD ให้เริ่มหลัง FO baseline, Figma cleanup, Dev checklist และ QA checklist ครบ/นิ่งแล้วเท่านั้น
- Sync recommended V1 decision กลับเข้าเอกสารที่เกี่ยวข้องแล้ว ได้แก่ master, Chat, Social, Board, Settings, Admin Scope, Figma gap checklist, Dev implementation checklist และ QA scenario checklist
- เปลี่ยน legal terminology ทั้งโปรเจกต์เป็น `Terms of Use` และ normalize capitalization/label rule ให้ตรงกัน
- เพิ่ม Feed more menu สำหรับ Asset ของผู้อื่นตาม decision ใหม่: Hide this asset, Report Asset, Block User พร้อม rule ว่า Hide Feed Item เป็น user-level preference ไม่ใช่ asset status `Hide`

### Priority 1: Figma Must Fix cleanup

เริ่มจากรายการ `Must Fix` ใน `Figma_Gap_Checklist_Against_Master.md` เพราะเป็นจุดที่ conflict กับ master โดยตรง:

- Normalize asset status ให้เหลือ `Sale`, `Show`, `Hide`, `Sold`
- แยก public/private visibility ให้ชัด โดย private data เห็นเฉพาะ Owner หรือ Admin
- จัดการ future menu items ให้เป็น hidden, disabled หรือ placeholder
- Feed ต้องแสดงเฉพาะ `Sale` และไม่แสดง Location บน Feed Card
- Add/Edit Asset ต้องใช้ status model เดียว และ `Sold` ต้องเข้าผ่าน Mark as Sold flow
- Gallery Add/Edit ต้องรองรับสูงสุด 10 รูป
- Comment UI ต้องเป็น single level และไม่มี nested comment
- Public Profile ต้องมีแท็บ `All`, `Sale`, `Show`
- Notification Center ต้องเหลือเฉพาะ Like, Comment, Follow, Offer, Watch Alert
- Chat/New Message ต้องย้ายออกจาก Notification Center และแสดงผ่าน Chat unread badge/count
- Settings ต้องมี Theme Mode และ Delete Account baseline
- Board ต้องเป็น Article Area ไม่ใช่ user-generated forum/post board
- Admin ต้องอยู่ใน Web Back Office เท่านั้น ไม่ใช่ mobile role
- Payment Gateway ต้องถูกซ่อนหรือติดป้าย future เพราะไม่อยู่ใน V1

### Priority 2: Figma High cleanup

หลัง Must Fix ให้ไล่ `High` ที่กระทบ Dev/QA sign-off:

- Global Login Required Dialog ทุก guest action ที่ต้อง login
- Deleted Asset unavailable state ทุก entry point
- Block filtering ใน Feed, Search, Watch Alert Result, Profile และ Chat
- Offline/cached state อย่างน้อยใน Feed
- Notification destination mapping ให้ครบ
- Watch Alert notification ต้องไป Watch Alert Result List ไม่เปิด Asset Detail ตรง
- Auth edge states เช่น suspended account, OTP expired, password policy, duplicate email, auth method conflict
- Feed infinite scroll, end-of-list, error retry และ offline cached state
- Asset Sold read-only state และ Sale Record/Sold History fields
- Portfolio privacy, formula, fallback และ Owner-only state
- Report/Block flow และ moderation handoff
- Image upload/loading/failure/retry และ CDN placeholder state

---

## 3. Dev / QA handoff gates ที่ต้องย้ำ

- Dev ต้องอ่าน `README_MODULE_INDEX.md` และใช้ source-of-truth order ตามเอกสาร
- ถ้า Figma หรือ legacy document ขัดกับ master ให้ยึด master ก่อน
- Figma `Must Fix` ต้องแก้ก่อนเริ่ม implementation จริง
- Figma `High` ต้องมี owner หรือ decision note ก่อน QA sign-off
- API contract ต้องระบุ permission และ visibility filtering ชัดเจน
- QA ต้องครอบคลุม Guest, Member, Owner, Other User และ Admin boundary
- QA ต้อง test lifecycle ของ `Sale`, `Show`, `Hide`, `Sold`, `Deleted`
- QA ต้อง test Block, Report, Notification routing, Portfolio fallback และ No market price

---

## 4. Recommended work sequence วันนี้

1. เปิด `Figma_Gap_Checklist_Against_Master.md`
2. แยก `Must Fix` เป็น ticket หรือ task group ตาม module
3. เริ่มแก้ Figma จาก global/status/visibility ก่อน เพราะกระทบหลายหน้า
4. ตามด้วย Feed, Asset Management, Asset Detail, Profile, Notification และ Settings
5. หลังแก้แต่ละกลุ่ม ให้ตรวจเทียบ `TukDaeng_Master_Product_Definition.md`
6. อัปเดต checklist พร้อม owner/status/decision note
7. เตรียม Dev/QA review จาก `DEV_IMPLEMENTATION_CHECKLIST.md` และ `QA_TEST_SCENARIO_CHECKLIST.md`

---

## 5. สรุปสำหรับส่งบริษัท

วันนี้เริ่มงานต่อจากชุด Front Office PRD handoff ที่จัดโครงสร้างเสร็จแล้ว โดยสถานะปัจจุบันคือเอกสาร master, module PRD, Figma gap checklist, Dev checklist, QA checklist และ final handoff summary พร้อมใช้งานแล้ว

งานหลักที่ควรทำต่อวันนี้คือให้ทีม UX/Figma ไล่แก้รายการ `Must Fix` ก่อน แล้วตามด้วย `High` เพื่อให้หน้าจอออกแบบไม่ขัดกับ master และพร้อมส่งต่อ Dev/QA ต่อไป

Repo อยู่บน branch `docs-frontoffice-spec-updates-2026-06-16`, ahead remote 2 commits และ working tree clean ตอนเริ่มวัน
