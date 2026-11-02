# FO-PROTO f2f1934f — ปรับ Prototypes/fo-flow ให้ตรง spec/decision

> Task: f2f1934f · วันที่: 2026-11-02 · ไฟล์หลัก: `Prototypes/fo-flow/index.html`
> Scope: DEC-13..17 + DEC-25 ข้อ A ที่เกี่ยวกับ prototype (A4/A7–A10/A22/A23) + DEC-19 (LANG-045) + DEC-22
> หลักฐาน: `Prototypes/_verify_dec1317.mjs` (12/12 PASS) · `Prototypes/_audit_lang045.mjs` (LANG-045 sweep)

## สรุปการแก้

| Decision | ที่แก้ | วิธี |
|---|---|---|
| DEC-13 feed pagination | `feedPosts` + `feedContentHTML` + `feedPageMore` + scroll hook | หน้าละ 10 โพสต์; scroll listener เดิมบน `.feed-scroll` append หน้าถัดไปเมื่อการ์ดลำดับ `shown-3` เข้า viewport; ไม่มี end marker; ทุก re-render (refresh/tab switch/mute/follow) รีเซ็ตหน้า 1 ตาม DEC-15 |
| DEC-14/16 carousel | click handler `.post-photo, .detail-hero` + CSS `.dtap-heart` | ถอด tap-halves wrap — single tap ไม่ทำอะไร; double-tap (<350ms) = ไลก์ (heart pop, guest → `obGate()`, like เดิมค้างไว้ไม่ toggle-off); swipe ทีละ 1 หยุดปลายอยู่แล้ว ครอบ feed card/viewer/detail hero ผ่าน `photoCtx` เดิม |
| DEC-17 flat replies | reply row markup + `.c-meta` handler | เพิ่มปุ่ม ตอบกลับ/Reply บน reply rows; ตอบ reply → แนบใต้ root เดิม (`data-cid` ชี้ root อยู่แล้ว) + prefill `@author ` ไม่มีการ nest |
| DEC-25 A10 | `chNow()` + 5 จุด `msgs.push` | เวลาจริง `HH:MM`/`Today` แทนค่าคงที่ `09:41` (seed history ไม่แตะ) |
| DEC-25 A9 | `openChatMediaViewer` | swipe รูปแชทเปลี่ยนเป็น pointer events (mouse drag ได้) + two-pointer pinch zoom (คง double-tap zoom เดิม) + `touch-action: pan-y` |
| DEC-22 | `setSession` | recents (`fo_srch_recents` + `scr._search.recents`) ล้างเมื่อ session เปลี่ยน (sign out/switch) — persist ข้าม restart ตามเดิม |
| DEC-19/LANG-045 | `i18nTr` + `I18N_TH` + chatSettings fallback | เพิ่ม pattern เวลาย่อ `2 hr/1 day/3 w` → `ชม./วัน/สัปดาห์` (comment times + ทุก surface) · เพิ่มแปล `Send photo`/`Send video` · title `Settings` ในหน้า chat settings not-found แปลแล้ว |
| DEC-32 | comment ที่ seed system alert | annotate `/* DEC-32 — demo seed row only */` — เก็บ row ไว้ตาม decision ห้ามลบ |
| spec-locked comments | SRCH-016/030/032 | annotate อ้าง DEC-22/DEC-24/DEC-23 แล้ว (เดิมไม่มี decision record) |

## ตรวจแล้วว่า "ทำอยู่แล้ว" (ไม่ต้องแก้)

- **A4** tab state + re-tap = root (`_tabState` ~L22200) · **A7** hidden rooms ไม่โผล่ Items view (`!t.hidden` filter) · **A8** ส่งรูป → un-hide + ขึ้นบนสุด · **A22** Followed by บนโปรไฟล์คนอื่น · **A23** username taken + invalid link copy · **A1/A26** alerts มี 12 rows ยังไม่ถึง threshold แต่กลไกเหมือนกัน (Alerts ไม่มี feed-scroll pagination — ถ้าอยากให้เพิ่ม infinite scroll ตาม A1 ต้องสั่งเพิ่ม) · **DEC-15** pull-to-refresh · **DEC-18** scroll-to-hide · **DEC-20** share→chatroom · **DEC-21** status tag pfKind

## ผล verify (Playwright, viewport 440×956)

12/12 PASS — page 1 = 10 โพสต์, scroll append จน 11, no end marker · single tap นิ่งทั้ง card/detail hero · double-tap like +19→+1 + heart pop + like-btn sync · swipe ไม่วนที่ปลาย · guest double-tap → member gate ไม่ like · reply row มี Reply + prefill `@Watch 777 ` + reply-of-reply แนบ root flat · msg stamp เวลาจริง

## LANG-045 audit (TH mode, 40+ surfaces)

EN ที่เหลือทั้งหมดจำแนกเป็น **user content/data ตาม DEC-19** (usernames, captions, comments, chat text, bio, ชื่อ collection/alert, ชื่อนาฬิกา/Brand/Model/Ref/Calibre, ราคา `THB` ตาม LANG-047 expected, เนื้อหา Board, hashtags, ชื่อ provider Google/Apple/LINE, dev-only buttons `ob-dev`) — **ไม่มี UI copy ค้างแปลใน surface ที่ sweep**

จุดที่แก้จาก audit: เวลาย่อ comment (`2 hr`/`3 hr`), `Send photo`, title `Settings` ใน chat-settings fallback

## ข้อที่ยังค้าง/ข้อควรทราบ

1. **Money format `THB`** — ล็อก **DEC-35** แล้ว (2026-11-02): V1 ใช้ `THB`+comma ทั้งสองภาษา ตาม expected LANG-024/035/047 · contract §3 ข้อ 10 ถือ superseded · ถ้าอนาคตอยากได้ `฿` ทำ display-layer ทีหลัง
2. **A1 Alerts pagination — ทำแล้ว**: 10 rows/หน้า เหลือ ~3 แถวใต้ fold โหลดต่อ (verify 10→13 PASS) · **A27 PTR — ทำแล้ว**: pull-to-refresh ขยายไป `.al-scroll` + `.ch-scroll.sub-scroll` (chat list) reload + reset หน้าแรกตาม IG
3. **Pinch zoom** — implement ผ่าน pointer events; ทดสอบจริงต้องอุปกรณ์สัมผัส (desktop ใช้ double-tap zoom)
4. Audit sweep ขยายแล้ว (~50 surfaces: sort/likes/wa/block/unfollow/delcomment dialogs, alert detail, member gate, legal) — EN ที่เหลือเป็น user content/data ตาม DEC-19 ทั้งหมด

## รอบ 3 — DEC-36 (2026-11-02)

- **เอา `N รายการประกาศ` ออกจาก suggestion + recent rows** (ผู้ใช้ตัดสิน — override spec เดิม): `suggestRows` kw rows ไม่มี sub + seller rows sub = `Following` เฉพาะที่ follow · `recentRowHTML` seller sub = `Following`-only · Profiles tab/results คง count ตาม spec
- **sync แล้ว**: `03_SEARCH_FILTER_MODULE.md` (Suggestions/Recent searches) · SRCH-007 + SRCH-008 (MD+CSV) · DEC-36 บันทึกใน decision register · verify PASS (rows แสดงชื่อล้วน ไม่มี count)
