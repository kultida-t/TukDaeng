// Temporary verification: DL1-DL2 detail layout variants
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { chromium } = require("playwright");

const URL = "http://127.0.0.1:4173/feed-social-redesign.html";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1500, height: 950 } });
await page.goto(URL);
await page.waitForLoadState("domcontentloaded");
await page.waitForTimeout(600);

for (const dl of ["dl1", "dl2"]) {
  for (const theme of ["dark", "light"]) {
    const info = await page.evaluate(({ dl, theme }) => {
      state.dl = dl;
      const scr = document.querySelector(`.screen[data-theme="${theme}"]`);
      const pd = scr.querySelector('.page-detail');
      pd.innerHTML = detailHTML(POSTS[0]);
      scr.classList.add('detail-open');
      return {
        headTitle: pd.querySelector('.detail-title')?.textContent ?? null,
        postHead: !!pd.querySelector('.post-head'),
        actions: pd.querySelectorAll('.post-actions .act').length,
        likedBy: !!pd.querySelector('.liked-by'),
        caption: !!pd.querySelector('.caption'),
        igdTag: pd.querySelectorAll('.igd-tag').length,
        muteFab: !!pd.querySelector('.mute-fab'),
        heroAR: getComputedStyle(pd.querySelector('.detail-hero')).aspectRatio,
        ctaBar: !!pd.querySelector('.igd-cta'),
        specs: pd.querySelectorAll('.spec-row').length,
      };
    }, { dl, theme });
    console.log(dl, theme, JSON.stringify(info));
    await page.waitForTimeout(120);
    const phone = page.locator(`.screen[data-theme="${theme}"]`).locator('..');
    await phone.screenshot({ path: `screenshots/dl-${dl}-${theme}.png` });
    // scroll detail to show lower section once per variant (dark only)
    if (theme === "dark") {
      await page.evaluate(() => {
        const sc = document.querySelector('.screen[data-theme="dark"] .page-detail .detail-scroll');
        if (sc) sc.scrollTop = 620;
      });
      await page.waitForTimeout(120);
      await phone.screenshot({ path: `screenshots/dl-${dl}-dark-low.png` });
    }
  }
}

// PR placement works under DL2
for (const pr of ["pr1", "pr2", "pr3", "pr4"]) {
  const info = await page.evaluate((pr) => {
    state.dl = "dl2"; state.pr = pr;
    const scr = document.querySelector('.screen[data-theme="dark"]');
    const pd = scr.querySelector('.page-detail');
    pd.innerHTML = detailHTML(POSTS[0]);
    scr.classList.add('detail-open');
    return {
      bigPrice: !!pd.querySelector('.detail-price'),
      tp: pd.querySelector('.tag-price-row .tp')?.textContent ?? null,
      priceTag: pd.querySelector('.price-tag')?.textContent ?? null,
      tag: !!pd.querySelector('.inline-tag'),
    };
  }, pr);
  console.log("dl2+" + pr, JSON.stringify(info));
  await page.waitForTimeout(120);
  const phone = page.locator('.screen[data-theme="dark"]').locator('..');
  await phone.screenshot({ path: `screenshots/dl2-${pr}-dark.png` });
}

// TG — sale tag on/off
for (const tg of ["tg1", "tg2"]) {
  for (const [dl, pi] of [["dl1", 0], ["dl2", 0], ["dl2", 2]]) {
    const info = await page.evaluate(({ tg, dl, pi }) => {
      state.dl = dl; state.tg = tg; state.pr = "pr1";
      const scr = document.querySelector('.screen[data-theme="dark"]');
      const pd = scr.querySelector('.page-detail');
      pd.innerHTML = detailHTML(POSTS[pi]);
      scr.classList.add('detail-open');
      return {
        dl, pi, tag: pd.querySelector('.inline-tag')?.textContent ?? null,
        price: !!pd.querySelector('.detail-price'),
      };
    }, { tg, dl, pi });
    console.log(`${dl}+${tg}+p${pi}`, JSON.stringify(info));
  }
}

// K5 — chat bubble: fab + backdrop dim/scroll-lock + outside-tap close + send flow
const k5 = await page.evaluate(() => {
  state.dl = "dl2"; state.ask = "bubble"; state.tg = "tg1";
  const scr = document.querySelector('.screen[data-theme="dark"]');
  const pd = scr.querySelector('.page-detail');
  pd.innerHTML = detailHTML(POSTS[0]);
  scr.classList.add('detail-open');
  const fab = pd.querySelector('.chat-fab');
  const noPill = !pd.querySelector('.post-actions .ask-pill');
  fab.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  const pop = pd.querySelector('.chat-pop');
  const shown = pop.classList.contains('show');
  const dimmed = pd.querySelector('.cp-backdrop').classList.contains('show');
  const postCard = !!pop.querySelector('.cp-post');
  const input = pop.querySelector('input');
  input.value = "ยังอยู่ไหมครับ";
  pop.querySelector('.cp-send').dispatchEvent(new MouseEvent('click', { bubbles: true }));
  const msg = pop.querySelector('.chat-msg')?.textContent ?? null;
  return { fab: !!fab, noPill, shown, dimmed, postCard, msg };
});
console.log("k5:", JSON.stringify(k5));
await page.locator('.screen[data-theme="dark"]').locator('..').screenshot({ path: 'screenshots/k5-chatpop.png' });

// scroll-lock: wheel over backdrop must not scroll detail
const lock = await page.evaluate(() => {
  const scr = document.querySelector('.screen[data-theme="dark"]');
  const ds = scr.querySelector('.page-detail .detail-scroll');
  const bd = scr.querySelector('.page-detail .cp-backdrop');
  ds.scrollTop = 0;
  bd.dispatchEvent(new WheelEvent('wheel', { bubbles: true, deltaY: 300 }));
  const afterBackdrop = ds.scrollTop;
  return { afterBackdrop };
});
console.log("scroll-lock:", JSON.stringify(lock));

// tap outside (backdrop) closes
const tapOut = await page.evaluate(() => {
  const scr = document.querySelector('.screen[data-theme="dark"]');
  const bd = scr.querySelector('.page-detail .cp-backdrop');
  bd.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  const pop = scr.querySelector('.page-detail .chat-pop');
  return { closed: !pop.classList.contains('show'), undimmed: !bd.classList.contains('show') };
});
console.log("tap-out:", JSON.stringify(tapOut));
await page.evaluate(() => { state.ask = "outline"; });

// details-inner: only .view-full opens detail
const navCheck = await page.evaluate(() => {
  state.dl = "dl2";
  const scr = document.querySelector('.screen[data-theme="dark"]');
  scr.classList.remove('detail-open');
  // click a spec row inside details-inner — should NOT open
  const specRow = scr.querySelector('.post .details-inner .spec-row');
  specRow.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  const openedBySpec = scr.classList.contains('detail-open');
  // click .view-full — should open
  const vf = scr.querySelector('.post .view-full');
  vf.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  const openedByVF = scr.classList.contains('detail-open');
  return { openedBySpec, openedByVF };
});
console.log("nav:", JSON.stringify(navCheck));

// detail hero: drag swipe advances photo
const scr = page.locator('.screen[data-theme="dark"]');
const hero = scr.locator('.page-detail .detail-hero');
const box = await hero.boundingBox();
const counter1 = await hero.locator('.photo-counter').textContent();
await page.mouse.move(box.x + box.width * 0.75, box.y + box.height / 2);
await page.mouse.down();
for (let s = 1; s <= 8; s++) {
  await page.mouse.move(box.x + box.width * 0.75 - s * 30, box.y + box.height / 2);
  await page.waitForTimeout(15);
}
await page.mouse.up();
await page.waitForTimeout(500);
const counter2 = await hero.locator('.photo-counter').textContent();
console.log("swipe:", counter1, "->", counter2);
await scr.locator('..').screenshot({ path: 'screenshots/dl-swipe.png' });

await browser.close();
console.log("done");
