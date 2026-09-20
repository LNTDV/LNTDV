from pathlib import Path
from PIL import Image, ImageOps

images = Path("images")
images.mkdir(exist_ok=True)

for n in range(1, 26):
    p = images / f"natura-{n:02d}.jpg"
    if not p.exists():
        raise SystemExit(f"Missing image: {p}")
    if p.stat().st_size <= 1000:
        raise SystemExit(f"Image too small: {p}")
    with Image.open(p) as im:
        im.verify()
    with Image.open(p) as im:
        fixed = ImageOps.exif_transpose(im).convert("RGB")
        fixed.save(p, format="JPEG", quality=95, optimize=True, progressive=True)
    if p.stat().st_size <= 1000:
        raise SystemExit(f"Image invalid after normalization: {p}")

print("25 repository JPG OK")
