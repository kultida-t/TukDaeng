import fs from 'fs';

async function fetchAppStore() {
  const url = 'https://apps.apple.com/th/app/univerza-tukdaeng/id6811926515?l=th';
  console.log('Fetching:', url);
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept-Language': 'th,en;q=0.9'
    }
  });
  const html = await res.text();
  console.log('HTML size:', html.length);
  fs.writeFileSync('appstore_page.html', html, 'utf8');

  // Search for screenshot images in html
  // Apple App store uses srcset with is.mzstatic.com/image/thumb/Purple...
  const imgRegex = /https:\/\/is\d+-ssl\.mzstatic\.com\/image\/thumb\/[^\s"']+/g;
  const matches = [...new Set(html.match(imgRegex) || [])];
  console.log('Found mzstatic images:', matches.length);
  matches.forEach((m, idx) => console.log(`[${idx}] ${m}`));
}

fetchAppStore().catch(console.error);
