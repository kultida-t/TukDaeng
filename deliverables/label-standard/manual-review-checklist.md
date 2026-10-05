# Manual Review Checklist — Label/Language Standard (PVR-004)

ใช้ checklist นี้ตอน review แต่ละ module/จอใน series ถัดไป และตอน normalize label ตาม `docs/bo-canonical-label-table.md`

## A. Language layering

- [ ] Nav module/sub labels เป็น English และตรง `navGroups` ทุกตัว (ไม่มี alias เช่น `Alert List`/`Catalog`)
- [ ] Page title / modal title / drawer title เป็น English noun phrase ตาม pattern `<Entity> Detail` / `<Verb> <Entity>` / `Confirm <Verb> <Entity>`
- [ ] Detail head เป็น `<ID> : <Display Name>` + status pills
- [ ] Breadcrumb เป็น `<Section TH> / <Module EN> / [<Sub EN>] [/ <Detail type> / <ID>]`
- [ ] Action buttons เป็นภาษาไทย และตรง canonical label ในตาราง §2 เท่านั้น (ไม่มีปุ่มที่ประดิษฐ์นอกตาราง)
- [ ] Field labels / helper / empty / error / filter copy เป็นไทย
- [ ] Status/risk/channel pills + technical keys (`Option Key`, `Group Key`, `Role ID`, `Event ID`) เป็น English
- [ ] aria-label/title ตรง visible label (ไม่มี `aria-label="Back"` คู่ visible `กลับไป …`)
- [ ] Locked exceptions คงเดิม: nav sections ไทย, auth screens English stylized, sidebar `Logout`, `Back to Option Groups`, `Test flow` harness

## B. Button/action correctness

- [ ] Confirm modal primary = `ยืนยัน` (ไม่ซ้ำ action ใน label)
- [ ] Cancel = `ยกเลิก`; close/dismiss result = `ปิด` — ไม่ใช้ `Cancel`/`Close`/`×` English
- [ ] Page back = `กลับไป <destination>`; step-back ใน modal flow = `ย้อนกลับ` — ไม่สลับกัน
- [ ] Row action menu ใช้ `ดูรายละเอียด`; view entity เฉพาะใช้ `ดู <Entity>`
- [ ] Destructive confirm ใช้ type-to-confirm pattern `พิมพ์ <word> เพื่อยืนยันการลบ` ตามเดิม
- [ ] Link = นำทาง, Button = action ที่กระทบข้อมูล (ไม่ใช้ปุ่มเพื่อเปิดหน้า)
- [ ] ปุ่ม disabled/unavailable มี explanation ชัดเจน ไม่คลิกแล้วเงียบ

## C. Protected/contract compliance

- [ ] เช็คจออยู่ใน `PROTECTED_SCREENS.md`/`AGENTS.md` หรือไม่ — ถ้า protected ต้องมี approval ก่อนแก้
- [ ] เทียบกับ `docs/bo-navigation-naming-contract.md` + `docs/bo-modal-empty-state-contract.md` — ถ้า canonical table ขัดของที่ confirm แล้ว ชี้แจ้งก่อนแก้
- [ ] Deviation ที่พบให้บันทึกลง §4 ของ canonical table (เพิ่ม row D#) ไม่แก้ทันทีนอก scope
- [ ] Internal keys ไม่ rename ตาม display label (permission key/list key/body mode class คงเดิม)

## D. Visual/responsive

- [ ] Button label ไม่ล้นกรอบทั้ง 390px/768px/1280px/1440px
- [ ] Modal footer order `ยกเลิก → ยืนยัน` และ keyboard flow ตาม modal contract
- [ ] Select/filter label ellipsis ได้ ไม่ตัดกลางคำ

## E. Evidence ที่ต้องเก็บตอน review

- [ ] Screenshot ทุก surface ที่มี label ใหม่/เปลี่ยน (desktop + mobile ถ้าเกี่ยว)
- [ ] บันทึก row ใน §4 ของ canonical table สำหรับ deviation ที่พบ
- [ ] อัปเดต `inventory.md`/`inventory.json` ด้วย `node Prototypes/scan-labels.mjs` หลัง normalize แล้วเทียบ count
