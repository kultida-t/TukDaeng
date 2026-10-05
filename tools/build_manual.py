# -*- coding: utf-8 -*-
"""Generate Univerza_Tukdaeng_User_Manual.html — rulebook-style Thai manual from real app screenshots."""
import html, os

SS = "../screenshots/user-manual"
OUT = os.path.join(os.path.dirname(__file__), "..", "deliverables", "Univerza_Tukdaeng_User_Manual.html")

def esc(s): return html.escape(s, quote=False)

_fig_n = [0]
def fig(fname, caption, persp="", tall=False):
    _fig_n[0] += 1
    p = f'<span class="chip chip-{persp}">{persp}</span>' if persp else ""
    cls = "phone tall" if tall else "phone"
    return f'''<figure class="shot">
  <img class="{cls}" src="{SS}/{fname}" alt="{esc(caption)}">
  <figcaption><span class="figno">ภาพที่ {_fig_n[0]}</span>{p}{esc(caption)}</figcaption>
</figure>'''

def page(title_en, title_th, body, chapter=None, subtitle=""):
    ch = f'<div class="chno">บทที่ {chapter:02d}</div>' if chapter else ""
    sub = f'<div class="psub">{subtitle}</div>' if subtitle else ""
    return f'''<section class="page">
  <header class="phead">{ch}
    <div><h2>{esc(title_th)}</h2><div class="en">{esc(title_en)}</div></div>
    <div class="brand">TUK&nbsp;DAENG</div>
  </header>{sub}
  <div class="pbody">{body}</div>
  <footer class="pfoot"><span>Univerza Tukdaeng — คู่มือการใช้งาน v1.0</span><span class="pgnum"></span></footer>
</section>'''

def row(*figs): return '<div class="figrow">' + "".join(figs) + '</div>'
def note(txt, kind="note"):
    return f'<div class="{kind}">{txt}</div>'
def para(txt): return f'<p class="lead">{txt}</p>'
def steps(items):
    return '<ol class="steps">' + "".join(f'<li>{i}</li>' for i in items) + '</ol>'

pages = []

# ---------- COVER ----------
pages.append('''<section class="page cover">
  <div class="cov-rule"></div>
  <div class="cov-brand">TUK DAENG</div>
  <div class="cov-title">คู่มือการใช้งาน<br>แอปพลิเคชัน<br><span>Univerza Tukdaeng</span></div>
  <div class="cov-sub">ฉบับผู้ใช้งาน · ภาพหน้าจอจริงจากแอปพลิเคชัน 100%<br>ครอบคลุมมุมมอง Guest / Member / Owner / Buyer / Seller</div>
  <div class="cov-meta">
    <div><b>เวอร์ชัน</b> 1.0</div>
    <div><b>วันที่ออก</b> 5 ตุลาคม 2569</div>
    <div><b>อ้างอิงแอป</b> v1.0.1 (Android)</div>
    <div><b>อ้างอิงสเปก</b> FrontOffice PRD v1.3</div>
  </div>
  <div class="cov-rule b"></div>
</section>''')

# ---------- TOC ----------
toc_items = [
 ("0","วิธีใช้คู่มือนี้และมุมมองผู้ใช้"),("1","เริ่มต้นใช้งาน: สมัคร เข้าสู่ระบบ ลืมรหัสผ่าน"),
 ("2","โหมดผู้เยี่ยมชม (Guest)"),("3","ฟีดสินทรัพย์"),("4","ค้นหา ตัวกรอง และเรียงลำดับ"),
 ("5","หน้ารายละเอียดสินทรัพย์"),("6","จัดการสินทรัพย์ของฉัน (Owner)"),
 ("7","ข้อเสนอซื้อ (Offer) ทั้งสองฝั่ง"),("8","แชท"),("9","โปรไฟล์และการติดตาม"),
 ("10","ศูนย์การแจ้งเตือน"),("11","Watch Alert"),("12","กระดานข่าว (Board)"),
 ("13","การตั้งค่าและบัญชี"),("14","สถานะพิเศษ ข้อผิดพลาด และข้อจำกัด"),
 ("15","ภาคผนวก: รายงานความครอบคลุมภาพหน้าจอ"),
]
toc_rows = "".join(f'<tr><td class="tno">บทที่ {n}</td><td>{esc(t)}</td></tr>' for n,t in toc_items)
pages.append(page("Contents","สารบัญ",
    f'<table class="toc">{toc_rows}</table>' +
    note('คู่มือนี้จัดพิมพ์ในแนวนอน (A4 Landscape) — ภาพหน้าจอทั้งหมดถ่ายจากแอปจริงบน Android (หน้าจอ 1080×2400) ด้วยบัญชีทดสอบ 2 บัญชีที่โต้ตอบกันจริง ไม่มีภาพจำลองหรือภาพที่สร้างขึ้นเอง')))

# ---------- CH0 perspectives ----------
body = para('แอป Univerza Tukdaeng เป็นแพลตฟอร์มซื้อขาย/จัดแสดงนาฬิกา ที่สิทธิ์การใช้งานเปลี่ยนตาม "มุมมอง" ของผู้ใช้ต่อรายการนั้น — คู่มือนี้จึงแท็กภาพทุกภาพด้วยมุมมอง เพื่อเปรียบเทียบความต่างให้ชัดเจน')
body += '''<table class="cmp">
<tr><th>มุมมอง</th><th>คือใคร</th><th>ทำอะไรได้บ้าง</th><th>ทำอะไรไม่ได้</th></tr>
<tr><td><span class="chip chip-G">G</span> Guest</td><td>ยังไม่ได้เข้าสู่ระบบ</td><td>ดูฟีด ค้นหา เปิดรายละเอียดสินทรัพย์ อ่านบทความ ดูโปรไฟล์สาธารณะ</td><td>กดถูกใจ/คอมเมนต์/ติดตาม/เสนอราคา/แชท/สร้าง Watch Alert — ทุกอันขึ้นหน้าต่าง "เข้าสู่ระบบหรือสมัครสมาชิก"</td></tr>
<tr><td><span class="chip chip-M">M</span> Member</td><td>สมาชิกที่ยืนยันอีเมลแล้ว</td><td>ทุกอย่างของ Guest + ถูกใจ คอมเมนต์ ติดตาม แชท เสนอราคา Watch Alert แจ้งเตือน เพิ่มสินทรัพย์</td><td>—</td></tr>
<tr><td><span class="chip chip-O">O</span> Owner</td><td>Member เมื่อดู "สินทรัพย์ของตัวเอง"</td><td>แก้ไขรายการ เปลี่ยนสถานะ บันทึกการขาย แก้ที่มา ลบรายการ ดูมูลค่าสินทรัพย์รวม</td><td>ไม่มีปุ่ม เสนอราคา/ติดต่อผู้ขาย บนรายการตัวเอง</td></tr>
<tr><td><span class="chip chip-B">B</span> Buyer</td><td>Member เมื่อส่งข้อเสนอรายการของคนอื่น</td><td>ส่งข้อเสนอพร้อมข้อความ เห็นสถานะการ์ดข้อเสนอในแชท</td><td>—</td></tr>
<tr><td><span class="chip chip-S">S</span> Seller</td><td>Owner เมื่อมีคนเสนอราคารายการของตัวเอง</td><td>เห็นการ์ดข้อเสนอพร้อมปุ่ม ยอมรับ / ปฏิเสธ ในแชทและในการแจ้งเตือน</td><td>—</td></tr>
</table>'''
body += note('<b>ข้อตกลงการอ่าน:</b> เลข "ภาพที่ n" เรียงตามลำดับการปรากฏ · ข้อความในกรอบสีแดงอ่อนคือข้อจำกัดที่ตรวจพบจริงหรือสถานะที่จัดทำเป็น "คำอธิบาย" แทนภาพหน้าจอ')
pages.append(page("Perspectives","มุมมองผู้ใช้งานของแอป", body, chapter=0))

# ---------- CH1 onboarding/auth ----------
body = para('เมื่อเปิดแอปครั้งแรกจะพบ Splash → แนะนำแอป → หน้าเลือกวิธีเข้าใช้: <b>เข้าสู่ระบบ</b> / <b>สมัครสมาชิก</b> / <b>สำรวจนาฬิกา</b> (เข้าโหมด Guest ได้โดยไม่ต้องมีบัญชี)')
body += row(fig("00-splash.png","Splash เมื่อเปิดแอป","G"),
          fig("00-onboarding-1.png","หน้าแนะนำแอป (Welcome)","G"),
          fig("00-onboarding-2.png","แนะนำฟีเจอร์พอร์ตสินทรัพย์","G"),
          fig("00-onboarding-3.png","แนะนำฟีเจอร์การแจ้งเตือน/Watch Alert","G"),
          fig("00-entry.png","หน้าเลือกเข้าใช้ — \"สำรวจนาฬิกา\" = Guest","G"))
body += steps([
 'แค่อยากดูนาฬิกา → แตะ <b>สำรวจนาฬิกา</b> เข้าโหมด Guest ได้ทันที',
 'สมาชิกใหม่ → <b>สมัครสมาชิก</b> ด้วยอีเมล+รหัสผ่าน แล้วยืนยัน OTP',
 'มีบัญชีแล้ว → <b>เข้าสู่ระบบ</b> ด้วยอีเมล+รหัสผ่าน หรือ Sign in with Google',
 'หลังเข้าสู่ระบบจะเข้าสู่หน้าฟีดหลักของแอปทันที'])
pages.append(page("Onboarding","เปิดแอปครั้งแรกและหน้าเลือกเข้าใช้", body, chapter=1))

body = para('<b>สมัครสมาชิก:</b> กรอกอีเมล รหัสผ่าน ยืนยันรหัสผ่าน ติ๊กยอมรับข้อกำหนด → ระบบส่ง <b>รหัส OTP 6 หลัก</b> ทางอีเมล (หมดอายุใน 30 นาที มีปุ่ม "ส่งรหัสใหม่") → ยืนยันสำเร็จเริ่มใช้งานได้ทันที')
body += row(fig("01-signup.png","ฟอร์มสมัครสมาชิก (ว่าง)","G"),
          fig("01-signup-filled.png","กรอกครบ + ยอมรับข้อกำหนด → ปุ่มสมัครใช้งานได้","G"),
          fig("01-otp.png","กรอก OTP 6 หลักที่ส่งไปยังอีเมล","G"),
          fig("01-otp-success.png","ยืนยันอีเมลสำเร็จ → เริ่มต้นใช้งาน","G"))
body += para('<b>เข้าสู่ระบบ:</b> รองรับอีเมล+รหัสผ่าน และ Google — มี "จดจำอุปกรณ์นี้เป็นเวลา 30 วัน" และลิงก์ "ลืมรหัสผ่าน"')
body += row(fig("01-signin.png","หน้าเข้าสู่ระบบ","G"),
          fig("01-signin-error.png","อีเมล/รหัสผ่านไม่ถูกต้อง → แบนเนอร์แดง","G"),
          fig("01-signin-wrongmethod.png","บัญชี Google + รหัสผ่าน → ข้อความเดียวกัน (ไม่เปิดเผยวิธีที่ถูก)","G"))
pages.append(page("Sign Up & Sign In","สมัครสมาชิกและเข้าสู่ระบบ", body, chapter=1))

body = para('<b>ลืมรหัสผ่าน:</b> กรอกอีเมล → ระบบส่งลิงก์รีเซ็ต (ขึ้นข้อความกลางๆ ไม่บอกว่าอีเมลมีจริงไหม) → ลิงก์หมดอายุใน 30 นาที → เปิดลิงก์ในอีเมลเพื่อตั้งรหัสผ่านใหม่ · <b>ออกจากระบบ</b> อยู่ในหน้าตั้งค่าและมีหน้าต่างยืนยัน')
body += row(fig("01-forgot.png","หน้าลืมรหัสผ่าน","G"),
          fig("01-forgot-filled.png","กรอกอีเมลแล้ว → ปุ่มส่งใช้งานได้","G"),
          fig("01-forgot-sent.png","ส่งลิงก์รีเซ็ตแล้ว (อีเมลถูกปิดบางบางส่วน)","G"),
          fig("13-change-password.png","เปลี่ยนรหัสผ่านในแอป — เฉพาะบัญชีอีเมล+รหัสผ่าน","M"),
          fig("01-signout-confirm.png","ยืนยันออกจากระบบ","M"))
body += note('<b>สังเกต:</b> บัญชีที่สมัครด้วย Google/Apple <b>ไม่มีเมนู "เปลี่ยนรหัสผ่าน"</b> ในตั้งค่า เพราะไม่มีรหัสผ่านของแอป — เปลี่ยนได้ที่บัญชี Google โดยตรง')
pages.append(page("Password & Session","ลืมรหัสผ่าน เซสชัน และออกจากระบบ", body, chapter=1))

# ---------- CH2 guest ----------
body = para('โหมด Guest เห็นเนื้อหาสาธารณะเกือบทั้งหมด — ฟีด ค้นหา รายละเอียดสินทรัพย์ กระดานข่าว — แต่ <b>ทุกการกระทำที่ต้องมีตัวตน</b> (ถูกใจ คอมเมนต์ ติดตาม เสนอราคา แชท แจ้งเตือน เพิ่มสินทรัพย์) จะถูกหน้าต่างเดียวกันบังทันที')
body += row(fig("02-feed-guest.png","ฟีดในโหมด Guest — เห็นการ์ดปกติ","G"),
          fig("03-search-result-guest.png","Guest ค้นหาได้เต็มรูปแบบ","G"),
          fig("05-assetdetail-guest.png","Guest เปิดรายละเอียดได้ — เห็นปุ่มทั้งหมดแต่กดไม่ได้","G"),
          fig("12-board-guest.png","Guest อ่านกระดานข่าวได้","G"))
body += row(fig("00-login-required-feed.png","หน้าต่าง \"เข้าสู่ระบบหรือสมัครสมาชิก\" — ปรากฏเหมือนกันทุกจุด","G"),
          fig("05-guest-loginwall.png","กดถูกใจ/คอมเมนต์บนหน้ารายการ → หน้าต่างเดียวกัน","G"),
          fig("07-chat-login.png","แตะแท็บแชท → หน้าต่างเดียวกัน","G"),
          fig("09-noti-login.png","แตะแท็บแจ้งเตือน → หน้าต่างเดียวกัน","G"))
body += note('ในคู่มือนี้ใช้ภาพหน้าต่างเดิมเป็นตัวแทนทุก trigger เพราะยืนยันแล้วว่า UI เหมือนกันทุกจุด — ปุ่ม "ยังก่อน" ปิดหน้าต่างและอยู่โหมด Guest ต่อได้')
pages.append(page("Guest Mode","โหมดผู้เยี่ยมชม (ไม่ต้องเข้าสู่ระบบ)", body, chapter=2))

# ---------- CH3 feed ----------
body = para('ฟีดคือหน้าหลัก — แถบบนมีโลโก้ ปุ่ม <b>Watch Alert</b> ปุ่ม <b>+</b> (เพิ่มสินทรัพย์) และช่องค้นหา; แท็บสามอัน: <b>All</b> / <b>Following</b> / <b>Favorites</b> — เมนู … บนการ์ดเปลี่ยนตามว่ารายการนั้นเป็นของเราหรือของคนอื่น')
body += row(fig("02-feed-member.png","ฟีดของ Member — การ์ดพร้อมเมนู … และปุ่ม Follow","M"),
          fig("02-feed-card.png","กายวิภาคของการ์ด: รูป แบรนด์ รุ่น ราคา เวลา เจ้าของ ยอดถูกใจ/คอมเมนต์","M"),
          fig("00-bottom-nav-member.png","แถบนำทางล่าง: ฟีด / แชท / กระดานข่าว / แจ้งเตือน / โปรไฟล์","M"),
          fig("11-following-feed.png","แท็บ Following — รายการของผู้ขายที่ติดตามแล้ว","M"),
          fig("02-feed-empty-following.png","แท็บ Following เมื่อยังไม่ได้ติดตามใคร","M"),
          fig("02-feed-favorites.png","แท็บ Favorites — รายการที่กดถูกใจ","M"))
body += row(fig("02-feed-empty-favorites.png","Favorites เมื่อยังไม่มีรายการที่ถูกใจ","M"),
          fig("02-feed-end.png","เลื่อนจนสุด → \"คุณดูรายการทั้งหมดแล้ว\"","M"),
          fig("11-like.png","กดถูกใจรายการ → หัวใจเต็มและยอดเพิ่ม","M"),
          fig("02-feed-menu-viewer.png","เมนู … บนรายการของคนอื่น: ซ่อน / แชร์ / บล็อก / รายงาน","M"),
          fig("02-feed-menu-owner.png","เมนู … บนรายการของตัวเอง: แก้ไข / ที่มา / ขายแล้ว / สถานะ / แชร์ / ลบ","O"),
          fig("02-feed-hide-undo.png","กด \"ซ่อนสินทรัพย์นี้\" → แถบ \"เลิกทำ\" ให้กู้คืน","M"))
pages.append(page("Asset Feed","ฟีดสินทรัพย์", body, chapter=3))

# ---------- CH4 search ----------
body = para('ค้นหาจากช่องค้นหาบนฟีด → พิมพ์คำแล้วกดยืนยัน → หน้าผลลัพธ์มีจำนวนผล ปุ่ม <b>ตัวกรอง</b> และไอคอนเรียงลำดับ — ไอคอนนาฬิกาบนหน้าผลใช้สร้าง Watch Alert จากเงื่อนไขนั้นได้')
body += row(fig("03-search-result.png","ผลการค้นหา \"Rolex\" — แสดงจำนวนผล","M"),
          fig("03-filter.png","แผ่นตัวกรอง: แบรนด์ รุ่น ราคา ปี เลขอ้างอิง สภาพ ฯลฯ","M"),
          fig("03-filter-dependent.png","ตัวกรองผูกกัน — เลือกแบรนด์แล้วเหลือเฉพาะรุ่นแบรนด์นั้น","M"),
          fig("03-filter-applied.png","ใช้ตัวกรองแล้ว — ชิป Rolex + ตัวเลขบนปุ่ม","M"))
body += row(fig("03-sort.png","เรียงลำดับ: ความเกี่ยวข้อง / ราคา / ใหม่ล่าสุด","M"),
          fig("03-search-empty.png","ไม่พบผล → \"ไม่พบข้อมูล\"","M"),
          fig("10-watchalert-create.png","ไอคอนนาฬิกาบนหน้าผล → สร้าง Watch Alert จากเงื่อนไขนี้","M"),
          fig("03-search-error.png","ค้นหาขณะออฟไลน์ → \"กรุณาลองใหม่อีกครั้ง\" + ปุ่มลองใหม่","M"))
body += note('<b>ข้อจำกัดที่ตรวจพบ:</b> ในเวอร์ชันนี้ช่องค้นหาไม่มีเมนูคำแนะนำ (autocomplete) ขณะพิมพ์ — พิมพ์คำแล้วกดยืนยันเพื่อดูผลเท่านั้น')
pages.append(page("Search, Filter & Sort","ค้นหา ตัวกรอง และเรียงลำดับ", body, chapter=4))

# ---------- CH5 asset detail ----------
body = para('หน้ารายละเอียดสินทรัพย์เปลี่ยนตามมุมมอง: <b>Viewer</b> เห็นปุ่มเสนอราคา/ติดต่อผู้ขาย · <b>Owner</b> เห็นปุ่มแก้ไข/ทำเครื่องหมายว่าขายแล้ว และข้อมูลที่มาส่วนตัว · <b>Guest</b> เห็นทุกอย่างแต่กดไม่ได้')
body += '''<table class="cmp">
<tr><th>ส่วนบนหน้า</th><th>Guest</th><th>Viewer</th><th>Owner</th></tr>
<tr><td>ปุ่มล่าง</td><td>เห็นแต่กด → login wall</td><td>เสนอราคา + ติดต่อผู้ขาย</td><td>แก้ไข + ทำเครื่องหมายว่าขายแล้ว</td></tr>
<tr><td>แถวผู้ขาย + Follow</td><td>เห็น (กด→wall)</td><td>เห็น + กด Follow ได้</td><td>—</td></tr>
<tr><td>ที่มาของสินทรัพย์/ราคาซื้อ</td><td>ไม่เห็น</td><td>ไม่เห็น</td><td>เห็น (ข้อมูลส่วนตัว)</td></tr>
<tr><td>ถูกใจ / คอมเมนต์</td><td>ดูจำนวนได้ กดไม่ได้</td><td>ใช้งานได้เต็ม</td><td>ใช้งานได้เต็ม + ตอบกลับคอมเมนต์</td></tr>
</table>'''
body += row(fig("05-assetdetail-viewer.png","Viewer: ป้าย SALE แดง + เสนอราคา/ติดต่อผู้ขาย + Follow","M"),
          fig("05-assetdetail-viewer-liked.png","Viewer หลังกดถูกใจ/ติดตาม — หัวใจเต็ม + Following","M"),
          fig("05-assetdetail-owner.png","Owner: แถบล่างเป็น แก้ไข/ขายแล้ว — ไม่มีปุ่มเสนอราคา","O"),
          fig("05-assetdetail-viewer-show.png","รายการป้าย SHOW (น้ำเงิน) — แสดงเพื่ออวด แต่ยังเสนอราคาได้","M"),
          fig("08-offer-show.png","แถบล่างของรายการ Show — เสนอราคา/ติดต่อผู้ขายเหมือนกัน","M"))
pages.append(page("Asset Detail — Perspectives","หน้ารายละเอียดสินทรัพย์แยกตามมุมมอง", body, chapter=5))

body = para('แตะรูปสินทรัพย์เพื่อดูแกลเลอรีเต็มจอ (เลื่อนซ้ายขวาดูทุกรูป) — ส่วนความคิดเห็นอยู่ด้านล่าง รองรับการตอบกลับหนึ่งชั้น และลบ/รายงานคอมเมนต์ผ่านเมนู …')
body += row(fig("05-gallery-viewer.png","แกลเลอรีเต็มจอ (เลื่อนดูทุกรูป)","M"),
          fig("00-image-viewer.png","ภาพซูมเต็มจอของสินทรัพย์","M"),
          fig("05-comments-empty.png","ส่วนความคิดเห็นเมื่อยังว่าง + ช่องพิมพ์","M"),
          fig("05-comments-sheet.png","คอมเมนต์จริงจากผู้ใช้อื่น + ปุ่มตอบกลับ/เมนู","M"),
          fig("11-comment.png","คอมเมนต์ที่เพิ่งโพสต์ขึ้นแสดงทันที","M"))
body += row(fig("05-comment-reply.png","เจ้าของรายการตอบกลับคอมเมนต์ (ย่อหน้าเยื้องเข้า)","O"),
          fig("05-comment-actions.png","เมนู … ของคอมเมนต์ตัวเอง","M"),
          fig("05-comment-delete.png","ยืนยันลบความคิดเห็น","M"),
          fig("05-comment-deleted.png","ลบแล้ว — แถบ \"ความคิดเห็นนี้ถูกลบแล้ว\"","M"),
          fig("05-report-asset.png","เมนู … → \"รายงานโพสต์\": เหตุผล + รายละเอียด","M"),
          fig("05-offer-entry.png","จุดเริ่มเสนอราคา — ปุ่ม \"เสนอราคา\" บนรายการ Sale","M"))
body += note('<b>ข้อจำกัดที่ตรวจพบ:</b> ตัวเลขยอดถูกใจไม่ใช่ปุ่มในเวอร์ชันนี้ (ไม่มีหน้า "รายชื่อคนถูกใจ") · ปุ่มแชร์ไม่เปิดแผ่นแชร์ของระบบบนตัวจำลอง — ทั้งสองจุดเขียนอธิบายแทนภาพ')
pages.append(page("Gallery, Comments & Actions","แกลเลอรี ความคิดเห็น และการกระทำ", body, chapter=5))

# ---------- CH6 owner asset mgmt ----------
body = para('เพิ่มสินทรัพย์จากปุ่ม <b>+</b> บนฟีด — ฟอร์มบังคับกรอก: รูปภาพ (สูงสุด 10 รูป) แบรนด์ รุ่น ปี สภาพ สถานะ และที่มาของสินทรัพย์')
body += steps([
 'แตะกล่อง "เพิ่มรูปภาพ" → เลือกรูปจากเครื่อง (เลือกได้หลายรูป) → ครอบ/หมุนภาพในแอป → เสร็จสิ้น',
 'เลือก <b>แบรนด์</b> จากลิสต์ตัวอักษร → <b>รุ่น &amp; ซีรีส์</b> จะแสดงเฉพาะรุ่นของแบรนด์นั้น (มีตัวเลือก "อื่น ๆ / เพิ่มรุ่น")',
 'เลือกปีจากตัวเลือกวันที่ (ปฏิทินไทย) → กรอกราคา (ระบบใส่ comma ให้อัตโนมัติ) คำอธิบาย และสภาพ',
 'เลือกสถานะ <b>ขาย / แสดง / ซ่อน</b> → ขั้นที่มา: เป็นเจ้าของเอง (กรอกราคาซื้อ/วันที่ซื้อ) หรือฝากขาย',
 'กดบันทึก → ยืนยัน "เพิ่มรายการนี้?" → อัปโหลด → สำเร็จ'])
body += row(fig("04-add-asset-form.png","ฟอร์มเพิ่มสินทรัพย์ — แกลเลอรี 0/10 + ฟิลด์หลัก","O"),
          fig("04-add-asset-images.png","กล่องเพิ่มรูปภาพก่อนเลือกรูป","O"),
          fig("04-add-asset-form2.png","ฟอร์มส่วนล่าง — ราคา คำอธิบาย การขายและการจัดแสดง","O"),
          fig("04-add-validation.png","กดบันทึกโดยยังไม่ครบ → กรอบแดงทุกฟิลด์บังคับ","O"))
pages.append(page("Add Asset — Form","เพิ่มสินทรัพย์: ฟอร์มและการตรวจสอบ", body, chapter=6))

body = para('เลือกรูปจากเครื่องได้ทีละหลายรูป → ครอบ/หมุนในแอปทีละรูป → แกลเลอรีเติม (รูปแรกเป็นภาพหลัก) — ตัวเลือกแบรนด์/รุ่น/วันที่เป็นลิสต์มาตรฐานของระบบ')
body += row(fig("04-add-asset-picker.png","ตัวเลือกรูปจากเครื่อง — เลือกได้ทีละหลายรูป","O"),
          fig("04-add-asset-crop.png","ครอบ/หมุนในแอป — สลับรูปด้วยตัวเลข 1/2","O"),
          fig("04-add-asset-gallery-filled.png","แกลเลอรีเติมแล้ว 2/10 รูป — รูปแรกเป็นภาพหลัก","O"))
body += row(fig("04-add-brand-picker.png","เลือกแบรนด์จากมาสเตอร์ลิสต์","O"),
          fig("04-add-model-picker.png","รุ่น & ซีรีส์ — แสดงเฉพาะของแบรนด์ที่เลือก + เพิ่มรุ่นเองได้","O"),
          fig("04-add-datepicker.png","ตัวเลือกวันที่ซื้อ (ปฏิทินภาษาไทย)","O"))
pages.append(page("Add Asset — Images & Pickers","เพิ่มสินทรัพย์: รูปภาพและตัวเลือก", body, chapter=6))

body = para('สถานะรายการ: <b>ขาย</b> (แสดงในฟีดและเสนอราคาได้) · <b>แสดง</b> (โชว์ในคอลเลกชัน) · <b>ซ่อน</b> (ส่วนตัว คนอื่นไม่เห็น) — ขั้นสุดท้ายกรอกที่มาของสินทรัพย์แล้วยืนยัน')
body += row(fig("04-add-asset-status.png","เลือกสถานะ: ขาย / แสดง / ซ่อน","O"),
          fig("04-add-asset-provenance.png","ขั้นที่มา — แท็บ เจ้าของ/ฝากขาย + ราคาซื้อ วันที่ซื้อ เอกสาร","O"),
          fig("04-add-confirm.png","ยืนยันก่อนบันทึก","O"),
          fig("04-add-uploading.png","กำลังอัปโหลดรายการ","O"),
          fig("04-add-success.png","สำเร็จ — \"เพิ่มรายการแล้ว\" + เปิดหน้ารายการโหมด Owner","O"))
body += note('ข้อมูลที่มา (ราคาซื้อ/วันที่ซื้อ/เอกสาร) เป็น<b>ข้อมูลส่วนตัวของเจ้าของ</b> — ผู้ชมทั่วไปไม่เห็นส่วนนี้บนหน้ารายละเอียด')
pages.append(page("Add Asset — Provenance & Submit","เพิ่มสินทรัพย์: ที่มาและการยืนยัน", body, chapter=6))

body = para('หลังมีรายการแล้ว Owner จัดการได้จากเมนู … บนการ์ดหรือหน้ารายละเอียด: แก้ไขข้อมูล แก้ที่มา เปลี่ยนสถานะ ทำเครื่องหมายว่าขายแล้ว (บันทึกการขาย) และลบรายการ')
body += row(fig("06-quickactions-owner.png","เมนู … ของ Owner บนการ์ด","O"),
          fig("04-edit-asset.png","ฟอร์มแก้ไข — กรอกค่าเดิมไว้ให้ + ลิงก์ \"ที่มาของสินค้า\"","O"),
          fig("04-edit-provenance.png","หน้าที่มาของสินทรัพย์ (ดู/แก้ไข)","O"),
          fig("04-change-status.png","เปลี่ยนสถานะ — สถานะปัจจุบันถูกเลือกไว้","O"),
          fig("04-sale-record.png","บันทึกการขาย: วันที่ขาย ผู้ซื้อ ช่องทาง ราคา การชำระเงิน","O"),
          fig("04-delete-confirm.png","ยืนยันลบรายการ — ลบแล้วกู้คืนไม่ได้","O"))
body += note('<b>ข้อควรระวัง:</b> การลบรายการไม่มีทางย้อนกลับ · รายการที่ขายแล้วจะเข้า Sold และแก้ไขข้อมูลหลักไม่ได้ (ตามสเปก) — ในชุดภาพนี้เลือกยกเลิกไว้ก่อนยืนยันเพื่อรักษาข้อมูลทดสอบ')
pages.append(page("Manage & Remove Asset","แก้ไข เปลี่ยนสถานะ บันทึกการขาย และลบ", body, chapter=6))

# ---------- CH7 offer ----------
body = para('ผู้ซื้อกด <b>เสนอราคา</b> บนรายการคนอื่น → กรอกราคาที่เสนอ (บาท) + ข้อความถึงผู้ขาย (ไม่บังคับ สูงสุด 500 ตัวอักษร) → ส่ง → ข้อเสนอกลายเป็น "การ์ด" ในห้องแชทกับผู้ขายทันที — <b>Owner ไม่เห็นปุ่มเสนอราคาบนรายการตัวเอง</b>')
body += row(fig("08-no-offer-owner.png","Owner ดูรายการตัวเอง — แถบล่างเป็น แก้ไข/ขายแล้ว ไม่มีเสนอราคา","O"),
          fig("08-make-offer.png","ฟอร์มเสนอราคา — แสดงราคาตั้งเป็นอ้างอิง","B"),
          fig("08-offer-sent.png","ส่งข้อเสนอสำเร็จ → ปุ่ม \"ไปที่แชท\"","B"),
          fig("07-offercard-buyer-pending.png","การ์ดข้อเสนอในแชทฝั่งผู้ซื้อ — สถานะรอผู้ขายตอบ","B"))
pages.append(page("Make an Offer","เสนอราคา — ฝั่งผู้ซื้อ", body, chapter=7))

body = para('ฝั่งผู้ขายได้รับ<b>การแจ้งเตือน</b>ที่กดตอบสนองได้ทันที (ปฏิเสธ / ตรวจสอบข้อเสนอ) และเห็นการ์ดข้อเสนอในแชทพร้อมปุ่ม <b>ยอมรับ / ปฏิเสธ</b> — การกดทั้งสองปุ่มมีผลทันที (ไม่มีหน้าต่างยืนยัน) แล้วระบบแจ้งผู้ซื้ออัตโนมัติ')
body += row(fig("09-notifications.png","ศูนย์แจ้งเตือนของผู้ขาย — การ์ดข้อเสนอพร้อมปุ่มปฏิเสธ/ตรวจสอบ","S"),
          fig("07-offercard-pending.png","การ์ดข้อเสนอที่รอตอบ — ปุ่ม ปฏิเสธ / ยอมรับ","S"),
          fig("07-offercard-accepted-seller.png","กดยอมรับ → \"ยอมรับข้อเสนอแล้ว\" + ราคาสีเขียว","S"),
          fig("07-offercard-declined.png","กดปฏิเสธ → \"ปฏิเสธข้อเสนอแล้ว\" + ราคาขีดฆ่า","S"))
body += row(fig("07-offercard-buyer-declined.png","ผู้ซื้อเห็นการ์ดเดิมสถานะถูกปฏิเสธ + แจ้งเตือน \"ปฏิเสธข้อเสนอของคุณ\"","B"),
          fig("07-offercard-accepted.png","ผู้ซื้อเห็นสถานะยอมรับ (การ์ดจากแชทจริง)","B"),
          fig("07-incoming-empty.png","แท็บ \"ข้อเสนอที่ได้รับ\" — แสดงเฉพาะข้อเสนอที่ยังรอตอบ","S"))
body += note('<b>ที่พบจริง:</b> ข้อเสนอที่ถูกตอบแล้ว (ไม่ว่ายอมรับหรือปฏิเสธ) จะหลุดจากแท็บ "ข้อเสนอที่ได้รับ" เหลือไว้เป็นการ์ดในแชท · สถานะขั้นสูงอย่าง Paused/Invalidated เกิดจากการกำกับดูแลของระบบ (ไม่มีปุ่มให้ผู้ใช้กด) · การ์ดที่อ้างถึงรายการที่ถูกลบจะแสดงเป็นการ์ดว่างไม่มีรูป')
pages.append(page("Offer Lifecycle","ข้อเสนอ — ฝั่งผู้ขายและวงจรสถานะ", body, chapter=7))

# ---------- CH8 chat ----------
body = para('แชทเริ่มจากปุ่ม <b>ติดต่อผู้ขาย</b> — ห้องแชทมีการ์ดอ้างอิงสินทรัพย์ด้านบนเสมอ รองรับข้อความ รูปภาพ และการ์ดข้อเสนอ; แถบล่างสลับ "ทั้งหมด" / "ข้อเสนอที่ได้รับ" (เฉพาะฝั่งที่ได้รับข้อเสนอ)')
body += row(fig("07-chat-empty.png","แท็บแชทเมื่อยังไม่มีห้อง — \"ไม่พบข้อมูล\"","M"),
          fig("07-chat-list.png","รายการแชท — ห้องจริงพร้อมข้อความล่าสุดและเวลา","M"),
          fig("07-chat-first.png","ห้องใหม่ที่เพิ่งเปิดจาก \"ติดต่อผู้ขาย\" — การ์ดอ้างอิง + ช่องพิมพ์","M"),
          fig("07-chat-assetref.png","การ์ดอ้างอิงสินทรัพย์: รูป ชื่อ ราคา ป้ายสถานะ","M"))
body += row(fig("07-chat-room.png","ข้อความส่งแล้ว — ฟองขวา(แดง)คือเรา พร้อมเวลาและสถานะอ่าน","M"),
          fig("07-chat-menu.png","เมนูห้อง …: ลบแชท / ปิดการแจ้งเตือน","M"),
          fig("07-chat-mute.png","ปิดการแจ้งเตือนห้อง — มีไอคอนรูดเสียงในลิสต์","M"),
          fig("07-chat-delete.png","ยืนยันลบแชท (ลบเฉพาะฝั่งเรา)","M"))
body += note('ปุ่มแนบรูป/กล้องอยู่ในช่องพิมพ์ — ในชุดภาพนี้เน้นการ์ดข้อเสนอเป็นหลัก; การ์ดอ้างอิงของรายการที่ถูกลบแล้วจะแสดงเป็นการ์ดว่างพร้อมชื่อ "-" (ดูภาพที่ บทข้อเสนอ)')
pages.append(page("Chat","แชทและการสื่อสารกับผู้ขาย", body, chapter=8))

# ---------- CH9 profile ----------
body = para('โปรไฟล์ของตัวเอง (Owner) แสดงสถิติ <b>Followers / Following / มูลค่าสินทรัพย์</b> และแท็บสินทรัพย์ <b>All / Sale / Show / Hide</b> — โปรไฟล์คนอื่น (Public) เห็นเฉพาะ All/Sale/Show เท่านั้น ไม่มี Hide/Sold และไม่มีมูลค่าสินทรัพย์')
body += row(fig("06-profile-owner.png","โปรไฟล์ตัวเอง — สถิติ 3 ช่อง + แท็บสถานะสินทรัพย์","O"),
          fig("06-owner-tab-all.png","แท็บ All บนโปรไฟล์ตัวเอง — เห็นทุกสถานะ","O"),
          fig("06-profile-empty.png","โปรไฟล์บัญชีใหม่ — ทุกสถิติเป็น 0 + \"ผู้ใช้ใหม่\"","O"),
          fig("06-tab-empty.png","แท็บที่ยังไม่มีรายการ → \"ไม่พบข้อมูล\"","O"))
body += row(fig("06-profile-public.png","โปรไฟล์สาธารณะของผู้ขายคนอื่น — ปุ่ม Follow + ไม่มี Hide/Sold","M"),
          fig("06-public-tab-all.png","แท็บ All บนโปรไฟล์สาธารณะ","M"),
          fig("06-follow.png","กดติดตาม → ปุ่มเปลี่ยนเป็น Following + ยอดผู้ติดตามเพิ่ม","M"),
          fig("06-public-menu.png","เมนู … บนโปรไฟล์คนอื่น: แชร์ / บล็อก / รายงาน","M"),
          fig("06-quickactions-visitor.png","เมนู … บนการ์ดในโปรไฟล์คนอื่น","M"))
pages.append(page("Profiles & Follow","โปรไฟล์และการติดตาม", body, chapter=9))

body = para('เมนู … บนโปรไฟล์ตัวเองมี <b>แชร์โปรไฟล์ / ตั้งค่า</b> — ส่วนโปรไฟล์คนอื่นมี <b>แชร์ / บล็อก / รายงาน</b> · แก้ไขโปรไฟล์เปลี่ยนได้ชื่อผู้ใช้ เบอร์โทร LINE แต่อีเมลถูกล็อกหลังยืนยันแล้ว')
body += row(fig("06-owner-menu.png","เมนู … บนโปรไฟล์ตัวเอง: แชร์โปรไฟล์ / ตั้งค่า","O"),
          fig("06-profile-share.png","แผ่นแชร์โปรไฟล์ — LINE / IG / FB / คัดลอกลิงก์","O"),
          fig("06-edit-profile.png","แก้ไขโปรไฟล์ — อีเมลล็อก (เปลี่ยนไม่ได้หลังยืนยัน)","M"),
          fig("15-report-user.png","รายงานผู้ใช้ — เหตุผล + รายละเอียดเพิ่มเติม","M"),
          fig("15-block-user.png","ยืนยันบล็อกผู้ใช้ — อธิบายผลของการบล็อก","M"))
body += note('<b>พอร์ตสินทรัพย์ (Portfolio):</b> ตามสเปก สถิติ "มูลค่าสินทรัพย์" บนโปรไฟล์ควรพาเข้าสู่แดชบอร์ดพอร์ต — แต่ในเวอร์ชันนี้ตัวเลขไม่ใช่ปุ่มและไม่มีเมนูแยก จึงแสดงเฉพาะตัวเลขรวมบนโปรไฟล์ (จัดเป็นความต่างระหว่างสเปกกับเวอร์ชันที่ทดสอบ) · <b>การบล็อก:</b> ในเวอร์ชันนี้ไม่มีเมนู "เลิกบล็อก" ในแอป จึงควรตัดสินใจก่อนยืนยันบล็อก')
pages.append(page("Profile Actions","การจัดการโปรไฟล์ แชร์ และบล็อก", body, chapter=9))

# ---------- CH10 notifications ----------
body = para('ศูนย์แจ้งเตือนรวมทุกเหตุการณ์ — การ์ดแจ้งเตือนบางประเภทมี<b>ปุ่มกระทำในตัว</b> (ข้อเสนอ: ปฏิเสธ/ตรวจสอบ · ผู้ติดตามใหม่: ติดตามกลับ) และแตะแจ้งเตือนเพื่อกระโดดไปยังจุดปลายทาง')
body += row(fig("09-notifications.png","ศูนย์แจ้งเตือน — ข้อเสนอ / คอมเมนต์ / ติดตาม / ถูกใจ จริงทั้งหมด","M"),
          fig("09-noti-declined.png","แจ้งเตือนฝั่งผู้ซื้อ: \"ปฏิเสธข้อเสนอของคุณ\"","B"),
          fig("09-noti-watchalert.png","แจ้งเตือน Watch Alert: พบรายการใหม่ตรงเงื่อนไข","M"),
          fig("09-noti-banner.png","แบนเนอร์แจ้งเตือนแบบเรียลไทม์ขณะใช้แอปอยู่","M"),
          fig("09-noti-destination.png","แตะแจ้งเตือน → เปิดจุดปลายทาง (ผล Watch Alert)","M"))
body += row(fig("09-notifications-empty.png","ยังไม่มีแจ้งเตือน → \"ไม่พบข้อมูล\"","M"),
          fig("13-notification-settings.png","ตั้งค่าการแจ้งเตือน — สวิตช์แยกตามประเภท (บันทึกอัตโนมัติ)","M"))
pages.append(page("Notification Center","ศูนย์การแจ้งเตือน", body, chapter=10))

# ---------- CH11 watch alert ----------
body = para('Watch Alert คือการตั้ง "เงื่อนไขค้นหาที่เฝ้าดู" — สร้างจากไอคอนนาฬิกาบนหน้าผลค้นหา ตั้งชื่อและสวิตช์แจ้งเตือน; เมื่อมีรายการใหม่เข้าเงื่อนไข ระบบส่งแจ้งเตือนและเปิดดูผลลัพธ์ได้')
body += row(fig("10-watchalert-create.png","สร้าง Watch Alert — ตั้งชื่อ + สวิตช์แจ้งเตือน","M"),
          fig("10-watchalert-created.png","สร้างสำเร็จ — ลิงก์ไปหน้าจัดการ","M"),
          fig("10-watchalert-list.png","รายการเฝ้าดู — สวิตช์เปิด/ปิด + เปลี่ยนชื่อ + ลบ","M"))
body += row(fig("10-watchalert-edit.png","เปลี่ยนชื่อการแจ้งเตือน","M"),
          fig("10-watchalert-delete.png","ยืนยันลบ Watch Alert","M"),
          fig("10-watchalert-result.png","ผลลัพธ์ที่ตรงเงื่อนไข — เข้าจากการแจ้งเตือน","M"))
body += note('<b>ข้อจำกัดที่ตรวจพบ:</b> ในเวอร์ชันนี้แถวรายการในหน้าลิสต์ไม่เปิดหน้าผลลัพธ์เมื่อแตะโดยตรง — วิธีเข้าดูผลที่ใช้ได้จริงคือผ่านการแจ้งเตือนที่ระบบส่งมา')
pages.append(page("Watch Alert","Watch Alert — เฝ้าดูรายการที่ตรงเงื่อนไข", body, chapter=11))

# ---------- CH12 board ----------
body = para('กระดานข่าวเปิดให้อ่านทั้ง Guest และ Member — หน้าหลักมีบทความเด่น + กลุ่มหมวด; ไอคอนเมนูซ้ายบนเปิดลิ้นชักหมวดหมู่ (Journal Board / Watch Brands / Watch 101 ฯลฯ) และไอคอนแว่นขยายค้นหาบทความ')
body += row(fig("12-board.png","หน้ากระดานข่าว — บทความเด่น + Trending","M"),
          fig("12-board-section-1.png","เลื่อนลง — กลุ่มหมวดบทความ","M"),
          fig("12-board-section-2.png","กลุ่มหมวดส่วนล่างของหน้า Board","M"),
          fig("12-article-filter.png","ลิ้นชักหมวดหมู่บทความ","M"),
          fig("12-board-brands.png","หมวด Watch Brands — ลิสต์แบรนด์","M"),
          fig("12-article-search.png","ค้นหาบทความ — \"5 ผลลัพธ์สำหรับ Rolex\"","M"))
body += row(fig("12-article-detail.png","หน้าบทความ — รูปหลัก หัวข้อ เนื้อหา ยอดถูกใจ ปุ่มแชร์/เมนู","M"),
          fig("12-article-like.png","กดถูกใจบทความ (เฉพาะ member — guest ขึ้น login wall)","M"),
          fig("12-article-menu.png","เมนู … บนบทความ","M"),
          fig("12-article-empty.png","ค้นหาไม่พบ → \"ไม่พบข้อมูล\"","M"),
          fig("12-article-report.png","รายงานบทความ: เลือกเหตุผล + รายละเอียด","M"))
body += note('<b>ข้อจำกัดที่ตรวจพบ:</b> ปุ่มแชร์บทความไม่เปิดแผ่นแชร์ของระบบบนตัวจำลอง — ฟังก์ชันแชร์จึงอธิบายเป็นข้อความ')
pages.append(page("News Board","กระดานข่าวและบทความ", body, chapter=12))

# ---------- CH13 settings ----------
body = para('ตั้งค่าอยู่ที่เมนู … บนโปรไฟล์ตัวเอง — แบ่งกลุ่ม: บัญชี / แอปและสื่อ / ข้อมูลและการสนับสนุน / ออกจากระบบ')
body += row(fig("13-settings.png","หน้าตั้งค่า — รายการทั้งหมด (บัญชี SSO ไม่มีเมนูเปลี่ยนรหัสผ่าน)","M"),
          fig("13-edit-profile.png","แก้ไขโปรไฟล์: ชื่อผู้ใช้ เบอร์โทร LINE — อีเมลล็อก","M"),
          fig("13-about-account.png","เกี่ยวกับบัญชี — รูป ชื่อ วันที่สมัคร + ลบบัญชี","M"),
          fig("13-language.png","ภาษา — English / ไทย","M"),
          fig("13-theme.png","ธีม — โหมดมืด / โหมดสว่าง","M"))
body += row(fig("13-notification-settings.png","ตั้งค่าแจ้งเตือน 5 ประเภท","M"),
          fig("13-help.png","ช่วยเหลือ — ช่องทางติดต่อฝ่ายสนับสนุน","M"),
          fig("13-privacy.png","นโยบายความเป็นส่วนตัว (อ่านในแอป)","M"),
          fig("13-terms.png","ข้อกำหนดการใช้งาน","M"),
          fig("13-about.png","เกี่ยวกับแอป — เวอร์ชัน 1.0.1","M"))
pages.append(page("Settings","การตั้งค่าและบัญชี", body, chapter=13))

body = para('การลบบัญชีอยู่ใน "เกี่ยวกับบัญชีของคุณ" — หน้าต่างยืนยันอธิบายผลกระทบ 4 ข้อก่อนลบ')
body += row(fig("13-delete-confirm.png","ยืนยันลบบัญชี — อธิบายผลกระทบชัดเจน กด ยกเลิก เพื่อออก","M"))
body += note('<b>สถานะหลังลบบัญชี (อธิบายตามสเปก — ไม่ได้ทำลบจริง):</b> หลังยืนยัน ระบบเริ่มกระบวนการลบและมีช่วงผ่อนผัน (grace period) — หากเข้าสู่ระบบช่วงนี้จะเห็นสถานะ "บัญชีกำลังรอการลบ" และสามารถกู้คืนได้; เมื่อพ้นกำหนด บัญชีถูกลบถาวร',"warn")
body += note('<b>บัญชีที่ถูกระงับ/แบน (อธิบายตามสเปก):</b> การระงับบัญชีทำโดยผู้ดูแลระบบฝั่ง Back Office เท่านั้น — ผู้ใช้ที่ถูกระงับจะเข้าสู่ระบบไม่ได้และเห็นข้อความแจ้งสถานะ',"warn")
pages.append(page("Account Deletion","การลบบัญชีและสถานะบัญชีพิเศษ", body, chapter=13))

# ---------- CH14 states ----------
body = para('สถานะเครือข่าย/ข้อมูลที่ควรรู้จัก — แอปมีแบนเนอร์ออฟไลน์และหน้าจอลองใหม่ที่สอดคล้องกันทั้งระบบ')
body += row(fig("00-feed-loading.png","โครงโหลด (skeleton) ขณะรอข้อมูล","M"),
          fig("00-offline-cached.png","ออฟไลน์ + แบนเนอร์ \"คุณกำลังออฟไลน์\" (ข้อมูลเก่ายังดูได้)","M"),
          fig("03-search-error.png","ทำรายการที่ต้องเครือข่ายขณะออฟไลน์ → \"ลองใหม่อีกครั้ง\"","M"),
          fig("02-feed-imgfail.png","รูปการ์ดโหลดไม่สำเร็จ → ช่องภาพว่างเทา","M"),
          fig("07-offercard-assetunavail.png","การ์ดข้อเสนอที่อ้างถึงรายการถูกลบ → การ์ดว่าง ชื่อ \"-\"","M"))
body += '''<table class="cmp">
<tr><th>สถานะ</th><th>พฤติกรรม (ตามสเปก/ที่ตรวจพบ)</th></tr>
<tr><td>รายการถูกลบ/ไม่พร้อมใช้งาน</td><td>เปิดจากลิงก์เก่า → หน้าจอ "รายการนี้ไม่พร้อมใช้งานแล้ว" + ปุ่มย้อนกลับ</td></tr>
<tr><td>เข้าถึงไม่ได้ (Hide/Sold ของคนอื่น)</td><td>deep link ไปยังรายการส่วนตัวของผู้อื่น → หน้าจอปฏิเสธการเข้าถึง</td></tr>
<tr><td>ไม่พบผู้ใช้งาน / โปรไฟล์ถูกบล็อก</td><td>โปรไฟล์ที่ถูกลบ → "ไม่พบผู้ใช้งาน"; ถูกบล็อก → "ไม่สามารถเข้าถึงผู้ใช้งานนี้ได้"</td></tr>
<tr><td>การบล็อกผู้ใช้</td><td>เมนู … บนโปรไฟล์ → บล็อกผู้ใช้ → ยืนยัน — ทั้งสองฝั่งมองไม่เห็นเนื้อหากัน (ในเวอร์ชันนี้ไม่มีเมนูเลิกบล็อกในแอป จึงควรตัดสินใจก่อนยืนยัน)</td></tr>
<tr><td>ส่งข้อความไม่สำเร็จ</td><td>แชทขณะออฟไลน์ → ข้อความติดสถานะส่งไม่สำเร็จ กดลองส่งใหม่ได้</td></tr>
</table>'''
pages.append(page("Edge & Error States","สถานะพิเศษ ข้อผิดพลาด และข้อจำกัด", body, chapter=14))

# ---------- CH15 coverage report ----------
import glob
shot_dir = os.path.join(os.path.dirname(__file__), "..", "screenshots", "user-manual")
used = set()
for m in __import__('re').finditer(r'fig\("([^"]+)"', open(__file__, encoding='utf-8').read()):
    used.add(m.group(1))
captured = sorted(os.path.basename(p) for p in glob.glob(os.path.join(shot_dir, "[0-9]*.png")))

star = '<span class="ok">ใช้ในคู่มือ</span>'
cov_rows = []
groups = {}
for f in captured:
    groups.setdefault(f[:2], []).append(f)
for g in sorted(groups):
    cov_rows.append(f'<tr class="grp"><td colspan="2">โมดูล {g}</td></tr>')
    for f in groups[g]:
        mark = star if f in used else '<span class="dim">ภาพประกอบ/สำรอง</span>'
        cov_rows.append(f'<tr><td class="mono">{f}</td><td>{mark}</td></tr>')

import math
per = math.ceil(len(cov_rows) / 3)
cols = ''.join(f'<table class="cov">{"".join(cov_rows[i*per:(i+1)*per])}</table>' for i in range(3))
body = para(f'จับภาพหน้าจอจริงรวม <b>{len(captured)} ไฟล์</b> — ตารางด้านล่างคือทะเบียนภาพทั้งหมดใน <code>screenshots/user-manual/</code> (รายละเอียดสถานะรายจุดอยู่ใน SCREEN_INVENTORY.md)')
body += f'<div class="covwrap">{cols}</div>'
pages.append(page("Capture Coverage","ภาคผนวก: ทะเบียนภาพหน้าจอทั้งหมด", body, chapter=15))

# ---------- assemble ----------
CSS = '''
@font-face { font-family: 'KanitLocal'; }
:root { --red:#C8102E; --ink:#151515; --grey:#6b6b6b; --line:#e5e0da; --paper:#faf8f5; }
* { margin:0; padding:0; box-sizing:border-box; }
html { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
body { font-family:'Sarabun','Noto Sans Thai','Segoe UI',Tahoma,sans-serif; color:var(--ink); background:#ddd; }
h1,h2,.brand,.chno,.cov-brand,.cov-title,.figno { font-family:'Kanit','Sarabun',sans-serif; }
.page { width:297mm; height:210mm; background:var(--paper); page-break-after:always; break-after:page;
        padding:9mm 13mm 7mm; display:flex; flex-direction:column; position:relative; overflow:hidden; }
@media screen { .page { margin:8mm auto; box-shadow:0 4px 30px rgba(0,0,0,.25);} body{padding:8mm 0} }
.phead { display:flex; align-items:baseline; gap:6mm; border-bottom:2.5px solid var(--ink); padding-bottom:2.5mm; margin-bottom:4mm; }
.phead h2 { font-size:20pt; font-weight:700; letter-spacing:.2px; }
.phead .en { color:var(--red); font-size:9pt; font-weight:600; letter-spacing:1.4px; text-transform:uppercase; margin-top:1mm;}
.chno { background:var(--red); color:#fff; font-size:12pt; font-weight:700; padding:1.8mm 4mm; }
.brand { margin-left:auto; font-size:14pt; font-weight:800; color:var(--red); letter-spacing:2px; }
.psub { color:var(--grey); font-size:9.5pt; margin:-2mm 0 3mm; }
.pbody { flex:1; overflow:hidden; }
.pfoot { display:flex; justify-content:space-between; border-top:1px solid var(--line); padding-top:2mm;
         font-size:8pt; color:var(--grey); }
.pgnum::after { counter-increment:pg; content:counter(pg); }
body { counter-reset: pg; }
.lead { font-size:10pt; line-height:1.6; margin-bottom:3.5mm; max-width:270mm; }
.figrow { display:flex; gap:5mm; margin-bottom:3.5mm; align-items:flex-start; }
.shot { flex:0 0 auto; }
.phone { height:56mm; border:2.2px solid #222; border-radius:4mm; box-shadow:1.5mm 2.5mm 6mm rgba(0,0,0,.18); display:block; }
.phone.tall { height:62mm; }
.shot figcaption { font-size:7.6pt; color:#3d3d3d; margin-top:1.8mm; width:29mm; line-height:1.35; }
.figno { display:inline-block; background:var(--ink); color:#fff; font-size:7pt; font-weight:600; padding:.5mm 1.8mm; margin-right:1.6mm; border-radius:1mm;}
.chip { display:inline-block; font-size:6.5pt; font-weight:700; color:#fff; padding:.4mm 1.6mm; border-radius:1mm; margin-right:1.4mm; vertical-align:1px;}
.chip-G{background:#777}.chip-M{background:#2f5fd0}.chip-O{background:#151515}.chip-B{background:#1a8a4a}.chip-S{background:#c05a10}
.note { border-left:3.5px solid var(--red); background:#f6eaea; padding:2mm 3.5mm; font-size:9pt; line-height:1.55; margin:2.5mm 0; }
.warn { border-left-color:#b8860b; background:#f8f1dd; }
.steps { font-size:9.5pt; line-height:1.65; margin:0 0 3mm 5mm; }
.steps li { margin-bottom:1mm; }
table.cmp { border-collapse:collapse; width:100%; font-size:9pt; margin-bottom:3.5mm; }
.cmp th { background:var(--ink); color:#fff; text-align:left; padding:1.8mm 3mm; font-weight:600;}
.cmp td { border:1px solid var(--line); padding:1.8mm 3mm; vertical-align:top; line-height:1.5;}
.cmp tr:nth-child(even) td { background:#f1eeea; }
table.toc { width:100%; border-collapse:collapse; font-size:11.5pt; }
.toc td { padding:3mm 4mm; border-bottom:1px solid var(--line); }
.toc .tno { color:var(--red); font-weight:700; width:22mm; }
.covwrap { display:flex; gap:5mm; }
.covwrap .cov { flex:1; }
table.cov { border-collapse:collapse; width:33%; font-size:7.2pt; }
.cov td { border-bottom:1px solid #eee; padding:.9mm 1.6mm; }
.cov .grp td { background:var(--ink); color:#fff; font-weight:700; font-size:7.8pt; }
.mono { font-family:Consolas,monospace; }
.ok { color:#1a8a4a; font-weight:600; } .dim{ color:#999; font-size:7pt; }
code { font-family:Consolas,monospace; background:#eee; padding:0 1.5mm; font-size:9pt;}
/* cover */
.cover { background:#141210; color:#f4efe9; justify-content:space-between; padding:18mm 20mm; }
.cov-rule { height:2px; background:var(--red); }
.cov-brand { font-size:15pt; font-weight:800; letter-spacing:6px; color:var(--red); }
.cov-title { font-size:44pt; font-weight:800; line-height:1.25; }
.cov-title span { color:var(--red); }
.cov-sub { font-size:12.5pt; color:#bdb4a9; line-height:1.8; }
.cov-meta { display:flex; gap:14mm; font-size:10pt; color:#bdb4a9; }
.cov-meta b { display:block; color:#f4efe9; margin-bottom:1mm; font-size:8.5pt; letter-spacing:1px; text-transform:uppercase; color:var(--red);}
'''

html_doc = f'''<!DOCTYPE html>
<html lang="th"><head><meta charset="utf-8"><title>Univerza Tukdaeng — คู่มือการใช้งาน v1.0</title>
<link href="https://fonts.googleapis.com/css2?family=Kanit:wght@600;700;800&family=Sarabun:wght@400;500;600&display=swap" rel="stylesheet">
<style>{CSS}</style></head><body>
{''.join(pages)}
</body></html>'''

os.makedirs(os.path.dirname(OUT), exist_ok=True)
with open(OUT, "w", encoding="utf-8") as f:
    f.write(html_doc)
print(f"Wrote {OUT} — {len(pages)} pages, {_fig_n[0]} figures")
