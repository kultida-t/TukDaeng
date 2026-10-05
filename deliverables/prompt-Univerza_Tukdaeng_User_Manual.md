# MISSION: สร้างคู่มือผู้ใช้งาน Univerza Tukdaeng (User Manual) ฉบับสมบูรณ์

## วัตถุประสงค์
สร้างคู่มือการใช้งานแอปพลิเคชัน "Univerza Tukdaeng" (ตึกแดง) ฉบับ Official
โดยใช้ภาพหน้าจอจากแอปจริงเท่านั้น ครอบคลุมทุกหน้าจอและทุก flow การใช้งาน
พร้อมเปรียบเทียบมุมมองการใช้งานตามสถานะผู้ใช้ให้ชัดเจน

## ข้อมูลอ้างอิง
- แอปจริง (iOS): https://apps.apple.com/th/app/univerza-tukdaeng/id6811926515?l=th
- แอปจริง (Android): https://play.google.com/store/apps/details?id=com.univerza.tukdaeng
- Web deployment ของแอปจริง (fallback only): https://tukdaeng.univerza.co
- API backend: https://tukdaeng-api.mrfox.expert/api
- Project root: C:\Users\Admin\Desktop\TukDaeng
- เอกสารสเปค FO app: C:\Users\Admin\Desktop\TukDaeng\FrontOffice\
  (อ่านทุกไฟล์ module 00–18 เป็นข้อบังคับ เพื่อทำ Screen Inventory ที่ครบถ้วน)
- PRD เพิ่มเติม: PRD\, SourceInputs\, appstore_page.html
- ตัวอย่างรูปแบบผลลัพธ์ที่ต้องการ: C:\Users\Admin\Downloads\Family_Office_UI_Rulebook_v1.0.pdf
  (ศึกษา layout, ความหนาแน่นของข้อมูล, callout, ตาราง, กล่อง tips/warning แล้วทำให้เทียบเท่าหรือดีกว่า)
- บัญชีทดสอบจริง: user: tukdaeng.user1@gmail.com / password: 1Qazxsw2*
  (เป็น Google account จริงด้วย — ใช้ sign-in ทั้ง Play Store และแอปตึกแดง
  ผ่าน "ดำเนินการต่อด้วย Google" ได้; สมัครสมาชิกตึกแดงแล้วเมื่อ 2026-10-05)

## Output ที่ต้องส่งมอบ
- C:\Users\Admin\Desktop\TukDaeng\deliverables\Univerza_Tukdaeng_User_Manual.html
- C:\Users\Admin\Desktop\TukDaeng\deliverables\Univerza_Tukdaeng_User_Manual.pdf
- โฟลเดอร์ภาพหน้าจอจริงทั้งหมด: C:\Users\Admin\Desktop\TukDaeng\screenshots\user-manual\

## ขั้นตอนที่ 1 — Screen Inventory (ทำก่อนจับภาพ)
อ่าน FrontOffice module docs ทั้งหมดแล้วสร้าง checklist หน้าจอให้ครบ:
01 Authentication / 02 Feed / 03 Search & Filter / 04 Asset Management /
05 Asset Detail / 06 Profile / 07 Chat / 08 Offer / 09 Notification /
10 Watch Alert / 11 Social / 12 Board / 13 Settings / 14 Portfolio /
15 Trust & Safety (+ onboarding, guest mode, empty/error/loading states)
บันทึก checklist เป็นไฟล์ไว้ตรวจความครบตอนจบ

## ขั้นตอนที่ 2 — จับภาพหน้าจอจริง (ห้ามวาด mock แทนภาพจริง)

ช่องทางหลัก — **Android Emulator + แอปจริงจาก Play Store** (verified end-to-end 5 ต.ค. 2026):
- Android SDK: %LOCALAPPDATA%\Android\Sdk (adb 36.0.0)
- AVD: ใช้ **Medium_Phone_API_36.0 เท่านั้น**
  ⚠️ Pixel_9 AVD ใช้ image google_apis_playstore_ps16k → system_server crash บนเครื่องนี้ ห้ามใช้
- Boot: `emulator -avd Medium_Phone_API_36.0 -no-snapshot -gpu host`
  (รอ sys.boot_completed=1 ~2-4 นาที, เครื่องเก่า boot ช้า — emulator อาจ ANR/crash เป็นช่วง ให้รอ/retry)
- Google sign-in บน emulator: tukdaeng.user1@gmail.com / 1Qazxsw2*
  (เป็น Google account จริง — verified sign-in ผ่าน, recovery phone +66 86 786 2162 มีอยู่แล้ว ห้ามแก้)
- ติดตั้งแอป: `adb shell am start -a android.intent.action.VIEW -d 'market://details?id=com.univerza.tukdaeng' com.android.vending` แล้วกด Install
  (verified: ติดตั้งสำเร็จ package:com.univerza.tukdaeng)
- Capture: `adb exec-out screencap -p > screenshots\user-manual\<name>.png`
- Navigate: `adb shell input tap <x> <y>` (หน้าจอ 1080x2400, app เป็น webview
  → uiautomator dump ไม่เห็น element ใช้พิกัดจาก screenshot เอา)
- **ล็อกอินแอป**: บัญชี tukdaeng.user1@gmail.com ไม่เคยสมัครสมาชิกตึกแดง
  → ใช้ "ดำเนินการต่อด้วย Google" ในหน้าสมัครสมาชิก (verified สำเร็จ — ไม่ต้อง OTP)
  แล้วจะ login เป็น member ได้เลย (ชื่อโปรไฟล์: Kultida Tangtrakulsang)
- Owner view = โพสต์/สินทรัพย์ของบัญชีนี้ / Viewer view = ของผู้ใช้อื่น (viewer)
- Guest view = ปุ่ม "สำรวจนาฬิกา" ในหน้า onboarding entry (ไม่ต้อง login)

Fallback (ถ้า emulator พังจริงๆ):
1. Web deployment ของแอปจริง https://tukdaeng.univerza.co + Playwright
   launch args: ['--disable-web-security'] (API block CORS)
   ⚠️ ใช้เฉพาะเมื่อจำเป็น — ผู้ใช้ต้องการภาพ native app เป็นหลัก
2. iPhone จริง + mirroring หรือผู้ใช้จับภาพตาม Shot List

เส้นทางที่ลองแล้วใช้ไม่ได้ (อย่าเสียเวลาซ้ำ):
- Aurora Store anonymous — install fail "Could not get files" + ANR
- APKPure ไม่มีแอปนี้ / APKCombo download ติด JS/Cloudflare
- Pixel_9 AVD (ps16k image) crash บนเครื่องนี้

กติกาการจับภาพ:
- จับ "ทุก state" ของทุก flow ไม่ใช่แค่หน้าหลัก:
  เช่น login form → OTP → success, asset detail (มุมมองคนดู vs เจ้าของ),
  offer flow ฝั่งผู้ซื้อ + ฝั่งผู้ขาย, empty state, error state, modal/confirm ทุกอัน
- ตั้งชื่อไฟล์เป็นระบบ เช่น 02-feed-guest.png, 02-feed-member.png, 05-assetdetail-owner.png
- ข้อมูลส่วนตัวที่ไม่เกี่ยวกับบัญชีทดสอบ ให้ mask/blur ก่อนใช้ในคู่มือ

ภาพที่มีอยู่แล้วและใช้ประกอบได้:
- deliverables\appstore-screenshots\ (6 ภาพจาก App Store listing — เป็น UI จริง
  แต่ครอบแค่ 6 หน้าจอ ใช้เสริมได้ ไม่ใช้แทนภาพจริงทั้งชุด)

กติกาการจับภาพ:
- จับ "ทุก state" ของทุก flow ไม่ใช่แค่หน้าหลัก:
  เช่น login form → OTP → success, asset detail (มุมมองคนดู vs เจ้าของ),
  offer flow ฝั่งผู้ซื้อ + ฝั่งผู้ขาย, empty state, error state, modal/confirm ทุกอัน
- ตั้งชื่อไฟล์เป็นระบบ เช่น 02-feed-guest.png, 02-feed-member.png, 05-assetdetail-owner.png
- ข้อมูลส่วนตัวที่ไม่เกี่ยวกับบัญชีทดสอบ ให้ mask/blur ก่อนใช้ในคู่มือ

## ขั้นตอนที่ 3 — เนื้อหาคู่มือ (ภาษาไทยเป็นหลัก, term เทคนิคใช้ภาษาอังกฤษตามแอป)
ทุกหน้าคู่มือต้องมี:
1. ภาพหน้าจอจริงในกรอบมือถือ + หมายเลข callout ชี้องค์ประกอบสำคัญ
2. Step-by-step flow การใช้งาน (กดอะไร → เกิดอะไร → ไปหน้าไหน)
3. ตารางเปรียบเทียบมุมมองผู้ใช้ ครบทุกสถานะที่เกี่ยวข้องกับหน้านั้น:

   | สถานะผู้ใช้ | เห็นอะไรบ้าง | ทำอะไรได้ | ทำอะไรไม่ได้ / ถูกพาไป Login |
   |---|---|---|---|
   | Guest (ไม่ login) | ... | ... | ... |
   | Member - มุมมองคนดู | ... | ... | ... |
   | Member - เจ้าของสินทรัพย์ | ... | ... | ... |
   | Member - ผู้ซื้อ/ผู้ขายใน Offer | ... | ... | ... |

4. กล่อง Tips/Best Practices (ทอง) และ ข้อควรระวัง/Warnings (ส้ม/แดง)
5. Navigation context: เข้าถึงหน้านี้ได้จากไหน กลับไปไหน breadcrumb/tab ไหน

ครอบคลุมเปรียบเทียบ Guest vs Login อย่างน้อย: feed browsing, search/filter,
asset detail, การกด favorite/chat/offer (login wall), profile, board/social
และเปรียบเทียบ Owner vs Viewer อย่างน้อย: asset detail, portfolio,
offer management, chat threads, edit/delete actions

## ขั้นตอนที่ 4 — รูปแบบและคุณภาพ
- HTML print-ready แนวนอน A4 (297×210mm) style เดียวกับตัวอย่าง rulebook:
  cover page, TOC, chapter badges, footer แบรนด์ + เลขหน้า
- ฟอนต์ Prompt/Plus Jakarta Sans, โทนแบรนด์ตึกแดง (#e50914 + navy #08172e + gold #c5a059)
- ภาพทุกภาพ embed/อ้างอิงถูกต้อง ไม่มี broken image, PDF export ครบทุกหน้า
- ตรวจสอบย้อนกลับกับ Screen Inventory จากขั้นตอนที่ 1 — ทุกหน้าจอต้องถูก cover

## ข้อห้าม
- ห้ามแตะ/แก้ไขไฟล์ prototype BackOffice และ protected screens ใดๆ (ดู AGENTS.md)
- ห้ามใส่ภาพจำลองที่วาดขึ้นแทนภาพหน้าจอจริง
- ห้าม hardcode รหัสผ่านลงในคู่มือที่เผยแพร่ (ใช้เฉพาะตอน login เพื่อจับภาพ)

## Definition of Done
1. Screen inventory checklist ครบและทุก item มีภาพจริง + คำอธิบายในคู่มือ
2. ทุกหน้ามีตารางเปรียบเทียบมุมมองผู้ใช้ตามสถานะ
3. HTML เปิดได้สมบูรณ์ + PDF landscape ครบทุกหน้า ไม่มีภาพแตก
4. รายงานสรุป: จำนวนหน้าจอที่ cover, จำนวนภาพจริงที่ใช้, จุดที่ต้องให้ผู้ใช้จับภาพเพิ่ม (ถ้ามี)
