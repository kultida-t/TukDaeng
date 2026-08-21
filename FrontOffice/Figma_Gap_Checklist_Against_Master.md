# Figma Gap Checklist Against Master

**Reference:** [TukDaeng_Master_Product_Definition.md](TukDaeng_Master_Product_Definition.md)  
**Review Scope:** เทียบภาพรวมหน้าจอ Figma ที่แนบมากับ master baseline ล่าสุด  
**Purpose:** ใช้เป็น checklist สำหรับปรับ Figma ให้ตรงกับ source of truth ก่อนแตกเป็น Functional PRD รายโมดูล

**Current Cleanup Tracker:** [FIGMA_UX_CLEANUP_TASK_BREAKDOWN.md](FIGMA_UX_CLEANUP_TASK_BREAKDOWN.md)  
**Document rule:** ระหว่าง Figma cleanup ยังไม่เสร็จ ให้ update checklist/tracker เดิมเท่านั้น ไม่สร้าง handoff หรือ checklist ชุดใหม่ เว้นแต่มี product decision ใหม่ที่ต้อง bump version ใน [DOCUMENT_VERSION.md](DOCUMENT_VERSION.md)

## Review Summary

Figma มี coverage ของ flow หลักค่อนข้างมากแล้ว แต่ยังมีทั้ง:

- จุดที่ขัดกับ master โดยตรง
- จุดที่ยังใช้คำหรือ logic จากเอกสารเวอร์ชันเก่า
- state สำคัญบางส่วนที่ยังไม่เห็นในหน้าจอ

สิ่งที่ต้องระวังที่สุดคืออย่าให้ Dev และ QA อ้างอิง Figma ในส่วนที่ conflict กับ master โดยไม่รู้ตัว

## Module-Level Gap Checklist

ส่วนนี้แตก gap ตามโมดูล เพื่อใช้ assign งานแก้ Figma และตรวจกลับกับ Functional PRD รายโมดูล รุ่นนี้เป็น checklist final ที่ตัดรายการ legacy ซ้ำด้านล่างออกแล้ว

### 00 Global Rules Module

| Priority | Figma Gap | Master Baseline | Action |
| --- | --- | --- | --- |
| Must Fix | หลาย screen ยังใช้ status หรือ label จากเอกสารเก่า | ใช้ canonical status `Sale`, `Show`, `Hide`, `Sold` | Normalize label และลบ status model ซ้ำ |
| Must Fix | Public/private visibility ยังเสี่ยงปนกัน | Private data เห็นเฉพาะ Owner หรือ Admin | แยก Owner-only section และ public state ให้ชัด |
| High | Global Login Required Dialog ยังไม่ถูกใช้สม่ำเสมอ | Guest ใช้ feature ที่ต้อง Login ต้องเห็น dialog เดียวกัน | เพิ่ม reusable dialog state และ mapping ทุก action |
| High | Deleted Asset state ยังไม่ครบทุก entry point | Detail ต้องแสดง `รายการนี้ไม่พร้อมใช้งานแล้ว` และ public lists ต้องไม่แสดง asset | เพิ่ม unavailable state ใน Detail, Chat, Offer และ deep link |
| High | Block impact ยังไม่ชัดในหลาย surface | Block ต้องซ่อน Asset จาก Feed, Search, Watch Alert Result และไม่ใช้ Follow relation | เพิ่ม blocked/unavailable state และ filtering note |
| High | Offline cached state ยังมีเฉพาะบางหน้าจอ | อย่างน้อย Feed ต้องแสดงข้อมูลล่าสุดเมื่อ offline | เพิ่ม offline/cached indicator และ fallback state |
| Medium | Empty state copy ไม่สม่ำเสมอ | ทุกหน้าที่ไม่มีข้อมูลใช้ `ไม่พบข้อมูล` | Normalize empty copy หรือระบุข้อยกเว้นอย่างเป็นทางการ |
| Medium | Report อาจสื่อว่า asset หายทันที | Report ไม่ทำให้ Asset หายทันทีจนกว่า Admin moderation | เพิ่ม post-report confirmation ที่ไม่เปลี่ยน visibility ทันที |

### 00 Navigation And Cross-Module Flow

| Priority | Figma Gap | Master Baseline | Action |
| --- | --- | --- | --- |
| Must Fix | Menu มีรายการนอก baseline เช่น Watch Shops, Accessories Shop, Repair Shop, Auction Center, Consignment Center, Authentication Center, Community | Master ยังไม่ได้สรุปเป็น functional scope หลัก | จัดกลุ่มเป็น in-scope, future phase หรือ placeholder |
| Must Fix | Feed action อาจทำให้เข้าใจว่า Comment ทำจาก Feed ได้ | Comment ต้องทำผ่าน Asset Detail เท่านั้น แต่ Share ทำได้จาก Feed | ตัด Comment action จาก Feed และเพิ่ม Share Asset action บน Feed |
| High | Notification destination ยังไม่ครบ | Like/Comment ไป Asset Detail, Follow ไป Public Profile, Offer ไป Offer/Chat context, Watch Alert ไป Result List | เพิ่ม destination state ของ notification ทุก type |
| High | Watch Alert notification อาจเปิด Asset Detail โดยตรง | Watch Alert notification ต้องไป Watch Alert Result List | เพิ่ม Watch Alert Result List เป็น destination |
| High | Deleted Asset จาก deep link / notification ยังไม่ชัด | Detail ต้องแสดง `รายการนี้ไม่พร้อมใช้งานแล้ว`; Chat ยังอยู่; Offer เป็น Cancelled | เพิ่ม unavailable fallback state |
| High | Global Login Required Dialog ยังไม่เห็นในทุก entry point | Guest ใช้ feature ที่ต้อง Login ต้องเห็น dialog เดียวกัน | เพิ่ม dialog state จาก Like, Follow, Offer, Chat, Watch Alert, Favorites, Following |
| High | Back button บน normal screen ที่เปิดจาก external deep link ยังไม่ชัด | ถ้าไม่มี navigation history ให้ fallback ไป Feed ไม่ใช่ปิด app | เพิ่ม state/annotation ของ back button บน Asset Detail / Public Profile / Article Detail ที่เปิดจาก external deep link |
| High | Main navigation หลังเปิด deep link ยังไม่ชัด | ทั้ง Guest และ Login ต้องใช้ main navigation ต่อได้หลังเปิด deep link | เพิ่ม state ที่แสดง main navigation (bottom tab/menu) available หลังเปิด deep link ทั้ง Guest และ Login |
| Medium | หลาย screen ยังใช้คำจากเอกสารเก่า | Source of truth ใช้ canonical terminology จาก master | Normalize label หรือใส่ mapping ให้ชัดก่อนส่ง Dev/QA |
| Medium | Block / Report entry ยังไม่ผูกกับ navigation | Trust & Safety ต้องรองรับ Block และ Report จาก user/content context | เพิ่ม entry points จาก Profile, Asset Detail, Comment, Chat, Board |

### 01 Authentication Module

| Priority | Figma Gap | Master Baseline | Action |
| --- | --- | --- | --- |
| Must Fix | ยังไม่เห็น Suspended Account state ชัดเจน | บัญชี Suspended ต้องเห็น error พร้อมเหตุผลและช่องทางติดต่อ Support | เพิ่ม suspended account screen/state ใน Sign In |
| Must Fix | Sign Up ทุกช่องทางอาจยังไม่บังคับ Terms / Privacy ชัดเจน | ทุกช่องทางต้องยอมรับ Terms of Use และ Privacy Policy ก่อนสมัคร | ตรวจให้ Email, Google และ Apple flow มี consent ครบก่อน submit |
| High | ยังไม่เห็น OTP expiration state | OTP หมดอายุภายใน 30 นาที | เพิ่ม expired OTP state และ action ขอ OTP ใหม่ |
| High | ยังไม่เห็น password policy ชัดเจน | Password อย่างน้อย 8 ตัวอักษร และต้องมีตัวเลขหรือสัญลักษณ์ | เพิ่ม validation copy ใน Sign Up, Reset Password, Change Password |
| High | ยังไม่เห็น duplicate email error | 1 Email สมัครได้ 1 บัญชีเท่านั้น | เพิ่ม existing email state และ copy ที่พาไป Sign In |
| High | ยังไม่เห็น SSO / Email auth method conflict | บัญชี SSO ไม่สามารถ Sign In ด้วย Email / Password ได้ และกลับกัน | เพิ่ม error state เมื่อใช้วิธี sign in ผิดกับบัญชีเดิม |
| High | ยังไม่เห็นว่า SSO Email ไม่ต้อง OTP | SSO Email ไม่ต้องยืนยัน OTP | ระบุ flow ของ Apple / Google ให้ข้าม OTP |
| Medium | ยังไม่เห็น rule ว่า Email เปลี่ยนไม่ได้หลังยืนยันแล้ว | Email ไม่สามารถเปลี่ยนได้หลังยืนยันแล้ว | เพิ่ม note หรือ locked email state หลัง verification |
| Medium | Forgot / Reset Password ยังไม่เห็น invalid/expired reset link state | Reset Password ต้องจัดการ token/link ที่ใช้ไม่ได้หรือหมดอายุ | เพิ่ม invalid/expired reset link state และทางขอ link ใหม่ |
| Medium | Global Login Required Dialog ยังไม่ผูกกับ Authentication ชัด | Guest ใช้ feature ที่ต้อง Login ต้องแสดง Global Login Required Dialog | เพิ่ม reusable dialog state และ destination ไป Sign In / Sign Up |

### 02 Feed Module

| Priority | Figma Gap | Master Baseline | Action |
| --- | --- | --- | --- |
| Must Fix | Feed Card ยังแสดง Location เช่น `5 hours ago • Pathum Wan` | Feed Card V1 ต้องไม่แสดง Location | เอา Location ออกจาก Feed Card และเหลือเฉพาะ Posted Time |
| Must Fix | Feed อาจแสดง Asset ที่ไม่ใช่ `Sale` | Feed, Search และ Watch Alert ใช้เฉพาะ Asset สถานะ `Sale` | ระบุ filter/status rule ว่า Feed render เฉพาะ `Sale` เท่านั้น |
| High | ยังไม่เห็น behavior ของแท็บ `All`, `Following`, `Favorites` ครบ | `All` = Sale ทั้งหมดที่มองเห็น, `Following` = Sale ของคนที่ Follow, `Favorites` = Sale ที่กด Like | เพิ่ม annotation หรือ state ของแต่ละแท็บให้ชัด |
| High | ยังไม่เห็น Block filtering ใน Feed | Asset ของผู้ถูก Block ต้องหายจาก Feed ทันที และ Following Feed ต้องไม่ใช้ความสัมพันธ์ Follow ระหว่างผู้ที่ Block กัน | เพิ่ม blocked/hidden asset state หรือ rule note ใน Feed |
| High | ยังไม่เห็น Feed more menu สำหรับ Asset ของผู้อื่น | Feed more menu ต้องมี Hide this asset, Report Asset, Block User | เพิ่มเมนูสามจุด, hide success + undo, Report Asset entry และ Block User confirmation |
| High | ยังไม่เห็น Guest restriction state | Guest กด Like, Follow, Chat, Offer, Favorites, Following ต้องเจอ Global Login Required Dialog | เพิ่ม dialog/state สำหรับ guest interaction |
| High | ยังไม่เห็น Feed load more / Infinite Scroll state | Feed ต้องรองรับ Infinite Scroll | เพิ่ม loading state ระหว่างโหลดรายการถัดไป |
| High | ยังไม่เห็น End-of-list state | เมื่อ Scroll ถึงท้ายรายการต้องแสดง `คุณดูรายการทั้งหมดแล้ว` | เพิ่ม state ท้ายรายการ |
| High | ยังไม่เห็น Feed Error state พร้อม retry | โหลด Feed ไม่สำเร็จต้องแสดง Error State และปุ่ม `ลองใหม่` | เพิ่ม error screen/state พร้อม retry |
| High | ยังไม่เห็น Offline cached data state | Feed ต้องแสดงข้อมูลล่าสุดที่โหลดไว้เมื่อ Offline | เพิ่ม offline/cached state หรือ banner |
| Medium | Feed Card ยังไม่ยืนยัน required fields ครบ | Card ต้องแสดง Asset Images, Brand, Model, Price, Posted Time, Owner Name, Like Count, Comment Count | ตรวจและ annotate card fields ให้ครบ |
| Medium | Feed อาจสื่อว่า Comment ทำจาก Feed ได้ | Comment ต้องทำผ่าน Asset Detail เท่านั้น แต่ Share ทำได้จาก Feed | ตัดหรือปรับ Comment action ที่ทำให้เข้าใจผิด และเพิ่ม Share Asset action บน Feed |
| Medium | ยังไม่เห็น Like / Unlike sync กับ Favorites | Like ต้องเพิ่มเข้า Favorites และ Unlike ต้องลบออกจาก Favorites | เพิ่ม state หลัง Like / Unlike และผลต่อ Favorites |
| Medium | ยังไม่เห็น Swipe image / Full Screen Image Viewer จาก Feed card | Feed action ต้องรองรับ Swipe image และเปิด Full Screen Image Viewer | เพิ่ม image interaction state |
| Medium | ยังไม่เห็น navigation destination ชัด | Feed Card ต้องเปิด Asset Detail และ Owner Name/Profile area ต้องเปิด Public Profile | ระบุ tap target และ destination ให้ชัด |

### 03 Search & Filter Module

| Priority | Figma Gap | Master Baseline | Action |
| --- | --- | --- | --- |
| High | ยังไม่เห็น Watch Alert Result List | Watch Alert notification ต้องเปิด Result List ไม่เปิด Asset Detail ตรง | เพิ่ม Watch Alert Result List screen |
| High | ต้องยืนยันว่า Search Result แสดงเฉพาะ Sale | Search แสดงเฉพาะ Asset สถานะ Sale | ตรวจ Figma state/filter ไม่ให้มี Show/Hide/Sold ใน result |
| High | ยังไม่เห็น Guest restriction สำหรับ Create Watch Alert ชัดเจน | Guest Create Watch Alert ไม่ได้ และต้องเห็น Global Login Required Dialog | เพิ่ม guest dialog/state เมื่อกด Create Watch Alert |
| Medium | Search Result card อาจยัง inherit Location จาก Feed | Feed/Search card V1 ห้ามแสดง Location | ตรวจ Search Result card ให้เหลือเฉพาะ Posted Time |
| Medium | ยังไม่เห็น no result / error / retry state ครบ | Empty State ใช้ `ไม่พบข้อมูล` / `No data found`; error ต้องมี retry | เพิ่ม no result และ error state พร้อมปุ่ม `ลองใหม่` |
| Medium | ยังไม่เห็น Result Count / Clear Filters ชัดเจน | Search รองรับ Result Count, Apply Filters, Clear Filters | เพิ่ม result count และ clear filter control ใน Filter/Search Result |
| Medium | ยังไม่เห็น sort options ครบตาม master | Search รองรับ Relevance, Price Low to High, Price High to Low, Newest, Popularity | เพิ่ม sort option set ให้ครบ |
| Medium | ต้องยืนยัน dependent filter โดยเฉพาะ Brand → Model | Search Filter ต้องรองรับ dependent filtering | เพิ่ม state ตัวอย่าง Brand = Rolex แล้ว Model เหลือเฉพาะ Rolex |
| Medium | ต้องยืนยัน Watch Alert criteria ไม่มี Required Field และ Alert Name validation | Watch Alert criteria ไม่มี Required Field แต่ระบบต้องเติมชื่อเริ่มต้นจาก Filter/default และ Alert Name ต้องไม่ว่างตอนบันทึก | ปรับ Create Watch Alert ให้ prefill ชื่อ แก้ไขได้ และแจ้ง validation หาก user ลบชื่อจนว่าง |

### 04 Asset Management Module

| Priority | Figma Gap | Master Baseline | Action |
| --- | --- | --- | --- |
| Must Fix | Edit Asset ใช้ status 2 ชั้น: `Status` และ `Sale Status` | Canonical status มีชุดเดียว: `Sale / Show / Hide / Sold` | ปรับ Figma ให้เหลือ status model เดียว |
| Must Fix | Add/Edit อาจเปิดให้เลือก `Sold` เหมือน status ปกติ | Owner แก้ status ได้ระหว่าง `Sale / Show / Hide`; `Sold` ต้องผ่าน Mark as Sold / Sale Record | แยก Mark as Sold flow ออกจาก Edit Asset |
| Must Fix | จำนวนรูปใน Add/Edit ยังเป็น 3 รูป | Master รองรับ Gallery สูงสุด 10 รูป | ปรับ upload/gallery limit เป็น 10 รูป |
| Must Fix | Required fields ใน Add/Edit ยังไม่แยกตาม `Sale / Show / Hide` | Sale require Photos/Brand/Model/Condition/Description และ Asking Price optional; Show require Photos/Brand/Model; Hide require Photos/Brand | ทำ required indicator, validation state และ status switching note ตาม matrix |
| Must Fix | `Hide` อาจยังใช้ label `Price` หรือ `Asking Price` | `Hide` ไม่ใช้ listing price | เอา listing price treatment ออกจาก `Hide` |
| High | ยังไม่เห็น Sold Asset read-only state ชัดเจน | Sold Asset ไม่สามารถ Edit ข้อมูลหลักได้ | เพิ่ม owner detail/edit state ที่ lock main fields ของ Sold Asset |
| High | ยังไม่เห็น Sale Record / Sold History ครบ | Sold History ต้องเก็บ Sale Date, Buyer, Contact, Sale Price, Payment Method, Attachment | เพิ่ม Sale Record Form และ Sold History display |
| High | ยังไม่เห็น privacy treatment ของ Provenance / Consignment / purchase data | ข้อมูลเหล่านี้เป็น private เห็นเฉพาะ Owner หรือ Admin | ระบุ private section/state และห้ามแสดงใน Public Profile |
| High | ยังไม่เห็น lifecycle impact หลังเปลี่ยน status | Sale/Hide/Show/Sold ต้องส่งผลต่อ Feed, Search, Watch Alert, Public Profile ตาม visibility matrix | เพิ่ม state notes หรือ flow annotation ใน Figma |
| Medium | ยังไม่เห็น Delete confirmation และผลกระทบต่อ Chat/Offer | Deleted Asset หายจาก public surfaces, Chat ยังอยู่, Offer ที่เกี่ยวข้องเป็น Cancelled | เพิ่ม delete confirmation และ deleted impact state |
| Medium | อาจมี field `Location` ใน Add/Edit | Master Asset Management ไม่ได้กำหนด Location เป็น field หลัก และ Feed/Search ไม่แสดง Location | ตัด Location ออกจาก V1 หรือย้ายเป็น future/optional หลัง master decision |

### 05 Asset Detail Module

| Priority | Figma Gap | Master Baseline | Action |
| --- | --- | --- | --- |
| Must Fix | Comment UI ต้องรองรับการตอบโต้แบบ IG โดยไม่กลายเป็น forum thread | Comment รองรับ one-level replies ใต้ comment หลักเท่านั้น และไม่รองรับ reply ซ้อนหลายระดับ | ปรับ comment UI ให้แสดง reply ได้ 1 ชั้นใต้ comment หลัก และป้องกัน reply ต่อจาก reply |
| High | ยังไม่เห็น Deleted Asset state ชัดเจน | Asset Detail ของ Asset ที่ถูกลบต้องแสดง `รายการนี้ไม่พร้อมใช้งานแล้ว` | เพิ่ม deleted/unavailable asset state |
| High | Detail อาจแสดงข้อมูล private ให้ Viewer | Provenance, Consignment, purchase data, Sold History และ Portfolio Value Detail เป็น private | แยก Owner-only private sections และห้ามแสดงใน Viewer/Public mode |
| High | ยังไม่เห็น state ของ Hide / Sold ที่เป็น Owner-only ชัดเจน | Viewer เห็นเฉพาะ Sale/Show; Owner เห็น Sale/Show/Hide/Sold | เพิ่ม Owner-only detail states สำหรับ Hide และ Sold |
| High | Sold Asset ยังไม่ชัดว่า read-only / owner-only | Sold Asset เห็นเฉพาะ Owner และแก้ข้อมูลหลักไม่ได้ | เพิ่ม Sold Mode ที่ lock edit main info และแสดง Sold History |
| Medium | Detail ยังมี field `Location` | Master Asset Detail ไม่ได้กำหนด Location เป็น required display field และ Feed/Search ไม่แสดง Location | ตัด Location ออกจาก V1 detail หรือย้ายเป็น future/optional หลัง master decision |
| Medium | Image/gallery ยังอาจสื่อว่าสูงสุด 3 รูป | Asset Management รองรับ Gallery สูงสุด 10 รูป และ Detail ต้องรองรับ Gallery / Swipe / Full Screen | ปรับ gallery indicator/viewer ให้รองรับได้ถึง 10 รูป |
| Medium | Guest restriction state ยังไม่ครบ | Guest ดูได้ แต่ Like, Follow, Comment, Chat, Offer ต้อง Login | เพิ่ม Global Login Required Dialog สำหรับ guest action |
| Medium | Detail ของ Asset สถานะ Show ต้องรองรับ `Make an Offer` / `Contact seller` | Master อนุญาตให้ `Show` เสนอราคา/ติดต่อได้จาก Detail แต่ยังไม่ขึ้น Feed, Search หรือ Watch Alert | คง Make Offer / Contact Seller บน `Show` และ annotate ว่า entry มาจาก Detail/Public Profile เท่านั้น |
| High | Market Comparison / Expected Profit ยังไม่ชัด | Market Comparison ใช้ Asking Price เทียบ Watch Price API Market Price; Expected Profit เป็น Owner-only เพราะใช้ Purchase Price | เพิ่ม Above/At/Below, No market price และ Owner-only Expected Profit state |
| High | Share Rule บน Asset Detail ยังไม่ครบ channel และ guest permission | Share ใช้ system share sheet เป็น primary, copy public deep link เป็น fallback, Guest share ได้โดยไม่ต้อง Login | เพิ่ม share sheet state, copy link success และ guest share state บน Asset Detail |
| High | Shared deep link display state สำหรับ `Hide` / `Sold` ยังไม่ชัด | non-owner เปิด stale link ของ `Hide` / `Sold` ต้องเห็น Permission Denied / Unavailable state; Owner เปิดของตัวเองต้องเห็น Owner-only detail | เพิ่ม state สำหรับ `Hide` / `Sold` stale deep link แยก non-owner และ owner |
| High | Back button บน normal Asset Detail ที่เปิดจาก external deep link ยังไม่ชัด | ถ้าไม่มี navigation history ให้ fallback ไป Feed | เพิ่ม back button state/annotation บน Asset Detail ที่เปิดจาก external deep link |
| High | Main navigation หลังเปิด Asset Detail deep link ยังไม่ชัด | ทั้ง Guest และ Login ต้องใช้ main navigation ต่อได้หลังเปิด deep link | เพิ่ม state ที่แสดง main navigation available หลังเปิด Asset Detail จาก deep link |
| High | Guest login-required action หลังเปิด deep link ยังไม่ชัด | Guest เปิด public deep link ได้โดยไม่ต้อง Login แต่กด action ที่ต้อง Login ต้องเจอ Global Login Required Dialog | เพิ่ม state ที่ Guest เปิด deep link แล้วกด Like, Follow, Comment, Chat, Make Offer, Report หรือ Block User แล้วเจอ Login Required Dialog |

### 06 Profile Module

| Priority | Figma Gap | Master Baseline | Action |
| --- | --- | --- | --- |
| Must Fix | Public Profile ยังไม่มีแท็บ `All` | Public Profile ต้องมี `All`, `Sale`, `Show` | เพิ่มแท็บ `All` |
| Must Fix | `All` tab ยังไม่ถูกนิยามใน Figma | `All` ต้องแสดง Asset สถานะ Sale และ Show รวมกัน | ระบุ behavior ของ `All` ให้ชัด |
| High | Owner Profile ยังไม่ชัดว่ามี tabs ครบทุกสถานะ | Owner Profile ต้องมี `All`, `Sale`, `Show`, `Hide`, `Sold` | ตรวจ/เพิ่ม tab ของ Owner Profile ให้ครบ |
| High | Total Asset Value / Portfolio entry ยังไม่ชัด | Total Asset Value เป็น entry point สำหรับ Portfolio | เพิ่ม Total Asset Value และ interaction ไป Portfolio |
| High | Portfolio privacy ยังไม่ชัด | Portfolio เห็นเฉพาะ Owner และคำนวณจาก Sale, Show, Hide ไม่รวม Sold | เพิ่ม Owner-only Portfolio state และระบุว่า Sold ไม่รวม |
| High | Public Profile อาจแสดงข้อมูล private | Public Profile ต้องไม่แสดง Provenance, Consignment, Hide, Sold | ตรวจ Public Profile และ asset card/detail entry ไม่ให้มี private data |
| Medium | ยังใช้ label legacy `Collection Show` ในหลายจุด | Canonical term คือ `Show` | ตัดสินใจว่าจะ normalize เป็น `Show` หรือเก็บ legacy label พร้อม mapping |
| Medium | Guest Follow restriction ยังไม่ชัด | Guest กด Follow ต้องเห็น Global Login Required Dialog | เพิ่ม guest dialog/state เมื่อกด Follow |
| Medium | Guest Share Public Profile ยังต้องตรวจ | Share Public Profile เป็น public share action และ Guest ใช้ได้โดยไม่ต้อง Login | เพิ่ม Profile Share Sheet / Copy Link fallback สำหรับ Guest และห้ามเปิด private/profile action อื่น |
| High | Share Asset จาก Profile grid ยังไม่ชัด | Owner Profile และ Public Profile ต้องรองรับ Share asset จาก grid | เพิ่ม Share asset action บน asset card ของ Owner Profile (quick menu) และ Public Profile |
| High | Shared profile deep link display state ยังไม่ชัด | blocked/deleted profile ต้องแสดง unavailable/not found state | เพิ่ม state สำหรับ shared profile deep link ของ blocked และ deleted user |
| Medium | Blocked / unavailable profile state ยังไม่ชัด | Blocked profile ต้องไม่สามารถเข้าถึงได้ตาม Trust & Safety rule | เพิ่ม blocked/unavailable profile state |
| Medium | Report / Block entry ใน Public Profile ยังต้องตรวจ | Public Profile ของ user อื่นต้องมี Report User และ Block User entry ตาม Trust & Safety | เพิ่ม more menu / action state สำหรับ Report User และ Block User |

### 07 Chat Module

| Priority | Figma Gap | Master Baseline | Action |
| --- | --- | --- | --- |
| High | ยังไม่เห็น Asset Deleted state ใน Chat ชัดเจน | Chat ยังอยู่ แต่ Reference Asset ต้องแสดง `รายการนี้ไม่พร้อมใช้งานแล้ว` | เพิ่ม deleted asset reference state ใน Chat Room |
| High | ยังไม่เห็น Asset Sold state / sold continuation ชัดเจน | Asset Sold แล้ว Chat ยังใช้งานได้ | เพิ่ม sold asset reference state และยืนยันว่าส่งข้อความต่อได้ |
| High | ยังไม่เห็น Block / Report entry ใน Chat | Chat ต้องรองรับ Block User และ Report User | เพิ่ม action menu/state สำหรับ block/report |
| High | Offer Accepted / Rejected destination ยังไม่ครบ | Accepted Offer เปิด Chat Room; Rejected Offer เปิด Asset Detail | เพิ่ม destination states จาก notification และ offer cards |
| Medium | Room creation อาจสื่อว่าสร้างเมื่อกด Chat | Chat Room ต้องสร้างเมื่อส่งข้อความแรก | ปรับ empty/pre-chat state ให้ชัดว่า room created หลังส่งข้อความแรก |
| Medium | Different Asset same user rule ยังไม่ชัด | Different Asset ใช้ห้องเดิม แต่ Reference Asset เปลี่ยนเป็น Asset ล่าสุด | เพิ่ม flow/state ที่ reference asset เปลี่ยนตาม asset ล่าสุด |
| Medium | Delete Chat behavior ยังไม่ผูก confirmation ชัดเจน | Delete Chat V1 ซ่อนห้องแชทจาก Chat List เฉพาะฝั่งผู้กด ไม่ลบ server history และไม่กระทบคู่สนทนา | เพิ่ม confirmation state พร้อม copy ว่าเป็นการซ่อนจากรายการของผู้ใช้คนนี้เท่านั้น |
| Medium | Attachment type ยังไม่ล็อกใน Figma | Master รองรับ Text, Image, File, Asset Card, Offer Card | ระบุ allowed attachment/content types ตาม master |
| Medium | Delete Chat restore ไม่อยู่ใน V1 | V1 ไม่มี restore UI และยังคง message/archive ฝั่ง server ตาม retention policy | ห้ามเพิ่ม restore UI ใน Figma V1 |

### 08 Offer Module

| Priority | Figma Gap | Master Baseline | Action |
| --- | --- | --- | --- |
| High | Make Offer entry point อาจกระจายหลายหน้า | Make Offer ทำผ่าน Asset Detail เท่านั้น | จำกัด entry point ใน Figma ให้เริ่มจาก Asset Detail |
| High | Offer Accepted / Rejected destination ยังต้องตรวจให้ครบ | Offer Accepted เปิด Chat Room; Offer Rejected เปิด Asset Detail | เพิ่ม destination state จาก notification และ offer card ให้ตรง master |
| High | ยังไม่เห็น Asset Deleted -> Offer Cancelled state ชัดเจน | Asset Deleted ทำให้ Offer เป็น Cancelled | เพิ่ม cancelled offer state และ unavailable asset reference |
| High | ยังไม่เห็น Asset Sold -> Auto Reject other offers ชัดเจน | Asset Sold ต้อง Auto Reject Offer อื่น | เพิ่ม sold impact state และ auto rejected offer state |
| Medium | Incoming Offers อาจรวม offer ที่ action แล้ว | Incoming Offers ควรแสดง Pending Offer ที่รอ Seller ตัดสินใจ | ตรวจ list/filter ให้ Accepted, Rejected, Cancelled หลุดจาก Incoming Offers |
| Medium | Offer ที่อ่านแล้วแต่ยังไม่ action อาจหายจาก Incoming Offers | Pending Offer ที่ยังไม่ Accept/Reject ต้องยังอยู่ใน Incoming Offers | เพิ่ม read/no-action state |
| Medium | Offer Card ใน Chat ยังต้อง lock state ให้ครบ | Chat Room รองรับ Offer Card | เพิ่ม Offer Card state: Pending, Accepted, Rejected, Cancelled |
| Medium | Guest Make Offer restriction ยังไม่ชัด | Guest กด Offer ต้องเห็น Global Login Required Dialog | เพิ่ม guest dialog/state เมื่อกด Make Offer |
| Medium | Counter Offer / Withdraw Offer อาจโผล่ใน prototype | V1 ไม่มี Counter Offer และไม่มี Withdraw Offer | ซ่อน action หรือย้ายเป็น future label |
| Medium | Asset สถานะ Show ต้องรองรับ Make Offer / Contact Seller จาก Detail | Master อนุญาตให้ Offer/Contact บน `Show` เพื่อรองรับผู้สนใจเสนอราคาหรือสอบถาม | ระบุว่า `Show` สร้าง Offer ได้จาก Asset Detail เท่านั้น แต่ไม่ปรากฏใน Feed/Search/Watch Alert |
| Medium | Offer Cancelled destination ต้องชัด | Master ระบุ Offer Cancelled -> Chat Room + Focus Offer Card | เพิ่ม cancelled offer card destination state |

### 09 Notification Module

| Priority | Figma Gap | Master Baseline | Action |
| --- | --- | --- | --- |
| Must Fix | Figma มี notification type เกินจาก master เช่น `Like Valuation`, `Market Update`, `Sale Success` | Master รองรับ Like, Comment, Follow, Offer, Watch Alert | ลบ/ซ่อน type นอก scope หรืออัปเดต master ก่อน |
| Must Fix | Figma อาจใช้ Chat / New Message / Moderation / Account Action เป็น FO notification baseline | Master ระบุว่า Chat / New Message ไม่เป็น Notification Center type และแจ้งเตือนเฉพาะในเมนู Chat ด้วย unread badge/count | ซ่อน type นอก baseline หรือย้ายเป็น Future / Back Office scope |
| High | Destination state ยังไม่ครบ | Like ไป Asset Detail, Comment ไป Asset Detail และ focus comment, Watch Alert ไป Result List, New Offer ไป Chat Room + Focus Offer Card, Offer Accepted ไป Chat Room, Offer Rejected ไป Asset Detail, Offer Cancelled ไป Chat Room + Focus Offer Card | เพิ่ม destination screens/states ให้ครบ |
| High | Watch Alert notification อาจเปิด Asset Detail ตรง | Watch Alert Notification ต้องเปิด Watch Alert Result List | เพิ่ม Watch Alert Result List และ route ให้ชัด |
| High | Comment notification ยังไม่เห็น focus comment state | Comment ต้องเปิด Asset Detail และ Focus Comment | เพิ่ม state ที่ scroll/focus ไป comment เป้าหมาย |
| Medium | Follow notification destination ยังไม่ชัด | Follow notification ควรเปิด Public Profile | เพิ่ม destination state ไป Public Profile |
| Medium | Read / Unread และ badge count ของ Notification Center ยังต้องตรวจให้ครบ | Notification Center ต้องรองรับ read/unread state และ unread count สำหรับ type ที่อยู่ใน baseline เท่านั้น | เพิ่ม read/unread visual state และ badge count behavior โดยไม่รวม Chat/New Message |
| Medium | Deleted Asset destination ยังไม่ชัด | Deleted Asset detail ต้องแสดง `รายการนี้ไม่พร้อมใช้งานแล้ว` | เพิ่ม unavailable state เมื่อ notification อ้างถึง asset ที่ถูกลบ |
| Medium | Guest Notification Center restriction ยังไม่ชัด | Guest ใช้ feature ที่ต้อง Login ต้องเห็น Global Login Required Dialog | เพิ่ม login required state เมื่อ guest เข้า Notification Center |
| Medium | New Offer destination ต้องชัด | Master ระบุ New Offer -> Chat Room + Focus Offer Card | เพิ่ม offer card focus state |
| Medium | Offer Cancelled destination ต้องชัด | Master ระบุ Offer Cancelled -> Chat Room + Focus Offer Card | เพิ่ม cancelled offer card state และ unavailable asset reference |

### 10 Watch Alert Module

| Priority | Figma Gap | Master Baseline | Action |
| --- | --- | --- | --- |
| High | ยังไม่เห็น Watch Alert Result List ชัดเจน | Watch Alert notification ต้องเปิด Result List ไม่เปิด Asset Detail ตรง | เพิ่ม Watch Alert Result List screen |
| High | Create Watch Alert อาจไม่ได้เริ่มจาก Search Filter | Watch Alert สร้างจาก Search Filter | จำกัด entry point และ annotate flow จาก Search Filter |
| High | ต้องยืนยันว่า Watch Alert match เฉพาะ Sale | Watch Alert Match เฉพาะ Asset สถานะ Sale | ตรวจ result/filter state ไม่ให้มี Show, Hide, Sold |
| High | Guest Create Watch Alert restriction ยังไม่ชัด | Guest ใช้ Watch Alert ไม่ได้และต้องเห็น Global Login Required Dialog | เพิ่ม guest dialog/state เมื่อกด Create Watch Alert |
| Medium | ต้องยืนยันว่า criteria ไม่มี Required Field | Watch Alert criteria ไม่มี Required Field | Create flow ต้อง save ได้แม้ไม่มี criteria หรือมี criteria บางส่วน |
| Medium | Alert name auto-generate และ validation ยังไม่ชัด | ระบบต้องเติมชื่อเริ่มต้นจาก filter/default และ Alert Name ต้องไม่ว่างตอน save | เพิ่ม default/generated name state และ empty-name validation |
| Medium | Filter dependency ต้องตรง Search | Watch Alert ใช้ filter logic เดียวกับ Search | เพิ่มตัวอย่าง Brand -> Model dependency |
| Medium | Lifecycle impact ยังไม่ชัด | Sale -> Sold/Hide/Show หายจาก result, Hide/Show -> Sale กลับมา match ได้ | เพิ่ม state notes หรือ flow annotation |
| Medium | Block user impact ยังไม่ชัด | Asset ของผู้ถูก Block ต้องหายจาก Watch Alert Result ทันที | เพิ่ม blocked-user result filtering state |
| Medium | Delete Alert confirmation และผลลัพธ์หลังลบยังต้องตรวจ | Delete Alert ต้องหยุด notification ทันที | เพิ่ม confirmation และ stopped notification state |

### 11 Social Module

| Priority | Figma Gap | Master Baseline | Action |
| --- | --- | --- | --- |
| Must Fix | Comment UI ต้องรองรับการตอบโต้แบบ IG โดยไม่กลายเป็น forum thread | Comment รองรับ one-level replies ใต้ comment หลักเท่านั้น และไม่รองรับ reply ซ้อนหลายระดับ | ปรับ comment UI ให้แสดง reply ได้ 1 ชั้นใต้ comment หลัก และป้องกัน reply ต่อจาก reply |
| Must Fix | Feed อาจสื่อว่า Comment / Share ทำจาก Feed ได้ | Comment และ Share ต้องทำผ่าน Asset Detail เท่านั้น | ตัด direct comment/share action จาก Feed หรือให้กดแล้วเปิด Asset Detail |
| High | Guest state สำหรับ Like / Comment / Follow ยังไม่ครบ | Guest กด action ที่ต้อง Login ต้องเห็น Global Login Required Dialog | เพิ่ม guest dialog/state ทุก social action |
| High | Like / Unlike ต้อง sync Favorites | Like สำเร็จต้องเพิ่ม Favorites, Unlike ต้องลบออก | เพิ่ม state note หรือ interaction mapping กับ Favorites |
| High | Following Feed ต้องแสดงเฉพาะ Sale | Following Feed แสดง Asset Sale ของ user ที่ follow | ตรวจ Figma/annotation ไม่ให้ Show, Hide, Sold โผล่ |
| Medium | Owner Like Asset ตัวเองอาจถูก block ใน UI | Owner สามารถ Like Asset ตัวเองได้ | ตรวจ owner detail/feed state |
| Medium | Edit Comment อาจยังโผล่ใน action menu | V1 ไม่มี Edit Comment | ซ่อน edit action หรือย้ายเป็น future |
| Medium | Delete Comment confirmation ยังไม่ชัด | Comment รองรับ Delete Comment | เพิ่ม delete confirmation และ permission state |
| Medium | Report Comment entry ยังต้องตรวจ | Comment ใน Asset Detail ต้องรองรับ Report Comment ตาม Trust & Safety | เพิ่ม comment action menu และ Report Comment flow |
| Medium | Comment notification destination ยังไม่เห็น focus state | Comment notification เปิด Asset Detail และ Focus Comment | เพิ่ม state ที่ focus comment เป้าหมาย |
| Medium | Follow notification destination ยังไม่ชัด | Follow notification ควรเปิด Public Profile | เพิ่ม destination state ไป Public Profile |
| Medium | Share detail behavior ต้องมี channel/fallback state | Master ระบุ system share sheet เป็น primary และ copy public deep link เป็น fallback | เพิ่ม share sheet, copy link success และ unavailable/deleted link state |

### 12 Board Module

| Priority | Figma Gap | Master Baseline | Action |
| --- | --- | --- | --- |
| Must Fix | Board อาจถูกออกแบบเป็น user-generated post/community discussion | Board เป็น Community Content / Article Area | ปรับ wording และ flow ให้เป็น Article Board ไม่ใช่ forum/post board |
| Must Fix | Figma/PRD อาจมี Create Post / Edit Post / Delete Post สำหรับ user | บทความสร้างและจัดการโดย Admin ผ่าน Back Office เท่านั้น | ตัด FO create/edit/delete article flow ออกจาก V1 |
| High | ต้องยืนยัน section/category ครบตาม master | รองรับ Feature Article, Trending Now, Journal Board, Watch Brands, Watch 101, Watch Apparel, Watch Events | map section/category ใน Figma ให้ครบ |
| High | Search Article และ Category Filter ต้องชัด | Master รองรับ Search Article และ Category Filter | เพิ่ม search state, category filter state และ no-result state |
| High | Article Detail ต้องรองรับ Like / Share | User ทั่วไปอ่าน, Like และ Share บทความได้ใน Phase 1 | เพิ่ม Like/Share action บน Article Detail |
| Medium | Infinite Scroll state ยังต้องตรวจ | Board รองรับ Infinite Scroll | เพิ่ม load more/loading/end state สำหรับ article list |
| Medium | Guest behavior ของ Article Like ยังต้องตัดสินตาม login baseline | Master ระบุ user ทั่วไป Like/Share ได้ แต่ global login rule ระบุ Like ต้อง login | ใช้ Member สำหรับ Article Like จนกว่า master แยก Article Like สำหรับ Guest |
| Medium | Menu label `Community` อาจไม่ตรงกับ master module name | Master module คือ Board | normalize label หรือ map `Community` เป็น Board ให้ชัด |
| Medium | Article Share สำหรับ Guest ต้องชัด | Master lock ให้ Article Share เป็น public share action | เพิ่ม Guest share state โดยไม่ต้อง Login |
| High | Article Comment / Report Article ต้องไม่ขยายเป็น Board V1 interaction | Master ระบุ Article Like / Share และ `Report article` ที่ map เข้า Trust & Safety `Report Board Content` | ซ่อน Article Comment; ใช้ Article Detail overflow menu label `Report article`, reason sheet, success state และ error states ตาม Board Module |

### 13 Settings Module

| Priority | Figma Gap | Master Baseline | Action |
| --- | --- | --- | --- |
| Must Fix | Settings ยังไม่มี Theme Mode | Settings ต้องมี Theme Mode: Dark Mode / Light Mode | เพิ่ม setting สำหรับ Theme Mode |
| Must Fix | Settings เดิมอาจระบุ Delete Account เป็น future หรือยังไม่มี state หลังลบสำเร็จ | Master ระบุ Delete Account อยู่ใน Settings baseline | เพิ่ม Delete Account ภายใน `About your account`, confirmation/risk state, `Account deletion started` success modal, Sign In destination และ API failure/retry state |
| High | Language setting ยังไม่ชัด | Settings ต้องมี Language: English / Thai | เพิ่ม language selector และ selected state |
| High | Email field ต้อง lock หลัง verification | Auth rule ระบุ Email ไม่สามารถเปลี่ยนได้หลังยืนยันแล้ว | แสดง Email Display เป็น read-only หรือ disabled edit |
| High | Settings menu ต้องครบ master list | Master รองรับ Account, Your app and media, Notifications, More info and support และ Sign Out | ใช้ locked order และตัดเมนูนอก baseline |
| Medium | Help / About content ต้องล็อกตาม Figma ล่าสุด | Master ระบุ Help และ About app | ใช้ Help contact content และ About app content ตาม Settings Module |
| Medium | Legal labels ต้องตรง master | Master ใช้ Privacy Policy และ Terms of Use | ใช้ label `Terms of Use` เป็น source of truth |
| Medium | Sign Out confirmation ต้องชัด | Sign Out ต้อง clear session และกลับ Sign In | เพิ่ม confirmation และ signed-out destination |
| Medium | Change Password ต้องไม่กลายเป็น Settings-owned flow และยังต้องมี validation states ครบ | Master อนุญาตเป็น Auth-linked entry สำหรับบัญชี Email / Password | แสดง entry เฉพาะ account type ที่รองรับและ route ไป Auth flow; เพิ่ม Current/New/Confirm fields, field-level errors, success และ API error state |
| Medium | Notification Settings ต้องไม่รวม type นอก baseline | รองรับเฉพาะ Like, Comment, Follow, Offer, Watch Alert | เพิ่ม toggle เฉพาะ baseline type และไม่รวม Chat/New Message |

### 14 Portfolio Module

| Priority | Figma Gap | Master Baseline | Action |
| --- | --- | --- | --- |
| High | Portfolio privacy ยังไม่ชัด | Portfolio เห็นเฉพาะ Owner | เพิ่ม Owner-only Portfolio state และห้าม Public Profile เข้าถึง |
| High | Total Asset Value / Portfolio entry ยังไม่ชัด | Total Asset Value เป็น entry point สำหรับ Portfolio | เพิ่ม interaction จาก Owner Profile ไป Portfolio |
| High | Portfolio calculation ต้อง lock status | Portfolio คำนวณจาก Sale, Show, Hide | annotate calculation source ให้ชัด |
| High | Sold อาจถูกนับรวมใน Portfolio Value | Portfolio ไม่รวม Sold | ระบุว่า Sold excluded และแยกไป Sold History |
| High | Sold History fields ยังไม่ครบ | Sold History ต้องเก็บ Sale Date, Buyer, Contact, Sale Price, Payment Method, Attachment | เพิ่ม field display/state ให้ครบ |
| High | Public Profile อาจแสดง Portfolio/private data | Portfolio Value Detail, Sold History, Purchase data เป็น private | ห้ามแสดงใน Public Profile/Viewer mode |
| Medium | Empty state ของ Portfolio/Sold History ยังไม่ชัด | Empty State ใช้ `ไม่พบข้อมูล` / `No data found` | เพิ่ม empty state ตามข้อความกลาง |
| Medium | Deleted Asset treatment ยังไม่ชัด | Deleted Asset หายจาก public surfaces และไม่ควรคำนวณ Portfolio | ระบุ deleted asset ไม่ถูกนับใน Portfolio |
| High | Market Value source / Watch Price API formula ต้องแสดงให้ชัด | Current Value ใช้ Watch Price API -> Purchase Price fallback -> No Valuation | เพิ่ม valuation source label, fallback state และ coverage count |
| High | Gain/Loss formula ยังไม่ชัด | Unrealized Gain/Loss = Current Value - Purchase Price และคำนวณเฉพาะรายการที่มีข้อมูลพอ | เพิ่ม Gain/Loss display, unavailable state และ coverage count |
| High | Realized Gain/Loss ของ Sold History ยังไม่ชัด | Realized Gain/Loss = Sale Price - Purchase Price และ Sold ต้องแยกจาก Portfolio Value | เพิ่ม Realized Gain/Loss, Realized Gain %, unavailable state |
| High | Expected Profit / Market Comparison ยังไม่ชัด | Expected Profit = Asking Price - Purchase Price; Market Comparison = Asking Price เทียบ Watch Price API Market Price | เพิ่ม Owner-only Expected Profit, Above/At/Below และ No market price state |
| Medium | Holding Period / Top Brand / YTD ยังไม่ชัด | V1 รองรับ Holding Period, Top 3 Brand Holdings และ YTD วิธี A | เพิ่ม Holding Period, Top Brand Holdings, YTD snapshot/fallback state |
| Medium | Benchmark / IRR อาจเกิน baseline | Benchmark, cash-flow adjusted return และ IRR เป็น future | Annotate เป็น future หากมีใน Figma |

### 15 Trust & Safety Module

| Priority | Figma Gap | Master Baseline | Action |
| --- | --- | --- | --- |
| High | Block / Report entry ใน Chat ยังไม่ชัด | Chat ต้องรองรับ Block User และ Report User | เพิ่ม action menu/state ใน Chat |
| High | Block impact ต่อ Feed/Search/Watch Alert Result ยังต้องระบุ | Asset ของผู้ถูก Block ต้องหายจาก Feed, Search, Watch Alert Result ทันที | เพิ่ม annotation หรือ state filtering ให้ครบ |
| High | Block impact ต่อ Following Feed ยังไม่ชัด | ความสัมพันธ์ Follow ระหว่างกันต้องไม่ถูกใช้ในการแสดง Following Feed | เพิ่ม following-feed filtering rule |
| High | Report type ต้อง lock ให้ตรง master | Report รองรับ Asset, User, Comment, Board Content | ตรวจ Figma report forms/type labels ให้ตรง |
| High | Report submit อาจสื่อว่า content หายทันที | Report ไม่ทำให้ Asset/Content หายทันที | เพิ่ม success state ที่ไม่ remove content จนกว่า Admin moderation |
| High | Moderation flow / Admin review SLA ยังไม่ชัด | Admin ดำเนินการภายใน 24 ชั่วโมงสำหรับ Report ที่เข้ามา | เพิ่ม Back Office handoff note และ 24h SLA |
| High | Apple compliance coverage ต้องครบ | ต้องรองรับ Report, Block, Terms of Use, Privacy Policy, Moderation Flow | ตรวจครบทุก entry/state |
| Medium | Terms label อาจใช้ capitalization ไม่ตรง | Master ใช้ `Terms of Use` | normalize label เป็น `Terms of Use` |
| Medium | Legal consent ทุก sign up channel ยังต้องตรวจ | ทุกช่องทางสมัครต้องยอมรับ Terms of Use และ Privacy Policy ก่อนสมัคร | ตรวจ Email/Google/Apple sign up consent |
| Medium | Blocked/unavailable profile state ยังไม่ชัด | Blocked content/user ต้องไม่เข้าถึงตาม Trust & Safety rule | เพิ่ม blocked/unavailable state |
| High | Block แล้ว chat history / new message behavior ยังไม่ถูกระบุครบใน Figma | Master ระบุให้เก็บ chat history เดิมแบบ read-only และปิดการส่งข้อความใหม่หลัง block | เพิ่ม blocked chat read-only state ใน Figma |
| Medium | Moderation notification หลัง report/action ยังไม่อยู่ใน Notification baseline | Product review แนะนำให้ moderation/account/system notification ไม่อยู่ใน FO V1 | ย้ายเป็น future หรือ Back Office scope |

### 16 Integrations Module

| Priority | Figma Gap | Master Baseline | Action |
| --- | --- | --- | --- |
| Must Fix | Payment Gateway หรือ payment UI อาจถูกมองว่าอยู่ใน V1 | Payment Gateway เป็น Phase 2 เท่านั้น | ซ่อน/ติดป้าย future ให้ทุก payment flow |
| High | Apple / Google flow ยังไม่แยกจาก Email OTP ชัด | Apple และ Google ใช้ SSO และไม่ต้อง OTP | ระบุ SSO path ที่ข้าม OTP ใน auth flow |
| High | Push notification permission / destination ยังไม่ชัด | FCM ใช้สำหรับ Push Notifications และ notification destination ต้องตรง master | เพิ่ม permission state และ destination mapping |
| High | Image upload/display ยังไม่เห็น CDN/error/loading state | Image Storage / CDN ใช้จัดเก็บและแสดงรูปภาพ | เพิ่ม image upload, loading, failure, retry และ placeholder state |
| Medium | Watch Price API ยังไม่ผูกกับ Portfolio valuation ชัด | Watch Price API เป็น Current Value source ลำดับแรก และต้อง fallback ได้เมื่อ unavailable | ระบุ valuation source, fallback และ no market price state |
| Medium | Integration failure states ยังไม่ครบ | External integration ต้องมี safe fallback | เพิ่ม provider error, network error, timeout และ retry state |

### 17 Non-Functional Requirements

| Priority | Figma Gap | Master Baseline | Action |
| --- | --- | --- | --- |
| High | Feed performance/loading state ยังไม่ครบ | Feed ควรโหลดภายใน 2 วินาที, Infinite Scroll, end-of-list | เพิ่ม loading, load-more และ end-of-list state |
| High | Image loading/fallback state ยังไม่ชัด | รูปภาพต้อง Lazy Load | เพิ่ม skeleton/placeholder/error image state |
| High | Private data อาจปรากฏใน public screens | Private Asset Data ต้องตรวจสิทธิ์ทุกครั้ง | แยก Owner-only และ Viewer/Public state ให้ชัด |
| High | Admin action audit ไม่ถูกระบุใน admin/back office flow | Admin Action ต้องมี Audit Trail | เพิ่ม audit trail requirement ใน Back Office note |
| Medium | ภาษาไทย/อังกฤษยังไม่เห็น coverage ครบ | รองรับ TH/EN | ตรวจ copy และพื้นที่ข้อความสำหรับสองภาษา |
| Medium | ราคาอาจมีหลาย currency format | ราคาแสดงเป็น THB | Normalize price format และ currency label |
| Medium | Empty state copy ไม่สม่ำเสมอ | ใช้ข้อความกลาง `ไม่พบข้อมูล` / `No data found` | Normalize empty state |
| Medium | Accessibility state ยังไม่ถูก annotate | Font size และ Screen Reader ต้องรองรับตาม platform | เพิ่ม note สำหรับ dynamic font และ accessibility labels |

### 18 Admin Scope Note

| Priority | Figma Gap | Master Baseline | Action |
| --- | --- | --- | --- |
| Must Fix | Figma อาจสื่อว่า Admin เป็น mobile app user type | Admin ใช้งานผ่าน Web Back Office เท่านั้น | แยก Admin flow ออกจาก mobile app หรือ annotate ว่าเป็น Back Office |
| High | Report flow ยังไม่แสดงผลต่อ Admin moderation | Report ต้องถูกตรวจโดย Admin และ content หายหลัง moderation เท่านั้น | เพิ่ม report submitted state และ admin review note |
| High | Board content management ยังไม่แยก owner ชัด | บทความสร้างและจัดการโดย Admin ผ่าน Back Office | Annotate Board content as Admin-managed |
| High | Audit Trail ยังไม่ถูกระบุ | Admin Action ต้องมี Audit Trail ใน Back Office | เพิ่ม audit trail requirement ใน Back Office scope |
| Medium | 24-hour handling SLA ยังไม่ถูกระบุ | Admin ดำเนินการภายใน 24 ชั่วโมงสำหรับ Report | เพิ่ม SLA note ใน moderation queue |
| Medium | Sold Asset Admin Review ยังไม่ชัด | Sold Asset เก็บไว้เพื่อ Admin Review | เพิ่ม admin-review availability note |

## Final Handoff Note

Checklist นี้ใช้ร่วมกับเอกสาร PRD รายโมดูล `00-18` โดยให้ยึด `TukDaeng_Master_Product_Definition.md` เป็น source of truth สูงสุด และใช้ `00_GLOBAL_RULES_MODULE.md` กับ `00_NAVIGATION_AND_CROSS_MODULE_FLOW.md` เป็น baseline สำหรับกฎข้ามโมดูล

ลำดับการใช้งานที่แนะนำ:

1. แก้รายการ Priority `Must Fix` ก่อน
2. แก้รายการ Priority `High` ก่อนส่ง Dev / QA
3. ใช้รายการ `Medium` เป็น checklist ก่อนปิด design sign-off
4. รายการที่เป็น `Needs Decision` ต้องกลับไปตัดสินใน master หรือ product decision log ก่อน implement
