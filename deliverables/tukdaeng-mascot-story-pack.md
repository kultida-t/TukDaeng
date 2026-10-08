# TukDaeng Mascot Story Pack (3D cartoon, สไตล์ Pixar/Ghibli-lite)

> ใช้คู่กับ Google Flow (Image-to-Image) หรือ ChatGPT Images เพื่อสร้างภาพตัวการ์ตูนหลักของแอป
> ผมประกอบวิดีโอให้ (ภาพการ์ตูน + คลิป/จอแอปจริง + เสียงพากย์ + เพลง) — ภาพตัวละครต้อง gen จากเครื่องมือ AI เพราะผมวาดสไตล์ 3D ในโค้ดไม่ได้

## 1) ตัวการ์ตูนหลักของแอป (Mascot)

### น้องแดง (Dang) — ตัวเอก
- เด็กหนุ่มสัดส่วน chibi 3 หัว วัยราว 20 ต้นๆ หน้ากลม แก้มแดง ตาโตสีน้ำตาลอุ่น
- ผมดำยุ่งๆ มีก๊กผมชี้ขึ้นหนึ่งจุดเหมือนเข็มนาฬิกา
- ใส่ฮู้ดสีแดงตึกแดง (#e50914) มีโลโก้ตึกนาฬิกาเล็กๆ ที่อก กางเกงกรมท่า (#08172e)
- ข้อมือซ้ายใส่นาฬิกาโบราณสีทอง (#c5a059) ที่หน้าปัดใหญ่เกินข้อมือ — เป็นสัญลักษณ์ประจำตัว
- นิสัย: ขี้สงสัย ตื่นเต้นง่าย กลัวโดนหลอก แต่ใจกล้ากว่าที่คิด

### ติ๊ก (Tick) — เพื่อนคู่หู
- นกน้อยกลมๆ ตัวแดง หน้าท้องเป็นหน้าปัดนาฬิกาทอง ปีกเป็นเข็มนาฬิกา ตัวเท่าลูกบอลเทนนิส เกาะบ่าน้องแดง
- นิสัย: รู้ทุกเรื่องแอป พูดเร็ว มีมุก ใช้เสียงผู้หญิง (Premwadee)
- ติ๊กคือตัวแทนแอป TukDaeng ใช้เป็นโลโก้เคลื่อนไหวได้ภายหลัง

### Character Block (วางต่อท้ายทุก prompt เพื่อความสม่ำเสมอ)
```
Dang: cute 3D chibi young man (3 heads tall), round face, rosy cheeks, big warm brown eyes,
messy black hair with one upright cowlick shaped like a clock hand, wearing a crimson red hoodie
(#e50914) with a tiny clock-tower logo on the chest, navy trousers, an oversized antique gold
wristwatch on his left wrist. Tick: tiny round red bird the size of a tennis ball, gold clock face
on its belly, wings shaped like clock hands, perched on Dang's shoulder.
Style: Pixar-quality 3D animation render, soft cinematic lighting, warm color grading, shallow
depth of field, expressive faces, clean background, 16:9, no text, no watermark.
```

### ขั้นตอน gen ให้ตัวละครหน้าตาเหมือนเดิมทุกภาพ
1. gen **Character Sheet** ก่อน 1 ภาพ (prompt ด้านล่าง) เลือกภาพที่ชอบที่สุด = ภาพอ้างอิงหลัก
2. ทุกฉากใช้ **Image-to-Image / แนบภาพอ้างอิง** + Character Block + prompt ฉาก
3. ถ้าหน้าเพี้ยน ให้แนบทั้ง Character Sheet และฉากก่อนหน้า แล้วสั่ง "keep the same characters"
4. บันทึกไฟล์ที่ `assets/video-guides/mascot/scene-01.png` ... `scene-10.png` (16:9, อย่างน้อย 1920×1080)
5. (ทางเลือก) ทำคลิปสั้น 4-6 วิจากแต่ละภาพด้วย Flow image-to-video แล้วบันทึกเป็น `scene-01.mp4` — ผมจะใช้แทนภาพนิ่งให้เอง

**Character Sheet prompt**
```
Character turnaround sheet, front / 3-4 view / side / back of Dang, plus Tick the bird,
[Character Block], plain light-grey studio background, 16:9
```

## 2) เรื่องราว: "นาฬิกาของคุณปู่" (~2:20 นาที, 10 ฉาก)

เรื่องย่อ: น้องแดงอยากได้นาฬิกาแบบเดียวกับของคุณปู่ที่หายไป แต่กลัวโดนหลอก ติ๊กพาเข้าแอปตึกแดง
ดูก่อนได้ไม่ต้องสมัคร ค้นหา ต่อรอง ตั้งเฝ้ารุ่นที่หายาก จนเจอเรือนของปู่ แล้วเก็บเข้าพอร์ตโชว์ในคอมมูนิตี้

ภาพจอแอปจริงที่ผมจะแทรกในกรอบมือถือ/เต็มจอ ใช้ไฟล์เดิมใน `assets/video-guides/intro/shots` และ `screenshots/user-manual`

| # | จังหวะเรื่อง | บทพูด (ไทย) | จอแอปจริงที่แทรก | Image prompt (EN) ต่อท้ายด้วย Character Block |
|---|---|---|---|---|
| 1 | Hook: น้องแดงเปิดกล่องเก่า เจอกล่องนาฬิกาว่างเปล่าของปู่ | แดง: "นาฬิกาของปู่หายไปแล้วเหรอ…" / ติ๊ก: "อย่าเพิ่งเศร้า หาเรือนแบบเดียวกันได้นะ" | - | Dang sitting in a cozy old attic holding an empty antique watch box, sad but hopeful, Tick on shoulder, warm dusty sunlight through a round window |
| 2 | กลัวโดนหลอก | แดง: "แต่ซื้อมือสองออนไลน์… กลัวโดนหลอกอ่ะ" | `s01_hook_feed.png` | Dang holding a phone, worried face, thought bubble full of question marks, cartoon scam warning icons floating around |
| 3 | ติ๊กแนะนำแอป | ติ๊ก: "มีแอปตึกแดงไง ซื้อ ขาย โชว์ คุยกัน ครบในที่เดียว" | `s02_what_splash.png`, `s03a_what_feed.png` | Tick pointing a wing at the phone, the red TukDaeng app logo glowing, Dang amazed, sparkles |
| 4 | ดูได้เลยไม่ต้องสมัคร | แดง: "ต้องสมัครก่อนมั้ย?" ติ๊ก: "ไม่ต้อง! ไถดูได้เลย" | `s05a_guest_entry.png`, `s05b_guest_feed.png` | Dang swiping the phone with a delighted expression, floating holographic watch cards around him |
| 5 | ค้นหาและกรอง | ติ๊ก: "พิมพ์ยี่ห้อ รุ่น ราคา กรองให้ตรงใจ" | `s08_tour_search.png`, `s09_tour_filter.png` | Tick wearing tiny detective glasses with a magnifying glass over watch cards, Dang peeking |
| 6 | เจอเรือนที่ใกล้เคียง → เสนอราคา + แชท | แดง: "เจอแล้ว! ขอต่อได้มั้ย?" ติ๊ก: "กดเสนอราคา แล้วคุยกันในแชทได้เลย" | `s12_tour_make_offer.png`, `s13a_tour_chatroom.png`, `s13c_tour_offer_accepted.png` | Dang chatting happily with a friendly shopkeeper character on a phone-shaped speech bubble, handshake icon, warm glow |
| 7 | รุ่นของปู่ยังไม่มีใครขาย → Watch Alert | แดง: "แต่รุ่นของปู่ยังไม่มีเลย" ติ๊ก: "ตั้ง Watch Alert ไว้ ติ๊กเฝ้าให้!" | `10-watchalert-create.png`, `s11_tour_watchalert_noti.png` | Tick standing guard on a tiny watchtower with a glowing bell, night sky with stars, Dang sleeping peacefully below |
| 8 | ติ๊งง! แจ้งเตือนเด้ง เจอเรือนของปู่ | แดง: "ว้าว! นี่แหละเรือนของปู่!" | `09-noti-watchalert.png` | Dang jumping with joy holding the phone, golden notification burst, Tick flapping, confetti |
| 9 | พอร์ตและมูลค่าสินทรัพย์ | ติ๊ก: "เก็บไว้ในพอร์ต ดูมูลค่ารวมกำไรได้ด้วยนะ" | `s15b_tour_assets_value.png` | Dang proudly showing a glass display case of watches with floating growth chart hologram, Tick holding a tiny trophy |
| 10 | คอมมูนิตี้ + จบ | แดง: "แล้วมาคุยเรื่องนาฬิกากันนะ" ติ๊ก: "TukDaeng ตึกแดง โหลดได้เลยที่ Google Play และ App Store" | `s14_tour_board.png`, หน้าโลโก้ | Dang wearing the grandfather's gold watch, waving at the camera with friends (cartoon watch lovers) behind him, sunset golden hour, Tick on shoulder |

## 3) สไตล์เสียง/เพลง/ตัดต่อ
- เสียง: แดง = เสียงชาย Niwat (เร็วขึ้น 8%), ติ๊ก = เสียงหญิง Premwadee (สูงขึ้น ใจดี) — มีเสียงรับ/ตอบสั้นๆ ซ้อนกัน
- เพลง: upbeat pop 116 BPM (เดิม) ลดเสียงตอนพูด + SFX whoosh/ding
- กล้อง: ภาพนิ่งทุกใบมีซูม/แพนช้าๆ + parallax เล็กน้อย เปลี่ยนภาพทุก 3-5 วิ ไม่นิ่งเกินไป
- จอแอปจริง: เด้งเข้ามุมขวาในกรอบมือถือ (ตามที่ใช้ใน v2) พร้อมวงแหวน cue ตรงจุดที่กด
- ซับ: กล่องคำพูดใต้ภาพ ตัดบรรทัดตามช่องว่าง ไม่มีภาพ "ตอนถัดไป"
- จบคลิป: ค้างที่โลโก้แอป ไม่มีการ์ด "ตอนถัดไป"

## 4) สิ่งที่ผมต้องการจากคุณ
1. ยืนยัน/ปรับตัวละคร (ชื่อ ลักษณะ เพศ สัตว์คู่หู) — ถ้าอยากได้ตัวอื่นเช่นหมี/แมว บอกได้เลย
2. gen ภาพ scene-01…10 (หรืออย่างน้อย Character Sheet ก่อน แล้วส่งให้ดู)
3. วางไฟล์ที่ `assets/video-guides/mascot/` แล้วบอกผม จะประกอบเป็น `INTRO-v3-mascot.mp4`

## 5) Prompt พร้อมก๊อป ฉาก 1-10 (แนบภาพ Character Sheet ทุกครั้ง แล้ววางก้อนเดียว)

**ฉาก 1** -> เซฟเป็น `scene-01.png`
```
Keep the exact same characters as the attached reference image (Dang the young man in the red hoodie and Tick the small red clock bird), same faces, same outfit, same proportions.
Scene: Dang sitting in a cozy old attic holding an empty antique watch box, sad but hopeful, Tick on his shoulder cheering him up, warm dusty sunlight through a round window.
Style: Pixar-quality 3D animation render, soft cinematic lighting, warm color grading, shallow depth of field, expressive faces, 16:9, no text, no watermark.
```

**ฉาก 2** -> เซฟเป็น `scene-02.png`
```
Keep the exact same characters as the attached reference image (Dang the young man in the red hoodie and Tick the small red clock bird), same faces, same outfit, same proportions.
Scene: Dang holding a smartphone with a worried face, a thought bubble full of question marks above his head, cartoon scam warning icons floating around him, Tick looking concerned on his shoulder.
Style: Pixar-quality 3D animation render, soft cinematic lighting, warm color grading, shallow depth of field, expressive faces, 16:9, no text, no watermark.
```

**ฉาก 3** -> เซฟเป็น `scene-03.png`
```
Keep the exact same characters as the attached reference image (Dang the young man in the red hoodie and Tick the small red clock bird), same faces, same outfit, same proportions.
Scene: Tick pointing a wing at Dang's phone, a glowing red clock-tower app logo floating above the screen, Dang amazed with wide eyes, sparkles around.
Style: Pixar-quality 3D animation render, soft cinematic lighting, warm color grading, shallow depth of field, expressive faces, 16:9, no text, no watermark.
```

**ฉาก 4** -> เซฟเป็น `scene-04.png`
```
Keep the exact same characters as the attached reference image (Dang the young man in the red hoodie and Tick the small red clock bird), same faces, same outfit, same proportions.
Scene: Dang swiping on his phone with a delighted expression, floating holographic watch cards drifting around him, Tick giving a thumbs-up wing.
Style: Pixar-quality 3D animation render, soft cinematic lighting, warm color grading, shallow depth of field, expressive faces, 16:9, no text, no watermark.
```

**ฉาก 5** -> เซฟเป็น `scene-05.png`
```
Keep the exact same characters as the attached reference image (Dang the young man in the red hoodie and Tick the small red clock bird), same faces, same outfit, same proportions.
Scene: Tick wearing tiny detective glasses holding a magnifying glass over floating watch cards, Dang peeking curiously beside him, cozy room background.
Style: Pixar-quality 3D animation render, soft cinematic lighting, warm color grading, shallow depth of field, expressive faces, 16:9, no text, no watermark.
```

**ฉาก 6** -> เซฟเป็น `scene-06.png`
```
Keep the exact same characters as the attached reference image (Dang the young man in the red hoodie and Tick the small red clock bird), same faces, same outfit, same proportions.
Scene: Dang happily chatting with a friendly cartoon shopkeeper character shown inside a large floating phone-shaped speech bubble, a handshake icon glowing between them, Tick celebrating on his shoulder.
Style: Pixar-quality 3D animation render, soft cinematic lighting, warm color grading, shallow depth of field, expressive faces, 16:9, no text, no watermark.
```

**ฉาก 7** -> เซฟเป็น `scene-07.png`
```
Keep the exact same characters as the attached reference image (Dang the young man in the red hoodie and Tick the small red clock bird), same faces, same outfit, same proportions.
Scene: Night scene: Tick standing guard on a tiny watchtower holding a glowing golden bell, starry sky, Dang sleeping peacefully in bed below with a smile, phone glowing on the bedside table.
Style: Pixar-quality 3D animation render, soft cinematic lighting, warm color grading, shallow depth of field, expressive faces, 16:9, no text, no watermark.
```

**ฉาก 8** -> เซฟเป็น `scene-08.png`
```
Keep the exact same characters as the attached reference image (Dang the young man in the red hoodie and Tick the small red clock bird), same faces, same outfit, same proportions.
Scene: Dang jumping with joy holding his phone up, a golden notification burst and confetti around him, Tick flapping wildly, bright morning light.
Style: Pixar-quality 3D animation render, soft cinematic lighting, warm color grading, shallow depth of field, expressive faces, 16:9, no text, no watermark.
```

**ฉาก 9** -> เซฟเป็น `scene-09.png`
```
Keep the exact same characters as the attached reference image (Dang the young man in the red hoodie and Tick the small red clock bird), same faces, same outfit, same proportions.
Scene: Dang proudly presenting a glass display case of beautiful watches, a floating holographic growth chart behind him, Tick holding a tiny golden trophy.
Style: Pixar-quality 3D animation render, soft cinematic lighting, warm color grading, shallow depth of field, expressive faces, 16:9, no text, no watermark.
```

**ฉาก 10** -> เซฟเป็น `scene-10.png`
```
Keep the exact same characters as the attached reference image (Dang the young man in the red hoodie and Tick the small red clock bird), same faces, same outfit, same proportions.
Scene: Golden hour sunset: Dang wearing his grandfather's gold watch, waving at the camera, a group of friendly cartoon watch lovers cheering behind him, Tick on his shoulder, warm happy ending mood.
Style: Pixar-quality 3D animation render, soft cinematic lighting, warm color grading, shallow depth of field, expressive faces, 16:9, no text, no watermark.
```
