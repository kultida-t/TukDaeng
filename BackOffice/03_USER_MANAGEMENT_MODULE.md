# 03 โมดูลจัดการผู้ใช้ BO

อ้างอิง:

- `00_GLOBAL_RULES_MODULE.md`
- `01_AUTHENTICATION_MODULE.md`
- `02_DASHBOARD_MODULE.md`
- `BO_MASTER_BASELINE.md`
- `../ProjectAdmin/FO_BO_INTEGRATION_MAP.md`
- `../FrontOffice/01_AUTHENTICATION_MODULE.md`
- `../FrontOffice/06_PROFILE_MODULE.md`
- `../FrontOffice/15_TRUST_SAFETY_MODULE.md`

---

# 1. ข้อมูลเอกสาร

| ฟิลด์ | รายละเอียด |
| --- | --- |
| ชื่อโมดูล | BO User Management / จัดการผู้ใช้หลังบ้าน |
| แพลตฟอร์ม | เว็บ Back Office แบบ Responsive |
| เวอร์ชัน | `BO-PRD-v0.1` |
| สถานะ | Draft / ฉบับร่าง |
| เจ้าของงาน | Product / UX / Engineering / Operations |
| ประเภทเอกสาร | Functional PRD |

# 2. วัตถุประสงค์

User Management ใช้ให้ Admin ตรวจสอบและจัดการบัญชีผู้ใช้ FO ในมุมงานปฏิบัติการ งานช่วยเหลือ และความปลอดภัย/ความน่าเชื่อถือ โดยต้องรองรับการค้นหาผู้ใช้ การตรวจโปรไฟล์ ประวัติการเข้าสู่ระบบ วิธีล็อกอิน สถานะรายงาน การระงับ/แบนบัญชี การรีเซ็ตรหัสผ่านเฉพาะบัญชี Email/Password การลบแบบ soft delete/archive และการ export ตามสิทธิ์

โมดูลนี้ต้องไม่สร้างสิทธิ์หรือประเภทผู้ใช้แบบ Admin ใน FO ผู้ใช้ FO ทุกคนยังเป็นประเภทบัญชีเดียวคือ `User` แต่ BO สามารถเปลี่ยนสถานะบัญชีเพื่อควบคุมการเข้าสู่ระบบและการแสดงผลสาธารณะตาม policy

# 3. ขอบเขต

## อยู่ในขอบเขต

- รายการผู้ใช้
- การค้นหา/filter/sort/pagination
- รายละเอียดโปรไฟล์ผู้ใช้
- การแสดงวิธีล็อกอิน: Email, Apple, Google
- ประวัติการเข้าสู่ระบบ
- สถานะผู้ใช้: `Pending Verification`, `Active`, `Suspended`, `Banned`, `Deletion Requested`, `Deleted / Archived`
- บริบทสำหรับ review ผู้ใช้ที่ถูกรายงาน
- การ `Suspend` / `Ban` / `Unsuspend` / `Unban`
- การรีเซ็ตรหัสผ่านเฉพาะบัญชี Email/Password
- การ soft delete / archive ผู้ใช้โดย Admin ตามสิทธิ์
- Policy/permission สำหรับ export user data โดยไม่เพิ่มปุ่ม export ใน User List ใน Phase 1
- Audit log สำหรับทุก mutation และการเข้าถึงข้อมูล sensitive
- การ map ผลกระทบต่อ FO
- Layout รายการ/รายละเอียด/action ที่รองรับ responsive

## อยู่นอกขอบเขต

- การ implement sign up/sign in ของ FO
- Workflow การลบบัญชีเต็มรูปแบบจาก FO request queue ซึ่งอยู่ใน `13_ACCOUNT_DELETION_MODULE.md`
- Flow อุทธรณ์การแบน
- การให้คะแนนความเสี่ยงอัตโนมัติ
- การเชื่อมต่อ CRM
- การแบ่งกลุ่มบัญชีผู้ใช้แบบ Buyer/Seller/Collector

# 4. การเข้าถึงและสิทธิ์ของ Admin

BO มีประเภทบัญชีผู้ดูแลเพียงประเภทเดียวคือ `Admin` ไม่มีการแยกเป็น admin ย่อยหลายระดับใน module นี้ การเข้าถึงและการกระทำใน User Management ต้องควบคุมด้วย policy ของแต่ละ action และ policy สำหรับข้อมูล sensitive แทน

หลักการสำคัญคือ Admin เห็นหรือทำ action ได้เฉพาะเมื่อได้รับสิทธิ์ใน module นั้นแล้ว และ action ที่มีผลต่อผู้ใช้ FO หรือเกี่ยวข้องกับข้อมูลส่วนตัวต้องมี confirmation, reason และ audit log ตามระดับความเสี่ยง

| พื้นที่การเข้าถึง | กฎการใช้งาน |
| --- | --- |
| ดูข้อมูลผู้ใช้ | Admin ดู User List และ User Detail ได้เมื่อได้รับสิทธิ์เข้าใช้งาน User Management module |
| Reset password | ทำได้เฉพาะบัญชีที่สมัครด้วย Email/Password เท่านั้น และต้องบันทึก audit log ทุกครั้ง |
| Suspend / ban / unban | ต้องมีหน้าจอยืนยัน action, ระบุ reason, แสดงผลกระทบต่อ FO ให้ Admin เห็นก่อนยืนยัน และบันทึก audit log |
| Soft delete / archive | ต้องมีหน้าจอยืนยัน action, ระบุ reason, ตรวจสอบ retention/dependency ที่เกี่ยวข้อง และบันทึก audit log |
| ข้อมูล sensitive | ต้อง mask เป็นค่าเริ่มต้น เช่น email, phone, IP หรือ device detail การกดดูข้อมูลเต็มต้องมี policy รองรับและต้องถูกบันทึก audit |
| Export user data | ต้องอยู่ภายใต้ export policy, จำกัด scope ของข้อมูลที่ export, ระบุ reason เมื่อมีข้อมูล sensitive และบันทึก audit event |

หมายเหตุ: สิทธิ์ในตารางนี้เป็น baseline สำหรับ Phase 1 หากอนาคตต้องมี role หรือ permission level ที่ละเอียดขึ้น ให้เพิ่มผ่าน policy กลางของ BO ไม่ควรเพิ่ม account type ใหม่ใน FO user model

# 5. Layout แบบ Responsive

| ขนาดหน้าจอ | รูปแบบ Layout |
| --- | --- |
| Mobile `< 768px` | รายการผู้ใช้เป็น card list พร้อม drawer สำหรับค้นหา/filter; หน้ารายละเอียดเรียงเป็น section ซ้อนลงมา; action menu ใช้ bottom sheet |
| Tablet `768px - 1199px` | ใช้ table หรือ card list ตามพื้นที่; หน้ารายละเอียดใช้ 2 column ได้; filter อยู่ใน drawer |
| Desktop `>= 1200px` | ใช้ dense table, filter ด้านข้าง และหน้ารายละเอียดพร้อม action panel |
| Wide Desktop `>= 1440px` | รองรับ split list/detail หรือหน้ารายละเอียดพร้อม audit/activity side panel |

ข้อกำหนด:

- Action สำคัญ เช่น suspend/ban ต้องใช้งานได้บน mobile แต่ต้องมี confirmation ชัดเจน
- ประวัติการเข้าสู่ระบบและรายการ activity ต้องอ่านได้บนจอเล็กโดยข้อมูลสำคัญไม่ล้นหน้าจอ
- การ mask ข้อมูล sensitive ต้องชัดเจนและไม่ทำให้ layout พัง

# 6. รายการผู้ใช้

รายการผู้ใช้ต้องรองรับ:

- ค้นหาจาก display name, email และ internal User ID/reference ในกรณีที่ทีม support ได้ ID มาจาก report หรือ audit log
- Filter ตามสถานะบัญชี
- Filter ตามวิธีล็อกอิน
- Filter ตามวันที่สมัคร
- Filter ตามวันที่ใช้งานล่าสุด
- Filter ตามสถานะการถูกรายงาน
- Filter ตามช่วงจำนวน asset หรือบัญชีที่มี asset
- Sort ตามวันที่สร้างบัญชี, วันที่ใช้งานล่าสุด, จำนวน report และจำนวน asset
- Pagination แบบ server-side
- User List ใน Phase 1 ไม่ต้องมีปุ่ม export โดยตรง หากต้อง export ข้อมูลผู้ใช้ให้ใช้ workflow ที่ควบคุม permission ใน Reports/export หรือ system-level export แยกต่างหาก

## Column / Field สำคัญ

| Field | ตารางบน Desktop | Card บน Mobile |
| --- | --- | --- |
| User ID | ไม่แสดงใน list; ใช้ได้ในหน้ารายละเอียดและการค้นหาสำหรับ support | แสดงเฉพาะในรายละเอียด |
| Display Name | แสดง | ข้อมูลหลัก |
| Email | แสดงแบบ masked ตาม permission | ข้อมูลรอง / masked |
| Auth Method | แสดง | แสดง |
| Status | แสดง | badge หลัก |
| Date Joined | แสดง | ข้อมูลรอง |
| Last Active | แสดง | ข้อมูลรอง |
| Total Assets | แสดง | ข้อมูลรอง |
| Report Count | แสดง | badge เมื่อมากกว่า 0 |
| Actions | แสดง | เมนู More |

# 7. รายละเอียดผู้ใช้

หน้ารายละเอียดผู้ใช้ต้องแสดงข้อมูลเป็น section:

| Section | เนื้อหา |
| --- | --- |
| Account Summary | User ID, display name, รูปโปรไฟล์, สถานะ, วันที่สมัคร, การใช้งานล่าสุด |
| Contact / Auth | Email, วิธีล็อกอิน, SSO provider, สถานะการยืนยัน email; contact field ที่เป็น optional เช่น phone/Line/Facebook/Instagram แสดงเฉพาะเมื่อผู้ใช้กรอกไว้ภายหลังใน profile/contact details |
| FO Profile Preview | สรุป public profile และ link/deep link reference |
| Assets Summary | จำนวน asset แยกตาม Sale, Show, Hide, Sold, Removed/Hidden |
| Reports | ประวัติผู้ใช้ที่ถูกรายงาน, เหตุผล report, สถานะ, report ล่าสุด |
| Login History | ความพยายามเข้าสู่ระบบล่าสุด, วิธีล็อกอิน, device/IP เมื่อ policy อนุญาต |
| Support Context | Ticket ที่เชื่อมโยง, ปัญหาบัญชี, ประวัติ reset password |
| Account Deletion Context | สรุป offers/assets/chats ที่ยัง pending เมื่อเกี่ยวข้อง |
| Activity Timeline | Event ล่าสุดที่เกี่ยวกับ FO และ BO |
| Audit Summary | Action ล่าสุดของ admin ตาม role ที่ได้รับอนุญาต |

ข้อมูล sensitive:

- Email / อีเมล
- Phone / เบอร์โทรศัพท์
- IP address / หมายเลข IP
- Device identifier / รหัสอุปกรณ์
- รายละเอียดประวัติการเข้าสู่ระบบ
- รายละเอียด archive จากการลบบัญชี

กฎการแสดง Contact / Auth:

- BO ต้องดึงข้อมูล contact/profile ที่ผู้ใช้กรอกจาก FO มาแสดงเท่าที่มีจริง และต้องไม่แสดง row ว่าง
- Field หลักจาก FO Settings / Edit Profile ได้แก่ `Username`, `Phone`, `Line`, และ `Email Display`
- Email แสดงจาก auth/provider ตาม rule ของ FO และโดยทั่วไปเปลี่ยนไม่ได้เมื่อ verify แล้ว
- Social/contact เพิ่มเติม เช่น `Facebook` หรือ `Instagram` แสดงได้เฉพาะเมื่อมีข้อมูลจาก flow ที่รองรับ เช่น consignment/contact context หรือ future profile field ที่ Product อนุมัติ
- Contact fields ต้อง mask ตาม permission และ audit เมื่อต้องดูข้อมูล sensitive แบบ unmasked
- User Detail prototype แสดง email แบบเต็ม และแสดง phone/Line/Facebook/Instagram เฉพาะกรณีที่ผู้ใช้กรอกไว้ภายหลังใน profile/contact details; ระบบจริงยังต้องควบคุม permission และ audit การเข้าถึงข้อมูล sensitive ตาม global security rule

ต้อง mask ตาม admin access และ audit-log เมื่อ access/export เป็น high-risk

# 8. โมเดลสถานะผู้ใช้

| Status | ความหมายใน BO | ผลกระทบต่อ FO |
| --- | --- | --- |
| Pending Verification | ผู้ใช้สมัครด้วย Email/Password แล้ว แต่ยังไม่ยืนยัน OTP/email | ยังไม่ถือเป็น authenticated member; ใช้ได้เฉพาะ flow ยืนยันตัวตนหรือ resend OTP ตาม FO Auth rule |
| Active | ผู้ใช้ใช้งาน FO ได้ปกติ | Login และ action ปกติทำได้ |
| Suspended | จำกัดการใช้งานชั่วคราวตาม policy | Login ถูก block หรือ session ถูก revoke; ต้องเห็น suspension state ตาม FO Auth rule |
| Banned | จำกัดการใช้งานถาวรจนกว่า Admin จะปลด | Login ถูก block และผู้ใช้ไม่สามารถสร้าง activity ใหม่ |
| Deletion Requested | ผู้ใช้ขอปิด/ลบบัญชีแล้ว และกำลังอยู่ใน workflow ตรวจ dependency | Login/session และ public visibility ต้องเป็นไปตาม Account Deletion policy |
| Deleted / Archived | บัญชีถูกลบหรือ archive ตาม workflow สำเร็จแล้ว | Login ถูก block; public profile/assets ถูกซ่อนหรือ anonymized ตาม retention policy |

การเปลี่ยนสถานะ:

| การเปลี่ยนสถานะ | สิทธิ์ | ข้อมูลที่ต้องระบุ | ผลกระทบต่อ FO | Audit |
| --- | --- | --- | --- | --- |
| Pending Verification -> Active | System | OTP/email verified | ผู้ใช้เริ่มใช้งาน authenticated FO features ได้ | Yes |
| Active -> Suspended | Admin | Reason, optional duration | Login/action ถูก block | Yes |
| Suspended -> Active | Admin | Reason | Login/action กลับมาใช้งานได้ | Yes |
| Active/Suspended -> Banned | Admin | Reason | Login/action ถูก block ถาวรจนกว่าจะ unban | Yes |
| Banned -> Active | Admin | Reason | Login/action กลับมาใช้งานได้ | Yes |
| Active/Suspended/Banned -> Deletion Requested | System / Account Deletion | Deletion request created | เข้าสู่ deletion workflow และต้องตรวจ dependency ก่อนลบจริง | Yes |
| Deletion Requested -> Deleted / Archived | Admin / Account Deletion | Reason, retention/validation note, dependency cleared | Login ถูก block, public profile/assets ถูก hidden/anonymized | Yes |

## 8.1 Policy การระงับและแบนบัญชี

การเปลี่ยนสถานะจาก report ต้องแยกเป็น 2 ชั้น:

1. Queue `Reported Users` คือรายการที่ต้อง review
2. `Suspended` / `Banned` คือผลลัพธ์จาก policy หรือการตัดสินใจของ Admin

จำนวน report ไม่ควรทำให้ผู้ใช้ถูก ban อัตโนมัติทันที เพราะอาจเป็น false report หรือการกลั่นแกล้งได้ แต่สามารถใช้เป็น threshold เพื่อให้ระบบเพิ่มความเร่งด่วนและระงับชั่วคราวได้ตาม policy

Policy ที่แนะนำ:

| เงื่อนไข | พฤติกรรมของ System / BO | สถานะผลลัพธ์ |
| --- | --- | --- |
| มี report 1-2 รายการที่ดูมีมูล | เข้าคิว `Reported Users` และแสดงในจำนวน report | ยังเป็น `Active` จนกว่า Admin review |
| มี report `>= 3` รายการภายในช่วงเวลาสั้น เช่น 7 วัน หรือมาจากผู้รายงานต่างคน | เพิ่ม priority เป็น high-risk review และแจ้ง Dashboard / Work Queue | ยังเป็น `Active` หรือ `Suspended` ถ้าเข้า risk rule |
| มี report `>= 5` รายการ, พบ pattern หลอกลวงซ้ำ, impersonation, spam offer, หรือมี evidence จาก asset/chat ที่เสี่ยงสูง | ระบบสามารถแนะนำหรือทำ `Suspended` ชั่วคราวตาม policy เพื่อหยุดความเสียหายระหว่าง review | `Suspended` |
| Admin review แล้วพบว่าไม่ผิด / report ไม่สมเหตุสมผล | ปิด report เป็น cleared และคืนสิทธิ์ | `Active` |
| Admin review แล้วผิดจริงแต่ไม่รุนแรง | คง `Suspended` พร้อม duration / reason หรือ warning ตาม policy | `Suspended` |
| Admin review แล้วผิดจริงรุนแรง เช่น scam, impersonation, repeated abuse, phishing, bypass system | Admin ยืนยัน action พร้อม reason | `Banned` |

กฎ:

- `Suspended` = ระงับชั่วคราวเพื่อรอ review หรือควบคุมความเสี่ยงระยะสั้น สามารถกลับเป็น `Active` ได้เมื่อ clear report แล้ว
- `Banned` = ระงับถาวรหลัง review แล้วผิดจริงหรือมีความเสี่ยงสูง ต้องใช้ Admin, reason และ audit เสมอ
- Auto-suspend ต้องมี guardrail เช่น จำนวนผู้รายงานที่ไม่ซ้ำกัน, ความรุนแรงของเหตุผล report, ประเภท evidence, time window และประวัติ previous violation
- Auto-ban ไม่ควรทำใน Phase 1 เว้นแต่ Product/Policy อนุมัติ rule ที่ชัดเจนมาก เช่น known fraud list หรือ security abuse

## 8.2 Policy สถานะการลบบัญชี

`Deletion Requested` ไม่ใช่สถานะลบสำเร็จ แต่เป็นช่วงที่ผู้ใช้กดขอลบบัญชีแล้วและระบบกำลังเข้าสู่ deletion workflow

Lifecycle ที่ควรใช้:

| Stage | ความหมาย | การแสดงใน User List | การกู้คืน |
| --- | --- | --- | --- |
| `Deletion Requested` | ผู้ใช้กดขอลบบัญชีแล้ว request ถูกสร้าง | แสดงได้ใน User List เพื่อให้ทีมเห็นว่าอยู่ระหว่าง process | ยกเลิกได้เฉพาะตาม policy / support escalation |
| `Deactivated` | session ถูก revoke และ login ถูก block ระหว่าง grace period | ไม่ควรอยู่ใน default User List แต่ค้นเจอได้ตาม permission หรือผ่าน Account Deletion | กู้คืนได้ภายใน grace period ถ้า policy อนุญาต |
| `Deleted` / `Archived` | ครบ grace period หรือ Admin approve แล้ว public profile/assets ถูกซ่อนและ record ถูก archive | ไม่แสดงใน default User List; ดูย้อนหลังผ่าน Account Deletion / Reports / Audit | โดยปกติไม่ควรกู้คืนเป็นบัญชีใช้งานจริง |
| `Anonymized` | personal data ถูก mask/anonymize ตาม retention/privacy policy | ดูได้เฉพาะ record ที่จำเป็นต่อ audit/legal โดยข้อมูลส่วนตัวถูก mask | กู้คืนไม่ได้ |

กฎ UI ที่แนะนำ:

- User List filter หลักควรแสดงบัญชีที่ใช้งานหรือยังต้องปฏิบัติการ ได้แก่ `Pending Verification`, `Active`, `Suspended`, `Banned`, `Deletion Requested`
- `Pending Verification` ใช้เฉพาะบัญชี Email/Password ที่กรอก signup แล้วระบบสร้าง record เพื่อรอ OTP / resend OTP ได้ แต่ยังไม่ถือเป็น authenticated member และยังไม่ควรถูกนับเป็น Active user
- Apple / Google sign-up ข้าม OTP ตาม FO Auth requirement ดังนั้น BO ไม่ควรแสดง Apple/Google เป็น `Unverified`
- บัญชีที่ลบสำเร็จแล้วควรใช้ label `Deleted` ใน report/detail สำหรับผู้ใช้ทั่วไปของ BO แต่ backend/audit สามารถแยก `Archived` และ `Anonymized` ได้
- ข้อมูลหลังลบต้องเก็บเท่าที่จำเป็นต่อ audit, legal, dispute, safety และ reporting โดยต้อง mask/anonymize personal fields ตาม policy
- หลัง `Anonymized` ไม่ควรกู้คืนบัญชีได้ เพราะข้อมูลส่วนตัวที่จำเป็นต่อการ restore ถูกลบหรือทำให้ไม่ระบุตัวตนแล้ว

# 9. Action ของ Admin

| Action | การเข้าถึงของ Admin | ต้องยืนยัน | ต้องระบุเหตุผล | ผลกระทบต่อ FO |
| --- | --- | --- | --- | --- |
| View User | Admin | ไม่ต้อง | ไม่ต้อง | ไม่มีการเปลี่ยนแปลงโดยตรง |
| Reset Password | Admin | ต้องยืนยัน | Optional | ส่ง reset flow เฉพาะบัญชี Email/Password |
| Suspend User | Admin | ต้องยืนยัน | ต้องระบุ | Login/action ของผู้ใช้ถูก block |
| Unsuspend User | Admin | ต้องยืนยัน | ต้องระบุ | ผู้ใช้กลับมาเข้าถึงระบบได้ |
| Ban User | Admin | ต้องยืนยัน | ต้องระบุ | Login/action ของผู้ใช้ถูก block จนกว่าจะ unban |
| Unban User | Admin | ต้องยืนยัน | ต้องระบุ | ผู้ใช้กลับมาเข้าถึงระบบได้ |
| Soft Delete / Archive User | Admin | ต้องยืนยัน | ต้องระบุ | User/profile/assets ถูก hidden หรือ anonymized ตาม policy |
| Export User Data | Admin | ต้องยืนยันเมื่อเป็น sensitive export | Optional หรือ required ตาม policy | ไม่มีการเปลี่ยนแปลงใน FO UI |

Action ที่ทำได้ตามสถานะบัญชี:

| Current Status | Action หลักที่อนุญาต | Action ที่ถูก block / หมายเหตุ |
| --- | --- | --- |
| Pending Verification | View detail และดู verification context ที่มาจาก Auth module | Reset password ต้องยังไม่แสดงจนกว่าจะ verify สำเร็จ; suspend/ban ทำได้เฉพาะผ่าน policy ในกรณี abuse ชัดเจน |
| Active | Reset password สำหรับ Email/Password, suspend, ban, start deletion/archive workflow ตาม policy | Apple/Google reset password ต้อง block ด้วย rule-based message |
| Suspended | Unsuspend, ban, view report context, continue deletion/archive workflow ตาม policy | Reset password ไม่ควร restore access เอง ต้องแก้ status แยกต่างหาก |
| Banned | Unban, view audit/report context, continue deletion/archive workflow ตาม policy | Reset password ไม่ควรเปิดให้ใช้เป็นทางกลับเข้า FO |
| Deletion Requested | View detail, review dependency, open Account Deletion, resolve related report/dispute | ห้าม archive/delete ทันทีจาก User List ถ้ายังมี offer/chat/asset/report dependency |
| Deleted / Archived | View historical detail ตาม permission, audit/report lookup | ห้าม reset password, suspend, ban, unban หรือ restore เป็น active account โดยตรง |

# 10. กฎการ Reset Password

- Reset password จาก BO ใช้ได้เฉพาะ FO account ที่สมัครด้วย Email/Password
- Apple/Google accounts reset password จาก BO ไม่ได้
- Reset password action ต้องไม่เปิดเผย password เดิม
- BO ควรส่ง reset link หรือ trigger กระบวนการ reset ตาม auth system
- Reset action ต้อง audit-log
- ถ้า account suspended/banned อยู่ การ reset password ไม่ควร restore access เอง ต้องแก้ status แยกต่างหาก

# 11. การจัดการผู้ใช้ที่ถูกรายงาน

ผู้ใช้ที่ถูกรายงานใน BO ต้องแสดง:

- เหตุผลของ report
- ตัวตนของ reporter ตาม permission/policy
- เวลา report
- Asset/chat/comment ที่เกี่ยวข้อง ถ้ามี
- สถานะ report
- Report ก่อนหน้า
- ประวัติ action ของ Admin

กฎ:

- การ Report User จาก FO ไม่ทำให้ profile/content หายทันที
- Admin review แล้วจึง suspend/ban/clear ได้ตาม policy
- ผู้ถูก report ไม่เห็นตัวตนของ reporter
- เป้าหมายการจัดการ report: ภายใน 24 ชั่วโมง

# 12. ผลกระทบต่อ FO

| การเปลี่ยนแปลงใน BO | พฤติกรรมที่ FO ต้องรองรับ |
| --- | --- |
| Suspend user | ผู้ใช้ sign in ไม่ได้ หรือ session ถูก block/revoked; แสดง suspended account state พร้อมเหตุผลและช่องทางติดต่อ support |
| Ban user | ผู้ใช้ sign in ไม่ได้จนกว่า Admin จะ unban |
| Unsuspend/Unban | ผู้ใช้กลับมา login/action ได้ตามปกติ |
| Soft delete/archive | ผู้ใช้ login ไม่ได้; public profile/assets ถูก hidden หรือ anonymized ตาม policy |
| Reset password | ผู้ใช้ได้รับ reset flow; ไม่เปลี่ยน auth method |
| Clear report without action | FO content/profile ยังแสดงต่อ |

Integration map ที่เกี่ยวข้อง:

- `INT-002` ผู้ใช้ report ผู้ใช้/โปรไฟล์
- `INT-023` ผู้ใช้ขอลบบัญชี
- `INT-026` Admin ทำ sensitive action

# 13. Filter และ Saved View

View เริ่มต้น:

- ผู้ใช้ทั้งหมด
- ผู้ใช้ Active
- ผู้ใช้ Suspended
- ผู้ใช้ Banned
- ผู้ใช้ที่ถูกรายงาน
- ผู้ใช้ใหม่วันนี้
- ผู้ใช้ที่เพิ่งใช้งานล่าสุด
- บัญชี Email/Password
- บัญชี Apple
- บัญชี Google

การ drill-in จาก Dashboard:

- Metric ผู้ใช้ใหม่ -> `New Users Today` หรือ date range ที่ส่งมา
- Queue ผู้ใช้ที่ถูกรายงาน -> `Reported Users`
- Shortcut จากงาน support -> filter ตาม ticket/user issue ที่เชื่อมโยง

คำอธิบาย navigation:

- `Reported Users` เป็น queue สำหรับ review งานปฏิบัติการภายใต้ `User Management` เพราะ Admin ต้องตรวจโปรไฟล์ที่ถูกรายงาน เหตุผล report รวมถึง assets/chats/comments ที่เกี่ยวข้อง แล้วตัดสินใจว่าจะ clear, suspend หรือ ban ผู้ใช้
- `Reports & Analytics` ควรมีเฉพาะหน้ารายงาน/การ export แบบ aggregate เช่น ปริมาณ report, การเติบโตของผู้ใช้, ประสิทธิภาพ moderation และ trend summary ไม่ควรแทนที่ queue งานปฏิบัติการ `Reported Users`
- `Help / Support` และ `Account Deletion` เป็น module หลักแยกต่างหาก เพราะมี queue, workflow รายละเอียด, permission, audit requirement และ dependency ข้าม module เป็นของตัวเอง

# 14. สถานะ Empty / Error / Loading

| State | พฤติกรรมที่ต้องมี |
| --- | --- |
| Loading | Skeleton สำหรับ table/card และ detail |
| Empty list | แสดงว่าไม่พบผู้ใช้ตาม filter และมี reset filter |
| User not found | แสดง data unavailable พร้อมกลับไป list |
| Access denied | แสดงว่า admin access ไม่มีสิทธิ์เข้า user management/action |
| Partial detail error | Section ที่ load fail ต้อง retry ได้ โดย detail หลักยังแสดงถ้าเป็นไปได้ |
| Export processing | สำหรับ export workflow แยก ต้องแสดง queued/in-progress และ download เมื่อสำเร็จ |

# 15. ข้อกำหนด Audit

ต้อง audit-log:

- การ view/export sensitive user data เมื่อเข้าข่าย high-risk
- การ reset password
- การ suspend/ban/unsuspend/unban
- การ soft delete/archive
- การเปลี่ยนสถานะ
- ผลการ review report
- Permission denied สำหรับ sensitive action
- Export user data ผ่าน permitted export workflow

Audit fields ใช้ตาม `00_GLOBAL_RULES_MODULE.md`

# 16. ข้อกำหนดด้าน Performance

- รายการผู้ใช้ต้องใช้ server-side pagination/search/filter
- Search ควรตอบสนองเร็วพอสำหรับ operation workflow
- หน้ารายละเอียดสามารถ lazy load section หนัก เช่น login history/activity ได้
- Export ขนาดใหญ่ใน workflow แยกต้องใช้ background job

# 17. เกณฑ์การยอมรับ

| ID | เกณฑ์ |
| --- | --- |
| AC-BO-USER-001 | รายการผู้ใช้รองรับ search/filter/sort/pagination |
| AC-BO-USER-002 | หน้ารายละเอียดผู้ใช้แสดง account summary, auth method, profile, assets summary, reports, login history และ activity ตาม permission |
| AC-BO-USER-003 | Admin reset password ได้เฉพาะบัญชี Email/Password |
| AC-BO-USER-004 | บัญชี Apple/Google reset password จาก BO ไม่ได้ |
| AC-BO-USER-005 | Admin suspend/ban/unsuspend/unban ได้พร้อม confirmation และ reason |
| AC-BO-USER-006 | ผู้ใช้ที่เป็น Suspended/Banned login FO ไม่ได้ |
| AC-BO-USER-007 | การ Report User ไม่ทำให้ profile/content หายทันทีจนกว่า Admin จะทำ moderation action |
| AC-BO-USER-008 | Queue/detail ของผู้ใช้ที่ถูกรายงานต้องรองรับ SLA 24 ชั่วโมง |
| AC-BO-USER-009 | Field sensitive ของผู้ใช้ต้องถูก mask สำหรับ admin access ที่ไม่มีสิทธิ์ |
| AC-BO-USER-010 | การ export user data ต้องควบคุมด้วย permission และ audit-log และไม่ต้องมีปุ่ม export ใน User List ใน Phase 1 |
| AC-BO-USER-011 | User status mutation ทุกครั้งต้องมี audit log พร้อม before/after state |
| AC-BO-USER-012 | Module ใช้งานได้ที่ mobile, tablet, desktop และ wide desktop widths |
| AC-BO-USER-013 | บัญชี Pending Verification ต้องไม่แสดงเป็น Active และต้องไม่เปิด reset password action จนกว่า verify สำเร็จ |
| AC-BO-USER-014 | บัญชี Deletion Requested ต้อง route ไป Account Deletion/dependency review ก่อน archive/delete จริง |
| AC-BO-USER-015 | UI และ API ต้อง block action ที่ไม่อนุญาตตาม current account status |

# 18. Module ที่เกี่ยวข้อง

- `00_GLOBAL_RULES_MODULE.md`
- `01_AUTHENTICATION_MODULE.md`
- `02_DASHBOARD_MODULE.md`
- `04_ASSET_MANAGEMENT_MODULE.md`
- `08_AUDIT_LOG_MODULE.md`
- `12_HELP_SUPPORT_MODULE.md`
- `13_ACCOUNT_DELETION_MODULE.md`
- `../ProjectAdmin/FO_BO_INTEGRATION_MAP.md`

# 19. หมายเหตุการ Align กับ Prototype

Prototype BO ปัจจุบัน align User List กับ visual system ของ Dashboard ที่ finalize แล้ว:

- Font หลักของ UI ยังคงใช้ IBM Plex Sans Thai; heading ของ section/page ใช้ Bebas Neue เมื่อเหมาะสม
- User List ใช้ layout แบบ control-center ที่สะอาดเหมือนกัน ได้แก่ page header, summary card ขนาด compact, panel มีเส้นขอบ, filter bar, dense table, modal มาตรฐาน และ pattern ปุ่มมาตรฐาน
- Summary card ของ User List ใช้ title ภาษาอังกฤษและค่าหลักเป็นตัวเลขเท่านั้นให้สอดคล้องกับ KPI card ของ Dashboard ส่วน unit และคำอธิบายให้อยู่ใน helper text ใต้ตัวเลข
- User Accounts ใช้ pattern list-table ร่วมของ BO ได้แก่ panel สีขาวมุมมน, header ชื่อ/จำนวนแบบ compact, table utility ชิดขวา, row header สีอ่อน และ row แยกจากกัน
- Header ต้องสะอาดและไม่เพิ่ม search/notification/profile control
- Label สถานะบัญชีที่ผู้ใช้เห็นแสดงเป็นภาษาไทยเพื่อให้สอดคล้องกันใน filter, table badge และ detail modal ส่วนค่า backend/API ยังเป็น enum ภาษาอังกฤษ เช่น `Active`, `Suspended`, `Banned`, และ `Deletion Requested`
- Action เปลี่ยนสถานะบัญชีต้องใช้ label ที่ชัดเจน เช่น `ระงับบัญชี` หรือ `กู้คืนสิทธิ์` แทนคำกว้าง ๆ อย่าง `ตกลง`; การระงับบัญชีซึ่งเป็น destructive action ต้องมี modal ยืนยันชั้นที่สองก่อน apply

ข้อมูลและ interaction ของ User List prototype ปัจจุบัน:

- แสดง mock user ของ FO ที่สมจริง พร้อม display name/username, email แบบ masked, auth method, verification state, account status, joined date, last active, จำนวน asset, จำนวน report และบริบท login/activity ล่าสุด Internal User ID ไม่แสดงใน main list แต่ยังอยู่ใน detail view และใช้ค้นหาเพื่ออ้างอิง report/audit/support ได้
- Table หลักของ User List ไม่แสดง column `FO impact` แยก เพราะสถานะการเข้าถึงบัญชีสื่อสารผ่าน `Status` อยู่แล้ว ส่วน FO impact ยังอยู่ใน detail และ account-action modal เพื่อให้ Admin เข้าใจผลลัพธ์ก่อนเปลี่ยนสถานะบัญชี
- ผู้ใช้ Email ที่ยังทำ OTP ไม่เสร็จแสดงเป็น `Pending Verification` / `รอยืนยันอีเมล` ไม่ใช่ `Active` ผู้ใช้กลุ่มนี้ยังใช้ authenticated FO features ไม่ได้ และไม่ควรเห็น action reset password จนกว่าจะยืนยันสำเร็จ
- ใช้ mock dataset ขนาดใหญ่ขึ้น เพื่อให้ review behavior ของ list ได้สมจริงข้ามหลายหน้า
- รองรับการค้นหาจากชื่อ, email แบบ masked, auth, verification state, account status และ internal User ID/reference ส่วน location และ phone ของผู้ใช้ไม่ถูกเก็บหรือแสดงเป็น column หลักของ User List
- มี mock ผู้ใช้ FO ที่เพิ่งสมัครใหม่โดยยังไม่มี profile details, assets, offers, reports และ activity เพื่อ review สถานะ empty/new-account
- รองรับ filter ตาม account status, auth method, reported status และ sort mode โดยใช้ custom dropdown แบบ compact เพื่อให้ option list เข้ากับ visual system ของ BO
- การ sort ตามวันที่สมัครเรียงใหม่สุดก่อน (`เรียงตามวันที่สมัครล่าสุด`) เพื่อให้บัญชีที่เพิ่งสมัคร รวมถึงบัญชีใหม่ที่ยังไม่มี profile อยู่ก่อนบัญชีเก่าเมื่อเลือก sort นี้
- User Detail เปิดเป็น modal แบบ structured ที่มี profile/contact card, account summary, auth/access context, profile/trust context และ recent activity โดย contact row แสดงเฉพาะเมื่อผู้ใช้กรอก field นั้นแล้ว
- Confirmation สำหรับ reset password ใช้ structured modal style เดียวกับ User Detail และแสดง destination email, auth method, security note และ FO impact ชัดเจน บัญชี Apple/Google แสดงสถานะ unsupported ตาม rule แทนการมีปุ่มส่ง
- Account status modal ใช้ structured modal style เดียวกับ reset password แสดง status before action, intended action, current FO access, after-action impact และ audit note จากนั้นขอ confirmation เพิ่มก่อน suspend บัญชี active ข้อความ confirmation ต้องคง label `Status before action` และ label ผลลัพธ์เป็น `After confirmation` เพื่อไม่ให้ Admin สับสนระหว่างการเข้าถึงปัจจุบันกับผลของ action ที่กำลังจะทำ
- Confirmation สุดท้ายสำหรับการ suspension ต้อง label สถานะปัจจุบันเป็น `Status before action` และแสดง warning note สีแดง เพื่อให้ Admin เข้าใจชัดเจนว่าบัญชียังไม่ถูก suspend ตอนนี้ แต่จะถูก suspend หลังยืนยัน
- Pagination แสดง 10 user ต่อหน้าหลัง apply search/filter/sort แล้ว Footer แสดงช่วงรายการที่มองเห็น จำนวน row ทั้งหมดหลัง filter และ page navigation
- `รีเซ็ตค่าทั้งหมด` อยู่ใน list header เป็น icon utility เพราะใช้ล้างเฉพาะ search/filter/sort state และคืน list เป็นค่าเริ่มต้น
- `Reported Users` ยังคงเข้าถึงได้จาก left navigation แทนการมีปุ่มซ้ำใน User List เพื่อให้หน้านี้โฟกัสที่การ browse บัญชีและ direct account action
- Row action ต้องแสดง `ดูรายละเอียด` ในแต่ละ row ส่วน secondary account action เช่นการส่ง password reset link ให้บัญชี Email หรือการ suspend/restore บัญชี ให้รวมไว้ใน dropdown `...` ขนาด compact พร้อม action icon เพื่อให้ table สะอาด
- Action reset password อนุญาตเฉพาะบัญชี Email; บัญชี Apple/Google แสดงสถานะ blocked ตาม rule
- Account deletion ไม่จัดการจาก User List งานที่เกี่ยวกับ deletion อยู่ใน Account Deletion module
- User List ไม่แสดง Export ใน prototype ปัจจุบัน หากภายหลังต้อง export user data ให้เพิ่มผ่าน Reports/export workflow ที่ควบคุมด้วย permission
- `Reported Users` ยังเป็น operational queue ภายใต้ User Management ส่วน aggregate report analytics อยู่ภายใต้ Reports

ข้อมูลและ interaction ของ Reported Users prototype ปัจจุบัน:

- ใช้ visual system เดียวกับ Dashboard และ User List ได้แก่ module header, summary card 4 ใบ, list utility แบบ compact, filter bar, table พร้อม pagination, modal มาตรฐาน และ pattern ปุ่มมาตรฐาน
- Reported Users เป็น operational queue สำหรับ report ผู้ใช้/โปรไฟล์จาก FO ไม่ใช่หน้า analytics และไม่ควรซ้ำกับ Reports & Analytics
- ตัวอย่าง Suspended ใน prototype ต้อง align กับ policy: ใช้ `>= 5 reports/reporters` หรือมี high-risk evidence ชัดเจนก่อนแสดง `Suspended`; `>= 3 reports` เพิ่มเฉพาะ review priority เว้นแต่เข้า risk rule
- Mock report queue ครอบคลุม account-status context ทั้งหมดที่ใช้ใน Phase 1 ได้แก่ `Active`, `Pending Verification`, `Suspended`, `Banned`, และ `Deletion Requested`
- Mock report queue ครอบคลุม outcome หลักของ report handling ได้แก่ report ใหม่/open, report in-review, false report ที่ clear โดยไม่ทำ account action, report ที่ resolved หลัง action, บัญชี active ที่มี 1-2 reports, บัญชี active ที่มี 3 reports และถูกยกระดับเป็น priority review, บัญชี suspended ที่มี 5+ reports/reporters, บัญชี banned หลังยืนยัน severe abuse และบัญชี deletion-request ที่ต้อง review ก่อน archive/anonymize
- Summary card แสดง `Open Reports`, `In Review`, `Urgent Cases` และ `Due Soon` เพื่อให้ Admin จัดลำดับ queue ได้โดยไม่ต้องอ่านทุก row
- Table row แสดง report ID/category, reported user, reason, reporter count, priority, report status และ action `ดูรายละเอียด` ที่ชัดเจนหนึ่งรายการ ส่วน evidence, related data, waiting time และ detailed action อยู่ใน modal เพื่อให้ list สะอาด
- Filter รองรับการค้นหาด้วย report ID, user ID, display name, reason, category, status และ priority ส่วน sorting รองรับ oldest waiting first, urgent first, reporter count และ status
- Detail modal แสดง report summary, สถานะบัญชีผู้ใช้ปัจจุบัน, reported reference, note จาก FO reporter, reporter identity/count แบบ masked, timestamp ล่าสุดของ report, evidence/context, related data, recommendation, ประวัติ action ของ Admin และ note ชัดเจนว่า report ไม่ได้ซ่อน profile หรือจำกัดบัญชีจนกว่า Admin จะทำ action
- Report detail ทุกอันต้องมี reported reference เพื่อให้ Admin trace แหล่งที่มาได้ ได้แก่ reference type, reference ID, source location, related module และสิ่งที่ต้องตรวจ ตัวอย่างเช่น asset ID, profile ID, chat transcript ID, offer ID, deletion request ID หรือ signup/auth log ID
- Case reported-user ที่เกี่ยวกับ deletion ยังต้องแสดงแหล่ง report เดิมจาก FO เช่น offer/chat dispute, asset report หรือ profile report โดย `Account Deletion` เป็น blocking/dependency context ไม่ใช่แหล่ง report โดยตัวมันเอง
- ถ้าผู้ใช้ที่ถูกรายงานอยู่ในสถานะ `Deletion Requested` แล้ว report action ต้อง route Admin ไปที่ source reference ก่อน แล้วจึงไป `Account Deletion` Admin ต้องไม่ close report แล้ว delete/archive บัญชีทันทีจนกว่า offer/chat/asset/profile dispute ที่เกี่ยวข้องจะถูก review และ dependency ถูก clear
- Review flow ที่แนะนำ: เปิด report detail -> กด deep link ของ reported reference -> ไปยัง module/detail context ที่เกี่ยวข้องโดยตรง -> ตรวจ source evidence -> กลับมาที่ report -> start review / clear report / manage account status ตาม policy
- Queue action ที่ prototype รองรับ: เปิด reported reference เป็น deep link ไป Asset Management, Offer / Chat, Account Deletion หรือ User detail; start review; close report เป็น cleared; เปิด user detail ที่เกี่ยวข้อง; และเปิด account status management เมื่อจำเป็นต้องทำ account action
- การ close report อัปเดต mock status เป็น `Cleared`, reset waiting time, แสดง toast และคงบัญชีผู้ใช้ไว้เหมือนเดิม
- การเปลี่ยน account status ยังจัดการผ่าน User account status modal กลาง เพื่อให้ wording ของ suspension/restore และ confirmation rule สอดคล้องกัน
