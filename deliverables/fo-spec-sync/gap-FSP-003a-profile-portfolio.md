# FSP-003a — Gap Inventory: Profile / Portfolio

วันที่สแกน: 21 ต.ค. 2026
Source of truth: `Prototypes/fo-flow/index.html` (read-only — QR system ~13748–13854, own-post menu ~13920–13935, mute/unfollow dialogs ~14712–14718 + ~21859–21898, soldFromPost/assetFromPost ~15929–15958, pfkind fields ~16014–16097, PF_ASSETS/PF_SOLD/eligible/calc ~16316–16382, profileOf/PROFILES ~16287–16417, grid/gfx ~16418–16636, follow/fav/mute/block state ~16637–16738, about page ~16739–16765, mf sheet ~16766–16779, profileHTML ~16788–16899, pfollow ~16900–16937, pedit ~16938–16956, portfolio pages ~16958–17149, settings/library rows ~17159–17206, route table ~17567–17583, profile handlers ~21303–21784 + ~19000, guest gate ~22996–23006)
เทียบกับ: `FrontOffice/06_PROFILE_MODULE.md` + `FrontOffice/14_PORTFOLIO_MODULE.md`

**Note ขอบเขต:** profile/portfolio ใน prototype เป็น IG-style social profile + owner-only portfolio — โมเดล post-centric (grid = posts ที่มี pfkind) ไม่ใช่ asset grid ตาม spec; หลายส่วนที่ spec 06 เขียนเป็น asset-card/quick-action จึงไม่มีตัวตนเลย ส่วน portfolio มีจริงแต่ headline semantics ต่างจาก spec (ต้นทุน vs มูลค่าปัจจุบัน)

---

## A. Prototype มี แต่ Spec 06/14 ไม่มี (→ ต้องเพิ่มใน spec ตอน FSP-019/024)

### A1. Profile = IG social profile เต็มรูปแบบ (ไม่ใช่ asset-owner card)
- `profileOf` + `PROFILES` seed: avatar (+story ring), username, disp name, category (`Media/news company`, `Watch shop`), bio multi-line, link chip (URL หรือ `@handle`), **verified badge** (PF_VBADGE — spec บอก out of scope V1), stats posts/followers/following (mock deterministic จาก char-code hash ถ้าไม่ seed)
- IG extras: `pf-note` (IG note bubble — dead toast), `pf-sleep` "อยู่ในโหมดสลีป" chip (dead toast), `pf-fby` "ติดตามโดย X และ Y others" followed-by row (avatar stack ≤3), `pf-atch` @-link chip บน viewer bio
- ทุก surface เปิด profile ผ่าน `data-pf-user` (avatar/name บน feed card/detail/comments/likes/search/chat menu) → `pushSub("profile:"+name)` — guest กดได้ ไม่ gate (action ข้างใน gate แยก)

### A2. Owner Profile head + actions แบบ IG (ไม่มี "..." menu, ไม่มี Total Asset Value)
- Head: `+` (composer **asset mode**) + `pf-uname` (username button → toast `Signed in as X` — IG account-switcher แต่ dead) + `pf-menu` burger → **pushSub "settings" ตรง** (ไม่เปิด sheet)
- Action row: `Edit profile` + `Share profile` (→ QR overlay ดู A3) + **icon wallet `pf-pfo`** → `data-sub="portfolio"` — entry เป็น icon ล้วน ไม่มีตัวเลข Total Asset Value บนโปรไฟล์ (ดู C1)
- Empty own "ทั้งหมด" tab → CTA `เพิ่มสินทรัพย์ใหม่` (asset mode); copy `สินทรัพย์ที่บันทึกและโพสต์ที่แชร์จะแสดงที่นี่`

### A3. Share profile = QR overlay system (pf-qr) — spec ไม่มีเลย
- `pf-share` → `pfOpenQr`: overlay เต็มจอ — QR card (real QR จาก `pfProfileLink` = `https://tukdaeng.app/u/{user}` ผ่าน qrcode lib, วาดเป็น SVG dots + finder + `@USERNAME`), ปุ่ม **COLOR** วน theme (PF_QR_THEMES), **Scan QR** เปิดกล้องจริง (`getUserMedia` + `BarcodeDetector` → toast `Profile QR scanned`/`QR code scanned`), actions: Share profile (→ shareSheet ทั่วไป), Copy link (→ `Link copied`), Download (render PNG 1080px → `QR code saved`)
- Avatar tap (`data-pfav`) → `pfAvovHTML` overlay: รูปใหญ่ + actions Follow/Share/Copy link/QR — **QR ใน overlay นี้ dead** (`QR code isn't in this prototype yet`) ขัดกับ pf-share ที่เปิด QR จริง (inconsistency ในตัวเอง)
- Viewer `pf-sh-copy` "Copy profile URL" → toast `Profile link copied` (ไม่มี link จริงเหมือน share post)

### A4. Viewer Profile = Follow/Following⌄ + Chat + "..." sheet
- Actions: `Follow` primary → `Following ⌄` (กดซ้ำเปิด **mfSheet** — ดู A6) + `Chat` (pf-msg → **dead toast** `Open a listing to chat with this seller` — ดู C16)
- Head `pf-more` `...` → pm-rows sheet: **Report** (red) / **Block|Unblock** / **About this account** / **Copy profile URL** / **Share this profile** (→ shareSheetHTML ทั่วไป ไม่มี profile preview) + Cancel card แยก — spec เมนูมีแค่ Share/Report/Block (ดู C11/C12)
- `pf-sh-about` → `about:{user}` page: hero+vbadge + "Date joined" (mock จาก hash + พ.ศ. ตอน TH) + "Account based in Thailand" + Verified row + foot note — IG About this account, spec ไม่มี

### A5. Block/Unblock = IG confirm sheet + restrict hint + Blocked list
- `blkSheetHTML`: bottom sheet — avatar กลาง + `Block {user}?` + `This will also block any other profiles they may have or create` + 3 impact rows (message/find profile, won't be notified, unblock in Settings) + `Block` + `Block and report` (fromChat เหลือ Block อย่างเดียว) — **ไม่ใช่ center dialog `Block this user?` + Cancel/Block** (ดู C9)
- `pfSetBlocked`: PF_BLOCKED + PF_REMOVED_FOL + unfollow + sync `th.blocked` ใน chat threads + `p.blocked` ทุกโพสต์ + re-render feed — toast `Blocking`
- **Blocked profile ยังเปิดดูได้**: grid ว่าง `No posts yet`, stats `0 posts / - followers / - following`, ปุ่มใหญ่ `Unblock` → `unblockDlgHTML` center dlg + hint `pfRestrictHint` (restrict suggestion + dead Learn more) — ขัด spec unavailable (ดู C8)
- Settings > `บัญชีที่บล็อก/Blocked` list + `m-unblock` → unblock dlg เดียวกัน

### A6. Following manage sheet + followers/following pages
- `mfSheetHTML` (Following⌄): Add/Remove favorites (star) + Mute (→ muteDlg center) + **Unfollow (ทำทันทีไม่ confirm)** — ต่างจาก feed `follow-btn` ที่ unfollow ผ่าน `unfollow-open` confirm sheet (ดู C19)
- `pfollow:{user}:{tab}`: head ชื่อ + tabs `N followers`/`N following` + live search (`pfl-q` match name+disp, `No results found`) — rows: own followers = `Chat` + `x` Remove (→ `Remove follower?` dlg + `PF_REMOVED_FOL`), own following = `...` pop-over (Unfollow/Mute), viewer lists = `Follow/Following` pill flip ตัวต่อตัว
- own ที่ไม่ใช่ member → list ว่าง (GUEST-001); ไม่มีตัวเองใน list คนอื่น

### A7. Edit Profile (pedit) = IG fields ไม่ใช่ spec fields
- ฟิลด์: **Edit picture** (dead toast `Photo picker isn't in this prototype yet`), **Username** (3–20 `a-z0-9_.` + unique check ทั้ง PROFILES/POSTS), **Bio** (≤150), **Link** (URL/domain/`@handle` ผ่าน `peValidLink`) + Save — **ไม่มี Phone/Line/Email** (ดู C14)
- Rename username → migrate refs ครบ: PROFILES key, POSTS seller, COMMENTS names+replies, followedBy, blocked/fav/mute/follow sets, NEW_USER_KEY, `fo_newuser` localStorage, sub stack
- Validation inline `pe-err` + focus จุดแรก; success → back + toast `Profile updated`

### A8. Grid = post grid (pf-tile) ไม่ใช่ asset cards
- Tabs: own `all/sale/show/hide/sold` (TH ทั้งหมด/ขาย/โชว์/ซ่อน/ขายแล้ว + icon), public `all/sale/show` — `pfKind` = `p.pfkind || (price||sale ? sale : show)`
- Tile: รูป + stack/clip badge + **pin marker** (pin ต่อ tab, PIN_MAX=3 — จาก 002a); **ไม่มี status badge, ไม่มี "..." quick action** บน tile (ดู C5)
- Tap tile → `openPostViewer(..., "Posts", u)` = **pv pfp mode** (ไม่ใช่ Asset Detail — ดู C4); tile `.rp-tile` = report post-picker
- Grid ผสม sources: `PF_MINE` (drawer-only) + `userPosts` + gfx mocks (`PF_GFX_REG`, kinds ผสม hide/sold, meta/sale-spec mocks)

### A9. Portfolio dashboard (portfolioHTML) — real แต่ semantics ต่าง spec
- Entry: `pf-pfo` wallet icon เท่านั้น (own profile) — viewer profile ไม่มี entry ตรง spec AC-PORT-003
- Headline card: **`ต้นทุนรวม/Total invested`** = SUM(purchase) + lock `ส่วนตัว/Private` — บรรทัดรอง `มูลค่าตลาด/Market value ฿X · ±N%` (หรือ `Market value unavailable`) + coverage `ต้นทุนซื้อของ X/Y รายการ` — **ไม่ใช่ Total Asset Value = Σ Current Value** (ดู C3)
- `pfoEligible` = status sale/show/hide + `own !== false` — ไม่มี deleted/perm-hidden/consignment concept ในข้อมูล (a.own เป็น flag เปล่า)
- `pfoCur` market → purchase fallback → none ตรง spec priority; banner `Some market prices are unavailable` ตอน nomkt; rows = รูป+name/ref/meta + **purchase price** เป็นค่าแสดง; section `รายการนาฬิกา N` + link `ประวัติการขาย →`
- foot note `นับเฉพาะ...ไม่รวมรายการที่ขายแล้ว ลบ ซ่อนถาวร หรือสินค้าฝากขาย` (copy กล่าวถึง consignment แต่ระบบไม่มีจริง)
- guest (`state.session!=="member"`) → **empty state `ไม่พบข้อมูล`** ไม่ใช่ permission denied (ดู C17)

### A10. Portfolio asset detail (pfasset) — owner-only value sheet
- Hero carousel + name/ref/meta/brand + status chip (Sale/Show/Hide — `PFO_STATUS`); **ไม่มี sold status chip** (sold ไม่เข้า pfasset)
- Value card (private tag): Current value / Value source (`Latest market price`/`Purchase price estimate`/`No market price`) / Estimated market band ±5% / Last price update (`PF_MKT_UPDATED` mock) / Data source `TukDaeng Market Data` / Purchase price / Purchased date / **Unrealized gain/loss** (เฉพาะ mkt+purchase) / **Holding period** (`N days · Yy Mm`)
- Listing card (เฉพาะ status sale): Asking price / **Expected profit** (asking−purchase +%) / **Market comparison** chip (Above/At/Below ±1% dead band — `pfoCmp`)
- `Mark as sold` button (เฉพาะ eligible) → sell form; foot `Owner-only data — never shown on your public profile`
- not-found → `ไม่พบข้อมูล` empty

### A11. Sold history + sold detail (soldhist / sold:{id})
- List: rows name + `Sold {date}` + sale price → `sold:{id}`; desc `ไม่นำไปรวมกับมูลค่าพอร์ตโฟลิโอ`; empty `ไม่พบข้อมูล`
- Detail: hero + Sold chip + `Sale price` headline + **Realized gain/loss** (price−purchase +%, up/dn) + Sale record card (private: Sale date, Sale price) + Return card (Purchase price, Holding period = saleDate−bought) + note realized แยก portfolio
- **ไม่มี Buyer / Contact / Payment Method / Attachment เลย** — ทั้งใน list, detail, และฟอร์ม (ดู C7)

### A12. Mark-as-sold form (sell:{id}) + lifecycle เชื่อม post↔drawer
- Fields: รูป+brand/name/ref+status chip + private note + **Sale price\*** (prefill asking, unNum รับ comma) + **Expected gain** live preview (asking−purchase) + **Sale date\*** (date input, max=today) — **แค่ 2 ฟิลด์** ไม่มี buyer/contact/payment/attachment
- Validation: price required/>0, date required + badInput/rangeOverflow → inline `pe-err` + focus
- `markAssetSold`: ย้าย PF_ASSETS→PF_SOLD (unshift) + ทุก post ที่ `assetId===a.id` → `pfkind="sold"` + refreshPostViews; stack ตัด sell/pfasset เก่า push `sold:{id}` สไลด์เข้า + ghost clone; toast `บันทึกการขายแล้ว · ย้ายไปประวัติการขาย ✓`
- Entries: (1) pfasset detail button `data-sell`; (2) own-post menu `pm-own-sold` — โพสต์ไม่มี asset link → `assetFromPost` สร้าง drawer record (specs/caption seed) แล้วเปิดฟอร์ม; `pm-own-soldview` sold post → `soldFromPost` materialize record
- `cfToPortfolio`/`assetFromPost`: composer/edit-info/link ↔ PF_ASSETS — record มี `market:null` เสมอ → Current value fallback เป็น purchase/`—`; ไม่มี own/consignment flag

### A13. Drawer (ลิ้นชักสินทรัพย์) = แนวคิด ไม่ใช่หน้า
- `PF_MINE` = drawer-only posts จาก composer Show/Hide (ไม่เข้า POSTS); copy composer เรียก "ลิ้นชักส่วนตัว/private drawer"; pfasset/portfolio เป็นหน้าที่ใกล้สุด — ไม่มีหน้า "ลิ้นชัก" แยก
- Archive เข้าได้เฉพาะผ่าน own profile burger → Settings → `คลังข้อมูลที่เก็บถาวร/Archive` (+ own-post menu Archive) — **profile/portfolio ไม่มี archive entry โดยตรง** (ยืนยัน context: Archive แยก Saved/Wishlist ผ่าน Settings เท่านั้น)

### A14. Dev preview states + dead ends
- `PFO_SIMS` + `pfo-more` (เฉพาะ `?dev=1`): Normal / Market prices unavailable / Empty / Load failed / Viewer access-denied — production ไม่มีเมนู; `pfo-retry` reset sim
- Dead toasts: pf-msg (Chat), pf-uname, pf-note/pf-sleep/pf-addchip, avatar-overlay QR, pe-pic, hb drawer items ทั้งกอง (Watch Brands/Price Index/Consignment Center ฯลฯ → `Not in this prototype yet`)

---

## B. Spec 06/14 มี แต่ Prototype ไม่มี (→ ต้องตัดสินใจว่าเก็บเป็น contract หรือปรับ)

| # | ของใน spec | สถานะใน prototype |
|---|---|---|
| B1 | Owner Profile แสดง **Total Asset Value** + ใช้เป็น entry ไป Portfolio (§10 + AC-PROFILE-001/021, AC-PORT-002) | ไม่มีตัวเลข — entry = wallet icon (`pf-pfo`) อย่างเดียว; portfolio headline เป็น Total invested คนละค่า (ดู C1/C3) |
| B2 | Asset-card `...` quick action matrix: owner per-status (Sale: Share/Edit/Edit provenance/Mark as sold/Change status/Delete; Show/Hide ชุดย่อย; Sold: view-only) + visitor `Share asset`/`Report asset` เฉพาะ Sale/Show (§10 Quick Actions + AC-PROFILE-007A–L) | ไม่มีเลย — tile ไม่มี `...`; owner action อยู่ใน own-post menu (Archive/Edit/Mark as sold/Pin/Delete) คนละชุด; visitor ไม่มี quick action ใด ๆ |
| B3 | Status badge บน asset card (Sale red / Show blue / Hide outline / Sold muted) | tile ไม่มี badge — มีแค่ stack/clip/pin icons |
| B4 | Tap card/รูป → Asset Detail (§10 Quick Actions) | tile → pv "Posts" viewer; detail ต้อง Tap for details → View full detail (ดู C4) |
| B5 | User Not Found state `ไม่พบผู้ใช้งาน/User not found` (§13 + AC-PROFILE-027) | ไม่มี — `profileOf` สร้างข้อมูล mock ให้ทุกชื่อ เสมอ resolve ได้ |
| B6 | Profile Unavailable state `ไม่สามารถเข้าถึงผู้ใช้งานนี้ได้` สำหรับ blocked (§13 + AC-PROFILE-028/007G) | ไม่มี — blocked profile เปิดได้ปกติ มี Unblock + grid ว่าง (ดู C8) |
| B7 | Block confirm: title `Block this user?` + Cancel/Block, cancel ไม่เปลี่ยน state (§10 + AC-PROFILE-034) | IG bottom sheet `Block {user}?` + impact rows + `Block`/`Block and report` ไม่มี Cancel (ปิดด้วย backdrop) (ดู C9) |
| B8 | Report User success: `Report submitted` + `Our team will review this user. This profile will remain visible until moderation is complete.` + ปุ่ม Done (§10 + AC-PROFILE-033) | report:done = `Thanks for your feedback` + other steps + Done → toast `Report submitted · thanks for letting us know` — copy ไม่ตรง (ดู C11) |
| B9 | Profile Share Sheet: preview card (รูป+ชื่อ) + system share + `Copy Link` + `Profile link copied` + deep-link validate blocked/existence (§10 + AC-PROFILE-032/007F–H) | own: QR overlay (share/copy/download — ไม่ใช่ share sheet); viewer: shareSheetHTML ทั่วไปไม่มี preview; ไม่มี deep-link validation ใด ๆ |
| B10 | Guest Share Public Profile / Share asset ได้โดยไม่ login (AC-PROFILE-018A/007E/007L) | `.pf-more`, `.pf-share`, `.pf-sh-share` อยู่ใน GUEST_GATE_SEL → guest เปิดเมนู/QR ไม่ได้เลย (ดู C10) |
| B11 | Edit Profile fields ตาม master settings: Username, Phone, Line, Email Display (email ยืนยันแล้วแก้ไม่ได้) (§10 Edit Profile Rule) | pedit = Username/Bio/Link เท่านั้น — ไม่มี phone/line/email (ดู C14) |
| B12 | Member Chat จาก profile context (§8 Member สามารถ Chat) | `pf-msg` dead toast `Open a listing to chat with this seller` — ไม่เปิด chatroom (ดู C16) |
| B13 | Sold History fields ครบ: Sale Date, **Buyer, Contact**, Sale Price, **Payment Method** (required 3 ตัวแรก+price) + Attachment (§10 + AC-PORT-007) | มีแค่ Sale date + Sale price — form ไม่เก็บ, detail ไม่แสดง (ดู C7) |
| B14 | Top Brand Holdings (top 3 by count) + YTD Performance วิธี A (§10 + AC-PORT-023/024/025) | ไม่มี — `PF_YTD_OPEN` ถูกตัดโดยตั้งใจ (`YTD tile cut per user feedback (minimal dashboard)`) |
| B15 | Consignment exclusion จาก Portfolio (§10 Consignment Rule + AC-PORT-009) | ไม่มี provenance/consignment เลย (`a.own` flag เปล่า, note copy กล่าวถึงแต่ไม่ implement; Consignment Center ใน hb drawer dead) |
| B16 | Portfolio contract รายละเอียด: coverage `คำนวณจาก X/Y รายการ`, **Total Unrealized G/L เป็นจำนวนเงิน + coverage `คำนวณกำไรจาก X/Y`**, source label ต่อ asset, `ยังคำนวณกำไรไม่ได้` state | dashboard โชว์ invested + market% เท่านั้น ไม่มี total GL sum/coverage ตาม spec; pfasset มี source label ครบ |
| B17 | Permission denied state (real) + Load failed + `ลองใหม่` + Watch Price API unavailable banner เป็น state จริง (§13 + AC-PORT-001/015) | มีใน dev sim เท่านั้น (`?dev=1`) — production path: guest/non-member → empty `ไม่พบข้อมูล`; ไม่มี real load/denied path |
| B18 | Profile deep link validate block/existence/suspended ก่อน render + guest open ได้ (§10 Deep Link Rule + AC-PROFILE-007F–I) | ไม่มี deep-link routing เลย (mock `tukdaeng.app/u/` สร้างให้ copy/QR อย่างเดียว) |
| B19 | Mark as sold เฉพาะ `Sale` (§10 Quick Actions + AC-PROFILE-007B) | `sellable` = sale/show/hide — Show/Hide ก็กดได้ (ดู C6) |
| B20 | Analytics `profile_*` 12 events + `portfolio_*` 8 events | ไม่มี tracking layer (contract-level เหมือน gap ก่อน) |
| B21 | Empty copy มาตรฐาน `ไม่พบข้อมูล/No data found` สำหรับ profile tabs (§14) | tabs ใช้ copy เฉพาะ: `Add your first asset`/`No posts yet`/`No {tab} posts`; portfolio/sold/pfasset empty = `ไม่พบข้อมูล` ตรง |
| B22 | Blocked ห้ามใช้ follow relationship + asset หายจาก Feed/Search/WA ทันที (§8/§10 + AC-PROFILE-029) | feed/search กรอง `p.blocked` ถูกทำ (`pfSetBlocked` set + salePosts กรอง); follow/relationship เคลียร์ — **ตรง spec บางส่วน** แต่ profile ยังเข้าถึงได้ (ผูก C8); WA match ผ่าน salePosts() จึงได้ผลเหมือนกัน |
| B23 | Provenance / Consignment / Purchase From / Proof of Payment surfaces (ซ่อนจาก public) | ไม่มี entity เหล่านี้เลยใน prototype — ไม่ใช่แค่ซ่อนจาก public (ขยาย 002b C11–C13) |

---

## C. ขัดกันโดยตรง (conflicts ต้อง sync)

| # | Spec บอก | Prototype ทำจริง | ข้อเสนอ |
|---|---|---|---|
| C1 | Total Asset Value แสดงบน Owner Profile + เป็น entry ไป Portfolio (AC-PROFILE-001/021, AC-PORT-002) | ไม่มีตัวเลขบนโปรไฟล์ — entry = wallet icon `pf-pfo` เท่านั้น | spec ตาม prototype: entry = icon button; หรือเพิ่ม value figure — ต้องตัดสิน FSP-019/024 |
| C2 | Public `All` = เฉพาะ Sale+Show; ห้ามแสดง Hide/Sold (AC-PROFILE-010/013) | `pfTabPosts(u,"all")` ไม่กรอง viewer — public All **รวมทุก pfkind รวม hide/sold/post** (gfx mock มี hide/sold kind ทุก profile) | privacy leak ตาม spec — เลือก: เขียน spec เป็น post-grid (All = โพสต์ทั้งหมด) หรือเพิ่ม visibility filter สำหรับ viewer — **ต้องตัดสิน** (ถ้า model เป็น post-centric จริง spec 06 ต้องเขียนใหม่ทั้ง tab semantics) |
| C3 | Total Asset Value = Σ Current Value (mkt→fallback→none) + coverage `X/Y` (AC-PORT-010) | headline = `ต้นทุนรวม/Total invested` = Σ **purchase**; market value เป็น secondary line + coverage นับ invested ไม่ใช่ valued | คนละ metric — เขียน spec เป็น invested-centric dashboard ตาม prototype หรือสลับ headline เป็น current value — ต้องตัดสิน FSP-024 |
| C4 | Tap card → Asset Detail | tile → pv pfp viewer (`Posts/{user}`); asset/post detail ผ่าน Tap-for-details→View full detail | สอดคล้อง post-centric model (ซ้ำ 002a C5) — map spec เป็น viewer flow |
| C5 | ทุก asset card มี `...` quick actions + status badges (AC-PROFILE-007A–L + badge table) | tile ไม่มีทั้ง `...` และ badge — owner action ผ่าน post viewer menu, visitor ไม่มี | เขียน spec เป็น own-post-menu pattern + ตัดสินเรื่อง visitor share/report entry (ตอนนี้ทำผ่าน `...` head/post detail เท่านั้น) |
| C6 | `Mark as sold` เฉพาะ Sale (AC-PROFILE-007B) | `sellable` = sale/show/**hide** — drawer asset show/hide ก็บันทึกขายได้ | spec ต้องเลือก: รับ sellable ทั้ง 3 status (สมเหตุ — show/hide คือของในคลัง) หรือจำกัดเฉพาะ sale |
| C7 | Sold History required: Sale Date, Sale Price, **Payment Method**; optional Buyer/Contact/Attachment (§10 + AC-PORT-007) | ฟอร์มเก็บแค่ price+date; detail แสดง price/date/realized-GL/holding — **ไม่มี 4 ฟิลด์ที่เหลือเลย** | เลือก: เพิ่มฟิลด์ใน sell form (prototype แก้) หรือ spec เขียนเป็น price+date-only + optional rest — ต้องตัดสิน FSP-024 |
| C8 | Blocked → `Profile is unavailable` / deep link แสดง blocked state (AC-PROFILE-007G/028) | IG behavior: profile เปิดได้, grid ว่าง, stats `-`, ปุ่ม Unblock + restrict hint | ขัดทิศ — เลือก unavailable-state (spec) หรือ IG-keep-page (prototype) — ต้อง sign-off |
| C9 | Block confirm `Block this user?` + Cancel/Block (AC-PROFILE-034) | `Block {user}?` bottom sheet + impact rows + Block/Block and report ไม่มี Cancel | เขียน spec เป็น IG sheet ตาม prototype (แนะนำ — ใช้ pattern เดียวกับ chat/report) หรือเปลี่ยน UI |
| C10 | Guest Share Public Profile ได้ (AC-PROFILE-018A) + guest Share asset (007E/007L) | `.pf-more`/`.pf-share`/`.pf-sh-share` อยู่ใน gate → guest เปิด share ไม่ได้เลย | ขัดโดยตรง — แกะ share ออกจาก gate ตอน implement หรือ spec เป็น gated (ซ้ำ pattern 002b C10 guest share) |
| C11 | Report user success copy + `remain visible until moderation` (AC-PROFILE-033) | report:done `Thanks for your feedback` + other steps + Done → toast | เขียน spec ตาม IG report flow (ซ้ำ 002a C11) — copy table ต้องอัปเดต |
| C12 | Owner more menu `...` = [Share profile, Settings] (AC-PROFILE-030) | ไม่มี `...` menu — burger `pf-menu` → Settings ตรง; Share profile = action button → QR overlay | เขียน spec เป็น IG layout (burger=settings, share=QR) — ตัดสินว่า QR เป็น share surface หลัก |
| C13 | Profile Share Sheet = preview card + system share + Copy Link (AC-PROFILE-032) | own: QR overlay; viewer: shareSheet ทั่วไป — ไม่มี preview card, ไม่มี system share | เขียน spec ตาม QR overlay + generic sheet หรือเพิ่ม preview — ต้องตัดสิน |
| C14 | Edit Profile = Username/Phone/Line/Email (§10) | pedit = Username/Bio/Link + rename migration (spec ไม่มี bio/link/rename) | ขัดทั้งสองทิศ — ตัดสิน field set (เชื่อม FSP-013/014 settings scope) |
| C15 | Member Chat จาก profile | `pf-msg` dead toast — chat เข้าได้เฉพาะผ่าน listing ask-pill | ผูก FSP-020: ตัดสินว่า Chat button เปิด chatroom ตรงหรือตัดออก |
| C16 | Portfolio denied/unavailable = state จริง; guest ต้อง block/login (§8/13 + AC-PORT-001) | guest→empty `ไม่พบข้อมูล`; denied state มีเฉพาะ dev sim (`?dev=1`) | ตัดสิน: เขียน spec เป็น empty-for-guest หรือเพิ่ม real denied/login gate ตอน implement |
| C17 | Portfolio ไม่รวม sold/hide จากมุม public; WA/search match เฉพาะ Sale (10 §10 + AC-WA-005) | `salePosts()` ไม่กรอง pfkind → **hide (drawer ส่วนตัว) + sold ที่มี price ถูกนับเข้า WA match/search**; sold ยังเก็บ price หลัง markAssetSold | ผลกระทบฝั่ง portfolio จาก 002b C4: (a) โพสต์ sold ยัง match WA/search แม้ asset ย้าย PF_SOLD แล้ว; (b) hide-kind gfx/ดราฟที่มี price นับเข้า public match — flag เป็น defect หรือนิยาม `sale`=priced-post (รวม FSP-016/021/024) |
| C18 | Public Profile = asset-centric (ไม่มี posts count/non-asset content ใน spec) | posts stat + grid รวม `pfkind:"post"` (โพสต์ธรรมดาไม่ผูก asset) ทั้ง own และ public | ตามหลัก post-centric (C1 ของ 002a) — spec 06 ต้องเขียนใหม่เป็น social profile |
| C19 | Unfollow เป็น action เดียว (spec ไม่ระบุ confirm) | 3 พฤติกรรม: feed `follow-btn`→unfollow-open confirm sheet; profile `Following⌄`→mfSheet unfollow ทันที; pfp pill→toggle ทันที | เขียน spec แยกตาม surface ตาม prototype (IG-accurate) — ต้องยืนยัน |

---

## D. Cross-module notes (ไม่ใช่ spec 06/14 แต่เจอระหว่างสแกน)

- **FSP-019 (06 rewrite)**: scope ใหญ่สุด — profile ทั้งหน้าเป็น IG social profile (bio/cat/link/verified/followed-by/note/sleep dead/QR/share/menu/block/follow sheets/edit/grid-post/pin) — spec 06 ต้องเขียนใหม่เป็น post-centric ทั้งเล่ม ไม่ใช่ patch
- **FSP-024 (14 rewrite)**: portfolio มีจริงครบโครง (dashboard/asset detail/sold/sell form) แต่ headline=invested, sold fields ขาด 4, Top Brand/YTD ไม่มี, denied/empty semantics ต่าง — rewrite medium-scale + ตัดสิน C3/C7/C16
- **FSP-017 (04_ASSET_MGMT)**: lifecycle จริง = post↔drawer link (`assetId`, `cfToPortfolio`, `assetFromPost`, `markAssetSold`) — "Change status"/"Edit provenance"/"Delete asset" ของ spec ไม่มี (status ย้ายผ่าน Edit-info Profile-status pick; delete = post delete); ขยาย 002b C11–C13
- **FSP-018 (05_ASSET_DETAIL)**: owner asset detail = **2 surfaces** — pfasset (portfolio value/profit, owner-only) vs `.page-detail` (post spec/public) — spec 05 ต้องแยก owner vs public detail หรือ map ให้ชัด; "View sale record" entry ผ่าน own-post menu
- **FSP-020 (07_CHAT)**: `pf-msg` dead (profile + follower rows); `pfSetBlocked` sync `th.blocked` ใน chat threads แล้ว; chat report sheet (ch-rep) ผูก block/report flow
- **FSP-021/022 (10/11 + social)**: follow/fav/mute/block state shared (`pfSetFollow` → `setFollowing` เดียวกับ feed); favorites feed-tab ใช้ `pfIsFav`; unfollow 3 พฤติกรรม (C19); WA `N matches` นับ hide/sold priced posts (C17)
- **FSP-004/013/014 (settings)**: settings มี `บัญชีที่บล็อก` list+unblock, `เกี่ยวกับบัญชีของคุณ` (about_account: joined/based-in + change_pwd + del_account), `การตั้งค่าการแจ้งเตือน` — รับมือ FSP-004; **Archive เข้าผ่าน Settings เท่านั้น** (profile ไม่มี entry โดยตรง — ยืนยัน context ที่ได้รับ)
- **FSP-003b (09 notif)**: follow-type alert มีใน alerts (`a.type==="follow"` → `profile:{user}`) — เช็คตอน scan chat/notifications
- **EN-hardcode sweep**: QR overlay (`Share profile`/`Copy link`/`Download`/`QR code saved`/`Point your camera`), block/unblock (`Block {user}?`, `Remove follower?`, `Unfollowed`, `Blocking`), share/copy toasts (`Profile link copied`, `Profile shared`), mfSheet บางแถว EN-only — รวม language sweep FSP-026
- **Market data = mock**: `PF_MKT_UPDATED` fixed date + band ±5% + `TukDaeng Market Data` label — spec เรียก Watch Price API; ไม่มี real API boundary
- **`profileOf` fabricates ทุกชื่อ** → ไม่มีทางเจอ User Not Found; blocked ก็ render ปกติ — contract-level ทั้งคู่ (B5/B6)
- **ยืนยัน context จาก task ก่อน**: composer asset mode → `cfToPortfolio` pfkind sale/show/hide/sold ตรง spec 14 surfaces (sold ย้ายผ่าน markAssetSold → Sold history จริง); Archive entry ผ่าน Settings เท่านั้น; hide/sold priced posts รั่วเข้า WA/search (C17)

## E. สรุปจำนวน

- Prototype-only (ต้องเพิ่มใน spec): 14 กลุ่ม (A1–A14)
- Spec-only (ต้องตัดสินใจ): 23 รายการ (B1–B23)
- Conflicts: 19 รายการ (C1–C19) — จุดใหญ่สุด: C2 (public All รั่ว hide/sold), C3 (invested vs value), C8 (blocked viewable), C17 (sold/hide รั่ว WA/search)
