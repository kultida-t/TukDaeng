# PDPA Breach Tabletop Exercise Package — TukDaeng (Simulation, ไม่ใช่รันจริง)

| รายการ | ข้อมูล |
|---|---|
| Version | 0.1 (package พร้อมใช้) |
| Date | 2026-11-05 · Asia/Bangkok |
| Task | BAC-013 [`fa70be1c`] — open item จาก BAC-008 / mission `0e19c244` · ตอบ checklist **B-05** ใน `pdpa-breach-runbook.md` §5 |
| Status | **READY — พร้อมรันกับทีมจริง** (การรันจริง = external open item หลัง launch prep) |
| Runbook ที่อ้าง | `docs/pdpa-breach-runbook.md` — severity §1, steps+SLA §2, breach register §3, user template §4 |
| Owner roles | ใช้ role set ที่ยืนยันแล้ว (BAC-012): PO (privacy contact) · Dev lead (Security owner V1) · Support · Legal counsel ภายนอก · BO admin on-duty |

## 0. ขอบเขตและวิธีใช้

- นี่คือ **simulation package — ไม่แตะระบบจริง ไม่ส่งแจ้งจริง ไม่มีผู้ใช้จริง** ทุกเหตุการณ์เป็นสมมติ
- เป้าหมาย: ทีมฝึกตัดสินใจตาม runbook ภายใต้เวลาจำกัด + ตรวจว่า runbook ใช้ได้จริงไหม (ไม่ใช่สอบคน)
- ระยะเวลา **~90 นาที** · ผู้เล่นแทน role (ไม่จำเป็นต้องเป็นคนจริงใน role นั้น — เพราะชื่อจริงยังค้าง B-01)
- เวลาในเกมใช้ **เวลาจำลองบีบอัด** — facilitator ประกาศ "เวลาจำลองผ่านไป X" แต่ผู้เล่นต้องอ้าง SLA จริงของ runbook เสมอ (≤2 ชม. / ≤4 ชม. / ≤72 ชม. / ≤7 วัน / ≤14 วัน)

## 1. Roles & Setup

| บทบาท | จำนวน | หน้าที่ในเกม | อ้าง runbook step |
|---|---|---|---|
| Facilitator | 1 | อ่าน scenario, ปล่อย inject, คุมเวลา, ถามคำถามกดดัน (คู่มือ §5) | — |
| Timekeeper/Scribe | 1 | จดเวลา "ทราบเหตุ", action ที่ตัดสิน, timestamp ตามจำลอง | §3 register fields |
| PO (privacy contact) | 1 | triage ร่วม, ตัดสินแจ้ง PDPC/user, accountable deadline 72 ชม. | 3, 5, 6, 8 |
| Dev lead (Security owner) | 1 | contain, preserve evidence, register entry | 2, 3, 4, 7, 8 |
| BO admin on-duty | 1 | รับ report แรก, escalate | 1 |
| Support | 1 | เตรียม/ส่ง user notification draft | 6 |
| Observer (ไม่บังคับ) | 0–2 | จด note ไม่แทรกเกม | — |

**วัสดุ:** สำเนา runbook §1–§4 คนละ 1 ชุด · register `pdpa-data-processing-register.md` §1 (ใช้หา data scope — ผู้เล่นควรเปิดใช้จริงในเกม) · whiteboard/เอกสารเปล่าสำหรับ breach register draft · นาฬิกาจับเวลา

## 2. Scenario Script (อ่านตามลำดับ — ห้ามเปิด inject ก่อนเวลา)

### 2.1 Warm-up: Rapid Classification (5 นาที — ฝึกตาราง §1 runbook)

อ่านทีละข้อ ให้ทีมตอบ S1/S2/S3 พร้อมเหตุผล 1 ประโยค:

1. "พบว่า log application เขียน session token ลงไฟล์ที่เก็บอยู่บน server ภายใน ไม่มีใครนอกทีมเข้าถึงได้ ลบทิ้งแล้ว" → **S3** (contained, ไม่มีผลต่อข้อมูลจริง — แต่ต้องเข้า register)
2. "admin role หนึ่งเห็น masked email ของ user เกินสิทธิ์ที่ตั้งไว้ 10 นาที ก่อน config ถูกแก้กลับ ไม่พบร่องรอย export" → **S2** (เข้าถึงผิดสิทธิ์จำกัด scope — แจ้ง PDPC หรือไม่ให้ Legal ตัดสิน)
3. "URL ของรูป proof of payment ที่ user อัปโหลดประกอบลิสติ้ง เข้าถึงได้โดยไม่ต้อง login" → **S1** (private asset data หลุดจริง — PDPC + แจ้งผู้ใช้)

### 2.2 Main Scenario — "The Leaky Bucket" (อ่านให้ทีมฟัง)

> **เวลาจำลอง T+0** — เช้าวันจันทร์ นักพัฒนาคนหนึ่งสังเกตจาก analytics dashboard ว่ามี traffic เข้า URL รูปภาพของ CDN จาก referrer ภายนอกผิดปกติ เมื่อตรวจสอบพบว่า **folder `private-assets/` บน CDN ถูกตั้ง public โดยไม่ได้ตั้งใจ** — รูป proof of payment และ provenance document ของ user ~300 ไฟล์เข้าถึงได้โดยไม่ต้อง auth นานแล้วประมาณ **6 วัน** (ตั้งแต่ deploy ครั้งล่าสุด) ไฟล์เหล่านี้มีชื่อ-ที่อยู่บางส่วนของผู้ขายปรากฏในเอกสาร — เหตุการณ์นี้คือ spec violation ของ `16 §8` (private asset ต้องตรวจสิทธิ์ก่อนส่ง)

ให้ทีมเริ่มทำงานจากจุดนี้ — **อย่าบอก severity ให้พวกเขาตัดสินเอง**

### 2.3 Injects (ปล่อยตามเวลา/เมื่อทีมหยุดนิ่ง)

| # | เวลาจริง | Inject | สิ่งที่ทดสอบ |
|---|---|---|---|
| A | ~0:30 | "ยังไม่แน่ใจว่า 300 ไฟล์มี personal data จริงกี่ไฟล์ — ต้องไล่ดูทีละไฟล์ ซึ่งใช้เวลาเป็นวัน" | ตัดสิน severity บนข้อมูลไม่ครบ — 72 ชม.นับจากทราบเหตุไม่รอการไล่ไฟล์ครบ (ควร classify S1 แบบ conservative) |
| B | ~0:35 | "BO admin on-duty ที่ควรรับ report ติดต่อไม่ได้ (อยู่ระหว่างเดินทาง) และ CDN อยู่ต่างประเทศ — provider ตอบ ticket ช้า" | escalation เมื่อ on-call ขาด + cross-border angle (PDPA §28-29 — processor ต่างประเทศยังอยู่ในความรับผิดชอบของ controller) |
| C | ~0:45 | "มี user ทัก support ว่าเห็นรูปเอกสารของตัวเองแชร์ในกลุ่ม collector บนโซเชียล + ถามว่าข้อมูลหลุดหรือเปล่า" | ข้อมูลเข้าสู่สาธารณะแล้ว — บีบให้เลือกแจ้งผู้ใช้ก่อน/พร้อม PDPC และตอบ user รายนั้นยังไง (ห้ามเผย scope ที่ยังไม่ verify) |
| D (optional) | ~0:55 | "Legal counsel ภายนอกติดต่อไม่ได้ 2 ชม." | PO ต้องตัดสินแจ้ง PDPC โดยไม่มี Legal — ทดสอบ accountability (owner step 5 = PO) |

### 2.4 คำตอบที่คาด (facilitator เท่านั้น — อย่าเปิดให้ผู้เล่นเห็น)

- Classification: **S1** — private asset data (purchase/provenance) เข้าถึงได้จริงโดยไม่ได้รับอนุญาต จำนวน ~300 ไฟล์ มี risk สูงต่อเจ้าของข้อมูล → PDPC ≤72 ชม. + แจ้งผู้ใช้ที่กระทบ + exec
- "ทราบเหตุ" = T+0 (นักพัฒนาพบ) ไม่ใช่ตอนยืนยันครบ — deadline 72 ชม.เริ่มนับตั้งแต่ตอนนั้น ถ้าทีมเถียงว่า "ยังไม่แน่ใจ" ให้กดด้วย inject A
- Contain ที่ถูก: flip folder กลับ private ทันที (ไม่รอประชุม) + revoke signed URL เก่า + เก็บ access log ของ CDN ช่วง 6 วัน ก่อน rotate

## 3. Timeline / Run-of-Show (อ้าง step + SLA จริงใน runbook §2)

| เวลาจริง | ช่วง | กิจกรรม | อ้าง runbook |
|---|---|---|---|
| 0:00–0:10 | Brief | กติกา: simulation, ไม่มีคำตอบผิดแบบโดนลงโทษ, ตัดสินใจแล้วพูดเหตุผล, scribe จดทุกอย่าง | — |
| 0:10–0:15 | Warm-up | rapid classification 3 ข้อ (§2.1) | §1 severity |
| 0:15–0:20 | T+0 | อ่าน main scenario — ทีมเริ่ม step 1 (ใครรับ report? log เวลาทราบ?) | step 1 — ทันที |
| 0:20–0:35 | Contain+Triage | ทีมเสนอ containment + เริ่ม classify; **ปล่อย inject A ~0:30** | step 2 ≤2 ชม. · step 3 ≤4 ชม. |
| 0:35–0:50 | Pressure | **inject B ~0:35, inject C ~0:45** — ทีมต้อง triage เสร็จ + เสนอแผนแจ้ง | step 3/5/6 |
| 0:50–1:05 | Decide | ตัดสิน: แจ้ง PDPC ไหม (เนื้อหาอะไรบ้างตาม step 5) / แจ้ง user ไหม (draft ประโยคหลักจาก template §4) / **inject D ถ้าเร็ว** | step 5 ≤72 ชม. · step 6 |
| 1:05–1:15 | Wrap sim | scribe เล่า timeline ที่ทีมสร้าง — ทีมร่าง breach register entry (§3 fields ครบไหม) + หัวข้อ post-incident review | step 7 ≤7 วัน · step 8 ≤14 วัน |
| 1:15–1:30 | Debrief | เทียบ expected actions (§4) + evaluation checklist (§6) + บันทึก action items | — |

## 4. Expected Actions (เกณฑ์เทียบ — อ้าง step/SLA ครบทุกขั้น)

| Step | ทีมควรทำ | จุดที่คนพลาดบ่อย |
|---|---|---|
| 1. Detect & Report (ทันที) | รายงานเข้าช่องเดียว (ในเกม: บอก facilitator) + **จดเวลาที่ทราบลงกระดาษทันที** | ลืมจด "เวลาทราบ" — ทำให้นับ 72 ชม.ผิดตั้งแต่ต้น |
| 2. Contain (≤2 ชม.) | flip private กลับทันทีโดยไม่รอ approve + revoke URL เดิม + suspend deploy pipeline ชั่วคราว | รอประชุมก่อนปิดช่อง — containment ไม่ต้องรอใคร |
| 3. Triage & Classify (≤4 ชม.) | ตัดสิน S1 พร้อมเหตุผล + ใช้ register §1 หา scope (ข้อมูลส่วนตัวของลิสติ้ง/บัญชี/เอกสาร) | รอข้อมูลครบก่อน classify — conservative S1 เมื่อสงสัย |
| 4. Preserve Evidence (≤4 ชม.) | สั่ง freeze CDN access log + deploy log + audit log ช่วง 6 วัน — **ห้ามลบ/แก้** | แก้ config แล้วลืมเก็บ log — evidence หายพอดี |
| 5. PDPC Notification (≤72 ชม. นับจากทราบ) | ระบุเนื้อหาแจ้งครบ: ลักษณะเหตุ, กลุ่มข้อมูล/จำนวน, ผลกระทบ, มาตรการ, ช่องทางติดต่อ — owner = PO แม้ Legal ไม่ตอบ | คิดว่าต้องรอ Legal ก่อนแจ้ง — deadline ไม่รอ |
| 6. User Notification (≤72 ชม./ตาม Legal) | draft จาก template §4: เกิดอะไร, ข้อมูลอะไร, ทำอะไรแล้ว, user ทำอะไรต่อ — channel email + in-app `kind:"security"` (`09`) | เผย scope ที่ยังไม่ verify / ลืมช่องทางสอบถามใน template |
| 7. Breach Register (≤7 วัน) | เติม fields §3 ครบ: ID, 2 timestamps, S1, data categories (ref register §1), users affected, containment+เวลา, PDPC Y/N+timestamp, user notified, root cause | ข้าม "เหตุผลที่ไม่แจ้ง" — ถ้าไม่แจ้งต้องมีเหตุผลบันทึก |
| 8. Post-Incident Review (≤14 วัน) | เสนออย่างน้อย: root cause (deploy ไม่มี checklist private ACL), มาตรการป้องกัน, ปรับ runbook ถ้าจำเป็น | จบที่ "แก้แล้ว" โดยไม่มี prevention |

## 5. Facilitator Guide

- **อย่าช่วยตอบ** — ถ้าทีมนิ่ง ให้ถามแทน ("ใครถือ 72 ชม.อยู่ตอนนี้?" / "containment รออะไรอยู่?") ไม่ให้คำตอบ
- **กติกาสำคัญที่ต้อง enforce**: (1) ทุกการตัดสินใจต้องมีคนพูดเหตุผลออกเสียง — scribe จด (2) ห้ามใช้ชื่อจริงของเพื่อนร่วมงานในเกม — ใช้ role เท่านั้น (3) ผู้เล่นขอข้อมูลเพิ่มได้ (เช่น "ขอ access log") — facilitator ตอบตามสมเหตุสมผล
- **ปล่อย inject เมื่อ**: ทีมดูสบายเกิน / ตัดสินเร็วเกินโดยไม่คิด / นิ่งนานเกิน 5 นาที — ไม่จำเป็นต้องปล่อยครบทุก inject ถ้าเวลาไม่พอ (A สำคัญสุด)
- **คำถามกดดันที่ใช้ได้เสมอ**: "72 ชม.ของพวกเราเริ่มนับตอนไหนกันแน่?" · "ถ้าข่าวออกสื่อก่อนเราแจ้ง ทีมจะรับผิดชอบยังไง?" · "ข้อมูลไม่ครบ แล้วจะ classify ตัวไหน?"
- **สัญญาณว่า runbook มีปัญหา (จดไว้ debrief — นี่คือ output สำคัญ)**: step ไหนไม่มีใครรับผิดชอบ / SLA ไหนทำไม่ทันในเกม / ข้อมูลที่ผู้เล่นต้องการแต่ runbook ไม่มี (เช่น contact list จริง — B-02)

## 6. Evaluation Checklist (ทำเครื่องหมายตอน debrief)

| # | เกณฑ์ | ผ่าน? |
|---|---|---|
| E-01 | ทีมจด "เวลาที่ทราบ" ใน 5 นาทีแรกของเกม | ☐ |
| E-02 | containment เสนอ/ทำก่อนประชุมตัดสินใจ (ไม่รอ) | ☐ |
| E-03 | classify เป็น S1 พร้อมเหตุผลภายในเวลาจำลอง ≤4 ชม. | ☐ |
| E-04 | มีการสั่ง preserve evidence ชัดเจน (ไม่ลบ log) | ☐ |
| E-05 | ตอบถูกว่า 72 ชม.นับจาก "ทราบ" ไม่ใช่จาก "verify ครบ" | ☐ |
| E-06 | เนื้อหาแจ้ง PDPC ครบ 5 อย่างตาม step 5 | ☐ |
| E-07 | user notification ใช้ template §4 + ชี้ช่องทาง email/in-app | ☐ |
| E-08 | breach register draft ครบทุก field §3 | ☐ |
| E-09 | มีข้อเสนอ post-incident prevention อย่างน้อย 1 ข้อ | ☐ |
| E-10 | ไม่มีใครเปิดเผยข้อมูลที่ยังไม่ verify ให้ "ภายนอก" ในเกม | ☐ |

**ผ่านเกณฑ์รวม:** ≥8/10 + ไม่มี E-01/E-05 fail (สองข้อนี้คือหัวใจของ 72 ชม.) — ไม่ผ่านให้ระบุจุดที่ตก + ซ้อมเฉพาะช่วงนั้นอีกรอบก่อน launch

## 7. หลังเกม — Outputs ที่ต้องเก็บ

1. **Timeline จริงที่ทีมทำ** (จาก scribe) — เทียบ SLA ทีละ step
2. **Evaluation checklist** ที่ทำเครื่องหมายแล้ว
3. **Action items** — แบ่ง 2 กล่อง: (a) runbook ต้องปรับ (เช่น เพิ่ม escalation เมื่อ on-call ขาด, contact list จริง B-02) (b) ทีมต้องฝึกเพิ่ม — นำไปปิด **B-05** ใน runbook §5 เมื่อรันจริงครบ
4. ถ้าพบว่า runbook/spec ขัดกับสิ่งที่เกิดในเกม → บันทึกเป็น **finding** รอ approval (ห้ามแก้ spec/protected screen โดยตรง)

## 8. Open Items (ของ package นี้)

| ID | ต้องการ | ผู้ตัดสิน |
|---|---|---|
| T-01 | รัน tabletop จริงกับทีม (ผู้เล่นตาม §1 — ชื่อจริงรอ B-01) | PO |
| T-02 | เลือกวันเวลา + facilitator จริง (แนะนำคนที่ไม่ได้อยู่ใน role ใดของเกม) | PO |
| T-03 | ผลการรัน → ปิด B-05 + ถ้ามี finding ให้เข้า DECISION_LOG เส้นทางเดิม | PO |
