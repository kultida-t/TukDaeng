const fs=require('fs');const p='d:/TukDaeng/Prototypes/fo-flow/index.html';let t=fs.readFileSync(p,'utf8');
const rep=(a,b)=>{if(!t.includes(a))console.log('MISS',a.slice(0,60));t=t.split(a).join(b)};
rep(`      background: rgba(255, 255, 255, 0.62);
      -webkit-backdrop-filter: blur(24px) saturate(1.6);
      backdrop-filter: blur(24px) saturate(1.6);
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);`,`      background: rgba(255, 255, 255, .34);
      -webkit-backdrop-filter: blur(24px) saturate(1.6);
      backdrop-filter: blur(24px) saturate(1.6);
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);`);
rep(`background: color-mix(in srgb, var(--surface-2) 50%, transparent);
      -webkit-backdrop-filter: blur(24px) saturate(1.6);`,`background: rgba(120, 124, 134, .26);
      -webkit-backdrop-filter: blur(24px) saturate(1.6);`);
rep(`.screen[data-nav="labeled"][data-theme="light"] .bottom-nav {
      background: rgba(255, 255, 255, .62);`,`.screen[data-nav="labeled"][data-theme="light"] .bottom-nav {
      background: rgba(255, 255, 255, .34);`);
rep("box-shadow: 0 4px 16px rgba(0, 0, 0, .35);","box-shadow: 0 4px 16px rgba(0, 0, 0, .35), inset 0 1px 0 rgba(255, 255, 255, .22);");
rep("box-shadow: 0 4px 16px rgba(0, 0, 0, 0.35);","box-shadow: 0 4px 16px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, .22);");
rep(`      flex-shrink: 0;
      pointer-events: none;
    }

    .screen[data-theme="dark"] .ch-head {`,`      flex-shrink: 0;
      pointer-events: none;
      position: sticky;
      top: 0;
      z-index: 40;
    }

    .screen[data-theme="dark"] .ch-head {`);
fs.writeFileSync(p,t);
