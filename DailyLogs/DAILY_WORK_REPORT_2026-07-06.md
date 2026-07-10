# Daily Work Report - 2026-07-06

## Focus

เริ่ม Back Office documentation baseline หลัง Front Office cleanup

## Completed

- Review เอกสาร BO เดิม:
  - `BackOffice/BO_PRD.md`
  - `BackOffice/BO_Spec.md`
  - `BackOffice/BO_Spec_Completion_Addendum.md`
- Review FO admin boundary:
  - `FrontOffice/18_ADMIN_SCOPE_NOTE.md`
  - `FrontOffice/README_MODULE_INDEX.md`
- สร้าง BO baseline version registry:
  - `BackOffice/DOCUMENT_VERSION.md`
- สร้าง BO module index และ reading order:
  - `BackOffice/README_MODULE_INDEX.md`
- สร้าง consolidated BO master baseline:
  - `BackOffice/BO_MASTER_BASELINE.md`
- สร้าง BO dev implementation checklist:
  - `BackOffice/BO_DEV_IMPLEMENTATION_CHECKLIST.md`
- สร้าง shared FO/BO integration map:
  - `ProjectAdmin/FO_BO_INTEGRATION_MAP.md`
- อัปเดต root และ module indexes ให้ชี้ไป integration map
- สร้าง BO Global Rules module:
  - `BackOffice/00_GLOBAL_RULES_MODULE.md`
- ปรับ BO baseline จาก desktop-first เป็น responsive web support ครอบคลุม desktop, tablet และ mobile-width browsers
- สร้าง BO Authentication and Admin Accounts module:
  - `BackOffice/01_AUTHENTICATION_MODULE.md`
- ปรับเอกสาร BO ชุดใหม่ให้ใช้ภาษาไทยเป็นหลัก ผสม English technical term เท่าที่จำเป็น
- สร้าง BO Dashboard module:
  - `BackOffice/02_DASHBOARD_MODULE.md`
- สร้าง BO User Management module:
  - `BackOffice/03_USER_MANAGEMENT_MODULE.md`
- สร้าง BO Asset Management module:
  - `BackOffice/04_ASSET_MANAGEMENT_MODULE.md`
- สร้าง BO Content / Board module:
  - `BackOffice/05_CONTENT_BOARD_MODULE.md`
- สร้าง BO Market Data module:
  - `BackOffice/06_MARKET_DATA_MODULE.md`
- อัปเดต BO Market Data ให้ระบุ The Watch API เป็น current external provider ที่ dev ใช้ พร้อม rule เรื่อง backend sync/cache, USD -> THB conversion, provider metadata, rate/usage limit และ fallback
- เพิ่ม rule ว่าข้อมูล The Watch API ต้อง sync ลง TukDaeng database ก่อนใช้งาน, BO เพิ่ม/แก้/override ได้, ใช้ inactive/soft delete แทน hard delete และต้องมี conflict review เมื่อ provider sync ชน manual override
- สร้าง BO Directory module:
  - `BackOffice/07_DIRECTORY_MODULE.md`
- สร้าง BO Audit Log module:
  - `BackOffice/08_AUDIT_LOG_MODULE.md`
- สร้าง BO Offer / Chat module สำหรับ Phase 2:
  - `BackOffice/09_OFFER_CHAT_MODULE.md`
- ปรับคำในเอกสารกลางให้ยึด FO เป็นหลัก โดยใช้ offer status `Rejected` แทน legacy `Declined` และระบุว่า legacy term ต้อง normalize ก่อนใช้งาน
- สร้าง BO Social Interaction module สำหรับ Phase 2:
  - `BackOffice/10_SOCIAL_INTERACTION_MODULE.md`
- สร้าง BO Watch Alert module สำหรับ Phase 2:
  - `BackOffice/11_WATCH_ALERT_MODULE.md`
- สร้าง BO Help / Support module สำหรับ Phase 2:
  - `BackOffice/12_HELP_SUPPORT_MODULE.md`
- สร้าง BO Account Deletion Requests module สำหรับ Phase 2:
  - `BackOffice/13_ACCOUNT_DELETION_MODULE.md`
- สร้าง BO Notifications module สำหรับ Phase 2:
  - `BackOffice/14_NOTIFICATIONS_MODULE.md`
- สร้าง BO Reports & Analytics module สำหรับ Phase 2:
  - `BackOffice/15_REPORTS_ANALYTICS_MODULE.md`
- สร้าง BO Admin Settings module สำหรับ Phase 3:
  - `BackOffice/16_ADMIN_SETTINGS_MODULE.md`
- สร้าง BO Final Review And Dev Handoff:
  - `BackOffice/BO_FINAL_REVIEW_AND_HANDOFF.md`
- สร้าง BO responsive clickable prototype baseline:
  - `Prototypes/bo-prototype.html`
- ปรับ BO prototype ให้ใช้ style ตาม reference: dark sidebar, top breadcrumb, Asset Detail layout, owner/admin action side panel และ grouped submenu navigation
- ปรับ BO prototype ให้เป็น production-like มากขึ้น: default หลัง login เป็น Dashboard, เอาเลข module ออกจากเมนู, ลบข้อความ prototype/test ออกจาก Sign In และใช้ grouped submenu สำหรับการใช้งานจริง
- ปรับหน้า Sign In ของ BO prototype ให้ตัด info cards เชิงอธิบายออก และแสดงเป็น Admin Portal แบบใช้งานจริงมากขึ้น
- ปรับหน้า Sign In ของ BO prototype เป็น centered browser-card layout ตาม reference พร้อม hero image นาฬิกาหรู, ฟอร์ม login/2FA ที่สมดุลขึ้น และลบข้อความ demo ออกจากหน้าจอ
- ปรับหน้า Sign In ของ BO prototype ให้เป็น full-screen split layout ตาม feedback ล่าสุด: hero image เต็มจอฝั่งซ้าย, ฟอร์ม login เต็มความสูงฝั่งขวา และตัด browser-frame/card margin ออก
- ปรับตำแหน่งข้อมูลฝั่งซ้ายของ Sign In ให้บาลานซ์ขึ้นด้วย responsive padding และจำกัดความกว้าง copy ไม่ให้ชิดซ้ายหรือปล่อยพื้นที่ขวาโล่งเกินไป
- ปรับ sidebar หน้าหลักของ BO prototype เป็นเมนูหลัก 6 หมวดพร้อมกาง/หุบ submenu โดยค่าเริ่มต้นหุบเมนูที่ไม่ได้ใช้งานเพื่อลดความรกของหน้าจอ

## Baseline Started

Current BO baseline คือ `BO-PRD-v0.1`

Phase 1 scope:

- Global BO Rules
- Auth / Role Permission
- Dashboard
- User Management
- Asset Management
- Content / Board Management
- Market Data
- Directory
- Audit Log

## Notes

- Existing BO source files ยังเก็บเป็น legacy/source references
- New baseline package ใช้ pattern เดียวกับ Front Office documentation workspace
- BO เป็น web Back Office เท่านั้น Admin ไม่ใช่ FO mobile role
- FO และ BO แยกเอกสารตาม ownership แต่ trace งานข้ามระบบผ่าน ProjectAdmin integration map
