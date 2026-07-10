# Company Git & Work Report Policy - Jun 2026

เอกสารนี้บันทึก policy การทำงานของบริษัทสำหรับใช้เป็น checklist ในโปรเจกต์นี้ และใช้เป็นฐานสำหรับสรุปรายงานเมื่อบริษัทขอรายงานย้อนหลัง

## Policy

1. แตก branch ทุกครั้งเมื่อทำฟีเจอร์ใหม่ หรือแก้ issue จาก environment ที่ focus อยู่
2. แต่ละ branch ไม่ควรใช้เวลาทำเกิน 1 ชั่วโมงในการจัดการจน commit
3. ถ้า branch มากกว่า 1 ชั่วโมง ให้แตก branch ย่อยเพื่อ breakdown งานให้จบในเวลาน้อยกว่า 1 ชั่วโมง
4. พยายาม commit branch ทุกครั้งเมื่อเสร็จ อย่าทิ้งงานยาว
5. เมื่อ commit และ merge แล้ว สามารถลบ branch ฟีเจอร์นั้นออกได้ถ้าไม่ต้องการเก็บไว้
6. ต้องเขียน comment ทุกครั้งที่ commit
7. ทุกคนต้องเห็นได้ว่าแต่ละวันทำอะไรไปบ้าง แม้จะมีแผนหรือไม่มีแผนก็ตาม
8. ใช้กับทุกตำแหน่ง ไม่ใช่เฉพาะ developer
9. คนที่ใช้ git ไม่เป็นต้องศึกษา เพราะ git คือเครื่องมือของบริษัท
10. ไม่จำเป็นต้อง push ขึ้น host git ทุกครั้งก็ได้ แต่ developer ควร push ตาม workflow ปกติ
11. แม้จะดูจุกจิก แต่ทำเพื่อให้ทุกคนเห็นงาน ช่วยตรวจสอบย้อนหลัง และลดความเสี่ยงของงานค้าง

## Working Rules For This Project

เมื่อต้องเริ่มงานใหม่ในโปรเจกต์นี้ ให้ใช้แนวทางต่อไปนี้:

1. ตรวจ environment / branch ปัจจุบันก่อนเริ่มงาน
2. แตก branch ใหม่สำหรับงานนั้น เช่น `feature/bo-board-category-list` หรือ `fix/bo-responsive-table`
3. จำกัด scope ให้เล็กพอจบใน 1 ชั่วโมง
4. ถ้างานเริ่มใหญ่ ให้แตกเป็น branch ย่อย เช่น
   - `feature/bo-board-list`
   - `feature/bo-board-category`
   - `feature/bo-board-banner`
5. เมื่อเสร็จ ให้ commit พร้อมข้อความที่บอกว่าทำอะไรและทำไปเพื่ออะไร
6. บันทึกรายงานลง worklog เพื่อใช้ตอบรายงานรายวันหรือรายสัปดาห์

## Commit Message Format

ใช้รูปแบบนี้เพื่อให้รายงานย้อนหลังง่าย:

```text
<type>: <summary>

- What: ทำอะไร
- Why: ทำไปเพื่ออะไร
- Scope: กระทบไฟล์/โมดูลไหน
- Test: ตรวจอะไรแล้ว
```

ตัวอย่าง:

```text
feat: add board category management prototype

- What: เพิ่ม tab หมวดหมู่ในหน้า Board BO
- Why: ให้ Admin ดูและจัดการหมวดหมู่บทความได้จาก BO
- Scope: bo-preview.html
- Test: เปิด preview แล้วกด tab หมวดหมู่/เพิ่มหมวดหมู่ได้
```

## Branch Naming

| Type | Pattern | Example |
|---|---|---|
| Feature | `feature/<short-name>` | `feature/bo-board-category` |
| Fix | `fix/<short-name>` | `fix/mobile-table-scroll` |
| Document | `docs/<short-name>` | `docs/bo-prd` |
| Prototype | `prototype/<short-name>` | `prototype/bo-admin-flow` |
| Chore | `chore/<short-name>` | `chore/worklog-template` |

## Daily Reporting Checklist

เมื่อสิ้นวัน ให้ตอบได้ว่า:

- วันนี้ทำ branch อะไรบ้าง
- แต่ละ branch ใช้เวลาประมาณเท่าไร
- commit อะไรไปบ้าง
- งานไหน merge แล้ว
- งานไหนค้าง เพราะอะไร
- มีไฟล์หรือ module ไหนได้รับผลกระทบ
- ตรวจสอบ/preview/test อะไรแล้ว
- พรุ่งนี้ควรทำอะไรต่อ

