# 16 Integrations Module

อ้างอิงหลักจาก [TukDaeng_Master_Product_Definition.md](TukDaeng_Master_Product_Definition.md)

---

# 1. Document Information

| Field | Detail |
| --- | --- |
| Module Name | Integrations |
| Platform | Mobile Application / Web Back Office |
| Version | V1 |
| Status | Draft |
| Owner | Product / UX / Engineering |
| Document Type | Technical-Functional PRD - Master Aligned |

# 2. Objective

Integrations Module กำหนดขอบเขต integration ภายนอกที่ TukDaeng V1 ต้องรองรับ และแยกสิ่งที่เป็น Phase 2 ออกจาก scope ปัจจุบันให้ชัดเจน

เป้าหมายคือให้ Authentication, Notification, Asset Image, Portfolio และ Admin-related flows ใช้ integration เดียวกันตาม master baseline โดยไม่เพิ่ม provider หรือ payment flow นอก scope

# 3. Prototype Reference

- `Auth Sign up.png`
- `Auth Sign in & Reset password.png`
- `Notification.png`
- Asset image upload / gallery screens
- Portfolio / valuation related screens

# 4. Master Alignment Summary

| Integration | Master Purpose | V1 Scope |
| --- | --- | --- |
| Apple Sign In | Sign In / Sign Up ด้วย Apple ID | In Scope |
| Google OAuth | Sign In / Sign Up ด้วย Google Account | In Scope |
| Firebase Cloud Messaging | Push Notifications | In Scope |
| Image Storage / CDN | จัดเก็บและแสดงรูปภาพ | In Scope |
| Watch Price API | ดึงข้อมูลราคาตลาด | In Scope for Portfolio valuation baseline |
| Payment Gateway | Phase 2 เท่านั้น | Out Of Scope |

# 5. Figma Gap Checklist For Integrations Module

| Priority | Gap | Master Baseline | Figma Action |
| --- | --- | --- | --- |
| Must Fix | Payment Gateway หรือ payment UI อาจถูกมองว่าอยู่ใน V1 | Payment Gateway เป็น Phase 2 เท่านั้น | ซ่อน/ติดป้าย future ให้ทุก payment flow |
| High | Apple / Google flow ยังไม่แยกจาก Email OTP ชัด | Apple และ Google ใช้ SSO และไม่ต้อง OTP | ระบุ SSO path ที่ข้าม OTP ใน auth flow |
| High | Push notification permission / destination ยังไม่ชัด | FCM ใช้สำหรับ Push Notifications และ notification destination ต้องตรง master | เพิ่ม permission state และ destination mapping |
| High | Image upload/display ยังไม่เห็น CDN/error/loading state | Image Storage / CDN ใช้จัดเก็บและแสดงรูปภาพ | เพิ่ม image upload, loading, failure, retry และ placeholder state |
| Medium | Watch Price API ยังไม่ผูกกับ Portfolio valuation ชัด | Watch Price API ใช้ดึงข้อมูลราคาตลาด | ระบุ valuation source และ fallback เมื่อ API unavailable |
| Medium | Integration failure states ยังไม่ครบ | External integration ต้องมี safe fallback | เพิ่ม provider error, network error, timeout และ retry state |

# 6. Scope

## In Scope

- Apple Sign In / Sign Up
- Google Sign In / Sign Up
- Firebase Cloud Messaging for push notifications
- Image Storage / CDN for asset images
- Watch Price API for market price / portfolio value support
- Integration failure states
- Privacy and permission boundaries for integrated services

## Out Of Scope

- Payment Gateway
- In-app payment
- Escrow
- Auction payment
- Account linking between SSO and Email / Password
- Additional OAuth providers
- Watch authentication service in app

# 7. Integration Mapping

| Integration | Owning Module | Dependent Modules |
| --- | --- | --- |
| Apple Sign In | Authentication | Settings, Global Login Required |
| Google OAuth | Authentication | Settings, Global Login Required |
| Firebase Cloud Messaging | Notification | Watch Alert, Offer, Chat, Social |
| Image Storage / CDN | Asset Management | Feed, Search, Asset Detail, Profile, Portfolio |
| Watch Price API | Portfolio | Asset Management, Asset Detail |

# 8. Integration Rules

## Apple Sign In

- ใช้สำหรับ Sign In / Sign Up ด้วย Apple ID
- ต้องรองรับ Apple compliance ที่เกี่ยวกับ Report, Block, Terms of Service, Privacy Policy และ Moderation Flow
- SSO Email ไม่ต้องยืนยัน OTP
- บัญชี Apple Sign In ต้องไม่ Sign In ด้วย Email / Password ใน V1

## Google OAuth

- ใช้สำหรับ Sign In / Sign Up ด้วย Google Account
- SSO Email ไม่ต้องยืนยัน OTP
- บัญชี Google OAuth ต้องไม่ Sign In ด้วย Email / Password ใน V1

## Firebase Cloud Messaging

- ใช้สำหรับ Push Notifications
- Notification type ใน V1 จำกัดที่ Like, Comment, Follow, Offer, Watch Alert
- Watch Alert notification ต้องเปิด Watch Alert Result List
- Notification destination ต้อง validate auth, permission, asset status, deletion และ block state

## Image Storage / CDN

- ใช้จัดเก็บและแสดงรูปภาพ Asset
- Asset gallery รองรับสูงสุด 10 รูปตาม Asset Management rule
- Feed และ list surfaces ต้อง Lazy Load รูปภาพ
- Public surfaces ต้องไม่โหลดภาพของ Asset ที่ผู้ใช้ไม่มีสิทธิ์ดู

## Watch Price API

- ใช้ดึงข้อมูลราคาตลาดเพื่อเป็น Current Value source ลำดับแรกของ Portfolio
- หาก API unavailable ต้อง fallback ตาม Portfolio rule: Owner Estimated Value -> Purchase Price fallback -> No Valuation
- ต้องไม่ทำให้ Portfolio ใช้งานไม่ได้ทั้งหมดเมื่อ API unavailable
- ควรแสดง source/last updated เมื่อใช้ราคาจาก Watch Price API

# 9. Security And Privacy Rules

- ทุก integration call ต้องใช้ HTTPS
- Authentication integration ต้องออก token/session ตาม Token-based Authentication rule
- Private Asset Data ต้องตรวจสิทธิ์ก่อนส่งให้ integration หรือ render ผ่าน CDN
- Push notification payload ต้องไม่ใส่ private data ที่ไม่จำเป็น
- Admin Action ผ่าน Back Office ต้องมี Audit Trail

# 10. Error Handling

| Case | Expected Handling |
| --- | --- |
| Apple provider error | แสดง SSO error และให้ลองใหม่ |
| Google provider error | แสดง SSO error และให้ลองใหม่ |
| SSO email conflict | แจ้งว่า account ต้องใช้ auth method เดิม |
| FCM permission denied | ยังใช้แอปได้ แต่ไม่รับ push notification |
| Notification target unavailable | เปิด fallback state ตาม navigation rules |
| Image upload failed | แสดง retry / remove / replace image |
| Image CDN unavailable | แสดง placeholder และ retry/load fallback |
| Watch Price API unavailable | แสดง fallback valuation state |
| Network timeout | แสดง error และให้ retry เมื่อเหมาะสม |

# 11. Acceptance Criteria

| ID | Criteria |
| --- | --- |
| AC-INT-001 | Apple Sign In / Sign Up รองรับใน V1 |
| AC-INT-002 | Google Sign In / Sign Up รองรับใน V1 |
| AC-INT-003 | SSO Email ไม่ต้องยืนยัน OTP |
| AC-INT-004 | SSO account ไม่สามารถ Sign In ด้วย Email / Password ได้ใน V1 |
| AC-INT-005 | FCM ใช้สำหรับ Push Notifications |
| AC-INT-006 | Notification destination ต้องตรงกับ module/navigation rules |
| AC-INT-007 | Image Storage / CDN ใช้จัดเก็บและแสดง Asset image |
| AC-INT-008 | Feed/list image ต้อง Lazy Load |
| AC-INT-009 | Image upload/display failure ต้องมี fallback หรือ retry |
| AC-INT-010 | Watch Price API ใช้สำหรับ market price / Portfolio valuation support |
| AC-INT-011 | Watch Price API unavailable ต้องไม่ทำให้ Portfolio ล่มทั้งหน้า |
| AC-INT-012 | Payment Gateway ไม่อยู่ใน V1 และต้องถูกระบุเป็น Phase 2 |

# 12. Related Modules

- [01_AUTHENTICATION_MODULE.md](01_AUTHENTICATION_MODULE.md)
- [04_ASSET_MANAGEMENT_MODULE.md](04_ASSET_MANAGEMENT_MODULE.md)
- [05_ASSET_DETAIL_MODULE.md](05_ASSET_DETAIL_MODULE.md)
- [09_NOTIFICATION_MODULE.md](09_NOTIFICATION_MODULE.md)
- [10_WATCH_ALERT_MODULE.md](10_WATCH_ALERT_MODULE.md)
- [14_PORTFOLIO_MODULE.md](14_PORTFOLIO_MODULE.md)
- [17_NON_FUNCTIONAL_REQUIREMENTS.md](17_NON_FUNCTIONAL_REQUIREMENTS.md)

# 13. Future Enhancement

- Payment Gateway
- Escrow
- Additional OAuth providers
- Account linking
- Watch authentication integration
- Advanced price data provider
