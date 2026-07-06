# TukDaeng Module PRD Index

อ้างอิงหลักจาก [TukDaeng_Master_Product_Definition.md](TukDaeng_Master_Product_Definition.md)

**Current Baseline Version:** `FO-PRD-v1.2`
**Version Registry:** [DOCUMENT_VERSION.md](DOCUMENT_VERSION.md)

---

# 1. Purpose

ไฟล์นี้เป็น index สำหรับชุดเอกสาร PRD ของ TukDaeng App หลังแตก master เป็นรายโมดูลแล้ว ใช้บอกทีม Product, UX, Dev และ QA ว่าแต่ละไฟล์ควรใช้เมื่อไร และควรอ่านลำดับไหนก่อนส่งต่อ implementation หรือ design sign-off

สำหรับรอบส่งต่อ Dev วันที่ 2026-06-22 ให้ถือว่าชุดเอกสารนี้เป็น baseline ใหม่ทั้งชุดสำหรับแทนเอกสารเก่าที่ Dev เคยใช้ก่อนหน้า ไม่ใช่เฉพาะรายการที่เพิ่งเพิ่มในวันเดียวกัน

เมื่อส่งต่อ Dev / QA / Figma ให้อ้างอิง version `FO-PRD-v1.2` คู่กับ branch `docs-frontoffice-spec-updates`

หมายเหตุรอบ 2026-07-02: `FO-PRD-v1.2` เพิ่ม error-state UI copy catalog สำหรับ final Figma-to-Dev handoff โดย lock copy และ retry scope ของ Feed refresh failure, Feed load-more failure, Feed image failure, owner fallback, section error, unavailable state และ empty/error pattern หลัก

หมายเหตุรอบ 2026-06-23: `FO-PRD-v1.1` supersede `FO-PRD-v1.0` เฉพาะ decision update เรื่อง Asset Detail / Social comment model โดยให้รองรับ IG-style one-level replies ใต้ comment หลัก, ใช้ `View more replies` สำหรับ collapsed replies ชั้นเดียว และไม่รองรับ multi-level nested thread

# 2. Source Of Truth Order

หากเอกสารหรือ Figma มีเงื่อนไขไม่ตรงกัน ให้ตัดสินตามลำดับนี้:

1. [TukDaeng_Master_Product_Definition.md](TukDaeng_Master_Product_Definition.md)
2. [00_GLOBAL_RULES_MODULE.md](00_GLOBAL_RULES_MODULE.md)
3. [00_NAVIGATION_AND_CROSS_MODULE_FLOW.md](00_NAVIGATION_AND_CROSS_MODULE_FLOW.md)
4. PRD รายโมดูล `01-18`
5. [Figma_Gap_Checklist_Against_Master.md](Figma_Gap_Checklist_Against_Master.md)
6. Figma annotation / legacy documents

# 3. Recommended Reading Path

| Step | File | Use For |
| --- | --- | --- |
| 1 | [DOCUMENT_VERSION.md](DOCUMENT_VERSION.md) | Baseline version and version history |
| 2 | [TukDaeng_Master_Product_Definition.md](TukDaeng_Master_Product_Definition.md) | Product source of truth |
| 3 | [00_GLOBAL_RULES_MODULE.md](00_GLOBAL_RULES_MODULE.md) | Global visibility, status, lifecycle, privacy, state rules |
| 4 | [00_NAVIGATION_AND_CROSS_MODULE_FLOW.md](00_NAVIGATION_AND_CROSS_MODULE_FLOW.md) | Cross-module routing, deep link, notification destination |
| 5 | Module PRD `01-18` | Functional and QA detail by module |
| 6 | [Figma_Gap_Checklist_Against_Master.md](Figma_Gap_Checklist_Against_Master.md) | Figma cleanup and design QA checklist |
| 7 | [FIGMA_UX_CLEANUP_TASK_BREAKDOWN.md](FIGMA_UX_CLEANUP_TASK_BREAKDOWN.md) | Figma cleanup task grouping and assignment plan |
| 8 | [DEV_BASELINE_HANDOFF_2026-06-22.md](DEV_BASELINE_HANDOFF_2026-06-22.md) | Dev baseline package for replacing old implementation reference |
| 9 | [DEV_IMPLEMENTATION_CHECKLIST.md](DEV_IMPLEMENTATION_CHECKLIST.md) | Dev implementation checklist by module |
| 10 | [DEV_CHAT_IMPLEMENTATION_CHECKLIST.md](DEV_CHAT_IMPLEMENTATION_CHECKLIST.md) | Focused checklist for Dev working only on Chat |
| 11 | [ERROR_STATE_UI_COPY_CATALOG.md](ERROR_STATE_UI_COPY_CATALOG.md) | Final error-state copy, fallback behavior, and retry scope for Figma-to-Dev handoff |
| 12 | [QA_TEST_SCENARIO_CHECKLIST.md](QA_TEST_SCENARIO_CHECKLIST.md) | QA scenario checklist and regression sign-off |

พฤติกรรมที่เชื่อมระหว่าง FO และ BO แยก trace ไว้ใน [../ProjectAdmin/FO_BO_INTEGRATION_MAP.md](../ProjectAdmin/FO_BO_INTEGRATION_MAP.md) ให้ใช้ไฟล์นั้นสำหรับ handoff mapping และคงรายละเอียด screen behavior / copy ไว้ใน Front Office module PRDs

# 4. Module Index

| No. | File | Scope |
| --- | --- | --- |
| 00 | [00_GLOBAL_RULES_MODULE.md](00_GLOBAL_RULES_MODULE.md) | Global state, visibility, lifecycle, privacy, trust impact |
| 00 | [00_NAVIGATION_AND_CROSS_MODULE_FLOW.md](00_NAVIGATION_AND_CROSS_MODULE_FLOW.md) | Navigation, deep link, notification destination, cross-module fallback |
| 01 | [01_AUTHENTICATION_MODULE.md](01_AUTHENTICATION_MODULE.md) | Sign up, sign in, OTP, SSO, password, session |
| 02 | [02_FEED_MODULE.md](02_FEED_MODULE.md) | Marketplace Feed, tabs, card, Sale-only visibility |
| 03 | [03_SEARCH_FILTER_MODULE.md](03_SEARCH_FILTER_MODULE.md) | Search, filters, sort, save filter to Watch Alert |
| 04 | [04_ASSET_MANAGEMENT_MODULE.md](04_ASSET_MANAGEMENT_MODULE.md) | Add/Edit/Delete Asset, status, gallery, Sold flow |
| 05 | [05_ASSET_DETAIL_MODULE.md](05_ASSET_DETAIL_MODULE.md) | Asset Detail, viewer/owner state, comments, offer/chat entry |
| 06 | [06_PROFILE_MODULE.md](06_PROFILE_MODULE.md) | Owner/Public Profile, tabs, follow, portfolio entry |
| 07 | [07_CHAT_MODULE.md](07_CHAT_MODULE.md) | Chat list/detail, asset reference, block/report entry |
| 08 | [08_OFFER_MODULE.md](08_OFFER_MODULE.md) | Make offer, offer status, accepted/rejected/cancelled flow |
| 09 | [09_NOTIFICATION_MODULE.md](09_NOTIFICATION_MODULE.md) | Notification types and destinations |
| 10 | [10_WATCH_ALERT_MODULE.md](10_WATCH_ALERT_MODULE.md) | Watch Alert create/list/result/notification |
| 11 | [11_SOCIAL_MODULE.md](11_SOCIAL_MODULE.md) | Like, favorite sync, comment, follow, share |
| 12 | [12_BOARD_MODULE.md](12_BOARD_MODULE.md) | Article board, categories, read/like/share |
| 13 | [13_SETTINGS_MODULE.md](13_SETTINGS_MODULE.md) | Settings, profile edit, language, theme, legal, delete account |
| 14 | [14_PORTFOLIO_MODULE.md](14_PORTFOLIO_MODULE.md) | Owner-only portfolio value, sold history boundary |
| 15 | [15_TRUST_SAFETY_MODULE.md](15_TRUST_SAFETY_MODULE.md) | Block, report, moderation handoff, Apple compliance |
| 16 | [16_INTEGRATIONS_MODULE.md](16_INTEGRATIONS_MODULE.md) | Apple, Google, FCM, CDN, Watch Price API |
| 17 | [17_NON_FUNCTIONAL_REQUIREMENTS.md](17_NON_FUNCTIONAL_REQUIREMENTS.md) | Performance, security, localization, accessibility |
| 18 | [18_ADMIN_SCOPE_NOTE.md](18_ADMIN_SCOPE_NOTE.md) | Back Office boundary, admin moderation, audit trail |

# 5. Figma Review Workflow

1. ใช้ [Figma_Gap_Checklist_Against_Master.md](Figma_Gap_Checklist_Against_Master.md) เป็น checklist หลัก
2. แก้ `Must Fix` ก่อน เพราะเป็นรายการที่ conflict กับ master โดยตรง
3. แก้ `High` ก่อนส่ง Dev / QA
4. ใช้ `Medium` เป็น checklist ก่อน design sign-off
5. รายการ `Needs Decision` ต้องกลับไปตัดสินใน master หรือ product decision log ก่อน implement
6. ใช้ [FIGMA_UX_CLEANUP_TASK_BREAKDOWN.md](FIGMA_UX_CLEANUP_TASK_BREAKDOWN.md) เพื่อแบ่งงานเป็น wave และ assign owner

# 6. Handoff Readiness

ชุดเอกสารถือว่าพร้อมส่งต่อเมื่อ:

- ทุก module มี Master Alignment Summary
- ทุก module มี Figma Gap Checklist
- Acceptance Criteria ครบตาม master baseline
- Checklist รวมไม่มี section legacy ที่ซ้ำกับ module-level checklist
- Figma แก้ `Must Fix` และ `High` ครบ หรือมี decision note รองรับ
- Dev / QA รับทราบ source-of-truth order ในไฟล์นี้
- Dev ใช้ [DEV_IMPLEMENTATION_CHECKLIST.md](DEV_IMPLEMENTATION_CHECKLIST.md) เป็น checklist ก่อนแตก ticket implementation
- QA ใช้ [QA_TEST_SCENARIO_CHECKLIST.md](QA_TEST_SCENARIO_CHECKLIST.md) เป็น regression/sign-off checklist

# 7. Product Decision Review

รายการนี้เป็นข้อสรุปรีวิวเชิง product สำหรับประเด็นที่ยังค้างจาก PRD ชุด `00-18` ใช้เป็น recommendation สำหรับ V1 ก่อนนำไป approve และ update master / Figma / PRD ที่เกี่ยวข้อง

| Decision Item | Recommended V1 Decision | Rationale | Required Follow-up |
| --- | --- | --- | --- |
| Asset สถานะ `Show` จะให้ Make Offer / Chat / Contact Seller ได้ไหม | ให้ได้ใน V1 จาก Asset Detail / Public Profile detail entry; `Show` ยังไม่ขึ้น Feed, Search หรือ Watch Alert | `Show` เป็น public collection/detail และอาจมีผู้สนใจสอบถามหรือเสนอราคาได้ แต่ยังต้องไม่ถูกจัดเป็น marketplace listing ใน Feed/Search/Watch Alert | Master และ module PRD อัปเดตแล้ว; Figma ต้องแสดง Offer/Contact Seller บน `Show` พร้อม note ว่าไม่ขึ้น marketplace surfaces |
| Post-block chat behavior | เก็บ chat history เดิมให้อ่านได้ แต่ปิดการส่งข้อความใหม่และปิดการสร้าง offer/chat ใหม่ระหว่างคู่ที่ block กัน | Block ต้องซ่อน asset จาก public surfaces; การเก็บ history ช่วย preserve record ส่วนการปิดข้อความใหม่ลด abuse risk | Master และ Chat / Trust Safety PRD อัปเดตแล้ว; Figma ต้องเพิ่ม blocked chat read-only state |
| Notification type นอก baseline เช่น chat/new message/moderation/account/system/market/price | ไม่อยู่ใน Front Office V1 Notification Center; supported types ยังคงเป็น Like, Comment, Follow, Offer, Watch Alert เท่านั้น | Master lock notification baseline ไว้ชัด และ Chat/New Message แจ้งเตือนเฉพาะในเมนู Chat ด้วย unread badge/count | ซ่อน type นอก baseline ใน Figma หรือย้ายเป็น Chat badge / Future / Back Office / master decision |
| Future menu items เช่น Watch Shops, Repair Shop, Auction Center, Consignment Center, Authentication Center | ไม่เปิดเป็น active menu ใน production V1; ถ้าต้องแสดงใน prototype ให้ mark เป็น Future / Placeholder ชัดเจน | Master ยังไม่สรุปเป็น functional scope หลัก และบางรายการอยู่ใน Phase 1 exclusions เช่น Auction / Live Selling / Watch Authentication | ปรับ Figma menu taxonomy และห้าม Dev implement เป็น active route จนกว่า master เพิ่ม scope |
| Full Back Office PRD | ยังไม่เริ่มจนกว่า FO baseline จะครบและ sign-off พร้อม; ตอนนี้ใช้ `18_ADMIN_SCOPE_NOTE.md` เป็น boundary ก่อน | Master ระบุ Admin ผ่าน Web Back Office เท่านั้น แต่ mobile app ต้องรู้ handoff เช่น Report, Moderation, Audit Trail; ไม่ควรปนกับ FO mobile PRD | หลัง FO master/module PRD, Figma cleanup, Dev checklist และ QA checklist นิ่งแล้ว ค่อยเปิด Back Office sprint และจัดทำ Full BO PRD แยก |

# 8. Remaining Decision Items

รายการที่ยังควรเก็บใน product decision log หลัง review รอบนี้:

- Delete Chat behavior แบบละเอียด: locked ใน Chat Module แล้ว คือซ่อนจาก Chat List เฉพาะฝั่งผู้กด ไม่ลบ server history ไม่มี restore UI และมี overflow menu/mute/delete copy ตาม Figma ล่าสุด
- Share channel implementation: recommendation คือ system share sheet พร้อม fallback copy public deep link และไม่สร้าง notification
- Article Comment / Report Article: locked แล้ว คือไม่เปิด Article Comment ใน FO V1; ใช้ UI label `Report article` และ map เข้า Trust & Safety `Report Board Content`
- Delete Account retention / grace period policy: locked V1 rule คือ soft delete/deactivate หลัง confirm, revoke session ทันที, แสดง `Account deletion started`, กลับไป Sign In / pre-auth และใช้ grace period 30 วันก่อน hard delete/anonymization ตาม policy
- Full Back Office PRD: เริ่มหลัง FO baseline, Figma cleanup, Dev checklist และ QA checklist ครบ/นิ่งแล้วเท่านั้น
