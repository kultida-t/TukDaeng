# 03 โมดูลจัดการผู้ใช้ BO

# 1. ข้อมูลเอกสาร

| ฟิลด์ | รายละเอียด |
| --- | --- |
| ชื่อโมดูล | BO User Management / จัดการผู้ใช้หลังบ้าน |
| แพลตฟอร์ม | เว็บ Back Office แบบ Responsive |
| ประเภทเอกสาร | Functional Specification |
| ผู้ใช้งานหลัก | Admin |

# 2. วัตถุประสงค์

User Management เป็นเมนูสำหรับให้ Admin ตรวจสอบ ค้นหา และจัดการบัญชีผู้ใช้ของระบบหน้าบ้าน รวมถึงตรวจสอบรายงานผู้ใช้ที่ถูกร้องเรียน จัดการสถานะบัญชี และบันทึกเหตุผลของการดำเนินการที่มีผลต่อผู้ใช้

เอกสารนี้ระบุข้อกำหนดปัจจุบันของเมนู User Management ให้ครบพอสำหรับนำไปสร้างหน้าจอและ flow ได้จากเนื้อหาในไฟล์นี้

# 3. โครงสร้างเมนู

เมนูหลัก: `User Management`

Submenu ภายใต้ User Management:

| เมนู | หน้าที่ |
| --- | --- |
| User List | แสดงรายการบัญชีผู้ใช้ทั้งหมดที่เป็น registered user, ค้นหา/filter/sort, เปิดรายละเอียดผู้ใช้ และทำ account action ที่อนุญาต |
| Reported Users | แสดงคิวรายงานผู้ใช้จากหน้าบ้าน, ค้นหา/filter/sort, เปิดรายละเอียดรายงาน และปิดรายงานหรือจัดการสถานะบัญชีเมื่อจำเป็น |

Navigation behavior:

- เมื่อเข้า `User Management` ให้เปิด `User List` เป็นหน้าหลัก
- เมนูที่ถูกเลือกต้องแสดง active state ที่ submenu นั้น
- `User Detail` เปิดจาก `User List` หรือจากปุ่ม `View User` ใน `Report Detail`
- `Report Detail` เปิดจากรายการใน `Reported Users`
- ปุ่มย้อนกลับจาก `User Detail` ต้องกลับไป context เดิมที่เปิดมา
- ปุ่มย้อนกลับจาก `Report Detail` ต้องกลับไป `Reported Users` พร้อมคง search/filter/sort/page เดิม

# 4. ขอบเขตการทำงาน

อยู่ในขอบเขต:

- แสดงรายการผู้ใช้ที่มี account record แล้วเท่านั้น
- ค้นหา, filter, sort และ pagination ใน User List
- แสดงรายละเอียดผู้ใช้
- แสดงวิธีเข้าสู่ระบบของผู้ใช้: Email, Apple, Google
- แสดงสถานะบัญชีผู้ใช้
- ส่ง password reset link สำหรับบัญชี Email/Password ที่อนุญาต
- ระงับบัญชีชั่วคราว
- ระงับบัญชีถาวร
- ยกเลิกการระงับบัญชีชั่วคราว
- ยกเลิกการระงับบัญชีถาวร
- แสดงคิวผู้ใช้ที่ถูกรายงาน
- แสดงรายละเอียดรายงานผู้ใช้
- ปิดรายงานผู้ใช้
- เปิดหน้ารายละเอียดผู้ใช้จากบริบทรายงาน
- แสดงผลกระทบต่อหน้าบ้านก่อนยืนยัน action สำคัญ
- บันทึก audit/action note สำหรับ action สำคัญ
- รองรับ mobile, tablet, desktop และ wide desktop

อยู่นอกขอบเขต:

- สร้างบัญชีผู้ใช้ใหม่จาก BO
- แก้ไขข้อมูลโปรไฟล์แทนผู้ใช้
- สร้างประเภทผู้ใช้ใหม่ เช่น Buyer, Seller, Collector หรือ Admin ในฝั่งหน้าบ้าน
- จัดการ guest/visitor ที่ยังไม่มีบัญชี
- ลบบัญชีหรือ archive บัญชีโดยตรงจาก User List
- Export user data จาก User List
- ระบบอุทธรณ์การถูกแบน
- ระบบให้คะแนนความเสี่ยงอัตโนมัติ

# 5. สิทธิ์และกฎทั่วไปของ Admin

Admin ที่เข้าถึงเมนูนี้ได้สามารถดูรายการผู้ใช้ รายละเอียดผู้ใช้ รายงานผู้ใช้ และทำ action ตามเงื่อนไขของแต่ละสถานะบัญชี

กฎทั่วไป:

- Action ที่กระทบการเข้าใช้งานของผู้ใช้ต้องมี confirmation ก่อนบันทึกผล
- Action ที่เปลี่ยนสถานะบัญชีต้องมี reason
- Action ที่มี note ต้องให้ Admin กรอกเพิ่มเติมได้
- ระบบต้องแสดงผลกระทบต่อหน้าบ้านก่อนยืนยัน action สำคัญ
- ระบบต้องบันทึกผู้ดำเนินการ, เวลา, target user, action, reason, note และสถานะก่อน/หลัง action
- ข้อมูล sensitive ต้องแสดงเท่าที่จำเป็นต่อการทำงาน และต้องรองรับการ mask ตามสิทธิ์ในระบบจริง

ข้อมูลที่ถือเป็น sensitive:

- Email
- Phone
- Line ID
- Social contact
- IP address
- Device identifier
- Login/activity detail
- รายละเอียดที่เกี่ยวข้องกับการลบหรือ archive บัญชี

# 6. Responsive Layout

| ขนาดหน้าจอ | รูปแบบการแสดงผล |
| --- | --- |
| Mobile `< 768px` | แสดงรายการเป็น stacked card/list, ซ่อน table header, ใช้เมนู action แบบ compact, filter เปิด/ปิดในพื้นที่ list |
| Tablet `768px - 1199px` | แสดง layout แบบย่อจาก desktop, คง filter bar, list panel, pagination และ action menu ให้ใช้งานได้ |
| Desktop `>= 1200px` | แสดง page header, summary cards, filter bar, table/list แบบ dense, pagination และ row action menu |
| Wide Desktop `>= 1440px` | ใช้ layout desktop เป็นหลัก ไม่ต้องมี split list/detail ถาวร |

ข้อกำหนด responsive:

- ข้อความใน card, badge, button และ modal ต้องไม่ล้น container
- Action สำคัญต้องกดใช้งานได้ทั้งบน mobile และ desktop
- Filter บน mobile ต้องเปิด/ปิดได้ในหน้าเดิม ไม่จำเป็นต้องใช้ drawer แยก
- User Detail และ Report Detail ต้องอ่านข้อมูลสำคัญได้ครบโดยไม่ซ่อน action ที่จำเป็น

# 7. User List

User List แสดง registered user ทั้งหมดที่ระบบมี account record แล้ว ไม่รวม guest หรือ visitor ที่ยังไม่สมัคร/ยังไม่สร้างบัญชี

## 7.1 Summary Cards

แสดง summary cards ด้านบนของ User List:

| Card | ความหมาย |
| --- | --- |
| Total Users | จำนวนผู้ใช้ทั้งหมดในระบบ |
| Active Users | จำนวนผู้ใช้สถานะ Active |
| Suspended / Banned | จำนวนผู้ใช้ที่ถูกระงับชั่วคราวหรือถาวร |
| Pending Verification | จำนวนผู้ใช้ที่สมัครแล้วแต่ยังไม่ยืนยัน |

## 7.2 Search

ช่องค้นหาต้องรองรับ:

- User ID
- Display name
- Username
- Email แบบ masked หรือ full email ตามสิทธิ์
- Auth method
- Verification state
- Account status
- Support/reference text ที่ผูกกับผู้ใช้

เมื่อค้นหาแล้วต้องแสดงผลบนข้อมูลหลัง apply filter และ sort

## 7.3 Filter

Filter ที่ต้องมี:

| Filter | ตัวเลือก |
| --- | --- |
| Account Status | All, Pending Verification, Active, Suspended, Banned, Deletion Requested, Deleted / Archived |
| Auth Method | All, Email, Apple, Google |

Filter ต้องมีปุ่ม reset เพื่อล้าง search/filter/sort/page กลับเป็นค่าเริ่มต้น

## 7.4 Sort

Sort mode ที่ต้องมี:

| Sort | การเรียง |
| --- | --- |
| Last Active | ผู้ใช้ที่ active ล่าสุดขึ้นก่อน |
| Date Joined | ผู้ใช้ที่สมัครล่าสุดขึ้นก่อน |
| Report Count | ผู้ใช้ที่มีจำนวน report มากขึ้นก่อน |
| Asset Count | ผู้ใช้ที่มีจำนวน asset มากขึ้นก่อน |

## 7.5 Pagination

User List ต้องมี pagination ตามเงื่อนไข:

- Page size: 10 users per page
- มี Previous button
- มี Next button
- มี numbered page buttons
- ต้องคงค่า search/filter/sort ระหว่างเปลี่ยนหน้า
- เมื่อไม่พบข้อมูลให้แสดง empty state `ไม่พบข้อมูล`
- Pagination ทำงานหลัง apply search/filter/sort แล้ว
- Footer ต้องแสดงช่วงรายการที่กำลังเห็นและจำนวนผลลัพธ์ทั้งหมดหลัง filter
- เมื่อเปลี่ยน search/filter/sort ให้กลับไปหน้าแรก

## 7.6 Columns บน Desktop

| Column | รายละเอียด |
| --- | --- |
| User ID | รหัสผู้ใช้ |
| User | รูปโปรไฟล์, display name และ username/reference |
| Status | สถานะบัญชี |
| Last Active | เวลาที่ใช้งานล่าสุด |
| Assets | จำนวน asset ทั้งหมด |
| Auth Method | Email, Apple หรือ Google |
| Date Joined | วันที่สมัคร |
| Actions | ปุ่ม View และเมนู More |

ข้อมูลที่ไม่ต้องเป็น column หลัก แต่ค้นหาหรือดูได้ใน detail:

- Email
- Verification state
- Report count
- Contact details
- Support/latest context

## 7.7 Mobile Card

Mobile card ต้องแสดง:

- User ID
- Display name
- Username/reference
- Status badge
- Auth method
- Last active
- Date joined
- Asset count
- More action menu

แตะ card หรือกด `View` เพื่อเปิด User Detail

## 7.8 Row Actions

Action ในแต่ละ user row ต้องแสดงตามสถานะและเงื่อนไขที่อนุญาต:

| Action | เงื่อนไข |
| --- | --- |
| View Detail | แสดงทุก user |
| Send Password Reset | แสดงเฉพาะบัญชี Email/Password ที่สถานะ Active |
| Suspend Account | แสดงเมื่อบัญชีอยู่ในสถานะ Active |
| Ban Account | แสดงเมื่อบัญชีอยู่ในสถานะ Active หรือ Suspended |
| Unsuspend Account | แสดงเมื่อบัญชีอยู่ในสถานะ Suspended |
| Unban Account | แสดงเมื่อบัญชีอยู่ในสถานะ Banned |
| View Archived Summary | แสดงเมื่อบัญชีอยู่ในสถานะ Deleted / Archived |

User List ต้องไม่แสดง action delete/archive โดยตรง

# 8. User Detail

User Detail แสดงรายละเอียดของผู้ใช้หนึ่งคน และเป็นจุดเริ่มต้นของ account action ที่อนุญาต

## 8.1 Header

Header ต้องแสดง:

- รูปโปรไฟล์
- Display name
- Username/reference
- User ID
- Status badge
- Auth method
- ปุ่มย้อนกลับ
- Action menu ที่แสดง action ตามสถานะบัญชี

## 8.2 Sections

| Section | ข้อมูลที่ต้องแสดง |
| --- | --- |
| Account Summary | User ID, display name, username, status, date joined, last active, follower count, following count |
| Contact / Auth | Email, auth method, SSO provider, email verification state, phone, Line, Facebook, Instagram ตามข้อมูลที่มีจริง |
| Link Profile | Profile URL name และ public profile URL |
| Assets Summary | จำนวน asset ตามสถานะ Sale, Show, Hide, Sold, Removed/Hidden |
| Reports | จำนวน report, เหตุผล report ล่าสุด, สถานะ report, เวลาที่ถูกรายงานล่าสุด |
| Account Actions | Action ที่อนุญาตตามสถานะบัญชี |

กฎการแสดง contact:

- แสดงเฉพาะ field ที่มีข้อมูลจริง
- ไม่แสดง row ว่าง
- Email มาจากบัญชี auth/provider
- Social/contact เพิ่มเติมแสดงเฉพาะเมื่อมีข้อมูลที่ผู้ใช้ให้ไว้
- ระบบจริงต้องรองรับ masked/unmasked state ตามสิทธิ์

# 9. สถานะผู้ใช้

| Status | ความหมายใน BO | ผลกระทบต่อหน้าบ้าน |
| --- | --- | --- |
| Pending Verification | สมัคร Email/Password แล้วแต่ยังไม่ยืนยัน email/OTP | ยังใช้ authenticated feature ไม่ได้ |
| Active | บัญชีใช้งานได้ตามปกติ | Login และใช้งาน feature ที่ได้รับอนุญาตได้ |
| Suspended | ระงับชั่วคราวระหว่างตรวจสอบหรือจาก policy violation | Login ไม่ได้หรือถูกจำกัดการใช้งานตาม policy |
| Banned | ระงับถาวรจากเหตุร้ายแรง | Login ไม่ได้และ profile/content อาจถูกซ่อนตาม policy |
| Deletion Requested | ผู้ใช้ร้องขอลบบัญชีและอยู่ระหว่างตรวจ dependency | ต้องจำกัด action ที่ทำให้ข้อมูลเปลี่ยนเพิ่มโดยไม่จำเป็น |
| Deleted / Archived | บัญชีถูกลบหรือเก็บถาวรแล้ว | Login ไม่ได้และข้อมูลสาธารณะไม่ควรแสดงตาม policy |

กฎสถานะ:

- Guest/visitor ไม่ใช่ user status ใน BO
- Pending Verification ไม่ใช่ Active
- Suspended และ Banned ต้อง login หน้าบ้านไม่ได้
- Report user ไม่เปลี่ยนสถานะบัญชีอัตโนมัติ ต้องรอ Admin action
- Deleted / Archived เป็นสถานะอ่านย้อนหลัง ไม่ใช่สถานะที่ User List ทำ action ลบโดยตรง

# 10. Account Actions

## 10.1 Send Password Reset

เงื่อนไข:

- ใช้ได้เฉพาะบัญชี Email/Password
- ใช้ได้เฉพาะบัญชีสถานะ Active
- บัญชี Apple/Google ไม่แสดง action นี้
- Pending Verification, Suspended, Banned, Deletion Requested และ Deleted / Archived ไม่แสดง action นี้

UI ต้องมี:

- Target user
- Destination email
- Reason
- Optional note
- ผลกระทบต่อผู้ใช้
- ปุ่ม confirm
- ปุ่ม cancel
- Success toast หลังดำเนินการสำเร็จ

ผลลัพธ์:

- ส่ง reset link ไปยัง email ของผู้ใช้
- ไม่เปลี่ยนสถานะบัญชี
- บันทึก audit log

## 10.2 Suspend Account

เงื่อนไข:

- ใช้ได้เมื่อบัญชีเป็น Active
- ต้องระบุ reason

UI ต้องมี:

- Target user
- Current status
- Reason dropdown
- Optional note
- FO impact
- Confirm / Cancel

ผลลัพธ์:

- เปลี่ยนสถานะเป็น Suspended
- ผู้ใช้ login หรือใช้งานหน้าบ้านไม่ได้ตาม policy
- บันทึก audit log
- แสดง success toast

## 10.3 Ban Account

เงื่อนไข:

- ใช้ได้เมื่อบัญชีเป็น Active หรือ Suspended
- ต้องระบุ reason

ผลลัพธ์:

- เปลี่ยนสถานะเป็น Banned
- ผู้ใช้ login ไม่ได้
- บันทึก audit log
- แสดง success toast

## 10.4 Unsuspend Account

เงื่อนไข:

- ใช้ได้เมื่อบัญชีเป็น Suspended
- ต้องระบุ reason

ผลลัพธ์:

- เปลี่ยนสถานะเป็น Active
- ผู้ใช้กลับมา login และใช้งานตามสิทธิ์ได้
- บันทึก audit log
- แสดง success toast

## 10.5 Unban Account

เงื่อนไข:

- ใช้ได้เมื่อบัญชีเป็น Banned
- ต้องระบุ reason

ผลลัพธ์:

- เปลี่ยนสถานะเป็น Active
- ผู้ใช้กลับมา login และใช้งานตามสิทธิ์ได้
- บันทึก audit log
- แสดง success toast

# 11. Reported Users

Reported Users เป็นคิวสำหรับตรวจรายงานผู้ใช้จากหน้าบ้าน ไม่ใช่หน้า analytics

## 11.1 List Layout

หน้ารายการต้องมี:

- Page header
- Search input
- Filter bar
- Sort control
- Table/list
- Pagination
- Row action menu

ไม่ต้องมี summary card ในหน้า Reported Users

## 11.2 Search

ค้นหาได้จาก:

- Report ID
- User ID ของผู้ถูกรายงาน
- Display name ของผู้ถูกรายงาน
- Report reason
- Category
- Source
- Report status
- Priority

## 11.3 Filter

| Filter | ตัวเลือก |
| --- | --- |
| Status | All, Pending, Closed |
| Priority | All, Normal, High |
| Source | All, User Profile, Chat |
| Reason | All, Fraud/Scam, Impersonation, Harassment, Inappropriate Content, Spam, Other |

## 11.4 Sort

| Sort | การเรียง |
| --- | --- |
| Latest | รายงานล่าสุดขึ้นก่อน |
| Oldest | รายงานเก่าสุดขึ้นก่อน |
| Reporters | จำนวน reporter มากขึ้นก่อน |

## 11.5 Columns

| Column | รายละเอียด |
| --- | --- |
| Report ID | รหัสรายงาน |
| Reported User | ผู้ใช้ที่ถูกรายงาน |
| Account Status | สถานะบัญชีของผู้ถูกรายงาน |
| Report Status | Pending หรือ Closed |
| Reported At | วันที่/เวลาที่ถูกรายงาน |
| Reason | เหตุผลรายงาน |
| Reporter Count | จำนวนผู้รายงาน |
| Priority | Normal หรือ High |
| Sources | User Profile หรือ Chat |
| Actions | เปิดรายละเอียดรายงาน |

## 11.6 Priority Rule

- รายงานจาก 1-2 reporters เป็น Normal priority
- รายงานจาก 3-4 reporters เป็น High priority เพื่อเร่ง review
- รายงานจาก 5 reporters ขึ้นไป หรือมี evidence รุนแรง สามารถใช้เป็นเงื่อนไขประกอบการ suspend ระหว่างตรวจสอบ
- Priority ไม่เปลี่ยนสถานะบัญชีอัตโนมัติ

## 11.7 Pagination

Reported Users ต้องมี pagination ตามเงื่อนไข:

- Page size: 10 reports per page
- มี Previous button
- มี Next button
- มี numbered page buttons
- ต้องคงค่า search/filter/sort ระหว่างเปลี่ยนหน้า
- เมื่อไม่พบข้อมูลให้แสดง empty state `ไม่พบข้อมูล`
- Pagination ทำงานหลัง apply search/filter/sort แล้ว
- Footer ต้องแสดงช่วงรายการที่กำลังเห็นและจำนวนผลลัพธ์ทั้งหมดหลัง filter
- เมื่อเปลี่ยน search/filter/sort ให้กลับไปหน้าแรก

# 12. Report Detail

Report Detail แสดงรายละเอียดรายงานหนึ่งรายการและ action ที่ Admin ทำได้กับรายงานนั้น

## 12.1 Header

ต้องแสดง:

- Report ID
- Report status
- Priority
- Reported at
- ปุ่มย้อนกลับ

## 12.2 Sections

| Section | ข้อมูลที่ต้องแสดง |
| --- | --- |
| Reported User | User ID, display name, account status และปุ่ม View User |
| Reporter History | แหล่งที่มา, เหตุผล, สถานะ report, additional details จากผู้รายงาน |
| Admin Action History | ประวัติการรับรายงาน, การปิดรายงาน, การเปลี่ยนสถานะบัญชี และ note ที่เกี่ยวข้อง |
| Actions | Close Report, View User, Manage Account Status ตามเงื่อนไข |

Source ของรายงานผู้ใช้มีได้เฉพาะ:

- User Profile
- Chat

Report Detail ต้องไม่อ้าง source ประเภท asset, offer, signup/auth หรือ deletion request

## 12.3 Report Actions

| Action | เงื่อนไข | ผลลัพธ์ |
| --- | --- | --- |
| Close Report | Report status เป็น Pending | เปลี่ยน report status เป็น Closed, คงสถานะบัญชีเดิม, บันทึก audit log |
| View User | มี target user | เปิด User Detail ของผู้ถูกรายงาน |
| Manage Account Status | บัญชียังไม่ Deleted / Archived | เปิด modal/action view สำหรับ suspend, ban, unsuspend หรือ unban ตามสถานะปัจจุบัน |

## 12.4 รายงานของผู้ใช้สถานะ Deletion Requested

ถ้าผู้ถูกรายงานอยู่ในสถานะ Deletion Requested:

- ต้องยังแสดงผู้ใช้เป็น reported user ตามปกติ
- Admin ต้อง review รายงานจาก User Profile หรือ Chat ก่อน
- การปิดรายงานต้องไม่ลบหรือ archive บัญชีทันที
- Action ที่เปลี่ยนสถานะบัญชีต้องใช้กฎเดียวกับ account action กลาง

# 13. Empty / Loading / Error State

## 13.1 User List

| State | การแสดงผล |
| --- | --- |
| Loading | แสดง skeleton หรือ loading row ใน list panel |
| Empty no data | แสดง empty state `ไม่พบข้อมูล` |
| Empty after filter/search | แสดง empty state `ไม่พบข้อมูล` และให้ reset filter |
| Error | แจ้งว่าโหลดข้อมูลไม่สำเร็จและมีปุ่ม retry |

## 13.2 Reported Users

| State | การแสดงผล |
| --- | --- |
| Loading | แสดง skeleton หรือ loading row |
| Empty no data | แสดง empty state `ไม่พบข้อมูล` |
| Empty after filter/search | แสดง empty state `ไม่พบข้อมูล` และให้ reset filter |
| Error | แจ้งว่าโหลดคิวรายงานไม่สำเร็จและมีปุ่ม retry |

# 14. Audit Requirements

ต้องบันทึก audit log สำหรับ action ต่อไปนี้:

- Send password reset
- Suspend account
- Ban account
- Unsuspend account
- Unban account
- Close report
- Open sensitive full detail เมื่อระบบมี masked/unmasked permission

ข้อมูลที่ต้องบันทึก:

| Field | รายละเอียด |
| --- | --- |
| Actor | Admin ที่ดำเนินการ |
| Target | User ID หรือ Report ID ที่เกี่ยวข้อง |
| Action | ชื่อ action |
| Reason | เหตุผลที่เลือกหรือกรอก |
| Note | ข้อความเพิ่มเติม ถ้ามี |
| Before State | สถานะก่อน action |
| After State | สถานะหลัง action |
| Timestamp | วันและเวลาที่ดำเนินการ |
| Result | Success หรือ Failed |

# 15. Performance Requirements

- User List ต้องรองรับข้อมูลจำนวนมากด้วย server-side pagination
- Search/filter/sort ต้องทำงานร่วมกับ pagination
- การเปลี่ยนหน้าไม่ควร reset filter/search/sort โดยไม่ตั้งใจ
- รายการ 10 rows ต่อหน้าต้อง render ได้เร็วและไม่กระตุก
- Action modal ต้องเปิดจาก row หรือ detail โดยไม่โหลดหน้าซ้ำทั้งหน้า
- Detail view ต้องโหลดข้อมูลเฉพาะผู้ใช้หรือรายงานที่เลือก

# 16. Acceptance Criteria

| ID | เกณฑ์การยอมรับ |
| --- | --- |
| AC-BO-USER-001 | Admin เข้า User Management แล้วเห็น User List เป็นหน้าเริ่มต้น |
| AC-BO-USER-002 | User List แสดง summary cards, search, filter, sort, table/list และ pagination ครบ |
| AC-BO-USER-003 | User List ไม่แสดง guest/visitor ที่ยังไม่มีบัญชี |
| AC-BO-USER-004 | Search ค้นหา User ID, display name, username, email, auth method และ status ได้ |
| AC-BO-USER-005 | Filter account status และ auth method ทำงานร่วมกับ search/sort/pagination ได้ |
| AC-BO-USER-006 | Sort last active, date joined, report count และ asset count ได้ |
| AC-BO-USER-007 | User List pagination มี 10 users per page, Previous button, Next button, numbered page buttons, คงค่า search/filter/sort ระหว่างเปลี่ยนหน้า และแสดง empty state `ไม่พบข้อมูล` เมื่อไม่พบข้อมูล |
| AC-BO-USER-008 | Admin เปิด User Detail จาก row หรือ card ได้ |
| AC-BO-USER-009 | User Detail แสดง account summary, contact/auth, link profile, assets summary, reports และ account actions |
| AC-BO-USER-010 | Contact/Auth ไม่แสดง row ว่าง และต้องรองรับข้อมูล contact ที่มีจริง |
| AC-BO-USER-011 | Send Password Reset แสดงเฉพาะบัญชี Email/Password ที่ Active |
| AC-BO-USER-012 | บัญชี Apple/Google ไม่แสดง Send Password Reset |
| AC-BO-USER-013 | Suspend/Ban/Unsuspend/Unban ต้องมี confirmation, reason, FO impact และ audit log |
| AC-BO-USER-014 | Suspended และ Banned login หน้าบ้านไม่ได้ตาม policy |
| AC-BO-USER-015 | User List ไม่แสดง delete/archive action โดยตรง |
| AC-BO-USER-016 | User List ไม่แสดงปุ่ม export user data |
| AC-BO-USER-017 | Reported Users แสดง search, filter, sort, table/list และ pagination ครบ |
| AC-BO-USER-017A | Reported Users pagination มี 10 reports per page, Previous button, Next button, numbered page buttons, คงค่า search/filter/sort ระหว่างเปลี่ยนหน้า และแสดง empty state `ไม่พบข้อมูล` เมื่อไม่พบข้อมูล |
| AC-BO-USER-018 | Reported Users ไม่แสดง summary card |
| AC-BO-USER-019 | Reported Users แสดง report status เป็น Pending หรือ Closed |
| AC-BO-USER-020 | Report Detail แสดง Reported User, Reporter History, Admin Action History และ Actions |
| AC-BO-USER-021 | Report Detail เปิด User Detail ของผู้ถูกรายงานได้ |
| AC-BO-USER-022 | Close Report เปลี่ยน report status เป็น Closed โดยไม่เปลี่ยน account status |
| AC-BO-USER-023 | รายงานจาก User Profile และ Chat เท่านั้นที่เป็น source ของ Reported Users |
| AC-BO-USER-024 | รายงานของผู้ใช้สถานะ Deletion Requested ต้อง review ได้โดยไม่ลบ/archive บัญชีทันที |
| AC-BO-USER-025 | Empty, loading และ error state แสดงผลครบทั้ง User List และ Reported Users |
| AC-BO-USER-026 | หน้าจอทั้งหมดในโมดูลใช้งานได้บน mobile, tablet, desktop และ wide desktop |
