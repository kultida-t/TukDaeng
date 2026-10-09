# -*- coding: utf-8 -*-
"""Insert Assets Value page into user manual + renumber figures + fix wrong note."""
import re, sys

P = r"C:\Users\Admin\Desktop\TukDaeng\deliverables\Univerza_Tukdaeng_User_Manual.html"
s = open(P, encoding="utf-8").read()
orig = s

# --- 1. Renumber figure references: ภาพที่ N -> N+4 for N>=108 (before inserting new figs) ---
def bump(m):
    n = int(m.group(1))
    return f"ภาพที่ {n+4}" if n >= 108 else m.group(0)
s = re.sub(r"ภาพที่ (\d+)", bump, s)

# --- 2. Fix wrong infolist claim on own-profile page ---
old_info = "<li><b>สถิติ 3 ช่อง:</b> Followers / Following / มูลค่าสินทรัพย์</li>"
new_info = "<li><b>สถิติ 3 ช่อง:</b> Followers / Following / มูลค่าสินทรัพย์ — แตะตัวเลขมูลค่าเพื่อเปิดหน้าพอร์ตโฟลิโอ (หน้าถัดไป)</li>"
assert old_info in s, "infolist anchor not found"
s = s.replace(old_info, new_info, 1)

# --- 3. Insert new Assets Value page right after own-profile page ---
anchor = '</section><section class="page fill airy vspread" style="--ph:100mm;--cw:46mm">\n\n  <header class="phead"><div class="chno">บทที่ 09</div>\n    <div><h2>โปรไฟล์คนอื่นและการติดตาม'
assert s.count(anchor) == 1, f"anchor count={s.count(anchor)}"

newpage = '''</section><section class="page fill airy vspread" style="--ph:100mm;--cw:46mm">

  <header class="phead"><div class="chno">บทที่ 09</div>
    <div><h2>มูลค่าสินทรัพย์และพอร์ตโฟลิโอ</h2><div class="en">Assets Value</div></div>
    <div class="brand">TUK&nbsp;DAENG</div>
  </header>

  <div class="pbody"><ul class="infolist"><li><b>ทางเข้า:</b> แตะตัวเลข "มูลค่าสินทรัพย์" บนโปรไฟล์ตัวเอง — เฉพาะเจ้าของบัญชีเท่านั้นที่มีช่องนี้</li><li><b>ส่วนบน:</b> มูลค่าพอร์ตโฟลิโอทั้งหมด / กำไรที่ยังไม่ได้รับ / ผลตอบแทนในปีนี้ พร้อมกราฟแนวโน้มรายเดือน</li><li><b>พอร์ตโฟลิโอแบรนด์:</b> สัดส่วนมูลค่าแยกตามแบรนด์เป็นเปอร์เซ็นต์</li><li><b>สินทรัพย์ทั้งหมด:</b> การ์ดแต่ละชิ้นแสดง ราคาซื้อ / ราคาตลาด / ราคาตั้ง (เฉพาะที่ประกาศขาย) / กำไรสุทธิ +% / เตือนเมื่อราคาตั้งต่ำกว่าตลาด</li></ul><div class="figrow"><figure class="shot">
  <img class="phone" src="../screenshots/user-manual/06-profile-owner-assets-value.png" alt="แตะตัวเลขมูลค่าสินทรัพย์บนโปรไฟล์ตัวเอง → เปิดหน้าพอร์ตโฟลิโอ">
  <figcaption><span class="figno">ภาพที่ 108</span><span class="chip chip-O">O</span>แตะตัวเลขมูลค่าสินทรัพย์บนโปรไฟล์ตัวเอง → เปิดหน้าพอร์ตโฟลิโอ</figcaption>
</figure><figure class="shot">
  <img class="phone" src="../screenshots/user-manual/06-assets-value-top.png" alt="ส่วนบนหน้ามูลค่าทรัพย์สิน: มูลค่ารวม กำไรที่ยังไม่ได้รับ ผลตอบแทนปีนี้ + กราฟแนวโน้ม">
  <figcaption><span class="figno">ภาพที่ 109</span><span class="chip chip-O">O</span>ส่วนบน: มูลค่ารวม / กำไรที่ยังไม่ได้รับ / ผลตอบแทนปีนี้ + กราฟแนวโน้ม</figcaption>
</figure><figure class="shot">
  <img class="phone" src="../screenshots/user-manual/06-assets-value-list.png" alt="พอร์ตโฟลิโอแบรนด์ + รายการสินทรัพย์พร้อมราคาซื้อและราคาตลาด">
  <figcaption><span class="figno">ภาพที่ 110</span><span class="chip chip-O">O</span>พอร์ตโฟลิโอแบรนด์ + รายการสินทรัพย์พร้อมราคาซื้อ/ราคาตลาด</figcaption>
</figure><figure class="shot">
  <img class="phone" src="../screenshots/user-manual/06-assets-value-list2.png" alt="รายการประกาศขายเห็นราคาตั้ง + ป้ายเตือนเปอร์เซ็นต์ต่ำกว่าราคาตลาด">
  <figcaption><span class="figno">ภาพที่ 111</span><span class="chip chip-O">O</span>รายการประกาศขายเห็น "ราคาตั้ง" + ป้ายเตือน % ต่ำกว่าราคาตลาด</figcaption>
</figure></div><div class="note"><b>ความเป็นส่วนตัว:</b> หน้านี้เป็นข้อมูลส่วนตัว เห็นเฉพาะเจ้าของ — โปรไฟล์สาธารณะและ Guest ไม่มีช่องมูลค่าสินทรัพย์และเข้าถึงไม่ได้<br><b>ราคาตลาด:</b> ระบบประเมินจากข้อมูลตลาด — ถ้าบางรายการไม่มีราคาตลาดจะแสดงแถบแจ้ง "ราคาตลาดบางรายการไม่พร้อมใช้งาน" ใต้กราฟ</div></div>
  <footer class="pfoot"><span>Univerza Tukdaeng — คู่มือการใช้งาน v1.0</span><span class="pgnum"></span></footer>
'''
replacement = newpage + '<section class="page fill airy vspread" style="--ph:100mm;--cw:46mm">\n\n  <header class="phead"><div class="chno">บทที่ 09</div>\n    <div><h2>โปรไฟล์คนอื่นและการติดตาม'
s = s.replace(anchor, replacement, 1)

# --- 4. Fix wrong note (line ~683) ---
old_note = "<b>มูลค่าสินทรัพย์:</b> ตัวเลขบนโปรไฟล์เป็นเพียงสถิติรวม แตะไม่ได้ ไม่มีหน้ารายละเอียดแยก"
new_note = "<b>มูลค่าสินทรัพย์:</b> แตะตัวเลขบนโปรไฟล์ตัวเองเพื่อเปิดหน้าพอร์ตโฟลิโอ — ดูหน้า Assets Value (บทที่ 9)"
assert old_note in s, "note anchor not found"
s = s.replace(old_note, new_note, 1)

# --- 5. TOC page numbers: chapters 10-15 shift +1 ---
toc_map = [
    ("บทที่ 10</td><td>การแจ้งเตือน</td><td class=\"tpg\">หน้า 29", "หน้า 30"),
    ("บทที่ 11</td><td>Watch Alert</td><td class=\"tpg\">หน้า 31", "หน้า 32"),
    ("บทที่ 12</td><td>กระดานข่าว (Board)</td><td class=\"tpg\">หน้า 32", "หน้า 33"),
    ("บทที่ 13</td><td>การตั้งค่าและบัญชี</td><td class=\"tpg\">หน้า 34", "หน้า 35"),
    ("บทที่ 14</td><td>สถานะพิเศษ ข้อผิดพลาด และข้อจำกัด</td><td class=\"tpg\">หน้า 37", "หน้า 38"),
    ("บทที่ 15</td><td>ภาคผนวก: รายงานความครอบคลุมภาพหน้าจอ</td><td class=\"tpg\">หน้า 38", "หน้า 39"),
]
for a, newpg in toc_map:
    assert a in s, f"TOC anchor missing: {a[:60]}"
    s = s.replace(a + "</td>", a.rsplit("หน้า", 1)[0] + newpg + "</td>", 1)

# --- 6. Appendix: file count 170 -> 174 + registry rows ---
s = s.replace("จับภาพหน้าจอจริงรวม <b>170 ไฟล์</b>", "จับภาพหน้าจอจริงรวม <b>174 ไฟล์</b>", 1)
row = '<tr><td class="mono">%s</td><td><span class="ok">ใช้ในคู่มือ</span></td></tr>'
# alphabetical: assets-value-* before 06-edit-profile
anchor06 = '<tr><td class="mono">06-edit-profile.png</td>'
assert anchor06 in s
s = s.replace(anchor06,
    row % "06-assets-value-list.png" + row % "06-assets-value-list2.png"
    + row % "06-assets-value-top.png" + anchor06, 1)
# profile-owner-assets-value after 06-profile-owner.png, before 06-profile-public.png
anchorpo = '<tr><td class="mono">06-profile-public.png</td>'
assert anchorpo in s
s = s.replace(anchorpo, row % "06-profile-owner-assets-value.png" + anchorpo, 1)

open(P, "w", encoding="utf-8").write(s)
print("OK — len:", len(orig), "->", len(s))
