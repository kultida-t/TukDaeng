# 13 Settings Module

อ้างอิงหลักจาก [TukDaeng_Master_Product_Definition.md](TukDaeng_Master_Product_Definition.md)

---

# 1. Document Information

| Field | Detail |
| --- | --- |
| Module Name | Settings |
| Version | 1.0 |
| Status | Functional PRD - Master Aligned |
| Owner | Tuk Daeng Project |
| Document Type | Front Office Functional PRD |
| Source of Truth | TukDaeng Master Product Definition |

---

# 2. Objective

Settings Module ใช้สำหรับให้ Member จัดการข้อมูลโปรไฟล์ การแสดงผล ภาษา เอกสารช่วยเหลือ/กฎหมาย การออกจากระบบ และการลบบัญชี ตาม baseline ของ master

Settings V1 ต้องรองรับรายการที่ master ระบุครบ ได้แก่ Edit Profile, Username, Phone, Line, Email Display, Language, Theme Mode, Notification Settings, Change Password แบบ Auth-linked entry, Help, About, Privacy Policy, Terms of Service, Sign Out และ Delete Account

---

# 3. Prototype Reference

| Prototype | Usage |
| --- | --- |
| Menu & Profile Setting.png | Settings home, profile/account settings, legal/help entries |

---

# 4. Master Alignment Summary

| Topic | Master Baseline | Settings Module Rule |
| --- | --- | --- |
| Profile Edit | Edit Profile, Username, Phone, Line | Settings ต้องมี entry ไป edit profile/contact fields |
| Email | Email Display | แสดง email ได้ แต่ email ที่ verify แล้วเปลี่ยนไม่ได้ตาม Auth rule |
| Language | English / Thai | ต้องมี Language setting |
| Theme | Dark Mode / Light Mode | ต้องมี Theme Mode setting |
| Notification Settings | Baseline notification type preferences | ตั้งค่าเปิด/ปิดเฉพาะ Like, Comment, Follow, Offer, Watch Alert; ไม่รวม Chat/New Message |
| Change Password | Auth-linked entry | แสดงเฉพาะบัญชี Email / Password และส่งไป Auth flow |
| Help / About | Help, About | ต้องมีเมนูทั้งสองรายการ |
| Legal | Privacy Policy, Terms of Service | ต้องเข้าถึง legal docs ได้ |
| Session | Sign Out | ต้อง Sign Out พร้อม confirmation |
| Account | Delete Account | ต้องมี Delete Account flow/state ใน V1 baseline |
| Source of Truth Conflict | เอกสารเดิมบอก Language/Dark Mode/Delete Account ยังไม่มี | ให้ยึด master ล่าสุดเป็นหลัก |

---

# 5. Figma Gap Checklist For Settings Module

| Priority | Figma Gap | Master Baseline | Action |
| --- | --- | --- | --- |
| Must Fix | Settings ยังไม่มี Theme Mode | Settings ต้องมี Theme Mode: Dark Mode / Light Mode | เพิ่ม setting สำหรับ Theme Mode |
| Must Fix | Settings เดิมอาจระบุ Delete Account เป็น future | Master ระบุ Delete Account อยู่ใน Settings baseline | เพิ่ม Delete Account entry และ confirmation/risk state |
| High | Language setting ยังไม่ชัด | Settings ต้องมี Language: English / Thai | เพิ่ม language selector และ selected state |
| High | Email field ต้อง lock หลัง verification | Auth rule ระบุ Email ไม่สามารถเปลี่ยนได้หลังยืนยันแล้ว | แสดง Email Display เป็น read-only หรือ disabled edit |
| High | Settings menu ต้องครบ master list | Master รองรับ Edit Profile, Username, Phone, Line, Email Display, Language, Theme Mode, Help, About, Privacy Policy, Terms of Service, Sign Out, Delete Account | ตรวจ Figma menu ให้ครบและตัดเมนูนอก baseline |
| Medium | Help / About entry ยังต้องตรวจ | Master ระบุ Help และ About | เพิ่มหรือยืนยัน screen/link |
| Medium | Legal labels ต้องตรง master | Master ใช้ Privacy Policy และ Terms of Service | ใช้ label ให้ตรง ไม่ใช้ Terms of Use เป็น source of truth |
| Medium | Sign Out confirmation ต้องชัด | Sign Out ต้อง clear session และกลับ Sign In | เพิ่ม confirmation และ signed-out destination |
| Medium | Change Password ต้องไม่กลายเป็น Settings-owned flow | Master อนุญาตเป็น Auth-linked entry สำหรับบัญชี Email / Password | แสดง entry เฉพาะ account type ที่รองรับและ route ไป Auth flow |
| Medium | Notification Settings ต้องไม่รวม type นอก baseline | รองรับเฉพาะ Like, Comment, Follow, Offer, Watch Alert | เพิ่ม toggle เฉพาะ baseline type และไม่รวม Chat/New Message |

---

# 6. Scope

## In Scope

- Settings Home
- Edit Profile entry
- Username
- Phone
- Line
- Email Display
- Language: English / Thai
- Theme Mode: Dark Mode / Light Mode
- Notification Settings สำหรับ Like, Comment, Follow, Offer, Watch Alert
- Change Password Auth-linked entry สำหรับ Email / Password account
- Help
- About
- Privacy Policy
- Terms of Service
- Sign Out
- Delete Account
- Confirmation states สำหรับ Sign Out และ Delete Account

## Out of Scope For V1 Unless Master Adds Decision

- Device Management
- Login History
- Security Activity Log
- Account switching
- In-app password management as Settings-owned scope
- Advanced notification preference center beyond baseline type toggles

---

# 7. Screen Mapping

| Screen / Component | Description |
| --- | --- |
| Settings Home | รวมเมนู Settings ทั้งหมด |
| Edit Profile | แก้ profile fields ที่ master รองรับ |
| Account Information | แสดง Username, Phone, Line, Email Display |
| Language Setting | เลือก English / Thai |
| Theme Mode Setting | เลือก Dark Mode / Light Mode |
| Help | หน้าช่วยเหลือ |
| About | ข้อมูลแอป |
| Privacy Policy | เอกสาร Privacy Policy |
| Terms of Service | เอกสาร Terms of Service |
| Sign Out Confirmation | ยืนยันก่อนออกจากระบบ |
| Delete Account Confirmation | ยืนยันก่อนลบบัญชี |

---

# 8. User States

## Guest

- ไม่สามารถเข้า Settings ของบัญชีได้
- ถ้าเปิด entry ที่ต้องใช้บัญชี ต้องแสดง Global Login Required Dialog หรือพาไป Sign In ตาม navigation pattern

## Member

- เข้า Settings ได้
- แก้ profile/contact fields ที่รองรับได้
- เห็น Email Display
- เปลี่ยน Language และ Theme Mode ได้
- เปิด Help, About, Privacy Policy, Terms of Service ได้
- Sign Out ได้
- เริ่ม Delete Account flow ได้

## SSO Account

- Email Display แสดง email จาก provider ได้
- Email ยังไม่สามารถแก้ไขหลังยืนยันแล้ว
- Change Password ไม่ใช่ Settings-owned action แต่ต้องแสดงเป็น Auth-linked entry เมื่อ account type รองรับ Email / Password

---

# 9. User Flow

## Open Settings Flow

```text
Profile / Menu
-> Settings
-> Settings Home
```

## Edit Profile Flow

```text
Settings
-> Edit Profile
-> Update Username / Phone / Line
-> Save
-> Profile updated
```

## Change Language Flow

```text
Settings
-> Language
-> Select English or Thai
-> Apply language
```

## Change Theme Flow

```text
Settings
-> Theme Mode
-> Select Dark Mode or Light Mode
-> Apply theme
```

## Open Legal Flow

```text
Settings
-> Privacy Policy or Terms of Service
-> Open document
```

## Sign Out Flow

```text
Settings
-> Sign Out
-> Confirm
-> Clear session
-> Sign In screen
```

## Delete Account Flow

```text
Settings
-> Delete Account
-> Show warning / confirmation
-> Confirm
-> Submit delete account request
-> Session ended or account state updated per implementation
```

---

# 10. Business Rules

## Settings Menu Rule

Settings must include:

- Edit Profile
- Username
- Phone
- Line
- Email Display
- Language: English / Thai
- Theme Mode: Dark Mode / Light Mode
- Help
- About
- Privacy Policy
- Terms of Service
- Sign Out
- Delete Account

## Profile / Contact Rule

- Username, Phone และ Line เป็น profile/contact fields ที่แก้ได้ตาม validation ของ Profile/Auth implementation
- Email Display แสดง email ของบัญชี
- Email ไม่สามารถเปลี่ยนได้หลังยืนยันแล้ว

## Language Rule

- Language setting ต้องรองรับ English และ Thai
- การเปลี่ยนภาษาต้องสะท้อน UI copy ตาม localization baseline

## Theme Mode Rule

- Theme Mode ต้องรองรับ Dark Mode และ Light Mode
- Theme mode ต้องคงค่าที่ user เลือกไว้ตาม implementation

## Help / About Rule

- Help ต้องเปิดข้อมูลช่วยเหลือหรือช่องทาง support ตาม implementation
- About ต้องแสดงข้อมูลเกี่ยวกับแอป เช่น version/app info ตาม implementation

## Legal Rule

- Privacy Policy และ Terms of Service ต้องเข้าถึงได้จาก Settings
- Label ต้องใช้ `Privacy Policy` และ `Terms of Service` ตาม master
- เอกสาร legal ควรเข้าถึงได้หลัง login และควรมี path จาก auth/consent flow ด้วย

## Sign Out Rule

- Sign Out ต้องมี confirmation
- เมื่อ Sign Out สำเร็จต้อง clear session
- หลัง Sign Out ต้องกลับไป Sign In หรือ logged-out state

## Delete Account Rule

- Delete Account อยู่ใน V1 master baseline
- ต้องมี warning/confirmation ก่อนดำเนินการ
- ต้องป้องกัน accidental deletion
- รายละเอียด retention/grace period เป็น Needs Decision หากยังไม่กำหนด

## Change Password Rule

- Auth Module รองรับ Change Password
- Settings แสดง Change Password เป็น Auth-linked entry ได้
- ต้องแสดงเฉพาะบัญชี Email / Password
- SSO-only account ต้องไม่เห็น Change Password หรือเห็น disabled state พร้อมอธิบายว่าใช้บัญชีจาก provider
- Change Password validation และ success/error state อ้างอิง Authentication Module

## Notification Settings Rule

- Notification Settings อยู่ใน V1 เฉพาะระดับ baseline notification type
- รองรับ toggle สำหรับ Like, Comment, Follow, Offer, Watch Alert
- ไม่รวม Chat / New Message เพราะ Chat ใช้ unread badge/count ในเมนู Chat
- ไม่รวม Moderation, Account Action, Market Update, Price / Valuation หรือ Sale Success ใน Front Office V1
- ถ้าปิด type ใด ต้องไม่สร้าง Front Office Notification Center item สำหรับ type นั้น แต่ backend/admin audit ยังทำงานตามระบบที่เกี่ยวข้องได้

---

# 11. Permission Rules

| Actor | Permission |
| --- | --- |
| Guest | เข้า account Settings ไม่ได้ |
| Member | เข้า Settings และจัดการค่า account ของตัวเองได้ |
| Other User | ไม่มีสิทธิ์ดูหรือแก้ Settings ของคนอื่น |
| Admin | จัดการผ่าน Back Office ไม่ใช่ Front Office Settings |

---

# 12. Validation Rules

| Field / Condition | Rule |
| --- | --- |
| Username | ใช้ validation จาก Profile/Auth implementation |
| Phone | Optional หรือ required ตาม profile decision |
| Line | Optional หรือ required ตาม profile decision |
| Email | Read-only หลัง verify |
| Language | ต้องเป็น English หรือ Thai |
| Theme Mode | ต้องเป็น Dark Mode หรือ Light Mode |
| Notification Settings | ต้องเป็น toggle ของ baseline notification type เท่านั้น |
| Sign Out | ต้อง confirm |
| Delete Account | ต้อง confirm และผ่าน safety step |

---

# 13. Exception Handling

## Save Failed

- TH: `ไม่สามารถบันทึกได้`
- EN: `Unable to save.`

## Session Expired

- TH: `กรุณาเข้าสู่ระบบอีกครั้ง`
- EN: `Please sign in again.`

## Delete Account Failed

- TH: `ไม่สามารถลบบัญชีได้`
- EN: `Unable to delete account.`

## Permission Denied

- TH: `คุณไม่มีสิทธิ์ดำเนินการ`
- EN: `Permission denied.`

---

# 14. Empty State

Settings Module ไม่มี empty state เฉพาะสำหรับ V1

ถ้ามีหน้า linked content เช่น Help หรือ Legal โหลดข้อมูลไม่ได้ ให้ใช้ error state พร้อม retry ตาม implementation

---

# 15. Notification Rules

Settings Module ไม่สร้าง notification ใน master baseline

Security alert, password changed notification หรือ delete account notification เป็น future / Needs Decision เว้นแต่ master เพิ่ม scope

---

# 16. Analytics Events

- `settings_opened`
- `edit_profile_opened`
- `settings_profile_saved`
- `settings_language_opened`
- `settings_language_changed`
- `settings_theme_opened`
- `settings_theme_changed`
- `help_opened`
- `about_opened`
- `privacy_policy_opened`
- `terms_of_service_opened`
- `sign_out_started`
- `sign_out_confirmed`
- `delete_account_started`
- `delete_account_confirmed`

---

# 17. Acceptance Criteria

## AC-SETTING-001: Member Opens Settings

Given user เป็น Member  
When user เปิด Settings  
Then ระบบต้องแสดง Settings Home

## AC-SETTING-002: Settings Menu Matches Master

Given Member เปิด Settings Home  
When รายการเมนูแสดง  
Then ต้องมี Edit Profile, Username, Phone, Line, Email Display, Language, Theme Mode, Help, About, Privacy Policy, Terms of Service, Sign Out และ Delete Account

## AC-SETTING-003: Email Display Is Read-Only

Given Member มี email ที่ verify แล้ว  
When Member เปิด account information  
Then ระบบต้องแสดง Email Display  
And ต้องไม่อนุญาตให้แก้ email

## AC-SETTING-004: Language Selection

Given Member เปิด Language setting  
When Member เลือก English หรือ Thai  
Then ระบบต้องบันทึก language selection  
And UI ต้องสะท้อนภาษาที่เลือกตาม localization baseline

## AC-SETTING-005: Theme Mode Selection

Given Member เปิด Theme Mode setting  
When Member เลือก Dark Mode หรือ Light Mode  
Then ระบบต้องบันทึก theme selection  
And UI ต้องสะท้อน theme ที่เลือก

## AC-SETTING-006: Legal Documents

Given Member เปิด Settings  
When Member กด Privacy Policy หรือ Terms of Service  
Then ระบบต้องเปิดเอกสารที่เกี่ยวข้อง

## AC-SETTING-007: Help And About

Given Member เปิด Settings  
When Member กด Help หรือ About  
Then ระบบต้องเปิดหน้าที่เกี่ยวข้อง

## AC-SETTING-008: Sign Out

Given Member อยู่ใน Settings  
When Member กด Sign Out และ Confirm  
Then ระบบต้อง clear session  
And กลับไป Sign In หรือ logged-out state

## AC-SETTING-009: Delete Account Entry

Given Member เปิด Settings  
When รายการเมนูแสดง  
Then ต้องมี Delete Account entry

## AC-SETTING-010: Delete Account Confirmation

Given Member กด Delete Account  
When Delete Account flow เริ่ม  
Then ระบบต้องแสดง warning/confirmation ก่อนดำเนินการ

## AC-SETTING-011: Guest Cannot Access Settings

Given user เป็น Guest  
When user พยายามเปิด account Settings  
Then ระบบต้องไม่แสดง account Settings ของ Member

## AC-SETTING-012: Notification Settings Baseline

Given Member เปิด Settings  
When Member เปิด Notification Settings  
Then ต้องเห็น toggle เฉพาะ Like, Comment, Follow, Offer และ Watch Alert  
And ต้องไม่เห็น Chat/New Message, Market Update, Price / Valuation, Sale Success, Moderation หรือ Account Action เป็น Front Office V1 notification setting

## AC-SETTING-013: Change Password Auth Linked Entry

Given Member ใช้บัญชี Email / Password  
When Member เปิด Settings  
Then ต้องเห็น Change Password entry ที่ route ไป Authentication Module  
Given Member ใช้ SSO-only account  
When Member เปิด Settings  
Then ต้องไม่แสดง Change Password เป็น active action

---

# 18. Related Modules

- Authentication Module
- Profile Module
- Notification Module
- Trust & Safety Module

---

# 19. Future Enhancement

- Device Management
- Login History
- Security Activity Log
- Advanced notification preference center
- Password Changed / Security Alert notifications
- Delete account retention/grace-period configuration
