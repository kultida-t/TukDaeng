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

Settings Module ใช้สำหรับให้ Member จัดการบริบทบัญชี คลังเนื้อหา การควบคุมสิ่งที่เห็น การแสดงผล ภาษา การแจ้งเตือน ความเป็นส่วนตัว/cookie เอกสารช่วยเหลือ/กฎหมาย การออกจากระบบ และการลบบัญชี

Settings Home ใช้โครง `Settings and activity` แบบ 6 sections (Account, Your library, What you see, Your app and media, Notifications, More info and support) + Login/Log out ตาม prototype — Edit profile ไม่มี row บน Settings Home (entry อยู่ที่ own profile page เท่านั้น — S-05), Change Password อยู่ใน `About your account > Security` (S-28) และ Delete Account อยู่ใน `About your account > Account management`

---

# 3. Prototype Reference

| Prototype | Usage |
| --- | --- |
| `Prototypes/fo-flow/index.html` | Settings home `settings` ~17159–17187; `about_account` ~17188–17207; `change_pwd` ~17208–17246 + submit/forgot handlers ~20910–20996; `del_account` ~17247–17337 + del-flow handlers ~20799–20909; `lang` ~17338–17347 + handler ~20997–21003; `notif_settings` ~17348–17361 + handler ~21005–21011; `help` ~17362–17374; `privacy` ~17375–17395; `terms` ~17396–17412; `about_app` ~17413–17427; `favorites`/`muted`/`blocked` ~17428–17460 + handlers ~21034–21102/~21644–21649; `prefs`/`sensitive` ~17461–17479 + `interested`/`ni` ~17509–17510 + sens/snooze/reset/unlike/restore handlers ~20705–20716/~21013–21014/~21026–21102; `theme` ~17481–17489 + handler ~21018–21024; reset dialog ~14719–14725; del-password dialog ~14734–14746; del-success dialog ~14750–14766; forgot-password dialog ~14772–14780; logout dialog ~14726–14733 + handler ~20785–20798; settings entry `.pf-menu` ~16856/~21494 (`.set-btn` ~20746 = dead handler); legal i18n map ~19485–19500; persist keys `fo_lang`/`fo_theme`/`fo_account` ~19405–19419/~20902; guest gate `obGate` member sheet ~22996–23009; sub-page route names 00_NAV §6.6 |

---

# 4. Master Alignment Summary

| Topic | Master Baseline | Settings Module Rule |
| --- | --- | --- |
| Profile Edit | Edit Profile, Username, Phone, Line | Edit profile entry = own profile page เท่านั้น (06_PROFILE — S-05); contact fields Username/Phone/Line = contract-only (prototype ไม่มี contact rows — gap 004 B10) |
| Email | Email Display | contract-only — prototype ไม่มี email row ใน Settings; email ที่ verify แล้วเปลี่ยนไม่ได้ตาม Auth rule |
| Language | English / Thai | Language page: 2 options + flag + check + toast; apply ทันทีผ่าน display layer |
| Theme | Dark Mode / Light Mode | Theme mode page: 2 options + check; apply ทันทีทั้งแอป ไม่มี save/toast |
| Notification Settings | Baseline notification type preferences | Notification settings page: 4 toggles (Likes / Comments / New followers / Watch Alerts) ใน 2 groups; default ON; auto-save |
| Change Password | Auth-linked entry | In-app page ใน `About your account > Security` (S-28) — 3 fields + forgot link; mechanics/validation อยู่ที่ §9 Change Password Rule |
| Help / About | Help, About app | Help = support channels + help topics; About = brand/app info + Legal & Support links; ไม่แสดงข้อมูลบัญชี |
| Legal | Privacy Policy, Terms of Use | In-app legal pages + entry จากหลาย surfaces; canonical legal viewer + policy versioning อยู่ที่ 00_GLOBAL §8 |
| Consent | Required + optional consent | Optional consent (Analytics / Personalized) เปลี่ยนได้ที่ Settings > Privacy & cookies — contract (canonical consent model 00_GLOBAL §8) |
| Session | Sign Out | Row `Log out` + confirmation → session `guest` + toast + Member Sheet (canonical flow 01_AUTH §8 Sign Out) |
| Account | About your account, Delete Account | About your account = hero + account info + Security (Change password) + Account management (Delete account = 2-page flow + password confirm + scheduled dialog → session `guest` — S-27) |
| Source of Truth Conflict | เอกสารเดิมบอก Language/Dark Mode/Delete Account ยังไม่มี | ให้ยึด master ล่าสุดเป็นหลัก |

---

# 5. Scope

## In Scope

- Settings Home — `Settings and activity` 6-section structure
- About your account — hero, account information, Security, Account management
- Your library entries — Saved, Wish List, Archive, Watch Alerts (row + count badge; เนื้อหาหน้าปลายทางอยู่ที่ 02_FEED / 10_WATCH_ALERT / 11_SOCIAL)
- What you see — Favorites, Muted accounts, Blocked, Content preferences pages (settings-surface spec อยู่ในเล่มนี้ §9; feed/social semantics เชิงลึก canonical อยู่ที่ 02_FEED / 06_PROFILE / 11_SOCIAL / 00_GLOBAL §13)
- Language: English / Thai
- Theme Mode: Dark Mode / Light Mode
- Notification Settings สำหรับ Likes, Comments, New followers, Watch Alerts
- Privacy & cookie preferences — Essential always-on + Analytics / Personalized toggles (contract — prototype ไม่มีหน้านี้; required โดย 00_GLOBAL §8)
- Help
- About app
- Privacy Policy
- Terms of Use
- Log out
- Delete Account — 2-page flow (terms → reason required) + password confirmation + scheduled dialog + 30-day grace period (login-to-restore, S-02)
- Change Password — in-app page mechanics + Forgot password link
- Confirmation states สำหรับ Log out, Delete Account, Reset suggested content และ Unblock

## Contract-Only Keep (S-29 — prototype ไม่ครอบ แต่คงเป็น spec contract)

- Account contact fields — Username, Phone, Line, Email Display (prototype ไม่มี contact rows ใน Settings/About your account)
- SSO account visibility rules สำหรับ Change Password (prototype ไม่มี account-type concept — แสดงเสมอ)
- Delete Account failure path / network error states / restore-failed support state (prototype: รหัสผ่านถูก = success เสมอ ไม่มี failure path และไม่มี deleted-state check ที่ sign in — login-to-restore เป็น spec contract ตาม S-02)
- Analytics events ทั้งเล่ม (ไม่มี tracking layer ใน prototype)

## Out of Scope For V1 Unless Master Adds Decision

- Device Management
- Login History
- Security Activity Log
- Account switching
- Advanced notification preference center beyond baseline type toggles
- Chat notification preferences (อยู่ที่ Chat config ในหน้า Chat — 07_CHAT)

---

# 6. Screen Mapping

ทุกหน้าเป็น sub page ใน `.page-sub` stack ของ own profile surface (route names ตาม 00_NAV §6.6 — settings stack เปิดทับ profile แล้ว push ทีละหน้า)

| Screen / Component | Route | Description |
| --- | --- | --- |
| Settings Home | `settings` | หัวข้อ `Settings and activity` — 6 sections + Login/Log out (รายละเอียด §9 Settings Menu Rule) |
| About your account | `about_account` | hero + account information + Security (Change password) + Account management (Delete account) |
| Language | `lang` | เลือก English / ภาษาไทย + check + toast |
| Theme mode | `theme` | เลือก Light / Dark + check — apply ทันทีทั้งแอป |
| Notification settings | `notif_settings` | 4 toggles ใน 2 groups — auto-save |
| Privacy & cookies | (contract — ยังไม่มี route) | Essential `Always on` + Analytics / Personalized toggles |
| Help | `help` | Support channels + Help topics |
| Privacy Policy | `privacy` | In-app legal page — 4 sections |
| Terms of Use | `terms` | In-app legal page — 3 sections |
| About | `about_app` | ข้อมูลแอป/บริษัท + Legal & Support links |
| Saved / Wish List / Archive | `saved` / `wishlist` / `archive` | Library destinations — spec อยู่ที่ 02_FEED / 11_SOCIAL |
| Watch Alerts | `walerts` | Library destination — spec อยู่ที่ 10_WATCH_ALERT |
| Favorites / Muted / Blocked | `favorites` / `muted` / `blocked` | Account-list pages (add/remove/search/unmute/unblock) — §9 What You See Pages Rule |
| Content preferences | `prefs`, `sensitive`, `interested`, `ni` | `prefs` = hub (sensitive/interested/not-interested rows + snooze toggle + reset); `sensitive`/`interested`/`ni` = sub pages — §9 Content Preferences Rule |
| Change Password | `change_pwd` | In-app page ใน About your account > Security — 3 fields + eye toggles + Forgot your password? link — §9 Change Password Rule |
| Delete Account | `del_account` | 2-page flow (`_delStep` 1 terms → 2 reason) + `Confirm account deletion` password dialog + `Account deletion scheduled` dialog — §9 Delete Account Rule |
| Log Out Confirmation | dialog | `Log out of @{user}?` + Log out / Cancel |

---

# 7. User States

## Guest

- ไม่สามารถเข้า Settings ได้ — Settings เข้าผ่าน own profile menu (`.pf-menu`) ซึ่งอยู่ใน login-required gate (canonical 00_GLOBAL §11); guest แตะแล้วเปิด Member Sheet `Join TukDaeng` ทับ surface เดิม
- Guest ยังเปิดอ่าน Privacy Policy และ Terms of Use ได้จาก auth/onboarding surfaces (legal viewer — 00_GLOBAL §8) แต่ไม่ใช่ผ่าน Settings

## Member

- เข้า Settings ได้จาก own profile `pf-menu` เท่านั้น
- เปิด About your account, Your library, What you see, Language, Theme mode, Notification settings, Privacy & cookies, Help, Privacy Policy, Terms of Use, About ได้
- เปิด What you see pages (Favorites / Muted accounts / Blocked) และจัดการรายการได้ — เพิ่ม/ลบ favorite, unmute, unblock (unblock ต้องผ่าน confirm dialog)
- เปิด Content preferences และปรับ sensitive level / ลบ interested / restore not-interested / snooze suggested posts / reset suggested content ได้
- Log out ได้
- เริ่ม Delete Account flow ได้จาก About your account — ต้องเลือกเหตุผลและยืนยันด้วย current password ก่อน schedule deletion
- แก้ profile ได้จาก own profile page (Edit profile — 06_PROFILE; ไม่มี row ใน Settings)
- เห็น Email Display (contract-only — prototype ไม่มี email row)

## SSO Account

- Email Display แสดง email จาก provider ได้ และเปลี่ยนไม่ได้หลังยืนยัน (contract-only)
- Change Password ต้องไม่แสดงเป็น active action (contract — prototype ไม่มี account-type concept แสดงเสมอ)

---

# 8. User Flow

## Open Settings Flow

```text
Own Profile
-> pf-menu (Settings and activity)
-> Settings Home (sub page `settings`)
-> pushSub ทีละหน้า / sub-back pop กลับ (00_NAV §6)
```

## Edit Profile Flow

```text
Own Profile
-> Edit profile (profile page entry — 06_PROFILE, ไม่มี row ใน Settings)
-> Update profile fields
-> Save
-> Profile updated
```

## Change Language Flow

```text
Settings
-> Language
-> Select English / ภาษาไทย
-> Apply ทันทีทั้ง UI (display-layer swap) + check ย้ายไปตัวที่เลือก
-> Toast `เปลี่ยนภาษาเรียบร้อย` / `Language updated`
-> Persist per device (`fo_lang`)
```

## Change Theme Flow

```text
Settings
-> Theme mode
-> Select Light / Dark
-> Apply ทันทีทั้งแอป (theme attribute swap) + check ย้ายไปตัวที่เลือก
-> Persist per device (`fo_theme`)
```

## Open Legal Flow

```text
Settings
-> Privacy Policy / Terms of Use
-> In-app legal page (scrollable sections)
```

## Cookie Preferences Flow (contract — prototype ไม่มีหน้านี้)

```text
Settings
-> Privacy & cookies
-> Toggle Analytics / Personalized
-> บันทึกลง consent record ทันที (canonical 00_GLOBAL §8)
```

## Change Password Flow

```text
About your account
-> Security > Change password
-> change_pwd page (Current / New / Re-type new password + eye toggles)
-> inline validation ตามลำดับ (§9 Change Password Rule)
-> สำเร็จ -> sub-back กลับ About your account + toast `Password changed successfully`
```

Forgot branch:

```text
change_pwd
-> `Forgot your password?`
-> `Reset password?` dialog (masked email + Send reset link / Cancel)
-> `Send reset link` -> toast `Password reset link sent to {masked email}`
```

## Content Preferences Flow

```text
Settings
-> What you see > Content preferences (`prefs`)
-> Sensitive content -> `sensitive` (Less / Standard + check — apply ทันที)
-> Interested -> `interested` (liked posts + Remove = unlike)
-> Not interested -> `ni` (marked posts + Restore)
-> Snooze suggested posts toggle -> feed `All` tab เหลือเฉพาะ followed accounts 30 วัน
-> Reset suggested content -> confirm `Reset suggested content?`
   -> เคลียร์ not-interested marks ทั้งหมด + ปิด snooze + toast `Suggested content reset`
```

## Favorites / Muted / Blocked Flow

```text
Settings
-> What you see
-> Favorites (`favorites`) — search / Remove / Remove all / Suggested > Add account
-> Muted accounts (`muted`) — Unmute per row -> toast `Posts unmuted`
-> Blocked (`blocked`) — Unblock per row -> `Unblock {user}?` confirm dialog
-> แตะ row -> public profile ของบัญชีนั้น
```

## Log Out Flow

```text
Settings
-> Log out (Login section)
-> Confirm dialog `Log out of @{user}?`
-> session `guest` บน feed + toast `Logged out successfully`
-> Member Sheet `Join TukDaeng` (scrim/Skip = browse ต่อเป็น guest)
```

Canonical sign-out semantics อยู่ที่ 01_AUTHENTICATION §8 Sign Out — เล่มนี้กำหนดเฉพาะ entry + confirmation UI

## Delete Account Flow

```text
About your account
-> Account management > Delete account (danger row)
-> `del_account` step 1 `Delete account` — hero + 3 term cards
-> `Continue to delete`
-> step 2 `Why are you leaving?` — reason (required) + optional feedback
-> `Continue` (ยังไม่เลือก reason -> inline err `Please select a reason to continue.`)
-> `Confirm account deletion` dialog — current password + eye toggle
-> รหัสผ่านถูก -> `Account deletion scheduled` dialog (วันที่ลบถาวร = request +30 วัน)
-> `Log out`
-> ปิด settings stack ทั้งกอง -> session `guest` บน feed (scroll to top)
   + ลบ credential ที่ persist (เฉพาะบัญชีที่สมัครในเครื่อง — 01_AUTH §9)
   + toast `Account deactivated. 30-day grace period started.`
   + Member Sheet `Join TukDaeng` — sign in ภายใน 30 วัน = cancel deletion + restore (S-02)
```

If delete account request fails (contract — prototype ไม่มี failure path):

```text
Confirm account deletion
-> Delete account
-> API error
-> Stay on current context — ไม่ sign out / ไม่ revoke session
-> Show retry/error state
```

---

# 9. Business Rules

## Settings Menu Rule

Settings Home ใช้หัวข้อ `การตั้งค่าและกิจกรรม` / `Settings and activity` และเรียง 6 sections + Login ตามลำดับนี้ (S-05 — adopt prototype structure):

| # | Section (TH / EN) | Rows |
| --- | --- | --- |
| 1 | `บัญชี` / `Account` | `About your account` |
| 2 | `คลังของคุณ` / `Your library` | `Saved` / `Wish List` / `Archive` / `Watch Alerts` — ทุก row มี count badge |
| 3 | `สิ่งที่คุณเห็น` / `What you see` | `Favorites` / `Muted accounts` / `Blocked` — มี count badge; `Content preferences` — ไม่มี badge |
| 4 | `แอปและสื่อของคุณ` / `Your app and media` | `Language` (value pill = ภาษาปัจจุบัน), `Theme mode` (value pill = theme ปัจจุบัน) |
| 5 | `การแจ้งเตือน` / `Notifications` | `Notification settings` |
| 6 | `ข้อมูลเพิ่มเติมและการสนับสนุน` / `More info and support` | `Help`, `Privacy & cookies` (contract — prototype ไม่มี row นี้ แต่ required โดย 00_GLOBAL §8 settings path), `Privacy Policy`, `Terms of Use`, `About` |
| — | `การเข้าสู่ระบบ` / `Login` | `ออกจากระบบ` / `Log out` — danger row ไม่มี chevron |

Settings Home rules:

- Settings เข้าได้จาก own profile menu (`.pf-menu` burger) เท่านั้น — ไม่มี settings button อื่นที่ใช้งานได้ (`.set-btn` = dead handler ใน prototype ไม่ใช่ spec feature)
- Edit profile ไม่มี row บน Settings Home — entry เดียวคือ own profile page (06_PROFILE; S-05)
- Change password และ Delete account อยู่ใน `About your account` ไม่ใช่บน home โดยตรง
- Count badges บน library/what-you-see rows ต้องสะท้อนข้อมูลจริงของ session ปัจจุบัน
- Language/Theme rows แสดงค่าปัจจุบันเป็น value pill

## About Your Account Rule

`About your account` ประกอบด้วย:

- Hero — avatar + display name + `@{username}`
- `ข้อมูลบัญชี` / `Account information` — `Date joined` และ `ตำแหน่งบัญชี` / `Account based in` = Thailand
- `ความปลอดภัย` / `Security` — `Change password` row → `change_pwd` (§9 Change Password Rule)
- `การจัดการบัญชี` / `Account management` — `ลบบัญชีผู้ใช้` / `Delete account` danger row → 2-page delete flow (§9 Delete Account Rule)
- Contact rows (Username / Phone / Line / Email Display) = contract-only — prototype ไม่มี (gap 004 B10)

## Profile / Contact Rule (contract-only)

- Username, Phone และ Line เป็น profile/contact fields ที่แก้ได้ตาม validation ของ Profile/Auth implementation — prototype ไม่มี UI สำหรับ fields เหล่านี้ใน Settings
- Email Display แสดง email ของบัญชี — read-only หลัง verify

## Language Rule

- หน้า `ภาษา` / `Language` + desc `Choose your preferred language for the TukDaeng app.`
- มี 2 options พร้อม flag icon + label + desc + check บนตัวเลือกปัจจุบัน:
  - `English` — `App interface in English`
  - `ภาษาไทย` — `หน้าจอแอปเป็นภาษาไทย`
- เลือกแล้ว apply ทันทีทั้ง UI โดยไม่ต้องมี save — prototype ใช้ display-layer swap (data keys ยังเป็น EN, user-generated text ไม่ถูกแปล)
- สำเร็จแล้ว toast `เปลี่ยนภาษาเรียบร้อย` / `Language updated`
- Persist ค่าภาษาต่อ device (prototype `fo_lang` — default `en`)
- Language row บน Settings Home แสดง value pill เป็นภาษาปัจจุบัน (`ภาษาไทย` / `English`)

## Theme Mode Rule

- หน้า `โหมดธีม` / `Theme mode` + desc `Choose how TukDaeng looks on this device.`
- มี 2 options พร้อม icon + label + desc + check บนตัวเลือกปัจจุบัน:
  - `โหมดสว่าง` / `Light mode` — `Bright background for daytime browsing.`
  - `โหมดมืด` / `Dark mode` — `Dimmed background that's easier on the eyes at night.`
- เลือกแล้ว apply ทันทีทั้งแอปผ่าน theme attribute — ไม่ re-render ทั้ง app, ไม่มี toast
- Persist ค่า theme ต่อ device (prototype `fo_theme` — default `dark`)
- Theme mode row บน Settings Home แสดง value pill เป็น theme ปัจจุบัน

## Help / About Rule

- Help ต้องแสดงช่องทางติดต่อ support ตาม locked copy ด้านล่าง + `Help topics` section
- About ต้องเป็นข้อมูลแอปและบริษัท ไม่ใช่ข้อมูลบัญชี
- `Contact support` จาก About ต้อง route ไป Help screen เดิม ไม่ต้องสร้างหน้าใหม่

Help screen copy:

- Title: `ศูนย์ช่วยเหลือ` / `Help`
- Section: `ช่องทางการติดต่อ` / `Support channels`
- Availability: `ให้บริการทุกวัน · 09:00 - 22:00 น. (GMT+7)` / `Available daily · 09:00 - 22:00 (GMT+7)`
- Contact rows:
  - `LINE Official` — `@mrfoxthailand` → เปิด external link
  - `โทรศัพท์ติดต่อ` / `Call support` — `(+66) 80-008-8088` → เปิด dialer
  - `อีเมลติดต่อ` / `Email support` — `service@mrfox.com` → เปิด mail composer
- Help topics: `หัวข้อช่วยเหลือ` / `Help topics`
  - `ความเป็นส่วนตัวและความปลอดภัย` / `Privacy & Safety` → Privacy Policy page
  - `ข้อกำหนดและแนวทางปฏิบัติ` / `Terms & Guidelines` → Terms of Use page

About app screen copy:

- Title: `เกี่ยวกับตึกแดง` / `About`
- Brand: `TUK DAENG`
- Tagline: `ศูนย์รวมและดูแลนาฬิกาหรูสำหรับนักสะสม` / `The digital curator for watch collectors`
- Version: `เวอร์ชัน 0.0.1` / `Version 0.0.1`
- Company: `Mister Fox Co., Ltd. · Est. 2026` (TH `บริษัท มิสเตอร์ฟอกซ์ จำกัด · ก่อตั้ง พ.ศ. 2569`)
- Section `ข้อมูลทางกฎหมายและการสนับสนุน` / `Legal & Support` links:
  - `Privacy Policy` → Privacy Policy page
  - `Terms of Use` → Terms of Use page
  - `ติดต่อฝ่ายบริการลูกค้า` / `Contact support` → Help page

About app must not include:

- Delete Account
- Change Password
- Edit Profile
- Date joined
- User profile/contact fields

## Legal Rule

- Privacy Policy และ Terms of Use เปิดเป็น in-app legal pages (scrollable sections) จาก Settings > More info and support — ไม่ใช่ external link
- Label ต้องใช้ `Privacy Policy` และ `Terms of Use` ตาม master (TH `นโยบายความเป็นส่วนตัว` / `ข้อกำหนดการใช้งาน`)
- Prototype content (placeholder-grade — production ต้องเป็น legal text จริงพร้อม version + effective date ตาม canonical legal viewer 00_GLOBAL §8):
  - Privacy Policy = 4 sections: `1. Information We Collect` / `2. How We Use Information` / `3. Data Protection & Retention` / `4. Your Rights`
  - Terms of Use = 3 sections: `1. Agreement to Terms` / `2. Listing Authenticity` / `3. Termination & Deactivation`
- เนื้อหา legal เป็น EN source ใน markup + TH ผ่าน display-layer i18n — ไม่ใช่ 2 documents แยก
- Entry points รวม: Settings list, Help topics, About app Legal & Support, onboarding/auth consent surfaces และ re-consent rows (canonical list 00_GLOBAL §8)
- การเปลี่ยน policy version ต้อง trigger re-consent — canonical rule อยู่ที่ 00_GLOBAL §8 ไม่เขียนซ้ำในเล่มนี้

## Privacy & Cookie Preferences Rule (contract — prototype ไม่มีหน้านี้)

- Settings > More info and support > `Privacy & cookies` เปิดหน้าตั้งค่า consent — canonical consent model อยู่ที่ 00_GLOBAL §8 เล่มนี้กำหนดเฉพาะ settings UI (references `Settings > Privacy` ใน 00_GLOBAL §8 และ 01_AUTH หมายถึง surface เดียวกันนี้)
- `Essential` cookies/SDK = `Always on` ไม่มี toggle พร้อมคำอธิบายว่าจำเป็นต่อการทำงานและความปลอดภัยของแอป
- Optional toggles: `Analytics` และ `Personalized` — default ตาม consent record (off ถ้ายังไม่เคย opt-in)
- การเปลี่ยน toggle ต้องบันทึกลง consent record ทันที (fields ตาม 00_GLOBAL §8 — policy version, optional flags, timestamp)
- ATT interplay: ถ้า user เคยเลือก `Ask App Not to Track` ต้องบังคับ `Personalized` = off และ toggle disabled พร้อมคำอธิบาย (ตาม 00_GLOBAL §8)
- หน้านี้ไม่เกี่ยวกับ re-consent trigger — re-consent เกิดจาก policy version bump เท่านั้น (00_GLOBAL §8)

## Log Out Rule

- Entry = `ออกจากระบบ` / `Log out` danger row ใน section `การเข้าสู่ระบบ` / `Login` บน Settings Home
- Confirmation dialog copy:
  - Title: `ออกจากระบบ @{user} หรือไม่?` / `Log out of @{user}?`
  - Body: `คุณจะต้องเข้าสู่ระบบอีกครั้งเพื่อเข้าถึงบัญชีของคุณ` / `You will need to sign in again to access your account.`
  - Actions: `ออกจากระบบ` / `Log out` (danger), `ยกเลิก` / `Cancel`
- Confirm → ปิด settings stack ทั้งกอง → session `guest` บน feed (scroll to top) + toast `ออกจากระบบแล้ว` / `Logged out successfully` → Member Sheet `Join TukDaeng` แสดงทันที (scrim tap / `Skip for now` = browse ต่อเป็น guest)
- ไม่มี path กลับ Sign In screen — signed-out = guest browsing (canonical session model 00_GLOBAL §7; flow 01_AUTH §8 Sign Out)
- Credential ที่สมัคร persist รอด log out — Delete Account เท่านั้นที่ล้าง (00_GLOBAL §12 / 01_AUTH §9 Account Persistence Rules)

## Delete Account Rule

- Delete Account อยู่ใน V1 master baseline; entry = `About your account` > `การจัดการบัญชี` / `Account management` > `ลบบัญชีผู้ใช้` / `Delete account` danger row เท่านั้น — ไม่มีบน Settings Home โดยตรง
- Flow = 2-page flow + password confirmation dialog + scheduled dialog (S-27 — adopt prototype structure)

### Step 1 — Terms page (`del_account` step 1)

- Head `ลบบัญชีผู้ใช้` / `Delete account`
- Hero: trash icon + `เสียดายที่เราต้องบอกลากัน` / `We're sorry to see you go` + desc `ก่อนดำเนินการขอลบบัญชี โปรดตรวจสอบเงื่อนไขและสิ่งที่จะเกิดขึ้นกับบัญชีของคุณ` / `Before you proceed with deleting your account, please review the important terms and conditions below.`
- 3 term cards:
  1. `ระยะเวลาผ่อนผัน 30 วัน (30-Day Grace Period)` / `30-Day Grace Period` — `บัญชีของคุณจะถูกปิดการใช้งาน (Deactivated) ทันที โดยโปรไฟล์ โพสต์นาฬิกา และกิจกรรมทั้งหมดจะถูกซ่อนจากสาธารณะ หากเปลี่ยนใจ คุณสามารถเข้าสู่ระบบเพื่อกู้คืนบัญชีได้ตลอดเวลาภายใน 30 วัน` / `Your account will be deactivated immediately, and your profile and listings will be hidden. If you change your mind, you can log back in anytime within 30 days to cancel deletion.`
  2. `ลบข้อมูลถาวรหลังจาก 30 วัน` / `Permanent Deletion after 30 days` — `เมื่อครบกำหนด 30 วัน ข้อมูลส่วนบุคคล ประวัติการแชท รายการโปรด และโพสต์ทั้งหมดจะถูกลบถาวรอย่างปลอดภัย ไม่สามารถกู้คืนได้ตามนโยบายคุ้มครองข้อมูลส่วนบุคคล` / `After 30 days, your personal data, chat history, watch alerts, and posts will be permanently erased and cannot be recovered.`
  3. `การแจ้งเตือนนาฬิกาจะถูกยกเลิก` / `Watch Alerts Cancelled` — `การแจ้งเตือนนาฬิกา (Watch Alerts) ที่คุณตั้งค่าติดตามไว้ทั้งหมดจะถูกยกเลิกโดยอัตโนมัติเมื่อเริ่มกระบวนการลบบัญชี` / `All of your active watch alerts will be cancelled automatically upon deactivation.`
- Actions: `ดำเนินการต่อ` / `Continue to delete` (primary) + `เก็บบัญชีของฉันไว้` / `Keep my account` (secondary → sub-back กลับ About your account)

### Step 2 — Reason page (`del_account` step 2)

- Head `เหตุผลในการลบบัญชี` / `Why are you leaving?` + title `ทำไมคุณถึงต้องการลบบัญชี?` / `Why do you want to delete your account?` + sub `โปรดเลือกเหตุผลเพื่อให้เรานำไปพัฒนาและปรับปรุงตึกแดงให้ดียิ่งขึ้น` / `Please select a reason so we can improve TukDaeng for everyone.`
- Reasons — radio เลือกได้ 1 ข้อ (required):

| id | TH | EN |
| --- | --- | --- |
| `not_using` | `ฉันไม่ได้ใช้งานตึกแดงแล้ว` | `I'm no longer using TukDaeng` |
| `privacy` | `มีความกังวลเรื่องความเป็นส่วนตัวและความปลอดภัย` | `Privacy or security concerns` |
| `notifications` | `ได้รับการแจ้งเตือนบ่อยเกินไป` | `Too many notifications` |
| `second_account` | `สร้างหรือมีบัญชีอื่นใช้งานแล้ว` | `Created a second account` |
| `trouble` | `พบปัญหาการเริ่มต้นใช้งานหรือปัญหาเทคนิค` | `Trouble getting started or technical issues` |
| `other` | `เหตุผลอื่น ๆ` | `Something else` |

- `ความคิดเห็นหรือข้อเสนอแนะเพิ่มเติม (ไม่บังคับ)` / `Additional feedback (optional)` textarea — placeholder `บอกรายละเอียดเพิ่มเติมเพื่อให้เราพัฒนาบริการให้ดียิ่งขึ้น...` / `Tell us more about your experience...`
- กด `ดำเนินการขอลบบัญชี` / `Continue` โดยไม่เลือก reason → inline err `กรุณาเลือกเหตุผลในการขอลบบัญชี` / `Please select a reason to continue.` (scroll ไปที่ error); เลือก reason แล้ว error หายทันที
- `ย้อนกลับ` / `Back` → กลับ step 1; in-app back บน step 2 ก็กลับ step 1 (canonical 00_NAV §6.7) — reason/feedback ที่เลือกไว้ค้างเมื่อกลับมา
- เลือก reason แล้ว `Continue` → เปิด password confirmation dialog

### Password confirmation dialog

- Title `ยืนยันการขอลบบัญชี` / `Confirm account deletion`
- Desc `เพื่อความปลอดภัย กรุณากรอกรหัสผ่านของคุณเพื่อยืนยันการเริ่มระยะเวลา 30-Day Grace Period` / `To protect your account, please enter your password to confirm starting the 30-day grace period.`
- Field `รหัสผ่านปัจจุบัน` / `Current password` + eye toggle; autofocus เมื่อเปิด
- Inline errors ใน dialog (field red state + focus):
  - ว่าง: `กรุณากรอกรหัสผ่านของคุณ` / `Please enter your password.`
  - ผิด: `รหัสผ่านไม่ถูกต้อง กรุณาตรวจสอบแล้วลองใหม่อีกครั้ง` / `Incorrect password. Please try again.`
- Actions: `ยืนยันลบบัญชี` / `Delete account` (danger) + `ยกเลิก` / `Cancel`

### Scheduled dialog + signed-out destination

- Title `ตั้งเวลากำหนดลบบัญชีแล้ว` / `Account deletion scheduled` + trash icon
- Body: `บัญชี @{user} ถูกปิดการใช้งานเรียบร้อยแล้ว และมีกำหนดลบถาวรในวันที่ {date} (30 วัน)` / `Your account @{user} has been deactivated and is scheduled for permanent deletion on {date} (30 days).` + `หากคุณเปลี่ยนใจ สามารถเข้าสู่ระบบก่อนวันที่ดังกล่าวเพื่อยกเลิกคำขอและกู้คืนบัญชีได้ตลอดเวลา` / `If you change your mind, simply log back in before this date to cancel deletion and restore your account.` — `{date}` = วันที่ request + 30 วัน (format ตาม locale)
- Action เดียว: `ออกจากระบบ` / `Log out`
- Confirm → ปิด settings stack ทั้งกอง + reset delete state → session `guest` บน feed (scroll to top) + toast `บัญชีถูกระงับการใช้งานและเริ่มนับถอยหลัง 30 วัน` / `Account deactivated. 30-day grace period started.` → Member Sheet `Join TukDaeng` แสดงทันที (scrim/`Skip for now` = browse ต่อเป็น guest; `Sign in` = path กู้บัญชี)
- Delete Account สำเร็จต้อง deactivate account + revoke session + ลบ credential ที่ persist (เฉพาะบัญชีที่สมัครในเครื่อง — canonical 01_AUTH §9; log out ธรรมดาไม่ลบ credential) + เคลียร์ข้อมูลส่วนตัวตาม Session Data Rules (00_GLOBAL §7)
- หลังออกเป็น guest แล้ว user ต้องกด back กลับเข้า About Account / Profile / Settings ไม่ได้

### Grace period semantics (S-02 — login-to-restore)

- Soft delete → deactivate ทันที → grace period 30 วัน → hard delete/anonymization ตาม policy (canonical lifecycle 00_GLOBAL §12)
- ระหว่าง grace period user sign in ด้วยบัญชีเดิมได้ปกติ — sign in สำเร็จ = cancel deletion + restore บัญชี (สอดคล้อง BO Account Deletion restore flow)
- ไม่มี `Account scheduled for deletion` blocked state ที่ sign in — support state ใช้เฉพาะกรณี restore ล้มเหลวหรือหลัง hard delete (contract — §12)

### Retention (contract — resolve C11)

- Term card 2 + scheduled dialog อธิบาย user-facing erasure (personal data, chat history, watch alerts, posts) — copy ตาม prototype
- Backend retention: records ที่ต้อง retain ตาม legal/safety/audit policy (เช่น reports, transaction/audit logs) ไม่ถูกลบพร้อม user data — retention เป็น server-side policy ไม่แสดงใน delete copy (ทิศทาง unify ฝั่ง retained ตาม legal; `offers` ถูกตัดออกตาม removal scope)

### Failure path (contract — prototype ไม่มี failure path)

- ถ้า Delete Account API fail ต้องไม่ sign out, ไม่ revoke session, ไม่ clear credential และต้องแสดง error/retry จาก context เดิม (§12 `Unable to delete account.`)

Prototype dead-code note (fo-flow, documented not implemented): prototype มี legacy delete-account dialog variant ซ้อนอยู่ (`delAccountDlgHTML` / `data-dlg="del-account"` / `.dlg-delaccount-go`) ที่ไม่ถูกเรียกใช้ — canonical flow คือ 2-page flow ที่ spec นี้กำหนด; legacy dialog ถือเป็น dead code ไม่ใช่ spec requirement

Prototype mock-bug note (documented, not implemented): password dialog เช็ก `state.mockPassword` (ไม่เคยถูก set — ค้าง `fox1234` ตลอด) ขณะที่ Change Password เขียน `state.userPwd` — คนละ field → เปลี่ยนรหัสแล้ว delete ยังรับรหัส `fox1234` เดิม; spec ไม่รองรับพฤติกรรมนี้ — implementation ต้องเช็ก credential เดียวกันกับ Change Password

## Change Password Rule

- Change Password entry อยู่ที่ `About your account > Security` → เปิด in-app page `change_pwd` (S-28 — ไม่ใช่ auth-linked route)
- ต้องแสดงเฉพาะบัญชี Email / Password — SSO-only account ต้องไม่เห็น Change Password หรือเห็น disabled state พร้อมอธิบายว่าใช้บัญชีจาก provider (contract — prototype ไม่มี account-type concept แสดงเสมอ)
- Page anatomy: head `เปลี่ยนรหัสผ่าน` / `Change password` + password-policy desc + 3 fields พร้อม eye toggle ทุก field + link `ลืมรหัสผ่านใช่ไหม?` / `Forgot your password?` ใต้ Current field + inline error box + submit `เปลี่ยนรหัสผ่าน` / `Change password`
- Fields: `รหัสผ่านปัจจุบัน` / `Current password`, `รหัสผ่านใหม่` / `New password`, `ยืนยันรหัสผ่านใหม่` / `Re-type new password` (label ตาม prototype)
- Password policy = canonical 00_GLOBAL §12 (≥8 ตัวอักษร + ตัวเลขหรือสัญลักษณ์อย่างน้อย 1 ตัว — S-21) — helper copy และ check ใช้ rule เดียวกัน; prototype deviation (documented): helper desc อ้าง `combination of numbers, letters and special characters (!$@%)` แต่ code ตรวจเฉพาะความยาว ไม่ enforce num/sym (เดิม `< 6` — อยู่ระหว่างปรับเป็น `< 8` ใน prototype task แยก)
- Validation ไล่ลำดับ (แสดง inline error เดียวใต้ form + field red state + focus field นั้น):
  1. current ว่าง → `กรุณากรอกรหัสผ่านปัจจุบัน` / `Please enter your current password.`
  2. current ผิด → `รหัสผ่านปัจจุบันไม่ถูกต้อง กรุณาตรวจสอบแล้วลองใหม่อีกครั้ง` / `Your current password was entered incorrectly. Please check it and try again.`
  3. new ว่าง → `กรุณากรอกรหัสผ่านใหม่` / `Please enter a new password.`
  4. new ไม่ผ่าน policy → policy error (canonical ≥8+num/sym; prototype length-only `รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร` / `Password must be at least 8 characters long.` — เดิม 6 ตัว)
  5. new ซ้ำ current → `รหัสผ่านใหม่ต้องไม่ซ้ำกับรหัสผ่านปัจจุบัน` / `New password must be different from your current password.`
  6. re-type ไม่ตรง → `รหัสผ่านใหม่ไม่ตรงกัน กรุณากรอกใหม่อีกครั้ง` / `Passwords do not match. Please re-enter your new password.`
- `Forgot your password?` → dialog `รีเซ็ตรหัสผ่าน?` / `Reset password?` — desc แสดง masked email ของบัญชีปัจจุบัน (prototype `k***@tukdaeng.com` หรือ email จริงของ account ที่สมัครในเครื่อง) + actions `ส่งลิงก์รีเซ็ต` / `Send reset link` + `ยกเลิก` / `Cancel` → toast `ส่งลิงก์รีเซ็ตรหัสผ่านไปยัง {masked email} แล้ว` / `Password reset link sent to {masked email}` (reset flow semantics canonical อยู่ที่ 01_AUTH Forgot Password)
- สำเร็จ → อัปเดต credential ของบัญชี + sub-back กลับ About your account + toast `เปลี่ยนรหัสผ่านเรียบร้อยแล้ว` / `Password changed successfully` — ไม่จำเป็นต้อง sign out
- Mock bug (documented, not implemented): page นี้เขียน `state.userPwd` แต่ Delete Account dialog เช็ก `state.mockPassword` — คนละ field (ดู §9 Delete Account Rule)

## Content Preferences Rule

- หน้า `การตั้งค่าเนื้อหา` / `Content preferences` (`prefs`) ประกอบด้วย: rows `เนื้อหาที่ละเอียดอ่อน` / `Sensitive content` → `sensitive`, `สนใจ` / `Interested` → `interested`, `ไม่สนใจ` / `Not interested` → `ni`; toggle `หยุดพักโพสต์แนะนำในฟีดชั่วคราว` / `Snooze suggested posts in feed` (desc `ซ่อนโพสต์จากบัญชีที่คุณไม่ได้ติดตามเป็นเวลา 30 วัน` / `Hide posts from accounts you don't follow for 30 days.`); และ row `รีเซ็ตเนื้อหาที่แนะนำ` / `Reset suggested content`
- Snooze toggle auto-save ทันทีไม่มี confirm — เปิดแล้ว feed `All` tab แสดงเฉพาะโพสต์จากบัญชีที่ follow (feed semantics canonical 02_FEED)
- `Reset suggested content` → confirm dialog `Reset suggested content?` + `Posts you marked as not interested will be shown again.` + `Reset` (danger) + `Cancel` → เคลียร์ not-interested marks ทั้งหมด + ปิด snooze + re-render feed + toast `Suggested content reset` (prototype EN-only — i18n sweep)
- `sensitive` page: head `เนื้อหาที่ละเอียดอ่อน` / `Sensitive content` + desc `เลือกระดับของเนื้อหาที่ละเอียดอ่อนที่คุณจะเห็นในฟีด` / `Choose how much sensitive content you see in feed.` + options `น้อยลง` / `Less` (`คุณจะเห็นเนื้อหาที่ละเอียดอ่อนน้อยลง` / `You'll see less sensitive content.`) และ `มาตรฐาน` / `Standard` (`คุณจะเห็นเนื้อหาที่ละเอียดอ่อนบางส่วน` / `You'll see some sensitive content.`) + check บนตัวเลือกปัจจุบัน — apply ทันที auto-save ไม่มี toast (default `standard`)
- `interested` page: head `รายการที่สนใจ` / `Interested` — list โพสต์ที่ user like (row = post thumb + seller + caption + `ลบออก` / `Remove`); Remove = unlike → ออกจาก list + like count -1 (like semantics canonical 02_FEED/11_SOCIAL); empty `ยังไม่มีข้อมูลที่นี่` / `Nothing here yet`
- `ni` page: head `ไม่สนใจ` / `Not interested` — list โพสต์ที่ mark Not interested (row เดียวกัน + `คืนค่า` / `Restore`); Restore = คืนโพสต์เข้า feed (not-interested feedback loop canonical 02_FEED); empty เดียวกัน
- ทุกหน้า apply ค่าได้ทันที ไม่มี save button

## What You See Pages Rule (Favorites / Muted / Blocked)

Account-list pages ของ section `What you see` — spec ระดับ settings surface อยู่ที่นี่; feed/social semantics เชิงลึก (favorites boost, mute, block impact) canonical อยู่ที่ 02_FEED / 06_PROFILE / 11_SOCIAL / 00_GLOBAL §13

- `favorites` — `รายการโปรด` / `Favorites`: desc `โพสต์ใหม่จากรายการโปรดของคุณจะแสดงสูงขึ้นในฟีด มีเพียงคุณเท่านั้นที่เห็นว่าคุณเพิ่มหรือลบใคร` / `New posts from your favorites will appear higher in feed. Only you can see who you add or remove.` + search field `ค้นหา` / `Search` (live filter rows ตามชื่อ) + section `รายการโปรด` / `Favorites` พร้อม `ลบทั้งหมด` / `Remove all` เมื่อมีรายการ (row = avatar + name + desc `รายการโปรด` / `Favorite` + `ลบออก` / `Remove`) + section `แนะนำ` / `Suggested` = บัญชีที่ follow แต่ยังไม่ใช่ favorite (`เพิ่มบัญชี` / `Add account`) — toasts `Added to favorites` / `Removed from favorites` / `Removed all favorites` (prototype EN-only); empty `ยังไม่มีรายการโปรด` / `No favorites yet`
- `muted` — `บัญชีที่ปิดเสียง` / `Muted accounts`: rows (avatar + name + `ปิดเสียงโพสต์แล้ว` / `Posts muted` + `เปิดเสียง` / `Unmute`) → unmute ทันที + toast `Posts unmuted` (EN-only); empty `ไม่มีบัญชีที่ปิดเสียง` / `No muted accounts`
- `blocked` — `บัญชีที่บล็อก` / `Blocked profiles`: rows (avatar + name + `รวมถึงโปรไฟล์อื่นที่พวกเขาอาจมีหรือสร้างขึ้น` / `Includes other profiles they may have or create` + `ปลดบล็อก` / `Unblock`) → confirm dialog `เลิกบล็อก {user} หรือไม่?` / `Unblock {user}?` + desc `{user} and other profiles they may have or create will now be able to request to follow and message you on TukDaeng. They won't be notified that you unblocked them.` + `เลิกบล็อก` / `Unblock` (danger) + `ยกเลิก` / `Cancel`; unblock ไม่ re-follow (canonical 00_GLOBAL §13 / 06_PROFILE); empty `ไม่มีบัญชีที่ถูกบล็อก` / `No blocked accounts`
- แตะ row (ไม่ใช่ action button) → เปิด public profile ของบัญชีนั้น

## Notification Settings Rule

- หน้า `การตั้งค่าการแจ้งเตือน` / `Notification settings` + desc `Choose what notifications you receive on this device.`
- Notification Settings อยู่ใน V1 เฉพาะระดับ baseline notification type — in-scope ทั้ง spec 13 และ spec 09 (resolve C8 contradiction: spec 09 §6 เดิมบอก out of scope — sync ฝั่ง 09 อยู่ใน FSP-021)
- Toggle groups ตาม prototype:
  - `กิจกรรม` / `Activity`: `Likes` (`When someone likes your posts or comments`), `Comments` (`When someone comments on your posts`), `New followers` (`When someone follows your profile`)
  - `การซื้อขายและการแจ้งเตือน` / `Trading & Alerts`: `Watch Alerts` (`When new listings match your criteria`)
- Toggle default state สำหรับ Member ใหม่เป็น ON ทุกประเภท
- Toggle ต้อง auto-save เมื่อเปิด/ปิด โดยไม่ต้องมี Save button
- ไม่รวม Chat / New Message เพราะ Chat ใช้ unread badge/count ในเมนู Chat (chat notification prefs อยู่ที่ Chat config — 07_CHAT)
- ไม่รวม Moderation, Account Action, Market Update, Price / Valuation หรือ Sale Success ใน Front Office V1
- ถ้าปิด type ใด ต้องไม่สร้าง Front Office Alerts feed item สำหรับ type นั้น แต่ backend/admin audit ยังทำงานตามระบบที่เกี่ยวข้องได้

---

# 10. Permission Rules

| Actor | Permission |
| --- | --- |
| Guest | เข้า account Settings ไม่ได้ — settings entry (`pf-menu`) อยู่ใน login-required gate → Member Sheet `Join TukDaeng` |
| Member | เข้า Settings และจัดการค่า account ของตัวเองได้ |
| Other User | ไม่มีสิทธิ์ดูหรือแก้ Settings ของคนอื่น |
| Admin | จัดการผ่าน Back Office ไม่ใช่ Front Office Settings |

---

# 11. Validation Rules

| Field / Condition | Rule |
| --- | --- |
| Username | ใช้ validation จาก Profile/Auth implementation (contract-only — ไม่มี row ใน Settings) |
| Phone | Optional หรือ required ตาม profile decision (contract-only) |
| Line | Optional หรือ required ตาม profile decision (contract-only) |
| Email | Read-only หลัง verify (contract-only) |
| Language | ต้องเป็น English หรือ ภาษาไทย — persist ต่อ device (default `en`) |
| Theme Mode | ต้องเป็น Dark หรือ Light — persist ต่อ device (default `dark`) |
| Notification Settings | ต้องเป็น toggle ของ baseline notification type เท่านั้น (Likes / Comments / New followers / Watch Alerts) |
| Cookie Preferences | Essential แก้ไม่ได้ (always on) — optional toggles ต้องผูก consent record |
| Log Out | ต้อง confirm |
| Change Password | Current ต้องถูกต้อง + New ต้องผ่าน Password Policy canonical (00_GLOBAL §12 — ≥8 + num/sym; prototype deviate — เช็กเฉพาะความยาว) + New ≠ Current + Re-type ต้องตรง — ไม่ผ่านแสดง inline err ตามลำดับ §9 |
| Delete Account | ต้องเลือก reason ก่อน Continue (required) + ต้องยืนยันด้วย current password ที่ถูกต้อง — ว่าง/ผิดแสดง inline err ใน dialog |
| Sensitive content | ต้องเป็น `Less` หรือ `Standard` (default `standard`) — apply ทันที |
| Reset suggested content | ต้อง confirm ผ่าน dialog `Reset suggested content?` |
| Unblock | ต้อง confirm ผ่าน dialog `Unblock {user}?` |

---

# 12. Exception Handling

## Save Failed

- TH: `ไม่สามารถบันทึกได้`
- EN: `Unable to save.`

## Session Expired

- TH: `กรุณาเข้าสู่ระบบอีกครั้ง`
- EN: `Please sign in again.`

## Delete Account Failed (contract — prototype ไม่มี failure path)

- TH: `ไม่สามารถลบบัญชีได้`
- EN: `Unable to delete account.`

## Grace-Period Sign In (login-to-restore — S-02)

- ระหว่าง grace period 30 วัน user sign in ด้วยบัญชีเดิมได้ปกติ — sign in สำเร็จ = cancel deletion + restore บัญชี (canonical 00_GLOBAL §12; prototype ไม่มี deleted-state check ที่ sign in)
- Support state ใช้เฉพาะกรณี restore ล้มเหลวหรือบัญชีผ่าน hard delete แล้ว (contract — prototype ไม่มี state นี้):
- TH: `บัญชีนี้อยู่ระหว่างดำเนินการลบ กรุณาติดต่อ Support หากเป็นความผิดพลาด`
- EN: `This account is scheduled for deletion. Please contact support if this was a mistake.`

## Permission Denied

- TH: `คุณไม่มีสิทธิ์ดำเนินการ`
- EN: `Permission denied.`

---

# 13. Empty State

Settings Module ไม่มี empty state เฉพาะสำหรับ V1

ถ้ามีหน้า linked content เช่น Help หรือ Legal โหลดข้อมูลไม่ได้ ให้ใช้ error state พร้อม retry ตาม implementation

---

# 14. Notification Rules

Settings Module ไม่สร้าง notification ใน master baseline

Security alert, password changed notification หรือ delete account notification เป็น future / Needs Decision เว้นแต่ master เพิ่ม scope

---

# 15. Analytics Events

(contract — ไม่มี tracking layer ใน prototype)

- `settings_opened`
- `settings_library_opened` (Saved / Wish List / Archive / Watch Alerts)
- `settings_favorites_opened` / `settings_muted_opened` / `settings_blocked_opened` / `content_prefs_opened`
- `about_account_opened`
- `settings_language_opened`
- `settings_language_changed`
- `settings_theme_opened`
- `settings_theme_changed`
- `notif_settings_opened`
- `notif_setting_toggled`
- `cookie_prefs_opened` / `cookie_pref_toggled`
- `help_opened`
- `about_opened`
- `privacy_policy_opened`
- `terms_of_use_opened`
- `log_out_started`
- `log_out_confirmed`
- `change_pwd_opened`
- `change_pwd_submitted` / `change_pwd_succeeded` / `change_pwd_failed`
- `forgot_pwd_opened` / `reset_link_sent`
- `sensitive_content_changed`
- `snooze_suggested_toggled`
- `suggested_content_reset`
- `interested_item_removed` / `ni_item_restored`
- `favorite_added` / `favorite_removed` / `favorites_all_removed`
- `account_unmuted` / `account_unblocked`
- `delete_account_started`
- `delete_account_reason_selected` (ส่ง reason id + has-feedback เป็น property)
- `delete_account_confirmed`
- `delete_account_scheduled`

---

# 16. Acceptance Criteria

## AC-SETTING-001: Member Opens Settings

Given user เป็น Member  
When user เปิด Settings  
Then ระบบต้องแสดง Settings Home

## AC-SETTING-002: Settings Home Matches Prototype Structure

Given Member เปิด Settings Home  
When รายการเมนูแสดง  
Then หัวข้อต้องเป็น `Settings and activity`  
And ต้องมี sections เรียงตามลำดับ: `Account` (About your account) → `Your library` (Saved / Wish List / Archive / Watch Alerts พร้อม count badges) → `What you see` (Favorites / Muted accounts / Blocked พร้อม count badges + Content preferences) → `Your app and media` (Language + Theme mode พร้อม value pills) → `Notifications` (Notification settings) → `More info and support` (Help / Privacy & cookies / Privacy Policy / Terms of Use / About) → `Login` (Log out)  
And ต้องไม่มี Edit profile row บน Settings Home (entry = own profile page — S-05)  
And ต้องไม่แสดง Change Password หรือ Delete Account เป็น direct action บน Settings Home

## AC-SETTING-003: Email Display Is Read-Only

Given Member มี email ที่ verify แล้ว  
When Member เปิด account information  
Then ระบบต้องแสดง Email Display  
And ต้องไม่อนุญาตให้แก้ email

(contract-only — prototype ไม่มี email/contact rows ใน Settings)

## AC-SETTING-004: Language Selection

Given Member เปิด Language setting  
Then ต้องเห็น desc `Choose your preferred language for the TukDaeng app.` + 2 options `English` (`App interface in English`) และ `ภาษาไทย` (`หน้าจอแอปเป็นภาษาไทย`) พร้อม flag icon และ check บนตัวเลือกปัจจุบัน  
When Member เลือกภาษาอื่น  
Then ระบบต้อง apply ภาษาทันทีทั้ง UI (display-layer swap — user-generated text ไม่ถูกแปล)  
And check ต้องย้ายไปตัวเลือกใหม่  
And ต้องแสดง toast `เปลี่ยนภาษาเรียบร้อย` / `Language updated`  
And ต้อง persist ค่าต่อ device (default `en`)  
And Language row บน Settings Home ต้องแสดง value pill ภาษาใหม่

## AC-SETTING-005: Theme Mode Selection

Given Member เปิด Theme mode setting  
Then ต้องเห็น desc `Choose how TukDaeng looks on this device.` + 2 options `Light mode` (`Bright background for daytime browsing.`) และ `Dark mode` (`Dimmed background that's easier on the eyes at night.`) พร้อม check บนตัวเลือกปัจจุบัน  
When Member เลือก theme อื่น  
Then ระบบต้อง apply theme ทันทีทั้งแอปผ่าน theme attribute  
And check ต้องย้ายไปตัวเลือกใหม่  
And ต้อง persist ค่าต่อ device (default `dark`)

## AC-SETTING-006: Legal Documents

Given Member เปิด Settings  
When Member กด Privacy Policy หรือ Terms of Use  
Then ระบบต้องเปิด in-app legal page ที่เกี่ยวข้อง  
And Privacy Policy ต้องมี 4 sections (Information We Collect / How We Use Information / Data Protection & Retention / Your Rights)  
And Terms of Use ต้องมี 3 sections (Agreement to Terms / Listing Authenticity / Termination & Deactivation)  
And legal entries เดียวกันต้องเปิดหน้าเดียวกันได้จาก Help topics และ About app Legal & Support

## AC-SETTING-007: Help And About

Given Member เปิด Settings  
When Member กด Help หรือ About  
Then ระบบต้องเปิดหน้าที่เกี่ยวข้อง
And Help ต้องแสดง `Support channels` + `Available daily · 09:00 - 22:00 (GMT+7)` + rows `LINE Official` (`@mrfoxthailand`), `Call support` (`(+66) 80-008-8088`), `Email support` (`service@mrfox.com`) + `Help topics` (`Privacy & Safety` → Privacy Policy, `Terms & Guidelines` → Terms of Use)
And About ต้องแสดง title `เกี่ยวกับตึกแดง`/`About` + `TUK DAENG` + tagline + `Version 0.0.1` + `Mister Fox Co., Ltd. · Est. 2026` + `Legal & Support` links (Privacy Policy / Terms of Use / Contact support → Help)
And About ต้องไม่แสดงข้อมูลบัญชีหรือ Delete Account

## AC-SETTING-008: Log Out

Given Member อยู่ใน Settings
When Member กด `Log out`
Then ต้องแสดง confirmation dialog title `Log out of @{user}?`
And body ต้องเป็น `You will need to sign in again to access your account.`
And actions ต้องเป็น `Log out` (danger) และ `Cancel`
When Member confirm Log out
Then ระบบต้องปิด settings stack ทั้งกอง → session `guest` บน feed + toast `Logged out successfully`
And ต้องแสดง Member Sheet `Join TukDaeng` ทันที (scrim/`Skip for now` ปิดแล้ว browse ต่อเป็น guest)
And ต้องไม่มี path กลับ Sign In screen หรือกลับเข้า Settings ด้วย back (canonical 01_AUTH §8 Sign Out)

## AC-SETTING-009: Delete Account Entry

Given Member เปิด Settings
When Member เปิด About your account
Then `การจัดการบัญชี` / `Account management` section ต้องมี `ลบบัญชีผู้ใช้` / `Delete account` danger row
And Delete Account ต้องไม่อยู่บน Settings Home โดยตรง

## AC-SETTING-010: Delete Account 2-Page Flow

Given Member กด `Delete account`
Then ระบบต้องเปิด `del_account` step 1 `Delete account` — hero `We're sorry to see you go` + 3 term cards (`30-Day Grace Period` / `Permanent Deletion after 30 days` / `Watch Alerts Cancelled`) + actions `Continue to delete` / `Keep my account`
And `Keep my account` หรือ back ต้องกลับ About your account โดยไม่มีผลใด ๆ
When Member กด `Continue to delete`
Then ระบบต้องแสดง step 2 `Why are you leaving?` — 6 radio reasons + `Additional feedback (optional)` + `Continue` + `Back`
When Member กด `Continue` โดยไม่เลือก reason
Then ต้องแสดง inline error `Please select a reason to continue.` และต้องไม่เปิด password dialog
When Member เลือก reason แล้วกด `Continue`
Then ต้องเปิด `Confirm account deletion` dialog — desc + field `Current password` + eye toggle + `Delete account` / `Cancel`
And password ว่าง → `Please enter your password.`; password ผิด → `Incorrect password. Please try again.`
And back จาก step 2 ต้องกลับ step 1 (canonical 00_NAV §6.7) โดย reason/feedback ค้างไว้

## AC-SETTING-010A: Delete Account Retention

Given Member ยืนยัน password ถูกต้องใน `Confirm account deletion`
When ระบบดำเนินการลบบัญชี
Then ระบบต้อง deactivate account (soft delete), revoke session, ลบ credential ที่ persist (เฉพาะบัญชีที่สมัครในเครื่อง — 01_AUTH §9) และใช้ grace period 30 วันก่อน hard delete/anonymization ตาม policy
And records ที่ต้อง retain ตาม legal/safety/audit (เช่น reports, transaction/audit logs) ต้องไม่ถูกลบพร้อม user data (contract — backend policy)

## AC-SETTING-010B: Grace-Period Sign In Restores Account (S-02)

Given account อยู่ใน grace period 30 วันหลัง Delete Account
When user sign in ด้วยบัญชีเดิมสำเร็จ
Then ระบบต้อง cancel deletion และ restore บัญชีเป็นใช้งานปกติ (login-to-restore — canonical 00_GLOBAL §12)
And ต้องไม่แสดง deleted-account blocked state ที่ sign in
And support state `This account is scheduled for deletion. Please contact support if this was a mistake.` ใช้เฉพาะกรณี restore ล้มเหลวหรือหลัง hard delete (contract)

## AC-SETTING-010C: Delete Account Success Destination

Given Member ยืนยัน password ถูกต้อง
When delete สำเร็จ
Then ระบบต้องแสดง dialog `ตั้งเวลากำหนดลบบัญชีแล้ว` / `Account deletion scheduled` พร้อมวันที่ลบถาวร (request +30 วัน) และ action เดียว `ออกจากระบบ` / `Log out`
When Member กด `Log out`
Then ระบบต้องปิด settings stack ทั้งกอง → session `guest` บน feed + toast `บัญชีถูกระงับการใช้งานและเริ่มนับถอยหลัง 30 วัน` / `Account deactivated. 30-day grace period started.` + Member Sheet `Join TukDaeng`
And user ต้องกด back กลับเข้า About Account, Profile หรือ Settings ไม่ได้

## AC-SETTING-010D: Delete Account Failure (contract — prototype ไม่มี failure path)

Given Member ยืนยัน password ใน `Confirm account deletion`
When API delete account ล้มเหลว
Then ระบบต้องไม่ revoke session และไม่ clear credential
And ต้องไม่พาออกจาก account context
And ต้องแสดง error/retry state (`Unable to delete account.`)

## AC-SETTING-011: Guest Cannot Access Settings

Given user เป็น Guest  
When user พยายามเปิด account Settings (ผ่าน own-profile menu entry ที่ gated)  
Then ระบบต้องแสดง Member Sheet `Join TukDaeng` ทับ surface เดิม (canonical 00_GLOBAL §11)  
And ต้องไม่แสดง Settings Home ของ Member

## AC-SETTING-012: Notification Settings Baseline

Given Member เปิด Settings  
When Member เปิด Notification settings  
Then ต้องเห็น desc `Choose what notifications you receive on this device.` + toggles ใน 2 groups: `Activity` (`Likes`, `Comments`, `New followers`) + `Trading & Alerts` (`Watch Alerts`) พร้อม desc ต่อ toggle  
And ต้องไม่เห็น Chat/New Message, Market Update, Price / Valuation, Sale Success, Moderation หรือ Account Action เป็น Front Office V1 notification setting
And default state ของ Member ใหม่ต้องเป็น ON ทุก type
And การเปิด/ปิด toggle ต้อง auto-save โดยไม่มี Save button

## AC-SETTING-013: Change Password

Given Member ใช้บัญชี Email / Password  
When Member เปิด `About your account`  
Then ต้องเห็น `Change password` row ใน `Security` section → เปิด in-app page `change_pwd` (S-28)  
And หน้าต้องมี password-policy desc + fields `Current password` / `New password` / `Re-type new password` พร้อม eye toggle ทุก field + link `Forgot your password?` + submit `Change password`  
When Member submit  
Then validation ต้องไล่ลำดับ current ว่าง → current ผิด → new ว่าง → new ไม่ผ่าน Password Policy canonical (00_GLOBAL §12 — ≥8 + num/sym; prototype deviate — เช็กเฉพาะความยาว) → new ซ้ำ current → re-type ไม่ตรง พร้อม inline error + field red state + focus  
When Member กด `Forgot your password?`  
Then ต้องเปิด `Reset password?` dialog พร้อม masked email + `Send reset link` → toast `Password reset link sent to {masked email}`  
When เปลี่ยนรหัสผ่านสำเร็จ  
Then ต้อง toast `Password changed successfully` + กลับ About your account โดยไม่ sign out  
Given Member ใช้ SSO-only account  
When Member เปิด `About your account`  
Then ต้องไม่แสดง Change Password เป็น active action (contract — prototype แสดงเสมอ)

## AC-SETTING-014: Settings Entry Point

Given Member อยู่ที่ own profile  
When Member กด `pf-menu` (burger `Settings and activity`)  
Then ระบบต้องเปิด Settings Home เป็น sub page ทับ profile  
And ไม่มี settings entry อื่นที่ใช้งานได้ (`.set-btn` เป็น dead handler ใน prototype ไม่ใช่ spec feature)

## AC-SETTING-015: Library And What-You-See Rows

Given Member เปิด Settings Home  
When Member กด row ใน `Your library`  
Then `Saved` / `Wish List` / `Archive` / `Watch Alerts` ต้องเปิดหน้าปลายทางที่เกี่ยวข้อง (`saved` / `wishlist` / `archive` / `walerts`) พร้อม count badge ตรงข้อมูล session  
When Member กด row ใน `What you see`  
Then `Favorites` / `Muted accounts` / `Blocked` / `Content preferences` ต้องเปิดหน้าที่เกี่ยวข้อง (`favorites` / `muted` / `blocked` / `prefs`)

## AC-SETTING-016: About Your Account Anatomy

Given Member เปิด `About your account`  
Then ต้องเห็น hero (avatar + display name + `@username`)  
And `Account information` ต้องแสดง `Date joined` + `Account based in` = Thailand  
And `Security` ต้องมี `Change password` row  
And `Account management` ต้องมี `Delete account` danger row  
And ต้องไม่มี contact rows (Username/Phone/Line/Email) — fields เหล่านั้น contract-only

## AC-SETTING-017: Cookie Preferences (contract)

Given Member เปิด `Privacy & cookies`  
Then ต้องเห็น `Essential` = `Always on` ไม่มี toggle  
And ต้องเห็น optional toggles `Analytics` + `Personalized` ตาม consent record  
When Member เปลี่ยน toggle  
Then ระบบต้องบันทึกลง consent record ทันที (00_GLOBAL §8)  
And ถ้า user เคย `Ask App Not to Track` ต้องบังคับ `Personalized` = off และ toggle disabled

## AC-SETTING-018: Content Preferences

Given Member เปิด `Content preferences` (`prefs`)  
Then ต้องเห็น rows `Sensitive content` / `Interested` / `Not interested` + toggle `Snooze suggested posts in feed` + row `Reset suggested content`  
When Member เปิด `Sensitive content`  
Then ต้องเห็น options `Less` / `Standard` (default `Standard`) พร้อม check บนตัวเลือกปัจจุบัน และการเลือกต้อง apply ทันทีโดยไม่มี toast  
When Member เปิด `Interested`  
Then ต้องเห็น list โพสต์ที่ like พร้อม `Remove` ต่อ row — กดแล้ว unlike และออกจาก list ทันที; empty state `Nothing here yet`  
When Member เปิด `Not interested`  
Then ต้องเห็น list โพสต์ที่ mark Not interested พร้อม `Restore` ต่อ row — กดแล้วคืนโพสต์เข้า feed; empty state เดียวกัน  
When Member เปิด snooze toggle  
Then feed `All` tab ต้องแสดงเฉพาะโพสต์จากบัญชีที่ follow เป็นเวลา 30 วัน  
When Member กด `Reset suggested content`  
Then ต้องแสดง dialog `Reset suggested content?` (`Posts you marked as not interested will be shown again.` + `Reset` / `Cancel`)  
And confirm ต้องเคลียร์ not-interested marks ทั้งหมด + ปิด snooze + toast `Suggested content reset`

## AC-SETTING-019: Favorites / Muted / Blocked Pages

Given Member เปิด `Favorites`  
Then ต้องเห็น desc + search field + section `Favorites` (rows + `Remove` ต่อ row + `Remove all` เมื่อมีรายการ) + section `Suggested` (บัญชีที่ follow แต่ยังไม่ใช่ favorite + `Add account`)  
And การ add/remove/remove-all ต้อง apply ทันทีพร้อม toast (`Added to favorites` / `Removed from favorites` / `Removed all favorites`); empty state `No favorites yet`  
Given Member เปิด `Muted accounts`  
Then ต้องเห็น rows พร้อม `Unmute` ต่อ row → unmute ทันที + toast `Posts unmuted`; empty state `No muted accounts`  
Given Member เปิด `Blocked`  
Then ต้องเห็น rows พร้อม `Unblock` ต่อ row → confirm dialog `Unblock {user}?` ก่อน unblock; empty state `No blocked accounts`  
And unblock ต้องไม่ re-follow อัตโนมัติ  
And การแตะ row (ไม่ใช่ action button) ต้องเปิด public profile ของบัญชีนั้น

---

# 17. Related Modules

- Authentication Module (log out semantics, consent surfaces)
- Profile Module (Edit profile entry, Favorites/Muted/Blocked destinations)
- Feed Module (Saved/Archive destinations)
- Watch Alert Module (Watch Alerts destination)
- Social Module (library/social-list destinations)
- Notification Module
- Trust & Safety Module

---

# 18. Future Enhancement

- Device Management
- Login History
- Security Activity Log
- Advanced notification preference center
- Password Changed / Security Alert notifications
- Delete account retention/grace-period configuration
