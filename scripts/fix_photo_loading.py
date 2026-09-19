from pathlib import Path
import re

p = Path("index.html")
s = p.read_text(encoding="utf-8")

preloads = "\n".join(
    f'<link rel="preload" as="script" href="./assets/photo{n:02d}.js?v=20260918">'
    for n in range(1, 26)
)

# Remove any old generated photo preloads and insert one complete block.
s = re.sub(
    r'\n<link rel="preload" as="script" href="\.\/assets\/photo\d{2}\.js\?v=20260918">',
    '',
    s
)
if "</head>" not in s:
    raise SystemExit("index.html senza </head>")
s = s.replace("</head>", preloads + "\n</head>", 1)

# Never lazy-load the catalog photographs.
s = re.sub(
    r'(<img[^>]*id="photo-\d{3}"[^>]*?)loading="lazy"',
    r'\1loading="eager"',
    s
)

# FINAL ORIENTATION ATTRIBUTES 2026-09-19
orientation_map = {
    "003":"vertical","006":"vertical","007":"vertical","008":"vertical","009":"vertical",
    "011":"vertical","013":"vertical","014":"vertical","015":"vertical","016":"vertical","018":"vertical",
    "001":"horizontal","002":"horizontal","004":"horizontal","005":"horizontal","010":"horizontal",
    "012":"horizontal","017":"horizontal","019":"horizontal","020":"horizontal","021":"horizontal",
    "022":"horizontal","023":"horizontal","024":"horizontal","025":"horizontal",
}
for photo_id, orientation in orientation_map.items():
    s = re.sub(
        rf'(<img\b[^>]*alt="LNTDV-{photo_id}"[^>]*?)(>)',
        lambda m: m.group(1) if 'data-orientation=' in m.group(1) else m.group(1) + f' data-orientation="{orientation}"',
        s,
        count=1,
    )

p.write_text(s, encoding="utf-8")
print("Photo loading fix applied: 25 preloads")
