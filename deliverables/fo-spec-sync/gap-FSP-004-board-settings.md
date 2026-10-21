# FSP-004 — Gap Inventory: Board / Settings / Legal / Delete Account

วันที่สแกน: 21 ต.ค. 2026
Source of truth: `Prototypes/fo-flow/index.html` (read-only — BOARD data ~17826–17862, carousel/pills/drag ~17864–17956, head/card/row/list ~17958–17996, home ~17997–18033, all ~18034–18047, search/results ~18048–18082, article ~18083–18129, boardClick ~18130–18272, bd-q input ~19986, settings route+home ~17151–17187, about_account ~17188–17207, change_pwd ~17208–17246, del_account ~17247–17337, lang ~17338–17347, notif_settings ~17348–17361, help ~17362–17374, privacy ~17375–17395, terms ~17396–17412, about_app ~17413–17427, favorites/muted/blocked ~17428–17460, prefs/sensitive ~17461–17479, theme ~17480–17489, logout/delpwd/delsuccess dialogs ~14726–14766, logout handler ~20785–20798, del flow ~20799–20909, pwd/forgot/chgpwd ~20910–20996, lang/notif/sens/theme/snooze/reset ~20997–21033 + ~20705–20716, pf-menu entry ~16856/~21494, guest gate ~22997–23006, legal i18n map ~19486–19501)
เทียบกับ: `FrontOffice/12_BOARD_MODULE.md` + `FrontOffice/13_SETTINGS_MODULE.md`

**Note ขอบเขต:** scan ตัวสุดท้ายของ phase audit — จุดที่ซ้ำกับ gap files ก่อนหน้า mark เป็น cross-ref ไม่เขียนซ้ำละเอียด (content prefs cluster → 002a A5; blocked/muted/favorites → 002a/003a; nav/route/gate → 001b; member-sheet copy → 001a B-01). ของใหม่ที่ task นี้ own: (1) Board ทั้ง module — โครง prototype เป็น editorial magazine (hero carousel + Latest + category tags) ไม่ใช่ 7-section model ของ spec/master เลย (2) Settings home เป็น IG "Settings and activity" 6-section — ขาด Edit profile/Change password บน home, มี library/what-you-see เพิ่มทั้งก้อน (3) Delete account เป็น 2-page flow + password dialog — flow/copy/destination ต่าง spec ทุกจุด รวมถึง **grace-period login semantics ขัดกันโดยตรง** (login-to-restore vs login-blocked) (4) Report Article = dead code ทั้งเส้น (menu ไม่เคย render)

---

## A. Prototype มี แต่ Spec 12/13 ไม่มี (→ ต้องเพิ่มใน spec ตอน FSP-013/014/023)

### A1. Board = editorial magazine layout (hero + latest + categories) ไม่ใช่ section model
- `boardHomeHTML` = `bd-head` (burger Categories + brand `TUK DAENG | Board` + search icon) → **hero carousel** featured articles (`feat` 1–5, dots, drag/swipe, Read more button) → section head `บทความล่าสุด/Latest Articles` + `View all` → row list + `You're all caught up` end note — **ไม่มี Trending Now / Journal Board / Watch Brands / Watch 101 / Watch Apparel / Watch Events เลย** (Journal Board มีแค่ใน code comment)
- `boardallHTML` = crumb (home icon + `Latest Articles`) + **category pills** `BD_CATEGORIES` = `All / Market Watch / Rolex / Technical / Collector / Guides / Industry` + list ที่ filter ด้วย `cat+title` includes — categories เป็น editorial tags สุ่ม ๆ (article cats จริงกว้างกว่า: Featured, Watch Trends, More Watch Brands, Watch Basics, Watch Guides, Feature More Rolex Collections, Rolex, Collector, Industry, Guides, Market Watch, Technical) ไม่ map master sections
- `data-bdmenu` burger → bottom sheet `Categories` list เดียวกัน → เลือกแล้ว push `boardall` + active pill (001b ยืนยันแล้วว่าเป็น sheet จริง ไม่ใช่ dead)
- Search + category filter **ทำงานร่วมกันไม่ได้** — search page แยก surface, search ครอบทุก category เสมอ (spec §10 บอก "สามารถทำงานร่วมกันได้หาก implementation รองรับ" — prototype ไม่รองรับ)
- Data: `BOARD` 15 บทความ mock, ทุกบทความ body เดียวกัน (`BD_BODY` 3 ย่อหน้า), dates ค้าง `Oct 18–28, 2024`, author fix `Tuk Daeng Editorial`

### A2. Article detail anatomy (spec ไม่มีเลย)
- `boardArticleHTML(id)` = `bd-dnav` floating pill (back + **like/share pill group**) → cat → h1 → author row (`td-editorial.png` avatar + cols `Author: Tuk Daeng` / `Date` + likes count) → cover → callout (sub) → `BD_BODY` ×3 → tag chips `#Watches / #{cat} / #TukDaeng / #Horology`
- Like: `[data-bdlike]` toggle + count update ทุกจุด (pill + author row) — guest gate (ดู C6)
- Share: `[data-bdshare]` → `shareSheetHTML()` **ตัวเดียวกับโพสต์** (friend grid + app icons + Copy link → toast `Link copied`) — ไม่มี article-specific share/deep link
- Invalid id → `chEmptyHTML("Article not found", "This article is no longer available.")` — **EN only, ไม่แยก unpublished/deleted/invalid**
- **ไม่มี overflow/`...` menu บน article detail** → Report Article ไม่มี entry จริง (ดู A4)

### A3. Board search page (เกิน spec)
- `boardSearchHTML` = `bd-sbar` (icon + input autofocus + clear-x) + crumb home>Search + `bd-res`
- Empty query → **Popular Topics** chips `BD_POPULAR_TAGS` (Rolex/Daytona/Perpetual Calendar/Titanium/Patina/Grand Seiko) — tap = set query
- Live filter (`input` event → `boardSearchSync`) match `title+cat+sub`; result = `N results for "q"` heading + **card grid** (bdCardHTML — ใหญ่กว่า list row) + custom empty `No results found for "q"` + suggestion sub-copy `Try searching with different keywords like Rolex, Daytona, or Titanium`
- ไม่มี recent searches / suggestions dropdown / account results — scope แค่ articles

### A4. Dead board artifacts (menu/save/report ไร้ entry)
- `data-bdmore` handler render sheet เต็ม: `Share Article` / `Copy Link` / `Save to Favorites|Remove from Saved` / `Report Article` (red) + Cancel — **แต่ไม่มี element ใด render `data-bdmore=` เลย** → ทั้งเมนู unreachable
- `data-bdsave` handler + `a.saved` field + toasts `Saved to favorites/Removed from favorites` — ไม่มีปุ่ม save บน article ใด ๆ → dead (สอดคล้อง spec: Saved Article อยู่ Future Enhancement)
- `data-bdact="report"` ถึงแม้เปิดได้ก็ → toast `Report submitted. Thank you for notifying us.` ทันที — ไม่มี reason sheet ใด ๆ
- Guest gate ครอบ `[data-bdlike]` `[data-bdsave]` `[data-bdshare]` `[data-bdact='share'/'save'/'report']` ทั้งหมด → member sheet (ดู C5/C6)

### A5. Settings Home จริง = IG "Settings and activity" 6 sections (ขัด locked order ของ spec)
- Head title `การตั้งค่าและกิจกรรม/Settings and activity` (ไม่ใช่ `Settings`)
- Section จริงตามลำดับ:
  1. **Account** — `About your account` **row เดียว** (ไม่มี Edit profile / Change password บน home)
  2. **Your library** — Saved / Wish List / Archive / Watch Alerts (ทุก row มี count badge)
  3. **What you see** — Favorites / Muted accounts / Blocked / Content preferences
  4. **Your app and media** — Language (value pill `ภาษาอีกใจ/English`) / Theme mode (value pill `โหมดมืด/Dark` ฯลฯ)
  5. **Notifications** — Notification settings
  6. **More info and support** — Help / Privacy Policy / Terms of Use / About
- Bottom action: `ออกจากระบบ/Log out` red row ภายใต้ section `การเข้าสู่ระบบ/Login` (ไม่ใช่ `Sign out`)
- spec §10 Settings Menu Rule lock: Account(Edit profile + Change password + About your account) → Your app and media → Notifications → More info and support → Sign out — **ขาด Edit profile + Change password บน home** และ **เพิ่ม Your library + What you see ทั้งก้อน** (ดู C1)
- Edit profile อยู่ที่ profile page (`pedit` — 003a), Change password ย้ายเข้า `About your account > Security` (ดู A6)

### A6. About your account page (เกิน spec)
- Hero: avatar + display name + `@username`
- Account information: `Date joined` (session `new` → `ตุลาคม 2569/October 2026`, else `ตุลาคม 2567/October 2024`) + **`ตำแหน่งบัญชี/Account based in` = Thailand** (spec ไม่มี)
- Security section: `Change password` row → `change_pwd` page (ดู A7)
- Account management section: `ลบบัญชีผู้ใช้/Delete account` red row → `del_account` flow (ดู A8)
- spec ต้องการแค่ profile image + display name + Date joined + Delete button — ตรง core แต่มี extras (username/account-based-in/change-pwd section) และ **ไม่มี contact rows** (ดู B2)

### A7. Change password = full in-app page ใน settings (spec บอก Auth-linked entry)
- 3 fields: Current + New + **Re-type new password** (spec: `Confirm new password`), eye toggle ทุก field, `Forgot your password?` → `forgotPwdDlgHTML` (masked email `k***@tukdaeng.com` หรือ email จริงของ new account → toast `Password reset link sent`)
- Desc copy: `at least 6 characters ... numbers, letters and special characters (!$@%)` — **spec helper = `At least 8 characters, with a number or symbol.`** (ขัด)
- Validation จริง: current required → `curVal !== state.userPwd || "fox1234"` → new required → `length < 6` → same-as-current → confirm mismatch — inline err ใต้ form
- สำเร็จ → `state.userPwd = newVal` + `subBack` + toast `เปลี่ยนรหัสผ่านเรียบร้อยแล้ว/Password changed successfully` (ตรง spec แนว `Password changed` + กลับ)
- **Mock bug:** del-account check ใช้ `state.mockPassword` (ไม่เคย set → ค้าง `fox1234` เสมอ) แต่ chg-pwd เขียน `state.userPwd` → **เปลี่ยนรหัสแล้ว delete ยังต้องกรอก fox1234** — คนละ field กัน
- ไม่มี SSO-only handling (spec: SSO account ต้องไม่เห็น/เห็น disabled)

### A8. Delete account = 2-page flow + password dialog (ไม่ใช่ confirm เดียว)
- Entry: `about_account` → `data-sub="del_account"` → `scr._delStep` 1/2
- **Step 1** `ลบบัญชีผู้ใช้/Delete account`: hero trash icon + `We're sorry to see you go` + desc + **3 term cards** — (1) `30-Day Grace Period`: deactivate ทันที, profile/listings ซ่อน, **"log back in anytime within 30 days to cancel deletion"** (2) `Permanent Deletion after 30 days`: personal data + **chat history** + watch alerts + posts erased (3) `Watch Alerts Cancelled` — actions `Continue to delete` / `Keep my account` (sub-back)
- **Step 2** `เหตุผลในการลบบัญชี/Why are you leaving?`: 6 reasons radio (not_using/privacy/notifications/second_account/trouble/other — **required**, err `Please select a reason to continue.`) + optional feedback textarea + `ดำเนินการขอลบบัญชี/Continue` + `Back`
- **Dialog** `Confirm account deletion`: current password + eye + err (empty/incorrect vs `fox1234`) + `Delete account` + `Cancel`
- **Success dialog** `ตั้งเวลากำหนดลบบัญชีแล้ว/Account deletion scheduled`: trash icon + `@{user}` deactivated + **วันที่ลบถาวร (now+30d)** + `log back in before this date to cancel` + **ปุ่ม `ออกจากระบบ/Log out`**
- ปิด success → clear stack + `localStorage.removeItem("fo_account")` (เฉพาะ session `new`) + `setSession("guest")` + toast `บัญชีถูกระงับการใช้งานและเริ่มนับถอยหลัง 30 วัน/Account deactivated. 30-day grace period started.` + `obGate()` member sheet — **destination = guest feed + member sheet ไม่ใช่ Sign In screen** (AUTH-002 model, ดู C3)
- Dead code เส้นเก่า: `delAccountDlgHTML()` + `.dlg-delaccount-go` handler + `[data-dlg="del-account"]` handler — ไม่มี markup ใด render → single-dialog variant เก่าค้างเป็น dead path

### A9. Language / Theme pages (ตรง spec + extras)
- `lang`: 2 rows flag icon + label/desc + check บนตัวเลือกปัจจุบัน → `setLang` + `renderSub` + toast `เปลี่ยนภาษาเรียบร้อย/Language updated`
- `theme` (THEME-001): 2 rows sun/moon + Light/Dark + check → `setTheme` instant `data-theme` swap + `renderSub` (ไม่ full render) — ทำงานจริงทั้งแอปผ่าน CSS vars
- spec ต้องการแค่ EN/TH + Dark/Light + persist — ตรงทั้งคู่ (aligned, เก็บ detail ไว้เขียน spec)

### A10. Help / About / Legal pages
- `help`: section `Support channels` + `Available daily · 09:00 - 22:00 (GMT+7)` + 3 real links — LINE `line.me` (`@mrfoxthailand`), `tel:+66800088088` (`(+66) 80-008-8088`), `mailto:service@mrfox.com` — **copy ตรง locked spec ทุกตัวอักษร** + extra section `Help topics` → `Privacy & Safety` (→privacy) + `Terms & Guidelines` (→terms)
- `about_app`: hero `TUK DAENG` + tagline `The digital curator for watch collectors` + `Version 0.0.1` + `Mister Fox Co., Ltd. · Est. 2026` + `Legal & Support` section (Privacy Policy / Terms of Use / `ติดต่อฝ่ายบริการลูกค้า/Contact support` → help) — ตรง locked spec; head TH = `เกี่ยวกับตึกแดง` (spec title `About`)
- `privacy` = 4 legal-sec (Information We Collect / How We Use / Data Protection & Retention / Your Rights); `terms` = 3 legal-sec (Agreement / Listing Authenticity / Termination & Deactivation) — **EN source ใน markup + TH ผ่าน global i18n map** (legal bodies ใน dictionary) — content เป็น placeholder-grade สั้น ๆ ไม่ใช่ legal text จริง
- Entry ซ้ำหลายจุด: settings list / help topics / about_app / onboarding `ob-legalview` (consent — cross-ref 001a)

### A11. Notification settings page (ซ้ำประเด็น 003b C16)
- `notif_settings`: 4 toggles `likes/comments/follows/walerts` grouped `Activity` + `Trading & Alerts`, desc copy ต่อ toggle, auto-save memory (`state.notif`) — spec 13 baseline คือ Like/Comment/Follow/**Offer**/Watch Alert → **ไม่มี Offer toggle** (removal scope) → post-removal เหลือตรง spec; spec 09 §6 บอก preference center = out of scope V1 → **spec ขัดกันเอง 2 เล่ม** (ดู C8)

### A12. Content preferences cluster — entries อยู่ใน settings แต่ spec 13 เงียบ
- `prefs` (Sensitive content / Interested / Not interested / Snooze suggested posts 30 วัน / Reset suggested content) + `sensitive` (Less/Standard) + `interested` + `ni` + `favorites` + `muted` + `blocked` — รายละเอียดอยู่ใน 002a A5 + 003a; ประเด็นของ task นี้คือ **spec 13 §6/§10 ไม่รับรู้ section `Your library` + `What you see` เลย** ทั้งที่เป็น core ของ Settings Home จริง (ดู C9)
- ไม่มี cookie/consent preferences page — consent อยู่ onboarding + re-consent dev button เท่านั้น (001a scope; spec 13 ก็ไม่มี → aligned ทั้งคู่ บันทึกไว้กันสับสน)

### A13. Logout = `Log out` + guest destination (ขัด copy/destination spec)
- Row `ออกจากระบบ/Log out` red → `logoutDlgHTML`: `ออกจากระบบ @{user} หรือไม่?/Log out of @{user}?` + `You will need to sign in again to access your account.` + `Log out` + `Cancel`
- Confirm → clear `_subStack` + `setSession("guest")` + scroll feed top + toast `ออกจากระบบแล้ว/Logged out successfully` + `obGate()` member sheet (scrim/ข้ามไปก่อน = browse ต่อแบบ guest) — **ไม่ใช่กลับ Sign In screen** (AUTH-002 model; ดู C4)

---

## B. Spec 12/13 มี แต่ Prototype ไม่มี (→ ต้องตัดสินใจว่าเก็บเป็น contract หรือปรับ)

| # | ของใน spec | สถานะใน prototype |
|---|---|---|
| B1 | **7 master sections** Feature Article / Trending Now / Journal Board / Watch Brands / Watch 101 / Watch Apparel / Watch Events (§4/§10 + AC-BOARD-002) | ไม่มีเลย — featured hero ≈ Feature Article อย่างหยาบ; ไม่มี section ใดตรงชื่อ (categories เป็น tags อิสระ) (ดู C1) |
| B2 | Infinite Scroll + loading + end state ตาม list pattern (§6/§9/§10 + AC-BOARD-008) | ไม่มี pagination — static list 15 บทความ + `You're all caught up` เท่านั้น (pattern เดียวกับ feed — 002a B2) |
| B3 | **Report article locked flow ครบชุด**: overflow `Report article` → reason sheet (6 reasons + `Additional details (optional)` + Submit disabled จนเลือก) → `Report submitted` modal + duplicate `You already reported this article.` + API `Unable to submit report. Please try again.` (§10 + AC-BOARD-011A–011D) | **ไม่มี implementation เลย** — `data-bdmore` menu ไม่เคย render; fallback toast `Report submitted. Thank you for notifying us.` (ดู C7) |
| B4 | Article Unavailable/Not-found states TH `บทความนี้ไม่พร้อมใช้งานแล้ว` + display matrix guest/login/admin (unpublished/deleted/invalid) (§10 Deep Link Rule + §13 + AC-BOARD-012/010C/010D) | `chEmptyHTML` EN only `Article not found / This article is no longer available.` เฉพาะ invalid id — ไม่มี publish/deleted states, ไม่มี TH |
| B5 | Deep-link rules ทั้งชุด: validate ก่อน render / back→Feed เมื่อ no history / main nav ใช้ต่อได้ / guest กด restricted surface → login dialog (§10 + AC-BOARD-010E/010F) | ไม่มี URL deep link ใน prototype เลย — sub-back pop stack ธรรมดา (contract-level เหมือนทุก module) |
| B6 | **Guest Share Article ได้โดยไม่ต้อง login** (§8/§10 + AC-BOARD-010A — public share action) | `[data-bdshare]` อยู่ใน GUEST_GATE_SEL → member sheet (ดู C5 — ซ้ำ pattern 002b C10) |
| B7 | Share = system share sheet primary + copy public **Article deep link** fallback + copy success `Article link copied` + ไม่สร้าง notification (§10 Share Rule + AC-BOARD-010/010B) | `shareSheetHTML` ทั่วไป (IG friend grid + apps) + `Copy link` → `Link copied` — ไม่มี article link/validation (cross-ref 002a/002b share cluster) |
| B8 | Empty state กลาง `ไม่พบข้อมูล`/`No data found` ทั้ง list + search (§14 + AC-BOARD-006) | custom ทุกจุด: `No articles in this category` / `No results found for "q"` + suggestion sub (copy drift — sweep FSP-026) |
| B9 | Settings locked menu order + `Edit profile` + `Change password` ใน Account section (§10 Menu Rule + AC-SETTING-002) | home มี `About your account` row เดียว; Edit profile อยู่ profile page; Change password ใน about_account > Security (ดู C1) |
| B10 | Account Information rows: Username / Phone / Line / **Email Display** read-only (§2/§4/§10 Profile-Contact Rule + AC-SETTING-003) | ไม่มี contact rows ที่ไหนเลย — about_account มีแค่ Date joined + Account based in; pedit มีแค่ username/bio/link (003a B11) |
| B11 | Delete flow ตาม spec: confirm dialog `Delete account?` + locked body 4 บรรทัด (public profile removed / listed assets hidden / **chats, offers, reports, txn retained** / signed out + 30d) + `Cancel`+`Delete account` → `Account deletion started` modal + `Back to sign in` → Sign In (§9/§10 + AC-SETTING-009/010/010C) | flow คนละแบบทั้งเส้น (A8): 2 pages + reason + password + `Account deletion scheduled` + `Log out` → guest feed + member sheet (ดู C2/C3) |
| B12 | Deleted-account login state `Account scheduled for deletion` + `Please contact support if this was a mistake.` (§10 + AC-SETTING-010B) | ไม่มี flag/state — หลังลบ `fo_account` ถูกลบเฉพาะ session `new`; sign-in เดิมทำได้ปกติ (prototype บอก login เพื่อ **restore** ด้วยซ้ำ — ดู C3) |
| B13 | Delete Account failure path: API fail → ไม่ sign out, ไม่ clear session, error/retry จาก context เดิม (§9 + AC-SETTING-010D) | ไม่มี failure path — password ถูก = success เสมอ |
| B14 | SSO account: Email Display จาก provider + Change Password hidden/disabled (§8 + AC-SETTING-013) | ไม่มี account-type concept — change_pwd แสดงเสมอ |
| B15 | Sign Out copy `Sign out?` + body + `Cancel`/`Sign out` + destination Sign In + no back (§10 Sign Out Rule + AC-SETTING-008) | `Log out of @{user}?` + `Log out`/`Cancel` → guest feed + member sheet (A13 — body เหมือนกันแต่ label/destination ต่าง) |
| B16 | Notification Settings ต้องมี toggle **Offer** ด้วย (§10 + AC-SETTING-012) | ไม่มี offer toggle (removal scope — ตัดออกจาก spec ด้วยกันเอง) |
| B17 | Exception copies: `ไม่สามารถค้นหาได้`/`ไม่สามารถโหลดข้อมูลได้`+`ลองใหม่`/`ไม่สามารถลบบัญชีได้`/`กรุณาเข้าสู่ระบบอีกครั้ง`/`Permission denied` (§13 ทั้งสองเล่ม) | ไม่มี state เหล่านี้เลย — mock resolve ได้เสมอ |
| B18 | Analytics: board 14 events + settings 15 events | ไม่มี tracking layer (contract-level เหมือนทุก task) |
| B19 | Delete Account ต้องไม่อยู่บน Settings Home โดยตรง (AC-SETTING-002/009) | ✓ ตรง — อยู่ใน About your account เท่านั้น (aligned, ไม่ใช่ gap) |
| B20 | Article comment / user create-edit-delete article = ห้ามใน V1 (§6 + AC-BOARD-004/005/011) | ✓ ตรง — ไม่มี comment/create/edit เลย (aligned) |
| B21 | Menu label = `Board` (master name; `Community` ต้อง map) (§10 Menu Label Rule) | nav tab `กระดานข่าว/Boards` (plural) + brand `TUK DAENG \| Board` — naming drift (ซ้ำ 001b, sweep FSP-026) |
| B22 | Guest เข้า Settings ไม่ได้ → Global Login Required Dialog (§8 + AC-SETTING-011) | ตรงเจตนา — `.pf-menu` + `[data-navgo="profile"]` ใน gate → member sheet; settings unreachable ทั้งก้อน (copy ซ้ำ 001a B-01) |
| B23 | Password helper `At least 8 characters, with a number or symbol.` + field `Confirm new password` (§10 Change Password Rule) | `at least 6 characters ... (!$@%)` + `Re-type new password` (ดู C10) |

---

## C. ขัดกันโดยตรง (conflicts ต้อง sync)

| # | Spec บอก | Prototype ทำจริง | ข้อเสนอ |
|---|---|---|---|
| C1 | Settings Home = locked order 5 sections; Account ต้องมี Edit profile + Change password + About your account (§10 + AC-SETTING-002) | IG 6 sections + library/what-you-see; Account มี About row เดียว; chg-pwd อยู่ข้างใน | เขียน spec ตาม prototype structure (รวม Your library/What you see เป็น sections จริง + ย้าย Change password เข้า About your account) — ตัดสินว่า Edit profile ต้องมี entry ใน settings ไหม (ปัจจุบัน entry = profile page เท่านั้น) — **FSP-013** |
| C2 | Delete = confirm dialog เดียว `Delete account?` + locked copy → `Account deletion started` + `Back to sign in` (§9/§10 + AC-SETTING-010/010C) | 2-page flow (terms cards → reason required) + password dialog → `Account deletion scheduled` + `Log out` | adopt flow ตาม prototype (info page → reason → re-auth → scheduled) + เขียน copy ใหม่ — ปรับ spec ทั้ง flow + ทุก copy — **FSP-014** |
| C3 | ระหว่าง grace period `user login ไม่ได้ หรือเห็น account-deleted support state` + deleted-account login copy `Account scheduled for deletion…contact support` (§10 + AC-SETTING-010B) | step-1 card + success dlg บอก **"log back in anytime within 30 days to cancel deletion"** — login เพื่อ restore ได้ และไม่มี deleted state ใด ๆ | **ขัด semantics โดยตรง — ต้อง sign-off**: prototype (login-to-restore) สอดคล้อง BO Account Deletion restore flow; spec wording ก็กำกวม ("ไม่ได้ หรือเห็น state") — แนะนำเขียนเป็น restore-by-login + เก็บ support state เฉพาะกรณี contact/admin-side |
| C4 | Delete สำเร็จ → Sign In / pre-auth (AC-SETTING-010C); Sign Out → Sign In + back ไม่ได้ (AC-SETTING-008) | ทั้งคู่ → `setSession("guest")` feed + member sheet (AUTH-002) | model ใหม่ของ prototype: signed-out = guest browsing + member sheet คือ sign-in path — เขียน spec ตาม guest model (สอดคล้อง 001a/002b C10 cluster) |
| C5 | Guest **Share** Article ได้โดยไม่ต้อง login (AC-BOARD-010A + §8) | `[data-bdshare]` gated → member sheet | ขัดโดยตรง — ซ้ำ pattern 002b C10 ทุกประการ (like/comment/follow gate ตรง spec แต่ share ไม่ตรง): เลือก ungate share ตอน implement หรือแก้ spec เป็น gated |
| C6 | Guest Article Like → Global Login Required Dialog (§8 + AC-BOARD-010D); guest report → dialog เดียวกัน | `[data-bdlike]` + report entries ใน gate → member sheet | พฤติกรรมตรง (gate ก่อน action) — copy/UX ต่าง, ซ้ำประเด็น 001a B-01 |
| C7 | Report article = locked reason sheet + success modal + duplicate/error states บน Article Detail overflow (§10 + AC-BOARD-011A–D) | ไม่มี overflow เลย — `data-bdmore` ทั้งเมนู dead; เส้นทางเดียวที่เหลือ = toast | **ตัดสิน 2 ชั้น**: (1) spec-side — เขียน report flow ไว้เป็น contract (ควรเก็บเพราะ Trust & Safety handoff เป็น compliance) (2) prototype-side — อยู่นอก scope การแก้; flag ใน removal/dead list + sign-off ว่า report article = spec-only ชั่วคราว |
| C8 | spec 13: Notification settings ใน scope (baseline toggles, §6 In Scope + §10 Rule + AC-SETTING-012) vs spec 09 §6: preference center = **out of scope V1** | `notif_settings` page มีจริง 4 toggles (likes/comments/follows/walerts) | **spec internal contradiction** (จดไว้ 003b C16 แล้ว — ยืนยันอีกครั้งจากฝั่ง 13): resolve ตอน FSP-013/021 — เขียนเป็น in-scope baseline toggles ทั้งสองเล่ม; offer toggle = removal |
| C9 | spec 13 scope ไม่มี Your library / What you see / Content preferences / Favorites / Muted / Blocked เลย | ทั้งก้อนมีจริงและเป็น 2 ใน 6 sections ของ home | เขียน library + what-you-see sections เข้า spec 13 (หรือ map ไป 02/06/11 ด้วย cross-ref) — content อยู่ใน gap 002a A5 + 003a แล้ว — **FSP-013 ตัดสิน ownership** |
| C10 | Change Password = Auth-linked entry + helper 8-char + `Confirm new password` + SSO hidden (§10 + AC-SETTING-013) | in-settings page เต็ม + 6-char helper + `Re-type new password` + forgot link + แสดงเสมอ | ตัดสิน: (a) เก็บ in-app page → เขียน spec ใหม่ (fields/validation/flow) หรือ (b) route ไป auth flow ตาม spec; อย่างน้อยต้อง unify helper text + field label |
| C11 | Retention copy: `chats, offers, reports, transaction history may be retained for safety, legal, or audit` (§10 Delete copy) | step-1 cards: `chat history … will be permanently erased` + watch alerts cancelled | ขัดทิศ retention — unify (แนะนำ retained ตาม spec/legal) + **ตัด `offers` ออกจาก copy** (removal scope) |
| C12 | Board sections = 7 named master sections (AC-BOARD-002) | hero carousel + Latest Articles + freeform category tags | ต้องตัดสิน: เขียน spec เป็น magazine model (hero/latest/categories) แล้ว map master sections เป็น category taxonomy หรือบังคับ section model — **sign-off FSP-023** (กระทบ master baseline) |
| C13 | Empty/end copy กลาง `ไม่พบข้อมูล`/`No data found` + end-of-list `คุณดูรายการทั้งหมดแล้ว` | `No articles in this category` / `No results found for "q"` / `You're all caught up` | copy drift pattern เดิมทุก module — sweep FSP-026 (cross-ref 002a B2 note: TH `คุณดูครบทั้งหมดแล้ว` ≠ spec `คุณดูรายการทั้งหมดแล้ว`) |
| C14 | Board name = `Board` (§10 Menu Label Rule) | tab `กระดานข่าว/Boards` + brand `TUK DAENG \| Board` | naming drift — unify ตอนเขียน spec (เลือก `Board` ตาม master หรือ `Boards` ตาม UI) — ซ้ำ 001b |
| C15 | Delete dialog `delAccountDlgHTML`/`data-dlg="del-account"` variant | dead code (ไม่มี markup) + `.set-btn` dead (001b) + `data-bdmore`/`data-bdsave` dead | เป็น prototype dead code — spec ฝั่งไม่มี; บันทึกใน dead list FSP-009 (ไม่ต้องเขียน spec รองรับเส้นเก่า) |
| C16 | About title `About` (spec Screen Mapping) | head TH `เกี่ยวกับตึกแดง` / EN `About` | copy ใกล้เคียง — lock TH/EN pair ตอน FSP-013 |
| C17 | Article like = 1 user = 1 like + Unlike รองรับ (§12 Validation) | `a.liked` toggle + count ±1 ทำงานจริง | ตรง spec — aligned (บันทึกไว้ว่าไม่ใช่ gap) |

---

## สรุปสำหรับ task ถัดไป

- **FSP-023 (12_BOARD rewrite)**: เขียนใหม่รอบ magazine model ทั้งเล่ม — hero carousel (featured ≤5) + Latest + View all + category pills/burger sheet + search page (popular topics + live results + card grid) + article anatomy (author/meta/callout/tags) — ตัด 7-section model ออกหรือ map เป็น taxonomy (C12 sign-off); Report Article = contract-only (C7); guest share gate conflict (C5)
- **FSP-013 (13_SETTINGS — ภาษา/theme/legal)**: เขียน Settings Home ตาม IG 6-section จริง + lang/theme pages + help/about/legal pages + notif_settings (in-scope; resolve contradiction กับ spec 09); ตัดสิน ownership ของ library/what-you-see (C9) + Edit profile entry (C1)
- **FSP-014 (13_SETTINGS — delete + content prefs)**: เขียน delete flow ใหม่ทั้งเส้น (terms → reason → password → scheduled → guest) + grace-period login semantics (C3 sign-off) + chg-pwd in-app page (C10) + retention copy ตัด offers (C11)
- **FSP-006/007 (removal)**: offer toggle ใน notification settings spec (§10 + AC-SETTING-012) + `offers` ใน delete retention copy (§10) + `offers` ใน §2/§4 — เล็กกว่า 07 แต่มีจริง
- **FSP-009 (dead features)**: `data-bdmore` article menu ทั้งก้อน (share/copy/save/report), `data-bdsave` + `a.saved`, `data-dlg="del-account"` + `delAccountDlgHTML` + `.dlg-delaccount-go`, `.set-btn` (ซ้ำ 001b)
- **Mock bug (จดเฉย ๆ)**: `state.userPwd` (chg-pwd) vs `state.mockPassword` (del-account) คนละ field — เปลี่ยนรหัสแล้ว delete ยังรับแค่ `fox1234`
- **Verify:** `git status --porcelain Prototypes/` ว่าง — ไม่แตะ prototype
