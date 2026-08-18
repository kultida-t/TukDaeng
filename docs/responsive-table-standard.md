# มาตรฐานการสร้างหน้าตารางแบบ Responsive (Table-to-Card)

เอกสารมาตรฐานสำหรับการสร้างหรือตรวจสอบหน้าที่มีตารางใน Back Office prototype
เพื่อให้ทุกหน้าแสดงผลได้ทุกขนาดหน้าจอ (responsive) รวมถึงการแปลงตารางเป็นการ์ด
บน mobile อย่างสม่ำเสมอทั้งระบบ

หน้าอ้างอิงมาตรฐาน: **Asset Management > Assets / Asset List**
(`.asset-list-table`)

---

## 1. หลักการพื้นฐาน

1. **ตารางบน desktop, การ์ดบน mobile** — หน้าทุกหน้าที่มีรายการตาราง
   ต้องแปลงเป็นการ์ดเมื่อ viewport ≤ 760px
2. **ข้อมูลครบ, ไม่ถูกตัด** — ค่าทุกตัวในการ์ดต้องมองเห็นได้ในหน้าจอเดียว
   โดยไม่ต้องเลื่อนแนวนอน และไม่ถูก clip ด้วย `overflow: hidden`
3. **ความกว้างพอดีกรอบ** — การ์ดต้องกว้างพอดีกับ wrapper ของตาราง
   ไม่กว้างเกินจนถูกตัด
4. **ข้อความยาวตัดด้วย ellipsis ที่ 50% ของการ์ด** — ค่าทุกฟิลด์ในการ์ด mobile
   ต้องตัดด้วย `text-overflow: ellipsis` ที่ความกว้างไม่เกิน 50% ของการ์ด
   เพื่อให้สัดส่วนเท่ากันทุกฟิลด์ อ่านง่าย และไม่ครองพื้นที่เกินจำเป็น
5. **action menu ใช้งานได้** — ปุ่ม/เมนูในการ์ดต้องคลิกได้บน mobile
6. **specificity ต้องชนะ** — กฎ reset มือถือต้องมี specificity
   มากกว่าหรือเท่ากับกฎฐาน และอยู่หลังกฎฐานในไฟล์

---

## 2. Breakpoints ที่ใช้ในระบบ

| Breakpoint              | พฤติกรรม                                  |
| ----------------------- | ----------------------------------------- |
| `max-width: 1365px` และ `min-width: 761px` | tablet/คอมเล็ง — ปรับ grid, gap, font |
| `max-width: 1180px`     | คอมเล็ง — ตารางอาจเริ่ม scroll แนวนอน     |
| `max-width: 980px` และ `min-width: 761px`  | tablet — ปรับ grid ตาราง                |
| `max-width: 760px`      | **mobile — แปลงตารางเป็นการ์ด**           |
| `max-width: 560px`      | mobile เล็ก — ปรับ padding/font           |
| `max-width: 520px`      | mobile เล็กมาก                            |

> breakpoint หลักสำหรับการแปลงเป็นการ์ดคือ **`max-width: 760px`**

---

## 3. โครงสร้าง HTML มาตรฐาน

### 3.1 โครงสร้างตาราง (ใช้ทั้ง desktop และ mobile)

```html
<div class="asset-table asset-list-table">
  <!-- หัวตาราง (ซ่อนบน mobile) -->
  <div class="asset-row head">
    <div>Asset ID</div>
    <div>Asset</div>
    <div>Brand</div>
    <div>Owner</div>
    <div>Created At</div>
    <div>Asset Status</div>
    <div>Action</div>
  </div>

  <!-- แถวข้อมูล (กลายเป็นการ์ดบน mobile) -->
  <div class="asset-row" data-asset-card="AST-0001">
    <!-- คอลัมน์ที่ซ่อนบน mobile -->
    <div data-label="Asset ID"><div class="main-text">AST-0001</div></div>

    <!-- คอลัมน์หลัก: ชื่อ/หัวข้อการ์ด -->
    <div class="asset-cell-primary" data-label="Asset">
      <div class="main-text">
        <span class="desktop-user-name">Rolex Submariner</span>
        <span class="mobile-user-card-title">AST-0001</span>
      </div>
    </div>

    <!-- ส่วน tags + meta (แสดงบน mobile) -->
    <div class="asset-card-tags">
      <span class="user-card-tag asset-tag">Rolex</span>
      <!-- status pill -->
      <div class="user-card-meta asset-list-card-meta">
        <div class="user-card-meta-item">
          <span>Asset</span><strong>Rolex Submariner</strong>
        </div>
        <div class="user-card-meta-item">
          <span>Owner</span><strong>John Doe</strong>
        </div>
        <div class="user-card-meta-item">
          <span>Created At</span><strong>01 Jul 2026</strong>
        </div>
      </div>
    </div>

    <!-- คอลัมน์อื่น ๆ ที่ซ่อนบน mobile -->
    <div data-label="Brand"><div class="main-text">Rolex</div></div>
    <div data-label="Owner"><div class="main-text">John Doe</div></div>
    <!-- ... -->

    <!-- action menu (แสดงบน mobile ในคอลัมน์ 2) -->
    <div class="user-row-actions">
      <!-- action buttons/menu -->
    </div>
  </div>

  <!-- footer/pagination -->
  <div class="footer-range">
    <span>แสดง 1-10 จาก 22</span>
    <div class="pager"><!-- prev/next buttons --></div>
  </div>
</div>
```

### 3.2 class ที่ใช้

| class                  | บทบาท                                     |
| ---------------------- | ----------------------------------------- |
| `.asset-table`         | container ตาราง (grid)                    |
| `.asset-list-table`    | scope เฉพาะ Asset List                    |
| `.asset-row`           | แถว/การ์ด                                 |
| `.asset-row.head`      | หัวตาราง (ซ่อนบน mobile)                  |
| `.asset-cell-primary`  | คอลัมน์หลัก = หัวข้อการ์ดบน mobile        |
| `.asset-card-tags`     | container สำหรับ tags + meta บน mobile   |
| `.user-card-meta`      | container สำหรับ meta items              |
| `.asset-list-card-meta`| scope meta ของ Asset List                 |
| `.user-card-meta-item` | แถว label + value                        |
| `.user-row-actions`    | action menu                               |
| `.footer-range`        | footer/pagination                         |

> สำหรับตารางประเภทอื่น (users, reported-*) ใช้ class ที่เทียบเท่า
> เช่น `.user-table`, `.user-row`, `.user-cell-primary`, `.user-card-tags`

---

## 4. CSS มาตรฐาน

### 4.1 กฎฐาน (desktop) — กำหนดความกว้างขั้นต่ำ

```css
/* ใช้ specificity สูงเพื่อจำกัด scope และควบคุม overflow */
body.asset-list-mode:not(.article-list-mode):not(.category-list-mode)
  :not(.reported-board-mode) #table .asset-list-table {
  min-width: 1132px;
}
body.asset-list-mode:not(.article-list-mode):not(.category-list-mode)
  :not(.reported-board-mode) #table > .footer-range {
  min-width: 1132px;
}
```

> ค่า `min-width` ขึ้นกับจำนวนคอลัมน์ — ตั้งให้พอดีกับเนื้อหา desktop

### 4.2 กฎ mobile (`max-width: 760px`) — แปลงเป็นการ์ด

#### 4.2.1 รีเซ็ตความกว้างขั้นต่ำ (สำคัญที่สุด)

```css
/* specificity ต้องเท่ากับหรือมากกว่ากฎฐาน */
body.asset-list-mode:not(.article-list-mode):not(.category-list-mode)
  :not(.reported-board-mode) #table .asset-list-table {
  grid-template-columns: 1fr;
  gap: 12px;
  min-width: 0;          /* สำคัญ: ต้องชนะกฎฐาน */
}
body.asset-list-mode:not(.article-list-mode):not(.category-list-mode)
  :not(.reported-board-mode) #table > .footer-range {
  min-width: 0;
}
```

#### 4.2.2 ซ่อนหัวตาราง

```css
.asset-list-table .asset-row.head {
  display: none;
}
```

#### 4.2.3 แปลงแถวเป็นการ์ด

```css
.asset-list-table .asset-row:not(.head) {
  grid-template-columns: minmax(0, 1fr) 34px;  /* เนื้อหา + action menu */
  column-gap: 14px;
  row-gap: 14px;
  min-height: 0;
  padding: 18px 18px 16px;
  border: 1px solid #cfdbd2;
  border-radius: 10px;
  background: #fff;
  box-shadow: 0 1px 2px rgba(15, 23, 42, .05);
  overflow: visible;          /* ห้าม hidden — จะทำให้ค่าถูก clip */
}
```

#### 4.2.4 ซ่อนคอลัมน์ที่ไม่แสดงบน mobile

```css
/* ซ่อนคอลัมน์ทั้งหมดที่มี data-label ยกเว้น cell-primary */
.asset-list-table .asset-row:not(.head) > div[data-label]:not(.asset-cell-primary) {
  display: none;
}
/* ซ่อนคอลัมน์แรก (ID) ด้วย */
.asset-list-table .asset-row:not(.head) > div[data-label]:first-child {
  display: none;
}
```

#### 4.2.5 จัดวาง cell-primary และ action menu

```css
/* cell-primary = หัวข้อการ์ด (คอลัมน์ 1, แถว 1) */
.asset-list-table .asset-row:not(.head) > .asset-cell-primary {
  grid-column: 1;
  grid-row: 1;
  min-height: 30px;
  display: flex;
  align-items: center;
  align-self: center;
  border-bottom: 0;
  padding-bottom: 0;
}
.asset-list-table .asset-row:not(.head) > .asset-cell-primary .main-text {
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;        /* หัวข้อการ์ดอนุญาตให้ ellipsis ได้ */
  color: #061426;
  font-family: var(--font-heading);
  font-size: 22px;
  font-weight: 500;
  line-height: 1;
}

/* action menu = คอลัมน์ 2, แถว 1 */
.asset-list-table .asset-row:not(.head) > .user-row-actions {
  grid-column: 2;
  grid-row: 1;
  align-self: center;
  justify-self: end;
  justify-content: flex-end;
  width: auto;
  min-height: 30px;
}
```

#### 4.2.6 จัดวาง tags + meta (คอลัมน์ 1, แถว 2)

```css
.asset-list-table .asset-row:not(.head) .asset-card-tags {
  grid-column: 1 / -1;        /* กินเต็มความกว้าง */
  grid-row: 2;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  width: 100%;
  padding-top: 0;
}
```

#### 4.2.7 meta items — แสดง label + value แบบ grid 50% truncation

```css
.asset-list-table .asset-list-card-meta {
  flex: 1 0 100%;
  display: grid;
  gap: 3px;
  width: 100%;
  margin-top: 8px;
  padding-top: 11px;
  border-top: 1px solid #edf2f7;
}
.asset-list-table .asset-list-card-meta .user-card-meta-item {
  display: flex;
  align-items: baseline;
  justify-content: space-between;   /* label ซ้าย, value ขวา */
  gap: 8px;
  color: #34445b;
  font-size: 12px;
  line-height: 1.35;
}
.asset-list-table .asset-list-card-meta .user-card-meta-item span {
  color: #485b75;
  font-size: 12px;
  font-weight: 700;
  white-space: nowrap;              /* label ไม่ห่อ */
}
.asset-list-table .asset-list-card-meta .user-card-meta-item strong {
  color: #233a5c;
  font-size: 12px;
  font-weight: 400;
  min-width: 0;
  text-align: right;
}
/* ทุกฟิลด์ใช้ comment-field-meta เพื่อจำกัด value ที่ 50% ของการ์ด + truncation */
.asset-list-table .asset-list-card-meta .user-card-meta-item.comment-field-meta {
  display: grid;
  grid-template-columns: max-content minmax(0, 50%);
  align-items: baseline;
  gap: 8px;
}
.asset-list-table .asset-list-card-meta .user-card-meta-item.comment-field-meta strong {
  width: 100%;
  max-width: 100%;
  min-width: 0;
  display: block;
  overflow: hidden;
  text-align: right;
  text-overflow: ellipsis;
  white-space: nowrap;
}
```

> **สำคัญ:** ทุกฟิลด์ meta ต้องมี class `comment-field-meta` เพื่อให้ value
> ถูกจำกัดที่ 50% ของการ์ดและตัดด้วย ellipsis เมื่อข้อความยาวเกิน
> ทำให้สัดส่วนเท่ากันทุกฟิลด์ อ่านง่าย และดู balanced

---

## 5. Checklist สำหรับสร้างหรือตรวจสอบหน้าตาราง

### 5.1 โครงสร้าง HTML

- [ ] มี container `<div class="*-table *-list-table">`
- [ ] มีแถวหัว `<div class="*-row head">` พร้อมชื่อคอลัมน์
- [ ] แถวข้อมูลมี `data-label` ทุกคอลัมน์
- [ ] มี `.*-cell-primary` สำหรับคอลัมน์หลัก (หัวข้อการ์ด)
- [ ] มี `.*-card-tags` ที่มี tags + `.user-card-meta` พร้อม meta items
- [ ] meta items ใช้ `<span>label</span><strong>value</strong>`
- [ ] มี `.user-row-actions` สำหรับ action menu
- [ ] มี `.footer-range` สำหรับ pagination

### 5.2 CSS desktop

- [ ] มีกฎ `min-width` สำหรับตารางและ footer ที่ specificity สูง
- [ ] มีกฎ `overflow-x: auto` สำหรับ wrapper (desktop อนุญาตให้ scroll)
- [ ] grid-template-columns ครบทุกคอลัมน์

### 5.3 CSS mobile (`max-width: 760px`)

- [ ] **รีเซ็ต `min-width: 0`** ที่ specificity **เท่ากับ** กฎฐาน
      (เช็ค: มี `:not()` ครบทุกตัวเหมือนกฎฐาน)
- [ ] รีเซ็ต `min-width: 0` สำหรับ footer ด้วย
- [ ] ซ่อน `.head`
- [ ] แปลง row เป็นการ์ด: `grid-template-columns: minmax(0, 1fr) 34px`
- [ ] การ์ดมี `overflow: visible` (ห้าม `hidden`)
- [ ] ซ่อนคอลัมน์ที่ไม่ใช่ cell-primary
- [ ] cell-primary อยู่คอลัมน์ 1 แถว 1
- [ ] action menu อยู่คอลัมน์ 2 แถว 1
- [ ] tags + meta อยู่คอลัมน์ 1/-1 แถว 2
- [ ] meta items ใช้ `justify-content: space-between` (default) หรือ `grid` (comment-field-meta)
- [ ] meta value ใช้ `white-space: nowrap` + `text-overflow: ellipsis` (ตัด ...)
- [ ] meta value ใช้ `overflow: hidden` เพื่อ clip ข้อความที่เกิน
- [ ] meta value จำกัด `max-width` ที่ 50% ของการ์ดผ่าน `grid-template-columns: max-content minmax(0, 50%)`
- [ ] ทุกฟิลด์ meta มี class `comment-field-meta` เพื่อสัดส่วนเท่ากัน
- [ ] ทุกฟิลด์มีความกว้าง value เท่ากัน (วัดด้วย Playwright)

### 5.4 กฎที่ใช้ร่วมกัน (global)

- [ ] หากใช้ class global เช่น `.report-reason-meta`, `.comment-text-meta`
      ต้องเพิ่ม scoped override ในตารางนั้น ๆ แทนการแก้ global
- [ ] ห้ามแก้ global rule ที่ใช้ร่วมกันระหว่างหน้า

### 5.5 การทดสอบ

- [ ] ทดสอบที่ `390 × 844` (iPhone)
- [ ] ทดสอบที่ `360 × 640` (mobile เล็ก)
- [ ] ทดสอบที่ `768 × 1024` (tablet)
- [ ] ทดสอบที่ `1280 × 800` (desktop)
- [ ] วัด `rowBox.width` ต้องใกล้เคียง wrapper width
- [ ] วัด `tableMinWidth` ต้องเป็น `0px` บน mobile
- [ ] ตรวจ meta value ทุกตัวต้อง `white-space: nowrap`,
      `overflow: hidden`, `text-overflow: ellipsis`
- [ ] ตรวจ meta value ทุกฟิลด์มีความกว้างเท่ากัน (equal proportions)
- [ ] ถ่าย screenshot การ์ดแรกเพื่อยืนยันสายตา

---

## 6. ข้อผิดพลาดที่พบบ่อยและวิธีหลีกเลี่ยง

### 6.1 specificity ต่ำกว่ากฎฐาน

**อาการ:** รีเซ็ต `min-width: 0` ใน media query ไม่ทำงาน
ตารางยังกว้างเท่า desktop

**สาเหตุ:** selector ใน media query ขาด `:not()` ตัวหนึ่ง
ทำให้ specificity ต่ำกว่ากฎฐาน

**แก้:** ใช้ selector เหมือนกฎฐานทุกตัว และวางหลังกฎฐานในไฟล์

```css
/* ผิด — ขาด :not(.article-list-mode) */
body.asset-list-mode #table .asset-list-table { min-width: 0; }

/* ถูก — specificity เท่ากัน ชนะด้วยลำดับ source */
body.asset-list-mode:not(.article-list-mode):not(.category-list-mode)
  :not(.reported-board-mode) #table .asset-list-table { min-width: 0; }
```

### 6.2 `overflow: hidden` ตัดค่าที่ควรมองเห็น

**อาการ:** ค่า "หายไป" จากการ์ด ทั้งที่มีอยู่ใน DOM

**สาเหตุ:** wrapper ตั้ง `overflow-x: hidden` และตารางยังกว้างเกิน
ค่าจึงถูกเลื่อนออกนอกกรอบและถูก clip

**แก้:** รีเซ็ต `min-width: 0` ให้ตาราง (ดู 6.1) และตั้ง
`overflow: visible` บนการ์ด

### 6.3 global meta rule จำกัดความกว้าง

**อาการ:** ค่าบางคอลัมน์ถูก ellipsis ทั้งที่การ์ดกว้างพอ หรือ
สัดส่วนไม่เท่ากันระหว่างฟิลด์

**สาเหตุ:** กฎ global เช่น `.report-reason-meta` จำกัด
`grid-template-columns: max-content minmax(0, 56%)` และ
`white-space: nowrap` + `text-overflow: ellipsis`
ทำให้สัดส่วนไม่เท่ากับฟิลด์อื่น

**แก้:** เพิ่ม scoped override ในตารางนั้น ๆ ห้ามแก้ global
เพราะใช้ร่วมกันระหว่างหน้า ใช้ class `comment-field-meta`
เพื่อจำกัด value ที่ 50% ของการ์ด

```css
/* scoped override เฉพาะตารางนี้ — ใช้ comment-field-meta */
.*-list-table .user-card-meta-item.comment-field-meta {
  display: grid;
  grid-template-columns: max-content minmax(0, 50%);
  align-items: baseline;
  gap: 8px;
}
.*-list-table .user-card-meta-item.comment-field-meta strong {
  width: 100%;
  max-width: 100%;
  min-width: 0;
  display: block;
  overflow: hidden;
  text-align: right;
  text-overflow: ellipsis;
  white-space: nowrap;
}
```

### 6.4 ลืมรีเซ็ต footer

**อาการ:** footer/pagination กว้างเกินและถูกตัด

**สาเหตุ:** มีกฎ `min-width` ของ footer ด้วย specificity เดียวกับตาราง

**แก้:** รีเซ็ต `min-width: 0` สำหรับ footer ด้วย selector
ที่ specificity เท่ากัน

### 6.5 หัวข้อการ์ดห่อบรรทัด

**อาการ:** หัวข้อการ์ด (cell-primary) ห่อยาวจนการ์ดสูงผิดปกติ

**สาเหตุ:** ลืมตั้ง `white-space: nowrap` + `text-overflow: ellipsis`
บน cell-primary

**แก้:** หัวข้อการ์ดอนุญาตให้ ellipsis ได้ (ต่างจาก meta value)
เพราะเป็น title สั้น ๆ

---

## 7. การทดสอบด้วย Playwright

### 7. การทดสอบด้วย Playwright

#### 7.1 เตรียมสภาพแวดล้อม

```powershell
Set-Location "C:\Users\Admin\Desktop\TukDaeng\Prototypes"; node server.mjs
```

เซิร์ฟเวอร์ฟังที่ `http://127.0.0.1:4173`

```powershell
# ในโฟลเดอร์ Prototypes
npm init -y
npm install playwright --no-save
npx playwright install chromium
```

#### 7.2 สคริปต์ทดสอบ (ตัวอย่าง)

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

  // Login
  await page.fill("#login-email", "admin@tukdaeng.com");
  await page.fill("#login-password", "admin");
  await page.click('button[type="submit"]:visible:has-text("Send Email OTP")');
  await sleep(800);
  await page.fill("#otp-code", "123456");
  await page.click('button[type="submit"]:visible:has-text("Verify OTP")');
  await sleep(1000);

  // นำทางผ่าน jumpToModule (sidebar อยู่นอก viewport บน mobile)
  await page.evaluate(() => {
    if (typeof jumpToModule === "function") jumpToModule("assets", "Asset List");
  });
  await sleep(900);

  // เก็บค่า layout ของการ์ดแรก
  const cardRow = await page.locator(
    '.asset-list-table .asset-row:not(.head)'
  ).first();
  result.rowBox = await cardRow.boundingBox();
  result.rowGridTemplateColumns = await cardRow.evaluate(
    (el) => getComputedStyle(el).gridTemplateColumns
  );

  const tableEl = await page.locator('.asset-list-table').first();
  result.tableMinWidth = await tableEl.evaluate(
    (el) => getComputedStyle(el).minWidth
  );

  // เก็บ meta items
  const metaItems = await cardRow.locator(
    '.user-card-meta .user-card-meta-item'
  ).all();
  result.metaItems = [];
  for (const item of metaItems) {
    const strong = await item.locator('strong').first();
    result.metaItems.push({
      label: (await item.locator('span').first().textContent()).trim(),
      value: (await strong.textContent()).trim(),
      strongStyles: await strong.evaluate((el) => {
        const cs = getComputedStyle(el);
        return {
          whiteSpace: cs.whiteSpace,
          overflow: cs.overflow,
          textOverflow: cs.textOverflow,
          maxWidth: cs.maxWidth,
        };
      }),
    });
  }

  await cardRow.screenshot({ path: "_debug_screenshot.png" });
  writeFileSync(OUT, JSON.stringify(result, null, 2));
  console.log("DONE");
} finally {
  await browser.close();
}
```

#### 7.3 ค่า `jumpToModule(module, sub)` สำหรับหน้าหลัก

| หน้า              | module     | sub                |
| ----------------- | ---------- | ------------------ |
| Asset List        | `assets`   | `Asset List`       |
| Reported Assets   | `assets`   | `Reported Assets`  |
| Reported Comments | `assets`   | `Reported Comments`|
| Reported Users    | `users`    | `Reported Users`   |
| User List         | `users`    | `User Accounts`    |
| Offer List        | `offers`   | `Offer List`       |

#### 7.4 ค่าที่ต้องตรวจและค่าที่ถูกต้อง

| ค่า                       | ที่ถูกต้องบน mobile (390px)         |
| ------------------------- | ----------------------------------- |
| `rowBox.width`            | ~325px (ใกล้เคียง wrapper ~353px)   |
| `rowGridTemplateColumns`  | `~231–239px 34px`                   |
| `tableMinWidth`           | `0px`                               |
| `metaParentBox.width`     | ~279–287px                          |
| `strongStyles.whiteSpace` | `nowrap`                            |
| `strongStyles.overflow`   | `hidden`                            |
| `strongStyles.textOverflow`| `ellipsis`                         |
| `strongStyles.maxWidth`   | `100%` (จำกัดโดย grid 50%)          |
| ความกว้าง value ทุกฟิลด์   | เท่ากันทุกฟิลด์ (equal proportions) |

#### 7.5 ทำความสะอาดหลังทดสอบ

```powershell
Remove-Item -Force _debug_inspect.mjs, _debug_output.json, _debug_screenshot.png, package.json, package-lock.json -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
git status --short  # ควรเห็นเฉพาะไฟล์ที่ตั้งใจแก้
```

---

## 8. ตำแหน่งโค้ดอ้างอิง

ไฟล์เดียวที่เกี่ยวข้อง: `Prototypes/bo-prototype.html`

| ส่วน                       | บรรทัดโดยประมาณ | รายละเอียด                       |
| -------------------------- | --------------- | -------------------------------- |
| กฎฐาน `min-width`          | ~1273–1280      | Asset List desktop               |
| media query `max-width: 1180px` | ~6955      | tablet/คอมเล็ง                   |
| media query `max-width: 760px`  | ~7320       | **mobile — แปลงเป็นการ์ด**       |
| รีเซ็ต `min-width: 0`      | ~8333           | Asset List                       |
| แปลง row เป็นการ์ด         | ~8514           | `grid-template-columns: ... 34px`|
| meta items styling         | ~8696           | Asset List card meta             |
| render Asset List          | ~22723          | `renderAssetListRows`            |

> หมายเหตุ: หมายเลขบรรทัดอ้างอิงจากเวอร์ชันที่แก้แล้ว
> อาจเลื่อนได้เมื่อมีการแก้ไขไฟล์ในอนาคต

---

## 9. บทสรุป

1. **specificity สำคัญที่สุด** — กฎ reset มือถือต้อง specificity
   เท่ากับกฎฐาน ไม่ใช่แค่อยู่ใน media query
2. **`overflow: visible` บนการ์ด** — ห้าม `hidden` ไม่งั้นค่าถูก clip
3. **meta value ตัด ... ที่ 50%, หัวข้อการ์ด ellipsis ได้** —
   ทุกฟิลด์ meta ใช้ class `comment-field-meta` จำกัด value ที่ 50%
   ของการ์ด ตัดด้วย ellipsis เมื่อยาวเกิน สัดส่วนเท่ากันทุกฟิลด์
4. **scoped override ไม่ใช่ global edit** — ห้ามแก้ global rule
   ที่ใช้ร่วมกันระหว่างหน้า
5. **ทดสอบด้วยค่าจริง** — ใช้ Playwright วัด bounding box และ
   computed style ไม่ใช่แค่อ่านโค้ด
6. **ทดสอบหลาย viewport** — 390, 360, 768, 1280 อย่างน้อย
