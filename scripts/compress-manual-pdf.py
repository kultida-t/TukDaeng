# -*- coding: utf-8 -*-
"""Compress manual PDF by downscaling images only — never touches fonts/content streams.
Usage: python compress-manual-pdf.py <src> <out> <dpi_target> <jpeg_quality>
"""
import io, os, sys
import pymupdf
from PIL import Image

src, out, target, quality = sys.argv[1], sys.argv[2], int(sys.argv[3]), int(sys.argv[4])

doc = pymupdf.open(src)

# single pass: for each xref keep first page + max effective DPI
xrefs = {}
for page in doc:
    for info in page.get_image_info(xrefs=True):
        xref = info['xref']
        if not xref:
            continue
        r = pymupdf.Rect(info['bbox'])
        w = info['width'] / (r.width / 72) if r.width > 0 else 0
        h = info['height'] / (r.height / 72) if r.height > 0 else 0
        e = xrefs.setdefault(xref, {'page': page, 'dpi': 0})
        e['dpi'] = max(e['dpi'], w, h)

# also catch every /Image xref that get_image_info missed (masks, patterns, etc.)
first_page = doc[0]
for x in range(1, doc.xref_length()):
    if doc.xref_get_key(x, 'Subtype')[1] == '/Image' and x not in xrefs:
        xrefs[x] = {'page': first_page, 'dpi': 0}

downscaled = 0
for xref, e in xrefs.items():
    info = doc.extract_image(xref)
    if not info.get('image'):
        continue
    im = Image.open(io.BytesIO(info['image']))
    if im.width < 150:
        continue
    if e['dpi'] > target + 1:
        scale = target / e['dpi']
        im = im.resize((max(1, int(im.width * scale)), max(1, int(im.height * scale))), Image.LANCZOS)
    elif info.get('ext') == 'jpeg':
        continue  # already compressed, right size
    if im.mode != 'RGB':
        im = im.convert('RGB')
    buf = io.BytesIO()
    im.save(buf, 'JPEG', quality=quality)
    e['page'].replace_image(xref, stream=buf.getvalue())
    downscaled += 1
    print(f'  xref {xref}: {info["width"]}x{info["height"]} {info.get("ext")} @ {e["dpi"]:.0f}dpi -> {im.width}x{im.height} jpeg', flush=True)

doc.save(out, garbage=3, deflate=True)
doc.close()
print(f'{out}: {downscaled}/{len(xrefs)} images downscaled -> {os.path.getsize(out)/1e6:.1f} MB')
