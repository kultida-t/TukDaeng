---
name: daily-summary
description: สรุปงานประจำวันตอนเลิกงานสำหรับ TukDaeng — ดึง session note ทั้งหมดของวัน + task activity + git commit รวมเป็น Daily Summary Copy Block เดียว ภาษาคนอ่านง่ายเหมือนสรุปส่งหัวหน้า พร้อม file path อ้างอิง สำหรับตอบคำถามส่งต่องานให้ dev ว่าวันนี้แก้/อัปเดต/เพิ่มอะไรไปบ้าง
---

# TukDaeng Daily Summary (สรุปงานประจำวันท้ายเลิกงาน)

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

Workflow สำหรับสร้าง **สรุปงานรวมทั้งวัน 1 ชุด** ตอนเลิกงาน — รวม session note ทั้งหมดที่บันทึกไว้ใน kanban ของวันนั้น เสริมด้วย task activity และ git commit แล้วเรียบเรียงเป็น Copy Block เดียว ให้ผู้ใช้ก๊อปไปตอบคำถาม/ส่งต่อให้ dev หรือหัวหน้าได้ทันทีว่าวันนี้ทำ/แก้/อัปเดตอะไรไปบ้าง ที่ไฟล์ไหน

## แยกจาก skill อื่น (สำคัญ — อ่านก่อนเลือกใช้)

| Skill | ใช้เมื่อ | ผลลัพธ์ |
|---|---|---|
| `work-summary` | สรุป **ต่อ task** — ปิด task / pause ข้าม session / สรุป task เดี่ยว | Final/Progress Work Summary ราย task |
| `mission-planning` ส่วนที่ 2 | สรุปผล **เทียบกับ Mission Plan** ที่อนุมัติไว้ | Work Summary เทียบแผน แยกตาม Service |
| **`daily-summary` (skill นี้)** | **เลิกงานแล้ว อยากได้สรุปรวมทั้งวัน 1 ก้อน** สำหรับส่งต่อ dev/ตอบหัวหน้า | Daily Summary Copy Block เดียว |
| `ai-conversation-daily-log` | export log การสนทนา AI เป็น JSON | JSON log |
| `eval-qa-assistant` | ตอบคำถามประเมินผล/คำถาม ad-hoc จาก log | คำตอบเจาะจงต่อข้อ |

ถ้าผู้ใช้ขอ "สรุป task นี้" ให้ใช้ `work-summary` — ถ้าขอสรุปรวม **ทั้งวัน** (หลาย task หลาย session) ให้ใช้ skill นี้

## When to Trigger

- User พูดว่า: "สรุปงานประจำวัน", "สรุปท้ายวัน", "เลิกงานแล้ว สรุปให้หน่อย", "สรุปงานทั้งวัน", "สรุปส่งต่อให้ dev", "daily summary", "วันนี้ทำอะไรไปบ้าง เอาไปบอก dev", "สรุปงานของวันที่ <X>", "สรุปงานเมื่อวาน"
- บริบท: ผู้ใช้ทำงานมาทั้งวัน (หลาย session/hลาย task มี session note สะสม) แล้วต้องการ 1 เอกสารสรุปส่งต่อ — ไม่ใช่ปิด task ไม่ใช่สรุปราย task

## ขั้นตอนดึงข้อมูล (ทำตามลำดับ — ห้ามข้ามข้อ 1-2)

### 1. กำหนดวันที่จะสรุป

- Default: วันนี้ใน Asia/Bangkok
- ถ้าผู้ใช้ระบุวัน ("เมื่อวาน", "วันที่ 2", "2026-11-02") → แปลงเป็น `YYYY-MM-DD`
- ถ้าระบุช่วง ("สัปดาห์นี้", "2 วันล่าสุด") → สรุปแยก block ต่อวัน

### 2. ดึง session notes + รายการ task ของวัน (แหล่งหลัก)

```
mcp_call_tool(server_name="kanban-tukdaeng", tool_name="get_session_context", arguments={})
```

- ส่วน "Today's session notes" คือ **raw material หลัก** — มีทุก note ของวันนี้เต็ม ๆ (ไฟล์ที่แก้, commit, verification, open items)
- ⚠️ ใช้ได้เฉพาะ **วันนี้** — note ย้อนหลัง `get_session_context` คืนแค่ 2-3 รายการล่าสุด ไม่ครบทั้งวัน

```
mcp_call_tool(
  server_name="kanban-tukdaeng",
  tool_name="get_time_summary",
  arguments={ "date": "<YYYY-MM-DD>", "status": "all", "tz": "Asia/Bangkok" }
)
```

- ได้รายการ task ทั้งหมดที่แตะในวันนั้น + `hours_spent` + รวมชั่วโมง — ใช้เป็น **backbone** ว่ามีกี่ task และเช็คว่ามี task ไหนไม่มี session note (จะสรุปตกหล่น)
- `status: "all"` เพื่อรวม task ที่ยัง `in_progress` ค้างอยู่ด้วย

**สำหรับวันย้อนหลัง** (session notes ดึงไม่ครบ): ใช้ `get_time_summary` + `get_task` เป็นแหล่งหลักแทน และแจ้งผู้ใช้ว่า "สรุปจาก task activity + git เป็นหลัก เพราะ session note ย้อนหลังดึงไม่ครบ"

### 3. เติมรายละเอียดต่อ task (เมื่อ note บางหรือขาด file path)

สำหรับ task ที่ session note ไม่มี หรือไม่ละเอียดพอ ให้เรียก:

```
mcp_call_tool(server_name="kanban-tukdaeng", tool_name="get_task", arguments={ "task_id": "<id>" })
```

- อ่าน Activity timeline → note entries (จาก `add_task_note`) มักมีไฟล์ที่แก้และผลลัพธ์
- ไม่ต้องเรียกทุก task — เรียกเฉพาะ task ที่ note บางหรือต้องการรายละเอียดเพิ่ม

### 4. เติม file path + commit จาก git (เสริม — ทำเมื่ออยู่ใน workspace)

```
git -C "<workspace root>" log --since="<YYYY-MM-DD> 00:00" --until="<YYYY-MM-DD> 23:59" --format="%h %s" --name-status --all
```

- ใช้ map ไฟล์ที่แก้จริงเข้ากับ task (ดูจากข้อความใน note/commit message)
- ถ้า note ระบุ commit hash อยู่แล้ว ใช้ hash นั้น verify ไฟล์ได้ด้วย `git show --name-status <hash>`
- ⚠️ ไฟล์ที่แก้ใน git แต่ไม่มีใน note ให้ flag เสริมได้ แต่ห้ามเดาว่าเป็นของ task ไหนถ้าไม่ชัด — ใส่ใน "หมายเหตุ" แทน

## กฎการเรียบเรียง (บังคับ)

- **อิงข้อเท็จจริงจาก notes/activity/git เท่านั้น** — ห้ามเติมงานที่ไม่มีหลักฐาน ห้ามเดา
- **รวม notes ของ task เดียวกันเป็นหนึ่งรายการ** — วันนึงอาจมีหลาย note ต่อ task (progress + final + corrected) ให้ merge เป็น 1 entry โดยเอาเวอร์ชันล่าสุด/สมบูรณ์สุดเป็นหลัก ห้ามลิสต์ note ซ้ำ ๆ
- **ใช้ business Task Code เท่านั้น** (FOBO-xxx, BO-QA-xxx, AIL-xxx) — ห้ามแสดง Kanban UUID/internal ID (hex 8 ตัว)
- **file path ต้องเป็น path จริงจาก note/git** — เช่น `Prototypes/bo-prototype.html`, `tests/qa-bo-026-roles-permissions.spec.js`, `deliverables/BO-TEST-COVERAGE-AUDIT.md`; ถ้า task แก้หลายไฟล์มากให้ย่อเป็นกลุ่ม เช่น "spec 9 ไฟล์ (05/02/00/15/16/BO_Spec/Addendum/README/DOCUMENT_VERSION)"
- **ภาษาคนทำงาน อ่านง่าย เหมือนสรุปส่งหัวหน้า** — เน้น "ทำอะไร ได้ผลอะไร แก้ที่ไหน" ไม่เล่าขั้นตอน; คำทับศัพท์ที่ทีมใช้ (spec, prototype, commit, test case) ใช้ตรง ๆ ได้
- **เน้นสิ่งที่ dev รับต่อต้องรู้** — ไฟล์ที่แก้, spec version ที่ bump, contract/jอที่ถูกถอด, decision ที่เปลี่ยนพฤติกรรม, สิ่งที่ commit ขึ้นไปแล้ว
- **เวลาใช้ `hours_spent` จาก kanban เท่านั้น** แสดง `D.D ชม.` — ห้ามปรับเอง; task ที่ยัง `in_progress` ให้ใส่ไว้ส่วน "งานที่ยังทำต่อ" แยกจากงานเสร็จ
- **Read-only workflow** — ห้ามแก้ task, ย้ายสถานะ, เรียก `log_time` หรือบันทึก note ใด ๆ; ห้ามส่ง log ไประบบภายนอก — ผลลัพธ์คือ copy block ให้ผู้ใช้ก๊อปเองเท่านั้น
- ถ้า note ของ task ไหนบางมาก (มีแค่บรรทัดเดียวไม่มีรายละเอียด) → สรุปจาก `get_task`/git แทน และ flag ไว้ในสรุปว่า "รายละเอียดจำกัด"

## Daily Summary Copy Block (template — แสดงใน ```text block เดียว)

```text
สรุปงานประจำวัน <DD/MM/YYYY>
ผู้รับผิดชอบ: <ชื่อ> | เวลารวม <X.X> ชม. | <N> task เสร็จ + <M> task ทำต่อ

ภาพรวมวันนี้
<2-3 บรรทัด บอกธีมของวันเป็นภาษาคน — วันนี้โฟกัสเรื่องอะไร ปิดอะไรสำคัญ เช่น "เน้นเติมชุดทดสอบ BO ตาม coverage gap และปิด decision ค้างของ FO-BO-001 audit chain">

งานที่ทำเสร็จ

1. <TASK-CODE> — <ชื่องาน> (<X.X> ชม.)
   - ทำอะไร: <1-2 บรรทัด เน้นผลลัพธ์ไม่ใช่ขั้นตอน>
   - ไฟล์ที่แก้: <path>; <path> (หรือกลุ่มไฟล์ เช่น "spec 9 ไฟล์")
   - Commit: <hash> (ถ้ามี)
   - ผลตรวจ: <ผล verify สั้น ๆ ถ้ามี เช่น 560/560 PASS ทุก viewport>

2. <TASK-CODE> — <ชื่องาน> (<X.X> ชม.)
   - ...

งานที่ยังทำต่อ (แสดงเฉพาะเมื่อมี task ค้าง in_progress)
- <TASK-CODE> — <ชื่อ> (<X.X> ชม. สะสม): ทำถึง <จุดที่ค้าง> — ขั้นต่อไป <next step จาก note>

งานค้าง/ส่งต่อ (แสดงเฉพาะเมื่อมี open items)
- <open item / decision ที่รอ approve / งานที่ notes ระบุว่าจะทำต่อ>

หมายเหตุสำหรับคนรับงานต่อ (แสดงเฉพาะเมื่อมีจุดต้องรู้)
- <จุดที่ dev ต้องรู้: spec bump เวอร์ชันไหน, จอ/ฟีเจอร์ถูกถอด, contract เปลี่ยน, file ถูกลบ, protected screen ที่ห้ามแตะ>
```

**กฎ Copy Block:**
- ทั้งสรุปอยู่ใน `text` code block เดียว — กด copy แล้ววางใน chat/docs ได้ทันที
- ใช้ข้อความธรรมดา ไม่ใช้ markdown heading/bold ใน block
- รายการย่อยใช้ `- ` นำหน้าเสมอ
- เรียงงานตามลำดับเวลา (เช้า→เย็น) หรือกลุ่มตามเรื่องถ้างานเยอะมาก — เลือกแบบที่อ่านเข้าใจง่ายสุด
- ถ้าวันนั้นไม่มีงาน → ไม่สร้าง block แจ้งผู้ใช้ว่าไม่มี session note/task ของวันนั้น

## Edge Cases

- **วันย้อนหลัง:** session notes ดึงย้อนไม่ได้ครบ → ใช้ `get_time_summary` + `get_task` activity + git log เป็นแหล่งหลัก แล้วแจ้งข้อจำกัด
- **งานที่ทำนอก kanban** (แก้โค้ด/commit แต่ไม่มี task ไม่มี note): ดึงจาก git log ใส่ในสรุป พร้อม flag ว่า "ไม่มี task ใน kanban"
- **ช่วงหลายวัน:** สรุปแยก block ต่อวัน ห้ามรวมข้ามวัน
- **Session ปัจจุบันยังไม่บันทึก note:** ถ้า session นี้ทำงานไว้แต่ยังไม่ได้ `save_session_note` ให้เสนอผู้ใช้ก่อนว่าจะบันทึก note งานค้างก่อนสรุปไหม (ทำตาม workflow `work-summary` สถานการณ์ที่ 3) หรือรวมงาน session นี้เข้าสรุปเลยโดยระบุว่า "จาก session ปัจจุบัน ยังไม่บันทึก note"

## Checklist

- [ ] ตรวจ machine guard ผ่านแล้ว
- [ ] กำหนดวันที่ถูกต้อง (Asia/Bangkok)
- [ ] เรียก `get_session_context` (วันนี้) + `get_time_summary` (status: all) แล้ว
- [ ] เรียก `get_task` เฉพาะ task ที่ note บาง/ขาด file path
- [ ] รัน `git log` เติม file path/commit (ถ้าอยู่ใน workspace)
- [ ] merge notes ของ task เดียวกันแล้ว ไม่มี entry ซ้ำ
- [ ] ไม่มี Kanban UUID ใน copy block — ใช้ Task Code
- [ ] file path ทุกตัวมาจาก note/activity/git จริง
- [ ] แยก "งานเสร็จ" กับ "งานทำต่อ" ชัดเจน
- [ ] แสดงใน `text` copy block เดียว
- [ ] ไม่ได้แก้ task/เวลา/สถานะใด ๆ
