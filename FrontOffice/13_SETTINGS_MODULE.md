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

Settings V1 ต้องรองรับรายการที่ master ระบุครบ ได้แก่ Edit Profile, Username, Phone, Line, Email Display, Language, Theme Mode, Notification Settings, Change Password แบบ Auth-linked entry, Help, About app, Privacy Policy, Terms of Use, Sign Out และ Delete Account โดย Delete Account ต้องอยู่ใน `About your account` ไม่ใช่เป็น action บน Settings Home โดยตรง

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
| Help / About | Help, About app | ต้องมีเมนูทั้งสองรายการ และ About ต้องเป็นข้อมูลแอป ไม่ใช่ข้อมูลบัญชี |
| Legal | Privacy Policy, Terms of Use | ต้องเข้าถึง legal docs ได้ |
| Session | Sign Out | ต้อง Sign Out พร้อม confirmation |
| Account | About your account, Delete Account | ต้องมี Delete Account flow/state ใน V1 baseline โดยวางใน About your account |
| Source of Truth Conflict | เอกสารเดิมบอก Language/Dark Mode/Delete Account ยังไม่มี | ให้ยึด master ล่าสุดเป็นหลัก |

---

# 5. Figma Gap Checklist For Settings Module

| Priority | Figma Gap | Master Baseline | Action |
| --- | --- | --- | --- |
| Must Fix | Settings ยังไม่มี Theme Mode | Settings ต้องมี Theme Mode: Dark Mode / Light Mode | เพิ่ม setting สำหรับ Theme Mode |
| Must Fix | Settings เดิมอาจระบุ Delete Account เป็น future หรือยังไม่มี state หลังลบสำเร็จ | Master ระบุ Delete Account อยู่ใน Settings baseline | เพิ่ม Delete Account ใน `About your account`, confirmation/risk state, `Account deletion started` success modal, Sign In destination และ API failure/retry state |
| High | Language setting ยังไม่ชัด | Settings ต้องมี Language: English / Thai | เพิ่ม language selector และ selected state |
| High | Email field ต้อง lock หลัง verification | Auth rule ระบุ Email ไม่สามารถเปลี่ยนได้หลังยืนยันแล้ว | แสดง Email Display เป็น read-only หรือ disabled edit |
| High | Settings menu ต้องครบ master list | Master รองรับ Account section, Language, Theme Mode, Notification Settings, Help, Privacy Policy, Terms of Use, About app และ Sign Out | ใช้ locked section order และตัดเมนูนอก baseline; Delete Account อยู่ใน `About your account` |
| Medium | Help / About content ต้องล็อกตาม Figma ล่าสุด | Master ระบุ Help และ About app | ใช้ Help contact copy และ About app copy ตาม Business Rules |
| Medium | Legal labels ต้องตรง master | Master ใช้ Privacy Policy และ Terms of Use | ใช้ label `Terms of Use` เป็น source of truth |
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
- About your account
- Language: English / Thai
- Theme Mode: Dark Mode / Light Mode
- Notification Settings สำหรับ Like, Comment, Follow, Offer, Watch Alert
- Change Password Auth-linked entry สำหรับ Email / Password account
- Help
- About app
- Privacy Policy
- Terms of Use
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
| About your account | แสดงข้อมูลบัญชี เช่น Date joined และเป็นตำแหน่งของ Delete Account |
| Language Setting | เลือก English / Thai |
| Theme Mode Setting | เลือก Dark Mode / Light Mode |
| Help | หน้าช่วยเหลือและช่องทางติดต่อ support |
| About | ข้อมูลแอปและบริษัท |
| Privacy Policy | เอกสาร Privacy Policy |
| Terms of Use | เอกสาร Terms of Use |
| Sign Out Confirmation | ยืนยันก่อนออกจากระบบ |
| Delete Account Confirmation | ยืนยันก่อนลบบัญชี |
| Account Deletion Started | แจ้งว่าบัญชีถูก deactivate และ session ถูก revoke แล้ว |
| Account Deleted Support State | state เมื่อ user พยายาม login ระหว่าง grace period |
| Change Password | Auth-linked screen with current password, new password and confirm new password fields |

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
- เปิด Help, About, Privacy Policy, Terms of Use ได้
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
-> Privacy Policy or Terms of Use
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
-> Show Delete Account Confirmation
-> Confirm
-> Submit delete account request
-> Soft delete / deactivate account
-> Revoke session and clear token
-> Account Deletion Started modal
-> Back to sign in
-> Sign In screen
```

If delete account request fails:

```text
Delete Account Confirmation
-> Confirm
-> API error
-> Stay on current account context
-> Show retry/error state
```

---

# 10. Business Rules

## Settings Menu Rule

Settings Home must use this section order:

1. Account
2. Your app and media
3. Notifications
4. More info and support
5. Sign Out button

Settings Home must include:

- Account
  - Edit profile
  - Change password
  - About your account
- Your app and media
  - Language
  - Theme mode
- Notifications
  - Notification settings
- More info and support
  - Help
  - Privacy Policy
  - Terms of Use
  - About
- Bottom action
  - Sign out

Delete Account must not appear as a direct Settings Home action. It must be inside `About your account`.

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

- Help ต้องแสดงช่องทางติดต่อ support ตาม locked copy ด้านล่าง
- About ต้องเป็นข้อมูลแอปและบริษัท ไม่ใช่ข้อมูลบัญชี
- `Contact support` จาก About ต้อง route ไป Help screen เดิม ไม่ต้องสร้างหน้าใหม่

Help screen copy:

- Title: `Help`
- Heading: `Contact support`
- Availability:
  - `Available daily`
  - `09:00 - 22:00 (GMT+7)`
- Contact rows:
  - LINE: `@mrfoxthailand`
  - Phone: `(+66) 80-008-8088`
  - Email: `service@mrfox.com`

Help screen interaction:

- LINE row เปิด LINE หรือ external link ตาม implementation
- Phone row เปิด dialer
- Email row เปิด mail composer

About app screen copy:

- Title: `About`
- Brand: `TUK DAENG`
- Tagline: `The digital curator for watch collectors`
- Version: `Version 0.0.1`
- Company:
  - `Mister Fox Co., Ltd.`
  - `Est. 2026`
- Links:
  - `Privacy Policy`
  - `Terms of Use`
  - `Contact support`

About app must not include:

- Delete Account
- Change Password
- Edit Profile
- Date joined
- User profile/contact fields

## Legal Rule

- Privacy Policy และ Terms of Use ต้องเข้าถึงได้จาก Settings
- Label ต้องใช้ `Privacy Policy` และ `Terms of Use` ตาม master
- เอกสาร legal ควรเข้าถึงได้หลัง login และควรมี path จาก auth/consent flow ด้วย

## Sign Out Rule

- Sign Out ต้องมี confirmation
- Confirmation title ใช้ `Sign out?`
- Confirmation body ใช้ `You will need to sign in again to access your account.`
- Confirmation actions ใช้ `Cancel` และ `Sign out`
- เมื่อ Sign Out สำเร็จต้อง clear session
- หลัง Sign Out ต้องกลับไป Sign In / pre-auth ที่มีอยู่แล้ว และ user ต้องกด back กลับเข้า Settings ไม่ได้

## Delete Account Rule

- Delete Account อยู่ใน V1 master baseline
- Delete Account ต้องอยู่ใน `About your account`
- `About your account` ต้องแสดง profile image, display name, `Date joined` และปุ่ม `Delete account`
- ต้องมี warning/confirmation ก่อนดำเนินการ
- ต้องป้องกัน accidental deletion
- Delete Account V1 เป็น soft delete หลัง user confirm
- หลัง Delete Account สำเร็จต้อง deactivate account, revoke session และ clear local token
- หลัง Delete Account สำเร็จต้องแสดง `Account deletion started` success modal ก่อนพาไป Sign In
- ปุ่ม success modal ใช้ `Back to sign in`
- `Back to sign in` ต้องพาไปหน้า Sign In / pre-auth ที่มีอยู่แล้ว ไม่ต้องสร้าง signed-out screen ใหม่
- หลัง session ถูก revoke แล้ว user ต้องกด back กลับเข้า About Account / Profile / Settings ไม่ได้
- ถ้า Delete Account API fail ต้องไม่ sign out, ไม่ clear session และต้องแสดง error/retry จาก context เดิม
- ใช้ grace period 30 วันก่อน hard delete/anonymization ตาม policy
- ระหว่าง grace period user login ไม่ได้ หรือเห็น account-deleted support state
- ต้องแจ้งผลกระทบต่อ profile, assets, chat, offers และข้อมูลที่ต้อง retain ตาม legal/safety policy

Delete Account confirmation copy:

- Title: `Delete account?`
- Body:
  - `Your account will be deactivated and your public profile will be removed from TukDaeng.`
  - `Your listed assets will no longer appear in Feed, Search, Watch Alert results, or Public Profile.`
  - `Some records such as chats, offers, reports, and transaction history may be retained for safety, legal, or audit purposes.`
  - `You will be signed out immediately. Deletion will be completed after a 30-day grace period.`
- Actions: `Cancel`, `Delete account`

Account deletion started copy:

- Title: `Account deletion started`
- Body:
  - `Your account has been deactivated and you have been signed out.`
  - `Deletion will be completed after the 30-day grace period. Some records may be retained for safety, legal, or audit purposes.`
- Action: `Back to sign in`

Deleted account login copy:

- Title: `Account scheduled for deletion`
- Body: `This account is scheduled for deletion. Please contact support if this was a mistake.`

## Change Password Rule

- Auth Module รองรับ Change Password
- Settings แสดง Change Password เป็น Auth-linked entry ได้
- ต้องแสดงเฉพาะบัญชี Email / Password
- SSO-only account ต้องไม่เห็น Change Password หรือเห็น disabled state พร้อมอธิบายว่าใช้บัญชีจาก provider
- Change Password screen ต้องมี `Current password`, `New password`, `Confirm new password`
- `New password` helper text ใช้ `At least 8 characters, with a number or symbol.`
- Change Password validation และ success/error state อ้างอิง Authentication Module
- Change Password สำเร็จไม่จำเป็นต้อง sign out; ให้แสดง `Password changed` แล้วกลับ Settings หรือให้ user กลับ Settings ได้

## Notification Settings Rule

- Notification Settings อยู่ใน V1 เฉพาะระดับ baseline notification type
- รองรับ toggle สำหรับ Like, Comment, Follow, Offer, Watch Alert
- Toggle default state สำหรับ Member ใหม่เป็น ON ทุกประเภท
- Toggle ต้อง auto-save เมื่อเปิด/ปิด โดยไม่ต้องมี Save button
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

## Account Scheduled For Deletion

- TH: `บัญชีนี้อยู่ระหว่างดำเนินการลบ กรุณาติดต่อ Support หากเป็นความผิดพลาด`
- EN: `This account is scheduled for deletion. Please contact support if this was a mistake.`

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
- `terms_of_use_opened`
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
Then ต้องมี Account section พร้อม Edit profile, Change password และ About your account  
And ต้องมี Your app and media section พร้อม Language และ Theme mode  
And ต้องมี Notifications section พร้อม Notification settings  
And ต้องมี More info and support section พร้อม Help, Privacy Policy, Terms of Use และ About  
And ต้องมี Sign out เป็น bottom action  
And ต้องไม่แสดง Delete Account เป็น direct action บน Settings Home

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
When Member กด Privacy Policy หรือ Terms of Use  
Then ระบบต้องเปิดเอกสารที่เกี่ยวข้อง

## AC-SETTING-007: Help And About

Given Member เปิด Settings  
When Member กด Help หรือ About  
Then ระบบต้องเปิดหน้าที่เกี่ยวข้อง
And Help ต้องแสดง `Contact support`, เวลาทำการ `09:00 - 22:00 (GMT+7)` และช่องทาง LINE, Phone, Email ตาม locked copy
And About ต้องแสดง `TUK DAENG`, tagline, `Version 0.0.1`, company, Privacy Policy, Terms of Use และ Contact support
And About ต้องไม่แสดงข้อมูลบัญชีหรือ Delete Account

## AC-SETTING-008: Sign Out

Given Member อยู่ใน Settings
When Member กด Sign out
Then ต้องแสดง confirmation title `Sign out?`
And body ต้องเป็น `You will need to sign in again to access your account.`
And actions ต้องเป็น `Cancel` และ `Sign out`
When Member confirm Sign out
Then ระบบต้อง clear session  
And กลับไป Sign In / pre-auth  
And user ต้องกด back กลับเข้า Settings ไม่ได้

## AC-SETTING-009: Delete Account Entry

Given Member เปิด Settings
When Member เปิด About your account
Then ต้องแสดง Date joined และปุ่ม Delete account
And Delete Account ต้องไม่อยู่บน Settings Home โดยตรง

## AC-SETTING-010: Delete Account Confirmation

Given Member กด Delete Account  
When Delete Account flow เริ่ม  
Then ระบบต้องแสดง warning/confirmation ก่อนดำเนินการ
And confirmation ต้องใช้ title `Delete account?`
And ต้องมี actions `Cancel` และ `Delete account`
And copy ต้องแจ้งผลต่อ public profile, listed assets, retained records, sign out ทันที และ 30-day grace period

## AC-SETTING-010A: Delete Account Retention

Given Member confirm Delete Account สำเร็จ  
When ระบบดำเนินการลบบัญชี  
Then ระบบต้อง soft delete account, revoke session, sign out user และใช้ grace period 30 วันก่อน hard delete/anonymization ตาม policy

## AC-SETTING-010B: Deleted Account Login State

Given account อยู่ใน grace period หลัง Delete Account  
When user พยายาม login  
Then ระบบต้องไม่ให้เข้าใช้งานบัญชีปกติ และต้องแสดง account-deleted support state

## AC-SETTING-010C: Delete Account Success Destination

Given Member confirm Delete Account สำเร็จ  
When API delete account สำเร็จ  
Then ระบบต้องแสดง `Account deletion started` success modal  
And ปุ่ม `Back to sign in` ต้องพาไปหน้า Sign In / pre-auth  
And user ต้องกด back กลับเข้า About Account, Profile หรือ Settings ไม่ได้

## AC-SETTING-010D: Delete Account Failure

Given Member confirm Delete Account  
When API delete account ล้มเหลว  
Then ระบบต้องไม่ revoke session  
And ต้องไม่พาออกจาก account context  
And ต้องแสดง error/retry state

## AC-SETTING-011: Guest Cannot Access Settings

Given user เป็น Guest  
When user พยายามเปิด account Settings  
Then ระบบต้องไม่แสดง account Settings ของ Member

## AC-SETTING-012: Notification Settings Baseline

Given Member เปิด Settings  
When Member เปิด Notification Settings  
Then ต้องเห็น toggle เฉพาะ Like, Comment, Follow, Offer และ Watch Alert  
And ต้องไม่เห็น Chat/New Message, Market Update, Price / Valuation, Sale Success, Moderation หรือ Account Action เป็น Front Office V1 notification setting
And default state ของ Member ใหม่ต้องเป็น ON ทุก type
And การเปิด/ปิด toggle ต้อง auto-save โดยไม่มี Save button

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
