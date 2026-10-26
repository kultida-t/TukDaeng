# FSP-031 — 15_TRUST_SAFETY Prototype-Level Sync Evidence

Date: 2026-10-22
Task: `a6ffd9b1` — "FSP-031 sync 15_TRUST_SAFETY ให้ระดับ prototype (report stack mechanics)" (mission:cc291dc9)
Scope: rewrite `FrontOffice/15_TRUST_SAFETY_MODULE.md` จาก contract-level spec ให้ระดับ prototype เทียบ module specs 00–14 — report stack mechanics, report entries ต่อ surface, `PM_REASONS`, shared `blkSheet`/`unblockDlg`/`chatReportSheet`/`muteDlg`, `Report and delete` ใน chat, guest gate, success states
Canonical: `00_NAV` §6.1/§6.6/§6.7 (report stack + routes + `sub-x`), `06_PROFILE` (shared sheets + `pfSetBlocked` + keep-page S-13 — FSP-019 lock), `07_CHAT` (`chatReportSheet`/`rpFromChat`/`rpDelChat` — FSP-020 lock), `11_SOCIAL` (comment popover/uncomf card), `12_BOARD` §13 (board contract S-04), QA-TS-001–012, master §16 Sync Decision Log (D9, S-04, S-13) + locked `Prototypes/fo-flow/index.html`
Rule: ห้ามแตะ `Prototypes/` เด็ดขาด; คง contract content เดิม (24h SLA, Apple compliance, legal consent, moderation handoff, AC-TS-* codes + semantics — QA-TS-* map อยู่)
Context: follow-up จาก FSP-030 finding F-5 — ไฟล์ถูก rename เป็น canonical terms ไปแล้ว (FSP-030 F-1/F-2/F-3); งานนี้ขยายเนื้อหาให้ลึกระดับ prototype ไม่ใช่แก้ชื่ออีก

## 1. สิ่งที่ sync เข้า spec ใหม่ (เดิมไม่มีเลย)

| # | พื้นที่ | เนื้อหาที่เพิ่ม | แหล่ง canonical |
| --- | --- | --- | --- |
| N-1 | Report stack anatomy | routes `report`/`report:user`/`report:post`/`report:pick:{u}`/`report:posts:{u}`/`report:comment`/`report:done:{u}` + layer `rp-over` + head rules (`<` vs `✕` — `report`/`report:comment`/`report:pick` ไม่มี `<`; `rpFromChat` ตัด `<` ทุกหน้า) + `sub-x` ปิดทั้งกอง | 00_NAV §6.1/§6.6/§6.7 + prototype ~17749–17809 |
| N-2 | `PM_REASONS` | ชุดเหตุผลเดียว 9 ข้อ EN+TH ทุก report type — reason row = submit ในตัว (ไม่มี Submit button/Additional details บน live stack) | prototype ~14108–14129 |
| N-3 | `report:done` mechanics | `Thanks for your feedback` + `Other steps you can take` + `rp-step` rows (Block→blkSheet / Unblock→unblockDlg / Unfollow→instant / Mute→muteDlg / Unmute→instant) + green-check completion + `Done` → `rpClose` + toast `Report submitted · thanks for letting us know` | 06/07 canonical + prototype ~17778–17798 |
| N-4 | Report entries ต่อ surface | post `...` (`pm-go-report`→`rpOpenFromPost`, pv-open→`rp-over`), uncomf card `uc-report`, profile `...` (`pf-sh-report`→`report:pick`, `pg-up`+`pmDropCovered`), comment long-press popover→`report:comment`, `blk-rep` Block-and-report→`report:pick`, chat `chmenu`→`chatReportSheet`, board=contract-only | §8 matrix — ยึด prototype handlers |
| N-5 | Shared surfaces | `blkSheetHTML` anatomy (avatar + `Block {u}?` + future-profiles desc + 3 impact rows + `Block`/`Block and report`; fromChat=`Block` เดียว; ไม่มี Cancel row—backdrop dismiss), `unblockDlgHTML`, `chatReportSheetHTML`, `muteDlgHTML` | canonical 06/07 + prototype ~16929–16966/~14950 |
| N-6 | `Report and delete` (chat) | `rpDelChat` → หลัง done-close: `t.hidden` + ออกจาก `C.threads` + strip `chmenu:`/`chatroom:` + กลับ Chat List — contract remove-from-actor-list + retention | canonical 07 + `rpClose` ~15155 |
| N-7 | Guest gate | ทุก report/block entry อยู่ใน `GUEST_GATE_SEL` → Member Sheet `Join TukDaeng` ก่อน handler (`.pm-go-report`/`.rp-opt`/`.pm-reason`/`.uc-report`/`.pf-sh-*`/`.blk-*`/`.ch-rep-*` + comment popover `obGate`) | 00_GLOBAL §11 + prototype ~20395/~23362 |
| N-8 | Block engine effects | `pfSetBlocked` = `PF_BLOCKED`+`PF_REMOVED_FOL`+unfollow+`th.blocked` ทุก thread+`p.blocked` ทุกโพสต์+feed re-render; `Blocking` transient toast / `Blocked and hidden comments` (comment context); unblock ไม่ re-follow ไม่แจ้ง | canonical 06/07/11 + prototype ~16909 |
| N-9 | Success states | ตาราง feedback ทุก action (report toast / `Blocking` / `Blocked and hidden comments` / `Unblocked` / `Muted` / `Unfollowed` / `Unmuted`) | §9 success table |
| N-10 | Deviations & quirks | 10 rows: full-page stack vs per-type forms, blkSheet vs `Block this user?` dlg, unified reasons vs per-type sets, `report:done` vs form success copy, `pfRestrictHint` dead-call, `report:posts` empty grid, memory-state routes, uncomf=post-report, comment X-only | §20 (pattern ตาม 12 §19) |

## 2. สิ่งที่คงเดิม / ปรับให้เข้ากับ stack (ไม่เปลี่ยน semantics)

- **คงเดิม**: 24h SLA, Apple compliance 5 ข้อ, legal consent + legal access, moderation handoff + audit trail, Report Impact Rule (ไม่ลบ content/ไม่เห็น reporter/ไม่สร้าง alert), Removed Content Rule, Suspended/Banned contract (S-29), report types 4 type (Board Content = contract-only S-04)
- **AC-TS-001–015 + 001A/002A/006A/006B คง codes + semantics** — QA-TS-* map ไม่แหว่ง; ปรับเฉพาะวิธีบรรยายให้ตรง stack:
  - AC-TS-001A: confirmation = `blkSheet` (แทน center dlg ที่ QA-TS-001 สั่งแทนที่อยู่แล้ว); dismiss=backdrop
  - AC-TS-006/006A/006B: form submit → reason-row submit + `report:done`; "reason required" = ไม่มี path ไป done โดยไม่เลือก + `Next` disabled จนเลือก tile (QA-TS-004 expected "no reason = cannot submit" ตรง)
  - AC-TS-002A: "Block User From Feed" → entry อิสระ (post menu ไม่มี Block row ใน prototype — block ผ่าน profile/comment/step แล้ว feed หาย) semantics เดิม "block แล้ว content หายจาก feed" คงไว้
  - AC-TS-009: mark contract + S-04 ชัดเจน
- **เพิ่ม AC ใหม่ 4 ข้อ** (additive — ไม่ทับ codes เดิม): AC-TS-016 done-steps real actions, AC-TS-017 chat report-and-delete, AC-TS-018 guest gate, AC-TS-019 unblock via shared dlg
- **QA-TS-012 ref fix**: `15 §9` → `15 §12` Removed Content Rule (section renumber จาก rewrite)

## 3. ไฟล์ที่แก้

| File | การเปลี่ยน |
| --- | --- |
| `FrontOffice/15_TRUST_SAFETY_MODULE.md` | rewrite เต็มฉบับ 569→704 บรรทัด: header canonical refs, doc info → v1.9/FSP-031, §3 prototype anchors, §6 route+reason mapping (ใหม่), §8 entry matrix (ใหม่), §9 shared surfaces (ใหม่), §10–11 flows/state (ใหม่), §12 rules, §13 guest gate (ใหม่), §15 validation, §16 exceptions, §20 deviations (ใหม่), §21 AC (เพิ่ม 016–019) |
| `FrontOffice/12_BOARD_MODULE.md` | ปิด flag D16 → RESOLVED FSP-031 + แก้ refs "ยังไม่ sync" 4 จุด (header L3, §5 boundary L99, §13 heading L264, §22 related L541) — contract §13/AC-BOARD-016 ไม่แตะ (spec-only ตาม S-04 ต่อไป) |
| `FrontOffice/QA_TEST_SCENARIO_CHECKLIST.md` | QA-TS-012 maps-to `15 §9` → `15 §12` (section renumber) |
| `deliverables/fo-spec-sync/FSP-031-trust-safety-prototype-sync-evidence.md` | ไฟล์นี้ |

ไม่ bump DOCUMENT_VERSION — sync นี้อยู่ใน scope `FO-PRD-v1.9` เดิม (FSP-028 bump ครอบทั้ง mission sweep)

## 4. Verification

```
$ git status --porcelain -- Prototypes/          → (ว่าง — 0 lines)
$ git diff --stat -- Prototypes/                 → (ว่าง — ไม่มี diff)
$ grep 'Block this user?|Report .* Form|Global Login Required|Notification Center'
    15_TRUST                                     → hits เฉพาะ spec-เดิม deviation note/negation (§1 note, §4 D2 row, §12 ห้าม-rule, §13 rename-note, §20 D2) — 0 live rule
$ grep 'AC-TS-' 15_TRUST                         → AC-TS-001..015 + 001A/002A/006A/006B ครบ + 016–019 (23 headings)
$ grep 'ยังไม่ sync' 12_BOARD                    → 0 hits (D16 resolved ทุก ref)
$ grep '15 §9' QA_TEST_SCENARIO_CHECKLIST        → 0 hits (→ §12)
```

- `Prototypes/` ไม่ถูกแตะตามข้อห้าม (status + diff ว่าง)
- mechanics ทุกข้อใน spec ใหม่เทียบ code จริงแล้ว: routes/head rules (~17749–17809), `PM_REASONS` (~14108), `blkSheet`/`chatReportSheet`/`unblockDlg`/`muteDlg` (~16929–16966/~14950), `rpOpenFromPost`/`rpPush`/`rpBack`/`rpClose` (~15110–15183), `pfSetBlocked` (~16909), handlers (~20813–21902, ~22794–22845), `GUEST_GATE_SEL` (~23362–23371)
- legacy terms ที่เหลือทุกจุดเป็น intentional (rename-trace / deviation-table / negation-rule)
- QA-TS-* map ไม่แหว่ง — AC-TS semantics คงเดิมทุก code; รหัสใหม่เพิ่มเติมเท่านั้น

## 5. Findings / Notes (ไม่ได้แก้ — บันทึกไว้)

| # | Finding | สถานะ |
| --- | --- | --- |
| N-a | `pfRestrictHint` defined แต่ไม่มี caller — banner ไม่เคยแสดงใน build จริง แต่ canonical 06/13 ระบุ banner หลัง unblock เป็น contract + QA-TS-003 expected มี banner | documented §20 D6 — เป็นเรื่องของ locked 06 flag อยู่แล้ว (07 deviation #นับ dead); ไม่แตะ 06 (locked) |
| N-b | `report:comment` route ไม่อยู่ในตาราง `report` group ของ 00_NAV §6.6 (route map ลิสต์ `report`/`report:user`/`report:post`/`report:pick`/`report:posts`/`report:done`) แต่มีใน code + QA-TS-006 + canonical 07/11 | minor — ไม่แก้ 00_NAV (out of task scope, ไม่ขัดเพราะตารางเป็น group summary); spec นี้ลิสต์ครบใน §6 |
| N-c | `report:posts:{u}` ของ user ที่ไม่มีโพสต์ render grid ว่างไม่มี empty copy | documented §17/§20 D7 |
| N-d | `data-bdact='report'` dead-path toast `Report submitted. Thank you for notifying us.` ต่างจากทั้ง live toast และ contract copy | documented §16 dead-path — unify เมื่อ entry implement (12 §13/D4) |

## 6. Summary

| Check | Result |
| --- | --- |
| Report stack mechanics | routes + head/back/X rules + `rp-over` + `rpClose` teardown ครบตาม prototype/canonical |
| `PM_REASONS` | 9 เหตุผล EN+TH ตารางครบ — ชุดเดียวทุก type |
| Report entries ต่อ surface | post/uncomf/profile/comment/chat/blk-rep/board-contract ครบ 8 rows §8 |
| Shared sheets | blkSheet (+fromChat variant), unblockDlg, chatReportSheet, muteDlg — anatomy + effects + success states |
| Guest gate | GUEST_GATE_SEL subset table + Member Sheet canonical |
| Contract content | 24h SLA / Apple / legal consent / moderation handoff / AC-TS codes คงครบ |
| AC-TS map | 001–015 semantics คง + 016–019 additive; QA-TS-* refs ไม่แหว่ง (+ QA-TS-012 §ref fix) |
| D16 flag | RESOLVED — 12_BOARD refs 4 จุดปิดแล้ว |
| Prototype | ไม่ถูกแตะ (status/diff ว่าง) |
| ไฟล์ที่แก้ | 3 ไฟล์ใน `FrontOffice/` + evidence file นี้ |
| Commit | ไม่ commit — FSP-022–031 uncommitted รอคำสั่งแยก |

**Verdict: PASS** — 15_TRUST_SAFETY sync ระดับ prototype แล้ว (report stack + entries + PM_REASONS + shared surfaces + guest gate + success states + deviations), contract content คงครบ, AC/QA map ไม่แหว่ง, flag D16 ปิด — module spec ทุกเล่มใน baseline 00–18 อยู่ระดับ prototype เท่ากันแล้ว
