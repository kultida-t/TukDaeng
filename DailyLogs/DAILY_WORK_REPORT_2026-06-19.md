# Daily Work Report: Tuk Daeng

**วันที่:** 2026-06-19  
**ผู้ทำงาน:** เต็ม / Codex handoff continuation  
**โปรเจกต์:** Tuk Daeng  
**Environment ที่ focus:** docs / PRD handoff / Figma cleanup  
**Branch:** `docs-frontoffice-spec-updates-2026-06-16`  
**สถานะ repo ตอนเริ่มวัน:** working tree clean

---

## 1. สถานะล่าสุดก่อนเริ่มงานวันนี้

งานก่อนหน้าได้จัดชุดเอกสาร Front Office PRD handoff ระดับ module แล้ว และสร้าง `FIGMA_UX_CLEANUP_TASK_BREAKDOWN.md` เพื่อแปลง Figma gap checklist เป็น wave งานสำหรับ UX/Figma

สถานะล่าสุด:

- Master, module PRD, Figma gap checklist, Dev checklist, QA checklist และ final handoff summary มีครบแล้ว
- Next step คือเริ่มแก้ Figma จาก `Must Fix` และ High priority ที่กระทบ Feed, Guest restriction, Owner action และ Trust & Safety flow
- เอกสารวันนี้มีการแตก `Must Fix Ticket Matrix` เป็น `UX-MF-001` ถึง `UX-MF-016` เพื่อให้ใช้เปิดงาน Figma ได้ชัดเจน

---

## 2. งานเอกสารที่ทำวันนี้

### 2.1 แตก Figma Must Fix เป็น ticket matrix

- เพิ่ม section `Must Fix Ticket Matrix` ใน `FIGMA_UX_CLEANUP_TASK_BREAKDOWN.md`
- แตกงาน `Must Fix` เป็น ticket `UX-MF-001` ถึง `UX-MF-016`
- ระบุ owner, Figma action, acceptance gate และ dependency ของแต่ละ ticket
- จัด working order สำหรับปิดงานตามลำดับ global foundation, marketplace surfaces, notification/chat และ compliance/scope boundary
- เพิ่ม sign-off rule ว่าแต่ละ ticket ต้องเป็น `Done`, `Not Applicable` พร้อมเหตุผล หรือ `Needs Product Decision` ก่อนส่ง Dev / QA review

### 2.2 อัปเดต PRD ตาม Figma decision ระหว่างวัน

- อัปเดต `02_FEED_MODULE.md` ให้ครอบคลุม Feed more menu แยก Owner และ Viewer/Member
- เพิ่ม rule และ copy สำหรับ `Hide this asset`, `Report Asset`, `Block User`, `Edit asset`, `Mark as sold`, `Delete asset`
- เพิ่ม Report Asset bottom sheet pattern: drag handle, ไม่มี Cancel button, dismiss ได้, submit disabled จนเลือก reason
- อัปเดต `04_ASSET_MANAGEMENT_MODULE.md` ให้ `Mark as sold` จาก Feed เปิด Sale Record Form โดยตรง ไม่ผ่าน Edit Asset
- อัปเดต `15_TRUST_SAFETY_MODULE.md` ให้ Report bottom sheet เป็น rule กลาง
- อัปเดต `00_GLOBAL_RULES_MODULE.md` และ `01_AUTHENTICATION_MODULE.md` สำหรับ Global Login Required Dialog copy และ label rule: dialog ใช้ `Create account`, Auth page ยังใช้ `Sign up`

---

## 3. Figma update ที่ทำเสร็จวันนี้

เต็มอัปเดตหน้าจอ Figma ต่อจาก checklist และ PRD แล้ว โดยงานที่ทำเสร็จในวันนี้มีดังนี้:

- ทำ Feed three-dot menu flow ครบสำหรับ Member ที่เป็น Viewer:
  - Hide this asset
  - Report Asset
  - Block User
- ทำ Feed three-dot menu flow ครบสำหรับ Member ที่เป็น Owner:
  - Edit asset
  - Mark as sold
  - Delete asset
- ทำ Delete asset flow จาก Feed พร้อม confirmation และผลกระทบตาม spec
- ทำ Mark as sold จาก Feed ให้พาไป Sale Record Form ตาม decision ล่าสุด
- ทำ Report Asset bottom sheet จาก Feed พร้อม behavior ตาม spec
- ทำ Hide this asset success, undo และ failure behavior ตาม spec
- ทำ Block User confirmation และ success/error state ตาม spec
- ทำ Feed แบบ Guest และ prototype ให้ Guest กด action ที่ต้อง login แล้วเห็น Global Login Required Dialog ตามเงื่อนไข
- ทำ Global Login Required Dialog เป็น reusable dialog แล้ว
- ทำ Search & Filter ของ Guest แล้ว
- ทำหน้าก่อนเข้าใช้งานระบบสำหรับเลือก Sign in, Sign up หรือเข้าชมแบบ Guest แล้ว
- ทำ bottom sheet แจ้งเงื่อนไขให้กดยอมรับก่อนเข้าใช้งานแล้ว
- ทำหน้า Sign in เพิ่ม `Remember this device for 30 days` แล้ว
- ลาก prototype ของ Feed Guest ครบตาม login-required condition แล้ว

---

## 4. Dev / QA handoff impact

- Dev สามารถใช้ Feed module spec ล่าสุดเป็น reference สำหรับ Owner/Viewer more menu behavior ได้
- QA ต้องเพิ่ม coverage สำหรับ Guest Feed, Global Login Required Dialog, Report Asset bottom sheet, Hide this asset, Block User, Mark as sold และ Delete asset จาก Feed
- UX/Figma ควร annotate ให้ชัดว่า Report ไม่ทำให้ asset หายทันที และ Delete asset ไม่มี Undo
- Auth QA ต้องตรวจ `Remember this device for 30 days` เพิ่มเติมเมื่อ implementation scope ถูกยืนยัน

---

## 5. งานที่ยังค้าง

| งาน | เหตุผลที่ค้าง | Next Step | ผู้เกี่ยวข้อง |
| --- | --- | --- | --- |
| อัปเดต Figma visual/prototype สำหรับ module อื่นนอกจาก Feed/Search/Auth entry | วันนี้โฟกัส Feed, Guest, Search และ Auth entry เป็นหลัก | ไล่ต่อจาก Asset Detail, Profile, Watch Alert, Notification, Settings | UX |
| ใส่ status จริงของทุก `UX-MF-*` ticket | บาง ticket ถูกทำบางส่วน แต่ยังไม่ครบทุก acceptance gate | อัปเดต status ระดับ ticket หลัง review Figma ทั้งชุด | UX Lead / Product |
| High priority cleanup รอบถัดไป | Must Fix บางส่วนยังต้อง cross-check กับทุก screen | แตก High เป็น ticket matrix หลังตรวจ Figma รอบแรก | Product / UX / QA |
| Dev / QA sign-off | ต้องรอ Figma cleanup status และ prototype review | Dev อ่าน `README_MODULE_INDEX.md`; QA ใช้ `QA_TEST_SCENARIO_CHECKLIST.md` | Tech Lead / QA Lead |

---

## 6. Recommended work sequence ต่อจากนี้

1. Review Figma Feed prototype เทียบ `02_FEED_MODULE.md`
2. ตรวจ Guest login-required entry points ใน Feed และ Search ให้ครบ
3. ไล่ต่อ Watch Alert guest restriction และ notification destination
4. ตรวจ Asset Detail / Profile ว่า Owner/Viewer state ตรงกับ visibility matrix
5. อัปเดต `FIGMA_UX_CLEANUP_TASK_BREAKDOWN.md` เป็น status จริงหลัง review

---

## 7. สรุปสำหรับส่งบริษัท

วันนี้อัปเดต Figma ฝั่ง Feed และ Guest flow ได้คืบหน้าชัดเจน โดยทำ flow จุดสามจุดบน Feed ครบทั้งมุม Viewer/Member และ Owner ครอบคลุม Hide this asset, Report, Block User, Edit asset, Mark as sold และ Delete asset พร้อมทำ Global Login Required Dialog และ prototype เงื่อนไขของ Guest ใน Feed แล้ว

นอกจากนี้ทำ Search & Filter สำหรับ Guest, หน้าก่อนเข้าใช้งานระบบ, bottom sheet ยอมรับเงื่อนไขก่อนเข้าใช้งาน และเพิ่ม `Remember this device for 30 days` ในหน้า Sign in แล้ว เอกสาร PRD ที่เกี่ยวข้องถูกอัปเดตให้ตรงกับ decision ระหว่างทำ Figma วันนี้แล้ว
