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

p.write_text(s, encoding="utf-8")
print("Photo loading fix applied: 25 preloads")
