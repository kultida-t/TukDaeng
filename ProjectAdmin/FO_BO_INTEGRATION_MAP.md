# FO / BO Integration Map

**Project:** TukDaeng  
**Version:** `INT-MAP-v0.1`  
**Date:** 2026-07-06  
**Status:** Draft baseline  
**Owner:** Product / UX / Engineering / Operations  

## 1. วัตถุประสงค์

เอกสารนี้เป็นแผนที่กลางสำหรับเชื่อมการทำงานระหว่าง Front Office (FO) และ Back Office (BO)

FO และ BO ต้องแยกเอกสารกันชัดเจน:

- FO docs กำหนด behavior ฝั่ง mobile/user-facing
- BO docs กำหนด behavior ฝั่ง internal admin/web operation
- ไฟล์นี้กำหนด contract ระหว่างสองฝั่ง เช่น trigger, receiver, result และ traceability เพื่อไม่ให้ scope ปนกัน

## 2. Source Documents

| Area | Source |
| --- | --- |
| FO baseline | `FrontOffice/README_MODULE_INDEX.md` |
| FO admin boundary | `FrontOffice/18_ADMIN_SCOPE_NOTE.md` |
| BO baseline | `BackOffice/BO_MASTER_BASELINE.md` |
| BO module index | `BackOffice/README_MODULE_INDEX.md` |
| BO legacy sources | `BackOffice/BO_PRD.md`, `BackOffice/BO_Spec.md`, `BackOffice/BO_Spec_Completion_Addendum.md` |

## 3. Ownership Rules

| Rule | Description |
| --- | --- |
| FO owns user experience | FO PRD เป็นเจ้าของ screen, copy, empty/error state, navigation และ user-facing behavior |
| BO owns admin operation | BO PRD เป็นเจ้าของ queue, review tool, admin permission, internal action, export และ audit |
| Integration map owns handoff | ไฟล์นี้เป็นเจ้าของ cross-system trigger, receiver, result และ traceability |
| No duplicate control scope | ห้ามเขียน admin controls เป็น FO mobile feature และไม่ควรขยาย mobile UX detail ใน BO ยกเว้นจำเป็นต่อ BO impact |
| Cross-system changes need two references | Requirement ที่กระทบทั้ง FO และ BO ต้อง link ไปยัง source ของทั้งสองฝั่ง |

## 4. Integration Flow Map

| ID | FO Trigger / Surface | BO Receiver / Action | FO Result After BO Action | Primary FO Source | Primary BO Source | Phase |
| --- | --- | --- | --- | --- | --- | --- |
| INT-001 | User reports asset | Moderation queue รับ reported asset; Admin flag, hide, remove หรือ resolve report ได้ | Asset ยังไม่หายทันทีจนกว่า moderation จะดำเนินการ หลัง BO remove/hide asset หายจาก Feed, Search, public Profile, Watch Alert matches และ public Asset Detail | `15_TRUST_SAFETY_MODULE.md`, `04_ASSET_MANAGEMENT_MODULE.md`, `05_ASSET_DETAIL_MODULE.md` | `BO_MASTER_BASELINE.md`, `BackOffice/04_ASSET_MANAGEMENT_MODULE.md` | 1 |
| INT-002 | User reports user/profile | BO review reported user และ suspend, ban หรือ clear report ได้ | Suspended/banned user login ไม่ได้ และ public surfaces ต้องไม่ expose unavailable profile/actions ตาม FO rules | `15_TRUST_SAFETY_MODULE.md`, `06_PROFILE_MODULE.md` | `BO_MASTER_BASELINE.md`, User Management | 1 |
| INT-003 | User reports comment/reply | BO comment moderation queue review content | Hidden/removed comment หายจาก Asset Detail หรือแสดง deleted/unavailable state ตาม FO UX policy | `11_SOCIAL_MODULE.md`, `05_ASSET_DETAIL_MODULE.md`, `15_TRUST_SAFETY_MODULE.md` | `BackOffice/10_SOCIAL_INTERACTION_MODULE.md` | 2 |
| INT-004 | User reports Board article/content | BO content/moderation view review Board content | Article ยังอยู่จนกว่า BO action; archived/removed article หายจาก Board/Search/Category และ direct link แสดง unavailable behavior | `12_BOARD_MODULE.md`, `15_TRUST_SAFETY_MODULE.md` | `BackOffice/05_CONTENT_BOARD_MODULE.md` | 1 |
| INT-005 | User creates Sale asset | BO asset list รับ asset เพื่อ review/search/report visibility | Asset แสดงใน Feed, Search, Owner Profile, Viewer Profile ถ้า status และ moderation อนุญาต | `04_ASSET_MANAGEMENT_MODULE.md`, `02_FEED_MODULE.md`, `03_SEARCH_FILTER_MODULE.md` | `BackOffice/04_ASSET_MANAGEMENT_MODULE.md` | 1 |
| INT-006 | User creates Show asset | BO review asset และ force status ได้ตามสิทธิ์ | Asset แสดงใน public profile/detail แต่ไม่ขึ้น marketplace Feed/Search/Watch Alert เว้นแต่ FO decision เปลี่ยน | `04_ASSET_MANAGEMENT_MODULE.md`, `05_ASSET_DETAIL_MODULE.md`, `06_PROFILE_MODULE.md` | `BackOffice/04_ASSET_MANAGEMENT_MODULE.md` | 1 |
| INT-007 | User creates Hide asset | BO review owner-only asset ได้ตาม permission | Asset เห็นเฉพาะ owner ใน FO; public users ไม่เห็น | `04_ASSET_MANAGEMENT_MODULE.md`, `06_PROFILE_MODULE.md` | `BackOffice/04_ASSET_MANAGEMENT_MODULE.md` | 1 |
| INT-008 | User marks asset Sold | BO review sold asset และ sale history ได้ตาม Admin Permission | Asset ย้ายไป owner Sold tab, แก้จาก FO ไม่ได้ และยังใช้สำหรับ owner history/admin review | `04_ASSET_MANAGEMENT_MODULE.md`, `14_PORTFOLIO_MODULE.md` | `BackOffice/04_ASSET_MANAGEMENT_MODULE.md` | 1 |
| INT-009 | BO force changes asset status | BO เขียน audited status change | FO visibility update ตาม status ใหม่ทันทีหรือผ่าน sync timing ที่กำหนด | `00_GLOBAL_RULES_MODULE.md`, `04_ASSET_MANAGEMENT_MODULE.md` | `BackOffice/04_ASSET_MANAGEMENT_MODULE.md`, Audit Log | 1 |
| INT-010 | FO Board displays articles | BO Admin create, preview, publish, schedule, archive articles | Published/scheduled articles แสดงเมื่อเข้าเงื่อนไข; archived articles หายจาก Board/Search/Category | `12_BOARD_MODULE.md` | `BackOffice/05_CONTENT_BOARD_MODULE.md` | 1 |
| INT-011 | FO Board categories and banners | BO จัดการ active categories และ banners | Active categories/banners แสดงใน FO; inactive/expired items หายจาก FO | `12_BOARD_MODULE.md` | `BackOffice/05_CONTENT_BOARD_MODULE.md` | 1 |
| INT-012 | FO Add Asset/Search uses brand/model | BO Admin จัดการ active status ของ brand/model/reference | Active brand/model/reference แสดงใน autocomplete/filter; inactive data หยุด new selection และ alert trigger ใหม่ | `03_SEARCH_FILTER_MODULE.md`, `04_ASSET_MANAGEMENT_MODULE.md` | `BackOffice/06_MARKET_DATA_MODULE.md` | 1 |
| INT-013 | FO Watch Price Index / Asset Value uses price data | BO Admin update price index | FO price index และ owner asset value dashboard ใช้ active price data ล่าสุด | `10_WATCH_ALERT_MODULE.md`, `14_PORTFOLIO_MODULE.md`, `16_INTEGRATIONS_MODULE.md` | `BackOffice/06_MARKET_DATA_MODULE.md` | 1 |
| INT-014 | FO directory surfaces show shops/services | BO Admin จัดการ directory item status และ fields | Active directory items แสดงใน FO เมื่อ FO Directory route/scope เปิดใช้งาน; inactive items หายจาก FO | FO navigation/menu specs, future directory scope notes | `BackOffice/07_DIRECTORY_MODULE.md` | 1 |
| INT-015 | User makes offer | BO Offer list รับ offer lifecycle record | Pending offer แสดงใน FO chat/incoming offer surfaces จนกว่าจะ accepted, rejected, cancelled, expired หรือ invalidated | `08_OFFER_MODULE.md`, `07_CHAT_MODULE.md` | `BackOffice/09_OFFER_CHAT_MODULE.md` | 2 |
| INT-016 | Owner accepts/declines offer | BO trace offer, chat และ notification delivery ได้; `Decline` action ต้องเปลี่ยน status เป็น `Rejected` | FO offer/chat state update; notification ส่งไป buyer ตาม FO notification rules | `08_OFFER_MODULE.md`, `07_CHAT_MODULE.md`, `09_NOTIFICATION_MODULE.md` | `BackOffice/09_OFFER_CHAT_MODULE.md`, Notifications | 2 |
| INT-017 | Asset removed/sold while offer pending | BO/system invalidates impacted offers | FO แสดง offer unavailable/invalidated และเอาออกจาก active pending flows | `08_OFFER_MODULE.md`, `04_ASSET_MANAGEMENT_MODULE.md` | `BackOffice/09_OFFER_CHAT_MODULE.md`, `BackOffice/04_ASSET_MANAGEMENT_MODULE.md` | 2 |
| INT-018 | User sends chat message or attachment | BO review reported chat และ attachment scan status ได้ | FO เก็บ chat history ตาม rule; removed messages หายหรือแสดง removed state | `07_CHAT_MODULE.md`, `15_TRUST_SAFETY_MODULE.md` | `BackOffice/09_OFFER_CHAT_MODULE.md` | 2 |
| INT-019 | User likes/favorites asset | BO รายงาน aggregate like/favorite analytics | FO Favorites tab sync like/unlike state; BO ไม่แก้ individual record ยกเว้น Admin และมี policy/audit ชัดเจน | `11_SOCIAL_MODULE.md`, `06_PROFILE_MODULE.md` | `BackOffice/10_SOCIAL_INTERACTION_MODULE.md`, `BackOffice/15_REPORTS_ANALYTICS_MODULE.md` | 2 |
| INT-020 | User follows/unfollows another user | BO รายงาน aggregate follow analytics และ relation context | FO Following feed/profile relationship update; block relation ต้องไม่ถูกใช้ใน Following Feed | `11_SOCIAL_MODULE.md`, `06_PROFILE_MODULE.md`, `02_FEED_MODULE.md` | `BackOffice/10_SOCIAL_INTERACTION_MODULE.md`, `BackOffice/15_REPORTS_ANALYTICS_MODULE.md` | 2 |
| INT-021 | User creates Watch Alert from search | BO ดู criteria, trigger history และ disable abusive alerts ได้ | Enabled alert trigger notification ได้และเปิด Watch Alert Result List; disabled alert หยุด trigger ใหม่ | `10_WATCH_ALERT_MODULE.md`, `03_SEARCH_FILTER_MODULE.md`, `09_NOTIFICATION_MODULE.md` | `BackOffice/11_WATCH_ALERT_MODULE.md` | 2 |
| INT-022 | User opens Help / sends support request | BO Support queue รับ ticket หรือ manual ticket จาก LINE/Phone/Email | FO contact-only mode เปิดช่องทางติดต่อ; ถ้า expose ticket history ในอนาคต FO แสดง submitted/updated ticket state และ support replies เก็บใน ticket history | `13_SETTINGS_MODULE.md` | `BackOffice/12_HELP_SUPPORT_MODULE.md` | 2 |
| INT-023 | User requests account deletion | BO รับ deletion request, ตรวจ pending offer, track 30-day grace period และ archive/anonymization | FO delete สำเร็จแล้วต้อง revoke session, login ไม่ได้, public profile/assets ถูกซ่อน; BO block archive/anonymization ถ้ายังมี pending offers | `13_SETTINGS_MODULE.md`, `08_OFFER_MODULE.md` | `BackOffice/13_ACCOUNT_DELETION_MODULE.md`, `BackOffice/09_OFFER_CHAT_MODULE.md` | 2 |
| INT-024 | FO notification center receives system events | BO/system notification triggers จัดการ template, enablement, delivery log | Supported FO notifications แสดงพร้อม destination ที่ถูกต้อง; disabled type ไม่ส่ง notification ใหม่; Chat/New Message ไม่เข้า Notification Center | `09_NOTIFICATION_MODULE.md`, `00_NAVIGATION_AND_CROSS_MODULE_FLOW.md` | `BackOffice/14_NOTIFICATIONS_MODULE.md` | 2 |
| INT-025 | BO sends broadcast notification | BO Broadcast สร้าง target audience, approval, schedule, delivery log | FO users ใน target audience ได้รับ push/deep link ตาม destination rules; in-app generic Broadcast ต้องรอ master decision ก่อนเพิ่มใน FO Notification Center | `09_NOTIFICATION_MODULE.md`, `00_NAVIGATION_AND_CROSS_MODULE_FLOW.md` | `BackOffice/14_NOTIFICATIONS_MODULE.md` | 2 |
| INT-026 | Admin performs sensitive action | BO audit log บันทึก action; Admin Settings ควบคุม permission/system setting changes | FO result ขึ้นกับ action; audit log ไม่แสดงใน FO | `18_ADMIN_SCOPE_NOTE.md` | `BackOffice/08_AUDIT_LOG_MODULE.md`, `BackOffice/16_ADMIN_SETTINGS_MODULE.md` | 1/3 |

## 5. Shared State Contracts

### 5.1 User Status

| Status | BO Meaning | FO Required Behavior |
| --- | --- | --- |
| Active | User ใช้ FO ได้ปกติ | Login และ action ปกติทำได้ |
| Suspended | จำกัดสิทธิ์ชั่วคราวโดย Admin | Login blocked หรือ session revoked ตาม auth implementation |
| Banned | จำกัดถาวรจนกว่า Admin จะเปลี่ยน | Login blocked และสร้าง activity ใหม่ไม่ได้ |
| Soft Deleted / Archived | Account deleted/archive workflow สำเร็จ | Login blocked; public profile/assets hidden หรือ anonymized ตาม privacy policy |

### 5.2 Asset Status

| Status | BO Meaning | FO Required Behavior |
| --- | --- | --- |
| Sale | Marketplace listing | แสดงใน Feed, Search, Owner Profile, Viewer Profile, Asset Detail ถ้าไม่ถูก moderated |
| Show | Public collection asset | แสดงใน profile/detail ตาม FO rule; ไม่ขึ้น marketplace Feed/Search/Watch Alert |
| Hide | Owner-only asset | เห็นเฉพาะ owner |
| Sold | Sold history item | เห็นเฉพาะ owner ใน Sold tab; แก้จาก FO ไม่ได้; admin review ได้ |
| Removed / Hidden | Admin-moderated unavailable asset | ซ่อนจาก public FO surfaces; direct link แสดง unavailable behavior |

### 5.3 Content Status

| Status | BO Meaning | FO Required Behavior |
| --- | --- | --- |
| Draft | Unpublished article ภายใน | ไม่แสดงใน FO |
| Scheduled | รอ publish time | แสดงเมื่อถึงเวลา |
| Published | Live article | แสดงใน Board, category, search, detail |
| Archived | Removed from public listing | ซ่อนจาก Board/Search/Category; direct link ใช้ unavailable/redirect behavior ตาม FO UX |

### 5.4 Offer Status

| Status | BO Meaning | FO Required Behavior |
| --- | --- | --- |
| Pending | รอ owner ตอบ | แสดง active pending offer |
| Accepted | Owner accepted | แสดง accepted state และ route ไป chat/next action |
| Rejected | Owner กด `Decline` แล้ว offer ถูกปฏิเสธ | ออกจาก incoming pending state; history ยังอยู่; FO button/copy ใช้ `Decline` ได้ แต่ status/API/BO ใช้ `Rejected`; legacy `Declined` ต้อง normalize เป็น `Rejected` |
| Cancelled | Buyer cancelled before response | ไม่เป็น active pending |
| Expired | Offer timed out หรือ force expired | accept/decline ไม่ได้ |
| Invalidated | Asset/user state ทำให้ offer ใช้ไม่ได้ | แสดง unavailable/invalidated state |

## 6. Audit Requirements For Cross-System Flows

BO action ที่เปลี่ยน behavior บน FO ต้องสร้าง audit event พร้อมข้อมูลอย่างน้อย:

- Admin identifier
- Admin Access
- Action type
- Target entity type
- Target entity ID
- Before value
- After value
- Reason/note เมื่อจำเป็น
- IP address หรือ session context ถ้ามี
- Timestamp

Minimum audited action groups:

- User suspend/ban/unban/soft delete/archive
- Asset flag/unflag/remove/force status
- Comment hide/unhide/delete
- Chat message remove/export
- Offer force expire/invalidate/export
- Article publish/schedule/archive/feature/banner activate/deactivate
- Brand/model/price index/directory activate/inactivate
- Watch Alert disable/enable
- Support ticket assign/reply/resolve/close
- Notification template update/broadcast send/retry

## 7. Acceptance Criteria

| ID | Criteria |
| --- | --- |
| AC-INT-001 | FO และ BO docs แยก folder และไม่ duplicate implementation scope กัน |
| AC-INT-002 | FO flow ที่สร้าง admin-reviewable data ต้องมี BO receiver หรือ backlog item ใน map นี้ |
| AC-INT-003 | BO action ที่เปลี่ยน FO behavior ต้องมี FO result ระบุใน map นี้ |
| AC-INT-004 | Reported content ไม่หายจาก FO ทันที เว้นแต่มี policy/system rule ชัดเจน |
| AC-INT-005 | Admin moderation result ต้อง sync ไป FO public surfaces อย่างสม่ำเสมอ |
| AC-INT-006 | Cross-system destructive หรือ sensitive actions ต้อง audit-log |
| AC-INT-007 | Phase 1 BO modules ครอบคลุม launch-critical FO dependencies: user, asset, board content, market data, directory, audit |
| AC-INT-008 | Phase 2 BO modules ครอบคลุม interaction/operation dependencies: offer/chat, social, watch alert, support, deletion, notifications, reports |

## 8. Open Decisions

| ID | Decision Needed | Impact |
| --- | --- | --- |
| INT-DEC-001 | Sync timing ที่แน่นอนสำหรับ BO moderation changes ไป FO surfaces | กระทบ API/cache invalidation |
| INT-DEC-002 | Direct-link behavior สำหรับ removed assets/articles | กระทบ FO unavailable copy และ routing |
| INT-DEC-003 | Chat/offer retention period | กระทบ BO export, deletion archive และ privacy handling |
| INT-DEC-004 | FO จะแสดง support ticket history หรือแค่ submitted state | กระทบ Help & Support BO reply UX และ FO Settings UX |
| INT-DEC-005 | Directory V1 activation level | กระทบว่า BO Directory เป็น launch-critical หรือ placeholder-only |
