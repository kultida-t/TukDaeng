# AUTO-TEST-001 — คำถามถึงทีม Dev (QA Automation Prep)

> Task: 531733e8 · Mission: 7189b3fd (Automate Test แอป FO บน Store) · วันที่: 2026-11-06
> วัตถุประสงค์: เตรียมทำ automated UI test สำหรับแอป TukDaeng FO บน store (com.univerza.tukdaeng)
> ครอบคลุม test case ~2,470 แถวใน `deliverables/FO-TEST-001-*-checklist.csv`
> วิธีใช้: ส่งเอกสารนี้ให้ทีม dev ตอบในคอลัมน์ "คำตอบ" แล้วส่งกลับ

## สรุปข้อที่เป็น blocker (ตอบแล้วเริ่มงานได้ทันที)

- 3.x Environment & Build
- 4.x บัญชี & Test Data
- 5.1 OTP

ที่เหลือใช้วางแผน scale / เลือก framework — ตอบช้ากว่าได้แต่ขอภายในงวดเดียวกัน

---

## 1) Stack & Source

| # | คำถาม | คำตอบ |
|---|---|---|
| 1.1 | แอปเขียนด้วยอะไร — Flutter / React Native / native / WebView hybrid? (Android กับ iOS ต่างกันไหม) | |
| 1.2 | เข้าถึง source repo ของแอปได้ไหม (read-only ก็ได้) | |

## 2) Testability

| # | คำถาม | คำตอบ |
|---|---|---|
| 2.1 | element สำคัญมี testID / content-desc / semantics label ให้ automation จับไหม | |
| 2.2 | ขอเพิ่ม label บนจุดที่จำเป็นได้ไหม (เราจะส่งรายการ element ให้ภายหลัง) | |
| 2.3 | มี debug menu / feature flag สำหรับเทสไหม (เช่น skip onboarding, ปรับ cooldown, mock state) | |

## 3) Environment & Build *(blocker)*

| # | คำถาม | คำตอบ |
|---|---|---|
| 3.1 | มี staging/test backend env แยกจาก production ไหม | |
| 3.2 | มี build แยกสำหรับเทสไหม (staging build / internal testing track / debug APK) — package id ต่างจาก prod ไหม | |
| 3.3 | ถ้าเทสบน prod จริง มี rate limit / anti-abuse ที่อาจ block พฤติกรรม automated ไหม | |

## 4) บัญชี & Test Data *(blocker)*

| # | คำถาม | คำตอบ |
|---|---|---|
| 4.1 | ขอ test accounts ≥3 ใบ (member ทั่วไป + seller/owner) บน env ที่จะเทส | |
| 4.2 | มีวิธี seed/reset ข้อมูลไหม (posts/assets หลายสถานะ, chat threads) เช่น API หรือ script | |
| 4.3 | reset สถานะบัญชีเทสได้ไหม (re-run onboarding / restore deleted account) | |

## 5) Auth & OTP *(5.1 = blocker)*

| # | คำถาม | คำตอบ |
|---|---|---|
| 5.1 | OTP ส่งช่องทางไหน (อีเมล/SMS) — มี test OTP แบบโค้ดคงที่สำหรับบัญชีเทสไหม (ถ้าไม่มี ขอแนวทางอ่าน OTP อัตโนมัติ) | |
| 5.2 | SSO Google/Apple มี test account / sandbox flow ไหม | |
| 5.3 | มี deep link หรือ magic link sign-in ไหม (ช่วย skip auth UI บางเคส) | |

## 6) Side Effects

| # | คำถาม | คำตอบ |
|---|---|---|
| 6.1 | flow report/block → เข้า moderation queue จริงของ BO ไหม — auto run จะ spam คิว admin ไหม มี sandbox route ไหม | |
| 6.2 | push notification มีวิธี trigger test push ไหม (เช่นผ่าน FCM token ของเครื่องเทส) | |
| 6.3 | delete account ใน env เทส — grace period / restore ทำงานเหมือน prod ไหม | |

## 7) Release

| # | คำถาม | คำตอบ |
|---|---|---|
| 7.1 | release cadence ถี่แค่ไหน + ช่องทางแจ้ง build ใหม่ | |
| 7.2 | iOS ขึ้น store แล้วหรือยัง / แผนเมื่อไหร่ (เฟสแรกเราทำ Android ก่อน) | |

## 8) Contact

| # | คำถาม | คำตอบ |
|---|---|---|
| 8.1 | ถ้าเจอ blocker ระหว่าง setup automation ติดต่อใคร / ช่องทางไหน | |
