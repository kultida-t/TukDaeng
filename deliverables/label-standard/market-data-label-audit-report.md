# Market Data Label Audit Report — รายงานผลการตรวจสอบ Label เทียบ Canonical Table

**เอกสารผลการตรวจสอบภายใต้ Mission 2 (MKD-001):** ตรวจสอบและ Normalize Label หน้าจอ Market Data ตามมาตรฐาน  
**วันที่ตรวจสอบ:** 02 ตุลาคม 2026  
**สถานะ:** Audit Complete (Read-only — ไม่มีการแก้ไขโค้ดในรอบนี้)  
**แหล่งอ้างอิงมาตรฐาน:** `docs/bo-canonical-label-table.md` (Confirmed 02/10/2026), `BackOffice/BO_UI_UX_STANDARD.md`  
**ไฟล์เป้าหมายที่ตรวจสอบ:** `Prototypes/bo-prototype.html` (บรรทัด ~36290–38000 และ ~39285–39328)  
**ขอบเขตหน้าจอที่ครอบคลุม:**
1. **3 หน้าหลัก:** Market Overview, Brands & Models, Sync History
2. **3 หน้าย่อย (Drill-down):** Brand Detail (All Models), Model Detail (All References), Sync Detail (Sync Log Record), Reference Detail Drawer
3. **2 โมดอล:** Market Sync Modal (ครบทั้ง 4 สถานะ: Confirm, Running, Success, Error), Market Management/Audit Modal (Read-only Phase 1 notice & Audit Trail)

---

## 1. บทสรุปผู้บริหาร (Executive Summary)

จากการสแกนและตรวจสอบ User-Facing Labels ทั้งหมดของโมดูล **Market Data** ในไฟล์ `Prototypes/bo-prototype.html` พบองค์ประกอบ UI ทั้งสิ้น **81 รายการ** (แบ่งเป็นปุ่ม 21, หัวข้อ/ชื่อโมดอล 20, ลิงก์ 1, ช่องกรอก/ค้นหา 14, แอททริบิวต์ Accessibility 8, ป้ายกำกับ/ตัวนับ 5, และข้อความคอนฟิก 12)

### สรุปผลการประเมินตามกฎ 2 ชั้น (Language Layering):
- **ชั้นโครงสร้าง (Structure Layer — English):** มีความสอดคล้องกับมาตรฐานสูงมาก (PASS) ได้แก่ ชื่อเมนูนำทาง (`Market Data`), หน้าย่อย (`Market Overview`, `Brands & Models`, `Sync History`), Breadcrumbs, Status Pills (`Completed`, `Failed`, `Running`, `Ready`), และ Modal Title (`Sync Market Data`, `Audit Trail`)
- **ชั้นเนื้อหา (Content Layer — ภาษาไทย):** พบ **ข้อเบี่ยงเบน (Deviations) รวม 20 จุด** ที่ยังคงใช้ภาษาอังกฤษหรือ aria-label ไม่สอดคล้องกับ visible text ซึ่งตรงกับรายการค้างในทะเบียนกลาง (D1, D2, D3, D11, D12) และต้องนำเสนอขออนุมัติใน Task MKD-002 ก่อนดำเนินการแก้ไขใน MKD-003

---

## 2. รายการข้อเบี่ยงเบนจำแนกตามหมวดหมู่ (Detailed Deviations)

### หมวดที่ 1: Action Buttons ใน Market Sync Modal (D1 & D12) — 7 ตำแหน่ง
Market Sync Modal เป็นโมดอลหลักในการซิงก์ข้อมูลจาก API upstream มี 4 สถานะ แต่ปุ่มดำเนินการยังใช้ภาษาอังกฤษทั้งหมด:

| บรรทัด | สถานะของ Modal | Label ปัจจุบัน | Proposed Canonical Label | อ้างอิง Canonical Table §2 | Deviation Code |
|---|---|---|---|---|---|
| 37828 | Confirm | `Cancel` | `ยกเลิก` | Cancel — modal secondary | **D1** |
| 37828 | Confirm | `Start Sync` | `เริ่ม Sync` | Sync / Import (Market) | **D12** |
| 37829 | Running | `Syncing...` | `กำลัง Sync...` | Sync / Import (Market) | **D12** |
| 37830 | Success | `Close` | `ปิด` | Close — dismiss result | **D1** |
| 37830 | Success | `View Sync History` | `ดู Sync History` | View — entity เฉพาะ | **D3 / D12** |
| 37831 | Error | `Close` | `ปิด` | Close — dismiss result | **D1** |
| 37831 | Error | `Retry Failed Datasets` | `ลองใหม่เฉพาะชุดที่ล้มเหลว` | Retry — ลองอีกครั้ง | **D12** |

*หมายเหตุ: คำว่า `Sync` และ `History` อนุญาตให้คงรูปทับศัพท์ภาษาอังกฤษตามกฎ Technical Keys/System Terms*

---

### หมวดที่ 2: Row Actions ในตารางรายการ (D2) — 3 ตำแหน่ง
ปุ่มลูกศรเปิดดูรายละเอียดในแถวตารางยังใช้ภาษาอังกฤษคำสั้น:

| บรรทัด | หน้าจอ / ตาราง | Label ปัจจุบัน | Proposed Canonical Label | อ้างอิง Canonical Table §2 | Deviation Code |
|---|---|---|---|---|---|
| 36429 | Brands & Models (ตารางแบรนด์) | `View` | `ดูรายละเอียด` | View detail — row/menu | **D2** |
| 36705 | Brand Detail (ตารางโมเดล) | `View` | `ดูรายละเอียด` | View detail — row/menu | **D2** |
| 36446 | Sync History (ตาราง Sync Log) | `Detail` | `ดูรายละเอียด` | View detail — row/menu | **D2** |

---

### หมวดที่ 3: Action Buttons และ Template Links (D3 & D12)
ปุ่มดูประวัติ Audit และการตรวจสอบส่วน Import Template:

| บรรทัด | ตำแหน่ง / ฟังก์ชัน | Element | Label ปัจจุบัน | Proposed Canonical Label | สถานะบนหน้าจอจริง | Deviation Code |
|---|---|---|---|---|---|---|
| 36809 | `renderMarketManagementActions` | `<button>` | `Audit trail` | `ดู Audit Trail` | แสดงบนหน้าจอจริง (หน้ารายละเอียด Reference) | **D3** |
| 36942 | `renderMarketImportGuide` | `<a>` | `Download CSV Template` | `ดาวน์โหลด CSV Template` | **ไม่มีบนหน้าจอจริง** (เนื่องจากระบบล็อกเป็น Phase 1 Read-only อนุญาตเฉพาะ action "audit" จึงไม่มีปุ่มเปิดส่วน Import นี้) | **D12 (Dead Code / Future Phase)** |

---

### หมวดที่ 4: Accessibility & aria-label Mirroring (Rule 4 / D11) — 4 ตำแหน่งหลัก
ตามกติกาย่อยข้อ 4 ของ Canonical Table: `aria-label` ต้อง mirror ข้อความที่มองเห็น (visible text) หรือปลายทางภาษาไทย:

| บรรทัด | Element / ฟังก์ชัน | aria-label ปัจจุบัน | Visible Text / Context | ปัญหาที่พบ | Proposed Canonical aria-label | Deviation Code |
|---|---|---|---|---|---|---|
| 20637 (เรียกที่ 37518, 37553, 37730) | `renderPageBackButton` (ปุ่มกลับหน้าก่อน) | `aria-label="Back"` | Tooltip: `กลับไป <ปลายทาง>` | Hardcoded เป็นภาษาอังกฤษ "Back" ไม่ mirror visible tooltip | `aria-label="${label}"` (เช่น `กลับไป Brands & Models`, `กลับไป Rolex`, `กลับไป Sync History`) | **D11** |
| 36429 | ปุ่มแถวแบรนด์ | `aria-label="View ${brand.name} models"` | `View` (เสนอแก้เป็น `ดูรายละเอียด`) | ภาษาอังกฤษ ไม่ mirror visible label ภาษาไทย | `aria-label="ดูรายละเอียดโมเดล ${brand.name}"` | **Rule 4** |
| 36705 | ปุ่มแถวโมเดล | `aria-label="View ${model.name} references"` | `View` (เสนอแก้เป็น `ดูรายละเอียด`) | ภาษาอังกฤษ ไม่ mirror visible label ภาษาไทย | `aria-label="ดูรายละเอียดเลขอ้างอิง ${model.name}"` | **Rule 4** |
| 36446 | ปุ่มแถว Sync Log | `aria-label="View sync log for ${getMarketSyncTitleLabel(row)}"` | `Detail` (เสนอแก้เป็น `ดูรายละเอียด`) | ภาษาอังกฤษ ไม่ mirror visible label ภาษาไทย | `aria-label="ดูรายละเอียดประวัติการ Sync ${getMarketSyncTitleLabel(row)}"` | **Rule 4** |

---

### หมวดที่ 5: ช่องค้นหาและตัวกรอง (Content Layer) — 2 ตำแหน่ง
ช่องค้นหาในหน้า Drill-down ย่อยยังใช้ placeholder ภาษาอังกฤษ ขณะที่หน้าหลักเป็นภาษาไทยแล้ว:

| บรรทัด | หน้าจอ | Placeholder ปัจจุบัน | Proposed Canonical Placeholder | สถานะเปรียบเทียบกับหน้าหลัก |
|---|---|---|---|---|
| 36363 | Brands & Models (หน้าหลัก) | `ค้นหา Brand, Model, Reference` | — | ✅ เป็นไทยถูกต้องตามมาตรฐานแล้ว |
| 36373 | Sync History (หน้าหลัก) | `ค้นหา Sync Job, Endpoint, Result` | — | ✅ เป็นไทยถูกต้องตามมาตรฐานแล้ว |
| 37528 | Brand Detail (All Models) | `Search ${brand.name} models` | `ค้นหา Model ของ ${brand.name}` | 🔴 Deviation (English placeholder) |
| 37563 | Model Detail (All References) | `Search ${model.name} references` | `ค้นหา Reference ของ ${model.name}` | 🔴 Deviation (English placeholder) |

---

### หมวดที่ 6: Empty States ในตารางรายการ — 5 ตำแหน่ง
ข้อความเมื่อไม่พบข้อมูลในตารางยังเป็นภาษาอังกฤษ (Content Layer ควรเป็นภาษาไทย):

จากการตรวจสอบเทียบกับเอกสารสัญญา **`docs/bo-modal-empty-state-contract.md` Contract D (Empty-State Copy)** พบว่า:
- มาตรฐานกลาง (Canonical Standard) ของหน้ารายการ (list/table area) กำหนดให้ใช้ Title เป็นคำกลางคำเดียวคือ **`ไม่พบข้อมูล`** (สอดคล้องกับตารางส่วนใหญ่ของทั้งระบบ เช่น User List, Asset List, Articles, Categories, Delivery Logs)
- ข้อยกเว้นอนุญาตเฉพาะกรณีที่มีความหมายธุรกิจเฉพาะส่วนบุคคล เช่น `ยังไม่มีประวัติการเปลี่ยนแปลง` หรือ `ยังไม่มีการแสดงความคิดเห็น`

จึงเสนอ 2 แนวทางเพื่อนำเสนอขออนุมัติใน Task MKD-002:

| บรรทัด | บริบท | ข้อความปัจจุบัน | แนวทาง A: มาตรฐานกลางระบบ (Contract D — แนะนำ) | แนวทาง B: แปลเฉพาะหน้าตามบริบทเดิม |
|---|---|---|---|---|
| 36431 | ไม่พบข้อมูลแบรนด์ | `No brands found` | **`ไม่พบข้อมูล`** | `ไม่พบข้อมูลแบรนด์` |
| 36586 | ไม่พบข้อมูล Sync Log | `No sync logs found` | **`ไม่พบข้อมูล`** | `ไม่พบประวัติการ Sync` |
| 36707 | ไม่พบโมเดลในแบรนด์นี้ | `No models found for this brand` | **`ไม่พบข้อมูล`** | `ไม่พบโมเดลสำหรับแบรนด์นี้` |
| 36740 | ไม่พบเลขอ้างอิงในรุ่นนี้ | `No references found for this model` | **`ไม่พบข้อมูล`** | `ไม่พบเลขอ้างอิงสำหรับรุ่นนี้` |
| 36837 | ไม่พบรายการ Audit | `No audit events for this target yet` | **`ยังไม่มีประวัติ Audit สำหรับรายการนี้`** | `ยังไม่มีประวัติ Audit สำหรับรายการนี้` |

*ข้อเสนอแนะ: ใน MKD-002 แนะนำให้เลือก **แนวทาง A (`ไม่พบข้อมูล`)** สำหรับ 4 ตารางรายการ เพื่อความเป็นเอกภาพและตรงตาม Contract D ทั้งระบบ และใช้ข้อความเฉพาะเจาะจงเฉพาะในส่วน Audit History (L36837)*

---

## 3. รายการที่สอดคล้องตามมาตรฐานแล้ว (Canonical Compliant — ไม่ต้องแก้ไข)

1. **Navigation Structure (ชั้นโครงสร้าง):**
   - Section Header: `การดำเนินงาน` (ข้อยกเว้นถาวรตาม contract C.6)
   - Module Name: `Market Data` (English ตาม navGroups)
   - Submenu Names: `Market Overview`, `Brands & Models`, `Sync History` (English ตาม navGroups)
2. **Breadcrumbs:**
   - รูปแบบถูกต้องตาม Contract: `การดำเนินงาน / Market Data / <Submenu> [/ <Detail> / <ID>]`
3. **Status Pills:**
   - Token ภาษาอังกฤษทั้งหมดตาม §3.3: `Completed`, `Failed`, `Running`, `Ready`, `Syncing`, `Needs Review`, `Reviewing`, `Needs Mapping`, `Open`, `Active`, `Inactive`, `Draft`
4. **Modal Titles:**
   - `Sync Market Data` (ถูกต้องตามรูปแบบ `<Verb> <Entity>`)
   - `Audit Trail` (ถูกต้องตามรูปแบบ `<Entity> Detail`)
   - Close Icon Button: มี `aria-label="ปิด"` ภาษาไทยครบทุกจุด (L37217, L37235, L37607, L37808)
5. **Overview Active Sync Banner (L36306–36333):**
   - ข้อความสถานะและคำอธิบายเป็นภาษาไทยชัดเจน: `การซิงก์ข้อมูลหยุดชั่วคราว`, `กำลังซิงก์เลขอ้างอิงของ Omega`, `ดูรายละเอียดใน Sync History`
6. **Filter Toolbar Controls (L39300–39301):**
   - Toggle: `เปิดตัวกรอง` / `ปิดตัวกรอง`
   - Reset: `รีเซ็ตค่าทั้งหมด` พร้อม `aria-label="รีเซ็ตค่าทั้งหมด"`
7. **Pagination Controls (L36591–36593, L48733):**
   - `ก่อนหน้า`, `ถัดไป`, `แสดง ... จาก ...` ตรงตามมาตรฐานกลาง

---

## 4. สรุปภาพรวมและแผนการส่งต่อให้ MKD-002

| หมวดหมู่ข้อเบี่ยงเบน | จำนวนจุด | ระดับความสำคัญ | แนวทางการดำเนินการใน MKD-002 |
|---|---|---|---|
| **ปุ่มใน Market Sync Modal** | 7 | สูง (High) | นำเสนอแผนปรับเป็นไทยตาม D1 & D12 (`ยกเลิก`, `เริ่ม Sync`, `กำลัง Sync...`, `ปิด`, `ดู Sync History`, `ลองใหม่เฉพาะชุดที่ล้มเหลว`) |
| **Row Actions ในตาราง** | 3 | สูง (High) | ปรับ `View` / `Detail` -> `ดูรายละเอียด` ทั้ง 3 ตาราง |
| **ลิงก์และปุ่ม Action ย่อย** | 2 | ปานกลาง (Medium) | ปรับ `Download CSV Template` -> `ดาวน์โหลด CSV Template`, `Audit trail` -> `ดู Audit Trail` |
| **Accessibility / aria-labels** | 4 | ปานกลาง (Medium) | ปรับ `renderPageBackButton` ให้ mirror destination จริง และปรับ aria-label แถวตารางเป็นไทย |
| **Search Placeholders** | 2 | ปานกลาง (Medium) | ปรับ `Search ...` ในหน้ารายละเอียดเป็น `ค้นหา ...` |
| **Empty States** | 5 | ต่ำ (Low) | ปรับข้อความว่างในตารางเป็นภาษาไทยเพื่อความเป็นเอกภาพ |
| **รวมทั้งหมด** | **23 จุด** | | รวบรวมเป็น Action Plan เพื่อขออนุมัติปลดล็อกแก้ไขใน Task MKD-002 |

---
*จัดทำโดย: Matem (Devin CLI Agent) — วันที่ 02/10/2026*
