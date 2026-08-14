---
name: core-portal-logging
description: TukDaeng Back Office, Tukdaeng app IOS
---

# TukDaeng Logging Workflow

Workflow สำหรับส่งบันทึกการทำงาน (work logs) ไปยัง Core Portal MCP system — **แบ่งการทำงานเป็น 2 ระยะที่แยกจากกันชัดเจน**

## When to Trigger
- User asks: "ส่ง log", "บันทึกงาน", "ส่ง core portal", "สรุปงาน", "สรุปงานวันนี้"
- Task: เสร็จสมบูรณ์หรือเสร็จส่วนหนึ่งที่ต้องบันทึก
- Problem: "ทำไมไม่มี status", "ลืมส่ง log"

---

## Table of Contents

- [ภาพรวม Workflow (2 ระยะ)](#ภาพรวม-workflow-2-ระยะ)
- [ระยะที่ 1: สรุปงาน (Summarize)](#ระยะที่-1-สรุปงาน-summarize)
- [ระยะที่ 2: ส่ง log (Submit)](#ระยะที่-2-ส่ง-log-submit)
- [วิธีส่ง log (Transport)](#วิธีส่ง-log-transport)
- [API Configuration](#api-configuration)
- [Application List](#application-list)
- [Categories](#categories)
- [Status Values](#status-values)
- [Payload Format](#payload-format)
- [Examples](#examples)
- [Common Mistakes](#common-mistakes)
- [Checklist](#checklist)

---

## ภาพรวม Workflow (2 ระยะ)

```
ระยะที่ 1: สรุปงาน            ระยะที่ 2: ส่ง log
─────────────────           ─────────────────
เรียก get_project_context   ⚠️ ต้องได้รับคำยืนยันจากผู้ใช้ก่อน
+ get_time_summary (ชั่วโมง)       (ห้ามส่งถ้าผู้ใช้ยังไม่ยืนยัน)
+ session context ปัจจุบัน
↓                              ↓
วิเคราะห์ + สรุปภาพรวม        สร้าง payload จากสรุประยะที่ 1
↓                              ↓
แสดงรายการหัวข้องาน          ส่งผ่าน submit_logs / curl
+ ร่างข้อความ log จริง        ↓
(ภาษาง่าย ๆ ไม่เทคนิค)        รายงานผลให้ผู้ใช้
↓
ถามยืนยันผู้ใช้
"พอใจไหม? แก้ไขเพิ่มไหม?"
↓
ห้ามส่ง log ในระยะนี้
```

**กฎเหล็ก:**
- ระยะที่ 1 **ห้ามส่ง log เด็ดขาด** — เป็นเพียงการสรุปเพื่อให้ผู้ใช้ตรวจทาน
- ระยะที่ 2 **ต้องได้รับคำยืนยันจากผู้ใช้ก่อน** — ถ้าผู้ใช้ยังไม่ยืนยัน ห้ามส่ง และต้องถามซ้ำ
- ทั้งสองระยะแยกจากกันชัดเจน — ห้ามข้ามระยะ ห้ามส่ง log ในระหว่างที่กำลังสรุป

---

## ระยะที่ 1: สรุปงาน (Summarize)

### เป้าหมาย
- รวบรวมและสรุปงานที่ทำใน **วันนี้** บวกกับ **session context ปัจจุบัน**
- แสดงภาพรวมเป็นภาษาที่คนทั่วไปอ่านเข้าใจง่าย
- **ห้ามส่ง log เด็ดขาด** จนกว่าผู้ใช้จะสั่งในระยะที่ 2

### ขั้นตอน

#### 1. เรียกข้อมูลจาก kanban-tukdaeng MCP

เรียก `get_project_context` จาก MCP server `kanban-tukdaeng` (เป็น tool ที่ควรเรียกก่อนเสมอเพื่อ resume session):

```
mcp_call_tool(server_name="kanban-tukdaeng", tool_name="get_project_context")
```

ข้อมูลที่ได้: board ปัจจุบัน + recent session summaries — ใช้เป็นแหล่งข้อมูล "วันนี้" และ "session ก่อน ๆ"

#### 1.5. ดึงชั่วโมงทำงานรวมจาก kanban (บังคับ)

หลังจาก `get_project_context` แล้ว **ต้องเรียก `get_time_summary`** เพื่อดึงสรุปชั่วโมงทำงานของ task ที่เสร็จแล้ว (DONE) ในวัน/ช่วงเวลาที่ต้องการ — เป็น tool ที่ออกแบบมาเฉพาะสำหรับงานนี้ (คำนวณ total + breakdown รายวัน + flag task ที่ชั่วโมงดูต่ำเกินไป):

```
mcp_call_tool(
  server_name="kanban-tukdaeng",
  tool_name="get_time_summary",
  arguments={
    "date": "<YYYY-MM-DD>",   # วันที่ต้องการสรุป (default: วันนี้ใน tz)
    "tz": "Asia/Bangkok",     # timezone สำหรับคำนวณ work day + morning/afternoon
    "status": "done"          # default: done (เฉพาะ task ที่เสร็จแล้ว)
  }
)
```

**พารามิเตอร์ที่ใช้บ่อย:**
- `date` — สรุปเฉพาะวันเดียว (เช่น `"2026-08-14"`) — **ใช้ตัวนี้เป็นหลักเวลาส่ง log รายวัน**
- `from_date` + `to_date` — สรุปเป็นช่วงวัน (เช่น สัปดาห์นี้) — ใช้เมื่อส่ง log ครอบคลุมหลายวัน
- `period` — `"morning"` / `"afternoon"` / `"all"` (default: `all`) — กรองตามช่วงเวลาในวัน
- `status` — `"done"` (default) เฉพาะ task ที่เสร็จ / `"all"` รวม in_progress และ todo ด้วย
- `tz` — timezone สำหรับคำนวณ work day และ morning/afternoon split (default: `Asia/Bangkok`)

> **ข้อจำกัดที่รู้:** `hours_spent` เป็น cumulative per-task total — tool นี้ attribute ชั่วโมงทั้งหมดของ task ไปยังวันที่ task ถูกย้ายไป done ถ้า task ทำข้ามหลายวัน ชั่วโมงทั้งหมดจะนับรวมเข้าวันที่เสร็จทั้งหมด (known limitation)

**ผลลัพธ์ที่ได้จาก `get_time_summary`:**
- รายการ task ที่เข้าเงื่อนไข พร้อม `hours_spent` ของแต่ละ task
- `total_hours` — รวมชั่วโมงทั้งหมด (ใช้ค่านี้เป็น `totalHours` ใน payload ได้เลย)
- สรุปรายวัน (per-date breakdown) — กรณีสรุปหลายวัน
- ส่วน `analysis` — flag task DONE ที่ `hours_spent` ดูต่ำผิดปกติเมื่อเทียบกับประเภท/ความซับซ้อนของงาน พร้อมค่า `log_time` ที่แนะนำให้แก้ไข — **ถ้ามี flag ให้แจ้งผู้ใช้และถามว่าจะใช้ค่าเดิมหรือปรับตามคำแนะนำ**

**วิธีใช้ค่าจาก `get_time_summary`:**
1. ใช้ `total_hours` จากผลลัพธ์เป็น `totalHours` ใน payload ได้โดยตรง — **ห้ามปล่อยว่าง/ใช้ default** ถ้าดึงค่าจาก kanban ได้
2. แสดงรายการ task ที่นำมารวมให้ผู้ใช้เห็นด้วย เช่น:

```
ชั่วโมงทำงานรวมจาก kanban (get_time_summary — วัน 2026-08-14):
- Task A (hours_spent: 1.5)
- Task B (hours_spent: 2.0)
- Task C (hours_spent: 0.5)
รวม: 4.0 ชม.
```

3. ถ้ามีส่วน `analysis` flag task ที่ชั่วโมงต่ำเกินไป → แสดงให้ผู้ใช้เห็นและถามว่าจะใช้ค่าเดิมหรือปรับ เช่น:

```
⚠️ ระบบ flag task ที่ชั่วโมงดูต่ำเกินไป:
- Task B (hours_spent: 0.25) → แนะนำให้ log_time เป็น ~1.5 ชม.
ต้องการใช้ค่าเดิม (0.25) หรือปรับตามคำแนะนำ (1.5)?
```

**กรณีที่ต้องเสริมด้วย `get_board` (task ที่ยังไม่ done):**

`get_time_summary` ดึงเฉพาะ task DONE โดย default ถ้าใน session นี้มี task ที่ยัง `in_progress` และต้องการรวมชั่วโมงด้วย ให้เรียก `get_board` เสริมเพื่อดู `hours_spent` ของ task เหล่านั้น แล้วบวกเพิ่มเข้ากับ `total_hours` จาก `get_time_summary`:

```
mcp_call_tool(server_name="kanban-tukdaeng", tool_name="get_board")
```

- ดู task ใน `in_progress` ที่เกี่ยวข้องกับ session นี้
- รวม `hours_spent` ของ task เหล่านั้น บวกเข้ากับ `total_hours` จาก `get_time_summary`
- ถ้า task ยังจับเวลาอยู่ (อยู่ใน `in_progress`) ค่า `hours_spent` อาจยังไม่รวมเวลาที่กำลังจับ — ประเมินเพิ่มจาก session context ถ้าจำเป็น
- แสดงให้ผู้ใช้เห็นชัดว่าส่วนไหนมาจาก `get_time_summary` (DONE) และส่วนไหนมาจาก `get_board` (in_progress) เช่น:

```
ชั่วโมงทำงานรวม:
- จาก get_time_summary (task DONE วันนี้): 3.0 ชม.
- จาก get_board (task in_progress): 1.0 ชม.
รวม: 4.0 ชม.
```

**กรณีที่ดึงจาก kanban ไม่ได้ — ประเมินจากงานที่ทำแทน (บังคับ):**

ถ้าดึงจาก kanban แล้วไม่ได้ค่ามา (เช่น `get_time_summary` คืน total_hours เป็น 0, ไม่มี task DONE ในวันที่ระบุ, หรือเรียกไม่สำเร็จ) **ต้องประเมินเวลาจากงานที่ทำใน session นี้แทน** โดย:

1. ดูรายการงานที่ทำใน session นี้ (จาก session context) แล้วประเมินเวลาตามความซับซ้อน/ขนาดของงาน:
   - งานเล็ก (เช่น แก้บั๊กเดียว, เพิ่ม field) → ประมาณ 0.5-1 ชม.
   - งานกลาง (เช่น เพิ่ม endpoint + ทดสอบ) → ประมาณ 1-3 ชม.
   - งานใหญ่ (เช่น ฟีเจอร์ใหม่หลายส่วน + migration + ทดสอบ) → ประมาณ 3-6 ชม.
2. รวมเวลาของทุกงานย่อยเป็น `totalHours`
3. **แจ้งผู้ใช้ชัดเจน** ว่าค่านี้ประเมินจากงานที่ทำ ไม่ได้มาจาก kanban เช่น:

```
ชั่วโมงทำงาน (ประเมินจากงานที่ทำ — ไม่ได้มาจาก kanban):
- เพิ่ม endpoint /all + /reorder สำหรับ Department: ~1.5 ชม.
- เพิ่ม endpoint /all + /reorder สำหรับ Position: ~1.5 ชม.
- ทดสอบ 4 endpoints + แก้บั๊ก: ~1 ชม.
รวม: 4.0 ชม. (ประเมิน)
```

> **กฎเหล็ก:** ต้องมี `totalHours` เสมอ — ห้ามปล่อยว่าง/ใช้ default ของระบบ ถ้าดึงจาก kanban ไม่ได้ ให้ประเมินจากงานที่ทำแทน พร้อมแจ้งผู้ใช้ว่าเป็นค่าประเมิน

#### 2. รวมข้อมูลจาก session context ปัจจุบัน

นำสิ่งที่ทำใน session นี้ (จากประวัติการทำงานใน conversation ปัจจุบัน) มารวมกับข้อมูลจาก `get_project_context`:
- งานที่ทำเสร็จใน session นี้
- งานที่กำลังทำ / ยังไม่เสร็จ
- การแก้ไข / ปรับปรุงที่เกิดขึ้น

#### 3. วิเคราะห์และสรุปเป็นภาพรวม

- **แยกงานตามแอป** — ถ้างานกระจายหลายแอป (เช่น webadmin, auth, setting) ให้สรุปเป็นรายการเดียวต่อ 1 แอป
- **ใช้ภาษาทั่วไปเข้าใจง่าย** — พยายามไม่ใช้คำศัพท์เทคนิคถ้าไม่จำเป็น แปลงคำเทคนิค (เช่น EF Core, DTO, Mapper, Repository) เป็นภาษาที่อธิบายผลลัพธ์ ไม่ใช่วิธีทำ
- **เน้นสิ่งที่ทำและผลลัพธ์** — ไม่ต้องอธิบายวิธีทำละเอียด
- **ถ้าต้องใช้คำเทคนิค ให้มีคำอธิบายความหมายง่าย ๆ ต่อท้าย**

#### 4. แสดงสรุปให้ผู้ใช้ดู

แสดงผลในรูปแบบ:
- **ภาพรวม** — บอกว่าวันนี้/session นี้ทำอะไรไปบ้าง (1-2 บรรทัด)
- **รายการหัวข้องาน** — แยกตามแอป แต่ละหัวข้อเป็นภาษาง่าย ๆ
- **category ที่เสนอ** — หมวดงานที่เหมาะสม (ดู [Categories](#categories))
- **status ที่เสนอ** — สถานะที่เหมาะสม (ดู [Status Values](#status-values))
- **totalHours ที่ดึงจาก kanban** — รวมชั่วโมงทำงานจาก `get_time_summary` (task DONE) + `get_board` (task in_progress ถ้ามี) (ดูขั้นตอน 1.5)

#### 5. แสดง "ร่างข้อความ log" ที่จะส่งจริง (บังคับ)

หลังจากแสดงสรุปภาพรวมแล้ว **ต้องแสดงร่างข้อความ log จริงที่จะส่งเข้าระบบ** ให้ผู้ใช้เห็นด้วย เพื่อให้ผู้ใช้ตรวจทานได้ว่าข้อมูลที่จะส่งเข้าไปเป็นแบบไหน

**สิ่งที่ต้องแสดง:**
- **`logs[0]` ฉบับเต็ม** — ข้อความ string เดียวที่จะส่งเข้า `logs` array ตามโครงสร้าง "ภาพรวม + bullet list" (ดู [การเขียนรายละเอียดงาน (logs)](#การเขียนรายละเอียดงาน-logs))
  - แสดงในรูปแบบที่อ่านง่าย (rendered) ไม่ใช่ escape `\n` ตรง ๆ ถ้าแสดงใน markdown block
  - อาจแสดงทั้งฉบับ rendered (เห็น bullet list จริง) และฉบับ raw (เห็น `\n`) ก็ได้ เพื่อให้ผู้ใช้เห็นชัด
- **payload ที่จะส่ง** — แสดง field หลัก ๆ ที่จะส่ง: `appName`, `category`, `status`, `startDate`, `endDate`, `totalHours`, `logs`

**รูปแบบที่แนะนำให้แสดง:**

```
## ร่างข้อความ log (1 รายการตามกฎ)

**ภาพรวม (overview):**
> <ภาพรวม 50-250 ตัวอักษร>

**รายการหัวข้องาน:**
- <งานย่อย 1>
- <งานย่อย 2>
- <งานย่อย 3>

---

**โครงสร้าง `logs` ที่จะส่งจริง (1 string entry):**

<ภาพรวม>
- <งานย่อย 1>
- <งานย่อย 2>
- <งานย่อย 3>

**ข้อมูลที่เสนอ:**
- **แอป:** <ชื่อแอป> (app_name)
- **category:** <หมวดงาน>
- **status:** <สถานะ>
- **startDate / endDate:** <วันที่>
- **totalHours:** <ชั่วโมงรวมจาก kanban> (ดึงจาก `get_time_summary` + `get_board` สำหรับ task in_progress ถ้ามี)

**ชั่วโมงทำงานรวมจาก kanban:**
- <Task A> (hours_spent: <X>)
- <Task B> (hours_spent: <Y>)
- รวม: <totalHours> ชม.
```

> **สำคัญ:** การแสดงร่างข้อความ log เป็นส่วนหนึ่งของระยะที่ 1 — **ห้ามส่ง log จริง** ในขั้นตอนนี้ เป็นเพียงการแสดงให้ผู้ใช้ตรวจทานก่อนยืนยัน

#### 6. ถามยืนยันผู้ใช้ (ทุกครั้ง)

หลังแสดงสรุปและร่างข้อความ log ต้องถามผู้ใช้ทุกครั้งว่า:
- พอใจกับข้อมูลสรุปและร่างข้อความ log หรือไม่
- ต้องการแก้ไข/เพิ่ม/ลดอะไรเพิ่มเติมหรือไม่
- ถ้าพอใจแล้ว ให้สั่ง "ส่ง log" เพื่อไประยะที่ 2

**ตัวอย่างคำถามที่ควรถาม:**
> "นี่คือสรุปงานและร่างข้อความ log ที่จะส่ง ครับ พอใจกับข้อมูลแล้วหรือต้องการแก้ไขอะไรเพิ่มเติม? ถ้าพอใจ สั่ง 'ส่ง log' ได้เลย"

### กฎสำคัญระยะที่ 1

- ⚠️ **ห้ามส่ง log ในระยะนี้เด็ดขาด** — ห้ามเรียก `submit_logs` ห้ามเรียก curl ส่ง log ห้ามเรียก API ใด ๆ ที่ส่งข้อมูลเข้า Core Portal
- ⚠️ **ห้ามข้ามไประยะที่ 2 อัตโนมัติ** — ต้องหยุดรอคำสั่งจากผู้ใช้เสมอ
- ต้องถามผู้ใช้ทุกครั้งก่อนจบระยะนี้
- ถ้าผู้ใช้ขอแก้ไข → แก้ไขสรุปแล้วแสดงใหม่ แล้วถามยืนยันอีกครั้ง
- ถ้าผู้ใช้บอก "ส่ง log" / "ยืนยัน" / "OK ส่งเลย" → ไประยะที่ 2

### ตัวอย่างการเปลี่ยนประวัติงานทางเทคนิคเป็นภาษาทั่วไป

จากประวัติ (ร่างเทคนิค):
- "แก้ UpdateProfileCommand, UpdateUserCommand, ลบ _repository.Update() เพื่อป้องกัน race condition ที่ mark ทุก property เป็น Modified"

สรุป log:
- "แก้ปัญหาข้อมูลตำแหน่ง/แผนกไม่อัปเดตเวลาบันทึกพร้อมกัน โดยปรับการบันทึกให้อัปเดตเฉพาะฟิลด์ที่เปลี่ยนแปลงจริง"

จากประวัติ (ร่างเทคนิค):
- "สร้าง DepartmentEndpoints, PositionEndpoints บน dev-masterdata, ลงทะเบียน DI"

สรุป log:
- "สร้าง API สำหรับจัดการข้อมูลแผนกและตำแหน่ง (CRUD) ในระบบตั้งค่า"

---

## ระยะที่ 2: ส่ง log (Submit)

### เงื่อนไขเริ่ม (ต้องครบทั้งหมด)
- ✅ ระยะที่ 1 เสร็จสิ้นแล้ว (มีสรุปงานที่ผู้ใช้ตรวจทานแล้ว)
- ✅ **ได้รับคำยืนยันจากผู้ใช้** — เช่น "ส่ง log", "ส่งเลย", "ยืนยัน", "OK", "ไป"
- ❌ ถ้าผู้ใช้ยังไม่ยืนยัน → **ห้ามส่ง** และต้องถามผู้ใช้เพื่อขอยืนยัน

### ขั้นตอน

#### 1. ตรวจสอบการยืนยัน

ก่อนส่ง ต้องแน่ใจว่าผู้ใช้ยืนยันแล้ว:
- ถ้าผู้ใช้พูดชัดเจนว่าให้ส่ง (เช่น "ส่ง log", "ส่งเลย", "ยืนยัน") → ดำเนินการส่ง
- ถ้าผู้ใช้ยังเป็นกลาง / ไม่ชัดเจน → **ถามยืนยันอีกครั้ง** เช่น "ยืนยันจะส่ง log ใช่ไหม?"
- ถ้าผู้ใช้ปฏิเสธ / ขอแก้ไข → กลับไประยะที่ 1 แก้ไขสรุป

#### 2. สร้าง payload จากสรุประยะที่ 1

ใช้ข้อมูลสรุปที่ผู้ใช้ตรวจทานแล้ว สร้าง payload ตาม [Payload Format](#payload-format):
- เลือก `appName` จาก [Application List](#application-list) (หรือใช้ `applicationName` ก็ได้)
- ใส่ `category` (required), `status`, `totalHours` ตามที่สรุป
- `logs` เป็น array ที่มี **1 รายการเท่านั้น** — รวมงานทั้งหมดเป็นข้อความเดียว

#### 3. ส่ง log

**ส่งผ่าน MCP `core-portal` ก่อนเสมอ** (ห้ามใช้ curl โดยตรง) ตาม [วิธีส่ง log (Transport)](#วิธีส่ง-log-transport) ด้านล่าง:
1. เรียก `mcp_list_tools(server_name="core-portal")` เพื่อยืนยันว่ามี tool `submit_logs`
2. ส่งผ่าน `mcp_call_tool(server_name="core-portal", tool_name="submit_logs", arguments={...payload...})`
3. ถ้า MCP ล้มเหลว → แจ้งผู้ใช้ แล้วใช้ curl เป็น fallback

#### 4. รายงานผลให้ผู้ใช้

- ส่งสำเร็จ → บอกผู้ใช้ว่าส่งเข้าระบบแล้ว (แสดงข้อความตอบกลับจากระบบ)
- ส่งไม่สำเร็จ → บอกผู้ใช้ว่าเกิดข้อผิดพลาด พร้อมรายละเอียด และถามว่าจะลองส่งใหม่หรือไม่

### กฎสำคัญระยะที่ 2

- ⚠️ **ต้องได้รับคำยืนยันจากผู้ใช้ก่อนเสมอ** — ห้ามส่ง log โดยอัตโนมัติ
- ถ้าผู้ใช้ยังไม่ยืนยัน ต้องถามซ้ำจนกว่าจะได้คำตอบชัดเจน
- ใช้ข้อมูลสรุปจากระยะที่ 1 เท่านั้น — ห้ามเปลี่ยนแปลงเนื้อหาโดยไม่แจ้งผู้ใช้
- ถ้างานกระจายหลายแอป → ส่งแยกครั้งกัน (1 ครั้งต่อ 1 แอป) และรายงานผลรวมให้ครบ

---

## วิธีส่ง log (Transport)

> **กฎเหล็ก:** ต้องส่งผ่าน MCP `core-portal` เป็นวิธีหลักเสมอ — ห้ามใช้ curl โดยตรงโดยไม่ได้ลอง MCP ก่อน ใช้ curl เป็น fallback เฉพาะเมื่อเรียก MCP แล้วล้มเหลวจริงเท่านั้น

### วิธีที่ 1: ผ่าน MCP `core-portal` (วิธีหลัก — บังคับใช้ก่อนเสมอ)

MCP server `core-portal` เปิดใช้งานอยู่ใน `~/.config/devin/mcp_config.json` (ไม่ได้ disabled) ให้เรียก tool `submit_logs` ก่อนเสมอ:

```
mcp_call_tool(server_name="core-portal", tool_name="submit_logs", arguments={...payload...})
```

**ขั้นตอน:**
1. ตรวจสอบว่า MCP server `core-portal` พร้อมใช้งาน — เรียก `mcp_list_tools(server_name="core-portal")` ก่อนถ้าไม่แน่ใจ
2. ถ้ามี tool `submit_logs` อยู่ → ส่งผ่าน MCP ทันที (ห้ามข้ามไปใช้ curl)
3. ถ้า MCP ส่งสำเร็จ → รายงานผลให้ผู้ใช้ จบงาน
4. ถ้า MCP ส่งล้มเหลว (error, timeout, หรือไม่มี tool `submit_logs`) → ไปวิธีที่ 2 (curl)

> **สำคัญ:** อย่าเข้าใจผิดว่า `core-portal` ถูก disabled — ปัจจุบันเปิดใช้งานอยู่ หากเรียก `mcp_list_tools` แล้วพบ tool `submit_logs` แสดงว่าใช้ได้ ให้ส่งผ่าน MCP เท่านั้น

### วิธีที่ 2: ผ่าน curl (fallback — ใช้เฉพาะเมื่อ MCP ล้มเหลวจริง)

ใช้ curl เฉพาะเมื่อเรียก MCP `core-portal` แล้วล้มเหลว (error, timeout, หรือไม่พบ tool `submit_logs`) เท่านั้น ก่อนใช้ curl ต้องแจ้งผู้ใช้ว่า MCP ล้มเหลวและจะใช้ curl แทน

```bash
curl -sS -X POST "https://coreportal-production.up.railway.app/api/agent/logs" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: sk_univ_f98d483559d1696def536dce7fbae326d0a5a98c329389ae" \
  -d '{
    "app_name": "TukDaeng Back Office",
    "start_date": "2026-08-14",
    "end_date": "2026-08-14",
    "category": "Feature",
    "status": "Done",
    "logs": ["เพิ่มระบบแบ่งหน้า (Pagination) ในฟีเจอร์พื้นที่โครงการ"]
  }'
```

**สังเกต:** ใน curl ใช้ snake_case (`app_name`, `start_date`, `end_date`, `total_hours`) ตามที่ backend รับ — ต่างจาก MCP input ที่ใช้ camelCase (`appName`, `startDate`, `endDate`, `totalHours`)

---

## API Configuration

- **API Key:** `sk_univ_f98d483559d1696def536dce7fbae326d0a5a98c329389ae`
- **Server:** `https://coreportal-production.up.railway.app`
- **Endpoint:** `POST /api/agent/logs` (header `X-API-Key: <apiKey>`)
- **MCP Config:** `~/.codeium/windsurf/mcp_config.json` / `~/.config/devin/mcp_config.json`
- **Script:** `C:\Users\Admin\Desktop\TukDaeng\mcp-server.js`

---

## Application List

> **กฎสำคัญ:** ให้ส่งด้วย `appName` หรือ `applicationName` (alias) ต้องใช้ชื่อให้ตรงตามตารางนี้เท่านั้น

| ชื่อ | วิธีส่ง | หมายเหตุ |
|---|---|---|
| TukDaeng Back Office | `appName = "TukDaeng Back Office"` หรือ `applicationName = "TukDaeng Back Office"` | ส่งด้วย appName หรือ applicationName ก็ได้ |
| Tukdaeng app IOS | `appName = "Tukdaeng app IOS"` หรือ `applicationName = "Tukdaeng app IOS"` | ส่งด้วย appName หรือ applicationName ก็ได้ |

---

## Categories

หมวดงานที่ส่งได้ (ไม่คำนึงถึงตัวพิมพ์เล็ก-ใหญ่ / case-insensitive):

- `Requirement` — ข้อกำหนด
- `Design` — การออกแบบ
- `Feature` — ฟีเจอร์ใหม่
- `Bug Fix` — แก้ไขข้อผิดพลาด
- `Testing` — การทดสอบ
- `Refactor` — การปรับปรุงโค้ด
- `Deploy / DevOps` — การนำขึ้นระบบ/DevOps
- `Documentation` — เอกสาร
- `Meeting` — การประชุม

> **หมายเหตุ:** หากระบุไม่ตรงกับค่าในรายการ ระบบจะจัดเป็น `Unassigned` อัตโนมัติ

---

## Status Values

สถานะงาน (Optional — ไม่ระบุก็ได้ ค่าต้องเป็นภาษาอังกฤษเหล่านี้เท่านั้น):

- `"Doing"` — กำลังทำ
- `"Done"` — เสร็จสิ้น
- `"Blocked"` — ติด/รอ

* ⚠️ **กฎ WIP Limit:** ผู้ใช้งานแต่ละคนสามารถตั้งสถานะ `"Doing"` ได้เพียง 1 งานต่อ 1 โปรเจกต์ ณ ช่วงเวลาเดียวกัน (ระบบคำนวณและล็อกแยกตามรายบัญชีอย่างอิสระ แม้ในโปรเจกต์เดียวกันจะมีนักพัฒนาหลายคนก็ตาม) หากต้องการเริ่มงาน `Doing` ชิ้นใหม่ผ่าน API กรุณาปิดหรือเปลี่ยนสถานะงาน `Doing` เดิมของคุณในโปรเจกต์นั้นเป็น `Done` หรือ `Blocked` ก่อน

---

## Payload Format

### Required Fields

```typescript
{
  apiKey?: string          // API Key (optional ถ้าตั้ง CORE_PORTAL_API_KEY ใน env)
  appName?: string         // ชื่อแอป — ใช้ตามตาราง Application List (ส่ง appName หรือ applicationName ก็ได้)
  applicationName?: string // Alias สำหรับ appName
  category: string         // หมวดงาน (ดู Categories) — required, case-insensitive, ระบุไม่ตรงจะเป็น Unassigned
  startDate?: string       // YYYY-MM-DD (หรือใช้ startedAt แทน)
  endDate?: string         // YYYY-MM-DD (หรือใช้ stoppedAt แทน)
  startedAt?: string       // ISO timestamp — จะถูกแปลงเป็น YYYY-MM-DD อัตโนมัติ
  stoppedAt?: string       // ISO timestamp — จะถูกแปลงเป็น YYYY-MM-DD อัตโนมัติ
  status?: string         // สถานะ (ดู Status Values) — optional
  totalHours?: number      // จำนวนชั่วโมงรวมของงาน — optional (หรือใช้ total_hours ก็ได้)
  total_hours?: number     // Alias สำหรับ totalHours
  logs: string[]           // array ของข้อความงาน — required
}
```

### `totalHours`

- **ชื่อฟิลด์ใน MCP input:** `totalHours` (camelCase) — MCP server แปลงเป็น `total_hours` (snake_case) ส่งให้ backend เอง
- **ชนิด:** `number` (รับทศนิยมได้ เช่น `1.5`, `4.25`)
- **แหล่งที่มา (ตามลำดับความสำคัญ):**
  1. **ดึงจาก `get_time_summary`** ของ `kanban-tukdaeng` MCP (ดูขั้นตอน 1.5 ในระยะที่ 1) — ใช้ค่า `total_hours` จากผลลัพธ์โดยตรง (สรุป task DONE ตามวัน/ช่วงเวลา + timezone)
  2. **เสริมด้วย `get_board`** สำหรับ task ที่ยัง `in_progress` (เพราะ `get_time_summary` ดึงเฉพาะ DONE โดย default) — บวก `hours_spent` ของ task in_progress เข้ากับ `total_hours`
  3. **ถ้าดึงจาก kanban ไม่ได้** (`total_hours` เป็น 0, ไม่มี task DONE ในวันที่ระบุ, หรือเรียกไม่สำเร็จ) → **ประเมินจากงานที่ทำใน session นี้** โดยดูความซับซ้อน/ขนาดของงาน พร้อมแจ้งผู้ใช้ว่าเป็นค่าประเมิน
- **กฎเหล็ก:** **ต้องมี `totalHours` เสมอ** — ห้ามปล่อยว่าง/ใช้ default ของระบบ
- **ค่า default ของระบบ (ใช้เฉพาะเมื่อไม่ระบุ):** `status: "Doing"` → `null`, `status` อื่น → ชั่วโมงทำงานมาตรฐาน — **แต่ skill นี้ต้องระบุเสมอ ไม่ใช้ default**
- **ตัวอย่าง:** งาน 2 ชม. → `totalHours: 2`; งานครึ่งวัน → `totalHours: 4`

### การเลือก app_name

- **ใช้ `app_name` เป็นหลัก** — ดูจากตาราง Application List ด้านบน
- ต้องใช้ชื่อแอปให้ตรงตามตารางเท่านั้น

### `totalHours` / `total_hours`

- **ชื่อฟิลด์ใน MCP input:** `totalHours` (camelCase) หรือ `total_hours` (snake_case) — MCP server รองรับทั้งสองแบบ
- **ชนิด:** `number` (รับทศนิยมได้ เช่น `1.5`, `4.25`)
- **แหล่งที่มา (ตามลำดับความสำคัญ):**
  1. **ดึงจาก `get_time_summary`** ของ `kanban-tukdaeng` MCP (ดูขั้นตอน 1.5 ในระยะที่ 1) — ใช้ค่า `total_hours` จากผลลัพธ์โดยตรง (สรุป task DONE ตามวัน/ช่วงเวลา + timezone)
  2. **เสริมด้วย `get_board`** สำหรับ task ที่ยัง `in_progress` (เพราะ `get_time_summary` ดึงเฉพาะ DONE โดย default) — บวก `hours_spent` ของ task in_progress เข้ากับ `total_hours`
  3. **ถ้าดึงจาก kanban ไม่ได้** (`total_hours` เป็น 0, ไม่มี task DONE ในวันที่ระบุ, หรือเรียกไม่สำเร็จ) → **ประเมินจากงานที่ทำใน session นี้** โดยดูความซับซ้อน/ขนาดของงาน พร้อมแจ้งผู้ใช้ว่าเป็นค่าประเมิน
- **กฎเหล็ก:** **ต้องมี `totalHours` เสมอ** — ห้ามปล่อยว่าง/ใช้ default ของระบบ ถ้าดึงจาก kanban ไม่ได้ ให้ประเมินจากงานที่ทำแทน พร้อมแจ้งผู้ใช้ว่าเป็นค่าประเมิน

### การเขียนรายละเอียดงาน (logs)

**กฎสำคัญ:**
1. **`logs` ต้องมี 1 รายการเท่านั้น** — รวมงานทั้งหมดที่ทำในการส่งครั้งนั้นเป็นข้อความเดียว (string เดียวที่ขึ้นบรรทัดใหม่ได้)
2. **โครงสร้างข้อความ: "ภาพรวม" นำหน้า ตามด้วย "รายการหัวข้องาน" แบบ bullet list** (ดูรูปแบบด้านล่าง)
3. **ใช้ภาษาที่คนทั่วไปอ่านเข้าใจง่าย** — เน้นภาพรวม ไม่ใส่คำเทคนิคลงไปเยอะถ้าไม่จำเป็น
4. **เน้นสิ่งที่ทำและผลลัพธ์** — ไม่ต้องอธิบายวิธีทำละเอียด
5. **ถ้าต้องใช้คำเทคนิค ให้มีคำอธิบายความหมายง่าย ๆ ต่อท้าย**

#### โครงสร้างข้อความ log (บังคับ)

ข้อความใน `logs[0]` ต้องมี 2 ส่วนตามลำดับ:

1. **ภาพรวม (overview)** — บรรทัดแรก เป็นประโยคสรุปงานที่ทำ
   - ความยาว **50-250 ตัวอักษร** (นับรวมวงเล็บและเครื่องหมาย)
   - ตั้งชื่อฟีเจอร์/ระบบเป็นภาษาที่เข้าใจง่าย เช่น "ระบบจัดการโครงสร้างองค์กร (Organization Management)"
   - สรุปในระดับ "ทำอะไรกับระบบอะไร" ไม่ใช่รายละเอียดเทคนิค
2. **รายการหัวข้องาน (bullet list)** — ขึ้นบรรทัดใหม่แล้วใช้ `- ` นำหน้าแต่ละงานย่อย
   - แต่ละ bullet คือ 1 งานย่อยที่ทำจริง เขียนกระชับ 1 บรรทัด
   - ถ้ามีหลายงานที่เกี่ยวเนื่องกัน สามารถรวมเป็น bullet เดียวโดยใช้ `;` คั่นภายในบรรทัดเดียวกันได้

**รูปแบบ (template):**
```
<ภาพรวม 50-250 ตัวอักษร>
- <งานย่อย 1>
- <งานย่อย 2>
- <งานย่อย 3>
```

> **ข้อยกเว้น:** ถ้าเป็นงานเดียวสั้น ๆ ที่ภาพรวมอธิบายครบแล้ว (ไม่มีงานย่อยแยกได้) สามารถมีแค่ภาพรวมอย่างเดียว ไม่ต้องมี bullet list ก็ได้

**ตัวอย่างที่ถูก (1 รายการ มีภาพรวม + bullet list):**
```typescript
logs: [
  "พัฒนาด้านหลังบ้านของระบบจัดการโครงสร้างองค์กร (Organization Management) — เพิ่มฟังก์ชันดึงข้อมูลและจัดลำดับแผนก/ตำแหน่ง พร้อมสร้าง API และทดสอบจริง\n- เพิ่มฟังก์ชันดึงข้อมูล Department/Position ทั้งหมดและตาม ID พร้อมเรียงลำดับตามค่าที่ผู้ใช้ตั้ง\n- เพิ่ม field ลำดับ (SortOrder) ในข้อมูลส่งกลับ; สร้างคำสั่งจัดลำดับใหม่สำหรับ Department และ Position\n- เพิ่ม endpoint ดึงข้อมูลทั้งหมด (/all) และบันทึกลำดับใหม่ (/reorder) ทั้ง 2 ชุด\n- สร้างไฟล์ทดสอบและทดสอบจริง 4 endpoints ผ่านครบ; แก้บั๊กรูปแบบ body และ header ที่หายไประหว่างทดสอบ\n- คืนค่าข้อมูล DB เป็นลำดับเดิม"
]
```

> **สังเกต:** ใน string ใช้ `\n` ขึ้นบรรทัดใหม่ และใช้ `- ` นำหน้าแต่ละ bullet — เป็นข้อความ 1 string ที่มีหลายบรรทัด ไม่ใช่หลาย array element

**ผิด (หลายรายการแยกกันใน array):**
```typescript
logs: [
  "เพิ่มฟังก์ชันดึงข้อมูล Department/Position ทั้งหมด",
  "เพิ่ม field ลำดับ (SortOrder) ในข้อมูลส่งกลับ",
  "สร้างคำสั่งจัดลำดับใหม่สำหรับ Department และ Position"
]  // ❌ 3 รายการแยกกัน ต้องมี 1 รายการเท่านั้น
```

**ผิด (คำเทคนิคเยอะเกินไป ไม่มีภาพรวม):**
```typescript
logs: [
  "เพิ่ม GetPagedByProjectIdAsync method ใน IProjectAreaRepository interface รับ ProjectAreaQuery parameter พร้อม page, pageSize, q fields และ implement ใน ProjectAreaRepository โดยใช้ EF Core Skip/Take และ Where clause สำหรับ search"
]  // ❌ ไม่มีภาพรวมนำหน้า + คำเทคนิคเยอะเกินไป
```

**ผิด (ภาพรวมสั้นเกินไป ต่ำกว่า 50 ตัวอักษร):**
```typescript
logs: [
  "แก้บั๊ก\n- แก้บั๊ก A\n- แก้บั๊ก B"
]  // ❌ ภาพรวม "แก้บั๊ก" สั้นเกินไป ไม่สื่อสาระ
```

**ผิด (ภาพรวมยาวเกินไป เกิน 250 ตัวอักษร):**
```typescript
logs: [
  "พัฒนาด้านหลังบ้านของระบบจัดการโครงสร้างองค์กร (Organization Management) โดยเพิ่มฟังก์ชันดึงข้อมูล Department และ Position ทั้งหมดและตาม ID พร้อมเรียงลำดับตามค่าที่ผู้ใช้ตั้ง และเพิ่ม field ลำดับ (SortOrder) ในข้อมูลส่งกลับ พร้อมสร้างคำสั่งจัดลำดับใหม่สำหรับ Department และ Position และเพิ่ม endpoint ดึงข้อมูลทั้งหมด และบันทึกลำดับใหม่ ทั้ง 2 ชุด และสร้างไฟล์ทดสอบและทดสอบจริง 4 endpoints ผ่านครบ พร้อมแก้บั๊กรูปแบบ body และ header ที่หายไประหว่างทดสอบ และคืนค่าข้อมูล DB เป็นลำดับเดิม..."
]  // ❌ ภาพรวมยาวเกินไป รายละเอียดควรอยู่ใน bullet list ไม่ใช่ภาพรวม
```

### กฎสำคัญ

- ต้องส่ง `appName` หรือ `applicationName` — ต้องตรงตามตาราง Application List
- `logs` เป็น array ของ string — แต่ละ string คือ 1 รายการงาน
- `category` ต้องระบุเสมอ — required, ระบบรับ case-insensitive และระบุไม่ตรงจะจัดเป็น `Unassigned`
- `status` เป็น optional — ถ้าระบุ ต้องเป็นค่าจาก Status Values เท่านั้น
- `startDate`/`endDate` หรือ `startedAt`/`stoppedAt` ต้องระบุอย่างน้อยหนึ่งคู่

---

## Examples

### ตัวอย่าง 1: ส่ง log ด้วย appName (TukDaeng Back Office) — แนะนำ

```typescript
{
  apiKey: "sk_univ_f98d483559d1696def536dce7fbae326d0a5a98c329389ae",
  appName: "TukDaeng Back Office",
  category: "Feature",
  startDate: "2026-07-23",
  endDate: "2026-07-23",
  status: "Done",
  logs: [
    "เพิ่มระบบแบ่งหน้า (Pagination) ในฟีเจอร์พื้นที่โครงการ"
  ]
}
```

### ตัวอย่าง 2: ส่ง log ด้วย appName (Tukdaeng app IOS)

```typescript
{
  apiKey: "sk_univ_f98d483559d1696def536dce7fbae326d0a5a98c329389ae",
  appName: "Tukdaeng app IOS",
  category: "Feature",
  startDate: "2026-07-23",
  endDate: "2026-07-23",
  status: "Done",
  logs: [
    "สร้างหน้าจัดการพื้นที่โครงการใหม่ (Project Areas) พร้อมฟังก์ชัน CRUD"
  ]
}
```

### ตัวอย่าง 3: ส่ง log ด้วย applicationName (alias สำหรับ appName)

```typescript
{
  apiKey: "sk_univ_f98d483559d1696def536dce7fbae326d0a5a98c329389ae",
  applicationName: "TukDaeng Back Office",
  category: "Feature",
  startDate: "2026-07-23",
  endDate: "2026-07-23",
  status: "Done",
  logs: [
    "เพิ่มระบบแบ่งหน้า (Pagination) ในฟีเจอร์พื้นที่โครงการ"
  ]
}
```

### ตัวอย่าง 4: ส่งหลายงานรวมใน 1 log entry (แนะนำ — ภาพรวม + bullet list)

```typescript
{
  apiKey: "sk_univ_f98d483559d1696def536dce7fbae326d0a5a98c329389ae",
  appName: "TukDaeng Back Office",
  category: "Feature",
  startDate: "2026-07-23",
  endDate: "2026-07-23",
  status: "Done",
  logs: [
    "เพิ่มระบบแบ่งหน้า (Pagination) ในฟีเจอร์พื้นที่โครงการ — ปรับ API และฐานข้อมูลให้รองรับการค้นหาและแบ่งหน้า\n- แก้ Repository ให้รองรับการค้นหาและแบ่งหน้า\n- อัปเดต API Endpoint ให้รับพารามิเตอร์ page, pageSize และคำค้นหา"
  ]
}
```

---

## Common Mistakes

### 1. ส่ง app_name ที่ไม่ตรงกับตาราง

**ผิด:**
```typescript
{
  apiKey: "...",
  app_name: "TukDaeng Backoffice",  // ❌ ชื่อไม่ตรงกับตาราง (ต้องเป็น "TukDaeng Back Office")
  category: "Feature",
  // ...
}
```

**ถูก:**
```typescript
{
  apiKey: "...",
  app_name: "TukDaeng Back Office",  // ✅ ใช้ชื่อตามตาราง Application List
  category: "Feature",
  // ...
}
```

### 2. ใช้ category ที่ไม่อยู่ในรายการ

**ผิด:**
```typescript
category: "Development"  // ⚠️ ไม่มีในรายการ ระบบจะจัดเป็น Unassigned
```

**ถูก:**
```typescript
category: "Feature"  // ✅ ใช้ค่าจาก Categories
```

> **หมายเหตุ:** ระบบรับค่าแบบ case-insensitive แต่ควรใช้ค่ามาตรฐานจากรายการ

### 3. ใช้ status ภาษาไทย

**ผิด:**
```typescript
status: "เสร็จสมบูรณ์"  // ❌ ต้องเป็นภาษาอังกฤษ
```

**ถูก:**
```typescript
status: "Done"  // ✅ ใช้ค่าจาก Status Values
```

### 3. ใช้ app_name ที่ไม่ถูกต้อง

**ผิด:**
```typescript
app_name: "TukDaeng Backoffice"  // ❌ ไม่พบในระบบ (ชื่อผิด)
```

**ถูก:**
```typescript
app_name: "TukDaeng Back Office"  // ✅ ใช้ชื่อจาก Application List
```

### 5. ส่ง logs เป็นหลายรายการแยกกัน

**ผิด:**
```typescript
logs: [
  "สร้าง API สำหรับจัดการหมวดหมู่ Classification (CRUD) ในระบบตั้งค่า",
  "เพิ่มระบบกรองรายการตามประเภทหมวดหมู่ และตรวจสอบชื่อซ้ำแยกตามประเภท",
  "สร้างตารางฐานข้อมูลสำหรับเก็บหมวดหมู่ Classification พร้อมข้อมูลเริ่มต้น 14 รายการ"
]  // ❌ 3 รายการแยกกัน ต้องมี 1 รายการเท่านั้น
```

**ถูก (ภาพรวม + bullet list ใน 1 string):**
```typescript
logs: [
  "สร้าง API สำหรับจัดการหมวดหมู่ Classification (CRUD) ในระบบตั้งค่า รองรับ 4 ประเภท\n- เพิ่มระบบกรองรายการตามประเภทและตรวจสอบชื่อซ้ำแยกตามประเภท\n- สร้างตารางฐานข้อมูลพร้อมข้อมูลเริ่มต้น 14 รายการ"
]  // ✅ รวมเป็น 1 รายการ มีภาพรวมนำหน้า ตามด้วย bullet list
```

### 5. ใช้ app_name ที่ไม่ตรงกับตาราง

**ผิด:**
```typescript
app_name: "TukDaeng Backoffice"  // ❌ ชื่อไม่ตรงกับตาราง (ต้องเป็น "TukDaeng Back Office")
```

**ถูก:**
```typescript
app_name: "TukDaeng Back Office"  // ✅ ใช้ชื่อตามตาราง Application List
```

### 7. ส่ง logs เป็นหลายรายการแยกกัน

**ผิด:**
```typescript
logs: [
  "สร้าง API สำหรับจัดการหมวดหมู่ Classification (CRUD) ในระบบตั้งค่า",
  "เพิ่มระบบกรองรายการตามประเภทหมวดหมู่ และตรวจสอบชื่อซ้ำแยกตามประเภท",
  "สร้างตารางฐานข้อมูลสำหรับเก็บหมวดหมู่ Classification พร้อมข้อมูลเริ่มต้น 14 รายการ"
]  // ❌ 3 รายการแยกกัน ต้องมี 1 รายการเท่านั้น
```

**ถูก (ภาพรวม + bullet list ใน 1 string):**
```typescript
logs: [
  "สร้าง API สำหรับจัดการหมวดหมู่ Classification (CRUD) ในระบบตั้งค่า รองรับ 4 ประเภท\n- เพิ่มระบบกรองรายการตามประเภทและตรวจสอบชื่อซ้ำแยกตามประเภท\n- สร้างตารางฐานข้อมูลพร้อมข้อมูลเริ่มต้น 14 รายการ"
]  // ✅ รวมเป็น 1 รายการ มีภาพรวมนำหน้า ตามด้วย bullet list
```

### 8. ส่ง log โดยไม่รอคำยืนยันจากผู้ใช้ (ระยะที่ 2)

**ผิด:** หลังสรุปงานเสร็จ (ระยะที่ 1) แล้วส่ง log ทันทีโดยไม่ถามผู้ใช้
```typescript
// ❌ สรุปเสร็จ → ส่ง submit_logs ทันที โดยไม่รอคำยืนยัน
```

**ถูก:** สรุปงาน → แสดงร่างข้อความ log → ถามผู้ใช้ → รอคำยืนยัน → ส่ง log
```
// ✅ ระยะที่ 1: สรุป → แสดงร่าง log → ถาม "พอใจไหม? สั่งส่ง log ได้"
// ✅ ระยะที่ 2: ผู้ใช้ยืนยัน → ส่ง submit_logs
```

---

## Checklist

### ระยะที่ 1: สรุปงาน
- [ ] เรียก `get_project_context` จาก `kanban-tukdaeng` MCP
- [ ] เรียก `get_time_summary` จาก `kanban-tukdaeng` MCP (สรุปชั่วโมง task DONE ตามวัน/ช่วงเวลา + tz `Asia/Bangkok`) — ใช้ `total_hours` จากผลลัพธ์เป็น `totalHours`
- [ ] ถ้ามีส่วน `analysis` flag task ที่ชั่วโมงต่ำเกินไป → แสดงให้ผู้ใช้เห็นและถามว่าจะใช้ค่าเดิมหรือปรับตามคำแนะนำ
- [ ] ถ้ามี task `in_progress` ที่เกี่ยวข้องกับ session นี้ → เรียก `get_board` จาก `kanban-tukdaeng` MCP เสริม แล้วบวก `hours_spent` ของ task เหล่านั้นเข้ากับ `total_hours` (แสดงแยกส่วนให้ผู้ใช้เห็นชัด)
- [ ] แสดงรายการ task ที่นำมารวมให้ผู้ใช้เห็นด้วย
- [ ] ถ้าดึงจาก kanban ไม่ได้ (`total_hours` เป็น 0 / ไม่มี task DONE / เรียกไม่สำเร็จ) → **ประเมินจากงานที่ทำใน session นี้** และแจ้งผู้ใช้ว่าเป็นค่าประเมิน
- [ ] รวมข้อมูลวันนี้ + session context ปัจจุบัน
- [ ] สรุปเป็นภาษาง่าย ๆ (หลีกเลี่ยงคำเทคนิค)
- [ ] แสดงรายการหัวข้องานแยกตามแอป
- [ ] **แสดง "ร่างข้อความ log" ที่จะส่งจริง** — ทั้ง `logs[0]` ฉบับเต็ม (ภาพรวม + bullet list) และ payload ที่จะส่ง (app_name, category, status, dates, totalHours)
- [ ] ถามผู้ใช้ยืนยัน: พอใจหรือต้องการแก้ไข?
- [ ] ⚠️ ห้ามส่ง log ในระยะนี้

### ระยะที่ 2: ส่ง log (หลังได้รับคำยืนยัน)
- [ ] ได้รับคำยืนยันจากผู้ใช้แล้ว (เช่น "ส่ง log", "ยืนยัน", "ส่งเลย")
- [ ] มี `apiKey` ถูกต้อง
- [ ] มี `app_name` ตามตาราง Application List — ต้องตรงตามตารางเท่านั้น
- [ ] `category` อยู่ในรายการ Categories (case-insensitive, ระบุไม่ตรงจะเป็น Unassigned)
- [ ] `status` (ถ้าระบุ) อยู่ในรายการ Status Values
- [ ] ถ้าส่ง `status: "Doing"` ต้องไม่มีงาน `Doing` เดิมของผู้ใช้คนเดียวกันในโปรเจกต์เดียวกันค้างอยู่ (กฎ WIP Limit — 1 Doing/คน/โปรเจกต์) หากมี ให้เปลี่ยนงานเดิมเป็น `Done` หรือ `Blocked` ก่อน
- [ ] `startDate` และ `endDate` อยู่ในรูปแบบ `YYYY-MM-DD`
- [ ] `totalHours` เป็นตัวเลขบวก ทศนิยมได้ — **ดึงจาก `get_time_summary` ของ `kanban-tukdaeng`** (ดูขั้นตอน 1.5) ถ้ามี task in_progress ให้เสริมด้วย `get_board` ถ้าดึงไม่ได้ให้ **ประเมินจากงานที่ทำใน session นี้** และแจ้งผู้ใช้ — **ต้องมีเสมอ ห้ามปล่อยว่าง/ใช้ default**
- [ ] `logs` เป็น array ที่มี **1 รายการเท่านั้น** — รวมงานทั้งหมดเป็นข้อความเดียว (string เดียวที่ขึ้นบรรทัดใหม่ได้)
- [ ] โครงสร้างข้อความ log: **ภาพรวม (50-250 ตัวอักษร)** นำหน้า ตามด้วย **bullet list** (`- ` นำหน้าแต่ละงานย่อย ขึ้นบรรทัดใหม่ด้วย `\n`)
- [ ] **ส่งผ่าน MCP `core-portal` ก่อนเสมอ** — เรียก `mcp_list_tools` ยืนยันมี `submit_logs` แล้วส่งผ่าน `mcp_call_tool` (ห้ามใช้ curl โดยตรงโดยไม่ได้ลอง MCP ก่อน)
- [ ] ถ้า MCP ล้มเหลว → แจ้งผู้ใช้ แล้วใช้ curl เป็น fallback
- [ ] รายงานผลการส่งให้ผู้ใช้ (สำเร็จ/ล้มเหลว)
