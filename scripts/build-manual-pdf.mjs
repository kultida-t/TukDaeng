import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { chromium } from '@playwright/test';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const deliverablesDir = path.join(projectRoot, 'deliverables');

if (!fs.existsSync(deliverablesDir)) {
  fs.mkdirSync(deliverablesDir, { recursive: true });
}

// Helper to convert project file paths to file:// URLs for Playwright
function getFileUrl(relativePath) {
  const fullPath = path.resolve(projectRoot, relativePath);
  return pathToFileURL(fullPath).href;
}

// Real official App Store screenshots
const realScreenshot1 = getFileUrl('deliverables/appstore-screenshots/screenshot_1.png');
const realScreenshot2 = getFileUrl('deliverables/appstore-screenshots/screenshot_2.png');
const realScreenshot3 = getFileUrl('deliverables/appstore-screenshots/screenshot_3.png');
const realScreenshot4 = getFileUrl('deliverables/appstore-screenshots/screenshot_4.png');
const realScreenshot5 = getFileUrl('deliverables/appstore-screenshots/screenshot_5.png');
const realScreenshot6 = getFileUrl('deliverables/appstore-screenshots/screenshot_6.png');

const appIconUrl = getFileUrl('Prototypes/assets/tukdaeng-app-icon.png');

console.log('Real screenshots paths prepared successfully. Assembling 10-page HTML...');

const htmlContent = `<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8">
  <title>Univerza Tukdaeng - Official User Manual</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Prompt:wght@300;400;500;600;700&display=swap');

    @page {
      size: 297mm 210mm;
      margin: 0;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }

    body {
      font-family: 'Prompt', 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
      background-color: #f1f5f9;
      color: #0f172a;
      -webkit-font-smoothing: antialiased;
    }

    .page {
      width: 297mm;
      height: 210mm;
      page-break-after: always;
      position: relative;
      overflow: hidden;
      background: #f8fafc;
      padding: 10mm 12mm 0 12mm;
      display: flex;
      flex-direction: column;
    }

    /* TOP HEADER BAR */
    .header-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 2px solid #08172e;
      padding-bottom: 7px;
      margin-bottom: 8px;
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .chapter-badge {
      background: #08172e;
      color: #f2c94c;
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-weight: 800;
      font-size: 19px;
      padding: 4px 10px;
      border-radius: 6px;
      border: 1px solid #c5a059;
      letter-spacing: 0.5px;
    }

    .header-titles {
      display: flex;
      flex-direction: column;
    }

    .header-title-en {
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-size: 13.5px;
      font-weight: 800;
      letter-spacing: 0.8px;
      color: #08172e;
      text-transform: uppercase;
    }

    .header-title-th {
      font-size: 11.5px;
      font-weight: 700;
      color: #b38027;
      margin-top: 1px;
    }

    .header-summary {
      font-size: 8.5px;
      color: #64748b;
      margin-top: 1px;
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .header-logo-icon {
      width: 28px;
      height: 28px;
      border-radius: 6px;
      border: 1px solid #c5a059;
    }

    .header-brand-text {
      text-align: right;
    }

    .header-brand-title {
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-size: 11px;
      font-weight: 800;
      color: #08172e;
      letter-spacing: 0.5px;
      display: block;
    }

    .header-brand-sub {
      font-size: 7.5px;
      color: #b38027;
      font-weight: 600;
      display: block;
    }

    /* 3-COLUMN BODY GRID */
    .body-grid {
      display: grid;
      grid-template-columns: 66mm 138mm 63mm;
      gap: 8px;
      flex: 1;
      min-height: 0;
    }

    /* CARDS */
    .card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 8px 10px;
      margin-bottom: 7px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.03);
    }

    .card-title-row {
      display: flex;
      align-items: center;
      gap: 6px;
      margin-bottom: 4px;
    }

    .card-icon-circle {
      width: 18px;
      height: 18px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 9.5px;
      font-weight: 800;
      flex-shrink: 0;
    }

    .card-icon-gold { background: #fef3c7; color: #b45309; }
    .card-icon-blue { background: #e0f2fe; color: #0369a1; }
    .card-icon-green { background: #dcfce7; color: #15803d; }
    .card-icon-purple { background: #f3e8ff; color: #7e22ce; }
    .card-icon-red { background: #fee2e2; color: #b91c1c; }

    .card-title {
      font-size: 9.5px;
      font-weight: 700;
      color: #08172e;
    }

    .card-desc {
      font-size: 8.5px;
      color: #475569;
      line-height: 1.35;
    }

    .rule-list {
      list-style: none;
      padding-left: 0;
      margin-top: 4px;
    }

    .rule-item {
      font-size: 8px;
      color: #334155;
      line-height: 1.3;
      margin-bottom: 3px;
      position: relative;
      padding-left: 9px;
    }

    .rule-item::before {
      content: "•";
      color: #b38027;
      position: absolute;
      left: 0;
      font-weight: bold;
    }

    /* CENTER COLUMN */
    .center-col {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    /* 5-STEP WORKFLOW STRIP */
    .workflow-strip {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 5px;
      background: #ffffff;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      padding: 5px 6px;
    }

    .workflow-step {
      text-align: center;
      position: relative;
    }

    .workflow-step:not(:last-child)::after {
      content: "›";
      position: absolute;
      right: -4px;
      top: 2px;
      color: #94a3b8;
      font-size: 13px;
      font-weight: bold;
    }

    .step-badge {
      display: inline-block;
      width: 14px;
      height: 14px;
      background: #08172e;
      color: #f2c94c;
      border-radius: 50%;
      font-size: 8px;
      font-weight: 800;
      line-height: 14px;
      margin-bottom: 1px;
    }

    .step-title {
      font-size: 8px;
      font-weight: 700;
      color: #08172e;
      white-space: nowrap;
    }

    .step-desc {
      font-size: 6.8px;
      color: #64748b;
      line-height: 1.15;
    }

    /* REAL SCREENSHOT CONTAINER */
    .real-screen-panel {
      background: #0c1017;
      border: 1px solid #232c3d;
      border-radius: 8px;
      padding: 6px 10px;
      display: flex;
      flex-direction: column;
      flex: 1;
      min-height: 0;
      box-shadow: 0 4px 15px rgba(0,0,0,0.15);
    }

    .panel-header-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid #1e293b;
      padding-bottom: 4px;
      margin-bottom: 6px;
    }

    .panel-header-title {
      font-size: 9.5px;
      font-weight: 700;
      color: #f8fafc;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .panel-tag-real {
      background: #e50914;
      color: #ffffff;
      font-size: 7px;
      font-weight: 800;
      padding: 1px 5px;
      border-radius: 4px;
      letter-spacing: 0.3px;
    }

    .panel-header-sub {
      font-size: 7.5px;
      color: #94a3b8;
    }

    .real-screen-layout {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 14px;
      flex: 1;
      min-height: 0;
    }

    .appstore-phone-img {
      height: 130mm;
      max-height: 130mm;
      object-fit: contain;
      border-radius: 18px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.6);
      border: 1.5px solid #334155;
    }

    .screen-callouts {
      display: flex;
      flex-direction: column;
      gap: 6px;
      max-width: 175px;
      font-size: 8px;
      color: #cbd5e1;
    }

    .callout-box {
      background: rgba(255,255,255,0.06);
      padding: 6px 8px;
      border-radius: 6px;
      border: 1px solid #334155;
      line-height: 1.3;
    }

    .callout-box strong {
      color: #f2c94c;
    }

    .callout-box strong.red-accent {
      color: #f87171;
    }

    /* AUTH SCREENSHOT SPECIFIC (Dark UI for Page 2) */
    .auth-phones-wrapper {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 12px;
      flex: 1;
      min-height: 0;
    }

    .iphone-frame-dark {
      width: 198px;
      background: #000000;
      border-radius: 24px;
      padding: 6px;
      border: 2px solid #27272a;
      box-shadow: 0 12px 35px rgba(0,0,0,0.6);
      display: flex;
      flex-direction: column;
    }

    .iphone-screen-dark {
      background: #121212;
      border-radius: 18px;
      padding: 8px 10px;
      display: flex;
      flex-direction: column;
      gap: 5.5px;
      color: #ffffff;
      font-size: 8.5px;
      position: relative;
    }

    .iphone-island {
      width: 55px;
      height: 12px;
      background: #000000;
      border-radius: 10px;
      margin: 0 auto 3px auto;
    }

    .iphone-statusbar {
      display: flex;
      justify-content: space-between;
      font-size: 7.5px;
      font-weight: 700;
      color: #a1a1aa;
      margin-top: -10px;
      margin-bottom: 4px;
    }

    .auth-app-title {
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-size: 15px;
      font-weight: 900;
      color: #e50914;
      letter-spacing: 1px;
      text-align: center;
    }

    .auth-input-label {
      font-size: 7px;
      color: #a1a1aa;
      margin-bottom: 1px;
    }

    .auth-input-field {
      background: #1c1c1e;
      border: 1px solid #3f3f46;
      border-radius: 6px;
      padding: 4px 6px;
      font-size: 8.5px;
      color: #ffffff;
    }

    .auth-input-highlight {
      border: 1.5px solid #e50914;
      font-weight: 600;
    }

    .auth-red-btn {
      background: #e50914;
      color: #ffffff;
      border: none;
      border-radius: 20px;
      padding: 5.5px;
      font-size: 8.5px;
      font-weight: 700;
      text-align: center;
      margin-top: 3px;
      box-shadow: 0 4px 12px rgba(229, 9, 20, 0.4);
    }

    .otp-digits-row {
      display: flex;
      justify-content: center;
      gap: 4px;
      margin: 6px 0;
    }

    .otp-digit-box {
      width: 22px;
      height: 28px;
      background: #1c1c1e;
      border: 1.5px solid #e50914;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      font-size: 13px;
      color: #ffffff;
    }

    /* RIGHT COLUMN STYLES */
    .right-col {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .best-practice-card {
      background: #ffffff;
      border: 1px solid #c5a059;
      border-left: 3px solid #b38027;
      border-radius: 6px;
      padding: 6px 8px;
    }

    .caution-card {
      background: #fffbeb;
      border: 1px solid #fde68a;
      border-left: 3px solid #d97706;
      border-radius: 6px;
      padding: 6px 8px;
    }

    /* TABLES */
    .data-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 8.5px;
      text-align: left;
    }

    .data-table th {
      background: #08172e;
      color: #ffffff;
      padding: 4px 6px;
      font-weight: 700;
      border: 1px solid #0f264a;
    }

    .data-table td {
      padding: 3.5px 6px;
      border: 1px solid #e2e8f0;
      color: #334155;
    }

    .data-table tr:nth-child(even) {
      background: #f8fafc;
    }

    .badge-pill {
      font-size: 7px;
      font-weight: 700;
      padding: 1px 5px;
      border-radius: 10px;
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }

    .badge-sale { background: #fee2e2; color: #e50914; border: 1px solid #fca5a5; }
    .badge-show { background: #e0f2fe; color: #0369a1; border: 1px solid #7dd3fc; }
    .badge-hide { background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; }
    .badge-sold { background: #fef2f2; color: #991b1b; border: 1px solid #f87171; }

    /* FOOTER BAR */
    .footer-bar {
      margin-top: auto;
      height: 9mm;
      background: #08172e;
      border-top: 2px solid #c5a059;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 12mm;
      color: #ffffff;
      margin-left: -12mm;
      margin-right: -12mm;
    }

    .footer-left {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 8px;
      font-weight: 600;
      letter-spacing: 0.5px;
    }

    .footer-center {
      font-size: 7.5px;
      color: #cbd5e1;
    }

    .footer-right {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 8px;
      font-family: 'Plus Jakarta Sans', sans-serif;
    }

    .footer-page-num {
      font-weight: 800;
      color: #f2c94c;
      background: #0f264a;
      padding: 2px 7px;
      border-radius: 4px;
      border: 1px solid #c5a059;
    }

    /* COVER PAGE CUSTOM STYLES */
    .cover-page {
      padding: 10mm 14mm 0 14mm;
      background: linear-gradient(135deg, #050e1c 0%, #0a1b33 60%, #0d2242 100%);
      color: #ffffff;
    }

    .cover-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 10px;
      border-bottom: 1px solid rgba(197, 160, 89, 0.4);
    }

    .cover-brand {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .cover-brand-logo {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      border: 2px solid #c5a059;
      box-shadow: 0 4px 12px rgba(0,0,0,0.4);
    }

    .cover-brand-name {
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-size: 16px;
      font-weight: 800;
      letter-spacing: 1px;
      color: #ffffff;
    }

    .cover-brand-tag {
      font-size: 9.5px;
      color: #f2c94c;
      letter-spacing: 0.5px;
      font-weight: 600;
    }

    .cover-quote {
      font-size: 10.5px;
      font-style: italic;
      color: #cbd5e1;
      max-width: 320px;
      text-align: right;
      line-height: 1.4;
      border-right: 3px solid #c5a059;
      padding-right: 10px;
    }

    .cover-body {
      display: grid;
      grid-template-columns: 140mm 120mm;
      gap: 10mm;
      margin-top: 10px;
      flex: 1;
      align-items: center;
    }

    .cover-eyebrow {
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-size: 11px;
      font-weight: 800;
      color: #f2c94c;
      letter-spacing: 2px;
      text-transform: uppercase;
      margin-bottom: 4px;
      display: inline-block;
      padding: 3px 8px;
      background: rgba(197, 160, 89, 0.15);
      border-radius: 4px;
      border: 1px solid rgba(197, 160, 89, 0.4);
    }

    .cover-title {
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-size: 38px;
      font-weight: 800;
      line-height: 1.05;
      letter-spacing: 1px;
      color: #ffffff;
      margin-bottom: 6px;
    }

    .cover-title-th {
      font-size: 18px;
      font-weight: 700;
      color: #f2c94c;
      margin-bottom: 10px;
      line-height: 1.3;
    }

    .cover-desc {
      font-size: 11px;
      color: #94a3b8;
      line-height: 1.45;
      margin-bottom: 14px;
    }

    .cover-pillars {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
    }

    .cover-pillar-card {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 8px;
      padding: 7px 9px;
      display: flex;
      align-items: flex-start;
      gap: 8px;
    }

    .cover-pillar-icon {
      width: 22px;
      height: 22px;
      border-radius: 50%;
      background: #c5a059;
      color: #08172e;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      font-size: 10.5px;
      flex-shrink: 0;
    }

    .cover-pillar-title {
      font-size: 10.5px;
      font-weight: 700;
      color: #ffffff;
    }

    .cover-pillar-sub {
      font-size: 8.5px;
      color: #94a3b8;
      line-height: 1.25;
      margin-top: 1px;
    }

    .cover-screens-showcase {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 12px;
    }

    .cover-real-screen {
      height: 142mm;
      max-height: 142mm;
      object-fit: contain;
      border-radius: 18px;
      box-shadow: 0 15px 35px rgba(0,0,0,0.6);
      border: 2px solid #334155;
    }

    .cover-footer-bar {
      margin-top: auto;
      height: 9mm;
      background: #030812;
      border-top: 2px solid #c5a059;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 14mm;
      margin-left: -14mm;
      margin-right: -14mm;
      font-size: 8.5px;
      color: #94a3b8;
    }
  </style>
</head>
<body>

  <!-- ================= PAGE 1: COVER PAGE ================= -->
  <div class="page cover-page">
    <div class="cover-header">
      <div class="cover-brand">
        <img src="${appIconUrl}" class="cover-brand-logo" alt="Tukdaeng Logo">
        <div>
          <div class="cover-brand-name">UNIVERZA TUKDAENG</div>
          <div class="cover-brand-tag">PERSONAL WATCH REGISTRY & COMMUNITY (PWRC)</div>
        </div>
      </div>
      <div class="cover-quote">
        “The premier marketplace & collection management system for luxury watch connoisseurs.”
      </div>
    </div>

    <div class="cover-body">
      <div>
        <div class="cover-eyebrow">OFFICIAL OPERATIONAL WORKFLOW & USER MANUAL</div>
        <div class="cover-title">APP OPERATION<br>RULEBOOK</div>
        <div class="cover-title-th">คู่มือมาตรฐานการใช้งานแอปพลิเคชันตึกแดง (Univerza Tukdaeng)</div>
        <div class="cover-desc">
          คู่มือแนะนำขั้นตอนการทำงานจริงของแอปตึกแดงบน iOS (App Store) เริ่มต้นตั้งแต่การสมัครสมาชิก ยืนยันรหัส OTP การค้นหานาฬิกาหรู การเจรจายื่นข้อเสนอ (Make Offer) การลงทะเบียนนาฬิกา (Add Asset) การเฝ้าดูตลาด (Watch Alert) จนถึงการบริหารพอร์ตความมั่งคั่งส่วนบุคคล
        </div>

        <div class="cover-pillars">
          <div class="cover-pillar-card">
            <div class="cover-pillar-icon">1</div>
            <div>
              <div class="cover-pillar-title">DISCOVER ค้นหาแม่นยำ</div>
              <div class="cover-pillar-sub">เข้าถึงนาฬิกาแท้ คัดกรองตามรุ่น เลข Ref และอุปกรณ์กล่องใบครบ</div>
            </div>
          </div>
          <div class="cover-pillar-card">
            <div class="cover-pillar-icon">2</div>
            <div>
              <div class="cover-pillar-title">TRADE ซื้อขายมั่นใจ</div>
              <div class="cover-pillar-sub">ระบบยื่นข้อเสนอ Make Offer ต่อรองราคา และปิดการขายผ่านแชทโดยตรง</div>
            </div>
          </div>
          <div class="cover-pillar-card">
            <div class="cover-pillar-icon">3</div>
            <div>
              <div class="cover-pillar-title">MANAGE บริหารเป็นระบบ</div>
              <div class="cover-pillar-sub">ควบคุม 4 สถานะ Sale, Show, Hide, Sold พร้อมบันทึกประวัติ Provenance</div>
            </div>
          </div>
          <div class="cover-pillar-card">
            <div class="cover-pillar-icon">4</div>
            <div>
              <div class="cover-pillar-title">SECURE ปลอดภัยสูงสุด</div>
              <div class="cover-pillar-sub">คัดกรองผู้ใช้งาน ตรวจสอบรายงานภายใน 24 ชม. และคุ้มครองข้อมูลส่วนตัว</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Real App Store Screenshots Showcase on Cover -->
      <div class="cover-screens-showcase">
        <img src="${realScreenshot1}" class="cover-real-screen" alt="Real App Feed">
        <img src="${realScreenshot2}" class="cover-real-screen" style="height: 135mm; opacity: 0.95;" alt="Real Asset Detail">
      </div>
    </div>

    <div class="cover-footer-bar">
      <div>
        <strong>คู่มือฉบับทางการสำหรับ:</strong> สมาชิกนักสะสม (Collectors) • ผู้ซื้อ-ผู้ขาย (Buyers & Sellers) • ร้านค้าพันธมิตร (Dealers) • ทีมงานดูแลระบบ (Support)
      </div>
      <div>
        <span>Version 1.0 (App Store Official Baseline)</span> &nbsp;|&nbsp; <span>ตุลาคม 2026</span> &nbsp;|&nbsp; <strong style="color: #f2c94c;">Page 1</strong>
      </div>
    </div>
  </div>

  <!-- ================= PAGE 2: 01 GETTING STARTED: REGISTRATION & SECURITY ================= -->
  <div class="page">
    <div class="header-bar">
      <div class="header-left">
        <div class="chapter-badge">01</div>
        <div class="header-titles">
          <div class="header-title-en">GETTING STARTED: REGISTRATION & SECURITY</div>
          <div class="header-title-th">เริ่มต้นก้าวแรก: การสมัครสมาชิกและการยืนยันตัวตน</div>
          <div class="header-summary">การลงทะเบียนบัญชีใหม่ด้วยอีเมลทดสอบ, การยินยอมเงื่อนไข, การยืนยันรหัส OTP 30 นาที และการเข้าสู่ระบบ</div>
        </div>
      </div>
      <div class="header-right">
        <img src="${appIconUrl}" class="header-logo-icon" alt="Logo">
        <div class="header-brand-text">
          <span class="header-brand-title">UNIVERZA TUKDAENG</span>
          <span class="header-brand-sub">ACCOUNT & IDENTITY LIFECYCLE</span>
        </div>
      </div>
    </div>

    <div class="body-grid">
      <!-- Left Column -->
      <div>
        <div class="card">
          <div class="card-title-row">
            <div class="card-icon-circle card-icon-gold">🔑</div>
            <div class="card-title">ข้อมูลบัญชีทดสอบที่ระบุ</div>
          </div>
          <div class="card-desc" style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:6px; padding:6px; margin-top:2px;">
            <div style="font-size: 8px; color: #64748b;">อีเมลสำหรับสมัคร:</div>
            <div style="font-size: 9.5px; font-weight: 700; color: #08172e; word-break: break-all;">tukdaeng.user1@gmail.com</div>
            <div style="font-size: 8px; color: #64748b; margin-top: 3px;">รหัสผ่าน (Password):</div>
            <div style="font-size: 9.5px; font-weight: 700; color: #e50914; font-family: monospace;">1Qazxsw2*</div>
          </div>
        </div>

        <div class="card">
          <div class="card-title-row">
            <div class="card-icon-circle card-icon-blue">🔒</div>
            <div class="card-title">นโยบายรหัสผ่าน (Policy)</div>
          </div>
          <div class="card-desc">
            รหัสผ่านต้องมีความปลอดภัยสูงเพื่อคุ้มครองข้อมูลทรัพย์สิน:
            <ul class="rule-list" style="margin-top: 4px;">
              <li class="rule-item">ความยาวอย่างน้อย <strong>8 ตัวอักษร</strong></li>
              <li class="rule-item">ต้องมีตัวเลข (0-9) หรือสัญลักษณ์พิเศษ</li>
              <li class="rule-item">แนะนำผสมตัวพิมพ์ใหญ่และพิมพ์เล็ก</li>
              <li class="rule-item"><em>(รหัส 1Qazxsw2* ผ่านเกณฑ์ความปลอดภัยครบถ้วน)</em></li>
            </ul>
          </div>
        </div>

        <div class="card">
          <div class="card-title-row">
            <div class="card-icon-circle card-icon-purple">📜</div>
            <div class="card-title">เงื่อนไขการสมัครสมาชิก</div>
          </div>
          <div class="card-desc">
            ผู้สมัครทุกคนต้องกดยอมรับ <strong>Terms of Use</strong> และ <strong>Privacy Policy</strong> ก่อนระบบจึงจะเปิดให้กดส่งข้อมูลได้ และ 1 อีเมลสามารถใช้สมัครได้ 1 บัญชีเท่านั้น
          </div>
        </div>
      </div>

      <!-- Center Column -->
      <div class="center-col">
        <!-- 5-Step Workflow -->
        <div class="workflow-strip">
          <div class="workflow-step">
            <div class="step-badge">1</div>
            <div class="step-title">เลือก Sign Up</div>
            <div class="step-desc">เปิดแอปและแตะปุ่มสมัครสมาชิก</div>
          </div>
          <div class="workflow-step">
            <div class="step-badge">2</div>
            <div class="step-title">กรอกข้อมูล</div>
            <div class="step-desc">อีเมล, รหัส 1Qazxsw2*</div>
          </div>
          <div class="workflow-step">
            <div class="step-badge">3</div>
            <div class="step-title">ยอมรับนโยบาย</div>
            <div class="step-desc">ติ๊ก Terms & Privacy</div>
          </div>
          <div class="workflow-step">
            <div class="step-badge">4</div>
            <div class="step-title">ยืนยัน OTP</div>
            <div class="step-desc">กรอก 6 หลัก (อายุ 30 นาที)</div>
          </div>
          <div class="workflow-step">
            <div class="step-badge">5</div>
            <div class="step-title">เข้าใช้งาน</div>
            <div class="step-desc">รับ Token เข้าสู่ระบบทันที</div>
          </div>
        </div>

        <!-- Real Dark-Theme Sign Up & OTP Screens -->
        <div class="real-screen-panel">
          <div class="panel-header-row">
            <div class="panel-header-title">
              <span class="panel-tag-real">APP FLOW</span>
              <span>หน้าจอการสมัครสมาชิกและการยืนยัน OTP (ธีมมืดตามมาตรฐานแอปจริง)</span>
            </div>
            <div class="panel-header-sub">ใช้อีเมล tukdaeng.user1@gmail.com และรหัสผ่าน 1Qazxsw2*</div>
          </div>

          <div class="auth-phones-wrapper">
            <!-- Screen 1: Real Dark Sign Up Form -->
            <div class="iphone-frame-dark">
              <div class="iphone-screen-dark">
                <div class="iphone-island"></div>
                <div class="iphone-statusbar">
                  <span>9:41</span>
                  <span>5G 100%</span>
                </div>
                <div style="text-align: center; margin: 2px 0;">
                  <div class="auth-app-title">TUK DAENG</div>
                  <div style="font-size: 7.5px; color: #a1a1aa; margin-top: 1px;">สมัครสมาชิกใหม่สำหรับนักสะสม</div>
                </div>

                <!-- Input fields in real dark style -->
                <div style="display: flex; flex-direction: column; gap: 4px; margin-top: 1px;">
                  <div>
                    <div class="auth-input-label">ชื่อผู้ใช้งาน (Display Name)</div>
                    <div class="auth-input-field">
                      Tukdaeng Collector
                    </div>
                  </div>
                  <div>
                    <div class="auth-input-label">อีเมล (Email) *</div>
                    <div class="auth-input-field auth-input-highlight">
                      tukdaeng.user1@gmail.com
                    </div>
                  </div>
                  <div>
                    <div class="auth-input-label">รหัสผ่าน (Password) *</div>
                    <div class="auth-input-field" style="display: flex; justify-content: space-between;">
                      <span>•••••••••</span>
                      <span style="color: #4ade80; font-size: 7px;">(1Qazxsw2*)</span>
                    </div>
                  </div>
                </div>

                <div style="display: flex; gap: 4px; align-items: flex-start; margin-top: 2px;">
                  <span style="color: #e50914; font-size: 9px;">☑</span>
                  <div style="font-size: 6.8px; color: #a1a1aa; line-height: 1.2;">
                    ฉันยอมรับ <span style="color: #f87171; text-decoration: underline;">ข้อกำหนดการใช้งาน</span> และ <span style="color: #f87171; text-decoration: underline;">นโยบายความเป็นส่วนตัว</span>
                  </div>
                </div>

                <div class="auth-red-btn">
                  สมัครสมาชิก (Sign Up)
                </div>

                <div style="text-align: center; font-size: 7px; color: #71717a; margin-top: 2px;">
                  มีบัญชีอยู่แล้ว? <span style="color: #e50914; font-weight: 700;">เข้าสู่ระบบ (Sign In)</span>
                </div>
              </div>
            </div>

            <!-- Screen 2: Real Dark OTP Verification -->
            <div class="iphone-frame-dark">
              <div class="iphone-screen-dark">
                <div class="iphone-island"></div>
                <div class="iphone-statusbar">
                  <span>9:42</span>
                  <span>5G 100%</span>
                </div>
                <div style="text-align: center; margin: 4px 0;">
                  <div style="font-size: 16px;">✉️</div>
                  <div style="font-size: 10.5px; font-weight: 700; color: #ffffff; margin-top: 2px;">ยืนยันรหัส OTP</div>
                  <div style="font-size: 7px; color: #a1a1aa; line-height: 1.25; margin-top: 2px;">
                    กรุณากรอกรหัส 6 หลักที่ส่งไปยังอีเมล<br><strong style="color: #ffffff;">tukdaeng.user1@gmail.com</strong>
                  </div>
                </div>

                <!-- OTP inputs in real dark style -->
                <div class="otp-digits-row">
                  <div class="otp-digit-box">8</div>
                  <div class="otp-digit-box">3</div>
                  <div class="otp-digit-box">9</div>
                  <div class="otp-digit-box">2</div>
                  <div class="otp-digit-box">5</div>
                  <div class="otp-digit-box">4</div>
                </div>

                <div style="text-align: center; font-size: 7.5px; color: #f87171;">
                  รหัสจะหมดอายุใน: <strong>29:45 นาที</strong>
                </div>

                <div class="auth-red-btn" style="margin-top: 5px;">
                  ยืนยันรหัส OTP
                </div>

                <div style="text-align: center; font-size: 7px; color: #a1a1aa; margin-top: 3px;">
                  ไม่ได้รับรหัส? <span style="color: #e50914; font-weight: 700;">ขอรหัสใหม่ (Resend OTP)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Column -->
      <div class="right-col">
        <div class="best-practice-card">
          <div style="font-size: 10px; font-weight: 700; color: #b38027; margin-bottom: 3px;">🌟 ข้อควรปฏิบัติ (Security Tips)</div>
          <div style="font-size: 8.5px; color: #334155; line-height: 1.35;">
            <strong>รักษาความลับของรหัส OTP:</strong>
            รหัส OTP 6 หลักใช้ยืนยันความเป็นเจ้าของอีเมล ทีมงานตึกแดงไม่มีนโยบายสอบถามรหัสผ่านหรือ OTP จากผู้ใช้งานเด็ดขาด
          </div>
        </div>

        <div class="caution-card">
          <div style="font-size: 10px; font-weight: 700; color: #d97706; margin-bottom: 3px;">⚠️ การจัดการข้อผิดพลาด (Errors)</div>
          <div style="font-size: 8.5px; color: #334155; line-height: 1.35;">
            <ul class="rule-list">
              <li class="rule-item"><strong>อีเมลซ้ำ:</strong> ระบบแจ้งว่ามีบัญชีแล้ว และให้ไปหน้า Sign In</li>
              <li class="rule-item"><strong>OTP หมดอายุ:</strong> รหัสมีอายุ 30 นาที หากเกินเวลาให้กดขอรหัสใหม่</li>
              <li class="rule-item"><strong>บัญชีถูกระงับ:</strong> หากพบบัญชี Suspended จะแสดงเหตุผลและช่องทางติดต่อ Support</li>
            </ul>
          </div>
        </div>

        <div class="card">
          <div class="card-title-row">
            <div class="card-icon-circle card-icon-green">🍎</div>
            <div class="card-title">ช่องทาง Social Sign In</div>
          </div>
          <div style="font-size: 8.5px; color: #334155; line-height: 1.35;">
            นอกจาก Email/Password แอปตึกแดงยังรองรับ:
            <ul class="rule-list" style="margin-top: 2px;">
              <li class="rule-item"><strong>Sign in with Apple</strong> (ข้ามขั้นตอน OTP)</li>
              <li class="rule-item"><strong>Sign in with Google</strong> (ข้ามขั้นตอน OTP)</li>
              <li class="rule-item"><em>(แยกวิธีเข้า ไม่สามารถใช้ Password ปนกับ SSO ได้)</em></li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <div class="footer-bar">
      <div class="footer-left">
        <span>UNIVERZA TUKDAENG</span> &nbsp;|&nbsp; <span>Mobile Application Official Operation Manual</span>
      </div>
      <div class="footer-center">
        Authentic. Connected. Timeless. | การสมัครสมาชิกและการยืนยันตัวตน
      </div>
      <div class="footer-right">
        <span>Version 1.0</span> &nbsp;|&nbsp; <span>04 Oct 2026</span> &nbsp;|&nbsp; <span class="footer-page-num">Page 2</span>
      </div>
    </div>
  </div>

  <!-- ================= PAGE 3: 02 SYSTEM OVERVIEW & USER ROLES ================= -->
  <div class="page">
    <div class="header-bar">
      <div class="header-left">
        <div class="chapter-badge">02</div>
        <div class="header-titles">
          <div class="header-title-en">SYSTEM OVERVIEW & USER ROLES</div>
          <div class="header-title-th">สถาปัตยกรรมระบบและโครงสร้างสิทธิ์ผู้ใช้งาน</div>
          <div class="header-summary">โครงสร้างความสัมพันธ์ระบบ Univerza Tukdaeng, โมเดลบทบาทผู้ใช้แบบ Single Role และสถานะมาตรฐานของนาฬิกา</div>
        </div>
      </div>
      <div class="header-right">
        <img src="${appIconUrl}" class="header-logo-icon" alt="Logo">
        <div class="header-brand-text">
          <span class="header-brand-title">UNIVERZA TUKDAENG</span>
          <span class="header-brand-sub">LUXURY WATCH MARKETPLACE</span>
        </div>
      </div>
    </div>

    <div class="body-grid">
      <!-- Left Column -->
      <div>
        <div class="card">
          <div class="card-title-row">
            <div class="card-icon-circle card-icon-gold">💡</div>
            <div class="card-title">แนวคิด (Concept)</div>
          </div>
          <div class="card-desc">
            Tukdaeng ถูกออกแบบมาเพื่อเป็น <strong>Marketplace Community เฉพาะทางสำหรับนักสะสมนาฬิกาหรู</strong> โดยรวมระบบตลาดซื้อขาย และการบริหารจัดการของสะสมส่วนบุคคล (Personal Registry) เข้าไว้ในแอปเดียว
          </div>
        </div>

        <div class="card">
          <div class="card-title-row">
            <div class="card-icon-circle card-icon-blue">👥</div>
            <div class="card-title">โมเดลผู้ใช้ (Single User Role)</div>
          </div>
          <div class="card-desc">
            ผู้ใช้งานทั่วไปมี <strong>Role เดียวกันทั้งหมดหลังสมัครสมาชิก</strong> ไม่แบ่งแยกสิทธิ์ Buyer, Seller หรือ Collector บัญชีเดียวสามารถ:
            <ul class="rule-list" style="margin-top: 4px;">
              <li class="rule-item">ค้นหา และส่งข้อเสนอซื้อ (Make Offer)</li>
              <li class="rule-item">ลงขายและจัดการนาฬิกาของตนเอง</li>
              <li class="rule-item">บันทึกคอลเลกชันส่วนตัวและดูพอร์ต</li>
              <li class="rule-item">ตั้ง Watch Alert และแชทคุยกับสมาชิก</li>
            </ul>
          </div>
        </div>

        <div class="card">
          <div class="card-title-row">
            <div class="card-icon-circle card-icon-green">🎯</div>
            <div class="card-title">ขอบเขตระบบเฟส 1</div>
          </div>
          <div class="card-desc">
            ระบบมุ่งเน้นการเชื่อมต่อผู้ซื้อ-ผู้ขายโดยตรงอย่างโปร่งใส <strong>ยังไม่มีระบบชำระเงินในแอป (No In-App Payment)</strong> การชำระเงินและตรวจเช็กนาฬิกาทำภายนอกผ่านการนัดหมาย
          </div>
        </div>
      </div>

      <!-- Center Column -->
      <div class="center-col">
        <!-- User Scope Matrix -->
        <div class="card" style="margin-bottom: 0;">
          <div class="card-title-row">
            <div class="card-icon-circle card-icon-blue">📊</div>
            <div class="card-title">ตารางเปรียบเทียบสิทธิ์การเข้าถึงข้อมูลตามสถานะผู้ใช้งาน (User Model Matrix)</div>
          </div>
          <table class="data-table">
            <thead>
              <tr>
                <th>ฟังก์ชันการทำงาน</th>
                <th>Guest (ยังไม่ล็อกอิน)</th>
                <th>Member (เข้าสู่ระบบแล้ว)</th>
                <th>Owner (เจ้าของสินทรัพย์)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>ดู Feed / ค้นหา / ดูรายละเอียดสินค้า</strong></td>
                <td><span style="color:#059669;">✔ ดูได้ (เฉพาะ Sale)</span></td>
                <td><span style="color:#059669;">✔ ดูได้ (เฉพาะ Sale)</span></td>
                <td><span style="color:#059669;">✔ ดูได้ทุกรายการของตนเอง</span></td>
              </tr>
              <tr>
                <td><strong>กด Like / ติดตาม / แชร์สาธารณะ</strong></td>
                <td><span style="color:#dc2626;">✖ แสดง Login Required</span></td>
                <td><span style="color:#059669;">✔ ทำได้อิสระ</span></td>
                <td><span style="color:#059669;">✔ จัดการได้ทั้งหมด</span></td>
              </tr>
              <tr>
                <td><strong>ยื่นข้อเสนอ (Make Offer) / ส่งข้อความแชท</strong></td>
                <td><span style="color:#dc2626;">✖ แสดง Login Required</span></td>
                <td><span style="color:#059669;">✔ ส่ง Offer & แชทได้</span></td>
                <td><span style="color:#0284c7;">✔ รับ/ปฏิเสธข้อเสนอ</span></td>
              </tr>
              <tr>
                <td><strong>ลงทะเบียนนาฬิกา (Add Asset) / แก้ไขข้อมูล</strong></td>
                <td><span style="color:#dc2626;">✖ ใช้งานไม่ได้</span></td>
                <td><span style="color:#059669;">✔ ลงทะเบียนได้ไม่จำกัด</span></td>
                <td><span style="color:#059669;">✔ จัดการได้เต็มรูปแบบ</span></td>
              </tr>
              <tr>
                <td><strong>เข้าถึงแดชบอร์ดพอร์ตโฟลิโอ (Private Portfolio)</strong></td>
                <td><span style="color:#dc2626;">✖ ปิดกั้น 100%</span></td>
                <td><span style="color:#dc2626;">✖ ดูของคนอื่นไม่ได้</span></td>
                <td><span style="color:#059669;">✔ ดูพอร์ตทรัพย์สินของตนเองได้</span></td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 4 Canonical Asset Statuses -->
        <div class="card" style="background:#ffffff; color:#0f172a; border: 1px solid #cbd5e1; margin-bottom: 0;">
          <div class="card-title-row" style="border-bottom: 1px solid #e2e8f0; padding-bottom: 3px; margin-bottom: 5px;">
            <div class="card-title" style="color:#08172e;">4 สถานะมาตรฐานของนาฬิกา (Canonical Asset Status Model)</div>
          </div>

          <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; margin-bottom: 6px;">
            <div style="background: #ffffff; border: 1px solid #fca5a5; border-radius: 6px; padding: 6px;">
              <div style="display:flex; justify-content:space-between; align-items:center;">
                <span class="badge-pill badge-sale">SALE</span>
                <span style="font-size:7.5px; color:#e50914; font-weight:700;">เปิดขาย</span>
              </div>
              <div style="font-size:8px; color:#334155; margin-top:4px; line-height:1.2;">
                แสดงบน Feed, Search, Watch Alert, Public Profile และคำนวณใน Portfolio
              </div>
            </div>

            <div style="background: #ffffff; border: 1px solid #7dd3fc; border-radius: 6px; padding: 6px;">
              <div style="display:flex; justify-content:space-between; align-items:center;">
                <span class="badge-pill badge-show">SHOW</span>
                <span style="font-size:7.5px; color:#0369a1; font-weight:700;">โชว์คอลเลกชัน</span>
              </div>
              <div style="font-size:8px; color:#334155; margin-top:4px; line-height:1.2;">
                แสดงใน Public Profile เท่านั้น ไม่ขึ้น Feed/Search แต่เปิดให้ Make Offer จากหน้า Detail ได้
              </div>
            </div>

            <div style="background: #ffffff; border: 1px solid #cbd5e1; border-radius: 6px; padding: 6px;">
              <div style="display:flex; justify-content:space-between; align-items:center;">
                <span class="badge-pill badge-hide">HIDE</span>
                <span style="font-size:7.5px; color:#475569; font-weight:700;">ซ่อนส่วนตัว</span>
              </div>
              <div style="font-size:8px; color:#334155; margin-top:4px; line-height:1.2;">
                เห็นเฉพาะเจ้าของ (Owner) ใน Owner Profile เพื่อเก็บบันทึกข้อมูลส่วนตัวและคำนวณพอร์ต
              </div>
            </div>

            <div style="background: #ffffff; border: 1px solid #fca5a5; border-radius: 6px; padding: 6px;">
              <div style="display:flex; justify-content:space-between; align-items:center;">
                <span class="badge-pill badge-sold">SOLD</span>
                <span style="font-size:7.5px; color:#b91c1c; font-weight:700;">ปิดการขาย</span>
              </div>
              <div style="font-size:8px; color:#334155; margin-top:4px; line-height:1.2;">
                สถานะสิ้นสุด (Terminal State) ล็อกข้อมูลหลัก ย้ายเข้าประวัติการขาย (Sold History)
              </div>
            </div>
          </div>

          <!-- Transition Flow Graphic -->
          <div style="background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 6px; padding: 5px; font-size: 8px; color: #475569;">
            <strong style="color: #08172e;">วงจรการเปลี่ยนสถานะ (Status Lifecycle):</strong>
            เมื่อเพิ่มนาฬิกา (Add Asset) สามารถเลือกสลับระหว่าง <span class="badge-pill badge-sale" style="font-size:7px;">Sale</span> ⇄ <span class="badge-pill badge-show" style="font-size:7px;">Show</span> ⇄ <span class="badge-pill badge-hide" style="font-size:7px;">Hide</span> ได้ตลอดเวลา และเมื่อขายสำเร็จให้กด <strong>Mark as Sold</strong> เพื่อเปลี่ยนเป็น <span class="badge-pill badge-sold" style="font-size:7px;">Sold</span>
          </div>
        </div>
      </div>

      <!-- Right Column -->
      <div class="right-col">
        <div class="best-practice-card">
          <div style="font-size: 10px; font-weight: 700; color: #b38027; margin-bottom: 3px;">🌟 แนวทางปฏิบัติที่ดี (Best Practices)</div>
          <div style="font-size: 8.5px; color: #334155; line-height: 1.35;">
            <strong>เลือกสถานะให้ตรงจุดประสงค์:</strong>
            หากต้องการขายให้เลือก <span class="badge-pill badge-sale">SALE</span> ทันที แต่หากต้องการเพียงบันทึกของสะสมและไม่ต้องการให้คนทักกวนใจ ให้เลือก <span class="badge-pill badge-hide">HIDE</span>
          </div>
        </div>

        <div class="caution-card">
          <div style="font-size: 10px; font-weight: 700; color: #d97706; margin-bottom: 3px;">⚠️ ข้อควรระวัง (Considerations)</div>
          <div style="font-size: 8.5px; color: #334155; line-height: 1.35;">
            <strong>สถานะ Sold แก้ไขไม่ได้:</strong>
            เมื่อกดยืนยันบันทึกการขาย (Mark as Sold) สินค้าจะถูกล็อกข้อมูลหลักทันที เพื่อเก็บเป็นหลักฐานธุรกรรมที่เชื่อถือได้
          </div>
        </div>

        <div class="card">
          <div class="card-title-row">
            <div class="card-icon-circle card-icon-purple">🛡️</div>
            <div class="card-title">ความปลอดภัยของข้อมูล</div>
          </div>
          <div style="font-size: 8.5px; color: #334155; line-height: 1.35;">
            ข้อมูลต่อไปนี้เป็น <strong>Private Data</strong> เฉพาะเจ้าของและ Admin เท่านั้นที่เห็น:
            <ul class="rule-list" style="margin-top: 3px;">
              <li class="rule-item">ราคาต้นทุนที่ซื้อมา (Purchase Price)</li>
              <li class="rule-item">สลิปการชำระเงินและใบเสร็จ</li>
              <li class="rule-item">ข้อมูลเจ้าของฝากขาย (Consignment)</li>
              <li class="rule-item">มูลค่าพอร์ตทรัพย์สินรวม (Portfolio Value)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <div class="footer-bar">
      <div class="footer-left">
        <span>UNIVERZA TUKDAENG</span> &nbsp;|&nbsp; <span>Mobile Application Official Operation Manual</span>
      </div>
      <div class="footer-center">
        Authentic. Connected. Timeless. | โครงสร้างบทบาทและสถานะสินทรัพย์
      </div>
      <div class="footer-right">
        <span>Version 1.0</span> &nbsp;|&nbsp; <span>04 Oct 2026</span> &nbsp;|&nbsp; <span class="footer-page-num">Page 3</span>
      </div>
    </div>
  </div>

  <!-- ================= PAGE 4: 03 MARKETPLACE FEED & SMART SEARCH ================= -->
  <div class="page">
    <div class="header-bar">
      <div class="header-left">
        <div class="chapter-badge">03</div>
        <div class="header-titles">
          <div class="header-title-en">MARKETPLACE FEED & SMART SEARCH</div>
          <div class="header-title-th">การท่องตลาดและค้นหานาฬิกาหรูอัจฉริยะ</div>
          <div class="header-summary">การสำรวจรายการนาฬิกาหรูที่วางขายในตลาด, องค์ประกอบของการ์ดสินค้า และการค้นหาหลายมิติ</div>
        </div>
      </div>
      <div class="header-right">
        <img src="${appIconUrl}" class="header-logo-icon" alt="Logo">
        <div class="header-brand-text">
          <span class="header-brand-title">UNIVERZA TUKDAENG</span>
          <span class="header-brand-sub">MARKETPLACE & DISCOVERY</span>
        </div>
      </div>
    </div>

    <div class="body-grid">
      <!-- Left Column -->
      <div>
        <div class="card">
          <div class="card-title-row">
            <div class="card-icon-circle card-icon-gold">🏪</div>
            <div class="card-title">แนวคิด (Marketplace Feed)</div>
          </div>
          <div class="card-desc">
            หน้าต่างหลักสำหรับค้นหานาฬิกาที่เปิดขายบนระบบ แสดงเฉพาะนาฬิกาที่มีสถานะ <strong>Sale</strong> เท่านั้น สินค้าสถานะ Show, Hide หรือ Sold จะไม่ปรากฏบน Feed เด็ดขาด
          </div>
        </div>

        <div class="card">
          <div class="card-title-row">
            <div class="card-icon-circle card-icon-blue">🔍</div>
            <div class="card-title">มิติการค้นหา (Filters)</div>
          </div>
          <div class="card-desc">
            รองรับการกรองข้อมูลแบบเจาะจง:
            <ul class="rule-list" style="margin-top: 3px;">
              <li class="rule-item"><strong>Brand:</strong> Rolex, Patek, AP, Omega</li>
              <li class="rule-item"><strong>Model / Series:</strong> Daytona, Submariner</li>
              <li class="rule-item"><strong>Reference No.:</strong> เช่น 126610LN</li>
              <li class="rule-item"><strong>Price Range:</strong> ช่วงราคาต่ำสุด - สูงสุด</li>
              <li class="rule-item"><strong>Condition:</strong> Unworn, Mint, Used</li>
              <li class="rule-item"><strong>Box & Papers:</strong> กล่องใบครบ / เฉพาะตัว</li>
            </ul>
          </div>
        </div>

        <div class="card">
          <div class="card-title-row">
            <div class="card-icon-circle card-icon-red">🚫</div>
            <div class="card-title">กฎข้อห้ามบน Feed</div>
          </div>
          <div class="card-desc">
            <strong>ห้ามคอมเมนต์บนหน้า Feed โดยตรง:</strong> การถามตอบข้อสงสัยต้องแตะเข้าสู่หน้า <strong>Asset Detail</strong> เท่านั้น เพื่อให้บทสนทนาผูกกับสินทรัพย์อย่างเป็นระเบียบ
          </div>
        </div>
      </div>

      <!-- Center Column with REAL Screenshot 1 -->
      <div class="center-col">
        <div class="real-screen-panel">
          <div class="panel-header-row">
            <div class="panel-header-title">
              <span class="panel-tag-real">OFFICIAL APP SCREEN</span>
              <span>ภาพหน้าจอจริง: หน้าฟีดซื้อขายสำหรับคนรักนาฬิกา (App Store)</span>
            </div>
            <div class="panel-header-sub">หน้าแรกเมื่อเปิดแอปพลิเคชันตึกแดง</div>
          </div>

          <div class="real-screen-layout">
            <img src="${realScreenshot1}" class="appstore-phone-img" alt="Official Tuk Daeng Feed">
            <div class="screen-callouts">
              <div class="callout-box">
                <strong>แถบเมนูด้านบน:</strong><br>
                • เมนูข้าง ≡ และโลโก้ <span style="color:#e50914; font-weight:800;">TUK DAENG</span><br>
                • ปุ่ม <strong>Watch Alert</strong> ทางลัดตั้งเตือนตลาด<br>
                • ปุ่ม <strong>+</strong> ทางลัดเพิ่มนาฬิกาลงขาย
              </div>
              <div class="callout-box">
                <strong>การ์ดนาฬิกาบน Feed:</strong><br>
                • รูปถ่ายจริงสไลด์ดูได้หลายมุม •••<br>
                • รุ่น <strong>Rolex Submariner Date</strong><br>
                • รหัส <strong>Ref. 126610LN • Black Dial</strong><br>
                • ราคาขาย <span class="red-accent" style="font-weight:800;">THB 1,250,000</span>
              </div>
              <div class="callout-box">
                <strong>แถบ 5 เมนูด้านล่าง:</strong><br>
                1. <strong>ฟีด</strong> (ตลาดซื้อขายหลัก)<br>
                2. <strong>แชท</strong> (การเจรจาต่อรองราคา)<br>
                3. <strong>กระดานข่าว</strong> (บทความนาฬิกาหรู)<br>
                4. <strong>แจ้งเตือน</strong> (เตือนข้อเสนอ & Alert)<br>
                5. <strong>โปรไฟล์</strong> (คอลเลกชันส่วนบุคคล)
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Column -->
      <div class="right-col">
        <div class="best-practice-card">
          <div style="font-size: 10px; font-weight: 700; color: #b38027; margin-bottom: 3px;">🌟 เคล็ดลับการค้นหา (Search Tips)</div>
          <div style="font-size: 8.5px; color: #334155; line-height: 1.35;">
            <strong>ค้นหาด้วยเลข Reference:</strong>
            พิมพ์ตัวเลขรหัสรุ่น (เช่น 126610LN หรือ 116500LN) ในช่องค้นหา จะช่วยกรองนาฬิการุ่นที่ต้องการได้ตรงเป้าหมายที่สุด ไม่สับสนกับรุ่นอื่น
          </div>
        </div>

        <div class="caution-card">
          <div style="font-size: 10px; font-weight: 700; color: #d97706; margin-bottom: 3px;">⚠️ สิทธิ์ของ Guest บนหน้า Feed</div>
          <div style="font-size: 8.5px; color: #334155; line-height: 1.35;">
            Guest สามารถเลื่อนดูสินค้าและราคาได้อิสระ แต่หากกด <strong>Like, Follow, Comment หรือ Offer</strong> ระบบจะแสดงหน้าต่าง <em>Global Login Required Dialog</em> ให้เข้าสู่ระบบก่อน
          </div>
        </div>

        <div class="card">
          <div class="card-title-row">
            <div class="card-icon-circle card-icon-gold">🔗</div>
            <div class="card-title">การแชร์สินค้า (Deep Link)</div>
          </div>
          <div style="font-size: 8.5px; color: #334155; line-height: 1.35;">
            สามารถกดปุ่ม Share เพื่อส่งลิงก์ของนาฬิกาไปยังแอปภายนอก (เช่น LINE, Facebook) ผู้รับสามารถกดเปิดเข้ามาดูหน้ารายละเอียดได้โดยตรง
          </div>
        </div>
      </div>
    </div>

    <div class="footer-bar">
      <div class="footer-left">
        <span>UNIVERZA TUKDAENG</span> &nbsp;|&nbsp; <span>Mobile Application Official Operation Manual</span>
      </div>
      <div class="footer-center">
        Authentic. Connected. Timeless. | การท่องตลาดและค้นหานาฬิกาหรู
      </div>
      <div class="footer-right">
        <span>Version 1.0</span> &nbsp;|&nbsp; <span>04 Oct 2026</span> &nbsp;|&nbsp; <span class="footer-page-num">Page 4</span>
      </div>
    </div>
  </div>

  <!-- ================= PAGE 5: 04 ASSET DETAIL & VERIFICATION ================= -->
  <div class="page">
    <div class="header-bar">
      <div class="header-left">
        <div class="chapter-badge">04</div>
        <div class="header-titles">
          <div class="header-title-en">ASSET DETAIL & VERIFICATION</div>
          <div class="header-title-th">การเจาะลึกข้อมูลและตรวจเช็กนาฬิกา</div>
          <div class="header-summary">การตรวจสอบข้อมูลนาฬิกาเชิงลึก แกลเลอรีภาพ อุปกรณ์กล่องใบ และระบบติดต่อผู้ขาย</div>
        </div>
      </div>
      <div class="header-right">
        <img src="${appIconUrl}" class="header-logo-icon" alt="Logo">
        <div class="header-brand-text">
          <span class="header-brand-title">UNIVERZA TUKDAENG</span>
          <span class="header-brand-sub">WATCH VERIFICATION & DETAILS</span>
        </div>
      </div>
    </div>

    <div class="body-grid">
      <!-- Left Column -->
      <div>
        <div class="card">
          <div class="card-title-row">
            <div class="card-icon-circle card-icon-gold">🔎</div>
            <div class="card-title">แนวคิด (Asset Detail)</div>
          </div>
          <div class="card-desc">
            หน้ารายละเอียดเชิงลึก ทำหน้าที่เป็น <strong>Digital Passport</strong> ของนาฬิกาแต่ละเรือน รวบรวมข้อมูลสเปก รูปถ่ายความละเอียดสูง และประวัติเพื่อความโปร่งใสสูงสุด
          </div>
        </div>

        <div class="card">
          <div class="card-title-row">
            <div class="card-icon-circle card-icon-blue">📸</div>
            <div class="card-title">แกลเลอรีสูงสุด 10 รูป</div>
          </div>
          <div class="card-desc">
            รองรับการซูมแบบเต็มจอ (Full Screen Image Viewer):
            <ul class="rule-list" style="margin-top: 3px;">
              <li class="rule-item">หน้าปัดตรง (Dial & Hands)</li>
              <li class="rule-item">ด้านข้างตัวเรือนและเม็ดมะยม</li>
              <li class="rule-item">ฝาหลัง (Caseback)</li>
              <li class="rule-item">สายและบานพับ (Clasp & Buckle)</li>
              <li class="rule-item">ภาพกล่องและใบรับประกันจริง</li>
            </ul>
          </div>
        </div>

        <div class="card">
          <div class="card-title-row">
            <div class="card-icon-circle card-icon-purple">💬</div>
            <div class="card-title">ระบบคอมเมนต์สาธารณะ</div>
          </div>
          <div class="card-desc">
            เปิดให้สมาชิกคอมเมนต์สอบถามข้อมูลต่อสาธารณะ รองรับ <strong>1-Level Threaded Reply</strong> เพื่อให้ผู้ซื้อรายอื่นเห็นคำชี้แจงร่วมกัน
          </div>
        </div>
      </div>

      <!-- Center Column with REAL Screenshot 2 -->
      <div class="center-col">
        <div class="real-screen-panel">
          <div class="panel-header-row">
            <div class="panel-header-title">
              <span class="panel-tag-real">OFFICIAL APP SCREEN</span>
              <span>ภาพหน้าจอจริง: หน้ารายละเอียดสินค้า (Asset Detail Viewer)</span>
            </div>
            <div class="panel-header-sub">หน้าตรวจสอบรายละเอียดก่อนตัดสินใจยื่นข้อเสนอซื้อ</div>
          </div>

          <div class="real-screen-layout">
            <img src="${realScreenshot2}" class="appstore-phone-img" alt="Official Asset Detail">
            <div class="screen-callouts">
              <div class="callout-box">
                <strong>หัวเรื่องและแกลเลอรี:</strong><br>
                • ปุ่มย้อนกลับ ← และแชร์สินค้า<br>
                • แกลเลอรีภาพถ่ายจริง <strong>1 / 3</strong> มุมมอง<br>
                • รูป Thumbnails ย่อยด้านล่างภาพหลัก
              </div>
              <div class="callout-box">
                <strong>ข้อมูลสินค้าและราคา:</strong><br>
                • ป้ายสถานะสีแดง <span class="badge-pill badge-sale">SALE</span> ชัดเจน<br>
                • ชื่อรุ่น <strong>Rolex Submariner Date</strong><br>
                • รหัส <strong>Ref. 126610LN</strong><br>
                • ราคาขาย <span class="red-accent" style="font-weight:800;">฿ 1,250,000</span>
              </div>
              <div class="callout-box">
                <strong>ผู้ขาย & การดำเนินการ:</strong><br>
                • ผู้ลงขาย: <strong>James Watchsmith</strong> (Collector)<br>
                • ปุ่ม <strong>Follow</strong> สีแดงติดตามผู้ขาย<br>
                • ปุ่ม <strong>เสนอราคา</strong> (Make Offer)<br>
                • ปุ่มแดง <strong>ติดต่อผู้ขาย</strong> (Direct Chat)
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Column -->
      <div class="right-col">
        <div class="best-practice-card">
          <div style="font-size: 10px; font-weight: 700; color: #b38027; margin-bottom: 3px;">🔍 5 จุดตรวจเช็กก่อนซื้อ (Checklist)</div>
          <div style="font-size: 8px; color: #334155; line-height: 1.35;">
            <ul class="rule-list">
              <li class="rule-item"><strong>Serial Number:</strong> ตรวจว่าเลขที่ขอบในตรงกับการ์ด</li>
              <li class="rule-item"><strong>เข็มและหลักเวลา:</strong> ปราศจากคราบสนิมหรือรอยสัมผัส</li>
              <li class="rule-item"><strong>มุมเหลี่ยมขาตัวเรือน:</strong> ไม่ถูกขัดปัดจนเสียทรง</li>
              <li class="rule-item"><strong>ความตึงของสาย:</strong> บานพับแน่น ไม่หย่อนยาน</li>
              <li class="rule-item"><strong>นัดตรวจเช็ก:</strong> นัดตรวจ Expert Verification ก่อนจ่าย</li>
            </ul>
          </div>
        </div>

        <div class="caution-card">
          <div style="font-size: 10px; font-weight: 700; color: #d97706; margin-bottom: 3px;">🚩 การรายงานโพสต์ (Report Asset)</div>
          <div style="font-size: 8.5px; color: #334155; line-height: 1.35;">
            หากพบภาพถ่ายที่ไม่ตรงกับความเป็นจริง หรือสงสัยว่าเป็นนาฬิกาปลอม สามารถกดปุ่ม <strong>แชร์ / รายงาน (Report)</strong> ทีมงาน Admin จะเข้าตรวจสอบภายใน 24 ชม.
          </div>
        </div>

        <div class="card">
          <div class="card-title-row">
            <div class="card-icon-circle card-icon-blue">🛡️</div>
            <div class="card-title">ความปลอดภัยของ Serial</div>
          </div>
          <div style="font-size: 8.5px; color: #334155; line-height: 1.35;">
            ระบบตึกแดงมีฟังก์ชันปกปิดเลข Serial บางส่วนบนภาพสาธารณะ เพื่อป้องกันมิจฉาชีพนำเลขไปแอบอ้างทำเอกสารปลอม
          </div>
        </div>
      </div>
    </div>

    <div class="footer-bar">
      <div class="footer-left">
        <span>UNIVERZA TUKDAENG</span> &nbsp;|&nbsp; <span>Mobile Application Official Operation Manual</span>
      </div>
      <div class="footer-center">
        Authentic. Connected. Timeless. | รายละเอียดนาฬิกาและการตรวจสอบประวัติ
      </div>
      <div class="footer-right">
        <span>Version 1.0</span> &nbsp;|&nbsp; <span>04 Oct 2026</span> &nbsp;|&nbsp; <span class="footer-page-num">Page 5</span>
      </div>
    </div>
  </div>

  <!-- ================= PAGE 6: 05 MAKE OFFER & PRIVATE NEGOTIATION ================= -->
  <div class="page">
    <div class="header-bar">
      <div class="header-left">
        <div class="chapter-badge">05</div>
        <div class="header-titles">
          <div class="header-title-en">MAKE OFFER & PRIVATE NEGOTIATION</div>
          <div class="header-title-th">ระบบยื่นข้อเสนอและการเจรจาต่อรอง</div>
          <div class="header-summary">ขั้นตอนการยื่นข้อเสนอราคาซื้อ วงจรชีวิตของ Offer และการพูดคุยปิดการขายผ่านห้องแชท</div>
        </div>
      </div>
      <div class="header-right">
        <img src="${appIconUrl}" class="header-logo-icon" alt="Logo">
        <div class="header-brand-text">
          <span class="header-brand-title">UNIVERZA TUKDAENG</span>
          <span class="header-brand-sub">OFFER & TRANSACTION SYSTEM</span>
        </div>
      </div>
    </div>

    <div class="body-grid">
      <!-- Left Column -->
      <div>
        <div class="card">
          <div class="card-title-row">
            <div class="card-icon-circle card-icon-gold">🤝</div>
            <div class="card-title">แนวคิด (Make Offer System)</div>
          </div>
          <div class="card-desc">
            ระบบยื่นข้อเสนอราคาช่วยให้การเจรจาต่อรองระหว่างผู้ซื้อและผู้ขายเป็นไปอย่าง <strong>เป็นระเบียบ โปร่งใส และมีหลักฐานชัดเจน</strong> ไม่เกิดปัญหาข้อตกลงซ้อนทับกัน
          </div>
        </div>

        <div class="card">
          <div class="card-title-row">
            <div class="card-icon-circle card-icon-blue">📍</div>
            <div class="card-title">จุดยื่นข้อเสนอ (Entry Point)</div>
          </div>
          <div class="card-desc">
            การสร้าง Offer <strong>ทำผ่านปุ่ม 'เสนอราคา' บนหน้า Asset Detail เท่านั้น</strong> ไม่สามารถสร้าง Offer จาก Feed หรือพิมพ์เลขลอยๆ ในห้องแชท เพื่อผูกกับนาฬิกาจริงเสมอ
          </div>
        </div>

        <div class="card">
          <div class="card-title-row">
            <div class="card-icon-circle card-icon-purple">🔄</div>
            <div class="card-title">แท็บ 'ข้อเสนอที่ได้รับ'</div>
          </div>
          <div class="card-desc">
            ในหน้าแชทจะมีแท็บแยก <strong>ทั้งหมด</strong> และ <strong>ข้อเสนอที่ได้รับ</strong> เพื่อให้ผู้ขายตรวจสอบและกดตอบรับ (Accept) หรือปฏิเสธ (Decline) ได้ทันใจ
          </div>
        </div>
      </div>

      <!-- Center Column with REAL Screenshot 5 -->
      <div class="center-col">
        <div class="real-screen-panel">
          <div class="panel-header-row">
            <div class="panel-header-title">
              <span class="panel-tag-real">OFFICIAL APP SCREEN</span>
              <span>ภาพหน้าจอจริง: หน้าห้องแชทต่อรองราคา (Chat & Offers)</span>
            </div>
            <div class="panel-header-sub">ระบบติดตามสถานะข้อเสนอและกล่องข้อความจากผู้ซื้อแต่ละราย</div>
          </div>

          <div class="real-screen-layout">
            <img src="${realScreenshot5}" class="appstore-phone-img" alt="Official Chat Screen">
            <div class="screen-callouts">
              <div class="callout-box">
                <strong>แท็บคัดกรองข้อความ:</strong><br>
                • แท็บสีแดง <span class="red-accent" style="font-weight:700;">ทั้งหมด</span> (สนทนาทั่วไป)<br>
                • แท็บ <strong>ข้อเสนอที่ได้รับ</strong> (เฉพาะผู้ที่ยื่นเสนอราคา)
              </div>
              <div class="callout-box">
                <strong>รายการแชทเจรจาต่อรอง:</strong><br>
                • แสดงรูปนาฬิกาที่กำลังเจรจาอยู่ขวามือ<br>
                • ข้อความตัวอย่าง <em>"420k sounds fair, but can you include additional benefits?"</em><br>
                • ตัวเลขแจ้งเตือนข้อความใหม่สีแดง <span class="badge-pill badge-sale">1</span>
              </div>
              <div class="callout-box">
                <strong>ความปลอดภัยในการซื้อขาย:</strong><br>
                • พูดคุยผ่านระบบแชทที่มีการบันทึก Log<br>
                • มีหลักฐานข้อตกลงราคาป้องกันการบิดพลิ้ว<br>
                • สามารถกด Report ผู้ใช้งานได้หากพบพฤติกรรมมิชอบ
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Column -->
      <div class="right-col">
        <div class="best-practice-card">
          <div style="font-size: 10px; font-weight: 700; color: #b38027; margin-bottom: 3px;">🌟 มารยาทการเจรจา (Offer Ethics)</div>
          <div style="font-size: 8.5px; color: #334155; line-height: 1.35;">
            <strong>ยื่นราคาที่สมเหตุสมผล:</strong> ไม่แนะนำให้ต่อรองราคาต่ำกว่าราคาตลาดมากเกินควร (Lowball) และเมื่อผู้ขายกดยอมรับ (Accept) ควรนัดหมายตามข้อตกลงโดยเร็ว
          </div>
        </div>

        <div class="caution-card">
          <div style="font-size: 10px; font-weight: 700; color: #d97706; margin-bottom: 3px;">⚡ กฎการปิดการขาย (Auto-Reject)</div>
          <div style="font-size: 8.5px; color: #334155; line-height: 1.35;">
            เมื่อเจ้าของกด <strong>Mark as Sold</strong> ให้แก่ผู้ซื้อรายหนึ่ง ข้อเสนอของสมาชิกรักษาที่ค้างอยู่ (Pending) ทั้งหมดจะถูกยกเลิกอัตโนมัติ (Rejected)
          </div>
        </div>

        <div class="card">
          <div class="card-title-row">
            <div class="card-icon-circle card-icon-green">🔔</div>
            <div class="card-title">ปลายทางแจ้งเตือน Offer</div>
          </div>
          <div style="font-size: 8px; color: #334155; line-height: 1.35;">
            <ul class="rule-list">
              <li class="rule-item"><strong>New Offer:</strong> เปิดเข้า Chat Room เพื่อดูการ์ด</li>
              <li class="rule-item"><strong>Offer Accepted:</strong> เปิดเข้า Chat เตรียมนัดหมาย</li>
              <li class="rule-item"><strong>Offer Rejected:</strong> เปิดกลับหน้า Asset Detail</li>
              <li class="rule-item"><strong>Asset Deleted:</strong> ปรับเป็น Cancelled ทันที</li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <div class="footer-bar">
      <div class="footer-left">
        <span>UNIVERZA TUKDAENG</span> &nbsp;|&nbsp; <span>Mobile Application Official Operation Manual</span>
      </div>
      <div class="footer-center">
        Authentic. Connected. Timeless. | การยื่นข้อเสนอและการเจรจาต่อรอง
      </div>
      <div class="footer-right">
        <span>Version 1.0</span> &nbsp;|&nbsp; <span>04 Oct 2026</span> &nbsp;|&nbsp; <span class="footer-page-num">Page 6</span>
      </div>
    </div>
  </div>

  <!-- ================= PAGE 7: 06 ASSET REGISTRATION / ADD ASSET ================= -->
  <div class="page">
    <div class="header-bar">
      <div class="header-left">
        <div class="chapter-badge">06</div>
        <div class="header-titles">
          <div class="header-title-en">ASSET REGISTRATION & LIFECYCLE</div>
          <div class="header-title-th">การลงทะเบียนนาฬิกาเข้าสู่ระบบ</div>
          <div class="header-summary">ขั้นตอนการเพิ่มนาฬิกาเข้าสู่ระบบ การเลือกสถานะ การจัดการสินค้าฝากขาย และการบันทึกปิดการขาย (Mark as Sold)</div>
        </div>
      </div>
      <div class="header-right">
        <img src="${appIconUrl}" class="header-logo-icon" alt="Logo">
        <div class="header-brand-text">
          <span class="header-brand-title">UNIVERZA TUKDAENG</span>
          <span class="header-brand-sub">PORTFOLIO & ASSET REGISTRY</span>
        </div>
      </div>
    </div>

    <div class="body-grid">
      <!-- Left Column -->
      <div>
        <div class="card">
          <div class="card-title-row">
            <div class="card-icon-circle card-icon-gold">➕</div>
            <div class="card-title">แนวคิด (Add Asset)</div>
          </div>
          <div class="card-desc">
            ระบบช่วยให้นักสะสมบันทึกนาฬิกาทุกเรือนเข้าสู่ <strong>Digital Vault</strong> ส่วนตัว โดยเลือกได้ว่าจะนำขึ้นขาย (Sale), โชว์ผลงาน (Show) หรือจัดเก็บเงียบๆ (Hide)
          </div>
        </div>

        <div class="card">
          <div class="card-title-row">
            <div class="card-icon-circle card-icon-blue">🤝</div>
            <div class="card-title">ฝากขาย (Consignment)</div>
          </div>
          <div class="card-desc">
            หากนาฬิกาเป็นของฝากขาย สามารถระบุข้อมูลเจ้าของเดิมและส่วนแบ่งได้ โดย <strong>Consignment จะไม่ถูกนับในพอร์ตทรัพย์สิน</strong> เพราะไม่ใช่กรรมสิทธิ์ของตนเอง
          </div>
        </div>

        <div class="card">
          <div class="card-title-row">
            <div class="card-icon-circle card-icon-purple">🔒</div>
            <div class="card-title">ประวัติการซื้อ (Private)</div>
          </div>
          <div class="card-desc">
            ราคาต้นทุนที่ซื้อมา (Purchase Price) และสลิปหลักฐานจะถูกเก็บเป็นความลับ 100% เพื่อใช้คำนวณกำไร/ขาดทุน (Gain/Loss) เฉพาะในพอร์ตของตนเองเท่านั้น
          </div>
        </div>
      </div>

      <!-- Center Column with REAL Screenshot 3 -->
      <div class="center-col">
        <div class="real-screen-panel">
          <div class="panel-header-row">
            <div class="panel-header-title">
              <span class="panel-tag-real">OFFICIAL APP SCREEN</span>
              <span>ภาพหน้าจอจริง: หน้าเพิ่มสินทรัพย์ใหม่ (Add Asset)</span>
            </div>
            <div class="panel-header-sub">ขั้นตอนการกรอกข้อมูลและอัปโหลดภาพถ่ายนาฬิกาจริง</div>
          </div>

          <div class="real-screen-layout">
            <img src="${realScreenshot3}" class="appstore-phone-img" alt="Official Add Asset Screen">
            <div class="screen-callouts">
              <div class="callout-box">
                <strong>หัวข้อหน้าจอ:</strong><br>
                • แถบด้านบน: <strong>เพิ่มสินทรัพย์ใหม่</strong><br>
                • ปุ่ม <strong>ถัดไป</strong> สีแดง เพื่อดำเนินการต่อ
              </div>
              <div class="callout-box">
                <strong>แกลเลอรี่ภาพถ่าย (Gallery):</strong><br>
                • โควตาอัปโหลดรูป <strong>0 / 10</strong> รูป<br>
                • ปุ่ม <strong>เพิ่มรูปภาพ</strong> จากกล้องหรืออัลบั้มภาพ
              </div>
              <div class="callout-box">
                <strong>ข้อมูลพื้นฐานที่ต้องระบุ:</strong><br>
                • <strong>ชื่อแบรนด์</strong> (เลือกจากดรอปดาวน์)<br>
                • <strong>รุ่น & ซีรีส์</strong> (Model & Series)<br>
                • <strong>หมายเลขการอ้างอิง</strong> (Reference No.)<br>
                • <strong>ปีที่ผลิต</strong> (Production Year)<br>
                • <strong>สภาพนาฬิกา</strong> (Condition Rating)
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Column -->
      <div class="right-col">
        <div class="best-practice-card">
          <div style="font-size: 10px; font-weight: 700; color: #b38027; margin-bottom: 3px;">📸 เทคนิคถ่ายภาพนาฬิกา (Photos)</div>
          <div style="font-size: 8px; color: #334155; line-height: 1.35;">
            <ul class="rule-list">
              <li class="rule-item"><strong>ปรับเวลา 10:10:</strong> ช่วยให้เห็นโลโก้และหน้าปัดชัดเจน</li>
              <li class="rule-item"><strong>ถ่ายแสงธรรมชาติ:</strong> เลี่ยงแสงแฟลชสะท้อนกระจก</li>
              <li class="rule-item"><strong>ภาพตำหนิจริง:</strong> ระบุรอยขนแมวตามจริงเพื่อความน่าเชื่อถือ</li>
              <li class="rule-item"><strong>กล่องใบครบชุด:</strong> กางการ์ดรับประกันให้เห็นปี</li>
            </ul>
          </div>
        </div>

        <div class="caution-card">
          <div style="font-size: 10px; font-weight: 700; color: #d97706; margin-bottom: 3px;">⚠️ ผลกระทบเมื่อ Mark as Sold</div>
          <div style="font-size: 8px; color: #334155; line-height: 1.35;">
            เมื่อนาฬิกาเปลี่ยนเป็น <strong>Sold</strong>:<br>
            • หายจากหน้า Feed และ Search ทันที<br>
            • Offer อื่นที่ค้างอยู่จะถูกยกเลิกอัตโนมัติ<br>
            • ห้องแชทเดิมยังคงอยู่เพื่อดูประวัติได้
          </div>
        </div>

        <div class="card">
          <div class="card-title-row">
            <div class="card-icon-circle card-icon-green">📊</div>
            <div class="card-title">ประวัติการขาย (Sold History)</div>
          </div>
          <div style="font-size: 8.5px; color: #334155; line-height: 1.35;">
            รายการที่ขายแล้วจะถูกเก็บเข้า <strong>Sold History</strong> โดยคำนวณกำไรจริง (Realized Gain = ราคาขาย - ราคาซื้อ) เพื่อสรุปสถิติความมั่งคั่งให้นักสะสม
          </div>
        </div>
      </div>
    </div>

    <div class="footer-bar">
      <div class="footer-left">
        <span>UNIVERZA TUKDAENG</span> &nbsp;|&nbsp; <span>Mobile Application Official Operation Manual</span>
      </div>
      <div class="footer-center">
        Authentic. Connected. Timeless. | การลงทะเบียนนาฬิกาและการจัดการวงจรชีวิต
      </div>
      <div class="footer-right">
        <span>Version 1.0</span> &nbsp;|&nbsp; <span>04 Oct 2026</span> &nbsp;|&nbsp; <span class="footer-page-num">Page 7</span>
      </div>
    </div>
  </div>

  <!-- ================= PAGE 8: 07 COLLECTOR PROFILE & PORTFOLIO ================= -->
  <div class="page">
    <div class="header-bar">
      <div class="header-left">
        <div class="chapter-badge">07</div>
        <div class="header-titles">
          <div class="header-title-en">COLLECTOR PROFILE & PORTFOLIO</div>
          <div class="header-title-th">การบริหารโปรไฟล์และคอลเลกชันส่วนบุคคล</div>
          <div class="header-summary">การแสดงโปรไฟล์ผู้ขาย คอลเลกชันที่เปิดขาย (For Sale) คอลเลกชันที่โชว์ (Collection Show) และพอร์ตทรัพย์สิน</div>
        </div>
      </div>
      <div class="header-right">
        <img src="${appIconUrl}" class="header-logo-icon" alt="Logo">
        <div class="header-brand-text">
          <span class="header-brand-title">UNIVERZA TUKDAENG</span>
          <span class="header-brand-sub">PROFILE & REPUTATION SYSTEM</span>
        </div>
      </div>
    </div>

    <div class="body-grid">
      <!-- Left Column -->
      <div>
        <div class="card">
          <div class="card-title-row">
            <div class="card-icon-circle card-icon-gold">👤</div>
            <div class="card-title">แนวคิด (Collector Profile)</div>
          </div>
          <div class="card-desc">
            โปรไฟล์เป็นหน้าต่างสะท้อนความน่าเชื่อถือของนักสะสม รวบรวมนาฬิกาที่เปิดขาย ประวัติการสะสม และเปิดโอกาสให้ผู้ใช้อื่นกด Follow ติดตาม
          </div>
        </div>

        <div class="card">
          <div class="card-title-row">
            <div class="card-icon-circle card-icon-blue">📑</div>
            <div class="card-title">แท็บ For Sale vs Show</div>
          </div>
          <div class="card-desc">
            แยกหมวดหมู่ชัดเจน:
            <ul class="rule-list" style="margin-top: 3px;">
              <li class="rule-item"><strong>For Sale:</strong> สินค้าที่ตั้งราคาเปิดขาย พร้อมให้กด Make Offer หรือ Direct Chat</li>
              <li class="rule-item"><strong>Collection Show:</strong> นาฬิกาในคอลเลกชันส่วนตัว นำมาโชว์เพื่อสร้างชื่อเสียง แต่เปิดรับข้อเสนอพิเศษได้</li>
            </ul>
          </div>
        </div>

        <div class="card">
          <div class="card-title-row">
            <div class="card-icon-circle card-icon-purple">💎</div>
            <div class="card-title">พอร์ตทรัพย์สิน (Portfolio)</div>
          </div>
          <div class="card-desc">
            ในมุมมองของเจ้าของ (Owner View) จะมีแดชบอร์ดสรุปมูลค่ารวม (Total Portfolio Value) อัตรากำไร Unrealized Gain และสัดส่วนแบรนด์ในครอบครอง
          </div>
        </div>
      </div>

      <!-- Center Column with REAL Screenshot 4 -->
      <div class="center-col">
        <div class="real-screen-panel">
          <div class="panel-header-row">
            <div class="panel-header-title">
              <span class="panel-tag-real">OFFICIAL APP SCREEN</span>
              <span>ภาพหน้าจอจริง: หน้าโปรไฟล์ผู้ขาย (James Watchsmith)</span>
            </div>
            <div class="panel-header-sub">หน้าแสดงรายการสินค้าที่ลงขายและข้อมูลผู้ขายสาธารณะ</div>
          </div>

          <div class="real-screen-layout">
            <img src="${realScreenshot4}" class="appstore-phone-img" alt="Official Profile Screen">
            <div class="screen-callouts">
              <div class="callout-box">
                <strong>ข้อมูลโปรไฟล์ผู้ขาย:</strong><br>
                • รูปโปรไฟล์และชื่อ <strong>James Watchsmith</strong><br>
                • ยอด <strong>0 ผู้ติดตาม</strong> | <strong>0 กำลังติดตาม</strong><br>
                • ปุ่ม <span class="red-accent" style="font-weight:800;">Follow</span> สีแดง สำหรับผู้สนใจ
              </div>
              <div class="callout-box">
                <strong>การแบ่งแท็บสินค้า:</strong><br>
                • แท็บ <strong>For Sale (8)</strong> นาฬิกาที่เปิดขาย<br>
                • แท็บ <strong>Collection Show (4)</strong> โชว์ของสะสม
              </div>
              <div class="callout-box">
                <strong>กริดสินค้าที่วางขาย:</strong><br>
                • <strong>Patek Philippe Nautilus 5711/1A</strong> ฿1,200,000<br>
                • <strong>Rolex Submariner Date</strong> ฿485,000<br>
                • <strong>Casio G-Shock Mudmaster</strong> ฿12,900<br>
                • <strong>Vintage Wooden Chair</strong> ฿3,600
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Column -->
      <div class="right-col">
        <div class="best-practice-card">
          <div style="font-size: 10px; font-weight: 700; color: #b38027; margin-bottom: 3px;">🌟 กลยุทธ์การจัดคอลเลกชัน</div>
          <div style="font-size: 8.5px; color: #334155; line-height: 1.35;">
            <strong>ใช้ Collection Show เพื่อสร้างโอกาส:</strong>
            แม้นาฬิกาบางเรือนยังไม่พร้อมปล่อย แต่การนำมาโชว์ใน Collection Show จะช่วยดึงดูดนักสะสมระดับท็อปเข้ามาทักทายและยื่นข้อเสนอที่น่าสนใจ
          </div>
        </div>

        <div class="caution-card">
          <div style="font-size: 10px; font-weight: 700; color: #d97706; margin-bottom: 3px;">🛡️ ข้อมูลส่วนบุคคลบนโปรไฟล์</div>
          <div style="font-size: 8.5px; color: #334155; line-height: 1.35;">
            ระบบจะไม่เปิดเผยเบอร์โทรศัพท์หรือที่อยู่บนโปรไฟล์สาธารณะ การติดต่อทั้งหมดกระทำผ่านห้องแชทของระบบ เพื่อความปลอดภัยสูงสุดของสมาชิก
          </div>
        </div>

        <div class="card">
          <div class="card-title-row">
            <div class="card-icon-circle card-icon-gold">🏆</div>
            <div class="card-title">ความน่าเชื่อถือ (Verified)</div>
          </div>
          <div style="font-size: 8.5px; color: #334155; line-height: 1.35;">
            สมาชิกที่มีประวัติการซื้อขายสำเร็จและไม่เคยถูกร้องเรียน จะได้รับสถานะความน่าเชื่อถือ ช่วยเพิ่มโอกาสในการปิดการขายได้รวดเร็วยิ่งขึ้น
          </div>
        </div>
      </div>
    </div>

    <div class="footer-bar">
      <div class="footer-left">
        <span>UNIVERZA TUKDAENG</span> &nbsp;|&nbsp; <span>Mobile Application Official Operation Manual</span>
      </div>
      <div class="footer-center">
        Authentic. Connected. Timeless. | การบริหารโปรไฟล์และคอลเลกชัน
      </div>
      <div class="footer-right">
        <span>Version 1.0</span> &nbsp;|&nbsp; <span>04 Oct 2026</span> &nbsp;|&nbsp; <span class="footer-page-num">Page 8</span>
      </div>
    </div>
  </div>

  <!-- ================= PAGE 9: 08 WATCH ALERT & MARKET DEMAND ================= -->
  <div class="page">
    <div class="header-bar">
      <div class="header-left">
        <div class="chapter-badge">08</div>
        <div class="header-titles">
          <div class="header-title-en">WATCH ALERT & MARKET DEMAND</div>
          <div class="header-title-th">การตั้งเตือนตลาดและการค้นหาอัจฉริยะ</div>
          <div class="header-summary">ระบบจับคู่ความต้องการซื้อแบบอัตโนมัติ การแจ้งเตือนทันทีเมื่อมีของใหม่ และการวิเคราะห์แนวโน้มตลาด</div>
        </div>
      </div>
      <div class="header-right">
        <img src="${appIconUrl}" class="header-logo-icon" alt="Logo">
        <div class="header-brand-text">
          <span class="header-brand-title">UNIVERZA TUKDAENG</span>
          <span class="header-brand-sub">MARKET DEMAND & ALERTS</span>
        </div>
      </div>
    </div>

    <div class="body-grid">
      <!-- Left Column -->
      <div>
        <div class="card">
          <div class="card-title-row">
            <div class="card-icon-circle card-icon-gold">⏰</div>
            <div class="card-title">แนวคิด (Watch Alert)</div>
          </div>
          <div class="card-desc">
            ฟีเจอร์สำหรับนักล่านาฬิการุ่นหายาก ผู้ใช้สามารถ <strong>ตั้งเกณฑ์นาฬิกาที่ต้องการ</strong> เมื่อมีผู้ลงขายตรงตามสเปก ระบบจะ Push Notification แจ้งเตือนทันที
          </div>
        </div>

        <div class="card">
          <div class="card-title-row">
            <div class="card-icon-circle card-icon-blue">🎯</div>
            <div class="card-title">เกณฑ์การตั้งเตือน (Criteria)</div>
          </div>
          <div class="card-desc">
            กำหนดได้ละเอียดครบถ้วน:
            <ul class="rule-list" style="margin-top: 3px;">
              <li class="rule-item"><strong>Brand:</strong> เช่น Rolex, Patek Philippe</li>
              <li class="rule-item"><strong>Model / Series:</strong> เช่น Daytona 116500LN</li>
              <li class="rule-item"><strong>Max Price:</strong> เพดานราคาสูงสุดที่รับได้</li>
              <li class="rule-item"><strong>Scope:</strong> เฉพาะ Full Set หรือรับเฉพาะตัวเรือน</li>
            </ul>
          </div>
        </div>

        <div class="card">
          <div class="card-title-row">
            <div class="card-icon-circle card-icon-purple">🔔</div>
            <div class="card-title">ช่องทางการแจ้งเตือน</div>
          </div>
          <div class="card-desc">
            แจ้งเตือนผ่าน <strong>Mobile Push Notification</strong> ไปยังสมาร์ตโฟน และบันทึกประวัติไว้ในแท็บ <strong>แจ้งเตือน (Notifications)</strong> เพื่อเปิดดูได้ตลอดเวลา
          </div>
        </div>
      </div>

      <!-- Center Column -->
      <div class="center-col">
        <!-- 4-Step Watch Alert Cycle -->
        <div class="workflow-strip" style="grid-template-columns: repeat(4, 1fr);">
          <div class="workflow-step">
            <div class="step-badge">1</div>
            <div class="step-title">ตั้งเงื่อนไข Alert</div>
            <div class="step-desc">ระบุรุ่นและงบประมาณสูงสุด</div>
          </div>
          <div class="workflow-step">
            <div class="step-badge">2</div>
            <div class="step-title">ระบบเฝ้าจับคู่</div>
            <div class="step-desc">ระบบคอยตรวจจับนาฬิกาเข้าใหม่ 24 ชม.</div>
          </div>
          <div class="workflow-step">
            <div class="step-badge">3</div>
            <div class="step-title">แจ้งเตือนทันที</div>
            <div class="step-desc">Push Notification เด้งเตือนใน 1 นาที</div>
          </div>
          <div class="workflow-step">
            <div class="step-badge">4</div>
            <div class="step-title">กดดู & ยื่นซื้อ</div>
            <div class="step-desc">เข้าสู่ Asset Detail และยื่น Offer</div>
          </div>
        </div>

        <!-- Watch Alert Showcase Card -->
        <div class="card" style="background: #ffffff; border: 1px solid #cbd5e1; flex: 1; display: flex; flex-direction: column; justify-content: space-around;">
          <div style="font-size: 10px; font-weight: 700; color: #08172e; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px;">
            ตัวอย่างรายการ Watch Alert ที่นักสะสมนิยมตั้งไว้มากที่สุดในระบบ
          </div>

          <div style="display: flex; gap: 8px;">
            <!-- Alert Card 1 -->
            <div style="flex: 1; background: #f8fafc; border: 1.5px solid #c5a059; border-radius: 8px; padding: 8px;">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="font-size: 8px; font-weight: 800; color: #b38027; background: #fef3c7; padding: 2px 6px; border-radius: 4px;">ACTIVE ALERT</span>
                <span style="font-size: 7.5px; color: #64748b;">จับคู่แล้ว 3 เรือน</span>
              </div>
              <div style="font-size: 11px; font-weight: 800; color: #08172e; margin-top: 4px;">Rolex Daytona Black Dial</div>
              <div style="font-size: 8px; color: #475569; margin-top: 2px;">Ref. 116500LN • Full Set</div>
              <div style="font-size: 9px; font-weight: 700; color: #059669; margin-top: 4px;">งบสูงสุด: ฿ 950,000</div>
              <div style="font-size: 7.5px; color: #64748b; margin-top: 4px; border-top: 1px dashed #cbd5e1; padding-top: 4px;">
                🔔 Push Notification: เปิดใช้งาน (ความถี่: ทันที)
              </div>
            </div>

            <!-- Alert Card 2 -->
            <div style="flex: 1; background: #f8fafc; border: 1.5px solid #0284c7; border-radius: 8px; padding: 8px;">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="font-size: 8px; font-weight: 800; color: #0284c7; background: #e0f2fe; padding: 2px 6px; border-radius: 4px;">ACTIVE ALERT</span>
                <span style="font-size: 7.5px; color: #64748b;">จับคู่แล้ว 1 เรือน</span>
              </div>
              <div style="font-size: 11px; font-weight: 800; color: #08172e; margin-top: 4px;">Patek Philippe Aquanaut</div>
              <div style="font-size: 8px; color: #475569; margin-top: 2px;">Ref. 5167A-001 • สายยางดำ</div>
              <div style="font-size: 9px; font-weight: 700; color: #059669; margin-top: 4px;">งบสูงสุด: ฿ 1,850,000</div>
              <div style="font-size: 7.5px; color: #64748b; margin-top: 4px; border-top: 1px dashed #cbd5e1; padding-top: 4px;">
                🔔 Push Notification: เปิดใช้งาน (ความถี่: ทันที)
              </div>
            </div>
          </div>

          <div style="background: #f1f5f9; border-radius: 6px; padding: 6px; font-size: 8px; color: #475569; display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 16px;">💡</span>
            <div>
              <strong>ปุ่มทางลัด Watch Alert:</strong> สามารถกดเปิดหน้าต่างตั้งเตือนได้ทันทีจากปุ่มกระดิ่งมุมบนขวาของหน้า Feed โดยไม่ต้องค้นหาทีละหน้า
            </div>
          </div>
        </div>
      </div>

      <!-- Right Column -->
      <div class="right-col">
        <div class="best-practice-card">
          <div style="font-size: 10px; font-weight: 700; color: #b38027; margin-bottom: 3px;">🌟 เคล็ดลับการตั้งงบประมาณ</div>
          <div style="font-size: 8.5px; color: #334155; line-height: 1.35;">
            <strong>ตั้งเผื่อราคาต่อรองเล็กน้อย:</strong>
            หากต้องการซื้อจริงที่ 900,000 บาท แนะนำให้ตั้งเพดาน Alert ไว้ที่ 950,000 บาท เพื่อไม่ให้พลาดนาฬิกาสภาพดีที่ผู้ขายตั้งราคาเผื่อต่อรอง
          </div>
        </div>

        <div class="caution-card">
          <div style="font-size: 10px; font-weight: 700; color: #d97706; margin-bottom: 3px;">⚠️ การจัดการโควตา Alert</div>
          <div style="font-size: 8.5px; color: #334155; line-height: 1.35;">
            ผู้ใช้งานทั่วไปสามารถสร้าง Watch Alert ได้สูงสุด <strong>5 รายการพร้อมกัน</strong> หากต้องการตั้งเพิ่มสามารถแก้ไขหรือลบรายการเดิมที่ซื้อสำเร็จแล้วออกได้
          </div>
        </div>

        <div class="card">
          <div class="card-title-row">
            <div class="card-icon-circle card-icon-blue">📈</div>
            <div class="card-title">ความต้องการของตลาด</div>
          </div>
          <div style="font-size: 8.5px; color: #334155; line-height: 1.35;">
            ข้อมูล Watch Alert ที่ตั้งไว้ทั้งหมดจะถูกประมวลผลเป็นสถิติรวมของระบบ ช่วยให้ผู้ขายทราบว่านาฬิการุ่นใดกำลังเป็นที่ต้องการสูงในตลาดตึกแดง
          </div>
        </div>
      </div>
    </div>

    <div class="footer-bar">
      <div class="footer-left">
        <span>UNIVERZA TUKDAENG</span> &nbsp;|&nbsp; <span>Mobile Application Official Operation Manual</span>
      </div>
      <div class="footer-center">
        Authentic. Connected. Timeless. | การตั้งเตือนตลาดและการค้นหาอัจฉริยะ
      </div>
      <div class="footer-right">
        <span>Version 1.0</span> &nbsp;|&nbsp; <span>04 Oct 2026</span> &nbsp;|&nbsp; <span class="footer-page-num">Page 9</span>
      </div>
    </div>
  </div>

  <!-- ================= PAGE 10: 09 COMMUNITY SAFETY & CONTENT MODERATION ================= -->
  <div class="page">
    <div class="header-bar">
      <div class="header-left">
        <div class="chapter-badge">09</div>
        <div class="header-titles">
          <div class="header-title-en">COMMUNITY SAFETY & MODERATION</div>
          <div class="header-title-th">ความปลอดภัยของชุมชนและการรายงาน</div>
          <div class="header-summary">การสร้างชุมชนสีขาวสำหรับคนรักนาฬิกา การรายงานเนื้อหาไม่เหมาะสม 8 หมวด และกระบวนการระงับบัญชี</div>
        </div>
      </div>
      <div class="header-right">
        <img src="${appIconUrl}" class="header-logo-icon" alt="Logo">
        <div class="header-brand-text">
          <span class="header-brand-title">UNIVERZA TUKDAENG</span>
          <span class="header-brand-sub">TRUST & SAFETY SYSTEM</span>
        </div>
      </div>
    </div>

    <div class="body-grid">
      <!-- Left Column -->
      <div>
        <div class="card">
          <div class="card-title-row">
            <div class="card-icon-circle card-icon-gold">🛡️</div>
            <div class="card-title">แนวคิด (Community Trust)</div>
          </div>
          <div class="card-desc">
            ตลาดนาฬิกาหรูต้องการ <strong>ความน่าเชื่อถือสูงสุด</strong> ตึกแดงจึงสร้างระบบรายงานเนื้อหาที่รวดเร็ว เพื่อคัดกรองมิจฉาชีพและสินค้าปลอมแปลงออกจากระบบ
          </div>
        </div>

        <div class="card">
          <div class="card-title-row">
            <div class="card-icon-circle card-icon-blue">🚩</div>
            <div class="card-title">ขอบเขตที่รายงานได้</div>
          </div>
          <div class="card-desc">
            ครอบคลุมทุกจุดปฏิสัมพันธ์:
            <ul class="rule-list" style="margin-top: 3px;">
              <li class="rule-item"><strong>Report Asset:</strong> รายงานโพสต์นาฬิกาปลอม/เท็จ</li>
              <li class="rule-item"><strong>Report User:</strong> รายงานผู้ใช้ที่มีพฤติกรรมหลอกลวง</li>
              <li class="rule-item"><strong>Report Comment:</strong> รายงานข้อความหยาบคาย/สแปม</li>
            </ul>
          </div>
        </div>

        <div class="card">
          <div class="card-title-row">
            <div class="card-icon-circle card-icon-purple">⏱️</div>
            <div class="card-title">SLA ตรวจสอบใน 24 ชม.</div>
          </div>
          <div class="card-desc">
            ทุกรายงานจะถูกส่งตรงเข้าสู่ <strong>Back Office Moderator Queue</strong> ทีมงานแอดมินเข้าตรวจสอบพร้อมมาตรการลงโทษตามระดับความเสี่ยงภายใน 24 ชั่วโมง
          </div>
        </div>
      </div>

      <!-- Center Column with REAL Screenshot 6 -->
      <div class="center-col">
        <div class="real-screen-panel">
          <div class="panel-header-row">
            <div class="panel-header-title">
              <span class="panel-tag-real">OFFICIAL APP SCREEN</span>
              <span>ภาพหน้าจอจริง: หน้าต่างรายงานเนื้อหา (Report Content Modal)</span>
            </div>
            <div class="panel-header-sub">หน้าต่างเลือกเหตุผลการร้องเรียนและส่งเรื่องให้ทีมงานตรวจสอบ</div>
          </div>

          <div class="real-screen-layout">
            <img src="${realScreenshot6}" class="appstore-phone-img" alt="Official Report Content Modal">
            <div class="screen-callouts">
              <div class="callout-box">
                <strong>หัวข้อหน้าจอรายงาน:</strong><br>
                • หัวข้อ: <strong>รายงานเนื้อหา</strong><br>
                • คำถาม: <em>ทำไมคุณถึงรายงานเนื้อหานี้?</em>
              </div>
              <div class="callout-box">
                <strong>8 ตัวเลือกเหตุผลมาตรฐาน:</strong><br>
                1. <strong>เนื้อหาไม่เหมาะสม</strong><br>
                2. <strong>สแปม</strong> (Spam)<br>
                3. <strong>ความเกลียดชัง / การเลือกปฏิบัติ</strong><br>
                4. <span class="red-accent" style="font-weight:700;">หลอกลวง / ฉ้อโกง</span> (Fraud/Scam)<br>
                5. <strong>ข้อมูลเท็จ</strong> (False Information)<br>
                6. <strong>ความรุนแรง</strong><br>
                7. <strong>ละเมิดลิขสิทธิ์</strong> (Copyright)<br>
                8. <strong>อื่นๆ</strong>
              </div>
              <div class="callout-box">
                <strong>การส่งข้อมูล:</strong><br>
                • ช่องพิมพ์ <strong>รายละเอียดเพิ่มเติม (0/300)</strong><br>
                • ปุ่มสีแดง <span class="red-accent" style="font-weight:800;">ส่งรายงาน</span> เพื่อส่งเรื่องทันที
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Column -->
      <div class="right-col">
        <div class="best-practice-card">
          <div style="font-size: 10px; font-weight: 700; color: #b38027; margin-bottom: 3px;">🌟 ช่วยกันรักษาชุมชน</div>
          <div style="font-size: 8.5px; color: #334155; line-height: 1.35;">
            <strong>แนบรายละเอียดเพิ่มเติม:</strong>
            การพิมพ์ระบุเหตุผล เช่น "ภาพนำมาจากอินเทอร์เน็ต" หรือ "รูปไม่ตรงกับเลข Ref" จะช่วยให้ทีมงานแอดมินตรวจสอบและระงับโพสต์ได้รวดเร็วยิ่งขึ้น
          </div>
        </div>

        <div class="caution-card">
          <div style="font-size: 10px; font-weight: 700; color: #d97706; margin-bottom: 3px;">⚠️ มาตรการลงโทษผู้กระทำผิด</div>
          <div style="font-size: 8px; color: #334155; line-height: 1.35;">
            <ul class="rule-list">
              <li class="rule-item"><strong>ระดับเบา:</strong> ลบโพสต์/คอมเมนต์ พร้อมตักเตือน</li>
              <li class="rule-item"><strong>ระดับกลาง:</strong> ซ่อนสินทรัพย์ และระงับสิทธิ์ชั่วคราว</li>
              <li class="rule-item"><strong>ระดับร้ายแรง:</strong> แบนบัญชีถาวร (Permanent Ban)</li>
            </ul>
          </div>
        </div>

        <div class="card">
          <div class="card-title-row">
            <div class="card-icon-circle card-icon-green">📞</div>
            <div class="card-title">ช่องทางช่วยเหลือฉุกเฉิน</div>
          </div>
          <div style="font-size: 8.5px; color: #334155; line-height: 1.35;">
            กรณีพบการฉ้อโกงเร่งด่วน สามารถติดต่อ Support ได้โดยตรงผ่าน Support Center ในแอปพลิเคชัน ทีมงานพร้อมประสานงานช่วยเหลือตลอดเวลาทำการ
          </div>
        </div>
      </div>
    </div>

    <div class="footer-bar">
      <div class="footer-left">
        <span>UNIVERZA TUKDAENG</span> &nbsp;|&nbsp; <span>Mobile Application Official Operation Manual</span>
      </div>
      <div class="footer-center">
        Authentic. Connected. Timeless. | ความปลอดภัยของชุมชนและการรายงาน
      </div>
      <div class="footer-right">
        <span>Version 1.0</span> &nbsp;|&nbsp; <span>04 Oct 2026</span> &nbsp;|&nbsp; <span class="footer-page-num">Page 10</span>
      </div>
    </div>
  </div>

</body>
</html>
`;

// Save HTML file
const htmlFilePath = path.join(deliverablesDir, 'Univerza_Tukdaeng_User_Manual.html');
fs.writeFileSync(htmlFilePath, htmlContent, 'utf8');
console.log('HTML file written to:', htmlFilePath);

// Launch Chromium to generate PDF and page previews
async function generatePDF() {
  console.log('Launching Chromium with Playwright...');
  const browser = await chromium.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--allow-file-access-from-files',
      '--disable-web-security',
      '--disable-gpu'
    ]
  });
  console.error('STEP 1: Chromium launched');
  const page = await browser.newPage();

  await page.setViewportSize({ width: 1440, height: 1020 });

  const targetUrl = pathToFileURL(htmlFilePath).href;
  console.error('STEP 2: Navigating to:', targetUrl);
  await page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 15000 });

  console.error('STEP 3: Page loaded. Waiting for fonts...');
  try {
    await Promise.race([
      page.evaluate(() => document.fonts.ready),
      new Promise(r => setTimeout(r, 2000))
    ]);
  } catch (e) {
    console.error('Font wait skipped:', e.message);
  }
  await page.waitForTimeout(800);

  const pdfPath = path.join(deliverablesDir, 'Univerza_Tukdaeng_User_Manual.pdf');
  console.error('STEP 4: Rendering PDF to:', pdfPath);

  await page.pdf({
    path: pdfPath,
    format: 'A4',
    landscape: true,
    printBackground: true,
    margin: { top: '0px', right: '0px', bottom: '0px', left: '0px' },
    preferCSSPageSize: true
  });

  const pdfSize = fs.statSync(pdfPath).size;
  console.error('STEP 5: PDF generated successfully! Size:', pdfSize);

  await browser.close();
  console.error('STEP 6: ALL_TASKS_COMPLETED_SUCCESSFULLY');
}

generatePDF().catch(err => {
  console.error('Error generating PDF:', err);
  process.exit(1);
});

