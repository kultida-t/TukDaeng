# BO Shared Contract — Modal & Empty State

เอกสาร contract กลางสำหรับ Mission "BO Shared UI, Accessibility & Navigation Remediation" (mission `1e359966`, task `BOR-001`)
ล็อกมาตรฐาน **modal action order**, **modal close policy**, **keyboard focus behavior** และ **empty-state copy** ที่ task
BOR-003 (fix coverage list), BOR-005 (modal consistency), BOR-006 (focus management) และ BOR-014 (doc sync) ต้องยึดตาม

- Status: Contract implemented — remediated ใน BOR-005 (action order + close policy), BOR-006 (focus management)
  และ BOR-006a (keyboard-only ring); regression BOR-011/013 ผ่าน 0 fail —
  §1 ด้านล่างคือ current state หลัง remediation แล้ว
- Source findings: Mission Audit `1800d8aa` → BOA-008 (modal/form QA + user decisions), BOA-009 (state QA-08 + user decision), BOA-013/BOA-014 (matrix/register)
- เอกสารนี้เป็น contract เท่านั้น ไม่ใช่คำสั่งแก้ protected screens — การแก้จอใดอยู่ใต้ named scope ของ baseline และ fix coverage list ของ BOR-003

---

## 1. Current State Baseline (สรุปจาก `Prototypes/bo-prototype.html`)

- Modal ทั้งหมดใน prototype ใช้ shared container เดียว: `#user-action-modal`
  (`.modal-backdrop` + `.modal.user-action-modal` + `#user-action-modal-body`)
  เปิด/ปิดผ่าน `showUserActionModal()` / `closeUserActionModal()` — ไม่มี shared helper รายประเภท
- ปุ่มปิดกลาง: `data-user-action-modal-close` (header X ขนาด 38×38px `aria-label="ปิด"` และปุ่มยกเลิกใน footer) — delegated click handler เรียก `closeUserActionModal()`
- Close paths หลัง remediation (BOR-005):
  - ปุ่ม `data-user-action-modal-close` — ปิดได้ทุก modal (ยกเว้น Market Sync ขณะ running ที่ guard ไว้)
  - Backdrop click + ESC — ปิดได้เฉพาะ modal ที่ opt-in ด้วย `data-modal-dismissible` (read-only/preview/drawer
    surfaces ตาม coverage B1–B16 + acknowledge ปุ่มเดียว + drawer variants); form/confirm/destructive
    ปิดด้วย backdrop/ESC ไม่ได้ และ ESC ไม่ fall-through ไป `setNavOpen(false)` ใน event เดียวกัน
- Focus หลัง remediation (BOR-006/006a): shared open/close functions จัดการ initial focus ตามประเภท modal,
  Tab/Shift+Tab focus trap และ restore focus กลับ opener ครอบทุก close path —
  per-modal focus เดิม (เช่น `#my-account-pw-current`) ยัง override ได้; ring แสดงเฉพาะ keyboard flow
- มี drawer variant ใน container เดียวกัน: `market-reference-drawer`, `audit-log-detail-modal` (slide จากขวา)

---

## 2. Contract A — Modal Action Order

**Canonical order: `ยกเลิก (Cancel)` → `ยืนยัน (Confirm)`** — ปุ่มยกเลิกอยู่ซ้าย ปุ่ม confirm อยู่ขวาสุดของ footer ที่ชิดขวา

กฎ:

1. Footer action row ของทุก modal ที่มี 2 ปุ่มขึ้นไปต้องเรียง **secondary/cancel ก่อน → primary/confirm ทีหลัง** (DOM order = visual order, LTR)
2. ปุ่ม cancel ใช้ neutral/secondary style (`user-detail-action-btn` ไม่มี tone) และต้องมี `data-user-action-modal-close`
3. ปุ่ม confirm เลือก tone ตาม risk ของ action:
   - `primary` — action ปกติ / สร้าง / เปิดใช้งาน / reactivate / restore
   - `warning` — action ที่ต้องระวัง แต่ย้อนกลับได้ (suspend, deactivate, hide, close report)
   - `danger` — destructive / ไม่ย้อนกลับ (delete, permanent hide, ban ถาวร)
4. Confirmation ที่ต้อง audit ต้องมี reason/selector + impact note ก่อนปุ่ม confirm เสมอ (คงกฎเดิมจาก BO_UI_UX_STANDARD)
5. Modal ที่มีปุ่มเดียวแบบ acknowledge (`รับทราบ`) ไม่บังคับเพิ่มปุ่มยกเลิก — ปุ่มเดียวเป็น close+acknowledge ในตัว
6. Result state (success/error) ที่แสดงใน modal เดิม ให้คง action set ของ state นั้นไว้เหมือนเดิม (เช่น error → Retry + Close)

จุดที่เคยไม่ canonical (Confirm → Cancel) — **แก้ครบแล้วใน BOR-005**: 10 จุดด้านล่าง + 2 จุดที่ verify เพิ่ม
(Admin Account action modal, Deletion action modal) = coverage A1–A12 ใน `docs/bo-shared-remediation-coverage.md` §2:

| Modal | ตำแหน่งประมาณใน `bo-prototype.html` |
| --- | --- |
| Asset Report close/status confirm (Reported Assets) | ~22888 |
| Asset hide (ซ่อนชั่วคราว) | ~24012 |
| Asset delete post (ซ่อนถาวร) | ~24071 |
| Asset restore visibility | ~24130 |
| Admin Accounts — Change Role confirm | ~28300 |
| User action modal (Suspend/Ban/Restore ฯลฯ) | ~30570 |
| User report status confirm (Reported Users) | ~31245 |
| Market Sync confirm/error state (Start Sync → Cancel, Retry → Close) | ~37670 |
| Board report action confirm (Reported Board) | ~44696 |
| Reported comment action confirm | ~45315 |

ตัวอย่างจุดที่ canonical แล้ว (ยกเลิก → confirm): asset row action menu (~24203), Admin Invitation resend/cancel/reissue (~25531/25693/25887), Invite Admin (~28379), Role create/edit (~32899), My Account revoke/logout-all (~34604/34749), Policy publish/restore (~35458/35573), article confirm (~43841)

---

## 3. Contract B — Modal Close Policy (ตามประเภท modal)

| ประเภท modal | ปุ่ม Close (X) | Backdrop click | ESC | หมายเหตุ |
| --- | --- | --- | --- | --- |
| Read-only preview / detail / drawer | ✅ | ✅ | ✅ | Canonical = Audit Log detail drawer |
| Form ที่แก้ข้อมูล / confirmation / dirty state | ✅ X + ปุ่มยกเลิก | ❌ | ❌ | กันข้อมูลสูญหาย — ต้องมีปุ่มปิดที่เห็นชัดเสมอ |
| Destructive + type-to-confirm | ✅ X + ปุ่มยกเลิก | ❌ | ❌ | เหมือน form — confirm disabled จนเงื่อนไขครบ |
| Locked long-running (เช่น Market Sync running) | ❌ ระหว่าง running | ❌ | ❌ | กลับมาปิดได้เมื่อ state จบ (success/error) |

กฎเพิ่มเติม:

1. **Backdrop close ใช้ได้เฉพาะเมื่อมีพื้นที่ backdrop ให้คลิกจริง** — drawer/modal ที่กินเต็ม viewport บน mobile (เช่น drawer 100vw ที่ ≤460px) ไม่มี backdrop area จึงถือว่า backdrop-close ไม่ applicable บน mobile โดยนิยาม
2. ESC ต้องไม่กระทบ layer อื่น — ปัจจุบัน ESC ที่ไม่ได้ปิด modal จะ fallback ไป `setNavOpen(false)`; เมื่อเพิ่ม ESC close ให้ read-only modal ต้องคง guard ว่า ESC ปิด modal ก่อน และไม่ไปปิด sidebar ใน event เดียวกัน
3. Success flow ที่ปิด modal + refresh + toast ตาม pattern เดิมของแต่ละ flow ให้คงไว้ — contract นี้ไม่บังคับเปลี่ยน success/result pattern ที่ล็อกแล้ว
4. Result/error state ที่อยู่ใน modal ต้องยังปิดได้ด้วยปุ่มของ state นั้น (เช่น Close/Retry) ตามกฎข้อ 6 ของ Contract A

---

## 4. Contract C — Keyboard Focus (initial / trap / restore)

กฎสำหรับ shared modal ทุกตัวเมื่อเปิด:

1. **Initial focus** เมื่อ modal เปิด:
   - Form modal (มี input ที่แก้ได้) → focus ฟิลด์แรกที่กรอกได้ (สอดคล้องพฤติกรรมเดิมของ My Account Change Password / invite ที่ test assert อยู่แล้ว)
   - Confirmation / destructive modal → focus ปุ่มที่ destructive น้อยสุด (ยกเลิก) เพื่อกัน Enter เผลอ
   - Read-only modal/drawer → focus ปุ่ม Close (X) หรือ heading container ที่ focus ได้
   - Type-to-confirm gate (confirm disabled รอเงื่อนไข) → focus ช่องพิมพ์ยืนยัน
2. **Focus trap** — Tab / Shift+Tab วนเฉพาะ focusable elements ภายใน modal จนกว่าจะปิด ไม่หลุดไป element ของหน้าหลัง
3. **Restore focus** — เมื่อปิด modal ให้ focus กลับไปที่ element ที่เปิด modal (opener); ถ้า opener หายไปจาก DOM ให้ fallback ไปที่ main content heading (`#page-title`); opener ที่ focus ไม่ได้ตามปกติ (เช่น list row ที่เป็น div) restore ผ่าน last-interaction tracking (pointerdown/Enter/Space) ด้วย temporary tabindex
4. ESC ทำงานตาม close policy ของ Contract B เท่านั้น — trap ไม่ดัก ESC เพิ่ม
5. Focus trap ต้อง release เมื่อ modal ปิดทุกกรณี (X, ยกเลิก, backdrop, ESC, success auto-close) — ห้ามค้าง trap หลัง `.show` ถูกถอด
6. **Focus ring = keyboard-only (BOR-006a)** — shared themed ring (outline 2px `#b8c6d8`) และ tooltip ของปุ่มปิดแสดงเฉพาะ keyboard flow ตาม `:focus-visible` heuristic; open/close ด้วยเมาส์ focus ยังลงตำแหน่งถูกต้องแต่ไม่โชว์ ring — ห้ามบังคับ `focusVisible:true`

### Reconcile กับ test baseline (บังคับ)

- `tests/qa-bo-018-mission1-scoped-smoke.spec.js` test 2 ("Invite Admin modal … ปิดได้ไม่ focus trap") — assertion จริงคือ modal ปิดด้วยปุ่มยกเลิกได้ และหน้ายัง interactive/เปิดใหม่ได้; ชื่อ test อธิบายพฤติกรรมปัจจุบัน (ไม่มี trap) ไม่ได้ assert ว่าต้องไม่มี trap ตลอดไป → การเพิ่ม focus trap ต้อง **ไม่บล็อก close path ใด ๆ** และต้อง release trap หลังปิดจนหน้า interactive เหมือนเดิม; หากต้องปรับชื่อ/คอมเมนต์ test ให้ทำใน scope BOR-006 และบันทึกเป็น test-baseline update
- `tests/qa-bo-014d-audit-log-detail-modal.spec.js` test 9 — ปิด 3 วิธี (X / backdrop desktop / ESC) เป็น canonical ของ read-only ตาม Contract B; ห้ามถอด backdrop/ESC ของ drawer นี้
- `tests/qa-bo-025` + `tests/qa-bo-018` — assert `document.activeElement` บนฟิลด์แรกของ auth/My Account forms อยู่แล้ว → initial focus rule ข้อ 1 ต้องไม่เปลี่ยน target เหล่านั้น
- Manual QA keyboard sequence จาก BOA-008 (เปิดด้วย keyboard → focus เข้า modal → Tab/Shift+Tab วนใน modal → ESC ตาม policy → ปิดแล้ว focus กลับ opener) เป็น checklist ให้ BOR-013 ตรวจ

---

## 5. Contract D — Empty-State Copy

Canonical empty state ของหน้ารายการ (list/table/card area):

- **Title (canonical):** `ไม่พบข้อมูล`
- **Subtitle แยกตามบริบท:**
  - Empty no data (ยังไม่เคยมีรายการ) → อธิบายว่ายังไม่มีรายการ เช่น `ยังไม่มีรายการในระบบ` หรือคำอธิบายเฉพาะ entity
  - Empty after search/filter → อธิบายว่าไม่พบตามเงื่อนไข เช่น `ลองปรับคำค้นหรือตัวกรอง แล้วลองใหม่`
- **Action:** empty จาก search/filter ต้องคง Reset/Clear filters ให้ใช้ได้เสมอ (ตามกฎ list toolbar เดิม)
- **โครงสร้าง:** icon + title + subtitle (+optional action) ตาม pattern state block กลางพื้นที่ list — ห้ามใช้ modal/toast บอก empty state
- Mobile card และ desktop table ใช้ copy เดียวกัน

ข้อยกเว้น (intentional variation — ไม่บังคับเปลี่ยนเป็น `ไม่พบข้อมูล`):

- Empty state ที่มีความหมายธุรกิจเฉพาะ เช่น `ยังไม่มีการแสดงความคิดเห็น` (comments), `ยังไม่มีประวัติการเปลี่ยนแปลง` (history/audit sections), `ยังไม่มีเวอร์ชันที่เผยแพร่` (policy), section ที่ spec สั่งซ่อนทั้งส่วนเมื่อว่าง
- State ที่ไม่ใช่ empty ของ list เช่น unauthorized / error / session-expired / loading — อยู่นอก contract นี้ ใช้กฎ state เดิมของแต่ละหน้า

> ⚠️ Implementation note: baseline มี contract task สำหรับ empty-state copy (BOR-001 นี้) แต่ **ไม่มี execution task ที่แก้ empty-state copy จริง** — copy ปัจจุบันที่ใช้ title เฉพาะ entity (เช่น `ไม่พบ audit event`, `ไม่พบ delivery log`, `ไม่พบ admin account`) อยู่ในหน้า protected; การแก้ copy เหล่านั้นให้ตรง contract ต้องรอ scope/approval เพิ่ม (เสนอใน BOR-003 coverage list หรือ Scope Change) ห้ามแก้ในงาน modal/focus โดยไม่ได้ระบุ

---

## 6. Protected Impact & Scope Guard

- Contract นี้ใช้เป็นมาตรฐานสำหรับงานแก้ใน **named scope ของ baseline เท่านั้น**: shared filter/modal/focus changes ที่ BOR-003 ล็อก + รายการ module-specific ที่ระบุชื่อ
- ไม่ใช่คำสั่ง refactor protected screens ทั้งระบบ — modal/empty state ของหน้าที่ไม่อยู่ใน coverage list ของ BOR-003 คงเดิม
- จุดแก้ modal action order (Contract A) และ close policy (Contract B) ส่วนใหญ่อยู่ใน protected screens (User/Asset/Reported/Admin Accounts/Market/Content) — BOR-003 ต้องนับจุดจริงและระบุว่าเข้า named clause "shared modal changes" หรือไม่ ก่อน BOR-005 แก้
- ถ้า coverage จริงเกิน scope ที่ approve (เช่นต้องแก้โครง shared helper หรือ modal ทุกตัวในระบบ) → หยุดและเสนอ Scope Change ตาม baseline policy

---

## 7. Implementation Status (อัปเดตใน BOR-014)

- **BOR-002**: Navigation/Active-state/Naming contract → `docs/bo-navigation-naming-contract.md` (done)
- **BOR-003**: fix coverage ตาม Contract A–D → `docs/bo-shared-remediation-coverage.md` (done — implemented & verified)
- **BOR-005**: action order A1–A12 + close-policy opt-in B1–B16 + acknowledge + drawer variants (done)
- **BOR-006/006a**: focus init/trap/restore + type-to-confirm gate + keyboard-only ring (done — reconcile §4 ทำแล้ว, qa-bo-018 test 2 baseline update)
- **BOR-011/013**: regression/manual QA เทียบ contract นี้ผ่าน 0 fail (done)
- **BOR-014**: sync กฎเข้า `BackOffice/BO_UI_UX_STANDARD.md` + อัปเดต status เอกสารนี้ (งานนี้)
- **Contract D (empty-state copy)**: ยังเป็น contract เท่านั้น — ไม่มี execution task, copy เดิมคงไว้ตาม implementation note §5

---

## References

- `Prototypes/bo-prototype.html` — `#user-action-modal` (~17841), `showUserActionModal()` (~30372 + focus helpers ~30409), `closeUserActionModal()` (~30392 + restore ~30500), delegated close/backdrop handler (~46429), ESC handler (~50056), focus trap keydown (~50110)
- `tests/_bor005-modal-consistency.cjs`, `_bor006-focus.cjs`, `_bor006a-verify.cjs` — verification scripts
- `BackOffice/BO_UI_UX_STANDARD.md` — Modal Popup / Loading Empty Error States sections
- `PROTECTED_SCREENS.md` — protected scope policy
- Mission `1e359966` Approved Baseline — Scope, Protected Approval Clause, Acceptance Criteria
- Mission Audit `1800d8aa` — BOA-008 (modal/close/focus findings + user decisions), BOA-009 (QA-08 empty copy decision), BOA-013/014 (matrix/register)
