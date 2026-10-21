# FSP-007 Evidence — ลบ Offer Refs ในเอกสารกลาง + Checklists + Use Cases (RL-02)

**Date:** 21 Oct 2026
**Task:** FSP-007 (`bb40c0e4`) — Remove Offer scope เหลือนอก module specs
**Source of truth:** `Prototypes/fo-flow/index.html` (read-only — ไม่ถูกแตะ)

---

## 1. Scope ที่ทำ

ลบ Offer references ทั้งหมดที่ค้างอยู่นอก `*MODULE*.md` (module specs สะอาดแล้วจาก FSP-006 — ไม่ได้แตะซ้ำ)

**Initial inventory (ก่อนแก้):** 412 matches ใน 11 ไฟล์ (`grep -i offer` เฉพาะ `FrontOffice/`)

## 2. ไฟล์ที่แก้ (11 ไฟล์)

| ไฟล์ | สิ่งที่ลบ/แก้ |
| --- | --- |
| `TukDaeng_Master_Product_Definition.md` | ลบ `### Offer` section (Rules + Offer Flow), `Make Offer` จาก feature lists 3 จุด, `Offer Card`, Offer notification type + destination rows 4 แถว, `Offer เป็น Cancelled`/`Auto Reject` lifecycle rules, `สร้าง Chat หรือ Offer ใหม่` → `สร้าง Chat ใหม่`, `เสนอราคา` จาก user capability 2 จุด |
| `Use_Cases.md` | ลบ UC-DETAIL-002 (ส่ง Offer), UC-CHAT-004 (ตอบรับ/ปฏิเสธ Offer), UC-CHAT-006 (Decline Offer จาก Incoming Offers), UC-ALERT-002 (ตอบสนอง Notification Offer) ทั้ง use case; ลบ `Make an Offer` button, `Incoming Offers` tab, Pending Offer error rows (UC-ASSET-003 Error Cases ทั้งตาราง + E09 ของ UC-ASSET-004), offer clause ใน Delete Account; แก้ Concurrency Test example + role note `ซื้อ/เสนอราคา` → `ซื้อ` |
| `QA_TEST_SCENARIO_CHECKLIST.md` | ลบ `# 8. Offer` section (QA-OFFER-001-012) ทั้งก้อน + offer preconditions 2 รายการ + Offer notification destinations 4 แถว + sign-off matrix row; `QA-CHAT-004` retitle เป็น `Block Prevents New Chat`; `QA-INT-004` reword เป็น Asset flow/purchase; ลบ `, Offer` จาก supported types / settings baseline; renumber section 9-16 → 8-15 |
| `DEV_IMPLEMENTATION_CHECKLIST.md` | ลบ `# 8. Offer` section ทั้งก้อน (รวม lifecycle states Pending/Accepted/Rejected/Cancelled/Paused/Invalidated) + Offer notification destinations 6 รายการ + `Offer Card` + `Chat/Offer` ใน block/delete rules; renumber section 9-19 → 8-18 |
| `DEV_CHAT_IMPLEMENTATION_CHECKLIST.md` | ลบ required-file row `08_OFFER_MODULE.md`, `Offer Card`/`Incoming Offers` scope, `# 6. Offer Integration` section ทั้งก้อน, offer status rules ใน Deleted/Sold section, Offer notification routing, offer analytics events 3 รายการ, offer QA/gap-list items; renumber section 7-15 → 6-14 |
| `Figma_Gap_Checklist_Against_Master.md` | ลบ `### 08 Offer Module` section ทั้งตาราง (เลข 08 หลุดตาม module file ที่ถูกลบใน FSP-006), Offer destination rows, `Offer Card` attachment, Offer ใน guest/login/notification baseline |
| `FIGMA_UX_CLEANUP_TASK_BREAKDOWN.md` | ลบ `08_OFFER_MODULE.md` จาก Task Group table, Wave 3 title/goal/modules ตัด `Offer`, ลบ offer High bullets 8 รายการ + acceptance items, `Make Offer` ใน guest/show/block lists, `offer/chat` evidence phrases |
| `PRD.md` | ลบ `Make an Offer` button + spec block ทั้งชุด, `Incoming Offers` tab, Offer Card states 3 รายการ, `New Offer` notification row, `เสนอราคา` จาก role table |
| `FO_Functional_PRD.md` | ลบ `### Offer` scope subsection, `## 13. Offer Module` section ทั้งก้อน, `Offer` จาก login-required + notification lists; renumber section 14-19 → 13-18 |
| `DEV_BASELINE_HANDOFF_2026-06-22.md` | ลบ `Offer` จาก section title (`Asset Detail / Offer / Chat` → `Asset Detail / Chat`), `cancel related offers`, `cannot create new offers`, `auto rejects pending offers`, Offer notification type |
| `FINAL_HANDOFF_SUMMARY.md` | ลบ `Make Offer /` จาก Show asset actions decision, Offer notification type, `Chat/Offer` ใน post-block rule, `Offer /` จาก Figma must-fix guidance |

**ไฟล์ใน scope ที่สะอาดอยู่แล้ว (ไม่ได้แตะ):** `README_MODULE_INDEX.md`, `ERROR_STATE_UI_COPY_CATALOG.md`

## 3. Verification ผลลัพธ์

| Check | Command | ผล |
| --- | --- | --- |
| Offer เหลือ 0 | `grep -i offer` ใน `FrontOffice/` | **0 matches** |
| `08_OFFER_MODULE.md` refs | `grep '08_OFFER\|OFFER_MODULE'` | **0 matches** |
| Offer-related terms | `grep -i 'offer\|bid\|ต่อรอง\|ข้อเสนอ\|Incoming\|Decline'` | เหลือเฉพาะ `ต่อรองราคา` ใน `07_CHAT_MODULE.md` (meeting decision: ไม่มี UI ต่อรองราคา/Accept-Reject — consistent) และ `live bidding` ใน `02_FEED_MODULE.md` exclusion list |
| Cross-doc UC/QA refs | `grep 'UC-DETAIL-002\|UC-CHAT-00[46]\|UC-ALERT-002\|QA-OFFER'` | **0 matches** — ไม่มีเอกสารไหนอ้าง ID ที่ลบค้างอยู่ |
| Section numbering | header sweep ทุกไฟล์ที่ลบ section | `DEV_IMPLEMENTATION` 0-18, `DEV_CHAT` 1-14, `QA` 0-15, `FO_Functional_PRD` 1-18 sequential; `Figma_Gap` ตาม module file numbering (07→09 = gap 08 ตาม FSP-006) |
| Module specs ไม่ถูกแตะ | — | ไม่มี `*MODULE*.md` ในรายการไฟล์ที่แก้รอบนี้ (M ที่เห็นใน git status คือ FSP-006 changes ที่ยัง uncommitted) |
| Prototypes ไม่ถูกแตะ | `git status --porcelain Prototypes/` | **ว่าง** |

## 4. Design decisions ที่ทำระหว่างลบ

- `Show` asset: เก็บ `Contact Seller / Chat` ตัดเฉพาะ `Make Offer` (ตาม FSP-005 — Show ยังติดต่อผู้ขายได้จาก Detail/Public Profile entry)
- Block rule: `ไม่สามารถสร้าง Chat หรือ Offer ใหม่` → `ไม่สามารถสร้าง Chat ใหม่` (เก็บ chat-blocking rule)
- Delete Chat: `ไม่ลบหลักฐาน offer/chat history` → `ไม่ลบหลักฐาน chat history` (เก็บ retention rule)
- Asset Deleted/Sold: ลบเฉพาะ offer-impact clauses (`Offer → Cancelled`, `auto reject pending`); เก็บ chat-remains/unavailable-state rules
- `ไม่มี Payment Gateway ใน V1` ยังอยู่ใน `DEV_IMPLEMENTATION_CHECKLIST` Integrations section (คงไว้เพราะเป็น general V1 boundary)
- UC-ID gaps (DETAIL-002, CHAT-004, CHAT-006, ALERT-002): คงเลขเดิมไม่ renumber เพราะเป็น stable identifiers — ตรวจแล้วไม่มี cross-file references
