# BO Prototype Audit — Manual Review Checklist (Objective 2)

Mission: BO Prototype Consistency, Coverage & Navigation Audit
Objective 2: Cross-Module UI Consistency
Tasks: BOA-004, BOA-005, BOA-006, BOA-007, BOA-008, BOA-009
ผู้ตรวจ: ผู้ใช้ทำตาม checklist บนหน้าจอจริง (bo-prototype.html)
วันที่ตรวจ: 29/09/2026 — ผลบันทึกใน Kanban activity ของแต่ละ task
Viewports: 390, 768, 1280, 1440px
ผลรวม: Manual QA ผ่านทุกเคสที่ตรวจพฤติกรรม ส่วน inconsistency ที่ยืนยันบันทึกเป็น findings ส่ง BOA-013–BOA-015

## BOA-004 — Page Header, Breadcrumb และ Back Navigation

ขั้นกด: เปิด list → detail → editor/history → modal/drawer → กด back กลับ → ตรวจทุก viewport

| # | เคสที่ตรวจ | ผลที่คาด | ผล |
|---|---|---|---|
| 1 | List pages ทุก module | title, breadcrumb, active nav ถูก | PASS |
| 2 | Detail pages | breadcrumb + back รักษา source context | PASS |
| 3 | Editor / history screens | header pattern ตาม spec | PASS |
| 4 | Modal / drawer | internal header/close ถูก | PASS |
| 5 | Cross-module return (detail → list) | filter/context คงอยู่ | PASS |
| 6 | Back button generic "Back" label | Product ยืนยันเป็น intentional variation | PASS — ไม่ใช่ finding |

## BOA-005 — Button Hierarchy (8 เคส)

ขั้นกด: ตรวจ label, icon, tone, size, placement, disabled/hidden และ keyboard focus ของปุ่มตัวแทนทุก pattern

| # | เคสที่ตรวจ | ผล |
|---|---|---|
| 1 | Primary action tone/placement | PASS |
| 2 | Secondary / outline actions | PASS |
| 3 | Destructive confirm (type-to-confirm / disabled safeguard) | PASS |
| 4 | Icon-only buttons (aria-label/tooltip) | PASS |
| 5 | Row menu "..." actions | PASS |
| 6 | Modal / editor footer hierarchy | PASS |
| 7 | Disabled / permission-hidden behavior | PASS |
| 8 | Keyboard focus บนปุ่ม | PASS |

Findings บันทึก (ไม่ใช่เคส FAIL แต่เป็น consistency gap): Article editor button tone, modal footer order ไม่สม่ำเสมอ, Option destructive outlined style, Categories "Set active/inactive" copy → ส่ง BOA-013–015

## BOA-006 — Search, Filter, Sort, Reset, Pagination (8 เคส)

ขั้นกด: ใช้ข้อมูล fixture จริงของแต่ละ list ทดสอบทุก function

| # | เคสที่ตรวจ | ผล |
|---|---|---|
| 1 | Search | PASS |
| 2 | Filter selects | PASS |
| 3 | Filter dropdown เมื่อผลลัพธ์เหลือ 1 รายการ | FAIL → confirmed cross-module defect (dropdown ถูก panel/table clip เห็นซ้ำ Asset List, User List และทุกเมนู) |
| 4 | Sort | PASS |
| 5 | Reset | PASS |
| 6 | Pagination + page-1 reset เมื่อเปลี่ยนเงื่อนไข | PASS |
| 7 | Filter persistence detail → back | PASS |
| 8 | Empty result copy + reset เข้าถึงได้ | PASS |

## BOA-007 — Table, Mobile Card, Badge, Chip

ขั้นกด: ตรวจ row/card ตัวแทนทุก module ทุก viewport รวม text ยาวและหลาย tags

| # | เคสที่ตรวจ | ผล |
|---|---|---|
| 1 | Desktop table column/action parity | PASS |
| 2 | Mobile card conversion ≤760px | PASS |
| 3 | Meta truncation / ellipsis | PASS |
| 4 | Badge / chip semantics | PASS |
| 5 | Row action / card action parity | PASS |

Documentation inconsistencies บันทึกส่ง BOA-013–015: User mobile Username/reference ใน spec แต่ prototype ไม่มี, breakpoint 767 vs 760, meta 50% class coverage ไม่ครบ

## BOA-008 — Modal, Form, Confirmation, Result State

ขั้นกด: เปิด/ปิดด้วยปุ่ม, backdrop, ESC → ตรวจ focus, scroll, validation, target/impact/reason, confirm/cancel, result

| # | เคสที่ตรวจ | ผล |
|---|---|---|
| 1 | เปิด/ปิด modal ตัวแทนทุกประเภท (short form, confirmation, destructive, preview, drawer, result) | PASS |
| 2 | Categories modal title ภาษาไทย | confirmed inconsistency — title ต้องเป็น English, copy ภายในคงเดิม |
| 3 | Modal footer order บาง flow เป็น Confirm → Cancel | confirmed gap — canonical คือ Cancel → Confirm |
| 4 | Read-only preview/detail/drawer ปิดด้วย backdrop/ESC ไม่ครบ | confirmed policy gap — read-only ต้องปิดด้วย Close + backdrop + ESC; dirty form/confirmation ไม่ปิด backdrop/ESC; long-running lock ปิดได้ตาม flow |
| 5 | Keyboard focus | confirmed defect (Medium) — ไม่มี initial visible focus, ไม่มี focus trap, ไม่ restore focus กลับ opener |
| 6 | Validation / blocked / result states | PASS |
| 7 | Destructive safeguard / type-to-confirm | PASS (intentional) |

หมายเหตุ: 1 เคสเดิมที่อ้าง Prototype scenario ถูกยกเลิกเพราะ current UI ไม่มี scenario นั้น — ตรวจจาก flow/state ที่เข้าถึงได้จริงแทน

## BOA-009 — Screen States และ Responsive (QA-01..10)

ขั้นกด: ใช้ Prototype scenario/fixture ที่มีอยู่ ตรวจ text overlap, button overflow, modal height, table scroll, header/action collision ทุก viewport

| # | เคสที่ตรวจ | ผล |
|---|---|---|
| QA-01–QA-07 | loading, empty no data, partial error, full error, unauthorized, stale data, blocked action | PASS |
| QA-08 | empty-after-filter copy ข้ามหน้ารายการ | confirmed inconsistency (Low) — canonical title `ไม่พบข้อมูล` + subtitle ตามบริบท + คง Reset/Clear filters |
| QA-09, QA-10 | responsive layout / collision checks | PASS |

Fixture gap: page-state fixture ไม่ครบทุก module — จัดเป็น coverage gap ไม่ใช่ defect; breakpoint terminology doc inconsistency → ส่ง BOA-014/015

## Boundary

- Read-only audit — ไม่แก้ shared CSS, component, modal helper, route หรือ protected screen
- แยก intentional variation ออกจาก inconsistency ทุกจุด
