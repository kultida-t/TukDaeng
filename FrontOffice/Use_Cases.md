# Use Cases — แอปพลิเคชัน ตึกแดง (Tuk Daeng)
**เวอร์ชัน:** 1.0  
**วันที่:** พฤษภาคม 2568  
**ครอบคลุม:** FO (Front Office) ทุก Flow พร้อม Happy Path และ Error Cases

> **Sync note (FO-PRD-v1.9, 2026-10-22):** เอกสารนี้เป็น assumption doc เก่า (legacy tier) ที่ sync ตาม `Prototypes/fo-flow/index.html` + master §16 Sync Decision Log — feed post-centric, Member Sheet (เดิม Global Login Required Dialog), Alerts feed 5 types (เดิม Notification Center), composer asset mode, Sale Record = ราคา+วันที่, share member-only, delete account login-to-restore — จุดที่ขัด master/module spec ให้ยึด master/module spec เสมอ

---

## หมายเหตุเรื่อง Role ผู้ใช้

> ผู้ใช้ทุกคนในระบบมี **Role เดียวกัน** ไม่มีการแบ่งประเภท Buyer / Seller / Collector  
> ผู้ใช้คนเดียวสามารถทำได้ทุกอย่าง: ลงขายสินทรัพย์, ซื้อสินทรัพย์ของคนอื่น, แสดงคอลเลกชัน หรือซ่อนไว้ส่วนตัว  
>
> คำที่ใช้ในเอกสารนี้:  
> - **"Owner"** = ผู้ใช้ในฐานะเจ้าของสินทรัพย์ชิ้นนั้น ๆ  
> - **"Viewer"** = ผู้ใช้คนอื่นที่กำลังดูสินทรัพย์ที่ตนเองไม่ได้เป็นเจ้าของ  
> - ไม่ได้หมายถึง Role ที่แตกต่างกัน แต่หมายถึง **บริบท (Context)** ของการใช้งานในขณะนั้น

---

## สารบัญ

1. [Authentication Use Cases](#1-authentication)
2. [Feed Use Cases](#2-feed)
3. [Search & Filter Use Cases](#3-search--filter)
4. [Post Detail Use Cases](#4-post-detail-เดิมเรียก-asset-detail)
5. [Asset Management Use Cases](#5-asset-management)
6. [Chat Use Cases](#6-chat)
7. [Board Use Cases](#7-board)
8. [Alerts Use Cases](#8-alerts--notifications)
9. [Profile Use Cases](#9-profile)
10. [Settings Use Cases](#10-settings)

---

## 1. Authentication

---

### UC-AUTH-001: สมัครสมาชิกด้วย Email

**Actor:** ผู้ใช้ใหม่  
**Precondition:** ไม่ได้ Login อยู่

#### Happy Path
1. ผู้ใช้กรอก Email, Password
2. ผู้ใช้ยอมรับ Terms of Use และ Privacy Policy โดยปริยาย (implied consent — optional marketing opt-in แยก)
3. กด "Sign up"
4. ระบบส่ง OTP 6 หลักไปยัง Email
5. ผู้ใช้กรอก OTP บนหน้า Verify Email (auto-submit เมื่อครบ 6 หลัก)
6. ระบบยืนยัน OTP ถูกต้อง → สร้างบัญชี
7. แสดงหน้า "Account created" → ผู้ใช้ Sign in เอง (S-22 — ไม่ auto-login)

#### Error Cases
| ID | เงื่อนไข | ผลลัพธ์ |
|---|---|---|
| E01 | Email ซ้ำในระบบ | แสดง "This email is already registered" |
| E02 | Email format ไม่ถูกต้อง | แสดง "Invalid email format" |
| E03 | Password < 8 ตัวอักษร | แสดง "At least 8 characters, with a number or symbol" |
| E04 | OTP ผิด | แสดง "Incorrect code, please try again" |
| E05 | OTP หมดอายุ (contract-only error state — FO ไม่ได้กำหนด expiry duration) | แสดง "Code expired" + ปุ่ม Resend |
| E06 | กด Resend เร็วเกินไป | แสดง Countdown ก่อน Resend ได้อีกครั้ง |

---

### UC-AUTH-002: สมัครสมาชิกด้วย Apple

**Actor:** ผู้ใช้ใหม่ (iOS เท่านั้น)  
**Precondition:** ไม่ได้ Login อยู่, ใช้งานบนอุปกรณ์ iOS

#### Happy Path
1. กด "Sign up with Apple"
2. ระบบแสดง Native Apple Sign In Dialog
3. ผู้ใช้เลือกว่าจะแชร์ Email จริง หรือใช้ Private Relay Email ของ Apple
4. ยืนยันด้วย Face ID / Touch ID / Passcode
5. ระบบสร้างบัญชีอัตโนมัติ → session `new` → profile setup → เข้าสู่แอป (ไม่ต้องยืนยัน OTP; consent = implied + optional opt-in)

#### Error Cases
| ID | เงื่อนไข | ผลลัพธ์ |
|---|---|---|
| E01 | Email (จริงหรือ Relay) ซ้ำกับบัญชีที่มีอยู่แล้ว | แสดง "An account with this email already exists. Please sign in instead." |
| E02 | ผู้ใช้กด Cancel บน Apple Dialog | กลับสู่หน้า Sign up |
| E03 | Apple Service ไม่ตอบสนอง | แสดง "Unable to connect to Apple. Please try again." |

---

### UC-AUTH-003: สมัครสมาชิกด้วย Google

**Actor:** ผู้ใช้ใหม่

#### Happy Path
1. กด "Sign up with Google"
2. เลือก Google Account
3. ระบบสร้างบัญชีอัตโนมัติ → session `new` → profile setup → เข้าสู่แอป (ไม่ต้องยืนยัน OTP; consent = implied + optional opt-in)

#### Error Cases
| ID | เงื่อนไข | ผลลัพธ์ |
|---|---|---|
| E01 | Email Google ซ้ำกับบัญชีที่มีอยู่แล้ว | แสดง "An account with this email already exists. Please sign in instead." |
| E02 | ยกเลิกการเลือก Google Account | กลับสู่หน้า Sign up |

---

### UC-AUTH-004: เข้าสู่ระบบด้วย Email

**Actor:** ผู้ใช้ที่มีบัญชีแบบ Email/Password

#### Happy Path
1. กรอก Email และ Password
2. กด "Sign in"
3. ระบบยืนยันสำเร็จ → เข้าสู่หน้า Feed

#### Error Cases
| ID | เงื่อนไข | ผลลัพธ์ |
|---|---|---|
| E01 | Email หรือ Password ผิด | แสดง "Incorrect email or password" ใต้ช่อง Password + Highlight ขอบ Field สีแดง |
| E02 | บัญชีถูก Suspend | แสดง "Your account has been suspended. Contact support." |
| E03 | Email ยังไม่ยืนยัน | แสดงหน้า Verify Email อีกครั้ง + Resend OTP |
| E04 | ไม่กรอก Email หรือ Password | ปุ่ม Sign in ไม่ Active |
| E05 | บัญชีนี้สมัครด้วย Apple / Google | แสดง "This account uses [Apple/Google] Sign In. Please use that method instead." |

---

### UC-AUTH-005: เข้าสู่ระบบด้วย Apple

**Actor:** ผู้ใช้ที่มีบัญชีแบบ Apple (iOS เท่านั้น)

#### Happy Path
1. กด "Sign in with Apple"
2. ระบบแสดง Native Apple Sign In Dialog
3. ยืนยันด้วย Face ID / Touch ID / Passcode
4. ระบบยืนยันสำเร็จ → เข้าสู่หน้า Feed

#### Error Cases
| ID | เงื่อนไข | ผลลัพธ์ |
|---|---|---|
| E01 | ผู้ใช้กด Cancel | กลับสู่หน้า Sign in |
| E02 | Apple ID ไม่มีบัญชีในระบบ | แสดง "No account found. Please sign up first." + ปุ่ม "Sign up" |
| E03 | Apple Service ไม่ตอบสนอง | แสดง "Unable to connect to Apple. Please try again." |

---

### UC-AUTH-006: เข้าสู่ระบบด้วย Google

**Actor:** ผู้ใช้ที่มีบัญชีแบบ Google

#### Happy Path
1. กด "Sign in with Google"
2. เลือก Google Account
3. ระบบยืนยันสำเร็จ → เข้าสู่หน้า Feed

#### Error Cases
| ID | เงื่อนไข | ผลลัพธ์ |
|---|---|---|
| E01 | ยกเลิกการเลือก Google Account | กลับสู่หน้า Sign in |
| E02 | Google Account ไม่มีบัญชีในระบบ | แสดง "No account found. Please sign up first." + ปุ่ม "Sign up" |

---

### UC-AUTH-007: รีเซ็ตรหัสผ่าน

**Actor:** ผู้ใช้ที่ลืมรหัสผ่าน  
**Precondition:** ใช้ได้เฉพาะบัญชีที่สมัครด้วย Email/Password เท่านั้น (Apple/Google ไม่มีรหัสผ่านในระบบ)

#### Happy Path
1. กด "Forgot password?" บนหน้า Sign in
2. กรอก Email
3. กด "Send reset link"
4. ระบบส่ง Email พร้อมลิงก์ และแสดง generic confirmation "If this email exists, a reset link has been sent."
5. ผู้ใช้กดลิงก์ → ตั้งรหัสผ่านใหม่นอกแอป (contract — ไม่มี Reset Password / Password Updated page ใน FO screens, S-20)

#### Error Cases
| ID | เงื่อนไข | ผลลัพธ์ |
|---|---|---|
| E01 | Email ไม่มีในระบบ | แสดง "If this email exists, a reset link has been sent." (ไม่บอกว่ามีหรือไม่) |
| E02 | Email format ผิด | แสดง "Invalid email format" |
| E03 | ลิงก์หมดอายุ | ผู้ใช้ขอ reset link ใหม่ได้ (อยู่นอก FO screens) |

---

## 2. Feed

---

### UC-FEED-001: ดู Feed หน้าหลัก

**Actor:** ผู้ใช้ทุกคน (รวม Guest — guest browse ทุก tab ได้โดยไม่ gate, S-16)

#### Happy Path
1. เปิดแอป → แสดงหน้า Feed Tab "ทั้งหมด"
2. เห็นโพสต์ (post-centric — โพสต์ `sale` + โพสต์ `post` ไม่ผูก asset) เรียงตาม Newest
3. Scroll ดู list ทั้งหมด — render ครั้งเดียว ไม่มี infinite scroll / load-more ใน V1

#### Error Cases
| ID | เงื่อนไข | ผลลัพธ์ |
|---|---|---|
| E01 | ไม่มีอินเทอร์เน็ต | แสดงข้อมูล Cache พร้อม Banner "You are offline." (contract) |
| E02 | API error | แสดง "Unable to load feed" + ปุ่ม "Try again" ตาม error catalog |
| E03 | Tab "กำลังติดตาม" ยังไม่ Follow ใคร | แสดง Empty State |
| E04 | Tab "รายการโปรด" ยังไม่มี favorite seller | แสดง Empty State |

---

### UC-FEED-002: Like / Unlike โพสต์

**Actor:** ผู้ใช้ที่ Login แล้ว (guest กด → Member Sheet)

#### Happy Path
1. กดไอคอนหัวใจบนการ์ดโพสต์
2. ไอคอนเปลี่ยนสถานะ (Liked) + count sync เฉพาะเจ้าของโพสต์ (like count เป็น private — S-26)
3. โพสต์ที่ like เพิ่มใน Interested list (Settings > `interested`) — **ไม่ใช่** Tab Favorites (Favorites = favorite sellers, D7)

#### Error Cases
| ID | เงื่อนไข | ผลลัพธ์ |
|---|---|---|
| E01 | กด Like โพสต์ของตัวเอง | อนุญาต (แต่ไม่นับ Notification) |
| E02 | API fail | แสดง Toast error, rollback icon กลับสถานะเดิม |

---

### UC-FEED-003: Follow / Unfollow ผู้ขาย

**Actor:** ผู้ใช้ที่ Login แล้ว

#### Happy Path (Follow)
1. กดปุ่ม "Follow" (account-level — ทุกโพสต์ของ seller นั้น)
2. ปุ่มเปลี่ยนเป็น "Following"
3. โพสต์ของ seller คนนี้ปรากฏใน Tab "กำลังติดตาม"

#### Happy Path (Unfollow)
1. กดปุ่ม "Following"
2. แสดง uf confirm sheet
3. ยืนยัน → ปุ่มเปลี่ยนกลับเป็น "Follow" + ล้าง favorite/muted ของ seller นั้น

#### Error Cases
| ID | เงื่อนไข | ผลลัพธ์ |
|---|---|---|
| E01 | Follow ตัวเอง | ซ่อนปุ่ม Follow |
| E02 | API fail | Toast error, rollback |

---

## 3. Search & Filter

---

### UC-SEARCH-001: ค้นหาด้วย Keyword

**Actor:** ผู้ใช้ทุกคน

#### Happy Path
1. กดไอคอนค้นหาบน feed header → landing = popular chips + explore photo grid
2. พิมพ์ Keyword (เช่น "Rolex") → recent searches (≤8) + live suggestions
3. เลือก Suggestion หรือ กด Enter
4. แสดงผลลัพธ์ใน tabs `For you` / `Profiles` / `Tags` — **ไม่มี result count** บนหน้า results
5. กดผลลัพธ์ → เปิด Post Viewer เต็มจอเลื่อนแนวตั้ง

#### Error Cases
| ID | เงื่อนไข | ผลลัพธ์ |
|---|---|---|
| E01 | ไม่พบผลลัพธ์ | แสดง empty state กลาง "No data found" |
| E02 | Keyword สั้นเกิน (< 2 ตัว) | ไม่แสดง suggestions |

---

### UC-SEARCH-002: กรองข้อมูลด้วย Filter

**Actor:** ผู้ใช้ทุกคน

#### Happy Path
1. กด filter icon บนหน้า Search → เปิด `sfilter` (11 sections, chip multi-select)
2. เลือก Brand → "Rolex", "Omega" (Model dependent ตาม Brand)
3. กรอก Price range (typed inputs — ไม่มี slider)
4. กด "Apply (n)" — commit draft เข้าผลลัพธ์ (Apply เท่านั้นที่ commit; back ทิ้ง draft)
5. แสดง active filter chips ด้านบน
6. ผลลัพธ์อัปเดตทันที — ไม่มี Sort UI (S-24)

#### Error Cases
| ID | เงื่อนไข | ผลลัพธ์ |
|---|---|---|
| E01 | Min Price > Max Price | แสดง validation error |
| E02 | Filter ผสมกันแล้วไม่มีผล | แสดง Empty State + "Clear all" |

---

### UC-SEARCH-003: บันทึก Watch Alert จาก Search

**Actor:** ผู้ใช้ที่ Login แล้ว

#### Happy Path
1. ตั้ง Filter (เช่น Brand: Rolex)
2. กดปุ่ม save to Watch Alert → เปิด shared `Create watch alert` sheet
3. ระบบ auto-fill ชื่อจาก criteria (แก้ไขได้) — criteria ถูก snapshot ตอนสร้าง (S-11)
4. เลือก match mode: `ตรงทุกเงื่อนไข` / `ตรงเงื่อนไขใดเงื่อนไขหนึ่ง` / `เฉพาะรุ่น` พร้อม `N now` count
5. กด "Create alert"
6. Alert ปรากฏใน Settings > Your library > Watch Alerts (`walerts`)

#### Error Cases
| ID | เงื่อนไข | ผลลัพธ์ |
|---|---|---|
| E01 | Alert ซ้ำ Criteria เดิม | ระบบรองรับหลาย alert criteria ซ้ำได้ (ไม่ block — snapshot แยกกัน) |

---

## 4. Post Detail (เดิมเรียก Asset Detail)

---

### UC-DETAIL-001: ดูรายละเอียดสินทรัพย์ (Viewer — ผู้ใช้ที่ไม่ใช่เจ้าของ)

**Actor:** ผู้ใช้ที่ Login แล้ว และไม่ใช่เจ้าของสินทรัพย์ชิ้นนั้น
**Precondition:** โพสต์มีสถานะ Sale หรือ Show เท่านั้น (Hide และ Sold ไม่ปรากฏใน Feed และไม่สามารถเข้าถึงได้)

#### Happy Path
1. กดโพสต์จาก Feed / Search tile (เปิด Post Viewer หรือ Post Detail)
2. เห็น hero media + action row (like / comment / share / save / `...`)
3. อ่าน caption + spec chips
4. เปิด comments sheet → อ่าน comments + emoji quick-react
5. เห็นราคา + ปุ่ม `Ask Seller` (เฉพาะ sale post — chat entry listing-scoped)
6. กดชื่อเจ้าของ → Public Profile + Follow

#### Error Cases
| ID | เงื่อนไข | ผลลัพธ์ |
|---|---|---|
| E01 | เข้า URL ตรงของโพสต์ที่ถูก Hide | แสดง "This item is no longer available" |
| E02 | เข้า URL ตรงของโพสต์ที่ Sold แล้ว | แสดง unavailable/sold state |

---

### UC-DETAIL-001B: ดูรายละเอียดสินทรัพย์ (Owner — ผู้ใช้ที่เป็นเจ้าของ)

**Actor:** ผู้ใช้ที่ Login แล้ว และเป็นเจ้าของสินทรัพย์ชิ้นนั้น
**Precondition:** เจ้าของเห็นโพสต์/asset ได้ทุกสถานะ (Sale, Show, Hide, Sold + kind `post`)

#### Happy Path
1. กดโพสต์จาก Profile ของตัวเอง (ทุก Tab)
2. เห็น Post Detail ฝั่ง owner — media, specs, comments
3. ไม่เห็นปุ่ม Follow (ไม่ Follow ตัวเอง)
4. เปิด own-post `...` menu → actions ตาม canonical 02:

| Action | เงื่อนไข |
|---|---|
| `Edit info` | ทุกโพสต์ — เปลี่ยน `Profile status` ได้เมื่อ drawer toggle ON |
| `Mark as sold` | `sale`/`show`/`hide` เท่านั้น → `sell:{id}` Sale Record form |
| `View sale record` | `sold` เท่านั้น → `sold:{id}` |
| `Delete` | dialog `Delete post?` → ลบทุก surface |

#### Error Cases
| ID | เงื่อนไข | ผลลัพธ์ |
|---|---|---|
| E01 | Mark as sold บน post ที่ขัดเงื่อนไข | ไม่แสดง entry / guard ตาม 04 spec |

---

### UC-DETAIL-003: Comment บนโพสต์

**Actor:** ผู้ใช้ที่ Login แล้ว (guest กด comment → Member Sheet)

#### Happy Path
1. เปิด shared comments sheet จาก action rail (ทุก surface)
2. แตะ emoji quick-react → สร้าง comment (S-12 — text input ยังไม่ implement ใน V1)
3. Comment ปรากฏทันที + count sync

#### Error Cases
| ID | เงื่อนไข | ผลลัพธ์ |
|---|---|---|
| E01 | Long-press comment ของตัวเอง → Delete | confirm + cascade replies ใต้ root comment |
| E02 | Long-press comment ของคนอื่น | popover `Block` + `Report` → report:comment (X-only ไม่มี back) |

---

## 5. Asset Management

---

### UC-ASSET-001: เพิ่มสินทรัพย์ใหม่ (composer asset mode)

**Actor:** ผู้ใช้ที่ Login แล้ว (เจ้าของ)

#### Happy Path
1. กดปุ่ม "+" บน Profile (หรือ composer entry) → เลือก asset mode
2. เลือกรูปภาพจาก picker (required เดียวคือ ≥1 media — `Add Asset` disabled จนกว่ามี media)
3. (ตัวเลือก) กรอก caption / spec fields (free-text — ไม่มี Market Data autocomplete/option-master)
4. (ตัวเลือก) กรอก Asking Price ผ่าน `Add price` pane — optional ทุก status ไม่มี `Price on request` label
5. (ตัวเลือก) กรอก `Cost details (private)` — Purchase Price + Purchase Date (owner-private เสมอ)
6. เลือก Visibility pick: `Show` (default) / `Hide` / `Post to feed` (+ `Also save to My Assets` toggle ใน post mode)
7. กด "Add Asset" → สร้าง drawer record + (post to feed → เข้า feed) + toast ตาม visibility — ไม่มี confirmation dialog

#### Error Cases
| ID | เงื่อนไข | ผลลัพธ์ |
|---|---|---|
| E01 | ไม่เลือกรูปภาพ | ปุ่ม `Add Asset` disabled (ไม่มี error message) |
| E02 | Asking Price = 0 หรือไม่ใช่ตัวเลข | validation — ต้องเป็นตัวเลขมากกว่า 0 เมื่อกรอก |
| E03 | อัปโหลดรูปเกิน 10 รูป | limit สูงสุด 10 รูป |
| E04 | Purchase Date เป็นวันอนาคต | inline validation บน cost block |

---

### UC-ASSET-002: แก้ไขโพสต์/สินทรัพย์ (Edit info)

**Actor:** เจ้าของสินทรัพย์
**Precondition:** โพสต์ต้องไม่ใช่ `sold` (Sold ไม่สามารถ Edit ข้อมูลหลักได้)

#### Happy Path
1. own-post `...` menu → `Edit info` → composer step 2 prefilled
2. แก้ไขข้อมูลที่ต้องการ + `Profile status` pick (ขาย/โชว์/ซ่อน) เมื่อ drawer toggle ON
3. บันทึก → pfkind เปลี่ยน + drawer record sync + surfaces refresh

#### Error Cases
- เหมือน UC-ASSET-001 ทุก Error Case

---

### UC-ASSET-002B: ดู Sale Record

**Actor:** เจ้าของสินทรัพย์
**Precondition:** โพสต์/asset มีสถานะ **Sold** เท่านั้น

#### Happy Path
1. own-post `...` menu → `View sale record` (หรือ Portfolio > sold history > sold row)
2. เปิด `sold:{id}` — แสดง Sale Record:
   - ราคาที่ขาย (Sale Price THB)
   - วันที่ขาย (Sale Date)
   - Realized Gain/Loss + return (คำนวณจาก purchase carry-over)
3. Sale Record มีแค่ราคา+วันที่เท่านั้น (D3 — ไม่มี Buyer/Contact/Payment Method/Attachment)

#### Error Cases
| ID | เงื่อนไข | ผลลัพธ์ |
|---|---|---|
| E01 | Viewer (ไม่ใช่เจ้าของ) พยายามเข้าถึง Sale Record | ไม่มี entry / API ปฏิเสธ Request (403) |

---

### UC-ASSET-003: เปลี่ยน Status โพสต์/สินทรัพย์

**Actor:** เจ้าของสินทรัพย์

#### Happy Path
1. own-post `...` menu → `Edit info` → `Profile status` pick (drawer toggle ON)
2. เลือกสถานะใหม่ (ขาย / โชว์ / ซ่อน)
3. pfkind + drawer record sync — โพสต์หาย/เข้า surfaces ตาม visibility matrix

---

### UC-ASSET-004: Mark as Sold (บันทึก Sale Record)

**Actor:** เจ้าของสินทรัพย์

#### Happy Path
1. own-post `...` menu → `Mark as sold` (หรือ Portfolio asset detail — eligible `sale`/`show`/`hide`)
2. เปิด `sell:{id}` Sale Record form — prefill Sale price = asking, Sale date = วันนี้
3. กรอก Sale Price (THB) — แสดง Expected gain live
4. เลือก Sale Date
5. กด "Save sale record" → status เปลี่ยนเป็น "Sold" + landing `sold:{id}`

#### Required / Optional Fields
| Field | Required | Validation |
|---|---:|---|
| Sale Price (THB) | Yes | ต้องเป็นตัวเลขมากกว่า 0, ไม่รับค่าติดลบ/ตัวอักษร, normalize comma |
| Sale Date | Yes | ต้องเป็นวันที่จริง, ห้ามเป็นวันที่อนาคต |

(Sale Record = 2 ฟิลด์เท่านั้นตาม D3 — Buyer/Contact/Payment Method/Attachment/Note เป็น future scope)

#### Error Cases
| ID | เงื่อนไข | ผลลัพธ์ |
|---|---|---|
| E01 | Sale Price = 0 หรือว่าง | แสดง inline validation error |
| E02 | ไม่เลือก Sale Date | แสดง inline validation error |
| E03 | Sale Date เป็นวันที่อนาคต | แสดง inline validation error |

---

### UC-ASSET-005: บันทึก Cost Details (owner-private)

**Actor:** เจ้าของสินทรัพย์

#### Happy Path
1. ระหว่าง composer asset mode เลือก `Cost details (private)` row (แสดงเสมอใน asset mode)
2. (ตัวเลือก) กรอก Purchase Price (THB)
3. (ตัวเลือก) เลือก Purchase Date
4. กด "Add Asset" → cost data เก็บใน drawer record

#### Required / Optional Fields
| Field | Required | Validation |
|---|---|---|
| Purchase Price (THB) | No | หากกรอกต้องเป็นตัวเลขและมากกว่า 0 (strip non-digit + auto-comma) |
| Purchase Date | No | หากเลือกต้องไม่เป็นวันที่ในอนาคต (inline validation) |

- Cost details เป็น owner-private — ไม่แสดงบน public surface และใช้เป็น input ของ Portfolio `Total invested`
- ไม่มี Provenance / Consignment entity ใน FO V1 (ตาม S-25 — prototype ไม่มี entity, step, หรือ tab เหล่านี้)

---

---

## 6. Chat

---

### UC-CHAT-001: ดูรายการแชท

**Actor:** ผู้ใช้ที่ Login แล้ว (member-only — guest เจอ Member Sheet)

#### Happy Path
1. กด Tab "แชท"
2. แสดงรายการแชทล่าสุดใน view `Chats` (เรียงตามเวลา) — สลับ view `Items` เพื่อจัดกลุ่มตาม listing (`Your listings` / `Items you asked about`)

---

### UC-CHAT-002: ส่งข้อความ

**Actor:** ผู้ใช้ที่ Login แล้ว

#### Happy Path
1. เลือกห้องแชท (thread ผูก user + item — seller เดิมคนละ listing = ห้องแยก)
2. พิมพ์ข้อความ
3. กด Send
4. ข้อความปรากฏทันทีฝั่งขวา + ห้องขึ้นบนสุด

#### Error Cases
| ID | เงื่อนไข | ผลลัพธ์ |
|---|---|---|
| E01 | ข้อความว่าง | ปุ่ม Send ไม่ Active |
| E02 | ไม่มีอินเทอร์เน็ต | แสดงไอคอน Error ข้าง Message + ปุ่ม Retry (contract) |
| E03 | ห้องถูก block | แสดง `You blocked this account` + `Unblock` — ส่งไม่ได้จน unblock |

---

### UC-CHAT-003: ส่งรูปภาพ (media message)

**Actor:** ผู้ใช้ที่ Login แล้ว

#### Happy Path
1. กดปุ่ม `+` ใน composer → attach sheet `Photos & videos`
2. เลือกรูป → ส่งเป็น media message
3. แตะ media bubble → เปิด `.ch-media-viewer` overlay

#### Error Cases
| ID | เงื่อนไข | ผลลัพธ์ |
|---|---|---|
| E01 | Upload fail | แสดง "Failed to send. Tap to retry." (contract) |

(ไม่มี File message / Asset Card message ใน V1)

---

### UC-CHAT-005: ซ่อน/ลบแชท

**Actor:** ผู้ใช้ที่ Login แล้ว

#### Happy Path (Hide)
1. Swipe บนรายการแชท → เลือก hide
2. Dialog "Hiding chats doesn't delete their messages." → กด "Hide" → `ซ่อนแชทแล้ว`

#### Happy Path (Delete)
1. Swipe บนรายการแชท → เลือก delete
2. Dialog "Are you sure you want to delete this chat?"
3. กด "Delete" → `ลบแชทเรียบร้อยแล้ว` — ห้องหายจาก list เฉพาะฝั่งผู้กด ไม่ลบ server history ไม่มี restore UI

#### Error Cases
| ID | เงื่อนไข | ผลลัพธ์ |
|---|---|---|
| E01 | กด "Cancel" | ยกเลิก ไม่มีการซ่อน/ลบ |

---

## 7. Board

---

### UC-BOARD-001: อ่านบทความ

**Actor:** ผู้ใช้ทุกคน (รวม Guest ที่ไม่ Login — อ่านได้เสรี)

#### Happy Path
1. กด Tab "Board" → editorial magazine (hero featured + Latest list + freeform tags)
2. เลือกบทความ
3. อ่านเนื้อหา
4. กด Like หรือ Share — member-only: member ใช้ได้ทันที, guest เจอ Member Sheet (S-03)

#### Error Cases
| ID | เงื่อนไข | ผลลัพธ์ |
|---|---|---|
| E01 | บทความถูก Unpublish โดย Admin | แสดง "This article is no longer available" |
| E02 | ไม่มีอินเทอร์เน็ต | แสดงบทความจาก Cache ถ้ามี (contract) |

---

### UC-BOARD-002: ค้นหาบทความ

**Actor:** ผู้ใช้ทุกคน

#### Happy Path
1. กดไอคอนค้นหาบน Board
2. พิมพ์ Keyword
3. แสดงผลลัพธ์บทความที่เกี่ยวข้อง

#### Error Cases
| ID | เงื่อนไข | ผลลัพธ์ |
|---|---|---|
| E01 | ไม่พบบทความ | แสดง "No articles found for '[keyword]'" |

---

### UC-BOARD-003: กรองบทความตามหมวดหมู่

**Actor:** ผู้ใช้ทุกคน

#### Happy Path
1. กดหมวดหมู่/tag บน Board (freeform tags)
2. แสดงบทความในหมวดนั้น — static list + end note (ไม่มี infinite scroll)

---

## 8. Alerts & Notifications

---

### UC-ALERT-001: ดูการแจ้งเตือน

**Actor:** ผู้ใช้ที่ Login แล้ว (member-only — guest เจอ Member Sheet)

#### Happy Path
1. กด Tab "แจ้งเตือน" (Alerts feed)
2. แสดงรายการแจ้งเตือน 5 types (like/comment/follow/watch alert/system) แบ่งกลุ่ม `Today`/`Yesterday`/`Last 7 days`/`Earlier`
3. กด "Mark all as read" หรือกด row → ไป Post Viewer / Public Profile ตาม type

---

### UC-ALERT-003: จัดการ Watch Alert

**Actor:** ผู้ใช้ที่ Login แล้ว

#### Happy Path (List)
1. เข้า Settings > Your library > Watch Alerts (`walerts`)
2. เห็นรายการ alert พร้อมชื่อ auto-name + criteria snapshot

#### Happy Path (Delete)
1. กด delete บน alert → ลบทันที (instant delete — ไม่มี confirmation, S-11)

#### Happy Path (Toggle Notification)
1. Toggle "Notifications" → Off
2. ไม่รับ Push Notification จาก Alert นี้ (แต่ยัง match อยู่)

#### Error Cases
| ID | เงื่อนไข | ผลลัพธ์ |
|---|---|---|
| E01 | กด watch notification | เปิด Post Viewer ของ post ที่ match โดยตรง (S-08 — ไม่มี Result List คั่น) |

---

## 9. Profile

---

### UC-PROFILE-001: ดูโปรไฟล์ตัวเอง (Owner View)

**Actor:** ผู้ใช้ที่ Login แล้ว

#### Happy Path
1. กด Tab "Profile"
2. เห็นรูปโปรไฟล์, ชื่อ, bio, สถิติ (Followers, Following) — **ไม่มี** headline ตัวเลขมูลค่า (entry portfolio = wallet icon `.pf-pfo`)
3. เห็นแท็บ post grid ครบทุกสถานะ:
   - **ทั้งหมด** → โพสต์/asset ทุกชิ้น ทุกสถานะ
   - **ขาย** → โพสต์สถานะ Sale
   - **โชว์** → โพสต์สถานะ Show
   - **ซ่อน** → โพสต์สถานะ Hide (เห็นเฉพาะตัวเอง)
   - **ขายแล้ว** → โพสต์ที่ขายไปแล้ว (Sold)
4. กดโพสต์ใด ๆ → เข้า Post Detail ในฐานะ Owner
5. กด wallet icon → Portfolio (UC-PROFILE-003)

#### Error Cases
| ID | เงื่อนไข | ผลลัพธ์ |
|---|---|---|
| E01 | ยังไม่มีโพสต์ใน Tab ใด | แสดง Empty State พร้อม composer entry |

---

### UC-PROFILE-002: ดูโปรไฟล์ผู้ใช้คนอื่น (Viewer View)

**Actor:** ผู้ใช้ที่ Login แล้ว
**Precondition:** ดูโปรไฟล์ของผู้ใช้คนอื่น ไม่ใช่ตัวเอง

#### Happy Path
1. กดชื่อเจ้าของโพสต์บน Feed หรือ Post Detail
2. เห็นรูปโปรไฟล์, ชื่อ, bio, สถิติ (Followers, Following)
3. เห็นปุ่ม "Follow" หรือ "Following" + viewer `...` menu (Report / Block / About / Copy URL / Share)
4. เห็นแท็บเฉพาะสถานะสาธารณะ:
   - **ขาย** → โพสต์สถานะ Sale เท่านั้น
   - **โชว์** → โพสต์สถานะ Show เท่านั้น
5. ไม่เห็น Tab ซ่อน, ขายแล้ว และ wallet/portfolio entry

#### Error Cases
| ID | เงื่อนไข | ผลลัพธ์ |
|---|---|---|
| E01 | เจ้าของไม่มีโพสต์ Sale และ Show เลย | แสดง Empty State ทั้งสอง Tab |
| E02 | ดูโปรไฟล์ตัวเอง (กด Link ตรง) | Redirect ไปยังหน้า Profile ตัวเอง (Owner View) แทน |
| E03 | โปรไฟล์ของ user ที่ block กัน | แสดง keep-page state ตาม IG model (S-13 — ไม่ใช่ unavailable) |

---

### UC-PROFILE-003: ดู Portfolio Dashboard

**Actor:** เจ้าของ (Profile ตัวเอง — owner-only)

#### Happy Path
1. กด wallet icon `.pf-pfo` บน own profile
2. เห็น headline `Total invested` (Σ Purchase Price — D2) + `ส่วนตัว` tag + market value line + coverage
3. เลื่อนดูรายการ asset แต่ละชิ้นพร้อมราคาซื้อ/มูลค่าปัจจุบัน/G-L
4. กด `ประวัติการขาย` → Sold history (Sale Record = ราคา+วันที่) — ไม่มี Top Brand/YTD (D5)

---

## 10. Settings

---

### UC-SETTING-001: แก้ไขโปรไฟล์

**Actor:** ผู้ใช้ที่ Login แล้ว

#### Happy Path
1. Own Profile → `pedit` (Edit profile อยู่ own profile — S-05)
2. แก้ Username, Phone, Line
3. เปลี่ยนรูปโปรไฟล์
4. กด "Save"

#### Error Cases
| ID | เงื่อนไข | ผลลัพธ์ |
|---|---|---|
| E01 | Username ซ้ำ | แสดง "Username already taken" |
| E02 | Phone number format ผิด | แสดง validation error |
| E03 | พยายามแก้ Email | Field Email disabled + "Email cannot be changed after verification" |

---

### UC-SETTING-002: เปลี่ยนภาษา

**Actor:** ผู้ใช้ที่ Login แล้ว

#### Happy Path
1. Settings → Language
2. เลือก "ภาษาไทย" หรือ "English"
3. แอปเปลี่ยนภาษาทันที

---

### UC-SETTING-003: Sign Out

**Actor:** ผู้ใช้ที่ Login แล้ว

#### Happy Path
1. Settings → Sign Out
2. Dialog "Log out — Do you want to log out?"
3. กด "Log out" → กลับสู่หน้า Sign In
4. JWT Token ถูก Invalidate

#### Error Cases
| ID | เงื่อนไข | ผลลัพธ์ |
|---|---|---|
| E01 | กด "Cancel" | ยกเลิก ยังอยู่ในแอป |

---

### UC-SETTING-004: ลบบัญชี

**Actor:** ผู้ใช้ที่ Login แล้ว

#### Happy Path
1. Settings → About your account → Account management
2. กด "Delete account" → 2-page flow (terms → เลือก reason → กรอก password → scheduled)
3. ระบบ schedule deletion, revoke session และ clear local token ทันที → กลับ session `guest` (S-27)
4. เริ่มนับ grace period 30 วัน — sign in ระหว่าง grace = **login-to-restore** (S-02 — คืนบัญชี) ก่อนระบบ hard delete/anonymization

#### Error Cases
| ID | เงื่อนไข | ผลลัพธ์ |
|---|---|---|
| E01 | Password ยืนยันผิด | แสดง "Incorrect password" |
| E02 | API fail | ไม่ revoke session, ไม่ sign out และแสดง retry/error state |
| E03 | Sign in ระหว่าง grace period | คืนบัญชี (login-to-restore — ไม่ใช่ blocked) |

---

## Appendix: Test Case Summary

### ประเภท Test Case ที่ต้องครอบคลุม

| ประเภท | คำอธิบาย |
|---|---|
| **Positive Test** | Input ถูกต้อง → ผลลัพธ์ตามที่คาดหวัง |
| **Negative Test** | Input ผิด → Error Message ที่เหมาะสม |
| **Boundary Test** | ค่าขอบเขต เช่น Password 8 ตัวพอดี, รูป 10 รูปพอดี |
| **Concurrency Test** | 2 User ทำงานพร้อมกัน เช่น กด Like Asset เดียวกันพร้อมกัน |
| **Network Test** | ออฟไลน์, Connection ช้า, Timeout |
| **Session Test** | Token หมดอายุ, Login หลาย Device |
| **Permission Test** | ผู้ใช้ที่ไม่มีสิทธิ์ Access ข้อมูลของคนอื่น |
