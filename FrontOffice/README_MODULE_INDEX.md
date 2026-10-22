# TukDaeng Module PRD Index

อ้างอิงหลักจาก [TukDaeng_Master_Product_Definition.md](TukDaeng_Master_Product_Definition.md)

**Current Baseline Version:** `FO-PRD-v1.9`
**Version Registry:** [DOCUMENT_VERSION.md](DOCUMENT_VERSION.md)

> **Sync note (FO-PRD-v1.9, 2026-10-22):** index นี้ sync ตาม baseline ใหม่ที่ lock ด้วย `Prototypes/fo-flow/index.html` เป็น source of truth (module specs ที่ rewrite แล้ว + master §16 Sync Decision Log S-01–S-29) — รายการ `หมายเหตุรอบ` ด้านล่างเป็น version history เดิม เก็บไว้เพื่อ traceability เท่านั้น ไม่ใช่ current-state rule

---

# 1. Purpose

ไฟล์นี้เป็น index สำหรับชุดเอกสาร PRD ของ TukDaeng App หลังแตก master เป็นรายโมดูลแล้ว ใช้บอกทีม Product, UX, Dev และ QA ว่าแต่ละไฟล์ควรใช้เมื่อไร และควรอ่านลำดับไหนก่อนส่งต่อ implementation หรือ design sign-off

สำหรับรอบส่งต่อ Dev วันที่ 2026-06-22 ให้ถือว่าชุดเอกสารนี้เป็น baseline ใหม่ทั้งชุดสำหรับแทนเอกสารเก่าที่ Dev เคยใช้ก่อนหน้า ไม่ใช่เฉพาะรายการที่เพิ่งเพิ่มในวันเดียวกัน

เมื่อส่งต่อ Dev / QA ให้อ้างอิง version `FO-PRD-v1.9` คู่กับ branch `docs-frontoffice-spec-updates`

หมายเหตุรอบ 2026-07-16: `FO-PRD-v1.3` เพิ่ม clarification เรื่อง account suspension/ban โดย V1 ไม่มี `Restricted` account state, Suspended/Banned ต้องเข้า main app ไม่ได้, session ต้องถูก revoke/block เมื่อ BO เปลี่ยนสถานะ, email เป็น primary channel สำหรับการแจ้ง suspend/ban และ FO Notification Center ไม่เพิ่ม Account Action type

หมายเหตุรอบ 2026-07-02: `FO-PRD-v1.2` เพิ่ม error-state UI copy catalog สำหรับ final Figma-to-Dev handoff โดย lock copy และ retry scope ของ Feed refresh failure, Feed load-more failure, Feed image failure, owner fallback, section error, unavailable state และ empty/error pattern หลัก

หมายเหตุรอบ 2026-06-23: `FO-PRD-v1.1` supersede `FO-PRD-v1.0` เฉพาะ decision update เรื่อง Asset Detail / Social comment model โดยให้รองรับ IG-style one-level replies ใต้ comment หลัก, ใช้ `View more replies` สำหรับ collapsed replies ชั้นเดียว และไม่รองรับ multi-level nested thread

# 2. Source Of Truth Order

หากเอกสารมีเงื่อนไขไม่ตรงกัน ให้ตัดสินตามลำดับนี้:

1. [TukDaeng_Master_Product_Definition.md](TukDaeng_Master_Product_Definition.md)
2. [00_GLOBAL_RULES_MODULE.md](00_GLOBAL_RULES_MODULE.md)
3. [00_NAVIGATION_AND_CROSS_MODULE_FLOW.md](00_NAVIGATION_AND_CROSS_MODULE_FLOW.md)
4. PRD รายโมดูล `01-18`
5. Legacy documents

# 3. Recommended Reading Path

| Step | File | Use For |
| --- | --- | --- |
| 1 | [DOCUMENT_VERSION.md](DOCUMENT_VERSION.md) | Baseline version and version history |
| 2 | [TukDaeng_Master_Product_Definition.md](TukDaeng_Master_Product_Definition.md) | Product source of truth |
| 3 | [00_GLOBAL_RULES_MODULE.md](00_GLOBAL_RULES_MODULE.md) | Global visibility, status, lifecycle, privacy, state rules |
| 4 | [00_NAVIGATION_AND_CROSS_MODULE_FLOW.md](00_NAVIGATION_AND_CROSS_MODULE_FLOW.md) | Cross-module routing, deep link, notification destination |
| 5 | Module PRD `01-18` | Functional and QA detail by module |
| 6 | [DEV_BASELINE_HANDOFF_2026-06-22.md](DEV_BASELINE_HANDOFF_2026-06-22.md) | Dev baseline package for replacing old implementation reference |
| 7 | [DEV_IMPLEMENTATION_CHECKLIST.md](DEV_IMPLEMENTATION_CHECKLIST.md) | Dev implementation checklist by module |
| 8 | [DEV_CHAT_IMPLEMENTATION_CHECKLIST.md](DEV_CHAT_IMPLEMENTATION_CHECKLIST.md) | Focused checklist for Dev working only on Chat |
| 9 | [ERROR_STATE_UI_COPY_CATALOG.md](ERROR_STATE_UI_COPY_CATALOG.md) | Final error-state copy, fallback behavior, and retry scope for Dev handoff |
| 10 | [QA_TEST_SCENARIO_CHECKLIST.md](QA_TEST_SCENARIO_CHECKLIST.md) | QA scenario checklist and regression sign-off |

# 4. Module Index

| No. | File | Scope |
| --- | --- | --- |
| 00 | [00_GLOBAL_RULES_MODULE.md](00_GLOBAL_RULES_MODULE.md) | Global state, visibility, lifecycle, privacy, trust impact |
| 00 | [00_NAVIGATION_AND_CROSS_MODULE_FLOW.md](00_NAVIGATION_AND_CROSS_MODULE_FLOW.md) | Navigation, deep link, notification destination, cross-module fallback |
| 01 | [01_AUTHENTICATION_MODULE.md](01_AUTHENTICATION_MODULE.md) | Sign up, sign in, OTP, SSO, password, session |
| 02 | [02_FEED_MODULE.md](02_FEED_MODULE.md) | Post-centric feed, tabs, post card, post menus, create composer |
| 03 | [03_SEARCH_FILTER_MODULE.md](03_SEARCH_FILTER_MODULE.md) | Search, filters, Post Viewer, save filter to Watch Alert |
| 04 | [04_ASSET_MANAGEMENT_MODULE.md](04_ASSET_MANAGEMENT_MODULE.md) | Asset composer, status, gallery, Mark as Sold / Sale Record |
| 05 | [05_ASSET_DETAIL_MODULE.md](05_ASSET_DETAIL_MODULE.md) | Post Detail (เดิมเรียก Asset Detail), viewer/owner state, comments, Ask Seller entry |
| 06 | [06_PROFILE_MODULE.md](06_PROFILE_MODULE.md) | Owner/Public Profile, post-grid tabs, follow, portfolio entry |
| 07 | [07_CHAT_MODULE.md](07_CHAT_MODULE.md) | Chat list/room (user+item thread), post reference card, block/report entry |
| 09 | [09_NOTIFICATION_MODULE.md](09_NOTIFICATION_MODULE.md) | Alerts feed — 5 notification types and destinations |
| 10 | [10_WATCH_ALERT_MODULE.md](10_WATCH_ALERT_MODULE.md) | Watch Alert shared create sheet, list, notification → Post Viewer |
| 11 | [11_SOCIAL_MODULE.md](11_SOCIAL_MODULE.md) | Like, comments, share, save/collections, Wish List, follow, report/block entries |
| 12 | [12_BOARD_MODULE.md](12_BOARD_MODULE.md) | Editorial magazine board — hero featured, Latest list, categories, article search, detail like/share |
| 13 | [13_SETTINGS_MODULE.md](13_SETTINGS_MODULE.md) | Settings, profile edit, language, theme, legal, delete account |
| 14 | [14_PORTFOLIO_MODULE.md](14_PORTFOLIO_MODULE.md) | Owner-only portfolio — Total invested dashboard, asset value detail, sold history, mark-as-sold |
| 15 | [15_TRUST_SAFETY_MODULE.md](15_TRUST_SAFETY_MODULE.md) | Block, report, moderation handoff, Apple compliance |
| 16 | [16_INTEGRATIONS_MODULE.md](16_INTEGRATIONS_MODULE.md) | Apple, Google, FCM, CDN, Watch Price API |
| 17 | [17_NON_FUNCTIONAL_REQUIREMENTS.md](17_NON_FUNCTIONAL_REQUIREMENTS.md) | Performance, security, localization, accessibility |
| 18 | [18_ADMIN_SCOPE_NOTE.md](18_ADMIN_SCOPE_NOTE.md) | Back Office boundary, admin moderation, audit trail |

# 5. Handoff Readiness

ชุดเอกสารถือว่าพร้อมส่งต่อเมื่อ:

- ทุก module มี Master Alignment Summary
- Acceptance Criteria ครบตาม master baseline
- Checklist รวมไม่มี section legacy ที่ซ้ำกับ module-level checklist
- Dev / QA รับทราบ source-of-truth order ในไฟล์นี้
- Dev ใช้ [DEV_IMPLEMENTATION_CHECKLIST.md](DEV_IMPLEMENTATION_CHECKLIST.md) เป็น checklist ก่อนแตก ticket implementation
- QA ใช้ [QA_TEST_SCENARIO_CHECKLIST.md](QA_TEST_SCENARIO_CHECKLIST.md) เป็น regression/sign-off checklist

# 6. Product Decision Review

รายการนี้เป็นข้อสรุปรีวิวเชิง product สำหรับประเด็นที่ยังค้างจาก PRD ชุด `00-18` ใช้เป็น recommendation สำหรับ V1 ก่อนนำไป approve และ update master / PRD ที่เกี่ยวข้อง

| Decision Item | Recommended V1 Decision | Rationale | Required Follow-up |
| --- | --- | --- | --- |
| Asset สถานะ `Show` จะให้ Chat / Contact Seller ได้ไหม | ไม่ให้ใน baseline ปัจจุบัน — Chat เป็น listing-scoped เข้าได้ผ่าน `Ask Seller` บน sale post เท่านั้น (S-07/07_CHAT); `Show` ยังไม่ขึ้น Feed, Search หรือ Watch Alert | prototype ไม่มี chat entry บน `Show`; Chat ผูก user+item (listing) เสมอ จึงไม่มี user→user chat เปล่า ๆ — decision เดิมที่ให้ `Show` contact ได้ถูก supersede ตอน sync FO-PRD-v1.9 | Master และ module PRD อัปเดตแล้ว |
| Post-block chat behavior | เก็บ chat history เดิมให้อ่านได้ แต่ปิดการส่งข้อความใหม่และปิดการสร้าง chat ใหม่ระหว่างคู่ที่ block กัน | Block ต้องซ่อน asset จาก public surfaces; การเก็บ history ช่วย preserve record ส่วนการปิดข้อความใหม่ลด abuse risk | Master และ Chat / Trust Safety PRD อัปเดตแล้ว |
| Notification type นอก baseline เช่น chat/new message/moderation/account/market/price | ไม่อยู่ใน Front Office V1 Alerts feed (เดิมเรียก Notification Center); supported types = Like, Comment, Follow, Watch Alert + `system` (placeholder destination ตาม 09/S-17) | Master lock notification baseline ไว้ชัด และ Chat/New Message แจ้งเตือนเฉพาะในเมนู Chat ด้วย unread badge/count | ย้ายเป็น Chat badge / Future / Back Office / master decision |
| Future menu items เช่น Watch Shops, Repair Shop, Auction Center, Consignment Center, Authentication Center | ไม่เปิดเป็น active menu ใน production V1; ถ้าต้องแสดงใน prototype ให้ mark เป็น Future / Placeholder ชัดเจน | Master ยังไม่สรุปเป็น functional scope หลัก และบางรายการอยู่ใน Phase 1 exclusions เช่น Auction / Live Selling / Watch Authentication | ห้าม Dev implement เป็น active route จนกว่า master เพิ่ม scope |
| Full Back Office PRD | ยังไม่เริ่มจนกว่า FO baseline จะครบและ sign-off พร้อม; ตอนนี้ใช้ `18_ADMIN_SCOPE_NOTE.md` เป็น boundary ก่อน | Master ระบุ Admin ผ่าน Web Back Office เท่านั้น แต่ mobile app ต้องรู้ handoff เช่น Report, Moderation, Audit Trail; ไม่ควรปนกับ FO mobile PRD | หลัง FO master/module PRD, Dev checklist และ QA checklist นิ่งแล้ว ค่อยเปิด Back Office sprint และจัดทำ Full BO PRD แยก |

# 7. Remaining Decision Items

รายการที่ยังควรเก็บใน product decision log หลัง review รอบนี้:

- Delete Chat behavior แบบละเอียด: locked ใน Chat Module แล้ว คือซ่อนจาก Chat List เฉพาะฝั่งผู้กด ไม่ลบ server history ไม่มี restore UI และมี swipe actions/`chmenu` copy ตาม spec ล่าสุด
- Share channel implementation: locked แล้ว — Share เป็น member-only ทุก surface (guest เจอ Member Sheet, S-03) ใช้ in-app share sheet (ส่งให้เพื่อน + Messenger/Direct/LINE/Facebook + copy link) ไม่สร้าง notification; public deep link เป็น contract-only (prototype ไม่ครอบ)
- Article Comment / Report Article: locked แล้ว คือไม่เปิด Article Comment ใน FO V1; Report Article เป็น contract-only (S-04 — prototype menu dead) map เข้า Trust & Safety `Report Board Content`
- Delete Account retention / grace period policy: locked V1 rule คือ 2-page flow (terms → reason → password → scheduled → guest), revoke session ทันที และใช้ grace period 30 วันแบบ login-to-restore (S-02/S-27 — sign in ระหว่าง grace = คืนบัญชี) ก่อน hard delete/anonymization ตาม policy
- Full Back Office PRD: เริ่มหลัง FO baseline, Dev checklist และ QA checklist ครบ/นิ่งแล้วเท่านั้น
