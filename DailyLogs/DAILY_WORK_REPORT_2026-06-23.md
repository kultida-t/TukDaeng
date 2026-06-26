# Daily Work Report: Tuk Daeng

**วันที่:** 2026-06-23  
**ผู้ทำงาน:** Codex handoff continuation  
**โปรเจกต์:** Tuk Daeng  
**Environment ที่ focus:** docs / Figma cleanup handoff / Dev-QA readiness  
**Branch:** `docs-frontoffice-spec-updates-2026-06-16`  
**สถานะ repo ตอนเริ่มวัน:** มี Word input ใหม่ 2 ไฟล์ที่ยัง untracked

---

## 1. สถานะล่าสุดก่อนเริ่มงานวันนี้

งานวันที่ 2026-06-22 ปิด baseline Front Office PRD เป็น `FO-PRD-v1.0` แล้ว และ sync requirement ใหม่เรื่อง required fields ของ `Sale`, `Show`, `Hide` เข้า master/module/checklist เรียบร้อย

งานที่ยังค้างจากรอบก่อนคือการ review Figma จริงตาม work pack โดยเฉพาะ:

- Add/Edit Asset required field matrix
- Asset Detail / Public Profile ว่า `Show` ไม่ถูกสื่อเป็น Sale listing
- การใช้ `Owner Estimated Value (Private)` สำหรับ private valuation และไม่ใช้ `Price` / `Asking Price` กับ `Hide`
- การส่ง Dev baseline ให้ Dev review app เทียบ checklist
- Commit งานเอกสารหลัง review ผ่าน

---

## 2. งานที่ทำวันนี้

### 2.1 Review scope ที่ทำต่อได้ใน repo

ตรวจเอกสารที่เกี่ยวข้อง:

- `DEV_BASELINE_HANDOFF_2026-06-22.md`
- `DailyLogs/DAILY_WORK_REPORT_2026-06-22.md`
- `DEV_IMPLEMENTATION_CHECKLIST.md`
- `FIGMA_UX_CLEANUP_TASK_BREAKDOWN.md`
- `Figma_Gap_Checklist_Against_Master.md`
- `05_ASSET_DETAIL_MODULE.md`
- `06_PROFILE_MODULE.md`
- `QA_TEST_SCENARIO_CHECKLIST.md`

ข้อสรุป: เอกสาร module และ QA checklist มี rule หลักครบแล้ว แต่ `FIGMA_UX_CLEANUP_TASK_BREAKDOWN.md` ยังมี work pack เฉพาะ Add/Edit Asset เป็นหลัก จึงควรเพิ่ม work pack รอบถัดไปสำหรับ Asset Detail / Public Profile เพื่อให้ UX ใช้ตรวจ Figma ได้เป็นชุดงานชัดเจน

### 2.2 Add Figma work pack for Asset Detail / Public Profile

เพิ่ม `Next Figma Work Pack: Asset Detail / Public Profile` ใน `FIGMA_UX_CLEANUP_TASK_BREAKDOWN.md`

สาระสำคัญที่เพิ่ม:

- Viewer/Guest เปิด Asset Detail ได้เฉพาะ `Sale` และ `Show`
- Owner เปิด asset ของตัวเองได้ทุก status: `Sale`, `Show`, `Hide`, `Sold`
- `Show` เป็น public collection/detail ไม่ใช่ marketplace listing
- `Show` ไม่อยู่ใน Feed, Search, Watch Alert Result
- `Show` ทำ Make Offer / Contact Seller / Chat ได้จาก Asset Detail หรือ Public Profile detail entry เท่านั้น
- Public Profile tabs ต้องเป็น `All`, `Sale`, `Show`
- Public Profile `All` แสดงเฉพาะ `Sale` + `Show`
- Viewer/Public ต้องไม่เห็น `Owner Estimated Value (Private)` หรือ private financial fields
- Market Comparison ต้องใช้ `Asking Price` เทียบ Watch Price API Market Price เท่านั้น
- Deep link ของ `Hide`, `Sold`, Deleted หรือ blocked asset ต้องเข้า unavailable / permission state

### 2.3 Review Owner Asset Detail screenshot

ตรวจภาพ `Owner asset detail.png` ซึ่งเป็นมุมมอง Owner ของ Asset status `Sale`

สิ่งที่ตรง baseline:

- แสดง status `SALE`
- มี Owner actions `Edit` และ `Mark as Sold`
- ไม่มี Follow button ของตัวเอง
- มี gallery, title, reference, owner info, description, technical fields, comments และ bottom price/action bar

Gap ที่พบ:

- Product decision ล่าสุดต้องการตอบโต้แบบ IG; comment UI ที่มี reply indent ใต้ comment หลักถือว่าใช้ได้ หากเป็น one-level replies เท่านั้นและไม่มี reply ซ้อนต่อจาก reply
- ภาพ `Owner asset detail 2.png` แสดง replies ใต้ comment หลักหลายรายการในระดับเดียวกัน และไม่เห็น reply ซ้อนใต้ reply; ถือว่าตรง direction ของ IG-style one-level replies
- ภาพ `Owner asset detail 3.png` แสดง collapsed replies ด้วย `View 2 more replies`; ถือว่าใช้ได้หากกดแล้วกาง replies ใต้ comment หลักเดิมเท่านั้น และไม่เปิด thread ซ้อนหลายระดับ
- Gallery แสดง `1 / 3` บน Detail และได้รับการยืนยันว่าเป็นจำนวนรูปของ asset นี้ ไม่ใช่ Figma limit
- Owner-only private fields ไม่จำเป็นต้องอยู่บน Owner Detail หลัก หากเข้าได้จาก `Edit asset` -> `Provenance`; ต้อง annotate ว่า route นี้เป็น Owner-only และห้าม Viewer/Public เข้าถึง
- Bottom price ใช้ได้กับ `Sale` แต่ต้องตรวจ state `Hide` แยกว่าห้ามใช้ Price / Asking Price และต้องใช้ `Owner Estimated Value (Private)` ถ้ามี private valuation
- Prototype / Dev note ยังควรระบุว่าปุ่ม `Reply` บน reply item ต้องไม่สร้าง reply ชั้นที่ 2; หากกดจาก reply ให้ตอบกลับเข้าใต้ comment หลักเดิม หรือ prefill mention เท่านั้น
- `View more replies` ต้องนับและกางเฉพาะ replies ชั้นเดียวใต้ comment หลัก ไม่ใช่จำนวน comment รวมทั้งหมดหรือ thread ซ้อน

### 2.4 Review Edit Asset / Provenance screenshots

ตรวจภาพ `edit asset.png` และ `provenance.png`

สิ่งที่ตรง baseline:

- Edit Asset แสดง gallery เป็น `4 / 10 Photos` ตรงกับ baseline สูงสุด 10 รูป
- มี entry `Provenance` จากหน้า Edit Asset สำหรับข้อมูล private
- Provenance เก็บ Purchase Price, Purchase Date, Purchase From, Equipment & Accessories, Proof of Payment และ Note
- Price field ใน Edit Asset มี note `Only visible when the status is set to "Sale".`

ข้อควรล็อกเพิ่ม:

- `Provenance` ต้องเป็น Owner-only route
- Viewer/Public Asset Detail และ Public Profile ต้องไม่มีทางเห็น Purchase Price, Purchase Date, Purchase From, Proof of Payment หรือ Provenance note
- หาก status เป็น `Hide` ห้ามใช้ Price เป็น listing field และต้องแยก `Owner Estimated Value (Private)` สำหรับมูลค่าส่วนตัว

### 2.5 Version bump for comment model decision

Product lock decision เรื่อง Asset Detail / Social comments:

- รองรับ IG-style one-level replies ใต้ comment หลัก
- `View more replies` ใช้สำหรับกาง replies ชั้นเดียวใต้ comment หลัก
- ไม่รองรับ multi-level nested thread หรือ reply ซ้อนเกิน 1 ชั้น

เนื่องจาก Dev เคยเห็นเอกสารชุด `FO-PRD-v1.0` แล้ว จึง bump baseline เป็น `FO-PRD-v1.1` ใน `DOCUMENT_VERSION.md` และอัปเดต handoff/index/summary ให้ trace กลับได้ว่า `FO-PRD-v1.1` supersede `FO-PRD-v1.0`

---

## 3. Dev / QA handoff impact

- UX มี work pack แยกสำหรับ review Asset Detail / Public Profile ต่อจาก Add/Edit Asset
- Dev สามารถใช้ acceptance gate ชุดใหม่นี้ตรวจว่า implementation ไม่เผย private data และไม่เอา `Show` ไปปนกับ marketplace list surfaces
- QA checklist เดิมรองรับ scenario หลักอยู่แล้ว เช่น `QA-VIS-002`, `QA-VIS-003`, `QA-ASSET-002D`, `QA-DETAIL-005`, `QA-DETAIL-006`

---

## 4. งานที่ยังค้าง

| งาน | เหตุผลที่ค้าง | Next Step | ผู้เกี่ยวข้อง |
| --- | --- | --- | --- |
| Review Figma Add/Edit Asset screen ตาม required field matrix | ต้องมีไฟล์หรือลิงก์ Figma จริง | ตรวจ required indicator, error state และ status switching behavior | UX / Product |
| Review Share sheet / copy link fallback | Asset Detail / Profile ส่วนหลักเสร็จแล้ว เหลือ share fallback state | ตรวจ system share sheet, copy link success และ unavailable/deleted link fallback | UX / Product |
| Review Permission denied / unavailable state | Asset Detail / Profile ส่วนหลักเสร็จแล้ว เหลือ state ตอนเปิด asset ที่ไม่มีสิทธิ์หรือถูกลบ | ตรวจ Hide/Sold deep link by Viewer, Deleted asset deep link และ blocked/unavailable state | UX / Product |
| Commit งานเอกสารรอบ 2026-06-23 | ยังต้องให้ repo owner ยืนยันว่าจะรวม Word input untracked หรือไม่ | Commit เฉพาะ docs update หรือรวมไฟล์ Word ตาม decision | Repo owner |

---

## 5. Recommended work sequence ต่อจากนี้

1. ตรวจ Figma Add/Edit Asset ตาม work pack `2.1`
2. ตรวจ Share sheet / copy link fallback
3. ตรวจ Permission denied / unavailable state
4. หากพบ visual conflict ให้ update `Figma_Gap_Checklist_Against_Master.md` เป็น gap รายข้อ
5. ส่ง Dev baseline handoff ให้ Dev review app เทียบ `DEV_IMPLEMENTATION_CHECKLIST.md`
6. Commit เอกสารเมื่อ review ผ่านและตัดสินใจเรื่องไฟล์ Word input แล้ว

---

## 6. สรุปสำหรับส่งบริษัท

วันนี้ต่อยอด handoff จากวันที่ 2026-06-22 โดยเพิ่ม work pack สำหรับตรวจ Figma รอบ Asset Detail / Public Profile เพื่อปิดความเสี่ยงที่ `Show` จะถูกสื่อเป็น marketplace listing และปิดความเสี่ยง private data leakage จาก `Owner Estimated Value (Private)`, purchase data, provenance, consignment, Sold History และ Portfolio Value Detail

ผลลัพธ์คือ UX/Dev/QA มี checklist ที่ชัดขึ้นสำหรับตรวจว่า Public Profile แสดงเฉพาะ `Sale` + `Show`, `Show` เปิด Detail/Offer/Chat ได้จาก entry point ที่ถูกต้องเท่านั้น, และ Viewer/Public ไม่เห็น private valuation หรือข้อมูลการเงินส่วนตัวของ Owner

---

## 7. End-of-day status update

สถานะท้ายวัน 2026-06-23:

- Baseline ล่าสุดที่ล็อกวันนี้คือ `FO-PRD-v1.1` และ supersede `FO-PRD-v1.0` สำหรับ Dev / QA / Figma
- Asset Detail comment model ถูกเปลี่ยนเป็น IG-style one-level replies แล้ว: มี reply ใต้ root comment ได้, มี `View more replies`, แต่ไม่รองรับ multi-level nested thread เกิน 1 ชั้น
- ยืนยันว่า counter `1 / 3` บน Asset Detail คือจำนวนรูปของ asset นั้น ไม่ใช่ limit; ส่วน limit การเพิ่มรูปยังเป็นสูงสุด 10 รูปตาม Add/Edit Asset
- Owner-only private data เช่น purchase data, provenance, Owner Estimated Value และ Expected Profit ต้องอยู่หลัง Owner-only route เช่น `Edit asset -> Provenance` และห้ามแสดงใน Viewer/Public detail
- เพิ่ม/ยืนยัน trust & safety entry points แล้ว: Report User จาก Profile, Block User จาก Profile, Report User จาก Chat, Block User จาก Chat, Report Asset จาก Asset Detail, Report Comment จาก Asset Detail และ Block User จาก Asset Detail
- อัปเดตเอกสาร module, Dev checklist, QA checklist, Figma gap checklist, baseline/version docs ให้ชี้มาที่ decision ล่าสุดแล้ว
- ยังไม่ได้ commit งานเอกสารรอบนี้

Figma review ที่เสร็จแล้ว:

- Asset Detail - Viewer Mode
- Asset Detail - Guest Mode
- Asset Detail - Owner Mode
- Asset Detail - Show Mode
- Asset Detail - Hide / Sold owner-only state
- Public Profile
- Public Profile tabs: `All`, `Sale`, `Show`
- Owner Profile tabs: `All`, `Sale`, `Show`, `Hide`, `Sold`
- Public Profile asset card / detail entry

ค้างไว้ทำต่อพรุ่งนี้:

1. Review `Share sheet / copy link fallback`
2. Review `Permission denied / unavailable state`
3. ตัดสินใจว่าจะ commit เฉพาะ markdown docs หรือรวม Word input files ที่ยังเป็น untracked ด้วย
