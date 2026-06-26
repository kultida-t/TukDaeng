# Use Cases — แอปพลิเคชัน ตึกแดง (Tuk Daeng)
**เวอร์ชัน:** 1.0  
**วันที่:** พฤษภาคม 2568  
**ครอบคลุม:** FO (Front Office) ทุก Flow พร้อม Happy Path และ Error Cases

---

## หมายเหตุเรื่อง Role ผู้ใช้

> ผู้ใช้ทุกคนในระบบมี **Role เดียวกัน** ไม่มีการแบ่งประเภท Buyer / Seller / Collector  
> ผู้ใช้คนเดียวสามารถทำได้ทุกอย่าง: ลงขายสินทรัพย์, ซื้อ/เสนอราคาสินทรัพย์ของคนอื่น, แสดงคอลเลกชัน หรือซ่อนไว้ส่วนตัว  
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
4. [Asset Detail Use Cases](#4-asset-detail)
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
1. ผู้ใช้กรอก Email, Password, Confirm Password
2. ผู้ใช้ติ๊ก "I agree to Terms of Use and Privacy Policy"
3. กด "Sign up"
4. ระบบส่ง OTP 6 หลักไปยัง Email
5. ผู้ใช้กรอก OTP บนหน้า Verify Email
6. ระบบยืนยัน OTP ถูกต้อง
7. แสดงหน้า "Email verified — Your account is ready"
8. กด "Get started" → เข้าสู่แอป

#### Error Cases
| ID | เงื่อนไข | ผลลัพธ์ |
|---|---|---|
| E01 | Email ซ้ำในระบบ | แสดง "This email is already registered" |
| E02 | Email format ไม่ถูกต้อง | แสดง "Invalid email format" |
| E03 | Password < 8 ตัวอักษร | แสดง "At least 8 characters, with a number or symbol" |
| E04 | Password ไม่ตรงกัน | แสดง "Passwords do not match" |
| E05 | ไม่ติ๊ก Terms | ปุ่ม Sign up ไม่ Active |
| E06 | OTP ผิด | แสดง "Incorrect code, please try again" |
| E07 | OTP หมดอายุ | แสดง "Code expired" + ปุ่ม Resend |
| E08 | กด Resend เร็วเกินไป | แสดง Countdown ก่อน Resend ได้อีกครั้ง |

---

### UC-AUTH-002: สมัครสมาชิกด้วย Apple

**Actor:** ผู้ใช้ใหม่ (iOS เท่านั้น)  
**Precondition:** ไม่ได้ Login อยู่, ใช้งานบนอุปกรณ์ iOS

#### Happy Path
1. กด "Sign up with Apple"
2. ระบบแสดง Native Apple Sign In Dialog
3. ผู้ใช้เลือกว่าจะแชร์ Email จริง หรือใช้ Private Relay Email ของ Apple
4. ยืนยันด้วย Face ID / Touch ID / Passcode
5. ผู้ใช้ติ๊ก "I agree to Terms of Use and Privacy Policy"
6. ระบบสร้างบัญชีอัตโนมัติ → เข้าสู่แอป (ไม่ต้องยืนยัน OTP)

#### Error Cases
| ID | เงื่อนไข | ผลลัพธ์ |
|---|---|---|
| E01 | Email (จริงหรือ Relay) ซ้ำกับบัญชีที่มีอยู่แล้ว | แสดง "An account with this email already exists. Please sign in instead." |
| E02 | ผู้ใช้กด Cancel บน Apple Dialog | กลับสู่หน้า Sign up |
| E03 | ไม่ติ๊ก Terms | ปุ่ม Sign up ไม่ Active |
| E04 | Apple Service ไม่ตอบสนอง | แสดง "Unable to connect to Apple. Please try again." |

---

### UC-AUTH-003: สมัครสมาชิกด้วย Google

**Actor:** ผู้ใช้ใหม่

#### Happy Path
1. กด "Sign up with Google"
2. เลือก Google Account
3. ผู้ใช้ติ๊ก "I agree to Terms of Use and Privacy Policy"
4. ระบบสร้างบัญชีอัตโนมัติ → เข้าสู่แอป (ไม่ต้องยืนยัน OTP)

#### Error Cases
| ID | เงื่อนไข | ผลลัพธ์ |
|---|---|---|
| E01 | Email Google ซ้ำกับบัญชีที่มีอยู่แล้ว | แสดง "An account with this email already exists. Please sign in instead." |
| E02 | ยกเลิกการเลือก Google Account | กลับสู่หน้า Sign up |
| E03 | ไม่ติ๊ก Terms | ปุ่ม Sign up ไม่ Active |

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
4. ระบบส่ง Email พร้อมลิงก์
5. ผู้ใช้กดลิงก์ → หน้า Create new password
6. กรอก New Password + Confirm New Password
7. กด "Save password"
8. แสดงหน้า "Password updated" → กด "Sign in"

#### Error Cases
| ID | เงื่อนไข | ผลลัพธ์ |
|---|---|---|
| E01 | Email ไม่มีในระบบ | แสดง "If this email exists, a reset link has been sent." (ไม่บอกว่ามีหรือไม่) |
| E02 | Email format ผิด | แสดง "Invalid email format" |
| E03 | ลิงก์หมดอายุ (>30 นาที) | แสดง "Reset link has expired. Please request a new one." |
| E04 | Password ใหม่ไม่ตรงกัน | แสดง "Passwords do not match" |
| E05 | Password ใหม่ < 8 ตัว | แสดง validation error |

---

## 2. Feed

---

### UC-FEED-001: ดู Feed หน้าหลัก

**Actor:** ผู้ใช้ที่ Login แล้ว

#### Happy Path
1. เปิดแอป → แสดงหน้า Feed Tab "All"
2. เห็นรายการสินทรัพย์ (นาฬิกา) เรียงตาม Newest
3. Scroll ลงเพื่อโหลดเพิ่มเติม (Infinite Scroll)

#### Error Cases
| ID | เงื่อนไข | ผลลัพธ์ |
|---|---|---|
| E01 | ไม่มีอินเทอร์เน็ต | แสดงข้อมูล Cache พร้อม Banner "You're offline" |
| E02 | API error | แสดง "Unable to load feed. Pull to refresh." |
| E03 | Tab "Following" ยังไม่ Follow ใคร | แสดง Empty State + ปุ่ม "Explore sellers" |
| E04 | Tab "Favorites" ยังไม่มี Like | แสดง Empty State "No favorites yet" |

---

### UC-FEED-002: Like / Unlike สินทรัพย์

**Actor:** ผู้ใช้ที่ Login แล้ว

#### Happy Path
1. กดไอคอนหัวใจบนการ์ดสินทรัพย์
2. ไอคอนเปลี่ยนเป็นสีแดง (Liked)
3. นาฬิกาเพิ่มใน Tab Favorites

#### Error Cases
| ID | เงื่อนไข | ผลลัพธ์ |
|---|---|---|
| E01 | กด Like สินทรัพย์ของตัวเอง | อนุญาต (แต่ไม่นับ Notification) |
| E02 | API fail | แสดง Toast error, rollback icon กลับสถานะเดิม |

---

### UC-FEED-003: Follow / Unfollow ผู้ขาย

**Actor:** ผู้ใช้ที่ Login แล้ว

#### Happy Path (Follow)
1. กดปุ่ม "Follow" บนการ์ดสินทรัพย์
2. ปุ่มเปลี่ยนเป็น "Following"
3. สินทรัพย์ของผู้ขายคนนี้ปรากฏใน Tab Following

#### Happy Path (Unfollow)
1. กดปุ่ม "Following"
2. Confirm "Unfollow?"
3. ปุ่มเปลี่ยนกลับเป็น "Follow"

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
1. กดไอคอนค้นหา
2. พิมพ์ Keyword (เช่น "Rolex")
3. Autocomplete แสดงตัวเลือก: "Rolex — All listings", "Rolex Datejust", "Rolex GMT-Master II"
4. เลือก Suggestion หรือ กด Enter
5. แสดงผลลัพธ์พร้อมจำนวน "256 results"

#### Error Cases
| ID | เงื่อนไข | ผลลัพธ์ |
|---|---|---|
| E01 | ไม่พบผลลัพธ์ | แสดง "No results found for '[keyword]'" |
| E02 | Keyword สั้นเกิน (< 2 ตัว) | ไม่แสดง Autocomplete |

---

### UC-SEARCH-002: กรองข้อมูลด้วย Filter

**Actor:** ผู้ใช้ทุกคน

#### Happy Path
1. กดปุ่ม "Filter (n)" บนหน้า Search
2. เลือก Category: Brand Name → เลือก "Rolex", "Omega"
3. เลือก Price: ตั้ง Max ที่ ฿500,000
4. กด "Apply Filters"
5. แสดง Chip Filter ที่เลือกไว้ด้านบน
6. ผลลัพธ์อัปเดตทันที

#### Error Cases
| ID | เงื่อนไข | ผลลัพธ์ |
|---|---|---|
| E01 | Min Price > Max Price | แสดง "Minimum price cannot exceed maximum price" |
| E02 | Filter ผสมกันแล้วไม่มีผล | แสดง Empty State + ปุ่ม "Clear filters" |

---

### UC-SEARCH-003: บันทึก Watch Alert จาก Search

**Actor:** ผู้ใช้ที่ Login แล้ว

#### Happy Path
1. ตั้ง Filter (เช่น Brand: Rolex)
2. กดปุ่ม "Save to Watch Alert"
3. กรอกชื่อ Alert (เช่น "Rolex")
4. เปิด Notification Toggle
5. กด "Save this search"
6. แสดง Confirmation: "Thank you! Your search has been saved..."
7. Alert ปรากฏใน Alerts > Watch Alerts

#### Error Cases
| ID | เงื่อนไข | ผลลัพธ์ |
|---|---|---|
| E01 | ไม่กรอกชื่อ Alert | บันทึกด้วยชื่อ Default "Watch Alert on DD/MM/YY" |
| E02 | Alert ซ้ำ Criteria เดิม | แสดง "A similar alert already exists. Create anyway?" |

---

## 4. Asset Detail

---

### UC-DETAIL-001: ดูรายละเอียดสินทรัพย์ (Viewer — ผู้ใช้ที่ไม่ใช่เจ้าของ)

**Actor:** ผู้ใช้ที่ Login แล้ว และไม่ใช่เจ้าของสินทรัพย์ชิ้นนั้น
**Precondition:** สินทรัพย์มีสถานะ Sale หรือ Collection Show เท่านั้น (Hide และ Sold ไม่ปรากฏใน Feed และไม่สามารถเข้าถึงได้)

#### Happy Path
1. กดรายการสินทรัพย์จาก Feed
2. เห็น Gallery รูปภาพ (Swipe ซ้าย-ขวา)
3. เห็น Badge สถานะ: Sale หรือ Collection Show
4. อ่าน Description, Technical Specs
5. อ่านและ Like Comments
6. เห็นราคา + ปุ่ม "Make an Offer" และ "Contact seller"
7. เห็นชื่อเจ้าของ + ปุ่ม Follow

#### Error Cases
| ID | เงื่อนไข | ผลลัพธ์ |
|---|---|---|
| E01 | เข้า URL ตรงของสินทรัพย์ที่ถูก Hide | แสดง "This item is not available" |
| E02 | เข้า URL ตรงของสินทรัพย์ที่ Sold แล้ว | แสดง "This item has been sold" |

---

### UC-DETAIL-001B: ดูรายละเอียดสินทรัพย์ (Owner — ผู้ใช้ที่เป็นเจ้าของ)

**Actor:** ผู้ใช้ที่ Login แล้ว และเป็นเจ้าของสินทรัพย์ชิ้นนั้น
**Precondition:** เจ้าของเห็นสินทรัพย์ได้ทุกสถานะ (Sale, Collection Show, Collection Hide, Sold)

#### Happy Path
1. กดสินทรัพย์จาก Profile ของตัวเอง (ทุก Tab)
2. เห็น Gallery รูปภาพ
3. เห็น Badge สถานะจริงของสินทรัพย์ (Sale / Collection Show / Collection Hide / Sold)
4. อ่าน Description, Technical Specs, Comments
5. ไม่เห็นปุ่ม Follow (ไม่ Follow ตัวเอง)
6. เห็นปุ่ม Action ตามสถานะ:

| สถานะ | ปุ่มที่แสดง |
|---|---|
| Sale | `Edit` |
| Collection Show | `Edit` |
| Collection Hide | `Edit` |
| Sold | `Sale History` |

#### Error Cases
| ID | เงื่อนไข | ผลลัพธ์ |
|---|---|---|
| E01 | กด "Sale History" บนสินทรัพย์ที่ยังไม่มีข้อมูลการขาย | แสดง "No sale history recorded" |

---

### UC-DETAIL-002: ส่ง Offer

**Actor:** ผู้ใช้ที่ Login แล้ว และไม่ใช่เจ้าของ

#### Happy Path
1. กด "Make an Offer"
2. กรอกราคา (THB)
3. กรอก Message (ตัวเลือก)
4. กด "Send offer"
5. แสดง Popup "Offer Sent Successfully"
6. กด "Go to chat" → เข้าห้องแชทกับผู้ขาย

#### Error Cases
| ID | เงื่อนไข | ผลลัพธ์ |
|---|---|---|
| E01 | ไม่กรอกราคา | ปุ่ม Send offer ไม่ Active |
| E02 | ราคาเป็น 0 หรือติดลบ | แสดง "Please enter a valid offer amount" |
| E03 | ส่ง Offer สินทรัพย์ที่ขายแล้ว | แสดง "This item is no longer available" |
| E04 | ส่ง Offer ซ้ำในขณะที่ Offer เดิมยังรอ | แสดง "You already have a pending offer. Go to chat to view it." |

---

### UC-DETAIL-003: Comment บนสินทรัพย์

**Actor:** ผู้ใช้ที่ Login แล้ว

#### Happy Path
1. พิมพ์ Comment ในช่องด้านล่าง
2. กด Send
3. Comment ปรากฏทันที

#### Error Cases
| ID | เงื่อนไข | ผลลัพธ์ |
|---|---|---|
| E01 | Comment ว่าง | ปุ่ม Send ไม่ Active |
| E02 | Comment ยาวเกิน 500 ตัวอักษร | แสดง Character Counter สีแดง |

---

## 5. Asset Management

---

### UC-ASSET-001: เพิ่มสินทรัพย์ใหม่

**Actor:** ผู้ใช้ที่ Login แล้ว (เจ้าของ)

#### Happy Path
1. กดปุ่ม "+" บน Feed หรือ Profile
2. อัปโหลดรูปภาพ (อย่างน้อย 1 รูป)
3. กรอก Basic Information ครบ
4. เลือก Condition
5. เลือก Scope of Delivery
6. กรอก Specifications
7. กรอก Commerce & Curation (ราคา + Description)
8. เลือก Status (Sale / Show / Hide)
9. (ตัวเลือก) กรอก Provenance
10. กด "Save"
11. Confirm Dialog "Are you sure you want to save edit asset?"
12. กด "Confirm" → สินทรัพย์ปรากฏใน Profile

#### Error Cases
| ID | เงื่อนไข | ผลลัพธ์ |
|---|---|---|
| E01 | ไม่อัปโหลดรูปภาพ | แสดง "Please add at least 1 photo" |
| E02 | ไม่กรอก Brand | แสดง "Brand is required" |
| E03 | ไม่กรอก Model | แสดง "Model is required" |
| E04 | Status = Sale แต่ไม่กรอกราคา | แสดง "Price is required for Sale status" (ยกเว้น Price on Request) |
| E05 | อัปโหลดรูปเกิน 10 รูป | ปุ่มเพิ่มรูปหายไปเมื่อครบ 10 |
| E06 | รูปภาพ format ไม่รองรับ | แสดง "Only JPG, PNG supported" |
| E07 | รูปภาพขนาดเกิน 10MB | แสดง "Image size must not exceed 10MB" |

---

### UC-ASSET-002: แก้ไขสินทรัพย์

**Actor:** เจ้าของสินทรัพย์
**Precondition:** สินทรัพย์ต้องมีสถานะ Sale, Collection Show หรือ Collection Hide เท่านั้น (Sold ไม่สามารถ Edit ได้)

#### Happy Path
1. เข้าหน้า Detail Asset (ในฐานะเจ้าของ) → กดปุ่ม "Edit"
2. แก้ไขข้อมูลที่ต้องการ
3. กด "Save" → Confirm → บันทึกสำเร็จ

#### Error Cases
- เหมือน UC-ASSET-001 ทุก Error Case

---

### UC-ASSET-002B: ดู Sale History

**Actor:** เจ้าของสินทรัพย์
**Precondition:** สินทรัพย์มีสถานะ **Sold** เท่านั้น

#### Happy Path
1. เข้าหน้า Detail Asset ของสินทรัพย์ที่มีสถานะ Sold
2. เห็นปุ่ม "Sale History" (แทนปุ่ม Edit)
3. กด "Sale History"
4. แสดงรายละเอียดการขาย:
   - ชื่อผู้ซื้อ (Buyer Name)
   - เบอร์โทรและช่องทางติดต่อผู้ซื้อ
   - ราคาที่ขาย (Sale Price THB)
   - วันที่ขาย (Sale Date)
   - วิธีชำระเงิน (Payment Method)
   - รูปภาพ Equipment & Accessories
   - รูปภาพ Proof of Payment

#### Error Cases
| ID | เงื่อนไข | ผลลัพธ์ |
|---|---|---|
| E01 | ยังไม่ได้บันทึก Sale History (Sold แต่ไม่มีข้อมูล) | แสดง "No sale history recorded" + ปุ่ม "Add Sale History" |
| E02 | Viewer (ไม่ใช่เจ้าของ) พยายามเข้าถึง Sale History | ไม่แสดงปุ่ม "Sale History" / API ปฏิเสธ Request (403) |

---

### UC-ASSET-003: เปลี่ยน Status สินทรัพย์

**Actor:** เจ้าของสินทรัพย์

#### Happy Path
1. Edit Asset → เปลี่ยน Status เป็น "Hide"
2. กด Save → Confirm
3. สินทรัพย์หายจาก Feed/Marketplace ของผู้อื่น

#### Error Cases
| ID | เงื่อนไข | ผลลัพธ์ |
|---|---|---|
| E01 | เปลี่ยนเป็น "Sold" แต่ยังมี Pending Offer | แสดง "There are pending offers. Accept or decline them first." |

---

### UC-ASSET-004: บันทึก Sale History

**Actor:** เจ้าของสินทรัพย์

#### Happy Path
1. Edit Asset → Add Sale History
2. กรอก Buyer Name, Phone, Contact
3. กรอก Sale Price (THB)
4. เลือก Sale Date, Payment Method
5. (ตัวเลือก) อัปโหลด Equipment & Accessories รูปภาพ
6. (ตัวเลือก) อัปโหลด Proof of Payment
7. กด "Save" → Confirm → บันทึกสำเร็จ
8. Status เปลี่ยนเป็น "Sold" อัตโนมัติ

#### Error Cases
| ID | เงื่อนไข | ผลลัพธ์ |
|---|---|---|
| E01 | Sale Price = 0 หรือว่าง | แสดง validation error |
| E02 | ไม่เลือก Payment Method | แสดง "Payment method is required" |

---

### UC-ASSET-005: เพิ่ม Provenance

**Actor:** เจ้าของสินทรัพย์

#### Happy Path
1. ระหว่าง Add/Edit Asset กด "Provenance"
2. กรอก Purchase Price, Purchase Date, Purchase From
3. อัปโหลดรูป Equipment & Accessories (สูงสุด 3 รูป)
4. อัปโหลดรูป Proof of Payment (สูงสุด 3 รูป)
5. กรอก Note
6. กด "Save" → Confirm

---

### UC-ASSET-006: เพิ่ม Consignment (ฝากขาย)

**Actor:** เจ้าของ/ผู้ดูแล

#### Happy Path
1. Add Asset → กด Tab "Consignment"
2. กรอก Full Name, Phone Number, Line/IG/Facebook
3. เลือก Consignment Date (Date Picker)
4. กรอก Asking Price
5. ตั้ง Commission % (0–100)
6. Toggle "Price Negotiable"
7. อัปโหลด Documentation
8. กด "Save" → Confirm

#### Error Cases
| ID | เงื่อนไข | ผลลัพธ์ |
|---|---|---|
| E01 | Commission > 100 | แสดง "Commission cannot exceed 100%" |
| E02 | Phone number format ผิด | แสดง "Invalid phone number" |

---

## 6. Chat

---

### UC-CHAT-001: ดูรายการแชท

**Actor:** ผู้ใช้ที่ Login แล้ว

#### Happy Path
1. กด Tab "Chat"
2. แสดงรายการแชทล่าสุด (เรียงตามเวลา)
3. Tab "Incoming Offers" แสดงการเสนอราคาที่รอตอบรับ

---

### UC-CHAT-002: ส่งข้อความ

**Actor:** ผู้ใช้ที่ Login แล้ว

#### Happy Path
1. เลือกห้องแชท
2. พิมพ์ข้อความ
3. กด Send
4. ข้อความปรากฏทันทีฝั่งขวา

#### Error Cases
| ID | เงื่อนไข | ผลลัพธ์ |
|---|---|---|
| E01 | ข้อความว่าง | ปุ่ม Send ไม่ Active |
| E02 | ไม่มีอินเทอร์เน็ต | แสดงไอคอน Error ข้าง Message + ปุ่ม Retry |

---

### UC-CHAT-003: ส่งรูปภาพ/ไฟล์

**Actor:** ผู้ใช้ที่ Login แล้ว

#### Happy Path
1. กดไอคอน Attachment
2. เลือก Camera / Gallery / File
3. อัปโหลดและส่ง

#### Error Cases
| ID | เงื่อนไข | ผลลัพธ์ |
|---|---|---|
| E01 | ไฟล์ขนาดเกิน 20MB | แสดง "File too large (max 20MB)" |
| E02 | Upload fail | แสดง "Failed to send. Tap to retry." |

---

### UC-CHAT-004: ตอบรับ/ปฏิเสธ Offer (ผู้ขาย)

**Actor:** เจ้าของสินทรัพย์

#### Happy Path (Accept)
1. เห็น Offer Card ในห้องแชท
2. กด "Accept"
3. แสดงสถานะ "Offer Accepted — The buyer has been notified"
4. ผู้ซื้อได้รับ Notification

#### Happy Path (Decline)
1. กด "Decline"
2. แสดงสถานะ "Offer Declined — The buyer has been notified"

#### Error Cases
| ID | เงื่อนไข | ผลลัพธ์ |
|---|---|---|
| E01 | Offer ถูก Accept/Decline ไปแล้วโดยอุปกรณ์อื่น | แสดง "This offer has already been processed" |
| E02 | สินทรัพย์ถูก Mark ว่า Sold แล้ว | ปุ่ม Accept/Decline ถูก Disable |

---

### UC-CHAT-005: ลบแชท

**Actor:** ผู้ใช้ที่ Login แล้ว

#### Happy Path
1. Long Press บนรายการแชท หรือกด "..." > Delete
2. Dialog "Are you sure you want to delete this chat?"
3. กด "Delete" → แชทหายจากรายการ

#### Error Cases
| ID | เงื่อนไข | ผลลัพธ์ |
|---|---|---|
| E01 | กด "Cancel" | ยกเลิก ไม่มีการลบ |

---

### UC-CHAT-006: Decline Offer จาก Tab Incoming Offers (ผู้ขาย)

**Actor:** เจ้าของสินทรัพย์

#### Happy Path
1. ไปที่ Chat → Tab "Incoming Offers"
2. เห็น Offer Card พร้อมราคา, ชื่อผู้เสนอ, วันที่
3. กด "Decline" บน Offer Card
4. Offer ถูก Decline → ย้ายออกจาก Tab Incoming Offers
5. ผู้ซื้อได้รับ Notification "Your offer was declined"

---

## 7. Board

---

### UC-BOARD-001: อ่านบทความ

**Actor:** ผู้ใช้ทุกคน (รวม Guest ที่ไม่ Login)

#### Happy Path
1. กด Tab "Board"
2. เลือกบทความ
3. อ่านเนื้อหา
4. กด Like หรือ Share

#### Error Cases
| ID | เงื่อนไข | ผลลัพธ์ |
|---|---|---|
| E01 | บทความถูก Unpublish โดย Admin | แสดง "This article is no longer available" |
| E02 | ไม่มีอินเทอร์เน็ต | แสดงบทความจาก Cache ถ้ามี |

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
1. กดหมวดหมู่จาก Sidebar (เช่น "Rolex")
2. แสดงบทความในหมวดนั้นทั้งหมด

---

## 8. Alerts & Notifications

---

### UC-ALERT-001: ดูการแจ้งเตือน

**Actor:** ผู้ใช้ที่ Login แล้ว

#### Happy Path
1. กด Tab "Alerts"
2. แสดงรายการแจ้งเตือนเรียงตามเวลาล่าสุด
3. แจ้งเตือน New Offer มีปุ่ม "Review offer" และ "Decline"

---

### UC-ALERT-002: ตอบสนองต่อ Notification Offer

**Actor:** เจ้าของสินทรัพย์

#### Happy Path
1. เห็น Notification "New Offer: THB 1,100,000"
2. กด "Review offer" → เข้าห้องแชทที่มี Offer นั้น
3. กด "Decline" → Decline ทันทีจาก Notification

---

### UC-ALERT-003: จัดการ Watch Alert

**Actor:** ผู้ใช้ที่ Login แล้ว

#### Happy Path (Rename)
1. เข้า Watch Alert Management
2. กด "Rename" บน Alert
3. แก้ชื่อ → กด "Save"

#### Happy Path (Delete)
1. กดไอคอน Trash
2. Dialog "Are you sure you want to delete this watch alert?"
3. กด "Delete" → Alert ถูกลบ

#### Happy Path (Toggle Notification)
1. Toggle "Notifications" → Off
2. ไม่รับ Push Notification จาก Alert นี้ (แต่ยังค้นหาได้เอง)

#### Error Cases
| ID | เงื่อนไข | ผลลัพธ์ |
|---|---|---|
| E01 | กด Cancel ตอน Delete | ยกเลิก Alert ยังอยู่ |
| E02 | ชื่อ Alert ว่าง | ไม่ Save พร้อมแสดง "Name is required" |

---

## 9. Profile

---

### UC-PROFILE-001: ดูโปรไฟล์ตัวเอง (Owner View)

**Actor:** ผู้ใช้ที่ Login แล้ว

#### Happy Path
1. กด Tab "Profile"
2. เห็นรูปโปรไฟล์, ชื่อ, สถิติ (Followers, Following, Asset Value รวม)
3. เห็นแท็บครบทุกสถานะ:
   - **All** → สินทรัพย์ทุกชิ้น ทุกสถานะ
   - **For Sale** → สินทรัพย์สถานะ Sale
   - **Collection Show** → สินทรัพย์สถานะ Collection Show
   - **Collection Hide** → สินทรัพย์สถานะ Collection Hide (เห็นเฉพาะตัวเอง)
   - **Sold** → สินทรัพย์ที่ขายไปแล้ว
   - **Asset Value** → Dashboard มูลค่า
4. กดสินทรัพย์ใด ๆ → เข้า Detail Asset ในฐานะ Owner

#### Error Cases
| ID | เงื่อนไข | ผลลัพธ์ |
|---|---|---|
| E01 | ยังไม่มีสินทรัพย์ใน Tab ใด | แสดง Empty State พร้อมปุ่ม "Add your first asset" |

---

### UC-PROFILE-002: ดูโปรไฟล์ผู้ใช้คนอื่น (Viewer View)

**Actor:** ผู้ใช้ที่ Login แล้ว
**Precondition:** ดูโปรไฟล์ของผู้ใช้คนอื่น ไม่ใช่ตัวเอง

#### Happy Path
1. กดชื่อเจ้าของสินทรัพย์บน Feed หรือ Asset Detail
2. เห็นรูปโปรไฟล์, ชื่อ, สถิติ (Followers, Following)
3. เห็นปุ่ม "Follow" หรือ "Following"
4. เห็นแท็บเฉพาะสถานะสาธารณะ:
   - **For Sale** → สินทรัพย์สถานะ Sale เท่านั้น
   - **Collection Show** → สินทรัพย์สถานะ Collection Show เท่านั้น
5. ไม่เห็น Tab Collection Hide, Sold และ Asset Value

#### Error Cases
| ID | เงื่อนไข | ผลลัพธ์ |
|---|---|---|
| E01 | เจ้าของไม่มีสินทรัพย์ Sale และ Collection Show เลย | แสดง Empty State ทั้งสอง Tab |
| E02 | ดูโปรไฟล์ตัวเอง (กด Link ตรง) | Redirect ไปยังหน้า Profile ตัวเอง (Owner View) แทน |

---

### UC-PROFILE-003: ดู Asset Value Dashboard

**Actor:** เจ้าของ (Profile ตัวเอง)

#### Happy Path
1. กด Tab "Asset Value"
2. เห็นมูลค่ารวม + กราฟ Trend
3. เห็น Brand Distribution
4. เลื่อนดูรายการสินทรัพย์แต่ละชิ้นพร้อมราคาซื้อ/มูลค่าปัจจุบัน/% change

---

## 10. Settings

---

### UC-SETTING-001: แก้ไขโปรไฟล์

**Actor:** ผู้ใช้ที่ Login แล้ว

#### Happy Path
1. เมนู → Edit Profile
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
1. Settings → About → About your account
2. กด "Delete account"
3. Confirm (กรอก Password ยืนยัน)
4. บัญชีถูกลบ ข้อมูลทั้งหมดถูก Archive

#### Error Cases
| ID | เงื่อนไข | ผลลัพธ์ |
|---|---|---|
| E01 | Password ยืนยันผิด | แสดง "Incorrect password" |
| E02 | มี Pending Offer ที่ยังไม่ได้ตอบ | แสดง "Please resolve all pending offers before deleting your account" |

---

## Appendix: Test Case Summary

### ประเภท Test Case ที่ต้องครอบคลุม

| ประเภท | คำอธิบาย |
|---|---|
| **Positive Test** | Input ถูกต้อง → ผลลัพธ์ตามที่คาดหวัง |
| **Negative Test** | Input ผิด → Error Message ที่เหมาะสม |
| **Boundary Test** | ค่าขอบเขต เช่น Password 8 ตัวพอดี, รูป 10 รูปพอดี |
| **Concurrency Test** | 2 User ทำงานพร้อมกัน เช่น Accept Offer พร้อมกัน 2 คน |
| **Network Test** | ออฟไลน์, Connection ช้า, Timeout |
| **Session Test** | Token หมดอายุ, Login หลาย Device |
| **Permission Test** | ผู้ใช้ที่ไม่มีสิทธิ์ Access ข้อมูลของคนอื่น |
