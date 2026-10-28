# FSP-005 — Consolidated Gap Inventory + Removal List + Sign-off Package

วันที่รวม: 21 ต.ค. 2026
Mission: Sync FrontOffice Spec ให้ตรง fo-flow Prototype (FO-PRD-v1.9) — เป้าหมาย 1 (Prototype Audit & Gap Inventory) → gate ก่อนเป้าหมาย 2 (Removal)
Source of truth: `Prototypes/fo-flow/index.html` (read-only — verified `git status --porcelain Prototypes/` ว่างทุกขั้น)
Gap files ต้นทาง (7 ไฟล์): `gap-FSP-001a-auth.md`, `gap-FSP-001b-nav.md`, `gap-FSP-002a-feed-search.md`, `gap-FSP-002b-create-saved-wa.md`, `gap-FSP-003a-profile-portfolio.md`, `gap-FSP-003b-chat-notifications.md`, `gap-FSP-004-board-settings.md`

---

## 1. Audit Coverage Summary

| Gap file | Spec เทียบ | Prototype-only (A) | Spec-only (B) | Conflicts (C) |
|---|---|---|---|---|
| FSP-001a auth | 01_AUTHENTICATION | 13 กลุ่ม | 10 | 8 |
| FSP-001b nav | 00_GLOBAL + 00_NAV | 10 กลุ่ม | 12 | 9 |
| FSP-002a feed-search | 02_FEED + 03_SEARCH | 15 กลุ่ม | 20 | 21 |
| FSP-002b create-saved-wa | 10_WATCH_ALERT + 11_SOCIAL (+04) | 11 กลุ่ม | 12 | 13 |
| FSP-003a profile-portfolio | 06_PROFILE + 14_PORTFOLIO | 14 กลุ่ม | 23 | 19 |
| FSP-003b chat-notifications | 07_CHAT + 09_NOTIFICATION | 10 กลุ่ม | 20 | 19 |
| FSP-004 board-settings | 12_BOARD + 13_SETTINGS | 13 กลุ่ม | 23 | 17 |
| **รวม (ก่อน dedupe)** | | **86 กลุ่ม** | **120** | **106** |

หมายเหตุ: ตัวเลขดิบนับซ้ำข้ามไฟล์ — หลัง dedupe (§2) เหลือประเด็นจริง ~25 กลุ่มใหญ่

---

## 2. Dedupe Map — ประเด็นที่ซ้ำข้าม gap files → canonical item เดียว

| # | Canonical finding | ปรากฏใน (cross-refs) | สถานะ |
|---|---|---|---|
| D1 | Guest gate = member sheet "Join TukDaeng" (title/ปุ่ม/scrim-dismiss) ไม่ใช่ Global Login Required Dialog ตาม spec | 001a C3 · 001b B2 · 003b C7 · 004 C6 | conflict — เขียน spec ตาม sheet (default) |
| D2 | **Guest share gate** — `.share-btn`/`.pf-share`/`.pf-sh-share`/`data-bdshare` อยู่ใน GUEST_GATE_SEL แต่ spec อนุญาต guest share | 002b C10 · 003a C10 · 004 C5 (AC-BOARD-010A/PROFILE-018A) | **→ S-03 sign-off** |
| D3 | **WA destination** — ไม่มี Result List; WA notification เปิด post viewer ตรง | 001b C1/B3 · 002a B15 · 002b B1/C5 · 003b C12 (AC-NAV-010/WA-006/NOTI-007) | **→ S-08 sign-off** |
| D4 | **Feed = social post-centric** (sale+showcase+`pfkind:"post"`) ขัด global rule "Feed เฉพาะ Sale" | 001b C6 · 002a C1/A1 · 003a C18 | **→ S-09 sign-off** (conflict หลักของ mission) |
| D5 | "Asset Detail" ของ spec ↔ prototype มี 2 layers: `.page-detail` + `.page-pv` viewer — ทุก spec ใช้คำเดียว | 001b C3 · 002a C5/C6 · 002b C8 · 003a C4 · 003b C13 | ต้องนิยาม mapping ใน 00 ก่อน (FSP-010/011) |
| D6 | `salePosts()` ไม่กรอง pfkind → hide/sold priced posts รั่วเข้า search results + WA match | 002b C4 · 003a C17 | **→ S-10 sign-off** (defect vs definition) |
| D7 | Like ≠ Favorites — liked posts ไป Interested list; Favorites = favorite sellers (account-level) | 002a C7 · 002b C7 | เขียน spec แยก 3 ระบบ (default) |
| D8 | Comment sheet เปิดได้ทุก surface ไม่ผ่าน detail + composer input dead | 001b C3 · 002a C6 · 002b B7/B12/C8 | **→ S-12 sign-off** (composer scope) |
| D9 | Report flow = IG full-page multi-step (reasons → report:done + other steps) ไม่ใช่ bottom sheet | 002a C11/B16 · 003a C11/B8 · 003b A6 | เขียน spec ตาม prototype (default) |
| D10 | Block confirm = IG bottom sheet `Block {user}?` + impact rows (ไม่มี Cancel) | 003a C9/B7 · 003b C6/B5 | เขียน spec ตาม prototype (default) |
| D11 | `.set-btn` dead handler — settings เข้าผ่าน `.pf-menu` เท่านั้น | 001b A10 · 004 C15 | dead-code list (RL-04) |
| D12 | Notification destinations = post viewer / profile — ไม่มี asset detail, focus comment, result list, unavailable states | 001b A8 · 003b A9/C12/C13/C15 | รวม S-08 + contract-only states |
| D13 | `system` notification type (security "new device logged in") นอก baseline — dead toast | 001b A7/C2 · 003b C11/A8 | **→ S-17 sign-off** |
| D14 | Naming drift: Notifications vs Alerts; Board vs Boards | 001b C7 · 003b C19 · 004 C14/B21 | terminology sweep FSP-026 (default) |
| D15 | Empty/error copy drift + EN-hardcode ทั่ว prototype (search/WA/saved/wl/QR/block/settings) | 002a B17/C21 · 002b B3/B11 · 003a B21 · 003b C10 · 004 B8/C13 | Language + copy sweep FSP-026 (default) |
| D16 | Deep link ไม่มีเลยทั้งแอป (share=mock toast) | 001b B1 · 002b B8 · 003a B18 · 004 B5 | contract-only keep (default) |
| D17 | Analytics tables ทุกเล่ม — ไม่มี tracking layer | 001a B10 · 001b B11 · 002a B19 · 002b B10 · 003a B20 · 003b B13 · 004 B18 | contract-only keep (default) |
| D18 | Suspended/Banned/account-status check ไม่มี | 001a B5/C8 · 001b B10 | contract-only keep (default) |
| D19 | Guest กด feed tabs Following/Favorites ได้ ไม่ gate | 002a C3 (AC-FEED-008) | **→ S-16 sign-off** |
| D20 | Chat entry = listing-scoped เท่านั้น (`pf-msg`/follower-row Chat = dead toast) | 003a C15/B12 · 003b C17 | เขียน spec ตาม prototype (default) |
| D21 | Unfollow 3 พฤติกรรมตาม surface (confirm sheet / instant / toggle) | 003a C19 | เขียน spec แยก surface (default) |
| D22 | Prototype artifacts (dev buttons, demo acct/OTP, design variants, `?dev`, PFO_SIMS, POST_DETAIL_CFG) | 001a A13 · 001b A10 · 003a A14 | ไม่เขียนลง spec (default) |
| D23 | Delete-account legacy dialog variant dead (`delAccountDlgHTML`/`data-dlg="del-account"`) | 004 A8/C15 | dead-code list (RL-04) |
| D24 | Article menu dead ทั้งก้อน (`data-bdmore`/`data-bdsave`/`a.saved`/`data-bdact`) | 004 A4/C7/C15 | **→ S-04 sign-off** |
| D25 | Chat dead routes + claims: `chsettings:` ไร้ entry, `.chat-pop`/`.cp-*` unreachable, E2E/Letter Sealing claim | 003b A4/A5 · 003b note FSP-009 | dead-code list + **→ S-18 sign-off** |

---

## 3. Removal List (เป้าหมาย 2 — ลบจริง ไม่ mark deprecated)

`offer` grep count ทั้ง FrontOffice/ = ~1,145 hits; `figma` = ~305 hits (รวมไฟล์ที่จะลบทิ้งเอง)

### RL-01 → FSP-006: ลบ 08_OFFER_MODULE + offer refs ใน module specs

- [ ] ลบ `08_OFFER_MODULE.md` ทั้งไฟล์ (offer ×265)
- [ ] `07_CHAT_MODULE.md` (offer ×90) — §2/§4/§6/§9/§10/§15/§16/§17: Offer Card 6 states, Incoming Offers view/filter, Make-Offer→Chat flow, AC-CHAT-016–021B ทั้งก้อน (ref: 003b B4)
- [ ] `09_NOTIFICATION_MODULE.md` (×55) — Offer type rows + offer→chat/asset destinations + ACs (003b B14/B15)
- [ ] `05_ASSET_DETAIL_MODULE.md` (×45) — ยังไม่ได้ audit เจาะ; sweep ตอน FSP-006
- [ ] `04_ASSET_MANAGEMENT_MODULE.md` (×32) — sweep ตอน FSP-006/017
- [ ] `00_NAVIGATION_AND_CROSS_MODULE_FLOW.md` (×16) — §4, §8/§9 matrix, §10, §16, AC-NAV-009/013 (001b D)
- [ ] `02_FEED_MODULE.md` (×9) — guest forbidden "Make Offer", mark-as-sold auto-reject, Delete→`Cancelled`, AC-FEED-017B, block copy "ส่งข้อเสนอใหม่" (002a B18)
- [ ] `00_GLOBAL_RULES_MODULE.md` (×8) — sweep
- [ ] `13_SETTINGS_MODULE.md` (×7) — notif Offer toggle §10/AC-SETTING-012 + retention copy "offers" §10 + §2/§4 (004)
- [ ] `06_PROFILE_MODULE.md` (×6) + `15_TRUST_SAFETY_MODULE.md` (×5) — sweep
- [ ] `03_SEARCH_FILTER_MODULE.md` (×3) — `Make Offer From Search` analytics (002a D)
- [ ] `01_AUTHENTICATION_MODULE.md` (×1) — guest forbidden list "Make Offer" (001a C5/D)
- [ ] `README_MODULE_INDEX.md` (×5) — module listing ตัด 08

### RL-02 → FSP-007: offer refs ในเอกสารกลาง + checklists + use cases

- [ ] `QA_TEST_SCENARIO_CHECKLIST.md` (×70)
- [ ] `DEV_IMPLEMENTATION_CHECKLIST.md` (×44)
- [ ] `DEV_CHAT_IMPLEMENTATION_CHECKLIST.md` (×43)
- [ ] `TukDaeng_Master_Product_Definition.md` (×35)
- [ ] `Use_Cases.md` (×32)
- [ ] `PRD.md` (×12)
- [ ] `FO_Functional_PRD.md` (×9)
- [ ] `DEV_BASELINE_HANDOFF_2026-06-22.md` (×6)
- [ ] `FINAL_HANDOFF_SUMMARY.md` (×4)
- [ ] `README_MODULE_INDEX.md` (×5 — ทำร่วม RL-01)

### RL-03 → FSP-008: Figma files + Figma Gap sections + refs

- [ ] ลบ `Figma_Gap_Checklist_Against_Master.md` ทั้งไฟล์ (figma ×47, offer ×28)
- [ ] ลบ `FIGMA_UX_CLEANUP_TASK_BREAKDOWN.md` ทั้งไฟล์ (×36, offer ×26)
- [ ] Figma refs/sections ใน module specs — ทุกเล่มมี ~2–7 hits (sweep ตาม grep ตอนทำ)
- [ ] `README_MODULE_INDEX.md` (×21) — index entries
- [ ] `DOCUMENT_VERSION.md` (×28) — **ระวัง**: ส่วนใหญ่น่าจะเป็น history/changelog entries — ลบเฉพาะ live refs ห้ามแตะประวัติ version เก่า
- [ ] `FINAL_HANDOFF_SUMMARY.md` (×13) + `DEV_BASELINE_HANDOFF_2026-06-22.md` (×9)

### RL-04 → FSP-009: dead features + sweep refs แหว่ง

**Prototype-side dead code (ไม่แก้ prototype — แค่ "ไม่เขียน spec รองรับ" + บันทึกใน spec ว่าไม่มี):**
- [ ] `.set-btn` dead handler (settings entry = `.pf-menu` เท่านั้น) — 001b/004
- [ ] `chsettings:` route ไร้ entry (ทั้งหน้า per-room settings เป็น dead) — 003b A4
- [ ] `.chat-pop`/`.cp-*` DM popup path + `chat-fab` (ต้อง `ask:"bubble"` — unreachable) — 003b A5, 002a A7
- [ ] `data-bdmore` article menu ทั้งก้อน + `data-bdsave` + `a.saved` + `data-bdact` — 004 A4
- [ ] `delAccountDlgHTML` + `data-dlg="del-account"` + `.dlg-delaccount-go` (variant เก่า) — 004 A8/C15
- [ ] `pf-msg`/`pf-uname`/`pf-note`/`pf-sleep`/`pf-atch`/avatar-overlay QR/`pe-pic` dead toasts — 003a A14
- [ ] Drawer 9 items dead handlers (toast "Not in this prototype yet") — 001b A2 (spec-side: เขียนเป็น placeholder rows หรือตัด → S-19)
- [ ] `lk-follow` visual-only (ไม่ sync `setFollowing`) — 002b A11/D
- [ ] Design variants dead: card a2/b2/c2/a3/b3/c3/mixed, `ft:"none"` brand-menu, `data-nav` icons variant — 001b A10, 002a A6

**Spec-side dead/orphan (ตัดออกตาม decision ใน §4):**
- [ ] "Make Offer" strings ที่หลุด RL-01/02 → sweep จบ
- [ ] Spec-only features ที่ตัดสินให้ลบ (รอ sign-off §4 — เช่น WA Result List, sort UI, Popular Filter, Report Article ถ้าตัด, read-receipts toggle)

---

## 4. Sign-off Package — ข้อที่ต้องตัดสินก่อนเริ่ม removal/update

Format: ตอบต่อข้อ เช่น `S-01=A`, `S-02=B`, หรือ "เห็นด้วย default ทั้งหมดยกเว้น S-xx=..."

### 4.1 Primary items (บล็อก removal/rewrite โดยตรง)

| # | ประเด็น | ตัวเลือก | คำแนะนำ | ผลกระทบ |
|---|---|---|---|---|
| **S-01** | Board model — spec บังคับ 7 master sections (Feature Article/Trending Now/Journal Board/Watch Brands/Watch 101/Watch Apparel/Watch Events); prototype = editorial magazine (hero carousel + Latest + freeform category tags) | **A)** เขียน spec เป็น magazine model, master sections → category taxonomy (หรือตัดทิ้ง) / **B)** บังคับ 7-section model (spec ขัด prototype ถาวร) | **A** — spec ตาม prototype + master sections ไม่มีหลักฐาน implementation เลย | FSP-023, master baseline AC-BOARD-002 |
| **S-02** | Delete account grace-period semantics — spec: login blocked/`Account scheduled for deletion` state; prototype: **"log back in anytime within 30 days to cancel deletion"** (login-to-restore) | **A)** login-to-restore (ตาม prototype — สอดคล้อง BO Account Deletion restore flow ที่ lock แล้ว) / **B)** login blocked + support state ตาม spec เดิม | **A** — BO side มี restore flow อยู่แล้ว ทำ B จะขัด BO baseline | FSP-014, spec 13 §10 + AC-SETTING-010B |
| **S-03** | Guest share gate — spec 3 จุดอนุญาต guest share (AC-BOARD-010A, AC-PROFILE-018A, spec 11 §10); prototype gate share ทุก surface | **A)** gated ตาม prototype (เขียน spec = share ต้อง login) / **B)** spec บังคับ guest-share-allowed (prototype ต้องแกะออกจาก gate ตอน implement) | **A** — สอดค้อง gate model เดียวกันทั้งแอป; ถ้า product อยากให้ share ฟรีเพื่อ growth ค่อยแก้ภายหลัง | FSP-011/022/023 gate list |
| **S-04** | Report Article — spec มี locked flow ครบ (reason sheet 6 ข้อ + success modal + duplicate/error); prototype **ไม่มี implementation เลย** (article overflow menu = dead code ทั้งก้อน) | **A)** เก็บ spec เป็น contract-only ( Trust & Safety handoff เป็น compliance — ระบุชัด "prototype ไม่ครอบ") / **B)** ตัดออกจาก spec จนกว่าจะ implement | **A** — report flow เป็น legal/compliance surface; เขียนไว้เป็น contract แล้วจด dead-code ใน RL-04 | FSP-023 (spec) + FSP-009 (dead list) |
| **S-05** | Settings home structure — spec lock 5 sections (Account มี Edit profile+Change password+About); prototype = IG 6 sections เพิ่ม Your library + What you see, Account เหลือ About row เดียว (Edit profile อยู่ profile page, Change pwd อยู่ใน About>Security) | **A)** adopt IG 6-section + Edit profile entry = profile page เท่านั้น / **B)** adopt 6-section แต่เพิ่ม Edit profile row ใน Account (ต้องเพิ่ม prototype) / **C)** บังคับ spec เดิม | **A** — ตาม prototype ทั้งโครง; Edit profile เข้าถึงได้จาก own profile อยู่แล้ว | FSP-013 (+ C9 ownership library/what-you-see) |
| **S-06** | Notification settings scope — spec 13: in-scope (§6/§10 + AC-SETTING-012) vs spec 09 §6: preference center **out of scope V1** — internal contradiction; prototype มี `notif_settings` 4 toggles จริง | **A)** in-scope ทั้งสองเล่ม ตัด Offer toggle ออก (ตาม prototype) / **B)** out-of-scope ทั้งคู่ | **A** — resolve contradiction + ตาม prototype | FSP-013/021 |

### 4.2 Secondary items (flag "ต้องตัดสิน" จาก gap files — default = ตาม prototype ทั้งหมด)

| # | ประเด็น | Default (spec ตาม prototype) | ทางเลือก B | Owner |
|---|---|---|---|---|
| **S-07** | Chat thread model — key = user+item (ห้องใหม่ทุก asset) vs same-user-merge (AC-CHAT-003/004) | per user+item | merge room ตาม spec | FSP-020 |
| **S-08** | WA notif destination — post viewer direct vs Result List (AC-NAV-010/WA-006/NOTI-007) | post viewer direct (ไม่มี Result List) | สร้าง Result List | FSP-021 |
| **S-09** | Feed model — social post-centric (sale/showcase/plain post) vs Sale-only marketplace | post-centric — เขียน 00_GLOBAL §9/§14 + 02 ใหม่ | บังคับ Sale-only | FSP-010/015a |
| **S-10** | `salePosts()` pfkind leak — hide/sold priced posts ถูกนับเข้า search + WA match | **flag เป็น prototype defect** + spec เขียน Sale=status sale เท่านั้น (ไม่แก้โค้ดใน mission นี้ แต่ระบุใน spec) | spec นิยาม "sale"=priced post ทุกสถานะ (รับ leak) | FSP-016/021/024 |
| **S-11** | WA details — name auto-fill vs required (AC-SEARCH-031A/WA-004A); delete instant vs confirm (AC-WA-011); edit name+mode-only vs criteria editable | auto-name, instant delete, name+mode-only | บังคับ spec rules | FSP-021 |
| **S-12** | Comment — composer input dead (view-only) vs spec comment composer จริง | เขียน spec เป็น view-only mock + composer = contract "ยังไม่ implement" | เขียน composer เต็มเป็น contract | FSP-022 |
| **S-13** | Blocked profile — IG keep-page (grid ว่าง + Unblock) vs `Profile is unavailable` state | IG keep-page | unavailable state | FSP-019 |
| **S-14** | Public All tab รั่ว hide/sold/post — privacy leak ตาม spec | **flag defect** + spec เขียน viewer filter (public = sale/show เท่านั้น) | รับ post-grid-all (public เห็นหมด) | FSP-019 |
| **S-15** | Portfolio headline — Total invested (Σ purchase) vs Total Asset Value (Σ current) | invested-centric | current value | FSP-024 |
| **S-16** | Guest feed tabs — Following/Favorites ไม่ gate vs AC-FEED-008 gate | ไม่ gate (IG) | gate tabs | FSP-015a |
| **S-17** | `system` notif type (security login alert) — เก็บเป็น type ที่ 5 vs ตัด | เก็บเป็น type ใหม่ (มี seed จริง) | ตัด (dead toast) | FSP-021 |
| **S-18** | Chat E2E/Letter Sealing claim (footer + dead chsettings) — เขียนเข้า spec ไหม | **ไม่เขียน** (claim โดยไม่มี feature = risk) | เขียนเป็น feature claim | FSP-020/009 |
| **S-19** | Hamburger drawer 9 items (all dead toast) — เขียน spec เป็น placeholder rows vs ตัดทิ้ง | เขียนเป็น future/placeholder (กดแล้ว toast) | ตัดเมนู | FSP-011 |
| **S-20** | Spec-only auth UI states — Confirm Password field, OTP expiry 30min, Verification Success, Reset Password page | ตัด (prototype ไม่มี — spec ตาม prototype) | เก็บเป็น contract | FSP-012a/b |
| **S-21** | Password policy — spec 8+num/sym vs signup score≥2 vs chg-pwd 6 ตัว | unify spec rule เดียว (แนะนำ 8+num/sym ตาม spec) + จด prototype deviate | ตาม prototype แต่ละจุด | FSP-010/012a/014 |
| **S-22** | OTP→login — email signup ไม่ auto-login (Account created→Sign in) vs spec auto-auth | ตาม prototype (email=sign in, social=instant) | auto-login ทั้งคู่ | FSP-012a |
| **S-23** | Recent Search — spec out-of-scope V1 vs implemented เต็มระบบ | เขียนเข้า scope | คง out-of-scope | FSP-016 |
| **S-24** | Search sort UI — spec 5 ตัวเลือก vs ไม่มีเลย | spec = ไม่มี sort | เขียน contract | FSP-016 |
| **S-25** | Provenance/consignment — spec 04 บังคับ step + 14 มี exclusion rule; prototype ไม่มี entity เลย | ตัด provenance/consignment (สอดคล้อง S-12-composer model) | เก็บเป็น contract | FSP-017/024 |
| **S-26** | Like count — private (แสดงเฉพาะ own post) vs public count | private (IG) | public | FSP-022 |
| **S-27** | Delete account flow — 2-page (terms→reason→password→scheduled→guest) vs spec single-dialog→Sign In | ตาม prototype | spec เดิม | FSP-014 |
| **S-28** | Change password — in-settings page (6-char helper) vs Auth-linked | in-app page + unify helper (S-21) | route ไป auth | FSP-014 |
| **S-29** | Contract-only keep (auto): deep link, analytics, suspended/banned, network/error states, HTTPS/token, file message type, unavailable ref states | เก็บใน spec + ระบุ "prototype ไม่ครอบ" | ตัด | ทุก FSP-01x |

### 4.3 Auto-resolved (ไม่ต้องตัดสิน — ตาม baseline "spec ตาม prototype")

- Guest gate copy/dialog → member sheet pattern (D1)
- Report flow → IG full-page multi-step (D9); Block confirm → IG sheet (D10)
- Comment sheet → เปิดได้ทุก surface (D8 — composer อยู่ S-12)
- Like/Favorites/Interested = 3 ระบบแยก (D7); Unfollow 3 พฤติกรรม (D21)
- Chat entry = listing-scoped only (D20); notifications destinations = post viewer/profile (D12)
- Naming/copy sweeps → FSP-026 (D14/D15); contract-only keep (D16/D17/D18 → S-29)

---

## 5. Execution Order หลัง sign-off

```
sign-off §4 → FSP-006 (RL-01) → FSP-007 (RL-02) → FSP-008 (RL-03) → FSP-009 (RL-04)
           → FSP-010/011/012a/012b/013/014 → FSP-015a–024 → FSP-025/026/027/028 → FSP-029/030
```

- ทุก removal task: `grep -i offer|figma` per file ก่อนแก้ + sweep refs แหว่งก่อนปิด
- ทุก update task: อ่าน gap file ของตัวเอง + cross-module notes จากไฟล์อื่นที่เกี่ยว
- FSP-029 verify สุดท้าย: `git status --porcelain Prototypes/` ต้องว่างเสมอ

---

## 6. ข้อสังเกตเพิ่มเติม (ไม่ใช่ sign-off แต่ควรรู้)

- **Mock bug**: `state.userPwd` (chg-pwd) vs `state.mockPassword` (del-account, ค้าง `fox1234`) — เปลี่ยนรหัสแล้ว delete ยังรับรหัสเก่า (004 A7)
- **Spec ขัดกันเองอยู่แล้ว** (นอก S-06): spec 07 §1.1 vs §10 (delete copy, Report-and-delete, menu 3 vs 4-5 actions) — resolve ตอน rewrite
- **Rewrite-heavy specs** (ไม่ใช่ patch): 02_FEED, 03_SEARCH, 06_PROFILE, 12_BOARD — prototype-only content มากกว่าสิ่งที่ spec มี
- **Medium rewrite**: 00_NAV (เพิ่ม bottom nav + layer model), 04 (composer model), 07 (post-§1.1 sections), 13 (IG sections + delete flow), 14 (invested headline)
- **Light touch**: 01 (เพิ่ม onboarding/consent/session), 09/10 (destinations+types), 11 (เขียนใหม่ social systems)
