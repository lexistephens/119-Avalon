"""Rename the raw listing downloads and emit the two WebP tiers the site loads.

Run via scripts/fetch-photos.sh, or directly:
    uv run --with pillow python scripts/optimize-photos.py
"""
import os
from PIL import Image, ImageOps

# raw filename stem -> semantic name used throughout index.html
NAMES = {
    "00": "exterior-pool-aerial", "01": "exterior-front",  "02": "aerial-neighborhood",
    "03": "pool-deck",            "04": "entry",           "05": "living-01",
    "06": "living-kitchen",       "07": "living-02",       "08": "living-03",
    "09": "dining",               "10": "kitchen-01",      "11": "kitchen-02",
    "12": "bedroom-01",           "13": "sitting-room",    "14": "primary-bedroom",
    "15": "primary-bath",         "16": "bedroom-02",      "17": "bath-02",
    "18": "bedroom-03",           "19": "bath-03",         "20": "bedroom-04",
    "21": "bath-04",              "22": "bedroom-05",      "23": "bath-05",
    "24": "bunk-room",            "25": "laundry",         "26": "beach-aerial-01",
    "27": "beach-aerial-02",
}

TIERS = [("full", 1280, 72), ("thumb", 680, 68)]

def main():
    done = 0
    for stem, name in sorted(NAMES.items()):
        src = f"assets/photos/raw/{stem}.jpg"
        if not os.path.exists(src):
            print(f"  missing {src}")
            continue
        im = ImageOps.exif_transpose(Image.open(src)).convert("RGB")
        for folder, box, quality in TIERS:
            out = im.copy()
            out.thumbnail((box, box), Image.LANCZOS)
            os.makedirs(f"assets/photos/{folder}", exist_ok=True)
            out.save(f"assets/photos/{folder}/{name}.webp", "WEBP",
                     quality=quality, method=6)
        done += 1
    print(f"  {done} images → assets/photos/full/ and assets/photos/thumb/")

if __name__ == "__main__":
    main()
