# PDPA Data Breach Response Runbook — TukDaeng (Draft)

| รายการ | ข้อมูล |
|---|---|
| Version | 0.1 (draft) |
| Date | 2026-11-05 · Asia/Bangkok |
| Task | BAC-008 [`5c0b61c2`] — Mission `0e19c244` Objective: PDPA Compliance Mapping / Feature: Compliance Map |
| Status | **ADOPTED — ตาม DEC-55** (2026-11-05; owner role set ยืนยันแล้ว — เหลือชื่อจริง B-01 + tabletop B-05 ใน launch checklist) |
| Source | ตอบ gap G-03 ใน `docs/pdpa-compliance-map.md` — PDPA §37(4): แจ้งสำนักงาน คปช. (PDPC) ภายใน **72 ชม.** นับจากทราบเหตุ และแจ้งเจ้าของข้อมูลเมื่อความเสี่ยงสูง |

## 0. ขอบเขต

- เอกสารนี้คือ **process runbook ไม่ใช่ฟีเจอร์แอป** — V1 รับมือ breach ด้วย process manual ไม่ต้อง build หน้าจอใหม่ (infra ที่มีอยู่: email provider, push FCM, audit log, delivery log ใช้ประกอบการตอบสนองได้)
- ใช้เมื่อเกิดเหตุ: ข้อมูลส่วนบุคคลรั่วไหล / ถูกเข้าถึงโดยไม่ได้รับอนุญาต / สูญหาย / ถูกเปลี่ยนแปลงโดยมิชอบ — ครอบ user data, admin data, chat, credentials

## 1. Severity Classification (ตัดสินภายใน 4 ชม.แรก)

| ระดับ | นิยาม | ตัวอย่าง | การแจ้ง |
|---|---|---|---|
| **S1 — High** | กระทบเจ้าของข้อมูลจริง/มีความเสี่ยงสูง (credential, chat, private asset data, จำนวนมาก) | DB รั่ว, credential dump, chat log หลุด, token ถูกขโมย | PDPC ≤72 ชม. + แจ้งผู้ใช้ที่กระทบ + exec เดี๋ยวนั้น |
| **S2 — Medium** | เข้าถึงผิดสิทธิ์แต่จำกัด scope/ยังไม่พบการใช้ข้อมูล | admin เห็น masked field เกินสิทธิ์, misconfig สั้น ๆ ที่ patch แล้ว | บันทึก register + พิจารณาแจ้ง PDPC (Legal ตัดสิน) |
| **S3 — Low** | เหตุเล็กที่ไม่มีผลต่อข้อมูลจริง / contained ทันที | log ผิดพลาดที่ไม่มี personal data, test incident | บันทึก register เท่านั้น |

## 2. Response Steps (RACI เบา — role set ยืนยันแล้ว 2026-11-05; ชื่อจริงเติมใน B-01)

| Step | ทำอะไร | Owner | SLA |
|---|---|---|---|
| 1. Detect & Report | ใครพบเหตุก็ได้รายงานเข้าช่องทางเดียว (internal channel TBD — B-02) + log เวลาที่ทราบ | ทุกคน → BO admin on-duty (rota โดย PO) | ทันที |
| 2. Contain | ปิดช่องรั่ว: revoke token/session, block endpoint, suspend integration, rotate credential | Dev lead / Infra on-call | ≤2 ชม. |
| 3. Triage & Classify | ตัดสิน S1/S2/S3 + ประเมินข้อมูลที่กระทบ (ใช้ register `pdpa-data-processing-register.md` §1 หา scope) | PO + Dev lead (ถือบท Security owner ใน V1) | ≤4 ชม. |
| 4. Preserve Evidence | freeze audit log, delivery log, access log ช่วงเหตุ — **ห้ามลบ/แก้ log** (audit retention เป็น system job อยู่แล้ว `BO-08 §11`) | Dev lead / Infra | ≤4 ชม. |
| 5. PDPC Notification (S1) | แจ้ง คปช. พร้อม: ลักษณะเหตุ, กลุ่มข้อมูล/จำนวนผู้กระทบ, ผลกระทบ, มาตรการที่ทำ, ช่องทางติดต่อ | PO (privacy contact) ประสาน Legal counsel ภายนอก — ไม่ตั้ง DPO ตาม DEC-54 | **≤72 ชม. นับจากทราบ** |
| 6. User Notification (S1, เสี่ยงสูง) | แจ้งผู้ใช้ที่กระทบ: เกิดอะไร, ข้อมูลอะไร, ทำอะไรแล้ว, ผู้ใช้ควรทำอะไร (เปลี่ยนรหัส ฯลฯ) — ช่องทาง: email + in-app notification (`09 §system kind:"security"` มีประเภท security อยู่แล้ว) | PO + Support | ≤72 ชม. หรือตาม Legal |
| 7. Breach Register Entry | บันทึกลง breach register (ตาราง §3): ทุกเหตุรวม S3 | Dev lead (Security owner V1) | ≤7 วัน |
| 8. Post-Incident Review | สาเหตุ, มาตรการป้องกัน, ปรับ runbook/spec ถ้าจำเป็น | PO + Dev lead | ≤14 วัน |

## 3. Breach Register (ตารางเก็บเหตุ — สร้างครั้งแรกเมื่อมีเหตุจริง)

| Field | คำอธิบาย |
|---|---|
| Breach ID | BR-YYYY-NNN |
| Detected / Classified at | timestamp สองจุด — ใช้นับ 72 ชม. |
| Severity | S1/S2/S3 |
| Data categories affected | อ้าง data category จาก register §1 |
| Users affected | จำนวน + scope |
| Containment | สิ่งที่ทำ + เวลา |
| PDPC notified | Y/N + timestamp (ถ้าไม่แจ้งต้องมีเหตุผลบันทึกไว้ — PDPA อนุญาตไม่แจ้งถ้าไม่มีความเสี่ยง) |
| User notified | Y/N + channel + timestamp |
| Root cause / Prevention | จาก step 8 |

## 4. Template แจ้งผู้ใช้ (draft — Legal ตรวจก่อนใช้จริง)

> เรื่อง: แจ้งเหตุการณ์ด้านความปลอดภัยของข้อมูล
>
> เมื่อวันที่ {date} ทีมงานตรวจพบเหตุการณ์ที่อาจกระทบข้อมูล {data categories} ของบัญชีคุณ เราดำเนินการ {containment} เรียบร้อยแล้ว และยังไม่พบหลักฐานการนำข้อมูลไปใช้ {หรือระบุตามจริง}
>
> สิ่งที่เราแนะนำ: {เปลี่ยนรหัสผ่าน / ออกจากระบบทุกอุปกรณ์ / ฯลฯ}
> สอบถามเพิ่มเติม: {support channel — PO ถือบท privacy contact ตาม Q-03/DEC-54; ชื่อ channel จริง B-04}

## 5. Open Items ก่อนใช้จริง

| ID | ต้องการ | ผู้ตัดสิน |
|---|---|---|
| B-01 | ระบุชื่อจริงของ on-call owner ทุก step (role set ยืนยันแล้ว 2026-11-05 — เหลือชื่อจริง) | PO |
| B-02 | ช่องทางรายงานเหตุภายใน (step 1) | PO |
| B-03 | Legal confirm template + เกณฑ์ "ไม่แจ้ง PDPC" | Legal |
| B-04 | Privacy contact channel (ผูก Q-03) | Legal/PO |
| B-05 | ทดลอง tabletop 1 ครั้งก่อน launch | Dev + PO |
