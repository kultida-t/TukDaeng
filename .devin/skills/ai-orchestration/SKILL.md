---
name: ai-orchestration
description: TukDaeng AI Orchestration — conductor workflow สำหรับ route งานไปยัง skill/MCP ที่ถูกต้อง, แตกงานเป็น parallel subagent อย่างปลอดภัย, วน reviewer loop กับ Gemini auditor และส่งต่อ Requirement → Mission. Use เมื่อเริ่ม session ใหม่, ได้รับงานที่ไม่ชัดว่าควรใช้ skill ไหน, งานครอบหลาย module พร้อมกัน, เตรียมงานส่งตรวจที่ต้องวนลูปตรวจ-แก้ หรือต้องแปลง requirement เป็น mission
---

# TukDaeng AI Orchestration (Conductor Workflow)

> ## ⚠️ Machine Guard — ตรวจสอบเครื่องก่อนทำงาน skill นี้ (จำเป็น)
>
> **เครื่องที่อนุญาต (ผ่านถ้าตรงชุดใดชุดหนึ่ง):**
>
> **เครื่อง A (เครื่องหลัก Admin):**
> - Platform: Windows, User: `Admin` หรือ account sandbox ที่ลงท้ายด้วย `\\codexsandboxoffline`
> - Workspace path ที่ต้องมีอยู่จริง: `C:\Users\Admin\Desktop\TukDaeng\`
>
> **เครื่อง B (เครื่อง mailt):**
> - Platform: Windows, User: `mailt`
> - Workspace path ที่ต้องมีอยู่จริง: `D:\TukDaeng\`
>
> **ถ้าไม่ใช่เครื่องที่อนุญาต:** หยุดทำงาน skill นี้ทันที ไม่เรียก MCP ใด ๆ แจ้งผู้ใช้ว่า skill นี้ใช้ได้เฉพาะเครื่องของ Admin หรือ mailt เท่านั้น

Workflow สำหรับทำตัวเป็น **conductor** ของวง AI ใน TukDaeng — ไม่ใช่ทำทุกอย่างเองตัวเดียว แต่รู้ว่างานแต่ละชิ้นควรไปที่ใคร (skill ไหน, subagent ตัวไหน, auditor ตัวไหน) และคอยรวมผลกลับมา

## บทบาทใน Orchestra (Roles)

| ชิ้นส่วน | ใครทำ | หน้าที่ |
|---|---|---|
| **Conductor** | Devin main session (session นี้) | รับ intent, route งาน, แตก subagent, รวมผล, ทำ side effects ทั้งหมดผ่าน MCP |
| **State store** | `kanban-tukdaeng` MCP | ความจำกลาง — mission, task, session note, requirement, เวลาทำงาน |
| **Specialist agents** | Skills ใน `.agents/skills/` + `.devin/skills/` | มือเฉพาะทางแต่ละประเภทงาน (ดู Routing Table) |
| **Executor ย่อย** | `run_subagent` | งานย่อยที่แยกกันได้ — read-only ใช้ `subagent_explore`, ต้องแก้ไฟล์ใช้ `subagent_general` |
| **Auditor** | `gemini-notebook-mcp` MCP | ตรวจงาน/หลักฐานด้วยโมเดลคนละตัวกับคนทำ — feedback เท่านั้น ไม่ใช่ verdict สุดท้าย |
| **Sink** | `core-portal` MCP (`submit_logs`, `list_my_apps`) | ส่ง worklog เข้าระบบบริษัท — เฉพาะเมื่อผู้ใช้สั่งชัดเจนเท่านั้น |

> **หลักการ:** Orchestration ไม่ได้ทำให้โมเดลเก่งขึ้น — มันตัดสินแค่ว่า *ใครทำอะไร ตอนไหน ด้วย context อะไร* งานเดียวเรียบ ๆ ทำเองตรง ๆ จบกว่าเสมอ อย่า spawn agent เพื่อความเท่

## Session Start Sequence (ทุก session ที่เกี่ยวกับงาน TukDaeng)

```
1. get_session_context (kanban-tukdaeng)   → resume board + session notes ล่าสุด
2. อ่าน AGENTS.md                           → protected screens + standing rules
3. ระบุ intent ของงาน                       → route ตาม Routing Table ด้านล่าง
4. ถ้า intent ไม่ชัด                        → ถามผู้ใช้ 1 คำถาม (ask_user_question) ห้ามเดา
```

- ถ้ามี mission/task `in_progress` ค้างอยู่ → resume จาก session note ล่าสุดก่อนเสมอ ไม่เริ่ม routing ใหม่ทับ
- `get_session_context` ต้องเรียกก่อนเสมอ (tool ของ kanban สั่งไว้เอง) — อย่าข้ามไปอ่าน board ตรง ๆ

## Intent → Skill Routing Table (บังคับ)

| Intent ของผู้ใช้ | Route ไปที่ | หมายเหตุ |
|---|---|---|
| วางแผนงานรายวัน / สร้าง Mission Plan / Session Handoff / สรุปเทียบแผน | `mission-planning` | แยก 2 ส่วนชัดเจน (planning vs work summary) |
| สร้าง/แก้หน้าจอ BO module | `bo-screen-design` | **ต้องเช็ก AGENTS.md protected screens ก่อนแก้ไฟล์เสมอ** |
| React / Next.js / TypeScript / Tailwind ทั่วไป | `senior-frontend` | งาน dev จริง ไม่ใช่ prototype spec |
| Landing page / poster / UI เชิง creative | `frontend-design` | ไม่ใช่หน้าจอ BO |
| สรุป/ปิด task เดี่ยว, handoff ข้าม session | `work-summary` | ทำตาม Close-Task Checklist ใน AGENTS.md — ห้าม move_task → done จนกว่าผู้ใช้ยืนยัน |
| สรุปงานรวมทั้งวันตอนเลิกงาน | `daily-summary` | ดึง session note ทั้งวัน + git commit |
| เตรียมหลักฐานส่งตรวจ objective | `submission-evidence` | ต่อด้วย Reviewer Loop ถ้าต้องการให้ Gemini ตรวจ |
| ตอบคำถามประเมินผล / คำถามจาก PO-reviewer | `eval-qa-assistant` | คำตอบ ≤500 ตัวอักษร อ้าง log จริง |
| export log สนทนา AI เป็น JSON | `ai-conversation-daily-log` | manual เท่านั้น เมื่อผู้ใช้ขอ |
| brainstorm / เก็บ requirement / spec ที่ยังไม่พร้อมทำ | Requirement pipeline (ด้านล่าง) | `create_requirement` ไม่ใช่สร้าง task |
| ถามชั่วโมงทำงาน / เวลา | `get_time_summary` ตรง ๆ | ไม่ต้องผ่าน skill |
| ถามสถานะ board / task / mission | `get_board` / `get_task` / `get_mission` ตรง ๆ | ตอบจาก record เท่านั้น ห้ามตอบจากความจำ |
| ส่ง worklog เข้า Core Portal | `core-portal` `submit_logs` | **เฉพาะเมื่อผู้ใช้สั่งชัดเจน — ห้าม auto-submit** |

### กฎการ route

- **เลือก skill เดียวที่ตรง intent หลักก่อน** — ถ้างานผสมหลาย intent ให้แยกเป็นเฟสแล้วไล่ทีละ skill ไม่ใช่ปนกัน
- **Protected screens เป็น hard rule ไม่ใช่ทางเลือก** — ก่อนแก้ไฟล์ใด ๆ ที่อยู่ในลิสต์ AGENTS.md ต้องแจ้งผู้ใช้ก่อนเสมอ ไม่ว่า skill ไหนจะพาไป
- **อ่าน SKILL.md ครบก่อนผลิต templated output** (ตาม Skill Template Fidelity Rule ใน AGENTS.md) — ห้ามเขียน copy block จากความจำ
- ถ้าไม่มี skill ตรง → ทำเองตรง ๆ ได้ แต่ยังผูกกฎ AGENTS.md ทุกข้อ

## Parallel Subagent Rules

### เมื่อไรควรแตก

งานที่แยก **ชุดไฟล์/โฟลเดอร์กันได้ชัด** และไม่ต้องรอผลกันและกัน เช่น:

- audit/ตรวจ label หลาย module พร้อมกัน (แต่ละ agent รับผิดชอบคนละ module)
- capture screenshot หลายหน้า / หลายขนาดจอ
- อ่าน+สรุปเอกสารหลายชุดที่อิสระกัน
- ค้นหาข้อมูลกระจายหลายส่วนของ repo

### เมื่อไรห้ามแตก

- งานชิ้นเดียวเรียบ ๆ (อ่านไฟล์ 1-2 ไฟล์, แก้จุดเดียว) — ทำเองเร็วกว่า
- งานที่ 2 ตัวต้องแตะไฟล์เดียวกัน หรือ output ของตัวหนึ่งเป็น input ของอีกตัว (sequential)
- งานที่ต้องตัดสินใจต่อเนื่องจากผลระหว่างทาง

### กฎเหล็กของ subagent

1. **File scope ต้อง disjoint** — ระบุใน prompt ชัด ๆ ว่าแต่ละตัวอ่าน/แก้ path ไหนได้บ้าง ห้ามทับซ้อนกัน
2. **Protected screens = read-only สำหรับทุก subagent** — ใส่ข้อห้ามนี้ใน prompt ทุกครั้งที่เกี่ยวกับไฟล์ BO
3. **Subagent ทำงานใน repo เท่านั้น** — side effects ทั้งหมด (kanban task/note, core-portal, gemini) ทำโดย conductor เท่านั้น ห้าม delegate
4. Read-only → `subagent_explore`; ต้องเขียนไฟล์ → `subagent_general`; งานขนาน → `is_background=true` เปิดพร้อมกันแล้วรอ `read_subagent`
5. **จำกัด 3-4 ตัวต่อรอบ** — ถ้างานแยกได้มากกว่านั้นให้ทำเป็นรอบ ไม่เปิดพร้อมกันหมด
6. **Conductor ตรวจผลเองหลังรวม** — subagent บอกว่าเสร็จไม่พอ ต้อง re-verify (อ่าน diff / รัน check) ก่อนสรุปให้ผู้ใช้
7. Front-load context ใน prompt เสมอ — subagent ไม่เห็น conversation นี้ ต้องบอก path, กฎที่เกี่ยว, สิ่งที่คาดหวังกลับมา ครบในครั้งเดียว
8. **ขอบเขตการแตก = หนึ่งหน่วยงานเท่านั้น** — subagent ทำงานย่อยของ "งานก้อนเดียว" เท่านั้น ห้าม fan-out ไปแตะงานของหน่วยอื่น:
   - งานที่มี task บน board → หน่วยงาน = task ที่ `in_progress` อยู่ใบเดียวนั้น (convention kanban "ทำทีละ task" บังคับเสมอ — ชั่วโมงตกผิดใบ = ขัด Work Summary Attribution Rule)
   - งาน ad-hoc ที่ไม่มี task → หน่วยงาน = ขอบเขตของคำสั่งเดียวนั้น ห้ามลากงานอื่นเข้ามารวม
   - คำสั่งที่ครอบหลาย task → ไล่ task ทีละใบตามปกติ แล้วแตก subagent *ภายใน* task นั้น — เว้นแต่ผู้ใช้สั่งชัดเจนให้ทำหลาย task พร้อมกัน ซึ่งต้องยืนยันกับผู้ใช้ก่อนเสมอว่าจะจับเวลา/attribute อย่างไร

### การวิเคราะห์ตั้งแต่ตอนวางแผน (Planning-Time Assessment)

จุดที่ถูกต้องในการตัดสินใจเรื่อง subagent คือ **ตอนวางแผน Mission** ไม่ใช่กลางทาง — ตอนแตก Task ใน mission-planning ให้ประเมินแต่ละ Task ด้วย 4 คำถาม:

1. แยกไฟล์/module ได้ชัดไหม (file scope disjoint)
2. เป็นงานซ้ำ pattern เดิมกับหลายเป้าหมายไหม (high volume — เช่น capture 20 จอ, audit 8 module, sweep label ทุกหน้า)
3. งานย่อยไม่ต้องรอผลกันและกันใช่ไหม (ไม่ sequential)
4. ไม่แตะ protected screens ใช่ไหม

- ผ่านครบ 4 ข้อ → ทำเครื่องหมายในแผน/Session Handoff ว่า Task นั้นเป็น **parallel candidate** (เช่น note ว่า `[parallel: per-module]` หรือ `[parallel: per-screen]`) พร้อมระบุหน่วยแตก (แตกตาม module? ตามจอ? ตามไฟล์?)
- Task ที่ mark ไว้ → execution session แตก subagent ตามหน่วยนั้นได้ทันทีโดยไม่ต้องวิเคราะห์ใหม่
- Task ที่ไม่ผ่าน → ทำเองตรง ๆ ใน session หลัก อย่าฝืนแตก
- การ mark candidate เป็นแค่แผน ไม่ใช่ภาระผูกพัน — ตอน execute ถ้าพบว่า scope จริงเล็กกว่าที่คิด ให้ทำเองตรง ๆ

### งานเดี่ยวนอก Mission (ad-hoc, ไม่มีแผน)

งานที่สั่งตรง ๆ ไม่ผ่าน mission-planning ก็แตก subagent ได้ — ใช้ 4 คำถามชุดเดียวกัน แค่ประเมิน **ตอนรับงานเข้า (intake)** แทนตอนวางแผน แล้วตัดสินใจทันที:

- ผ่าน → บอกผู้ใช้สั้น ๆ ว่าจะแตกกี่ตัวตามหน่วยไหน แล้วแตกเลย (ไม่ต้องมีแผนล่วงหน้า)
- ไม่ผ่าน → ทำเองตรง ๆ ไม่ต้องบอกอะไรเพิ่ม
- เกณฑ์เดิมทุกข้อยังบังคับ: file scope disjoint, protected = read-only, จำกัด 3-4 ตัว/รอบ, รวมผลแล้ว re-verify

## Reviewer Loop (Gemini Auditor)

วนลูปตรวจ-แก้กับ Gemini เมื่อเตรียมงานส่งตรวจหรืออยากได้ second opinion จากโมเดลคนละตัว:

```
1. ทำงานเสร็จ → เตรียมหลักฐานตาม submission-evidence
2. เลือก notebook ปลายทาง (per-occasion — ไม่มี auditor ถาวร):
   - workflow จริงของทีมคือสร้าง notebook ใหม่ทุกครั้ง (เช่นหลังประชุม) ดังนั้นแต่ละรอบตรวจใช้เล่มของรอบนั้น
   - ผู้ใช้ระบุ notebook_id/alias/ชื่อเล่ม → ใช้อันนั้น
   - ไม่ได้ระบุ → `notebook_list` แล้วเสนอเล่มที่น่าจะใช่ (ล่าสุด/ชื่อเกี่ยวข้องกับงาน) ให้ผู้ใช้ยืนยันก่อน ห้ามเดาเงียบ ๆ
   - ถ้างานต้องการเล่มเปล่าใหม่ → ถามผู้ใช้ก่อนสร้างด้วย `notebook_create`
3. ใส่หลักฐานเข้า notebook: source_add(file_path=...) หรือ note(action=create)
4. ถาม auditor: notebook_query(notebook_id, query=<checklist ตรวจ>)
5. อ่าน verdict:
   - ผ่าน → สรุปให้ผู้ใช้ พร้อมบอกว่า Gemini เห็นตรง
   - ไม่ผ่าน → แก้ตาม feedback → อัปเดตหลักฐาน → กลับข้อ 4
6. ครบ 3 รอบแล้วยังไม่ผ่าน → หยุด สรุปประเด็นค้างให้ผู้ใช้ตัดสิน
```

### ข้อจำกัดของ auditor (สำคัญ)

- **ผลของ Gemini คือ advisory** — การปิด task / ส่งตรวจจริงเป็นสิทธิ์ของผู้ใช้เสมอ (Kanban Workflow Preference)
- **Repo snapshot คือ source of truth** (Business Requirements Source Rule) — Gemini เป็นที่ปรึกษา/ผู้ตรวจ ไม่ใช่แหล่ง requirement
- ถ้า `gemini-notebook-mcp` auth error → แจ้งผู้ใช้ให้รัน `nlm login` เอง อย่าพยายาม save_auth_tokens ถ้า CLI ยังไม่ได้ลอง
- อย่าส่งไฟล์ที่มี secrets/credentials เข้า notebook — ตรวจก่อน source_add ทุกครั้ง

## Requirement → Mission Pipeline

สำหรับงานที่ยังเป็นไอเดีย/spec ไม่พร้อม execute — เก็บใน kanban requirement แทนการสร้าง task:

```
ยังไม่พร้อมทำ  → create_requirement (เก็บ spec/living doc)
คุยต่อหลาย session → add_requirement_log (append เสมอ ห้าม overwrite ประวัติ)
                   + update_requirement (ปรับ living spec content)
resume งานค้าง → list_requirements / get_requirement
พร้อมทำแล้ว    → convert_requirement_to_mission
               → ต่อด้วย mission-planning skill ส่วนที่ 1 (วาง plan → รอ approve → สร้าง tasks)
```

- **ห้ามข้ามไปสร้าง task/mission ตรง ๆ** ถ้า requirement ยังไม่ finalize — ถามผู้ใช้ก่อน convert
- หลัง convert แล้ว ให้ทำตาม Mission Approval workflow ของ `mission-planning` ครบ (Summary Copy Block + Session Handoff + เริ่ม execution ใน session ใหม่)

## Side-Effect Ownership (ใครยิงอะไร)

| Action | ทำโดย | เงื่อนไข |
|---|---|---|
| `create_task` / `move_task` / `save_session_note` | Conductor เท่านั้น | done ต้องผู้ใช้ยืนยันก่อน |
| `submit_logs` (Core Portal) | Conductor เท่านั้น | เมื่อผู้ใช้สั่งชัดเจนเท่านั้น |
| `notebook_query` / `source_add` (Gemini) | Conductor เท่านั้น | notebook ต้องยืนยันแล้ว |
| `create_requirement` / `convert_requirement_to_mission` | Conductor เท่านั้น | convert เมื่อผู้ใช้ยืนยัน requirement final |
| แก้ไฟล์ใน repo | Conductor หรือ subagent (ตาม file scope) | ยกเว้น protected screens |

## Checklist

- [ ] เรียก `get_session_context` + อ่าน AGENTS.md ก่อน route งาน
- [ ] เลือก route จาก Routing Table (ไม่ใช่เดาเอง) — ไม่ชัดให้ถาม
- [ ] ถ้างานแตะ protected screen → แจ้งผู้ใช้ก่อนลงมือ
- [ ] ถ้าแตก subagent → file scope disjoint + ใส่ protected rule ใน prompt + รวมผลแล้ว re-verify
- [ ] ถ้าใช้ reviewer loop → notebook ยืนยันแล้ว + จำกัด 3 รอบ + ปิด task โดยผู้ใช้เท่านั้น
- [ ] side effects (kanban/portal/gemini) ทำผ่าน conductor เท่านั้น
- [ ] งานเดียวเรียบ → ทำเองตรง ๆ ไม่ over-orchestrate
