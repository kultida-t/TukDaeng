# Univerza Tukdaeng — Screen Inventory & Capture Checklist (FINAL)
<!-- สร้างจาก FrontOffice module docs 00–18 + ERROR_STATE_UI_COPY_CATALOG (baseline FO-PRD-v1.3) -->
<!-- Final update: 2026-10-05 — capture session เสร็จสิ้น (UMN-005b) -->
<!-- เครื่องมือ: Android Emulator Medium_Phone_API_36.0 + adb screencap -->
<!-- บัญชี A: tukdaeng.user1@gmail.com (Google SSO, Kultida Tangtrakulsang / "watch time collection") -->
<!-- บัญชี B: one1.work.test@gmail.com (Email+Password, "Work") — สมัครจริงผ่าน OTP 026998 -->

## Legend

- **Perspective**: `G` = Guest · `M` = Member/Viewer · `O` = Owner · `B` = Buyer · `S` = Seller
- **Status**: `[x]` จับแล้ว (ระบุไฟล์) · `[T]` text-only ตาม decision · `[!]` จับไม่ได้ใน build นี้ → อธิบายในคู่มือ
- **Naming**: `NN-module-perspective[-state].png`

## Capture Results Summary (2026-10-05)

**จับสำเร็จ ~125 ไฟล์จริงจากแอป** — ครบทุก main flow + two-account interactions

- Guest: entry, onboarding, feed, search, asset detail, board, login walls (feed like/offer/chat/noti), offline
- Auth: signin, error, wrong-method, signup, OTP, OTP success, forgot, forgot-sent, signout, Google SSO
- Member A: feed, search+filter+sort, watch alert ทั้ง flow, board+article, chat (create/send/menu/mute/delete), notifications จริง, public profile, follow, like, comment+reply+delete, report asset/user, block confirm
- Owner A: add asset ทั้ง flow (picker/crop/validation/provenance/datepicker/confirm/uploading/success), edit, provenance, change status, sale record, delete confirm, owner menu/quickactions, profile share
- Two-account (B→A): follow, like, comment, chat, offer 1.35M (declined) + offer 1.4M (accepted), notifications ครบทุก type, offer cards ทุกสถานะ pending/declined/accepted ทั้ง buyer+seller
- Settings: ครบทุกหน้า + change-password (เฉพาะ email account B) + delete-account confirm (ยกเลิก)

**จับไม่ได้ / text-only**: Suspended/Banned, delete-account completion (user decision), Portfolio dashboard (entry point ไม่พาไปหน้าใดใน build นี้ — spec mismatch), system share sheets (ไม่เปิด share intent จริง), article share, Liked-by list (count ไม่กดได้), autocomplete dropdown (build นี้ไม่มี), sold owner detail (ไม่ทำ mark sold จริง — ไม่มีทางย้อนใน UI), block execution (ไม่มี unblock UI — จับ confirm อย่างเดียว), reset-password link target (อยู่ใน email), Paused/Invalidated offer (ต้อง moderation)

---

## 00 — App Entry / Global / Navigation

| # | Screen / State | Persp. | ไฟล์ | Status | หมายเหตุ |
|---|---|---|---|---|---|
| 00-01 | Splash / App launch | G | 00-splash.png | [x] 00-splash.png | |
| 00-02 | Onboarding carousel | G | 00-onboarding-1..3.png | [x] | slide 3 = entry screen |
| 00-03 | Entry screen (Sign in / Sign up / สำรวจนาฬิกา) | G | 00-entry.png | [x] | |
| 00-04 | Global Login Required Dialog | G | 00-login-required-feed.png | [x] | dialog เดียวกันทุก trigger |
| 00-05 | Login Required จาก trigger อื่น | G | 07-chat-login.png, 09-noti-login.png | [x] | พิสูจน์แล้วว่า dialog เหมือนกัน — ใช้ตัวแทนเดียวในคู่มือ |
| 00-06 | Bottom tab / main navigation | M | 00-bottom-nav-member.png | [x] | |
| 00-07 | Deleted / Unavailable Asset | ทุก | (text) | [!] | เห็นบน offer card ref ที่ asset หาย (07-offercard-assetunavail) — full-screen state จับไม่ได้ |
| 00-08 | Permission Denied (Hide/Sold stale link) | M | (text) | [!] | ไม่มี stale link ให้ทดสอบ |
| 00-09 | User Not Found | ทุก | (text) | [!] | จับไม่ได้ |
| 00-10 | Profile Blocked | M | (text) | [!] | ไม่มี unblock UI → ไม่ execute block จริง — อธิบายในคู่มือ |
| 00-11 | Suspended / Banned | M | (text) | [T] | user decision — ต้อง BO action |
| 00-12 | Full Screen Image Viewer | ทุก | 00-image-viewer.png | [x] | +05-gallery-viewer.png |
| 00-13 | Image viewer fail | ทุก | (text) | [!] | |
| 00-14 | Offline + cached banner `คุณกำลังออฟไลน์…` | ทุก | 00-offline-cached.png | [x] | Wi-Fi+mobile data off |
| 00-15 | Offline no cache | ทุก | (รวม 03-search-error) | [x] | ผ่าน search error |
| 00-16 | Generic error + `ลองใหม่` | ทุก | 00-error-retry.png | [x] | |
| 00-17 | Feed skeleton loading | ทุก | 00-feed-loading.png | [x] | จับตอน cold start |

## 01 — Authentication

| # | Screen / State | Persp. | ไฟล์ | Status | หมายเหตุ |
|---|---|---|---|---|---|
| 01-01 | Sign In (empty) | G | 01-signin.png | [x] | |
| 01-02 | Sign In (filled) | G | 01-signin-error.png | [x] | filled+error พร้อมกัน |
| 01-03 | Sign In error (ผิด) | G | 01-signin-error.png | [x] | |
| 01-04 | Wrong auth method (SSO email + password) | G | 01-signin-wrongmethod.png | [x] | error เหมือนกัน (generic — secure) |
| 01-05 | Sign Up form + consent | G | 01-signup.png, 01-signup-filled.png | [x] | |
| 01-06 | Sign Up validation errors | G | (text) | [!] | ไม่ได้จับ error variant — submit ผ่านทันที |
| 01-07 | Google SSO picker | G | app-09-google-signin.png | [x] | reuse |
| 01-08 | Registration success | G | 01-otp-success.png | [x] | |
| 01-09 | OTP Verification (6 หลัก) | G | 01-otp.png | [x] | B verify จริง (026998) |
| 01-10 | OTP Expired / resend | G | (text) | [!] | resend link อยู่ในภาพ 01-otp — ไม่ได้จับ expired |
| 01-11 | Verification Success | G | 01-otp-success.png | [x] | |
| 01-12 | Terms of Use | G | 13-terms.png | [x] | เดียวกับ settings |
| 01-13 | Privacy Policy | G | 13-privacy.png | [x] | |
| 01-14 | Forgot Password | G | 01-forgot.png, 01-forgot-filled.png | [x] | |
| 01-15 | Reset Link Sent (generic) | G | 01-forgot-sent.png | [x] | |
| 01-16 | Reset Password form (จาก email link) | G | (text) | [!] | link อยู่ใน email — ไม่เปิดใน emulator |
| 01-17 | Reset Link Invalid/Expired | G | (text) | [!] | |
| 01-18 | Password Updated Success | G | (text) | [!] | |
| 01-19 | Change Password (email accounts) | M | 13-change-password.png | [x] | B เห็น — A (SSO) ไม่มี entry นี้ → อธิบายความต่าง |
| 01-20 | Sign Out confirmation | M | 01-signout-confirm.png | [x] | |
| 01-21 | Suspended/Banned | M | (text) | [T] | |

## 02 — Feed

| # | Screen / State | Persp. | ไฟล์ | Status | หมายเหตุ |
|---|---|---|---|---|---|
| 02-01 | Feed All — Guest | G | 02-feed-guest.png | [x] | |
| 02-02 | Feed All — Member | M | 02-feed-member.png, 02-feed-card.png | [x] | |
| 02-03 | Feed Following | M | 02-feed-following.png (empty) + 11-following-feed.png (มีข้อมูล) | [x] | ทั้ง empty + populated |
| 02-04 | Feed Favorites | M | 02-feed-favorites.png | [x] | empty state |
| 02-05 | Guest กด tab → Login Required | G | 02-feed-tab-login.png | [x] | |
| 02-06 | Feed card close-up | ทุก | 02-feed-card.png | [x] | |
| 02-07 | More menu — viewer | M | 02-feed-menu-viewer.png | [x] | Hide/Share/Block/Report |
| 02-08 | More menu — owner | O | 02-feed-menu-owner.png | [x] | จาก asset ที่ A สร้างจริง |
| 02-09 | Hide + Undo snackbar | M | 02-feed-hide-undo.png | [x] | |
| 02-10 | End of list | ทุก | 02-feed-end.png | [x] | |
| 02-11 | Loading skeleton | ทุก | 00-feed-loading.png | [x] | |
| 02-12 | Feed error | ทุก | 00-offline-cached.png | [x] | offline banner ครอบ feed |
| 02-13 | Empty states | M | 02-feed-favorites.png | [x] | |
| 02-14 | Image failed placeholder | ทุก | 02-feed-imgfail.png | [x] | ตอน offline |
| 02-15 | Unknown seller fallback | ทุก | (text) | [T] | จับแทบไม่ได้ |

## 03 — Search & Filter

| # | Screen / State | Persp. | ไฟล์ | Status | หมายเหตุ |
|---|---|---|---|---|---|
| 03-01 | Search home | ทุก | (รวมผลลัพธ์) | [x] | search bar อยู่บน feed header |
| 03-02 | Autocomplete dropdown | ทุก | (text) | [!] | build นี้ไม่แสดง suggestions — อธิบายว่าไม่มีในเวอร์ชันนี้ |
| 03-03 | Search Result | ทุก | 03-search-result.png, 03-search-result-guest.png | [x] | ทั้ง member+guest |
| 03-04 | Empty result `ไม่พบข้อมูล` | ทุก | 03-search-empty.png | [x] | |
| 03-05 | Search error | ทุก | 03-search-error.png | [x] | ตอน offline |
| 03-06 | Filter sheet | ทุก | 03-filter.png | [x] | |
| 03-07 | Filter applied (chip+badge) | ทุก | 03-filter-applied.png | [x] | |
| 03-08 | Dependent filter (Brand→Model) | ทุก | 03-filter-dependent.png | [x] | |
| 03-09 | Sort options | ทุก | 03-sort.png | [x] | |
| 03-10 | Create Watch Alert entry | M | 03-create-watchalert.png = 10-watchalert-create.png | [x] | watch icon บนหน้า result |
| 03-11 | Guest Watch Alert → login wall | G | (รวม 00-04) | [x] | dialog เดียวกัน |

## 04 — Asset Management

| # | Screen / State | Persp. | ไฟล์ | Status | หมายเหตุ |
|---|---|---|---|---|---|
| 04-01 | Add Asset form (main) | O | 04-add-asset-form.png, 04-add-asset-form2.png | [x] | |
| 04-02 | Image picker + crop | O | 04-add-asset-picker.png, 04-add-asset-crop.png, 04-add-asset-gallery-filled.png | [x] | ใช้รูปจริง crop จาก screenshot |
| 04-03 | Status selector | O | 04-add-asset-status.png | [x] | |
| 04-04 | Provenance (Owner/Consignment) | O | 04-add-asset-provenance.png | [x] | consignment tab กดไม่ติดใน build นี้ → เห็นเฉพาะ owner variant |
| 04-05 | Add confirmation | O | 04-add-confirm.png | [x] | |
| 04-06 | Uploading | O | 04-add-uploading.png | [x] | |
| 04-07 | Success + toast | O | 04-add-success.png | [x] | asset จริง: AP Royal Oak 1.5M |
| 04-08 | Edit Asset form | O | 04-edit-asset.png | [x] | |
| 04-09 | Edit confirmation | O | (text) | [!] | ไม่ได้ save edit จริง |
| 04-10 | Change Status sheet | O | 04-change-status.png | [x] | |
| 04-11 | Consignment warning | O | (text) | [!] | ไม่มี consignment asset |
| 04-12 | Sale Record form | O | 04-sale-record.png | [x] | จับก่อน save (ยกเลิก) |
| 04-13 | Sale record confirmation | O | (text) | [!] | ไม่ได้บันทึกการขายจริง (ไม่มีทาง revert) |
| 04-14 | Delete confirmation | O | 04-delete-confirm.png | [x] | กด ยกเลิก |
| 04-15 | Sold History | O | (text) | [!] | ไม่มี sold asset — mark sold ไม่ revert ได้ใน UI |
| 04-16 | Edit Provenance | O | 04-edit-provenance.png | [x] | |
| 04-17 | Validation errors | O | 04-add-validation.png | [x] | |
| 04-18 | Sold cannot edit | O | (text) | [!] | ต้อง sold asset |
| 04-19 | Brand/Model/Year pickers | O | 04-add-brand-picker.png, 04-add-model-picker.png, 04-add-datepicker.png | [x] | bonus captures |

## 05 — Asset Detail

| # | Screen / State | Persp. | ไฟล์ | Status | หมายเหตุ |
|---|---|---|---|---|---|
| 05-01 | Guest mode | G | 05-assetdetail-guest.png | [x] | |
| 05-02 | Viewer mode | M | 05-assetdetail-viewer.png (มี like/comment/follow จริงจาก B) | [x] | +viewer-liked, viewer-show |
| 05-03 | Owner mode | O | 05-assetdetail-owner.png | [x] | ♥2 💬2 จาก B |
| 05-04 | Owner Sold mode | O | (text) | [!] | ไม่ mark sold จริง |
| 05-05 | Gallery / full viewer | ทุก | 05-gallery-viewer.png, 00-image-viewer.png | [x] | |
| 05-06 | Comments empty | ทุก | 05-comments-empty.png | [x] | |
| 05-07 | Comments มี comment จริง | M | 05-comments-sheet.png | [x] | B comment "Interested" |
| 05-08 | Comment actions | M | 05-comment-actions.png | [x] | own comment → ลบความคิดเห็น |
| 05-09 | Delete comment confirm | M | 05-comment-delete.png, 05-comment-deleted.png | [x] | +toast |
| 05-10 | Liked-by list | M | (text) | [!] | like count ไม่ใช่ปุ่มใน build นี้ |
| 05-11 | Make Offer / Contact buttons | M | 05-offer-entry.png, 05-assetdetail-viewer-show.png | [x] | ทั้ง Sale+Show variant |
| 05-12 | Share Asset sheet | ทุก | (text) | [!] | share ไม่เปิด system sheet ใน emulator |
| 05-13 | Report Asset | M | 05-report-asset.png | [x] | |
| 05-14 | Guest login walls | G | 05-guest-loginwall.png | [x] | |
| 05-15 | Deleted asset state | ทุก | (text+07-offercard-assetunavail) | [x] | เห็นบน offer card ref |

## 06 — Profile

| # | Screen / State | Persp. | ไฟล์ | Status | หมายเหตุ |
|---|---|---|---|---|---|
| 06-01 | Owner Profile | O | 06-profile-owner.png (มี followers จริง+asset value 1.2M) | [x] | |
| 06-02 | Owner tabs All/Sale/Show/Hide | O | 06-profile-owner.png | [x] | All(1)/Sale(1) — Hide/Sold empty |
| 06-03 | Public Profile | M | 06-profile-public.png | [x] | Matem Mickey |
| 06-04 | Public tabs | M | 06-public-tab-all.png | [x] | ไม่มี Hide/Sold → พิสูจน์ spec |
| 06-05 | Public menu | M | 06-public-menu.png | [x] | แชร์/บล็อก/รายงาน |
| 06-06 | Owner menu | O | 06-owner-menu.png | [x] | |
| 06-07 | Owner quick actions | O | 06-quickactions-owner.png | [x] | |
| 06-08 | Visitor quick actions | M | 06-quickactions-visitor.png | [x] | |
| 06-09 | Follow→Following | M | 06-follow.png | [x] | ทั้ง A→Matem + B→A จริง |
| 06-10 | Guest follow → login | G | (รวม 00-04) | [x] | |
| 06-11 | Edit Profile | O | 06-edit-profile.png, 13-edit-profile.png | [x] | B: email locked + note ไม่เปลี่ยนได้ |
| 06-12 | Profile Share sheet | ทุก | 06-profile-share.png | [x] | in-app sheet (LINE/IG/FB/copy) |
| 06-13 | Empty asset tab | O | 06-tab-empty.png, 06-profile-empty.png | [x] | B fresh profile |
| 06-14 | User not found/blocked | ทุก | (text) | [!] | |

## 07 — Chat

| # | Screen / State | Persp. | ไฟล์ | Status | หมายเหตุ |
|---|---|---|---|---|---|
| 07-01 | Chat List (มีแชทจริง) | M | 07-chat-list.png | [x] | 3 ห้องจริง: Watch777/Work/Matem |
| 07-02 | Chat empty | M | 07-chat-empty.png | [x] | |
| 07-03 | Chat Room | M | 07-chat-room.png | [x] | |
| 07-04 | Pre-chat/first message | M | 07-chat-first.png | [x] | |
| 07-05 | Asset Reference Card | M | 07-chat-assetref.png | [x] | |
| 07-06 | Asset ref unavailable | M | 07-offercard-assetunavail.png | [x] | offer card ref ที่ asset หายแล้ว |
| 07-07 | Offer Card Pending (Seller) | S | 07-offercard-pending.png | [x] | THB 1,400,000 + ปฏิเสธ/ยอมรับ |
| 07-08 | Offer Card states | B/S | 07-offercard-buyer-pending.png, -declined.png, -buyer-declined.png, -accepted.png, -accepted-seller.png | [x] | ครบ pending/declined/accepted ทั้งสองฝั่ง |
| 07-09 | Incoming Offers tab | S | (empty) | [x] | empty — offer ที่ถูกตอบแล้วหลุดจาก list |
| 07-10 | Incoming empty | S | 07-incoming-empty.png | [x] | |
| 07-11 | Search in chat | M | (text) | [!] | search bar เห็นแต่ไม่ได้จับผล |
| 07-12 | Room menu | M | 07-chat-menu.png | [x] | |
| 07-13 | Mute toast | M | 07-chat-mute.png | [x] | |
| 07-14 | Delete chat confirm | M | 07-chat-delete.png | [x] | ยกเลิก |
| 07-15 | ส่งรูปในแชท | M | (text) | [!] | icons เห็นใน room — ไม่ได้ส่งจริง |
| 07-16 | Send error | M | (text) | [!] | |
| 07-17 | Blocked read-only | M | (text) | [!] | ไม่ execute block |
| 07-18 | Guest chat → login | G | 07-chat-login.png | [x] | |

## 08 — Offer

| # | Screen / State | Persp. | ไฟล์ | Status | หมายเหตุ |
|---|---|---|---|---|---|
| 08-01 | Make Offer form | B | 08-make-offer.png | [x] | ทั้ง Sale+Show context |
| 08-02 | Offer validation | B | (text) | [!] | field รับ input ไม่ติดตอน keyboard |
| 08-03 | Duplicate pending | B | (text) | [!] | ไม่ได้ทดสอบ (ส่งซ้ำได้ — offer 2 ผ่าน) |
| 08-04 | Offer sent + ไปที่แชท | B | 08-offer-sent.png | [x] | จริง 2 ครั้ง |
| 08-05 | Incoming (seller) | S | 09-notifications.png (noti มีปุ่ม ปฏิเสธ/ตรวจสอบ) | [x] | seller ตอบผ่าน offer card ใน chat |
| 08-06 | Accept | S | 07-offercard-accepted-seller.png | [x] | ไม่มี confirm — accept ทันที + "ยอมรับข้อเสนอแล้ว" |
| 08-07 | Decline | S | 07-offercard-declined.png | [x] | ไม่มี confirm — decline ทันที |
| 08-08 | Owner ไม่มี Make Offer | O | 08-no-offer-owner.png | [x] | owner bar = แก้ไข/mark sold |
| 08-09 | Guest offer → login | G | (รวม 05-guest-loginwall) | [x] | |
| 08-10 | Offer บน Show asset | B | 08-offer-show.png | [x] | |

## 09 — Notification

| # | Screen / State | Persp. | ไฟล์ | Status | หมายเหตุ |
|---|---|---|---|---|---|
| 09-01 | Notification Center | M | 09-notifications.png | [x] | offer(ปุ่มinline)+accepted+comment+follow(ติดตามกลับ)+like+watchalert จริงทั้งหมด |
| 09-02 | Empty | M | 09-notifications-empty.png | [x] | |
| 09-03 | Types ตัวอย่าง | M | 09-notifications.png, 09-noti-declined.png, 09-noti-watchalert.png | [x] | like/comment/follow/offer/declined/watch-alert |
| 09-04 | Load failed | M | (text) | [!] | |
| 09-05 | Guest → login | G | 09-noti-login.png | [x] | |
| 09-06 | Tap → destination | M | 09-noti-destination.png (watchalert result) | [x] | offer noti → chat; declined noti → asset detail |
| 09-07 | In-app banner | M | 09-noti-banner.png | [x] | real-time banner ตอนอยู่ใน app |

## 10 — Watch Alert

| # | Screen / State | Persp. | ไฟล์ | Status | หมายเหตุ |
|---|---|---|---|---|---|
| 10-01 | Alert List | M | 10-watchalert-list.png | [x] | |
| 10-02 | Empty | M | (text) | [!] | สร้างก่อนจับ empty — B ไม่มี alert จับแทนได้ |
| 10-03 | Create dialog | M | 10-watchalert-create.png | [x] | |
| 10-04 | Name field | M | (รวม create) | [x] | |
| 10-05 | Edit/rename | M | 10-watchalert-edit.png | [x] | |
| 10-06 | Delete confirm | M | 10-watchalert-delete.png | [x] | ยกเลิก |
| 10-07 | Result List | M | 10-watchalert-result.png | [x] | เข้าผ่าน noti — row กดตรงๆ ไม่ได้ใน build นี้ |
| 10-08 | Result empty | M | (text) | [!] | |
| 10-09 | Guest → login | G | (รวม 00-04) | [x] | |
| 10-10 | Error states | M | (text) | [!] | |

## 11 — Social

| # | Screen / State | Persp. | ไฟล์ | Status | หมายเหตุ |
|---|---|---|---|---|---|
| 11-01 | Liked state | M | 11-like.png, 05-assetdetail-viewer-liked.png | [x] | A→Patek + B→A |
| 11-02 | Following feed populated | M | 11-following-feed.png | [x] | |
| 11-03 | Comment + reply | M | 11-comment.png, 05-comment-reply.png | [x] | owner reply nested จริง |
| 11-04 | Share | ทุก | (text) | [!] | system share ไม่ persist |
| 11-05 | Comment error | M | (text) | [!] | |

## 12 — Board

| # | Screen / State | Persp. | ไฟล์ | Status | หมายเหตุ |
|---|---|---|---|---|---|
| 12-01 | Board landing | ทุก | 12-board.png | [x] | |
| 12-02 | Sections | ทุก | 12-board-section-1.png, -2.png | [x] | |
| 12-03 | Article list by category | ทุก | 12-board-brands.png, 12-article-filter.png | [x] | submenu rows กดไม่ติด — จับผ่าน search แทน |
| 12-04 | Article detail | ทุก | 12-article-detail.png | [x] | |
| 12-05 | Article search | ทุก | 12-article-search.png | [x] | "5 ผลลัพธ์สำหรับ Rolex" |
| 12-06 | Category filter | ทุก | 12-article-filter.png, 12-board-brands.png | [x] | |
| 12-07 | Article like | M | 12-article-like.png | [x] | 12→13 |
| 12-08 | Article share | ทุก | (text) | [!] | share button ไม่เปิด sheet |
| 12-09 | Report article | M | 12-article-report.png | [x] | 6 เหตุผล + submit disabled |
| 12-10 | Article unavailable | ทุก | (text) | [!] | |
| 12-11 | End of list | ทุก | (text) | [!] | |
| 12-12 | Empty search | ทุก | 12-article-empty.png | [x] | |
| 12-13 | Board guest | G | 12-board-guest.png | [x] | board เข้าถึงได้ไม่ต้อง login |

## 13 — Settings

| # | Screen / State | Persp. | ไฟล์ | Status | หมายเหตุ |
|---|---|---|---|---|---|
| 13-01 | Settings Home | M | 13-settings.png | [x] | A(SSO): ไม่มี เปลี่ยนรหัสผ่าน / B: มี |
| 13-02 | Edit Profile | M | 13-edit-profile.png | [x] | |
| 13-03 | Account info | M | (รวม 13-02/06-11) | [x] | |
| 13-04 | About your account | M | 13-about-account.png | [x] | +13-delete-confirm.png |
| 13-05 | Language | M | 13-language.png | [x] | |
| 13-06 | Theme | M | 13-theme.png | [x] | |
| 13-07 | Notification toggles | M | 13-notification-settings.png | [x] | 5 toggles |
| 13-08 | Help | M | 13-help.png | [x] | |
| 13-09 | About | M | 13-about.png | [x] | v1.0.1 |
| 13-10 | Privacy | M | 13-privacy.png | [x] | |
| 13-11 | Terms | M | 13-terms.png | [x] | |
| 13-12 | Sign Out | M | 01-signout-confirm.png | [x] | |
| 13-13 | Delete Account confirm | M | 13-delete-confirm.png | [x] | จับก่อน confirm — กด ยกเลิก |
| 13-14 | Deletion started | M | (text) | [T] | user decision — ไม่ลบจริง |
| 13-15 | Scheduled-deletion login | M | (text) | [T] | |
| 13-16 | Change Password entry | M | 13-change-password.png | [x] | เฉพาะ email account |
| 13-17 | Guest → settings login | G | (รวม 00-04) | [x] | |

## 14 — Portfolio

| # | Screen / State | Persp. | ไฟล์ | Status | หมายเหตุ |
|---|---|---|---|---|---|
| 14-01 | Portfolio Dashboard | O | (text) | [!] | ⚠️ spec: tap Total Asset Value → ใน build นี้ stat ไม่พาไปหน้าใด + owner menu ไม่มี entry → จัดเป็น build/spec gap |
| 14-02 | Portfolio List | O | (text) | [!] | ตาม 14-01 |
| 14-03 | Sold History | O | (text) | [!] | |
| 14-04 | Portfolio empty | O | 06-profile-empty.png | [x] | stat = 0฿ บน B profile |
| 14-05 | No market price banner | O | (text) | [!] | |
| 14-06 | Permission denied | M | (text) | [T] | |
| 14-07 | Total Asset Value entry | O | 06-profile-owner.png | [x] | มูลค่า 1.2M฿ แสดงบน profile (แต่ไม่นำไป dashboard) |

## 15 — Trust & Safety

| # | Screen / State | Persp. | ไฟล์ | Status | หมายเหตุ |
|---|---|---|---|---|---|
| 15-01 | Report Asset sheet | M | 15-report-asset.png | [x] | |
| 15-02 | Report submitted | M | (text) | [!] | ไม่ submit report จริงกับ user/asset จริง |
| 15-03 | Report User | M | 15-report-user.png | [x] | 10 เหตุผล |
| 15-04 | Report Comment | M | (text) | [!] | comment ของ B บน asset A — action menu ไม่ได้จับ report ของคนอื่น |
| 15-05 | Report article | M | 12-article-report.png | [x] | |
| 15-06 | Block confirm | M | 15-block-user.png | [x] | จับ dialog + กด ยกเลิก |
| 15-07 | Block success | M | (text) | [!] | ไม่มี unblock UI → ไม่ execute — อธิบายผลในคู่มือ |
| 15-08 | Legal docs | ทุก | 13-terms/13-privacy | [x] | |

---

## Cross-cutting state checklist — FINAL

- [x] Global Login Required Dialog — 00-login-required-feed.png
- [x] Empty `ไม่พบข้อมูล` — 03-search-empty.png + หลายหน้า
- [x] Error + ลองใหม่ — 00-error-retry.png / 03-search-error.png
- [x] Offline cached banner — 00-offline-cached.png
- [~] Deleted asset full-screen — จับได้เฉพาะ offer card ref (07-offercard-assetunavail) → อธิบายเพิ่ม
- [~] Permission denied — จับไม่ได้ → อธิบาย
- [x] Image failed placeholder — 02-feed-imgfail.png
- [x] Skeleton — 00-feed-loading.png
- [x] End of list — 02-feed-end.png

## Decisions executed (จากเดิม → ผลจริง)

| Item | ผลจริง |
|---|---|
| บัญชี B OTP | ✅ verify สำเร็จ (026998) — 01-otp-success.png |
| B→A interactions | ✅ follow/like/comment/chat/offer ครบ → notifications ทุก type จับจริง |
| Offer lifecycle | ✅ pending(seller+buyer)/declined(ทั้งคู่)/accepted(ทั้งคู่+Watch777) — ไม่มี confirm dialog ทั้ง accept/decline (ทันที+toast banner) |
| Block | ⚠️ จับ confirm เท่านั้น — app ไม่มี unblock UI → เสี่ยงค้างถาวร → text only |
| Asset deleted/unavailable | ✅ partial — offer card ref "-" blank image (asset ถูกลบ) |
| Watch Alert trigger | ✅ alert match → notification → result list จับจริง |
| Portfolio | ❌ entry point ไม่ทำงานใน build นี้ → spec gap, อธิบายในคู่มือ |
