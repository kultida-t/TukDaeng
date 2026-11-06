# AUTO-TEST-001 — คำตอบจากทีม Dev (QA Automation Prep)

> Task: 531733e8 · Mission: 7189b3fd · ตอบวันที่: 2026-11-06
> อ้างอิงจาก source code และ CI ของ branch develop

## สรุปสำหรับเริ่มงาน

- **เทสทุกเคสบน production** ใช้แอปจาก store (`com.univerza.tukdaeng`) และ API `https://tukdaeng-api.univerza.co`
- **ข้อมูลเทสเป็นข้อมูลจริง** ผู้ใช้จริงเห็นโพสต์เทสได้ และ report เข้าคิว admin จริง ให้ใช้เฉพาะบัญชีเทส ไม่โต้ตอบกับบัญชีผู้ใช้จริง และลบข้อมูลเทสท้ายเคส (ดู 6.1)
- **แอปเป็น Flutter** element ส่วนใหญ่ยังไม่มี id ให้ Appium จับ ต้องส่งรายการ element มาให้ Dev เพิ่ม (ดู 2.1, 2.2)
- **OTP ใช้เฉพาะตอนสมัครด้วยอีเมล** ไม่มีโค้ดคงที่ ส่วนบัญชีที่ยืนยันแล้ว sign in ด้วยอีเมลและรหัสผ่านได้โดยไม่ต้องใช้ OTP (ดู 5.1)
- **ระวัง rate limit ตาม IP** sign in ได้รวม 50 ครั้งต่อ 15 นาทีต่อ IP ควรใช้ session เดิมซ้ำแทนการ login ใหม่ทุกเคส (ดู 3.3)
- **QA สมัครบัญชีเทสเอง** และยังไม่มีเครื่องมือ seed หรือ reset ข้อมูล (ดู 4.1, 4.2)

---

## 1) Stack & Source

| # | คำถาม | คำตอบ |
|---|---|---|
| 1.1 | แอปเขียนด้วยอะไร — Flutter / React Native / native / WebView hybrid? (Android กับ iOS ต่างกันไหม) | Flutter (Dart) + flutter_bloc ใช้ codebase เดียวกันทั้ง Android และ iOS ไม่ใช่ WebView hybrid เวอร์ชันล่าสุดคือ 1.0.8 |
| 1.2 | เข้าถึง source repo ของแอปได้ไหม (read-only ก็ได้) | Repo อยู่บน GitLab ของบริษัท (`git.mrfox.store`) โค้ดแอปอยู่ที่ `frontend/mobile` เข้าถึงได้ |

## 2) Testability

| # | คำถาม | คำตอบ |
|---|---|---|
| 2.1 | element สำคัญมี testID / content-desc / semantics label ให้ automation จับไหม | ส่วนใหญ่ยังไม่มี ทั้งแอปมี Semantics ไม่ถึง 10 จุด และ Flutter Key ราว 26 จุด Key ที่ตั้งใจไว้สำหรับเทสมีเฉพาะหน้า auth เช่น `email_field`, `password_field`, `sign_in_button`, `register_button`, `google_signin_button`, `apple_signin_button`, `resend_button` ข้อควรรู้: Flutter Key ไม่ปรากฏใน Appium UiAutomator2 จะเห็นเฉพาะผ่าน `integration_test` หรือ Appium Flutter Driver ตอนนี้โปรเจกต์มี widget test แต่ยังไม่มี `integration_test` |
| 2.2 | ขอเพิ่ม label บนจุดที่จำเป็นได้ไหม (เราจะส่งรายการ element ให้ภายหลัง) | ได้ ขอให้ส่งรายการแยกตามหน้าจอและเรียงลำดับความสำคัญ Dev จะใช้ `Semantics(identifier: ...)` ซึ่งแสดงเป็น resource-id บน Android label จะมีผลเมื่อเวอร์ชันถัดไปขึ้น store เท่านั้น จึงควรส่งเป็นชุด |
| 2.3 | มี debug menu / feature flag สำหรับเทสไหม (เช่น skip onboarding, ปรับ cooldown, mock state) | ไม่มีในแอป และค่า cooldown ฝังอยู่ในโค้ด ปรับจากภายนอกไม่ได้ ส่วน feature flag ที่มีอยู่เป็นฝั่ง server เช่น `SystemNotifications__Enabled` และ `Places__Enabled` เปิดปิดตอน deploy เท่านั้น สถานะ onboarding เก็บในเครื่อง ผ่านครั้งเดียวแล้วจะไม่กลับมาอีก ใช้ `noReset` เพื่อข้าม หรือ clear app data เพื่อเล่นใหม่ |

## 3) Environment & Build *(blocker)*

| # | คำถาม | คำตอบ |
|---|---|---|
| 3.1 | มี staging/test backend env แยกจาก production ไหม | มี API: `https://stg-tukdaeng-api.mrfox.store` (Swagger ที่ `/swagger`) Web: `https://stg-tukdaeng.mrfox.store` ส่วน prod คือ `https://tukdaeng-api.univerza.co` และ `https://tukdaeng.univerza.co` ถ้า staging ตอบ 502 ให้แจ้ง Dev เพื่อ redeploy เคยเกิดเป็นครั้งคราว |
| 3.2 | มี build แยกสำหรับเทสไหม (staging build / internal testing track / debug APK) — package id ต่างจาก prod ไหม | มี แต่รอบนี้เทสบนแอปจาก store ซึ่งเป็น release build จึงใช้ Flutter Driver ไม่ได้ Build staging มีไว้ดังนี้ Android: package `com.univerza.tukdaeng.staging` ชื่อแอป "Tukdaeng (STG)" scheme `tukdaeng-stg` ติดตั้งคู่กับ prod ได้ iOS: bundle id เดียวกันนี้ ผ่าน TestFlight เงื่อนไขของ APK: เป็น release build ที่ Dev กดสร้างเองจาก GitLab, artifact หมดอายุใน 7 วัน, ไม่มี Play track สำหรับ staging ต้องส่งไฟล์ให้แล้วติดตั้งเอง และแอปไม่แจ้งเตือนเวอร์ชันใหม่ ไม่มี debug APK จาก CI ถ้าจะใช้ Flutter Driver ต้องขอ build พิเศษ |
| 3.3 | ถ้าเทสบน prod จริง มี rate limit / anti-abuse ที่อาจ block พฤติกรรม automated ไหม | มี ค่าเดียวกันทั้ง prod และ staging ปิดไม่ได้จาก config รายละเอียดอยู่ในตารางด้านล่าง ไม่พบ captcha, Play Integrity หรือ root detection |

**Rate limit (3.3)**

| ขอบเขต | ขีดจำกัด | นับต่อ |
|---|---|---|
| Auth endpoints (sign in, สมัคร ฯลฯ) | 50 ครั้ง / 15 นาที | IP |
| Feed, Search, Products, Catalog, Domains, Legal | 300 ครั้ง / นาที | IP |
| ค้นหาสถานที่ (Places) | 60 ครั้ง / นาที | IP |
| ขอ OTP ใหม่ | 5 ครั้ง / 2 นาที | บัญชี |
| ขอ reset password | 3 ครั้ง / 15 นาที | บัญชี |
| ใส่รหัสผิดหน้า Sign in | ล็อกฟอร์มเมื่อผิดครบ 5 ครั้ง | ฝั่งแอป เปิดหน้าใหม่แล้วนับใหม่ |

เกินขีดจำกัดจะได้ HTTP 429 ถ้ารันหลายเครื่องผ่าน IP เดียวกัน โควตานี้ใช้ร่วมกัน

## 4) บัญชี & Test Data *(blocker)*

| # | คำถาม | คำตอบ |
|---|---|---|
| 4.1 | ขอ test accounts ≥3 ใบ (member ทั่วไป + seller/owner) บน env ที่จะเทส | ให้ QA สมัครเองด้วยอีเมลจริง ระบบไม่มี role seller แยก ทุกบัญชีลงโพสต์ขายได้ "owner" คือบัญชีที่เป็นเจ้าของโพสต์ จึงใช้บัญชีปกติได้ทุกบทบาท |
| 4.2 | มีวิธี seed/reset ข้อมูลไหม (posts/assets หลายสถานะ, chat threads) เช่น API หรือ script | ไม่มี API หรือ script สำหรับเทส `database/seed.sql` เป็นข้อมูลตั้งต้นของระบบเท่านั้น ทางที่ทำได้: เรียก API ปกติด้วย JWT ของบัญชีเทสเพื่อสร้างข้อมูล (Swagger เปิดเฉพาะบน staging ใช้ดูรูปแบบ API) ส่วนสถานะที่สร้างผ่าน API ไม่ได้ให้คุยกับ Dev แก้วเป็นกรณีไป chat อยู่บนบริการ ChatCore แยกต่างหาก สร้างห้องผ่านการใช้งานจริงจากแอป |
| 4.3 | reset สถานะบัญชีเทสได้ไหม (re-run onboarding / restore deleted account) | Onboarding: clear app data ได้เลย (`pm clear`) เพราะเป็นสถานะต่อเครื่อง ไม่ผูกบัญชี Restore: sign in ภายใน 30 วันหลังลบ บัญชีจะกลับมาเอง แต่ Watch Alert ที่ถูกยกเลิกตอนลบจะไม่กลับมา พ้น 30 วันแล้ว restore ไม่ได้ และการสมัครใหม่ด้วยอีเมลหรือ SSO เดิมยังมีปัญหาค้างอยู่ ควรใช้อีเมลใหม่ทุกครั้งสำหรับเคสลบบัญชี |

## 5) Auth & OTP *(5.1 = blocker)*

| # | คำถาม | คำตอบ |
|---|---|---|
| 5.1 | OTP ส่งช่องทางไหน (อีเมล/SMS) — มี test OTP แบบโค้ดคงที่สำหรับบัญชีเทสไหม (ถ้าไม่มี ขอแนวทางอ่าน OTP อัตโนมัติ) | OTP ส่งทางอีเมลเท่านั้น ไม่มี SMS เป็นเลขสุ่ม 6 หลัก หมดอายุใน 30 นาที ใช้เฉพาะตอนสมัครด้วยอีเมล ไม่มีโค้ดคงที่หรือทางลัดสำหรับเทส แนวทาง: (1) เคสที่ไม่ได้เทสการสมัคร ใช้บัญชีที่ยืนยันแล้ว sign in ด้วยรหัสผ่าน ไม่ต้องใช้ OTP (2) เคสสมัครใหม่ ใช้ mailbox ของ QA อ่าน OTP ผ่าน IMAP หรือ Gmail API และ**ต้องอ่านโฟลเดอร์ Spam ด้วย** เพราะเมลของระบบมักเข้า Spam ส่วน reset password ส่งเป็นลิงก์ ไม่ใช่ OTP ไม่แนะนำให้เพิ่ม OTP คงที่บน production เพราะจะเป็นช่องโหว่ด้านความปลอดภัย |
| 5.2 | SSO Google/Apple มี test account / sandbox flow ไหม | ไม่มี sandbox ใช้บัญชี Google หรือ Apple จริงเท่านั้น หน้าเลือกบัญชีเป็น UI ของระบบและอาจเจอ challenge จาก Google แนะนำให้เทส SSO แบบ manual หรือ smoke test เท่านั้น |
| 5.3 | มี deep link หรือ magic link sign-in ไหม (ช่วย skip auth UI บางเคส) | ไม่มี magic link sign-in แต่ session คงอยู่ข้ามการเปิดแอป จึงใช้ `noReset` เพื่อข้ามหน้า sign in ได้ (refresh token อายุ 90 วัน) Deep link ที่มีใช้กระโดดไปหน้าปลายทางได้ แต่ไม่ได้ทำให้ login: `tukdaeng://profile`, `tukdaeng://listing`, `tukdaeng://reset-password` และ `https://tukdaeng.univerza.co/listing`, `/profile`, `/reset-password` |

## 6) Side Effects

| # | คำถาม | คำตอบ |
|---|---|---|
| 6.1 | flow report/block → เข้า moderation queue จริงของ BO ไหม — auto run จะ spam คิว admin ไหม มี sandbox route ไหม | เข้าคิวจริง Report บันทึกลงตาราง `content_reports` และ BO อ่านคิวนี้ได้ ไม่มี sandbox route auto run จึงเพิ่มรายการในคิว admin จริง ให้ report เฉพาะโพสต์และบัญชีเทส และแจ้ง Dev แก้วทาง LINE ก่อนรันชุดนี้ Block มีผลจริงและส่งต่อไปยัง ChatCore ด้วย ควรปลด block ท้ายเคส |
| 6.2 | push notification มีวิธี trigger test push ไหม (เช่นผ่าน FCM token ของเครื่องเทส) | ไม่มี endpoint สำหรับ test push วิธี trigger คือใช้บัญชีที่สองทำ action จริง เช่น like, comment, follow, ส่งข้อความ ขณะแอปเปิดอยู่ แจ้งเตือนในแอปมาผ่าน realtime ส่วน push ผ่าน FCM ตอนแอปปิดหรืออยู่เบื้องหลัง ยังตั้งค่าไม่ครบทั้งแอปและ backend จึงยังไม่พร้อมเทส ให้พักเทสเคสกลุ่มนี้ไว้จนกว่า Dev จะแจ้ง |
| 6.3 | delete account ใน env เทส — grace period / restore ทำงานเหมือน prod ไหม | เทสบน prod คือการลบจริง grace period 30 วันฝังในโค้ด ปรับสั้นลงไม่ได้ Restore ด้วยการ sign in ภายใน 30 วัน มี worker ทำงานทุกชั่วโมงเพื่อปิดบัญชีที่ครบกำหนด เคสครบ 30 วันต้องรอครบกำหนดจริง |

## 7) Release

| # | คำถาม | คำตอบ |
|---|---|---|
| 7.1 | release cadence ถี่แค่ไหน + ช่องทางแจ้ง build ใหม่ | ช่วงที่ผ่านมาออกเวอร์ชันประมาณสัปดาห์ละครั้ง (1.0.4 วันที่ 14 ต.ค. จนถึง 1.0.8 วันที่ 4 พ.ย.) Backend deploy ถี่กว่านั้นและไม่ต้องอัปเดตแอป Android ขึ้น Play แบบ manual ล่าสุดคือ 1.0.8 (9) เมื่อ 5 พ.ย. Dev แก้วแจ้งทาง LINE พร้อมเลขเวอร์ชันและลิงก์ APK |
| 7.2 | iOS ขึ้น store แล้วหรือยัง / แผนเมื่อไหร่ (เฟสแรกเราทำ Android ก่อน) | สถานะบน App Store Connect: พร้อมสำหรับการจัดจำหน่าย (Ready for Distribution) |

## 8) Contact

| # | คำถาม | คำตอบ |
|---|---|---|
| 8.1 | ถ้าเจอ blocker ระหว่าง setup automation ติดต่อใคร / ช่องทางไหน | แจ้ง Dev แก้ว ทาง LINE |
