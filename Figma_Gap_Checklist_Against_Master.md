# Figma Gap Checklist Against Master

**Reference:** [TukDaeng_Master_Product_Definition.md](c:/Users/Admin/Desktop/TukDaeng/TukDaeng_Master_Product_Definition.md)  
**Review Scope:** เทียบภาพรวมหน้าจอ Figma ที่แนบมากับ master baseline ล่าสุด  
**Purpose:** ใช้เป็น checklist สำหรับปรับ Figma ให้ตรงกับ source of truth ก่อนแตกเป็น Functional PRD รายโมดูล

## Review Summary

Figma มี coverage ของ flow หลักค่อนข้างมากแล้ว แต่ยังมีทั้ง:

- จุดที่ขัดกับ master โดยตรง
- จุดที่ยังใช้คำหรือ logic จากเอกสารเวอร์ชันเก่า
- state สำคัญบางส่วนที่ยังไม่เห็นในหน้าจอ

สิ่งที่ต้องระวังที่สุดคืออย่าให้ Dev และ QA อ้างอิง Figma ในส่วนที่ conflict กับ master โดยไม่รู้ตัว

## A. Must Fix: ขัดกับ Master โดยตรง

### 1. Public Profile ยังไม่มีแท็บ `All`

**Master ต้องการ**

- Public Profile มีแท็บ `All`, `Sale`, `Show`
- `All` ต้องแสดง Asset สถานะ `Sale` และ `Show` รวมกัน

**Figma ตอนนี้**

- มีเฉพาะ `For Sale` และ `Collection Show`

**Action**

- เพิ่มแท็บ `All`
- กำหนด behavior ของ `All` ให้รวม `Sale + Show`

### 2. Feed Card ยังแสดง Location

**Master ต้องการ**

- Feed Card ห้ามแสดง `Location` ใน V1

**Figma ตอนนี้**

- มีข้อความลักษณะ `5 hours ago • Pathum Wan`
- มีข้อความลักษณะ `2 hours ago • Bangkok`

**Action**

- เอา `Location` ออกจาก Feed Card
- คง `Posted Time` ไว้ได้ แต่แยกจาก location ให้ชัด

### 3. Settings ยังไม่มี Theme Mode

**Master ต้องการ**

- Settings ต้องมี `Theme Mode: Dark Mode / Light Mode`

**Figma ตอนนี้**

- ยังไม่เห็นหน้าหรือเมนูเปลี่ยนธีม

**Action**

- เพิ่ม setting สำหรับ Theme Mode

### 4. Edit Asset ยังใช้ model สถานะไม่ตรงกับ Master

**Master ต้องการ**

- ใช้ canonical status ชุดเดียว: `Sale / Show / Hide / Sold`
- `Sold` เป็นสถานะปลายทาง และ Sold Asset ไม่สามารถ edit ข้อมูลหลักได้

**Figma ตอนนี้**

- มี `Status: Sale / Show / Hide`
- และมี `Sale Status: Available / Sold` แยกอีกชั้น

**Impact**

- ขัดกับ status model ใน master โดยตรง
- เสี่ยงให้ Dev ออกแบบ data model และ transition ผิด

**Action**

- ปรับ Figma ให้เหลือ status model เดียวตาม master
- ตัด `Sale Status: Available / Sold` ออก หรือย้าย logic ให้สอดคล้องกับ `Sold` status จริง

### 5. Comment UI ใน Asset Detail ยังเป็น Nested

**Master ต้องการ**

- Comment เป็น `Single Level`
- `ไม่มี Nested Comment`

**Figma ตอนนี้**

- มี reply chain
- มี `View more replies`
- มีการแสดงลำดับตอบกลับแบบ nested

**Action**

- ปรับ comment UI ให้เป็น single-level only
- ตัด pattern ที่สื่อว่าเป็น nested thread

### 6. Notification Types ใน Figma มีรายการเกินจาก Master

**Master รองรับ**

- Like
- Comment
- Follow
- Offer
- Watch Alert

**Figma ตอนนี้**

- มี `Like Valuation`
- มี `Market Update`
- มี `Sale Success`

**Impact**

- เป็น type ที่ไม่ได้อยู่ใน master baseline ล่าสุด

**Action**

- เลือกอย่างใดอย่างหนึ่ง:
- ลบ/ซ่อน notification types ที่ไม่ได้อยู่ใน master
- หรืออัปเดต master ให้รองรับอย่างเป็นทางการก่อน

## B. High Priority: ควรเพิ่มหรือแก้เพื่อให้พร้อมส่ง Dev/QA

### 7. Feed ยังไม่เห็น state สำคัญตาม master

**Master ต้องการ**

- Pull to Refresh
- Infinite Scroll
- End-of-list message: `คุณดูรายการทั้งหมดแล้ว`
- Error State พร้อมปุ่ม `ลองใหม่`
- Offline cached data state

**Figma ตอนนี้**

- เห็นหน้าปกติเป็นหลัก
- ยังไม่เห็น state เหล่านี้ชัด

**Action**

- เพิ่ม state screens อย่างน้อย:
- feed load more
- end of list
- error with retry
- offline cached state

### 8. Feed ยังไม่เห็น Guest restriction state

**Master ต้องการ**

- Guest กด feature ที่ต้อง login ต้องเจอ `Global Login Required Dialog`
- Guest ใช้งาน `Favorites`, `Following`, `Like`, `Follow`, `Offer`, `Chat`, `Watch Alert` ไม่ได้

**Figma ตอนนี้**

- ยังไม่เห็น guest-specific state หรือ dialog นี้

**Action**

- เพิ่ม guest state / login required dialog สำหรับ interaction สำคัญ

### 9. Search / Watch Alert ยังไม่เห็น Watch Alert Result List

**Master ต้องการ**

- Watch Alert notification ต้องเปิดไป `Watch Alert Result List`
- ไม่เปิด Asset Detail ตรง

**Figma ตอนนี้**

- เห็นหน้า manage watch alert
- ยังไม่เห็น result list screen

**Action**

- เพิ่มหน้าผลลัพธ์จาก Watch Alert

### 10. Notification destination state ยังไม่ครบ

**Master ต้องการ**

- Like → Asset Detail
- Comment → Asset Detail และ focus comment
- Watch Alert → Result List
- Offer Accepted → Chat Room
- Offer Rejected → Asset Detail

**Figma ตอนนี้**

- เห็น notification list
- แต่ยังไม่เห็นปลายทางสำคัญครบทุกแบบ โดยเฉพาะ comment focus และ watch alert result

**Action**

- เพิ่ม destination/state screens ตาม type สำคัญ

### 11. Chat ยังไม่เห็น state ของ Asset Deleted

**Master ต้องการ**

- ถ้า Asset ถูกลบ Chat ยังอยู่
- Reference Asset ต้องแสดงว่า `รายการนี้ไม่พร้อมใช้งานแล้ว`

**Figma ตอนนี้**

- ยังไม่เห็น deleted asset state ใน chat

**Action**

- เพิ่ม chat state สำหรับ deleted asset reference

### 12. Chat ยังไม่เห็น entry ของ Block / Report

**Master ต้องการ**

- Chat รองรับ Block User
- Chat รองรับ Report User

**Figma ตอนนี้**

- ยังไม่เห็นทางเข้า action เหล่านี้ชัด

**Action**

- เพิ่ม menu/state ของ block/report ใน chat

### 13. Sign In ยังไม่เห็น Suspended Account state

**Master ต้องการ**

- ถ้าบัญชีถูก suspend ต้องมี error พร้อมเหตุผลและช่องทางติดต่อ support

**Figma ตอนนี้**

- เห็น incorrect password state
- ยังไม่เห็น suspended account state

**Action**

- เพิ่ม suspended account error screen/state

### 14. Asset Detail ยังไม่เห็น Deleted Asset state

**Master ต้องการ**

- ถ้า Asset ถูกลบ หน้า detail ต้องแสดง `รายการนี้ไม่พร้อมใช้งานแล้ว`

**Figma ตอนนี้**

- ยังไม่เห็น state นี้

**Action**

- เพิ่ม deleted/unavailable asset state

## C. Needs Decision: จุดที่กำกวม หรือยังใช้ logic เก่า

### 15. `Collection Show` ยังถูกใช้เป็น label ในหลายหน้าจอ

**Master ใช้ canonical term**

- `Show`

**Figma ตอนนี้**

- ยังใช้ `Collection Show`
- และบางที่ยังใช้ `Collection Hide`

**Note**

- ตาม master มี legacy mapping อยู่ จึงไม่ถือว่า “ผิด” ทันที
- แต่ถ้าต้องการให้ทุก artifact ใช้คำชุดเดียว ควรเปลี่ยน label ให้เป็น canonical term

**Action**

- ตัดสินใจว่าจะ:
- เก็บ legacy label ใน UI
- หรือ normalize ทุกหน้าจอให้ใช้ `Show / Hide`

### 16. Viewer Detail ของ Asset สถานะ Show ยังมี action เชิง marketplace

**Figma ตอนนี้**

- หน้าจอ `Collection Show` ยังมีปุ่ม `Make an Offer`
- และมี `Contact seller`

**Master ตอนนี้**

- ระบุว่า `Show` ไม่ขึ้น Feed, Search, Watch Alert
- แต่ไม่ได้เขียนแยก explicit ว่าใน Detail ของ `Show` ห้าม offer หรือไม่

**Risk**

- เชิง business logic `Show` คือ public collection ไม่ใช่ marketplace
- ถ้ายังมี `Make an Offer` อาจขัดกับ intent ของ status

**Action**

- ต้องตัดสินใจใน master ให้ชัด:
- `Show` เสนอราคาได้หรือไม่ได้
- ถ้าไม่ได้ ให้แก้ Figma ทันที

### 17. Menu items หลายตัวไม่อยู่ใน master baseline ปัจจุบัน

**Figma ตอนนี้มี**

- Watch Price Index
- Watch Shops
- Accessories Shop
- Repair Shop
- Auction Center
- Consignment Center
- Authentication Center
- Community

**Master ตอนนี้**

- ไม่ได้สรุป modules เหล่านี้เป็น functional scope หลัก

**Action**

- ตัดสินใจว่าเมนูเหล่านี้:
- อยู่ใน scope จริง
- อยู่ใน future phase
- หรือเป็น placeholder จาก design เดิม

## D. Good Coverage: มีแล้วและสอดคล้องค่อนข้างดี

รายการนี้ไม่ต้องรีบแก้ หากไม่มีรายละเอียดย่อยเพิ่ม:

- Sign up flow พร้อม OTP verify
- Reset password flow หลัก
- Feed tabs: All / Following / Favorites
- Search + filter structure หลัก
- Watch Alert management: toggle / rename / delete
- Owner Profile แยก tabs หลักและมี Portfolio แยกเป็นหน้าต่างหาก
- Board structure: feature article / trending / journal / category / search / infinite scroll
- Chat list / incoming offers / offer accepted / offer declined
- Edit Profile ที่ lock email หลัง verification

## E. Recommended Next Pass In Figma

ลำดับแนะนำในการแก้:

1. แก้ `status model` ให้ตรง master
2. แก้ `Public Profile tabs`
3. เอา `Location` ออกจาก Feed Card
4. เพิ่ม `Theme Mode` ใน Settings
5. แก้ `Comment` จาก nested เป็น single level
6. ตัดสินใจเรื่อง `Show` ว่า make offer ได้หรือไม่ได้
7. เพิ่ม state ที่ยังขาด: guest/login required, feed error/offline/end-of-list, watch alert result, deleted asset, suspended account
8. เคลียร์ notification types และ menu items ที่ยังอยู่นอก master baseline

## Final Review Note

จากการเทียบครั้งนี้ ยังไม่สามารถสรุปได้ว่า Figma “ครบถ้วนไม่มีตกหล่น” ตาม master ล่าสุด เพราะยังมีทั้ง conflict และ missing states ตามรายการด้านบน

ถ้าจะใช้ Figma เป็นฐานส่งต่อ Dev หรือ QA ต่อทันที ควรแก้หมวด `Must Fix` และ `High Priority` ก่อน
