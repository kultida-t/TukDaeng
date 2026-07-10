# TukDaeng Back Office Dev Implementation Checklist

**Baseline:** `BO-PRD-v0.1`  
**Date:** 2026-07-06  
**Purpose:** Checklist ตั้งต้นสำหรับแตก ticket implementation ของ BO

## 0. Foundation

- [ ] ใช้ `../ProjectAdmin/FO_BO_INTEGRATION_MAP.md` ตรวจทุก BO action ที่เปลี่ยน behavior บน FO
- [ ] ใช้ `00_GLOBAL_RULES_MODULE.md` เป็น baseline กลางเรื่อง responsive layout, admin access control, audit, status, privacy และ FO sync
- [ ] สร้าง BO web app shell พร้อม authenticated layout, left navigation, top bar และ access-aware menu visibility
- [ ] กำหนด shared status constants สำหรับ users, assets, articles, offers, comments, tickets, alerts, notifications และ audit actions
- [ ] ทำ shared table pattern: server pagination, search, filters, sort, column visibility ตามความเหมาะสม และ CSV/Excel export hook
- [ ] ทำ shared confirmation modal สำหรับ destructive actions พร้อม reason input เมื่อจำเป็น
- [ ] ทำ shared audit helper เพื่อกันไม่ให้ write action ข้าม audit logging
- [ ] ตรวจ shared layout ที่ 375px, 768px, 1280px และ 1440px

## 1. Auth And Permission

- [ ] Admin login รองรับ email/password เท่านั้น
- [ ] Admin must use mandatory 2FA
- [ ] Failed login ครบ 5 ครั้ง lock account 15 นาที
- [ ] Idle session หมดอายุหลัง 8 ชั่วโมง และ max session หลัง 24 ชั่วโมง
- [ ] Permission guard มีทั้ง route level และ action/API level
- [ ] BO reset password flow แยกจาก FO user reset password
- [ ] Login, logout, failed login, 2FA setup/change และ lockout events ต้อง audit-log

## 2. Dashboard

- [ ] แสดง new users วันนี้/สัปดาห์นี้/เดือนนี้
- [ ] แสดง DAU/MAU
- [ ] แสดง asset count แยกตาม status
- [ ] แสดง offer made/accepted/rejected counts
- [ ] แสดง pending report count
- [ ] แสดง queue summary พร้อม SLA risk สำหรับ pending reports
- [ ] แสดง policy-based dashboard view ตาม permission ของ admin
- [ ] Metric/queue card ต้อง drill-in ไป module ที่เกี่ยวข้องพร้อม filter
- [ ] Dashboard ต้องรองรับ partial load error โดยไม่ล้มทั้งหน้า
- [ ] แสดง active watch alert count
- [ ] แสดง latest articles
- [ ] แสดง top searched brands
- [ ] แสดง recent activity feed
- [ ] Date range change ต้อง update dashboard metrics สม่ำเสมอ

## 3. User Management

- [ ] User list รองรับ search/filter ตาม status, auth method, date joined
- [ ] User profile แสดง account, auth method, profile, assets, activity, login history
- [ ] User detail แสดง reported user context และ linked report history ตาม permission
- [ ] Admin reset password ได้เฉพาะ email/password accounts
- [ ] Apple/Google accounts reset password จาก BO ไม่ได้
- [ ] Suspend, ban, unsuspend, unban และ soft delete ต้อง enforce Admin Permission
- [ ] Suspend/ban/soft delete ต้องมี confirmation, reason และ audit before/after
- [ ] User status changes ต้องส่งผลต่อ FO login/public behavior
- [ ] Export CSV เปิดให้ admin access ที่มีสิทธิ์
- [ ] Mutation ทุกครั้งต้องเขียน audit log พร้อม before/after state

## 4. Asset Management

- [ ] Asset list รองรับ Sale, Show, Hide, Sold, flagged และ removed states
- [ ] Implementation ต้องใช้ `Show` และ `Hide` ตาม FO เป็นหลัก และ normalize คำเก่าจาก legacy source ก่อนใช้งาน
- [ ] Filters มี status, brand, owner, price range, flagged
- [ ] เพิ่ม filter สำหรับ reported, removed, has consignment, created/updated date range
- [ ] Asset detail แสดงข้อมูลที่จำเป็นต่อ review ครบ
- [ ] Provenance, proof of payment, consignment และ sale history ต้องจำกัดตาม Admin access
- [ ] Sensitive fields ต้อง mask เป็น default และ reveal ได้เฉพาะ admin access ที่มี permission
- [ ] Reported asset ต้องเข้า moderation queue และไม่หายจาก FO ทันทีเว้นแต่มี policy ชัดเจน
- [ ] Flag/unflag, soft remove และ force status change ต้องมี confirmation, reason และ update FO visibility rules
- [ ] Status change ต้อง sync ผลไป Feed, Search, Profile, Asset Detail และ Watch Alert ตาม visibility matrix
- [ ] Removed/Sold asset ที่มี pending offers ต้องส่งผลไป offer invalidation/cancellation policy
- [ ] Sold assets ยังใช้สำหรับ owner history และ admin review
- [ ] Asset mutations ทุกครั้งต้องเขียน audit log พร้อม before/after state
- [ ] Asset Management UI ต้อง responsive ที่ 375px, 768px, 1280px และ 1440px

## 5. Content / Board

- [ ] Article list รองรับ draft, scheduled, published, archived
- [ ] Article editor รองรับ title, slug, excerpt, cover image, alt text, category, tags, author, read time, quote, body, related articles, SEO fields
- [ ] Preview as FO ต้องเป็น admin-only และไม่เพิ่ม view count
- [ ] Publish now และ schedule publish ต้องใช้เวลาแสดงผลตาม Asia/Bangkok
- [ ] Archived articles ต้องหายจาก Board/search/category
- [ ] Featured และ featured order ต้องควบคุม FO Board hero/featured area
- [ ] Category active/inactive ต้องส่งผลต่อ FO category sidebar
- [ ] Banner active date range ต้องควบคุม FO display
- [ ] Report article จาก FO ต้องเข้า BO reported Board Content handoff และไม่ทำให้ article หายทันที
- [ ] Publish/archive/category/banner actions ต้อง audit-log พร้อม before/after state
- [ ] Article editor และ preview ต้อง responsive ที่ 375px, 768px, 1280px และ 1440px

## 6. Market Data

- [ ] Brand CRUD รองรับ EN/TH names, logo, country, founded year, official website, active status
- [ ] Model CRUD รองรับ brand relation, reference numbers, specs, active status
- [ ] Price index รองรับ brand/model/reference, min/max THB, source URL, updated date, history
- [ ] Inactive brand/model ต้องหยุด Watch Alert trigger ใหม่ และไม่แสดงใน FO autocomplete/filter
- [ ] Market data changes ต้อง audit-log
- [ ] Reference number management ต้องผูก brand/model และใช้กับ Add Asset/Search/Price Index matching
- [ ] The Watch API ต้องถูกเรียกจาก backend sync/cache เท่านั้น ห้าม FO client เรียกตรง
- [ ] ข้อมูลจาก The Watch API ต้องถูกเก็บใน TukDaeng database ก่อน BO/FO ใช้งาน
- [ ] BO ต้องรองรับ Admin เพิ่ม/แก้/override brand/model/reference/price index ตาม permission
- [ ] ห้าม hard delete brand/model/reference/price index ที่เคยถูกใช้กับ asset, alert, price history หรือ audit แล้ว ให้ใช้ inactive/soft delete
- [ ] Manual override ต้องไม่ถูก provider sync overwrite โดยไม่ผ่าน conflict review
- [ ] เก็บ provider metadata: provider name, endpoint/source level, provider updated date, synced date, sync status
- [ ] Provider price จาก The Watch API เป็น USD ต้องมี USD -> THB conversion metadata ก่อนใช้ใน FO
- [ ] รองรับ provider error/rate limit/usage limit และ fallback ไป cached data ล่าสุด
- [ ] Import ต้องมี dry-run validation, duplicate detection และ error report รายแถว
- [ ] Market data sync/cache invalidation ต้องครอบคลุม Add Asset, Search Filter, Watch Alert และ Portfolio
- [ ] Existing asset ต้องยังเก็บ historical brand/model/reference ได้แม้ master data ถูก inactive
- [ ] Market Data UI ต้อง responsive ที่ 375px, 768px, 1280px และ 1440px

## 7. Directory

- [ ] Directory item CRUD รองรับ category, TH/EN names, address, province, phone, Line ID, website, Facebook, Instagram, logo, cover photos, description, opening hours, map location, tags, status
- [ ] Active items แสดงใน FO directory surfaces
- [ ] Inactive items หายจาก FO directory surfaces
- [ ] Directory changes ต้อง audit-log
- [ ] ถ้า FO Directory ยังเป็น placeholder ต้องไม่เปิด production route โดยไม่มี Product decision
- [ ] Directory record ที่เคยถูกใช้เป็น FK/report/audit/analytics ต้องไม่ hard delete ให้ใช้ inactive/archive
- [ ] Import ต้องมี dry-run validation, duplicate detection และ error report รายแถว
- [ ] Map provider unavailable ต้องไม่ทำให้ edit form ใช้งานไม่ได้
- [ ] Directory UI ต้อง responsive ที่ 375px, 768px, 1280px และ 1440px

## 8. Audit Log

- [ ] Audit log บันทึก admin ID, admin access, action type, target type, target ID, before value, after value, IP address, timestamp และ reason เมื่อมี
- [ ] Audit log ต้อง immutable จาก admin UI ปกติ
- [ ] เฉพาะ Admin ดู/export full audit log ได้
- [ ] Audit log filter ได้ตาม admin, admin access, action, target, date range
- [ ] Sensitive data reveal/export, provider sync, import/export และ background job ต้อง audit-log
- [ ] Audit log ต้องมี correlation ID สำหรับ workflow/job ที่มีหลาย event
- [ ] Audit export ต้อง audit ตัวเองและมี controlled access/expiry
- [ ] Retention baseline อย่างน้อย 1 ปี
- [ ] Audit Log UI ต้อง responsive ที่ 375px, 768px, 1280px และ 1440px

## 9. Offer & Chat Management

- [ ] Offer list ต้องรองรับ search/filter/sort/pagination และ status `Pending`, `Accepted`, `Rejected`, `Cancelled`, `Expired`, `Invalidated`
- [ ] Implementation ต้องใช้ `Rejected` ตาม FO เป็นหลัก และ normalize legacy `Declined` เป็น `Rejected`
- [ ] FO button/action copy ต้องใช้ `Decline` ได้ แต่เมื่อกดแล้วต้องเปลี่ยน status เป็น `Rejected`
- [ ] Offer detail ต้องแสดง asset summary, buyer, owner, offer timeline, related chat room, notification delivery และ audit events
- [ ] Offer status timeline ต้องเก็บ actor/source, timestamp, before/after state และ reason เมื่อจำเป็น
- [ ] Admin force expire offer ได้โดยมี confirmation, reason และ audit log
- [ ] System/Admin mark invalidated ได้เมื่อ asset/user state ทำให้ offer ใช้งานต่อไม่ได้
- [ ] Asset removed/sold ขณะมี pending offer ต้องส่งผลไป offer invalidation policy และ FO active pending flow
- [ ] `Show` asset ต้องรองรับ offer/contact เฉพาะ Asset Detail/Public Profile detail ตาม FO rule และไม่ขึ้น Feed/Search/Watch Alert
- [ ] `Hide`, `Sold`, `Removed/Hidden` ต้องไม่รับ offer ใหม่
- [ ] Chat room list ต้องรองรับ search/filter จาก participant, asset, has offer, has attachment, reported, date range และ attachment scan status
- [ ] Chat detail ต้องแสดง participants, related asset, offer card/history, transcript, attachments, report history และ moderation history
- [ ] FO Delete Chat ต้องเป็น user-level visibility เท่านั้น ห้าม hard delete server record โดยไม่มี retention/audit policy
- [ ] Blocked users ต้องส่งข้อความใหม่ไม่ได้ แต่ history เดิมยังอ่านได้ตาม FO read-only rule
- [ ] Admin ห้าม edit user message หรือ offer price โดยตรง
- [ ] Admin hide/remove policy-violating message ได้ตาม permission พร้อม reason และ audit
- [ ] Attachment ต้องมี scan status: `Pending Scan`, `Clean`, `Unsafe`, `Scan Failed`, `Blocked`
- [ ] Unsafe หรือ scan failed attachment ต้องไม่เปิด preview/download ให้ FO จนกว่าจะผ่าน policy
- [ ] Offer/chat notification delivery ต้อง trace ได้ แต่ template/retry อยู่ใน Notification module
- [ ] Pending offer ต้องเป็น dependency สำหรับ block account deletion
- [ ] Export offer history/conversation ต้องจำกัด permission และ audit export event
- [ ] Offer & Chat UI ต้อง responsive ที่ 375px, 768px, 1280px และ 1440px

## 10. Social Interaction Management

- [ ] Comment/reply list ต้องรองรับ search/filter/sort/pagination และ root/reply relation 1 level
- [ ] Comment status ต้องรองรับ `Visible`, `Reported`, `Hidden`, `Removed`, `User Deleted`
- [ ] Reported comment จาก FO ต้องเข้า BO moderation queue และไม่ทำให้ comment หายจาก FO ทันที
- [ ] Reported comment queue ต้องแสดง SLA baseline 24 ชั่วโมง
- [ ] Comment detail ต้องแสดง asset context, author, parent/reply relation, report history และ moderation timeline
- [ ] Admin ห้าม edit user comment text โดยตรง
- [ ] Admin hide/unhide/remove comment ได้ตาม permission พร้อม confirmation, reason และ audit
- [ ] Comment count และ Asset Detail visibility ต้อง sync หลัง hide/remove/unhide
- [ ] User-deleted comment ต้องแยกจาก admin-removed comment เพราะ actor/source ต่างกัน
- [ ] Like/Favorite analytics ต้องสะท้อน rule: Like เพิ่ม Favorites และ Unlike ลบออกจาก Favorites
- [ ] BO ไม่ควรแก้ individual like/favorite record โดย Admin ทั่วไป
- [ ] Follow analytics ต้องรองรับ follower/following relation, follow/unfollow trend และ top followed users
- [ ] Following Feed rule ต้องใช้เฉพาะ asset status `Sale` ของ user ที่ follow
- [ ] Block relation ต้องไม่ถูกใช้ในการแสดง Following Feed และต้องเห็น context ใน BO review
- [ ] Export social data ต้องจำกัด permission และ audit export event
- [ ] Social Interaction UI ต้อง responsive ที่ 375px, 768px, 1280px และ 1440px

## 11. Watch Alert Management

- [ ] Watch Alert list ต้องรองรับ search/filter/sort/pagination และ export ตาม permission
- [ ] Alert detail ต้องแสดง owner, alert name, criteria, status, notification toggle และ trigger history
- [ ] Criteria schema ต้องใช้ schema เดียวกับ Search Filter และทุก field ต้อง optional
- [ ] Alert name ต้อง optional และรองรับ generated/default name
- [ ] Watch Alert match ต้องใช้เฉพาะ asset status `Sale`
- [ ] Watch Alert ต้องไม่ match `Show`, `Hide`, `Sold`, `Deleted`, `Removed/Hidden`
- [ ] Watch Alert notification destination ต้องเป็น `Watch Alert Result List` ห้ามเปิด Asset Detail โดยตรง
- [ ] Trigger history ต้องเก็บ criteria snapshot, matched asset, trigger time, notification event และ exclusion reason ถ้ามี
- [ ] Block relation ต้องเป็น exclusion context สำหรับ trigger/result review
- [ ] Market data inactive dependency ต้องแสดง warning และหยุด new trigger ตาม policy แต่ไม่ลบ history เดิม
- [ ] Admin disable alert ได้ตาม permission พร้อม confirmation, reason และ audit
- [ ] Disabled alert ต้องหยุด trigger notification ใหม่
- [ ] Admin enable alert ได้ตาม permission พร้อม criteria revalidation และ audit
- [ ] Notification delivery trace ดูได้ แต่ template/retry อยู่ใน Notification module
- [ ] Watch Alert UI ต้อง responsive ที่ 375px, 768px, 1280px และ 1440px

## 12. Help & Support

- [ ] Ticket queue ต้องรองรับ search/filter ตาม Ticket ID, user, channel, type, priority, status, assignee, SLA และ date range
- [ ] BO ต้องรองรับ manual ticket จาก LINE / Phone / Email ตาม FO Help contact-only baseline
- [ ] Ticket detail ต้องแสดง requester context, account status, source channel, conversation, internal note และ related entity
- [ ] Status ต้องใช้ `New`, `Open`, `In Progress`, `Waiting User`, `Resolved`, `Closed`, `Spam / Invalid`
- [ ] Priority ต้องใช้ `Urgent`, `High`, `Medium`, `Low`
- [ ] First response SLA ต้องตั้ง baseline 8 ชั่วโมง และแสดง On track / Near breach / Breached
- [ ] Admin must assign, reply, add internal note, link entity, and change priority/status according to action policy
- [ ] Internal note ต้องไม่แสดงให้ผู้ใช้และไม่ sync ไป FO
- [ ] ถ้า FO เปิด in-app ticket history ในอนาคต BO reply/status ต้อง sync กลับ FO ตาม contract
- [ ] Ticket ต้อง link ไป User, Asset, Offer, Chat, Report, Watch Alert, Notification, Market Data หรือ Account Deletion ได้ตาม permission
- [ ] Sensitive reveal, export, status change, reply และ assignment ต้องมี audit log
- [ ] Help / Support UI ต้อง responsive ที่ 375px, 768px, 1280px และ 1440px

## 13. Account Deletion Requests

- [ ] Deletion request queue ต้องรองรับ search/filter ตาม Request ID, user, status, account status, pending offer, grace period และ requested date
- [ ] Request detail ต้องแสดง user context, deletion timeline, pending offers, assets, chats, reports และ support tickets
- [ ] หลัง FO Delete Account สำเร็จ account ต้องเข้าสู่ deactivated/login blocked state และ public profile/assets ต้องถูกซ่อน
- [ ] Grace period ต้องใช้ baseline 30 วันและแสดง active / ending soon / expired
- [ ] Pending incoming/outgoing offer ต้อง block archive/anonymization ได้
- [ ] Recheck blocking conditions ต้อง query dependency ล่าสุดจาก Offer / Chat, Asset, Report และ Support modules
- [ ] Archive approval, request cancellation, anonymization trigger, and archive report export require Admin access policy, confirmation, reason, and audit
- [ ] Admin ดู request และ recheck blocking conditions ได้ แต่ approve/cancel/export ไม่ได้
- [ ] Archive/anonymization plan ต้องแยก hide, retain, archive และ anonymize ต่อ entity ให้ชัด
- [ ] Sensitive reveal, recheck, blocked, approve archive, archive complete, anonymize complete, cancel และ export ต้องมี audit log
- [ ] Account Deletion UI ต้อง responsive ที่ 375px, 768px, 1280px และ 1440px

## 14. Notifications

- [ ] Notification dashboard ต้องแสดง broadcast list, system trigger templates, delivery logs และ failed delivery summary
- [ ] Broadcast ต้องรองรับ Draft, Pending Approval, Scheduled, Sending, Sent, Cancelled และ Failed
- [ ] Broadcast ต้องมี title, body, optional image, channel, target audience, deep link, send now/schedule และ preview
- [ ] Broadcast ที่ส่งถึงผู้ใช้จริงต้องผ่าน Admin approval
- [ ] Generic Broadcast ห้ามแสดงใน FO Notification Center จนกว่า master decision เพิ่ม scope หรือ mapping ชัดเจน
- [ ] System trigger ต้องรองรับ Like, Comment, Follow, New Offer, Offer Accepted, Offer Rejected, Offer Cancelled และ Watch Alert
- [ ] FO Notification Center ต้องรองรับเฉพาะ Like, Comment, Follow, Offer และ Watch Alert ตาม V1 baseline
- [ ] Chat / New Message ต้องไม่เข้า Notification Center และใช้ Chat badge/count เท่านั้น
- [ ] Watch Alert notification destination ต้องเป็น Watch Alert Result List เท่านั้น
- [ ] System template ต้องใช้ allowlist variables และห้ามใส่ sensitive data เช่น phone, email, LINE หรือ internal note
- [ ] Disabled notification type ต้องไม่ส่ง notification ใหม่
- [ ] Delivery log ต้องเก็บ queued/sent/delivered/opened/failed/skipped พร้อม failure reason
- [ ] Retry failed notification ต้องมี idempotency guard และ audit log
- [ ] Template update, type enable/disable, broadcast approve/send/cancel, retry และ export ต้องมี audit log
- [ ] Notifications UI ต้อง responsive ที่ 375px, 768px, 1280px และ 1440px

## 15. Reports & Analytics

- [ ] Report catalog ต้องมี User, Asset, Offer, Chat, Content / Board, Social, Search, Watch Alert, Support, Notification และ Account Deletion reports
- [ ] ทุก report ต้องรองรับ date range, filter, sort, policy-based visibility และ last updated
- [ ] ทุก report ที่ export ได้ต้องรองรับ CSV และ Excel ตาม permission
- [ ] Large export ต้องใช้ background job พร้อม status Queued / Processing / Completed / Failed / Expired / Cancelled
- [ ] Sensitive data ต้อง mask เป็น default และ sensitive view/export ต้อง audit-log
- [ ] User Report ต้องแสดง new users, DAU/MAU, auth method, account status และ support/deletion signals
- [ ] Asset Report ต้องใช้ status `Show` / `Hide` ตาม FO และไม่ใช้ legacy collection wording
- [ ] Offer Report ต้องใช้ status `Rejected` ไม่ใช้ `Declined`
- [ ] Chat Report ต้องจำกัด transcript export ตาม permission และ audit ทุกครั้ง
- [ ] Search Report ต้องแสดง top searched keywords/brands/models, no-result searches และ save-as-watch-alert conversion ถ้ามี tracking
- [ ] Watch Alert Report ต้องยืนยัน Sale-only match และ destination `Watch Alert Result List`
- [ ] Support Report ต้องวัด first response SLA 8 ชั่วโมง
- [ ] Notification Report ต้องแสดง queued/sent/delivered/opened/failed/skipped และ failure reason
- [ ] Account Deletion Report ต้องแสดง blocked reason, grace period และ archive/anonymization status
- [ ] Reports UI ต้อง responsive ที่ 375px, 768px, 1280px และ 1440px

## 16. Admin Settings

- [ ] Admin ทุก admin access ต้องเข้าดู own profile/settings และเปลี่ยน password/ตั้งค่า 2FA ตาม rule ได้
- [ ] Admin ต้องจัดการ admin account lifecycle: invite, change admin access policy, suspend/reactivate, unlock, reset 2FA, archive
- [ ] ระบบต้องป้องกันการ suspend/archive/change admin access policy ของ Admin active คนสุดท้าย
- [ ] Admin Access Matrix ต้องแสดงสิทธิ์ตาม module/action และ enforce ทั้ง UI/API level
- [ ] Permission change ต้องมี confirmation, reason, before/after diff และ audit log
- [ ] Security policy ต้องสอดคล้องกับ Auth baseline: email/password only, mandatory 2FA สำหรับ Admin, idle 8h, max 24h, failed login 5 ครั้ง, lockout 15 นาที
- [ ] Retention settings ต้องไม่อนุญาต manual delete audit logs จาก UI ปกติ
- [ ] Export policy ต้องรองรับ CSV/Excel, background job, expiry, sensitive export reason และ audit
- [ ] Feature flags ต้องแสดง FO/BO impact ก่อนบันทึก และ audit ทุกครั้ง
- [ ] Integration settings ต้องแสดง metadata/status เท่านั้น และห้ามเปิดเผย secrets ใน BO UI
- [ ] System defaults ต้องแสดง timezone `Asia/Bangkok`, currency THB, Thai-primary language, server pagination และ sensitive masking baseline
- [ ] Settings change history ต้อง link ไป Audit Log detail ตาม permission
- [ ] Admin Settings UI ต้อง responsive ที่ 375px, 768px, 1280px และ 1440px
