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
(ผลลัพธ์เห็นบนจอ:                    ↓
 capture Before ก่อนแก้โค้ด)         สร้าง Final Work Summary ชุดเดียว
                                     ↓
                                     รวมหลักฐานประจำ Task
                                     ↓
                                     save_session_note (Final Summary)
                                     ↓
                                     แสดง Final Work Summary Copy Block
                                     ↓
                                     Session Handoff + Prompt งานถัดไป
                                     (หรือข้อเสนอแนะงานต่อไปถ้าไม่มีงานรอทำ)

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
- สำหรับ `progress/handoff` และ `report-only` ให้แสดงทั้งสรุปรวมและสรุปราย task ในผลลัพธ์เดียวกัน; `final` ต้องแสดง **สรุปราย task แบบเต็ม (เวลาเริ่ม/เวลาจบ/เวลาทำงาน + หมวดหมู่งาน + สถานะความสมบูรณ์ + เป้าหมาย + ภาพรวม + ไฟล์ที่แก้ไข + รายละเอียดงาน + ส่งต่อ) ก่อน** แล้วตามด้วย Final Work Summary Copy Block — เนื้อหา `เป้าหมาย/ผลลัพธ์ที่คาดหวัง`, `ภาพรวม` และ `รายละเอียดงานที่ทำ` ของทั้งสอง block ต้องเป็นชุดเดียวกัน

---

## สถานการณ์ที่ 1: เริ่มทำ task

### เงื่อนไขเริ่ม
- ผู้ใช้สั่งให้เริ่ม task ใหม่ (เช่น "เริ่มทำ task X", "เริ่ม task Y", "ขอเริ่ม ...")
- มี task ใน kanban ที่ต้องการเริ่มทำ

### ขั้นตอน

#### 1. ตรวจสอบ task ที่จะเริ่ม
- ถ้าผู้ใช้ระบุ task_id ชัดเจน → ใช้ task_id นั้น
- ถ้าผู้ใช้ระบุแค่ชื่อ/คำค้น → เรียก `get_board` หรือ `get_project_context` เพื่อหา task ที่ตรง
- ถ้าเป็น task ใหม่ที่ยังไม่มีใน kanban → ถามผู้ใช้ว่าต้องการสร้าง task ใหม่หรือไม่ ถ้าใช่ให้ใช้ `create_task` และ Description ต้องมีบรรทัด `Category: <หมวด> | Planned: <X> ชม. (Category Max <Y> ชม.)` เสมอ (Y = ค่า "ห้ามเกิน" ของหมวดจากตารางเวลามาตรฐาน) โดย `Planned` ต้องเป็นเวลาที่ประเมินตามงานจริง ไม่มี floor ขั้นต่ำ — ประเมินตามหลักเวลาจริงด้านล่าง; ถ้างานเล็กจนแทบไม่ใช้เวลาเลย ควรพิจารณารวมเข้ากับ task ที่เกี่ยวข้องแทนการสร้าง task แยก
- ถ้า task ที่จะเริ่มไม่มีบรรทัด `Planned` ใน Description → แจ้งผู้ใช้และเสนอเติมผ่าน `update_task` ก่อนเริ่มจับเวลา เพื่อให้เช็ก Time Ratio (เวลาจริงเทียบเป้าหมาย > 1.5 → ติด review) ได้
- ตรวจว่า task map กับ Mission/Objective ใน approved plan แล้ว — ต้องรู้หมายเลข `mission-<N>-objective-<M>` ก่อนเริ่มจับเวลา เพราะใช้ตั้งชื่อโฟลเดอร์หลักฐาน (`screenshots/`, `deliverables/`); ถ้ายังไม่ map ให้ยืนยัน mapping กับผู้ใช้ก่อน; **ถ้าเป็น task ที่ไม่มี mission จริง (standalone/maintenance/ad-hoc — ยืนยันกับผู้ใช้แล้ว) หลักฐานยังต้องเก็บตามปกติทุกขั้น** โดยใช้โฟลเดอร์ `screenshots/task-<TASK-CODE>/` และ `deliverables/task-<TASK-CODE>/` แทน `mission-<N>-objective-<M>` ทุกจุดใน skill นี้

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

#### 4. ถ้า task มีผลลัพธ์ที่เห็นบนหน้าจอ — เก็บภาพ Before ก่อนแตะโค้ด (บังคับ)

ใช้กับ task ที่ผลลัพธ์สะท้อนบนหน้าจอ — ครอบคลุมทั้งการแก้ prototype/UI โดยตรง **และ** การแก้ logic, data, mock data, flow หรือ behavior ที่ผู้ใช้เห็นบนจอ (เช่น แก้เงื่อนไขที่เปลี่ยนสิ่งที่แสดง, mock data ที่เปลี่ยน list, logic ที่เปลี่ยนผลการคำนวณ) — ให้ตรวจสภาพหน้าจอเดิมและแคปภาพ Before เก็บไว้ใน `screenshots/mission-<N>-objective-<M>/before/` ทั้ง Desktop (1440px) และ Mobile (390px) **ก่อนเริ่มแก้โค้ด** เพื่อให้มีภาพเทียบกับ After ตอนปิด task/ส่งตรวจ (รายละเอียดตาม Continuous Evidence Capture ในสถานการณ์ที่ 2) — ถ้าไม่มีภาพ Before จะไม่มีหลักฐานเทียบการเปลี่ยนแปลง

> เมื่อไม่แน่ใจว่า task อยู่ในเกณฑ์หรือไม่ ให้ถามว่า "ผู้ตรวจจะเห็นความต่างบนหน้าจอไหม" — ถ้าใช่ ต้อง capture Before; งานเอกสาร/อ่านอย่างเดียวที่ไม่เปลี่ยนสิ่งที่เห็นบนจอไม่ต้อง capture แต่ยังต้องเก็บหลักฐานประเภทอื่นตามขั้น 6 ของสถานการณ์ที่ 2

#### กฎสำคัญ
- ⚠️ **ควรมี task ใน `in_progress` เพียง 1 task ต่อผู้ใช้ในแต่ละเวลา** — ถ้ามี task เดิมค้างอยู่ ให้ pause ก่อน
- ห้ามข้ามขั้นตอนการตรวจสอบ task อื่นใน `in_progress`
- หลังย้ายเข้า `in_progress` แล้ว ให้เริ่มทำงานได้เลย ไม่ต้องรอยืนยันเพิ่ม
- ⚠️ task ที่ผลลัพธ์เห็นบนหน้าจอ (แก้ UI โดยตรงหรือ logic/data ที่สะท้อนบนจอ) ต้องแคปภาพ Before (Desktop 1440 + Mobile 390) ก่อนแก้โค้ดตามขั้น 4 — ห้ามข้าม เพราะ After ที่ไม่มี Before เทียบไม่ใช่หลักฐานที่สมบูรณ์

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

#### 2.1 Manual Review Checklist (บังคับเมื่อ task เปลี่ยนสิ่งที่เห็นบนหน้าจอ)

ถ้า task มีการแก้ prototype/หน้าจอ หรือแก้ logic, data, mock data, flow ที่ผลลัพธ์สะท้อนบนหน้าจอ **ต้องส่งรายการทดสอบ manual ให้ผู้ใช้ตรวจก่อน** ขออนุญาตปิด/commit — ห้ามถามแค่ "รีวิวหน้าจอหน่อย" โดยไม่มีลิสต์ เพราะผู้ใช้ไม่รู้ว่าต้องกดอะไร

รูปแบบ checklist ที่ต้องส่ง (เรียงเป็นเคสละขั้น):

- **เลขเคส + ชื่อเคส** — เช่น "เคส 1: Failed-login lock ที่ seed ไว้ (ADM-007)" แยกเคสตามพฤติกรรมที่เปลี่ยน/เพิ่ม ครบทุกพฤติกรรมใน scope
- **ข้อมูลทดสอบที่ต้องกรอก/เลือก** — email, account id, scenario option, ค่าที่ต้องพิมพ์ ระบุค่าจริงที่ใช้ได้เลย (เช่น `wichai@tukdaeng.example`, เลือก `Invalid credentials`) ไม่ใช่บอกแค่ "กรอกข้อมูล"
- **ขั้นตอนกด** — กดปุ่ม/ลิงก์อะไรตามลำดับ (เช่น เปิด Prototype scenario → เลือก X → กด เข้าสู่ระบบ กี่ครั้ง)
- **ผลที่คาด (✅)** — ระบุสิ่งที่ต้องเห็นต่อเคส: ข้อความที่แสดง, element ที่ต้องมี/ไม่มี (เช่น "ไม่มี countdown"), state ที่ต้องเปลี่ยน (เช่น "เข้าระบบได้")
- **เคสครบทุกพฤติกรรมใน scope** — รวมทั้ง happy path, blocked/error path, edge cases, fixture ที่เกี่ยวข้อง และเคส regression ที่ควรเช็คว่าของเดิมไม่พัง (เช่น login ปกติ, forgot flow เดิม)
- แนบ screenshot ของจุดสำคัญได้ถ้าช่วยให้ตรวจเร็ว แต่ checklist ต้องอ่านรู้เรื่องโดยไม่ต้องเปิดภาพ

เมื่อผู้ใช้ตรวจครบและยืนยันผล จึงค่อยขึ้นขั้น 3 (ปิด task) — ถ้าผู้ใช้พบจุดผิดให้แก้แล้วส่ง checklist ชุดเดิม (หรือเคสที่แก้) ให้ตรวจซ้ำ — และเมื่อตรวจผ่านแล้ว **บันทึก checklist ที่ตรวจจริงพร้อมผลรายเคส (ผ่าน / ไม่ผ่าน / พบอะไร + ผลการแก้ไข) และภาพผลลัพธ์ประกอบ** ลง `deliverables/mission-<N>-objective-<M>/` หรือ `screenshots/mission-<N>-objective-<M>/` เป็นหลักฐานของ task ทันที ห้ามปล่อยให้ checklist มีแค่ข้อความในแชทโดยไม่มีไฟล์หลักฐาน

#### 2.2 Continuous Evidence Capture (เก็บบันทึกหลักฐานระหว่างทำ Task ทันที 6 รูปแบบงาน)

เพื่อไม่ให้เสียเวลารวบรวมหรือรันเทสต์ใหม่ย้อนหลังตอนจบ Mission และเพื่อให้ได้หลักฐานตัวจริงที่สมบูรณ์ที่สุด ให้เก็บหลักฐานแบบ Real-time ระหว่างทำแต่ละ Task ตาม 6 รูปแบบงานดังนี้:

1. **งานแก้ UI / Prototype (Bug Fix / Refactor — รวม logic/data ที่สะท้อนบนจอ):**
   - **Before Action (ก่อนเริ่มแตะโค้ด):** แคปภาพหน้าจอเดิมเก็บไว้ใน `screenshots/mission-<N>-objective-<M>/before/` ทั้งสองขนาด Viewport: Desktop (1440px) และ Mobile (390px)
   - **After Action (Auto-Trigger เมื่อผู้ใช้บอกโอเค/สั่งปิด task):** เมื่อผู้ใช้ตรวจผลงานแล้วพูดว่า *"โอเค"*, *"ผ่าน"*, *"ปิด task ได้เลย"*, *"เสร็จแล้ว"* ให้ระบบถือเป็นคำอนุมัติ (Approval) และรันแคปภาพผลลัพธ์ปัจจุบันใน `screenshots/mission-<N>-objective-<M>/after/` (1440px + 390px) อัตโนมัติทันทีก่อนย้าย task เข้า `done` โดยไม่ต้องถามซ้ำซ้อน; หากมีการแก้หลายรอบ ให้แคปเฉพาะสภาพสุดท้ายที่ผู้ใช้คอนเฟิร์มผ่าน
2. **งานสร้าง UI ใหม่ (New Feature / New Screen):**
   - แคปภาพหน้าจอทุก State สำคัญ (Empty, Default, Filled, Modal, Result) ทั้ง Desktop (1440px) และ Mobile (390px) เก็บไว้ใน `screenshots/mission-<N>-objective-<M>/` เมื่อสร้างเสร็จและผู้ใช้ตรวจผ่าน
3. **งานทดสอบ / QA / Regression (Automated Test Verification):**
   - ในขั้นตอน Verification ให้รันคำสั่งเทสต์จริงและ redirect stdout/stderr ดิบเข้าไฟล์ทันที เช่น:
     `npx playwright test tests/<target-spec>.spec.js > deliverables/mission-<N>-objective-<M>/test-results.txt 2>&1`
   - คัดลอกไฟล์ `.spec.js` หรือ bundle spec files เข้าโฟลเดอร์ `deliverables/mission-<N>-objective-<M>/`
   - **เก็บหลักฐานภาพตอนรันจบทันที (ห้ามปล่อยให้ต้องรันใหม่ตอนส่งตรวจ):** เก็บ `playwright-report/` ไว้ และแคปภาพ HTML report dashboard (`npx playwright show-report` แล้ว capture) ลง `screenshots/mission-<N>-objective-<M>/`; ถ้า test ตรวจพฤติกรรม dynamic (countdown lockout, error live, focus trap, toast) ให้แคปภาพหน้าจอ flow นั้นหรืออัด screencast สั้น ๆ เก็บไว้ในรอบเดียวกัน — auditor เคยหักคะแนนเพราะส่งแค่ text log โดยไม่มีภาพ UI
   - **เขียน triage note ของเคส skipped/blocked ตอนรันจบทันที** ระบุเหตุผลต่อเคสหรือต่อกลุ่ม (project gating / environment / out of scope) ลง `deliverables/mission-<N>-objective-<M>/<task-code>-triage.txt` — context เหตุผลอยู่ในหัวเฉพาะตอนรัน ทำย้อนหลังตอนส่งตรวจมักไม่ตรงกับผลจริง
   - **ถ้า scope งานครอบ accessibility** (numerical contrast, focus trap, dialog role/aria-modal) ต้องรัน direct assertion จริงในรอบเดียวกัน (เช่น axe-core/playwright) หรือบันทึกเป็น evidence limitation ใน task note ทันทีพร้อมเหตุผล — ห้ามปล่อยว่างให้ auditor เจอเองตอนตรวจ
4. **งาน Manual QA / Inspection (งานตรวจที่ไม่มีโค้ดแก้):**
   - บันทึกรายการเคสและ Viewports ที่ตรวจรับผ่านเป็น checklist text file ใน `deliverables/mission-<N>-objective-<M>/checklist-objective-<M>.txt`
   - เรนเดอร์เป็นภาพ Checklist Card PNG เก็บไว้ใน `screenshots/mission-<N>-objective-<M>/` ด้วย `scripts/render-checklist-card.js`
5. **งานเอกสาร / Spec Sync / Baseline Lock:**
   - บันทึก Git Commit Hash และรายการไฟล์ Markdown ที่แก้จริงลงใน `deliverables/mission-<N>-objective-<M>/` และ Task Session Note ทันทีหลัง commit
   - เรนเดอร์ Checklist Card PNG สรุปรายการไฟล์และเกณฑ์ที่ sync
6. **งาน Final Acceptance / Mission Closure:**
   - บันทึกรายงานสรุปผลการตรวจรับ `deliverables/mission-<N>-objective-<M>/final-acceptance-review.txt`
   - เรนเดอร์ภาพ Checklist Card PNG สรุป Traceability, Verification Gates และ Verdict PASS

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
- ระบบหยุดจับเวลาและบันทึก `hours_spent` อัตโนมัติ (system minimum 0.1h) — ใช้ค่านี้เป็นเวลาจริงเลย ไม่มี floor ขั้นต่ำ ห้ามปรับขึ้นเพราะค่า "ดูน้อย"
- **หลักเวลาจริง (ใช้ทั้งตอนตั้ง Planned และตอนลงเวลา):** เวลาต้องสะท้อนคนทำจริง — งานที่ AI ทำ (เขียนสคริปต์/สแกนไฟล์/เขียนเอกสาร) ให้ประเมินและลงตามเวลา AI ซึ่งมักเร็วกว่าที่คิด; งานที่ต้องใช้คนทำเองแบบ manual (เช่น ผู้ใช้เปิดจอตรวจเองทีละหน้า, review, ตอบ decision rounds) ให้นับเวลาคนที่ใช้จริง — ถ้า task ผสมทั้งสองอย่าง ให้รวมเวลาทั้งคู่เข้าด้วยกัน
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

#### 6. รวมและบันทึกหลักฐานประจำ Task (Task Evidence Bundle — บังคับ)

หลังสร้าง Final Summary แล้ว ต้องรวมหลักฐานของ task นั้นให้ครบและแนบไว้กับ task/note ว่าทำอะไรไปบ้าง — หลักฐานราย task ชุดนี้จะถูกดึงไปคัดเลือกและรวมเป็นหลักฐานส่งตรวจระดับเป้าหมายใน `submission-evidence` ภายหลัง:

- **task ที่ผลลัพธ์เห็นบนหน้าจอ (UI/prototype/logic/data ที่สะท้อนบนจอ):** Manual Review Checklist ที่ผู้ใช้ตรวจจริงพร้อมผลรายเคส (ผ่าน / ไม่ผ่าน / พบอะไร + ผลแก้ไข) บันทึกเป็นไฟล์หลักฐาน + ภาพผลลัพธ์ที่ตรวจ + ภาพ Before/After (1440 + 390) ตาม 2.2
- **task ที่มี test:** สรุป test list ออกมาเป็นไฟล์ — `.spec.js` ที่รัน, เคสที่เทสอะไรบ้าง, ผ่าน/ไม่ผ่าน, จำนวน passed/failed/skipped ตามผลจริง + raw runner output (`test-results.txt`) + ภาพ HTML report dashboard หรือภาพ/screencast พฤติกรรม UI ที่ test ตรวจ (จาก 2.2) + triage note ของเคส skipped/blocked
- **task เอกสาร/อื่น ๆ:** รายการไฟล์ที่แก้จริง + commit hash (ถ้ามี)
- ทุก task ต้อง trace ได้ว่า "ทำอะไรไปบ้าง" — ระบุ path หลักฐานทั้งหมดไว้ใน Final Session Note/Copy Block ของ task นั้น และตั้งชื่อไฟล์หลักฐานให้ trace กลับถึง task ได้ (เช่น `<task-code>-checklist.txt`, `<task-code>-test-results.txt`) เพราะหลาย task แชร์โฟลเดอร์ `mission-<N>-objective-<M>/` เดียวกัน
- ถ้าหลักฐานขาด (เช่น ลืมแคป Before) ให้แจ้งผู้ใช้และบันทึก evidence gap ตรง ๆ ห้ามสร้างหลักฐานย้อนหลังแบบเสแสร้ง

#### 7. บันทึก Final Session Note ลง Kanban

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

#### 8. แสดงสรุปราย task + Final Work Summary Copy Block

- หลัง `save_session_note` สำเร็จ ให้แสดง **สรุปราย task แบบเต็มก่อน** (template ราย task โหมด done: เวลาเริ่ม/เวลาจบ/เวลาทำงาน + หมวดหมู่งาน + สถานะความสมบูรณ์ + เป้าหมาย + ภาพรวม + ไฟล์ที่แก้ไข + รายละเอียดงาน + ส่งต่อ) แล้วตามด้วย Final Work Summary Copy Block ให้ผู้ใช้ทุกครั้ง
- Copy Block ต้องสร้างจาก canonical Final Summary ชุดเดียวกับที่บันทึกใน note
- ใช้ Human-readable `text` Copy Block เดียวตาม template ในหัวข้อ **Final Work Summary Copy Block** โดยตรวจ Mission Mapping ก่อน แล้วแสดง Objective/Feature เมื่อมี mapping จริง ตามด้วย Task Code + Task Name, Category, เวลาเริ่ม/เวลาจบ/Final Actual Time, เป้าหมาย/ผลลัพธ์ที่คาดหวัง, ภาพรวม, ไฟล์ที่แก้ไข และรายละเอียดงานที่ทำ
- Actual Start, Actual End, status, completion status และ workflow metadata ยังคงอยู่ใน canonical Final Summary / Final Session Note แต่ไม่แสดงใน Work Log Copy Block
- แจ้งผู้ใช้ว่า task ถูกปิดแล้วและแสดงเวลาในรูปแบบ `D.D ชม.` (ทศนิยม 1 ตำแหน่ง)

#### 9. ปิดท้ายด้วย Session Handoff + Prompt งานถัดไป หรือข้อเสนอแนะงานต่อไป (บังคับทุกครั้งหลัง Copy Block)

หลังแสดง Final Work Summary Copy Block แล้ว ต้องทำขั้นนี้เสมอก่อนจบ turn — ห้ามจบแค่ Copy Block:

**กรณีมีงานรอทำต่อ** (มี task ถัดไปใน approved execution order หรืองานที่เหลือใน mission/plan ที่ผู้ใช้อนุมัติแล้ว):

1. บันทึก session note ลง kanban (`save_session_note`) เก็บ state ปัจจุบันให้ session ใหม่ทำต่อได้ — เขียนบน task ที่เพิ่งปิดหรือ planning task ของ mission ตามความเหมาะสม โดยมี: สถานะรวม mission/แผน (ทำถึงไหน), สิ่งที่ทำใน session นี้, state ปัจจุบัน (branch/commit/tests), decisions/gotchas ที่ session ใหม่ต้องรู้, และ Next Step ชัดเจน
2. สร้าง **prompt สำหรับเริ่มงานถัดไปใน session ใหม่** เป็น copy block ให้ผู้ใช้ก๊อปไปวาง — โครงเดียวกับ prompt ที่ผู้ใช้เคยสั่ง task นี้: ชื่อ task + mission/requirement context + ข้อมูลที่ task ต้องรู้ (task ก่อนหน้าสำเร็จอะไร, contract/spec ที่ต้องยึด, scope, fixture ที่เกี่ยวข้อง, constraints/gotchas, out-of-scope) + ขั้นตอน workflow (ดึง context → สร้าง/เริ่ม task → เสนอ approach → implement/test → รอรีวิว)

**กรณีไม่มีงานรอทำต่อ** (mission/plan ครบแล้ว หรือไม่มี task ถัดไปในลำดับ):

- ไม่ต้องสร้าง handoff prompt; ให้บันทึก session note สถานะปิดงานตามความจำเป็น แล้วเสนอแนวทางงานต่อไปให้ผู้ใช้ตัดสินใจ เช่น: สร้าง mission ใหม่สำหรับ requirement/scope ที่ยังไม่ได้ทำ, งาน outstanding ใน requirement, backlog/debt ที่ตั้งไว้, หรือขั้นตอนต่อไปของโปรเจกต์ (เช่น Mission Closure, เตรียมหลักฐานส่งตรวจ) — เสนอเป็นทางเลือกให้ผู้ใช้เลือก ห้ามสร้าง mission/task เองโดยไม่ได้รับคำสั่ง

#### กฎสำคัญ
- ⚠️ **Close First:** ห้ามสร้างหรือแสดง Final Work Summary ก่อน `move_task → done`
- ⚠️ Final Actual Time ต้องมาจาก Kanban หลังปิด task เท่านั้น ห้ามใช้ snapshot/elapsed time ตอน `in_progress`
- ⚠️ ห้ามเรียก `log_time` ใน completion workflow ไม่ว่าก่อนหรือหลังปิด task
- ⚠️ ห้ามปรับ `hours_spent` เองระหว่าง completion workflow; ถ้าค่าผิดปกติให้รายงานผู้ใช้และแยกเป็น correction workflow ที่ผู้ใช้สั่งชัดเจน
- ⚠️ **เวลารอผู้ใช้รีวิวหน้าจอ/prototype = เวลาทำงานจริง** — task ที่เปลี่ยนสิ่งที่เห็นบนหน้าจอแล้วรอผู้ใช้ตรวจตาม Manual Review Checklist ต้องนับเวลาต่อเนื่อง เพราะ review gate คือส่วนหนึ่งของงาน ห้ามตัดเวลารอรีวิวออกจาก `hours_spent`
- ⚠️ **ตัดเวลาหลุดได้เฉพาะงานประเภท run** (เช่น run tests/regression/long-running command) ที่ผลลัพธ์เสร็จสมบูรณ์แล้วแต่ timer ยังเดินต่อเพราะผู้ใช้ไม่ได้อยู่หน้าจอ — ถ้าพบ banked time มีช่วงหลุดแบบนี้หลังปิด task ให้แจ้งผู้ใช้พร้อมตัวเลข banked vs เวลางานจริง และ correct `hours_spent` ด้วย `update_task` (SET) เมื่อผู้ใช้ยืนยันเวลาจริงแล้วเท่านั้น โดยทำเป็น correction workflow แยกหลังปิด task
- ทุก task ที่ปิดต้องมี Final Session Note และ Final Work Summary Copy Block
- ⚠️ **Task Evidence Bundle บังคับ:** ทุก task ที่ปิดต้องรวมหลักฐานประจำ task (checklist ผลตรวจ / test list + raw output / ภาพ Before-After / ไฟล์+commit ที่แก้) ทันทีหลังปิด และระบุ path ใน Final Session Note — หลักฐานราย task เหล่านี้จะถูกดึงไปรวมเป็นหลักฐานส่งตรวจระดับเป้าหมายใน `submission-evidence`
- ⚠️ **Manual Review Checklist:** task ที่เปลี่ยนสิ่งที่เห็นบนหน้าจอ (UI/prototype/logic/data ที่สะท้อนบนจอ) ต้องส่ง checklist ทดสอบ manual (เคส + ข้อมูลทดสอบ + ขั้นกด + ผลที่คาด) ให้ผู้ใช้ตรวจก่อนขอปิด — รีวิวต้องเกิดก่อน `move_task → done` ตามกฎการยืนยันผลลัพธ์เดิม
- **ถ้า task ที่ปิดเป็น task สุดท้ายของเป้าหมาย (Objective) ใน Mission** — ทุก task ของเป้าหมายนั้นเป็น done แล้ว → แจ้งผู้ใช้ว่าเป้าหมายครบ และเสนอเตรียม **หลักฐานส่งตรวจรับด้วย AI** ตาม skill `submission-evidence` (ไฟล์แนบ/ภาพหน้าจอ + คำอธิบาย + ช่อง external_url) ให้ลง log พร้อมกัน
- ลำดับบังคับ: Verify → `move_task → done` → อ่าน Final Task + Activity → อ่าน Actual Start/End/Final `hours_spent` → สร้าง Final Summary → รวมหลักฐานประจำ Task → `save_session_note` → แสดง Copy Block → session handoff + prompt งานถัดไป หรือข้อเสนอแนะงานต่อไป (ตามขั้น 9)

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
- **หลักฐานที่เก็บไว้แล้วระหว่างทำ** — path ภาพ Before/After, checklist, test output ที่ capture/บันทึกแล้ว เพื่อให้ session ใหม่ไม่ capture ซ้ำและรู้ว่าหลักฐานยังขาดอะไร
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
  - `เวลาที่ผ่านไป: <D.D> ชม.` (คำนวณจาก start_time ถึง now)
- สำหรับ task `done` ให้แสดง:
  - `เริ่ม: <start_time>`
  - `จบ: <end_time>`
  - `เวลาทำงาน: <D.D> ชม.` (ใช้ค่า `hours_spent` จากระบบ ไม่คำนวณเอง)
- ถ้าทราบว่า task ถูกสร้าง/เริ่มย้อนหลังหลังทำงานไปแล้ว, `hours_spent` ถูกกรอกเป็นค่าเริ่มต้นด้วยมือ หรือเวลาในระบบไม่ครอบคลุมช่วงทำงานจริง ให้แสดงเป็น **เวลาที่บันทึกในระบบ** พร้อมบอกข้อจำกัด; ห้ามเรียกว่าเวลาทำงานจริงหรือใช้เป็นหลักฐานว่าเกินแผน

**รูปแบบเวลา (Time Format):**
- แสดงเวลาทำงานในรูปแบบ `D.D ชม.` — ชั่วโมงทศนิยม 1 ตำแหน่งเท่านั้น (เช่น `1.6 ชม.`, `0.7 ชม.`, `0.3 ชม.`, `4.0 ชม.`)
- ปัดเป็นทศนิยม 1 ตำแหน่งจาก `hours_spent` ดิบ (เช่น 0.62 → 0.6 ชม., 0.15 → 0.2 ชม., 1.65 → 1.7 ชม.)
- **ยกเว้น:** ใน `hours_spent` ที่ส่งกลับจาก kanban ยังคงเป็นทศนิยมดิบ (เช่น `1.62`) — ปัดเป็น `D.D ชม.` เฉพาะตอนแสดงผลให้ผู้ใช้

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

นอกจากเทียบกับงานจริงแล้ว ต้องเทียบ `hours_spent` ของแต่ละ task กับเกณฑ์เวลามาตรฐานตามหมวดหมู่งาน — **ใช้ตารางเดียวกับ mission-planning (ตาราง canonical)**:

| หมวดหมู่งาน | เป้าหมาย (ดีมาก) | ห้ามเกิน |
|---|---|---|
| Requirement | 1 ชม. | 1 ชม. |
| Design | 1 ชม. | 1 ชม. |
| Feature | 2 ชม. | 3 ชม. |
| Bug Fix | 1 ชม. | 1.5 ชม. |
| Testing | 1 ชม. | 1 ชม. |
| Refactor | 1-1.5 ชม. | 2 ชม. |
| Documentation | 0.5 ชม. | 0.5 ชม. |
| Deploy / DevOps | 1-1.5 ชม. | 2 ชม. |
| Meeting | 1 ชม. | 1.5 ชม. |

**กฎการตรวจ (อัปเดต — เข้มกว่าเดิม):**
- ถ้า `hours_spent` สูงกว่าค่าเป้าหมายของหมวด → พิจารณาเทียบกับขนาดและความครบถ้วนของงาน; แจ้งผู้ใช้เมื่อมีความต่างที่ควรทบทวน แต่ห้ามเรียกว่า "เกินแผน" เว้นแต่มีแผนที่ตกลงไว้และเวลาจับจริงที่เชื่อถือได้
- ถ้าสูงกว่าค่า "ห้ามเกิน" ให้แจ้งเป็นสัญญาณให้ทบทวนแผนหรือการแบ่งงานในอนาคต แต่ห้ามแบ่งชั่วโมงย่อยโดยไม่มีบันทึกรองรับ
- ถ้า `hours_spent` ต่ำกว่าเป้าหมายมาก → ตรวจดูว่างานสมบูรณ์จริงหรือไม่
- การ flag เป็นการแจ้งเพื่อให้ผู้ใช้ทราบและปรับปรุงการวางแผนครั้งถัดไป — ไม่ได้หมายความว่า task ผิด

**ถ้าค่าเวลาดูผิดปกติ:**
- แจ้งค่าที่ระบบคืนและเหตุผลที่สงสัยให้ผู้ใช้ทราบ
- ห้ามเรียก `log_time` ในทุกกรณี เพราะ auto-timer เป็นผู้ bank เวลาจริงเมื่อย้าย task ออกจาก `in_progress`
- ห้ามแก้ `hours_spent` ระหว่าง completion workflow; การแก้ข้อมูลเวลา (ถ้าจำเป็น) ต้องเป็น correction workflow แยกต่างหากที่ผู้ใช้สั่งชัดเจน
- Final Work Summary ต้องใช้ค่าจริงหลังปิดที่ Kanban แสดงอยู่ในขณะนั้น

### 5.1 การชี้แจงเวลาที่สูงกว่าแผน (Over-budget)

ใช้ส่วนนี้เพื่ออธิบายความต่างระหว่างแผนกับเวลาที่บันทึก โดยไม่ทำให้สรุปหัวหน้ายาวหรือสร้างตัวเลขที่ไม่มีหลักฐาน:

- เปรียบเทียบกับแผนที่ตกลงไว้จริงเท่านั้น; ค่าเป้าหมายของหมวดงานใช้เป็นสัญญาณเตือนหรือข้อมูลประกอบ ไม่ใช่หลักฐานว่า task เกินแผน
- ถ้าไม่มีแผนเวลา ให้ไม่ระบุว่าเกินแผน; ถ้าเวลาถูกตั้งย้อนหลัง/ด้วยมือ หรือทราบว่า timer ไม่ได้จับเวลางานจริง ให้เรียกว่า "เวลาที่บันทึกในระบบ" และไม่ใช้วิเคราะห์ over-budget เสมือนเวลาจริง
- ถ้าเวลาที่เชื่อถือได้สูงกว่าแผน ให้ระบุค่าแผน เวลาที่บันทึก ส่วนต่าง และสาเหตุเฉพาะที่ยืนยันได้อย่างกระชับใน canonical summary; ใน Copy Block ใส่เฉพาะเมื่อช่วยให้ผู้อ่านเข้าใจผลของงาน
- ห้ามแบ่งเวลารวมให้กิจกรรมย่อยด้วยการประมาณย้อนหลังเพื่อให้ตัวเลขรวมลงตัว; แสดงเวลารายส่วนได้เฉพาะเมื่อ Activity Timeline หรือบันทึกร่วมสมัยรองรับ
- หากพบ scope เพิ่มที่มีนัยสำคัญ ให้บอกว่างานส่วนใดเพิ่มและเพราะอะไร; เสนอแยก task ในอนาคตได้เมื่อช่วยวางแผน แต่ห้ามเปลี่ยนเวลาในระบบหรือสร้าง task โดยไม่ได้รับคำสั่ง
- ห้ามเรียก log_time หรือปรับ hours_spent ใน workflow สรุปงาน; การแก้เวลาเป็น correction workflow แยกที่ต้องได้รับการยืนยันจากผู้ใช้

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

รูปแบบสรุปรวมและสรุปราย task ในหัวข้อนี้ใช้กับ `progress/handoff`, `report-only` **และ `final`** — สำหรับ Final Task Completion ให้แสดง **สรุปราย task แบบเต็มก่อน** (ใช้ template ราย task โหมด done: เวลาเริ่ม/เวลาจบ/เวลาทำงาน + หมวดหมู่งาน + สถานะความสมบูรณ์ + เป้าหมาย + ภาพรวม + ไฟล์ที่แก้ไข + รายละเอียดงาน + ส่งต่อ) แล้วตามด้วย **Final Work Summary Copy Block** ตาม template เฉพาะด้านล่าง โดย canonical Final Summary / Final Session Note ยังคงรายละเอียดเต็ม และเนื้อหา `เป้าหมาย/ผลลัพธ์ที่คาดหวัง`, `ภาพรวม` และ `รายละเอียดงานที่ทำ` ของทั้งสอง block ต้องเป็นชุดเดียวกัน

### หลักการสรุปสำหรับผู้อ่านทั่วไป (ใช้กับทุกหมวดงาน)

- เขียนให้หัวหน้าหรือคนที่ไม่ได้ลงมือทำงานชิ้นนั้นอ่านแล้วเข้าใจว่า **ทำงานอะไร เพื่อให้ได้ผลอะไร และส่งมอบอะไร** โดยไม่ต้องเปิดไฟล์ต้นทางหรือถามความหมายของศัพท์
- ใช้ภาษากระชับและเป็นธรรมชาติ คงคำที่ทีมใช้จริงและคำทับศัพท์ที่เข้าใจตรงกันได้ เช่น `Test Case`, `prototype`, `spec`, `API`; อธิบายศัพท์เฉพาะที่จำเป็นครั้งแรก และไม่แปลเป็นคำไทยที่อ่านยากกว่าเดิม
- `รายละเอียดงานที่ทำ` มีประมาณ **3–5 bullet เป็นค่าเริ่มต้น** ปรับได้ตามขนาดและความซับซ้อนของ task; แต่ละ bullet รวมงานที่เกี่ยวกันและบอกผลลัพธ์ชัดเจน ไม่แตกเป็นรายการย่อยเพียงเพื่อเล่าทุกขั้นตอน
- สรุปเนื้อหาตามประเภทงานจริงได้ทุกหมวด ไม่จำกัดเฉพาะงานเอกสารหรือ UI เช่น งานพัฒนาให้บอกความสามารถที่เพิ่ม/ปัญหาที่แก้, งาน QA ให้บอกขอบเขตและผลการตรวจ, งานเอกสารให้บอกเนื้อหา/สิ่งส่งมอบ, งานวิเคราะห์หรือวางแผนให้บอกข้อสรุป/แผนที่ได้
- แยกให้ชัดระหว่าง **เตรียมแผนหรือ Test Case** กับ **ลงมือทดสอบจริง**, **เขียน/แก้โค้ด** กับ **ตรวจยืนยันผล**, และ **ข้อเสนอ** กับ **การเปลี่ยนแปลงที่ทำแล้ว**; ห้ามใช้ถ้อยคำที่ทำให้เข้าใจว่าทำหรือทดสอบแล้วหากยังไม่ได้ทำ
- ใส่จำนวนหรือรายละเอียดทางเทคนิคเฉพาะเมื่อช่วยให้เห็นขอบเขตหรือผลลัพธ์จริง ไม่ลิสต์จำนวนไฟล์ต้นทางที่อ่าน, selector, ชื่อฟังก์ชัน หรือขั้นตอนค้นคว้าโดยไม่จำเป็น
- หลีกเลี่ยงการพูดซ้ำระหว่าง `เป้าหมาย`, `ภาพรวม`, `ไฟล์ที่แก้ไข` และ `รายละเอียดงานที่ทำ`; ให้แต่ละส่วนเสริมข้อมูลกัน
- ห้ามแต่งเวลาแบ่งย่อยหรือระบุว่าเกินแผน หากไม่มีแผนที่ตกลงไว้หรือไม่มีข้อมูลเวลาจริงรองรับ; หากเวลาถูกบันทึกย้อนหลังหรือมีข้อจำกัดที่ทราบ ให้เรียกว่า **เวลาที่บันทึกในระบบ** และชี้แจงว่าไม่ใช่เวลาจับจริง

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
- **รายละเอียดงานที่ทำ** — bullet list ที่สรุปงานจริงและผลที่ได้ โดยปกติ 3–5 ข้อ รวมงานที่เกี่ยวข้องกัน; ถ้ามีงานเพิ่มนอกแผนและมีผลต่อขอบเขต ให้บอกเหตุและสิ่งที่ทำเพิ่มอย่างชัดเจน ไม่ต้องเล่ากระบวนการหรือแยกเวลาย่อย
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
เวลาทำงาน <D.D> ชม.

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

- <งานหลักที่ทำและผลลัพธ์ เช่น "ตรวจการใช้งาน Guest แล้วแยกส่วนที่ดูได้ฟรีกับส่วนที่ต้องเข้าสู่ระบบก่อน">
- <สิ่งส่งมอบหรือความสามารถที่ได้ เช่น "จัดทำ Test Case ครอบคลุมทั้งสองกลุ่ม พร้อม checklist สำหรับทดสอบบนมือถือจริง">
- <การตรวจยืนยันที่เป็นส่วนหนึ่งของ task เช่น "ตรวจว่ารายการใน checklist ตรงกับเล่ม Test Case">
- <งานเพิ่มเติมที่มีผลต่อขอบเขต (ถ้ามี) — สรุปเหตุและสิ่งที่ทำเพิ่มในบรรทัดเดียว>

ส่งต่อ (แสดงเฉพาะเมื่อ task done + สถานะความสมบูรณ์ "ครบแต่มี open items" — งานใน task นี้จบแล้ว แต่มีของที่จะเป็น task ใหม่)

- <สิ่งที่จะส่งต่อเป็น task ใหม่ 1>
- <สิ่งที่จะส่งต่อเป็น task ใหม่ 2>

#### Task B — <ชื่อ task> [in_progress]

เวลาเริ่ม <DD/MM/YYYY HH:MM>
ปัจจุบัน <DD/MM/YYYY HH:MM> (ยังจับเวลาอยู่)
เวลาที่ผ่านไป <D.D> ชม.

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

- <งานหลักที่ทำและผลลัพธ์>
- <สิ่งที่ส่งมอบหรือความคืบหน้าที่ได้>
- <การตรวจยืนยันที่ทำแล้ว (ถ้ามี)>

ค้าง/ติดตาม (แสดงเฉพาะเมื่อ task in_progress และมี open items — งานใน task นี้ยังไม่จบ จะทำต่อ)

- <สิ่งที่ยังค้างใน task นี้ 1>
```

### Final Work Summary Copy Block (สำหรับ task ที่ปิดแล้ว)

หลัง `move_task → done`, อ่าน Final Task + Activity Timeline และบันทึก Final Session Note สำเร็จแล้ว ต้องแสดง **Final Work Summary Copy Block** ทุกครั้ง โดยสร้างจาก canonical Final Summary ชุดเดียวกับ Final Session Note:

#### Mission Mapping Rule

ก่อนสร้าง Final Work Summary Copy Block ต้องตรวจ Mission/Task context ว่ามี mapping ที่บันทึกไว้จริงไปยัง Mission → Objective → Feature หรือไม่ ห้าม infer หรือสร้าง Objective/Feature เพื่อให้รูปแบบดูครบ

- **Objective/Feature labels ต้อง copy verbatim จาก approved mission baseline เท่านั้น** — อ้างจาก `get_mission` → รายการ Objectives/Features เป็นค่าถูกต้องขั้นสุดท้าย ห้าม paraphrase หรือตั้งชื่อใหม่ (เช่น baseline คือ "Password Recovery & Lock" ห้ามเขียน "Password Recovery & Self-Service" หรือ "Credential Security / Password Recovery")
- **ห้ามเชื่อ Objective/Feature label ใน task description โดยไม่เทียบ baseline** — task description อาจเขียน label คลาดตอนสร้าง task ได้; ต้องเทียบกับ mission ทุกครั้ง ถ้าไม่ตรงให้ใช้ชื่อจาก mission และแจ้งผู้ใช้พร้อมเสนอแก้ task description ให้ตรง

**Case A — Task มี Mission Mapping จริง:**

```text
เป้าหมาย <number>: <Objective Name>

Feature: <Feature Name>

Task: <TASK-CODE> <Task Name>

หมวดหมู่งาน: <Category>

เวลาเริ่ม: <DD/MM/YYYY HH:MM>
เวลาจบ: <DD/MM/YYYY HH:MM>
เวลาทำงาน: <Final Actual Time>

เป้าหมาย/ผลลัพธ์ที่คาดหวัง

<1 บรรทัด — task นี้ทำเพื่ออะไร ผลลัพธ์สุดท้ายที่ได้คืออะไร>

ภาพรวม

<สรุปงาน 1-2 บรรทัด>

ไฟล์ที่แก้ไข

- <พาธไฟล์> — <สรุปการเปลี่ยนแปลงสั้น ๆ>

รายละเอียดงานที่ทำ

- <งานสำคัญที่ทำจริง>
- <งานสำคัญที่ทำจริง>
- <งานสำคัญที่ทำจริง>
```

> section `ไฟล์ที่แก้ไข` แสดงไฟล์ที่สร้างหรือแก้เพื่อส่งมอบงานจริง เช่น โค้ด, spec, คู่มือ, Test Case, checklist หรือรายงาน; ไม่นับไฟล์ชั่วคราวหรือไฟล์ที่สร้างเพื่อบรรจุหลักฐานประกอบเท่านั้น เว้นแต่ไฟล์หลักฐานนั้นเป็นสิ่งส่งมอบที่ task กำหนด; ถ้าไม่มีไฟล์ให้ข้าม section นี้
> section `เป้าหมาย/ผลลัพธ์ที่คาดหวัง` และ `ภาพรวม` ต้องมีทุกครั้ง และเนื้อหาต้องตรงกับสรุปราย task block ของ task เดียวกัน

**Case B — Task ไม่มี Mission Mapping:**

ใช้กับ Pre-Mission, Standalone, Maintenance, Operational หรือ Task อื่นที่ไม่มี Mission → Objective → Feature mapping จริง:

```text
Task: <TASK-CODE> <Task Name>

หมวดหมู่งาน: <Category>

เวลาเริ่ม: <DD/MM/YYYY HH:MM>
เวลาจบ: <DD/MM/YYYY HH:MM>
เวลาทำงาน: <Final Actual Time>

เป้าหมาย/ผลลัพธ์ที่คาดหวัง

<1 บรรทัด — task นี้ทำเพื่ออะไร ผลลัพธ์สุดท้ายที่ได้คืออะไร>

ภาพรวม

<สรุปงาน 1-2 บรรทัด>

ไฟล์ที่แก้ไข

- <พาธไฟล์> — <สรุปการเปลี่ยนแปลงสั้น ๆ>

รายละเอียดงานที่ทำ

- <งานสำคัญที่ทำจริง>
- <งานสำคัญที่ทำจริง>
- <งานสำคัญที่ทำจริง>
```

**Case C — Task เกินเกณฑ์หมวด (Over-budget):**

เมื่อ `hours_spent` สูงกว่าค่าเป้าหมายของหมวด ให้ใช้ Case C เฉพาะเมื่อมีแผนเวลาที่ตกลงไว้และเวลาที่บันทึกสะท้อนเวลาทำงานจริงอย่างน่าเชื่อถือเท่านั้น ห้ามสรุปว่า "เกินแผน" จากค่าเป้าหมายหมวดเพียงอย่างเดียว และห้ามแบ่งชั่วโมงให้กิจกรรมย่อยโดยประมาณเพื่อให้ตัวเลขดูลงตัว:

```text
เป้าหมาย <number>: <Objective Name>   (แสดงเฉพาะเมื่อมี Mission Mapping จริง)

Feature: <Feature Name>

Task: <TASK-CODE> <Task Name>

หมวดหมู่งาน: <Category หลัก>

เวลาเริ่ม: <DD/MM/YYYY HH:MM>
เวลาจบ: <DD/MM/YYYY HH:MM>
เวลาทำงาน: <Final Actual Time> (แผน <Planned> ชม. — เกินเพราะ <เหตุผลที่มีข้อมูลรองรับ>)

เป้าหมาย/ผลลัพธ์ที่คาดหวัง

<1 บรรทัด — task นี้ทำเพื่ออะไร ผลลัพธ์สุดท้ายที่ได้คืออะไร>

ภาพรวม

<สรุปงาน 1-2 บรรทัด; กล่าวถึงเวลาเกินแผนเฉพาะเมื่อมีข้อมูลรองรับ>

ไฟล์ที่แก้ไข

- <พาธไฟล์> — <สรุปการเปลี่ยนแปลงสั้น ๆ>

รายละเอียดงานที่ทำ

- <งานหลักที่ทำและผลลัพธ์>
- <งานที่เพิ่มจากแผนพร้อมเหตุผลและผลที่เกิดขึ้น (ถ้ามี)>
- <ชี้แจงความต่างจากแผนโดยอ้างข้อมูลจริง; ไม่แบ่งเวลาย่อยหากไม่มีเวลาที่วัดแยกได้>
```

**กฎ Final Work Summary Copy Block:**
- หนึ่ง Task Summary ต้องอยู่ใน `text` code block เดียว เพื่อให้กด Copy แล้วนำไปวางใน Google Docs ได้ทันที
- ใช้ข้อความธรรมดาโดยไม่ใช้ Markdown heading (`#`, `##`, `###`), bold, inline code หรือ horizontal rule
- รายการทุกข้อใน Copy Block ต้องขึ้นต้นด้วย literal `- ` ภายใน `text` code block; ห้ามใช้ `*` หรือรูปแบบที่ UI render เป็น bullet symbol `•`
- Task ที่มี Mission Mapping จริงต้องแสดง Objective และ Feature ตาม mapping ที่บันทึกไว้ก่อน Task; Task ที่ไม่มี mapping ต้องเริ่มจาก Task โดยตรงและห้ามสร้าง Objective/Feature ขึ้นมาเอง
- โดยปกติใช้รายการเดียวภายใต้ `รายละเอียดงานที่ทำ`; แยก workstream เฉพาะเมื่อมีหลายส่วนที่แตกต่างกันจนการรวมทำให้สาระหรือผลลัพธ์ไม่ชัด
- `รายละเอียดงานที่ทำ` ใช้ 3–5 ข้อเป็นค่าเริ่มต้น ปรับตามเนื้องานจริงได้ แต่ไม่เพิ่มข้อเพื่อให้ครบจำนวน และไม่ย่อจนไม่เห็นว่างานทำอะไรสำเร็จ
- เลือกข้อมูลที่ช่วยให้หัวหน้าเข้าใจงานและผลลัพธ์: จำนวน/ขอบเขตที่สำคัญ, สาเหตุและผลกระทบของปัญหา, การตัดสินใจหรือมาตรการด้านความปลอดภัยเมื่อเกี่ยวข้อง — ไม่จำเป็นต้องใส่ทุกประเภทข้อมูลในทุก task
- ใช้ข้อมูลจาก canonical Final Summary / Final Session Note เท่านั้น ห้ามเพิ่มงานที่ไม่ได้ทำจริง
- Verification ที่เป็นส่วนหนึ่งของงาน task จริง (เช่น task ตรวจรับ/QA gate — "ตรวจ checklist ครบ 5 หมวด", "เทียบ baseline ยืนยัน deviation หาย") เขียนเป็น bullet ได้; แต่ห้ามเขียนกลไกการรันเครื่องมือ ("re-run verify script ผ่าน X/X", "render checklist card") — นั่นเป็น evidence/verification mechanics ตามข้อ 23
- หากสาระจาก Files Changed, Decisions, Problems/Resolutions, Scope Changes หรือ Verification สำคัญต่อความเข้าใจงาน ให้รวมไว้ในรายการ `รายละเอียดงานที่ทำ` โดยไม่สร้าง metadata section แยก
- ถ้าเวลาที่บันทึกสูงกว่าแผนที่ตกลงไว้จริง ให้ชี้แจงแผน เวลาที่บันทึก และเหตุผลที่มีข้อมูลรองรับ; แบ่งงานหรือเวลาเป็นช่วงย่อยได้เฉพาะเมื่อมี Activity Timeline หรือบันทึกร่วมสมัยรองรับ ห้ามประมาณสัดส่วนย้อนหลัง
- ใช้ business-facing Task Code; ห้ามแสดง Full/Partial Kanban UUID, internal Task ID หรือ Database ID
- Final Work Summary Copy Block แสดงเฉพาะ Objective/Feature เมื่อมี mapping จริง, Task Code + Task Name, Category, เวลาเริ่ม, เวลาจบ, Final time, เป้าหมาย/ผลลัพธ์ที่คาดหวัง, ภาพรวม, ไฟล์ส่งมอบที่สร้างหรือแก้จริง (แสดงเมื่อมี) และรายละเอียดงานที่ทำ — เนื้อหา `เป้าหมาย/ผลลัพธ์ที่คาดหวัง`, `ภาพรวม` และ `รายละเอียดงานที่ทำ` ต้องตรงกับสรุปราย task block ของ task เดียวกัน
- ไม่แสดง Time Source หรือ Raw Timer Metadata เป็น section แยกตามปกติ; หากทราบว่าเวลาถูกบันทึกย้อนหลัง/ด้วยมือหรือไม่ใช่เวลาจับจริง ให้ชี้แจงสั้น ๆ ติดกับบรรทัดเวลาเพื่อไม่ให้ผู้อ่านเข้าใจผิด
- Final time ต้องอ้างอิงค่าหลังปิด task จาก Kanban และห้ามปรับเองหรือเรียก `log_time` ระหว่าง workflow สรุป; หากทราบว่าค่านั้นถูกเติมย้อนหลัง/ตั้งต้นด้วยมือ หรือไม่ได้วัดเวลาทำงานจริง ห้ามเรียกว่า "เวลาทำงานจริง" ให้ระบุเป็น "เวลาที่บันทึกในระบบ" พร้อมข้อจำกัด
- เนื้อหาสำคัญทั้งหมดต้องอยู่ใน Copy Block เดียว; ข้อความนอก Block มีได้เพียงคำอธิบายสั้น ๆ และห้ามแยกส่วนของ Summary ออกไปไว้ภายนอก
- กฎการลดข้อมูลนี้ใช้เฉพาะ Work Log Copy Block; canonical Final Summary / Final Session Note ต้องเก็บรายละเอียดเต็มตามเดิม

**สำหรับ task `in_progress` (ยังไม่ปิด) — กรณีปกติ:**

```text
Task: <ชื่อ task>
Task ID: <task_id>
สถานะ: in_progress (ยังจับเวลาอยู่)
เวลาเริ่ม: <DD/MM/YYYY HH:MM>
ปัจจุบัน: <DD/MM/YYYY HH:MM>
เวลาที่ผ่านไป: <D.D> ชม.
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
เวลาที่ผ่านไป: <D.D> ชม.
หมวดหมู่งาน: <Category หลัก>
สถานะความสมบูรณ์: <ครบตามแผน | ครบแต่มี open items | ทำบางส่วน (จะทำต่อ session ใหม่)>

เป้าหมาย/ผลลัพธ์ที่คาดหวัง:
<1 บรรทัด>

ภาพรวม:
<สรุปงาน 1-2 บรรทัด; ระบุเรื่องเวลาเกินแผนเฉพาะเมื่อมีแผนและข้อมูลเวลาจริงรองรับ>

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
> - เมื่อแสดง "สรุปราย task" block พร้อมกับ Final Work Summary Copy Block ในผลลัพธ์เดียวกัน เนื้อหา "เป้าหมาย/ผลลัพธ์ที่คาดหวัง", "ภาพรวม" และ "รายละเอียดงานที่ทำ" ของทั้งสอง block ต้องเป็นชุดเดียวกัน — ต่างกันได้เฉพาะ header/metadata ตาม template ของแต่ละโหมด ห้ามเขียนเนื้องานหรือเวลาแบ่งย่อยไม่ตรงกัน

### กฎการเขียนสรุป

1. **ใช้ภาษาที่คนทั่วไปอ่านเข้าใจง่าย** — เน้นภาพรวม หลีกเลี่ยงคำศัพท์เทคนิคและโค้ด ใช้ภาษาที่อธิบายผลลัพธ์ที่ผู้ใช้เห็น/ได้ ไม่ใช่ภาษาที่อธิบายวิธีทำในระดับโค้ด — แต่ domain term ที่ใช้ประจำใน project และเป็นภาษาที่ dev ไทยพูดกันปกติ (เช่น contract, session, audit, sidebar, flow, module, requirement, task) **คงภาษาอังกฤษไว้** ห้ามแปลตรงเป็นคำที่อ่านยากกว่า เช่น ห้ามเขียน "สัญญา" แทน "contract" — กฎข้อนี้หมายถึงห้ามใช้ code symbol ไม่ใช่บังคับแปลศัพท์ทุกคำ
   - **คำศัพท์ต้องตรงกับที่ใช้ตอนทำงานและพูดคุยกันจริง** — ห้ามเปลี่ยนคำเรียกตอนสรุป เช่น ตอนทำงานทั้ง session เรียก "label" ก็ต้องเขียน "label" ในสรุป ห้ามสลับเป็น "ป้าย" เพราะคนอ่านจะงงว่าพูดถึงอะไร; ใช้คำเดียวกันกับที่ผู้ใช้และเอกสารเรียกตลอดงานนั้น
   - **ห้ามแต่งคำแปลใหม่ของคำอังกฤษที่ใช้อยู่แล้ว** — เช่น ห้ามเขียน "checklist ตรวจมือ" แทน "manual review checklist" (ชื่อไฟล์/ชื่อ task ใช้คำอังกฤษเดิม) ห้ามเขียน "ตรวจจอ" แทน "ตรวจหน้าจอ prototype" — ถ้าคำอังกฤษคือสิ่งที่ใช้จริงในงาน (ชื่อไฟล์, ชื่อ task, คำที่คุยกัน) ให้ใช้คำนั้นตรง ๆ
   - **ระบุขอบเขตให้พอดีกับประเภทงาน** — งาน UI/ระบบให้ระบุหน้าหรือส่วนที่เกี่ยวข้องเมื่อช่วยให้เห็นภาพ; งานเอกสารให้บอกชนิดและหัวข้อของเอกสาร; งานวิเคราะห์/วางแผนให้บอกเรื่องและข้อสรุป ไม่จำเป็นต้องใส่ชื่อไฟล์หรือหน้าจอทุก bullet
   - ใช้ภาษาคนทำงานพูดคุยกันปกติ ไม่ใช่ภาษาทางการ/ภาษาเอกสารราชการ
2. **เน้นสิ่งที่ทำและผลลัพธ์** — ไม่ต้องอธิบายวิธีทำละเอียด
3. **ห้ามใช้ชื่อฟังก์ชัน ชื่อ class CSS ชื่อตัวแปร ชื่อ event ชื่อ method หรือโค้ดในสรุป** — เช่น ห้ามเขียน `closeRowMenus()`, `shouldFixRowMenu()`, `visibility:hidden`, `position:fixed`, `requestAnimationFrame`, `capture phase`, `toggle event`, `#table overflow-x: auto` ให้แปลงเป็นภาษาที่อธิบายผลลัพธ์แทน เช่น "ปิดเมนูที่เปิดอยู่", "วางเมนูตายตัวตามหน้าจอ", "ซ่อนเมนูชั่วคราวจนวางตำแหน่งเสร็จ" — ถ้าจำเป็นต้องอ้างถึงส่วนประกอบของระบบ ใช้คำทั่วไป เช่น "ตารางที่เลื่อนได้" แทน "#table overflow-x: auto", "ปุ่ม ..." แทน "row-menu summary", "เมนู ..." แทน "row-menu-list"
4. **ภาพรวมแต่ละ task ควรยาว 50-250 ตัวอักษร** — สรุปในระดับ "ทำอะไรกับระบบอะไร"
5. **แต่ละ bullet คือ 1 งานหลักหรือกลุ่มงานที่เกี่ยวข้องกัน** เขียนกระชับ 1 บรรทัด โดยบอกสิ่งที่ทำและผลที่ได้ — ถ้าหลายขั้นเป็นส่วนเดียวกันของงาน ให้รวมเป็น bullet เดียวแทนการเล่าทีละขั้น
6. **ถ้ามีหลายงานที่เกี่ยวเนื่องกัน** สามารถรวมเป็น bullet เดียวโดยใช้ `;` คั่นภายในบรรทัดเดียวกันได้
7. **ส่วน "สรุปราย task" ต้องหุ้มด้วย code block** (` ``` `) — เพื่อให้ผู้ใช้ copy ไปวางที่อื่นได้โดย bullet list (`-`) ไม่หาย ส่วน "สรุปรวม" แสดงเป็น markdown ปกติได้
8. **ทุก Human-readable Copy Block ใช้ plain text** — ไม่ใช้ `**bold**`, `*italic*`, Markdown heading หรือ syntax อื่นที่ UI อาจ render ก่อน Copy; Final Work Summary Copy Block ต้องใช้ `text` code block ตาม template เฉพาะ
9. **ทุก task block ต้องแสดง "เวลาเริ่ม" + "เวลาจบ/ปัจจุบัน" + "เวลาทำงาน/เวลาที่ผ่านไป"** เป็นบรรทัดเด่น โดยใช้ Activity timeline และ `hours_spent` ตามสถานะ — รวมถึง Final Work Summary Copy Block ที่ต้องแสดง "เวลาเริ่ม" + "เวลาจบ" + "เวลาทำงาน" จากค่า Final หลังปิด task ด้วย
10. **task ที่ยัง `in_progress`** ให้ระบุ "ปัจจุบัน: <now>" แทน "เวลาจบ" และใช้ "เวลาที่ผ่านไป" แทน "เวลาทำงาน" พร้อมระบุ "(ยังจับเวลาอยู่)" เพื่อให้ผู้ใช้ทราบว่าชั่วโมงอาจยังไม่รวมเวลาที่กำลังจับอยู่
11. **รูปแบบเวลา: `D.D ชม.` (ทศนิยม 1 ตำแหน่งเท่านั้น)** — เช่น `1.6 ชม.`, `0.7 ชม.` ทุกที่ที่แสดงเวลา (ราย task, รวม, copy block) ยกเว้น `hours_spent` ดิบจาก kanban ที่ยังเป็นทศนิยม — ปัดเป็น `D.D ชม.` เฉพาะตอนแสดงผล
12. **ห้ามบวก/ลด/ปรับชั่วโมงเอง — ไม่มี floor ขั้นต่ำ** — ใช้ค่า `hours_spent` จากระบบเป็นค่าจริง ห้ามเรียก `log_time`; ถ้าค่าต่ำแปลว่างานทำเร็วจริง ใช้ค่านั้นเลย ห้ามปรับขึ้นเพื่อให้ "ดูสมเหตุ"; ถ้าค่าผิดปกติให้รายงานและแยก correction workflow ออกจากการปิด task
13. **ทุก task block ต้องแสดง "หมวดหมู่งาน"** — เลือกจากรายการ 9 หมวดในหัวข้อ "หมวดหมู่งาน" เพียง **1 หมวด** ต่อ 1 task ห้ามระบุหลายหมวดคั่นด้วย `,`
14. **"งานที่ทำเพิ่มนอกแผน" รวมไว้ใน bullet list "รายละเอียดงานที่ทำ" ไม่ต้องแยก subsection** — ถ้ามีงานที่ทำเพิ่มระหว่างทำ task แต่ไม่ได้อยู่ในแผน/task description เดิม ให้เขียนเป็น bullet ใน subsection "รายละเอียดงานที่ทำ" เลย ไม่ต้องสร้าง subsection "งานที่ทำเพิ่มนอกแผน" แยกต่างหาก จุดประสงค์คือให้สรุปได้ครบว่าชั่วโมงของ task นั้นถูกใช้ทำอะไรบ้าง ทั้งที่วางแผนไว้และที่ตามมาจากการแก้กระทบ แต่ละ bullet ของงานนอกแผนรวมเหตุและทางแก้ในบรรทัดเดียว ใช้ `→` คั่นระหว่างเหตุและทางแก้ เช่น `- อัปเดท cross-reference 4 ไฟล์ (เพราะ grep เจอ reference ค้าง) → เปลี่ยนชี้ไป Asset Management`
15. **เขียน bullet กระชับ ตรงประเด็น อ่านเข้าใจง่าย** — แต่ละ bullet ต้องสรุปในสิ่งที่ทำจริง ไม่ใส่รายชื่อไฟล์/endpoint/field ที่เป็นรายละเอียดย่อย เพราะจะทำให้ log ดูรก ให้เขียนเป็นภาพรวมที่ทำงานจริง เช่น แทน `- อัปเดท cross-reference ใน 13 ไฟล์ (README_MODULE_INDEX, BO_MASTER_BASELINE, ...)` ให้เขียน `- อัปเดท cross-reference ในเอกสาร BO และ PRD 13 ไฟล์` จุดประสงค์คือให้คนอ่านย้อนหลังหรือคนตรวจงานอ่านแล้วเข้าใจทันทีว่าทำอะไร โดยไม่ต้องฝักฝ่ายรายละเอียดเทคนิค — รายชื่อไฟล์ที่ถูกแก้ให้แสดงใน subsection "ไฟล์ที่แก้ไข" แทน
16. **อนุญาตให้ใส่ตัวเลขปริมาณใน bullet ได้** — แม้ห้ามใส่รายชื่อไฟล์ใน bullet รายละเอียดงาน แต่ใส่ตัวเลขปริมาณระดับภาพรวมได้ เช่น "แก้ 3 หน้าจอ", "เพิ่ม 4 API", "อัปเดทเอกสาร 13 ไฟล์", "แก้บั๊ก 5 จุด" เพื่อให้ AI/คนตรวจประเมินสัดส่วนเวลา vs ปริมาณงานได้ ตัวเลขนี้เป็นปริมาณรวม ไม่ใช่การระบุชื่อไฟล์ทีละตัว
17. **Progress/Report-only task block ต้องมีบรรทัด "สถานะความสมบูรณ์"** — task `done` เลือก `ครบตามแผน` / `ครบแต่มี open items`; task `in_progress` ใช้ `ทำบางส่วน (จะทำต่อ session ใหม่)` เมื่อยังทำไม่เสร็จ ค่า `ครบแต่มี open items` หมายถึง **งานใน task นี้จบแล้ว** แต่มีงานใหม่ที่จะ **ส่งต่อเป็น task ใหม่** ไม่ใช่งานเดิมที่ยังไม่จบ; Final Work Summary Copy Block ไม่แสดงฟิลด์นี้
18. **ทุก task block ต้องมี section "เป้าหมาย/ผลลัพธ์ที่คาดหวัง"** — 1 บรรทัด บอกว่า task นี้ตอบโจทย์อะไร หรือผลลัพธ์สุดท้ายที่ได้คืออะไร (เน้น "ทำเพื่ออะไร" ไม่ใช่ "ทำอะไร") — รวมถึง Final Work Summary Copy Block ด้วย โดยเนื้อหาต้องตรงกับสรุปราย task block ของ task เดียวกัน
19. **subsection ของตกค้างแสดงเฉพาะเมื่อมี open items** — ชื่อ subsection ขึ้นกับสถานะ task:
    - task `in_progress` → ใช้ชื่อ "ค้าง/ติดตาม" (งานใน task นี้ยังไม่จบ จะทำต่อ)
    - task `done` + สถานะความสมบูรณ์ `ครบแต่มี open items` → ใช้ชื่อ "ส่งต่อ" (งานใน task นี้จบแล้ว แต่มีของที่จะเป็น task ใหม่)
    - task `done` + สถานะความสมบูรณ์ `ครบตามแผน` → ไม่แสดง subsection นี้

    การแยกชื่อทำให้ AI/คนตรวจเข้าใจชัด: "ค้าง/ติดตาม" = task ยังไม่จบ, "ส่งต่อ" = task จบแล้วแต่มีงานใหม่ตามมา ไม่ใช่ของ task เดิม ถ้าไม่มี open items ไม่ต้องแสดง subsection นี้

20. **subsection "ไฟล์ที่แก้ไข" แสดงเมื่อ task สร้างหรือแก้ไฟล์เพื่อส่งมอบงานจริง** — ใช้ทั้งใน Progress/Report-only Summary และ Final Work Summary Copy Block; ครอบคลุมไฟล์ทุกประเภทตามเนื้องาน เช่น โค้ด, spec, คู่มือ, Test Case, checklist หรือรายงาน; ไม่นับไฟล์ชั่วคราวหรือไฟล์ที่สร้างเพื่อบรรจุหลักฐานประกอบเท่านั้น เว้นแต่ไฟล์นั้นเป็นสิ่งส่งมอบที่ task กำหนด

21. **bullet ที่เล่าปัญหา/decision/gap ต้องระบุเนื้อหา ห้ามเล่าแค่กระบวนการ** — ถ้างานมีการพบปัญหา แจ้งผู้ใช้ หรือตัดสินใจอะไร bullet ต้องบอก "ปัญหาคืออะไร + ตัดสินใจ/แก้อย่างไร" ในตัวเอง ห้ามเขียนแค่ขั้นตอน เช่น ห้าม `- พบ gap 3 จุด → รายงานผู้ใช้เพื่อตัดสินใจ` (คนอ่านไม่รู้ว่า gap คืออะไร ต้องถามกลับ) ให้เขียน `- พบ gap: ระบบไม่บังคับเลือกเหตุผลก่อนยืนยัน (dropdown เติมตัวแรกให้เสมอ) → เพิ่มตัวเลือกว่าง + บังคับเลือกก่อนยืนยัน` — หลัก: แต่ละ bullet ต้องตอบ "เจออะไร/ทำอะไร/ตัดสินใจอะไร" ได้ในตัวเอง ถ้า bullet มีแต่กระบวนการ (เช่น "รายงานผู้ใช้แล้ว", "ตรวจสอบแล้ว") ให้เติมเนื้อหาสาระลงไปเสมอ

22. **อ้าง requirement/spec/entity ด้วยชื่อที่คนอ่านเข้าใจ ไม่ใช่ ID ล้วน** — summary ที่ก๊อปไปลงระบบอื่นต้องอ่านรู้เรื่องโดยไม่ต้องเปิด kanban; ห้ามเขียน `requirement bf08de1f` หรือ `mission 18598f33` ลอย ๆ ให้ใช้ชื่อ เช่น `requirement "BO Admin Identity Lifecycle — Invitation, My Account และ Password Security"` หรือชื่อย่อที่ระบุตัวตนได้ — internal ID (kanban UUID, requirement id, mission id) เก็บไว้ใน session note/traceability เท่านั้น; Task Code แบบ business-facing (เช่น AIL-019) ยังใช้ได้ตามเดิมเพราะเป็นชื่อที่ทีมใช้เรียกกัน

23. **"รายละเอียดงานที่ทำ" ต้องเป็นงานของ task เท่านั้น ห้ามใส่เรื่อง workflow/evidence mechanics** — bullet ทุกข้อต้องตอบได้ว่า "งานชิ้นนี้ทำให้ task บรรลุเป้าหมายอย่างไร" เหตุการณ์ต่อไปนี้ไม่ใช่ผลงานของ task เว้นแต่เป็นสิ่งส่งมอบที่ task กำหนด:
    - workflow mechanics: timer quirk, ค่า default ตอนสร้าง task, การย้าย column, การบันทึก note, การ commit/push
    - evidence packaging: การแพ็กภาพหรือ log ประกอบการส่งตรวจ เช่น checklist card, ภาพ capture หรือ render preview — path หลักฐานอยู่ในส่วน Evidence ของ session note เท่านั้น; แต่เอกสาร Test Case, checklist สำหรับผู้ทดสอบ, รายงาน QA หรือคู่มือที่เป็น deliverable หลักของ task ต้องสรุปเป็นผลงานได้
    - verification mechanics ที่ไม่ใช่ขอบเขตการตรวจของ task เอง: เช่น "re-run verify script ผ่าน 12/12 ไม่มี error" — ผล verify อยู่ในส่วน Verification ของ session note; ถ้า task เป็นงานตรวจ/review อยู่แล้ว (เช่น QA gate task) ให้เขียนเป็นงานที่ตรวจจริง เช่น "ตรวจ manual review checklist ครบ 5 หมวด A–E ผ่านทั้งหมด" ไม่ใช่เล่ากลไกการรัน script ซ้ำ
    ถ้าเรื่อง workflow สำคัญต่อผู้ใช้ให้แจ้งแยกนอก copy block (เช่น หมายเหตุเวลา)

24. **ห้ามแปลตรงคำเทคนิค/ศัพท์ CSS-JS เป็นคำไทยที่ไม่มีใครใช้จริง — ให้บรรยาย "ผลที่ผู้อ่านเห็นบนหน้าจอ" แทน** — การแปลตรงเช่น "ห่อตัว" (wrap), "สแตก" (stack), "ยุบ" (collapse), "เลย์เอาต์แตก" ทำให้คนอ่านนึกภาพไม่ออก หลักคืออธิบายว่า "ผู้ใช้เห็นอะไรผิดปกติ" แล้วค่อยบอกทางแก้ เช่น
    - ผิด: `แก้ค่าอีเมลห่อตัวอ่านยาก` → ถูก: `แก้ปัญหาอีเมลยาวจนตกเป็นหลายบรรทัด`
    - ผิด: `stack ปุ่มเป็น column บน mobile` → ถูก: `เรียงปุ่มลงมาแนวตั้งเต็มความกว้างบนมือถือ`
    - ผิด: `label ถูก grid แยก` → ถูก: `ชื่อช่องกรอกกับเครื่องหมาย * ถูกแยกคนละบรรทัด`
    - ผิด: `input.select() ทำให้ highlight` → ถูก: `ข้อความเดิมถูกเลือกเป็นแถบสีน้ำเงินตอนเปิดหน้าต่าง`
    ถ้าไม่แน่ใจว่าคำไหนเป็นการแปลตรง ให้ทดสอบด้วยคำถาม "คนที่ไม่รู้โค้ดอ่านแล้วเห็นภาพหน้าจอไหม" — ถ้าไม่เห็นภาพ ให้เขียนบรรยายผลที่ตาเห็นแทน

25. **bullet เขียนแบบ "สรุปผล" ไม่เล่ากระบวนการ — แต่ต้องเล่ารายละเอียดเมื่อเป็นงานแก้บั๊ก/เทส** — bullet ของ "รายละเอียดงานที่ทำ" คือสรุปสั้นกระชับว่าทำอะไรเสร็จ ไม่ใช่เล่าเหตุการณ์หรือลำดับการตัดสินใจ
    - ผิด: `- เสนอผู้ใช้เลือก target พร้อมเหตุผล → ผู้ใช้เลือก Content Management` → ถูก: `- วิเคราะห์ deviation ทุกเมนู → เลือก Content Management เป็น target ของ Mission 4`
    - ผิด: `- ผู้ใช้เลือกแยกงาน normalize เป็น 2 task → ปรับแผนเป็น 5 task` → ถูก: `- แยกงาน normalize เป็น 2 task (Articles+Editor กับ Categories+Reported Board)`
    - ห้ามใส่ตัวเลขเวลาแผน/น้ำหนักใน bullet (เช่น "รวม 2.6 ชม.", "0.40 ชม.", "Weight 31%") — เวลาจริงแสดงแล้วในบรรทัดเวลาทำงาน
    - ห้ามเอ่ยชื่อเครื่องมือภายใน เช่น Kanban, Jira — copy block ลงระบบอื่น คนอ่านไม่รู้จักเครื่องมือ เขียน "สร้าง Mission 4 พร้อม task ลงมือ 5 ตัว" ไม่ใช่ "สร้าง ... ใน Kanban"
    - **เมื่อพบปัญหา/บั๊ก/ผลทดสอบไม่ผ่าน ให้บอกสาระที่จำเป็น:** ระบุปัญหาและผลกระทบ พร้อมสาเหตุหรือวิธีแก้เมื่อเป็นข้อมูลสำคัญต่อความเข้าใจ; ไม่จำเป็นต้องใส่รายละเอียดภายในที่ไม่ช่วยให้หัวหน้าเข้าใจผลของงาน

26. **ถ้าสิ่งที่พูดถึงมีชื่อ label จริงบนหน้าจอ ให้ใช้ชื่อนั้นตรง ๆ** — อย่าบรรยายเองเป็นคำไทยลอย ๆ ที่ไม่มีบนจอ เพราะคนอ่านเปิดหน้าจอเทียบไม่ได้ ให้ใช้ชื่อหน้า/เมนู/ปุ่ม/ส่วนของจอ/label ตามที่แสดงจริง (ใส่เครื่องหมายคำพูดได้) แล้วค่อยบรรยายหน้าที่สั้น ๆ ตามหลัง เช่น
    - ผิด: `กล่องจำลองสถานการณ์` → ถูก: `dropdown "Test flow" / "Prototype scenario" ที่ไว้เลือกจำลองผลลัพธ์ตอนเทส`
    - ผิด: `ประวัติการแก้ไขของบทความ` → ถูก: `ส่วน Change History ในหน้ารายละเอียดบทความ`
    - ผิด: `ข้อความหมายเหตุค่าเริ่มต้นรั่วเข้าประวัติ` → ถูก: `ช่องหมายเหตุในหน้าต่างยืนยันรายงานมีข้อความอังกฤษเติมมาให้ ถ้าผู้ใช้ไม่ลบออกจะถูกบันทึกลง Change History ตามไปด้วย`
    - ตัวอย่างการใช้ชื่อจริง: `หน้ารายการ Articles`, `หน้าต่าง Preview บทความ`, `ปุ่ม "Preview as FO"`, `ข้อความตอนไม่มีข้อมูล "No content blocks"` — อ่านแล้วเห็นภาพและเทียบหน้าจอได้ทันที

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
2. **เมื่อย้าย task ออกจาก `in_progress`** → บันทึกเวลาที่ใช้ไปเข้า `hours_spent` อัตโนมัติ (system minimum 0.1h — ใช้ค่าจริงที่ระบบ bank เลย ไม่มี floor ขั้นต่ำ)
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
6. **ทำงานนอก task ที่กำลังจับเวลา = ชั่วโมงไม่ถูกนับ** — ถ้าต้องทำงานที่ยังไม่มี task รองรับ (เช่น งานด่วนนอกแผน งาน ad-hoc ที่ผู้ใช้สั่งกลาง session) ให้สร้าง task ด้วย `create_task` ก่อนเริ่ม แล้วย้ายเข้า `in_progress` — ชั่วโมงที่ไม่ได้จับจะไม่ถูก bank และไม่ปรากฏในชั่วโมงสะสมที่ใช้ประเมินผลงาน
7. **Mid-task checkpoint ที่ ~1.2× Planned (บังคับ)** — ระหว่างทำงานให้เทียบเวลาที่ผ่านไปกับ `Planned` ใน task Description; ถ้าเวลาใกล้หรือเกิน ~1.2× Planned แต่งานยังไม่จบ ให้แจ้งผู้ใช้และทบทวน scope, dependency หรือแผนการทำงานร่วมกัน — ห้ามแต่งเวลาแบ่งย่อยหรือสร้าง/แยก task โดยไม่ได้รับอนุญาต

> **หมายเหตุ:** ระบบตัวจับเวลาอัตโนมัตินี้ทำงานร่วมกับ `get_time_summary` ที่ใช้ดึงชั่วโมงรวมเพื่อสรุปงาน — ทำให้ได้เวลาที่แม่นยำและสอดคล้องกับงานที่ทำจริง

---

## ตัวอย่างผลลัพธ์

```
## สรุปงานวันที่ 2026-08-14

### สรุปรวม

**ภาพรวม:**
> วันนี้พัฒนาระบบจัดการโครงสร้างองค์กร (Organization Management) ทั้งด้านหลังบ้านและ API พร้อมทดสอบจริง

**ชั่วโมงทำงานรวม:** 4.0 ชม.

**รายการ task ที่นำมารวม:**
- เพิ่ม API จัดการแผนก/ตำแหน่ง (hours_spent: 2.5 — done)
- แก้บั๊กอัปเดตข้อมูลตำแหน่ง (hours_spent: 1.0 — in_progress)
- ทดสอบ endpoints ใหม่ (hours_spent: 0.5 — done)
- รวม: 4.0 ชม.
```

---

### สรุปราย task

```
#### เพิ่ม API จัดการแผนก/ตำแหน่ง [done]

เวลาเริ่ม 14/08/2026 09:00
เวลาจบ 14/08/2026 11:30
เวลาทำงาน 2.5 ชม.

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
เวลาที่ผ่านไป 1.0 ชม.

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
เวลาทำงาน 0.5 ชม.

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

เวลาเริ่ม: 14/08/2026 09:00
เวลาจบ: 14/08/2026 11:30
เวลาทำงาน: 2.5 ชม.

เป้าหมาย/ผลลัพธ์ที่คาดหวัง

ให้ผู้ดูแลระบบจัดการข้อมูลแผนก/ตำแหน่งได้จากหน้าเดียว พร้อมรองรับการจัดลำดับใหม่

ภาพรวม

พัฒนา API สำหรับจัดการข้อมูลแผนกและตำแหน่งในระบบตั้งค่า รองรับการดึงข้อมูลและจัดลำดับใหม่

ไฟล์ที่แก้ไข

- src/api/department-endpoints.ts — เพิ่ม endpoint ดึงข้อมูลแผนก/ตำแหน่งและบันทึกลำดับใหม่
- src/api/position-endpoints.ts — เพิ่มข้อมูลลำดับในผลลัพธ์
- src/seed/organization-seed.json — เพิ่มข้อมูลลำดับในทุก record

รายละเอียดงานที่ทำ

- เพิ่ม API ดึงข้อมูลแผนก/ตำแหน่ง 2 endpoint และ API บันทึกลำดับใหม่ 1 endpoint
- เพิ่มข้อมูลลำดับในผลลัพธ์และข้อมูลตั้งต้นให้ใช้โครงสร้างเดียวกัน
- เพิ่มการตรวจสอบไม่ให้ข้อมูลลำดับซ้ำกัน
- อัปเดต API documentation ให้ครอบคลุมข้อมูลลำดับใหม่ทั้ง 2 endpoint
- ทดสอบ API ใหม่ครบทุก endpoint และผลผ่านตาม Acceptance Criteria
- ตรวจความสอดคล้องของผลลัพธ์ API, validation และข้อมูลตั้งต้นแล้ว
```

ตัวอย่าง Final Work Summary Copy Block เมื่อมีแผนและเวลาที่เชื่อถือได้สูงกว่าแผน:

```text
เป้าหมาย 2: Admin Self-Service

Feature: My Account

Task: AIL-020 My Account page + entry + edit Name

หมวดหมู่งาน: Feature

เวลาเริ่ม: 20/08/2026 09:00
เวลาจบ: 20/08/2026 13:20
เวลาทำงาน: 4.3 ชม. (แผน 2.0 ชม. — เกินเพราะปรับหน้าจอตามผลรีวิวรับรองหลายรอบ)

เป้าหมาย/ผลลัพธ์ที่คาดหวัง

ให้แอดมินดูข้อมูลบัญชีตัวเองและแก้ไขชื่อได้จากหน้า My Account

ภาพรวม

สร้างหน้า My Account ครบ flow แสดงและแก้ชื่อ พร้อมปรับหน้าจอตามผลรีวิว UI/UX หลายรอบจนผ่านเกณฑ์รับรอง

รายละเอียดงานที่ทำ

- สร้างหน้า My Account ให้ผู้ใช้ดูข้อมูลบัญชีและแก้ไขชื่อได้
- เพิ่มการบันทึกชื่อพร้อมประวัติการเปลี่ยนแปลง และป้องกันการแก้ไขบัญชีของผู้อื่น
- ปรับรูปแบบหน้าและหน้าต่างแก้ไขตามผลรีวิว รวมถึงการแสดงผลบนมือถือและแท็บเล็ต
- แก้ปัญหาเครื่องหมายจำเป็นและส่วนหัวว่างแสดงผิดรูปแบบ พร้อมตรวจผลตามขอบเขตที่กำหนด
```

```text
Task: แก้บั๊กอัปเดตข้อมูลตำแหน่ง
Task ID: TK-102
สถานะ: in_progress (ยังจับเวลาอยู่)
เวลาเริ่ม: 14/08/2026 13:00
ปัจจุบัน: 14/08/2026 14:00
เวลาที่ผ่านไป: 1.0 ชม.
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
- [ ] ตรวจว่า task มีบรรทัด `Category | Planned | Category Max` ใน Description — ถ้าสร้าง task ใหม่ต้องใส่เสมอทุกหมวด; ถ้า task เดิมไม่มี Planned ให้แจ้งผู้ใช้และเติมผ่าน `update_task` ก่อนเริ่มจับเวลา
- [ ] ตรวจว่า task map กับ Mission/Objective ใน approved plan แล้ว (รู้หมายเลข `mission-<N>-objective-<M>` สำหรับโฟลเดอร์หลักฐาน) — ถ้ายังไม่ map ให้ยืนยัน mapping กับผู้ใช้ก่อนเริ่มจับเวลา; task ที่ไม่มี mission (standalone) ใช้ `task-<TASK-CODE>` เป็นโฟลเดอร์หลักฐานแทน และยังต้อง capture/bundle หลักฐานตามปกติ
- [ ] ถ้า task มีผลลัพธ์ที่เห็นบนหน้าจอ (UI/prototype/logic/data ที่สะท้อนบนจอ) → capture ภาพ Before (Desktop 1440 + Mobile 390) ลง `screenshots/mission-<N>-objective-<M>/before/` ก่อนแก้โค้ด
- [ ] เรียก `get_board` เพื่อตรวจสอบ task อื่นที่อยู่ใน `in_progress`
- [ ] ถ้ามี task อื่นใน `in_progress` → ถามผู้ใช้ว่าจะ pause task เดิมหรือทำต่อ
- [ ] ถ้าผู้ใช้เลือก pause → ย้าย task เดิมออกจาก `in_progress` ก่อน
- [ ] ย้าย task ใหม่เข้า `in_progress` ผ่าน `move_task`
- [ ] แจ้งผู้ใช้ว่า "เริ่มจับเวลา task <ชื่อ> แล้ว"

### สถานการณ์ที่ 2: ทำ task เสร็จ
- [ ] เรียก `get_board` เพื่อตรวจสอบ task ที่อยู่ใน `in_progress`
- [ ] Verify งานตาม Acceptance Criteria / test / QA ที่เกี่ยวข้อง
- [ ] ถ้า task เปลี่ยนสิ่งที่เห็นบนหน้าจอ (UI/prototype/logic/data ที่สะท้อนบนจอ) → capture ภาพ Before (1440 + 390) ก่อนแก้โค้ด และส่ง Manual Review Checklist ให้ผู้ใช้ก่อน (เคสครบทุกพฤติกรรมใน scope + ข้อมูลทดสอบที่กรอก/เลือกจริง + ขั้นกด + ผลที่คาดต่อเคส รวม happy/blocked/edge/regression)
- [ ] สำหรับ task ที่แก้ไฟล์ ได้รับคำยืนยันว่าผู้ใช้ยอมรับผลลัพธ์และอนุญาตให้ปิดแล้ว
- [ ] ย้าย task เข้า `done` ผ่าน `move_task` ก่อนสร้าง Final Work Summary (ระบบ auto-stop timer และ bank เวลาจริง)
- [ ] เรียก `get_task` หลังปิด เพื่ออ่าน Final Status + Activity Timeline + Actual Start + Actual End + Final `hours_spent`
- [ ] **ไม่มี floor correction** — ใช้ Final `hours_spent` จากระบบตามจริง แม้จะต่ำกว่า 0.3 ชม. ก็ใช้ค่านั้น ห้ามปรับขึ้นเอง
- [ ] สร้าง canonical Final Summary จากข้อมูลหลังปิด โดยมี Final Result, Work Completed, Decisions, Verification/Test Result, Actual Start/End, Final Actual Time, Issues/Fixes, Scope Changes, Open Items และ Next Step
- [ ] รวม Task Evidence Bundle: checklist ผลตรวจรายเคส (ถ้ามี) + ภาพ Before/After / test list + raw output + ภาพ HTML report หรือภาพ/screencast UI + triage note เคส skipped / ไฟล์+commit ที่แก้ — ตั้งชื่อไฟล์ trace ถึง task code และระบุ path ใน Final Session Note (หลักฐานขาด → บันทึก evidence gap ห้ามสร้างย้อนหลัง)
- [ ] เรียก `save_session_note` ด้วย Final Summary ชุดเดียวกันเพื่อเก็บ Persistent Task History
- [ ] ก่อนสร้าง Final Work Summary Copy Block ตรวจ Mission Mapping ที่บันทึกไว้จริง: ถ้ามีให้แสดง Objective → Feature → Task; ถ้าไม่มีให้เริ่มจาก Task และห้ามสร้าง Objective/Feature ขึ้นมาเอง
- [ ] ตรวจว่า Objective/Feature labels ใน Copy Block เป็น verbatim จาก approved mission baseline (`get_mission` → Objectives) ไม่ใช่ paraphrase หรือ label จาก task description ล้วน ๆ; ถ้า task description เขียนไม่ตรงให้ใช้ชื่อจาก mission แล้วแจ้งผู้ใช้เสนอแก้ description
- [ ] แสดง **สรุปราย task แบบเต็มก่อน** (เวลาเริ่ม/เวลาจบ/เวลาทำงาน + หมวดหมู่งาน + สถานะความสมบูรณ์ + เป้าหมาย + ภาพรวม + ไฟล์ที่แก้ไข + รายละเอียดงาน + ส่งต่อ) แล้วตามด้วย **Final Work Summary Copy Block** จาก Final Summary ชุดเดียวกันทุกครั้ง เป็น Human-readable `text` Copy Block เดียว: Objective/Feature เมื่อมี mapping จริง → Task → Category → เวลาเริ่ม/เวลาจบ/Final Actual Time → เป้าหมาย/ผลลัพธ์ที่คาดหวัง → ภาพรวม → ไฟล์ที่แก้ไข (เฉพาะไฟล์งานจริง แสดงเมื่อมี) → รายละเอียดงานที่ทำ — เนื้อหา `เป้าหมาย/ผลลัพธ์ที่คาดหวัง`, `ภาพรวม` และ `รายละเอียดงานที่ทำ` ของทั้งสอง block ต้องเป็นชุดเดียวกัน
- [ ] ตรวจว่า Final Work Summary Copy Block ใช้ business-facing Task Code และไม่มี Kanban UUID/internal ID
- [ ] ตรวจว่า Final Work Summary Copy Block ไม่มี status, Goal, Overview, Decisions, Problems, Scope Changes, Pending/Follow-up, Next Step หรือ workflow metadata เป็น section แยก (ยกเว้น section ไฟล์ที่แก้ไข ซึ่งแสดงเมื่อมีไฟล์ส่งมอบที่สร้างหรือแก้จริง)
- [ ] ตรวจว่ารายการใน Final Work Summary Copy Block ใช้ literal `- ` และไม่มี `*` หรือ rendered bullet `•`
- [ ] ตรวจว่า Final Work Summary Copy Block ทั้งหมดอยู่ใน `text` code block เดียว ใช้รายการ `รายละเอียดงานที่ทำ` กระชับและอ่านเข้าใจได้ และไม่ได้แยก Verification/workstream เป็น section โดยไม่จำเป็น
- [ ] ตรวจว่าเวลาหลังปิด task อ้างอิง Final `hours_spent`; แสดง Planned Time เฉพาะกรณี Case C ที่มีแผนตกลงไว้และเวลาจับจริงเชื่อถือได้; ถ้าเวลาถูกบันทึกย้อนหลังให้ระบุข้อจำกัดแทนการเรียกว่าเวลาจริง
- [ ] ตรวจว่า canonical Final Summary / Final Session Note ยังคง Actual Start/End และรายละเอียดเต็มทั้งหมด แม้ Copy Block จะย่อ presentation
- [ ] เช็ค dead time ใน banked `hours_spent` — เฉพาะงานประเภท run (run tests/regression) ที่ผลลัพธ์เสร็จแล้วแต่ timer เดินต่อตอนผู้ใช้ไม่ได้อยู่หน้าจอ → แจ้งผู้ใช้พร้อมเสนอเวลางานจริง ถ้ายืนยันให้ correct ด้วย `update_task` (SET `hours_spent`) เป็น correction workflow แยกหลังปิด; เวลารอผู้ใช้รีวิวหน้าจอ/prototype = เวลาทำงานจริง นับต่อเนื่อง ห้ามตัด
- [ ] แจ้งผู้ใช้ว่า "ปิด task <ชื่อ> แล้ว ใช้เวลา <D.D ชม.>"
- [ ] หลัง Copy Block: ถ้ามีงานรอทำต่อ → บันทึก session note (สถานะรวม + state + decisions/gotchas + Next Step) และสร้าง prompt งานถัดไปเป็น copy block ให้ผู้ใช้; ถ้าไม่มีงานต่อ → เสนอแนวทางงานต่อไปให้ผู้ใช้ตัดสินใจ (เช่น mission ใหม่, outstanding work, mission closure) โดยไม่สร้าง mission/task เอง
- [ ] ⚠️ **ห้ามบวก/ลด/ปรับชั่วโมงเอง** — ใช้ค่า hours_spent จากระบบเป็นค่าจริง
- [ ] ⚠️ **ห้ามเรียก `log_time`** ก่อนหรือหลังปิด task
- [ ] ⚠️ ห้ามใช้ elapsed/snapshot time ขณะ `in_progress` เป็น Final Actual Time
- [ ] ⚠️ ห้ามส่ง log ไปยังระบบภายนอกใด ๆ

### สถานการณ์ที่ 3: บันทึก session ก่อนขึ้น session ใหม่ (task ยังไม่จบ)
- [ ] เรียก `get_board` เพื่อตรวจสอบ task ที่อยู่ใน `in_progress`
- [ ] สร้าง Progress/Handoff Summary: สิ่งที่เสร็จแล้ว, Current State, Decisions, สิ่งที่ตรวจสอบแล้ว, **หลักฐานที่เก็บไว้แล้วระหว่างทำ (path)**, Open Items, Blockers, สิ่งที่ยังไม่ได้ทำ และ Next Step
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
- [ ] **Validation ตามตารางเวลามาตรฐานตามหมวดหมู่** — ใช้เป้าหมายหมวดเป็นสัญญาณให้ทบทวน ไม่ใช่หลักฐานว่าเกินแผน; เปรียบเทียบกับแผนที่ตกลงไว้และเวลาที่เชื่อถือได้ก่อนแจ้งผู้ใช้ ห้ามแบ่งเวลาย่อยโดยไม่มีบันทึกรองรับ
- [ ] **จัดการเวลาที่สูงกว่าแผน** — เปรียบเทียบกับแผนที่ตกลงไว้และเวลาที่เชื่อถือได้เท่านั้น; ชี้แจงสาเหตุที่มีข้อมูลรองรับอย่างกระชับ; ห้ามแบ่งเวลาเป็นส่วนย่อยโดยไม่มี Activity Timeline/บันทึกรองรับ และห้ามแก้ `hours_spent` ใน workflow สรุป
- [ ] รวมข้อมูลวันนี้ + session context ปัจจุบัน
- [ ] สรุปเป็นภาษาง่าย ๆ (ห้ามใช้ชื่อฟังก์ชัน ชื่อ class CSS ชื่อตัวแปร ชื่อ event หรือโค้ด — ใช้คำทั่วไปที่อธิบายผลลัพธ์แทน)
- [ ] **แสดงสรุปรวม** — ภาพรวม + totalHours (รูปแบบ `D.D ชม.` ทศนิยม 1 ตำแหน่ง) + รายการ task ที่นำมารวม (markdown ปกติ)
- [ ] **แสดง Progress/Report-only สรุปราย task** — หุ้มด้วย code block (` ``` `) และมีสถานะ + เวลาเริ่ม/จบหรือปัจจุบัน + เวลาทำงาน/เวลาที่ผ่านไป + หมวดหมู่ + สถานะความสมบูรณ์ + เป้าหมาย + ภาพรวม + ไฟล์ที่แก้ไข + รายละเอียดงาน + ค้าง/ส่งต่อ ตามความเกี่ยวข้อง
- [ ] **แสดง copy block ราย task ตามโหมด** — Progress/Report-only ใช้ template ราย task เดิม; Final Task Completion ใช้ Human-readable `text` Copy Block เดียว เลือก Case A/Case B ตาม Mission Mapping จริง หรือ Case C เมื่อมีแผนและเวลาจับจริงที่เชื่อถือได้สูงกว่าแผน; ไม่แบ่งเวลาย่อยหากไม่มีข้อมูลรองรับ และแสดงเฉพาะฟิลด์ที่กำหนด
- [ ] **ทุก task block ต้องมีเวลาเริ่ม + เวลาจบ/ปัจจุบัน + เวลาทำงาน/เวลาที่ผ่านไป** — รวมถึง Final Work Summary Copy Block ที่แสดง เวลาเริ่ม + เวลาจบ + Final Actual Time จากค่าหลังปิด task
- [ ] **รูปแบบเวลา: `D.D ชม.` (ทศนิยม 1 ตำแหน่งเท่านั้น)** — ปัด `hours_spent` ดิบเป็นทศนิยม 1 ตำแหน่งทุกที่ที่แสดงเวลา (ราย task, รวม, copy block) ห้ามใช้รูปแบบ `X ชม. Y นาที` หรือทศนิยม 2 ตำแหน่ง
- [ ] **ห้ามบวก/ลด/ปรับชั่วโมงเอง** — ใช้ค่า `hours_spent` จากระบบ ห้ามเรียก `log_time`; ถ้าผิดปกติให้รายงานและแยก correction workflow
- [ ] **ทุก task block ต้องมีบรรทัด "หมวดหมู่งาน"** — เลือกจากรายการ 9 หมวด เพียง **1 หมวด** ต่อ 1 task ห้ามระบุหลายหมวดคั่นด้วย `,`
- [ ] **Progress/Report-only task block ต้องมีบรรทัด "สถานะความสมบูรณ์"**; Final Work Summary Copy Block ไม่แสดงฟิลด์นี้
- [ ] **ทุก task block ต้องมี section "เป้าหมาย/ผลลัพธ์ที่คาดหวัง"** — รวมถึง Final Work Summary Copy Block โดยเนื้อหาต้องตรงกับสรุปราย task block ของ task เดียวกัน
- [ ] **ถ้า task สร้างหรือแก้ไฟล์เพื่อส่งมอบงานจริง** → แสดง subsection "ไฟล์ที่แก้ไข" ทั้งใน Progress/Report-only และ Final Work Summary Copy Block รวมเอกสาร, Test Case, checklist หรือรายงานที่เป็น deliverable; ไม่นับไฟล์ชั่วคราวหรือไฟล์แพ็กหลักฐานที่ไม่ใช่ deliverable
- [ ] **ถ้ามีงานเพิ่มนอกแผน** → รวมเป็น bullet ใน subsection "รายละเอียดงานที่ทำ" ไม่ต้องแยก subsection แต่ละ bullet รวมเหตุและทางแก้ในบรรทัดเดียว ใช้ `→` คั่น ถ้าไม่มี ข้ามได้
- [ ] **ถ้ามี open items** → task `in_progress` ใช้ subsection "ค้าง/ติดตาม"; task `done` ใช้ "ส่งต่อ" สำหรับงานใหม่ที่ไม่ทำให้ Acceptance Criteria ของ task เดิมไม่ครบ; ถ้าไม่มีให้ข้าม subsection นี้
- [ ] **bullet ใน "รายละเอียดงานที่ทำ" อนุญาตให้ใส่ตัวเลขปริมาณได้** (เช่น "แก้ 3 หน้าจอ", "เพิ่ม 4 API") แต่ห้ามใส่รายชื่อไฟล์ทีละตัว — รายชื่อไฟล์ให้แสดงใน subsection "ไฟล์ที่แก้ไข" แทน
- [ ] **bullet ที่เล่าปัญหา/decision/gap ต้องระบุเนื้อหา** — บอก "ปัญหาอะไร + แก้/ตัดสินใจอะไร" ในตัว bullet (ห้ามเขียนแค่กระบวนการ เช่น "พบ gap 3 จุด → รายงานผู้ใช้" โดยไม่บอกว่า gap คืออะไร)
- [ ] **เลือกข้อมูลสำคัญตามประเภทงาน** — ใส่จำนวน/ขอบเขต, สาเหตุปัญหา, ผลทดสอบ หรือมาตรการความปลอดภัยเฉพาะเมื่อเกี่ยวข้องและช่วยให้เข้าใจผลของ task; ไม่บังคับใส่ทุกข้อในทุกสรุป
- [ ] **อ้าง requirement/spec/entity ด้วยชื่อ ไม่ใช่ ID ล้วน** — ห้าม `bf08de1f`/`18598f33` ลอย ๆ; ใช้ชื่อที่อ่านรู้เรื่อง (internal ID เก็บไว้ใน session note; Task Code แบบ AIL-xxx ใช้ได้)
- [ ] **"รายละเอียดงานที่ทำ" ต้องเป็นงานของ task เท่านั้น** — ห้ามใส่ workflow/evidence mechanics (timer quirk, ค่า default ตอนสร้าง, การย้าย column, commit/push, การจัดเตรียมหลักฐาน/report/checklist card/screenshot, re-run verify script) — path หลักฐานอยู่ในส่วน Evidence ของ session note, ผล verify อยู่ในส่วน Verification; ถ้าสำคัญให้แจ้งแยกนอก copy block
- [ ] **bullet เขียนแบบสรุปผล ไม่เล่ากระบวนการ** — ห้ามเล่าเหตุการณ์/ลำดับตัดสินใจ ("เสนอผู้ใช้เลือก → ผู้ใช้เลือก X"), ห้ามใส่ตัวเลขเวลาแผน/น้ำหนัก, ห้ามเอ่ยชื่อเครื่องมือภายใน (Kanban); แต่งานที่พบบั๊ก/เทสล้มต้องเล่ารายละเอียดเต็มตามเดิม (เจออะไร/สาเหตุ/แก้อย่างไร/กระทบอะไร)
- [ ] **ใช้ชื่อ label จริงบนหน้าจอ** — ส่วนของจอ/ปุ่ม/เมนูที่มีชื่อแสดงจริงให้ใช้ชื่อนั้นตรง ๆ (เช่น "Test flow", "Change History", "Preview as FO") ห้ามบรรยายเองเป็นคำไทยลอย ๆ ที่ไม่มีบนจอ
- [ ] **task ที่ยัง `in_progress`** ต้องระบุ "ปัจจุบัน: <now>" แทน "เวลาจบ" และใช้ "เวลาที่ผ่านไป" แทน "เวลาทำงาน" พร้อมระบุ "(ยังจับเวลาอยู่)"
