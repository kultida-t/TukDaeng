# 15 Trust & Safety Module

อ้างอิงหลักจาก [TukDaeng_Master_Product_Definition.md](TukDaeng_Master_Product_Definition.md)

---

# 1. Document Information

| Field | Detail |
| --- | --- |
| Module Name | Trust & Safety |
| Version | 1.0 |
| Status | Functional PRD - Master Aligned |
| Owner | Tuk Daeng Project |
| Document Type | Front Office Functional PRD |
| Source of Truth | TukDaeng Master Product Definition |

---

# 2. Objective

Trust & Safety Module ใช้สำหรับรองรับ Block, Report, Legal access และ Apple compliance ใน Front Office พร้อมเชื่อมต่อ moderation ที่ Admin ดำเนินการผ่าน Back Office

หลักสำคัญของ V1 คือ Report ไม่ทำให้ content หายทันที ส่วน content จะหายเมื่อ Admin ดำเนินการตาม moderation เท่านั้น

---

# 3. Prototype Reference

| Prototype | Usage |
| --- | --- |
| Detail asset viewer.png | Report Asset, Report User entry |
| Detail asset owner.png | Owner context และ unavailable/removed state |
| Chat.png | Block User / Report User entry ใน Chat |
| Board.png | Report Board Content entry |
| Notification.png | blocked/unavailable destination handling |
| Auth Sign up Update.png | Terms of Use / Privacy Policy consent |
| Menu & Profile Setting.png | Legal document access |

---

# 4. Master Alignment Summary

| Topic | Master Baseline | Trust & Safety Module Rule |
| --- | --- | --- |
| Admin Scope | Admin ใช้งานผ่าน Back Office เท่านั้น | Front Office ส่ง report; Back Office review/moderation |
| Report SLA | Admin ดำเนินการภายใน 24 ชั่วโมงสำหรับ Report ที่เข้ามา | PRD ต้องระบุ 24h review SLA |
| Block Impact | Asset ของผู้ถูก Block หายจาก Feed, Search, Watch Alert Result | ต้อง filter content ของ blocked user ทันทีใน surfaces เหล่านี้ |
| Following Impact | ความสัมพันธ์ Follow ระหว่างกันต้องไม่ถูกใช้ในการแสดง Following Feed | Following Feed ต้องไม่ใช้ relationship ที่ถูก block |
| Report Types | Asset, User, Comment, Board Content | Figma/PRD ต้องใช้ type ชุดนี้ |
| Report Impact | Report ไม่ทำให้ Asset หายจาก Feed ทันที | ห้ามออกแบบ report submit แล้ว content หายทันที |
| Moderation Impact | Asset หรือ Content จะหายเมื่อ Admin ดำเนินการตาม Moderation เท่านั้น | Content removal เป็น Admin action |
| Apple Compliance | Report, Block, Terms of Use, Privacy Policy, Moderation Flow | ต้องมีครบใน app/Figma |
| Legal Consent | ทุกช่องทางสมัครต้องยอมรับ Terms of Use และ Privacy Policy ก่อนสมัคร | Sign Up ทุกช่องทางต้องมี consent |
| Legal Access | Settings รองรับ Privacy Policy และ Terms of Use | Legal docs ต้องเข้าถึงได้จาก Settings |

---

# 5. Figma Gap Checklist For Trust & Safety Module

| Priority | Figma Gap | Master Baseline | Action |
| --- | --- | --- | --- |
| High | Block / Report entry ใน Chat ยังไม่ชัด | Chat ต้องรองรับ Block User และ Report User | เพิ่ม action menu/state ใน Chat |
| High | Block impact ต่อ Feed/Search/Watch Alert Result ยังต้องระบุ | Asset ของผู้ถูก Block ต้องหายจาก Feed, Search, Watch Alert Result ทันที | เพิ่ม annotation หรือ state filtering ให้ครบ |
| High | Block impact ต่อ Following Feed ยังไม่ชัด | ความสัมพันธ์ Follow ระหว่างกันต้องไม่ถูกใช้ในการแสดง Following Feed | เพิ่ม following-feed filtering rule |
| High | Report type ต้อง lock ให้ตรง master | Report รองรับ Asset, User, Comment, Board Content | ตรวจ Figma report forms/type labels ให้ตรง |
| High | Report submit อาจสื่อว่า content หายทันที | Report ไม่ทำให้ Asset/Content หายทันที | เพิ่ม success state ที่ไม่ remove content จนกว่า Admin moderation |
| High | Moderation flow / Admin review SLA ยังไม่ชัด | Admin ดำเนินการภายใน 24 ชั่วโมงสำหรับ Report ที่เข้ามา | เพิ่ม Back Office handoff note และ 24h SLA |
| High | Apple compliance coverage ต้องครบ | ต้องรองรับ Report, Block, Terms of Use, Privacy Policy, Moderation Flow | ตรวจครบทุก entry/state |
| Medium | Terms label อาจใช้ capitalization ไม่ตรง | Master ใช้ `Terms of Use` | normalize label เป็น `Terms of Use` |
| Medium | Legal consent ทุก sign up channel ยังต้องตรวจ | ทุกช่องทางสมัครต้องยอมรับ Terms of Use และ Privacy Policy ก่อนสมัคร | ตรวจ Email/Google/Apple sign up consent |
| Medium | Blocked/unavailable profile state ยังไม่ชัด | Blocked content/user ต้องไม่เข้าถึงตาม Trust & Safety rule | เพิ่ม blocked/unavailable state |
| High | Block แล้ว chat history / new message behavior ยังไม่ถูกระบุครบใน Figma | Product review แนะนำให้เก็บ chat history เดิมให้อ่านได้ แต่ปิดการส่งข้อความใหม่หลัง block | เพิ่ม blocked chat read-only state และ update master/Chat PRD |
| Medium | Moderation notification หลัง report/action ยังไม่อยู่ใน Notification baseline | Product review แนะนำให้ moderation/account/system notification ไม่อยู่ใน FO V1 | ย้ายเป็น future หรือ Back Office scope |

---

# 6. Scope

## In Scope

- Block User
- Report User
- Report Asset
- Report Comment
- Report Board Content
- Block User จาก Feed
- Report success state
- Blocked/unavailable user/content state
- Terms of Use access
- Privacy Policy access
- Sign Up consent for Terms of Use and Privacy Policy
- Back Office moderation handoff
- 24-hour report review SLA
- Apple compliance coverage

## Out of Scope For V1 Unless Master Adds Decision

- Appeal Ban
- Report tracking for reporter
- Trust score
- Reputation score
- Automated moderation
- AI content detection
- Moderation notifications in Front Office
- Detailed chat behavior after block beyond entry/support

---

# 7. Screen Mapping

| Screen / Component | Description |
| --- | --- |
| Block User Dialog | ยืนยันก่อน block user จาก Profile / Asset Detail / Chat |
| Block User Dialog | ยืนยันก่อน Block User จาก Feed |
| Report User Form | ส่ง report user |
| Report Asset Form | ส่ง report asset; mobile ใช้ bottom sheet pattern ได้ |
| Report Comment Form | ส่ง report comment |
| Report Board Content Form | ส่ง report board content |
| Report Success State | แสดงส่ง report สำเร็จ |
| Terms of Use | เอกสาร Terms of Use |
| Privacy Policy | เอกสาร Privacy Policy |
| Blocked / Unavailable State | state เมื่อ content/user เข้าไม่ได้ |

---

# 8. User States

## Guest

- ดู Terms of Use และ Privacy Policy ได้
- ใช้ Report หรือ Block ไม่ได้
- ถ้ากด action ที่ต้อง login ต้องแสดง Global Login Required Dialog ตาม global rule

## Member

- Block User ได้
- Report User / Asset / Comment / Board Content ได้
- Block User จาก Feed ได้ โดยใช้ Block User rule เดียวกัน
- เปิด Terms of Use และ Privacy Policy ได้

## Reported User

- ยังใช้งานได้จนกว่า Admin จะดำเนินการ
- ไม่เห็นว่าใครเป็นผู้รายงาน

## Admin

- ตรวจสอบ Report และดำเนินการ moderation ผ่าน Back Office
- ต้องดำเนินการภายใน 24 ชั่วโมงสำหรับ Report ที่เข้ามา

## Suspended / Banned User

- ต้องถูก block จาก authenticated app access ตาม Authentication rule
- ต้องเห็น account status state พร้อมเหตุผล ระยะเวลาถ้ามี และช่องทางติดต่อ Support ตาม Authentication rule
- V1 ไม่มี `Restricted` หรือ feature-level restriction จาก Trust & Safety; report threshold จะยกระดับ queue/review หรือทำให้เกิด `Suspended`/`Banned` ตาม BO policy เท่านั้น
- รายละเอียด appeal เป็น future

---

# 9. User Flow

## Block User Flow

```text
Profile / Asset Detail / Chat
-> Block User
-> Confirm
-> Block success
-> Block impact applies to Feed, Search, Watch Alert Result, Following Feed
```

Block User confirmation:

- Title: `Block this user?`
- Body: `You will no longer see this user's assets in Feed, Search, Watch Alert results, or related profile surfaces. Existing chat history will remain read-only, but you will not be able to send new messages or create new offers with this user.`
- Actions: `Cancel`, `Block`
- `Cancel` closes the confirmation without changing block state
- `Block` applies the block rule immediately after success
- Success feedback: `User blocked`

## Report Asset Flow

```text
Asset Detail / Feed
-> More menu
-> Report
-> Report Asset bottom sheet
-> Select reason
-> Submit
-> Report submitted successfully
-> Content remains visible until Admin moderation
```

## Report User Flow

```text
Profile / Chat
-> Report User
-> Select reason
-> Submit
-> Report submitted successfully
```

Report User form:

- Title: `Report this user`
- Description: `Select a reason for reporting this user. Our team will review it.`
- Reasons: `Fraud or scam`, `Impersonation`, `Harassment or hate`, `Inappropriate content`, `Spam`, `Other`
- Additional details เป็น optional
- Submit button disabled จนกว่าจะเลือก reason
- Success title: `Report submitted`
- Success copy: `Our team will review this user. This profile will remain visible until moderation is complete.`
- Success action: `Done`

## Report Comment Flow

```text
Comment
-> Report
-> Select reason
-> Submit
-> Report submitted successfully
```

Report Comment form:

- Title: `Report this comment`
- Description: `Select a reason for reporting this comment. Our team will review it.`
- Reasons: `Harassment or hate`, `Spam or scam`, `Inappropriate content`, `False or misleading information`, `Other`
- Additional details เป็น optional
- Submit button disabled จนกว่าจะเลือก reason
- Success title: `Report submitted`
- Success copy: `Our team will review this comment. It will remain visible until moderation is complete.`
- Success action: `Done`

## Report Board Content Flow

```text
Board Content
-> Report
-> Select reason
-> Submit
-> Report submitted successfully
```

## Legal Consent Flow

```text
Sign Up
-> Accept Terms of Use and Privacy Policy
-> Continue registration
```

---

# 10. Business Rules

## Block User Rule

- Member สามารถ Block User ได้
- Block entry ควรมีใน Profile, Asset Detail และ Chat ตาม context ที่เกี่ยวข้อง
- Block User ต้องเปิด confirmation ก่อนเสมอ และต้องไม่ apply block หาก user กด `Cancel` หรือ dismiss confirmation
- Confirmation ต้องระบุผลกระทบหลัก: asset/content ของ user นั้นจะถูก filter จาก public discovery surfaces, existing chat history จะอ่านได้แบบ read-only, และไม่สามารถส่งข้อความหรือสร้าง offer ใหม่ระหว่างคู่ที่ block กันได้
- เมื่อ block แล้ว Asset ของผู้ถูก Block ต้องหายจาก:
  - Feed
  - Search
  - Watch Alert Result
- ความสัมพันธ์ Follow ระหว่างกันต้องไม่ถูกใช้ในการแสดง Following Feed
- Existing notification/deep link ที่เปิดไปยัง blocked content ต้องไม่เปิด content ที่ user ไม่มีสิทธิ์เห็น

## Report Type Rule

Report รองรับ type ต่อไปนี้ตาม master:

- Asset
- User
- Comment
- Board Content

## Report Impact Rule

- Submit Report แล้วต้องแสดง success state
- Report ไม่ทำให้ Asset หรือ Content หายทันที
- Report User ไม่ทำให้ profile/content หายทันที
- Report Comment ไม่ทำให้ comment หายทันที
- ผู้ถูก report ไม่เห็นตัวตนของ reporter
- Asset หรือ Content จะหายเมื่อ Admin ดำเนินการตาม Moderation เท่านั้น
- Report Submitted ไม่สร้าง Notification Center item ใน Front Office V1

## Report Bottom Sheet Rule

- Mobile Report Asset สามารถใช้ bottom sheet
- Bottom sheet ต้องมี drag handle
- ไม่จำเป็นต้องมีปุ่ม Cancel / ยกเลิก
- ต้องปิดได้ด้วย drag down, tap backdrop หรือ system back
- Dismiss โดยไม่ submit ต้องไม่สร้าง report
- Unsaved input สามารถ discard ได้เมื่อปิด bottom sheet
- Primary action คือ Submit report / ส่งรายงาน
- Primary action ต้อง disabled จนกว่า Member จะเลือก reason

## Moderation Rule

- Admin ตรวจสอบ Report ผ่าน Back Office
- Admin ต้องดำเนินการภายใน 24 ชั่วโมงสำหรับ Report ที่เข้ามา
- Admin สามารถจัดการ User / Asset / Board Content ตาม policy
- Admin action ต้องมี Audit Trail ใน Back Office ตาม security baseline

## Apple Compliance Rule

ระบบต้องรองรับ:

- Report
- Block
- Terms of Use
- Privacy Policy
- Moderation Flow

## Legal Consent Rule

- ทุกช่องทาง Sign Up ต้องยอมรับ Terms of Use และ Privacy Policy ก่อนสมัคร
- ใช้ label `Terms of Use` เป็น canonical label
- Privacy Policy และ Terms of Use ต้องเข้าถึงได้จาก Settings

## Chat Block Rule

- Master ระบุว่า Chat รองรับ Block User และ Report User
- Product review แนะนำให้หลัง Block แล้ว chat history เดิมยังอ่านได้
- หลัง Block ต้องปิดการส่งข้อความใหม่ระหว่างคู่ที่ block กัน
- หลัง Block ต้องปิดการสร้าง Chat / Offer ใหม่ระหว่างคู่ที่ block กัน
- ต้อง update master และ Chat PRD ให้ explicit ก่อนส่งต่อเป็น final rule

## Removed Content Rule

- Content ที่ถูกลบโดย Admin ต้องไม่แสดงเป็น content ปกติ
- หากต้องแสดง placeholder ให้ใช้ข้อความ removed/unavailable ตาม implementation

---

# 11. Permission Rules

| Actor | Permission |
| --- | --- |
| Guest | ดู Terms / Privacy ได้, Block/Report ไม่ได้ |
| Member | Block และ Report ได้ |
| Reported User | ไม่เห็น reporter identity |
| Admin | Review report และ moderation ผ่าน Back Office |
| Suspended/Banned User | ใช้งานไม่ได้ตาม account state |

---

# 12. Validation Rules

| Field / Condition | Rule |
| --- | --- |
| Report Type | ต้องเป็น Asset, User, Comment หรือ Board Content |
| Report Reason | Required |
| Report Submit Button | Disabled until report reason is selected |
| Report Detail | Optional unless implementation requires |
| Report Dismiss | Dismiss without submit must not create report |
| Terms Consent | Required before Sign Up |
| Privacy Consent | Required before Sign Up |
| Block Confirmation | Required before block; cancel/dismiss must not apply block |

---

# 13. Exception Handling

## User Already Blocked

- TH: `คุณได้บล็อกผู้ใช้งานนี้แล้ว`
- EN: `This user has already been blocked.`

## Block User Confirmation

- TH title: `บล็อกผู้ใช้งานนี้?`
- EN title: `Block this user?`
- EN body: `You will no longer see this user's assets in Feed, Search, Watch Alert results, or related profile surfaces. Existing chat history will remain read-only, but you will not be able to send new messages or create new offers with this user.`
- EN actions: `Cancel`, `Block`
- EN success: `User blocked`

## Report Failed

- TH: `ส่งรายงานไม่สำเร็จ กรุณาลองใหม่`
- EN: `Couldn’t submit report. Please try again.`

## Permission Denied

- TH: `คุณไม่มีสิทธิ์ดำเนินการ`
- EN: `Permission denied.`

## Suspended Account

- TH: `บัญชีของคุณถูกระงับการใช้งาน`
- EN: `Your account has been suspended.`

## Blocked / Unavailable Content

- TH: `ไม่สามารถเปิดข้อมูลได้`
- EN: `Unable to open content.`

---

# 14. Empty State

Trust & Safety Front Office ไม่มี list empty state หลักใน V1

หากมี Back Office report list ให้ใช้ empty state ตาม Back Office spec ไม่ใช่ Front Office module นี้

---

# 15. Notification Rules

Trust & Safety ไม่อยู่ใน Notification baseline ของ master

- Report Submitted ไม่ต้องส่ง notification ใน V1 baseline
- Moderation Action notification เป็น future / Back Office scope ไม่อยู่ใน Front Office V1 baseline
- User suspension/ban messaging อยู่ใน Authentication/account state มากกว่า Notification baseline

---

# 16. Analytics Events

- `user_block_started`
- `user_blocked`
- `user_report_started`
- `user_report_submitted`
- `asset_report_started`
- `asset_report_submitted`
- `comment_report_started`
- `comment_report_submitted`
- `board_content_report_started`
- `board_content_report_submitted`
- `terms_of_use_opened`
- `privacy_policy_opened`
- `signup_legal_consent_accepted`

---

# 17. Acceptance Criteria

## AC-TS-001: Block User

Given Member เห็น user ที่ต้องการ block  
When Member กด Block และ Confirm  
Then ระบบต้อง block user สำเร็จ

## AC-TS-001A: Block User Requires Confirmation

Given Member เลือก Block User จาก Profile, Asset Detail, Feed หรือ Chat  
When confirmation แสดง  
Then ต้องเห็น title `Block this user?` และ actions `Cancel`, `Block`  
When Member กด `Cancel` หรือ dismiss confirmation  
Then ระบบต้องไม่ block user และ visibility/chat/offer state ต้องไม่เปลี่ยน

## AC-TS-002: Block Removes Assets From Feed

Given Member block user รายหนึ่ง  
When Member เปิด Feed  
Then Asset ของผู้ถูก block ต้องไม่แสดงใน Feed

## AC-TS-002A: Block User From Feed

Given Member เห็น Feed Card ของ Asset คนอื่น  
When Member เลือก Block User จาก Feed more menu และ Confirm  
Then ระบบต้องใช้ Block User rule เดียวกัน  
And Asset/content ของ user นั้นต้องไม่แสดงใน Feed หลัง block สำเร็จ

## AC-TS-003: Block Removes Assets From Search

Given Member block user รายหนึ่ง  
When Member เปิด Search Result  
Then Asset ของผู้ถูก block ต้องไม่แสดงใน Search

## AC-TS-004: Block Removes Assets From Watch Alert Result

Given Member block user รายหนึ่ง  
When Member เปิด Watch Alert Result  
Then Asset ของผู้ถูก block ต้องไม่แสดงใน Watch Alert Result

## AC-TS-005: Block Excludes Following Relationship

Given Member block หรือถูก block โดย user ที่เคย follow กัน  
When Following Feed คำนวณรายการ  
Then ความสัมพันธ์ Follow ระหว่างกันต้องไม่ถูกใช้ในการแสดง Following Feed

## AC-TS-006: Report Asset

Given Member เปิด Asset Detail  
When Member ส่ง Report Asset พร้อม reason  
Then ระบบต้องแสดง report submitted success

## AC-TS-006A: Report Asset Bottom Sheet Dismiss

Given Member เปิด Report Asset bottom sheet
When Member dismiss ด้วย drag down, tap backdrop หรือ system back โดยไม่กด submit
Then ระบบต้องไม่สร้าง report
And unsaved input สามารถถูก discard ได้

## AC-TS-006B: Report Asset Reason Required

Given Member เปิด Report Asset bottom sheet
When Member ยังไม่เลือก reason
Then Submit report button ต้อง disabled
When Member เลือก reason แล้ว
Then Submit report button ต้อง enabled

## AC-TS-007: Report User

Given Member เปิด Profile หรือ Chat  
When Member ส่ง Report User พร้อม reason  
Then ระบบต้องแสดง report submitted success

## AC-TS-008: Report Comment

Given Member เห็น Comment  
When Member ส่ง Report Comment พร้อม reason  
Then ระบบต้องแสดง report submitted success

## AC-TS-009: Report Board Content

Given Member เห็น Board Content  
When Member ส่ง Report Board Content พร้อม reason  
Then ระบบต้องแสดง report submitted success

## AC-TS-010: Report Does Not Remove Content Immediately

Given Member report Asset หรือ Content  
When report submit สำเร็จ  
Then content ต้องไม่หายทันทีเพราะ report เพียงอย่างเดียว

## AC-TS-011: Admin Moderation Removes Content

Given Admin ดำเนินการ moderation ผ่าน Back Office  
When Admin remove Asset หรือ Content  
Then content จึงถูก remove/ซ่อนตาม policy

## AC-TS-012: Report SLA

Given Report ถูกส่งเข้า Back Office  
When Admin review queue ทำงาน  
Then Report ต้องอยู่ภายใต้ SLA ดำเนินการภายใน 24 ชั่วโมง

## AC-TS-013: Legal Consent Before Sign Up

Given user สมัครผ่าน Email, Google หรือ Apple  
When user ยังไม่ยอมรับ Terms of Use และ Privacy Policy  
Then ระบบต้องไม่ให้สมัครต่อจนกว่าจะยอมรับ

## AC-TS-014: Legal Access From Settings

Given Member เปิด Settings  
When Member กด Privacy Policy หรือ Terms of Use  
Then ระบบต้องเปิดเอกสารที่เกี่ยวข้อง

## AC-TS-015: Apple Compliance Coverage

Given app ถูกตรวจ Apple compliance  
When ตรวจ feature ด้าน safety  
Then app ต้องมี Report, Block, Terms of Use, Privacy Policy และ Moderation Flow

---

# 18. Related Modules

- Authentication Module
- Feed Module
- Search & Watch Alert Module
- Asset Detail Module
- Profile Module
- Chat Module
- Notification Module
- Social Module
- Board Module
- Settings Module
- Back Office / Admin

---

# 19. Future Enhancement

- Appeal Ban
- Report Tracking
- Trust Score
- Reputation Score
- Automated Moderation
- AI Content Detection
- Moderation notification
