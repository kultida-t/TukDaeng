# 00 Navigation And Cross-Module Flow

อ้างอิงหลักจาก [TukDaeng_Master_Product_Definition.md](TukDaeng_Master_Product_Definition.md)

---

# 1. Document Information

| Field | Detail |
| --- | --- |
| Module Name | Navigation And Cross-Module Flow |
| Platform | Mobile Application |
| Version | V1 |
| Status | Draft |
| Owner | Product / UX / Engineering |
| Document Type | Cross-Module Functional PRD - Master Aligned |

# 2. Objective

Navigation And Cross-Module Flow เป็นเอกสารกลางสำหรับกำหนด entry point, routing, deep link destination, global dialog และ cross-module handoff ของแอป TukDaeng

เป้าหมายคือให้ Figma, Dev และ QA เข้าใจตรงกันว่าแต่ละ action พาผู้ใช้ไปที่หน้าจอใด ใช้ global state ใด และต้อง fallback อย่างไรเมื่อผู้ใช้เป็น Guest, Asset ถูกลบ, Asset เปลี่ยนสถานะ, User ถูก Block หรือ notification/deep link ชี้ไปยังข้อมูลที่ไม่พร้อมใช้งาน

# 3. Prototype Reference

- `Menu Feed.png`
- `Detail asset viewer.png`
- `Main Viewer Profile.png`
- `Main Owner Profile.png`
- `Chat detail.png`
- `Notification.png`
- `Search filter.png`
- Global Login Required Dialog
- Deleted / Unavailable Asset State

# 4. Master Alignment Summary

| Area | Master Baseline |
| --- | --- |
| Feed navigation | Feed Card เปิด Asset Detail; Owner area เปิด Public Profile; image เปิด Full Screen Image Viewer |
| Feed restriction | Comment ต้องทำผ่าน Asset Detail เท่านั้น; Share ทำได้จาก Feed, Asset Detail และ Profile grid |
| Guest restriction | Guest ใช้ feature ที่ต้อง Login ต้องเห็น Global Login Required Dialog |
| Watch Alert notification | เปิด Notification แล้วไป Watch Alert Result List ไม่เปิด Asset Detail โดยตรง |
| Notification types | Like, Comment, Follow, Offer, Watch Alert |
| Chat persistence | Chat ยังอยู่เมื่อ Asset ถูกลบหรือ Sold |
| Deleted asset | Asset Detail แสดง `รายการนี้ไม่พร้อมใช้งานแล้ว` |
| Offer context | Offer เกี่ยวข้องกับ Asset `Sale` และต้อง cancel เมื่อ Asset ถูกลบ |
| Block impact | Block ต้องซ่อน asset จาก Feed/Search/Watch Alert Result และไม่ใช้ Follow relation |
| Menu scope | Menu items นอก master ต้องจัดเป็น future/placeholder หรือรอ decision |

# 5. Figma Gap Checklist For Navigation And Cross-Module Flow

| Priority | Gap | Master Baseline | Figma Action |
| --- | --- | --- | --- |
| Must Fix | Menu มีรายการนอก baseline เช่น Watch Shops, Accessories Shop, Repair Shop, Auction Center, Consignment Center, Authentication Center, Community | Master ยังไม่ได้สรุปเป็น functional scope หลัก | จัดกลุ่มเป็น in-scope, future phase หรือ placeholder |
| Must Fix | Feed action อาจทำให้เข้าใจว่า Comment ทำจาก Feed ได้ | Comment ต้องทำผ่าน Asset Detail เท่านั้น แต่ Share ทำได้จาก Feed | ปรับ tap target หรือ annotation ให้ Comment พาไป Asset Detail และเพิ่ม Share action บน Feed |
| High | Notification destination ยังไม่ครบ | Like/Comment ไป Asset Detail, Follow ไป Public Profile, Offer ไป Offer/Chat context, Watch Alert ไป Result List | เพิ่ม destination state ของ notification ทุก type |
| High | Watch Alert notification อาจเปิด Asset Detail โดยตรง | Watch Alert notification ต้องไป Watch Alert Result List | เพิ่ม Watch Alert Result List เป็น destination |
| High | Deleted Asset จาก deep link / notification ยังไม่ชัด | Detail ต้องแสดง `รายการนี้ไม่พร้อมใช้งานแล้ว`; Chat ยังอยู่; Offer เป็น Cancelled | เพิ่ม unavailable fallback state |
| High | Global Login Required Dialog ยังไม่เห็นในทุก entry point | Guest ใช้ feature ที่ต้อง Login ต้องเห็น dialog เดียวกัน | เพิ่ม dialog state จาก Like, Follow, Offer, Chat, Watch Alert, Favorites, Following |
| Medium | หลาย screen ยังใช้คำจากเอกสารเก่า | Source of truth ใช้ canonical terminology จาก master | Normalize label หรือใส่ mapping ให้ชัดก่อนส่ง Dev/QA |
| Medium | Block / Report entry ยังไม่ผูกกับ navigation | Trust & Safety ต้องรองรับ Block และ Report จาก user/content context | เพิ่ม entry points จาก Profile, Asset Detail, Comment, Chat, Board |

# 6. Scope

## In Scope

- Main navigation structure
- Cross-module entry points
- Deep link destinations
- Notification destinations
- Global Login Required Dialog routing
- Deleted / unavailable fallback
- Blocked user fallback
- Feed to Detail / Profile / Image Viewer handoff
- Search to Detail handoff
- Watch Alert to Result List handoff
- Chat / Offer context handoff
- Trust & Safety entry points
- Menu scope decision notes

## Out Of Scope

- Visual design of navigation components
- Native OS routing implementation
- Push notification technical payload contract
- Back Office navigation
- Future services not in master baseline

# 7. Primary Navigation Surfaces

| Surface | Primary Destination |
| --- | --- |
| Feed | Marketplace list of Asset `Sale` |
| Search | Search Result for Asset `Sale` |
| Add Asset | Asset Management create flow |
| Notifications | Notification Center |
| Profile | Owner Profile for current user |
| Settings | Settings |
| Chat | Chat List and Chat Detail |
| Board | Board content list/detail |
| Portfolio | Owner-only Portfolio from Profile / Settings |
| Watch Alert | Watch Alert list/create/result |

Menu items outside this scope must be marked as future, placeholder, or needs master decision before Dev implementation

# 8. Cross-Module Entry Point Matrix

| Source | Action | Destination | Rule |
| --- | --- | --- | --- |
| Feed | Tap Feed Card | Asset Detail | Asset must be visible to current user |
| Feed | Tap Owner Name/Profile area | Public Profile | Blocked/unavailable profile must fallback |
| Feed | Tap Image | Full Screen Image Viewer | Image belongs to visible Asset |
| Feed | Tap Like | Like / Favorites sync | Guest sees Login Required |
| Feed | Share Asset | System share sheet / copy public deep link | Guest can share without Login; deep link opens Asset Detail |
| Feed | Tap Comment count | Asset Detail comments area | No direct Feed comment |
| Search Result | Tap Asset Card | Asset Detail | Asset must be `Sale` |
| Search | Save as Watch Alert | Watch Alert Create | Guest sees Login Required |
| Watch Alert | Open result | Watch Alert Result List | Result includes only `Sale` matches |
| Watch Alert Result | Tap Asset | Asset Detail | If unavailable, show deleted/unavailable state |
| Notification | Like / Comment | Asset Detail | If deleted, show unavailable state |
| Notification | Follow | Public Profile | If blocked/unavailable, show fallback |
| Notification | Offer | Offer Detail or related Chat context | If asset deleted, offer is Cancelled |
| Notification | Watch Alert | Watch Alert Result List | Must not open Asset Detail directly |
| Asset Detail | Contact Seller | Chat Detail | Guest sees Login Required |
| Asset Detail | Make Offer | Offer flow | Guest sees Login Required; Asset can be `Sale` or `Show` |
| Asset Detail | Owner Profile | Public Profile | Respect block and visibility |
| Asset Detail | Report Asset | Report flow | Report does not hide asset immediately |
| Public Profile | Follow | Social Follow | Guest sees Login Required |
| Public Profile | Asset card | Asset Detail | Only `Sale` / `Show` visible |
| Public Profile | Share Asset from grid | System share sheet / copy public deep link | Guest can share without Login; deep link opens Asset Detail |
| Owner Profile | Share Asset from grid | System share sheet / copy public deep link | Owner can share own public Asset; deep link opens Asset Detail |
| Profile | Share Profile | Profile Share Sheet / copy public deep link | Guest can share Public Profile without Login; deep link opens Public Profile |
| Chat Detail | View Asset | Asset Detail or unavailable state | Chat persists after deleted/sold |
| Offer Detail | Message seller | Chat Detail | Offer context preserved |
| Board Content | Report | Report flow | Board content report supported |
| Article Detail | Share Article | System share sheet / copy public Article deep link | Guest can share without Login; deep link opens Article Detail |

# 9. Notification Destination Rules

| Notification Type | Destination | Notes |
| --- | --- | --- |
| Like | Asset Detail | Like notification opens Asset context |
| Comment | Asset Detail | Comment supports IG-style one-level replies and is handled in Asset Detail |
| Follow | Public Profile | Opens follower profile if accessible |
| Offer | Offer Detail or Chat context | Must preserve related Asset / Offer context |
| Watch Alert | Watch Alert Result List | Does not open Asset Detail directly |

Notification types outside this list are not in V1 unless master is updated

# 10. Global Dialog Routing

Global Login Required Dialog must appear when Guest triggers:

- Like
- Follow
- Comment
- Chat
- Make Offer
- Favorites
- Following
- Watch Alert
- Add Asset
- Edit Asset
- Delete Asset

Dialog actions:

| Action | Destination |
| --- | --- |
| Sign In | Authentication Sign In |
| Sign Up | Authentication Sign Up |
| Cancel / Close | Return to previous screen with no action applied |

# 11. Unavailable Fallback Rules

| Case | Destination / Fallback |
| --- | --- |
| Deleted Asset deep link | Asset Detail unavailable state with `รายการนี้ไม่พร้อมใช้งานแล้ว` |
| Sold Asset from public surface | Public list should not show it; stale deep link shows Permission Denied / Unavailable state (non-owner) or Owner-only Sold detail (owner) |
| Hide Asset from public surface | Public list should not show it; stale deep link shows Permission Denied / Unavailable state (non-owner) or Owner-only detail (owner) |
| Blocked Profile | Profile unavailable or blocked state |
| Blocked Asset owner | Asset hidden from Feed, Search, Watch Alert Result; direct deep link shows Unavailable / blocked state |
| Cancelled Offer | Offer Detail shows Cancelled state |
| Deleted Asset from Chat | Chat remains, Asset preview opens unavailable state |
| Unpublished / Deleted Article deep link | Article Detail unavailable state with `บทความนี้ไม่พร้อมใช้งานแล้ว` |
| Invalid Article deep link | Article Not Found state |

Unavailable / permission fallback screen CTA:

- Primary CTA label ต้องใช้ `Go back`
- Behavior: ถ้ามี navigation history ให้กลับไปหน้าก่อนหน้าที่ user เข้ามา เช่น Feed, Public Profile, Chat หรือ Watch Alert Result
- ถ้าไม่มี navigation history เช่น เปิดจาก external deep link โดยตรง ให้ fallback ไป Feed
- ห้ามใช้ label เฉพาะทาง เช่น `Back to feed` บน shared fallback screen เว้นแต่ entry point นั้นรู้แน่นอนว่ามาจาก Feed เท่านั้น

# 12. Menu Scope Rules

The following menu items are outside current master baseline and must not be treated as implemented V1 modules without product decision:

- Watch Shops
- Accessories Shop
- Repair Shop
- Auction Center
- Consignment Center
- Authentication Center
- Community, if it means more than Board/Social scope

Figma may keep these as disabled placeholder or future phase only when clearly annotated

# 13. Deep Link Rules

- Every deep link must validate authentication, permission, asset status, block relationship, and deletion state before rendering the target
- Every app entry, foreground resume, deep link, and notification route must validate account status before rendering authenticated destinations; `Suspended` and `Banned` users must be redirected to the account status state
- Deep links to login-required surfaces from Guest must show Global Login Required Dialog or Sign In
- Deep links to unavailable Asset must not crash or show stale private data
- Deep links from push notification must use the notification destination matrix
- Deep link ของ Asset สถานะ `Hide` หรือ `Sold` ที่เปิดโดย non-owner ต้องแสดง Permission Denied / Unavailable state ไม่ใช่เปิด private detail
- Owner เปิด deep link ของ Asset ตัวเองที่ `Hide` หรือ `Sold` ต้องแสดง Owner-only detail
- Deep link ของ Article ที่ถูก unpublish, deleted หรือ invalid ID ต้องแสดง Article Unavailable / Not Found state ไม่ใช่เปิดเนื้อหา
- Admin เปิด deep link ของ Article ตัวเองที่ถูก unpublish ต้องเห็น Article Detail พร้อม admin preview note

# 13A. Back Button And Main Navigation After Deep Link

เมื่อหน้าจอเปิดจาก external deep link (ไม่มี in-app navigation history) ต้องจัดการ back button และ main navigation ดังนี้:

## Back Button บน Normal Screen

- ถ้ามี in-app navigation history ให้ back button กลับไปหน้าก่อนหน้าตามปกติ
- ถ้าไม่มี navigation history (เปิดจาก external deep link โดยตรง) ให้ back button fallback ไป Feed
- ห้ามปิด app หรือแสดงหน้าจอว่างเปล่าเมื่อกด back button จากหน้าที่เปิดจาก external deep link
- กฎนี้ใช้กับทุก screen ที่เปิดจาก deep link เช่น Asset Detail, Public Profile, Article Detail

## Back Button บน Error / Unavailable State

- ใช้ rule เดียวกับ Unavailable Fallback Rules: primary CTA `Go back`
- ถ้ามี navigation history ให้กลับหน้าก่อนหน้า
- ถ้าไม่มี navigation history (external deep link) ให้ fallback ไป Feed

## Main Navigation หลังเปิด Deep Link

- หลังเปิด deep link ทั้ง Guest และ Login user ต้องใช้งาน main navigation (bottom tab / menu) ต่อได้ เพื่อเข้าถึง Feed, Search, Profile, Notification และ surface อื่น ๆ ตามสิทธิ์
- ห้ามล็อก user อยู่ในหน้าเดียวหลังเปิด deep link โดยไม่มีทางออกนอกจาก back button
- Guest ที่เปิด deep link แล้วใช้ main navigation ต้องเจอ Global Login Required Dialog เมื่อกด login-required surface เช่นเดียวกับการเข้าผ่าน entry point ปกติ

# 14. Analytics Events

| Event | Trigger |
| --- | --- |
| `nav_feed_to_asset_detail` | Feed Card opens Asset Detail |
| `nav_feed_to_public_profile` | Feed owner area opens Public Profile |
| `nav_notification_opened` | User opens notification |
| `nav_notification_destination_resolved` | App resolves notification destination |
| `nav_login_required_dialog_opened` | Guest triggers login-required action |
| `nav_deep_link_unavailable_asset` | Deep link points to unavailable asset |
| `nav_blocked_destination_shown` | Blocked/unavailable fallback shown |
| `nav_future_menu_tapped` | User taps future/placeholder menu item |

# 15. Validation Rules

- Every route to Asset Detail must validate status and visibility
- Every route to Public Profile must validate block relationship
- Every route to Offer must validate authentication and offer availability
- Every route to Chat must validate authentication
- Every notification route must map to one approved destination
- Every future menu item must be disabled, hidden, or explicitly marked placeholder

# 16. Exception Handling

| Case | Expected Handling |
| --- | --- |
| Notification target deleted | Route to unavailable state |
| Notification type unsupported | Do not render as active V1 notification type |
| Deep link requires Login | Show Login Required or Sign In |
| Account suspended or banned | Clear/reject authenticated route and show account status state |
| Destination blocked | Show unavailable/blocked fallback |
| Future menu item tapped | Show placeholder/future state only if product approves |
| Route validation fails | Stay on current screen or show safe error state |

# 17. Acceptance Criteria

| ID | Criteria |
| --- | --- |
| AC-NAV-001 | Feed Card opens Asset Detail |
| AC-NAV-002 | Feed Owner area opens Public Profile |
| AC-NAV-003 | Feed image opens Full Screen Image Viewer |
| AC-NAV-004 | Feed does not support direct Comment; Share ทำได้จาก Feed, Asset Detail และ Profile grid |
| AC-NAV-005 | Guest login-required actions show Global Login Required Dialog |
| AC-NAV-006 | Like notification opens Asset Detail |
| AC-NAV-007 | Comment notification opens Asset Detail |
| AC-NAV-008 | Follow notification opens Public Profile |
| AC-NAV-009 | Offer notification opens Offer Detail or related Chat context |
| AC-NAV-010 | Watch Alert notification opens Watch Alert Result List |
| AC-NAV-011 | Deleted Asset deep link shows `รายการนี้ไม่พร้อมใช้งานแล้ว` |
| AC-NAV-012 | Chat remains accessible when related Asset is deleted or Sold |
| AC-NAV-013 | Cancelled Offer shows Cancelled state |
| AC-NAV-014 | Blocked users/assets do not render in Feed, Search or Watch Alert Result |
| AC-NAV-015 | Menu items outside master baseline are marked future/placeholder/needs decision |
| AC-NAV-016 | Deep links validate auth, permission, asset status, deletion and block state before rendering |
| AC-NAV-016A | Deep link ของ Asset `Hide` หรือ `Sold` ที่เปิดโดย non-owner ต้องแสดง Permission Denied / Unavailable state ไม่ใช่เปิด private detail |
| AC-NAV-016B | Owner เปิด deep link ของ Asset ตัวเองที่ `Hide` หรือ `Sold` ต้องแสดง Owner-only detail |
| AC-NAV-016C | เมื่อหน้าจอเปิดจาก external deep link โดยไม่มี navigation history แล้วกด back button ต้อง fallback ไป Feed ไม่ใช่ปิด app หรือแสดงหน้าว่าง |
| AC-NAV-016D | หลังเปิด deep link ทั้ง Guest และ Login user ต้องใช้งาน main navigation ต่อได้ และ Guest ที่กด login-required surface ต้องเจอ Global Login Required Dialog |
| AC-NAV-016E | Deep link ของ Article ที่ถูก unpublish, deleted หรือ invalid ID ต้องแสดง Article Unavailable / Not Found state ไม่ใช่เปิดเนื้อหา |
| AC-NAV-016F | Admin เปิด deep link ของ Article ตัวเองที่ถูก unpublish ต้องเห็น Article Detail พร้อม admin preview note |

# 18. Related Modules

- [00_GLOBAL_RULES_MODULE.md](00_GLOBAL_RULES_MODULE.md)
- [01_AUTHENTICATION_MODULE.md](01_AUTHENTICATION_MODULE.md)
- [02_FEED_MODULE.md](02_FEED_MODULE.md)
- [03_SEARCH_FILTER_MODULE.md](03_SEARCH_FILTER_MODULE.md)
- [05_ASSET_DETAIL_MODULE.md](05_ASSET_DETAIL_MODULE.md)
- [07_CHAT_MODULE.md](07_CHAT_MODULE.md)
- [08_OFFER_MODULE.md](08_OFFER_MODULE.md)
- [09_NOTIFICATION_MODULE.md](09_NOTIFICATION_MODULE.md)
- [10_WATCH_ALERT_MODULE.md](10_WATCH_ALERT_MODULE.md)
- [15_TRUST_SAFETY_MODULE.md](15_TRUST_SAFETY_MODULE.md)

# 19. Future Enhancement

- Formal deep link payload contract
- Push notification payload contract
- Route guard technical spec
- Future service menu taxonomy
- Back Office navigation map
