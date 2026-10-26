# FO-DIAG-001 — ชุด Diagram ภาพรวมแอปตึกแดง (Front Office)

> วัตถุประสงค์: ให้พี่คิงและผู้เกี่ยวข้องเห็นภาพแอป TukDaeng ฝั่ง Front Office แบบครบถ้วนใน 6 มุม
> Source of truth: `Prototypes/fo-flow/index.html` + FrontOffice docs baseline `FO-PRD-v1.9`
> รูปแบบ: Mermaid (render ได้ใน GitHub / VS Code / mermaid.live)
> วันที่: 2026-10-26

---

## ใบที่ 1 — Overview (Command 1: ภาพรวมของโครงการ ระบบ องค์กร)

**ใช้เล่า:** "TukDaeng คืออะไร ใครใช้ และมีชิ้นส่วนอะไรบ้าง" — ใบเปิดประเดิมก่อนลงรายละเอียด

```mermaid
flowchart TB
    subgraph USERS["👥 ผู้ใช้"]
        GUEST["Guest<br/>ยังไม่ sign in<br/>browse ฟรี กด action → เจอ Member Sheet"]
        MEMBER["Member (User)<br/>role เดียว ทำได้ทั้งซื้อ ขาย โพสต์ สะสม"]
        OWNER["Owner<br/>= Member ในฐานะเจ้าของ Asset<br/>เห็น asset ตัวเองทุกสถานะ"]
        ADMIN["Admin<br/>ใช้ผ่าน Back Office เท่านั้น"]
    end

    subgraph FO["📱 TukDaeng Front Office (iOS / Android)"]
        FEEDM["Feed + Social<br/>โพสต์ นาฬิกา แชร์คอลเลกชัน"]
        MKT["Marketplace<br/>ลงขาย Asset / ค้นหา / Watch Alert"]
        COMM["Chat + Community<br/>คุยกับผู้ขาย อ่านกระดานข่าว"]
    end

    subgraph BO["🖥️ Back Office (Web)"]
        BOMOD["Report / Moderation<br/>จัดการ User / Asset / Board Content"]
    end

    subgraph EXT["☁️ Integrations"]
        SSO["Apple / Google Sign-in"]
        FCM["FCM Push Notification"]
        CDN["CDN (รูปภาพ)"]
        WPI["Watch Price API"]
    end

    GUEST --> FEEDM
    MEMBER --> FEEDM & MKT & COMM
    OWNER --> MKT
    ADMIN --> BOMOD
    BOMOD -.->|moderation handoff| FO
    FO --> SSO & FCM & CDN & WPI
```

**จุดที่อยากให้จำ:**
- เป็น Marketplace Community นาฬิกาหรู ไม่ใช่ social network ทั่วไป และไม่มีจ่ายเงินในแอป (V1)
- User มี role เดียว — คนเดียวกันซื้อ ขาย โพสต์ และสะสมได้หมด
- Guest เข้าดูได้เสรี แต่ action ที่ต้องมีตัวตนจะเจอ Member Sheet `Join TukDaeng`
- ไม่มี Auction / Live Selling / Watch Authentication ใน Phase 1

---

## ใบที่ 2 — Feature Map (Command 16: Features และ Sub-features ทั้งหมด)

**ใช้เล่า:** "แอปมีอะไรบ้าง" — ครบทุก feature ในใบเดียว จัดกลุ่มตาม module spec

```mermaid
flowchart LR
    ROOT["ตึกแดง FO"]

    ROOT --> A["🔐 Authentication<br/>สมัคร / Sign in / OTP<br/>SSO Apple+Google<br/>เปลี่ยนรหัส / ลบบัญชี<br/>(grace 30 วัน login-to-restore)"]

    ROOT --> B["📰 Feed<br/>Tabs: All / Following / Favorites<br/>Post card (Sale + โพสต์ธรรมดา)<br/>Create composer: post / asset<br/>post menu: archive, pin, edit,<br/>mark as sold, report"]

    ROOT --> C["🔍 Search & Filter<br/>Explore tiles / Recents / Suggest<br/>Filter: brand, model, price,<br/>delivery, strap, box&papers<br/>Post Viewer (IG-style)"]

    ROOT --> D["⌚ Asset Management<br/>สถานะ: Sale / Show / Hide / Sold<br/>Mark as Sold + Sale Record<br/>Gallery / drawer ใน Portfolio"]

    ROOT --> E["💬 Chat<br/>Chat list + room<br/>ผูก user+item (listing) เสมอ<br/>Ask Seller / View asset<br/>block / report entry"]

    ROOT --> F["❤️ Social<br/>Like / Comment (reply 1 ชั้น)<br/>Share (member-only)<br/>Saved + Wishlist collections<br/>Follow / Mute / Favorite seller<br/>Not-interested"]

    ROOT --> G["🔔 Watch Alert<br/>สร้างจาก search bell / model follow<br/>list จัดการใน Settings<br/>notif → Post Viewer ตรง"]

    ROOT --> H["📣 Alerts<br/>5 types: Like / Comment /<br/>Follow / Watch Alert / System<br/>badge 99+ / mark all read"]

    ROOT --> I["👤 Profile<br/>Own + Public profile<br/>grid tabs / followers / following<br/>QR / edit / message"]

    ROOT --> J["💼 Portfolio<br/>Total invested dashboard<br/>asset value detail<br/>sold history"]

    ROOT --> K["📖 Board<br/>นิตยสาร editorial<br/>hero / latest / categories<br/>article like / share"]

    ROOT --> L["⚙️ Settings<br/>account / language / theme<br/>legal / notif settings<br/>muted / blocked / sensitive<br/>help / delete account"]

    ROOT --> M["🛡️ Trust & Safety<br/>Report flow (user / post)<br/>Block (IG keep-page)<br/>moderation handoff → BO"]

    ROOT --> N["👻 Guest Mode<br/>browse ฟรี: feed, search,<br/>boards, profile, legal<br/>identity action → Member Sheet"]
```

---

## ใบที่ 3 — Sitemap (Command 17: โครงสร้างหน้าและเมนูของแอป)

**ใช้เล่า:** "แอปมีหน้าอะไรบ้าง อยู่ตรงไหน" — ถอดจาก route map จริงใน prototype (`§6.6 Sub-Page Route Map`)

```mermaid
flowchart TB
    subgraph SHELL["Feed Shell (root — mount ตลอด)"]
        HDR["App Header<br/>burger drawer • search • wordmark • + create"]
        TABS["Feed Tabs<br/>All Posts / Following / Favorites"]
        BNAV["Bottom Nav 5 แท็บ"]
    end

    BNAV --> T1["① Feed<br/>(root feed)"]
    BNAV --> T2["② Chat<br/>chat → chatroom:id<br/>chatitem / chmenu / chmedia / chatcfg"]
    BNAV --> T3["③ Boards<br/>board → boardall / boardsearch<br/>→ boardart:id"]
    BNAV --> T4["④ Alerts<br/>alerts → walerts"]
    BNAV --> T5["⑤ Profile<br/>profile:user → pedit / portfolio<br/>pfollow / pfasset / soldhist / sold / sell"]

    HDR --> D1["Search<br/>search → sfilter / recents"]
    HDR --> D2["+ Create<br/>create (post / asset)"]
    HDR --> D3["Drawer<br/>9 รายการ future/placeholder<br/>(Watch Shops, Auction Center ฯลฯ)"]

    subgraph LIB["Saved / Library"]
        L1["saved → savedcol / archive<br/>wishlist → wishcol<br/>interested / ni"]
    end

    subgraph SET["Settings & Account"]
        S1["settings → about_account /<br/>change_pwd / del_account /<br/>lang / theme / notif_settings /<br/>favorites / muted / blocked /<br/>prefs / sensitive / help /<br/>privacy / terms / about_app"]
    end

    subgraph OVL["Overlay Layers (ไม่ใช่ sub page)"]
        O1["Post Viewer (.page-pv)<br/>immersive 3 modes"]
        O2["Post Detail (.page-detail)<br/>= asset-detail equivalent"]
        O3["Bottom Sheets<br/>comments / likes / share /<br/>save / wishlist / watch alert"]
        O4["Report Stack<br/>report → report:pick → report:done"]
        O5["Member Sheet<br/>Join TukDaeng (guest gate)"]
    end

    T1 -.tap details.-> O2
    T1 -.tap tile/profile.-> O1
    T2 -.item card.-> O2
    T4 -.tap row.-> O1
    T5 -.grid tile.-> O1
    O1 -->|View full detail| O2
```

---

## ใบที่ 4 — Screen Flow (Command 19: ความสัมพันธ์ระหว่างหน้าจอ)

**ใช้เล่า:** "หน้าจอไหลไปหากันยังไง" — flow จริงตาม entry point matrix (§7)

```mermaid
flowchart LR
    ONB["Onboarding<br/>(first launch)"] --> FEED
    AUTH["Auth<br/>Sign up / Sign in"] --> FEED

    FEED["🏠 Feed<br/>(root shell)"]

    FEED -->|"Tap for details →<br/>View full detail"| DETAIL["Post Detail"]
    FEED -->|"tap avatar / name"| PPROF["Public Profile"]
    FEED -->|"search icon"| SEARCH["Search<br/>landing → results"]
    FEED -->|"+ (member)"| CREATE["Create composer"]
    FEED -->|"Ask Seller pill"| CHATR["Chat Room"]
    FEED -->|"post menu ..."| REPORT["Report Stack"]

    SEARCH -->|"tap tile"| PV["Post Viewer"]
    PPROF -->|"tap grid tile"| PV
    ALERTS["Alerts"] -->|"tap row<br/>(like/comment/watch alert)"| PV
    PV -->|"View full detail"| DETAIL
    DETAIL -->|"Ask Seller"| CHATR
    DETAIL -->|"bell (follow model)"| WA["Watch Alert sheet"]
    DETAIL -->|"wl-btn"| WL["Wishlist sheet"]
    CHATR -->|"View asset card"| DETAIL

    FEED -->|"tab"| CHATL["Chat List"] --> CHATR
    FEED -->|"tab"| BOARD["Board"] --> ART["Article Detail"]
    FEED -->|"tab"| ALERTS
    FEED -->|"tab"| PROF["Own Profile"] --> SET["Settings"]
    PROF -->|"saved/wishlist"| SAVED["Saved / Wishlist"] --> PV

    GATED{"action ต้องมีตัวตน?"}
    GATED -->|"guest"| MS["Member Sheet<br/>Join TukDaeng"] --> AUTH
    GATED -.->|"member"| FEED
```

**กติกาสำคัญที่เห็นในภาพ:**
- Post Viewer เปิดได้เฉพาะจาก **grid tiles / notifications** — feed card กด media ได้แค่ carousel ในการ์ดเดิม
- Post Detail อยู่เหนือ viewer เสมอ (`detail-back` เผย viewer ข้างล่าง)
- ทุก gated action ของ guest ไหลไป Member Sheet ก่อนเสมอ
- Alerts back button กลับ Feed เสมอ ไม่ใช่ pop stack

---

## ใบที่ 5 — User Flow (Command 18: เส้นทางและการตัดสินใจของผู้ใช้)

**ใช้เล่า:** "ผู้ใช้เดินผ่านแอปยังไง ตัดสินใจตรงไหน" — 2 เส้นทางหลัก ผู้ซื้อ และผู้ขาย

### 5A — เส้นทางผู้ซื้อ (Buyer Flow)

```mermaid
flowchart TD
    START(["เปิดแอป"]) --> SES{"session?"}
    SES -->|"guest"| BROWSE["ดู Feed / Search / Boards ฟรี"]
    SES -->|"member"| BROWSE

    BROWSE --> FOUND{"เจอเรือนที่สนใจ?"}
    FOUND -->|"ยัง"| WA{"อยากเฝ้าดูรุ่นนี้?"}
    WA -->|"ตั้ง Watch Alert"| GATE{"member?"}
    GATE -->|"guest"| MS["Member Sheet<br/>Join TukDaeng"]
    MS -->|"sign up / sign in"| BROWSE
    MS -->|"skip"| BROWSE
    GATE -->|"member"| WASET["สร้าง Watch Alert<br/>รอ notif"]
    WASET -->|"notif มา"| PVD["Post Viewer → Detail"]

    FOUND -->|"เจอ"| PVD
    PVD --> DEC{"สนใจจริง?"}
    DEC -->|"เก็บไว้ก่อน"| SAVE["Save / Wishlist"]
    DEC -->|"อยากคุย"| ASK{"member?"}
    ASK -->|"guest"| MS
    ASK -->|"member"| CHAT["Chat กับผู้ขาย<br/>(item-scoped)"]
    CHAT --> DEAL{"ตกลงซื้อขาย?<br/>(นัดเจอ/คุยนอกแอป)"}
    DEAL -->|"ไม่ deal"| BROWSE
    DEAL -->|"deal"| DONE(["จบ — ไม่มีจ่ายเงินในแอป"])
```

### 5B — เส้นทางผู้ขาย (Seller Flow)

```mermaid
flowchart TD
    S1(["Member อยากขาย"]) --> C{"สร้างอะไร?"}
    C -->|"post ธรรมดา"| POST["Create post<br/>(feed-only ไม่ผูก asset)"]
    C -->|"asset ลงขาย"| ASSET["Create asset<br/>สถานะ Sale"]
    ASSET --> LIVE["ขึ้น Feed / Search /<br/>match Watch Alert ของผู้ซื้อ"]
    POST --> LIVE
    LIVE --> ENG["คน like / comment / follow<br/>→ Alerts เด้ง"]
    LIVE --> CHAT2["ผู้ซื้อ Ask Seller<br/>→ Chat room"]
    CHAT2 --> NEG{"เจรจา"}
    NEG -->|"ไม่ขาย"| LIVE
    NEG -->|"ขายได้"| SOLD["Mark as Sold<br/>+ Sale Record"]
    SOLD --> PORT["เข้า Portfolio<br/>sold history / total invested"]
    PORT --> S2(["จบ"])
```

---

## ใบที่ 6 — Journey (Command 3: ประสบการณ์ของผู้ใช้ตลอดเส้นทาง)

**ใช้เล่า:** "รู้สึกยังไงในแต่ละช่วง" — journey ของ Guest→Member ฝั่งผู้ซื้อ (คะแนน 1–5)

```mermaid
journey
    title Buyer Journey — จาก Guest ถึงปิดดีล
    section เข้ามาดูเล่น
      เปิดแอป เลื่อน feed ฟรี: 4: Guest
      search + filter หารุ่นที่ชอบ: 4: Guest
    section ชนกำแพงตัวตน
      กด like / save แล้วเจอ Member Sheet: 2: Guest
      ตัดสินใจสมัคร (SSO ง่าย): 3: Guest
    section เป็น Member
      ตั้ง Watch Alert รุ่นที่อยากได้: 5: Member
      ได้ notif เปิด Post Viewer ดูของจริง: 5: Member
      Ask Seller คุยกับเจ้าของ: 4: Member
      ตกลงซื้อขายนอกแอป: 3: Member
    section กลับมาใช้ต่อ
      save ของที่ชอบ ไว้ดูทีหลัง: 4: Member
      follow ร้านที่ไว้ใจ: 4: Member
```

```mermaid
journey
    title Seller Journey — ลงขายถึงขายได้
    section เตรียมของ
      ถ่ายรูป กรอก specs ลง asset: 3: Member
      เลือกสถานะ Sale หรือ Show: 4: Member
    section รอคนเจอ
      โพสต์ขึ้น feed + search + watch alert: 4: Member
      มีคน like / comment / Ask Seller: 5: Member
    section เจรจา
      ตอบแชทผู้ซื้อ (item-scoped): 4: Member
      นัดดูของ / ตกลงราคานอกแอป: 3: Member
    section ปิดดีล
      Mark as Sold + กรอก Sale Record: 4: Member
      เห็น portfolio อัปเดต: 5: Member
```

---

## วิธีใช้ชุดนี้กับพี่คิง

| ลำดับเล่า | ใบ | ประโยคเปิด |
| --- | --- | --- |
| 1 | Overview | "แอปตึกแดงคือ marketplace community นาฬิกาหรู มี FO mobile + BO web" |
| 2 | Feature Map | "ทำได้ทั้งหมดนี้ จัดเป็น 14 กลุ่ม" |
| 3 | Sitemap | "โครงสร้างหน้าจริงใน prototype เป็นแบบนี้ 5 แท็บ + overlays" |
| 4 | Screen Flow | "หน้าจอไหลกันแบบ IG — viewer เหนือ feed, detail เหนือ viewer" |
| 5 | User Flow | "เส้นทางจริงของผู้ซื้อ/ผู้ขาย รวมจุดที่ guest ชน gate" |
| 6 | Journey | "ฟีลลิ่งผู้ใช้ในแต่ละช่วง จุดแข็ง-จุดเสี่ยง" |
