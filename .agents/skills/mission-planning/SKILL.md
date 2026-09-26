---
name: mission-planning
description: TukDaeng daily work workflow — วางแผน Mission รายวัน, สร้าง Mission Plan Summary และ Session Handoff หลังอนุมัติแผน, และสรุปผลหลังทำตามแผน พร้อมส่วนที่ก๊อปไปลงระบบอื่นได้เลย. Use เมื่อเริ่มวางแผนงานรายวัน, ปิด planning session หลังผู้ใช้อนุมัติ Mission Plan หรือสรุปผลหลังทำตามแผน
---

# TukDaeng Mission Planning Workflow

> ## ⚠️ Machine Guard — ตรวจสอบเครื่องก่อนทำงาน skill นี้ (จำเป็น)
>
> Skill นี้ผูกกับเครื่องเฉพาะ เพราะอ้างอิง path/workspace ของ TukDaeng บนเครื่องนี้เท่านั้น
>
> **เครื่องที่อนุญาต:**
> - Platform: Windows
> - User: `Admin` หรือ account sandbox ที่ลงท้ายด้วย `\\codexsandboxoffline`
> - Home path: `C:\Users\Admin`
> - Workspace path ที่ต้องมีอยู่จริง: `C:\Users\Admin\Desktop\TukDaeng\`
>
> **วิธีตรวจสอบก่อนเริ่ม skill:**
> 1. ตรวจ user ปัจจุบัน (เช่น `whoami`) — ต้องเป็น `Admin` หรือ account sandbox ที่ลงท้ายด้วย `\\codexsandboxoffline`
> 2. ตรวจว่า path `C:\Users\Admin\Desktop\TukDaeng\` มีอยู่จริง
>
> **ถ้าไม่ใช่เครื่องนี้:** หยุดทำงาน skill นี้ทันที ไม่เรียก MCP ใด ๆ แจ้งผู้ใช้ว่า skill นี้ใช้ได้เฉพาะเครื่องของ Admin เท่านั้น

Workflow สำหรับ **วางแผนการทำงานรายวัน** และ **สรุปผลหลังทำตามแผน** ของทีม TukDaeng — แบ่งการทำงานเป็น 2 ส่วนที่แยกจากกันชัดเจน

> **หมายเหตุสำคัญ:** skill นี้ **ไม่ส่ง log เข้า Core Portal อัตโนมัติ** — ทุกสรุปที่ออกมาจะอยู่ในรูปแบบ **code block (copy block)** เพื่อให้ผู้ใช้ก๊อปข้อความไปวางในระบบอื่นได้เอง

### การแยก Mission Plan, Approval Artifacts และ Work Summary

- **Mission Plan** คือแผนตั้งต้นก่อนเริ่มงาน ต้องเขียนเป็นสิ่งที่วางแผนจะส่งมอบ ไม่ใช่ผลลัพธ์ย้อนหลัง
- Mission Plan ต้องมี Objective, Feature ย่อย, Task ที่เกี่ยวข้อง, เวลาแผน, Dependency, Acceptance Criteria และ Risk
- Mission Plan ห้ามใส่สถานะ `เสร็จ`, ชั่วโมงที่ใช้จริง, Activity timeline, Evidence, bug ที่พบจริง, ผล QA ที่เกิดขึ้นแล้ว หรือ Scope Change ที่เกิดขึ้นภายหลัง
- **Mission Plan Summary Copy Block** คือสรุป Approved Mission Baseline สำหรับ Work Log และคนทั่วไปอ่านย้อนหลัง ต้องกระชับ แสดง Objective → Feature → Task ชัดเจน และห้ามมี Kanban UUID/internal ID
- **Session Handoff** คือ execution context สำหรับ Agent/session ถัดไป ต้องคง technical context, identifiers, dependency, current state และ next-step instructions ที่จำเป็น; สามารถมี Kanban UUID/internal ID ได้
- Mission Plan Summary กับ Session Handoff เป็นคนละ artifact ห้ามใช้แทนกัน ห้ามลดรายละเอียด Handoff เพราะมี Summary และห้ามบังคับให้ผู้ใช้ใช้ Summary เป็น execution context
- **Work Summary** คือสรุปหลังทำงาน ใช้สำหรับสถานะจริง, ชั่วโมงจริง, Activity timeline, ไฟล์ที่แก้, Evidence, bug/การแก้ไขจริง, Scope Change และ open items
- การวางแผนและการสร้าง task อาจมี planning record แยกได้ แต่ไม่ต้องนับ planning record เป็น Objective ของ Mission ที่ส่งมอบ เว้นแต่ผู้ใช้ระบุชัดว่าต้องการนับงานวางแผนเป็น deliverable
- หากผู้ใช้ขอ Mission Plan ใหม่ ให้สร้างจาก requirement และ scope ณ ก่อนเริ่มงาน โดยไม่ใช้ความรู้จากผลลัพธ์ภายหลังมาปรับถ้อยคำให้เหมือนงานเสร็จแล้ว

### กติกา Mission → Objective → Feature → Task และ Work Log (บังคับ)

- **Mission** คือภาพรวมและ baseline ของงานทั้งก้อน
- **Objective** คือผลลัพธ์หลักของ Mission
- **Feature** คือผลลัพธ์ย่อยที่อยู่ใต้ Objective ใช้เป็นหน่วยเลือกตอนลง work log และต้องคงอยู่เพื่อวัด Planning Accuracy
- **Task** คือหน่วยงานปฏิบัติที่แตกละเอียดเพื่อทำจริง ผู้ใช้สั่งทำทีละ Task และทุก Task ต้อง map กับ Objective และ Feature ที่จะใช้ลง work log
- หนึ่ง Feature map กับหลาย Task ได้ และหนึ่ง Feature มี work log ได้หลายรายการ โดยแต่ละ log เกิดจาก Task ที่ปิดพร้อมสรุปแล้ว ไม่ใช่ log ความคืบหน้าย่อยระหว่างทำ Task เดียว
- Workflow: วาง Mission และ Feature → แตก Task ที่ต้องทำจริง → ทำทีละ Task → สรุปและปิด Task → เตรียม work log ของ Task โดยเลือก Objective และ Feature ที่ map ไว้
- **วางเป้าหมายให้ตรงกับ "หนึ่งชุดหลักฐานส่งตรวจ"** — ฟอร์มส่งตรวจรับคิดหลักฐานต่อ 1 เป้าหมาย (ไฟล์แนบ + คำอธิบาย) ดังนั้นเป้าหมายที่ผลิตหลักฐานคนละประเภท (เอกสาร spec vs ภาพหน้าจอ UI vs test/verification) ควรเป็นเป้าหมายแยกกัน; เป้าหมายล้วน UI ให้แยกตามฝั่งผู้ใช้/flow (เช่น ฝั่ง admin กับฝั่งผู้รับ) ไม่ใช่รวมทุกจอไว้เป้าหมายเดียว; และอย่าแตกเป้าหมายยิบย่อยจน submission กระจายเป็นรายการที่บอกอะไรไม่ได้ — 1 เป้าหมายมี 1 Task ได้ถ้า deliverable เป็นคนละชนิด
- หลังเริ่ม Mission ห้ามลบ Objective หรือ Feature จาก baseline หาก Task ไม่จำเป็นต้องทำแล้ว ให้บันทึกเป็น Scope Change/ยกเลิกพร้อมเหตุผล และคง Feature ไว้เพื่อให้ความแม่นยำของแผนไม่หายไป
- หลีกเลี่ยงการลบ Task หลังเริ่มทำ ให้ใช้สถานะยกเลิกหรือบันทึกเหตุผลแทน ทั้งนี้ Task ที่ยกเลิกไม่ลบ Feature หรือ work log ที่เกี่ยวข้อง
- ประเมินเวลาตามเวลา AI ทำงานเป็นหลัก รวมเวลา AI วิเคราะห์ สร้าง แก้ และตรวจรับตามขอบเขตงาน
- **วางแผนให้ตอบโจทย์การประเมินผลงาน (Evaluation Alignment):** ทุกหน่วยงานต้อง map เป็น Kanban task ที่จับเวลาได้ — ชั่วโมงถูกนับในระบบประเมินเฉพาะงานที่อยู่ใน task ที่ `in_progress` (งานนอก task = ชั่วโมงไม่เข้าระบบ); task size ต้องอยู่ในเกณฑ์หมวดเพื่อรักษา Planning Accuracy; และทุกเป้าหมายต้องออกแบบให้ผลิต "ชุดหลักฐานที่ reviewer ตรวจได้" (ภาพ/ไฟล์/log ตาม `submission-evidence`) — เป้าหมายที่ทำเสร็จแต่ไม่มีหลักฐานพร้อมตรวจจะค้างรอ review
- ใช้ copy block เฉพาะ Mission Plan, Mission Plan Summary, Session Handoff, Work Summary และ Task Summary ที่ผู้ใช้ต้องนำไปวางระบบอื่น; คำตอบคุยงานทั่วไปตอบตามปกติ

### กฎการตั้งชื่อ Objective และ Feature (Naming Rules — บังคับ)

- **ชื่อ Objective/Feature คือ label ไม่ใช่ description** — ต้องสั้น กระชับ อ่านแล้วรู้ว่าเป็น work area / capability / outcome area อะไร และเหมาะกับการแสดงใน Mission Plan, Kanban และ Work Log
- **ห้ามยัดเนื้อหาเชิงอธิบายลงในชื่อ** — ห้ามใส่ scope, behavior list, business rules, validation, implementation details, technical steps, Acceptance Criteria, Definition of Done, dependencies หรือ security rules ในชื่อ Objective/Feature; เนื้อหาเหล่านั้นต้องอยู่ใน Description, Scope, Requirement, Acceptance Criteria, DoD หรือ Notes
- **เลือกภาษาตามความชัดเจน ไม่บังคับล้วนไทย** — ใช้ไทยหรืออังกฤษตามคำที่เข้าใจง่ายกว่า เป็น terminology ที่ทีมใช้จริง สั้นและชัดกว่า; คำมาตรฐานเช่น `My Account`, `Change Password`, `Active Sessions`, `Logout All Devices`, `Session Expired`, `Forgot Password`, `Reset Password`, `Password Recovery`, `Regression`, `Accessibility`, `Final Acceptance` ใช้ภาษาอังกฤษโดยตรงได้ ห้ามแปลเป็นไทยเพียงเพื่อให้ชื่อเป็นไทยทั้งหมดจนแปลก ยาว หรือเข้าใจยากกว่า
- **Objective = ชื่อของ goal / workstream / outcome area** — เช่น `Credential Security Contract`, `My Account & Self-Service`, `Targeted Verification`; ข้อความยาวเช่น `สร้างหน้า My Account ให้แก้ชื่อ เปลี่ยนรหัสผ่าน ดู sessions และออกจากทุกอุปกรณ์ได้` เป็น Description/Scope ไม่ใช่ชื่อ Objective
- **Feature = ชื่อของ capability / screen / flow / functional area / contract area / verification area** — เช่น `My Account`, `Change Password`, `Logout All Devices`, `Scoped Regression`; ห้ามต่อ scope ต่อท้ายชื่อ เช่น `Logout All Devices (confirmation + revoke ทุก session รวม current + audit + กลับ Login)` ให้ใช้เพียง `Logout All Devices` แล้วเก็บรายละเอียดไว้ใน Scope/AC
- **Feature ไม่ใช่ Task** — Feature คือ grouping ของ capability/work area ส่วน Task คือ execution unit; 1 Feature map กับหลาย Task ได้ (เช่น Feature `Scoped Regression` → `AIL-029a` + `AIL-029b`) และห้าม merge Task เพียงเพื่อให้ตรงกับ Feature
- **Naming cleanup ห้ามกระทบ decomposition** — การปรับชื่อ Objective/Feature ห้าม merge หรือ split Task, เปลี่ยน Task Code, Task Name, Category, Planned Hours, dependencies, execution order, Scope หรือ Acceptance Criteria และห้ามเปลี่ยนจำนวน planned tasks
- **Mission Plan Summary ใช้ชื่อ label เท่านั้น** — แสดง `Objective: <short name>` และ `Feature: <short name>` แล้วตามด้วย Tasks ใต้ Feature นั้น; ห้ามเขียน `Feature: <name> (<scope/behavior ยาว ๆ>)` — ถ้าต้องอธิบาย Feature ให้ใช้ field แยก เช่น `Scope: ...`

---

## Table of Contents

- [ภาพรวม Workflow (2 ส่วน)](#ภาพรวม-workflow-2-ส่วน)
- [เครื่องมือ kanban-tukdaeng ที่ใช้](#เครื่องมือ-kanban-tukdaeng-ที่ใช้)
- [ส่วนที่ 1: วางแผน Mission รายวัน (Daily Planning)](#ส่วนที่-1-วางแผน-mission-รายวัน-daily-planning)
  - [รายละเอียด Task ที่เสร็จแล้ว](#2-ดึงรายละเอียดของ-task-ที่ทำเสร็จแล้ว)
  - [Scope และ Acceptance Criteria](#5-กำหนด-scope-และ-acceptance-criteria)
  - [Dependency และลำดับงาน](#7-วิเคราะห์-dependency-และลำดับงาน)
  - [Risk และแผนรับมือ](#8-วิเคราะห์-risk-และแผนรับมือ)
  - [Mapping กับ Kanban](#11-mapping-แผนกับ-kanban-task)
  - [ตัวอย่าง Mock-up ฟอร์ม Create Mission](#12-ตัวอย่าง-mock-up-ฟอร์ม-create-mission)
  - [Mission Approval และ Session End](#13-mission-approval--session-end-workflow)
- [ส่วนที่ 2: สรุปผลหลังทำตามแผน (Work Summary)](#ส่วนที่-2-สรุปผลหลังทำตามแผน-work-summary)
  - [AI Review และ Evidence](#2-ตรวจสอบงานที่-ai-ทำและรวบรวม-evidence)
  - [กฎเมื่อแผนเปลี่ยน](#กฎเมื่อแผนเปลี่ยนระหว่างทำ)
- [รูปแบบ Copy Block](#รูปแบบ-copy-block)
- [Services ที่เกี่ยวข้อง](#services-ที่เกี่ยวข้อง)
- [Checklist](#checklist)

---

## ภาพรวม Workflow (2 ส่วน)

```
ส่วนที่ 1: วางแผน Mission รายวัน          ส่วนที่ 2: สรุปผลหลังทำตามแผน
─────────────────────────────           ─────────────────────────────
เรียก kanban-tukdaeng ดู context             เรียก kanban-tukdaeng ดูสถานะปัจจุบัน
(get_project_context + get_board         (get_board + get_task
 + get_task + get_time_summary           + get_time_summary)
 + mcp_list_tools)
↓                                        ↓
คิด Mission + จำนวนวัน (1-5 วัน)         สรุปว่าในแต่ละแผนทำอะไรบ้าง
↓                                        ↓
สรุปหัวข้อ Mission (ตามฟอร์ม Create      สรุปเป็นข้อ ๆ แยกตาม Service
Mission: Baseline, วันที่, ผู้รับผิดชอบ) + copy block
+ copy block
↓
วางแผนแยกเป้าหมาย (Objectives) พร้อม
น้ำหนัก% (รวม 100%) + Feature ย่อย
+ ประเมินเวลา (1 วัน = 8 ชม. รวมไม่เกิน
Baseline ของ Mission)
↓
แต่ละ Objective ต้องมี Feature ย่อยที่เป็น
ผลลัพธ์ย่อยของ Objective และ map กับ
Task ที่เกี่ยวข้องได้ 1 task หรือหลาย task
↓
ทุก Feature ย่อยต้องระบุแผน "ตรวจสอบ" + "แก้ไข"
เว้นแต่งานนั้นเป็น decision/meeting ที่ไม่มีการแก้ไฟล์
↓
สรุปแผนเป็นข้อ ๆ แยกตามเป้าหมาย + copy block
↓
ผู้ใช้ตรวจและอนุมัติ Mission Plan
↓
ล็อก Approved Mission Baseline
↓
สร้าง Mission Plan Summary Copy Block สำหรับ Work Log
+ สร้าง/อัปเดต Session Handoff สำหรับ Agent
↓
แสดงสอง artifact แยกกัน แล้วจบ Planning Session
(ห้ามเริ่ม implementation อัตโนมัติ)
```

**กฎเหล็ก:**
- ทั้ง 2 ส่วนแยกจากกันชัดเจน — ห้ามข้ามส่วน
- ทุกสรุปที่สำคัญ (Mission, แผน, ผล) ต้องมี **copy block** ให้ผู้ใช้ก๊อปไปวางระบบอื่นได้เลย
- ห้ามส่ง log/อัปเดตระบบภายนอกใด ๆ อัตโนมัติ — แค่สรุปและแสดง copy block

---

## เครื่องมือ kanban-tukdaeng ที่ใช้

ก่อนเริ่ม skill ให้เรียก `mcp_list_tools` ของ `kanban-tukdaeng` เพื่อดูเครื่องมือทั้งหมดที่มี แล้วเลือกใช้ตามความเหมาะสม:

```
mcp_list_tools(server_name="kanban-tukdaeng")
```

เครื่องมือหลักที่ใช้ใน skill นี้:

| Tool | ใช้เมื่อไร | จุดประสงค์ |
|---|---|---|
| `mcp_list_tools` | เริ่ม skill (ทุกครั้ง) | ดูเครื่องมือ/ฟีเจอร์ทั้งหมดที่มี เพื่อเลือกใช้ให้ตรงงาน |
| `get_project_context` | เริ่มส่วนที่ 1 | ดู board ปัจจุบัน + session notes ล่าสุด เพื่อ resume context |
| `get_board` | ทั้ง 2 ส่วน | ดู task ทั้งหมดใน board จัดกลุ่มตาม column (เห็น in_progress/todo/done) |
| `get_time_summary` | ทั้ง 2 ส่วน | สรุปชั่วโมงทำงานของ task DONE ตามวัน/ช่วงเวลา + analysis flag ชั่วโมงต่ำผิดปกติ |
| `get_task` | ทุกครั้งที่ต้องสรุป Mission ที่มี task DONE หรือเมื่อต้องตรวจ task เฉพาะ | ดู title/description/status/hours และ Activity timeline (note, status และ time events) ตาม id |
| `list_groups` | เมื่อต้องจัดกลุ่ม/กรองงาน | ดู tag/label ทั้งหมดใน project (เช่น option-master, asset-management, bo-module, document, prototype) |

> **แนะนำ:** ในส่วนที่ 1 (วางแผน) ให้เรียก `get_project_context` ก่อนเสมอเพื่อ resume session แล้วค่อยเรียก `get_board`/`get_time_summary` เสริมตามต้องการ

---

## ส่วนที่ 1: วางแผน Mission รายวัน (Daily Planning)

### เป้าหมาย
- วางแผนการทำงานของวันนี้/ช่วงนี้ในระดับ **Mission** (ไม่ใช่ task เล็ก ๆ)
- แยกแผนออกตาม **Service** ที่เกี่ยวข้อง พร้อมประเมินเวลา
- ทุกแผนต้องมี "ตรวจสอบ" + "แก้ไข" แจกใส่ในแต่ละ Feature ย่อย (subtask)
- สรุปออกมาเป็นข้อ ๆ พร้อม copy block ให้ผู้ใช้ก๊อปไปลงระบบอื่นได้

### ขั้นตอน

#### 1. เรียกข้อมูลจาก kanban-tukdaeng MCP

เรียกตามลำดับนี้ (บางตัวเรียกขนานกันได้):

```
# ดูเครื่องมือทั้งหมดก่อน (ทุกครั้ง)
mcp_list_tools(server_name="kanban-tukdaeng")

# resume context ของ session
mcp_call_tool(server_name="kanban-tukdaeng", tool_name="get_project_context", arguments={})

# ดู board ปัจจุบัน (task ที่อยู่ใน todo/in_progress/done)
mcp_call_tool(server_name="kanban-tukdaeng", tool_name="get_board", arguments={})

# สรุปชั่วโมงทำงานของ task DONE วันนี้/ช่วงที่ต้องการ
mcp_call_tool(
  server_name="kanban-tukdaeng",
  tool_name="get_time_summary",
  arguments={
    "date": "<YYYY-MM-DD>",   # วันที่ต้องการสรุป (default: วันนี้ tz Asia/Bangkok)
    "tz": "Asia/Bangkok",
    "status": "done"
  }
)
```

**ใช้ข้อมูลที่ได้เพื่อ:**
- เข้าใจงานที่ค้างไว้ (todo/in_progress) จาก `get_board`
- เข้าใจประวัติ/session ก่อน ๆ จาก `get_project_context`
- เข้าใจชั่วโมงที่ใช้ไปแล้วจาก `get_time_summary` (เพื่อประเมินเวลาที่เหลือในวัน/สัปดาห์)

#### 2. ดึงรายละเอียดของ task ที่ทำเสร็จแล้ว

เมื่อ `get_board` พบ task ที่อยู่ใน `done` และเกี่ยวข้องกับ Mission ที่กำลังวางแผน ต้องเรียก `get_task` แยกทุก task เพื่ออ่านรายละเอียดเต็ม:

```
mcp_call_tool(
  server_name="kanban-tukdaeng",
  tool_name="get_task",
  arguments={"task_id": "<task id>"}
)
```

จากผลลัพธ์ `get_task` ให้รวบรวมและแสดง:
- ชื่อ task, task ID, Service/กลุ่ม และสถานะ
- รายละเอียดงานจาก `Description` ว่าทำอะไรลงไปบ้าง
- Activity timeline ทุกเหตุการณ์ที่ระบบส่งกลับมา โดยแยกประเภทเป็น `note`, `status` และ `time`
- วันที่/เวลาที่เกี่ยวข้องกับการทำงาน
- Dependency หรือ task ก่อนหน้าที่ task นี้อ้างถึง

**กฎการแสดง Activity timeline:**
- แสดงตามลำดับเวลาจากเก่าไปใหม่ เพื่อให้เห็นลำดับการทำงาน
- แยกเป็นรายการย่อย อ่านง่าย และคงข้อความจากระบบตามจริง
- ห้ามสรุปเกินข้อมูลที่ `get_task` ส่งกลับมา
- ถ้าไม่มี Activity timeline หรือมีเฉพาะ time event ให้ระบุว่าไม่มี note/status event เพิ่มเติม
- ชั่วโมงใน task ใช้เพื่อการวิเคราะห์ภายในเท่านั้น และห้ามใส่ใน Copy block

รูปแบบสรุปที่ต้องแสดงก่อนวางแผนงานที่เหลือ:

```
## Task ที่ทำเสร็จแล้วและรายละเอียดการทำงาน

### [<task id>] <ชื่อ task>
- Service/กลุ่ม: <ข้อมูล>
- สถานะ: Done
- รายละเอียดที่ทำ:
  - <รายการจาก Description>
- Activity timeline:
  - [<วันที่เวลา>] Note: <รายละเอียด>
  - [<วันที่เวลา>] Status: <รายละเอียด>
  - [<วันที่เวลา>] Time: <รายละเอียด>
- Dependency: <รายการ หรือ ไม่มี>
```

**Copy block รายละเอียด task ที่เสร็จแล้ว:**

```text
Task ที่ทำเสร็จแล้ว: <ชื่อ task>
Task ID: <task id>
Service/กลุ่ม: <ข้อมูล>
สถานะ: Done
รายละเอียดที่ทำ:
- <รายการจาก Description>
Activity timeline:
- [<วันที่เวลา>] Note: <รายละเอียด>
- [<วันที่เวลา>] Status: <รายละเอียด>
- [<วันที่เวลา>] Time: <รายละเอียด>
Dependency: <รายการ หรือ ไม่มี>
```

> หากมี task DONE หลายรายการ ให้แสดงรายละเอียดแยกทุก task และรวมไว้ใน Copy block เดียวหรือแยกตาม Service ได้ โดยไม่ใส่จำนวนชั่วโมง
>
> **การใช้ task DONE ในส่วนวางแผน:** รายละเอียด task DONE ใช้เป็น context สำหรับเข้าใจงานเดิมและ dependency เท่านั้น ห้ามนำสถานะ, ผลลัพธ์, Evidence หรือ bug ที่พบจาก task DONE ไปเขียนปนใน Mission Plan ใหม่ เว้นแต่ผู้ใช้ขอให้สรุปเป็น Work Summary

#### 3. คิด Mission + จำนวนวัน + เป้าหมายย่อย

วิเคราะห์จากข้อมูล kanban + session context ปัจจุบัน แล้วคิด Mission:

- **Mission** = แผนงานระดับหนึ่ง (ไม่ใช่ task เล็ก ๆ 1 อัน)
- **จำนวนวัน:** ขั้นต่ำ **1 วัน** ไม่เกิน **5 วัน** ต่อ Mission
- ถ้างานดูจะเกิน 5 วัน → แบ่งเป็นหลาย Mission
- **เป้าหมายย่อย (Objectives):** แบ่ง Mission ออกเป็นเป้าหมายย่อย 2-5 ข้อ แต่ละเป้าหมายเป็นผลลัพธ์หลักของ Mission และ map กับ Feature/Task ที่ใช้ลง work log ได้

> **การวางแผน Mission เป็นขั้นตอนก่อนสร้าง Mission ไม่ใช่ Objective บังคับของทุก Mission:**
> ให้คุยความต้องการ กำหนด scope, Acceptance Criteria และ mapping กับ Kanban ก่อนสร้างแผนได้ แต่ไม่ต้องสร้าง Objective ชื่อ "เป้าหมายการวางแผน mission" หรือบังคับสร้าง planning task แยก เว้นแต่ผู้ใช้ระบุว่าต้องการนับงานวางแผนเป็น deliverable ของ Mission
>
> Objective ของ Mission ต้องเป็นผลลัพธ์ที่ส่งมอบจริง เช่น ปรับหน้ารายการ, สร้าง detail, เพิ่ม filter, sync spec หรือ QA ไม่ใช่งานบริหารแผนที่เกิดขึ้นก่อนเริ่ม Mission

> **ตัวอย่าง:** Mission "Finalize Option Master module" แบ่งเป็น 3 เป้าหมาย:
> 1. ปรับเอกสาร Module Spec ให้ครบ (map 1 task)
> 2. สร้างและปรับ Prototype screen (map หลาย task ได้)
> 3. ตรวจสอบ Prototype เทียบกับ spec และปิดงาน (map หลาย task ได้)

#### 4. สรุปหัวข้อ Mission + copy block

หลังคิด Mission แล้ว ให้สรุปหัวข้อ Mission ตามฟิลด์เดียวกับฟอร์ม **สร้างแผนภารกิจใหม่ (Create Mission)** ของระบบ Core Portal เพื่อให้ผู้ใช้ก๊อปข้อมูลไปกรอกฟอร์มได้ตรงช่องทันที:

> Copy block ในขั้นตอนนี้เป็น **Draft/Detailed Mission Plan ก่อนอนุมัติ** ไม่ใช่ Mission Plan Summary หลังอนุมัติ และไม่ใช่ Session Handoff

**ฟิลด์ที่ต้องระบุ (ตามฟอร์ม Create Mission):**
- **ชื่อแผนงาน (Mission Name)**
- **พนักงานผู้รับผิดชอบ** — ชื่อ/อีเมลผู้รับผิดชอบหลักของ Mission
- **โปรเจกต์ (Apps/Services ที่รับผิดชอบ)** — เลือกจาก Service ที่เกี่ยวข้อง (BackOffice / FrontOffice / Prototypes)
- **วันที่เริ่ม (Start Date)** และ **วันที่เสร็จ (End Date)**
- **จำนวนวันที่ตามแผน (Planned Days)** — ขั้นต่ำ 1 วัน ไม่เกิน 5 วัน
- **งบประมาณชั่วโมงตามแผน (Baseline)** = **จำนวนชั่วโมงทั้งหมดตามแผน (Total Planned Hours) เสมอ** — Baseline อิงตามชั่วโมงที่ใส่ ไม่ใช่ Days × 8 โดยตรง
- **จำนวนชั่วโมงทั้งหมดตามแผน (Total Planned Hours)** = ผลรวมชั่วโมงประเมินของทุกเป้าหมายย่อย (คำนวณอัตโนมัติจาก Objectives ในขั้นตอนที่ 6) — ปรับได้ตามการประเมินจริง (36, 38, 40 ฯลฯ)
  - **ถ้าผู้ใช้ใส่ Total เอง** → Total = ค่าที่ใส่, Baseline = Total
  - **ถ้าผู้ใช้ไม่ใส่ Total** → Total = Planned Days × 8 ชม. (วันละ 8 ชม. อัตโนมัติ), Baseline = Total
- **สถานะจัดสรรชั่วโมง (เหลือชั่วโมงให้วางแผน)** = Baseline − Total Planned Hours = **0 เสมอ** (เพราะ Baseline = Total)

**รูปแบบที่แสดงให้ผู้ใช้:**

```
## แผนงานที่วางแผน

**ชื่อแผนงาน:** <ชื่อ Mission ภาษาเข้าใจง่าย>
**พนักงานผู้รับผิดชอบ:** <ชื่อ/อีเมล>
**โปรเจกต์:** <BackOffice / FrontOffice / Prototypes / ผสม>
**วันที่เริ่ม:** <DD/MM/YYYY>
**วันที่เสร็จ:** <DD/MM/YYYY>
**จำนวนวันที่ตามแผน:** <N> วัน
**งบประมาณชั่วโมงตามแผน (Baseline):** <Total> ชม. (= Total Planned Hours — อิงตามชั่วโมงที่ใส่ ถ้าไม่ใส่ = <N> วัน x 8 ชม.)
**จำนวนชั่วโมงทั้งหมดตามแผน:** <รวมจาก Objectives> ชม. (ประเมินตามความจริง)
**เหลือชั่วโมงให้วางแผน:** 0 ชม. (Baseline = Total)
**ภาพรวม:** <1-2 บรรทัดอธิบายว่า Mission นี้ทำอะไร>
```

**Copy block (ก๊อปไปลงระบบอื่นได้เลย):**

```text
แผนงาน: <ชื่อ Mission>
พนักงานผู้รับผิดชอบ: <ชื่อ/อีเมล>
โปรเจกต์: <Service>
วันที่เริ่ม: <DD/MM/YYYY>
วันที่เสร็จ: <DD/MM/YYYY>
จำนวนวันที่ตามแผน: <N> วัน
งบประมาณชั่วโมงตามแผน (Baseline): <Total> ชม.
จำนวนชั่วโมงทั้งหมดตามแผน: <Total> ชม.
เหลือชั่วโมงให้วางแผน: 0 ชม.
ภาพรวม: <1-2 บรรทัด>
```

> ⚠️ ห้ามส่ง log/อัปเดตระบบใด ๆ ในขั้นนี้ — แค่แสดงสรุปและ copy block
> ℹ️ copy block ของหัวข้อ Mission **ให้ใส่ Baseline, จำนวนชั่วโมงทั้งหมดตามแผน และเหลือชั่วโมงให้วางแผน** ตามกฎรูปแบบ Copy Block (ดู [รูปแบบ Copy Block](#รูปแบบ-copy-block))

#### 5. กำหนด Scope และ Acceptance Criteria

ก่อนแยกแผนตาม Service ต้องกำหนดขอบเขตของ Mission ให้ชัดเจน เพื่อป้องกันงานขยายระหว่างทำ:

- **เป้าหมายหลัก:** Mission นี้ต้องการเปลี่ยนแปลงหรือส่งมอบอะไร
- **สิ่งที่ต้องส่งมอบ:** ผลลัพธ์ที่ต้องมีเมื่อจบ Mission
- **สิ่งที่ไม่รวม:** งานที่เกี่ยวข้องแต่ยังไม่อยู่ใน Mission นี้
- **Acceptance Criteria:** เงื่อนไขที่ใช้ตัดสินว่างานเสร็จจริง

รูปแบบสรุป:

```
## ขอบเขต Mission

เป้าหมาย:
- <เป้าหมายหลัก>

สิ่งที่ต้องส่งมอบ:
- <ผลลัพธ์ที่ต้องมี 1>
- <ผลลัพธ์ที่ต้องมี 2>

สิ่งที่ไม่รวม:
- <งานที่ยังไม่รวมใน Mission>

Acceptance Criteria:
- [ ] <เงื่อนไขตรวจสอบ 1>
- [ ] <เงื่อนไขตรวจสอบ 2>
```

Acceptance Criteria ควรตรวจสอบได้จริง เช่น เอกสารครบทุก section ตาม template, cross-reference ครบ, prototype แสดงข้อมูลถูกต้องตาม spec, QA checklist ผ่าน และ document version อัปเดต

#### 6. วางแผนแยกเป้าหมาย + ประเมินเวลา

เมื่อได้ Mission, จำนวนวัน และเป้าหมายย่อยแล้ว ให้วางแผนงาน **แยกตามเป้าหมายย่อย (Objectives)** โดยแต่ละเป้าหมายระบุ Service ที่เกี่ยวข้องและ Kanban task ที่ map:

**โครงสร้างของแต่ละ Objective:**

```
เป้าหมาย <N>: <ผลลัพธ์ที่ต้องส่งมอบ>
- Service: <BackOffice / FrontOffice / Prototypes / ผสม>
- Tasks:
  - <task id หรือชื่อ task 1>
  - <task id หรือชื่อ task 2>
- น้ำหนัก (Weight): <W>% (คำนวณตามสัดส่วนชั่วโมง)
- ชั่วโมงที่คาดการณ์: <X> ชม.
- ผู้รับผิดชอบหลัก (Assignee): <ชื่อ/อีเมล>
- รายละเอียด: <ผลลัพธ์ที่ Objective นี้ต้องส่งมอบ>
- Feature ย่อย:
  - <ชื่อ Feature 1>
    - Tasks ที่เกี่ยวข้อง: <task id 1>, <task id 2>
    - ตรวจสอบ (<เวลา>) + แก้ไขตามผลตรวจ (<เวลา>) (<เวลารวม> ชม.)
  - <ชื่อ Feature 2>
    - Tasks ที่เกี่ยวข้อง: <task id 3>
    - ตรวจสอบ (<เวลา>) + แก้ไขตามผลตรวจ (<เวลา>) (<เวลารวม> ชม.)
- Dependency: <หลังเป้าหมายใด หรือ ไม่มี>
- work log: เกิดหลังสรุปและปิด Task โดยเลือก Objective และ Feature ที่ map กับ Task นั้น
```

> **หมายเหตุ:** Objective และ Feature ใน Mission Plan ต้องเขียนเป็นงานที่วางแผนจะทำและผลลัพธ์ที่คาดหวัง ห้ามเขียนสถานะหรือผลการตรวจที่เกิดขึ้นแล้ว การวางแผน Mission เป็นขั้นตอนเตรียมแผนและไม่ต้องนับเป็น Objective แยก เว้นแต่ผู้ใช้ระบุเป็น deliverable

Services ที่ใช้ใน TukDaeng:
- **BackOffice (BO)** — เอกสาร spec ของระบบ admin (markdown modules, baseline, version)
- **FrontOffice (FO)** — เอกสาร spec ของระบบผู้ใช้ (markdown modules, PRD, handoff)
- **Prototypes** — prototype screen ของ BO (HTML, assets, mock data)

**โครงสร้างของแต่ละเป้าหมาย (ตรงกับส่วน "เป้าหมายย่อย (Objectives)" ในฟอร์ม Create Mission):**

```
เป้าหมาย <N>: <ชื่อเป้าหมาย>
- Service: <BackOffice / FrontOffice / Prototypes / ผสม>
- Tasks:
  - <task id 1>
  - <task id 2>
- น้ำหนัก (Weight): <W>% (น้ำหนักความสำคัญของเป้าหมายนี้ เทียบกับเป้าหมายอื่นใน Mission)
- ชั่วโมงที่คาดการณ์ (Estimated Hours): <X> ชม.
- ผู้รับผิดชอบหลัก (Assignee): <ชื่อ/อีเมล หรือ ไม่ระบุ>
- รายละเอียด: <ทำอะไร>
- Feature ย่อย:
  - [<task id 1>] <รายละเอียด feature + ตรวจสอบ + แก้ไข> (<เวลา> ชม.)
  - [<task id 2>] <รายละเอียด feature + ตรวจสอบ + แก้ไข> (<เวลา> ชม.)
- Dependency: <หลังเป้าหมายใด>
- work log: เกิดหลังสรุปและปิด Task โดยเลือก Objective และ Feature ที่ map กับ Task นั้น
```

**กฎการกรอก Feature ย่อย (บังคับ):**

1. **Tasks เป็นลิสข้อ ๆ ลงมา** — ไม่ใช่ `,` หรือ `+` คั่นบรรทัดเดียว
2. **รายละเอียดของ Objective ไม่ใส่ชั่วโมง** — เวลารวมอยู่ใน Feature ย่อยแล้ว
3. **Feature ย่อยต้องเป็นผลลัพธ์ย่อยของ Objective** — เขียนเป็นภาษาที่เข้าใจง่ายและไม่แตกละเอียดเกินความจำเป็น
4. **หนึ่ง Feature สามารถ map กับหลาย Task ได้** — รวม Task ที่ทำเพื่อผลลัพธ์เดียวกันไว้ใต้ Feature เดียวกันได้
5. **Feature เป็นหน่วยสำหรับ work log** — เมื่อปิด Task ให้สร้าง/เตรียม log ของ Task นั้นโดยเลือก Objective และ Feature ที่ map ไว้; Feature เดียวมี log จากหลาย Task ได้
6. **ไม่ต้องสร้าง Feature ให้เท่ากับจำนวน Task (ป้องกัน No-Log Feature)** — **ห้ามแตก Feature ยิบย่อยแบบ 1 Feature : 1 Micro-task** เพราะหาก Task นั้นถูกยกเลิกภายหลัง (เช่น โค้ดเดิมรองรับอยู่แล้ว หรือมีมติตัด Scope) จะทำให้ Feature นั้นค้างอยู่ในระบบโดยไม่มี Task มาลง Work Log ให้แตก Feature เป็นกลุ่มผลลัพธ์/Capability Area ที่ครอบคลุมแทน
7. **ถ้า Objective มี 1 Task และ 1 log** → ใช้ Feature เดียวได้
8. **ถ้า Objective มีหลาย Task ที่ทำเพื่อผลลัพธ์เดียวกัน** → รวมไว้ใน Feature เดียว แล้วแสดง Task ที่เกี่ยวข้องเป็นรายการย่อย
9. **การจัดการเมื่อ Task ถูกยกเลิก หรือ Feature ไม่มีงานต้องทำจริง (Scope Change Protocol):**
   - หาก Task ใดไม่จำเป็นต้องทำแล้ว ไม่ต้องลบ Feature ออกจาก Approved Baseline เพื่อรักษาความถูกต้องของแผน
   - ให้บันทึกเป็น **Scope Change / Decision Log** ใน Work Summary ระบุว่า:
     `[Scope Change] Feature <ชื่อ Feature>: ยกเลิก Task <Task Code> เนื่องจาก <เหตุผล เช่น โค้ดเดิมรองรับอยู่แล้ว / ตัด Scope ออกตามมติ> — ไม่มีชั่วโมง Work Log บันทึก`
   - วิธีนี้ช่วยรักษา Planning Accuracy และทำให้ผู้ตรวจเข้าใจว่าทำไม Feature นี้จึงไม่มี Task/ชั่วโมงลง
10. **ตรวจสอบ/แก้ไขให้ใส่ในระดับ Feature** — ไม่ต้องเขียนซ้ำทุก Task และไม่ต้องสร้าง Task ตรวจสอบ/แก้ไขแยก เว้นแต่เป็นงานใหญ่ที่ต้องติดตามแยก
11. **ตรวจสอบ/แก้ไขใช้ `()` ครอบเวลา** เช่น `สร้างตาราง + ตรวจสอบ (0.25) + แก้ไขตามผลตรวจ (0.25) (2.5 ชม.)`
12. **รวมเวลา Objective = ผลรวมเวลาของ Feature ย่อย** — ผลรวมทุก Feature ต้องเท่ากับชั่วโมงที่คาดการณ์ของ Objective
13. **ห้ามเขียนผลลัพธ์ย้อนหลังใน Mission Plan** — ใช้คำว่า `วางแผนตรวจสอบ` และ `แก้ไขตามผลตรวจ` แทนการระบุ bug หรือผล QA ที่ยังไม่เกิด

**กฎเรื่องน้ำหนัก (Weight) — ตามฟอร์ม Create Mission:**
- น้ำหนักของทุกเป้าหมายรวมกัน **ต้องเท่ากับ 100%** เสมอ (ระบบเฉลี่ยอัตโนมัติถ้าไม่กำหนด แต่แนะนำให้กำหนดเองตามความสำคัญ/ปริมาณงานจริง)
- เป้าหมายที่ใช้เวลา/มีผลกระทบมากกว่าควรได้น้ำหนักสูงกว่า — ใช้สัดส่วน **ชั่วโมงที่คาดการณ์ของเป้าหมาย ÷ Total Planned Hours** เป็นฐานในการคำนวณน้ำหนัก แล้วปรับตามความสำคัญเชิงธุรกิจได้
- ถ้าปรับน้ำหนักเป้าหมายใดหลังตั้งค่าแล้ว ต้องปรับเป้าหมายอื่นให้ผลรวมยังคง 100%
- แสดงน้ำหนักในสรุปทุกครั้งที่มีเป้าหมายมากกว่า 1 ข้อ

**Feature ย่อย (Feature Detail) — ใช้แตกเป้าหมายใหญ่เป็นงานย่อยที่ทำได้จริง:**
- แต่ละเป้าหมายสามารถมี Feature ย่อยได้หลายรายการ (เช่น "ออกแบบฐานข้อมูล", "เขียน API", "สร้าง UI Table")
- Feature ย่อยคือรายละเอียดงานภายในเป้าหมาย ไม่ใช่ Kanban task แยก — ใช้เพื่อกระจายงานใหญ่ให้เห็นภาพรวมและช่วยประเมินเวลาได้แม่นยำขึ้น
- ถ้า Feature ย่อยรายการใดมีขนาดใหญ่พอที่จะติดตามแยก ให้พิจารณา map เป็น Kanban task ของตัวเองภายใต้เป้าหมายเดียวกัน

**บทบาท AI vs คน (สำคัญ — มีผลต่อการประเมินเวลา):**

การทำงานในทีม TukDaeng ปัจจุบัน **เน้นใช้ AI ทำงานเป็นหลัก** มนุษย์มีบทบาทเป็นผู้ตรวจสอบและทดสอบ ไม่ใช่ผู้ทำงานหลัก:

| บทบาท | ผู้ทำ | หน้าที่ |
|---|---|---|
| เขียนเอกสาร / แก้เอกสาร spec / แก้ prototype | **AI** | สร้าง/แก้ไขเอกสารหรือ prototype ตามแผน |
| ออกแบบ / วิเคราะห์ / วางแผน | **AI** (เสนอ) + มนุษย์ (ตัดสินใจ) | AI เสนอทาง มนุษย์ยืนยัน |
| ตรวจสอบเอกสาร (review spec) | **มนุษย์** | อ่าน/ตรวจผลลัพธ์ที่ AI ทำ |
| ตรวจสอบ prototype (review UI, เทียบกับ spec) | **มนุษย์** (เป็นหลัก) + AI (ช่วยเตรียม) | มนุษย์ตรวจจริง AI เตรียม checklist |
| แก้ไข / แก้บั๊ก prototype | **AI** (ทำ) + มนุษย์ (ยืนยัน) | AI แก้ มนุษย์ตรวจว่าแก้ถูก |

**ผลต่อการประเมินเวลา:**
- อย่าประเมินเวลาแบบ "คนทำเองทั้งหมด" — จะต่ำเกินไปหรือสูงเกินไปไม่สมจริง
- **งานที่ AI ทำ** (เขียน/แก้เอกสาร, แก้ prototype, สร้างไฟล์) → ประเมินเวลา **น้อยกว่าคนทำเอง** เพราะ AI เร็วกว่า
- **งานที่มนุษย์ทำ** (review spec, ตรวจ prototype, เทียบ spec กับ prototype) → ประเมินตามเวลาจริงของมนุษย์ ไม่ลด
- **งานตรวจสอบ/แก้ไข** → ส่วนใหญ่มนุษย์ตรวจ + AI แก้ → ประเมินรวมทั้ง 2 ส่วน

**กฎการประเมินเวลา:**
- **1 วัน = 8 ชั่วโมงทำงาน** (เวลาทำงานจริงของมนุษย์ในการตรวจสอบ + ทดสอบ + ดูแล AI)
- **งบประมาณชั่วโมงตามแผน (Baseline) = Total Planned Hours เสมอ** — Baseline อิงตามชั่วโมงที่ใส่ ไม่ใช่ Days × 8 โดยตรง
  - ถ้าผู้ใช้ใส่ Total เอง → Total = ค่าที่ใส่, Baseline = Total
  - ถ้าผู้ใช้ไม่ใส่ Total → Total = จำนวนวันใน Mission × 8 ชม. (วันละ 8 ชม. อัตโนมัติ), Baseline = Total
- รวมเวลาของทุกเป้าหมาย (Total Planned Hours) ประเมินตามความจริง (36, 38, 40 ฯลฯ) — Baseline จะปรับตาม Total เสมอ
- **เหลือชั่วโมงให้วางแผน = Baseline − Total = 0 เสมอ** (เพราะ Baseline = Total)
- ประเมินเวลาแต่ละเป้าหมายเป็นชั่วโมง (ทศนิยมได้ เช่น 1.5, 2.25)
- **เวลาที่ประเมิน = เวลาที่มนุษย์ใช้จริง** (รอ AI ทำ + ตรวจ + ทดสอบ) ไม่ใช่เวลาที่ AI ใช้ทำเอกสาร/prototype เพียงอย่างเดียว

**ตารางเวลามาตรฐานตามหมวดหมู่งาน (บังคับ):**

ใช้ตารางนี้เป็นเกณฑ์กลางในการประเมินเวลา **แต่ละ task** และเป็นเกณฑ์ในการตัดสินใจว่า task ไหนต้องแตก subtask:

| หมวดหมู่งาน | เป้าหมาย (ดีมาก) | ห้ามเกิน | กฎการแตก subtask |
|---|---|---|---|
| Requirement | 1 ชม. | 1 ชม. | ถ้าเกิน 1 ชม. → แตกเป็น subtask ย่อย |
| Design | 1 ชม. | 1 ชม. | ถ้าเกิน 1 ชม. → แตกเป็น subtask ย่อย |
| Feature | 2 ชม. | 3 ชม. | ถ้าเกิน 3 ชม. → แตกเป็น subtask ย่อย |
| Bug Fix | 1 ชม. | 1.5 ชม. | ถ้าเกิน 1.5 ชม. → แตกเป็น subtask ย่อย |
| Testing | 1 ชม. | 1 ชม. | ถ้าเกิน 1 ชม. → แตกเป็น subtask ย่อย |
| Refactor | 1-1.5 ชม. | 2 ชม. | ถ้าเกิน 2 ชม. → แตกเป็น subtask ย่อย |
| Documentation | 0.5 ชม. | 0.5 ชม. | ถ้าเกิน 0.5 ชม. → แตกเป็น subtask ย่อย |
| Deploy / DevOps | 1-1.5 ชม. | 2 ชม. | ถ้าเกิน 2 ชม. → แตกเป็น subtask ย่อย |
| Meeting | 1 ชม. | 1.5 ชม. | ถ้าเกิน 1.5 ชม. → แตกเป็น subtask ย่อย |

**กฎการใช้ตาราง:**
- ระบุหมวดหมู่งานของแต่ละ task ก่อนประเมินเวลา (เลือกจากตาราง 9 หมวดใน work-summary skill)
- ประเมินเวลา task ตามหมวดหมู่ — ถ้า task มีหลายหมวดผสมกัน ให้ใช้หมวดที่ครอบคลุมงานหลัก
- **ถ้าเวลาที่ประเมินเกินค่า "ห้ามเกิน" ของหมวดนั้น → ต้องแตกเป็น subtask** จนแต่ละ subtask อยู่ในเกณฑ์
- เวลาของ task รวมทั้ง "ทำ" และ "ตรวจสอบ" — ถ้าตรวจสอบเพิ่มเติมทำให้เกิน ต้องแตก subtask ตรวจสอบแยก
- เวลาของ parent task อาจเป็นยอดรวมที่ระบบบันทึกจาก subtask หรือเป็นเวลาของ parent เอง ต้องตรวจ Description/Activity timeline ก่อนใช้
- ห้ามบวกชั่วโมงของ parent กับ subtask ซ้ำกันใน Mission หรือ Work Summary — ให้เลือกยอด parent หรือรวมเฉพาะ subtask อย่างใดอย่างหนึ่ง

**ตัวอย่างการคำนวณ:**
- Mission 3 วัน → ประเมินเวลา AI ทำงานตามแผนจากรายการงานจริง
- เป้าหมาย 1 (BackOffice, Documentation): 4 tasks × 0.5 ชม. = 2 ชม.
- เป้าหมาย 2 (Prototypes, Testing): 3 tasks × 1 ชม. = 3 ชม.
- เป้าหมาย 3 (Prototypes, Feature): 4 tasks × 2 ชม. = 8 ชม.
- เป้าหมาย 4 (BackOffice, Documentation): 4 tasks × 0.5 ชม. = 2 ชม.
- รวม: 15 ชม. → Total Planned Hours = Baseline = 15 ชม. ✅

**การประเมินชั่วโมงตามความจริง (Baseline = Total เสมอ):**
- **Total Planned Hours = ชั่วโมงที่ประเมินว่างานจริงใช้** — ปรับได้ตามความเป็นจริง (36, 38, 40 ฯลฯ)
- **Baseline = Total เสมอ** — Baseline อิงตามชั่วโมงที่ใส่ ไม่ใช่ Days × 8 โดยตรง
- ตัวอย่าง: งานประเมินจริง 4.5 วัน = 36 ชม. → ใส่ Total = 36 → Baseline = 36, เหลือ = 0
- ตัวอย่าง: ไม่ใส่ Total, Days = 5 → Total = 40 (5 × 8), Baseline = 40, เหลือ = 0
- ถ้าหลังแบ่งเป้าหมายแล้ว Total เกิน Days × 8 → ต้องลดเวลาเป้าหมาย หรือรวมเป้าหมายเล็กเข้าด้วยกัน หรือเพิ่มจำนวนวัน หรือแบ่งเป็น Mission ใหม่
- **คะแนนความแม่นยำในการวางแผน** เทียบ **Total Planned Hours กับชั่วโมงจริงที่ใช้** — ถ้าทำตรงตาม Total Planned Hours จะได้คะแนนเต็ม 100 ถ้าเบี่ยงเบือน (task เกินเวลา, งานนอกแผน) คะแนนจะถูกหัก
- **แนวทางป้องกันงานเกินเวลา (Improvement & Over-Budget Prevention):**
  1. **วิเคราะห์ความซับซ้อนของ Logic ตั้งแต่ต้น (Complexity Discovery):** หากงานมีเงื่อนไขหลายชั้น (เช่น Cooldown, Rolling Quota, Stale Revision, Denial Reasons หลายแบบ หรือ Rollback ข้ามหลาย Store) **ห้ามวางเป็น 1 Task ใหญ่เด็ดขาด** ต้องแตกเป็น Subtask ย่อยที่กระชับ (ไม่เกิน 1–1.5 ชม. ต่อ Task) และวางแผนสร้างฟังก์ชันตรวจเงื่อนไขตรงกลางตั้งแต่แรก
  2. **รองรับความผันผวนของความเร็ว AI (AI Latency & Large Context Overhead):** ในช่วงที่ AI ประมวลผลช้าหรือโปรเจกต์มี Context ขนาดใหญ่ Task ขนาดใหญ่จะมีความเสี่ยงสูงที่จะเกินเวลา การแตก Task ให้เล็กและโฟกัสทีละจุด จะช่วยให้ AI ประมวลผลได้แม่นยำ ไม่หลุด Scope และเสร็จตามเวลาที่วางแผนไว้
  3. **ความเสี่ยง:** ถ้า task ใดเกินเวลา รวมจะเกิน Total Planned Hours ทันที — กรณีนี้ให้ใช้กฎ "ชี้แจงเวลาเกินงบ" ใน work-summary skill (แตกรายละเอียดงานเป็นส่วนย่อย + บล็อกชี้แจง) แทนการกัน buffer ไว้ล่วงหน้า

#### 7. วิเคราะห์ Dependency และลำดับงาน

สำหรับแต่ละแผนให้ระบุ:
- งานที่ต้องทำก่อน
- งานที่รอ Service หรือ API อื่น
- งานที่ทำขนานกันได้
- งานที่อยู่บน critical path และมีผลต่อวันเสร็จของ Mission

ลำดับทั่วไปที่ควรพิจารณา:

```
PRD / ความต้องการ → Module spec (BO/FO) → Prototype → Review/QA → Handoff/Baseline update
```

หากลำดับจริงแตกต่างจากนี้ ให้ระบุเหตุผลในแผน และห้ามนับงานที่ยังเริ่มไม่ได้เป็นงานที่ทำเสร็จแล้ว

#### 8. วิเคราะห์ Risk และแผนรับมือ

อย่างน้อยต้องระบุความเสี่ยงที่สำคัญ 2-3 รายการ เช่น:
- การแก้ prototype กระทบ protected screens (ต้องหยุดและขออนุมัติก่อนแก้)
- เอกสาร spec กับ prototype ไม่ตรงกันหลังแก้
- Cross-reference ระหว่าง module BO/FO ขาดหายหลังเพิ่ม/ลบ section
- Document version/baseline ไม่ได้อัปเดทตามการเปลี่ยนแปลง
- AI เขียนเอกสารไม่ตรง format/convention ของ module ที่มีอยู่

แต่ละ Risk ต้องมีแนวทางรับมือสั้น ๆ และระบุว่าใครเป็นผู้ตรวจสอบ

#### 9. ตรวจสอบ/แก้ไข แจกใส่ในแต่ละ Feature ย่อย

**กฎบังคับ:** "ตรวจสอบ" และ "แก้ไข" ไม่ใช่ฟิลด์แยกที่ระดับเป้าหมาย — แจกใส่ในแต่ละ Feature ย่อย (subtask) แทน เพราะ work log เกิดจาก Task ที่ปิดพร้อมสรุปแล้ว แต่ละ subtask ต้องมี build + ตรวจสอบ + แก้ไข ครบในตัวเอง

**รูปแบบใน Feature ย่อย:**
```
- [<task id>] <งานหลัก> + ตรวจสอบ (<เวลาตรวจสอบ>) + แก้ไข (<เวลาแก้ไข>) (<เวลารวม> ชม.)
```

**ตัวอย่าง:**
```
- [WA-PTO-002a] สร้างตาราง + คอลัมน์ + ข้อมูลตัวอย่าง + ตรวจสอบ (0.25) + แก้ไข (0.25) (2.5 ชม.)
- [WA-PTO-002b] สร้างแถบค้นหา/กรอง + ตรวจสอบ (0.25) + แก้ไข (0.25) (2.5 ชม.)
```

**บทบาท AI vs คน ในตรวจสอบ/แก้ไข:**
- **ตรวจสอบ:** มนุษย์เป็นหลัก (review เอกสารจริง, ตรวจ prototype จริง, เทียบ spec กับ prototype) — AI ช่วยเตรียม checklist ได้ แต่ผลการตรวจต้องมาจากมนุษย์
- **แก้ไข:** AI เป็นหลักในการแก้เอกสาร/prototype — มนุษย์ตรวจว่าแก้ถูกและไม่ทำลายของเดิม (regression)
- เวลาตรวจสอบ = เวลา AI เตรียม ตรวจทาน และรองรับการตรวจรับตามขอบเขต Task/Feature
- เวลาแก้ไข = เวลา AI แก้ตามผลตรวจและตรวจซ้ำจนพร้อมส่งมอบ

> **เหตุผล:** การตรวจสอบและแก้ไขเป็นส่วนหนึ่งของงานเสมอ ไม่ใช่งานเสริม — ต้องวางแผนไว้ตั้งแต่ต้น และรวมอยู่ในเวลา AI ทำงานของ Task/Feature นั้น

ถ้าเป้าหมายใดไม่มีงานตรวจสอบ/แก้ไขจริง (เช่น เป็นงาน decision/ประสานกับ Product ล้วน ไม่มีการแก้ไฟล์) ให้ระบุเหตุผลไว้ใน Feature ย่อย ชัดเจนว่าทำไมไม่มี

#### 10. สรุปแผนเป็นข้อ ๆ แยกตามเป้าหมาย + copy block

หลังวางแผนครบทุกเป้าหมายแล้ว ให้สรุปแผนออกมาเป็นข้อ ๆ จัดกลุ่มตามเป้าหมาย พร้อมเวลา แล้วแสดงเป็น copy block:

> Copy block ในขั้นตอนนี้เป็น **Detailed Mission Plan สำหรับ review ก่อน approval** จึงแสดงรายละเอียด planning ได้เต็มรูปแบบ; หลังผู้ใช้อนุมัติและต้องการจบ planning session ให้สร้าง artifact ใหม่ตาม section 13 แยกต่างหาก

**รูปแบบที่แสดงให้ผู้ใช้:**

```
## สรุปแผนงานใน Mission

### เป้าหมาย 1: <ชื่อเป้าหมาย> (น้ำหนัก <W1>% | รวม <X> ชม.)
- Service: <BackOffice / FrontOffice / Prototypes / ผสม>
- Tasks:
  - <task id 1>
  - <task id 2>
- ผู้รับผิดชอบหลัก: <ชื่อ/อีเมล หรือ ไม่ระบุ>
- รายละเอียด: <ทำอะไร>
- Feature ย่อย:
  - [<task id 1>] <รายละเอียด feature + ตรวจสอบ + แก้ไข> (<เวลา> ชม.)
  - [<task id 2>] <รายละเอียด feature + ตรวจสอบ + แก้ไข> (<เวลา> ชม.)
- Dependency: <หลังเป้าหมายใด>

### เป้าหมาย 2: <ชื่อเป้าหมาย> (น้ำหนัก <W2>% | รวม <Y> ชม.)
- ...

**น้ำหนักรวม:** <W1+W2+...> % (ต้อง = 100%)
**รวมเวลาทั้งหมด (Total Planned Hours):** <X+Y+Z> ชม. (= Baseline)
**เหลือชั่วโมงให้วางแผน:** 0 ชม. (Baseline = Total)
```

**Copy block (ก๊อปไปลงระบบอื่นได้เลย — ใส่น้ำหนัก/ชั่วโมงครบ):**

```text
แผนงาน Mission: <ชื่อ Mission>
วันที่เริ่ม: <YYYY-MM-DD>
วันที่สิ้นสุด: <YYYY-MM-DD>
ระยะเวลา: <N> วัน
งบประมาณชั่วโมงตามแผน (Baseline): <Total> ชม.
จำนวนชั่วโมงทั้งหมดตามแผน: <Total> ชม.
เหลือชั่วโมงให้วางแผน: 0 ชม.

[เป้าหมาย 1] <ชื่อเป้าหมาย> (น้ำหนัก <W1>% | <X> ชม.)
- Service: <Service>
- Tasks:
  - <task id 1>
  - <task id 2>
- ผู้รับผิดชอบหลัก: <ชื่อ/อีเมล หรือ ไม่ระบุ>
- รายละเอียด: <ทำอะไร>
- Feature ย่อย:
  - [<task id 1>] <รายละเอียด feature + ตรวจสอบ + แก้ไข> (<เวลา> ชม.)
  - [<task id 2>] <รายละเอียด feature + ตรวจสอบ + แก้ไข> (<เวลา> ชม.)
- Dependency: <หลังเป้าหมายใด>

[เป้าหมาย 2] <ชื่อเป้าหมาย> (น้ำหนัก <W2>% | <Y> ชม.)
- ...

น้ำหนักรวม: 100%
```

#### 11. Mapping Objective, Feature และ Kanban Task

ต้องเชื่อม Objective กับ Feature และ Task ที่เกี่ยวข้องเพื่อให้ตรวจสอบย้อนกลับได้ โดยใช้โครงสร้าง:

```text
Objective
└── Feature ย่อย
    └── Task ที่เกี่ยวข้อง 1 task หรือหลาย task
```

| Objective | Feature | Service | Kanban task ID | สถานะ |
|---|---|---|---|---|
| <เป้าหมาย 1> | <Feature 1> | <Service> | <task id 1>, <task id 2> | <todo/in_progress/done> |
| <เป้าหมาย 1> | <Feature 2> | <Service> | <task id 3> | <todo/in_progress/done> |
| <เป้าหมาย 2> | <Feature 3> | <Service> | <task id 4>, <task id 5> | <todo/in_progress/done> |

กฎการ map:
- 1 Objective map กับ 1 หรือหลาย Feature
- 1 Feature map กับ 1 task หรือหลาย task ได้ ถ้า Task เหล่านั้นทำเพื่อผลลัพธ์เดียวกัน
- ไม่ต้องสร้าง Feature ใหม่เพียงเพราะมี Task เพิ่ม หากยังเป็นผลลัพธ์เดียวกัน
- ถ้า Feature ยังไม่มี Task รองรับ ให้ระบุว่า **ยังไม่มี task รองรับ** และห้ามสรุป Feature นั้นว่าเสร็จ
- Parent task ที่รวม subtask ต้องแสดงความสัมพันธ์ให้ชัด และห้ามบวกชั่วโมงของ parent กับ subtask ซ้ำกัน

**work log:** เกิดจาก Task ที่สรุปและปิดแล้ว โดยเลือก Objective และ Feature ที่ map กับ Task นั้น; เมื่อสรุปผลให้รวม log ของทุก Task ภายใต้ Feature เดียวกัน

#### 12. ตัวอย่าง Mock-up ฟอร์ม Create Mission

ตัวอย่างนี้แสดงผลลัพธ์ของ skill เมื่อวางแผน Mission ใหม่ให้ตรงกับทุกฟิลด์ในฟอร์ม **สร้างแผนภารกิจใหม่ (Create Mission)** ของ Core Portal (Mission Name, พนักงานผู้รับผิดชอบ, โปรเจกต์, Start/End Date, Planned Days, Baseline, Objectives ที่มีน้ำหนักรวม 100%, Estimated Hours, Assignee ต่อเป้าหมาย และ Feature ย่อย):

```
## แผนงานที่วางแผน

**ชื่อแผนงาน:** พัฒนาระบบแจ้งเตือนลูกค้าเก่า V2
**พนักงานผู้รับผิดชอบ:** Matem (mail.tem.na@gmail.com)
**โปรเจกต์:** BackOffice + Prototypes
**วันที่เริ่ม:** 29/08/2026
**วันที่เสร็จ:** 04/09/2026
**จำนวนวันที่ตามแผน:** 5 วัน
**งบประมาณชั่วโมงตามแผน (Baseline):** 36 ชม. (= Total Planned Hours — ผู้ใช้ใส่ Total = 36, Baseline อิงตาม Total)
**จำนวนชั่วโมงทั้งหมดตามแผน:** 36 ชม. (ประเมินตามความจริง — งานจริงใช้ ~4.5 วัน)
**เหลือชั่วโมงให้วางแผน:** 0 ชม. (Baseline = Total)
**ภาพรวม:** ออกแบบและพัฒนา flow แจ้งเตือนลูกค้าเก่าที่ไม่ได้ใช้งานเกิน 90 วัน พร้อม prototype หน้าตั้งค่าเงื่อนไขแจ้งเตือนใน BO

## ขอบเขต Mission

เป้าหมาย:
- ทำให้แอดมินตั้งค่าเงื่อนไขและดูสถานะการแจ้งเตือนลูกค้าเก่าได้จากหน้า BO

สิ่งที่ต้องส่งมอบ:
- เอกสาร module spec ฟีเจอร์แจ้งเตือนลูกค้าเก่าครบทุก section
- Prototype หน้าตั้งค่าเงื่อนไขแจ้งเตือนและหน้ารายการที่ถูกแจ้งเตือน

สิ่งที่ไม่รวม:
- การเชื่อมต่อระบบส่ง SMS/Email จริง (อยู่นอกขอบเขต Mission นี้)

Acceptance Criteria:
- [ ] เอกสาร spec ครบทุก section ตาม template และผ่านการ review
- [ ] Prototype ตั้งค่าเงื่อนไข + ดูรายการแจ้งเตือน ตรงกับ spec ทุกจุด
- [ ] QA checklist ผ่านครบและไม่กระทบ protected screens

## สรุปแผนงานใน Mission

### เป้าหมาย 1: เป้าหมายการวางแผน mission (น้ำหนัก 3% | รวม 1 ชม.)
- Service: BackOffice + Prototypes
- Tasks:
  - TK-400
- ผู้รับผิดชอบหลัก: Matem
- รายละเอียด: คุยความต้องการ/ศึกษาขอบเขตงาน อธิบาย scope และ acceptance criteria เตรียมแผน mission และ mapping กับ Kanban task
- Feature ย่อย:
  - [TK-400] ศึกษาความต้องการ + กำหนดขอบเขต/สิ่งที่ไม่รวม + เตรียมแผนและ mapping + ยืนยันขอบเขตกับผู้ใช้ (1 ชม.)
- Dependency: ไม่มี (เริ่มก่อนเสมอ)

### เป้าหมาย 2: ออกแบบเงื่อนไขและฐานข้อมูลแจ้งเตือน (น้ำหนัก 22% | รวม 8 ชม.)
- Service: BackOffice
- Tasks:
  - TK-401
- ผู้รับผิดชอบหลัก: Matem
- รายละเอียด: ออกแบบเงื่อนไข "ลูกค้าเก่าไม่ใช้งานเกิน N วัน" และ schema ตาราง notification_rule
- Feature ย่อย:
  - [TK-401] ออกแบบเงื่อนไข + ออกแบบฐานข้อมูล + กำหนดตัวแปรที่ตั้งค่าได้ + ตรวจสอบเทียบ requirement (1) + แก้ไข field/ความสัมพันธ์ตาราง (2) (8 ชม.)
- Dependency: หลังเป้าหมาย 1

### เป้าหมาย 3: เขียน Module Spec ฟีเจอร์แจ้งเตือนลูกค้าเก่า (น้ำหนัก 15% | รวม 5 ชม.)
- Service: BackOffice
- Tasks:
  - TK-402
- ผู้รับผิดชอบหลัก: Matem
- รายละเอียด: เขียนเอกสาร spec ครบทุก section และอัปเดต index/baseline/version
- Feature ย่อย:
  - [TK-402] เขียน section Overview/Flow + Field/Validation + อัปเดตการอ้างอิงข้ามเอกสาร + ตรวจสอบเทียบ template (1) + แก้ไขการอ้างอิงข้ามเอกสารและรูปแบบ (1) (5 ชม.)
- Dependency: หลังเป้าหมาย 2

### เป้าหมาย 4: สร้าง Prototype หน้าตั้งค่าเงื่อนไข + รายการแจ้งเตือน (น้ำหนัก 33% | รวม 12 ชม.)
- Service: Prototypes
- Tasks:
  - TK-403
  - TK-404
- ผู้รับผิดชอบหลัก: Matem
- รายละเอียด: สร้างหน้า Settings เงื่อนไขแจ้งเตือน และหน้า List ลูกค้าที่ถูกแจ้งเตือนแล้ว
- Feature ย่อย:
  - [TK-403] สร้างฟอร์มตั้งค่าเงื่อนไข + ข้อมูลตัวอย่าง + ตรวจสอบ (1.5) + แก้ไข (1) (6 ชม.)
  - [TK-404] สร้างตารางรายการแจ้งเตือน + ข้อมูลตัวอย่าง + ตรวจสอบ (1.5) + แก้ไข (1) (6 ชม.)
- Dependency: หลังเป้าหมาย 3

### เป้าหมาย 5: QA รวมและปิด Mission (น้ำหนัก 27% | รวม 10 ชม.)
- Service: ผสม (BackOffice + Prototypes)
- Tasks:
  - TK-405
- ผู้รับผิดชอบหลัก: Matem
- รายละเอียด: ตรวจ spec กับ prototype ให้ตรงกันทั้งหมด และ sync คำศัพท์/field
- Feature ย่อย:
  - [TK-405] เทียบ spec กับ prototype + ตรวจการอ้างอิงข้ามเอกสารรอบสุดท้าย + ตรวจสอบ QA checklist + document version (4) + แก้ไขความคลาดเคลื่อนรอบสุดท้าย (2) (10 ชม.)
- Dependency: หลังเป้าหมาย 4

**น้ำหนักรวม:** 100% (3% + 22% + 15% + 33% + 27%)
**รวมเวลาทั้งหมด (Total Planned Hours):** 36 ชม. (= Baseline)
**เหลือชั่วโมงให้วางแผน:** 0 ชม. (Baseline = Total)
```

**Copy block (ก๊อปไปลงระบบอื่นได้เลย — ใส่น้ำหนัก/ชั่วโมงครบ):**

```text
แผนงาน Mission: พัฒนาระบบแจ้งเตือนลูกค้าเก่า V2
พนักงานผู้รับผิดชอบ: Matem (mail.tem.na@gmail.com)
โปรเจกต์: BackOffice + Prototypes
วันที่เริ่ม: 2026-08-29
วันที่เสร็จ: 2026-09-04
ระยะเวลา: 5 วัน
งบประมาณชั่วโมงตามแผน (Baseline): 36 ชม.
จำนวนชั่วโมงทั้งหมดตามแผน: 36 ชม.
เหลือชั่วโมงให้วางแผน: 0 ชม.

[เป้าหมาย 1] เป้าหมายการวางแผน mission (น้ำหนัก 3% | 1 ชม.)
- Service: BackOffice + Prototypes
- Tasks:
  - TK-400
- ผู้รับผิดชอบหลัก: Matem
- รายละเอียด: คุยความต้องการ/ศึกษาขอบเขตงาน อธิบาย scope และ acceptance criteria เตรียมแผน mission และ mapping กับ Kanban task
- Feature ย่อย:
  - [TK-400] ศึกษาความต้องการ + กำหนดขอบเขต/สิ่งที่ไม่รวม + เตรียมแผนและ mapping + ยืนยันขอบเขตกับผู้ใช้ (1 ชม.)
- Dependency: ไม่มี

[เป้าหมาย 2] ออกแบบเงื่อนไขและฐานข้อมูลแจ้งเตือน (น้ำหนัก 22% | 8 ชม.)
- Service: BackOffice
- Tasks:
  - TK-401
- ผู้รับผิดชอบหลัก: Matem
- รายละเอียด: ออกแบบเงื่อนไขลูกค้าเก่าไม่ใช้งานเกิน N วัน และ schema ตาราง notification_rule
- Feature ย่อย:
  - [TK-401] ออกแบบเงื่อนไข + ออกแบบฐานข้อมูล + กำหนดตัวแปรที่ตั้งค่าได้ + ตรวจสอบเทียบ requirement (1) + แก้ไข field/ความสัมพันธ์ตาราง (2) (8 ชม.)
- Dependency: หลังเป้าหมาย 1

[เป้าหมาย 3] เขียน Module Spec ฟีเจอร์แจ้งเตือนลูกค้าเก่า (น้ำหนัก 15% | 5 ชม.)
- Service: BackOffice
- Tasks:
  - TK-402
- ผู้รับผิดชอบหลัก: Matem
- รายละเอียด: เขียนเอกสาร spec ครบทุก section และอัปเดต index/baseline/version
- Feature ย่อย:
  - [TK-402] เขียน section Overview/Flow + Field/Validation + อัปเดตการอ้างอิงข้ามเอกสาร + ตรวจสอบเทียบ template (1) + แก้ไขการอ้างอิงข้ามเอกสารและรูปแบบ (1) (5 ชม.)
- Dependency: หลังเป้าหมาย 2

[เป้าหมาย 4] สร้าง Prototype หน้าตั้งค่าเงื่อนไข + รายการแจ้งเตือน (น้ำหนัก 33% | 12 ชม.)
- Service: Prototypes
- Tasks:
  - TK-403
  - TK-404
- ผู้รับผิดชอบหลัก: Matem
- รายละเอียด: สร้างหน้า Settings เงื่อนไขแจ้งเตือน และหน้า List ลูกค้าที่ถูกแจ้งเตือนแล้ว
- Feature ย่อย:
  - [TK-403] สร้างฟอร์มตั้งค่าเงื่อนไข + ข้อมูลตัวอย่าง + ตรวจสอบ (1.5) + แก้ไข (1) (6 ชม.)
  - [TK-404] สร้างตารางรายการแจ้งเตือน + ข้อมูลตัวอย่าง + ตรวจสอบ (1.5) + แก้ไข (1) (6 ชม.)
- Dependency: หลังเป้าหมาย 3

[เป้าหมาย 5] QA รวมและปิด Mission (น้ำหนัก 27% | 10 ชม.)
- Service: ผสม
- Tasks:
  - TK-405
- ผู้รับผิดชอบหลัก: Matem
- รายละเอียด: ตรวจ spec กับ prototype ให้ตรงกันทั้งหมดและ sync คำศัพท์/field
- Feature ย่อย:
  - [TK-405] เทียบ spec กับ prototype + ตรวจการอ้างอิงข้ามเอกสารรอบสุดท้าย + ตรวจสอบ QA checklist + document version (4) + แก้ไขความคลาดเคลื่อนรอบสุดท้าย (2) (10 ชม.)
- Dependency: หลังเป้าหมาย 4

น้ำหนักรวม: 100%
```

> หมายเหตุ: ตัวเลข task id (TK-4xx) ในตัวอย่างนี้เป็นค่าสมมติเพื่อสาธิตรูปแบบเท่านั้น เวลาใช้งานจริงต้อง map กับ task id จริงจาก `kanban-tukdaeng`

#### 13. Mission Approval / Session End Workflow

ส่วนนี้ใช้เมื่อ **Mission Planning เสร็จ** และผู้ใช้ **อนุมัติ Mission Plan อย่างชัดเจน** ห้ามอนุมาน approval จากการที่ผู้ใช้เพียงอ่านแผนหรือขอแก้ไขแผน หลัง approval ให้สร้าง Mission Plan Summary และ Session Handoff เป็นสอง artifact แยกกันก่อนเริ่ม implementation; หากผู้ใช้ต้องการจบ planning session ให้บันทึก Handoff และจบ session ตาม flow ด้านล่าง

```text
Mission Planning Complete
→ User Approval
→ Approved Mission Baseline
→ Generate Mission Plan Summary Copy Block
→ Generate/Update Session Handoff
→ Display ทั้งสอง artifact แยกกัน
→ End Planning Session
```

- ห้ามเริ่ม implementation Task, ย้าย Task เป็น `in_progress` หรือเริ่ม timer โดยอัตโนมัติ
- ถ้าผู้ใช้ยังไม่อนุมัติ ให้แสดง Draft Mission Plan/ฉบับแก้ไขตาม workflow เดิม และยังไม่เรียก output ว่า Approved
- หลังได้รับ approval ให้สร้างและแสดงทั้ง Mission Plan Summary และ Session Handoff ก่อนเสมอ แม้ผู้ใช้จะเลือกทำงานต่อใน session เดิม
- เมื่อมีทั้งสอง artifact ในคำตอบเดียวกัน ต้องแยก heading และ code block ชัดเจน ห้ามรวมเนื้อหาเป็น block เดียว
- หากผู้ใช้ขอจบ session ให้บันทึก **Session Handoff** ผ่าน `save_session_note` เมื่อเครื่องมือพร้อม; การบันทึกนี้เป็น task/session context ภายใน Kanban ไม่ใช่การส่ง Work Log เข้า Core Portal

##### 13.1 Mission Plan Summary Copy Block — สำหรับ Work Log

Mission Plan Summary เป็นสรุปภาพรวม Approved Mission Baseline สำหรับคนทั่วไปอ่านย้อนหลัง ไม่ใช่ technical handoff และไม่ใช่ Work Summary หลัง implementation

**ข้อมูลขั้นต่ำที่ต้องมี:**
- Mission Name
- Planned Duration และ Planned Start/End ถ้ามี
- Total Planned Hours/Baseline
- Objective → Feature → Task Mapping
- Objective Weight และ Planned Hours ต่อ Objective
- Planned Hours ของแต่ละ Task
- Execution Sequence

**Task Display Rule (บังคับ):**
- แสดง Task ด้วย business-facing task code + ชื่อเต็ม + Planned Hours เช่น `AIL-002 กำหนด Invitation Lifecycle และ Security Contract — 1 ชม.`
- ห้ามแสดงรูปแบบ `AIL-002 [51ffcda4]`
- ห้ามแสดง Kanban UUID, partial UUID, database ID หรือ internal task/mission identifier อื่นใดใน Mission Plan Summary
- ถ้า Task ไม่มี business-facing code ให้ใช้ชื่อ Task อย่างเดียว ห้ามแทนด้วย UUID
- Feature ต้องอยู่ติดกับ Task ที่ map อยู่ใต้ Feature นั้น ห้ามแยก Feature และ Task เป็นคนละรายการจนมอง mapping ไม่ออก
- ชื่อ Objective และ Feature ใน Summary ต้องเป็นชื่อ label สั้นตาม Naming Rules — ห้ามต่อ scope/behavior/AC ยาว ๆ ไว้ในชื่อ ถ้าต้องอธิบาย Feature ให้ใช้ field แยก (เช่น `Scope: ...`)

**รูปแบบ Mission Plan Summary Copy Block:**

```text
Mission <number>: <Mission Name>

ระยะเวลาแผน: <human-readable date range> (<duration>)
เวลาตามแผนทั้งหมด: <total planned hours>

เป้าหมาย 1: <Objective Name>

เวลาตามแผน: <objective planned hours> (<objective weight>%)

Feature: <Feature Name>

- <TASK-CODE> <Task Name> — <task planned hours>

Feature: <Feature Name>

- <TASK-CODE> <Task Name> — <task planned hours>
- <TASK-CODE> <Task Name> — <task planned hours>

เป้าหมาย 2: <Objective Name>

ใช้ structure เดียวกันต่อจนครบทุก Objective

ลำดับการดำเนินงาน

<TASK> → <TASK> → <TASK>
```

**Mission Summary Copy Experience Rules:**
- หนึ่ง Mission Summary ต้องอยู่ใน `text` code block เดียว เพื่อให้กด Copy แล้วนำไปวางใน Google Docs ได้ทันที
- คง hierarchy ทางข้อมูล Mission → Objective → Feature → Task ด้วยลำดับข้อความและช่องว่าง โดยไม่ใช้ Markdown heading (`#`, `##`, `###`), bold, inline code หรือ horizontal rule
- Task ต้องอยู่ใต้ Feature ที่ map จริง และแสดงเป็น `<TASK-CODE> <Task Name> — <task planned hours>` โดยไม่ครอบ Task Code ด้วย backtick
- รายการทุกข้อใน Copy Block ต้องขึ้นต้นด้วย literal `- ` ภายใน `text` code block; ห้ามใช้ `*` หรือรูปแบบที่ UI render เป็น bullet symbol `•`
- วันที่ให้ใช้รูปแบบ human-readable เมื่อทำได้โดยไม่เปลี่ยนค่าจริง เช่น `21–23 ก.ย. 2026 (3 วัน)`
- แสดง Planned Time ครบ 3 ระดับ: Total Planned Hours ของ Mission, Planned Hours + Weight ของ Objective และ Planned Hours ของ Task แต่ละตัว
- ชั่วโมงใน Summary แสดงครั้งเดียวแบบอ่านง่าย: `30 นาที`, `<N> ชม.` หรือ `<N> ชม. <M> นาที`; ห้ามแสดง `1 ชม. 0 นาที`, decimal hours ภาษาอังกฤษ หรือค่าซ้ำแบบ `2 ชม. 30 นาที (2.5 ชม.)`
- ถ้า Task อยู่ stage เดียวกันหรือทำคู่ขนาน ให้คั่นด้วย `/` ในลำดับ เช่น `AIL-004 → AIL-005 / AIL-006 → AIL-007`
- ชื่อ Mission, Objective และ Feature ปรับ wording ให้เหมาะกับงานจริงได้ แต่ Mission Scope, Task Code/Task Name, mapping, Weight, Planned Hours, Duration และ Execution Sequence ต้องตรง Approved Mission Plan
- Mission Plan Summary เป็น Planning Log: ห้ามแสดง Actual Hours, Actual QA Result, Implementation Result หรือ Session Handoff technical context
- เนื้อหาสำคัญทั้งหมดต้องอยู่ใน Copy Block เดียว; ข้อความนอก Block มีได้เพียงคำอธิบายสั้น ๆ และห้ามแยกส่วนของ Summary ออกไปไว้ภายนอก
- ห้ามเพิ่ม technical handoff, Full/Partial Kanban UUID, Database ID หรือ Internal Identifier ลงใน Summary

Summary ต้องเป็น forward-looking Approved Plan เท่านั้น ห้ามใส่ actual hours, Activity timeline, Evidence, ผล QA หรือรายละเอียด implementation ที่เกิดขึ้นภายหลัง

##### 13.2 Session Handoff — สำหรับ Agent / Session ถัดไป

Session Handoff เป็น execution context หลักสำหรับทำงานข้าม session และต้อง self-contained พอให้ Agent เริ่มจาก current state ได้อย่างปลอดภัย

**ข้อมูลที่ต้องคงไว้ตามความเกี่ยวข้อง:**
- Mission/Requirement identifiers และ planning status
- Approved Business Baseline
- Scope, Out of Scope, Deliverables และ Mission Boundaries
- Objectives, Features, Tasks และ internal Kanban IDs เมื่อจำเป็น
- Dependencies และ approved execution order
- Acceptance Criteria
- Risks และ Open Items
- Protected Scope และ approval constraints
- Requirement Traceability
- Duplicate/Existing Work considerations
- Current Kanban State รวม task status และ active timer
- Next executable Task
- Next Session instructions รวม tool/context ที่ต้องโหลดและเงื่อนไขก่อน `move_task → in_progress`

**กฎ Handoff:**
- Handoff สามารถมี Kanban UUID/internal IDs ได้ เพราะใช้ให้ Agent resolve entity ถูกต้อง
- ห้ามตัด technical/internal context ออกจาก Handoff เพียงเพราะข้อมูลบางส่วนมีใน Mission Plan Summary แล้ว
- ระบุชัดว่า Task ถัดไปคืออะไร, Task ใดห้ามเริ่ม และ implementation เริ่มได้เมื่อไร
- ถ้ายังไม่มี Task เริ่ม ให้ยืนยัน `in_progress = 0`, ไม่มี timer ทำงาน และ implementation ยังไม่เริ่ม
- ถ้าผู้ใช้กำหนด task-by-task approval gate ให้เก็บ gate นั้นไว้ใน Handoff

##### 13.3 Next Session Workflow

Mission Plan Summary ไม่ใช่ execution context หลัก การเริ่ม Execute Mission ต้องอ้าง Session Handoff:

```text
Session Handoff
+ User Start Task Prompt
→ Load Project/Kanban Context
→ Load Mission / Requirement / Next Task
→ Verify current state, Scope, Acceptance Criteria และ Dependencies
→ move_task → in_progress เพื่อเริ่ม auto-timer เมื่อได้รับอนุญาต
→ Execute เฉพาะ Task ตาม approved order
```

- ห้ามกำหนดให้ผู้ใช้ต้องนำ Mission Plan Summary Copy Block มาใช้แทน Session Handoff
- ห้ามเริ่ม Task ถัดไปอัตโนมัติหลังสร้าง Summary/Handoff หรือหลังจบ planning session

### กฎสำคัญส่วนที่ 1

- ⚠️ **ห้ามส่ง log/อัปเดตระบบภายนอกใด ๆ** — แค่วางแผนและแสดง copy block
- **การวางแผน Mission ไม่ใช่ Objective บังคับ** — บันทึก planning record แยกได้ แต่ไม่ต้องนับเป็น Objective ของ Mission เว้นแต่ผู้ใช้ระบุว่าการวางแผนเป็น deliverable
- **รูปแบบ Objective/Feature/Task (บังคับ):**
  - Tasks เป็นลิสข้อ ๆ ลงมา ไม่ใช่ `,` หรือ `+` คั่นบรรทัดเดียว
  - รายละเอียดของ Objective ไม่ใส่ชั่วโมง — เวลารวมอยู่ใน Feature ย่อยแล้ว
  - Feature ย่อยต้องเป็นผลลัพธ์ย่อยของ Objective และเขียนเป็นภาษาที่เข้าใจง่าย
  - 1 Feature map กับ 1 task หรือหลาย task ได้ ถ้า Task เหล่านั้นทำเพื่อผลลัพธ์เดียวกัน
  - ไม่ต้องสร้าง Feature ใหม่เพียงเพราะมี Task เพิ่ม หากยังเป็นผลลัพธ์เดียวกัน
  - Feature เป็นหน่วยสำหรับ work log; เมื่อปิด Task ให้สร้าง/เตรียม log ของ Task นั้นโดยเลือก Objective และ Feature ที่ map ไว้
  - ตรวจสอบ/แก้ไขแจกใส่ในระดับ Feature ไม่ต้องเขียนซ้ำทุก Task และไม่ต้องสร้าง Task ตรวจสอบ/แก้ไขแยก เว้นแต่เป็นงานใหญ่ที่ต้องติดตามแยก
  - ตรวจสอบ/แก้ไขใช้ `()` ครอบเวลาในรายละเอียด Feature
  - Mission Plan ต้องใช้ภาษาของงานที่วางแผนจะทำ ห้ามใส่ bug หรือผล QA ที่เกิดขึ้นภายหลัง
- **ภาษาใน copy block (บังคับ):** ใช้ภาษาเข้าใจง่าย — เปลี่ยนคำโค้ด/เทคนิคที่คนทั่วไปไม่เข้าใจเป็นคำเข้าใจง่าย แต่คำเฉพาะ/ศัพท์ที่คุ้นเคย (เช่น breadcrumb, Alert, asset, spec, baseline, Kanban) เก็บไว้ได้ ไม่บังคับล้วนไทย — ห้ามใช้ชื่อฟังก์ชัน/ชื่อโค้ด (เช่น `renderWatchAlertList()`, `mock data`, `status badge`, `soft delete`, `cross-reference`, `viewport`) ใน copy block
- รวมเวลาทุกเป้าหมาย (Total Planned Hours) ประเมินตามความจริง (36, 38, 40 ฯลฯ) — **Baseline = Total เสมอ** ค่า "เหลือชั่วโมงให้วางแผน" = 0 เสมอ (Baseline อิงตาม Total ไม่ใช่ Days × 8 โดยตรง)
- น้ำหนัก (Weight) ของทุกเป้าหมายรวมกันต้องเท่ากับ 100% เสมอ
- จำนวนวันต่อ Mission: ขั้นต่ำ 1 วัน ไม่เกิน 5 วัน
- ถ้าแผนเกิน 5 วัน ให้แบ่งเป็น Mission ใหม่ ไม่ปรับลดเวลาโดยไม่มีเหตุผล
- ⚠️ **ห้ามแก้แผนหลัง start Mission โดยไม่มีเหตุผล** — เมื่อ Mission เริ่มดำเนินการแล้ว (มี task เป็น in_progress แล้ว) ห้ามแก้ไขเป้าหมาย/น้ำหนัก/ชั่วโมง ถ้าจำเป็นต้องแก้ ต้องระบุเหตุผลชัดเจน เช่น requirement เปลี่ยน / พบงานบล็อก / scope เปลี่ยน และต้องแจ้งผู้ใช้ก่อน
- **คะแนนความแม่นยำในการวางแผน (Planning Accuracy Score):** ระบบประเมินความแม่นยำของแผนเทียบกับการทำจริง — ถ้าทำตรงตามแผนทุกเป้าหมาย (เวลาจริง = เวลาที่วางแผน ไม่มี task เกิน/ต่ำกว่าแผน) จะได้ **100 คะแนนเต็ม** ถ้าเบี่ยงเบือนจากแผน (task เกินเวลา, งานนอกแผนเกิดขึ้น, ต้องแก้แผนระหว่างทำ) คะแนนจะถูกหัก คะแนนนี้มีผลต่อการประเมินเกรดการทำงาน ดังนั้นต้องวางแผนให้แม่นยำที่สุดตั้งแต่ต้น และพยายามทำตรงตามแผน
- ถ้าผู้ใช้ขอแก้ไข Mission/แผน → แก้ไขแล้วแสดง copy block ใหม่
- หลังผู้ใช้อนุมัติ Mission Plan → สร้าง **Mission Plan Summary Copy Block** และ **Session Handoff** แยกกันตาม section 13; ถ้าผู้ใช้ต้องการจบ planning session ให้ persist Handoff แล้วหยุด
- Mission Plan Summary ใช้สำหรับ Work Log และห้ามมี Kanban UUID/internal ID; Session Handoff ใช้สำหรับ Agent และคง internal IDs/technical context ได้
- การสร้าง approval artifacts ไม่อนุญาตให้เริ่ม implementation, ย้าย Task เป็น `in_progress` หรือเริ่ม timer
- ถ้ามีงานเพิ่มนอก Scope → แยกเป็นงานนอกขอบเขตและเสนอ Mission ใหม่
- ⚠️ **Protected screens:** ถ้าแผนมีโอกาสกระทบ protected screens (ตาม `AGENTS.md` และ `PROTECTED_SCREENS.md`) ต้องระบุในเป้าหมายว่าจะตรวจสอบอย่างไร และต้องหยุดขออนุมัติก่อนแก้ ห้ามแก้ protected screens โดยไม่ได้รับอนุมัติจากผู้ใช้
- **Kanban task style & Naming format:** ถ้าต้องสร้าง task ใหม่ในแผน (`create_task`) หรือแสดงใน Mission Plan / Summary / Kanban:
  - **ชื่อ Task ต้องอยู่ในรูปแบบ `<Task-Code> <Task Name>` เสมอ** เช่น `AIL-019 Design forgot/reset contract`, `RP-014 สร้าง flow ปิด Custom Role` โดยมีรหัส Task ที่คนอ่านเข้าใจง่ายนำหน้า ตามด้วยชื่อเนื้อหางานที่กระชับ
  - **ห้ามใช้เฉพาะ UUID / Internal ID ของระบบเป็นชื่อ Task เด็ดขาด** เพราะอ่านยากและไม่สื่อความหมาย
  - เขียนเนื้อหา Task เป็น complete execution brief ตามรูปแบบใน `AGENTS.md` (ภาษาไทย เก็บศัพท์เทคนิคภาษาอังกฤษ) และใช้ Kanban Completion Rule: ห้ามย้าย task ไป `done` จนกว่าผู้ใช้ยืนยันว่าผลลัพธ์ OK
  - **Task Description ต้องมีบรรทัด Planned เสมอทุกหมวด:** `Category: <หมวด> | Planned: <X> ชม. (Category Max <Y> ชม.)` โดย Y = ค่า "ห้ามเกิน" ของหมวดนั้นจากตารางเวลามาตรฐาน — ห้ามใส่เฉพาะบางหมวด (เช่นเฉพาะ Testing) เพราะระบบเช็ก Time Ratio (เวลาจริงเทียบเป้าหมาย > 1.5 → ติด review) จาก Planned นี้; task ที่ไม่มี Planned เทียบ ratio ไม่ได้และเสี่ยงติด review เงียบ ๆ ตอนเวลาจริงเกิน — ประเมิน Planned ให้สมจริง ห้ามตั้งต่ำกว่าความเป็นจริงเพื่อให้ดู "ในงบ"
- **Objective และ Feature ไม่ใช่ Task:** Objective เป็นผลลัพธ์หลัก, Feature เป็นผลลัพธ์ย่อย และ Task เป็นงานที่ใช้ลงมือทำ/ลง log — 1 Objective map กับหลาย Feature ได้ และ 1 Feature map กับหลาย Task ได้
- **การตรวจสอบและแก้ไขอยู่ใน Feature:** วางแผนไว้ใน Feature เดียวกับงานหลัก ไม่ต้องสร้าง Task ตรวจสอบ/แก้ไขแยก เว้นแต่มีขนาดใหญ่หรือจำเป็นต้องติดตามเป็นงานอิสระ

---

## ส่วนที่ 2: สรุปผลหลังทำตามแผน (Work Summary)

### เป้าหมาย
- หลังทำตามแผนในส่วนที่ 1 แล้ว ให้สรุปว่า **ในแต่ละเป้าหมายได้ทำอะไรลงไปบ้าง**
- สรุปเป็นข้อ ๆ แยกตามเป้าหมาย พร้อม log การทำงานรวมจากทุก task ในเป้าหมาย

### ขั้นตอน

#### 1. เรียกข้อมูลจาก kanban-tukdaeng MCP

```
# ดูเครื่องมือทั้งหมดก่อน (ทุกครั้ง)
mcp_list_tools(server_name="kanban-tukdaeng")

# ดู board ปัจจุบัน เพื่อเห็น task ที่ทำเสร็จ/ยังทำอยู่
mcp_call_tool(server_name="kanban-tukdaeng", tool_name="get_board", arguments={})

# ดึงรายละเอียดเต็มและ Activity timeline ของ task DONE ที่เกี่ยวข้องทุก task
mcp_call_tool(
  server_name="kanban-tukdaeng",
  tool_name="get_task",
  arguments={"task_id": "<task id>"}
)

# สรุปชั่วโมงทำงานของ task DONE ในวัน/ช่วงที่ทำ
mcp_call_tool(
  server_name="kanban-tukdaeng",
  tool_name="get_time_summary",
  arguments={
    "date": "<YYYY-MM-DD>",
    "tz": "Asia/Bangkok",
    "status": "done"
  }
)
```

**ใช้ข้อมูลที่ได้เพื่อ:**
- เห็น task ที่ทำเสร็จ (DONE) และยังค้าง (in_progress/todo) จาก `get_board`
- เห็นชั่วโมงที่ใช้จริงจาก `get_time_summary` (เปรียบเทียบกับแผนในส่วนที่ 1)
- ถ้ามีส่วน `analysis` ใน `get_time_summary` flag task ที่ชั่วโมงต่ำเกินไป → แสดงให้ผู้ใช้เห็น
- เปรียบเทียบ task จริงกับ Scope, Acceptance Criteria และ Mapping ที่วางไว้
- ใช้ Description และ Activity timeline จาก `get_task` เป็นแหล่งข้อมูลหลักในการสรุปว่าทำอะไรลงไปจริง

#### 2. ตรวจสอบงานที่ AI ทำและรวบรวม Evidence

ก่อนสรุปว่างานเสร็จ ต้องตรวจสอบอย่างน้อย:

- AI แก้ไฟล์และ format ตรงกับ module spec ที่มีอยู่
- ไม่มีการแก้ข้ามขอบเขตโดยไม่แจ้ง โดยเฉพาะ protected screens
- cross-reference ระหว่าง module ยังครบ ไม่ขาดหาย
- document version/baseline อัปเดตตามการเปลี่ยนแปลง
- ถ้าเกี่ยวกับ prototype ต้องตรวจว่าไม่กระทบ protected screens
- ผลตรวจต้องมาจากการตรวจจริงของมนุษย์ ไม่ใช่คำกล่าวอ้างของ AI

**Evidence ที่ควรบันทึกในสรุป:**
- ไฟล์หรือ section สำคัญที่แก้
- prototype screen หรือ flow ที่ตรวจ
- ผล QA checklist และ cross-reference check
- ผลเทียบ spec กับ prototype (ถ้าเกี่ยวข้อง)
- protected screens ที่กระทบ (ถ้ามี)
- งานที่ยังไม่มีหลักฐานหรือยังต้องตรวจเพิ่ม

ถ้าไม่มี Evidence เพียงพอ ให้ใช้สถานะ **บางส่วน** หรือ **รอตรวจสอบ** แทน **เสร็จ**

**Submission Evidence ต่อเป้าหมาย (บังคับเมื่อเป้าหมายเสร็จ):**
- เมื่อเป้าหมายใดทำครบทุก Task แล้ว (สถานะ `เสร็จ`) ให้เตรียม **หลักฐานส่งตรวจรับด้วย AI** ของเป้าหมายนั้นตาม skill `submission-evidence` — ครอบการเลือกไฟล์แนบ/ภาพหน้าจอ, นโยบายช่อง URL, คำอธิบายภาษาเข้าใจง่าย และ copy block สำหรับฟอร์มส่งตรวจ
- ใส่ชื่อไฟล์แนบ/แพ็กเกจหลักฐานไว้ในหัวข้อ "หลักฐาน" ของเป้าหมายนั้นในสรุปผล ด้วย — เพื่อให้ log มีหลักฐานพร้อมส่งครบทุกเป้าหมาย
- เป้าหมายที่ยังไม่ครบห้ามสร้างหลักฐานแบบ "เสร็จ" — ระบุสถานะ `บางส่วน`/`รอตรวจสอบ` และบอกว่าหลักฐานจะจัดเมื่อเป้าหมายครบ

#### 3. สรุปผลเป็นข้อ ๆ แยกตามเป้าหมาย + copy block

สรุปว่าในแต่ละเป้าหมาย (จากส่วนที่ 1) ได้ทำอะไรลงไปบ้าง — เปรียบเทียบกับแผนที่วางไว้ และรวม log การทำงานจากทุก task ในเป้าหมาย:

**รูปแบบที่แสดงให้ผู้ใช้:**

```
## สรุปผลงานตามแผน

### เป้าหมาย 1: <ชื่อเป้าหมาย>
- Service: <BackOffice / FrontOffice / Prototypes / ผสม>
- Tasks:
  - <task id 1>
  - <task id 2>
- รายละเอียดที่ทำ:
  - <สิ่งที่ทำจริง>
  - <ผลลัพธ์ที่ได้>
- log การทำงาน (รวมจากทุก task):
  - [<task id 1>] [<วันที่เวลา>] Note: <รายละเอียด>
  - [<task id 1>] [<วันที่เวลา>] Status: <รายละเอียด>
  - [<task id 2>] [<วันที่เวลา>] Note: <รายละเอียด>
- หลักฐาน: <ไฟล์/section/prototype/QA checklist ที่เกี่ยวข้อง>

### เป้าหมาย 2: <ชื่อเป้าหมาย>
- ...

**เปรียบเทียบกับแผน:**
- เวลาที่วางแผน: <X> ชม. | ใช้จริง: <Y> ชม. (จาก get_time_summary)
- เป้าหมายที่เสร็จตามแผน: <N>/<ทั้งหมด>
- เป้าหมายที่ยังค้าง: <รายการ>

**ผล Acceptance Criteria:**
- [ผ่าน/ไม่ผ่าน/รอตรวจ] <เงื่อนไขที่ 1>
- [ผ่าน/ไม่ผ่าน/รอตรวจ] <เงื่อนไขที่ 2>

**Evidence:**
- ไฟล์/ส่วนสำคัญที่แก้: <รายการ>
- Section/prototype ที่ตรวจ: <รายการ>
- ผล QA checklist/cross-reference: <ผลลัพธ์>
- Protected screens ที่กระทบ: <ไม่มี / ระบุ>
```

**Copy block (ก๊อปไปลงระบบอื่นได้เลย — ใส่น้ำหนัก/ชั่วโมง วางแผน vs ใช้จริง ครบ):**

```text
สรุปผล Mission: <ชื่อ Mission>
วันที่: <YYYY-MM-DD> - <YYYY-MM-DD>
งบประมาณชั่วโมงตามแผน (Baseline): <N×8> ชม.
จำนวนชั่วโมงทั้งหมดตามแผน: <X+Y+Z> ชม.
ใช้จริงรวม: <Y> ชม. (จาก get_time_summary)

[เป้าหมาย 1] <ชื่อเป้าหมาย> (น้ำหนัก <W1>% | วางแผน <X> ชม. | ใช้จริง <Y> ชม.)
- Service: <Service>
- Tasks:
  - <task id 1>
  - <task id 2>
- สถานะ: <เสร็จ / บางส่วน / ยังไม่ทำ / รอตรวจสอบ>
- รายละเอียดที่ทำ:
  - <สิ่งที่ทำจริง>
  - <ผลลัพธ์ที่ได้>
- log การทำงาน:
  - [<task id 1>] [<วันที่เวลา>] <ประเภท>: <รายละเอียด>
  - [<task id 2>] [<วันที่เวลา>] <ประเภท>: <รายละเอียด>
- หลักฐาน: <ไฟล์/section/prototype/QA checklist ที่เกี่ยวข้อง>

[เป้าหมาย 2] <ชื่อเป้าหมาย> (น้ำหนัก <W2>% | วางแผน <Y> ชม. | ใช้จริง <Z> ชม.)
- Service: <Service>
- Tasks:
  - <task id 3>
- สถานะ: <เสร็จ / บางส่วน / ยังไม่ทำ / รอตรวจสอบ>
- รายละเอียดที่ทำ:
  - <สิ่งที่ทำจริง>
  - <ผลลัพธ์ที่ได้>
- log การทำงาน:
  - [<task id 3>] [<วันที่เวลา>] <ประเภท>: <รายละเอียด>
- หลักฐาน: <ไฟล์/section/prototype/QA checklist ที่เกี่ยวข้อง>

น้ำหนักรวม: 100%
เสร็จตามแผน: <N>/<ทั้งหมด>
ค้าง: <รายการ>
```

### กฎสำคัญส่วนที่ 2

- ⚠️ **ห้ามส่ง log/อัปเดตระบบภายนอกใด ๆ** — แค่สรุปและแสดง copy block
- สรุปตามเป้าหมายที่วางไว้ในส่วนที่ 1 — ถ้าไม่มีแผนเดิม ให้ถามผู้ใช้หรือสรุปจาก session context
- ใช้ภาษาเข้าใจง่าย เน้นสิ่งที่ทำและผลลัพธ์ ไม่ใช่วิธีทำละเอียด
- ระบุสถานะชัดเจน: เสร็จ / บางส่วน / ยังไม่ทำ / รอตรวจสอบ
- ต้องรายงานผลเทียบกับ Acceptance Criteria ไม่ใช่สรุปจากสถานะ Kanban อย่างเดียว
- งานที่ไม่มี Evidence เพียงพอ ห้ามสรุปเป็น "เสร็จ"
- **log การทำงานของเป้าหมาย** ต้องรวมจาก Activity timeline ของทุก task ที่ map กับเป้าหมายนั้น — แสดงตามลำดับเวลา ระบุ task id ที่เป็นเจ้าของ event

### กฎเมื่อแผนเปลี่ยนระหว่างทำ

หากพบงานเพิ่ม งานลด ความเสี่ยง หรือเวลาจริงต่างจากแผน:

1. ระบุว่าแผนเดิมข้อใดได้รับผลกระทบ
2. อธิบายสาเหตุที่เปลี่ยน
3. แยกงานที่เพิ่มเป็น **งานนอก Scope** หรือระบุงานที่ถูกตัด/เลื่อน
4. ห้ามแก้ Mission Plan ตั้งต้นย้อนหลังโดยไม่เก็บฉบับเดิมไว้
5. หากผู้ใช้อนุมัติให้ปรับแผน ให้แสดง copy block ของแผนฉบับปรับปรุงแยกจากแผนเดิม
6. คำนวณเวลาใหม่และตรวจว่ายังไม่เกินงบ Mission หรือเสนอแยกเป็น Mission ใหม่
7. ถ้าเกิน 5 วัน ให้เสนอแยกเป็น Mission ใหม่
8. ห้ามปรับแผนหรือสถานะเป็นเสร็จเงียบ ๆ โดยไม่แจ้งผู้ใช้
9. ใน Work Summary ต้องแยกให้เห็นว่าอะไรทำตามแผน อะไรทำเพิ่ม อะไรถูกตัด และอะไรถูกเลื่อน

---

## รูปแบบ Copy Block

**กฎสำหรับ copy block ทุกอัน:**
1. ใช้ code block ที่ระบุภาษาเป็น `text` (เช่น ` ```text `) เพื่อให้ก๊อปง่าย
2. เนื้อหาใน copy block ต้องเป็นข้อความล้วน ไม่มี Markdown heading, bold, inline code, ตาราง หรือ horizontal rule
3. ใช้ literal `- ` นำหน้าแต่ละรายการภายใน `text` code block เพื่อให้ Copy ออกไปเป็นเครื่องหมาย `-` ไม่ใช่ rendered bullet symbol `•`
4. Copy block ของ **Work Summary ต้องระบุ `สถานะ` และ `รายละเอียดที่ทำ` อย่างชัดเจน** สำหรับทุก task/แผนที่สรุป รวมถึงผลลัพธ์และหลักฐานเมื่อมี
5. สถานะต้องใช้คำที่ตรวจสอบได้: `เสร็จ`, `บางส่วน`, `ยังไม่ทำ` หรือ `รอตรวจสอบ`
6. **ให้ใส่น้ำหนัก (Weight %) และชั่วโมงใน copy block** เพื่อให้ข้อมูลครบสำหรับระบบปลายทางที่ต้องการข้อมูลครบ — รายละเอียดตามกฎด้านล่าง
7. ภาษาไทยเข้าใจง่าย เน้นสิ่งที่ทำ/ผลลัพธ์ ไม่ใช่คำศัพท์เทคนิค
8. **ภาษาใน copy block (บังคับ):** ใช้ภาษาเข้าใจง่าย — เปลี่ยนคำโค้ด/เทคนิคที่คนทั่วไปไม่เข้าใจเป็นคำเข้าใจง่าย แต่คำเฉพาะ/ศัพท์ที่คุ้นเคย (เช่น breadcrumb, Alert, asset, spec, baseline, Kanban) เก็บไว้ได้ ไม่บังคับล้วนไทย — ห้ามใช้ชื่อฟังก์ชัน/ชื่อโค้ด (เช่น `renderWatchAlertList()`, `mock data`, `status badge`, `soft delete`, `cross-reference`, `viewport`) ใน copy block
9. **Tasks เป็นลิสข้อ ๆ ลงมา** — ไม่ใช่ `,` หรือ `+` คั่นบรรทัดเดียว
10. **Feature ย่อยเป็นผลลัพธ์ย่อยของ Objective** — หนึ่ง Feature map กับหนึ่งหรือหลาย Task ได้ และไม่ต้องแตก Feature ให้เท่ากับจำนวน Task
11. **รายละเอียดของ Objective ไม่ใส่ชั่วโมง** — เวลารวมอยู่ใน Feature ย่อยแล้ว
12. **ตรวจสอบ/แก้ไขอยู่ในระดับ Feature** — ใส่เป็นแผนที่วางไว้ก่อนเริ่มงาน ใช้ `()` ครอบเวลา และไม่ต้องสร้าง Task ตรวจสอบ/แก้ไขแยก เว้นแต่เป็นงานที่ต้องติดตามอิสระ
13. **Mission Plan ห้ามใช้ผลลัพธ์ย้อนหลัง** — ห้ามใส่สถานะเสร็จ, ชั่วโมงจริง, Evidence, bug ที่พบจริง หรือผล QA ที่เกิดขึ้นแล้วใน copy block ของแผนตั้งต้น
14. **แยก approval artifacts ตามผู้ใช้ปลายทาง:** Mission Plan Summary สำหรับคนอ่าน Work Log; Session Handoff สำหรับ Agent/session ถัดไป ห้ามรวมสองแบบเป็น artifact เดียว
15. **Identifier rule:** Mission Plan Summary ห้ามมี Kanban UUID/internal ID และใช้ `<TASK-CODE> <Task Name> — <task planned hours>`; Session Handoff และ Work Summary เชิงเทคนิคใช้ internal IDs ได้เมื่อจำเป็นต่อ traceability

**กฎการใส่น้ำหนัก/ชั่วโมงใน copy block (แยกตามส่วน):**

| ส่วน | ฟิลด์ที่ต้องใส่ใน copy block |
|---|---|
| **ส่วนที่ 1 — หัวข้อ Mission** | Baseline (ชม.), จำนวนชั่วโมงทั้งหมดตามแผน, เหลือชั่วโมงให้วางแผน |
| **ส่วนที่ 1 — แต่ละเป้าหมาย** | น้ำหนัก (Weight %), ชั่วโมงที่คาดการณ์ของเป้าหมาย, ชั่วโมงแยกในแต่ละ Feature ย่อย (รวม ตรวจสอบ/แก้ไข ใน feature) |
| **Approved Mission Plan Summary** | Planned Duration, Mission Total Planned Hours, Objective Weight/Hours, Feature → Task mapping, Planned Hours ของแต่ละ Task และ Execution Sequence; ห้ามมี UUID |
| **Session Handoff** | Approved baseline, technical identifiers/context, scope/boundary, dependency, acceptance, risk/open items, protected scope, current state และ next-session instructions |
| **ส่วนที่ 2 — แต่ละเป้าหมาย** | น้ำหนัก (Weight %), เวลาที่วางแผน, ใช้จริง (จาก get_time_summary) |
| **ส่วนที่ 2 — ท้ายสรุป** | รวมเวลาวางแผน vs ใช้จริงทั้ง Mission |

> **ข้อยกเว้น:** copy block ของรายละเอียด task DONE (รายการ Activity timeline ของ task เดี่ยว ๆ ในขั้นตอนที่ 2 ของส่วนที่ 1) ยังคง **ไม่ใส่จำนวนชั่วโมง** เพราะชั่วโมงใน task นั้นเป็นข้อมูลวิเคราะห์ภายในจาก Kanban ไม่ใช่ชั่วโมงประเมินของแผน

**ตัวอย่าง copy block ที่ดี:**

```text
Mission: สร้างเอกสารและ prototype สำหรับ Option Master module
ระยะเวลา: 3 วัน
งบประมาณชั่วโมงตามแผน (Baseline): 20 ชม.
จำนวนชั่วโมงทั้งหมดตามแผน: 20 ชม.
เหลือชั่วโมงให้วางแผน: 0 ชม.
ภาพรวม: เขียนเอกสาร BO Module และสร้าง prototype screen สำหรับ Option Master ให้ครบ
```

```text
แผนงาน Mission: สร้างเอกสารและ prototype สำหรับ Option Master module
งบประมาณชั่วโมงตามแผน (Baseline): 20 ชม.
จำนวนชั่วโมงทั้งหมดตามแผน: 20 ชม.
เหลือชั่วโมงให้วางแผน: 0 ชม.

[เป้าหมาย 1] เขียนเอกสาร BO Module (น้ำหนัก 40% | 8 ชม.)
- Service: BackOffice
- Tasks:
  - TK-500
- รายละเอียด: เขียนเอกสาร 17_OPTION_MASTER_MODULE.md ครบ 21 section และอัปเดต index/baseline/version
- Feature ย่อย:
  - [TK-500] เขียนเอกสาร 21 section + อัปเดต index/baseline/version + ตรวจสอบ QA checklist และเทียบกับ prototype (1) + แก้ไขการอ้างอิงข้ามเอกสารและรูปแบบ (1) (8 ชม.)
- Dependency: ไม่มี

[เป้าหมาย 2] สร้าง prototype screen (น้ำหนัก 60% | 12 ชม.)
- Service: Prototypes
- Tasks:
  - TK-501
  - TK-502
- รายละเอียด: สร้าง prototype screen สำหรับ Option Master
- Feature ย่อย:
  - [TK-501] สร้างหน้ารายการ Option Group + ข้อมูลตัวอย่าง + ตรวจสอบ (1.5) + แก้ไข (0.5) (6 ชม.)
  - [TK-502] สร้างหน้ารายละเอียด Option + ข้อมูลตัวอย่าง + ตรวจสอบ (1.5) + แก้ไข (0.5) (6 ชม.)
- Dependency: หลังเป้าหมาย 1

น้ำหนักรวม: 100%
```

---

## Services ที่เกี่ยวข้อง

| Service | คำอธิบาย | workspace |
|---|---|---|
| BackOffice (BO) | เอกสาร spec ของระบบ admin (markdown modules, baseline, version) | `BackOffice/` |
| FrontOffice (FO) | เอกสาร spec ของระบบผู้ใช้ (markdown modules, PRD, handoff) | `FrontOffice/` |
| Prototypes | prototype screen ของ BO (HTML, assets, mock data) | `Prototypes/` |

> **หมายเหตุ:** ถ้ามี Service อื่นที่เกี่ยวข้อง (เช่น SeedData, PRD, docs) สามารถเพิ่มได้ตามความเหมาะสม — แต่ทั้ง 3 ด้านบนเป็นหลัก

> **Protected screens:** งานที่เกี่ยวกับ Prototypes ต้องตรวจสอบกับ `AGENTS.md` และ `PROTECTED_SCREENS.md` เสมอ เพราะ prototype ส่วนใหญ่เป็น protected screen

---

## Checklist

### ส่วนที่ 1: วางแผน Mission
- [ ] เรียก `mcp_list_tools` ของ `kanban-tukdaeng` เพื่อดูเครื่องมือทั้งหมด
- [ ] เรียก `get_project_context` เพื่อ resume session
- [ ] เรียก `get_board` เพื่อดู task ที่ค้าง/ทำอยู่
- [ ] เรียก `get_task` สำหรับทุก task DONE ที่เกี่ยวข้องกับ Mission
- [ ] แสดง Description และ Activity timeline ของ task DONE เป็นรายการ (note/status/time)
- [ ] เรียก `get_time_summary` เพื่อดูชั่วโมงที่ใช้ไป (ถ้าจำเป็น)
- [ ] คิด Mission + จำนวนวัน (1-5 วัน) + แบ่งเป็นเป้าหมายย่อย 2-5 ข้อ
- [ ] การวางแผน Mission เสร็จก่อนสร้าง Mission และไม่ถูกนับเป็น Objective เว้นแต่ผู้ใช้ระบุว่าเป็น deliverable
- [ ] กำหนดเป้าหมาย, สิ่งที่ต้องส่งมอบ และสิ่งที่ไม่รวมใน Scope
- [ ] กำหนด Acceptance Criteria ที่ตรวจสอบได้จริง
- [ ] สรุปหัวข้อ Mission ตามฟิลด์ฟอร์ม Create Mission (ชื่อแผนงาน, พนักงานผู้รับผิดชอบ, โปรเจกต์, วันที่เริ่ม/เสร็จ, Planned Days, Baseline) + **copy block ที่มี Baseline/จำนวนชั่วโมงทั้งหมด/เหลือชั่วโมง**
- [ ] คำนวณ Baseline = Total Planned Hours เสมอ (ถ้าผู้ใช้ใส่ Total = ค่าที่ใส่, ถ้าไม่ใส่ = Planned Days × 8 ชม.) และแสดง **เหลือชั่วโมงให้วางแผน = 0** (Baseline = Total)
- [ ] วางแผนแยก Objective (แต่ละ Objective ระบุ Service, Tasks, น้ำหนัก%, ชั่วโมงที่คาดการณ์, ผู้รับผิดชอบหลัก, รายละเอียด, Feature ย่อย และ Dependency)
- [ ] ตรวจว่าแต่ละ Feature เป็นผลลัพธ์ย่อยที่ชัดเจน และ map กับ Task ได้ 1 task หรือหลาย task
- [ ] ตรวจว่า Feature ไม่ได้ถูกแตกตามจำนวน Task โดยไม่จำเป็น และไม่บังคับให้ Feature หนึ่งมี Task เดียว
- [ ] ตรวจว่าชื่อ Objective และ Feature เป็นชื่อ label สั้นตาม Naming Rules — ไม่มี scope/behavior/AC ยัดอยู่ในชื่อ และใช้ terminology ที่ทีมเข้าใจจริง
- [ ] ตรวจว่าน้ำหนัก (Weight) ของทุกเป้าหมายรวมกัน **เท่ากับ 100%**
- [ ] ระบุ Dependency, ลำดับงาน และ critical path ระหว่างเป้าหมาย
- [ ] ประเมินเวลาแต่ละเป้าหมาย (1 วัน = 8 ชม.) — **เวลา = เวลา AI ทำงานเป็นหลัก** รวมการวิเคราะห์ สร้าง แก้ และตรวจรับตามขอบเขต
- [ ] ระบุหมวดหมู่งานของแต่ละ task และประเมินเวลาตามตารางเวลามาตรฐาน (Documentation ≤ 0.5 ชม., Testing 1 ชม., Feature 2 ชม., ฯลฯ)
- [ ] ถ้า task เกินค่า "ห้ามเกิน" ของหมวด → แตกเป็น subtask จนแต่ละ subtask อยู่ในเกณฑ์
- [ ] ⚠️ **Total Planned Hours ประเมินตามความจริง** — Baseline = Total เสมอ, เหลือชั่วโมงให้วางแผน = 0 เสมอ (Baseline อิงตาม Total ไม่ใช่ Days × 8 โดยตรง)
- [ ] ⚠️ **ห้ามแก้แผนหลัง start Mission โดยไม่มีเหตุผล** — ถ้าจำเป็นต้องแก้ ต้องระบุเหตุผลและแจ้งผู้ใช้ก่อน (มีผลต่อคะแนนความแม่นยำในการวางแผน)
- [ ] ระบุ Risk พร้อมแนวทางรับมือ (ถ้า task เกินเวลา รวมจะเกิน Total Planned Hours ทันที ให้ใช้กฎชี้แจงเวลาเกินงบใน work-summary)
- [ ] ตรวจสอบ/แก้ไข แจกใส่ในแต่ละ Feature ย่อย (ไม่มีฟิลด์ ตรวจสอบ/แก้ไข แยกที่ระดับเป้าหมาย) ใช้ `()` ครอบเวลา
- [ ] ตรวจว่าแผนกระทบ protected screens หรือไม่ (อ้าง `AGENTS.md` / `PROTECTED_SCREENS.md`)
- [ ] แยก Mission Plan ออกจาก Work Summary — Mission Plan ไม่มีสถานะจริง, ชั่วโมงจริง, Activity log, Evidence หรือ bug ที่พบภายหลัง
- [ ] Mapping Objective → Feature → Kanban task (1 Objective = หลาย Feature, 1 Feature = 1 หรือหลาย task)
- [ ] สรุปแผนเป็นข้อ ๆ แยกตามเป้าหมาย พร้อมน้ำหนัก% และ Feature ย่อย + **copy block ที่มีน้ำหนัก/ชั่วโมงครบ**
- [ ] ถ้าผู้ใช้อนุมัติ Mission Plan แล้ว ให้ล็อก Approved Mission Baseline ก่อนสร้าง approval artifacts
- [ ] สร้าง Mission Plan Summary สำหรับ Work Log เป็น Human-readable `text` Copy Block เดียว โดยคง hierarchy ทางข้อมูล Mission → Objective → Feature → Task พร้อม Planned Duration, Total Planned Hours, Objective Hours/Weight, Task Planned Hours และ Execution Sequence ครบ
- [ ] ตรวจ Mission Plan Summary ว่า Task ใช้ `<TASK-CODE> <Task Name> — <task planned hours>` และไม่มี Kanban UUID/internal ID ทุกชนิด
- [ ] ตรวจ Planned Time ครบ 3 ระดับ: Mission, Objective และ Task ทุกตัว
- [ ] ตรวจรูปแบบชั่วโมงใน Mission Plan Summary ว่าอ่านง่ายและไม่แสดงค่าซ้ำ เช่นใช้ `8 ชม.` หรือ `2 ชม. 30 นาที`
- [ ] ตรวจวันที่ใน Mission Plan Summary ว่าเป็น human-readable date range เมื่อทำได้โดยไม่เปลี่ยนค่าจริง
- [ ] ตรวจว่ารายการใน Mission Plan Summary ใช้ literal `- ` ภายใน `text` code block และไม่มี `*` หรือ rendered bullet `•`
- [ ] สร้างหรืออัปเดต Session Handoff แยกอีก artifact โดยคง identifiers, technical context, current state, next task และ next-session instructions ครบ
- [ ] ถ้าจบ planning session ให้บันทึก Session Handoff ด้วย `save_session_note` เมื่อเครื่องมือพร้อม และแสดง Summary/Handoff เป็นคนละ code block
- [ ] ตรวจว่าไม่ได้เริ่ม implementation, ไม่ย้าย Task เป็น `in_progress` และไม่เริ่ม timer จาก approval workflow
- [ ] ⚠️ **ภาษาใน copy block** — ใช้ภาษาเข้าใจง่าย เปลี่ยนคำโค้ด/เทคนิคเป็นคำเข้าใจง่าย แต่คำเฉพาะ/ศัพท์ที่คุ้นเคย (breadcrumb, Alert, asset, spec, baseline, Kanban) เก็บไว้ได้ ไม่บังคับล้วนไทย ห้ามใช้ชื่อฟังก์ชัน/โค้ด
- [ ] ⚠️ ห้ามส่ง log/อัปเดตระบบภายนอกใด ๆ

### ส่วนที่ 2: สรุปผลหลังทำตามแผน
- [ ] เรียก `mcp_list_tools` ของ `kanban-tukdaeng`
- [ ] เรียก `get_board` เพื่อดู task ที่ทำเสร็จ/ยังค้าง
- [ ] เรียก `get_task` สำหรับทุก task DONE ที่เกี่ยวข้อง
- [ ] แสดงรายละเอียดงานและ Activity timeline ของแต่ละ task ที่เสร็จแล้ว
- [ ] เรียก `get_time_summary` เพื่อดูชั่วโมงที่ใช้จริง
- [ ] ตรวจสอบงานที่ AI ทำตาม AI Review Checklist
- [ ] รวบรวม Evidence: ไฟล์, section, prototype, QA checklist, cross-reference และผลตรวจ
- [ ] ตรวจว่าแก้ protected screens หรือไม่ (ถ้าแก้ ต้องมีอนุมัติจากผู้ใช้)
- [ ] ตรวจ Acceptance Criteria ครบทุกข้อ
- [ ] สรุปผลเป็นข้อ ๆ แยกตามเป้าหมาย (เปรียบเทียบกับแผนในส่วนที่ 1)
- [ ] รวม log การทำงานของแต่ละเป้าหมายจาก Activity timeline ของทุก task ในเป้าหมาย
- [ ] ระบุสถานะชัดเจน: เสร็จ / บางส่วน / ยังไม่ทำ / รอตรวจสอบ
- [ ] แสดงเปรียบเทียบเวลา: วางแผน vs ใช้จริง (แสดงทั้งในสรุปด้านนอกและใน copy block ตามเป้าหมาย)
- [ ] แยกงานที่ทำตามแผน, งานนอก Scope และงานที่ถูกเลื่อน
- [ ] สรุปงานที่ยังค้าง
- [ ] สร้าง **copy block** ของสรุปผลที่มีน้ำหนัก%, เวลาวางแผน vs ใช้จริง ต่อเป้าหมาย และรวมทั้ง Mission
- [ ] ตรวจว่า Copy block ของ Work Summary มี **สถานะ**, **รายละเอียดที่ทำ** และ **log การทำงาน** ครบทุกเป้าหมาย (Tasks เป็นลิสข้อ ๆ ไม่มีฟิลด์ ตรวจสอบ/แก้ไข แยก)
- [ ] ⚠️ ห้ามส่ง log/อัปเดตระบบภายนอกใด ๆ
