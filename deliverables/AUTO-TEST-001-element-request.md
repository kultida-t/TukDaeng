# AUTO-TEST-001 — รายการ Element ขอ Dev เพิ่ม `Semantics(identifier: ...)`

> Task: 531733e8 · Mission: 7189b3fd · วันที่: 2026-11-06
> อ้างอิงคำตอบ Dev (2.1, 2.2): Flutter Key ไม่ปรากฏใน UiAutomator2; ขอ `Semantics(identifier: ...)` ซึ่งแสดงเป็น resource-id บน Android — มีผลเวอร์ชันถัดไปขึ้น store
> วิธีใช้ของ QA: อ้าง resource-id เป็น primary selector, fallback เป็น text/desc (locale-aware)
> Naming: snake_case ตาม style key เดิมที่มีอยู่ (`email_field`, `sign_in_button`, ...)

## P0 — Auth & Onboarding (มี Key อยู่แล้ว ขอ expose + เติมจุดที่ขาด)

| หน้าจอ | Element | identifier ที่ขอ | หมายเหตุ |
|---|---|---|---|
| language | แถวเลือกภาษาไทย/อังกฤษ | `language_row_th`, `language_row_en` | |
| onboarding ทุกจอ | ปุ่มต่อไป/ข้าม | `continue_button`, `skip_button` | ใช้ซ้ำทุกจอ |
| consent | Accept/Reject/Settings | `accept_all_button`, `reject_all_button`, `privacy_settings_button` | |
| privacy prefs | สวิตช์ + save | `analytics_switch`, `personalization_switch`, `save_preferences_button` | toggle ต้องมี node เฉพาะ |
| notif/track ask | ปุ่ม | `continue_button`, `skip_button` | เดิม |
| member sheet | sheet + ปุ่ม + checkbox | `member_sheet`, `signup_button`, `signin_button`, `skip_for_now`, `dont_show_checkbox`, `google_button` | gate sheet ใช้ชุดเดียวกัน `gate_sheet` |
| sign up | ฟิลด์ + ปุ่ม + meter | `email_field`, `password_field`, `eye_toggle`, `create_account_button`, `password_meter` | key มีแล้ว ขอ expose เป็น identifier |
| OTP | ช่อง OTP + resend | `otp_field_1..6` หรือ `otp_input`, `resend_button`, `resend_countdown` | |
| profile setup | username + photo + ปุ่ม | `username_field`, `add_photo_button`, `continue_button`, `skip_for_now` | |
| created | ปุ่ม | `signin_button` | |
| sign in | ฟิลด์ + ปุ่ม + ลิงก์ | `email_field`, `password_field`, `eye_toggle`, `signin_button`, `forgot_password_link`, `google_signin_button` | key มีแล้ว ขอ expose |

## P0 — Feed / Bottom nav / Guest gate (regression หลัก)

| หน้าจอ | Element | identifier ที่ขอ | หมายเหตุ |
|---|---|---|---|
| bottom nav | 5 แท็บ | `nav_feed`, `nav_chat`, `nav_board`, `nav_alerts`, `nav_profile` | + badge counter `nav_badge_chat`, `nav_badge_alerts` |
| feed tabs | 3 แท็บ | `feed_tab_all`, `feed_tab_following`, `feed_tab_favorites` | |
| post card | การ์ด + actions | `post_card`, `follow_button`, `post_menu_button`, `like_button`, `comment_button`, `share_button`, `ask_button`, `save_button`, `liked_by_text`, `caption_more`, `carousel_next`, `image_counter` | ใช้ index/ตำแหน่งร่วม ต้องจับต่อการ์ดได้ |
| gate sheet | sheet + ปุ่ม | `gate_sheet`, `gate_signin_button`, `gate_signup_button`, `gate_skip_button`, `gate_scrim` | |
| header | burger/search/create | `header_menu`, `header_search`, `header_create` | |

## P1 — Search / Post Detail / Profile / Settings entry

| หน้าจอ | Element | identifier ที่ขอ | หมายเหตุ |
|---|---|---|---|
| search | ช่องค้น + suggest + tabs + filter | `search_field`, `suggest_row`, `recent_row`, `recent_clear_all`, `result_tab_foryou`, `result_tab_profiles`, `result_tab_tags`, `filter_button` | |
| sfilter | ตัวกรอง + ปุ่ม | `filter_brand_{key}`, `filter_model_{key}`, `price_min_field`, `price_max_field`, `filter_apply_button`, `filter_clear_button` | dynamic key ตาม option |
| post detail | actions + spec | `detail_back`, `detail_like_button`, `detail_comment_button`, `detail_share_button`, `detail_ask_button`, `detail_save_button`, `detail_follow_button`, `watchlist_button`, `chat_fab` | |
| profile | header + tabs | `profile_edit_button`, `profile_share_button`, `settings_button`, `profile_tab_all`, `profile_tab_sale`, `profile_tab_show`, `profile_tab_hide`, `profile_follow_button` | |
| settings | แถวเมนู | `settings_row_{key}` เช่น `settings_row_about`, `settings_row_change_password`, `settings_row_delete_account`, `settings_row_logout` | list row ตาม key |

## P2 — Chat / Board / Alerts / Watch Alert / Library / Composer (รอบสอง)

| หน้าจอ | Element | identifier ที่ขอ | หมายเหตุ |
|---|---|---|---|
| chat list | thread + badge | `chat_thread_{id}`, `chat_search_field` | |
| chat room | composer + ปุ่ม | `chat_message_field`, `chat_send_button`, `chat_attach_button`, `chat_menu_button` | |
| board | การ์ด + search | `board_article_card`, `board_search_field`, `board_like_button`, `board_comment_button` | |
| alerts | row + filter | `alert_row`, `alert_filter_button` | |
| watch alert | สร้าง/row/แก้/ลบ | `wa_create_button`, `wa_row`, `wa_edit_button`, `wa_delete_button` | |
| library | tabs + row | `library_tab_{key}`, `saved_row` | |
| composer | เปิด + ฟิลด์ + ปุ่ม | `create_post_button`, `composer_photo_add`, `composer_publish_button` | |

## หมายเหตุส่ง Dev

- ส่งเป็นชุด: **P0 ชุดแรก (auth+feed+gate)** ก่อน เพราะ regression หลักอยู่ตรงนั้น — รอบต่อไป P1 → P2
- label มีผลเฉพาะเวอร์ชันที่ขึ้น store/ส่ง build ใหม่ — ระหว่างนี้ QA ใช้ desc/text เป็น fallback อยู่แล้ว
- ถ้า identifier ตั้งชื่อตามตารางไม่สะดวก ใช้ชื่อเดิมของ Dev ได้เลย ขอแค่ map ชื่อกลับมาให้ QA ใช้อ้าง
