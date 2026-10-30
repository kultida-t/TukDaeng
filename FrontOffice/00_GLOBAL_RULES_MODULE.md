# 00 Global Rules Module

อ้างอิงหลักจาก [TukDaeng_Master_Product_Definition.md](TukDaeng_Master_Product_Definition.md)

---

# 1. Document Information

| Field | Detail |
| --- | --- |
| Module Name | Global Rules |
| Platform | Mobile Application |
| Version | V1 |
| Status | Draft |
| Owner | Product / UX / Engineering |
| Document Type | Cross-Module Functional PRD - Master Aligned |

# 2. Objective

Global Rules Module เป็นเอกสารกลางสำหรับกฎที่ทุกโมดูลต้องใช้ร่วมกัน เพื่อลดความคลาดเคลื่อนระหว่าง Feed, Search, Asset Detail, Profile, Watch Alert, Chat, Social, Board, Settings, Portfolio และ Trust & Safety

เอกสารนี้ครอบคลุม user model, session model, consent & policy versioning, guest gate, asset status, visibility matrix, global states, lifecycle, trust & safety impact, privacy และ source-of-truth rules ที่ต้องอ้างอิงร่วมกันก่อนตัดสินใจในแต่ละโมดูล

# 3. Prototype Reference

- First-run onboarding (splash → language → welcome → privacy notice → cookie settings → notification pre-permission → tracking → member sheet)
- Member Sheet `Join TukDaeng` — first-run และ guest gate variants
- Re-consent sheet `We've updated our policies`
- Legal viewer (Terms of Use / Privacy Policy)
- Empty State
- Deleted / Unavailable Asset State
- Error State
- Offline / Cached Data State
- Blocked / Unavailable User State
- Report Entry State

# 4. Master Alignment Summary

| Area | Master Baseline |
| --- | --- |
| User model | User มี role เดียวหลังสมัคร ไม่แยก Buyer / Seller / Collector |
| Context model | ใช้ Owner / Viewer / Guest เป็น context ไม่ใช่ role ถาวร |
| Session model | Session 3 สถานะ `member` / `guest` / `new` (GUEST-001) — `new` มี member powers ทุกอย่างแต่เริ่มต้นไม่มีข้อมูลของตัวเอง |
| Consent | Required = Terms of Use + Privacy Policy (implied consent); Optional = Analytics + Personalized (default off, opt-in); re-consent เมื่อ policy version เปลี่ยน |
| Asset statuses | ใช้เฉพาะ `Sale`, `Show`, `Hide`, `Sold` |
| Public visibility | Viewer เห็นเฉพาะ `Sale` และ `Show` ตาม surface ที่อนุญาต |
| Feed visibility | Feed เป็น post-centric — แสดงโพสต์ `Sale` และโพสต์ธรรมดา `post`; `Show`, `Hide`, `Sold` ไม่เข้า feed |
| Marketplace matching | Search และ Watch Alert match เฉพาะ `Sale` |
| Owner visibility | Owner Profile เห็น Asset ของตัวเองทุกสถานะ |
| Empty state | ทุกหน้าที่ไม่มีข้อมูลใช้ข้อความ `ไม่พบข้อมูล` |
| Login required | Guest ใช้ action ที่ต้องมีตัวตนต้องเห็น Member Sheet `Join TukDaeng` (guest gate) |
| Deleted asset | Asset ต้องหายจาก public surfaces, Detail แสดง `รายการนี้ไม่พร้อมใช้งานแล้ว` (contract — prototype แสดงเฉพาะ toast/empty state) |
| Offline cached | ต้องรองรับข้อมูลล่าสุดที่โหลดไว้เมื่อ offline อย่างน้อยสำหรับ Feed (contract — prototype ไม่ครอบ) |
| Block | Asset ของผู้ถูก Block ต้องหายจาก Feed, Search, Watch Alert Result |
| Report | Report ไม่ทำให้ Asset หายทันที จนกว่า Admin moderation |
| Privacy | Private asset data เห็นเฉพาะ Owner หรือ Admin ตามสิทธิ์ |
| Source of truth | ถ้าเอกสารอื่น conflict ให้ยึด master และ global rules นี้ก่อน |

# 5. Scope

## In Scope

- User context rules
- Session model (member / guest / new)
- Consent & policy versioning rules
- Guest capabilities และ login gate
- Asset status model
- Visibility matrix
- Empty state
- Login Required state (Member Sheet)
- Deleted / unavailable asset state
- Feed error state
- Offline / cached data state
- Lifecycle rules (asset + account/session)
- Block and Report impact
- Data privacy rules
- Source-of-truth rules

## Out Of Scope

- UI layout รายหน้าจอของแต่ละโมดูล
- Business flow เฉพาะโมดูล (onboarding flow แบบละเอียดอยู่ที่ 01_AUTHENTICATION, cookie/privacy preferences UI อยู่ที่ 13_SETTINGS)
- Back Office implementation
- Technical API contract แบบละเอียด
- Design system token

# 6. Canonical User Context

| Context | Definition |
| --- | --- |
| User | ผู้ใช้หลังสมัคร มี role เดียว ไม่แยก Buyer / Seller / Collector |
| Owner | User ที่เป็นเจ้าของ Asset หรือ Profile นั้น |
| Viewer | User หรือ Guest ที่กำลังดู Asset หรือ Profile ของคนอื่น |
| Guest | ผู้ใช้ที่ยังไม่ Login (session `guest`) |
| Admin | ผู้ดูแลระบบผ่าน Back Office ไม่ใช่ actor หลักของ mobile app |

User เดียวกันสามารถเป็น Owner ใน asset ของตัวเอง และเป็น Viewer เมื่อดู asset ของคนอื่น

Owner/Viewer เป็น context ต่อ content ส่วน session (`member`/`guest`/`new`) เป็นสถานะตัวตนของผู้ใช้ในเครื่อง — นิยามอยู่ที่ §7

# 7. Session Model (GUEST-001)

ระบบใช้ session 3 สถานะ (prototype: `state.session`, persist `fo_session`)

| Session | นิยาม | พฤติกรรมข้อมูล |
| --- | --- | --- |
| `member` | ผู้ใช้ที่ sign in ด้วยบัญชีที่มีข้อมูลเดิม (returning member) | เห็นข้อมูลของบัญชีครบทุก surface |
| `new` | บัญชีที่สมัครใหม่ (fresh account) | มี member powers ทุกอย่าง แต่เริ่มต้นไม่มีข้อมูลของตัวเอง — followers/following = 0, ไม่มี assets/chats/alerts/saved/collections; feed tab ถูกบังคับ `All` |
| `guest` | ผู้ใช้ที่ยังไม่ sign in | ไม่มีข้อมูลส่วนตัวใด ๆ; browse ได้ตาม guest capabilities (§11) — action ที่ต้องมีตัวตนถูก gate ด้วย Member Sheet |

## Session Transitions

| Transition | Session Result |
| --- | --- |
| เปิดแอปครั้งแรก (ยังไม่ผ่าน onboarding) | First-run onboarding → Member Sheet `Join TukDaeng`: Sign up → `new`; Sign in บัญชีเดิม → `member`; Sign in บัญชีที่เคยสมัครในเครื่อง → `new`; Skip for now → `guest` |
| First-run member sheet + `Don't show this again` → Skip | `guest` และ run ถัดไปเข้าแอปเงียบ ๆ ไม่แสดง sheet อีก |
| Email sign up → OTP → profile step → Account created → Sign in | `new` (email sign up ไม่ auto-login ต้อง sign in เอง — รายละเอียด 01_AUTHENTICATION) |
| Social sign up ครั้งแรก → profile step | `new` เข้าแอปทันที ไม่มี OTP/หน้า Account created |
| Social sign-in returning (provider เดียวกับบัญชีที่ persist) | กลับเข้า session `new` ของตัวเองเงียบ ๆ ไม่ผ่าน profile step |
| Sign Out | `guest` — credential ยัง persist สำหรับ sign in กลับ |
| Guest กด gated action → Sign up / Sign in / social จาก gate sheet | `new` หรือ `member` ตามบัญชีที่ใช้ |
| Delete Account สำเร็จ | `guest` + revoke session + ลบ credential ที่ persist (เฉพาะ session `new`); รายละเอียด flow + grace period อยู่ที่ 13_SETTINGS |
| Session ถูก revoke จาก BO (Suspended/Banned) | ต้อง clear session และพาไป account status state (contract — prototype ไม่ครอบ) |

## Session Data Rules

- เปลี่ยน session เมื่อใดต้องสลับข้อมูลทั้งก้อนตามสถานะ — `member` restore ข้อมูลบัญชี, `new`/`guest` เคลียร์ข้อมูลส่วนตัวทุกอย่างออกจาก surface (flags บนโพสต์, collections, watch alerts, chat, alerts, profile data) และ feed tab กลับ `All`
- `new` ต้องแสดง empty states เหมือนบัญชีใหม่จริง ไม่ยืมข้อมูล member/demo (GUEST-001)
- Prototype persist keys: `fo_session` (session), `fo_newuser` (profile เบาของ session `new`), `fo_account` (credential ที่สมัครในเครื่อง), `fo_onboarded`, `fo_member_hide`, `fo_toured`, `fo_consent` / `fo_consent_log`
- Production ใช้ token-based session (contract — prototype จำลองด้วย localStorage)

## Coach Marks

- หลัง onboarding ครั้งแรกต้องแสดง coach marks ครั้งเดียว (persist `fo_toured`)
- มี 2 versions: member (nudge create/search/feed tabs/bottom nav) และ guest (nudge sign-up แทน member actions — GUEST-001)

# 8. Consent & Policy Versioning

## Consent Model

| ประเภท | รายการ | กลไกยินยอม | ค่าเริ่มต้น |
| --- | --- | --- | --- |
| Required | Terms of Use, Privacy Policy | Implied consent — การกด Continue (welcome), สมัคร/เข้าสู่ระบบ หรือ Accept & continue (re-consent) ถือเป็นยอมรับพร้อม legal text กำกับ; ไม่มี checkbox แยก | จำเป็น — ใช้งานไม่ได้ถ้าไม่ยอมรับ |
| Optional | Analytics, Personalized content | Opt-in toggle บน privacy notice / cookie settings / re-consent sheet | Off |

- Essential cookies/SDK = always on ไม่มี toggle (จำเป็นต่อการทำงานและความปลอดภัยของแอป)
- Optional flags: `Accept all` = on ทั้งคู่, `Reject all` = off ทั้งคู่, `Privacy settings` = เลือกทีละตัวแล้ว Save preferences
- Analytics = off (จาก `Reject all` หรือ Privacy settings) ต้องไม่ส่ง analytics event ทุกตัว รวม search event และ `auth_*` event; consent record ยังบันทึกได้ตามปกติ (prototype ไม่มี analytics pipeline จึง enforce ที่ build stg/app จริงเท่านั้น)
- ATT-style tracking prompt: ถ้าผู้ใช้เลือก `Ask App Not to Track` ต้องบังคับ `Personalized = off` (เลือกไม่ติดตามแล้วปรับแต่งเฉพาะบุคคลไม่ได้)
- Optional consent เปลี่ยนได้ทุกเมื่อหลังใช้งานผ่าน Settings > Privacy (UI รายละเอียดอยู่ที่ 13_SETTINGS)
- Consent record ต้องเก็บ: policy version (terms + privacy), timestamp ที่ยอมรับ required, optional flags, ภาษา และ timestamp ของ record — prototype persist `fo_consent` (ล่าสุด) + `fo_consent_log` (ประวัติทุกครั้ง) — production เป็น server-side consent log (contract)

## Re-consent (Policy Version Bump)

- เมื่อ Terms of Use หรือ Privacy Policy version เปลี่ยน ต้องแสดง re-consent sheet `We've updated our policies` ทับ surface ที่ใช้อยู่ก่อนใช้งานต่อ — บังคับทุก session
- Sheet แสดง required rows: Terms of Use v{version} / Privacy Policy v{version} (แตะเปิด legal viewer อ่านได้) + optional toggles ตามค่าปัจจุบัน
- `Accept & continue` → บันทึก consent record ใหม่แล้วใช้งานต่อ
- `Decline` → inline banner แจ้งว่าต้องยอมรับ required จึงจะใช้งานต่อได้ + ทางเลือกเดียวคือ `Sign out` (member/new) หรือ `Exit app` — ไม่มี path ใช้งานต่อโดยไม่ยอมรับ
- Production trigger = policy version จาก backend เทียบกับ consent record ล่าสุด (prototype ใช้ dev artifact จำลอง)

## Legal Documents

- Terms of Use และ Privacy Policy เปิดเป็น full-screen legal viewer ในแอป แสดง version + effective date
- Entry points: welcome links, consent sheet rows, sign-up legal text, re-consent rows, Settings > Legal

# 9. Asset Status Model

ระบบใช้สถานะ Asset ตามชุดนี้เท่านั้น:

- `Sale`
- `Show`
- `Hide`
- `Sold`

ห้ามใช้ status model ซ้ำ เช่น `Available / Sold` แยกอีกชั้น หรือ legacy label ที่ทำให้ data model ขัดกับ master

โพสต์บน feed ที่ไม่ผูก asset ใช้ kind `post` (feed-only post ไม่มี asset status) — ไม่นับเป็น asset status เพิ่ม แต่ต้องเข้าใจใน visibility matrix §10

# 10. Visibility Matrix

| Status | Owner Profile | Public Profile | Feed | Search | Watch Alert |
| --- | --- | --- | --- | --- | --- |
| Sale | แสดง | แสดง | แสดง | แสดง | Match |
| Show | แสดง | แสดง | ไม่แสดง | ไม่แสดง | ไม่ Match |
| Hide | แสดงเฉพาะ Owner | ไม่แสดง | ไม่แสดง | ไม่แสดง | ไม่ Match |
| Sold | แสดงเฉพาะ Owner | ไม่แสดง | ไม่แสดง | ไม่แสดง | ไม่ Match |
| `post` (ไม่ผูก asset) | แสดง | ไม่แสดง | แสดง | ไม่แสดง | ไม่ Match |

หมายเหตุ feed post-centric (S-09/S-10/S-14):

- Feed = social post feed — แสดงทุกโพสต์ที่ไม่ติด viewer-level exclusion (not-interested / muted / blocked / archived) โดยโพสต์ที่ผูก asset ต้องอยู่ `Sale` เท่านั้นที่เข้า feed (`Show`, `Hide`, `Sold` หลุดจาก feed) และโพสต์ธรรมดา `post` ที่ไม่ผูก asset เข้า feed เสมอ
- Search และ Watch Alert เป็น asset surfaces — match เฉพาะ `Sale`; prototype `salePosts()` นับ priced post ทุกสถานะรวม `Hide`/`Sold` (pfkind leak) ถือเป็น defect ที่บันทึกไว้ ไม่ใช่ spec
- Public Profile แสดงเฉพาะ `Sale` + `Show` — prototype `All` tab รั่ว `post`/`Hide`/`Sold` ถือเป็น defect (S-14); viewer ต้องไม่เห็น post/sold/hide บน public profile

# 11. Global State Rules

## Empty State

ทุกหน้าที่ไม่มีข้อมูลใช้ข้อความเดียวกัน:

| Language | Message |
| --- | --- |
| TH | ไม่พบข้อมูล |
| EN | No data found |

Empty state variant เฉพาะ context ที่ prototype ใช้จริง (`No alerts yet`, `No posts yet`, `You're all caught up`, `Article not found`, `Chat not found`) อยู่ในความรับผิดชอบของ module spec นั้น ๆ

## Login Required — Member Sheet (เดิมเรียก Global Login Required Dialog)

Guest (session `guest`) ใช้ action ที่ต้องมีตัวตนต้องแสดง Member Sheet `Join TukDaeng` แบบ guest gate — เป็น bottom sheet ไม่ใช่ center dialog

> หมายเหตุ rename: เอกสาร module อื่นที่ยังใช้ชื่อ `Global Login Required Dialog` หมายถึง surface เดียวกันนี้ — แต่ละ module จะ sync ชื่อเป็น Member Sheet ตอน update task ของตัวเอง (FSP-012a/b, FSP-015a–024, FSP-026)

Guest gate sheet copy:

| Language | Title | Body | Primary | Secondary | Tertiary | Social | Dismiss |
| --- | --- | --- | --- | --- | --- | --- | --- |
| TH | เข้าร่วมตึกแดง | เข้าสู่ระบบหรือสมัครสมาชิกฟรีเพื่อใช้ฟีเจอร์นี้ | สมัครสมาชิก | เข้าสู่ระบบ | ข้ามไปก่อน | Google / Apple | แตะ scrim ปิดได้ |
| EN | Join TukDaeng | Sign in or create a free account to use this feature. | Sign up | Sign in | Skip for now | Google / Apple | tap scrim to close |

- Gate mode แตะ scrim ปิด sheet ได้เหมือน bottom sheet ทั่วไป และไม่จำ choice — เปิดใหม่ทุกครั้งที่ guest กด gated action
- Checkbox `Don't show this again` มีเฉพาะ first-run member sheet เท่านั้น (persist `fo_member_hide`) — gate mode ไม่มี
- หน้า Authentication จริงและปุ่มใน flow สมัครสมาชิกยังใช้ label `Sign up` ตามปกติ

### Guest Capabilities (session `guest` ทำได้โดยไม่ gate)

- ดู Feed ทุก surface รวม feed tabs `All` / `Following` / `Favorites` (ไม่ gate — guest เห็น empty state เพราะไม่มีความสัมพันธ์)
- ใช้ Search (explore, results, filters)
- ดู Boards และ Article Detail (read-only)
- เปิด post detail / post viewer และดู public profile (read-only)
- เปิด legal viewer และผ่าน onboarding surfaces

### Login-Required Actions (guest กดแล้วเปิด gate sheet)

- Create (`+` post/asset composer)
- Bottom-nav tabs: Chat, Alerts, Profile (tab ของตัวเอง)
- Social actions: Like, Save/Collections, Share ทุก surface (รวม asset/profile/article — S-03: share ต้อง login), Wishlist, Follow / Favorite / Unfollow / Mute, Comment (input, like, reply meta), Not-interested feedback
- Post menus ทั้งของตนเองและคนอื่น (archive, pin, turn off comments, edit, mark as sold, not interested, report, block)
- Report ทุกประเภท (post, user, comment, board content)
- Board actions (like, save, share, report article)
- Profile actions (edit, share, settings menu, follower/following row actions, unblock)
- Chat entries ทุกจุด และ Watch Alert create/manage
- Settings surfaces (เข้าผ่าน profile menu — gate ทั้งชุด)

## Deleted Asset

เมื่อ Asset ถูกลบ:

- Asset ต้องหายจาก Feed, Search, Watch Alert และ Public Profile
- Asset Detail ต้องแสดง `รายการนี้ไม่พร้อมใช้งานแล้ว` (contract — prototype แสดงเฉพาะ toast `This post is no longer available` และ empty states)
- Chat ยังอยู่

## Feed Error

หากโหลด Feed ไม่สำเร็จ:

- แสดง Error State
- แสดงปุ่ม `ลองใหม่`

(contract — prototype ไม่มี feed error path; error + retry ที่มีจริงอยู่ที่ Search `Something went wrong. Please try again.` และ Portfolio `Unable to load data.`)

## Offline / Cached Data

ระบบต้องรองรับการแสดงข้อมูลล่าสุดที่โหลดไว้เมื่ออินเทอร์เน็ตขาดหาย อย่างน้อยสำหรับ Feed (contract — prototype ไม่ครอบ)

กติกาเมื่ออินเทอร์เน็ตขาดหาย (ใช้กับทุกหน้าที่โหลดข้อมูลจากเซิร์ฟเวอร์ เช่น Profile, Portfolio, Library, Settings, Chat): การอ่าน = แสดงข้อมูลล่าสุดที่ cache ไว้ (stale) พร้อมสถานะ offline ชัดเจน; การเขียน/การบันทึก = แสดง error ชัดเจนและไม่บันทึกหลอก; เมื่อกลับออนไลน์ต้องตรงกับเซิร์ฟเวอร์ (contract — prototype ไม่ครอบ)

Bottom sheet ทั่วไป: ปิดได้ด้วยการแตะ scrim, ปุ่มปิดของ sheet, device back (Android) และลากแถบจับ (handle) ลง (contract — prototype: แถบจับเป็นภาพประกอบ ปิดด้วย scrim/ปุ่มเท่านั้น)

# 12. Lifecycle Rules

## Asset Lifecycle

| Transition | Required Impact |
| --- | --- |
| `Sale` -> `Sold` | หายจาก Feed, Following, Favorites, Search, Watch Alert ทันที; Chat ยังอยู่ |
| `Sale` -> `Hide` | หายจาก Feed, Following, Favorites, Search, Watch Alert ทันที |
| `Hide` -> `Sale` | กลับเข้า Feed, Search, Watch Alert และกลับเข้า Following/Favorites ตามเงื่อนไข |
| `Show` -> `Sale` | แสดงใน Feed, Search และ Match Watch Alert |
| `Sale` -> `Show` | หายจาก Feed, Search, Watch Alert แต่ยังแสดงใน Public Profile |
| Deleted | หายจาก public surfaces และ Detail แสดง unavailable state |
| `post` -> ผูก asset `Sale` (draft กลายเป็น listing) | เข้า/อยู่ใน Feed เหมือน sale post และปรากฏใน Public Profile |
| Asset-linked post -> `post` (แยกออกจาก asset) | ยังอยู่ใน Feed แต่หลุดจาก Search/Watch Alert matching และ Public Profile |

## Account & Session Lifecycle

| Transition | Required Impact |
| --- | --- |
| Sign Up (email/social) สำเร็จ | session `new` — member powers แต่ข้อมูลว่าง (§7) |
| Sign In | session `member` (บัญชีเดิม) หรือ `new` (บัญชีที่สมัครในเครื่อง) |
| Sign Out | session `guest` — เคลียร์ข้อมูลส่วนตัวจากทุก surface ตาม Session Data Rules |
| Delete Account | soft delete → grace period 30 วัน → session `guest`; sign in ระหว่าง grace period = restore บัญชี (login-to-restore, S-02); เกิน grace = hard delete/anonymization ตาม policy (contract — รายละเอียด flow อยู่ที่ 13_SETTINGS) |
| Suspended / Banned | revoke session + พาไป account status state (contract — prototype ไม่ครอบ, S-29) |
| Policy version เปลี่ยน | ทุก session ต้องผ่าน re-consent sheet ก่อนใช้งานต่อ (§8) |

## Password Policy (canonical — S-21)

- Rule เดียวทุกจุด (sign up, change password, reset): อย่างน้อย 8 ตัวอักษร และต้องมีตัวเลขหรือสัญลักษณ์อย่างน้อย 1 ตัว
- Prototype deviation ที่บันทึกไว้ (ไม่ใช่ spec — แก้ตอน implementation): sign up ใช้กฎ `≥8 + score ≥2` (ตัวพิมพ์เล็ก+ใหญ่อย่างเดียวผ่านได้โดยไม่มีตัวเลข/สัญลักษณ์), change password ใน settings ใช้ `≥6 ตัวอักษร` — sync รายละเอียดอยู่ที่ 01_AUTHENTICATION (FSP-012a) และ 13_SETTINGS (FSP-014)

# 13. Trust & Safety Global Impact

## Block User

เมื่อ User Block ผู้ใช้อีกคน:

- Asset ของผู้ถูก Block ต้องหายจาก Feed ทันที
- Asset ของผู้ถูก Block ต้องหายจาก Search ทันที
- Asset ของผู้ถูก Block ต้องหายจาก Watch Alert Result ทันที
- ความสัมพันธ์ Follow ระหว่างกันต้องไม่ถูกใช้ในการแสดง Following Feed

## Report

ระบบต้องรองรับ Report:

- Asset
- User
- Comment
- Board Content

Report ไม่ทำให้ Asset หรือ Content หายจาก public surfaces ทันที การซ่อนต้องเกิดจาก Admin moderation

## Hide Feed Item

- Hide Feed Item เป็น user-level preference ของ viewer
- Hide Feed Item ไม่ใช่ asset status `Hide`
- Hide Feed Item ไม่ใช่ moderation action และไม่ใช่ Report
- Hide Feed Item ซ่อนเฉพาะ Asset นั้นจาก Feed ของผู้กด
- Hide Feed Item ไม่กระทบ Owner, ผู้ใช้อื่น, Public Profile, Search, Watch Alert matching หรือ Chat ใน V1
- Hide Feed Item ต้องมี undo ชั่วคราวหลัง action สำเร็จ

# 14. Data Privacy Rules

ข้อมูลต่อไปนี้เป็น Private และเห็นเฉพาะ Owner หรือ Admin ตามสิทธิ์:

- Purchase Price
- Purchase Date
- Sold History
- Portfolio Value Detail

Public Profile, Feed, Search, Watch Alert และ Viewer Asset Detail ต้องไม่แสดง private data เหล่านี้

# 15. Source Of Truth Rules

หากเอกสารมีเงื่อนไขไม่ตรงกัน ให้ตัดสินตามลำดับ:

1. `TukDaeng_Master_Product_Definition.md`
2. `00_GLOBAL_RULES_MODULE.md`
3. Module PRD รายโมดูล
4. Legacy documents

หลักตัดสินความขัดแย้ง:

- ใช้สถานะ canonical: `Sale`, `Show`, `Hide`, `Sold` (+ kind `post` สำหรับโพสต์ไม่ผูก asset)
- ใช้ Owner / Viewer เป็น context ไม่ใช่ role
- Feed เป็น post-centric ตาม §10 (โพสต์ `Sale` + `post`); Search และ Watch Alert match เฉพาะ `Sale`
- Public Profile ใช้ `Sale` และ `Show`
- Owner Profile เห็นทุกสถานะ
- Hide และ Sold ต้องไม่ Public
- Comment รองรับ IG-style one-level replies ใต้ comment หลัก และไม่รองรับ multi-level nested thread
- Notification types ใช้เฉพาะ Like, Comment, Follow, Watch Alert + `system` (S-17 — placeholder destination ตาม 09_NOTIFICATION)
- Guest gate ใช้ Member Sheet `Join TukDaeng` (§11) ไม่ใช่ center dialog

# 16. Validation Rules

- ทุก public surface ต้อง validate asset status ก่อนแสดง
- ทุก private data section ต้อง validate Owner หรือ Admin permission
- ทุก login-required action ต้อง validate session — `guest` ต้องเปิด Member Sheet ก่อน execute action
- ทุก session ต้องผ่าน required consent ก่อนใช้งาน และต้องผ่าน re-consent เมื่อ policy version เปลี่ยน
- ทุก blocked relationship ต้องถูกใช้เป็น filter ก่อนแสดง public list
- ทุก lifecycle transition ต้อง update dependent surfaces ตาม matrix

# 17. Exception Handling

| Case | Expected Handling |
| --- | --- |
| User เปิด deleted asset จาก deep link | แสดง `รายการนี้ไม่พร้อมใช้งานแล้ว` (contract — prototype: toast `This post is no longer available`) |
| Guest ใช้ login-required action | แสดง Member Sheet `Join TukDaeng` (gate mode — scrim dismiss ได้) |
| Guest เลือก `Don't show this again` + Skip บน first-run member sheet | เข้า `guest` เงียบ ๆ run ถัดไปไม่แสดง sheet ซ้ำ |
| Re-consent sheet ถูก Decline | inline banner + `Sign out`/`Exit app` เท่านั้น |
| Blocked user เปิด profile/asset | แสดง unavailable state หรือไม่แสดงข้อมูลตาม Trust & Safety rule |
| Asset status เปลี่ยนระหว่าง session | เมื่อ sync/refresh ต้องอัปเดต visibility ตาม matrix |
| Offline ระหว่าง Feed | แสดง cached data หากมี (contract) |
| ไม่มีข้อมูล | แสดง `ไม่พบข้อมูล` |

# 18. Acceptance Criteria

| ID | Criteria |
| --- | --- |
| AC-GLOBAL-001 | ทุกโมดูลใช้ status เฉพาะ `Sale`, `Show`, `Hide`, `Sold` (+ `post` สำหรับโพสต์ไม่ผูก asset) |
| AC-GLOBAL-002 | Feed แสดงเฉพาะโพสต์ `Sale` และ `post` ที่ไม่ติด viewer-level exclusion; Search และ Watch Alert แสดงหรือ match เฉพาะ Asset `Sale` |
| AC-GLOBAL-003 | Public Profile แสดงเฉพาะ Asset `Sale` และ `Show` (ไม่แสดง `post`, `Hide`, `Sold` ต่อ viewer) |
| AC-GLOBAL-004 | Owner Profile แสดง Asset ของ Owner ได้ทุกสถานะ |
| AC-GLOBAL-005 | Hide และ Sold ไม่แสดงใน public surfaces |
| AC-GLOBAL-006 | Empty state ใช้ `ไม่พบข้อมูล` / `No data found` |
| AC-GLOBAL-007 | Guest ใช้ login-required feature แล้วเห็น Member Sheet `Join TukDaeng` (gate mode) |
| AC-GLOBAL-008 | Deleted Asset หายจาก public lists และ Detail แสดง `รายการนี้ไม่พร้อมใช้งานแล้ว` |
| AC-GLOBAL-009 | Deleted Asset ไม่ลบ Chat |
| AC-GLOBAL-010 | Block ทำให้ asset ของผู้ถูก Block หายจาก Feed, Search และ Watch Alert Result |
| AC-GLOBAL-011 | Report ไม่ทำให้ content หายทันทีโดยไม่มี Admin moderation |
| AC-GLOBAL-012 | Private asset data ไม่แสดงต่อ Viewer หรือ Guest |
| AC-GLOBAL-013 | Feed error มี Error State และปุ่ม `ลองใหม่` |
| AC-GLOBAL-014 | Feed รองรับ offline cached data |
| AC-GLOBAL-015 | Lifecycle transition ต้อง update surfaces ตาม matrix |
| AC-GLOBAL-016 | Session มี 3 สถานะ `member`/`guest`/`new`; `new` มี member powers ทุกอย่างแต่เริ่มต้นไม่มีข้อมูลของตัวเอง (GUEST-001) |
| AC-GLOBAL-017 | Guest browse Feed (ทุก tab), Search, Boards, post detail/viewer และ public profile ได้โดยไม่ login |
| AC-GLOBAL-018 | Required consent (Terms of Use + Privacy Policy) ต้องถูกยอมรับก่อนใช้งานผ่าน implied consent; optional consent (Analytics, Personalized) default off และเปลี่ยนได้ใน Settings |
| AC-GLOBAL-019 | เมื่อ policy version เปลี่ยนต้องแสดง re-consent sheet ทุก session; Decline ต้องเหลือเฉพาะ Sign out/Exit app |
| AC-GLOBAL-020 | Sign Out ต้องเปลี่ยน session เป็น `guest` และเคลียร์ข้อมูลส่วนตัวจากทุก surface; Delete Account ต้องใช้ grace period 30 วันแบบ login-to-restore |

# 19. Related Modules

- [00_NAVIGATION_AND_CROSS_MODULE_FLOW.md](00_NAVIGATION_AND_CROSS_MODULE_FLOW.md)
- [01_AUTHENTICATION_MODULE.md](01_AUTHENTICATION_MODULE.md)
- [02_FEED_MODULE.md](02_FEED_MODULE.md)
- [03_SEARCH_FILTER_MODULE.md](03_SEARCH_FILTER_MODULE.md)
- [04_ASSET_MANAGEMENT_MODULE.md](04_ASSET_MANAGEMENT_MODULE.md)
- [05_ASSET_DETAIL_MODULE.md](05_ASSET_DETAIL_MODULE.md)
- [06_PROFILE_MODULE.md](06_PROFILE_MODULE.md)
- [10_WATCH_ALERT_MODULE.md](10_WATCH_ALERT_MODULE.md)
- [13_SETTINGS_MODULE.md](13_SETTINGS_MODULE.md)
- [15_TRUST_SAFETY_MODULE.md](15_TRUST_SAFETY_MODULE.md)

# 20. Future Enhancement

- Global design system state catalog
- Central permission matrix for API contract
- Back Office moderation PRD
- Full offline mode beyond Feed
- Real-time cross-surface invalidation
- Server-side consent log + policy version API


## Batch A Amendments (2026-10-30)

### Coach marks (member): bubble ชี้ 4 จุดตามลำดับ `+` → search → feed tabs → bottom nav; ปุ่ม `Next`; จุดสุดท้าย `Got it`; แตะนอก bubble ปิด tour
### Coach marks (guest): จุดแรก "Sign up to create your first post." จุดสุดท้าย "Sign in to use chat, alerts and your profile."
### Legal viewer — ตัวอย่างฉบับไทย (DEC-29, ใช้ชั่วคราว รอเนื้อหาจริง)
ดู deliverables/FO-TEST-001-LEGAL-TH-draft.md — ข้อความตัวอย่างอนุมัติให้ขึ้นก่อน เจ้าของจะปรับเนื้อหาจริงภายหลัง
