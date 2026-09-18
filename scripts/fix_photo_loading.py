from pathlib import Path

p = Path("index.html")
s = p.read_text(encoding="utf-8")

# Start every photo asset download as early as possible.
# The assets contain the actual image data, so preloading them avoids
# the browser discovering the 25 requests only after HTML parsing.
preloads = "\n".join(
    f'<link rel="preload" as="script" href="./assets/photo{n:02d}.js?v=20260918">'
    for n in range(1, 26)
)

# Remove an older generated preload block, then insert exactly one current block.
import re
s = re.sub(
    r'\n(?:<link rel="preload" as="script" href="\.\/assets\/photo\d{2}\.js\?v=20260918">\n?){1,25}',
    "\n",
    s
)
marker = '<script async src="./assets/photo01.js?v=20260918"'
if marker in s and 'href="./assets/photo25.js?v=20260918"' not in s:
    s = s.replace(marker, preloads + "\n" + marker, 1)

# Keep all 25 images eager: the layout is already fixed, so there is no
# reason to defer image assignment while the catalog is visible.
s = re.sub(
    r'(<img id="photo-\d{3}"[^>]*?)loading="lazy"',
    r'\1loading="eager"',
    s
)

# Make successful asset assignment decode immediately where supported.
old = '''      img.src=data;
      img.dataset.photoCode="LNTDV-"+id;'''
new = '''      img.src=data;
      img.dataset.photoCode="LNTDV-"+id;
      if (typeof img.decode === "function") img.decode().catch(()=>{});'''
s = s.replace(old, new)

p.write_text(s, encoding="utf-8")
print("Photo loading fix applied:", s.count('href="./assets/photo'), "preloads,", s.count('data-photo="'), "cards")
