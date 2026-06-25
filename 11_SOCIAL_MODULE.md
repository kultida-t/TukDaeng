# 11 Social Module

อ้างอิงหลักจาก [TukDaeng_Master_Product_Definition.md](TukDaeng_Master_Product_Definition.md)

---

# 1. Document Information

| Field | Detail |
| --- | --- |
| Module Name | Social |
| Version | 1.0 |
| Status | Functional PRD - Master Aligned |
| Owner | Tuk Daeng Project |
| Document Type | Front Office Functional PRD |
| Source of Truth | TukDaeng Master Product Definition |

---

# 2. Objective

Social Module ใช้สำหรับ engagement พื้นฐานใน Front Office Mobile App ได้แก่ Like, Comment, Follow และ Share ผ่าน Asset Detail

V1 ไม่ใช่ full social network และไม่รองรับ Repost, Story, multi-level nested comment หรือ Edit Comment

---

# 3. Prototype Reference

| Prototype | Usage |
| --- | --- |
| Menu Feed.png | Like/Unlike, Like Count, Comment Count, เปิด Asset Detail/Profile |
| Detail asset viewer.png | Like, Comment, Share, Follow, comment section |
| Detail asset owner.png | Owner context และ comment management |
| Main Viewer Profile.png | Follow / Unfollow |
| Notification.png | Like, Comment, Follow notification destination |

---

# 4. Master Alignment Summary

| Topic | Master Baseline | Social Module Rule |
| --- | --- | --- |
| Like Entry | Feed และ Asset Detail | Like/Unlike ทำได้จาก Feed และ Asset Detail |
| Favorites Integration | Like เพิ่ม Asset เข้า Favorites, Unlike ลบออก | Like state ต้อง sync กับ Favorites |
| Owner Like | Owner สามารถ Like Asset ตัวเองได้ | ห้าม block owner-like เว้นแต่ master เปลี่ยน |
| Feed Comment / Share | Feed ไม่รองรับ Comment หรือ Share โดยตรง | Feed แสดง Comment Count ได้ แต่ action ต้องเปิด Asset Detail |
| Comment Entry | Comment ต้องทำใน Asset Detail | ห้าม comment จาก Feed |
| Comment Structure | IG-style one-level replies | Figma รองรับ reply ได้ 1 ชั้นใต้ comment หลัก แต่ไม่มี reply ซ้อนหลายระดับ |
| Comment Edit | ไม่มี Edit Comment ใน V1 | ห้ามแสดง edit comment action |
| Comment Delete | รองรับ Delete Comment | ต้องมี delete + confirmation ตามสิทธิ์ |
| Comment Report | รองรับ Report Comment | ต้องเปิด Trust & Safety Report Comment flow และไม่ทำให้ comment หายทันที |
| Follow Entry | Public Profile และ Asset Detail owner info | Owner ไม่เห็นปุ่ม Follow ตัวเอง |
| Following Feed | แสดง Asset Sale ของ User ที่กำลัง Follow | Following Feed ต้องไม่แสดง Show, Hide, Sold |
| Guest Restriction | Guest ใช้ Like, Follow, Comment ไม่ได้ | ต้องแสดง Global Login Required Dialog |

---

# 5. Figma Gap Checklist For Social Module

| Priority | Figma Gap | Master Baseline | Action |
| --- | --- | --- | --- |
| Must Fix | Comment UI ต้องรองรับการตอบโต้แบบ IG โดยไม่กลายเป็น forum thread | Comment รองรับ one-level replies ใต้ comment หลักเท่านั้น และไม่รองรับ reply ซ้อนหลายระดับ | ปรับ comment UI ให้แสดง reply ได้ 1 ชั้นใต้ comment หลัก และป้องกัน reply ต่อจาก reply |
| Must Fix | Feed อาจสื่อว่า Comment / Share ทำจาก Feed ได้ | Comment และ Share ต้องทำผ่าน Asset Detail เท่านั้น | ตัด direct comment/share action จาก Feed หรือให้กดแล้วเปิด Asset Detail |
| High | Guest state สำหรับ Like / Comment / Follow ยังไม่ครบ | Guest กด action ที่ต้อง Login ต้องเห็น Global Login Required Dialog | เพิ่ม guest dialog/state ทุก action |
| High | Like / Unlike ต้อง sync Favorites | Like สำเร็จต้องเพิ่ม Favorites, Unlike ต้องลบออก | เพิ่ม state note หรือ interaction mapping กับ Favorites |
| High | Following Feed ต้องแสดงเฉพาะ Sale | Following Feed แสดง Asset Sale ของ user ที่ follow | ตรวจ Figma/annotation ไม่ให้ Show, Hide, Sold โผล่ |
| Medium | Owner Like Asset ตัวเองอาจถูก block ใน UI | Owner สามารถ Like Asset ตัวเองได้ | ตรวจ owner detail/feed state |
| Medium | Edit Comment อาจยังโผล่ใน action menu | V1 ไม่มี Edit Comment | ซ่อน edit action หรือย้ายเป็น future |
| Medium | Delete Comment confirmation ยังไม่ชัด | Comment รองรับ Delete Comment | เพิ่ม delete confirmation และ permission state |
| Medium | Comment notification destination ยังไม่เห็น focus state | Comment notification เปิด Asset Detail และ Focus Comment | เพิ่ม state ที่ focus comment เป้าหมาย |
| Medium | Follow notification destination ยังไม่ชัด | Follow notification ควรเปิด Public Profile | เพิ่ม destination state ไป Public Profile |
| Medium | Share detail behavior ต้องมี channel/fallback state | Master ระบุ system share sheet เป็น primary และ copy public deep link เป็น fallback | เพิ่ม share sheet, copy link success และ unavailable/deleted link state |

---

# 6. Scope

## In Scope

- Like Asset
- Unlike Asset
- Like Count
- Favorites integration จาก Like/Unlike
- Comment Asset จาก Asset Detail
- Comment Count
- Delete Comment
- Report Comment
- Follow User
- Unfollow User
- Followers / Following count
- Following Feed integration
- Share Asset จาก Asset Detail
- Notification สำหรับ Like, Comment, Follow
- Guest Login Required Dialog สำหรับ social actions

## Out of Scope For V1

- Multi-level Nested Comment เกิน 1 reply level
- Edit Comment
- Comment Attachment
- Comment Reaction
- Mention
- Repost
- Story
- Social activity feed แยก
- Share จาก Feed โดยตรง

---

# 7. Screen Mapping

| Screen / Component | Description |
| --- | --- |
| Feed Card | Like/Unlike, Like Count, Comment Count, เปิด Asset Detail |
| Asset Detail | Like, Comment, Share, Comment Section, Report Comment, Follow owner |
| Public Profile | Follow / Unfollow |
| Following Feed | Asset Sale ของ user ที่กำลัง Follow |
| Notification | Like, Comment, Follow destination |
| Global Login Required Dialog | แสดงเมื่อ Guest กด social action |

---

# 8. User States

## Guest

- ดู Feed, Asset Detail, Public Profile ได้ตาม visibility rule
- ดู Like Count และ Comment Count ได้
- ดู Comments Section ได้ถ้า Asset Detail เป็น public
- Like, Comment, Follow และ Share action ที่ต้อง login ใช้ไม่ได้
- เมื่อกด action ที่ต้อง login ต้องแสดง Global Login Required Dialog

## Member

- Like / Unlike Asset ได้
- Comment บน Asset Detail ได้
- Delete comment ของตัวเองได้
- Report Comment ได้
- Follow / Unfollow user อื่นได้
- Share Asset จาก Asset Detail ได้

## Owner

- Owner สามารถ Like Asset ตัวเองได้
- Owner ไม่เห็นปุ่ม Follow ตัวเอง
- Owner สามารถจัดการ comment ตามสิทธิ์ที่กำหนดใน implementation ได้

## Blocked Context

- เมื่อ user block กัน Content ของอีกฝ่ายต้องไม่แสดงตาม Trust & Safety rule
- ความสัมพันธ์ Follow ระหว่างกันต้องไม่ถูกใช้ในการแสดง Following Feed

---

# 9. User Flow

## Like Flow

```text
Feed or Asset Detail
-> Like
-> Update Like Count immediately
-> Add Asset to Favorites
```

## Unlike Flow

```text
Feed or Asset Detail
-> Unlike
-> Update Like Count immediately
-> Remove Asset from Favorites
```

## Comment Flow

```text
Asset Detail
-> Enter Comment
-> Submit
-> Add comment or one-level reply
-> Update Comment Count
```

## Delete Comment Flow

```text
Comment
-> Delete
-> Confirm
-> Remove comment
-> Update Comment Count
```

Delete Comment behavior:

- Comment action ใช้ปุ่ม `...` แนวนอน
- User ลบได้เฉพาะ comment หรือ reply ของตัวเอง
- Confirmation title: `Delete this comment?`
- Root comment ที่มี replies ใช้ body: `This action cannot be undone. This comment and its replies will be removed.`
- Reply หรือ root comment ที่ไม่มี replies ใช้ body: `This action cannot be undone. This comment will be removed.`
- ไม่มี Undo
- ลบ root comment แล้วลบ replies ใต้ root comment ทั้งที่แสดงและ collapsed
- ลบ reply แล้วลบเฉพาะ reply นั้น
- Success feedback: `This comment was removed.`

## Report Comment Flow

```text
Comment
-> More menu
-> Report comment
-> Select reason
-> Submit report
-> Report submitted
```

Report Comment behavior:

- Comment ของคนอื่นแสดง `Report comment`
- ไม่ใช้ `Hide comment` ใน V1
- Report สำเร็จต้องไม่ทำให้ comment หายทันที
- Success copy: `Our team will review this comment. It will remain visible until moderation is complete.`

## Follow Flow

```text
Public Profile or Asset Detail Owner Info
-> Follow
-> Update Followers / Following count
-> User's Sale assets can appear in Following Feed
```

## Unfollow Flow

```text
Public Profile or Asset Detail Owner Info
-> Unfollow
-> Update Followers / Following count
-> User's assets no longer appear via Following Feed relation
```

## Share Flow

```text
Asset Detail
-> Share
-> Open platform share behavior
```

---

# 10. Business Rules

## Like Rules

- Like / Unlike ทำได้จาก Feed และ Asset Detail
- 1 User มีได้ 1 Like ต่อ 1 Asset
- Like สำเร็จต้อง update Like Count ทันที
- Unlike สำเร็จต้อง update Like Count ทันที
- Like สำเร็จต้องเพิ่ม Asset เข้า Favorites
- Unlike สำเร็จต้องลบ Asset ออกจาก Favorites
- Owner สามารถ Like Asset ตัวเองได้

## Feed Social Rules

- Feed Card แสดง Like Count และ Comment Count ได้
- Feed รองรับ Like / Unlike
- Feed ไม่รองรับ Comment จาก Feed โดยตรง
- Feed ไม่รองรับ Share จาก Feed โดยตรง
- กด Comment Count หรือ comment entry จาก Feed ต้องเปิด Asset Detail ไม่ใช่เปิด composer บน Feed

## Comment Rules

- Comment ทำได้จาก Asset Detail เท่านั้น
- Comment รองรับ IG-style one-level replies ใต้ comment หลัก
- ไม่รองรับ multi-level nested thread หรือ reply ซ้อนเกิน 1 ชั้น
- ไม่มี Edit Comment ใน V1
- รองรับ Delete Comment
- รองรับ Report Comment ผ่าน Trust & Safety flow
- Comment action menu ใช้ปุ่ม `...` แนวนอน
- Comment ของตัวเองแสดง `Delete comment`
- Comment ของคนอื่นแสดง `Report comment`
- ไม่รองรับ `Hide comment` ใน V1
- Comment content เป็น text ใน V1
- Comment Count ต้องสะท้อนจำนวน comment ที่ user มีสิทธิ์เห็น

## Comment Ordering

- Comment เรียง Oldest -> Newest เว้นแต่ product decision เปลี่ยน
- Notification ที่เปิดจาก Comment ต้อง focus comment ที่เกี่ยวข้อง

## Follow Rules

- Follow / Unfollow ทำได้จาก Public Profile และ owner info บน Asset Detail
- Owner ไม่เห็นปุ่ม Follow ตัวเอง
- Followers / Following count ต้อง update หลัง action สำเร็จ
- Following Feed แสดงเฉพาะ Asset สถานะ Sale ของ user ที่กำลัง Follow
- Following Feed ต้องเคารพ block, visibility และ lifecycle rules

## Share Rules

- Share Asset ทำผ่าน Asset Detail เท่านั้น
- Feed ไม่รองรับ Share โดยตรง
- Share เป็น public share action สำหรับ public content
- Guest สามารถ Share public content ได้โดยไม่ต้อง Login
- Share ไม่สร้าง Notification Center item
- Primary share channel คือ system share sheet เมื่อ platform รองรับ
- Fallback share channel คือ copy public deep link
- Public deep link ต้อง validate asset status, deleted state, permission และ block state เมื่อเปิด

## Guest Rules

- Guest ใช้ Like, Comment, Follow, Favorites, Following ไม่ได้
- เมื่อ Guest กด action ที่ต้อง login ต้องแสดง Global Login Required Dialog

## Block User Impact

- เมื่อ user block กัน ความสัมพันธ์ Follow ระหว่างกันต้องไม่ถูกใช้ในการแสดง Following Feed
- Asset ของผู้ถูก Block ต้องหายจาก Feed, Search และ Watch Alert Result ตาม Trust & Safety rule
- Social notification หรือ destination ต้องไม่เปิด content ที่ user ไม่มีสิทธิ์เห็น

## Deleted Asset Impact

- Asset ที่ถูกลบต้องหายจาก public surfaces
- Asset Detail ต้องแสดง `รายการนี้ไม่พร้อมใช้งานแล้ว`
- Like/Comment/Share action ต้องไม่สามารถทำกับ Asset ที่ถูกลบ

---

# 11. Permission Rules

| Actor | Permission |
| --- | --- |
| Guest | Read-only ตาม visibility, ใช้ social action ไม่ได้ |
| Member | Like, Unlike, Comment, Delete own comment, Report Comment, Follow, Unfollow, Share |
| Owner | Like asset ตัวเองได้, ไม่ follow ตัวเอง |
| Other User | ไม่มีสิทธิ์ delete comment ของคนอื่น เว้นแต่ policy กำหนด |
| Admin | Moderation ผ่าน Back Office ไม่ใช่ Social Module FO |

---

# 12. Validation Rules

| Field / Condition | Rule |
| --- | --- |
| Comment | Required |
| Comment | ต้องไม่เป็นค่าว่าง |
| Comment Length | ยังไม่กำหนดใน V1 |
| Like | 1 User = 1 Like ต่อ Asset |
| Follow | 1 User follow user เดิมได้ 1 ครั้ง |
| Follow Self | ไม่อนุญาต และไม่แสดงปุ่ม Follow ตัวเอง |
| Deleted Asset | ห้าม Like / Comment / Share |

---

# 13. Exception Handling

## Asset Deleted

- TH: `รายการนี้ไม่พร้อมใช้งานแล้ว`
- EN: `This item is no longer available.`

## User Deleted

- TH: `ไม่พบผู้ใช้งาน`
- EN: `User not found.`

## Permission Denied

- TH: `คุณไม่มีสิทธิ์ดำเนินการ`
- EN: `Permission denied.`

## Comment Submit Failed

- TH: `ไม่สามารถส่งความคิดเห็นได้`
- EN: `Unable to submit comment.`

## Action Failed

- TH: `ไม่สามารถดำเนินการได้`
- EN: `Unable to proceed.`

---

# 14. Empty State

ใช้ข้อความกลางตาม master:

| State | TH | EN |
| --- | --- | --- |
| No Comments | `ไม่พบข้อมูล` | `No data found` |
| No Following Feed Items | `ไม่พบข้อมูล` | `No data found` |

---

# 15. Notification Rules

| Trigger | Recipient | Destination | Rule |
| --- | --- | --- | --- |
| Asset liked | Asset Owner | Asset Detail | เปิด Asset Detail |
| Asset commented | Asset Owner / related user | Asset Detail + Focus Comment | เปิด Asset Detail และ focus comment |
| User followed | Followed User | Public Profile | เปิด Public Profile ของ follower |

Notification ต้องไม่เปิด content ที่ถูกลบ ถูก block หรือ user ไม่มีสิทธิ์เห็น

---

# 16. Analytics Events

- `asset_liked`
- `asset_unliked`
- `asset_comment_started`
- `asset_comment_submitted`
- `asset_comment_deleted`
- `asset_comment_report_started`
- `asset_comment_report_submitted`
- `asset_share_started`
- `asset_shared`
- `user_followed`
- `user_unfollowed`
- `guest_social_login_required_shown`

---

# 17. Acceptance Criteria

## AC-SOCIAL-001: Like From Feed And Detail

Given Member เห็น Asset ที่มีสิทธิ์มองเห็น  
When Member กด Like จาก Feed หรือ Asset Detail  
Then ระบบต้อง Like Asset สำเร็จ  
And Like Count ต้อง update ทันที

## AC-SOCIAL-002: Unlike Removes Favorite

Given Member เคย Like Asset แล้ว  
When Member กด Unlike  
Then ระบบต้อง Unlike สำเร็จ  
And Like Count ต้อง update ทันที  
And Asset ต้องถูกลบออกจาก Favorites

## AC-SOCIAL-003: Like Adds Favorite

Given Member ยังไม่เคย Like Asset  
When Member กด Like  
Then Asset ต้องถูกเพิ่มเข้า Favorites

## AC-SOCIAL-004: Owner Can Like Own Asset

Given Owner เห็น Asset ของตัวเอง  
When Owner กด Like  
Then ระบบต้อง Like Asset ได้

## AC-SOCIAL-005: Comment Only From Asset Detail

Given Member ต้องการ Comment  
When Member อยู่ที่ Feed  
Then ระบบต้องไม่เปิด comment composer บน Feed

And เมื่อ Member เปิด Asset Detail  
Then ระบบต้องอนุญาตให้ Comment ได้

## AC-SOCIAL-006: Comment Supports IG-Style One-Level Replies

Given Asset Detail แสดง Comments Section  
When มี comment หลายรายการ  
Then comments ต้องรองรับ reply ใต้ comment หลักได้ 1 ชั้น  
And ต้องไม่รองรับ reply ซ้อนต่อจาก reply หรือ thread หลายระดับ

## AC-SOCIAL-007: No Edit Comment In V1

Given Member เปิด comment action menu  
When comment เป็นของ Member  
Then ระบบต้องไม่แสดง Edit Comment action ใน V1

## AC-SOCIAL-008: Delete Comment

Given Member มีสิทธิ์ delete comment  
When Member กด Delete และ Confirm  
Then comment ต้องถูกลบ  
And Comment Count ต้อง update
And ต้องไม่มี Undo / restore action

## AC-SOCIAL-008B: Delete Root Comment With Replies

Given Member delete root comment ของตัวเองที่มี replies
When delete สำเร็จ
Then root comment และ replies ใต้ root comment ต้องถูกลบทั้งหมด
And ต้องแสดง feedback `This comment was removed.`

## AC-SOCIAL-008A: Report Comment

Given Member เห็น Comment ใน Asset Detail
When Member เลือก Report Comment และ submit reason
Then ระบบต้องส่งเข้า Trust & Safety Report Comment flow
And Comment ต้องไม่หายทันทีจนกว่า Admin moderation จะดำเนินการ
And success copy ต้องระบุว่า comment remains visible until moderation is complete

## AC-SOCIAL-009: Follow From Profile Or Detail

Given Member ดู Public Profile หรือ owner info บน Asset Detail  
When Member กด Follow  
Then ระบบต้อง Follow user สำเร็จ  
And Followers / Following count ต้อง update

## AC-SOCIAL-010: Owner Cannot Follow Self

Given Owner ดู profile หรือ asset ของตัวเอง  
When หน้าจอแสดง social actions  
Then ระบบต้องไม่แสดงปุ่ม Follow ตัวเอง

## AC-SOCIAL-011: Following Feed Shows Sale Only

Given Member follow user รายหนึ่ง  
When Member เปิด Following Feed  
Then ระบบต้องแสดงเฉพาะ Asset สถานะ Sale ของ user ที่ follow  
And ต้องไม่แสดง Show, Hide หรือ Sold

## AC-SOCIAL-012: Guest Social Action Requires Login

Given user เป็น Guest  
When user กด Like, Comment, Follow หรือ Share action ที่ต้อง login  
Then ระบบต้องแสดง Global Login Required Dialog

## AC-SOCIAL-013: Comment Notification Focus

Given Member ได้รับ Comment notification  
When Member กด notification  
Then ระบบต้องเปิด Asset Detail  
And focus comment ที่เกี่ยวข้อง

## AC-SOCIAL-014: Share From Asset Detail Only

Given Member ต้องการ Share Asset  
When Member อยู่ที่ Feed  
Then ระบบต้องไม่ share จาก Feed โดยตรง

And เมื่อ Member อยู่ที่ Asset Detail  
Then ระบบสามารถเริ่ม Share flow ได้

---

# 18. Related Modules

- Feed Module
- Asset Detail Module
- Profile Module
- Notification Module
- Trust & Safety Module
- Favorites / Feed Integration

---

# 19. Future Enhancement

- Edit Comment
- Multi-level Nested Comment เกิน 1 reply level
- Comment Mention
- Comment Attachment
- Comment Reaction
- User Mention
- Repost
- Story
- Activity Feed
