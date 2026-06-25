# Daily Work Report: Tuk Daeng

**วันที่:** 2026-06-25  
**ผู้ทำงาน:** Codex handoff continuation  
**โปรเจกต์:** Tuk Daeng  
**Environment ที่ focus:** docs / Figma UX review / Dev-QA readiness  
**Branch:** docs-frontoffice-spec-updates-2026-06-16  
**สถานะ repo ตอนเริ่มงาน:** มีเอกสารหลายไฟล์ถูกแก้ต่อเนื่องจากรอบก่อน และมีไฟล์ Word input ที่ยัง untracked

---

## 1. สรุปงานวันนี้

วันนี้โฟกัส review และ lock UX behavior จาก Figma screens รอบ Asset Detail, Public Profile, Owner Profile, Permission / Unavailable state, comment actions และ profile/report/share flows แล้ว sync กลับเข้าเอกสาร PRD / Figma checklist / Dev checklist / QA checklist

งานหลักที่ทำ:

- เพิ่ม Add/Edit Asset uploading/saving state หลังกรอกครบแล้วกด Save
- Lock Permission denied / unavailable state, CTA `Go back`, header minimal และ message/icon แยกตามกรณี
- Lock Owner Asset Detail more menu, Delete Asset confirmation และ no Undo behavior
- Lock comment action menu, Delete Comment, Report Comment, nested comments sheet behavior
- Lock Public Profile / Owner Profile more menu, Share Profile, Report User และ Block User
- อัปเดตเอกสารหลักให้ Dev / QA / Figma ใช้ต่อได้

---

## 2. งานที่ทำวันนี้

### 2.1 Add/Edit Asset uploading state

สรุป decision:

- เมื่อ Owner กรอก Add/Edit Asset ครบและกด `Save` ต้องแสดง uploading/saving state
- หากมีไฟล์ upload ให้ใช้ copy `กำลังอัปโหลด...` / `Uploading...`
- ระหว่าง upload/save ต้อง disable ปุ่ม Save และป้องกัน duplicate submit
- ถ้าสำเร็จไป Asset Created / Asset Updated
- ถ้าล้มเหลวต้องมี retry หรือกลับไปแก้ไขรูป/ข้อมูล

ไฟล์ที่อัปเดต:

- `04_ASSET_MANAGEMENT_MODULE.md`
- `DEV_IMPLEMENTATION_CHECKLIST.md`
- `FIGMA_UX_CLEANUP_TASK_BREAKDOWN.md`
- `QA_TEST_SCENARIO_CHECKLIST.md`

### 2.2 Permission denied / unavailable state

สรุป decision:

- ใช้ minimal global header: menu + `TUK DAENG`
- ไม่แสดง asset title, owner name, Watch Alert, Share, More menu หรือ asset actions
- Primary CTA ใช้ `Go back`
- `Go back` กลับไปหน้าก่อนหน้าถ้ามี navigation history เช่น Feed, Profile, Chat, Watch Alert Result
- ถ้าไม่มี history เช่น external deep link ให้ fallback ไป Feed
- แยก message ตามกรณี:
  - Permission / Hide / Sold public link / blocked: `This item is not available to you.`
  - Deleted / Removed: `This item is no longer available.`
- Icon:
  - Permission: lock + user
  - Deleted / Removed: file/archive + x

ไฟล์ที่อัปเดต:

- `00_NAVIGATION_AND_CROSS_MODULE_FLOW.md`
- `05_ASSET_DETAIL_MODULE.md`
- `FIGMA_UX_CLEANUP_TASK_BREAKDOWN.md`
- `QA_TEST_SCENARIO_CHECKLIST.md`

### 2.3 Owner Asset Detail more menu และ Delete Asset

สรุป decision:

- Owner Asset Detail มุมขวาบนใช้ `...` more menu
- More menu เปิด bottom sheet
- รายการ:
  - `Share asset`
  - `Delete asset`
- `Delete asset` ต้องเปิด confirmation อีกชั้น ห้ามลบทันที
- Delete Asset ไม่มี Undo
- Confirmation copy:
  - Title: `Delete this asset?`
  - Body: `This action cannot be undone. This asset will be removed from Feed, Search, Watch Alert results, and your public profile. Related chats will remain, but related offers will be cancelled.`
  - Actions: `Cancel`, `Delete`
- หลัง delete สำเร็จ asset หายจาก Feed, Search, Watch Alert และ Public Profile
- related chats ยังอยู่ แต่ related offers เป็น Cancelled

ไฟล์ที่อัปเดต:

- `04_ASSET_MANAGEMENT_MODULE.md`
- `FIGMA_UX_CLEANUP_TASK_BREAKDOWN.md`
- `DEV_IMPLEMENTATION_CHECKLIST.md`
- `QA_TEST_SCENARIO_CHECKLIST.md`

### 2.4 Comment action menu, Delete Comment และ Report Comment

สรุป decision:

- Comment action ใช้ปุ่ม `...` แนวนอนข้างเวลาของแต่ละ comment / reply
- Comment ของตัวเอง:
  - แสดง `Delete comment`
  - ต้องมี confirmation
  - ไม่มี Undo
- Comment ของคนอื่น:
  - แสดง `Report comment`
- ไม่ใส่ `Hide comment` ใน V1
- ไม่ให้ Owner ลบ comment ของคนอื่นจาก FO โดยตรง; ใช้ Report Comment แล้วให้ Admin / Trust & Safety moderation

Delete Comment:

- Title: `Delete this comment?`
- Reply หรือ root comment ที่ไม่มี replies: `This action cannot be undone. This comment will be removed.`
- Root comment ที่มี replies: `This action cannot be undone. This comment and its replies will be removed.`
- ลบ root comment แล้ว replies ใต้ root comment ต้องหายทั้งหมด ทั้งที่แสดงอยู่และ collapsed
- ลบ reply แล้วลบเฉพาะ reply นั้น
- Success feedback: `This comment was removed.`

Report Comment:

- Title: `Report this comment`
- Description: `Select a reason for reporting this comment. Our team will review it.`
- Reasons:
  - `Harassment or hate`
  - `Spam or scam`
  - `Inappropriate content`
  - `False or misleading information`
  - `Other`
- `Submit report` disabled จนเลือก reason
- Report สำเร็จ comment ไม่หายทันที
- Success copy: `Our team will review this comment. It will remain visible until moderation is complete.`
- Success action: `Done`

Nested sheet behavior:

- `View all comments` เปิด Comments bottom sheet
- กด `...` ใน Comments sheet เปิด comment action sheet เป็นชั้นบนสุด
- ปิด action sheet ต้องไม่ปิด Comments sheet
- หลัง report/delete สำเร็จกลับ Comments sheet เดิม และคง scroll context เท่าที่ทำได้

ไฟล์ที่อัปเดต:

- `05_ASSET_DETAIL_MODULE.md`
- `11_SOCIAL_MODULE.md`
- `15_TRUST_SAFETY_MODULE.md`
- `FIGMA_UX_CLEANUP_TASK_BREAKDOWN.md`
- `DEV_IMPLEMENTATION_CHECKLIST.md`
- `QA_TEST_SCENARIO_CHECKLIST.md`

### 2.5 Public Profile more menu, Share Profile, Report User และ Block User

สรุป decision สำหรับ Public Profile ของ user อื่น:

- More menu ใช้ `...` มุมขวาบน
- รายการ:
  - `Share profile`
  - `Report user`
  - `Block user`
- ไม่แสดง owner-only หรือ asset-level actions เช่น Edit Profile, Settings, Delete asset, Report asset, Hide asset, Edit asset, Mark as sold

Share Profile:

- เปิด profile share sheet เป็น bottom sheet
- มี profile preview card พร้อม profile image และ display name
- รองรับ share channels ตาม platform เช่น LINE, Instagram, Facebook เมื่อ available
- ต้องมี `Copy Link` fallback
- Copy Link ต้องมี feedback เช่น `Profile link copied`

Report User:

- Title: `Report this user`
- Description: `Select a reason for reporting this user. Our team will review it.`
- Reasons:
  - `Fraud or scam`
  - `Impersonation`
  - `Harassment or hate`
  - `Inappropriate content`
  - `Spam`
  - `Other`
- Report submit แล้ว profile/content ไม่หายทันที
- Success copy: `Our team will review this user. This profile will remain visible until moderation is complete.`
- Success action: `Done`

Block User:

- ต้องเปิด confirmation ก่อน block
- หลัง block ใช้ Trust & Safety block rule เดียวกัน และ content ของ user นั้นถูก filter ตาม baseline

ไฟล์ที่อัปเดต:

- `06_PROFILE_MODULE.md`
- `15_TRUST_SAFETY_MODULE.md`
- `FIGMA_UX_CLEANUP_TASK_BREAKDOWN.md`
- `DEV_IMPLEMENTATION_CHECKLIST.md`
- `QA_TEST_SCENARIO_CHECKLIST.md`

### 2.6 Owner Profile more menu และ Share Profile

สรุป decision:

- Owner Profile เปลี่ยนปุ่ม gear มุมขวาบนเป็น `...`
- More menu รายการ:
  - `Share profile`
  - `Settings`
- ใช้ label `Settings` ไม่ใช่ `Setting`
- ปุ่ม `+` มุมซ้ายบนเป็น Add Asset
- ปุ่ม `Edit Profile` กลางหน้าเป็น primary owner action ต่อไป
- Share Profile ใช้ share sheet แบบเดียวกับ Public Profile แต่ preview เป็น profile ของตัวเอง
- ไม่แสดง `Report user` หรือ `Block user` ให้ owner report/block ตัวเอง

ไฟล์ที่อัปเดต:

- `06_PROFILE_MODULE.md`
- `FIGMA_UX_CLEANUP_TASK_BREAKDOWN.md`
- `DEV_IMPLEMENTATION_CHECKLIST.md`
- `QA_TEST_SCENARIO_CHECKLIST.md`

---

## 3. Dev / QA handoff impact

Dev checklist ที่เพิ่ม:

- Add/Edit Asset uploading/saving state และ duplicate submit prevention
- Delete Asset confirmation/no Undo
- Comment action menu, own comment delete, other comment report
- Root comment deletion impact ต่อ replies
- Report Comment / Report User success ไม่ซ่อน content ทันที
- Nested Comments sheet behavior
- Public/Owner Profile more menu และ share sheet

QA scenarios ที่เพิ่ม:

- Add/Edit Asset uploading state success/failure
- `Go back` fallback behavior สำหรับ unavailable/permission state
- Delete Asset no Undo
- Delete root comment with replies
- Delete reply only
- Report Comment success copy
- Nested comment action sheet
- Public Profile more menu
- Owner Profile more menu
- Profile Share Sheet
- Report User success copy และ profile remains visible

---

## 4. งานที่ยังค้าง / ความเสี่ยง

| งาน | เหตุผลที่ค้าง | Next Step | ผู้เกี่ยวข้อง |
| --- | --- | --- | --- |
| Commit งานเอกสารทั้งหมด | ยังไม่ได้รับคำสั่งให้ commit และ repo มีไฟล์/changes หลายชุดจากรอบก่อน | ตรวจ diff รวมและ commit เฉพาะ docs ที่ต้องการ | Repo owner / Product |
| ตรวจ Figma implementation รอบสุดท้าย | วันนี้ validate จาก screenshots และปรับ spec แล้ว ยังไม่ได้มี automated visual QA | UX ตรวจ Figma ว่า copy, menu และ bottom sheet ตรง spec ล่าสุด | UX / Product |
| Block User confirmation copy | วันนี้สรุปว่าต้องมี confirmation แต่ยังไม่ได้ lock final copy รายละเอียดเท่า Delete/Report | นัด lock copy ถ้าต้องการละเอียดระดับ modal | Product / UX |
| Share platform behavior จริง | ระบุ system/share channel และ Copy Link fallback แล้ว แต่ implementation ต้องดู platform API จริง | Dev validate platform share availability และ fallback | Dev |

---

## 5. สิ่งที่ตรวจสอบแล้ว

- [x] เอกสาร module หลักถูกอัปเดตตาม decision วันนี้
- [x] Figma cleanup work pack มี requirement ใหม่สำหรับ profile/comment/report/share flows
- [x] Dev checklist มีรายการ implementation ที่ต้องทำ
- [x] QA checklist มี scenarios สำหรับ flow ใหม่
- [x] ยืนยัน rule ว่า Report User / Report Comment ไม่ทำให้ content หายทันที
- [x] ยืนยัน Delete Asset และ Delete Comment ไม่มี Undo
- [ ] ยังไม่ได้ commit
- [ ] ยังไม่ได้รัน test เพราะเป็น docs/spec update

---

## 6. สรุปสำหรับส่งบริษัท

วันนี้ปิดรายละเอียด UX/spec สำคัญของ Front Office เพิ่มเติมจาก Figma review ได้แก่ uploading state ของ Add/Edit Asset, unavailable/permission state, owner asset delete flow, comment delete/report flow, profile share/report/block flow และ owner profile menu

ผลลัพธ์คือ Dev / QA / Figma มี rule ที่ชัดขึ้นสำหรับ:

1. การบันทึก asset ที่มี upload ต้องมี loading state และป้องกัน submit ซ้ำ
2. หน้า unavailable/permission ต้องใช้ `Go back` และแยก message/icon ตามกรณี
3. Delete Asset และ Delete Comment เป็น destructive action ที่ไม่มี Undo และต้องมี confirmation
4. Report Comment และ Report User ไม่ทำให้ content/profile หายทันทีจนกว่า moderation จะดำเนินการ
5. Public Profile และ Owner Profile ใช้ more menu ต่างกันตามสิทธิ์ พร้อม share sheet และ Copy Link fallback

งานวันนี้เป็น docs/spec update ทั้งหมด ยังไม่ได้ commit และยังไม่ได้รัน automated test

