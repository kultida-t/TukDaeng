---
name: work-summary
description: สรุปงานและจับเวลาการทำ task สำหรับ TukDaeng — รองรับทั้ง Progress/Handoff Summary สำหรับงานที่ยังไม่จบ และ Final Work Summary หลังปิด task โดยใช้เวลาจริงจาก Kanban
---

# TukDaeng Work Summary

Workflow สำหรับจับเวลาและสรุปงานที่ทำใน task — ครอบคลุมทั้งวงจรตั้งแต่ **เริ่มทำ task**, **ส่งต่องานที่ยังไม่จบข้าม session**, และ **ปิด task ก่อนสร้าง Final Work Summary** โดยใช้ kanban-tukdaeng MCP เป็นแหล่งข้อมูลและบันทึกหลัก **ไม่มีการส่ง log ไปยังระบบภายนอก**

## When to Trigger

**เริ่มทำ task:**
- User พูดว่า: "เริ่มทำ task ...", "เริ่ม task ...", "ขอเริ่ม ...", "ทำ task ... นี้"
- ผู้ใช้สั่งให้เริ่มงานใหม่ → ย้าย task เข้า `in_progress` เพื่อเริ่มจับเวลา

**ทำ task เสร็จ:**
- User พูดว่า: "เสร็จแล้ว", "ทำเสร็จแล้ว", "ปิด task นี้", "จบ task แล้ว"
- ผู้ใช้ยืนยันผลลัพธ์และอนุญาตให้ปิด task → Verify → ย้ายเข้า `done` → อ่าน Final Actual Time → สร้างและบันทึก Final Work Summary → แสดง Final Work Summary Copy Block

**บันทึก session ก่อนขึ้น session ใหม่ (task ยังไม่จบ):**
- User พูดว่า: "บันทึก session", "ขอบันทึกก่อน", "เซฟ session", "จะทำต่อ session ใหม่"
- ผู้ใช้ต้องการ pause task เพื่อไปทำต่อใน session ใหม่ → บันทึก session note (task ยัง `in_progress`)

**สรุปงานทั่วไป:**
- User asks: "สรุปงาน", "สรุปงานวันนี้", "บันทึกงาน", "สรุป session", "ทำอะไรบ้างวันนี้"

**สรุป task เดี่ยว (per-task summary):**
- User asks: "สรุป task นี้", "สรุปงาน task <task id>", "สรุป task <ชื่อ>", "ขอสรุป task ปัจจุบัน"
- ผู้ใช้ต้องการสรุปเฉพาะ task หนึ่งเพื่อก๊อปไปลงระบบอื่น — แสดงเวลาเริ่ม-จบจริง + hours_spent + copy block ราย task

---

## Table of Contents

- ภาพรวม Workflow (4 สถานการณ์)
- สถานการณ์ที่ 1: เริ่มทำ task
- สถานการณ์ที่ 2: ทำ task เสร็จ
- สถานการณ์ที่ 3: บันทึก session ก่อนขึ้น session ใหม่ (task ยังไม่จบ)
- สถานการณ์ที่ 4: สรุป task เดี่ยว (per-task summary)
- ขั้นตอนสรุปงาน (ดึงข้อมูลจาก kanban)
- หมวดหมู่งาน (Work Category)
- รูปแบบผลลัพธ์ (ทั้งสรุปรวม + ราย task + copy block ราย task)
- ตัวจับเวลาอัตโนมัติ (Auto Timer)
- ตัวอย่างผลลัพธ์
- Checklist

---

## ภาพรวม Workflow (4 สถานการณ์)

```
สถานการณ์ที่ 1: เริ่มทำ task        สถานการณ์ที่ 2: ทำ task เสร็จ
────────────────────────           ──────────────────────────────
ผู้ใช้: "เริ่มทำ task X"             ผลงานผ่าน Verification และผู้ใช้อนุญาตให้ปิด
↓                                    ↓
ย้าย task → in_progress             move_task → done
(เริ่มจับเวลาอัตโนมัติ)              (หยุด timer + bank เวลาจริงอัตโนมัติ)
↓                                    ↓
เริ่มทำงานใน task นั้น               อ่าน Final Task + Activity Timeline
                                     ↓
                                     สร้าง Final Work Summary ชุดเดียว
                                     ↓
                                     save_session_note (Final Summary)
                                     ↓
                                     แสดง Final Work Summary Copy Block

สถานการณ์ที่ 3: บันทึก session ก่อนขึ้น session ใหม่
──────────────────────────────────────────────
ผู้ใช้: "บันทึก session" / "จะทำต่อ session ใหม่"
↓
สร้าง Progress / Handoff Summary (ราย task — เท่าที่ทำได้)
↓
ถามยืนยันผู้ใช้
↓
ผู้ใช้ยืนยัน → save_session_note
↓
⚠️ task ยังอยู่ใน in_progress (ห้ามย้ายเป็น done)
↓
ใน session ใหม่: ดึง Project/Kanban context + task เดิม + Session Note ล่าสุด
แล้วทำ task เดิมต่อจาก Next Step
```

**กฎเหล็ก:**
- ไม่มีการส่ง log ไปยังระบบภายนอก (core-portal หรือ API ใด ๆ)
- งานที่มีการแก้ไฟล์ต้องได้รับการยืนยันผลลัพธ์จากผู้ใช้ก่อนเริ่ม completion workflow ตามกฎ Kanban ของ repository
- กรณีที่ 2: **ต้องปิด task ก่อนสร้าง Final Work Summary** และต้องบันทึก Final Session Note + แสดง Final Work Summary Copy Block จาก Final Summary ชุดเดียวกัน
- กรณีที่ 3 (handoff): **ห้ามย้าย task เป็น `done`** — task ต้องอยู่ใน `in_progress` เพื่อทำต่อใน session ใหม่
- Progress/Handoff Summary ไม่ใช่ Final Work Summary และห้ามใช้เวลาที่ยังวิ่งอยู่เป็น Final Actual Time
- สำหรับ `progress/handoff` และ `report-only` ให้แสดงทั้งสรุปรวมและสรุปราย task ในผลลัพธ์เดียวกัน; `final` ใช้ canonical Final Summary ภายในและแสดง Final Work Summary Copy Block ตาม template เฉพาะ

---

## สถานการณ์ที่ 1: เริ่มทำ task

### เงื่อนไขเริ่ม
- ผู้ใช้สั่งให้เริ่ม task ใหม่ (เช่น "เริ่มทำ task X", "เริ่ม task Y", "ขอเริ่ม ...")
- มี task ใน kanban ที่ต้องการเริ่มทำ

### ขั้นตอน

#### 1. ตรวจสอบ task ที่จะเริ่ม
- ถ้าผู้ใช้ระบุ task_id ชัดเจน → ใช้ task_id นั้น
- ถ้าผู้ใช้ระบุแค่ชื่อ/คำค้น → เรียก `get_board` หรือ `get_project_context` เพื่อหา task ที่ตรง
- ถ้าเป็น task ใหม่ที่ยังไม่มีใน kanban → ถามผู้ใช้ว่าต้องการสร้าง task ใหม่หรือไม่ ถ้าใช่ให้ใช้ `create_task`

#### 2. ตรวจสอบ task อื่นที่อยู่ใน `in_progress` (สำคัญ)

ก่อนย้าย task ใหม่เข้า `in_progress` ต้องตรวจสอบก่อนว่ามี task อื่นของผู้ใช้คนเดียวกันที่อยู่ใน `in_progress` อยู่แล้วหรือไม่ (เพราะควรทำ task เดียวในแต่ละเวลา):

- เรียก `get_board` เพื่อดู task ทั้งหมด
- ถ้ามี task อื่นอยู่ใน `in_progress` → แจ้งผู้ใช้และถามว่า:
  - ต้องการ pause task เดิมก่อน (ย้ายออกจาก `in_progress` ชั่วคราว) แล้วเริ่ม task ใหม่?
  - หรือทำ task เดิมให้จบก่อน?
- ถ้าผู้ใช้เลือก pause task เดิม → ย้าย task เดิมออกจาก `in_progress` (เช่น ไป `todo` หรือ `backlog`) ก่อน

#### 3. ย้าย task เข้า `in_progress` (เริ่มจับเวลา)

```
mcp_call_tool(
  server_name="kanban-tukdaeng",
  tool_name="move_task",
  arguments={
    "task_id": "<task_id>",
    "status": "in_progress"
  }
)
```

**หลังย้ายแล้ว:**
- ระบบเริ่มจับเวลาอัตโนมัติ
- แจ้งผู้ใช้ว่า "เริ่มจับเวลา task <ชื่อ task> แล้ว"
- เริ่มทำงานใน task นั้นตามที่ผู้ใช้สั่ง

#### กฎสำคัญ
- ⚠️ **ควรมี task ใน `in_progress` เพียง 1 task ต่อผู้ใช้ในแต่ละเวลา** — ถ้ามี task เดิมค้างอยู่ ให้ pause ก่อน
- ห้ามข้ามขั้นตอนการตรวจสอบ task อื่นใน `in_progress`
- หลังย้ายเข้า `in_progress` แล้ว ให้เริ่มทำงานได้เลย ไม่ต้องรอยืนยันเพิ่ม

---

## สถานการณ์ที่ 2: ทำ task เสร็จ

### เงื่อนไขเริ่ม
- งานครบ Acceptance Criteria และผ่าน Verification ตามขอบเขตของ task
- ผู้ใช้บอกว่า task เสร็จแล้วหรืออนุญาตให้ปิด (เช่น "เสร็จแล้ว", "ทำเสร็จแล้ว", "ปิด task นี้", "จบ task แล้ว")
- สำหรับ task ที่มีการแก้ไฟล์ ต้องมีคำยืนยันว่าผลลัพธ์ได้รับการยอมรับก่อนปิด ตามกฎ Kanban ของ repository
- มี task อยู่ใน `in_progress` ที่ต้องการปิด

### ขั้นตอน

#### 1. ตรวจสอบ task ที่อยู่ใน `in_progress`
- เรียก `get_board` เพื่อดู task ที่อยู่ใน `in_progress`
- ถ้ามีหลาย task ใน `in_progress` → ถามผู้ใช้ว่าจะปิด task ไหน
- ถ้าไม่มี task ใน `in_progress` → แจ้งผู้ใช้ว่าไม่มี task ที่กำลังทำอยู่

#### 2. Verify ก่อนปิด
- ตรวจ Acceptance Criteria, test/QA result และผลกระทบตาม task
- ถ้ายังมีงานในขอบเขต task ที่ไม่เสร็จ ให้กลับไปใช้สถานการณ์ที่ 3 และคง `in_progress`
- Open item ที่จะส่งต่อได้ต้องเป็นงานใหม่ที่ไม่ทำให้ task ปัจจุบันไม่ผ่าน Acceptance Criteria

#### 3. ย้าย task เข้า `done` ก่อนสร้าง Final Work Summary

```
mcp_call_tool(
  server_name="kanban-tukdaeng",
  tool_name="move_task",
  arguments={
    "task_id": "<task_id>",
    "status": "done"
  }
)
```

**หลังย้ายแล้ว:**
- ระบบหยุดจับเวลาและบันทึก `hours_spent` อัตโนมัติ (minimum 0.1h)
- ห้ามเรียก `log_time` เพราะจะทำให้เวลาถูกบันทึกซ้ำ

#### 4. อ่าน Final Task + Activity Timeline หลังปิด
- เรียก `get_task` หลัง `move_task → done` สำเร็จ เพื่ออ่านสถานะสุดท้าย, Activity Timeline, Actual Start, Actual End และ Final `hours_spent`
- เรียก `get_time_summary` เพิ่มได้เมื่อต้องสรุปรวม แต่ Final Actual Time ราย task ต้องยึด `hours_spent` หลังปิดจาก Kanban
- ถ้าข้อมูล Final Task หรือเวลาจริงยังอ่านไม่ได้ ให้แจ้งปัญหาและลองดึงใหม่ ห้ามใช้ elapsed/snapshot ขณะ `in_progress` หรือค่าประมาณแทน Final Actual Time

#### 5. สร้าง Final Work Summary ชุดเดียว

สร้าง canonical Final Summary จากข้อมูลหลังปิด โดยอย่างน้อยต้องมี:
- Final Result และสถานะ `done`
- Work Completed และไฟล์ที่แก้ (ถ้ามี)
- Decisions / ข้อสรุปสำคัญ
- Verification / Test Result
- Actual Start / Actual End จาก Activity Timeline
- Final Actual Time จาก Final `hours_spent`
- Issues / Fixes
- Scope Changes (ถ้ามี)
- Open Items และ Next Step

Final Summary ชุดนี้ต้องเป็นแหล่งเดียวสำหรับทั้ง Final Session Note และ Final Work Summary Copy Block ห้ามร่างคนละชุดจนข้อมูลไม่ตรงกัน

#### 6. บันทึก Final Session Note ลง Kanban

เรียก `save_session_note` หลังสร้าง Final Summary แล้ว แม้ task จะเป็น `done` เพื่อเก็บ Persistent Task History:

```
mcp_call_tool(
  server_name="kanban-tukdaeng",
  tool_name="save_session_note",
  arguments={
    "task_id": "<task_id>",
    "summary": "<Final Result แบบกระชับจาก canonical Final Summary>",
    "note": "<canonical Final Summary ฉบับเต็ม>"
  }
)
```

การบันทึก Final Session Note ไม่ใช่การเพิ่มเวลา และห้ามเรียก `log_time`

#### 7. แสดง Final Work Summary Copy Block

- หลัง `save_session_note` สำเร็จ ต้องแสดง Final Work Summary Copy Block ให้ผู้ใช้ทุกครั้ง
- Copy Block ต้องสร้างจาก canonical Final Summary ชุดเดียวกับที่บันทึกใน note
- ใช้ Human-readable `text` Copy Block เดียวตาม template ในหัวข้อ **Final Work Summary Copy Block** โดยตรวจ Mission Mapping ก่อน แล้วแสดง Objective/Feature เมื่อมี mapping จริง ตามด้วย Task Code + Task Name, Category, Final Actual Time และรายละเอียดงานที่ทำ
- Actual Start, Actual End, status, completion status และ workflow metadata ยังคงอยู่ใน canonical Final Summary / Final Session Note แต่ไม่แสดงใน Work Log Copy Block
- แจ้งผู้ใช้ว่า task ถูกปิดแล้วและแสดงเวลาในรูปแบบ `X ชม. Y นาที (D.D ชม.)`

#### กฎสำคัญ
- ⚠️ **Close First:** ห้ามสร้างหรือแสดง Final Work Summary ก่อน `move_task → done`
- ⚠️ Final Actual Time ต้องมาจาก Kanban หลังปิด task เท่านั้น ห้ามใช้ snapshot/elapsed time ตอน `in_progress`
- ⚠️ ห้ามเรียก `log_time` ใน completion workflow ไม่ว่าก่อนหรือหลังปิด task
- ⚠️ ห้ามปรับ `hours_spent` เองระหว่าง completion workflow; ถ้าค่าผิดปกติให้รายงานผู้ใช้และแยกเป็น correction workflow ที่ผู้ใช้สั่งชัดเจน
- ทุก task ที่ปิดต้องมี Final Session Note และ Final Work Summary Copy Block
- **ถ้า task ที่ปิดเป็น task สุดท้ายของเป้าหมาย (Objective) ใน Mission** — ทุก task ของเป้าหมายนั้นเป็น done แล้ว → แจ้งผู้ใช้ว่าเป้าหมายครบ และเสนอเตรียม **หลักฐานส่งตรวจรับด้วย AI** ตาม skill `submission-evidence` (ไฟล์แนบ/ภาพหน้าจอ + คำอธิบาย + ช่อง URL) ให้ลง log พร้อมกัน
- ลำดับบังคับ: Verify → `move_task → done` → อ่าน Final Task + Activity → อ่าน Actual Start/End/Final `hours_spent` → สร้าง Final Summary → `save_session_note` → แสดง Copy Block

---

## สถานการณ์ที่ 3: บันทึก session ก่อนขึ้น session ใหม่ (task ยังไม่จบ)

### เงื่อนไขเริ่ม
- ผู้ใช้ต้องการ pause task เพื่อไปทำต่อใน session ใหม่ (เช่น "บันทึก session", "ขอบันทึกก่อน", "เซฟ session", "จะทำต่อ session ใหม่")
- มี task อยู่ใน `in_progress` ที่ยังไม่เสร็จ

### ขั้นตอน

#### 1. ตรวจสอบ task ที่อยู่ใน `in_progress`
- เรียก `get_board` เพื่อดู task ที่อยู่ใน `in_progress`
- ถ้าไม่มี task ใน `in_progress` → แจ้งผู้ใช้ว่าไม่มี task ที่กำลังทำอยู่

#### 2. สร้าง Progress / Handoff Summary (เท่าที่ทำได้)

ดึงข้อมูลและสรุปตามขั้นตอนในหัวข้อ **ขั้นตอนสรุปงาน** ด้านล่าง:
- เรียก `get_time_summary` (status: `all` เพื่อรวม task in_progress) หรือ `get_board` เพื่อดู `hours_spent` ของ task ที่ยังทำอยู่
- รวม session context ของงานที่ทำใน task นี้ (เท่าที่ทำไปถึงตอนนี้)
- แสดง Progress/Handoff Summary โดยระบุชัดว่าเป็นข้อมูลระหว่างทำ ไม่ใช่ Final Work Summary และเวลายังไม่ใช่ Final Actual Time

#### 3. ถามยืนยันผู้ใช้

หลังแสดงสรุปต้องถามผู้ใช้ทุกครั้งว่า:
- พอใจกับสรุปหรือไม่
- ต้องการแก้ไข/เพิ่ม/ลดอะไรเพิ่มเติมหรือไม่
- ถ้าพอใจแล้ว ให้สั่ง "บันทึก" เพื่อบันทึก session note

#### 4. บันทึก session note ลง kanban

หลังผู้ใช้ยืนยันแล้ว เรียก `save_session_note`:

```
mcp_call_tool(
  server_name="kanban-tukdaeng",
  tool_name="save_session_note",
  arguments={
    "task_id": "<task_id>",
    "summary": "<สรุป session แบบกระชับ — ใช้ภาษาง่าย ๆ ไม่เทคนิค>",
    "note": "<รายละเอียด session: สิ่งที่ทำ, decisions, open items, next step>"
  }
)
```

**พารามิเตอร์:**
- `task_id` (required) — id ของ task ที่เกี่ยวข้อง
- `summary` (required) — สรุปสั้น ๆ 1 บรรทัด
- `note` (required) — รายละเอียดเต็มของ session

**เนื้อหาที่ควรบันทึกใน `note` (กรณี pause):**
- สิ่งที่ทำเสร็จแล้วใน task นี้
- Current State
- สิ่งที่ตัดสินใจ (decisions) และเหตุผล (WHY)
- สิ่งที่ตรวจสอบแล้ว
- **Open Items — สำคัญ** เพื่อให้ session ใหม่รู้ว่าต้องทำอะไรต่อ
- Blockers (ถ้ามี)
- สิ่งที่ยังไม่ได้ทำ
- **Next Step — สำคัญ** เพื่อให้ session ใหม่รู้ว่าจะเริ่มจากตรงไหน
- ควรระบุชัดว่า "task ยังไม่จบ จะทำต่อใน session ใหม่"

#### 5. ⚠️ ห้ามย้าย task เป็น `done`

**สำคัญมาก:** ในสถานการณ์นี้ **ห้ามย้าย task เป็น `done`** — task ต้องอยู่ใน `in_progress` เพื่อ:
- ให้ระบบยังจับเวลาอยู่ (ถ้าผู้ใช้ทำต่อใน session ใหม่ทันที)
- ให้ `get_project_context` ใน session ใหม่เห็นว่า task นี้ยังทำอยู่
- ให้ผู้ใช้สามารถสั่ง "ทำต่อ" ใน session ใหม่ได้เลยโดยไม่ต้องเริ่มจับเวลาใหม่

#### 6. แจ้งผู้ใช้วิธีทำต่อใน session ใหม่

หลังบันทึก session note แล้ว แจ้งผู้ใช้ว่า:
- "บันทึก session note แล้ว task <ชื่อ task> ยังอยู่ใน in_progress"
- "ใน session ใหม่ สั่ง 'ทำต่อ' หรือ 'resume' ระบบจะดึง Project/Kanban context, task ปัจจุบัน และ Session Note ล่าสุด แล้วทำ task เดิมต่อจาก Next Step ได้เลย"

#### 7. Resume ใน session ใหม่

เมื่อเริ่ม session ใหม่เพื่อทำ task เดิมต่อ:
1. เรียก `get_project_context` เพื่อดึง Project/Kanban context
2. ดึง task ปัจจุบันด้วย `get_task` และยืนยันว่าเป็น task เดิม ไม่สร้าง task ใหม่เพียงเพราะเปลี่ยน session
3. อ่าน Session Note ล่าสุดของ task
4. ตรวจ Current State, Decisions, สิ่งที่ตรวจสอบแล้ว, Open Items, Blockers, สิ่งที่ยังไม่ได้ทำ และ Next Step
5. ทำ task เดิมต่อจากจุดที่ค้าง โดยคงสถานะ `in_progress`

#### กฎสำคัญ
- ⚠️ **ห้ามย้าย task เป็น `done`** — task ต้องอยู่ใน `in_progress`
- ⚠️ **ต้องถามผู้ใช้ยืนยันก่อนบันทึก session note** เสมอ
- session note ต้องระบุชัดว่า task ยังไม่จบ + ขั้นตอนถัดไป เพื่อให้ session ใหม่ทำต่อได้
- เวลาที่แสดงใน Progress/Handoff Summary เป็น running/snapshot time เท่านั้น ไม่ใช่ Final Actual Time
- ลำดับ: Progress/Handoff Summary → ถามยืนยัน → `save_session_note` → คง `in_progress` → End Session

---

## สถานการณ์ที่ 4: สรุป task เดี่ยว (per-task summary)

### เงื่อนไขเริ่ม
- ผู้ใช้สั่งสรุปเฉพาะ task หนึ่ง (เช่น "สรุป task นี้", "สรุปงาน task <task id>", "สรุป task <ชื่อ>", "ขอสรุป task ปัจจุบัน")
- ผู้ใช้ต้องการสรุปเฉพาะ task เพื่อก๊อปไปลงระบบอื่น — ไม่ได้ปิด task หรือบันทึก session note

### ขั้นตอน

#### 1. ระบุ task ที่ต้องการสรุป
- ถ้าผู้ใช้ระบุ task_id ชัดเจน → ใช้ task_id นั้น
- ถ้าผู้ใช้ระบุแค่ชื่อ/คำค้น → เรียก `get_board` หรือ `get_project_context` เพื่อหา task ที่ตรง
- ถ้าผู้ใช้บอก "task ปัจจุบัน" → ดู task ที่อยู่ใน `in_progress` ของผู้ใช้

#### 2. ดึงข้อมูล task + Activity timeline
- เรียก `get_task` เพื่อดึง title/description/status/hours_spent และ Activity timeline
- ดึงเวลาเริ่ม (start_time) จาก time event แรกหลัง task ถูกย้ายเข้า `in_progress`
- ดึงเวลาจบ (end_time):
  - task `done` → time event สุดท้าย
  - task `in_progress` → ใช้เวลาปัจจุบัน (now) และคำนวณ "เวลาที่ผ่านไป"

#### 2.1 Hard stop ก่อนตอบ per-task summary
ก่อนตอบสรุป task เดี่ยว ต้องตรวจว่ามีข้อมูลครบ 3 บรรทัดนี้แล้ว:
- `เวลาเริ่ม` จาก Activity timeline ของ `get_task`
- `เวลาจบ` หรือ `ปัจจุบัน` จาก Activity timeline ของ `get_task` หรือเวลาปัจจุบันเมื่อ task ยัง `in_progress`
- `เวลาทำงานจริง` หรือ `เวลาที่ผ่านไป` โดยใช้ `hours_spent` จาก kanban สำหรับ task ที่ `done`

ถ้ายังไม่ได้เรียก `get_task` หรือยังไม่มี 3 บรรทัดนี้ **ห้ามตอบเป็นสรุปสุดท้าย** ให้ดึงข้อมูลเพิ่มก่อนเสมอ ห้ามใช้ `get_time_summary` อย่างเดียวเพื่อสรุป task เดี่ยว เพราะ tool นั้นไม่มี Activity timeline เพียงพอสำหรับเวลาเริ่ม-จบจริง

#### 3. แสดงสรุปราย task + copy block ราย task
- แสดงสรุปราย task ตามรูปแบบในหัวข้อ **รูปแบบผลลัพธ์** (มีเวลาเริ่ม-จบ/ปัจจุบัน + เวลาทำงาน/เวลาที่ผ่านไป + หมวดหมู่งาน + สถานะความสมบูรณ์ + เป้าหมาย + ภาพรวม + ไฟล์ที่แก้ไข + รายละเอียดงาน + ค้าง/ส่งต่อ)
- แสดง **copy block ราย task** สำหรับก๊อปไปลงระบบอื่นโดยตรง

#### 4. ถามยืนยันผู้ใช้
- ถามผู้ใช้ว่าพอใจกับสรุปหรือไม่ ต้องการแก้ไขอะไรเพิ่มเติมหรือไม่
- ถ้าผู้ใช้พอใจ → จบสถานการณ์ (ไม่บันทึก session note ไม่ปิด task)

#### กฎสำคัญ
- ⚠️ **ห้ามบวก/ลด/ปรับชั่วโมงเอง** — ใช้ค่า `hours_spent` จากระบบเป็นค่าจริง
- ⚠️ **ห้ามส่ง log ไปยังระบบภายนอกใด ๆ**
- สถานการณ์นี้ **ไม่บันทึก session note และไม่ปิด task** — แค่แสดงสรุป + copy block
- ถ้าผู้ใช้ต้องการปิด task ด้วย → เปลี่ยนเป็นสถานการณ์ที่ 2 (ทำ task เสร็จ) แทน

---

## ขั้นตอนสรุปงาน (ดึงข้อมูลจาก kanban)

ใช้ในสถานการณ์ที่ต้องสรุปงาน โดยต้องแยกโหมดให้ชัด:
- `progress/handoff` — task ยัง `in_progress`; เวลาที่แสดงเป็น running/snapshot time
- `final` — task เป็น `done` แล้ว; เวลาที่แสดงเป็น Final Actual Time หลังปิด
- `report-only` — สรุปข้อมูลโดยไม่เปลี่ยนสถานะหรือบันทึก note

สำหรับโหมด `final` ให้เข้าหัวข้อนี้หลัง `move_task → done` สำเร็จแล้วเท่านั้น ห้ามใช้ขั้นตอนสรุปงานนี้สร้าง Final Work Summary ขณะ task ยัง `in_progress`

### 1. เรียกข้อมูลจาก kanban-tukdaeng MCP

เรียก `get_project_context` ก่อนเริ่มรวบรวมข้อมูลสรุป (สำหรับโหมด `final` ต้องเรียกหลังปิด task แล้ว):

```
mcp_call_tool(server_name="kanban-tukdaeng", tool_name="get_project_context")
```

ข้อมูลที่ได้: board ปัจจุบัน + recent session summaries — ใช้เป็นแหล่งข้อมูล "วันนี้" และ "session ก่อน ๆ"

### 2. ดึงชั่วโมงทำงานรวมจาก kanban (บังคับ)

หลังจาก `get_project_context` แล้ว **ต้องเรียก `get_time_summary`** เพื่อดึงสรุปชั่วโมงทำงานของ task ที่เสร็จแล้ว (DONE):

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
- `date` — สรุปเฉพาะวันเดียว (เช่น `"2026-08-14"`) — **ใช้ตัวนี้เป็นหลักเวลาสรุปรายวัน**
- `from_date` + `to_date` — สรุปเป็นช่วงวัน (เช่น สัปดาห์นี้)
- `period` — `"morning"` / `"afternoon"` / `"all"` (default: `all`)
- `status` — `"done"` (default) / `"all"` รวม in_progress และ todo
- `tz` — timezone (default: `Asia/Bangkok`)

> **ข้อจำกัดที่รู้:** `hours_spent` เป็น cumulative per-task total — tool นี้ attribute ชั่วโมงทั้งหมดของ task ไปยังวันที่ task ถูกย้ายไป done ถ้า task ทำข้ามหลายวัน ชั่วโมงทั้งหมดจะนับรวมเข้าวันที่เสร็จทั้งหมด (known limitation)

**ผลลัพธ์ที่ได้จาก `get_time_summary`:**
- รายการ task ที่เข้าเงื่อนไข พร้อม `hours_spent` ของแต่ละ task
- `total_hours` — รวมชั่วโมงทั้งหมด
- สรุปรายวัน (per-date breakdown) — กรณีสรุปหลายวัน
- ส่วน `analysis` — flag task DONE ที่ `hours_spent` ดูต่ำผิดปกติ — **ถ้ามี flag ให้แจ้งผู้ใช้** แต่ห้ามเรียก `log_time` หรือแก้เวลาเองใน workflow นี้

### 3. เสริมด้วย `get_board` (task ที่ยังไม่ done)

`get_time_summary` ดึงเฉพาะ task DONE โดย default ถ้าใน session นี้มี task ที่ยัง `in_progress` และต้องการรวมชั่วโมงด้วย ให้เรียก `get_board` เสริม:

```
mcp_call_tool(server_name="kanban-tukdaeng", tool_name="get_board")
```

- ดู task ใน `in_progress` ที่เกี่ยวข้องกับ session นี้
- รวม `hours_spent` ของ task เหล่านั้น บวกเข้ากับ `total_hours` จาก `get_time_summary`
- แสดงให้ผู้ใช้เห็นชัดว่าส่วนไหนมาจาก DONE และส่วนไหนมาจาก in_progress

### 3.1 ดึงเวลาเริ่ม-จบจริงของแต่ละ task (บังคับ)

เพื่อแสดงเวลาเริ่มและเวลาจบจริงของ task ในสรุปราย task ต้องเรียก `get_task` เพื่อดึง Activity timeline ของ task นั้น:

```
mcp_call_tool(
  server_name="kanban-tukdaeng",
  tool_name="get_task",
  arguments={"task_id": "<task_id>"}
)
```

**จาก Activity timeline ให้ดึง:**
- **เวลาเริ่ม (start_time):** timestamp ของ time event แรกที่เกิดหลัง task ถูกย้ายเข้า `in_progress` (หรือ status event ที่เปลี่ยนเป็น `in_progress`)
- **เวลาจบ (end_time):**
  - task `done` → timestamp ของ time event สุดท้าย (หรือ status event ที่เปลี่ยนเป็น `done`)
  - task `in_progress` → **ใช้เวลาปัจจุบัน** (now) เพื่อคำนวณเวลาที่ผ่านไป

**กฎการแสดงเวลา:**
- แสดงเวลาในรูปแบบ `<DD/MM/YYYY HH:MM>` (เช่น `29/08/2026 10:15`)
- สำหรับ task `in_progress` ให้แสดง:
  - `เริ่ม: <start_time>`
  - `ปัจจุบัน: <now>` (ระบุว่า "ยังจับเวลาอยู่")
  - `เวลาที่ผ่านไป: <X> ชม. <Y> นาที` (คำนวณจาก start_time ถึง now)
- สำหรับ task `done` ให้แสดง:
  - `เริ่ม: <start_time>`
  - `จบ: <end_time>`
  - `เวลาทำงาน: <X> ชม. <Y> นาที` (ใช้ค่า `hours_spent` จากระบบ ไม่คำนวณเอง)

**รูปแบบเวลา (Time Format):**
- แสดงเวลาทำงานในรูปแบบ `X ชม. Y นาที (D.D ชม.)` — ทั้งรูปแบบชั่วโมง-นาที และคำนวณเป็นชั่วโมงทศนิยมในวงเล็บ (เช่น `1 ชม. 37 นาที (1.6 ชม.)`, `0 ชม. 39 นาที (0.7 ชม.)`)
- ส่วนแรก `X ชม. Y นาที` แปลงจากทศนิยม: ส่วนจำนวนเต็ม = ชั่วโมง, ส่วนทศนิยม × 60 = นาที
- ส่วนในวงเล็บ `(D.D ชม.)` คือคำนวณเป็นชั่วโมงทศนิยม 1 ตำแหน่ง: `(X × 60 + Y) ÷ 60` ปัดเป็น 1 ตำแหน่งทศนิยม (เช่น 60 นาที = 1.0 ชม., 30 นาที = 0.5 ชม., 39 นาที = 0.7 ชม., 6 นาที = 0.1 ชม., 97 นาที = 1.6 ชม.)
- ใช้รูปแบบนี้ทุกที่ที่แสดงเวลา: ราย task, รวมทั้งหมด, copy block
- **ยกเว้น:** ใน `hours_spent` ที่ส่งกลับจาก kanban ยังคงเป็นทศนิยม (เช่น `1.62`) — แปลงเป็น `X ชม. Y นาที (D.D ชม.)` เฉพาะตอนแสดงผลให้ผู้ใช้

**ถ้าไม่พบ start_time จาก Activity timeline:**
- `final`: หยุดสร้าง Final Work Summary และดึง Final Task + Activity Timeline ใหม่ ห้ามใช้ `hours_spent` แทน Actual Start
- `progress/handoff` หรือ `report-only`: แสดง `hours_spent` ประกอบได้ แต่ต้องแจ้งว่าไม่พบเวลาเริ่มและห้ามเรียกข้อมูลนั้นว่า Final Actual Time

### 4. กรณีดึงเวลาจาก Kanban ไม่ได้

สำหรับ `progress/handoff` หรือ `report-only` ถ้าดึงจาก Kanban ไม่ได้ อาจประเมินเวลาจากงานที่ทำใน session นี้เพื่อให้ข้อมูลประกอบ โดย:

1. ดูรายการงานที่ทำใน session นี้ แล้วประเมินเวลาตามความซับซ้อน/ขนาด:
   - งานเล็ก (เช่น แก้บั๊กเดียว, เพิ่ม field) → ประมาณ 0.5-1 ชม.
   - งานกลาง (เช่น เพิ่ม endpoint + ทดสอบ) → ประมาณ 1-3 ชม.
   - งานใหญ่ (เช่น ฟีเจอร์ใหม่หลายส่วน + migration + ทดสอบ) → ประมาณ 3-6 ชม.
2. รวมเวลาของทุกงานย่อยเป็น `totalHours`
3. **แจ้งผู้ใช้ชัดเจน** ว่าค่านี้ประเมินจากงานที่ทำ ไม่ได้มาจาก kanban

> **Final hard stop:** สำหรับ `final` ห้ามใช้ค่าประมาณทุกกรณี ถ้าอ่าน Final `hours_spent`, Actual Start หรือ Actual End หลังปิดไม่ได้ ให้แจ้งปัญหาและดึง Final Task + Activity Timeline ใหม่ก่อนสร้าง Final Work Summary

### 5. Validation สำหรับ totalHours

หลังจากดึง `totalHours` จาก kanban แล้ว **ต้องตรวจสอบความสอดคล้อง** กับงานที่ทำจริงใน session นี้:

1. เปรียบเทียบ `totalHours` จาก kanban กับงานที่ทำใน session นี้
2. ถ้า `totalHours` ดูต่ำ/สูงเกินไปเมื่อเทียบกับความซับซ้อนของงาน → แจ้งผู้ใช้ แต่ยังคงใช้ค่าจริงจากระบบใน summary

**ตรวจเทียบกับตารางเวลามาตรฐานตามหมวดหมู่งาน (บังคับ):**

นอกจากเทียบกับงานจริงแล้ว ต้องเทียบ `hours_spent` ของแต่ละ task กับเกณฑ์เวลามาตรฐานตามหมวดหมู่งาน:

| หมวดหมู่งาน | เป้าหมาย (ดีมาก) | ห้ามเกิน |
|---|---|---|
| Requirement | 1 ชม. | 1.5 ชม. |
| Design | 1-1.5 ชม. | 2 ชม. |
| Feature | 2 ชม. | 3 ชม. |
| Bug Fix | 1 ชม. | 1.5 ชม. |
| Testing | 1-1.5 ชม. | 2 ชม. |
| Refactor | 1-1.5 ชม. | 2 ชม. |
| Documentation | 0.5 ชม. | 0.5 ชม. |
| Deploy / DevOps | 1-1.5 ชม. | 2 ชม. |
| Meeting | 1 ชม. | 1.5 ชม. |

**กฎการตรวจ:**
- ถ้า `hours_spent` ของ task ใด **เกินค่า "ห้ามเกิน"** ของหมวดนั้น → flag ให้ผู้ใช้เห็น พร้อมแนะนำว่า task นี้ควรถูกแตกเป็น subtask ในครั้งถัดไป
- ถ้า `hours_spent` ต่ำกว่าเป้าหมายมาก → ตรวจดูว่างานสมบูรณ์จริงหรือไม่
- การ flag เป็นการแจ้งเพื่อให้ผู้ใช้ทราบและปรับปรุงการวางแผนครั้งถัดไป — ไม่ได้หมายความว่า task ผิด

**ถ้าค่าเวลาดูผิดปกติ:**
- แจ้งค่าที่ระบบคืนและเหตุผลที่สงสัยให้ผู้ใช้ทราบ
- ห้ามเรียก `log_time` ในทุกกรณี เพราะ auto-timer เป็นผู้ bank เวลาจริงเมื่อย้าย task ออกจาก `in_progress`
- ห้ามแก้ `hours_spent` ระหว่าง completion workflow; การแก้ข้อมูลเวลา (ถ้าจำเป็น) ต้องเป็น correction workflow แยกต่างหากที่ผู้ใช้สั่งชัดเจน
- Final Work Summary ต้องใช้ค่าจริงหลังปิดที่ Kanban แสดงอยู่ในขณะนั้น

### 5.1 การจัดการ task ที่เกินเวลาเป้าหมาย (Over-budget)

เมื่อ `hours_spent` ของ task ใด **เกินค่า "ห้ามเกิน"** ของหมวดหมู่งานนั้น ให้จัดการดังนี้ในสรุปราย task:

**1. แตกรายละเอียดงานออกเป็นส่วนย่อย — แต่ละส่วนระบุหมวดหมู่งานของตัวเอง**

ใน subsection "รายละเอียดงานที่ทำ" ของ task นั้น ให้แบ่งงานออกเป็นกลุ่มย่อยตามช่วงเวลาที่ใช้จริง เพื่อให้เห็นชัดว่าเวลาที่เกินไปใช้ทำอะไร — **แต่ละกลุ่มย่อยต้องระบุหมวดหมู่งานของตัวเอง** เพราะงานที่ทำเพิ่มอาจเป็นคนละหมวดกับ task หลัก (เช่น task หลักเป็น Feature แต่งานที่ทำเพิ่มเป็น Bug Fix + Testing) แต่ละกลุ่มย่อยระบุเวลาที่ใช้ (ประมาณการได้ ถ้า Activity timeline ไม่แยกให้ชัด) ตัวอย่าง:

```
รายละเอียดงานที่ทำ

- งานตามแผน [Feature] (ประมาณ 2 ชม.):
  - <งานย่อย 1 ที่อยู่ในแผนเดิม>
  - <งานย่อย 2 ที่อยู่ในแผนเดิม>
- งานที่ทำเพิ่มระหว่างทำ [Bug Fix] (ประมาณ 1.5 ชม.):
  - <งานที่เกิดขึ้นเพิ่ม เช่น แก้บั๊กที่พบระหว่างทำ> → <ทางแก้>
- งานที่ทำเพิ่มระหว่างทำ [Testing] (ประมาณ 1 ชม.):
  - <งานที่ตามมาจากการแก้ เช่น ทดสอบซ้ำหลังแก้บั๊ก>
```

> การแบ่งนี้เป็นการ **อธิบายรายละเอียดในสรุปเท่านั้น** — ไม่ใช่การแยกเป็นหลาย log ในระบบ ค่า `hours_spent` ยังคงเป็นค่ารวมจริงจากระบบของ task เดียว

**กฎเกณฑ์ "ห้ามเกิน" ของแต่ละส่วนย่อย (บังคับ):**

แต่ละกลุ่มย่อย (ทั้ง "งานตามแผน" และ "งานที่ทำเพิ่ม") ต้องเทียบเวลากับค่า "ห้ามเกิน" ของ **หมวดหมู่งานของส่วนย่อยนั้น** จากตารางเวลามาตรฐาน (ไม่ใช่หมวดของ task หลัก):

- ถ้าเวลาของส่วนย่อยใด **ไม่เกิน** "ห้ามเกิน" ของหมวดนั้น → แสดงเป็น bullet ปกติ
- ถ้าเวลาของส่วนย่อยใด **เกิน** "ห้ามเกิน" ของหมวดนั้น → **ต้องแตกส่วนย่อยนั้นออกอีก** เป็นกลุ่มย่อยย่อยลงไป จนแต่ละกลุ่มอยู่ในเกณฑ์ของหมวดตัวเอง (เหมือนกฎแตก subtask ใน mission-planning)

> **ตัวอย่างการแตกซ้ำ:** task หลัก Feature ใช้ 4.5 ชม. (เกิน 3 ชม.) → แบ่งเป็น งานตามแผน [Feature] 2 ชม. + งานที่ทำเพิ่ม [Bug Fix] 1.5 ชม. + งานที่ทำเพิ่ม [Testing] 1 ชม. — ทั้ง 3 ส่วนไม่เกิน "ห้ามเกิน" ของหมวดตัวเอง (Feature ≤ 3, Bug Fix ≤ 1.5, Testing ≤ 2) จึงไม่ต้องแตกอีก
>
> **ตัวอย่างที่ต้องแตกซ้ำ:** ถ้างานที่ทำเพิ่ม [Bug Fix] ใช้ 2.5 ชม. (เกิน 1.5 ชม. ของ Bug Fix) → ต้องแตก [Bug Fix] ออกอีก เช่น แก้บั๊ก layout มือถือ [Bug Fix] 1.5 ชม. + แก้บั๊ก logic ฟอร์ม [Bug Fix] 1 ชม. จนแต่ละส่วนไม่เกิน 1.5 ชม.

**2. จัดการคำชี้แจงเวลาเกินงบตามโหมด Summary**

เก็บรายละเอียดการวิเคราะห์เวลาเกินงบไว้ใน canonical summary เสมอ สำหรับ `progress/handoff` หรือ `report-only` สามารถแสดง **บล็อกชี้แจงเวลาเกินงบ** แบบ plain text แยกได้ โดยแต่ละส่วนงานที่ทำเพิ่มต้องระบุหมวดหมู่งานของตัวเอง:

```text
ชี้แจงเวลาเกินงบ: <ชื่อ task>
Task ID: <task_id>
หมวดหมู่งานหลัก: <Category ของ task>
เป้าหมายตามแผน: <X> ชม. (เกณฑ์หมวด <Category>)
ใช้จริง: <Y> ชม.
เกิน: <Y − X> ชม.
สาเหตุ: <เหตุผลสั้น ๆ เช่น พบบั๊กเพิ่มระหว่างทำ / requirement เปลี่ยน / dependency ล่าช้า / ตรวจซ้ำเพราะพบ regression>
ส่วนงานที่ทำเพิ่ม (ประมาณ <Y − X> ชม.):
- [Bug Fix] <งานย่อย 1> — <เวลาประมาณ> (เกณฑ์หมวด Bug Fix ≤ 1.5 ชม.)
- [Testing] <งานย่อย 2> — <เวลาประมาณ> (เกณฑ์หมวด Testing ≤ 2 ชม.)
การปรับปรุงครั้งถัดไป: <แนะนำ เช่น ควรแตกเป็น 3 subtask ในแผนครั้งถัดไป (Feature + Bug Fix + Testing แยก)>
```

**3. การ Stamp เวลาจาก Activity Timeline และการแยก Task ย่อย (`<TASK-CODE>a` / `<TASK-CODE>b` / `<TASK-CODE>c`...):**

เมื่อพบว่างานเกินขอบเขตเดิมอย่างมีนัยสำคัญ หรือ AI ประมวลผลหน่วงช้าจนเวลาทะลุเป้า (เช่น วางแผน 2 ชม. แต่ทำจริง 4–5 ชม.):
- **Stamp ช่วงเวลาจาก Activity Timeline:** ดึงประวัติเวลาจริงจาก Activity Timeline มาแยกแยะตามเนื้องานและเกณฑ์เวลาของแต่ละหมวดหมู่:
  - **`<TASK-CODE>a` [Feature] (ตาม Scope เดิม เช่น 2 ชม.):** งานพัฒนาฟีเจอร์หลัก (เกณฑ์ Feature ≤ 3 ชม.)
  - **`<TASK-CODE>b` [Bug Fix] (งานแก้บั๊กที่พบเพิ่ม เช่น 1.2 ชม.):** งานแก้บั๊ก/ปรับปรุงความเข้ากันได้ (เกณฑ์ Bug Fix ≤ 1.5 ชม.)
  - **`<TASK-CODE>c` [Testing] (งานทดสอบส่วนขยาย เช่น 0.8 ชม.):** งานเขียน Automated Test หรือ Regression Test เพิ่มเติม (เกณฑ์ Testing ≤ 1 ชม.)
  - *(สามารถแตกเป็น `b`, `c`, `d` ต่อไปได้ตามประเภทงานจริง เพื่อให้แต่ละช่วงไม่เกินเกณฑ์ "ห้ามเกิน" ของหมวดตัวเอง)*
- **แนวทางจัดการ Task:**
  - *กรณีแยก Task ใน Kanban (เมื่อเริ่มเห็นว่างอกระหว่างทำ):* สามารถปิด Task แรกเป็น `<TASK-CODE>a` เมื่อเสร็จ Scope เดิม แล้วสร้าง Task ใหม่ `<TASK-CODE>b`, `<TASK-CODE>c` มารับงานส่วนที่เพิ่ม เพื่อให้เวลาของแต่ละ Task อยู่ในเกณฑ์มาตรฐานตามหมวดหมู่จริง
  - *กรณีไม่ได้แยก Task ใน Kanban (ทำรวมใน Task เดียวจนจบ):* ให้ใช้ค่าเวลารวมจริงของ Task เดิม แต่ใน `รายละเอียดงานที่ทำ` ให้ Stamp เวลาแจกแจงชัดเจนว่างานช่วงใดเป็น Scope เดิม และงานช่วงใดเป็นงานส่วนขยาย (แยกตามหมวดหมู่ เช่น Feature, Bug Fix, Testing) พร้อมระบุสาเหตุ (เช่น AI Delay หรือ Bug เพิ่มเติม) อย่างโปร่งใส

**กฎสำหรับบล็อกชี้แจงเวลาเกินงบ:**
- แสดงเฉพาะ task ที่ `hours_spent` **เกินค่า "ห้ามเกิน"** ของหมวดหมู่งานหลักจริง ๆ
- ใช้ค่า `hours_spent` จริงจากระบบเป็น "ใช้จริง" — ห้ามบวก/ลด/ปรับเอง
- "เป้าหมายตามแผน" ใช้ค่าเป้าหมาย (ดีมาก) ของหมวดหมู่งานหลักจากตาราง หรือค่าที่วางแผนไว้ใน mission-planning (ถ้ามี)
- "สาเหตุ" ต้องเป็นเหตุผลจริงจากงานที่ทำ (ดูจาก Activity timeline / session context) ไม่ใช่คำกล่าวทั่วไป
- **แต่ละส่วนงานที่ทำเพิ่มต้องระบุหมวดหมู่งานของตัวเอง** ในรูปแบบ `[Category] <งานย่อย> — <เวลา>` พร้อมระบุเกณฑ์ "ห้ามเกิน" ของหมวดนั้น เพื่อให้ผู้ตรวจเห็นชัดว่าแต่ละส่วนอยู่ในเกณฑ์ของหมวดตัวเอง
- **แต่ละส่วนงานที่ทำเพิ่มต้องไม่เกิน "ห้ามเกิน" ของหมวดตัวเอง** — ถ้าเกินต้องแตกย่อยลงไปอีกจนเข้าเกณฑ์ (เหมือนกฎในส่วน 1)
- ห้ามแยก `hours_spent` ของ task เดียวออกเป็นหลาย log ในระบบเพื่อหลีกเลี่ยง flag — ใช้ค่ารวมจริงตามที่ระบบบันทึก และชี้แจงผ่านบล็อกนี้แทน
- บล็อกนี้เป็น plain text copy block (ไม่มี markdown formatting) เพื่อให้ก๊อปไปวางระบบอื่นได้โดยตรง
- สำหรับ Final Task Completion ห้ามสร้าง Copy Block ที่สอง: ให้รวมเหตุผลและสาระสำคัญของงานที่ทำเพิ่มไว้ใน `รายละเอียดงานที่ทำ` ของ Human-readable Final Work Summary Copy Block เดียว โดยรายละเอียดเต็มยังคงอยู่ใน canonical Final Summary / Final Session Note

### 6. รวมข้อมูลจาก session context ปัจจุบัน

นำสิ่งที่ทำใน session นี้ (จากประวัติการทำงานใน conversation ปัจจุบัน) มารวมกับข้อมูลจาก `get_project_context`:
- งานที่ทำเสร็จใน session นี้
- งานที่กำลังทำ / ยังไม่เสร็จ
- การแก้ไข / ปรับปรุงที่เกิดขึ้น

### 7. วิเคราะห์และสรุปเป็นภาพรวม

- **ใช้ภาษาทั่วไปเข้าใจง่าย** — พยายามไม่ใช้คำศัพท์เทคนิคถ้าไม่จำเป็น แปลงคำเทคนิค (เช่น EF Core, DTO, Mapper, Repository) เป็นภาษาที่อธิบายผลลัพธ์ ไม่ใช่วิธีทำ
- **เน้นสิ่งที่ทำและผลลัพธ์** — ไม่ต้องอธิบายวิธีทำละเอียด
- **ถ้าต้องใช้คำเทคนิค ให้มีคำอธิบายความหมายง่าย ๆ ต่อท้าย**

### 8. แสดงผลหรือบันทึกตามโหมด

สำหรับ `progress/handoff` และ `report-only` สามารถแสดง 2 ส่วนในผลลัพธ์เดียวกัน (ดูหัวข้อ **รูปแบบผลลัพธ์**):
1. **สรุปรวม** — ภาพรวมของ session/วัน พร้อม totalHours
2. **สรุปราย task** — 1 task = 1 บล็อก แสดงชื่อ task, ชั่วโมง, และสิ่งที่ทำ

สำหรับ `final` ให้ทำตามสถานการณ์ที่ 2 เท่านั้น: ปิด task และอ่านข้อมูลสุดท้ายก่อน จากนั้นจึงสร้าง canonical Final Summary เพื่อบันทึกและแสดง Copy Block

### 9. การยืนยันตามประเภท Summary

- `progress/handoff`: แสดงร่างและถามผู้ใช้ก่อนบันทึก Session Note; เมื่อยืนยันแล้วบันทึก note และคง task เป็น `in_progress`
- `final`: การยืนยันผลลัพธ์/อนุญาตปิดต้องเกิดก่อน `move_task → done`; หลังปิดให้สร้างและบันทึก Final Summary แล้วแสดง Copy Block โดยไม่ย้อนกลับไปใช้ลำดับสรุปก่อนปิด
- `report-only`: แสดงสรุปโดยไม่บันทึก Session Note และไม่เปลี่ยนสถานะ

**ตัวอย่างคำถามที่ควรถาม:**
> "นี่คือสรุปงานวันนี้ ครับ พอใจกับข้อมูลแล้วหรือต้องการแก้ไขอะไรเพิ่มเติม? ถ้าพอใจ สั่ง 'บันทึก' เพื่อบันทึก session note ลง kanban ได้เลย"

### 10. บันทึก Session Note ตามประเภท

- `progress/handoff`: หลังผู้ใช้ยืนยัน ให้เรียก `save_session_note` ด้วย Progress/Handoff Summary แล้วคง `in_progress`
- `final`: หลังปิด task, อ่าน Final Task + Activity และสร้าง canonical Final Summary แล้ว ให้เรียก `save_session_note` ด้วย Final Summary ฉบับเดียวกัน

```
mcp_call_tool(
  server_name="kanban-tukdaeng",
  tool_name="save_session_note",
  arguments={
    "task_id": "<task_id>",
    "summary": "<Progress Result หรือ Final Result แบบกระชับ>",
    "note": "<Progress/Handoff Summary หรือ canonical Final Summary ฉบับเต็ม>"
  }
)
```

**พารามิเตอร์:**
- `task_id` (required) — id ของ task ที่เกี่ยวข้อง
- `summary` (required) — สรุปสั้น ๆ 1 บรรทัด
- `note` (required) — รายละเอียดเต็มของ session

**เนื้อหาที่ควรบันทึก:**
- Progress/Handoff Note: สิ่งที่เสร็จแล้ว, Current State, Decisions, สิ่งที่ตรวจสอบแล้ว, Open Items, Blockers, สิ่งที่ยังไม่ได้ทำ และ Next Step
- Final Session Note: Final Result, Work Completed, Decisions, Verification/Test Result, Actual Start/End, Final Actual Time, Issues/Fixes, Scope Changes (ถ้ามี), Open Items และ Next Step
- สำหรับ gap/ปัญหาที่พบ ให้ระบุเนื้อหาปัญหา + ผลตัดสินใจ/วิธีแก้ ห้ามเขียนแค่จำนวน gap

### กฎสำคัญ

- ⚠️ **ห้ามส่ง log ไปยังระบบภายนอกใด ๆ** (core-portal, API, curl) — skill นี้เป็นการสรุปเท่านั้น
- ⚠️ Progress/Handoff Note และ Final Session Note เป็นคนละประเภท ห้ามใช้แทนกัน
- ⚠️ Final Session Note ไม่ใช่การเพิ่มเวลา และห้ามเรียก `log_time`
- Final Session Note และ Final Work Summary Copy Block ต้องมาจาก canonical Final Summary ชุดเดียวกัน

---

## หมวดหมู่งาน (Work Category)

เพื่อให้สรุปงานบอกได้ว่า task นั้นเกี่ยวข้องกับลักษณะงานประเภทใด ให้ระบุ **หมวดหมู่งาน** เพียง **1 หมวด** ในผลลัพธ์ราย task โดยเลือกจากรายการคงที่ต่อไปนี้:

| Category | คำอธิบาย |
| --- | --- |
| Requirement | คุยความต้องการ/ศึกษาขอบเขตงาน |
| Design | ออกแบบ UI/UX/สถาปัตยกรรมระบบ/ฐานข้อมูล |
| Feature | พัฒนาโปรแกรมฟีเจอร์ใหม่ |
| Bug Fix | แก้ไขข้อผิดพลาด/ปรับแก้ปัญหา |
| Testing | ทดสอบระบบ/เขียน Unit Test |
| Refactor | ปรับปรุงโครงสร้างโค้ดเดิม |
| Deploy / DevOps | การติดตั้งระบบ/จัดการ Infrastructure/CI-CD |
| Documentation | เขียนคู่มือการใช้งาน/คู่มือระบบ/API Docs |
| Meeting | การประชุมหรือหารือ/Scrum |

### วิธีเลือกหมวดหมู่

- เลือกเพียง **1 หมวด** ต่อ 1 task — ห้ามระบุหลายหมวดคั่นด้วย `,`
- ดูจาก **งานหลัก** ที่ทำจริงใน task (จาก bullet list งานย่อย) ไม่ใช่แค่ชื่อ task
- ถ้า task มีหลายลักษณะผสมกัน (เช่น เขียนเอกสาร + แก้โค้ด) ให้เลือกหมวดที่ **ครอบคลุมงานหลัก** ของ task นั้นเป็นอันดับแรก และถือว่าเป็นหมวดเดียวของ task
- ถ้าไม่แน่ใจ ให้เลือกหมวดที่ **ครอบคลุมงานหลัก** ของ task นั้น
- ห้ามใช้หมวดนอกจากรายการ 9 หมวดข้างต้น

---

## รูปแบบผลลัพธ์ (ทั้งสรุปรวม + ราย task)

รูปแบบสรุปรวมและสรุปราย task ในหัวข้อนี้ใช้กับ `progress/handoff` และ `report-only`; สำหรับ Final Task Completion ให้ใช้ **Final Work Summary Copy Block** ตาม template เฉพาะด้านล่าง โดย canonical Final Summary / Final Session Note ยังคงรายละเอียดเต็ม

ผลลัพธ์ของ `progress/handoff` และ `report-only` ต้องมี 2 ส่วนในผลลัพธ์เดียวกัน:

### ส่วนที่ 1: สรุปรวม (Overview)

สรุปภาพรวมของ session/วัน แสดง:
- **ภาพรวม** — บอกว่าวันนี้/session นี้ทำอะไรไปบ้าง (1-2 บรรทัด)
- **totalHours** — รวมชั่วโมงทำงานจาก `get_time_summary` (task DONE) + `get_board` (task in_progress ถ้ามี)
- **รายการ task ที่นำมารวม** — แสดง task แต่ละ task พร้อม `hours_spent`

### ส่วนที่ 2: สรุปราย task (Per-task)

แต่ละ task แสดงเป็น 1 บล็อก ประกอบด้วย:
- **ชื่อ task** + สถานะ (done/in_progress)
- **เวลาทำงาน** — ชั่วโมงที่ใช้ (`hours_spent`) ของ task นั้น แสดงเป็นบรรทัดเด่น
- **หมวดหมู่งาน** — หมวดงานที่เกี่ยวข้อง (เลือกจากรายการ 9 หมวดในหัวข้อ "หมวดหมู่งาน" ด้านบน)
- **สถานะความสมบูรณ์** — task `done` ใช้ `ครบตามแผน` หรือ `ครบแต่มี open items` (งานใน task จบแล้ว แต่งานใหม่จะส่งต่อ); task `in_progress` ใช้ `ทำบางส่วน (จะทำต่อ session ใหม่)` เมื่อยังไม่เสร็จ
- **เป้าหมาย/ผลลัพธ์ที่คาดหวัง** — 1 บรรทัด บอกว่า task นี้ตอบโจทย์อะไร หรือผลลัพธ์สุดท้ายที่ได้คืออะไร (ไม่ใช่ "ทำอะไร" แต่เป็น "ทำเพื่ออะไร") — ช่วยให้ AI/คนตรวจเทียบว่างานที่ทำตรงเป้าหมายหรือไม่
- **ภาพรวมของ task** — สรุปงานที่ทำใน task นั้น (50-250 ตัวอักษร)
- **ไฟล์ที่แก้ไข** (ถ้ามี) — bullet list ของไฟล์ที่ถูกแก้ไขจริงใน task นี้ แต่ละ bullet ระบุพาธไฟล์และสรุปการเปลี่ยนแปลงสั้น ๆ ต่อท้ายด้วย `—` เช่น `- BackOffice/17_OPTION_MASTER_MODULE.md — เพิ่ม section 22 FO Integration Guidelines + bump version` เพื่อให้ AI/คนตรวจเห็นชัดว่า task นี้แก้ไฟล์ใดบ้าง โดยไม่ต้องไปไล่ใน bullet รายละเอียดงาน
- **รายละเอียดงานที่ทำ** — bullet list ของงานย่อยใน task นั้น **รวมงานที่ทำเพิ่มนอกแผนไว้ใน bullet list นี้เลย** ไม่ต้องแยกเป็น subsection ของตัวเอง แต่ละ bullet ของงานนอกแผนให้รวมเหตุและทางแก้ในบรรทัดเดียวโดยใช้ `→` คั่น เช่น `- อัปเดท cross-reference 4 ไฟล์ที่พบเพิ่ม (เพราะ grep เจอ reference ค้าง) → เปลี่ยนชี้ไป Asset Management / Reported Comments`
- **ค้าง/ติดตาม** (ถ้ามี open items แม้ task จะ done) — bullet list ของสิ่งที่ยังค้างอยู่ แม้ task จะถูกปิดเป็น done ก็ต้องแสดงถ้ามี open items เพื่อให้ AI/คนตรวจเห็นชัดว่ามีอะไรค้าง ไม่ใช่แค่อยู่ใน session note ใน kanban

### รูปแบบ (template)

ส่วน "สรุปรวม" แสดงเป็น markdown ปกติ:

```markdown
## สรุปงานวันที่ <YYYY-MM-DD>

### สรุปรวม

**ภาพรวม:**
> <สรุปภาพรวม 1-2 บรรทัด ว่าวันนี้/session นี้ทำอะไรไปบ้าง>

**ชั่วโมงทำงานรวม:** <totalHours> ชม.

**รายการ task ที่นำมารวม:**
- <Task A> (hours_spent: <X>)
- <Task B> (hours_spent: <Y>)
- <Task C> (hours_spent: <Z> — in_progress)
- รวม: <totalHours> ชม.
```

ส่วน "สรุปราย task" หุ้มด้วย code block เพื่อให้ copy ได้โดยไม่หาย formatting:

```
### สรุปราย task

#### Task A — <ชื่อ task> [done]

เวลาเริ่ม <DD/MM/YYYY HH:MM>
เวลาจบ <DD/MM/YYYY HH:MM>
เวลาทำงาน <X> ชม. <Y> นาที (<D.D> ชม.)

หมวดหมู่งาน <Category1>

สถานะความสมบูรณ์ <ครบตามแผน | ครบแต่มี open items>

เป้าหมาย/ผลลัพธ์ที่คาดหวัง

<1 บรรทัด บอกว่า task นี้ตอบโจทย์อะไร หรือผลลัพธ์สุดท้ายที่ได้>

ภาพรวม

<สรุปงานใน task นี้ 1-2 บรรทัด ไม่ใช้ > นำหน้า>

ไฟล์ที่แก้ไข (แสดงเฉพาะเมื่อ task มีการแก้ไฟล์จริง)

- <พาธไฟล์ 1> — <สรุปการเปลี่ยนแปลงสั้น ๆ>
- <พาธไฟล์ 2> — <สรุปการเปลี่ยนแปลงสั้น ๆ>

รายละเอียดงานที่ทำ

- <งานย่อย 1 เป็นคำกระชับ ไม่ใส่รายชื่อไฟล์ แต่ใส่ตัวเลขปริมาณได้ เช่น "แก้ 3 หน้าจอ", "เพิ่ม 4 API", "อัปเดทเอกสาร 13 ไฟล์">
- <งานย่อย 2>
- <งานย่อย 3>
- <งานนอกแผน (เหตุ) → <ทางแก้>>  (รวมไว้ใน bullet list เดียวกับงานในแผน ไม่ต้องแยก subsection)
- <งานนอกแผน 2 (เหตุ) → <ทางแก้>>

ส่งต่อ (แสดงเฉพาะเมื่อ task done + สถานะความสมบูรณ์ "ครบแต่มี open items" — งานใน task นี้จบแล้ว แต่มีของที่จะเป็น task ใหม่)

- <สิ่งที่จะส่งต่อเป็น task ใหม่ 1>
- <สิ่งที่จะส่งต่อเป็น task ใหม่ 2>

#### Task B — <ชื่อ task> [in_progress]

เวลาเริ่ม <DD/MM/YYYY HH:MM>
ปัจจุบัน <DD/MM/YYYY HH:MM> (ยังจับเวลาอยู่)
เวลาที่ผ่านไป <X> ชม. <Y> นาที (<D.D> ชม.)

หมวดหมู่งาน <Category1>

สถานะความสมบูรณ์ <ครบตามแผน | ครบแต่มี open items | ทำบางส่วน (จะทำต่อ session ใหม่)>

เป้าหมาย/ผลลัพธ์ที่คาดหวัง

<1 บรรทัด บอกว่า task นี้ตอบโจทย์อะไร หรือผลลัพธ์สุดท้ายที่ได้>

ภาพรวม

<สรุปงานใน task นี้ 1-2 บรรทัด ไม่ใช้ > นำหน้า>

ไฟล์ที่แก้ไข (แสดงเฉพาะเมื่อ task มีการแก้ไฟล์จริง)

- <พาธไฟล์ 1> — <สรุปการเปลี่ยนแปลงสั้น ๆ>
- <พาธไฟล์ 2> — <สรุปการเปลี่ยนแปลงสั้น ๆ>

รายละเอียดงานที่ทำ

- <งานย่อย 1>
- <งานย่อย 2>
- <งานนอกแผน (เหตุ) → <ทางแก้>>  (รวมไว้ใน bullet list เดียวกับงานในแผน ไม่ต้องแยก subsection)

ค้าง/ติดตาม (แสดงเฉพาะเมื่อ task in_progress และมี open items — งานใน task นี้ยังไม่จบ จะทำต่อ)

- <สิ่งที่ยังค้างใน task นี้ 1>
```

### Final Work Summary Copy Block (สำหรับ task ที่ปิดแล้ว)

หลัง `move_task → done`, อ่าน Final Task + Activity Timeline และบันทึก Final Session Note สำเร็จแล้ว ต้องแสดง **Final Work Summary Copy Block** ทุกครั้ง โดยสร้างจาก canonical Final Summary ชุดเดียวกับ Final Session Note:

#### Mission Mapping Rule

ก่อนสร้าง Final Work Summary Copy Block ต้องตรวจ Mission/Task context ว่ามี mapping ที่บันทึกไว้จริงไปยัง Mission → Objective → Feature หรือไม่ ห้าม infer หรือสร้าง Objective/Feature เพื่อให้รูปแบบดูครบ

**Case A — Task มี Mission Mapping จริง:**

```text
เป้าหมาย <number>: <Objective Name>

Feature: <Feature Name>

Task: <TASK-CODE> <Task Name>

หมวดหมู่งาน: <Category>

เวลาทำงาน: <Final Actual Time>

รายละเอียดงานที่ทำ

- <งานสำคัญที่ทำจริง>
- <งานสำคัญที่ทำจริง>
- <งานสำคัญที่ทำจริง>
```

**Case B — Task ไม่มี Mission Mapping:**

ใช้กับ Pre-Mission, Standalone, Maintenance, Operational หรือ Task อื่นที่ไม่มี Mission → Objective → Feature mapping จริง:

```text
Task: <TASK-CODE> <Task Name>

หมวดหมู่งาน: <Category>

เวลาทำงาน: <Final Actual Time>

รายละเอียดงานที่ทำ

- <งานสำคัญที่ทำจริง>
- <งานสำคัญที่ทำจริง>
- <งานสำคัญที่ทำจริง>
```

**Case C — Task เกินเกณฑ์หมวด (Over-budget):**

เมื่อ `hours_spent` เกินค่า "ห้ามเกิน" ของหมวดหลัก `รายละเอียดงานที่ทำ` ของ Copy Block **ต้องแสดงแบบแยกสัดส่วนตามหมวดย่อย** ไม่ใช่รายการแบนรายการเดียว — ใช้โครง `<TASK-CODE><letter>` เดียวกับการ Stamp เวลาใน canonical summary โดยแต่ละกลุ่มระบุหมวดและเวลาของตัวเอง (กฎเดียวกับ "การจัดการ task ที่เกินเวลาเป้าหมาย"):

```text
เป้าหมาย <number>: <Objective Name>   (แสดงเฉพาะเมื่อมี Mission Mapping จริง)

Feature: <Feature Name>

Task: <TASK-CODE> <Task Name>

หมวดหมู่งาน: <Category หลัก>

เวลาทำงาน: <Final Actual Time> (แผน <Planned> ชม. — เกินเพราะ <เหตุผลสั้น ๆ>)

รายละเอียดงานที่ทำ

- <TASK-CODE>a [<Category>] (ตาม scope เดิม ประมาณ X ชม.):
  - <งานย่อย>
  - <งานย่อย>
- <TASK-CODE>b [<Category>] (งานที่ทำเพิ่ม ประมาณ Y ชม.):
  - <งานย่อย (เหตุ) → <ทางแก้>>
- <TASK-CODE>c [<Category>] (งานที่ทำเพิ่ม ประมาณ Z ชม.):
  - <งานย่อย>
```

**กฎ Final Work Summary Copy Block:**
- หนึ่ง Task Summary ต้องอยู่ใน `text` code block เดียว เพื่อให้กด Copy แล้วนำไปวางใน Google Docs ได้ทันที
- ใช้ข้อความธรรมดาโดยไม่ใช้ Markdown heading (`#`, `##`, `###`), bold, inline code หรือ horizontal rule
- รายการทุกข้อใน Copy Block ต้องขึ้นต้นด้วย literal `- ` ภายใน `text` code block; ห้ามใช้ `*` หรือรูปแบบที่ UI render เป็น bullet symbol `•`
- Task ที่มี Mission Mapping จริงต้องแสดง Objective และ Feature ตาม mapping ที่บันทึกไว้ก่อน Task; Task ที่ไม่มี mapping ต้องเริ่มจาก Task โดยตรงและห้ามสร้าง Objective/Feature ขึ้นมาเอง
- โดยปกติใช้รายการเดียวภายใต้ `รายละเอียดงานที่ทำ`; ไม่ต้องแยก `ผลการตรวจสอบ` หรือ Work Area/Feature/Topic เป็น section ย่อย เว้นแต่ task มีหลาย workstream ขนาดใหญ่และแตกต่างกันจริงจนรายการเดียวอ่านยากอย่างมีนัยสำคัญ หรือ task เกินเกณฑ์หมวดซึ่งต้องใช้โครงแยกสัดส่วนของ Case C
- `รายละเอียดงานที่ทำ` ต้องครบสาระสำคัญ กระชับ และรวมเรื่องที่เกี่ยวข้องกันไว้ในรายการเดียวเมื่อเหมาะสม โดยทั่วไปประมาณ 5–8 ข้อ แต่ปรับตามปริมาณงานจริงได้
- **4 มาตรฐานข้อมูลสำคัญใน `รายละเอียดงานที่ทำ` (เพื่อความสมบูรณ์ของ Log และการประเมินผลงาน):**
  1. **ระบุตัวเลขจริงทางเทคนิคให้ชัดเจน:** เช่น จำนวน Test cases ใหม่ (13 tests), Targeted test (19 เคส), Regression test (605 เคส), เวลา Cooldown (60s), โควตา (5 ครั้ง/24h), อายุ Token (72 ชม.)
  2. **ระบุสาเหตุบั๊กที่แท้จริง (Root Cause):** เช่น "class `deletion-detail-mode` ไม่ถูก remove" หรือ "ข้อมูลค้างจากสถานะจำลองก่อนหน้า" (หลีกเลี่ยงการเขียนสั้นๆ แค่ว่า "แก้บั๊กหน้าจอ")
  3. **ระบุมาตรการความปลอดภัย (Security):** เช่น การ Mask ข้อมูลอีเมล, การเก็บเฉพาะ Token Hash, การห้ามลงข้อมูลลับใน Audit/Delivery Payload
  4. **ระบุสาเหตุและวิธีแก้เมื่อใช้เวลาเกิน (Improvement):** สรุปสาเหตุที่เกิน เช่น Scope กว้าง หรือมีเงื่อนไขหลายชั้น และระบุวิธีแก้ เช่น แยกฟังก์ชันตรวจเงื่อนไขตรงกลาง หรือแตก Subtask ย่อย
- ใช้ข้อมูลจาก canonical Final Summary / Final Session Note เท่านั้น ห้ามเพิ่มงานที่ไม่ได้ทำจริง
- Verification สำคัญ เช่น tests, validation, `git diff --check`, assertions, scope/protected-scope check และ user acceptance สามารถรวมใน `รายละเอียดงานที่ทำ` ได้
- หากสาระจาก Files Changed, Decisions, Problems/Resolutions, Scope Changes หรือ Verification สำคัญต่อความเข้าใจงาน ให้รวมไว้ในรายการ `รายละเอียดงานที่ทำ` โดยไม่สร้าง metadata section แยก
- กรณี task เกินเกณฑ์หมวด ให้ใช้ **Case C**: คงกฎวิเคราะห์/ชี้แจง over-budget เดิมใน canonical summary และแสดง `รายละเอียดงานที่ทำ` แบบแยกสัดส่วน `<TASK-CODE>a/b/c [<Category ย่อย>] (ประมาณ X ชม.)` ตามด้วย sub-bullet — สัดส่วนและหมวดย่อยต้องตรงกับ canonical summary / สรุปราย task ห้ามย่อเป็นรายการแบนรายการเดียวจนสัดส่วนเวลาหาย; ส่วนบรรทัดเวลาทำงานให้ระบุ `(แผน X ชม. — เกินเพราะ <เหตุผล>)` ไว้กำกับ
- ใช้ business-facing Task Code; ห้ามแสดง Full/Partial Kanban UUID, internal Task ID หรือ Database ID
- Final Work Summary Copy Block แสดงเฉพาะ Objective/Feature เมื่อมี mapping จริง, Task Code + Task Name, Category, Final Actual Time และรายละเอียดงานที่ทำ
- ไม่แสดงเวลาเริ่ม, เวลาจบ, Time Source, Raw Timer Metadata, status, completion status, Goal/Expected Result, Overview, Files Changed, Decisions, Problems/Resolutions, Scope Changes, Pending/Follow-up, Next Step หรือ Internal Workflow Notes เป็น section แยก
- Final Actual Time ต้องใช้ Final `hours_spent` หลัง task เป็น `done` และ auto-stop/auto-bank แล้วเท่านั้น ห้ามใช้ provisional elapsed time และห้ามเรียก `log_time`
- เนื้อหาสำคัญทั้งหมดต้องอยู่ใน Copy Block เดียว; ข้อความนอก Block มีได้เพียงคำอธิบายสั้น ๆ และห้ามแยกส่วนของ Summary ออกไปไว้ภายนอก
- กฎการลดข้อมูลนี้ใช้เฉพาะ Work Log Copy Block; canonical Final Summary / Final Session Note ต้องเก็บรายละเอียดเต็มตามเดิม

**สำหรับ task `in_progress` (ยังไม่ปิด) — กรณีปกติ:**

```text
Task: <ชื่อ task>
Task ID: <task_id>
สถานะ: in_progress (ยังจับเวลาอยู่)
เวลาเริ่ม: <DD/MM/YYYY HH:MM>
ปัจจุบัน: <DD/MM/YYYY HH:MM>
เวลาที่ผ่านไป: <X> ชม. <Y> นาที (<D.D> ชม.)
หมวดหมู่งาน: <Category1>
สถานะความสมบูรณ์: <ครบตามแผน | ครบแต่มี open items | ทำบางส่วน (จะทำต่อ session ใหม่)>

เป้าหมาย/ผลลัพธ์ที่คาดหวัง:
<1 บรรทัด>

ภาพรวม:
<สรุปงาน 1-2 บรรทัด>

ไฟล์ที่แก้ไข:
- <พาธไฟล์ 1> — <สรุปการเปลี่ยนแปลง>

รายละเอียดงานที่ทำ:
- <งานย่อย 1 ภาษาเข้าใจง่าย สั้น กระชับ>
- <งานย่อย 2>
- <งานนอกแผน (เหตุ) → <ทางแก้>>

ค้าง/ติดตาม:
- <สิ่งที่ยังค้างใน task นี้>
```

**สำหรับ task `in_progress` ที่เกินเกณฑ์หมวด (Over-budget) — ใช้โครงสร้าง งานตามแผน/งานที่ทำเพิ่ม พร้อมหมวดของแต่ละส่วน เหมือนกรณี `done`:**

```text
Task: <ชื่อ task>
Task ID: <task_id>
สถานะ: in_progress (ยังจับเวลาอยู่)
เวลาเริ่ม: <DD/MM/YYYY HH:MM>
ปัจจุบัน: <DD/MM/YYYY HH:MM>
เวลาที่ผ่านไป: <X> ชม. <Y> นาที (<D.D> ชม.)
หมวดหมู่งาน: <Category หลัก>
สถานะความสมบูรณ์: <ครบตามแผน | ครบแต่มี open items | ทำบางส่วน (จะทำต่อ session ใหม่)>

เป้าหมาย/ผลลัพธ์ที่คาดหวัง:
<1 บรรทัด>

ภาพรวม:
<สรุปงาน 1-2 บรรทัด ระบุด้วยว่าใช้เวลาเกินแผนเพราะอะไร>

ไฟล์ที่แก้ไข:
- <พาธไฟล์ 1> — <สรุปการเปลี่ยนแปลง>

รายละเอียดงานที่ทำ:
- งานตามแผน [<Category ของส่วนนี้>] (ประมาณ <X> ชม.):
  - <งานย่อย 1>
  - <งานย่อย 2>
- งานที่ทำเพิ่มระหว่างทำ [<Category ของส่วนนี้>] (ประมาณ <X> ชม.):
  - <งานย่อย 1 (เหตุ) → <ทางแก้>>

ค้าง/ติดตาม:
- <สิ่งที่ยังค้างใน task นี้>
```

> **กฎ copy block ราย task:**
> - แสดง copy block ราย task **ทุกครั้ง** ที่ผู้ใช้สั่ง "สรุป task นี้" หรือ "สรุปงาน task <id>"
> - ในสรุปรวมหลาย task แสดง copy block ราย task เฉพาะ task ที่ผู้ใช้ระบุ หรือแสดงทุก task ถ้าผู้ใช้สั่ง "สรุปงาน"
> - Progress/Report-only Copy Block ต้องมี **เวลาเริ่ม, เวลาจบ/ปัจจุบัน, เวลาทำงาน/เวลาที่ผ่านไป** ตาม template ของโหมดนั้น
> - เวลาทำงานใน copy block ใช้ค่าจริงจากระบบ (`hours_spent`) ไม่บวก/ลด/ปรับเอง
> - สำหรับ Final Task Completion ต้องใช้ **Final Work Summary Copy Block** หลังปิด task และบันทึก Final Session Note เท่านั้น โดยแสดงเฉพาะฟิลด์ตาม template ใหม่; Decisions, ปัญหา/การแก้ไข, ค้าง/ติดตาม, Next Step และ metadata อื่นคงอยู่ใน canonical Final Summary / Final Session Note
> - Final Session Note กับ Final Work Summary Copy Block ต้องมาจาก canonical Final Summary ชุดเดียวกัน
> - เมื่อแสดง "สรุปราย task" block พร้อมกับ Final Work Summary Copy Block ในผลลัพธ์เดียวกัน เนื้อหา "รายละเอียดงานที่ทำ" ของทั้งสอง block ต้องเป็น bullet ชุดเดียวกัน — ต่างกันได้เฉพาะ header/metadata ตาม template ของแต่ละโหมด ห้ามเขียนเนื้อหางานคนละชุด; สำหรับ task เกินเกณฑ์หมวด โครงแยกสัดส่วน `<TASK-CODE>a/b/c [<Category>] (ประมาณ X ชม.)` ต้องเหมือนกันทั้งสอง block (Final Copy Block ใช้ Case C)

### กฎการเขียนสรุป

1. **ใช้ภาษาที่คนทั่วไปอ่านเข้าใจง่าย** — เน้นภาพรวม หลีกเลี่ยงคำศัพท์เทคนิคและโค้ด ใช้ภาษาที่อธิบายผลลัพธ์ที่ผู้ใช้เห็น/ได้ ไม่ใช่ภาษาที่อธิบายวิธีทำในระดับโค้ด — แต่ domain term ที่ใช้ประจำใน project และเป็นภาษาที่ dev ไทยพูดกันปกติ (เช่น contract, session, audit, sidebar, flow, module, requirement, task) **คงภาษาอังกฤษไว้** ห้ามแปลตรงเป็นคำที่อ่านยากกว่า เช่น ห้ามเขียน "สัญญา" แทน "contract" — กฎข้อนี้หมายถึงห้ามใช้ code symbol ไม่ใช่บังคับแปลศัพท์ทุกคำ
2. **เน้นสิ่งที่ทำและผลลัพธ์** — ไม่ต้องอธิบายวิธีทำละเอียด
3. **ห้ามใช้ชื่อฟังก์ชัน ชื่อ class CSS ชื่อตัวแปร ชื่อ event ชื่อ method หรือโค้ดในสรุป** — เช่น ห้ามเขียน `closeRowMenus()`, `shouldFixRowMenu()`, `visibility:hidden`, `position:fixed`, `requestAnimationFrame`, `capture phase`, `toggle event`, `#table overflow-x: auto` ให้แปลงเป็นภาษาที่อธิบายผลลัพธ์แทน เช่น "ปิดเมนูที่เปิดอยู่", "วางเมนูตายตัวตามหน้าจอ", "ซ่อนเมนูชั่วคราวจนวางตำแหน่งเสร็จ" — ถ้าจำเป็นต้องอ้างถึงส่วนประกอบของระบบ ใช้คำทั่วไป เช่น "ตารางที่เลื่อนได้" แทน "#table overflow-x: auto", "ปุ่ม ..." แทน "row-menu summary", "เมนู ..." แทน "row-menu-list"
4. **ภาพรวมแต่ละ task ควรยาว 50-250 ตัวอักษร** — สรุปในระดับ "ทำอะไรกับระบบอะไร"
5. **แต่ละ bullet คือ 1 งานย่อยหรือกลุ่มงานย่อยที่เกี่ยวข้องกัน** เขียนกระชับ 1 บรรทัด — ถ้าหลาย sub-task เป็นส่วนเดียวกันของงาน (เช่น เพิ่ม section 15-20 ของเอกสารเดียว) ให้รวมเป็น bullet เดียวแทนการแยกทีละ section
6. **ถ้ามีหลายงานที่เกี่ยวเนื่องกัน** สามารถรวมเป็น bullet เดียวโดยใช้ `;` คั่นภายในบรรทัดเดียวกันได้
7. **ส่วน "สรุปราย task" ต้องหุ้มด้วย code block** (` ``` `) — เพื่อให้ผู้ใช้ copy ไปวางที่อื่นได้โดย bullet list (`-`) ไม่หาย ส่วน "สรุปรวม" แสดงเป็น markdown ปกติได้
8. **ทุก Human-readable Copy Block ใช้ plain text** — ไม่ใช้ `**bold**`, `*italic*`, Markdown heading หรือ syntax อื่นที่ UI อาจ render ก่อน Copy; Final Work Summary Copy Block ต้องใช้ `text` code block ตาม template เฉพาะ
9. **Progress/Report-only task block ต้องแสดง "เวลาเริ่ม" + "เวลาจบ/ปัจจุบัน" + "เวลาทำงาน/เวลาที่ผ่านไป"** เป็นบรรทัดเด่น โดยใช้ Activity timeline และ `hours_spent` ตามสถานะ; **ยกเว้น Final Work Summary Copy Block** ซึ่งแสดงเฉพาะ Final Actual Time และเก็บ Actual Start/End ไว้ใน canonical Final Summary / Final Session Note
10. **task ที่ยัง `in_progress`** ให้ระบุ "ปัจจุบัน: <now>" แทน "เวลาจบ" และใช้ "เวลาที่ผ่านไป" แทน "เวลาทำงาน" พร้อมระบุ "(ยังจับเวลาอยู่)" เพื่อให้ผู้ใช้ทราบว่าชั่วโมงอาจยังไม่รวมเวลาที่กำลังจับอยู่
11. **รูปแบบเวลา: `X ชม. Y นาที (D.D ชม.)`** — แสดงทั้งรูปแบบชั่วโมง-นาที และคำนวณเป็นชั่วโมงทศนิยมในวงเล็บ (เช่น `1 ชม. 37 นาที (1.6 ชม.)`, `0 ชม. 39 นาที (0.7 ชม.)`) ทุกที่ที่แสดงเวลา (ราย task, รวม, copy block) ส่วนทศนิยมคำนวณจาก `(X × 60 + Y) ÷ 60` ปัดเป็น 1 ตำแหน่งทศนิยม ยกเว้น `hours_spent` ดิบจาก kanban ที่ยังเป็นทศนิยม — แปลงเฉพาะตอนแสดงผล
12. **ห้ามบวก/ลด/ปรับชั่วโมงเอง** — ใช้ค่า `hours_spent` จากระบบเป็นค่าจริง ห้ามเรียก `log_time`; ถ้าค่าผิดปกติให้รายงานและแยก correction workflow ออกจากการปิด task
13. **ทุก task block ต้องแสดง "หมวดหมู่งาน"** — เลือกจากรายการ 9 หมวดในหัวข้อ "หมวดหมู่งาน" เพียง **1 หมวด** ต่อ 1 task ห้ามระบุหลายหมวดคั่นด้วย `,`
14. **"งานที่ทำเพิ่มนอกแผน" รวมไว้ใน bullet list "รายละเอียดงานที่ทำ" ไม่ต้องแยก subsection** — ถ้ามีงานที่ทำเพิ่มระหว่างทำ task แต่ไม่ได้อยู่ในแผน/task description เดิม ให้เขียนเป็น bullet ใน subsection "รายละเอียดงานที่ทำ" เลย ไม่ต้องสร้าง subsection "งานที่ทำเพิ่มนอกแผน" แยกต่างหาก จุดประสงค์คือให้สรุปได้ครบว่าชั่วโมงของ task นั้นถูกใช้ทำอะไรบ้าง ทั้งที่วางแผนไว้และที่ตามมาจากการแก้กระทบ แต่ละ bullet ของงานนอกแผนรวมเหตุและทางแก้ในบรรทัดเดียว ใช้ `→` คั่นระหว่างเหตุและทางแก้ เช่น `- อัปเดท cross-reference 4 ไฟล์ (เพราะ grep เจอ reference ค้าง) → เปลี่ยนชี้ไป Asset Management`
15. **เขียน bullet กระชับ ตรงประเด็น อ่านเข้าใจง่าย** — แต่ละ bullet ต้องสรุปในสิ่งที่ทำจริง ไม่ใส่รายชื่อไฟล์/endpoint/field ที่เป็นรายละเอียดย่อย เพราะจะทำให้ log ดูรก ให้เขียนเป็นภาพรวมที่ทำงานจริง เช่น แทน `- อัปเดท cross-reference ใน 13 ไฟล์ (README_MODULE_INDEX, BO_MASTER_BASELINE, ...)` ให้เขียน `- อัปเดท cross-reference ในเอกสาร BO และ PRD 13 ไฟล์` จุดประสงค์คือให้คนอ่านย้อนหลังหรือคนตรวจงานอ่านแล้วเข้าใจทันทีว่าทำอะไร โดยไม่ต้องฝักฝ่ายรายละเอียดเทคนิค — รายชื่อไฟล์ที่ถูกแก้ให้แสดงใน subsection "ไฟล์ที่แก้ไข" แทน
16. **อนุญาตให้ใส่ตัวเลขปริมาณใน bullet ได้** — แม้ห้ามใส่รายชื่อไฟล์ใน bullet รายละเอียดงาน แต่ใส่ตัวเลขปริมาณระดับภาพรวมได้ เช่น "แก้ 3 หน้าจอ", "เพิ่ม 4 API", "อัปเดทเอกสาร 13 ไฟล์", "แก้บั๊ก 5 จุด" เพื่อให้ AI/คนตรวจประเมินสัดส่วนเวลา vs ปริมาณงานได้ ตัวเลขนี้เป็นปริมาณรวม ไม่ใช่การระบุชื่อไฟล์ทีละตัว
17. **Progress/Report-only task block ต้องมีบรรทัด "สถานะความสมบูรณ์"** — task `done` เลือก `ครบตามแผน` / `ครบแต่มี open items`; task `in_progress` ใช้ `ทำบางส่วน (จะทำต่อ session ใหม่)` เมื่อยังทำไม่เสร็จ ค่า `ครบแต่มี open items` หมายถึง **งานใน task นี้จบแล้ว** แต่มีงานใหม่ที่จะ **ส่งต่อเป็น task ใหม่** ไม่ใช่งานเดิมที่ยังไม่จบ; Final Work Summary Copy Block ไม่แสดงฟิลด์นี้
18. **Progress/Report-only task block ต้องมีบรรทัด "เป้าหมาย/ผลลัพธ์ที่คาดหวัง"** — 1 บรรทัด บอกว่า task นี้ตอบโจทย์อะไร หรือผลลัพธ์สุดท้ายที่ได้คืออะไร (เน้น "ทำเพื่ออะไร" ไม่ใช่ "ทำอะไร"); Final Work Summary Copy Block ไม่แสดง section นี้แยก แต่รวมสาระสำคัญไว้ใน `รายละเอียดงานที่ทำ` เมื่อจำเป็น
19. **subsection ของตกค้างแสดงเฉพาะเมื่อมี open items** — ชื่อ subsection ขึ้นกับสถานะ task:
    - task `in_progress` → ใช้ชื่อ "ค้าง/ติดตาม" (งานใน task นี้ยังไม่จบ จะทำต่อ)
    - task `done` + สถานะความสมบูรณ์ `ครบแต่มี open items` → ใช้ชื่อ "ส่งต่อ" (งานใน task นี้จบแล้ว แต่มีของที่จะเป็น task ใหม่)
    - task `done` + สถานะความสมบูรณ์ `ครบตามแผน` → ไม่แสดง subsection นี้

    การแยกชื่อทำให้ AI/คนตรวจเข้าใจชัด: "ค้าง/ติดตาม" = task ยังไม่จบ, "ส่งต่อ" = task จบแล้วแต่มีงานใหม่ตามมา ไม่ใช่ของ task เดิม ถ้าไม่มี open items ไม่ต้องแสดง subsection นี้

20. **subsection "ไฟล์ที่แก้ไข" เป็น optional สำหรับ Progress/Report-only Summary** — แสดงเฉพาะเมื่อ task มีการแก้ไฟล์จริง; Final Work Summary Copy Block ไม่สร้าง Files Changed section แยก แต่รวมสาระสำคัญไว้ใน `รายละเอียดงานที่ทำ` เมื่อเกี่ยวข้อง

21. **bullet ที่เล่าปัญหา/decision/gap ต้องระบุเนื้อหา ห้ามเล่าแค่กระบวนการ** — ถ้างานมีการพบปัญหา แจ้งผู้ใช้ หรือตัดสินใจอะไร bullet ต้องบอก "ปัญหาคืออะไร + ตัดสินใจ/แก้อย่างไร" ในตัวเอง ห้ามเขียนแค่ขั้นตอน เช่น ห้าม `- พบ gap 3 จุด → รายงานผู้ใช้เพื่อตัดสินใจ` (คนอ่านไม่รู้ว่า gap คืออะไร ต้องถามกลับ) ให้เขียน `- พบ gap: ระบบไม่บังคับเลือกเหตุผลก่อนยืนยัน (dropdown เติมตัวแรกให้เสมอ) → เพิ่มตัวเลือกว่าง + บังคับเลือกก่อนยืนยัน` — หลัก: แต่ละ bullet ต้องตอบ "เจออะไร/ทำอะไร/ตัดสินใจอะไร" ได้ในตัวเอง ถ้า bullet มีแต่กระบวนการ (เช่น "รายงานผู้ใช้แล้ว", "ตรวจสอบแล้ว") ให้เติมเนื้อหาสาระลงไปเสมอ

22. **อ้าง requirement/spec/entity ด้วยชื่อที่คนอ่านเข้าใจ ไม่ใช่ ID ล้วน** — summary ที่ก๊อปไปลงระบบอื่นต้องอ่านรู้เรื่องโดยไม่ต้องเปิด kanban; ห้ามเขียน `requirement bf08de1f` หรือ `mission 18598f33` ลอย ๆ ให้ใช้ชื่อ เช่น `requirement "BO Admin Identity Lifecycle — Invitation, My Account และ Password Security"` หรือชื่อย่อที่ระบุตัวตนได้ — internal ID (kanban UUID, requirement id, mission id) เก็บไว้ใน session note/traceability เท่านั้น; Task Code แบบ business-facing (เช่น AIL-019) ยังใช้ได้ตามเดิมเพราะเป็นชื่อที่ทีมใช้เรียกกัน

23. **"รายละเอียดงานที่ทำ" ต้องเป็นงานของ task เท่านั้น ห้ามใส่เรื่อง workflow/kanban mechanics** — เหตุการณ์อย่าง timer quirk, ค่า default ตอนสร้าง task, การย้าย column, การบันทึก note ไม่ใช่งานของ task และไม่ควรเป็น bullet; ถ้าเรื่องนั้นสำคัญต่อผู้ใช้ให้แจ้งแยกนอก copy block (เช่น หมายเหตุเวลา) — bullet ทุกข้อต้องตอบได้ว่า "งานชิ้นนี้ทำให้ task บรรลุเป้าหมายอย่างไร"

24. **ห้ามแปลตรงคำเทคนิค/ศัพท์ CSS-JS เป็นคำไทยที่ไม่มีใครใช้จริง — ให้บรรยาย "ผลที่ผู้อ่านเห็นบนหน้าจอ" แทน** — การแปลตรงเช่น "ห่อตัว" (wrap), "สแตก" (stack), "ยุบ" (collapse), "เลย์เอาต์แตก" ทำให้คนอ่านนึกภาพไม่ออก หลักคืออธิบายว่า "ผู้ใช้เห็นอะไรผิดปกติ" แล้วค่อยบอกทางแก้ เช่น
    - ผิด: `แก้ค่าอีเมลห่อตัวอ่านยาก` → ถูก: `แก้ปัญหาอีเมลยาวจนตกเป็นหลายบรรทัด`
    - ผิด: `stack ปุ่มเป็น column บน mobile` → ถูก: `เรียงปุ่มลงมาแนวตั้งเต็มความกว้างบนมือถือ`
    - ผิด: `label ถูก grid แยก` → ถูก: `ชื่อช่องกรอกกับเครื่องหมาย * ถูกแยกคนละบรรทัด`
    - ผิด: `input.select() ทำให้ highlight` → ถูก: `ข้อความเดิมถูกเลือกเป็นแถบสีน้ำเงินตอนเปิดหน้าต่าง`
    ถ้าไม่แน่ใจว่าคำไหนเป็นการแปลตรง ให้ทดสอบด้วยคำถาม "คนที่ไม่รู้โค้ดอ่านแล้วเห็นภาพหน้าจอไหม" — ถ้าไม่เห็นภาพ ให้เขียนบรรยายผลที่ตาเห็นแทน

> **ข้อยกเว้น:** ถ้าเป็น task เดียวสั้น ๆ ที่ภาพรวมอธิบายครบแล้ว สามารถมีแค่ภาพรวมอย่างเดียว ไม่ต้องมี bullet list ก็ได้

### ตัวอย่างการเปลี่ยนประวัติงานทางเทคนิคเป็นภาษาทั่วไป

จากประวัติ (ร่างเทคนิค):
- "แก้ UpdateProfileCommand, UpdateUserCommand, ลบ _repository.Update() เพื่อป้องกัน race condition ที่ mark ทุก property เป็น Modified"

สรุป:
- "แก้ปัญหาข้อมูลตำแหน่ง/แผนกไม่อัปเดตเวลาบันทึกพร้อมกัน โดยปรับการบันทึกให้อัปเดตเฉพาะฟิลด์ที่เปลี่ยนแปลงจริง"

จากประวัติ (ร่างเทคนิค):
- "สร้าง DepartmentEndpoints, PositionEndpoints บน dev-masterdata, ลงทะเบียน DI"

สรุป:
- "สร้าง API สำหรับจัดการข้อมูลแผนกและตำแหน่ง (CRUD) ในระบบตั้งค่า"

จากประวัติ (ร่างเทคนิค — frontend/CSS/JS):
- "แก้ row-menu โดนบังเพราะ ancestor overflow ตัด dropdown ใช้ position:fixed + toggle event"

สรุป:
- "แก้เมนู ... โดนบังเพราะพื้นที่ตารางเลื่อนได้ตัดเมนูไป ใช้วิธีวางเมนูตายตัวตามหน้าจอแทน"

จากประวัติ (ร่างเทคนิค — frontend/CSS/JS):
- "ซ่อน row-menu-list ด้วย visibility:hidden จนกว่า JS จะเพิ่ม class is-fixed แก้เด้งก่อนแสดง"

สรุป:
- "ซ่อนเมนูชั่วคราวจนระบบวางตำแหน่งเสร็จค่อยแสดง แก้ปัญหาเมนูเด้งขึ้นบนก่อนแล้วลงมาแสดงข้างล่าง"

จากประวัติ (ร่างเทคนิค — frontend/CSS/JS):
- "ตัด audit legend ออก เพิ่ม empty state กรอบ ปรับ padding Before/After บน mobile"

สรุป:
- "ตัดสีและคำอธิบายประเภทการกระทำออกจากหัวข้อประวัติ เพิ่มกรอบสำหรับกรณีไม่มีประวัติ แยก Before/After ด้วยเส้นคั่นบน mobile"

จากประวัติ (ร่างเทคนิค — frontend/CSS/JS):
- "เพิ่ม scroll listener capture phase + resize listener เรียก closeRowMenus() + suppress flag 250ms ใน click handler"

สรุป:
- "เพิ่มกลไกปิดเมนูเมื่อเลื่อนหน้าจอหรือเปลี่ยนขนาดหน้าต่าง พร้อมกลไกหน่วงเวลา 250ms ป้องกันเบราว์เซอร์เลื่อนตารางอัตโนมัติแล้วปิดเมนูที่เพิ่งเปิด"

จากประวัติ (ร่างเทคนิค — frontend/CSS/JS):
- "ขยาย CSS visibility:hidden → .is-fixed และ JS toggle handler shouldFixRowMenu() ให้ครอบคลุม reported-board-mode, article-list-mode, category-list-mode, asset-list-mode, user-list-mode"

สรุป:
- "ขยายกลไกซ่อนเมนูชั่วคราวจนวางตำแหน่งเสร็จค่อยแสดง และกลไกวางเมนูตายตัวตามหน้าจอ ให้ครอบคลุม 7 หน้าที่มีตารางเลื่อนได้"

จากประวัติ (ร่างเทคนิค — frontend/CSS/JS):
- "เพิ่มการวัดความกว้างจริงใน requestAnimationFrame แล้วปรับ left ใหม่ ปรับ CSS width จาก 224px เป็น 196px"

สรุป:
- "เพิ่มการวัดความกว้างจริงของเมนูหลังแสดงผลแล้วปรับตำแหน่งใหม่ ให้ขอบขวาเมนูตรงขอบขวาปุ่ม ... ทุกหน้า และปรับความกว้างเมนูบนมือถือให้เท่ากันทุกหน้า"

---

## ตัวจับเวลาอัตโนมัติ (Auto Timer)

kanban-tukdaeng MCP **มีตัวจับเวลาอัตโนมัติในตัว** ช่วยให้ได้เวลาทำงานที่แม่นยำโดยไม่ต้องจดเวลาเอง

### วิธีทำงาน

1. **เมื่อย้าย task เข้า `in_progress`** → เริ่มจับเวลาอัตโนมัติ
2. **เมื่อย้าย task ออกจาก `in_progress`** → บันทึกเวลาที่ใช้ไปเข้า `hours_spent` อัตโนมัติ (minimum 0.1h)
3. **เมื่อย้าย task เข้า `done`** → auto-timer หยุดและ bank Final Actual Time; อ่าน `hours_spent` หลังปิดเท่านั้น
4. **ห้ามเรียก `log_time`** → ป้องกันการบันทึกเวลาซ้ำจาก auto-timer

### คำสั่งที่เกี่ยวข้อง

**เริ่มจับเวลา (ย้าย task เข้า in_progress):**
```
mcp_call_tool(
  server_name="kanban-tukdaeng",
  tool_name="move_task",
  arguments={ "task_id": "<task_id>", "status": "in_progress" }
)
```

**หยุดจับเวลา (ย้าย task ออกจาก in_progress):**
```
mcp_call_tool(
  server_name="kanban-tukdaeng",
  tool_name="move_task",
  arguments={ "task_id": "<task_id>", "status": "done" }  // หรือ "todo", "backlog"
)
```

> ถ้าเวลา auto-tracking ดูผิดปกติ ให้รายงานผู้ใช้พร้อมหลักฐานจาก Activity Timeline และหยุดการแก้เวลาไว้เป็น correction workflow แยกต่างหาก ห้ามแก้เวลาเป็นส่วนหนึ่งของ completion workflow

### แนวทางการใช้งานที่แนะนำ

1. **เริ่มทำงาน** → ย้าย task เข้า `in_progress` เสมอ
2. **เปลี่ยนไปทำ task อื่น** → ย้าย task เดิมออกจาก `in_progress` ก่อนตามคำสั่งผู้ใช้
3. **เปลี่ยน session แต่งานเดิมยังไม่จบ** → บันทึก Progress/Handoff Note และคง task เดิมไว้ที่ `in_progress`
4. **เสร็จงาน** → Verify แล้ว ย้าย task เข้า `done` เพื่อให้ระบบบันทึก Final Actual Time อัตโนมัติ
5. **หลังปิด** → อ่าน Final Task + Activity Timeline ก่อนสร้าง Final Work Summary; ห้ามเรียก `log_time`

> **หมายเหตุ:** ระบบตัวจับเวลาอัตโนมัตินี้ทำงานร่วมกับ `get_time_summary` ที่ใช้ดึงชั่วโมงรวมเพื่อสรุปงาน — ทำให้ได้เวลาที่แม่นยำและสอดคล้องกับงานที่ทำจริง

---

## ตัวอย่างผลลัพธ์

```
## สรุปงานวันที่ 2026-08-14

### สรุปรวม

**ภาพรวม:**
> วันนี้พัฒนาระบบจัดการโครงสร้างองค์กร (Organization Management) ทั้งด้านหลังบ้านและ API พร้อมทดสอบจริง

**ชั่วโมงทำงานรวม:** 4 ชม. 0 นาที (4.0 ชม.)

**รายการ task ที่นำมารวม:**
- เพิ่ม API จัดการแผนก/ตำแหน่ง (hours_spent: 2.5 — done)
- แก้บั๊กอัปเดตข้อมูลตำแหน่ง (hours_spent: 1.0 — in_progress)
- ทดสอบ endpoints ใหม่ (hours_spent: 0.5 — done)
- รวม: 4 ชม. 0 นาที (4.0 ชม.)
```

---

### สรุปราย task

```
#### เพิ่ม API จัดการแผนก/ตำแหน่ง [done]

เวลาเริ่ม 14/08/2026 09:00
เวลาจบ 14/08/2026 11:30
เวลาทำงาน 2 ชม. 30 นาที (2.5 ชม.)

หมวดหมู่งาน Feature

สถานะความสมบูรณ์ ครบตามแผน

เป้าหมาย/ผลลัพธ์ที่คาดหวัง

ให้ผู้ดูแลระบบจัดการข้อมูลแผนก/ตำแหน่งได้จากหน้าเดียว พร้อมรองรับการจัดลำดับใหม่

ภาพรวม

พัฒนา API สำหรับจัดการข้อมูลแผนกและตำแหน่งในระบบตั้งค่า รองรับการดึงข้อมูลและจัดลำดับใหม่

ไฟล์ที่แก้ไข

- src/api/department-endpoints.ts — เพิ่ม endpoint ดึงข้อมูลแผนก/ตำแหน่ง + บันทึกลำดับใหม่
- src/api/position-endpoints.ts — เพิ่ม field ลำดับในข้อมูลส่งกลับ
- src/seed/organization-seed.json — เพิ่ม field ลำดับในทุก record

รายละเอียดงานที่ทำ

- เพิ่ม API ดึงข้อมูลแผนก/ตำแหน่งทั้งหมด 2 endpoint
- เพิ่ม API บันทึกลำดับใหม่ 1 endpoint
- เพิ่ม field ลำดับในข้อมูลส่งกลับ
- ปรับ seed data ให้สอดคล้องกับ field ใหม่ (เพราะ field ลำดับใหม่ทำให้ seed data เดิมไม่สอดคล้อง) → เพิ่ม field ลำดับในทุก record
- แก้ API doc ของ endpoint เดิม (เพราะ doc ไม่ได้อัปเดตตาม field ใหม่) → ระบุ field ใหม่ใน doc ทั้ง 2 endpoint
- เพิ่ม validation สำหรับ field ลำดับ (เพราะข้อมูลลำดับต้องไม่ซ้ำ) → เพิ่ม validation ในทั้ง 2 endpoint

#### แก้บั๊กอัปเดตข้อมูลตำแหน่ง [in_progress]

เวลาเริ่ม 14/08/2026 13:00
ปัจจุบัน 14/08/2026 14:00 (ยังจับเวลาอยู่)
เวลาที่ผ่านไป 1 ชม. 0 นาที (1.0 ชม.)

หมวดหมู่งาน Bug Fix

สถานะความสมบูรณ์ ทำบางส่วน (จะทำต่อ session ใหม่)

เป้าหมาย/ผลลัพธ์ที่คาดหวัง

ให้บันทึกข้อมูลตำแหน่ง/แผนกพร้อมกันได้โดยไม่มีข้อมูลหายหรือทับซ้อน

ภาพรวม

แก้ปัญหาข้อมูลตำแหน่ง/แผนกไม่อัปเดตเวลาบันทึกพร้อมกัน โดยปรับการบันทึกให้อัปเดตเฉพาะฟิลด์ที่เปลี่ยนแปลงจริง

รายละเอียดงานที่ทำ

- ปรับการบันทึกให้อัปเดตเฉพาะฟิลด์ที่เปลี่ยนแปลงจริง
- ทดสอบบันทึกพร้อมกันหลายฟิลด์ 3 case

ค้าง/ติดตาม

- ยังไม่ได้ทดสอบกรณีบันทึกพร้อมกัน 5 ฟิลด์ขึ้นไป
- ต้องตรวจสอบ edge case กรณี concurrency 2 คนบันทึกพร้อมกัน

#### ทดสอบ endpoints ใหม่ [done]

เวลาเริ่ม 14/08/2026 14:30
เวลาจบ 14/08/2026 15:00
เวลาทำงาน 0 ชม. 30 นาที (0.5 ชม.)

หมวดหมู่งาน Testing

สถานะความสมบูรณ์ ครบแต่มี open items

เป้าหมาย/ผลลัพธ์ที่คาดหวัง

ยืนยันว่า API ใหม่ทำงานถูกต้องก่อนปล่อยให้ใช้งานจริง

ภาพรวม

ทดสอบ API ใหม่ทั้ง 4 ตัวผ่านครบ พร้อมแก้บั๊กรูปแบบ body และ header ที่หายไประหว่างทดสอบ

รายละเอียดงานที่ทำ

- ทดสอบ API ใหม่ 4 endpoint ผ่านครบ
- แก้บั๊กรูปแบบ body และ header ที่หายไป 2 จุด

ส่งต่อ

- เขียน automated test เป็น regression suite (จะเป็น task ใหม่)
```

### ตัวอย่าง Final Work Summary Copy Block และ Progress Copy Block

```text
Task: TK-101 เพิ่ม API จัดการแผนก/ตำแหน่ง

หมวดหมู่งาน: Feature

เวลาทำงาน: 2 ชม. 30 นาที (2.5 ชม.)

รายละเอียดงานที่ทำ

- เพิ่ม API ดึงข้อมูลแผนก/ตำแหน่ง 2 endpoint และ API บันทึกลำดับใหม่ 1 endpoint
- เพิ่มข้อมูลลำดับในผลลัพธ์และข้อมูลตั้งต้นให้ใช้โครงสร้างเดียวกัน
- เพิ่มการตรวจสอบไม่ให้ข้อมูลลำดับซ้ำกัน
- อัปเดต API documentation ให้ครอบคลุมข้อมูลลำดับใหม่ทั้ง 2 endpoint
- ทดสอบ API ใหม่ครบทุก endpoint และผลผ่านตาม Acceptance Criteria
- ตรวจความสอดคล้องของผลลัพธ์ API, validation และข้อมูลตั้งต้นแล้ว
```

ตัวอย่าง Final Work Summary Copy Block แบบ over-budget (Case C — แยกสัดส่วนตามหมวดย่อย):

```text
Task: AIL-020 My Account page + entry + edit Name

หมวดหมู่งาน: Feature

เวลาทำงาน: 4 ชม. 17 นาที (4.3 ชม.) (แผน 2.0 ชม. — เกินเพราะปรับหน้าจอตามผลรีวิวรับรองหลายรอบ)

รายละเอียดงานที่ทำ

- AIL-020a [Feature] (ตาม scope เดิม ประมาณ 1.1 ชม.):
  - สร้างหน้า My Account พร้อมปุ่มเปิดจากกล่องโปรไฟล์ในแถบเมนู แสดงข้อมูลบัญชีและแก้ไขได้เฉพาะชื่อ
  - บันทึกสำเร็จแล้วอัปเดตชื่อทันที + บันทึกประวัติ Update Profile ลง Audit Log; ชื่อไม่เปลี่ยนไม่สร้างประวัติ
  - ป้องกัน: บันทึกได้เฉพาะบัญชีตัวเอง ตรวจเวอร์ชันและสถานะก่อนบันทึก ไม่ลงข้อมูลลับในประวัติ
  - รองรับสถานะหน้าจอ 4 แบบ + เขียนแบบทดสอบ 32 เคส ผ่าน 128/128 และ regression 639 เคสไม่พัง
- AIL-020b [Design] (งานที่ทำเพิ่มจากผลรีวิว UI/UX ประมาณ 1.4 ชม.):
  - จัดโครงหน้าตรงแบบหน้ารายละเอียดอื่น (ปรับให้เหลือคอลัมน์เดียว ซ่อนส่วนไม่ใช้ ตัดข้อความแผนงานภายใน)
  - ตัดสิน breadcrumb เป็นส่วนเดียวจากหลักฐานว่าหน้านี้ไม่มี parent ในเมนู
- AIL-020c [Design] (งานที่ทำเพิ่มจากผลรีวิว UI/UX ประมาณ 1.0 ชม.):
  - เปลี่ยนการแก้ชื่อเป็น modal ตามแบบหน้าต่างจัดการแอดมิน และจัดสรุปบัญชี 6 ช่อง 3 คอลัมน์
  - ปรับ responsive: 2 คอลัมน์บนแท็บเล็ต 1 คอลัมน์บนมือถือ คงปุ่ม Edit ไว้ขวาชื่อ
- AIL-020d [Bug Fix] (จุดย่อยระหว่างปรับหน้าจอ ประมาณ 0.8 ชม.):
  - แก้เครื่องหมายจำเป็น (*) ถูกแยกตกบรรทัดใหม่จากชื่อช่องกรอก (สาเหตุ: สไตล์กลางของ modal จัดชื่อช่องเป็นแถวตาราง) → ปรับเฉพาะฟอร์มหน้านี้
  - แก้ปุ่มกรอบว่าง/ส่วนหัวว่างที่ยังแสดง → ซ่อนตามแบบหน้ารายละเอียดอื่น
```

```text
Task: แก้บั๊กอัปเดตข้อมูลตำแหน่ง
Task ID: TK-102
สถานะ: in_progress (ยังจับเวลาอยู่)
เวลาเริ่ม: 14/08/2026 13:00
ปัจจุบัน: 14/08/2026 14:00
เวลาที่ผ่านไป: 1 ชม. 0 นาที (1.0 ชม.)
หมวดหมู่งาน: Bug Fix
สถานะความสมบูรณ์: ทำบางส่วน (จะทำต่อ session ใหม่)

เป้าหมาย/ผลลัพธ์ที่คาดหวัง:
ให้บันทึกข้อมูลตำแหน่ง/แผนกพร้อมกันได้โดยไม่มีข้อมูลหายหรือทับซ้อน

ภาพรวม:
แก้ปัญหาข้อมูลตำแหน่ง/แผนกไม่อัปเดตเวลาบันทึกพร้อมกัน โดยปรับการบันทึกให้อัปเดตเฉพาะฟิลด์ที่เปลี่ยนแปลงจริง

รายละเอียดงานที่ทำ:
- ปรับการบันทึกให้อัปเดตเฉพาะฟิลด์ที่เปลี่ยนแปลงจริง
- ทดสอบบันทึกพร้อมกันหลายฟิลด์ 3 case

ค้าง/ติดตาม:
- ยังไม่ได้ทดสอบกรณีบันทึกพร้อมกัน 5 ฟิลด์ขึ้นไป
- ต้องตรวจสอบ edge case กรณี concurrency 2 คนบันทึกพร้อมกัน
```

---

## Checklist

### สถานการณ์ที่ 1: เริ่มทำ task
- [ ] ตรวจสอบ task ที่จะเริ่ม (ระบุ task_id หรือค้นหาจากชื่อ)
- [ ] เรียก `get_board` เพื่อตรวจสอบ task อื่นที่อยู่ใน `in_progress`
- [ ] ถ้ามี task อื่นใน `in_progress` → ถามผู้ใช้ว่าจะ pause task เดิมหรือทำต่อ
- [ ] ถ้าผู้ใช้เลือก pause → ย้าย task เดิมออกจาก `in_progress` ก่อน
- [ ] ย้าย task ใหม่เข้า `in_progress` ผ่าน `move_task`
- [ ] แจ้งผู้ใช้ว่า "เริ่มจับเวลา task <ชื่อ> แล้ว"

### สถานการณ์ที่ 2: ทำ task เสร็จ
- [ ] เรียก `get_board` เพื่อตรวจสอบ task ที่อยู่ใน `in_progress`
- [ ] Verify งานตาม Acceptance Criteria / test / QA ที่เกี่ยวข้อง
- [ ] สำหรับ task ที่แก้ไฟล์ ได้รับคำยืนยันว่าผู้ใช้ยอมรับผลลัพธ์และอนุญาตให้ปิดแล้ว
- [ ] ย้าย task เข้า `done` ผ่าน `move_task` ก่อนสร้าง Final Work Summary (ระบบ auto-stop timer และ bank เวลาจริง)
- [ ] เรียก `get_task` หลังปิด เพื่ออ่าน Final Status + Activity Timeline + Actual Start + Actual End + Final `hours_spent`
- [ ] สร้าง canonical Final Summary จากข้อมูลหลังปิด โดยมี Final Result, Work Completed, Decisions, Verification/Test Result, Actual Start/End, Final Actual Time, Issues/Fixes, Scope Changes, Open Items และ Next Step
- [ ] เรียก `save_session_note` ด้วย Final Summary ชุดเดียวกันเพื่อเก็บ Persistent Task History
- [ ] ก่อนสร้าง Final Work Summary Copy Block ตรวจ Mission Mapping ที่บันทึกไว้จริง: ถ้ามีให้แสดง Objective → Feature → Task; ถ้าไม่มีให้เริ่มจาก Task และห้ามสร้าง Objective/Feature ขึ้นมาเอง
- [ ] แสดง **Final Work Summary Copy Block** จาก Final Summary ชุดเดียวกันทุกครั้ง เป็น Human-readable `text` Copy Block เดียว: Objective/Feature เมื่อมี mapping จริง → Task → Category → Final Actual Time → รายละเอียดงานที่ทำ
- [ ] ตรวจว่า Final Work Summary Copy Block ใช้ business-facing Task Code และไม่มี Kanban UUID/internal ID
- [ ] ตรวจว่า Final Work Summary Copy Block ไม่มีเวลาเริ่ม/จบ, status, Goal, Overview, Files Changed, Decisions, Problems, Scope Changes, Pending/Follow-up, Next Step หรือ workflow metadata เป็น section แยก
- [ ] ตรวจว่ารายการใน Final Work Summary Copy Block ใช้ literal `- ` และไม่มี `*` หรือ rendered bullet `•`
- [ ] ตรวจว่า Final Work Summary Copy Block ทั้งหมดอยู่ใน `text` code block เดียว ใช้รายการ `รายละเอียดงานที่ทำ` ต่อเนื่อง และไม่ได้แยก Verification/workstream เป็น section โดยไม่จำเป็น (ยกเว้น Case C over-budget ที่ต้องแยกกลุ่ม `<TASK-CODE>a/b/c [<Category>] (ประมาณ X ชม.)` ตามสัดส่วนเวลา)
- [ ] ตรวจว่า Final Actual Time มาจาก Final `hours_spent` หลัง task เป็น `done` และไม่แสดง Planned Time ใน Task Work Log
- [ ] ตรวจว่า canonical Final Summary / Final Session Note ยังคง Actual Start/End และรายละเอียดเต็มทั้งหมด แม้ Copy Block จะย่อ presentation
- [ ] แจ้งผู้ใช้ว่า "ปิด task <ชื่อ> แล้ว ใช้เวลา <X ชม. Y นาที (D.D ชม.)>"
- [ ] ⚠️ **ห้ามบวก/ลด/ปรับชั่วโมงเอง** — ใช้ค่า hours_spent จากระบบเป็นค่าจริง
- [ ] ⚠️ **ห้ามเรียก `log_time`** ก่อนหรือหลังปิด task
- [ ] ⚠️ ห้ามใช้ elapsed/snapshot time ขณะ `in_progress` เป็น Final Actual Time
- [ ] ⚠️ ห้ามส่ง log ไปยังระบบภายนอกใด ๆ

### สถานการณ์ที่ 3: บันทึก session ก่อนขึ้น session ใหม่ (task ยังไม่จบ)
- [ ] เรียก `get_board` เพื่อตรวจสอบ task ที่อยู่ใน `in_progress`
- [ ] สร้าง Progress/Handoff Summary: สิ่งที่เสร็จแล้ว, Current State, Decisions, สิ่งที่ตรวจสอบแล้ว, Open Items, Blockers, สิ่งที่ยังไม่ได้ทำ และ Next Step
- [ ] แสดงเวลาเริ่ม + ปัจจุบัน + เวลาที่ผ่านไป โดยระบุว่าเป็น running/snapshot time และ "ยังจับเวลาอยู่"
- [ ] แสดง **copy block ราย task** สำหรับก๊อปไปลงระบบอื่น
- [ ] ถามผู้ใช้ยืนยัน: พอใจหรือต้องการแก้ไข?
- [ ] ได้รับคำยืนยันจากผู้ใช้แล้ว (เช่น "บันทึก", "ยืนยัน", "OK")
- [ ] เรียก `save_session_note` ด้วย Progress/Handoff Summary + ระบุว่า "task ยังไม่จบ จะทำต่อใน session ใหม่"
- [ ] ⚠️ **ห้ามย้าย task เป็น `done`** — task ต้องอยู่ใน `in_progress`
- [ ] แจ้งผู้ใช้ว่า "บันทึก session note แล้ว task ยังอยู่ใน in_progress ใน session ใหม่สั่ง 'ทำต่อ' ได้เลย"
- [ ] ⚠️ ห้ามส่ง log ไปยังระบบภายนอกใด ๆ

### สถานการณ์ที่ 4: สรุป task เดี่ยว (per-task summary)
- [ ] ระบุ task ที่ต้องการสรุป (จาก task_id หรือค้นหาจากชื่อ)
- [ ] เรียก `get_task` เพื่อดึง Activity timeline + ข้อมูล task
- [ ] ดึง `hours_spent` จาก `get_task` หรือ `get_board`
- [ ] ดึงเวลาเริ่ม-จบ จาก Activity timeline (ถ้าเป็น in_progress ใช้เวลาปัจจุบันเป็น "ปัจจุบัน")
- [ ] **Hard stop:** ก่อนตอบ ต้องมีบรรทัด `เวลาเริ่ม`, `เวลาจบ/ปัจจุบัน`, และ `เวลาทำงานจริง/เวลาที่ผ่านไป` ครบแล้ว ถ้ายังไม่ครบให้ดึง `get_task` เพิ่มก่อน ห้ามตอบจาก `get_time_summary` อย่างเดียว
- [ ] แสดงสรุปราย task (เวลาเริ่ม + เวลาจบ/ปัจจุบัน + เวลาทำงาน/เวลาที่ผ่านไป + หมวดหมู่งาน + สถานะความสมบูรณ์ + เป้าหมาย + ภาพรวม + ไฟล์ที่แก้ไข + รายละเอียดงาน + ค้าง/ส่งต่อ)
- [ ] แสดง **copy block ราย task** สำหรับก๊อปไปลงระบบอื่น
- [ ] ถามผู้ใช้ยืนยัน: พอใจหรือต้องการแก้ไข?
- [ ] ⚠️ ห้ามบวก/ลด/ปรับชั่วโมงเอง — ใช้ค่าจากระบบ
- [ ] ⚠️ ห้ามส่ง log ไปยังระบบภายนอกใด ๆ

### ขั้นตอนสรุปงาน (ใช้ในสถานการณ์ที่ 2, 3 และ 4)
- [ ] สำหรับสถานการณ์ที่ 2 เริ่ม checklist ชุดนี้หลัง `move_task → done` แล้วเท่านั้น; ห้ามสร้าง Final Summary ก่อนปิด
- [ ] เรียก `get_project_context` จาก `kanban-tukdaeng` MCP
- [ ] เรียก `get_time_summary` จาก `kanban-tukdaeng` MCP (สรุปชั่วโมง task DONE ตามวัน/ช่วงเวลา + tz `Asia/Bangkok`)
- [ ] ถ้ามีส่วน `analysis` flag task ที่ชั่วโมงต่ำเกินไป → แสดงให้ผู้ใช้เห็น แต่ห้ามปรับเวลาใน workflow นี้
- [ ] ถ้ามี task `in_progress` ที่เกี่ยวข้องกับ session นี้ → เรียก `get_board` เสริม แล้วบวก `hours_spent` ของ task เหล่านั้นเข้ากับ `total_hours` (แสดงแยกส่วนให้ผู้ใช้เห็นชัด)
- [ ] **เรียก `get_task` เพื่อดึง Activity timeline ของแต่ละ task** — ดึงเวลาเริ่ม (start_time) และเวลาจบ (end_time) จาก time event แรก/สุดท้าย ถ้าเป็น in_progress ใช้เวลาปัจจุบันเป็น "ปัจจุบัน"
- [ ] แสดงรายการ task ที่นำมารวมให้ผู้ใช้เห็นด้วย
- [ ] ถ้าดึงจาก kanban ไม่ได้: สำหรับ progress/report-only อาจประเมินและติดป้ายว่าเป็นค่าประเมิน; สำหรับ Final Summary ต้องหยุดและดึง Final Task + Activity ใหม่ ห้ามประมาณ Final Actual Time
- [ ] **Validation สำหรับ totalHours** — เปรียบเทียบค่าจาก kanban กับงานที่ทำจริง ถ้าดูไม่สอดคล้อง ให้แจ้งผู้ใช้แต่คงค่าจริงจากระบบ
- [ ] **Validation ตามตารางเวลามาตรฐานตามหมวดหมู่** — เทียบ `hours_spent` ของแต่ละ task กับเกณฑ์ (Documentation ≤ 0.5 ชม., Testing ≤ 2 ชม., Feature ≤ 3 ชม., ฯลฯ) ถ้าเกิน → flag และแนะนำว่าควรแตก subtask ในครั้งถัดไป
- [ ] **จัดการ task ที่เกินเวลาเป้าหมาย** — วิเคราะห์และเก็บรายละเอียดงานตามแผน/งานที่ทำเพิ่มพร้อมหมวดของแต่ละส่วนใน canonical summary; Progress/Report-only แสดงบล็อกชี้แจงได้ ส่วน Final Task Completion ต้องรวมสาระสำคัญไว้ใน Human-readable Copy Block เดียว ใช้ค่า `hours_spent` จริง และห้ามแยกเป็นหลาย log เพื่อหลีกเลี่ยง flag
- [ ] รวมข้อมูลวันนี้ + session context ปัจจุบัน
- [ ] สรุปเป็นภาษาง่าย ๆ (ห้ามใช้ชื่อฟังก์ชัน ชื่อ class CSS ชื่อตัวแปร ชื่อ event หรือโค้ด — ใช้คำทั่วไปที่อธิบายผลลัพธ์แทน)
- [ ] **แสดงสรุปรวม** — ภาพรวม + totalHours (รูปแบบ `X ชม. Y นาที (D.D ชม.)`) + รายการ task ที่นำมารวม (markdown ปกติ)
- [ ] **แสดง Progress/Report-only สรุปราย task** — หุ้มด้วย code block (` ``` `) และมีสถานะ + เวลาเริ่ม/จบหรือปัจจุบัน + เวลาทำงาน/เวลาที่ผ่านไป + หมวดหมู่ + สถานะความสมบูรณ์ + เป้าหมาย + ภาพรวม + ไฟล์ที่แก้ไข + รายละเอียดงาน + ค้าง/ส่งต่อ ตามความเกี่ยวข้อง
- [ ] **แสดง copy block ราย task ตามโหมด** — Progress/Report-only ใช้ template ราย task เดิม; Final Task Completion ใช้ Human-readable `text` Copy Block เดียว เลือก Case A/Case B ตาม Mission Mapping จริง หรือ Case C เมื่อ `hours_spent` เกินเกณฑ์หมวด (แสดง `รายละเอียดงานที่ทำ` แยกสัดส่วน `<TASK-CODE>a/b/c [<Category ย่อย>] (ประมาณ X ชม.)` ให้เห็นชัด) และแสดงเฉพาะฟิลด์ที่กำหนด
- [ ] **Progress/Report-only task block ต้องมีเวลาเริ่ม + เวลาจบ/ปัจจุบัน + เวลาทำงาน/เวลาที่ผ่านไป**; Final Work Summary Copy Block แสดง Final Actual Time อย่างเดียว และเก็บ Actual Start/End ใน canonical history
- [ ] **รูปแบบเวลา: `X ชม. Y นาที (D.D ชม.)`** — แสดงทั้งชั่วโมง-นาที และคำนวณเป็นชั่วโมงทศนิยมในวงเล็บ แปลงทุกที่ที่แสดงเวลา (ราย task, รวม, copy block) ส่วนทศนิยมคำนวณจาก `(X × 60 + Y) ÷ 60` ปัดเป็น 1 ตำแหน่งทศนิยม
- [ ] **ห้ามบวก/ลด/ปรับชั่วโมงเอง** — ใช้ค่า `hours_spent` จากระบบ ห้ามเรียก `log_time`; ถ้าผิดปกติให้รายงานและแยก correction workflow
- [ ] **ทุก task block ต้องมีบรรทัด "หมวดหมู่งาน"** — เลือกจากรายการ 9 หมวด เพียง **1 หมวด** ต่อ 1 task ห้ามระบุหลายหมวดคั่นด้วย `,`
- [ ] **Progress/Report-only task block ต้องมีบรรทัด "สถานะความสมบูรณ์"**; Final Work Summary Copy Block ไม่แสดงฟิลด์นี้
- [ ] **Progress/Report-only task block ต้องมีบรรทัด "เป้าหมาย/ผลลัพธ์ที่คาดหวัง"**; Final Work Summary Copy Block ไม่แสดง section นี้แยก
- [ ] **ถ้า Progress/Report-only task มีการแก้ไฟล์จริง** → แสดง subsection "ไฟล์ที่แก้ไข"; Final Work Summary Copy Block รวมสาระไว้ใน `รายละเอียดงานที่ทำ` โดยไม่สร้าง Files Changed section
- [ ] **ถ้ามีงานเพิ่มนอกแผน** → รวมเป็น bullet ใน subsection "รายละเอียดงานที่ทำ" ไม่ต้องแยก subsection แต่ละ bullet รวมเหตุและทางแก้ในบรรทัดเดียว ใช้ `→` คั่น ถ้าไม่มี ข้ามได้
- [ ] **ถ้ามี open items** → task `in_progress` ใช้ subsection "ค้าง/ติดตาม"; task `done` ใช้ "ส่งต่อ" สำหรับงานใหม่ที่ไม่ทำให้ Acceptance Criteria ของ task เดิมไม่ครบ; ถ้าไม่มีให้ข้าม subsection นี้
- [ ] **bullet ใน "รายละเอียดงานที่ทำ" อนุญาตให้ใส่ตัวเลขปริมาณได้** (เช่น "แก้ 3 หน้าจอ", "เพิ่ม 4 API") แต่ห้ามใส่รายชื่อไฟล์ทีละตัว — รายชื่อไฟล์ให้แสดงใน subsection "ไฟล์ที่แก้ไข" แทน
- [ ] **bullet ที่เล่าปัญหา/decision/gap ต้องระบุเนื้อหา** — บอก "ปัญหาอะไร + แก้/ตัดสินใจอะไร" ในตัว bullet (ห้ามเขียนแค่กระบวนการ เช่น "พบ gap 3 จุด → รายงานผู้ใช้" โดยไม่บอกว่า gap คืออะไร)
- [ ] **4 มาตรฐานข้อมูลสำคัญใน `รายละเอียดงานที่ทำ`** — ตรวจว่ามี (1) ตัวเลขสถิติจริง (Test/Regression/Cooldown/Quota), (2) สาเหตุบั๊กที่แท้จริง (Root Cause), (3) มาตรการความปลอดภัย (Security), และ (4) สาเหตุ/วิธีแก้เมื่อเกินเวลา (Improvement) เมื่อเกี่ยวข้องกับ task นั้น
- [ ] **อ้าง requirement/spec/entity ด้วยชื่อ ไม่ใช่ ID ล้วน** — ห้าม `bf08de1f`/`18598f33` ลอย ๆ; ใช้ชื่อที่อ่านรู้เรื่อง (internal ID เก็บไว้ใน session note; Task Code แบบ AIL-xxx ใช้ได้)
- [ ] **"รายละเอียดงานที่ทำ" ต้องเป็นงานของ task เท่านั้น** — ห้ามใส่เรื่อง workflow/kanban mechanics (timer quirk, ค่า default ตอนสร้าง, การย้าย column); ถ้าสำคัญให้แจ้งแยกนอก copy block
- [ ] **task ที่ยัง `in_progress`** ต้องระบุ "ปัจจุบัน: <now>" แทน "เวลาจบ" และใช้ "เวลาที่ผ่านไป" แทน "เวลาทำงาน" พร้อมระบุ "(ยังจับเวลาอยู่)"
