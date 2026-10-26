# PRD — แอปพลิเคชัน ตึกแดง (Tuk Daeng)
**เวอร์ชัน:** 1.0  
**วันที่:** พฤษภาคม 2568  
**เจ้าของเอกสาร:** Business Analyst Team  
**สถานะ:** Draft

> **Sync note (FO-PRD-v1.9, 2026-10-22):** เอกสารนี้เป็น assumption doc เก่า (legacy tier — source ของ master) ที่ sync ตาม `Prototypes/fo-flow/index.html` + master §16 Sync Decision Log — feed post-centric, Member Sheet, Alerts feed 5 types, composer asset mode, Sale Record 2 ฟิลด์, share member-only, ไม่มี `Price on request`/infinite scroll — จุดที่ขัด master/module spec ให้ยึด master/module spec เสมอ

---

## 1. ภาพรวมผลิตภัณฑ์

### 1.1 วิสัยทัศน์
ตึกแดง (Tuk Daeng) คือแพลตฟอร์ม Marketplace และ Community สำหรับนักสะสมนาฬิกาหรูในประเทศไทย ที่รวบรวมฟีเจอร์การซื้อขาย, การแสดงคอลเลกชัน, บทความความรู้, การแจ้งเตือนราคาตลาด และระบบแชทในแอปพลิเคชันเดียว

### 1.2 กลุ่มผู้ใช้เป้าหมาย
| กลุ่ม | คำอธิบาย |
|---|---|
| **ผู้ใช้ (User)** | ทุกคนที่สมัครสมาชิกมี Role เดียวกันหมด สามารถทำได้ทุกอย่างในคนเดียว ทั้งลงขาย, ซื้อ, แสดงคอลเลกชัน หรือจะซ่อนคอลเลกชันไว้ส่วนตัว โดยไม่ต้องเปลี่ยน Role |
| **แอดมิน (Admin)** | ทีมงานตึกแดงที่จัดการระบบผ่าน Back Office เท่านั้น |

> **หมายเหตุ:** คำว่า "Owner" ในเอกสารนี้หมายถึงผู้ใช้ในฐานะเจ้าของสินทรัพย์ชิ้นนั้น ๆ และคำว่า "Viewer" หมายถึงผู้ใช้คนอื่นที่กำลังดูสินทรัพย์ของผู้อื่น ไม่ได้หมายถึง Role ที่แตกต่างกัน

### 1.3 แพลตฟอร์ม
- iOS และ Android (Mobile Application)
- Back Office: Web Application (สำหรับ Admin)

---

## 2. สถาปัตยกรรมฟีเจอร์หลัก

```
ตึกแดง App
├── Auth (ยืนยันตัวตน)
├── Feed (หน้าหลัก post-centric social feed)
├── Chat (ระบบแชท)
├── Board (กระดานข่าว/บทความ editorial magazine)
├── Alerts (Alerts feed — การแจ้งเตือน)
└── Profile (โปรไฟล์ผู้ใช้)
    ├── Asset Management (My Assets drawer + composer)
    ├── Saved / Wish List collections
    └── Portfolio (Total invested dashboard — owner-only)
```

---

## 3. ฟีเจอร์โดยละเอียด

### 3.1 Authentication (ระบบยืนยันตัวตน)

#### 3.1.1 Sign Up (สมัครสมาชิก)
**วิธีการสมัคร 3 ช่องทาง:**

| ช่องทาง | รายละเอียด |
|---|---|
| **Email / Password** | กรอก Email, Password + ยืนยัน OTP |
| **Sign up with Apple** | ใช้ Apple ID (Sign in with Apple) — รองรับบน iOS |
| **Sign up with Google** | ใช้ Google Account |

**ความต้องการ (กรณี Email / Password):**
- ผู้ใช้ต้องกรอก Email, Password
- ต้องยืนยัน Email ด้วย OTP 6 หลักที่ส่งไปยัง Email
- Password ต้องมีความยาวอย่างน้อย 8 ตัวอักษร พร้อมตัวเลขหรือสัญลักษณ์
- Consent เป็น implied (สมัคร = ยอมรับ Terms of Use และ Privacy Policy โดยปริยาย) + optional marketing opt-in + re-consent เมื่อ policy version bump

**Business Rules:**
- 1 Email สามารถสมัครได้เพียง 1 บัญชีเท่านั้น ไม่ว่าจะมาจากช่องทางใด
- หาก Email ของ Apple / Google ซ้ำกับบัญชี Email/Password ที่มีอยู่แล้ว ระบบแสดง error และแนะนำให้ Sign In แทน
- Apple Sign In อาจส่ง Private Relay Email (ที่ Apple สร้างขึ้น) ซึ่งระบบต้องรองรับ
- Email จาก SSO (Apple / Google) ไม่ต้องผ่านขั้นตอนยืนยัน OTP
- Email ไม่สามารถเปลี่ยนได้หลังยืนยันแล้ว
- หากไม่ได้รับ OTP (กรณี Email/Password) สามารถ Resend ได้

#### 3.1.2 Sign In (เข้าสู่ระบบ)
**วิธีการเข้าสู่ระบบ 3 ช่องทาง:**

| ช่องทาง | รายละเอียด |
|---|---|
| **Email / Password** | กรอก Email และ Password |
| **Sign in with Apple** | ใช้ Apple ID — รองรับบน iOS (Apple Guideline บังคับต้องมีหากแอปมี SSO อื่น) |
| **Sign in with Google** | ใช้ Google Account |

**ความต้องการ (กรณี Email / Password):**
- กรอก Email และ Password
- กรณีลืมรหัสผ่านกดที่ "Forgot password?"
- ปุ่ม Sign In จะ Active เมื่อกรอก Email และ Password แล้วเท่านั้น

**Business Rules:**
- กรณี Email หรือ Password ผิด แสดง error ใต้ช่อง Password ว่า "Incorrect email or password" พร้อม Highlight ขอบ Field สีแดง
- บัญชีที่สมัครด้วย Apple / Google ไม่สามารถ Sign In ด้วย Email/Password ได้ (และในทางกลับกัน) — ระบบแนะนำช่องทางที่ถูกต้อง
- บัญชีที่ถูก Suspend จะเห็น error แจ้งเหตุผลและช่องทางติดต่อ Support

#### 3.1.3 Forgot Password (ลืมรหัสผ่าน)
**ความต้องการ:**
- กรอก Email เพื่อรับลิงก์รีเซ็ต
- แสดงข้อความกลาง `If this email exists, a reset link has been sent.` — ไม่เปิดเผยว่าบัญชีมีอยู่หรือเป็น SSO-only
- การตั้งรหัสผ่านใหม่ผ่านลิงก์อยู่นอกขอบเขต FO V1 screens — ไม่มีหน้า Reset Password / Password Updated ในแอป (S-20)

---

### 3.2 Feed (หน้าหลัก — post-centric social feed)

**ความต้องการ:**
- แสดงโพสต์ (post-centric — โพสต์ `sale` ที่ผูก asset + โพสต์ `post` ไม่ผูก asset)
- แบ่ง Tab: ทั้งหมด / กำลังติดตาม / รายการโปรด
- Post card แสดง: media, seller row (Avatar + ชื่อ), caption/spec, ราคา (THB — เฉพาะ sale post), action rail (like / comment / share / save / `...`)
- ปุ่ม Follow บน card เป็น contract-only (prototype render เป็น visual เท่านั้น)
- รองรับการ Like โพสต์ (กดหัวใจ — like count เป็น private เห็นเฉพาะเจ้าของโพสต์, S-26)
- ปุ่ม "Watch Alert" เพื่อตั้งการแจ้งเตือน (shared sheet)
- ปุ่ม "+" เพื่อสร้างโพสต์/สินทรัพย์ใหม่ (composer)
- ไม่มี pull-to-refresh / infinite scroll — render list ครั้งเดียว

**Business Rules:**
- Tab "กำลังติดตาม" แสดงเฉพาะโพสต์จาก seller ที่ผู้ใช้ติดตาม
- Tab "รายการโปรด" = favorite sellers (account-level) — **ไม่ใช่** รายการที่กด Like (liked posts ไป Interested list, D7)
- Asking Price เป็น optional — ถ้าไม่ระบุ **ไม่มี** label ใดแทน (`Price on request` ถูกตัดแล้ว)
- Guest browse ทุก tab ได้โดยไม่ gate (S-16); action ที่ต้องมีตัวตนเจอ Member Sheet

---

### 3.3 Search & Filter (ค้นหาและกรองข้อมูล)

**ความต้องการ:**
- ช่องค้นหาด้วย Keyword พร้อม recent searches + live suggestions (แสดงยี่ห้อ, รุ่น, seller ที่เกี่ยวข้อง)
- ผลลัพธ์ = photo grid → Post Viewer + tabs `For you` / `Profiles` / `Tags`
- ระบบกรองข้อมูลหลายมิติ (`sfilter` — chip multi-select draft pattern, Apply เท่านั้นที่ commit):
  - Brand Name (เลือกหลายยี่ห้อ)
  - Model (เลือกหลายรุ่น — dependent ตาม Brand)
  - Price Range (typed min-max inputs — ไม่มี slider)
  - Year of Production
  - Reference Number
  - Delivery Contents (กล่องต้นฉบับ, เอกสาร)
  - Condition (สภาพ)
  - Case Size
  - Movement
  - Dial Color
  - Strap/Bracelet
- Filter option แสดง `(N)` = จำนวน sale listing — `(0)` เลือกได้
- **ไม่มี result count** บนหน้า results และไม่มี Sort UI ใน FO V1 (S-24)
- ปุ่ม "Apply (n)" และ "Clear all"

**Watch Alert จาก Search:**
- บันทึก Criteria การค้นหาปัจจุบันเป็น Watch Alert ได้ผ่าน shared `Create watch alert` sheet
- ชื่อ auto-fill จาก criteria (แก้ได้) — criteria เป็น snapshot (S-11)
- เลือก match mode: ตรงทุกเงื่อนไข / ตรงเงื่อนไขใดเงื่อนไขหนึ่ง / เฉพาะรุ่น

---

### 3.4 Post Detail (หน้ารายละเอียดโพสต์ — เดิมเรียก Detail Asset)

#### สำหรับผู้ดู (Viewer — ผู้ใช้คนอื่นที่ไม่ใช่เจ้าของ)
**ความต้องการ:**
- Hero media + action row (like / comment / share / save / `...`)
- สถานะที่มองเห็นได้: **Sale** และ **Show** เท่านั้น (ไม่เห็น Hide และ Sold)
- ชื่อ Brand, Model, Reference No.
- คำอธิบาย (caption) + spec chips:
  - Brand, Model, Reference No., Year of Production
  - Condition, Delivery Contents
  - Case Size, Thickness, Case Material
  - Movement, Dial Color, Dial / Strap Type
- Comments ผ่าน shared comments sheet (emoji quick-react — ไม่มี inline composer)
- ราคา THB + ปุ่ม `Ask Seller` (เฉพาะ sale post — chat entry listing-scoped)
- กดชื่อเจ้าของ → Public Profile + Follow

#### สำหรับเจ้าของ (Owner — ผู้ใช้ที่เป็นเจ้าของโพสต์นั้น)
**ความต้องการ:**
- มองเห็นโพสต์/asset ได้ **ทุกสถานะ** ไม่ว่าจะเป็น Sale, Show, Hide, **Sold** และ kind `post`
- ไม่แสดงปุ่ม Follow (ไม่ Follow ตัวเอง)
- own-post `...` menu: `Edit info` (เปลี่ยน `Profile status` เมื่อ drawer ON), `Mark as sold` (sale/show/hide), `View sale record` (sold), `Delete`

> **Business Rule:** โพสต์ที่มีสถานะ Sold ไม่สามารถ Edit ข้อมูลหลักได้อีก มีเพียง `View sale record` สำหรับดู Sale Record (ราคาขาย + วันที่ขายเท่านั้น — D3)

---

### 3.5 Asset Management (จัดการสินทรัพย์ — My Assets drawer + composer)

#### 3.5.1 Add New Asset (composer asset mode — drawer-first)
**ความต้องการ:**
- Composer asset mode (drawer-first — สร้าง drawer record ทุกเส้นทาง; ไม่ใช่ multi-step listing form)
- Gallery: เลือกรูปได้สูงสุด 10 รูป — **required เดียวคือ media ≥1 รูป** (`Add Asset` disabled จนกว่ามี media; ไม่มี required matrix ต่อ status)
- Caption + spec fields เป็น free-text (ไม่มี Market Data autocomplete / option-master dropdown — S-25): Brand, Model, Reference No., Year, Condition, Delivery, Case Size, Thickness, Case Material, Movement, Dial Color, Strap/Bracelet Type
- Asking Price (`Add price` pane): optional ทุก status — ถ้ากรอกต้องเป็นตัวเลขมากกว่า 0; **ไม่มี `Price on request` label**
- `Cost details (private)` row: Purchase Price (THB; เมื่อกรอกต้องมากกว่า 0), Purchase Date (ต้องไม่เป็นวันอนาคต) — owner-private เห็นเฉพาะ Owner/Admin ใช้เป็น input ของ Portfolio `Total invested`
- Visibility pick: `Show` (default) / `Hide` / `Post to feed` + `Also save to My Assets` toggle (post mode)
- Save: กด `Add Asset` แล้วสร้าง drawer record + toast ตาม visibility — **ไม่มี confirmation dialog** (S-25)
- ไม่มี Provenance / Consignment entity ใน FO V1 (S-25)

#### 3.5.2 Edit info / Status
- แก้ไขผ่าน own-post `...` menu → `Edit info` (composer step 2 prefilled)
- เปลี่ยน Status ผ่าน `Profile status` pick (ขาย/โชว์/ซ่อน) เมื่อ drawer toggle ON
- `Sold` เข้าได้ผ่าน `Mark as sold` เท่านั้น — Sale Record = `Sale price` + `Sale date` (required ทั้งคู่; D3 — ไม่มี Buyer/Contact/Payment Method/Attachment/Note)
- Delete เกิดที่ post level — `Delete post?` dialog → โพสต์หายทุก surface ไม่มี restore UI

---

### 3.6 Chat (ระบบแชท)

**ความต้องการ:**
- Member-only — thread ผูก user + item (listing): seller เดิมคนละโพสต์ = ห้องแยก (S-07); entry ผ่าน `Ask Seller` บน sale post → draft room + Quick Ask prefill
- ค้นหาแชทได้ (list-level + in-room)
- ในห้องแชท:
  - แสดง post reference card (snapshot) ที่เกี่ยวข้อง — กดไป Post Detail
  - ส่ง Text + รูปภาพ (media message) เท่านั้น — **ไม่มี File / Asset Card message**
  - Swipe บนรายการแชท → pin / mute / hide / delete
- Hide/Delete Chat: ยืนยัน dialog ก่อนดำเนินการ — ซ่อนห้องจาก inbox ฝั่งผู้กดเท่านั้น ไม่ลบประวัติฝั่ง server หรือคู่สนทนา ไม่มี restore UI
- Chat room menu (`chmenu`) = 4 circular actions: Mute/Unmute, Profile, Block/Unblock, Report (+ `Photos & videos`, `Listings & Items`)
- Block → ห้องเป็น read-only (`You blocked this account` + `Unblock`)

---

### 3.7 Board (กระดานข่าว/บทความ)

**ความต้องการ:**
- หน้าหลัก Board = editorial magazine model (S-01):
  - Hero featured carousel ≤5 บทความ
  - Latest list + freeform category tags (ตัด 7 master sections เดิม)
- หน้าอ่านบทความ:
  - รูปปก + ชื่อบทความ + ผู้เขียน + วันที่ + เวลาอ่าน
  - เนื้อหาบทความ
  - ปุ่ม Share และ Like (member-only — guest เจอ Member Sheet, S-03)
- ค้นหาบทความตาม Keyword (surface แยก — live filter)
- Filter ตามหมวดหมู่/tag
- Static list + end note — ไม่มี Infinite Scroll

**Business Rules:**
- บทความถูกสร้างและจัดการโดย Admin ผ่าน Back Office
- ผู้ใช้ทั่วไปอ่านได้เสรี (รวม guest); Share/Like เป็น member-only
- Article Comment ไม่อยู่ใน FO V1
- Report article เป็น contract-only (S-04 — prototype menu dead); spec contract ส่งเข้า Trust & Safety เป็น report type `Board Content` และ target type `Article`
- Report article สำเร็จต้องไม่ทำให้บทความหายทันที

---

### 3.8 Alerts & Notifications (การแจ้งเตือน — Alerts feed)

#### 3.8.1 Alerts feed (member-only)
**ประเภทการแจ้งเตือน 5 types (แบ่งกลุ่ม Today / Yesterday / Last 7 days / Earlier):**
| ประเภท | คำอธิบาย | Action |
|---|---|---|
| Like | มีคนกด Like โพสต์ (aggregate หลาย user) | เปิด Post Viewer ของโพสต์ |
| Comment | มีคนคอมเมนต์โพสต์ | เปิด Post Viewer ของโพสต์ |
| Follow | มีคนติดตาม | เปิด Public Profile + inline Follow back / dismiss |
| Watch Alert | พบ post ตรง Watch Alert | เปิด Post Viewer ของ post ที่ match โดยตรง (S-08) |
| System | system/security row (S-17) | placeholder destination |

- `Mark all as read` + nav badge (cap `99+`)
- Chat/New Message = badge-only ที่เมนู Chat ไม่เข้า Alerts feed

#### 3.8.2 Watch Alert Management
**ความต้องการ:**
- รายการ Watch Alert อยู่ Settings > Your library (`walerts`)
- แต่ละ Alert แสดง: ชื่อ auto-name + criteria snapshot + match mode
- เปิด/ปิด Notification ต่อ Alert ได้
- ชื่อ alert แก้ไขได้ตอนสร้าง (auto-fill)
- Delete Alert = instant delete ทันที (ไม่มี confirmation — S-11)

---

### 3.9 Profile (โปรไฟล์)

#### 3.9.1 Owner Profile (โปรไฟล์ตัวเอง)
**ความต้องการ:**
- รูปโปรไฟล์, ชื่อ, bio, สถิติ (Followers, Following) — **ไม่มี** headline ตัวเลขมูลค่า
- Actions: `pedit` (Edit profile), wallet icon `.pf-pfo` (Portfolio), `+` (composer), `pf-menu`, QR
- แท็บ post grid แยกตามสถานะ (**เจ้าของเห็นทุกสถานะ**):

| แท็บ | โพสต์ที่แสดง |
|---|---|
| **ทั้งหมด** | ทุกชิ้น รวมทุกสถานะ + kind `post` |
| **ขาย** | โพสต์สถานะ Sale |
| **โชว์** | โพสต์สถานะ Show |
| **ซ่อน** | โพสต์สถานะ Hide (เห็นเฉพาะเจ้าของ) |
| **ขายแล้ว** | โพสต์สถานะ Sold |

- Portfolio (wallet icon → `portfolio` dashboard):
  - Headline `Total invested` = Σ Purchase Price (D2 — ไม่ใช่ Total Asset Value) + `ส่วนตัว` tag
  - Market value secondary line + coverage
  - รายการ asset แต่ละชิ้นพร้อมราคาซื้อ/มูลค่าปัจจุบัน/G-L + `Mark as sold`
  - `ประวัติการขาย` → Sold history (Sale Record = ราคา+วันที่ — D3); ไม่มี Top Brand/YTD (D5)

> **Business Rule:** แท็บ "ซ่อน" และ "ขายแล้ว" มองเห็นได้เฉพาะเจ้าของเท่านั้น ผู้ใช้คนอื่นที่เข้าดูโปรไฟล์จะไม่เห็นแท็บเหล่านี้

#### 3.9.2 Viewer Profile (ดูโปรไฟล์ผู้ใช้คนอื่น)
**ความต้องการ:**
- รูปโปรไฟล์, ชื่อ, bio, สถิติ (Followers, Following)
- ปุ่ม Follow / Unfollow + viewer `...` menu (Report / Block / About / Copy URL / Share)
- แท็บที่มองเห็นได้ (**เฉพาะสถานะสาธารณะ**):

| แท็บ | โพสต์ที่แสดง |
|---|---|
| **ขาย** | โพสต์สถานะ Sale เท่านั้น |
| **โชว์** | โพสต์สถานะ Show เท่านั้น |

> **Business Rule:** โพสต์สถานะ Hide และ Sold จะ**ไม่ปรากฏ**ให้ผู้ใช้คนอื่นเห็นเด็ดขาด (S-14 — prototype `all` tab leak = defect)

---

### 3.10 Menu & Settings

**เมนูด้านข้าง (Drawer — 9 items เป็น placeholder rows ไม่ใช่ active routes, S-19):**
- Watch Brands, Watch Price Index, Watch Shops, Accessories Shop, Repair Shop, Auction Center, Consignment Center, Authentication Center, Community — mark เป็น Future/Placeholder ตาม product decision

**Settings (IG-style 6 sections — S-05):**
- Account / Your app and media / Notifications / More info and support / bottom Sign out
- Edit profile อยู่ own profile (`pedit` — ไม่ใช่ Settings entry)
- About your account: Security (Change password — S-28) + Account management (Delete account = 2-page flow + login-to-restore grace 30 วัน, S-02/S-27)
- Notification settings = 4 toggles (Like / Comment / Follow / Watch Alert — S-06)
- Content preferences / what-you-see pages (Interested, Not interested, Muted, Blocked)
- Language (English / ภาษาไทย), Theme (Dark / Light)
- Help (ช่องทางติดต่อ), About app (Version, company info, Privacy Policy, Terms of Use, Contact support)

---

## 4. Non-Functional Requirements

### 4.1 Performance
- หน้า Feed โหลดภายใน 2 วินาที
- รูปภาพ Lazy Load
- รองรับ Offline Mode บางส่วน (แสดงข้อมูล Cache)

### 4.2 Security
- JWT Token Authentication
- HTTPS ทุก API
- Purchase Information (Purchase Price / Purchase Date) และข้อมูล Portfolio เข้าถึงได้เฉพาะเจ้าของ/Admin

### 4.3 Localization
- รองรับภาษาไทยและอังกฤษ
- ราคาแสดงในรูปแบบ THB (฿)

### 4.4 Accessibility
- Font size ปรับตามระบบ
- รองรับ Screen Reader

---

## 5. Integration Requirements

| ระบบ | วัตถุประสงค์ |
|---|---|
| **Apple Sign In** | Sign In / Sign Up ด้วย Apple ID (บังคับโดย Apple App Store Guideline หากแอปมี SSO อื่น) |
| **Google OAuth** | Sign In / Sign Up ด้วย Google Account |
| Firebase Cloud Messaging | Push Notifications |
| Image Storage (S3/CDN) | จัดเก็บรูปภาพ |
| Payment Gateway | (Phase 2) |
| Watch Price API | ดึงข้อมูลราคาตลาด |

---

## 6. ขอบเขตที่ไม่รวมใน Phase 1

- ระบบชำระเงินออนไลน์ในแอป
- Video upload
- Live streaming
- Watch Authentication Service ในแอป

---

## 7. Glossary

| คำศัพท์ | ความหมาย |
|---|---|
| Asset | นาฬิกาแต่ละเรือน (drawer record — เห็น public ผ่าน linked post เท่านั้น) |
| Post | โพสต์บน feed/profile — kind `sale` (ผูก asset) หรือ `post` (ไม่ผูก asset) |
| Cost details | ข้อมูลต้นทุน owner-private (Purchase Price / Purchase Date) ใช้ใน Portfolio `Total invested` |
| Watch Alert | การตั้งแจ้งเตือนเมื่อมี post ตรงตาม Criteria (snapshot) |
| Show | การแสดงนาฬิกาในคอลเลกชันโดยไม่ขาย (เดิมเรียก Collection Show) |
| Member Sheet | sheet `Join TukDaeng` สำหรับ gate action ที่ต้อง login (เดิมเรียก Global Login Required Dialog) |
| Alerts feed | หน้าแจ้งเตือนกลาง 5 types (เดิมเรียก Notification Center) |
| Reference No. | รหัสอ้างอิงรุ่นนาฬิกาของผู้ผลิต |
