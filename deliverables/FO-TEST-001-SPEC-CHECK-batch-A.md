# FO-TEST-001 — ตรวจ expected เทียบ spec: Batch A (เล่ม 01–07)

> Task: 53c64847 (FO-TEST: ตรวจ expected ของเคสเทียบ spec ทีละเล่ม) · วันที่: 2026-10-30
> ขอบเขต: อ่าน expected ใน `deliverables/FO-TEST-001-{01..07}-*.md` แล้วเทียบกับ spec ใน `FrontOffice/` (contract)
> ไม่ได้รันเทสบนแอป/stg · ไม่ได้แก้เคส, spec, prototype หรือ fo-spec-sync · ไม่ได้เพิ่ม/ลบ TC ID
> สถานะ: **รอผู้ใช้ตัดสิน** ทุกแถว "ไม่ตรง" ก่อนแก้ไฟล์ใด ๆ

## 0. กติกาการตัดสิน

- **ตรง** = expected ไม่ขัดกับ spec และ behavior/ค่า/copy ที่ระบุมีอยู่ใน spec (หรือเป็นผลตามธรรมชาติของ action เช่น ปิด dialog แล้วกลับหน้าเดิม)
- **ไม่ตรง** = (ก) expected ขัดกับ spec, หรือ (ข) expected ระบุ copy/ค่า/พฤติกรรมเฉพาะที่ **ไม่พบใน spec**, หรือ (ค) expected ไม่ล็อกข้อความที่ spec ล็อกไว้ (wording ต่าง = FAIL ตามหัวเอกสารเล่ม)
- ความรุนแรง: **สูง** = ขัด contract/ค่าตัวเลข/state, **กลาง** = copy/พฤติกรรมไม่มีใน spec ที่ต้องตัดสิน, **ต่ำ** = รายละเอียดเล็ก

## 1. สรุปรวม

| เล่ม | ไฟล์ | TC | ตรง | ไม่ตรง |
|---|---|---:|---:|---:|
| 01 | Auth & Onboarding | 104 | 84 | 20 |
| 02 | Shell & Navigation | 65 | 35 | 30 |
| 03 | Feed & Post Cards | 82 | 77 | 5 |
| 04 | Search & Filter | 62 | 53 | 9 |
| 05 | Create Composer | 73 | 66 | 7 |
| 06 | Post Viewer & Detail | 93 | 82 | 11 |
| 07 | Bottom Sheets | 125 | 105 | 20 |
| **รวม** | | **604** | **502** | **102** |

หมายเหตุ: ตารางนี้นับ TC ID ที่ปรากฏในตาราง MD จริง (ไม่รวม SETUP/checklist). ทุก TC มีผลแล้ว ไม่มีเคสค้าง

## 2. รายการไม่ตรง — เล่ม 01 Auth (20 เคส)

| เลขเคส | spec ที่อ้าง | ระดับ | ส่วนที่ต่าง |
|---|---|---|---|
| 003 | 01 §8 Language | ต่ำ | ระบุปุ่มเปลี่ยนเป็น "ต่อไป" ทันทีเมื่อเลือกภาษา — spec ไม่มี label นี้ |
| 004 | 01 §8 Language | ต่ำ | เหมือน 003 (ปุ่มสลับ Continue/ต่อไป ตามภาษา) |
| 005 | 01 §8 Language; 00_GLOBAL | กลาง | ค่าเริ่มต้น English และหัวข้อ "Select your language · เลือกภาษา" ไม่มีใน spec |
| 008 | 01 Terms rules | ต่ำ | overlay เอกสารมี "เวอร์ชัน/วันที่ประกาศ" — spec ไม่ระบุ |
| 020 | 01 §8 step 7 | กลาง | ข้อความรอง "We use your activity in TukDaeng only…" ไม่มีใน spec (spec มีเฉพาะหัวข้อ) |
| 029 | 01 §11/§12 | กลาง | copy error "email invalid / password required" ของ sign up ไม่มีใน spec (spec มีเฉพาะ email ซ้ำและ policy) |
| 030 | 01 Email Registration | ต่ำ | copy "We sent a 6-digit code to" ไม่มีใน spec |
| 034 | 01 §Email/OTP; AC-AUTH-033 | ต่ำ | copy ถูกต้องแต่ expected เขียน "(หรือข้อความเทียบเท่า)" — spec ล็อก wording |
| 035 | AC-AUTH-033 | ต่ำ | toast ยืนยันหลัง Resend ไม่มีใน spec (cooldown/copy ตรง) |
| 039 | 01 §12 Username | กลาง | expected ไม่ล็อก copy `Username required — 3–20 characters: a–z, 0–9, _ or .` |
| 042 | 01 §8 step 9; AC-AUTH-038 | กลาง | expected ใช้ `{username}` — spec ใช้ `{name}` |
| 046 | AC-AUTH-040; §11 | สูง | expected ใช้ "email required / invalid / password required" แทน copy ล็อก `Enter your email.` / `Enter a valid email address.` / `Enter your password.` |
| 047 | AC-AUTH-041/042 | สูง | copy lockout ล็อกเป็น `Please try again in {X min Y sec} or choose Forgot password.` — expected ระบุ "mm:ss" และไม่ล็อก copy |
| 053 | 01 Terms rules | ต่ำ | header เวอร์ชัน/วันที่ใน legal overlay ไม่มีใน spec |
| 071 | AC-AUTH-052 | ต่ำ | toast หลัง Accept & continue ไม่มีใน spec |
| 072 | 01 §12 Re-consent Decline | กลาง | expected ไม่ล็อกข้อความ `You need to accept the required Terms and Privacy Policy…` |
| 077 | 13 AC-SETTING-011 validation | สูง | copy เป็นคำแปลเอง (ไม่ตรง copy ล็อกของ 13) และ "≥8 ตัวอักษร" ไม่ครบ — spec 13 ล็อก ≥8 + ตัวเลขหรือสัญลักษณ์ |
| 079 | 13 change_pwd | กลาง | expected ใช้คำย่อ "entered incorrectly" — copy ล็อกคือ `Your current password was entered incorrectly. Please check it and try again.` |
| 090 | 13 Confirm account deletion | กลาง | expected ใช้ "(เทียบเท่า)" — copy ล็อก `Please enter your password.` / `Incorrect password. Please try again.` |
| 096 | 13 Log out; 01 §Sign Out | กลาง | expected ไม่ล็อก toast `Logged out successfully` |

เคสที่เหลือใน 01 (84 เคส) = ตรง รวมถึง 049, 060, 061–068, 069–070, 091–092, 098–104

## 3. รายการไม่ตรง — เล่ม 02 Shell (30 เคส)

| เลขเคส | spec ที่อ้าง | ระดับ | ส่วนที่ต่าง |
|---|---|---|---|
| 010–018 | 00_NAV §6.5 | กลาง | expected ระบุ toast "Coming soon" — spec ล็อก toast placeholder เป็น `Not in this prototype yet` (ตัดสิน: เปลี่ยน expected หรือ spec). 011–018 อ้างเคส 010 ทั้งหมด |
| 019 | 00_NAV §6.5 | กลาง | "burger ซ้ำ = ยังเปิด" และ device back ปิด drawer — spec ไม่ระบุ |
| 027 | 00_NAV §6.3 | กลาง | re-tap แท็บ Chat/อื่นให้ reset root — spec ระบุ re-tap เฉพาะ Feed |
| 028 | 00_NAV §6.3 | กลาง | ไม่มีใน spec ว่าสลับแท็บแล้วคงตำแหน่ง scroll |
| 032 | 00_NAV §6.3 (Active state) | สูง | expected ให้ Feed active บนโปรไฟล์คนอื่น — spec ระบุว่า "ดู public profile ของคนอื่นไม่ไฮไลต์ Profile tab" (ไม่ได้ระบุให้ Feed active) |
| 038 | 02 Switch Feed Tab | กลาง | expected ให้ re-tap แท็บ active ไม่ re-render — spec ระบุ "สลับ tab = re-render + scroll top" ไม่ได้ระบุกรณี re-tap active |
| 042–048 | ไม่พบใน spec/inventory §2.12 | สูง | scroll-to-hide ของ header/bottom nav ไม่มีใน FrontOffice/ เลย (มีแต่ใน inventory เป็น "scroll/anim mechanics" regression) — หมายเหตุใน test ที่อ้าง "spec ยืนยันแล้ว 2026-10-28" หาไม่พบ |
| 054 | 00_GLOBAL §8 Bottom Sheet (device back เฉพาะ sheet) | กลาง | กติกา device back ระดับ sub page/ห้ามออกจากแอป ไม่มีใน spec (หมายเหตุใน test อ้าง "spec ยืนยันแล้ว" หาไม่พบ) |
| 056 | 00_NAV Post Viewer | กลาง | ระบุว่า list-mode เลื่อนอิสระ — spec ระบุ snap เฉพาะ immersive |
| 057–060 | 07_CHAT / 00_GLOBAL Coach Marks | สูง | ข้อความ/ขั้นตอน coach bubble ("Next ×3 / Got it", copy "Sign up to create your first post." ฯลฯ) ไม่มีใน spec — spec ระบุแค่ว่ามี coach mark ครั้งเดียว (member/guest) |
| 059 | 00_GLOBAL Coach Marks | กลาง | แตะนอก bubble ปิด tour — ไม่มีใน spec |
| 062 | 00_NAV §6.3 | ต่ำ | label drawer ภาษาไทยไม่มีใน spec |
| 064 | 13 Language | ต่ำ | คงตำแหน่ง scroll หลังสลับภาษา — ไม่มีใน spec |
| 065 | 00_NAV §6.3 | กลาง | expected ระบุ "spec ล็อก 2026-10-28 ทุกแท็บจำ state" — ไม่พบข้อความนี้ใน FrontOffice/ (ผูกกับ 028) |

เคสที่เหลือใน 02 (35 เคส) = ตรง รวมถึง 066 (ไม่มี payment ใน V1 — spec อยู่ 04 §Phase 1 และ 16 Payment Gateway Phase 2; test อ้าง 00_GLOBAL §10 ซึ่งไม่มีข้อความนี้ ต้องแก้ citation)

## 4. รายการไม่ตรง — เล่ม 03 Feed (5 เคส)

| เลขเคส | spec ที่อ้าง | ระดับ | ส่วนที่ต่าง |
|---|---|---|---|
| 004 | 02 §8 Feed list; §9 No pagination | สูง | expected มี pagination และ pull-to-refresh — spec 02 ระบุ "ไม่มี pagination/load-more, pull-to-refresh, infinite scroll ใน V1" |
| 012 | 02 Card Photo Interaction | กลาง | threshold การลาก (~64px / ~20%) ไม่มีใน spec |
| 014 | 02 Card Photo Interaction | สูง | expected ให้ swipe ที่ขอบแรก/สุดท้าย rubber-band ไม่วน — spec ระบุ "swipe → carousel วนวน (wrap around)" |
| 041 | 11_SOCIAL §Share (line 245) | สูง | expected ให้โพสต์ไปโผล่ในห้องแชทจริง — spec ระบุ `.sh-fr` เป็น toast `Sent to {name}` เท่านั้น ไม่มี chat delivery |
| 074 | 02 §13 Empty State; 00_GLOBAL §11 | สูง | expected ใช้ข้อความ Following-style — spec กำหนด All empty = `ไม่พบข้อมูล` / `No data found` |

เคสที่เหลือใน 03 (77 เคส) = ตรง รวมถึง 067 (Delete dialog ตรง copy ล็อก) และ 081 (THB format)

## 5. รายการไม่ตรง — เล่ม 04 Search (9 เคส)

| เลขเคส | spec ที่อ้าง | ระดับ | ส่วนที่ต่าง |
|---|---|---|---|
| 004 | 03 Bookmark shortcut | ต่ำ | copy "No saved posts yet" ไม่พบใน spec (มี "No saved posts to add" เท่านั้น) |
| 016 | 03 §Recents Rule; Search State Rule | สูง | expected ให้ recents อยู่ข้าม restart — spec ระบุ session memory เท่านั้น ไม่ persist |
| 020 | 03 §Explore/Results | ต่ำ | "เรียงใหม่→เก่า" — spec ระบุ natural order ของ POSTS (ไม่ได้ระบุ newest-first) |
| 028 | 03 §Recents Rule (line 282) | กลาง | expected ให้ hashtag ไม่เข้า recents — spec ระบุ pushRecent ทุกครั้งที่เลือก tag |
| 030 | 03 Search State Rule | กลาง | expected ให้เปิดใหม่แล้ว q/filter ถูกล้าง — spec ผูก state กับ `scr._search` (ไม่ระบุว่าล้างตอนเปิดใหม่) |
| 032 | 03 Results Eligibility (line 265) | สูง | expected ให้ tag mode กรอง ni/blocked — spec ระบุ `#` query กรองแค่ !muted (ยอมรับเป็น deviation) |
| 054 | 10 Watch Alert | ต่ำ | ชื่อ sheet "Edit watch alert" / ปุ่ม "Delete alert" ไม่พบใน spec (spec ใช้ Save changes + Delete) |
| 059 | 11 / 03 | ต่ำ | copy "No saved posts yet" ไม่พบใน spec (เหมือน 004) |
| 060 | 03 §4 Master Alignment; §10 Deviations | สูง | expected ให้ label ทั้งหน้าเป็นไทยครบ — spec ระบุ TH copy ของ search surfaces "ไม่มีใน V1" และ EN-only เป็น deviation (ต้องตัดสิน: ขอบเขต TH ของ V1) |

เคสที่เหลือใน 04 (53 เคส) = ตรง รวมถึง 031 (ไม่มี sort UI), 037–040 (AND/OR, Apply), 045–046 (price copy ตรง)

## 6. รายการไม่ตรง — เล่ม 05 Create (7 เคส)

| เลขเคส | spec ที่อ้าง | ระดับ | ส่วนที่ต่าง |
|---|---|---|---|
| 009 | 02 Create (Select mode) | ต่ำ | expected ให้ highlight cell ค้างหลังปิด Select — spec ไม่ระบุ และดูเป็น bug ไม่ใช่ contract |
| 012 | 02 §8 Step 1 picker | สูง | expected ให้กล้องเปิดจริง — spec ระบุ camera tile / Recents dropdown / expand icon เป็น dead → toast `Not in this prototype yet` |
| 013 | 02 Discard Draft Flow | สูง | copy dialog ใน create = `เริ่มใหม่ใช่ไหม` / ปุ่ม `เริ่มใหม่` — expected ใช้ "Discard/Cancel" (copy ของ edit mode) |
| 041 | 02 Asset/Post Audience | สูง | expected ให้ followers-only บังคับการมองเห็นจริง — spec ระบุ enforcement เป็น deviation/ไม่อยู่ใน V1 |
| 067 | 02 Discard Draft Flow; AC-FEED-050 | สูง | expected ให้ meta-only draft ทำให้ dialog เด้ง — spec ระบุ draft ว่าง (ไม่มี media + caption ว่าง) ปิดเงียบ |
| 069 | 00_NAV §6 Prototype artifacts | ต่ำ | เคส `fo_newpost` เป็น dev harness ไม่มีบนแอปจริง — ต้องตัดสิน: ตัดออกหรือเก็บเป็น N/A |
| 070 | 02 Composer toasts (line 574) | กลาง | expected ให้ toast เป็นไทย — spec ระบุ composer toasts เป็น EN hardcode (deviation ยังไม่มี TH branch) |

เคสที่เหลือใน 05 (66 เคส) = ตรง รวมถึง 043, 050, 052–053, 057 (toast ตรง copy ล็อก)

## 7. รายการไม่ตรง — เล่ม 06 Viewer & Detail (11 เคส)

| เลขเคส | spec ที่อ้าง | ระดับ | ส่วนที่ต่าง |
|---|---|---|---|
| PV-003 | 03 Post Viewer Modes | สูง | expected ให้ feed mode (Saved) ไม่มีไอคอนค้นหา — spec ระบุ feed mode มี back + title + `pv-srch` |
| PV-011 | 03 Post Viewer Modes | สูง | เหมือน PV-003 (list mode ไม่มี search) |
| PV-027 | 02 Card Photo Interaction | สูง | expected ให้ swipe ไม่วน — spec ระบุ swipe วนวน (ซ้ำกับ FEED-014) |
| PV-035 | 03 pfp mode | ต่ำ | pill Following fade ~1.2s ไม่มีใน spec |
| PV-039 | 03 / 02 | กลาง | Follow แทรกในหัวการ์ด (watch-alert solo) ไม่พบใน spec |
| PV-047 | 02 Turn off commenting (line 249, 743) | กลาง | expected ให้ "Add comment…" หาย — spec ระบุเฉพาะ comment button + count |
| PV-053 | 05 Status tag (line 253) | กลาง | expected ให้ feed post ไม่มี status tag — spec 05 ระบุ tag ขับด้วย price (no price → SHOWCASE) ขัดกับ DET-009 เอง |
| DET-009 | 05 Status tag (line 253, 339) | สูง | expected ให้ Sold → "SOLD" tag — spec ระบุ tag ขับด้วย price และ sold ยังคง FOR SALE (deviation) ไม่มี SOLD tag |
| DET-032 | 05 Action row | กลาง | liked-by row บน detail ไม่พบใน spec 05 |
| DET-034 | 02 noComments (line 743) | กลาง | expected ให้ "Add comment…" บน immersive หาย — spec ไม่ระบุ |
| DET-037 | 00_NAV §10 (line 274); 05 (line 355, 577); DEC-07 | สูง | expected ให้แสดง toast `This post is no longer available` — spec ระบุ unavailable page `รายการนี้ไม่พร้อมใช้งานแล้ว` (contract) toast เป็นแค่ prototype |

เคสที่เหลือใน 06 (82 เคส) = ตรง รวมถึง PV-007/008 (solo viewer header), PV-040/041 (pfp ⋯ = Report only), PV-045 (owner menu), DET-006/016 (head sticky), DET-013/018/036

## 8. รายการไม่ตรง — เล่ม 07 Bottom Sheets (20 เคส)

| เลขเคส | spec ที่อ้าง | ระดับ | ส่วนที่ต่าง |
|---|---|---|---|
| 009 | 02 Sheets; AC-NAV | กลาง | expected ให้ unfollow confirm ย้อนกลับ caption sheet — ไม่พบข้อความนี้ใน spec |
| 016 | 11 §Sheet anatomy (line 211) | กลาง | expected ให้ไม่มีไอคอนแนบไฟล์ — spec ระบุ `.comment-input` มี img/gif icons (dead) |
| 019 | 11 §Comment (line 214) | กลาง | reply prefill "@username" ไม่มีใน spec (Reply `.c-meta` ไม่มี handler ใน prototype) |
| 024 | 11 §Comment (line 77) | กลาง | expected ให้ like comment persist — spec ระบุ comment like เป็น cosmetic |
| 035 | 11 §Toasts (line 436) | ต่ำ | toast "Unblocked" ไม่มีใน spec |
| 038 | 11 / 02 | ต่ำ | "Add comment…" หายพร้อม noComments — ไม่มีใน spec |
| 051 | 11 §Share (line 245) | สูง | expected ให้ส่งเพื่อนแล้วโพสต์เข้า chat — spec ระบุ toast เท่านั้น (ซ้ำกับ FEED-041) |
| 052 | 11 §Share (line 245) | กลาง | expected ให้ "เลือกแอป → OS share" — spec ระบุ toast `Shared to {app}` / `Link copied` เท่านั้น |
| 064 | 02 / 11 (save/nc) | ต่ำ | nc Cancel ย้อนกลับ save sheet — ไม่พบใน spec |
| 073 | 11 (line 173) | ต่ำ | counter "0 / 40" และตัดชื่อที่ 40 ตัว — ไม่มีใน spec |
| 074 | 11 | ต่ำ | counter "3 / 40" — ไม่มีใน spec (เหมือน 073) |
| 075 | 11 | ต่ำ | จำกัด 40 ตัว — ไม่มีใน spec (เหมือน 073) |
| 082 | 10 Watch Alert (edit mode) | ต่ำ | title "Edit watch alert" + ปุ่ม "Delete alert" ไม่ตรง spec (Save changes + Delete) |
| 094 | 02 / 11 | ต่ำ | uf กลับ caption sheet — ไม่พบใน spec (เหมือน 009) |
| 098 | 11 §Unfollow (line 328, 343, 348) | กลาง | expected ให้ unfollow จาก mf sheet ทันทีไม่มี confirm — spec ระบุ uf confirm สำหรับ follow-btn; unfollow ทันทีมีเฉพาะ ni-card |
| 109 | 03 §10 Deviations; 11 | กลาง | expected ให้ไทยครบทุก sheet — spec ระบุ search/composer/sheet บางส่วนเป็น EN-only (deviation) ต้องตัดสินขอบเขต TH ของ V1 |
| 110 | 03 §10; 02 (line 574) | กลาง | เหมือน 109 (save/wishlist/block/caption/share) |
| 118 | inventory §2.8 (bdmore dead) | สูง | expected ให้เมนู ⋯ ของ board ใช้งานได้ — inventory ระบุ bdmore เป็น dead wiring |
| 119 | 06 Profile (ไม่มี profile ⋯ options) | ต่ำ | options sheet "Share this profile / About this account / Copy profile URL" ไม่พบใน spec |
| 120 | 07_CHAT (attach sheet) | ต่ำ | attach sheet ในห้องแชทไม่พบ expected ชัดใน spec |

เคสที่เหลือใน 07 (105 เคส) = ตรง รวมถึง drag/handle/device back (004–005), popover long-press (025–029), block sheet และ copy ของ report (033, 116–117), Save/Wishlist toast (058, 065, 068–069, 070), watch alert toast (088–089), Unfollow confirm (091–093), Ask pill (121–125)

## 9. ประเด็นระบบ (ต้องตัดสินก่อนแก้เคสหรือ spec)

1. **AC-AUTH-031 ID ซ้ำ 2 ความหมาย** ใน `01_AUTHENTICATION_MODULE.md` บรรทัด 550 (Analytics off) และ 551 (Sign Up email+password) — ต้องเลือกว่าจะ renumber อันไหน (เคส 011 อ้างอันแรก)
2. **Change Password label ไม่ตรงกันเอง**: spec 01 ใช้ `Confirm new password`, spec 13 ใช้ `Re-type new password` (เคส 076 ตาม 13)
3. **spec 13 มีบรรทัด stale** "prototype deviate — เช็กเฉพาะความยาว" (line 569, AC-SETTING-011) ขัดกับ RESOLVED FO-SYNC-01 ในบรรทัดเดียวกันของ 13 (line 497)
4. **Decision register #1** (`22-decision-register.md`) เขียนว่า "ต้อง Accept จึงเข้าใช้งานได้" ซึ่งคลุมเครือกับ Reject all ของ spec 01 และเคส 011
5. **Scroll-to-hide ของ shell** (042–048) ไม่มีใน spec และ inventory — ต้องตัดสินว่าจะเพิ่มเข้า spec หรือถอดเคส
6. **Coach mark copy/ขั้นตอน** (057–060) ไม่มีใน spec
7. **TH copy ของ V1**: spec 03 และ 11 ระบุ search/composer/sheet บางส่วนเป็น EN-only (deviation) แต่เคส 060/070/109/110 ต้องการไทยครบ — ต้องตัดสินขอบเขต
8. **Tag mode กรอง ni/blocked** (032) ขัดกับ deviation ที่ spec 03 บันทึกไว้เอง
9. **Swipe carousel วนวน** (014, PV-027) ขัดกับ spec 02 ที่ระบุว่า swipe วนวน
10. **Status tag ของ Sold / feed post ไม่มี price** (DET-009, PV-053) — spec 05 ระบุ tag ขับด้วย price เท่านั้น
11. **Share → chat delivery** (FEED-041, SHT-051) — spec ระบุ toast เท่านั้น
12. **Citation**: SHELL-066 อ้าง "กติการะบบข้อ 10 / 00_GLOBAL §10" แต่ข้อความ payment อยู่ใน 04 §Phase 1 และ 16 — ควรแก้ citation
13. **หลายเคสอ้าง "spec ล็อก 2026-10-28/29" หรือ "ยืนยัน spec แล้ว"** แต่ข้อความที่อ้างหาไม่พบใน `FrontOffice/` (เช่น 042–048, 054, 065) — ต้องระบุแหล่งที่มา (ถ้ามีอยู่ที่อื่นให้บอกมา)
14. **Auth lockout copy** (047/104) — spec ระบุ `X min Y sec` แต่เคสเขียน mm:ss

## 10. Manual QA สำหรับผู้ใช้ (ตาม task)

- เลือก batch A แล้วตัดสินแต่ละแถว "ไม่ตรง" ในหัวข้อ 2–8: แก้ expected หรือแก้ spec
- สุ่มตรวจ 5 เคสที่ "ตรง" โดยเปิด spec ตาม AC/section ที่อ้าง (แนะนำ: 011, 043, 061, 091, 123)
- ยังไม่ได้แก้ไฟล์เคสหรือ spec ใดทั้งสิ้น รอคำตัดสินก่อน

## 11. batch ถัดไป

- Batch B = 08–13, Batch C = 14–19 (ยังไม่เริ่ม)

## 12. ตรวจ prototype (`Prototypes/fo-flow/index.html`) เทียบรายการความรุนแรงสูง

กลุ่ม 1 = prototype กับ spec ตรงกัน เคสผิด → แก้เคส
กลุ่ม 2 = prototype เป็น dev artifact/dead หรือ deviation ที่ spec บันทึกไว้ → แก้ prototype หรือคง spec
กลุ่ม 3 = prototype ต่างจาก spec และมีคอมเมนต์ `spec-locked` ในโค้ด → spec อาจค้างหลัง lock; ต้องให้ผู้ใช้ยืนยันก่อนแก้ spec

| เคส | prototype | spec | กลุ่ม |
|---|---|---|---|
| FEED-004 pull-to-refresh | มี ptr indicator (~L20567) | 02 ระบุว่าไม่มีใน V1 | 3 |
| SRCH-016 recents ข้ามการรีสตาร์ท | persist ผ่าน localStorage `fo_srch_recents` (comment spec-locked ~L14622) | 03 ระบุ session memory | 3 |
| SRCH-030 เปิด search ซ้ำ → ล้าง state | ล้างเสมอ (comment spec-locked ~L21978) | 03 ไม่ระบุชัด (ผูก `scr._search`) | 3 |
| SRCH-032 tag mode กรอง ni/blocked | กรอง (comment spec-locked ~L14689) | 03 บันทึกว่าไม่กรอง (deviation) | 3 |
| SHELL-010 toast drawer | `Not in this prototype yet` | 00_NAV ล็อก copy นี้ | 1 (เคสผิด: "Coming soon") |
| SHELL-042–048 scroll-to-hide | ไม่พบโค้ด | ไม่มี | 1 (ไม่มีทั้งสองฝั่ง ต้องตัดสินว่าจะเพิ่มหรือถอน) |
| CRE-012 กล้อง/Recents | dead → toast | dead | 1 |
| DET-037 post ถูกลบ | หน้า empty state (TH ตรง spec) | หน้า unavailable ตาม contract | 1 (เคสระบุ toast) |
| AUTH-096 logout toast | `Logged out successfully` | ตรงกัน | 1 (เคสไม่ได้ล็อก copy) |
| AUTH-047 lockout | countdown component (ยังไม่ยืนยันรูปแบบ) | `{X min Y sec}` | 3 (ต้องยืนยันรูปแบบจริงกับ spec) |
| SRCH-060 label TH | EN-only | 03 ระบุเป็น deviation ไม่อยู่ใน V1 | 2 (ต้องตัดสินขอบเขต TH) |

ยังไม่ได้ยืนยันทั้งหมด: FEED-041 (ตรวจเฉพาะ class `.sh-fr` ยังไม่ได้ตาม handler ทั้งหมด), SHELL-032, CRE-013 (EN copy), DET-009 (มี status map `SOLD` แต่ยังไม่ยืนยัน tag), และ swipe ของ carousel (014/PV-027)

คำถามสำหรับผู้ใช้: comment `spec-locked` ใน prototype อ้างอิง lock ที่ไหน (ไม่พบ decision ใน repo) ถ้าเป็น lock จริง กลุ่ม 3 ควรแก้ spec ตาม prototype (FEED-004, SRCH-016/030/032)

## 13. การแก้ไขข้อมูลและการตัดสินใจจากผู้ใช้ (2026-10-30)

### 13.1 ข้อแก้ไขจากหัวข้อ 3 และ 12
- **Scroll-to-hide มีอยู่ใน prototype แล้ว** (`Prototypes/fo-flow/index.html` ~L20550–20558, class `bars-hidden`, เฉพาะ `.feed-scroll`) ข้อความเดิมว่า "ไม่พบโค้ด" ผิด เพราะค้นชื่อ `scrollY/lastScroll` อย่างเดียว เคส SHELL-042–048 จึงอ้างได้ถึง prototype แต่ spec 00_NAV และ 02 ยังไม่มีกติกานี้
- **Pull-to-refresh มีใน prototype** (~L20565) และโค้ดคอมเมนต์อ้าง `FEED-004` ซึ่งเป็น ID ของเคสทดสอบ แปลว่า prototype ถูกทำตามเคส ไม่ใช่ spec

### 13.2 การตัดสินใจ
| รายการ | การตัดสินใจ | ผลต่อ spec | ผลต่อเคส |
|---|---|---|---|
| ซ่อน header/nav ตอนเลื่อนลง (feed) | ยึด prototype | เพิ่มกติกาใน 00_NAV §6 และ 02 Feed | SHELL-042–048 ใช้ได้ตามที่เขียน |
| ตอบ comment | ทำให้เหมือน IG | แก้ spec 11 (จาก 1 ชั้นเป็น IG thread) | SHT-017–020 ต้องปรับ โดยเฉพาะ SHT-020 ที่เป็นเคส "สร้าง reply ชั้น 2 ไม่ได้" ซึ่งจะกลับด้าน |
| viewer / post detail | ยึด prototype (เป็นการเพิ่มตาม request ของพี่คิง) | แก้ spec 03 (viewer 3 mode) และ 05 (detail) ให้ตรง prototype | PV-003, PV-011, DET-037 และเคสอื่นที่ขัด prototype ต้องปรับตาม |

### 13.3 ข้อที่ยังไม่ตัดสิน
- **carousel บนการ์ด**: prototype แตะครึ่งซ้าย/ขวาเปลี่ยนรูปแบบวน ขัดกับ IG ที่หยุดที่ปลาย และ spec 02 ระบุ swipe วนวน ยังรอการตัดสิน (ข้อ 14 ที่เสนอก่อนหน้า)
- **pagination ของ feed**: ยังไม่ตัดสิน
- **pull-to-refresh**: prototype มีแล้ว ต้องยืนยันว่าจะเพิ่มใน spec 02

### 13.4 ขั้นตอนถัดไปที่รอการอนุมัติ
1. บันทึกการตัดสินใจ 13.2 ลง decision register เป็น DEC ใหม่ พร้อมอ้างอิง request ของพี่คิง
2. แก้ spec 00_NAV, 02, 03, 05, 11 ให้ตรงการตัดสินใจ
3. แก้เคส SHELL-042–048, SHT-017–020, PV-003, PV-011, DET-037 ให้ตรง prototype
4. รอคำตอบเรื่อง carousel และ pagination ก่อนแก้ข้อที่เหลือ

## 14. การตัดสินใจ Feed behavior (DEC-13, DEC-14, DEC-15) และผลต่อเคส

แก้แล้วใน spec: `FrontOffice/02_FEED_MODULE.md` (Open Feed, Tap-to-Refresh, Card Photo Interaction, Card Navigation, Performance, Out of Scope, AC-FEED-010, AC-FEED-035)
ยังไม่แก้ prototype และเคสทดสอบ (รอคำสั่งแยก)

เคสที่ต้องปรับตามสเปกใหม่:
- FEED-004 (pagination/pull-to-refresh) — ตรงแล้วกับสเปกใหม่ ไม่ต้องแก้เคส
- FEED-010 (วนรอบด้วยการแตะ) — ต้องแก้: ปลายหยุดไม่วน
- FEED-014 (rubber-band) — ตรงกับสเปกใหม่
- FEED-011 / FEED-012 — ตรงกับ single tap ไม่เปิด viewer; ต้องเพิ่มเคส double-tap ไลก์ (member/guest)
- PV-026 และ DET-007 (tap วนรอบบน viewer/detail) — ค้างการตัดสินใจ: ใช้ handler เดียวกับ feed ตาม spec 05
- PV-027 — ตรงกับสเปกใหม่ (swipe หยุดที่ปลาย)

### 14.1 ผลการแก้เคสเล่ม 03 (ทำแล้ว 2026-10-30)
- FEED-010: เปลี่ยนเป็น swipe ทีละรูป หยุดที่ปลาย ไม่วน (MD และ CSV)
- FEED-083 (ใหม่, MEMBER, High): double-tap รูป = ไลก์ ครั้งที่สองไม่ยกเลิก
- FEED-084 (ใหม่, GUEST, Medium): double-tap → Member Sheet, single tap ไม่ทำอะไร
- สถิติ `FO-TEST-001-03-feed.md` อัปเดตเป็น 84 TC (High 33 / Medium 42 / Low 9) และ CSV 96 แถว
- ค้าง: PV-026 และ DET-007 (tap วนรอบบน viewer/detail) รอคำตัดสินเรื่อง viewer/detail
- ยังไม่แก้ prototype (อยู่นอกขอบเขต FO-TEST)

## 15. ผลการดำเนินการรอบ ก / ข (2026-10-30)

### 15.1 ก. แก้ spec และเคสตามที่อนุมัติ
- `00_NAV` §6.3A (ใหม่): scroll-to-hide ของ feed (DEC-18) — SHELL-042–048 เปลี่ยนเป็น **ตรง** (จากเดิม ไม่ตรง 7 เคส)
- `11_SOCIAL`: comment composer และ reply แบบ IG flat thread อยู่ใน V1 (DEC-17); แก้ non-goal และ Reply affordance
- SHT-018 และ SHT-020 เขียนใหม่ตาม DEC-17 (MD และ CSV)
- `02` และ `04`: composer toasts ต้องแปลไทยตาม DEC-19 (แก้ EN hardcode deviation)
- `03`: ตัดข้อความ "TH copy ไม่มีใน V1" และแก้ TH localization ให้ครบตาม DEC-19
- ตัวเลขสถิติเล่ม batch A หลังนี้: shell ไม่ตรง 23 (จาก 30), ตรง 42 (จาก 35)

### 15.2 ค่า pagination (DEC-13) — ข้อเสนอ รอยืนยัน
- **10 โพสต์ต่อหน้า** — payload ต่อครั้งเล็กพอสำหรับมือถือและรูปยังไม่หนักเกิน
- **เริ่มโหลดหน้าถัดไปเมื่อเหลือ 3 การ์ดสุดท้าย** — ผู้ใช้ไม่เห็นการรอ เพราะ prefetch ก่อนถึงท้าย ~1.5 หน้าจอ
- ปรับได้หลังเทสจริงบน stg (วัดเวลาโหลดและจำนวนครั้งที่เห็น loading)

### 15.3 SRCH-016 / 030 / 032 — spec-locked ที่ไม่มี decision record
ผลการค้นใน prototype พบ `spec-locked` 6 จุด (`Prototypes/fo-flow/index.html`):
| บรรทัด | ข้อความ | ที่มา | ข้อสังเกต |
|---|---|---|---|
| ~14622 | recents persist ข้าม restart | ไม่มี | ตรงกับเคส SRCH-016 |
| ~14625 | เปิด search ใหม่ = landing, state ถูกล้าง | ไม่มี | ตรงกับ SRCH-030 |
| ~14660 | strap match ตามตระกูล spec | ไม่มี | ตรง spec 03 ปัจจุบัน |
| ~14689 | tag mode กรอง ni/muted/blocked | ไม่มี | ตรงกับ SRCH-032 |
| ~16832 | profile relationships / own-profile edits (FO-TEST-12) | **อ้าง FO-TEST-12** | เป็น lock ที่เขียนเพื่อให้เคสเล่ม 12 ผ่าน |
| ~21978 | fresh open = landing, ล้าง state | ไม่มี | ซ้ำกับ ~14625 |

- commit `fc94ce6` ("align fo-flow with locked specs") แก้เฉพาะ prototype ไม่มีการแก้ `FrontOffice/` และไม่มี decision record ใน repo
- **ข้อสรุป:** ไม่พบ lock ที่อนุมัติจริง ควรถือว่าเป็นการตัดสินใจของทีม prototype ที่ยังไม่ผ่านการอนุมัติ และ lock ที่อ้าง FO-TEST-12 เกิดจากเคสทดสอบ

**ข้อเสนอแนะตามมาตรฐาน IG (รอผู้ใช้อนุมัติ):**
- SRCH-016 recents เก็บบนเครื่องข้ามการเปิดแอป → **ยอมรับ prototype** เพิ่มข้อ: ล้างเมื่อ sign out / เปลี่ยน session และมีปุ่มลบรายการ (ตาม 00_GLOBAL §7)
- SRCH-030 เปิด search ใหม่กลับ landing และไม่คงคำค้าง → **ยอมรับ prototype** (ใกล้พฤติกรรมทั่วไป) และบันทึกเป็นกติกาใน spec 03
- SRCH-032 tag mode กรองโพสต์ ni/muted/blocked → **ยอมรับ prototype** (IG ซ่อนเนื้อหาของคนที่บล็อกและ mute ทุกที่) และแก้ spec 03 deviation ให้ตรง
- ทั้งสามข้อจะเป็น DEC ใหม่เมื่อคุณอนุมัติ แล้วค่อยแก้ spec 03 และตรวจเคส SRCH-016/030/032 ให้ตรง

### 15.4 ข้อที่ตรวจ prototype แล้ว
- **FEED-041 / SHT-051 (แชร์ให้เพื่อนแล้วเข้าแชท):** prototype ทำจริง — `chSharePost` แล้วเปิด chatroom ของเพื่อน spec 11 ระบุแค่ toast → เคสตรงกับ prototype แต่ขัด spec → **DEC-20 รอยืนยัน**
- **DET-009 (tag SOLD):** prototype ใช้ `statusTagHTML` ตาม pfKind: sale→FOR SALE, show→SHOWCASE, sold→SOLD, hide→HIDDEN, โพสต์ธรรมดาไม่มี tag → เคส DET-009 และ PV-053 ตรงกับ prototype แต่ spec 05 ระบุตาม price → **DEC-21 รอยืนยัน**
- **CRE-013 (EN copy):** prototype EN ใช้ `Discard` / `Cancel` ตรงกับเคส; TH ใช้ `เริ่มใหม่ใช่ไหม` / `เริ่มใหม่` (ตรง spec 02) → เคสไม่ได้ระบุ TH copy → **แก้เคสให้มี TH copy** (ยังไม่ได้แก้ในรอบนี้)
- **SHT-016 (img/gif icon)**: spec 11 ระบุว่า icon มีแต่ dead → รอการตัดสินเมื่อ composer อยู่ใน V1 (DEC-17) ต้องยืนยันว่า icon ทำงานหรือซ่อน

## 16. ผลการตัดสินและแก้ batch A (2026-10-30)

แก้ expected ในเคส (MD และ CSV): AUTH-003, 004, 005, 008, 029, 034, 035, 039, 042, 046, 047, 053, 071, 072, 077, 079, 090, 096 · SHELL-010, 032, 038 · FEED-004, 012 · CRE-009, 069 (ยกเลิก) · PV-003, 011 · DET-037 · SHT-016, 118

แก้ spec (เพิ่ม Batch A Amendments ที่ท้ายไฟล์): 01, 00_NAV, 00_GLOBAL, 02, 03, 05, 06, 07, 11 ครอบคลุม:
- AUTH-020, 030 (copy track prompt / OTP subtitle), AUTH-005 (default language)
- SHELL-010–018, 019, 054, 056, 062, 064, 057–060 (coach marks copy)
- FEED-074, CRE-012, 041, 067 (dirty draft), PV-035, 039, 047, DET-032, 034
- SRCH-004, 020, 028, 059
- SHT-009, 024, 038, 052, 064, 073–075, 094, 098, 120

เคสที่ตรงแล้วจาก DEC ก่อนหน้า (ไม่ต้องแก้เพิ่ม): SHELL-027, 028, 042–048, 065; FEED-014, 041, 074; SRCH-016, 030, 032, 054, 060; CRE-070; PV-027, 053; DET-009; SHT-019, 035, 051, 082, 109, 110, 119; CRE-013 (TH copy ตรง spec 02)

หมายเหตุ: CRE-013 และ SHELL-011–018 อ้างเคสต้นทางในแถวเดียวกัน ไม่แก้แยก
