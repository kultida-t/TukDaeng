# BO Canonical Label Table — มาตรฐาน Label/Button กลาง

เอกสาร registry กลางสำหรับ label ทุกชนิดใน BO Prototype (Mission 1 — ล็อกมาตรฐาน Label/Button, task `PVR-002`)

- Status: **Confirmed 02/10/2026** — canonical labels + §5 decisions ล็อกแล้ว (ยังไม่ bind กับงานแก้จอใด — การ normalize แต่ละจอต้องผ่าน mission เฉพาะจอ + approval)
- Source inventory: `deliverables/label-standard/inventory.md` + `inventory.json` (สแกน `Prototypes/bo-prototype.html` ด้วย `Prototypes/scan-labels.mjs` — read-only, 1,926 entries — re-scan 07/10 หลัง MKD-003)
- Supersedes/เสริม: naming rules ใน `BackOffice/BO_UI_UX_STANDARD.md` §Navigation and Context และ `docs/bo-navigation-naming-contract.md` Contract C
- **เอกสารนี้ไม่ใช่คำสั่งแก้ protected screens** — ทุกจอที่ล็อกไว้คง label เดิมจนกว่า mission เฉพาะจอได้รับอนุมัติ normalize

---

## 1. Language Layer Rules (กติกาหลัก — ชั้นโครง English / ชั้นเนื้อหาไทย)

| Layer | ภาษา | ครอบคลุม |
|---|---|---|
| **ชั้นโครง (Structure)** | English | nav module/sub labels, page title (`#page-title`), modal/drawer title, breadcrumb nodes ระดับ module/sub/detail-type, detail head `<ID> : <Display Name>`, status/risk/channel pills, system keys และ field label ที่เป็น identifier |
| **ชั้นเนื้อหา (Content)** | ไทย | action buttons, field labels ทั่วไป, helper/description/empty/error copy, filter toolbar copy, search placeholder, back label |

กติกาย่อย:

1. **Technical keys/identifiers = English เสมอ** แม้อยู่ชั้นเนื้อหา — `Option Key`, `Group Key`, `Role ID`, `Event ID`, `Delivery ID`, status pill (`Active`/`Pending`/`Locked`/`Suspended`/`Archived`/`Sent`/`Retry`), channel pill (`Email`/`Push`), risk pill (`High`/`Medium`/`Low`)
2. **Nav section headers = ไทย (locked exception)** — `การดำเนินงาน` / `งานตรวจสอบและบริการ` / `เครื่องมือ & รายงาน` (contract C.6, คงเดิมถาวร)
3. **Auth standalone screens = English stylized (locked exception)** — `FORGOT PASSWORD`, `RESET PASSWORD`, `ACCEPT INVITATION`, `ACCOUNT ACTIVATED`, `CHECK YOUR EMAIL`, `PASSWORD UPDATED`, `GO TO LOGIN`, `ACTIVATE ACCOUNT` — convention เดิมของ auth suite ที่ล็อกแล้ว
4. **aria-label/title ต้อง mirror visible label (confirmed)** — ถ้า visible เป็นไทย aria เป็นไทย (`aria-label="ก่อนหน้า"`); `aria-label="Back"` บน `.page-back-btn` = deviation (visible เป็น `กลับไป <dest>`) → normalize เป็น `กลับไป <dest>` ใน mission เฉพาะจอ; icon-only ที่ไม่มี visible text ใช้ภาษาเดียวกับ context
5. **Prototype harness controls ไม่อยู่ในกฎนี้** — `Test flow` selectors, scenario options (`Reset — ลิงก์หมดอายุ`, `Accept invitation — …`) เป็นปุ่มจำลอง dev ไม่ใช่ product UI

---

## 2. Canonical Action Labels (ปุ่ม — ชั้นเนื้อหา, ไทย)

**กฎบังคับ:** ปุ่มใหม่ทุกปุ่มต้องใช้ canonical label จากตารางนี้เท่านั้น ห้ามประดิษฐ์ label นอกตาราง — ถ้า action ใหม่ยังไม่มี row ให้เพิ่ม row ในเอกสารนี้ก่อนแล้วค่อยใช้

| Action family | Canonical label | ใช้เมื่อ | Variants ที่พบใน prototype (จำนวนใช้) | Disposition |
|---|---|---|---|---|
| **Confirm — modal primary** | `ยืนยัน` | ปุ่มหลักใน confirmation modal ทุกชนิด (title บอก action อยู่แล้ว ไม่ต้องซ้ำในปุ่ม) | `ยืนยัน` (10) canonical | ✅ canonical |
| | | | `ยืนยันเปลี่ยน Role`, `ยืนยันสร้าง Custom Role`, `ยืนยันแก้ไข Custom Role`, `ยืนยันปิดใช้งาน`, `ยืนยันเปิดใช้งาน`, `ยืนยัน Deactivate`, `ยืนยัน Reactivate` (7) | 🔶 proposed normalize → `ยืนยัน` (รอ mission เฉพาะจอ; จอล็อกอยู่) |
| | | | `ตรวจสอบและยืนยัน` (1, Role create form → confirm) | 🔶 intentional step-label — ต่างจาก confirm modal; เก็บเป็น allowed variant `ตรวจสอบและยืนยัน` สำหรับปุ่มที่เปิด review step |
| **Confirm — type-to-confirm** | พิมพ์คำยืนยัน | destructive confirm (delete ถาวร) ใช้ pattern `พิมพ์ <word> เพื่อยืนยันการลบ` + ปุ่ม `ลบ <Entity>`/`ยืนยัน` | `พิมพ์ ${…} เพื่อยืนยันการลบ` (2, Option Master) | ✅ canonical pattern |
| **Save — form** | `บันทึก` | save form/modal ทั่วไป | `บันทึก` (1, My Account name) | ✅ canonical |
| | `บันทึกการเปลี่ยนแปลง` | save หน้า config/settings ที่มีหลาย field | `บันทึกการเปลี่ยนแปลง` (1, Support Center), `บันทึกการแก้ไข` (2, Option Master edit modals), `บันทึกลำดับ` (3, reorder modals) | ✅ canonical family: `บันทึก<สิ่งที่บันทึก>` — suffix เฉพาะเมื่อปุ่มหลักไม่ชัดว่าบันทึกอะไร |
| **Cancel — modal secondary** | `ยกเลิก` | ปิด modal/flow โดยไม่ทำ action | `ยกเลิก` (38) canonical | ✅ canonical |
| | | | `Cancel` (1), `Close` (1), `×` (Market Sync modal) | 🔴 deviation — Market Data sync modal ใช้ English; normalize ใน mission เฉพาะจอ |
| **Close — dismiss result/read-only** | `ปิด` | ปุ่มปิด modal/drawer หลังอ่านผล (result modal, read-only detail, audit drawer) | `ปิด` (70) canonical | ✅ canonical |
| **Back — page navigation** | `กลับไป <destination>` | `.page-back-btn` กลับหน้าก่อนหน้า (label = ชื่อปลายทางจริงตาม contract C.4/B.7) | `กลับไปหน้า Login` (4), `กลับไปยัง Dashboard` (1), `กลับไปยัง Role List` (1), `← กลับไปหน้า Login` (1) | ✅ canonical — normalize รูปแบบเป็น `กลับไป <dest>` ไม่ใส่ `ยัง`/`หน้า`/`←` เมื่อ normalize |
| | `Back to Option Groups` | — | Option Master back | 🔒 **locked exception ถาวร** (contract C.4) |
| **Back — ขั้นใน flow/modal** | `ย้อนกลับ` | กลับไป step/ฟอร์มก่อนหน้า *ภายใน* modal flow (confirm → edit) — ไม่ใช่ page back | `ย้อนกลับ` (6, Option Master/Roles confirm modals) | ✅ canonical (แยกจาก `กลับไป <dest>` — ใช้เฉพาะ in-modal step back) |
| **View detail — row/menu** | `ดูรายละเอียด` | row action menu / generic detail open | `ดูรายละเอียด` (13) canonical | ✅ canonical |
| | | | `View`, `View detail`, `Detail` (6, Categories/Articles/Market) | 🔴 deviation — normalize ใน mission เฉพาะจอ |
| **View — entity เฉพาะ** | `ดู <Entity>` | เปิด entity เฉพาะจาก context อื่น | `ดู Audit Log` (4), `ดู Version History` (1), `ดูเวอร์ชัน` (1) | ✅ canonical pattern `ดู <EN entity>` |
| | | | `View Asset` (4), `View Article` (3), `View all comments` (2), `View sale history`, `View full sale record`, `View Sync History` (10) | 🔴 deviation → `ดู <Entity>` |
| **Preview** | `ดูตัวอย่าง` | ดูตัวอย่างก่อน publish/save | `Preview` (3, Policy/Support/Article editor — locked) | ✅ canonical `ดูตัวอย่าง` (confirmed §5.5); EN เดิม = deviation D14 |
| **Edit** | `แก้ไข` | edit action ทั่วไป | `แก้ไข` (5) canonical | ✅ canonical |
| | `แก้ไข <X>` | edit entity/draft เฉพาะ | `แก้ไข Draft` (3), `แก้ไขบทความ` (1) | ✅ canonical pattern |
| | | | `Edit` (2, My Account/Option view), `Edit Category` (2), `Edit article` (2) | 🔴 deviation → `แก้ไข`/`แก้ไข <X>` |
| **Change — เปลี่ยนค่าเฉพาะ** | `เปลี่ยน <X>` | action ที่เปลี่ยนค่าเดียวไม่ใช่ edit form | `เปลี่ยน Role` (2), `เปลี่ยนรหัสผ่าน` (2) | ✅ canonical pattern |
| **Add — เพิ่ม entity** | `เพิ่ม <Entity>` | primary add button | `เพิ่ม Group` (2), `เพิ่ม Option` (2), `เพิ่มลิงก์` (1) | ✅ canonical pattern |
| | | | `Add admin` (1), `Add Category` (1), `+ Add block` (1) | 🔴 deviation → `เพิ่ม <Entity>` (locked จออยู่ — normalize ต่อจอ) |
| **Create — สร้าง entity** | `สร้าง <Entity>` | create action ที่ผลลัพธ์เป็น entity ใหม่ (ต่างจากเพิ่ม = add row ใน list ที่มีอยู่) | `สร้างบทความ` (1), `สร้าง Custom Role` (3), `สร้าง Option` (1), `สร้าง Group` (1), `สร้าง Draft เวอร์ชันใหม่` (1) | ✅ canonical pattern — ⚠️ overlap `เพิ่ม`/`สร้าง` ให้ยึด convention ของจอเดิม: entry button=`เพิ่ม X`, submit ใน modal=`สร้าง X` |
| **Delete** | `ลบ <Entity>` | delete action | `ลบ` (2), `ลบ Option` (1), `ลบ Group ถาวร` (1) | ✅ canonical pattern (`ถาวร` suffix เมื่อ permanent) |
| | | | `Delete category` (1), `Delete block` (aria), `Delete draft` (1) | 🔴 deviation → `ลบ <Entity>` |
| **Suspend / Unsuspend** | `ระงับ` / `ยกเลิกการระงับ` | suspend account/entity | `ระงับ` (2), `ยกเลิกการระงับ` (2) | ✅ canonical |
| | | | `ระงับชั่วคราว`, `ระงับบัญชีชั่วคราว`, `ระงับบัญชีถาวร`, `ยกเลิกระงับบัญชีชั่วคราว/ถาวร`, `Suspend Admin`, `Unlock Admin`, `Archive Admin` (js-label configs) | ✅ allowed compound: `ระงับ[บัญชี]<ชั่วคราว/ถาวร>` — action tile labels เป็น config ไม่ใช่ปุ่ม confirm |
| **Deactivate / Reactivate** | `ปิดใช้งาน` / `เปิดใช้งาน` | enable/disable entity (role, option, category) | `ปิดใช้งาน` (4), `เปิดใช้งาน` (4) | ✅ canonical |
| **Hide / Unhide** | `ซ่อนชั่วคราว` / `ซ่อนถาวร` / `ยกเลิกการซ่อนชั่วคราว` | moderation hide asset/comment | (3)/(4)/(4) + `ซ่อนความคิดเห็นชั่วคราว/ถาวร`, `ซ่อนสินทรัพย์ชั่วคราว/ถาวร` | ✅ canonical — pattern `ซ่อน<Entity ถ้าจำเป็น><ชั่วคราว/ถาวร>` |
| **Restore** | `คืน <X>` | restore entity (account/version/article) | `คืนบัญชี` (1) canonical pattern; `Restore`/`Restore เวอร์ชันนี้`/`Restore เป็น Draft`/`Restore Account`/`Restore article` (5+ English) | ✅ canonical `คืน <X>` (confirmed §5.1) — `Restore Account`→`คืนบัญชี`, `Restore เวอร์ชันนี้`→`คืนเวอร์ชันนี้`, `Restore เป็น Draft`→`คืนเป็น Draft`, `Restore article`→`คืนบทความ`; EN เดิม = deviation D9 |
| **Reject** | `ปฏิเสธ <X>` | reject request/restore | `ปฏิเสธคืนบัญชี` (2), `Reject Restore` (1) | ✅ canonical `ปฏิเสธ <X>`; `Reject Restore` = deviation (Account Deletion config) |
| **Unlock** | `ปลดล็อก` | unlock account | `ปลดล็อก` (2), `Unlock Admin` (config) | ✅ canonical |
| **Archive** | `เก็บถาวร` | archive entity | `เก็บถาวร` (2), `Archive article`/`Archive Admin` (configs) | ✅ canonical |
| **Close report** | `ปิดรายงาน` | moderation close report | `ปิดรายงาน` (5 js-label) | ✅ canonical |
| **Reorder** | `จัดเรียง` / `จัดเรียง <Entity>` | reorder modal open | `จัดเรียง` (4) | ✅ canonical |
| | | | `Reorder Categories` / `Reorder Categories on FO Board` (2, Categories — locked) | 🔴 deviation → `จัดเรียง Category` (confirmed §5.2 — button=content layer ไทย แม้ modal title `Reorder Categories` เป็น EN structure) |
| **Reset filters** | `รีเซ็ตค่าทั้งหมด` | reset filter toolbar (icon button + aria) | `รีเซ็ตค่าทั้งหมด` (18) canonical — `filterCopy.resetAll` single source | ✅ canonical |
| | `ล้างตัวกรอง` | inline clear link ใน empty/error state | `ล้างตัวกรอง` (1, Role list empty) | ✅ allowed variant เฉพาะ empty-state inline link |
| **Sort labels** | `ล่าสุดก่อน` / `เก่าสุดก่อน` / `เรียงตาม<X>` | sort option labels | `filterCopy.latestFirst/oldestFirst`, `เรียงตามใช้งานล่าสุด`, `เรียงตามวันที่สมัครล่าสุด`, `ลำดับแสดงผล`, `จำนวน Article`, `Name A-Z`, `Title A-Z`, `เวลาเผยแพร่`, `อัปเดตล่าสุด` | ✅ canonical — sort option = ไทย เว้น key-based sort (`Name A-Z`/`Title A-Z` เป็น English ok เพราะอ้าง English key) |
| **Filter options "all"** | `ทุก<X>` | select option ค่าเริ่มต้น | `ทุกสถานะ`, `ทุก Priority`, `ทุกวิธีเข้าสู่ระบบ`, `ทุกแบรนด์`, `ทุกหมวดหมู่`, `ทุกแหล่งข้อมูล` (filterCopy) | ✅ canonical pattern `ทุก<X>` — ⚠️ `ทุก Priority` mix TH+EN key (allowed — Priority เป็น system term) |
| **Filter toggle** | `เปิดตัวกรอง` / `ปิดตัวกรอง` | toggle filter panel (Delivery Logs/Audit Log pattern) | `ปิดตัวกรอง` (13928/15383) | ✅ canonical — toggle label สลับตาม state |
| **Pagination** | `ก่อนหน้า` / `ถัดไป` | pager prev/next (icon ‹/› + text + aria ตรงกัน) | `ก่อนหน้า` (2), `ถัดไป` (1, renderPager) | ✅ canonical — `renderPager` เป็น single source แล้ว |
| **Search placeholder** | `ค้นหา<field list>` | search input placeholder | `ค้นหาจากชื่อ, รหัส, สถานะ หรือเหตุผล`, `ค้นหา Event ID, Actor, Action, Reference`, `ค้นหา Delivery ID, Source, Recipient, Event`, `ค้นหา Admin ID, ชื่อ, อีเมล, Role` | ✅ canonical pattern `ค้นหา` + รายการ field (field name เป็น English ถ้าเป็น system key) |
| **Retry** | `ลองอีกครั้ง` | retry หลัง error/failed | `ลองอีกครั้ง` (5) | ✅ canonical |
| | | | `Retry`, `Retry Failed Datasets` (English, Market/Audit contexts) | 🔴 deviation — js-label config/status เป็น English ได้ แต่ปุ่มควร `ลองอีกครั้ง`/`ลองอีกครั้ง <X>` |
| **Login / Logout** | `เข้าสู่ระบบ` / `ออกจากระบบ` / `ออกจากระบบทุกอุปกรณ์` | auth actions | `เข้าสู่ระบบ` (1), `ออกจากระบบ` (2), `ออกจากระบบทุกอุปกรณ์` (2) | ✅ canonical |
| | | | `Logout` (sidebar button), `GO TO LOGIN`, `ACTIVATE ACCOUNT` | 🔒 locked exception (auth suite + sidebar English convention) |
| **Send invite** | `ส่งคำเชิญ` / `ส่งคำเชิญใหม่` / `ส่งคำเชิญอีกครั้ง` | invitation actions | (1)/(2)/(2) — Admin Accounts locked | ✅ canonical family |
| **Sync / Import (Market)** | `Start Sync` / `Syncing...` / `View Sync History` / `Download CSV Template` / `Retry Failed Datasets` | Market Data sync/import | ทั้งหมด English (Market Data locked) | 🔒 locked ปัจจุบัน — 🔶 ถ้า normalize จะเป็น `เริ่ม Sync`/`กำลัง Sync...`/`ดู Sync History`/`ดาวน์โหลด CSV Template`/`ลองใหม่เฉพาะชุดที่ล้มเหลว` (ตัดสินใจตอน mission Market Data) |
| **Block editor (Article)** | `+ Add block` / `Move block up/down` / `Delete block` | article editor block controls | English ทั้งหมด (aria + button) | 🔒 locked — normalize เป็น `+ เพิ่ม block`/`เลื่อน block ขึ้น/ลง`/`ลบ block` ใน mission Content Mgmt |
| **Language toggle** | `ภาษาไทย` / `English` | preview TH/EN toggle (Policy/Support) | — | ✅ canonical — ภาษาเขียนชื่อตัวเอง |
| **Show/hide password** | `แสดงรหัสผ่าน` / `ซ่อนรหัสผ่าน` | password visibility toggle (aria/title, สลับตาม state) | `Show password` (11) | ✅ canonical TH (confirmed §5.3); EN เดิม = deviation D10 |
| **Publish / editor actions** | `เผยแพร่` / `ดูตัวอย่าง` / `แก้ไข Draft` / `สร้าง Draft` | publish & editor actions (Policy/Article) | `เผยแพร่` (1), `Publish` (1), `Preview` (3), `Edit Draft`/`Create Draft`/`สร้าง Draft เวอร์ชันใหม่`/`แก้ไข Draft` ปะปน | ✅ canonical TH + `Draft` คง system term EN (confirmed §5.5); EN buttons เดิม = deviation D14 |

---

## 3. Structure Labels (ชั้นโครง — English, locked ตาม navGroups + contract C)

### 3.1 Navigation labels (single source = `navGroups` ~17959)

| Level | Canonical | หมายเหตุ |
|---|---|---|
| Section (TH — locked exception) | `การดำเนินงาน` / `งานตรวจสอบและบริการ` / `เครื่องมือ & รายงาน` | contract C.6 คงเดิม |
| Module (EN) | `Dashboard`, `User Management`, `Asset Management`, `Offer Management`, `Content Management`, `Market Data`, `Option Master`, `Market Demand`, `Account Deletion`, `Settings` | อ้าง `navGroups` เท่านั้น ห้าม hardcode ต่างจาก source |
| Sub (EN) | `User Accounts`, `Reported Users`, `Asset List`, `Reported Assets`, `Reported Comments`, `Articles`, `Categories`, `Reported Articles`, `Market Overview`, `Brands & Models`, `Sync History`, `Demand Overview`, `Search Insights`, `Watch Alert List`, `Admin Accounts`, `Roles & Permissions`, `Policy & Versioning`, `Support Center`, `Delivery Logs`, `Audit Log` (module `audit`) | display override เดียวที่อนุญาต: `Asset List` → sidebar แสดง `Assets` (`getSubNavDisplayLabel`) |
| Sidebar logout | `Logout` | locked English convention |

### 3.2 Title patterns (English)

| Surface | Pattern | ตัวอย่าง canonical |
|---|---|---|
| Page title | `<Module>` หรือ `<Entity> Detail` | `Dashboard`, `User Detail`, `Reported User`, `Role Summary` |
| Detail head | `<ID> : <Display Name>` + pills | `U-1104 : …`, `WAL-1440 : …` |
| Modal — view | `<Entity> Detail` / `<ID> : <Name>` | `Option Detail`, `Category Detail` |
| Modal — action | `<Verb> <Entity>` | `Add Option`, `Edit Group`, `Change Role`, `Revoke Session`, `Reorder Categories` |
| Modal — confirm | `Confirm <Verb> <Entity>` | `Confirm Create Option`, `Confirm Deactivate Custom Role`, `Resend/Cancel/Reissue Invitation` |
| Drawer/read-only | `<Entity> Detail` + eyebrow | `Audit Log Detail` pattern |
| Breadcrumb | `<Section TH> / <Module EN> / [<Sub EN>] [/ <Detail type> / <ID>]` | `การดำเนินงาน / User Management / User Detail / U-xxxx` |

**⚠️ Existing Thai modal titles (locked ปัจจุบัน — normalize candidates ไม่ใช่ defect):**
`ยืนยันการปิดรายงาน` (2), `ยืนยันการเผยแพร่`, `ยืนยันการ Restore`, `ยืนยันการนำบทความกลับมาเผยแพร่`, `ติดต่อเรา` (support preview toggle context), `${…}` dynamic titles บางจุด
→ ตาม contract C.3 note: existing convention ไม่อยู่ named scope เก่า; ภายใต้กฎ 2 ชั้นใหม่ถือเป็น normalize candidates — แก้เฉพาะเมื่อ mission เฉพาะจออนุมัติ (เช่น `ยืนยันการปิดรายงาน` → `Confirm Close Report`)

### 3.3 Status / system labels (English — ชั้นโครง tokens)

Status pills, risk pills, channel pills, role names, entity ID prefixes (`U-`/`AST-`/`WAL-`/`DEL-`/`ADM-`/`DLV-`/`AUD-`/`RCO-`/`POL-`), audit event names (`ADMIN_SESSION_REVOKE_ALL`), sync job names — คง English เสมอ

---

## 4. Deviations Flagged (พบใน inventory — ยังไม่แก้ รอ mission เฉพาะจอ + อนุมัติ)

| # | Deviation | Locations (ตัวอย่าง) | เป้าหมาย normalize |
|---|---|---|---|
| D1 | `Cancel`/`Close`/`×` English ใน Market Sync modal | 38164–38167 (เดิม 37828–37831) | `ยกเลิก`/`ปิด` — ✅ **Resolved MKD-003 07/10** (`Cancel`→`ยกเลิก`, `Close`→`ปิด` ×2; icon close มี `aria-label="ปิด"` อยู่แล้ว) |
| D2 | `View`/`View detail`/`Detail` English row actions | 36765/37041/36782 (Market), 39901/43646 | `ดูรายละเอียด` — ✅ **Market resolved MKD-003 07/10** (3 จุด); ที่เหลือ module อื่น (Categories/Articles/Offer) รอ mission เฉพาะจอ |
| D3 | `View Asset`/`View Article`/`View all comments`/`View sale history`/`View full sale record`/`View Sync History`/`Audit trail` | 31814/44477/45593/22503/24380/23185/38166 (Market), 37145 (Audit trail btn) | `ดู <Entity>` — ✅ **Market resolved MKD-003 07/10** (`View Sync History`→`ดู Sync History`, `Audit trail`→`ดู Audit Trail`); ที่เหลือ module อื่น รอ mission เฉพาะจอ |
| D4 | `Edit`/`Edit Category`/`Edit article` | 34019/40396/39902/42176/43648/43751 | `แก้ไข`/`แก้ไข <X>` |
| D5 | `Add admin`/`Add Category`/`+ Add block` | 27787/32028/42819 | `เพิ่ม <Entity>` |
| D6 | `Delete category`/`Delete draft`/`Delete block` | 39910/43588/42793 | `ลบ <Entity>` |
| D7 | `Reorder Categories` button | 32027 | `จัดเรียง` + entity (หรือ exception — §5.2) |
| D8 | `ย้อนกลับ` vs page-back `กลับไป <dest>` — ผสม semantics ถ้าพบ `ย้อนกลับ` บน page back | 33292/33492/40847/40897/41231/41292 (in-modal = ok) | ตรวจ semantics: in-modal=`ย้อนกลับ` ok, page-back ต้อง `กลับไป <dest>` |
| D9 | `Reject Restore`/`Suspend Admin`/`Unlock Admin`/`Archive Admin`/`Restore Account`/`Restore article`/`Archive article` English action labels | 30840/28127/28159/28175/30821/43621/43610 | `ปฏิเสธ <X>`/`ระงับ`/`ปลดล็อก`/`เก็บถาวร`/`คืน <X>` (confirmed §5.1) |
| D10 | `Show password` aria EN ทั้งที่ visible context TH | 17722/26569/26577/27601/27609/34363 | `แสดงรหัสผ่าน`/`ซ่อนรหัสผ่าน` (confirmed §5.3) |
| D11 | `aria-label="Back"` EN บนปุ่มที่ visible เป็น `กลับไป …` | 20958 `renderPageBackButton` — **shared helper 21 callsites ทุก module** | aria mirror visible → `กลับไป <dest>` (confirmed §5.4) — ✅ **Resolved MKD-003 07/10** (`aria-label="${label}"` ครอบทุก callsite) |
| D12 | Market Data sync/import suite English | 38164–38167 (sync modal), 37278 (CSV template — dead code, เลื่อน Phase 2), 36782 | ตามตาราง Sync/Import — ✅ **Resolved MKD-003 07/10** ยกเว้น `Download CSV Template` (ปัจจุบัน ~37279) เลื่อน Phase 2 ตามมติ |
| D13 | Auth uppercase buttons `GO TO LOGIN`/`ACTIVATE ACCOUNT` + `Logout` sidebar | 26546/26588/17819 | 🔒 locked exception — ไม่ normalize |
| D14 | `Publish`/`Preview`/`Edit Draft`/`Create Draft` English ใน Policy/Article editors | 35406/35049/35405/43907/35337 ฯลฯ | `เผยแพร่`/`ดูตัวอย่าง`/`แก้ไข Draft`/`สร้าง Draft` (confirmed §5.5) — locked |
| D15 | Mixed-case/dynamic titles `${…}` 36 จุด + Thai modal titles | หลายจุด — ดู inventory §title-heading | ตรวจทีละจอตอน module mission |
| D16 | Table header language ไม่สม่ำเสมอภายใน module — Brands/Models/References tables ใช้ EN (`Brand`/`Models`/`Action`) ขณะที่ Sync History record table ใช้ TH (`รายการข้อมูล`/`ผลลัพธ์`/`รายละเอียด`) | 36749 / 37028 / 37066 / 36900 | ตัดสินใจ convention หัวตารางกลาง (entity/system name = EN ได้ แต่หัวกิจกรรมอย่าง `Action`/`Detail` อาจควร TH) — รอ mission เฉพาะจอ |

> ทุก deviation เป็น "candidate" เท่านั้น — **ห้ามแก้จอล็อกโดยอ้างตารางนี้โดยตรง** ต้องผ่าน mission เฉพาะจอ + approval ตาม protected policy เสมอ

---

## 5. Confirmed Decisions (ตัดสินใจแล้ว — 02/10/2026, ผู้ใช้เลือกทีละข้อ)

| # | ประเด็น | การตัดสินใจ |
|---|---|---|
| 5.1 | Restore family canonical | **`คืน <X>`** — `Restore Account`→`คืนบัญชี`, `Restore เวอร์ชันนี้`→`คืนเวอร์ชันนี้`, `Restore เป็น Draft`→`คืนเป็น Draft`, `Restore article`→`คืนบทความ` |
| 5.2 | `Reorder` button ใน Categories | **normalize เป็น `จัดเรียง <Entity>`** — button=content layer ไทย แม้ modal title เป็น EN structure (2 ชั้นไม่ต้องตรงคำต่อคำ) |
| 5.3 | `Show password` aria/title | **`แสดงรหัสผ่าน`/`ซ่อนรหัสผ่าน`** สลับตาม state |
| 5.4 | aria บน `.page-back-btn` | **mirror visible label** — `กลับไป <dest>` |
| 5.5 | `Publish`/`Preview`/`Edit Draft`/`Create Draft` (Policy/Article, locked) | **`เผยแพร่`/`ดูตัวอย่าง`/`แก้ไข Draft`/`สร้าง Draft`** — `Draft` คงเป็น system term EN |
| 5.6 | `Test flow`/scenario selectors | **ยกเว้นถาวร** — prototype harness ไม่ใช่ product UI ไม่บังคับกฎ |

**กฎทั่วไปสำหรับ label ใหม่ที่ยังไม่มีใน §2:** action verb = ไทยเสมอ; entity/technical term = English ตามนิยามจอนั้น (`Draft`, `Option`, `Group`, `Role`, `Sync`, `Audit Log`)

---

## 6. วิธีใช้ในงานถัดไป (Usage)

1. งานสร้าง/แก้ปุ่มใหม่ → หา canonical row ใน §2 ก่อน; ไม่มี → เพิ่ม row + ทำเครื่องหมาย proposed แล้วใช้
2. Module audit mission → เปรียบเทียบ label จริงกับตารางนี้; deviation ที่พบให้บันทึกใน §4 (เพิ่ม row) ไม่ใช่แก้ทันที
3. ก่อน normalize จอใด → เช็ค protected status ใน `PROTECTED_SCREENS.md`/`AGENTS.md` + เทียบ contract ที่ confirm แล้ว (navigation/naming contract, modal contract) — ถ้าไม่ตรงต้องชี้แจ้งก่อนแก้

---

## 7. Mission 2 — Market Data Normalization Plan (**อนุมัติแล้ว 07/10/2026**)

แผน normalize ของ module **Market Data** (MKD-002) — line refs อัปเดตตามไฟล์ปัจจุบัน 07/10/2026 (เลื่อนจาก audit 02/10); audit เต็ม: `deliverables/label-standard/market-data-label-audit-report.md` — **อนุมัติแล้ว 07/10/2026 → ดำเนินการแก้ `bo-prototype.html` ใน MKD-003 ได้ตาม scope นี้เท่านั้น**

### 7.1 ตาราง Current vs Proposed (24 จุด)

| # | บรรทัด | บริบท | ปัจจุบัน | Proposed | เหตุผล (กฎ 2 ชั้น / §2) |
|---|---|---|---|---|---|
| 1 | 38164 | Sync Modal — Confirm | `Cancel` | `ยกเลิก` | Cancel — modal secondary (D1) |
| 2 | 38164 | Sync Modal — Confirm | `Start Sync` | `เริ่ม Sync` | Sync/Import (D12); `Sync` คง EN system term |
| 3 | 38165 | Sync Modal — Running | `Syncing...` | `กำลัง Sync...` | Sync/Import (D12) |
| 4 | 38166 | Sync Modal — Success | `Close` | `ปิด` | Close — dismiss result (D1) |
| 5 | 38166 | Sync Modal — Success | `View Sync History` | `ดู Sync History` | `ดู <Entity>` (D3/D12) |
| 6 | 38167 | Sync Modal — Error | `Close` | `ปิด` | Close — dismiss result (D1) |
| 7 | 38167 | Sync Modal — Error | `Retry Failed Datasets` | `ลองใหม่เฉพาะชุดที่ล้มเหลว` | `ลองอีกครั้ง <X>` (D12) |
| 8 | 36765 | Brands table — row action | `View` (+ aria `View ${brand.name} models`) | `ดูรายละเอียด` (+ aria `ดูรายละเอียดโมเดล ${brand.name}`) | `ดูรายละเอียด` (D2) + aria mirror (Rule 4) |
| 9 | 37041 | Models table — row action | `View` (+ aria `View ${model.name} references`) | `ดูรายละเอียด` (+ aria `ดูรายละเอียดเลขอ้างอิง ${model.name}`) | เหมือน #8 |
| 10 | 36782 | Sync History — row action | `Detail` (+ aria `View sync log for …`) | `ดูรายละเอียด` (+ aria `ดูรายละเอียดประวัติการ Sync …`) | เหมือน #8 |
| 11 | 37145 | Reference detail — action btn | `Audit trail` | `ดู Audit Trail` | `ดู <Entity>` (D3) |
| 12 | 37278 | `renderMarketImportGuide` — template link | `Download CSV Template` | `ดาวน์โหลด CSV Template` | D12 — **dead code Phase 2 — ตัดสินใจเลื่อนไว้ ไม่แก้ใน MKD-003** |
| 13 | 20958 | `renderPageBackButton` — **shared helper 21 callsites ทุก module** | `aria-label="Back"` | `aria-label="${label}"` (mirror `กลับไป <dest>`) | D11/§5.4 — ⚠️ กระทบจอล็อกอื่น ต้อง approve แยก |
| 14–16 | 37854 / 37889 / 38066 | Market back-btn callsites | (label param มีอยู่แล้ว) | ไม่แก้ callsite — ได้ผลจาก #13 | — |
| 17 | 37864 | Brand Detail — search | `Search ${brand.name} models` | `ค้นหา Model ของ ${brand.name}` | `ค้นหา<field>` (content=TH) |
| 18 | 37899 | Model Detail — search | `Search ${model.name} references` | `ค้นหา Reference ของ ${model.name}` | เหมือน #17 |
| 19 | 36767 | Brands table — empty | `No brands found` | `ไม่พบข้อมูล` (แนวทาง A) | Contract D empty-state |
| 20 | 36922 | Sync History — empty | `No sync logs found` | `ไม่พบข้อมูล` (แนวทาง A) | เหมือน #19 |
| 21 | 37043 | Models table — empty | `No models found for this brand` | `ไม่พบข้อมูล` (แนวทาง A) | เหมือน #19 |
| 22 | 37076 | References table — empty | `No references found for this model` | `ไม่พบข้อมูล` (แนวทาง A) | เหมือน #19 |
| 23 | 37837 | Model detail — reference blocks empty | `No references found for this model` | `ไม่พบข้อมูล` (แนวทาง A) | เหมือน #19 — พบเพิ่มจาก re-scan 07/10 |
| 24 | 37173 | Audit modal — empty | `No audit events for this target yet` | `ยังไม่มีประวัติ Audit สำหรับรายการนี้` | Contract D exception (business-specific) |

### 7.2 ไม่แก้ (compliant / locked)

- Structure EN: nav `Market Data`, sub `Market Overview`/`Brands & Models`/`Sync History`, breadcrumb, status pills (`Completed`/`Failed`/`Running`/`Ready`/`Syncing`…), modal titles (`Sync Market Data`, `Audit Trail`), `Last Updated` token `Syncing...` (38299/38301 — system status ตาม `06_MARKET_DATA_MODULE.md` §)
- Content TH ที่ผ่านแล้ว: filter `ค้นหา Brand, Model, Reference` / `ค้นหา Sync Job, Endpoint, Result` / `ค้นหา endpoint / โมเดล / เลขอ้างอิง`, `เปิด/ปิดตัวกรอง`, `รีเซ็ตค่าทั้งหมด`, `ก่อนหน้า`/`ถัดไป`, `aria-label="ปิด"` close icons, active-sync banner copy

### 7.3 Protected-screen impact

- ขอบเขตแก้เฉพาะ **Market Data** ใน `Prototypes/bo-prototype.html` (หน้าจอล็อก — ต้อง approval ก่อน)
- **#13 (`renderPageBackButton`) เป็น shared helper** — ถ้าแก้จะเปลี่ยน aria ของปุ่ม back ทั้ง 21 callsites ทุก module (ดีขึ้นตาม §5.4 แต่เกินขอบเขตจอเดียว) → ต้อง approve ชัดเจนเป็นรายข้อ
- ไม่แตะ CSS/logic/mock data; ไม่เปลี่ยน status pills/system keys; ไม่แตะ module อื่น

### 7.4 ผลการตัดสินใจ (อนุมัติ 07/10/2026)

1. **แผนหลัก: อนุมัติทั้งหมด** — แก้ครบตามตาราง §7.1 ใน MKD-003
2. **Empty states #19–23: แนวทาง A** — ใช้ `ไม่พบข้อมูล` ตาม Contract D (ทุกตาราง); เฉพาะ #24 audit modal ใช้ `ยังไม่มีประวัติ Audit สำหรับรายการนี้`
3. **#13 shared helper `renderPageBackButton`: อนุมัติแก้เลยใน mission นี้** — `aria-label="Back"` → `aria-label="${label}"` ครอบทั้ง 21 callsites ทุก module (รวม `Back to Option Groups` locked exception ที่ label เป็น EN อยู่แล้ว mirror พอดี)
4. **#12 `Download CSV Template`: เลื่อน Phase 2** — ไม่แตะ dead code ใน MKD-003 (scope แก้จริงเหลือ 23 จุด)
4. `inventory.md`/`inventory.json` regenerate ได้ทุกครั้งด้วย `node Prototypes/scan-labels.mjs` — ตารางนี้เป็น source of truth ของ "เป้าหมาย", inventory เป็น "สภาพจริง"

---

## References

- `Prototypes/bo-prototype.html` — `navGroups` ~17959, `filterCopy` ~21540, `renderPager` ~21766, `renderPageBackButton` ~20637
- `deliverables/label-standard/inventory.md` / `inventory.json` — raw scan (PVR-001)
- `Prototypes/scan-labels.mjs` — scanner (re-runnable)
- `docs/bo-navigation-naming-contract.md` — Contract C naming standard, locked exceptions (§3.1 override, `Back to Option Groups`, section TH)
- `BackOffice/BO_UI_UX_STANDARD.md` — standard หลัก (PVR-003 จะอัปเดต pointer มาที่เอกสารนี้)
- Mission `1f84732d` — Mission 1 baseline; tasks `PVR-001`(`2a2fdb45`)/`PVR-002`(`4fe9af2f`)/`PVR-003`(`5c835801`)/`PVR-004`(`5cc545dc`)
