# 12 BO Help / Support Module

**Version:** `BO-12-v0.2`  
**Date:** 2026-09-03  
**Status:** สเปกปัจจุบัน  
**Platform:** Responsive Web Back Office

## UI Standards And Prototype Reference

เอกสารนี้ต้องใช้ร่วมกับ `00_GLOBAL_RULES_MODULE.md` และยึดรูปแบบหน้าจอ/พฤติกรรมที่ยืนยันแล้วใน `../Prototypes/bo-prototype.html` เป็นมาตรฐานหลัก

ห้ามออกแบบ pattern แยกเองสำหรับ list toolbar, breakpoint, table/card layout, pagination, reset, drill-down, drawer, modal หรือ detail layout ยกเว้นเอกสารนี้ระบุไว้ชัดเจนว่าเป็น override ที่อนุมัติแล้ว

หมายเหตุ prototype: หน้าจอ Policy & Versioning และ Support Center ถูกสร้างและยืนยันใน `../Prototypes/bo-prototype.html` แล้ว ภายใต้เมนู Settings > Policy & Versioning และ Settings > Support Center ตามลำดับ

เอกสารอ้างอิง: `../FrontOffice/13_SETTINGS_MODULE.md`

## 1. Document Information

| Field | Detail |
| --- | --- |
| Module Name | BO Help / Support |
| Platform | Responsive Web Back Office |
| Version | `BO-12-v0.2` |
| Status | สเปกปัจจุบัน |
| Owner | Product / UX / Engineering / Operations |
| Document Type | Functional PRD |

## 2. Objective

Help / Support Module ใช้สำหรับให้ Admin จัดการเนื้อหาเอกสารกฎหมาย (Terms of Use, Privacy Policy) และข้อมูลช่องทางติดต่อ support ที่แสดงใน FO Settings > Help โดยทั้งสองส่วนนี้เป็น submenu ภายใต้เมนู Settings ของ BO

โมดูลนี้ประกอบด้วย 2 sub-module:

1. **Policy & Versioning** — จัดการเนื้อหา Terms of Use และ Privacy Policy แบบ versioned (Draft / Published / Archived) พร้อม bilingual content (TH/EN), change summary, preview และ version history เพื่อให้ FO แสดงเอกสารกฎหมายเวอร์ชันล่าสุดได้ และ Admin สามารถย้อนดูเวอร์ชันเก่าได้
2. **Support Center** — จัดการช่องทางติดต่อ support (LINE, Phone, Email, Facebook, Website), เวลาทำการ และความพร้อมให้บริการ (TH/EN) ที่แสดงใน FO Help screen พร้อม preview ก่อนบันทึก

## 3. Scope

### In Scope

- Policy & Versioning List (Terms of Use, Privacy Policy)
- Policy Detail (ดูเนื้อหาเวอร์ชัน Published, metadata, change summary)
- Policy Editor (สร้าง/แก้ไข Draft, bilingual content TH/EN, formatting toolbar, change summary)
- Policy Publish (เผยแพร่ Draft → Published, เวอร์ชันเดิมกลายเป็น Archived อัตโนมัติ)
- Policy Version History (ดูประวัติทุกเวอร์ชัน, view version, restore archived → Draft)
- Policy Preview (ดูตัวอย่างเนื้อหา Draft 2 ภาษา ก่อนเผยแพร่)
- Support Center edit form (toggle channel Active/Inactive, channel value, description TH/EN, business hours, availability TH/EN)
- Support Center Preview (ดูตัวอย่าง FO Help screen ใน phone frame, สลับภาษา TH/EN)
- Audit log สำหรับ action สำคัญ
- Responsive layout ตาม `00_GLOBAL_RULES_MODULE.md`

### Out Of Scope

- Ticket queue, ticket detail, ticket assignment, priority, SLA tracking (ถูกตัดออกจาก Phase 1)
- Reply history และ internal note (ถูกตัดออกจาก Phase 1)
- Manual ticket creation จาก LINE / Phone / Email (ถูกตัดออกจาก Phase 1)
- About App content management (เป็นหน้าที่ของ FO Settings ไม่ใช่ BO module นี้)
- Approval workflow สำหรับ policy publish (Admin ที่มีสิทธิ์ publish ได้โดยตรง ไม่ต้องอนุมัติหลายขั้นตอน)
- App/API sync dashboard (policy content ส่งไป FO ผ่าน API ปกติ ไม่มี dashboard แยก)
- External CRM integration
- Live chat ระหว่าง Admin กับผู้ใช้

## 4. FO Help State And BO Responsibility

FO Settings > Help ตาม baseline ปัจจุบันเป็นหน้าช่องทางติดต่อ support โดยแสดง:

- Title: `Help`
- Heading: `Contact support`
- Availability: `Available daily`
- Business hours: `09:00 - 22:00 (GMT+7)`
- Contact rows:
  - LINE: `@mrfoxthailand`
  - Phone: `(+66) 80-008-8088`
  - Email: `service@mrfox.com`

FO interaction:

- LINE row เปิด LINE หรือ external link
- Phone row เปิด dialer
- Email row เปิด mail composer
- `Contact support` จาก About route ไป Help screen เดิม

นอกจากนี้ FO Settings ยังมี entry `Privacy Policy` และ `Terms of Use` ที่ผู้ใช้เปิดอ่านเอกสารกฎหมายได้

BO มีหน้าที่จัดการข้อมูลทั้งสองส่วนที่ FO แสดง:

| ส่วนที่ FO แสดง | BO Responsibility | Sub-module |
| --- | --- | --- |
| Help screen — ช่องทางติดต่อ, เวลาทำการ, ความพร้อมให้บริการ | Admin แก้ไขช่องทางติดต่อ, เปิด/ปิดการแสดงผลแต่ละช่องทาง, แก้ไขเวลาทำการและความพร้อมให้บริการ (TH/EN) พร้อม preview ก่อนบันทึก | Support Center |
| Settings entry — Privacy Policy, Terms of Use | Admin แก้ไขเนื้อหา 2 ภาษา (TH/EN), สร้าง Draft, preview, publish เวอร์ชันใหม่ และดู version history | Policy & Versioning |

## 5. Admin Access And Permissions

ระบบใช้ Admin access เดียว โดยตรวจสิทธิ์ตามเมนูและ action ที่ทำ ไม่แยกประเภทบัญชี Admin ในสเปกนี้

| Access Area | Rule |
| --- | --- |
| Module access | Admin ที่มีสิทธิ์เข้าเมนู Settings > Policy & Versioning หรือ Settings > Support Center สามารถดู list, detail, form ได้ |
| Write action — Policy | Create Draft, Save Draft, Preview, Publish, Restore version ต้องตรวจ permission, แสดง confirmation สำหรับ Publish และ Restore และบันทึก audit |
| Write action — Support Center | Save changes ต้องตรวจ permission และบันทึก audit; Preview ไม่ต้องบันทึก audit (เป็นการดูตัวอย่างเท่านั้น) |
| Sensitive data | Policy content และ Support Center contact info เป็นข้อมูลสาธารณะที่ FO แสดงอยู่แล้ว ไม่ต้อง mask |
| Direct URL/API | ต้องตรวจสิทธิ์ที่ route, API และ service layer เสมอ ห้ามพึ่งแค่การซ่อน UI |

## 6. Responsive Layout

| Breakpoint | Width | Layout Rule |
| --- | --- | --- |
| Mobile | `<= 760px` | Policy & Versioning list เป็น card rows พร้อม label/value; Policy Detail/Editor เป็น vertical sections; Support Center form ใช้ single column; modal ต้องไม่ล้นจอ |
| Tablet | `761px - 1365px` | ตารางยังคงอ่านได้; Policy Editor ใช้ sidebar แคบลง; Support Center form ใช้ 2-column field row ได้ |
| Desktop | `> 1365px` | Policy & Versioning list เป็น table เต็ม; Policy Editor แสดง sidebar ข้อมูลการแก้ไข; Support Center form ใช้ field row เต็มความกว้าง |

ข้อกำหนดเพิ่มเติม:

- ข้อความ, badge, button และตัวเลขต้องไม่ล้น container
- Policy Editor contenteditable ต้อง scroll ได้เมื่อเนื้อหายาว
- Confirmation modal และ Preview modal ต้อง scroll ได้เมื่อเนื้อหายาว
- Support Center Preview phone frame ต้องขยายได้บน desktop และย่อพอดีจอบน mobile
- ทุกหน้าต้องไม่พึ่ง hover-only action และต้องมี touch target ที่เหมาะกับ mobile

## 7. Policy & Versioning List

เมนู: `Settings > Policy & Versioning`

Breadcrumb: `เครื่องมือ & รายงาน / Settings / Policy & Versioning`

Policy & Versioning List แสดง policy ทั้งหมดในระบบ ใน Phase 1 มีเพียง 2 policy types คือ Terms of Use และ Privacy Policy

> หมายเหตุ: Policy & Versioning List ไม่แสดง summary cards เพราะมี policy เพียง 2 ตัว จำนวนซ้ำซ้อนกับตารางและไม่บอก workload (ตามเกณฑ์ When NOT To Use ใน `BO_UI_UX_STANDARD.md`)

ตาราง Policy & Versioning List:

| Column | ข้อกำหนด |
| --- | --- |
| Policy | แสดง policy type เป็น badge (Terms of Use = blue, Privacy Policy = purple) |
| Description | คำอธิบายสั้น ๆ ของ policy |
| Status | แสดง `Published` เป็น badge green; ถ้ามี Draft อยู่ให้แสดง badge amber `Draft {version}` เพิ่มด้วย |
| Version | เวอร์ชันปัจจุบันที่ Published เป็น badge slate |
| Updated | วันที่/เวลาที่แก้ไขล่าสุด |
| Updated By | ผู้แก้ไขล่าสุด |
| Action | ปุ่ม chevron เปิด Policy Detail |

กฎการแสดงผล:

- Row ทั้ง row และปุ่ม chevron ต้องเปิด Policy Detail ของ policy นั้น
- Mobile ต้องแสดง metadata (Description, Status, Version, Updated, Updated By) ใน card row พร้อม label/value
- ไม่มี search และ filter เพราะมี policy เพียง 2 ตัว
- ไม่มี pagination เพราะแสดงทั้งหมดในหน้าเดียว

## 8. Search & Filters

Policy & Versioning List ไม่มี search และ filter เพราะมี policy เพียง 2 ตัว (Terms of Use, Privacy Policy) การเพิ่ม search/filter จะซ้ำซ้อนและไม่ช่วยให้ค้นหาได้เร็วกว่าการเลื่อนดู

Support Center เป็นหน้า form เดียว ไม่มี list จึงไม่มี search และ filter

## 9. Policy Status Contract

ใช้ status 3 สถานะสำหรับ policy version:

| Status | Meaning | FO Impact |
| --- | --- | --- |
| `Draft` | Admin กำลังแก้ไขเนื้อหาและยังไม่เผยแพร่ | FO ยังแสดงเวอร์ชัน Published เดิม ไม่แสดง Draft |
| `Published` | เวอร์ชันที่เผยแพร่แล้วและ FO แสดงอยู่ | FO แสดงเนื้อหาเวอร์ชันนี้ทันที |
| `Archived` | เวอร์ชันเก่าที่เคย Published แล้วถูกแทนที่ | FO ไม่แสดง แต่ Admin ยังดูและ restore ได้ |

กฎการเปลี่ยนสถานะ:

- เมื่อสร้าง Draft ใหม่: เวอร์ชันปัจจุบันที่ Published ยังคงเป็น Published สถานะของ policy ใน list แสดง `Published` พร้อม badge `Draft {version}` เพิ่ม
- เมื่อ Publish Draft: Draft ใหม่กลายเป็น `Published`, เวอร์ชัน Published เดิมกลายเป็น `Archived` อัตโนมัติ
- เมื่อ Restore Archived version: สร้าง Draft ใหม่จากเนื้อหาเวอร์ชันที่เลือก (ไม่เปลี่ยนสถานะของเวอร์ชันต้นทาง) Admin ต้อง Publish Draft นั้นอีกครั้งเพื่อใช้งาน
- ในเวลาใด ๆ มี `Published` ได้เพียง 1 เวอร์ชันต่อ policy type
- มี `Draft` ได้ไม่เกิน 1 เวอร์ชันต่อ policy type ถ้ามี Draft อยู่แล้ว ปุ่มจะเปลี่ยนจาก "สร้าง Draft เวอร์ชันใหม่" เป็น "แก้ไข Draft"

## 10. Policy Types

ใน Phase 1 ระบบรองรับ 2 policy types ครอบคลุมเอกสารกฎหมายที่ FO Settings แสดง:

| Policy Type | ID | Description | FO Entry |
| --- | --- | --- | --- |
| Terms of Use | `POL-TOU` | เงื่อนไขการใช้งานแพลตฟอร์ม TukDaeng สำหรับผู้ใช้และพันธมิตร | Settings > Terms of Use |
| Privacy Policy | `POL-PP` | นโยบายความเป็นส่วนตัวและการจัดการข้อมูลส่วนบุคคลของผู้ใช้ | Settings > Privacy Policy |

ข้อกำหนด:

- Policy type เป็น fixed list ใน Phase 1 — Admin ไม่สามารถสร้าง policy type ใหม่ได้
- แต่ละ policy type มีเนื้อหา 2 ภาษา (TH/EN) ที่แก้ไขแยกกันได้
- ทั้งสองภาษาต้องกรอกให้ครบก่อน Publish (validation บังคับ)
- Policy ID เป็น stable identifier ที่ FO/API อ้างอิง ห้ามเปลี่ยน

## 11. Policy Detail

เมนู: `Settings > Policy & Versioning > {policy type}`

Breadcrumb: `เครื่องมือ & รายงาน / Settings / Policy & Versioning / {policy type}`

Policy Detail แสดงเนื้อหาเวอร์ชัน Published ปัจจุบันของ policy type ที่เลือก พร้อมข้อมูล metadata และปุ่มเข้า Editor หรือ Version History

### Header

- Page title: ชื่อ policy type (เช่น `TERMS OF USE`, `PRIVACY POLICY`)
- Back button: กลับไป Policy & Versioning List

### Language Tabs

- แสดง tab `ภาษาไทย` และ `English` เพื่อสลับเนื้อหา Published ระหว่าง 2 ภาษา
- tab ที่เลือกแสดงเนื้อหาของภาษานั้น อีก tab ซ่อนไว้

### Content Body

- แสดงเนื้อหาเวอร์ชัน Published แบบ read-only (rendered HTML)
- ถ้ายังไม่มีเวอร์ชัน Published แสดงข้อความ `— ยังไม่มีเวอร์ชันที่เผยแพร่ —` (TH) / `— No published version yet —` (EN)

### Metadata Tiles

| Tile | ข้อกำหนด |
| --- | --- |
| Status | badge `Published` (green) หรือ badge อื่นตามสถานะจริง |
| Version | badge slate แสดงเวอร์ชันปัจจุบัน (เช่น `v1.3`) |
| Updated | วันที่/เวลาที่แก้ไขล่าสุด |
| Updated By | ผู้แก้ไขล่าสุด |

### Change Summary

- แสดงสรุปการเปลี่ยนแปลงของเวอร์ชัน Published ปัจจุบัน
- ถ้าไม่มี แสดง `—`

### Actions

| Action | เงื่อนไขแสดง | พฤติกรรม |
| --- | --- | --- |
| แก้ไข Draft | มี Draft อยู่แล้ว | เปิด Policy Editor ในโหมด edit-draft |
| สร้าง Draft เวอร์ชันใหม่ | ไม่มี Draft | เปิด Policy Editor ในโหมด new-draft |
| ดู Version History | แสดงเสมอ | เปิด Policy Version History |

### Responsive Layout

- Mobile: content body และ metadata tiles เรียงแนวตั้ง; language tabs อยู่บนสุดของ content
- Tablet/Desktop: content body กินพื้นที่หลัก; metadata tiles อยู่ใต้ content

## 12. Policy Editor

เมนู: `Settings > Policy & Versioning > {policy type} / Draft`

Breadcrumb: `เครื่องมือ & รายงาน / Settings / Policy & Versioning / {policy type} / Draft`

Policy Editor ใช้สำหรับสร้างหรือแก้ไข Draft ของ policy version พร้อม rich text editor 2 ภาษา และ change summary

### Header

- Page title: `{policy type} — Draft`
- Back button: กลับไปหน้าก่อนหน้า (ปกติคือ Policy Detail)

### Draft Metadata Tiles

| Tile | ข้อกำหนด |
| --- | --- |
| Policy | badge สีตาม policy type (Terms of Use = blue, Privacy Policy = purple) |
| Version | badge slate แสดงเวอร์ชัน Draft (เช่น `v2.1-draft`) |
| Status | badge amber `Draft` |

### Language Tabs

- แสดง tab `ภาษาไทย` และ `English` เพื่อสลับ editor ระหว่าง 2 ภาษา
- แต่ละ tab มี formatting toolbar และ contenteditable canvas ของตัวเอง

### Formatting Toolbar

toolbar สำหรับจัดรูปแบบเนื้อหาใน contenteditable canvas:

| Tool | พฤติกรรม |
| --- | --- |
| Bold | ตัวหนา |
| Italic | ตัวเอียง |
| Underline | ขีดเส้นใต้ |
| H2 | สลับ heading H2 / paragraph |
| Unordered List | รายการแบบจุด |
| Ordered List | รายการแบบตัวเลข |
| Align Left | จัดชิดซ้าย |
| Align Center | จัดกึ่งกลาง |
| Align Right | จัดชิดขวา |
| Insert Link | เพิ่มลิงก์ (prompt URL, ต้องเป็น `http://` หรือ `https://` เท่านั้น) |

### Content Canvas

- contenteditable สำหรับเนื้อหา TH และ EN แยกกัน
- เนื้อหาต้อง scroll ได้เมื่อยาว
- allowed HTML tags: `P`, `H2`, `H3`, `UL`, `OL`, `LI`, `A`, `STRONG`, `EM`, `BR` — tag อื่นถูก strip ออกอัตโนมัติ
- ลิงก์ต้องเป็น `http://` หรือ `https://` เท่านั้น, เปิดใน tab ใหม่พร้อม `rel="noreferrer noopener"`

### Change Summary Field

- textarea สำหรับอธิบายสิ่งที่เปลี่ยนแปลงในเวอร์ชันนี้
- required — ต้องกรอกก่อน Save Draft หรือ Publish

### Editor Sidebar

- แสดงข้อมูลการแก้ไข: ผู้แก้ไข, วันที่แก้ไข
- คำอธิบาย: กด Preview เพื่อดูตัวอย่าง 2 ภาษา ก่อนเผยแพร่ หรือกด Publish เพื่อเผยแพร่เวอร์ชันนี้ (เวอร์ชันที่เผยแพร่แล้วจะถูกเก็บเป็น Archived อัตโนมัติ)

### Actions

| Action | พฤติกรรม |
| --- | --- |
| บันทึก Draft | บันทึกเนื้อหาและ change summary เป็น Draft (ยังไม่เผยแพร่) แล้วกลับไป Policy Detail |
| Preview | เปิด Policy Preview modal แสดงเนื้อหา 2 ภาษา |
| Publish | ตรวจสอบ validation ก่อน แล้วเปิด Policy Publish confirmation modal |
| ยกเลิก | กลับไปหน้าก่อนหน้า โดยไม่บันทึก |

หลัง Save Draft สำเร็จ:
- แสดง success toast `บันทึก Draft เรียบร้อย`
- กลับไป Policy Detail ของ policy นั้น

### Validation

| Field | Rule |
| --- | --- |
| Content TH | required — ต้องไม่ว่าง |
| Content EN | required — ต้องไม่ว่าง |
| Change Summary | required — ต้องไม่ว่าง |

ถ้า validation ไม่ผ่าน:
- แสดง error message ใต้ field ที่ผิด
- focus ไปที่ field แรกที่ผิด
- ไม่เปิด Publish confirmation modal

### 12.1 Policy Preview Modal

modal แสดงตัวอย่างเนื้อหา Draft 2 ภาษา ก่อนเผยแพร่:

| ส่วน | ข้อกำหนด |
| --- | --- |
| Title | `Preview — {policy type}` |
| Version pill | badge slate แสดงเวอร์ชัน Draft |
| ภาษาไทย | heading `ภาษาไทย` + content body (rendered HTML) |
| English | heading `English` + content body (rendered HTML) |
| Close | ปุ่มปิด modal |

### 12.2 Policy Publish Confirmation Modal

modal ยืนยันการเผยแพร่ Draft เป็น Published:

| ส่วน | ข้อกำหนด |
| --- | --- |
| Icon | checkmark icon |
| Title | `ยืนยันการเผยแพร่` |
| Question | `ต้องการเผยแพร่ {policy type} เวอร์ชัน {version} หรือไม่?` |
| Summary | `เวอร์ชัน {published version} จะถูกเก็บเป็น Archived และเนื้อหาใหม่จะแสดงทันที` |
| Meta | Policy, Version (badge slate), สรุปการเปลี่ยนแปลง |
| ยกเลิก | ปิด modal โดยไม่เผยแพร่ |
| เผยแพร่ | ยืนยันการเผยแพร่ — archive เวอร์ชัน Published เดิม, ส่ง Draft ใหม่เป็น Published, กลับไป Policy Detail |

หลัง Publish สำเร็จ:
- แสดง success toast `เผยแพร่ {policy type} เวอร์ชัน {version} เรียบร้อย`
- กลับไป Policy Detail ของ policy นั้น

### 12.3 Policy Version History

เมนู: `Settings > Policy & Versioning > {policy type} / Version History`

Breadcrumb: `เครื่องมือ & รายงาน / Settings / Policy & Versioning / {policy type} / Version History`

### Header

- Page title: `Version History`
- Back button: กลับไปหน้าก่อนหน้า (ปกติคือ Policy Detail)

แสดงประวัติทุกเวอร์ชันของ policy type ที่เลือก:

| Column | ข้อกำหนด |
| --- | --- |
| Version | badge slate (เช่น `v1.3`, `v2.1-draft`) |
| Status | badge ตามสถานะ (Published = green, Draft = amber, Archived = gray) |
| Updated By | ผู้แก้ไข |
| Updated | วันที่/เวลาแก้ไข |
| Published Date | วันที่/เวลาเผยแพร่ หรือ `—` ถ้าไม่เคย Published |
| Change Summary | สรุปการเปลี่ยนแปลง |
| Action | action menu (chevron) |

### Row Behavior

- Row ทั้ง row และ action menu เปิด Version View modal ของเวอร์ชันนั้น

### Action Menu

| Action | เงื่อนไขแสดง |
| --- | --- |
| แก้ไข Draft | เฉพาะเวอร์ชันที่เป็น Draft |
| ดูเวอร์ชัน | ทุกเวอร์ชัน |
| Restore เป็น Draft | เฉพาะเวอร์ชันที่เป็น Archived |

### Mobile Card

- Mobile แสดง metadata (Status, Updated By, Updated, Published Date, Change Summary) ใน card row พร้อม label/value
- Action menu ยังคงแสดง

### 12.4 Policy Version View Modal

modal แสดงเนื้อหาเวอร์ชันที่เลือกแบบ read-only:

| ส่วน | ข้อกำหนด |
| --- | --- |
| Title | `{policy type} — {version}` |
| Language tabs | `ภาษาไทย` / `English` สลับเนื้อหา |
| Content body | เนื้อหา TH/EN แบบ read-only (rendered HTML) |
| Meta tiles | Status, Version, Updated, Updated By |
| Change Summary | สรุปการเปลี่ยนแปลง หรือ `—` |
| Footer — Restore | ปุ่ม `Restore เวอร์ชันนี้` (เฉพาะ Archived) |
| Footer — Edit Draft | ปุ่ม `แก้ไข Draft` (เฉพาะ Draft) |

### 12.5 Policy Restore Confirmation Modal

modal ยืนยันการ Restore เวอร์ชัน Archived เป็น Draft ใหม่:

| ส่วน | ข้อกำหนด |
| --- | --- |
| Icon | checkmark icon |
| Title | `ยืนยันการ Restore` |
| Question | `Restore เวอร์ชัน {version} เป็น Draft ใหม่ใช่หรือไม่?` |
| Summary | `ระบบจะสร้าง Draft ใหม่จากเวอร์ชันนี้ โดยเวอร์ชันเดิมยังคงอยู่ในประวัติ` |
| Existing draft warning | ถ้ามี Draft อยู่แล้ว แสดง warning `Draft ปัจจุบัน ({draft version}) จะถูกแทนที่โดย Draft ใหม่จากการ Restore` |
| ยกเลิก | ปิด modal โดยไม่ Restore |
| Restore | ยืนยันการ Restore — สร้าง Draft ใหม่จากเวอร์ชันที่เลือก (แทนที่ Draft เดิมถ้ามี), เปิด Policy Editor |

หลัง Restore สำเร็จ:
- แสดง success toast `Restore เวอร์ชัน {source version} เป็น Draft {new version} เรียบร้อย`
- เปิด Policy Editor ในโหมด edit-draft

## 13. Support Center

เมนู: `Settings > Support Center`

Breadcrumb: `เครื่องมือ & รายงาน / Settings / Support Center`

Support Center เป็นหน้า form เดียวสำหรับจัดการช่องทางติดต่อและเวลาทำการที่ FO Help screen แสดง

### Channel List

แสดงช่องทางติดต่อทั้ง 5 ประเภท (fixed list — Admin ไม่สามารถเพิ่ม/ลบ channel type ได้):

| Channel Type | Value Label | Input Type | Format Validation |
| --- | --- | --- | --- |
| LINE | LINE URL | text | `@handle` หรือ URL, สูงสุด 200 ตัวอักษร |
| Phone | เบอร์โทรศัพท์ | text | ตัวเลขและ `+ - ( )` ช่องว่าง, อย่างน้อย 7 หลัก, ไม่เกิน 15 หลัก |
| Email | อีเมล | email | รูปแบบอีเมลมาตรฐาน, สูงสุด 254 ตัวอักษร |
| Facebook | Facebook URL | text | ชื่อเพจหรือ URL, สูงสุด 200 ตัวอักษร |
| Website | Website URL | text | URL หรือโดเมน, สูงสุด 200 ตัวอักษร |

### Channel Row Layout

แต่ละ channel row ประกอบด้วย:

| ส่วน | ข้อกำหนด |
| --- | --- |
| Toggle Active/Inactive | toggle switch เปิด/ปิดการแสดงผลช่องทางนั้น |
| Channel Type + Value | label ชื่อ channel type + input field สำหรับค่า (required เมื่อ Active, disabled เมื่อ Inactive) |
| Description TH | คำอธิบายช่องทางภาษาไทย (optional, สูงสุด 200 ตัวอักษร, disabled เมื่อ Inactive) |
| Description EN | คำอธิบายช่องทางภาษาอังกฤษ (optional, สูงสุด 200 ตัวอักษร, disabled เมื่อ Inactive) |
| Status badge | `Active` (green) หรือ `Inactive` (gray) |

### Business Hours Section

| Field | Rule |
| --- | --- |
| ช่วงเวลา | required, สูงสุด 80 ตัวอักษร, ต้องมี time range รูปแบบ `HH:MM - HH:MM` (เช่น `09:00 - 22:00 (GMT+7)`) |
| ความพร้อมให้บริการ (ไทย) | required, สูงสุด 120 ตัวอักษร |
| ความพร้อมให้บริการ (English) | required, สูงสุด 120 ตัวอักษร |

### Actions

| Action | พฤติกรรม |
| --- | --- |
| Preview | เปิด Support Center Preview modal แสดงตัวอย่าง FO Help screen |
| บันทึกการเปลี่ยนแปลง | ตรวจสอบ validation ก่อน แล้วบันทึกข้อมูล + บันทึก audit |

หลังบันทึกการเปลี่ยนแปลงสำเร็จ:
- แสดง success toast `บันทึกการเปลี่ยนแปลงเรียบร้อย`
- อัปเดต `lastUpdated` และ `lastEditor` ของ SupportCenter
- กลับไป Support Center form (re-render)

### Validation

| Field | Rule |
| --- | --- |
| Channel value (Active) | required + format validation ตาม channel type |
| Channel description TH (Active) | optional, สูงสุด 200 ตัวอักษร |
| Channel description EN (Active) | optional, สูงสุด 200 ตัวอักษร |
| Business Hours | required + format `HH:MM - HH:MM` + สูงสุด 80 ตัวอักษร |
| Availability TH | required + สูงสุด 120 ตัวอักษร |
| Availability EN | required + สูงสุด 120 ตัวอักษร |

ถ้า validation ไม่ผ่าน:
- แสดง error message ใต้ field ที่ผิด
- focus ไปที่ field แรกที่ผิด
- ไม่บันทึกข้อมูล

### 13.1 Support Center Preview Modal

modal แสดงตัวอย่าง FO Help screen ใน phone frame:

| ส่วน | ข้อกำหนด |
| --- | --- |
| Title | `Preview` |
| Language toggle | `ภาษาไทย` / `English` สลับเนื้อหาตามภาษา |
| Phone frame | กรอบโทรศัพท์แสดง FO Help screen |
| FO header | `Help` |
| FO heading | `ติดต่อเรา` (TH) / `Contact support` (EN) |
| FO availability | ความพร้อมให้บริการตามภาษาที่เลือก |
| FO channels | แสดงเฉพาะ channel ที่ Active — icon, channel type, value, description (ตามภาษา) |
| FO business hours | label `เวลาทำการ` (TH) / `Business hours` (EN) + ค่าจาก form |
| Empty state | ถ้าไม่มี channel ที่ Active แสดง `ไม่มีช่องทางที่เปิดใช้งาน` |
| Close | ปุ่มปิด modal |

Preview อ่านค่าจาก form แบบ live (รวมค่าที่ยังไม่ได้บันทึก) เพื่อให้เห็นผลลัพธ์ก่อนกดบันทึก

### Responsive Layout

- Mobile: channel row เรียงแนวตั้ง (toggle, value, description, status); business hours field เรียงแนวตั้ง
- Tablet/Desktop: channel row ใช้ field row เต็มความกว้าง; business hours ใช้ 2-column field row ได้

## 14. Admin Actions

| Action | Sub-module | Requirement | Audit |
| --- | --- | --- | --- |
| Create Draft | Policy & Versioning | ต้องตรวจ permission; ถ้ามี Draft อยู่แล้วให้เปลี่ยนเป็น "แก้ไข Draft" | Required |
| Save Draft | Policy & Versioning | บันทึกเนื้อหา TH/EN และ change summary; validation บังคับ content ทั้ง 2 ภาษาและ change summary | Required |
| Preview Draft | Policy & Versioning | ดูตัวอย่าง 2 ภาษาก่อนเผยแพร่; ไม่บันทึก audit (เป็นการดูตัวอย่างเท่านั้น) | Not required |
| Publish | Policy & Versioning | ตรวจ validation ก่อน, แสดง confirmation modal, archive เวอร์ชัน Published เดิมอัตโนมัติ | Required |
| Restore version | Policy & Versioning | สร้าง Draft ใหม่จากเวอร์ชัน Archived; แสดง confirmation modal; เวอร์ชันต้นทางยังคงอยู่ | Required |
| View version | Policy & Versioning | ดูเนื้อหาเวอร์ชันเก่าแบบ read-only; ไม่บันทึก audit | Not required |
| Save changes | Support Center | ตรวจ validation ก่อน, บันทึก channel values, descriptions, business hours, availability | Required |
| Preview | Support Center | ดูตัวอย่าง FO Help screen ก่อนบันทึก; ไม่บันทึก audit | Not required |
| Toggle channel Active/Inactive | Support Center | เปิด/ปิดการแสดงผลช่องทาง; บันทึกพร้อม Save changes | Required (พร้อม Save) |

## 15. Cross-Module Integration

| Module | Integration |
| --- | --- |
| Dashboard | Policies card แสดง policy count (Published/Draft) และเปิดไป Settings / Policy & Versioning |
| Audit Log | Policy actions (`POLICY_DRAFT_CREATE`, `POLICY_DRAFT_SAVE`, `POLICY_PUBLISH`, `POLICY_ARCHIVE`, `POLICY_RESTORE`) และ Support Center actions (`SUPPORT_CENTER_UPDATE`) บันทึกใน Audit Log module |
| Reports & Analytics | ไม่มี report เฉพาะสำหรับ Help/Support ใน Phase 1 |
| FO Help screen | Support Center data ส่งไป FO Settings > Help ผ่าน API — แสดง channels (Active เท่านั้น), business hours, availability ตามภาษาที่ผู้ใช้เลือก |
| FO Settings — Privacy Policy / Terms of Use | Policy & Versioning data ส่งไป FO Settings ผ่าน API — แสดงเนื้อหาเวอร์ชัน Published ตามภาษาที่ผู้ใช้เลือก |
| Notifications | ไม่มี integration ใน Phase 1 (policy publish ไม่ส่ง notification ให้ผู้ใช้โดยอัตโนมัติ) |

## 16. Audit Requirements

Audit log ต้องบันทึกอย่างน้อย:

- `POLICY_DRAFT_CREATE` — สร้าง Draft ใหม่
- `POLICY_DRAFT_SAVE` — บันทึก Draft (Save Draft)
- `POLICY_PUBLISH` — เผยแพร่ Draft เป็น Published
- `POLICY_ARCHIVE` — archive เวอร์ชัน Published เดิม (เกิดอัตโนมัติพร้อม `POLICY_PUBLISH`)
- `POLICY_RESTORE` — Restore เวอร์ชัน Archived เป็น Draft ใหม่
- `SUPPORT_CENTER_UPDATE` — บันทึกการเปลี่ยนแปลง Support Center (channel values, descriptions, business hours, availability, toggle Active/Inactive)

Audit payload ต้องมี:

- `admin_id`
- `action_type`
- `target_id` — policy ID (เช่น `POL-TOU`, `POL-PP`) หรือ `support-center` สำหรับ Support Center
- `version` — เวอร์ชันที่เกี่ยวข้อง (สำหรับ Policy actions)
- `old_value` / `new_value` สำหรับ field ที่เปลี่ยนแปลง (สำหรับ Support Center)
- `change_summary` — สรุปการเปลี่ยนแปลง (สำหรับ Policy actions)
- `ip_address`
- `user_agent`
- `created_at` เป็น `Asia/Bangkok`

## 17. Error, Empty, Loading States

| State | Requirement |
| --- | --- |
| Policy List ว่าง | ไม่เกิดใน Phase 1 เพราะมี policy คงที่ 2 ตัว แต่ต้องรองรับ graceful empty state ถ้าข้อมูลยังไม่ seed |
| Policy Detail — ไม่มี Published version | แสดงข้อความ `— ยังไม่มีเวอร์ชันที่เผยแพร่ —` (TH) / `— No published version yet —` (EN) แทน content body |
| Policy Editor — validation ไม่ผ่าน | แสดง error message ใต้ field ที่ผิด + focus ไป field แรกที่ผิด |
| Policy Publish — validation ไม่ผ่าน | ไม่เปิด confirmation modal, แสดง error ใน Editor |
| Policy Version History ว่าง | ไม่เกิดใน Phase 1 เพราะมี seed data แต่ต้องรองรับ graceful empty state |
| Policy Version View — content ว่าง | แสดง content body เป็นค่าว่าง ไม่พัง |
| Support Center — validation ไม่ผ่าน | แสดง error message ใต้ field ที่ผิด + focus ไป field แรกที่ผิด |
| Support Center Preview — ไม่มี Active channel | แสดง `ไม่มีช่องทางที่เปิดใช้งาน` ใน phone frame |
| Loading | Skeleton สำหรับ Policy List, Policy Detail, Version History; form skeleton สำหรับ Support Center |
| Permission denied | แสดง error ชัดเจนและไม่โหลดข้อมูล |
| Save ล้มเหลว | เก็บค่าใน form ไม่หาย, แสดง error message, ให้ retry ได้ |
| Publish ล้มเหลว | แสดง error message, ไม่ archive เวอร์ชันเดิม, ให้ retry ได้ |

## Module-Specific Exceptions

ไม่มี

Help / Support ต้องใช้ app shell, navigation, breakpoint, list toolbar, desktop table/grid, mobile card, pagination, reset และ detail ตาม `00_GLOBAL_RULES_MODULE.md` และ `../Prototypes/bo-prototype.html` โดยไม่มี UI/layout override เฉพาะโมดูล

ข้อยกเว้นเฉพาะโมดูล:

- Policy & Versioning List ไม่แสดง summary cards, search, filter และ pagination เพราะมี policy เพียง 2 ตัว (อนุมัติแล้วตาม `BO_UI_UX_STANDARD.md` เกณฑ์ When NOT To Use)
- Support Center เป็น form เดียว ไม่มี list จึงไม่ใช้ list toolbar, table/card, pagination
- Policy Editor ใช้ contenteditable canvas แทน textarea เพราะต้องรองรับ rich text formatting (อนุมัติแล้วเพราะเนื้อหา policy ต้องมี heading, list, link)

## 18. Acceptance Criteria

| ID | Criteria |
| --- | --- |
| AC-BO-SUPPORT-001 | Admin เห็น Policy & Versioning List ใต้เมนู Settings แสดง policy 2 ตัว (Terms of Use, Privacy Policy) ครบคอลัมน์ (Policy, Description, Status, Version, Updated, Updated By, Action) โดยไม่มี summary cards, search, filter และ pagination |
| AC-BO-SUPPORT-002 | Policy Detail แสดงเนื้อหาเวอร์ชัน Published พร้อม language tabs TH/EN, metadata tiles (Status, Version, Updated, Updated By), change summary และปุ่ม (แก้ไข Draft / สร้าง Draft เวอร์ชันใหม่, ดู Version History) |
| AC-BO-SUPPORT-003 | Policy Editor แสดง Draft metadata tiles, language tabs TH/EN, formatting toolbar (Bold, Italic, Underline, H2, UL, OL, Align Left/Center/Right, Insert Link), contenteditable canvas 2 ภาษา, change summary field และ actions (บันทึก Draft, Preview, Publish, ยกเลิก) พร้อม sidebar ข้อมูลการแก้ไข |
| AC-BO-SUPPORT-004 | Policy Editor validation บังคับ content TH, content EN และ change summary ต้องไม่ว่าง; ถ้าไม่ผ่านต้องแสดง error ใต้ field และ focus ไป field แรกที่ผิด |
| AC-BO-SUPPORT-005 | Policy Preview modal แสดงตัวอย่างเนื้อหา Draft 2 ภาษา พร้อม version pill ก่อนเผยแพร่ |
| AC-BO-SUPPORT-006 | Policy Publish confirmation modal แสดง policy type, version, change summary และแจ้งว่าเวอร์ชันเดิมจะถูก Archived; หลังยืนยันต้อง archive เวอร์ชัน Published เดิม, ส่ง Draft เป็น Published, แสดง success toast และกลับไป Policy Detail |
| AC-BO-SUPPORT-007 | Policy Version History แสดงตารางทุกเวอร์ชัน (Version, Status, Updated By, Updated, Published Date, Change Summary, Action) พร้อม row click เปิด Version View modal และ action menu (แก้ไข Draft / ดูเวอร์ชัน / Restore เป็น Draft) |
| AC-BO-SUPPORT-008 | Policy Version View modal แสดงเนื้อหา 2 ภาษาแบบ read-only, metadata tiles, change summary และปุ่ม Restore (Archived) หรือ แก้ไข Draft (Draft) |
| AC-BO-SUPPORT-009 | Policy Restore confirmation modal แสดงยืนยันก่อนสร้าง Draft ใหม่จากเวอร์ชัน Archived; หลังยืนยันต้องสร้าง Draft ใหม่, แสดง success toast และเปิด Policy Editor |
| AC-BO-SUPPORT-010 | Support Center edit form แสดง channel list 5 ประเภท (LINE, Phone, Email, Facebook, Website) พร้อม toggle Active/Inactive, channel value, description TH/EN, status badge และ business hours section (ช่วงเวลา, ความพร้อมให้บริการ TH/EN) |
| AC-BO-SUPPORT-011 | Support Center validation บังคับ channel value (เมื่อ Active) + format validation ตาม channel type, business hours (required + format `HH:MM - HH:MM`), availability TH/EN (required); ถ้าไม่ผ่านต้องแสดง error ใต้ field และ focus ไป field แรกที่ผิด |
| AC-BO-SUPPORT-012 | Support Center Preview modal แสดง FO Help screen ใน phone frame พร้อม language toggle TH/EN, แสดงเฉพาะ channel Active, business hours, availability ตามภาษา และ empty state เมื่อไม่มี Active channel |
| AC-BO-SUPPORT-013 | Support Center Preview อ่านค่าจาก form แบบ live (รวมค่าที่ยังไม่ได้บันทึก) |
| AC-BO-SUPPORT-014 | Audit log บันทึก `POLICY_DRAFT_CREATE`, `POLICY_DRAFT_SAVE`, `POLICY_PUBLISH`, `POLICY_ARCHIVE`, `POLICY_RESTORE` และ `SUPPORT_CENTER_UPDATE` พร้อม payload ครบ (admin_id, action_type, target_id, version/old-new value, change_summary, ip_address, user_agent, created_at) |
| AC-BO-SUPPORT-015 | Help / Support UI ต้อง responsive ที่ 375px, 768px, 1280px และ 1440px |

## 19. Open Decisions

| ID | Decision Needed | Current Recommendation |
| --- | --- | --- |
| SUP-DEC-001 | Policy publish จะส่ง notification ให้ผู้ใช้ทราบหรือไม่ | แนะนำไม่ส่งใน Phase 1 — ผู้ใช้เห็นเวอร์ชันใหม่เมื่อเปิด Settings อ่านอีกครั้ง; ถ้าต้องการแจ้ง ให้เป็น task ใหม่ใน Notification module (Phase 2/future — Broadcast เลื่อนเป็น Phase 2 แล้ว) |
| SUP-DEC-002 | Support Center จะรองรับ channel type นอกจาก 5 ประเภท (LINE, Phone, Email, Facebook, Website) ในอนาคตหรือไม่ | แนะนำ fixed list ใน Phase 1 — ถ้าต้องการเพิ่ม ให้เป็น task ใหม่พร้อมเพิ่ม format validation และ icon |
| SUP-DEC-003 | Policy content จะรองรับ HTML tag นอกเหนือจาก allowed list (P, H2, H3, UL, OL, LI, A, STRONG, EM, BR) หรือไม่ | แนะนำใช้ allowed list ใน Phase 1 — ถ้าต้องการ tag เพิ่ม (เช่น IMG, TABLE) ให้เป็น task ใหม่พร้อมปรับ sanitizer |
| SUP-DEC-004 | Policy version จะเก็บ Archived ไว้ตลอดหรือมี retention policy ลบเวอร์ชันเก่า | แนะนำเก็บตลอดใน Phase 1 เพราะ policy มีเพียง 2 ตัวและเวอร์ชันไม่เยอะ; ถ้าต้องการ retention ให้เป็น task ใหม่ |

## 20. Data Model

### Policy

| Field | Type | ข้อกำหนด |
| --- | --- | --- |
| id | string | stable identifier (เช่น `POL-TOU`, `POL-PP`) — ห้ามเปลี่ยน |
| type | string | policy type label (เช่น `Terms of Use`, `Privacy Policy`) |
| typeLabel | string | display label สำหรับหัวข้อ (เช่น `TERMS OF USE`, `PRIVACY POLICY`) |
| status | enum | `Published` |
| currentVersion | string | เวอร์ชัน Published ปัจจุบัน (เช่น `v1.3`) |
| lastEdited | datetime | วันที่/เวลาแก้ไขล่าสุด |
| lastEditor | string | ผู้แก้ไขล่าสุด |
| publishedDate | datetime | วันที่/เวลาเผยแพร่ล่าสุด |
| draftVersion | string \| null | เวอร์ชัน Draft ปัจจุบัน หรือ `null` ถ้าไม่มี Draft |
| description | string | คำอธิบายสั้น ๆ ของ policy |
| versions | array | รายการ PolicyVersion |

### PolicyVersion

| Field | Type | ข้อกำหนด |
| --- | --- | --- |
| version | string | เวอร์ชัน label (เช่น `v1.3`, `v2.1-draft`) |
| status | enum | `Draft`, `Published`, `Archived` |
| editor | string | ผู้แก้ไข |
| editedDate | datetime | วันที่/เวลาแก้ไข |
| publishedDate | datetime \| null | วันที่/เวลาเผยแพร่ หรือ `null` ถ้าไม่เคย Published |
| changeSummary | string | สรุปการเปลี่ยนแปลง |
| contentTh | string (HTML) | เนื้อหาภาษาไทย (allowed tags: P, H2, H3, UL, OL, LI, A, STRONG, EM, BR) |
| contentEn | string (HTML) | เนื้อหาภาษาอังกฤษ (allowed tags: เหมือน contentTh) |

### SupportCenter

| Field | Type | ข้อกำหนด |
| --- | --- | --- |
| channels | array | รายการ SupportChannel (fixed 5 ประเภท) |
| businessHours | string | ช่วงเวลาทำการ (เช่น `09:00 - 22:00 (GMT+7)`) |
| availabilityTh | string | ความพร้อมให้บริการภาษาไทย |
| availabilityEn | string | ความพร้อมให้บริการภาษาอังกฤษ |
| lastUpdated | datetime | วันที่/เวลาแก้ไขล่าสุด |
| lastEditor | string | ผู้แก้ไขล่าสุด |

### SupportChannel

| Field | Type | ข้อกำหนด |
| --- | --- | --- |
| id | string | stable identifier (เช่น `ch-line`, `ch-phone`) |
| channelType | enum | `LINE`, `Phone`, `Email`, `Facebook`, `Website` |
| label | string | label สำหรับแสดง |
| value | string | ค่าช่องทาง (เช่น `@mrfoxthailand`, `(+66) 80-008-8088`) |
| url | string | URL สำหรับเปิดใน FO (ถ้ามี) |
| active | boolean | สถานะการแสดงผล |
| descriptionTh | string | คำอธิบายภาษาไทย |
| descriptionEn | string | คำอธิบายภาษาอังกฤษ |
