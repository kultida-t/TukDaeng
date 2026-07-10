# Daily Work Report: Tuk Daeng

**วันที่:** 2026-06-16  
**ผู้ทำงาน:** เต็ม / Consolidated with ChatGPT review inputs  
**โปรเจกต์:** Tuk Daeng  
**Environment ที่ focus:** docs / prototype review / product definition  
**สถานะ repo ตอนสรุป:** อยู่บน branch `master` และมีไฟล์เอกสารใหม่/แก้ไขที่ยังไม่ commit

---

## 1. สรุปงานวันนี้

วันนี้โฟกัสหลักที่การทบทวนและจัดระเบียบเอกสารฝั่ง Front Office ให้ใช้เป็นหลักยึดเดียวกันก่อนส่งต่อ dev หรือ QA โดยรวมข้อมูลที่ยืนยันไว้ก่อนหน้าใน ChatGPT เข้ามาอยู่ในงานวันนี้ด้วย งานสำคัญที่ทำมีดังนี้:

- จัดรูปแบบและขยายรายละเอียดเอกสาร Feed ให้เป็น acceptance criteria ที่อ่านง่ายและใช้งานต่อได้
- ปรับ `FO_Functional_PRD.md` และกติกา Visibility Matrix ให้ตรงตามความหมายที่ยืนยันล่าสุด
- สร้าง `TukDaeng_Master_Product_Definition.md` เป็นเอกสาร master สำหรับใช้เป็น baseline กลาง
- รีวิวภาพรวมหน้าจอ Figma เทียบกับ master และสร้าง checklist gap สำหรับตามแก้หน้าจอ
- รีวิวและปรับ `01_AUTHENTICATION_MODULE.md` ให้ตรงกับ master, Figma flow และข้อกำหนดด้าน security

---

## 2. Branch / Commit Log

| เวลา | Branch / Context | งานที่ทำ | ระยะเวลา | Commit | สถานะ |
|---|---|---|---|---|---|
| ช่วงวันนี้ | `master` | Consolidate requirement, review doc, update master spec, feed module, auth module, figma gap checklist | ทั้งวัน | ยังไม่มี commit ในรอบนี้ | done (working tree pending) |

หมายเหตุ:

- รายงานฉบับนี้เป็นการสรุปรวมงานของวันนี้ในก้อนเดียว
- มีส่วนของ requirement review และ confirmation ที่เกิดขึ้นก่อนเข้ามาคุยในห้องนี้ และถูกนำมารวมในรายงานวันนี้แล้ว

---

## 3. รายละเอียดงาน

### งานที่ 1: ปรับโครงสร้างและเกณฑ์ของ Feed Module

- **Branch:** `master`
- **Objective:** ทำเอกสาร Feed ให้ชัดในระดับที่ใช้เป็น acceptance criteria ต่อได้
- **สิ่งที่แก้/เพิ่ม:**
  - จัด format เอกสาร Feed ให้อ่านง่าย
  - เพิ่มและเรียบเรียงเงื่อนไข `AC-FEED-005` ถึง `AC-FEED-039`
  - ครอบคลุมเรื่อง Tabs, Guest permissions, Feed card, Feed actions, Asset lifecycle, Block & Report, Refresh, State persistence, Notification integration
- **ไฟล์ที่เกี่ยวข้อง:** `02_FEED_MODULE.md`
- **ผลกระทบ:** ทีมสามารถอ้างอิง behavior ของ Feed ได้ละเอียดขึ้นและลดความคลุมเครือ
- **ตรวจสอบแล้ว:** ทบทวนตาม requirement ที่ยืนยันล่าสุด
- **Commit message:** ยังไม่มี
- **สถานะ:** done

### งานที่ 2: ปรับ Functional PRD และ Visibility Rules

- **Branch:** `master`
- **Objective:** ให้ `FO_Functional_PRD.md` ตรงกับนิยาม visibility ของ asset แต่ละสถานะ
- **สิ่งที่แก้/เพิ่ม:**
  - จัด format เอกสารให้อ่านง่าย
  - ปรับคำอธิบาย `Sale / Show / Hide / Sold`
  - ยืนยันว่า:
    - `Sale` เห็นใน Feed, Search, Watch Alert, Public Profile และ Owner Profile
    - `Show` เห็นใน Public Profile และ Owner Profile
    - `Hide` เห็นเฉพาะ Owner
    - `Sold` เห็นเฉพาะ Owner และไม่ขึ้น public surfaces
- **ไฟล์ที่เกี่ยวข้อง:** `FO_Functional_PRD.md`
- **ผลกระทบ:** ลดความสับสนระหว่าง public visibility กับ owner visibility
- **ตรวจสอบแล้ว:** เทียบกับคำยืนยันล่าสุดของผู้ใช้
- **Commit message:** ยังไม่มี
- **สถานะ:** done

### งานที่ 3: สร้างเอกสาร Master Product Definition

- **Branch:** `master`
- **Objective:** รวม `PRD.md` และ `FO_Functional_PRD.md` เป็น baseline กลางก่อนแยกเป็น module spec
- **สิ่งที่แก้/เพิ่ม:**
  - สร้าง `TukDaeng_Master_Product_Definition.md`
  - รวม scope, rules, visibility, profile behavior, settings, theme mode และหลักยึดระดับระบบ
  - ปรับรายละเอียด profile เพิ่มเติมตามที่ยืนยันภายหลัง เช่น:
    - Owner Profile tabs = `All, Sale, Show, Hide, Sold`
    - `Total Asset Value` เป็น entry point ไป Portfolio ไม่ใช่ tab
    - Public Profile มี `All, Sale, Show`
    - Settings ต้องมี `Theme Mode: Dark / Light`
- **ไฟล์ที่เกี่ยวข้อง:** `TukDaeng_Master_Product_Definition.md`
- **ผลกระทบ:** ได้เอกสารกลางสำหรับใช้อ้างอิงข้ามทีม
- **ตรวจสอบแล้ว:** ปรับตาม feedback และ confirmation ล่าสุด
- **Commit message:** ยังไม่มี
- **สถานะ:** done

### งานที่ 4: รีวิว Figma เทียบ Master และสร้าง Gap Checklist

- **Branch:** `master`
- **Objective:** ตรวจว่าหน้าจอที่ออกแบบไว้ยังขาดอะไรเมื่อเทียบกับ master ล่าสุด
- **สิ่งที่แก้/เพิ่ม:**
  - รีวิวภาพ Figma หลายหน้าจอเทียบกับ `TukDaeng_Master_Product_Definition.md`
  - สรุปจุดตกหล่นและจุดที่ยังไม่อัปเดตเป็น checklist
  - ตัวอย่าง gap สำคัญที่พบ:
    - Public Profile ยังขาด tab `All`
    - Settings ยังไม่แสดง theme mode
    - Feed card ยังมีข้อมูลเกิน V1 บางส่วน
    - Asset detail comment structure ยังไม่ตรงหลักยึดบางข้อ
    - มี notification บางประเภทในภาพที่ยังไม่ถูกนิยามใน master
- **ไฟล์ที่เกี่ยวข้อง:** `Figma_Gap_Checklist_Against_Master.md`
- **ผลกระทบ:** ใช้เป็นรายการตามแก้ Figma ให้สอดคล้องกับเอกสารหลัก
- **ตรวจสอบแล้ว:** รีวิวจากภาพแนบและเอกสาร master
- **Commit message:** ยังไม่มี
- **สถานะ:** done

### งานที่ 5: รีวิวและปรับ Authentication Module ให้ตรง Master

- **Branch:** `master`
- **Objective:** ทำ `01_AUTHENTICATION_MODULE.md` ให้ตรงทั้งหน้าจอ, master, flow จริง และ security rule
- **สิ่งที่แก้/เพิ่ม:**
  - เขียนโครงสร้างเอกสารใหม่ให้ครบตั้งแต่ objective, scope, screen mapping, user states, flows, business rules, validation, exception, acceptance criteria
  - ปรับจาก `Reset OTP` เป็น `Reset Link`
  - ปรับ `OTP Expiry` เป็น `30 Minutes`
  - ปรับ password policy ให้ตรงหลักยึด
  - เพิ่ม `Terms of Use`, `Privacy Policy`, `Check Email`, `Password Updated`, `Suspended Account State`
  - ตัด `Account Linking / Account Merge / Auto-Link` ออกจาก V1
  - ปรับ `Duplicate Registration Rule` ให้แนะนำแค่ `Sign In` โดยไม่เปิดเผยว่าบัญชีนั้นสมัครด้วยวิธีใด เพื่อป้องกันความเสี่ยงด้านความปลอดภัยของบัญชี
- **ไฟล์ที่เกี่ยวข้อง:** `01_AUTHENTICATION_MODULE.md`
- **ผลกระทบ:** เอกสาร auth พร้อมขึ้นสำหรับใช้เป็น module baseline ที่ละเอียดและปลอดภัยขึ้น
- **ตรวจสอบแล้ว:** ตรวจ keyword สำคัญและ logic หลักเทียบ master และ feedback ล่าสุด
- **Commit message:** ยังไม่มี
- **สถานะ:** done

---

## 4. งานที่ยังค้าง

| งาน | เหตุผลที่ค้าง | Next Step | ผู้เกี่ยวข้อง |
|---|---|---|---|
| ปรับรายละเอียด module อื่นให้ตรง master ในระดับเดียวกับ Auth/Feed | วันนี้โฟกัสที่ baseline และเอกสารหลักก่อน | ไล่ review ทีละ module เช่น Profile, Search, Notification, Watch Alert | Product / BA |
| ปรับ Figma ตาม gap checklist | ปัจจุบันเป็นรายการ review แล้ว ยังไม่ได้แก้หน้าจอจริงในไฟล์ออกแบบ | ใช้ `Figma_Gap_Checklist_Against_Master.md` เป็น checklist ปรับงานออกแบบ | UX/UI |
| Commit เอกสารรอบนี้ | ยังเป็น working tree pending | ตรวจซ้ำทั้งชุดแล้วค่อยจัด commit เป็นกลุ่มงานเอกสาร | Product / Repo owner |

---

## 5. สิ่งที่ตรวจสอบแล้ว

- [x] เอกสาร Feed ถูกเรียบเรียงใหม่และเพิ่ม acceptance criteria สำคัญครบตามที่คุย
- [x] Visibility Matrix ใน `FO_Functional_PRD.md` ถูกปรับตามความหมายที่ยืนยันล่าสุด
- [x] มีเอกสาร master กลางสำหรับใช้อ้างอิงทั้งระบบ
- [x] มี checklist gap ระหว่าง Figma กับ master
- [x] `01_AUTHENTICATION_MODULE.md` ถูกปรับ logic สำคัญให้ตรง master และ security concern
- [ ] commit แล้ว
- [ ] merge แล้ว ถ้างานจบ

---

## 6. สรุปสำหรับส่งบริษัท

วันนี้ทำงานในโปรเจกต์ Tuk Daeng โดยโฟกัสที่การ consolidate และยกระดับเอกสารฝั่ง Front Office ให้มีหลักยึดกลางที่ชัดเจนก่อนลงรายละเอียดรายโมดูล พร้อมรวมข้อมูล review และ confirmation ที่ยืนยันไว้ก่อนหน้าจาก ChatGPT เข้าไว้ในรายงานวันนี้ด้วย

งานหลักที่ทำได้แก่:

1. ปรับและขยายเอกสาร Feed Module
2. ปรับ `FO_Functional_PRD.md` และกติกา visibility ของ asset
3. สร้าง `TukDaeng_Master_Product_Definition.md` เป็น baseline กลาง
4. รีวิว Figma เทียบ master และสร้าง gap checklist
5. ปรับ `01_AUTHENTICATION_MODULE.md` ให้ตรงกับ master, Figma และ security rule

ผลลัพธ์คือ:

- มี master definition สำหรับใช้อ้างอิงร่วมกันก่อนแตกเป็น Functional PRD รายโมดูล
- มี module doc สำคัญที่พร้อมใช้งานมากขึ้น โดยเฉพาะ Feed และ Authentication
- มีรายการสิ่งที่ Figma ยังขาดเมื่อเทียบกับเอกสารล่าสุด

งานค้าง/ความเสี่ยง:

- ยังต้องไล่ปรับ module อื่นให้ตรง master ต่อ
- ยังต้องอัปเดตหน้าจอ Figma ตาม checklist
- ยังไม่มีการ commit เอกสารรอบนี้

แผนถัดไป:

- ไล่ review เอกสารรายโมดูลที่เหลือเทียบ master
- ใช้ gap checklist ปรับงานออกแบบให้ตรง baseline
- จัด commit เอกสารเป็นกลุ่มงานเมื่อชุดนี้นิ่ง
