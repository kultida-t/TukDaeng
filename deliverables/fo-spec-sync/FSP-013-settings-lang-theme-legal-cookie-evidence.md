# FSP-013 — 13_SETTINGS Update Evidence (settings home + language/theme/legal/cookie prefs)

Date: 2026-10-21
Task: `151b8a07` — "FSP-013 อัปเดต 13_SETTINGS — ภาษา/theme/legal/cookie prefs"
Scope: `FrontOffice/13_SETTINGS_MODULE.md` เท่านั้น (ไฟล์เดียว) — sync ตาม `Prototypes/fo-flow/index.html` (read-only) + sign-off FSP-005 + baseline 00_GLOBAL (FSP-010) / 00_NAV (FSP-011) / 01_AUTH (FSP-012a/b)
Gap source: `gap-FSP-004-board-settings.md` (A5–A7, A9–A13, B9–B10, B14–B16, B22–B23, C1, C4, C8–C10)
Boundary: ส่วน Delete Account flow/copies/ACs (§8 flow, §9 Delete Account Rule, AC-SETTING-009/010/010A–010D, §12 exception) + Change Password page mechanics + Content preferences cluster (`prefs`/`sensitive`/`interested`/`ni`) = **FSP-014 scope** — คงข้อความ baseline เดิมไว้โดยตั้งใจ มี boundary note ที่ §5
Prototype anchors verified: settings home `settings` ~17159–17187; `about_account` ~17188–17207; `lang` ~17338–17347 + `data-lang-opt` handler ~20997–21003; `theme` ~17481–17489 + `data-theme-opt` handler ~21015–21024; `notif_settings` ~17348–17361 + `data-notif-tgl` handler ~21005–21011; `help` ~17362–17374; `privacy` ~17375–17395; `terms` ~17396–17412; `about_app` ~17413–17427; `favorites`/`muted`/`blocked` ~17428–17460; `prefs`/`sensitive` ~17461–17479; library routes `saved`/`wishlist`/`archive`/`walerts`/`interested`/`ni` ~17503–17510; logout dialog ~14726–14733 + `[data-act="logout"]`/`.dlg-logout-go` handler ~20785–20798; entry `.pf-menu` ~16856/~21494 (`.set-btn` ~20746 dead); legal i18n map ~19485–19500; i18n display-layer note ~19422–19427; persist `fo_lang`/`fo_theme` ~19405–19406/19417–19428; route names 00_NAV §6.6

## 1. Sign-off decisions applied

| Decision | Applied in 13 |
| --- | --- |
| S-05=A IG 6-section home | §9 Settings Menu Rule rewrite — 6 sections + Login/Log out; Account = `About your account` row เดียว; Edit profile ไม่มี row (entry = own profile page) |
| S-06=A notif prefs in-scope | §9 Notification Settings Rule — in-scope ทั้งสองเล่ม, sync ฝั่ง spec 09 อยู่ใน FSP-021 |
| S-28=A chg-pwd in-app | §4/§6/§9/AC-013 — entry `About your account > Security` → `change_pwd` (page mechanics FSP-014) |
| S-29 contract-only keep | §5 Contract-Only Keep block — contact fields (Username/Phone/Line/Email Display), SSO chg-pwd visibility, delete failure/support states, analytics |
| D11 `.set-btn` dead | §9 Menu Rule + AC-SETTING-014 — entry = `.pf-menu` เท่านั้น, `.set-btn` dead handler ไม่ใช่ spec feature |
| D1 member sheet | §7 Guest + §10 + AC-SETTING-011 — guest gate = Member Sheet `Join TukDaeng` ชี้ canonical 00_GLOBAL §11 |
| C1 settings home | §2/§5/§6/§9/AC-SETTING-002/014/015/016 — 6-section structure + library/what-you-see rows + about_account anatomy |
| C8 notif contradiction | §9 Notification Settings Rule — resolve เป็น in-scope; ฝั่ง spec 09 §6 out-of-scope row ส่ง FSP-021 |
| C9 ownership | Your library → spec 02/10/11; What you see → 06/11 (rows + destinations ใน 13, เนื้อหาหน้าปลายทางชี้ owning module) |
| C4 sign-out destination | §8 Log Out Flow + §9 Log Out Rule + AC-SETTING-008 — session `guest` + toast + Member Sheet (canonical 01_AUTH §8) |

## 2. What changed (section map)

| Section | Change |
| --- | --- |
| §2 Objective | rewrite — 6-section home, Edit profile ไม่อยู่บน home (S-05), chg-pwd/delete ใน About your account |
| §3 Prototype Reference | เปลี่ยนจาก PNG ref → fo-flow anchors ทุกจุด |
| §4 Master Alignment | rewrite แถว Profile Edit/Email/Language/Theme/Notif/ChgPwd/Help/Legal/Consent/Session/Account + เพิ่ม Consent row |
| §5 Scope | In Scope ใหม่ตาม 6 sections + contract-only block (S-29) + FSP-014 boundary block + out-of-scope เพิ่ม chat notif prefs |
| §6 Screen Mapping | rewrite — route names ตาม 00_NAV §6.6 + contract row Privacy & cookies |
| §7 User States | Guest → Member Sheet gate; Member list sync; SSO contract notes |
| §8 User Flow | Open Settings (pf-menu→sub page), Language/Theme flow จริง (toast/persist), Legal, +Cookie prefs flow (contract), Log Out flow ใหม่ (guest+toast+member sheet); delete flow คงเดิม (FSP-014) |
| §9 Settings Menu Rule | rewrite ทั้งก้อน — 6-section table + entry `.pf-menu` + count badges + value pills |
| §9 About Your Account Rule — NEW | hero / account info / Security / Account management + contact rows contract-only |
| §9 Profile/Contact Rule | mark contract-only |
| §9 Language Rule | rewrite — desc/options/check/instant apply/toast/persist `fo_lang`/display-layer swap |
| §9 Theme Mode Rule | rewrite — desc/options/check/instant apply ไม่มี toast/persist `fo_theme` default `dark` |
| §9 Help/About Rule | sync copies จริง — Support channels/rows/Help topics; About title `เกี่ยวกับตึกแดง` + Legal & Support section |
| §9 Legal Rule | rewrite — in-app legal pages (privacy 4 sec/terms 3 sec placeholder + production real text contract), EN source + TH i18n layer, entry points, version→re-consent ชี้ 00_GLOBAL §8 |
| §9 Privacy & Cookie Preferences Rule — NEW | contract — Essential always-on + Analytics/Personalized toggles → consent record + ATT interplay (canonical 00_GLOBAL §8); `Settings > Privacy` refs = surface นี้ |
| §9 Log Out Rule — NEW (แทน Sign Out Rule) | dialog copies จริง `Log out of @{user}?` → guest + toast + member sheet; credential persist |
| §9 Delete Account Rule | คง baseline เดิม — FSP-014 boundary |
| §9 Change Password Rule | update entry location (S-28) + page mechanics ชี้ FSP-014 + SSO contract |
| §9 Notification Settings Rule | rewrite — 2 groups/4 toggles/desc copies/auto-save + C8 resolution note |
| §10 Permission | Guest row → Member Sheet |
| §11 Validation | sync rows (lang/theme/notif/cookie/log out) + contract marks |
| §15 Analytics | +contract preamble + events ใหม่ (library/what-you-see/about/notif/cookie/log_out rename) |
| §16 ACs | rewrite 002/004/005/006/007/008/011/012/013 + เพิ่ม 014 (entry point) / 015 (library+what-you-see rows) / 016 (about account) / 017 (cookie prefs contract) |
| §17 Related Modules | +Feed/Watch Alert/Social (library destinations) |

## 3. Cross-doc ref check (ก่อนปิดงาน)

| Check | Result |
| --- | --- |
| `AC-SETTING-` refs นอกไฟล์นี้ | 0 — AC ใช้เฉพาะในเล่มนี้ เพิ่ม 014–017 ปลอดภัย ✓ |
| `offer`/`figma`/`Make Offer` ใน 13 | 0 ✓ (FSP-006/008/009 เคลียร์แล้ว) |
| `Global Login Required Dialog` ใน 13 | 0 (แทนด้วย Member Sheet ทั้งเล่ม) ✓ |
| Settings > Privacy refs | 00_GLOBAL §8:149 + 01_AUTH:376 → resolve เป็น `Privacy & cookies` surface เดียวกัน (ระบุไว้ใน §9) ✓ |
| Sign out/log out semantics | 01_AUTH §8 canonical — 13 ชี้กลับ ไม่เขียนซ้ำ semantics ✓ |
| Re-consent | ไม่เขียนซ้ำ — canonical 00_GLOBAL §8 (§9 Legal/Cookie rules ชี้กลับ) ✓ |
| `Sign out`/`Back to sign in`/`Account deletion started`/`Auth-linked`/`Menu & Profile Setting.png` นอก 13 | เหลือตามรายการ flags §5 — ทุกจุดเป็นเอกสารที่มี owner task อยู่แล้ว |

## 4. Verification

| Check | Result |
| --- | --- |
| `git status --porcelain -- Prototypes/` | EMPTY — prototype untouched ✓ |
| ไฟล์ที่แก้ | `FrontOffice/13_SETTINGS_MODULE.md` เท่านั้น (+ evidence file นี้) ✓ |
| Copies ที่เขียนลง spec | ตรง prototype verbatim: `Settings and activity`/`About your account`/`Your library`/`What you see`/`Your app and media`/`Choose your preferred language for the TukDaeng app.`/`App interface in English`/`หน้าจอแอปเป็นภาษาไทย`/`Choose how TukDaeng looks on this device.`/`Bright background for daytime browsing.`/`Dimmed background that's easier on the eyes at night.`/`Choose what notifications you receive on this device.`/`When someone likes your posts or comments`/`When someone comments on your posts`/`When someone follows your profile`/`When new listings match your criteria`/`Available daily · 09:00 - 22:00 (GMT+7)`/`LINE Official`/`@mrfoxthailand`/`(+66) 80-008-8088`/`service@mrfox.com`/`Support channels`/`Help topics`/`Privacy & Safety`/`Terms & Guidelines`/`เกี่ยวกับตึกแดง`/`The digital curator for watch collectors`/`Version 0.0.1`/`Mister Fox Co., Ltd. · Est. 2026`/`Legal & Support`/`Contact support`/`Log out of @{user}?`/`You will need to sign in again to access your account.`/`Logged out successfully` ✓ |
| Toggle names | prototype `state.notif` keys = likes/comments/follows/walerts → spec labels `Likes`/`Comments`/`New followers`/`Watch Alerts` ตรง markup ✓ |
| Analytics event rename | `sign_out_started/confirmed` → `log_out_started/confirmed` (contract — ไม่มี tracking อยู่แล้ว ไม่มี consumer) ✓ |

## 5. Flags ส่งต่อ (ไม่แก้นอก scope)

- **FSP-014** — Delete Account sections คง baseline เดิม (`Back to sign in`, `Account deletion started`, single-dialog model, login-blocked semantics, retention copy `chats, reports, transaction history`) + Change Password mechanics (fields `Re-type new password`, 6-char helper, `state.userPwd` vs `state.mockPassword` mock bug) + Content prefs cluster
- **FSP-021** — spec 09 §6 `Notification preference center` out-of-scope row ขัด C8 resolution (in-scope) — sync ฝั่ง 09
- **FSP-025** — `TukDaeng_Master_Product_Definition.md` ~L739–772: old 5-section order + `Sign out` + Auth-linked chg-pwd + delete copy `Account deletion started`/`Back to sign in`
- **FSP-026** — `DEV_IMPLEMENTATION_CHECKLIST.md` §12 (~L311–339): old section order + `Sign out?` copies + Auth-linked + `Back to sign in`; `Use_Cases.md` §10 (~L781–812): Sign Out→Sign In + delete flow; `README_MODULE_INDEX.md`:105 + `FINAL_HANDOFF_SUMMARY.md`:49 delete retention copy; `06_PROFILE_MODULE.md`:32 + `15_TRUST_SAFETY_MODULE.md`:38 `Menu & Profile Setting.png` refs (รอ module update ของตัวเอง FSP-019/+)
- **FSP-027** — `QA_TEST_SCENARIO_CHECKLIST.md` QA-SETTING-002 (old menu order ~L1224–1233), QA-SETTING-007/007A (`Sign out?`/`Cancel`/`Sign out` + Sign In destination ~L1328–1335), QA-SETTING delete cases (`Account deletion started`/`Back to sign in` ~L1321–1322 → ส่วน delete รอ FSP-014 ก่อน)
- **FSP-030** — consistency matrix: `Privacy & cookies` row = contract addition บน settings home (prototype ไม่มี row นี้); analytics events `log_out_*` rename; naming `Notifications`(section) vs `Alerts`(tab) ยัง drift อยู่ — sweep รอบนั้น
- งานทั้งหมดยัง uncommitted รวม FSP-006–013 — รอพี่สั่ง commit แยก
