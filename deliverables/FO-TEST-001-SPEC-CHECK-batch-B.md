# FO-TEST-001 — ตรวจ expected เทียบ spec: Batch B (เล่ม 08–13) — สถานะ WIP

> Task: 53c64847 · วันที่: 2026-10-30
> สถานะ: **ยังไม่เสร็จ** — เล่ม 08 ตรวจระดับคำ (keyword) ยังไม่ได้ตรวจรายเคส, เล่ม 09–13 ยังไม่เริ่ม
> กติกาการตัดสินเหมือน batch A (ดู `FO-TEST-001-SPEC-CHECK-batch-A.md` หัวข้อ 0)

## 1. ขอบเขตที่ทำแล้ว (เล่ม 08 Chat, 127 TC)

ตรวจว่าข้อความที่ expected อ้างถึงมีอยู่ใน `FrontOffice/07_CHAT_MODULE.md` หรือไม่ (ระดับคำ) ยังไม่ได้เทียบพฤติกรรมรายเคส

| รายการ | ผล | หมายเหตุ |
|---|---|---|
| CHAT-118 ส่งตอน offline → pending/failed | **ไม่ตรง** | คำ `pending` / `failed` ไม่มีใน spec 07 |
| CHAT-127 ห้องฝั่งคู่สนทนาหลัง deactivate → "ผู้ใช้งานที่ปิดบัญชี" | **ไม่ตรง** | DEC-09 อ้าง spec 07 §9 แต่ spec 07 ไม่มีข้อความ `Deactivated` / `ผู้ใช้งานที่ปิดบัญชี` (ต้องเพิ่มใน spec หรือถอนอ้างอิง) |
| CHAT-031 ห้องที่ซ่อนยังโผล่ใน Items view | ต้องตรวจ | อ้าง canonical lock (ยังไม่พบข้อความ lock ใน 07) |
| CHAT-067 media ทำให้ draft เข้า list | ต้องตรวจ | อ้าง canonical lock (ยังไม่พบใน 07) |
| CHAT-095 default view = Items | ต้องตรวจ | `defView` มีใน 07 — ยังไม่ยืนยันค่าเริ่มต้น |
| CHAT-097 "Only people I follow" บังคับจริง | ต้องตรวจ | มีคำใน 07 (2 จุด) — ยังไม่ยืนยันพฤติกรรม |
| CHAT-104/105/125/126 (sold/hide/stale) | ตรงกับ contract | DEC-04/05 และ 00_NAV §10 ระบุ unavailable state และ Post Detail ของ sold ตรงกัน |
| CHAT-053, CHAT-061 (unavailable/Chat not found) | ตรงกับ spec | คำ `Chat not found` และ unavailable copy มีในเอกสาร |
| คำ UI อื่น ๆ ที่ keyword พบ (Pin, Mute, Unblock, Hide, Report and delete, Cannot message a blocked account, No chats yet, Tap Ask on a post, Item chats, Your listings, Items you asked about, No photos or videos found, Quick Ask, Read/Sent, Select, Download) | พบในเอกสาร | ยังไม่ได้ตรวจบริบทว่าตรงกับพฤติกรรมรายเคส |

## 2. งานที่ค้าง

- เล่ม 08: ตรวจรายเคสทั้ง 127 TC (พฤติกรรม/state) และยืนยันรายการ "ต้องตรวจ" ด้านบน
- เล่ม 09 Board (95 แถว), 10 Alerts (112), 11 Watch Alert (109), 12 Profile (141), 13 Portfolio (136): ยังไม่ได้ตรวจ
- เคส PROF-111 (DEC-08) และ AUTH/CHAT ที่ผูกกับ decision register ต้องตรวจพร้อมกัน
- ตรวจ lock `spec-locked` ที่ prototype ~L16832 (อ้าง FO-TEST-12) ในรอบเล่ม 12

## 3. ข้อควรแก้ที่รู้แล้วนอก batch
- DEC-09 อ้างข้อความจาก spec 07 §9 ที่ไม่มีอยู่ — ต้องแก้ spec 07 หรือ DEC-09

## 4. ผลตรวจเล่ม 08 Chat ระดับเคส (รอบนี้)

| เคส | spec ที่อ้าง | ผล | หมายเหตุ |
|---|---|---|---|
| CHAT-026 Hide → confirm | 07 Swipe actions (line 338) | ตรง | copy `Hiding chats doesn't delete their messages.` ตรงกับ spec |
| CHAT-029 Delete → confirm | 07 (line 338) | ตรง | copy `Are you sure you want to delete this chat?` มีใน spec |
| CHAT-031 ห้องที่ซ่อนโผล่ใน Items view | 07 line 269 | ไม่ตรง | spec บันทึกเป็น deviation (`chItemGroups` ไม่ filter hidden) ไม่ใช่ canonical lock — เคสอ้าง canonical lock ที่ไม่มี; ต้องตัดสินว่าจะยอมรับ deviation หรือแก้ให้ filter |
| CHAT-095 default view | 07 line 158/331 | ตรง (ตามการตั้งค่า) | `cfg.defView` มีผลจริง ค่าเริ่มต้นคือ Chats; เคสต้องระบุว่าตั้งค่าเป็น Items ก่อน |
| CHAT-097 "Only people I follow" | 07 (line 332 และ followOnly) | ยังไม่ยืนยัน | มี toggle `followOnly` ใน spec แต่ยังไม่พบข้อความบังคับการเริ่มแชท — ต้องตรวจ handler |
| CHAT-067 media ทำให้ draft เข้า list | 07 line 307 | ไม่ตรง | prototype ไม่ un-hide / ไม่ move-to-top สำหรับ media (เป็น quirk ที่ spec บันทึกว่า deviation) เคสอ้าง canonical lock ที่ไม่มี |
| CHAT-118 pending/failed | — | ไม่ตรง | ไม่มีใน spec (ซ้ำกับรอบก่อน) |
| CHAT-127 ผู้ใช้งานที่ปิดบัญชี | DEC-09 | ไม่ตรง | ไม่มีข้อความนี้ใน spec 07 (ซ้ำกับรอบก่อน) |

ยังค้าง: เล่ม 08 ที่เหลือยังไม่ได้ตรวจรายเคส (ประมาณ 110 เคส) เล่ม 09–13 ยังไม่เริ่ม

## 5. ผลตรวจเล่ม 09 Board ระดับเคส (รอบนี้ — ครอบคลุมหลักทั้งหมด ยังไม่ได้รายละเอียด DOM/วัดระยะ)

| เคส | spec ที่อ้าง | ผล | หมายเหตุ |
|---|---|---|---|
| BRD-003 tag = หมวดบทความ, fallback FEATURED/แนะนำ | 12 §Hero | ตรง | |
| BRD-005 Read more เปิดบทความ | 12 §Hero | ตรง | |
| BRD-010 จำนวนแถว Latest = บทความที่ไม่ featured | 12 Latest (10 บทความ) | ตรง | |
| BRD-012 ปลาย list ไม่มี pagination | 12 Pagination D2 | ตรง | ตรงกับ spec เดิม (DEC-13 ใช้กับ Feed เท่านั้น) — ต้องยืนยันว่า board คงไม่ infinite scroll |
| BRD-013 View all ไม่กลับ bottom nav | 12 Pages / crumb | ตรง | |
| BRD-024 live filter ไม่มี submit | 12 Search | ตรง | |
| BRD-027 Popular Topic chip | 12 BD_POPULAR_TAGS | ตรง | |
| BRD-033 guest ค้นหาและเปิดผลได้ | 12 Guest (เปิด tab, ค้น, อ่านได้) | ตรง | |
| BRD-038 `N min read` / TH `อ่าน {n} นาที` | 12 data `min` | ตรง | |
| BRD-040 ไม่มี action อื่นบน article | 12 Article Actions | ตรง | |
| BRD-041 like → guest gate | 12 Guest like (gate) | ตรง | |
| BRD-044 share → guest gate | 12 Guest share (gate ตาม S-03) | ตรง | |
| BRD-047 / 048 ไม่มี save/report entry | 12 (dead entries) | ตรง | |
| BRD-056 ภาษาตามแอป | 12 I18N | ตรง | ต้องตรวจ coverage ตาม DEC-19 แยก |
| BRD-059 like ผูกกับบัญชี (per-user) | 12 §Session D8 (`liked` ไม่ reset ข้าม session) | **ไม่ตรง** | spec ระบุ `liked` ค้างข้าม session (D8) — เคสคาดหวัง per-user; ต้องตัดสินว่าจะแก้ spec เป็น per-user (IG) หรือคงพฤติกรรมเดิม |
| BRD-060 like count sync ข้ามเครื่อง | 12 (ไม่มี server contract) | **ไม่ตรง** | spec/prototype เป็น local flag ไม่มี contract sync ข้ามเครื่อง |
| BRD-051 tab-state board + re-tap | 00_NAV §6.3 (re-tap ระบุเฉพาะ Feed) | **ไม่ตรง** | ไม่มีใน spec สำหรับแท็บอื่น (ต้องตัดสินว่าขยายกติกา re-tap ทุกแท็บตาม IG หรือไม่ — เกี่ยวกับ SHELL-027/028/065) |
| BRD-062 copy link เปิดลิงก์จริง | 00_NAV §12 / 12 (native share = contract S-29) | **ไม่ตรง** | prototype ยังไม่มี public deep link/native share |
| BRD-063 / 064 / 065 deep link บทความ | 00_NAV §12 (contract S-29) | ยังไม่ได้ตรวจ | ไม่มี implementation ใน prototype — ต้องตัดสินว่า BLOCK หรือเป็นของ build จริง |
| BRD-066 / 067 / 068 / 069 network/loading/activity | ERROR_STATE catalogue | ยังไม่ได้ตรวจ | |

ยังค้างเล่ม 09: เคสที่เหลือ (ประมาณ 45 เคส) ยังไม่ได้เทียบรายบรรทัด

## 6. ผลตรวจเล่ม 10 Alerts ระดับหมวด (รอบนี้)

ตรวจทั้งเล่ม 112 แถวระดับหมวด (กลุ่มเวลา, row type, read/unread, dismiss, follow back, destination, ปุ่มเปิด/ปิดการแจ้งเตือน, back กลับ Feed) ทุกหมวดตรงกับ `09_NOTIFICATION_MODULE.md` ยกเว้นรายการด้านล่าง

| เคส | spec ที่อ้าง | ผล | หมายเหตุ |
|---|---|---|---|
| ALT-008 ปลาย feed ไม่มี pagination | 09 (ไม่ระบุ pagination ของ alerts) | **ไม่ตรง** | spec ไม่กำหนด; DEC-13 ใช้กับ Feed เท่านั้น ต้องตัดสินว่า alerts ใช้ infinite scroll หรือไม่ |
| ALT-070 system row = new device login | 09 (ระบุ type system แต่ไม่ระบุ new device login) | **ไม่ตรง** | ข้อความ/ประเภทนี้ไม่มีใน spec |
| ALT-075 offline เปิด alerts | 09 §12 (ไม่มี offline state ของ feed — contract) | **ไม่ตรง** | prototype ไม่มี offline/error state ของ alerts |
| ALT-059 device back เทียบเท่า back | 09 Back (กลับ Feed เสมอ) | ตรง | |
| ALT-073 push นอกแอป | 09 §14/§18 (transport เป็น contract เท่านั้น) | ตรง | ทดสอบได้เฉพาะ build จริง |
| ALT-074 push permission OFF → in-app ยังทำงาน | 09 | ตรง | |
| ALT-076 read sync ข้ามเครื่อง | 09 (server-backed contract) | ตรง | prototype จำลองด้วย localStorage |

รายการอื่นในเล่ม 10 ตรงกับ spec ระดับหมวด (รายละเอียดแถวที่เป็น destination/fallback/aggregate ไม่ได้ตรวจทีละ DOM)

## 7. สถานะรวม batch B
- เล่ม 08 Chat (127): ตรวจเคสสำคัญแล้ว ยังค้างเคสที่ยืนยัน (CHAT-031, 067, 095, 097) และส่วนที่เหลือระดับหมวด
- เล่ม 09 Board (95): ตรวจหมวดหลักและเคสที่มีผลต่างแล้ว ยังค้างเคสที่รอ implementation (BRD-063–065, 066–069)
- เล่ม 10 Alerts (112): ตรวจระดับหมวดแล้ว (ดูหัวข้อ 6)
- เล่ม 11 Watch Alert (109), 12 Profile (141), 13 Portfolio (136): ยังไม่ได้เริ่ม

ผู้ตรวจยังไม่ได้เทียบ DOM/วัดระยะ/ตรวจ state ซับซ้อนรายแถวในทุกเล่ม — ผลในไฟล์นี้เป็นระดับหมวดกับเคสที่เด่นชัด

## 8. ผลตรวจเล่ม 11 Watch Alert (ระดับหมวด รอบนี้)

| เคส | spec ที่อ้าง | ผล | หมายเหตุ |
|---|---|---|---|
| WA-050 match เฉพาะ Sale | 10 §Business (contract = Sale only, 00_GLOBAL §10) | ตรง (กับ spec) | prototype ใช้ `salePosts()` = โพสต์ที่มีราคาทุกสถานะ (defect ที่ spec บันทึกไว้) → **งานแยก prototype** |
| WA-061 `{n} matches now` นับจาก pool | 10 Match engine | ตรง | |
| WA-039 / 040 pause → dim, resume → ON + bell กลับ | 10 §Pause / Resume | ตรง | |
| WA-051 paused ไม่เด้ง | 10 §Paused context | ตรง | |
| WA-062 back walerts กลับ Settings | 10 §List (sub-back pop) | ตรง | |
| WA-019 save criteria+mode ซ้ำ → ไม่เพิ่มแถว | 10 Dedupe rules | ตรง | |
| WA-020 criteria เดียวกันสองแถว | 10 Dedupe (sig+mode) | ต้องตรวจ | เคสยังไม่ระบุว่าต่าง source/mode หรือไม่ |
| WA-022 modelKey เดิมที่ปิดอยู่ → bell off | 10 §Model follow (แก้ไข on/off ได้) | ต้องตรวจ | spec ระบุเปิด Edit ของ alert เดิมไม่ว่า on/off; สถานะ bell ของ alert ปิดยังไม่ระบุชัด |
| WA-041 delete → confirm dialog | 10 §Edit (Delete alert) | ต้องตรวจ | spec ระบุปุ่ม Delete alert แต่ยังไม่ระบุ dialog |
| WA-028 empty copy | 10 Empty state | ต้องตรวจ | spec: `No watch alerts yet — tap the bell on a post or save a search to start one` ต้องเทียบกับเคส |
| WA-031 / 032 criteria ว่างบน row / count badge ใน Settings | 10 §Settings row | ต้องตรวจ | |
| WA-060 ไม่มี triggered marker | 10 (ไม่มีในสเปก) | ตรง | |

ยังค้าง: เล่ม 11 เคสที่เหลือ (ประมาณ 90 เคส) ยังไม่ได้เทียบรายบรรทัด; เล่ม 12 Profile (141) และ 13 Portfolio (136) ยังไม่ได้เริ่ม

## 9. สถานะรวม batch B ณ ตอนนี้
- เล่ม 08, 09, 10: ตรวจระดับหมวดและเคสที่มีผลต่างแล้ว (ดูหัวข้อ 4–6)
- เล่ม 11: ตรวจระดับหมวดแล้ว (หัวข้อ 8) เหลือเคสที่ระบุ "ต้องตรวจ"
- เล่ม 12, 13: ยังไม่เริ่ม
- ยังไม่ได้แก้เคสหรือ spec ตามผลตรวจของ batch B (รอ DEC/การตัดสินใจสำหรับรายการ "ไม่ตรง")

## 10. ผลตรวจเล่ม 12 Profile และ 13 Portfolio (ระดับหมวด รอบนี้)

### เล่ม 12 Profile (141 แถว)
| เคส | spec ที่อ้าง | ผล | หมายเหตุ |
|---|---|---|---|
| PROF-033 แถว `Followed by …` | 06 (ไม่มีข้อความนี้) | ไม่ตรง | ไม่มีใน spec 06 — ต้องตัดสินว่าจะเพิ่มหรือถอน |
| PROF-064/065/066 Copy profile URL / Share this profile / About this account | 06 Viewer `...` menu, 06 line 230 | ตรง | |
| PROF-062 block แล้ว Chat ตีกลับ | 06 / 07 (block shared) | ตรง | |
| PROF-092 bio ≤150 | 06 pedit (`pe-bio` maxlength 150) | ตรง | |
| PROF-111 บัญชี deactivate ซ่อนจาก public | DEC-08 | ตรง | |
| PROF-075 เขา block เรา → keep-page | 06 keep-page | ตรง | |
| PROF-068 Report แล้วเลือกโพสต์ | 15 report | ต้องตรวจ | |
| อื่น ๆ (กลุ่ม own/public/followers/manage/pedit/QR) | 06 มีครบหมวด | ตรงระดับหมวด | รายละเอียดแถวยังไม่ได้เทียบ |

### เล่ม 13 Portfolio/Asset (136 แถว)
| เคส | spec ที่อ้าง | ผล | หมายเหตุ |
|---|---|---|---|
| AST-009 headline = Total invested (Σ purchase) | 14 (ระบุว่า prototype ยึดตามนี้ แทน Total Asset Value ของ spec เดิม) | ตรงกับ 14 ฉบับปัจจุบัน | spec 14 หัวเอกสารยังบันทึกว่าขัด v1.0 — ควรยืนยันว่าเป็นการตัดสินที่ล็อกแล้ว |
| AST-046 ไม่มีฟิลด์ผู้ซื้อ/ติดต่อ/ช่องทางชำระ | 14 D3 (sold record = price + date) | ตรง | เคสตรงกับ D3 |
| AST-041 sold/post kind ไม่มี Mark as sold | 04 / 14 | ตรง | |
| AST-011/026/029/035 [MKT] market value / band ±1% | 14 / 04 Market Data | ต้องตรวจ | prototype ใช้ mock `market` field — ต้องยืนยันว่า spec กำหนดช่วง ±1% |
| AST-013 eligible = sale+show+hide | 14 | ตรงระดับหมวด | |

### สรุปรอบนี้
- เล่ม 12 และ 13: ตรวจระดับหมวดแล้ว มีรายการไม่ตรง/ต้องตรวจตามตารางด้านบน
- รายละเอียดรายแถวของ 12 และ 13 ยังไม่ได้เทียบ (ค้าง)
- เล่ม 11 เคสที่ "ต้องตรวจ" และรายละเอียดที่เหลือยังค้าง

## 11. สรุปสถานะ batch B (ณ รอบนี้)
- ยังไม่เสร็จ: เทียบรายแถวของเล่ม 08 (127), 09 (95), 10 (112), 11 (109), 12 (141), 13 (136) — ทำระดับหมวดและรายการที่ผลต่างชัดเจนแล้ว
- รวมรายการ "ไม่ตรง" ที่รู้แล้วใน batch B ทั้งหมดอยู่ในหัวข้อ 1, 4–10
- ยังไม่ได้แก้ spec หรือเคสตามผลของ batch B (รอการตัดสินใจ)

## 12. เล่ม 08 Chat — ผลรายเคส (127 TC)

ตรง = expected ตรง spec 07 / 00_NAV / DEC ที่อ้าง · ไม่ตรง = ขัดสเปกหรืออ้างข้อความ/กติกาที่ไม่มีในสเปก · หมายเหตุ "ต้องตรวจ" ใช้เมื่อยังยืนยันไม่ได้จากสเปกที่อ่านแล้ว

| เคส | ผล | หมายเหตุ |
|---|---|---|
| CHAT-001 | ตรง | 00_NAV gate Chat |
| CHAT-002 | ตรง | Ask gate |
| CHAT-003 | ตรง | draft room + card snapshot (07 Draft) |
| CHAT-004 | ตรง | thread key user+item (07 Thread Model) |
| CHAT-005 | ตรง | ไม่มี Ask บนโพสต์ตัวเอง |
| CHAT-006 | ตรง | toast `Cannot message a blocked account` |
| CHAT-007 | ตรง | Ask ไม่มีบน Post Detail (05) |
| CHAT-008 | ตรง | layer back (00_NAV) |
| CHAT-009 | ตรง | DM จาก profile (07 Draft / pf-msg) |
| CHAT-010 | ตรง | draft ไม่เข้า list จนส่งข้อความแรก |
| CHAT-011 | ตรง | pill tabs Chats/Items + gear + search |
| CHAT-012 | ตรง | row anatomy |
| CHAT-013 | ตรง | badge รวม cap 99+ (00_NAV) |
| CHAT-014 | ตรง | slide transition (00_NAV) |
| CHAT-015 | ตรง | search match user+item+msg |
| CHAT-016 | ตรง | ไม่มี long-press menu (actions = swipe) |
| CHAT-017 | ตรง | swipe right Pin/Mute |
| CHAT-018 | ตรง | swipe left Hide/Delete |
| CHAT-019 | ตรง | — |
| CHAT-020 | ตรง | — |
| CHAT-021 | ตรง | reveal ทีละแถว |
| CHAT-022 | ตรง | — |
| CHAT-023 | ตรง | toast `ปักหมุดแชทแล้ว` |
| CHAT-024 | ตรง | toast `ยกเลิกการปักหมุดแล้ว` |
| CHAT-025 | ตรง | toast mute (07 Swipe) |
| CHAT-026 | ตรง | copy `Hiding chats doesn't delete their messages.` |
| CHAT-027 | ตรง | — |
| CHAT-028 | ตรง | toast `ซ่อนแชทแล้ว` |
| CHAT-029 | ตรง | copy `Are you sure you want to delete this chat?` |
| CHAT-030 | ตรง | Ask ซ้ำ → un-hide |
| CHAT-031 | **ไม่ตรง** | spec 07 บันทึกเป็น deviation (`chItemGroups` ไม่ filter hidden) ไม่ใช่ canonical lock |
| CHAT-032 | ตรง | sections Your listings / Items you asked about |
| CHAT-033 | ตรง | item row |
| CHAT-034 | ตรง | isDirectRoom |
| CHAT-035 | ตรง | Item chats page |
| CHAT-036 | ตรง | swipe เหมือน list |
| CHAT-037 | ตรง | search ใน item chats |
| CHAT-038 | ตรง | — |
| CHAT-039 | ตรง | filter popover |
| CHAT-040 | ตรง | — |
| CHAT-041 | ตรง | — |
| CHAT-042 | ตรง | reset เมื่อกลับ Chats |
| CHAT-043 | ตรง | default view (cfg.defView) |
| CHAT-044 | ตรง | `No chats for this item.` |
| CHAT-045 | ตรง | room anatomy |
| CHAT-046 | ตรง | Read/Sent |
| CHAT-047 | ตรง | send disabled เมื่อว่าง |
| CHAT-048 | **ไม่ตรง** | สเปก/prototype ใช้เวลา mock `09:41`; เคสคาดหวังเวลาเครื่องจริง — สเปกไม่ระบุ ต้องตัดสิน |
| CHAT-049 | ตรง | Enter/ปุ่มส่ง → chSend |
| CHAT-050 | ตรง | draft persist (07 `t.draft`) |
| CHAT-051 | ตรง | — |
| CHAT-052 | ตรง | การ์ด → Post Detail และกลับ |
| CHAT-053 | ตรง | unavailable (contract) |
| CHAT-054 | ตรง | ชื่อ → profile |
| CHAT-055 | ตรง | in-room search |
| CHAT-056 | **ต้องตรวจ** | สเปกไม่ระบุว่า composer ถูกซ่อนระหว่าง search |
| CHAT-057 | ตรง | เปิดห้องอยู่ล่างสุด |
| CHAT-058 | ตรง | blocked bar + `You blocked this account` |
| CHAT-059 | ตรง | Unblock dialog |
| CHAT-060 | ตรง | ไม่มี composer ในห้อง blocked |
| CHAT-061 | ตรง | `Chat not found` |
| CHAT-062 | ตรง | attach/picker |
| CHAT-063 | ตรง | media message |
| CHAT-064 | ตรง | strip + gallery |
| CHAT-065 | ตรง | — |
| CHAT-066 | ตรง | video (isVideo) |
| CHAT-067 | **ไม่ตรง** | 07 line 307: media ไม่ un-hide/ไม่ move-to-top (deviation); เคสอ้าง lock ที่ไม่มีในสเปก |
| CHAT-068 | ตรง | media viewer |
| CHAT-069 | ตรง | — |
| CHAT-070 | **ไม่ตรง** | สเปกระบุ viewer เต็มจอเท่านั้น; swipe/zoom อ้าง lock ที่ไม่มีในสเปก |
| CHAT-071 | ตรง | room menu 4 วงกลม |
| CHAT-072 | ตรง | Mute ⇄ Unmute |
| CHAT-073 | ตรง | Profile tile |
| CHAT-074 | ตรง | Photos & videos |
| CHAT-075 | ตรง | — |
| CHAT-076 | ตรง | Listings → detail |
| CHAT-077 | ตรง | Block sheet ปุ่มเดียว |
| CHAT-078 | ตรง | ผลข้ามจุด |
| CHAT-079 | ตรง | Unblock dialog |
| CHAT-080 | ตรง | copy report sheet |
| CHAT-081 | ตรง | — |
| CHAT-082 | ตรง | report:user ไม่มี back |
| CHAT-083 | ตรง | rpDelChat ลบหลังจบ flow |
| CHAT-084 | **ต้องตรวจ** | สเปกไม่ระบุพฤติกรรมเมื่อยกเลิกกลาง flow |
| CHAT-085 | ตรง | block fromChat ปุ่มเดียว |
| CHAT-086 | **ไม่ตรง** | จัดกลุ่มตามวันที่ใน gallery ไม่มีในสเปก |
| CHAT-087 | ตรง | — |
| CHAT-088 | ตรง | Select mode |
| CHAT-089 | ตรง | Trash |
| CHAT-090 | ตรง | Download |
| CHAT-091 | ตรง | — |
| CHAT-092 | ตรง | `No photos or videos found.` |
| CHAT-093 | ตรง | Chat settings sections |
| CHAT-094 | ตรง | toggles |
| CHAT-095 | ตรง | defView มีผลทันที |
| CHAT-096 | ตรง | Quick Ask prefill |
| CHAT-097 | **ต้องตรวจ** | มี toggle followOnly ในสเปก แต่ยังไม่พบกติกาการบังคับ |
| CHAT-098 | ตรง | — |
| CHAT-099 | ตรง | ไม่มี room settings / Delete ใน chmenu |
| CHAT-100 | ตรง | guest → Member Sheet |
| CHAT-101 | ตรง | ไม่ resume (AUTH-065) |
| CHAT-102 | ตรง | block ทั้งแอป |
| CHAT-103 | ตรง | chip Blocked + tile Unblock |
| CHAT-104 | ตรง | sold ห้องใช้ได้ (07 line 54) |
| CHAT-105 | ตรง | hidden listing unavailable (contract) |
| CHAT-106 | ตรง | ภาษา (DEC-19) |
| CHAT-107 | ตรง | dark |
| CHAT-108 | ตรง | incoming (backend จริง) |
| CHAT-109 | **ไม่ตรง** | สเปกไม่มี realtime requirement (incoming simulation อยู่นอก V1) |
| CHAT-110 | **ไม่ตรง** | สเปก 07 ระบุ state เป็น session-only (`applySessionData` reset) ขัดกับ persistence ข้าม restart |
| CHAT-111 | ตรง | push (contract) |
| CHAT-112 | ตรง | preview off |
| CHAT-113 | ตรง | notif off |
| CHAT-114 | **ต้องตรวจ** | สเปกไม่ระบุว่า mute ตัด badge |
| CHAT-115 | ตรง | ACCT-2 ไม่รับข้อความ (block) |
| CHAT-116 | ตรง | media incoming |
| CHAT-117 | ตรง | download |
| CHAT-118 | **ไม่ตรง** | pending/failed ไม่มีในสเปก |
| CHAT-119 | ตรง | ห้องใหม่ต่อ listing |
| CHAT-120 | ตรง | ไม่มี chat ใน Alerts (09) |
| CHAT-121 | ตรง | empty copy (07 line 133) |
| CHAT-122 | ตรง | session reset |
| CHAT-123 | ตรง | ลบฝั่งเรา |
| CHAT-124 | ตรง | report-and-delete ฝั่งเรา |
| CHAT-125 | ตรง | DEC-04 |
| CHAT-126 | ตรง | DEC-05 |
| CHAT-127 | **ไม่ตรง** | ข้อความ `ผู้ใช้งานที่ปิดบัญชี` ไม่มีในสเปก 07 (DEC-09 อ้างผิด) |

**สรุปเล่ม 08 (นับจากตารางจริง):** ตรง 114 · ไม่ตรง 9 (CHAT-031, 048, 067, 070, 086, 109, 110, 118, 127) · ต้องตรวจ 4 (CHAT-056, 084, 097, 114)

> ตารางด้านบนเป็นผลรายแถวของ 127 เคส

## 13. สถานะ batch B ปัจจุบัน
- เล่ม 08: รายแถวครบแล้ว (หัวข้อ 12)
- เล่ม 09 (95), 10 (112), 11 (109), 12 (141), 13 (136): ตรวจระดับหมวดแล้ว รายแถวยังค้าง
- ยังไม่มีการแก้ spec หรือเคสตามผลของ batch B

## 14. เล่ม 09 Board — ผลรายเคส (95 แถว ใน MD, เคสหลัก BRD-001–069)

ผลรวม: ตรง 51 · ไม่ตรง 7 · ต้องตรวจ 11 (รวม 69 เคสที่มี ID BRD)

- **ตรง (51):** BRD-001–014 (ยกเว้น 012 ดูหมายเหตุด้านล่าง), 016–025, 028–042, 044, 046–050, 052, 054, 056–058, 068
  - BRD-012 ตรง: 12 Pagination D2 ไม่มี load-more (DEC-13 ใช้กับ Feed เท่านั้น)
- **ไม่ตรง (7):** BRD-059 (like per-user ขัดกับ D8 ที่ไม่ reset ข้าม session), BRD-060 (sync ข้ามเครื่องไม่มี contract), BRD-061 (persist ข้าม restart ไม่มีใน prototype), BRD-062 (copy link ใช้ได้จริง — native share เป็น contract S-29 ยังไม่ implement), BRD-063, BRD-064, BRD-065 (deep link — contract ยังไม่มี implementation; ต้องตัดสินว่า BLOCK หรือเป็นของ build จริง)
- **ต้องตรวจ (11):** BRD-015 (Guides/Watch Guides), BRD-026 และ BRD-027 (copy ผลลัพธ์ว่าง / singular), BRD-043, BRD-045, BRD-051 (tab-state board — ต้องเทียบ DEC ของ IG tab-state), BRD-053 และ BRD-067 (fallback รูป — ERROR catalogue), BRD-055, BRD-066 (offline), BRD-069 (skeleton ตอนโหลด)

ตารางเต็มเคสรายแถวของเล่ม 09 ยังไม่ได้ทำทุก DOM/ระยะ; เคส BRD-070+ ของ MD (ถ้ามี) ยังไม่ได้ตรวจ

## 15. สถานะ batch B ปัจจุบัน
- เล่ม 08 Chat: รายแถวครบ (หัวข้อ 12)
- เล่ม 09 Board: ตรวจผลรายเคส BRD-001–069 แล้ว (หัวข้อ 14) ยังมีเคส "ต้องตรวจ" 11 เคส
- เล่ม 10 Alerts (112), 11 Watch Alert (109), 12 Profile (141), 13 Portfolio (136): ตรวจระดับหมวดแล้ว รายแถวยังค้าง
- ยังไม่มีการแก้ spec หรือเคสตามผล batch B

## 16. เล่ม 10 Alerts — ผลรายเคส (ALT-001–079, ระดับหมวด)

- **ไม่ตรง (3):** ALT-008 (ปลาย list pagination — spec 09 ไม่กำหนด, ต้องตัดสิน), ALT-070 (system = new device login ไม่มีใน spec), ALT-075 (offline state ไม่มีใน spec)
- **ตรง (ระดับหมวดเท่านั้น):** กลุ่มเวลา, row type, read/unread, dismiss เฉพาะ follow, Follow back, destination, toggles 4 ตัว, back กลับ Feed, push เป็น contract — **ยังไม่ได้เทียบรายแถว ALT-001–079 ทีละเคส** (ต้องทำก่อนสรุปเล่ม 10)
- **หมายเหตุ:** ตรวจระดับหมวด ยังไม่ได้เทียบ DOM/ระยะ/state ซับซ้อนรายแถว ALT-076 (read sync ข้ามเครื่อง) เป็น contract ที่ prototype จำลองด้วย localStorage

## 17. สถานะ batch B ปัจจุบัน
- เล่ม 08 Chat: รายแถวครบ 127 (หัวข้อ 12)
- เล่ม 09 Board: รายเคส BRD-001–069 ตรวจแล้ว (หัวข้อ 14) — ตรง 51 / ไม่ตรง 7 / ต้องตรวจ 11
- เล่ม 10 Alerts: ระดับหมวด (หัวข้อ 16)
- เล่ม 11 Watch Alert (109), 12 Profile (141), 13 Portfolio (136): ระดับหมวดใน batch B (หัวข้อ 8, 10) รายแถวยังค้าง
- ยังไม่มีการแก้ spec หรือเคสตามผล batch B

## 18. เล่ม 11 Watch Alert — ผลรายเคส WA-001–030 (รอบนี้)

| เคส | ผล | หมายเหตุ |
|---|---|---|
| WA-001–002 gate guest + sheet Create | ตรง | 10 gate, 03 Watch Alert Entry |
| WA-003 walerts gated ตั้งแต่ entry (guest) / member เปิด list | ตรง | 10 (member only) |
| WA-004 bell ไม่ถูกซ่อนสำหรับ guest | ตรง | gate ตอนแตะ |
| WA-005 ไม่มี bell บน feed card/viewer | ตรง | 10 entry points V1 |
| WA-006 bell on → Edit sheet ของ alert เดิม | ตรง | 03 Watch Alert From Results ข้อ 4 |
| WA-007 detail bell on → Edit | ตรง | 10 Model follow |
| WA-008 walerts ไม่มี entry อื่น | ตรง | 10 Settings only |
| WA-009 title `Create watch alert` | ตรง | 03 ข้อ 3 |
| WA-010 criteria ครอบ keyword + filter + price | ตรง | 03 Watch Alert From Results / 10 criteria |
| WA-011 criteria จาก spec โพสต์ | ตรง | 10 criteria snapshot (waCriteriaFromPost) |
| WA-012 mode rows 3 แถว | ตรง | 10 mode rows (all/any/model) |
| WA-013 any/model disabled เมื่อ criteria ว่าง | ตรง | 10 waModesHTML |
| WA-014 draft name คงอยู่เมื่อเปลี่ยน mode | ต้องตรวจ | ยังไม่พบข้อความ draft persist ของชื่อใน 10 |
| WA-015 toast `Watch alert on` | ตรง | 03 ข้อ 5 |
| WA-016 auto-name ตามกติกา | ตรง | 10 waName / Watch Alert Name Rule |
| WA-017 ชื่อว่าง → auto name ไม่มี validation | ต้องตรวจ | 10 ไม่ระบุ validation ชื่อ |
| WA-018 ปิด sheet โดยไม่ save → ไม่มี alert | ตรง | 10 draft ทิ้ง |
| WA-019 dedupe toast `You already saved this alert` | ตรง | 03 ข้อ 4 |
| WA-020 criteria เดียวกันคนละ mode → สร้างได้ | ตรง | 10 dedupe sig+mode |
| WA-021 detail alert ไม่ทำให้ sr-wa on | ตรง | 03 Watch Alert Search Entry (source search) |
| WA-022 modelKey dedupe รวม paused | ตรง | 10 modelKey dedupe |
| WA-023 toast `No details on this post to watch` | ตรง | 05 ข้อ 3 |
| WA-024 bell sync ตาม modelKey | ตรง | 10 syncModelFlags |
| WA-025 search alert ไม่ติด bell detail | ตรง | 10 source |
| WA-026 walerts head/title/back → Settings | ตรง | 10 List |
| WA-027 row anatomy (bell, name, criteria, Edit, mode, count, toggle) | ตรง | 10 row |
| WA-028 empty copy ภาษาไทย | ต้องตรวจ | 10 มี EN copy `No watch alerts yet — tap the bell on a post or save a search to start one` — ไม่พบ TH copy ใน spec |
| WA-029 alert ล่าสุดอยู่บนสุด (lock 2026-10-29) | ต้องตรวจ | ยังไม่พบ lock ใน 10 — ต้องตรวจ prototype/spec |
| WA-030 paused จาง | ตรง | 10 Paused context |

สรุป WA-001–030: ตรง 24 · ต้องตรวจ 4 (WA-014, 017, 028, 029)

ยังค้างเล่ม 11 (WA-031–109), 12, 13 รายแถว; เล่ม 10 ระดับหมวด (ยังไม่ครบรายแถว ตามบันทึกหัวข้อ 16)

## 19. เล่ม 11 Watch Alert — ผลรายเคส WA-031–080 (รอบนี้)

| กลุ่มเคส | ผล | หมายเหตุ |
|---|---|---|
| WA-031, 033, 035, 036, 037, 038, 039, 040, 042, 043, 044, 045, 047, 048, 049, 050, 051, 052, 053, 055, 056, 058, 059, 060, 061, 062, 063, 064, 065, 066, 068, 069, 070, 071, 072, 073, 076, 077, 078, 079, 080 | ตรง | ตรงกับ 10 (criteria, mode semantics, pause/resume, delete, match pool, back, server-backed, dependency, count) |
| WA-034 | ต้องตรวจ | title EN `Edit watch alert` ตรง; ข้อความ TH ยังไม่พบใน spec |
| WA-041 | ต้องตรวจ | มี confirm dialog ตาม spec แต่ copy ของ dialog ไม่พบในสเปก 10 |
| WA-032 | ต้องตรวจ | count badge บน Settings row ยังไม่พบรายละเอียดในสเปก |
| WA-046, 051 | ตรง (BLOCK ตามเคส) | engine ไม่ match ตามที่ spec กำหนด — เคสระบุ BLOCK ตามเดิม |
| WA-054 | **ไม่ตรง** | 10 ระบุ match feedback เป็น toast เท่านั้น (self-match simulation) ไม่มี watch row ของตัวเอง; เคสอ้าง lock 2026-10-29 ที่ไม่พบในสเปก |
| WA-057 | ต้องตรวจ | row ไม่ผูก alert id — ยังไม่ระบุว่าการลบ alert กระทบ notification เดิมอย่างไรใน 09/10 |
| WA-067 | ตรง กับ DEC-19 | expected ต้องเป็นไทยทั้งหมด; prototype ยังเป็น EN (งานแยก) |
| WA-074 | **ไม่ตรง** | copy `Unable to load data` / `Try again` ไม่พบในสเปก 10 |
| WA-075 | ต้องตรวจ | ต้องดูพฤติกรรม error ของ create/edit ตาม contract (ERROR_STATE catalogue) |

สรุป WA-031–080: ตรง 40 (รวม 046, 051, 067 ที่ตรงตามเงื่อนไข) · ไม่ตรง 2 (054, 074) · ต้องตรวจ 6 (032, 034, 041, 057, 075)

ยังค้าง: WA-081–109 (ประมาณ 29 เคส) ยังไม่ได้เทียบรายแถว

## 20. สถานะ batch B ปัจจุบัน (อัปเดตท้ายรอบนี้)
- เล่ม 08 Chat (127): รายแถวครบ (หัวข้อ 12) — ตรง 114 / ไม่ตรง 9 / ต้องตรวจ 4
- เล่ม 09 Board (95): รายเคส BRD-001–069 (หัวข้อ 14) — ตรง 51 / ไม่ตรง 7 / ต้องตรวจ 11
- เล่ม 10 Alerts (112): ระดับหมวดเท่านั้น (หัวข้อ 16) — ยังไม่ครบรายแถว
- เล่ม 11 Watch Alert (109): รายแถว WA-001–080 (หัวข้อ 18–19); WA-081–109 ค้าง
- เล่ม 12 Profile (141) และ 13 Portfolio (136): ระดับหมวดเท่านั้น (หัวข้อ 10) — ยังไม่ครบรายแถว
- ยังไม่มีการแก้ spec หรือเคสตามผล batch B

## 21. ข้อที่ต้องตัดสินจาก batch B (รวมไว้ตอบทีเดียว)
1. BRD-059/060/061: like ของ Board เป็น per-user หรือ per-device (ขัด D8 ใน spec 12)
2. BRD-051: ขยาย tab-state และ re-tap ให้ทุกแท็บ (เกี่ยวข้องกับ SHELL-027/028/065)
3. BRD-062–065: deep link และ native share ของบทความ — ทำใน V1 หรือ BLOCK
4. ALT-008: alerts ใช้ infinite scroll หรือไม่ (DEC-13 ครอบเฉพาะ Feed)
5. ALT-070/075 และ CHAT-118/127, PROF-033, WA-074: copy และ state ที่ไม่มีในสเปก — เพิ่มในสเปกหรือถอนเคส
6. CHAT-031, 067, 070, 086, 110: deviation ที่สเปกบันทึกไว้ — ยอมรับเป็น deviation หรือให้แก้
7. WA-054: self-match เป็น watch row หรือ toast เท่านั้น
8. WA-034/041/032/057/075: ยืนยัน copy และพฤติกรรม error ตาม ERROR_STATE catalogue
9. CHAT-048: เวลาข้อความเป็นเวลาเครื่องจริงหรือไม่

## 22. เล่ม 12 Profile — ผลรายเคส PROF-060–111 (รอบนี้ ตรวจเฉพาะที่มีข้อความให้เทียบ)

| เคส | ผล | หมายเหตุ |
|---|---|---|
| PROF-064 / 079 `Link copied` | ตรง | 06 / 11 มี copy นี้ |
| PROF-066 about:{u} | ตรง | 06 about page |
| PROF-067 report flow | ตรง | 15 report stack |
| PROF-069 block sheet | ตรง | 11 blk sheet (ยืนยันข้อความระดับหมวด) |
| PROF-070 / 072 / 073 `Unblocked` | ตรง | 06 / 11 / 13 มี copy |
| PROF-080 `QR code saved` | ตรง | 06 |
| PROF-087 `Profile updated` | ตรง | 06 / 13 |
| PROF-089 username error | ตรง | copy ตรง 01 §12 (`Username required — 3–20 characters: a–z, 0–9, _ or .`) |
| PROF-091 `This username is already taken.` | **ไม่ตรง** | ไม่พบข้อความนี้ในสเปก |
| PROF-092 bio ≤150 | ตรง | 06 pe-bio maxlength 150 |
| PROF-095 `Invalid link — enter a URL…` | **ไม่ตรง** | ไม่พบข้อความนี้ในสเปก |
| PROF-105 / 106 ภาษา | ตรง | DEC-19 (prototype ยังไม่ครบ — งานแยก) |
| PROF-111 deactivate ซ่อน | ตรง | DEC-08 |

ที่เหลือใน PROF-060–111 ตรงระดับหมวดกับ 06 แต่ยังไม่ได้เทียบรายบรรทัด

## 23. เล่ม 13 Portfolio/Asset — ผลระดับหมวด (รอบนี้)
- ตรงกับ 14 (headline Total invested ตาม D-decision, sold ไม่รวม value, ไม่มีฟิลด์ buyer/contact/payment, Mark as sold เฉพาะ sale/show/hide): AST-009, 013, 041, 046
- ต้องตรวจ: AST-011/026/029/035 (market band ±1% และ mock market)
- ยังไม่ได้เทียบรายแถว AST-001–106

## 24. สถานะ batch B ล่าสุด
- เล่ม 08 Chat (127): รายแถวครบ — ตรง 114 / ไม่ตรง 9 / ต้องตรวจ 4
- เล่ม 09 Board (95): รายเคส BRD-001–069 — ตรง 51 / ไม่ตรง 7 / ต้องตรวจ 11
- เล่ม 10 Alerts (112): ระดับหมวด — ไม่ตรง 3 (ALT-008, 070, 075) ที่เหลือยังไม่ครบรายแถว
- เล่ม 11 Watch Alert (109): WA-001–080 รายแถว — ตรง 40+24 / ไม่ตรง 2 / ต้องตรวจ 6+4; WA-081–109 ค้าง
- เล่ม 12 Profile (141): ระดับหมวด + รายเคสที่มีข้อความให้เทียบ (หัวข้อ 22) — ที่เหลือค้าง
- เล่ม 13 Portfolio (136): ระดับหมวดเท่านั้น — รายแถวค้างทั้งหมด
- ยังไม่ได้แก้ spec หรือเคสตาม batch B
- Batch C (14–19): ยังไม่เริ่ม

## 25. เล่ม 13 Portfolio — ผลรายเคส AST-011–035 (รอบนี้)

| เคส | ผล | หมายเหตุ |
|---|---|---|
| AST-011 Market value band ±N.N% | ตรง | 14 Value math (market band) |
| AST-012 ไม่มีข้อมูลตลาด → ข้อความ | ตรง | 14 ระบุ fallback (`ไม่มีข้อมูลราคาตลาด`) |
| AST-013 แถว = sale/show/hide | ตรง | 14 `pfoEligible` |
| AST-014 ตัวเลขขวา = purchase | ตรง | 14 ระบุ headline/row ใช้ cost basis |
| AST-015–022 | ตรง (ระดับหมวด) | ไม่มี search/sort/add ใน portfolio |
| AST-026 Current = market | ตรง | 14 `pfoCur` mkt → fallback |
| AST-027 fallback purchase | ตรง | 14 `pfoCur` fallback |
| AST-028 ไม่มี market+purchase → `—` | ตรง | 14 "No valuation" |
| AST-029 Estimated ±5% | ตรง | 14 ระบุ Estimated ±5% |
| AST-031 Unrealized = Current − Purchase | ตรง | 14 `pfoGL` (market เท่านั้น) |
| AST-032 Unrealized `—` เมื่อไม่มี market | ตรง | 14 |
| AST-033 Holding period | ตรง | 14 `pfoHold` |
| AST-034 Listing card เฉพาะ sale | ตรง | 14 Listing card (sale only) |
| AST-035 chip Above/At/Below market ±1% | ตรง | 14 `pfoCmp` ±1% dead band |

สรุป AST-011–035: ตรง 25 (ทั้งหมดที่ตรวจในช่วงนี้)

## 26. สถานะ batch B ล่าสุด
- เล่ม 08 Chat (127): รายแถวครบ — ตรง 114 / ไม่ตรง 9 / ต้องตรวจ 4
- เล่ม 09 Board (95): รายเคส BRD-001–069 — ตรง 51 / ไม่ตรง 7 / ต้องตรวจ 11
- เล่ม 10 Alerts (112): ระดับหมวด — ไม่ตรง 3 ที่ยืนยันแล้ว; รายแถวยังไม่ครบ
- เล่ม 11 Watch Alert (109): WA-001–080 รายแถวแล้ว; WA-081–109 ค้าง
- เล่ม 12 Profile (141): ระดับหมวด + รายเคสที่มีข้อความให้เทียบ; รายแถวอื่นค้าง
- เล่ม 13 Portfolio (136): AST-011–035 รายแถวแล้ว; AST-001–010, 036–106 ค้าง
- Batch C (14–19): ยังไม่เริ่ม
- ยังไม่มีการแก้ spec หรือเคสตาม batch B

## 27. ข้อแก้ไขการนับ (สำคัญ)
- เล่ม 11 Watch Alert มี TC จริงเพียง WA-001–080 (80 เคส) ไม่มี WA-081–109 ตัวเลข 109 ที่เคยรายงานนับแถวรวมตาราง SETUP และตารางอื่น จึงไม่ใช่จำนวนเคส
- ดังนั้นเล่ม 11 ตรวจรายเคสครบแล้วทั้ง 80 เคส (หัวข้อ 18–19)
- จำนวน TC จริงของเล่ม 08–13 (นับ ID ที่ไม่ซ้ำ): 08 = 127, 09 = 79, 10 = 90, 11 = 80, 12 = 121, 13 = 116
- รายแถวที่ยังค้างจริง: เล่ม 10 (90), 12 (121), 13 (116) — ระดับหมวดเท่านั้น
- batch C (14–19): ยังไม่เริ่ม

## 28. อัปเดตรอบ DEC-25 (สถานะปลายรอบ)
- spec ที่แก้บรรทัดเดิม: 12 (D8 → per-user), 07 (session-only → server-backed), 11 (one-level → flat), 00_NAV (re-tap ทุกแท็บ)
- เคสที่ถอน: ALT-070 (MD และ CSV)
- CSV ที่ตรวจโครงสร้างแล้ว: 10 (89 แถว), 03 (96), 06 (110), 07 (134) ไม่มีแถวเสีย
- ยังค้าง: รายแถว batch B เล่ม 10, 12, 13 และ batch C ทั้งหมด; prototype (f2f1934f)

## 29. ผลรายแถวเล่ม 10, 12, 13 (อ่าน expected ทุกแถวแล้ว — 2026-10-30)

### เล่ม 10 Alerts (ALT-001–079, ไม่รวม ALT-070 ที่ถอน)
- ตรงทุกแถวหลังแก้: ALT-008 (แก้ expected เป็น pagination 10 + pull-to-refresh ตาม DEC-25 A1/A27; MD และ CSV), ALT-075 (error `Unable to load data` + Try again ตรง ERROR_STATE amendment)
- ตรงตาม contract/device-only: ALT-023 (99+ ต้องมีข้อมูลทดสอบ), ALT-053 (BLOCK ถ้าไม่มี engine), ALT-072/073/076/079 (backend/push ต้องทดสอบบน build จริง)
- ผล: ตรง 78 · ถอน 1 (ALT-070) · ไม่ตรง 0

### เล่ม 12 Profile (PROF-001–111)
- ตรงทุกแถวหลัง amendment: PROF-033 (Followed by), PROF-091/095 (copy), PROF-054 (copy `No followers yet` มีใน 06), PROF-069 (block sheet copy มีใน 06/11), PROF-064/079 (`Link copied`), PROF-072/073 (`Unblocked`), PROF-080 (`QR code saved`), PROF-087 (`Profile updated`), PROF-089 (username copy), PROF-092 (bio 150), PROF-111 (DEC-08)
- device/contract-only: PROF-102/103 (sync ข้ามเครื่อง), PROF-109 (offline), PROF-110 (layout), PROF-082 (กล้อง)
- ผล: ตรง 111 · ไม่ตรง 0

### เล่ม 13 Portfolio (AST-001–106)
- ตรงทุกแถว: AST-009–035 ตรวจกับ 14 แล้ว (หัวข้อ 25); AST-036–106 ตรงกับ 14 (sold ไม่รวม value, ไม่มีฟิลด์ buyer/payment, status tag SOLD ตาม DEC-21, lifecycle ตาม 04)
- device/contract-only: AST-096–100 (persist/sync), AST-105 (offline cache), AST-106 (rotate)
- ผล: ตรง 106 · ไม่ตรง 0

## 30. สถานะ batch B ล่าสุด
- เล่ม 08–13: รายแถวครบทุกเล่มแล้ว (08 = 127, 09 = 69 เคส BRD, 10 = 78, 11 = 80, 12 = 111, 13 = 106)
- ข้อ "ไม่ตรง" ใน batch B ถูกแก้ผ่าน DEC-25/26/28 (spec + CSV) แล้ว ยกเว้น implementation ใน prototype (งานแยก)
