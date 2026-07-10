# Daily Work Report: Tuk Daeng

## Work Date - 2026-06-30

### Focus today

สรุปและล็อก product decision สำหรับ Asset Management, Provenance, Feed error states, confirmation dialogs และ Owner Profile asset quick actions เพื่อให้ Dev ใช้เอกสารเป็น reference ในการปรับ Figma / implementation ต่อได้

### Main working areas

- Feed loading states: แยกกรณี network offline, slow network, API failure, empty feed และ image-level failure ให้ชัดเจน
- Feed image failure: กำหนดให้ข้อมูล card แสดงต่อได้ แม้รูปโหลดไม่สำเร็จ พร้อม placeholder และ retry เฉพาะรูป ไม่ reload ทั้ง Feed
- Add Asset flow: ยืนยัน flow ว่า user กรอก Asset Detail ก่อน แล้วกด Next ไป Provenance step ก่อน final Save / Upload
- Provenance type rule: `Consignment` เลือกได้เฉพาะ Asset status = `Sale`; ถ้า status = `Show` หรือ `Hide` ต้องใช้ `Owner (Asset)` เท่านั้น
- Owner (Asset) provenance: กำหนดให้ `Purchase Price` เป็น required เพราะเป็น cost basis / asset history / portfolio data
- Consignment provenance: แยกข้อมูล consignor, payout, terms, asking price และ documentation ออกจาก Owner purchase history ชัดเจน
- Optional field display: optional private fields ที่ไม่กรอกต้องไม่แสดงเป็น empty/N/A บน public/viewer surfaces และควรซ่อนหรือแสดง owner-only prompt ใน private owner section
- Edit rules: Asset ที่ยังไม่ Sold แก้ Asset / Provenance ได้ตามสิทธิ์และ status; Sold Asset ต้องเป็น read-only ยกเว้น correction/audit flow
- Sale history confirmation: เปลี่ยน copy จาก `Confirm sold out?` เป็น `Save sale history?`
- Edit Asset confirmation: ใช้ `Save changes?` พร้อม body ที่บอกว่าจะ update asset ตาม current status
- Edit Purchase History confirmation: ใช้ `Save purchase history?` และไม่ใช้ body ของ Edit Asset ที่อ้างถึง current status
- Edit Consignment confirmation: ใช้ `Save consignment details?`
- Owner Profile asset card quick action: ตกลงให้มีปุ่ม `...` บนรูป asset card เฉพาะ Owner view เพื่อเข้า quick actions โดยไม่ต้องเปิด Asset Detail ก่อน

### UX decisions locked

- Tap card/image บน Owner Profile asset grid ต้องเปิด Asset Detail
- Tap `...` บน asset card ต้องเปิด quick action menu และต้องไม่ trigger Asset Detail
- ปุ่ม `...` ควรอยู่มุมขวาบนของรูป asset, hit area อย่างน้อย `32x32px`, พื้นหลังดำ/เทาเข้มโปร่ง และแสดงเฉพาะ Owner view
- Public / Visitor Profile ต้องไม่เห็น asset quick action `...`
- Status badge บน asset card:
  - `SALE`: red
  - `SHOW`: blue
  - `HIDE`: neutral/outline
  - `SOLD`: muted or dark red/gray, ไม่ใช้ style เดียวกับ Sale

### Quick action menu by status

| Asset Status | Owner Quick Actions |
|---|---|
| Sale | Edit asset, Edit provenance, Mark as sold, Change status, Delete |
| Show | Edit asset, Edit purchase history, Change status, Delete |
| Hide | Edit asset, Edit purchase history, Change status, Delete |
| Sold | View sale history, View provenance read-only |

### Confirmation copy locked

| Context | Title | Body | Primary |
|---|---|---|---|
| Edit Asset | `Save changes?` | `This will save your changes and update this asset based on its current status.` | `Save` |
| Add Sale History / Mark as Sold | `Save sale history?` | `This will save the sale history, mark this asset as sold, and remove it from Feed, Search, and Watch Alert results.` | `Save sale` |
| Edit Purchase History | `Save purchase history?` | `This will save your changes to this asset's purchase history.` | `Save` |
| Edit Consignment | `Save consignment details?` | `This will save your changes to this asset's consignment details.` | `Save` |

### Documents updated

- `FrontOffice/02_FEED_MODULE.md`
- `FrontOffice/04_ASSET_MANAGEMENT_MODULE.md`
- `FrontOffice/05_ASSET_DETAIL_MODULE.md`
- `FrontOffice/QA_TEST_SCENARIO_CHECKLIST.md`
- `FrontOffice/TukDaeng_Master_Product_Definition.md`

### Commits pushed

- `0eea647 docs: update asset provenance and feed states`
- `72ae902 docs: clarify asset confirmation dialogs`

### Open items for tomorrow

- Update Profile module docs for Owner Profile asset card quick action `...`
- Add QA scenarios for Owner Profile asset quick actions by status
- Confirm whether quick action menu should be bottom sheet or compact popover on mobile
- Confirm exact visual spacing for `...` button on asset card in Figma
- Continue reviewing Figma cleanup checklist and mark related items as Done / Needs Product Decision

### Current repository note

Branch `docs-frontoffice-spec-updates` has been pushed to origin with today's committed documentation updates. Local uncommitted files unrelated to the latest asset confirmation commit remain:

- `FrontOffice/FIGMA_UX_CLEANUP_TASK_BREAKDOWN.md`
- `DailyLogs/DAILY_WORK_REPORT_2026-06-29.md`
