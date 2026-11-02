# FSP-014 — 13_SETTINGS Update Evidence (delete account + change password + content prefs)

Date: 2026-10-21
Task: `dd73f9fc` — "FSP-014 อัปเดต 13_SETTINGS — delete account + content prefs"
Scope: `FrontOffice/13_SETTINGS_MODULE.md` เท่านั้น (ไฟล์เดียว) — sync ตาม `Prototypes/fo-flow/index.html` (read-only) + sign-off FSP-005 + baseline 00_GLOBAL (FSP-010) / 00_NAV (FSP-011) / 01_AUTH (FSP-012a/b)
Gap source: `gap-FSP-004-board-settings.md` (A7/A8/A12, B11–B14, B23, C2–C3, C10–C11, C15) + content-prefs detail จาก `gap-FSP-002a-feed-search.md` (A4/A5)
ปิด boundary: ลบ "## Boundary — FSP-014 Scope" block ออกจาก §5 — ทุกส่วนที่ค้าง sync แล้ว

Prototype anchors verified: `change_pwd` ~17208–17246 + submit/forgot ~20910–20996; `del_account` ~17247–17337 + handlers ~20799–20909; `favorites` ~17428–17443 / `muted` ~17444–17451 / `blocked` ~17452–17460 + handlers ~21034–21102/~21644–21649; `prefs` ~17461–17470 / `sensitive` ~17471–17479 / `interested` ~17509 / `ni` ~17510 + sens/snooze/reset/unlike/restore ~20705–20716/~21013–21014/~21026–21102; dialogs: reset ~14719–14725, del-password ~14734–14746, del-success ~14750–14766, forgot ~14772–14780; `fo_account` removal ~20902; `obGate` ~23007–23009

## 1. Sign-off decisions applied

| Decision | Applied in 13 |
| --- | --- |
| S-02=A login-to-restore | §9 Grace-period semantics + §12 exception + AC-SETTING-010B — sign in ภายใน 30 วัน = cancel + restore; ไม่มี `Account scheduled for deletion` blocked state; support copy คงเป็น contract เฉพาะ restore-failed / post-hard-delete |
| S-27=A 2-page delete flow | §8 flow + §9 Delete Account Rule + AC-SETTING-010/010C — terms cards → reason required → password dialog → `Account deletion scheduled` → `Log out` → guest + Member Sheet |
| S-28=A chg-pwd in-app | §9 Change Password Rule + AC-SETTING-013 — 3 fields/eye toggles/forgot link/inline errors/toast ตาม prototype |
| S-21 canonical ≥8+num/sym | §9/§11/AC-013 — spec ยึด canonical; prototype deviation จดไว้ (helper อ้าง numbers/letters/special แต่เช็กเฉพาะความยาว) |
| C11 retention unify | §9 Retention block — UI copy = user-facing erasure ตาม prototype; backend retention (reports, transaction/audit logs) = contract; ตัด `offers` ออก (removal scope) — ไม่มีทิศขัดแล้ว |
| C15 dead delete dialog | คง dead-code note เดิม (`delAccountDlgHTML`/`data-dlg="del-account"`/`.dlg-delaccount-go`) |
| Mock bug | จดใน §9 Delete Account + Change Password — `state.mockPassword` (del, ค้าง `fox1234`) vs `state.userPwd` (chg-pwd) คนละ field; spec ไม่รองรับพฤติกรรมนี้ |

## 2. What changed (section map)

| Section | Change |
| --- | --- |
| §3 Prototype Reference | +anchors change_pwd/del_account/favorites/muted/blocked/prefs/sensitive/interested/ni + 4 dialogs + handlers + `fo_account`/`obGate` |
| §4 Master Alignment | ChgPwd/Account rows ลบ "(FSP-014 boundary)" — เขียน mechanics จริง |
| §5 Scope | In Scope +Delete 2-page flow/ChgPwd page/What-you-see pages + confirmation states; Contract-only ปรับ delete failure/support-state wording; **ลบ Boundary block ทั้งก้อน** |
| §6 Screen Mapping | `favorites`/`muted`/`blocked`/`prefs`/`sensitive`/`interested`/`ni`/`change_pwd`/`del_account` rows = descriptions จริง ลบ boundary marks |
| §7 Member | +bullets what-you-see management + content prefs + delete reason+password requirement |
| §8 User Flow | +Change Password Flow (+forgot branch) +Content Preferences Flow +Favorites/Muted/Blocked Flow; Delete Account Flow rewrite = 2-page → password → scheduled → guest+member sheet; failure flow mark contract |
| §9 Delete Account Rule | **rewrite ทั้งก้อน** — Step1 terms cards (verbatim copies), Step2 6 reasons table (verbatim TH/EN) + required err, password dialog (verbatim + errors), scheduled dialog (verbatim + `{date}`=+30d), guest destination, grace semantics (S-02), retention (C11), failure (contract), dead-code + mock-bug notes; ลบ copy เก่า `Delete account?`/`Account deletion started`/`Back to sign in` ทั้งหมด |
| §9 Change Password Rule | rewrite — anatomy/fields (`Re-type new password`)/validation order 6 ขั้น + error copies verbatim/forgot dialog/canonical policy + deviation note/mock-bug |
| §9 Content Preferences Rule — NEW | `prefs` hub + sensitive (Less/Standard, apply ทันที) + interested (liked posts + Remove) + ni (Restore) + snooze toggle (All→following only 30d) + reset confirm dialog |
| §9 What You See Pages Rule — NEW | favorites (desc/search/Remove/Remove all/Suggested) + muted (Unmute) + blocked (Unblock → confirm dialog, ไม่ re-follow) + row tap → public profile |
| §11 Validation | +Change Password/Delete Account/Sensitive/Reset/Unblock rows |
| §12 Exception | `Account Scheduled For Deletion` → **Grace-Period Sign In (login-to-restore)** + support state = contract; Delete Account Failed mark contract |
| §15 Analytics | +13 events (chg-pwd ×4, forgot ×2, prefs ×6, delete +2 granular) |
| §16 ACs | rewrite 009/010/010A–010D/013 + เพิ่ม 018 (Content Preferences) / 019 (Favorites/Muted/Blocked) |

## 3. Cross-doc ref check (ก่อนปิดงาน)

| Check | Result |
| --- | --- |
| `AC-SETTING-` refs นอกไฟล์นี้ | 0 — เพิ่ม 018/019 ปลอดภัย ✓ |
| `Account deletion started`/`Back to sign in`/`Account scheduled for deletion`/`Delete account?` ใน FrontOffice/ | 01_AUTH hits = forgot-password sent state (feature คนละตัว — legit ✓); ที่เหลืออยู่ใน Master (FSP-025) / README+DEV+Use_Cases+FINAL_HANDOFF (FSP-026) / QA checklist (FSP-027) — ทุกจุดมี owner task ตาม flags FSP-013 ✓ |
| Grace-period semantics | 00_GLOBAL §12 login-to-restore (S-02) ↔ 13 §9/§12/AC-010B ตรงกัน ✓ |
| Credential persist | 01_AUTH §9 "delete เท่านั้นที่ล้าง credential" ↔ 13 §9 + AC-010A ตรงกัน ✓ |
| Route names | `del_account`/`change_pwd`/`prefs`/`sensitive`/`interested`/`ni`/`favorites`/`muted`/`blocked` ตรง 00_NAV §6.6; back step 2→1 ตรง §6.7 ✓ |

## 4. Verification

| Check | Result |
| --- | --- |
| ไฟล์ที่แก้ | `FrontOffice/13_SETTINGS_MODULE.md` เท่านั้น (+ evidence file นี้) ✓ |
| `git status --porcelain -- Prototypes/` | **ไม่ว่าง** — `M Prototypes/fo-flow/index.html` มาจาก task `716b8972` (in-progress ของพี่: ปรับ password ≥8 ทุกจุด — signup/change-pwd) ไม่ใช่การแก้ของงานนี้; spec จด deviation ปัจจุบันไว้ถูกต้อง (เช็กเฉพาะความยาว) ✓ |
| Copies ที่เขียนลง spec | ตรง prototype verbatim: `We're sorry to see you go`/`Continue to delete`/`Keep my account`/`Why are you leaving?`/6 reasons TH+EN/`Please select a reason to continue.`/`Confirm account deletion`/`To protect your account...30-day grace period.`/`Please enter your password.`/`Incorrect password. Please try again.`/`Account deletion scheduled`/`log back in before this date to cancel deletion and restore`/`Account deactivated. 30-day grace period started.`/`Re-type new password`/`Forgot your password?`/`Reset password?`/`Send reset link`/`Password changed successfully`/`Snooze suggested posts in feed`/`Reset suggested content?`/`Suggested content reset`/`No favorites yet`/`Posts unmuted`/`Unblock {user}?` ✓ |
| Language gaps | `Posts unmuted`/favorites toasts/reset dialog/`Suggested content reset` = EN-only ใน prototype — จด sweep (D15) |
| ACs ที่เขียนใหม่ | อ้าง behavior ที่มี handler จริงทุกจุด (`del-go-reasons`/`del-submit-reason`/`dlg-del-pwd-submit`/`dlg-delaccount-done`/`submit-chg-pwd`/`forgot-pwd`/`dlg-forgotpwd-go`/`data-sens`/`data-tgl`/`dlg-reset-go`/`m-unmute`/`m-unlike`/`m-restore`/`fav-add`/`fav-remove`/`fav-removeall`/`m-unblock`) |

## 5. Flags ส่งต่อ (ไม่แก้นอก scope)

- **Prototype WIP (`716b8972`)**: change_pwd helper/check ปรับ ≥6→≥8 แล้ว แต่ยัง length-only (ไม่ enforce num/sym) + signup ตัด `obScore` check เหลือ length ≥8 — canonical 00_GLOBAL §12 ยังห่าง (num/sym); note "change password ≥6" ใน 00_GLOBAL §12 อาจต้องปรับเลขหลัง task นั้นจบ (sweep FSP-030)
- **FSP-021** — spec 09 §6 out-of-scope row (carry-over FSP-013)
- **FSP-025/026/027** — old delete copies (`Account deletion started`/`Back to sign in`/`Delete account?`/`login blocked`) ใน Master/README/DEV/Use_Cases/FINAL_HANDOFF/QA — owner tasks เดิมครอบแล้ว ตอนนี้ spec 13 canonical พร้อมให้ sync ตาม
- **FSP-030** — `interested`/`ni` ถูกจัดอยู่ route group "Saved / Library" ใน 00_NAV §6.6 แต่ spec ผูกกับ Content preferences — naming/grouping nit ให้ sweep; content-prefs surfaces อาจซ้ำกับ owning modules (02/06/11) ตอน FSP-019/022 — spec 13 ระบุ canonical boundary ไว้แล้ว
- งานทั้งหมดยัง uncommitted รวม FSP-006–014 — รอพี่สั่ง commit แยก
