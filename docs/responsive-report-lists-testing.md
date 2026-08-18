# การทดสอบ Responsive ของหน้า Report Lists บน Mobile

เอกสารสรุปวิธีการทดสอบ ปัญหาที่เจอ และแนวทางการแก้ปัญหา
สำหรับหน้า Report Lists ทั้ง 3 หน้าใน Back Office prototype:

- **User Management > Reported Users** (`.reported-users-table`)
- **Asset Management > Reported Assets** (`.reported-assets-table`)
- **Asset Management > Reported Comments** (`.reported-comment-table`)

เอกสารนี้เก็บไว้ใช้ทดสอบซ้ำในครั้งหน้าหากเกิดปัญหาเดียวกัน หรือเมื่อมีการเพิ่ม
Report List ใหม่ในอนาคต

---

## 1. อาการที่ผู้ใช้พบ

บน mobile (viewport ≤ 760px) การ์ดใน Report Lists ทั้ง 3 หน้า:

1. การ์ดดู "กว้างกว่า" การ์ดของ Asset List อย่างเห็นได้ชัด
2. ค่า/ข้อมูลในการ์ด (เช่น Report reason, Comment, Asset, Reported at)
   ดูเหมือน "หายไป" หรือแสดงไม่ครบ
3. ต้องเลื่อนแนวนอนหรือไม่เห็นข้อมูลเลยในหน้าเดียว

เปรียบเทียบกับ **Asset Management > Assets / Asset List** ซึ่งแสดงผลถูกต้อง
บน mobile ทุกขนาด จึงใช้เป็นเกณฑ์อ้างอิง

---

## 2. สาเหตุจริง (Root Cause)

### 2.1 ปัญหาหลัก: CSS specificity ของ `min-width`

มีกฎ CSS ฐาน (ไม่ได้อยู่ใน media query) ที่บังคับความกว้างขั้นต่ำของตาราง:

```css
/* กฎฐาน — specificity สูง เพราะมี :not() ครบ */
body.user-list-mode:not(.user-accounts-mode):not(.user-detail-mode)
  #table .reported-users-table {
  min-width: 1220px;
}
body.user-list-mode:not(.user-accounts-mode):not(.user-detail-mode)
  #table .reported-assets-table {
  min-width: 1568px;
}
body.user-list-mode:not(.user-accounts-mode):not(.user-detail-mode)
  #table .reported-comment-table {
  min-width: 1102px;
}
```

และมีกฎ reset ใน media query `max-width: 760px`:

```css
/* กฎ reset มือถือ — specificity ต่ำกว่า เพราะขาด :not(.user-accounts-mode) */
body.user-list-mode:not(.user-detail-mode)
  #table .reported-users-table,
body.user-list-mode:not(.user-detail-mode)
  #table .reported-assets-table,
body.user-list-mode:not(.user-detail-mode)
  #table .reported-comment-table {
  min-width: 0;
}
```

กฎ reset **แพ้ specificity** เพราะขาด `:not(.user-accounts-mode)` ตัวหนึ่ง
ผลคือบน mobile ตารางยังถูกบังคับกว้าง 1102–1568px ทั้งที่กรอบจอกว้างแค่ ~353px

### 2.2 ปัญหาเสริม: `overflow-x: hidden` ทำให้ค่า "หาย"

wrapper ของตารางตั้ง `overflow-x: hidden` บน mobile:

```css
body.user-list-mode:not(.user-accounts-mode):not(.user-detail-mode)
  #table:has(.reported-users-table),
body.user-list-mode:not(.user-accounts-mode):not(.user-detail-mode)
  #table:has(.reported-assets-table),
body.user-list-mode:not(.user-accounts-mode):not(.user-detail-mode)
  #table:has(.reported-comment-table) {
  overflow-x: hidden;
}
```

เมื่อตารางกว้าง 1102–1568px แต่ wrapper กว้าง ~353px ค่าทั้งหมดจึงถูก
**เลื่อนออกไปนอกกรอบและถูกตัดทิ้ง** ไม่ใช่ "หาย" จริง แต่ถูก clip

### 2.3 ปัญหาเสริม: global meta rule จำกัดความกว้างของค่า

กฎ global สำหรับ meta แบบพิเศษ:

```css
/* ใช้ร่วมกันระหว่าง Reported Users/Assets/Comments */
.user-card-meta-item.report-reason-meta {
  display: grid;
  grid-template-columns: max-content minmax(0, 56%);
  align-items: baseline;
}
.user-card-meta-item.report-reason-meta strong {
  width: 100%;
  max-width: 100%;
  display: block;
  overflow: hidden;
  text-align: right;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* สำหรับ Reported Comments */
.user-card-meta-item.comment-text-meta {
  display: grid;
  grid-template-columns: max-content minmax(0, 56%);
  align-items: baseline;
}
.user-card-meta-item.comment-text-meta strong {
  /* เหมือน report-reason-meta: ellipsis + nowrap */
}
```

กฎเหล่านี้จำกัดค่าให้อยู่ใน 56% ของคอลัมน์ และตัดด้วย ellipsis
ทำให้แม้ตารางจะกว้างพอ ค่าที่ยาวก็ยังถูกตัด

---

## 3. แนวทางการแก้ปัญหา

หลักการ: **scoped override ที่ specificity เท่ากัน และอยู่ใน media query
มือถือ เพื่อชนะด้วยลำดับ source**

### 3.1 Width override (แก้ปัญหาหลัก)

เพิ่มใน media query `max-width: 760px` หลังกฎ reset เดิม:

```css
/* ต้องใช้ selector เหมือนกฎฐานทุกตัว เพื่อ specificity เท่ากัน */
body.user-list-mode:not(.user-accounts-mode):not(.user-detail-mode)
  #table .reported-users-table {
  min-width: 0;
}
body.user-list-mode:not(.user-accounts-mode):not(.user-detail-mode)
  #table:has(.reported-users-table) > .footer-range {
  min-width: 0;
}

body.user-list-mode:not(.user-accounts-mode):not(.user-detail-mode)
  #table .reported-assets-table {
  min-width: 0;
}
body.user-list-mode:not(.user-accounts-mode):not(.user-detail-mode)
  #table:has(.reported-assets-table) > .footer-range {
  min-width: 0;
}

body.user-list-mode:not(.user-accounts-mode):not(.user-detail-mode)
  #table .reported-comment-table {
  min-width: 0;
}
body.user-list-mode:not(.user-accounts-mode):not(.user-detail-mode)
  #table:has(.reported-comment-table) > .footer-range {
  min-width: 0;
}
```

สังเกต: ต้อง override **ทั้งตารางและ footer** เพราะ footer มีกฎ
`min-width` ของตัวเองด้วย specificity เดียวกัน

### 3.2 Scoped metadata styling (แก้ปัญหาเสริม)

เพิ่ม scoped rule ใน media query มือถือ สำหรับแต่ละตาราง:

```css
/* ตัวอย่าง: Reported Users */
body.user-list-mode .reported-users-table .user-card-meta {
  flex: 1 0 100%;
  display: grid;
  gap: 3px;
  width: 100%;
  margin-top: 8px;
  padding-top: 11px;
  border-top: 1px solid #edf2f7;
}
body.user-list-mode .reported-users-table .user-card-meta .user-card-meta-item {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
  color: #34445b;
  font-size: 12px;
  line-height: 1.35;
}
body.user-list-mode .reported-users-table .user-card-meta .user-card-meta-item span {
  color: #485b75;
  font-size: 12px;
  font-weight: 700;
  white-space: nowrap;
}
body.user-list-mode .reported-users-table .user-card-meta .user-card-meta-item strong {
  color: #233a5c;
  font-size: 12px;
  font-weight: 400;
  min-width: 0;
  text-align: right;
}
/* override global .report-reason-meta เฉพาะในตารางนี้ */
body.user-list-mode .reported-users-table .user-card-meta-item.report-reason-meta {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
}
body.user-list-mode .reported-users-table .user-card-meta-item.report-reason-meta strong {
  width: auto;
  max-width: none;
  display: inline;
  overflow: visible;
  text-align: right;
  text-overflow: clip;
  white-space: normal;
  overflow-wrap: anywhere;
}
```

สำหรับ Reported Comments ให้แทน `.report-reason-meta` ด้วย
`.comment-text-meta` ในส่วน override สุดท้าย

### 3.3 ข้อควรระวัง: ห้ามแก้ global rule

กฎ global `.report-reason-meta` และ `.comment-text-meta` ใช้ร่วมกัน
ระหว่างหน้า Report ทั้ง 3 หน้า หากแก้ global จะกระทบหน้าอื่นที่ถูกล็อก
**ต้องใช้ scoped selector ของแต่ละตารางเท่านั้น**

---

## 4. วิธีการทดสอบ

### 4. วิธีการทดสอบ

#### 4.1 เตรียมสภาพแวดล้อม

1. **เริ่ม prototype server**

   ```powershell
   Set-Location "C:\Users\Admin\Desktop\TukDaeng\Prototypes"; node server.mjs
   ```

   เซิร์ฟเวอร์ฟังที่ `http://127.0.0.1:4173`

2. **ติดตั้ง Playwright ชั่วคราว** (ในโฟลเดอร์ `Prototypes`)

   ```powershell
   npm init -y
   npm install playwright --no-save
   npx playwright install chromium
   ```

3. **เขียนสคริปต์ทดสอบ** เช่น `_debug_inspect.mjs` (ตัวอย่างดูใน
   ส่วน 4.2) แล้วรัน:

   ```powershell
   node _debug_inspect.mjs
   ```

#### 4.2 โครงสร้างสคริปต์ทดสอบ Playwright

```javascript
import { chromium } from "playwright";
import { writeFileSync } from "fs";

const BASE = "http://127.0.0.1:4173";
const OUT = "_debug_output.json";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
const result = {};

try {
  await page.goto(BASE, { waitUntil: "networkidle" });
  await sleep(500);

  // Login (ใช้ id เฉพาะของ prototype นี้)
  await page.fill("#login-email", "admin@tukdaeng.com");
  await page.fill("#login-password", "admin");
  await page.click('button[type="submit"]:visible:has-text("Send Email OTP")');
  await sleep(800);
  await page.fill("#otp-code", "123456");
  await page.click('button[type="submit"]:visible:has-text("Verify OTP")');
  await sleep(1000);

  // นำทางผ่าน jumpToModule เพราะ sidebar อยู่นอก viewport บน mobile
  // ค่า module/sub ตามตารางในส่วน 4.3
  await page.evaluate(() => {
    if (typeof jumpToModule === "function") jumpToModule("users", "Reported Users");
  });
  await sleep(900);

  // เก็บค่า layout ของการ์ดแรก
  const cardRow = await page.locator(
    '.reported-users-table .user-row.report-row:not(.head)'
  ).first();
  const rowBox = await cardRow.boundingBox();
  const gridCols = await cardRow.evaluate(
    (el) => getComputedStyle(el).gridTemplateColumns
  );

  // เก็บค่า meta items ทั้งหมด
  const metaItems = await cardRow.locator('.user-card-meta .user-card-meta-item').all();
  for (const item of metaItems) {
    const strong = await item.locator('strong').first();
    const strongStyles = await strong.evaluate((el) => {
      const cs = getComputedStyle(el);
      return {
        whiteSpace: cs.whiteSpace,
        overflow: cs.overflow,
        textOverflow: cs.textOverflow,
        maxWidth: cs.maxWidth,
      };
    });
    // บันทึก label, value, box, styles
  }

  await cardRow.screenshot({ path: "_debug_screenshot.png" });
  writeFileSync(OUT, JSON.stringify(result, null, 2));
} finally {
  await browser.close();
}
```

#### 4.3 ค่า `jumpToModule(module, sub)` สำหรับแต่ละหน้า

| หน้า              | module   | sub                |
| ----------------- | -------- | ------------------ |
| Reported Users    | `users`  | `Reported Users`   |
| Reported Assets   | `assets` | `Reported Assets`  |
| Reported Comments | `assets` | `Reported Comments`|

#### 4.4 ค่าที่ควรตรวจสอบ

| ค่า                       | ก่อนแก้          | หลังแก้ (ที่ถูกต้อง)        |
| ------------------------- | ---------------- | --------------------------- |
| `rowBox.width`            | 1102–1568px      | ~325px (พอดี wrapper ~353px)|
| `rowGridTemplateColumns`  | ~1068px 34px     | ~231–239px 34px             |
| `tableMinWidth`           | 1102px/1220px/1568px | `0px`                  |
| `metaParentBox.width`     | ใหญ่มาก/ถูก clip | ~279–287px                  |
| `strongStyles.whiteSpace` | `nowrap`         | `normal`                    |
| `strongStyles.overflow`   | `hidden`         | `visible`                   |
| `strongStyles.textOverflow`| `ellipsis`      | `clip`                      |
| `strongStyles.maxWidth`   | `100%`           | `none`                      |

#### 4.5 Viewports ที่ควรทดสอบเพิ่ม

นอกจาก `390 × 844` (iPhone) ควรตรวจสอบ:

- มือถือแคบ: `360 × 640`
- มือถือกว้าง: `414 × 896`
- tablet: `768 × 1024`
- desktop: `1280 × 800` (เพื่อยืนยันว่า desktop ไม่กระทบ)

#### 4.6 ทำความสะอาดหลังทดสอบ

ลบไฟล์ชั่วคราวทั้งหมด:

```powershell
Remove-Item -Force _debug_inspect.mjs, _debug_output.json, _debug_screenshot.png, package.json, package-lock.json -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
git status --short  # ควรเห็นเฉพาะ bo-prototype.html
```

---

## 5. ตำแหน่งโค้ดที่เกี่ยวข้อง

ไฟล์เดียวที่เกี่ยวข้อง: `Prototypes/bo-prototype.html`

| ส่วน                       | บรรทัดโดยประมาณ | รายละเอียด                              |
| -------------------------- | --------------- | --------------------------------------- |
| กฎฐาน `min-width` ของตาราง | ~4289–4316      | บังคับ 1220/1568/1102px                 |
| media query `max-width: 1180px` | ~7100–7160 | reset แบบเดิม (specificity ต่ำ)         |
| media query `max-width: 760px`  | ~7900–7940 | reset แบบเดิม + override ใหม่           |
| scoped metadata overrides  | ~8715–8870      | สำหรับแต่ละตาราง                        |
| global `.report-reason-meta` | ~8700–8714    | ห้ามแก้ (ใช้ร่วมกัน)                    |
| global `.comment-text-meta`  | ~8762–8775    | ห้ามแก้ (ใช้ร่วมกัน)                    |
| render ฟังก์ชัน            | ~15717, ~21866  | `renderReportedUserRows`, `renderReportedCommentRows` |

> หมายเหตุ: หมายเลขบรรทัดอ้างอิงจากเวอร์ชันที่แก้แล้ว
> อาจเลื่อนได้เมื่อมีการแก้ไขไฟล์ในอนาคต

---

## 6. ขอบเขตและหน้าที่ถูกล็อก

### หน้าที่แก้ (ตามคำขอผู้ใช้)

- Asset Management > Reported Assets
- Asset Management > Reported Comments
- User Management > Reported Users

### หน้าที่ใช้เป็นเกณฑ์อ้างอิง (ไม่แก้)

- Asset Management > Assets / Asset List

### หน้าที่ถูกล็อกและไม่ถูกแตะ

- Login, Dashboard
- User Management > User List, User Detail
- Asset Management > Asset List, Asset Detail, Report Detail
- Content Management ทุกหน้า
- Market Data, Offer Management

### กฎที่ห้ามแก้แบบ global

- `.user-card-meta-item.report-reason-meta` (ใช้ร่วมกัน 3 หน้า)
- `.user-card-meta-item.comment-text-meta` (ใช้ใน Reported Comments)

---

## 7. สรุปสาเหตุและบทเรียน

1. ** specificity สำคัญกว่าลำดับ media query** — กฎใน media query
   ไม่ชนะกฎนอก media query โดยอัตโนมัติ ต้องดู specificity จริง
2. **`overflow: hidden` ทำให้ค่า "ดูเหมือนหาย"** แต่จริง ๆ ถูก clip
   ต้องวัด bounding box จริง ไม่ใช่แค่อ่าน computed style
3. **global rule ที่ใช้ร่วมกันต้องระวัง** — แก้ที่เดียวกระทบหลายหน้า
   ใช้ scoped selector ของแต่ละตารางแทน
4. **ทดสอบด้วย Playwright headless + วัดค่าจริง** ไม่ใช่แค่อ่านโค้ด
   เพราะ specificity และ cascade ซับซ้อนกว่าที่คาด
5. **ทดสอบหลาย viewport** ไม่ใช่แค่ 390px เพราะ requirement คือ
   "responsive ทุกขนาด"
