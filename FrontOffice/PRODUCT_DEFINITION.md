# TukDaeng Product Definition

**Document Type:** Product Definition (product-level contract — ระดับเหนือ module specs)
**Baseline:** `FO-PRD-v1.14`
**Status:** Current — canonical product-level definition
**Supersedes:** `TukDaeng_Master_Product_Definition.md` (archived 2026-11-04 — DOC-010)

> **Doc-tier note (DOC-010, 2026-11-04):** เอกสารเล่มนี้เป็น canonical home เดียวของ product-level facts (vision, platforms, user model, terminology, phase scope) ที่ยุบจาก `TukDaeng_Master_Product_Definition.md` + `PRD.md` — behavioral contract ทั้งหมดอยู่ที่ module specs `00`–`18` ตาม `README_MODULE_INDEX.md` เท่านั้น; decision history (S-01–S-29, D2–D12) เก็บถาวรใน master เดิม §16 + `deliverables/fo-spec-sync/FSP-005-consolidated-gap-signoff.md` (ดู §9)

## 1. Product Definition

Tuk Daeng เป็น Mobile Application สำหรับ Marketplace Community ของนักสะสมนาฬิกาหรูในประเทศไทย

ระบบออกแบบมาเพื่อ:

- ให้ผู้ซื้อค้นหาและติดตามนาฬิกาที่สนใจได้ง่าย
- ให้ผู้ขายลงขายและบริหาร Asset ของตัวเองได้
- ให้ผู้ใช้เก็บและแสดงคอลเลกชันนาฬิกาของตัวเองได้
- ให้ผู้ใช้โพสต์แชร์นาฬิกา/คอลเลกชันในรูปแบบ social post โดยไม่ต้องลงขาย
- ให้ผู้ใช้พูดคุย ติดตามผู้ขาย และตั้ง Watch Alert ได้
- ให้ Admin ตรวจสอบเนื้อหา Report และบริหารระบบผ่าน Back Office

ระบบนี้ไม่ใช่:

- Social Network เต็มรูปแบบ (feed เป็น post-centric แบบ social แต่ปลายทางคือ marketplace/community ของนาฬิกา ไม่ใช่ platform social ทั่วไป)
- E-commerce ที่มีการชำระเงินในแอป
- ระบบประมูลหรือ Live Selling ใน Phase 1
- ระบบยืนยันนาฬิกาในแอปใน Phase 1

## 2. Platforms

| Platform | Scope |
| --- | --- |
| iOS | Front Office Mobile App |
| Android | Front Office Mobile App |
| Web Back Office | Admin ใช้จัดการระบบและตรวจสอบ Report |

## 3. User Model

Canonical rules อยู่ที่ `00_GLOBAL_RULES_MODULE.md` §6 (Canonical User Context) และ §7 (Session Model) — section นี้เป็น product-level summary เท่านั้น

### User

ผู้ใช้ทั่วไปมี Role เดียวกันทั้งหมดหลังสมัครสมาชิก ไม่แยก Buyer / Seller / Collector เป็นคนละ Role

User เดียวกันสามารถ:

- ซื้อหรือค้นหานาฬิกา
- ลงขาย Asset
- โพสต์แชร์นาฬิกาแบบโพสต์ทั่วไป (feed-only post ไม่ผูก asset)
- แสดงคอลเลกชัน
- ซ่อนคอลเลกชัน
- แชท
- Follow ผู้ใช้คนอื่น
- Like และ Comment
- ตั้ง Watch Alert
- จัดเก็บโพสต์ใน Saved / Wish List collections

### Owner / Viewer / Guest

- **Owner** = User ในฐานะเจ้าของ Asset ชิ้นนั้น ไม่ใช่ Role แยกต่างหาก — Owner เห็น Asset ของตัวเองทุกสถานะ (Sale / Show / Hide / Sold / ซ่อนถาวรแบบ read-only)
- **Viewer** = User หรือ Guest ที่กำลังดู Asset หรือ Profile ของคนอื่น — เห็นเฉพาะ public states (Sale / Show ตาม surface)
- **Guest** = ผู้ใช้ที่ยังไม่ sign in (session `guest`) — browse ได้ตาม guest capabilities; action ที่ต้องมีตัวตนถูก gate ด้วย Member Sheet `Join TukDaeng`

นิยามเต็ม + guest capability list + login-required actions: `00_GLOBAL_RULES_MODULE.md` §6, §7, §11

### Session Model

ระบบใช้ session 3 สถานะ `member` / `new` / `guest` — canonical table + transitions + data rules อยู่ที่ `00_GLOBAL_RULES_MODULE.md` §7

### Admin

Admin ใช้งานผ่าน Back Office เท่านั้น ไม่ใช่ actor ของ mobile app — Admin รับผิดชอบตรวจสอบ Report, moderation และจัดการ User / Asset ตาม policy (ไม่มี deadline tracking)

BO boundary: `18_ADMIN_SCOPE_NOTE.md`; BO contract: `../BackOffice/` module specs + `../BackOffice/BO_MASTER_BASELINE.md`

## 4. Feature Architecture

```
ตึกแดง App
├── Auth (ยืนยันตัวตน — onboarding, sign up/in, OTP, SSO, consent)
├── Feed (หน้าหลัก post-centric social feed)
├── Search & Filter (explore, results, sfilter → Watch Alert)
├── Chat (ระบบแชท — listing-scoped user+item threads)
├── Board (กระดานข่าว/บทความ editorial magazine)
├── Alerts (Alerts feed — การแจ้งเตือน 5 types)
└── Profile (โปรไฟล์ผู้ใช้)
    ├── Asset Management (My Assets drawer + composer)
    ├── Saved / Wish List collections
    ├── Watch Alerts (Settings > Your library)
    ├── Portfolio (Total invested dashboard — owner-only)
    └── Settings (IG-style 6 sections + account management)
```

Module spec mapping อยู่ที่ `README_MODULE_INDEX.md` §4

## 5. Canonical Terminology

| Canonical Term | Meaning |
| --- | --- |
| Asset | นาฬิกาแต่ละเรือนในระบบ (drawer record ใน My Assets / Portfolio) |
| Post | โพสต์บน feed/profile — อาจผูก asset (`pfkind` = sale/show/hide/sold) หรือเป็นโพสต์ธรรมดาไม่ผูก asset (`post` — feed-only ไม่นับเป็น asset status) |
| Sale | Asset ที่เปิดขายและ Public |
| Show | Asset ที่แสดงเป็นคอลเลกชัน Public แต่ไม่ได้ขึ้น Marketplace |
| Hide | Asset ที่ซ่อน เห็นเฉพาะ Owner |
| Sold | Asset ที่ขายแล้ว เห็นเฉพาะ Owner |
| ลบโดยเจ้าของ | Asset ที่เจ้าของเป็นผู้ลบจาก Front Office; ไม่แสดงใน owner list ปกติหรือ public surfaces แต่ backend/BO เก็บ record ตาม retention policy |
| ซ่อนถาวร | Moderation state จาก Back Office สำหรับ asset ที่ไม่ควรแสดงต่อสาธารณะ; owner ยังเห็นแบบ read-only แต่แก้ไขหรือ delete เองไม่ได้ (contract — prototype ไม่ครอบ) |
| Post Detail | `.page-detail` — detail layer เหนือ viewer; asset-detail equivalent เดียวของ V1 ไม่มี "Asset Detail page" แยก (canonical `00_NAV` §6.1) |
| Post Viewer | `.page-pv` — immersive full-screen viewer (feed/pfp/explore modes) |
| Owner Profile | โปรไฟล์ของ User เอง เห็น post/asset ตัวเองทุกสถานะรวม `post` |
| Public Profile | โปรไฟล์ของ User อื่น เห็นเฉพาะ Asset สถานะ Sale และ Show |
| Watch Alert | การตั้งเงื่อนไขแจ้งเตือนเมื่อมี Asset Sale ที่ตรง Criteria |
| Member Sheet | bottom sheet `Join TukDaeng` — guest gate เดียวของระบบ (เดิมเรียก Global Login Required Dialog) |
| Alerts feed | หน้าแจ้งเตือนในแอป (เดิมเรียก Notification Center) — like/comment/follow/watch rows |
| Liked | flag per-post — โพสต์ที่ user กด like; รายการอยู่ Settings > Content preferences > Interested |
| Favorites | account-level favorite sellers — ใช้เป็น feed filter tab `Favorites`; **ไม่ใช่** liked posts |
| Saved / Wish List | private post collections ของ user (hub + collection CRUD) |
| Sale Record | record ของ Sold Asset — เก็บเฉพาะ Sale Price + Sale Date (V1) |
| Total invested | headline ของ Portfolio dashboard = Σ purchase price (cost basis) ของ eligible assets |

### Legacy Term Mapping

| Term จาก PRD เดิม | Canonical Term |
| --- | --- |
| Collection Show | Show |
| Collection Hide | Hide |
| Viewer Profile | Public Profile |
| Asset Detail (page) | Post Detail (`.page-detail`) |
| Global Login Required Dialog | Member Sheet `Join TukDaeng` |
| Notification Center | Alerts feed |
| Total Asset Value (headline/entry) | Total invested (Σ purchase) + wallet icon `.pf-pfo` entry |
| Hide this asset (feed menu) | Not interested (viewer-level feedback loop) |

## 6. Phase 1 Exclusions

ไม่รวมใน Phase 1 (product-level scope boundary — out-of-scope ราย module อยู่ใน module spec นั้น ๆ):

- ระบบชำระเงินออนไลน์ในแอป
- Offer / price negotiation system (ถอดออกจาก baseline แล้ว — ไม่มี Offer entity, card, notification หรือ Accept/Reject flow)
- Live Streaming
- Watch Authentication Service ในแอป
- Watch Shops
- Accessories Shop
- Repair Shop
- Auction Center
- Consignment Center (ไม่มี entity/flow/copy/flag — เหลือเฉพาะ drawer placeholder row; consignment ถูกตัดออกจาก FO ทั้งหมดตาม `DEC-50`)
- Authentication Center
- Watch Brands / Watch Price Index / Community (drawer placeholder rows เท่านั้น — กดแล้ว toast)
- Multi-level Nested Comment เกิน 1 reply level
- Edit Comment
- Verified Badge
- Status Badge บน Feed Card
- Real-time Feed Refresh สำหรับ Asset ใหม่, Like จากอุปกรณ์อื่น และ Comment จากอุปกรณ์อื่น
- End-of-list marker บน Feed
- Search Sort UI, result count, saved search, Popular Filter context-aware
- Watch Alert Result List destination
- Native OS share sheet + real deep-link mechanism (contract เท่านั้น)
- Full Screen Image Viewer
- Inline comment section บน Post Detail
- Chat File / Asset Card message types, E2E encryption, room settings page
- Market Data autocomplete / option-master / provenance entity ใน composer
- Top Brand Holdings / YTD Performance / portfolio benchmark-export
- User-generated Board content, Article Comment, Saved Article
- `Price on request` label (price optional ทุก status — ไม่มี price = showcase)

## 7. Source Of Truth Order

หากเอกสารมีเงื่อนไขไม่ตรงกัน ให้ตัดสินตามลำดับ:

1. `PRODUCT_DEFINITION.md` (เอกสารนี้) — product-level framing เท่านั้น (vision, platforms, user model, terminology, phase scope)
2. `00_GLOBAL_RULES_MODULE.md`
3. `00_NAVIGATION_AND_CROSS_MODULE_FLOW.md`
4. Module PRD รายโมดูล `01`–`18`
5. Superseded tier — `TukDaeng_Master_Product_Definition.md`, `PRD.md`, `FO_Functional_PRD.md`, `Use_Cases.md`, `../PRD/` (archived 2026-11-04; เก็บเพื่อ traceability เท่านั้น ไม่ใช่ contract)

หลักการตัดสินความขัดแย้ง (ตาม `00_GLOBAL_RULES_MODULE.md` §15):

- ใช้สถานะ canonical: `Sale`, `Show`, `Hide`, `Sold` (+ kind `post` สำหรับโพสต์ไม่ผูก asset)
- ใช้ Owner / Viewer เป็น context ไม่ใช่ Role
- Session ใช้ 3 สถานะ `member` / `new` / `guest`
- Feed เป็น post-centric (โพสต์ `Sale` + `post`); Search และ Watch Alert ใช้เฉพาะ `Sale`
- Public Profile ใช้ `Sale` และ `Show`
- Owner Profile เห็นทุกสถานะ
- Hide และ Sold ต้องไม่ Public
- Guest gate ใช้ Member Sheet `Join TukDaeng` — share รวมอยู่ใน gate (ต้อง login)
- Notification types ใช้ Like, Comment, Follow, Watch Alert, System (3 subtypes — DEC-43)
- ไม่มี Payment ภายในแอปใน Phase 1
- จุดที่ prototype มี documented defect (`salePosts()` pfkind leak, public `all` tab leak) ให้ยึด spec contract ไม่ใช่พฤติกรรม defect

## 8. Module Spec Authoring Checklist

ทุก module spec (`00`–`18`) ต้องมีหัวข้อต่อไปนี้:

- Purpose
- Screen Mapping
- User State
- User Flow
- Business Rules
- Permission Rules
- Validation Rules
- Exception Handling
- Empty State
- Notification Rules
- Analytics Events
- Acceptance Criteria
- Related Modules
- Future Enhancement

Acceptance Criteria ต้องเขียนให้ QA ทดสอบได้โดยไม่ต้องตีความเพิ่ม

## 9. Decision History & Archived Documents

| Document | Role |
| --- | --- |
| `TukDaeng_Master_Product_Definition.md` | Archived master — §16 Sync Decision Log (S-01–S-29 + D2–D12) คงเป็น record of record ของ S-xx; canonical index ของ decision ทั้งระบบอยู่ที่ `../docs/DECISION_LOG.md` (DOC-030) |
| `../docs/DECISION_LOG.md` | Canonical decision log index ของทั้งระบบ (FO + BO) — S-xx / DEC-xx / DEC-R010-xx / e-x / OPEN-x / BO module `XXX-DEC-xxx` / money `O-xx`; เอกสารอื่นอ้าง DEC id อย่างเดียว ห้าม duplicate decision text |
| `deliverables/fo-spec-sync/FSP-005-consolidated-gap-signoff.md` | Consolidated sign-off ของ spec sync mission (canonical decision source) |
| `PRD.md`, `FO_Functional_PRD.md`, `Use_Cases.md` | Assumption docs ยุคก่อน prototype lock — superseded |
| `../PRD/` | Original requirement docs (May 2568) — superseded |
| `DOCUMENT_VERSION.md` | Version registry — baseline `FO-PRD-v1.x` |
| `README_MODULE_INDEX.md` | Module index + reading path |
