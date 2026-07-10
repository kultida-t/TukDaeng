# สรุปรายงานการประชุม
## เรื่อง: วิธีการใช้ GitHub สำหรับการทำงานร่วมกันในทีม

## วัตถุประสงค์

กำหนดแนวทางการใช้ GitHub ให้เป็นมาตรฐานเดียวกันในทีม เพื่อให้สามารถติดตามงาน แยกงานเป็นส่วนย่อย ตรวจสอบความคืบหน้า และดูประวัติการทำงานของแต่ละคนได้ชัดเจน

---

## แนวทางการทำงานหลัก

ทีมตกลงให้ใช้ GitHub เป็นเครื่องมือหลักในการจัดการงาน โดยให้ทุกคนสร้าง branch แยกตามงานที่รับผิดชอบ ไม่ควรแก้ไขงานรวมกันใน branch เดียวหรือ commit ตรงเข้า branch หลักโดยไม่จำเป็น

Workflow ที่แนะนำคือ:

```text
Create branch → Edit/Add files → Commit → Pull Request → Merge → Delete branch
```

---

## รูปแบบการตั้งชื่อ Branch

กำหนดให้ใช้รูปแบบ:

```text
[person]/[project]/[role]/[task]
```

ตัวอย่าง:

```text
noon/payment/ba/refund-usecase
noon/payment/design/refund-dialog
noon/member/ba/register-flow
noon/member/design/profile-empty-state
```

ความหมายของแต่ละส่วน:

```text
ชื่อคน / โปรเจค / บทบาท / งานที่ทำ
```

ตัวอย่างเช่น:

```text
noon/payment/ba/refund-usecase
```

หมายถึง Noon ทำงานในโปรเจค Payment ในบทบาท BA เรื่อง Refund Use Case

---

## หลักการแตก Branch

เมื่อเริ่มทำฟีเจอร์ใหม่ แก้ issue หรือทำงานย่อยใด ๆ ให้สร้าง branch ใหม่ทุกครั้งจาก branch หลักของทีม เช่น `main` หรือ `develop`

แต่ละ branch ควรเป็นงานขนาดเล็ก ใช้เวลาจัดการจน commit ไม่เกินประมาณ 1 ชั่วโมง หากงานใหญ่เกิน 1 ชั่วโมง ควรแตกออกเป็น branch ย่อยเพิ่มเติม เพื่อให้ review ง่าย ติดตามง่าย และลดความเสี่ยงในการรวมงานขนาดใหญ่เกินไป

---

## การ Commit

เมื่อทำงานย่อยเสร็จ ให้ commit ทันที ไม่ควรปล่อยงานค้างไว้นานหรือรวมหลายเรื่องไว้ใน commit เดียว

ทุก commit ต้องมีข้อความอธิบายชัดเจนว่าแก้อะไรหรือเพิ่มอะไร เช่น:

```text
add refund use case
update refund exception cases
design refund confirmation dialog
revise member registration flow
```

ไม่ควรใช้ข้อความ commit ที่ไม่ชัดเจน เช่น:

```text
update
fix
done
final
```

---

## การใช้ Pull Request

เมื่องานใน branch เสร็จแล้ว ให้เปิด Pull Request เพื่อรวมงานกลับเข้า branch หลักของทีม เช่น `develop` หรือ `main`

ตัวอย่าง:

```text
noon/payment/ba/refund-usecase → develop
```

Pull Request ช่วยให้ทีมสามารถตรวจสอบงานก่อน merge และเห็นรายละเอียดว่า branch นี้ทำอะไรบ้าง

---

## การ Merge และลบ Branch

หลังจาก Pull Request ผ่านการตรวจสอบและ merge แล้ว สามารถลบ branch นั้นออกได้ เพื่อไม่ให้ branch ค้างหรือรกใน GitHub

Branch ถือเป็นพื้นที่ทำงานชั่วคราว เมื่อเสร็จและ merge แล้วไม่จำเป็นต้องเก็บไว้ ยกเว้นกรณีที่ทีมต้องการเก็บเพื่ออ้างอิงเป็นพิเศษ

---

## การใช้งานสำหรับทุก Role

แนวทางนี้ไม่ได้ใช้เฉพาะ Developer เท่านั้น แต่ใช้ได้กับทุกตำแหน่ง เช่น:

```text
BA
Designer
QA
PM
Developer
```

ตัวอย่างงานของ BA:

```text
noon/payment/ba/refund-business-rule
noon/payment/ba/refund-usecase
noon/payment/ba/refund-exception-case
```

ตัวอย่างงานของ Designer:

```text
noon/payment/design/refund-wireframe
noon/payment/design/refund-dialog
noon/member/design/profile-empty-state
```

---

## ประโยชน์ที่คาดว่าจะได้รับ

ทีมสามารถรู้ได้ว่าแต่ละคนทำอะไรในแต่ละวัน แม้ไม่มีการวางแผนละเอียดล่วงหน้า ก็สามารถดูจาก branch และ commit history ได้

นอกจากนี้ยังช่วยให้:

- แยกงานเป็นส่วนย่อย
- review งานง่ายขึ้น
- rollback งานได้ง่าย
- ลดปัญหางานค้าง
- ลดการทำงานปนกันหลายเรื่อง
- ติดตาม progress ของแต่ละคนได้ชัดเจน
- เห็นภาพรวมงานเมื่อสิ้นวัน

---

## ข้อสรุป

ทีมจะใช้ GitHub เป็นมาตรฐานกลางในการทำงาน โดยให้ทุกคนสร้าง branch ตามงานย่อยของตนเอง ตั้งชื่อ branch ด้วยรูปแบบ:

```text
[person]/[project]/[role]/[task]
```

ทำงานให้จบเป็นชิ้นเล็ก ๆ commit พร้อมคำอธิบาย เปิด Pull Request เพื่อ review และ merge เมื่อเสร็จ จากนั้นลบ branch ที่ใช้งานเสร็จแล้วออกได้ทันที เพื่อให้ GitHub สะอาดและติดตามงานได้ง่ายขึ้น
