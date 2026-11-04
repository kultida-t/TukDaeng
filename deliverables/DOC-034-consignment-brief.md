# DOC-034 — Decision Brief: BO Consignment Data Model

| รายการ | ข้อมูล |
|---|---|
| Date | 2026-11-04 · Asia/Bangkok |
| Task | DOC-034 [`1c51d594`] — decision brief: ตัดหรือเก็บ Sale + Consignment ใน BO data model |
| Status | **✅ APPROVED 2026-11-04 (พี่มาเต็ม) — Option 2** · implement ใน task `b8a33f8b` (DOC-035, bundle เดียว) |
| Gate | ~~เมื่อ owner เลือก option → เปิด implement task ใหม่~~ → เปิดแล้ว `b8a33f8b` · product-level decision ลง `docs/DECISION_LOG.md` §8 ต่อ `DEC-50` (ทำใน implement task) |

## 1. บริบท

- `DEC-50` (owner approved 2026-11-04, implement ใน DOC-033): ตัด consignment ออกจาก **FO** surfaces ทั้งหมด — foot note `สินค้าฝากขาย` TH/EN, `own` flag/`own !== false` ใน data model, `pfoEligible`, manual copy, mock bio (supersede `14_PORTFOLIO` D12 ส่วน copy+flag)
- `BO-DIR-DEC-003` (resolved 2026-11-04): ตัด **binding** Directory↔asset consignment workflow ทั้งหมด — re-decide ตอน Directory activation
- **คำถามที่ยังไม่มี decision:** BO data model ควรมี consignment asset type เหลือไหม — ฝั่ง BO spec ยังมี consignment surface ที่ render จริงใน protected prototype อยู่

**ประเด็นหลัก:** fields เหล่านี้มี counterpart ใน locked prototype (Asset List + Asset Detail อยู่ใน protected screens) — แก้ spec ฝั่งเดียวจะเกิด spec↔prototype mismatch ทันที

## 2. Inventory — consignment surface ที่เหลือใน BO

### 2.1 Module spec — contract (protected module)

`BackOffice/04_ASSET_MANAGEMENT_MODULE.md`:

| จุด | Ref | เนื้อหา |
|---|---|---|
| Context pill | L148 | `Consignment` อยู่ในลิสต์ Moderation/Context pill ของคอลัมน์ Asset Status |
| Filter option | L177 | `Sale + Consignment` เป็นค่าใน Status filter |
| Filter semantics | L182 | อธิบาย `Sale + Consignment` = ตัวเลือกย่อยกรอง asset ประเภท consignment ที่เป็น `Sale` |
| Sensitive fields | L281–283 | `Consignment owner contact` / `Consignment terms` / `Consignment asking price` ใน Related Sensitive Data |
| Portfolio rule | L349 | asset `Consignment` ต้องไม่ถูกนับใน portfolio value / asset value summary |
| Masked fields | L811–812 | `Consignment Owner Contact` = Masked, `Consignment Terms` = Masked/summarized (§22) |
| Acceptance criteria | L897 | `AC-BO-ASSET-008` รวม `Consignment` ในเงื่อนไขไม่นับ portfolio value |

`BackOffice/00_GLOBAL_RULES_MODULE.md`:

| จุด | Ref | เนื้อหา |
|---|---|---|
| Sensitive data list | L443 (§14) | `Consignment contact และ terms` อยู่ในตัวอย่าง sensitive data ที่ต้อง mask เป็น default |

### 2.2 Prototype — `Prototypes/bo-prototype.html` (protected, render จริง)

| จุด | Ref | เนื้อหา |
|---|---|---|
| Filter option | L21316 | `{ value: "Sale:Consignment", label: "Sale + Consignment" }` ใน `filterOptions.assetStatus` |
| Flag predicate | L22348–22350 | `isAssetConsignment()` — hardcode asset `type === "Sale"` + id ∈ {AST-8831, AST-8802, AST-8579, AST-8559, AST-8548} (5 assets) |
| List pill | L21735–21748 | `renderAssetListStatusDisplay()` render `<span class="pill slate">Consignment</span>` |
| Filter matcher | L21753 | `matchesAssetStatusFilter()` รองรับ `"Sale:Consignment"` |
| Price display | L21808, L22352–22361 | `getAssetEnteredPrice()` → asking price map ของ 5 assets |
| Provenance row | L21823, L21831, L22363–22365 | `getAssetProvenanceType()` → `Consignment` vs `Owner (Asset)` — ใช้ทั้ง Asset Detail desc rows **และ** Asset Report Detail desc rows (ข้ามไป module Reported Assets ด้วย) |
| Detail button + modal | L22367–22369, L22371–22447, L22841–22887, L24096 | ปุ่ม `Consignment Details` (แทน `View purchase history`) เปิด modal ที่ render consignor PII: fullName / phone / Line-IG-FB / email / payout method / Consignment Date / Duration 90 days / Asking Price / Commission 5% / Minimum Acceptable Price + note ฝากขาย per asset |
| Search keyword | L23009–23010 | `getAssetListSearchText()` ใส่ `"consignment sale"` ใน search index |
| CSS | L10727, L11304, L15518 | `.asset-consignment-modal-grid` (+ media query) |

### 2.3 Cross-module mock data (ไม่ใช่ consignment render — แค่ asset id เดียวกัน)

5 assets ที่ถูก flag consignment ปรากฏใน surface อื่นในฐานะ asset `Sale` ธรรมดา — **ไม่พึ่ง consignment flag ทำงานต่อได้ปกติถ้าถอด flag:**

- Reported Assets queue: `RPA-831`→AST-8831, `RPA-559`→AST-8559, `RPA-548`→AST-8548 (L19978–19983)
- Reported Comments: `RCO-711`→AST-8802, `RCO-706`→AST-8831 (L18542–18558)
- Watch Alert matched assets: L19406, L19408, L19427–28, L19555
- Market Data mapping queue: `MAP-018`→AST-8579 (L20557, L20760)
- Audit event: `AUD-88201`→AST-8831 (L17763, L18715)

### 2.4 Active dev docs (ไม่ใช่ contract/protected — แต่มีผลต่อ dev)

| ไฟล์ | Ref | เนื้อหา |
|---|---|---|
| `BO_DEV_IMPLEMENTATION_CHECKLIST.md` | L134, L136, L154, L156 | filter `has consignment`, consignment mask ตาม admin access, spec-level filter `consignment` เมื่อ Product ขอ, consignment contact/terms masked in production |
| `BO_UI_UX_STANDARD.md` | L187 | Asset status filter list มี `Sale + Consignment` |

### 2.5 Superseded docs (traceability only — DOC-010 mark แล้ว)

`BO_Spec.md` (L45, L138, L328, L335) · `BO_PRD.md` (L186, L309) · `BO_Spec_Completion_Addendum.md` §8.3 (L488–494: Consignment Center FK / Consignment Date / Consignment Price optional fields, L632) — ไม่ใช่ contract อีกต่อไป cleanup เป็น nice-to-have ไม่ใช่ blocker

### 2.6 ขอบเขตที่ต่าง concept (out of scope)

- **Directory taxonomy "Consignment Center"** (`07_DIRECTORY_MODULE.md` L29, L86; `BO_Spec.md` L328) = venue type ใน Directory เช่นเดียวกับ Repair Shop/Authentication Center — `BO-DIR-DEC-003` ตัดแค่ *binding* ไป asset workflow แล้ว; ตัว taxonomy ตัดสินใหม่ตอน Directory activation
- **FO drawer placeholder row "ศูนย์ฝากขาย/Consignment Center"** (`Prototypes/fo-flow/index.html` L20244, L20655) = placeholder ตาม `BO-DIR-DEC-001` (toast `เร็ว ๆ นี้`) — ไม่ใช่ consignment surface จริง

## 3. Options

### Option 1 — เก็บ BO fields ไว้เป็น dormant spec

ข้อมูล consignment อาจมาจากช่องทางอื่น/อนาคต ไม่กระทบ FO

- ✅ spec↔prototype ยังตรงกัน (ทั้งคู่คง surface ไว้) — zero churn, ไม่แตะ protected screen
- ✅ ถ้า consignment กลับมาใน phase หน้า ไม่ต้อง re-spec/re-render
- ❌ BO prototype แสดง UI ของ feature ที่ **ไม่มี producer ใน V1** — pill/filter/modal + consignor PII ใน mock สื่อว่า feature มีจริง → เสี่ยง dev implement ผิด scope หรือ QA flag
- ❌ ขัดทิศทาง DEC-50 (owner ตัด consignment ทั้ง copy-level ฝั่ง FO — BO ยังเหลือ surface ที่ใหญ่กว่า FO เดิมเสียอีก)

### Option 2 — ตัด consignment ออกจาก BO data model + protected prototype พร้อมกัน

- ✅ ตรงทิศทาง owner ที่เลือกมาแล้ว 2 รอบ: A11 เลือก "ตัด binding ทั้งหมด" (ไม่ใช่แค่ FK-ready), A16 เลือก "ลบออก FO ทั้งหมด" (ไม่ใช่ annotate)
- ✅ data model สะอาด — ไม่มี dead field/dead UI; asset 5 ตัวใน mock กลายเป็น `Sale` ธรรมดา (cross-module refs ทั้งหมดใน §2.3 ทำงานต่อได้ไม่แก้)
- ❌ ต้อง approve แก้ **protected screens** (Asset List + Asset Detail — lock แล้ว) + re-verify หลังแก้
- ❌ blast radius กว้างสุด: spec 2 ไฟล์ + prototype + active docs 2 ไฟล์ (+ superseded 3 ไฟล์ถ้าทำ hygiene) — ต้อง bundle เป็น implement task เดียว
- ⚠️ ต้องตัดสินเพิ่ม: ถ้ามี consignment data จริงในระบบ (production) จะ migrate/เก็บอย่างไร

### Option 3 — คง fields แต่ annotate "ไม่มี producer ใน V1"

pattern legacy contract ที่ถูกตัด (เช่น Directory deferred, provenance excluded note)

- ✅ ไม่แตะ protected prototype เลย — churn น้อยสุด, spec เป็น sole carrier ของ caveat
- ✅ ปิดความเข้าใจผิด "feature นี้มีใน V1" ในเอกสาร
- ❌ UI ใน locked prototype ยัง render consignment จริง — คนดู prototype อย่างเดียว (stakeholder/dev) ไม่เห็น caveat → annotate แก้ doc แต่ไม่แก้สิ่งที่ตาเห็น
- ❌ ต่างจาก precedent: ของอื่นที่ annotate เป็น "deferred" คือ feature ที่ *ยังไม่ได้ build* — consignment build แล้วและเพิ่งถูกตัดออกจาก FO ทั้งหมด

## 4. Recommendation

**Option 2 — ตัดออกจาก BO data model + prototype พร้อมกัน** โดย bundle เป็น implement task เดียว

เหตุผล:
1. Owner direction สอดคล้องกัน 2 ครั้ง (A11 ตัด binding ทั้งหมด / A16 ตัด FO ทั้งหมด) — คง BO consignment surface ไว้ทำให้ BO มี consignment มากกว่า FO ซึ่งผิด logic product
2. Prototype blast radius **กระจุกตัว** — consignment-specific code อยู่ใน §2.2 (~9 จุด ฟังก์ชัน `isAssetConsignment`/`getAssetConsignmentDetails`/filter/pill/modal branch/CSS 1 class); ถอดแล้ว 5 mock assets กลายเป็น `Sale` ปกติ ไม่ต้องแตะ cross-module refs ใน §2.3 เลย
3. ถ้าตัด spec ฝั่งเดียว (ไม่ทำ option 2 เต็ม) → spec↔prototype mismatch ทันที ซึ่งแย่กว่าไม่แก้อะไรเลย

**Fallback:** ถ้า owner ไม่อยากแตะ protected prototype ในรอบนี้ → **Option 3** (annotate no-producer V1) เป็นทางเลือกที่ราคาถูกสุดและยังปิดช่องเข้าใจผิดในเอกสาร — แต่ควรตั้ง task re-visit เมื่อมี re-baseline ของ prototype

ไม่แนะนำ Option 1 (dormant spec เงียบ ๆ) — ต่างจาก option 3 ตรงไม่มีเอกสารบอกว่าไม่มี producer → เสี่ยงสุดที่ dev/QA เข้าใจว่าเป็น scope จริง

## 5. คำถามถึงเจ้าของ

1. **เลือก option ไหน** — (1) dormant spec / (2) ตัด spec+prototype พร้อมกัน / (3) annotate no-producer V1
2. **(ถ้า option 2)** ระบบจริงมี consignment data อยู่แล้วไหม — ถ้ามี: migrate เป็น `Sale` ธรรมดา, เก็บ archive read-only, หรือลบทิ้ง? (ถ้าไม่มี production data เลย → ตอบง่าย ไม่ต้องทำอะไร)
3. **(ถ้า option 2)** 5 mock assets (AST-8831/8802/8579/8559/8548) คงเป็น `Sale` ธรรมดาใช่ไหม — pill `Consignment` หาย, ปุ่มกลับ `View purchase history`, modal กลับ Purchase History มาตรฐาน
4. ยืนยัน **Directory "Consignment Center" taxonomy + FO drawer placeholder อยู่นอก scope** (ตัดสินใหม่ตอน Directory activation ตาม `BO-DIR-DEC-003`/`BO-DIR-DEC-001`)?
5. ยืนยัน **implement task bundle เดียว** (spec `04`+`00` + prototype + mock + `BO_DEV_IMPLEMENTATION_CHECKLIST` + `BO_UI_UX_STANDARD` + superseded hygiene ถ้าต้องการ) ตามที่ task description กำหนด?

## 6. Implementation outline (draft — ทำเมื่อ approve เท่านั้น ห้ามทำใน task นี้)

ถ้า Option 2:
- `BackOffice/04_ASSET_MANAGEMENT_MODULE.md`: ถอด `Consignment` จาก pill list (L148), `Sale + Consignment` จาก filter + semantics (L177, L182), sensitive fields (L281–283), portfolio rule (L349), masked rows (L811–812), `Consignment` จาก AC-BO-ASSET-008 (L897)
- `BackOffice/00_GLOBAL_RULES_MODULE.md`: ถอด L443 จาก §14 sensitive list
- `Prototypes/bo-prototype.html` (ต้อง approve protected): ถอด filter option (L21316), pill branch (L21740), matcher (L21753), `isAssetConsignment` + flag 5 assets (L22348–22350), asking price path (L21808, L22352–22361), provenance type/label branches (L22363–22369), `getAssetConsignmentDetails` (L22371–22447), consignment branch ใน modal (L22845–22868), search text (L23009), CSS `.asset-consignment-modal-grid` (L10727, L11304, L15518)
- `BO_DEV_IMPLEMENTATION_CHECKLIST.md` L134/L136/L154/L156 + `BO_UI_UX_STANDARD.md` L187: sync refs
- Superseded docs: optional hygiene (ไม่บังคับ — mark superseded แล้ว)
- `docs/DECISION_LOG.md` §8: บันทึก decision ใหม่ต่อ `DEC-50` + index §6/§10

ถ้า Option 3:
- `BackOffice/04_ASSET_MANAGEMENT_MODULE.md` + `00_GLOBAL_RULES_MODULE.md` §14: annotate ทุก consignment ref ว่า "ไม่มี producer ใน V1 — legacy contract ตาม DEC-50" (spec-only, ไม่แตะ prototype)
- `BO_DEV_IMPLEMENTATION_CHECKLIST.md` L154: annotate spec-level filter ว่า consignment ไม่ produce ใน V1

## 7. Sign-off — ✅ APPROVED 2026-11-04 (พี่มาเต็ม)

เจ้าของตอบครบทุกข้อใน §5:

| คำถาม | คำตอบ |
|---|---|
| เลือก option | **Option 2 — ตัด consignment ออกจาก BO data model + protected prototype พร้อมกัน** |
| มี production consignment data ไหม | **ไม่มีเลย** → ไม่ต้องทำ data migration |
| Directory "Consignment Center" taxonomy + FO drawer placeholder | **Out of scope** — ตัดสินใหม่ตอน Directory activation ตาม `BO-DIR-DEC-001`/`BO-DIR-DEC-003` (อธิบายแยก 2 concept: asset consignment vs venue type ให้เจ้าของดูแล้ว) |
| การแบ่งงาน | **Bundle implement task เดียว** (spec + prototype + mock data + checklist/UX docs) |

ผลที่ตามมา:
- เปิด implement task **`b8a33f8b`** (DOC-035 — ตัด BO consignment data model + prototype surface bundle) พร้อมขอบเขตการแก้ตาม §6 Option 2
- 5 mock assets (AST-8831/8802/8579/8559/8548) จะกลายเป็น `Sale` ธรรมดา — ถือว่า confirm โดยนิยายจาก Option 2 (pill หาย, ปุ่มกลับ `View purchase history`)
- protected screens ที่ต้องแตะ (Asset List + Asset Detail) — อนุมัติผ่าน sign-off นี้แล้ว
- decision ใหม่ลง `docs/DECISION_LOG.md` §8 ต่อ `DEC-50` ใน implement task
