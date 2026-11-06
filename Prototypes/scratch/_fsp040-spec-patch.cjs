/* FSP-040 spec content re-sync — targeted replacements across FrontOffice docs */
const fs = require("fs");
const path = require("path");
const D = path.resolve(__dirname, "../../FrontOffice");
const DOCS = path.resolve(__dirname, "../../docs");

const EDITS = {
"00_GLOBAL_RULES_MODULE.md": [
["| `post` (ไม่ผูก asset) | แสดง | แสดง | แสดง | แสดง | ไม่ Match |",
 "| `post` (ไม่ผูก asset) | แสดง | แสดง | แสดง | แสดง | Match เมื่อมี `price` (DEC-59) |"],
["Watch Alert match เฉพาะ `Sale` เท่านั้น — `salePosts()` ใน prototype = feed-visible priced posts (pfkind leak เดิมแก้แล้ว 2026-11-05)",
 "Watch Alert match = feed-visible priced posts ทุก kind (`Sale` + priced `post` — DEC-59 ruling 2026-11-05: ผู้ขายอาจลงขายโดยไม่ผูก asset ตัวเอง) — `salePosts()` ใน prototype = `discoverablePosts()` ที่มี `price` ตรง ruling แล้ว"],
["Search และ Watch Alert match เฉพาะ `Sale`",
 "Search แสดง `post` + `Sale`; Watch Alert match = priced posts ทุก kind (`Sale` + priced `post` — DEC-59)"],
["Watch Alert match เฉพาะ Asset `Sale`",
 "Watch Alert match = feed-visible priced posts (`Sale` + priced `post` — DEC-59)"],
["- เปิด post detail / post viewer และดู public profile (read-only)",
 "- เปิด post detail / post viewer และดู public profile (read-only)\n- เปิด follower/following lists ของ profile อื่น (list = read surface เปิดอ่านได้ — DEC-60; row actions ภายใน list อยู่ใน Login-Required ด้านล่าง)"],
],
"00_NAVIGATION_AND_CROSS_MODULE_FLOW.md": [
["- Profile actions (edit, follower/following rows, unblock)",
 "- Profile actions (edit, follower/following **row actions** — Follow/Remove/Chat ภายใน list, unblock) — ตัว follower/following list เปิดอ่านได้โดยไม่ gate (DEC-60)"],
],
"01_AUTHENTICATION_MODULE.md": [
["- Account created — sign-in handoff (email signup ไม่ auto-login)",
 "- Email + Social signup เข้าแอปทันทีหลัง profile setup (session `new`) — ruling 2026-11-06 ถอด `Account created` + sign-in handoff (override S-22/AC-AUTH-038)\n- Sign-up form เริ่มว่างเสมอเมื่อเข้าจากนอก flow (demo prefill ไม่รั่ว), tour keys แยก `fo_toured`/`fo_toured_guest`, device language เป็น default ของ onboarding, uniqueness เช็ค `fo_account` + `OB_DEMO`"],
["| Registration tail | Email signup ไม่ auto-login — OTP → profile setup → `Account created` → Sign in เอง (S-22); Social signup เข้าแอปทันทีหลัง profile step |",
 "| Registration tail | ทุก provider เข้าแอปทันทีหลัง profile step เป็น session `new` — ruling 2026-11-06 email เหมือน social (override S-22/AC-AUTH-038); ไม่มีหน้า `Account created` |"],
["- Account created handoff กลับ Sign In (email signup)",
 "- ~~Account created handoff กลับ Sign In~~ — ถอดแล้ว (ruling 2026-11-06)"],
["9. หน้า `Account created` — `Welcome, {name}. Sign in to start exploring.` → ปุ่ม `Sign in` → กลับ Sign In (prefill email ที่เพิ่งสมัครเท่านั้น password ว่าง — canonical lock 2026-10-29)\n10. User sign in สำเร็จ → session `new` — email signup **ไม่ auto-login** (S-22)",
 "9. เข้าใช้งานทันทีเป็น session `new` — ไม่มีหน้า `Account created` และไม่ต้อง sign in ซ้ำ (ruling 2026-11-06 — override S-22, IG parity)"],
["User เปิด Sign In (จาก Member Sheet `Sign in` หรือหน้า Account created)",
 "User เปิด Sign In (จาก Member Sheet `Sign in`)"],
["| `auth_account_created_shown` | หน้า Account created แสดง (email signup) |",
 "| ~~`auth_account_created_shown`~~ | ถอดแล้ว — ไม่มีหน้า Account created (ruling 2026-11-06) |"],
],
"04_ASSET_MANAGEMENT_MODULE.md": [
["| `post` (ไม่ผูก asset) | แสดง | ไม่แสดง | แสดง | ไม่แสดง | ไม่ Match |",
 "| `post` (ไม่ผูก asset) | แสดง | แสดง | แสดง | แสดง | Match เมื่อมี `price` (DEC-59) |"],
["- Prototype defects ที่บันทึกไว้ใน 00_GLOBAL (ไม่ใช่ spec — implementation ต้องแก้): `salePosts()` ไม่กรอง `pfkind` → priced `hide`/`sold` post รั่วเข้า search/WA match; public `all` tab รั่ว `post`/`hide`/`sold`",
 "- Prototype defects ที่เคยบันทึกไว้ (แก้แล้ว 2026-11-05): `salePosts()` = `discoverablePosts()` + `price` — `hide`/`sold` ไม่รั่วแล้ว; public `all` tab กรองถูกแล้ว; WA match pool รวม priced `post` ตาม DEC-59"],
["หลุด status tabs/`(N)` counts/WA match (`salePosts()` price pool เท่านั้น)",
 "หลุด status tabs/`(N)` counts; WA match ยังได้ถ้ามี `price` (priced `post` อยู่ใน pool ตาม DEC-59)"],
["- **`sold` post ยังเข้า search/WA match** — `salePosts()` pfkind leak (00_GLOBAL §10 defect note — canonical คือหลุด)",
 "- **`sold` post หลุด search/WA match แล้ว** — `salePosts()` = `discoverablePosts()` + `price` (pfkind leak แก้แล้ว); priced `post` match WA ได้ตาม DEC-59"],
],
"05_ASSET_DETAIL_MODULE.md": [
["| ไม่มีใน V1 | Owner/contact block บน detail, Follow จาก detail, Ask Seller บน detail, Save (bookmark) บน detail, Full Screen Image Viewer, inline comments + per-comment `...` actions, comment write/delete/report จริง |",
 "| ไม่มีใน V1 | Owner/contact block บน detail, Follow จาก detail, Ask Seller บน detail, Save (bookmark) บน detail, Full Screen Image Viewer, inline comment section บน detail (comments อยู่ shared sheet เสมอ) |"],
["- Comment input/reply = contract (prototype dead → toast `Not in this prototype yet`)",
 "- Comment ทำงานจริงใน shared sheet — input `Post` + emoji row, `Reply` prefill `@author` (flat one-level — DEC-17), long-press/contextmenu popover (own=Delete cascade, others=Block/Report → `report:comment`)"],
["- Comment interactions ใน prototype เป็น read/like-only: `c-like` toggle local (member), `Reply`/`emoji`/`input` → toast `Not in this prototype yet` (member) หรือ Member Sheet (guest); **ไม่มี** per-comment `...` menu, **ไม่มี** delete/report comment, **ไม่มี** `View all comments` (sheet คือ list เต็มแล้ว) — write/delete/report เป็น contract (§18)",
 "- Comment interactions ทำงานจริง (sync 2026-11-06): input + `Post` เพิ่มคอมเมนต์เป็น own comment, emoji row ส่ง emoji เป็นคอมเมนต์, `Reply` (`c-meta`) → prefill `@author ` + reply ติด root เดิม (flat one-level — DEC-17), long-press 450ms/contextmenu → `c-popover` per-comment actions — own = `Delete` (confirm dlg, root ที่มี replies ลบ cascade พร้อมเตือน), others = `Block`/`Report` (`report:comment` page); guest เห็น popover ได้แต่ item กระโดด gate (FSP-037); `c-like` toggle local (member) หรือ Member Sheet (guest); **ไม่มี** `View all comments` (sheet คือ list เต็มแล้ว)"],
["| 5 | ไม่มี inline comments + comment actions | ไม่มี `View all comments`/per-comment `...`/delete/report comment; comment sheet read+like-only; input/Reply/emoji dead → `Not in this prototype yet` |",
 "| 5 | ไม่มี inline comments บน detail | comments อยู่ shared sheet เท่านั้น — write/reply/delete/report ทำงานจริงแล้ว (popover own=Delete cascade / others=Block+Report, input `Post`, `Reply` prefill flat — DEC-17); per-comment menu ใช้ long-press/contextmenu แทน `...` (re-sync 2026-11-06) |"],
["| 9 | Root comment `Reply` ไม่ localize | `<span class=\"c-meta\">Reply</span>` hardcode EN; reply rows มี `ตอบกลับ`/`Reply` — language sweep FSP-026 |",
 "| 9 | ~~Root comment `Reply` ไม่ localize~~ | (resolved) `c-meta` localize แล้ว `ตอบกลับ`/`Reply` ทั้ง root + reply rows |"],
["| AC-DETAIL-016 | Comment rows ต้องมี avatar/name → Public Profile, time, text, `Reply` meta, like heart + count (`c-like` toggle local); ไม่มี per-comment `...`, delete หรือ report action ใน V1 prototype |",
 "| AC-DETAIL-016 | Comment rows ต้องมี avatar/name → Public Profile, time, text, `Reply` meta (localize `ตอบกลับ`/`Reply`), like heart + count (`c-like` toggle local); per-comment actions ผ่าน long-press/contextmenu popover — own=Delete (confirm + cascade replies), others=Block/Report → `report:comment` |"],
["| AC-DETAIL-017 | Comment input/emoji/`Reply` (member) → toast `Not in this prototype yet`; guest → Member Sheet; `c-like` เป็น local toggle เท่านั้น (contract: write/delete/report) |",
 "| AC-DETAIL-017 | Comment input/`Post`/emoji/`Reply` ต้องทำงานจริง (reply prefill `@author` flat one-level — DEC-17); guest กด item → Member Sheet; `c-like` เป็น local toggle |"],
["- Comment write/reply/delete/report จริง (prototype read+like-only) — per-comment `...` actions + delete cascade root→replies + report comment sheet (spec เดิม §8/§9 เก็บเป็น contract)",
 "- ~~Comment write/reply/delete/report จริง~~ — ทำแล้ว (popover + cascade + `report:comment`, sync 2026-11-06); ที่เหลือคือ per-comment `...` affordance แบบอื่นถ้าต้องการ"],
["- เปิด comment sheet อ่าน comments + replies (`comment-btn` ไม่ gate)",
 "- เปิด comment sheet อ่าน comments + replies (`comment-btn` ไม่ gate); long-press comment เห็น popover ได้ (item ภายใน gate)"],
],
"07_CHAT_MODULE.md": [
["`ch-post-card` (`data-chgo=\"post\"` + top scrim avatar/user + bottom scrim cap/price) **render เฉพาะจาก `m.pid` ในสายข้อความ** (reply-story style — ask/share เท่านั้น ไม่มีการ์ด pin ค้าง)",
 "`ch-post-card` (`data-chgo=\"post\"` + top scrim avatar/user + bottom scrim cap/price) **render จาก send-time snapshot `m.snap`** (`chPostSnap` — โพสต์ถูกลบการ์ดยังอยู่, tap → toast `This post is no longer available`; reply-story style — ask/share เท่านั้น ไม่มีการ์ด pin ค้าง)"],
["`chatRoomSettingsHTML` (~19832–19881 — **dead page**: Note notifications toggle, Chat wallpaper dead toast, Export chat history → clipboard + `คัดลอกประวัติแชทเรียบร้อยแล้ว`, Encryption keys `Letter Sealing` row, Delete data, Report)",
 "`chatRoomSettingsHTML` — **ถอดออกแล้ว 2026-11-05**: route `chsettings:{id}` → `\"\"` (dead route ~18278; เดิมหน้า Note notifications/wallpaper/export/encryption/Delete data/Report)"],
["12. **Send timestamp mock `09:41`** + ไม่มี incoming simulation → `Sent` ไม่เคยกลาย `Read` ใหม่; `Read`/`Sent` เฉพาะ `lastMe` (visual mock — ไม่ใช่ receipt system)",
 "12. **Send timestamp mock `09:41`** — incoming simulation ทดสอบได้ผ่าน dev button `msg` (`chIncomingAsk` — incoming listing ask เข้าจริง + เทส `followOnly` enforcement; FSP-038); `Read`/`Sent` เฉพาะ `lastMe` (visual mock — ไม่ใช่ receipt system)"],
["15. **`chsettings:{id}` = dead route ทั้งหน้า** — มี render+handler (`data-chgo=\"chsettings\"` ใน chatClick) แต่ไม่มี emit ที่ไหน (Note notifications/wallpaper/export/encryption/Delete data/Report)",
 "15. **`chsettings:{id}` = dead route** — render ถูกถอดแล้ว (`return \"\"` ~18278; `chatRoomSettingsHTML` ไม่มีในโค้ดแล้ว)"],
["flip ทันที ไม่มี enforcement surface ของ `followOnly` (deviation)",
 "flip ทันที — enforcement ทดสอบได้ผ่าน dev button `msg` (`chIncomingAsk` จาก non-followed ถูกกัน — FSP-038); production enforcement = contract"],
],
"11_SOCIAL_MODULE.md": [
["`pfRestrictHint` banner 6s (`You can restrict them to hide their comments and messages without blocking them completely.` + `Learn more` — tap ปิด)",
 "`pfRestrictHint` banner 6s (`You can restrict them to hide their comments and messages without blocking them completely.` — tap ปิด; `Learn more` ถูกตัดออกตาม FO-TEST-12)"],
],
"12_BOARD_MODULE.md": [
["ตรง — `data-bdlike` toggle + `data-bdshare` → shared share sheet (member-only; guest → Member Sheet ตาม S-03/00_GLOBAL §11)",
 "ตรง — `data-bdlike` toggle (persist per-account `fo_bdlike:{user}`; ยอดรวม = baseline + like ทุก account — member กดแล้ว guest เห็นยอดจริงแต่หัวใจไม่ติด, FSP-039) + `data-bdshare` → shared share sheet (`Copy link` = ลิงก์จริง `https://tukdaeng.app/a/{id}` คู่ `/p/` post, `/u/` user; member-only; guest → Member Sheet ตาม S-03/00_GLOBAL §11)"],
["- Saved Article UI (`data-bdsave`/`a.saved` = dead artifact — D5)",
 "- ~~Saved Article UI (`data-bdsave`/`a.saved`)~~ — ถอดออกจากโค้ดแล้ว (AC-BOARD-018)"],
["`data-bdsave`(**dead**) → `data-bdlike`",
 "`data-bdlike`"],
["| `liked`/`saved` | bool (injected) | viewer flags — `liked` live (like pill), `saved` dead-path เท่านั้น |",
 "| `liked` | bool (injected) | viewer flag — persist `fo_bdlike:{user}` per-account (ยอดแสดง = baseline + like ทุก account); `saved` field ถูกถอดแล้ว (AC-BOARD-018) |"],
],
"13_SETTINGS_MODULE.md": [
["Login/Log out ตาม prototype", "Login/Sign out ตาม prototype (DEC-61)"],
["| Session | Sign Out | Row `Log out` + confirmation → session `guest` + toast + Member Sheet (canonical flow 01_AUTH §8 Sign Out) |",
 "| Session | Sign Out | Row `Sign out` + confirmation → session `guest` + toast `Signed out` + Member Sheet `sign back in` (DEC-61 — unify verb Sign in/Sign out; TH `ออกจากระบบ` คงเดิม; canonical flow 01_AUTH §8 Sign Out) |"],
["- Log out\n", "- Sign out\n"],
["Confirmation states สำหรับ Log out,", "Confirmation states สำหรับ Sign out,"],
["6 sections + Login/Log out", "6 sections + Login/Sign out"],
["| Log Out Confirmation | dialog | `Log out of @{user}?` + Log out / Cancel |",
 "| Sign Out Confirmation | dialog | `Sign out of @{user}?` + Sign out / Cancel |"],
["- Log out ได้", "- Sign out ได้"],
["## Log Out Flow", "## Sign Out Flow"],
["-> Log out (Login section)", "-> Sign out (Login section)"],
["-> Snooze suggested posts toggle -> feed `All` tab เหลือเฉพาะ followed accounts 30 วัน",
 "-> Snooze suggested posts toggle -> feed `All` tab เหลือเฉพาะ followed accounts 30 วัน — persist `fo_snooze:{user}` per-account + 30-day expiry (account ใหม่ไม่สืบทอด — FSP-038)"],
["- Privacy & cookie preferences — Essential always-on + Analytics / Personalized toggles (contract — prototype ไม่มีหน้านี้; required โดย 00_GLOBAL §8)",
 "- Privacy & cookie preferences — Essential always-on + Analytics / Personalized toggles (มีจริงแล้ว — sub page `cookies` ~18119–18139; required โดย 00_GLOBAL §8)"],
["(`.set-btn` ~22691 = dead handler)", "(`.set-btn` ถูกถอดแล้วใน dead-code cull)"],
],
};

let miss = 0;
for (const [f, pairs] of Object.entries(EDITS)) {
  const fp = path.join(D, f);
  let t = fs.readFileSync(fp, "utf8");
  for (const [o, n] of pairs) {
    if (!t.includes(o)) { console.log("MISS", f, "::", o.slice(0, 80)); miss++; continue; }
    t = t.replace(o, n);
    console.log("OK  ", f, "::", o.slice(0, 60));
  }
  fs.writeFileSync(fp, t);
}
console.log(miss ? `\n${miss} misses` : "\nall applied");
