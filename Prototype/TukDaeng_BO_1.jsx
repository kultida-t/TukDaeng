import { useState } from "react";

const NAV_ITEMS = [
  { id: "dashboard", icon: "📊", label: "Dashboard" },
  { id: "users",     icon: "👥", label: "Users" },
  { id: "assets",    icon: "⌚", label: "Assets" },
  { id: "articles",  icon: "📰", label: "Articles" },
  { id: "market",    icon: "📈", label: "Market Data" },
  { id: "directory", icon: "🏪", label: "Directory" },
  { id: "notifications", icon: "🔔", label: "Notifications" },
  { id: "reports",   icon: "📋", label: "Reports" },
  { id: "auditlog",  icon: "🔍", label: "Audit Log" },
  { id: "settings",  icon: "⚙️", label: "Settings" },
];

const C = {
  bg: "#0f0f0f", sidebar: "#181818", card: "#1e1e1e", border: "#2a2a2a",
  accent: "#dc2626", text: "#f5f5f5", textMuted: "#888", textDim: "#555",
  green: "#22c55e", amber: "#f59e0b", blue: "#3b82f6", purple: "#a855f7",
};

// ── Mock Data ──────────────────────────────────────────────
const USERS = [
  { id:"U001", name:"Vintage Vault BKK", email:"info@vintagevault.com", authMethod:"Email", phone:"081-234-5678", assets:14, status:"Active",    joined:"Jan 2024", lastActive:"2h ago" },
  { id:"U002", name:"The Collector",     email:"collector@mail.com",    authMethod:"Google", phone:"—",          assets:6,  status:"Active",    joined:"Feb 2024", lastActive:"5h ago" },
  { id:"U003", name:"horology.king",     email:"hking@mail.com",        authMethod:"Email", phone:"089-111-2222", assets:22, status:"Suspended", joined:"Nov 2023", lastActive:"3d ago" },
  { id:"U004", name:"Marcus V",          email:"marcus@mail.com",       authMethod:"Apple", phone:"—",           assets:0,  status:"Active",    joined:"Mar 2024", lastActive:"1d ago" },
  { id:"U005", name:"Sophie Patek",      email:"sophie@mail.com",       authMethod:"Email", phone:"092-999-8888", assets:8,  status:"Active",    joined:"Dec 2023", lastActive:"30m ago" },
];

const ASSETS = [
  { id:"A001", brand:"Patek Philippe",  model:"Nautilus 5711/1A",       ref:"5711/1A-010",   owner:"Vintage Vault BKK", price:"฿1,200,000", status:"Sale",             condition:"Used (Very Good)", flagged:false },
  { id:"A002", brand:"Rolex",           model:"Submariner Date",        ref:"116610LN",      owner:"horology.king",     price:"฿350,000",   status:"Sale",             condition:"Used (Good)",      flagged:true  },
  { id:"A003", brand:"Audemars Piguet", model:"Royal Oak Day-Date",     ref:"26330OR",       owner:"Vintage Vault BKK", price:"฿3,080,000", status:"Collection Show",  condition:"New",              flagged:false },
  { id:"A004", brand:"Omega",           model:"Speedmaster Pro",        ref:"310.30.42.50",  owner:"Sophie Patek",      price:"฿145,000",   status:"Collection Hide",  condition:"Used (Very Good)", flagged:false },
  { id:"A005", brand:"IWC",             model:"Pilot's Watch XVI",      ref:"IW325501",      owner:"The Collector",     price:"฿120,000",   status:"Sold",             condition:"Used (Good)",      flagged:false },
];

const ARTICLES = [
  { id:"AR001", title:"The Perpetual Calendar: A Century of Mastery", slug:"perpetual-calendar-century", category:"Watch 101", author:"Tuk Daeng", date:"Oct 28, 2024", publishAt:"Published", status:"Published", featured:true, order:1, readTime:"6 min", views:4820, likes:312, shares:86 },
  { id:"AR002", title:"5 Things You Should Know Before You Buy a Grand Seiko", slug:"grand-seiko-buying-guide", category:"Watch Brands", author:"Admin", date:"Nov 1, 2024", publishAt:"Published", status:"Published", featured:false, order:"-", readTime:"4 min", views:2100, likes:178, shares:42 },
  { id:"AR003", title:"Rolex Steel vs. Gold: Key Differences Explained", slug:"rolex-steel-vs-gold", category:"Watch Brands", author:"Admin", date:"Nov 5, 2024", publishAt:"Draft", status:"Draft", featured:false, order:"-", readTime:"5 min", views:0, likes:0, shares:0 },
  { id:"AR004", title:"Daytona Prices Stabilize in Q3", slug:"daytona-prices-q3", category:"Watch Market", author:"Tuk Daeng", date:"Nov 10, 2024", publishAt:"Jun 7, 2026 10:00", status:"Scheduled", featured:true, order:2, readTime:"3 min", views:0, likes:0, shares:0 },
];

const BOARD_BANNERS = [
  { id:"BN001", title:"Watch Price Index Update", position:"Top Banner", status:"Active", start:"Jun 1, 2026", end:"Jun 30, 2026", ctr:"8.4%" },
  { id:"BN002", title:"Consignment Partner Highlight", position:"Mid Banner", status:"Active", start:"Jun 4, 2026", end:"Jun 20, 2026", ctr:"5.1%" },
  { id:"BN003", title:"Authentication Center Guide", position:"Board Detail", status:"Inactive", start:"-", end:"-", ctr:"-" },
];

const METRICS = [
  { label:"Total Users",     value:"12,480", change:"+8.2%",  up:true  },
  { label:"Active Listings", value:"3,847",  change:"+12.4%", up:true  },
  { label:"Offers Today",    value:"246",    change:"+3.1%",  up:true  },
  { label:"Pending Reports", value:"7",      change:"+2",     up:false },
];

const AUTH_BREAKDOWN = [
  { method:"Email/Password", count:8240, pct:66 },
  { method:"Google",         count:2890, pct:23 },
  { method:"Apple",          count:1350, pct:11 },
];

const ASSET_STATUS_BREAKDOWN = [
  { status:"Sale",             count:2410, color: "#f87171" },
  { status:"Collection Show",  count:890,  color: "#60a5fa" },
  { status:"Collection Hide",  count:340,  color: "#9ca3af" },
  { status:"Sold",             count:207,  color: "#4ade80" },
];

const AUDIT_LOGS = [
  { id:"AL001", admin:"superadmin",   role:"Super Admin",    action:"Suspend User",     entity:"User / U003",  time:"10m ago" },
  { id:"AL002", admin:"content.admin",role:"Content Admin",  action:"Publish Article",  entity:"Article / AR004", time:"1h ago" },
  { id:"AL003", admin:"moderator1",   role:"Moderator",      action:"Flag Asset",       entity:"Asset / A002", time:"2h ago" },
  { id:"AL004", admin:"superadmin",   role:"Super Admin",    action:"Update Price Index",entity:"Model / Nautilus", time:"3h ago" },
  { id:"AL005", admin:"market.admin", role:"Market Admin",   action:"Add Watch Brand",  entity:"Brand / Zenith", time:"5h ago" },
];

// ── Shared UI ──────────────────────────────────────────────
function btnStyle(bg, fg) {
  return { background:bg, color:fg, border:"none", borderRadius:4, padding:"4px 10px", fontSize:12, cursor:"pointer", fontWeight:500 };
}

function Badge({ children }) {
  const map = {
    Active:             { bg:"#14532d", fg:"#4ade80" },
    Suspended:          { bg:"#7c2d12", fg:"#fb923c" },
    Banned:             { bg:"#450a0a", fg:"#f87171" },
    Published:          { bg:"#14532d", fg:"#4ade80" },
    Draft:              { bg:"#1e3a5f", fg:"#60a5fa" },
    Scheduled:          { bg:"#713f12", fg:"#fbbf24" },
    Archived:           { bg:"#374151", fg:"#9ca3af" },
    Sale:               { bg:"#450a0a", fg:"#f87171" },
    "Collection Show":  { bg:"#1e3a5f", fg:"#60a5fa" },
    "Collection Hide":  { bg:"#1f2937", fg:"#9ca3af" },
    Sold:               { bg:"#14532d", fg:"#4ade80" },
    Flagged:            { bg:"#7c2d12", fg:"#fb923c" },
    Email:              { bg:"#1e3a5f", fg:"#60a5fa" },
    Apple:              { bg:"#2d2d2d", fg:"#e5e7eb" },
    Google:             { bg:"#1a3322", fg:"#4ade80" },
  };
  const s = map[children] || { bg:"#2a2a2a", fg:"#888" };
  return (
    <span style={{ background:s.bg, color:s.fg, padding:"2px 8px", borderRadius:4, fontSize:11, fontWeight:600, letterSpacing:"0.03em", whiteSpace:"nowrap" }}>
      {children}
    </span>
  );
}

function Table({ columns, data, actionButtons }) {
  return (
    <div style={{ overflowX:"auto" }}>
      <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
        <thead>
          <tr style={{ borderBottom:`1px solid ${C.border}` }}>
            {columns.map(c => (
              <th key={c.key} style={{ padding:"10px 12px", textAlign:"left", color:C.textMuted, fontWeight:500, whiteSpace:"nowrap" }}>{c.label}</th>
            ))}
            {actionButtons && <th style={{ padding:"10px 12px", color:C.textMuted, fontWeight:500 }}>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i} style={{ borderBottom:`1px solid ${C.border}`, transition:"background 0.15s" }}
              onMouseEnter={e => e.currentTarget.style.background="#252525"}
              onMouseLeave={e => e.currentTarget.style.background="transparent"}>
              {columns.map(c => (
                <td key={c.key} style={{ padding:"10px 12px", color:C.text, whiteSpace:"nowrap" }}>
                  {c.render ? c.render(row[c.key], row) : row[c.key]}
                </td>
              ))}
              {actionButtons && (
                <td style={{ padding:"10px 12px" }}>
                  <div style={{ display:"flex", gap:6 }}>
                    {actionButtons(row)}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SectionCard({ children, style }) {
  return <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:8, ...style }}>{children}</div>;
}

function FilterBar({ children }) {
  return (
    <SectionCard style={{ padding:"12px 16px", marginBottom:16, display:"flex", gap:10, flexWrap:"wrap", alignItems:"center" }}>
      {children}
    </SectionCard>
  );
}

function Input({ placeholder, value, onChange, style }) {
  return (
    <input value={value} onChange={onChange} placeholder={placeholder}
      style={{ background:C.bg, border:`1px solid ${C.border}`, borderRadius:6, padding:"7px 12px", color:C.text, fontSize:13, outline:"none", ...style }} />
  );
}

function Select({ children, style }) {
  return (
    <select style={{ background:C.bg, border:`1px solid ${C.border}`, borderRadius:6, padding:"7px 12px", color:C.textMuted, fontSize:13, ...style }}>
      {children}
    </select>
  );
}

function PageHeader({ title, subtitle, actions }) {
  return (
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
      <div>
        <h2 style={{ color:C.text, fontSize:20, fontWeight:600, margin:0 }}>{title}</h2>
        {subtitle && <p style={{ color:C.textMuted, fontSize:13, marginTop:4 }}>{subtitle}</p>}
      </div>
      {actions && <div style={{ display:"flex", gap:8 }}>{actions}</div>}
    </div>
  );
}

// ── Dashboard ──────────────────────────────────────────────
function DashboardPage() {
  return (
    <div>
      <PageHeader title="Dashboard" subtitle="Overview — May 30, 2568" />

      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:20 }}>
        {METRICS.map((m,i) => (
          <SectionCard key={i} style={{ padding:"14px 16px" }}>
            <div style={{ fontSize:12, color:C.textMuted, marginBottom:8 }}>{m.label}</div>
            <div style={{ fontSize:22, fontWeight:700, color:C.text }}>{m.value}</div>
            <div style={{ fontSize:12, color:m.up ? C.green:"#f87171", marginTop:4 }}>{m.change} vs last month</div>
          </SectionCard>
        ))}
      </div>

      {/* Asset Status + Auth Breakdown */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:16 }}>
        <SectionCard style={{ padding:16 }}>
          <h3 style={{ color:C.text, fontSize:14, fontWeight:600, margin:"0 0 14px" }}>Asset Status Breakdown</h3>
          {ASSET_STATUS_BREAKDOWN.map((s,i) => (
            <div key={i} style={{ marginBottom:10 }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                <span style={{ fontSize:13, color:C.text }}>{s.status}</span>
                <span style={{ fontSize:12, color:C.textMuted }}>{s.count.toLocaleString()}</span>
              </div>
              <div style={{ height:4, background:C.border, borderRadius:2 }}>
                <div style={{ height:4, background:s.color, borderRadius:2, width:`${Math.round(s.count/3847*100)}%` }} />
              </div>
            </div>
          ))}
        </SectionCard>

        <SectionCard style={{ padding:16 }}>
          <h3 style={{ color:C.text, fontSize:14, fontWeight:600, margin:"0 0 14px" }}>Sign-up Method Breakdown</h3>
          {AUTH_BREAKDOWN.map((a,i) => (
            <div key={i} style={{ marginBottom:10 }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                <span style={{ fontSize:13, color:C.text }}>{a.method}</span>
                <span style={{ fontSize:12, color:C.textMuted }}>{a.count.toLocaleString()} ({a.pct}%)</span>
              </div>
              <div style={{ height:4, background:C.border, borderRadius:2 }}>
                <div style={{ height:4, background:C.accent, borderRadius:2, width:`${a.pct}%` }} />
              </div>
            </div>
          ))}
        </SectionCard>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
        {/* Activity Feed */}
        <SectionCard style={{ padding:16 }}>
          <h3 style={{ color:C.text, fontSize:14, fontWeight:600, margin:"0 0 14px" }}>Recent Activity</h3>
          {[
            { action:"New user registered (Apple)", who:"marcus_bkk",            time:"2m ago",  type:"user" },
            { action:"Asset flagged for review",    who:"Rolex Sub 116610LN",    time:"15m ago", type:"warn" },
            { action:"Article published",           who:"Daytona Q3 Price Update",time:"1h ago", type:"ok"   },
            { action:"Offer accepted",              who:"Patek Nautilus deal",    time:"2h ago",  type:"ok"   },
            { action:"User suspended",              who:"fake_watches_99",        time:"3h ago",  type:"err"  },
          ].map((item,i) => (
            <div key={i} style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 0", borderBottom:i<4?`1px solid ${C.border}`:"none" }}>
              <div style={{ width:8, height:8, borderRadius:"50%", flexShrink:0,
                background:item.type==="ok"?C.green:item.type==="warn"?C.amber:item.type==="err"?"#f87171":C.blue }} />
              <div style={{ flex:1 }}>
                <div style={{ fontSize:13, color:C.text }}>{item.action}</div>
                <div style={{ fontSize:11, color:C.textMuted }}>{item.who}</div>
              </div>
              <div style={{ fontSize:11, color:C.textDim }}>{item.time}</div>
            </div>
          ))}
        </SectionCard>

        {/* Top Brands */}
        <SectionCard style={{ padding:16 }}>
          <h3 style={{ color:C.text, fontSize:14, fontWeight:600, margin:"0 0 14px" }}>Top Searched Brands</h3>
          {[
            { brand:"Rolex",            count:4820, pct:100 },
            { brand:"Patek Philippe",   count:3240, pct:67  },
            { brand:"Audemars Piguet",  count:2180, pct:45  },
            { brand:"Omega",            count:1950, pct:40  },
            { brand:"IWC",              count:980,  pct:20  },
          ].map((b,i) => (
            <div key={i} style={{ marginBottom:12 }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                <span style={{ fontSize:13, color:C.text }}>{b.brand}</span>
                <span style={{ fontSize:12, color:C.textMuted }}>{b.count.toLocaleString()}</span>
              </div>
              <div style={{ height:4, background:C.border, borderRadius:2 }}>
                <div style={{ height:4, background:C.accent, borderRadius:2, width:`${b.pct}%` }} />
              </div>
            </div>
          ))}
        </SectionCard>
      </div>
    </div>
  );
}

// ── Users ──────────────────────────────────────────────────
function UsersPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [authFilter, setAuthFilter] = useState("All");

  const filtered = USERS.filter(u => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "All" || u.status === statusFilter;
    const matchAuth   = authFilter   === "All" || u.authMethod === authFilter;
    return matchSearch && matchStatus && matchAuth;
  });

  return (
    <div>
      <PageHeader title="User Management"
        subtitle={`${USERS.length} total users — ทุก User มี Role เดียวกัน (ไม่แบ่ง Buyer/Seller)`}
        actions={<button style={{ ...btnStyle(C.accent,"#fff"), padding:"8px 16px", fontSize:13 }}>+ Invite Admin</button>}
      />

      <FilterBar>
        <Input placeholder="ค้นหา username / email..." value={search} onChange={e=>setSearch(e.target.value)} style={{ flex:1, minWidth:200 }} />
        <Select>
          <option>All Status</option>
          <option>Active</option>
          <option>Suspended</option>
          <option>Banned</option>
        </Select>
        <Select onChange={e=>setAuthFilter(e.target.value)}>
          <option value="All">All Auth Methods</option>
          <option value="Email">Email/Password</option>
          <option value="Apple">Apple</option>
          <option value="Google">Google</option>
        </Select>
        <button style={{ ...btnStyle("#1a3322","#4ade80"), padding:"7px 14px", fontSize:13 }}>Export CSV</button>
      </FilterBar>

      <SectionCard style={{ overflow:"hidden" }}>
        <Table
          columns={[
            { key:"id",         label:"User ID" },
            { key:"name",       label:"Username" },
            { key:"email",      label:"Email" },
            { key:"authMethod", label:"Auth Method", render:v=><Badge>{v}</Badge> },
            { key:"phone",      label:"Phone" },
            { key:"assets",     label:"Total Assets" },
            { key:"lastActive", label:"Last Active" },
            { key:"joined",     label:"Joined" },
            { key:"status",     label:"Status", render:v=><Badge>{v}</Badge> },
          ]}
          data={filtered}
          actionButtons={row => <>
            <button style={btnStyle("#1e3a5f","#60a5fa")}>View</button>
            {row.status === "Active"
              ? <button style={btnStyle("#7c2d12","#fb923c")}>Suspend</button>
              : <button style={btnStyle("#1a3322","#4ade80")}>Unsuspend</button>}
            {row.authMethod === "Email" &&
              <button style={btnStyle("#2a2a2a","#888")}>Reset PW</button>}
            <button style={btnStyle("#450a0a","#f87171")}>Ban</button>
          </>}
        />
      </SectionCard>
    </div>
  );
}

// ── Assets ─────────────────────────────────────────────────
function AssetsPage() {
  const [statusFilter, setStatusFilter] = useState("All");
  const [showFlagged, setShowFlagged]   = useState(false);

  const filtered = ASSETS.filter(a => {
    const matchStatus  = statusFilter === "All" || a.status === statusFilter;
    const matchFlagged = !showFlagged || a.flagged;
    return matchStatus && matchFlagged;
  });

  const flagCount = ASSETS.filter(a=>a.flagged).length;

  return (
    <div>
      <PageHeader title="Asset Management"
        subtitle={`${ASSETS.length} total assets`}
        actions={<>
          <button onClick={()=>setShowFlagged(!showFlagged)}
            style={{ ...btnStyle(showFlagged?"#7c2d12":"#2a2a2a", showFlagged?"#fb923c":"#888"), padding:"7px 14px", fontSize:13 }}>
            ⚑ Flagged ({flagCount})
          </button>
          <button style={{ ...btnStyle(C.accent,"#fff"), padding:"7px 14px", fontSize:13 }}>Export CSV</button>
        </>}
      />

      {/* Status filter tabs */}
      <div style={{ display:"flex", gap:8, marginBottom:16, flexWrap:"wrap" }}>
        {["All","Sale","Collection Show","Collection Hide","Sold"].map(s => (
          <button key={s} onClick={()=>setStatusFilter(s)} style={{
            ...btnStyle(statusFilter===s?C.accent:C.card, statusFilter===s?"#fff":C.textMuted),
            padding:"6px 14px", fontSize:13, borderRadius:6, border:`1px solid ${statusFilter===s?C.accent:C.border}`
          }}>{s}</button>
        ))}
      </div>

      {/* Status info banner */}
      <SectionCard style={{ padding:"10px 16px", marginBottom:16, display:"flex", gap:24 }}>
        {ASSET_STATUS_BREAKDOWN.map((s,i) => (
          <div key={i} style={{ fontSize:12 }}>
            <span style={{ color:C.textMuted }}>
              <span style={{ display:"inline-block", width:8, height:8, borderRadius:"50%", background:s.color, marginRight:6 }} />
              {s.status}:
            </span>
            <span style={{ color:C.text, fontWeight:600, marginLeft:4 }}>{s.count.toLocaleString()}</span>
          </div>
        ))}
      </SectionCard>

      <SectionCard style={{ overflow:"hidden" }}>
        <Table
          columns={[
            { key:"id",        label:"Asset ID" },
            { key:"brand",     label:"Brand" },
            { key:"model",     label:"Model" },
            { key:"ref",       label:"Reference" },
            { key:"owner",     label:"Owner" },
            { key:"price",     label:"Price" },
            { key:"status",    label:"Status",  render:v=><Badge>{v}</Badge> },
            { key:"condition", label:"Condition" },
            { key:"flagged",   label:"Flag",    render:v=>v?<Badge>Flagged</Badge>:<span style={{color:C.textDim}}>—</span> },
          ]}
          data={filtered}
          actionButtons={row => <>
            <button style={btnStyle("#1e3a5f","#60a5fa")}>View</button>
            {row.status !== "Sold"
              ? <button style={btnStyle("#1a3322","#4ade80")}>Edit</button>
              : <button style={btnStyle("#713f12","#fbbf24")}>Sale History</button>}
            {row.flagged
              ? <button style={btnStyle("#2a2a2a","#888")}>Unflag</button>
              : <button style={btnStyle("#7c2d12","#fb923c")}>Flag</button>}
            <button style={btnStyle("#450a0a","#f87171")}>Remove</button>
          </>}
        />
      </SectionCard>
    </div>
  );
}

// ── Articles ───────────────────────────────────────────────
function ArticlesPage() {
  const [showEditor, setShowEditor] = useState(false);
  const [contentTab, setContentTab] = useState("articles");
  const [statusFilter, setStatusFilter] = useState("All");
  const [title, setTitle]   = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("Watch 101");
  const [status, setStatus] = useState("Draft");
  const [featured, setFeatured] = useState(false);

  if (showEditor) {
    return (
      <div>
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:20 }}>
          <button onClick={()=>setShowEditor(false)} style={{ ...btnStyle(C.card,C.textMuted), padding:"6px 12px" }}>← Back</button>
          <h2 style={{ color:C.text, fontSize:18, fontWeight:600, margin:0 }}>Create New Article</h2>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 280px", gap:16 }}>
          {/* Editor */}
          <div>
            <SectionCard style={{ padding:16, marginBottom:16 }}>
              <input placeholder="Article title..." value={title} onChange={e=>setTitle(e.target.value)}
                style={{ width:"100%", background:"transparent", border:"none", fontSize:20, fontWeight:600, color:C.text, outline:"none", padding:"4px 0", boxSizing:"border-box" }} />
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginTop:12 }}>
                <Input placeholder="Slug เช่น rolex-steel-vs-gold" />
                <Input placeholder="Excerpt สำหรับ Board card" />
              </div>
            </SectionCard>
            <SectionCard style={{ padding:16 }}>
              <div style={{ display:"flex", gap:6, marginBottom:12, flexWrap:"wrap" }}>
                {["Bold","Italic","H1","H2","H3","Quote","List","Link","Image","Video"].map(t => (
                  <button key={t} style={{ ...btnStyle("#2a2a2a",C.textMuted), padding:"4px 10px", fontSize:12 }}>{t}</button>
                ))}
              </div>
              <textarea placeholder="เขียนเนื้อหาบทความที่นี่..." value={content} onChange={e=>setContent(e.target.value)}
                style={{ width:"100%", minHeight:320, background:"transparent", border:"none", color:C.text, fontSize:14, outline:"none", resize:"vertical", lineHeight:1.7, boxSizing:"border-box" }} />
            </SectionCard>
            <SectionCard style={{ padding:16, marginTop:16 }}>
              <h3 style={{ color:C.text, fontSize:14, fontWeight:600, margin:"0 0 12px" }}>Board Detail Enhancements</h3>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                <Input placeholder="Quote Highlight" />
                <Input placeholder="Read Time เช่น 5 min" />
                <Input placeholder="SEO Title" />
                <Input placeholder="SEO Description" />
                <Input placeholder="Related Articles IDs เช่น AR001, AR002" style={{ gridColumn:"1 / -1" }} />
              </div>
            </SectionCard>
          </div>
          {/* Sidebar */}
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            <SectionCard style={{ padding:14 }}>
              <div style={{ fontSize:12, color:C.textMuted, marginBottom:8, fontWeight:600 }}>STATUS</div>
              <select value={status} onChange={e=>setStatus(e.target.value)}
                style={{ width:"100%", background:C.bg, border:`1px solid ${C.border}`, borderRadius:6, padding:"7px 10px", color:C.text, fontSize:13 }}>
                <option>Draft</option><option>Published</option><option>Scheduled</option><option>Archived</option>
              </select>
              {status === "Scheduled" && (
                <input type="datetime-local"
                  style={{ width:"100%", marginTop:8, background:C.bg, border:`1px solid ${C.border}`, borderRadius:6, padding:"7px 10px", color:C.text, fontSize:13, boxSizing:"border-box" }} />
              )}
            </SectionCard>
            <SectionCard style={{ padding:14 }}>
              <div style={{ fontSize:12, color:C.textMuted, marginBottom:8, fontWeight:600 }}>CATEGORY</div>
              <select value={category} onChange={e=>setCategory(e.target.value)}
                style={{ width:"100%", background:C.bg, border:`1px solid ${C.border}`, borderRadius:6, padding:"7px 10px", color:C.text, fontSize:13 }}>
                {["Watch 101","Watch Brands","Watch Apparel","Watch Events","Watch Market","Journal Board","Trending Now"].map(c=>(
                  <option key={c}>{c}</option>
                ))}
              </select>
            </SectionCard>
            <SectionCard style={{ padding:14 }}>
              <div style={{ fontSize:12, color:C.textMuted, marginBottom:8, fontWeight:600 }}>COVER IMAGE</div>
              <div style={{ border:`2px dashed ${C.border}`, borderRadius:6, padding:"20px 12px", textAlign:"center", color:C.textDim, fontSize:12, cursor:"pointer" }}>
                Drop image here<br/>or click to upload
              </div>
              <Input placeholder="Cover image alt text" style={{ width:"100%", minWidth:0, marginTop:8 }} />
            </SectionCard>
            <SectionCard style={{ padding:14 }}>
              <div style={{ fontSize:12, color:C.textMuted, marginBottom:8, fontWeight:600 }}>AUTHOR</div>
              <select style={{ width:"100%", background:C.bg, border:`1px solid ${C.border}`, borderRadius:6, padding:"7px 10px", color:C.text, fontSize:13 }}>
                <option>Tuk Daeng</option><option>Admin</option>
              </select>
            </SectionCard>
            <SectionCard style={{ padding:14 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <div>
                  <div style={{ fontSize:12, color:C.text, fontWeight:500 }}>Featured Article</div>
                  <div style={{ fontSize:11, color:C.textMuted }}>แสดงเป็น Banner ใหญ่บน Board</div>
                </div>
                <div onClick={()=>setFeatured(!featured)} style={{
                  width:36, height:20, borderRadius:10, cursor:"pointer", transition:"background 0.2s",
                  background:featured?C.accent:C.border, position:"relative"
                }}>
                  <div style={{ position:"absolute", top:3, left:featured?18:3, width:14, height:14, borderRadius:"50%", background:"#fff", transition:"left 0.2s" }} />
                </div>
              </div>
            </SectionCard>
            {featured && (
              <SectionCard style={{ padding:14 }}>
                <div style={{ fontSize:12, color:C.textMuted, marginBottom:8, fontWeight:600 }}>FEATURED ORDER</div>
                <input type="number" min="1" placeholder="1"
                  style={{ width:"100%", background:C.bg, border:`1px solid ${C.border}`, borderRadius:6, padding:"7px 10px", color:C.text, fontSize:13, boxSizing:"border-box" }} />
              </SectionCard>
            )}
            <button style={{ ...btnStyle(C.accent,"#fff"), padding:"10px", fontSize:14, width:"100%", borderRadius:6 }}>Publish Article</button>
            <button style={{ ...btnStyle("#713f12","#fbbf24"), padding:"8px", fontSize:13, width:"100%", borderRadius:6 }}>Schedule Publish</button>
            <button style={{ ...btnStyle(C.border,C.textMuted), padding:"8px", fontSize:13, width:"100%", borderRadius:6 }}>Save as Draft</button>
            <button style={{ ...btnStyle("#1e3a5f","#60a5fa"), padding:"8px", fontSize:13, width:"100%", borderRadius:6 }}>Preview as FO</button>
          </div>
        </div>
      </div>
    );
  }

  const filtered = statusFilter === "All" ? ARTICLES : ARTICLES.filter(a => a.status === statusFilter);

  return (
    <div>
      <PageHeader title="Articles" subtitle="Content ที่แสดงบนหน้า Board ใน FO — Admin เท่านั้นที่สร้างได้"
        actions={<button onClick={()=>setShowEditor(true)} style={{ ...btnStyle(C.accent,"#fff"), padding:"8px 16px", fontSize:13, borderRadius:6 }}>+ New Article</button>}
      />
      <div style={{ display:"flex", gap:8, marginBottom:16, flexWrap:"wrap" }}>
        {[
          { id:"articles", label:"Articles" },
          { id:"categories", label:"Categories" },
          { id:"banners", label:"Board Banners" },
          { id:"analytics", label:"Board Analytics" },
        ].map(t => (
          <button key={t.id} onClick={()=>setContentTab(t.id)} style={{
            ...btnStyle(contentTab===t.id?C.accent:C.card, contentTab===t.id?"#fff":C.textMuted),
            padding:"6px 14px", fontSize:13, borderRadius:6, border:`1px solid ${contentTab===t.id?C.accent:C.border}`
          }}>{t.label}</button>
        ))}
      </div>

      {contentTab === "articles" && <>
      <div style={{ display:"flex", gap:8, marginBottom:16, flexWrap:"wrap" }}>
        {["All","Published","Draft","Scheduled","Archived"].map(s => (
          <button key={s} onClick={()=>setStatusFilter(s)} style={{
            ...btnStyle(statusFilter===s?C.accent:C.card, statusFilter===s?"#fff":C.textMuted),
            padding:"6px 14px", fontSize:13, borderRadius:6, border:`1px solid ${statusFilter===s?C.accent:C.border}`
          }}>{s}</button>
        ))}
      </div>
      <SectionCard style={{ overflow:"hidden" }}>
        <Table
          columns={[
            { key:"id",     label:"ID" },
            { key:"title",  label:"Title" },
            { key:"slug",  label:"Slug" },
            { key:"category", label:"Category" },
            { key:"author", label:"Author" },
            { key:"publishAt",   label:"Publish" },
            { key:"readTime", label:"Read" },
            { key:"featured", label:"Featured", render:v=>v ? <Badge>Published</Badge> : <span style={{color:C.textDim}}>—</span> },
            { key:"views",  label:"Views",  render:v=>v.toLocaleString() },
            { key:"likes",  label:"Likes",  render:v=>v.toLocaleString() },
            { key:"shares",  label:"Shares",  render:v=>v.toLocaleString() },
            { key:"status", label:"Status", render:v=><Badge>{v}</Badge> },
          ]}
          data={filtered}
          actionButtons={row => <>
            <button style={btnStyle("#1e3a5f","#60a5fa")}>Edit</button>
            <button style={btnStyle("#2a2a2a","#ddd")}>Preview FO</button>
            {row.status==="Published"
              ? <button style={btnStyle("#713f12","#fbbf24")}>Unpublish</button>
              : <button style={btnStyle("#1a3322","#4ade80")}>Publish</button>}
            <button style={btnStyle("#450a0a","#f87171")}>Delete</button>
          </>}
        />
      </SectionCard>
      </>}

      {contentTab === "categories" && (
        <SectionCard style={{ overflow:"hidden" }}>
          <Table
            columns={[
              { key:"name", label:"Category" },
              { key:"slug", label:"Slug" },
              { key:"order", label:"Display Order" },
              { key:"articles", label:"Articles" },
              { key:"status", label:"Status", render:v=><Badge>{v}</Badge> },
            ]}
            data={[
              { name:"Watch 101", slug:"watch-101", order:1, articles:14, status:"Active" },
              { name:"Watch Brands", slug:"watch-brands", order:2, articles:18, status:"Active" },
              { name:"Watch Market", slug:"watch-market", order:3, articles:9, status:"Active" },
              { name:"Watch Events", slug:"watch-events", order:4, articles:3, status:"Active" },
            ]}
            actionButtons={() => <>
              <button style={btnStyle("#1e3a5f","#60a5fa")}>Edit</button>
              <button style={btnStyle("#713f12","#fbbf24")}>Inactive</button>
            </>}
          />
        </SectionCard>
      )}

      {contentTab === "banners" && (
        <SectionCard style={{ overflow:"hidden" }}>
          <Table
            columns={[
              { key:"id", label:"ID" },
              { key:"title", label:"Title" },
              { key:"position", label:"Position" },
              { key:"start", label:"Start" },
              { key:"end", label:"End" },
              { key:"ctr", label:"CTR" },
              { key:"status", label:"Status", render:v=><Badge>{v}</Badge> },
            ]}
            data={BOARD_BANNERS}
            actionButtons={() => <>
              <button style={btnStyle("#1e3a5f","#60a5fa")}>Preview</button>
              <button style={btnStyle("#1a3322","#4ade80")}>Edit</button>
            </>}
          />
        </SectionCard>
      )}

      {contentTab === "analytics" && (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12 }}>
          {[
            { label:"Article Views", value:"82,400", change:"+22%" },
            { label:"Unique Readers", value:"28,910", change:"+11%" },
            { label:"Avg Read Time", value:"4.2 min", change:"+0.4 min" },
            { label:"Banner CTR", value:"8.4%", change:"+1.1pp" },
          ].map((m,i) => (
            <SectionCard key={i} style={{ padding:"14px 16px" }}>
              <div style={{ fontSize:12, color:C.textMuted, marginBottom:8 }}>{m.label}</div>
              <div style={{ fontSize:22, fontWeight:700, color:C.text }}>{m.value}</div>
              <div style={{ fontSize:12, color:C.green, marginTop:4 }}>{m.change}</div>
            </SectionCard>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Market Data ────────────────────────────────────────────
function MarketDataPage() {
  const [tab, setTab] = useState("brands");
  const brands = [
    { name:"Patek Philippe",  country:"Switzerland", founded:1839, models:48, status:"Active" },
    { name:"Rolex",           country:"Switzerland", founded:1905, models:62, status:"Active" },
    { name:"Audemars Piguet", country:"Switzerland", founded:1875, models:35, status:"Active" },
    { name:"IWC Schaffhausen",country:"Switzerland", founded:1868, models:29, status:"Active" },
    { name:"Omega",           country:"Switzerland", founded:1848, models:58, status:"Active" },
  ];
  const priceIndex = [
    { brand:"Patek Philippe",  model:"Nautilus 5711/1A",  ref:"5711/1A-010", price:"฿1,150,000 – ฿1,300,000", change:"+4.2%", up:true  },
    { brand:"Rolex",           model:"Submariner Date",   ref:"126610LN",    price:"฿320,000 – ฿380,000",     change:"-1.1%", up:false },
    { brand:"Audemars Piguet", model:"Royal Oak 15202",   ref:"15202ST",     price:"฿2,200,000 – ฿2,600,000", change:"+2.8%", up:true  },
  ];

  return (
    <div>
      <PageHeader title="Market Data" subtitle="ข้อมูล Brands, Models, Price Index — ใช้ใน Autocomplete และ Search Filter ของ FO" />
      <div style={{ display:"flex", gap:8, marginBottom:16 }}>
        {[["brands","Watch Brands"],["models","Watch Models"],["priceindex","Price Index"]].map(([id,label]) => (
          <button key={id} onClick={()=>setTab(id)} style={{
            ...btnStyle(tab===id?C.accent:C.card, tab===id?"#fff":C.textMuted),
            padding:"6px 14px", fontSize:13, borderRadius:6, border:`1px solid ${tab===id?C.accent:C.border}`
          }}>{label}</button>
        ))}
        <button style={{ ...btnStyle(C.accent,"#fff"), padding:"6px 14px", fontSize:13, borderRadius:6, marginLeft:"auto" }}>+ Add New</button>
      </div>

      <SectionCard style={{ overflow:"hidden" }}>
        {tab === "brands" && (
          <Table
            columns={[
              { key:"name",    label:"Brand Name" },
              { key:"country", label:"Country" },
              { key:"founded", label:"Founded" },
              { key:"models",  label:"Models" },
              { key:"status",  label:"Status", render:v=><Badge>{v}</Badge> },
            ]}
            data={brands}
            actionButtons={()=><>
              <button style={btnStyle("#1a3322","#4ade80")}>Edit</button>
              <button style={btnStyle("#450a0a","#f87171")}>Delete</button>
            </>}
          />
        )}
        {tab === "models" && (
          <div style={{ padding:24, color:C.textMuted, textAlign:"center" }}>
            <div style={{ fontSize:32, marginBottom:8 }}>📦</div>
            เลือก Brand เพื่อดู Models
          </div>
        )}
        {tab === "priceindex" && (
          <div style={{ padding:16 }}>
            <div style={{ fontSize:12, color:C.textMuted, marginBottom:12 }}>
              ราคาตลาดนี้แสดงใน Watch Price Index และ Asset Value Dashboard ของผู้ใช้ FO
            </div>
            {priceIndex.map((p,i) => (
              <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"12px 0", borderBottom:`1px solid ${C.border}` }}>
                <div>
                  <div style={{ fontSize:14, color:C.text, fontWeight:500 }}>{p.brand} {p.model}</div>
                  <div style={{ fontSize:12, color:C.textMuted }}>Ref. {p.ref}</div>
                </div>
                <div style={{ textAlign:"right" }}>
                  <div style={{ fontSize:14, color:C.text }}>{p.price}</div>
                  <div style={{ fontSize:12, color:p.up?C.green:"#f87171" }}>{p.change} (30d)</div>
                </div>
                <button style={{ ...btnStyle("#1a3322","#4ade80"), padding:"5px 12px", fontSize:12, marginLeft:16 }}>Update Price</button>
              </div>
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  );
}

// ── Directory ──────────────────────────────────────────────
function DirectoryPage() {
  const [category, setCategory] = useState("All");
  const categories = ["All","Watch Shops","Accessories Shops","Repair Shops","Auction Centers","Consignment Centers","Authentication Centers"];
  const items = [
    { name:"Vintage Watch BKK",    category:"Watch Shops",    province:"Bangkok", phone:"02-123-4567", status:"Active"   },
    { name:"Watch Tools Pro",      category:"Repair Shops",   province:"Bangkok", phone:"081-234-5678",status:"Active"   },
    { name:"Thai Watch Auction",   category:"Auction Centers",province:"Chiang Mai",phone:"053-111-222",status:"Active"  },
    { name:"The Consign House",    category:"Consignment Centers",province:"Bangkok",phone:"089-999-0000",status:"Inactive"},
    { name:"Auth Center Thailand", category:"Authentication Centers",province:"Bangkok",phone:"02-999-8888",status:"Active"},
  ];
  const filtered = category === "All" ? items : items.filter(i => i.category === category);

  return (
    <div>
      <PageHeader title="Directory Management" subtitle="ร้านค้า/บริการที่แสดงในเมนู FO"
        actions={<button style={{ ...btnStyle(C.accent,"#fff"), padding:"8px 16px", fontSize:13, borderRadius:6 }}>+ Add New</button>}
      />
      <FilterBar>
        <Select onChange={e=>setCategory(e.target.value)}>
          {categories.map(c=><option key={c}>{c}</option>)}
        </Select>
        <Select><option>All Status</option><option>Active</option><option>Inactive</option></Select>
        <Input placeholder="ค้นหาชื่อร้าน..." style={{ flex:1 }} />
      </FilterBar>
      <SectionCard style={{ overflow:"hidden" }}>
        <Table
          columns={[
            { key:"name",     label:"Name" },
            { key:"category", label:"Category" },
            { key:"province", label:"Province" },
            { key:"phone",    label:"Phone" },
            { key:"status",   label:"Status", render:v=><Badge>{v}</Badge> },
          ]}
          data={filtered}
          actionButtons={()=><>
            <button style={btnStyle("#1e3a5f","#60a5fa")}>View</button>
            <button style={btnStyle("#1a3322","#4ade80")}>Edit</button>
            <button style={btnStyle("#450a0a","#f87171")}>Delete</button>
          </>}
        />
      </SectionCard>
    </div>
  );
}

// ── Notifications ──────────────────────────────────────────
function NotificationsPage() {
  const [schedule, setSchedule] = useState("Send Immediately");
  return (
    <div>
      <PageHeader title="Push Notifications" subtitle="Broadcast ถึงผู้ใช้ FO"
        actions={<button style={{ ...btnStyle(C.accent,"#fff"), padding:"8px 16px", fontSize:13, borderRadius:6 }}>+ New Notification</button>}
      />
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
        {/* Create */}
        <SectionCard style={{ padding:16 }}>
          <h3 style={{ color:C.text, fontSize:14, fontWeight:600, margin:"0 0 14px" }}>Create Broadcast</h3>
          {[
            { label:"Title (max 50 chars)", type:"input" },
            { label:"Body (max 150 chars)", type:"textarea" },
          ].map((f,i) => (
            <div key={i} style={{ marginBottom:12 }}>
              <label style={{ fontSize:12, color:C.textMuted, display:"block", marginBottom:4 }}>{f.label}</label>
              {f.type==="input"
                ? <input style={{ width:"100%", background:C.bg, border:`1px solid ${C.border}`, borderRadius:6, padding:"7px 10px", color:C.text, fontSize:13, outline:"none", boxSizing:"border-box" }} />
                : <textarea rows={3} style={{ width:"100%", background:C.bg, border:`1px solid ${C.border}`, borderRadius:6, padding:"7px 10px", color:C.text, fontSize:13, outline:"none", resize:"vertical", boxSizing:"border-box" }} />
              }
            </div>
          ))}
          <div style={{ marginBottom:12 }}>
            <label style={{ fontSize:12, color:C.textMuted, display:"block", marginBottom:4 }}>Target Audience</label>
            <select style={{ width:"100%", background:C.bg, border:`1px solid ${C.border}`, borderRadius:6, padding:"7px 10px", color:C.text, fontSize:13 }}>
              <option>All Users</option>
              <option>Users with Watch Alert (Brand)</option>
              <option>Users Active in last 7 days</option>
              <option>Users with For Sale Assets</option>
              <option>Users with Collection Show</option>
            </select>
          </div>
          <div style={{ marginBottom:12 }}>
            <label style={{ fontSize:12, color:C.textMuted, display:"block", marginBottom:4 }}>Schedule</label>
            <select value={schedule} onChange={e=>setSchedule(e.target.value)}
              style={{ width:"100%", background:C.bg, border:`1px solid ${C.border}`, borderRadius:6, padding:"7px 10px", color:C.text, fontSize:13 }}>
              <option>Send Immediately</option>
              <option>Scheduled</option>
            </select>
          </div>
          {schedule === "Scheduled" && (
            <div style={{ marginBottom:12 }}>
              <label style={{ fontSize:12, color:C.textMuted, display:"block", marginBottom:4 }}>Schedule Date-Time</label>
              <input type="datetime-local"
                style={{ width:"100%", background:C.bg, border:`1px solid ${C.border}`, borderRadius:6, padding:"7px 10px", color:C.text, fontSize:13, boxSizing:"border-box" }} />
            </div>
          )}
          <button style={{ ...btnStyle(C.accent,"#fff"), padding:"9px", width:"100%", fontSize:13, borderRadius:6 }}>Send Notification</button>
        </SectionCard>

        {/* History */}
        <SectionCard style={{ padding:16 }}>
          <h3 style={{ color:C.text, fontSize:14, fontWeight:600, margin:"0 0 14px" }}>Recent Broadcasts</h3>
          {[
            { title:"Rolex Price Update Q4",        sent:"12,480", opened:"3,241", rate:"26%", ctr:"8%",  date:"2 days ago" },
            { title:"New Patek Listings Alert",      sent:"5,200",  opened:"1,890", rate:"36%", ctr:"14%", date:"5 days ago" },
            { title:"Weekend Feature: IWC Pilot",    sent:"12,480", opened:"2,100", rate:"17%", ctr:"5%",  date:"1 week ago" },
          ].map((n,i) => (
            <div key={i} style={{ padding:"10px 0", borderBottom:i<2?`1px solid ${C.border}`:"none" }}>
              <div style={{ fontSize:13, color:C.text, fontWeight:500, marginBottom:6 }}>{n.title}</div>
              <div style={{ display:"flex", gap:12, fontSize:12, flexWrap:"wrap" }}>
                <span style={{ color:C.textMuted }}>Sent: <span style={{ color:C.text }}>{n.sent}</span></span>
                <span style={{ color:C.textMuted }}>Opened: <span style={{ color:C.green }}>{n.opened}</span></span>
                <span style={{ color:C.textMuted }}>Rate: <span style={{ color:C.amber }}>{n.rate}</span></span>
                <span style={{ color:C.textMuted }}>CTR: <span style={{ color:C.blue }}>{n.ctr}</span></span>
              </div>
              <div style={{ fontSize:11, color:C.textDim, marginTop:4 }}>{n.date}</div>
            </div>
          ))}
        </SectionCard>
      </div>
    </div>
  );
}

// ── Reports ────────────────────────────────────────────────
function ReportsPage() {
  const [activeReport, setActiveReport] = useState("user");
  const reports = [
    { id:"user",    label:"User Report" },
    { id:"asset",   label:"Asset Report" },
    { id:"txn",     label:"Transaction Report" },
    { id:"content", label:"Content Report" },
    { id:"search",  label:"Search Report" },
    { id:"alert",   label:"Watch Alert Report" },
  ];

  const reportData = {
    user: [
      { metric:"New Users (Today)",     value:"48",    change:"+12%",  up:true  },
      { metric:"DAU",                   value:"3,241",  change:"+5.2%", up:true  },
      { metric:"MAU",                   value:"8,920",  change:"+8.1%", up:true  },
      { metric:"Email/Password Users",  value:"8,240 (66%)", change:"—", up:true },
      { metric:"Apple Sign-In Users",   value:"1,350 (11%)", change:"—", up:true },
      { metric:"Google Sign-In Users",  value:"2,890 (23%)", change:"—", up:true },
    ],
    asset: [
      { metric:"Total Assets",          value:"3,847",  change:"+12.4%", up:true  },
      { metric:"Status: Sale",          value:"2,410",  change:"+9%",    up:true  },
      { metric:"Status: Collection Show",value:"890",   change:"+3%",    up:true  },
      { metric:"Status: Collection Hide",value:"340",   change:"+1%",    up:true  },
      { metric:"Status: Sold",          value:"207",    change:"+18%",   up:true  },
      { metric:"Avg. Asset Price",      value:"฿842K",  change:"-1.2%",  up:false },
    ],
    txn: [
      { metric:"Offers Made (Today)",   value:"246",   change:"+3.1%",  up:true  },
      { metric:"Offers Accepted",       value:"89",    change:"+8%",    up:true  },
      { metric:"Offers Declined",       value:"112",   change:"-2%",    up:true  },
      { metric:"Acceptance Rate",       value:"36.2%", change:"+1.4pp", up:true  },
      { metric:"Avg. Deal Value",       value:"฿520K", change:"+2.1%",  up:true  },
    ],
    content: [
      { metric:"Total Articles",        value:"48",    change:"+4",     up:true  },
      { metric:"Total Views (30d)",     value:"82,400",change:"+22%",   up:true  },
      { metric:"Top Article Views",     value:"4,820", change:"Perpetual Calendar", up:true },
      { metric:"Avg. Read Time",        value:"4.2 min",change:"—",     up:true  },
    ],
    search: [
      { metric:"Top Keyword",           value:"Rolex",          change:"4,820 searches", up:true },
      { metric:"2nd Keyword",           value:"Patek Philippe",  change:"3,240 searches", up:true },
      { metric:"Top Filter",            value:"Brand + Price",   change:"1,890 uses",     up:true },
      { metric:"Avg. Filters Applied",  value:"2.3",             change:"+0.2",           up:true },
    ],
    alert: [
      { metric:"Active Watch Alerts",   value:"5,240",  change:"+340",  up:true  },
      { metric:"Top Alert Brand",       value:"Rolex",   change:"1,820 alerts", up:true },
      { metric:"Alert Trigger Rate",    value:"12.4%",   change:"+1.1pp",up:true  },
      { metric:"Alert → Click Rate",    value:"8.2%",    change:"+0.5pp",up:true  },
    ],
  };

  const current = reportData[activeReport] || [];

  return (
    <div>
      <PageHeader title="Reports & Analytics"
        actions={<button style={{ ...btnStyle("#1a3322","#4ade80"), padding:"8px 14px", fontSize:13 }}>Export CSV</button>}
      />
      <div style={{ display:"flex", gap:8, marginBottom:20, flexWrap:"wrap" }}>
        {reports.map(r => (
          <button key={r.id} onClick={()=>setActiveReport(r.id)} style={{
            ...btnStyle(activeReport===r.id?C.accent:C.card, activeReport===r.id?"#fff":C.textMuted),
            padding:"6px 14px", fontSize:13, borderRadius:6, border:`1px solid ${activeReport===r.id?C.accent:C.border}`
          }}>{r.label}</button>
        ))}
      </div>

      {/* Date Range */}
      <FilterBar>
        {["Today","7 Days","30 Days","Custom"].map(d => (
          <button key={d} style={{ ...btnStyle(d==="30 Days"?C.accent:C.card, d==="30 Days"?"#fff":C.textMuted), padding:"6px 12px", fontSize:12, borderRadius:6 }}>{d}</button>
        ))}
      </FilterBar>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12 }}>
        {current.map((item,i) => (
          <SectionCard key={i} style={{ padding:"14px 16px" }}>
            <div style={{ fontSize:12, color:C.textMuted, marginBottom:8 }}>{item.metric}</div>
            <div style={{ fontSize:20, fontWeight:700, color:C.text }}>{item.value}</div>
            <div style={{ fontSize:12, color:item.up?C.green:"#f87171", marginTop:4 }}>{item.change}</div>
          </SectionCard>
        ))}
      </div>
    </div>
  );
}

// ── Audit Log ──────────────────────────────────────────────
function AuditLogPage() {
  return (
    <div>
      <PageHeader title="Audit Log" subtitle="บันทึกทุก Action ของ Admin — Super Admin เท่านั้นที่เข้าถึงได้"
        actions={<button style={{ ...btnStyle("#1a3322","#4ade80"), padding:"8px 14px", fontSize:13 }}>Export CSV</button>}
      />
      <FilterBar>
        <Select><option>All Roles</option><option>Super Admin</option><option>Content Admin</option><option>Moderator</option><option>Support Admin</option><option>Market Admin</option></Select>
        <Select><option>All Actions</option><option>Create</option><option>Update</option><option>Delete</option><option>Suspend</option><option>Publish</option></Select>
        <Input placeholder="ค้นหา Admin / Entity..." style={{ flex:1 }} />
      </FilterBar>
      <SectionCard style={{ overflow:"hidden" }}>
        <Table
          columns={[
            { key:"id",     label:"Log ID" },
            { key:"admin",  label:"Admin" },
            { key:"role",   label:"Role",   render:v=><span style={{ fontSize:12, color:C.textMuted }}>{v}</span> },
            { key:"action", label:"Action", render:v=><span style={{ color:C.amber, fontSize:12, fontWeight:500 }}>{v}</span> },
            { key:"entity", label:"Entity" },
            { key:"time",   label:"Time" },
          ]}
          data={AUDIT_LOGS}
          actionButtons={()=><button style={btnStyle("#1e3a5f","#60a5fa")}>Details</button>}
        />
      </SectionCard>
    </div>
  );
}

// ── Generic ────────────────────────────────────────────────
function GenericPage({ title }) {
  return (
    <div style={{ padding:"40px 0", textAlign:"center" }}>
      <div style={{ fontSize:40, marginBottom:12 }}>🚧</div>
      <div style={{ color:C.text, fontSize:16, fontWeight:500 }}>{title}</div>
      <div style={{ color:C.textMuted, fontSize:13, marginTop:6 }}>Module อยู่ระหว่างการพัฒนา</div>
    </div>
  );
}

// ── App Shell ──────────────────────────────────────────────
export default function TukDaengBO() {
  const [active, setActive]       = useState("dashboard");
  const [collapsed, setCollapsed] = useState(false);

  const pages = {
    dashboard:     <DashboardPage />,
    users:         <UsersPage />,
    assets:        <AssetsPage />,
    articles:      <ArticlesPage />,
    market:        <MarketDataPage />,
    directory:     <DirectoryPage />,
    notifications: <NotificationsPage />,
    reports:       <ReportsPage />,
    auditlog:      <AuditLogPage />,
    settings:      <GenericPage title="Admin Settings" />,
  };

  return (
    <div style={{ display:"flex", height:"100vh", background:C.bg, fontFamily:"'Sarabun','Inter',sans-serif", overflow:"hidden" }}>

      {/* Sidebar */}
      <div style={{ width:collapsed?56:220, background:C.sidebar, borderRight:`1px solid ${C.border}`,
        display:"flex", flexDirection:"column", flexShrink:0, transition:"width 0.2s ease", overflow:"hidden" }}>

        {/* Logo */}
        <div style={{ padding:"16px 16px 12px", borderBottom:`1px solid ${C.border}`, display:"flex", alignItems:"center", justifyContent:collapsed?"center":"space-between" }}>
          {!collapsed && (
            <div>
              <span style={{ color:C.accent, fontWeight:800, fontSize:16, letterSpacing:"-0.03em" }}>ตึกแดง</span>
              <span style={{ color:C.textMuted, fontSize:11, display:"block" }}>Back Office v1.1</span>
            </div>
          )}
          <button onClick={()=>setCollapsed(!collapsed)}
            style={{ background:"none", border:"none", color:C.textMuted, cursor:"pointer", padding:4, fontSize:16, lineHeight:1 }}>
            {collapsed?"→":"←"}
          </button>
        </div>

        {/* Nav */}
        <nav style={{ flex:1, padding:"8px 0", overflowY:"auto" }}>
          {NAV_ITEMS.map(item => (
            <button key={item.id} onClick={()=>setActive(item.id)} style={{
              width:"100%", display:"flex", alignItems:"center", gap:10,
              padding:collapsed?"10px 16px":"9px 16px",
              background:active===item.id?"#2a0a0a":"transparent",
              border:"none", borderLeft:active===item.id?`2px solid ${C.accent}`:"2px solid transparent",
              color:active===item.id?C.accent:C.textMuted,
              cursor:"pointer", fontSize:13, fontWeight:active===item.id?600:400,
              textAlign:"left", whiteSpace:"nowrap", transition:"all 0.15s",
              justifyContent:collapsed?"center":"flex-start",
            }}>
              <span style={{ fontSize:16, flexShrink:0 }}>{item.icon}</span>
              {!collapsed && <span>{item.label}</span>}
            </button>
          ))}
        </nav>

        {/* Admin user */}
        <div style={{ padding:12, borderTop:`1px solid ${C.border}`, display:"flex", alignItems:"center", gap:8 }}>
          <div style={{ width:30, height:30, borderRadius:"50%", background:C.accent, display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:700, color:"#fff", flexShrink:0 }}>S</div>
          {!collapsed && (
            <div style={{ overflow:"hidden" }}>
              <div style={{ fontSize:12, color:C.text, fontWeight:500, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>Super Admin</div>
              <div style={{ fontSize:10, color:C.textMuted }}>admin@tukdaeng.com</div>
            </div>
          )}
        </div>
      </div>

      {/* Main content */}
      <main style={{ flex:1, overflowY:"auto", padding:"24px 28px" }}>
        {pages[active] || <GenericPage title={active} />}
      </main>
    </div>
  );
}
